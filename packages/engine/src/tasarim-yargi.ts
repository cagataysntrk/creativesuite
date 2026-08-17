// HEDEF: packages/engine/src/tasarim-yargi.ts
//
// Estetik yargı — `design.critique` yeteneğinin iki ucu (FAZ-13.5 · §8.1 · D-256, D-261).
//
// ⚠ ⚠ **PLANIN ÖNCÜLÜ ESKİMİŞTİ ve düzeltildi.** Adım *"`image.critique` ÜRETİLEN GÖRSELİ
// yargılıyor, eksik olan bitmiş slaydı yargılayan yetenek"* diyordu. `gorsel-yargi.ts`
// okundu: prompt zaten *"N slaytlık karoselin M. slaydı, tuval 1080×1350"* diyor ve
// RENDER EDİLMİŞ slaydı yargılıyor. Eksik olan yüzey değil, **EKSEN**.
//
// Var olan altı kategori (kırpma · çakışma · hizalama · kontrast · boşluk · tipografi)
// hepsi **kusurun yokluğunu** arıyor. Bu dosyanın altısı **iyinin varlığını**:
// denge · hiyerarşi · boşluk ritmi · tutarlılık · okunabilirlik · çarpıcılık.
//
// ⚠ **İki eksen AYRI DOSYADA ve karışmıyor.** `kalite` kapısı kabul edilemezi ELER;
// bu yetenek iyiyi ARAR. Karışsalardı ya kapı öznelleşirdi ya estetik zorunlu olurdu —
// FAZ-13'ün başlığındaki ayrım tam olarak bu.
//
// ⚠ **Bulgu doğrulayıcı YENİDEN YAZILMADI** (R-05): `gorsel-yargi.ts`teki `bulguyuDogrula`
// kategori dağarcığını parametre alıyor. İkinci bir doğrulayıcı biri sıkılaşıp öbürü
// gevşediğinde hangisinin gerçek olduğunu belirsizleştirirdi.
//
// ⚠ **Yargı ÖNERİR, uygulamaz** (§5.4). Çıktısı bir rapordur; düzeltmeyi insan onaylar.

import { bulguyuDogrula, cikan, type YargiBulgusu } from './gorsel-yargi.js'

/**
 * Estetik kategoriler — KAPALI.
 *
 * ⚠ ⚠ **`sikicilik` DEĞİL `carpicilik` — ve bu bir üslup tercihi değil, ölçüm hatasından
 * kaçınma.** Plan `sikicilik` diyordu; öteki beşinde yüksek puan İYİ, `sikicilik`te yüksek
 * puan KÖTÜ olurdu. Yönü kendi kardeşlerine ters olan tek bir alan, ortalamayı sessizce
 * bozar ve kimse fark etmez — bu oturumda ölçüm aracının üç kez ölçtüğü şeyden daha bozuk
 * çıkmasının aynı ailesi. Altı alanın altısında da **yüksek = iyi**.
 */
export const TASARIM_KATEGORILERI = [
  'denge',
  'hiyerarsi',
  'bosluk',
  'tutarlilik',
  'okunabilirlik',
  'carpicilik',
] as const
export type TasarimKategorisi = (typeof TASARIM_KATEGORILERI)[number]

/** Puan aralığı — 0 en kötü, 5 en iyi. Ara değer yok: ondalık bir puan sahte hassasiyettir. */
export const PUAN_TAVANI = 5

export interface TasarimPuani {
  readonly kategori: TasarimKategorisi
  /** 0–5 tam sayı. Yüksek = iyi, ALTI kategoride de. */
  readonly puan: number
  /** Türkçe tek cümle: puanın SEBEBİ. Gerekçesiz puan bir sayı değil, bir histir. */
  readonly gerekce: string
}

export interface TasarimYargisi {
  readonly puanlar: readonly TasarimPuani[]
  readonly bulgular: readonly YargiBulgusu[]
  /** Geçersiz olduğu için ATILAN girdiler. Sessizce yutulan eleştiri, olmayan eleştiridir. */
  readonly reddedilen: readonly string[]
}

export interface TasarimYargiGirdisi {
  readonly yol: string
  readonly slayt: number
  readonly toplam: number
  readonly genislik: number
  readonly yukseklik: number
  /**
   * Kendi gramerimiz prompt'a yazılsın mı (varsayılan: evet).
   *
   * ⚠ ⚠ **KÖR KABULDE (FAZ-13.6) KAPALI OLMAK ZORUNDA.** Prompt bizim gramerimizi
   * anlatıyor (*"kırpılmış dev rakam bir tasarım ögesidir"*); referans bir karoseli o
   * bağlamla yargılatmak, yargıcı bizim şablonumuza göre ayarlamak olurdu ve sınav kendi
   * kendini onaylardı. Kör kabulde İKİ taraf da gramersiz yargılanıyor — aynı sorunun
   * aynı biçimde sorulması, körlüğün kendisi.
   */
  readonly gramer?: boolean
}

