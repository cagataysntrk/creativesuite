// UpcyMan demo akışı — KALICI ARTEFAKT (§10 · D-13 · FAZ-5.7).
//
// **Bu dosya videodan daha değerlidir.** MP4 bir build çıktısı; ürün arayüzü
// değiştiğinde burası güncellenir ve video yeniden render edilir. Yeniden KAYIT
// yapılmaz — yeniden kayıt, her seferinde farklı zamanlama ve farklı fare izi demektir.
//
// **Tıklama hedefi TIKLAMADAN ÖNCE yazılır** (§7.7): `boundingBox()` çağrısı zaten
// kutuyu veriyor; onu `timeline.json`a yazmak, zoom hedefini görüntüden çıkarma
// zorunluluğunu tamamen ortadan kaldırıyor.
//
// ⚠ Tarayıcıyı BU dosya başlatmaz (`chromium-baslatan` darboğazı, R-05): akış bir
// `Page` alır. Böylece aynı akış hem yakalamada hem testte koşabilir.

import type { ClickTarget } from '@suite/render'

/** Akışın gerektirdiği tek yetenek: tıkla ve kutuyu ölç. */
export interface DemoSayfasi {
  goto: (url: string) => Promise<void>
  kutu: (secici: string) => Promise<{ x: number; y: number; width: number; height: number } | null>
  tikla: (secici: string) => Promise<void>
  bekle: (ms: number) => Promise<void>
}

interface Adim {
  readonly label: string
  readonly secici: string
  readonly bekleMs: number
  readonly chapter: boolean
}

/**
 * Akışın adımları. **Veri, kod değil** — sıra değiştirmek bir düzenleme, bir yeniden
 * yazma değil. `narration.tr.json`daki bölüm id'leriyle `chapter: true` olanlar eşleşir.
 */
export const ADIMLAR: readonly Adim[] = [
  { label: 'giris', secici: '[data-demo="giris"]', bekleMs: 3500, chapter: true },
  { label: 'fire tablosu', secici: '[data-demo="fire-tablosu"]', bekleMs: 3500, chapter: false },
  { label: 'olcum', secici: '[data-demo="olcum"]', bekleMs: 5000, chapter: true },
  { label: 'kapanis', secici: '[data-demo="kapanis"]', bekleMs: 0, chapter: true },
]

/**
 * Akışı koşar ve tıklama hedeflerini DÖNDÜRÜR.
 *
 * Kutusu okunamayan bir adım SESSİZ atlanmaz: öğe görünmüyorsa demo zaten yanlış bir
 * şey gösteriyordur ve bunu videoyu izleyerek keşfetmek en pahalı yoldur.
 */
export const akisiKos = async (
  sayfa: DemoSayfasi,
  url: string,
  simdiMs: () => number
): Promise<readonly ClickTarget[]> => {
  const baslangic = simdiMs()
  await sayfa.goto(url)

  const hedefler: ClickTarget[] = []
  for (const a of ADIMLAR) {
    const kutu = await sayfa.kutu(a.secici)
    if (kutu === null) {
      throw new Error(`demo adımı görünmüyor: ${a.label} (${a.secici})`)
    }
    hedefler.push({
      label: a.label,
      at: (simdiMs() - baslangic) / 1000,
      box: kutu,
      chapter: a.chapter,
    })
    await sayfa.tikla(a.secici)
    if (a.bekleMs > 0) await sayfa.bekle(a.bekleMs)
  }
  return hedefler
}
