// HEDEF: packages/render/src/panorama.ts
//
// Kesintisiz karosel — TEK GENİŞ TUVAL, sonra dilimleme (§7.1 · R-30).
//
// ⚠ ⚠ **BU DOSYA BİR MİMARİ DÜZELTMEDEN DOĞDU.** Mevcut render her slaydı AYRI çiziyor ve
// sürekliliği *ima etmeye* çalışıyordu: eğrinin çıkış açısı sonrakinin giriş açısıyla
// uyumlu olsun, yarım bir şekil kenardan taşsın… Hiçbiri gerçekten sürekli görünmedi ve
// görünemezdi — **süreklilik bir efekt değil, tuvalin kendisidir.**
//
// Doğru yöntem (Photoshop eğitimlerinde *seamless carousel*): 6 slaytlık bir karosel için
// 6480×1350'lik TEK bir tuval tasarlanır, öğeler kesim çizgilerini serbestçe aşar, sonra
// tuval dilimlenir. Kaydıran göz bölünmüş bir tasarım değil, DEVAM EDEN bir tasarım görür.
//
// ⚠ ⚠ **KESİMİ AŞAN ÖĞE İÇERİKTEN TÜRER, SÜSTEN DEĞİL.** Referansta akan şey pandomimcinin
// koluydu; nüfus karoselinde 1800→2100 nüfus EĞRİSİ, beş şart karoselinde kemer dizisi.
// Üçü de dekoratif değil anlatının parçası: kaydırma hareketi hikâyeyi anlatıyor.
// Bant bir süsleme olsaydı silinebilirdi; içerikten türediği için silinemez.
//
// ⚠ **Dilimleme ImageMagick'siz:** sahne `translateX(-i × genislik)` ile kaydırılıp her
// slayt ayrı ekran görüntüsü olarak alınıyor. Görüntü kütüphanesi bir bağımlılık olurdu
// (R-75) ve tarayıcı zaten elimizde — kırpma işini yapan şey viewport'un kendisi.
//
// ⚠ **Tipografi CANLI kalıyor** (R-20): metin hiçbir aşamada rasterleşmiyor, glif ölçümü
// ve `notdef` sayımı panorama çıktısında da çalışıyor.

import type { AssetStamp } from '@suite/kernel'
import { withPage, type BrowserResult, type Oturum, type Page } from './browser.js'
import { kacir } from './html.js'
import { vurguyuIsaretle } from './sablon-tipo.js'

/** Kesimi aşan sürekli bant — kimliğin taşıyıcısı. */
export type Bant =
  | {
      /**
       * Veriden çizilen eğri. `noktalar` 0–100 arası normalize; x tüm panoramaya,
       * y tuval yüksekliğine göre.
       *
       * ⚠ Nokta sayısı içeriğin kendi çözünürlüğü: 27 yıllık nüfus verisi 27 nokta.
       * Yumuşatmak için nokta EKLENMİYOR — eğri veri noktalarının üstünden geçiyor.
       */
      readonly tip: 'egri'
      readonly noktalar: readonly { readonly x: number; readonly y: number }[]
      /** Kilometre taşları: eğrinin üstünde etiketli noktalar. */
      readonly kilometre: readonly { readonly x: number; readonly etiket: string }[]
    }
  | {
      /** Kemer dizisi — mimari/ritmik konularda eğrinin karşılığı. */
      readonly tip: 'kemer'
      readonly sayi: number
      readonly madalyon: readonly { readonly x: number; readonly no: string; readonly ad: string }[]
    }
  | { readonly tip: 'yok' }

/** Bir kartın veri paneli — slayda özgü görsel biçim. */
export type Panel =
  | {
      readonly tip: 'cubuklar'
      readonly baslik: string
      readonly satirlar: readonly {
        readonly etiket: string
        readonly deger: number
        readonly not: string
        readonly tahmin: boolean
      }[]
    }
  | {
      readonly tip: 'sayilar'
      readonly ogeler: readonly {
        readonly deger: string
        readonly birim: string
        readonly alt: string
      }[]
    }
  | {
      readonly tip: 'vafel'
      readonly baslik: string
      readonly toplam: number
      readonly dolu: number
    }
  | {
      readonly tip: 'liste'
      readonly baslik: string
      readonly ogeler: readonly { readonly no: string; readonly ad: string }[]
    }
  | { readonly tip: 'etiketler'; readonly ogeler: readonly string[] }

