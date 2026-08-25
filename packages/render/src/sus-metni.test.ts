// Süs ögesi metnin arkasından geçiyor mu — ÖLÇÜLÜYOR (§7.1 · D-268).
//
// ⚠ ⚠ **BU KUSURU GÖZ BULDU, DENETİM DEĞİL.** Panelden koşan `run_01a01876`in 2. ve 3.
// slaytlarında akan mavi alan gövde metninin son iki satırının altından geçiyordu:
// okunuyor ama YANLIŞ görünüyor — tasarım değil, kaza gibi. Denetim "0 kusur" dedi.
//
// Var olan hiçbir ölçüm bunu göremezdi: `metin-ortuluyor` metnin ALTTA kalmasını arıyor
// (burada metin üstte), kontrast ölçümü kutunun MEDYANINA bakıyor ve iki satırlık bir
// kesişim medyanı kıpırdatmıyor. Kuralın kendisi kataloğa zaten yazılıydı — `sahne`
// kaydı *"oklar metnin üstünden geçmiyor"* diyor. **Yazılı olması yetmedi.**

import { describe, expect, it } from 'vitest'
import { ORNEKLER } from './katalog-ornek.js'
import { olcumBelgesi } from './olcum-belgesi.js'
import { type PanoramaBelgesi } from './panorama.js'
import { panoramaDenetle } from './panorama-denetim.js'

const belge = (id: string, tokenCss: string): PanoramaBelgesi =>
  // ⚠ `tokenCss` parametresi KORUNUYOR: bu kapı süsün metni kesip kesmediğini FARKLI
  // belirteçlerle ölçüyor. Taban belge yetkiliden, bilerek ezilen alan üstte.
  ({ ...olcumBelgesi(ORNEKLER[id] as (typeof ORNEKLER)[keyof typeof ORNEKLER]), tokenCss })

const susKusurlari = async (doc: PanoramaBelgesi): Promise<readonly string[]> => {
  const r = await panoramaDenetle(doc)
  expect(r.ok).toBe(true)
  return (r.ok ? r.value : [])
    .filter((k) => k.tur === 'sus-metni-kesiyor')
    .map((k) => `${String(k.kart)}/${String(k.alan)}`)
}

describe('süs metni kesiyor mu', () => {
  it('temiz belgede kusur YOK — süs metne girmiyorsa sessiz kalıyor', async () => {
    expect(await susKusurlari(belge('sahne', ''))).toEqual([])
  }, 120_000)

  // ⚠ ⚠ **ZEMİN SÜS DEĞİL.** İlk sürüm `.alan-siniri`yi de gizliyordu; oysa
  // `akan-alan`da o sınır iki renk alanını ayıran ZEMİNİN kendisi ve gizlenince tüm
  // kartın arkası değişiyor. Ölçüm temiz bir belgede ON SEKİZ kusur saydı. Zemini süs
  // sanan bir ölçüm, doğru şeyi yanlış yerde arar.
  it('`akan-alan`ın renk alanı süs SAYILMIYOR', async () => {
    expect(await susKusurlari(belge('akan-alan', ''))).toEqual([])
  }, 120_000)

  // ⚠ ⚠ Süs KASTEN metnin altına yayılıyor. Ölçüm bir SAYIYI değil bir DAVRANIŞI
  // sınıyor: "süs oradaysa görür mü". Gerçek üretimdeki oranı (%5,8 ve %7,1) teste
  // yazmak, bugünkü belgenin geometrisini test etmek olurdu.
  it('süs metnin altına yayılırsa YAKALANIYOR', async () => {
    // ⚠ ⚠ **`.bant-ok` YAZIYORDU ve `sahne` o ögeyi KAYBEDİNCE test sessizce 0 buldu.**
    // Yaylar kesik öznelerin %10'unu kesiyordu ve kaldırıldı; test onların varlığına
    // bağlıydı, yani kapıyı değil o günkü tasarımı sınıyordu.
    // ⚠ Şimdi `.olcek-cizgi` boyanıyor — `sahne`nin bugünkü bandı VE listeye yeni eklendi
    // (`SUSU_GIZLE` ölçek çizgisini hiç saymıyordu; bu bulgu tam da bu kırılmadan çıktı).
    const doc = belge(
      'sahne',
      // ⚠ `!important` ŞART: ölçek çizgisi satır içi `top` stili taşıyor (`top:93%`) ve
      // enjekte edilen kural onu ezemiyordu — öge metnin ALTINDA kalıyor, ölçüm 0 buluyordu.
      '.olcek-cizgi { position: absolute !important; inset: 0 !important; ' +
        'height: auto !important; z-index: 0; background: #4a90d9 }'
    )
    const kusurlar = await susKusurlari(doc)
    // Her kartın gövdesi süsün üstünde: en az kart sayısı kadar kusur.
    expect(kusurlar.length).toBeGreaterThanOrEqual(ORNEKLER['sahne']?.kartlar.length ?? 0)
    expect(kusurlar.some((k) => k.endsWith('/govde'))).toBe(true)
  }, 120_000)
})
