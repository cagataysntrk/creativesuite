#!/usr/bin/env node
// FONT DENETİMİ — bir yüz Türkçe'yi GERÇEKTEN taşıyor mu (FAZ-19.5).
//
// ⚠ ⚠ **BU BETİK BİR İDDİAYI DOĞRULAMAK İÇİN YAZILDI.** Araştırma raporu "IBM Plex'in
// tamamı `latn/TRK` taşımıyor" diyordu ve o iddiaya dayanarak bir aile seçilecekti.
// Başkasının ölçümüne dayanarak karar vermek, bu deponun `dayanaksiz` dediği şeydir.
// Betik raporun her elemesini bağımsız olarak yeniden üretti: IBM Plex Sans/Mono ve
// Inter `latn/TRK` YOK; `Stardos Stencil` ve `Share Tech Mono` 10/15 (`Ğ ğ İ Ş ş` YOK).
//
// ⚠ Üç sınav, üçü de gerekli:
//   1. `cmap`te 15 Türkçe kod noktası — yoksa tofu basar.
//   2. `Ş`(U+015E) ile `Ș`(U+0218) AYRI glif — aynıysa yüz Romence virgüllü formu
//      çiziyor demektir ve Türkçe okuyucu farkı görür.
//   3. `GSUB`ta `latn/TRK` — yoksa `fi` bağı bağlanır ve noktalı i'nin NOKTASI kaybolur.
//
// Kullanım: `node scripts/font-denetim.mjs "Archivo:wght@400" "Literata:wght@400"`
// Ölçüm sonuçları `docs/kurallar/OLCUMLER.md`'de kayıtlı.

// dizini aynı ama gövde çözülmeden okunamaz. Aynı yüzün TTF'i aynı cmap/GSUB'ı taşır.
const ESKI_UA = 'Mozilla/5.0 (Windows NT 6.1)' // eski UA → Google Fonts ttf döndürüyor

const TR = [
  ['Ç', 0x00c7],
  ['ç', 0x00e7],
  ['Ğ', 0x011e],
  ['ğ', 0x011f],
  ['İ', 0x0130],
  ['ı', 0x0131],
  ['Ö', 0x00d6],
  ['ö', 0x00f6],
  ['Ş', 0x015e],
  ['ş', 0x015f],
  ['Ü', 0x00dc],
  ['ü', 0x00fc],
  ['Â', 0x00c2],
  ['Î', 0x00ce],
  ['Û', 0x00db],
]

const tablolar = (b) => {
  const n = b.readUInt16BE(4)
  const t = {}
  for (let i = 0; i < n; i++) {
    const o = 12 + i * 16
    t[b.toString('latin1', o, o + 4)] = { off: b.readUInt32BE(o + 8), len: b.readUInt32BE(o + 12) }
  }
  return t
}

/** cmap → Map(kod → glif). Format 4 ve 12 okunuyor; ötekiler yok sayılıyor. */
const cmapOku = (b, off) => {
  const m = new Map()
  const n = b.readUInt16BE(off + 2)
  const altlar = []
  for (let i = 0; i < n; i++) altlar.push(off + b.readUInt32BE(off + 4 + i * 8 + 4))
  for (const s of altlar) {
    const bicim = b.readUInt16BE(s)
    if (bicim === 4) {
      const segX2 = b.readUInt16BE(s + 6)
      const seg = segX2 / 2
      const son = s + 14,
        bas = son + segX2 + 2,
        delta = bas + segX2,
        aralik = delta + segX2
      for (let i = 0; i < seg; i++) {
        const e = b.readUInt16BE(son + i * 2),
          st = b.readUInt16BE(bas + i * 2)
        if (st === 0xffff) continue
        const d = b.readInt16BE(delta + i * 2),
          ro = b.readUInt16BE(aralik + i * 2)
        for (let c = st; c <= e && c !== 0x10000; c++) {
          let g
          if (ro === 0) g = (c + d) & 0xffff
          else {
            const gi = aralik + i * 2 + ro + (c - st) * 2
            if (gi + 1 >= b.length) continue
            g = b.readUInt16BE(gi)
            if (g !== 0) g = (g + d) & 0xffff
          }
          if (g !== 0 && !m.has(c)) m.set(c, g)
        }
      }
    } else if (bicim === 12) {
      const gr = b.readUInt32BE(s + 12)
      for (let i = 0; i < gr; i++) {
        const o = s + 16 + i * 12
        const st = b.readUInt32BE(o),
          e = b.readUInt32BE(o + 4),
          g0 = b.readUInt32BE(o + 8)
        for (let c = st; c <= e && c - st < 0x10000; c++) if (!m.has(c)) m.set(c, g0 + (c - st))
      }
    }
  }
  return m
}

/** GSUB script listesinde `latn` → `TRK ` dil sistemi var mı. */
const trkVarMi = (b, off) => {
  const scriptOff = off + b.readUInt16BE(off + 4)
  const n = b.readUInt16BE(scriptOff)
  for (let i = 0; i < n; i++) {
    const o = scriptOff + 2 + i * 6
    if (b.toString('latin1', o, o + 4) !== 'latn') continue
    const s = scriptOff + b.readUInt16BE(o + 4)
    const ls = b.readUInt16BE(s + 2)
    for (let j = 0; j < ls; j++) {
      const lo = s + 4 + j * 6
      if (b.toString('latin1', lo, lo + 4) === 'TRK ') return true
    }
  }
  return false
}

const getir = async (u, bin) => {
  const r = await fetch(u, { headers: { 'user-agent': ESKI_UA } })
  if (!r.ok) throw new Error(`${r.status} ${u}`)
  return bin ? Buffer.from(await r.arrayBuffer()) : r.text()
}

for (const sorgu of process.argv.slice(2)) {
  const ad = sorgu.split(':')[0].replaceAll('+', ' ')
  try {
    const css = await getir(`https://fonts.googleapis.com/css2?family=${sorgu}`, false)
    const url = /url\((https?:\/\/[^)]+)\)/.exec(css)?.[1]
    if (url === undefined) {
      console.log(`${ad.padEnd(22)} ✗ url yok`)
      continue
    }
    const b = await getir(url, true)
    const t = tablolar(b)
    if (t['cmap'] === undefined) {
      console.log(`${ad.padEnd(22)} ✗ cmap yok`)
      continue
    }
    const m = cmapOku(b, t['cmap'].off)
    const eksik = TR.filter(([, c]) => !m.has(c)).map(([g]) => g)
    const s1 = m.get(0x015e),
      s2 = m.get(0x0218)
    const ayni = s1 !== undefined && s2 !== undefined && s1 === s2
    const trk = t['GSUB'] === undefined ? false : trkVarMi(b, t['GSUB'].off)
    const gecti = eksik.length === 0 && !ayni && trk
    console.log(
      `${gecti ? '✓' : '✗'} ${ad.padEnd(22)} cmap ${String(15 - eksik.length)}/15` +
        `${eksik.length ? ` (eksik: ${eksik.join(' ')})` : ''}` +
        `  Ş≠Ș ${ayni ? 'HAYIR' : 'evet'}  latn/TRK ${trk ? 'VAR' : 'YOK'}`
    )
  } catch (e) {
    console.log(`✗ ${ad.padEnd(22)} ${e.message}`)
  }
}
