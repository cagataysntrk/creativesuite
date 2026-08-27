// Run History / Provenance Browser (§13, §12.9 · FAZ-4.15).
//
// **Ekranın taşıdığı tek zor gerçek:** `rerun` kararı tekrarlar, ESERİ değil.
//
// Kullanıcı bir çalıştırmayı yeniden koştuğunda farklı bir görsel çıkarsa ve ekran ona
// bunu önceden söylememişse, bunu bir bug sanar — ve o an sistemin ölçtüğü her sayıya
// olan güvenini de kaybeder. Bu yüzden uyarı bir dipnot değil, düğmelerin yanında.
//
// **İki düğme, iki AYRI eylem:** `rerun` donmuş planı koşar (aynı sağlayıcı, aynı
// kısıt, aynı seed); `replay` bugünün tanımıyla yeniden planlar. Tek bir "tekrar" düğmesi
// koymak, hangisinin olduğunu kullanıcının bilmemesi demekti.

import { useEffect, useState } from 'react'
import { karoselSirasi } from './karosel.js'
import { GonderiKutusu } from './GonderiKutusu.js'
import { aralikta, tamTarih, tariheGore, type Siralama } from './tarih.js'
import { usdBicimle } from './baglanti.js'

/**
 * Bir SLAYT — koşunun ürettiği damgalı varlık.
 *
 * ⚠ ⚠ **BU EKRAN ARTIK KOŞU VE VARLIK EKRANININ İKİSİ BİRDEN.** Depo sahibi: *"koşular
 * ile varlıkları mükemmelce birleştirsek mi... tek merkezden yönetmiş oluruz"*. İki
 * ekran aynı şeyin iki yüzüydü — biri koşuyu, öteki koşunun ÜRETTİĞİNİ gösteriyordu — ve
 * ikisini eşit tutmak sürekli bir emekti: bir süzgeç birine eklenip ötekine unutuluyordu.
 *
 * ⚠ ⚠ **BİRLEŞMENİN TEHLİKESİ KAYIPTI ve tam tersinden kuruldu.** Varlık ekranı YALNIZ
 * varlık üretmiş koşuları görüyordu (10); koşu ekranı hepsini (226). Birleşimi varlık
 * listesi üzerine kursaydım 216 koşu sessizce düşerdi. O yüzden taban KOŞU listesi ve
 * varlıklar ona EKLENİYOR: varlığı olmayan koşu yerinde duruyor, "henüz varlık yok" der.
 */
/**
 * Paylaşımın ZORUNLU ölçüsü — depo sahibinin kuralı.
 *
 * ⚠ Sunucudaki `VARSAYILAN_TUVAL`den TÜRETİLMİYOR ve bu bilinçli: burası tarayıcı katmanı
 * ve `@suite/contracts`i import etmesi `rings` kapısına takılıyor. Sayı iki yerde yazılı
 * olduğu için `paylasim-olcusu` kapısı ikisinin AYNI kaldığını sınıyor.
 *
 * ⚠ Eski `VarlikKutuphanesi.tsx`ten BURAYA taşındı: o ekran birleşme sonrası kaldırıldı
 * ve sabit onunla birlikte kaybolacaktı.
 */
const PAYLASIM_OLCUSU = '1080x1440'

interface Varlik {
  readonly digest: string
  readonly sourceRunId: string
  readonly konu: string
  readonly createdAt: string
  /**
   * Teslimat damgası — karoselin KAÇINCI parçası (D-248).
   *
   * ⚠ ⚠ **KAROSELİN SIRASI BURADAN GELİR, BAŞKA HİÇBİR YERDEN.** Damga üretim anında
   * basılıyor ve retrofit imkânsız (Yasa 7 · R-11); `index` bir slaytın teslimattaki
   * yeridir ve tek doğru odur.
   */
  readonly teslimat: {
    readonly index: number
    readonly total: number
    readonly role: string
  } | null
  /** Bayttan okunan ölçü, `1080x1440` gibi. `null` = okunamadı. */
  readonly olcu: string | null
  readonly yayinlandi: boolean
  /**
   * Bu bayt teslimattaki o yuvanın ŞU ANKİ hâli mi (D-301).
   *
   * ⚠ ⚠ **Depo sahibi: *"editörde düzenleyince artık eskisi görünmemeli yenisi
   * görünmeli sadece çünkü eskisi ile sürekli karışıyor."*** Emekli sürüm diskte
   * duruyor (Yasa 10) ama listede DEĞİL: iki sürümü yan yana göstermek, hangisinin
   * yayına gideceğini her bakışta yeniden sordurdu.
   * ⚠ Alan YOKSA `true` sayılıyor: eski bir sunucu sürümüyle konuşulduğunda listeyi
   * boşaltmak, eksik bilgiyi "hepsi emekli" diye okumak olurdu.
   */
  readonly guncel?: boolean
  /** Bu damgalı bayt editörde kaydedilerek mi doğdu (D-301). */
  readonly elleDuzenlendi?: boolean
}

interface Ozet {
  readonly runId: string
  readonly pipeline: string
  readonly brandId: string
  readonly eraId: string
  readonly createdAt: string
  readonly corpusCommit: string
  readonly registryCommit: string
  readonly adimSayisi: number
  readonly tahminUstMikros: string
  readonly gercekMikros: string
  readonly sapmaYuzde: number | null
  readonly onemli: boolean
  readonly awaitingGate: string | null
  /**
   * O kapı için karar ZATEN yazılmış mı — `awaitingGate` karar yazılınca DEĞİŞMİYOR.
   *
   * ⚠ Manifest yeniden yazılana kadar aynı kapıyı gösteriyor ve o iş dakikalar sürüyor;
   * ekran onaylanmış bir koşuyu hâlâ "bekliyor" diye gösteriyordu.
   */
  readonly kapiKarariVerildi: boolean
  readonly stoppedAt: string | null
  readonly kararSayisi: number
  readonly manifestSaglam: boolean
  readonly donmusPlanVar: boolean
  /** İnsan "bunu beğenmedim" dedi — kayıt duruyor, liste temizleniyor. */
  readonly elendi: { readonly at: string; readonly sebep: string } | null
  readonly sablon: string | null
  readonly konu: string | null
  /**
   * Gönderinin YAYIN AKIŞINDAKİ yeri — sunucudan, tek kaynaktan (`yayinlanmis.ts`).
   *
   * ⚠ ⚠ **BU EKRAN YAYIN DURUMUNU HİÇ BİLMİYORDU.** Yayınlanmışlığı varlık
   * digest'lerinden kendi hesaplıyordu; elle işaretlenmiş ya da hedefte zamanlanmış
   * bir gönderiyi göremiyordu. Depo sahibi: *"planlanmış olanlar ve durumları çok net
   * görünmeli varlıklarda. ve yayın ve varlıklar tam senkron olmalı."* Senkron bir
   * kopyalama işi değil, TEK KAYNAK işidir.
   * ⚠ İsteğe bağlı: eski bir sunucuyla konuşulursa ekran çökmemeli.
   */
  /** Metni YAZILMAMIŞ varsayılan platformlar — tek tuşla üretilebilsin diye. */
  readonly eksikMetin?: readonly string[]
  readonly gonderi?: {
    readonly asama: 'yayinlandi' | 'zamanlandi' | 'planlandi' | 'cikarildi' | 'planlanmadi'
    readonly tarih: string
    readonly hedef: string
    readonly platformlar: readonly string[]
    readonly etiket: string
    readonly yayin: { readonly yayinlandi: boolean; readonly kaynak: string | null }
  }
}

