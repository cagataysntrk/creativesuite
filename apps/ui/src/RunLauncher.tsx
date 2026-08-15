// Run Launcher (§8.3, §12.9 · R-07 · FAZ-4.6b).
//
// **Başlat düğmesi, gösterilen plana bağlıdır.** Ekranda bir tahmin gösterip başka bir
// planı koşturmak, onayı anlamsız kılar — bu yüzden plan burada DONAR ve donmuş hâli
// çalıştırmaya geri verilir (R-07).
//
// **Tahmin bir BANT.** Tek sayı göstermek, üst uçtan gelen faturayı hata gibi
// hissettirir; oysa aralık onu zaten söylüyordu (§8.3).

import { useCallback, useEffect, useState } from 'react'
import { usdBicimle } from './baglanti.js'

interface FrozenStep {
  readonly stepId: string
  readonly verb: string
  readonly capability: string | null
  readonly metered: boolean
  readonly providerId: string | null
  readonly confidence: 'green' | 'amber' | 'red' | null
  readonly estimatedCost: { readonly low: { micros: string }; readonly high: { micros: string } }
}

interface Frozen {
  readonly digest: string
  readonly corpusCommit: string
  readonly registryCommit: string
  readonly frozenAt: string
  readonly steps: readonly FrozenStep[]
  readonly totalLow: { readonly micros: string }
  readonly totalHigh: { readonly micros: string }
}

interface Sonuc {
  readonly ok: boolean
  readonly hata?: string
  readonly frozen?: Frozen
  readonly bloklar?: readonly { readonly kind: string; readonly mesaj: string }[]
}

/** Güven noktası: renk TEK BAŞINA anlam taşımaz — glyph + metin de var (§12.6). */
const guvenIsareti = (c: FrozenStep['confidence']): { glyph: string; metin: string } => {
  if (c === 'green') return { glyph: '●', metin: 'kesin fiyat' }
  if (c === 'amber') return { glyph: '◐', metin: 'doğrulanmamış fiyat' }
  if (c === 'red') return { glyph: '○', metin: 'fiyatlanamaz' }
  return { glyph: '·', metin: 'ücretsiz adım' }
}

export const RunLauncher = ({ pipeline }: { pipeline: string }): React.JSX.Element => {
  const [sonuc, setSonuc] = useState<Sonuc | null>(null)
  const [tavan, setTavan] = useState('')

  const yukle = useCallback(async (): Promise<void> => {
    const q = new URLSearchParams({ pipeline })
    if (tavan.trim() !== '') q.set('tavan_mikros', String(Math.round(Number(tavan) * 1_000_000)))
    try {
      const r = await fetch(`/api/plan?${q.toString()}`)
      setSonuc((await r.json()) as Sonuc)
    } catch {
      setSonuc({ ok: false, hata: 'sunucuya ulaşılamıyor' })
    }
  }, [pipeline, tavan])

  useEffect(() => {
    void yukle()
  }, [yukle])

  if (sonuc === null) return <p>plan kuruluyor…</p>
  if (!sonuc.ok || sonuc.frozen === undefined) {
    return <div className="hata-kutusu">{sonuc.hata ?? 'plan kurulamadı'}</div>
  }

  const f = sonuc.frozen
  const bloklar = sonuc.bloklar ?? []
  const kilitli = bloklar.length > 0

  return (
    <section className="launcher">
      <header className="detay-baslik">
        <h2>Çalıştır — {pipeline}</h2>
        {/* Aralık, tek sayı DEĞİL. Güven noktası adım tablosunda. */}
        <span className="olcum">
          {usdBicimle(f.totalLow.micros)} – {usdBicimle(f.totalHigh.micros)}
          <span className="birim">tahmini</span>
        </span>
      </header>

      <div className="filtre-cubugu">
        <label htmlFor="tavan">bütçe tavanı (USD)</label>
        <input
          id="tavan"
          className="filtre-arama"
          inputMode="decimal"
          placeholder="tavan yok"
          value={tavan}
          onChange={(e) => setTavan(e.target.value)}
        />
      </div>

      {/* Kilit SEBEBİYLE gösterilir. Devre dışı bir düğme, sebebi yazmadan
          "neden yapamıyorum" sorusunu cevapsız bırakır. */}
      {kilitli ? (
        <ul className="kilit-listesi">
          {bloklar.map((b) => (
            <li key={b.kind} className="ret-mesaji">
              ⊘ {b.mesaj}
            </li>
          ))}
        </ul>
      ) : null}

      <table className="kayit-tablosu">
        <thead>
          <tr>
            <th>adım</th>
            <th>fiil</th>
            <th>sağlayıcı</th>
            <th>güven</th>
            <th>tahmin</th>
          </tr>
        </thead>
        <tbody>
          {f.steps.map((s) => {
            const g = guvenIsareti(s.confidence)
            return (
              <tr key={s.stepId}>
                <td>{s.stepId}</td>
                <td className="olcum">{s.verb}</td>
                <td>{s.providerId ?? '—'}</td>
                <td title={g.metin}>
                  <span aria-hidden="true">{g.glyph}</span> {g.metin}
                </td>
                <td className="olcum">
                  {s.metered
                    ? `${usdBicimle(s.estimatedCost.low.micros)} – ${usdBicimle(s.estimatedCost.high.micros)}`
                    : '—'}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      <p className="baglam-neden">
        {/* Donmuş plan KİMLİĞİ ekranda: onay bu özete veriliyor ve çalıştırma aynı
            özetle koşuyor. Görünmeseydi "aynı plan mı" sorusu sorulamazdı. */}
        donmuş plan <span className="olcum">{f.digest.slice(7, 19)}</span> · corpus{' '}
        <span className="olcum">{f.corpusCommit.slice(0, 8)}</span> · registry{' '}
        <span className="olcum">{f.registryCommit.slice(0, 8)}</span>
      </p>

      <button type="button" disabled={kilitli} className="baslat">
        {kilitli ? 'Başlat — KİLİTLİ' : 'Başlat'}
      </button>
    </section>
  )
}
