// Karosel şablon grameri — slayt kimliğinden KOMPOZİSYON türetir (§7.1 · D-254).
//
// **Generative ile rastgele aynı şey değildir.** Buradaki her karar `SlaytKimligi`den
// hesaplanıyor: aynı slayt her koşuda aynı kompozisyonu verir (deterministik, golden
// test çalışır) ama slayttan slayta değişir (ritim doğar). Rastgelelik olsaydı ikisini
// birden kaybederdik: ne tekrar üretilebilirlik ne de kontrol.
//
// **Gramer KAPALI.** Referans karosellerin DNA'sı üç kuraldan ibaret ve hepsi burada:
//   1. İki renk alanı, aralarında **akan bir eğri** — taraf slayta göre dönüyor
//   2. **Hayalet rakam**: dev, yalnız kontur, kenardan kırpılmış
//   3. Renk rolü rotasyonu: kehribar → kâğıt → mürekkep
// Dördüncü bir kural eklemek bir KARAR ister; "biraz daha çeşitlilik" diye eklenen
// her öge, ızgaraya bakınca tek şey görünmesini bozar.
//
// **Neden `static.ts`te değil ayrı dosyada:** `static.ts` belge → HTML çevirisi yapıyor;
// burası tasarım kararı veriyor. Karışsalardı "bu rengi kim seçti" sorusu bir HTML
// şablonunun içinde kaybolurdu.

import type { SlaytKimligi } from '@suite/kernel'
import { type AlanSemasi, type SinirBicimi, TEMEL_AILE } from '@suite/contracts'
import type { LayoutName } from './layout/adlar.js'
import { NEFES_YUZDESI, VARSAYILAN, guvenliYuzde } from './sablon-parametre.js'
import { egriZarfi } from './sekil-cebri.js'
import type { RampaTokeni } from './sablon-degrade.js'

const AMBER = 'var(--role-bg)'
const KAGIT = 'var(--role-surface)'
const MUREKKEP = 'var(--role-line-edge)'

/**
 * Bir zemin token'ı KOYU mu — metin ve motif rengi buradan türüyor.
 *
 * ⚠ Kapalı bir liste, bir hesap değil: token'lar OKLCH ve burada çözülmüyorlar (çözüm
 * `tasarim-olcum.ts`te ve o ayrı bir katman). Yeni bir koyu zemin eklenirse buraya da
 * yazılmalı — ve yazılmazsa metin koyu-üstü-koyu çıkar, kontrast metriği YAKALAR.
 * Yani unutmanın bedeli sessiz değil: kapı kırmızı yanar.
 */
const KOYULAR = new Set([MUREKKEP, 'var(--ramp-marka-ink-800)', 'var(--ramp-marka-ink-950)'])
const koyuMu = (token: string): boolean => KOYULAR.has(token)

/**
 * Bir alan renginin RAMPA KARŞILIĞI — degrade açıksa hangi iki durak (FAZ-12.9).
 *
 * ⚠ ⚠ **`null` bir eksiklik değil, bir KARAR — ve kararı marka rampası veriyor.**
 * Kâğıdın rampada TEK durağı var (`--ramp-marka-kagit`); ikinci bir açık ton icat etmek,
 * bir render modülünün markaya renk eklemesi olurdu. Kâğıt alan düz kalıyor çünkü rampa
 * öyle diyor — benim öyle seçmemle değil. En ucuz zorlama, ihlalin ifade edilemez olması.
 *
 * ⚠ **Tablo `karsiAlan` ile AYNI yerde duruyor ve sebebi yukarıdaki `motif` dersiyle
 * birebir aynı:** elle yazılan ikinci bir renk sütunu, komşu bir kararla sessizce
 * tutarsızlaşır. İlk sürümde duraklar `static.ts`te SABİTTİ ve üç rolün üçüne de amber
 * yazıyordu — kâğıt alan render'da amber çıktı. Bakınca görüldü, metrik göremezdi.
 */