interface Adim {
  readonly stepId: string
  readonly verb: string
  readonly status: string
  readonly lane: string
  readonly capability: string | null
  readonly providerId: string | null
  readonly model: string | null
  readonly seed: number | null
  readonly tahminUstMikros: string
  readonly gercekMikros: string | null
  readonly adaylar: readonly {
    readonly providerId: string
    readonly selected: boolean
    readonly rejectionReason: string | null
  }[]
  readonly sureMs: number | null
}

interface Secenek {
  readonly kind: string
  readonly mumkun: boolean
  readonly neden: string | null
  readonly ne: string
}

interface Detay {
  readonly ozet: Ozet
  readonly adimlar: readonly Adim[]
  readonly kararlar: readonly {
    readonly gate: string
    readonly decision: string
    readonly at: string
    readonly note: string | null
  }[]
  readonly baglam: readonly {
    readonly section: string
    readonly tokens: number
    readonly kayitlar: readonly { readonly recordId: string; readonly reason: string }[]
  }[]
  readonly tekrar: {
    readonly rerun: Secenek
    readonly replay: Secenek
    readonly sapmalar: readonly string[]
    readonly sapmaOlculdu: boolean
    readonly belirsizAdimlar: readonly {
      readonly stepId: string
      readonly verb: string
      readonly seedli: boolean
      readonly neden: string
    }[]
    readonly uyari: string
  }
  readonly donmusKayitlar: readonly string[]
}

const kisaSha = (s: string): string => (/^[0-9a-f]{40}$/.test(s) ? s.slice(0, 8) : s)