/**
 * Estetik yargı prompt'u.
 *
 * ⚠ **Gramer prompt'a YAZILIYOR** — `gorsel-yargi.ts` ile aynı gerekçe: bu karoselin kendi
 * grameri var (D-254) ve genel tasarım bilgisine göre "yanlış" görünen şey burada kasıtlı
 * olabilir. Kuralı söylemeyip sonra "yanlış bulgu" demek, ölçüleni değil ölçeni suçlamaktır.
 *
 * ⚠ **KUSUR ARAMASI İSTENMİYOR ve bu sınır açıkça yazılı.** Kusuru `image.critique` ve
 * `kalite` zaten arıyor; burada aynı şeyi ikinci kez sormak iki rapor arasında çelişki
 * üretir ve hangisinin doğru olduğu sorusu ölçüm katmanını çürütür.
 */
export const tasarimYargiPromptu = (g: TasarimYargiGirdisi): string =>
  [
    `Bu slaydı ESTETİK olarak değerlendir: ${g.yol}`,
    '',
    `Bağlam: ${g.toplam} slaytlık bir Instagram karoselinin ${g.slayt}. slaydı.`,
    `Tuval ${g.genislik}×${g.yukseklik} piksel.`,
    '',
    ...(g.gramer === false
      ? []
      : [
          'TASARIM GRAMERİ — bunlar KASITLIDIR:',
          '- İki renk alanı ve aralarında akan bir eğri; eğri slayttan slayta taraf değiştirir.',
          '- Dev, yalnız konturlu bir rakam kenardan KIRPILMIŞ durur; bir tasarım ögesidir.',
          '- Sağ üstte `#00N` sayacı, sol altta profil kulpu, sağ altta kaydırma işareti.',
          '- Geniş boşluk kasıtlıdır. Az metin kasıtlıdır.',
          '',
        ]),
    '⚠ KUSUR ARAMA. Kırpma, çakışma, kontrast ihlali gibi kusurları BAŞKA bir denetim',
    'zaten arıyor. Senin işin kusurun yokluğu değil, TASARIMIN İYİLİĞİ.',
    '',
    'HER KATEGORİYE 0–5 PUAN VER (5 = en iyi, ALTI kategoride de yüksek = iyi):',
    '- denge: görsel ağırlık dağılımı; kompozisyon oturmuş mu, bir yana devrilmiş mi',
    '- hiyerarsi: göz nereye önce gidiyor; bir şey öne çıkıyor mu yoksa her şey eşit mi',
    '- bosluk: boşluk bir ritim mi yoksa artık alan mı',
    '- tutarlilik: ögeler aynı sistemden mi geliyor',
    '- okunabilirlik: metin rahat okunuyor mu (kontrast İHLALİ değil, okuma KONFORU)',
    '- carpicilik: akışta durdurur mu, yoksa geçilip gider mi',
    '',
    'ÇIKTI BİÇİMİ — yalnız JSON nesnesi, başka hiçbir şey yazma:',
    '{"puanlar":[{"kategori":"...","puan":0,"gerekce":"..."}],',
    ' "bulgular":[{"bolge":[x,y,g,y],"kategori":"...","siddet":"...","aciklama":"..."}]}',
    '',
    `kategori şunlardan biri: ${TASARIM_KATEGORILERI.join(' | ')}`,
    'siddet: kritik | uyari',
    'gerekce ve aciklama: tek Türkçe cümle; çözüm önerme, gözlemi yaz.',
    '',
    '⚠ `bulgular` İSTEĞE BAĞLI ve yalnız bir kategori 2 veya altındaysa yazılır; o zaman',
    'sınırlayıcı kutu ZORUNLUDUR. Konumlandıramadığın bir gözlemi bulgu olarak yazma.',
    '⚠ Altı kategorinin ALTISI da puanlanmalı. Eksik kategori reddedilir.',
  ].join('\n')

