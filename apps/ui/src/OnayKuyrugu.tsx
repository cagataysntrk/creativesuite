// Onay Kuyruğu (§12.5, §12.9 · R-14 · FAZ-4.7).
//
// **Tek elle çalışır.** `j`/`k` gezinme · `a` onayla · `r` reddet · `p` sabitle.
// Kuyruk bir gözden geçirme aracıdır ve fare her varlıkta eli klavyeden koparır (§12.5).
//
// **Red gerekçe ister ve gerekçe KALICIDIR.** Gerekçesiz bir "hayır", sonraki
// çalıştırmaya hiçbir bilgi taşımaz: sistem reddedildiğini bilir, nedenini bilmez ve
// aynı öneriyi tekrar getirir (§4.5).

import { useCallback, useEffect, useState } from 'react'
import { usdBicimle } from './baglanti.js'

interface Satir {
  readonly runId: string
  readonly pipeline: string
  readonly createdAt: string
  readonly gate: string
  readonly harcananMikros: string
  readonly tahminUstMikros: string
  readonly manifestSaglam: boolean
}

/**
 * ⚠ ⚠ **SIRA EKRANIN KARARI, SUNUCUNUN DEĞİL.** API en ESKİYİ önce veriyor ve bu bir
 * kuyruk sözleşmesi: bekleyen iş dipte unutulmaz. Ama komuta ekranında insanın
 * beklediği şey az önce başlattığı iştir; 62 bekleyenin altında kalan bir satır,
 * doğru veriyle yanlış işi öne koymaktır. İki doğru arasında seçim yapmak yerine
 * ikisi birden: sunucu sırasını korur, ekran kendi sırasını seçer.
 */
export interface OnayKuyruguOzellik {
  readonly sira?: 'eski' | 'yeni'
  /**
   * Satıra tıklanınca çağrılır — koşunun İÇERİĞİNİ açmak için.
   *
   * ⚠ ⚠ **TIKLAMA ÖLÜYDÜ ve bu ölçüldü.** Satıra tıklamak hiçbir şey yapmıyordu;
   * insan `run_01a0160e · metin-onayi` satırına bakıp onaylayacaktı, NEYİ
   * onayladığını görmeden. Bir liste bir komuta merkezi değildir.
   */
  readonly ac?: (runId: string) => void
}

export const OnayKuyrugu = ({ sira = 'eski', ac }: OnayKuyruguOzellik = {}): React.JSX.Element => {
  const [satirlar, setSatirlar] = useState<readonly Satir[] | null>(null)
  const [secili, setSecili] = useState(0)
  const [gerekce, setGerekce] = useState<string | null>(null)
  const [mesaj, setMesaj] = useState<string | null>(null)

  const yukle = useCallback(async (): Promise<void> => {
    try {
      const r = await fetch('/api/kuyruk')
      const j = (await r.json()) as { bekleyenler: Satir[] }
      setSatirlar(
        sira === 'yeni'
          ? [...j.bekleyenler].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
          : j.bekleyenler
      )
      setSecili((s) => Math.min(s, Math.max(0, j.bekleyenler.length - 1)))
    } catch {
      setMesaj('sunucuya ulaşılamıyor')
      setSatirlar([])
    }
  }, [])

  useEffect(() => {
    void yukle()
  }, [yukle])

  const kararGonder = useCallback(
    async (s: Satir, karar: 'approved' | 'rejected', not: string): Promise<void> => {
      const r = await fetch(`/api/kuyruk/${s.runId}/${s.gate}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ karar, gerekce: not }),
      })
      const j = (await r.json()) as { ok: boolean; hata?: string; defter?: string | null }
      setMesaj(
        j.ok
          ? j.defter === null || j.defter === undefined
            ? 'onaylandı'
            : 'reddedildi — gerekçe sticky deftere yazıldı'
          : (j.hata ?? 'karar yazılamadı')
      )
      setGerekce(null)
      await yukle()
    },
    [yukle]
  )

  // Klavye kabuğa bağlı, satıra değil: odak nerede olursa olsun aynı tuş aynı işi yapar.
  useEffect(() => {
    const dinle = (e: KeyboardEvent): void => {
      // Gerekçe yazılırken tuşlar KOMUT DEĞİL metindir — yoksa "a" harfi onay verirdi.
      if (gerekce !== null) return
      const liste = satirlar ?? []
      if (liste.length === 0) return
      const s = liste[secili]
      if (s === undefined) return

      if (e.key === 'j') setSecili((x) => Math.min(liste.length - 1, x + 1))
      else if (e.key === 'k') setSecili((x) => Math.max(0, x - 1))
      else if (e.key === 'a') void kararGonder(s, 'approved', '')
      else if (e.key === 'r') setGerekce('')
    }
    document.addEventListener('keydown', dinle)
    return () => document.removeEventListener('keydown', dinle)
  }, [satirlar, secili, gerekce, kararGonder])

  if (satirlar === null) return <p>kuyruk yükleniyor…</p>

  const s = satirlar[secili]

  return (
    <section className="kuyruk">
      <header className="detay-baslik">
        <h2>Onay kuyruğu</h2>
        <span className="olcum">
          {satirlar.length}
          <span className="birim">bekleyen</span>
        </span>
      </header>

      <p className="baglam-neden">
        <kbd>j</kbd>/<kbd>k</kbd> gezin · <kbd>a</kbd> onayla · <kbd>r</kbd> reddet — fareye
        dokunmadan
      </p>

      {mesaj === null ? null : <p className="ret-mesaji">{mesaj}</p>}

      {satirlar.length === 0 ? (
        // Boş kuyruk bir BAŞARIDIR ve öyle yazılır; boş bir liste bunu söylemez.
        <p className="bos">bekleyen onay yok — kuyruk temiz</p>
      ) : (
        <table className="kayit-tablosu">
          <thead>
            <tr>
              <th>çalıştırma</th>
              <th>pipeline</th>
              <th>kapı</th>
              <th>harcanan</th>
              <th>manifest</th>
            </tr>
          </thead>
          <tbody>
            {satirlar.map((r, i) => (
              <tr
                key={r.runId}
                data-secili={i === secili}
                data-tiklanir={ac === undefined ? undefined : true}
                onClick={() => {
                  setSecili(i)
                  ac?.(r.runId)
                }}
              >
                <td className="olcum">{r.runId.slice(0, 12)}</td>
                <td>{r.pipeline}</td>
                <td>{r.gate}</td>
                <td className="olcum">{usdBicimle(r.harcananMikros)}</td>
                <td>
                  {r.manifestSaglam ? (
                    '✓'
                  ) : (
                    // Kusurlu manifestli çıktı zaten yayınlanamaz (D-155) — onay
                    // verirken bunu bilmek şart, yoksa yayınlanamaz bir şey onaylanır.
                    <span style={{ color: 'var(--role-state-error)' }}>⊘ kusurlu</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {gerekce === null || s === undefined ? null : (
        <div className="gerekce-kutusu">
          <label htmlFor="gerekce">red gerekçesi (zorunlu)</label>
          <input
            id="gerekce"
            className="filtre-arama"
            autoFocus
            value={gerekce}
            onChange={(e) => setGerekce(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && gerekce.trim() !== '') {
                void kararGonder(s, 'rejected', gerekce)
              } else if (e.key === 'Escape') setGerekce(null)
            }}
          />
          <span className="baglam-neden">Enter ile gönder · Esc ile vazgeç</span>
        </div>
      )}
    </section>
  )
}
