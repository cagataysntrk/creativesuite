// Tasarım rehberi §10 — "bitti" sayılmanın ALTI ÖLÇÜTÜ, katalogun ALTI şablonunda.
//
// ⚠ ⚠ **REHBER YAZILIYDI AMA HİÇBİR ŞEYE BAĞLI DEĞİLDİ.** Ölçütler `docs/referans/
// tasarim-rehberi.md` §10'da duruyor ve orada durdukları sürece bir NİYET beyanı;
// bir şablon onları bozarak eklenebilir ve hiçbir şey kırmızıya dönmez.
//
// ⚠ ⚠ **REHBERİN ATIF YAPTIĞI FONKSİYONLAR BU BELGEYE UYMUYOR.** §10 `tasarimOlc`,
// `olcekDisiBosluklar`, `kompozisyonMerkezi` diyor; üçü de `DocumentModel` alıyor, yani
// SLAYT-BAŞINA yolun ölçüm araçları. Panorama belgesi onlara girmiyor. Ölçütler bu
// yüzden panorama VERİSİNDEN doğrudan hesaplanıyor — rehberi kopyalamak yerine aynı
// soruyu bu belgenin diliyle sormak. Ölçüt 6 (görsel dikdörtgen değil) burada YOK:
// gerçek bir fotoğraf gerektiriyor ve koşuda `matlama-tutmuyor` denetimi ölçüyor.

import { describe, expect, it } from 'vitest'
import { sablonBul } from '@suite/contracts'
import { ORNEKLER } from './katalog-ornek.js'
import type { KatalogOrnegi } from './katalog-ornek.js'

/** Kesim çizgilerinin panorama yüzdesi olarak yeri: N kart → N−1 kesim. */
const kesimler = (o: KatalogOrnegi): readonly number[] =>
  Array.from({ length: o.kartlar.length - 1 }, (_, i) => ((i + 1) * 100) / o.kartlar.length)

/** `[a,b]` aralığı en az bir kesimi AŞIYOR mu — dokunmak yetmez, geçmek gerek. */
const asiyorMu = (o: KatalogOrnegi, a: number, b: number): boolean =>
  kesimler(o).some((k) => Math.min(a, b) < k && k < Math.max(a, b))

/** Kesimi aşan ögeleri sayar: görsel yuvası · bant · leke · alan sınırı. */
const kesimiAsanlar = (o: KatalogOrnegi): readonly string[] => {
  const bulunan: string[] = []
  for (const g of o.gorseller) {
    if (asiyorMu(o, g.x, g.x + g.genislik)) bulunan.push(`gorsel@${g.x}`)
  }
  const b = o.bant
  if (b.tip === 'ok') {
    for (const ok of b.oklar) if (asiyorMu(o, ok.x1, ok.x2)) bulunan.push(`ok@${ok.x1}`)
  }
  // ⚠ Eğri ve kemer panoramanın TAMAMINI kat ediyor: tanım gereği her kesimi aşarlar.
  if (b.tip === 'egri' || b.tip === 'kemer') bulunan.push(`bant:${b.tip}`)
  for (const l of o.lekeler ?? []) {
    // Leke boyutu PİKSEL, x yüzde: yarıçapı panorama yüzdesine çeviriyoruz.
    const yariCap = (l.boyut / 2 / (o.slaytGenisligi * o.kartlar.length)) * 100
    if (asiyorMu(o, l.x - yariCap, l.x + yariCap)) bulunan.push(`leke@${l.x}`)
  }
  // ⚠ Alan sınırı tanımı gereği panoramayı boydan boya bölüyor.
  if (o.alanSiniri !== undefined) bulunan.push('alanSiniri')
  return bulunan
}

