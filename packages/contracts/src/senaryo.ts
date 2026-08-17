// HEDEF: packages/contracts/src/senaryo.ts
//
// Hikâye yayı — bir karosel bir gönderi değil bir DİZİdİR (FAZ-14.1 · §7.2).
//
// **Neden halka 0'da:** aynı sayılar bugün İKİ yerde yazılı — `icerikPromptu` modele
// "kapak ≤8, gövde ≤30, kapanış ≤14 kelime" diyor, `tasarim-olcum.ts` ise `KELIME_TAVANI`
// sabitinde aynı üçlüyü tekrar tanımlıyor ve yorumunda *"`icerikPromptu` ile AYNI sayılar"*
// yazıyor. Bir yorum, bir zorlama değildir: biri değişirse diğeri sessizce ayrışır ve
// üretim, ölçümün istemediği bir metni üretmeye başlar. Burada tek tanım var; hem prompt
// hem ölçüm buradan okuyor.
//
// ⚠ Bu D-260'ın kardeşi: orada ölçen ile ölçülen farklı BİRİM konuşuyordu, burada aynı
// birimi iki ayrı yerde saklıyorduk.

/**
 * Yayın kapalı işlev dağarcığı.
 *
 * Altıncısı bir KARAR ister. Sıra anlamlıdır: kanca durdurur, gerilim sorunu büyütür,
 * kanıt somutlar, dönüş neyin değiştiğini söyler, davet ne yapılacağını.
 */
export const ISLEVLER = ['kanca', 'gerilim', 'kanit', 'donus', 'davet'] as const
export type Islev = (typeof ISLEVLER)[number]

/**
 * Ritim parametreleri — ÖLÇÜLEN tabanın oranları (D-262).
 *
 * ⚠ **Taban ölçüldü, oranlar editöryel.** `kanit` tavanı 30 kelime `docs/referans/
 * tip-olcegi.md`'de ölçülen gövde tavanıdır; `kanca` 8 ve `davet` 14 de mevcut ölçülen
 * değerler. `gerilim` ve `donus` ise YENİ ve ölçüm değil **tercih**: bir karoselin ritmi,
 * modelden "ilginç yaz" istemekle değil, her satıra FARKLI bir uzunluk vermekle kurulur.
 * Bugün dört gövde satırının dördü de aynı 30 kelimelik bütçeyi paylaşıyor ve sonuç dört
 * eşit paragraf — referans örneklerin hiçbirinde olmayan tek şey bu.
 *
 * Oran olduğu için: taban yeniden ölçülürse ritim kendiliğinden ölçekleniyor, ve bir
 * kompozisyon ailesi (FAZ-12.7) oranları değiştirip kendi ritmini kurabiliyor.
 */
export interface RitimOranlari {
  readonly gerilim: number
  readonly donus: number
}

/** Varsayılan ritim: gerilim keskin, kanıt geniş, dönüş sert. */
export const VARSAYILAN_RITIM: RitimOranlari = { gerilim: 0.7, donus: 0.6 }

/** Ölçülen tabanlar — yeni sayı DEĞİL, var olanların tek kaynağa taşınması. */
const KANCA = 8
const KANIT = 30
const DAVET = 14

/** İşlev başına kelime tavanı. Tek kaynak: prompt da ölçüm de bunu okur. */
export const islevTavanlari = (r: RitimOranlari = VARSAYILAN_RITIM): Record<Islev, number> => ({
  kanca: KANCA,
  gerilim: Math.round(KANIT * r.gerilim),
  kanit: KANIT,
  donus: Math.round(KANIT * r.donus),
  davet: DAVET,
})

/** Gövde bloklarının kullanabileceği EN GENİŞ tavan — rol bütçesi gerekmediğinde. */
export const GOVDE_TAVANI = KANIT

