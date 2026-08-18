// Fiil gövdeleri — FAZ 3 hattının çalışan kısmı (§3.10, §10 · FAZ-3.14).
//
// **Gövdeler motorda değil, motorun ÜSTÜNDE yaşar.** Kernel'in `VERB_TABLE`ı sözleşmedir
// (ad, yan etki sınıfı, metered); gövdeler o sözleşmenin üstüne buradan yerleştirilir ve
// `resolveVerb` her çağrıda uyuşmayı doğrular (D-69).
//
// **Her gövde TEK yan etki sınıfına sadık** (R-04): `COMPOSE` saf, `RENDER` yalnız
// Chromium, `GENERATE` yalnız sağlayıcı. `COMPOSE`un sessizce bir model çağırması,
// çalıştırma öncesi maliyet tahminini yalan yapardı.

import type { AppError, Result, ToleranceReading, VerbName } from '@suite/contracts'
import { ZERO_USD, err, ok } from '@suite/contracts'
import {
  asciiLower,
  getVerb,
  makeError,
  validateDocument,
  type AssetStamp,
  type Block,
  type DocumentModel,
  type Verb,
  type VerbContext,
  type VerbOutput,
} from '@suite/kernel'
import {
  captureProductShot,
  deckPages,
  isLinkedinDocError,
  paginateDocument,
  promptRequestsPerson,
  renderDeckPdf,
  renderLinkedinDocument,
  LINKEDIN_PLATFORM_MAX_SAYFA,
  renderStatic,
  withOturum,
  renderWithinLimit,
  type LayoutName,
  ornekBul,
  panoramaDenetle,
  renderPanorama,
  type PanoramaBelgesi,
} from '@suite/render'
import { uyarla, uyarlamaIstemi, type Uyarlama, type UyarlamaKarti } from '../plan/sablon-uyarla.js'
import { sablonSec } from '../plan/sablon-sec.js'
import { duzeltilebilir, duzeltmeIstemi, type DenetimKusuru } from '../plan/denetim-turu.js'
import { sablonBul } from '@suite/contracts'
import type { KatalogOrnegi } from '@suite/render'
import {
  duzMetin,
  gorselBriefPromptu,
  icerikPromptu,
  metneCevir,
  type PromptKaydi,
  akisiAyir,
  karsilastirmayiAyir,
} from '../metin-akisi.js'
import { yargiPromptu, yargiyaCevir, type YargiBulgusu } from '../gorsel-yargi.js'
import {
  tasarimYargiPromptu,
  tasarimYargisinaCevir,
  toplamPuan,
  type TasarimYargisi,
} from '../tasarim-yargi.js'
import {
  fetchSource,
  isIngestFailure,
  planWaterfall,
  provenanceJson,
  publish,
  refusalMessage,
  type ProviderAdapter,
  type ProviderInput,
  type PublishAsset,
  type PublishRequest,
  type PublishingLimit,
  type TokenKaydi,
} from '@suite/providers'
import { RateLimiter } from '../ratelimit.js'
import { appendPublished, lookupPublished } from '../publish-ledger.js'
import { aileSec, tasarla } from '../plan/tasarla.js'
import { yay } from '@suite/contracts'
import { planDenetle, uyumsuzlukOzeti } from '@suite/render'
import type { Islev } from '@suite/kernel'
import type { TasarimPlani } from '@suite/contracts'
import type { Yuva } from '../metin-akisi.js'
import { providerCall } from '../provider-call.js'
import { prospectDeckZinciri } from '../prospect-deck.js'
import type { Kaynak, KisiselAlan } from '@suite/kernel'
import { dirname, join } from 'node:path'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'

/** Gövdelere geçen girdi. `inputs` önceki adımların çıktıları — id ile anahtarlı. */
export interface BodyInput {
  readonly constraints: Readonly<Record<string, unknown>>
  readonly inputs: Readonly<Record<string, unknown>>
  /**
   * Yönlendiricinin SEÇTİĞİ sağlayıcı. Yalnız metered + yetenekli adımlarda dolu.
   *
   * Gövde bunu bilmeden `providerCall`ı kuramaz; ilk sürümde aktarılmıyordu ve
   * `providerCall` üretimden hiç çağrılmıyordu (D-141).
   */
  readonly providerId?: string
  /**
   * **Adımın yeteneği** — `image.generate`, `text.generate`…
   *
   * ⚠ Eskiden yoktu ve `generateBody` yeteneği KURULUM anında alıyordu
   * (`capability: 'image.generate'`). Tek bir gövde tüm `GENERATE` adımlarına
   * hizmet ettiği için metin adımı da görsel yeteneğiyle koşuyor ve
   * `CAPABILITY_UNSUPPORTED` alıyordu (D-241). Yetenek adımın VERİSİDİR, gövdenin
   * yapılandırması değil.
   */
  readonly capability?: string
  /**
   * Bu adımın BAĞIMLILIKLARI — hangi adımların çıktısını okumaya hakkı var.
   *
   * ⚠ Görsel adımı brief'i `Object.values(inputs)` içinde ARIYORDU ve ilk metin
   * çıktısını alıyordu: `metin-uret`in TÜRKÇE gönderi metni `gorsel-brief`ten önce
   * geliyor, görsel prompt'u Türkçe oluyor ve R-20 haklı olarak reddediyordu
   * (`matched: "cümle"`). **Bir adım, bağlanmadığı bir adımın çıktısını okumamalı** —
   * DAG zaten bunu söylüyordu, gövde onu duymuyordu (D-246).
   */
  readonly needs?: readonly string[]
  /** Motorun tutamak köprüsü — sağlayıcı iş kimliğini verir vermez çağrılır (R-44). */
  readonly noteHandle?: (externalId: string) => void
  /** Önceki çalıştırmadan kalan tutamak. `null` değilse YENİ çağrı yapılmaz. */
  readonly resumeExternalId?: string | null
}

const hata = (
  kind: AppError['kind'],
  code: string,
  ctx: VerbContext,
  details: Readonly<Record<string, unknown>> = {}
): AppError =>
  makeError({
    kind,
    code,
    userMessageKey: `error.verb.${asciiLower(code)}`,
    correlationId: ctx.correlationId,
    details,
  })

/**
 * Sözleşmeyi kernel'den alıp gövdeyi üstüne koyar.
 *
 * `name`, `effectClass` ve `metered` **kernel'den kopyalanır**, elle yazılmaz: elle
 * yazılsaydı bir gövde `metered: false` diyerek bütçe kapısını atlayabilirdi (D-17) ve
 * `resolveVerb` de o yalanı doğrulardı — çünkü karşılaştırdığı şey aynı yalan olurdu.
 */
const govde = (
  name: VerbName,
  run: (ctx: VerbContext, input: BodyInput) => Promise<Result<VerbOutput, AppError>>
): Verb => {
  const sozlesme = getVerb(name)
  return {
    name: sozlesme.name,
    effectClass: sozlesme.effectClass,
    metered: sozlesme.metered,
    plan: sozlesme.plan,
    run: run as Verb['run'],
  }
}

// ── RESOLVE: tarif + registry → adım DAG'ı ──────────────────────────────────
// Hat zaten çözülmüş hâlde geliyor (`loadPipeline`); bu adım çözümü ONAYLAR ve
// çalıştırma parametrelerini dondurur. Görünüşte boş ama manifest'te bir satırı var:
// "hangi tanımla koştu" sorusunun cevabı burada başlar.
export const resolveBody = govde('RESOLVE', async (ctx, input) =>
  ok({
    costs: [],
    data: { brandId: ctx.brandId, eraId: ctx.eraId, constraints: input.constraints },
  })
)

// ── SELECT: retrieval yükleminden kayıt seçer ───────────────────────────────
export interface SelectDeps {
  /** Retrieval TEK yerden geçer (R-13); motor kendi sorgusunu KURMAZ. */
  readonly select: (
    query: string,
    limit: number
  ) => readonly { readonly id: string; readonly text: string }[]
}

export const selectBody = (deps: SelectDeps): Verb =>
  govde('SELECT', async (ctx, input) => {
    const q = typeof input.constraints['topic'] === 'string' ? input.constraints['topic'] : ''
    if (q === '') return err(hata('validation', 'MISSING_TOPIC', ctx))
    const kayitlar = deps.select(q, 8)
    if (kayitlar.length === 0) {
      // Sessizce boş bağlamla devam etmek yasak: bağlamsız üretilen metin markadan
      // değil modelin genel bilgisinden gelir ve bunu çıktıya bakarak ayırt etmek zor.
      return err(hata('not_found', 'NO_CONTEXT', ctx, { topic: q }))
    }
    return ok({ costs: [], data: { records: kayitlar } })
  })

// ── COMPOSE: SAF. Kayıtlar → belge modeli ───────────────────────────────────
export interface ComposeDeps {
  readonly tokenCss: string
  /** Marka fontları — base64 gömülü `@font-face` blokları (D-252). */
  readonly fontCss?: string
  readonly stamp: AssetStamp
  /**
   * Deck IR'ı — **KAYNAK, çıktı değil** (§4c · FAZ-6.1).
   *
   * ⚠ İkinci doğrulama turu: `deck.ir.json` yazılmıyordu, okunmuyordu ve `chart`/
   * `diagram` bloklarını ÜRETEN hiçbir gövde yoktu — yani "grafik PDF'te vektör"
   * kriteri üretimde hiçbir çıktıda görünmüyordu. IR bu boşluğu kapatıyor: benzer bir
   * deck geldiğinde LLM yeniden koşturulmaz, IR kopyalanıp düzenlenir.
   *
   * **Dosyayı CLI okur, bu gövde DEĞİL:** `COMPOSE`un yan etki sınıfı `pure` (§3.10)
   * ve saf bir fiil dosya açamaz. Ayrım korunuyor.
   */
  readonly ir?: DocumentModel | null
}

/**
 * Belge modelini kurar. **Hiç I/O yok** — `COMPOSE`un yan etki sınıfı `pure` (§3.10).
 *
 * Metin `inputs`tan gelir: `GENERATE` başarılıysa onun çıktısı, değilse `SELECT`in
 * kayıtları. İkinci yol, model çağrısı olmadan da gerçek bir slayt üretilebilmesini
 * sağlıyor — ve bu bir yedek değil, `free` şeridin dürüst hâli.
 */
