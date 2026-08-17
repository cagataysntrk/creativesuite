// HEDEF: packages/render/src/browser.ts
//
// Chromium'u başlatan TEK dosya (§3.8 · §7.1 · chokepoints.json → `chromium-baslatan`).
//
// **Tek motor yasası (R-30) burada yaşıyor.** Statik görsel, deck PDF'i ve hareket
// (HyperFrames) aynı Chromium'u, aynı fontları, aynı token CSS'ini kullanır. İkinci bir
// motor = ikinci bir CSS alt kümesi = **ikinci bir Türkçe tipografi hata modu** (D-24).
//
// **Playwright'ın kendi tarayıcısı** kullanılıyor, sistemdeki değil (D-86):
//   - snap Chromium `/tmp` altına yazamıyor (confinement) — ölçüldü,
//   - snap kendi kendine güncelleniyor ve golden metriği (R-31) hiçbir commit olmadan
//     değiştirir; sürümü sabitlenemeyen tarayıcı golden testin altını oyar.
// `chromium.launch()` Playwright'ın indirdiği sürümü kullanır; yol sistemden ARANMAZ.

import { chromium, type Browser, type Page } from 'playwright'

// `Page` buradan yeniden dışa aktarılıyor: `static.ts` sayfayı görmek zorunda ama
// `playwright`i doğrudan import etmemeli — chokepoint yalnız `chromium.launch()`u
// değil, motorun yüzeyini de tek dosyada tutuyor.
export type { Page }

/**
 * Chromium bayrakları — **tek tanım**. İki başlatma noktası (`withPage`, `withOturum`)
 * aynı listeyi kullanmak zorunda; ayrı yazılsalardı biri güncellenir, diğeri unutulur ve
 * iki yol farklı tipografi üretirdi.
 */
const CHROMIUM_BAYRAKLARI = ['--font-render-hinting=none', '--disable-lcd-text']

export interface BrowserOptions {
  /** Milisaniye. Sonsuza kadar bekleyen bir render, gözetimsiz bir gecede asılı kalır. */
  readonly timeoutMs?: number
  /**
   * Farklı bir Chromium ikilisi (D-194). Verilmezse Playwright'ın kendi sürümü —
   * üretim yolu HER ZAMAN varsayılanı kullanır. Bu alan yalnız **ölçüm** içindir:
   * hareket katmanının tarayıcısı bizimkiyle aynı tipografiyi üretiyor mu.
   */
  readonly executablePath?: string
}

export type BrowserFailure =
  | { readonly kind: 'launch_failed'; readonly message: string }
  | { readonly kind: 'render_failed'; readonly message: string }

export type BrowserResult<T> =
  { readonly ok: true; readonly value: T } | { readonly ok: false; readonly error: BrowserFailure }

/**
 * Tarayıcıyı açar, işi yapar, KAPATIR.
 *
 * `finally` şart: bir hata Chromium'u ayakta bırakırsa gözetimsiz çalıştırmada
 * süreç sızıntısı birikir ve makine bir sabah takas alanında boğulur. Kapanış,
 * başarı yolunda değil HER yolda olmalı.
 */
export const withPage = async <T>(
  fn: (page: Page) => Promise<T>,
  opts: BrowserOptions = {}
): Promise<BrowserResult<T>> => {
  let browser: Browser | null = null
  try {
    browser = await chromium.launch({
      // **BAŞKA bir Chromium ikilisi verilebilir** (D-194 · FAZ-5.1).
      //
      // HyperFrames kendi Chrome'unu getiriyor (135.x) ve `PUPPETEER_EXECUTABLE_PATH`
      // ile yönlendirilemiyor; bizimki Playwright'ın Chromium'u (141.x). R-30 artık
      // "sınır ikili değil MOTOR" diyor ama eşdeğerlik KANITLANMAK zorunda — ve kanıt
      // ancak O ikiliyi bu ölçüm koduyla koşturmakla üretilir.
      //
      // Başlatma yine BU dosyada: `chromium-baslatan` darboğazı ikinci bir başlatma
      // noktasını değil, ikinci bir başlatma DOSYASINI yasaklıyor. Yol parametresi
      // buraya gelirse font bayrakları da tek yerde kalır — asıl karşılaştırmayı
      // anlamlı yapan şey bu.
      ...(opts.executablePath === undefined ? {} : { executablePath: opts.executablePath }),
      // Sandbox devre dışı DEĞİL: kapatmak konteynerde kolaylık sağlar ama bu makinede
      // gerekmiyor ve güvenlik sınırını gereksiz yere gevşetmek, gerekmeden ödenen
      // bir borçtur (§14).
      //
      // ⚠ `--disable-lcd-text` — **görsel yargı adımının bulduğu kusur** (FAZ-10.5).
      // Chromium varsayılan olarak alt-piksel (LCD) yumuşatma yapıyor ve harf kenarlarına
      // mavi–turuncu saçaklar bırakıyor. Ekranda görünmez, ama PNG bir VARLIK: farklı
      // piksel dizilimli ekranlarda, baskıda ve ölçekleme sonrasında saçak görünür hâle
      // geliyor. Ölçüldü: metin bölgesinde kanal farkı >18 olan piksel oranı **%6,6** →
      // düzeltmeyle **%0,0**. Nötr mürekkep/krem bir tasarımda o oran sıfır olmalıydı.
      // Bu kusuru hiçbir metrik görmedi; görsel yargı buldu ve ölçüm doğruladı.
      args: CHROMIUM_BAYRAKLARI,
    })
  } catch (e) {
    return {
      ok: false,
      error: { kind: 'launch_failed', message: e instanceof Error ? e.message : String(e) },
    }
  }

  try {
    const page = await browser.newPage()
    page.setDefaultTimeout(opts.timeoutMs ?? 30_000)
    return { ok: true, value: await fn(page) }
  } catch (e) {
    return {
      ok: false,
      error: { kind: 'render_failed', message: e instanceof Error ? e.message : String(e) },
    }
  } finally {
    await browser.close()
  }
}

