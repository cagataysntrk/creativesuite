// Kabuk — komuta merkezinin dış çerçevesi (§12.4 · FAZ-4.2b).
//
// Yüzey bağlamı `data-surface="console"`: kalıcı KOYU, tema anahtarı YOK. Kabuk bir
// izleme kabinidir (ISO 3664) ve çok markalı bir sistemde aracın kendi rengi işin
// rengiyle kavga ederse hiçbir marka dürüst görünmez (§12.1).

import { useCallback, useEffect, useState } from 'react'
import { DurumSeridi, type MakineDurumu } from './DurumSeridi.js'
import { Palet } from './Palet.js'
import { CorpusTarayici } from './CorpusTarayici.js'
import { BaglamOnizleme } from './BaglamOnizleme.js'
import { RunLauncher } from './RunLauncher.js'
import { KOMUTLAR, URETIM_KOMUTLARI } from './komutlar.js'
import { OnayKuyrugu } from './OnayKuyrugu.js'
import { OnayBolumleri } from './OnayBolumleri.js'
import { Giris } from './Giris.js'
import { KosuDetay } from './KosuDetay.js'
import { adresKur, adresiCoz, type Ekran } from './adres.js'
import { YerlesimEkrani } from './YerlesimEkrani.js'
import { DiscoveryEkrani } from './DiscoveryEkrani.js'
import { SemaEkrani } from './SemaEkrani.js'
import { ButceEkrani } from './ButceEkrani.js'
import { YayinSirasi } from './YayinSirasi.js'
import { RunGecmisi } from './RunGecmisi.js'
import { StratejiSagligi } from './StratejiSagligi.js'
import { Doktor } from './Doktor.js'
import { KanalDurumu } from './KanalDurumu.js'
import { PerformansPanosu } from './PerformansPanosu.js'
import { UyumPanosu } from './UyumPanosu.js'

/**
 * Komut → ekran. **Tablo, iç içe ternary DEĞİL.**
 *
 * Ternary zinciri on dört katmana çıkmıştı ve her yeni ekranda aynı hatayı üretti:
 * ekran yönlendirmede vardı ama hiçbir komut ona gitmiyordu. `ui-navigasyon` kapısı üç
 * kez yakaladı — kural doğruydu, şekil yanlıştı. Tabloda unutmak zor: komut ya
 * haritadadır ya değildir, ve kapı iki şekli de aynı sıkılıkta denetliyor.
 */
const EKRAN: Readonly<Record<string, Ekran>> = {
  corpus: 'corpus',
  baglam: 'baglam',
  calistir: 'calistir',
  'onay-kuyrugu': 'kuyruk',
  yerlesim: 'yerlesim',
  kesif: 'kesif',
  sema: 'sema',
  butce: 'butce',
  'yayin-akisi': 'yayin-akisi',
  gecmis: 'gecmis',
  saglik: 'saglik',
  doktor: 'doktor',
  kanallar: 'kanallar',
  performans: 'performans',
  uyum: 'uyum',
}

/**
 * Üst navigasyonda GÖRÜNEN ekranlar — hepsi değil, sık kullanılanlar.
 *
 * ⚠ Tam liste palette; buradaki sıra günlük akışı izliyor: onay → üret → geçmiş →
 * varlık → bütçe → sağlık. Alfabetik bir liste, işin sırasını gizlerdi.
 */
const NAV: readonly (readonly [Ekran, string])[] = [
  ['calistir', 'Üret'],
  ['gecmis', 'Koşular ve varlıklar'],
  // ⚠ Yayın akışı VARLIKLARDAN SONRA: günlük sıra onay → üret → koşular → varlık →
  // YAYIN. Takvim, üretilen şeyin nereye gittiği; varlıktan önce koymak sırayı bozardı.
  ['yayin-akisi', 'Yayın'],
]