describe('tasarım rehberi §10 — katalog kabul ölçütleri', () => {
  for (const [id, o] of Object.entries(ORNEKLER)) {
    describe(id, () => {
      // ── Ölçüt 3: en az bir öge kesim çizgisini AŞIYOR ────────────────────
      //
      // ⚠ İstisna YOK ve bu kasıtlı: karoselin tek yapısal iddiası süreklilik. Bir şablon
      // bunu kuramıyorsa katalogda değil, tekil gönderi hattında olmalı.
      it('ölçüt 3 · en az bir öge kesimi aşıyor', () => {
        const asan = kesimiAsanlar(o)
        expect(
          asan.length,
          `${id}: hiçbir öge kesimi aşmıyor — süreklilik İDDİA EDİLİP kurulmamış`
        ).toBeGreaterThan(0)
      })

      // ── Ölçüt 4: en az bir öge başka bir ögeyle KATMANLANIYOR ────────────
      it('ölçüt 4 · katmanlanma var', () => {
        // ⚠ ⚠ **HAYALET KATMANLANMANIN TEK YOLU DEĞİL — ölçüt onu SANIYORDU.** Hayalet
        // altı şablondan da kaldırılınca (D-299) bu ölçüt kırıldı ve bir an "eşik yanlış"
        // gibi göründü. Yanlış olan eşik değil, LİSTEYDİ: `ustDoku` kartların ÜSTÜNDE
        // gren+vinyet çiziyor, `alanSiniri` tuvali iki alana bölüyor — ikisi de gerçek
        // katmanlanma ve ikisi de sayılmıyordu.
        const hayaletVar = o.kartlar.some((k) => k.hayalet.trim() !== '')
        const katman =
          hayaletVar ||
          o.gorseller.length > 0 ||
          (o.lekeler ?? []).length > 0 ||
          o.ustDoku !== undefined ||
          o.alanSiniri !== undefined
        expect(katman, `${id}: hiçbir öge katmanlanmıyor — düz bir yerleşim`).toBe(true)
      })

      // ── Ölçüt 5: zemin en az İKİ katmanlı ────────────────────────────────
      //
      // ⚠ Tek katmanlı zemin = düz renk = "web arka planı". İki katman en az bir degrade
      // ve bir vinyet/ışık demek; rehber §5'in ölçülebilir hâli.
      it('ölçüt 5 · zemin en az iki katmanlı', () => {
        // ⚠ ⚠ **İLK ÖLÇÜM YALNIZ `zeminDokusu`YA BAKIYORDU ve üç şablonu haksız yere
        // kırmızıya düşürdü.** Katmanlı zemin bu belgede ÜÇ ayrı mekanizmayla kuruluyor:
        // dokuya ek olarak `alanSiniri` (iki alan + aralarında sınır) ve tam kaplama
        // fotoğraf (fotoğraf + üstündeki metin katmanı). Ölçüt "iki katman" diyor; aracın
        // tek mekanizma tanıması aracın eksiğidir, şablonun değil.
        const doku = o.zeminDokusu?.katmanlar.length ?? 0
        const tamKaplama = o.gorseller.some((g) => g.kirpma === 'tam')
        // ⚠ `ustDoku` DÖRDÜNCÜ mekanizma: kartların ÜSTÜNDE gren + vinyet. `donen`in
        // opak kart renkleri panorama zeminini tamamen örttüğü için tek çözüm buydu.
        const katmanli =
          doku >= 2 || o.alanSiniri !== undefined || tamKaplama || o.ustDoku !== undefined
        expect(
          katmanli,
          `${id}: zemin tek katmanlı (doku ${doku}) — düz renk web arka planıdır`
        ).toBe(true)
      })
    })
  }

  // ── Ölçüt 1 ve 2: TİPOGRAFİ ve BOŞLUK — belge değil, motor özellikleri ──
  //
  // ⚠ İkisi de `panorama.ts`in sabitlerinde ve tüm şablonlar için aynı; şablon başına
  // ölçmek aynı sayıyı altı kez doğrulamak olurdu.
  it('ölçüt 1 · en büyük/en küçük punto oranı ≥ 6', () => {
    // Hayalet rakam kartın en büyük ögesi, alt ray en küçüğü. Oran reçeteden okunuyor.
    // ⚠ ⚠ **İLK FORMÜL UYDURMAYDI: hayalet puntosunu `baslikPayi` ile çarpıyordu.**
    // `panorama.ts`te hayalet `470 * olcek` px; başlıkla hiçbir ilgisi yok. Yanlış formül
    // `donen`i 5,9'da gösterdi ve gerçek eksiği (hayaletin HİÇ olmaması) maskeledi —
    // yanlış bir ölçüm yalnız yanlış cevap vermiyor, DOĞRU soruyu da gizliyor.
    const oranlar = Object.entries(ORNEKLER).map(([id, o]) => {
      const hayaletVar = o.kartlar.some((k) => k.hayalet.trim() !== '')
      const buyuk = hayaletVar
        ? 470 * (o.hayaletKonumu?.olcek ?? 1)
        : 96 * (o.tipografi?.baslikPayi ?? 1)
      const kucuk = 13 // `.ray` punto — `panorama.ts` sabiti
      return [id, buyuk / kucuk] as const
    })
    for (const [id, oran] of oranlar) {
      expect(
        oran,
        `${id}: punto oranı ${oran.toFixed(1)} — hiyerarşi zayıf`
      ).toBeGreaterThanOrEqual(6)
    }
  })
})

// ⚠ ⚠ **YUVA SAYISI = VARYANT SAYISI — "ilan ile gerçek" ayrışmasının yeni yüzü.**
// Varyant, yuva başına kadraj tarifi; sıra varyant sayısını aşınca brief BOŞ dönüyor ve
// görsel adımı atlanıyor (kasıtlı: fazlalık adım para harcamasın). Ama şablon yuvadan az
// varyant taşırsa aynı mekanizma sessizce bir yuvayı YER TUTUCU bırakıyor. `editoryal`
// üç yuvaya geçtiğinde tam bu oldu: iki varyantla kaldı ve kimse fark etmedi.
describe('katalog değişmezi: yuva sayısı = varyant sayısı', () => {
  for (const [id, o] of Object.entries(ORNEKLER)) {
    it(`${id} · ${o.gorseller.length} yuva`, () => {
      const kayit = sablonBul(id)
      const varyantlar = kayit?.gorsel?.varyantlar ?? []
      // Görselsiz şablonun varyantı da olmamalı: kullanılmayan bir tarif, ölü sözleşme.
      expect(
        varyantlar.length,
        `${id}: ${o.gorseller.length} yuva, ${varyantlar.length} varyant`
      ).toBe(o.gorseller.length)
    })
  }
})
