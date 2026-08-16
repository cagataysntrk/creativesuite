#!/usr/bin/env node
// Token üreteci — dört çıktı, tek kaynak (§4.1 · R-65).
//
// `--check` ile çalıştırıldığında HİÇBİR ŞEY YAZMAZ, yalnız üretileni diskteki ile
// karşılaştırır. Kapı bu modu kullanır: üreteci koşturup `git diff` bakmak, kapının
// çalışma ağacını kirletmesi demekti ve kirli ağaçta koşan bir kapı hiçbir şey kanıtlamaz.

import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const REPO = join(dirname(fileURLToPath(import.meta.url)), '..')
const {
  compileTokens,
  inheritTokens,
  toCss,
  toSurfaceCss,
  toTailwind,
  toBrandFacts,
  checkChroma,
  formatChroma,
} = await import(join(REPO, 'packages/registry/dist/index.js'))

const kontrol = process.argv.includes('--check')

// Markalar `brand/` dizininden TARANIR, elle listelenmez.
//
// İlk sürüm sabit bir diziydi ve doğrulama agent'ı 2026-08-15'te üçüncü bir marka
// dizini ekleyip kademe İHLALLİ token yazdı: hiçbir kapı görmedi. **Listeye eklemeyi
// hatırlamak bir zorlama değildir** — ve fazın başlığı çok markalılıkken, üçüncü
// markanın denetimsiz kalması kapının tam olarak korumadığı şeydir.
//
// Kalıtım ilişkisi `brand/<id>/parent` dosyasından okunur (tek satır, ana marka id'si).
// Dosya yoksa marka köktür. FAZ-4'te `brand.yaml`a taşınacak.
const MARKALAR = readdirSync(join(REPO, 'brand'), { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name)
  .sort()
  .map((id) => {
    const parentYolu = join(REPO, `brand/${id}/parent`)
    const parent = existsSync(parentYolu) ? readFileSync(parentYolu, 'utf8').trim() : null
    return { id, parent: parent === '' ? null : parent }
  })
if (MARKALAR.length === 0) {
  console.log('✗ brand/ altında hiç marka yok — kapı boş geçiyor')
  process.exit(1)
}

// **`studio.tokens.json` AYRI derlenir** (§12.4). Diğer her dosya tek ağaçta birleşir.
//
// Sebep: iki yüzey bağlamı aynı rol ADLARINI farklı DEĞERLERLE tanımlar. Tek ağaçta
// birleştirmek, `role.bg`'nin iki tanımından birinin sessizce diğerini ezmesi demekti —
// yani yüzeylerden biri hiç var olmazdı. Yüzey ağacı, temel ağacın RAMPALARINI ödünç
// alarak derlenir; kendi rampasını tanımlayamaz.
const YUZEY_DOSYASI = /^([a-z]+)\.surface\.tokens\.json$/
const agacOku = (marka) => {
  const dizin = join(REPO, `brand/${marka}/tokens`)
  if (!existsSync(dizin)) return null
  const dosyalar = readdirSync(dizin)
    .filter((f) => f.endsWith('.tokens.json'))
    .sort()
  if (dosyalar.length === 0) return null
  const agac = {}
  const yuzeyler = {}
  for (const f of dosyalar) {
    const d = JSON.parse(readFileSync(join(dizin, f), 'utf8'))
    const y = YUZEY_DOSYASI.exec(f)
    const hedef = y === null ? agac : (yuzeyler[y[1]] ??= {})
    for (const [k, v] of Object.entries(d)) {
      if (k.startsWith('$')) continue
      hedef[k] = { ...(hedef[k] ?? {}), ...v }
    }
  }
  return { agac, yuzeyler, dosyaSayisi: dosyalar.length }
}

let toplamToken = 0
let toplamFarkli = 0
const raporlar = []

for (const marka of MARKALAR) {
  const kendi = agacOku(marka.id)
  if (kendi === null) {
    console.log(`✗ ${marka.id}: hiç token dosyası yok — kapı boş geçiyor`)
    process.exit(1)
  }
  // Kalıtım ZİNCİRİ özyineli çözülür: A -> B -> C varsa C, B'nin devraldigi A'yi da
  // gormeli. Ilk surum yalniz BIR seviye bakiyordu ve dede kademesi sessizce
  // kayboluyordu (2. dogrulama turu). Dongu tespiti de burada: parent kendini ya da
  // bir atasini gosterirse sonsuz dongu yerine ACIK hata.
  const zincir = []
  {
    const gorulen = new Set([marka.id])
    let p = marka.parent
    while (p !== null) {
      if (gorulen.has(p)) {
        console.log(`X ${marka.id}: kalitim DONGUSU - ${[...gorulen, p].join(' -> ')}`)
        process.exit(1)
      }
      gorulen.add(p)
      const ata = MARKALAR.find((m) => m.id === p)
      if (ata === undefined) {
        console.log(`X ${marka.id}: ana marka '${p}' brand/ altinda YOK`)
        process.exit(1)
      }
      zincir.unshift(ata)
      p = ata.parent
    }
  }

  let agac = {}
  let yuzeyAgaclari = {}
  let devralinan = 0
  const yuzeyBirlestir = (alt, ust) => {
    const cikti = { ...alt }
    for (const [ad, agaci] of Object.entries(ust)) {
      cikti[ad] = ad in cikti ? inheritTokens(cikti[ad], agaci).merged : agaci
    }
    return cikti
  }
  for (const ata of zincir) {
    const a = agacOku(ata.id)
    if (a === null) {
      console.log(`X ${marka.id}: ana marka ${ata.id} token tasimiyor`)
      process.exit(1)
    }
    agac = Object.keys(agac).length === 0 ? a.agac : inheritTokens(agac, a.agac).merged
    // Yüzey tanımları da KALITILIR: alt marka stüdyo yüzeyini yeniden tanımlamak
    // zorunda değil. Zorunda olsaydı, ana markanın yüzeyini güncellemek her alt
    // markada elle tekrar gerektirirdi ve biri unutulurdu.
    yuzeyAgaclari = yuzeyBirlestir(yuzeyAgaclari, a.yuzeyler)
  }
  if (zincir.length === 0) {
    agac = kendi.agac
    yuzeyAgaclari = kendi.yuzeyler
  } else {
    const k = inheritTokens(agac, kendi.agac)
    agac = k.merged
    devralinan = k.overridden.length
    yuzeyAgaclari = yuzeyBirlestir(yuzeyAgaclari, kendi.yuzeyler)
  }
  const dosyaSayisi = kendi.dosyaSayisi

  const sonuc = compileTokens(agac)
  if (!sonuc.ok) {
    console.log(`✗ ${marka.id}: token derlenemedi:`)
    for (const e of sonuc.errors) {
      console.log(`    ${e.kind}  ${e.path}${e.ref === undefined ? '' : ` → ${e.ref}`}`)
      if (e.why !== undefined) console.log(`      ${e.why}`)
    }
    process.exit(1)
  }

  // ── chroma alana göre sınırlı (§12.1) ─────────────────────────────────────
  // Kademe denetimi "hangi token NEYE bağlanır" sorusunu cevaplıyordu; bu blok
  // "o renk NE KADAR doygun" sorusunu soruyor. İkisi ayrı: kademesi kusursuz bir
  // token pekâlâ ekranın dörtte birini C=0.12 ile boyayabilir — ve renk her yerde
  // olduğunda hiçbir yerde uyarı kalmaz (ISA-101).
  const chromaIhlalleri = checkChroma(sonuc.value)
  if (chromaIhlalleri.length > 0) {
    console.log(`✗ ${marka.id}: chroma sınırı aşıldı:`)
    console.log(formatChroma(chromaIhlalleri))
    process.exit(1)
  }

  // ── yüzey bağlamları (§12.4) ──────────────────────────────────────────────
  // Her yüzey, temel ağacın RAMPALARIYLA birlikte derlenir: kendi rampasını
  // tanımlayamaz, çünkü iki yüzeyin farklı ham renkleri olması "marka-nötr izleme
  // kabini" tezini (§12.1) çürütür — kabuk iki farklı gri olurdu.
  const yuzeyCss = []
  for (const [ad, yuzeyAgaci] of Object.entries(yuzeyAgaclari).sort()) {
    const disari = Object.keys(yuzeyAgaci).filter((k) => k !== 'role')
    if (disari.length > 0) {
      console.log(
        `✗ ${marka.id}: '${ad}' yüzeyi yalnız 'role' tanımlayabilir, şunları da tanımlamış: ` +
          `${disari.join(', ')} — yüzey RENGİ değiştirir, YAPIYI değil (§12.4)`
      )
      process.exit(1)
    }
    const y = compileTokens({ ramp: agac.ramp, role: yuzeyAgaci.role })
    if (!y.ok) {
      console.log(`✗ ${marka.id}: '${ad}' yüzeyi derlenemedi:`)
      for (const e of y.errors) console.log(`    ${e.kind}  ${e.path}`)
      process.exit(1)
    }
    const yIhlal = checkChroma(y.value)
    if (yIhlal.length > 0) {
      console.log(`✗ ${marka.id}: '${ad}' yüzeyinde chroma sınırı aşıldı:`)
      console.log(formatChroma(yIhlal))
      process.exit(1)
    }
    yuzeyCss.push(toSurfaceCss(ad, y.value))
  }
  // Konsol yüzeyi AÇIKÇA yayılır, `:root`a güvenilmez: stüdyo levhasının içinde bir
  // konsol adası (§12.4) rolleri geri alabilmeli. `:root` yalnız varsayılandır.
  yuzeyCss.unshift(toSurfaceCss('console', sonuc.value))

  const MARKA = marka.id
  const CIKTI_DIR = join(REPO, `brand/${MARKA}/derived-tokens`)
  const eraSlug = readFileSync(join(REPO, `brand/${MARKA}/current`), 'utf8').trim()
  // ── `frame.md` — tasarım sistemini KAMERA BAĞLAMINA çeviren katman (§7.4) ──
  //
  // **İki kaynak, ikisi de tek:** renk rolleri MARKAYA ait (`brand/<id>/tokens/`),
  // tip ölçeği · boşluk · hareket süreleri SİSTEME ait (`packages/ui/src/theme.css`).
  // Ayrım keyfi değil: kabuk marka-NÖTR (§4b) ve her markanın kendi tip ölçeğini
  // tanımlaması, "iki tasarım sistemi" demek olurdu. Hareket kompozisyonu ikisini de
  // görmek zorunda — bu dosya onları YAN YANA getirir, KOPYALAMAZ.
  const temaCss = readFileSync(join(REPO, 'packages/ui/src/theme.css'), 'utf8')
  // ⚠ **İLK tanım kazanır.** `theme.css` süreleri `@media (prefers-reduced-motion)`
  // altında `0ms`e çeviriyor ve ilk sürüm ikisini de tabloya yazdı: aynı değişken
  // hem `320ms` hem `0ms` göründü. Kompozisyon yazarı için bu, cevabı olmayan bir
  // soru — ve tablonun tamamına olan güveni siler.
  const olcekCikar = (onEk) => {
    const gorulen = new Set()
    const out = []
    for (const m of temaCss.matchAll(new RegExp(`--(${onEk}-[\\w-]+):\\s*([^;]+);`, 'g'))) {
      if (gorulen.has(m[1])) continue
      gorulen.add(m[1])
      out.push({ ad: m[1], deger: m[2].trim() })
    }
    return out
  }

  const tipler = olcekCikar('size')
  const bosluklar = olcekCikar('space')
  const sureler = olcekCikar('dur')

  // **Boş çıkarım SESSİZ geçmez.** Bir regex `theme.css` yeniden biçimlendiğinde
  // sessizce hiçbir şey bulmaz ve `frame.md` boş bir tabloyla üretilir — hareket
  // katmanı ölçüsüz kalır ve kimse fark etmez. Kapı burada, üretim anında.
  for (const [ad, liste] of [
    ['tip ölçeği', tipler],
    ['boşluk', bosluklar],
    ['hareket süresi', sureler],
  ]) {
    if (liste.length === 0) {
      console.log(`✗ frame.md: ${ad} theme.css'ten çıkarılamadı — desen bayatlamış`)
      process.exit(1)
    }
  }

  const roller = sonuc.value.filter((t) => t.tier === 'role')
  const tablo = (basliklar, satirlar) =>
    `| ${basliklar.join(' | ')} |\n|${basliklar.map(() => '---').join('|')}|\n${satirlar.join('\n')}\n`

  const frame =
    '<!-- ÜRETİLMİŞ — elle düzenleme (R-65). Kaynak: brand/<id>/tokens/ + theme.css -->\n' +
    `# frame.md — ${MARKA} · ${eraSlug}\n\n` +
    'Hareket kompozisyonları bu tanımları kullanır. **İkinci bir palet ve ikinci bir\n' +
    'ölçek YOKTUR**: hareket için ayrı renk ya da ayrı tip ölçeği tanımlamak, iki marka\n' +
    'gerçeği demektir (§7.4, §4.1).\n\n' +
    '## Renk rolleri — MARKAYA ait\n\n' +
    'Kaynak `brand/<id>/tokens/`. Ham rampaya (`ramp.*`) kompozisyon ASLA dokunmaz;\n' +
    'yüzey değiştiğinde rol değişir, kompozisyon değişmez (§4.1).\n\n' +
    tablo(
      ['Rol', 'CSS değişkeni'],
      roller.map((t) => `| \`${t.path}\` | \`var(--${t.path.replace(/\./g, '-')})\` |`)
    ) +
    '\n## Tip ölçeği — SİSTEME ait\n\n' +
    'Dokuz boyut, kabuk marka-nötr olduğu için markadan bağımsız (§12.2). Ölçülen her\n' +
    'sayı mono ve tabular; ağırlık 700 konsolda YASAK.\n\n' +
    tablo(
      ['Değişken', 'Değer'],
      tipler.map((t) => `| \`--${t.ad}\` | ${t.deger} |`)
    ) +
    '\n## Boşluk — 4px temel birim\n\n' +
    'Yalnız bu adımlar; 5 ve 7 YOKTUR. İçerik sığmıyorsa tip küçültülmez, satır\n' +
    'gevşer (§12.3).\n\n' +
    tablo(
      ['Değişken', 'Değer'],
      bosluklar.map((t) => `| \`--${t.ad}\` | ${t.deger} |`)
    ) +
    '\n## Hareket — beyaz liste\n\n' +
    "**Hiçbiri 320ms'yi geçmez** (§12.7). Animasyonlanan altı şey: yüzey geçişi,\n" +
    'dialog açılışı, satır vurgusu, durum noktası, ilerleme rayı, odak halkası.\n' +
    'Sayı animasyonu, liste yeniden sıralama, skeleton parıltısı ve grafik çizilme\n' +
    '**yasak** — hareket dikkat çeker ve dikkat sınırlı bir bütçedir.\n\n' +
    '`prefers-reduced-motion: reduce` altında üçü de **0ms** olur. Tablo `:root`\n' +
    'değerlerini gösterir; ezme gizlenmiyor, ayrı bir gerçek olarak burada yazıyor.\n\n' +
    tablo(
      ['Değişken', 'Değer'],
      sureler.map((t) => `| \`--${t.ad}\` | ${t.deger} |`)
    )

  const ciktilar = {
    'tokens.css': toCss(sonuc.value) + '\n' + yuzeyCss.join('\n'),
    'tailwind-theme.ts': toTailwind(sonuc.value),
    'brand-facts.json': toBrandFacts(sonuc.value, { brandId: MARKA, eraSlug }),
    'frame.md': frame,
  }

  let farkli = 0
  mkdirSync(CIKTI_DIR, { recursive: true })
  for (const [ad, icerik] of Object.entries(ciktilar)) {
    const yol = join(CIKTI_DIR, ad)
    const mevcut = existsSync(yol) ? readFileSync(yol, 'utf8') : null
    if (mevcut === icerik) continue
    farkli++
    if (kontrol) console.log(`    ✗ ${MARKA}/${ad} güncel değil`)
    else writeFileSync(yol, icerik)
  }

  toplamToken += sonuc.value.length
  toplamFarkli += farkli
  raporlar.push(
    `${MARKA}: ${sonuc.value.length} token · ${dosyaSayisi} kaynak` +
      (marka.parent === null
        ? ' · kök marka'
        : ` · ${marka.parent}'ten devralıyor, ${devralinan} ezme`)
  )
}

for (const r of raporlar) console.log(`  ${r}`)

if (kontrol) {
  if (toplamFarkli > 0) {
    console.log(`\n${toplamFarkli} üretilmiş dosya güncel değil — 'just tokens' çalıştır (R-65)`)
    process.exit(1)
  }
  console.log(
    `  ${MARKALAR.length} marka · ${toplamToken} token · 3 kademe + chroma sınırları ` +
      `zorlanıyor · çıktılar güncel`
  )
} else {
  console.log(
    `  ${MARKALAR.length} marka · ${toplamToken} token · ${toplamFarkli} dosya güncellendi`
  )
}
