// Cost & Budget (§8.3, §12.9 · D-17 · FAZ-4.12).
//
// Üç soru: **ne harcandı · tahmin ne kadar tuttu · tavan nerede.**
//
// **Tavan UI'dan ayarlanır ve git'te yaşar** (D-179). Env değişkeni olsaydı iki makinede
// farklı olur ve "hangi tavanla koştu" sorusu cevapsız kalırdı.

import { useCallback, useEffect, useState } from 'react'
import { usdBicimle } from './baglanti.js'

interface Calistirma {
  readonly runId: string
  readonly pipeline: string
  readonly createdAt: string
  readonly tahminAltMikros: string
  readonly tahminUstMikros: string
  readonly gercekMikros: string
  readonly sapmaYuzde: number | null
  readonly onemli: boolean
}

interface Pano {
  readonly tavan: {
    readonly perRunMicros: string | null
    readonly perMonthMicros: string | null
    readonly updatedAt: string
    readonly varsayilan: boolean
  }
  readonly calistirmalar: readonly Calistirma[]
  readonly toplamGercekMikros: string
  readonly sapan: number
  readonly kota: null
}

/** Doluluk göstergesi — "1000 kredi" yazısı değil (§4b). */
const Doluluk = ({ deger, tavan }: { deger: bigint; tavan: bigint | null }) => {
  if (tavan === null) {
    // Tavansızlık bir DURUM: boş bir çubuk "hiç harcanmadı" okunurdu.
    return <span className="baglam-neden">tavan yok</span>
  }
  const oran = tavan === 0n ? 1 : Math.min(1, Number((deger * 100n) / tavan) / 100)
  return (
    <span className="cubuk" title={`${deger} / ${tavan} mikro USD`}>
      <span className="cubuk-dolu" style={{ inlineSize: `${Math.round(oran * 100)}%` }} />
    </span>
  )
}

export const ButceEkrani = (): React.JSX.Element => {
  const [p, setP] = useState<Pano | null>(null)
  const [run, setRun] = useState('')
  const [ay, setAy] = useState('')
  const [mesaj, setMesaj] = useState<string | null>(null)

  const yukle = useCallback(async (): Promise<void> => {
    try {
      const j = (await (await fetch('/api/butce')).json()) as Pano
      setP(j)
      setRun(j.tavan.perRunMicros ?? '')
      setAy(j.tavan.perMonthMicros ?? '')
    } catch {
      setMesaj('sunucuya ulaşılamıyor')
    }
  }, [])

  useEffect(() => {
    void yukle()
  }, [yukle])

  const kaydet = async (): Promise<void> => {
    const r = await fetch('/api/butce', {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        perRunMicros: run.trim() === '' ? null : run.trim(),
        perMonthMicros: ay.trim() === '' ? null : ay.trim(),
      }),
    })
    const j = (await r.json()) as { ok: boolean; hata?: string }
    setMesaj(
      j.ok
        ? 'tavan yazıldı — `git diff` ile görün, commit sizin kararınız (R-14)'
        : (j.hata ?? 'yazılamadı')
    )
    await yukle()
  }

  if (p === null) return <p>{mesaj ?? 'bütçe yükleniyor…'}</p>

  const toplam = BigInt(p.toplamGercekMikros)
  const ayTavan = p.tavan.perMonthMicros === null ? null : BigInt(p.tavan.perMonthMicros)

  return (
    <section>
      <header className="detay-baslik">
        <h2>Maliyet ve bütçe</h2>
        <span className="olcum">
          {usdBicimle(p.toplamGercekMikros)}
          <span className="birim">toplam gerçek</span>
        </span>
      </header>

      <div className="filtre-cubugu">
        <span className="baglam-neden">aylık doluluk</span>
        <Doluluk deger={toplam} tavan={ayTavan} />
      </div>

      <h3>Tavanlar</h3>
      {p.tavan.varsayilan ? (
        // Varsayılan kullanılıyorsa SÖYLENİR: kullanıcı koyduğunu sanan bir tavanla
        // koşmak, tavan koymamaktan tehlikelidir.
        <p className="ret-mesaji">
          ⚠ `registry/butce.yaml` okunamadı — VARSAYILAN tavan kullanılıyor
        </p>
      ) : null}
      <div className="filtre-cubugu">
        <label htmlFor="run">çalıştırma (mikro USD)</label>
        <input
          id="run"
          className="filtre-arama"
          inputMode="numeric"
          placeholder="boş = tavan yok"
          value={run}
          onChange={(e) => setRun(e.target.value)}
        />
        <label htmlFor="ay">aylık</label>
        <input
          id="ay"
          className="filtre-arama"
          inputMode="numeric"
          placeholder="boş = tavan yok"
          value={ay}
          onChange={(e) => setAy(e.target.value)}
        />
        <button type="button" className="baslat" onClick={() => void kaydet()}>
          Tavanı yaz
        </button>
      </div>
      {mesaj === null ? null : <p className="baglam-neden">{mesaj}</p>}

      <h3>
        Çalıştırmalar{' '}
        {p.sapan > 0 ? (
          <span className="ret-mesaji">· {p.sapan} tanesi %20 üstü sapma gösteriyor</span>
        ) : null}
      </h3>
      <table className="kayit-tablosu">
        <thead>
          <tr>
            <th>çalıştırma</th>
            <th>pipeline</th>
            <th>tahmin</th>
            <th>gerçek</th>
            <th>sapma</th>
          </tr>
        </thead>
        <tbody>
          {p.calistirmalar.map((c) => (
            <tr key={c.runId}>
              <td className="olcum">{c.runId.slice(0, 12)}</td>
              <td>{c.pipeline}</td>
              <td className="olcum">
                {usdBicimle(c.tahminAltMikros)} – {usdBicimle(c.tahminUstMikros)}
              </td>
              <td className="olcum">{usdBicimle(c.gercekMikros)}</td>
              <td className="olcum">
                {/* `null` = tahmin sıfır, oran TANIMSIZ — "%0 sapma" demek yanlış olurdu. */}
                {c.sapmaYuzde === null ? (
                  <span className="birim">tahmin yok</span>
                ) : (
                  <span style={c.onemli ? { color: 'var(--role-state-warn)' } : undefined}>
                    {c.sapmaYuzde > 0 ? '+' : ''}
                    {c.sapmaYuzde}%{c.onemli ? ' ⚠' : ''}
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>Bedava kota</h3>
      {/* ÖLÇÜLMÜYOR ve bu yazılıyor. Uydurulmuş bir doluluk, hiç göstergesi
          olmamaktan tehlikelidir (D-175). */}
      <p className="bos">
        kota sayaçları ÖLÇÜLMÜYOR — sağlayıcı kota uçları FAZ-7.8'de bağlanacak. Bu “kota bitti”
        DEĞİLDİR.
      </p>
    </section>
  )
}
