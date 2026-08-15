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
const { checkTransfer, formatViolations } = await import(
  join(REPO, 'packages/render/dist/index.js')
)
const { parseFrontmatter } = await import(join(REPO, 'packages/corpus/dist/index.js'))

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

const kanitlar = []
for (const f of dosyalar) {
  const p = parseFrontmatter(readFileSync(join(KANIT_DIR, f), 'utf8'))
  if (!p.ok || p.value.frontmatter === null) {
    console.log(`✗ ${f}: frontmatter okunamadı`)
    process.exit(1)
  }
  const fm = p.value.frontmatter
  const govde = p.value.body
  // Alanlar gövdede prose olarak da yazılabiliyor (FAZ-2.9 kayıtları böyle);
  // frontmatter öncelikli, yoksa gövdeden çıkarılır.
  // YALNIZ ilk satır. Çok satır yutan ilk sürüm "analogous" yerine
  // "analogous.\n\n⚠ Sayısal iddia YOK..." çıkarıyordu ve o değer ne null ne geçerli
  // enum olduğu için HER kontrolden geçiyordu — kapı yeşil, koruma sıfır (2026-08-15).
  const gvd = (etiket) => {
    const m = govde.match(new RegExp(`\\*\\*${etiket}:?\\*\\*[ \\t]*([^\\n]*)`))
    if (m === null) return null
    const v = m[1].trim().replace(/\.$/, '')
    return v === '' ? null : v
  }
  kanitlar.push({
    id: typeof fm['id'] === 'string' ? fm['id'] : f,
    eraOfOrigin:
      typeof fm['era_of_origin'] === 'string'
        ? fm['era_of_origin']
        : ((gvd('Kaynak dönem') ?? '').split(' ')[0] ?? ''),
    generalisationNote:
      typeof fm['generalisation_note'] === 'string'
        ? fm['generalisation_note']
        : gvd('Genelleme notu'),
    transferConfidence:
      typeof fm['transfer_confidence'] === 'string'
        ? fm['transfer_confidence']
        : gvd('Aktarım güveni'),
    claimSource: typeof fm['claim_source'] === 'string' ? fm['claim_source'] : gvd('Kaynak'),
    // Sayısal iddia: rakamla YA DA kelimeyle. İkinci grup kritik — doğrulama agent'ı
    // "yüzde 40", "3 kat", "1/3 oranında", "yarım milyon" ifadelerinin kaynaksız
    // geçtiğini gösterdi. Türkçe'de nicelik çoğu zaman rakamsız yazılır ve rakam
    // arayan bir desen, dilin yarısını görmez.
    //
    // Yıl (1900-2100 arası çıplak dört hane) iddia DEĞİLDİR: "2024'te kurulduk" bir
    // tarihtir. Binlik ayraçlı olan (1.247) iddiadır.
    hasNumericClaim: (() => {
      const KELIME = /\b(yüzde|kat\b|misli|oran(ında|ı)?|çeyrek|yarım|milyon|milyar|bin\b)/i
      if (KELIME.test(govde)) return true
      // Kesir: 1/3, 2/5
      if (/\b\d+\s*\/\s*\d+\b/.test(govde)) return true
      const adaylar = govde.match(/%\s?\d[\d.,]*|\b\d[\d.,]*\b/g) ?? []
      return adaylar.some((a) => {
        if (a.startsWith('%')) return true
        const sade = a.replace(/[.,]/g, '')
        const n = Number(sade)
        if (/^\d{4}$/.test(a) && n >= 1900 && n <= 2100) return false
        return sade.length >= 3 || a.includes('.') || a.includes(',')
      })
    })(),
  })
}

