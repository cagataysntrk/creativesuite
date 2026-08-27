// GROUP: fast
//
// PLATFORM LİSTESİ İKİ YERDE YAZILI — ve AYNI kalmak zorunda (FAZ-19.12 · madde 3).
//
// ⚠ ⚠ **KOPYA BİLİNÇLİ, ÇÜNKÜ `apps/ui` TARAYICI KATMANI.** Tek kaynak
// `packages/contracts/src/platform.ts`; panel onu import EDEMİYOR — `rings` kapısı
// `apps/ui`nin `@suite/contracts`e uzanmasını engelliyor ve bu depoda bir kez denenip
// haklı olarak kırmızı döndü.
//
// ⚠ Kopyayı kaldırmak yerine BAĞLIYORUZ. Ayrışmanın bedeli somut: panelde `x` seçilir,
// sözleşmede `x` yoksa koşu `UNSUPPORTED_PLATFORM` ile ölür — ve bu ancak üretim
// başladıktan sonra görünür. Ters yönde ise sözleşmede olan bir platform panelde hiç
// sunulmaz; yetenek var, ulaşan yok (bu depoda tekrar eden zincir kopukluğu).
//
// ⚠ Kapı METNİ okuyor, modülü çalıştırmıyor: `apps/ui`yi node'da import etmek TSX ve
// tarayıcı globalleri gerektirirdi.

import { readFileSync } from 'node:fs'

const oku = (yol) => {
  try {
    return readFileSync(yol, 'utf8')
  } catch (e) {
    console.error('✗ okunamadı: ' + yol + ' — ' + String(e?.message ?? e))
    process.exit(1)
  }
}

// ── 1: sözleşmedeki platform kimlikleri ─────────────────────────────────────
const sozlesme = oku('packages/contracts/src/platform.ts')
const tip = /export type PlatformId =([^\n]*(?:\n\s*\|[^\n]*)*)/.exec(sozlesme)?.[1] ?? ''
const sozlesmeIdler = [...tip.matchAll(/'([a-z]+)'/g)].map((m) => m[1]).sort()
if (sozlesmeIdler.length === 0) {
  console.error('✗ `PlatformId` okunamadı — sözleşme yeniden adlandırılmış olabilir')
  process.exit(1)
}

// ── 2: panelin sunduğu seçenekler ───────────────────────────────────────────
const panel = oku('apps/ui/src/RunLauncher.tsx')
const blok = /const PLATFORM_SECENEKLERI = \[([\s\S]*?)\] as const/.exec(panel)?.[1]
if (blok === undefined) {
  console.error('✗ `PLATFORM_SECENEKLERI` panelde bulunamadı — platform seçimi kaybolmuş olabilir')
  process.exit(1)
}
const panelIdler = [...blok.matchAll(/id:\s*'([a-z]+)'/g)].map((m) => m[1]).sort()

// ── 3: ikisi AYNI olmak zorunda ─────────────────────────────────────────────
const eksik = sozlesmeIdler.filter((x) => !panelIdler.includes(x))
const fazla = panelIdler.filter((x) => !sozlesmeIdler.includes(x))
if (eksik.length > 0 || fazla.length > 0) {
  console.error(
    '✗ platform listesi AYRIŞMIŞ:\n' +
      '    sözleşme (PlatformId)     : ' +
      sozlesmeIdler.join(', ') +
      '\n' +
      '    panel (PLATFORM_SECENEKLERI): ' +
      panelIdler.join(', ') +
      '\n' +
      (eksik.length > 0
        ? '  Sözleşmede VAR panelde YOK: ' + eksik.join(', ') + ' — yetenek var, ulaşan yok.\n'
        : '') +
      (fazla.length > 0
        ? '  Panelde VAR sözleşmede YOK: ' +
          fazla.join(', ') +
          ' — seçilirse koşu UNSUPPORTED_PLATFORM ile ölür, üretim başladıktan SONRA.\n'
        : '')
  )
  process.exit(1)
}

