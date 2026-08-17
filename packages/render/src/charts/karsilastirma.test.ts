// Karşılaştırma — sayı İSTEMEYEN veri ögesi (§7.1 · FAZ-12.5).

import { describe, expect, it } from 'vitest'
import type { CompareBlock } from '@suite/kernel'
import { compareHtml, isCompareError } from './karsilastirma.js'

const blok = (over: Partial<CompareBlock> = {}): CompareBlock => ({
  type: 'compare',
  title: 'Devir kaydı kurulunca ne değişiyor',
  once: { label: 'Bugün', items: ['Sözlü aktarım', 'Kimse geri dönüp bakmıyor'] },
  sonra: { label: 'Kayıt katmanıyla', items: ['Tek kayıt noktası'] },
  ...over,
})

describe('karşılaştırma', () => {
  it('iki tarafı da çiziyor ve metin SVG/DOM`da kalıyor', () => {
    const h = compareHtml(blok())
    expect(isCompareError(h)).toBe(false)
    expect(h as string).toContain('Bugün')
    expect(h as string).toContain('Kayıt katmanıyla')
    // Canvas YASAK: canvas'a düşen metnin glif ölçümü ve Türkçe kapıları körleşir.
    expect(h as string).not.toContain('<canvas')
  })

  it('TEK TARAFLI karşılaştırma reddediliyor — o bir listedir', () => {
    expect(isCompareError(compareHtml(blok({ sonra: { label: 'x', items: [] } })))).toBe(true)
    expect(isCompareError(compareHtml(blok({ title: '  ' })))).toBe(true)
  })

  it('SONRA tarafı marka aksanıyla ayrılıyor — karşıtlık renkle de okunur', () => {
    expect(compareHtml(blok()) as string).toContain('kars-sutun sonra')
  })

  it('metin KAÇIRILIYOR — enjeksiyon yok', () => {
    const h = compareHtml(blok({ title: '<script>x</script>' })) as string
    expect(h).not.toContain('<script>')
    expect(h).toContain('&lt;script&gt;')
  })
})
