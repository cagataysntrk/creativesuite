// GROUP: fast
// Kapı: her ekran palete BAĞLI, her palet komutu bir yere GİDER (§12.5 · FAZ-4.15).
//
// **Menü yok — palet birincil navigasyondur** (§12.5). Bu karar bir bedel getiriyor:
// bir ekran yönlendirmede tanımlanıp palete eklenmezse, kullanıcının onu açmasının
// HİÇBİR yolu kalmaz. Ekran çalışır, testleri geçer, ucu cevap verir — ve kimse göremez.
//
// Gerçekten oldu: `kesif` · `sema` · `butce` · `varliklar` dört ekran da yönlendirmede
// vardı, dördü de palette yoktu. Dört adım "bitti" diye tiklenmişti ve dördü de
// ulaşılamazdı. 26 kapının hiçbiri bakmıyordu.
//
// Ters yön de aynı derecede sessiz: palette olup hiçbir yere gitmeyen bir komut,
// seçildiğinde giriş ekranına düşer — kullanıcı komutu bulur, tıklar, hiçbir şey olmaz.

import { readFileSync } from 'node:fs'

const YOL = 'apps/ui/src/App.tsx'
const kaynak = readFileSync(YOL, 'utf8')
// Prettier ternary'leri satırlara böler; desenler tek satıra indirilmiş metinde aranır.
const duz = kaynak.replace(/\s+/g, ' ')

const hatalar = []

// 1) Yönlendirilen ekranlar: `ekran === 'x'`
const ekranlar = new Set([...duz.matchAll(/ekran === '([\w-]+)'/g)].map((m) => m[1]))
ekranlar.delete('giris')

// 2) Palet eşlemeleri: `k.id === 'komut' ? 'ekran'`
const eslemeler = new Map()
for (const m of duz.matchAll(/k\.id === '([\w-]+)' \? '([\w-]+)'/g)) eslemeler.set(m[1], m[2])

// 3) Doğrudan bir ekrana atlayan komut kümeleri: `URETIM_KOMUTLARI` gibi.
//    `setEkran('x')` çağrılarında geçen ekranlar da ulaşılabilir sayılır.
for (const m of duz.matchAll(/setEkran\('([\w-]+)'\)/g)) eslemeler.set(`__dogrudan_${m[1]}`, m[1])

// 4) KOMUTLAR listesi
// Blok ORİJİNAL kaynaktan alınır: düzleştirilmiş metinde iç içe `]` karakterleri
// (`anahtarlar: ['approve']`) listeyi erken kapatır ve kapı hiçbir komut görmez.
const blok = /const KOMUTLAR[^=]*= \[\n([\s\S]*?)\n\]/.exec(kaynak)
if (blok === null) {
  hatalar.push(`${YOL}: KOMUTLAR listesi bulunamadı — kapı hiçbir şeyi denetlemiyor`)
}
const komutIdleri = new Set(
  blok === null ? [] : [...blok[1].matchAll(/id: '([\w-]+)'/g)].map((m) => m[1])
)

// 5) Küme sabitlerinde geçen komutlar (ör. URETIM_KOMUTLARI) — bunlar ekran açmaz,
//    başka bir ekranı parametreyle açar; yine de "bir yere gidiyor" sayılır.
const kumeKomutlari = new Set(
  [...duz.matchAll(/ReadonlySet<string> = new Set\(\[([^\]]*)\]\)/g)].flatMap((m) =>
    [...m[1].matchAll(/'([\w-]+)'/g)].map((x) => x[1])
  )
)

const ekranaGidenler = new Set([...eslemeler.values()])

for (const e of [...ekranlar].sort()) {
  if (!ekranaGidenler.has(e)) {
    hatalar.push(
      `${YOL}: '${e}' ekranı yönlendirmede var ama HİÇBİR palet komutu oraya gitmiyor — ulaşılamaz`
    )
  }
}

for (const k of [...komutIdleri].sort()) {
  if (!eslemeler.has(k) && !kumeKomutlari.has(k)) {
    hatalar.push(
      `${YOL}: '${k}' palet komutunun hedefi yok — seçildiğinde giriş ekranına düşer, sessiz no-op`
    )
  }
}

for (const [k, e] of [...eslemeler].sort()) {
  if (k.startsWith('__dogrudan_')) continue
  if (!komutIdleri.has(k)) {
    hatalar.push(`${YOL}: '${k}' → '${e}' eşlemesi var ama '${k}' KOMUTLAR listesinde yok`)
  }
}

if (hatalar.length > 0) {
  for (const h of hatalar) console.error(`✗ ${h}`)
  process.exit(1)
}

console.log(
  `✓ ui-navigasyon: ${ekranlar.size} ekranın hepsi palete bağlı, ${komutIdleri.size} komutun hepsi bir yere gidiyor`
)
