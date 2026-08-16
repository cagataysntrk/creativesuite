import { describe, expect, it } from 'vitest'
import { readEnv } from '@suite/kernel'
import { calistirmaBaslat, tekrarBaslat } from './calistir.js'

// `komut: 'true'` → gerçek bir çalıştırma başlatmaz ama spawn yolu KOŞAR.
// `/bin/true` her yerde var ve hemen 0 ile çıkar; testin ağa ya da Chromium'a
// dokunmaması gerekiyor (R-47 ruhu).
// Ortam `readEnv`ten (R-05 · `secret-okuyucu` darboğazı): testte bile ikinci bir
// okuyucu açmak, "hangi değişken gerekiyor" sorusunu grep'le cevaplanamaz yapar.
const ORTAK = { repoRoot: '/tmp', env: { PATH: readEnv('PATH') ?? '' }, komut: 'true' }

describe('çalıştırma başlatma', () => {
  it('plan özeti OLMADAN başlatmaz — onay bir ÖZETE verilir (R-07)', () => {
    const r = calistirmaBaslat({
      ...ORTAK,
      pipelineId: 'instagram-post',
      konu: 'x',
      planDigest: '',
    })
    expect(r.ok).toBe(false)
    expect(r.ok ? '' : r.hata).toContain('R-07')
  })

  it('konu boşken başlatmaz — hat neyi üreteceğini bilemez', () => {
    const r = calistirmaBaslat({
      ...ORTAK,
      pipelineId: 'instagram-post',
      konu: '   ',
      planDigest: 'sha256:x',
    })
    expect(r.ok).toBe(false)
  })

  // 🧪 Geçerli girdide runId DÖNER ve beklemez. Fikstür (D-181): geçersiz dallar
  // yukarıda `ok:false` veriyor; bu dal `ok:true` vermezse ayrım kalkar.
  it('geçerli girdide kimlik döner ve İSTEĞİ BEKLETMEZ', () => {
    const r = calistirmaBaslat({
      ...ORTAK,
      pipelineId: 'instagram-post',
      konu: 'imalatta fire',
      planDigest: 'sha256:abc',
    })
    expect(r.ok).toBe(true)
    expect(r.ok && r.runId.startsWith('run_')).toBe(true)
  })

  it('rerun ile replay AYRI eylemler — ikisi de kimlik döner', () => {
    const a = tekrarBaslat({ ...ORTAK, pipelineId: 'p', kaynakRunId: 'run_x', kind: 'rerun' })
    const b = tekrarBaslat({ ...ORTAK, pipelineId: 'p', kaynakRunId: 'run_x', kind: 'replay' })
    expect(a.ok && b.ok).toBe(true)
    // Yeni çalıştırma AYRI bir kimlik alır: kaynağın üzerine yazmak defteri bozardı.
    expect(a.ok && b.ok && a.runId !== b.runId).toBe(true)
    expect(a.ok && a.runId !== 'run_x').toBe(true)
  })

  it('kaynak çalıştırma boşsa tekrar başlatmaz', () => {
    const r = tekrarBaslat({ ...ORTAK, pipelineId: 'p', kaynakRunId: '', kind: 'rerun' })
    expect(r.ok).toBe(false)
  })
})