// ⚠ ⚠ **`varliklar` ÜST GEZİNMEDEN ÇIKTI — ÇÜNKÜ KOŞULARLA BİRLEŞTİ.** Depo sahibi:
// *"koşular ile varlıkları mükemmelce birleştirsek mi, çünkü zaten varlıklarda basınca
// koşu detayı açılıyor... tek merkezden yönetmiş oluruz"*. İki ekran aynı şeyin iki
// yüzüydü ve ikisini eşit tutmak sürekli bir emekti: bir süzgeç birine eklenip ötekine
// unutuluyordu.
//
// ⚠ ⚠ **BİRLEŞİM KOŞU LİSTESİ ÜZERİNE KURULDU, VARLIK LİSTESİ ÜZERİNE DEĞİL — ve fark
// 216 koşu.** Varlık ekranı yalnız varlık ÜRETMİŞ koşuları görüyordu (10); koşu ekranı
// hepsini (226). Tersini yapsaydım 216 koşu sessizce düşerdi ve düşmüş olduğu hiçbir
// yerde yazmazdı. Varlığı olmayan koşu yerinde duruyor ve *"henüz slayt üretmedi"* diyor.
//
// ⚠ İki YOĞUNLUK tek ekranda: kart görünümü slaytlarla (bir tasarıma karar vermek için
// ona BAKMAK gerekiyor), tablo görünümü yoğun ve maliyetli. Ayrı EKRAN yapmak iki ayrı
// süzgeç seti demekti; ayrı GÖRÜNÜM yapmak aynı listeyi iki türlü okumak.
//
// ⚠ ⚠ **`butce` DE ÜST GEZİNMEDEN ÇIKTI** — depo sahibi: *"bütçeyi de yukardan
// kaldır"*. Maliyet zaten durum şeridinde HER EKRANDA duruyor (`maliyet $…`, `kota`);
// ayrı bir sekme aynı sayıyı ikinci kez göstermek için bir tıklama istiyordu. Ayrıntı
// gerektiğinde palette (⌘K) ve `#/butce` adresinde.
//
// ⚠ ⚠ **`kuyruk` (Onaylar) DA ÜST GEZİNMEDEN ÇIKTI.** Depo sahibi: *"onaylar sekmesi
// aşırı işlevsiz; zaten onayı koşu detayında yönetiyoruz. Koşular ve varlıklar
// sekmelerine filtre ve özellikler ekleyerek onaylar sekmesini kaldırıp bu sekmeleri
// canlandırabiliriz"*.
//
// ⚠ ⚠ **YETENEĞİ ÖNCE TAŞIDIM, SONRA SEKMEYİ KALDIRDIM — tersi kayıp olurdu.** O ekranın
// tek yaptığı, kapıda bekleyen koşuları şablon ve konusuyla listelemekti. İkisi de artık
// **Koşular**ta: `kapı` ve `şablon` süzgeçleri, şablon/konu sütunları, ve konuyu da
// tarayan arama. Kaldırmadan önce taşımasaydım "sadeleştirme" diye bir yetenek silinirdi.
//
// ⚠ SİLİNMEDİ: klavyeyle çalışan toplu gözden geçirme akışı (`j`/`k`/`a`/`r`) hâlâ
// palette ve adresi çalışıyor — bir oturumda on koşu gözden geçirmek için hâlâ en hızlı yol.
//
// ⚠ ⚠ **`uyum` ve `doktor` ÜST GEZİNMEDEN ÇIKTI, SİLİNMEDİ.** Depo sahibi: *"uyum
// sayfası gereksiz"* ve *"doktor gereksiz, orada fazlalık yapıyor, daha gizli bi yere
// alınabilir"*. İkisi de günlük akışın parçası değil: `uyum` bir denetim raporu,
// `doktor` bir ay ihmalden sonra açılacak ekran (§16). Her gün bakılmayan bir şeyi her
// gün göstermek, her gün bakılanı zorlaştırıyor.
// ⚠ SİLİNMEDİ (Yasa 10): ikisi de palette duruyor (⌘K) ve adresleri çalışıyor.
// `ui-navigasyon` kapısı zaten her ekranın palete bağlı olmasını zorluyor.

// Nabız aralığı SUNUCUDAN öğrenilir. Buraya bir sabit yazmak, sunucu nabzını
// değiştirdiği gün UI'ın sessizce yanlış ölçmesi demekti (iki gerçek).
// Öğrenene kadarki varsayılan yalnız bir başlangıç değeri.
const VARSAYILAN_NABIZ_MS = 5000

