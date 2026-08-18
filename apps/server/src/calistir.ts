// Çalıştırma başlatma ucu (§4c, §12.9 · R-07 · FAZ-4.6b).
//
// **Zincirin eksik son halkasıydı.** Run Launcher ekranı planı gösteriyor, maliyet
// aralığını basıyor, kilidi hesaplıyordu — ama "Başlat" düğmesinin `onClick`i yoktu ve
// sunucuda çalıştırma başlatan hiçbir uç yoktu. FAZ 4'ün çıkış kriteri
// *"⌘K → pipeline seç → çalıştır → onayla, fareye hiç dokunmadan"* diyordu ve zincir
// "çalıştır" adımında kopuyordu (2026-08-16 denetimi).
//
// **İKİNCİ bir üretim yolu AÇILMADI.** Sunucu `runPipeline`ı kendi içinde çağırmıyor;
// `just uret`i başlatıyor — üretimin zaten tek yolu o. İçeride çağırsaydık iki üretim
// yolu olurdu: biri planı donduran, diğeri belki dondurmayan; hangisinin koştuğu
// manifestten anlaşılmazdı (D-185 ailesi).
//
// **Digest ZORUNLU.** Onay bir ÖZETE verilir (R-07). Özetsiz başlatma, "ekranda ne
// gördüysem onu onayladım" iddiasını ispatlanamaz yapar; CLI özeti karşılaştırır ve
// dünya değiştiyse durur.

import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { spawnProcess, newId, RUNS_DIR } from '@suite/kernel'
import type { RunId } from '@suite/contracts'

/**
 * Başlatma başarısızlığını **deftere yazar** (§13 · Yasa 11).
 *
 * ⚠ ⚠ **BU YOKTU ve panel yalan söylüyordu.** `spawnProcess` reddetmez, SONUÇ döner
 * (§8.6) — kod ise yalnız `.catch()` bağlayıp sonucu çöpe atıyordu. Yorum "âkıbet
 * manifeste yazılır" diyordu ama manifest ancak süreç YAŞARSA yazılıyor: `just uret`
 * ilk satırda ölünce `derived/runs` altında hiçbir dizin açılmıyor, ekranda
 * "başlatıldı: run_…" kalıyordu. Gerçek koşuda tam bu oldu: ortamda `HOME` yoktu.
 *
 * Dizin YİNE `derived/runs` altında: başarısız bir başlatma da bir olaydır ve
 * defterden silinmez. `doctor` "manifestsiz dizin" derken artık sebebi de okuyabilir.
 */
const baslatmaHatasiniYaz = (
  repoRoot: string,
  runId: string,
  kayit: Readonly<Record<string, unknown>>
): void => {
  try {
    const dizin = join(repoRoot, RUNS_DIR, runId)
    mkdirSync(dizin, { recursive: true })
    writeFileSync(join(dizin, 'baslatilamadi.json'), `${JSON.stringify(kayit, null, 2)}\n`, 'utf8')
  } catch {
    // Deftere yazamıyorsak yapılacak bir şey yok; süreç zaten ölmüş. Sessiz kalan
    // tek şey dosya sistemi hatası — başlatma hatasının kendisi değil.
  }
}

/** Alt süreç sonucunu izler; yalnız BAŞARISIZLIK deftere düşer. */
const akibetiIzle = (
  repoRoot: string,
  runId: string,
  komut: readonly string[],
  p: ReturnType<typeof spawnProcess>
): void => {
  void p.then((r) => {
    if (r.code === 0 && !r.timedOut && !r.aborted) return
    baslatmaHatasiniYaz(repoRoot, runId, {
      komut: komut.join(' '),
      code: r.code,
      signal: r.signal,
      timedOut: r.timedOut,
      aborted: r.aborted,
      // Kuyruk: hata SON satırlardadır ve tamamı deftere gerekmiyor.
      stderr: r.stderr.slice(-4000),
      stdout: r.stdout.slice(-2000),
    })
  })
}

export type BaslatSonuc =
  { readonly ok: true; readonly runId: string } | { readonly ok: false; readonly hata: string }

export interface BaslatGirdisi {
  readonly repoRoot: string
  readonly pipelineId: string
  readonly konu: string
  /** Ekranda gösterilen donmuş planın özeti — onay buna verildi. */
  readonly planDigest: string
  readonly env: Readonly<Record<string, string>>
  /** Test bunu değiştirir; üretimde gerçekten `just` koşar. */
  readonly komut?: string
}

/**
 * Çalıştırmayı başlatır ve **beklemez**.
 *
 * Bir çalıştırma dakikalar sürüyor; HTTP isteğini o kadar açık tutmak, tarayıcı
 * zaman aşımını "çalıştırma başarısız" gibi gösterirdi. Kimlik ÖNCEDEN üretilip
 * döndürülüyor — kullanıcı çalıştırmayı o kimlikle izliyor (SSE + `/api/calistirmalar`).
 */