/** Bir slaydın içeriği. */
export interface Kart {
  /** Küçük büyük harf üst başlık — bölüm adı. */
  readonly ustBaslik: string
  /** Başlık; `**vurgu**` işareti aksan rengine dönüşüyor. */
  readonly baslik: string
  readonly govde: string
  readonly panel: Panel | null
  /** Arkadaki dev soluk metin — kesim çizgilerini KASTEN aşıyor. */
  readonly hayalet: string
  /** Alt ray: sol (dönem/bölüm) ve orta (kaynak). */
  readonly rayaSol: string
  readonly rayaOrta: string
}

export interface PanoramaBelgesi {
  readonly slaytGenisligi: number
  readonly yukseklik: number
  readonly kartlar: readonly Kart[]
  readonly bant: Bant
  readonly tokenCss: string
  readonly fontCss?: string
  readonly stamp: AssetStamp
}

const AKSAN = 'var(--role-bg)'
const ZEMIN = 'var(--role-line-edge)'
const METIN = 'var(--role-surface)'

/**
 * Panelin HTML'i.
 *
 * ⚠ Her panel TEK renkte (aksan): tek seri veride ikinci bir renk ayrım değil gürültü
 * üretir. Ayrım gerektiğinde opaklık ve kesikli kenarla yapılıyor — tahmin edilen değer
 * kesikli çerçeve alıyor, ölçülen değer dolu.
 */
const panelHtml = (p: Panel): string => {
  if (p.tip === 'cubuklar') {
    const enBuyuk = Math.max(...p.satirlar.map((s) => s.deger), 1)
    return (
      `<div class="panel"><div class="panel-baslik">${kacir(p.baslik)}</div>` +
      p.satirlar
        .map(
          (s) =>
            `<div class="cubuk-satir"><span class="cubuk-etiket">${kacir(s.etiket)}</span>` +
            `<span class="cubuk${s.tahmin ? ' tahmin' : ''}" style="width:${Math.round((s.deger / enBuyuk) * 100)}%"></span>` +
            `<span class="cubuk-not">${kacir(s.not)}</span></div>`
        )
        .join('') +
      `</div>`
    )
  }
  if (p.tip === 'sayilar')
    return (
      `<div class="sayilar">` +
      p.ogeler
        .map(
          (o) =>
            `<div class="sayi-kart"><div class="sayi">${kacir(o.deger)}` +
            `<span class="birim">${kacir(o.birim)}</span></div>` +
            `<div class="sayi-alt">${kacir(o.alt)}</div></div>`
        )
        .join('') +
      `</div>`
    )
  if (p.tip === 'vafel') {
    const kareler = Array.from(
      { length: p.toplam },
      (_, i) => `<span class="vafel-kare${i < p.dolu ? ' dolu' : ''}"></span>`
    ).join('')
    return (
      `<div class="panel"><div class="panel-baslik">${kacir(p.baslik)}</div>` +
      `<div class="vafel">${kareler}</div></div>`
    )
  }
  if (p.tip === 'liste')
    return (
      `<div class="panel"><div class="panel-baslik">${kacir(p.baslik)}</div>` +
      p.ogeler
        .map(
          (o) =>
            `<div class="liste-satir"><span class="liste-no">${kacir(o.no)}</span>` +
            `<span class="liste-ad">${kacir(o.ad)}</span></div>`
        )
        .join('') +
      `</div>`
    )
  return (
    `<div class="etiketler">` +
    p.ogeler.map((o) => `<span class="etiket">${kacir(o)}</span>`).join('') +
    `</div>`
  )
}

