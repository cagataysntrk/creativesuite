// HEDEF: packages/contracts/src/katalog.ts
//
// Şablon kataloğu — beş referansın KESİNTİSİZ karşılıkları (§7.1 · D-254).
//
// ⚠ ⚠ **KATALOGA EKLEMEK İŞİ BİTİRMEZ.** Bir şablon ancak KULLANILABİLİRSE kataloğa
// aittir: ihtiyaç duyduğu görsel üretilebiliyor mu, metin şekli hattan çıkıyor mu,
// kesintisizlik gerçekten kuruluyor mu. O yüzden her kayıt ihtiyacını AÇIKÇA ilan
// ediyor — ilan edilmeyen bir ihtiyaç, koşu anında sessiz bir boşluk olur.
//
// ⚠ ⚠ **ÜÇ ŞABLONUN TAŞIYICISI BİR GÖRSEL.** `ornek-1`de kesik öznenin kolu, `ornek-2`de
// daire maskeli ürün, `ornek-4`te tam kaplama fotoğraf. Bunlar dekor değil: kesimi aşan
// öge onlar. Görsel üretilemezse şablon YER TUTUCU ile çiziliyor ve eksiklik görünür
// kalıyor — sessizce metin-only bir sürüme düşmek, tasarımı tanınmaz hâle getirirdi.
//
// ⚠ ⚠ **BRIEF İNGİLİZCE ve BÜYÜK HARFSİZ OLMAK ZORUNDA — iki kez reddedildi.** R-20
// muhafızı (a) büyük harfli öbekleri "metin çizdirme isteği" sayıyor, (b) `no text` alt
// dizesini arıyor ve `no texture` içinde onu buluyor. İkincisi kapının kendisinde bir
// yanlış pozitif (alt dize eşleşmesi); kırmızı bir kapının kuralı aynı turda gevşetilmez
// (R-76), o yüzden brief yeniden yazıldı ve kayıt buraya düşüldü.
//
// ⚠ Renkler TOKEN. Referanstaki turuncu/kırmızı/yeşil rotasyonu birebir kopyalanmadı:
// marka rampasının dışına çıkmak §12.1 chroma tavanını delerdi. Kimliği taşıyan şey
// renklerin kendisi değil, DÖNMESİ.

/** Şablonun ihtiyaç duyduğu görsel — hat bunu üretmekle yükümlü. */
export interface GorselIhtiyaci {
  /**
   * Kaç görsel gerekiyor. `slayt-basina` her karta bir tane ister (kesik özne
   * referansında her karede farklı poz var).
   */
  /**
   * ⚠ `slayt-basina` **GÖVDE slaydı başına** demektir: kapanış kartı özne taşımaz, varış
   * rakamını taşır. Kapsam ölçülerek daraldı — `donen`de gövdenin %47'si, `memphis`te
   * %19'u kapanış karesindeki kesik öznenin üstüne biniyordu.
   */
  readonly adet: 'slayt-basina' | number
  /** Nasıl kırpılacak — kompozisyondaki rolü belirliyor. */
  readonly kirpma: 'kesik' | 'daire' | 'tam'
  /**
   * Brief'in sabit kısmı; konuya özgü kısım hat tarafından ekleniyor.
   *
   * ⚠ **R-20:** hiçbir brief metin istemiyor. "no text, no lettering" kuralı hattın
   * brief kurucusunda ve burada tekrarlanmıyor — iki yerde yazılan bir kural, bir yerde
   * unutulur.
   */
  readonly briefTemeli: string
  /**
   * Yuva başına AYIRT EDİCİ ek — N görsel üretilirken briefleri farklılaştıran şey.
   *
   * ⚠ ⚠ **BU OLMADAN N ÜRETİM N ÖZDEŞ GÖRSEL DEMEK.** Hat artık slayt başına görsel
   * üretebiliyor (borç A8 kapandı) ama `briefTemeli` + konu her çağrıda AYNI; aynı istem
   * aynı modele gidince çıkan şey de aynı kadraj oluyor ve çıktı "aynı figür yan yana"
   * kusuruna geri dönüyordu — tek görsele inmemizin sebebi tam olarak buydu.
   * Ayırt edici şey konu değil KADRAJ: poz, açı, mesafe. O yüzden burada, şablonda.
   *
   * ⚠ Dizi yuva sayısından KISAysa fazlalık yuvalar brief üretmez ve adım atlanır —
   * uydurulmuş bir varyant, sipariş edilmemiş bir kadraj demektir.
   */
  readonly varyantlar?: readonly string[]
}

/**
 * Kesimi aşan süreklilik ögesinin tarifi.
 *
 * ⚠ ⚠ **`alan` VARYANTI BİR EŞLEŞME TESTİNDEN DOĞDU.** Katalog `akan-alan` için
 * `bant: 'egri'` diyordu ama örnek belgede `bant.tip === 'yok'` çıktı ve test kırmızıya
 * döndü. İkisi de kendi içinde doğruydu: kaydın kastettiği eğri BİR BANT DEĞİL, iki renk
 * alanını ayıran SINIR — panoramada `alanSiniri` ile ifade ediliyor. Yani kayıt yalan
 * söylemiyordu, sözlükte o durumun adı YOKTU. Eksik bir sözcük, kaydı yanlış bir
 * sözcüğe zorluyor; test o zorlamayı yakaladı.
 */
export type BantTarifi =
  | { readonly tip: 'egri'; readonly aciklama: string }
  | { readonly tip: 'kemer'; readonly aciklama: string }
  | { readonly tip: 'ok'; readonly aciklama: string }
  /**
   * **Ölçek çizgisi** — panoramayı kat eden hairline ve tırtıkları (D-319).
   *
   * ⚠ Süreklilik bir ışık geçişiyle İMA EDİLMİYOR, bir ölçüyle KURULUYOR: markanın
   * dizayn sistemi degradeyi ve glow'u yasaklıyor, ayrımı yüzey adımı + hairline ile
   * kuruyor. Duraklar içerikten geliyor — silinirse kaybolan şey bir dekor değil,
   * okuyucunun nerede olduğu bilgisi.
   */
  | { readonly tip: 'olcek'; readonly aciklama: string }
  /** Süreklilik iki renk alanını ayıran eğri SINIRDA — ayrı bir bant ögesi yok. */
  | { readonly tip: 'alan'; readonly aciklama: string }
  | { readonly tip: 'yok'; readonly aciklama: string }