const ALAN_RAMPASI: Record<string, readonly [RampaTokeni, RampaTokeni] | null> = {
  [AMBER]: ['--ramp-marka-bakir-500', '--ramp-marka-bakir-600'],
  [MUREKKEP]: ['--ramp-marka-ink-950', '--ramp-marka-ink-800'],
  [KAGIT]: null,
}

/** Renk rolü — hangi token'ın zemin, hangisinin metin olacağı. */
export interface AlanRolleri {
  readonly zemin: string
  readonly karsiAlan: string
  readonly metin: string
  readonly metinSoluk: string
  readonly motif: string
  /** Dolgunun degrade durakları — `null` ise o alan düz kalır (rampada tek durak var). */
  readonly karsiAlanRampa: readonly [RampaTokeni, RampaTokeni] | null
}

/**
 * Üç renkli rotasyon. **Kapak her zaman kehribar** — ızgarada ilk göze çarpan kare
 * markanın rengi olmalı; gövde slaytları kâğıt ve mürekkep arasında dönüyor.
 *
 * `index % 2` yerine açık bir tablo: modül aritmetiği "neden bu slayt siyah" sorusunu
 * cevaplayamaz, tablo cevaplar.
 */
export const alanRolleri = (k: SlaytKimligi, sema: AlanSemasi = TEMEL_AILE.alan): AlanRolleri => {
  // ⚠ **Zemin AİLEDEN, metin TÜRETİLİYOR.** Aile hangi rengin zemin olacağını seçebilir;
  // hangi rengin ONUN ÜSTÜNE yazılacağını seçemez. Seçebilseydi bir aile okunmaz bir çift
  // yazar ve garanti katmanı estetik katmana inerdi (FAZ-12.7).
  const zemin =
    k.role === 'kapanis' && sema.kapanisZemini !== null
      ? sema.kapanisZemini
      : (sema.zeminler[k.index % sema.zeminler.length] ?? KAGIT)

  // ⚠ **Tek alanlı ailede dolgu = zemin.** Beş referansın ÜÇÜNDE renk sınırı yok;
  // `sablon.ts` iki alanı varsayıyordu ve bu varsayım bir gramer kuralı sanılıyordu.
  // ⚠ Kapanışta dolgu döngünün BİR SONRAKİSİ değil BAŞI: kapanış zemini döngü dışında
  // (açıkça verilmiş) ve "bir sonraki" onun için tanımsız. İlk sürüm `index+1` kullanıyordu
  // ve kapanışın dolgusunu kâğıt yapıyordu — kehribar olmalıydı; testler yakaladı.
  const kapanisAyri = k.role === 'kapanis' && sema.kapanisZemini !== null
  const karsiAlan = !sema.ikiAlan
    ? zemin
    : kapanisAyri
      ? (sema.zeminler[0] ?? KAGIT)
      : (sema.zeminler[(k.index + 1) % sema.zeminler.length] ?? KAGIT)

  // ⚠ **Motif `karsiAlan`dan TÜRETİLİYOR, elle yazılmıyor.** Hayalet rakam zeminin değil
  // DOLGUNUN üstünde duruyor; rengi zemine göre seçilirse dolguyla aynı olabilir ve rakam
  // görünmez olur. Tam bu oldu: dört rolün ÜÇÜNDE motif dolgu rengiyle aynıydı ve bant
  // kenara kayınca rakam tümüyle kayboldu. **Elle yazılan bir renk sütunu, komşu bir
  // kararla sessizce tutarsızlaşır**; türetilmiş olan tutarsızlaşamaz.
  return {
    zemin,
    karsiAlan,
    // ⚠ ANLAMSAL token: metin `--role-text`, çizgi değil. İlk sürüm `--role-line-edge`
    // yazıyordu; ikisi bu markada aynı renge çözülüyor ama rol farklı ve token çözümü
    // testi bunu yakaladı — aynı renge çözülen iki token AYNI ŞEY DEĞİLDİR.
    metin: koyuMu(zemin) ? 'var(--role-surface)' : 'var(--role-text)',
    metinSoluk: koyuMu(zemin) ? 'var(--role-surface)' : 'var(--role-text-muted)',
    motif: koyuMu(karsiAlan) ? AMBER : MUREKKEP,
    karsiAlanRampa: ALAN_RAMPASI[karsiAlan] ?? null,
  }
}

