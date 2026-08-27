// Yayın SIRASI — tarihsiz kuyruk (FAZ-19.14 · UX-22).
//
// ⚠ ⚠ **TAKVİM EKRANI KALDIRILDI ve kararı depo sahibi verdi:** *"takvim ve tarih
// planlamayı devre dışı bırakmamız lazım. Sadece yayın sırası belirleyeceğiz ve bu
// değişmeyecek, sadece manuel değişebilecek… takvim eşitlemek saçmalık — sadece yayına
// hazır demek, yayın sırasına sokmak, tarihsiz, ve pushlamak önemli."*
//
// ⚠ ⚠ **BU EKRAN BİR IZGARA DEĞİL BİR LİSTE, ve fark ölçülebilir bir vaat.** Takvim
// ızgarası her gönderiye bir GÜN veriyordu ve o gün hiçbir şey olmuyordu: makine kapalı
// olabilir, insan o gün paylaşmayabilir. Tutulmayan bir tarih, tutulduğu sanıldığı için
// tarihsizlikten kötüdür. Liste yalnız NE'DEN SONRA'yı söylüyor ve o her zaman doğru.
//
// ⚠ ⚠ **SIRA KENDİLİĞİNDEN DEĞİŞMİYOR.** Tek otomatik kural: yeni eklenen SONA gelir.
// Yukarı/aşağı düğmeleri tek tek taşıyor; sürükle-bırak yok çünkü sürükleme yanlışlıkla
// tetiklenebiliyor ve bu ekranda yanlış bir taşıma, yanlış sırada bir yayın demek.

import type React from 'react'
import { useCallback, useEffect, useState } from 'react'
import { GonderiKutusu, PLATFORMLAR, VARSAYILAN_PLATFORMLAR } from './GonderiKutusu.js'

interface SiraSatiri {
  readonly sira: number
  readonly runId: string
  readonly konu: string
  readonly sablon: string
  readonly slaytlar: readonly string[]
  readonly not: string
  readonly yayin: { readonly yayinlandi: boolean; readonly aciklama: string }
}

interface HazirSatir {
  readonly runId: string
  readonly konu: string | null
  readonly sablon: string | null
  readonly gonderi?: { readonly asama: string; readonly etiket: string }
  readonly eksikMetin?: readonly string[]
}

const Slaytlar = ({ d }: { readonly d: readonly string[] }): React.JSX.Element =>
  d.length === 0 ? (
    <p className="bos">slayt yok</p>
  ) : (
    <div className="kosu-slaytlar">
      {d.map((x, i) => (
        <a key={x} href={`/api/varlik/${x}`} target="_blank" rel="noreferrer">
          <img src={`/api/varlik/${x}`} alt={`slayt ${String(i + 1)}`} loading="lazy" />
          <span className="slayt-sira">
            {i + 1}/{d.length}
          </span>
        </a>
      ))}
    </div>
  )

