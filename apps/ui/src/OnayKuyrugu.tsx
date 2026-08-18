// Onay Kuyruğu (§12.5, §12.9 · R-14 · FAZ-4.7).
//
// **Tek elle çalışır.** `j`/`k` gezinme · `a` onayla · `r` reddet · `p` sabitle.
// Kuyruk bir gözden geçirme aracıdır ve fare her varlıkta eli klavyeden koparır (§12.5).
//
// **Red gerekçe ister ve gerekçe KALICIDIR.** Gerekçesiz bir "hayır", sonraki
// çalıştırmaya hiçbir bilgi taşımaz: sistem reddedildiğini bilir, nedenini bilmez ve
// aynı öneriyi tekrar getirir (§4.5).

import { useCallback, useEffect, useState } from 'react'
import { Asama, ASAMALAR } from './Asama.js'

interface Satir {
  readonly runId: string
  readonly pipeline: string
  readonly createdAt: string
  readonly gate: string
  readonly harcananMikros: string
  readonly tahminUstMikros: string
  readonly manifestSaglam: boolean
}

/**
 * ⚠ ⚠ **SIRA EKRANIN KARARI, SUNUCUNUN DEĞİL.** API en ESKİYİ önce veriyor ve bu bir
 * kuyruk sözleşmesi: bekleyen iş dipte unutulmaz. Ama komuta ekranında insanın
 * beklediği şey az önce başlattığı iştir; 62 bekleyenin altında kalan bir satır,
 * doğru veriyle yanlış işi öne koymaktır. İki doğru arasında seçim yapmak yerine
 * ikisi birden: sunucu sırasını korur, ekran kendi sırasını seçer.
 */
export interface OnayKuyruguOzellik {
  readonly sira?: 'eski' | 'yeni'
  /**
   * Satıra tıklanınca çağrılır — koşunun İÇERİĞİNİ açmak için.
   *
   * ⚠ ⚠ **TIKLAMA ÖLÜYDÜ ve bu ölçüldü.** Satıra tıklamak hiçbir şey yapmıyordu;
   * insan `run_01a0160e · metin-onayi` satırına bakıp onaylayacaktı, NEYİ
   * onayladığını görmeden. Bir liste bir komuta merkezi değildir.
   */
  readonly ac?: (runId: string) => void
}

