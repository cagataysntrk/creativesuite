#!/usr/bin/env node
// GROUP: fast
// PALET EMEKLİ BİR HATTI TEKLİF EDEMEZ (FAZ-19.10).
//
// ⚠ ⚠ **BU KAPI PANELDE PLAYWRIGHT'LA BULUNAN BİR KUSURDAN DOĞDU.** Komut paleti
// *"Instagram carousel üret"* diye bir seçenek sunuyordu; sunucu o hattı `emekli`
// bildiriyor ve tür menüsünde HİÇ göstermiyor. Palet, kullanıcının seçemeyeceği bir
// şeyi vaat ediyordu.
//
// ⚠ Borç KAYITLIYDI: `instagram-carousel.pipeline.yaml`in kendi başlığı *"SİLİNMEDİ,
// çünkü apps/ui bu id'ye bağlı"* diyor. Emekli bir hattın DOSYASI durur (Yasa 10) ama
// ARAYÜZÜ durmaz.
//
// ⚠ ⚠ **KAPI `apps/ui` İÇİNE TEST OLARAK YAZILDI VE ÜÇ KAPI BİRDEN REDDETTİ — haklı
// olarak.** `apps/ui` TARAYICIDA koşuyor: `node:fs` içe aktaramaz (`rings`), registry
// YAML'ını kendi çözemez (`chokepoints`). Bir denetim, denetlediği katmanın kurallarının
// dışında değildir. Kontrol buraya, dosya sistemine erişmesi meşru olan yere taşındı.
// ⚠ Palet listesi METİN olarak okunuyor: `apps/ui`ı içe aktarmak aynı duvara çarpardı.

import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const KOK = join(import.meta.dirname, '../..')
const HATLAR = join(KOK, 'registry/pipelines')
const KOMUTLAR = join(KOK, 'apps/ui/src/komutlar.ts')

const dosyalar = readdirSync(HATLAR).filter((f) => f.endsWith('.pipeline.yaml'))
const emekli = new Set(
  dosyalar
    .filter((f) => /EMEKLİ|retired:\s*true/.test(readFileSync(join(HATLAR, f), 'utf8')))
    .map((f) => f.replace('.pipeline.yaml', ''))
)
const varOlan = new Set(dosyalar.map((f) => f.replace('.pipeline.yaml', '')))

const kaynak = readFileSync(KOMUTLAR, 'utf8')
// `URETIM_KOMUTLARI` kümesindeki kimlikler — paletin ÜRETİM teklifleri.
const blok = /URETIM_KOMUTLARI[^[]*\[([^\]]*)\]/.exec(kaynak)
const kimlikler = blok === null ? [] : [...blok[1].matchAll(/'([^']+)'/g)].map((m) => m[1])

if (kimlikler.length === 0) {
  console.log('  ⚠ paletin üretim kümesi okunamadı — kapı boşa döner')
  process.exit(1)
}
if (emekli.size === 0) {
  console.log('  ⚠ registry hiç emekli hat taşımıyor — kapı boşa döner')
  process.exit(1)
}

const kotu = kimlikler.filter((id) => emekli.has(id))
const kayip = kimlikler.filter((id) => !varOlan.has(id))
if (kotu.length > 0 || kayip.length > 0) {
  if (kotu.length > 0) console.log(`  palet EMEKLİ hat teklif ediyor: ${kotu.join(', ')}`)
  if (kayip.length > 0) console.log(`  palet OLMAYAN hat teklif ediyor: ${kayip.join(', ')}`)
  console.log('  Kullanıcı bu hattı tür menüsünde bulamaz — vaat edilen şey yok.')
  process.exit(1)
}
console.log(`  ${kimlikler.length} palet üretim komutu · emekli hat teklif edilmiyor`)