export interface KatalogSablonu {
  readonly id: string
  readonly ad: string
  /** Hangi referanstan ölçüldü — iddia değil, izlenebilirlik. */
  readonly kaynak: string
  /** Kaç slayt aralığında çalışıyor. */
  readonly slayt: { readonly min: number; readonly max: number }
  /** Zemin token'ı; kart başına dönüyorsa `rotasyon` dolu. */
  readonly zemin: string
  /** Kart başına dönen zeminler — boşsa tek zemin. */
  readonly rotasyon: readonly string[]
  readonly bant: BantTarifi
  readonly gorsel: GorselIhtiyaci | null
  /** Başlık puntosunun tavana oranı — sesin yüksekliği. */
  readonly baslikPayi: number
  /** Şablonun BUGÜN kullanılabilir olup olmadığı ve sebebi. */
  readonly kullanilabilir: { readonly durum: boolean; readonly sebep: string }
}

// ⚠ ⚠ **ZEMİN ADLARI ARTIK SİSTEMİN ADLARI (D-318).** `AMBER` diye bir zemin yoktu —
// token uzun süre önce laciverte, sonra koyu kanvasa döndü ve ad kaldı. Yanlış adlandırılmış
// bir sabit, okuyanı her seferinde bir kez yanıltıyor.
const KANVAS = 'var(--role-bg)'
const KAGIT = 'var(--role-surface)'
const MUREKKEP = 'var(--role-line-edge)'
const KART_KOYU = 'var(--role-kart-koyu)'
const KART_ACIK = 'var(--role-kart-acik)'

/**
 * Görsel taşıyan şablonlar — ÇALIŞIYOR.
 *
 * ⚠ ⚠ **İLK SÜRÜM BUNLARI "KAPALI" İŞARETLEMİŞTİ ve bu bir OKUMA HATASIYDI.** Koşu
 * çıktısı *"bedava şeritte sağlayıcı yok"* demiyordu; **"yerel önkoşul sağlanmadı"**
 * diyordu. İkisi ayrı şey: `cloudflare-workers-ai` kayıtlı, `enabled: true` ve gerçek
 * çağrıyla doğrulanmış — eksik olan yalnız ortamdaki anahtardı. Hattı `sops exec-env`
 * olmadan koşturdum ve kendi hatamı sağlayıcı yokluğu sandım.
 *
 * ⚠ **Kesik özne için arka plan silme modeli de gerekmedi:** brief düz siyah zemin
 * istiyor, alfa render'da o zeminin parlaklığından türetiliyor (`matlama`). BiRefNet
 * (~1 GB, D-266) hâlâ ertelenmiş durumda ve gerekmedi.
 */
const GORSEL_CALISIYOR = {
  durum: true,
  sebep:
    'Taşıyıcı görsel `cloudflare-workers-ai` ile üretiliyor (bedava şerit, `sops exec-env` ' +
    'ile anahtar); kesik özne düz siyah brief + `matlama` luma anahtarıyla kuruluyor.',
} as const

/**
 * **Veri hikâyesi** — nüfus karoselinin dili: veriden çizilen eğri altı slaydı kat ediyor.
 *
 * ⚠ Bu şablon görselsiz ÇALIŞIYOR ve bu yüzden kataloğun ilk kullanılabilir kaydı:
 * kesimi aşan öge bir fotoğraf değil, verinin kendisi.
 */
export const VERI_HIKAYESI: KatalogSablonu = {
  id: 'veri-hikayesi',
  ad: 'Veri hikâyesi — eğri altı slaydı kat ediyor',
  kaynak: 'panorama referansı (nüfus karoseli)',
  slayt: { min: 4, max: 8 },
  zemin: MUREKKEP,
  rotasyon: [],
  bant: {
    tip: 'egri',
    aciklama:
      'Eğri VERİDEN çiziliyor: x tüm panoramaya yayılıyor, kilometre taşları gerçek ' +
      'olaylara denk geliyor. Süs olsaydı silinebilirdi; veriden türediği için silinemiyor.',
  },
  gorsel: null,
  baslikPayi: 1,
  kullanilabilir: {
    durum: true,
    sebep: 'Görsel gerektirmiyor; taşıyıcı öge veri eğrisi. Hat bugün üretebiliyor.',
  },
}

/**
 * **Sahne** — `ornek-1`: koyu zemin, kesik özne, akan oklar.
 *
 * ⚠ İKİ süreklilik ögesi birden: öznenin kolu kesimi aşıyor VE oklar bir karttan
 * diğerine gidiyor. Göz devamı iki kanaldan kuruyor; biri eksik olursa etki yarıya iner.
 */
