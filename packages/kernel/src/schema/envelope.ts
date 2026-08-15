// Kayıt zarfının ÇALIŞMA ZAMANI şeması (§3.2 · D-41).
//
// `packages/contracts` derleme zamanı gerçeğini tutar ve hiçbir şey import etmez (§3.1);
// bu yüzden Zod burada, Ring 0'da yaşar (D-57).
//
// İkiye bölünmüş bir gerçek, ayrışan bir gerçektir. Bu dosyanın sonundaki üç tip
// iddiası, şema ile tipin ayrışmasını DERLEME HATASINA çevirir: alan eklenip şemaya
// yazılmazsa veya şemaya fazladan alan girerse `tsc` düşer. Bir zarf alanının sessizce
// doğrulanmaması, retrieval yükleminin okuduğu bir alanın hiç kontrol edilmemesi demektir.

import { z } from 'zod'
import {
  RECORD_KINDS,
  RECORD_ZONES,
  RECORD_STATUSES,
  SOURCE_KINDS,
  type RecordEnvelope,
} from '@suite/contracts'

const ts = () => z.iso.datetime({ offset: true })
const nullableTs = () => ts().nullable()

export const RecordSourceSchema = z
  .object({
    kind: z.enum([...SOURCE_KINDS]),
    ref: z.string().min(1),
    // Kelimesi kelimesine alıntı. Özet DEĞİL — özet, iddiayı doğrulanamaz kılar (§11.4).
    quote: z.string().nullable(),
  })
  .readonly()

export const RecordScopeSchema = z
  .object({
    channels: z.array(z.string()).readonly(),
    verticals: z.array(z.string()).readonly(),
    personas: z.array(z.string()).readonly(),
  })
  .readonly()

export const RecordEnvelopeSchema = z
  .object({
    id: z.string().min(1),
    brand_id: z.string().min(1),
    type: z.string().min(1),
    schema_version: z.int().nonnegative(),
    kind: z.enum([...RECORD_KINDS]),
    zone: z.enum([...RECORD_ZONES]),
    status: z.enum([...RECORD_STATUSES]),
    locale: z.string().min(2),
    era_id: z.string().min(1),

    created_at: ts(),

    // Bi-temporal geçerlilik (§5.2). `null` = sınırsız.
    valid_at: nullableTs(),
    invalid_at: nullableTs(),
    expired_at: nullableTs(),
    re_verify_by: nullableTs(),

    supersedes: z.array(z.string()).readonly(),
    superseded_by: z.string().nullable(),

    confidence: z.number().min(0).max(1),

    approved_by: z.string().nullable(),
    approved_at: nullableTs(),

    source: RecordSourceSchema,
    scope: RecordScopeSchema,
    tags: z.array(z.string()).readonly(),

    context_weight: z.number().min(0),
    x_signature: z.string().nullable(),

    // Kullanıcının tanımladığı bölge. DİSKTE düz bir kayıttır; TİP sisteminde
    // `OpaqueAttributes`'tır. Ayrım kasıtlı: doğrulayıcı içeriği görmek zorunda,
    // kernel görmemek zorunda. Açan tek yer: registry/src/attributes.ts.
    attributes: z.record(z.string(), z.unknown()),
  })
  .readonly()

// ── şema ↔ tip ayrışma bekçisi ───────────────────────────────────────────────
// `attributes` bilerek hariç: diskte düz kayıt, tipte opak marka.

type SchemaShape = Omit<z.infer<typeof RecordEnvelopeSchema>, 'attributes'>
type ContractShape = Omit<RecordEnvelope, 'attributes'>

// DİKKAT: `A extends B` TEK YÖNLÜDÜR. A'nın FAZLADAN alanı olması onu B'ye atanabilir
// olmaktan çıkarmaz — yani tek bir `extends` kontrolü, zarfa eklenip şemaya eklenmeyen
// bir alanı KAÇIRIR. İlk sürüm tam olarak bunu yapıyordu ve yeşil raporluyordu (R-71).
// Bu yüzden tip uyumunun yanına AYRICA iki yönlü alan kümesi kontrolü kondu.
type TipSemayaUyuyor = ContractShape extends SchemaShape ? true : never

// TERS YÖN (`SchemaShape extends ContractShape`) DENENDİ VE KALDIRILDI: şema düz
// `string` üretir, sözleşme markalı `RecordId`/`EraId` ister; ters yön TASARIM GEREĞİ
// asla doğru olamaz. Sabit yazıldığında temiz repoda bile kırmızı verdi — ve daima
// kırmızı bir kapı, daima yeşil bir kapı kadar işe yaramaz. Tip uyumu tek yönden,
// alan kümesi eşitliği aşağıdaki iki `Exclude` ile denetlenir.

// Aynı şeyi anahtar kümesi üzerinden de söyler: hata mesajı daha okunur olsun diye.
type FazlaAlanYok = Exclude<keyof SchemaShape, keyof ContractShape> extends never ? true : never
type EksikAlanYok = Exclude<keyof ContractShape, keyof SchemaShape> extends never ? true : never

/**
 * Bu üçü derlenmiyorsa şema ile `RecordEnvelope` ayrışmıştır.
 * `never` atanamaz — hata mesajı kısadır ama sebep tektir: zarfı değiştirdin,
 * şemayı değiştirmedin (veya tersi).
 */
export const TIP_SEMAYA_UYUYOR: TipSemayaUyuyor = true
export const SEMADA_FAZLA_ALAN_YOK: FazlaAlanYok = true
export const SEMADA_EKSIK_ALAN_YOK: EksikAlanYok = true

/** JSON Schema 2020-12 çıktısı — `schemas/` altına üretilir ve commit'lenir. */
export const envelopeJsonSchema = (): unknown =>
  z.toJSONSchema(RecordEnvelopeSchema, { target: 'draft-2020-12' })