export const composeBody = (deps: ComposeDeps): Verb =>
  govde('COMPOSE', async (ctx, input) => {
    const metinCiktisi = Object.values(input.inputs).find(
      (v): v is { readonly lines: readonly string[] } =>
        v !== null && typeof v === 'object' && Array.isArray((v as { lines?: unknown }).lines)
    )
    const kayitCiktisi = Object.values(input.inputs).find(
      (v): v is { readonly records: readonly { readonly text: string }[] } =>
        v !== null && typeof v === 'object' && Array.isArray((v as { records?: unknown }).records)
    )

    // ── KATALOG DALI: şablon uyarlaması → panorama belgesi (FAZ-15.9 · D-268) ──
    //
    // ⚠ ⚠ **BU DAL, FAZIN EN ÖNEMLİ BULGUSUNU KAPATIYOR.** Altı şablon, katalog, seçici,
    // uyarlayıcı ve denetim yazıldı, test edildi, kapılar yeşildi — ve `renderPanorama`nın
    // ÜRETİM YOLUNDA TEK BİR ÇAĞIRANI YOKTU. `grep -rn renderPanorama packages/engine`
    // sıfır satır veriyordu. Bu projede aynı sınıf hatanın onuncu tekrarı (D-261 ailesi)
    // ve en büyüğü: mimarinin tamamı `just uret`ten erişilemez duruyordu.
    //
    // ⚠ **Seçim burada, uyarlama ÖNCEKİ adımda.** Şablon seçimi deterministik ve model
    // çağırmıyor — `COMPOSE`un yan etki sınıfı `pure` (R-04) ve öyle kalıyor. Metni
    // konuya çeviren yaratıcılık `GENERATE` adımında; burada yalnız birleştirme var.
    if (input.constraints['katalog'] === true) {
      // ⚠ ⚠ **SONUNCU, İLK DEĞİL — aynı tuzak bu dosyada ÜÇÜNCÜ kez.** İki adım uyarlama
      // üretiyor: `sablon-uyarla` (ilk yazım) ve `duzelt` (denetim kusurlarına göre
      // düzeltilmiş). `.find()` ilkini alsaydı düzeltme turu koşar, model düzeltirdi ve
      // belge DÜZELTİLMEMİŞ hâliyle render edilirdi — yapılan işin sessizce çöpe gitmesi.
      // `document` (D-259) ve `panorama` yollarında aynı ders yazılıydı; yeni dal onu
      // yine kendiliğinden almadı. Bu dosyada "en son üreticiye bak" bir DESEN.
      const uyarlamalar = Object.values(input.inputs).filter(
        (v): v is { readonly uyarlama: Uyarlama } =>
          v !== null &&
          typeof v === 'object' &&
          (v as { uyarlama?: unknown }).uyarlama !== undefined
      )
      const uyarlamaCiktisi = uyarlamalar[uyarlamalar.length - 1]
      if (uyarlamaCiktisi === undefined) return err(hata('validation', 'NO_ADAPTATION', ctx))
      const sablonId = uyarlamaCiktisi.uyarlama.sablonId
      const ornek = ornekBul(sablonId)
      if (ornek === null) return err(hata('validation', 'TEMPLATE_NOT_FOUND', ctx, { sablonId }))
      const birlesik = uyarla(ornek, uyarlamaCiktisi.uyarlama)
      if (!birlesik.ok)
        return err(hata('validation', 'ADAPTATION_REJECTED', ctx, { defects: birlesik.kusurlar }))

      // ⚠ ⚠ **GÖRSEL YUVAYA BURADA GİRİYOR ve ilk sürümde HİÇ GİRMİYORDU.** Gerçek koşu
      // on adımı geçti, `cloudflare-workers-ai` görseli ÜRETTİ, render dört slaydı
      // damgaladı — ve çıktıda kesik özne yerine YER TUTUCU duruyordu. Sebep sıralamaydı:
      // panorama belgesi `kompozit`te kuruluyor, görsel ondan SONRA doğuyor ve belgeye
      // geri dönecek bir yol yoktu. `instagram-post` bunu `yuva-doldur` adımıyla çözmüştü;
      // aynı gövde ikinci kez koşuyor, bu kez girdisinde görselle.
      // ⚠ Görsel yoksa `src` boş kalıyor ve yer tutucu ÇİZİLİYOR — eksiklik görünür
      // kalmalı; sessizce metin-only bir karosel, tasarımı tanınmaz yapar.
      const uretilenler = uretilenGorseller(input.inputs)
      const kartlar = birlesik.belge
      // ⚠ ⚠ **ARKA PLANI SİLİNMİŞ GÖRSELDE `matlama` KAPANMAK ZORUNDA.** `matlama` alfayı
      // PARLAKLIKTAN türetiyor: zaten şeffaf zeminli bir PNG'ye uygulanınca öznenin
      // koyu bölgeleri de saydamlaşır ve figür delik deşik olur. İki teknik aynı işi
      // yapıyor ve üst üste binmeleri, tek başına her birinden kötü.
      // ⚠ ⚠ **SIRAYA GÖRE EŞLEŞTİRME, YAYMA DEĞİL.** `gorseller.map(g => src)` her yuvaya
      // AYNI görseli koyuyordu; iki yuvalı bir şablon aynı figürü iki kez çiziyordu.
      // Yuva `i` görsel `i`yi alır. Görsel yetmezse kalan yuvanın `src`i BOŞ kalır ve
      // yer tutucu çizilir — eksiklik görünür kalmalı, klonla örtülmemeli.
      const gorsellikli =
        uretilenler.length === 0
          ? kartlar
          : {
              ...kartlar,
              gorseller: kartlar.gorseller.map((g, i) => {
                const u = uretilenler[i]
                return u === undefined ? g : { ...g, src: u.src }
              }),
              // ⚠ `matlama` yalnız KULLANILAN görsellerin hepsi kırpılmışsa düşüyor:
              // biri hamsa luma anahtarı ona hâlâ gerekli ve liste belge düzeyinde.
              ...(uretilenler.slice(0, kartlar.gorseller.length).every((u) => u.matlandi)
                ? {
                    gorselIslemleri: (kartlar.gorselIslemleri ?? []).filter((i) => i !== 'matlama'),
                  }
                : {}),
            }
      // ⚠ Damga, token ve font ÇALIŞTIRMADAN geliyor; şablon onları taşıyamıyor (Yasa 7).
      return ok({
        costs: [],
        data: {
          panorama: {
            ...gorsellikli,
            tokenCss: deps.tokenCss,
            ...(deps.fontCss === undefined ? {} : { fontCss: deps.fontCss }),
            stamp: deps.stamp,
          },
          sablonId,
          // ⚠ Uyarılar SUSTURULMUYOR: koşuyu durdurmuyorlar ama deftere ve insan onay
          // kapısına gidiyorlar. Görünmeyen bir uyarı, olmayan bir uyarıdır.
          ...(birlesik.uyarilar.length === 0 ? {} : { uyarilar: birlesik.uyarilar }),
          ...kisisellestirmeCiktisi(input.constraints),
        },
      })
    }

    // ── IR verildiyse blokların KAYNAĞI odur ────────────────────────────────
    // Metin üretimi atlanır: IR zaten insan tarafından düzenlenmiş bir belgedir ve
    // model onu "iyileştirmeye" çalışırsa düzenlemeyi geri alır.
    if (deps.ir !== undefined && deps.ir !== null) {
      const irBelge: DocumentModel = {
        ...deps.ir,
        // Damga ve token'lar ÇALIŞTIRMADAN gelir, IR'dan değil: bir varlık üretim anında
        // damgalanır (R-11) ve IR aylar önce yazılmış olabilir.
        tokenCss: deps.tokenCss,
        ...(deps.fontCss === undefined ? {} : { fontCss: deps.fontCss }),
        stamp: deps.stamp,
      }
      const irGecerli = validateDocument(irBelge)
      if (!irGecerli.ok) {
        return err(hata('validation', 'INVALID_IR', ctx, { defects: irGecerli.errors }))
      }
      return ok({
        costs: [],
        data: {
          document: irBelge,
          irKullanildi: true,
          ...kisisellestirmeCiktisi(input.constraints),
        },
      })
    }

    const satirlar =
      metinCiktisi?.lines ??
      kayitCiktisi?.records.map((r) => r.text.split('\n')[0] ?? '').filter((t) => t !== '') ??
      []

    if (satirlar.length === 0) return err(hata('validation', 'NO_CONTENT', ctx))

    // Önceki adımlardan gelen ürün ekranı çekimleri belgeye BLOK olarak giriyor.
    // `role: 'product_screenshot'` bir İDDİADIR: "ürün gerçekten böyle görünüyor".
    const cekimler = urunCekimleri(input.inputs)
    // ⚠ Slayt-başına yol (`instagram-post`) TEK görsel kullanıyor: listenin ilki.
    const gorsel = uretilenGorseller(input.inputs)[0] ?? null
    // ── satır → blok ─────────────────────────────────────────────────────────
    //
    // ⚠ **`slice(1, 4)` KAPANIŞ CÜMLESİNİ ATIYORDU.** `icerikPromptu` altı satır istiyor
    // (kapak · dört gövde · kapanış) ama yalnız üç gövde satırı alınıyordu; son satır —
    // yani DAVET — belgeye hiç girmiyordu. Kesme, uzunluk disiplini prompt'a yazılmadan
    // önceki bir kalıntıydı ve disiplin gelince fazlalık değil KAYIP oldu.
    //
    // ⚠ **Görsel ARTIK SONDA DEĞİL.** En sona eklendiğinde sayfalayıcı onu tek başına
    // son slayda koyuyordu: kapanış slaydı 0 kelimeyle çıkıyordu (ölçüldü). Kapanış bir
    // DAVETTİR; görsel ondan önce, gövdenin sonunda duruyor.
    // ── AKIŞ: fotoğrafın YERİNE geçen görsellik (FAZ-11.1) ───────────────────
    //
    // Dört referans örneğin hiçbirinde dikdörtgen fotoğraf yok; görsellik veri, şema ve
    // geometriyle kuruluyor. `diagramHtml` repoda yazılı ve test edilmişti ama üretim
    // hattı hiç çağırmıyordu — fotoğraf, BAĞLI OLAN TEK görsel yol olduğu için
    // kullanılıyordu. Kusur fotoğrafta değil, o yolun tekliğindeydi.
    const { satirlar: akisSonrasi, akis } = akisiAyir(satirlar)
    // ⚠ İkisi birden konmuyor: akış bir SIRA, karşılaştırma bir KARŞITLIK anlatıyor ve
    // aynı slaytta ikisi de kompozisyonu kalabalıklaştırır. Akış varsa karşılaştırma
    // metne geri düşmüyor — ayrıştırılıp atılıyor ki yarım bölüm çöp olarak görünmesin.
    const { satirlar: metinSatirlari, karsilastirma } = karsilastirmayiAyir(akisSonrasi)

    const govde = metinSatirlari.slice(1, -1)
    const kapanisSatiri =
      metinSatirlari.length > 1 ? (metinSatirlari[metinSatirlari.length - 1] ?? null) : null
    // ⚠ **Görsel gövdenin ORTASINA giriyor, sonuna değil** (FAZ-10.7). Sona konduğunda
    // sayfalayıcı onu kapanış slaydına taşıyordu ve kapanış cümlesi fotoğrafın altına
    // sıkışıyordu — kapanış bir DAVETTİR, bir resim altyazısı değil. Ortada duran görsel
    // bir GÖVDE slaydına düşüyor ve kapanış temiz kalıyor.
    // ── TASARIM PLANI: kararlar GEREKÇESİYLE deftere giriyor (FAZ-14.2) ──────
    //
    // ⚠ **Ayrı bir `tasarim-plani.json` YAZILMIYOR ve bu bir eksiklik değil, R-04.**
    // Plan bir dosya olarak yazılsaydı `COMPOSE` çalışma ağacına yazan bir fiil olurdu;
    // yasa yalnız `PROPOSE`un yazmasına izin veriyor. Plan adım ÇIKTISI olarak dönüyor
    // ve defteri yazan `manifest-writer` onu `manifest.json`a koyuyor — yani planın
    // yaşadığı yer `derived/runs/<id>/`, tıpkı `donmus-plan.json` gibi, ama onu oraya
    // koyan fiil değil koşucu.
    //
    // ⚠ Plan ~2 KB; defterin 8 KB eleme eşiğinin (D-263) altında kalıyor, yani
    // gerekçeler AYNEN okunabilir durumda saklanıyor.
    // ⚠ ⚠ **AİLE ARTIK SABİT DEĞİL, PLANIN KARARI.** Burada `const aileProfili =
    // TEMEL_AILE` yazıyordu ve `AKICI_AILE`yi hiçbir üretim yolu seçmiyordu: panorama ve
    // degrade hiçbir koşuda basılmadı, FAZ-12.4 ile 12.9'un teslimatı ölü koddu.
    // Bağımsız doğrulama bunu blokaj olarak buldu (D-261'in dokuzuncu tekrarı).
    // Seçim `aileSec`te ve gerekçesi plana yazılıyor.
    const planGirdisi = {
      konu: typeof input.constraints['topic'] === 'string' ? input.constraints['topic'] : '',
      satirlar: metinSatirlari,
      akisVar: akis !== null,
      // ⚠ Yuva bir POLİTİKA, bir gözlem değil (bkz. `tasarla.ts`). `gorsel !== null`
      // yazmak döngüseldi: plan görselin varlığını arıyordu, görsel ise plandan sonra
      // üretiliyor. Hat neyi istediğini söylüyor; plan da gerekçesini yazıyor.
      yuvaIstendi: input.constraints['gorsel_yuvasi'] === true,
      // ⚠ Aile adı bir KISIT: `just uret ... --aile kesit`. Aynı metni yedi tasarımda
      // üretmek (şablon karşılaştırması) bunsuz mümkün değil.
      ...(typeof input.constraints['aile'] === 'string'
        ? { aileAdi: input.constraints['aile'] }
        : {}),
      ...(input.constraints['yuva_bicimi'] === 'maske' ? { yuvaBicimi: 'maske' as const } : {}),
    }
    const aileProfili = aileSec(planGirdisi)
    const plan = tasarla(planGirdisi)

    const orta = Math.max(1, Math.ceil(govde.length / 2))
    // ⚠ **İŞLEV BLOĞA DAMGALANIYOR** (FAZ-14.1 · gerçek koşuda bulundu). Yay satır
    // sırasına göre atanıyor; ölçüm ise SLAYT sırasına bakıyordu. Sayfalayıcı 6 satırı
    // 5 slayda bölünce üçüncü satır (bir `kanit`, 22 kelime) ikinci slaytta ölçüldü ve
    // `gerilim`in 21 kelimelik bütçesine çarptı — oysa altı satırın HEPSİ bütçe içindeydi.
    // Bir özelliği taşıyıcısından ayırıp konumdan yeniden türetmek, bu metrikteki
    // DÖRDÜNCÜ birim uyuşmazlığıydı (D-260 ailesi). İşlev artık satırla birlikte gidiyor.
    const yayIslevleri = yay(metinSatirlari.length)
    const islevi = (satirIndex: number): { islev?: Islev } => {
      const i = yayIslevleri[satirIndex]
      return i === undefined ? {} : { islev: i as Islev }
    }
    const blocks: Block[] = [
      { type: 'heading', text: metinSatirlari[0] as string, level: 1, ...islevi(0) },
      ...govde.slice(0, orta).map((t, j): Block => ({ type: 'body', text: t, ...islevi(j + 1) })),
      // Üretilen görsel `role` TAŞIMIYOR: `product_screenshot` bir iddiadır ("ürün
      // gerçekten böyle görünüyor") ve model üretimi bir görsel onu iddia edemez.
      // Rolsüz görüntü hiçbir şey iddia etmez ve serbesttir (§7.1).
      // Akış varsa diyagram bloğu giriyor; YOKSA görsel yolu korunuyor. İkisi birden
      // konmuyor: aynı slaytta iki görsel öge, kompozisyonu kalabalıklaştırır ve
      // referans ailesinde örneği yok.
      ...(akis === null
        ? []
        : [{ type: 'diagram' as const, title: akis.title, nodes: akis.nodes }]),
      // Karşılaştırma yalnız akış YOKKEN: sayı istemeyen ikinci veri ögesi (FAZ-12.5).
      ...(akis !== null || karsilastirma === null
        ? []
        : [
            {
              type: 'compare' as const,
              title: karsilastirma.title,
              once: karsilastirma.once,
              sonra: karsilastirma.sonra,
            },
          ]),
      ...(gorsel === null || akis !== null
        ? []
        : [
            {
              type: 'image' as const,
              src: gorsel.src,
              // ⚠ `alt` KONUDAN geliyor ve bu bir SINIRDIR: konu görselin ne İÇİN
              // üretildiğini söylüyor, ne GÖSTERDİĞİNİ değil. Doğru çözüm brief'i
              // Türkçe bir betimlemeyle birlikte istemek (D-250'de borç olarak
              // yazılı). `decorative: true` yazmak yalan olurdu — görsel akışta
              // duruyor ve anlam taşıyor.
              alt: typeof input.constraints['topic'] === 'string' ? input.constraints['topic'] : '',
              decorative: false,
              // ⚠ Yuva ZORUNLU (FAZ-11.4): yuvasız bir görsel `validateDocument` tarafından
              // reddediliyor. Serbest dikdörtgen fotoğraf artık temsil EDİLEMİYOR.
              yuva: plan.yuvaBicimi.deger,
            },
          ]),
      ...govde
        .slice(orta)
        .map((t, j): Block => ({ type: 'body', text: t, ...islevi(orta + j + 1) })),
      // Kapanış EN SONDA: sayfalayıcı son slaydı `kapanis` rolüyle damgalıyor ve o
      // slaydın metni bu satır olmalı.
      ...(kapanisSatiri === null
        ? []
        : [
            {
              type: 'body' as const,
              text: kapanisSatiri,
              ...islevi(metinSatirlari.length - 1),
            },
          ]),
      ...cekimler.map((c): Block => ({
        type: 'image',
        src: c.path,
        alt: c.alt,
        decorative: false,
        role: 'product_screenshot',
      })),
    ]

    const w = typeof input.constraints['width'] === 'number' ? input.constraints['width'] : 1080
    const h = typeof input.constraints['height'] === 'number' ? input.constraints['height'] : 1350

    const doc: DocumentModel = {
      kind: 'post',
      width: w,
      height: h,
      tokenCss: deps.tokenCss,
      ...(deps.fontCss === undefined ? {} : { fontCss: deps.fontCss }),
      stamp: deps.stamp,
      // ⚠ Aile parametreleri BELGEYE giriyor: render onları plandan okuyor, kendi
      // sabitinden değil. İkisi ayrı yaşarsa biri değişince öbürü sessizce eski kalır.
      aile: {
        suslemeYogunlugu: plan.suslemeYogunlugu.deger,
        vinyetGucu: aileProfili.vinyetGucu,
        degrade: aileProfili.degrade,
        panorama: plan.panorama.deger,
        gorselIslemleri: aileProfili.gorselIslemleri,
        tipoEfektleri: aileProfili.tipoEfektleri,
        alan: aileProfili.alan,
        sinir: aileProfili.sinir,
        hayalet: aileProfili.hayalet,
        tipoPayi: aileProfili.tipoPayi,
        suslemeTipleri: aileProfili.suslemeTipleri,
        yerlesim: aileProfili.yerlesim,
        iskelet: aileProfili.iskelet,
      },
      blocks,
    }

    const gecerli = validateDocument(doc)
    if (!gecerli.ok) {
      // Geçersiz belge render EDİLMEZ: boş ya da alt-text'siz bir PNG üretmek,
      // sessiz bir hatadır ve kapıdan geçer görünür.
      return err(hata('validation', 'INVALID_DOCUMENT', ctx, { defects: gecerli.errors }))
    }
    // ⚠ **`productShots` BURADA doğuyor** ve `role: 'product_screenshot'` bloklarının
    // karşılığıdır (FAZ 6 denetimi, bulgu 8: alanın okuyanı yoktu). Manifest dedektörü
    // (`fabricated_product_shot`) bu diziyi arıyor; blok ile defter kaydı aynı kaynaktan
    // türediği için biri diğerinden ayrışamaz.
    return ok({
      costs: [],
      data: {
        document: doc,
        tasarimPlani: plan,
        ...kisisellestirmeCiktisi(input.constraints),
        ...(cekimler.length > 0
          ? {
              productShots: cekimler.map((c) => ({
                captureRunId: c.captureRunId,
                demoRef: c.demoRef,
                aiGenerated: false,
                // ⚠ `basis` ZORUNLU: zincirin 3. kapısı (`prospectDeckZinciri`) ve
                // `inspectManifest` bunu arıyor. İlk sürüm onu YAZMIYORDU ve zincir
                // kendi üretimini reddediyordu — testler ise elle `basis` yazılmış,
                // üretimin hiç üretmediği bir fikstür kullanıyordu. Kendi kendini
                // onaylayan test çifti (2. doğrulama turu).
                basis: {
                  kind: 'product_capture',
                  captureRunId: c.captureRunId,
                  demoRef: c.demoRef,
                },
              })),
            }
          : {}),
      },
    })
  })

/**
 * Kişiselleştirme alanları — **operatörün açıkça saydığı** prospect'e özgü alanlar.
 *
 * ⚠ İkinci doğrulama turu: bu anahtarın yalnız OKUYUCULARI vardı (`ozetle`,
 * `inspectManifest`, zincir toplayıcı) ve tek bir üreticisi yoktu — yani `kisisellestirme`
 * kapısı ve `personalization_cap` dedektörü ölüydü.
 *
 * **Neden operatör sayıyor, sistem çıkarmıyor:** tavan bir EDİTORYAL karardır (R-36) ve
 * "hangi cümle prospect'e özgü" sorusunun mekanik bir cevabı yok. Sistemin çıkarım
 * yapması, sayının anlamını kaybettirirdi. Operatör `--kisisellestirme "a,b,c"` yazar;
 * kapı sayar.
 */
const kisisellestirmeCiktisi = (
  constraints: Readonly<Record<string, unknown>>
): Readonly<Record<string, unknown>> => {
  const ham = constraints['personalization']
  if (typeof ham !== 'string' || ham.trim() === '') return {}
  const alanlar = ham
    .split(',')
    .map((x) => x.trim())
    .filter((x) => x !== '')
  return alanlar.length === 0
    ? {}
    : {
        personalizationFields: alanlar.map((label, i) => ({
          id: `alan-${i + 1}`,
          label,
          sourceRef: 'operatör beyanı',
          confidence: 'direct' as const,
        })),
      }
}

/**
 * Önceki adımların ürettiği ürün ekranı çekimleri.
 *
 * Çekim yoksa boş döner ve belge ürün ekranı TAŞIMAZ — "ekran koyamadım" sessizce
 * uydurma bir ekrana dönüşemez (R-32).
 */
/**
 * `image.generate` çıktısını belgeye giren bir bloğa çevirir (§7.1 · D-250).
 *
 * ⚠ **Bu çıktı SESSİZCE DÜŞÜYORDU.** `composeBody` yalnız `capture` (ürün ekran
 * çekimi) arıyordu; üretilen görsel `inputs`ta duruyor, hiçbir bloğa dönüşmüyordu.
 * Yani Cloudflare'e çağrı gidiyor, kota harcanıyor, görsel damgalanıp depoya alınıyor
 * — **ve belgeye hiç konmuyordu.** Siyah slayt + beyaz metin bundan.
 * Zincir kopukluğunun yedinci tekrarı: modül var, çağrı var, çıktı var, tüketen yok.
 *
 * **`data:` URI, dosya DEĞİL.** `COMPOSE`un yan etki sınıfı `pure` (§3.10): saf bir
 * fiil diske yazamaz. Base64 zaten `inputs`ta ve Chromium `data:` URI'yi doğrudan
 * çözüyor — tek motor yasası (R-30) korunuyor, ikinci bir yazma yolu açılmıyor.
 */
