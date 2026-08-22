// Tarih biçimi — **tek yerde** (§12.4).
//
// ⚠ ⚠ **KOŞU LİSTESİNDE TARİH HİÇ YOKTU.** Tablo kimlik, hat, commit ve para
// gösteriyordu; "bu ne zaman koştu" sorusunun cevabı ekranda YOKTU ve insan koşu
// kimliğinin içindeki uuidv7 zaman damgasını okumaya zorlanıyordu. Depo sahibi
// bunu tek cümleyle söyledi: *"koşularda tam tarih yok"*.
//
// ⚠ Biçim `tr-TR` ve TAM: gün, ay, yıl, saat, dakika. "3 saat önce" gibi göreli bir
// biçim insanın kafasındaki soruyu ("dün mü bugün mü") cevaplar ama iki koşuyu
// karşılaştırmayı imkânsız kılar; liste ekranında karşılaştırma asıl iştir.
//
// ⚠ `toLocaleString` KULLANILIYOR ama `toUpperCase` YOK (R-21): ay adı zaten yerelden
// geliyor, biz hiçbir harf dönüşümü yapmıyoruz.

const BICIM = new Intl.DateTimeFormat('tr-TR', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

/**
 * ISO 8601 → "22 Ağu 2026 14:03". Geçersiz/boş girdi `—` döner.
 *
 * ⚠ Boş girdide bugünün tarihini basmak, olmayan bir gerçeği uydurmak olurdu.
 */
export const tamTarih = (iso: string | null | undefined): string => {
  if (typeof iso !== 'string' || iso.trim() === '') return '—'
  const t = Date.parse(iso)
  if (Number.isNaN(t)) return '—'
  return BICIM.format(new Date(t))
}

/** Sıralama yönü — tüm listelerde AYNI iki seçenek. */
export type Siralama = 'yeni' | 'eski'

/**
 * ISO tarihine göre sıralar. Dize karşılaştırması yeterli: ISO 8601 sözlük sırası
 * zaman sırasıdır ve `Date.parse` başına iş açmaz.
 */
export const tariheGore = <T>(
  liste: readonly T[],
  tarih: (x: T) => string,
  yon: Siralama
): readonly T[] =>
  [...liste].sort((a, b) =>
    yon === 'yeni' ? tarih(b).localeCompare(tarih(a)) : tarih(a).localeCompare(tarih(b))
  )

/**
 * Tarih aralığı süzgeci — `bas`/`son` boşsa o uç sınırsız.
 *
 * ⚠ `son` GÜN SONUNA kadar: kullanıcı "22 Ağustos"a kadar dediğinde 22 Ağustos'u
 * dışarıda bırakan bir süzgeç, sorduğu şeyi vermez.
 */
export const aralikta = (iso: string, bas: string, son: string): boolean => {
  if (bas !== '' && iso.slice(0, 10) < bas) return false
  if (son !== '' && iso.slice(0, 10) > son) return false
  return true
}