/**
 * Akan eğri — süreklilik motifi.
 *
 * **Referansın asıl mekanizması bu.** Beş kareye yan yana bakıldığında "tek şey"
 * görünmesini sağlayan şey ne renk ne tipografi: her karede aynı el yazısıyla çizilmiş
 * bir eğrinin dönüşümlü olarak sağda ve solda durması.
 *
 * Eğri `SlaytKimligi`den TÜRETİLİYOR: kontrol noktaları indeksle kayıyor, yani her
 * slaytta biraz farklı ama aynı aileden. Sabit bir path olsaydı beş kare beş kopya
 * olurdu; rastgele olsaydı aile dağılırdı.
 *
 * Genişlik/yükseklik 100 birimlik bir kutuda; `preserveAspectRatio="none"` ile geriliyor.
 */
export const akanEgri = (k: SlaytKimligi, sinir: SinirBicimi = 'egri'): string => {
  // ⚠ ⚠ **SINIR BİÇİMİ AİLENİN.** `akanEgri` her zaman bir eğri çiziyordu ve bu bir gramer
  // kuralı sanılıyordu; oysa beş referansın üçünde sınır YOK, birinde de sert bir kesik
  // olabilirdi. Eğri `temel`in imzası, gramerin zorunluluğu değil.
  // ⚠ `yok` boş dize döndürüyor: çağıran path'i hiç basmıyor. `none` gibi bir değer
  // döndürseydi geçersiz bir `d` niteliği basılır ve tarayıcı sessizce boş çizerdi.
  if (sinir === 'yok') return ''
  if (sinir === 'kosegen') return kosegenSinir(k)
  // Faz indeksle kayıyor — aynı aile, farklı nefes. `% 5`: beş slaytlık bir karoselde
  // her slayt farklı, altıncıda aile başa dönüyor.
  const faz = k.index % 5

  // ⚠ **Salınım DAR bir bantta tutuluyor** ve bu ölçülmüş bir düzeltme. İlk sürümde
  // eğri genişliğin %60'ına taşıyordu ve metin sınırı geçiyordu: yazının yarısı
  // kehribar, yarısı kâğıt üstünde kalıyor, okunabilirlik düşüyor ve kompozisyon
  // kazara duruyordu. Referansta metin HER ZAMAN tek alanda.
  //
  // Bant `SINIR_MIN..SINIR_MAX`; `guvenliMetinYuzdesi` bu bandın dışını hesaplıyor.
  // İkisi tek yerde tanımlı — ayrı olsalardı biri değişip diğeri unutulurdu.
  const merkez = SINIR_MIN + ((SINIR_MAX - SINIR_MIN) * faz) / 4
  const genlik = VARSAYILAN.genlik

  // ⚠ **Eğri, dolduracağı tarafa göre AYNALANIYOR.** Bant artık simetrik değil (%69–78):
  // metin sütunu geniş tarafta duruyor ve o taraf %62. Yansıma olmasaydı `egriSagda`
  // false olduğunda dolgu geniş tarafı kaplar, metne dar taraf kalır ve sütun %62
  // olamazdı — yani dönüşümlü ritim ile geniş metin sütunu birbirini dışlardı.
  const X = (v: number): number => (egriSagda(k) ? v : 100 - v)

  // Dikey S: üstten alta akan, iki kez bükülen tek eğri. Kontrol noktaları merkez
  // etrafında ±genlik — aile aynı, nefes farklı.
  return (
    `M ${X(merkez)} 0 ` +
    `C ${X(merkez + genlik)} 24, ${X(merkez - genlik)} 42, ${X(merkez + genlik * 0.4)} 60 ` +
    `C ${X(merkez + genlik * 1.4)} 78, ${X(merkez - genlik * 0.6)} 90, ${X(merkez)} 100`
  )
}

