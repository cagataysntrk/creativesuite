// Eksen ölçeği ve "güzel" bölme değerleri (§7.6 · FAZ-6.2).
//
// Burada METİN YOK — bu dosya yalnız sayı üretir. Grafik kütüphanelerinin Türkçe'de
// bozulduğu yer metin ölçümüdür; ölçek matematiği değil. Ayrımı dosya sınırında tutmak,
// ikisinin bir gün birbirine karışmasını engelliyor.

/** Bir eksenin sayısal aralığı ve üstündeki işaret değerleri. */
export interface Axis {
  readonly min: number
  readonly max: number
  readonly ticks: readonly number[]
}

/**
 * Ham veriden okunabilir bölme değerleri üretir.
 *
 * Adım daima 1 · 2 · 5 × 10^k: bunlar insanın kafadan bölebildiği sayılardır. 3'lük ya
 * da 7'lik adım teknik olarak "eşit aralıklı"dır ama okuyucu iki işaret arasını
 * hesaplayamaz ve grafik dekorasyona döner.
 *
 * **Deterministik:** aynı girdi her zaman aynı ekseni verir. Bir deck'i yeniden render
 * ettiğinde eksenin kayması, hiçbir veri değişmediği hâlde `git diff`i gürültüye boğardı.
 */
export const niceAxis = (values: readonly number[], hedefBolme = 4): Axis => {
  if (values.length === 0) return { min: 0, max: 1, ticks: [0, 1] }

  const ham = Math.max(...values)
  const dip = Math.min(...values)
  // Taban SIFIR — negatif değer yoksa. Sıfırdan başlamayan bir sütun grafiği farkları
  // olduğundan büyük gösterir ve bu, kaynaksız sayısal iddianın görsel biçimidir (R-32).
  const min = dip < 0 ? dip : 0
  const max = ham > min ? ham : min + 1

  const kabaAdim = (max - min) / Math.max(1, hedefBolme)
  const buyukluk = 10 ** Math.floor(Math.log10(kabaAdim))
  const oran = kabaAdim / buyukluk
  const carpan = oran <= 1 ? 1 : oran <= 2 ? 2 : oran <= 5 ? 5 : 10
  const adim = carpan * buyukluk

  const alt = Math.floor(min / adim) * adim
  const ust = Math.ceil(max / adim) * adim
  const ticks: number[] = []
  // Kayan nokta birikimini engellemek için ÇARPARAK ilerliyoruz: `t += adim` döngüsü
  // 0.1'lik adımda 0.30000000000000004 üretir ve etiket öyle basılır.
  const n = Math.round((ust - alt) / adim)
  for (let i = 0; i <= n; i++) ticks.push(Number((alt + i * adim).toFixed(10)))

  return { min: alt, max: ust, ticks }
}

/**
 * Değeri 0–1 aralığına taşır (0 = eksen dibi, 1 = tepe).
 *
 * Piksel DÖNDÜRMÜYOR: oran döndürüyor. Konumlandırmayı yüzdeyle yapmak, aynı grafiğin
 * farklı en-boylarda yeniden ölçülmeden çalışması demek (FAZ-5.9 ile aynı mantık).
 */
export const norm = (axis: Axis, value: number): number =>
  axis.max === axis.min ? 0 : (value - axis.min) / (axis.max - axis.min)

/**
 * Türkçe sayı biçimi (§12.2). Binlik ayıracı nokta, ondalık virgül.
 *
 * `Intl` her çağrıda yeniden kurulmuyor: biçimlendirici pahalı ve deck'te yüzlerce
 * etiket var.
 */
const bicimlendirici = new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 2 })
export const sayiTr = (n: number): string => bicimlendirici.format(n)
