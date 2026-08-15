import { describe, expect, it } from 'vitest'
import { RECORD_STATUSES } from '@suite/contracts'
import { canTransition, isTerminal, statesOf, transition, TRANSITIONS } from './machines.js'

describe('dört durum makinesi (§3.7)', () => {
  it('dördü de tanımlı', () => {
    expect(Object.keys(TRANSITIONS).sort()).toEqual(['asset', 'job', 'record', 'run'])
  })

  it('her hedef durum aynı makinede TANIMLI bir durumdur', () => {
    for (const m of ['run', 'job', 'asset', 'record'] as const) {
      const bilinen = new Set(statesOf(m))
      for (const [from, hedefler] of Object.entries(TRANSITIONS[m])) {
        for (const to of hedefler as readonly string[]) {
          expect(bilinen.has(to), `${m}: ${from} → ${to} tanımsız duruma gidiyor`).toBe(true)
        }
      }
    }
  })

  it('her makinede en az bir terminal durum var — sonsuz makine yok', () => {
    for (const m of ['run', 'job', 'asset', 'record'] as const) {
      expect(
        statesOf(m).some((s) => isTerminal(m, s)),
        m
      ).toBe(true)
    }
  })

  it('record durumları RECORD_STATUSES ile örtüşür (§3.2)', () => {
    // `discarded` yalnız makinede var: hiç aktifleşmemiş bir taslağın atılması bir
    // ZARF durumu değildir, kayıt hiç doğmamıştır. Zarfın beş durumu ise makinede
    // eksiksiz bulunmalı — biri eksikse retrieval yüklemi ulaşılamaz bir durum okur.
    const makine = new Set(statesOf('record'))
    for (const s of RECORD_STATUSES) expect(makine.has(s), s).toBe(true)
  })

  it('emeklilik terminaldir ama silme değildir (değişmez ilke 10)', () => {
    expect(isTerminal('record', 'retired')).toBe(true)
    expect(canTransition('record', 'retired', 'active')).toBe(false)
  })

  it('bitmiş iş yeniden kuyruğa girmez, başarısız iş girebilir', () => {
    expect(canTransition('job', 'done', 'queued')).toBe(false)
    expect(canTransition('job', 'failed', 'queued')).toBe(true)
  })

  it('kira dolduğunda iş kuyruğa döner — kilitli kalmaz', () => {
    expect(canTransition('job', 'leased', 'queued')).toBe(true)
  })

  it('çalıştırma onay kapısına girip geri dönebilir', () => {
    expect(canTransition('run', 'running', 'awaiting_approval')).toBe(true)
    expect(canTransition('run', 'awaiting_approval', 'running')).toBe(true)
  })

  it('planlanmış bir çalıştırma doğrudan başarılı olamaz', () => {
    expect(canTransition('run', 'planned', 'succeeded')).toBe(false)
  })

  it('QA geçmeden onay yok', () => {
    expect(canTransition('asset', 'rendered', 'approved')).toBe(false)
    expect(canTransition('asset', 'qa_passed', 'approved')).toBe(true)
  })

  it('yayınlanmış varlık taslağa dönmez', () => {
    expect(canTransition('asset', 'published', 'draft')).toBe(false)
  })

  it('bilinmeyen durum sessizce kabul edilmez', () => {
    expect(canTransition('job', 'yok_boyle_bir_durum', 'done')).toBe(false)
    expect(isTerminal('job', 'yok_boyle_bir_durum')).toBe(false)
  })

  it('derleme zamanı geçiş, yasal hedefi aynen döndürür', () => {
    expect(transition('job', 'queued', 'leased')).toBe('leased')
    expect(transition('run', 'running', 'succeeded')).toBe('succeeded')
    // Yasadışı olanlar TİP hatasıdır; ihlal testi `tsc` ile yapılır, burada değil.
  })
})
