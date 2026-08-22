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
import { aralikta, tamTarih, tariheGore, type Siralama } from './tarih.js'

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
  // ⚠ ⚠ **ONAYLANANLAR BİR YIĞINDI.** Depo sahibi: *"onaylananlar daha kategorik
  // olmalı ve orada da toplu seçim silme vs diğer sayfalardaki gibi olmalı; tek tek
  // söyletme"*. Süzgeç ve toplu eylem öteki listelerde vardı, burada yoktu — aynı iş
  // iki ekranda iki farklı zahmet demekti.
  const [fHat, setFHat] = useState('')
  const [fKapi, setFKapi] = useState('')
  const [fBas, setFBas] = useState('')
  const [fSon, setFSon] = useState('')
  const [siralama, setSiralama] = useState<Siralama>('yeni')
  const [secilenler, setSecilenler] = useState<readonly string[]>([])

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

  const hamOnaylananlar = (kararlar ?? []).filter((k) => k.decision === 'approved')
  const hatlar = [...new Set(hamOnaylananlar.map((k) => k.pipeline))].sort()
  const kapilar = [...new Set(hamOnaylananlar.map((k) => k.gate))].sort()
  const onaylananlar = tariheGore(
    hamOnaylananlar
      .filter((k) => fHat === '' || k.pipeline === fHat)
      .filter((k) => fKapi === '' || k.gate === fKapi)
      .filter((k) => aralikta(k.at, fBas, fSon)),
    (k) => k.at,
    siralama
  )
  // ⚠ Toplu eylem KOŞUYA ait, karara değil: bir koşu birden çok kapı kararı taşıyor ve
  // aynı koşuyu iki kez elemek anlamsız.
  const seciliKosular = [...new Set(secilenler)]

  /** Seçilen koşuları TEK gerekçeyle eler — silmek yok, elemek var (Yasa 11). */
  const topluEle = async (): Promise<void> => {
    const sebep = prompt(`${seciliKosular.length} koşu elenecek. Neden? (kayıt SİLİNMİYOR)`) ?? ''
    if (sebep.trim() === '') return
    for (const runId of seciliKosular) {
      await fetch(`/api/kosu/${encodeURIComponent(runId)}/ele`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ sebep }),
      })
    }
    setSecilenler([])
    await yukle()
  }

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
          <>
            <div className="filtre-cubuk">
              <label>
                hat{' '}
                <select value={fHat} onChange={(e) => setFHat(e.target.value)}>
                  <option value="">hepsi</option>
                  {hatlar.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                kapı{' '}
                <select value={fKapi} onChange={(e) => setFKapi(e.target.value)}>
                  <option value="">hepsi</option>
                  {kapilar.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                başlangıç{' '}
                <input type="date" value={fBas} onChange={(e) => setFBas(e.target.value)} />
              </label>
              <label>
                bitiş <input type="date" value={fSon} onChange={(e) => setFSon(e.target.value)} />
              </label>
              <label>
                sıra{' '}
                <select value={siralama} onChange={(e) => setSiralama(e.target.value as Siralama)}>
                  <option value="yeni">en yeni önce</option>
                  <option value="eski">en eski önce</option>
                </select>
              </label>
              <label>
                <input
                  type="checkbox"
                  aria-label="hepsini seç"
                  checked={
                    secilenler.length > 0 &&
                    seciliKosular.length === [...new Set(onaylananlar.map((k) => k.runId))].length
                  }
                  onChange={(e) =>
                    setSecilenler(e.target.checked ? onaylananlar.map((k) => k.runId) : [])
                  }
                />{' '}
                hepsini seç
              </label>
            </div>

            {seciliKosular.length === 0 ? null : (
              <div className="filtre-cubuk">
                <strong>{seciliKosular.length} koşu seçili</strong>
                <button type="button" onClick={() => void topluEle()}>
                  ✕ seçilenleri ele
                </button>
                <button type="button" onClick={() => setSecilenler([])}>
                  seçimi temizle
                </button>
              </div>
            )}

            <ul className="is-listesi">
              {onaylananlar.map((k) => (
                <li key={`${k.runId}-${k.gate}`}>
                  <input
                    type="checkbox"
                    aria-label={`${k.runId} seç`}
                    checked={secilenler.includes(k.runId)}
                    onChange={(e) =>
                      setSecilenler(
                        e.target.checked
                          ? [...secilenler, k.runId]
                          : secilenler.filter((x) => x !== k.runId)
                      )
                    }
                  />
                  <button type="button" className="satir-ac" onClick={() => ac(k.runId)}>
                    <Asama kapi={k.gate} />
                    <span className="is-hat">{k.pipeline}</span>
                    {/* ⚠ TAM tarih: ham ISO parçası (`2026-08-22T11:09`) bir tarih
                        değil, bir dize parçasıydı. */}
                    <span className="olcum">{tamTarih(k.at)}</span>
                    {k.note === null || k.note === '' ? null : (
                      <span className="olcum">— {k.note}</span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </>
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
