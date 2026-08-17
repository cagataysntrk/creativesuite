// Hat SIRASI bir sözleşmedir (§7.1 · FAZ-14.3).
//
// ⚠ Bu dosya, `gorsel-brief` ile `kompozit` arasındaki bağın SESSİZCE kopabilmesi
// yüzünden var. Bağ koparsa hiçbir kapı kırmızıya dönmez: brief yine üretilir, görsel
// yine gelir, koşu yine geçer — yalnız görsel, gireceği slaydı görmeden doğar. Yani
// FAZ-10.7'de dört kez yamadığım kusur sınıfı sessizce geri gelirdi (D-261).
//
// `verbs` kapısı *"bu fiili çağıran bir hat var mı"* diye soruyor; bu test bir adım
// ötesini soruyor: *"bu adım DOĞRU adımdan besleniyor mu"*.
//
// ⚠ YAML doğrudan OKUNMUYOR: yapılandırmayı çözmek `packages/registry`nin darboğazı
// (R-05). İlk sürüm `readFileSync` kullanıyordu ve `chokepoints` kapısı haklı olarak
// reddetti — çözücü ikinci bir yerde yaşarsa bir dosya birinde geçerli, öbüründe
// geçersiz olur.

import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { loadPipeline } from '@suite/registry'

const cozum = loadPipeline(join(process.cwd(), 'registry/pipelines'), 'instagram-post')

const hat = () => {
  expect(cozum.ok).toBe(true)
  return cozum.ok ? cozum.value : null
}

const adim = (id: string) => hat()?.steps.find((s) => s.id === id)
const needs = (id: string): readonly string[] => adim(id)?.needs ?? []
const sira = (id: string): number => hat()?.steps.findIndex((s) => s.id === id) ?? -1

describe('instagram-post hattının sırası', () => {
  it('brief KOMPOZİTTEN besleniyor — yuvayı görerek yazılıyor', () => {
    expect(needs('gorsel-brief')).toContain('kompozit')
  })

  it('kompozit görselden ÖNCE — taban deterministik kuruluyor', () => {
    expect(sira('kompozit')).toBeLessThan(sira('gorsel-uret'))
    expect(needs('kompozit')).not.toContain('gorsel-uret')
  })

  it('render YUVA-DOLDURDAN besleniyor — görsel yerine oturmuş olmalı', () => {
    expect(needs('render')).toEqual(['yuva-doldur'])
    expect(needs('yuva-doldur')).toContain('gorsel-uret')
  })

  it('iki compose adımı AYNI yuva politikasını taşıyor', () => {
    // Ayrışsalar iki farklı plan üretirlerdi ve denetim (14.4) her koşuda sapma
    // raporlardı — plan bir sözleşme olmaktan çıkardı.
    const p = (id: string): unknown => adim(id)?.constraints?.['gorsel_yuvasi']
    expect(p('kompozit')).toBe(p('yuva-doldur'))
    expect(p('kompozit')).toBe(true)
  })

  it('insan onayı hâlâ yayından ÖNCE', () => {
    expect(needs('yayinla')).toEqual(['onay'])
  })
})
