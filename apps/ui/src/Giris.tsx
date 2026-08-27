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
import { karoselSirasi } from './karosel.js'
import { useCallback, useEffect, useState } from 'react'
import { Asama, ASAMALAR } from './Asama.js'

interface Bekleyen {
  readonly runId: string
  readonly pipeline: string
  /**
   * Hangi şablon ve ne hakkında — gözden geçirmenin İLK İKİ sorusu.
   *
   * ⚠ ⚠ **BU İKİSİ EKRANDA YOKTU ve satırlar birbirinin AYNISIYDI:** beş satır da
   * *"✓ metin ● tasarım ○ yayın · instagram-karosel · 18 sa bekliyor"* diyordu. On
   * üretimin onu da aynı hattan çıkıyor; hat adı hiçbir şey ayırt etmiyor. Sunucu bu
   * alanları ZATEN gönderiyordu, ekran çizmiyordu.
   * ⚠ Aynı kusur koşu listesinde ve varlık ekranında da vardı — bu, bu deponun tekrar
   * eden sınıfı: kimlik taşımayan satır, tıklanmadan hiçbir şey ifade etmiyor.
   */
  readonly sablon: string | null
  readonly konu: string | null
  readonly gate: string
  readonly createdAt: string
  readonly manifestSaglam: boolean
}

interface Varlik {
  readonly digest: string
  readonly sourceRunId: string
  readonly pipeline?: string
  readonly createdAt: string
  /** Teslimattaki yeri — karoselin sırası BURADAN gelir (D-248). */
  readonly teslimat?: { readonly index: number } | null
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
  readonly ekranaGit: (ekran: 'kuyruk' | 'calistir' | 'gecmis') => void
}): React.JSX.Element {
  const [bekleyenler, setBekleyenler] = useState<readonly Bekleyen[] | null>(null)
  const [varliklar, setVarliklar] = useState<readonly Varlik[]>([])
  const [yaklasan, setYaklasan] = useState<
    readonly {
      readonly runId: string
      readonly sablon: string
      readonly konu: string
      readonly tarih: string
      readonly elle?: boolean
    }[]
  >([])
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
    // ⚠ Takvim İKİNCİL: uç düşerse kuyruk yine görünüyor. Bir ekranın bir isteğe
    // bağlı olarak tamamen boş kalması, o isteğin sessizce kritikleşmesi demek.
    try {
      const bugun = new Date().toISOString().slice(0, 10)
      const a2 = (await (
        await fetch(`/api/yayin-akisi?haftadaKac=3&baslangic=${bugun}`)
      ).json()) as {
        plan?: {
          gonderiler?: readonly { runId: string; sablon: string; tarih: string; konu?: string }[]
        }
        elleGonderiler?: readonly { runId: string; sablon: string; tarih: string; konu?: string }[]
        konular?: Record<string, string>
      }
      const hepsi = [
        ...(a2.plan?.gonderiler ?? []).map((g) => ({ ...g, elle: false })),
        ...(a2.elleGonderiler ?? []).map((g) => ({ ...g, elle: true })),
      ]
      // ⚠ GEÇMİŞ tarihler elenmiyor, SIRALANIYOR: dünkü bir planlı gönderi hâlâ
      // yayınlanmamışsa onu gizlemek, kaçırılmış bir işi görünmez yapardı.
      setYaklasan(
        hepsi
          .map((g) => ({
            runId: g.runId,
            sablon: g.sablon,
            tarih: g.tarih,
            konu: (g.konu ?? a2.konular?.[g.runId] ?? '').trim(),
            elle: g.elle,
          }))
          .sort((x, y) => x.tarih.localeCompare(y.tarih))
      )
    } catch {
      setYaklasan([])
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
  // ⚠ ⚠ **BU SATIR `createdAt` İLE SIRALIYORDU ve karoseli ters çevirebiliyordu.**
  // Kural artık `karosel.ts`te — panelde tek yer.
  const sonSet = karoselSirasi(varliklar.filter((v) => v.sourceRunId === sonRun))

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
        <button type="button" onClick={() => ekranaGit('gecmis')}>
          {/* ⚠ ⚠ **BİRİM YANLIŞTI: 45 "varlık" 45 gönderi değil, 10 karoselin 45
              SLAYTI.** Ekranda 45 görünce insan kırk beş gönderi ürettiğini sanıyordu.
              Sayılan şeyin ne olduğu, sayının kendisi kadar önemli. */}
          <strong>{new Set(varliklar.map((v) => v.sourceRunId)).size}</strong>
          <span>üretilmiş karosel · {varliklar.length} slayt</span>
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
                  <span className="is-hat">{b.sablon ?? b.pipeline}</span>
                  <span className="giris-konu">
                    {b.konu === null || b.konu === '' ? b.runId.slice(4, 16) : b.konu}
                  </span>
                  <span className="olcum">{bekleme(b.createdAt)} bekliyor</span>
                  {b.manifestSaglam ? null : <span className="is-uyari">⊘ kusurlu manifest</span>}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ⚠ ⚠ **BU BLOK YOKTU ve panelin İŞİ tam olarak buydu.** Depo sahibi kararı
          verdi: bu depo bir yayın aracı değil, bir HATIRLATICI ve PLANLAYICI. Komuta
          ekranı ise takvimden hiç söz etmiyordu — hatırlatıcının ana ekranı neyin ne
          zaman çıkacağını söylemiyorsa hatırlatmıyor demektir. */}
      <section className="giris-blok">
        <h2>Sıradaki yayınlar</h2>
        {yaklasan.length === 0 ? (
          <p className="giris-not">
            Takvimde planlanmış gönderi yok. <a href="#/yayin-akisi">↗ Yayın takvimine git</a>
          </p>
        ) : (
          <ul className="is-listesi">
            {yaklasan.slice(0, 5).map((g) => (
              <li key={`${g.tarih}-${g.runId}`}>
                <button type="button" className="satir-ac" onClick={() => ac(g.runId)}>
                  <span className="olcum">{g.tarih}</span>
                  <span className="is-hat">{g.sablon}</span>
                  <span className="giris-konu">
                    {g.konu === '' ? g.runId.slice(4, 16) : g.konu}
                  </span>
                  {/* ⚠ Elle planlanmış gönderi AYIRT EDİLİYOR: hangisinin insan kararı
                      olduğu görünmezse "bunu ben mi koydum" sorusu doğar. */}
                  {g.elle === true ? <span className="olcum">elle</span> : null}
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
