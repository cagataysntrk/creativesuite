#!/usr/bin/env node
// Lexicon linter girişi (§4.6 · R-32).
//
// Corpus'u okur, `proof_asset` kayıtlarının aktarım argümanını denetler. Corpus yoksa
// bu bir BAŞARI değildir — ama bir hata da değil: FAZ-2.9'a kadar corpus yoktu ve
// kapı o gün "0 kayıt denetlendi" diye yeşil raporlasaydı hiçbir şey korumazdı.
// Bugün corpus var; sayı çıktıda GÖRÜNÜYOR ki sıfıra düştüğü gün fark edilsin.

import { existsSync, readFileSync, readdirSync } from 'node:fs'
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
    // Sayısal iddia: yüzde, ondalık ve **binlik ayraçlı ya da birim taşıyan tamsayı**.
    // İlk sürüm yalnız `%N` görüyordu; "1.247 İlan", "892 Satıcı", "300 müşteri
    // kazandırdık" kaynaksız geçiyordu — ve bunlar `.claude/rules/turkish-copy.md`'de
    // BİREBİR yasak örnek olarak sayılan ifadeler (doğrulama agent'ı buldu).
    // Yıl (2024, 2026) hariç: dört haneli ve 1900-2100 arasıysa sayısal iddia değildir.
    hasNumericClaim: (() => {
      const adaylar = govde.match(/%\s?\d[\d.,]*|\b\d[\d.,]*\b/g) ?? []
      return adaylar.some((a) => {
        if (a.startsWith('%')) return true
        const sade = a.replace(/[.,]/g, '')
        const n = Number(sade)
        // Yıl gibi görünen çıplak sayı iddia değildir; binlik ayraçlı olan (1.247) iddiadır.
        if (/^\d{4}$/.test(a) && n >= 1900 && n <= 2100) return false
        return sade.length >= 3 || a.includes('.') || a.includes(',')
      })
    })(),
  })
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
  `  ${kanitlar.length} proof_asset denetlendi · aktif dönem ${aktifEra} · aktarım argümanları tam`
)
