#!/usr/bin/env node
// Kör kabul — referanslarla AYNI SINIFTA mıyız (FAZ-13.6 · §7.1 · D-255).
//
// ⚠ ⚠ **`just docs` bunu ÜRETMEZ ve üretmemeli.** Belge üretimi deterministik ve
// bedavadır; bu betik model çağırıyor. `docs-drift` kapısı yalnız `just docs`in yazdığı
// dosyalara bakıyor, bu yüzden çıktı orada sürüklenme yaratmıyor. Elle düzenlenmez —
// üreteci burasıdır (R-65'in ruhu).
//
// ⚠ ⚠ **YARGIÇ KÖR: iki taraf da GRAMERSİZ yargılanıyor.** Prompt normalde bizim
// gramerimizi anlatıyor (*"kırpılmış dev rakam bir tasarım ögesidir"*); referansı o
// bağlamla yargılatmak yargıcı bizim şablonumuza ayarlamak olurdu ve sınav kendi kendini
// onaylardı. `gramer: false` ikisine de uygulanıyor.
//
// ⚠ **Sıra KARIŞTIRILIYOR ve etiket YOK.** Model dosya adını görmüyor: her görsel geçici
// bir ada kopyalanıyor. Adında `ornek-` geçen bir dosyaya "referans" muamelesi yapma
// ihtimali, körlüğü kâğıt üstünde bırakırdı.
//
// ⚠ ⚠ **TEK KOŞU BİR ÖLÇÜM DEĞİLDİR — ve bu ölçülerek öğrenildi.** İlk iki koşuda AYNI
// referans görselleri farklı puan aldı: `ornek-2` 3,0 → 2,5; `ornek-5` bir koşuda hiç
// puanlanamadı, ötekinde 2,5. Ortalama sapma ~0,25, en büyüğü 0,50 — yani yargıcın kendi
// gürültüsü, ölçmeye çalıştığımız farkla AYNI BÜYÜKLÜKTE. R-80'in mantığı burada da
// geçerli: aynı girdiye iki farklı cevap veren bir ölçüm yeşil değildir.
// Bu yüzden her görsel `--tekrar K` kez puanlanıp **medyan** alınıyor ve **yayılım**
// raporlanıyor. Yayılımı gizleyen tek bir sayı, olmayan bir kesinlik iddia ederdi.

