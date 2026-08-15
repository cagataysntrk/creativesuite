// ⌘K komut paleti — birincil navigasyon (§12.5 · FAZ-4.2b).
//
// `<dialog>.showModal()` yalnız ÜÇ şey için kullanılır (§12.4): komut paleti, geri
// alınamaz eylem onayı, sağlayıcı kimlik girişi. Bu birincisi. Dördüncü bir kullanım
// eklenirse `<dialog>` bir kaçış deliğine döner ve yüzey modeli çöker.
//
// Eşleştirme mantığı `palet.ts`te ve orada test edildi — burada yalnız çizim ve klavye.

import { useCallback, useEffect, useRef, useState } from 'react'
import { eslestir, kaydir, type Komut } from './palet.js'

export interface PaletOzellikleri {
  readonly komutlar: readonly Komut[]
  readonly uzerineSec: (komut: Komut) => void
}

export const Palet = ({ komutlar, uzerineSec }: PaletOzellikleri): React.JSX.Element => {
  const [acik, setAcik] = useState(false)
  const [sorgu, setSorgu] = useState('')
  const [secili, setSecili] = useState(0)
  const girdiRef = useRef<HTMLInputElement>(null)

  const eslesmeler = eslestir(komutlar, sorgu)

  const kapat = useCallback(() => {
    setAcik(false)
    setSorgu('')
    setSecili(0)
  }, [])

  // ⌘K / Ctrl+K HER EKRANDAN. Dinleyici `document`te çünkü palet bir sayfaya ait
  // değil, kabuğa ait: hangi rotada olursanız olun aynı tuş aynı şeyi yapar.
  useEffect(() => {
    const dinle = (e: KeyboardEvent): void => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setAcik((a) => !a)
        return
      }
      if (e.key === 'Escape' && acik) kapat()
    }
    document.addEventListener('keydown', dinle)
    return () => document.removeEventListener('keydown', dinle)
  }, [acik, kapat])

  useEffect(() => {
    if (acik) girdiRef.current?.focus()
  }, [acik])

  if (!acik) return <></>

  const tuşlar = (e: React.KeyboardEvent): void => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSecili((s) => kaydir(s, 1, eslesmeler.length))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSecili((s) => kaydir(s, -1, eslesmeler.length))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const s = eslesmeler[secili]
      if (s !== undefined) {
        uzerineSec(s.komut)
        kapat()
      }
    }
  }

  return (
    <div className="palet-ortu" data-elevation="overlay" role="dialog" aria-label="Komut paleti">
      <input
        ref={girdiRef}
        className="palet-girdi"
        value={sorgu}
        placeholder="Komut ara…"
        onChange={(e) => {
          setSorgu(e.target.value)
          setSecili(0)
        }}
        onKeyDown={tuşlar}
      />
      <ul className="palet-liste">
        {eslesmeler.length === 0 ? (
          // Boş durum bir EYLEM DAVETİ, bir çizim sergisi değil (§12.6).
          <li className="palet-bos">eşleşme yok — başka bir sözcük deneyin</li>
        ) : (
          eslesmeler.map((e, i) => (
            <li
              key={e.komut.id}
              className="palet-satir"
              data-secili={i === secili}
              onMouseDown={() => {
                uzerineSec(e.komut)
                kapat()
              }}
            >
              <span>{e.komut.etiket}</span>
              <span className="palet-grup">{e.komut.grup}</span>
            </li>
          ))
        )}
      </ul>
    </div>
  )
}
