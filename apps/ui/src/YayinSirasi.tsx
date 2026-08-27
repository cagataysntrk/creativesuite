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

interface PlanliSatir {
  readonly runId: string
  readonly at: string
  readonly konu: string
  readonly sablon: string
  readonly slaytlar: readonly string[]
}

interface HazirSatir {
  readonly runId: string
  readonly konu: string | null
  readonly sablon: string | null
  readonly gonderi?: { readonly asama: string; readonly etiket: string }
  readonly eksikMetin?: readonly string[]
  /** Karoselin slaytları — seçim GÖRSELLE yapılır. */
  readonly slaytlar?: readonly string[]
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
  const [planli, setPlanli] = useState<readonly PlanliSatir[]>([])
  /**
   * Sürüklenen satırın runId'si — fare ile sıralama.
   *
   * ⚠ ⚠ **DEPO SAHİBİ: *"sırayı elle mouse ile tutup düzenleme olmalı."*** Ok
   * düğmeleri tek tek taşıyor ve beş sıra yukarı çıkarmak beş tık demek. Sürükleme
   * hedefe TEK hareketle götürüyor.
   * ⚠ Ok düğmeleri KALDIRILMADI: sürükleme fare ister ve yanlışlıkla tetiklenebilir;
   * ikisi bir arada, biri ötekinin yedeği.
   */
  const [suruklenen, setSuruklenen] = useState<string | null>(null)
  const [hepsi, setHepsi] = useState<readonly HazirSatir[]>([])
  const [acik, setAcik] = useState<string | null>(null)
  const [mesaj, setMesaj] = useState<string | null>(null)

  const cek = useCallback(async (): Promise<void> => {
    try {
      const s = (await (await fetch('/api/yayin-sirasi')).json()) as {
        sira?: SiraSatiri[]
        planlananlar?: PlanliSatir[]
      }
      setSira(s.sira ?? [])
      setPlanli(s.planlananlar ?? [])
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
  const aday = hepsi.filter(
    (r) =>
      !siradakiler.has(r.runId) &&
      r.gonderi?.asama !== 'yayinlandi' &&
      r.gonderi?.asama !== 'planlandi' &&
      (r.sablon ?? '') !== '' &&
      r.gonderi !== undefined
  )
  // ⚠ ⚠ **KAROSELİ OLMAYAN KOŞU SIRAYA ALINAMAZ — ve bu kusuru GÖRSELLERİ AÇMAK
  // ORTAYA ÇIKARDI.** Depo sahibi *"görseller görünmeli ki seçilebilsin"* dedi;
  // görseller açılınca 57 satırın 44'ünün BOŞ geldiği görüldü. Sebep tahmin değil,
  // ölçüm: o koşular dört adımda durmuş, `teslimat` boş, yani ORTADA KAROSEL YOK.
  // Liste, var olmayan bir şeyi yayına almaya davet ediyordu.
  //
  // ⚠ Eleme SESSİZ DEĞİL: kaç koşunun neden düştüğü yazılıyor. Sessiz kısaltma
  // *"hepsi bu"* diye okunur ve bu depoda o hata daha önce yapıldı.
  const alinabilir = aday.filter((r) => (r.slaytlar ?? []).length > 0)
  const karoselsiz = aday.length - alinabilir.length
  const yayinlanmis = hepsi.filter((r) => r.gonderi?.asama === 'yayinlandi')

  return (
    <div className="akis">
      <h2>Yayın sırası</h2>
      {/* ⚠ Kuralın kendisi EKRANDA: bir davranışı yalnız kodda tanımlamak, kullanıcının
          onu deneyerek öğrenmesini beklemektir. */}
      <p className="giris-not">
        Tarih YOK — yalnız sıra. Yeni eklenen <strong>sona</strong> gelir; sıra kendiliğinden
        değişmez. Satırı <strong>fareyle sürükleyerek</strong> ya da ok düğmeleriyle taşı.{' '}
        <strong>Planlandı</strong> dediğinde gönderi sıradan düşer ve yayına kapanır.
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
                draggable
                onDragStart={() => setSuruklenen(g.runId)}
                onDragEnd={() => setSuruklenen(null)}
                // ⚠ `preventDefault` ŞART: olmadan tarayıcı bırakmayı hiç kabul etmiyor
                // ve sürükleme sessizce çalışmıyor gibi görünüyor.
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault()
                  // ⚠ Kendi üstüne bırakmak bir taşıma DEĞİL: sunucu da reddediyor ama
                  // gereksiz bir istek ve ekranda bir hata mesajı üretirdi.
                  if (suruklenen === null || suruklenen === g.runId) return
                  void cagir(`/api/yayin-sirasi/${suruklenen}/tasi`, { hedefSira: g.sira })
                  setSuruklenen(null)
                }}
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
                  {/* ⚠ ⚠ **PLANLANDI = hedefe kondu ve SIRADAN DÜŞER.** Depo sahibi:
                      *"planlandı yayınlandı anlamında kullanacağız… mesele o sıranın
                      temiz olması."* Sonradan "paylaştım" işaretlemek isteğe bağlı;
                      gönderi zaten yayına kapalı. */}
                  <button
                    type="button"
                    className="birincil"
                    onClick={() => void cagir(`/api/yayin-sirasi/${g.runId}/planlandi`)}
                  >
                    ✓ planlandı (hedefe kondu)
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
        {karoselsiz === 0 ? null : (
          <p className="ipucu">
            {karoselsiz} koşu karosel üretmediği için listede yok — yayına alınacak bir görseli yok.
          </p>
        )}
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
                {/* ⚠ ⚠ **GÖRSEL ŞART — depo sahibi: *"sıraya alınabilir dediklerinde de
                    görseller görünmeli ki seçilebilsin."*** Bir karoseli konusundan
                    değil NEYE BENZEDİĞİNDEN tanıyoruz; sırayı KURAN ekranda karar
                    veriliyor ve görselsiz bir liste o kararı her satırda bir tık
                    ötesine itiyor. */}
                <Slaytlar d={r.slaytlar ?? []} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="akis-hafta">
        <h3>planlananlar ({planli.length})</h3>
        {/* ⚠ Bu bölüm bir ARŞİV değil bir AŞAMA: gönderiler hedefin takviminde ve
            oradan çıkması bizim elimizde değil. Kuyruktan düştüler ama kaybolmadılar. */}
        {planli.length === 0 ? (
          <p className="bos">Henüz hedefe konmuş gönderi yok.</p>
        ) : (
          <ul className="gonderi-listesi">
            {planli.map((r) => (
              <li key={r.runId} className="gonderi-satiri">
                <span className="is-hat">✓ planlandı</span>
                <span className="olcum">{r.at.slice(0, 16).replace('T', ' ')}</span>
                <span className="olcum">{r.sablon}</span>
                <span className="giris-konu">{r.konu === '' ? r.runId.slice(4, 16) : r.konu}</span>
                <a className="satir-ac" href={`#/kosu/${r.runId}`}>
                  ↗ aç
                </a>
                {/* ⚠ Yanlış tıklama KALICI OLMAMALI: "planlandı" gönderiyi yayına
                    kapatıyor; geri alma yolu olmadan tek bir tık bir üretimi kalıcı
                    olarak yayın dışı bırakırdı. */}
                <button
                  type="button"
                  onClick={() => void cagir(`/api/yayin-sirasi/${r.runId}/planlandi-geri-al`)}
                >
                  ↶ planlamayı geri al
                </button>
                <Slaytlar d={r.slaytlar} />
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