interface UretilenGorsel {
  readonly src: string
  readonly width: number
  readonly height: number
  readonly matlandi: boolean
}

/**
 * Üretilen görsellerin TAMAMI, adım sırasına göre (§7.1 · D-250 · borç A8).
 *
 * ⚠ **Bu fonksiyon tek görsel döndürüyordu ve `composeBody` onu HER yuvaya yayıyordu.**
 * Şablon `adet: 'slayt-basina'` ilan ediyor, DAG çoğaltmıyor, çıktıda aynı figür yan
 * yana üç kez duruyordu — tasarım değil, hata gibi okunuyordu. Tek görsele inmek o günün
 * doğru kararıydı ama şablonu asıllından uzaklaştırdı: referansta her slaytta ayrı bir
 * fotoğraf var ve kadrajı dolduruyor. Ölçüldü: dört slayttan üçünde doluluk %3–7.
 *
 * ⚠ ⚠ **HAM ile KIRPILMIŞ, ADIM SONEKİYLE EŞLEŞTİRİLİYOR — "sonuncuyu al" ARTIK YETMEZ.**
 * Tek görselken iki üretici vardı (`gorsel-uret` ham, `gorsel-kirp` arka planı silinmiş)
 * ve sonuncuyu almak doğru cevabı veriyordu. N görselde bu bozulur: `gorsel-kirp-2`,
 * `gorsel-uret-3`ten ÖNCE gelebilir ve "sonuncu" 3'ün hamını seçip 2'nin kırpılmışını
 * çöpe atardı. Eşleştirme artık anahtarın sayısal sonekinden: `-2` soneki olan her şey
 * aynı öbekte, öbek içinde kırpılmış olan hamı EZER.
 */
const uretilenGorseller = (
  inputs: Readonly<Record<string, unknown>>,
  // ⚠ ⚠ **`needs` VERİLMEZSE TÜM ÇIKTILARA BAKILIR — ve `inputs` GERÇEKTEN TÜMÜDÜR.**
  // `run.ts` her adıma `inputs: ciktilar` geçiyor, yani o ana kadarki BÜTÜN çıktıları;
  // daraltmayı `needs`i okuyan gövde yapmak zorunda. Bunu "DAG zaten daraltıyor" diye
  // varsaymak dört özdeş fotoğrafın kök sebebiydi: dört kırpma adımının her biri
  // listenin İLKİNİ, yani 1. görseli kırpıyordu ve kırpılmış olan hamı ezdiği için
  // dört yuvanın dördüne de aynı figür giriyordu. Üç gerçek koşu bunu gösterdi ve
  // teşhis ancak sağlayıcı DOĞRUDAN sınandıktan sonra buraya geldi (tohum çalışıyordu).
  needs?: readonly string[]
): readonly UretilenGorsel[] => {
  const obekler = new Map<string, UretilenGorsel>()
  const sira: string[] = []
  const girdiler =
    needs === undefined ? Object.entries(inputs) : needs.map((a) => [a, inputs[a]] as const)
  for (const [anahtar, v] of girdiler) {
    if (v === null || typeof v !== 'object') continue
    const o = v as {
      format?: unknown
      data?: unknown
      width?: unknown
      height?: unknown
      matlandi?: unknown
    }
    if (o.format !== 'base64' || typeof o.data !== 'string' || o.data === '') continue
    // Sonek yoksa öbek `1`: tek görselli eski hatlar (`instagram-post`) değişmeden çalışır.
    const eslesme = /-(\d+)$/.exec(anahtar)
    const obek = eslesme?.[1] ?? '1'
    const gorsel: UretilenGorsel = {
      // PNG varsayımı YOK: Cloudflare JPEG döndürüyor ve `image/png` yazmak tarayıcıyı
      // yanıltmazdı ama yalan olurdu. Base64 imzasından okunuyor.
      src: `data:${o.data.startsWith('/9j/') ? 'image/jpeg' : 'image/png'};base64,${o.data}`,
      width: typeof o.width === 'number' ? o.width : 0,
      height: typeof o.height === 'number' ? o.height : 0,
      matlandi: o.matlandi === true,
    }
    const mevcut = obekler.get(obek)
    if (mevcut === undefined) sira.push(obek)
    // ⚠ Kırpılmış olan hamı EZER; ham olan kırpılmışı EZMEZ. Arka plan silmeyi koşturup
    // sonucunu çöpe atmak, bu dosyada dört kez tekrarlanan hatanın tam kendisiydi.
    if (mevcut === undefined || (gorsel.matlandi && !mevcut.matlandi)) obekler.set(obek, gorsel)
  }
  return sira
    .sort((a, b) => Number(a) - Number(b))
    .flatMap((k) => {
      const g = obekler.get(k)
      return g === undefined ? [] : [g]
    })
}

const urunCekimleri = (
  inputs: Readonly<Record<string, unknown>>
): readonly { path: string; alt: string; captureRunId: string; demoRef: string }[] =>
  Object.values(inputs).flatMap((v) => {
    if (v === null || typeof v !== 'object') return []
    const c = v as { capture?: unknown }
    if (c.capture === null || typeof c.capture !== 'object') return []
    const o = c.capture as Record<string, unknown>
    return typeof o['path'] === 'string' &&
      typeof o['captureRunId'] === 'string' &&
      typeof o['demoRef'] === 'string'
      ? [
          {
            path: o['path'],
            alt: typeof o['alt'] === 'string' ? o['alt'] : 'Ürün ekran görüntüsü',
            captureRunId: o['captureRunId'],
            demoRef: o['demoRef'],
          },
        ]
      : []
  })

// ── RENDER: yalnız Chromium ─────────────────────────────────────────────────
export interface RenderDeps {
  /** Profil adı şeridi — her slaytta basılır (D-254). */
  readonly kulp?: string
  readonly outDir: string
  /** Taşma bölme düzeni (§7.1). Küçültme YOK — bölme var. */
  /**
   * Sabit düzen, ya da **`null` = içerikten seç** (FAZ-10.4). `null` üretim
   * varsayılanı: sabit `'statement'` altı maddelik bir listeyi üç slayda bölüyordu.
   */
  readonly layout: LayoutName | null
  /**
   * Platform boyut sınırı (§9.1). Verilirse **kalite merdiveni GERÇEKTEN uygulanır**:
   * her basamak render edilir, dosya ölçülür, sığan ilk basamak kazanır.
   *
   * Verilmezse düz PNG. İlk sürümde merdiven yalnız TAHMİN ediyordu ve seçilen basamak
   * hiçbir yere gitmiyordu — 53KB'lık bir varlık 30KB limitine karşı sessizce
   * yayınlanıyordu (D-139).
   */
  readonly maxBytes?: number
}

export const renderBody = (deps: RenderDeps): Verb =>
  govde('RENDER', async (ctx, input) => {
    // ── ürün ekranı çekimi (§10 · R-32 · FAZ-6.8, 6.10) ─────────────────────
    //
    // ⚠ `captureProductShot` yazılmış, test edilmiş ve **sıfır çağıranı** vardı (FAZ 6
    // denetimi, bulgu 6). `prospect-deck` hattındaki `urun-ekrani` adımı bu dalı
    // bekliyordu ve dal yoktu — yani hat koşsa bile ekran çekilmezdi.
    //
    // Çekim bir BELGE üretmez, bir GÖRÜNTÜ üretir; `COMPOSE` onu bloğa çevirir ve
    // `productShots` kaydını doğurur. Ayrım bilinçli: çekimi yapan kod kendi iddiasını
    // kurarsa, iddia kendi kendini onaylamış olur.
    if (input.constraints['capture'] === 'product') {
      const url = typeof input.constraints['url'] === 'string' ? input.constraints['url'] : ''
      const demoRef =
        typeof input.constraints['demo_ref'] === 'string' ? input.constraints['demo_ref'] : ''
      const hazir =
        typeof input.constraints['ready_selector'] === 'string'
          ? input.constraints['ready_selector']
          : 'body'
      if (url === '' || demoRef === '') {
        // Kaynaksız çekim iddiası denetlenemez; denetlenemeyen iddia beyandır (D-216).
        return err(hata('validation', 'CAPTURE_SOURCE_MISSING', ctx, { url, demoRef }))
      }
      mkdirSync(deps.outDir, { recursive: true })
      const yol = join(deps.outDir, 'urun-ekrani.png')
      const c = await captureProductShot({
        url,
        demoRef,
        captureRunId: String(ctx.runId),
        outPath: yol,
        width: typeof input.constraints['width'] === 'number' ? input.constraints['width'] : 1600,
        height: typeof input.constraints['height'] === 'number' ? input.constraints['height'] : 900,
        readySelector: hazir,
      })
      if (!c.ok) return err(hata('render_failed', 'CAPTURE_FAILED', ctx, { error: c.error }))
      return ok({
        costs: [
          {
            verb: 'RENDER' as VerbName,
            capability: 'image.render',
            providerId: 'local-chromium',
            amount: ZERO_USD,
            kind: 'actual' as const,
          },
        ],
        data: {
          capture: {
            path: c.value.path,
            captureRunId: c.value.captureRunId,
            demoRef: c.value.demoRef,
            alt: `Ürün ekran görüntüsü — ${demoRef}`,
          },
        },
      })
    }

    // ── PANORAMA DALI: tek geniş tuval, sonra dilimleme (§7.1 · R-30 · D-268) ──
    //
    // ⚠ ⚠ **`.document` YERİNE `.panorama` ARANIYOR ve bu ayrım kasıtlı.** İki belge
    // modeli birbirine dönüştürülmüyor: `DocumentModel` blok listesi, `PanoramaBelgesi`
    // kart listesi + kesimi aşan katmanlar. Birini ötekine çevirmeye çalışmak, kesimi
    // aşan ögeyi (kesintisizliğin taşıyıcısı) blok modeline sığdırmak demekti — o model
    // slayt sınırını aşan bir şey ifade edemiyor. Ayrı kanal, ayrı dal.
    //
    // ⚠ **Tek render motoru bozulmuyor (Yasa 4):** ikisi de aynı Chromium, aynı gömülü
    // font, aynı token CSS. İkinci bir CSS alt kümesi değil, aynı motorda ikinci bir
    // sayfa düzeni.
    // ⚠ ⚠ **`.find()` DEĞİL SONUNCU — ve bu hata bu dosyada İKİNCİ KEZ yapıldı.**
    // `inputs` TÜM önceki adımların çıktısını taşıyor ve iki adım panorama üretiyor:
    // `kompozit` (görsel yuvası BOŞ) ve `yuva-doldur` (görsel yerleşmiş). `.find()` ilk
    // eşleşeni alıyordu, yani `kompozit`inkini — ve gerçek koşuda `cloudflare-workers-ai`
    // görseli üretti, `yuva-doldur` onu yerleştirdi, render YER TUTUCU çizdi.
    // ⚠ Aynı tuzak `document` yolunda zaten yaşanmış ve oraya "en aşağıdaki üreticiye
    // bak" diye not düşülmüştü (D-259); panorama dalı o dersi tekrarladı. Bir dosyada
    // yazılı bir ders, o dosyaya eklenen yeni dala kendiliğinden geçmiyor.
    const panoramalar = Object.values(input.inputs).filter(
      (v): v is { readonly panorama: PanoramaBelgesi } =>
        v !== null && typeof v === 'object' && (v as { panorama?: unknown }).panorama !== undefined
    )
    const panoramaCiktisi = panoramalar[panoramalar.length - 1]
    if (panoramaCiktisi !== undefined) {
      mkdirSync(deps.outDir, { recursive: true })
      const doc = panoramaCiktisi.panorama
      const yollar = doc.kartlar.map((_, i) =>
        join(deps.outDir, `slayt-${String(i + 1).padStart(2, '0')}.png`)
      )
      const r = await renderPanorama(doc, yollar)
      if (!r.ok) return err(hata('render_failed', 'PANORAMA_FAILED', ctx, { error: r.error }))
      // ⚠ ⚠ **DENETİM RENDER'DAN SONRA, AYNI ADIMDA.** Ayrı bir fiil açmak dokuz fiil
      // yasasını (R-02) delerdi; ayrı bir adım açmak render'ı iki kez koştururdu. Denetim
      // bir yan etki değil bir ÖLÇÜM: aynı tarayıcıda, aynı belgeyle, ek maliyetsiz.
      const denetim = await panoramaDenetle(doc)
      const kusurlar = denetim.ok ? denetim.value : []
      return ok({
        costs: [
          {
            verb: 'RENDER' as VerbName,
            capability: 'image.render',
            providerId: 'local-chromium',
            amount: ZERO_USD,
            kind: 'actual' as const,
          },
        ],
        data: {
          slides: r.value.yollar,
          panoramaGenisligi: r.value.genislik,
          // ⚠ Kusurlar SUSTURULMUYOR: `kalite` adımı ve insan onay kapısı bunları görüyor.
          kusurlar,
          images: doc.gorseller.map((g) => ({ alt: g.alt })),
        },
      })
    }

    const belgeCiktisi = Object.values(input.inputs).find(
      (v): v is { readonly document: DocumentModel } =>
        v !== null && typeof v === 'object' && (v as { document?: unknown }).document !== undefined
    )
    if (belgeCiktisi === undefined) return err(hata('validation', 'NO_DOCUMENT', ctx))

    mkdirSync(deps.outDir, { recursive: true })

    // ── PDF yolu (§7.6 · FAZ-6.1, 6.3) ──────────────────────────────────────
    //
    // ⚠ **Bu dal FAZ 6 denetiminde EKSİK bulundu** (D-216): `renderDeckPdf` ve
    // `renderLinkedinDocument` yazılmış, test edilmiş ve hiç ÇAĞRILMAMIŞTI. Gövde her
    // zaman PNG yazıyordu; `format: pdf` kısıtı YAML'da duruyor ama kimse okumuyordu.
    // Diskte sıfır PDF vardı ve `deck.pdf üretiliyor` kriteri tikliydi.
    //
    // `flatten` ayrımı kanala ait (D-207): deck metin katmanını korur, LinkedIn
    // dökümanı rasterleşir.
    if (input.constraints['format'] === 'pdf') {
      const sayfalar = deckPages(belgeCiktisi.document, deps.layout)
      const duzlestir = input.constraints['flatten'] === true
      const cikti = join(deps.outDir, duzlestir ? 'dokuman.pdf' : 'deck.pdf')

      if (duzlestir) {
        // ⚠ `max_pages` kısıtı YAML'da duruyordu ve hiçbir kod okumuyordu; sınır
        // yalnız `LINKEDIN_DOC_MAX_SAYFA` sabitinden geliyordu (2. doğrulama turu,
        // bulgu 14). Ölü bir kısıt, okunduğu sanılan bir kısıttır — ve YAML'ı
        // değiştiren kişi hiçbir şeyin değişmediğini fark etmez.
        // **Platform sınırı ÖNCE** (2. doğrulama turu, M3): editoryal tavan önce
        // koşarsa 350 sayfalık bir belge "bizim kararımız, aşılabilir" (`max: 10`)
        // cevabı alır ve "tavanı 400 yapayım" refleksi doğar — D-223'ün tam olarak
        // önlemek istediği şey. Platform sınırı aşılamaz bir OLGU olduğu için
        // sıranın başında durur.
        if (sayfalar.length > LINKEDIN_PLATFORM_MAX_SAYFA) {
          return err(
            hata('validation', 'DOCUMENT_REJECTED', ctx, {
              refusal: {
                kind: 'platform_limit',
                count: sayfalar.length,
                max: LINKEDIN_PLATFORM_MAX_SAYFA,
              },
            })
          )
        }
        const maxPages = input.constraints['max_pages']
        if (typeof maxPages === 'number' && sayfalar.length > maxPages) {
          return err(
            hata('validation', 'DOCUMENT_REJECTED', ctx, {
              refusal: { kind: 'too_many_pages', count: sayfalar.length, max: maxPages },
            })
          )
        }
        const maxBytes = input.constraints['max_bytes']
        const r = await renderLinkedinDocument(
          sayfalar,
          cikti,
          typeof maxBytes === 'number' ? { maxBytes } : {}
        )
        if (!r.ok) return err(hata('render_failed', 'RENDER_FAILED', ctx, { error: r.error }))
        if (isLinkedinDocError(r.value)) {
          // Sayfa tavanı ve bayt tavanı BURADA zorlanıyor — "üretildi ama reddedilir"
          // bir dosya, reddedilen bir dosyadan tehlikelidir.
          return err(hata('validation', 'DOCUMENT_REJECTED', ctx, { refusal: r.value }))
        }
        return ok({
          costs: [
            {
              verb: 'RENDER' as VerbName,
              capability: 'image.render',
              providerId: 'local-chromium',
              amount: ZERO_USD,
              kind: 'actual' as const,
            },
          ],
          data: {
            document: r.value.path,
            pages: r.value.pageCount,
            quality: r.value.quality,
            bytes: r.value.bytes,
            flattened: true,
          },
        })
      }

      const r = await renderDeckPdf(sayfalar, cikti)
      if (!r.ok) return err(hata('render_failed', 'RENDER_FAILED', ctx, { error: r.error }))
      return ok({
        costs: [
          {
            verb: 'RENDER' as VerbName,
            capability: 'image.render',
            providerId: 'local-chromium',
            amount: ZERO_USD,
            kind: 'actual' as const,
          },
        ],
        data: {
          deck: r.value.path,
          pages: r.value.pageCount,
          oversizedPages: r.value.oversizedPages,
          flattened: false,
        },
      })
    }

    // Taşma BÖLER, asla küçültmez (§7.1): her slayt kendi PNG'si.
    // Kulp markanın süreklilik ögesi: ızgaraya bakan göz onu tanır (D-254).
    const slaytlar = paginateDocument(belgeCiktisi.document, deps.layout, deps.kulp)

    const yollar: string[] = []
    const basamaklar: number[] = []
    const boyutlar: number[] = []

    // ⚠ **Tarayıcı bir kez açılıyor, slayt başına değil** (FAZ-10.1). Önceki hâlde her
    // `renderStatic` çağrısı Chromium'u sıfırdan başlatıyordu; kalite merdiveni
    // devredeyse basamak başına bir kez daha. Ölçüldü: 5 slayt için 3656 ms → 704 ms.
    //
    // Oturum İŞİN ömrü kadar yaşıyor ve `withOturum` her yolda kapatıyor — süreç ömrü
    // boyunca yaşayan bir singleton DEĞİL (bkz. `browser.ts`). Hız aynı, sızıntı
    // garantisi duruyor.
    const oturumSonucu = await withOturum(async (oturum) => {
      for (const [i, slayt] of slaytlar.entries()) {
        const taban = join(deps.outDir, `slayt-${String(i + 1).padStart(2, '0')}.png`)
        if (deps.maxBytes === undefined) {
          const r = await renderStatic(slayt, taban, oturum)
          if (!r.ok) {
            return err(
              hata('render_failed', 'RENDER_FAILED', ctx, { slide: i + 1, error: r.error })
            )
          }
          yollar.push(taban)
          continue
        }
        // Merdiven: her basamak GERÇEK bir render ve GERÇEK bir ölçüm. Tükenirse hata —
        // son basamağı "en iyisi buydu" diye kabul etmek, sınırı aşan bir varlığı yayına
        // göndermektir (§9.1).
        const r = await renderWithinLimit(slayt, taban, deps.maxBytes, oturum)
        if (!r.ok) {
          return err(
            hata('render_failed', 'SIZE_LIMIT_EXCEEDED', ctx, { slide: i + 1, error: r.error })
          )
        }
        yollar.push(r.value.path)
        basamaklar.push(r.value.rungIndex + 1)
        boyutlar.push(r.value.bytes)
      }
      return null
    })
    // Oturum içinden dönen `err(...)` bir DEĞER olarak geliyor; `null` "tüm slaytlar
    // basıldı" demek. Hata yutulmuyor: oturumun kendisi düşerse (tarayıcı açılamadı)
    // o da burada yakalanıyor.
    if (oturumSonucu.ok && oturumSonucu.value !== null) return oturumSonucu.value
    if (!oturumSonucu.ok) {
      return err(hata('render_failed', 'RENDER_FAILED', ctx, { error: oturumSonucu.error }))
    }

    // Alt-text BELGEDEN okunuyor (R-34): görsel blokları sırayla slaytlara karşılık
    // geliyor. Uydurulmuş bir alt-text, kapının kendi ürettiği veriyi denetlemesi olurdu.
    const gorseller = slaytlar.flatMap((sayfa) =>
      ((sayfa as { blocks?: readonly unknown[] }).blocks ?? []).filter(
        (b): b is { readonly type: 'image'; readonly alt: string; readonly decorative?: boolean } =>
          (b as { type?: string }).type === 'image'
      )
    )

    // `RENDER` metered: Chromium bir kaynak harcar ve süre de bir maliyettir (§8.3).
    // Tutar sıfır ama olayın KENDİSİ deftere yazılır — sıfır bir bilgisizlik değil,
    // burada bir olgu.
    return ok({
      costs: [
        {
          verb: 'RENDER' as VerbName,
          capability: 'image.render',
          providerId: 'local-chromium',
          amount: ZERO_USD,
          kind: 'actual' as const,
        },
      ],
      data: {
        slides: yollar,
        count: yollar.length,
        // ⚠ **DIGEST — defterdeki işaretçi DOĞRULANABİLİR olmalı (FAZ-14.4 · D-263).**
        // Defter bugüne kadar slaytların YOLUNU ve BOYUTUNU yazıyordu ama içeriğini
        // kanıtlayan hiçbir şey yazmıyordu: dosya değişse defter aynı kalırdı. D-263
        // teslimat byte'ını defterden çıkarırken bu boşluğu AÇMIŞTI ve orada borç
        // olarak kayıtlıydı; burada kapanıyor. Yol nereye bakılacağını, digest NEYİN
        // bulunması gerektiğini söylüyor.
        digests: yollar.map(
          (y) => `sha256:${createHash('sha256').update(readFileSync(y)).digest('hex')}`
        ),
        // Hangi slaytlarda görsel bloğu var — QA renk metriklerini o slaytlarda
        // düşürüyor (D-258). **Üretici söylüyor**: sayfalayıcı hangi bloğun hangi
        // slayta düştüğünü bilen tek yer; tüketicinin tüm belgeye bakması, tek bir
        // görsel yüzünden bütün karoselin renk QA'sını kapatıyordu.
        gorselliSlaytlar: slaytlar
          .map((sy, i) =>
            ((sy as { blocks?: readonly unknown[] }).blocks ?? []).some(
              (b) => (b as { type?: string }).type === 'image'
            )
              ? i
              : -1
          )
          .filter((i) => i >= 0),
        ...(basamaklar.length > 0 ? { rung: basamaklar, bytes: boyutlar } : {}),
        // ⚠ **`assets` ÜRETİM tarafından basılıyor** (FAZ-8 denetimi, B2). `publishBody`
        // bu anahtarı arıyordu ve **hiçbir gövde onu üretmiyordu**: `renderBody`
        // `{slides, count}` veriyordu, yani `PUBLISH` her koşuda `NO_PUBLISHABLE_ASSET`
        // ile dönerdi. Daha kötüsü, testteki "RENDER çıktısının GERÇEK şekli" yorumu
        // bunu düzelttiğimi iddia ediyordu ve yanlıştı — aynı sınıfın BEŞİNCİ tekrarı
        // (D-216·222·224·8.3), bu sefer kendi kanıt yorumumun içinde.
        //
        // `altTr` belge modelinden geliyor, uydurulmuyor: `alt` boşsa boş kalır ve
        // yayın kapısı R-34 ile reddeder — doğru davranış. `digest` render edilen
        // BAYTIN özeti; CAS damgası koşu sonrasında basılıyor ve `PUBLISH` koşunun
        // İÇİNDE, o yüzden burada hesaplanıyor.
        assets: yollar.map((yol, i) => {
          const blok = gorseller[i]
          return {
            path: yol,
            altTr: blok?.alt ?? '',
            decorative: blok?.decorative === true,
            digest: `sha256:${createHash('sha256').update(readFileSync(yol)).digest('hex')}`,
          }
        }),
      },
    })
  })

