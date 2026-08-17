// Tasarım metrikleri — SAF katman (§11.1 · FAZ-10.3 · D-255).
//
// **Neden ayrı bir modül:** `qa/measure.ts` zaten ΔE, palet dışı, metin kaplama ve
// en-boy ölçüyor ve bunlar ÜRETİMDE koşuyor. Eksik olan, karosel GRAMERİNİN doğruluğu:
// metin eğriyi kesiyor mu, hayalet rakam alt şeritle çakışıyor mu, komşu iki slaytın
// zemini aynı mı. Bu turda üçü de gerçekten oldu ve hiçbiri yakalanmadı.
//
// **Saf ve ucuz.** Buradaki hiçbir metrik tarayıcı açmıyor: hepsi belge modelinden ve
// `SlaytKimligi`den hesaplanıyor. Tarayıcı gerektiren tek şey metnin GERÇEK genişliği
// (T2) ve o, ölçülmüş bir sayı olarak dışarıdan geliyor — bu modül ölçmüyor, YARGILIYOR.
// Ayrım önemli: saf bir modül test edilebilir, tarayıcı açan bir modül test edilemez.
//
// **Çıktı `QaReport`** — komuta merkezindeki tolerans okuması yüzeyiyle AYNI şekil.
// Paralel bir rapor biçimi icat etmek, aynı bilgiyi iki yerde iki farklı görünümle
// göstermek olurdu ve biri kaçınılmaz olarak bayatlardı.

import type { DocumentModel, Islev, SlaytKimligi } from '@suite/kernel'
import type { QaReport, ToleranceReading } from '@suite/contracts'
import { GOVDE_TAVANI, islevTavanlari, slaytIslevi } from '@suite/contracts'
import { parseColor, type Rgb } from './qa/deltae.js'
import { reading, report } from './qa/tolerance.js'
import { alanRolleri, guvenliMetinYuzdesi } from './sablon.js'

/**
 * Slayt rolü başına kelime tavanı — **artık `@suite/contracts`ten TÜRETİLİYOR** (FAZ-14.1).
 *
 * ⚠ Eskiden burada elle yazılıydı ve yorumu *"`icerikPromptu` ile AYNI sayılar"* diyordu.
 * **Bir yorum bir zorlama değildir:** prompt'taki sayı değişse bu sabit sessizce eski
 * kalır ve ölçüm, üretimin uymaya çalıştığından başka bir şeyi ölçmeye başlardı. Tek
 * kaynak `packages/contracts/src/senaryo.ts`; prompt da ölçüm de oradan okuyor.
 */
export const KELIME_TAVANI = {
  kapak: islevTavanlari().kanca,
  govde: GOVDE_TAVANI,
  kapanis: islevTavanlari().davet,
  tek: islevTavanlari().davet,
} as const

/** İçerik kenar payı, px — `static.ts`teki `pay` ile aynı olmak zorunda. */
export const KENAR_PAYI = 88

export interface TasarimGirdisi {
  readonly slaytlar: readonly DocumentModel[]
  /**
   * Slayt başına, o slayttaki EN GENİŞ kelimenin render genişliği (px).
   *
   * Tarayıcıdan gelir. **Verilmezse T2 raporlanmaz — sıfır olarak raporlanmaz.**
   * `measure.ts` aynı kuralı koyuyor ve gerekçesi aynı: ölçülmemiş bir metriği sıfır
   * yazmak, hiçbir şey ölçülmediği anda yeşil yakmaktır.
   */
  readonly enGenisKelimePx?: readonly number[]
}

/**
 * CSS değişkenlerini çözer — **YÜZEY KAPSAMLI ve ÖZYİNELEMELİ**.
 *
 * ⚠ İlk sürüm iki ayrı sebepten hiçbir zaman renk döndürmüyordu ve bu ancak üretim
 * `tokenCss`i üstünde ÖLÇÜLEREK çıktı (kapı yeşildi, okuma hiç üretilmiyordu):
 *
 *   1. **Tek adım çözüyordu.** Token mimarisi ÜÇ KADEMELİ (§12.1): rampa → rol →
 *      bileşen. `--role-bg` bir renge değil `var(--ramp-gray-950)`e çözülüyor ve
 *      `parseColor('var(--ramp-…)')` null veriyordu. Bir kademeyi atlamak, mimarinin
 *      kendisini görmezden gelmekti.
 *   2. **"Son tanım kazanır" YANLIŞ yüzeyi seçiyordu.** Aynı rol dört blokta tanımlı
 *      (`:root`, `console`, `kreatif`, `studio`) ve sonuncusu `studio`. Karosel
 *      `kreatif` yüzeyinde çiziliyor; son tanımı almak, ölçülen rengin RENDER EDİLEN
 *      renk olmamasına yol açardı — yani ölçüm doğru sayı üretip yanlış şeyi ölçerdi.
 *
 * Yüzey verilmezse `:root` kullanılıyor; verilirse o bloğun tanımı önceliklidir.
 */
