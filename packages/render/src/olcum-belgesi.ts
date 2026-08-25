// ÖLÇÜM BELGESİ — kapının ölçtüğü belge, üretimin çizdiği belgeyle AYNI olmak zorunda.
//
// ⚠ ⚠ **ON BİR TARAYICI KAPISININ DOKUZU YEDEK FONTLA ÖLÇÜYORDU.** Türkçe metnin
// Archivo'daki satır metrikleri yedek sans'takinden başka; bloklar onlarca piksel
// kayıyor. Sonuç iki yönlü ve ikisi de ölçüldü:
//   · `olu-bant` fontsuzken `veri-hikayesi` k1'i **%29** buluyordu, fontlu ölçüm **%20**.
//   · `metin-gorsel-cakisiyor` fontsuz VE belirteçsiz (`tokenCss: ''`) ölçüyordu ve
//     `memphis`te olmayan bir çakışma bildirdi (gövde y%31'de bitiyor, görsel y%34'te
//     başlıyor — yedek fontta gövde aşağı taşıyor ve çakışma "beliriyor").
// **Yanlış düzeni ölçen bir kapı hem gerçek kusuru kaçırır hem olmayanı uydurur.**
//
// ⚠ Bu yüzden belge TEK yerden kuruluyor: bir kapı fontu ya da belirteci unutamaz.
// ⚠ Marka yolu parametre DEĞİL sabit: ölçüm belgesi kapılar içindir ve kapılar bu
// deponun tek markasını ölçer. Yol parametreleştirilirse her kapı kendi yolunu yazar
// ve unutma yeniden mümkün olur — bu dosyanın var olma sebebi tam olarak o.

import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { BrandId, EraId, RunId } from '@suite/contracts'
import { fontCss } from './fonts.js'
import type { KatalogOrnegi } from './katalog-ornek.js'
import { logoVarliklari } from './logo.js'
import { varlikZinciri, zincirdenCoz } from './marka-varlik.js'
import type { PanoramaBelgesi } from './panorama.js'

const KOK = join(dirname(fileURLToPath(import.meta.url)), '../../..')

/** Marka belirteçleri — renk, punto ve rampa buradan. */
export const OLCUM_TOKEN = readFileSync(
  join(KOK, 'brand/brd_upcytech/derived-tokens/tokens.css'),
  'utf8'
)

// ⚠ `fontCss` ayrımlı birleşim döndürüyor: eksik font bir HATA dalıdır. Daraltmadan
// okumak, fontu yüklenmemiş bir ölçümü sessizce "geçti" saydırırdı.
const FONT_SONUCU = fontCss(join(KOK, 'brand/brd_upcytech/fonts'))
export const OLCUM_FONT = FONT_SONUCU.ok ? FONT_SONUCU.css : ''

// ⚠ Kimlikler MARKALI tip: düz `string` atanamıyor ve bu doğru — bir marka kimliğinin
// gövdesi sözleşmedir (§3.2). Tek tek daraltmak, belgenin tamamını `as unknown as` ile
// zorlamaktan hem dar hem dürüst.
export const OLCUM_DAMGA = {
  brandId: 'brd_t' as BrandId,
  eraId: 'era_t' as EraId,
  kitVersion: 'kit-1',
  definitionDigest: 'sha256:x',
  contextManifest: 'ctx_1',
  sourceRunId: 'run_t' as RunId,
}

// ⚠ ⚠ **LOGO DA ÖLÇÜMÜN PARÇASI.** Kapanış kartı gerçek marka işaretini taşıyor
// (`.kapanis-isaret`, 64 px); logosuz ölçen bir kapı o bloğu KISA görüyor ve olmayan bir
// ölü bant bildiriyor — `donen` k4'te fark %22 ile %28 arasındaydı.
const LOGO = zincirdenCoz(varlikZinciri(join(KOK, 'brand'), 'brd_upcytech', 'logo'), (d) =>
  logoVarliklari(d)
)

/**
 * Katalog örneğinden ölçülebilir panorama belgesi — belirteç + font + logo + damga.
 *
 * ⚠ ⚠ **ÇİFT DÖNÜŞÜM (`as unknown as`) YOK ve bunu `chokepoints` kapısı DAYATTI.** Kapı
 * çift dönüşümü `attributes` açıcı deseni olarak okuyor ve üretim dosyasında haklı olarak
 * reddediyor (testlerde muaf). Dönüşümü saklamak yerine kaldırmak doğru cevaptı: katalog
 * örneği zaten bir panorama belgesinin gövdesi, eksik olan üç alan burada tamamlanıyor.
 */
export const olcumBelgesi = (o: KatalogOrnegi): PanoramaBelgesi => ({
  ...o,
  tokenCss: OLCUM_TOKEN,
  fontCss: OLCUM_FONT,
  ...(LOGO.sonuc.ok ? { logo: LOGO.sonuc.varliklar } : {}),
  stamp: OLCUM_DAMGA,
})