export const SAHNE: KatalogSablonu = {
  id: 'sahne',
  ad: 'Sahne — kesik özne kesimi aşıyor, oklar akıyor',
  kaynak: 'ornek-1',
  slayt: { min: 3, max: 6 },
  zemin: MUREKKEP,
  rotasyon: [],
  // ⚠ ⚠ **OKLAR KALDIRILDI ve sebebi ÖLÇÜLDÜ.** Eski açıklama yalnız *"metnin üstünden
  // geçmiyor"* diyordu — GÖRSELİN üstünden geçip geçmediği hiç sorulmamıştı. Gerçek
  // görsellerle ölçüldü: üç yayın ikisi kesik öznelerin üstünden geçiyor, her birinde
  // **772×125 px = görselin %10'u**. Depo sahibi çıktıya bakıp gördü; sayı doğruladı.
  // ⚠ Süreklilik KAYBOLMUYOR: bu şablonun taşıyıcısı zaten kesimi EZEN kesik özne
  // (R-94'ün birinci şıkkı) ve `dikis-bandinda` onu ölçüyor. İkinci bir kanal, birinciyi
  // kesiyorsa kanal değil gürültüdür.
  // ⚠ Aynı ders bu şablonda İKİNCİ kez: nüfus karoselinde oklar başlıkların ortasından
  // geçince silinmişti; bu kez metni değil özneyi kesiyorlardı.
  bant: {
    tip: 'olcek',
    aciklama:
      'Kesik özne kesimi EZİYOR (R-94); ölçek çizgisi öznelerin AYAK HİZASINDAN geçip ' +
      'kalan kesimi kapatıyor. El çizimi yaylar denendi ve kaldırıldı — kesik öznelerin ' +
      "%10'unu kesiyorlardı ve kalkınca ortadaki kesim taşıyıcısız kaldı (R-87).",
  },
  gorsel: {
    // ⚠ ⚠ **SLAYT BAŞINA DEĞİL, KESİM BAŞINA (FAZ-18.3).** Depo sahibi çıktıya bakıp
    // yazdı: *"her sayfada görsel olmasına gerek yok, aşırı boğucu"*. Ve asıl mesele
    // sayı değil KONUM: kesimin üstüne oturan bir görsel sürekliliği KANITLIYOR;
    // slayt başına bir görsel dört ayrı kare üretiyor ve göz bağı her kesimde kopuyor.
    // İki görsel, ikisi de kesimin tam üstünde; aradaki slaytların taşıyıcısı tipografi.
    adet: 2,
    kirpma: 'kesik',
    briefTemeli:
      // ⚠ ⚠ **"ŞEFFAF ARKA PLAN" İSTEMİYORUZ — DÜZ SİYAH İSTİYORUZ.** Görsel modelleri
      // şeffaflık üretmiyor; şeffaflık isteyen bir brief modelin uymasına bağlı, kırılgan
      // bir garanti olurdu. Düz siyah zemin isteniyor ve alfa render'da o zeminin
      // parlaklığından TÜRETİLİYOR (`matlama`). Garantiyi rica etme, yapıya göm.
      //
      // ⚠ ⚠ **BRIEF İNGİLİZCE ve BÜYÜK HARFSİZ — ikisi de zorunlu.** İlk sürüm Türkçe
      // yazılmış ve vurgu için büyük harf kullanmıştı; R-20 muhafızı büyük harfli bir
      // öbeği "metin çizdirme isteği" sayıp beş brief'i birden REDDETTİ. Kapı haklıydı:
      // bir görsel prompt'u nesir değil teknik bir dizedir (D-37 ailesi) ve içindeki her
      // büyük harf, modele yazı çizdirme riski taşır.
      // ⚠ **"no texture" YAZILAMAZ:** R-20 muhafızı `no text` alt dizesini arıyor ve
      // `no texture` içinde onu buluyor — brief `suffix_hand_written` ile reddediliyor.
      // Yanlış pozitif kapının kendisinde (alt dize eşleşmesi), ama kuralı gevşetmek
      // yerine brief yeniden yazıldı: kırmızı bir kapının kuralı aynı turda gevşetilmez
      // (R-76). Kapı kaydı `KARARLAR.md`ye düşecek.
      // ⚠ ⚠ **"YÜZEYLER SADE" ÜRETİMDE ÖLÇÜLEREK EKLENDİ.** `run_01a01876`in 2.
      // slaydında model bir kadran çizdi ve kadranın üstünü UYDURMA rakamlarla
      // doldurdu — okunmayan, bozuk bir şekil. `NO_TEXT_SUFFIX` prompt'ta VARDI ve
      // yetmedi: olumsuzlama görsel modelinde zayıf bir garantidir. Garanti yapıya
      // gömülür — üstü yazı taşımaya müsait bir özne İSTENMEZ (aynı ders: şeffaf
      // arka plan rica edilmiyor, düz siyah isteniyor).
      // ⚠ ⚠ **ESKİ HÂLİ İNSAN VARSAYIYORDU** (*"arms held away from the torso"*,
      // *"body fully in frame"*) ve konu ne olursa olsun modelden bir gövde istiyordu.
      // Taban artık yalnız TEKNİK sözleşme: tek özne, düz siyah zemin (alfa oradan
      // türetiliyor), tek yönlü ışık, sade yüzey. ÖZNEYE agent karar veriyor.
      // ⚠ ⚠ **"RIM LIGHT" → TEK YUMUŞAK ANAHTAR IŞIK (FAZ-18.3).** Ölçüldü: rim light
      // isteyen brief, öznenin arkasına PARLAK BİR HALE koyuyor ve o hale kesme
      // işleminden sonra da kalıyor — düz `#040404` zeminimizin üstünde beyaz bir bulut
      // gibi duruyor. Markanın dizayn sistemi glow'u ve "atmosferik renk"i yasaklıyor;
      // brief onu İSTEMEYE devam ederse yasak yalnız CSS'te geçerli olur.
      // ⚠ ⚠ **"MONOKROM ÇİZİM" GİTTİ, 3B NESNE GELDİ.** Depo sahibi çıktıya bakıp
      // *"sabit monokrom saçmalıklar üretip duruyor"* dedi ve haklıydı: tarif
      // `muted achromatic palette` + `monochrome illustration with ink hatching`
      // istiyordu; model ne yaparsa yapsın sonuç gri bir çizimdi.
      // ⚠ Siyah zemin KALIYOR ve sebebi kayıtlı: alfa o zeminden türetiliyor
      // (`gorsel-kirp`). Şeffaflık RİCA edilmiyor, yapıya gömülü.
      // ⚠ Bu şablonun malzemesi ENDÜSTRİYEL: koyu gövde + tek kobalt yüzey. Renk
      // markadan geliyor (mavi 262°), süsten değil.
      'a single industrial object rendered in 3d, matte charcoal body with one ' +
      'cobalt blue accent surface, plain solid black background free of gradient ' +
      'or surface detail, one soft key light from the side, soft contact shadow, ' +
      // ⚠ ⚠ **BURAYA "no text" YAZILAMAZ ve bunu ÜRETİMDE ödedim.** İlk yazımda
      // 'no text and no logo' ekledim; R-20 muhafızı `no text` alt dizesini arıyor ve
      // brief'i `suffix_hand_written` ile REDDETTİ — gerçek bir koşuda dört yuvanın
      // İKİSİ boş kaldı, slaytlarda yer tutucu göründü. Ek zaten kurucunun kendisi
      // tarafından TEK kaynaktan ekleniyor (`buildImagePrompt`); elle yazılanı
      // reddetmesi kuralın amacı. Aynı tuzak bu dosyada `no texture` için zaten yazılı;
      // ben onu okumuş olmama rağmen aynı yere bastım.
      // ⚠ ⚠ **"YÜZEYLER SADE" GERİ KONDU — DÜŞÜRÜNCE KUSUR AYNEN GERİ GELDİ.** Tarifi
      // 3B'ye çevirirken `every surface in frame plain and unmarked` ibaresini
      // düşürmüştüm; gerçek koşuda (`run_01a03afc`) model LCD ekranlı ölçüm cihazları
      // çizdi ve ekranları UYDURMA rakamlarla doldurdu — Yasa 8'in ta kendisi. Kayıt
      // zaten bu dosyadaydı: *"üstü yazı taşımaya müsait bir özne İSTENMEZ"* ve
      // *"olumsuzlama görsel modelinde zayıf bir garantidir"*. Garanti ÖZNE SEÇİMİNE
      // gömülüyor: ekran, kadran, gösterge İSTENMİYOR.
      'every surface in frame plain and unmarked, no screens dials or gauges, ' +
      'the object reaching past one edge of the frame',
    // ⚠ ⚠ **VARYANTLAR ARTIK YALNIZ POZ DEĞİL, ÖZNE TÜRÜ DE (T4 · T10).** Depo sahibi:
    // *"adam imgeleri sadece adam değil, konu neyse onun 3B görseli de olabilir"* ve
    // *"figürler aynı ailenin klonları gibi"*. İnsan pozu döndürmek çeşitlilik değil,
    // aynı şeyin varyasyonu; kadraja giren ŞEY değişmeli. İkisi de kesik özne olabiliyor:
    // arka plan silme insanı da nesneyi de aynı şekilde kesiyor.
    // ⚠ Malzeme ve ışık da varyantta: pürüzsüz bir render "flat illustration" gibi durur;
    // doku, temas gölgesi ve tek yönlü ışık onu FOTOĞRAF gibi yapıyor.
    //
    // ⚠ ⚠ **"texture" KELİMESİ KULLANILAMAZ — içinde "text" geçiyor.** R-20 muhafızı ALT
    // DİZE eşleştiriyor ve `no texture` içindeki `text` için yanlış pozitif zaten kayıtlı.
    // Bu varyantlar ilk yazımda "fabric texture" diyordu ve testi kırdı; koşuda görsel
    // adımını REDDETTİRECEKTİ. Yerine `weave`, `grain`, `creases` kullanılıyor.
    // ⚠ ⚠ **DÖRT VARYANT TEK GÖRSEL DİLİ KONUŞUR — ve bu bir ÖLÇÜMDEN geldi.**
    // İlk sürüm bilerek dönüşümlüydü: işçi · 3B kil render · işçi · 3B render. Gerçek
    // bir postta sonuç DÖRT AYRI TASARIM DİLİ oldu — kesik illüstrasyon figür, CAD
    // render, foto-illüstrasyon ve krom bir robot yan yana. Karoselin en temel şartı
    // seri bütünlüğü ve çeşitlilik onu bozacaksa çeşitlilik değil dağınıklıktır.
    // ⚠ Özne ÇEŞİTLİLİĞİ kaldı (insan/nesne, duruş, açı); değişmeyen şey İŞLEM.
    // ⚠ **`humanoid`, `robot`, `android` ve `chrome` AÇIKÇA yasak:** soyut bir konuda
    // ("veri katmanı") modelden "konudan bir nesne" istemek insansı krom bir robot
    // getiriyor — ölçüldü. Geri kazanım hattı anlatan bir markada bu konu dışıdır.
    // ⚠ ⚠ **VARYANTLAR ARTIK ÖZNE DEĞİL KADRAJ SÖYLÜYOR — ve bunu ÇIKTI KALİTESİ
    // dayattı.** Depo sahibi: *"insanlar ya da görseller hep bozuk, AI modeller
    // normalde çok daha iyi sonuç veriyor; herhalde bizim şablon veya istem bozuk.
    // İlla adam illa görsel olacak diye bir şey yok, konuya uygun olmalı."*
    //
    // Eski varyantlar ÖZNEYİ dikte ediyordu: *"a worker with arms open wide"*,
    // *"two workers at a control cabinet"*. Konu "veri katmanı" olsa bile model bir
    // işçi çizmek zorundaydı ve konuya ait olmayan bir figürü zorlamak, modelin en
    // kötü çalıştığı yerdir — sonuç bozuk eller, bozuk yüzler, anlamsız sahneler.
    //
    // Artık varyant yalnız KADRAJI söylüyor (açı, mesafe, çerçeveyi aşma) ve ÖZNEYE
    // agent karar veriyor: konu neyi gerektiriyorsa o — bir kişi, bir makine parçası,
    // bir malzeme yığını, soyut bir hacim. Değişmeyen şey GÖRSEL DİL: tek yönlü ışık,
    // mat yüzey, mürekkep tarama, düz siyah zemin. Seri bütünlüğü üsluptan gelir,
    // özneden değil.
    //
    // ⚠ `humanoid`, `robot`, `android` ve `chrome` hâlâ AÇIKÇA yasak: soyut bir konuda
    // modelden nesne istemek insansı krom bir robot getiriyor (ölçüldü) ve geri kazanım
    // hattı anlatan bir markada bu konu dışı.
    // ⚠ ⚠ **DÖRTTEN İKİYE — yuva sayısı kadar (FAZ-18.3).** Kapı bu değişmezi yakaladı:
    // iki yuvaya dört varyant, yani ikisi hiç sipariş edilmeyecek bir kadrajı tarif
    // ediyordu. Ölü bir varyant, yazıldığı gün doğru görünen ve bir daha okunmayan
    // koddur.
    //
    // ⚠ İkisi de KESİMİN üstünde duracak bir özne istiyor: figürün gövdesi kadrajı
    // dikine kesmeli ki iki slayda bölündüğünde her iki yarı da kendi başına okunsun.
    // Yatay yayılan bir özne, kesimde ikiye ayrılınca iki yarım nesne veriyor.
    varyantlar: [
      'framed head-on and centred, upright object filling the frame vertically, studio 3d render, matte surfaces only, no humanoid robot and no chrome',
      'three quarter angle, upright object filling the frame vertically, studio 3d render, matte surfaces only, no humanoid robot and no chrome',
    ],
  },
  baslikPayi: 1,
  kullanilabilir: GORSEL_CALISIYOR,
}

