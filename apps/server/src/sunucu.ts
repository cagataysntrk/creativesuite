// Hono API + SSE (§12.4, §12.5 · D-26 · FAZ-4.2).
//
// **Neden Next.js değil (D-26):** uzun süren alt süreçler (Chromium, ffmpeg), dosya
// izleme ve SSE — App Router'da üçü de zorlama. SEO ihtiyacı yok ve App Router churn'ü
// "bir ay ihmal edilse de çalışır" ilkesine (12. yasa) düşman.
//
// **SSE, WebSocket değil:** akış tek yönlü (sunucu → UI). WebSocket iki yönlü bir kanal
// ve ikinci yön hiç kullanılmayacak; kullanılmayan yön, kimsenin bakmadığı bir güvenlik
// yüzeyidir. SSE ayrıca tarayıcı tarafında kendiliğinden yeniden bağlanır.
//
// **Kalp atışı zorunlu:** UI "bağlantı yok" diyebilmek için sunucunun SUSTUĞUNU
// anlamalı. Yalnız veri gönderirsek, hiçbir şey değişmediğinde sessizlik ile ölüm
// birbirinden ayırt edilemez — ve kalıcı bir gösterge bayat değeri canlı gibi gösterir.

import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { Hono } from 'hono'
import { streamSSE } from 'hono/streaming'
import {
  browseRecords,
  lifecycleMessage,
  pinRecord,
  retireRecord,
  type SelectQuery,
} from '@suite/corpus'
import { RUNS_DIR, fileHistory } from '@suite/kernel'
import type { ToleranceReading } from '@suite/contracts'
import { readManifest } from '@suite/engine'
import { indeksAc, makineDurumu, type MakineDurumu } from './durum.js'
import { izle, type Izleme } from './izle.js'
import { tersIndeks, tersIndeksOzeti } from './ters-indeks.js'
import { baglamOnizle } from './baglam.js'
import { launcherPlani } from './launcher.js'
import { bekleyenler, kararVer } from './kuyruk.js'

export interface SunucuSecenekleri {
  readonly repoRoot: string
  readonly query: SelectQuery
  /** Kalp atışı aralığı. UI bunun ~2,5 katında sessizliği ÖLÜM sayar. */
  readonly kalpAtisiMs: number
  readonly debounceMs: number
  /** Saat dışarıdan verilir — R-06: fiil gövdesinde `Date` yok, sunucuda da tek nokta. */
  readonly simdi: () => string
  /**
   * Alt süreçlere geçecek ortam — **AÇIKÇA verilir** (§14). Sunucu `process.env`e
   * uzanmaz: uzanan bir kütüphane, hangi değişkenin nereye gittiğini denetlenemez
   * yapar ve `git`e tüm ortamı vermek gizli anahtarları alt sürece taşımaktır.
   * En azı `PATH` — onsuz `git` bulunamaz.
   */
  readonly env?: Readonly<Record<string, string>>
  /**
   * Planın dondurulacağı dünya: bilgi ve registry commit'i (§13).
   * Verilmezse `worktree` — ve `inspectManifest` onu KUSURLU sayar (D-155), yani
   * kirli ağaçtan dondurulmuş bir plan yayınlanabilir bir çıktı üretemez.
   */
  readonly corpusCommit?: string
  readonly registryCommit?: string
}

export interface Sunucu {
  readonly app: Hono
  readonly izleme: Izleme
  readonly kapat: () => void
  /** Test için: bir olayı elle tetikle. */
  readonly yayinla: (tip: string) => void
}

