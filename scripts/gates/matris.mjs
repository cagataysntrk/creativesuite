// GROUP: fast
// Kapı: reklam varyant matrisi DİK olmalı (§10 · D-4 · D-225 · FAZ-8.1).
//
// **Üç ekseni birden değiştiren bir test hiçbir şey öğretmez.** Fark hangi eksene ait
// bilinemez ve 7.9'un geri besleme yolu, atfedilemeyen o farkı "kazanan hook" diye
// corpus'a öneri olarak yazar — yanlış, ölçülmüş gibi görünerek kalıcılaşır.
//
// **Diklik ölçütü moda göre değişir** (D-225):
//   `ofat` — temelden TEK eksende ayrılma. Öğrenme tasarımı, varsayılan.
//   `full` — tam kartezyen; iki eksenli farklılık HATA DEĞİL, tanımın kendisi.
//            Yalnız Meta `asset_feed_spec` hedefinde meşru.
//
// Kapı, hat dosyası `varyantlar:` ile ELLE liste verirse onu doğrular. Liste yoksa
// varyantlar `varyantUret` ile türetiliyor demektir ve ihlal yazılamaz.

import { readFileSync, readdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const REPO = process.env['SUITE_REPO'] ?? join(dirname(fileURLToPath(import.meta.url)), '../..')
const { parseYaml } = await import(join(REPO, 'packages/kernel/dist/index.js'))
const { matrisDenetle, matrisHataMesaji, varyantUret, varyantSayisi } = await import(
  join(REPO, 'packages/engine/dist/index.js')
)

const HATLAR = join(REPO, 'registry/pipelines')
const hatalar = []
let denetlenen = 0

for (const dosya of readdirSync(HATLAR).filter((f) => f.endsWith('.yaml'))) {
  const y = parseYaml(readFileSync(join(HATLAR, dosya), 'utf8'))
  if (!y.ok) {
    hatalar.push(`${dosya}: YAML ayrışmıyor — ${y.message.split('\n')[0]}`)
    continue
  }
  const m = y.value?.matris
  if (m === undefined) continue
  denetlenen++

  const mod = m.mod ?? 'ofat'
  if (mod !== 'ofat' && mod !== 'full') {
    hatalar.push(`${dosya}: bilinmeyen mod '${mod}' — 'ofat' ya da 'full' (D-225)`)
    continue
  }
  const eksenler = Array.isArray(m.eksenler) ? m.eksenler : []
  if (eksenler.length === 0) {
    hatalar.push(`${dosya}: matris var ama eksen yok`)
    continue
  }

  // Elle liste verilmemişse ÜRETİLEN küme denetlenir: kapı, üretecin kendisinin
  // dik bir küme verdiğini de doğrular — üreteç bozulursa burada görünür.
  const varyantlar = Array.isArray(m.varyantlar)
    ? m.varyantlar.map((k) => ({ koordinat: k }))
    : varyantUret(eksenler, mod)

  for (const h of matrisDenetle({ eksenler, varyantlar, mod })) {
    hatalar.push(`${dosya}: ${matrisHataMesaji(h)}`)
  }

  // Maliyet çarpanı manifest'e girmeden ÖNCE burada görünür: 3×3×3'te ofat 7,
  // full 27 — dört kat fark bir yazım hatasıyla oluşmamalı.
  const beklenen = varyantSayisi(eksenler, mod)
  if (varyantlar.length !== beklenen) {
    hatalar.push(
      `${dosya}: ${varyantlar.length} varyant, mod '${mod}' ${beklenen} bekliyor — ` +
        `maliyet tahmini bu sayıyı çarpan alıyor`
    )
  }
}

if (hatalar.length > 0) {
  for (const h of hatalar) console.log(`  ✗ ${h}`)
  console.log(`\n${hatalar.length} dik olmayan matris — atfedilemeyen fark ölçüm değildir`)
  process.exit(1)
}
console.log(`✓ matris: ${denetlenen} hat dik (eksen etkisi atfedilebilir)`)
