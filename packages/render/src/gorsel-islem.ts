// HEDEF: packages/render/src/gorsel-islem.ts
//
// Raster işlem dağarcığı — ADLANDIRILMIŞ ve KAPALI (FAZ-12.2 · §7.1 · §12.1 · R-30).
//
// ⚠ ⚠ **`filter: <serbest dize>` YOK ve olamaz.** İşlem bir enum; serbest CSS kabul eden
// bir imza yazılsaydı sağlayıcı çıktısı doğrudan stile sızabilirdi ve marka garantisi
// biterdi. Tip düzeyinde kapatmak, bir denetim yazmaktan ucuz: ihlal TEMSİL EDİLEMEZ.
// (Aynı ilke: aile garanti alanını taşımıyor, degrade durakları yalnız rampa token'ı.)
//
// ⚠ **Dağarcık üç öge ve dördüncüsü bir KARAR ister.** `backdrop-filter` (cam),
// `feConvolveMatrix` ile kabartma, 3B `transform`, `mix-blend-mode`un geri kalanı —
// hepsi Chromium'da bedava ve hiçbirinin BUGÜN çağıranı yok. Çağıranı olmayan üreteç bu
// projede yedi kez tekrarlayan hata (D-261); bu turda bir tanesi daha silindi.
//
// ⚠ **Sıra anlamlı:** matlama ÖNCE (arka plan hâlâ düz siyahken; duotone sonrası zemin
// amberleşir ve luma anahtarı çalışmaz), sonra keskinlik parlaklık üstünde, en son duotone
// parlaklığı marka eksenine eşliyor. CSS `filter` soldan sağa uygulanıyor; zincir bunu
// dağarcık SIRASINDAN kuruyor, çağıranın listesinden değil.

import type { AileProfili } from '@suite/contracts'
import { duotoneSvg, type DuotoneUclari, VARSAYILAN_UCLAR } from './sablon-filtre.js'

/** Kapalı işlem dağarcığı. Dördüncüsü bir KARAR ister. */
export const GORSEL_ISLEMLERI = ['matlama', 'keskinlik', 'duotone'] as const
export type GorselIslem = (typeof GORSEL_ISLEMLERI)[number]

// ⚠ ⚠ **İKİZ KÜME SINAVI.** `AileProfili` ring 0'da ve render'a bağımlı olamaz, o yüzden
// işlem adları orada da yazılı. İki liste ayrışırsa aşağıdaki satır DERLENMEZ: karşılıklı
// atanabilirlik sınanıyor, tek yönlü değil (tek yön, eksik bir kümeyi kaçırırdı).
// `tipoEfektleri`de bu sınav yok ve iki liste sessizce ayrışabilir — o borç kayıtlı.
type AileIslemi = AileProfili['gorselIslemleri'][number]
const _kumelerAyni: AileIslemi extends GorselIslem
  ? GorselIslem extends AileIslemi
    ? true
    : never
  : never = true
void _kumelerAyni

/**
 * Matlama — düz koyu arka planı ŞEFFAFA çevirir (luma anahtarlama).
 *
 * ⚠ ⚠ **ARKA PLAN SİLME İÇİN 1 GB'LIK MODEL ŞART DEĞİL.** FAZ-11.5 BiRefNet'i bekliyor
 * (~1 GB ağırlık, D-266 tetikleyicisi). Ama kesik özne için gereken şey genel bir
 * segmentasyon değil: brief zaten *"tamamen düz siyah arka plan"* istiyor ve o kısıt
 * altında alfa, görüntünün KENDİ parlaklığından türetilebiliyor.
 *
 * ⚠ **Bu, prompt'a güvenmek DEĞİL.** Duotone'un dersi (FAZ-11.7) buydu: modelin uymasına
 * bağlı bir garanti kırılgandır. Burada da model "siyah zemin" sözünü tutmasa bile filtre
 * KOYU olanı siliyor — sözün tutulmadığı yerde çıktı bozulmuyor, yalnız daha çok şey
 * siliniyor ve bu BAKINCA görülüyor.
 *
 * ⚠ İki adım: `feColorMatrix` parlaklığı ALFA kanalına yazıyor (0.2126/0.7152/0.0722 —
 * insan gözünün yeşile duyarlılığı), sonra `feComponentTransfer` o alfayı sert bir
 * rampadan geçiriyor. Rampa yumuşak bırakılırsa özne kenarında koyu bir hale kalıyor;
 * çok sert olursa saç ve parmak uçları kesiliyor. Tablo ikisinin arasında.
 * ⚠ `color-interpolation-filters="sRGB"`: linearRGB'de parlaklık eşiği kayıyor ve
 * aynı tablo başka bir yerde kesiyor.
 */