// ── PROPOSE: çalışma ağacına yazan TEK fiil (§5.4 · R-14 · FAZ-6.10) ────────
//
// ⚠ **Gövdesi HİÇ YOKTU** (2. doğrulama turu, bulgu 9): `uret.mjs` fiil haritasında
// `PROPOSE` anahtarı yoktu ve `deck`, `linkedin-document`, `prospect-deck` üçü de
// `onay` adımıyla bitiyor. İnsan onaylayıp `--devam` dediğinde hat son adımda
// `VERB_NOT_IMPLEMENTED` ile patlıyordu — hiçbir manifestte `onay` adımı yok, yani
// bu yol hiç koşulmamıştı.
//
// **Bu gövde corpus'a YAZMAZ.** `PROPOSE`un yan etki sınıfı `write-tree` ama yazma
// darboğazı `packages/corpus/src/write.ts`te ve onay kuyruğu (FAZ-4.7) oradan geçiyor.
// Burada olan tek şey: onaylanmış çıktıyı ÖZETLEYİP deftere geçirmek. Yazmayı buraya
// koymak, onay kuyruğunu ATLAYAN ikinci bir yazma yolu açardı (R-14).

export const proposeBody = (): Verb =>
  govde('PROPOSE', async (ctx, input) => {
    // Kapı kararı motorda okunuyor (`run.ts`): buraya gelindiyse insan ONAYLADI.
    // Gövdenin işi kararı değil, SONUCU kaydetmek.
    const ciktilar = Object.values(input.inputs).filter(
      (v): v is Record<string, unknown> => v !== null && typeof v === 'object'
    )
    const varliklar = ciktilar.flatMap((o) => {
      const s = o['slides']
      if (Array.isArray(s)) return s.filter((x): x is string => typeof x === 'string')
      for (const anahtar of ['deck', 'document']) {
        const y = o[anahtar]
        if (typeof y === 'string') return [y]
      }
      return []
    })
    if (varliklar.length === 0) {
      // Onaylanacak bir şey yoksa onay bir kayıt değil, bir yanılsamadır.
      return err(hata('validation', 'NOTHING_TO_PROPOSE', ctx))
    }
    return ok({
      costs: [],
      data: {
        proposed: varliklar,
        proposedAt: ctx.clock.nowIso(),
      },
    })
  })

// ── INGEST: dış kaynak çeken TEK fiil (§14 · R-50 · D-40 · FAZ-6.10) ────────
//
// ⚠ **Bu gövde FAZ 6 denetiminde EKSİK bulundu** (D-216). Şelale, karantina, köken
// sidecar'ı ve enjeksiyon sınırı yazılmış ve test edilmişti — ama `INGEST` fiilinin
// gövdesi hiç yoktu. `uret.mjs`in fiil haritasında `INGEST` anahtarı bile yoktu, yani
// hattaki `arastir` adımı çalıştırılamıyordu.
//
// **Çıktı `fetchedAt` taşıyor** ve bu tesadüf değil: `inspectManifest`in `stale_source`
// dedektörü tam olarak o anahtarı arıyor (FAZ-6.6). Dedektör yazılmıştı, besleyeni
// yoktu — kural zincirinin kopuk halkası buydu.

export interface IngestDeps {
  /** Karantina kökü (repo kökü). Dosyalar `derived/ingest/<domain>/` altına iner. */
  readonly repoRoot: string
  /** Ortam — şelale hangi kaynakların hazır olduğunu buradan okur. Ağ ÇAĞIRMAZ. */
  readonly env: Readonly<Record<string, string | undefined>>
}

export const ingestBody = (deps: IngestDeps): Verb =>
  govde('INGEST', async (ctx, input) => {
    // Şelale planı: anahtarsız kaynak ATLANMIYOR, `bloke` işaretleniyor ve raporlanıyor.
    const plan = planWaterfall(deps.env)

    const url = typeof input.constraints['url'] === 'string' ? input.constraints['url'] : ''
    if (url === '') {
      // Kaynaksız `INGEST` sessizce boş dönmez: çekilecek bir şey yoksa bu bir HATADIR,
      // "hiçbir şey bulunamadı" değil. İkisi karışırsa araştırma yapılmamış bir deck
      // "araştırıldı" diye görünür.
      return err(
        hata('validation', 'NO_SOURCE_URL', ctx, {
          hazir: plan.hazirSayisi,
          bloke: plan.steps.filter((x) => x.durum === 'bloke').map((x) => x.id),
        })
      )
    }

    const r = await fetchSource({
      url,
      sourceId: 'own-site',
      confidence: 'direct',
      fetchedAt: ctx.clock.nowIso(),
      correlationId: ctx.correlationId,
      ...(ctx.signal === undefined ? {} : { signal: ctx.signal }),
    })
    if (isIngestFailure(r)) {
      return err(hata('io', 'INGEST_FAILED', ctx, { refusal: r }))
    }

    // Metin ve sidecar YAN YANA yazılıyor; sidecar metne GÖMÜLMÜYOR — gömülü meta veri
    // modele gider ve modelin okuduğu her satır bir enjeksiyon yüzeyidir (§14).
    const metinYolu = join(deps.repoRoot, r.paths.text)
    mkdirSync(dirname(metinYolu), { recursive: true })
    writeFileSync(metinYolu, r.text)
    writeFileSync(join(deps.repoRoot, r.paths.sidecar), provenanceJson(r.provenance))

    return ok({
      costs: [
        {
          verb: 'INGEST' as VerbName,
          capability: 'web.fetch',
          providerId: 'own-site',
          amount: ZERO_USD,
          kind: 'actual' as const,
        },
      ],
      data: {
        // ⚠ `fetchedAt` ve `sourceRef` manifest dedektörünün OKUDUĞU anahtarlar
        // (`stale_source`, FAZ-6.6). Adları değişirse dedektör sessizce körleşir.
        fetchedAt: r.provenance.fetchedAt,
        sourceRef: r.provenance.sourceRef,
        domain: r.provenance.domain,
        bytes: r.provenance.bytes,
        quarantinePath: r.paths.text,
        // Bloke kaynaklar RAPORLANIYOR: "5 kaynak tarandı" diyen ama 1 kaynak taramış
        // bir araştırma, eksik araştırmadan tehlikelidir (eksikliği görünmez).
        sourcesReady: plan.hazirSayisi,
        sourcesBlocked: plan.blokeSayisi,
      },
    })
  })

// ── VALIDATE: QA + lexicon, model yargısı YOK ───────────────────────────────
export interface ValidateDeps {
  /**
   * **Lexicon denetimi — çıktı biçiminden BAĞIMSIZ** (§11.2 · R-32, R-35).
   *
   * ⚠ İlk sürümde lexicon `check`in İÇİNDEYDİ ve `check` yalnız `slides` varken
   * çağrılıyordu. PDF çıktısı `slides` taşımaz → kaynaksız sayı kapısı `deck`,
   * `linkedin-document` ve `prospect-deck` hatlarında **hiç koşmuyordu** — yani fazın
   * çıxış kriteri ("her sayısal iddia `claim_source` taşıyor") üretimde zorlanmıyordu.
   * İkinci doğrulama turu yakaladı. Lexicon yalnız BELGEYE bakar; rastere değil.
   */
  readonly lint: (doc: DocumentModel) => readonly { readonly kind: string }[]
  readonly check: (
    doc: DocumentModel,
    slides: readonly string[],
    /** Görsel bloğu TAŞIYAN slayt indeksleri — renk metrikleri orada düşüyor (D-258). */
    gorselliSlaytlar?: readonly number[]
  ) => Promise<{
    readonly blocked: boolean
    /** İnsan okunur rapor — CLI çıktısı ve hata gövdesi için. */
    readonly report: string
    /**
     * YAPILANDIRILMIŞ okumalar (§11.1 · FAZ-4.8).
     *
     * Rapor metni bir ÖLÜ UÇTUR: tolerans bileşeni sayının altına bant çizemez, çünkü
     * sayı bir dizenin içindedir. Ölçüm kaynağında zaten yapılandırılmış (`measure()`
     * `QaReport` döner); metne düzleştirip UI'da yeniden ayrıştırmak, aynı bilgiyi iki
     * kez temsil etmek ve ikisinin ayrışmasını beklemek olurdu.
     *
     * İsteğe bağlı: eski çağıranlar (yalnız metin veren) çalışmaya devam eder.
     */
    readonly readings?: readonly ToleranceReading[]
  }>
}