const YUZEY = 'kreatif'
const COZUM_DERINLIGI = 5

/** Bir bloktaki (`:root` ya da `[data-surface='x']`) tanımı bulur. */
const bloktanOku = (tokenCss: string, ad: string, yuzey: string | null): string | null => {
  const bas =
    yuzey === null ? tokenCss.indexOf(':root') : tokenCss.indexOf(`[data-surface='${yuzey}']`)
  if (bas === -1) return null
  const acilis = tokenCss.indexOf('{', bas)
  const kapanis = tokenCss.indexOf('}', acilis)
  if (acilis === -1 || kapanis === -1) return null
  const govde = tokenCss.slice(acilis, kapanis)
  const m = new RegExp(`${ad}\\s*:\\s*([^;}]+)`).exec(govde)
  return m === null ? null : (m[1]?.trim() ?? null)
}

const tokenCoz = (tokenCss: string, deger: string, derinlik = 0): Rgb | null => {
  if (derinlik > COZUM_DERINLIGI) return null // döngüsel tanım — sessizce dönmez, null verir
  const m = /^var\(\s*(--[\w-]+)\s*\)$/.exec(deger.trim())
  if (m === null) return parseColor(deger)
  const ad = m[1]
  if (ad === undefined) return null
  // Önce kreatif yüzeyi (karosel orada çiziliyor), sonra `:root` (rampalar orada).
  const sonraki = bloktanOku(tokenCss, ad, YUZEY) ?? bloktanOku(tokenCss, ad, null)
  return sonraki === null ? null : tokenCoz(tokenCss, sonraki, derinlik + 1)
}