/**
 * Sert köşegen sınır — poster dili (FAZ-13 şablon genelleştirme).
 *
 * ⚠ **Eğrinin ZIT kutbu.** Eğri yumuşak ve organik; köşegen keskin ve yönlü. İkisi aynı
 * bandı (`SINIR_MIN..SINIR_MAX`) kullanıyor, yani `guvenliKolonYuzdesi` ve `column_in_band`
 * değişmezi ikisinde de aynı biçimde çalışıyor — **yeni bir sınır biçimi yeni bir güvenlik
 * hikâyesi getirmiyor.** Zarf hesabı (`egriZarfi`) path'ten okuduğu için otomatik uyuyor.
 * ⚠ Eğim slayt indeksiyle DÖNÜYOR ama bant içinde kalıyor: ritim var, taşma yok.
 */
const kosegenSinir = (k: SlaytKimligi): string => {
  const faz = k.index % 5
  const merkez = SINIR_MIN + ((SINIR_MAX - SINIR_MIN) * faz) / 4
  const egim = VARSAYILAN.genlik * (k.index % 2 === 0 ? 1 : -1)
  const X = (v: number): number => (egriSagda(k) ? v : 100 - v)
  return `M ${X(merkez - egim)} 0 L ${X(merkez + egim)} 100`
}

/**
 * Eğri sınırının salınım bandı, yüzde olarak.
 *
 * Metin bu bandın DIŞINDA kalmak zorunda; iki sabit tek yerde durur ki biri değişince
 * diğeri unutulmasın.
 */
export const SINIR_MIN = VARSAYILAN.bantMin
export const SINIR_MAX = VARSAYILAN.bantMax

/**
 * Metin sütununun güvenli genişliği, yüzde.
 *
 * Eğri bir kübik Bézier: kontrol noktalarının dışbükey zarfını AŞMAZ. En içerideki
 * kontrol noktası `merkez - genlik`, yani eğrinin metne en çok yaklaştığı yer
 * `SINIR_MIN - 5`. Sütun oradan 2 puan daha geride duruyor.
 *
 * ⚠ **Bu sayı ÖLÇÜLDÜ, seçilmedi** (`docs/referans/tip-olcegi.md`). Önceki değer 36 idi
 * ve o ayarda **hiçbir punto sığmıyordu**: `taşıyabileceğimizin` h1'in 76 px'inde 665 px
 * yer kaplıyor, sütunun içerik genişliği ise 301 px'ti — %120 taşma. Kutuyu daraltmak
 * metni daraltmıyor çünkü **kelime bölünmez**; taşma yalnız yer değiştiriyordu (R-23).
 * %62'de içerik 582 px ve ölçülen en büyük sığan punto 64 px — `static.ts` h1'i o.
 * Referansın metin alanı da karenin ~%62'si; dar sütun bizim SAPMAMIZDI.
 */
export const guvenliMetinYuzdesi = guvenliYuzde(VARSAYILAN)

