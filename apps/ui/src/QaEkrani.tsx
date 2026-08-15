// Bir çalıştırmanın tolerans raporu (§11.1, §12.9 · FAZ-4.8).
//
// Bileşen `@suite/ui`den geliyor — bu ekran yalnız veriyi getiriyor. Ölçüm ekranının
// kendisi paylaşılan halkada, çünkü aynı okuma onay kuyruğunda, çalıştırma geçmişinde
// ve varlık kitaplığında da görünecek.

import { useEffect, useState } from 'react'
import { ToleransRaporu } from '@suite/ui/tolerans'
import type { QaReport, ToleranceReading } from '@suite/contracts'

interface Yanit {
  readonly ok: boolean
  readonly olculdu?: boolean
  readonly readings?: readonly ToleranceReading[]
  readonly blocked?: boolean
  readonly warnings?: number
  readonly hata?: string
}

export const QaEkrani = ({ runId }: { runId: string }): React.JSX.Element => {
  const [y, setY] = useState<Yanit | null>(null)

  useEffect(() => {
    void fetch(`/api/calistirma/${encodeURIComponent(runId)}/qa`)
      .then((r) => r.json() as Promise<Yanit>)
      .then(setY)
      .catch(() => setY({ ok: false, hata: 'sunucuya ulaşılamıyor' }))
  }, [runId])

  if (y === null) return <p>ölçümler yükleniyor…</p>
  if (!y.ok) return <div className="hata-kutusu">{y.hata ?? 'okunamadı'}</div>

  // **"Ölçülmedi" ile "geçti" AYRI cümleler.** Boş bir rapor gösterip sessiz kalmak,
  // hiç QA koşmamış bir varlığı temiz göstermek olurdu.
  if (y.olculdu !== true) {
    return (
      <section>
        <h2>Tolerans raporu</h2>
        <p className="bos">bu çalıştırmada QA ÖLÇÜLMEDİ — bu bir “geçti” değildir (§11.1)</p>
      </section>
    )
  }

  const rapor: QaReport = {
    readings: y.readings ?? [],
    blocked: y.blocked === true,
    warnings: y.warnings ?? 0,
  }

  return (
    <section>
      <h2>Tolerans raporu</h2>
      <ToleransRaporu report={rapor} />
    </section>
  )
}