/**
 * **Memphis** — `ornek-3`: beyaz zemin, geometrik leke dili, kesik özneler.
 *
 * ⚠ Burada süreklilik ögesi YOK ve bu bilinçli: referansta da slaytlar bağımsız duruyor,
 * onları bağlayan şey desen dili. Kesintisizlik her şablonun şartı değil — **iddia
 * edilmediği sürece.** İddia edip kuramamak, kurmamaktan kötüdür.
 */
export const MEMPHIS: KatalogSablonu = {
  id: 'memphis',
  ad: 'Memphis — beyaz zemin, geometrik leke dili',
  kaynak: 'ornek-3',
  slayt: { min: 4, max: 8 },
  zemin: KAGIT,
  rotasyon: [],
  bant: {
    // ⚠ Üç görsel BEŞ kesimi kapatamıyor (R-87): ölçek çizgisi panoramayı kat edip
    // hepsini birden kapatıyor. Duraklar altı varsayımın numarası.
    tip: 'olcek',
    aciklama:
      'Referansta slaytlar bağımsız; bağlayan şey desen dili ve soru ritmi. Olmayan bir ' +
      'sürekliliği iddia etmemek, zayıf bir süreklilik kurmaktan dürüst.',
  },
  gorsel: {
    adet: 'slayt-basina',
    kirpma: 'kesik',
    briefTemeli:
      // ⚠ ⚠ **KİŞİ DEĞİL NESNE, ÇİZİM DEĞİL 3B KİL.** Bu şablonun dili geometrik,
      // zemini kâğıt; ona uyan malzeme mat kil. Varyantlardan biri zaten
      // `isometric 3d clay render` diyordu — üslup şablonun içinde vardı, temel tarif
      // onu taşımıyordu.
      // ⚠ Aksan AMBER (80°): kâğıt zeminde mavi, metnin kendi vurgusuyla yarışırdı.
      'a single object rendered as an isometric 3d clay model, warm off white matte ' +
      'body with one amber accent plane, plain solid black background free of ' +
      'surface detail, soft even light, soft contact shadow, every surface in frame ' +
      'plain and unmarked, no screens dials or gauges',
    // ⚠ Varyant KADRAJ ve MALZEME söylüyor; özneyi konu belirliyor (bkz. `SAHNE`).
    varyantlar: [
      'resting on its base, leaning into the frame, chalky matte clay, one soft key light',
      'isometric view from the upper left, matte pastel clay, soft contact shadow',
      'tilted mid air as if just set down, compact silhouette, chalky matte surface',
      // ⚠ ⚠ **ÜÇ → ALTI: yuva sayısı = varyant sayısı (`katalog-kabul.test.ts`).** Yuva
      // üçten altıya çıkınca bu değişmez kırmızı döndü ve düzeltmenin yarım kaldığını
      // söyledi: altı yuva üç varyantla dolarsa dördüncü ve beşinci slaytta AYNI poz
      // tekrar eder — `memphis`in kimliği ise her karede başka bir duruş.
      // ⚠ Varyant KADRAJ ve MALZEME söyler, özneyi konu belirler.
      'three quarter turn, weight on one edge, matte clay with a fine grain, soft light from above',
      'seen from low down looking up, compact silhouette, chalky matte surface, soft even light',
      // ⚠ ⚠ **ALTINCI VARYANT KALDIRILDI — kapanış kartı özne taşımıyor artık.** Yukarıda
      // "üç → altı" yazıyor; şimdi altı → beş. Aynı değişmez iki kez, iki yönde çalıştı.
    ],
  },
  baslikPayi: 0.82,
  kullanilabilir: GORSEL_CALISIYOR,
}