export const validateBody = (deps: ValidateDeps): Verb =>
  govde('VALIDATE', async (ctx, input) => {
    // ⚠ ⚠ **EN SON belge alınıyor, ilki DEĞİL — bağımsız doğrulama bunu yakaladı.**
    // `inputs` bütün üst akış çıktılarını taşıyor ve `ciktilar` topolojik sırada
    // dolduğu için anahtar sırası = üretim sırası. `.find()` İLK eşleşeni alıyordu:
    // yani `kompozit`in belgesini — `render`ın gerçekten tükettiği `yuva-doldur`
    // belgesini değil. Sonuç: yuva bir gün dolduğunda plan 1 görsel bekler, denetlenen
    // belgede 0 vardır ve **yanlış `PLAN_MISMATCH`** doğar; aynı yanlış belge QA'ya da
    // gider. Denetim ÜRETİLEN dosyaya bakar (D-259) — en aşağıdaki üreticiye.
    //
    // Adım ADINA bakılmıyor: aynı gövde birden çok hatta koşuyor. Sıra ise sözleşmenin
    // kendisi — en son yazan, `render`a giden.
    const belgeler = Object.values(input.inputs).filter(
      (v): v is { readonly document: DocumentModel } =>
        v !== null && typeof v === 'object' && (v as { document?: unknown }).document !== undefined
    )
    const belge = belgeler[belgeler.length - 1]
    const render = Object.values(input.inputs).find(
      (
        v
      ): v is {
        readonly slides: readonly string[]
        readonly gorselliSlaytlar?: readonly number[]
      } => v !== null && typeof v === 'object' && Array.isArray((v as { slides?: unknown }).slides)
    )
    // PDF çıktısı `slides` TAŞIMAZ (`deck` ya da `document` taşır). İlk sürüm yalnız
    // `slides` arıyordu ve PDF hattı `NOTHING_TO_VALIDATE` ile duruyordu — PDF yolunu
    // bağlarken açılan boşluk (FAZ-6.10).
    const pdf = Object.values(input.inputs).find(
      (v): v is { readonly deck?: string; readonly document?: string } =>
        v !== null &&
        typeof v === 'object' &&
        (typeof (v as { deck?: unknown }).deck === 'string' ||
          typeof (v as { document?: unknown }).document === 'string')
    )
    // ── PANORAMA YOLU: belge `document` değil `panorama` (FAZ-15.9 · D-268) ──
    //
    // ⚠ ⚠ **BU DAL GERÇEK BİR KOŞUDAN SONRA AÇILDI.** Katalog hattı on adımı geçti,
    // dört slayt damgalandı ve `kalite` `NOTHING_TO_VALIDATE` ile durdu: doğrulama
    // `document` arıyordu, panorama yolu `panorama` üretiyor. Kusur PDF yolunda birebir
    // aynı sebeple yaşanmıştı (bir üstteki not) — yeni bir çıktı şekli açan her yol,
    // doğrulamaya kendini TANITMAK zorunda.
    //
    // ⚠ Panorama belgesi `DocumentModel` DEĞİL: blok listesi değil kart listesi taşıyor
    // ve blok tabanlı denetimler (`planDenetle`, lexicon) ona uygulanamaz. Uygulanan
    // denetim render'ın kendi ölçtüğü kusur listesi; ikinci bir ölçüm ikinci bir
    // doğruluk kaynağı olurdu.
    // ⚠ Aynı sebep: doğrulama da EN SON üretilen belgeye bakar (bkz. yukarıdaki not).
    const panoramaListesi = Object.values(input.inputs).filter(
      (v): v is { readonly panorama: unknown } =>
        v !== null && typeof v === 'object' && (v as { panorama?: unknown }).panorama !== undefined
    )
    const panorama = panoramaListesi[panoramaListesi.length - 1]
    if (belge === undefined && panorama !== undefined && render !== undefined) {
      const kusurlar = ((): readonly { readonly aciklama?: string }[] => {
        const r = render as { kusurlar?: unknown }
        return Array.isArray(r.kusurlar) ? (r.kusurlar as { aciklama?: string }[]) : []
      })()
      return ok({
        costs: [],
        data: {
          gecti: kusurlar.length === 0,
          slaytSayisi: render.slides.length,
          // ⚠ Kusurlar SUSTURULMUYOR: sayı da metin de çıktıya giriyor ve insan onay
          // kapısı onları görüyor. "Geçti" demek, kusur olmadığını göstermekle aynı şey
          // değildir; ikisi ayrı alan.
          kusurSayisi: kusurlar.length,
          bulgular: kusurlar.map((k) => k.aciklama ?? '').filter((t) => t !== ''),
        },
      })
    }

    if (belge === undefined || (render === undefined && pdf === undefined)) {
      return err(hata('validation', 'NOTHING_TO_VALIDATE', ctx))
    }

    // ── UYUM: çıktı planı uyguladı mı (FAZ-14.4) ────────────────────────────
    //
    // ⚠ **En başta ve AYRI bir hata sınıfıyla.** Uyumsuzluk `internal`: render planı
    // uygulamadı, yani KOD bozuk. Metrik ihlali ise `policy_blocked`: kod doğru
    // çalışıyor olabilir ama çıktı yayınlanamaz. Aynı kovaya konsalardı bir render
    // hatası "tolerans dışı" diye görülür ve içerik suçlanırdı — FAZ-10'da ölçenin
    // hatası tam olarak böyle ölçülenin hatası sanılmıştı.
    //
    // Plan yoksa denetim ATLANIYOR: eski belgeler ve PDF yolu plansız geliyor ve
    // "plan yok" bir uyumsuzluk değil, denetim yokluğudur.
    // Plan da EN SON yazandan: iki compose adımı da plan üretiyor ve ikisi deterministik
    // olarak aynı planı veriyor, ama tutarlı olmak için denetlenen belgeyle aynı adımdan
    // okumak gerekiyor — biri değişirse sapma sessizce gizlenmesin.
    const planlilar = Object.values(input.inputs).filter(
      (v): v is { readonly tasarimPlani: TasarimPlani } =>
        v !== null &&
        typeof v === 'object' &&
        (v as { tasarimPlani?: unknown }).tasarimPlani !== undefined
    )
    const planli = planlilar[planlilar.length - 1]
    if (planli !== undefined) {
      // ⚠ Görsel üretimi ATLANDI mı: adım çıktısı `null` (isteğe bağlı adım düştü) ya da
      // `atlandi: true` (prompt yoktu). İkisi de "yuva meşru sebeple boş" demek.
      const gorselAtlandi =
        'gorsel-uret' in input.inputs &&
        (input.inputs['gorsel-uret'] === null ||
          (input.inputs['gorsel-uret'] as { atlandi?: unknown } | undefined)?.atlandi === true)
      const uyumsuz = planDenetle(planli.tasarimPlani, belge.document, {
        gorsel: gorselAtlandi,
      })
      if (uyumsuz.length > 0) {
        return err(
          hata('internal', 'PLAN_MISMATCH', ctx, {
            count: uyumsuz.length,
            detail: uyumsuzlukOzeti(uyumsuz),
          })
        )
      }
    }

    // ── lexicon: HER çıktı biçiminde (§11.2 · R-32) ─────────────────────────
    // Belgeye bakar, rastere değil — bu yüzden PDF yolunda da koşar. Kaynaksız sayısal
    // iddia yayınlanamaz ve bu kural çıktı biçimine göre değişmez.
    const lexIhlalleri = deps.lint(belge.document)
    if (lexIhlalleri.length > 0) {
      const turler = [...new Set(lexIhlalleri.map((v) => v.kind))].join(', ')
      return err(
        hata('policy_blocked', 'LEXICON_BLOCKED', ctx, {
          count: lexIhlalleri.length,
          kinds: turler,
          rule: 'R-32/R-35',
        })
      )
    }

    // Piksel QA yalnız PNG üzerinde anlamlı: ΔE ve kaplama ölçümleri bir raster ister.
    // PDF'te bu denetim **ATLANIYOR ve bu YAZILIYOR** — atlanan bir denetim "temiz"
    // değildir (D-175 ailesi) ve manifest ikisini ayırt edebilmeli.
    const sonuc =
      render === undefined
        ? { blocked: false, report: 'piksel QA ATLANDI: çıktı PDF, raster ölçüm yok' }
        : // ⚠ Üçüncü argüman: hangi slaytlarda GÖRSEL var (D-258). Denetleyici bunu
          // tahmin edemez — `belge.document` TÜM belgedir ve ona bakmak tek bir görsel
          // yüzünden bütün karoselin renk QA'sını kapatıyordu. Bilgi RENDER çıktısından
          // geliyor: hangi bloğun hangi slayta düştüğünü sayfalayıcı bilir.
          await deps.check(belge.document, render.slides, render.gorselliSlaytlar ?? [])
    if (sonuc.blocked) {
      // QA sınır dışıysa hat DURUR. "Uyarı verip devam etmek", tolerans okumasını
      // bir süse çevirirdi (§11.1).
      return err(hata('policy_blocked', 'QA_OUT_OF_TOLERANCE', ctx, { report: sonuc.report }))
    }

    // ── zincir (§10 · D-216 · FAZ-6.9) ──────────────────────────────────────
    //
    // ⚠ **`chain:` kısıtı FAZ 6 denetiminde ÖLÜ bulundu**: `prospect-deck.pipeline.yaml`
    // onu yazıyordu, hiçbir kod okumuyordu ve `prospectDeckZinciri`nin sıfır çağıranı
    // vardı. Beş kapı yazılmış, test edilmiş ve hiç koşmamıştı.
    const zincirAdi = input.constraints['chain']
    if (zincirAdi === 'prospect-deck') {
      const z = prospectDeckZinciri({
        kaynaklar: ingestKaynaklari(input.inputs),
        alanlar: kisiselAlanlar(input.inputs),
        urunEkranlari: urunEkranlari(input.inputs),
        // Lexicon yukarıda KOŞTU ve boş çıktı (dolu olsaydı adım zaten durmuştu).
        // Zincire gerçek sonucu veriyoruz — eski hâli sabit `[]` geçiyordu ve yorumu
        // "check'in içinde koştu" diyordu; koşmamıştı (2. doğrulama turu).
        lexiconIhlalleri: lexIhlalleri,
        // Manifest kusurları YAYIN anında `inspectManifest`te bakılıyor: adım koşarken
        // manifest henüz yazılmadı ve olmayan bir defteri denetlemek uydurma olurdu.
        manifestKusurlari: [],
        now: ctx.clock.nowIso(),
      })
      if (!z.gecti) {
        return err(
          hata('policy_blocked', 'CHAIN_BLOCKED', ctx, {
            kapi: z.kapi,
            mesaj: z.mesaj,
            kosulanKapilar: z.kosulanKapilar,
          })
        )
      }
      return ok({
        costs: [],
        data: {
          qa: sonuc.report,
          ...(sonuc.readings === undefined ? {} : { qaReadings: sonuc.readings }),
          chain: 'prospect-deck',
          chainGates: z.kosulanKapilar,
        },
      })
    }

    return ok({
      costs: [],
      // Hem metin hem YAPILANDIRILMIŞ okuma manifeste gider: biri insan için, diğeri
      // ekran için. Yalnız metin yazsaydık imza öğesi (§11.1) hiç çizilemezdi.
      data: {
        qa: sonuc.report,
        ...(sonuc.readings === undefined ? {} : { qaReadings: sonuc.readings }),
      },
    })
  })

// ── zincir girdisini önceki adım ÇIKTILARINDAN toplar ───────────────────────
//
// Anahtar adları `inspectManifest`in aradıklarıyla AYNI olmak zorunda: `fetchedAt`,
// `personalizationFields`, `productShots`. Aynı veri hem adım anında (zincir) hem yayın
// anında (manifest) denetleniyor — iki kontrol noktası değil, aynı kuralın iki anı.

const ingestKaynaklari = (inputs: Readonly<Record<string, unknown>>): readonly Kaynak[] =>
  Object.values(inputs).flatMap((v) => {
    if (v === null || typeof v !== 'object') return []
    const o = v as { fetchedAt?: unknown; sourceRef?: unknown }
    return typeof o.fetchedAt === 'string'
      ? [
          {
            sourceRef: typeof o.sourceRef === 'string' ? o.sourceRef : 'bilinmiyor',
            fetchedAt: o.fetchedAt,
          },
        ]
      : []
  })

const kisiselAlanlar = (inputs: Readonly<Record<string, unknown>>): readonly KisiselAlan[] =>
  Object.values(inputs).flatMap((v) => {
    if (v === null || typeof v !== 'object') return []
    const alanlar = (v as { personalizationFields?: unknown }).personalizationFields
    if (!Array.isArray(alanlar)) return []
    return alanlar.map((a, i) => {
      const o = (a ?? {}) as Record<string, unknown>
      return {
        id: typeof o['id'] === 'string' ? o['id'] : `alan-${i}`,
        label: typeof o['label'] === 'string' ? o['label'] : String(a),
        sourceRef: typeof o['sourceRef'] === 'string' ? o['sourceRef'] : 'bilinmiyor',
        confidence: (o['confidence'] === 'direct' || o['confidence'] === 'corroborating'
          ? o['confidence']
          : 'pointer') as KisiselAlan['confidence'],
      }
    })
  })

const urunEkranlari = (
  inputs: Readonly<Record<string, unknown>>
): readonly { readonly aiGenerated?: unknown; readonly basis?: { readonly kind?: unknown } }[] =>
  Object.values(inputs).flatMap((v) => {
    if (v === null || typeof v !== 'object') return []
    const g = (v as { productShots?: unknown }).productShots
    return Array.isArray(g) ? (g as { aiGenerated?: unknown; basis?: { kind?: unknown } }[]) : []
  })

// ── GENERATE: yalnız sağlayıcı ──────────────────────────────────────────────
export interface GenerateDeps {
  /** Yönlendiricinin seçtiği id'den adaptörü bulur. `adapterById` geçilir. */
  readonly resolveAdapter: (providerId: string) => ProviderAdapter | null
  /** Ortam AÇIKÇA verilir (§14); gövde `process.env`e dokunamaz. */
  readonly env: Readonly<Record<string, string>>
  readonly capability: string
  /** Test bunu 0 yapar; üretimde gerçekten bekler. */
  readonly sleep?: (ms: number, signal: AbortSignal) => Promise<void>
}

/**
 * `GENERATE` — **gerçek sağlayıcıya gider** (§3.10 · R-04).
 *
 * Zincir: yönlendirici kazananı seçer → gövde adaptörü bulur → `validate()` girdiyi
 * doğrular (prompt R-20 kurucusundan geçer) → `providerCall` işi başlatır, tutamağı
 * deftere yazdırır, jitter'lı polling yapar.
 *
 * İlk sürümde bu zincir YOKTU: `uret.mjs` sabit bir `MISSING_CREDENTIALS` döndüren
 * sahte bir köprü kuruyordu ve `cloudflareImage`/`falImage` adaptörlerine hiç
 * ulaşılmıyordu (D-141). Yani "iki şerit de görsel üretiyor" iddiası hiç sınanmamıştı.
 */
/**
 * Prompt'u içerikten türetir. **Yetenek hangi kurucuya gideceğini belirler.**
 *
 * Görsel adımı kendi prompt'unu KURMAZ: `gorsel-brief` adımının çıktısını okur
 * (D-241). Türkçe konuyu doğrudan görsel modeline vermek ölçülerek elendi; brief'i
 * bir metin modeli yazınca R-20 ve 9. yasa kapıları o metnin üzerinden geçiyor.
 */
interface YargiHedefi {
  readonly yol: string
  readonly slayt: number
  readonly toplam: number
  readonly genislik: number
  readonly yukseklik: number
}

/**
 * Yargılanacak slaytları RENDER çıktısından okur.
 *
 * **`slides` anahtarı `renderBody`nin ürettiği şekilden geliyor** — varsayılmıyor,
 * okunuyor. Bu deponun en sık tekrarlayan hatası üretici ile tüketicinin farklı şekil
 * beklemesiydi (D-227, D-246); burada üretici tarafı aynı dosyada ve iki uç birbirini
 * görüyor.
 */
const yargilanacakSlaytlar = (input: BodyInput): readonly YargiHedefi[] => {
  for (const ad of input.needs ?? Object.keys(input.inputs)) {
    const v = input.inputs[ad] as
      { slides?: unknown; width?: unknown; height?: unknown } | undefined
    if (v === undefined || !Array.isArray(v.slides)) continue
    const yollar = v.slides.filter((x): x is string => typeof x === 'string')
    if (yollar.length === 0) continue
    const g = typeof v.width === 'number' ? v.width : 1080
    const y = typeof v.height === 'number' ? v.height : 1350
    return yollar.map((yol, i) => ({
      yol,
      slayt: i + 1,
      toplam: yollar.length,
      genislik: g,
      yukseklik: y,
    }))
  }
  return []
}

/**
 * Yetenek + adım girdisinden prompt kurar — **hattın dikişi.**
 *
 * ⚠ Dışa açık olması test içindir ve bilinçli: bu fonksiyon `kompozit` çıktısındaki
 * tasarım planını okuyup brief'e yuvayı taşıyor. Zincirin koptuğu yer tam burası olurdu
 * ve kopuş SESSİZ olurdu — brief yine üretilir, yalnız yuvayı bilmezdi. Bu projede aynı
 * sınıf hata (`chart`, `diagram`, `tasarimOlc`) üç kez yaşandı; dikişi test etmeden
 * bağlandığını iddia etmek dördüncüsü olurdu.
 */