/** Sağlayıcı çıktısını estetik yargıya çevirir. */
export const tasarimYargisinaCevir = (
  output: unknown,
  slayt: number,
  boyut: { readonly genislik: number; readonly yukseklik: number }
): TasarimYargisi => {
  const bos = { puanlar: [], bulgular: [] }
  const ham = cikan(output)
  if (ham === null) return { ...bos, reddedilen: ['çıktıda metin alanı yok'] }

  const bas = ham.indexOf('{')
  const son = ham.lastIndexOf('}')
  if (bas === -1 || son <= bas) return { ...bos, reddedilen: ['çıktıda JSON nesnesi yok'] }

  let ayrisan: unknown
  try {
    ayrisan = JSON.parse(ham.slice(bas, son + 1))
  } catch {
    return { ...bos, reddedilen: ['JSON ayrıştırılamadı'] }
  }
  if (ayrisan === null || typeof ayrisan !== 'object' || Array.isArray(ayrisan))
    return { ...bos, reddedilen: ['JSON bir nesne değil'] }

  const kok = ayrisan as Record<string, unknown>
  const reddedilen: string[] = []
  const puanlar: TasarimPuani[] = []
  const gorulen = new Set<string>()

  for (const [i, x] of (Array.isArray(kok['puanlar']) ? kok['puanlar'] : []).entries()) {
    if (x === null || typeof x !== 'object') {
      reddedilen.push(`puan #${i}: nesne değil`)
      continue
    }
    const o = x as Record<string, unknown>
    const kategori = o['kategori']
    if (
      typeof kategori !== 'string' ||
      !TASARIM_KATEGORILERI.includes(kategori as TasarimKategorisi)
    ) {
      reddedilen.push(`puan #${i}: kategori kapalı listede yok: ${String(kategori)}`)
      continue
    }
    const puan = o['puan']
    // ⚠ Tam sayı ZORUNLU: `3.7` gibi bir puan, olmayan bir hassasiyeti iddia eder.
    if (typeof puan !== 'number' || !Number.isInteger(puan) || puan < 0 || puan > PUAN_TAVANI) {
      reddedilen.push(`puan #${i}: puan 0–${PUAN_TAVANI} tam sayı değil: ${String(puan)}`)
      continue
    }
    const gerekce = o['gerekce']
    if (typeof gerekce !== 'string' || gerekce.trim() === '') {
      reddedilen.push(`puan #${i}: gerekçe boş — gerekçesiz puan bir his`)
      continue
    }
    if (gorulen.has(kategori)) {
      reddedilen.push(`puan #${i}: kategori tekrar etti: ${kategori}`)
      continue
    }
    gorulen.add(kategori)
    puanlar.push({ kategori: kategori as TasarimKategorisi, puan, gerekce: gerekce.trim() })
  }

  // ⚠ **Eksik kategori SESSİZCE 0 sayılmıyor ve sessizce atlanmıyor da.** Sıfır saymak
  // ölçülmemiş olanı kötü ilan ederdi; atlamak ortalamayı ölçülen alanlar üstünden alıp
  // eksikliği gizlerdi. İkisi de yalan; eksiklik REDDEDİLENLERE yazılıyor.
  for (const k of TASARIM_KATEGORILERI)
    if (!gorulen.has(k)) reddedilen.push(`kategori puanlanmadı: ${k}`)

  const bulgular: YargiBulgusu[] = []
  for (const [i, x] of (Array.isArray(kok['bulgular']) ? kok['bulgular'] : []).entries()) {
    const r = bulguyuDogrula(x, i, slayt, boyut, TASARIM_KATEGORILERI)
    if ('ret' in r) reddedilen.push(r.ret)
    else bulgular.push(r.bulgu)
  }

  return { puanlar, bulgular, reddedilen }
}

/**
 * Yargının toplam puanı — 0–5, eksik kategori varsa `null`.
 *
 * ⚠ `null` bir kolaylık değil bir sınır: beş kategoriden hesaplanan bir ortalama, altı
 * kategoriden hesaplananla KARŞILAŞTIRILAMAZ (FAZ-13.6 kör kabul tam bunu yapacak).
 * Eksik ölçümü ortalamayla kapatmak, kör kabulü baştan geçersiz kılardı.
 */
export const toplamPuan = (y: TasarimYargisi): number | null => {
  if (y.puanlar.length !== TASARIM_KATEGORILERI.length) return null
  const t = y.puanlar.reduce((a, p) => a + p.puan, 0)
  return Math.round((t / TASARIM_KATEGORILERI.length) * 100) / 100
}

/**
 * İki puan kümesi AYNI ARALIKTA mı — kör kabulün kararı (FAZ-13.6).
 *
 * ⚠ ⚠ **"Bizimki KAZANDI" bir başarı DEĞİLDİR.** Referanslardan yüksek puan almak,
 * yargıcın bizim şablonumuza aşırı uyduğunun işareti olabilir; o durumda sınanacak şey
 * çıktı değil YARGIÇTIR. Beklenen şey aynı aralık, o yüzden fonksiyon üstünlük değil
 * ÖRTÜŞME döndürüyor.
 * ⚠ Aralık min–max: ortalama karşılaştırmak, iki kötü ve iki iyi referansın ortalamasını
 * bizim tek tip çıktımızla eşitleyip örtüşme yanılsaması verirdi.
 */
export const ayniAralikta = (
  bizim: readonly number[],
  referans: readonly number[]
): {
  readonly ayni: boolean
  readonly bizimAralik: readonly [number, number]
  readonly referansAralik: readonly [number, number]
} | null => {
  if (bizim.length === 0 || referans.length === 0) return null
  const a: [number, number] = [Math.min(...bizim), Math.max(...bizim)]
  const b: [number, number] = [Math.min(...referans), Math.max(...referans)]
  // Örtüşme: iki aralık kesişiyorsa aynı sınıftayız.
  return { ayni: a[0] <= b[1] && b[0] <= a[1], bizimAralik: a, referansAralik: b }
}

// ⚠ `puanSatiri` SİLİNDİ: dışa açıktı, üretimde çağıranı yoktu. Bu turda aynı ölçüt
// üç kez uygulandı (`degradeYuzeyi`, üç tipo üreteci, bu) — bir kuralı bir dosyada
// uygulayıp komşusunda uygulamamak, kuralı olmamasından kötüdür.
