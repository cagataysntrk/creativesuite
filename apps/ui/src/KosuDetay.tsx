// Bir koşunun İÇERİĞİ — onaylamadan önce NEYİ onayladığını görmek için (FAZ-17.2).
//
// ⚠ ⚠ **BU EKRAN BİR ÖLÇÜMDEN DOĞDU.** Panel kullanıldı ve sayıldı: onay kuyruğunda
// satıra tıklamak hiçbir şey yapmıyordu, ekranda `img` sayısı SIFIRdı ve üretilen
// metin hiçbir yerde görünmüyordu. İnsan `run_01a0160e · metin-onayi` satırına bakıp
// "onayla" diyecekti — neyi onayladığını görmeden. Bir kapı, kararın dayanağını
// göstermiyorsa kapı değil bir gecikmedir.

import type React from 'react'
import { useCallback, useEffect, useState } from 'react'

interface Icerik {
  readonly runId: string
  readonly pipeline: string
  readonly createdAt: string
  readonly bekleyenKapi: string | null
  readonly satirlar: readonly string[]
  readonly sablonId: string | null
  readonly ritimHedefi: string | null
  readonly ritimTuttu: boolean | null
  readonly kusurlar: readonly { readonly tur?: string; readonly aciklama?: string }[]
  readonly varliklar: readonly { readonly digest: string; readonly bytes: number }[]
  readonly adimlar: readonly { readonly id: string; readonly durum: string }[]
}

const EDITOR = 'http://localhost:4321'

export const KosuDetay = ({
  runId,
  geri,
}: {
  readonly runId: string
  readonly geri: () => void
}): React.JSX.Element => {
  const [d, setD] = useState<Icerik | null>(null)
  const [hata, setHata] = useState<string | null>(null)
  const [gerekce, setGerekce] = useState<string | null>(null)
  const [mesaj, setMesaj] = useState<string | null>(null)

  const yukle = useCallback(async (): Promise<void> => {
    const r = await fetch(`/api/kosu/${runId}/icerik`)
    if (!r.ok) {
      setHata(`içerik okunamadı (${r.status})`)
      return
    }
    setD((await r.json()) as Icerik)
  }, [runId])

  useEffect(() => {
    void yukle()
  }, [yukle])

  const karar = useCallback(
    async (k: 'approved' | 'rejected', not: string): Promise<void> => {
      if (d?.bekleyenKapi == null) return
      const r = await fetch(`/api/kuyruk/${runId}/${d.bekleyenKapi}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ karar: k, gerekce: not }),
      })
      const j = (await r.json()) as { ok?: boolean; hata?: string }
      // ⚠ Onay koşuyu SÜRDÜRMÜYOR — kararı deftere yazıyor. Sürdürme ayrı bir komut
      // (`just uret --devam`) ve bu bilinçli: karar Ring 1'de git'te yaşar, bir web
      // isteği para harcayan bir hattı kendiliğinden başlatmaz (Yasa 2).
      setMesaj(
        j.ok === true
          ? `✓ karar yazıldı — sürdürmek için: just uret ${d.pipeline} --devam ${runId}`
          : `✗ ${j.hata ?? 'karar yazılamadı'}`
      )
      setGerekce(null)
      void yukle()
    },
    [d, runId, yukle]
  )

  if (hata !== null) return <p className="giris-not">{hata}</p>
  if (d === null) return <p className="giris-not">yükleniyor…</p>

  return (
    <div className="kosu-detay">
      <button type="button" className="geri-don" onClick={geri}>
        ← kuyruğa dön
      </button>
      <h2>
        {d.pipeline} · <code>{d.runId.slice(0, 16)}</code>
      </h2>
      <p className="giris-not">
        {d.createdAt.slice(0, 16).replace('T', ' ')} · şablon <strong>{d.sablonId ?? '—'}</strong>
        {d.ritimHedefi === null ? null : (
          <>
            {' '}
            · ritim hedefi {d.ritimHedefi} {d.ritimTuttu === true ? '✓' : '✗'}
          </>
        )}
      </p>

      {d.bekleyenKapi === null ? null : (
        <div className="kapi-kutusu">
          <strong>{d.bekleyenKapi}</strong> kapısında bekliyor.
          <div className="kapi-dugmeler">
            <button type="button" onClick={() => void karar('approved', '')}>
              ✓ onayla
            </button>
            <button type="button" onClick={() => setGerekce('')}>
              ✗ reddet
            </button>
            <a href={EDITOR} target="_blank" rel="noreferrer">
              ✎ editörde aç
            </a>
          </div>
          {gerekce === null ? null : (
            <div className="gerekce-kutusu">
              <label htmlFor="gerekce-detay">
                red gerekçesi (zorunlu — sonraki denemeye negatif kısıt olarak girer)
              </label>
              <textarea
                id="gerekce-detay"
                value={gerekce}
                onChange={(e) => setGerekce(e.target.value)}
              />
              <button
                type="button"
                disabled={gerekce.trim() === ''}
                onClick={() => void karar('rejected', gerekce.trim())}
              >
                reddet
              </button>
            </div>
          )}
        </div>
      )}
      {mesaj === null ? null : <p className="giris-not">{mesaj}</p>}

      <section className="giris-blok">
        <h3>Üretilen metin</h3>
        {d.satirlar.length === 0 ? (
          <p className="giris-not">Bu adımda metin yok.</p>
        ) : (
          <ol className="kosu-satirlar">
            {d.satirlar.map((s, i) => (
              <li key={`${String(i)}-${s.slice(0, 12)}`}>{s}</li>
            ))}
          </ol>
        )}
      </section>

      <section className="giris-blok">
        <h3>Slaytlar</h3>
        {d.varliklar.length === 0 ? (
          <p className="giris-not">Henüz görsel üretilmedi.</p>
        ) : (
          <div className="kosu-slaytlar">
            {d.varliklar.map((v) => (
              <a key={v.digest} href={`/api/varlik/${v.digest}`} target="_blank" rel="noreferrer">
                <img src={`/api/varlik/${v.digest}`} alt="üretilen slayt" />
              </a>
            ))}
          </div>
        )}
      </section>

      {d.kusurlar.length === 0 ? null : (
        <section className="giris-blok">
          <h3>Ölçülen kusurlar</h3>
          <ul className="kosu-kusur">
            {d.kusurlar.map((k, i) => (
              <li key={`${String(i)}-${k.tur ?? ''}`}>
                <strong>{k.tur ?? '—'}</strong> {k.aciklama ?? ''}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
