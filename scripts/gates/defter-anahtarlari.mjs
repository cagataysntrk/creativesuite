// GROUP: fast
// Gövde çıktısındaki her anahtar YA deftere girer YA açıkça dışarıda bırakılır.
//
// ⚠ ⚠ **BU KAPI ALTI KEZ TEKRARLAYAN BİR SESSİZ KÖRLÜKTEN DOĞDU.** `run.ts`teki
// `DEFTER_ANAHTARLARI` beyaz listesi, listede olmayan her çıktı alanını sessizce
// atıyor. Altı kez aynı şey oldu: `tasarimPlani`, `digests`, yargı çıktıları
// (`puanlar` `toplam` `bulgular` `reddedilen`) ve ritim ölçümü. Her seferinde kod
// doğruydu, testler yeşildi, defter boştu — ve hata ancak gerçek bir koşunun
// defterini elle okuyunca göründü.
//
// ⚠ Listenin KENDİ yorumu *"eksik bir beyaz liste sessiz bir körlüktür"* diyor ve
// altıncısı yine oldu. **Yorum altı kez yetmedi; yapı gerekiyor.**
//
// ⚠ Beyaz listeyi kaldırmak çözüm DEĞİL: defterin küçük kalması ölçülmüş bir
// gereklilik (580 KB'lık manifest R-64'ün 512 KB tavanını aşmıştı). Sorun listenin
// varlığı değil, SESSİZLİĞİ. Bu kapı sessizliği kaldırıyor: bir anahtar ya defterde
// olur ya da aşağıdaki envanterde GEREKÇESİYLE dışarıda bırakılır.
//
// ⚠ ⚠ **KAPININ KENDİ SINIRI:** yalnız `data: { … }` sözlük anahtarlarını ve o blok
// içindeki `...yardimci(…)` yayılmalarının DÖNÜŞ TİPİ anahtarlarını görüyor. Dinamik
// anahtar (`[degisken]:`) göremez. Bu sınır burada yazılı çünkü görülmeyen bir sınır,
// olmayan bir sınır sanılır.
//
// ⚠ ⚠ **İKİNCİ KÖR NOKTA, İLK GERÇEK KAPI KOŞUSUNDA GÖRÜLDÜ:** `data` bir YARDIMCININ
// döndürdüğü nesne ise (`data: metneCevir(...)`) anahtarlar sözlük literalinde
// olmadığı için görünmüyor. `metin-uret`in `lines` alanı tam böyleydi: kapı yeşildi,
// alan yine de eleniyordu ve hat metin onayında dururken ONAYLANACAK METİN defterde
// yoktu. Kapı bir sınıfı kapattı, hepsini değil — ve bunu yazmak, kapatmış gibi
// davranmaktan iyidir.

import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const REPO = join(dirname(fileURLToPath(import.meta.url)), '../..')
const GOVDE = 'packages/engine/src/verbs/bodies.ts'
const KOSU = 'packages/engine/src/run.ts'

/**
 * Deftere BİLEREK girmeyen anahtarlar — her biri bir gerekçe taşıyor.
 *
 * ⚠ Buraya bir anahtar eklemek bir KARAR: "bu alan defterde aranmayacak" demek.
 * Gerekçesiz ekleme, kapıyı susturmakla aynı şey.
 */
const DISARIDA = {
  panorama: 'belge modeli — byte ve gömülü font taşır, defter bir depo değil (§3.5)',
  document: 'belge modeli — aynı sebep',
  deck: "PDF yolu — varlık byte'ı içerik-adresli depoda",
  images: 'görsel listesi — alt metinler varlık kaydında',
  text: 'ham model çıktısı — `raw` ile birlikte varlık dosyasında',
  raw: "ham sağlayıcı yanıtı — kanıt varlık sidecar'ında",
  kartlar: 'uyarlama kartları — panorama içinde zaten var',
  uyarlama: 'uyarlama nesnesi — kartlarıyla birlikte belgede',
  uyarilar: 'uyarlama uyarıları — `sebep` alanı taşıyor',
  yollar: 'dosya yolları — `slides` taşıyor',
  genislik: 'render genişliği — `panoramaGenisligi` taşıyor',
  gorsel: 'görsel data URI — byte, defterde yeri yok',
  image_base64: 'görsel data URI — aynı sebep',
  // ⚠ Aşağıdakiler kapı yazılınca çıktı ve BİLEREK dışarıda: hepsi liste/yük.
  records: "kayıt listesi — id'ler donmuş planın `recordIds` alanında zaten var",
  assets: "varlık listesi — byte içerik-adresli depoda, digest'ler `digests` alanında",
  gorselliSlaytlar: 'slayt yükü — görselleriyle birlikte, defter bir depo değil',
}

