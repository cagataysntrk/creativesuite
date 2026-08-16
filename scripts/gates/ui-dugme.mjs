// GROUP: fast
// Her düğme BİR ŞEY YAPAR (§12.9 · FAZ-4.6b).
//
// **Gerçekten oldu (2026-08-16 denetimi):** Run Launcher ekranındaki "Başlat" düğmesinin
// `onClick`i yoktu. Ekran planı kuruyor, maliyet aralığını basıyor, bütçe kilidini
// hesaplıyordu — düğmeye basınca hiçbir şey olmuyordu. 29 kapı yeşildi, 918 test
// yeşildi, ve FAZ 4'ün çıkış kriteri *"⌘K → seç → çalıştır → onayla, fareye hiç
// dokunmadan"* zincirin "çalıştır" adımında kopuyordu.
//
// Neden hiçbir test görmedi: ekran bileşenlerinin sıfır testi var; sayılan testler
// SUNUCU testleri. Bir bileşen testi yazmak da bu kapıyı gereksiz kılmaz — kapı
// ucuz ve bütün ekranları birden kapsıyor.
//
// Yasak DEĞİL: `type="submit"` (form gönderir), `disabled` sabiti (hiç etkin olmayan
// açıklayıcı düğme) ve `aria-disabled` işaretli olanlar muaf — ama muafiyet AÇIKÇA
// yazılmış olmalı, sessiz olmamalı.

import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, dirname, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const REPO = join(dirname(fileURLToPath(import.meta.url)), '../..')

const gez = (d, out = []) => {
  for (const ad of readdirSync(d)) {
    if (ad === 'node_modules' || ad === 'dist') continue
    const p = join(d, ad)
    if (statSync(p).isDirectory()) gez(p, out)
    else if (p.endsWith('.tsx')) out.push(p)
  }
  return out
}

const dosyalar = [...gez(join(REPO, 'apps/ui/src')), ...gez(join(REPO, 'packages/ui/src'))].filter(
  (f) => !f.endsWith('.test.tsx')
)

const hatalar = []
let dugmeSayisi = 0

for (const f of dosyalar) {
  const src = readFileSync(f, 'utf8')
  // `<button` ile onu kapatan `>` arasındaki öznitelik bloğu. JSX çok satırlı yazılıyor,
  // o yüzden satır bazlı arama işe yaramaz — açılış etiketinin TAMAMI alınır.
  let i = src.indexOf('<button')
  while (i !== -1) {
    // Etiketin sonu: iç içe `{...}` süslülerini atlayarak ilk `>`.
    let derinlik = 0
    let j = i
    for (; j < src.length; j++) {
      const ch = src[j]
      if (ch === '{') derinlik++
      else if (ch === '}') derinlik--
      else if (ch === '>' && derinlik === 0) break
    }
    const etiket = src.slice(i, j + 1)
    dugmeSayisi++

    const etkin =
      /onClick\s*=/.test(etiket) ||
      /onPointerDown\s*=/.test(etiket) ||
      /onKeyDown\s*=/.test(etiket) ||
      /type\s*=\s*["']submit["']/.test(etiket) ||
      // `disabled` SABİT ise (değişken değil) düğme hiç etkin olmuyor demektir.
      /disabled(\s|>)/.test(etiket) ||
      /disabled\s*=\s*\{true\}/.test(etiket) ||
      /aria-disabled/.test(etiket)

    if (!etkin) {
      const satir = src.slice(0, i).split('\n').length
      hatalar.push(
        `${relative(REPO, f)}:${satir} — düğmenin eylemi YOK (onClick / type="submit" / disabled)`
      )
    }
    i = src.indexOf('<button', j)
  }
}

if (hatalar.length > 0) {
  for (const h of hatalar) console.log(`  ✗ ${h}`)
  console.log(
    `\n${hatalar.length} eylemsiz düğme — basınca hiçbir şey olmayan bir düğme, olmayan bir özelliktir`
  )
  process.exit(1)
}

console.log(
  `✓ ui-dugme: ${dugmeSayisi} düğmenin hepsinin bir eylemi var (${dosyalar.length} dosya)`
)