export const promptTuret = (yetenek: string, input: BodyInput): string => {
  const konu = typeof input.constraints['topic'] === 'string' ? input.constraints['topic'] : ''
  const kacinilacak =
    typeof input.constraints['kacinilacak'] === 'string'
      ? input.constraints['kacinilacak']
      : undefined

  // ⚠ `image.critique` `image.` ile BAŞLIYOR ama görsel ÜRETMİYOR — yargılıyor. Bu dal
  // aşağıdaki `image.*` dalından ÖNCE gelmek zorunda; sonra gelseydi yargı adımı bir
  // görsel brief'i arar, bulamaz ve boş prompt'la düşerdi. Ön ek eşleşmesiyle kurulan
  // her dal, ön eki paylaşan ikinci bir yeteneğin geleceğini varsaymalı.
  if (yetenek === 'image.critique') {
    const slaytlar = yargilanacakSlaytlar(input)
    if (slaytlar.length === 0) return ''
    const ilk = slaytlar[0] as YargiHedefi
    return yargiPromptu(ilk)
  }

  // ⚠ `design.` ön eki `image.`/`video.` dallarından ÖNCE: yeni bir ön ek eklemek,
  // aşağıdaki dalın "geri kalan her şey görsel brief'idir" varsayımını bozar. Aynı tuzak
  // `image.critique`te bir kez yaşandı — ön ekle kurulan her dal komşusunu varsaymalı.
  if (yetenek === 'design.critique') {
    const slaytlar = yargilanacakSlaytlar(input)
    if (slaytlar.length === 0) return ''
    const ilk = slaytlar[0] as YargiHedefi
    return tasarimYargiPromptu(ilk)
  }

  // ── ARKA PLAN SİLME: girdi METİN DEĞİL, GÖRSEL ─────────────────────────
  //
  // ⚠ ⚠ **BU DAL `image.*` DALINDAN ÖNCE OLMAK ZORUNDA ve ilk sürüm SONRAYA KOYDU.**
  // Bir üstteki `image.critique` notu bu tuzağı KELİMESİ KELİMESİNE uyarıyordu:
  // *"ön ek eşleşmesiyle kurulan her dal, ön eki paylaşan ikinci bir yeteneğin
  // geleceğini varsaymalı."* `image.matte` de `image.` ile başlıyor ve aşağıdaki
  // görsel-üretim dalı onu yakalayıp erken dönüyordu; gerçek koşuda `gorsel-kirp`
  // `{atlandi: true, sebep: 'prompt-yok'}` yazdı ve arka plan silme HİÇ koşmadı.
  // Yazılı bir ders, aynı dosyaya eklenen yeni dala kendiliğinden geçmiyor.
  //
  // ⚠ İstem bir YER TUTUCU: bu yetenekte metin bir şey ifade etmiyor ama boş bırakmak
  // adımı sessizce düşürür. Gerçek girdi `image_base64` kısıtında.
  // ⚠ Silinecek görsel yoksa istem BOŞ: silinecek bir şey olmadan model çağırmak,
  // bir önceki adımın düşmesini gizlemek olurdu.
  if (yetenek === 'image.matte') {
    // ⚠ ⚠ **`needs` AÇIKÇA GEÇİLİYOR — "DAG zaten daraltıyor" VARSAYIMI YANLIŞTI.**
    // Burada bir yorum satırı "needs girdiyi zaten daraltıyor" diyordu; `run.ts` ise her
    // adıma TÜM çıktıları geçiyor. Sonuç: dört kırpma adımı da 1. görseli kırptı, kırpılmış
    // olan hamı ezdi ve dört yuvaya aynı figür girdi. Yorumun kendisi hataydı.
    return uretilenGorseller(input.inputs, input.needs).length === 0 ? '' : 'arka plan silme'
  }

  if (yetenek.startsWith('image.') || yetenek.startsWith('video.')) {
    // **Yalnız BAĞLANDIĞI adımların çıktısı okunuyor.** Adım id'sine göre değil,
    // DAG'a göre: hangi adımın brief üreteceğini hat dosyası `needs` ile söylüyor.
    // Tüm çıktılara bakmak, Türkçe gönderi metnini görsel prompt'u sanmaktı (D-246).
    for (const ad of input.needs ?? Object.keys(input.inputs)) {
      const d = duzMetin(input.inputs[ad])
      if (d === null) continue
      // ⚠ ⚠ **VARYANT GÖRSEL İSTEMİNE DOĞRUDAN EKLENİYOR — brief'e GÜVENMİYORUZ.**
      // Gerçek koşu: dört yuvaya dört ayrı brief adımı koştu, her birinin isteminde
      // farklı bir kadraj satırı vardı ve çıkan dört fotoğraf BİREBİR AYNIYDI. Sebep
      // yapısal: kadraj tarifi metin modelinden GEÇEREK gidiyordu ve model onu düzledi.
      // Bir modele "şunu koru" demek bir RİCA; garantiyi yapıya gömmek gerekiyor
      // (aynı ders `matlama` → `gorsel-kirp` geçişinde de öğrenildi).
      //
      // ⚠ Bu yüzden `gorsel-uret-K` artık `kompozit`e de BAĞLI: şablon kimliği olmadan
      // varyant tablosu okunamaz. Bağ koparsa varyant sessizce düşer ve dört özdeş
      // fotoğraf geri gelir — `katalog-dikis` testi bağı ölçüyor.
      const sira =
        typeof input.constraints['gorsel_sira'] === 'number' ? input.constraints['gorsel_sira'] : 1
      const sid = katalogSablonuId(input.inputs)
      const vs = sid === null ? [] : (sablonBul(sid)?.gorsel?.varyantlar ?? [])
      const varyant = vs[sira - 1]
      return varyant === undefined ? d : `${d}, ${varyant}`
    }
    return ''
  }

  const kayitlar = kayitlariTopla(input.inputs)
  const girdi = {
    konu,
    kayitlar,
    ...(typeof input.constraints['locale'] === 'string'
      ? { locale: input.constraints['locale'] }
      : {}),
    ...(typeof input.constraints['max_chars'] === 'number'
      ? { maxChars: input.constraints['max_chars'] }
      : {}),
    ...(kacinilacak === undefined ? {} : { kacinilacak }),
  }
  // ── ŞABLON UYARLAMA İSTEMİ (FAZ-15.7/15.9 · D-268) ───────────────────────
  //
  // ⚠ ⚠ **ŞABLON SEÇİMİ BURADA KOŞUYOR ve bu bir katman ihlali DEĞİL.** `sablonSec`
  // deterministik, model çağırmıyor, dosyaya dokunmuyor — bir istem kurucusu içinde
  // koşması `GENERATE`in yan etki sınıfını (`model çağırır`) değiştirmiyor. Seçimi ayrı
  // bir adıma çıkarmak onuncu bir fiil isterdi (R-02) ve dokuz fiil kapalı bir liste.
  //
  // ⚠ ⚠ **HAT ŞABLONU ZORLAYABİLİR ama SEÇEMEDİĞİNİ ZORLAYAMAZ.** `sablon` kısıtı
  // verilmişse doğrulanıyor; verilmemişse içeriğin şeklinden seçiliyor. Seçim başarısız
  // olursa istem BOŞ dönüyor ve adım çıktısız kalıyor — sessizce bir varsayılan şablona
  // düşmek, istenmeyen bir tasarımı istenmiş gibi teslim etmek olurdu (D-268).
  if (input.constraints['sablon_uyarla'] === true) {
    const s = sablonSecimiIcin(input)
    if (!s.ok) return ''
    return [
      uyarlamaIstemi(s.ornek, s.sablonId, konu),
      '',
      'Kaynak metin:',
      ...s.satirlar.map((t) => `- ${t}`),
      '',
      `Seçim gerekçesi (bilgi): ${s.neden}`,
    ].join('\n')
  }

  // ── KATALOG YOLUNDA BRIEF, ŞABLONUN KENDİ İLANINDAN ─────────────────────
  //
  // ⚠ ⚠ **BU DAL GERÇEK BİR KOŞUDAN SONRA AÇILDI ve eksikliği SESSİZDİ.** Hat uçtan uca
  // yeşil koştu; defterde `gorsel-brief` ve `gorsel-uret` `{atlandi: true, sebep:
  // 'prompt-yok'}` yazıyordu ve çıktıda kesik özne yerine yer tutucu duruyordu. Sebep:
  // brief kurucusu `tasarimPlani.slaytlar[].oge` arıyor — o, SLAYT-BAŞINA yolun şekli.
  // Katalog yolunda tasarım planı yok; ihtiyacı ŞABLON KAYDI ilan ediyor (`briefTemeli`).
  //
  // ⚠ **İhtiyaç ilan edilmemişse brief de YOK.** `veri-hikayesi` ve `akan-alan` görsel
  // istemiyor; onlara brief yazmak, kullanılmayacak bir görsel için kota harcamaktı
  // (D-261'in birebir tekrarı).
  if (input.constraints['gorsel_brief'] === true) {
    const sablonId = katalogSablonuId(input.inputs)
    if (sablonId !== null) {
      const kayit = sablonBul(sablonId)
      if (kayit?.gorsel === undefined || kayit.gorsel === null) return ''
      // ⚠ Brief İNGİLİZCE ve BÜYÜK HARFSİZ: R-20 muhafızı büyük harfli öbeği "metin
      // çizdirme isteği" sayıyor ve iki kez reddetti (katalog.ts kaydı).
      // ⚠ ⚠ **OLUMSUZLAMA YASAK — ve bunu GERÇEK BİR KOŞU öğretti.** İlk sürüm brief'e
      // *"do not ask for any lettering…"* diye bir talimat koyuyordu; model bunu
      // brief'in içine kopyaladı ve R-20 muhafızı `lettering` alt dizesini yakalayıp
      // görsel adımını REDDETTİ. Muhafız olumsuzlamayı anlamıyor: `no texture` içindeki
      // `no text` için de aynı yanlış pozitif kayıtlı (katalog.ts). Kırmızı bir kapının
      // kuralı aynı turda gevşetilmez (R-76) — brief YENİDEN YAZILDI.
      //
      // ⚠ Çözüm yapısal: brief yalnız KADRAJDA NE OLDUĞUNU söylüyor. İstenmeyen şeyi
      // adıyla anmayan bir istem, o adı çıktıya sızdıramaz.
      // ⚠ ⚠ **SIRA: KAÇINCI GÖRSEL.** Hat görsel adımlarını AÇARAK çoğaltıyor (`duzelt`
      // ile aynı gerekçe: DAG döngü taşımıyor) ve her adım kendi sırasını kısıtta taşıyor.
      // Sıra yoksa 1: tek görselli eski hatlar değişmeden çalışıyor.
      const sira =
        typeof input.constraints['gorsel_sira'] === 'number' ? input.constraints['gorsel_sira'] : 1
      const varyantlar = kayit.gorsel.varyantlar ?? []
      // ⚠ ⚠ **FAZLALIK SIRA BOŞ İSTEM DÖNDÜRÜR ve adım ATLANIR.** Şablonun iki yuvası
      // varsa üçüncü görsel adımı koşmamalı: koşarsa para harcanır, görsel üretilir ve
      // hiçbir yuvaya girmez — bu deponun "modül var, çıktı var, tüketen yok" sınıfının
      // ta kendisi. Atlama makinesi zaten var; yeni bir kaçış yolu açmaya gerek yok.
      if (sira > 1 && sira > varyantlar.length) return ''
      const varyant = varyantlar[sira - 1]
      return [
        'write one short image generation brief in english, lowercase only.',
        `keep this base description and add detail from the topic: ${kayit.gorsel.briefTemeli}`,
        // ⚠ Varyant KADRAJI söylüyor, konuyu değil: aynı konudan N özdeş görsel çıkmasın.
        ...(varyant === undefined ? [] : [`frame the subject like this: ${varyant}`]),
        `topic: ${konu}`,
        'describe only the subject, the lighting and the background surface.',
        'answer with the brief sentence alone.',
      ].join('\n')
    }
  }

  // ── DÜZELTME TURU: denetimin ölçtüğü kusurları metinle kapat ────────────
  //
  // ⚠ ⚠ **KUSUR YOKSA İSTEM BOŞ ve adım ATLANIYOR.** Zorla bir düzeltme turu koşturmak,
  // düzeltilecek şey olmadığında DEĞİŞİKLİK üretir: agent bir şey bulmak zorunda hisseder
  // ve insanın onayladığı metinden uzaklaşır. Kayıtlı ders (doğrulama turu tavanı) burada
  // da geçerli — tur bir hak değil, bir ihtiyaçtır.
  //
  // ⚠ Düzeltme çıktısı yine bir `Uyarlama`: kompozisyon alanları şemada YOK, yani
  // "düzeltme" adı altında tasarımı değiştirmek temsil edilemiyor.
  if (input.constraints['sablon_duzelt'] === true) {
    // ⚠ ⚠ **YALNIZ METİNLE DÜZELİR KUSURLAR TURA GİRİYOR.** Gerçek koşuda dört kusurun
    // dördü de `matlama-tutmuyor`du (görselin zemini siyah değil) ve tur yine koştu:
    // agent'a çözemeyeceği bir görev verildi, bir model çağrısı harcandı ve kusur aynen
    // kaldı. Çözemeyeceği bir şey verilen agent, çözebileceğini bozar.
    const kusurlar = duzeltilebilir(renderKusurlari(input.inputs))
    if (kusurlar.length === 0) return ''
    const onceki = sonUyarlama(input.inputs)
    if (onceki === null) return ''
    return [
      duzeltmeIstemi(kusurlar),
      '',
      'Düzeltilecek uyarlama (JSON):',
      JSON.stringify(onceki, null, 1),
      '',
      'ÇIKTI BİÇİMİ — yalnız düzeltilmiş JSON döndür, açıklama yazma. Kart sayısı,',
      '`sablonId` ve panel tipleri AYNI kalmalı; yalnız kusurlu alanları değiştir.',
    ].join('\n')
  }

  const gorselBriefMi = input.constraints['gorsel_brief'] === true
  // ⚠ **YUVA yalnız brief için aranıyor** ve `kompozit` çıktısından geliyor — yani bu
  // adım artık `kompozit`e BAĞLI (hat dosyasında `needs: [bilgi-sec, kompozit]`).
  // Bağlı olmasaydı `inputs`ta plan bulunmaz, `yuva` `undefined` kalır ve brief hiç
  // üretilmezdi: zincir sessizce kopardı. Bunun testi var.
  const yuva = gorselBriefMi ? yuvaBul(input.inputs) : undefined
  return (
    (gorselBriefMi
      ? gorselBriefPromptu(yuva === undefined ? girdi : { ...girdi, yuva })
      : icerikPromptu(girdi)) ?? ''
  )
}

/**
 * Şablon seçimini bir kez yapar — **istem kurucusu ve hata yolu AYNI cevabı görsün.**
 *
 * ⚠ ⚠ **BU AYRIM GERÇEK BİR KOŞUDAN DOĞDU.** İlk sürümde seçim yalnız istem kurucusunun
 * içindeydi ve başarısız olunca boş bir dize dönüyordu. Koşucu boş istemi "adım atlandı"
 * sayıp `{atlandi: true, sebep: 'prompt-yok'}` yazdı; hat iki adım sonra `NO_ADAPTATION`
 * ile durdu ve defterde şablonun NEDEN seçilemediğine dair tek satır yoktu. **Zorunlu bir
 * adımın sessizce atlanması, bu depoda yasak olan hata biçiminin ta kendisi.** Seçim
 * artık ayrı: istem onu kullanıyor, hata yolu da aynı gerekçeyi okuyup deftere yazıyor.
 */
export const sablonSecimiIcin = (
  input: BodyInput
):
  | {
      readonly ok: true
      readonly sablonId: string
      readonly ornek: KatalogOrnegi
      readonly neden: string
      readonly satirlar: readonly string[]
    }
  | { readonly ok: false; readonly sebep: string } => {
  const istenen =
    typeof input.constraints['sablon'] === 'string' ? input.constraints['sablon'] : undefined
  const satirlar = metinSatirlari(input.inputs)
  if (satirlar.length === 0)
    return { ok: false, sebep: 'önceki adımdan metin satırı gelmedi (`lines` yok)' }
  const secim = sablonSec(satirlar, {
    gorselUretilebilir: input.constraints['gorsel_uretilebilir'] !== false,
    ...(istenen === undefined ? {} : { istenen }),
  })
  if (!secim.ok)
    return {
      ok: false,
      sebep: `${secim.sebep} · ${satirlar.length} satır · puanlar: ${secim.puanlar
        .map((p) => `${p.id}=${p.puan}`)
        .join(' ')}`,
    }
  const ornek = ornekBul(secim.sablon.id)
  if (ornek === null) return { ok: false, sebep: `katalog tutarsız: ${secim.sablon.id} örneği yok` }
  return { ok: true, sablonId: secim.sablon.id, ornek, neden: secim.neden, satirlar }
}