/** Kabuğun açabileceği ekranlar. Tek liste — yönlendirme ve tablo ikisi de buna bakar. */

export const App = (): React.JSX.Element => {
  const [durum, setDurum] = useState<MakineDurumu | null>(null)
  const [sonOlayMs, setSonOlayMs] = useState<number | null>(null)
  // ⚠ İlk durum ADRESTEN: tazelemede insan bulunduğu yerde kalıyor.
  const [ekran, setEkran] = useState<Ekran>(() => adresiCoz(window.location.hash).ekran)
  // Hangi hat çalıştırılacak. Palet komutu ekranı AÇMAKLA kalmaz, hattı da seçer —
  // yoksa "Instagram postu üret" komutu sabit bir hattın launcher'ını açardı ve
  // komutun adı ile açtığı şey ayrışırdı.
  const [pipeline, setPipeline] = useState(() => {
    const a = adresiCoz(window.location.hash)
    // ⚠ ⚠ **VARSAYILAN HAT `instagram-post` DEĞİL `instagram-karosel`.** Üret ekranı
    // her açılışta yanlış hattın planını gösteriyordu: kullanıcı on dört satırlık bir
    // tabloyu okuyup en altta türü değiştirmek zorundaydı — ve değiştirmeyi unutan
    // YANLIŞ HATLA üretirdi. Bu deponun bugünkü üretim yolu karosel (D-268); varsayılan
    // da o olmalı.
    return a.ekran === 'calistir' && a.arg !== null ? a.arg : 'instagram-karosel'
  })
  const [nabizMs, setNabizMs] = useState(VARSAYILAN_NABIZ_MS)
  // ⚠ Açık koşu AYRI bir durum: ekran adı tek başına hangi koşunun açıldığını
  // taşımıyor ve tarayıcı geri tuşu bu panelde yok — kaybolan bir seçim, kullanıcıyı
  // listeye geri döndürüp aramaya zorlar.
  const [acikKosu, setAcikKosu] = useState<string | null>(() => {
    const a = adresiCoz(window.location.hash)
    return a.ekran === 'kosu' ? a.arg : null
  })
  const kosuAc = useCallback((runId: string): void => {
    setAcikKosu(runId)
    setEkran('kosu')
  }, [])

  // ── adres ↔ ekran: iki yönlü ────────────────────────────────────────────
  //
  // ⚠ Yalnız FARKLIYSA yazılıyor: her render'da `hash` set etmek geçmişi çöpe çevirir
  // ve geri tuşunu kullanılamaz yapardı.
  useEffect(() => {
    const hedef = adresKur(ekran, acikKosu, pipeline)
    if (window.location.hash !== hedef) window.location.hash = hedef
  }, [ekran, acikKosu, pipeline])

  // ⚠ GERİ TUŞU: tarayıcı adresi değiştirdiğinde ekran onu İZLİYOR. Bu dinleyici
  // olmadan adres değişir, ekran değişmez ve panel adresle yalan söylerdi.
  useEffect(() => {
    const dinle = (): void => {
      const a = adresiCoz(window.location.hash)
      setEkran(a.ekran)
      if (a.ekran === 'kosu') setAcikKosu(a.arg)
      if (a.ekran === 'calistir' && a.arg !== null) setPipeline(a.arg)
    }
    window.addEventListener('hashchange', dinle)
    return () => window.removeEventListener('hashchange', dinle)
  }, [])

  useEffect(() => {
    let iptal = false
    void fetch('/api/saglik')
      .then((r) => r.json() as Promise<{ nabizAraligiMs?: number }>)
      .then((s) => {
        if (!iptal && typeof s.nabizAraligiMs === 'number') setNabizMs(s.nabizAraligiMs)
      })
      .catch(() => {
        // Sağlık ucu cevap vermiyorsa varsayılanla devam: şerit yine çalışır ve
        // zaten "bağlantı yok" diyecektir — sessizce durmaz.
      })
    return () => {
      iptal = true
    }
  }, [])

  useEffect(() => {
    // EventSource kendiliğinden yeniden bağlanır — SSE'yi WebSocket'e tercih etmenin
    // sebeplerinden biri buydu. Ama yeniden bağlanma SESSİZ olduğu için şerit yine de
    // son olay zamanına bakar: "bağlanmaya çalışıyorum" ile "bağlıyım" aynı şey değil.
    const es = new EventSource('/api/olay')
    const damgala = (): void => setSonOlayMs(Date.now())
    es.addEventListener('durum', (e) => {
      damgala()
      try {
        setDurum(JSON.parse((e as MessageEvent<string>).data) as MakineDurumu)
      } catch {
        // Bozuk mesaj DURUMU EZMEZ: son geçerli okuma, hiç okuma olmamasından iyidir.
      }
    })
    es.addEventListener('nabiz', damgala)
    return () => es.close()
  }, [])

  return (
    <div className="kabuk" data-surface="console">
      {/* ⚠ ⚠ **GÖRÜNÜR NAVİGASYON — palet TEK yol olmaktan çıktı.** On dokuz ekran
          vardı ve hepsi `⌘K` arkasındaydı; paneli ilk açan kişi boş bir sayfa görüp
          *"tek ekran var"* dedi. Keşfedilemeyen bir ekran, olmayan bir ekrandır.
          Palet duruyor ve hâlâ hızlı yol; artık tek yol değil. */}
      <nav className="ust-nav" aria-label="Ekranlar">
        <button
          type="button"
          className={ekran === 'giris' ? 'etkin' : ''}
          onClick={() => setEkran('giris')}
        >
          Komuta
        </button>
        {NAV.map(([id, ad]) => (
          <button
            key={id}
            type="button"
            className={ekran === id ? 'etkin' : ''}
            onClick={() => setEkran(id)}
          >
            {ad}
          </button>
        ))}
        <span className="ust-nav-ipucu">
          <kbd>⌘K</kbd> palet
        </span>
      </nav>
      <main className="govde">
        {ekran === 'corpus' ? (
          <CorpusTarayici />
        ) : ekran === 'baglam' ? (
          <BaglamOnizleme tarif={pipeline} />
        ) : ekran === 'calistir' ? (
          <RunLauncher pipeline={pipeline} baslayinca={kosuAc} />
        ) : ekran === 'kuyruk' ? (
          <OnayBolumleri
            ac={kosuAc}
            bekleyenSayisi={durum?.bekleyenKapi ?? 0}
            bekleyenIcerik={<OnayKuyrugu ac={kosuAc} />}
          />
        ) : ekran === 'yerlesim' ? (
          <YerlesimEkrani />
        ) : ekran === 'kesif' ? (
          <DiscoveryEkrani />
        ) : ekran === 'sema' ? (
          <SemaEkrani />
        ) : ekran === 'butce' ? (
          <ButceEkrani />
        ) : ekran === 'yayin-akisi' ? (
          <YayinSirasi />
        ) : ekran === 'gecmis' ? (
          <RunGecmisi ac={kosuAc} />
        ) : ekran === 'saglik' ? (
          <StratejiSagligi />
        ) : ekran === 'doktor' ? (
          <Doktor />
        ) : ekran === 'kanallar' ? (
          <KanalDurumu />
        ) : ekran === 'performans' ? (
          <PerformansPanosu />
        ) : ekran === 'uyum' ? (
          <UyumPanosu />
        ) : ekran === 'kosu' && acikKosu !== null ? (
          <KosuDetay runId={acikKosu} geri={() => setEkran('giris')} />
        ) : (
          <Giris ac={kosuAc} ekranaGit={(e) => setEkran(e)} />
        )}
      </main>

      <Palet
        komutlar={KOMUTLAR}
        uzerineSec={(k) => {
          if (URETIM_KOMUTLARI.has(k.id)) {
            setPipeline(k.id)
            setEkran('calistir')
            return
          }
          setEkran(EKRAN[k.id] ?? 'giris')
        }}
      />

      <DurumSeridi
        durum={durum}
        sonOlayMs={sonOlayMs}
        nabizAraligiMs={nabizMs}
        simdiMs={() => Date.now()}
      />
    </div>
  )
}
