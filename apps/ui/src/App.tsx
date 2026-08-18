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
import { OnayKuyrugu } from './OnayKuyrugu.js'
import { OnayBolumleri } from './OnayBolumleri.js'
import { Giris } from './Giris.js'
import { KosuDetay } from './KosuDetay.js'
import { YerlesimEkrani } from './YerlesimEkrani.js'
import { DiscoveryEkrani } from './DiscoveryEkrani.js'
import { SemaEkrani } from './SemaEkrani.js'
import { ButceEkrani } from './ButceEkrani.js'
import { VarlikKutuphanesi } from './VarlikKutuphanesi.js'
import { RunGecmisi } from './RunGecmisi.js'
import { StratejiSagligi } from './StratejiSagligi.js'
import { Doktor } from './Doktor.js'
import { KanalDurumu } from './KanalDurumu.js'
import { PerformansPanosu } from './PerformansPanosu.js'
import { UyumPanosu } from './UyumPanosu.js'
import type { Komut } from './palet.js'

// Komutlar SUNUCUDAN gelecek (registry'den, FAZ-4.6). Şimdilik iskelet: elle
// bakımlanan bir liste ilk yeni pipeline'da bayatlar ve bu dosya o bayatlığın
// yaşayacağı tek yer — o yüzden burada duruyor, bileşenin içine gömülmüyor.
const KOMUTLAR: readonly Komut[] = [
  { id: 'instagram-post', etiket: 'Instagram postu üret', grup: 'Üretim' },
  { id: 'instagram-carousel', etiket: 'Instagram carousel üret', grup: 'Üretim' },
  { id: 'linkedin-post', etiket: 'LinkedIn postu üret', grup: 'Üretim' },
  { id: 'onay-kuyrugu', etiket: 'Onay kuyruğu', grup: 'Gözden geçir', anahtarlar: ['approve'] },
  { id: 'corpus', etiket: 'Corpus tarayıcı', grup: 'Bilgi', anahtarlar: ['kayit', 'records'] },
  { id: 'baglam', etiket: 'Bağlam önizleme', grup: 'Bilgi', anahtarlar: ['context', 'prompt'] },
  { id: 'calistir', etiket: 'Çalıştır', grup: 'Üretim', anahtarlar: ['run', 'launch', 'plan'] },
  {
    id: 'yerlesim',
    etiket: 'Yerleşim önizleme',
    grup: 'Üretim',
    anahtarlar: ['placement', 'safe'],
  },
  { id: 'kesif', etiket: 'Keşif / mutabakat', grup: 'Bilgi', anahtarlar: ['discovery', 'era'] },
  { id: 'sema', etiket: 'Şema editörü', grup: 'Bilgi', anahtarlar: ['schema', 'tip', 'alan'] },
  { id: 'butce', etiket: 'Maliyet ve bütçe', grup: 'Gözden geçir', anahtarlar: ['cost', 'tavan'] },
  { id: 'varliklar', etiket: 'Varlık kütüphanesi', grup: 'Gözden geçir', anahtarlar: ['asset'] },
  { id: 'doktor', etiket: 'Doctor', grup: 'Gözden geçir', anahtarlar: ['doctor', 'saglik'] },
  {
    id: 'kanallar',
    etiket: 'Yayın kuyruğu ve kanal durumu',
    grup: 'Yayın',
    anahtarlar: ['publish', 'queue', 'token', 'kota', 'oran'],
  },
  {
    id: 'performans',
    etiket: 'Performans panosu',
    grup: 'Gözden geçir',
    anahtarlar: ['performance', 'insight', 'hook', 'olcum'],
  },
  {
    id: 'uyum',
    etiket: 'Uyum panosu',
    grup: 'Gözden geçir',
    anahtarlar: ['compliance', 'ifsa', 'ai', 'yasal'],
  },
  {
    id: 'saglik',
    etiket: 'Strateji sağlığı',
    grup: 'Gözden geçir',
    anahtarlar: ['health', 'lint', 'curume', 'iddia'],
  },
  {
    id: 'gecmis',
    etiket: 'Çalıştırma geçmişi',
    grup: 'Gözden geçir',
    anahtarlar: ['run', 'history', 'koken', 'rerun', 'replay'],
  },
]

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
  varliklar: 'varliklar',
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
  ['kuyruk', 'Onaylar'],
  ['calistir', 'Üret'],
  ['gecmis', 'Koşular'],
  ['varliklar', 'Varlıklar'],
  ['butce', 'Bütçe'],
  ['uyum', 'Uyum'],
  ['doktor', 'Doktor'],
]

/** Bir hattı çalıştıran komutlar — ekran açmaz, launcher'ı O hatla açar. */
const URETIM_KOMUTLARI: ReadonlySet<string> = new Set([
  'instagram-post',
  'instagram-carousel',
  'linkedin-post',
])

// Nabız aralığı SUNUCUDAN öğrenilir. Buraya bir sabit yazmak, sunucu nabzını
// değiştirdiği gün UI'ın sessizce yanlış ölçmesi demekti (iki gerçek).
// Öğrenene kadarki varsayılan yalnız bir başlangıç değeri.
const VARSAYILAN_NABIZ_MS = 5000

/** Kabuğun açabileceği ekranlar. Tek liste — yönlendirme ve tablo ikisi de buna bakar. */
type Ekran =
  | 'giris'
  | 'corpus'
  | 'baglam'
  | 'calistir'
  | 'kuyruk'
  | 'yerlesim'
  | 'kesif'
  | 'sema'
  | 'butce'
  | 'varliklar'
  | 'gecmis'
  | 'saglik'
  | 'doktor'
  | 'kanallar'
  | 'performans'
  | 'uyum'
  // Tek bir koşunun içeriği — kuyruktan tıklanınca açılır.
  | 'kosu'

export const App = (): React.JSX.Element => {
  const [durum, setDurum] = useState<MakineDurumu | null>(null)
  const [sonOlayMs, setSonOlayMs] = useState<number | null>(null)
  const [ekran, setEkran] = useState<Ekran>('giris')
  // Hangi hat çalıştırılacak. Palet komutu ekranı AÇMAKLA kalmaz, hattı da seçer —
  // yoksa "Instagram postu üret" komutu sabit bir hattın launcher'ını açardı ve
  // komutun adı ile açtığı şey ayrışırdı.
  const [pipeline, setPipeline] = useState('instagram-post')
  const [nabizMs, setNabizMs] = useState(VARSAYILAN_NABIZ_MS)
  // ⚠ Açık koşu AYRI bir durum: ekran adı tek başına hangi koşunun açıldığını
  // taşımıyor ve tarayıcı geri tuşu bu panelde yok — kaybolan bir seçim, kullanıcıyı
  // listeye geri döndürüp aramaya zorlar.
  const [acikKosu, setAcikKosu] = useState<string | null>(null)
  const kosuAc = useCallback((runId: string): void => {
    setAcikKosu(runId)
    setEkran('kosu')
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
        ) : ekran === 'varliklar' ? (
          <VarlikKutuphanesi ac={kosuAc} />
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