/**
 * **Dönen** — `ornek-2`: aynı düzen, her slaytta başka zemin, daire maskeli ürün.
 *
 * ⚠ Rotasyon marka rampasının İÇİNDE. Referans turuncu→kırmızı→yeşil→sarı dönüyor;
 * birebir kopyalamak marka dışına çıkmak olurdu. Kimlik renklerde değil, DÖNMEDE.
 */
export const DONEN: KatalogSablonu = {
  id: 'donen',
  ad: 'Dönen — zemin her slaytta değişiyor, ürün daire maskede',
  kaynak: 'ornek-2',
  slayt: { min: 3, max: 6 },
  zemin: KANVAS,
  rotasyon: [KANVAS, KART_ACIK, KAGIT, KART_KOYU],
  bant: {
    tip: 'olcek',
    aciklama:
      'Renk rotasyonu tek başına yetmiyordu: iki dev soluk daire sürekliliği bir IŞIK ' +
      'HAVUZUYLA kuruyordu ve dizayn sistemi bunu yasaklıyor. Yerine ölçek çizgisi — ' +
      'duraklar ürünlerin yerinde, yani süreklilik bir süs değil bir ölçü.',
  },
  gorsel: {
    adet: 'slayt-basina',
    // ⚠ ⚠ **`daire` → `kesik` (D-288).** Referansta (`image copy 3`) daire ürünün ARKASINDA
    // duran beyaz bir alan; ürün onu TAŞIYOR, sapı ve yaprağı dışına çıkıyor. Fotoğrafı
    // daireye KIRPMAK aynı görüntü değil, daha az tasarım. Hat zaten arka planı siliyor
    // (`gorsel-kirp`), yani kesik ürün elimizdeydi; daire artık bir leke katmanı.
    kirpma: 'kesik',
    briefTemeli:
      // ⚠ ⚠ **ÜRÜN RENDER'I — bu şablonun işi zaten bir nesneyi DÖNDÜRMEK.** Daire
      // maskesi içinde aynı nesne üç açıdan görünüyor; malzeme parlak olunca dönüş
      // okunuyor, mat monokromda okunmuyordu.
      // ⚠ ⚠ **"RIM LIGHT" YAZILAMAZ ve bunu ben yazmıştım.** FAZ-18.3 ölçtü: rim light
      // isteyen bir brief öznenin ARKASINA parlak bir hale koyuyor ve o hale kesme
      // (`gorsel-kirp`) sırasında özneye yapışıyor. Karar kayıtlıydı: TEK YUMUŞAK
      // ANAHTAR IŞIK. Parlaklık ışıktan değil MALZEMEDEN isteniyor — malzeme kesmeyi
      // bozmuyor.
      'a single product rendered in 3d, brushed metal and matte navy body, one soft ' +
      'key light, plain solid black background free of gradient or surface detail, ' +
      'soft contact shadow, every surface in frame plain and unmarked, no screens ' +
      'dials or gauges',
    // ⚠ Görsel dili varyanta da yazılıyor: `briefTemeli` stüdyo ışığını söylüyor ama
    // varyant onu tekrar etmezse model kadrajı değiştirirken üslubu da kaydırıyor.
    varyantlar: [
      'front elevation, centred in frame, studio 3d render, one soft key light, brushed metal sheen',
      'three quarter angle from the upper left, studio 3d render, one soft key light, brushed metal sheen',
      'close macro of the surface detail, studio 3d render, one soft key light, brushed metal sheen',
      // ⚠ ⚠ **DÖRDÜNCÜ VARYANT KALDIRILDI — kapanış kartı özne taşımıyor artık.**
      // `katalog-kabul` değişmezi (yuva = varyant) bunu ISIRARAK söyledi: yuva üçe indi,
      // varyant dörtte kaldı. Bir sözleşme yarım güncellenirse sessiz kalmıyor.
    ],
  },
  baslikPayi: 0.86,
  kullanilabilir: GORSEL_CALISIYOR,
}

