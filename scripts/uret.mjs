#!/usr/bin/env node
// `just uret <pipeline> <konu>` — hattı UÇTAN UCA koşar (§10 · FAZ-3.14).
//
// **Bu, para harcayabilen tek CLI girişidir.** `just plan` hiçbir şey harcamaz; bu
// komut sağlayıcı çağırabilir. Bütçe tavanı zorunlu ve varsayılan DÜŞÜK: tavansız
// çalıştırmak, gözetimsiz bir gecede tavanın olmadığını öğrenmektir.

import { readFileSync, existsSync, statSync, mkdirSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const REPO = join(dirname(fileURLToPath(import.meta.url)), '..')
const PIPELINES = join(REPO, 'registry/pipelines')

const { loadPipeline, hatDurumlari } = await import(join(REPO, 'packages/registry/dist/index.js'))
const {
  runPipeline,
  formatRun,
  resolveBody,
  selectBody,
  composeBody,
  ingestBody,
  publishBody,
  proposeBody,
  renderBody,
  validateBody,
  generateBody,
  pricingFromDescriptor,
  runOutputDir,
  storeBlob,
  knowledgeCommit,
  RateLimiter,
  uyumKapsami,
  taranacakPrompt,
} = await import(join(REPO, 'packages/engine/dist/index.js'))
const { candidatesFor, loadDescriptors, adapterById, saglayiciOrtami } = await import(
  join(REPO, 'packages/providers/dist/index.js')
)
const {
  fontCss,
  measure,
  formatReport,
  samplePng,
  tasarimOlc,
  paginateDocument,
  lintDocument,
  parseIr,
  isIrError,
  hexFromTokens,
  colorsFromTokens,
  assertCompliance,
  stampAsset,
  placementById,
  reklamBloklayici,
  reklamIhlalMesaji,
  reklamLint,
  DEFAULT_LIMITS,
  logoVarliklari,
  varlikZinciri,
  zincirdenCoz,
} = await import(join(REPO, 'packages/render/dist/index.js'))
const { openDb, systemClock, seededRng, newId, readEnv } = await import(
  join(REPO, 'packages/kernel/dist/index.js')
)
const { initLedger } = await import(join(REPO, 'packages/engine/dist/index.js'))
const { selectRecords, selectSearch } = await import(join(REPO, 'packages/corpus/dist/index.js'))

const id = process.argv[2]
// `--devam <run_id>`: mevcut bir çalıştırmanın KARARLARINI okuyup hattı sürdürür.
// Kararlar manifest'ten gelir; bu betik onları ÜRETMEZ, yalnız OKUR (R-14 · D-145).
const devamIndeks = process.argv.indexOf('--devam')
const devamRunId = devamIndeks > 0 ? process.argv[devamIndeks + 1] : undefined
// `--run <id>`: çalıştırma kimliğini ÇAĞIRAN verir (komuta merkezi). Sunucu kimliği
// üretip hemen döner ve kullanıcı çalıştırmayı o kimlikle izler; CLI kendi kimliğini
// üretseydi UI hangi çalıştırmayı başlattığını bilemezdi.
// `--rerun <run_id>`: DONMUŞ planı aynen koşar — kararı tekrarlar. Yeniden planlamaz.
// `--replay <run_id>`: bugünün tanımıyla yeniden planlar. İkisi AYRI eylemdir ve
// aradaki fark, üretilen eserin neden farklı olabileceğini açıklayan tek şeydir.
const rerunIndeks = process.argv.indexOf('--rerun')
const rerunRunId = rerunIndeks > 0 ? process.argv[rerunIndeks + 1] : undefined
const replayIndeks = process.argv.indexOf('--replay')
const replayRunId = replayIndeks > 0 ? process.argv[replayIndeks + 1] : undefined
const runIndeks = process.argv.indexOf('--run')
const verilenRunId = runIndeks > 0 ? process.argv[runIndeks + 1] : undefined
// `--plan-digest <d>`: **onaylanan plan ile koşan plan AYNI olmak zorunda** (R-07).
// UI ekranda bir maliyet gösterip onay aldıysa, o onay bir ÖZETE verilmiştir; aradan
// geçen sürede biri fiyat güncellerse özet değişir ve çalıştırma DURMALIDIR.
const digestIndeks = process.argv.indexOf('--plan-digest')
const beklenenDigest = digestIndeks > 0 ? process.argv[digestIndeks + 1] : undefined
const BAYRAKLAR = new Set(['--devam', '--run', '--plan-digest', '--rerun', '--replay'])
// ⚠ Değer ALMAYAN bayrak: `BAYRAKLAR` üyeleri bir sonraki argümanı değer sayıyor ve
// `--konu-sec` sonrası gelen kelimeyi yutardı.
const KONU_SEC = process.argv.includes('--konu-sec')

// ── serbest çalıştırma parametreleri ────────────────────────────────────────
//
// ⚠ **İkinci doğrulama turu bunu eksik buldu.** `prospect-deck` hattının `arastir`
// adımı bir `url` bekliyor ve `urun-ekrani` adımı `demo_ref` bekliyor; CLI yalnız
// `topic` alıyordu ve başka parametre YOLU YOKTU. Sonuç: hat `NO_SOURCE_URL` ile
// duruyordu ve bu bir "insan blokajı" gibi görünüyordu — oysa teknik bir eksikti.
//
// `--<ad> <deger>` çiftleri `params`a giriyor ve motor onları her adımın kısıtlarına
// EKLİYOR. **Pipeline kısıtı yine kazanır** (R-20 ezilemez): parametre bir örnek,
// kısıt bir sözleşme.
// ⚠ Koşu geçmişi: "yeni bir tane üret" gerçekten yeni olsun diye (D-308).
// Ölçüldü: son ÜÇ karosel koşusunun üçü de `sahne` seçmişti ve konular kopyaydı.
// ⚠ ⚠ **HESAP BURADAN ALINDI.** `son_kullanilan` ve `kacinilacak` burada
// hesaplanıyordu; sunucunun launcher'ı hesaplamıyordu ve panelden başlatılan her
// koşu R-07 kapısında "plan DEĞİŞTİ" ile ölüyordu. İki yerde hesaplanan bir şey
// iki farklı sonuç verir — hesap `kosuParametreleri`ne taşındı, iki çağıran da
// oradan okuyor.
// ⚠ Defter yolu `RUNS_DIR`den geliyor, elle yazılmıyor: `chokepoints` kapısı
// defterin yerini bilen ikinci bir yer istemiyor (§13 · D-38).
const { RUNS_DIR } = await import(join(REPO, 'packages/kernel/dist/manifest.js'))
const { kosuParametreleri, konuAdaylari, islenmisKonular, kosudaGorselUretildi } = await import(
  join(REPO, 'packages/engine/dist/index.js')
)

const serbestParam = {}
for (let i = 3; i < process.argv.length - 1; i++) {
  const a = process.argv[i]
  if (!a.startsWith('--') || BAYRAKLAR.has(a)) continue
  const deger = process.argv[i + 1]
  if (deger === undefined || deger.startsWith('--')) continue
  // `--demo-ref` → `demo_ref`: YAML kısıtları alt çizgi kullanıyor.
  serbestParam[a.slice(2).replace(/-/g, '_')] = deger
}
const serbestAnahtarlar = new Set(Object.keys(serbestParam).map((k) => `--${k.replace(/_/g, '-')}`))
const konu = process.argv
  .slice(3)
  .filter((a, i, arr) => {
    const onceki = arr[i - 1] ?? ''
    if (a === '--konu-sec') return false
    if (BAYRAKLAR.has(a) || BAYRAKLAR.has(onceki)) return false
    // Serbest parametrenin kendisi ve değeri konuya girmez.
    return !serbestAnahtarlar.has(a) && !serbestAnahtarlar.has(onceki)
  })
  .join(' ')
if (
  id === undefined ||
  (konu === '' &&
    !KONU_SEC &&
    devamRunId === undefined &&
    rerunRunId === undefined &&
    replayRunId === undefined)
) {
  console.log(`  kullanım: just uret <pipeline> <konu>`)
  console.log(`  konusuz:  just uret <pipeline> --konu-sec   (konuyu hattın agent'ı seçer)`)
  console.log(`  devam:    just uret <pipeline> --devam <run_id>   (konu manifest'ten okunur)`)
  console.log(`  parametre: just uret prospect-deck <konu> --url <site> --demo-ref <yol>`)
  // ⚠ ⚠ **EMEKLİ HAT ARTIK MENÜDE YOK.** `hatDurumlari` aktif/emekli ayrımını yapmak için
  // YAZILMIŞTI ve bu CLI ham `listPipelines`ı çağırıyordu: emekli hat, koşmaması gereken
  // hat, kullanım satırında ÖNERİLİYORDU. Bu depoda aynı sınıf hatanın bir tekrarı daha —
  // doğru fonksiyon var, çağıran yanlış olanı çağırıyor.
  // ⚠ Sayısı SÖYLENİYOR: liste sessizce kısalırsa "hat kayboldu" denir; emeklilik
  // kendini duyurmak zorunda (Yasa 10).
  const durum = hatDurumlari(PIPELINES)
  console.log(`  mevcut: ${durum.aktif.join(', ') || '(yok)'}`)
  if (durum.emekli.length > 0) console.log(`  emekli (koşturulmuyor): ${durum.emekli.join(', ')}`)
  process.exit(1)
}

// ── deck IR'ı: KAYNAK dosya (§4c · FAZ-6.1) ─────────────────────────────────
//
// `--ir <yol>` verilirse belge blokları oradan gelir — grafik ve diyagram blokları
// dahil. Benzer bir deck geldiğinde LLM yeniden koşturulmaz, IR kopyalanıp düzenlenir:
// hem ucuz hem tutarlı. Şekil doğrulaması `parseIr`de; bozuk IR render'ın ortasında
// değil OKUMADA reddedilir.
let irBelge = null
if (typeof serbestParam.ir === 'string') {
  const irYol = serbestParam.ir.startsWith('/') ? serbestParam.ir : join(REPO, serbestParam.ir)
  if (!existsSync(irYol)) {
    console.log(`✗ IR dosyası yok: ${serbestParam.ir}`)
    process.exit(1)
  }
  const cozulen = parseIr(readFileSync(irYol, 'utf8'))
  if (isIrError(cozulen)) {
    console.log(`✗ IR okunamadı: ${JSON.stringify(cozulen)}`)
    process.exit(1)
  }
  irBelge = cozulen.doc
  // `ir` bir CLI bayrağı, bir adım kısıtı DEĞİL: kısıtlara sızarsa manifestte dosya
  // yolu görünür ve replay başka bir makinede kırılır.
  delete serbestParam.ir
}

const cozum = loadPipeline(PIPELINES, id)
if (!cozum.ok) {
  console.log(`✗ pipeline çözülemedi: ${id}`)
  for (const e of cozum.errors) console.log(`    ${JSON.stringify(e)}`)
  process.exit(1)
}

// ── emekli hat KOŞMADAN ÖNCE söyler (R-108) ─────────────────────────────────
//
// ⚠ ⚠ **EMEKLİLİK YALNIZ YAML BAŞLIĞINDA YAZIYORDU ve kimse koşmadan önce onu
// okumuyor.** `instagram-carousel` 2026-08-18'de emekli edildi (D-268) ve
// `instagram-karosel` ile değiştirildi; iki ad bir harf farkıyla ayrılıyor, biri
// İngilizce biri Türkçe. Yanlış olanı koştum ve hat SESSİZCE çalıştı: eski tasarımla,
// katalog dışı bir yerleşimle, metin kontrastı 1,1:1 olan bir slaytla.
//
// ⚠ ⚠ **UYARI YETMEDİ — EMEKLİ HAT ARTIK KOŞMUYOR.** Önceki sürüm yalnız bir satır
// basıyor ve çalıştırıyordu; depo sahibi eski hattın hâlâ koşulabilir olmasını bir
// TUZAK olarak gördü ve haklı: uyarı, akan bir konsolun içinde ikinci koşuda görünmez
// olur. Bir kapı ancak DURDURUYORSA kapıdır.
//
// ⚠ **Bu Yasa 10'u DELMİYOR.** Yasa *"emeklilik silme değildir"* diyor; dosya duruyor,
// `retired`/`supersededBy` duruyor, id ÇÖZÜLEBİLİR kalıyor — geçmiş koşular okunuyor ve
// `apps/ui` bu id'ye bağlı kalmaya devam ediyor. Yasaklanan tek şey YENİ İŞ BAŞLATMAK,
// ki yasanın kendi cümlesi zaten *"yeni işler yerine geçen hatta gider"*.
//
// ⚠ `--devam` ve `--rerun` de reddediliyor: emekli bir tasarımla yarım kalmış bir koşuyu
// SÜRDÜRMEK, o tasarımla yeni görsel üretmek demektir ve para oradan gider.
if (cozum.value.retired === true) {
  const yerine = cozum.value.supersededBy
  console.error(`  ✗ '${id}' EMEKLİ bir hat ve KOŞTURULMUYOR.`)
  console.error(
    `    Yerine: ${yerine == null ? '(yerine geçen hat beyan edilmemiş)' : `'${yerine}'`}`
  )
  console.error('    Yasa 10: dosya silinmedi, id çözülüyor, geçmiş koşular okunuyor —')
  console.error('    yalnız YENİ İŞ başlatmıyor. Çıktısı güncel tasarım değildi.')
  process.exit(1)
}

// ── marka bağlamı ───────────────────────────────────────────────────────────
// Ortam TEK okuyucudan (`secret-okuyucu` darboğazı, §14): dağılmış `process.env`,
// bir ay ihmalden sonra sistemi başlatamamanın en sık sebebi.
const MARKA = readEnv('SUITE_BRAND') ?? 'brd_upcytech'

// Dönem `brand/<id>/current`tan OKUNUR, gömülmez (D-167).
//
// 2026-08-15'e kadar burada `'era_imalat_2026'` yazıyordu; dönemin gerçek adı
// `imalat-2026`. Altı corpus kaydı da aynı yanlış dizeyi taşıyordu, yani retrieval
// yüklemi hiçbirini GÖRMÜYORDU — ve hepsi `draft` olduğu için bu maskeliydi. Onay
// verildiği gün kayıtlar `active` olacak ve HÂLÂ görünmeyecekti.
const AKTIF_DONEM = readFileSync(join(REPO, `brand/${MARKA}/current`), 'utf8').trim()

// ── bütçe tavanı: Ring 1'den, ortam değişkeninden DEĞİL (D-179) ─────────────
//
// Tavan `SUITE_RUN_CAP` env'indeydi: UI'dan değiştirilemez, git'te görünmez, iki
// makinede farklı olabilir ve "hangi tavanla koştu" sorusu cevapsız kalırdı. Tavan bir
// KARARDIR ve kararlar Ring 1'de, git'te yaşar.
const { parseButce, toBudgetCaps, butceHatasiMesaji, VARSAYILAN_BUTCE } = await import(
  join(REPO, 'packages/registry/dist/index.js')
)
const BUTCE_YOLU = join(REPO, 'registry/butce.yaml')
const butceSonuc = existsSync(BUTCE_YOLU)
  ? parseButce(readFileSync(BUTCE_YOLU, 'utf8'))
  : { ok: true, value: VARSAYILAN_BUTCE }
if (!butceSonuc.ok) {
  // Bozuk bütçe dosyası SESSİZCE varsayılana düşmez: kullanıcının koyduğu tavanın
  // yerine başka bir tavanla koşmak, tavan koymamaktan tehlikelidir.
  console.log('✗ bütçe tavanı okunamadı:')
  for (const e of butceSonuc.errors) console.log(`    ${butceHatasiMesaji(e)}`)
  process.exit(1)
}
const BUTCE = toBudgetCaps(butceSonuc.value)
console.log(
  `  bütçe tavanı: çalıştırma ${BUTCE.perRun === null ? 'yok' : `${BUTCE.perRun.micros} mikro`}` +
    ` · aylık ${BUTCE.perMonth === null ? 'yok' : `${BUTCE.perMonth.micros} mikro`}`
)
const tokenYolu = join(REPO, `brand/${MARKA}/derived-tokens/tokens.css`)
if (!existsSync(tokenYolu)) {
  console.log(`✗ marka token'ları yok: ${tokenYolu}`)
  process.exit(1)
}
const tokenCss = readFileSync(tokenYolu, 'utf8')

// ── marka fontları (§7.2 · D-252) ───────────────────────────────────────────
//
// **Eksik font SESSİZCE geçilmez.** Geçilseydi çıktı sistem fontuyla üretilir,
// `ĞÜŞİÖÇ` bozulur ve hiçbir hata görünmezdi — yanlış fontla üretilmiş bir varlık,
// üretilmemiş bir varlıktan kötüdür.
// ⚠ ⚠ **KALITIM ZİNCİRİNDEN (R-101).** Doğrudan `brand/<id>/fonts` bakılıyordu ve
// `brd_dima` — token sisteminin kalıtımını kullanan gerçek bir alt marka — burada
// ÖLÜYORDU: sekiz dosya eksik, `exit(1)`. Token *"ezmediğin şey MİRASTIR"* diyor;
// font ve logo o cümlenin dışında kalmıştı.
const fontZinciri = varlikZinciri(join(REPO, 'brand'), MARKA, 'fonts')
const fontCozum = zincirdenCoz(fontZinciri, (d) => fontCss(d))
const fontSonucu = fontCozum.sonuc
if (!fontSonucu.ok) {
  console.log(
    `✗ marka fontu eksik: ${fontSonucu.eksikler.map((e) => e.dosya).join(', ')}` +
      ` (bakılan: ${fontZinciri.join(' → ')})`
  )
  process.exit(1)
}
if (fontCozum.devralindi) console.log(`  · font DEVRALINDI: ${fontCozum.dizin}`)
const markaFontCss = fontSonucu.css

// ── marka işareti: üretilen her karosel imza taşır (R-92) ────────────────────
//
// ⚠ ⚠ **BU ÇAĞRI YOKTU ve üretilen HİÇBİR karosel imza taşımıyordu.** Dosyalar
// `brand/<id>/logo/` altında duruyordu, `logoVarliklari()` yazılmış ve test edilmişti;
// tek çağıranı `scripts/duzenleyici.mjs` — yani EDİTÖR ÖNİZLEMESİ. Bu dosyada `logo`
// kelimesi hiç geçmiyordu ve `panorama.ts` "verilmezse imza BASILMIYOR" diyordu.
// Zincir kopukluğunun bir örneği daha: modül var, test yeşil, üretim yolu yok.
//
// ⚠ **Eksik logo koşuyu DURDURMUYOR** — fontun aksine. Font eksikse çıktı YANLIŞ
// üretilir (sistem fontu, bozuk `ĞÜŞİÖÇ`); logo eksikse `marka-isareti` geometrik
// yedeğe düşüyor ve bu meşru bir çıktı. Ama sessiz de değil: uyarı basılıyor.
const logoZinciri = varlikZinciri(join(REPO, 'brand'), MARKA, 'logo')
const logoCozum = zincirdenCoz(logoZinciri, (d) => logoVarliklari(d))
const logoSonucu = logoCozum.sonuc
if (!logoSonucu.ok) {
  console.log(
    `  ⚠ marka işareti eksik (${logoSonucu.eksikler.join(', ')}) — geometrik yedek çizilecek`
  )
} else if (logoCozum.devralindi) {
  console.log(`  · marka işareti DEVRALINDI: ${logoCozum.dizin}`)
}
const markaLogo = logoSonucu.ok ? logoSonucu.varliklar : undefined

// Ön ekli kimlik kernel'den (R-06 · `id-uretici` darboğazı): ikinci bir üreteç,
// sıralanamayan ve tipi anlaşılmayan id üretir.
// `--devam` AYNI runId'yi kullanır: idempotency defteri o kimliğe bağlı ve yeni bir
// kimlik, ödenmiş adımları yeniden ödemek demektir (R-44).
const runId = devamRunId ?? verilenRunId ?? newId('RunId')

let kararlar = []
let oncekiManifest = null
let devamKonu = null
if (devamRunId !== undefined) {
  const { readManifest } = await import(join(REPO, 'packages/engine/dist/index.js'))
  oncekiManifest = readManifest(REPO, devamRunId)
  if (oncekiManifest === null) {
    console.log(`✗ devam edilecek çalıştırma bulunamadı: ${devamRunId}`)
    process.exit(1)
  }
  kararlar = oncekiManifest.decisions ?? []
  if (kararlar.length === 0) {
    console.log(`✗ ${devamRunId}: hiç kapı kararı yok — önce: just onay ${devamRunId} onayla`)
    process.exit(1)
  }
  // ── DONMUŞ GİRDİLER yeniden kullanılır (R-07 · D-154) ────────────────────
  //
  // Devam etmek AYNI çalıştırmayı sürdürmektir; girdileri yeniden çözmek başka bir
  // çalıştırma yapmaktır. `idempotencyKey` `corpusCommit` ve `topic` içeriyor
  // (`run.ts`): ikisi değişirse bütün anahtarlar değişir ve **ödenmiş adımlar yeniden
  // ödenir** — R-44'ün tam tersi. `just onay` araya `just save` öneriyor, yani
  // corpus SHA'sının değişmesi olağan bir senaryo.
  const konuKaydi = (oncekiManifest.steps ?? []).find(
    (st) => typeof st.params?.topic === 'string' && st.params.topic !== ''
  )
  devamKonu = konuKaydi?.params.topic ?? null
  console.log(
    `  ${devamRunId} sürdürülüyor · ${kararlar.length} kapı kararı · ` +
      `donmuş girdiler yeniden kullanılıyor (corpus ${oncekiManifest.corpusCommit.slice(0, 8)}` +
      `${devamKonu === null ? '' : `, konu "${devamKonu}"`})`
  )
}

// ── rerun / replay: konu KAYNAK çalıştırmadan okunur ────────────────────────
//
// Konuyu kullanıcıya yeniden yazdırmak, "aynı işi tekrarla" vaadini bozardı: bir harf
// farkı `idempotencyKey`i değiştirir ve tekrar, tekrar olmaktan çıkar (R-44).
let kaynakKonu = null
const kaynakRunId = rerunRunId ?? replayRunId
if (kaynakRunId !== undefined) {
  const { readManifest } = await import(join(REPO, 'packages/engine/dist/index.js'))
  const kaynakManifest = readManifest(REPO, kaynakRunId)
  if (kaynakManifest === null) {
    console.log(`✗ kaynak çalıştırma bulunamadı: ${kaynakRunId}`)
    process.exit(1)
  }
  const kayit = (kaynakManifest.steps ?? []).find(
    (st) => typeof st.params?.topic === 'string' && st.params.topic !== ''
  )
  kaynakKonu = kayit?.params.topic ?? null
  console.log(
    `  ${rerunRunId !== undefined ? 'rerun' : 'replay'} · kaynak ${kaynakRunId}` +
      `${kaynakKonu === null ? '' : ` · konu "${kaynakKonu}"`}`
  )
}

const clock = systemClock
const damga = {
  brandId: MARKA,
  eraId: AKTIF_DONEM,
  kitVersion: 'kit-1',
  definitionDigest: 'sha256:faz3',
  contextManifest: `ctx_${runId}`,
  sourceRunId: runId,
}

// ── corpus: TEK retrieval yükleminden (R-13, R-14) ──────────────────────────
//
// ⚠ Buranın ilk hâli `globSync('corpus/*/*.md')` ile İKİNCİ BİR YÜKLEM kuruyordu ve
// yedi `status: draft` kaydı üretime sokuyordu. İki BLOCKING kural birden çiğneniyordu:
// R-13 (retrieval yüklemi kodda tek yerde) ve R-14 (agent önerir, insan uygular —
// draft retrieval'a GÖRÜNMEZ). Doğrulama agent'ı 2026-08-15'te yakaladı (D-134).
//
// Şimdi `selectRecords` çağrılıyor: `status IN ('active','pinned')` yüklemin İÇİNDE.
// Onaylanmamış corpus'ta bu SIFIR kayıt döndürür ve hat `NO_CONTEXT` ile durur —
// **doğru davranış budur.** Onay insanın işidir (FAZ-2.9) ve o kapı atlanamaz.
const indeksYolu = join(REPO, 'derived/index/suite.db')
if (!existsSync(indeksYolu)) {
  console.log(`✗ türetilmiş indeks yok: ${indeksYolu}`)
  console.log('  önce: just reindex')
  process.exit(1)
}
const corpusDb = openDb({ path: indeksYolu })

const secici = (sorgu, limit) => {
  const q = {
    brandId: MARKA,
    eraId: AKTIF_DONEM,
    // Saat ÇAĞIRANDAN gelir; yüklem saat okumaz (R-06).
    asOf: clock.nowIso(),
    limit,
  }
  // ⚠ **ARAMA SIRALAR, YÜKLEM İÇERİK VERİR** (D-245). `selectSearch` bir SIRALAMA
  // şekli döndürüyor — `{id, path, title, score, sources}` — ve **gövdesi yok**.
  // Eski kod `k.body ?? k.snippet ?? ''` okuyordu: arama isabet ettiği an üç kaydın
  // üçü de boş metinle geliyor, prompt kurulamıyor ve hat `EMPTY_PROMPT` ile
  // duruyordu. Arama ıskaladığında yedek yol (`selectRecords`) gövdeyi getirdiği
  // için kusur **yalnız arama tuttuğunda** görünüyordu — en sinsi hâli.
  //
  // İçerik TEK yerden: `selectRecords` retrieval yükleminin kendisi (R-13). Arama
  // yalnız sırayı belirliyor; ikinci bir içerik okuyucu açmak yüklemi ikiye bölerdi.
  const hits = selectSearch(corpusDb, q, sorgu, limit)
  const tumu = selectRecords(corpusDb, q)
  const kayitlar =
    hits.length > 0
      ? hits.map((h) => tumu.find((k) => k.id === h.id)).filter((k) => k !== undefined)
      : tumu
  return kayitlar.map((k) => ({
    id: k.id,
    text: (k.body ?? k.snippet ?? '')
      .split('\n')
      .map((l) =>
        l
          .replace(/^#+\s*/, '')
          .replace(/\*\*/g, '')
          .trim()
      )
      .filter((l) => l !== '' && !l.startsWith('>') && !l.startsWith('|') && !l.startsWith('⚠'))
      .slice(0, 4)
      .join('\n'),
  }))
}

// ── QA + lexicon + uyum ─────────────────────────────────────────────────────
const izinliHex = hexFromTokens(tokenCss)
// Palet hex VE OKLCH: marka rampaları OKLCH biçiminde (§12.1) ve yalnız hex okumak,
// QA'nın markanın kendi paletini görememesi demekti (D-123).
const palet = { colors: colorsFromTokens(tokenCss) }

const AGIRLIK = { in: 0, warn: 1, out: 2 }

/**
 * Reklam hattı mı — kişisel özellik kuralı yalnız burada koşar (§11.2 · D-229).
 *
 * ⚠ Bu satır eskiden `id === 'ad-creative-set'` idi: **tek bir sabit dize**, ne testi
 * ne kapısı vardı. Hattı yeniden adlandırmak linter'ı sessizce kapatırdı ve hiçbir şey
 * kırmızıya dönmezdi. Artık karar hat dosyasının kendi beyanı; `hat-kimligi` kapısı
 * hat id'siyle karşılaştırma yapılmasını YAZILAMAZ kılıyor.
 */
const REKLAM_HATTI = cozum.value.ciktiSinifi === 'reklam'

/**
 * Lexicon denetimi — **çıktı biçiminden bağımsız** (§11.2 · R-32, R-35).
 *
 * ⚠ Eskiden yalnız `kaliteKontrol`un içindeydi ve o da yalnız `slides` varken
 * çağrılıyordu: PDF hatlarında kaynaksız sayı kapısı HİÇ koşmuyordu (2. doğrulama turu).
 * Artık `validateBody`e ayrı bir yetenek olarak geçiyor ve her biçimde koşuyor.
 */
const lexiconDenetimi = (doc) => {
  const ihlaller = lintDocument(doc, {
    forbidden: ['devrim niteliğinde', 'çığır açan', 'dünyanın en iyisi', 'sektör lideri'],
    allowedHex: izinliHex.length === 0 ? [] : izinliHex,
    claimSource: null,
  })

  // ── reklam metni kuralları (§11.2 · FAZ-8.2) ────────────────────────────
  //
  // **Yalnız reklam hattında koşar.** Meta'nın kişisel özellik kuralı bir REKLAM
  // standardı; organik bir LinkedIn postuna uygulamak, kuralı olmadığı yere taşımak
  // olurdu. `PIPELINE` reklam hattıysa metin blokları buradan da geçiyor.
  //
  // ⚠ Bu satır olmadan modül + test yeşil kalır ve üretimden HİÇ çağrılmaz —
  // D-216/D-222/D-224'ün üç kez tekrarladığı hata. "Çağıran var mı" ZİNCİR için.
  if (REKLAM_HATTI) {
    for (const blok of doc.blocks ?? []) {
      const metin = typeof blok.text === 'string' ? blok.text : ''
      if (metin === '') continue
      for (const r of reklamLint(metin, { claimSource: null })) {
        // Uyarı ile ret aynı listede durur ama aynı şey DEĞİL: `text_coverage`
        // bloklamaz (Meta %20 kuralını artık uygulamıyor).
        ihlaller.push({
          kind: reklamBloklayici(r) ? 'ad_policy' : 'ad_warning',
          term: reklamIhlalMesaji(r),
          where: 'reklam-metni',
        })
      }
    }
  }
  return ihlaller
}

// `gorselli` — hangi slayt indekslerinde görsel bloğu var. RENDER çıktısından geliyor:
// üretici bilir, tüketici tahmin etmez (D-258).
const kaliteKontrol = async (doc, slides, gorselli = []) => {
  const satirlar = []
  let bloke = false

  // ── platform spec'i: tolerans ve boyut sınırı YERLEŞİME göre (§9.1) ────────
  // Tek global tolerans ikisinden birinde yanlış olurdu: Instagram ±%1, LinkedIn ±%5.
  const yerlesimAdi = doc.width === 1200 ? 'linkedin-feed-4x5' : 'instagram-feed-4x5'
  const yerlesim = placementById(yerlesimAdi)
  if (yerlesim === null) {
    satirlar.push(`  ✗ bilinmeyen yerleşim: ${yerlesimAdi}`)
    return { blocked: true, report: satirlar.join('\n') }
  }
  satirlar.push(
    `  yerleşim ${yerlesim.id} · ${yerlesim.width}×${yerlesim.height} · ` +
      `tolerans ±%${yerlesim.aspectTolerancePercent} · sınır ${Math.round(yerlesim.maxBytes / 1024 / 1024)}MB ` +
      `(doğrulandı ${yerlesim.verifiedAt})`
  )

  // Boyut GERÇEKTEN ölçülür. Merdiven `RENDER` adımında uygulandı (D-139); burada
  // yalnız sonucu doğruluyoruz — sınırı aşan bir dosya buraya hiç ulaşmamalı.
  //
  // ⚠ İlk hâli `climbLadder`ı UYDURMA bir formülle çağırıyordu
  // (`boyut × kalite/200 × ölçek²`) — `static.ts`in bizzat "uydurma" dediği şey.
  // D-139 gövdeyi düzeltti ama CLI raporunu düzeltmemişti; 2. doğrulama turu yakaladı
  // (D-153). Tahmin edilen bir boyut, ölçülebilir bir şeyi tahmin etmektir.
  for (const [i, yol] of slides.entries()) {
    const boyut = statSync(yol).size
    const uygun = boyut <= yerlesim.maxBytes
    const uzanti = yol.split('.').pop()
    satirlar.push(
      `  slayt ${i + 1} boyut: ${uygun ? '✓' : '✗'} ${Math.round(boyut / 1024)}KB / ` +
        `${Math.round(yerlesim.maxBytes / 1024)}KB · ${uzanti}`
    )
    if (!uygun) bloke = true
  }

  const lex = lexiconDenetimi(doc)
  if (lex.length > 0) {
    bloke = true
    satirlar.push(`  ✗ ${lex.length} lexicon ihlali: ${lex.map((v) => v.kind).join(', ')}`)
  }

  // Okumalar YAPILANDIRILMIŞ toplanır ve manifeste öyle gider (FAZ-4.8): tolerans
  // bileşeni sayının altına bant çizebilsin diye. Metin rapor insan için kalıyor.
  const okumalar = []

  // ── TASARIM METRİKLERİ — ÜRETİM YOLUNDA (FAZ-10.7 · D-259) ────────────────
  //
  // ⚠ **FAZ 10 boyunca on iki metrik yazıldı ve hiçbiri üretilen varlığa uygulanmıyordu.**
  // `scripts/gates/tasarim.mjs` onları TEMSİLİ belgelerle ölçüyordu: kapı depoyu koruyor,
  // çıktıyı korumuyordu. Sonuç ölçüldü — kapak "≤8 kelime" kuralına rağmen üç satır
  // başlık ve iki uzun paragrafla çıktı ve hiçbir şey kırmızıya dönmedi.
  //
  // Bu, bu deponun en sık tekrarlayan hatasının (kod var, üretim yolunda çağıranı yok)
  // **bu fazın kendi içindeki tekrarı** — üstelik o hatayı kapatmak için kurulmuş bir
  // fazda. Kapı yazmak, kapıyı bağlamak değildir.
  //
  // Slayt belgeleri BURADA yeniden sayfalanıyor: `kaliteKontrol` yalnız PNG yollarını
  // alıyor, blokları değil. Sayfalama saf ve deterministik (aynı belge → aynı bölme),
  // o yüzden ikinci çağrı üretimdekiyle aynı sonucu veriyor.
  const slaytBelgeleri = paginateDocument(doc, null, '@upcytech')
  const tasarim = tasarimOlc({ slaytlar: slaytBelgeleri })
  if (tasarim.readings.length > 0) {
    satirlar.push('  tasarım metrikleri:')
    satirlar.push(formatReport(tasarim))
    for (const o of tasarim.readings) okumalar.push(o)
    // Bloklayıcı tasarım metriği varlığı DURDURUR — tolerans okuması bir süs değil.
    if (tasarim.blocked) bloke = true
  }

  for (const [i, yol] of slides.entries()) {
    const ornek = await samplePng(yol, { grid: 24 })
    if (!ornek.ok) {
      bloke = true
      satirlar.push(`  ✗ slayt ${i + 1}: piksel okunamadı`)
      continue
    }
    const rapor = measure({
      doc,
      // Slayt bazlı: tüm belgeye bakmak, tek görsel yüzünden bütün karoselin renk
      // QA'sını kapatıyordu (D-258). Liste RENDER çıktısından geliyor.
      gorselliSlayt: gorselli.includes(i),
      palette: palet,
      pixels: ornek.value,
      targetAspect: yerlesim.width / yerlesim.height,
      limits: { ...DEFAULT_LIMITS, aspectLimit: yerlesim.aspectTolerancePercent },
    })
    satirlar.push(`  slayt ${i + 1}:`)
    satirlar.push(formatReport(rapor))
    // Aynı metrik birden fazla slayttan gelirse en KÖTÜ okuma kalır: ortalama almak,
    // bir slaydın sınır dışı olduğunu diğerlerinin arkasına gizlerdi.
    for (const o of rapor.readings) {
      const eski = okumalar.findIndex((x) => x.metric === o.metric)
      if (eski === -1) okumalar.push(o)
      else if (AGIRLIK[o.status] > AGIRLIK[okumalar[eski].status]) okumalar[eski] = o
    }
    if (rapor.blocked) bloke = true
  }
  return { blocked: bloke, report: satirlar.join('\n'), readings: okumalar }
}

// ── sağlayıcı fiyatları ─────────────────────────────────────────────────────
const { descriptors } = loadDescriptors(join(REPO, 'registry/providers'))

/**
 * Sağlayıcı ortamı — **TEK tanım, üç çağıran** (`plan`, `runPipeline`, `generateBody`).
 *
 * Üçü ayrı ayrı kurulduğunda ikisi `PATH`ten ibaret kalmıştı ve kasadaki anahtar
 * hiçbirine ulaşmıyordu. Bir şeyi üç yerde kurmak, ikisini güncellemeyi unutmaktır.
 */
const SAGLAYICI_ORTAMI = saglayiciOrtami(descriptors, readEnv, ['CF_ACCOUNT_ID', 'CLAUDE_CODE_BIN'])
const pricing = Object.fromEntries(
  descriptors
    .filter((d) => d.enabled)
    .flatMap((d) => d.capabilities.map((c) => [d.id, pricingFromDescriptor(d, c.name)]))
)

// ── bağlam manifesti (§5.3 · R-07 · R-13) ──────────────────────────────────
//
// ⚠ ⚠ Bu blok kayıtları BURADA seçiyordu; sunucunun launcher'ı hiç seçmiyordu ve
// `recordIds` özete girdiği için panelden başlatılan her koşu "plan DEĞİŞTİ" ile
// ölüyordu. Seçim `baglamKayitlari`na taşındı; iki çağıran da oradan okuyor.
const { baglamKayitlari } = await import(join(REPO, 'packages/engine/dist/index.js'))
const bagamManifesti = baglamKayitlari({
  db: corpusDb,
  recipesDir: join(REPO, 'registry/recipes'),
  recipeId: id,
  query: { brandId: MARKA, eraId: AKTIF_DONEM, asOf: clock.nowIso() },
})

const cikti = runOutputDir(REPO, runId)

const bilgi = await knowledgeCommit(REPO, { PATH: readEnv('PATH') ?? '' })

// Oran kovası TEK örnek: motorun adım zamanlaması ile `PUBLISH` gövdesi AYNI kovayı
// paylaşmalı. İki kova, aynı sınırı iki kez sayar ve ikisi de "yerim var" der.
const oranKovasi = new RateLimiter()

/** Token ömrü kaydı — düz metin, sır değil (FAZ-7.6). Yoksa yayın bloklu. */
const tokenKaydiOku = (provider) => {
  const yol = join(REPO, 'secrets/token-durumu.json')
  if (!existsSync(yol)) return null
  try {
    const ham = JSON.parse(readFileSync(yol, 'utf8'))
    const liste = Array.isArray(ham.kayitlar) ? ham.kayitlar : []
    return liste.find((k) => k.provider === provider) ?? null
  } catch {
    // Bozuk dosya = ömür bilinmiyor = yayın bloklu. "Herhalde geçerlidir" yok.
    return null
  }
}
if (!bilgi.ok) {
  console.log("✗ bilgi ağacı commit SHA'sı okunamadı — replay yapılamaz (§13)")
  console.log("  git deposu değil mi, yoksa `git` PATH'te mi yok?")
  process.exit(1)
}
const bilgiSha = bilgi.sha

// ── GENERATE: GERÇEK adaptöre gider ────────────────────────────────────────
//
// ⚠ İlk hâli sabit `MISSING_CREDENTIALS` döndüren SAHTE bir köprüydü: `cloudflareImage`
// ve `falImage` adaptörlerine hiç ulaşılmıyor, "iki şerit de görsel üretiyor" iddiası
// hiç sınanmıyordu (D-141). Artık yönlendiricinin seçtiği adaptöre gidiyor; anahtar
// yoksa ADAPTÖRÜN KENDİSİ `MISSING_CREDENTIALS` diyor — ve bu fark önemli: hata artık
// gerçek bir kod yolundan geliyor.
const generate = generateBody({
  resolveAdapter: adapterById,
  // ⚠ Elle yüklenen görseller BU dizinden okunuyor; kısıt yalnız dosya adı taşıyor.
  runDir: cikti,
  // ⚠ Bu liste ELLE SAYILIYORDU (üç ad) ve dördüncü sağlayıcı eklendiği gün sessizce
  // unutulacaktı (D-237). Artık tanımlayıcıların `auth_env` beyanından türetiliyor —
  // hangi anahtarın gerektiği veridir, kod değil. Okuyucu TEK: `readEnv` (§14).
  env: SAGLAYICI_ORTAMI,
  capability: 'image.generate',
})

// ── maliyet defteri KALICI olmak zorunda (R-44 · D-137) ────────────────────
//
// İlk hâli `:memory:` idi: defter süreçle birlikte ölüyordu. Yani SIGKILL sonrası
// yeniden başlatma idempotency kaydını bulamıyor ve **aynı çağrı tekrar uçuyordu** —
// FAZ-3.6'nın "çift ücret yok" iddiasının tam tersi. `scheduler.ts` doğru yazılmıştı;
// üretim yolu ona boş bir defter veriyordu.
//
// `derived/index/` gitignore'lu ve yeniden üretilebilir; defter oraya DEĞİL, çalıştırma
// dizinine yakın ve kalıcı bir yere gider. Şimdilik `derived/index/ledger.db` — indeksle
// aynı dizinde ama AYRI dosya ve `just reindex` onu silmez (FAZ-4'te ayrı yola taşınır).
const ledgerYolu = join(REPO, 'derived/index/ledger.db')
mkdirSync(dirname(ledgerYolu), { recursive: true })
const db = openDb({ path: ledgerYolu })
initLedger(db)

// ── planı DONDUR ve motora ver (§8.3 · R-07 · D-182) ────────────────────────
//
// **Bu blok olmadan `rerun` diye bir şey yoktu.** `writeFrozenPlan` yazılmış, `runPipeline`
// onu çağırıyordu — ama üretim yolu `frozen` alanını hiç geçmiyordu ve disk 18
// çalıştırmanın 18'inde plansızdı. Kod vardı, çağıran yoktu (D-173 sınıfı, D-182'de
// yarım kapatılmıştı ve 2026-08-16 denetimi yakaladı).
//
// Dondurma HİÇBİR ŞEY HARCAMAZ: `plan()` kuru ikizleri çağırır (R-47).
const { plan: planKur, freezePlan } = await import(join(REPO, 'packages/engine/dist/index.js'))
const { descriptorDigests } = await import(join(REPO, 'packages/providers/dist/index.js'))

const planSonuc = planKur({
  pipeline: cozum.value,
  runId,
  brandId: MARKA,
  eraId: AKTIF_DONEM,
  // ⚠ Yalnız `PATH` geçiliyordu ve `candidatesFor` anahtarları göremiyordu: kasada
  // duran bir anahtarla bile her sağlayıcı "yerel önkoşul sağlanmadı" diye eleniyordu
  // (D-237'nin `uret.mjs` tarafındaki ikizi).
  env: SAGLAYICI_ORTAMI,
  pricing,
})
if (!planSonuc.ok) {
  // **Dondurulamayan plan çalıştırılmaz.** Donmuş plan olmadan üretilen bir varlık
  // denetlenemez: hangi karara onay verildiği hiçbir yerde yazmaz (§13). Sessizce
  // devam etmek, `rerun` düğmesinin bir daha asla çalışmaması demekti.
  console.log(`✗ plan dondurulamadı: ${planSonuc.errors.map((e) => e.kind).join(', ')}`)
  process.exit(1)
}
// **`rerun` KARARI tekrarlar: donmuş plan diskten AYNEN okunur, yeniden kurulmaz.**
// Yeniden kursaydık `rerun` ile `replay` aynı şey olurdu ve ekrandaki iki düğme
// kullanıcıya yalan söylerdi (FAZ-4.15).
//
// Bayatlık ENGEL değil BİLGİDİR (R-07): dünya değiştiyse çalıştırma yine donmuş
// planla koşar; fark Run History ekranında zaten gösteriliyor.
const { readFrozenPlan } = await import(join(REPO, 'packages/engine/dist/index.js'))
const kaynakPlan = rerunRunId === undefined ? null : readFrozenPlan(REPO, rerunRunId)
if (rerunRunId !== undefined && kaynakPlan === null) {
  console.log(`✗ rerun yapılamaz: ${rerunRunId} çalıştırmasının donmuş planı diskte YOK`)
  console.log('    Bu çalıştırmanın KARARI kaydedilmemiş — yalnız `--replay` mümkün.')
  process.exit(1)
}

const donmusPlan =
  kaynakPlan ??
  freezePlan({
    report: planSonuc.report,
    runId,
    corpusCommit: oncekiManifest?.corpusCommit ?? bilgiSha,
    registryCommit: oncekiManifest?.registryCommit ?? bilgiSha,
    frozenAt: clock.nowIso(),
    // Bağlama giren kayıtlar da donar: seçim yeniden sorgulanmaz (R-07).
    recordIds: bagamManifesti.map((e) => e.recordId),
    descriptorDigests: descriptorDigests(
      join(REPO, 'registry/providers'),
      descriptors.map((d) => d.id)
    ),
  })

// **Onaylanan özet ile koşan özet FARKLIYSA çalıştırma DURUR** (R-07).
// Uyarıp devam etmek, kullanıcının onaylamadığı bir plana para harcamaktır — ve fark
// ancak fatura gelince görülürdü.
if (beklenenDigest !== undefined && beklenenDigest !== donmusPlan.digest) {
  console.log('✗ plan DEĞİŞTİ — onayladığınız plan artık geçerli değil (R-07)')
  console.log(`    onaylanan: ${beklenenDigest}`)
  console.log(`    şimdiki  : ${donmusPlan.digest}`)
  console.log('    Planı yeniden inceleyin: registry ya da fiyat güncellenmiş olabilir.')
  process.exit(1)
}

// ── çalıştırma parametreleri: TEK kaynaktan (R-07 · D-191 · D-308) ─────────
//
// ⚠ ⚠ `son_kullanilan` ve `kacinilacak` burada hesaplanıyordu; sunucunun launcher'ı
// hesaplamıyordu ve panelden başlatılan HER koşu R-07 kapısında "plan DEĞİŞTİ" ile
// ölüyordu — panel bir özete onay alıyor, CLI başkasını hesaplıyordu. Hesap
// `kosuParametreleri`ne taşındı; iki çağıran da oradan okuyor.
// ⚠ ⚠ **SÜRDÜRME PARAMETRELERİ ARGV'DEN TÜRETİLEMEZ.** R-07 "tüm parametreler donar"
// diyor ama parametreler hiçbir yere YAZILMIYORDU. Sonuç ölçüldü: insan
// `metin-onayi`ni onayladı, sunucu `just uret <hat> --devam <id>` çalıştırdı — komut
// satırında `--konu-sec` yok, `konu_adaylari` geçmiyor, `konu-sec` adımı "prompt-yok"
// diye ATLANIYOR ve `bilgi-sec` `MISSING_TOPIC` ile düşüyor. Kapıyı onaylamak koşuyu
// öldürüyordu.
//
// Aynı sorunun sessiz hâli: `son_kullanilan` ve `kacinilacak` sürdürmede BUGÜNÜN
// geçmişinden yeniden hesaplanıyordu — yani sürdürülen koşu, dondurulmuş plandan
// farklı bir dünyada koşuyordu (D-308'in tam tersi).
//
// Parametreler artık koşunun kendi defterine yazılıyor ve sürdürmede ORADAN okunuyor.
const PARAM_DOSYASI = join(cikti, 'kosu-parametreleri.json')
const kaynakKosu = devamRunId ?? rerunRunId ?? replayRunId
const KOSU_PARAMLARI = (() => {
  if (kaynakKosu !== undefined) {
    const yol = join(REPO, RUNS_DIR, kaynakKosu, 'kosu-parametreleri.json')
    if (existsSync(yol)) {
      const p = JSON.parse(readFileSync(yol, 'utf8'))
      // ⚠ ⚠ **EKSİK KAYIT KENDİNİ İYİLEŞTİRİYOR.** Konusuz bir koşuda `konu_adaylari`
      // yoksa `konu-sec` "prompt-yok" diye atlanır ve `bilgi-sec` `MISSING_TOPIC` ile
      // düşer — yani eksik bir kayıt, koşuyu sessizce öldürür. Ölçüldü: hatalı yazılmış
      // tek bir kayıt sonraki HER sürdürmeyi zehirledi.
      const konusuz = typeof p.topic !== 'string' || p.topic.trim() === ''
      if (konusuz && p.konu_adaylari === undefined) {
        console.log(`  ⚠ kayıtta aday konu listesi yok — yeniden hesaplanıyor`)
      } else {
        console.log(`  parametreler kaynak koşudan okundu (${Object.keys(p).length} alan)`)
        return p
      }
    } else {
      // ⚠ Eski koşularda dosya yok: yeniden hesaplanıyor ama SESSİZ DEĞİL — bu koşu
      // dondurulmuş parametrelerle değil bugünün dünyasıyla sürüyor.
      console.log(`  ⚠ kaynak koşuda parametre kaydı yok — bugünün değerleriyle hesaplanıyor`)
    }
  }
  const p = kosuParametreleri({
    repoRoot: REPO,
    brandId: MARKA,
    konu: devamKonu ?? kaynakKonu ?? konu,
    serbest: {
      ...serbestParam,
      // ⚠ ⚠ **KONUSUZ BAŞLATMA: adaylar burada hesaplanır, konu HATTIN İÇİNDE seçilir.**
      // Deterministik "ilk başlık" yaklaşımı denendi ve her koşuda aynı konuyu verdi
      // (depo sahibi ilk denemede yakaladı). Seçim modele ait; liste kayıtlara ait.
      // ⚠ Sürdürmede bayrak YOK ama gerçek var: konusu KAYITLI OLMAYAN bir koşu,
      // konusunu zincirden almış bir koşudur. Bayrağa bakmak, komut satırını
      // gerçeğin üstüne koymak olurdu — ve tam bu yüzden onaylanan koşu ölüyordu.
      ...((KONU_SEC || kaynakKosu !== undefined) && (devamKonu ?? kaynakKonu) === null
        ? (() => {
            const adaylar = konuAdaylari({
              db: corpusDb,
              query: { brandId: MARKA, eraId: AKTIF_DONEM, asOf: clock.nowIso() },
              repoRoot: REPO,
            })
            if (adaylar.length === 0) {
              console.log('✗ konu seçilemez: geçmişte işlenmemiş aday kayıt kalmadı.')
              console.log('    Yeni bir corpus kaydı ekle ya da konuyu elle yaz.')
              process.exit(1)
            }
            console.log(`  konu seçimi hatta bırakıldı — ${adaylar.length} aday`)
            return {
              konu_adaylari: JSON.stringify(adaylar),
              islenmis_konu_sayisi: String(islenmisKonular(REPO).size),
            }
          })()
        : {}),
    },
  })
  return p
})()
if (KOSU_PARAMLARI.kacinilacak !== undefined) {
  console.log(`  geçmiş red gerekçeleri negatif kısıt olarak enjekte ediliyor`)
}
// ⚠ ⚠ **YALNIZ TAZE KOŞUDA YAZILIYOR.** Sürdürme kaydı EZMEZ: ezseydi bir sürdürmenin
// eksik parametreleri koşunun doğduğu andaki gerçeğin üstüne yazılırdı — ve tam bu
// oldu: hatalı yazılmış tek bir kayıt sonraki her sürdürmeyi zehirledi. Donmuş bir
// kayıt, ancak yazıldığı an doğruysa bir kayıttır.
// Defterin parçası: `derived/runs/` türetilmiş DEĞİLDİR ve silinmez (Yasa 11).
if (kaynakKosu === undefined) {
  mkdirSync(cikti, { recursive: true })
  writeFileSync(PARAM_DOSYASI, `${JSON.stringify(KOSU_PARAMLARI, null, 2)}\n`, 'utf8')
}

const rapor = await runPipeline({
  frozen: donmusPlan,
  repoRoot: REPO,
  pipeline: cozum.value,
  runId,
  brandId: MARKA,
  eraId: AKTIF_DONEM,
  // **Bilgi ağacı commit SHA'sı — replay'i GERÇEK yapan alan** (§13).
  // İlk hâli `'worktree'` sabitiydi: `knowledgeCommit()` yazılmıştı ama sıfır çağıranı
  // vardı ve 11 manifest'in hepsinde alan sahteydi (D-138). Artık git'ten okunuyor;
  // okunamazsa çalıştırma DURUR — sahte bir SHA, replay'in yalan söylemesidir.
  // Devam ediyorsa DONMUŞ SHA; yoksa bugünün ağacı. Yeniden çözmek, aynı çalıştırmayı
  // farklı bir bilgi ağacında koşturmak olurdu (R-07).
  corpusCommit: oncekiManifest?.corpusCommit ?? bilgiSha,
  registryCommit: oncekiManifest?.registryCommit ?? bilgiSha,
  verbs: {
    RESOLVE: resolveBody,
    SELECT: selectBody({ select: secici }),
    // Deck IR'ı **CLI okur**, gövde değil: `COMPOSE` saf (§3.10). IR verilmediyse
    // metin üretiminden gelen satırlar kullanılır — eski davranış aynen duruyor.
    COMPOSE: composeBody({
      tokenCss,
      fontCss: markaFontCss,
      ...(markaLogo === undefined ? {} : { logo: markaLogo }),
      stamp: damga,
      ...(irBelge === null ? {} : { ir: irBelge }),
    }),
    RENDER: renderBody({
      outDir: cikti,
      // ⚠ `null` = düzeni İÇERİKTEN seç (FAZ-10.4). Önceden sabit `'statement'`ti ve
      // dört düzenden üçü hiç kullanılmıyordu: altı maddelik bir liste, `statement`ın
      // iki bloklu bütçesiyle üç slayda bölünüyordu — içerik bunu istemediği hâlde.
      layout: null,
      kulp: '@upcytech',
      // Sınır YERLEŞİMDEN gelir (§9.1): LinkedIn 5MB, Instagram 8MB.
      maxBytes: (
        placementById(id.startsWith('linkedin') ? 'linkedin-feed-4x5' : 'instagram-feed-4x5') ?? {
          maxBytes: 8 * 1024 * 1024,
        }
      ).maxBytes,
    }),
    VALIDATE: validateBody({ lint: lexiconDenetimi, check: kaliteKontrol }),
    GENERATE: generate,
    // ⚠ FAZ 6 denetimi: `INGEST` fiil haritasında HİÇ YOKTU — şelale, karantina ve
    // enjeksiyon sınırı yazılmıştı ama hattaki `arastir` adımı çalıştırılamıyordu.
    // Ortam AÇIK LİSTEYLE okunuyor (`secret-okuyucu` darboğazı): `process.env`i
    // olduğu gibi geçirmek, "hangi değişken gerekiyor" sorusunu grep'le
    // cevaplanamaz hâle getirirdi — ve bir ay ihmalden sonra sistemi başlatamamanın
    // en sık sebebi tam olarak budur.
    // Onay adımı: insan kapıyı geçtiyse SONUCU deftere geçirir. Corpus'a YAZMAZ —
    // yazma darboğazı ayrı ve onay kuyruğu oradan geçiyor (R-14).
    PROPOSE: proposeBody({ repoRoot: REPO }),
    // ⚠ FAZ 7 denetimi: `PUBLISH` de fiil haritasında HİÇ YOKTU — `INGEST`in birebir
    // tekrarı (D-216). Kapılar, sıra, defter ve limiter yazılmıştı; gövdesi ve haritada
    // anahtarı olmadığı için `publish()`in tek çağıranı testlerdi.
    //
    // `upload` ve `publishingLimit` VERİLMİYOR: gerçek kanal bağlantısı `7.2b`de ve
    // insan girdisi bekliyor. Gövde bu durumda AÇIKÇA duruyor (`CHANNEL_NOT_CONNECTED`);
    // sahte bir yükleyici koymak, defterde olmayan bir yayın üretirdi.
    PUBLISH: publishBody({
      repoRoot: REPO,
      limiter: oranKovasi,
      tokenKaydi: tokenKaydiOku,
    }),
    INGEST: ingestBody({
      repoRoot: REPO,
      env: {
        BRIGHTDATA_API_KEY: readEnv('BRIGHTDATA_API_KEY'),
        TAVILY_API_KEY: readEnv('TAVILY_API_KEY'),
        IHALE_MCP_URL: readEnv('IHALE_MCP_URL'),
        BORSA_MCP_URL: readEnv('BORSA_MCP_URL'),
      },
    }),
  },
  pricing,
  candidatesFor,
  env: SAGLAYICI_ORTAMI,
  // Konu bir ÇALIŞTIRMA parametresi, pipeline kısıtı değil: her konu için ayrı bir
  // YAML yazmak saçma olurdu. Pipeline kısıtı her zaman kazanır (R-20 ezilemez).
  // ⚠ ⚠ **GEÇMİŞ PLANA DONUYOR, çalışma anında okunmuyor.** Şablon çeşitliliği
  // (D-308) son koşularda kullanılanları eliyor; o listeyi seçim anında diskten
  // okumak, aynı planın iki farklı zamanda FARKLI şablon seçmesi demekti ve
  // replay'i (R-07) bozardı. Plan neyi gördüyse onu saklıyor.
  params: KOSU_PARAMLARI,
  // Kararlar manifest'ten OKUNUR; motor yalnız yazılmış olanı görür.
  decisions: kararlar,
  // **Bağlam manifesti** (§5.3): hangi kayıt enjekte edildi, hangisi bütçeye sığmadı.
  // İlk sürümde `context: []` sabit koduydu ve "bu çıktı neden böyle" sorusunun cevabı
  // hiçbir yerde yoktu (D-146).
  context: bagamManifesti,
  previous: oncekiManifest,
  // Tavan DÜŞÜK ve ZORUNLU: tavansız çalıştırmak, gözetimsiz bir gecede tavanın
  // olmadığını öğrenmektir.
  caps: BUTCE,
  db,
  clock,
  rng: seededRng(1),
  limiter: oranKovasi,
  sleep: async () => undefined,
  // ⚠ İz stdout'a: sunucu alt sürecin stdout'unu canlı olarak koşu günlüğüne
  // akıtıyor, yani panelde de görünüyor. Tek satır, tek yön.
  // ⚠ SAAT iz satırında: canlı günlükte "hangi adım ne kadar sürdü" ancak zaman
  // varsa okunur ve manifest yalnız koşu BİTİNCE yazılıyor. Saat tek yerden
  // (`clock`, §13) — `new Date()` ikinci bir saat olurdu.
  iz: (satir) => console.log(`  ${clock.nowIso().slice(11, 19)}  ${satir}`),
})

// ── damga + CAS: zincirin son halkası ───────────────────────────────────────
// Render edilen slaytlar damgalanmadan ve içerik-adresli depoya alınmadan varlık
// SAYILMAZ: `compliance` kapısı damgasız bir PNG'yi reddediyor (R-33) ve damga
// üretim ANINDA basılmalı — sonradan retrofit imkânsız (R-11).
const slaytlar = rapor.outputs['render']?.slides ?? []
const depolanan = []
if (slaytlar.length > 0) {
  // ⚠ **`aiGenerated` eskiden SABİT `false` idi** ve yanındaki yorum "bu hatta görsel
  // model çağrısı YOK" diyordu. FAZ 8'de eklenen `ad-creative-set` hattı
  // `capability: image.generate` taşıyor — yorum yanlış oldu, kimse fark etmedi ve üç
  // katman aşağıda EU AI Act Md. 50 ifşa kapısı sessizce kapandı (D-232). Karar artık
  // hattan okunuyor ve `uyum-kapsami.test.ts` gerçek hat dosyalarına karşı ölçüyor.
  const kapsam = uyumKapsami(cozum.value)
  // ⚠ ⚠ **HAT NE YAPABİLİR ≠ KOŞU NE YAPTI.** Ölçülen koşu: `akan-alan` seçildi, o
  // şablonun görsel yuvası yok, `gorsel-uret` ATLANDI — kreatifte tek bir model
  // görseli yok. Yine de `aiGenerated: true` yazılıyor, ifşa isteniyor, görünür ifşa
  // bulunamıyor (aranacak görsel yok) ve SIFIR KUSURLU bir karosel yayınlanamaz
  // oluyordu. Karar artık defterden: adım `ok` mu, `skipped` mi.
  const adimDurumlari = Object.fromEntries(
    (rapor.manifest.steps ?? []).map((s) => [s.stepId, s.status])
  )
  const gercektenGorsel = kosudaGorselUretildi(kapsam, adimDurumlari)
  if (kapsam.aiGenerated && !gercektenGorsel) {
    console.log('  ⓘ hat görsel üretebiliyor ama bu koşuda üretmedi — AI ifşası GEREKMİYOR')
  }
  const zincirKonusu = rapor.outputs['konu-sec']?.konu
  const etkinKonu =
    devamKonu ??
    kaynakKonu ??
    (konu !== '' ? konu : typeof zincirKonusu === 'string' ? zincirKonusu : '')
  const iddia = assertCompliance({
    // Özet `assertCompliance` tarafından TARANAN prompt'tan hesaplanır; buradaki
    // değer yok sayılır (D-143). Yer tutucu bırakmak, iddianın kendi dayanağını
    // yazdığı izlenimini verirdi.
    basis: { kind: 'prompt_forbids_people', promptDigest: '' },
    aiGenerated: gercektenGorsel,
    // ⚠ ⚠ **KONU ZİNCİRDEN DE GELEBİLİR ve gelmediğinde uyum iddiası ÇÖKÜYORDU.**
    // Konusuz başlatmada CLI konusu boş; gerçek konu `konu-sec` adımının çıktısında.
    // Boş bir istem taranınca `assertCompliance` — doğru biçimde — `basis_missing`
    // diyor ve koşu 21 adım sonra, dört görsel üretildikten ve render bittikten SONRA
    // düşüyordu. Ölçüldü: `✗ uyum iddiası kurulamadı: {"refusal":{"kind":
    // "basis_missing"}}`. İddia neyi ürettiğimize bakmalı, komut satırına değil.
    prompt: taranacakPrompt(kapsam, etkinKonu),
    correlationId: `cor_${runId}`,
  })
  if (!iddia.ok) {
    console.log(`✗ uyum iddiası kurulamadı: ${JSON.stringify(iddia.error.details)}`)
    process.exit(1)
  }
  // ── teslimat kimliği (§3.5 · D-248) ──────────────────────────────────────
  //
  // **Sıra ve rol damgaya ÜRETİM ANINDA giriyor.** Onlarsız dört slaytlık bir postun
  // hangisinin kapak olduğu bir daha bilinemez ve retrofit imkânsız (7. yasa, R-11).
  // Yüzlerce varlık biriktiğinde sorun "yer yok" değil, **"hangisi neydi"** olur.
  //
  // `deliverableId` çalıştırma id'sinden TÜRETİLİYOR ama ona EŞİT değil: tek koşu
  // birden çok teslimat üretebilir (reklam matrisi yedi varyant) ve o gün bu satır
  // varyant koordinatını da taşıyacak.
  const teslimatId = `dlv_${runId.slice(4)}`
  const rol = (i, n) => (n === 1 ? 'tek' : i === 0 ? 'kapak' : i === n - 1 ? 'kapanis' : 'govde')

  for (const [sira, yol] of slaytlar.entries()) {
    const d = stampAsset(yol, { stamp: damga, claim: iddia.value })
    if (!d.ok) {
      console.log(`✗ damgalanamadı: ${yol} (${d.error})`)
      process.exit(1)
    }
    const b = storeBlob({
      deliverable: {
        deliverableId: teslimatId,
        kind: cozum.value.ciktiSinifi === 'reklam' ? 'ad-variant' : 'post',
        index: sira,
        total: slaytlar.length,
        role: rol(sira, slaytlar.length),
      },
      sourcePath: yol,
      blobRoot: join(REPO, 'derived/blobs'),
      stamp: damga,
      // ⚠ ⚠ **İFŞA KANITI SIDECAR'A GİRİYOR ve girmediği için 130 varlığın 130'u
      // "yayınlanamaz" görünüyordu.** `publish.ts` iki şey arıyor: makine-okunur
      // damga (`stamped` — `stampPng` az önce bastı, bu bir OLGU) ve kreatifin
      // üstünde görünür ifşa (`visibleDisclosure` — render DOM'da ÖLÇTÜ).
      // İkisi de burada iddia edilmiyor, kaydediliyor.
      compliance: {
        ...iddia.value,
        stamped: true,
        visibleDisclosure: rapor.outputs['render']?.ifsaGorunur === true,
      },
      sourceRunId: runId,
      createdAt: clock.nowIso(),
    })
    if (!b.ok) {
      console.log(`✗ depoya alınamadı: ${yol} (${b.error})`)
      process.exit(1)
    }
    depolanan.push(b.ref)
  }
}

console.log(formatRun(rapor))
if (depolanan.length > 0) {
  console.log('')
  console.log(`  ${depolanan.length} varlık damgalandı ve depoya alındı:`)
  for (const d of depolanan) console.log(`    ${d.digest.slice(0, 19)}…  ${d.bytes} bayt`)
}
console.log('')
// ⚠ ⚠ **BURASI HER KOŞUDA `undefined` BASIYORDU.** Koruma nesneyi kontrol ediyordu,
// yazdırdığı ALANI değil: `kalite` çıktısının şekli `{gecti, slaytSayisi, kusurSayisi,
// bulgular}` — `qa` diye bir alan YOK, eski bir şekilden kalmış. Sonuç: günlüğün son
// satırı bir kelime, `undefined`. Anlamsız bir son satır, o satıra bakmayı bıraktırır
// ve bakılmayan yer bu depoda tam olarak hataların saklandığı yer.
{
  const k = rapor.outputs['kalite']
  if (k !== undefined && k !== null) {
    console.log(
      typeof k.qa === 'string'
        ? k.qa
        : `  kalite: ${k.gecti === true ? 'geçti' : 'KALDI'} · ${k.slaytSayisi} slayt · ${k.kusurSayisi} kusur`
    )
  }
}
process.exit(rapor.errors.length > 0 && rapor.awaitingGate === null ? 1 : 0)
