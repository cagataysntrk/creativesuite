// Placement Preview ekranı (§9.1, §12.9 · FAZ-4.9).
//
// Contact sheet: her yerleşim yan yana, aynı içerik kutusuyla. Tek bir yerleşimde
// doğru görünen bir başlık, diğerinde chrome altına düşebilir — ve bunu ancak yan
// yana koyunca görürsünüz.

import { useEffect, useState } from 'react'
import { YerlesimOnizleme, type Tasma } from '@suite/ui/yerlesim'
import type { Placement, SafeBand } from '@suite/contracts'

interface Satir extends Placement {
  readonly band: SafeBand
  readonly yasGun: number
}

/**
 * Taşma hesabı BURADA tekrarlanmaz — sunucudan gelen banda karşı ölçülür.
 * `render`ın `safeAreaViolations`ı tarayıcıya import edilemez (Playwright çeker),
 * ama aynı aritmetik: bandın dışına çıkan her kenar, pikseliyle.
 */
const tasmalar = (
  band: SafeBand,
  r: { x: number; y: number; width: number; height: number }
): readonly Tasma[] => {
  const v: Tasma[] = []
  if (r.y < band.y) v.push({ edge: 'top', overflowPx: band.y - r.y })
  if (r.x < band.x) v.push({ edge: 'start', overflowPx: band.x - r.x })
  const alt = r.y + r.height - (band.y + band.height)
  if (alt > 0) v.push({ edge: 'bottom', overflowPx: alt })
  const sag = r.x + r.width - (band.x + band.width)
  if (sag > 0) v.push({ edge: 'end', overflowPx: sag })
  return v
}

export const YerlesimEkrani = (): React.JSX.Element => {
  const [satirlar, setSatirlar] = useState<readonly Satir[] | null>(null)
  // Başlık kutusunun üst kenarı, master yüksekliğinin yüzdesi olarak. Kaydırınca
  // hangi yerleşimde chrome altına düştüğü CANLI görünür.
  const [ustYuzde, setUstYuzde] = useState(30)

  useEffect(() => {
    void fetch('/api/yerlesimler')
      .then((r) => r.json() as Promise<{ yerlesimler: Satir[] }>)
      .then((j) => setSatirlar(j.yerlesimler))
      .catch(() => setSatirlar([]))
  }, [])

  if (satirlar === null) return <p>yerleşimler yükleniyor…</p>
  if (satirlar.length === 0) return <div className="hata-kutusu">yerleşim spec'i okunamadı</div>

  return (
    <section>
      <h2>Yerleşim önizleme</h2>

      <div className="filtre-cubugu">
        <label htmlFor="ust">başlık üst kenarı: %{ustYuzde}</label>
        <input
          id="ust"
          type="range"
          min={0}
          max={90}
          value={ustYuzde}
          onChange={(e) => setUstYuzde(Number(e.target.value))}
        />
      </div>

      <div className="contact-sheet">
        {satirlar.map((p) => {
          // Aynı içerik kutusu HER yerleşimde: contact sheet'in tek işi bu
          // karşılaştırmayı mümkün kılmak.
          const icerik = {
            x: Math.round(p.width * 0.1),
            y: Math.round(p.height * (ustYuzde / 100)),
            width: Math.round(p.width * 0.8),
            height: Math.round(p.height * 0.12),
          }
          return (
            <YerlesimOnizleme
              key={p.id}
              placement={p}
              band={p.band}
              yasGun={p.yasGun}
              icerik={icerik}
              tasmalar={tasmalar(p.band, icerik)}
            />
          )
        })}
      </div>
    </section>
  )
}
