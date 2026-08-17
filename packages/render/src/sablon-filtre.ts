// HEDEF: packages/render/src/sablon-filtre.ts
//
// Duotone ve marka tonlaması — renk tutarlılığının YAPISAL çözümü (FAZ-11.7 · §12.1).
//
// **Neden var:** FAZ-10.7'de mavi/turuncu makineli bir fotoğraf amber alanla çarpıştı ve
// ben brief'e *"monokrom yaz"* diye YALVARDIM. Bu, modelin uymasına bağlı ve kırılgan bir
// çözüm: bir koşuda uyar, ötekinde uymaz, ve uymadığını ancak bakınca görürsün.
//
// Duotone girdiden BAĞIMSIZ: hangi fotoğraf gelirse gelsin parlaklığı marka eksenine
// (mürekkep → kehribar) eşleniyor ve çıktı marka içinde kalıyor. **Prompt'a güvenmek
// yerine çıktıyı dönüştürmek** — aynı ders `chart`/`diagram` ve yuva zorunluluğunda da
// alındı: garantiyi rica etme, yapıya göm.
//
// ⚠ Chromium'da bedava: `feColorMatrix` + `feComponentTransfer`. Yeni bağımlılık yok.

import { z } from './kompozit.js'

/** Duotone uçları — mürekkep (koyu uç) ve kehribar (açık uç). */
export interface DuotoneUclari {
  readonly koyu: readonly [number, number, number]
  readonly acik: readonly [number, number, number]
}

/**
 * Markanın duotone ekseni. sRGB 0–1.
 *
 * ⚠ Sayılar token'lardan TÜRETİLMELİ, burada sabit durmamalı — ama token çözümü
 * `tasarim-olcum.ts`te ve bu dosya saf bir SVG üreteci. Çağıran çözülmüş rengi veriyor;
 * bu varsayılan yalnız test ve golden içindir.
 */
export const VARSAYILAN_UCLAR: DuotoneUclari = {
  koyu: [0.09, 0.08, 0.06],
  acik: [0.95, 0.75, 0.18],
}

/** 0–255 arası bir kanalı 0–1'e çevirir. */
export const kanal = (v: number): number => Math.max(0, Math.min(1, v / 255))

/**
 * Duotone SVG filtresi.
 *
 * ⚠ **İKİ ADIM, ve sırası şart.** Önce `feColorMatrix type="matrix"` ile GRİYE indiriyoruz
 * (luminance ağırlıkları: 0.2126/0.7152/0.0722 — insan gözünün yeşile duyarlılığı), sonra
 * `feComponentTransfer` ile o tek kanalı iki uç arasına yayıyoruz. Tek adımda yapılsaydı
 * renkli girdinin kendi hue'su matrise sızar ve mavi bir makine mavi kalırdı.
 *
 * ⚠ `type="table"` iki değerle **doğrusal** interpolasyon yapıyor: 0 → koyu uç,
 * 1 → açık uç. Üçüncü bir durak eklemek bir KARAR ister (orta ton kayması).
 */
export const duotoneSvg = (id: string, u: DuotoneUclari = VARSAYILAN_UCLAR): string =>
  `<svg class="filtre-tanim" width="0" height="0" aria-hidden="true">` +
  `<filter id="${id}" color-interpolation-filters="sRGB">` +
  `<feColorMatrix type="matrix" values="` +
  `0.2126 0.7152 0.0722 0 0 ` +
  `0.2126 0.7152 0.0722 0 0 ` +
  `0.2126 0.7152 0.0722 0 0 ` +
  `0 0 0 1 0"/>` +
  `<feComponentTransfer>` +
  `<feFuncR type="table" tableValues="${u.koyu[0]} ${u.acik[0]}"/>` +
  `<feFuncG type="table" tableValues="${u.koyu[1]} ${u.acik[1]}"/>` +
  `<feFuncB type="table" tableValues="${u.koyu[2]} ${u.acik[2]}"/>` +
  `</feComponentTransfer>` +
  `</filter></svg>`

/** Filtreyi bir öğeye bağlayan CSS. */
export const duotoneCss = (secici: string, id: string): string =>
  `  ${secici} { filter: url(#${id}); }`

