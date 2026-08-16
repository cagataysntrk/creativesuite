import { describe, expect, it } from 'vitest'
import { assHataMesaji, toAss, type CaptionLine } from './ass.js'

const satir = (words: { t: string; s: number; e: number }[]): CaptionLine => ({
  words: words.map((w) => ({ text: w.t, start: w.s, end: w.e })),
})

const OLCU = { width: 1080, height: 1920 }

describe('.ass karaoke yazıcısı', () => {
  it('Türkçe karakterleri KAÇIŞSIZ yazıyor — UTF-8, Latin-1 değil', () => {
    const r = toAss(
      [
        satir([
          { t: 'ĞÜŞİÖÇ', s: 0, e: 0.5 },
          { t: 'ığüşöç', s: 0.5, e: 1 },
        ]),
      ],
      OLCU
    )
    expect(r.ok).toBe(true)
    if (!r.ok) return
    // Bayt bayt: bir yazıcı Latin-1'e düşerse `ğ` sessizce `g` olur ve bunu ancak
    // video izlenirken fark edersiniz.
    expect(r.value).toContain('ĞÜŞİÖÇ')
    expect(r.value).toContain('ığüşöç')
    expect(r.value).not.toContain('\\u')
  })

  it('`\\k` süresi kelimenin KENDİ süresi, toplam değil', () => {
    const r = toAss(
      [
        satir([
          { t: 'bir', s: 0, e: 0.4 },
          { t: 'iki', s: 0.4, e: 1.0 },
        ]),
      ],
      OLCU
    )
    expect(r.ok).toBe(true)
    if (!r.ok) return
    // 0.4 sn → 40 cs · 0.6 sn → 60 cs. Toplam yazsaydık ikincisi 100 olurdu.
    expect(r.value).toContain('{\\k40}bir {\\k60}iki')
  })

  it('zaman biçimi santisaniye — `s:mm:ss.cc`', () => {
    const r = toAss([satir([{ t: 'x', s: 61.5, e: 3661.25 }])], OLCU)
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.value).toContain('Dialogue: 0,0:01:01.50,1:01:01.25,Alt,')
  })

  // 🧪 İHLAL TESTİ — bozuk zamanlama SESSİZ geçmemeli. Fikstür (D-181): aynı satırda
  // biri geçerli biri bozuk kelime; kural kalkarsa ikisi de yazılır ve altyazı kayar.
  it('ters zamanlamayı REDDEDİYOR, geçerli kelimeyi tek başına yazmıyor', () => {
    const r = toAss(
      [
        satir([
          { t: 'iyi', s: 0, e: 0.5 },
          { t: 'bozuk', s: 2, e: 1 },
        ]),
      ],
      OLCU
    )
    expect(r.ok).toBe(false)
    if (r.ok) return
    expect(r.errors.map((e) => e.kind)).toEqual(['reversed'])
    expect(assHataMesaji(r.errors[0]!)).toContain('altyazı kayar')
  })

  it('çakışan kelimeleri reddediyor — karaoke iki yerde yanamaz', () => {
    const r = toAss(
      [
        satir([
          { t: 'a', s: 0, e: 1 },
          { t: 'b', s: 0.5, e: 1.5 },
        ]),
      ],
      OLCU
    )
    expect(r.ok).toBe(false)
    if (r.ok) return
    expect(r.errors.map((e) => e.kind)).toEqual(['overlap'])
  })

  it('boş girdi bir HATA, boş dosya değil', () => {
    const r = toAss([], OLCU)
    expect(r.ok).toBe(false)
    if (r.ok) return
    expect(r.errors).toEqual([{ kind: 'empty' }])
  })

  it('çözünürlük başlığa yazılıyor — dikey video 1080×1920', () => {
    const r = toAss([satir([{ t: 'x', s: 0, e: 1 }])], OLCU)
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.value).toContain('PlayResX: 1080')
    expect(r.value).toContain('PlayResY: 1920')
  })
})
