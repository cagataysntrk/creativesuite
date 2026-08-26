// HEDEF: packages/engine/src/plan/sablon-uyarla.ts
//
// Şablon uyarlama — agent taslağı ÇOĞALTIP DÜZENLİYOR (FAZ-15.7 · D-268 · Yasa 13).
//
// ⚠ ⚠ **BU ADIMIN VARLIK SEBEBİ ŞU CÜMLE:** *"şablonu seçmek bu demek zaten; sıfırdan
// yapmayacak, olanı alıp düzenleyecek."* Agent boş bir tuvale kompozisyon kurmuyor;
// katalogdaki DOLU taslağı alıyor ve yalnız İÇERİĞİNİ değiştiriyor. Kompozisyon
// (bant geometrisi, görsel konumları, tipografi reçetesi, zemin dokusu, yerleşim)
// olduğu gibi geçiyor — çünkü kalitenin oynak olduğu yer tam orasıydı.
//
// ⚠ ⚠ **YAPISAL ALANLAR ŞEMADA YOK — "değiştirme" diye RİCA EDİLMİYOR.** `UyarlamaKarti`
// yalnız metin alanları taşıyor; agent bant noktası ya da görsel konumu yazmak istese
// koyacak alan bulamıyor. Bu, projenin her yerinde tekrar eden ilke: **en ucuz zorlama,
// ihlalin ifade edilemez olmasıdır** (aile garanti alanları, degrade durakları, damga).
// Bir `readonly` ya da bir "lütfen dokunma" yorumu, model çıktısında hiçbir şey zorlamaz.
//
// ⚠ ⚠ **PANEL TİPİ KİLİTLİ, PANEL VERİSİ SERBEST.** Çubuk grafik mi vafel mi — bu bir
// KOMPOZİSYON kararı ve şablonun kimliğinin parçası; içindeki satırlar İÇERİK. Uyarlama
// tipi değiştirmeye kalkarsa reddediliyor: `veri-hikayesi`nin dördüncü kartındaki vafel,
// oraya "20 hattan 13'ü" anlatısı için konuldu; bir etiket bulutuna dönüşürse şablon
// artık o şablon değil.

import { kapsamDisiKarakterler, type KatalogOrnegi } from '@suite/render'
import type { Kart, Panel } from '@suite/render'

/** Uyarlamanın yazabildiği TEK şey — kompozisyon alanı yok. */
export interface UyarlamaKarti {
  readonly ustBaslik: string
  /** `**vurgu**` işareti korunuyor: vurgu bir içerik kararı. */
  readonly baslik: string
  readonly govde: string
  /** Arkadaki dev soluk metin — kısa olmalı (rakam, sembol, tek kelime). */
  readonly hayalet: string
  readonly rayaSol: string
  /**
   * Alt rayın orta alanı — **KAYNAK**.
   *
   * ⚠ ⚠ Şablon buraya `ÖRNEK VERİ` yazıyor ve uyarlamanın onu DEĞİŞTİRMESİ zorunlu.
   * Yasa 8: kaynaksız sayısal iddia yayınlanamaz. Örneğin işaretini olduğu gibi bırakan
   * bir uyarlama, "kaynak koymayı unuttum"u sessizce yayınlanabilir hâle getirirdi;
   * burada reddediliyor.
   */
  readonly rayaOrta: string
  /** Panel VERİSİ — tipi şablondan gelir, değiştirilemez. */
  readonly panel?: Panel | null
  /**
   * Kapanış kartının metni — uyarlama varış rakamını ve çağrıyı YAZABİLİR, ama şablonda
   * kapanış yoksa EKLEYEMEZ (kompozisyon kararı şablonundur).
   */
  readonly kapanis?: { readonly rakam?: string; readonly rakamAlt?: string; readonly cagri: string }
}

export interface Uyarlama {
  readonly sablonId: string
  readonly kartlar: readonly UyarlamaKarti[]
  /**
   * Bu koşunun GÖRSEL DİLİ — bir cümlelik üslup tarifi.
   *
   * ⚠ ⚠ **ÜSLUP DA ŞABLONDA SABİTTİ ve çıktı hep aynı görünüyordu.** Her varyant
   * *"high contrast monochrome illustration with visible ink hatching"* diyordu; konu
   * ne olursa olsun sonuç siyah-beyaz mürekkep taramasıydı. Depo sahibi: *"yine
   * üretilen görseller siyah beyaz gibi… biz konuya uygun daha özgün şeyler
   * ürettirebiliriz."*
   *
   * ⚠ Karar KOŞU BAŞINA BİR KEZ: dört slayt aynı dili konuşmak zorunda. Slayt başına
   * seçtirmek, bu depoda ölçülmüş "dört ayrı tasarım dili yan yana" kusurunu geri
   * getirirdi. Bir koşu = bir üslup, ama üslubu KONU seçiyor.
   *
   * Boşsa şablonun varsayılan dili kullanılıyor — eski davranış.
   */
  readonly gorselDili?: string
}

export type UyarlamaSonucu =
  | {
      readonly ok: true
      readonly belge: KatalogOrnegi
      /**
       * Öldürücü OLMAYAN bulgular — koşu devam ediyor, insan görüyor.
       *
       * ⚠ ⚠ **REDDETMEK İLE UYARMAK ARASINDAKİ FARK, BEDELİ KİMİN ÖDEDİĞİDİR.** Bu depoda
       * ilke *"garantiyi yoklukla zorla"*: rampa dışı bir degrade durağı temsil bile
       * edilemiyor. O ilke YAZARI İNSAN OLAN kodda bedava — geliştirici düzeltip yeniden
       * derler. Ama yazarı MODEL olan bir koşuda aynı sertlik, tek bir `✓` karakteri
       * yüzünden ücretli bir koşuyu tamamen durdurur ve elde hiçbir çıktı kalmaz.
       * Tasarımın kendisi sağlamken bir karakter için her şeyi atmak orantısız.
       *
       * ⚠ Ayrım keskin: **kompozisyonu bozan şey REDDEDİLİR** (panel tipi, kart sayısı,
       * kaynağın silinmesi) çünkü onlar tasarımı tanınmaz yapar. **Kozmetik olan
       * UYARILIR** ve zaten render sonrası ölçülüyor (`eksik-glif`), düzeltme turuna
       * giriyor ve insan onay kapısında görünüyor.
       */
      readonly uyarilar: readonly string[]
    }
  | { readonly ok: false; readonly kusurlar: readonly string[] }

