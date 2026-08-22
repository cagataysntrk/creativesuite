// Elle ince ayar: kaydırma + punto çarpanı, SINIRLI (FAZ-16.1 · D-301).
//
// ⚠ Sınır kozmetik değil sözleşme: sınırsız kayma metni karttan çıkarır ve kesimi
// geçirir; o an şablon şablon olmaktan çıkar. Denetim taşmayı yakalar ama YAKALAMAK
// ÖNLEMEK DEĞİLDİR — kusur raporlanmış bir karosel yine de yanlış karoseldir.

import { describe, expect, it } from 'vitest'
import { ORNEKLER } from './katalog-ornek.js'
import { ayarStili, panoramaHtml, type PanoramaBelgesi } from './panorama.js'

const DAMGA = {
  brandId: 'brd_t',
  eraId: 'era_t',
  kitVersion: 'kit-1',
  definitionDigest: 'sha256:x',
  contextManifest: 'ctx_1',
  sourceRunId: 'run_t',
}

// ⚠ `throw` YOK: hata bir DEĞERdir (§8.6) ve `chokepoints` kapısı test dosyasında da
// fırlatmaya izin vermiyor — haklı, çünkü fırlatan bir yardımcı testin hangi satırda
// düştüğünü gizler.
const SAHNE = ORNEKLER['sahne'] as (typeof ORNEKLER)[string]

const belge = (ayar: Record<string, unknown>): PanoramaBelgesi => {
  const o = SAHNE
  return {
    ...o,
    tokenCss: '',
    stamp: DAMGA,
    kartlar: o.kartlar.map((k, i) => (i === 0 ? { ...k, ayar } : k)),
  } as unknown as PanoramaBelgesi
}

describe('metin ince ayarı', () => {
  it('ayar verilmezse satır içi stil YOK — şablon aynen geçiyor', () => {
    expect(ayarStili(undefined)).toBe('')
    expect(ayarStili({})).toBe('')
    expect(ayarStili({ dx: 0, dy: 0, olcek: 1 })).toBe('')
  })

  it('kaydırma ve çarpan stile giriyor', () => {
    expect(ayarStili({ dx: 40, dy: -18 })).toContain('translate(40px,-18px)')
    expect(ayarStili({ olcek: 1.4 })).toContain('--ayar-olcek:1.4')
  })

  it('SINIR kısıyor — 5000 px kayma 260 px oluyor, çarpan 2 ile kapanıyor', () => {
    expect(ayarStili({ dx: 5000, dy: -5000 })).toContain('translate(260px,-260px)')
    expect(ayarStili({ olcek: 9 })).toContain('--ayar-olcek:2')
    expect(ayarStili({ olcek: 0.01 })).toContain('--ayar-olcek:0.5')
  })

  it('render ayarı gerçekten basıyor', () => {
    expect(SAHNE).toBeDefined()
    const html = panoramaHtml(belge({ baslik: { dx: 30, olcek: 1.25 } }))
    expect(html).toContain('translate(30px,0px)')
    expect(html).toContain('--ayar-olcek:1.25')
  })

  it('punto formülleri çarpanı okuyor — yoksa ayar hiçbir şey yapmazdı', () => {
    const html = panoramaHtml(belge({}))
    expect(html).toContain('calc(var(--baslik-punto) * var(--ayar-olcek, 1))')
    // ⚠ Eyebrow puntosu 24 → 20 (D-317: sistemin `eyebrow` ölçeği). Ölçülen şey punto
    // değil, ÇARPANIN okunduğu: elle ayar bu ögeye de geçmeli.
    expect(html).toContain('calc(20px * var(--ayar-olcek, 1))')
    // Panel payı KÖKTEN türüyor: elle ayar şablonun kendi payını EZMİYOR, çarpıyor.
    expect(html).toContain('--panel-olcek: calc(var(--panel-kok) * var(--ayar-olcek, 1))')
  })

  it('üst başlık BOŞSA hiç çizilmiyor — silmek boş etiket bırakmaz', () => {
    const o = ORNEKLER['sahne']
    if (o === undefined) return
    const bos = {
      ...o,
      tokenCss: '',
      stamp: DAMGA,
      kartlar: o.kartlar.map((k) => ({ ...k, ustBaslik: '' })),
    } as unknown as PanoramaBelgesi
    expect(panoramaHtml(bos)).not.toContain('class="ust-baslik"')
  })
})