/**
 * Model çıktısını `Uyarlama`ya çevirir — **şekli DOĞRULAYARAK.**
 *
 * ⚠ ⚠ **`JSON.parse` + `as Uyarlama` YETMEZ ve tam olarak bu yüzden yazıldı.** Bir tip
 * iddiası çalışma zamanında hiçbir şey kontrol etmiyor; model `kartlar` yerine `cards`
 * yazarsa nesne yine "geçerli" görünür ve `uyarla` boş bir kart dizisiyle çağrılır.
 * Alanlar tek tek sınanıyor ve eksik olan bir alan `null` döndürüyor — yarım bir
 * uyarlamayı kabul etmek, örnek içerikle gerçek içeriğin karıştığı bir karosel demek.
 *
 * ⚠ Model çıktısı bir kod bloğu içinde gelebiliyor; ilk `{` ile son `}` arası alınıyor.
 *
 * ⚠ ⚠ **SAĞLAYICI ŞEKLİ ÜÇ ADLA GELİYOR ve bunu GERÇEK BİR KOŞU öğretti.** İlk sürüm
 * yalnız `string` ve `{text}` biliyordu; `claude-code` adaptörü `{result}` döndürüyor.
 * Sonuç: nesne `JSON.stringify` ile sarmalanıp ayrıştırılıyor, içinde `sablonId`
 * bulunamıyor ve hat `ADAPTATION_UNPARSEABLE` ile duruyordu. `metneCevir` bu üç adı
 * (`result`/`text`/`content`) zaten biliyordu — ikinci bir liste yazmak D-227'nin
 * (üreticiyle tüketici arasında şekil uyuşmazlığı) tekrarıydı.
 */
const alan = (ham: unknown, ad: string): string | null =>
  ham !== null &&
  typeof ham === 'object' &&
  typeof (ham as Record<string, unknown>)[ad] === 'string'
    ? ((ham as Record<string, string>)[ad] as string)
    : null

export const uyarlamayaCevir = (ham: unknown): Uyarlama | null => {
  const metin =
    typeof ham === 'string'
      ? ham
      : (alan(ham, 'result') ?? alan(ham, 'text') ?? alan(ham, 'content') ?? JSON.stringify(ham))
  const bas = metin.indexOf('{')
  const son = metin.lastIndexOf('}')
  if (bas < 0 || son <= bas) return null
  let o: unknown
  try {
    o = JSON.parse(metin.slice(bas, son + 1))
  } catch {
    return null
  }
  const n = o as { sablonId?: unknown; kartlar?: unknown }
  if (typeof n.sablonId !== 'string' || !Array.isArray(n.kartlar)) return null
  const kartlar: UyarlamaKarti[] = []
  for (const k of n.kartlar) {
    if (k === null || typeof k !== 'object') return null
    const y = k as Record<string, unknown>
    const dize = (a: string): string | null => (typeof y[a] === 'string' ? (y[a] as string) : null)
    const ustBaslik = dize('ustBaslik')
    const baslik = dize('baslik')
    const govde = dize('govde')
    const hayalet = dize('hayalet')
    const rayaSol = dize('rayaSol')
    const rayaOrta = dize('rayaOrta')
    if (
      ustBaslik === null ||
      baslik === null ||
      govde === null ||
      hayalet === null ||
      rayaSol === null ||
      rayaOrta === null
    )
      return null
    kartlar.push({
      ustBaslik,
      baslik,
      govde,
      hayalet,
      rayaSol,
      rayaOrta,
      ...(y['panel'] === undefined
        ? {}
        : { panel: y['panel'] as NonNullable<UyarlamaKarti['panel']> }),
    })
  }
  return { sablonId: n.sablonId, kartlar }
}

/** Render adımının ölçtüğü kusurlar — düzeltme turunun girdisi. */
const renderKusurlari = (inputs: Readonly<Record<string, unknown>>): readonly DenetimKusuru[] => {
  for (const v of Object.values(inputs)) {
    if (v === null || typeof v !== 'object') continue
    const k = (v as { kusurlar?: unknown }).kusurlar
    if (Array.isArray(k)) return k as readonly DenetimKusuru[]
  }
  return []
}

/** Girdilerdeki EN SON uyarlama — düzeltme onun üstüne yazıyor. */
const sonUyarlama = (inputs: Readonly<Record<string, unknown>>): Uyarlama | null => {
  let son: Uyarlama | null = null
  for (const v of Object.values(inputs)) {
    if (v === null || typeof v !== 'object') continue
    const u = (v as { uyarlama?: unknown }).uyarlama
    if (u !== undefined) son = u as Uyarlama
  }
  return son
}

/**
 * Kompozit adımının seçtiği şablon id'si — katalog yolunun imzası.
 *
 * ⚠ Adım ADINA bakılmıyor (aynı gövde birden çok hatta koşuyor); `sablonId` alanının
 * varlığı katalog yolunda olduğumuzun kendisi.
 */
const katalogSablonuId = (inputs: Readonly<Record<string, unknown>>): string | null => {
  for (const v of Object.values(inputs)) {
    if (v === null || typeof v !== 'object') continue
    const id = (v as { sablonId?: unknown }).sablonId
    if (typeof id === 'string' && id !== '') return id
  }
  return null
}

/**
 * Önceki adımların ürettiği metin satırları — şekle bakarak bulunuyor.
 *
 * ⚠ Adım ADINA bakmak kırılgan: aynı gövde birden çok hatta koşuyor. `lines` alanı
 * `metin-uret`in sözleşmesi ve `composeBody` de onu böyle buluyor — iki yer aynı
 * şekli arıyor, iki ayrı ad değil.
 */
const metinSatirlari = (inputs: Readonly<Record<string, unknown>>): readonly string[] => {
  for (const v of Object.values(inputs)) {
    if (v === null || typeof v !== 'object') continue
    const l = (v as { lines?: unknown }).lines
    if (Array.isArray(l) && l.every((x) => typeof x === 'string')) return l as readonly string[]
  }
  return []
}

/**
 * Tasarım planındaki görsel yuvasını bulur — şekle bakarak, adım adına değil.
 *
 * ⚠ Adım ADINA bakmak kırılgan olurdu: aynı gövde birden çok hatta koşuyor ve adım
 * adları hattan hatta değişebilir. Şekil (`tasarimPlani.slaytlar[].oge.deger`) ise
 * sözleşmenin kendisi.
 */
const yuvaBul = (inputs: Readonly<Record<string, unknown>>): Yuva | undefined => {
  for (const v of Object.values(inputs)) {
    if (v === null || typeof v !== 'object') continue
    const plan = (v as { tasarimPlani?: TasarimPlani }).tasarimPlani
    if (plan === undefined) continue
    const i = plan.slaytlar.findIndex((s) => s.oge.deger === 'gorsel-yuvasi')
    if (i === -1) return undefined
    const s = plan.slaytlar[i] as (typeof plan.slaytlar)[number]
    return {
      slaytIndex: s.index,
      toplam: plan.slaytlar.length,
      islev: s.islev,
      satir: satirBul(inputs, s.index),
    }
  }
  return undefined
}

/** Yuvanın yanında duran satır — plan indeksi metin satırlarına karşılık geliyor. */
const satirBul = (inputs: Readonly<Record<string, unknown>>, index: number): string => {
  for (const v of Object.values(inputs)) {
    const m = metneCevir(v)
    if (m !== null) return m.lines[index] ?? ''
  }
  return ''
}

/** `SELECT` çıktısındaki kayıtları toplar — şekle bakarak, adım adına değil. */
const kayitlariTopla = (inputs: Readonly<Record<string, unknown>>): PromptKaydi[] => {
  for (const v of Object.values(inputs)) {
    if (v === null || typeof v !== 'object') continue
    const r = (v as { records?: unknown }).records
    if (!Array.isArray(r)) continue
    return r
      .filter((x): x is PromptKaydi => typeof (x as PromptKaydi)?.text === 'string')
      .map((x) => ({ id: String(x.id ?? ''), text: x.text }))
  }
  return []
}

export const generateBody = (deps: GenerateDeps): Verb =>
  govde('GENERATE', async (ctx, input) => {
    // **Yetenek ADIMDAN gelir** (D-241); `deps.capability` yalnız geriye dönük
    // varsayılan. Kurulumdan almak, tek bir gövdenin tüm `GENERATE` adımlarına
    // hizmet ettiği yerde metin adımını görsel yeteneğiyle koşturuyordu.
    const yetenek = input.capability ?? deps.capability

    // ── 9. yasa: SAĞLAYICI SEÇİLMEDEN ÖNCE (§11.3 · R-33 · D-239) ───────────
    //
    // ⚠ **Bu kapı bir adım GEÇ çalışıyordu.** `promptRequestsPerson` yalnız
    // `assertCompliance` içinde, yani DAMGALAMA anında koşuyordu. Sonuç: insan isteyen
    // bir prompt modele gidiyor, PARA HARCIYOR, görsel üretiliyor — ve ancak damga
    // aşamasında iddia kurulamıyor. İlk gerçek bake-off tam olarak bunu üretti:
    // "two factory workers in safety vests" prompt'u `validate()`ten geçti, çünkü R-20
    // yalnız METİN isteğini denetliyor, kişi isteğini değil.
    //
    // **Fail-closed olmak yetmez; ERKEN fail-closed olmak gerekir.** Harcanmış para
    // geri gelmez ve üretilmiş uyumsuz bir varlık diskte durur.
    //
    // En başta duruyor — yönlendirici bile çalışmadan. Reddedilecek bir iş için
    // sağlayıcı seçmek, seçimi manifest'e yazmak ve sonra reddetmek gürültüdür.
    //
    // Kontrol burada, `providers`ta DEĞİL: `providers` ile `render` kardeştir (§3.6)
    // ve birbirini import edemez. Deseni ikinci kez yazmak, iki listeden birinin
    // güncellenmemesi demekti — bu projenin en sık tekrarlayan hatası.
    if (yetenek.startsWith('image.') || yetenek.startsWith('video.')) {
      const istenenPrompt =
        typeof input.constraints['prompt'] === 'string' ? input.constraints['prompt'] : ''
      const insan = promptRequestsPerson(istenenPrompt)
      if (insan !== null) {
        return err(hata('policy_blocked', 'PROMPT_REQUESTS_PERSON', ctx, { matched: insan }))
      }
    }

    // ⚠ ⚠ **ZORUNLU ADIM SESSİZCE ATLANMIYOR.** Boş istem koşucu tarafından "atlandı"
    // sayılıyor ve bu, `optional: true` adımlar için doğru. `sablon-uyarla` opsiyonel
    // DEĞİL: atlanırsa katalog merkezli hattın tamamı devre dışı kalır ve hata iki adım
    // sonra, anlamsız bir yerde (`NO_ADAPTATION`) görünür. Gerçek koşuda tam bu oldu.
    if (input.constraints['sablon_uyarla'] === true) {
      const s = sablonSecimiIcin(input)
      if (!s.ok)
        return err(hata('validation', 'TEMPLATE_SELECTION_FAILED', ctx, { sebep: s.sebep }))
    }

    const providerId = input.providerId
    if (providerId === undefined) return err(hata('internal', 'NO_ROUTED_PROVIDER', ctx))

    const adapter = deps.resolveAdapter(providerId)
    if (adapter === null) {
      return err(hata('config', 'ADAPTER_NOT_FOUND', ctx, { providerId }))
    }

    const serit = input.constraints['lane'] === 'premium' ? 'premium' : 'free'

    // ── geçmiş redlerin gerekçesi: NEGATİF KISIT (§12.9 · D-191) ─────────────
    //
    // `DecisionEntry.reason`ın kendi dokümanı "sonraki çalıştırmaya negatif kısıt
    // olarak enjekte edilir" diyordu ve hiçbir yer enjekte etmiyordu: defter
    // yazılıyor, hiç okunmuyordu (2026-08-16 denetimi).
    //
    // ⚠ **Yalnız METİN yeteneklerine.** Red gerekçesi serbest Türkçe nesirdir ve
    // görsel prompt'una eklenirse iki şey olur: (1) "başlıktaki yazı fazla küçük"
    // gibi bir gerekçe R-20 kurucusunu tetikler ve çalıştırma reddedilir, (2) daha
    // kötüsü, metin İSTEYEN bir cümle görsel modeline gider. Görsel modeline Türkçe
    // metin çizdirilmez — on iki yasadan biri ve bir kolaylık için esnetilmez.
    const metinYetenegi = !yetenek.startsWith('image.')
    const kacinilacak =
      metinYetenegi && typeof input.constraints['kacinilacak'] === 'string'
        ? input.constraints['kacinilacak'].trim()
        : ''
    // ── prompt'un KAYNAĞI (§5.3 · D-243) ────────────────────────────────────
    //
    // ⚠ Hiçbir hat `prompt` beyan etmiyor ve etmemeli: prompt içerikten türer, hat
    // dosyasından değil. Sabit yazılsaydı her konu için ayrı YAML gerekirdi.
    // Kısıt YİNE DE kazanır — elle verilmiş bir prompt varsa ona dokunulmuyor.
    const beyanEdilen =
      typeof input.constraints['prompt'] === 'string' ? input.constraints['prompt'] : ''
    const temelPrompt = beyanEdilen !== '' ? beyanEdilen : promptTuret(yetenek, input)

    // ── PROMPT YOKSA ADIM ATLANIR — hata DEĞİL (FAZ-14.3 · D-264) ───────────
    //
    // ⚠ **Gerçek koşu bu kusuru gösterdi.** "Yuva yoksa brief `null` döner ve zincir
    // kendiliğinden söner" diye varsaymıştım; sönmedi, KOPTU: boş prompt sağlayıcıya
    // gidiyor ve `EMPTY_PROMPT` ile tüm koşuyu durduruyordu. Konuda bir AKIŞ olduğu
    // için plan doğru biçimde diyagram seçmiş, yuva açmamıştı — yani hattı düşüren şey
    // bir hata değil, DOĞRU bir karardı.
    //
    // `StepStatus` kernel'de zaten `'skipped'` taşıyor (§13); eksik olan onu üreten
    // yoldu. Sağlayıcı ÇAĞRILMIYOR: maliyet sıfır, çıktı `atlandi` ile işaretli ve
    // aşağı akış (brief yoksa görsel de yok) kendiliğinden boşa düşüyor.
    // ── VERİLEN METİN: sağlayıcı çağrılmıyor (şablon karşılaştırması) ───────
    //
    // ⚠ ⚠ **Aynı metni farklı tasarımlarda üretmek bunsuz İMKÂNSIZ.** Yedi aileyi
    // karşılaştırmak için yedi koşu gerekiyor ve her koşu kendi metnini üretirse
    // karşılaştırılan şey tasarım değil METİN olur — deney baştan geçersiz.
    // ⚠ Sağlayıcı ÇAĞRILMIYOR: maliyet sıfır ve defterde `verilen-metin` olarak duruyor.
    // Sessizce üretilmiş gibi yazmak, defteri yalancı yapardı.
    // ⚠ Yalnız `text.` yeteneklerinde: görsel üretimi için "verilen görsel" ayrı bir
    // karardır ve yuva mekanizması (FAZ-11.4) zaten o işi yapıyor.
    const verilenMetin = input.constraints['metin']
    if (
      yetenek.startsWith('text.') &&
      typeof verilenMetin === 'string' &&
      verilenMetin.trim() !== ''
    ) {
      return ok({
        costs: [
          {
            verb: 'GENERATE' as const,
            capability: yetenek,
            providerId,
            amount: ZERO_USD,
            kind: 'actual' as const,
          },
        ],
        data: { text: verilenMetin, kaynak: 'verilen-metin' },
      })
    }

    if (temelPrompt.trim() === '') {
      // ⚠ **SIFIR maliyet olayı yazılıyor, boş dizi DEĞİL.** İkinci gerçek koşu bunu
      // gösterdi: `VERB_OUTPUT_CONTRACT_VIOLATION — metered fiil hiç CostEvent
      // döndürmedi`. Sözleşme haklı; ücretli bir fiilin sessizce hiçbir şey yazmaması,
      // maliyet defterini eksik bırakır (§8.3). Atlanan adım da bir olaydır ve
      // defterdeki dürüst karşılığı **sıfır**: "koştu, para harcamadı, çünkü atlandı".
      return ok({
        costs: [
          {
            verb: 'GENERATE' as const,
            capability: yetenek,
            providerId,
            amount: ZERO_USD,
            kind: 'actual' as const,
          },
        ],
        data: { atlandi: true, sebep: 'prompt-yok', yetenek },
      })
    }

    // ⚠ ⚠ **`image.matte` GİRDİSİNİ BURADA ALIYOR.** Kısıtlar normalde yalnız adımın
    // YAML'ından gelir; bu yetenekte taşınan şey bir önceki adımın ÜRETTİĞİ görsel.
    // Sağlayıcıya ayrı bir kanal açmak (ör. `ProviderInput.payload`) sözleşmeyi tek bir
    // yetenek için genişletirdi; kısıt zaten `Record<string, unknown>` ve yük oraya
    // sığıyor. Sınır korunuyor: adaptör hâlâ yalnız `ProviderInput` görüyor.
    const matlanacak =
      yetenek === 'image.matte' ? (uretilenGorseller(input.inputs, input.needs)[0] ?? null) : null
    // ⚠ ⚠ **TOHUM YUVA SIRASINDAN TÜRÜYOR — dört özdeş fotoğrafın yapısal ilacı.**
    // İki gerçek koşuda da dört ayrı çağrı aynı kadrajı döndürdü; kadraj tarifini
    // istemde güçlendirmek yetmedi çünkü sağlayıcı tohum verilmediğinde SABİT bir
    // varsayılan kullanıyor. Sabit çarpan: aynı yuva her koşuda aynı tohumu alır (R-06),
    // ama farklı yuvalar birbirinden uzak tohumlar alır.
    const gorselSirasi =
      typeof input.constraints['gorsel_sira'] === 'number' ? input.constraints['gorsel_sira'] : null
    const tohumlu =
      gorselSirasi === null || yetenek !== 'image.generate'
        ? input.constraints
        : { ...input.constraints, seed: 7919 * gorselSirasi }
    const kisitlar =
      matlanacak === null
        ? tohumlu
        : {
            ...input.constraints,
            // `src` bir veri URI'si; sağlayıcı ham base64 bekliyor.
            image_base64: matlanacak.src.replace(/^data:[^;]+;base64,/, ''),
          }

    const ham: ProviderInput = {
      capability: yetenek,
      lane: serit,
      prompt: kacinilacak === '' ? temelPrompt : `${temelPrompt}\n\nKAÇIN: ${kacinilacak}`,
      constraints: kisitlar,
      idempotencyKey: `${ctx.runId}:${ctx.stepId}`,
    }

    // `validate()` prompt'u R-20 kurucusundan geçirir; geçersizse sağlayıcıya HİÇ gidilmez.
    const dogrulanmis = adapter.validate(ham)
    if (!dogrulanmis.ok) return err(dogrulanmis.error)

    const call = providerCall({
      adapter,
      input: dogrulanmis.value,
      ctx: { correlationId: ctx.correlationId, env: deps.env },
      rng: ctx.rng,
      ...(deps.sleep === undefined ? {} : { sleep: deps.sleep }),
    })

    const sonuc = await call({
      signal: ctx.signal ?? new AbortController().signal,
      noteHandle: input.noteHandle ?? (() => undefined),
      resumeExternalId: input.resumeExternalId ?? null,
    })
    if (!sonuc.ok) return err(sonuc.error)

    // ── çıktı `COMPOSE`un beklediği şekle çevriliyor (D-243) ────────────────
    //
    // ⚠ `composeBody` `{lines: string[]}` arıyor; sağlayıcı çıktısı o şekilde değil.
    // Bulamayınca **sessizce ham kayıtlara düşüyordu** — yani model koşsa bile metni
    // kullanılmıyor ve bunu çıktıya bakarak anlamak imkânsızdı.
    //
    // Ham çıktı da taşınıyor (`raw`): normalize edilmiş şekil bir KOLAYLIK, kanıt
    // değil. Manifest ve replay ham olanı görmeli.
    const metin = yetenek.startsWith('text.') ? metneCevir(sonuc.value.data) : null

    // ── görsel yargı: bulgular ÇIKTIYA giriyor (FAZ-10.5) ───────────────────
    //
    // ⚠ Ayrıştırmadan bırakılsaydı `kalite` adımı ham JSON metni görürdü ve bulguları
    // okuyamazdı — "kod var, çağıran yok"un bir adım ilerisi: çağıran VAR ama şekil
    // tutmuyor (D-227, D-246). İki uç `gorsel-yargi.ts`te birlikte duruyor.
    //
    // **Reddedilen bulgular SAYILIYOR ve taşınıyor.** Sessizce atılsalardı model her
    // turda kutusuz bulgu üretmeye devam eder ve biz "temiz" raporunu gerçek sanardık.
    let yargi: {
      readonly bulgular: readonly YargiBulgusu[]
      readonly reddedilen: readonly string[]
    } | null = null
    if (yetenek === 'image.critique') {
      const hedefler = yargilanacakSlaytlar(input)
      const ilk = hedefler[0]
      yargi = yargiyaCevir(sonuc.value.data, ilk?.slayt ?? 1, {
        genislik: ilk?.genislik ?? 1080,
        yukseklik: ilk?.yukseklik ?? 1350,
      })
    }

    // ── estetik yargı: PUANLAR da çıktıya giriyor (FAZ-13.5) ────────────────
    //
    // ⚠ Puanlar çıktıya girmezse FAZ-13.6 kör kabulü karşılaştıracak bir sayı bulamaz —
    // "modül var, üretim yolu yok"un yargı katmanındaki hâli olurdu.
    // ⚠ `toplam` EKSİK kategoride `null`: beş kategoriden hesaplanan ortalama altıdan
    // hesaplananla karşılaştırılamaz ve kör kabul tam bunu yapacak.
    let tasarim: (TasarimYargisi & { readonly toplam: number | null }) | null = null
    if (yetenek === 'design.critique') {
      const hedefler = yargilanacakSlaytlar(input)
      const ilk = hedefler[0]
      const y = tasarimYargisinaCevir(sonuc.value.data, ilk?.slayt ?? 1, {
        genislik: ilk?.genislik ?? 1080,
        yukseklik: ilk?.yukseklik ?? 1350,
      })
      tasarim = { ...y, toplam: toplamPuan(y) }
    }

    // ── uyarlama: model çıktısı `COMPOSE`un beklediği şekle çevriliyor ──────
    //
    // ⚠ ⚠ **BU DÖNÜŞÜM OLMADAN ZİNCİR SESSİZCE KOPAR.** `composeBody`nin katalog dalı
    // girdilerde `{uyarlama}` arıyor; sağlayıcı çıktısı serbest metin. Çevrilmezse
    // `NO_ADAPTATION` ile durur — ki bu iyi haber: `metin`e düşseydi hat koşar,
    // uyarlama yok sayılır ve şablonun ÖRNEK içeriği yayına giderdi. D-243'ün birebir
    // tekrarı; orada `{lines}` bulunamayınca ham kayıtlara sessizce düşülüyordu.
    //
    // ⚠ Ayrıştırma BAŞARISIZ olursa hata veriliyor, boş bir uyarlama değil: yarım bir
    // uyarlama, örnek metinle gerçek metnin karıştığı bir karosel üretirdi.
    let uyarlamaCiktisi: { readonly uyarlama: Uyarlama } | null = null
    if (input.constraints['sablon_uyarla'] === true) {
      const c = uyarlamayaCevir(sonuc.value.data)
      if (c === null) return err(hata('validation', 'ADAPTATION_UNPARSEABLE', ctx))
      uyarlamaCiktisi = { uyarlama: c }
    }

    return ok({
      costs: [
        {
          verb: 'GENERATE' as VerbName,
          capability: yetenek,
          providerId,
          amount: sonuc.value.amount,
          kind: 'actual' as const,
        },
      ],
      data:
        uyarlamaCiktisi !== null
          ? { ...uyarlamaCiktisi, raw: sonuc.value.data }
          : tasarim !== null
            ? { ...tasarim, raw: sonuc.value.data }
            : yargi !== null
              ? { ...yargi, raw: sonuc.value.data }
              : metin === null
                ? sonuc.value.data
                : { ...metin, raw: sonuc.value.data },
    })
  })

