// Görsel yargı ayrıştırıcısı — RED disiplini (§11.1 · FAZ-10.5).
//
// Testlerin çoğu "kabul ediyor mu" değil **"reddediyor mu"** sorusunu soruyor: bu
// modülün değeri kabul ettiklerinde değil, geri çevirdiklerinde. Kutusuz bir bulguyu
// kabul etmek, eyleme çevrilemeyen bir yorumu ölçüm gibi göstermek olurdu.

import { describe, expect, it } from 'vitest'
import { yargiPromptu, yargiyaCevir, bulguSatiri } from './gorsel-yargi.js'

const BOYUT = { genislik: 1080, yukseklik: 1350 }
const sar = (x: unknown): { result: string } => ({ result: JSON.stringify(x) })

const gecerli = {
  bolge: [120, 460, 300, 80],
  kategori: 'cakisma',
  siddet: 'kritik',
  aciklama: 'Başlık sayaç bandıyla üst üste biniyor.',
}

describe('yargiyaCevir — kabul', () => {
  it('geçerli bulguyu alır ve slayt numarasını damgalar', () => {
    const r = yargiyaCevir(sar([gecerli]), 3, BOYUT)
    expect(r.bulgular).toHaveLength(1)
    expect(r.bulgular[0]?.slayt).toBe(3)
    expect(r.bulgular[0]?.bolge).toEqual([120, 460, 300, 80])
    expect(r.reddedilen).toHaveLength(0)
  })

  it('kod bloğu çiti ve çevresindeki nesir soyulur', () => {
    // Claude Code sık sık JSON'u ``` ile sarıp önüne bir cümle koyuyor. Ölçülen
    // davranış bu; varsayılan değil.
    const ham =
      'İşte bulgular:\n```json\n' + JSON.stringify([gecerli]) + '\n```\nUmarım yardımcı olur.'
    const r = yargiyaCevir({ result: ham }, 1, BOYUT)
    expect(r.bulgular).toHaveLength(1)
  })

  it('kusur yoksa boş dizi — hata DEĞİL', () => {
    const r = yargiyaCevir(sar([]), 1, BOYUT)
    expect(r.bulgular).toHaveLength(0)
    expect(r.reddedilen).toHaveLength(0)
  })
})

describe('yargiyaCevir — RED', () => {
  const redVakalari: readonly [string, unknown, string][] = [
    ['kutu YOK', [{ ...gecerli, bolge: undefined }], 'sınırlayıcı kutu'],
    ['kutu üç elemanlı', [{ ...gecerli, bolge: [1, 2, 3] }], 'sınırlayıcı kutu'],
    ['kutu metin içeriyor', [{ ...gecerli, bolge: [1, 2, 'x', 4] }], 'sınırlayıcı kutu'],
    ['kutu sıfır genişlikte', [{ ...gecerli, bolge: [10, 10, 0, 50] }], 'sıfır ya da negatif'],
    ['kutu tuval dışında', [{ ...gecerli, bolge: [900, 10, 400, 50] }], 'tuval dışına'],
    ['kutu negatif konumda', [{ ...gecerli, bolge: [-5, 10, 100, 50] }], 'tuval dışına'],
    ['kategori listede yok', [{ ...gecerli, kategori: 'estetik' }], 'kategori kapalı listede'],
    ['şiddet listede yok', [{ ...gecerli, siddet: 'orta' }], 'şiddet kapalı listede'],
    ['açıklama boş', [{ ...gecerli, aciklama: '   ' }], 'açıklama boş'],
    ['nesne değil', ['bir kusur var'], 'nesne değil'],
  ]

  for (const [ad, girdi, imza] of redVakalari) {
    it(`${ad} → reddedilir ve SAYILIR`, () => {
      const r = yargiyaCevir(sar(girdi), 1, BOYUT)
      expect(r.bulgular).toHaveLength(0)
      expect(r.reddedilen).toHaveLength(1)
      expect(r.reddedilen[0]).toContain(imza)
    })
  }

  it('geçerli ve geçersiz KARIŞIK gelirse geçerli olan korunur', () => {
    // Tek bir bozuk bulgu yüzünden tüm raporu atmak, modelin bir hatası yüzünden
    // gerçek bir kusuru gizlemek olurdu.
    const r = yargiyaCevir(sar([gecerli, { ...gecerli, bolge: null }]), 1, BOYUT)
    expect(r.bulgular).toHaveLength(1)
    expect(r.reddedilen).toHaveLength(1)
  })

  it('JSON dizisi yoksa SESSİZCE boş dönmez — sebep yazılır', () => {
    const r = yargiyaCevir({ result: 'Bu slaytta bir sorun göremedim.' }, 1, BOYUT)
    expect(r.bulgular).toHaveLength(0)
    expect(r.reddedilen[0]).toContain('JSON dizisi bulunamadı')
  })

  it('bozuk JSON sebep yazar', () => {
    // ⚠ Girdi köşeli ayraçların İKİSİNİ de taşımalı; ilk yazdığım vaka (`'[{"bolge":[1,2,'`)
    // kapanış ayracı içermediği için ayrıştırıcıya hiç ulaşmıyor ve "dizi bulunamadı"
    // sebebine düşüyordu — test geçiyor sanıp yanlış yolu ölçecektim.
    const r = yargiyaCevir({ result: '[{"bolge":[1,2,}]' }, 1, BOYUT)
    expect(r.reddedilen[0]).toContain('ayrıştırılamadı')
  })

  it('kapanış ayracı olmayan çıktı AYRI bir sebep verir', () => {
    const r = yargiyaCevir({ result: '[{"bolge":[1,2,' }, 1, BOYUT)
    expect(r.reddedilen[0]).toContain('JSON dizisi bulunamadı')
  })

  it('metin alanı olmayan çıktı sebep yazar', () => {
    expect(yargiyaCevir({ baska: 1 }, 1, BOYUT).reddedilen[0]).toContain('metin alanı yok')
  })
})

describe('yargiPromptu', () => {
  const g = { yol: '/tmp/s1.png', slayt: 2, toplam: 5, genislik: 1080, yukseklik: 1350 }

  it('mutlak yolu ve tuval ölçüsünü taşır', () => {
    const p = yargiPromptu(g)
    expect(p).toContain('/tmp/s1.png')
    expect(p).toContain('1080×1350')
    expect(p).toContain('5 slaytlık')
  })

  it('GRAMERİ kusur sanmayı önlemek için kasıtlı ögeleri sayar', () => {
    // Hayalet rakam kasten kırpılıyor; söylenmezse model her slaytta bir "kırpma
    // kusuru" bildirir ve rapor gürültüye boğulur.
    const p = yargiPromptu(g)
    expect(p).toContain('KASITLIDIR')
    expect(p).toContain('kırpma kusuru değildir')
  })

  it('kutusuz bulgunun kabul edilmeyeceğini AÇIKÇA söyler', () => {
    expect(yargiPromptu(g)).toContain('Sınırlayıcı kutusu olmayan bulgu KABUL EDİLMEZ')
  })
})

describe('bulguSatiri', () => {
  it('kritik ve uyarı farklı işaret alır', () => {
    const b = yargiyaCevir(sar([gecerli]), 2, BOYUT).bulgular[0]
    expect(b).toBeDefined()
    expect(bulguSatiri(b!)).toContain('✗')
    expect(bulguSatiri(b!)).toContain('[120,460,300,80]')
  })
})
