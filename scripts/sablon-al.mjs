// Photoshop tasarımı → ölçülmüş şablon iskeleti (D-290 · FAZ-15).
//
// ⚠ ⚠ **BU ARAÇ BİR TASARIMI "OKUMUYOR", ÖLÇÜYOR.** Çıktısı bitmiş bir `KatalogOrnegi`
// değil; kadraj bölünmesi, öge kutuları, palet ve tip ölçeği. Kararı insan ve agent
// veriyor — ama artık göz kararıyla değil, sayıyla başlıyorlar.
//
// ⚠ İKİ GİRDİ, İKİ GÜVEN SEVİYESİ:
//   • `.psd` → katman ADLARI, KUTULARI, metin İÇERİĞİ ve punto doğrudan okunuyor. Yüksek
//     güven: bunlar tasarımcının kendi kararları, tahmin değil.
//   • `.png`/`.jpg` → yalnız palet ve kaba metin bandı çıkarılabiliyor. Düşük güven ve
//     çıktı bunu AÇIKÇA söylüyor; "ölçüldü" ile "tahmin edildi" karışırsa araç zararlı olur.

import { readFileSync, existsSync } from 'node:fs'
import { basename, extname } from 'node:path'

const yol = process.argv[2]
if (yol === undefined || !existsSync(yol)) {
  console.log('  kullanım: just sablon-al <tasarim.psd | tasarim.png>')
  process.exit(1)
}

/** Panorama yüzdesi — kutular şablon dilinde konuşmalı, piksel dilinde değil. */
const yuzde = (v, tam) => Math.round((v / tam) * 1000) / 10

const psdOku = async () => {
  const { readPsd } = await import('ag-psd')
  const psd = readPsd(readFileSync(yol), { skipCompositeImageData: true, skipThumbnail: true })
  const G = psd.width
  const H = psd.height
  const ogeler = []
  const atlanan = []
  const gez = (katmanlar, yol_ = []) => {
    for (const k of katmanlar ?? []) {
      const ad = k.name ?? '(adsız)'
      if (k.children !== undefined) {
        gez(k.children, [...yol_, ad])
        continue
      }
      if (k.hidden === true) continue
      const sol = k.left ?? 0
      const ust = k.top ?? 0
      const en = (k.right ?? 0) - sol
      const boy = (k.bottom ?? 0) - ust
      // ⚠ ⚠ **SIFIR BOYUTLU KATMAN SESSİZCE ATILMIYOR, SAYILIYOR.** İlk sürüm `continue`
      // diyordu ve test PSD'sinde HİÇBİR ÖGE listelenmedi — araç "0 öge" deyip geçti.
      // Gerçek bir dosyada ayar katmanları ve maskeler de böyle kaybolurdu: bir ölçüm
      // aracının en kötü davranışı, ölçemediğini ölçtü sanmaktır.
      // ⚠ Metin katmanı boyutsuz olsa bile DEĞERLİ: içeriği ve puntosu tasarımın kararı.
      if ((en <= 0 || boy <= 0) && k.text === undefined) {
        atlanan.push(ad)
        continue
      }
      ogeler.push({
        ad,
        grup: yol_.join(' / '),
        tip: k.text !== undefined ? 'metin' : 'katman',
        x: yuzde(sol, G),
        y: yuzde(ust, H),
        genislik: yuzde(en, G),
        yukseklik: yuzde(boy, H),
        ...(k.text === undefined
          ? {}
          : {
              metin: (k.text.text ?? '').replace(/\r/g, ' ').trim().slice(0, 80),
              punto: k.text.style?.fontSize ?? null,
              yuz: k.text.style?.font?.name ?? null,
            }),
      })
    }
  }
  gez(psd.children)
  return { G, H, ogeler, atlanan, guven: 'yüksek' }
}

