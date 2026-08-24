// DÜZEN PROVASI — kelime bütçesinin izin verdiği metin şablonu kırıyor (D-347).
//
// ⚠ ⚠ **BU TESTİN SAYILARI ÖLÇÜMDEN GELİYOR, SEZGİDEN DEĞİL.** R-89 başlık ≤8, slayt
// toplamı ≤28 kelime diyor. Tam o tavanda, gerçekçi uzun Türkçe kelimelerle on şablon
// zorlandı ve SEKİZİ kırıldı. `sahne`nin ölçülen kapasitesi **12 kelime** — tavanın
// yarısından az. Kapasite tablosu `docs/kurallar/OLCUMLER.md`'de.
//
// ⚠ Metin KISA kelimelerle değil UZUN Türkçe kelimelerle yazılıyor: `sürdürülebilirlik`,
// `raporlamasında`, `denetlenebilir`. Kısa doldurma kelimesiyle test yazmak, ölçtüğünü
// sandığı şeyi ölçmeyen bir alet üretirdi — bu depoda bugün dört kez olan şey.

import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { duzenProvasi } from './duzen-provasi.js'
import { ornekBul, type KatalogOrnegi } from './katalog-ornek.js'
import { fontCss } from './fonts.js'
import type { PanoramaBelgesi } from './panorama.js'

const KOK = join(dirname(fileURLToPath(import.meta.url)), '../../..')
const TOKEN = readFileSync(join(KOK, 'brand/brd_upcytech/derived-tokens/tokens.css'), 'utf8')
// ⚠ `fontCss` ayrımlı birleşim döndürüyor: eksik font bir HATA dalıdır, `.css` orada yok.
// Daraltmadan okumak, fontu yüklenmemiş bir provayı sessizce "geçti" saydırırdı.
const FONT_SONUCU = fontCss(join(KOK, 'brand/brd_upcytech/fonts'))
const FONT = FONT_SONUCU.ok ? FONT_SONUCU.css : ''

const DAMGA = {
  brandId: 'brd_t',
  eraId: 'era_t',
  kitVersion: 'kit-1',
  definitionDigest: 'sha256:x',
  contextManifest: 'ctx_1',
  sourceRunId: 'run_t',
}

// ⚠ Örnek `ornekBul` ile alınıyor, indeksle değil: `ORNEKLER` bir indeks imzası ve
// `noUncheckedIndexedAccess` altında her erişim `| undefined`. Sessizce `!` yazmak,
// şablonu silinmiş bir testi yeşil bırakırdı.
// ⚠ ⚠ **YOKLUK `throw` İLE DEĞİL, DEĞERLE bildiriliyor** — `chokepoints` kapısı test
// dosyasında da `throw` istemiyor ve haklı: hata bir DEĞERDİR (§8.6). Örnek bulunamazsa
// `null` dönüyor ve testin kendi `expect`i onu kırmızıya çeviriyor.
const belge = (id: string, yaz?: (k: unknown) => unknown): PanoramaBelgesi | null => {
  const o: KatalogOrnegi | null = ornekBul(id)
  if (o === null) return null
  return {
    ...o,
    tokenCss: TOKEN,
    fontCss: FONT,
    stamp: DAMGA,
    ...(yaz === undefined ? {} : { kartlar: o.kartlar.map(yaz) }),
  } as PanoramaBelgesi
}

// R-89 tavaninda: baslik 8 + ust etiket 1 + govde 19 = 28 kelime
const BASLIK =
  'Sürdürülebilirlik raporlamasında **ölçülebilir** dönüşüm göstergeleri artık açıkça belgeleniyor'
const ETIKET = 'DEĞERLENDİRME'
const GOVDE =
  'Ölçüm noktaları yerleştirilmeden yapılan iyileştirme iddiaları denetlenebilir olmadığı için ' +
  'raporlamada kabul edilmiyor ve tedarik zincirinde güven kaybına yol açıyor'

describe('düzen provası', () => {
  it('örnek metinle GEÇİYOR — prova sağlam belgeyi kırmızıya çevirmiyor', async () => {
    const b = belge('sahne')
    expect(b, 'sahne örneği yok').not.toBeNull()
    if (b === null) return
    const r = await duzenProvasi(b)
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(
      r.value.kusurlar.map((k) => k.tur),
      r.value.ozet
    ).toEqual([])
    expect(r.value.sigiyor).toBe(true)
  }, 60_000)

  // ⚠ ⚠ **KELİME BÜTÇESİNİN İZİN VERDİĞİ METİN.** Aşağıdaki kart R-89'u İHLAL ETMİYOR:
  // başlık 8, üst etiket 1, gövde 19 — toplam tam 28. `uyarla` bunu geçirirdi. Prova
  // geçirmiyor ve fark tam olarak budur: biri kelime sayıyor, öteki kadraja bakıyor.
  it('bütçenin İZİN VERDİĞİ metinle kırmızı dönüyor — kelime sığar demek değil', async () => {
    const say = (t: string): number =>
      t.replace(/\*\*/g, '').trim().split(/\s+/).filter(Boolean).length
    expect(say(BASLIK), 'başlık R-89 tavanında').toBe(8)
    expect(say(BASLIK) + say(ETIKET) + say(GOVDE), 'slayt R-89 tavanında').toBe(28)

    const b = belge('sahne', (k) => ({
      ...(k as Record<string, unknown>),
      ustBaslik: ETIKET,
      baslik: BASLIK,
      govde: GOVDE,
    }))
    expect(b, 'sahne örneği yok').not.toBeNull()
    if (b === null) return
    const r = await duzenProvasi(b)
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.value.sigiyor, 'prova bütçe tavanındaki metni geçirdi').toBe(false)
    expect(r.value.ozet).toContain('düzen provası')
    // ⚠ Kusur ADIYLA raporlanıyor: "sığmadı" tek başına düzeltilemez bir geri bildirimdir.
    expect(r.value.kusurlar.length).toBeGreaterThan(0)
    expect(r.value.kusurlar[0]?.tur.length).toBeGreaterThan(0)
  }, 60_000)

  // ⚠ Yer tutucu kusuru provada BEKLENEN: prova tanım gereği görselsiz koşuyor. Elemeyip
  // raporlamak her provayı kırmızı yapardı ve kapı beş gün içinde görmezden gelinirdi.
  it('yer tutucu kusurunu ELEMİŞ — görselsizlik tasarım kusuru değil', async () => {
    const b = belge('sahne')
    expect(b, 'sahne örneği yok').not.toBeNull()
    if (b === null) return
    const r = await duzenProvasi(b)
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.value.kusurlar.some((k) => k.tur === 'yer-tutucu')).toBe(false)
  }, 60_000)
})