export const RunGecmisi = ({
  ac,
}: {
  /** Koşu ekranını açar — panelin geri kalanıyla AYNI hedef (FAZ-17.3). */
  readonly ac?: (runId: string) => void
} = {}): React.JSX.Element => {
  const [liste, setListe] = useState<readonly Ozet[] | null>(null)
  const [secili, setSecili] = useState<string | null>(null)
  // ⚠ ⚠ **138 SATIR FİLTRESİZ DÖKÜLÜYORDU.** Ekran "çalıştırma geçmişi" diyor ama
  // kullanıcının sorusu hiçbir zaman "hepsini göster" değil: "bugün ne koştu",
  // "hangileri durdu", "şu hat ne yaptı". Filtresiz bir liste, cevabı içinde
  // saklayan bir liste.
  const [fHat, setFHat] = useState('')
  const [fDurum, setFDurum] = useState('')
  const [fTaze, setFTaze] = useState(false)
  const [ara, setAra] = useState('')
  const [elenenler, setElenenler] = useState(false)
  // ⚠ ⚠ **TARİH EKRANDA HİÇ YOKTU** ve süzgeçlerde de yoktu: "bu ne zaman koştu" ve
  // "şu iki gün arasında ne oldu" sorularının cevabı hiçbir yerde yoktu.
  const [fBas, setFBas] = useState('')
  const [fSon, setFSon] = useState('')
  const [siralama, setSiralama] = useState<Siralama>('yeni')
  // ⚠ ⚠ **BU İKİ SÜZGEÇ "ONAYLAR" EKRANINI GEREKSİZ KILDI.** Ayrı bir onay ekranı
  // vardı çünkü koşu listesinde *hangi kapı* ve *hangi şablon* sorulamıyordu. Depo
  // sahibi: *"onaylar sekmesi aşırı işlevsiz, zaten onayı koşu detayında yönetiyoruz;
  // koşular ve varlıklar sekmelerine filtre ve özellikler ekleyerek onaylar sekmesini
  // kaldırıp bu sekmeleri canlandırabiliriz"*.
  const [fKapi, setFKapi] = useState('')
  const [fSablon, setFSablon] = useState('')
  // ⚠ ⚠ **YAYIN DURUMU SÜZGECİ — depo sahibinin isteği:** *"planlanmış olanlar ve
  // durumları çok net görünmeli varlıklarda."* Görünmek yetmiyor; 202 koşuda
  // *"hangileri planlı"* sorusu bir süzgeç olmadan cevaplanamıyor.
  const [fYayin, setFYayin] = useState('')
  // ⚠ Çoklu seçim: on koşuyu tek tek elemek, elemeyi kullanılmaz yapardı.
  const [secilenler, setSecilenler] = useState<readonly string[]>([])
  const [detay, setDetay] = useState<Detay | null>(null)
  // ── varlık tarafı (eski Varlıklar ekranından) ────────────────────────────
  const [varliklar, setVarliklar] = useState<readonly Varlik[]>([])
  // ⚠ Ekranda GÖSTERİLMİYOR — yalnız karantina için: silinmedikleri hâlde listede
  // olmayan baytlar, karantinaya alınırken de unutulmamalı.
  const [emekliVarliklar, setEmekliVarliklar] = useState<readonly Varlik[]>([])
  const [karantina, setKarantina] = useState(0)
  const [takvimAcik, setTakvimAcik] = useState<string | null>(null)
  const [onayMesaj, setOnayMesaj] = useState<string | null>(null)
  const [karantinaSebep, setKarantinaSebep] = useState<string | null>(null)
  // ⚠ ⚠ **İKİ GÖRÜNÜM, TEK VERİ ve TEK SÜZGEÇ.** Kart görünümü slaytları gösteriyor —
  // bir tasarıma karar vermek için ona BAKMAK gerekiyor. Tablo görünümü on koşuyu tek
  // ekranda ve maliyetiyle gösteriyor — "bu hafta ne oldu" sorusu için. İkisini ayrı
  // EKRAN yapmak, iki ayrı süzgeç seti ve sonsuz bir eşitleme emeği demekti; ikisini
  // ayrı GÖRÜNÜM yapmak aynı listeyi iki yoğunlukta okumak.
  const [gorunum, setGorunum] = useState<'kart' | 'tablo'>('kart')
  const [tekrarSonuc, setTekrarSonuc] = useState<string | null>(null)
  /** Metin üretimi koşan koşu — düğme iki kez basılmasın (model çağrısı pahalı). */
  const [metinUreten, setMetinUreten] = useState<string | null>(null)

  /**
   * İki AYRI uç, iki AYRI eylem. Tek bir "tekrar" çağrısı yapıp sunucuda ayırmak,
   * ekrandaki iki düğmeyi kozmetiğe çevirirdi (FAZ-4.15).
   */
  const tekrarla = async (runId: string, kind: 'rerun' | 'replay'): Promise<void> => {
    setTekrarSonuc(null)
    try {
      const r = await fetch(`/api/calistirmalar/${encodeURIComponent(runId)}/${kind}`, {
        method: 'POST',
      })
      const j = (await r.json()) as { ok: boolean; runId?: string; hata?: string }
      setTekrarSonuc(
        j.ok ? `${kind} başlatıldı: ${j.runId ?? ''}` : (j.hata ?? `${kind} başarısız`)
      )
    } catch {
      setTekrarSonuc('sunucuya ulaşılamıyor')
    }
  }

  const listeyiCek = (): void => {
    void fetch('/api/calistirmalar')
      .then((r) => r.json() as Promise<{ calistirmalar: readonly Ozet[] }>)
      .then((j) => setListe(j.calistirmalar))
      .catch(() => setListe([]))
    // ⚠ İKİ UÇ, TEK LİSTE. Varlıkları sunucuda koşulara katmak da olurdu ama iki uç iki
    // ayrı soruya cevap veriyor ve ayrı ayrı da kullanılıyorlar; birleştirme EKRANDA.
    // ⚠ Varlık isteği düşerse liste yine çiziliyor: slaytsız bir liste, listesiz bir
    // ekrandan iyidir.
    void fetch('/api/varliklar')
      .then(
        (r) =>
          r.json() as Promise<{
            varliklar?: Varlik[]
            emekliVarliklar?: Varlik[]
            karantina?: number
          }>
      )
      .then((j) => {
        setVarliklar(j.varliklar ?? [])
        setEmekliVarliklar(j.emekliVarliklar ?? [])
        setKarantina(j.karantina ?? 0)
      })
      .catch(() => setVarliklar([]))
  }

  /**
   * Kapıyı BURADAN geçirir — slaytlara bakarken.
   *
   * ⚠ ⚠ **RED GEREKÇE İSTİYOR, ONAY İSTEMİYOR** ve bu asimetri kasıtlı (§4.5): gerekçesiz
   * bir *"hayır"* sonraki koşuya hiçbir bilgi taşımaz; sistem reddedildiğini bilir, nedenini
   * bilmez ve aynı öneriyi tekrar getirir.
   * ⚠ Onay bir kapı kararıdır, bir yayın DEĞİL: hattı sürdürüyor, hiçbir şey yayınlamıyor.
   */
  const kapiyiGec = async (runId: string, kapi: string, onay: boolean): Promise<void> => {
    const gerekce = onay ? '' : (prompt(`${kapi} REDDEDİLİYOR. Neden? (zorunlu)`) ?? '')
    if (!onay && gerekce.trim() === '') return
    try {
      const r = await fetch(
        `/api/kuyruk/${encodeURIComponent(runId)}/${encodeURIComponent(kapi)}`,
        {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ karar: onay ? 'approved' : 'rejected', gerekce }),
        }
      )
      const j = (await r.json()) as { ok?: boolean; hata?: string }
      setOnayMesaj(
        j.ok === true
          ? `✓ ${kapi} ${onay ? 'onaylandı' : 'reddedildi'}`
          : `✗ ${j.hata ?? 'yazılamadı'}`
      )
    } catch {
      setOnayMesaj('✗ sunucuya ulaşılamıyor')
    }
    listeyiCek()
  }

  /**
   * Seçilen koşuların SLAYTLARINI karantinaya alır.
   *
   * ⚠ ⚠ **ELEME İLE KARANTİNA AYRI ŞEYLER ve ikisi de burada.** Eleme koşuyu LİSTEDEN
   * çıkarır (kayıt durur); karantina VARLIĞI yayın havuzundan çıkarır (byte durur, taşınır).
   * Bir üretimin tasarımı kötüyse karantina, koşusu ilgisizse eleme. İkisini tek düğmeye
   * indirmek, ikisinden birini yapamaz hâle getirirdi.
   * ⚠ Sebep ZORUNLU — sunucu da zorluyor (D-155).
   */
  const karantinaYap = async (): Promise<void> => {
    const sebep = (karantinaSebep ?? '').trim()
    if (sebep === '') return
    // ⚠ ⚠ **EMEKLİ BAYTLAR DA KARANTİNAYA GİDİYOR.** Ekranda görünmüyorlar ama
    // diskteler (Yasa 10): bir koşuyu karantinaya alıp eski sürümlerini dışarıda
    // bırakmak, "bu üretim kullanılamaz" demenin yarısını yapmak olurdu.
    const digestler = [...varliklar, ...emekliVarliklar]
      .filter((v) => secilenler.includes(v.sourceRunId))
      .map((v) => v.digest)
    if (digestler.length === 0) {
      setOnayMesaj('✗ seçilen koşuların hiç varlığı yok — karantinaya alınacak bir şey yok')
      setKarantinaSebep(null)
      return
    }
    const r = await fetch('/api/varliklar/karantina', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ digestler, sebep }),
    })
    const j = (await r.json()) as { ok?: boolean; hata?: string }
    setOnayMesaj(
      j.ok === true ? `⌫ ${String(digestler.length)} slayt karantinada` : `✗ ${j.hata ?? 'olmadı'}`
    )
    setKarantinaSebep(null)
    setSecilenler([])
    listeyiCek()
  }

  useEffect(listeyiCek, [])

  /**
   * Koşuyu eler — **byte'a ve deftere DOKUNMADAN.**
   *
   * ⚠ Gerekçe ZORUNLU (sunucu da zorluyor): gerekçesiz bir eleme, altı ay sonra "bu
   * neden elenmiş" sorusunu cevapsız bırakır ve kimse geri almaya cesaret edemez.
   */
  /** Seçilen koşuları TEK gerekçeyle eler — tek tek sormak on soru demekti. */
  const topluEle = async (): Promise<void> => {
    const sebep = prompt(`${secilenler.length} koşu elenecek. Neden? (kayıt SİLİNMİYOR)`) ?? ''
    if (sebep.trim() === '') return
    for (const runId of secilenler) {
      await fetch(`/api/kosu/${encodeURIComponent(runId)}/ele`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ sebep }),
      })
    }
    setSecilenler([])
    listeyiCek()
  }

  const ele = async (r: Ozet): Promise<void> => {
    const geriAl = r.elendi !== null
    const sebep = geriAl
      ? ''
      : (prompt('Neden eleniyor? (kayıt SİLİNMİYOR, listeden kalkıyor)') ?? '')
    if (!geriAl && sebep.trim() === '') return
    await fetch(`/api/kosu/${encodeURIComponent(r.runId)}/ele`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(geriAl ? { geriAl: true } : { sebep }),
    })
    listeyiCek()
  }

  useEffect(() => {
    if (secili === null) return
    setDetay(null)
    void fetch(`/api/calistirmalar/${encodeURIComponent(secili)}`)
      .then((r) => (r.ok ? (r.json() as Promise<Detay>) : null))
      .then(setDetay)
      .catch(() => setDetay(null))
  }, [secili])

  if (liste === null) return <p>yükleniyor…</p>

  const hatlar = [...new Set(liste.map((r) => r.pipeline))].sort()
  // ⚠ Seçenekler VERİDEN türüyor: sabit bir kapı listesi yazsaydım yeni bir kapı
  // eklendiğinde süzgeç onu sessizce göstermez, "hiç yok" derdi.
  const kapilar = [...new Set(liste.map((r) => r.awaitingGate).filter((x) => x !== null))].sort()
  const sablonlar = [...new Set(liste.map((r) => r.sablon).filter((x) => x !== null))].sort()
  const yediGunOnce = Date.now() - 7 * 24 * 3600 * 1000
  const durumu = (r: Ozet): string =>
    !r.manifestSaglam
      ? 'kusurlu'
      : r.awaitingGate !== null
        ? 'kapida'
        : r.stoppedAt !== null
          ? 'durdu'
          : 'tamam'
  const suzulmusHam = liste
    .filter((r) => fHat === '' || r.pipeline === fHat)
    .filter((r) => fDurum === '' || durumu(r) === fDurum)
    .filter((r) => !fTaze || new Date(r.createdAt).getTime() >= yediGunOnce)
    .filter((r) => fKapi === '' || r.awaitingGate === fKapi)
    .filter((r) => fSablon === '' || r.sablon === fSablon)
    .filter((r) => fYayin === '' || (r.gonderi?.asama ?? 'planlanmadi') === fYayin)
    // ⚠ Arama artık KONUYU da tarıyor: bir koşuyu kimliğinden değil konusundan
    // hatırlıyoruz ve `run_01a0…` yazarak arama yapan kimse yok.
    .filter(
      (r) =>
        ara.trim() === '' ||
        `${r.runId} ${r.pipeline} ${r.sablon ?? ''} ${r.konu ?? ''}`
          .toLocaleLowerCase('tr')
          .includes(ara.trim().toLocaleLowerCase('tr'))
    )
    // ⚠ ⚠ **SİLMEK YOK, ELEMEK VAR.** `derived/runs` türetilemez ve silinmez (Yasa 11 ·
    // R-52); ama beğenilmeyen çıktının listeyi doldurması da bir maliyet — insan
    // aradığını bulamıyor. Eleme ikisini uzlaştırıyor: kayıt DURUYOR, liste temizleniyor.
    .filter((r) => elenenler || r.elendi === null)
    .filter((r) => aralikta(r.createdAt, fBas, fSon))
  // ⚠ Sıralama artık SEÇİLEBİLİR. Varsayılan yine en yeni önce: geçmiş ekranında insan
  // en son ne olduğuna bakar. Ama "ilk koşular ne yapmıştı" da meşru bir soru ve
  // cevabını sabit bir sıralama gizliyordu.
  // ⚠ ⚠ **KOŞU → SLAYTLAR.** Sıra `createdAt`ten: slaytlar üretildikleri sırayla yazılıyor
  // ve karoselin sırası tam olarak o. Digest'e göre sıralamak, kapağı ortaya atardı.
  // ⚠ Emekli sürümleri burada SÜZMÜYORUZ: `/api/varliklar` artık onları hiç
  // vermiyor (`kutuphane.ts`). İki yerde tutulan bir güvence, bir gün birinin
  // unutulduğu bir güvencedir — Komuta ekranında tam olarak bu oldu.
  const slaytHaritasi = new Map<string, Varlik[]>()
  for (const v of varliklar) {
    const l = slaytHaritasi.get(v.sourceRunId) ?? []
    l.push(v)
    slaytHaritasi.set(v.sourceRunId, l)
  }
  // ⚠ Sıra `karosel.ts`ten — panelde tek yer. Gerekçenin tamamı orada: bu kural bu
  // depoda sekiz kez yazıldı ve iki kopyası yanlıştı.
  for (const [k, l] of slaytHaritasi) slaytHaritasi.set(k, karoselSirasi(l))

  /**
   * Bir koşunun slaytlarının ORTAK ölçüsü.
   *
   * ⚠ ⚠ **TEK SLAYTA BAKMAK YETMEZ.** Instagram karoselin oranını İLK slayttan alıyor ve
   * gerisini ona göre KIRPIYOR; ayrışan bir slayt sessizce kırpılır. O yüzden ölçü ancak
   * HEPSİ aynıysa ilan ediliyor, değilse `karışık` — ve `karışık` bir uyarıdır.
   */
  const olcusu = (runId: string): string | null => {
    const l = slaytHaritasi.get(runId) ?? []
    if (l.length === 0) return null
    const hepsi = [...new Set(l.map((v) => v.olcu))]
    return hepsi.length === 1 ? (hepsi[0] ?? null) : 'karışık'
  }
  // ⚠ Grup "yayınlandı" ancak HEPSİ yayınlandıysa: karoselin üç slaydı yayınlanmışsa o
  // gönderi yayınlanmamıştır, YARIM kalmıştır.
  // ⚠ ⚠ **BU YÜKLEM DOKUZUNCU KOPYAYDI ve eksikti.** Yayınlanmışlığı varlık
  // digest'lerinden hesaplıyordu; elle işaretlenmiş ya da hedefte zamanlanmış bir
  // gönderi burada "yayınlanmadı" görünüyordu — yayın ekranıyla ayrışmanın kendisi.
  // Cevap artık sunucudan geliyor.
  const yayinlandiMi = (runId: string): boolean =>
    liste.find((r) => r.runId === runId)?.gonderi?.yayin.yayinlandi === true

  /**
   * EKSİK gönderi metinlerini üretir — koşuyu AÇMADAN.
   *
   * ⚠ ⚠ **DEPO SAHİBİ: *"run içine girmeden metin ürettirme olmalı, tek tuşla eksik
   * olan metinleri üretebilmeliyiz ilgili varlık için."*** Metin üretmek için koşu
   * detayına girmek gerekiyordu; on koşuda on kez girip çıkmak demekti.
   *
   * ⚠ ⚠ **YALNIZ EKSİK OLANLAR.** Sunucunun `hepsi` seçeneği var ama o YAZILMIŞ metni
   * eziyor: insanın elle düzelttiği bir metni sessizce modele geri vermek, düzeltmeyi
   * yok saymaktır.
   */
  const eksikMetinUret = async (runId: string): Promise<void> => {
    setMetinUreten(runId)
    setTekrarSonuc('⚡ eksik gönderi metinleri üretiliyor…')
    try {
      const j = (await (
        await fetch(`/api/kosu/${runId}/yayin-metni-uret`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ eksik: true }),
        })
      ).json()) as { ok?: boolean; uretilen?: readonly string[]; not?: string; hata?: string }
      setTekrarSonuc(
        j.ok === true
          ? `✓ ${j.not ?? `${String((j.uretilen ?? []).length)} metin üretildi: ${(j.uretilen ?? []).join(' · ')}`}`
          : `✗ ${j.hata ?? 'üretilemedi'}`
      )
      if (j.ok === true) listeyiCek()
    } catch {
      setTekrarSonuc('✗ sunucuya ulaşılamıyor')
    }
    setMetinUreten(null)
  }

  const sirali = tariheGore(suzulmusHam, (r) => r.createdAt, siralama)
  const suzulmus = sirali
  // ⚠ ⚠ **SAYILAR LİSTEYLE AYNI TABANDAN.** İlk sürüm ham listeyi sayıyordu ve başlık
  // *"202 koşu · 113 kapıda"* derken tabloda 2 satır vardı: elenenler sayılıyor ama
  // gösterilmiyordu. Gösterilmeyeni saymak, insanı olmayan 111 satırı aramaya yollar.
  const taban = elenenler ? liste : liste.filter((r) => r.elendi === null)
  const sayim = {
    kapida: taban.filter((r) => durumu(r) === 'kapida').length,
    durdu: taban.filter((r) => durumu(r) === 'durdu').length,
    kusurlu: taban.filter((r) => durumu(r) === 'kusurlu').length,
    elenmis: liste.length - taban.length,
    // ⚠ *"Kaç koşu gerçekten bir şey ÜRETTİ"* ayrı bir soru ve cevabı hiçbir yerde
    // yazmıyordu: 226 koşunun 10'u slayt üretmiş, gerisi yolda düşmüş.
    slaytli: taban.filter((r) => (slaytHaritasi.get(r.runId) ?? []).length > 0).length,
    yayinlanmis: taban.filter((r) => yayinlandiMi(r.runId)).length,
  }

  /**
   * Koşunun AYRINTISI — adımlar, kararlar, tekrar, donmuş kayıt kümesi.
   *
   * ⚠ ⚠ **KARTIN İÇİNDE AÇILIYOR, SAYFANIN DİBİNDE DEĞİL.** İlk sürümde ayrıntı listenin
   * ALTINDA çiziliyordu: yirminci kartın "adımlar"ına basan insan hiçbir şey olmamış
   * sanıyor, çünkü açılan şey ekranın dışında. Açılan bir şey görülmüyorsa açılmamıştır.
   * ⚠ Tek gövde, iki çağıran (kart ve tablo): kopyalasaydım biri düzelir öteki unuturdu.
   */
  const ayrinti = (): React.JSX.Element | null =>
    detay === null ? null : (
      <article>
        <h2>{detay.ozet.runId}</h2>
        <p className="mono">
          {detay.ozet.brandId} · {detay.ozet.eraId} · corpus {kisaSha(detay.ozet.corpusCommit)} ·
          registry {kisaSha(detay.ozet.registryCommit)} · {detay.ozet.createdAt}
        </p>

        <h3>Tekrar</h3>
        {/* Uyarı düğmelerin ÜSTÜNDE: tıkladıktan sonra okunan bir uyarı, uyarı değildir. */}
        <p role="note">{detay.tekrar.uyari}</p>
        <div>
          <button
            type="button"
            disabled={!detay.tekrar.rerun.mumkun}
            onClick={() => void tekrarla(detay.ozet.runId, 'rerun')}
          >
            rerun — {detay.tekrar.rerun.ne}
          </button>
          {detay.tekrar.rerun.neden === null ? null : <p>{detay.tekrar.rerun.neden}</p>}
          <button
            type="button"
            disabled={!detay.tekrar.replay.mumkun}
            onClick={() => void tekrarla(detay.ozet.runId, 'replay')}
          >
            replay — {detay.tekrar.replay.ne}
          </button>
          {tekrarSonuc === null ? null : (
            <p role="status" className="mono">
              {tekrarSonuc}
            </p>
          )}
        </div>

        <h4>Donmuş plan ile bugünün dünyası arasındaki fark</h4>
        {!detay.tekrar.sapmaOlculdu ? (
          // "Ölçülmedi" ile "fark yok" AYRI sonuçlardır (§12.6). Boş liste göstermek
          // ikincisini ima ederdi.
          <p>ölçülemedi — donmuş plan ya da bugünün sağlayıcı tanımı okunamadı</p>
        ) : detay.tekrar.sapmalar.length === 0 ? (
          <p>fark yok — replay bugün aynı planı üretir</p>
        ) : (
          <ul>
            {detay.tekrar.sapmalar.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        )}

        <h4>rerun bile aynı eseri vermeyebilir</h4>
        {detay.tekrar.belirsizAdimlar.length === 0 ? (
          <p>dış dünyaya bağlı adım yok — bu çalıştırma yeniden üretilebilir</p>
        ) : (
          <ul>
            {detay.tekrar.belirsizAdimlar.map((b) => (
              <li key={b.stepId}>
                <span className="mono">{b.stepId}</span> · {b.verb} ·{' '}
                {b.seedli ? 'seed var' : 'seed YOK'} — {b.neden}
              </li>
            ))}
          </ul>
        )}

        <h3>İstasyon zinciri</h3>
        <ol>
          {detay.adimlar.map((a) => (
            <li key={a.stepId}>
              <span className="mono">{a.stepId}</span> · {a.verb} · {a.lane} ·{' '}
              {a.capability ?? 'yetenek yok'} · {a.providerId ?? 'sağlayıcı yok'} ·{' '}
              {a.model ?? 'model yok'} · seed {a.seed === null ? '—' : a.seed} ·{' '}
              <span className="mono">
                {a.gercekMikros === null ? 'koşmadı' : usdBicimle(a.gercekMikros)}
              </span>{' '}
              / tahmin <span className="mono">{usdBicimle(a.tahminUstMikros)}</span> ·{' '}
              {a.sureMs === null ? '—' : `${a.sureMs} ms`} · {a.status}
              {/* Kaybeden adaylar da görünür: yönlendirmeyi sihirden yönetişime
                      çeviren şey, altı ay sonra "neden bu model" sorusunun cevabıdır. */}
              {a.adaylar.filter((k) => !k.selected).length === 0 ? null : (
                <ul>
                  {a.adaylar
                    .filter((k) => !k.selected)
                    .map((k) => (
                      <li key={k.providerId}>
                        {k.providerId} elendi — {k.rejectionReason ?? 'gerekçe yazılmamış'}
                      </li>
                    ))}
                </ul>
              )}
            </li>
          ))}
        </ol>

        <h3>İnsan kararları</h3>
        {detay.kararlar.length === 0 ? (
          <p>insan kararı yok</p>
        ) : (
          <ul>
            {detay.kararlar.map((k) => (
              <li key={`${k.gate}-${k.at}`}>
                {k.gate} · {k.decision} · {k.at}
                {k.note === null ? '' : ` — ${k.note}`}
              </li>
            ))}
          </ul>
        )}

        <h3>Enjekte edilen bağlam</h3>
        {detay.baglam.length === 0 ? (
          <p>bağlam manifesti boş</p>
        ) : (
          <ul>
            {detay.baglam.map((b) => (
              <li key={b.section}>
                {b.section} · <span className="mono">{b.tokens}</span> token · {b.kayitlar.length}{' '}
                kayıt
              </li>
            ))}
          </ul>
        )}

        <h3>Donmuş kayıt kümesi</h3>
        <p>
          {detay.donmusKayitlar.length === 0
            ? 'donmuş plan yok — rerun hangi kayıtlarla koşacağını bilemez'
            : `${detay.donmusKayitlar.length} kayıt · rerun tam olarak bunlarla koşar`}
        </p>
      </article>
    )

  return (
    <section>
      <h1>Koşular ve varlıklar</h1>
      <p className="giris-not">
        {taban.length} koşu · {sayim.kapida} kapıda · {sayim.durdu} durdu · {sayim.slaytli} slayt
        üretmiş · {sayim.yayinlanmis} yayınlanmış · {sayim.kusurlu} kusurlu manifest
        {karantina === 0 ? null : <> · {karantina} karantinada</>}
        {sayim.elenmis === 0 ? null : <> · {sayim.elenmis} elenmiş gizli</>}
        {suzulmus.length === taban.length ? null : <> · süzülen {suzulmus.length}</>}
      </p>
      {onayMesaj === null ? null : <p className="giris-not">{onayMesaj}</p>}

      <div className="filtre-cubuk">
        {/* ⚠ Görünüm anahtarı EN BAŞTA: hangi yoğunlukta okuduğun, neyi süzdüğünden
            önce gelen bir karar. */}
        <label>
          görünüm{' '}
          <select
            value={gorunum}
            onChange={(e) => setGorunum(e.target.value === 'tablo' ? 'tablo' : 'kart')}
          >
            <option value="kart">kart — slaytlarla</option>
            <option value="tablo">tablo — yoğun</option>
          </select>
        </label>
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
          durum{' '}
          <select value={fDurum} onChange={(e) => setFDurum(e.target.value)}>
            <option value="">hepsi</option>
            <option value="kapida">kapıda bekliyor</option>
            <option value="durdu">durdu</option>
            <option value="tamam">tamamlandı</option>
            <option value="kusurlu">kusurlu manifest</option>
          </select>
        </label>
        <label>
          bekleyen kapı{' '}
          <select value={fKapi} onChange={(e) => setFKapi(e.target.value)}>
            <option value="">hepsi</option>
            {kapilar.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        </label>
        <label>
          şablon{' '}
          <select value={fSablon} onChange={(e) => setFSablon(e.target.value)}>
            <option value="">hepsi</option>
            {sablonlar.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        </label>
        <label>
          yayın durumu{' '}
          <select value={fYayin} onChange={(e) => setFYayin(e.target.value)}>
            <option value="">hepsi</option>
            <option value="planlandi">◔ planlandı</option>
            <option value="zamanlandi">⇄ hedefte zamanlandı</option>
            <option value="yayinlandi">✓ yayınlandı</option>
            <option value="cikarildi">⌫ takvimden çıkarıldı</option>
            <option value="planlanmadi">— planlanmadı</option>
          </select>
        </label>
        <label>
          <input type="checkbox" checked={fTaze} onChange={(e) => setFTaze(e.target.checked)} /> son
          7 gün
        </label>
        <label>
          ara <input type="text" value={ara} onChange={(e) => setAra(e.target.value)} />
        </label>
        <label>
          <input
            type="checkbox"
            checked={elenenler}
            onChange={(e) => setElenenler(e.target.checked)}
          />{' '}
          elenenleri de göster
        </label>
        {/* ⚠ Tarih aralığı: "şu iki gün arasında ne oldu" sorusunun cevabı ekranda
            YOKTU. Boş uç = sınırsız; iki ucu da doldurmak zorunda değilsin. */}
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
      </div>
      {/* ⚠ ⚠ **ÇOKLU SEÇİM.** On koşuyu tek tek elemek, elemeyi kullanılmaz yapardı;
          depo sahibi *"çoklu seçim yok"* diye yazdı. Seçim SÜZÜLMÜŞ listeye ait: göz
          neyi görüyorsa onu seçiyor — görünmeyen bir satırı toplu eylem yakalamamalı. */}
      {secilenler.length === 0 ? null : (
        <div className="filtre-cubuk">
          <strong>{secilenler.length} koşu seçili</strong>
          <button type="button" onClick={() => void topluEle()}>
            ✕ seçilenleri ele
          </button>
          {/* ⚠ ⚠ **ELEME İLE KARANTİNA AYRI.** Eleme koşuyu LİSTEDEN çıkarır (kayıt
              durur); karantina VARLIĞI yayın havuzundan çıkarır (byte durur, taşınır).
              Tasarımı kötüyse karantina, koşusu ilgisizse eleme — ikisini tek düğmeye
              indirmek, ikisinden birini yapamaz hâle getirirdi. */}
          <button type="button" onClick={() => setKarantinaSebep('')}>
            ⌫ slaytları karantinaya al
          </button>
          <button type="button" onClick={() => setSecilenler([])}>
            seçimi temizle
          </button>
        </div>
      )}

      {karantinaSebep === null ? null : (
        <div className="gerekce-kutusu">
          <label htmlFor="karantina-sebep">
            karantina sebebi (zorunlu — byte silinmez, taşınır ve defterde iz kalır)
          </label>
          <textarea
            id="karantina-sebep"
            value={karantinaSebep}
            onChange={(e) => setKarantinaSebep(e.target.value)}
          />
          <div className="kapi-dugmeler">
            <button
              type="button"
              disabled={karantinaSebep.trim() === ''}
              onClick={() => void karantinaYap()}
            >
              {secilenler.length} koşunun slaytlarını karantinaya al
            </button>
            <button type="button" onClick={() => setKarantinaSebep(null)}>
              vazgeç
            </button>
          </div>
        </div>
      )}

      {suzulmus.length === 0 ? (
        <p>
          {liste.length === 0
            ? 'Henüz çalıştırma yok — geçmiş boş bir liste, bir hata değil.'
            : 'Bu süzgeçle koşu yok — filtreyi gevşet.'}
        </p>
      ) : gorunum === 'kart' ? (
        <ul className="grup-listesi">
          {suzulmus.map((r) => {
            const slaytlar = slaytHaritasi.get(r.runId) ?? []
            const olcu = olcusu(r.runId)
            return (
              <li key={r.runId} className="grup">
                <div className="grup-basi">
                  <div className="kart-bilgi">
                    <input
                      type="checkbox"
                      aria-label={`${r.runId} seç`}
                      checked={secilenler.includes(r.runId)}
                      onChange={(e) =>
                        setSecilenler(
                          e.target.checked
                            ? [...secilenler, r.runId]
                            : secilenler.filter((x) => x !== r.runId)
                        )
                      }
                    />
                    <strong>
                      {r.konu === null || r.konu === '' ? r.runId.slice(4, 16) : r.konu}
                    </strong>
                    {/* ⚠ ŞABLON HATTIN ÖNÜNDE: bir karoselin hangi tasarımdan geldiği,
                      hangi hattan geldiğinden daha ayırt edici — on üretimin onu da
                      aynı hattan çıkıyor. */}
                    <span className="olcum">{r.sablon ?? '— şablon yok'}</span>
                    {/* ⚠ Ölçü BAYTTAN okundu, beyandan değil. Kural dışıysa uyarı
                      rengiyle: yanlış oran yayın anında — görseller harcandıktan
                      sonra — kırpılır. */}
                    {olcu === null ? null : (
                      <span className={olcu === PAYLASIM_OLCUSU ? 'olcum' : 'is-uyari'}>
                        {olcu}
                      </span>
                    )}
                    <span className="olcum">{r.pipeline}</span>
                    <span className="olcum">
                      {slaytlar.length === 0 ? 'slayt yok' : `${String(slaytlar.length)} slayt`}
                    </span>
                    <span className="olcum">{tamTarih(r.createdAt)}</span>
                    {/* ⚠ ⚠ **YAYIN DURUMU TEK SATIRDA ve TAM.** Eskiden yalnız
                        "yayınlandı / yayınlanmadı" vardı: planlı mı, hangi tarihe,
                        hedefe gitti mi — hiçbiri görünmüyordu. Etiketi SUNUCU
                        kuruyor; iki ekranın aynı durumu iki farklı cümleyle yazması
                        ayrışmanın kelime hâli olurdu. */}
                    <span
                      className={
                        r.gonderi === undefined
                          ? 'bos'
                          : r.gonderi.asama === 'yayinlandi'
                            ? 'is-hat'
                            : r.gonderi.asama === 'planlanmadi'
                              ? 'bos'
                              : 'olcum'
                      }
                      title={r.gonderi?.platformlar.join(' · ') ?? ''}
                    >
                      {r.gonderi?.etiket ?? (yayinlandiMi(r.runId) ? '✓ yayınlandı' : '—')}
                    </span>
                    {r.manifestSaglam ? null : <span className="is-uyari">⊘ kusurlu manifest</span>}
                    {r.elendi === null ? null : (
                      <span className="is-uyari">✕ elendi: {r.elendi.sebep}</span>
                    )}
                    {/* ⚠ ⚠ **DÜZENLENMİŞLİK ARTIK DAMGADAN OKUNUYOR, dizinden değil.**
                        Rozet koşu dizinindeki `-elle.png` dosyalarını sayıyordu ve o
                        dosyalar damgalı sürümün YANINDA ayrı bir "damgasız" bölüm
                        olarak da görünüyordu. Depo sahibi: *"sistemde ikilik olmamalı
                        değiştirdiysek değişmiştir!!"* Bölüm kalktı; rozet damgalı
                        varlığın kendi künyesini okuyor. */}
                    {slaytlar.some((v) => v.elleDuzenlendi === true) ? (
                      <span className="olcum">✎ elle düzenlendi</span>
                    ) : null}
                    {/* ⚠ Bekleyen kapı VERİ tarafında: "bu koşu ne durumda" sorusunun
                      cevabı, "ne yapabilirim" sorusundan önce gelir. */}
                    {/* ⚠ ⚠ **KARAR VERİLDİYSE "BEKLİYOR" DEMİYOR.** `awaitingGate` karar
                        yazılınca DEĞİŞMİYOR — manifest yeniden yazılana kadar aynı kapıyı
                        gösteriyor ve o iş dakikalar sürüyor. Ekran onaylanmış bir koşuyu
                        hâlâ *"tasarım onayı bekliyor"* diye gösteriyordu; depo sahibi
                        gördü: *"onaya bassam da hâlâ tasarım onayı yazıyor"*. */}
                    {r.awaitingGate === null ? null : r.kapiKarariVerildi ? (
                      <span className="is-hat">✓ {r.awaitingGate} — karar verildi</span>
                    ) : (
                      <span className="is-uyari">⏸ {r.awaitingGate}</span>
                    )}
                  </div>
                  {/* ⚠ ⚠ **VERİ SOLDA, EYLEM SAĞDA — ve bu bir süs değil.** İlk sürümde
                      ikisi tek satırda karışıktı: kapısı olan kartta düğme sayısı artıyor,
                      "adımlar" alt satıra düşüyor ve aynı düğme her kartta BAŞKA yerde
                      duruyordu. Göz her kartta yeniden arıyordu. */}
                  <div className="kart-eylem">
                    {ac === undefined ? null : (
                      <button type="button" className="hizli" onClick={() => ac(r.runId)}>
                        aç →
                      </button>
                    )}
                    {/* ⚠ Düğme YALNIZ eksik varsa: eksik olmayan bir koşuda "üret"
                        demek, yazılmış metni ezmeyi teklif etmektir. */}
                    {(r.eksikMetin ?? []).length === 0 ? null : (
                      <button
                        type="button"
                        className="hizli"
                        disabled={metinUreten !== null}
                        title={`metni yazılmamış: ${(r.eksikMetin ?? []).join(' · ')}`}
                        onClick={() => void eksikMetinUret(r.runId)}
                      >
                        {metinUreten === r.runId
                          ? '⏳ metin üretiliyor…'
                          : `⚡ eksik metin (${String((r.eksikMetin ?? []).length)})`}
                      </button>
                    )}
                    {/* ⚠ ⚠ **KARAR SLAYTLARIN YANINDA:** onay kararı slaytlara BAKARAK
                      veriliyor ve slaytlar bu kartın içinde. */}
                    {r.awaitingGate === null || r.kapiKarariVerildi ? null : (
                      <>
                        <button
                          type="button"
                          className="hizli"
                          onClick={() => void kapiyiGec(r.runId, r.awaitingGate as string, true)}
                        >
                          ✓ onayla
                        </button>
                        <button
                          type="button"
                          className="hizli"
                          onClick={() => void kapiyiGec(r.runId, r.awaitingGate as string, false)}
                        >
                          ✕ reddet
                        </button>
                      </>
                    )}
                    <button
                      type="button"
                      className="hizli"
                      onClick={() => setTakvimAcik(takvimAcik === r.runId ? null : r.runId)}
                    >
                      {takvimAcik === r.runId ? '▲ takvim' : '▼ takvim'}
                    </button>
                    <button type="button" className="hizli" onClick={() => void ele(r)}>
                      {r.elendi === null ? '✕ ele' : '↩ elemeyi geri al'}
                    </button>
                    {/* ⚠ Ayrıntı AYNI kartta açılıyor: adımlar, kararlar, tekrar ve
                      donmuş kayıt kümesi başka bir ekranda değil, burada. */}
                    <button
                      type="button"
                      className="hizli"
                      onClick={() => setSecili(secili === r.runId ? null : r.runId)}
                    >
                      {secili === r.runId ? '▲ adımlar' : '▼ adımlar'}
                    </button>
                  </div>
                </div>
                {takvimAcik === r.runId ? (
                  <GonderiKutusu
                    runId={r.runId}
                    konu={r.konu === null || r.konu === '' ? r.runId.slice(4, 16) : r.konu}
                  />
                ) : null}
                {secili === r.runId ? ayrinti() : null}
                {slaytlar.length === 0 ? (
                  <p className="bos">bu koşu henüz slayt üretmedi</p>
                ) : (
                  <div className="kosu-slaytlar">
                    {slaytlar.map((v) => (
                      <a
                        key={v.digest}
                        href={`/api/varlik/${v.digest}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <img src={`/api/varlik/${v.digest}`} alt={v.konu} loading="lazy" />
                        {/* ⚠ ⚠ **SIRA GÖRÜNÜR.** Bozuk bir sıra ancak slaytlar okununca
                            fark ediliyordu; numara yazınca bir bakışta görülüyor — ve
                            bir daha sessizce bozulamaz. */}
                        {v.teslimat === null ? null : (
                          <span className="slayt-sira">
                            {v.teslimat.index + 1}/{v.teslimat.total}
                          </span>
                        )}
                      </a>
                    ))}
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      ) : (
        <table>
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  aria-label="hepsini seç"
                  checked={secilenler.length > 0 && secilenler.length === suzulmus.length}
                  onChange={(e) =>
                    setSecilenler(e.target.checked ? suzulmus.map((x) => x.runId) : [])
                  }
                />
              </th>
              <th>çalıştırma</th>
              <th>şablon</th>
              <th>konu</th>
              <th>tarih</th>
              <th>hat</th>
              <th>bilgi ağacı</th>
              <th>tahmin üst</th>
              <th>gerçek</th>
              <th>sapma</th>
              <th>durum</th>
            </tr>
          </thead>
          <tbody>
            {suzulmus.map((r) => (
              <tr key={r.runId} onClick={() => setSecili(r.runId)}>
                <td onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    aria-label={`${r.runId} seç`}
                    checked={secilenler.includes(r.runId)}
                    onChange={(e) =>
                      setSecilenler(
                        e.target.checked
                          ? [...secilenler, r.runId]
                          : secilenler.filter((x) => x !== r.runId)
                      )
                    }
                  />
                </td>
                <td className="kosu-kimlik">
                  {/* ⚠ İki ayrı hedef, iki ayrı tıklama: satır köken/tekrar
                      ayrıntısını açıyor, düğme KOŞU ekranına götürüyor. Tek
                      tıklamaya iki anlam yüklemek, ikisini de belirsiz yapardı. */}
                  {/* ⚠ ⚠ **KİMLİK KISALDI.** Tam `run_01a03e9e-7d62-7560-b44d-0cb7225e2883`
                      hücreyi üç satıra yayıyordu ve iki düğmeyi aşağı itiyordu; on satırlık
                      bir liste bir ekrana sığmıyordu. Kimliğin tamamı `title`da ve satır
                      zaten tıklanabilir — okunmayan otuz altı karakter yer kaplıyordu. */}
                  <span className="mono" title={r.runId}>
                    {r.runId.slice(4, 12)}…{r.runId.slice(-4)}
                  </span>
                  {ac === undefined ? null : (
                    <button
                      type="button"
                      className="satir-ac"
                      onClick={(e) => {
                        e.stopPropagation()
                        ac(r.runId)
                      }}
                    >
                      ↗ aç
                    </button>
                  )}
                  {/* ⚠ Eleme GEREKÇE istiyor ve GERİ ALINABİLİR: gerekçesiz bir eleme
                      altı ay sonra "bu neden elenmiş" sorusunu cevapsız bırakır. */}
                  <button
                    type="button"
                    className="satir-ac"
                    onClick={(e) => {
                      e.stopPropagation()
                      void ele(r)
                    }}
                  >
                    {r.elendi === null ? '✕ ele' : '↩ elemeyi geri al'}
                  </button>
                </td>
                {/* ⚠ TAM tarih: gün, ay, yıl, saat, dakika. "3 saat önce" iki koşuyu
                    karşılaştırmayı imkânsız kılar ve liste ekranında asıl iş odur. */}
                {/* ⚠ Şablon ve konu KİMLİKTEN HEMEN SONRA: satıra bakan insanın ilk
                    iki sorusu bunlar ve on sütun ötede sorulmuş sayılmıyorlar. */}
                <td>{r.sablon ?? '—'}</td>
                <td>{r.konu === null || r.konu === '' ? '—' : r.konu}</td>
                <td className="mono">{tamTarih(r.createdAt)}</td>
                <td>{r.pipeline}</td>
                <td className="mono">{kisaSha(r.corpusCommit)}</td>
                <td className="mono">{usdBicimle(r.tahminUstMikros)}</td>
                <td className="mono">{usdBicimle(r.gercekMikros)}</td>
                <td className="mono">
                  {r.sapmaYuzde === null ? '—' : `${r.sapmaYuzde.toFixed(1)}%`}
                  {r.onemli ? ' ✗ sapma' : ''}
                </td>
                {/* ⚠ Kapıda bekleyen bir koşu için "durdu: gorsel-yargi" GÜRÜLTÜ: hat
                    durmadı, İNSANI bekliyor. Bekleyen kapı varsa o söyleniyor; durduğu
                    adım ancak gerçekten durmuşsa. */}
                <td>
                  {r.awaitingGate !== null
                    ? `⏸ ${r.awaitingGate}`
                    : r.stoppedAt !== null
                      ? `durdu: ${r.stoppedAt}`
                      : '✓ tamamlandı'}
                  {r.manifestSaglam ? '' : ' · manifest KUSURLU'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {secili !== null && detay === null ? <p>çalıştırma okunuyor…</p> : null}
      {/* ⚠ Tablo görünümünde ayrıntı listenin ALTINDA: satır dar, içine bir makale
          sığmıyor. Kart görünümünde kartın İÇİNDE — orada yer var. */}
      {gorunum === 'tablo' ? ayrinti() : null}
    </section>
  )
}