// ── VARSAYILAN SEÇİM de eşit mi ────────────────────────────────────────────
//
// ⚠ ⚠ **BU DENETİM BİR KUSURDAN DOĞDU.** Panelin varsayılanı `instagram + linkedin`di ama
// sunucu, boş bir seçimi *"dördü de"* sayıyordu. Sonuç: takvimde bir gönderiyi başka bir
// güne sürükleyince sunucu hiç seçilmemiş Facebook ve X metinlerini arıyor ve taşımayı
// reddediyordu — ve sebebi ekranda "Instagram metni yok" gibi görünüyordu, oysa asıl
// sebep iki farklı varsayılandı.
//
// ⚠ Liste EŞİTLİĞİ değil, ÜYE eşitliği sınanıyor: sıra bir anlam taşımıyor.
const sozVars = /export const VARSAYILAN_PLATFORMLAR: readonly PlatformId\[\] = \[([^\]]*)\]/.exec(
  sozlesme
)?.[1]
const panelKutusu = oku('apps/ui/src/GonderiKutusu.tsx')
const panelVars = /export const VARSAYILAN_PLATFORMLAR: readonly string\[\] = \[([^\]]*)\]/.exec(
  panelKutusu
)?.[1]
if (sozVars === undefined || panelVars === undefined) {
  console.error(
    '✗ `VARSAYILAN_PLATFORMLAR` bulunamadı — ' +
      (sozVars === undefined ? 'sözleşmede' : 'panelde') +
      '. Varsayılan seçim iki yerde tutuluyor ve eşit kalmak zorunda.'
  )
  process.exit(1)
}
const ayikla = (x) => [...x.matchAll(/'([a-z]+)'/g)].map((m) => m[1]).sort()
const sozVarsIdler = ayikla(sozVars)
const panelVarsIdler = ayikla(panelVars)
if (sozVarsIdler.join(',') !== panelVarsIdler.join(',')) {
  console.error(
    '✗ VARSAYILAN seçim AYRIŞMIŞ:\n' +
      '    sözleşme: ' +
      sozVarsIdler.join(', ') +
      '\n    panel   : ' +
      panelVarsIdler.join(', ') +
      '\n  Ayrışınca panelin planladığı ile sunucunun denetlediği farklı olur ve\n' +
      '  taşıma/planlama hiç seçilmemiş bir platform yüzünden reddedilir.'
  )
  process.exit(1)
}

// ── VARSAYILAN YAYIN SAATİ de iki yerde (FAZ-19.13) ─────────────────────────
//
// ⚠ ⚠ **AYNI SINIFTAN ÜÇÜNCÜ KOPYA.** `rings` kapısı `apps/ui`nin sözleşmeden import
// etmesini yasaklıyor, o yüzden saat de iki yerde yazılı. Platform varsayılanı bir kez
// ayrıştı ve takvim kutucuğu aylarca yanlış gösterdi; saat için aynı bedeli ödemeye
// gerek yok — kapı ikisini karşılaştırıyor.
const saatOku = (metin, ad) => new RegExp(`export const ${ad} = '([^']+)'`).exec(metin)?.[1]
const sozSaat = saatOku(sozlesme, 'VARSAYILAN_YAYIN_SAATI')
const panelSaat = saatOku(panelKutusu, 'VARSAYILAN_YAYIN_SAATI')
// ⚠ BUGÜNÜN saati de iki yerde: aynı sınıftan dördüncü kopya, aynı kapı.
const sozBugun = saatOku(sozlesme, 'BUGUN_YAYIN_SAATI')
const panelBugun = saatOku(panelKutusu, 'BUGUN_YAYIN_SAATI')
if (sozBugun !== panelBugun) {
  console.error(
    '✗ BUGÜNÜN VARSAYILAN SAATİ AYRIŞMIŞ:\n    sözleşme: ' +
      String(sozBugun) +
      '\n    panel   : ' +
      String(panelBugun)
  )
  process.exit(1)
}
if (sozSaat === undefined || panelSaat === undefined) {
  console.error(
    '✗ `VARSAYILAN_YAYIN_SAATI` bulunamadı — ' +
      (sozSaat === undefined ? 'sözleşmede' : 'panelde') +
      '. Varsayılan saat iki yerde tutuluyor ve eşit kalmak zorunda.'
  )
  process.exit(1)
}
if (sozSaat !== panelSaat) {
  console.error(
    '✗ VARSAYILAN SAAT AYRIŞMIŞ:\n    sözleşme: ' +
      sozSaat +
      '\n    panel   : ' +
      panelSaat +
      '\n  Ayrışınca panelin gösterdiği saat ile deftere yazılan saat farklı olur.'
  )
  process.exit(1)
}

console.log(
  '  yayın platformları ' +
    sozlesmeIdler.join(', ') +
    ' · sözleşme ile panel aynı · varsayılan ' +
    sozVarsIdler.join('+') +
    ' · saat ' +
    sozSaat +
    ' (bugün ' +
    String(sozBugun) +
    ')'
)
