#!/usr/bin/env node
// GROUP: fast
// ÖLÇÜM BELGESİ ZORUNLU — tarayıcıda ölçen bir kapı, ÜRETİMİN düzenini ölçmek zorunda.
//
// ⚠ ⚠ **BU KAPI BİR SINIFI KAPATIYOR, BİR HATAYI DEĞİL.** On bir tarayıcı kapısının
// DOKUZU yedek fontla ölçüyordu; `metin-gorsel-cakisiyor` ayrıca belirteçsizdi
// (`tokenCss: ''`); hiçbiri `puntoOlcumu` koşmuyordu ve logo yüklemiyordu. Ölçülen şey
// hiçbir zaman yayınlanan şey değildi. Sonuç iki yönlü ve ikisi de ÖLÇÜLDÜ:
//   · `olu-bant` fontsuzken `veri-hikayesi` k1'i %29 buluyordu, fontlu %20.
//   · `metin-gorsel-cakisiyor` `memphis`te OLMAYAN bir çakışma bildirdi.
//   · logosuz `donen` k4'te OLMAYAN bir ölü bant bildirdi (%28 / %22).
// **Yanlış düzeni ölçen kapı hem gerçek kusuru kaçırır hem olmayanı uydurur.**
//
// ⚠ Düzeltmenin kendisi yeterli değil: bir dosya daha eklenir ve unutulur. Belge TEK
// yerden kuruluyor (`olcum-belgesi.ts`) ve bu kapı onu ATLAYANI yakalıyor.
//
// ⚠ Kapsam DAR ve kasıtlı: yalnız tarayıcı açan test dosyaları. `panoramaHtml`i metin
// olarak sınayan bir test (CSS dizisinde bir kural arıyor) düzen ölçmüyor; ona belge
// dayatmak kapıyı gürültüye boğar ve beş gün içinde görmezden gelinir.

import { readFileSync, globSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const REPO = join(dirname(fileURLToPath(import.meta.url)), '../..')
const p = (r) => join(REPO, r)

// Tarayıcı AÇAN işaretler — düzen ancak çizildikten sonra ölçülür.
const TARAYICI = /\bwithPage\s*\(|\bwithOturum\s*\(|panoramaDenetle\s*\(|chromium\./
// Belgeyi kuran tek yetkili.
const YETKILI = /olcumBelgesi\s*\(/
// ⚠ ⚠ **KURAL BİR KEZ FAZLA KÖR YAZILDI ve kendi çıktısı düzeltti.** İlk hâli her
// `tokenCss:` yazımını atlama sayıyordu ve MEŞRU testleri kırmızıya çevirdi: `ifsa`
// şeridi gizlemek için belirteci KASTEN eziyor, `sus-metni` farklı belirteçlerle aynı
// şablonu ölçüyor, `aile-tutarliligi` markaları karşılaştırıyor. Kapatılacak tuzak
// **unutmak**, ezmek değil — bir alanı bilerek değiştiren yazar zaten haberdardır.

const hatalar = []
let tarandi = 0
for (const rel of globSync('packages/*/src/**/*.test.ts', { cwd: REPO }).sort()) {
  const src = readFileSync(p(rel), 'utf8')
  if (!TARAYICI.test(src)) continue
  tarandi++
  const yol = relative(REPO, p(rel))
  // ⚠ Kendi dosyası muaf DEĞİL: `olcum-belgesi`i sınayan bir test de onu kullanmalı.
  if (!YETKILI.test(src)) {
    hatalar.push(`${yol}  tarayıcıda ölçüyor ama \`olcumBelgesi\` kullanmıyor`)
    continue
  }
}

if (tarandi === 0) {
  console.log('✗ hiçbir tarayıcı testi taranmadı — kapsam yanlış, kapı boş geçiyor')
  process.exit(1)
}

for (const h of hatalar) console.log(`  ${h}`)
if (hatalar.length > 0) {
  console.log(`\n${hatalar.length} kapı üretimin düzenini ölçmüyor`)
  process.exit(1)
}
console.log(`  ${tarandi} tarayıcı kapısı · hepsi \`olcumBelgesi\` üzerinden ölçüyor`)
