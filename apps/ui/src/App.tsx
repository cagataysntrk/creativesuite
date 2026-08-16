// Kabuk — komuta merkezinin dış çerçevesi (§12.4 · FAZ-4.2b).
//
// Yüzey bağlamı `data-surface="console"`: kalıcı KOYU, tema anahtarı YOK. Kabuk bir
// izleme kabinidir (ISO 3664) ve çok markalı bir sistemde aracın kendi rengi işin
// rengiyle kavga ederse hiçbir marka dürüst görünmez (§12.1).

import { useEffect, useState } from 'react'
import { DurumSeridi, type MakineDurumu } from './DurumSeridi.js'
import { Palet } from './Palet.js'
import { CorpusTarayici } from './CorpusTarayici.js'
import { BaglamOnizleme } from './BaglamOnizleme.js'
import { RunLauncher } from './RunLauncher.js'
import { OnayKuyrugu } from './OnayKuyrugu.js'
import { YerlesimEkrani } from './YerlesimEkrani.js'
import { DiscoveryEkrani } from './DiscoveryEkrani.js'
import { SemaEkrani } from './SemaEkrani.js'
import { ButceEkrani } from './ButceEkrani.js'
import { VarlikKutuphanesi } from './VarlikKutuphanesi.js'
import { RunGecmisi } from './RunGecmisi.js'
import { StratejiSagligi } from './StratejiSagligi.js'
import { Doktor } from './Doktor.js'
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

export const App = (): React.JSX.Element => {
  const [durum, setDurum] = useState<MakineDurumu | null>(null)
  const [sonOlayMs, setSonOlayMs] = useState<number | null>(null)
  const [ekran, setEkran] = useState<
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
  >('giris')
  // Hangi hat çalıştırılacak. Palet komutu ekranı AÇMAKLA kalmaz, hattı da seçer —
  // yoksa "Instagram postu üret" komutu sabit bir hattın launcher'ını açardı ve
  // komutun adı ile açtığı şey ayrışırdı.
  const [pipeline, setPipeline] = useState('instagram-post')
  const [nabizMs, setNabizMs] = useState(VARSAYILAN_NABIZ_MS)

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
      <main className="govde">
        {ekran === 'corpus' ? (
          <CorpusTarayici />
        ) : ekran === 'baglam' ? (
          <BaglamOnizleme tarif={pipeline} />
        ) : ekran === 'calistir' ? (
          <RunLauncher pipeline={pipeline} />
        ) : ekran === 'kuyruk' ? (
          <OnayKuyrugu />
        ) : ekran === 'yerlesim' ? (
          <YerlesimEkrani />
        ) : ekran === 'kesif' ? (
          <DiscoveryEkrani />
        ) : ekran === 'sema' ? (
          <SemaEkrani />
        ) : ekran === 'butce' ? (
          <ButceEkrani />
        ) : ekran === 'varliklar' ? (
          <VarlikKutuphanesi />
        ) : ekran === 'gecmis' ? (
          <RunGecmisi />
        ) : ekran === 'saglik' ? (
          <StratejiSagligi />
        ) : ekran === 'doktor' ? (
          <Doktor />
        ) : (
          <>
            <h1>Upcytech Creative Suite</h1>
            <p>
              Komut paletini açmak için <kbd>⌘K</kbd> — menü yok, palet birincil navigasyondur.
            </p>
          </>
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
          setEkran(
            k.id === 'corpus'
              ? 'corpus'
              : k.id === 'baglam'
                ? 'baglam'
                : k.id === 'calistir'
                  ? 'calistir'
                  : k.id === 'onay-kuyrugu'
                    ? 'kuyruk'
                    : k.id === 'yerlesim'
                      ? 'yerlesim'
                      : k.id === 'kesif'
                        ? 'kesif'
                        : k.id === 'sema'
                          ? 'sema'
                          : k.id === 'butce'
                            ? 'butce'
                            : k.id === 'varliklar'
                              ? 'varliklar'
                              : k.id === 'gecmis'
                                ? 'gecmis'
                                : k.id === 'saglik'
                                  ? 'saglik'
                                  : k.id === 'doktor'
                                    ? 'doktor'
                                    : 'giris'
          )
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
