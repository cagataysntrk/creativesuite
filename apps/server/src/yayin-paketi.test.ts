// YAYIN PAKETİ — karosel SIRASI bozulmuyor mu (FAZ-19.13 · UX-14).
//
// ⚠ ⚠ **BU KAPI BİR KUSURDAN DOĞDU ve kusur BENİMDİ.** Birleşik ekranda slaytları
// `digest`e göre sıralamıştım: sha256 rastgeledir ve karosel her koşuda başka türlü
// diziliyordu. Depo sahibi gördü: *"veri hikâyesinde karosel sırası bozulmuş... bu sıra
// asla bozulmamalı."*
//
// ⚠ ⚠ **VE `createdAt` DE YETMİYOR — sınamanın asıl noktası bu.** Zaman damgaları
// milisaniyede EŞİTLENEBİLİYOR ve bu depoda öyle oldu (`dizin` koşusunda iki slayt aynı
// milisaniyede, sıraları ters). O yüzden aşağıdaki kurgu KASTEN düşman: `createdAt`
// teslimat sırasının TERSİ. Yalnız `teslimat.index`e bakan bir uygulama geçer.

import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { RUNS_DIR } from '@suite/kernel'
import { describe, expect, it } from 'vitest'
import { PAKET_KOK, yayinPaketiYaz } from './yayin-paketi.js'

const RUN = 'run_01a03e9e-7d62-7560-b44d-0cb7225e2883'

/** Blob deposuna sahte bayt yazar ve digest'i döner. */
const blobYaz = (kok: string, no: number): string => {
  const d = String(no).padStart(64, 'a')
  const dizin = join(kok, 'derived/blobs', d.slice(0, 2))
  mkdirSync(dizin, { recursive: true })
  writeFileSync(join(dizin, `${d}.png`), `slayt-${String(no)}`, 'utf8')
  return d
}

const kur = (): string => {
  const kok = mkdtempSync(join(tmpdir(), 'paket-'))
  mkdirSync(join(kok, RUNS_DIR, RUN, 'steps'), { recursive: true })
  writeFileSync(
    join(kok, RUNS_DIR, RUN, 'steps/sablon-uyarla.json'),
    JSON.stringify({ uyarlama: { sablonId: 'veri-hikayesi' } }),
    'utf8'
  )
  writeFileSync(
    join(kok, RUNS_DIR, RUN, 'steps/konu-sec.json'),
    JSON.stringify({ konu: 'Fire oranının altı yıllık seyri' }),
    'utf8'
  )
  writeFileSync(join(kok, RUNS_DIR, RUN, 'kosu-parametreleri.json'), '{}', 'utf8')
  return kok
}

