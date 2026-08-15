// Discovery / Reconciliation (§4.4, §12.9 · FAZ-4.10).
//
// **Beş sütun.** Plan arşivi dört diyordu (DEĞİŞMEDİ / DEĞİŞTİ / ÇELİŞTİ / YENİ) ama
// motorun ürettiği `retire` hiçbirine düşmüyordu — ve emeklilik mirror modunun en
// sonuçlu op'u. Dördüncüye sıkıştırmak, silinen bir kaydı "değişti"nin arkasına
// gizlemek olurdu (D-177).
//
// **DEĞİŞMEDİ sütunu KATLI gelir.** İdempotent atlama sayesinde ikinci çalıştırmada
// oranın tamamı dolar; açık gelseydi ekran bir gürültü duvarı olur ve ÇELİŞTİ sütunu
// dipte kalırdı (§4.4: 900 opluk bir plan incelenmez, kabul edilir).

import { useEffect, useState } from 'react'
import type { DiscoveryOpView, HaltedRecord, ReconcileColumn } from '@suite/contracts'

interface Yanit {
  readonly ok: boolean
  readonly hata?: string
  readonly halted?: readonly HaltedRecord[]
  readonly etiketler?: Readonly<Record<ReconcileColumn, string>>
  readonly sutunlar?: Readonly<Record<ReconcileColumn, readonly DiscoveryOpView[]>>
}

const SIRA: readonly ReconcileColumn[] = ['conflicted', 'changed', 'new', 'retired', 'unchanged']

export const DiscoveryEkrani = ({ runId }: { runId: string }): React.JSX.Element => {
  const [y, setY] = useState<Yanit | null>(null)
  const [acik, setAcik] = useState(false)

  useEffect(() => {
    void fetch(`/api/discovery?run=${encodeURIComponent(runId)}`)
      .then((r) => r.json() as Promise<Yanit>)
      .then(setY)
      .catch(() => setY({ ok: false, hata: 'sunucuya ulaşılamıyor' }))
  }, [runId])

  if (y === null) return <p>plan yükleniyor…</p>
  if (!y.ok) return <div className="hata-kutusu">{y.hata ?? 'plan okunamadı'}</div>

  const sutunlar = y.sutunlar
  const etiketler = y.etiketler
  if (sutunlar === undefined || etiketler === undefined) {
    return <div className="hata-kutusu">plan biçimi tanınmadı</div>
  }

  const halted = y.halted ?? []

  return (
    <section>
      <h2>Keşif planı — inceleme</h2>

      {/* İmza kırıksa plan UYGULANAMAZ ve bu en üstte durur: aşağıdaki sütunlar
          uygulanabilir gibi görünmemeli (§4.4). */}
      {halted.length === 0 ? null : (
        <div className="hata-kutusu">
          <p className="ret-mesaji">✗ PLAN DURDU — {halted.length} kaydın imzası kırık</p>
          <ul className="tasma-listesi">
            {halted.map((h) => (
              <li key={h.recordId}>
                <span className="olcum">{h.path}</span> — {h.reason}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="sutunlar">
        {SIRA.map((c) => {
          const ops = sutunlar[c] ?? []
          // DEĞİŞMEDİ katlı; diğerleri açık. Dikkat, iş bekleyen sütunlara ait.
          const katli = c === 'unchanged' && !acik
          return (
            <div key={c} className="sutun" data-sutun={c}>
              <h3>
                {etiketler[c]}{' '}
                <span className="olcum">
                  {ops.length}
                  <span className="birim">op</span>
                </span>
              </h3>

              {ops.length === 0 ? (
                // Boş sütun SESSİZ kalmaz: "hiç çelişki yok" bir sonuçtur ve
                // sütunun hiç çizilmemesiyle karıştırılmamalı.
                <p className="bos">yok</p>
              ) : katli ? (
                <button type="button" className="baglanti" onClick={() => setAcik(true)}>
                  {ops.length} atlanan op — göster
                </button>
              ) : (
                <ul className="op-listesi">
                  {ops.map((o) => (
                    <li key={`${o.recordId}-${o.why}`}>
                      <span className="olcum">{o.path}</span>
                      <div className="baglam-neden">{o.reason}</div>
                      {o.suppressedFields === undefined ||
                      o.suppressedFields.length === 0 ? null : (
                        <div className="ret-mesaji">
                          dokunulmayan alanlar: {o.suppressedFields.join(', ')}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
