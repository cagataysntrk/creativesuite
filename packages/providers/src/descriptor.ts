// Sağlayıcı tanımlayıcısı — YAML, Ring 1, çalışma anında düzenlenir (§8.1).
//
// **Tanımlayıcı VERİDİR, adaptör KODDUR.** Bir sağlayıcının fiyatı, yetenekleri ve
// kısıtları YAML'da yaşar; onunla konuşma biçimi (`ProviderAdapter`) TypeScript'te.
// Ayrım şu soruyla test edilir: "sağlayıcı yarın fiyatını değiştirse kod değişir mi?"
// Cevap hayır olmalı — yoksa her fiyat değişikliği bir sürüm çıkarmayı gerektirir.
//
// **Secret tanımlayıcıda YAŞAMAZ** (R-51): yalnız ortam değişkeninin ADI durur
// (`auth_env: FAL_KEY`). Değer `sops exec-env` ile gelir. Anahtarın kendisini buraya
// yazmak, onu git geçmişine yazmaktır — ve git geçmişi silinmez.

import { readFileSync, readdirSync } from 'node:fs'
import { basename, join } from 'node:path'
import { parseYaml } from '@suite/kernel'
import type { Lane } from './types.js'

export interface DescriptorCapability {
  readonly name: string
  readonly lanes: readonly Lane[]
  readonly supports: Readonly<Record<string, readonly (string | number | boolean)[]>>
}

export interface ProviderDescriptor {
  readonly id: string
  readonly title: string
  readonly enabled: boolean
  /**
   * Bu tanımlayıcıyı hangi adaptör uyguluyor. `pending` = adaptör henüz yazılmadı ve
   * bu AÇIKÇA söylenir — yönlendirici onu aday listesine almaz. Sessizce eksik bir
   * adaptör, çalıştırma anında "sağlayıcı yok" hatası demektir ve o an geç.
   */
  readonly adapter: string
  readonly capabilities: readonly DescriptorCapability[]
  /** Ortam değişkeninin ADI — değeri değil (R-51). `null` = kimlik gerekmiyor. */
  readonly authEnv: string | null
  /** `_pricing/` altındaki değişmez fiyat anlık görüntüsü. */
  readonly pricingSnapshot: string | null
  /**
   * Fiyat anlık görüntüsü DOĞRULANMIŞ mı (§8.3). Dosyadan okunur, tanımlayıcıda beyan
   * edilmez — sağlayıcının kendi fiyatını "doğrulanmış" ilan etmesi bir doğrulama değil.
   *
   * `parseDescriptor` tek başına bunu bilemez (dosyaya bakmaz) ve `false` bırakır;
   * `loadDescriptors` anlık görüntüyü okuyup düzeltir. Varsayılan **false**: bilinmeyen
   * fiyatı doğrulanmış saymak, tahmini yalan yapardı.
   */
  readonly pricingVerified: boolean
  /** Maliyet formülü — QuickJS'te FAZ-3.5'te koşacak; burada BEYAN. */
  readonly costFormula: string | null
  /**
   * Bedava katmanın TİCARİ kullanımı serbest mi (§7.5, §17 · FAZ-5.4).
   *
   * `false` ise sağlayıcı **hiçbir yetenekte `free` şeride konulamaz** — ücretsiz
   * olması ücretsiz KULLANILABİLİR olmasıyla aynı şey değil. ElevenLabs bedava
   * katmanı somut örnek: para almıyor ama ticari kullanıma izin de vermiyor.
   *
   * `null` = beyan YOK. Bedava şerit isteyen bir tanımlayıcı bunu beyan etmek
   * ZORUNDA; "bilmiyorum" ile "serbest" arasındaki farkı sessiz bırakmak, lisansı
   * olmayan bir sesle üretilmiş bir prospect videosu demektir ve o yayın geri alınamaz.
   */
  readonly freeTierCommercial: boolean | null
  /**
   * Ticari olmayan lisansın AÇIK kabulü (D-274).
   *
   * ⚠ İlk kural ticari olmayan lisansı bedava şeritten men ediyordu ve öncülü "bu
   * deponun çıktıları ticari olarak yayınlanıyor"du. Öncül yanlış: burası yerel, ticari
   * olmayan bir komuta merkezi. Koruma kaldırılmadı, doğru yere taşındı — asıl risk
   * YAYIN ve o kapıda insan duruyor. Burada istenen şey beyan.
   */
  readonly noncommercialAck: boolean
}