export const kurSunucu = (o: SunucuSecenekleri): Sunucu => {
  const db = indeksAc(o.repoRoot)
  const app = new Hono()

  // Abone kümesi. Her SSE bağlantısı bir tetikleyici bırakır ve kapanınca siler;
  // silinmezse ölü bağlantılara yazmaya çalışırız ve sızıntı büyür.
  const aboneler = new Set<(tip: string) => void>()
  const yayinla = (tip: string): void => {
    for (const a of aboneler) a(tip)
  }

  const durumOku = (): MakineDurumu =>
    makineDurumu({ repoRoot: o.repoRoot, db, query: o.query, simdi: o.simdi() })

  const izleme = izle({
    repoRoot: o.repoRoot,
    // Defter yolu düz dize DEĞİL: `RUNS_DIR` tek otoritedir (chokepoints →
    // `manifest-yazici`). İkinci bir literal, defterin yeri değiştiğinde sessizce
    // yanlış dizini izlemek demekti — ve izlenmeyen bir defter, canlı olmayan bir şerit.
    dizinler: ['registry', RUNS_DIR, 'corpus'],
    debounceMs: o.debounceMs,
    uzerineDegisim: () => yayinla('degisim'),
  })

  app.get('/api/saglik', (c) =>
    c.json({
      ok: true,
      // Nabız aralığı İLAN EDİLİR. UI onu kendi içine gömseydi iki gerçek olurdu:
      // sunucu 5 sn'den 30 sn'ye çıktığında UI her nabızda "bağlantı yok" derdi —
      // yani ölçüm aracının kendisi ölçümü bozardı.
      nabizAraligiMs: o.kalpAtisiMs,
      izlenen: izleme.izlenen,
      indeks: db !== null,
      simdi: o.simdi(),
    })
  )

  app.get('/api/durum', (c) => c.json(durumOku()))

  // ── marka token'ları ÇALIŞMA ANINDA servis edilir ─────────────────────────
  //
  // UI bunları statik import EDEMEZ: hangi markanın renkleri geçerliyse o gelmeli
  // (D-39 — marka bir çalıştırma parametresidir, dosyadan okunan global durum değil).
  // Statik import tek markayı derlemeye gömer ve `dima`ya geçmek yeniden build ister.
  //
  // Dosya ÜRETİLMİŞTİR (R-65) ve burada yalnız okunur. Yoksa 404: boş bir CSS dönmek,
  // `--role-bg` tanımsızken sayfayı sessizce şeffaf bırakmak olurdu.
  app.get('/api/tokens.css', (c) => {
    const yol = join(o.repoRoot, `brand/${o.query.brandId}/derived-tokens/tokens.css`)
    if (!existsSync(yol)) {
      return c.text(`/* ${o.query.brandId} için token üretilmemiş — 'just tokens' */`, 404, {
        'content-type': 'text/css; charset=utf-8',
      })
    }
    return c.text(readFileSync(yol, 'utf8'), 200, { 'content-type': 'text/css; charset=utf-8' })
  })

  // ── corpus tarayıcısı (§12.9 · FAZ-4.3) ───────────────────────────────────
  //
  // **Bu uç retrieval DEĞİL.** `browseRecords` taslakları ve emeklileri DE döndürür —
  // tarayıcının tüm işi budur (D-12). Bağlam derleyen hiçbir yol buradan geçmez;
  // görünürlük her satırda `visible` bayrağı olarak GÖSTERİLİR, gizlenmez.
  app.get('/api/kayitlar', (c) => {
    if (db === null) {
      // İndeks yoksa BOŞ LİSTE dönmüyoruz: boş bir tablo "corpus boş" okunur ve
      // operatör kayıtlarının silindiğini sanır. `just reindex` demek gerekiyor.
      return c.json({ hata: 'indeks yok — `just reindex` çalıştır', kayitlar: [] }, 503)
    }
    const tip = c.req.query('tip') ?? ''
    const durum = c.req.query('durum') ?? ''
    return c.json({
      kayitlar: browseRecords(db, {
        brandId: o.query.brandId,
        eraId: o.query.eraId,
        asOf: o.query.asOf,
        type: tip,
        status: durum,
      }),
    })
  })

  // ── QA okumaları: bir çalıştırmanın tolerans raporu (§11.1 · FAZ-4.8) ─────
  //
  // Manifest'ten okunur, YENİDEN ÖLÇÜLMEZ: yeniden ölçmek Chromium açmak demek ve
  // o zaman ekranda gördüğünüz, çalıştırmanın ölçtüğü şey olmazdı (§13: manifest bir
  // çalıştırmanın TEK kanıtıdır).
  app.get('/api/calistirma/:runId/qa', (c) => {
    const m = readManifest(o.repoRoot, c.req.param('runId') as never)
    if (m === null) return c.json({ ok: false, hata: 'çalıştırma yok' }, 404)

    const okumalar = m.steps.flatMap((s) => {
      const r = (s.output as { qaReadings?: unknown } | null | undefined)?.qaReadings
      return Array.isArray(r) ? (r as ToleranceReading[]) : []
    })

    // Boş liste "her şey yolunda" DEĞİLDİR: QA hiç koşmamış olabilir. Ayrımı bileşen
    // yapabilsin diye `olculdu` bayrağı ayrı gidiyor.
    return c.json({
      ok: true,
      olculdu: okumalar.length > 0,
      readings: okumalar,
      blocked: okumalar.some((r) => r.status === 'out'),
      warnings: okumalar.filter((r) => r.status === 'warn').length,
    })
  })

  // ── onay kuyruğu (§12.5, §12.9 · R-14 · FAZ-4.7) ──────────────────────────
  app.get('/api/kuyruk', (c) => c.json({ bekleyenler: bekleyenler(o.repoRoot) }))

  app.post('/api/kuyruk/:runId/:gate', async (c) => {
    const govde = (await c.req.json().catch(() => ({}))) as {
      karar?: string
      gerekce?: string
    }
    const karar = govde.karar === 'rejected' ? 'rejected' : 'approved'
    const r = kararVer({
      repoRoot: o.repoRoot,
      runId: c.req.param('runId'),
      gate: c.req.param('gate'),
      karar,
      gerekce: govde.gerekce ?? '',
      at: o.simdi(),
    })
    yayinla('degisim')
    return c.json(r, r.ok ? 200 : 409)
  })

  // ── run launcher: planı kur, DONDUR, kilidi hesapla (§8.3 · FAZ-4.6b) ─────
  //
  // GET ve hiçbir şey harcamaz (R-47): `plan()` kuru ikizleri çağırır. Dondurma da
  // yan etkisiz — donmuş plan yalnız cevapta döner; onaylanan plan çalıştırma anında
  // motora GERİ VERİLİR (`runPipeline({ frozen })`).
  app.get('/api/plan', (c) => {
    const tavanMikros = c.req.query('tavan_mikros')
    const r = launcherPlani({
      repoRoot: o.repoRoot,
      pipelineId: c.req.query('pipeline') ?? '',
      runId: (c.req.query('run') ?? 'run_onizleme') as never,
      brandId: o.query.brandId as never,
      eraId: o.query.eraId as never,
      corpusCommit: o.corpusCommit ?? 'worktree',
      registryCommit: o.registryCommit ?? 'worktree',
      frozenAt: o.simdi(),
      recordIds: [],
      cap:
        tavanMikros === undefined || tavanMikros === ''
          ? null
          : { micros: BigInt(tavanMikros), currency: 'USD' },
      env: o.env ?? {},
    })
    // `bigint` JSON'a girmez (D-119): para alanları dize olarak yayılır.
    return c.json(
      JSON.parse(JSON.stringify(r, (_k, v) => (typeof v === 'bigint' ? v.toString() : v))),
      r.ok ? 200 : 404
    )
  })

  // ── ters indeks: bu kaydı hangi çalıştırma kullandı (§12.9 · FAZ-4.4) ─────
  app.get('/api/kayitlar/:id/etki', (c) => {
    const s = tersIndeks(o.repoRoot, c.req.param('id'))
    return c.json({ ...s, ozet: tersIndeksOzeti(s) })
  })

  // ── bağlam önizleme (§5.3, §12.9 · FAZ-4.5) ───────────────────────────────
  //
  // `haric` çoklu sorgu parametresi: `?tarif=instagram-post&haric=rec_a&haric=rec_b`.
  // GET seçildi çünkü bu uç hiçbir şey DEĞİŞTİRMEZ ve harcamaz (R-47) — önizlemenin
  // yan etkisi olsaydı "çalıştırmadan önce bak" vaadi çökerdi.
  app.get('/api/baglam', (c) => {
    if (db === null) return c.json({ ok: false, hata: 'indeks yok — `just reindex`' }, 503)
    const r = baglamOnizle({
      db,
      recipesDir: join(o.repoRoot, 'registry/recipes'),
      recipeId: c.req.query('tarif') ?? '',
      query: o.query,
      excluded: c.req.queries('haric') ?? [],
    })
    return c.json(r, r.ok ? 200 : 404)
  })

  // ── git zaman çizgisi (§12.9 · FAZ-4.4) ───────────────────────────────────
  //
  // Bir kaydın geçmişi ayrı bir yerde TUTULMAZ: git zaten tutuyor. İkinci bir
  // değişiklik günlüğü, git ile ayrışabilen bir gerçek olurdu (12. yasa: kurtarma
  // `git clone` + `cat`).
  app.get('/api/kayitlar/:tip/:slug/gecmis', async (c) => {
    const yol = `corpus/${c.req.param('tip')}/${c.req.param('slug')}.md`
    const r = await fileHistory(yol, { cwd: o.repoRoot, env: o.env ?? {} })
    return r.ok
      ? c.json({ yol, commitler: r.value })
      : c.json({ yol, commitler: [], hata: 'git geçmişi okunamadı' }, 500)
  })

  // ── yaşam döngüsü: emeklilik ve sabitleme ─────────────────────────────────
  //
  // **SİLME UCU YOKTUR.** Bilerek: `DELETE /api/kayitlar/:id` yazmak, R-12'yi bir
  // konvansiyona indirger. Emeklilik bir yazma işlemidir ve `write.ts`ten geçer.
  app.post('/api/kayitlar/:tip/:slug/emekli', async (c) => {
    const govde = (await c.req.json().catch(() => ({}))) as { supersededBy?: string }
    const r = retireRecord({
      root: join(o.repoRoot, 'corpus'),
      entityType: c.req.param('tip'),
      slug: c.req.param('slug'),
      at: o.simdi(),
      supersededBy: govde.supersededBy ?? null,
    })
    yayinla('degisim')
    return r.ok
      ? c.json({ ok: true, path: r.path })
      : c.json({ ok: false, mesaj: lifecycleMessage(r.refusal) }, 409)
  })

  app.post('/api/kayitlar/:tip/:slug/sabitle', async (c) => {
    const govde = (await c.req.json().catch(() => ({}))) as { pinned?: boolean }
    const r = pinRecord({
      root: join(o.repoRoot, 'corpus'),
      entityType: c.req.param('tip'),
      slug: c.req.param('slug'),
      pinned: govde.pinned === true,
    })
    yayinla('degisim')
    return r.ok
      ? c.json({ ok: true, path: r.path })
      : c.json({ ok: false, mesaj: lifecycleMessage(r.refusal) }, 409)
  })

  // ── SSE ────────────────────────────────────────────────────────────────────
  // İlk mesaj ANINDA gider: UI'ın ilk kalp atışını beklemesi, açılışta boş bir şerit
  // demektir ve boş bir enstrüman "sıfır" okunur.
  app.get('/api/olay', (c) =>
    streamSSE(c, async (stream) => {
      let acik = true
      // ⚠ `false` başlar. `true` başlasaydı ilk durum mesajından hemen sonra AYNI durum
      // ikinci kez giderdi — UI iki "yeni ölçüm" görür, şerit iki kez yanıp söner ve
      // hiçbir şey değişmediği hâlde bir şey olmuş gibi görünür (§12.7: süs hareket,
      // gerçek bir şey olduğunda kimsenin bakmamasına yol açar).
      let bekleyen = false

      const tetikle = (): void => {
        bekleyen = true
      }
      aboneler.add(tetikle)
      stream.onAbort(() => {
        acik = false
        aboneler.delete(tetikle)
      })

      await stream.writeSSE({ event: 'durum', data: JSON.stringify(durumOku()) })

      while (acik) {
        await stream.sleep(o.kalpAtisiMs)
        if (!acik) break
        if (bekleyen) {
          bekleyen = false
          await stream.writeSSE({ event: 'durum', data: JSON.stringify(durumOku()) })
        } else {
          // Kalp atışı VERİ TAŞIMAZ. Taşısaydı UI onu "yeni ölçüm" sanardı ve
          // hiçbir şey değişmediğinde de şerit güncellenmiş gibi görünürdü.
          await stream.writeSSE({ event: 'nabiz', data: o.simdi() })
        }
      }
    })
  )

  return {
    app,
    izleme,
    yayinla,
    kapat: () => {
      izleme.kapat()
      aboneler.clear()
      db?.close()
    },
  }
}
