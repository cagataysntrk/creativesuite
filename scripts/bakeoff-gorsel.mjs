#!/usr/bin/env node
// Görsel bake-off (FAZ-0.D.1) — hangi şerit ne üretiyor, ÖLÇÜLEREK.
//
// **Üretim yolunun kendisini kullanır, ham `curl` değil.** Bu bir üslup tercihi değil:
// bake-off'u kestirme bir yoldan koşarsak, ölçtüğümüz şey üretimin ürettiği şey olmaz
// ve "iyi çıktı" iddiası hiçbir şey kanıtlamaz. Zincir: `adapterById` → `validate()`
// (R-20 burada zorlanır) → `providerCall` → adaptör. `generateBody`nin izlediği yol.
//
// **Brief'ler corpus'tan türetildi**, uydurulmadı: konumlandırma üç ürün ve iki adımlı
// giriş anlatıyor; görseller o anlatının sahneleri. Uydurma bir brief, uydurma bir
// kaliteyi ölçer.
//
// **R-20:** hiçbir prompt metin istemez ve `buildImagePrompt` "no text" ekini KENDİ
// basar. Elle yazmak `suffix_hand_written` ile reddedilir — ek iki yerde yaşarsa
// biri güncellenir, diğeri unutulur.
//
// Kullanım:
//   sops exec-env secrets/secrets.enc.yaml 'node scripts/bakeoff-gorsel.mjs [--serit free]'

import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const REPO = process.env['SUITE_REPO'] ?? process.cwd()
// **Byte'lar `derived/`de, manifest `docs/`ta** (R-64 · D-38): 512KB üstü varlık
// git'e girmez ve Git LFS yasak. Manifest küçük, izlenir ve kararın kaydıdır;
// byte'lar yeniden üretilemez ama sürümlenemez de.
const CIKTI = join(REPO, 'derived/bakeoff')
const MANIFEST_DIZINI = join(REPO, 'docs/research/bakeoff')

const { adapterById, loadDescriptors, saglayiciOrtami } = await import(
  join(REPO, 'packages/providers/dist/index.js')
)
const { providerCall } = await import(join(REPO, 'packages/engine/dist/index.js'))
const { seededRng, readEnv, systemClock } = await import(
  join(REPO, 'packages/kernel/dist/index.js')
)

const bayrak = (ad, varsayilan) => {
  const i = process.argv.indexOf(`--${ad}`)
  return i === -1 ? varsayilan : (process.argv[i + 1] ?? varsayilan)
}
const SERIT = bayrak('serit', 'free')

/**
 * On brief. Her biri corpus'taki bir iddianın GÖRSEL karşılığı.
 *
 * Prompt'lar İngilizce: görsel modelleri İngilizce'de belirgin biçimde daha iyi ve
 * **görselde Türkçe metin zaten YASAK** (R-20) — yani prompt dili çıktı diline
 * karışmıyor. Brief'in kendisi Türkçe çünkü onu insan okuyacak.
 */
const BRIEFLER = [
  {
    slug: 'uretim-hatti-olcum',
    brief: 'Üretim hattı — ölçüm noktaları görünür',
    prompt:
      'wide shot of a modern manufacturing production line, sensors and measurement ' +
      'points visible on machinery, cool neutral industrial lighting, clean composition, ' +
      'photographic, shallow depth of field',
  },
  {
    slug: 'kantar-tesis-girisi',
    brief: 'Kantar / tesis girişi — UpcyMan zemini',
    prompt:
      'industrial weighbridge at a facility entrance, truck on the scale, overcast daylight, ' +
      'documentary photographic style, muted colours, wide angle',
  },
  {
    slug: 'kontrol-odasi',
    brief: 'Kontrol odası — Dima karar motoru sahnesi',
    prompt:
      'industrial control room interior, large blank display panels glowing softly, ' +
      'operator chair, dark neutral instrument grey environment, cinematic lighting',
  },
  {
    // ⚠ **Bu brief DEĞİŞTİRİLDİ.** İlk hâli "two factory workers in safety vests"
    // diyordu ve iki YAPAY İNSAN üretti — 9. yasa ihlali (Md. 27/12). Kapı görmedi
    // çünkü `\bworker\b` deseni çoğulu kaçırıyordu (D-239). Sahne artık insansız:
    // vardiya devrini boş bir tezgâh ve iki kask anlatıyor.
    slug: 'vardiya-devri',
    brief: 'Vardiya devri — insansız anlatım',
    prompt:
      'two safety helmets resting on an empty workbench at a production line, ' +
      'end of shift, low warm light, no people, documentary photograph, shallow depth',
  },
  {
    slug: 'surdurulebilirlik-tesisi',
    brief: 'Sürdürülebilirlik — UpcyCarbon zemini',
    prompt:
      'industrial facility exterior at dawn, clean stacks, solar panels on the roof, ' +
      'calm sky, muted teal and grey palette, architectural photography',
  },
  {
    slug: 'fason-uretim-atolyesi',
    brief: 'Fason üretim atölyesi — maliyet ve kârlılık',
    prompt:
      'contract manufacturing workshop, metal parts organised in bins on shelves, ' +
      'neutral daylight, orderly composition, photographic, high detail',
  },
  {
    slug: 'veri-yoksa-kagit',
    brief: 'Veri yoksa — kâğıt ve dosya dolabı (asıl ayrıştırıcımız)',
    prompt:
      'old paper archive shelves and folders in a small factory office, dusty light ' +
      'through blinds, muted colours, documentary photograph, melancholic mood',
  },
  {
    slug: 'soyut-veri-akisi',
    brief: 'Soyut veri akışı — arka plan olarak kullanılabilir',
    prompt:
      'abstract flowing data streams as thin luminous lines over a dark neutral grey ' +
      'background, minimal, elegant, no interface elements, rendered',
  },
]