/**
 * O SLAYTIN güvenli sütun genişliği, yüzde — eğrinin KENDİSİNDEN (FAZ-12.10).
 *
 * ⚠ ⚠ **Küresel sabit beş slaytın EN KÖTÜSÜNE göre ölçülmüştü ve dördünde 9 puana kadar
 * yer israf ediyordu.** `merkez` indeksle %69'dan %78'e kayıyor; sütun %62'de sabit
 * kalınca eğrinin uzaklaştığı slaytlarda arada 97 px'e varan boş bant kalıyordu. Metin
 * dar kaldığı için satır daha erken kırılıyor ve punto tavanı gereksiz alçak duruyordu.
 * *Sınırı delmek değil, sınır içinde daha iyi yerleşmek* — adımın kendi ifadesiyle.
 *
 * ⚠ **Zarf path'ten OKUNUYOR, formülden değil.** `merkez - genlik` diye yazsaydım
 * `akanEgri`'ye daha içeride bir kontrol noktası eklendiğinde sayı sessizce yalan olurdu.
 * Zarf eğriyi girdi alıyor: eğri değişirse sütun değişir, kapı ölçer.
 *
 * ⚠ **Aynalama simetrik ve bu ÖLÇÜLDÜ, varsayılmadı:** `egriSagda` false olduğunda
 * `X(v) = 100 - v` ile zarf de aynalanıyor, o yüzden sütun soldan değil sağdan başlıyor
 * ama GENİŞLİĞİ aynı. İki dal ayrı hesaplansaydı biri güncellenip öteki unutulurdu.
 */
export const guvenliKolonYuzdesi = (k: SlaytKimligi, sinir: SinirBicimi = 'egri'): number => {
  // ⚠ Sınır yoksa sütun küresel güvenli değeri alıyor: tek alanlı ailede metnin kaçınacağı
  // bir eğri yok, ama kenar payı ve okuma genişliği hâlâ geçerli.
  if (sinir === 'yok') return guvenliMetinYuzdesi
  const z = egriZarfi(akanEgri(k, sinir))
  const icKenar = egriSagda(k) ? z.min : 100 - z.max
  return icKenar - NEFES_YUZDESI
}

/** Eğri hangi tarafta — dönüşümlü. Sağ/sol dönüşü ritmin ikinci ayağı. */
export const egriSagda = (k: SlaytKimligi): boolean => k.index % 2 === 0

/**
 * Hayalet rakam — dev, yalnız kontur, kenardan kırpılmış.
 *
 * `total > 1` şartı: tek slaytlık bir postta "1" basmak anlamsız, hatta yanıltıcı
 * (bir dizi olduğunu ima eder).
 */
export const hayaletRakam = (k: SlaytKimligi): string | null =>
  k.total > 1 ? String(k.index + 1) : null

/** Sayaç etiketi — `#003` biçimi referanstan. */
export const sayacEtiketi = (k: SlaytKimligi): string | null =>
  k.total > 1 ? `#${String(k.index + 1).padStart(3, '0')}` : null

/**
 * Navigasyon işareti. Son slaytta yön DEĞİŞİR — referansta `<< Back`.
 * Sonda hâlâ "kaydır" demek, olmayan bir slayta işaret etmektir.
 */
export const navIsareti = (k: SlaytKimligi): string | null => {
  if (k.total <= 1) return null
  return k.index === k.total - 1 ? '‹‹ başa' : 'kaydır ››'
}

/**
 * Düzenin GÖRSEL kompozisyonu (FAZ-10.4b).
 *
 * **Neden gerekiyordu:** `LAYOUT_SPECS` üç alan taşıyordu — `maxBlocks`,
 * `headingBudget`, `bodyBudget` — ve üçü de yalnız BÖLME kararına giriyordu. `static.ts`
 * `layout`u hiç görmüyordu. Yani `quote` seçmek alıntı gibi GÖRÜNMÜYOR, sadece daha uzun
 * bir başlığa izin veriyordu. Adlar bir kompozisyon vaat ediyor, motor sayfalama bütçesi
 * veriyordu — ve iki farklı şeyin aynı adı taşıması, ikisini de yanlış anlatır.
 *
 * **Gramer KAPALI kalıyor** (D-254): burada dört düzenin dört biçimi var, beşincisi bir
 * KARAR ister. Belge modeline işaretleme sokulmadı — model `duzen: 'quote'` taşıyor,
 * tırnağı bu tablo çiziyor.
 */