export const matlamaSvg = (id: string): string =>
  `<svg class="filtre-tanim" width="0" height="0" aria-hidden="true">` +
  `<filter id="${id}" color-interpolation-filters="sRGB">` +
  `<feColorMatrix type="matrix" values="` +
  `1 0 0 0 0 ` +
  `0 1 0 0 0 ` +
  `0 0 1 0 0 ` +
  `0.2126 0.7152 0.0722 0 0"/>` +
  `<feComponentTransfer><feFuncA type="table" tableValues="0 0 0.06 0.55 0.92 1 1"/>` +
  `</feComponentTransfer>` +
  // ⚠ ⚠ **KAYNAĞIN ALFASIYLA KESİŞTİRME — bu satır olmadan letterbox BEYAZ oluyor.**
  // `object-fit: contain` görselin kutusunda boş bir şerit bırakıyor ve o şerit tamamen
  // şeffaf. Tamamen şeffaf piksellerde çarpımsız RGB TANIMSIZ; Chromium (1,1,1) veriyor
  // ve alfayı o beyazın parlaklığından türetince şerit OPAK BEYAZ çıkıyor.
  // `in` operatörü sonucu kaynağın alfasıyla kesiştiriyor: şeffaf olan şeffaf kalıyor.
  // Filtresiz render'da beyaz satır 0, filtreliyken 27 — deneyle ölçüldü.
  `<feComposite operator="in" in2="SourceGraphic"/>` +
  `</filter></svg>`

/** İşlemin belge içi filtre kimliği — çağıran ile tanım tek yerden eşleşiyor. */
export const islemKimligi = (islem: GorselIslem): string => `islem-${islem}`

/**
 * Keskinlik — 3×3 konvolüsyon.
 *
 * ⚠ **Bu bir süs değil, bir DÜZELTME ve sebebi ölçülebilir:** görsel model 1024² üretiyor,
 * karosel 1080² istiyor ve `object-fit: cover` büyütürken yumuşatıyor. FAZ-12.8 bunu bir
 * BAĞIMLILIKLA (Lanczos yeniden örnekleme) çözmeyi planlıyordu ve karar bekliyor;
 * konvolüsyon çekirdeği aynı kaybın büyük kısmını bedava geri veriyor. *40 satır yazmak
 * bir bağımlılıktan iyidir.*
 *
 * ⚠ **Çekirdek ILIMLI (merkez 5 değil 3.4).** Klasik `[0,-1,0,-1,5,-1,0,-1,0]` 1080 px'te
 * kenarlarda görünür hale bırakıyor ve gren katmanıyla birleşince gürültü gibi okunuyor.
 * Toplam 1: parlaklık korunuyor, yani kontrast metriği kaymıyor.
 *
 * ⚠ `color-interpolation-filters="sRGB"` ŞART. Chromium varsayılanı linearRGB ve o uzayda
 * konvolüsyon koyu uçta abartıyor — duotone da sRGB'de çalışıyor, ikisi ayrı uzayda
 * olsaydı zincir sessizce başka bir şey üretirdi.
 * ⚠ `preserveAlpha="true"`: alfa kanalını keskinleştirmek kenarları tırtıklı yapar.
 */
export const keskinlikSvg = (id: string): string =>
  `<svg class="filtre-tanim" width="0" height="0" aria-hidden="true">` +
  `<filter id="${id}" color-interpolation-filters="sRGB">` +
  `<feConvolveMatrix order="3" preserveAlpha="true" divisor="1" ` +
  `kernelMatrix="0 -0.6 0 -0.6 3.4 -0.6 0 -0.6 0"/>` +
  `</filter></svg>`

/** Bir işlemin SVG tanımı. */
export const islemTanimi = (islem: GorselIslem, u: DuotoneUclari = VARSAYILAN_UCLAR): string =>
  islem === 'matlama'
    ? matlamaSvg(islemKimligi(islem))
    : islem === 'keskinlik'
      ? keskinlikSvg(islemKimligi(islem))
      : duotoneSvg(islemKimligi(islem), u)

/**
 * İşlem zincirinin CSS `filter` değeri.
 *
 * ⚠ **Sıra ÇAĞIRANIN listesinden değil, dağarcıktan geliyor.** Aile `['duotone',
 * 'keskinlik']` yazsa bile zincir `keskinlik → duotone` kuruluyor: sıra bir estetik
 * tercih değil, doğru sonucun şartı (yorumda anlatıldı). Aileye bırakılsaydı yanlış
 * sıralanmış bir liste sessizce hale üretirdi.
 * ⚠ Boş liste `none` DÖNMÜYOR, boş dize dönüyor: çağıran satırı hiç basmasın.
 */
export const islemZinciri = (islemler: readonly GorselIslem[]): string =>
  GORSEL_ISLEMLERI.filter((i) => islemler.includes(i))
    .map((i) => `url(#${islemKimligi(i)})`)
    .join(' ')
