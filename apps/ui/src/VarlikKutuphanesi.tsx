// Varlık kütüphanesi — bir karosel BİR GRUPTUR (FAZ-17.2).
//
// ⚠ ⚠ **305 SATIRLIK DÜZ LİSTE, İÇİNDEKİNİ GİZLİYORDU.** Ekran her slaytı ayrı bir
// satır olarak sayıyordu; oysa dört slayt tek bir gönderidir ve tek başına bir
// slaytın anlamı yok. Kullanıcının sorduğu soru "hangi gönderi" — liste "hangi
// dosya" cevaplıyordu. Gruplama bir görsel tercih değil, VERİNİN kendi şekli.
//
// ⚠ "Silme" = KARANTİNA. Manifest digest'i kanıt olarak taşıyor (§13); byte'ı yok
// etmek defteri sarkan bir işaretçiyle bırakırdı. Karantina zaten "yayınlanamaz ama
// korunur" demek (D-155) ve senkron kalmanın tek yolu bu.

import type React from 'react'
import { aralikta, tamTarih, tariheGore, type Siralama } from './tarih.js'
import { useCallback, useEffect, useState } from 'react'
// ⚠ ⚠ **ARAMA KATLAMASI ELLE YAPILMAZ.** `toLocaleLowerCase('tr')` yazdım ve
// `turkish-case` kapısı reddetti — haklıydı: doğru locale'i vermek yetmiyor, case
// dönüştüren TEK yer olmak gerekiyor (R-21). İkinci bir katlayıcı, `İ`/`ı` çiftini
// bir gün başka türlü katlar ve arama sessizce farklı sonuç verir.
import { foldForSearch } from '@suite/contracts/text'

interface Varlik {
  readonly digest: string
  readonly bytes: number
  readonly createdAt: string
  readonly sourceRunId: string
  readonly pipeline: string
  readonly konu: string
  readonly yayinlandi: boolean
  readonly manifestSaglam: boolean
}

interface Grup {
  readonly runId: string
  /** Editörde düzenlenmiş slaytlar — damgasız, yayına aday değil (D-301). */
  readonly elle: readonly string[]
  readonly pipeline: string
  readonly konu: string
  readonly createdAt: string
  readonly yayinlandi: boolean
  readonly saglam: boolean
  readonly varliklar: readonly Varlik[]
}

const BIR_HAFTA = 7 * 24 * 60 * 60 * 1000