/**
 * **Editoryal** — `ornek-4`: fotoğraf hâkim, tipografi minik, devasa boşluk.
 *
 * ⚠ Bizimkinin TAM ZIDDI ve o yüzden kataloğun en değerli kaydı: bir katalog ancak
 * kendi zıddını barındırabiliyorsa katalogdur. `baslikPayi: 0.38` tavanın çok altında.
 */
export const EDITORYAL: KatalogSablonu = {
  id: 'editoryal',
  ad: 'Editoryal — tam kaplama 3B nesne bandı, minik zarif tipografi',
  kaynak: 'ornek-4',
  slayt: { min: 3, max: 6 },
  zemin: KAGIT,
  rotasyon: [],
  bant: {
    // ⚠ Görsel bu şablonda kesim taşıyıcısı OLAMIYOR: yan yana kolon düzeninde
    // kesimi aşan görsel komşu kartın metnine giriyor (R-84). Taşıyıcı alan sınırı.
    tip: 'alan',
    aciklama:
      'Süreklilik görselin kendisinden: tam kaplama nesne kesimi aşarak sonraki ' +
      'slayda devam ediyor. Çizgi ya da desen yok — boşluk ve nesne yetiyor.',
  },
  gorsel: {
    // ⚠ **2 → 3: BEYAN BAYATTI, ÖRNEK ÜÇ ŞERİT ÇİZİYOR.** `adet`i üretimde hiç kimse
    // okumuyordu (aranıp bulundu: tek okuyan `kirpma`ydı); sayıyı `ORNEKLER`in yuva
    // adedi sürüyor. Beyan bir şey bağlamayınca sessizce kaymıştı. → R-110
    adet: 3,
    // ⚠ ⚠ **`tam` KALIYOR ve bu bir ÖLÇÜMLE karara bağlandı — ilk teşhisim YANLIŞTI.**
    // Depo sahibi *"editoryalde arkaplan vs duruyor"* dedi; koşunun üç görseline
    // bakınca konveyör düz bir giyotinle bitiyordu, eller bilekten kopuyordu. Bunu
    // `kirpma: 'tam'`ın hat tarafından okunmamasına bağladım ve `kesik`e çektim.
    // ⚠ İki hata birden: (1) `kirpma` arka plan SİLMEYİ değil, YERLEŞİMİ tarif ediyor
    // (`object-fit`) ve onu okuyan render, motor değil — yani beyan zaten yerinde
    // okunuyordu. (2) `kesik` bu şablonda ZARAR veriyor: gerçek bir kesik 3B nesneyle
    // iki hâl yan yana çizildi; `contain` nesneyi şeridin dibine büzüyor, dikey bant
    // yok oluyor ve 4. kartta nesne kapanış metninin ÜSTÜNE biniyor.
    // ⚠ ⚠ **KOPUK ELLERİN SEBEBİ BRIEF'Tİ, KIRPMA DEĞİL.** `rembg` fotoğrafik bir
    // sahneden özneyi kesince geriye sahne PARÇASI kalıyor. Arkaplansız 3B nesneyle
    // aynı `tam` yerleşimi tertemiz bir dikey bant veriyor — ölçüldü ve bakıldı.
    kirpma: 'tam',
    // ⚠ ⚠ **BURADA "typography" YAZIYORDU ve o kelime R-20 muhafızının YASAK
    // listesinde.** Brief'i yazan model talimattaki kelimeyi yankılar (bu depoda iki
    // kez oldu: `lettering`, `no texture`) ve görsel adımı `IMAGE_PROMPT_REJECTED`
    // ile reddedilirdi. Boş bırakılan yarının NEDEN boş olduğunu söylemeye gerek yok:
    // brief kadrajı tarif eder, sayfanın geri kalanını değil.
    briefTemeli:
      // ⚠ ⚠ **ESKİDEN "BU ŞABLON 3B'YE ÇEVRİLMİYOR" YAZIYORDU — depo sahibi bozdu.**
      // Gerekçe *"kimliği tam kaplama fotoğraf; kesik bir 3B nesneye çevirmek şablonu
      // silerdi"* idi. Talimat açık geldi: *"kesinlikle arkaplansız ve çerçevesiz 3B
      // görseller kullanılacak"*.
      // ⚠ ⚠ **VE İKİSİ ÇELİŞMİYOR — çelişki sandığım şey bir VARSAYIMDI.** "Kesik 3B
      // nesne" ile "tam kaplama" birbirini dışlamıyor: `sahne`nin brief'i zaten
      // *"the object reaching past one edge of the frame"* diyor. Nesne yeterince
      // büyükse kadrajı doldurur, kesimi aşar ve sürekliliği taşımaya devam eder.
      // Şablonun kimliği KADRAJDA, öznenin fotoğraf olmasında değildi.
      // ⚠ `muted achromatic` geri gelmiyor: şikâyet monokromluktu. Palet sakin kalıyor,
      // tek sıcak nota giriyor — bu şablonun kâğıt zeminiyle akraba olan nota.
      'a single large object rendered in 3d, bone white matte body with one warm ' +
      'amber accent surface, plain solid black background free of gradient or ' +
      'surface detail, one soft key light from above with gentle falloff, soft ' +
      'contact shadow, every surface in frame plain and unmarked, no screens dials ' +
      'or gauges, the object filling the frame and reaching past two of its edges',
    // ⚠ ⚠ **ÜÇ YUVA, ÜÇ VARYANT.** İki varyant kalsaydı üçüncü görsel adımının brief'i
    // BOŞ döner, adım atlanır ve üçüncü yuva yer tutucu kalırdı — ilan ile gerçek yine
    // ayrışırdı. `katalog-ornek.test.ts` artık eşitliği zorluyor.
    // ⚠ ⚠ **VARYANT ARTIK SAHNE DEĞİL NESNE KADRAJI SÖYLÜYOR.** Eskiler *"iş nerede
    // oluyorsa oranın yakın çekimi"*, *"omuz hizasından arkadan"* diyordu — üçü de bir
    // MEKÂN tarif ediyor ve model haklı olarak insanlı bir sahne çiziyordu. Üçü de
    // nesnenin kadrajı hangi kenardan aştığını söylüyor: taşıyıcı rol varyantta yaşar.
    varyantlar: [
      'seen from a low three quarter angle, rising past the upper edge of the frame',
      'a tight view of the point where two of its parts meet, reaching past both side edges',
      'seen from directly above, spreading past the left and lower edges of the frame',
    ],
  },
  baslikPayi: 0.38,
  kullanilabilir: GORSEL_CALISIYOR,
}