export const calistirmaBaslat = (g: BaslatGirdisi): BaslatSonuc => {
  if (g.pipelineId.trim() === '') return { ok: false, hata: 'pipeline seçilmedi' }
  if (g.konu.trim() === '') return { ok: false, hata: 'konu boş — hat neyi üreteceğini bilemez' }
  if (g.planDigest.trim() === '') {
    return {
      ok: false,
      hata: 'plan özeti yok — onay bir ÖZETE verilir (R-07); önce `/api/plan` ile planı dondurun',
    }
  }
  // Kabuk enjeksiyonu yok: argümanlar DİZİ olarak geçiyor, kabuk yorumlaması hiç yok.
  const runId = newId('RunId') as RunId

  const argv = ['uret', g.pipelineId, g.konu, '--run', runId, '--plan-digest', g.planDigest]
  akibetiIzle(
    g.repoRoot,
    runId,
    [g.komut ?? 'just', ...argv],
    spawnProcess(g.komut ?? 'just', argv, {
      cwd: g.repoRoot,
      env: g.env,
      maxOutputBytes: 1_000_000,
    })
  )

  return { ok: true, runId }
}

/**
 * Duraklamış bir çalıştırmayı SÜRDÜRÜR — kapı kararı yazıldıktan sonra.
 *
 * ⚠ ⚠ **BU EKSİKTİ VE AKIŞI KIRIYORDU.** Panelde "onayla" kararı deftere yazıyor ve
 * ORADA bitiyordu: düğmeler yerinde kalıyor, hiçbir şey değişmiyor, hat ilerlemiyordu.
 * Kullanıcı onayladığını sanıp bekliyordu. Bir onay düğmesi, onayın SONUCUNU
 * doğurmuyorsa düğme değil bir yanılsamadır.
 *
 * ⚠ Yasa 2 ihlali DEĞİL: kapıyı açan şey insanın tıklaması. "Agent önerir, insan
 * uygular" kuralı, insan uyguladıktan sonra hattın durmasını gerektirmiyor — kapının
 * amacı insanın GÖRMESİydi ve gördü.
 *
 * ⚠ Konu argümanı YOK: `--devam` konuyu donmuş plandan okuyor. Yeniden yazdırmak bir
 * harf farkıyla `idempotencyKey`i değiştirir ve sürdürme, sürdürme olmaktan çıkardı.
 */
export const calistirmaSurdur = (g: {
  readonly repoRoot: string
  readonly pipelineId: string
  readonly runId: string
  readonly env?: Readonly<Record<string, string>>
  readonly komut?: string
}): BaslatSonuc => {
  if (g.pipelineId.trim() === '') return { ok: false, hata: 'pipeline seçilmedi' }
  if (g.runId.trim() === '') return { ok: false, hata: 'çalıştırma id yok' }
  const argv = ['uret', g.pipelineId, '--devam', g.runId]
  akibetiIzle(
    g.repoRoot,
    g.runId,
    [g.komut ?? 'just', ...argv],
    spawnProcess(g.komut ?? 'just', argv, {
      cwd: g.repoRoot,
      ...(g.env === undefined ? {} : { env: g.env }),
      maxOutputBytes: 1_000_000,
    })
  )
  return { ok: true, runId: g.runId as RunId }
}

/**
 * `rerun` / `replay` — **AYRI eylemler** (§13 · FAZ-4.15).
 *
 * `rerun` donmuş planı diskten okuyup aynen koşar: kararı tekrarlar. `replay` bugünün
 * tanımıyla yeniden planlar. Tek bir "tekrar" ucu açmak, ekrandaki iki düğmeyi
 * kozmetiğe çevirirdi — ve kullanıcı hangisini yaptığını bilmezdi.
 *
 * Konu kaynak çalıştırmadan okunuyor (CLI yapıyor): kullanıcıya yeniden yazdırmak,
 * bir harf farkıyla `idempotencyKey`i değiştirir ve tekrar, tekrar olmaktan çıkar.
 */
export const tekrarBaslat = (g: {
  readonly repoRoot: string
  readonly pipelineId: string
  readonly kaynakRunId: string
  readonly kind: 'rerun' | 'replay'
  readonly env: Readonly<Record<string, string>>
  readonly komut?: string
}): BaslatSonuc => {
  if (g.pipelineId.trim() === '') return { ok: false, hata: 'pipeline bilinmiyor' }
  if (g.kaynakRunId.trim() === '') return { ok: false, hata: 'kaynak çalıştırma yok' }
  const runId = newId('RunId') as RunId

  const argv = ['uret', g.pipelineId, `--${g.kind}`, g.kaynakRunId, '--run', runId]
  akibetiIzle(
    g.repoRoot,
    runId,
    [g.komut ?? 'just', ...argv],
    spawnProcess(g.komut ?? 'just', argv, {
      cwd: g.repoRoot,
      env: g.env,
      maxOutputBytes: 1_000_000,
    })
  )

  return { ok: true, runId }
}