export const VarlikKutuphanesi = ({
  ac,
}: {
  readonly ac?: (runId: string) => void
}): React.JSX.Element => {
  const [ham, setHam] = useState<readonly Varlik[] | null>(null)
  const [karantina, setKarantina] = useState(0)
  const [secilen, setSecilen] = useState<ReadonlySet<string>>(new Set())
  const [sebep, setSebep] = useState<string | null>(null)
  const [mesaj, setMesaj] = useState<string | null>(null)
  const [fHat, setFHat] = useState('')
  const [fDurum, setFDurum] = useState('')
  const [fTaze, setFTaze] = useState(false)
  const [ara, setAra] = useState('')
  // ⚠ Tarih aralığı ve sıralama TÜM listelerde aynı: "şu iki gün arasında ne üretildi"
  // ve "en eskiden başla" soruları her ekranda meşru ve cevabı hiçbirinde yoktu.
  const [fBas, setFBas] = useState('')
  const [fSon, setFSon] = useState('')
  const [siralama, setSiralama] = useState<Siralama>('yeni')
  /** Koşu → editörde düzenlenmiş slayt dosyaları. Boşsa o koşuda elle iş yok. */
  const [elleSlaytlar, setElleSlaytlar] = useState<Readonly<Record<string, string[]>>>({})

  const yukle = useCallback(async (): Promise<void> => {
    const r = (await (await fetch('/api/varliklar')).json()) as {
      varliklar?: Varlik[]
      elleSlaytlar?: Record<string, string[]>
      karantina?: number
    }
    setHam(r.varliklar ?? [])
    setElleSlaytlar(r.elleSlaytlar ?? {})
    setKarantina(r.karantina ?? 0)
  }, [])

  useEffect(() => {
    void yukle()
  }, [yukle])

  if (ham === null) return <p className="giris-not">yükleniyor…</p>

  // ── koşuya göre grupla: bir karosel bir gönderi ─────────────────────────
  const harita = new Map<string, Varlik[]>()
  for (const v of ham) {
    const l = harita.get(v.sourceRunId) ?? []
    l.push(v)
    harita.set(v.sourceRunId, l)
  }
  const gruplar: Grup[] = [...harita.entries()]
    .map(([runId, vs]) => {
      const sirali = [...vs].sort((a, b) => a.createdAt.localeCompare(b.createdAt))
      const ilk = sirali[0] as Varlik
      return {
        runId,
        elle: elleSlaytlar[runId] ?? [],
        pipeline: ilk.pipeline,
        konu: ilk.konu,
        createdAt: ilk.createdAt,
        // ⚠ Grup "yayınlandı" ancak HEPSİ yayınlandıysa: karoselin üç slaydı
        // yayınlanmışsa o gönderi yayınlanmamıştır, yarım kalmıştır.
        yayinlandi: sirali.every((v) => v.yayinlandi),
        saglam: sirali.every((v) => v.manifestSaglam),
        varliklar: sirali,
      }
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  const hatlar = [...new Set(gruplar.map((g) => g.pipeline))].sort()
  const q = foldForSearch(ara.trim())
  const suzulmus = gruplar.filter((g) => {
    if (fHat !== '' && g.pipeline !== fHat) return false
    if (fDurum === 'yayin' && !g.yayinlandi) return false
    if (fDurum === 'bekleyen' && g.yayinlandi) return false
    if (fDurum === 'kusurlu' && g.saglam) return false
    if (fTaze && Date.now() - new Date(g.createdAt).getTime() > BIR_HAFTA) return false
    if (!aralikta(g.createdAt, fBas, fSon)) return false
    if (q !== '' && !foldForSearch(`${g.konu} ${g.pipeline} ${g.runId}`).includes(q)) return false
    return true
  })

  const siraliListe = tariheGore(suzulmus, (g) => g.createdAt, siralama)

  const karantinaYap = async (): Promise<void> => {
    const digests = suzulmus
      .filter((g) => secilen.has(g.runId))
      .flatMap((g) => g.varliklar.map((v) => v.digest))
    const r = await fetch('/api/varliklar/karantina', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ digests, sebep: (sebep ?? '').trim() }),
    })
    const j = (await r.json()) as { ok?: boolean; tasinan?: number; hata?: string }
    setMesaj(
      j.ok === true
        ? `✓ ${String(j.tasinan ?? 0)} varlık karantinaya alındı — defterdeki izi duruyor`
        : `✗ ${j.hata ?? 'karantina başarısız'}`
    )
    setSebep(null)
    setSecilen(new Set())
    void yukle()
  }

  return (
    <div className="varlik-ekrani">
      <header className="baglam-baslik">
        <h2>Varlık kütüphanesi</h2>
        <span className="olcum">
          {suzulmus.length}/{gruplar.length} gönderi · {ham.length} slayt
          {karantina > 0 ? ` · ${String(karantina)} karantinada` : ''}
        </span>
      </header>

      <div className="filtre-cubuk">
        <label>
          hat{' '}
          <select value={fHat} onChange={(e) => setFHat(e.target.value)}>
            <option value="">hepsi</option>
            {hatlar.map((h) => (
              <option key={h} value={h}>
                {h}
              </option>
            ))}
          </select>
        </label>
        <label>
          başlangıç <input type="date" value={fBas} onChange={(e) => setFBas(e.target.value)} />
        </label>
        <label>
          bitiş <input type="date" value={fSon} onChange={(e) => setFSon(e.target.value)} />
        </label>
        <label>
          sıra{' '}
          <select value={siralama} onChange={(e) => setSiralama(e.target.value as Siralama)}>
            <option value="yeni">en yeni önce</option>
            <option value="eski">en eski önce</option>
          </select>
        </label>
        <label>
          durum{' '}
          <select value={fDurum} onChange={(e) => setFDurum(e.target.value)}>
            <option value="">hepsi</option>
            <option value="yayin">yayınlandı</option>
            <option value="bekleyen">yayınlanmadı</option>
            <option value="kusurlu">kusurlu manifest</option>
          </select>
        </label>
        <label>
          <input type="checkbox" checked={fTaze} onChange={(e) => setFTaze(e.target.checked)} /> son
          7 gün
        </label>
        <label>
          ara <input type="text" value={ara} onChange={(e) => setAra(e.target.value)} />
        </label>
      </div>

      <div className="toplu-cubuk">
        <label>
          <input
            type="checkbox"
            checked={suzulmus.length > 0 && secilen.size === suzulmus.length}
            onChange={(e) =>
              setSecilen(e.target.checked ? new Set(suzulmus.map((g) => g.runId)) : new Set())
            }
          />{' '}
          süzülenlerin tümü
        </label>
        {secilen.size === 0 ? (
          <span className="bos">gönderi seçilmedi</span>
        ) : (
          <>
            <strong>{secilen.size}</strong> gönderi seçili
            <button type="button" onClick={() => setSebep('')}>
              ⌫ karantinaya al
            </button>
          </>
        )}
      </div>

      {sebep === null ? null : (
        <div className="gerekce-kutusu">
          <label htmlFor="karantina-sebep">
            karantina sebebi (zorunlu — byte silinmez, taşınır ve defterde iz kalır)
          </label>
          <textarea id="karantina-sebep" value={sebep} onChange={(e) => setSebep(e.target.value)} />
          <button type="button" disabled={sebep.trim() === ''} onClick={() => void karantinaYap()}>
            {secilen.size} gönderiyi karantinaya al
          </button>
        </div>
      )}

      {mesaj === null ? null : <p className="giris-not">{mesaj}</p>}

      {suzulmus.length === 0 ? (
        <p className="bos">süzgece uyan gönderi yok</p>
      ) : (
        <ul className="grup-listesi">
          {siraliListe.map((g) => (
            <li key={g.runId} className="grup">
              <div className="grup-basi">
                <input
                  type="checkbox"
                  aria-label={`${g.runId} seç`}
                  checked={secilen.has(g.runId)}
                  onChange={(e) => {
                    const y = new Set(secilen)
                    if (e.target.checked) y.add(g.runId)
                    else y.delete(g.runId)
                    setSecilen(y)
                  }}
                />
                <strong>{g.konu === '' ? g.runId.slice(0, 16) : g.konu}</strong>
                <span className="olcum">{g.pipeline}</span>
                <span className="olcum">{g.varliklar.length} slayt</span>
                <span className="olcum">{tamTarih(g.createdAt)}</span>
                <span className={g.yayinlandi ? 'is-hat' : 'bos'}>
                  {g.yayinlandi ? '✓ yayınlandı' : 'yayınlanmadı'}
                </span>
                {g.saglam ? null : <span className="is-uyari">⊘ kusurlu manifest</span>}
                {g.elle.length === 0 ? null : (
                  <span className="is-uyari">✎ {g.elle.length} slayt elle düzenlendi</span>
                )}
                {ac === undefined ? null : (
                  <button type="button" className="hizli" onClick={() => ac(g.runId)}>
                    aç →
                  </button>
                )}
              </div>
              <div className="kosu-slaytlar">
                {g.varliklar.map((v) => (
                  <a
                    key={v.digest}
                    href={`/api/varlik/${v.digest}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <img src={`/api/varlik/${v.digest}`} alt={g.konu} loading="lazy" />
                  </a>
                ))}
              </div>
              {/* ⚠ ⚠ **ELLE DÜZENLENMİŞ HÂL DE BURADA — ama damgalıların YERİNE
                  geçmiyor.** Depo sahibi: *"varlıklarda hâlâ eskisi görünüyor."* Liste
                  yanlış değildi, EKSİKTİ: insanın en son gördüğü hâl hiçbir yerde
                  yoktu. Damgasız bir slayt uyum iddiası taşımıyor ve yayına aday
                  değil (Yasa 7 · R-33); ikisini karıştırmak, damgasız bir varlığı
                  yayınlanabilir sanmak olurdu. O yüzden ayrı satır, açık etiket. */}
              {g.elle.length === 0 ? null : (
                <>
                  <p className="olcum">✎ elle düzenlenmiş sürüm — damgasız, yayına aday değil</p>
                  <div className="kosu-slaytlar">
                    {g.elle.map((ad) => (
                      <a
                        key={ad}
                        href={`/api/kosu/${g.runId}/elle/${ad}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <img
                          src={`/api/kosu/${g.runId}/elle/${ad}`}
                          alt={`elle düzenlenmiş ${ad}`}
                          loading="lazy"
                        />
                      </a>
                    ))}
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