const ORNEK_ISARETI = 'ÖRNEK'

/**
 * Şablonun dolu taslağını uyarlamayla birleştirir.
 *
 * ⚠ ⚠ **BİRLEŞTİRME `...` İLE DEĞİL, ALAN ALAN.** `{ ...ornekKart, ...uyarlamaKarti }`
 * yazmak kısa olurdu ve tam olarak korumaya çalıştığımız şeyi delerdi: uyarlama nesnesi
 * fazladan bir `zemin` ya da `panel` alanı taşırsa yayılma operatörü onu SESSİZCE kabul
 * eder. Tipler derleme zamanında korur, çalışma zamanında gelen JSON'u korumaz — ve bu
 * veri bir model çıktısından geliyor. Alanlar tek tek yazılıyor.
 */
/**
 * Sayaç etiketi: `BÖLÜM 01`, `Seri 3`, `SORU 2`…
 *
 * ⚠ ⚠ **BU KURAL BİR ÜRETİM ÇIKTISINDAN GELDİ, bir tasarım toplantısından değil.**
 * Depo sahibi sayaçları açıkça kaldırttı ve katalogdaki altı taslaktan silindiler —
 * ama İSTEMİN JSON ÖRNEĞİ hâlâ `"ustBaslik": "BÖLÜM 01"` diyordu. Model örneği
 * kopyaladı ve gerçek bir koşuda dört kartın DÖRDÜ de sayaçla çıktı. Bir dosyada
 * silinen şey, başka bir dosyadaki örnekte yaşamaya devam etti.
 *
 * ⚠ `i` bayrağı YOK: JavaScript'in case-folding'i `İ`/`i` çiftini Türkçe'nin
 * beklediği gibi eşlemiyor (R-21 ile aynı kök). Biçimler açıkça sayılıyor.
 */
/**
 * Başlığın en uzun kelime bütçesi — ŞABLONUN KENDİ TASLAĞINDAN türetiliyor.
 *
 * ⚠ ⚠ **BU SAYI ELLE SEÇİLMEDİ ve seçilmemeli.** Taslaklar elle kuruldu ve sığdığı
 * görüldü; en uzun başlık kelimesi altı şablonda 7–11 harf arasında. Yani bütçe zaten
 * tasarımın içinde yazılı — okumak yeterli. Sabit bir sayı yazmak, altı farklı kolon
 * genişliğine tek bir cevap vermek olurdu.
 *
 * ⚠ ⚠ **NEDEN GEREKLİ: Türkçe eklemeli ve tek kelime tüm karoseli çökertiyor.** Gerçek
 * bir koşuda model "Karşılaştırma" (13 harf) yazdı; başlık 88 px'e sığdı, öteki üç kart
 * 149 px'deydi. Punto TÜM panorama için tek — bir kelime dört slaydın tipografisini
 * birden düşürüyor (`punto-cokmesi`).
 *
 * ⚠ +1 tolerans: bir Türkçe eki kelimeyi bir harf uzatabilir ve bu meşru.
 */
const kelimeButcesi = (ornek: KatalogOrnegi): number =>
  Math.max(
    ...ornek.kartlar.flatMap((k) =>
      k.baslik
        .replace(/\*\*/g, '')
        .split(/\s+/)
        .filter((w) => w !== '')
        .map((w) => [...w].length)
    )
  ) + 1

const enUzunKelime = (metin: string): string =>
  metin
    .replace(/\*\*/g, '')
    .split(/\s+/)
    .filter((w) => w !== '')
    .reduce((a, b) => ([...b].length > [...a].length ? b : a), '')

const SAYAC_ETIKETI =
  /(?:BÖLÜM|Bölüm|bölüm|BOLUM|Bolum|bolum|SERİ|Seri|seri|SERI|SORU|Soru|soru|ADIM|Adım|adım|KISIM|Kısım|kısım|SAYFA|Sayfa|sayfa|PART|Part|part|STEP|Step|step)\s*[-–—.:]?\s*\d+/u

/**
 * Kapak/bölüm başlığının kelime tavanı (R-89).
 *
 * ⚠ Geometrik türetme: başlık bakışlık puntoda (≥0,5°) olacak ve 2–3 satıra sığacak;
 * 1080 px tuvalde satır başına ~2,5 kelime → 5–8. Bu bir üslup tercihi değil, punto ile
 * sütun genişliğinin birlikte dayattığı sınır.
 */
export const BASLIK_KELIME_TAVANI = 8

/** Slayt başına toplam kelime (R-89): başlık ≤8 + gövde ≈20. */
export const SLAYT_KELIME_TAVANI = 28