/**
 * Slayt sayısından yayı türetir — DETERMİNİSTİK.
 *
 * ⚠ **Orta ESNEK, uçlar SABİT.** Kanca ilk, davet son; aradaki uzunluk slayt sayısına göre
 * `kanit` tekrarıyla dolar. Böylece 4 slaytlık da 7 slaytlık da karosel aynı yayı taşır ve
 * "tek bir karosel her şeyi üretebilsin" isteği yapıya girer: değişen uzunluk, sabit hikâye.
 *
 * ⚠ Dört slayttan az bir yay yoktur: kanca + davet iki slayt eder ve arada hiçbir şey
 * olmayan bir karosel bir hikâye değil, bir afiştir.
 */
export const yay = (toplam: number): readonly Islev[] => {
  if (toplam < 4) return toplam <= 0 ? [] : (['kanca', 'davet'] as Islev[]).slice(0, toplam)
  const orta = toplam - 3 // kanca + donus + davet dışında kalan
  return [
    'kanca',
    'gerilim',
    ...Array.from({ length: orta - 1 }, (): Islev => 'kanit'),
    'donus',
    'davet',
  ]
}

/** Bir slaydın işlevi. `index` 0 tabanlı. */
export const slaytIslevi = (index: number, toplam: number): Islev | null =>
  yay(toplam)[index] ?? null

/**
 * Prompt'un yay bölümü — her satıra KENDİ işi ve KENDİ bütçesi.
 *
 * ⚠ Bütçeler buradan basılıyor, elle yazılmıyor: prompt ile ölçümün ayrışması ancak
 * ikisinin aynı diziden okumasıyla imkânsız hâle gelir.
 */
export const yayTalimati = (toplam: number, r: RitimOranlari = VARSAYILAN_RITIM): string[] => {
  const t = islevTavanlari(r)
  const isler: Record<Islev, string> = {
    kanca: 'KANCA — okumayı durdurur. İddia ya da soru. Nokta koyma.',
    gerilim: 'GERİLİM — sorunu adlandır ve büyüt. Kısa ve keskin.',
    kanit: 'KANIT — somutla: ne oluyor, neye mal oluyor. Sayı YAZMA.',
    donus: 'DÖNÜŞ — neyin değiştiğini söyle. Tek cümle, sert.',
    davet: 'DAVET — ne yapılacağını söyle. Tek cümle.',
  }
  return yay(toplam).map((i, n) => `- ${n + 1}. satır = ${isler[i]} **EN FAZLA ${t[i]} KELİME.**`)
}

/** Bir bulgu: hangi satır, hangi işlev, ne oldu. */
export interface YayBulgusu {
  readonly satir: number
  readonly islev: Islev
  readonly sebep: 'butce' | 'kanca-nokta' | 'bos'
  readonly olcum: number
  readonly tavan: number
}

const kelimeSayisi = (t: string): number => t.split(/\s+/).filter((w) => w !== '').length

/**
 * Üretilen satırları yaya karşı doğrular — DETERMİNİSTİK, model çağırmaz.
 *
 * ⚠ Yalnız ölçülebilir olanı ölçüyor: bütçe, boşluk, kancanın nokta ile bitmesi.
 * *"Bu gerçekten bir kanca mı?"* sorusu buraya ait değil — o bir yargıdır (FAZ-13.5) ve
 * yargıyı ölçüm gibi göstermek, ikisini de bozar.
 */
export const yayiDogrula = (
  satirlar: readonly string[],
  r: RitimOranlari = VARSAYILAN_RITIM
): readonly YayBulgusu[] => {
  const t = islevTavanlari(r)
  const y = yay(satirlar.length)
  const bulgular: YayBulgusu[] = []
  satirlar.forEach((s, i) => {
    const islev = y[i]
    if (islev === undefined) return
    const n = kelimeSayisi(s)
    if (n === 0) bulgular.push({ satir: i + 1, islev, sebep: 'bos', olcum: 0, tavan: t[islev] })
    else if (n > t[islev])
      bulgular.push({ satir: i + 1, islev, sebep: 'butce', olcum: n, tavan: t[islev] })
    if (islev === 'kanca' && s.trimEnd().endsWith('.'))
      bulgular.push({ satir: i + 1, islev, sebep: 'kanca-nokta', olcum: 1, tavan: 0 })
  })
  return bulgular
}