const adapter = adapterById('cloudflare-workers-ai')
if (adapter === null) {
  console.log('✗ cloudflare-workers-ai adaptörü bulunamadı')
  process.exit(1)
}

const { descriptors } = loadDescriptors(join(REPO, 'registry/providers'))
const env = saglayiciOrtami(descriptors, readEnv, ['CF_ACCOUNT_ID'])
if ((env['CF_API_TOKEN'] ?? '') === '') {
  console.log('✗ CF_API_TOKEN ortamda yok — `sops exec-env` ile çalıştırın')
  process.exit(1)
}

mkdirSync(CIKTI, { recursive: true })
mkdirSync(MANIFEST_DIZINI, { recursive: true })
const rng = seededRng(7)
// **Saat TEK yerden** (`saat` darboğazı, §3.8): `Date.now()` ikinci bir saat açardı
// ve replay'i bozardı. Süre ölçümü için ISO damgadan milisaniye türetiliyor.
const ms = () => Date.parse(systemClock.nowIso())
const baslangic = ms()
const satirlar = []

console.log(`── görsel bake-off · şerit ${SERIT} · ${BRIEFLER.length} brief ──\n`)

for (const [i, b] of BRIEFLER.entries()) {
  const etiket = `${String(i + 1).padStart(2)}/${BRIEFLER.length}  ${b.slug}`

  // Üretim yolu: `validate()` R-20'yi zorlar ve "no text" ekini KENDİ basar.
  const ham = {
    capability: 'image.generate',
    lane: SERIT,
    prompt: b.prompt,
    constraints: { aspect: '1:1', lane: SERIT },
    idempotencyKey: `bakeoff:${b.slug}`,
  }
  const dogrulanmis = adapter.validate(ham)
  if (!dogrulanmis.ok) {
    console.log(`  ✗ ${etiket} — prompt REDDEDİLDİ: ${JSON.stringify(dogrulanmis.error.details)}`)
    satirlar.push({ slug: b.slug, brief: b.brief, durum: 'prompt_reddedildi' })
    continue
  }

  const call = providerCall({
    adapter,
    input: dogrulanmis.value,
    ctx: { correlationId: `cor_bakeoff_${b.slug}`, env },
    rng,
  })
  const t0 = ms()
  const sonuc = await call({
    signal: new AbortController().signal,
    noteHandle: () => undefined,
    resumeExternalId: null,
  })
  const sure = ms() - t0

  if (!sonuc.ok) {
    console.log(`  ✗ ${etiket} — ${sonuc.error.code}`)
    satirlar.push({ slug: b.slug, brief: b.brief, durum: `hata:${sonuc.error.code}` })
    continue
  }

  // ⚠ Şekil ÖLÇÜLDÜ, varsayılmadı: ilk sürüm `sonuc.value.data.output` arıyordu ve
  // sekiz brief'in sekizi "şekil bozuk" verdi. Gerçek şekil `value.data` ve içinde
  // doğrudan `{format, data, width, height}` var (D-227 ailesi).
  const cikti = sonuc.value.data
  if (cikti?.format !== 'base64' || typeof cikti.data !== 'string') {
    console.log(`  ✗ ${etiket} — beklenmeyen çıktı şekli`)
    satirlar.push({ slug: b.slug, brief: b.brief, durum: 'sekil_bozuk' })
    continue
  }

  const bayt = Buffer.from(cikti.data, 'base64')
  const yol = join(CIKTI, `${SERIT}-${b.slug}.jpg`)
  writeFileSync(yol, bayt)

  console.log(
    `  ✓ ${etiket}  ${cikti.width}×${cikti.height} · ${(bayt.length / 1024).toFixed(0)} KB · ${(sure / 1000).toFixed(1)} sn`
  )
  satirlar.push({
    slug: b.slug,
    brief: b.brief,
    durum: 'uretildi',
    dosya: `${SERIT}-${b.slug}.jpg`,
    genislik: cikti.width,
    yukseklik: cikti.height,
    bayt: bayt.length,
    sureMs: sure,
    // **Prompt kaydedilir.** Hangi görselin hangi istekten geldiği sonradan
    // hatırlanamaz ve hatırlanamayan bir ölçüm tekrar edilemez.
    prompt: dogrulanmis.value.prompt,
    maliyetMikros: sonuc.value.amount?.micros?.toString() ?? '0',
  })
}

const uretilen = satirlar.filter((s) => s.durum === 'uretildi')
const manifest = {
  kosum: 'bakeoff-gorsel',
  serit: SERIT,
  saglayici: adapter.id,
  alinan: systemClock.nowIso(),
  toplamSureMs: ms() - baslangic,
  uretilen: uretilen.length,
  toplam: BRIEFLER.length,
  _not:
    'Metin tespiti MEKANİK olarak yapılmadı (tesseract kurulu değil) — görseller ' +
    'insan/agent gözüyle denetlendi. Ölçülmeyen bir şeyi ölçülmüş göstermemek için ' +
    'bu satır burada duruyor.',
  satirlar,
}
writeFileSync(
  join(MANIFEST_DIZINI, `manifest-${SERIT}.json`),
  `${JSON.stringify(manifest, null, 2)}\n`
)

console.log(
  `\n${uretilen.length}/${BRIEFLER.length} üretildi · ` +
    `${((ms() - baslangic) / 1000).toFixed(1)} sn · ${CIKTI.replace(`${REPO}/`, '')}/`
)
console.log('  ⚠ Metin tespiti mekanik DEĞİL (tesseract yok) — görsellere bakılarak denetlenir.')
