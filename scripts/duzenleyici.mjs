// Görsel şablon düzenleyici — PROTOTİP (D-301 · FAZ-15).
//
// ⚠ ⚠ **AYNI RENDER MOTORU, İKİNCİ BİR ÖNİZLEME DEĞİL.** Sayfa `panoramaHtml(doc)`
// çıktısını olduğu gibi bir iframe'e koyuyor. Böylece "gördüğün şey ihraç edilen şeydir"
// yapı gereği doğru — ayrı bir önizleme yolu yazsaydık iki motor olurdu (Yasa 4) ve
// ikisi bir gün ayrışırdı. Düzenleme, render'ın ÜSTÜNDE bir katman; render'ın içinde değil.
//
// ⚠ **Serbest piksel boyama YOK ve olmayacak.** Düzenlenen şey `KatalogOrnegi`nin
// ALANLARI; çıktı hâlâ veriden yeniden üretilebilir (Yasa 11). Fırça/leke isteniyorsa
// yolu dışa aktar → Photoshop → varlık olarak geri ver.
//
// ⚠ Bağımlılık yok: `node:http` + tarayıcı. Bir editör çatısı eklemek, düzenlediğimiz
// tasarımdan büyük bir bağımlılık olurdu.

import { createServer } from 'node:http'
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const REPO = join(dirname(fileURLToPath(import.meta.url)), '..')
const {
  aksanAlaniOlcumu,
  knockoutOlcumu,
  metinMaskesi,
  okNisaniOlcumu,
  panoramaHtml,
  puntoOlcumu,
  renderPanorama,
} = await import(join(REPO, 'packages/render/dist/panorama.js'))
// ⚠ Dışa aktarma AYNI motordan (R-30): editör kendi çıktıcısını yazsaydı panelin
// indirdiğiyle editörün indirdiği iki farklı dosya olurdu.
const { panoramaDisaAktar } = await import(join(REPO, 'packages/render/dist/disa-aktar.js'))
const { ORNEKLER } = await import(join(REPO, 'packages/render/dist/katalog-ornek.js'))
const { fontCss } = await import(join(REPO, 'packages/render/dist/fonts.js'))
// ⚠ Yazma AYNI fonksiyondan geliyor. Editör kendi serileştiricisini yazsaydı iki biçim
// olurdu ve biri gün gelip ötekinden ayrışırdı — hattın yazdığı defteri editör
// okuyamaz hâle gelirdi.
const { panoramaBelgesiniYaz } = await import(join(REPO, 'packages/engine/dist/verbs/bodies.js'))
const { logoVarliklari } = await import(join(REPO, 'packages/render/dist/logo.js'))
const { kosuBelgeYolu, kosuBelgesiniOku } = await import(
  join(REPO, 'packages/render/dist/kosu-belgesi.js')
)
// ⚠ ⚠ **EDİTÖRDEN GÖRSEL ÜRETME — sağlayıcı köprüsü HATTIN KULLANDIĞIYLA AYNI.** Depo
// sahibi: *"editörde modele prompt gönderip görsel üretme olmalı, beğenmediğimizi silip
// yerine kendimiz ürettirebiliriz."* İkinci bir çağrı yolu yazmak, R-20 muhafızının ve
// şerit kurallarının atlandığı bir arka kapı açardı.
const { adapterById, loadDescriptors, saglayiciOrtami } = await import(
  join(REPO, 'packages/providers/dist/index.js')
)
const { readEnv } = await import(join(REPO, 'packages/kernel/dist/index.js'))
// ⚠ ⚠ **WEBDEN TASARIM ÖGESİ ARAMA — HATTA DEĞİL, EDİTÖRE.** Depo sahibi: *"üretim
// hattında otomatik olmayacak yani bir görsel yuvasına tıklayıp webden ara denip
// aranabilecek"*. Hat deterministik kalıyor; dış kaynak yalnız insanın tıkladığı anda
// giriyor. Gerekçenin tamamı modülün başında.
const webAra = await import(join(REPO, 'scripts/duzenleyici-web-ara.mjs'))
// ⚠ Chromium TEK yerden açılıyor (`chokepoints.json` → `chromium-baslatan`): rasterleme
// `withPage`i ödünç alıyor, kendi `chromium.launch()`unu YAZMIYOR (R-30).
const { withPage } = await import(join(REPO, 'packages/render/dist/browser.js'))
// ⚠ Yuva → slayt eşlemesi geometrinin yanında (`panorama-denetim.ts`): editör kendi
// hesabını yapsaydı hat ile ayrışırdı ve iki taraf farklı slaydın metnini gönderirdi.
const { gorselinKarti } = await import(join(REPO, 'packages/render/dist/panorama-denetim.js'))
// ⚠ ⚠ **EDİTÖRDE KAYDEDİLEN SLAYT DEPOYA GİRMİYORDU ve yapılan iş yayına ULAŞMIYORDU.**
// Depo sahibi: *"editörde düzenleyince artık eskisi görünmemeli yenisi görünmeli sadece
// çünkü eskisi ile sürekli karışıyor. mesela düzenlenmiş halini yayına alamıyorum
// önizlemede de eskisi görünüyor."* Sebep tekti: `/kaydet` yalnız `panorama-elle.json`
// ve `slayt-NN-elle.png` yazıyordu; kütüphane, yayın önizlemesi ve yayın paketi ise
// içerik-adresli DEPOYU okuyor. Diskteki dosya vardı, okuyan yoktu.
//
// ⚠ ⚠ **DAMGA VE İDDİA UYDURULMUYOR.** Yeni bayt yeni bir varlıktır; damgasını üretim
// anında alması gerekiyor (7. yasa) ve uyum iddiası da o anda KURULUYOR — kopyalanmıyor.
// Dayanak `human_reviewed`: bu görsele bir insan bakarak kaydetti, hattın istemi değil.
const { assertCompliance, ifsaGorunurMu, stampAsset } = await import(
  join(REPO, 'packages/render/dist/index.js')
)
const {
  duzMetin,
  gorselBriefIstemi,
  kosuSablonu: kosuKimligiOku,
  kosununBloblari,
  storeBlob,
  varyantEki,
} = await import(join(REPO, 'packages/engine/dist/index.js'))
// ⚠ Saat TEK yerden (`chokepoints.json` → `saat`): editör `new Date()` çağırsaydı
// darboğaz kapısı haklı olarak kırmızıya dönerdi ve defterler yeniden oynatılamazdı.
const { systemClock } = await import(join(REPO, 'packages/kernel/dist/index.js'))
const { descriptors: TANIMLAYICILAR } = loadDescriptors(join(REPO, 'registry/providers'))
// ⚠ `CLAUDE_CODE_BIN` de kapsamda: boş yuva doldurma brief'i METİN sağlayıcısından
// alıyor (hattaki `gorsel-brief` adımının aynısı) ve o adaptör ikilinin yolunu ortamdan
// okuyor. Listede olmayan bir anahtar, adaptöre HİÇ ulaşmıyor.
// ⚠ Yardımcı değişkenler (`CF_ACCOUNT_ID`, `CF_HESAPLAR`, `CLAUDE_CODE_BIN`) artık
// `saglayiciOrtami`nın içinde beyan ediliyor — altı çağıran onları elle sayıyordu.
const SAGLAYICI_ORTAMI = saglayiciOrtami(TANIMLAYICILAR, readEnv)

const f = fontCss(join(REPO, 'brand/brd_upcytech/fonts'))
const tokenCss = readFileSync(join(REPO, 'brand/brd_upcytech/derived-tokens/tokens.css'), 'utf8')
const lg = logoVarliklari(join(REPO, 'brand/brd_upcytech/logo'))
const stamp = {
  brandId: 'brd_upcytech',
  eraId: 'era_imalat_2026',
  kitVersion: 'kit-1',
  definitionDigest: 'sha256:duzenleyici',
  contextManifest: 'ctx',
  sourceRunId: 'run_duzenleyici',
}

/**
 * Düzenlemeyi YAPAN insan — uyum iddiasının `human_reviewed` dayanağı için.
 *
 * ⚠ ⚠ **İSİMSİZ ONAY ONAY DEĞİLDİR** (`claim.ts`: `reviewer_unnamed`). Denetimde
 * *"kim baktı"* sorusunun bir cevabı olmalı; `"editör"` yazmak o soruyu cevaplamıyor,
 * geçiştiriyor. Kimlik `.git/config`ten okunuyor: commit'leri imzalayan kim ise
 * düzenlemeyi de o yapıyor ve ikinci bir kimlik alanı icat etmeye gerek yok.
 *
 * ⚠ Dosya OKUNUYOR, `git` ÇAĞRILMIYOR: `git-cagiran` darboğazı (§3.8) tek bir git
 * çağrı noktası tanıyor ve editör orası değil.
 *
 * ⚠ Kimlik YOKSA `null` — ve o hâlde damgalama HİÇ yapılmıyor. Uydurma bir isimle
 * kurulan iddia, iddianın kendisini değersizleştirirdi.
 */
const duzenleyenInsan = () => {
  try {
    const cfg = readFileSync(join(REPO, '.git/config'), 'utf8')
    const ad = /^\s*name\s*=\s*(.+)$/m.exec(cfg.split('[user]')[1] ?? '')?.[1]?.trim()
    return ad === undefined || ad === '' ? null : ad
  } catch {
    return null
  }
}

/**
 * Düzenlenmiş slaytları DEPOYA alır — eskisini emekli ederek (D-301 · Yasa 10).
 *
 * ⚠ ⚠ **YALNIZ VAR OLAN BİR YUVAYI DOLDURUYOR.** Teslimat kimliği burada
 * UYDURULMUYOR: koşunun mevcut varlıklarının damgasından okunuyor. `dlv_` kuralını
 * ikinci kez yazmak, kural değişince editörün sessizce ayrı bir teslimat üretmesi
 * demekti. Koşunun damgalı varlığı yoksa hiçbir şey saklanmıyor ve bu SÖYLENİYOR —
 * sessizce geçmek, "kaydettim ama yayına giremezsin"i gizlemek olurdu.
 *
 * ⚠ ⚠ **KAYNAK DOSYA KOPYALANIYOR, TAŞINMIYOR.** `storeBlob` kaynağı `rename` ile
 * TAŞIYOR (içerik-adresli depoda atomiklik için). Doğrudan `slayt-NN-elle.png`
 * verilseydi koşu dizinindeki düzenlenmiş PNG kaybolurdu — panelin *"elle
 * düzenlenmiş"* bölümü ve editörün kendi önizlemesi boşalırdı.
 *
 * ⚠ ⚠ **İFŞA ÖLÇÜLEREK yazılıyor**, `ifsaGorunurMu` ile — hattın kullandığı AYNI
 * yüklem. Düzenleme sırasında ifşa şeridinin üstü örtülmüş olabilir; onu ölçmeden
 * `visibleDisclosure: true` yazmak, kimsenin bakmadığı bir kutucuğu işaretlemektir.
 */
const slaytlariDepolaVeEmeklet = (dizin, runId, yollar, doc, kusurlar) => {
  const insan = duzenleyenInsan()
  if (insan === null) return { ok: false, sebep: 'git kimliği okunamadı — damgalanmadı' }

  const oncekiler = kosununBloblari(join(REPO, 'derived/blobs'), runId).filter(
    (b) => b.meta.deliverable !== undefined
  )
  if (oncekiler.length === 0)
    return { ok: false, sebep: 'bu koşunun damgalı varlığı yok — emekli edilecek sürüm bulunamadı' }

  // Yuva başına EN YENİ sürüm: koşu daha önce de düzenlenmişse yeni sürüm sonuncunun
  // üstüne biner, ilkinin üstüne değil.
  const yuva = new Map()
  for (const b of oncekiler) {
    const i = b.meta.deliverable.index
    const v = yuva.get(i)
    if (v === undefined || v.meta.createdAt < b.meta.createdAt) yuva.set(i, b)
  }

  const simdi = systemClock.nowIso()
  const ifsa = ifsaGorunurMu(doc.aiIfsasi === true, kusurlar)
  const gecici = join(REPO, 'derived/duzenleyici-gecici')
  mkdirSync(gecici, { recursive: true })

  const saklanan = []
  const atlanan = []
  for (const [sira, yol] of yollar.entries()) {
    const onceki = yuva.get(sira)
    if (onceki === undefined) {
      atlanan.push(sira + 1)
      continue
    }
    const iddia = assertCompliance({
      basis: { kind: 'human_reviewed', reviewer: insan, reviewedAt: simdi },
      // ⚠ Görselin AI üretimi olup olmadığı ÖNCEKİ varlıktan geliyor: düzenleme
      // kompozisyonu değiştiriyor, görselin kaynağını değil.
      aiGenerated: onceki.meta.compliance?.aiGenerated === true,
    })
    if (!iddia.ok) {
      atlanan.push(sira + 1)
      continue
    }
    const kopya = join(gecici, 'slayt-' + String(sira + 1).padStart(2, '0') + '.png')
    copyFileSync(yol, kopya)
    const d = stampAsset(kopya, { stamp: onceki.meta.stamp, claim: iddia.value })
    if (!d.ok) {
      rmSync(kopya, { force: true })
      atlanan.push(sira + 1)
      continue
    }
    const b = storeBlob({
      deliverable: onceki.meta.deliverable,
      sourcePath: kopya,
      blobRoot: join(REPO, 'derived/blobs'),
      stamp: onceki.meta.stamp,
      compliance: {
        ...iddia.value,
        stamped: true,
        visibleDisclosure: ifsa,
        // ⚠ Soy kütüğü YAZILI: bu bayt neyin yerine geçti ve nasıl doğdu. Emeklilik
        // bir silme değil, bir SIRALAMA (Yasa 10) — ve sıra okunabilir olmalı.
        elleDuzenlendi: true,
        oncekiDigest: onceki.meta.digest,
      },
      sourceRunId: runId,
      createdAt: simdi,
    })
    // ⚠ ⚠ **KOPYA HER HÂLDE SİLİNİYOR — ve ilk sürüm bunu KAÇIRDI.** `storeBlob`
    // kaynağı yalnız blob YENİYSE taşıyor; aynı bayt ikinci kez geldiğinde (değişmemiş
    // bir slaydı yeniden kaydetmek) dosya olduğu yerde KALIYOR. İlk denemede geçici
    // dizinde 5 MB birikti ve `git status`ta göründü — sessizce büyüyen bir çöp.
    rmSync(kopya, { force: true })
    if (b.ok) saklanan.push({ sira: sira + 1, digest: b.ref.digest, ayni: b.deduplicated })
    else atlanan.push(sira + 1)
  }
  // ⚠ Dizin de kalkıyor: boş bir dizin bırakmak, bir dahaki `git status`ta aynı soruyu
  // sordurur. Depo temiz kalmalı (repo-hygiene kapısı).
  rmSync(gecici, { recursive: true, force: true })

  // ── EDİTÖR BASKINDIR: bu kayıt karoselin ŞU ANKİ hâlini İLAN EDİYOR ────────
  //
  // ⚠ ⚠ **BU DOSYA BİR KUSURDAN DOĞDU ve kusuru depo sahibi gördü:** *"editörde 3.
  // yuvayı sildim, json yazdırdım, güncellendi — ama panelde hâlâ eskisi var. Editör
  // her zaman baskın gelmeli!!"* Sebep ölçüldü: güncellik blob'un `createdAt`inden
  // okunuyordu ve `storeBlob` AYNI BAYT ikinci kez geldiğinde sidecar'ı EZMİYOR (doğru
  // davranış — para ilk üretimde harcandı). Bir slaydı önceki hâline geri döndürünce
  // bayt eskiden var olan bir blob'a eşitleniyor, `createdAt` 12:28'de kalıyor ve
  // 14:35'teki ARA sürüm "en yeni" görünüp ekranda kalıyordu.
  //
  // ⚠ ⚠ **ZAMAN DAMGASI GÜNCELLİĞİN VEKİLİYDİ; ARTIK BEYAN VAR.** Hangi baytların
  // karoseli oluşturduğunu tahmin etmeye gerek yok: EDİTÖR BİLİYOR ve yazıyor. Vekil
  // bir ölçü, bir gün vekillik ettiği şeyden ayrışır — burada ayrıştı.
  //
  // ⚠ Emeklilik hâlâ SİLME DEĞİL (Yasa 10): eski baytlar diskte, sidecar'ları yerinde.
  try {
    writeFileSync(
      join(dizin, 'slaytlar.json'),
      JSON.stringify(
        {
          at: simdi,
          kaynak: 'editor',
          slaytlar: saklanan.map((x) => ({ sira: x.sira - 1, digest: x.digest })),
        },
        null,
        2
      ) + '\n'
    )
  } catch {
    // ⚠ Yazılamazsa SESSİZ kalmıyor: çağıran `beyanYazildi: false` görüyor ve
    // güncellik eski (zaman damgalı) kurala düşüyor — yanlış ama görünür.
    return { ok: true, saklanan, atlanan, ifsa, insan, beyanYazildi: false }
  }
  return { ok: true, saklanan, atlanan, ifsa, insan, beyanYazildi: true }
}

