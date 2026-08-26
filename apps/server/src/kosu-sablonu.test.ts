// KOŞU KİMLİĞİ — şablon ve konu, SEÇİMİ YAPAN adımdan okunuyor mu (FAZ-19.13).
//
// ⚠ ⚠ **BU KAPI AYNI KUSURUN İKİNCİ TEKRARINDAN SONRA YAZILDI.** Önce `sablon`
// `kosu-parametreleri.json`dan okunuyordu ve sistem şablonu kendi seçince alan BOŞ
// kalıyordu: bir koşu devir belgesinde `veri-hikayesi` diye listelendi, gerçekte
// `sahne`ydi. Düzeltildi. Sonra AYNI şey `topic`te çıktı — takvimdeki gönderi
// konusuz göründü ve bir gönderiyi tarihinden değil KONUSUNDAN tanıyoruz.
//
// ⚠ İkisi de tek bir kurala indi: **parametre insanın NİYETİ, adım çıktısı hattın
// GERÇEĞİ.** Üçüncü bir alanda tekrarlarsa bu kapı onu da yakalasın diye ikisi de
// burada sınanıyor.

import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { RUNS_DIR } from '@suite/kernel'
import { describe, expect, it } from 'vitest'
import { kosuSablonu } from './kosu-sablonu.js'

const RUN = 'run_01a03e9e-7d62-7560-b44d-0cb7225e2883'

const kur = (par: unknown, adimlar: Record<string, unknown>): string => {
  const kok = mkdtempSync(join(tmpdir(), 'kimlik-'))
  // ⚠ Yolu SÖZLEŞMEDEN al: dizeyi elle yazmak `manifest-yazici` darboğazının tam
  // yasakladığı şey ve kapı bunu yakaladı — koşu dizini yolunu bilen tek yer kernel.
  const d = join(kok, RUNS_DIR, RUN)
  mkdirSync(join(d, 'steps'), { recursive: true })
  writeFileSync(join(d, 'kosu-parametreleri.json'), JSON.stringify(par), 'utf8')
  for (const [ad, icerik] of Object.entries(adimlar))
    writeFileSync(join(d, 'steps', `${ad}.json`), JSON.stringify(icerik), 'utf8')
  return kok
}

describe('koşu kimliği — şablon ve konu', () => {
  it('SİSTEM seçtiğinde parametre BOŞ ama adım çıktısı dolu — gerçek oradan gelir', () => {
    const kok = kur(
      { sablon: '', topic: '' },
      { 'sablon-uyarla': { uyarlama: { sablonId: 'sahne' } }, 'konu-sec': { konu: 'Ölçüm pilotu' } }
    )
    const k = kosuSablonu(kok, RUN)
    expect(k.gercek, 'şablon adım çıktısından').toBe('sahne')
    expect(k.konu, 'konu SEÇİMİ YAPAN adımdan — bu kusur iki kez tekrarladı').toBe('Ölçüm pilotu')
  })

  it('İNSAN yazdığında niyet korunuyor — gerçek yine adımdan', () => {
    const kok = kur(
      { sablon: 'editoryal', topic: 'elle yazılmış konu' },
      { 'sablon-uyarla': { uyarlama: { sablonId: 'editoryal' } }, 'konu-sec': { konu: 'seçilen' } }
    )
    const k = kosuSablonu(kok, RUN)
    expect(k.istenen, 'insanın istediği ayrı taşınıyor').toBe('editoryal')
    expect(k.gercek).toBe('editoryal')
  })

  it('adım çıktısı YOKSA parametreye düşüyor — kaybetmiyor', () => {
    const kok = kur({ sablon: 'kavis', topic: 'elle konu' }, {})
    const k = kosuSablonu(kok, RUN)
    expect(k.gercek, 'uygulanmış şablon yok — null DÜRÜST').toBeNull()
    expect(k.konu, 'konu-sec yoksa insanın yazdığı geçerli').toBe('elle konu')
  })

  it('ikisi de boşsa null — boş dize "şablonsuz üretildi" derdi', () => {
    const kok = kur({ sablon: '', topic: '   ' }, { 'konu-sec': { konu: '' } })
    const k = kosuSablonu(kok, RUN)
    expect(k.gercek).toBeNull()
    expect(k.istenen).toBeNull()
    expect(k.konu, 'boşluktan ibaret konu KONU DEĞİLDİR').toBeNull()
  })
})
