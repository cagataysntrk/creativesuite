#!/usr/bin/env node
// GROUP: fast
// Tarayıcıda koşan ölçüm gövdelerinin İÇİNDE ters tırnak olamaz (§7.1 · D-328).
//
// ⚠ ⚠ **BU KAPI DÖRT KEZ AYNI ŞEKİLDE KIRILAN BİR DOSYADAN DOĞDU.** `panorama-denetim.ts`
// içindeki `OLCUM` bir **şablon dizesi** ve gövdesi tarayıcıda koşuyor. O gövdeye Türkçe
// bir yorum yazarken `` `contain` `` gibi bir kod alıntısı koymak diziyi ORADA bitiriyor:
// geri kalan her şey TypeScript sanılıyor ve hata mesajı ölçümün kendisiyle ilgisiz bir
// yerde patlıyor (`Property 'ray' does not exist on type 'string'`).
//
// ⚠ Dört kez yaşandı ve dördünde de yorum satırındaki bir kod alıntısıydı. Yorumun içine
// "hatırla" yazmak bir zorlama değildir — kapı hatırlar.
//
// ⚠ Kapsam DAR: yalnız `const <AD> = (...): string => \`...\`` biçimindeki, adı büyük
// harfli ya da `Olcumu`/`OLCUM` ile biten tarayıcı gövdeleri. Her şablon dizesini
// denetlemek gürültü olurdu — CSS ve HTML üreten dizeler kod alıntısı taşımıyor zaten,
// ama `${}` içinde meşru iç içe dize kullanabiliyorlar.

import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const REPO = join(dirname(fileURLToPath(import.meta.url)), '../..')

/** Tarayıcıda koşan gövdeler — dosya ve gövdeyi açan sabitin adı. */
const GOVDELER = [
  ['packages/render/src/panorama-denetim.ts', 'OLCUM'],
  ['packages/render/src/panorama-denetim.ts', 'METIN_KUTULARI'],
  ['packages/render/src/panorama.ts', 'puntoOlcumu'],
]

const ihlaller = []
for (const [gorece, ad] of GOVDELER) {
  const metin = readFileSync(join(REPO, gorece), 'utf8')
  const satirlar = metin.split('\n')
  // Gövdenin başı: sabitin adını taşıyan satırdan sonraki ilk ters tırnak.
  const bas = satirlar.findIndex((s) => s.includes(`const ${ad} `) || s.includes(`const ${ad} =`))
  if (bas < 0) {
    ihlaller.push(`${gorece}: '${ad}' gövdesi BULUNAMADI — kapı adı eskimiş, körelmiş demektir`)
    continue
  }
  // ⚠ ⚠ **AÇILIŞ, "ilk ters tırnak" DEĞİL.** İlk sürüm öyle sanıyordu ve sabitin
  // ÜSTÜNDEKİ JSDoc'ta duran kod alıntılarını gövde içi sandı: dört meşru satır ihlal
  // raporlandı. Üç gövde de `(() => {` ya da `(async () => {` ile açılıyor; aranan o.
  let acildi = false
  for (let i = bas; i < satirlar.length; i += 1) {
    const satir = satirlar[i]
    if (!acildi) {
      if (/`\((\(\)|async)/.test(satir)) acildi = true
      continue
    }
    // Kapanış: satır sonunda tek başına duran ters tırnak (`\`` ya da `\`)`).
    if (/^\s*`\)?$/.test(satir) || /\}\)\(\)`$/.test(satir)) break
    const kirpik = satir.trim()
    const yorum = kirpik.startsWith('//') || kirpik.startsWith('*') || kirpik.startsWith('/*')
    // ⚠ KAÇIRILMIŞ ters tırnak (`\\``) diziyi BİTİRMEZ ve meşrudur; kapı yalnız ÇIPLAK
    // olanı arıyor. Yanlış pozitif de bir hatadır — ilk sürüm altı meşru satırı
    // ihlal saydı ve okunmaz bir kapı, olmayan bir kapıdır.
    const ciplak = satir.replace(/\\`/g, '')
    if (yorum && ciplak.includes('`')) {
      ihlaller.push(
        `${gorece}:${String(i + 1)}  '${ad}' gövdesinde ters tırnak — şablon dizesi ORADA biter`
      )
    }
  }
}

if (ihlaller.length > 0) {
  for (const s of ihlaller) console.log(`  ✗ ${s}`)
  console.log(
    `\n${String(ihlaller.length)} ters tırnak — hata mesajı ölçümle ilgisiz bir yerde patlar` +
      ' ve dört kez tam olarak öyle oldu (D-328).'
  )
  process.exit(1)
}
console.log(`  ${String(GOVDELER.length)} tarayıcı gövdesi denetlendi · ters tırnak yok`)
