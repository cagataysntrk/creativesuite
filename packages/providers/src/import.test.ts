import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { parseDescriptor } from './descriptor.js'
import { draftToYaml, importOpenApi } from './import.js'

// Fixture GERÇEK: fal'ın `fal-ai/flux/dev` endpoint'inden 2026-08-15'te çekildi (V-04).
// Elle yazılmış bir OpenAPI ile test etmek, yalnızca kendi hayalimizi doğrulardı.
const FAL = JSON.parse(
  readFileSync(join(import.meta.dirname, '../test-fixtures/fal-flux-dev.openapi.json'), 'utf8')
)

describe('OpenAPI içe aktarma', () => {
  it('gerçek fal şemasından yetenek ve enum çıkarıyor', () => {
    const r = importOpenApi(FAL)
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.value.id).toBe('fal-flux-dev')
    expect(r.value.capability).toBe('image.generate')
    // Şemada gerçekten var: output_format ve acceleration enum'ları
    expect(r.value.supports['output_format']).toEqual(['jpeg', 'png'])
    expect(r.value.supports['acceleration']).toContain('high')
  })

  it('OpenAPI olmayan girdi reddediliyor', () => {
    expect(importOpenApi({ swagger: '2.0' }).ok).toBe(false)
    expect(importOpenApi(null).ok).toBe(false)
  })

  it('tanınmayan kategoriye yetenek adı UYDURULMUYOR', () => {
    const r = importOpenApi({
      ...FAL,
      info: { ...FAL.info, 'x-fal-metadata': { endpointId: 'x/y', category: 'protein-katlama' } },
    })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error.kind).toBe('unmappable_category')
  })
})

describe('taslak, insan onayı olmadan GEÇERLİ DEĞİL', () => {
  // `throw` yok: hata bir DEĞERDİR (§8.6) ve bu kural test dosyasında da geçerli.
  // Fixture bozuksa taslak boş çıkar ve aşağıdaki her iddia zaten düşer.
  const ithal = importOpenApi(FAL)
  const yaml = ithal.ok ? draftToYaml(ithal.value) : ''

  it('şerit atanmadığı için `parseDescriptor` reddediyor', () => {
    // Bu testin tersi tehlikeli olurdu: içe aktarılan bir tanımlayıcı kendiliğinden
    // geçerli olsaydı, fiyatı hiç doğrulanmamış bir sağlayıcı aday listesine girerdi.
    const r = parseDescriptor(yaml)
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.errors.some((e) => e.kind === 'missing_field')).toBe(true)
  })

  it('taslak ASLA enabled değil ve adaptörü `pending`', () => {
    expect(yaml).toContain('enabled: false')
    expect(yaml).toContain('adapter: pending')
  })

  it('taslakta literal secret YOK — `auth_env` boş bırakılıyor', () => {
    expect(yaml).toContain('auth_env: null')
  })

  it('şerit elle eklenince tanımlayıcı GEÇERLİ oluyor', () => {
    const y = yaml
      .replace('lanes: []', 'lanes: [premium]')
      .replace('auth_env: null', 'auth_env: FAL_KEY')
    const r = parseDescriptor(y)
    expect(r.ok, r.ok ? '' : JSON.stringify(r.errors)).toBe(true)
  })
})