import { copyFileSync, mkdirSync, mkdtempSync, readdirSync, writeFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { join, dirname } from 'node:path'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'

const REPO = process.env['SUITE_REPO'] ?? join(dirname(fileURLToPath(import.meta.url)), '..')
const E = await import(join(REPO, 'packages/engine/dist/index.js'))

const IKILI = process.env['SUITE_CLAUDE_BIN'] ?? 'claude'
const MODEL = process.env['SUITE_CLAUDE_MODEL'] ?? 'claude-sonnet-5'

// ⚠ Deterministik karıştırma: `Math.random` yasak (R-06) ve burada gereksiz — amaç
// rastgelelik değil, dosya adı ile sıra arasındaki bağı koparmak.
const karistir = (liste) =>
  [...liste]
    .map((x, i) => ({ x, k: (i * 7919) % liste.length }))
    .sort((a, b) => a.k - b.k)
    .map((o) => o.x)

const yargila = (yol, boyut) => {
  const p = E.tasarimYargiPromptu({
    yol,
    slayt: 1,
    toplam: 1,
    genislik: boyut.genislik,
    yukseklik: boyut.yukseklik,
    gramer: false,
  })
  const ham = execFileSync(
    IKILI,
    ['-p', p, '--model', MODEL, '--allowedTools', 'Read', '--output-format', 'json'],
    { maxBuffer: 20e6, timeout: 300000 }
  ).toString()
  const o = JSON.parse(ham)
  if (o.is_error) return { hata: String(o.result).slice(0, 200) }
  const y = E.tasarimYargisinaCevir(o, 1, boyut)
  return { yargi: y, toplam: E.toplamPuan(y), reddedilen: y.reddedilen }
}

const tekrarArg = process.argv.indexOf('--tekrar')
const TEKRAR = tekrarArg === -1 ? 3 : Math.max(1, Number(process.argv[tekrarArg + 1]) || 3)

const medyan = (xs) => {
  const s = [...xs].sort((a, b) => a - b)
  const m = Math.floor(s.length / 2)
  return s.length % 2 === 1 ? s[m] : Math.round(((s[m - 1] + s[m]) / 2) * 100) / 100
}

const bizimDizin = process.argv[2]
if (bizimDizin === undefined) {
  console.log('kullanım: node scripts/kor-kabul.mjs <bizim-slaytlarin-dizini>')
  process.exit(1)
}

const refDizin = join(REPO, 'docs/referans/ornekler')
const referanslar = readdirSync(refDizin)
  .filter((f) => f.endsWith('.jpg'))
  .map((f) => ({ etiket: 'referans', ad: f, yol: join(refDizin, f) }))
const bizim = readdirSync(bizimDizin)
  .filter((f) => f.endsWith('.png'))
  .map((f) => ({ etiket: 'bizim', ad: f, yol: join(bizimDizin, f) }))

if (referanslar.length === 0 || bizim.length === 0) {
  console.log('✗ kör kabul: karşılaştırılacak görsel yok')
  process.exit(1)
}

// Etiket körlüğü: dosya adı yargıca sızmasın.
const kutu = mkdtempSync(join(tmpdir(), 'kor-kabul-'))
const hepsi = karistir([...referanslar, ...bizim]).map((x, i) => {
  const kor = join(kutu, `k${String(i).padStart(2, '0')}.${x.yol.endsWith('.jpg') ? 'jpg' : 'png'}`)
  copyFileSync(x.yol, kor)
  return { ...x, kor }
})

const sonuclar = []
for (const x of hepsi) {
  const koslar = []
  const retler = []
  for (let k = 0; k < TEKRAR; k += 1) {
    const bir = yargila(x.kor, { genislik: 1080, yukseklik: 1350 })
    if (typeof bir.toplam === 'number') koslar.push(bir.toplam)
    else retler.push(...(bir.reddedilen ?? [bir.hata ?? 'bilinmeyen']))
  }
  const r =
    koslar.length === 0
      ? { toplam: null, reddedilen: retler, kosular: [] }
      : {
          toplam: medyan(koslar),
          yayilim: Math.round((Math.max(...koslar) - Math.min(...koslar)) * 100) / 100,
          kosular: koslar,
          reddedilen: retler,
        }
  sonuclar.push({ ...x, ...r })
  // ⚠ `toplam === null` SEBEPSİZ basılmamalı: ilk koşuda `ornek-5` yalnız `—` yazdı ve
  // sebebi (hangi kategori puanlanmadı) görünmedi. Ölçülemeyen bir ölçümün sebebi,
  // ölçümün kendisi kadar önemlidir.
  const not = r.toplam === null ? ` ← ${(r.reddedilen ?? []).join('; ').slice(0, 120)}` : ''
  console.log(
    `  ${x.etiket.padEnd(9)} ${x.ad.padEnd(14)} medyan ${r.toplam ?? '—'}` +
      ` (${(r.kosular ?? []).join(', ')}) yayılım ${r.yayilim ?? '—'}${not}`
  )
}

const puan = (e) =>
  sonuclar.filter((s) => s.etiket === e && typeof s.toplam === 'number').map((s) => s.toplam)
const karar = E.ayniAralikta(puan('bizim'), puan('referans'))

const md = ['# Kör kabul defteri', '']
md.push('<!-- ÜRETİLMİŞ — `node scripts/kor-kabul.mjs <dizin>`. Elle düzenleme kaybolur. -->')
md.push('')
md.push('Yargıç **kör**: iki taraf da gramersiz promptla, karıştırılmış sırada ve')
md.push('etiketsiz dosya adlarıyla puanlandı. Beklenen sonuç üstünlük değil **aynı aralık**.')
md.push('')
md.push(`Her görsel **${TEKRAR} kez** puanlandı; tabloda **medyan** ve **yayılım** var.`)
md.push('Tek koşu bir ölçüm değildir: aynı görsel iki koşuda 0,5 puana kadar fark aldı.')
md.push('')
md.push('| Kaynak | Görsel | Medyan (0–5) | Yayılım | Koşular |')
md.push('|---|---|---|---|---|')
for (const s of sonuclar)
  md.push(
    `| ${s.etiket} | \`${s.ad}\` | ${s.toplam ?? 'ölçülemedi'} | ${s.yayilim ?? '—'} | ${(s.kosular ?? []).join(', ') || (s.reddedilen ?? []).join('; ').slice(0, 60)} |`
  )
md.push('')
if (karar !== null) {
  md.push(`**Bizim aralık:** ${karar.bizimAralik[0]}–${karar.bizimAralik[1]} · `)
  md.push(`**Referans aralık:** ${karar.referansAralik[0]}–${karar.referansAralik[1]}`)
  md.push('')
  md.push(karar.ayni ? '✅ **Aynı sınıftayız** — aralıklar örtüşüyor.' : '⚠ **Aralıklar ayrık.**')
  md.push('')
  md.push('⚠ Bizimki daha YÜKSEK çıkarsa bu iyi haber değildir: yargıcın bizim şablonumuza')
  md.push('aşırı uyduğunun işareti olabilir ve o durumda sınanacak şey yargıçtır.')
  md.push('')
  const enYayilim = Math.max(...sonuclar.map((s) => s.yayilim ?? 0))
  md.push(`⚠ **Yargıcın kendi gürültüsü:** en büyük yayılım **${enYayilim}** puan.`)
  md.push('İki grup arasındaki fark bu gürültüden küçükse, fark ÖLÇÜLMÜŞ sayılmaz.')
  md.push('')
  // ⚠ Grup başına ORTALAMA YAYILIM: yargıcın hangi girdide kararlı olduğunu söylüyor.
  // Bizim çıktımızda gürültü sistematik olarak düşükse, bu bizim iyi olduğumuzu değil
  // yargıcın BİZE ALIŞIK olduğunu gösterebilir — adımın kendi uyarısının sayısal hâli.
  const ortYayilim = (e) => {
    const v = sonuclar.filter((s) => s.etiket === e).map((s) => s.yayilim ?? 0)
    return v.length === 0 ? 0 : Math.round((v.reduce((a, b) => a + b, 0) / v.length) * 100) / 100
  }
  md.push(`⚠ **Grup başına ortalama yayılım:** bizim **${ortYayilim('bizim')}** ·`)
  md.push(`referans **${ortYayilim('referans')}**. Bizimki belirgin şekilde düşükse bu`)
  md.push('iyi olduğumuzun değil, **yargıcın bizim şablonumuza alışık olduğunun** işareti')
  md.push('olabilir; o durumda sınanacak şey çıktı değil yargıçtır.')
}
md.push('')
mkdirSync(join(REPO, 'docs/referans'), { recursive: true })
writeFileSync(join(REPO, 'docs/referans/kor-kabul.md'), md.join('\n').replace(/\n{3,}/g, '\n\n'))
console.log(`\n  kor-kabul.md yazıldı · ${sonuclar.length} görsel`)
if (karar !== null)
  console.log(
    `  bizim ${karar.bizimAralik.join('–')} · referans ${karar.referansAralik.join('–')} · ${karar.ayni ? 'AYNI SINIF' : 'AYRIK'}`
  )
