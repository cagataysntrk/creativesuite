// Sağlayıcı ortamı — anahtar listesi VERİDEN türüyor, elle sayılmıyor (D-237).
//
// ⚠ Bu dosya `HOME` eksikliği panelden başlatılan koşuları sessizce öldürdükten sonra
// yazıldı. Ders testin varlığında değil KAPSAMINDA: `saglayiciOrtami` test ediliyordu
// ama yalnız *anahtarlar* açısından; süreci çalıştırmaya yeten şeyler açısından hiç.

import { describe, expect, it } from 'vitest'
import type { ProviderDescriptor } from './descriptor.js'
import { authEnvNames, saglayiciOrtami } from './ortam.js'

// ⚠ `authEnv` AÇIKÇA veriliyor: ilk sürüm `id.toUpperCase()` ile türetiyordu ve
// `turkish-case` kapısı haklı olarak reddetti — 'i'.toUpperCase() → 'I'. Kapı bir
// test dosyasında da geçerli: yasak olan alışkanlıktır, konumu değil.
const tanim = (o: { id: string; authEnv?: string | null; enabled?: boolean }): ProviderDescriptor =>
  ({
    id: o.id,
    title: o.id,
    adapter: o.id,
    enabled: o.enabled ?? true,
    authEnv: o.authEnv === undefined ? `KEY_${o.id}` : o.authEnv,
    capabilities: [],
  }) as unknown as ProviderDescriptor

const oku =
  (m: Record<string, string>) =>
  (ad: string): string | undefined =>
    m[ad]

describe('saglayiciOrtami', () => {
  it('PATH ve HOME her zaman var — alt süreç onlarsız hiç başlamaz', () => {
    const e = saglayiciOrtami([], oku({ PATH: '/bin', HOME: '/home/x' }))
    expect(e['PATH']).toBe('/bin')
    // ⚠ `HOME` yokken `scripts/sh.sh` `set -u` altında "unbound variable" ile düşüyor
    // ve panel bunu "başlatıldı" diye gösteriyordu. Kabuktan koşarken HOME zaten
    // vardı; hata yalnız sunucu yolunda görünüyordu.
    expect(e['HOME']).toBe('/home/x')
  })

  it('yalnız ENABLED tanımlayıcıların anahtarı geçer', () => {
    const d = [tanim({ id: 'a' }), tanim({ id: 'b', enabled: false })]
    expect(authEnvNames(d)).toEqual(['KEY_a'])
    const e = saglayiciOrtami(d, oku({ PATH: '/bin', HOME: '/h', KEY_a: 'x', KEY_b: 'y' }))
    expect(e['KEY_a']).toBe('x')
    expect(e['KEY_b']).toBeUndefined()
  })

  it('boş değerli anahtar HİÇ eklenmez — "var ama boş" yanlış pozitiftir', () => {
    const e = saglayiciOrtami([tanim({ id: 'a' })], oku({ PATH: '/bin', HOME: '/h', KEY_a: '' }))
    expect('KEY_a' in e).toBe(false)
  })

  it('`ek` adları geçer — tek `auth_env` iki değişken isteyen sağlayıcıya yetmiyor', () => {
    const e = saglayiciOrtami(
      [tanim({ id: 'a' })],
      oku({ PATH: '/bin', HOME: '/h', CF_ACCOUNT_ID: '42' }),
      ['CF_ACCOUNT_ID']
    )
    expect(e['CF_ACCOUNT_ID']).toBe('42')
  })
})
