// Onay ekranı BÖLÜMLERİ: bekleyen · onaylanan · yayınlanan · planlanan (FAZ-17.2).
//
// ⚠ ⚠ **KUYRUK YALNIZ "BEKLEYEN"İ GÖSTERİYORDU ve bu, işin yarısını görünmez
// kılıyordu.** Onayladığın bir gönderi listeden düşüyor ve bir daha görünmüyordu:
// "onayladım da ne oldu" sorusunun cevabı hiçbir yerde yoktu.
//
// ⚠ ⚠ **YAYINLANAN ve PLANLANAN bölümleri BOŞ DEĞİL, "HENÜZ BAĞLI DEĞİL" diyor.**
// Boş bir sekme "hiç yayın yok" diye okunur; oysa doğru bilgi *kanal API'si
// bağlanmadı*. Ölçülmemiş bir şeyi sıfır göstermek, bu depoda tekrar eden en pahalı
// yanlıştır (kota göstergesi aynı sebeple "—" gösteriyor).

import type React from 'react'
import { useCallback, useEffect, useState } from 'react'
import { Asama } from './Asama.js'

type Bolum = 'bekleyen' | 'onaylanan' | 'yayinlanan' | 'planlanan'

interface Karar {
  readonly runId: string
  readonly pipeline: string
  readonly gate: string
  readonly decision: string
  readonly at: string
  readonly note: string | null
}

export const OnayBolumleri = ({
  ac,
  bekleyenSayisi,
  bekleyenIcerik,
}: {
  readonly ac: (runId: string) => void
  readonly bekleyenSayisi: number
  readonly bekleyenIcerik: React.JSX.Element
}): React.JSX.Element => {
  const [bolum, setBolum] = useState<Bolum>('bekleyen')
  const [kararlar, setKararlar] = useState<readonly Karar[] | null>(null)

  const yukle = useCallback(async (): Promise<void> => {
    try {
      const r = (await (await fetch('/api/kararlar')).json()) as { kararlar?: Karar[] }
      setKararlar(r.kararlar ?? [])
    } catch {
      setKararlar([])
    }
  }, [])

  useEffect(() => {
    if (bolum === 'onaylanan') void yukle()
  }, [bolum, yukle])

  const onaylananlar = (kararlar ?? []).filter((k) => k.decision === 'approved')

  return (
    <div>
      <div className="bolum-sekmeler">
        <button
          type="button"
          className={bolum === 'bekleyen' ? 'etkin' : ''}
          onClick={() => setBolum('bekleyen')}
        >
          Bekleyen ({bekleyenSayisi})
        </button>
        <button
          type="button"
          className={bolum === 'onaylanan' ? 'etkin' : ''}
          onClick={() => setBolum('onaylanan')}
        >
          Onaylanan
        </button>
        <button
          type="button"
          className={bolum === 'yayinlanan' ? 'etkin' : ''}
          onClick={() => setBolum('yayinlanan')}
        >
          Yayınlanan
        </button>
        <button
          type="button"
          className={bolum === 'planlanan' ? 'etkin' : ''}
          onClick={() => setBolum('planlanan')}
        >
          Planlanan
        </button>
      </div>

      {bolum === 'bekleyen' ? bekleyenIcerik : null}

      {bolum === 'onaylanan' ? (
        kararlar === null ? (
          <p className="giris-not">yükleniyor…</p>
        ) : onaylananlar.length === 0 ? (
          <p className="bos">henüz onaylanmış kapı yok</p>
        ) : (
          <ul className="is-listesi">
            {onaylananlar.map((k) => (
              <li key={`${k.runId}-${k.gate}`}>
                <button type="button" className="satir-ac" onClick={() => ac(k.runId)}>
                  <Asama kapi={k.gate} />
                  <span className="is-hat">{k.pipeline}</span>
                  <span className="olcum">{k.at.slice(0, 16).replace('T', ' ')}</span>
                  {k.note === null || k.note === '' ? null : (
                    <span className="olcum">— {k.note}</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )
      ) : null}

      {bolum === 'yayinlanan' ? (
        <div className="yakinda">
          <strong>Kanal API'si henüz bağlı değil.</strong>
          <p>
            Burası boş olduğu için "yayın yok" demiyor — <em>ölçülmedi</em> diyor. Meta/Instagram
            bağlandığında yayınlanan gönderiler kanal id'leriyle burada listelenecek; yeniden
            gönderim öncesi mutabakat da o kayda dayanacak (R-46).
          </p>
        </div>
      ) : null}

      {bolum === 'planlanan' ? (
        <div className="yakinda">
          <strong>Yayın zamanı planlama henüz yok (FAZ-17.3).</strong>
          <p>
            Hat en uygun saati <em>önerecek</em>, seçimi insan yapacak ve seçim deftere yazılacak —
            otomatik yayın Yasa 2'nin ihlalidir. Öneri geçmiş yayınların etkileşiminden çıkacak;
            veri yokken hat saat önermeyecek, sebebini yazacak.
          </p>
        </div>
      ) : null}
    </div>
  )
}
