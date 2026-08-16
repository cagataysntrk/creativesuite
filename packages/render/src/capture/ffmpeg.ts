// x11grab argüman kurucusu (§7.7 · FAZ-5.6).
//
// **Playwright `recordVideo` REDDEDİLDİ** (§17): istenen çözünürlüğü karşılayamadığında
// sessizce 800×800 WebM'e düşüyor. Sessizce düşen bir ayar, en kötü ayardır — çıktı
// üretilir, kimse bakmaz, ve prospect'e giden video 800×800'dür.
//
// Bunun yerine gerçek ekran yakalama: Xvfb'de headed Chromium, üstünden x11grab.
// Çözünürlük İSTENİR ve alınamadığında hata verir; sessiz düşme yok.
//
// **Bu dosya süreç BAŞLATMAZ.** Argüman kurar, çalıştırmaz — `alt-surec` darboğazı
// (R-05) spawn'ı `kernel/src/proc/spawn.ts`e kilitliyor. Ayrım ayrıca test edilebilirlik
// veriyor: argümanlar ffmpeg olmadan doğrulanabiliyor.

export interface CaptureOptions {
  readonly width: number
  readonly height: number
  readonly fps: number
  /** X ekran numarası — Xvfb'nin açtığı. `:99` gibi. */
  readonly display: string
  readonly outPath: string
}

export type CaptureArgError =
  | { readonly kind: 'odd_dimension'; readonly which: 'width' | 'height'; readonly value: number }
  | { readonly kind: 'bad_fps'; readonly value: number }
  | { readonly kind: 'bad_display'; readonly value: string }

export type CaptureArgResult =
  | { readonly ok: true; readonly value: readonly string[] }
  | { readonly ok: false; readonly errors: readonly CaptureArgError[] }

/**
 * x11grab argümanları.
 *
 * **`-draw_mouse 0` ZORUNLU** ve burada sabit: gerçek imleç titrer, hedefi ıskalar ve
 * her kayıtta farklı yerde durur. Sahte imleç (`hf-cursor`, 5.3) `timeline.json`daki
 * hedefe deterministik gider — kaydedilmiş bir imleci sonradan gizlemek imkânsızdır,
 * bu yüzden karar yakalama anında verilir.
 *
 * **`yuv420p` ZORUNLU:** yuv444p daha iyi görünür ama Safari ve çoğu sosyal platform
 * onu oynatmaz. "Daha iyi ama oynamıyor", oynamıyor demektir.
 */
export const captureArgs = (o: CaptureOptions): CaptureArgResult => {
  const errors: CaptureArgError[] = []

  // h264 çift boyut ister: tek sayı `-vf scale` ile sessizce yuvarlanır ve 1 piksel
  // kayma her kareyi yeniden örnekler.
  if (o.width % 2 !== 0) errors.push({ kind: 'odd_dimension', which: 'width', value: o.width })
  if (o.height % 2 !== 0) errors.push({ kind: 'odd_dimension', which: 'height', value: o.height })
  if (!Number.isInteger(o.fps) || o.fps < 1 || o.fps > 120) {
    errors.push({ kind: 'bad_fps', value: o.fps })
  }
  if (!/^:\d+(\.\d+)?$/.test(o.display)) {
    errors.push({ kind: 'bad_display', value: o.display })
  }
  if (errors.length > 0) return { ok: false, errors }

  return {
    ok: true,
    value: [
      '-hide_banner',
      '-loglevel',
      'error',
      '-f',
      'x11grab',
      '-framerate',
      String(o.fps),
      '-video_size',
      `${o.width}x${o.height}`,
      // İmleç ÇİZİLMEZ — kararı burada veriyoruz, sonradan gizlemek imkânsız.
      '-draw_mouse',
      '0',
      '-i',
      o.display,
      '-c:v',
      'libx264',
      // `veryfast`: yakalama gerçek zamanlı ve kare düşürmek, kalite kazancından
      // pahalıdır — düşen kare geri gelmez.
      '-preset',
      'veryfast',
      '-crf',
      '18',
      '-pix_fmt',
      'yuv420p',
      // `+faststart` moov atom'u başa alır: yarıda izlenebilir dosya.
      '-movflags',
      '+faststart',
      '-y',
      o.outPath,
    ],
  }
}

/**
 * Xvfb argümanları. Ekran derinliği 24 bit — 16 bit renk bantlaması yapıyor ve
 * marka renginin ΔE'si ölçülemez hâle geliyor (§11.1).
 */
export const xvfbArgs = (
  o: Pick<CaptureOptions, 'width' | 'height' | 'display'>
): readonly string[] => [o.display, '-screen', '0', `${o.width}x${o.height}x24`, '-nolisten', 'tcp']

export const captureHataMesaji = (e: CaptureArgError): string => {
  switch (e.kind) {
    case 'odd_dimension':
      return `${e.which} ${e.value} TEK sayı — h264 çift boyut ister, ffmpeg sessizce yuvarlar`
    case 'bad_fps':
      return `fps ${e.value} geçersiz (1-120 tam sayı)`
    case 'bad_display':
      return `ekran '${e.value}' geçersiz — ':99' biçiminde olmalı`
  }
}
