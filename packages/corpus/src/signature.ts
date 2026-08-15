// `x_signature` — üretilmiş kaydın kendi içeriğinin özeti (§4.5 · R-14).
//
// **İmza "değişti" demek değil, "KIRIK" demek içindir.** İlk sürüm gelen kaydın imzası
// ile dosyadakini karşılaştırıyordu; bu "imza değişti" sorusudur ve yanlış soru:
//   - insan gövdeyi elle düzeltip imzaya dokunmadıysa imzalar EŞİT çıkıyordu → motor
//     insanın metnini SESSİZCE eziyordu (korunması gereken tam bu durumdu),
//   - motor yeni içerik ürettiğinde imzalar FARKLI çıkıyordu → meşru güncelleme
//     reddediliyordu.
// Doğrulama agent'ı 2026-08-15'te matrisi koşturup ikisini de gösterdi.
//
// Doğru soru: **dosyanın içeriği kendi imzasıyla uyuşuyor mu.** Uyuşmuyorsa dosyaya
// bir insan dokunmuştur ve üretim DURUR.

import { createHash } from 'node:crypto'

/**
 * İmzaya GİRMEYEN alanlar.
 *
 * `x_signature`in kendisi doğal olarak hariç. `approved_by`/`approved_at` de hariç:
 * insan onayı içeriği değiştirmez, yalnız damgalar — onay imzayı kırsaydı, onaylanan
 * her kayıt bir sonraki keşif turunda "elle düzenlenmiş" sanılırdı ve regenerasyon
 * ilk onaydan sonra tamamen dururdu.
 */
const IMZA_DISI = new Set(['x_signature', 'approved_by', 'approved_at', 'valid_at'])
// `valid_at` neden hariç: `just onayla` onay anını hem `approved_at`e hem `valid_at`e
// yazıyor — kayıt o an geçerli olmaya başlıyor. İkisi de onayın YAN ÜRÜNÜ, içeriğin
// parçası değil. ⚠ Bilinen sınır (2. doğrulama turu): `valid_at`i ELLE değiştirmek
// imzayı kırmıyor ve o alan bi-temporal yüklemi etkiliyor (§5.2). Bugün zararsız
// çünkü alanı yalnız `onayla` yazıyor; UI'dan elle düzenleme geldiğinde (FAZ-4.3)
// ya imzaya girecek ya da ayrı bir denetim gerekecek.

/**
 * Kanonik dize: anahtarlar SIRALI, değerler JSON. `JSON.stringify(fm)` kullanılamaz —
 * anahtar sırası nesne oluşturma sırasına bağlıdır ve aynı içerik iki farklı imza
 * üretirdi (D-nn: idempotent atlamada aynı tuzağa düşülmüştü).
 */
const kanonik = (frontmatter: Readonly<Record<string, unknown>>, body: string): string => {
  const anahtarlar = Object.keys(frontmatter)
    .filter((k) => !IMZA_DISI.has(k))
    .sort()
  const alanlar = anahtarlar.map((k) => `${k}=${JSON.stringify(frontmatter[k])}`).join('\n')
  // Gövde sondaki boşluklardan arındırılıyor: editörün eklediği bir satır sonu
  // "insan düzenledi" alarmı vermemeli — yanlış alarm veren kapı kapatılan kapıdır.
  return `${alanlar}\n---\n${body.replace(/\s+$/, '')}`
}

export const computeSignature = (
  frontmatter: Readonly<Record<string, unknown>>,
  body: string
): string =>
  `sha256:${createHash('sha256').update(kanonik(frontmatter, body), 'utf8').digest('hex')}`

/**
 * Dosya kendi imzasıyla uyuşuyor mu.
 *
 * `null` = imza alanı yok (eski kayıt ya da elle yazılmış) → "kırık" sayılmaz;
 * kırık olduğunu iddia etmek için önce bir imza bulunması gerekir.
 */
export const signatureIntact = (
  frontmatter: Readonly<Record<string, unknown>>,
  body: string
): boolean | null => {
  const kayitli = frontmatter['x_signature']
  if (typeof kayitli !== 'string' || kayitli === '') return null
  return kayitli === computeSignature(frontmatter, body)
}