/**
 * Bir işin süresi boyunca AÇIK kalan tarayıcı — çok slaytlı render için (FAZ-10.1).
 *
 * **Neden gerekiyordu, ölçüldü:** `renderStatic` slayt başına `withPage` çağırıyordu ve
 * her çağrı Chromium'u sıfırdan başlatıyordu. Kalite merdiveni devredeyse basamak başına
 * bir kez daha. Bu makinede ölçüm:
 *
 *   5 slayt · her biri ayrı tarayıcı : 3656 ms
 *   5 slayt · tek paylaşımlı oturum  :  704 ms   → **5.2x**
 *
 * **Singleton DEĞİL — ve bu fark önemli.** Alandaki araçlar (Open Carrusel) süreç ömrü
 * boyunca yaşayan bir tarayıcı tutup "50 dışa aktarımda bir yenile" diyor. O şekil,
 * gözetimsiz bir gecede sızıntıyı yalnız GECİKTİRİR, engellemez: sürecin kendisi
 * ölmezse tarayıcı da ölmez. Burada ömür **işin** ömrüdür — `finally` her yolda kapatır,
 * tıpkı `withPage`te olduğu gibi. Kazanç aynı, garanti duruyor.
 *
 * Sayfa BAŞINA yeni bir `Page` açılıyor, paylaşılmıyor: iki slayt aynı sayfayı
 * kullanırsa birinin `document.fonts` durumu diğerine sızar ve o an render deterministik
 * olmaktan çıkar.
 */
export interface Oturum {
  readonly sayfaIle: <T>(fn: (page: Page) => Promise<T>) => Promise<BrowserResult<T>>
}

export const withOturum = async <T>(
  fn: (oturum: Oturum) => Promise<T>,
  opts: BrowserOptions = {}
): Promise<BrowserResult<T>> => {
  let browser: Browser | null = null
  try {
    browser = await chromium.launch({
      ...(opts.executablePath === undefined ? {} : { executablePath: opts.executablePath }),
      // Bayraklar `withPage` ile AYNI olmak zorunda: farklı olsalardı oturumlu ve
      // oturumsuz yol farklı tipografi üretir ve 10.1'in "bayt bayt özdeş" kanıtı
      // sessizce yalan olurdu.
      args: CHROMIUM_BAYRAKLARI,
    })
  } catch (e) {
    return {
      ok: false,
      error: { kind: 'launch_failed', message: e instanceof Error ? e.message : String(e) },
    }
  }

  const acik = browser
  const oturum: Oturum = {
    sayfaIle: async (isle) => {
      let page: Page | null = null
      try {
        page = await acik.newPage()
        page.setDefaultTimeout(opts.timeoutMs ?? 30_000)
        return { ok: true, value: await isle(page) }
      } catch (e) {
        return {
          ok: false,
          error: { kind: 'render_failed', message: e instanceof Error ? e.message : String(e) },
        }
      } finally {
        // Sayfa da HER yolda kapanıyor: açık kalan sayfalar oturum boyunca birikir ve
        // yirmi slaytlık bir karoselde bellek eğrisi tarayıcıyı yavaşlatır.
        if (page !== null) await page.close().catch(() => {})
      }
    },
  }

  try {
    return { ok: true, value: await fn(oturum) }
  } catch (e) {
    return {
      ok: false,
      error: { kind: 'render_failed', message: e instanceof Error ? e.message : String(e) },
    }
  } finally {
    await acik.close()
  }
}
