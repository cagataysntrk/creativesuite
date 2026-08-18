// Bir koşunun İNSAN İÇİN anlamlı durumu — üç aşama (FAZ-17.2).
//
// ⚠ ⚠ **PANEL "run_01a0160e · metin-onayi" GÖSTERİYORDU ve bu bir KOD, bir durum
// değil.** Kullanıcı ekrana bakıp "bu iş nerede, ne bekliyor, ne yapabilirim"
// sorularının hiçbirini cevaplayamıyordu. Hattın 25 adımı var ama insanın umursadığı
// sınır ADIM değil KAPI: metin yazıldı mı, tasarım çizildi mi, yayına hazır mı.
//
// ⚠ Aşama kapı ADINDAN türüyor, ayrı bir alandan değil. İkinci bir "aşama" alanı
// eklemek, kapılarla aşamaların bir gün ayrışması demekti — hat yeni bir kapı
// kazandığında aşama listesi sessizce eskirdi.

import type React from 'react'

/** Kapı → aşama sırası. Hat kapı eklerse buraya da girer; ayrışma görünür olur. */
export const ASAMALAR = [
  { kapi: 'metin-onayi', ad: 'metin' },
  { kapi: 'tasarim-onayi', ad: 'tasarım' },
  { kapi: 'insan-onayi', ad: 'yayın' },
] as const

export const asamaSirasi = (kapi: string | null): number =>
  ASAMALAR.findIndex((a) => a.kapi === kapi)

export const Asama = ({ kapi }: { readonly kapi: string | null }): React.JSX.Element => {
  const simdi = asamaSirasi(kapi)
  return (
    <span className="asama" title={kapi ?? 'kapı yok'}>
      {ASAMALAR.map((a, i) => (
        <span
          key={a.kapi}
          className="asama-adim"
          // ⚠ Üç durum: GEÇİLDİ · BURADA · HENÜZ. İki durumla (bitti/bitmedi)
          // "şu an nerede" sorusu cevapsız kalıyordu.
          data-durum={
            simdi < 0 ? 'bilinmiyor' : i < simdi ? 'gecti' : i === simdi ? 'burada' : 'sonra'
          }
        >
          {i < simdi ? '✓' : i === simdi ? '●' : '○'} {a.ad}
        </span>
      ))}
    </span>
  )
}