/**
 * Koşunun ÜRETİM KİMLİĞİ — brief kurmak için gereken üç şey, kendi defterinden.
 *
 * ⚠ Üçü de ADIM ÇIKTISINDAN okunuyor, koşu parametresinden değil: parametre `sablon`
 * alanını ancak panel/CLI yazdıysa taşıyor ve bu tam olarak bir kez yanlış rapora yol
 * açtı (`kosuSablonu`nun yorumunda yazılı).
 */
const kosuKimligi = (runId) => {
  // ⚠ ⚠ **BU FONKSİYONUN İLK HÂLİ KENDİ OKUYUCUSUNU YAZIYORDU ve ilk gerçek koşuda
  // ayrıştı:** konuyu yalnız `konu-sec` adımından okuyordu, o adım konu verilmiş
  // koşularda ATLANIYOR ve gerçek konu `kosu-parametreleri.json`da duruyor. Editör
  // *"bu koşunun konusu defterinde yok"* dedi — oysa vardı. Aynı sorunun cevabı
  // `@suite/engine`de zaten yazılıydı; kopya yerine o çağrılıyor.
  const k = kosuKimligiOku(REPO, runId)
  return {
    sablonId: k.gercek ?? k.istenen ?? '',
    gorselDili: k.gorselDili ?? '',
    konu: k.konu ?? '',
  }
}

/**
 * Bir yuvanın KAYNAK KÜNYESİNİ siler — görsel artık webden gelmiyorsa.
 *
 * ⚠ ⚠ **BU BİR YANLIŞ ATIF KUSURUYDU ve ilk denemede ÖLÇÜLDÜ.** Webden eklenen görsel
 * yanına `gorsel-NN-elle.kaynak.json` yazıyor (lisans, URL, set). Aynı yuvaya sonradan
 * ÜRETİLEN bir görsel yazılınca künye yerinde kalıyordu: gerçek koşuda üretilmiş bir
 * spektrofotometre, *"A Brouhot car in Paris, 1910 · Public domain"* künyesiyle
 * duruyordu. Kaynaksız iddia yayınlanamaz (Yasa 8) — YANLIŞ kaynaklı iddia daha kötü:
 * denetlenebilir görünür ve denetlenince çöker.
 *
 * ⚠ `/arkaplan-sil` bu fonksiyonu ÇAĞIRMIYOR ve çağırmamalı: arka plan silmek görselin
 * kaynağını değiştirmiyor, yalnız zeminini kaldırıyor.
 */
const kaynakKunyesiniSil = (dizin, sira) => {
  const y = join(dizin, 'gorsel-' + String(sira).padStart(2, '0') + '-elle.kaynak.json')
  if (existsSync(y)) rmSync(y, { force: true })
}

/**
 * Arka planı siler — `/arkaplan-sil` ile AYNI yerel model, tek yerden.
 *
 * ⚠ ⚠ **İKİNCİ BİR TEKNİK EKLENMİYOR.** Bu dosya `/arkaplan-sil`de zaten `rembg`
 * çağırıyordu; boş yuva doldurma da aynı adımı istiyor (hattaki `gorsel-kirp`).
 * Ayrı yazsaydım biri düzeltilir öteki unutulurdu — bu deponun tekrar eden sınıfı.
 *
 * ⚠ Kurulu değilse `null` ve bu SÖYLENİYOR: *"arka plan silinemedi"* ile *"arka plan
 * silmeye gerek yoktu"* ayrı şeyler ve ikincisi bir yalan olurdu (rembg adaptörünün
 * kendi yorumu da aynı cümleyi kuruyor).
 */
/**
 * Bu bayt gerçekten bir GÖRÜNTÜ mü — yuvaya yazmadan önceki son savunma.
 *
 * ⚠ ⚠ **BU KONTROL BİR BOZULMADAN DOĞDU.** Depo sahibinin koşusunda
 * `gorsel-01-elle.png` ve `gorsel-02-elle.png` 286 BAYT çıktı ve içleri şuydu:
 *   `{"errors":[{"message":"AiError: you have used up your daily free allocation of
 *    10,000 neurons…"}],"success":false}`
 * Editör *"✓ yuva dolduruldu"* dedi, dosya adı geldi, ama görsel görünmedi — şikâyet
 * birebir buydu: *"doldu diyor, görsel adı geliyor ama kendisi görünmüyor."*
 *
 * ⚠ Asıl delik adaptördeydi ve orada kapandı (durum kodu + sihirli bayt kontrolü). Bu
 * kontrol İKİNCİ savunma hattı: yuvaya yazan beş ayrı yol var (üret, doldur, koy,
 * ikon-raster, ikon-vektör) ve baytlar arada iki Python betiğinden de geçiyor. Yazma
 * ANINDA bakmak, hangi yoldan gelirse gelsin bozuk baytı yakalar.
 *
 * ⚠ Sihirli baytlar başlıktan güvenilir: `content-type` sağlayıcının İDDİASI, ilk dört
 * bayt OLGU. PNG `89 50 4E 47` · JPEG `FF D8` · WebP `RIFF....WEBP`.
 */