const gorselOku = async () => {
  // ⚠ Düz görselde katman YOK: yalnız palet ölçülebilir. Metin kutusu tahmini kasten
  // YAPILMIYOR — yanlış bir kutu, kutu olmamasından kötü.
  const { spawnSync } = await import('node:child_process')
  const kod = `
import sys, collections
from PIL import Image
im = Image.open(sys.argv[1]).convert('RGB')
G, H = im.size
kucuk = im.resize((160, max(1, round(160 * H / G))))
# KUMELEME SART: ham sayim neredeyse ayni sekiz nane tonunu SEKIZ AYRI renk sayiyordu ve
# palet hicbir sey soylemiyordu. Tasarimin gercek rengi bir DEGER degil bir KUME.
# ⚠ Gomulu Python bir JS sablon dizesinin icinde: ters tirnak KULLANILAMAZ, dizeyi kapatir.
kucuk = kucuk.quantize(colors=8, method=Image.MEDIANCUT).convert('RGB')
sayac = collections.Counter(kucuk.getdata())
toplam = sum(sayac.values())
import json
print(json.dumps({'G': G, 'H': H, 'palet': [
  {'renk': '#%02x%02x%02x' % r, 'oran': round(n / toplam * 100, 1)}
  for r, n in sayac.most_common(8)]}))
`
  const r = spawnSync('python3', ['-c', kod, yol], { encoding: 'utf8' })
  if (r.status !== 0) throw new Error(r.stderr)
  const d = JSON.parse(r.stdout)
  return { G: d.G, H: d.H, ogeler: [], palet: d.palet, guven: 'düşük' }
}

const uzanti = extname(yol).toLowerCase()
const olcum = uzanti === '.psd' || uzanti === '.psb' ? await psdOku() : await gorselOku()

// ── kadraj bölünmesi ────────────────────────────────────────────────────────
//
// ⚠ Karosel N × 1080 × 1350; girdi tek bir geniş tuval olabilir de olmayabilir de.
// Bölünme ORANDAN çıkarılıyor ve tahmin olduğu söyleniyor.
const oran = olcum.G / olcum.H
const slaytOrani = 1080 / 1350
const slaytSayisi = Math.max(1, Math.round(oran / slaytOrani))

console.log(`\n  ${basename(yol)} · ${olcum.G}×${olcum.H} · güven: ${olcum.guven}`)
console.log(`  oran ${oran.toFixed(2)} → tahmini ${slaytSayisi} slayt (1080×1350 başına)`)

if (olcum.palet !== undefined) {
  console.log('\n  palet (ölçülen, alan payıyla):')
  for (const p of olcum.palet) console.log(`    ${p.renk}  %${p.oran}`)
}

if ((olcum.atlanan ?? []).length > 0) {
  console.log(`\n  ⚠ ${olcum.atlanan.length} katman ÖLÇÜLEMEDİ (sıfır boyut: ayar katmanı,`)
  console.log(`    maske ya da piksel verisi olmayan katman): ${olcum.atlanan.join(', ')}`)
}

if (olcum.ogeler.length > 0) {
  const metinler = olcum.ogeler.filter((o) => o.tip === 'metin')
  const puntolar = metinler.map((m) => m.punto).filter((p) => typeof p === 'number')
  console.log(`\n  ${olcum.ogeler.length} öge · ${metinler.length} metin katmanı`)
  if (puntolar.length > 1) {
    const enBuyuk = Math.max(...puntolar)
    const enKucuk = Math.min(...puntolar)
    console.log(`  tip ölçeği: ${enKucuk}–${enBuyuk} px · oran ${(enBuyuk / enKucuk).toFixed(1)}`)
  }
  console.log('\n  ÖGELER (panorama yüzdesi):')
  for (const o of olcum.ogeler.slice(0, 40)) {
    const yer = `x ${o.x} y ${o.y} · ${o.genislik}×${o.yukseklik}`
    const ek = o.tip === 'metin' ? ` · ${o.punto ?? '?'}px · "${o.metin}"` : ''
    console.log(`    [${o.tip}] ${o.grup ? o.grup + ' / ' : ''}${o.ad}  ${yer}${ek}`)
  }
  if (olcum.ogeler.length > 40) console.log(`    … ${olcum.ogeler.length - 40} öge daha`)
}

console.log('\n  ⚠ Bu bir ŞABLON DEĞİL, bir ÖLÇÜMDÜR. Kompozisyon kararını agent veriyor;')
console.log('    araç yalnız göz kararını sayıya çeviriyor.\n')