export const uyarla = (ornek: KatalogOrnegi, u: Uyarlama): UyarlamaSonucu => {
  const kusurlar: string[] = []

  if (u.kartlar.length !== ornek.kartlar.length)
    return {
      ok: false,
      kusurlar: [
        `kart sayısı şablonla uyuşmuyor: uyarlama ${u.kartlar.length}, şablon ${ornek.kartlar.length}`,
      ],
    }

  const kartlar: Kart[] = []
  for (const [i, y] of u.kartlar.entries()) {
    const o = ornek.kartlar[i] as Kart
    const yer = `kart ${i + 1}`

    if (y.baslik.trim() === '') kusurlar.push(`${yer}: başlık boş`)
    // ── kelime bütçesi: kanca ≤8, slayt ≤28 (R-89) ────────────────────────
    //
    // ⚠ ⚠ **BU SAYILAR PAZARLAMA SEZGİSİ DEĞİL, GEOMETRİK ZORUNLULUK.** Başlığın
    // bakışlık puntoda (≥0,5° açısal x-yüksekliği) olması ve 2–3 satıra sığması
    // gerekiyor; 1080 px tuvalde bu satır başına ~2,5 kelime eder → **5–8 kelime**.
    // Aynı yoldan gövde ≈20 kelime çıkıyor. İki bağımsız türetmenin aynı sayıya
    // varması kuralın sağlamlığının kanıtı (araştırma belgesi).
    //
    // ⚠ **ÜST SINIR ZORLANIYOR, ALT SINIR ZORLANMIYOR.** Kısa bir başlık ("Sessiz bir
    // dönüşüm" — üç kelime) kusur değil, çoğu zaman daha güçlü. Ölçülen şey uzunluğun
    // kadraja SIĞIP SIĞMADIĞI; kısalık bir tercih, uzunluk bir taşma riski.
    //
    // ⚠ Burada reddediliyor çünkü model yazıyor: render'a kadar beklemek dört görsel
    // üretip sonra "başlık uzun" demek olurdu ve o para geri gelmiyor.
    const kelimeSay = (t: string): number =>
      t.replace(/\*\*/g, '').trim().split(/\s+/).filter(Boolean).length
    const baslikKelime = kelimeSay(y.baslik)
    if (baslikKelime > BASLIK_KELIME_TAVANI) {
      kusurlar.push(
        `${yer}: başlık ${String(baslikKelime)} kelime — tavan ${String(BASLIK_KELIME_TAVANI)} ` +
          `(bakışlık punto 2–3 satıra sığmalı, R-89)`
      )
    }
    const slaytKelime = baslikKelime + kelimeSay(y.govde) + kelimeSay(y.ustBaslik)
    if (slaytKelime > SLAYT_KELIME_TAVANI) {
      kusurlar.push(
        `${yer}: slayt ${String(slaytKelime)} kelime — tavan ${String(SLAYT_KELIME_TAVANI)} (R-89)`
      )
    }
    if ((y.baslik.match(/\*\*/g) ?? []).length % 2 !== 0)
      kusurlar.push(`${yer}: yarım kalan \`**\` vurgu işareti`)
    // ⚠ ⚠ **ÜST BAŞLIĞIN VAR OLUP OLMADIĞINA ŞABLON KARAR VERİR — D-299'un aynısı.**
    // Eski kural her kartta üst başlık ŞART koşuyordu ve bu, altı şablona TEK bir
    // iskelet dayatıyordu: el yazısı → kaps etiket → iri başlık → gövde. Depo sahibi
    // "yedi tasarım değil tek tasarımın yedi boyası" derken tam bunu görmüştü; tipografi
    // reçeteleri farklıydı, KOMPOZİSYON aynıydı. Bir sözleşme, bir tasarım kararını
    // sessizce evrenselleştirmişti.
    //
    // ⚠ Aynı ders `hayalet` için zaten yazılmıştı ve `ustBaslik`e uygulanmamıştı — bu
    // deponun tekrar eden sınıfı: bir dosyaya yazılmış ders komşu alana geçmiyor.
    const ustBaslikVar = (o.ustBaslik ?? '').trim() !== ''
    if (ustBaslikVar && y.ustBaslik.trim() === '') kusurlar.push(`${yer}: üst başlık boş`)
    const butce = kelimeButcesi(ornek)
    const uzun = enUzunKelime(y.baslik)
    if ([...uzun].length > butce)
      kusurlar.push(
        `${yer}: başlıktaki "${uzun}" ${[...uzun].length} harf, şablonun bütçesi ${butce} — ` +
          `tek uzun kelime TÜM karoselin puntosunu düşürür, daha kısa bir kelime seç`
      )
    if (ustBaslikVar && SAYAC_ETIKETI.test(y.ustBaslik))
      kusurlar.push(
        `${yer}: üst başlık bir SAYAÇ ("${y.ustBaslik}") — numaralı etiket yasak, kartın konusunu adlandır`
      )
    // ⚠ ⚠ **PANO ÖGE SAYISI KOMPOZİSYONUN PARÇASI — ve `dizin` bunu üretimde kaybetti.**
    // O şablonun kimliği *"dört maddenin dördü HER kartta"* ve ok güzergâhı madde
    // satırlarına varacak şekilde hizalı. Gerçek bir koşuda model listeleri İKİ maddeye
    // indirdi: deste kimliğini kaybetti ve üç okun üçü de boşluğa indi.
    // ⚠ Tip zaten sabitleniyordu; sayı sabitlenmiyordu. Sözleşmenin bir yarısı yine
    // eksikti — bu turda beşinci kez aynı sınıf.
    // ⚠ ⚠ **KURAL ÖNCE FAZLA GENİŞ YAZILDI ve kendi testi düzeltti.** İlk hâli HER pano
    // tipinde sayıyı sabitliyordu; oysa bir grafiğin üç mü dört mü çubuk taşıyacağı
    // İÇERİĞİN kararı ve mevcut bir test bunu haklı olarak savunuyordu. Sabit olması
    // gereken yer dar ve YAPISAL: taşıyıcısı OK olan deste, oklarını pano satırlarına
    // vardırıyor (`tasiyici-verisi`: ok sayısı = madde sayısı − 1). Orada sayı bir
    // tercih değil, geometrinin kendisi.
    // ⚠ Test kurguları bant taşımayabiliyor: alan istemli okunuyor.
    const rotali = (ornek.bant as { tip?: string } | undefined)?.tip === 'ok'
    const beklenen = rotali ? panoOgeSayisi(o.panel) : null
    const gelen = rotali
      ? panoOgeSayisi(y.panel as KatalogOrnegi['kartlar'][number]['panel'])
      : null
    if (beklenen !== null && gelen !== null && gelen !== beklenen)
      kusurlar.push(
        `${yer}: pano ${String(gelen)} öge taşıyor, şablon TAM ${String(beklenen)} istiyor — ` +
          'öge sayısı kompozisyonun parçası; taşıyıcı oklar o satırlara varıyor'
      )
    // ⚠ ⚠ **ROTALI DESTEDE HER KARTTA TAM BİR YANIK MADDE OLMALI.** Ok o maddeye
    // iniyor; hiçbiri yanık değilse ok hedefsiz kalır, birden fazlaysa hangisine
    // indiği belirsizleşir. Üretimde tam olarak birincisi oldu: model `aktif` alanını
    // hiç doldurmadı (şemada yoktu), dört kartta da bütün maddeler sönük kaldı.
    if (rotali && gelen !== null) {
      const liste = y.panel as { tip?: string; ogeler?: readonly { aktif?: boolean }[] } | null
      if (liste?.tip === 'liste') {
        const yanik = (liste.ogeler ?? []).filter((x) => x.aktif === true).length
        if (yanik !== 1)
          kusurlar.push(
            `${yer}: listede ${String(yanik)} yanık madde var, TAM 1 olmalı — ` +
              'güzergâhın oku yanık maddeye iniyor, yoksa hedefsiz kalıyor'
          )
      }
    }
    // ⚠ ⚠ **HER ÇUBUĞU TARALI BİR GRAFİK, GRAFİK DEĞİLDİR.** Tarama "bu değer ölçülmedi,
    // öngörülüyor" demek; hepsi taralıysa ayrım YOK olur ve okuyucu bütün seriyi uydurma
    // sanır. Gerçek bir koşuda (`veri-hikayesi`) tam olarak bu oldu — üç panonun üçünde
    // de bütün çubuklar taralıydı. İstem artık anlamı söylüyor; bu iddia da onu ölçüyor,
    // çünkü söylenen bir kural ile ölçülen bir kural aynı şey değildir.
    // ⚠ Şekil DARALTILARAK okunuyor: uyarlama panelinin tipi gevşek ve `satirlar` her
    // panel tipinde yok. Doğrudan erişmek, olmayan bir alana güvenmek olurdu.
    const pano = y.panel as { tip?: string; satirlar?: readonly { tahmin?: boolean }[] } | null
    const cubuklar = pano?.tip === 'cubuklar' ? (pano.satirlar ?? []) : []
    if (cubuklar.length > 1 && cubuklar.every((r) => r.tahmin === true))
      kusurlar.push(
        `${yer}: panodaki ${String(cubuklar.length)} çubuğun HEPSİ tahmin işaretli — ` +
          'tarama "ölçülmedi" demek, hepsi taralıysa ayrım kalmıyor ve seri uydurma okunuyor'
      )
    // ⚠ Örnek işareti kalmışsa kaynak GİRİLMEMİŞ demektir (Yasa 8).
    if (y.rayaOrta.includes(ORNEK_ISARETI))
      kusurlar.push(`${yer}: kaynak hâlâ "${y.rayaOrta}" — şablonun örnek işareti değiştirilmeli`)
    if (y.rayaOrta.trim() === '') kusurlar.push(`${yer}: kaynak boş`)

    // Panel TİPİ şablondan; uyarlama yalnız veriyi değiştirebiliyor.
    const panel = ((): Panel | null => {
      if (y.panel === undefined) return o.panel
      if (o.panel === null && y.panel !== null) {
        kusurlar.push(`${yer}: şablonda panel yok, uyarlama panel eklemeye çalışıyor`)
        return null
      }
      if (o.panel !== null && y.panel === null) {
        kusurlar.push(`${yer}: şablonda panel var, uyarlama onu siliyor`)
        return o.panel
      }
      if (o.panel !== null && y.panel !== null && o.panel.tip !== y.panel.tip) {
        kusurlar.push(
          `${yer}: panel tipi değiştirilemez — şablon "${o.panel.tip}", uyarlama "${y.panel.tip}"`
        )
        return o.panel
      }
      return y.panel
    })()

    kartlar.push({
      // Şablon bu ögeyi kullanmıyorsa model doldursa bile ÇİZİLMEZ: kompozisyon
      // şablonun, içerik modelin.
      ustBaslik: ustBaslikVar ? y.ustBaslik : '',
      baslik: y.baslik,
      govde: y.govde,
      // ⚠ ⚠ **HAYALETİ ŞABLON KARAR VERİR, MODEL DEĞİL (D-299).** Örnekteki hayalet BOŞSA
      // o şablon bu ögeyi KULLANMIYOR demektir ve model doldurursa metnin arkasına dev
      // soluk bir filigran düşüyor. Depo sahibi altı şablonun altısında bunu gördü ve
      // haklıydı: dev rakam yalnız ona YER olan kompozisyonda bir öge, ötekilerde gürültü.
      // ⚠ Ters yönde serbest: şablon kullanıyorsa modelin YAZDIĞI değer geçerli — içerik
      // onun işi, kompozisyon bizim.
      hayalet: (o.hayalet ?? '').trim() === '' ? '' : y.hayalet,
      rayaSol: y.rayaSol,
      rayaOrta: y.rayaOrta,
      panel,
      // ⚠ Kartın kendi zemini KOMPOZİSYON: `donen`in kimliği tam olarak o rotasyon.
      // Uyarlamadan değil şablondan geliyor.
      ...(o.zemin === undefined ? {} : { zemin: o.zemin }),
      // ⚠ ⚠ **`kolon` DA KOMPOZİSYON ve TAŞINMAYI UNUTTU — gerçek koşu gösterdi.**
      // Metnin yatay yeri öznenin karşı yanı demek; taşınmayınca dört slaytta da metin
      // SOLA düştü ve figürün üstüne bindi ("amirinin…" bir gövdenin arkasından
      // okunuyordu). Ders bir satır YUKARIDA yazılıydı — `zemin` için. Bir dosyaya
      // yazılmış ders, o dosyaya SONRADAN eklenen alana kendiliğinden geçmiyor; bu
      // deponun tekrar eden sınıfı.
      ...(o.kolon === undefined ? {} : { kolon: o.kolon }),
      // ⚠ ⚠ **`elYazisi` DE TAŞINMAYI UNUTTU — ve bu, DERSİN HEMEN YANINA yazıldığı
      // hâlde oldu.** Bir üstteki blok tam olarak bunu anlatıyor ("bir dosyaya yazılmış
      // ders, o dosyaya sonradan eklenen alana geçmiyor") ve `elYazisi` o satır
      // yazıldıktan SONRA eklendi; yine geçmedi. Gerçek koşuda `editoryal`in kapak
      // slaydındaki el yazısı vurgusu kayboldu.
      //
      // ⚠ **Kalıcı çözüm bir yorum değil, bir TEST:** `sablon-uyarla.test.ts` artık
      // şablonun taşıdığı KOMPOZİSYON alanlarının hepsinin uyarlanmış belgede
      // durduğunu alan alan değil, ALAN LİSTESİ üzerinden ölçüyor.
      // ⚠ ⚠ **`ayar` ÜÇÜNCÜ ADAY ve ISIRMADAN önce yakalandı.** Elle yapılmış ince ayar
      // (kaydırma + punto çarpanı) da kompozisyondur: depo sahibi bir başlığı elle
      // yerine oturttuysa o karar şablonun parçasıdır ve uyarlama onu düşüremez.
      // Yukarıdaki iki blok aynı hatayı iki kez anlatıyor; bu satır o dersin ilk kez
      // ÖNCEDEN uygulanmış hâli — alan eklenirken listeye de eklendi, koşu gösterdikten
      // sonra değil.
      ...(o.ayar === undefined ? {} : { ayar: o.ayar }),
      // ⚠ ⚠ **`kapanis` DÖRDÜNCÜ ADAY ve dikiş testi ISIRMADAN yakaladı.** Kapanış kartı
      // kataloğa girer girmez `katalog-dikis` ON şablonda birden kırmızıya döndü: alan
      // şablonda vardı, uyarlanmış belgeye GEÇMİYORDU. Yukarıdaki üç blok aynı dersi üç
      // kez anlatıyor (`zemin` · `kolon` · `ayar`); bu dördüncüsü ve ilk kez bir kural
      // — yorum değil — onu yakaladı.
      // ⚠ Varış rakamı KOMPOZİSYONDUR: destenin nerede tepe yaptığını o söylüyor.
      // Metni uyarlama değiştirebilir, VARLIĞINI değiştiremez.
      ...(o.kapanis === undefined ? {} : { kapanis: y.kapanis ?? o.kapanis }),
      // ⚠ ⚠ **BEŞİNCİ KEZ — VE BU KEZ ÜÇ ALAN BİRDEN.** Yukarıdaki bloklar aynı dersi
      // dört kez anlatıyor (`zemin` · `kolon` · `elYazisi` · `ayar` · `kapanis`) ve
      // beşincisini yine ben yaptım: `dikey`, `aksanRolu` ve `aksanDibi` şablona eklendi,
      // buraya eklenmedi. `katalog-dikis` ON şablonda birden kırmızı döndü.
      //
      // ⚠ Ve kusuru gözden kaçırmamın sebebi ölçülebilir: yalnız `packages/render` paketini
      // koşturdum, oysa bu kapı `packages/engine`de duruyor. *Bir paketin yeşili, ötekinin
      // kırmızısını gizler.*
      //
      // ⚠ Üçü de KOMPOZİSYON: `dikey` metnin dikey hizası, `aksanRolu` rengin o karttaki
      // işi (vurgu · yüzey · işaret · sessizlik), `aksanDibi` yüzeyin nerede bittiği.
      // İçeriği uyarlama yazar; kartın NEREYE ve NASIL yerleştiğini şablon söyler.
      ...(o.dikey === undefined ? {} : { dikey: o.dikey }),
      ...(o.aksanRolu === undefined ? {} : { aksanRolu: o.aksanRolu }),
      ...(o.aksanDibi === undefined ? {} : { aksanDibi: o.aksanDibi }),
    })
  }

  // ⚠ ⚠ **MARKA FONTUNUN ÇİZEMEYECEĞİ KARAKTER SÖZLEŞMEDE YAKALANIYOR — gerçek koşu
  // bunu iki kez gösterdi.** Model metne `✓` ve `→` koydu; `@font-face`in `unicode-range`i
  // onları kapsamıyor ve tarayıcı sistem fontuna düşüyor. Kusur render sonrası
  // ölçülüyordu (`eksik-glif`) ve düzeltme turuna gidiyordu — yani bir render, bir model
  // çağrısı ve bir tur daha harcanıyordu. Oysa cevap ÜRETİM ANINDA biliniyor: karakterin
  // kapsamda olup olmadığı metne bakmakla belli. **Sonradan ölçmek yerine baştan
  // reddetmek**, bu depoda tekrar eden ilke (garanti yoklukla zorlanır).
  // ⚠ **REDDETMİYOR, UYARIYOR** — gerekçe `UyarlamaSonucu.uyarilar` üstünde. Denetimdeki
  // `eksik-glif` ölçümü de KALIYOR: sözleşme yalnız uyarlama yolunu görüyor.
  const kapsamDisi = kapsamDisiKarakterler(
    u.kartlar
      .map((k) => `${k.ustBaslik}${k.baslik}${k.govde}${k.hayalet}${k.rayaSol}${k.rayaOrta}`)
      .join('')
  )
  const uyarilar: string[] =
    kapsamDisi.length === 0
      ? []
      : [
          `marka fontu şu karakterleri çizemiyor: ${kapsamDisi.join(' ')} — ` +
            'metinden çıkar ya da yazıyla ifade et',
        ]

  // ⚠ ⚠ **ÖRNEK BAŞLIKLARIN AYNEN KALMASI DA BİR KUSUR — gerçek koşu bunu öğretti.**
  // `ÖRNEK VERİ` işareti kaynağı koruyordu ama METNİ korumuyordu: model gövdeleri konuya
  // uyarladı ve dört başlığın dördünü de şablondan aynen kopyaladı. Sonuç konuya değil
  // ŞABLONA ait bir karoseldi ve hiçbir kapı itiraz etmedi. Tek tek başlık eşleşmesi
  // meşru olabilir (kısa, jenerik bir kapanış); HEPSİNİN eşleşmesi uyarlamanın hiç
  // yapılmadığı anlamına gelir.
  const aynen = u.kartlar.filter((y, i) => y.baslik.trim() === ornek.kartlar[i]?.baslik.trim())
  if (aynen.length === u.kartlar.length)
    kusurlar.push(
      `başlıkların TAMAMI şablonun örneğiyle aynı (${aynen.length}/${u.kartlar.length}) — ` +
        'uyarlama yapılmamış; başlıklar konuya göre yeniden yazılmalı'
    )

  if (kusurlar.length > 0) return { ok: false, kusurlar }
  // ⚠ Şablonun geri kalanı DOKUNULMADAN geçiyor: bant, görseller, lekeler, alan sınırı,
  // tipografi, yerleşim, zemin dokusu, hayalet konumu, görsel işlemleri.
  return { ok: true, belge: { ...ornek, kartlar }, uyarilar }
}

