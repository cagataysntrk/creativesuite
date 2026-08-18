// Komuta merkezi ANA EKRANI — açılışta boş bir sayfa değil, BEKLEYEN İŞ (FAZ-17.2).
//
// ⚠ ⚠ **BU EKRAN BİR KULLANIM ANINDAN DOĞDU.** Panel `⌘K` palet birincil navigasyon
// diye tasarlanmıştı ve açılışta yalnız bir başlık gösteriyordu. Depo sahibi paneli
// açtı ve *"tek ekran var, onay ekranını göremedim"* dedi — haklıydı: on dokuz ekran
// vardı ve HİÇBİRİ görünmüyordu. Keşfedilemeyen bir ekran, olmayan bir ekrandır.
//
// ⚠ Palet KALDIRILMADI; hızlı olan yol hâlâ `⌘K`. Kaldırılan şey, paletin TEK yol
// olmasıydı — bir kısayol, bir arayüz değildir.

import type React from 'react'
import { useCallback, useEffect, useState } from 'react'
import { OnayKuyrugu } from './OnayKuyrugu.js'

interface Varlik {
  readonly digest: string
  readonly sourceRunId: string
  readonly pipeline?: string
  readonly createdAt: string
  readonly bytes: number
}

/** Editörün adresi — aynı makinede ayrı bir süreç (`just duzenle`). */
const EDITOR = 'http://localhost:4321'

export function Giris(): React.JSX.Element {
  const [varliklar, setVarliklar] = useState<readonly Varlik[]>([])
  const [editorAcik, setEditorAcik] = useState<boolean | null>(null)

  const yukle = useCallback(async (): Promise<void> => {
    try {
      const r = (await (await fetch('/api/varliklar')).json()) as { varliklar?: Varlik[] }
      setVarliklar((r.varliklar ?? []).slice(0, 6))
    } catch {
      // Varlık listesi ikincil: kuyruk yine görünsün.
    }
    // ⚠ Editörün AÇIK OLUP OLMADIĞI ölçülüyor, varsayılmıyor: ölü bir bağlantı,
    // kullanıcıyı boş bir sekmeye götürür ve panelin yalan söylediğini düşündürür.
    try {
      await fetch(EDITOR + '/rampa', { mode: 'no-cors' })
      setEditorAcik(true)
    } catch {
      setEditorAcik(false)
    }
  }, [])

  useEffect(() => {
    void yukle()
  }, [yukle])

  return (
    <div className="giris">
      <section className="giris-blok">
        <h2>Bekleyen onaylar</h2>
        <p className="giris-not">
          Hat burada DURUR — onay bir kapıdır. <kbd>a</kbd> onaylar, <kbd>r</kbd> reddeder (gerekçe
          zorunlu).
        </p>
        <OnayKuyrugu sira="yeni" />
      </section>

      <section className="giris-blok">
        <h2>Son üretilen varlıklar</h2>
        {varliklar.length === 0 ? (
          <p className="giris-not">Henüz varlık yok.</p>
        ) : (
          <ul className="giris-varlik">
            {varliklar.map((v) => (
              <li key={v.digest}>
                <code>{v.digest.slice(7, 19)}</code>
                <span>{v.pipeline ?? '—'}</span>
                <span>{Math.round(v.bytes / 1024)} KB</span>
                <span>{v.createdAt.slice(0, 16).replace('T', ' ')}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="giris-blok">
        <h2>Elle düzenleme</h2>
        {editorAcik === false ? (
          <p className="giris-not">
            Editör kapalı. Terminalde <code>just duzenle</code> çalıştır, sonra bu satır bağlantıya
            döner.
          </p>
        ) : (
          <p className="giris-not">
            <a href={EDITOR} target="_blank" rel="noreferrer">
              {EDITOR}
            </a>{' '}
            — şablonu ya da üretilmiş bir karoseli elle düzelt.
          </p>
        )}
      </section>
    </div>
  )
}