export const YayinSirasi = (): React.JSX.Element => {
  const [sira, setSira] = useState<readonly SiraSatiri[]>([])
  const [hepsi, setHepsi] = useState<readonly HazirSatir[]>([])
  const [acik, setAcik] = useState<string | null>(null)
  const [mesaj, setMesaj] = useState<string | null>(null)

  const cek = useCallback(async (): Promise<void> => {
    try {
      const s = (await (await fetch('/api/yayin-sirasi')).json()) as { sira?: SiraSatiri[] }
      setSira(s.sira ?? [])
      const c = (await (await fetch('/api/calistirmalar')).json()) as {
        calistirmalar?: HazirSatir[]
      }
      setHepsi(c.calistirmalar ?? [])
    } catch {
      setMesaj('✗ sunucuya ulaşılamıyor')
    }
  }, [])

  useEffect(() => {
    void cek()
  }, [cek])

  const cagir = async (u: string, govde?: unknown): Promise<void> => {
    try {
      const j = (await (
        await fetch(u, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(govde ?? {}),
        })
      ).json()) as { ok?: boolean; hata?: string; sira?: number }
      setMesaj(j.ok === true ? `✓ ${String(j.sira ?? '')}. sıra` : `✗ ${j.hata ?? 'olmadı'}`)
      if (j.ok === true) await cek()
    } catch {
      setMesaj('✗ sunucuya ulaşılamıyor')
    }
  }

  // ⚠ ⚠ **SIRAYA ALINABİLECEKLER: yayınlanmamış ve sırada olmayanlar.** Yayınlanmış bir
  // gönderiyi listelemek, *"aynı şey tekrar paylaşılmamalı"* kuralına tıklanabilir bir
  // davet koymak olurdu — sunucu reddediyor ama ekran onu hiç önermemeli.
  const siradakiler = new Set(sira.map((x) => x.runId))
  const alinabilir = hepsi.filter(
    (r) =>
      !siradakiler.has(r.runId) &&
      r.gonderi?.asama !== 'yayinlandi' &&
      (r.sablon ?? '') !== '' &&
      r.gonderi !== undefined
  )
  const yayinlanmis = hepsi.filter((r) => r.gonderi?.asama === 'yayinlandi')

  return (
    <div className="akis">
      <h2>Yayın sırası</h2>
      {/* ⚠ Kuralın kendisi EKRANDA: bir davranışı yalnız kodda tanımlamak, kullanıcının
          onu deneyerek öğrenmesini beklemektir. */}
      <p className="giris-not">
        Tarih YOK — yalnız sıra. Yeni eklenen <strong>sona</strong> gelir; sıra kendiliğinden
        değişmez, yalnız buradan elle taşınır.
      </p>
      {mesaj === null ? null : <p className="olcum">{mesaj}</p>}

      <section className="akis-hafta">
        <h3>sırada ({sira.length})</h3>
        {sira.length === 0 ? (
          <p className="bos">Sıra boş. Aşağıdan bir üretimi sıraya al.</p>
        ) : (
          <ul className="gonderi-listesi">
            {sira.map((g, i) => (
              <li
                key={g.runId}
                className={acik === g.runId ? 'gonderi-satiri secili' : 'gonderi-satiri'}
              >
                <button
                  type="button"
                  className="gonderi-ozet"
                  onClick={() => setAcik(acik === g.runId ? null : g.runId)}
                >
                  <strong>{g.sira}.</strong>
                  <span className="olcum">{g.sablon}</span>
                  <span className="giris-konu">
                    {g.konu === '' ? g.runId.slice(4, 16) : g.konu}
                  </span>
                  <span className="takvim-platform">
                    {VARSAYILAN_PLATFORMLAR.map(
                      (id) => PLATFORMLAR.find((p) => p.id === id)?.kisa ?? id
                    ).join(' ')}
                  </span>
                </button>
                <div className="kapi-dugmeler">
                  {/* ⚠ Uçtaki düğme KAPALI, gizli değil: kaybolan bir düğme, insanın
                      "neredeydi" diye aramasına yol açıyor. */}
                  <button
                    type="button"
                    disabled={i === 0}
                    onClick={() =>
                      void cagir(`/api/yayin-sirasi/${g.runId}/tasi`, { hedefSira: g.sira - 1 })
                    }
                  >
                    ↑ yukarı
                  </button>
                  <button
                    type="button"
                    disabled={i === sira.length - 1}
                    onClick={() =>
                      void cagir(`/api/yayin-sirasi/${g.runId}/tasi`, { hedefSira: g.sira + 1 })
                    }
                  >
                    ↓ aşağı
                  </button>
                  <button
                    type="button"
                    disabled={i === 0}
                    onClick={() =>
                      void cagir(`/api/yayin-sirasi/${g.runId}/tasi`, { hedefSira: 1 })
                    }
                  >
                    ⇈ başa
                  </button>
                  <button
                    type="button"
                    onClick={() => void cagir(`/api/yayin-sirasi/${g.runId}/cikar`)}
                  >
                    ⌫ sıradan çıkar
                  </button>
                  <a className="satir-ac" href={`#/kosu/${g.runId}`}>
                    ↗ koşuyu aç
                  </a>
                </div>
                <Slaytlar d={g.slaytlar} />
                {acik !== g.runId ? null : (
                  <GonderiKutusu runId={g.runId} konu={g.konu} sonra={() => void cek()} />
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="akis-hafta">
        <h3>sıraya alınabilir ({alinabilir.length})</h3>
        {alinabilir.length === 0 ? (
          <p className="bos">Sıraya alınacak üretim yok.</p>
        ) : (
          <ul className="gonderi-listesi">
            {alinabilir.slice(0, 30).map((r) => (
              <li key={r.runId} className="gonderi-satiri">
                <span className="olcum">{r.sablon}</span>
                <span className="giris-konu">
                  {r.konu === null || r.konu === '' ? r.runId.slice(4, 16) : r.konu}
                </span>
                {/* ⚠ Metni eksik olan da sıraya ALINABİLİYOR ama UYARIYLA: metin yayın
                    anında değil, sıraya alırken görülmeli. */}
                {(r.eksikMetin ?? []).length === 0 ? null : (
                  <span className="is-uyari">⚠ metin yok: {(r.eksikMetin ?? []).join(' · ')}</span>
                )}
                <button
                  type="button"
                  onClick={() => void cagir('/api/yayin-sirasi', { runId: r.runId })}
                >
                  ↓ sıraya al (sona)
                </button>
                <a className="satir-ac" href={`#/kosu/${r.runId}`}>
                  ↗ aç
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="akis-hafta">
        <h3>yayınlananlar ({yayinlanmis.length})</h3>
        {yayinlanmis.length === 0 ? (
          <p className="bos">henüz hiçbir üretim yayınlanmadı.</p>
        ) : (
          <ul className="gonderi-listesi">
            {yayinlanmis.map((r) => (
              <li key={r.runId} className="gonderi-satiri">
                <span className="is-hat">{r.gonderi?.etiket ?? '✓ yayınlandı'}</span>
                <span className="giris-konu">
                  {r.konu === null || r.konu === '' ? r.runId.slice(4, 16) : r.konu}
                </span>
                <a className="satir-ac" href={`#/kosu/${r.runId}`}>
                  ↗ aç
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
