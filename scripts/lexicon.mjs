#!/usr/bin/env node
// Lexicon linter girişi (§4.6 · R-32).
//
// Corpus'u okur, `proof_asset` kayıtlarının aktarım argümanını denetler. Corpus yoksa
// bu bir BAŞARI değildir — ama bir hata da değil: FAZ-2.9'a kadar corpus yoktu ve
// kapı o gün "0 kayıt denetlendi" diye yeşil raporlasaydı hiçbir şey korumazdı.
// Bugün corpus var; sayı çıktıda GÖRÜNÜYOR ki sıfıra düştüğü gün fark edilsin.

import { existsSync, globSync, readFileSync, readdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const REPO = join(dirname(fileURLToPath(import.meta.url)), '..')

const KANIT_DIR = join(REPO, 'corpus/proof_asset')
if (!existsSync(KANIT_DIR)) {
  console.log('✗ corpus/proof_asset yok — denetlenecek kanıt bulunamadı (FAZ-2.9)')
  process.exit(1)
}

// Aktif dönem markadan okunur; dönem-aşırı olup olmadığı buna göre belirlenir.
const MARKA = 'brd_upcytech'
const aktifEra = readFileSync(join(REPO, `brand/${MARKA}/current`), 'utf8').trim()

const dosyalar = readdirSync(KANIT_DIR).filter((f) => f.endsWith('.md'))
if (dosyalar.length === 0) {
  console.log('✗ hiç proof_asset kaydı yok — kapı boş geçiyor')
  process.exit(1)
}

// ── denetimin TAMAMI `stratejiSagligi`den gelir (FAZ-4.16) ──────────────────
//
// Yasak terim listesi, sayısal iddia tespiti, gövdeden alan çıkarma ve çürüme
// kontrolleri eskiden BU DOSYADA yaşıyordu. Strategy Health panosu aynı kuralları
// göstermek zorunda; ikinci bir kopya yazmak D-160'ın tekrarı olurdu — iki gerçek,
// ikisi de "doğru", bir gün sessizce ayrışırlar. Artık kapı ile pano aynı fonksiyonu
// çağırıyor ve ayrışmaları YAPISAL olarak imkânsız.
const { stratejiSagligi } = await import(join(REPO, 'packages/engine/dist/index.js'))
const { hexFromTokens } = await import(join(REPO, 'packages/render/dist/index.js'))
const { systemClock } = await import(join(REPO, 'packages/kernel/dist/index.js'))

// İzinli hex üç durumlu (D-113):
//   `null` → hiç token dosyası yok, palet TANIMSIZ → denetim atlanır
//   `[]`   → token var ama hex içermiyor (OKLCH, §12.1) → HER hex token dışıdır
const tokenDosyalari = globSync('brand/*/derived-tokens/*.css', { cwd: REPO })
let izinliHex = tokenDosyalari.length === 0 ? null : []
for (const tokenYolu of tokenDosyalari) {
  izinliHex = izinliHex.concat(hexFromTokens(readFileSync(join(REPO, tokenYolu), 'utf8')))
}

const saglik = stratejiSagligi({
  repoRoot: REPO,
  aktifEra,
  // Saat kernel'den (R-06 · `saat` darboğazı): ikinci bir saat replay'i bozar.
  simdi: systemClock.nowIso(),
  izinliHex,
})

// Okunamayan kayıt sessizce atlanmaz: taranmayan kayıt, temiz kayıt DEĞİLDİR.
if (saglik.okunamayan.length > 0) {
  for (const o of saglik.okunamayan) console.log(`✗ ${o.yol}: ${o.neden}`)
  process.exit(1)
}

const blocking = saglik.bulgular.filter((b) => b.siddet === 'blocking')
if (blocking.length > 0) {
  for (const b of blocking) console.log(`  ${b.yol}\n    ${b.mesaj}`)
  console.log(`\n${blocking.length} blocking bulgu`)
  process.exit(1)
}
// Uyarılar kapıyı KIRMIYOR ama gizlenmiyor: gizlenen uyarı, olmayan uyarıdır.
for (const b of saglik.bulgular.filter((x) => x.siddet === 'uyari')) {
  console.log(`  ⚠ ${b.yol}: ${b.mesaj}`)
}

// ── R-20: pipeline'da görsel adımı metin isteyemez ──────────────────────────
// Prompt'un KENDİSİ `buildImagePrompt`ten geçiyor (darboğaz), ama pipeline'ın kısıtları
// da bir prompt kaynağıdır: `no_text: false` yazan ya da sabit metin taşıyan bir adım,
// kuralı çalışma zamanına ertelemiş olur. Kapı onu commit anında yakalar.
const r20 = []
for (const rel of globSync('registry/pipelines/*.pipeline.yaml', { cwd: REPO })) {
  const satirlar = readFileSync(join(REPO, rel), 'utf8').split('\n')
  let gorselAdimda = false
  satirlar.forEach((ham, i) => {
    const satir = ham.replace(/#.*$/, '')
    if (/^\s*-\s+id:/.test(satir)) gorselAdimda = false
    if (/capability:\s*image\.generate/.test(satir)) gorselAdimda = true
    if (!gorselAdimda) return
    if (/no_text:\s*false/.test(satir)) {
      r20.push(
        `${rel}:${i + 1}  R-20 — \`no_text: false\` yazılamaz; görsel modeline metin çizdirilmez`
      )
    }
    // Metin isteyen KISIT ADI — İngilizce VE Türkçe.
    //
    // ⚠ İlk sürüm yalnız İngilizce anahtar arıyordu ve `ustyazi:` gibi bir Türkçe
    // anahtarı hiç görmüyordu. **Türkçe içerik üreten bir sistemde İngilizce anahtar
    // listesi** — doğrulama agent'ı 2026-08-15'te yakaladı (D-143).
    if (
      /^\s*(overlay_text|caption|text|slogan|headline|watermark|copy|label|title)\s*:/i.test(
        satir
      ) ||
      /^\s*(ustyazi|üstyazı|metin|yazi|yazı|baslik|başlık|etiket|slogan|altyazi|altyazı)\s*:/i.test(
        satir
      )
    ) {
      r20.push(`${rel}:${i + 1}  R-20 — görsel adımında metin kısıtı: ${satir.trim()}`)
      return
    }

    // Kısıt DEĞERİNDE metin isteği: `scene_hint: 'duvarda büyük FİRE ibaresi'`.
    // Anahtar masum olabilir; değeri olmayabilir. Değer taraması olmadan kural,
    // anahtar adını değiştirmekle atlatılırdı.
    const deger = satir.includes(':') ? satir.slice(satir.indexOf(':') + 1) : ''
    if (
      /\b(yazi\w*|metin\w*|harf\w*|ibare\w*|tabela\w*|pankart\w*|slogan\w*)\b/i.test(deger) ||
      /\b(text|lettering|caption|typography|written|signage|watermark)\b/i.test(deger)
    ) {
      r20.push(
        `${rel}:${i + 1}  R-20 — görsel adımı kısıt DEĞERİNDE metin istiyor: ${satir.trim()}`
      )
    }
  })
}
if (r20.length > 0) {
  console.log(r20.map((x) => `  ${x}`).join('\n'))
  console.log(`\n${r20.length} R-20 ihlali`)
  process.exit(1)
}

console.log(
  `  ${saglik.taranan} kayıt denetlendi · aktif dönem ${aktifEra} · ` +
    `${dosyalar.length} proof_asset · aktarım argümanları tam · R-20 pipeline taraması temiz · ` +
    `${saglik.uyari} uyarı (${izinliHex === null ? 'palet tanımsız' : `${izinliHex.length} izinli hex`})`
)
