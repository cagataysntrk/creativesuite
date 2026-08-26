// PALET KOMUTLARI — veri, bileşen değil.
//
// ⚠ ⚠ **BU LİSTE `App.tsx` İÇİNDEYDİ ve testi oraya bağlanınca tip denetimi çöktü:**
// bir veri listesini okumak için DOM'a bağlı bir bileşen dosyasını içe aktarmak
// gerekiyordu (`window` bulunamadı). Liste artık kendi modülünde; hem `App` hem kapı
// aynı kaynaktan okuyor.
import type { Komut } from './palet.js'

// Komutlar SUNUCUDAN gelecek (registry'den, FAZ-4.6). Şimdilik iskelet: elle
// bakımlanan bir liste ilk yeni pipeline'da bayatlar ve bu dosya o bayatlığın
// yaşayacağı tek yer — o yüzden burada duruyor, bileşenin içine gömülmüyor.
export const KOMUTLAR: readonly Komut[] = [
  { id: 'instagram-post', etiket: 'Instagram postu üret', grup: 'Üretim' },
  // ⚠ ⚠ **EMEKLİ HATTIN KOMUTU KALDIRILDI — panel olmayan bir şeyi vaat ediyordu.**
  // Sunucu `instagram-carousel`ı `emekli` diye bildiriyor ve tür menüsünde HİÇ
  // göstermiyor; palet ise onu üretilebilir bir seçenek gibi sunuyordu. Komut
  // tıklanınca launcher menüde olmayan bir hatla açılıyordu.
  // ⚠ Emekli hattın DOSYASI duruyor (Yasa 10) ve o dosyanın kendi notu bu borcu
  // adıyla söylüyordu: *"silinmedi çünkü apps/ui bu id'ye bağlı"*. Bağ artık koptu.
  { id: 'instagram-karosel', etiket: 'Instagram karoseli üret', grup: 'Üretim' },
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

/** Bir hattı çalıştıran komutlar — ekran açmaz, launcher'ı O hatla açar. */
export const URETIM_KOMUTLARI: ReadonlySet<string> = new Set([
  'instagram-post',
  'instagram-karosel',
  'linkedin-post',
])
