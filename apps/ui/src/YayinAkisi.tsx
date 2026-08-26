// HEDEF: apps/ui/src/YayinAkisi.tsx
//
// Yayın takvimi — GERÇEK bir takvim, liste değil (FAZ-19.13 · UX-5, UX-6).
//
// ⚠ ⚠ **İLK SÜRÜM LİSTEYDİ ve depo sahibi haklı olarak reddetti:** *"yayın sayfasını
// daha takvim merkezli UI/UX'e kavuştur, dikkatlice mükemmel olmalı"*. Hafta başlıkları
// altında satırlar bir takvim DEĞİL bir rapordu: hangi gün boş, hangi gün dolu, iki
// gönderi arasında kaç gün var — hiçbiri görünmüyordu. Takvimin işi tam olarak bu üç
// soruyu TEK BAKIŞTA cevaplamak.
//
// ⚠ ⚠ **HER GÖNDERİDE CRUD var** (*"manuel düzenleme silme geri alma değiştirme platform
// seçme vs her şey olmalı"*). Kararlar `derived/yayin-takvimi.ndjson` defterine EKLEMELİ
// yazılıyor: üçüncü kez tarih değiştirsen üçü de duruyor ve sonuncusu geçerli. "Çıkar"
// bile bir OLAY — üretim yerinde kalıyor, yalnız sıradan çıkıyor (Yasa 10).
//
// ⚠ ⚠ **ELLE KARAR PLANLAYICIYI EZMİYOR, ONDAN AYRILIYOR.** Elle tarih verilen üretim
// otomatik plana hiç girmiyor; kalanı planlayıcı dolduruyor ve çeşitlilik kuralını
// (üst üste aynı şablon yok) orada uyguluyor. İkisini birbirinin alternatifi yapmak,
// ya otomatiği ya eli işe yaramaz kılardı.
//
// ⛔ **BU EKRAN HİÇBİR ŞEY GÖNDERMİYOR.** *"Elle yayınladım"* bile bir KAYIT: insan
// uygulamadan paylaştığını sisteme söylüyor, sistem paylaşmıyor.

import type React from 'react'
import { useCallback, useEffect, useState } from 'react'
import { GonderiKutusu, PLATFORMLAR } from './GonderiKutusu.js'

interface Gonderi {
  readonly runId: string
  readonly sablon: string
  readonly tarih: string
  readonly konu?: string
  readonly platformlar?: readonly string[]
  readonly elle?: boolean
  readonly yayinlandi?: boolean
}

interface HazirKosu {
  readonly runId: string
  readonly sablon: string
  readonly konu: string
  /** `otomatik` | `planla` | `cikar` | `elle-yayinlandi` */
  readonly durum: string
}

interface Akis {
  readonly ok: boolean
  readonly hazir: number
  readonly elenmis: number
  readonly hazirListe: readonly HazirKosu[]
  readonly sablonsuz: number
  readonly konular: Readonly<Record<string, string>>
  readonly elleGonderiler: readonly Gonderi[]
  readonly cikarilan: readonly {
    readonly runId: string
    readonly sablon: string
    readonly konu: string
    readonly not: string
  }[]
  readonly elleYayinlanan: readonly Gonderi[]
  readonly yolda: readonly {
    readonly runId: string
    readonly sablon: string
    readonly konu: string
    readonly durdugu: string
  }[]
  readonly kapida: readonly {
    readonly runId: string
    readonly sablon: string
    readonly konu: string
    readonly kapi: string
  }[]
  readonly gecmis: readonly {
    readonly runId: string
    readonly sablon: string
    readonly konu: string
    readonly zaman: string
  }[]
  readonly plan: {
    readonly gonderiler: readonly Gonderi[]
    readonly uyarilar: readonly { readonly tur: string; readonly aciklama: string }[]
    readonly dagilim: Readonly<Record<string, number>>
  }
}

const bugun = (): string => new Date().toISOString().slice(0, 10)

