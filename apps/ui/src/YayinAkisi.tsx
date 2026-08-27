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
import { GonderiKutusu, PLATFORMLAR, VARSAYILAN_PLATFORMLAR } from './GonderiKutusu.js'

interface Gonderi {
  readonly runId: string
  readonly sablon: string
  readonly tarih: string
  readonly konu?: string
  readonly platformlar?: readonly string[]
  readonly elle?: boolean
  readonly yayinlandi?: boolean
  /** Slayt digest'leri, TESLİMAT SIRASINDA. Takvimde ve listelerde görsel. */
  readonly slaytlar?: readonly string[]
  /** Gönderi metni ÜRETİLMİŞ platformlar. Boşsa bu gönderi planlanamaz. */
  readonly metinler?: readonly string[]
  /** Hedefe iletildi mi — defterin son senkron kaydının özeti. */
  readonly senkron?: string
}

interface Hatali {
  readonly runId: string
  readonly sablon: string
  readonly konu: string
  readonly slaytlar: readonly string[]
  readonly sebep: string
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
  readonly hatali: readonly Hatali[]
  /**
   * Takvime GİREMEYENLER — sayılıyor ama LİSTELENMİYOR.
   *
   * ⚠ ⚠ Depo sahibi: *"takvimin altındaki şeyler sadece planlananlar, yayınlananlar ya
   * da hata verenler olabilir; başka şeyler olamaz."* Ama sayıyı gizlemek de olmaz:
   * takvim boşken *"neden boş"* sorusu cevapsız kalırdı. Sayı BAŞLIKTA, liste yok.
   */
  /** koşu → son senkron kaydının notu. Yoksa gönderi hedefe gitmemiş. */
  readonly senkron?: Readonly<Record<string, string>>
  readonly planlanamaz: {
    readonly toplam: number
    readonly metinYok: number
    readonly slaytYok: number
  }
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

/**
 * Takvimin altındaki bir gönderi satırı — GÖRSELLİ.
 *
 * ⚠ ⚠ **GÖRSEL ŞART, SÜS DEĞİL.** Depo sahibi: *"bunlar da görselleriyle görünmeli ve
 * basınca run detay açılmalı."* Bir gönderiyi tarihinden ya da şablon adından değil,
 * NEYE BENZEDİĞİNDEN tanıyoruz; görselsiz bir satır bir muhasebe kaydıdır.
 *
 * ⚠ ⚠ **İKİ AYRI TIKLAMA, İKİ AYRI HEDEF.** Satıra tıklamak KARAR kutusunu açıyor
 * (tarih/platform/çıkar); *"↗ koşuyu aç"* koşu detayına götürüyor. Tek tıklamaya iki
 * anlam yüklemek ikisini de belirsiz yapardı.
 */
const GonderiKarti = ({
  g,
  ac,
  secili,
  hata,
}: {
  readonly g: Gonderi
  readonly ac: () => void
  readonly secili: boolean
  readonly hata?: string
}): React.JSX.Element => (
  <li className={secili ? 'gonderi-satiri secili' : 'gonderi-satiri'}>
    <button type="button" className="gonderi-ozet" onClick={ac}>
      {/* ⚠ TARİH EN BAŞTA ve HER gönderide: depo sahibi *"hepsi hangi tarihe planlandı
          ise görünmesi lazım"* dedi. Tarihsiz bir planlama bir planlama değildir. */}
      <span className="olcum">{g.tarih === '' ? '—' : g.tarih}</span>
      <strong>{g.sablon}</strong>
      <span className="giris-konu">
        {g.konu === undefined || g.konu === '' ? g.runId.slice(4, 16) : g.konu}
      </span>
      {g.elle === true ? <span className="olcum">elle</span> : null}
      {g.yayinlandi === true ? <span className="is-hat">✓ yayınlandı</span> : null}
      {g.senkron === undefined || g.senkron === '' ? null : (
        <span className="olcum">⇄ {g.senkron.split(' — ')[0]}</span>
      )}
      {hata === undefined ? null : <span className="is-uyari">⚠ {hata}</span>}
      {/* ⚠ Platform seçimi yoksa VARSAYILAN gösteriliyor, boş bırakılmıyor: gönderinin
          nereye gideceğini söylemeyen bir satır, o soruyu tıklamaya erteler. */}
      <span className="takvim-platform">
        {(g.platformlar === undefined || g.platformlar.length === 0
          ? VARSAYILAN_PLATFORMLAR
          : g.platformlar
        )
          .map((id) => PLATFORMLAR.find((p) => p.id === id)?.kisa ?? id)
          .join(' ')}
      </span>
    </button>
    <a className="satir-ac" href={`#/kosu/${g.runId}`}>
      ↗ koşuyu aç
    </a>
    {(g.slaytlar ?? []).length === 0 ? (
      <p className="bos">slayt yok</p>
    ) : (
      <div className="kosu-slaytlar">
        {(g.slaytlar ?? []).map((d, i) => (
          <a key={d} href={`/api/varlik/${d}`} target="_blank" rel="noreferrer">
            <img src={`/api/varlik/${d}`} alt={`${g.sablon} ${String(i + 1)}`} loading="lazy" />
            <span className="slayt-sira">
              {i + 1}/{(g.slaytlar ?? []).length}
            </span>
          </a>
        ))}
      </div>
    )}
  </li>
)

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
  const [surukleniyor, setSurukleniyor] = useState<string | null>(null)
  const [surukleHedef, setSurukleHedef] = useState<string | null>(null)
  const [tasimaMesaj, setTasimaMesaj] = useState<string | null>(null)

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

