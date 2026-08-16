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
import { RUNS_DIR, discoveryPlanPath, fileHistory } from '@suite/kernel'
import type { DiscoveryOpView, HaltedRecord, ToleranceReading } from '@suite/contracts'
import {
  COLUMN_LABELS,
  byColumn,
  doktorRaporu,
  performansPanosu,
  readInsights,
  readLedger,
  readManifest,
} from '@suite/engine'
import { PLACEMENTS, safeBand, specAgeDays } from '@suite/render'
import { indeksAc, makineDurumu, type MakineDurumu } from './durum.js'
import { izle, type Izleme } from './izle.js'
import { tersIndeks, tersIndeksOzeti } from './ters-indeks.js'
import { baglamOnizle } from './baglam.js'
import { dunyaDurumu, launcherPlani } from './launcher.js'
import { kanalPanosu } from './kanal-uc.js'
import { bekleyenler, kararVer } from './kuyruk.js'
import { kuruCalistir, semaListesi } from './sema.js'
import { butcePanosu, tavanYaz } from './butce-uc.js'
import { YARDIM, parseCallback, parseKomut } from './telegram.js'
import { kutuphane, yenidenKullanilabilir } from './kutuphane.js'
import { calistirmaDetayi, calistirmalar } from './gecmis.js'
import { aktifEra, stratejiPanosu } from './strateji-uc.js'
import { calistirmaBaslat, tekrarBaslat } from './calistir.js'

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

  // ── varlık kütüphanesi (§12.9, §3.5 · FAZ-4.14) ───────────────────────────
  //
  // Filtre sunucuda DEĞİL istemcide: liste zaten tam geliyor ve "premium ama
  // yayınlanmamış" bir SORU, bir sorgu parametresi değil — operatör onu açıp kapatarak
  // karşılaştırma yapar. Sunucuda filtrelemek, toplam harcamayı da filtrelerdi.
  app.get('/api/varliklar', (c) => c.json(kutuphane(o.repoRoot)))

  // ── doctor: bir ay ihmalden sonra açılacak İLK ekran (§13, §16 · FAZ-4.17) ─
  //
  // `just doctor` ile AYNI fonksiyonu çağırır. Rapor eder, hiçbir şeyi değiştirmez —
  // uç GET ve gövdesiz; POST olsaydı "düzelt" düğmesi bir gün eklenirdi.
  app.get('/api/doktor', (c) => {
    const era = aktifEra(o.repoRoot, o.query.brandId)
    return c.json(
      doktorRaporu({
        repoRoot: o.repoRoot,
        bugun: o.simdi().slice(0, 10),
        aktifEra: era,
        db,
        // Git olguları sunucuda toplanmıyor: `git-cagiran` darboğazı tek dosyaya kilitli
        // ve bu uç alt süreç başlatmamalı. Denetim ATLANIR ve rapor bunu SÖYLER.
        git: null,
      })
    )
  })

  // ── strateji sağlığı: aktif dönemin lint panosu (§11, §12.9 · FAZ-4.16) ──
  //
  // Kurallar burada değil `@suite/engine`de; `just gate lexicon` AYNI fonksiyonu
  // çağırıyor. İki kopya olsaydı pano "temiz" derken kapı kırmızı olabilirdi.
  app.get('/api/strateji-sagligi', (c) => {
    const r = stratejiPanosu(o.repoRoot, o.query.brandId, o.simdi())
    return c.json(r, r.ok ? 200 : 422)
  })

  // ── çalıştırma geçmişi / köken tarayıcısı (§13, §12.9 · FAZ-4.15) ─────────
  //
  // Liste ucu donmuş planın VARLIĞINI de bildirir: `rerun` düğmesinin etkin olup
  // olmayacağı diskteki bir dosyaya bağlı ve UI bunu tahmin etmemeli.
  app.get('/api/calistirmalar', (c) => c.json({ calistirmalar: calistirmalar(o.repoRoot) }))

  // Detay: zaman çizgisi + rerun/replay karşılaştırması. Dünya durumu BURADA kurulur —
  // kurulamazsa `null` geçer ve ekran "sapma ölçülmedi" der, "sapma yok" demez (D-175).
  app.get('/api/calistirmalar/:runId', (c) => {
    let dunya = null
    try {
      dunya = dunyaDurumu(o.repoRoot, o.corpusCommit ?? 'worktree', o.registryCommit ?? 'worktree')
    } catch {
      // Tanımlayıcılar okunamadı: sapma ölçülemez ve bu AÇIKÇA söylenir.
    }
    const d = calistirmaDetayi(o.repoRoot, c.req.param('runId'), dunya)
    if (d === null) {
      return c.json({ ok: false, hata: `çalıştırma manifesti yok: ${c.req.param('runId')}` }, 404)
    }
    return c.json(d)
  })

  // Reuse: varlığı DEĞİL, onu üreten çalıştırmayı açar — kopyalanacak olan bayt değil,
  // KARARDIR (donmuş girdiler, konu, bağlam).
  app.get('/api/varliklar/:runId/yeniden-kullan', (c) => {
    const runId = c.req.param('runId')
    if (!yenidenKullanilabilir(o.repoRoot, runId)) {
      // Manifest yoksa Reuse YAPILAMAZ ve bu sessiz kalmaz: "kopyalandı" deyip boş bir
      // form açmak, kullanıcının donmuş girdileri elle yeniden yazması demekti.
      return c.json({ ok: false, hata: `çalıştırma manifesti yok: ${runId}` }, 404)
    }
    const m = readManifest(o.repoRoot, runId as never)
    if (m === null) return c.json({ ok: false, hata: 'manifest okunamadı' }, 422)
    return c.json({
      ok: true,
      pipeline: m.pipeline,
      brandId: m.brandId,
      eraId: m.eraId,
      // Donmuş girdiler: aynı kararla yeniden koşmak için gereken her şey.
      params: m.steps.map((s) => s.params).find((p) => Object.keys(p).length > 0) ?? {},
      context: m.context,
      corpusCommit: m.corpusCommit,
    })
  })

  // ── Telegram botu: YÜZEY SINIRI (§4c, §9.4 · D-19 · FAZ-4.13) ─────────────
  //
  // Webhook ucu. Bot yalnız onay/red/gerekçe işler; yasak komutlar GEREKÇESİYLE geri
  // çevrilir — sessizce yok saymak, "belki ileride" demenin sessiz hâli olurdu.
  //
  // ⚠ Uç, token gerçek olmasa da AÇIKTIR: yüzey sınırı token'a bağlı bir davranış
  // değil, bir sözleşme. Test ve kapı onu token olmadan da doğrulayabilmeli.
  app.post('/api/telegram/webhook', async (c) => {
    const govde = (await c.req.json().catch(() => null)) as {
      message?: { text?: string }
      callback_query?: { data?: string }
    } | null
    if (govde === null) return c.json({ ok: false, hata: 'geçersiz JSON' }, 400)

    // Inline klavye basımı: `onay|<run_id>|<gate>`.
    const cb = govde.callback_query?.data
    if (typeof cb === 'string') {
      const p = parseCallback(cb)
      if (p === null) return c.json({ ok: false, hata: 'bozuk callback' }, 400)
      // Red inline klavyeden GEREKÇESİZ gelir — bot gerekçe İSTER, karar yazmaz.
      if (p.eylem === 'red') {
        return c.json({ ok: true, cevap: `/reddet ${p.runId} ${p.gate} <gerekçe>` })
      }
      const r = kararVer({
        repoRoot: o.repoRoot,
        runId: p.runId,
        gate: p.gate,
        karar: 'approved',
        gerekce: '',
        at: o.simdi(),
      })
      yayinla('degisim')
      return c.json(r, r.ok ? 200 : 409)
    }

    const komut = parseKomut(govde.message?.text ?? '')
    switch (komut.kind) {
      case 'yasak':
        // 403: komut TANINIYOR ama bu yüzeyde yok. 404 olsaydı "böyle bir komut yok"
        // derdi ve kullanıcı başka yazımlar denerdi.
        return c.json({ ok: false, komut: komut.komut, neden: komut.neden }, 403)
      case 'kuyruk':
        return c.json({ ok: true, bekleyenler: bekleyenler(o.repoRoot) })
      case 'yardim':
        return c.json({ ok: true, cevap: YARDIM })
      case 'onayla':
      case 'reddet': {
        const r = kararVer({
          repoRoot: o.repoRoot,
          runId: komut.runId,
          gate: komut.gate,
          karar: komut.kind === 'onayla' ? 'approved' : 'rejected',
          gerekce: komut.kind === 'reddet' ? komut.gerekce : '',
          at: o.simdi(),
        })
        yayinla('degisim')
        return c.json(r, r.ok ? 200 : 409)
      }
      case 'bilinmeyen':
        return c.json({ ok: false, cevap: YARDIM }, 400)
    }
  })

  // ── maliyet ve bütçe (§8.3, §12.9 · D-17 · FAZ-4.12) ──────────────────────
  app.get('/api/butce', (c) => c.json(butcePanosu(o.repoRoot)))

  app.put('/api/butce', async (c) => {
    const govde = (await c.req.json().catch(() => null)) as {
      perRunMicros?: string | null
      perMonthMicros?: string | null
    } | null
    if (govde === null) return c.json({ ok: false, hata: 'geçersiz JSON' }, 400)
    let r
    try {
      r = tavanYaz(o.repoRoot, govde, o.simdi())
    } catch {
      // `BigInt('abc')` fırlatır — sayı olmayan bir tavan 500 değil 400'dür.
      return c.json({ ok: false, hata: 'tavan tam sayı (USD mikro) ya da null olmalı' }, 400)
    }
    yayinla('degisim')
    return c.json(r, r.ok ? 200 : 422)
  })

  // ── şema editörü: KURU ÇALIŞTIRMA (§3.3, §12.9 · FAZ-4.11) ────────────────
  //
  // **Yazma ucu YOK.** Şema `registry/entity-types/`de yaşar ve oraya yazmak insanın
  // git commit'idir (R-14). Bu uç yalnız "kaydedersem ne olur" sorusunu cevaplar;
  // cevabı görüp commit etmek kullanıcının işi.
  app.get('/api/semalar', (c) => c.json({ semalar: semaListesi(o.repoRoot) }))

  app.post('/api/semalar/:tip/kuru', async (c) => {
    const onerilen = await c.req.json().catch(() => null)
    if (onerilen === null) return c.json({ ok: false, hata: 'geçersiz JSON' }, 400)
    const r = kuruCalistir(o.repoRoot, c.req.param('tip'), onerilen)
    if (!r.ok) return c.json(r, 422) // şema profil dışı — analiz hiç yapılamadı

    // ⚠ `ok: true` "analiz koştu" demek, "değişiklik güvenli" DEĞİL. İlk sürüm ikisini
    // karıştırıp reddedilen bir göçe 200 dönüyordu: durum koduna bakan bir istemci
    // yıkıcı bir değişikliği başarılı sanardı (D-178).
    return c.json(r, r.impact.safe ? 200 : 409)
  })

  // ── keşif planı: Reconciliation (§4.4, §12.9 · FAZ-4.10) ──────────────────
  //
  // **Kaydedilmiş bir planı OKUR, yeni plan kurmaz.** Plan kurmak keşif çalıştırması
  // demek ve o `just discovery plan` ile insanın başlattığı bir iştir (R-14) —
  // bir ekranın sayfa yenilemesiyle tetiklenmez.
  app.get('/api/discovery', (c) => {
    // Yol düz dize DEĞİL: `runDir` tek otoritedir (chokepoints → `manifest-yazici`).
    // İkinci bir literal, defterin yeri değiştiğinde ekranın olmayan bir dosyayı
    // aramasıydı — ve "plan yok" ile "plan başka yerde" ayırt edilemezdi.
    // Dosya adı da kernel'den: `'plan.json'` literali burada ikinci bir otoriteydi
    // ve donmuş planla aynı adı taşıyordu (2026-08-16 denetimi).
    const yol = join(o.repoRoot, discoveryPlanPath(c.req.query('run') ?? ''))
    if (!existsSync(yol)) {
      // Boş plan DÖNMÜYORUZ: boş bir dört sütun "değişiklik yok" okunur, oysa plan
      // hiç koşmamış olabilir — ikisi zıt sonuçlar (§4.4).
      return c.json({ ok: false, hata: 'plan yok — `just discovery plan --kaydet <yol>`' }, 404)
    }
    try {
      const plan = JSON.parse(readFileSync(yol, 'utf8')) as {
        ops: DiscoveryOpView[]
        halted?: HaltedRecord[]
      }
      const sutunlar = byColumn(plan.ops as never)
      return c.json({
        ok: true,
        halted: plan.halted ?? [],
        etiketler: COLUMN_LABELS,
        sutunlar,
      })
    } catch {
      return c.json({ ok: false, hata: 'plan okunamadı (bozuk JSON)' }, 422)
    }
  })

  // ── platform yerleşimleri (§9.1 · FAZ-4.9) ────────────────────────────────
  //
  // Spec KOD OLARAK tutulur (`render`), ekrana API'den gelir: tarayıcı halkası
  // `render`ı import edemez (Playwright çeker) ve ikinci bir kopya tutmak, spec
  // güncellendiğinde ekranın eski ölçüyle çizmesi demekti (D-176).
  app.get('/api/yerlesimler', (c) =>
    c.json({
      yerlesimler: PLACEMENTS.map((p) => ({
        ...p,
        band: safeBand(p),
        // Spec YAŞI da gidiyor: üç aylık drift denetimi (§9.1) ekranda da görünmeli,
        // yoksa operatör bayat bir ölçüye göre yargı verir.
        yasGun: specAgeDays(p, o.simdi().slice(0, 10)),
      })),
    })
  )

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

  // ── kanal durumu: token ömrü · oran bütçesi · sürüm sabiti (§9.4 · FAZ-7.7) ─
  //
  // Limiter GEÇİLMİYOR ve bu bilinçli: kovalar çalıştırma sürecinde yaşıyor. Burada
  // yeni bir limiter kurup sormak her seferinde "kova dolu" derdi — sağlayıcı 429
  // dönerken ekranda yeşil bir çubuk. Uç `kalan: null` döner, ekran "ölçülmedi" der.
  app.get('/api/kanallar', (c) => c.json(kanalPanosu({ repoRoot: o.repoRoot, simdi: o.simdi() })))

  // ── performans panosu (§13, §11.2 · FAZ-7.9) ──────────────────────────────
  //
  // **GET ve yazmıyor.** Geri besleme önerisi bu uçtan geçmez: corpus'a yazan tek
  // yol `corpus.propose()` ve onu İNSAN tetikler (R-14). Panoya bir "corpus'a yaz"
  // düğmesi koymak, onayı bir tıklamaya indirmek olurdu.
  app.get('/api/performans', (c) => {
    const yayinlar = readLedger(o.repoRoot)
    if (!yayinlar.ok) return c.json({ hata: yayinlar.error }, 422)
    const olcumler = readInsights(o.repoRoot)
    return c.json({
      pano: performansPanosu({
        yayinlar: yayinlar.entries,
        olcumler: olcumler.ok ? olcumler.satirlar : [],
        bugun: o.simdi().slice(0, 10),
        metrik: c.req.query('metrik') ?? 'reach',
      }),
      // Ölçüm defteri okunamadıysa pano "hepsi eksik ölçüm" der; SEBEBİNİ de
      // söylemezse operatör onu içerik sorunu sanar.
      olcumHatasi: olcumler.ok ? null : olcumler.error,
    })
  })

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

  // ── çalıştırmayı BAŞLAT (§4c · R-07 · FAZ-4.6b) ───────────────────────────
  //
  // POST çünkü DURUM DEĞİŞTİRİR ve para harcayabilir — GET olsaydı bir sayfa
  // yenilemesi çalıştırma başlatırdı. `/api/plan` GET ve hiçbir şey harcamıyor;
  // ayrım kasıtlı.
  app.post('/api/calistir', async (c) => {
    const govde = (await c.req.json().catch(() => ({}))) as {
      pipeline?: string
      konu?: string
      planDigest?: string
    }
    const r = calistirmaBaslat({
      repoRoot: o.repoRoot,
      pipelineId: govde.pipeline ?? '',
      konu: govde.konu ?? '',
      planDigest: govde.planDigest ?? '',
      env: o.env ?? {},
    })
    if (r.ok) yayinla('degisim')
    // 202: kabul edildi ama BİTMEDİ. 200 dönmek "çalıştırma tamam" okunurdu.
    return c.json(r, r.ok ? 202 : 400)
  })

  // rerun / replay — AYRI uçlar çünkü AYRI eylemler (FAZ-4.15).
  // `rerun` donmuş plan yoksa CLI tarafından REDDEDİLİR; ekran zaten düğmeyi kilitli
  // gösteriyor ama sunucu buna güvenmiyor: istemcinin kilidi bir güvenlik sınırı değil.
  app.post('/api/calistirmalar/:runId/:kind', (c) => {
    const kind = c.req.param('kind')
    if (kind !== 'rerun' && kind !== 'replay') {
      return c.json({ ok: false, hata: `bilinmeyen eylem: ${kind}` }, 404)
    }
    const kaynak = c.req.param('runId')
    const m = readManifest(o.repoRoot, kaynak as never)
    if (m === null) return c.json({ ok: false, hata: `çalıştırma manifesti yok: ${kaynak}` }, 404)
    const r = tekrarBaslat({
      repoRoot: o.repoRoot,
      pipelineId: m.pipeline,
      kaynakRunId: kaynak,
      kind,
      env: o.env ?? {},
    })
    if (r.ok) yayinla('degisim')
    return c.json(r, r.ok ? 202 : 400)
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