/**
 * Sürekli bandın SVG'si — TÜM panorama genişliğinde tek bir çizim.
 *
 * ⚠ ⚠ **Tek SVG, slayt başına bir tane DEĞİL.** Slayt başına çizilseydi her parçanın
 * kendi koordinat sistemi olurdu ve kesim çizgisinde eğri kırılırdı; tam olarak
 * "sürekliliği ima etme" hatasının kaynağı bu.
 * ⚠ `preserveAspectRatio="none"`: bant yatayda 6× gerilirken dikey oranı korumamalı —
 * gerilen bir eğri hâlâ aynı eğridir, gerilen bir daire elips olur (o yüzden madalyonlar
 * ayrı katmanda, gerilmemiş bir SVG'de).
 */
const bantSvg = (b: Bant, toplamGenislik: number, yukseklik: number): string => {
  if (b.tip === 'yok') return ''
  if (b.tip === 'egri') {
    const d = b.noktalar.map((n, i) => `${i === 0 ? 'M' : 'L'} ${n.x} ${n.y}`).join(' ')
    const dolgu = `${d} L 100 100 L 0 100 Z`
    return (
      `<svg class="bant" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">` +
      `<defs><linearGradient id="bant-dolgu" x1="0" y1="0" x2="0" y2="1">` +
      `<stop offset="0" stop-color="${AKSAN}" stop-opacity="0.22"/>` +
      `<stop offset="1" stop-color="${AKSAN}" stop-opacity="0"/></linearGradient></defs>` +
      `<path d="${dolgu}" fill="url(#bant-dolgu)"/>` +
      `<path d="${d}" fill="none" stroke="${AKSAN}" stroke-width="0.22" ` +
      `vector-effect="non-scaling-stroke"/></svg>` +
      b.kilometre
        .map(
          (k) =>
            `<div class="kilometre" style="left:${(k.x / 100) * toplamGenislik}px">` +
            `<span class="kilometre-nokta"></span>` +
            `<span class="kilometre-etiket">${kacir(k.etiket)}</span></div>`
        )
        .join('')
    )
  }
  // Kemer dizisi: yatayda tekrarlayan yay, aralar eşit.
  const adim = toplamGenislik / b.sayi
  const kemerler = Array.from({ length: b.sayi }, (_, i) => {
    const x = i * adim
    return (
      `<path d="M ${x} ${yukseklik} L ${x} ${yukseklik - 52} ` +
      `Q ${x + adim / 2} ${yukseklik - 132} ${x + adim} ${yukseklik - 52} ` +
      `L ${x + adim} ${yukseklik}" fill="none" stroke="${AKSAN}" stroke-width="1.6" opacity="0.5"/>`
    )
  }).join('')
  return (
    `<svg class="bant-kemer" viewBox="0 0 ${toplamGenislik} ${yukseklik}" ` +
    `preserveAspectRatio="none" aria-hidden="true">${kemerler}</svg>` +
    b.madalyon
      .map(
        (m) =>
          `<div class="madalyon" style="left:${(m.x / 100) * toplamGenislik}px">` +
          `<span class="madalyon-no">${kacir(m.no)}</span>` +
          `<span class="madalyon-ad">${kacir(m.ad)}</span></div>`
      )
      .join('')
  )
}