// ── PUBLISH: kanal API'si çağıran TEK fiil (§9.2 · R-34, R-46 · FAZ-7.2) ────
//
// ⚠ **Bu gövde FAZ 7 denetiminde EKSİK bulundu — `INGEST`in birebir tekrarı** (D-216).
// Yayın kapıları, sıra sözleşmesi, defter, limiter ve OAuth yazılmış ve test edilmişti;
// ama `PUBLISH` fiilinin gövdesi yoktu ve `uret.mjs`in fiil haritasında `PUBLISH`
// anahtarı bile geçmiyordu. Yani `publish()`in tek çağıranı testlerdi: hat tip
// düzeyinde doğru, üretimde **erişilemez**.
//
// **Aynı hatanın iki fazda tekrarlaması tesadüf değil:** bir yetenek "bitti" sanılıyor
// çünkü modülü ve testi var. Eksik olan hep aynı yer — fiil haritası.
//
// **Tutkal BURADA, testte değil.** Denetim, defter ile yayıncıyı birbirine bağlayan
// adaptörün yalnız test dosyasında var olduğunu buldu (B3): test kendi kurduğu köprüyü
// ölçüyordu. Köprü artık üretimde ve testler onu ÇAĞIRIYOR.

export interface PublishBodyDeps {
  readonly repoRoot: string
  /** Oran kovası — motorun kovası, yayıncıya fonksiyon olarak iner (R-03). */
  readonly limiter: RateLimiter
  /** Token kaydı okuyucu. `null` = kayıt yok → yayın bloklu (FAZ-7.6). */
  readonly tokenKaydi: (provider: string) => TokenKaydi | null
  /** Kota sorgusu — gerçek kanal çağrısı. Yoksa yayın DURUR, varsayılmaz. */
  readonly publishingLimit?: (platform: string) => Promise<PublishingLimit>
  /** Gerçek yükleyici. Yoksa yayın DURUR: "yükleyici yok" sessiz başarı değildir. */
  readonly upload?: (req: PublishRequest) => Promise<Result<string, string>>
}

/**
 * Desteklenen platformlar — **çalışma anı doğrulaması**, tip değil.
 *
 * `PublishRequest['platform']` bir birleşim tipi ama YAML'dan gelen dize tip
 * sisteminden geçmiyor; sınırda doğrulanmazsa hata en derinde ve en anlamsız yerde
 * patlıyor.
 */
const DESTEKLENEN_PLATFORMLAR: readonly string[] = ['instagram', 'threads', 'linkedin']

/**
 * `PUBLISH`in bir varlıkta aradığı anahtarlar — **TEK tanım**.
 *
 * `renderBody` bunları basıyor, `yayinVarliklari` bunları okuyor. İki ayrı liste
 * olsaydı biri güncellenir diğeri unutulurdu; bu bulgu (FAZ-8 denetimi, B2) tam
 * olarak öyle doğdu: üretim `slides` basıyordu, tüketici `assets` arıyordu.
 */
export const PUBLISH_ARANAN_ANAHTARLAR = ['path', 'altTr', 'decorative', 'digest'] as const

/** Yayın yeteneği — oran kovasının anahtarı. Kanal durumu ekranıyla AYNI dize. */
export const YAYIN_YETENEGI = 'channel.publish'

export const publishBody = (deps: PublishBodyDeps): Verb =>
  govde('PUBLISH', async (ctx, input) => {
    // ⚠ Önce doğrulamasız cast vardı ve YAML'daki tek harflik bir yazım hatası
    // (`facebook`) tipli bir ret yerine ÇIPLAK `TypeError` veriyordu: `REQUIRED_SCOPES`
    // `undefined` dönüyor, `for…of` çöküyordu (FAZ-7 denetimi 2. tur, M2).
    // "Sıra tipe gömülü" garantisi ŞEKLİ kapsıyor, DEĞERLERİ değil.
    const ham = input.constraints['platform']
    if (typeof ham !== 'string' || !DESTEKLENEN_PLATFORMLAR.includes(ham)) {
      return err(
        hata('validation', 'UNSUPPORTED_PLATFORM', ctx, {
          verilen: typeof ham === 'string' ? ham : null,
          destekleyen: DESTEKLENEN_PLATFORMLAR,
        })
      )
    }
    const platform = ham as PublishRequest['platform']

    // Varlıklar ÜRETİMDEN gelir — testin elle yazdığı bir şekilden değil. `RENDER`
    // çıktısındaki yollar ve alt-text'ler burada toplanıyor; toplanamıyorsa yayın
    // yapılmaz (boş bir liste "yayınlanacak bir şey yok" demek DEĞİL, "girdiyi
    // bulamadım" demektir ve ikisi ayrı hatalardır).
    const varliklar = yayinVarliklari(input.inputs)
    if (varliklar.length === 0) {
      return err(hata('validation', 'NO_PUBLISHABLE_ASSET', ctx, { platform }))
    }

    if (deps.upload === undefined || deps.publishingLimit === undefined) {
      // **Yükleyici yoksa sessiz başarı YOK.** Gerçek kanal bağlantısı `7.2b`de ve
      // insan girdisi bekliyor; o gelene kadar bu fiil AÇIKÇA durur. "Yayınlandı
      // sayalım" diyen bir dal, defterde olmayan bir yayın üretirdi.
      return err(
        hata('io', 'CHANNEL_NOT_CONNECTED', ctx, {
          platform,
          neden: 'kanal adaptörü bağlı değil (FAZ-7.2b · V-26)',
        })
      )
    }

    const kayit = deps.tokenKaydi(platform === 'linkedin' ? 'linkedin' : 'meta')
    const istek: PublishRequest = {
      platform,
      placementId: String(input.constraints['placementId'] ?? ''),
      assets: varliklar,
      caption: String(input.constraints['caption'] ?? ''),
      runId: ctx.runId,
      now: ctx.clock.nowIso(),
    }

    const sonuc = await publish(istek, {
      // Token ÖMRÜ düz metinden, token'ın KENDİSİ sops'tan (FAZ-7.6). Kayıt yoksa
      // `null` geçiyor ve `publish` onu ölmüş sayıyor — bilinmeyen ömür, uzun ömür
      // değildir.
      tokenState: async () =>
        kayit === null ? null : { expiresAt: kayit.expiresAt, scopes: kayit.scopes },
      rateGate: (cost) => {
        const karar = deps.limiter.take(platform, YAYIN_YETENEGI, cost)
        return karar.allowed
          ? { allowed: true }
          : { allowed: false, retryAfterMs: karar.retryAfterMs }
      },
      publishingLimit: async () => deps.publishingLimit!(platform),
      lookupLedger: async (digest) => {
        const r = lookupPublished(deps.repoRoot, digest, platform)
        // Üç durum KORUNUYOR: okunamayan defter, boş deftere çökertilmiyor (B3).
        return r.ok
          ? { ok: true, entry: r.entry }
          : {
              ok: false,
              reason: r.error.kind === 'ledger_missing' ? 'missing' : 'unreadable',
              detay: r.error.kind === 'ledger_missing' ? r.error.path : r.error.reason,
            }
      },
      upload: deps.upload,
      // Defteri `publish()` yazıyor; gövde yalnız nereye yazılacağını biliyor.
      recordPublished: (kayitSatiri) =>
        appendPublished(deps.repoRoot, {
          digest: kayitSatiri.digest,
          platform: kayitSatiri.platform,
          externalId: kayitSatiri.externalId,
          runId: ctx.runId,
          publishedAt: kayitSatiri.publishedAt,
        }),
    })

    if (!sonuc.ok) {
      return err(
        hata('io', 'PUBLISH_REFUSED', ctx, {
          platform,
          kind: sonuc.error.kind,
          mesaj: refusalMessage(sonuc.error),
        })
      )
    }

    return ok({
      costs: [],
      data: {
        published: sonuc.value.externalId,
        platform,
        // Yayından ÖNCEKİ kota manifest'e yazılıyor: "yayın anında kota neredeydi"
        // sorusunun cevabı sonradan üretilemez.
        quotaBefore: `${sonuc.value.limitBefore.quotaUsed}/${sonuc.value.limitBefore.quotaTotal}`,
      },
    })
  })

/**
 * Yayınlanacak varlıkları ÖNCEKİ ADIM ÇIKTILARINDAN toplar.
 *
 * `RENDER` çıktısı `{ path, altTr, decorative, digest }` taşır; alt-text'i burada
 * uydurmuyoruz — uydurulsaydı R-34 kapısı kendi ürettiği veriyi denetlerdi.
 */
const yayinVarliklari = (inputs: Readonly<Record<string, unknown>>): PublishAsset[] => {
  const sonuc: PublishAsset[] = []
  for (const cikti of Object.values(inputs)) {
    if (cikti === null || typeof cikti !== 'object') continue
    const liste = (cikti as Record<string, unknown>)['assets']
    if (!Array.isArray(liste)) continue
    for (const ham of liste) {
      if (ham === null || typeof ham !== 'object') continue
      const o = ham as Record<string, unknown>
      if (typeof o['path'] !== 'string' || typeof o['digest'] !== 'string') continue
      // **Uyum kaydı ÜRETİMDEN gelir, burada uydurulmaz.** Eksikse `disclosureRequired`
      // `true` varsayılıyor: bilinmeyen bir ifşa durumu, "ifşa gerekmiyor" DEĞİLDİR
      // (D-175). Aksi hâlde alan eklemeyi unutan bir üretici, ifşa kapısını sessizce
      // kapatırdı — ve bu, kapının en çok gerektiği yerde kapanması olurdu.
      const u = o['compliance']
      const uyum = u !== null && typeof u === 'object' ? (u as Record<string, unknown>) : {}
      sonuc.push({
        path: o['path'],
        altTr: typeof o['altTr'] === 'string' ? o['altTr'] : '',
        decorative: o['decorative'] === true,
        digest: o['digest'],
        compliance: {
          disclosureRequired: uyum['disclosureRequired'] !== false,
          stamped: uyum['stamped'] === true,
          visibleDisclosure: uyum['visibleDisclosure'] === true,
        },
      })
    }
  }
  return sonuc
}