export type DescriptorError =
  | { readonly kind: 'invalid_yaml'; readonly message: string }
  | { readonly kind: 'missing_field'; readonly field: string }
  | { readonly kind: 'invalid_lane'; readonly lane: string }
  | { readonly kind: 'literal_secret'; readonly field: string }
  | { readonly kind: 'no_capabilities' }
  | { readonly kind: 'capability_is_verb'; readonly name: string }

export type DescriptorResult =
  | { readonly ok: true; readonly value: ProviderDescriptor }
  | { readonly ok: false; readonly errors: readonly DescriptorError[] }

const LANES: readonly string[] = ['free', 'premium']

/**
 * Fiil adları büyük harfli ve dokuz tane (§3.10). Yetenek adı ONLARDAN BİRİ OLAMAZ:
 * `image.generate` bir yetenektir, `GENERATE` bir fiil. Karıştırmak, pipeline'da
 * "GENERATE yeteneği" gibi anlamsız bir istek üretir ve yönlendirici hiçbir şey bulamaz.
 */
const VERB_LIKE = /^[A-Z]+$/

/** Anahtar gibi görünen değer — tanımlayıcıya yazılmış bir secret'ı yakalar (R-51). */
const SECRET_LIKE = /^(sk-|fal-|key-|Bearer\s|[A-Za-z0-9_-]{32,}$)/

const str = (v: unknown): string | null => (typeof v === 'string' && v.trim() !== '' ? v : null)

export const parseDescriptor = (text: string): DescriptorResult => {
  const y = parseYaml(text)
  if (!y.ok) return { ok: false, errors: [{ kind: 'invalid_yaml', message: y.message }] }
  const d = y.value
  if (d === null || typeof d !== 'object' || Array.isArray(d)) {
    return { ok: false, errors: [{ kind: 'invalid_yaml', message: 'eşleme değil' }] }
  }
  const map = d as Record<string, unknown>
  const errors: DescriptorError[] = []

  const id = str(map['id'])
  const title = str(map['title'])
  const adapter = str(map['adapter'])
  if (id === null) errors.push({ kind: 'missing_field', field: 'id' })
  if (title === null) errors.push({ kind: 'missing_field', field: 'title' })
  if (adapter === null) errors.push({ kind: 'missing_field', field: 'adapter' })

  const authEnv = str(map['auth_env'])
  if (authEnv !== null && SECRET_LIKE.test(authEnv)) {
    // Anahtarın KENDİSİ yazılmış. Bu dosya git'e giriyor ve git geçmişi silinmez.
    errors.push({ kind: 'literal_secret', field: 'auth_env' })
  }

  const hamYetenekler = Array.isArray(map['capabilities']) ? map['capabilities'] : null
  if (hamYetenekler === null || hamYetenekler.length === 0) {
    errors.push({ kind: 'no_capabilities' })
    return { ok: false, errors }
  }

  const capabilities: DescriptorCapability[] = []
  for (const ham of hamYetenekler) {
    const c = (typeof ham === 'object' && ham !== null ? ham : {}) as Record<string, unknown>
    const name = str(c['name'])
    if (name === null) {
      errors.push({ kind: 'missing_field', field: 'capabilities[].name' })
      continue
    }
    if (VERB_LIKE.test(name)) {
      errors.push({ kind: 'capability_is_verb', name })
      continue
    }
    const lanes = Array.isArray(c['lanes']) ? c['lanes'] : []
    for (const l of lanes) {
      if (typeof l !== 'string' || !LANES.includes(l)) {
        errors.push({ kind: 'invalid_lane', lane: String(l) })
      }
    }
    if (lanes.length === 0) errors.push({ kind: 'missing_field', field: `${name}.lanes` })
    const supports =
      typeof c['supports'] === 'object' && c['supports'] !== null
        ? (c['supports'] as Record<string, readonly (string | number | boolean)[]>)
        : {}
    capabilities.push({ name, lanes: lanes as readonly Lane[], supports })
  }

  if (errors.length > 0) return { ok: false, errors }
  return {
    ok: true,
    value: {
      id: id ?? '',
      title: title ?? '',
      adapter: adapter ?? '',
      enabled: map['enabled'] !== false,
      capabilities,
      authEnv,
      pricingSnapshot: str(map['pricing_snapshot']),
      pricingVerified: false,
      costFormula: str(map['cost_formula']),
      freeTierCommercial:
        typeof map['free_tier_commercial'] === 'boolean' ? map['free_tier_commercial'] : null,
      // ⚠ Ticari olmayan lisansın AÇIK kabulü (D-274). Beyan edilmemişse `false` ve
      // kapı reddediyor: sessiz kalan bir lisans riski en pahalı hatadır.
      noncommercialAck: map['noncommercial_ack'] === true,
    },
  }
}

