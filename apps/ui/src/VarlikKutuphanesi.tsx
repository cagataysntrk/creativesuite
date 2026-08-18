// Asset Library (§12.9, §3.5 · FAZ-4.14).
//
// Kütüphanenin tek işi **harcanmış paranın karşılığını görünür kılmak**: premium bir
// varlık üretilmiş ama hiç yayınlanmamışsa o para değere dönüşmemiştir.
//
// **Reuse varlığı değil, KARARI kopyalar** (§4c): donmuş girdiler, konu, bağlam.
// Baytı kopyalamak yeni bir iş üretmez; kararı kopyalamak LLM'i yeniden çalıştırmadan
// benzer bir iş üretir — hem ucuz hem tutarlı.

import { useCallback, useEffect, useState } from 'react'
import { foldForSearch } from '@suite/contracts/text'
import { usdBicimle } from './baglanti.js'

interface Varlik {
  readonly digest: string
  readonly ext: string
  readonly bytes: number
  readonly createdAt: string
  readonly sourceRunId: string
  readonly pipeline: string
  readonly konu: string
  readonly lane: 'free' | 'premium' | null
  readonly harcananMikros: string
  readonly yayinlandi: boolean
  readonly manifestSaglam: boolean
}

interface Yanit {
  readonly varliklar: readonly Varlik[]
  readonly karantina: number
  readonly yayinDefteriYok: boolean
  readonly bosaHarcananMikros: string
}

export const VarlikKutuphanesi = (): React.JSX.Element => {
  const [y, setY] = useState<Yanit | null>(null)
  const [arama, setArama] = useState('')
  // "Para harcandı, değer alınmadı" filtresi — kütüphanenin var olma sebebi.
  const [sadeceBosa, setSadeceBosa] = useState(false)
  const [reuse, setReuse] = useState<string | null>(null)

  useEffect(() => {
    void fetch('/api/varliklar')
      .then((r) => r.json() as Promise<Yanit>)
      .then(setY)
      .catch(() =>
        setY({ varliklar: [], karantina: 0, yayinDefteriYok: true, bosaHarcananMikros: '0' })
      )
  }, [])

  const yenidenKullan = useCallback(async (runId: string): Promise<void> => {
    const r = await fetch(`/api/varliklar/${encodeURIComponent(runId)}/yeniden-kullan`)
    const j = (await r.json()) as {
      ok: boolean
      hata?: string
      pipeline?: string
      params?: unknown
    }
    setReuse(
      j.ok
        ? `${j.pipeline} · donmuş girdiler: ${JSON.stringify(j.params)}`
        : (j.hata ?? 'yeniden kullanılamadı')
    )
  }, [])

  if (y === null) return <p>kütüphane yükleniyor…</p>

  const q = foldForSearch(arama.trim())
  const gorunen = y.varliklar.filter((v) => {
    if (sadeceBosa && !(v.lane === 'premium' && !v.yayinlandi)) return false
    if (q === '') return true
    return foldForSearch(`${v.konu} ${v.pipeline} ${v.sourceRunId} ${v.digest}`).includes(q)
  })

  return (
    <section>
      <header className="detay-baslik">
        <h2>Varlık kütüphanesi</h2>
        <span className="olcum">
          {y.varliklar.length}
          <span className="birim">varlık</span>
        </span>
      </header>

      {/* Karantina listeye GİRMEZ ama sayılır: boş bir kütüphane açıklanamaz olmasın. */}
      {y.karantina === 0 ? null : (
        <p className="ret-mesaji">
          ⊘ {y.karantina} varlık karantinada — kusurlu manifest'ten üretildiler ve yayınlanamazlar
          (D-155). Kütüphanede görünmezler.
        </p>
      )}

      {y.yayinDefteriYok ? (
        // "Yayınlanmadı" bir ÖLÇÜM değil bir varsayım: defter hiç yok.
        <p className="baglam-neden">
          ⓘ yayın defteri henüz yok — “yayınlanmadı” bilgisi bir ölçüm değil, varsayım
        </p>
      ) : null}

      <div className="filtre-cubugu">
        <input
          className="filtre-arama"
          placeholder="Ara… (konu, hat, çalıştırma — aksana takılmaz)"
          value={arama}
          onChange={(e) => setArama(e.target.value)}
        />
        <label>
          <input
            type="checkbox"
            checked={sadeceBosa}
            onChange={(e) => setSadeceBosa(e.target.checked)}
          />{' '}
          premium üretildi ama hiç yayınlanmadı
        </label>
        <span className="olcum">
          {usdBicimle(y.bosaHarcananMikros)}
          <span className="birim">karşılığı alınmamış</span>
        </span>
      </div>

      {gorunen.length === 0 ? (
        <p className="bos">
          {y.varliklar.length === 0
            ? 'kütüphane boş — henüz hiç varlık üretilmedi (bu bir hata değil)'
            : 'bu filtreyle varlık yok'}
        </p>
      ) : (
        <table className="kayit-tablosu">
          <thead>
            <tr>
              {/* ⚠ ⚠ **ÖNİZLEME OLMADAN VARLIK KÜTÜPHANESİ BİR HASH LİSTESİDİR.**
                  305 satır vardı ve ekranda `img` sayısı SIFIRDI: kullanıcı hangi
                  varlığın ne olduğunu ancak açarak öğrenebiliyordu. Bir kütüphane,
                  içindekini göstermiyorsa katalog değil envanterdir. */}
              <th aria-label="önizleme" />
              <th>konu</th>
              <th>hat</th>
              <th>şerit</th>
              <th>harcanan</th>
              <th>durum</th>
              <th>eylem</th>
            </tr>
          </thead>
          <tbody>
            {gorunen.map((v) => (
              <tr key={v.digest}>
                <td>
                  <a href={`/api/varlik/${v.digest}`} target="_blank" rel="noreferrer">
                    <img
                      className="varlik-onizleme"
                      src={`/api/varlik/${v.digest}`}
                      alt={v.konu === '' ? 'üretilen varlık' : v.konu}
                      loading="lazy"
                    />
                  </a>
                </td>
                <td>{v.konu === '' ? <span className="birim">konusuz</span> : v.konu}</td>
                <td>{v.pipeline}</td>
                <td className="olcum">{v.lane ?? '—'}</td>
                <td className="olcum">{usdBicimle(v.harcananMikros)}</td>
                <td>
                  {!v.manifestSaglam ? (
                    <span style={{ color: 'var(--role-state-error)' }}>⊘ kusurlu manifest</span>
                  ) : v.yayinlandi ? (
                    '● yayında'
                  ) : (
                    <span style={{ color: 'var(--role-state-warn)' }}>◐ yayınlanmadı</span>
                  )}
                </td>
                <td>
                  <button
                    type="button"
                    className="baglanti"
                    onClick={() => void yenidenKullan(v.sourceRunId)}
                  >
                    Yeniden kullan
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {reuse === null ? null : <p className="baglam-neden">{reuse}</p>}
    </section>
  )
}