export interface DuzenBicimi {
  /** Başlık puntosu, px. Ölçülen tavan 64 (`docs/referans/tip-olcegi.md`) — AŞILAMAZ. */
  readonly baslikPx: number
  readonly baslikYukseklik: number
  /** Gövde puntosu, px. */
  readonly govdePx: number
  /** İçeriğin dikey yaslanması. */
  readonly yaslama: 'flex-start' | 'center' | 'flex-end'
  /** Dev açılış tırnağı — yalnız `quote`. */
  readonly tirnak: boolean
  /** Her gövde bloğunun önünde ritim çizgisi — yalnız `list`. */
  readonly maddeRitmi: boolean
  /** İlk gövde bloğu bir KANIT şeridi olarak ayrılıyor — yalnız `claim-proof`. */
  readonly kanitSeridi: boolean
}

const TAVAN_PX = VARSAYILAN.baslikTavaniPx

export const duzenBicimi = (d: LayoutName | undefined): DuzenBicimi => {
  switch (d) {
    case 'quote':
      // Alıntı nefes ister: az kelime, büyük punto, ortada. Tırnak bir süs değil,
      // "bu cümle bana ait değil" işareti — atıf satırı onunla birlikte okunuyor.
      return {
        baslikPx: TAVAN_PX,
        baslikYukseklik: 1.16,
        govdePx: 30,
        yaslama: 'center',
        tirnak: true,
        maddeRitmi: false,
        kanitSeridi: false,
      }
    case 'list':
      // Liste çok satır taşıyor: başlık küçülür, gövde ritim kazanır. Başlığı büyük
      // tutmak listeyi ikinci slayda iterdi — sayfalama zaten `list` bütçesini seçti.
      //
      // ⚠ **`flex-start` → `center`: ÜÇÜNCÜ gözlemde kural yazıldı.** Defterin
      // "izlenen zayıflıklar" tablosuna koşu 3'te girmişti: *iki maddelik gövde
      // slaytında alt yarı boş kalıyor.* Sonra ikon turunda iki kez daha görüldü, ve
      // dikey akış diyagramıyla birlikte üçüncü kez: içerik üstte, altında ~600 px
      // boşluk. Bir gözlem gürültüdür, üç gözlem örüntüdür.
      //
      // Sebep listenin uzun olacağı VARSAYIMIYDI. Gerçek liste 2–4 madde ve sayfalayıcı
      // zaten taşanı bölüyor (R-30) — yani "yukarıdan başlasın ki aşağı doğru büyüsün"
      // varsayımı hiçbir zaman gerçekleşmiyor. Kapak ve kapanış zaten yaslı; gövdenin
      // ortalanması karoseli tek bir kompozisyon ailesi hâline getiriyor.
      // ⚠ Optik merkez (geometrik merkezin ~%5 üstü) ayrı bir adım: FAZ-13.1.
      return {
        baslikPx: 46,
        baslikYukseklik: 1.1,
        govdePx: 32,
        yaslama: 'center',
        tirnak: false,
        maddeRitmi: true,
        kanitSeridi: false,
      }
    case 'claim-proof':
      // İddia üstte büyük, kanıt altında AYRI bir şeritte. Ayrım görsel olmazsa iddia
      // ile kanıt aynı sesle okunur ve kanıt kanıt olmaktan çıkar.
      return {
        baslikPx: 56,
        baslikYukseklik: 1.08,
        govdePx: 32,
        yaslama: 'center',
        tirnak: false,
        maddeRitmi: false,
        kanitSeridi: true,
      }
    default:
      // `statement` ve tanımsız: tek büyük cümle, alta yaslı. Tanımsızın buraya düşmesi
      // bilinçli — eski belgeler (düzen damgası taşımayanlar) aynen çalışmaya devam eder.
      return {
        baslikPx: TAVAN_PX,
        baslikYukseklik: 1.08,
        govdePx: 34,
        yaslama: 'flex-end',
        tirnak: false,
        maddeRitmi: false,
        kanitSeridi: false,
      }
  }
}