/**
 * Bir ayın ızgarası — pazartesi başlangıçlı, tam haftalar.
 *
 * ⚠ ⚠ **UTC ŞART.** Yerel saat diliminde `new Date(y, a, g)` yaz saati geçişinde bir gün
 * kaydırabiliyor ve takvim sessizce yanlış güne hizalanır. Aynı ders `yayin-plani.ts`te
 * bir kez öğrenildi.
 * ⚠ Pazartesi başlangıç: `getUTCDay()` pazarı 0 veriyor, biz haftanın SONU sayıyoruz.
 */
const ayIzgarasi = (yil: number, ay: number): readonly string[] => {
  const ilk = new Date(Date.UTC(yil, ay, 1))
  const kaydir = (ilk.getUTCDay() + 6) % 7
  const gunler: string[] = []
  for (let i = 0; i < 42; i++) {
    const t = new Date(Date.UTC(yil, ay, 1 - kaydir + i))
    gunler.push(t.toISOString().slice(0, 10))
  }
  // ⚠ Son hafta tamamen sonraki aya düşüyorsa gösterilmiyor: boş bir satır takvimi
  // uzatıyor ve "burada bir şey var mı" diye baktırıyor.
  const sonHafta = gunler.slice(35)
  return sonHafta.every((g) => Number(g.slice(5, 7)) !== ay + 1) ? gunler.slice(0, 35) : gunler
}

const AY_ADI = [
  'Ocak',
  'Şubat',
  'Mart',
  'Nisan',
  'Mayıs',
  'Haziran',
  'Temmuz',
  'Ağustos',
  'Eylül',
  'Ekim',
  'Kasım',
  'Aralık',
]

/**
 * Bir GÜNÜN kutusu — o tarihe hangi üretim konacak.
 *
 * ⚠ ⚠ **BU KUTU OLMADAN TAKVİM SALT-OKUNURDU.** İlk sürümde yalnız planlayıcının
 * koyduğu gönderiye tıklanabiliyordu; boş bir güne bir üretim KOYMAK imkânsızdı.
 * Depo sahibi *"istediğim tarihe özel planlama da olmalı"* dedi ve haklıydı: ekleme
 * yapamayan bir takvim bir rapordur.
 *
 * ⚠ Aday listesi yalnız YAYINA HAZIR olanlar — kapıda bekleyen bir üretimi tarihe
 * bağlamak, olmayan bir şeyi planlamaktır. Kapıdakiler ekranın altında AYRI duruyor.
 */