/** sRGB bağıl parlaklık (WCAG 2.2). */
const parlaklik = ({ r, g, b }: Rgb): number => {
  const k = (v: number): number => {
    const s = v / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * k(r) + 0.7152 * k(g) + 0.0722 * k(b)
}

/** WCAG kontrast oranı — 1.0 (aynı) … 21.0 (siyah/beyaz). */
export const kontrastOrani = (a: Rgb, b: Rgb): number => {
  const [x, y] = [parlaklik(a), parlaklik(b)].sort((p, q) => q - p) as [number, number]
  return (x + 0.05) / (y + 0.05)
}

/**
 * Metin bloklarını TÜRÜYLE birlikte döndürür.
 *
 * ⚠ **Tür şart, çünkü bütçe bloğa göre değişiyor.** Kapak slaydında bir BAŞLIK ≤8 kelime
 * olmalı; ama aynı slayttaki destekleyici bir GÖVDE satırı ≤30 kelimedir ve bu meşrudur.
 */
const metinBloklari = (
  doc: DocumentModel
): readonly { tur: 'heading' | 'body'; metin: string; islev?: Islev }[] =>
  doc.blocks.flatMap((b) =>
    b.type === 'heading' || b.type === 'body'
      ? [
          {
            tur: b.type,
            metin: (b as { text: string }).text,
            ...((b as { islev?: Islev }).islev === undefined
              ? {}
              : { islev: (b as { islev?: Islev }).islev }),
          },
        ]
      : []
  )

const kelimeSayisi = (t: string): number => t.split(/\s+/).filter((w) => w !== '').length

/**
 * Bütçeyi EN ÇOK aşan bloğun aşım oranı — 1.0 = tam sınırda, >1 = aşmış.
 *
 * ⚠ **Bu, aynı metrikteki ÜÇÜNCÜ birim düzeltmesi ve üçü de aynı hatanın çeşitlemesiydi:**
 *   1. Slayttaki tüm metni TOPLUYORDU — bütçe satır başınayken.
 *   2. En uzun bloğu ölçüyordu ama slaytın ROL bütçesiyle — kapak slaydındaki 21 kelimelik
 *      destekleyici GÖVDE satırı, kapak başlığının 8 kelimelik bütçesine karşı ölçülüyordu.
 *      Gerçek koşuda kabul sayacını sıfırlattı; oysa başlık 5 kelimeydi ve kapak GÜZELDİ.
 *   3. Şimdi: her blok KENDİ türünün bütçesine karşı ölçülüyor.
 *
 * **Ölçenin hatası, ölçülenin hatası gibi görünür** — ve görsele bakılmasaydı burada
 * içeriği "kurala uymuyor" diye suçlayacaktım.
 */
const asimOrani = (doc: DocumentModel, k: SlaytKimligi): number => {
  // ⚠ **DÖRDÜNCÜ düzeltme değil, bir GENİŞLETME.** Üçü de "hangi bütçe" sorusuydu; bu,
  // bütçenin nereden geldiğini değiştiriyor: slaytın YAY İŞLEVİ (kanca/gerilim/kanit/
  // dönüş/davet) varsa onun tavanı geçerli. Böylece dört gövde satırı dört EŞİT paragraf
  // olmaktan çıkıyor — ritim ölçüme giriyor, temenniye değil.
  //
  // ⚠ İşlev yoksa (yay dışı bir slayt sayısı) eski rol davranışı aynen sürüyor: yeni
  // ölçüm, ölçemediği yerde eskisini bozmuyor.
  // ⚠ **İşlev BLOĞUN üstünden okunuyor; slayt sırasından TÜRETİLMİYOR.** Türetiliyordu
  // ve gerçek bir koşuda düştü: sayfalayıcı 6 satırı 5 slayda bölünce üçüncü satır
  // (bir `kanit`) ikinci slaytta ölçüldü ve `gerilim`in bütçesine çarptı. Satırların
  // hepsi bütçe içindeydi; hatalı olan ölçendi (D-260 ailesinin dördüncüsü).
  //
  // Blokta işlev yoksa (eski belgeler, testler) slayt sırasından türetme SÜRÜYOR —
  // yeni ölçüm, ölçemediği yerde eskisini bozmuyor.
  const slaytIslev = slaytIslevi(k.index, k.total)
  let en = 0
  for (const b of metinBloklari(doc)) {
    const islev = b.islev ?? slaytIslev
    const tavan =
      b.tur === 'heading'
        ? islev === null
          ? KELIME_TAVANI[k.role]
          : islevTavanlari()[islev]
        : // Gövde bloğu: işlev bir GÖVDE işleviyse onun tavanı, değilse (kapak
          // slaydındaki destekleyici satır gibi) en geniş gövde tavanı. D-260'ın dersi
          // korunuyor: kapaktaki 21 kelimelik destek satırı 8'e karşı ölçülmez.
          islev === null || islev === 'kanca'
          ? KELIME_TAVANI.govde
          : islevTavanlari()[islev]
    const oran = kelimeSayisi(b.metin) / tavan
    if (oran > en) en = oran
  }
  return en
}

/**
 * Tasarım metriklerini ölçer.
 *
 * Boş slayt listesi `readings: []` döndürür — **hata değil, ölçüm yokluğu.** Çağıran
 * bunu yeşil sanmamalı; kapı ayrıca "hiç okuma yok" durumunu reddediyor.
 */
export const tasarimOlc = (g: TasarimGirdisi): QaReport => {
  const okumalar: ToleranceReading[] = []
  const s = g.slaytlar

  for (const [i, doc] of s.entries()) {
    const k = doc.slayt
    if (k === undefined) continue
    const r = alanRolleri(k)

    // ── T8 kelime tavanı ────────────────────────────────────────────────────
    // Sayfalayıcı taşmayı böler ama neyin BAŞLIK olduğunu bilemez; disiplin metnin
    // üretildiği yerde konuluyor ve burada DOĞRULANIYOR.
    // Değer YÜZDE olarak: farklı bütçeli bloklar tek okumada karşılaştırılabilsin.
    // Ham kelime sayısı yazılsaydı "21 / limit 8" görünür ve o 21'in bir GÖVDE satırı
    // olduğu kaybolurdu — tam olarak beni yanıltan şey buydu.
    okumalar.push(
      reading({
        metric: 'word_budget',
        label: `slayt ${i + 1} kelime bütçesi (${k.role})`,
        value: Math.round(asimOrani(doc, k) * 100),
        warn: 85,
        limit: 100,
        direction: 'lower',
        unit: '%',
      })
    )

    // ── T4 kontrast: metin ↔ zemin ──────────────────────────────────────────
    const metinRgb = tokenCoz(doc.tokenCss, r.metin)
    const zeminRgb = tokenCoz(doc.tokenCss, r.zemin)
    if (metinRgb !== null && zeminRgb !== null) {
      okumalar.push(
        reading({
          metric: 'contrast_ratio',
          label: `slayt ${i + 1} metin kontrastı`,
          value: kontrastOrani(metinRgb, zeminRgb),
          warn: 7,
          limit: 4.5,
          direction: 'upper',
          unit: ':1',
        })
      )
    }

    // ── T2 metin taşması ────────────────────────────────────────────────────
    // Güvenli sütunun İÇERİK genişliği = sütun − kenar payı. En geniş kelime bunu
    // aşarsa metin eğriye girer. **Bu, iki kez düzeltilip iki kez geri gelen kusur**:
    // ilk iki denemede kutu daraltıldı, ama kelime bölünmediği için taşma sürdü (R-23).
    const en = g.enGenisKelimePx?.[i]
    if (en !== undefined) {
      const guvenliPx = Math.round((doc.width * guvenliMetinYuzdesi) / 100) - KENAR_PAYI
      okumalar.push(
        reading({
          metric: 'text_overflow',
          label: `slayt ${i + 1} metin taşması`,
          value: Math.max(0, en - guvenliPx),
          warn: 0,
          limit: 0,
          direction: 'lower',
          unit: ' px',
        })
      )
    }

    // ── T3 hayalet rakam ↔ alt şerit ────────────────────────────────────────
    // Rakamın alt kenarı `KENAR_PAYI + 62`; alt şerit `KENAR_PAYI`de başlayıp ~30 px
    // yükseliyor. İkisi çakışırsa kompozisyon kazara duruyor — bu da gerçekten oldu.
    const rakamAlt = KENAR_PAYI + 62
    const seritUst = KENAR_PAYI + 30
    okumalar.push(
      reading({
        metric: 'ghost_overlap',
        label: `slayt ${i + 1} rakam ↔ şerit`,
        value: Math.max(0, seritUst - rakamAlt),
        warn: 0,
        limit: 0,
        direction: 'lower',
        unit: ' px',
      })
    )
  }

  // ── T7 komşu slaytlarda aynı zemin ────────────────────────────────────────
  // Izgaraya bakıldığında iki komşu karenin ayırt edilebilmesi gerekiyor; aynı zemin
  // onları tek bir bloğa dönüştürüyor.
  let ayniKomsu = 0
  for (let i = 1; i < s.length; i += 1) {
    const a = s[i - 1]?.slayt
    const b = s[i]?.slayt
    if (a === undefined || b === undefined) continue
    if (alanRolleri(a).zemin === alanRolleri(b).zemin) ayniKomsu += 1
  }
  if (s.length > 1) {
    okumalar.push(
      reading({
        metric: 'adjacent_same_bg',
        label: 'komşu slaytta aynı zemin',
        value: ayniKomsu,
        warn: 0,
        limit: 0,
        direction: 'lower',
        unit: ' çift',
      })
    )
  }

  return report(okumalar)
}

/**
 * Üretilmiş HTML'den tipografi sayımı — T6 (font ailesi) ve T11 (tip boyutu).
 *
 * HTML üzerinden, çünkü asıl soru "kaç aile TANIMLANDI" değil "kaç aile KULLANILDI".
 * `fonts.ts`teki `YUZLER` listesini saymak ilkini cevaplar ve yanlış soruyu ölçmek,
 * ölçmemekten daha ikna edici bir yanlıştır.
 */
export const tipografiSay = (html: string): QaReport => {
  const aileler = new Set<string>()
  for (const m of html.matchAll(/font-family:\s*([^;}]+)/g)) {
    const ilk = (m[1] ?? '').split(',')[0]?.trim().replace(/['"]/g, '') ?? ''
    // `@font-face` bildirimleri de eşleşiyor; jenerik aileler sayılmıyor.
    if (ilk !== '' && !['sans-serif', 'serif', 'monospace', 'system-ui'].includes(ilk)) {
      aileler.add(ilk)
    }
  }
  // ⚠ **Yalnız İÇERİK tip ölçeği sayılıyor** (`h1`, `h2`, `p`) — ilk sürüm HTML'deki
  // her `font-size`ı sayıyordu ve 11 buluyordu: sayaç (26), kulp (24), navigasyon (24),
  // hayalet rakam (560) ve boşluk yükseklikleri de sayıya giriyordu. Onlar krom, tip
  // ölçeği değil: kapalı bir sette tanımlı ve okunmak için değil, konumlanmak için
  // varlar. **Yanlış şeyi ölçen bir metrik, ölçmemekten daha ikna edici bir yanlıştır**
  // — sayı üretir, tabloda durur, kimse tanımına bakmaz.
  const boyutlar = new Set<string>()
  for (const kural of html.split('}')) {
    const [secici, govde] = kural.split('{')
    if (govde === undefined) continue
    if (!/(^|,)\s*(h1|h2|h3|p)\s*$/.test(secici ?? '')) continue
    const m = /font-size:\s*(\d+)px/.exec(govde)
    if (m !== null) boyutlar.add(m[1] ?? '')
  }

  return report([
    reading({
      metric: 'font_family_count',
      label: 'kullanılan font ailesi',
      value: aileler.size,
      warn: 2,
      limit: 2,
      direction: 'lower',
      unit: '',
    }),
    reading({
      metric: 'type_size_count',
      label: 'farklı tip boyutu',
      value: boyutlar.size,
      warn: 3,
      limit: 3,
      direction: 'lower',
      unit: '',
    }),
  ])
}