/**
 * Fiyat anlık görüntüsünü okur ve `verified` bayrağını döner.
 *
 * Anlık görüntü yoksa `false`. Sıfır maliyetli sağlayıcılar da (`cost_formula: '0'`,
 * abonelikle ödenmiş) `false` alır ve bu DOĞRUDUR: sıfır bir fiyattır ve o fiyatın
 * gerçekten sıfır olduğu doğrulanmamıştır. Yanlış olsaydı `amber` yerine `green`
 * gösterip abonelik limitini görünmez kılardık.
 */
const snapshotVerified = (root: string, d: ProviderDescriptor): boolean => {
  if (d.pricingSnapshot === null) return false
  try {
    const ham: unknown = JSON.parse(readFileSync(join(root, d.pricingSnapshot), 'utf8'))
    return (ham as { verified?: unknown } | null)?.verified === true
  } catch {
    return false
  }
}

export const loadDescriptors = (
  root: string
): {
  readonly descriptors: readonly ProviderDescriptor[]
  readonly failures: readonly {
    readonly file: string
    readonly errors: readonly DescriptorError[]
  }[]
} => {
  let dosyalar: string[]
  try {
    dosyalar = readdirSync(root)
      .filter((f) => f.endsWith('.provider.yaml'))
      .sort()
  } catch {
    return { descriptors: [], failures: [] }
  }
  const descriptors: ProviderDescriptor[] = []
  const failures: { file: string; errors: readonly DescriptorError[] }[] = []
  for (const f of dosyalar) {
    const r = parseDescriptor(readFileSync(join(root, f), 'utf8'))
    if (!r.ok) {
      failures.push({ file: basename(f), errors: r.errors })
      continue
    }
    descriptors.push({ ...r.value, pricingVerified: snapshotVerified(root, r.value) })
  }
  return { descriptors, failures }
}

/**
 * Tanımlayıcı dosyalarının özeti — **içerikten**, sürüm alanından değil (FAZ-4.6b).
 *
 * Sürüm numarasına güvenmek, sürümü artırmadan dosyayı düzenleyen herkesi görünmez
 * yapardı; ve tam o düzenleme (bir fiyatın değişmesi) donmuş planı geçersiz kılan şey.
 *
 * **Neden burada:** hem komuta merkezi (`launcherPlani`) hem üretim CLI'ı (`just uret`)
 * aynı özeti hesaplamak zorunda. İkisi ayrı hesaplasaydı `planStale` bir yüzeyde
 * "değişti" diğerinde "değişmedi" derdi — aynı dosya için iki gerçek.
 */
export const descriptorDigests = (
  providersDir: string,
  ids: readonly string[]
): Readonly<Record<string, string>> => {
  const out: Record<string, string> = {}
  for (const id of ids) {
    try {
      const metin = readFileSync(join(providersDir, `${id}.provider.yaml`), 'utf8')
      // Basit ama yeterli: içerik değişirse özet değişir. Kriptografik güç gerekmiyor —
      // bu bir bütünlük kontrolü değil, bir DEĞİŞİKLİK tespiti.
      let h = 5381
      for (let i = 0; i < metin.length; i++) h = ((h * 33) ^ metin.charCodeAt(i)) >>> 0
      out[id] = `d${h.toString(16)}`
    } catch {
      // Okunamayan tanımlayıcı özetsiz kalır: `planStale` onu "değişti" diye raporlamaz
      // (özet yoksa karşılaştırma da yok) ama `provider_unavailable` yakalar.
    }
  }
  return out
}