/**
 * Uyarlama isteminin sabit kısmı — agent'a NE yapacağı ve ne YAPAMAYACAĞI.
 *
 * ⚠ İstem şablonun kompozisyonunu ANLATMIYOR, çünkü agent onu değiştiremiyor zaten.
 * Anlatılan tek şey içeriğin şekli: kaç kart, her kartın rolü, hangi kartta hangi panel
 * tipi var. Değiştirilemeyen bir şeyi tarif etmek, modele orada bir seçim varmış gibi
 * gösterir ve o seçimi yapmaya çalışır.
 */
/**
 * Panonun ÖGE SAYISI — istemde ve doğrulamada AYNI kaynaktan.
 *
 * ⚠ İki yerde hesaplanan bir sayı iki farklı sonuç verir: model bir sayıya uyarken
 * başka bir sayıda reddedilir.
 */
const panoOgeSayisi = (panel: KatalogOrnegi['kartlar'][number]['panel']): number | null => {
  // ⚠ `null` DEĞİL, `undefined` da gelebilir: panel alanı istemli ve testlerde kart
  // panelsiz kuruluyor. Yalnız `null` denetlemek, bu turda TypeError ile on bir testi
  // birden düşürdü.
  const p = panel as
    { tip?: string; ogeler?: readonly unknown[]; satirlar?: readonly unknown[] } | null | undefined
  if (p === null || p === undefined) return null
  if (p.tip === 'liste' || p.tip === 'sayilar' || p.tip === 'etiketler')
    return (p.ogeler ?? []).length
  if (p.tip === 'cubuklar') return (p.satirlar ?? []).length
  return null
}