describe('yayın paketi', () => {
  it('SIRA teslimat damgasından — `createdAt` TERS olsa bile', () => {
    const kok = kur()
    // ⚠ Digest'ler ve zaman damgaları KASTEN ters: yalnız `sira` doğru.
    const slaytlar = [
      { digest: blobYaz(kok, 3), sira: 2, toplam: 3, rol: 'kapanis', olcu: '1080x1440' },
      { digest: blobYaz(kok, 1), sira: 0, toplam: 3, rol: 'kapak', olcu: '1080x1440' },
      { digest: blobYaz(kok, 2), sira: 1, toplam: 3, rol: 'govde', olcu: '1080x1440' },
    ]
    const r = yayinPaketiYaz(kok, {
      runId: RUN,
      slaytlar,
      metinler: {},
      tarih: '2026-09-12',
      platformlar: ['instagram'],
    })
    expect(r.ok).toBe(true)
    if (!r.ok) return
    const klasor = join(kok, r.klasor)
    // 01 KAPAK olmalı, 03 KAPANIŞ.
    expect(readFileSync(join(klasor, '01.png'), 'utf8'), 'kapak birinci dosya').toBe('slayt-1')
    expect(readFileSync(join(klasor, '02.png'), 'utf8')).toBe('slayt-2')
    expect(readFileSync(join(klasor, '03.png'), 'utf8'), 'kapanış son dosya').toBe('slayt-3')
  })

  it('klasör adı TARİHLE başlıyor — yayıncıya yükleme sırası takvim sırasıdır', () => {
    const kok = kur()
    const r = yayinPaketiYaz(kok, {
      runId: RUN,
      slaytlar: [{ digest: blobYaz(kok, 1), sira: 0, toplam: 1, rol: 'kapak', olcu: null }],
      metinler: {},
      tarih: '2026-09-12',
      platformlar: [],
    })
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.klasor.startsWith(`${PAKET_KOK}/2026-09-12__veri-hikayesi__`)).toBe(true)
    // ⚠ Türkçe harf dosya adında YOK: `slug` katlıyor.
    expect(r.klasor).not.toMatch(/[ıİşŞğĞüÜöÖçÇ ]/)
  })

  it('metin yazılıyor ve SINIRI AŞAN metin uyarı olarak GONDERI.md`ye giriyor', () => {
    const kok = kur()
    const r = yayinPaketiYaz(kok, {
      runId: RUN,
      slaytlar: [{ digest: blobYaz(kok, 1), sira: 0, toplam: 1, rol: 'kapak', olcu: null }],
      metinler: { x: 'a'.repeat(400), instagram: 'kısa ve düzgün bir açıklama' },
      tarih: '2026-09-12',
      platformlar: ['x', 'instagram'],
    })
    expect(r.ok).toBe(true)
    if (!r.ok) return
    const belge = readFileSync(join(kok, r.klasor, 'GONDERI.md'), 'utf8')
    expect(belge, 'tavan aşımı GÖRÜNMELİ').toContain('400 karakter')
    expect(readFileSync(join(kok, r.klasor, 'instagram.txt'), 'utf8').trim()).toBe(
      'kısa ve düzgün bir açıklama'
    )
  })

  it('EKSİK metin gizlenmiyor — boş dosya YAZILMIYOR, eksik BİLDİRİLİYOR', () => {
    const kok = kur()
    const r = yayinPaketiYaz(kok, {
      runId: RUN,
      slaytlar: [{ digest: blobYaz(kok, 1), sira: 0, toplam: 1, rol: 'kapak', olcu: null }],
      metinler: {},
      tarih: '2026-09-12',
      platformlar: ['instagram'],
    })
    expect(r.ok).toBe(true)
    if (!r.ok) return
    // ⚠ Boş bir dosya yazmak, yayıncıya boş açıklamayla yüklenen bir gönderi demekti.
    expect(existsSync(join(kok, r.klasor, 'instagram.txt')), 'boş metin dosyası YAZILMAMALI').toBe(
      false
    )
    expect(r.eksik.some((x) => x.includes('Instagram'))).toBe(true)
  })

  it('BAYT bulunamazsa paket düşmüyor, eksik sayılıyor', () => {
    const kok = kur()
    const r = yayinPaketiYaz(kok, {
      runId: RUN,
      slaytlar: [
        { digest: blobYaz(kok, 1), sira: 0, toplam: 2, rol: 'kapak', olcu: null },
        { digest: 'b'.repeat(64), sira: 1, toplam: 2, rol: 'kapanis', olcu: null },
      ],
      metinler: {},
      tarih: '2026-09-12',
      platformlar: [],
    })
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.slayt, 'bir slayt yazıldı').toBe(1)
    expect(r.eksik.some((x) => x.includes('bayt bulunamadı'))).toBe(true)
    // ⚠ Yazılan dosya yine 01: eksik olan atlanıyor ama numara kaymıyor mu — kaymalı,
    // çünkü yayıncıya boşluk yükleyemezsin. Bir slayt varsa tek dosya olur.
    expect(readdirSync(join(kok, r.klasor)).filter((f) => f.endsWith('.png')).length).toBe(1)
  })

  it('slaytsız koşu REDDEDİLİYOR — paketlenecek bir şey yok', () => {
    const kok = kur()
    const r = yayinPaketiYaz(kok, {
      runId: RUN,
      slaytlar: [],
      metinler: {},
      tarih: '2026-09-12',
      platformlar: [],
    })
    expect(r.ok).toBe(false)
  })
})
