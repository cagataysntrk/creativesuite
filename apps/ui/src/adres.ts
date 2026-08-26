// Adres çözümlemesi — panelin TEK yönlendiricisi (§12.4).
//
// ⚠ ⚠ **SAYFALARIN ADRESİ HİÇ YOKTU** ve iki şey birden kırıktı: tazeleme insanı
// giriş ekranına atıyordu, geri tuşu da öyle. Bir panelde en sık yapılan iki şey
// bağlantı paylaşmak ve F5'e basmaktır.
//
// ⚠ Bu dosya `App.tsx`ten AYRI: test adresi bir React bileşeni kurmadan ölçebilmeli.

/** Panelin ekranları — tipin kendisi `App.tsx`te. */
export type Ekran =
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
  // Yayın akışı: hazır · planlanmış · geçmiş (madde 5).
  | 'yayin-akisi'
  | 'gecmis'
  | 'saglik'
  | 'doktor'
  | 'kanallar'
  | 'performans'
  | 'uyum'
  // Tek bir koşunun içeriği — kuyruktan tıklanınca açılır.
  | 'kosu'

/**
 * Ekran adları — **adres çözümlemesi için tek liste** (§12.4).
 *
 * ⚠ Elle yazılmış ikinci bir liste, yeni bir ekran eklendiği gün adresi sessizce
 * bozardı; tip ile liste burada yan yana duruyor ve `tsc` ikisini birden denetliyor.
 */
const EKRANLAR = [
  'giris',
  'corpus',
  'baglam',
  'calistir',
  'kuyruk',
  'yerlesim',
  'kesif',
  'sema',
  'butce',
  'varliklar',
  'yayin-akisi',
  'gecmis',
  'saglik',
  'doktor',
  'kanallar',
  'performans',
  'uyum',
  'kosu',
] as const satisfies readonly Ekran[]

/**
 * Adres → ekran. **Hash yolu**, `history` DEĞİL.
 *
 * ⚠ ⚠ **SAYFALARIN ADRESİ HİÇ YOKTU.** Depo sahibi: *"sayfalar url'siz olduğundan
 * tazelenince kayboluyor, geri gelince anasayfaya gidiyor"*. Bir panelde en sık
 * yapılan şey bir bağlantıyı paylaşmak ve F5'e basmaktır; ikisi de çalışmıyordu.
 *
 * ⚠ Hash seçildi çünkü `history` yolu sunucu tarafında yeniden yazma (rewrite) ister:
 * `/kosu/run_…` adresine doğrudan girildiğinde statik sunucu 404 verir. Hash hem
 * `vite dev`de hem statik dağıtımda aynı çalışıyor — ve bu panel tek kullanıcılı bir
 * yerel araç, adres estetiği ikinci sırada.
 */
/**
 * ⚠ Hash ÇAĞIRANDAN geliyor, `window`dan değil: bu modül saf kalıyor ve test onu bir
 * tarayıcı kurmadan ölçebiliyor. `window`a dokunan tek yer `App.tsx` — tarayıcıyı
 * bilen katman orası.
 */
export const adresiCoz = (hash: string): { readonly ekran: Ekran; readonly arg: string | null } => {
  const ham = hash.replace(/^#\/?/, '')
  const [ad = '', arg = ''] = ham.split('/')
  const ekran = (EKRANLAR as readonly string[]).includes(ad) ? (ad as Ekran) : 'giris'
  return { ekran, arg: arg === '' ? null : decodeURIComponent(arg) }
}

/** Ekran → adres. Koşu ve hat ARGÜMAN taşıyor; ötekiler tek parça. */
export const adresKur = (ekran: Ekran, kosu: string | null, hat: string): string =>
  ekran === 'kosu' && kosu !== null
    ? `#/kosu/${encodeURIComponent(kosu)}`
    : ekran === 'calistir'
      ? `#/calistir/${encodeURIComponent(hat)}`
      : `#/${ekran}`
