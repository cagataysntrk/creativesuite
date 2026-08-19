// Adım çıktısı diske yazılıyor ve geri okunuyor (§13 · R-07).
//
// ⚠ ⚠ Bu dosya, **kapının arkasındaki zinciri sessizce kesen** hatadan sonra yazıldı:
// insan `metin-onayi`ni onayladı, hat `--devam` ile sürdü, `konu-sec` defterden
// `data: null` ile oynatıldı ve `bilgi-sec` `MISSING_TOPIC` ile düştü — agent'ın
// seçtiği konu buharlaşmıştı. `scheduler.ts` bu eksikliği YAZMIŞTI; yazılı olması
// engellemedi.

import { mkdirSync, mkdtempSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  adimCiktisiniOku,
  adimCiktisiniYaz,
  adimCiktisiniYazDurum,
  adimDizini,
} from './adim-ciktisi.js'

const gecici = (): string => mkdtempSync(join(tmpdir(), 'suite-adim-'))

describe('adım çıktısı defteri', () => {
  it('yazılan çıktı aynen geri okunuyor', () => {
    const d = gecici()
    expect(adimCiktisiniYaz(d, 'konu-sec', { konu: 'Ölçüm', gerekce: 'kanıtı var' })).toBe(true)
    expect(adimCiktisiniOku(d, 'konu-sec')).toEqual({ konu: 'Ölçüm', gerekce: 'kanıtı var' })
  })

  it('kayıt yoksa `null` — "bulamadım" ile "boş çıktı" ayrı şeyler', () => {
    expect(adimCiktisiniOku(gecici(), 'yok-boyle-adim')).toBeNull()
  })

  it('`null` çıktı YAZILMIYOR — boş bir dosya, olmayan bir kayıttan kötüdür', () => {
    const d = gecici()
    expect(adimCiktisiniYaz(d, 'bos', null)).toBe(false)
    expect(adimCiktisiniOku(d, 'bos')).toBeNull()
  })

  it('bozuk JSON `null` dönüyor — yarım çıktı zincire verilmiyor', () => {
    const d = gecici()
    mkdirSync(adimDizini(d), { recursive: true })
    writeFileSync(join(adimDizini(d), 'yarim.json'), '{"konu": ', 'utf8')
    expect(adimCiktisiniOku(d, 'yarim')).toBeNull()
  })

  it("adım id'si dosya adına GÜVENLİ çevriliyor — yol ayracı kaçamaz", () => {
    const d = gecici()
    adimCiktisiniYaz(d, '../kacis', { x: 1 })
    // ⚠ Ad ÖNCEDEN bilinmiyor, ÖZELLİĞİ ölçülüyor: dosya `steps/` içinde ve adında
    // ne ayraç ne üst dizin var. Beklenen adı yazmak, temizleyicinin bugünkü
    // uygulamasını test etmek olurdu; ölçülmesi gereken şey KAÇAMAMASI.
    const dosyalar = readdirSync(adimDizini(d))
    expect(dosyalar).toHaveLength(1)
    expect(dosyalar[0]).not.toContain('/')
    expect(dosyalar[0]).not.toContain('..')
    // Aynı id ile geri okunabiliyor: temizleme deterministik.
    expect(adimCiktisiniOku(d, '../kacis')).toEqual({ x: 1 })
  })

  it("TAVANI aşan çıktı işaretçiye iniyor — defter git'e giriyor (R-64)", () => {
    const d = gecici()
    // ⚠ Gerçek senaryo: `yuva-doldur` çıktısı 3,9 MB'tı çünkü base64 görsel taşıyor.
    // `repo-hygiene` kapısı aynı gün yakaladı.
    const kocaman = { gorsel: 'A'.repeat(300 * 1024) }
    expect(adimCiktisiniYaz(d, 'yuva-doldur', kocaman)).toBe(false)
    // İşaretçi YAZILDI — boş bir dizin "hiç koşmadı" diye okunurdu.
    expect(readdirSync(adimDizini(d))).toEqual(['yuva-doldur.json'])
    // Ama zincire VERİLMİYOR: işaretçi bir çıktı değildir.
    expect(adimCiktisiniOku(d, 'yuva-doldur')).toBeNull()
  })

  it('GÖMÜLÜ BYTE tasiyan cikti hic yazilmiyor — tavanin altinda olsa bile', () => {
    const d = gecici()
    // ⚠ Gerçek ölçüm: `gorsel-uret` çıktısı 220 KB, yani 256 KB tavanının ALTINDA ve
    // yazılıyordu — koşu başına dört görsel defterde birikiyor ve `git` onu sonsuza
    // kadar taşıyor. Oysa byte `derived/blobs`ta ve adım sürdürmede zaten yeniden
    // koşuyor (`islerKalici: false`).
    const gorsel = { format: 'base64', data: 'A'.repeat(220_000), width: 1024, height: 1280 }
    expect(adimCiktisiniYaz(d, 'gorsel-uret', gorsel)).toBe(false)
    expect(adimCiktisiniOku(d, 'gorsel-uret')).toBeNull()
  })

  it('uzun ama BASE64 OLMAYAN metin yazılıyor — kural şekle bakıyor', () => {
    const d = gecici()
    const uzunMetin = { lines: ['Ölçüm başlıyor. '.repeat(600)] }
    expect(adimCiktisiniYaz(d, 'metin-uret', uzunMetin)).toBe(true)
    expect(adimCiktisiniOku(d, 'metin-uret')).toEqual(uzunMetin)
  })
})

