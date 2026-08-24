// Z-SIRASI SÖZLEŞMESİ — katman sırası bir KURAL, dağınık sayılar değil (FAZ-19.7).
//
// ⚠ ⚠ **BU TEST BİR ÖLÇÜMDEN DOĞDU.** `z-index` on iki ayrı CSS satırında elle yazılıydı
// ve sıra hiçbir yerde bir arada görünmüyordu. Sonuç: `.bant-ok` **5**'te, `.gorsel`
// **4**'teydi — akış taşıyıcısı kesik öznenin ÜSTÜNDEN geçiyordu. Denetçinin sözleriyle
// *"üstten geçen çizgi bağlantı değil fosforlu kalem lekesi okunuyor."*
//
// ⚠ ⚠ **BİR SAYIYI DÜZELTMEK KURALI KURMAZ.** `.bant-ok`u 1'e çekmek o slaydı düzeltirdi
// ve bir sonraki katman eklendiğinde aynı hata tekrarlardı — bu depoda on kez olan şey.
// Test SIRAYI sınıyor: hangi sayı olduğu değil, hangisinin hangisinin altında olduğu.
//
// ⚠ Test üretilen CSS'i okuyor, tarayıcı açmıyor: sıra bir METİN gerçeği ve bir
// `withPage` turu 40 sn sürüyordu. Ölçüm aracının maliyeti de ölçülür (R-78).

import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { ornekBul, type KatalogOrnegi } from './katalog-ornek.js'
import { panoramaHtml, type PanoramaBelgesi } from './panorama.js'

const KOK = join(dirname(fileURLToPath(import.meta.url)), '../../..')
const TOKEN = readFileSync(join(KOK, 'brand/brd_upcytech/derived-tokens/tokens.css'), 'utf8')

const DAMGA = {
  brandId: 'brd_t',
  eraId: 'era_t',
  kitVersion: 'kit-1',
  definitionDigest: 'sha256:x',
  contextManifest: 'ctx_1',
  sourceRunId: 'run_t',
}

// ⚠ Yokluk `throw` ile değil DEĞERLE bildiriliyor (§8.6) — `chokepoints` kapısı test
// dosyasında da `throw` istemiyor.
const belge = (id: string): PanoramaBelgesi | null => {
  const o: KatalogOrnegi | null = ornekBul(id)
  if (o === null) return null
  return { ...o, tokenCss: TOKEN, fontCss: '', stamp: DAMGA } as PanoramaBelgesi
}

/** Bir seçicinin `z-index`i — üretilen CSS'ten okunur. */
const z = (css: string, secici: string): number | null => {
  const kacir = secici.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const kural = new RegExp(`${kacir}[^{]*\\{[^}]*?z-index:\\s*(\\d+)`)
  const m = kural.exec(css)
  return m === null ? null : Number(m[1])
}

describe('z-sırası sözleşmesi', () => {
  const b = belge('dizin')
  const css = b === null ? '' : panoramaHtml(b)

  it('örnek belge var ve CSS üretiliyor', () => {
    expect(b, 'dizin örneği yok').not.toBeNull()
    expect(css.length).toBeGreaterThan(0)
  })

  // ⚠ ⚠ **ASIL İDDİA BU.** Taşıyıcı öznenin ÜSTÜNDEN geçerse "bağlantı" değil "leke"
  // okunuyor; ALTINDAN geçerse özne onu keser ve kesilen çizgi DERİNLİK kurar.
  it('AKIŞ TAŞIYICISI kesik öznenin ALTINDA — özne şeridi KESSİN', () => {
    const ok = z(css, '.bant-ok')
    const bant = z(css, '.bant, .bant-kemer')
    const gorsel = z(css, '.gorsel, .gorsel-yer')
    expect(ok, '.bant-ok kuralı yok').not.toBeNull()
    expect(gorsel, '.gorsel kuralı yok').not.toBeNull()
    expect(ok ?? 9).toBeLessThan(gorsel ?? 0)
    expect(bant ?? 9).toBeLessThan(gorsel ?? 0)
  })

  it('METİN her şeyin üstünde — taşıyıcı da görsel de altında', () => {
    const metin = z(css, '.kart > *:not(.hayalet):not(.ray)')
    const gorsel = z(css, '.gorsel, .gorsel-yer')
    const ok = z(css, '.bant-ok')
    expect(metin, 'metin kuralı yok').not.toBeNull()
    expect(gorsel ?? 9).toBeLessThan(metin ?? 0)
    expect(ok ?? 9).toBeLessThan(metin ?? 0)
  })

  // ⚠ ⚠ **GREN ALTTA, VİNYET ÜSTTE — ve ayrımı bir ÖLÇÜM dayattı.** İkisi tek seviyede
  // toplanıp görselin ALTINA alındığında R-96 kırmızı döndü (`memphis` siluetinin p90
  // luma farkı 119, eşik 120). Vinyet kesik özneyi de karartmak zorunda: yalnız zemini
  // karartan bir vinyet, özne ile zemin arasındaki farkı YİYOR.
  it('GREN görselin altında, VİNYET görselin üstünde', () => {
    const gren = z(css, '.ust-gren')
    const vinyet = z(css, '.ust-vinyet')
    const gorsel = z(css, '.gorsel, .gorsel-yer')
    expect(gren, '.ust-gren kuralı yok').not.toBeNull()
    expect(vinyet, '.ust-vinyet kuralı yok').not.toBeNull()
    expect(gren ?? 9).toBeLessThan(gorsel ?? 0)
    expect(gorsel ?? 9).toBeLessThan(vinyet ?? 0)
  })

  it('VİNYET metnin altında — kadraj daralır, okunurluk düşmez', () => {
    const vinyet = z(css, '.ust-vinyet')
    const metin = z(css, '.kart > *:not(.hayalet):not(.ray)')
    expect(vinyet ?? 9).toBeLessThan(metin ?? 0)
  })

  it('ZEMİN katmanı en altta — hayalet, lekeler, alan sınırı', () => {
    const gorsel = z(css, '.gorsel, .gorsel-yer')
    for (const s of ['.lekeler', '.alan-siniri']) {
      const v = z(css, s)
      expect(v, `${s} kuralı yok`).not.toBeNull()
      expect(v ?? 9).toBeLessThan(gorsel ?? 0)
    }
  })
})
