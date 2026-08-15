import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { readFileSync, writeFileSync } from 'node:fs'
import { makeTempDir, type TempDir } from '@suite/kernel/testing'
import { propose, recordPath, writeRecord } from './write.js'
import { computeSignature, signatureIntact } from './signature.js'
import { parseFrontmatter } from './frontmatter.js'

// §4.5'in vaadi: "imza kırıksa çalıştırma DURUR ve düzenlemeni `zone: human` kaydına
// terfi ettirmen istenir". İlk sürüm bu vaadi TERS ÇEVİRMİŞTİ — korunması gereken
// durumda yazıyor, meşru güncellemede reddediyordu. Doğrulama agent'ı beş senaryoluk
// matrisle gösterdi; bu dosya o matrisi kalıcı hâle getiriyor.

let tmp: TempDir
let kok: string
beforeEach(() => {
  tmp = makeTempDir('suite-imza-')
  kok = tmp.path
})
afterEach(() => tmp.cleanup())

const yol = () => recordPath(kok, 'positioning', 'a')

const uret = (body = 'üretilmiş metin') =>
  propose({
    root: kok,
    entityType: 'positioning',
    slug: 'a',
    frontmatter: { id: 'rec_1', brand_id: 'brd_x', type: 'positioning' },
    body,
  })

const yenidenUret = (body: string) =>
  propose({
    root: kok,
    entityType: 'positioning',
    slug: 'a',
    frontmatter: { id: 'rec_1', brand_id: 'brd_x', type: 'positioning' },
    body,
  })

/** İnsanın dosyayı elle düzenlemesi: gövde değişir, `x_signature` OLDUĞU GİBİ kalır. */
const elleDuzenle = (yeniGovde: string): void => {
  const p = parseFrontmatter(readFileSync(yol(), 'utf8'))
  if (!p.ok || p.value.frontmatter === null) return
  const satirlar = readFileSync(yol(), 'utf8').split('---\n')
  writeFileSync(yol(), `---\n${satirlar[1] ?? ''}---\n\n${yeniGovde}\n`)
}

describe('imza ÜRETİLİYOR — alan tipte var diye koruma çalışmaz', () => {
  it('propose her kayda x_signature basıyor', () => {
    const r = uret()
    expect(r.ok).toBe(true)
    const metin = readFileSync(yol(), 'utf8')
    expect(metin).toContain('x_signature: sha256:')
  })

  it('aynı içerik aynı imza — anahtar sırası imzayı değiştirmiyor', () => {
    const a = computeSignature({ b: 2, a: 1 }, 'x')
    const b = computeSignature({ a: 1, b: 2 }, 'x')
    expect(a).toBe(b)
  })

  it('gövde değişince imza değişiyor', () => {
    expect(computeSignature({ a: 1 }, 'x')).not.toBe(computeSignature({ a: 1 }, 'y'))
  })

  it('onay damgası imzayı KIRMIYOR — yoksa onaylanan kayıt bir daha güncellenemezdi', () => {
    const temel = { id: 'rec_1', type: 'positioning' }
    const imza = computeSignature(temel, 'metin')
    const onayli = { ...temel, approved_by: 'human', approved_at: '2026-08-15T10:00:00.000Z' }
    expect(computeSignature(onayli, 'metin')).toBe(imza)
  })

  it('sondaki boşluk farkı imzayı kırmıyor — editör satır sonu alarmı vermemeli', () => {
    expect(computeSignature({ a: 1 }, 'metin')).toBe(computeSignature({ a: 1 }, 'metin\n\n'))
  })
})

describe('KIRIK imza matrisi (§4.5) — agent yazma denemesi', () => {
  it('A) insan gövdeyi elle düzeltti, imza eski → REDDEDİLİYOR', () => {
    // İlk sürümün SESSİZCE ezdiği durum. Korunması gereken tam bu.
    uret('motorun ürettiği metin')
    elleDuzenle('İNSANIN ELLE DÜZELTTİĞİ METİN')
    const r = yenidenUret('motorun yeni metni')
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.refusal.kind).toBe('signature_broken')
    expect(readFileSync(yol(), 'utf8')).toContain('İNSANIN ELLE DÜZELTTİĞİ METİN')
  })

  it('B) insan x_signature satırını sildi + gövdeyi düzeltti → yazma İZİNLİ ama insan metni korunuyor', () => {
    // İmza yoksa "kırık" iddia edilemez (bkz. `signatureIntact` → null). Bu bilinçli:
    // imzasız kayıt eski ya da elle yazılmış olabilir. Asıl koruma `zone: human`
    // terfisi — bunu FAZ-4.3'teki Corpus Browser insana önerecek.
    uret('motorun metni')
    const p = parseFrontmatter(readFileSync(yol(), 'utf8'))
    const fm = p.ok && p.value.frontmatter !== null ? { ...p.value.frontmatter } : {}
    delete fm['x_signature']
    writeRecord({
      root: kok,
      entityType: 'positioning',
      slug: 'a',
      frontmatter: fm,
      body: 'İNSAN METNİ',
      actor: 'human',
    })
    expect(signatureIntact(fm, 'İNSAN METNİ')).toBeNull()
  })

  it('C) motor yeni içerik üretti, dosyaya insan DOKUNMADI → yazma İZİNLİ', () => {
    // İlk sürümün meşru güncellemeyi reddettiği durum.
    uret('birinci metin')
    const r = yenidenUret('ikinci metin')
    expect(r.ok).toBe(true)
    expect(readFileSync(yol(), 'utf8')).toContain('ikinci metin')
  })

  it('D) `zone: human` kayda agent hiç dokunamıyor — imzadan bağımsız', () => {
    writeRecord({
      root: kok,
      entityType: 'positioning',
      slug: 'a',
      frontmatter: { id: 'rec_1', zone: 'human', status: 'active' },
      body: 'insan yazdı',
      actor: 'human',
    })
    const r = uret('agent metni')
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.refusal.kind).toBe('would_overwrite_human')
  })

  it('E) insan kendi düzenlemesini imzayla birlikte yazarsa yazma İZİNLİ', () => {
    // İmza içerikle uyumluysa dosyaya "dokunulmamış" muamelesi doğrudur: insan
    // aracı (Corpus Browser) düzenlemeyi imzayla birlikte yazar.
    uret('motorun metni')
    const p = parseFrontmatter(readFileSync(yol(), 'utf8'))
    const fm = p.ok && p.value.frontmatter !== null ? { ...p.value.frontmatter } : {}
    const yeniGovde = 'insan aracıyla düzenlendi'
    writeRecord({
      root: kok,
      entityType: 'positioning',
      slug: 'a',
      frontmatter: { ...fm, x_signature: computeSignature(fm, yeniGovde) },
      body: yeniGovde,
      actor: 'human',
    })
    const r = yenidenUret('motorun yeni metni')
    expect(r.ok).toBe(true)
  })
})
