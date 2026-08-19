import { describe, expect, it } from 'vitest'
import { readEnv } from '@suite/kernel'
import { calistirmaBaslat, calistirmaSurdur, kosuyorMu, tekrarBaslat } from './calistir.js'

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

// ── tek uçuş: aynı koşu İKİ KEZ sürdürülemez ────────────────────────────────
//
// ⚠ ⚠ **ÖLÇÜLDÜ VE DEFTERİ BOZDU.** `run_01a018ef`in günlüğünde iki *"sürdürülüyor"*
// başlığı iç içe geçti: insan Telegram'dan onayladı (sunucu sürdürdü), ben de panelden
// sürdürdüm. `gorsel-brief-4` iki kez başladı, `gorsel-uret-4` yarım yazılmış bir brief
// gördü ve `prompt-yok` diye ATLANDI; o atlama deftere yazıldı, dördüncü slayt YER
// TUTUCU ile render edildi ve özet tablosu aynı adımı hem ✓ hem ✗ gösterdi.
//
// İkisi de meşru bir eylemdi; meşru olmayan ikisinin AYNI ANDA olmasıydı.
describe('aynı koşu iki kez sürdürülmez', () => {
  const ortak = {
    repoRoot: '/tmp',
    pipelineId: 'instagram-post',
    env: { PATH: readEnv('PATH') ?? '' },
    // ⚠ `sleep 5`: süreç AÇIK kalmalı, yoksa ilk sürdürme biter ve kayıt silinir —
    // test o zaman yarışı değil, sıralı iki çağrıyı ölçerdi.
    komut: 'sleep',
  }

  it('koşarken ikinci sürdürme REDDEDİLİYOR', () => {
    const runId = 'run_01a00000-0000-7000-8000-00000000test'
    const birinci = calistirmaSurdur({ ...ortak, runId })
    expect(birinci.ok).toBe(true)
    expect(kosuyorMu(runId)).toBe(true)

    const ikinci = calistirmaSurdur({ ...ortak, runId })
    expect(ikinci.ok).toBe(false)
    expect(ikinci.ok ? '' : ikinci.hata).toContain('ZATEN koşuyor')
  })

  it('BAŞKA bir koşu engellenmiyor — kilit koşuya ait, sunucuya değil', () => {
    const a = calistirmaSurdur({ ...ortak, runId: 'run_01a00000-0000-7000-8000-0000000000aa' })
    const b = calistirmaSurdur({ ...ortak, runId: 'run_01a00000-0000-7000-8000-0000000000bb' })
    expect(a.ok).toBe(true)
    expect(b.ok).toBe(true)
  })
})