// ── Doku ve derinlik (FAZ-11.8) ─────────────────────────────────────────────
//
// ⚠ **Gölge yasağı KONSOL yüzeyine aittir (§12.1), kreatif yüzeye değil.** İkisini
// karıştırmak bir enstrüman kuralını bir kreatif kurala çevirmek olurdu: konsolda gölge
// yasak çünkü orada derinlik bir durum sinyalini taklit eder; kreatifte derinlik meşru
// ve ölçüsü chroma tavanı + kontrast metriğidir.

/**
 * Grain opaklığı TAVANI.
 *
 * ⚠ Doku bir HİS, bir gürültü değil. Üstünde metin duran bir yüzeye eklenen her doku
 * kontrastı düşürür; tavan olmadan "biraz daha doku" her turda biraz daha eklenir ve
 * okunabilirlik sessizce erir. Ölçüsü var: `tasarim` kapısının kontrast metriği.
 */
export const GRAIN_TAVANI = 0.06

/**
 * İnce grain — baskı hissi. `feTurbulence` deterministik: `seed` sabit.
 *
 * ⚠ `type="fractalNoise"` seçildi, `turbulence` değil: ikincisi damarlı/bulutlu bir
 * desen verir ve kâğıt değil mermer gibi görünür. `baseFrequency` yüksek tutuluyor —
 * düşük frekans büyük lekeler demek, ki o doku değil kirlilik.
 */
export const grainSvg = (id: string, opaklik: number = GRAIN_TAVANI): string =>
  `<svg class="filtre-tanim" width="0" height="0" aria-hidden="true">` +
  `<filter id="${id}" x="0" y="0" width="100%" height="100%">` +
  `<feTurbulence type="fractalNoise" baseFrequency="0.82" numOctaves="3" seed="7" ` +
  `stitchTiles="stitch" result="gurultu"/>` +
  `<feColorMatrix type="saturate" values="0"/>` +
  `<feComponentTransfer><feFuncA type="linear" slope="${Math.min(opaklik, GRAIN_TAVANI)}"/>` +
  `</feComponentTransfer></filter></svg>`

/**
 * Grain katmanı — tuvalin tamamına, metnin ALTINA.
 *
 * ⚠ `mix-blend-mode: multiply` DEĞİL `overlay`: multiply yalnız koyulaştırır ve açık
 * kâğıt alanı kirletir; overlay hem koyu hem açık uçta dokuyu korur.
 * ⚠ `pointer-events: none` ve `aria-hidden`: doku bir içerik değil.
 */
export const grainKatmani = (id: string): string =>
  `<div class="doku" aria-hidden="true" style="filter:url(#${id})"></div>`

export const dokuCss = (): string =>
  `  .doku { position: absolute; inset: 0; z-index: ${z('doku')}; pointer-events: none;` +
  ` mix-blend-mode: overlay; }`

/**
 * Kenar vinyeti — çerçeveye doğru hafif koyulaşma.
 *
 * ⚠ Merkez TAM ŞEFFAF: vinyet bir karartma değil bir OKUMA yönlendirmesi. Merkezi de
 * karartan bir vinyet, kontrast metriğini tüm yüzeyde düşürür ve kazandığı derinlikten
 * fazlasını okunabilirlikten alır.
 *
 * ⚠ ⚠ **BU AİLEDE VARSAYILAN KAPALI (güç 0) — ve karar BAKARAK verildi.** 0.1 ile
 * render edildi ve amber alan düz kalmaktan çıkıp çamurlu bir degradeye döndü: referans
 * örnek 5'te o alan DÜZ ve düzlüğü tasarımın kendisi. Derinlik burada tasarımla
 * çatışıyor. Yetenek duruyor ve parametrik (D-262); koyu zeminli bir aile onu açacak.
 * *"Mümkün olan" ile "bu ailede doğru olan" ayrı sorulardır.*
 */
export const vinyetCss = (guc = 0): string =>
  `  .vinyet { position: absolute; inset: 0; z-index: ${z('vinyet')}; pointer-events: none;` +
  ` background: radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,${guc}) 100%); }`

export const vinyetKatmani = (): string => `<div class="vinyet" aria-hidden="true"></div>`