const panoAdedi = (panel: KatalogOrnegi['kartlar'][number]['panel']): string => {
  const n = panoOgeSayisi(panel)
  return n === null ? '' : `, TAM ${String(n)} öge`
}

export const uyarlamaIstemi = (ornek: KatalogOrnegi, sablonId: string, konu: string): string => {
  // ⚠ Bütçe DOĞRULAYICIYLA AYNI kaynaktan: iki yerde hesaplanan bir sayı, iki farklı
  // sonuç verir ve model bir sınıra uyarken başka bir sınırda reddedilir.
  const butce = kelimeButcesi(ornek)
  // ⚠ ⚠ **ÖRNEK BAŞLIĞIN METNİ İSTEME GİRMİYOR — YALNIZ ŞEKLİ.** İstem zaten
  // "başlıkları konuya göre yeniden yaz, aynen bırakmak reddedilir" diyordu ve model
  // İKİ AYRI KOŞUDA dördü de aynen döndürdü; `uyarla` haklı olarak reddetti ve hat
  // `kompozit`te öldü. Talimatı yükseltmek üçüncü kez denemek olurdu: **kopyalanmasını
  // istemediğimiz metni modelin önüne koyduğumuz sürece kopyalanıyor.** Model bir
  // örneği "doldurulacak yer tutucu" değil "verilmiş içerik" sayıyor.
  //
  // ⚠ Kaybedilen bir şey YOK: başlığın işlevini taşıyan bilgi uzunluğu, vurgunun kaçıncı
  // kelimede olduğu ve panel tipi. Üçü de burada. Konuya özgü malzeme zaten istemin
  // "Kaynak metin" bölümünde ve gerçek içerik oradan gelmeli.
  // Şablon bu ögeyi kullanıyor mu — istemin ÜÇ yeri buna bağlı (D-312).
  const ustBasligiVar = ornek.kartlar.some((k) => k.ustBaslik.trim() !== '')
  const kartlar = ornek.kartlar
    .map((k, i) => {
      // ⚠ ⚠ **TİP SABİTLENİYORDU, SAYI SABİTLENMİYORDU — ve `dizin` bunu üretimde
      // kaybetti.** O şablonun kimliği *"dört maddenin dördü HER kartta"*; gerçek bir
      // koşuda model listeleri İKİ maddeye indirdi ve deste kimliğini kaybetti. Üstelik
      // ok güzergâhı madde satırlarına varacak şekilde hizalı — madde sayısı değişince
      // oklar boşluğa iniyor. Sayı bir tercih değil, KOMPOZİSYONUN parçası.
      const p =
        k.panel === null
          ? 'panel yok'
          : `panel: ${k.panel.tip} (tipi DEĞİŞTİRİLEMEZ${panoAdedi(k.panel)})`
      const kelimeler = k.baslik.split(/\s+/).filter((w) => w !== '')
      const vurguSirasi = kelimeler.findIndex((w) => w.includes('**'))
      const vurgu =
        vurguSirasi < 0 ? 'vurgu yok' : `vurgu ${vurguSirasi + 1}. kelimede (\`**böyle**\`)`
      // ⚠ Şablon üst başlık kullanmıyorsa kart satırı da onu YAZMIYOR: modelin önüne
      // koyduğumuz her alan doldurulmayı ister ve doldurulan alan çizilmese bile
      // modelin dikkatini böler.
      const etiket = k.ustBaslik.trim() === '' ? `kart ${i + 1}` : k.ustBaslik
      // ⚠ ⚠ **GÖVDE BÜTÇESİ DE SÖYLENİYOR — çünkü söylenmeyen sınır KOŞUYU ÖLDÜRÜYOR.**
      // `alinti` gerçek bir koşuda `duzen-provasi`nda düştü: `metin-payi-yuksek`, yani
      // metin kadrajın %30 tavanını aştı. Şablonun kimliği *"tek iri serif söz"* ve
      // taslağındaki gövde kısa; model bunu bilmeden uzun yazdı ve karosel hiç
      // üretilmedi. Denetim tavanı ÖLÇÜYORDU, istem SÖYLEMİYORDU.
      // ⚠ Bütçe yine taslaktan okunuyor, uydurulmuyor: şablonun kendi gövdesi ne kadarsa
      // o. +%25 tolerans, Türkçenin eklerine pay.
      const govdeBut = Math.round([...k.govde].length * 1.25)
      const govdeNot =
        k.govde.trim() === '' ? 'gövde yok' : `gövde: en fazla ${String(govdeBut)} karakter`
      return `${i + 1}. ${etiket} — başlık: ${kelimeler.length} kelime, ${vurgu} · ${govdeNot} · ${p}`
    })
    .join('\n')
  return [
    `Konu: ${konu}`,
    `Şablon: ${sablonId} · ${ornek.kartlar.length} kart`,
    '',
    'Aşağıdaki kart iskeletini bu konuya göre DOLDUR. Başlıkların METNİ sana verilmedi:',
    'her başlığı Kaynak metinden yola çıkarak SEN yazacaksın; verilen şey yalnız uzunluğu,',
    'vurgunun yeri ve panel tipi.',
    'Kompozisyonu değiştirme; yalnız metni ve',
    `panel verisini değiştir. Kart sayısı SABİT: tam ${ornek.kartlar.length} kart üret.`,
    // ⚠ ⚠ **HARF BÜTÇESİ İSTEME YAZILMAZSA MODEL UYAMAZ — VE KOŞU ÖLÜR.** Doğrulayıcı
    // bu bütçeyi zaten ölçüyordu ama istem yalnız KELİME SAYISINI söylüyordu; model
    // harf sınırını bilmeden yazıyor, `kompozit` uyarlamayı reddediyor ve hat
    // ADAPTATION_REJECTED ile duruyor. Gerçek bir koşuda (`editoryal`) model
    // "ertelenir" yazdı — 9 harf, bütçe 8 — ve karosel hiç üretilmedi.
    // ⚠ Türkçe eklemeli: uzun kelime kural, istisna değil. Bilinmeyen bir sınırı
    // rastgele tutturmasını beklemek, koşuyu zara bağlamaktır.
    `En uzun başlık kelimesi EN FAZLA ${String(butce)} harf olabilir — bu şablonun kolon`,
    'genişliği ondan geliyor ve TEK bir uzun kelime bütün karoselin puntosunu düşürür.',
    'Daha uzun bir kelime yazmak zorunda kalıyorsan onu KISALT ya da başka bir kelime seç.',
    // ⚠ ⚠ **CÜMLE DÜZENİ — İngilizce başlık alışkanlığı Türkçeye taşınıyor.** Gerçek bir
    // koşuda (`akan-alan`) model "Vardiya Hafızasına Güvenen Hat Döngüye Giremez" yazdı:
    // her kelimenin baş harfi büyük. Türkçede bu bir başlık düzeni değil; üstelik öteki
    // desteler cümle düzeninde yazıyor ve seri tek hesapta yan yana duruyor.
    'Başlıkları CÜMLE DÜZENİNDE yaz: yalnız ilk harf ve özel adlar büyük.',
    'Her kelimenin baş harfini büyütme — bu İngilizce başlık alışkanlığı, Türkçede değil.',
    'Kaynak metinde daha fazla madde varsa BİRLEŞTİR; daha az varsa madde UYDURMA —',
    'içeriği kartlara dağıtmak senin işin.',
    '',
    kartlar,
    '',
    'Kurallar:',
    // ⚠ ⚠ **KÜNYE KISA OLMAK ZORUNDA.** Eskiden model oraya virgüllü listeler yazıyordu
    // (`upcyman.com, api.upcyman.com`) ve alt ray bir dipnot alanına dönüyordu. Depo
    // sahibi: *"tek konuyla alakalı mesele upcyman.com yazsın yeter"*.
    // ⚠ R-32 hâlâ geçerli: sayısal bir iddia varsa kaynağı GÖRÜNMELİ — ama kaynak tek
    // ve kısa olabilir. Kural kaynağın VARLIĞI, uzunluğu değil.
    '- `rayaOrta` KISA olacak: tek kaynak, tercihen sadece alan adı (`upcyman.com`).',
    '  Virgüllü liste, tarih, açıklama YAZMA. Şablondaki "ÖRNEK VERİ" ifadesi kalırsa',
    '  uyarlama reddedilir; kaynağı olmayan sayısal iddia kullanma.',
    '- `rayaSol` BOŞ bırak: kategori etiketi zaten `ustBaslik`ta ve aynı bilgiyi iki kez',
    '  basmak künyeyi gürültüye çevirir.',
    // ⚠ ⚠ **SINIRI İSTEME YAZMAK, REDDETMEKTEN UCUZ.** Uyarlayıcı kelime tavanını
    // zaten zorluyor (R-89) ama bir ret koşunun tamamına mal oluyor: model yeniden
    // çağrılıyor, konu yeniden okunuyor. Modelin sınırı BİLMESİ hem daha ucuz hem
    // daha iyi sonuç veriyor — sığdırmaya çalışan bir başlık, kırpılan bir başlıktan
    // iyidir.
    `- Başlık EN FAZLA ${String(BASLIK_KELIME_TAVANI)} kelime; kısası daha güçlü. Bu bir üslup` +
      ' tercihi değil: başlık poster puntosunda 2–3 satıra sığmak zorunda.',
    `- Bir slaytta başlık + gövde + üst başlık toplamı en fazla ${String(SLAYT_KELIME_TAVANI)} kelime.`,
    '- Başlıkta vurgulanacak kelimeyi `**böyle**` işaretle; işaretler çift olmalı.',
    '- `hayalet` alanı kısa olmalı: bir rakam ya da tek kelime.',
    '- Yalnız Latin harfleri, Türkçe harfler, rakam ve normal noktalama kullan.',
    '  Ok, tik, kutucuk gibi semboller marka fontunda YOK ve uyarlama reddedilir.',
    '- Panel tipini değiştirme, yalnız içindeki veriyi değiştir.',
    '',
    // ⚠ ⚠ **ÇIKTI SÖZLEŞMESİ İLK SÜRÜMDE HİÇ YAZILMAMIŞTI ve gerçek koşu iki kez
    // `ADAPTATION_UNPARSEABLE` ile durdu.** İstem alanları ANLATIYORDU ama biçimi
    // söylemiyordu; model doğal olarak nesir döndürdü. Ayrıştırıcıyı gevşetmek yanlış
    // cevap olurdu — sözleşmeyi yazmayıp uyulmasını beklemek, kuralı koymadan ihlali
    // cezalandırmaktır. Şema burada, örnekle birlikte.
    // ⚠ ⚠ **SAYAÇ YASAĞI İSTEMDE DE YAZILI OLMAK ZORUNDA.** Yalnız reddetmek, modeli
    // her koşuda aynı duvara çarptırıp bir tur daha yakmak olurdu; kuralı önce SÖYLE,
    // sonra zorla.
    // ⚠ Bütçe İSTEMDE de yazılı: yalnız reddetmek modeli aynı duvara çarptırır.
    `BAŞLIKTA EN UZUN KELİME ${kelimeButcesi(ornek)} HARFİ GEÇEMEZ. Türkçe eklemeli;` +
      ' tek uzun kelime tüm karoselin puntosunu düşürür. Uzun bir kavramı ikiye böl' +
      ' ya da daha kısa bir eşanlamlı kullan.',
    // ⚠ ⚠ **BU KURAL ŞABLONA BAĞLI.** Üst başlık kullanmayan bir şablonda (dergi
    // kapağı gibi) sayaç yasağını anlatmak, olmayan bir alan hakkında talimat
    // vermektir — model onu doldurmaya çalışır ve çıktı şablonun kompozisyonuyla
    // çelişir. → D-312
    ...(ustBasligiVar
      ? [
          'ÜST BAŞLIK SAYAÇ OLAMAZ: "BÖLÜM 01", "SERİ 2", "SORU 3", "ADIM 4" gibi numaralı',
          'etiketler YASAK. Slayt numarası zaten alt rayda basılıyor; üst başlık o kartın',
          'KONUSUNU adlandırır (örn. "MALİYET", "AYRIŞTIRMA", "DÖNGÜ").',
        ]
      : ['BU ŞABLONDA ÜST BAŞLIK YOK: `ustBaslik` alanını BOŞ dize olarak bırak.']),
    // ⚠ ⚠ **GÖRSEL DİLİNİ DE SEN SEÇİYORSUN — koşu başına BİR KEZ.** Şablon her
    // varyantta *"monochrome ink hatching"* diyordu ve konu ne olursa olsun çıktı
    // siyah-beyaz mürekkep taramasıydı; depo sahibi *"yine siyah beyaz gibi, daha özgün
    // olabilir"* dedi. Üslup artık konuya ait ama TEK: dört slayt aynı dili konuşmak
    // zorunda, yoksa yan yana dört ayrı tasarım çıkar (bu depoda ölçülmüş bir kusur).
    'GÖRSEL DİLİ — bu karoselin BÜTÜN görselleri için TEK bir üslup seç ve `gorselDili`',
    'alanına İNGİLİZCE, küçük harfle, tek cümle yaz. Konu neyi hak ediyorsa onu seç;',
    'örnekler (kopyalama, konuya göre KENDİN kur):',
    '  · matte 3d clay render, soft studio light, muted single accent',
    '  · high contrast monochrome illustration with ink hatching',
    '  · documentary photograph, natural light, shallow depth',
    '  · technical line drawing on dark ground, thin even strokes',
    'Kural: tek cümle, insan/metin/logo isteme, marka rengiyle çatışan doygun renk yok.',
    '',
    'ÇIKTI BİÇİMİ — yalnız JSON döndür, önünde ve arkasında hiçbir açıklama olmasın:',
    '{',
    `  "sablonId": "${sablonId}",`,
    '  "gorselDili": "matte 3d clay render, soft studio light",',
    '  "kartlar": [',
    '    {',
    ustBasligiVar ? '      "ustBaslik": "KISA KONU ETİKETİ",' : '      "ustBaslik": "",',
    '      "baslik": "Kısa başlık, **vurgulu** kelimeyle",',
    '      "govde": "Tek cümlelik gövde.",',
    '      "hayalet": "1",',
    '      "rayaSol": "",',
    '      "rayaOrta": "upcyman.com"',
    '    }',
    `    // … toplam ${ornek.kartlar.length} kart`,
    '  ]',
    '}',
    // ⚠ ⚠ **PANEL ŞEMASI HİÇ YAZILMAMIŞTI ve gerçek koşu `ADAPTATION_UNPARSEABLE` ile
    // durdu.** İstem "panel alanını da yaz, tipi aynı olsun" diyordu ama panelin ŞEKLİNİ
    // hiç söylemiyordu; `veri-hikayesi`nin altı kartında BEŞ farklı panel tipi var ve
    // model şekli uydurmak zorunda kalıyordu. Bu, çıktı sözleşmesinin ilk sürümünde
    // yaşanan hatanın (D-268 notu: "şema burada, örnekle birlikte") panel için
    // TEKRARIYDI — sözleşmenin bir yarısı yazılmış, öteki yarısı unutulmuştu.
    //
    // ⚠ Şekil veriliyor, DEĞER verilmiyor: örnek panelin gerçek sayılarını basmak
    // başlıkta olduğu gibi kopyalamaya davet ederdi (D-288). Sayılar Kaynak metinden gelmeli.
    'PANEL ŞEKİLLERİ — kartın taşıdığı tipe göre, tip DEĞİŞTİRİLEMEZ:',
    '  "panel": { "tip": "cubuklar", "baslik": "PANEL BAŞLIĞI", "satirlar": [',
    '      { "etiket": "2019", "deger": 34, "not": "kısa not", "tahmin": false } ] }',
    // ⚠ ⚠ **ŞEKİL VERİLİYORDU, ANLAM VERİLMİYORDU — ve üretimde bunun bedeli ödendi.**
    // `veri-hikayesi` gerçek bir koşuda ÜÇ panosunun ÜÇÜNDE de her çubuğu
    // `tahmin: true` yaptı; render onları taralı çiziyor ve okuyucu altı yıllık verinin
    // TAMAMINI uydurma sanıyor. Model alanı görüyordu ama ne demek olduğunu değil.
    // ⚠ Aynı sınıf hata bu turda dördüncü kez: harf bütçesi söylenmiyordu, gövde
    // bütçesi söylenmiyordu, aksan alanı derinliği sabitti. Şema bir sözleşmedir;
    // sözleşmenin yarısı şekil, yarısı ANLAMDIR.
    '`tahmin` alanı: değer ÖLÇÜLMEDİ, öngörülüyor demektir — o çubuk TARALI çizilir.',
    'Kaynak metin bir değeri açıkça öngörü/hedef diye vermiyorsa `false` bırak.',
    'Bütün satırları `true` yapma: her çubuğu taralı bir grafik hiçbir şey ayırt etmez.',
    '  "panel": { "tip": "sayilar", "ogeler": [',
    '      { "deger": "48", "birim": "%", "alt": "neyin oranı" } ] }',
    '  "panel": { "tip": "vafel", "baslik": "PANEL BAŞLIĞI", "dolu": 7, "toplam": 10 }',
    '  "panel": { "tip": "liste", "baslik": "PANEL BAŞLIĞI", "ogeler": [',
    '      { "no": "01", "ad": "madde metni", "aktif": false } ] }',
    // ⚠ ⚠ **`aktif` ŞEMADA HİÇ YOKTU — ve `dizin` bunu üretimde kaybetti.** O şablonun
    // kimliği "dört maddenin dördü HER kartta, biri YANIK": yanık madde o kartın
    // anlattığı adım ve güzergâhın oku TAM ORAYA iniyor. Model alanı görmediği için
    // hiçbir satırı işaretlemedi; dört kartta da bütün maddeler sönük kaldı ve üç okun
    // ucu hedefsiz boşlukta bitti. Gözle bakınca "oklar bozuk" görünüyordu; sebep
    // okların geometrisi değil, ŞEMANIN EKSİĞİYDİ.
    '`aktif` alanı: o kartın anlattığı madde. Kartta TAM BİR tane `true` olur, geri kalanı',
    '`false` — güzergâhın oku yanık maddeye iner, hiçbiri yanık değilse ok hedefsiz kalır.',
    '  "panel": { "tip": "etiketler", "ogeler": ["2019", "2021", "2023"] }',
    '`deger` SAYI, `no` ve `deger` (sayilar tipinde) METİN — tırnakları örnekteki gibi bırak.',
  ].join('\n')
}
