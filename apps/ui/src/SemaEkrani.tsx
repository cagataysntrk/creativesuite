// Schema Editor (§3.3, §12.9 · FAZ-4.11).
//
// **Yasak anahtar fiziksel olarak yazılamaz.** Editör serbest JSON kabul etmiyor: alan
// listesi + tip + zorunluluk. Profil dışı bir anahtarı yazacak bir kutu YOKSA, onu
// yazmak da mümkün değildir — kural belgede değil, arayüzün şeklinde.
//
// **Kaydetmeden önce kuru çalıştırma.** Bir alanı zorunlu yapmak, o alanı taşımayan her
// kaydı geçersiz kılar; kaç kaydın kırılacağı SAYIYLA ve id'leriyle söylenir. "12 kayıt
// kırılacak" bir uyarıdır; "şu 12 kayıt" bir iş listesidir.

import { useCallback, useEffect, useState } from 'react'

interface SemaOzeti {
  readonly id: string
  readonly title: string
  readonly alanSayisi: number
  readonly zorunlu: readonly string[]
  readonly kayitSayisi: number
  readonly ozniteliktiKayit: number
}

interface Etki {
  readonly changes: readonly { readonly kind: string; readonly field: string }[]
  readonly broken: readonly {
    readonly recordId: string
    readonly field: string
    readonly reason: string
  }[]
  readonly refusals: readonly { readonly reason: string; readonly suggestion: string }[]
  readonly scanned: number
  readonly safe: boolean
}

export const SemaEkrani = (): React.JSX.Element => {
  const [semalar, setSemalar] = useState<readonly SemaOzeti[] | null>(null)
  const [secili, setSecili] = useState<string | null>(null)
  const [zorunlu, setZorunlu] = useState<readonly string[]>([])
  const [sonuc, setSonuc] = useState<{ ozet: string; etki?: Etki } | null>(null)

  useEffect(() => {
    void fetch('/api/semalar')
      .then((r) => r.json() as Promise<{ semalar: SemaOzeti[] }>)
      .then((j) => {
        setSemalar(j.semalar)
        const ilk = j.semalar[0]
        if (ilk !== undefined) {
          setSecili(ilk.id)
          setZorunlu(ilk.zorunlu)
        }
      })
      .catch(() => setSemalar([]))
  }, [])

  const kuruCalistir = useCallback(async (): Promise<void> => {
    if (secili === null) return
    // Editörün ürettiği şema PROFİL İÇİ olmak zorunda; burada yalnız `required`
    // değişiyor ve o listeyi kullanıcı kutu işaretleyerek kuruyor — serbest metin yok.
    const r = await fetch(`/api/semalar/${secili}/kuru`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ required: zorunlu }),
    })
    const j = (await r.json()) as { ozet?: string; hata?: string; impact?: Etki }
    setSonuc({
      ozet: j.ozet ?? j.hata ?? 'sonuç okunamadı',
      ...(j.impact ? { etki: j.impact } : {}),
    })
  }, [secili, zorunlu])

  if (semalar === null) return <p>şemalar yükleniyor…</p>
  const s = semalar.find((x) => x.id === secili)

  return (
    <section>
      <h2>Şema editörü</h2>

      <table className="kayit-tablosu">
        <thead>
          <tr>
            <th>tip</th>
            <th>alan</th>
            <th>kayıt</th>
            <th>öznitelikli</th>
          </tr>
        </thead>
        <tbody>
          {semalar.map((x) => (
            <tr key={x.id} data-secili={x.id === secili}>
              <td>
                <button
                  type="button"
                  className="baglanti"
                  onClick={() => {
                    setSecili(x.id)
                    setZorunlu(x.zorunlu)
                    setSonuc(null)
                  }}
                >
                  {x.title}
                </button>
              </td>
              <td className="olcum">{x.alanSayisi}</td>
              <td className="olcum">{x.kayitSayisi}</td>
              <td className="olcum">
                {/* `0` ise şema hiçbir kayda bağlı değil ve bu SÖYLENİR: sessiz kalsaydı
                    kuru çalıştırmanın "her kayıt kırılacak" demesi açıklanamaz olurdu. */}
                {x.ozniteliktiKayit}
                {x.ozniteliktiKayit === 0 && x.kayitSayisi > 0 ? (
                  <span className="birim">— şema hiçbir kayda bağlı değil</span>
                ) : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {s === undefined ? null : (
        <>
          <h3>{s.title} — zorunlu alanlar</h3>
          <p className="baglam-neden">
            Bir alanı zorunlu yapmak, onu taşımayan her kaydı geçersiz kılar. Kaydetmeden önce kuru
            çalıştırın.
          </p>
          <ul className="op-listesi">
            {s.zorunlu.map((alan) => (
              <li key={alan}>
                <label>
                  <input
                    type="checkbox"
                    checked={zorunlu.includes(alan)}
                    onChange={(e) =>
                      setZorunlu((z) =>
                        e.target.checked ? [...z, alan] : z.filter((x) => x !== alan)
                      )
                    }
                  />{' '}
                  {alan}
                </label>
              </li>
            ))}
          </ul>

          <button type="button" className="baslat" onClick={() => void kuruCalistir()}>
            Kuru çalıştır
          </button>
        </>
      )}

      {sonuc === null ? null : (
        <div className={sonuc.etki?.safe === true ? 'baglam-neden' : 'hata-kutusu'}>
          <p>{sonuc.ozet}</p>
          {sonuc.etki?.refusals.map((r) => (
            <p key={r.reason} className="ret-mesaji">
              ⊘ {r.reason} — {r.suggestion}
            </p>
          ))}
          {sonuc.etki?.broken.map((b) => (
            <p key={`${b.recordId}-${b.field}`} className="ret-mesaji">
              ✗ <span className="olcum">{b.recordId}</span> · {b.field} — {b.reason}
            </p>
          ))}
        </div>
      )}
    </section>
  )
}