/** Panoramanın tam HTML'i — tek sayfa, `slaytSayisi × slaytGenisligi` genişlikte. */
export const panoramaHtml = (doc: PanoramaBelgesi): string => {
  const n = doc.kartlar.length
  const G = doc.slaytGenisligi
  const toplam = n * G
  const kartlar = doc.kartlar
    .map(
      (k, i) =>
        `<section class="kart" style="left:${i * G}px;width:${G}px">` +
        `<div class="hayalet" aria-hidden="true">${kacir(k.hayalet)}</div>` +
        `<div class="ust-baslik">${kacir(k.ustBaslik)}</div>` +
        `<h2 class="baslik">${vurguyuIsaretle(kacir(k.baslik))}</h2>` +
        (k.govde === '' ? '' : `<p class="govde">${vurguyuIsaretle(kacir(k.govde))}</p>`) +
        (k.panel === null ? '' : panelHtml(k.panel)) +
        `<div class="ray"><span>${kacir(k.rayaSol)}</span>` +
        `<span>${kacir(k.rayaOrta)}</span>` +
        `<span class="ray-sayac">${String(i + 1).padStart(2, '0')} / ${String(n).padStart(2, '0')}</span></div>` +
        `</section>`
    )
    .join('')

  return [
    // ⚠ ⚠ **YÜZEY BEYAN EDİLMEK ZORUNDA.** `kreatif` rolleri `[data-surface='kreatif']`
    // altında tanımlı; beyan edilmezse tarayıcı KONSOL yüzeyine düşüyor ve koyu zeminli
    // bir şablon BEYAZ çıkıyor. İlk render'da tam bu oldu — `static.ts` bunu zaten
    // yapıyordu, panorama yolu onu tekrarlamadı.
    '<!doctype html><html lang="tr" data-surface="kreatif"><meta charset="utf-8">',
    `<meta name="generator" content="${kacir(doc.stamp.brandId)}/${kacir(doc.stamp.eraId)}">`,
    '<style>',
    doc.tokenCss,
    doc.fontCss ?? '',
    `  * { margin: 0; padding: 0; box-sizing: border-box }`,
    `  body { width: ${toplam}px; height: ${doc.yukseklik}px; overflow: hidden;`,
    `         background: ${ZEMIN}; color: ${METIN};`,
    `         font-family: "Marka Metin", system-ui, sans-serif; }`,
    // ⚠ Sahne kaydırılıyor, gövde değil: `translateX` bileşik katmanda çalışıyor ve
    // ekran görüntüsü her karede tutarlı çıkıyor.
    `  #sahne { position: relative; width: ${toplam}px; height: ${doc.yukseklik}px;`,
    `           transform: translateX(0px); }`,
    // ⚠ Kart bir FLEX SÜTUNU: panel `margin-top:auto` ile aşağı itiliyor ve kartın alt
    // yarısı boş kalmıyor. İlk render'da her şey üste yığılmış, alt %60 bomboştu.
    `  .kart { position: absolute; top: 0; height: ${doc.yukseklik}px; padding: 68px 64px 190px;`,
    `          display: flex; flex-direction: column; align-items: flex-start }`,
    // ── kesim çizgisi: hiçbir ögeyi kırpmıyor, yalnız ince bir ayraç ─────────
    `  .kesik { position: absolute; top: 0; bottom: 0; width: 1px;`,
    `           background: rgba(255,255,255,0.06); z-index: 9 }`,
    `  .ust-baslik { font-size: 19px; letter-spacing: 0.22em; text-transform: none;`,
    `                color: ${AKSAN}; font-weight: 700; margin-bottom: 26px;`,
    `                display: flex; align-items: center; gap: 14px }`,
    `  .ust-baslik::before { content: ""; width: 30px; height: 2px; background: ${AKSAN} }`,
    // ⚠ Başlık SIKIŞIK ve İRİ; `line-height` 1,04 — 0,90'da Türkçe `Ş` kuyruğu alt satıra
    // giriyor ve "HEB" gibi okunuyor. Aksan kırpılması bu ailenin bilinen tuzağı.
    `  .baslik { font-family: "Marka Display", "Marka Metin", sans-serif;`,
    `            font-size: 82px; line-height: 1.04; font-weight: 800; font-stretch: 88%;`,
    `            letter-spacing: -0.02em; max-width: 15ch }`,
    `  .baslik strong { color: ${AKSAN}; font-weight: inherit }`,
    `  .govde { margin-top: 24px; font-size: 27px; line-height: 1.5; max-width: 34ch;`,
    `           color: rgba(255,255,255,0.72) }`,
    `  .govde strong { color: ${METIN}; font-weight: 700 }`,
    // ⚠ Dev soluk metin kesim çizgilerini KASTEN aşıyor: kesintisizliğin en görünür işareti.
    // ⚠ Dev soluk metin: BÜYÜK ve kesim çizgilerini aşacak kadar aşağıda. İlk sürümde
    // 300 px ve %4,5 opaklıkla başlığın arkasında kalıyor, hiç okunmuyordu — referansta
    // ghost'lar kesintisizliğin en görünür işareti.
    `  .hayalet { position: absolute; left: 30px; top: 300px; font-size: 470px;`,
    `             font-family: "Marka Display", sans-serif; font-weight: 800;`,
    `             color: rgba(255,255,255,0.055); letter-spacing: -0.05em;`,
    `             pointer-events: none; white-space: nowrap; z-index: 0 }`,
    // ⚠ ⚠ **`.ray` HARİÇ.** İlk sürüm `:not(.hayalet)` diyordu ve `.ray`in
    // `position: absolute`ını EZİYORDU: alt ray akışa girip gövde metninin hemen altına
    // düşüyor, künye kartın ortasında duruyordu. Bakınca görüldü.
    `  .kart > *:not(.hayalet):not(.ray) { position: relative; z-index: 2 }`,
    // ── paneller ────────────────────────────────────────────────────────────
    `  .panel { margin-top: auto; background: rgba(255,255,255,0.045); border-radius: 14px;`,
    `           padding: 26px 28px; max-width: 640px }`,
    `  .panel-baslik { font-size: 16px; letter-spacing: 0.16em; color: rgba(255,255,255,0.5);`,
    `                  margin-bottom: 18px; font-weight: 600 }`,
    `  .cubuk-satir { display: flex; align-items: center; gap: 12px; margin-bottom: 11px }`,
    `  .cubuk-etiket { width: 64px; font-size: 18px; color: rgba(255,255,255,0.6) }`,
    `  .cubuk { height: 20px; background: ${AKSAN}; border-radius: 3px; min-width: 6px }`,
    `  .cubuk.tahmin { background: none; border: 2px dashed ${AKSAN}; opacity: 0.75 }`,
    `  .cubuk-not { font-size: 17px; color: rgba(255,255,255,0.75); white-space: nowrap }`,
    `  .sayilar { display: flex; gap: 18px; margin-top: auto; flex-wrap: wrap }`,
    `  .sayi-kart { background: rgba(255,255,255,0.045); border-radius: 14px; padding: 22px 26px }`,
    `  .sayi { font-family: "Marka Display", sans-serif; font-size: 74px; font-weight: 800;`,
    `          color: ${AKSAN}; line-height: 1 }`,
    `  .birim { font-size: 26px; margin-left: 8px; color: rgba(255,255,255,0.7) }`,
    `  .sayi-alt { font-size: 18px; color: rgba(255,255,255,0.6); margin-top: 8px }`,
    `  .vafel { display: grid; grid-template-columns: repeat(10, 1fr); gap: 5px; width: 300px }`,
    `  .vafel-kare { width: 100%; aspect-ratio: 1; background: rgba(255,255,255,0.09);`,
    `                border-radius: 2px }`,
    `  .vafel-kare.dolu { background: ${AKSAN} }`,
    `  .liste-satir { display: flex; gap: 14px; align-items: baseline; margin-bottom: 10px }`,
    `  .liste-no { font-family: "Marka Display", sans-serif; font-size: 22px; color: ${AKSAN};`,
    `              font-weight: 800; min-width: 32px }`,
    `  .liste-ad { font-size: 22px }`,
    `  .etiketler { display: flex; flex-wrap: wrap; gap: 10px; margin-top: auto; max-width: 620px }`,
    `  .etiket { border: 1px solid rgba(255,255,255,0.16); border-radius: 999px;`,
    `            padding: 8px 16px; font-size: 18px; color: rgba(255,255,255,0.8) }`,
    // ── bant ────────────────────────────────────────────────────────────────
    // ⚠ Bant 560 px: 300 px'te eğri dibe yapışıyor ve "hikâye" okunmuyordu. Yükseklik
    // eğrinin anlatabileceği fark kadar olmalı.
    `  .bant, .bant-kemer { position: absolute; left: 0; bottom: 120px;`,
    `                       width: ${toplam}px; height: 560px; z-index: 1 }`,
    `  .kilometre { position: absolute; bottom: 120px; z-index: 3; transform: translateX(-50%);`,
    `               text-align: center }`,
    `  .kilometre-nokta { display: block; width: 13px; height: 13px; border-radius: 50%;`,
    `                     background: ${AKSAN}; margin: 0 auto 8px }`,
    `  .kilometre-etiket { font-size: 16px; letter-spacing: 0.1em; color: ${METIN};`,
    `                      white-space: nowrap; font-weight: 600 }`,
    `  .madalyon { position: absolute; bottom: 128px; z-index: 3; transform: translateX(-50%);`,
    `              text-align: center }`,
    `  .madalyon-no { display: flex; width: 46px; height: 46px; border-radius: 50%;`,
    `                 border: 2px solid ${AKSAN}; color: ${AKSAN}; align-items: center;`,
    `                 justify-content: center; font-weight: 800; margin: 0 auto 7px;`,
    `                 background: ${ZEMIN} }`,
    `  .madalyon-ad { font-size: 15px; letter-spacing: 0.14em; color: rgba(255,255,255,0.75) }`,
    // ── alt ray: her slaytta aynı yerde, ritmi taşıyan tekrar ────────────────
    `  .ray { position: absolute; left: 64px; right: 64px; bottom: 46px;`,
    `         display: flex; gap: 40px; align-items: center;`,
    `         border-top: 1px solid rgba(255,255,255,0.1); padding-top: 20px;`,
    `         font-size: 15px; letter-spacing: 0.14em; color: rgba(255,255,255,0.42) }`,
    `  .ray-sayac { margin-left: auto; color: ${AKSAN}; font-weight: 700 }`,
    '</style>',
    `<body data-surface="kreatif"><div id="sahne">`,
    bantSvg(doc.bant, toplam, doc.yukseklik),
    kartlar,
    Array.from(
      { length: n - 1 },
      (_, i) => `<div class="kesik" style="left:${(i + 1) * G}px"></div>`
    ).join(''),
    `</div></body></html>`,
  ].join('\n')
}

