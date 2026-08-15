#!/usr/bin/env node
// GROUP: fast
// Kısıtlı JSON Schema profili (§3.3 · FAZ-1.3).
//
// Tek şema DÖRT hedefe derlenir: rjsf formu · TS tipi · katı LLM şeması · SQLite DDL.
// Profil dışı bir anahtar bu dördünden en az birini SESSİZCE bozar — çıktı üretilir,
// kimse fark etmez. Yasak listesi ve gerekçeleri `registry/PROFILE.md`'de.
//
// KENDİ KENDİNİ TEST EDER: henüz hiç varlık tipi yokken bu kapı denetleyecek dosya
// bulamaz ve yeşil raporlardı — yani doğduğu gün işe yaramadığı hâlde çalışıyor
// görünürdü. Aşağıdaki iki fixture, denetleyicinin gerçekten çalıştığını her koşuda
// kanıtlar; kanıtlayamazsa kapı kırmızıdır (R-71).

import { readFileSync, globSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const REPO = join(dirname(fileURLToPath(import.meta.url)), '../..')
const p = (f) => join(REPO, f)

/** `registry/PROFILE.md` ile birebir aynı liste. Ayrışırsa aşağıdaki kontrol yakalar. */
const YASAK = [
  'oneOf',
  'not',
  'if',
  'then',
  'else',
  'patternProperties',
  'unevaluatedProperties',
  '$dynamicRef',
  '$dynamicAnchor',
  'dependentSchemas',
  'propertyNames',
  'contains',
  'minContains',
  'maxContains',
]

/** YAML anahtarı olarak geçen yasak sözcükleri bulur. Yorum satırları atlanır. */
const ihlalleriBul = (text) => {
  const found = []
  text.split('\n').forEach((line, i) => {
    if (/^\s*#/.test(line)) return
    const m = line.match(/^\s*(\$?[A-Za-z][A-Za-z0-9$_]*)\s*:/)
    if (m && YASAK.includes(m[1])) found.push({ line: i + 1, key: m[1] })
  })
  return found
}

const errors = []

// ── 1. denetleyicinin kendisi çalışıyor mu (öz-test) ─────────────────────────
const TEMIZ_FIXTURE = `
type: object
additionalProperties: false
properties:
  kind:
    type: string
    enum: [saas, bespoke]
  # burada oneOf: kelimesi yorumda geçiyor, ihlal değil
required: [kind]
`
const KIRLI_FIXTURE = `
type: object
oneOf:
  - properties: { kind: { const: saas } }
`
if (ihlalleriBul(TEMIZ_FIXTURE).length !== 0) {
  errors.push('öz-test: temiz fixture yanlış pozitif verdi — denetleyici fazla agresif')
}
{
  const bad = ihlalleriBul(KIRLI_FIXTURE)
  if (bad.length !== 1 || bad[0]?.key !== 'oneOf') {
    errors.push('öz-test: kirli fixture yakalanmadı — denetleyici çalışmıyor')
  }
}

// ── 2. PROFILE.md yasak listesiyle senkron mu ────────────────────────────────
const PROFILE = 'registry/PROFILE.md'
if (!existsSync(p(PROFILE))) {
  errors.push(`${PROFILE} yok — profil tanımı olmadan kapı anlamsız`)
} else {
  const doc = readFileSync(p(PROFILE), 'utf8')
  const eksik = YASAK.filter((k) => !doc.includes(`\`${k}\``))
  if (eksik.length) {
    errors.push(`${PROFILE} kapıyla ayrışmış — belgede geçmeyen yasak anahtar: ${eksik.join(', ')}`)
  }
}

// ── 3. gerçek varlık tipleri ────────────────────────────────────────────────
const tipler = globSync('registry/entity-types/*.type.yaml', { cwd: REPO })
for (const rel of tipler) {
  for (const { line, key } of ihlalleriBul(readFileSync(p(rel), 'utf8'))) {
    errors.push(`${rel}:${line}  profil dışı anahtar '${key}' — bkz. ${PROFILE}`)
  }
}

// ── 4. R-40: pipeline'da MODEL ADI geçemez ──────────────────────────────────
// Pipeline yetenek ister, model istemez. Model ID'si bir pipeline'a girdiği gün, o
// sağlayıcının emekliye ayrıldığı gün pipeline kırılır — ve emeklilik haber vermez.
// Desen ERİŞİMİ yakalar (model/sağlayıcı adı geçen bir alan), BİÇİMİ değil.
const MODEL_DESENLERI = [
  // Sağlayıcı/model aileleri. Yorumda geçmeleri meşru (R-40'ı ANLATAN yorum gibi),
  // bu yüzden yalnız ANAHTAR DEĞERİ konumunda aranır.
  // Model aileleri. ⚠ İlk liste `ideogram`, `recraft`, `kling`, `veo`, `qwen`,
  // `seedream` ve `nano-banana`yı TANIMIYORDU — faz dosyasının kendi metninde geçen
  // Ideogram dahil (D-143). Denylist doğası gereği eksiktir; bu yüzden ikinci savunma
  // ANAHTAR desenidir ve o da genişletildi.
  /\b(gpt|claude|gemini|flux|imagen|sora|dall-?e|midjourney|stable-?diffusion|llama|whisper|elevenlabs|chatterbox|ideogram|recraft|kling|veo|qwen|seedream|nano-?banana|runway|luma|pika|hailuo|minimax|wan|hunyuan|mistral|deepseek|grok)\b/i,
  // Doğrudan sağlayıcı yönlendirmesi
  /\b(fal-ai|openrouter|replicate|anthropic|openai)\b/i,
]
/** `model:`, `provider:`, `model_id:` gibi anahtarlar tek başına bile ihlal. */
// ⚠ Anchor `^\s*-?\s*(model|…)` idi ve `video_model:` / `fallback_engine:` gibi ÖN EKLİ
// adları kaçırıyordu. Artık ad İÇİNDE arıyor: `\w*` iki yandan da açık.
const YASAK_ANAHTARLAR =
  /^\s*-?\s*\w*(model|model_id|modelId|provider|provider_id|engine|adapter|checkpoint|lora)\w*\s*:/i

const pipelinelar = globSync('registry/pipelines/*.pipeline.yaml', { cwd: REPO })
for (const rel of pipelinelar) {
  const satirlar = readFileSync(p(rel), 'utf8').split('\n')
  satirlar.forEach((satir, i) => {
    // Yorum satırı atlanır: R-40'ı açıklayan yorumun kuralı ihlal etmesi saçma olurdu.
    const kod = satir.replace(/#.*$/, '')
    if (kod.trim() === '') return
    if (YASAK_ANAHTARLAR.test(kod)) {
      errors.push(`${rel}:${i + 1}  R-40 — pipeline'da sağlayıcı/model anahtarı: ${kod.trim()}`)
      return
    }
    // Değer konumu: `anahtar: deger`. Anahtar adının kendisi değil, DEĞERİ taranır.
    const deger = kod.includes(':') ? kod.slice(kod.indexOf(':') + 1) : ''
    for (const d of MODEL_DESENLERI) {
      if (d.test(deger)) {
        errors.push(`${rel}:${i + 1}  R-40 — model/sağlayıcı adı: ${kod.trim()}`)
        break
      }
    }
  })
}
if (pipelinelar.length === 0) {
  errors.push('registry/pipelines/ boş — R-40 kapısı denetleyecek dosya bulamıyor')
}

if (errors.length) {
  console.log(errors.map((e) => `  ${e}`).join('\n'))
  console.log(`\n${errors.length} kayıt defteri ihlali`)
  process.exit(1)
}

console.log(
  `  profil ${YASAK.length} anahtar yasaklıyor · öz-test geçti · ${tipler.length} varlık tipi · ` +
    `${pipelinelar.length} pipeline R-40'a karşı denetlendi`
)