const kaynak = readFileSync(join(REPO, GOVDE), 'utf8')
const kosuKaynak = readFileSync(join(REPO, KOSU), 'utf8')

// ── beyaz liste okunuyor (elle kopyalanmıyor: iki liste bir gün ayrışır) ─────
const listeBloku = /DEFTER_ANAHTARLARI[^[]*\[([\s\S]*?)\n\]/.exec(kosuKaynak)
if (listeBloku === null) {
  console.error(`  ✗ ${KOSU}: DEFTER_ANAHTARLARI bulunamadı — kapı kendi kaynağını yitirdi`)
  process.exit(1)
}
const defterde = new Set([...listeBloku[1].matchAll(/'([\w]+)'/g)].map((m) => m[1]))

// ── `data: { … }` bloklarının anahtarları ────────────────────────────────────
const bloklar = []
let i = -1
while ((i = kaynak.indexOf('data: {', i + 1)) >= 0) {
  let derinlik = 0
  let j = kaynak.indexOf('{', i)
  const bas = j
  for (; j < kaynak.length; j++) {
    if (kaynak[j] === '{') derinlik++
    else if (kaynak[j] === '}') {
      derinlik--
      if (derinlik === 0) break
    }
  }
  bloklar.push(kaynak.slice(bas + 1, j))
}

/** Yayılan yardımcının dönüş tipi anahtarları — `...ad(` → `const ad = (…): { … }`. */
const yayilmaAnahtarlari = (ad) => {
  const re = new RegExp(
    `const ${ad} = \\\\(([\\\\s\\\\S]*?)\\\\): \\\\{([\\\\s\\\\S]*?)\\\\} => \\\\{`
  )
  const m = re.exec(kaynak)
  if (m === null) return []
  return [...m[2].matchAll(/readonly ([\w]+)\??:/g)].map((x) => x[1])
}

const anahtarlar = new Set()
for (const b of bloklar) {
  // Yalnız ÜST düzey anahtarlar: iç içe nesnelerin alanları defterin konusu değil.
  let derinlik = 0
  for (const satir of b.split('\n')) {
    const kirpik = satir.trim()
    if (derinlik === 0) {
      const d = /^([a-zA-Z_][\w]*)\s*:/.exec(kirpik)
      if (d !== null) anahtarlar.add(d[1])
      const y = /^\.\.\.([a-zA-Z_][\w]*)\(/.exec(kirpik)
      if (y !== null) for (const a of yayilmaAnahtarlari(y[1])) anahtarlar.add(a)
    }
    derinlik += (satir.match(/\{/g) ?? []).length - (satir.match(/\}/g) ?? []).length
    if (derinlik < 0) derinlik = 0
  }
}

const bilinmeyen = [...anahtarlar].filter((a) => !defterde.has(a) && DISARIDA[a] === undefined)

if (bilinmeyen.length > 0) {
  for (const a of bilinmeyen.sort()) {
    console.error(
      `  ✗ '${a}' gövde çıktısında var ama NE defterde NE envanterde — sessizce eleniyor.`
    )
  }
  console.error(
    `\n  Ya ${KOSU} → DEFTER_ANAHTARLARI'na ekle (defterde görünsün),\n` +
      `  ya bu kapının DISARIDA envanterine GEREKÇESİYLE yaz.`
  )
  process.exit(1)
}
console.log(
  `  ✓ ${anahtarlar.size} çıktı anahtarı hesaplı (${defterde.size} defterde · ${Object.keys(DISARIDA).length} bilerek dışarıda)`
)