// ── R-32/R-35: TÜM corpus metinleri deterministik linter'dan geçiyor ────────
// `proof_asset` denetimi (yukarısı) aktarım argümanını sorar; bu blok metnin KENDİSİNİ
// sorar. İkisi ayrı sorular: doğru aktarım argümanı taşıyan bir kanıt yine de kaynaksız
// bir sayı ya da yasak bir terim içerebilir.
const { lintDocument, formatLexicon, hexFromTokens } = await import(
  join(REPO, 'packages/render/dist/index.js')
)

// İzinli hex üç durumlu (D-113):
//   `null` → hiç token dosyası yok, palet TANIMSIZ → denetim atlanır
//   `[]`   → token var ama hex içermiyor (OKLCH, §12.1) → HER hex token dışıdır
//   dolu   → yalnız listedekiler geçer
const tokenDosyalari = globSync('brand/*/derived-tokens/*.css', { cwd: REPO })
let izinliHex = tokenDosyalari.length === 0 ? null : []
for (const tokenYolu of tokenDosyalari) {
  izinliHex = izinliHex.concat(hexFromTokens(readFileSync(join(REPO, tokenYolu), 'utf8')))
}

const YASAK_TERIMLER = [
  'devrim niteliğinde',
  'çığır açan',
  'dünyanın en iyisi',
  'sektör lideri',
  'benzersiz',
  'kusursuz',
]

const lexIhlaller = []
let denetlenenKayit = 0
for (const rel of globSync('corpus/*/*.md', { cwd: REPO })) {
  const ham = readFileSync(join(REPO, rel), 'utf8')
  const fm = parseFrontmatter(ham)
  if (!fm.ok) continue
  denetlenenKayit++
  // Kayıt gövdesi tek bir `body` bloğu gibi denetleniyor: linter belge modeli bekliyor
  // ve corpus kaydının metni de bir belgedir — sadece henüz render edilmemiş hâli.
  const sahteBelge = {
    kind: 'post',
    width: 1080,
    height: 1350,
    tokenCss: '',
    stamp: {},
    blocks: [{ type: 'body', text: fm.value.body }],
  }
  const kaynak =
    typeof fm.value.frontmatter['claim_source'] === 'string'
      ? fm.value.frontmatter['claim_source']
      : null
  for (const v of lintDocument(sahteBelge, {
    forbidden: YASAK_TERIMLER,
    allowedHex: izinliHex,
    claimSource: kaynak,
  })) {
    lexIhlaller.push({ rel, v })
  }
}

if (lexIhlaller.length > 0) {
  for (const { rel, v } of lexIhlaller) {
    console.log(`  ${rel}`)
    console.log(formatLexicon([v]))
  }
  console.log(`\n${lexIhlaller.length} lexicon ihlali`)
  process.exit(1)
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
    // Kısıt DEĞERİNDE metin isteği: `overlay_text`, `caption`, `slogan`…
    if (/^\s*(overlay_text|caption|text|slogan|headline|watermark)\s*:/.test(satir)) {
      r20.push(`${rel}:${i + 1}  R-20 — görsel adımında metin kısıtı: ${satir.trim()}`)
    }
  })
}
if (r20.length > 0) {
  console.log(r20.map((x) => `  ${x}`).join('\n'))
  console.log(`\n${r20.length} R-20 ihlali`)
  process.exit(1)
}

const ihlaller = kanitlar.flatMap((k) =>
  checkTransfer([k], { currentEra: aktifEra, outboundToProspect: true })
)

if (ihlaller.length > 0) {
  console.log(formatViolations(ihlaller))
  console.log(`\n${ihlaller.length} aktarım ihlali`)
  process.exit(1)
}

console.log(
  `  ${kanitlar.length} proof_asset denetlendi · aktif dönem ${aktifEra} · aktarım argümanları tam · ` +
    `R-20 pipeline taraması temiz · ${denetlenenKayit} kayıt lexicon'dan geçti ` +
    `(${izinliHex === null ? 'palet tanımsız' : `${izinliHex.length} izinli hex`}, ` +
    `${YASAK_TERIMLER.length} yasak terim)`
)