/**
 * **Akan alan** — `ornek-5`: iki renk alanı, akan eğri sınır, dev hayalet rakam.
 *
 * ⚠ Bu, FAZ-10 gramerinin kaynağı ve tek görselsiz referans. Panorama modeline
 * taşınınca eğri artık slayt başına değil TÜM panoramaya çiziliyor: eskiden süreklilik
 * ima ediliyordu, şimdi kuruluyor.
 */
export const AKAN_ALAN: KatalogSablonu = {
  id: 'akan-alan',
  ad: 'Akan alan — iki renk alanı, eğri sınır, dev hayalet rakam',
  kaynak: 'ornek-5',
  slayt: { min: 4, max: 8 },
  zemin: KANVAS,
  rotasyon: [KANVAS, KAGIT],
  bant: {
    tip: 'alan',
    aciklama:
      'Eğri sınır TÜM panoramada tek bir yol: slayt başına çizildiğinde kesim ' +
      'çizgisinde kırılıyordu ve süreklilik ima edilmekten öteye geçmiyordu. ' +
      'Taşıyıcı ayrı bir bant değil, iki renk alanını ayıran sınırın kendisi.',
  },
  gorsel: null,
  baslikPayi: 1,
  kullanilabilir: {
    durum: true,
    sebep: 'Görsel gerektirmiyor; taşıyıcı öge eğri sınır ve hayalet rakam.',
  },
}

/**
 * **Kavis** — tek sürekli ufuk; ailenin geometri öncülü üyesi (D-337).
 *
 * ⚠ ⚠ **KEMER DİZİSİ KALDIRILDI — depo sahibinin kararı.** On üç özdeş parabol için
 * *"aşırı HTML/CSS duruyor, çok çirkin, kaldır"* dedi ve haklıydı: eşit genişlikte,
 * eşit yükseklikte, birbirine değen, düz dolgulu tümsekler bir mimari değil bir
 * `border-radius` deseni okuyordu.
 * ⚠ Bant iki iş yapıyordu ve ikisi de karşılandı: kesintisizlik artık tek sürekli bir
 * ALAN SINIRI ile taşınıyor (panorama boyunca bir kez yükselip inen, kesimlerde
 * kırılmayan bir ufuk); veri bağı ise `tasiyici-verisi` kapısında ok↔liste çiftine
 * yönlendirildi. Deste adını hâlâ hak ediyor: kavis gitmedi, TEKLEŞTİ.
 */
