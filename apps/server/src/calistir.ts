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

import { appendFileSync, mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { spawnProcess, newId, systemClock, RUNS_DIR } from '@suite/kernel'
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

/**
 * Canlı günlük — alt sürecin çıktısı GELDİĞİ ANDA deftere yazılır.
 *
 * ⚠ ⚠ **BAŞLATTIKTAN SONRA HİÇBİR İZ YOKTU.** Çıktı `spawnProcess` içinde birikiyor
 * ve yalnız süreç bitince dönüyordu; on dakikalık bir çalıştırma boyunca panelde
 * gösterilecek tek şey "başlatıldı" satırıydı. Dosyaya akıtmak, hem insanın
 * izlemesini hem de asılan bir koşunun NEREDE asıldığının görülmesini sağlıyor.
 *
 * Dosya `derived/runs/<id>/` altında: çalıştırmaya ait her kayıt aynı yerde durur
 * ve defter silinmez (Yasa 11).
 */
const gunlugeYaz = (repoRoot: string, runId: string, parca: string): void => {
  try {
    const dizin = join(repoRoot, RUNS_DIR, runId)
    mkdirSync(dizin, { recursive: true })
    appendFileSync(join(dizin, 'calistirma.log'), parca, 'utf8')
  } catch {
    // Günlük yazılamıyorsa çalıştırma yine sürer: kayıt tutamamak, işi durdurmaz.
  }
}

/**
 * O anda KOŞAN çalıştırmalar — aynı koşuyu iki kez başlatmayı engelleyen tek kayıt.
 *
 * ⚠ ⚠ **BU OLMADAN İKİ SÜREÇ AYNI KOŞUYU EZİYORDU ve ölçüldü.** `run_01a018ef`in
 * günlüğünde iki *"sürdürülüyor"* başlığı iç içe geçti; `gorsel-brief-4` iki kez
 * başladı, `gorsel-uret-4` yarım yazılmış bir brief gördü ve `prompt-yok` diye
 * ATLANDI — o atlama deftere yazıldı, dördüncü slayt YER TUTUCU ile render edildi ve
 * özet tablosu aynı adımı hem ✓ hem ✗ gösterdi. Sebep: insan Telegram'dan onayladı
 * (sunucu sürdürdü), ben de panelden sürdürdüm. İkisi de meşru; ikisi aynı anda değil.
 *
 * ⚠ Kapsam DÜRÜSTÇE sınırlı: bu kayıt sunucu SÜRECİNE ait. Terminalden elle koşulan
 * `just uret --devam` bunu görmez. Dosya kilidi daha geniş korurdu ama bayat kilit
 * yönetimi getirir; ölçülen kusur sunucudan geldi, çözüm de oradan.
 */
const kosanlar = new Set<string>()

/** Bir koşu şu anda bu sunucu tarafından koşuluyor mu. */
export const kosuyorMu = (runId: string): boolean => kosanlar.has(runId)

/** Alt süreç sonucunu izler; yalnız BAŞARISIZLIK deftere düşer. */
const akibetiIzle = (
  repoRoot: string,
  runId: string,
  komut: readonly string[],
  p: ReturnType<typeof spawnProcess>
): void => {
  kosanlar.add(runId)
  void p.then((r) => {
    kosanlar.delete(runId)
    if (r.code === 0 && !r.timedOut && !r.aborted) return
    baslatmaHatasiniYaz(repoRoot, runId, {
      // ⚠ ⚠ **ZAMAN DAMGASI YOKTU ve panel eski bir hatayı GÜNCEL sanıyordu.**
      // Başarısız bir başlatmadan sonra aynı koşu sürdürülüp BAŞARIYLA bitti; panel
      // hâlâ "✗ süreç hiç başlamadı" kutusunu gösteriyordu — 20/28 adım tamam, dört
      // slayt ekranda, üstte bir yalan. Kayıt silinmez (Yasa 11); ama bir kaydın
      // GÜNCEL olup olmadığı ancak ne zaman yazıldığı biliniyorsa söylenebilir.
      // ⚠ Saat TEK yerden (§13 · `chokepoints` kapısı yakaladı): `new Date()`
      // ikinci bir saattir ve iki saat replay'i bozar.
      at: systemClock.nowIso(),
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
  /** `true` = konu boş gider, hat `konu-sec` adımında kendi seçer (FAZ-17.3). */
  readonly konuyuSistemSecsin?: boolean
  /**
   * Şablon SEÇİMİ — boşsa hat kendi seçer (Yasa 13).
   *
   * ⚠ Serbest parametre olarak geçiyor (`--sablon <id>`): motor onu her adımın
   * kısıtlarına ekliyor ve `sablonSecimiIcin` okuyor. Yeni bir bayrak açmak, aynı
   * şeyi ikinci bir yoldan yapmak olurdu.
   */
  readonly sablon?: string
  /**
   * İçerik kipi — `firma` (marka kayıtları) ya da `genel` (bilgi veren içerik).
   *
   * ⚠ Aynı yol: serbest parametre (`--icerik-kipi <kip>`), motor onu her adımın
   * kısıtlarına ekliyor. Yeni bir bayrak açmak, aynı zinciri ikinci kez kurmak olurdu.
   */
  readonly icerikKipi?: string
  /** Yayın platformları, virgülle — `instagram,linkedin` gibi. Boşsa `instagram`. */
  readonly platformlar?: string
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
  // ⚠ Konusuz koşu yalnız AÇIKÇA istendiğinde: boş bir alanı "sistem seçsin" saymak,
  // unutulmuş bir girdiyi karar yerine koymaktır.
  if (g.konu.trim() === '' && g.konuyuSistemSecsin !== true) {
    return { ok: false, hata: 'konu boş — ya konu yaz ya "konuyu sistem seçsin" işaretle' }
  }
  if (g.planDigest.trim() === '') {
    return {
      ok: false,
      hata: 'plan özeti yok — onay bir ÖZETE verilir (R-07); önce `/api/plan` ile planı dondurun',
    }
  }
  // Kabuk enjeksiyonu yok: argümanlar DİZİ olarak geçiyor, kabuk yorumlaması hiç yok.
  const runId = newId('RunId') as RunId

  const sablonArgv = (g.sablon ?? '').trim() === '' ? [] : ['--sablon', (g.sablon ?? '').trim()]
  // ⚠ ⚠ **YALNIZ TANINAN KİP GEÇİYOR.** Gövdeden gelen serbest bir dizeyi komut
  // satırına koymak, panelin yazdığı her şeyi çalıştırma parametresine çevirirdi.
  // Varsayılan `firma` olduğu için tanınmayan değer sessizce bugünkü davranışa düşüyor
  // — ve `firma` zaten bayrak istemiyor.
  const kipArgv = (g.icerikKipi ?? '').trim() === 'genel' ? ['--icerik-kipi', 'genel'] : []
  // ⚠ Yalnız harf ve virgül geçiyor: gövdeden gelen serbest bir dizeyi komut satırına
  // koymak, panelin yazdığı her şeyi çalıştırma parametresine çevirirdi.
  const platformArgv = /^[a-z,]+$/.test((g.platformlar ?? '').trim())
    ? ['--platformlar', (g.platformlar ?? '').trim()]
    : []
  const argv =
    g.konu.trim() === ''
      ? [
          'uret',
          g.pipelineId,
          '--konu-sec',
          ...sablonArgv,
          ...kipArgv,
          ...platformArgv,
          '--run',
          runId,
          '--plan-digest',
          g.planDigest,
        ]
      : [
          'uret',
          g.pipelineId,
          g.konu,
          ...sablonArgv,
          ...kipArgv,
          ...platformArgv,
          '--run',
          runId,
          '--plan-digest',
          g.planDigest,
        ]
  akibetiIzle(
    g.repoRoot,
    runId,
    [g.komut ?? 'just', ...argv],
    spawnProcess(g.komut ?? 'just', argv, {
      cwd: g.repoRoot,
      env: g.env,
      maxOutputBytes: 1_000_000,
      onData: (parca) => gunlugeYaz(g.repoRoot, runId, parca),
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
  // ⚠ İkinci sürdürme REDDEDİLİYOR: aynı koşu dizinine yazan iki süreç birbirinin
  // defterini eziyor ve sonuç ölçüldü — yarım okunan bir brief, `prompt-yok` ile
  // atlanan bir görsel adımı ve yer tutucuyla render edilen bir slayt.
  if (kosuyorMu(g.runId)) {
    return { ok: false, hata: `${g.runId} ZATEN koşuyor — ikinci sürdürme defteri bozar` }
  }
  const argv = ['uret', g.pipelineId, '--devam', g.runId]
  akibetiIzle(
    g.repoRoot,
    g.runId,
    [g.komut ?? 'just', ...argv],
    spawnProcess(g.komut ?? 'just', argv, {
      cwd: g.repoRoot,
      ...(g.env === undefined ? {} : { env: g.env }),
      maxOutputBytes: 1_000_000,
      onData: (parca) => gunlugeYaz(g.repoRoot, g.runId, parca),
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
      onData: (parca) => gunlugeYaz(g.repoRoot, runId, parca),
    })
  )

  return { ok: true, runId }
}