const GunKutusu = ({
  tarih,
  adaylar,
  kapat,
  karar,
}: {
  readonly tarih: string
  readonly adaylar: readonly HazirKosu[]
  readonly kapat: () => void
  readonly karar: (
    runId: string,
    k: 'planla' | 'cikar' | 'elle-yayinlandi' | 'geri-al',
    ek?: { tarih?: string; platformlar?: readonly string[]; not?: string }
  ) => Promise<void>
}): React.JSX.Element => {
  const [secili, setSecili] = useState<readonly string[]>(PLATFORMLAR.map((p) => p.id))
  return (
    <section className="gonderi-kutusu gun-kutusu">
      <h3>
        {tarih} — bu güne gönderi koy{' '}
        <button type="button" onClick={kapat}>
          ✕
        </button>
      </h3>
      <div className="filtre-cubuk">
        {PLATFORMLAR.map((p) => (
          <label key={p.id}>
            <input
              type="checkbox"
              checked={secili.includes(p.id)}
              onChange={(e) =>
                setSecili(e.target.checked ? [...secili, p.id] : secili.filter((x) => x !== p.id))
              }
            />{' '}
            {p.kisa}
          </label>
        ))}
      </div>
      {adaylar.length === 0 ? (
        <p className="bos">yayına hazır üretim yok — kapıdakiler önce onaylanmalı.</p>
      ) : (
        <ul className="akis-gonderiler">
          {adaylar.map((a) => (
            <li key={a.runId}>
              <strong>{a.sablon}</strong>
              <span>{a.konu === '' ? a.runId.slice(4, 16) : a.konu}</span>
              {a.durum === 'otomatik' ? null : <span className="olcum">{a.durum}</span>}
              <button
                type="button"
                onClick={() => void karar(a.runId, 'planla', { tarih, platformlar: secili })}
              >
                ✓ bu güne koy
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export const YayinAkisi = (): React.JSX.Element => {
  const [haftadaKac, setHaftadaKac] = useState(3)
  const [baslangic, setBaslangic] = useState(bugun)
  const [ayKaydir, setAyKaydir] = useState(0)
  const [veri, setVeri] = useState<Akis | null>(null)
  const [hata, setHata] = useState<string | null>(null)
  const [mesaj, setMesaj] = useState<string | null>(null)
  const [acik, setAcik] = useState<string | null>(null)
  const [gunAcik, setGunAcik] = useState<string | null>(null)
  const [paketMesaj, setPaketMesaj] = useState<string | null>(null)

  const yukle = useCallback(async (): Promise<void> => {
    setHata(null)
    try {
      const r = await fetch(
        `/api/yayin-akisi?haftadaKac=${String(haftadaKac)}&baslangic=${baslangic}`
      )
      const j = (await r.json()) as Akis & { hata?: string }
      if (!j.ok) {
        setHata(j.hata ?? 'yayın akışı okunamadı')
        return
      }
      setVeri(j)
    } catch (e) {
      setHata(String(e))
    }
  }, [haftadaKac, baslangic])

  useEffect(() => {
    void yukle()
  }, [yukle])

  const karar = useCallback(
    async (
      runId: string,
      k: 'planla' | 'cikar' | 'elle-yayinlandi' | 'geri-al',
      ek: { tarih?: string; platformlar?: readonly string[]; not?: string } = {}
    ): Promise<void> => {
      const r = await fetch('/api/yayin-takvimi', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ runId, karar: k, ...ek }),
      })
      const j = (await r.json()) as { ok?: boolean; hata?: string }
      setMesaj(j.ok === true ? `✓ ${k}` : `✗ ${j.hata ?? 'yazılamadı'}`)
      await yukle()
    },
    [yukle]
  )

  /**
   * Takvimdeki HER gönderiyi klasöre çıkarır.
   *
   * ⚠ Yalnız takvimde olanlar: kapıda bekleyen bir üretimi paketlemek, onaylanmamış bir
   * tasarımı yayıncıya taşımak olurdu.
   */
  const paketle = async (): Promise<void> => {
    setPaketMesaj('paketleniyor…')
    try {
      const j = (await (await fetch('/api/yayin-paketleri', { method: 'POST' })).json()) as {
        ok?: boolean
        kok?: string
        paket?: readonly { ok: boolean }[]
      }
      const n = (j.paket ?? []).filter((x) => x.ok).length
      const kotu = (j.paket ?? []).length - n
      setPaketMesaj(
        n === 0
          ? '⊘ paketlenecek gönderi yok — önce takvime ekle'
          : `✓ ${String(n)} gönderi ${j.kok ?? ''} altına yazıldı${kotu === 0 ? '' : ` · ${String(kotu)} başarısız`}`
      )
    } catch {
      setPaketMesaj('✗ sunucuya ulaşılamıyor')
    }
  }

  if (hata !== null) return <p className="ret-mesaji">⊘ {hata}</p>
  if (veri === null) return <p className="bos">yükleniyor…</p>

  const bugunSabit = bugun()
  const b = new Date(`${baslangic}T00:00:00Z`)
  const gosterilen = new Date(Date.UTC(b.getUTCFullYear(), b.getUTCMonth() + ayKaydir, 1))
  const yil = gosterilen.getUTCFullYear()
  const ay = gosterilen.getUTCMonth()
  const gunler = ayIzgarasi(yil, ay)

  // ⚠ Otomatik ve elle gönderiler AYNI ızgaraya, AYRI rozetle giriyor: takvimde
  // hangisinin insan kararı olduğu görünmezse "bunu ben mi koydum" sorusu doğar.
  const gune: Record<string, Gonderi[]> = {}
  for (const g of [...veri.plan.gonderiler, ...veri.elleGonderiler]) (gune[g.tarih] ??= []).push(g)
  // ⚠ ⚠ **YAYINLANMIŞ ile PLANLANMIŞ aynı görünmemeli.** İlk sürümde ikisi de aynı
  // kutuydu ve takvime bakan biri yayınlanmış bir gönderiyi yeniden yayınlayabilirdi —
  // geri alınamayan bir hata. Ayrım rozetle değil DURUMLA yapılıyor.
  for (const g of veri.elleYayinlanan)
    (gune[g.tarih] ??= []).push({ ...g, elle: true, yayinlandi: true })

  // ⚠ ⚠ **BOŞ DİZE de eksiktir.** İlk sürüm `y ?? …` yazıyordu; `??` yalnız `null`
  // ve `undefined`da yedeğe düşüyor, `''` geçip gidiyordu — ve takvimde elle
  // planlanan gönderi KONUSUZ göründü. Ekrana bakmasam fark etmezdim.
  const konuAl = (runId: string, y?: string): string => {
    const d = (y ?? '').trim()
    if (d !== '') return d
    const k = (veri.konular[runId] ?? '').trim()
    return k === '' ? runId.slice(4, 16) : k
  }

  return (
    <div className="ekran">
      <h2>Yayın takvimi</h2>

      <div className="filtre-cubuk">
        <label>
          haftada kaç post{' '}
          <select value={haftadaKac} onChange={(e) => setHaftadaKac(Number(e.target.value))}>
            {[1, 2, 3, 4, 5, 7].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
        <label>
          başlangıç{' '}
          <input type="date" value={baslangic} onChange={(e) => setBaslangic(e.target.value)} />
        </label>
        <button type="button" onClick={() => setAyKaydir(ayKaydir - 1)}>
          ‹ önceki ay
        </button>
        <strong>
          {AY_ADI[ay]} {yil}
        </strong>
        <button type="button" onClick={() => setAyKaydir(ayKaydir + 1)}>
          sonraki ay ›
        </button>
        {ayKaydir === 0 ? null : (
          <button type="button" onClick={() => setAyKaydir(0)}>
            bugüne dön
          </button>
        )}
      </div>

      {/* ⚠ ⚠ **YAYIN BU PANELDEN YAPILMIYOR — paket ÇIKIYOR.** Araştırma gösterdi ki
          Instagram/LinkedIn/X API'lerinde zamanlama yok ve kendi zamanlayıcımız Yasa
          12'ye çarpıyor (makine kapalıyken gönderi gitmez). Depo sahibi kararı verdi:
          yayını bulut aracıyla elle yapacak. Panelin işi ayın planını KUSURSUZ bir
          klasöre çıkarmak — karoseller sırayla, metinler platform başına. */}
      <div className="filtre-cubuk">
        <button type="button" onClick={() => void paketle()}>
          ⬇ ayın planını klasöre çıkar
        </button>
        {paketMesaj === null ? null : <span className="olcum">{paketMesaj}</span>}
      </div>

      <p className="olcum">
        {/* ⚠ Başlık TAKVİM dilinde: bu ekranın sorusu "ne zaman yayınlanıyor", "kaç
            koşu var" değil. Takvime giremeyenler aşağıda ayrı sayılıyor. */}
        {veri.plan.gonderiler.length + veri.elleGonderiler.length} planlanmış ·{' '}
        {veri.gecmis.length + veri.elleYayinlanan.length} yayınlanmış · {veri.cikarilan.length}{' '}
        çıkarılmış · {veri.hazir} yayına hazır
        {veri.sablonsuz === 0 ? '' : ` · ${String(veri.sablonsuz)} onaylı koşu şablonsuz`}
        {/* ⚠ Elenen SAYILIYOR: gizlenen bir şeyin sayısı görünmezse "3 hazır" diyen
            bir başlık, elenmiş on üç üretimi yok sayar. */}
        {(veri.yolda ?? []).length === 0
          ? ''
          : ` · ${String((veri.yolda ?? []).length)} hattın ortasında`}
        {veri.elenmis === 0 ? '' : ` · ${String(veri.elenmis)} elenmiş gizli`}
      </p>
      {mesaj === null ? null : <p className="olcum">{mesaj}</p>}

      {veri.plan.uyarilar.length === 0 ? null : (
        <ul className="akis-uyarilar">
          {veri.plan.uyarilar.map((u) => (
            <li key={u.aciklama} className="is-uyari">
              ⚠ {u.aciklama}
            </li>
          ))}
        </ul>
      )}

      <div className="takvim">
        {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map((g) => (
          <div key={g} className="takvim-baslik">
            {g}
          </div>
        ))}
        {gunler.map((t) => {
          const buAy = Number(t.slice(5, 7)) === ay + 1
          const liste = gune[t] ?? []
          const sinif = [
            'takvim-gun',
            buAy ? '' : 'takvim-disari',
            t === bugunSabit ? 'takvim-bugun' : '',
            t === gunAcik ? 'takvim-secili' : '',
          ]
            .filter((x) => x !== '')
            .join(' ')
          return (
            <div key={t} className={sinif}>
              <span className="takvim-tarih">{t.slice(8)}</span>
              {liste.map((g) => (
                <button
                  key={g.runId}
                  type="button"
                  className={[
                    'takvim-oge',
                    g.elle === true ? 'takvim-elle' : '',
                    g.yayinlandi === true ? 'takvim-yayinlandi' : '',
                  ]
                    .filter((x) => x !== '')
                    .join(' ')}
                  onClick={() => {
                    setGunAcik(null)
                    setAcik(acik === g.runId ? null : g.runId)
                  }}
                  title={konuAl(g.runId, g.konu)}
                >
                  <span className="takvim-sablon">
                    {g.yayinlandi === true ? '✓ ' : ''}
                    {g.sablon}
                  </span>
                  <span className="takvim-konu">{konuAl(g.runId, g.konu)}</span>
                  <span className="takvim-platform">
                    {(g.platformlar ?? PLATFORMLAR.map((x) => x.id))
                      .map((id) => PLATFORMLAR.find((x) => x.id === id)?.kisa ?? id)
                      .join(' ')}
                  </span>
                </button>
              ))}
              {/* ⚠ BOŞ GÜN de tıklanabilir: takvimin ekleyemediği bir takvim rapordur. */}
              <button
                type="button"
                className="takvim-ekle"
                onClick={() => {
                  setAcik(null)
                  setGunAcik(gunAcik === t ? null : t)
                }}
                title={`${t} gününe gönderi koy`}
              >
                +
              </button>
            </div>
          )
        })}
      </div>

      {gunAcik === null ? null : (
        <GunKutusu
          tarih={gunAcik}
          adaylar={veri.hazirListe ?? []}
          kapat={() => setGunAcik(null)}
          karar={karar}
        />
      )}

      {acik === null ? null : (
        <GonderiKutusu runId={acik} konu={konuAl(acik)} kapat={() => setAcik(null)} sonra={yukle} />
      )}

      {veri.cikarilan.length === 0 ? null : (
        <section className="akis-hafta">
          <h3>takvimden çıkarılanlar</h3>
          <ul className="akis-gonderiler">
            {veri.cikarilan.map((x) => (
              <li key={x.runId}>
                <strong>{x.sablon}</strong>
                <span>{x.konu === '' ? x.runId.slice(4, 16) : x.konu}</span>
                {x.not === '' ? null : <span className="olcum">{x.not}</span>}
                <button type="button" onClick={() => void karar(x.runId, 'geri-al')}>
                  ↺ geri al
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ⚠ ⚠ **HATTIN ORTASINDA DURANLAR.** Ne kapıda ne hazır: son kapısını geçmiş
          ama bir adımda durmuş koşular. Bunlar hiçbir kutuya girmiyordu ve ekrandan
          sessizce düşüyorlardı — `editoryal` üretimi tam olarak böyle kayboldu. */}
      {(veri.yolda ?? []).length === 0 ? null : (
        <section className="akis-hafta">
          <h3>hattın ortasında duran</h3>
          <ul className="akis-gonderiler">
            {(veri.yolda ?? []).map((y) => (
              <li key={y.runId}>
                <span className="olcum">durdu: {y.durdugu}</span>
                <strong>{y.sablon}</strong>
                <a href={`#/kosu/${y.runId}`}>{y.konu === '' ? y.runId.slice(4, 16) : y.konu}</a>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ⚠ ⚠ **KAPI KUYRUĞU BU EKRANDAN ÇIKTI.** Depo sahibi: *"takvimde kapıda bekleyen
          değil, planlanmış ve yayınlanmış olanlar olacak sadece"* — ve haklıydı: on
          satırlık bir onay kuyruğu ekranın altını kaplıyordu ve takvim bir onay ekranı
          gibi görünüyordu. Kuyruk artık **Koşular ve varlıklar**ta, kapı süzgeciyle.
          ⚠ ⚠ **AMA SAYI DURUYOR ve bir BAĞLANTI oldu.** Sessizce kaldırsaydım takvim boş
          olduğunda insan *"neden boş"* sorusunu cevapsız bulurdu. Takvime giremeyenler
          sayılıyor ve nereye bakılacağı yazıyor. */}
      {veri.kapida.length === 0 &&
      (veri.yolda ?? []).length === 0 &&
      veri.sablonsuz === 0 ? null : (
        <section className="akis-hafta">
          <h3>takvime giremeyenler</h3>
          <ul className="akis-gonderiler">
            {veri.kapida.length === 0 ? null : (
              <li>
                <strong>{veri.kapida.length}</strong>
                <span>üretim insan onayı bekliyor — onaylanmadan takvime giremez</span>
                <a href="#/gecmis">↗ Koşular ve varlıklar&apos;ta onayla</a>
              </li>
            )}
            {(veri.yolda ?? []).length === 0 ? null : (
              <li>
                <strong>{(veri.yolda ?? []).length}</strong>
                <span>üretim hattın ortasında durdu — sürdürülmesi gerekiyor</span>
                <a href="#/gecmis">↗ koşuyu aç ve sürdür</a>
              </li>
            )}
            {veri.sablonsuz === 0 ? null : (
              <li>
                <strong>{veri.sablonsuz}</strong>
                <span>onaylı üretimin şablonu yok — çeşitlilik kuralı uygulanamıyor</span>
              </li>
            )}
          </ul>
        </section>
      )}

      <section className="akis-hafta">
        <h3>yayınlanmış</h3>
        {veri.gecmis.length === 0 && veri.elleYayinlanan.length === 0 ? (
          <p className="bos">henüz hiçbir üretim yayınlanmadı.</p>
        ) : (
          <ul className="akis-gonderiler">
            {veri.elleYayinlanan.map((g) => (
              <li key={g.runId}>
                <span className="olcum">{g.tarih}</span>
                <strong>{g.sablon}</strong>
                <span className="olcum">elle</span>
                <a href={`#/kosu/${g.runId}`}>{konuAl(g.runId, g.konu)}</a>
                <button type="button" onClick={() => void karar(g.runId, 'geri-al')}>
                  ↺ geri al
                </button>
              </li>
            ))}
            {veri.gecmis.map((g) => (
              <li key={g.runId}>
                <span className="olcum">{g.zaman.slice(0, 10)}</span>
                <strong>{g.sablon}</strong>
                <a href={`#/kosu/${g.runId}`}>{g.konu === '' ? g.runId.slice(4, 16) : g.konu}</a>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
