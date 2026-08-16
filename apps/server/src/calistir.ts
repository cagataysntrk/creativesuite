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

import { spawnProcess, newId } from '@suite/kernel'
import type { RunId } from '@suite/contracts'

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

  void spawnProcess(
    g.komut ?? 'just',
    ['uret', g.pipelineId, g.konu, '--run', runId, '--plan-digest', g.planDigest],
    { cwd: g.repoRoot, env: g.env, maxOutputBytes: 1_000_000 }
  ).catch(() => {
    // Alt sürecin âkıbeti manifeste yazılır; burada yutulan tek şey promise reddi.
    // Sessiz değil: manifest yoksa `doctor` "varlık var manifest yok" der, varsa
    // `stoppedAt` nerede durduğunu söyler.
  })

  return { ok: true, runId }
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

  void spawnProcess(
    g.komut ?? 'just',
    ['uret', g.pipelineId, `--${g.kind}`, g.kaynakRunId, '--run', runId],
    { cwd: g.repoRoot, env: g.env, maxOutputBytes: 1_000_000 }
  ).catch(() => {
    // Âkıbet manifeste yazılır (bkz. `calistirmaBaslat`).
  })

  return { ok: true, runId }
}
