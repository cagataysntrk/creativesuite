// GROUP: fast
//
// PAYLAŞIM ÖLÇÜSÜ İKİ YERDE YAZILI — ve AYNI kalmak zorunda (FAZ-19.12 · madde 8).
//
// ⚠ ⚠ **BU KAPI BİR KOPYAYI KORUYOR ve kopya bilinçli.** Sayının tek kaynağı
// `packages/contracts/src/placement.ts` (`VARSAYILAN_TUVAL`). Panel onu import
// EDEMİYOR: `apps/ui` tarayıcı katmanı ve `@suite/contracts`e uzanmak `rings` kapısına
// takılıyor — bu depoda bir kez denendi ve haklı olarak kırmızı döndü.
//
// ⚠ Kopyayı kaldırmak yerine BAĞLIYORUZ. Aynı sınıfın bedeli ölçülü: `1350` altı ayrı
// dosyada kopyalanmıştı (R-91 · D-321) ve beşi değişip biri unutulsaydı panorama
// sessizce farklı orandan dilimlenecekti — Instagram karoselin oranını İLK slayttan
// alıp gerisini kırptığı için sonuç ancak yayından SONRA görülürdü.
//
// ⚠ Kapı METNİ okuyor, modülü çalıştırmıyor: `apps/ui`yi node'da import etmek TSX ve
// tarayıcı globalleri gerektirirdi. Aranan şey tek bir sabit ve düz metin yeterli.

import { readFileSync } from 'node:fs'

const oku = (yol) => {
  try {
    return readFileSync(yol, 'utf8')
  } catch (e) {
    console.error('✗ okunamadı: ' + yol + ' — ' + String(e?.message ?? e))
    process.exit(1)
  }
}

const sozlesme = oku('packages/contracts/src/placement.ts')
// ⚠ Varlık ekranı koşu ekranıyla BİRLEŞTİ (FAZ-19.13); sabit oraya taşındı.
const panel = oku('apps/ui/src/RunGecmisi.tsx')

// ── 1: sözleşmedeki varsayılan hangi tuval ──────────────────────────────────
const hangi = /export const VARSAYILAN_TUVAL = (TUVAL_[\w]+)/.exec(sozlesme)?.[1]
if (hangi === undefined) {
  console.error('✗ `VARSAYILAN_TUVAL` bulunamadı — sözleşme yeniden adlandırılmış olabilir')
  process.exit(1)
}
const tanim = new RegExp(
  'export const ' +
    hangi +
    ':\\s*KaroselTuvali = \\{\\s*genislik:\\s*(\\d+),\\s*yukseklik:\\s*(\\d+)'
).exec(sozlesme)
if (tanim === null) {
  console.error('✗ `' + hangi + '` tanımı okunamadı')
  process.exit(1)
}
const beklenen = tanim[1] + 'x' + tanim[2]

// ── 2: panelin yazdığı sabit ────────────────────────────────────────────────
const panelde = /const PAYLASIM_OLCUSU = '(\d+x\d+)'/.exec(panel)?.[1]
if (panelde === undefined) {
  console.error('✗ `PAYLASIM_OLCUSU` panelde bulunamadı — rozet ölçüyü doğrulayamaz')
  process.exit(1)
}

// ── 3: ikisi AYNI olmak zorunda ─────────────────────────────────────────────
if (panelde !== beklenen) {
  console.error(
    '✗ paylaşım ölçüsü AYRIŞMIŞ:\n' +
      '    sözleşme (' +
      hangi +
      '): ' +
      beklenen +
      '\n' +
      '    panel (PAYLASIM_OLCUSU): ' +
      panelde +
      '\n' +
      '  Panel rozeti doğru ölçüyü "kural dışı" diye işaretler ya da tersi — ekranda\n' +
      '  gördüğün doğrulama, doğrulamadığı bir sayıyı onaylar.'
  )
  process.exit(1)
}

console.log('  paylaşım ölçüsü ' + beklenen + ' · sözleşme ile panel aynı (' + hangi + ')')
