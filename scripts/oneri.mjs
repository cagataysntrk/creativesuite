#!/usr/bin/env node
// Haftalık öneriler — İNSANIN çalıştırdığı komut (§10 · D-10 · R-14 · FAZ-8.5).
//
// **Öneri, üretim değildir.** Bu komut hiçbir metered fiil ateşlemez: ağ yok, model
// yok, yazma yok. Yalnız zaten ölçülmüş veriyi okur ve "şunu koşturmak isteyebilirsin"
// der. Koşturmayı İNSAN yapar — `just uret <hat>`.
//
// **Öneriyi doğrudan çalıştıran bir bayrak YOK ve olmayacak.** `--calistir` eklemek
// her zaman makul görünür ve tam da bu yüzden bir gün eklenir; o gün sistem kendi
// kendine para harcamaya başlar. Önerinin taşıdığı tek şey bir hat ADI.

import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const REPO = join(dirname(fileURLToPath(import.meta.url)), '..')

/**
 * Defterin okunacağı kök. Varsayılan gerçek depo; `--kok <yol>` ile bir fikstüre
 * yönlendirilebilir.
 *
 * ⚠ Eskiden sabitti ve **8.5'in ✅ ölçümü yeniden üretilemiyordu**: kanıt "şu an
 * defterde ne varsa" idi ve defter değişince kanıt sessizce değişiyordu. Tekrar
 * üretilemeyen bir ölçüm, bir ölçüm değil bir anıdır.
 *
 * Kod YÜKLEMESİ her zaman gerçek depodan: fikstür veriyi değiştirir, mantığı değil.
 */
const kokBayragi = process.argv.indexOf('--kok')
const VERI_KOKU = kokBayragi === -1 ? REPO : (process.argv[kokBayragi + 1] ?? REPO)

const { haftalikOneriler, readLedger, performansPanosu, readInsights, ONERI_TAVANI } = await import(
  join(REPO, 'packages/engine/dist/index.js')
)
const { systemClock } = await import(join(REPO, 'packages/kernel/dist/index.js'))

const simdi = systemClock.nowIso()
const defter = readLedger(VERI_KOKU)
const olcumler = readInsights(VERI_KOKU)

// Kazananlar 7.9'un sıralamasından gelir: ölçülmemiş pencere zaten dışarıda.
const pano = defter.ok
  ? performansPanosu({
      yayinlar: defter.entries,
      olcumler: olcumler.ok ? olcumler.satirlar : [],
      bugun: simdi.slice(0, 10),
      metrik: 'reach',
    })
  : { siralama: [] }

const sonuc = haftalikOneriler({
  // Defter okunamıyorsa `null` — "boş defter" DEĞİL (D-38).
  yayinlar: defter.ok ? defter.entries : null,
  kazananlar: pano.siralama.map((s) => ({
    externalId: s.externalId,
    deger: s.durum.deger,
    metrik: pano.metrik ?? 'reach',
    // Tekrar kullanım defterden okunamıyor (henüz): bilinmiyorsa TEKRAR KULLANILMAMIŞ
    // saymak, öneriyi fazla üretir. Az öneri iyi, gürültü kötü — `false` seçilmedi.
    tekrarKullanildi: false,
  })),
  bugun: simdi,
  // ⚠ Bayraklar hat adı SAYILMAZ: `--kok` geçildiğinde `argv[2]` bayrağın kendisiydi ve
  // öneri `just uret --kok` diye çalıştırılamaz bir satır basıyordu. Öneri metni bir
  // KOMUT iddiasıdır; çalışmayan bir komut önermek, öneri vermemekten kötüdür.
  hat:
    process.argv.slice(2).find((a) => !a.startsWith('--') && a !== VERI_KOKU) ?? 'instagram-post',
})

console.log(`── haftalık öneriler · ${simdi.slice(0, 10)} ──`)
if (sonuc.olculemeyen !== null) {
  console.log(`  ⊘ ${sonuc.olculemeyen}`)
  process.exit(0)
}
if (sonuc.oneriler.length === 0) {
  // **Sessizlik de bir cevaptır.** Boş bir öneri listesi, "bugün önerecek bir şey yok"
  // demek — ve bunu söylemek, uydurma bir fikir üretmekten iyidir.
  console.log('  bugün önerilecek bir şey yok — sessizlik de bir cevaptır')
  process.exit(0)
}
for (const o of sonuc.oneriler) {
  console.log(`  · ${o.neden}`)
  console.log(`    → just uret ${o.pipeline}`)
}
if (sonuc.dusenSayisi > 0) {
  // Sessizce kırpmak, kapsamı olduğundan geniş göstermek olurdu.
  console.log(
    `  ⚠ ${sonuc.dusenSayisi} öneri tavana takıldı (tavan ${ONERI_TAVANI}) — en zayıf kanıtlılar düştü`
  )
}
console.log('')
console.log('  ⚠ Bu komut HİÇBİR ŞEY çalıştırmadı ve hiçbir maliyet oluşturmadı.')
console.log('    Öneriyi koşturmak insanın kararı: yukarıdaki `just uret` satırı.')