export const KAVIS: KatalogSablonu = {
  id: 'kavis',
  ad: 'Kavis — tek sürekli ufuk, dar ve ağır tipografi',
  kaynak: 'aile-2026',
  slayt: { min: 3, max: 6 },
  zemin: KANVAS,
  rotasyon: [],
  bant: {
    // ⚠ Doğru sözcük `yok` DEĞİL `alan`: süreklilik ayrı bir bant ögesiyle değil, iki
    // renk alanını ayıran eğri SINIRLA taşınıyor. Sözlükte bu durumun adı zaten vardı;
    // ilk yazımda `yok` denendi ve tip sistemi reddetti — kayıt yanlış sözcüğe
    // zorlanamadı.
    tip: 'alan',
    aciklama:
      'Tek sürekli ufuk: panorama boyunca bir kez yükselip inen, kesimlerde ' +
      'kırılmayan simetrik bir yay. On üç özdeş kemer bir mimari değil bir desen ' +
      'okunuyordu; tekleşince hem sakinleşti hem sürekliliği tek başına taşır oldu.',
  },
  gorsel: null,
  baslikPayi: 1,
  kullanilabilir: {
    durum: true,
    sebep: 'Görsel gerektirmiyor; taşıyıcı tek sürekli ufuk ve tipografi.',
  },
}

/**
 * **Alıntı** — ailenin sessiz üyesi: yalnız tipografi, kâğıt zemin (D-337).
 *
 * ⚠ Ailede hiç metin-öncülü şablon yoktu; bir karosel dizisi sürekli yüksek sesle
 * konuşamaz. Izgarada yan yana geldiğinde nefes aralığı.
 */
export const ALINTI: KatalogSablonu = {
  id: 'alinti',
  ad: 'Alıntı — tek iri serif söz, kâğıt zemin, süs yok',
  kaynak: 'aile-2026',
  slayt: { min: 2, max: 4 },
  zemin: KAGIT,
  rotasyon: [],
  bant: {
    tip: 'alan',
    aciklama:
      'Kâğıt/mürekkep sınırı panoramayı kat ediyor ve alıntının ALTINDAN geçiyor. ' +
      'Eğim iki kez azaltıldı: metnin içinden geçen bir sınır, metni zemine karıştırıyor.',
  },
  gorsel: null,
  baslikPayi: 1,
  kullanilabilir: {
    durum: true,
    sebep: 'Görsel gerektirmiyor; taşıyıcı alan sınırı, içerik yalnız tipografi.',
  },
}

/**
 * **Karşılaştırma** — önce/sonra; tek yönlü alan süpürmesi (D-337).
 *
 * ⚠ "Zemin kâğıda dönüyor" fikri ölçüm yüzünden terk edildi: kartın metin rengi kendi
 * zemininden türüyor, kâğıt yukarıdan gelirse başlığı aşağıdan gelirse rayı yutuyor.
 * Önce/sonra üç kanaldan okunuyor: süpürme, üst başlıklar ve panel çifti.
 */
export const KARSILASTIRMA: KatalogSablonu = {
  id: 'karsilastirma',
  ad: 'Karşılaştırma — önce/sonra, tek yönlü alan süpürmesi, panel çifti',
  kaynak: 'aile-2026',
  slayt: { min: 3, max: 6 },
  zemin: KANVAS,
  rotasyon: [],
  bant: {
    tip: 'alan',
    aciklama:
      'Sınır TEK YÖNLÜ iniyor — salınan bir sınır akan alanın işi. Panel çifti kasten ' +
      'farklı: önce tarafında dağılım (çubuklar), sonra tarafında sonuç (sayılar).',
  },
  gorsel: null,
  baslikPayi: 1,
  kullanilabilir: {
    durum: true,
    sebep: 'Görsel gerektirmiyor; taşıyıcı alan sınırı, karşılaştırmayı panel çifti kuruyor.',
  },
}

/**
 * **Dizin** — numaralı adımlar; taşıyıcı akış okları (D-337).
 *
 * ⚠ Oklar bu şablonda İKİNCİL değil kompozisyonun kendisi. Basınç eğrisi bu şablon
 * yüzünden düzeltildi: simetrik daralma yön taşımıyordu.
 */
export const DIZIN: KatalogSablonu = {
  id: 'dizin',
  ad: 'Dizin — numaralı adımlar, akış okları, mono liste',
  kaynak: 'aile-2026',
  slayt: { min: 3, max: 6 },
  zemin: KANVAS,
  rotasyon: [],
  bant: {
    tip: 'ok',
    aciklama:
      'Her ok bir adımı sonrakine bağlıyor ve kesimi TAM ORTADAN aşıyor. Oklar kart ' +
      'ARALARINDA duruyor: metnin üstünden geçen bir ok okunabilirliği düşürüyor.',
  },
  gorsel: null,
  baslikPayi: 1,
  kullanilabilir: {
    durum: true,
    sebep: 'Görsel gerektirmiyor; taşıyıcı akış okları ve numaralı liste.',
  },
}

export const KATALOG: readonly KatalogSablonu[] = [
  VERI_HIKAYESI,
  AKAN_ALAN,
  KAVIS,
  ALINTI,
  KARSILASTIRMA,
  DIZIN,
  SAHNE,
  MEMPHIS,
  DONEN,
  EDITORYAL,
]

/** Bugün gerçekten koşabilen şablonlar. */
export const kullanilabilirSablonlar = (): readonly KatalogSablonu[] =>
  KATALOG.filter((s) => s.kullanilabilir.durum)

export const sablonBul = (id: string): KatalogSablonu | null =>
  KATALOG.find((s) => s.id === id) ?? null