const gorselBaytiMi = (buf) =>
  (buf.length > 8 &&
    ((buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) ||
      (buf[0] === 0xff && buf[1] === 0xd8) ||
      (buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP'))) ||
  false

/**
 * Bir yuvanın görselini HANGİ İSTEM ürettiğini yazar.
 *
 * ⚠ ⚠ **DEPO SAHİBİ: *"yuvayı doldurunca gelen görsellerin hangi promptla üretildiği
 * görülsün."*** Ve dert gerçek: model beklenmedik bir şey çizdiğinde tek soru *"ona ne
 * dedik"* oluyor. Hat bu cevabı `steps/gorsel-brief*.json` içinde tutuyordu; editörden
 * üretilen görselde ise istem hiçbir yere yazılmıyordu — konsola bir kez basılıp
 * kayboluyordu. Aynı soru iki yolda iki farklı cevap veriyordu: birinde defter, ötekinde
 * hiçbir şey.
 *
 * ⚠ Yan dosya, `.kaynak.json` ile aynı kalıp (Yasa 7: varlık üretim anında damgalanır).
 * Sonradan retrofit imkânsız — istem üretildiği an yazılmazsa bir daha bilinmez.
 */
const istemKunyesiniYaz = (dizin, sira, istem, saglayici) => {
  const ad = 'gorsel-' + String(sira).padStart(2, '0') + '-elle.istem.json'
  try {
    writeFileSync(
      join(dizin, ad),
      JSON.stringify({ istem, saglayici: saglayici ?? null, kaynak: 'editor' }, null, 2)
    )
  } catch {
    // İstem künyesi yazılamazsa görsel yine de geçerli: künye bir KOLAYLIK, kanıt değil.
  }
}

/**
 * Bir yuvanın istemi — önce editörün yan dosyası, sonra HATTIN brief adımı.
 *
 * ⚠ Sıra önemli: `-elle` bir görsel hattınkini EZİYOR, o yüzden istem de öyle. Hattın
 * brief'ini gösterip diskteki görselin editörden geldiğini söylememek, yanlış cevabı
 * güvenle vermek olurdu.
 */
const yuvaninIstemi = (dizin, sira) => {
  const yan = join(dizin, 'gorsel-' + String(sira).padStart(2, '0') + '-elle.istem.json')
  if (existsSync(yan)) {
    try {
      const j = JSON.parse(readFileSync(yan, 'utf8'))
      return { kaynak: 'editör', istem: String(j.istem ?? ''), saglayici: j.saglayici ?? null }
    } catch {
      /* bozuk yan dosya: hatta düşülüyor */
    }
  }
  // Hattın brief adımı: 1. yuva `gorsel-brief.json`, sonrakiler `-2`, `-3`…
  const adim = sira === 1 ? 'gorsel-brief.json' : 'gorsel-brief-' + String(sira) + '.json'
  const yol = join(dizin, 'steps', adim)
  if (!existsSync(yol)) return null
  try {
    const j = JSON.parse(readFileSync(yol, 'utf8'))
    const satir = (j.lines ?? [])[0]
    return typeof satir === 'string' && satir !== ''
      ? { kaynak: 'hat', istem: satir, saglayici: null }
      : null
  } catch {
    return null
  }
}

/**
 * Yuvaya görsel yazar — bayt DOĞRULANARAK.
 *
 * ⚠ Hata bir DEĞER olarak dönüyor, `throw` edilmiyor (§8.6): çağıran onu kullanıcıya
 * gösterebilsin. Sessizce yazmamak, *"doldu"* diyen bir ekranla aynı yalan olurdu.
 */
const yuvayaYaz = (dizin, ad, b64) => {
  const buf = Buffer.from(b64, 'base64')
  if (!gorselBaytiMi(buf)) {
    return {
      ok: false,
      sebep:
        'gelen bayt bir görüntü DEĞİL (' +
        buf.length +
        ' bayt) — yuvaya yazılmadı: ' +
        buf.toString('utf8', 0, 120).replace(/\s+/g, ' '),
    }
  }
  writeFileSync(join(dizin, ad), buf)
  return { ok: true }
}

const gorselBetigi = async (betik, b64, argv = []) => {
  const { spawnSync } = await import('node:child_process')
  const python = join(REPO, '.venv-gorsel/bin/python')
  if (!existsSync(python)) return { ok: false, sebep: '.venv-gorsel yok — `just setup`' }
  const r = spawnSync(python, [join(REPO, 'scripts/gorsel/' + betik), ...argv], {
    input: b64,
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  })
  if (r.status !== 0) return { ok: false, sebep: String(r.stderr ?? '').slice(0, 160) }
  return { ok: true, b64: String(r.stdout).trim(), olcum: String(r.stderr ?? '').trim() }
}

const arkaplaniSil = (b64) => gorselBetigi('arkaplan-sil.py', b64)

/**
 * AKILLI KIRPMA — saydam kenarları atar, özneyi kadraja oturtur.
 *
 * ⚠ ⚠ **BU BİR ÖLÇÜMDEN DOĞDU.** Arka plan silindikten sonra özne kadrajın ortasında
 * küçük bir ada olarak kalıyor: gerçek çıktıda tuvalin **%30'u BOŞTU**. O boşluk
 * slayta olduğu gibi girince yuva doluymuş gibi görünüyor ama özne minicik kalıyor —
 * tasarım değil kaza gibi okunuyor. Depo sahibi: *"görseli akıllıca kırpma kesme
 * çerçeveleme vs gibi şeyler de olmalı."*
 *
 * ⚠ Kesilecek yer TAHMİN edilmiyor, alfa kanalının sınırlayıcı kutusundan ÖLÇÜLÜYOR:
 * *"kenardan %10 at"* diyen bir kural, öznesi köşede olan bir görselde özneyi keserdi.
 */
const otomatikKirp = (b64, oran) =>
  gorselBetigi('otomatik-kirp.py', b64, oran === undefined ? [] : ['--oran=' + oran])

/**
 * Bir istemden görsel üretir — `/gorsel-uret` ile AYNI sağlayıcı yolu.
 *
 * ⚠ İstem R-20 MUHAFIZINDAN geçiyor (`adapter.validate`): istemi kim yazdıysa yazsın,
 * metin isteyen bir istem Türkçe tipografiyi bozuyor. "Model yazdı" bir muafiyet
 * sebebi değil — insanın yazdığı için de olmadığı gibi.
 */
/**
 * Editörün sağlayıcı ZİNCİRİ — hattaki `gorsel-uret` adımının aynısı.
 *
 * ⚠ ⚠ **EDİTÖR SAĞLAYICIYI ADIYLA ÇAĞIRIYORDU (`'cloudflare-workers-ai'`) ve bu D-32'nin
 * sağlayıcı hâliydi.** Depo sahibi: *"kesinlikle önce gemini apileri çalışmalı, editörde
 * yuvaları doldur tuşu da öyle çalışmalı."* Hat premium şeride alınıp Gemini birincil
 * yapıldığında editör HÂLÂ Cloudflare'e gidiyordu: aynı depoda iki farklı görsel
 * sağlayıcısı, ve fark ancak çıktıya bakınca görülürdü. Bu deponun en sık tekrarlayan
 * hatası tam olarak bu — aynı kural iki yerde, biri düzeltilir öteki unutulur.
 *
 * ⚠ Zincir KATALOGDAN türetiliyor, elle sayılmıyor: yeni bir sağlayıcı eklendiğinde
 * editör onu kendiliğinden görüyor. Sıra `image.generate` yeteneğini beyan eden
 * ÜCRETLİ adaylar önce, bedava olanlar yedek — hattaki premium şerit kuralının aynısı.
 */
const gorselZinciri = () =>
  ['gemini-image', 'cloudflare-workers-ai']
    .map((id) => adapterById(id))
    .filter((a) => a !== null && a.available(SAGLAYICI_ORTAMI))

const gorselUret = async (istem, anahtar) => {
  const zincir = gorselZinciri()
  if (zincir.length === 0)
    return { ok: false, sebep: 'anahtar yok — tezgâhı `just dev` ile (sops altında) başlat' }

  // ⚠ Düşen her sağlayıcı ve SEBEBİ taşınıyor: hepsi düşerse kullanıcı hangisinin
  // neden düştüğünü görmeli. Sessiz bir "üretim başarısız", altı anahtarlı bir kota
  // hatasıyla eksik bir kurulumu aynı şeye benzetirdi.
  const dusenler = []
  for (const adapter of zincir) {
    const serit = adapter.capabilities().some((c) => (c.lanes ?? []).includes('premium'))
      ? 'premium'
      : 'free'
    const dogrulanan = adapter.validate({
      capability: 'image.generate',
      lane: serit,
      prompt: istem,
      constraints: { aspect: '4:5' },
      idempotencyKey: anahtar,
    })
    if (!dogrulanan.ok) {
      // ⚠ İstem hatası SAĞLAYICI DEĞİŞTİRMEZ: R-20 muhafızı her sağlayıcıda aynı
      // cevabı verir ve zinciri dolaşmak yalnız gecikme üretirdi.
      return {
        ok: false,
        sebep: 'istem reddedildi (R-20): ' + JSON.stringify(dogrulanan.error.details ?? {}),
      }
    }
    const is = await adapter.start(dogrulanan.value, {
      correlationId: 'cor_editor',
      env: SAGLAYICI_ORTAMI,
    })
    if (!is.ok) {
      dusenler.push(adapter.id + ': ' + String(is.error.code ?? ''))
      continue
    }
    let durum = await adapter.status(is.value)
    for (let i = 0; i < 60 && durum.ok && durum.value.state === 'running'; i++) {
      await new Promise((c) => setTimeout(c, 1000))
      durum = await adapter.status(is.value)
    }
    if (!durum.ok || durum.value.state !== 'succeeded') {
      dusenler.push(adapter.id + ': ' + String(durum.ok ? durum.value.state : durum.error.code))
      continue
    }
    const cikti = durum.value.output ?? {}
    const b64 =
      typeof cikti.image_base64 === 'string' ? cikti.image_base64 : String(cikti.data ?? '')
    if (b64 === '') {
      dusenler.push(adapter.id + ': byte döndürmedi')
      continue
    }
    return { ok: true, b64, saglayici: adapter.id, dusenler }
  }
  return { ok: false, sebep: 'hiçbir sağlayıcı üretemedi — ' + dusenler.join(' · ') }
}

/**
 * Brief'i METİN MODELİNDEN alır — hattaki `gorsel-brief` adımının birebir aynısı.
 *
 * ⚠ ⚠ **İSTEM `plan/gorsel-brief.ts`TEN, BURADA YAZILMIYOR.** Kopyalasaydım editör bir
 * gün hattan farklı bir görsel dili üretirdi ve fark ancak çıktıya bakınca görülürdü.
 * ⚠ Boş dönen istem = bu yuvaya brief YOK (şablon görsel istemiyor ya da sıra varyant
 * sayısını aşıyor) ve o hâlde üretim de yapılmıyor: kullanılmayacak bir görsel için
 * kota harcamak D-261'in birebir tekrarı olurdu.
 */
const briefUret = async (kimlik, sira, doc) => {
  // ⚠ ⚠ **BRIEF ARTIK O SLAYDIN METNİNİ TAŞIYOR.** Depo sahibi: *"tüm yuvalara üretme
  // işi metne uygun konuya uygun mükemmelce yapılmalı rastgele görsel değil!!!"*
  // Editör belgeyi ELİNDE tutuyor — kartların metni tam orada duruyordu ve brief onu
  // hiç sormuyordu. Konu bütün karosel için aynı; slayt metni her slayt için farklı.
  const kartlar = doc.kartlar ?? []
  const yuva = (doc.gorseller ?? [])[sira - 1]
  const kartNo =
    yuva === undefined || kartlar.length === 0
      ? -1
      : gorselinKarti(yuva.x, yuva.genislik, kartlar.length)
  const kart = kartNo < 0 ? undefined : kartlar[kartNo]
  const istem = gorselBriefIstemi({
    sablonId: kimlik.sablonId,
    sira,
    konu: kimlik.konu,
    gorselDili: kimlik.gorselDili,
    kartMetni:
      kart === undefined
        ? ''
        : [kart.ustBaslik ?? '', kart.baslik ?? '', kart.govde ?? ''].join('\n').trim(),
    seriBasliklari: kartlar.map((x) => String(x.baslik ?? '')),
    kartNo: kartNo + 1,
  })
  if (istem === '')
    return { ok: false, bosYuva: true, sebep: 'bu şablon bu yuvaya görsel istemiyor' }
  const adaptor = adapterById('claude-code')
  if (adaptor === null) return { ok: false, sebep: '`claude-code` adaptörü yok' }
  if (!adaptor.available(SAGLAYICI_ORTAMI))
    return { ok: false, sebep: '`claude` PATH üzerinde yok — yerel önkoşul sağlanmadı' }
  const girdi = {
    capability: 'text.generate',
    lane: 'free',
    prompt: istem,
    constraints: {},
    idempotencyKey: 'editor-brief:' + kimlik.sablonId + ':' + String(sira),
  }
  const dogrulama = adaptor.validate(girdi)
  if (!dogrulama.ok) return { ok: false, sebep: 'brief istemi reddedildi' }
  const baslat = await adaptor.start(dogrulama.value, {
    env: SAGLAYICI_ORTAMI,
    correlationId: girdi.idempotencyKey,
    signal: undefined,
  })
  if (!baslat.ok) return { ok: false, sebep: 'brief sağlayıcısı başlatılamadı' }
  const durum = await adaptor.status(baslat.value)
  if (!durum.ok || durum.value.state !== 'succeeded')
    return { ok: false, sebep: 'brief üretilemedi' }
  // ⚠ Zarfı HATTIN çıkarıcısı açıyor: Claude Code cevabı `{"type":"result","result":…}`
  // zarfında veriyor ve kendi çıkarıcımı yazmak hattınkinden ayrışan ikinci bir okuma
  // olurdu (`yayin-metni.mjs` bunu bir kez öğrendi).
  const ham = (duzMetin(durum.value.output) ?? '').trim()
  if (ham === '') return { ok: false, sebep: 'brief boş döndü' }
  // ⚠ ⚠ **KADRAJ EKİ BRIEF'İN ÜSTÜNE, MODELDEN GEÇMEDEN.** Gerçek koşu: dört ayrı
  // brief adımı, her birinde farklı kadraj satırı ve çıkan dört fotoğraf BİREBİR
  // AYNIYDI — model kadrajı düzlüyor. Garanti yapıya gömülü olmak zorunda.
  const varyant = varyantEki(kimlik.sablonId, sira)
  return { ok: true, istem: varyant === '' ? ham : ham + ', ' + varyant, brief: ham }
}

/**
 * İKİ MOD, tek tezgâh (D-301 · depo sahibinin kararı).
 *
 * `sablon:*` katalog taslakları — düzenlenirse altı tasarımın kendisi değişir.
 * `kosu:*`   üretilmiş karoseller — düzenlenirse yalnız O koşu değişir.
 *
 * ⚠ Koşu kaydı ancak `render` adımı belgeyi diske yazdığı için mümkün. Önceden
 * defterde yalnız ÖZET vardı ve üretilmiş bir karosel bir daha AÇILAMIYORDU.
 */
const KOSU_DIZINI = join(REPO, 'derived/runs')

/**
 * Koşu ELENMİŞ mi — bir kapıda `rejected` kararı almış mı.
 *
 * ⚠ ⚠ **BU, KUYRUĞUNKİNDEN BAŞKA BİR SORU ve o yüzden burada ayrı yazılıyor.**
 * `bekleyenler()` *"bu koşu BANA mı bekliyor"* diye soruyor: kapısı var ve o kapıya
 * karar verilmemiş. Editörün sorusu *"bu koşu hâlâ yaşıyor mu"*. İkisi farklı: onaylanıp
 * bitmiş bir koşu kuyrukta durmaz ama editörde açılabilmeli, elenmiş bir koşu ise
 * ikisinde de durmamalı. Aynı yüklemi kopyalamak yerine kendi yüklemini yazmak,
 * yarın kuyruk kuralı değişince editörün sessizce yanlış listelemesini önlüyor.
 *
 * ⚠ Emeklilik SİLME DEĞİL (Yasa 10): koşu diskte duruyor, defteri duruyor, gerekçesi
 * duruyor. Yalnız listede görünmüyor — ve `?elenmis=1` ile geri geliyor. Geri dönüşü
 * olmayan bir gizleme, kaybetmenin başka adıdır.
 */
const elenmisMi = (dizin) => {
  try {
    const m = JSON.parse(readFileSync(join(dizin, 'manifest.json'), 'utf8'))
    return (m.decisions ?? []).some((d) => d.decision === 'rejected')
  } catch {
    // Manifest okunamıyorsa koşu elenmiş SAYILMIYOR: bilinmezliği gizlemeye çevirmek,
    // bozuk bir defteri sessizce yok saymak olurdu.
    return false
  }
}

// ⚠ ⚠ **SÜZGEÇ BURADA DEĞİL, AÇILIR LİSTEDE — ve sebebi ÖLÇÜLDÜ.** İlk sürüm elemeyi
// bu taramaya koymuştu; tarama HER istekte koşuyor (`/degistir` her kaydırak
// hareketinde) ve 202 manifest okumak 19,7 ms sürüyor (manifest başına 0,10 ms).
// Yani bir kaydırağı sürüklemek her karede 20 ms manifest okuması demekti. Eleme
// yalnız listeyi ilgilendiriyor ve liste yalnız sayfa açılışında kuruluyor.
const kosulariTara = () => {
  if (!existsSync(KOSU_DIZINI)) return []
  return readdirSync(KOSU_DIZINI)
    .map((ad) => ({ ad, dizin: join(KOSU_DIZINI, ad), yol: kosuBelgeYolu(join(KOSU_DIZINI, ad)) }))
    .filter((k) => k.yol !== null)
    .map((k) => ({ ...k, zaman: statSync(k.yol).mtimeMs }))
    .sort((a, b) => b.zaman - a.zaman)
}

/**
 * Defterdeki REFERANS biçimini geri dolduruyor: `fontCss` markadan (belge() yapıyor),
 * görsel ise yanındaki PNG'den. Dosya silinmişse görsel BOŞ geçiliyor — kompozisyon
 * yine açılıyor. Sessizce yer tutucu çizmektense boş kutu göstermek dürüst: eksik olan
 * şey görülsün.
 */
const kosuBelgesi = (dizin, sadeceAsil = false) => {
  // ⚠ ⚠ **HANGİ BELGE ve GÖRSELLERİN GÖMÜLMESİ tek fonksiyonda** (`@suite/render`).
  // İkisi de burada YAZILIYDI: çeviri sunucunun bilmediği bir kopyaydı (slaytlar
  // görselsiz dışa aktarıldı) ve seçim hiç yoktu — editör her açılışta ASLINI
  // açıyor, elle düzenlenmiş sürümü görmezden geliyordu.
  const r = kosuBelgesiniOku(dizin, sadeceAsil)
  if (r === null) throw new Error('belge yok: ' + dizin)
  return r.belge
}

/** Çalışan kopya — sunucu belleğinde. Kaydetmeden dosyaya DOKUNULMUYOR. */
const calisan = {}
const kaynak = {}
for (const [k, o] of Object.entries(ORNEKLER)) {
  calisan['sablon:' + k] = structuredClone(o)
  kaynak['sablon:' + k] = { tur: 'sablon', ad: k }
}
/**
 * Koşuları belleğe alır — **her istekte yeniden, ama ÜSTÜNE YAZMADAN.**
 *
 * ⚠ ⚠ **İKİ KUSUR BİRDEN BURADAYDI.** (1) Liste açılışta bir kez taranıyor ve `slice(0,12)`
 * ile ON İKİ koşuyla sınırlanıyordu: panelden *"bu koşuyu editörde aç"* denen koşu o
 * on ikinin dışındaysa `calisan[id]` boş kalıyor ve editör ŞABLONU açıyordu — depo
 * sahibinin gördüğü şey buydu. (2) Editör açıkken üretilen hiçbir koşu listeye
 * girmiyordu; tezgâhı kapatıp açmak gerekiyordu.
 *
 * ⚠ Var olan kayıt EZİLMİYOR: düzenlenmiş bir kopyanın üstüne diskteki hâli yazmak,
 * kaydedilmemiş işi sessizce silmek olurdu.
 */
/**
 * Koşunun HANGİ ŞABLONDAN üretildiği — kendi defterinden.
 *
 * ⚠ ⚠ **KOŞU PARAMETRESİNDEN OKUNMUYOR ve sebebi ölçülmüş bir yalan.** `kosu-parametreleri.json`
 * `sablon` alanını ancak panel/CLI onu yazdıysa taşıyor; sistem kendi seçtiğinde alan BOŞ.
 * Bu tam olarak bir kez yanlış rapora yol açtı: bir koşuya `veri-hikayesi` dendi, adım
 * çıktısı okununca `sahne` olduğu görüldü. Tek doğru kaynak `sablon-uyarla` adımının
 * kendi çıktısı — üretimi gerçekte hangi şablonun taşıdığını yalnız o biliyor.
 */
const kosuSablonu = (dizin) => {
  try {
    return (
      JSON.parse(readFileSync(join(dizin, 'steps/sablon-uyarla.json'), 'utf8')).uyarlama.sablonId ??
      ''
    )
  } catch {
    return ''
  }
}

const kosulariYukle = () => {
  for (const k of kosulariTara()) {
    const id = 'kosu:' + k.ad
    if (calisan[id] !== undefined) continue
    try {
      calisan[id] = kosuBelgesi(k.dizin)
      kaynak[id] = {
        tur: 'kosu',
        ad: k.ad,
        dizin: join(KOSU_DIZINI, k.ad),
        sablon: kosuSablonu(k.dizin),
      }
    } catch {
      // Bozuk defter tezgâhı indirmesin; o koşu listede çıkmaz.
    }
  }
}
kosulariYukle()

// ⚠ `calisan[id]` EN SONA yayılıyor: koşu belgesi kendi `tokenCss`ini ve damgasını
// TAŞIYOR ve o koşunun dönemine ait. Varsayılanı üstüne yazmak, geçmiş bir koşuyu
// bugünkü paletle göstermek olurdu — düzenlediğin şey artık üretilen şey olmazdı.
const belge = (id) => ({
  tokenCss,
  fontCss: f.ok ? f.css : '',
  stamp,
  ...(lg.ok ? { logo: lg.varliklar } : {}),
  ...calisan[id],
})

/**
 * Süreç, DİSKTEKİ koddan eski mi — bayat tezgâh uyarısı.
 *
 * ⚠ ⚠ **BU KONTROL, SAATLERCE GÖRÜNMEZ KALAN BİR TUZAKTAN DOĞDU.** Depo sahibi
 * *"yuvayı doldur"* diyordu, ekran *"✓ 1. yuva dolduruldu"* diyordu ve slot boş
 * geliyordu. Sebep koddaki bir kusur DEĞİLDİ — kusur çoktan düzeltilmişti; ama editör
 * süreci **13 saat önce** başlamıştı ve düzeltmeleri hiç görmemişti. Eski sürüm kota
 * hatasını base64'leyip `.png` diye diske yazıyordu.
 *
 * ⚠ Bir hata mesajı bu durumu ASLA gösteremez, çünkü koşan kodun kendisi eski. Tek
 * çare dışarıdan bakmak: sürecin başlangıç anı ile dosyaların değişme anını
 * karşılaştırmak. `tezgah.sh` port doluluğunu uyarıyordu ama süreç ayaktayken sessizdi.
 *
 * ⚠ Kontrol HER SAYFA ÇİZİMİNDE koşuyor, açılışta bir kez değil: kod düzenlenirken
 * editör zaten açık duruyor ve asıl tehlikeli an tam o an.
 */
const IZLENEN_KAYNAKLAR = [
  join(REPO, 'scripts/duzenleyici.mjs'),
  join(REPO, 'scripts/duzenleyici-istemci.js'),
  join(REPO, 'packages/providers/dist/index.js'),
  join(REPO, 'packages/render/dist/index.js'),
]

/**
 * Açılış anındaki dosya damgaları — SAAT KULLANILMIYOR.
 *
 * ⚠ ⚠ **İLK YAZIM `Date.now()` ÇAĞIRIYORDU ve `chokepoints` kapısı REDDETTİ** (saat
 * darboğazı, §3.8: iki saat replay'i bozar). Kapı haklıydı ve zorladığı çözüm DAHA
 * DOĞRU çıktı: *"başlangıçtan yeni mi"* değil, *"açılışta gördüğümden FARKLI mı"*
 * soruluyor. Damga karşılaştırması saat istemiyor ve geri alınan bir değişikliği de
 * yakalıyor — zaman karşılaştırması onu kaçırırdı.
 */
const ACILIS_DAMGALARI = new Map(
  IZLENEN_KAYNAKLAR.map((f) => {
    try {
      return [f, statSync(f).mtimeMs]
    } catch {
      // Dosya yoksa damga da yok; sonradan doğarsa DEĞİŞİM sayılır ve bu doğru.
      return [f, null]
    }
  })
)

const bayatKaynaklar = () =>
  IZLENEN_KAYNAKLAR.filter((f) => {
    let simdiki = null
    try {
      simdiki = statSync(f).mtimeMs
    } catch {
      simdiki = null
    }
    return simdiki !== ACILIS_DAMGALARI.get(f)
  }).map((f) => f.replace(REPO + '/', ''))

const KABUK = (
  id,
  elenmisDe = false
) => `<!doctype html><meta charset="utf-8"><title>Şablon düzenleyici — ${id}</title>
<style>
  :root{--ui:#14161a;--kenar:#2a2e36;--metin:#e6e8ec;--vurgu:#5aa9e6}
  *{box-sizing:border-box} body{margin:0;background:#0d0f12;color:var(--metin);
    font:14px/1.45 ui-sans-serif,system-ui}
  header{display:flex;gap:14px;align-items:center;padding:10px 16px;background:var(--ui);
    border-bottom:1px solid var(--kenar);position:sticky;top:0;z-index:10}
  select,button{background:#1b1f26;color:var(--metin);border:1px solid var(--kenar);
    border-radius:7px;padding:7px 12px;font:inherit;cursor:pointer}
  button.birincil{background:var(--vurgu);color:#06202f;border-color:transparent;font-weight:650}
  #govde{display:flex;align-items:flex-start;gap:0}
  #tuval{padding:18px;overflow:auto;flex:1;min-width:0}
  /* ⚠ Müfettiş SAĞDA ve SABİT genişlikte: tuval yatay kayıyor (panorama 4320 px) ve
     panelin onunla birlikte kayması, düzenlerken sürekli geri kaydırmak demekti. */
  #mufettis{width:288px;flex:none;align-self:stretch;background:var(--ui);
    border-left:1px solid var(--kenar);padding:12px 14px 40px;overflow:auto;
    max-height:calc(100vh - 58px)}
  #mufettis h3{font-size:11px;letter-spacing:.14em;opacity:.55;margin:16px 0 8px;
    font-weight:700}
  #mufettis h3:first-child{margin-top:0}
  /* ── WEBDEN ARAMA MODALI (madde 12) ────────────────────────────────────────
     ⚠ ⚠ **SONUÇLAR ESKİDEN SAĞ PANELİN EN DİBİNDEYDİ.** Depo sahibi: *"webden
     görseli ara diyince nereye geliyor sonuçlar göremiyorum"*. 288 px'lik müfettiş
     sütununda, sekiz kaydırağın ve iki metin kutusunun ALTINDA, kaydırmadan
     görünmüyorlardı — arama çalışıyordu ama sonucu yoktu.
     ⚠ Modal tuvalin ÜSTÜNE geliyor: aranan şey görselin kendisi ve küçük bir
     kutuda ikon seçmek, seçmemekle aynı şey. */
  #ara-perde{position:fixed;inset:0;background:#05070aee;z-index:50;display:none;
    align-items:center;justify-content:center;padding:32px}
  #ara-perde.acik{display:flex}
  .ara-oge{position:relative}
  .ara-oge-kirik{border-color:#7a3b3b !important;opacity:.5}
  /* ⚠ 3D rozeti köşede: küçük resimde düz ikon ile 3D render'ı ayırt etmek gerekiyor. */
  .ara-rozet{position:absolute;top:4px;left:4px;background:#0b0f14cc;border:1px solid #2a3441;
    border-radius:4px;color:#8fd0ff;font:600 9px/1 ui-monospace,monospace;padding:3px 4px}
  #ara-kutu{background:var(--ui);border:1px solid var(--kenar);border-radius:12px;
    width:min(980px,100%);max-height:86vh;display:flex;flex-direction:column;overflow:hidden}
  #ara-baslik{display:flex;gap:10px;align-items:center;padding:14px 16px;
    border-bottom:1px solid var(--kenar)}
  #ara-baslik input[type=search]{flex:1;background:#0d0f12;color:var(--metin);
    border:1px solid var(--kenar);border-radius:7px;padding:9px 12px;font:inherit}
  #ara-durum{padding:8px 16px;font-size:12.5px;opacity:.75;border-bottom:1px solid var(--kenar)}
  #ara-izgara{display:grid;grid-template-columns:repeat(auto-fill,minmax(112px,1fr));
    gap:10px;padding:14px 16px;overflow:auto;flex:1}
  .ara-oge{background:#1b1f26;border:1px solid var(--kenar);border-radius:9px;padding:8px;
    display:flex;flex-direction:column;gap:6px;align-items:center;cursor:pointer}
  .ara-oge:hover{border-color:var(--vurgu)}
  .ara-oge img{width:56px;height:56px}
  .ara-oge small{font-size:10px;opacity:.6;text-align:center;line-height:1.25;
    word-break:break-word}
  .ara-oge .kova{font-size:10.5px;padding:3px 7px;border-radius:5px}
  /* ⚠ KOVA: seçilen ögeler burada birikiyor ki *"diğerleri istendiği zaman
     denenebilsin"*. Arama kapanınca sonuçlar kayboluyordu; bir sonrakini denemek
     için baştan aramak gerekiyordu. */
  #kova-serit{display:flex;gap:6px;flex-wrap:wrap;margin-block-start:6px}
  #kova-serit .kova-oge{background:#1b1f26;border:1px solid var(--kenar);border-radius:7px;
    padding:4px;cursor:pointer;position:relative}
  #kova-serit .kova-oge:hover{border-color:var(--vurgu)}
  #kova-serit img{width:34px;height:34px;display:block}
  #mufettis label{display:block;font-size:12px;margin:0 0 9px}
  #mufettis label span{display:flex;justify-content:space-between;opacity:.72;
    margin-bottom:3px}
  #mufettis input[type=range]{width:100%;accent-color:var(--vurgu)}
  #mufettis select,#mufettis input[type=text],#mufettis input[type=number]{
    width:100%;background:#1b1f26;color:var(--metin);border:1px solid var(--kenar);
    border-radius:6px;padding:5px 8px;font:inherit;font-size:12px}
  #mufettis .bos{opacity:.45;font-size:12px;line-height:1.5}
  #mufettis .sil{width:100%;margin-top:6px;border-color:#7a3030;color:#ff9b9b}
  #sahne-sarmal{position:relative}
  iframe{border:0;display:block;transform-origin:0 0;background:#000}
  /* Kesim kilavuzu PARENT'ta duruyor, iframe'in icinde DEGIL: render'a tek piksel
     eklemiyor. Kesintisiz karoselde asil soru "hangi oge hangi slayta dusuyor" ve
     kesimler gorunmeden bu goz kararidir. */
  #kilavuz{position:absolute;inset:0;pointer-events:none}
  #kilavuz i{position:absolute;top:0;bottom:0;width:1px;background:rgba(255,96,96,.55)}
  #kilavuz b{position:absolute;top:4px;font:11px/1 ui-monospace,monospace;
    color:rgba(255,96,96,.8);transform:translateX(6px)}
  #ipucu{margin-left:auto;opacity:.62;font-size:12.5px}
  /* ⚠ ⚠ **EYLEM MESAJI ile ÖLÇÜM AYRI SATIRLAR.** İkisi aynı yeri paylaşıyordu ve
     her eylemden sonra koşan ölçüm mesajı SİLİYORDU: şablona görsel koyma reddi
     ekranda hiç görünmedi, kullanıcı işlemin başarılı olduğunu sanırdı. Süreğen bir
     ölçümle geçici bir sonuç aynı yüzeyi paylaşamaz. */
  #mesaj{padding:0 16px;background:#1b1f26;font:12.5px/2.2 ui-monospace,monospace;
    white-space:pre-wrap;border-top:1px solid var(--kenar);min-height:0;transition:.15s}
  #mesaj:empty{padding:0;border:0}
  #mesaj.hata{color:#ff9b9b}
  #mesaj.iyi{color:#8fd18f}
  #kusur{padding:8px 16px;background:#1b1f26;border-top:1px solid var(--kenar);
    font:12.5px/1.5 ui-monospace,monospace;white-space:pre-wrap;max-height:26vh;overflow:auto}
</style>
<header>
  <select id="sablon">
    <optgroup label="ŞABLON — düzenlersen altı tasarımın kendisi değişir">${Object.keys(kaynak)
      .filter((k) => kaynak[k].tur === 'sablon')
      .map((k) => `<option value="${k}"${k === id ? ' selected' : ''}>${kaynak[k].ad}</option>`)
      .join('')}</optgroup>
    <optgroup label="KOŞU — düzenlersen yalnız o karosel değişir">${Object.keys(kaynak)
      // ⚠ ⚠ **ELENMİŞ KOŞU LİSTEDE YOK.** Depo sahibi: *"editörde panelde elenmiş
      // koşular listelenmemeli"*. Ölçüldü: editör 56 koşu gösteriyordu, panelde açık
      // olan 10'du — aradaki 46 emekli koşuydu ve doğru olanı bulmak samanlıkta iğne
      // aramaya dönmüştü. Süzgeç BURADA da var çünkü `calisan` bir önbellek: tezgâh
      // açıkken elenen bir koşu yüklü kalır ve yalnız taramayı süzmek onu gizlemezdi.
      // ⚠ `?elenmis=1` hepsini geri getiriyor — emeklilik silme değildir (Yasa 10) ve
      // geri dönüşü olmayan bir gizleme, kaybetmenin başka adıdır.
      .filter((k) => kaynak[k].tur === 'kosu' && (elenmisDe || !elenmisMi(kaynak[k].dizin)))
      .map(
        (k) =>
          `<option value="${k}"${k === id ? ' selected' : ''}>${
            // ⚠ ŞABLON ADI ÖNDE: *"koşularda hangi şablondan olduğu da yazsın"*. Koşu
            // kimliği tek başına hiçbir şey söylemiyordu — on üretimden hangisi olduğunu
            // görmek için koşuyu AÇMAK gerekiyordu.
            (kaynak[k].sablon === '' ? '—' : kaynak[k].sablon) + ' · ' + kaynak[k].ad.slice(4, 17)
          }</option>`
      )
      .join('')}</optgroup>
  </select>
  <button id="kucult">−</button><button id="buyut">+</button>
  <button id="mod">✎ yaz</button>
  <button id="sil">⌫ sil</button>
  <button id="geri">↶ geri al</button>
  <button id="ileri">↷ ileri</button>
  <button id="sifirla">⟲ değişiklikleri sıfırla</button>
  <!-- ⚠ ⚠ **ÇIKTI ALMAK EDİTÖRDE HİÇ YOKTU.** Tezgâhta düzeltip sonra dosyayı koşu
       dizininden elle bulmak gerekiyordu. Seçim bir TERCİH değil bir KULLANIM sorusu:
       nereye yükleyeceğin hangi biçimi gerektirdiğini belirler — başlıklar bunu yazıyor. -->
  <select id="disa">
    <optgroup label="YAYIN — platform slayt slayt ister, PNG kayıpsız">
      <option value="dilim:png">⭳ slaytlar · PNG</option>
    </optgroup>
    <optgroup label="ONAY — hızlı paylaşım ya da tek dosya">
      <option value="dilim:jpg">⭳ slaytlar · JPEG (~5× küçük)</option>
      <option value="dilim:pdf">⭳ slaytlar · PDF (her slayt bir sayfa)</option>
    </optgroup>
    <optgroup label="KESİNTİSİZLİĞİ GÖRMEK — platforma yüklenmez">
      <option value="butun:png">⭳ kesintisiz · PNG</option>
      <option value="butun:jpg">⭳ kesintisiz · JPEG</option>
      <option value="butun:pdf">⭳ kesintisiz · PDF (vektör metin)</option>
    </optgroup>
  </select>
  <button id="disaAl">⭳ indir</button>
  <button class="birincil" id="kaydet">JSON'u yaz</button>
  <span id="ipucu">metne tıkla → düzenle · görseli sürükle → taşı · Shift+sürükle → ölçekle</span>
</header>
${
  bayatKaynaklar().length === 0
    ? ''
    : `<div style="background:#7a1f1f;color:#fff;padding:10px 14px;font:600 13px ui-sans-serif;
         border-bottom:2px solid #ff5a5a">
       ⚠ BAYAT TEZGÂH — bu süreç ${bayatKaynaklar().length} dosyadan ESKİ ve onları
       görmüyor: ${bayatKaynaklar().join(' · ')}.
       Ne yaparsan yap eski kod koşuyor; düzeltmeler etkisiz.
       <b>Tezgâhı yeniden başlat</b> (just dev).
     </div>`
}
<div id="govde">
  <div id="tuval"><div id="sahne-sarmal"><iframe id="pano"></iframe><div id="kilavuz"></div></div></div>
  <aside id="mufettis"></aside>
</div>
<div id="mesaj"></div>
<div id="kusur">ölçüm bekleniyor…</div>
<!-- ⚠ Modal iskeleti BURADA, kabukta: istemci onu her açılışta yeniden kurmak
     yerine yalnız dolduruyor. Bir kez kurulan yapı, her seferinde kurulan
     yapıdan az bozulur. -->
<div id="ara-perde">
  <div id="ara-kutu">
    <div id="ara-baslik">
      <strong style="font-size:13px">webden tasarım ögesi</strong>
      <input type="search" id="ara-sorgu" placeholder="türkçe ara: geri kazanım, ölçüm, fabrika, veri, ampul…">
      <label style="font-size:12px;display:flex;gap:5px;align-items:center;white-space:nowrap">
        <input type="checkbox" id="ara-genis"> şablon havası dışı
      </label>
      <button id="ara-git" class="birincil">ara</button>
      <button id="ara-kapat">✕</button>
    </div>
    <div id="ara-durum">bir şey ara — sonuçlar burada çıkacak</div>
    <div id="ara-izgara"></div>
  </div>
</div>
<script type="module" src="/istemci.js"></script>`

// ── ölçüm: denetim tarayıcıda koşuyor, ayrı bir motor yok ────────────────────
const KATALOG_YOLU = join(REPO, 'packages/render/src/katalog-ornek.ts')

/** Diskte NE OLDUĞUNUN bilgisi. İkinci kaydetmede aranan eski değer, birincinin
 *  yazdığı yeni değerdir — ORNEKLER bellekte hep ilk hâlini tutar. */
const diskteki = Object.fromEntries(
  Object.entries(ORNEKLER).map(([k, o]) => ['sablon:' + k, structuredClone(o)])
)

const tsKacir = (v) => "'" + String(v).replace(/\\/g, '\\\\').replace(/'/g, "\\'") + "'"

/**
 * Şablon düzenlemesini `katalog-ornek.ts`e CERRAHİ olarak yazar.
 *
 * ⚠ ⚠ **DOSYA YENİDEN ÜRETİLMİYOR, YAMANIYOR.** `katalog-ornek.ts` 999 satır ve
 * ağırlığının çoğu YORUM: her sayı bir ölçümün, her seçim bir kararın izini taşıyor.
 * Veriden yeniden üretmek o yorumların hepsini silerdi — dosyanın asıl değeri
 * silinmiş olurdu. Bu yüzden yalnız DEĞİŞEN alanın literali değiştiriliyor.
 *
 * ⚠ **Belirsizlikte HİÇBİR ŞEY yazılmıyor.** Eski değer blokta bir kez geçmiyorsa
 * (sıfır ya da birden çok) işlem tümüyle iptal ediliyor ve sebebi bildiriliyor.
 * Yarım yazılmış bir katalog, yazılmamış olandan kötüdür.
 *
 * ⚠ Yasa 2: bu bir ÖNERİdir. Dosya çalışma ağacında değişir, onay insanın commit'idir.
 */
const kataloguYaz = (id) => {
  const ad = kaynak[id].ad
  let kaynakKod = readFileSync(KATALOG_YOLU, 'utf8')
  // id → const adı eşlemesi DOSYADAN okunuyor: elle yazılmış bir tablo, dosya
  // yeniden adlandırıldığı gün sessizce yanlış bloğa yazardı.
  const harita = /export const ORNEKLER[^{]*\{([^}]*)\}/.exec(kaynakKod)?.[1] ?? ''
  // ⚠ Anahtar TIRNAKLI da olabilir TIRNAKSIZ da: `'akan-alan':` ve `sahne:` aynı
  // dosyada yan yana duruyor (tireli olan tanımlayıcı değil). İlk sürüm yalnız
  // tırnaklıyı arıyordu ve tam da tırnaksız olanlarda "sabit adı bulunamadı" diyordu.
  const sabit = new RegExp("(?:'" + ad + "'|" + ad + ')\\s*:\\s*([A-Z_0-9]+)').exec(harita)?.[1]
  if (sabit === undefined) return { ok: false, sebep: ad + ' icin sabit adi bulunamadi' }
  const bas = kaynakKod.indexOf('export const ' + sabit)
  if (bas < 0) return { ok: false, sebep: sabit + ' blogu bulunamadi' }
  const sonrakiler = [...kaynakKod.slice(bas + 10).matchAll(/\nexport const /g)]
  const son = sonrakiler.length === 0 ? kaynakKod.length : bas + 10 + sonrakiler[0].index

  let blok = kaynakKod.slice(bas, son)
  const yeni = calisan[id]
  const eski = diskteki[id]
  const degisiklikler = []
  const yeniAlanlar = []
  // ⚠ ⚠ **ALAN LİSTESİ TEK YERDE.** Editör bir alanı düzenleyebiliyor ama yazıcı onu
  // tanımıyorsa değişiklik SESSİZCE kayboluyor — kullanıcı kaydetti sanır, dosyada iz
  // yoktur. Editörün düzenlediği her metin alanı buraya da girmek zorunda.
  const METIN_ALANLARI = [
    'baslik',
    'govde',
    'ustBaslik',
    'elYazisi',
    'hayalet',
    'rayaSol',
    'rayaOrta',
    'kolon',
    'zemin',
  ]

  for (let i = 0; i < yeni.kartlar.length; i++) {
    for (const alan of METIN_ALANLARI) {
      const a = eski.kartlar[i]?.[alan]
      const b = yeni.kartlar[i]?.[alan]
      if (a === b) continue
      if (a === undefined) {
        // Alan kaynakta YOK: yeni satır ekleniyor (çapa `baslik:`), değiştirilmiyor.
        yeniAlanlar.push({ i, satir: '\n      ' + alan + ': ' + tsKacir(b) + ',' })
        degisiklikler.push('kart ' + (i + 1) + ' · ' + alan + ' (yeni)')
        continue
      }
      const arama = alan + ': ' + tsKacir(a)
      const adet = blok.split(arama).length - 1
      if (adet !== 1)
        return {
          ok: false,
          sebep:
            'kart ' +
            (i + 1) +
            ' ' +
            alan +
            ': eski deger blokta ' +
            adet +
            ' kez geciyor — belirsiz, hicbir sey yazilmadi',
        }
      blok = blok.replace(arama, alan + ': ' + tsKacir(b))
      degisiklikler.push('kart ' + (i + 1) + ' · ' + alan)
    }
  }

  // ── ayar (kaydırma + punto) ve panel silme ──────────────────────────────
  //
  // ⚠ `ayar` alanı kaynakta ÇOĞUNLUKLA YOK: var olan bir literali değiştirmek yerine
  // yeni bir satır EKLEMEK gerekiyor. Çapa `baslik:` — her kartta var ve boş olamaz.
  // Kart sınırı da ondan çıkıyor: i'inci kart, i'inci `baslik:` satırının etrafı.
  const baslikYerleri = []
  {
    let k = -1
    while ((k = blok.indexOf('\n      baslik:', k + 1)) >= 0) baslikYerleri.push(k)
  }
  if (baslikYerleri.length !== yeni.kartlar.length)
    return {
      ok: false,
      sebep:
        'kart sayisi tutmuyor (' +
        baslikYerleri.length +
        ' vs ' +
        yeni.kartlar.length +
        ') — hicbir sey yazilmadi',
    }

  // Kaynakta olmayan alanlar `baslik:` çapasının önüne ekleniyor. Sondan başa,
  // çünkü bir ekleme sonraki çapaların konumunu kaydırır.
  for (const { i, satir } of [...yeniAlanlar].sort((a, b) => b.i - a.i)) {
    const bas = baslikYerleri[i]
    if (bas === undefined)
      return { ok: false, sebep: 'kart ' + (i + 1) + ' capasi yok — hicbir sey yazilmadi' }
    blok = blok.slice(0, bas) + satir + blok.slice(bas)
  }
  // Çapa konumları ekleme sonrası TAZELENİYOR: `ayar` döngüsü bayat konum kullanırsa
  // satırı yanlış karta yazar.
  baslikYerleri.length = 0
  {
    let k = -1
    while ((k = blok.indexOf('\n      baslik:', k + 1)) >= 0) baslikYerleri.push(k)
  }

  // Sondan başa: bir eklemenin sonraki kartların konumunu kaydırmaması için.
  for (let i = yeni.kartlar.length - 1; i >= 0; i--) {
    const a = eski.kartlar[i],
      b = yeni.kartlar[i]
    if (JSON.stringify(a?.ayar ?? null) === JSON.stringify(b?.ayar ?? null)) continue
    const bas = baslikYerleri[i]
    const kartSonu = i + 1 < baslikYerleri.length ? baslikYerleri[i + 1] : blok.length
    const govde = blok.slice(bas, kartSonu)
    const mevcut = /\n      ayar: \{[^\n]*\},/.exec(govde)
    const satir =
      b.ayar === undefined || Object.keys(b.ayar).length === 0
        ? ''
        : '\n      ayar: ' +
          JSON.stringify(b.ayar)
            .replace(/"([A-Za-z]+)":/g, '$1: ')
            .replace(/[{]/g, '{ ')
            .replace(/[}]/g, ' }')
            .replace(/,/g, ', ') +
          ','
    const yeniGovde = mevcut === null ? satir + govde : govde.replace(mevcut[0], satir)
    blok = blok.slice(0, bas) + yeniGovde + blok.slice(kartSonu)
    degisiklikler.push('kart ' + (i + 1) + ' · ayar')
  }

  // Panel silme: `panel: { … }` bloğu parantez eşleyerek `panel: null` oluyor.
  for (let i = 0; i < yeni.kartlar.length; i++) {
    if (eski.kartlar[i]?.panel == null || yeni.kartlar[i]?.panel != null) continue
    const bas = blok.indexOf('\n      panel: {', baslikYerleri[i] ?? 0)
    if (bas < 0)
      return {
        ok: false,
        sebep: 'kart ' + (i + 1) + ' panel blogu bulunamadi — hicbir sey yazilmadi',
      }
    let derinlik = 0,
      j = blok.indexOf('{', bas)
    for (; j < blok.length; j++) {
      if (blok[j] === '{') derinlik++
      else if (blok[j] === '}') {
        derinlik--
        if (derinlik === 0) break
      }
    }
    blok = blok.slice(0, bas) + '\n      panel: null' + blok.slice(j + 1)
    degisiklikler.push('kart ' + (i + 1) + ' · panel silindi')
  }

  // Görsel yuvaları: dizi YENİDEN KURULMUYOR, satırdaki SAYILAR değiştiriliyor.
  //
  // ⚠ ⚠ İlk sürüm diziyi veriden yeniden kuruyor ve içinde yorum görünce tüm işlemi
  // reddediyordu — alakasız bir metin düzenlemesi bile bir yorum yüzünden yazılamıyordu.
  // Yorumlar bu dosyanın asıl değeri; onları engel saymak yanlış soruydu. Doğru soru:
  // yorumu hiç okumadan yalnız değişen sayıya dokunmak.
  const gorselDegisti = JSON.stringify(eski.gorseller) !== JSON.stringify(yeni.gorseller)
  if (gorselDegisti) {
    const m = /(\n  gorseller: \[\n)([\s\S]*?)(\n  \],)/.exec(blok)
    if (m === null)
      return { ok: false, sebep: 'gorseller dizisi bulunamadi — hicbir sey yazilmadi' }
    const satirlar = m[2].split('\n')
    let sira = -1
    const yeniSatirlar = satirlar.map((satir) => {
      if (!/\{\s*src:/.test(satir)) return satir
      sira++
      const a = eski.gorseller[sira]
      const b = yeni.gorseller[sira]
      if (a === undefined || b === undefined) return satir
      let cikti = satir
      for (const alan of ['x', 'y', 'genislik', 'yukseklik']) {
        if (a[alan] === undefined || a[alan] === b[alan]) continue
        const kural = new RegExp('(\\b' + alan + ': )' + a[alan] + '(?=[,}\\s])')
        if (!kural.test(cikti)) return satir
        cikti = cikti.replace(kural, '$1' + b[alan])
      }
      return cikti
    })
    if (sira + 1 !== yeni.gorseller.length)
      return {
        ok: false,
        sebep:
          'gorsel satiri sayisi tutmuyor (' +
          (sira + 1) +
          ' vs ' +
          yeni.gorseller.length +
          ') — hicbir sey yazilmadi',
      }
    blok = blok.replace(m[0], m[1] + yeniSatirlar.join('\n') + m[3])
    degisiklikler.push('gorsel yuvalari (' + yeni.gorseller.length + ')')
  }

  // ── belge düzeyi: yerleşim, belge zemini, tipografi reçetesi ─────────────
  //
  // ⚠ Tipografi sayıları `alan: 0.98,` biçiminde tek satırda; ondalık gösterimi
  // KAYNAKTAKİYLE aynı olmalı, yoksa eşleşme tutmaz. Bu yüzden eski değer sayı
  // olarak değil, kaynaktaki YAZILIŞIYLA aranıyor.
  for (const alan of ['yerlesim', 'zemin', 'baslikSutunu']) {
    const a = eski[alan],
      b = yeni[alan]
    if (a === b || b === undefined) continue
    if (a === undefined)
      return {
        ok: false,
        sebep: alan + ' kaynakta yok, eklenmesi elle yapilmali — hicbir sey yazilmadi',
      }
    const arama = '\n  ' + alan + ': ' + tsKacir(a)
    if (blok.split(arama).length - 1 !== 1)
      return { ok: false, sebep: alan + ': eski deger belirsiz — hicbir sey yazilmadi' }
    blok = blok.replace(arama, '\n  ' + alan + ': ' + tsKacir(b))
    degisiklikler.push('belge · ' + alan)
  }
  for (const [alan, b] of Object.entries(yeni.tipografi ?? {})) {
    const a = (eski.tipografi ?? {})[alan]
    if (a === b || a === undefined) continue
    const kural = new RegExp('(\\n    ' + alan + ': )(-?[0-9.]+)')
    if (!kural.test(blok))
      return { ok: false, sebep: 'tipografi.' + alan + ' bulunamadi — hicbir sey yazilmadi' }
    blok = blok.replace(kural, '$1' + b)
    degisiklikler.push('tipografi · ' + alan)
  }

  if (degisiklikler.length === 0) return { ok: false, sebep: 'degisiklik yok' }
  writeFileSync(KATALOG_YOLU, kaynakKod.slice(0, bas) + blok + kaynakKod.slice(son))
  diskteki[id] = structuredClone(yeni)
  return { ok: true, degisiklikler }
}

/**
 * ⚠ ⚠ **BU FONKSİYONUN İLK SÜRÜMÜ HİÇ ÇALIŞMADI ve bunu SÖYLEMEDİ.**
 *
 * `panoramaDenetle` kendi sayfasını kuran bir async fonksiyon — döndürdüğü şey bir
 * Promise. İlk sürüm onu `page.evaluate()`e veriyordu; tarayıcı "Unexpected identifier
 * 'Promise'" diye patlıyor, hata `r.ok` false'a düşüyor ve fonksiyon BOŞ LİSTE
 * döndürüyordu. Panelde "✓ kusur yok" yazıyordu — ölçüm yapılmadığı için.
 *
 * ⚠ Bu, bu turda ölçüm aletinin kendisinin bozuk çıktığı KAÇINCI kez olduğu artık
 * sayılmıyor. Kural netleşti: **başarısız bir ölçüm "temiz" değildir.** Artık hata
 * yutulmuyor, panele yazılıyor.
 */
const olcum = async (id) => {
  const { panoramaDenetle } = await import(join(REPO, 'packages/render/dist/panorama-denetim.js'))
  const r = await panoramaDenetle(belge(id))
  if (!r.ok)
    return [
      {
        tur: 'ÖLÇÜM BAŞARISIZ',
        kart: null,
        alan: null,
        aciklama: String(r.error?.message ?? r.error),
      },
    ]
  return r.value
}

const govde = (req) =>
  new Promise((c) => {
    let s = ''
    req.on('data', (x) => (s += x))
    req.on('end', () => c(s))
  })

/**
 * Geri/ileri YIĞINLARI — id başına.
 *
 * ⚠ ⚠ **İLK SÜRÜM TEK SLOTTU ve bu bir kolaylık eksiği değil, bir GÜVEN eksiğiydi.**
 * `yedek[id]` yalnız SON değişikliği tutuyordu: üç düzenleme yapıp iki kez geri almak
 * imkânsızdı ve ikinci "geri al" hiçbir şey yapmadan sessizce geçiyordu. Elle düzeltme
 * yapan biri denemekten çekinir — geri alınamayan bir deneme, denenmemiş demektir.
 *
 * ⚠ Tavan 50: bellek sınırsız büyümesin. Aşınca EN ESKİ atılıyor; kullanıcı elli adım
 * geri gitmek isterse zaten `git diff` var (şablon modu) ya da koşu defteri (koşu modu).
 */
const TAVAN = 50
const geriYigin = {}
const ileriYigin = {}

const anlikGoruntuAl = (id) => {
  const y = (geriYigin[id] ??= [])
  y.push(structuredClone(calisan[id]))
  if (y.length > TAVAN) y.shift()
  // Yeni bir düzenleme ileri geçmişi geçersiz kılar: dallanmış bir geçmiş,
  // "ileri" düğmesine basınca beklenmedik bir duruma atlamak demekti.
  ileriYigin[id] = []
}
// ⚠ ⚠ **ROL LİSTESİ TEK YERDEN — iki okuyucu var ve ikisi AYNI listeyi görmek zorunda.**
// `/rampa` onu ekrana koyuyor, `/gorsel-ara-koy` gelen rengin gerçekten var olduğunu
// sınıyor. İkisi ayrı yazılsaydı biri güncellenir öteki unutulurdu ve editör var olmayan
// bir rolü seçenek diye sunardı.
const rampaRolleri = () => {
  const kreatif = /\[data-surface='kreatif'\]\s*\{([^}]*)\}/.exec(tokenCss)?.[1] ?? ''
  return [...kreatif.matchAll(/(--role-[\w-]+)\s*:/g)].map((m) => m[1])
}

const sunucu = createServer(async (req, res) => {
  const u = new URL(req.url, 'http://x')
  // ⚠ Her istekte yeniden taranıyor: editör açıkken üretilen koşu da listeye girsin.
  // ⚠ `?elenmis=1` emekli koşuları da yüklüyor — gizleme geri dönüşlü olsun diye.
  const elenmisDe = u.searchParams.get('elenmis') === '1'
  kosulariYukle()
  const id = u.searchParams.get('id') ?? Object.keys(calisan)[0]
  const json = (v) => {
    res.writeHead(200, { 'content-type': 'application/json' })
    res.end(JSON.stringify(v))
  }
  try {
    if (u.pathname === '/') {
      res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' })
      return res.end(KABUK(id, elenmisDe))
    }
    if (u.pathname === '/istemci.js') {
      res.writeHead(200, { 'content-type': 'text/javascript; charset=utf-8' })
      return res.end(readFileSync(join(REPO, 'scripts/duzenleyici-istemci.js'), 'utf8'))
    }
    // ⚠ ⚠ **RENK SERBEST SEÇİLMİYOR, RAMPADAN SEÇİLİYOR.** Serbest bir hex girişi
    // marka ihlalidir (R-35) ve `tokens` kapısı onu zaten reddeder — ama kapıya
    // çarpmadan ÖNCE engellemek daha iyi: editör yalnız var olan rolleri sunuyor.
    // Liste türetilmiş token dosyasından OKUNUYOR, elle yazılmıyor; marka paleti
    // değişince editör kendiliğinden güncelleniyor.
    if (u.pathname === '/rampa') return json(rampaRolleri().map((r) => 'var(' + r + ')'))
    if (u.pathname === '/pano')
      return json({
        html: panoramaHtml(belge(id)),
        // ⚠ ⚠ **ÖLÇÜM GEÇİŞLERİ DE GİDİYOR — ve bunlar OLMADAN önizleme YALAN SÖYLÜYORDU.**
        // Bu dosyanın başlığı *"aynı render motoru, ikinci bir önizleme değil"* diyor ve
        // HTML için doğruydu: `panoramaHtml` paylaşılıyor. Ama `renderPanorama` o HTML'i
        // kurduktan SONRA beş geçiş daha koşuyor ve en büyüğü (`puntoOlcumu`) CSS'in kart
        // başına hesapladığı puntoları TEK ölçülmüş değerle değiştiriyor. Editör o
        // geçişleri hiç koşmuyordu.
        //
        // ⚠ ⚠ **FARK ÖLÇÜLDÜ ve küçük değil.** Aynı belgede editör 132/127/111/133 px
        // gösteriyor, render hepsini 110/79/79/79'a çekiyor; başlıklar 39–103 px
        // kayıyor, gövdeler aynı kadar ters yöne. Depo sahibi: *"editörde böyle görünen
        // yazılar varlıklarda kayıyor, bu ciddi bir problem."* Haklıydı — insan bir
        // düzeni onaylıyor, yayına başka bir düzen gidiyordu.
        //
        // ⚠ Geçişler SUNUCUDA üretiliyor, istemcide değil: betikleri istemciye yeniden
        // yazdırmak, aynı kuralın ikinci kopyası olurdu.
        gecisler: [
          puntoOlcumu(belge(id)),
          knockoutOlcumu(),
          aksanAlaniOlcumu(),
          okNisaniOlcumu(),
          metinMaskesi(),
        ],
        doc: calisan[id],
        // ⚠ Derinlik İSTEMCİYE bildiriliyor: "geri al" düğmesi tıklanabilir görünüp
        // hiçbir şey yapmıyorsa kullanıcı düzenlemenin kaydedildiğini sanır.
        geri: (geriYigin[id] ?? []).length,
        ileri: (ileriYigin[id] ?? []).length,
      })
    if (u.pathname === '/olc') return json(await olcum(id))
    if (u.pathname === '/degistir') {
      const d = JSON.parse(await govde(req))
      anlikGoruntuAl(id)
      if (d.tur === 'gorsel') {
        const g = calisan[id].gorseller[d.i]
        // ⚠ ⚠ **YALNIZ GELEN ALAN YAZILIYOR — verilmeyeni SIFIRLAMAK yerine dokunmuyoruz.**
        // İlk sürüm üç alanı koşulsuz atıyordu; köşe tutamacı yükseklik de gönderince
        // taşıma hareketi (yalnız x/y yollayan) yüksekliği `undefined` yapardı. Kısmi
        // güncelleme bu depoda tekrar eden bir tuzak: `tipo` da tek nesne olduğu için
        // aynı dersi öğrenmişti.
        if (g) {
          for (const alan of ['x', 'y', 'genislik', 'yukseklik']) {
            if (typeof d[alan] === 'number') g[alan] = d[alan]
          }
          // Döndürme tutamacı: nötr değer alanı SİLİYOR (madde 2'nin kuralı).
          if (d.donusZ === null || d.donusZ === 0) delete g.donusZ
          else if (typeof d.donusZ === 'number') g.donusZ = d.donusZ
        }
      } else if (d.tur === 'ayar') {
        // ⚠ Nötr ayar SİLİNİYOR, sıfır olarak yazılmıyor: `{dx:0,dy:0,olcek:1}` kataloga
        // gürültü olarak düşerdi ve şablonun "hiç ayar yok" hâli okunmaz olurdu.
        const k = calisan[id].kartlar[d.i]
        if (k) {
          const ayar = { ...(k.ayar ?? {}) }
          // Mevcut ayar: kısmi güncellemede korunacak alanların kaynağı.
          const a = ayar[d.alan] ?? {}
          const yeni = {}
          if (d.dx) yeni.dx = d.dx
          if (d.dy) yeni.dy = d.dy
          if (d.olcek !== undefined && d.olcek !== 1) yeni.olcek = d.olcek
          if (d.z !== undefined && d.z !== null) yeni.z = d.z
          // ⚠ ⚠ **KUTU ÖLÇÜSÜ — depo sahibi: *"yazıların kutucukları sağa sola yukarı
          // aşağı genişletilebilmeli, bazen sığmıyor."*** Punto çarpanı bu derdi
          // çözmüyordu: yazıyı küçültüyor, kutuyu genişletmiyor. Şablonun sütunu bir
          // `max-width` duvarı ve onu ancak kutu ölçüsü aşabiliyor.
          //
          // ⚠ Kısmi güncelleme: GELMEYEN alana dokunulmuyor. Taşıma hareketi yalnız
          // dx/dy yolluyor; koşulsuz atama, taşırken genişliği SİLERDİ. Bu tuzak bu
          // dosyada `gorsel` dalında bir kez yaşandı ve yorumu hemen üstte duruyor.
          // ⚠ ⚠ **ÜÇ HÂL, ÜÇ DAVRANIŞ ve ikisini karıştırmak veri kaybettirir.**
          //   · sayı geldi        → yaz
          //   · `null` geldi      → SİL (şablona dön). Silmenin bir ADI olmak zorunda.
          //   · hiç gelmedi       → DOKUNMA. Taşıma hareketi yalnız dx/dy yolluyor;
          //                         koşulsuz atama, taşırken genişliği silerdi.
          if (typeof d.en === 'number') yeni.en = d.en
          else if (d.en !== null && a.en !== undefined) yeni.en = a.en
          if (typeof d.boy === 'number') yeni.boy = d.boy
          else if (d.boy !== null && a.boy !== undefined) yeni.boy = a.boy
          if (Object.keys(yeni).length === 0) delete ayar[d.alan]
          else ayar[d.alan] = yeni
          const kalan = { ...k }
          delete kalan.ayar
          calisan[id].kartlar[d.i] = Object.keys(ayar).length === 0 ? kalan : { ...kalan, ayar }
        }
      } else if (d.tur === 'gorsel-alan') {
        const g = calisan[id].gorseller[d.i]
        if (g) {
          // ⚠ ⚠ **NÖTR DEĞER SİLİNİYOR, `undefined` YAZILMIYOR — aynı ders `kart-alan`da
          // zaten öğrenilmişti.** `{ ...g, donusY: undefined }` anahtarı VAR ama değeri
          // yok bir nesne üretiyor; JSON'a yazılırken düşüyor ama bellekteki nesne
          // "alanı olan" bir görsel gibi davranıyor. Dönüş sıfırken `transform` hiç
          // yazılmamalı: boş bir `transform` bile ögeyi kendi yığın bağlamına sokar ve
          // `z-index` davranışını sessizce değiştirir.
          const yeni = { ...g }
          if (d.deger === undefined || d.deger === null) delete yeni[d.alan]
          else yeni[d.alan] = d.deger
          calisan[id].gorseller[d.i] = yeni
        }
      } else if (d.tur === 'bant-tip') {
        // ⚠ ⚠ **SÜS KAPATILABİLİR.** `sus-metni-kesiyor` ölçülüyor ama metinle
        // düzelmiyor (borç D23); insanın elindeki tek gerçek çare süsü kaldırmak.
        // ⚠ Tip değişince ÖGELER korunuyor: `yok`tan geri dönüldüğünde oklar yerinde.
        const mevcut = calisan[id].bant ?? {}
        calisan[id] = { ...calisan[id], bant: { ...mevcut, tip: d.deger } }
      } else if (d.tur === 'belge-alan') {
        // Belge kökündeki alan: `yerlesim`, `zemin`, `baslikSutunu`…
        calisan[id] = { ...calisan[id], [d.alan]: d.deger }
      } else if (d.tur === 'tipo') {
        // ⚠ Tipografi reçetesi TEK NESNE: alanı tek tek yazmak, verilmeyenleri
        // silerdi. Var olanın üstüne biniyor.
        calisan[id] = {
          ...calisan[id],
          tipografi: { ...(calisan[id].tipografi ?? {}), [d.alan]: d.deger },
        }
      } else if (d.tur === 'kart-alan') {
        const k = calisan[id].kartlar[d.i]
        if (k) {
          // ⚠ `undefined` yazmak yerine alanı KALDIRIYORUz: `zemin: undefined` taşıyan
          // bir kart, zemini olan bir karttan farklı davranıyor (JSON'a da giriyor).
          const yeniKart = { ...k }
          if (d.deger === null || d.deger === '') delete yeniKart[d.alan]
          else yeniKart[d.alan] = d.deger
          calisan[id].kartlar[d.i] = yeniKart
        }
      } else if (d.tur === 'sil') {
        // Boş değer alana göre: metin '' olur, panel null.
        const bos = {
          baslik: '',
          govde: '',
          ustBaslik: '',
          elYazisi: '',
          panel: null,
          rayaSol: '',
          rayaOrta: '',
        }
        const k = calisan[id].kartlar[d.i]
        if (k && d.alan in bos) calisan[id].kartlar[d.i] = { ...k, [d.alan]: bos[d.alan] }
      } else {
        const alan = d.sec.split(' ')[0]
        const harita = {
          baslik: 'baslik',
          govde: 'govde',
          'ust-baslik': 'ustBaslik',
          'el-yazisi': 'elYazisi',
          // ⚠ Alt ray da düzenlenebilir: künye kartın en çok gözden geçirilen parçası
          // (kaynak, alan adı) ve düzeltmesi için koşuyu baştan üretmek gerekiyordu.
          'ray-sol': 'rayaSol',
          'ray-orta': 'rayaOrta',
        }
        const k = calisan[id].kartlar[d.i]
        if (k && harita[alan]) k[harita[alan]] = d.deger.trim()
      }
      return json({ ok: true })
    }
    // ── elle görsel yerleştirme (FAZ-16.3) ─────────────────────────────────
    //
    // ⚠ ⚠ **ŞABLONA SABİT FOTOĞRAF KONMUYOR ve bu bir kısıt değil, kuralın kendisi.**
    // Katalog taslağı bir DÜZEN; yuvası `src: ''` ile boş duruyor çünkü onu her koşuda
    // o konunun görseli dolduruyor. Taslağa belirli bir fotoğraf gömmek, o şablondan
    // üretilecek BÜTÜN gelecek karosellerin aynı fotoğrafı taşıması demekti — katalog
    // mantığı (Yasa 13) tam olarak burada çökerdi.
    //
    // ⚠ Koşuya koymak meşru: orada görsel zaten o karoselin kendi varlığı. Dosya
    // koşu dizinine yazılıyor ve belge onun ADINI taşıyor (D-302 referans biçimi).
    if (u.pathname === '/gorsel-koy') {
      const d = JSON.parse(await govde(req))
      const k = kaynak[id]
      res.writeHead(200, { 'content-type': 'text/plain; charset=utf-8' })
      if (k?.tur !== 'kosu')
        return res.end(
          '✗ şablona sabit görsel konmaz — o şablondan üretilecek HER karosel bu\n' +
            '  fotoğrafı taşırdı (Yasa 13). Bir koşu seç ve oraya koy.'
        )
      const g = calisan[id].gorseller[d.i]
      if (g === undefined) return res.end('✗ ' + (d.i + 1) + '. yuva yok')
      const uz = (d.mime ?? '').includes('jpeg')
        ? 'jpg'
        : (d.mime ?? '').includes('webp')
          ? 'webp'
          : 'png'
      // ⚠ ⚠ **ÜRETİLMİŞ GÖRSELİN ÜSTÜNE YAZILMIYOR — ayrı ada yazılıyor.**
      // İlk sürüm `gorsel-NN.<uz>` diyordu ve bir testte gerçek bir koşunun 1,1 MB'lık
      // kesik öznesini 209 baytlık bir kareye çevirdi. O görsel para ve rastgelelikle
      // üretildi; geri getirilemez. Elle konan varlık `-elle` ekiyle yaşıyor, hattın
      // ürettiği yerinde kalıyor — slaytlarda zaten uyguladığımız kural.
      const ad = 'gorsel-' + String(d.i + 1).padStart(2, '0') + '-elle.' + uz
      writeFileSync(join(k.dizin, ad), Buffer.from(d.veri, 'base64'))
      // ⚠ İnsanın yüklediği dosya da webden GELMİYOR: eski künye kalırsa yüklenen
      // fotoğraf başkasının lisansıyla etiketlenmiş olurdu.
      kaynakKunyesiniSil(k.dizin, d.i + 1)
      calisan[id].gorseller[d.i] = {
        ...g,
        src: 'data:' + (d.mime ?? 'image/png') + ';base64,' + d.veri,
      }
      return res.end(
        '✓ ' + ad + ' yuvaya kondu (' + Math.round((d.veri.length * 0.75) / 1024) + ' KB)'
      )
    }
    // ── arka plan silme: SEÇİLİ görsele, editörden (FAZ-17.2) ───────────────
    //
    // ⚠ ⚠ **HAT BUNU ZATEN YAPIYOR ama düzeltme turunda yapmıyor.** `matlama-tutmuyor`
    // kusuru gerçek bir koşuda çıktı (alfa 127/255) ve insan onu editörde görüyor —
    // görüp düzeltememek, ölçümü bir şikâyete çevirir. Aynı yerel model (`rembg`)
    // burada da çağrılıyor; ikinci bir teknik eklenmiyor.
    // ⚠ Sonuç `-elle` ekiyle yazılıyor: hattın ürettiği asıl görsel yerinde kalıyor
    // ve ikisi karşılaştırılabiliyor.
    if (u.pathname === '/arkaplan-sil') {
      const d = JSON.parse(await govde(req))
      const k = kaynak[id]
      res.writeHead(200, { 'content-type': 'text/plain; charset=utf-8' })
      if (k?.tur !== 'kosu') return res.end('✗ arka plan silme yalnız KOŞU modunda')
      const g = calisan[id].gorseller[d.i]
      if (g === undefined || typeof g.src !== 'string' || !g.src.startsWith('data:'))
        return res.end('✗ ' + (d.i + 1) + '. yuvada görsel yok')
      const b64 = g.src.slice(g.src.indexOf(',') + 1)
      // ⚠ Çağrı ortak yardımcıdan (`arkaplaniSil`): bu dosyada betiği iki ayrı yerden
      // çağırmak, bir gün birinin argümanı değişip ötekinin kalması demekti.
      const r = await arkaplaniSil(b64)
      if (!r.ok) return res.end('✗ silme başarısız: ' + r.sebep)
      writeFileSync(
        join(k.dizin, 'gorsel-' + String(d.i + 1).padStart(2, '0') + '-elle.png'),
        Buffer.from(r.b64, 'base64')
      )
      anlikGoruntuAl(id)
      calisan[id].gorseller[d.i] = { ...g, src: 'data:image/png;base64,' + r.b64 }
      const pay = /saydam-pay=([0-9.]+)/.exec(r.olcum ?? '')?.[1]
      return res.end(
        '✓ ' +
          (d.i + 1) +
          '. görselin arka planı silindi' +
          (pay === undefined ? '' : ' · %' + Math.round(Number(pay) * 100) + ' saydam')
      )
    }

    // ── AKILLI KIRPMA: saydam kenarları at, özneyi kadraja otur (FAZ-19.13) ──
    //
    // ⚠ ⚠ **BU BİR ÖLÇÜMDEN DOĞDU.** Arka planı silinmiş bir görselde tuvalin %30'u
    // BOŞ çıktı (gerçek çıktıda ölçüldü): yuvaya "dolu" giriyor ama özne minicik
    // kalıyor. Depo sahibi: *"görseli akıllıca kırpma kesme çerçeveleme vs gibi
    // şeyler de olmalı."*
    // ⚠ Kesilecek yer alfa kanalından ÖLÇÜLÜYOR, tahmin edilmiyor.
    // ⚠ `oran` verilirse kutu o orana GENİŞLETİLİYOR, sıkıştırılmıyor: sıkıştırmak
    // 3B nesneyi bozar ve bozulmuş bir nesne tasarım hatası gibi okunur.
    if (u.pathname === '/otomatik-kirp') {
      const d = JSON.parse(await govde(req))
      const k = kaynak[id]
      res.writeHead(200, { 'content-type': 'text/plain; charset=utf-8' })
      if (k?.tur !== 'kosu') return res.end('✗ akıllı kırpma yalnız KOŞU modunda')
      const g = calisan[id].gorseller[d.i]
      if (g === undefined || typeof g.src !== 'string' || !g.src.startsWith('data:'))
        return res.end('✗ ' + (d.i + 1) + '. yuvada görsel yok')
      const r = await otomatikKirp(g.src.slice(g.src.indexOf(',') + 1), d.oran)
      if (!r.ok) return res.end('✗ kırpma başarısız: ' + r.sebep)
      if ((r.olcum ?? '').includes('alfa-yok'))
        return res.end(
          '⚠ bu görselin alfa kanalı YOK — önce "✂ arka planı sil".\n' +
            '  Kesilecek yeri söyleyen tek şey alfa; onsuz kırpmak tahmin olurdu.'
        )
      writeFileSync(
        join(k.dizin, 'gorsel-' + String(d.i + 1).padStart(2, '0') + '-elle.png'),
        Buffer.from(r.b64, 'base64')
      )
      kaynakKunyesiniSil(k.dizin, d.i + 1)
      anlikGoruntuAl(id)
      calisan[id].gorseller[d.i] = { ...g, src: 'data:image/png;base64,' + r.b64 }
      const m = /kirpma-orani=([0-9.]+) kutu=(\d+x\d+)/.exec(r.olcum ?? '')
      return res.end(
        m === null
          ? '✓ ' + (d.i + 1) + '. görsel kırpıldı'
          : '✓ ' +
              (d.i + 1) +
              '. görsel kırpıldı — %' +
              Math.round(Number(m[1]) * 100) +
              ' boş kenar kesildi, yeni kutu ' +
              m[2]
      )
    }

    // ── EDİTÖRDEN GÖRSEL ÜRETME (FAZ-17.3) ─────────────────────────────────
    //
    // ⚠ ⚠ **BEĞENİLMEYEN GÖRSELİN TEK ÇARESİ KOŞUYU BAŞTAN ÜRETMEKTİ.** Depo sahibi:
    // *"beğenmediğimizi silip yerine kendimiz ürettirebiliriz istediğimiz gibi
    // özgürce."* Dört slaytlık bir karoselde tek bir görseli beğenmemek, dördünü de
    // yeniden üretmek demekti.
    //
    // ⚠ İstem R-20 MUHAFIZINDAN geçiyor — insanın yazdığı prompt da bir prompt.
    // "Kullanıcı yazdı" bir muafiyet sebebi değil; metin isteyen bir istem, kimin
    // yazdığından bağımsız olarak Türkçe tipografiyi bozuyor.
    //
    // ⚠ Sonuç `-elle` ekiyle diske yazılıyor: hattın ürettiği asıl görsel yerinde
    // kalıyor ve ikisi karşılaştırılabiliyor (aynı kural `/gorsel-koy`da da var).
    // ⚠ ⚠ **DEPO SAHİBİ: *"editörde görsele tıklayınca sağ panelde promptu gör."***
    // Model beklenmedik bir şey çizdiğinde ilk soru *"ona ne dedik"* oluyor ve o cevap
    // şimdiye kadar yalnız hattın defterinde vardı, editörde hiç yoktu.
    if (u.pathname === '/gorsel-istem') {
      const k = kaynak[id]
      const sira = Number(u.searchParams.get('i') ?? '0') + 1
      if (k?.tur !== 'kosu') return json({ ok: false, sebep: 'yalnız koşu' })
      const r = yuvaninIstemi(k.dizin, sira)
      return json(
        r === null ? { ok: false, sebep: 'bu yuvanın istemi kayıtlı değil' } : { ok: true, ...r }
      )
    }

    if (u.pathname === '/gorsel-uret') {
      const d = JSON.parse(await govde(req))
      const k = kaynak[id]
      res.writeHead(200, { 'content-type': 'text/plain; charset=utf-8' })
      if (k?.tur !== 'kosu') return res.end('✗ şablona görsel üretilmez — bir koşu seç (Yasa 13).')
      const g = calisan[id].gorseller[d.i]
      if (g === undefined) return res.end('✗ ' + (d.i + 1) + '. yuva yok')
      const istem = String(d.prompt ?? '').trim()
      if (istem === '') return res.end('✗ istem boş')

      // ⚠ ⚠ **TEK YOL: `gorselUret`.** Burada sağlayıcı ADIYLA çağrılıyordu ve
      // *"yuvaları doldur"* düğmesiyle bu uç iki ayrı sağlayıcı zinciri konuşuyordu.
      // Aynı kural iki yerde yazılınca biri düzeltilir öteki unutulur — bu depoda
      // sıralama dokuz, yayın durumu üç kez böyle ayrıştı. İkisi de artık aynı
      // fonksiyondan geçiyor: ücretli sağlayıcı önce, bedava olan yedek.
      const uretim = await gorselUret(istem, 'editor:' + id + ':' + String(d.i))
      if (!uretim.ok) return res.end('✗ ' + uretim.sebep)
      const b64 = uretim.b64
      const ad = 'gorsel-' + String(d.i + 1).padStart(2, '0') + '-elle.png'
      const yazim = yuvayaYaz(k.dizin, ad, b64)
      if (!yazim.ok) return res.end('✗ ' + yazim.sebep)
      // ⚠ İstem görselle AYNI ANDA yazılıyor (Yasa 7): sonradan retrofit imkânsız.
      istemKunyesiniYaz(k.dizin, d.i + 1, istem, uretim.saglayici)
      kaynakKunyesiniSil(k.dizin, d.i + 1)
      anlikGoruntuAl(id)
      calisan[id].gorseller[d.i] = { ...g, src: 'data:image/png;base64,' + b64 }
      return res.end('✓ ' + (d.i + 1) + '. yuvaya üretildi → ' + ad)
    }

    // ── BOŞ YUVALARI DOLDUR — TEK TUŞLA, HATTIN ADIMLARIYLA (FAZ-19.13) ────
    //
    // ⚠ ⚠ **BU BİR ŞİKÂYETTEN DOĞDU.** Depo sahibi: *"bazen bazı görseller kötü
    // üretiliyor özellikle arkaplanlı görsel üretmek zaten yasak yani görsel değil 3d
    // obje 3d görsel üretmek zorunda ama bazen bunun sınırlarını korumuyor. bu durumda
    // editörde ben o üretilen görseli siliyorum o alanlar boş kalıyor. bir tuş ile boş
    // yuvalara uygun görsel üret diye basınca otomatik üretmeli mükemmelce şablona ve
    // konuya uygun olarak."* Eskiden tek çare her yuvaya elle İngilizce istem yazmaktı
    // — yani şablonun kendi brief temelini ve koşunun görsel dilini insanın ezberden
    // yeniden kurması. Elle yazılan istem, hattın ürettiğinden başka bir şey üretir.
    //
    // ⚠ ⚠ **ÜÇ ADIM, HATTAKİYLE AYNI SIRA:** brief (`gorsel-brief`) → üretim
    // (`gorsel-uret`) → arka plan silme (`gorsel-kirp`). Üçüncüsü atlanamaz: depo
    // sahibinin şikâyetinin ta kendisi arkaplanlı görsel ve model *rica ile* siyah
    // zemin çizmiyor — bu üç gerçek koşuda ölçüldü (D-274). Silme bir RİCA değil,
    // bir İŞLEM.
    //
    // ⚠ Yalnız BOŞ yuvalar: dolu bir yuvanın üstüne üretmek, insanın beğendiği
    // görseli parayla silmek olurdu. Belirli bir yuva isteniyorsa `{i}` veriliyor.
    if (u.pathname === '/yuvalari-doldur') {
      const d = JSON.parse((await govde(req)) || '{}')
      const k = kaynak[id]
      res.writeHead(200, { 'content-type': 'text/plain; charset=utf-8' })
      if (k?.tur !== 'kosu') return res.end('✗ şablona görsel üretilmez — bir koşu seç (Yasa 13).')
      const kimlik = kosuKimligi(k.ad)
      if (kimlik.sablonId === '')
        return res.end('✗ bu koşunun şablonu defterinde yok — brief kurulamaz')
      if (kimlik.konu === '')
        return res.end('✗ bu koşunun konusu defterinde yok — konusuz brief bir tahmindir')

      const gorseller = calisan[id].gorseller ?? []
      const hedefler =
        typeof d.i === 'number'
          ? [d.i]
          : gorseller
              .map((g, i) => (typeof g?.src === 'string' && g.src !== '' ? -1 : i))
              .filter((i) => i >= 0)
      if (hedefler.length === 0) return res.end('✓ boş yuva yok — doldurulacak bir şey bulunamadı')

      const satirlar = ['⚙ ' + hedefler.length + ' boş yuva · şablon ' + kimlik.sablonId]
      let basarili = 0
      for (const i of hedefler) {
        const g = gorseller[i]
        if (g === undefined) {
          satirlar.push('✗ ' + (i + 1) + '. yuva yok')
          continue
        }
        const b = await briefUret(kimlik, i + 1, calisan[id])
        if (!b.ok) {
          satirlar.push((b.bosYuva === true ? '· ' : '✗ ') + (i + 1) + '. yuva: ' + b.sebep)
          continue
        }
        const uretim = await gorselUret(b.istem, 'editor-doldur:' + id + ':' + String(i))
        if (!uretim.ok) {
          satirlar.push('✗ ' + (i + 1) + '. yuva: ' + uretim.sebep)
          continue
        }
        // ⚠ ⚠ **ARKA PLAN SİLME BAŞARISIZSA GÖRSEL YİNE KONUYOR — ama SÖYLENEREK.**
        // Sessizce arkaplanlı bir kare koymak, şikâyetin kaynağını geri getirirdi;
        // hiç koymamak ise üretilmiş (ve ödenmiş) bir görseli çöpe atardı.
        const kirpma = await arkaplaniSil(uretim.b64)
        // ⚠ ⚠ **KIRPMA ZİNCİRİN PARÇASI, AYRI BİR DÜĞME DEĞİL.** Arka planı silinmiş
        // ama kadrajının üçte biri boş bir görsel yuvaya "dolu" girer ve özne minicik
        // kalır. Doldurmanın amacı BİTMİŞ bir sonuç; yarısında bırakmak insanı her
        // yuvada ikinci bir düğmeye mahkûm ederdi.
        // ⚠ Silme başarısızsa kırpma da YAPILMIYOR: alfası olmayan bir görselde
        // kesilecek yeri tahmin etmek gerekirdi.
        // ⚠ ⚠ **KIRPMA YUVANIN ORANINI BİLMEK ZORUNDA — ve ilk sürüm bilmiyordu.**
        // Sıkı sınırlayıcı kutuya kesmek özneyi 1:5 gibi bir şeride çeviriyordu;
        // yuva ise kendi oranını istiyor ve `object-fit` aradaki farkı ya kırparak ya
        // boşluk bırakarak kapatıyor — ikisi de tasarımı bozuyor. Kutu yuvanın
        // oranına GENİŞLETİLİYOR (sıkıştırılmıyor: 3B nesneyi bozardı).
        // ⚠ Oran belgeden ÖLÇÜLÜYOR: `genislik` tuval genişliğinin, `yukseklik`
        // tuval yüksekliğinin yüzdesi — ikisi farklı eksende, o yüzden piksele
        // çevrilmeden bölünemezler.
        const tuvalEni = (calisan[id].slaytGenisligi ?? 1080) * (calisan[id].kartlar ?? []).length
        const tuvalBoyu = calisan[id].yukseklik ?? 1350
        const yuvaEn = Math.max(1, Math.round((g.genislik / 100) * tuvalEni))
        const yuvaBoy = Math.max(1, Math.round((g.yukseklik / 100) * tuvalBoyu))
        const kirp = kirpma.ok
          ? await otomatikKirp(kirpma.b64, `${yuvaEn}:${yuvaBoy}`)
          : { ok: false, sebep: '' }
        const son = kirp.ok ? kirp.b64 : kirpma.ok ? kirpma.b64 : uretim.b64
        const kirpOlcum = /kirpma-orani=([0-9.]+)/.exec(kirp.olcum ?? '')?.[1]
        const ad = 'gorsel-' + String(i + 1).padStart(2, '0') + '-elle.png'
        const yazim = yuvayaYaz(k.dizin, ad, son)
        if (!yazim.ok) {
          satirlar.push('✗ ' + (i + 1) + '. yuva: ' + yazim.sebep)
          continue
        }
        istemKunyesiniYaz(k.dizin, i + 1, b.istem, uretim.saglayici)
        // ⚠ Webden gelen bir görselin künyesi bu yuvada duruyorsa SİLİNİYOR: üretilmiş
        // bir görsele başkasının lisansını iliştirmek yanlış bir atıftır.
        kaynakKunyesiniSil(k.dizin, i + 1)
        anlikGoruntuAl(id)
        calisan[id].gorseller[i] = { ...g, src: 'data:image/png;base64,' + son }
        basarili += 1
        satirlar.push(
          '✓ ' +
            (i + 1) +
            '. yuva → ' +
            ad +
            (kirpma.ok
              ? ' (arka plan silindi' +
                (kirpOlcum === undefined
                  ? ')'
                  : ' · %' + Math.round(Number(kirpOlcum) * 100) + ' boş kenar kesildi)')
              : ' ⚠ ARKA PLAN SİLİNEMEDİ: ' + kirpma.sebep)
        )
        satirlar.push('   brief: ' + b.brief.slice(0, 110))
      }
      if (basarili === 0) {
        satirlar.push('✗ hiçbir yuva doldurulamadı')
        return res.end(satirlar.join('\n'))
      }
      satirlar.push('✓ ' + basarili + " yuva dolduruldu — kaydetmeyi UNUTMA (JSON'u yaz)")
      // ⚠ ⚠ **DOLU YUVA "OLDU" DEMEK DEĞİL — ve bunu İLK GERÇEK DENEME öğretti.**
      // Üç yuvası doldurulan koşuda denetim `metin-gorsel-cakisiyor` ölçtü: gövde
      // metninin %100'ü görselin üstündeydi. Yuvalar boşken o kusur ÇIKAMIYORDU, yani
      // düzen görsellerle hiç sınanmamıştı. Doldurup susmak, ölçülmüş bir kusuru
      // "hazır" diye teslim etmek olurdu.
      // ⚠ Ölçüm ücretsiz (`local-chromium`) ve ZATEN kurulu: yeni bir motor değil,
      // doğru anda çağrılan bir ölçüm.
      const olculen = await olcum(id)
      const cakisma = olculen.filter((x) => String(x.tur).startsWith('metin-gorsel'))
      satirlar.push(
        olculen.length === 0
          ? '✓ denetim temiz — kusur yok'
          : '⚠ denetim ' +
              olculen.length +
              ' kusur ölçtü' +
              (cakisma.length === 0
                ? ''
                : ' · ' +
                  cakisma.length +
                  ' tanesi METİN-GÖRSEL ÇAKIŞMASI: görselin' +
                  ' ölçeğini/konumunu küçült ya da kartın metin kolonunu değiştir')
      )
      for (const x of olculen.slice(0, 6))
        satirlar.push('   · ' + x.tur + (x.kart === null ? '' : ' (kart ' + x.kart + ')'))
      return res.end(satirlar.join('\n'))
    }

    // ── WEBDEN TASARIM ÖGESİ ARAMA (FAZ-19.11) ─────────────────────────────
    //
    // ⚠ ⚠ **ARAMA HATTIN İÇİNDE DEĞİL ve bu bilinçli.** *"üretim hattında otomatik
    // olmayacak"* — hat aynı girdiye aynı çıktıyı vermeye devam ediyor. Dış kaynak
    // yalnız burada, insanın tıkladığı anda giriyor.
    // ⚠ Sonuç FOTOĞRAF değil TASARIM ÖGESİ: kaynak Iconify, 236 açık kaynak set ve
    // sonuç SVG — yani doğası gereği arkaplansız ve çerçevesiz. Elenen kaynakların
    // listesi (`svgrepo` 429 · `poly.pizza` anahtar istiyor · `openverse` fotoğraf
    // getiriyor) modülün başında; bir daha denenmesin diye yazılı.
    // ── ÖNİZLEME VEKİLİ (FAZ-19.13) ────────────────────────────────────────
    //
    // ⚠ ⚠ **BU BİR KUSURDAN DOĞDU ve teşhisi depo sahibi verdi:** *"web arama modal
    // içinde görseller önizlenmiyor, o yüzden seçemiyorum, ancak ekleyince görünüyor."*
    // İkisi arasındaki fark kim çekiyor: EKLEME sunucudan geçiyor ve çalışıyor,
    // ÖNİZLEME tarayıcıdan gidiyordu ve gitmiyordu. Yani tarayıcı dış hostlara
    // ulaşamıyor; sunucu ulaşıyor. Görmeden seçilemeyen bir liste, olmayan bir listedir.
    //
    // ⚠ ⚠ **AÇIK VEKİL DEĞİL — HOST BEYAZ LİSTESİ var.** `?url=` alan bir vekil,
    // beyaz liste olmadan bu makineyi başkasının ağına açan bir delik olurdu (SSRF).
    // Yalnız katalogda adı geçen üç host geçiyor.
    if (u.pathname === '/gorsel-onizleme') {
      const hedef = u.searchParams.get('url') ?? ''
      const IZINLI = [
        'api.iconify.design',
        'raw.githubusercontent.com',
        'upload.wikimedia.org',
        'commons.wikimedia.org',
      ]
      let host = ''
      try {
        const uu = new URL(hedef)
        if (uu.protocol !== 'https:') throw new Error('yalnız https')
        host = uu.hostname
      } catch {
        res.writeHead(400)
        return res.end('gecersiz adres')
      }
      if (!IZINLI.includes(host)) {
        res.writeHead(403)
        return res.end('izinli host degil: ' + host)
      }
      try {
        // ⚠ ⚠ **`user-agent` ŞART — Wikimedia anonim ve tanımsız istekleri REDDEDİYOR.**
        // Ölçüldü: başlıksız istek 400 dönüyor ve önizleme boş kalıyor. Diğer hostlar
        // umursamıyor ama tek bir başlık üçünü de mutlu ediyor.
        const r = await fetch(hedef, {
          signal: AbortSignal.timeout(15_000),
          headers: { 'user-agent': 'creativesuite/1.0 (yerel editör)' },
        })
        if (!r.ok) {
          res.writeHead(502)
          return res.end('kaynak ' + String(r.status))
        }
        const tip = r.headers.get('content-type') ?? ''
        // ⚠ ⚠ **`image/svg+xml` OLARAK SUNULMUYOR.** Bir SVG çalıştırılabilir bir belge ve
        // KENDİ kaynağımızdan sunulursa içindeki betik editörün oturumuyla çalışır. Panel
        // sunucusunda aynı karar bir kez verildi (`/api/varlik/:digest`); burada tekrar
        // ediliyor. SVG düz metin olarak iniyor ve `<img>` içinde çizilmiyor — o yüzden
        // Iconify önizlemesi PNG olarak isteniyor (aşağıda).
        if (!tip.startsWith('image/')) {
          res.writeHead(415)
          return res.end('desteklenmeyen tip: ' + tip)
        }
        // ⚠ ⚠ **SVG GEÇİYOR AMA TEMİZLENEREK ve SERTLEŞTİRİLEREK.** İlk sürüm SVG'yi
        // tamamen reddediyordu ve Iconify önizlemeleri BOŞ çıktı — çünkü Iconify'ın PNG
        // ucu YOK (ölçüldü: `.png` 404). Reddetmek güvenliydi ama ekranı boşalttı;
        // görmeden seçilemeyen bir liste, olmayan bir listedir.
        //
        // ⚠ Üç kat koruma: (1) `temizle` betiği, olay niteliğini, dış başvuruyu ve
        // `<foreignObject>`i söküyor; (2) `default-src 'none'` ile doğrudan gezinilse
        // bile hiçbir şey yükleyemiyor; (3) `sandbox` betik çalıştırmayı kapatıyor.
        // `<img>` bağlamında zaten çalışmıyor — bunlar doğrudan adrese gidilme hâli için.
        if (tip.includes('svg')) {
          const ham = await r.text()
          const temiz = webAra.temizle(ham)
          res.writeHead(200, {
            'content-type': 'image/svg+xml',
            'content-security-policy': "default-src 'none'; style-src 'unsafe-inline'; sandbox",
            'x-content-type-options': 'nosniff',
            'cache-control': 'public, max-age=86400',
          })
          return res.end(temiz)
        }
        const bayt = Buffer.from(await r.arrayBuffer())
        if (bayt.length > 5 * 1024 * 1024) {
          res.writeHead(413)
          return res.end('cok buyuk')
        }
        // ⚠ Önbellek: aynı arama iki kez yapıldığında ikinci kez ağa çıkmıyor.
        res.writeHead(200, { 'content-type': tip, 'cache-control': 'public, max-age=86400' })
        return res.end(bayt)
      } catch (e) {
        res.writeHead(502)
        return res.end('cekilemedi: ' + String(e?.message ?? e))
      }
    }

    if (u.pathname === '/gorsel-ara') {
      const d = JSON.parse(await govde(req))
      const k = kaynak[id]
      // ⚠ Havayı KOŞUNUN KENDİ defterinden okuyoruz, kullanıcıya sormuyoruz: hangi
      // şablondan üretildiği zaten yazılı ve sormak onu yanlış cevaplama fırsatıdır.
      let sablonId = ''
      if (k?.tur === 'kosu') {
        try {
          sablonId =
            JSON.parse(readFileSync(join(k.dizin, 'steps/sablon-uyarla.json'), 'utf8')).uyarlama
              .sablonId ?? ''
        } catch {
          // Defteri okunamayan koşuda süzgeç yok — 236 setin hepsi aranır.
        }
      }
      const r = await webAra.ara(String(d.q ?? ''), {
        sablonId,
        tumSetler: d.tumSetler === true,
        adet: 24,
      })
      return json(r.ok ? { ...r, sablonId } : r)
    }

    // ── ARANAN ÖGEYİ YUVAYA KOYMA ──────────────────────────────────────────
    //
    // ⚠ ⚠ **SVG DEĞİL PNG YAZILIYOR.** Uzak SVG betik taşıyabilir; sunucu bu depoda
    // `/api/varlik/:digest` yolunda `.svg` sunmayı zaten KASTEN reddediyor. Bayt
    // sunucuda temizleniyor, sunucuda rasterleniyor ve yuvaya saydam PNG giriyor —
    // aşağı akıştaki hiçbir yol (blob deposu, damgalama, panel) değişmiyor.
    // ⚠ ⚠ **KIRPMA DA `kesik`E ÇEKİLİYOR ve bu ihmal edilseydi vaat SESSİZCE ÖLÜRDÜ.**
    // Varsayılan `.gorsel` kuralı `object-fit: cover`; kare bir ikon 4:5 yuvada üstten
    // ve alttan KIRPILIR. Yalnız `.gorsel.kesik` `contain` kullanıyor. Katalogda az önce
    // düzeltilen hatanın (`kirpma: 'tam'` yazıp hattın onu hiç okumaması) aynısını
    // burada yeniden üretmemek için beyan ile davranış tek işlemde bağlanıyor.
    if (u.pathname === '/gorsel-ara-koy') {
      const d = JSON.parse(await govde(req))
      const k = kaynak[id]
      res.writeHead(200, { 'content-type': 'text/plain; charset=utf-8' })
      if (k?.tur !== 'kosu')
        return res.end(
          '✗ şablona sabit görsel konmaz — o şablondan üretilecek HER karosel bu\n' +
            '  ögeyi taşırdı (Yasa 13). Bir koşu seç ve oraya koy.'
        )
      const g = calisan[id].gorseller[d.i]
      if (g === undefined) return res.end('✗ ' + (d.i + 1) + '. yuva yok')
      // ⚠ Alan adı `tam`: ARAMA ÇIKTISININ alanı. İlk sürüm `ikon` okuyordu ve istemci
      // sonucun tamamını yayıyordu (`...o`) — iki uç aynı nesneyi iki farklı adla
      // bekleyince koyma sessizce *"ikon kimliği geçersiz: "* diyordu, BOŞ bir adla.
      // Sözleşme tek yerden, arama ne veriyorsa koyma onu okur.
      const tam = String(d.tam ?? d.ikon ?? '')

      // ⚠ ⚠ **İKİ AYRI YOL: RASTER ve VEKTÖR.** 3dicons ve Fluent Emoji hazır PNG
      // veriyor — SVG temizleyicisine ve rasterleme sayfasına ihtiyaç YOK, çünkü bayt
      // zaten bir görüntü ve betik taşımıyor. Iconify SVG veriyor ve o yol olduğu gibi
      // duruyor. İkisini tek yola zorlamak, ya PNG'yi gereksiz bir tarayıcıdan
      // geçirmek ya da SVG'yi temizlemeden koymak olurdu.
      const hazirUrl = String(d.pngUrl ?? '')
      if (hazirUrl !== '') {
        const h = await webAra.hazirPngCek(hazirUrl)
        if (!h.ok) return res.end('✗ ' + h.hata)
        const adH = 'gorsel-' + String(d.i + 1).padStart(2, '0') + '-elle.png'
        writeFileSync(join(k.dizin, adH), Buffer.from(h.b64, 'base64'))
        // ⚠ Kaynak damgası AYNI ANDA: bir varlığın nereden geldiği yuvaya girerken
        // bilinmiyorsa altı ay sonra hiç bilinmeyecek (Yasa 7).
        writeFileSync(
          join(k.dizin, adH.replace(/\.png$/, '.kaynak.json')),
          JSON.stringify(
            {
              ikon: tam,
              set: String(d.kaynak ?? ''),
              lisans: String(d.lisans ?? ''),
              spdx: String(d.spdx ?? ''),
              url: hazirUrl,
              bayt: h.bayt,
              tur: 'raster',
            },
            null,
            1
          ),
          'utf8'
        )
        anlikGoruntuAl(id)
        // ⚠ ⚠ **KIRPMA `kesik`e ÇEKİLİYOR — SVG yolundaki kararın AYNISI.** 3D render
        // kare bir tuvalde geliyor; 4:5 bir yuvada `tam` ile konursa kenarları kırpılır
        // ve nesnenin bir parçası kaybolur. Aynı kural iki yolda ayrı yazılsaydı biri
        // düzelir öteki unuturdu.
        calisan[id].gorseller[d.i] = {
          ...g,
          src: 'data:image/png;base64,' + h.b64,
          kirpma: 'kesik',
        }
        return res.end(
          '✓ ' +
            tam +
            ' → ' +
            adH +
            '\n  kaynak: ' +
            String(d.setAdi ?? d.kaynak ?? '?') +
            ' · lisans: ' +
            String(d.lisans ?? '?') +
            ' · ' +
            String(Math.round(h.bayt / 1024)) +
            ' KB'
        )
      }

      const s = await webAra.svgCek(tam)
      if (!s.ok) return res.end('✗ ' + s.hata)
      // ⚠ ⚠ **BİLİNMEYEN ROL SESSİZCE SİYAH ÇİZİYORDU — artık REDDEDİLİYOR.** Sınamada
      // uydurma bir rol (`--role-kreatif-aksan`) yazıldı; `var()` çözülemedi, `color`
      // geçersiz oldu ve iki farklı renkle konan iki ikon BİREBİR aynı baytı verdi.
      // Sessiz düşüş bu depoda tekrar eden en pahalı sınıf: çıktıya bakmadan görülmüyor.
      const istenenRenk = String(d.renk ?? '').trim()
      const rolAdi = /^var\((--[\w-]+)\)$/.exec(istenenRenk)?.[1] ?? ''
      if (istenenRenk !== '' && rolAdi === '')
        return res.end('✗ renk yalnız rampadan seçilir, serbest değer yok (R-35): ' + istenenRenk)
      if (rolAdi !== '' && !rampaRolleri().includes(rolAdi))
        return res.end(
          '✗ rampada böyle bir rol yok: ' + rolAdi + '\n  var olanlar: ' + rampaRolleri().join(', ')
        )
      const seciliRol = istenenRenk
      const p = await webAra.pngYap(s.svg, {
        genislik: 1024,
        yukseklik: 1024,
        // ⚠ Renk RAMPADAN geliyor, serbest hex DEĞİL (R-35). İkon `currentColor`
        // kullanıyor, sayfa token CSS'ini taşıyor; ara bir hex dönüşümü yok.
        renk: seciliRol,
        tokenCss,
        withPage,
      })
      if (!p.ok) return res.end('✗ ' + p.hata)
      const ad = 'gorsel-' + String(d.i + 1).padStart(2, '0') + '-elle.png'
      writeFileSync(join(k.dizin, ad), Buffer.from(p.b64, 'base64'))
      // ⚠ ⚠ **NEREDEN GELDİĞİ AYNI ANDA YAZILIYOR — sonradan retrofit imkânsız (Yasa 7).**
      // §17 bu depoda bir sesi *"ticari lisansı YOK"* diye reddetti; bir varlığın
      // lisansı, varlık yuvaya girerken bilinmiyorsa altı ay sonra hiç bilinmeyecek.
      writeFileSync(
        join(k.dizin, ad.replace(/\.png$/, '.kaynak.json')),
        JSON.stringify(
          {
            ikon: tam,
            set: String(d.set ?? ''),
            lisans: String(d.lisans ?? ''),
            spdx: String(d.spdx ?? ''),
            lisansUrl: String(d.lisansUrl ?? ''),
            yazar: String(d.yazar ?? ''),
            kaynakUrl: String(d.kaynakUrl ?? ''),
            saglayici: 'iconify',
          },
          null,
          2
        ) + '\n'
      )
      anlikGoruntuAl(id)
      calisan[id].gorseller[d.i] = {
        ...g,
        src: 'data:image/png;base64,' + p.b64,
        kirpma: 'kesik',
      }
      return res.end(
        '✓ ' +
          tam +
          ' → ' +
          ad +
          '\n  lisans: ' +
          String(d.lisans ?? '?') +
          ' · kırpma `kesik`e çekildi (yoksa kare öge 4:5 yuvada kırpılırdı)'
      )
    }

    // ── DIŞA AKTARMA: editörden de (FAZ-17.3) ──────────────────────────────
    //
    // ⚠ Belge BELLEKTEKİ çalışan kopyadan: editörde yaptığın düzenleme indirilen
    // dosyada olmalı, yoksa "gördüğün şey ihraç edilen şeydir" vaadi kırılır.
    if (u.pathname === '/disa-aktar') {
      const tarz = u.searchParams.get('tarz') === 'butun' ? 'butun' : 'dilim'
      const ham = u.searchParams.get('bicim')
      const bicim = ham === 'png' || ham === 'jpg' || ham === 'pdf' ? ham : 'png'
      const parcaNo = Number(u.searchParams.get('parca') ?? '0')
      const r = await panoramaDisaAktar(belge(id), { tarz, bicim })
      if (!r.ok) {
        res.writeHead(500, { 'content-type': 'text/plain; charset=utf-8' })
        return res.end('✗ dışa aktarılamadı: ' + JSON.stringify(r.error).slice(0, 200))
      }
      const p = r.value[Number.isInteger(parcaNo) && parcaNo >= 0 ? parcaNo : 0]
      if (p === undefined) {
        res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' })
        return res.end('✗ parça yok')
      }
      res.writeHead(200, {
        'content-type': p.mime,
        'content-disposition': 'attachment; filename="' + p.ad + '"',
        'x-parca-sayisi': String(r.value.length),
      })
      return res.end(p.bayt)
    }

    if (u.pathname === '/geri') {
      const y = geriYigin[id] ?? []
      if (y.length > 0) {
        ;(ileriYigin[id] ??= []).push(structuredClone(calisan[id]))
        calisan[id] = y.pop()
      }
      return json({ ok: true })
    }
    if (u.pathname === '/ileri') {
      const y = ileriYigin[id] ?? []
      if (y.length > 0) {
        ;(geriYigin[id] ??= []).push(structuredClone(calisan[id]))
        calisan[id] = y.pop()
      }
      return json({ ok: true })
    }
    // ── SIFIRLA: kaydedilmemiş her şeyi at, KAYNAĞA dön ────────────────────
    //
    // ⚠ ⚠ **"Geri al" YETMİYOR.** Yığın sınırlı ve on düzenleme sonra insanın istediği
    // şey adım adım geri sarmak değil, TEMİZ SAYFA. Bu düğme JSON'a yazmadan önceki
    // güvenlik ağı: denemekten korkmamak için geri dönüş ucuz olmalı.
    //
    // ⚠ Sıfırlama GERİ ALINABİLİR: mevcut hâl geri yığınına itiliyor. Tek tıkla iş
    // kaybettiren bir düğme, kullanılmayan bir düğmedir.
    if (u.pathname === '/sifirla') {
      const k = kaynak[id]
      res.writeHead(200, { 'content-type': 'text/plain; charset=utf-8' })
      if (k === undefined) return res.end('✗ kaynak bulunamadı: ' + id)
      anlikGoruntuAl(id)
      if (k.tur === 'sablon') {
        calisan[id] = structuredClone(ORNEKLER[k.ad])
        return res.end('✓ şablon kaynağa döndü: ' + k.ad)
      }
      try {
        // ⚠ Sıfırlama HATTIN ürettiğine döner (`panorama.json`), elle düzenlenmiş
        // sürüme değil: aksi hâlde düğme hiçbir şey yapmazdı.
        calisan[id] = kosuBelgesi(k.dizin, true)
        return res.end('✓ koşu defterindeki hâline döndü: ' + k.ad)
      } catch (e) {
        return res.end('✗ defter okunamadı: ' + String(e))
      }
    }
    if (u.pathname === '/kaydet') {
      const k = kaynak[id]
      res.writeHead(200, { 'content-type': 'text/plain; charset=utf-8' })

      // ── KOŞU modu: düzenleme O koşunun defterine iner ve SLAYTLAR YENİDEN ÇİZİLİR.
      // Yalnız JSON yazmak ölü bir varlık üretirdi: dosya var, kimse okumuyor. Elle
      // düzenlemenin karşılığı elle düzenlenmiş PNG'dir; ayrı dosya adıyla (`-elle`)
      // yazılıyor ki hattın ürettiği asıl çıktı yerinde kalsın ve fark görülebilsin.
      if (k?.tur === 'kosu') {
        const jsonYolu = join(k.dizin, 'panorama-elle.json')
        const d = belge(id)
        panoramaBelgesiniYaz(k.dizin, d, 'panorama-elle.json')
        const yollar = d.kartlar.map((_, n) =>
          join(k.dizin, 'slayt-' + String(n + 1).padStart(2, '0') + '-elle.png')
        )
        const r = await renderPanorama(d, yollar)
        if (!r.ok) return res.end('✗ render başarısız: ' + JSON.stringify(r.error))

        // ⚠ ⚠ **DEPOYA ALMA KAYDETMENİN PARÇASI, AYRI BİR DÜĞME DEĞİL.** Ayrı olsaydı
        // insan kaydeder, depoya almayı unutur ve yayın önizlemesinde yine ESKİSİNİ
        // görürdü — şikâyetin ta kendisi. Kaydetmek "bu hâli geçerli kıl" demektir.
        const kusurlar = await olcum(id)
        const dep = slaytlariDepolaVeEmeklet(k.dizin, k.ad, yollar, d, kusurlar)
        // ⚠ Kaydetme cevabı ölçümü de SÖYLÜYOR: bir kusur, kaydedildikten sonra
        // öğrenilirse yayın önizlemesine kadar gider.
        const kusurSatiri =
          kusurlar.length === 0
            ? '✓ denetim temiz — kusur yok'
            : '⚠ denetim ' +
              kusurlar.length +
              ' kusur ölçtü: ' +
              [...new Set(kusurlar.map((x) => String(x.tur)))].join(' · ')
        const depSatiri = !dep.ok
          ? '⚠ depoya alınmadı: ' + dep.sebep + ' — düzenleme yalnız -elle.png olarak duruyor'
          : '✓ ' +
            dep.saklanan.length +
            ' slayt depoya alındı ve eskisi emekli edildi (bakan: ' +
            dep.insan +
            ')' +
            (dep.ifsa
              ? ''
              : '\n⚠ AI ifşa şeridi ÖLÇÜLEMEDİ ya da görünmüyor — yayın kapısı durdurur') +
            (dep.beyanYazildi === false
              ? '\n⚠ `slaytlar.json` YAZILAMADI — panel eski sürümü gösterebilir'
              : '') +
            (dep.atlanan.length === 0
              ? ''
              : '\n⚠ atlanan slayt: ' + dep.atlanan.join(' · ') + ' (eşleşen teslimat yuvası yok)')

        return res.end(
          '✓ ' +
            yollar.length +
            ' slayt yeniden çizildi → ' +
            k.dizin +
            '\n' +
            '  ' +
            yollar.map((y) => y.split('/').pop()).join(' · ') +
            '\n' +
            '✓ belge: ' +
            jsonYolu +
            '\n' +
            depSatiri +
            '\n' +
            kusurSatiri
        )
      }

      // ── ŞABLON modu: katalog dosyasına CERRAHİ yazıyor. Yorumlar korunuyor.
      const y = kataloguYaz(id)
      const yedekYol = join(REPO, 'derived/duzenleyici-' + k.ad + '.json')
      writeFileSync(yedekYol, JSON.stringify(calisan[id], null, 2))
      if (!y.ok)
        return res.end('✗ katalog YAZILMADI: ' + y.sebep + '\n  anlık görüntü: ' + yedekYol)
      return res.end(
        '✓ katalog-ornek.ts güncellendi — ' +
          y.degisiklikler.join(' · ') +
          "\n⚠ Bu bir ÖNERİ (Yasa 2): `git diff` ile bak, onay senin commit'in." +
          '\n  yeniden derle: just duzenle'
      )
    }
    res.writeHead(404)
    res.end('yok')
  } catch (e) {
    // ⚠ Basliklar GONDERILDIKTEN sonra atilan bir hatada writeHead ikinci kez
    // cagriliyordu; ERR_HTTP_HEADERS_SENT yakalanmadan sureci olduruyor ve asil
    // hatayi da gizliyordu. Once logla, sonra yalniz yazilabilirse cevap ver.
    console.error('[' + u.pathname + ']', e?.stack ?? e)
    if (!res.headersSent) res.writeHead(500, { 'content-type': 'text/plain; charset=utf-8' })
    res.end(String(e?.stack ?? e))
  }
})

// Tek bir istek hatasi tezgahi indirmesin: duzenleyici acik kalir, hata log'a duser.
process.on('uncaughtException', (e) => {
  // ⚠ Port çakışması SESSİZ ÖLÜM üretiyordu: eski bir tezgâh 4321'i tutuyorsa yeni
  // süreç EADDRINUSE ile düşüyor, log'a bir yığın izi yazıyor ve kullanıcı ESKİ
  // sunucuyu görmeye devam ediyordu — üstelik onun BELLEĞİNDEKİ eski kopyayı.
  // Bir kez yaşandı: katalogda geri alınmış bir düzenleme ekranda duruyordu.
  if (e?.code === 'EADDRINUSE') {
    console.error(
      '\n  ✗ ' +
        PORT +
        ' portu DOLU — büyük olasılıkla eski bir düzenleyici çalışıyor.\n' +
        '    Onu kapat:  pkill -f scripts/duzenleyici.mjs\n' +
        '    ⚠ Eski tezgâh belleğindeki kopyayı gösterir; dosyadaki hâli DEĞİL.\n'
    )
    process.exit(1)
  }
  console.error('[yakalanmadi]', e?.stack ?? e)
})
process.on('unhandledRejection', (e) => console.error('[reddedildi]', e?.stack ?? e))

// Sabit. Ortamdan okunmuyor: `secret-rotasyon` kapisi kodda okunan her ortam
// anahtarini rotasyon tablosunda ariyor ve PORT bir sir DEGIL. Kapiyi gevsetmek
// yerine ihtiyaci kaldirdim — yerel bir tezgahin portu yapilandirilabilir olmak
// zorunda degil (R-76: kirmizi kapinin kurali ayni turda gevsetilmez).
const PORT = 4321
sunucu.listen(PORT, () => {
  console.log(`\n  şablon düzenleyici → http://localhost:${PORT}\n`)
  console.log(`  metne tıkla · görseli sürükle · Shift+sürükle ölçekler`)
  console.log(`  ⚠ prototip: katalog dosyasına YAZMIYOR, derived/ altına JSON basıyor\n`)
})