export const OnayKuyrugu = ({ sira = 'eski', ac }: OnayKuyruguOzellik = {}): React.JSX.Element => {
  const [satirlar, setSatirlar] = useState<readonly Satir[] | null>(null)
  const [secili, setSecili] = useState(0)
  const [gerekce, setGerekce] = useState<string | null>(null)
  // ⚠ ⚠ **TOPLU İŞLEM BİR KOLAYLIK DEĞİL, KUYRUĞUN YAŞAYABİLİRLİK ŞARTI.** Kuyrukta
  // 62 bekleyen vardı ve çoğu günler önceki denemelerden kalmıştı; tek tek kapatmak
  // 62 tıklama demek ve o yüzden kimse kapatmıyor. Kapanmayan bir kuyruk, bekleyen
  // gerçek işi gizler — yani toplu işlem olmadan kuyruk kendi amacını yitiriyor.
  const [secilenler, setSecilenler] = useState<ReadonlySet<string>>(new Set())
  const [topluGerekce, setTopluGerekce] = useState<string | null>(null)
  const [ilerleme, setIlerleme] = useState<string | null>(null)
  // ⚠ ⚠ **FİLTRE YOKTU ve 62 satırlık bir liste filtresiz okunamaz.** Kullanıcı
  // "hangi karosel metin onayında" sorusunu ancak göz taramasıyla cevaplayabiliyordu.
  // Üç eksen yeter: HAT (hangi ürün), AŞAMA (nerede takıldı), TAZELİK (bugünkü iş mi
  // yoksa günler önce bırakılmış mı) — dördüncüsü filtreyi kendisi bir yük yapardı.
  const [fHat, setFHat] = useState('')
  const [fKapi, setFKapi] = useState('')
  const [fBayat, setFBayat] = useState(false)
  const [mesaj, setMesaj] = useState<string | null>(null)

  const yukle = useCallback(async (): Promise<void> => {
    try {
      const r = await fetch('/api/kuyruk')
      const j = (await r.json()) as { bekleyenler: Satir[] }
      setSatirlar(
        sira === 'yeni'
          ? [...j.bekleyenler].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
          : j.bekleyenler
      )
      setSecili((s) => Math.min(s, Math.max(0, j.bekleyenler.length - 1)))
    } catch {
      setMesaj('sunucuya ulaşılamıyor')
      setSatirlar([])
    }
  }, [])

  useEffect(() => {
    void yukle()
  }, [yukle])

  const kararGonder = useCallback(
    async (s: Satir, karar: 'approved' | 'rejected', not: string): Promise<void> => {
      const r = await fetch(`/api/kuyruk/${s.runId}/${s.gate}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ karar, gerekce: not }),
      })
      const j = (await r.json()) as { ok: boolean; hata?: string; defter?: string | null }
      setMesaj(
        j.ok
          ? j.defter === null || j.defter === undefined
            ? 'onaylandı'
            : 'reddedildi — gerekçe sticky deftere yazıldı'
          : (j.hata ?? 'karar yazılamadı')
      )
      setGerekce(null)
      await yukle()
    },
    [yukle]
  )

  // Klavye kabuğa bağlı, satıra değil: odak nerede olursa olsun aynı tuş aynı işi yapar.
  /**
   * Seçilenlere aynı kararı yazar — SIRAYLA, paralel değil.
   *
   * ⚠ Paralel gönderim defteri aynı anda birden çok yerden yazardı; kuyruk yazıcısı
   * tek nokta (R-05 ailesi) ve 62 eşzamanlı istek onu sıraya sokmak yerine yarıştırır.
   * ⚠ İlerleme SAYIYLA gösteriliyor: uzun süren bir toplu işlemde "çalışıyor mu,
   * dondu mu" sorusunun cevabı ekranda olmalı.
   */
  const topluKarar = useCallback(
    async (karar: 'approved' | 'rejected', not: string): Promise<void> => {
      const hedefler = (satirlar ?? []).filter((r) => secilenler.has(r.runId))
      let sayac = 0
      for (const r of hedefler) {
        sayac += 1
        setIlerleme(`${String(sayac)}/${String(hedefler.length)} — ${r.runId.slice(0, 12)}`)
        await kararGonder(r, karar, not)
      }
      setIlerleme(`✓ ${String(hedefler.length)} kapı kapatıldı`)
      setSecilenler(new Set())
      setTopluGerekce(null)
    },
    [satirlar, secilenler, kararGonder]
  )

  useEffect(() => {
    const dinle = (e: KeyboardEvent): void => {
      // Gerekçe yazılırken tuşlar KOMUT DEĞİL metindir — yoksa "a" harfi onay verirdi.
      if (gerekce !== null) return
      const liste = satirlar ?? []
      if (liste.length === 0) return
      const s = liste[secili]
      if (s === undefined) return

      if (e.key === 'j') setSecili((x) => Math.min(liste.length - 1, x + 1))
      else if (e.key === 'k') setSecili((x) => Math.max(0, x - 1))
      else if (e.key === 'a') void kararGonder(s, 'approved', '')
      else if (e.key === 'r') setGerekce('')
    }
    document.addEventListener('keydown', dinle)
    return () => document.removeEventListener('keydown', dinle)
  }, [satirlar, secili, gerekce, kararGonder])

  if (satirlar === null) return <p>kuyruk yükleniyor…</p>

  // ⚠ Süzme EKRANDA, sunucuda değil: kuyruk sözleşmesi (en eski önce, hiçbiri
  // gizlenmez) korunuyor; gizleme kullanıcının GÖRÜŞ tercihi.
  // ⚠ "Bayat" ölçüsü 24 saat: bir koşu bir günden uzun bekliyorsa o gün bırakılmış
  // demektir ve bugünkü işi gizliyordur.
  const BIR_GUN = 24 * 60 * 60 * 1000
  /** "3 sa" · "2 gün" — bir işin ne kadar süredir beklediği. */
  const bekleme = (iso: string): string => {
    const dk = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000))
    if (dk < 60) return `${String(dk)} dk`
    if (dk < 1440) return `${String(Math.round(dk / 60))} sa`
    return `${String(Math.round(dk / 1440))} gün`
  }
  const suzulmus = (satirlar ?? []).filter((r) => {
    if (fHat !== '' && r.pipeline !== fHat) return false
    if (fKapi !== '' && r.gate !== fKapi) return false
    if (fBayat && Date.now() - new Date(r.createdAt).getTime() > BIR_GUN) return false
    return true
  })
  const hatlar = [...new Set((satirlar ?? []).map((r) => r.pipeline))].sort()

  const s = satirlar[secili]

  return (
    <section className="kuyruk">
      <header className="detay-baslik">
        <h2>Onay kuyruğu</h2>
        <span className="olcum">
          {satirlar.length}
          <span className="birim">bekleyen</span>
        </span>
      </header>

      <p className="baglam-neden">
        <kbd>j</kbd>/<kbd>k</kbd> gezin · <kbd>a</kbd> onayla · <kbd>r</kbd> reddet — fareye
        dokunmadan
      </p>

      {mesaj === null ? null : <p className="ret-mesaji">{mesaj}</p>}

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
          aşama{' '}
          <select value={fKapi} onChange={(e) => setFKapi(e.target.value)}>
            <option value="">hepsi</option>
            {ASAMALAR.map((a) => (
              <option key={a.kapi} value={a.kapi}>
                {a.ad}
              </option>
            ))}
          </select>
        </label>
        <label>
          <input type="checkbox" checked={fBayat} onChange={(e) => setFBayat(e.target.checked)} />{' '}
          yalnız bugünkü iş
        </label>
        <span className="olcum">
          {suzulmus.length}/{satirlar.length}
        </span>
      </div>

      {/* ⚠ Toplu çubuk yalnız SEÇİM VARKEN görünüyor: boşta duran bir "hepsini reddet"
          düğmesi, yanlışlıkla basılacak en tehlikeli düğmedir. */}
      <div className="toplu-cubuk">
        <label>
          <input
            type="checkbox"
            checked={suzulmus.length > 0 && secilenler.size === suzulmus.length}
            onChange={(e) =>
              setSecilenler(e.target.checked ? new Set(suzulmus.map((r) => r.runId)) : new Set())
            }
          />{' '}
          süzülenlerin tümü
        </label>
        {secilenler.size === 0 ? (
          <span className="bos">satır seçilmedi</span>
        ) : (
          <>
            <strong>{secilenler.size}</strong> seçili
            <button type="button" onClick={() => void topluKarar('approved', '')}>
              ✓ seçilenleri onayla
            </button>
            <button type="button" onClick={() => setTopluGerekce('')}>
              ✗ seçilenleri reddet
            </button>
          </>
        )}
        {ilerleme === null ? null : <span className="olcum">{ilerleme}</span>}
      </div>

      {topluGerekce === null ? null : (
        <div className="gerekce-kutusu">
          <label htmlFor="toplu-gerekce">
            {secilenler.size} kapı için ORTAK red gerekçesi (zorunlu)
          </label>
          <textarea
            id="toplu-gerekce"
            value={topluGerekce}
            onChange={(e) => setTopluGerekce(e.target.value)}
          />
          <button
            type="button"
            disabled={topluGerekce.trim() === ''}
            onClick={() => void topluKarar('rejected', topluGerekce.trim())}
          >
            {secilenler.size} kapıyı reddet
          </button>
        </div>
      )}

      {satirlar.length === 0 ? (
        // Boş kuyruk bir BAŞARIDIR ve öyle yazılır; boş bir liste bunu söylemez.
        <p className="bos">bekleyen onay yok — kuyruk temiz</p>
      ) : (
        <table className="kayit-tablosu">
          <thead>
            <tr>
              <th aria-label="seçim" />
              <th>çalıştırma</th>
              <th>hat</th>
              <th>aşama</th>
              <th>bekleme</th>
              <th>manifest</th>
              <th>hızlı</th>
            </tr>
          </thead>
          <tbody>
            {suzulmus.map((r, i) => (
              <tr
                key={r.runId}
                data-secili={i === secili}
                data-tiklanir={ac === undefined ? undefined : true}
                onClick={() => {
                  setSecili(i)
                  ac?.(r.runId)
                }}
              >
                <td>
                  <input
                    type="checkbox"
                    checked={secilenler.has(r.runId)}
                    aria-label={`${r.runId} seç`}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => {
                      const y = new Set(secilenler)
                      if (e.target.checked) y.add(r.runId)
                      else y.delete(r.runId)
                      setSecilenler(y)
                    }}
                  />
                </td>
                <td className="olcum">{r.runId.slice(0, 12)}</td>
                <td>{r.pipeline}</td>
                <td>
                  <Asama kapi={r.gate} />
                </td>
                {/* ⚠ "harcanan $0.00" hiçbir şey söylemiyordu (bedava şerit); BEKLEME
                    SÜRESİ söylüyor: bir iş ne kadar süredir insanı bekliyor. */}
                <td className="olcum">{bekleme(r.createdAt)}</td>
                <td>
                  {r.manifestSaglam ? (
                    '✓'
                  ) : (
                    // Kusurlu manifestli çıktı zaten yayınlanamaz (D-155) — onay
                    // verirken bunu bilmek şart, yoksa yayınlanamaz bir şey onaylanır.
                    <span style={{ color: 'var(--role-state-error)' }}>⊘ kusurlu</span>
                  )}
                </td>
                <td>
                  {/* ⚠ Hızlı işlem SATIRDA: en sık yapılan şey için ekran değiştirmek
                      gereksiz bir adım. Detay yine bir tık ötede. */}
                  <button
                    type="button"
                    className="hizli"
                    onClick={(e) => {
                      e.stopPropagation()
                      void kararGonder(r, 'approved', '')
                    }}
                  >
                    ✓
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {gerekce === null || s === undefined ? null : (
        <div className="gerekce-kutusu">
          <label htmlFor="gerekce">red gerekçesi (zorunlu)</label>
          <input
            id="gerekce"
            className="filtre-arama"
            autoFocus
            value={gerekce}
            onChange={(e) => setGerekce(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && gerekce.trim() !== '') {
                void kararGonder(s, 'rejected', gerekce)
              } else if (e.key === 'Escape') setGerekce(null)
            }}
          />
          <span className="baglam-neden">Enter ile gönder · Esc ile vazgeç</span>
        </div>
      )}
    </section>
  )
}
