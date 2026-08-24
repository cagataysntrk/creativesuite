// OPTİK HİZALAMA — yuvarlak glif ve tırnak satır başında içeri kaçmış GÖRÜNÜR (FAZ-19.5).
//
// ⚠ ⚠ **BU BİR GÖZ YANILSAMASI, ÖLÇÜM HATASI DEĞİL.** `O Ö C Ç G S Ş 0` taban çizgisinde
// matematiksel olarak hizalıdır; göz onları içeride görür, çünkü eğri kenara yalnız bir
// noktada değiyor. Tırnak daha beter: altı boş bir işaret satır başında delik açıyor.
//
// ⚠ Test SAYIYI değil KURALI sınıyor: hangi harfin pay aldığı, payın nereden geldiği ve
// payın metinden TÜREDİĞİ. Şablona sabit yazılsaydı içerik değişince yalan olurdu.

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

const html = (id: string, yaz?: (k: unknown) => unknown): string | null => {
  const o: KatalogOrnegi | null = ornekBul(id)
  if (o === null) return null
  return panoramaHtml({
    ...o,
    tokenCss: TOKEN,
    fontCss: '',
    stamp: DAMGA,
    ...(yaz === undefined ? {} : { kartlar: o.kartlar.map(yaz) }),
  } as PanoramaBelgesi)
}

/** Kart açılış etiketlerinin `class` niteliği — optik işaret oradadır. */
const kartSiniflari = (h: string): readonly string[] =>
  [...h.matchAll(/<section class="([^"]*)"/g)].map((m) => m[1] ?? '')

describe('optik hizalama', () => {
  // ⚠ ⚠ **İŞARET KARTTA, BLOKTA DEĞİL — ve sebebi bir TESTİN kırılması.** İlk sürüm
  // payı yalnız `.baslik`e verdi; `aile-tutarliligi` *"metin blokları TEK sol kenarı
  // paylaşıyor"* diyerek kırmızı döndü ve haklıydı. Optik hizalama bir blok değil bir
  // YIĞIN işidir: yığının algılanan kenarını en büyük öge belirler, ötekiler ona uyar.
  it('YUVARLAK harfle başlayan kart optik işaret alıyor', () => {
    const h = html('sahne', (k) => ({
      ...(k as Record<string, unknown>),
      baslik: 'Ölçü koyuluyor',
    }))
    expect(h, 'sahne örneği yok').not.toBeNull()
    for (const c of kartSiniflari(h ?? '')) expect(c).toContain('optik-yuvarlak')
  })

  it('DÜZ gövdeli harfle başlayan kart işaret ALMIYOR', () => {
    const h = html('sahne', (k) => ({
      ...(k as Record<string, unknown>),
      baslik: 'Bir hat kuruldu',
    }))
    expect(h, 'sahne örneği yok').not.toBeNull()
    for (const c of kartSiniflari(h ?? '')) expect(c).not.toContain('optik-')
  })

  // ⚠ Tırnak payı üç kat: altı BOŞ bir işaret, yuvarlak bir gövdeden çok daha büyük bir
  // delik açıyor. Tek bir pay ikisine birden doğru olamaz.
  it('TIRNAK ayrı bir işaret alıyor — payı yuvarlağınkinden büyük', () => {
    const h = html('alinti', (k) => ({
      ...(k as Record<string, unknown>),
      baslik: '\u201COlcmedigin seyi iyilestiremezsin\u201D',
    }))
    expect(h, 'alinti örneği yok').not.toBeNull()
    for (const c of kartSiniflari(h ?? '')) expect(c).toContain('optik-tirnak')
    expect(h ?? '').toContain('.kart.optik-tirnak')
  })

  // ⚠ ⚠ **KAYDIRMA `em` DEĞİL PİKSEL.** Her bloğun puntosu farklı; aynı `em` farklı
  // piksel demek ve üç blok üç ayrı yere kayardı. `--baslik-punto` üstünden hesaplanan
  // tek piksel değeri, üçünü birlikte kaydırıyor ve sol kenar TEK kalıyor.
  it('pay `--baslik-punto` üstünden PİKSEL olarak hesaplanıyor', () => {
    const h = html('sahne') ?? ''
    expect(h).toContain('calc(var(--baslik-punto, 0px) * -0.018)')
    expect(h).toContain('calc(var(--baslik-punto, 0px) * -0.055)')
  })

  // ⚠ Pay METİNDEN türüyor: aynı şablon, iki başlık, iki sonuç.
  it('aynı şablonda işaret BAŞLIĞA göre değişiyor', () => {
    const a = kartSiniflari(
      html('kavis', (k) => ({ ...(k as Record<string, unknown>), baslik: 'Sapma görünür' })) ?? ''
    )
    const b = kartSiniflari(
      html('kavis', (k) => ({ ...(k as Record<string, unknown>), baslik: 'Ritim kurulur' })) ?? ''
    )
    expect(a.length).toBeGreaterThan(0)
    expect(a[0]).toContain('optik-yuvarlak')
    expect(b[0]).not.toContain('optik-')
  })
})