  /**
   * Bir gönderiyi başka bir güne taşır.
   *
   * ⚠ ⚠ **PLATFORM SEÇİMİ KORUNUYOR.** Taşıma yalnız TARİHİ değiştiriyor; platformları
   * sıfırlamak, insanın verdiği ikinci bir kararı sessizce iptal etmek olurdu. Elle
   * kararı yoksa varsayılan geçerli.
   * ⚠ Metinsiz gönderi taşınamıyor ve sebebi EKRANDA: sunucu reddediyor, biz de o reddi
   * olduğu gibi gösteriyoruz — sürükleyip bıraktıktan sonra hiçbir şey olmaması, en kötü
   * geri bildirimdir.
   */
  const tariheTasi = async (runId: string, tarih: string): Promise<void> => {
    if (veri === null) return
    const mevcut = [...veri.plan.gonderiler, ...veri.elleGonderiler].find((x) => x.runId === runId)
    if (mevcut?.tarih === tarih) return
    setTasimaMesaj('taşınıyor…')
    try {
      const j = (await (
        await fetch('/api/yayin-takvimi', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            runId,
            karar: 'planla',
            tarih,
            ...(mevcut?.platformlar === undefined ? {} : { platformlar: mevcut.platformlar }),
          }),
        })
      ).json()) as { ok?: boolean; hata?: string }
      setTasimaMesaj(j.ok === true ? `✓ ${tarih} tarihine taşındı` : `✗ ${j.hata ?? 'taşınamadı'}`)
      if (j.ok === true) await yukle()
    } catch {
      setTasimaMesaj('✗ sunucuya ulaşılamıyor')
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
  // ⚠ ⚠ **PLANLANANLAR TEK LİSTE: otomatik + elle birlikte, TARİHE göre.** İkisini ayrı
  // kutulara koymak *"bu hafta ne çıkıyor"* sorusunu iki listeyi birleştirerek
  // cevaplatırdı. Hangisinin insan kararı olduğu satırdaki `elle` rozetinden görünüyor.
  const planlanan = [...veri.plan.gonderiler, ...veri.elleGonderiler]
    .map((g) => {
      const sk = (veri.senkron ?? {})[g.runId]
      return sk === undefined ? g : { ...g, senkron: sk }
    })
    .sort((a, b) => a.tarih.localeCompare(b.tarih))
  // ⚠ ⚠ **TARİHİ GEÇMİŞ AMA İŞARETLENMEMİŞ GÖNDERİLER BİR SORU — ve ekran onu SORMUYORDU.**
  // Depo sahibi: *"tarihi gelip yayınlananlar yayınlandı olarak işaretlenmeli… böylece
  // yayınlananlar belli olur ve tekrar yayına girmez."*
  //
  // ⚠ ⚠ **OTOMATİK İŞARETLEME YOK ve bu KASITLI.** *"12 Eylül'e planlıydı, bugün 15'i,
  // demek yayınlandı"* diyen bir kural YALAN söyler: makine kapalı olmuş olabilir
  // (Yasa 12), insan o gün paylaşmamış olabilir. Geçmiş tarih bir OLGU değil bir
  // SORUDUR; ekran onu soru olarak soruyor, cevabı insan veriyor.
  const gecikmis = planlanan.filter((g) => g.tarih !== '' && g.tarih < bugunSabit)
  const bekleyen = planlanan.filter((g) => !(g.tarih !== '' && g.tarih < bugunSabit))
  const yayinlanan: readonly Gonderi[] = [
    ...veri.elleYayinlanan.map((g) => ({ ...g, yayinlandi: true, elle: true })),
    ...veri.gecmis.map((g) => ({
      runId: g.runId,
      sablon: g.sablon,
      konu: g.konu,
      tarih: g.zaman.slice(0, 10),
      yayinlandi: true,
    })),
  ].sort((a, b) => b.tarih.localeCompare(a.tarih))

  // ⚠ ⚠ **OTOMATİK PLANLAYICININ SEÇTİĞİ TARİH karar kutusuna taşınıyor.** *"Otomatiğe
  // bırak"* deyince ne olacağını görmeden seçemezsin; boş bir "otomatik" seçeneği insana
  // kapalı kutu imzalatmaktır.
  const otomatikTarihler: Record<string, string> = {}
  for (const gd of veri.plan.gonderiler) otomatikTarihler[gd.runId] = gd.tarih

  // ⚠ Hangi platformun metni VAR — karar kutusu kör seçim yaptırmasın diye.
  const metinHaritasi: Record<string, readonly string[]> = {}
  for (const gd of [...veri.plan.gonderiler, ...veri.elleGonderiler])
    if (gd.metinler !== undefined) metinHaritasi[gd.runId] = gd.metinler

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
        {/* ⚠ Taşıma sonucu ızgaranın ÜSTÜNDE: bırakılan yerde bir şey olmadıysa sebebi
            görünmeli, yoksa insan bir daha sürükler ve yine olmaz. */}
        {tasimaMesaj === null ? null : <span className="olcum">{tasimaMesaj}</span>}
      </div>

      <p className="olcum">
        {/* ⚠ Başlık TAKVİM dilinde: bu ekranın sorusu "ne zaman yayınlanıyor", "kaç koşu
            var" değil. */}
        {planlanan.length} planlanmış · {yayinlanan.length} yayınlanmış ·{' '}
        {(veri.hatali ?? []).length} hata veren · {veri.cikarilan.length} çıkarılmış
        {/* ⚠ ⚠ **PLANLANAMAYANLARIN SAYISI BURADA, LİSTESİ YOK.** Takvim boşken "neden
            boş" sorusu cevapsız kalmasın; ama ekran da bir envantere dönüşmesin. */}
        {veri.planlanamaz === undefined || veri.planlanamaz.metinYok === 0
          ? ''
          : ` · ${String(veri.planlanamaz.metinYok)} üretim METİNSİZ — planlanamaz`}
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
            <div
              key={t}
              className={`${sinif}${surukleHedef === t ? ' takvim-hedef' : ''}`}
              // ⚠ ⚠ **SÜRÜKLEME TAKVİMİN DOĞAL DİLİ.** Depo sahibi: *"takvimde elle
              // sürükleyerek yer değiştirmek istiyorum."* Bir ızgarada bir şeyi başka bir
              // güne taşımak, tarih alanına yazmaktan daha doğrudan — ve karar kutusunu
              // açmayı gerektirmiyor. Kutu duruyor: sürükleme HIZLI yol, tek yol değil.
              onDragOver={(e) => {
                if (surukleniyor === null) return
                // ⚠ `preventDefault` OLMADAN tarayıcı bırakmaya izin vermiyor — sessizce
                // hiçbir şey olmuyor ve sebebi görünmüyor.
                e.preventDefault()
                setSurukleHedef(t)
              }}
              onDragLeave={() => setSurukleHedef((x) => (x === t ? null : x))}
              onDrop={(e) => {
                e.preventDefault()
                setSurukleHedef(null)
                if (surukleniyor !== null) void tariheTasi(surukleniyor, t)
                setSurukleniyor(null)
              }}
            >
              <span className="takvim-tarih">{t.slice(8)}</span>
              {liste.map((g) => (
                <button
                  key={g.runId}
                  type="button"
                  // ⚠ ⚠ **YAYINLANMIŞ GÖNDERİ SÜRÜKLENMİYOR.** Yayınlanmış bir şeyin
                  // tarihini değiştirmek geçmişi değiştirmektir; olan olmuştur.
                  draggable={g.yayinlandi !== true}
                  onDragStart={(e) => {
                    if (g.yayinlandi === true) return
                    setSurukleniyor(g.runId)
                    e.dataTransfer.effectAllowed = 'move'
                    // ⚠ Firefox bir veri yükü olmadan sürüklemeyi başlatmıyor.
                    e.dataTransfer.setData('text/plain', g.runId)
                  }}
                  onDragEnd={() => {
                    setSurukleniyor(null)
                    setSurukleHedef(null)
                  }}
                  className={[
                    'takvim-oge',
                    g.elle === true ? 'takvim-elle' : '',
                    g.yayinlandi === true ? 'takvim-yayinlandi' : '',
                    surukleniyor === g.runId ? 'takvim-suruklenen' : '',
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
                    {(g.platformlar === undefined || g.platformlar.length === 0
                      ? VARSAYILAN_PLATFORMLAR
                      : g.platformlar
                    )
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

      {/* ⚠ ⚠ **TAKVİMİN ALTINDA YALNIZ ÜÇ KUTU VAR: planlanan · yayınlanan · hata veren.**
          Depo sahibi: *"takvimin altındaki şeyler sadece planlananlar, yayınlananlar
          olabilir ya da hata verenler; başka şeyler olamaz, bunlar da görselleriyle
          görünmeli ve basınca run detay açılmalı."* Önceki sürümde kapı kuyruğu, şablonsuz
          koşular ve çıkarılanlar da buradaydı — ekran bir takvim değil bir envanterdi.
          ⚠ Görsel ŞART: bir gönderiyi tarihinden değil NEYE BENZEDİĞİNDEN tanıyoruz. */}

      {gecikmis.length === 0 ? null : (
        <section className="akis-hafta">
          <h3>tarihi geçti — yayınlandı mı?</h3>
          {/* ⚠ Sistem KENDİ İŞARETLEMİYOR: yayınlandığını yalnız insan (ya da hedef)
              bilir. Kartı açıp *"yayınlandı olarak işaretle"* demek, o gönderiyi
              yayına kapatıyor — bir daha planlanamıyor, hedefe gönderilemiyor. */}
          <p className="is-uyari">
            {gecikmis.length} gönderinin tarihi geçmiş ama yayınlandı işareti yok. Kartı aç ve{' '}
            <strong>yayınlandı olarak işaretle</strong> — işaretlenen gönderi bir daha yayına
            giremez.
          </p>
          <ul className="gonderi-listesi">
            {gecikmis.map((g) => (
              <GonderiKarti
                key={`g-${g.runId}`}
                g={g}
                ac={() => setAcik(acik === g.runId ? null : g.runId)}
                secili={acik === g.runId}
              />
            ))}
          </ul>
        </section>
      )}

      <section className="akis-hafta">
        <h3>planlananlar</h3>
        {bekleyen.length === 0 ? (
          <p className="bos">
            Takvimde gönderi yok.
            {veri.planlanamaz.metinYok === 0
              ? ''
              : ` ${String(veri.planlanamaz.metinYok)} üretimin gönderi metni yok — metin olmadan planlanamaz.`}
          </p>
        ) : (
          <ul className="gonderi-listesi">
            {bekleyen.map((g) => (
              <GonderiKarti
                key={`p-${g.runId}`}
                g={g}
                ac={() => setAcik(acik === g.runId ? null : g.runId)}
                secili={acik === g.runId}
              />
            ))}
          </ul>
        )}
      </section>

      <section className="akis-hafta">
        <h3>yayınlananlar</h3>
        {yayinlanan.length === 0 ? (
          <p className="bos">henüz hiçbir üretim yayınlanmadı.</p>
        ) : (
          <ul className="gonderi-listesi">
            {yayinlanan.map((g) => (
              <GonderiKarti
                key={`y-${g.runId}`}
                g={g}
                ac={() => setAcik(acik === g.runId ? null : g.runId)}
                secili={acik === g.runId}
              />
            ))}
          </ul>
        )}
      </section>

      {/* ⚠ ⚠ **HATA VEREN ve KAPIDA BEKLEYEN AYRI ŞEYLER.** Kapıda bekleyen bir koşu hata
          değil, SIRADIR — ve o sıra bu ekranda değil, Koşular ekranında. Burada yalnız
          MÜDAHALE isteyenler: hattın ortasında durmuş olanlar. */}
      {(veri.hatali ?? []).length === 0 ? null : (
        <section className="akis-hafta">
          <h3>hata verenler</h3>
          <ul className="gonderi-listesi">
            {(veri.hatali ?? []).map((h) => (
              <GonderiKarti
                key={`h-${h.runId}`}
                g={{
                  runId: h.runId,
                  sablon: h.sablon,
                  konu: h.konu,
                  tarih: '',
                  slaytlar: h.slaytlar,
                }}
                hata={h.sebep}
                ac={() => setAcik(acik === h.runId ? null : h.runId)}
                secili={acik === h.runId}
              />
            ))}
          </ul>
        </section>
      )}

      {/* ⚠ Karar kutusu listelerin ALTINDA tek bir yerde: her kartın içine gömmek aynı
          kutuyu on kez çizmek ve on ayrı durum tutmak demekti. */}
      {acik === null ? null : (
        <GonderiKutusu
          runId={acik}
          konu={konuAl(acik)}
          kapat={() => setAcik(null)}
          sonra={yukle}
          {...(otomatikTarihler[acik] === undefined
            ? {}
            : { otomatikTarih: otomatikTarihler[acik] })}
          {...(metinHaritasi[acik] === undefined
            ? {}
            : { metinliPlatformlar: metinHaritasi[acik] })}
          {...((veri.senkron ?? {})[acik] === undefined
            ? {}
            : { senkron: (veri.senkron ?? {})[acik] })}
        />
      )}
    </div>
  )
}
