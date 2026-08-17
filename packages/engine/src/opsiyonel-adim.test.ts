// Opsiyonel adım: düşmesi hattı DURDURMAZ (§8.2 · FAZ-14.5).
//
// ⚠ Bu dosya bir DÜZELTMEDEN doğdu. `isteğeBagli` motorda zaten bağlıydı ve doğru
// çalışıyordu — ama hiçbir hat adımı `optional: true` taşımıyordu, yani yetenek
// üretimde HİÇ devreye girmiyordu. Yeteneğin var olması, kullanılıyor olması demek
// değildir; bu fazda aynı ders beş kez alındı (D-261/D-259).
//
// ⚠ Üç durum üç anlam taşır: `ok` (işini yaptı) · `skipped` (koştu, işini yapmadı,
// çünkü yapılacak iş yoktu) · `failed` (denedi, olmadı). İkisini birine indirmek
// defteri yalan yapar.

import { describe, expect, it } from 'vitest'
import { loadPipeline } from '@suite/registry'
import { join } from 'node:path'

const cozum = loadPipeline(join(process.cwd(), 'registry/pipelines'), 'instagram-post')
const hat = () => (cozum.ok ? cozum.value : null)
const adim = (id: string) => hat()?.steps.find((s) => s.id === id)
const opsiyonel = (id: string): boolean => adim(id)?.constraints?.['optional'] === true

describe('görsel adımları opsiyonel', () => {
  it('gorsel-brief ve gorsel-uret OPSİYONEL', () => {
    // Fotoğraf taşıyıcı öge değil: üretilemezse karosel diyagram, ikon ve tipografiyle
    // tam bir çıktı verir. Koşuyu öldürmesi orantısız olurdu.
    expect(opsiyonel('gorsel-brief')).toBe(true)
    expect(opsiyonel('gorsel-uret')).toBe(true)
  })

  it('taşıyıcı adımlar opsiyonel DEĞİL', () => {
    // Metin, kompozisyon ve render olmadan ortada karosel yoktur. Opsiyonel işaretlemek
    // "boş çıktı da çıktıdır" demek olurdu.
    for (const id of ['metin-uret', 'kompozit', 'yuva-doldur', 'render', 'kalite'])
      expect([id, opsiyonel(id)]).toEqual([id, false])
  })

  it('insan onayı ve yayın ASLA opsiyonel değil', () => {
    // §5.4: onay bir yan etki değil bir kapıdır. Opsiyonel bir kapı, kapı değildir.
    expect(opsiyonel('onay')).toBe(false)
    expect(opsiyonel('yayinla')).toBe(false)
  })

  it('opsiyonel adım YİNE DE hattın parçası — sessizce silinmiş değil', () => {
    expect(adim('gorsel-uret')?.needs).toContain('gorsel-brief')
    expect(adim('yuva-doldur')?.needs).toContain('gorsel-uret')
  })
})