// ── D20: byte deposu · defterde ADRES, `derived/blobs`ta byte ────────────────
//
// ⚠ ⚠ **BU OLMADAN `tasarim-onayi` BİR ŞEY İFADE ETMİYORDU.** Ölçüldü: `gorsel-uret`in
// GİRDİ özeti üç geçişte de aynı (`39a8c02e`), çıktısı her seferinde farklı
// (`2c1d3c70` → `c642914f` → …). İnsan gördüğü slaytları onaylıyor, yayına başka
// slaytlar gidiyordu — çünkü byte taşıyan çıktı deftere hiç yazılmıyordu (R-64) ve
// tekrar oynatmada "çıktı yok" görünüyordu.
describe('byte deposu', () => {
  const sahteDepo = () => {
    const kutu = new Map<string, string>()
    return {
      kutu,
      depo: {
        yaz: (b64: string): string => {
          const adres = `sha256:${String(kutu.size)}`
          kutu.set(adres, b64)
          return adres
        },
        oku: (adres: string): string | null => kutu.get(adres) ?? null,
      },
    }
  }

  const gorsel = { format: 'base64', data: 'A'.repeat(220_000), width: 1024, height: 1280 }

  it('byte defterden ÇIKIYOR ama çıktı KAYBOLMUYOR', () => {
    const d = gecici()
    const { depo } = sahteDepo()
    expect(adimCiktisiniYazDurum(d, 'gorsel-uret', gorsel, depo)).toBe('yazildi')
    // Defter dosyası KÜÇÜK: byte git'e girmiyor (R-64).
    const yol = join(adimDizini(d), 'gorsel-uret.json')
    expect(statSync(yol).size).toBeLessThan(4096)
    // Ama çıktı AYNEN geri geliyor: onaylanan görsel, yayına giden görsel.
    expect(adimCiktisiniOku(d, 'gorsel-uret', depo)).toEqual(gorsel)
  })

  it('byte KAYBOLDUYSA çıktı `null` — yarım nesne zincire verilmiyor', () => {
    const d = gecici()
    const { kutu, depo } = sahteDepo()
    adimCiktisiniYazDurum(d, 'gorsel-uret', gorsel, depo)
    kutu.clear() // blob silindi: `derived/blobs` yedekten dönmemiş olabilir
    expect(adimCiktisiniOku(d, 'gorsel-uret', depo)).toBeNull()
  })

  it('depo VERİLMEZSE eski davranış: byte deftere hiç girmiyor', () => {
    const d = gecici()
    expect(adimCiktisiniYazDurum(d, 'gorsel-uret', gorsel)).toBe('atlandi')
    expect(adimCiktisiniOku(d, 'gorsel-uret')).toBeNull()
  })

  it('metin çıktısı depo VARKEN de aynen yazılıyor — byte yoksa adres de yok', () => {
    const d = gecici()
    const { kutu, depo } = sahteDepo()
    const metin = { lines: ['Ölçüm başlıyor'], konu: 'Ölçüm pilotu' }
    expect(adimCiktisiniYazDurum(d, 'metin-uret', metin, depo)).toBe('yazildi')
    expect(kutu.size).toBe(0)
    expect(adimCiktisiniOku(d, 'metin-uret', depo)).toEqual(metin)
  })
})