/**
 * Panoramayı render eder ve dilimler.
 *
 * ⚠ ⚠ **TEK SAYFA, N EKRAN GÖRÜNTÜSÜ.** Sayfa bir kez kuruluyor ve fontlar bir kez
 * yükleniyor; sahne her karede `translateX(-i × G)` ile kaydırılıyor. Alternatif —
 * geniş tuvali tek seferde çekip PNG'yi dilimlemek — bir görüntü kütüphanesi bağımlılığı
 * isterdi (R-75) ve kırpma işini viewport zaten bedava yapıyor.
 *
 * ⚠ **Font beklemesi bir kez ve BAŞTA.** `document.fonts.ready` her kare için beklenseydi
 * ilk karede yüklü olan zaten sonrakilerde de yüklü olurdu — ama beklememek, ilk karenin
 * fallback glifle çıkması demekti (§7.2).
 */
export const renderPanorama = async (
  doc: PanoramaBelgesi,
  ciktiYollari: readonly string[],
  oturum?: Oturum
): Promise<BrowserResult<{ readonly yollar: readonly string[]; readonly genislik: number }>> => {
  if (ciktiYollari.length !== doc.kartlar.length)
    return {
      ok: false,
      error: {
        kind: 'render_failed',
        message: `yol sayısı kart sayısıyla uyuşmuyor: ${ciktiYollari.length} ≠ ${doc.kartlar.length}`,
      },
    }
  // ⚠ Oturum verilirse onun sayfası: tarayıcı zaten açıksa ikinciyi açmak, aynı koşuda
  // iki font yüklemesi ve iki kez bekleme demek (`static.ts` ile aynı gerekçe).
  const calistir = <T>(fn: (page: Page) => Promise<T>): Promise<BrowserResult<T>> =>
    oturum === undefined ? withPage(fn) : oturum.sayfaIle(fn)
  return calistir(async (page) => {
    await page.setViewportSize({ width: doc.slaytGenisligi, height: doc.yukseklik })
    await page.setContent(panoramaHtml(doc), { waitUntil: 'load' })
    await page.evaluate('(async () => { await document.fonts.ready; return true })()')
    for (const [i, yol] of ciktiYollari.entries()) {
      await page.evaluate(
        `document.getElementById('sahne').style.transform = 'translateX(${-i * doc.slaytGenisligi}px)'`
      )
      await page.screenshot({ path: yol, type: 'png' })
    }
    return { yollar: ciktiYollari, genislik: doc.slaytGenisligi }
  })
}
