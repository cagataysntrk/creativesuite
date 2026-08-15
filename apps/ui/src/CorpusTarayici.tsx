// Corpus Browser (§12.9 · FAZ-4.3).
//
// **Kart değil SATIR.** Yoğunluk tablo lehine: bir ekranda kaç kayıt göründüğü, kaç
// kaydırma gerektiğini belirler ve bu ekranın işi taramaktır.
//
// **Silme düğmesi YOK.** Emeklilik silme değildir (R-12) ve arayüzde bir "sil" düğmesi
// olmaması bunun en görünür ifadesidir — kural belgede değil, ekranın kendisinde.

import { useCallback, useEffect, useState } from 'react'
import { foldForSearch } from '@suite/contracts/text'
import {
  BOS_FILTRE,
  durumIsareti,
  durumlar,
  eylemler,
  filtrele,
  tipler,
  type Filtre,
  type KayitSatiri,
} from './corpus.js'

const yolParcala = (path: string): { tip: string; slug: string } | null => {
  // `corpus/<entity_type>/<slug>.md` — kanonik yerleşim (§3.9).
  const m = /^corpus\/([^/]+)\/(.+)\.md$/.exec(path)
  return m === null ? null : { tip: m[1] ?? '', slug: m[2] ?? '' }
}

export const CorpusTarayici = (): React.JSX.Element => {
  const [satirlar, setSatirlar] = useState<readonly KayitSatiri[] | null>(null)
  const [hata, setHata] = useState<string | null>(null)
  const [filtre, setFiltre] = useState<Filtre>(BOS_FILTRE)
  const [mesaj, setMesaj] = useState<string | null>(null)

  const yukle = useCallback(async (): Promise<void> => {
    try {
      const r = await fetch('/api/kayitlar')
      const j = (await r.json()) as { kayitlar?: KayitSatiri[]; hata?: string }
      if (!r.ok) {
        // Hata TOAST değil, içeriğin olacağı yerde (§12.6) — ve boş liste GÖSTERİLMEZ:
        // boş bir tablo "corpus boş" okunur ve operatör kayıtlarının silindiğini sanır.
        setHata(j.hata ?? `sunucu ${r.status}`)
        setSatirlar(null)
        return
      }
      setHata(null)
      setSatirlar(j.kayitlar ?? [])
    } catch {
      setHata('sunucuya ulaşılamıyor')
      setSatirlar(null)
    }
  }, [])

  useEffect(() => {
    void yukle()
  }, [yukle])

  const eylem = async (
    r: KayitSatiri,
    ne: 'emekli' | 'sabitle',
    pinned?: boolean
  ): Promise<void> => {
    const p = yolParcala(r.path)
    if (p === null) {
      setMesaj(`yol tanınmadı: ${r.path}`)
      return
    }
    const y = await fetch(`/api/kayitlar/${p.tip}/${p.slug}/${ne}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(ne === 'sabitle' ? { pinned } : {}),
    })
    const j = (await y.json()) as { ok: boolean; mesaj?: string }
    setMesaj(j.ok ? null : (j.mesaj ?? 'işlem reddedildi'))
    await yukle()
  }

  if (hata !== null) {
    return (
      <div className="hata-kutusu">
        <p>{hata}</p>
        <button type="button" onClick={() => void yukle()}>
          Yeniden dene
        </button>
      </div>
    )
  }

  if (satirlar === null) return <p>yükleniyor…</p>

  const gorunen = filtrele(satirlar, filtre, foldForSearch)

  return (
    <section className="tarayici">
      <div className="filtre-cubugu">
        <input
          className="filtre-arama"
          placeholder="Ara… (aksana takılmaz)"
          value={filtre.arama}
          onChange={(e) => setFiltre({ ...filtre, arama: e.target.value })}
        />
        <select value={filtre.tip} onChange={(e) => setFiltre({ ...filtre, tip: e.target.value })}>
          <option value="">her tip</option>
          {tipler(satirlar).map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <select
          value={filtre.durum}
          onChange={(e) => setFiltre({ ...filtre, durum: e.target.value })}
        >
          <option value="">her durum</option>
          {durumlar(satirlar).map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
        <span className="olcum">
          {gorunen.length}
          <span className="birim">/ {satirlar.length} kayıt</span>
        </span>
      </div>

      {mesaj === null ? null : <p className="ret-mesaji">{mesaj}</p>}

      {gorunen.length === 0 ? (
        // Boş durum bir EYLEM DAVETİ, illüstrasyon sergisi değil (§12.6).
        <p className="bos">bu filtreyle kayıt yok — filtreyi genişletin</p>
      ) : (
        <table className="kayit-tablosu">
          <thead>
            <tr>
              <th>durum</th>
              <th>tip</th>
              <th>başlık</th>
              <th>dönem</th>
              <th>eylem</th>
            </tr>
          </thead>
          <tbody>
            {gorunen.map((r) => {
              const i = durumIsareti(r)
              const e = eylemler(r)
              return (
                <tr key={r.id}>
                  <td>
                    <span aria-hidden="true" style={{ color: i.token }}>
                      {i.glyph}
                    </span>{' '}
                    {i.metin}
                  </td>
                  <td>{r.type}</td>
                  <td title={r.path}>{r.title}</td>
                  <td className="olcum">{r.era_id}</td>
                  <td className="eylem-hucresi">
                    {/* Devre dışı düğme GÖSTERİLİR, gizlenmez: kaybolan bir düğme
                        "neden yapamıyorum" sorusunu hiç sordurmaz. */}
                    <button
                      type="button"
                      disabled={!e.sabitlenebilir}
                      title={e.neden ?? ''}
                      onClick={() => void eylem(r, 'sabitle', r.status !== 'pinned')}
                    >
                      {r.status === 'pinned' ? 'Sabitlemeyi kaldır' : 'Sabitle'}
                    </button>
                    <button
                      type="button"
                      disabled={!e.emekliEdilebilir}
                      title={e.neden ?? ''}
                      onClick={() => void eylem(r, 'emekli')}
                    >
                      Emekliye ayır
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
    </section>
  )
}
