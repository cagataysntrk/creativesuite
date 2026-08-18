// Komuta merkezi ANA EKRANI — "ne durumda, ne bekliyor, ne yapabilirim" (FAZ-17.2).
//
// ⚠ ⚠ **İKİ KEZ YETERSİZ ÇIKTI, İKİSİ DE KULLANIMLA ÖLÇÜLDÜ.** İlk sürüm boş bir
// başlıktı (*"⌘K — menü yok"*); ikincisi kuyruğun tamamını gösteriyordu ve Onaylar
// sekmesiyle aynıydı. Bir komuta ekranı bir LİSTE değildir: listeyi zaten Onaylar
// veriyor. Burada cevaplanması gereken üç soru var — **ne durumda · ne bekliyor ·
// ne yapabilirim** — ve üçü de bir bakışta cevaplanmalı.
//
// ⚠ Sayılar İŞE dönüşüyor: her rakam tıklanabilir ve seni o işin başına götürüyor.
// Tıklanamayan bir gösterge, bir rapordur; komuta merkezi rapor değildir.

import type React from 'react'
import { useCallback, useEffect, useState } from 'react'
import { Asama, ASAMALAR } from './Asama.js'

interface Bekleyen {
  readonly runId: string
  readonly pipeline: string
  readonly gate: string
  readonly createdAt: string
  readonly manifestSaglam: boolean
}

interface Varlik {
  readonly digest: string
  readonly sourceRunId: string
  readonly pipeline?: string
  readonly createdAt: string
}

const EDITOR = 'http://localhost:4321'
const BIR_GUN = 24 * 60 * 60 * 1000

const bekleme = (iso: string): string => {
  const dk = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000))
  if (dk < 60) return `${String(dk)} dk`
  if (dk < 1440) return `${String(Math.round(dk / 60))} sa`
  return `${String(Math.round(dk / 1440))} gün`
}

export function Giris({
  ac,
  ekranaGit,
}: {
  readonly ac: (runId: string) => void
  readonly ekranaGit: (ekran: 'kuyruk' | 'calistir' | 'varliklar') => void
}): React.JSX.Element {
  const [bekleyenler, setBekleyenler] = useState<readonly Bekleyen[] | null>(null)
  const [varliklar, setVarliklar] = useState<readonly Varlik[]>([])
  const [editorAcik, setEditorAcik] = useState<boolean | null>(null)

  const yukle = useCallback(async (): Promise<void> => {
    try {
      const k = (await (await fetch('/api/kuyruk')).json()) as { bekleyenler?: Bekleyen[] }
      setBekleyenler(
        [...(k.bekleyenler ?? [])].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      )
    } catch {
      setBekleyenler([])
    }
    try {
      const r = (await (await fetch('/api/varliklar')).json()) as { varliklar?: Varlik[] }
      setVarliklar(r.varliklar ?? [])
    } catch {
      // Varlıklar ikincil: kuyruk yine görünsün.
    }
    try {
      await fetch(`${EDITOR}/rampa`, { mode: 'no-cors' })
      setEditorAcik(true)
    } catch {
      setEditorAcik(false)
    }
  }, [])

  useEffect(() => {
    void yukle()
    // ⚠ Panel CANLI: hat arkada ilerlerken ekran donmuş kalıyordu ve kullanıcı
    // "bir şey olmadı" görüyordu.
    const t = setInterval(() => void yukle(), 5000)
    return () => clearInterval(t)
  }, [yukle])

  if (bekleyenler === null) return <p className="giris-not">yükleniyor…</p>

  const taze = bekleyenler.filter((b) => Date.now() - new Date(b.createdAt).getTime() <= BIR_GUN)
  const bayat = bekleyenler.length - taze.length
  // ⚠ Son karosel = son koşunun varlıkları, ÜRETİM SIRASINDA. Tek tek digest listesi
  // "hangi gönderi" sorusunu cevaplamıyordu; bir karosel bir SETtir.
  const sonRun = varliklar[0]?.sourceRunId
  const sonSet = varliklar
    .filter((v) => v.sourceRunId === sonRun)
    .slice()
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))

  return (
    <div className="giris">
      <section className="sayac-serit">
        <button type="button" onClick={() => ekranaGit('kuyruk')}>
          <strong>{taze.length}</strong>
          <span>sıra sende (bugün)</span>
        </button>
        <button type="button" onClick={() => ekranaGit('kuyruk')}>
          <strong>{bayat}</strong>
          <span>bayat — bir günden eski</span>
        </button>
        <button type="button" onClick={() => ekranaGit('varliklar')}>
          <strong>{varliklar.length}</strong>
          <span>üretilmiş varlık</span>
        </button>
        <button type="button" onClick={() => ekranaGit('calistir')}>
          <strong>+</strong>
          <span>yeni karosel üret</span>
        </button>
      </section>

      <section className="giris-blok">
        <h2>Aşamalara göre</h2>
        <div className="asama-dagilim">
          {ASAMALAR.map((a) => {
            const n = bekleyenler.filter((b) => b.gate === a.kapi).length
            return (
              <div key={a.kapi} className="asama-kutu" data-bos={n === 0 ? '1' : ''}>
                <strong>{n}</strong>
                <span>{a.ad} onayı</span>
              </div>
            )
          })}
        </div>
      </section>

      <section className="giris-blok">
        <h2>Sıra sende</h2>
        {taze.length === 0 ? (
          <p className="giris-not">
            Bugün bekleyen iş yok.{bayat > 0 ? ` (${String(bayat)} eski kayıt duruyor)` : ''}
          </p>
        ) : (
          <ul className="is-listesi">
            {taze.slice(0, 5).map((b) => (
              <li key={b.runId}>
                <button type="button" className="satir-ac" onClick={() => ac(b.runId)}>
                  <Asama kapi={b.gate} />
                  <span className="is-hat">{b.pipeline}</span>
                  <span className="olcum">{bekleme(b.createdAt)} bekliyor</span>
                  {b.manifestSaglam ? null : <span className="is-uyari">⊘ kusurlu manifest</span>}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="giris-blok">
        <h2>Son üretilen karosel</h2>
        {sonSet.length === 0 ? (
          <p className="giris-not">Henüz varlık yok.</p>
        ) : (
          <>
            <div className="kosu-slaytlar">
              {sonSet.map((v) => (
                <a key={v.digest} href={`/api/varlik/${v.digest}`} target="_blank" rel="noreferrer">
                  <img src={`/api/varlik/${v.digest}`} alt="üretilen slayt" />
                </a>
              ))}
            </div>
            <p className="giris-not">
              <button
                type="button"
                className="satir-ac"
                onClick={() => sonRun !== undefined && ac(sonRun)}
              >
                bu koşuyu aç →
              </button>
            </p>
          </>
        )}
      </section>

      <section className="giris-blok">
        <h2>Elle düzenleme</h2>
        {editorAcik === false ? (
          <p className="giris-not">
            Editör kapalı. Terminalde <code>just duzenle</code> çalıştır.
          </p>
        ) : (
          <p className="giris-not">
            <a href={EDITOR} target="_blank" rel="noreferrer">
              {EDITOR}
            </a>{' '}
            — bir koşuyu düzeltmek için yukarıdan aç; oradaki bağlantı O koşuyu açar.
          </p>
        )}
      </section>
    </div>
  )
}
