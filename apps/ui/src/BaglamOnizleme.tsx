// Context Preview (§5.3, §12.9 · FAZ-4.5).
//
// Ekranın sorusu: **"bu pipeline çalışırsa prompt'a ne girecek ve neden?"**
//
// **Kapatma bir KARARDIR, bir filtre değil.** Kapatılan kart listeden silinmez; üstü
// çizili durur ve manifeste `insan kapattı` gerekçesiyle yazılır (§5.3). Silseydik
// aynı girdi iki farklı çıktı üretir ve farkın sebebi hiçbir yerde durmazdı.

import { useCallback, useEffect, useState } from 'react'

interface Included {
  readonly id: string
  readonly title: string
  readonly tokenEstimate: number
  readonly reason: string
}

interface Section {
  readonly id: string
  readonly entityType: string
  readonly tokenBudget: number
  readonly tokenEstimate: number
  readonly included: readonly Included[]
  readonly dropped: readonly { readonly id: string; readonly reason: string }[]
}

interface Manifest {
  readonly recipeId: string
  readonly totalBudget: number
  readonly tokenEstimate: number
  readonly sections: readonly Section[]
  readonly truncated: boolean
}

interface Sonuc {
  readonly ok: boolean
  readonly hata?: string
  readonly manifest?: Manifest
  readonly adaylar?: Readonly<Record<string, readonly { id: string; title: string }[]>>
  readonly bosNedenleri?: Readonly<Record<string, string | null>>
}

const Cubuk = ({ deger, tavan }: { deger: number; tavan: number }) => {
  const oran = tavan === 0 ? 0 : Math.min(1, deger / tavan)
  return (
    <span className="cubuk" title={`${deger} / ${tavan} tahmini token`}>
      {/* Tavan ETİKETLİ bir spec-limit çizgisidir, çubuğun sonu değil: dolu bir çubuk
          "bitti" değil "sınırdasın" demek ve ikisi farklı kararlar gerektirir. */}
      <span className="cubuk-dolu" style={{ inlineSize: `${Math.round(oran * 100)}%` }} />
    </span>
  )
}

export const BaglamOnizleme = ({ tarif }: { tarif: string }): React.JSX.Element => {
  const [sonuc, setSonuc] = useState<Sonuc | null>(null)
  const [haric, setHaric] = useState<readonly string[]>([])

  const yukle = useCallback(async (): Promise<void> => {
    const q = new URLSearchParams()
    q.set('tarif', tarif)
    for (const h of haric) q.append('haric', h)
    try {
      const r = await fetch(`/api/baglam?${q.toString()}`)
      setSonuc((await r.json()) as Sonuc)
    } catch {
      setSonuc({ ok: false, hata: 'sunucuya ulaşılamıyor' })
    }
  }, [tarif, haric])

  useEffect(() => {
    void yukle()
  }, [yukle])

  if (sonuc === null) return <p>yükleniyor…</p>
  if (!sonuc.ok || sonuc.manifest === undefined) {
    return <div className="hata-kutusu">{sonuc.hata ?? 'bağlam okunamadı'}</div>
  }

  const m = sonuc.manifest
  const kapat = (id: string): void => setHaric((h) => [...h, id])
  const ac = (id: string): void => setHaric((h) => h.filter((x) => x !== id))

  return (
    <section className="baglam">
      <header className="detay-baslik">
        <h2>Bağlam önizleme — {m.recipeId}</h2>
        <span className="olcum">
          {m.tokenEstimate}
          <span className="birim">/ {m.totalBudget} token</span>
        </span>
      </header>

      {/* Kesme SESSİZ DEĞİL: hangi bölümün ne kaybettiği aşağıda satır satır yazıyor. */}
      {m.truncated ? (
        <p className="ret-mesaji">
          ⚠ bütçe aşıldı — aşağıda “düşen” satırları hangi kaydın neden girmediğini söylüyor
        </p>
      ) : null}

      {m.sections.map((b) => {
        const bosNeden = sonuc.bosNedenleri?.[b.entityType] ?? null
        return (
          <div key={b.id} className="baglam-bolum">
            <div className="baglam-baslik">
              <strong>{b.id}</strong>
              <span className="olcum">
                {b.tokenEstimate}
                <span className="birim">/ {b.tokenBudget}</span>
              </span>
              <Cubuk deger={b.tokenEstimate} tavan={b.tokenBudget} />
            </div>

            {/* Boş bir bölüm SESSİZ KALMAZ: üç ayrı sebep olabilir ve üçü farklı iş
                gerektirir (hiç kayıt yok · onay bekliyor · dönem dışı). */}
            {b.included.length === 0 && bosNeden !== null ? (
              <p className="bos">ⓘ {bosNeden}</p>
            ) : null}

            <ul className="baglam-kartlar">
              {b.included.map((r) => (
                <li key={r.id} className="baglam-kart">
                  <div>
                    <strong>{r.title}</strong>{' '}
                    <span className="olcum">
                      {r.tokenEstimate}
                      <span className="birim">token</span>
                    </span>
                  </div>
                  {/* "Neden dahil edildi" — kart başına, her zaman. */}
                  <div className="baglam-neden">{r.reason}</div>
                  <button type="button" onClick={() => kapat(r.id)}>
                    Kapat
                  </button>
                </li>
              ))}

              {b.dropped.map((d) => {
                const insanKapatti = d.reason.includes('insan kapattı')
                return (
                  <li key={d.id} className="baglam-kart baglam-dusuk">
                    <div>
                      <s>{d.id}</s>
                    </div>
                    <div className="baglam-neden">düşen: {d.reason}</div>
                    {insanKapatti ? (
                      <button type="button" onClick={() => ac(d.id)}>
                        Geri aç
                      </button>
                    ) : null}
                  </li>
                )
              })}
            </ul>
          </div>
        )
      })}
    </section>
  )
}
