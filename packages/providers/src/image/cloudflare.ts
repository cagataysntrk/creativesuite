// Bedava şerit: Cloudflare Workers AI (§7.3 · D-2, D-16).
//
// Bedava katman gerçekten bedava (günlük nöron kotası) ve ticari kullanıma açık —
// bu yüzden `free` şeridin varsayılanı. Maliyet formülü `0`, ama fiyat anlık görüntüsü
// **doğrulanmamış** olarak işaretli: kota aşımının nasıl faturalandığı bizim tarafımızda
// ölçülmedi ve "bedava" ile "kotası bitince ne olur" ayrı sorular (V-14).
//
// **Senkron API**: Workers AI görsel uçları isteği bekletip byte'ı doğrudan döndürür,
// kuyruk yok. Yani `start()` işi bitirir ve `status()` hafızadaki sonucu okur. Sahte bir
// kuyruk simüle etmiyoruz — sağlayıcının gerçek şekli buysa adaptör de o şekli taşımalı;
// uydurma bir asenkronluk, gerçekten asenkron olan sağlayıcıda hata ayıklamayı zorlaştırır.

import type { AppError, Money, MoneyRange } from '@suite/contracts'
import { ZERO_USD, err, ok, type Result } from '@suite/contracts'
import { httpFetch, makeError } from '@suite/kernel'
import type {
  CapabilityDecl,
  JobHandle,
  JobStatus,
  ProviderAdapter,
  ProviderContext,
  ProviderInput,
  ValidatedInput,
} from '../types.js'
import {
  ASPECT_PIXELS,
  assertNoTextSuffix,
  imageCapability,
  kimlikDegistir,
  rangeFromUnit,
  validateImageInput,
  type Aspect,
} from './lanes.js'

const ID = 'cloudflare-workers-ai'

/**
 * En-boy → model. **Bu tablo GERÇEK uçtan ölçülerek yazıldı, cassette'ten değil.**
 *
 * ⚠ İlk sürüm tek modeldi (`flux-1-schnell`) ve her istekte `width`/`height`
 * gönderiyordu. Cassette bunu kabul ediyordu çünkü cassette'i ben yazmıştım; gerçek
 * uç ise reddediyor:
 *   `AiError: Bad input: Additional or unevaluated properties '/width, /height'` (5006)
 * Yani sekiz brief'in sekizi de `MALFORMED_RESPONSE` verdi ve bunu ancak **ilk gerçek
 * bake-off** ortaya çıkardı (V-16'nın uyardığı tam durum, D-238).
 * **Bir cassette, sağlayıcının davranışını değil senin varsayımını kaydeder.**
 *
 * İki model iki farklı TEL BİÇİMİ konuşuyor ve bu da ölçüldü:
 *   · flux-1-schnell → JSON `{result:{image: <base64>}}`, boyut SABİT 1024×1024
 *   · sdxl-lightning → ham JPEG gövdesi, `width`/`height` KABUL EDİYOR
 * Model seçimi adaptörün işidir (D-32): hat yetenek ister, model adı yazmaz.
 */
const MODELLER: Record<
  Aspect,
  { readonly path: string; readonly tel: 'json' | 'raw' | 'multipart' }
> = {
  // ⚠ ⚠ **TEK MODEL, DÖRT ORAN — ve bu bir YARIŞTIRMANIN sonucu.** Depo sahibi:
  // *"üretilen görseller aşırı kalitesiz geliyorlar hâlâ… promptlar çok kötü gidiyor,
  // konudan bağımsız şeyler geliyor."* Şikâyet ölçüldü ve BRIEF'TE DEĞİL MODELDEYDİ:
  // gerçek koşunun gerçek brief'i (*"üç iç içe dişli, düz siyah zemin, kadrajın üçte
  // ikisi"*) altı Cloudflare modeline aynen verildi ve çıktılara BAKILDI.
  //
  //   · sdxl-lightning  → kadran çevresinde UYDURMA HARFLER (Yasa 3 riski), kadraj
  //                        kenardan kenara dolu, arka plan silici kesecek kenar
  //                        bulamıyor, brief'in üç dişlisi yok
  //   · flux-2-klein-4b → brief'in üç dişlisi VAR, saf siyah zemin, harf yok, özne
  //                        ortada ve dört kenarda boşluk
  //   · phoenix-1.0     → brief'e sadık ama görsel başı ~2.900 neuron
  //   · lucid-origin    → en temiz ayrım ama ~3.400 neuron
  //
  // ⚠ ⚠ **SEÇİMİ KALİTE DEĞİL, KALİTE + KOTA BİRLİKTE yaptı.** Bedava günlük tavan
  // 10.000 neuron. Phoenix/Lucid görsel başı ~3.000 neuron yiyor: TEK bir karosel
  // (4-5 görsel) günlük tavanı bitiremeden aşıyor. flux-2-klein-4b 1024×1280'de
  // ~130 neuron — günde ~76 görsel. Depo sahibi de bunu seçti: *"flux-2-klein-4b
  // bunu kullanalım."*
  //
  // ⚠ ⚠ **TEL BİÇİMİ ÜÇÜNCÜ BİR ŞEKİL: `multipart`.** JSON gövde gönderince uç
  // `AiError: Bad input: required properties at '/' are 'multipart'` diyor. Model
  // şeması bunu doğruluyor: girdi `{multipart:{body,contentType}}`. Yani istek
  // `multipart/form-data` olarak gitmek ZORUNDA — varsayım değil, ölçüm.
  '1:1': { path: '@cf/black-forest-labs/flux-2-klein-4b', tel: 'multipart' },
  '4:5': { path: '@cf/black-forest-labs/flux-2-klein-4b', tel: 'multipart' },
  '9:16': { path: '@cf/black-forest-labs/flux-2-klein-4b', tel: 'multipart' },
  '16:9': { path: '@cf/black-forest-labs/flux-2-klein-4b', tel: 'multipart' },
}

/**
 * Ölçü 16'nın katına AŞAĞI yuvarlanıyor.
 *
 * ⚠ ⚠ **MODEL SESSİZCE YUVARLIYOR ve bu ÖLÇÜLDÜ.** 1080 istendiğinde 1072 geliyor
 * (9:16 ve 16:9'da). İstenen ölçüyü deftere yazıp farklı bir ölçü döndürmek, defteri
 * yalancı yapardı: `JobStatus.width/height` çıktının GERÇEK ölçüsü olmalı. Çözüm
 * yuvarlamayı ÖNCE bizim yapmamız — istenen ile dönen o zaman aynı sayı oluyor.
 */
const on16 = (n: number): number => Math.floor(n / 16) * 16

/**
 * `multipart/form-data` gövdesi — yalnız METİN alanlar.
 *
 * ⚠ Sınır dizesi ÇAĞRI BAŞINA sabit değil, idempotency anahtarından türüyor: rastgele
 * bir sınır `rng` darboğazını (§3.8) atlatmak olurdu ve aynı istek iki kez farklı
 * bayt üretirdi.
 */
const multipartGovde = (
  alanlar: Readonly<Record<string, string>>,
  sinir: string
): { readonly govde: string; readonly contentType: string } => ({
  govde:
    Object.entries(alanlar)
      .map(
        ([ad, deger]) =>
          `--${sinir}\r\nContent-Disposition: form-data; name="${ad}"\r\n\r\n${deger}\r\n`
      )
      .join('') + `--${sinir}--\r\n`,
  contentType: `multipart/form-data; boundary=${sinir}`,
})

/** Ortam değişkeninin ADI — değeri asla (R-51). */
const ACCOUNT_ENV = 'CF_ACCOUNT_ID'
const TOKEN_ENV = 'CF_API_TOKEN'

/**
 * ÇOK HESAP: `hesap:token,hesap:token` — değerler asla, yalnız ADI (R-51).
 *
 * ⚠ ⚠ **BU ALAN BİR KOTA KAZASINDAN DOĞDU.** Bedava katman GÜNDE 10.000 neuron veriyor
 * ve bu ölçüldü: bir karosel (5 görsel × ~130 neuron) ~650 neuron, yani günde ~15
 * karosel. Ama pahalı bir modeli bir kez denemek (`lucid-origin` ~3.400, `phoenix-1.0`
 * ~2.900) tek çağrıda günün üçte birini yakıyor. Kota dolduğunda hat BEŞ görsel adımını
 * da düşürüyor ve karosel görselsiz kalıyor — depo sahibinin gerçek koşusunda tam bu
 * oldu (`run_01a04827`: iki adım kota hatası, üçü devre kesiciden `CIRCUIT_OPEN`).
 *
 * ⚠ Tek değişkende ÇİFT liste, çünkü Cloudflare iki değer istiyor ve tanımlayıcı tek
 * `auth_env` beyan edebiliyor. Dördüncü hesap kasaya eklenir, kod değişmez.
 */
const HESAPLAR_ENV = 'CF_HESAPLAR'

export interface CfKimlik {
  readonly hesap: string
  readonly token: string
}

/**
 * Denenecek hesap zinciri: önce tekil değişkenler, sonra `CF_HESAPLAR` listesi.
 *
 * ⚠ Tekil `CF_ACCOUNT_ID`/`CF_API_TOKEN` ÖNDE ve destekten düşmedi: tek hesaplı bir
 * kurulum (ve bütün mevcut testler) hiçbir şey değiştirmeden çalışmaya devam ediyor.
 * ⚠ Aynı hesap iki kez denenmiyor — ikinci deneme birincinin cevabını tekrarlar,
 * sadece süreyi ikiye katlayarak.
 */
export const cfHesaplari = (env: Readonly<Record<string, string>>): readonly CfKimlik[] => {
  const hepsi: CfKimlik[] = []
  const tekHesap = env[ACCOUNT_ENV] ?? ''
  const tekToken = env[TOKEN_ENV] ?? ''
  if (tekHesap !== '' && tekToken !== '') hepsi.push({ hesap: tekHesap, token: tekToken })
  for (const parca of (env[HESAPLAR_ENV] ?? '').split(',')) {
    const t = parca.trim()
    if (t === '') continue
    const ayrac = t.indexOf(':')
    // ⚠ Ayraçsız ya da yarım bir giriş SESSİZCE ATLANMIYOR mu? Atlanıyor — ama bu
    // bilinçli: kasaya elle yazılan listede sondaki virgül beklenen bir kaza ve yarım
    // bir kimlikle çağrı yapmak, sağlayıcıya anlamsız bir 403 yedirmekten ibaret.
    if (ayrac <= 0) continue
    const kimlik = { hesap: t.slice(0, ayrac).trim(), token: t.slice(ayrac + 1).trim() }
    if (kimlik.hesap === '' || kimlik.token === '') continue
    if (!hepsi.some((x) => x.hesap === kimlik.hesap)) hepsi.push(kimlik)
  }
  return hepsi
}

// ⚠ ⚠ **İKİ ŞERİTTE DE ADAY — ve bu bir YEDEK ZİNCİRİ kararı.** Cloudflare bedava
// şeridin varsayılanı; premium şeride de konmasının sebebi şu: premium bir koşuda
// ücretli sağlayıcı düşerse (kota, arıza, anahtar) yönlendiricinin düşebileceği BAŞKA
// bir aday kalmıyordu ve koşu GÖRSELSİZ bitiyordu. Yani premium bir koşu, bedava bir
// koşunun ürettiğini üretemiyordu — savunulamaz bir sonuç.
//
// ⚠ Premium ŞERİT "para harcamak ZORUNLU" demek değil, "para harcanabilir" demek
// (§8.2). Skorlamada ücretli sağlayıcı kalitesiyle kazanır; Cloudflare yedek kalır.
const CAPS: readonly CapabilityDecl[] = [imageCapability(['free', 'premium'])]

/**
 * Sonuçlar süreç-içi. Kalıcılık defterin işi (`derived/runs`, §3.5): adaptör kendi
 * kalıcılığını kurarsa iki doğruluk kaynağı doğar ve hangisinin kazandığı belirsiz olur.
 */
const sonuclar = new Map<string, JobStatus>()

const hata = (
  kind: AppError['kind'],
  code: string,
  correlationId: string,
  details: Readonly<Record<string, unknown>> = {}
): AppError =>
  makeError({
    kind,
    code,
    userMessageKey: `error.image.${code}`,
    correlationId: correlationId as AppError['correlationId'],
    details,
  })

export const cloudflareImage: ProviderAdapter = {
  id: ID,
  title: 'Cloudflare Workers AI (bedava şerit)',

  // Senkron HTTP ucu: cevap çağrının içinde geliyor, kuyruk yok.
  islerKalici: false,

  capabilities: () => CAPS,

  validate: (input: ProviderInput): Result<ValidatedInput, AppError> =>
    validateImageInput(input, ['free', 'premium']),

  // SENKRON (R-42). Bedava katman: aralık sıfır. Kota aşımı ayrı bir sorun ve
  // `available()` onu göremez — bu yüzden V-14 açık duruyor.
  estimate: (_vi: ValidatedInput): MoneyRange => rangeFromUnit(0n, 1),

  // SENKRON. Ağa çıkmaz; yalnız anahtarların TANIMLI olduğuna bakar.
  available: (env) => cfHesaplari(env).length > 0,

  start: async (vi, ctx: ProviderContext): Promise<Result<JobHandle, AppError>> => {
    // İkinci savunma hattı: `validate()` atlanmış olabilir (test yardımcısı, replay,
    // refactor). R-20 tek bir fonksiyona güvenemeyecek kadar önemli.
    const guvenli = assertNoTextSuffix(vi)
    if (!guvenli.ok) return err(guvenli.error)

    const hesaplar = cfHesaplari(ctx.env)
    if (hesaplar.length === 0) {
      return err(
        hata('provider_auth', 'MISSING_CREDENTIALS', ctx.correlationId, {
          needs: [HESAPLAR_ENV, ACCOUNT_ENV, TOKEN_ENV],
        })
      )
    }

    const aspect = vi.constraints['aspect'] as Aspect
    // ⚠ Ölçü 16'nın katına yuvarlanıyor: model bunu zaten yapıyor ve yapmasaydık
    // deftere istenen ölçüyü, diske dönen ölçüyü yazardık (1080 istenip 1072 geliyor).
    const boyut = { w: on16(ASPECT_PIXELS[aspect].w), h: on16(ASPECT_PIXELS[aspect].h) }
    const model = MODELLER[aspect]
    const tohum = typeof vi.constraints['seed'] === 'number' ? String(vi.constraints['seed']) : null
    const mp =
      model.tel !== 'multipart'
        ? null
        : multipartGovde(
            {
              prompt: vi.prompt,
              width: String(boyut.w),
              height: String(boyut.h),
              // ⚠ ⚠ **TOHUM GÖNDERİLİYOR ama GARANTİ DEĞİL — ölçüldü.** Aynı tohumla
              // iki çağrı FARKLI görsel verdi; model tohumu onurlandırmıyor. Yine de
              // gönderiliyor: sözleşmede var, bedeli yok ve model bir gün onurlandırırsa
              // kod değişmeden çalışır. Ama R-06 determinizmi bu modelde SAĞLANMIYOR ve
              // bunu yazmamak, olmayan bir garantiyi varmış gibi bırakmak olurdu.
              ...(tohum === null ? {} : { seed: tohum }),
            },
            `sinir${vi.idempotencyKey.replace(/[^A-Za-z0-9]/g, '')}`
          )

    // ⚠ ⚠ **HESAP ZİNCİRİ: biri kotayı doldurursa sıradaki deneniyor.** Denenen hesabın
    // SIRASI kayda giriyor, kimliği DEĞİL (R-51): *"ikinci hesap da kota yedi"* meşru
    // bir hata ayrıntısı, hesap kimliğini yazmak sızıntı.
    const denemeler: { readonly sira: number; readonly kod: number | string }[] = []
    let base64 = ''
    let sonHata: AppError | null = null

    for (const [i, kimlik] of hesaplar.entries()) {
      const sonHesap = i + 1 >= hesaplar.length
      const yanit = await httpFetch(
        {
          url: `https://api.cloudflare.com/client/v4/accounts/${kimlik.hesap}/ai/run/${model.path}`,
          method: 'POST',
          headers: {
            authorization: `Bearer ${kimlik.token}`,
            'content-type': mp === null ? 'application/json' : mp.contentType,
            // Idempotency anahtarı BAŞLIKTA gider: sağlayıcı onu onurlandırmasa bile
            // kayıt/replay ve sağlayıcı destek talebi için izlenebilirlik sağlar (R-44).
            'idempotency-key': vi.idempotencyKey,
          },
          // **Boyut yalnız KABUL EDEN modele gönderilir.** flux-1-schnell fazladan
          // alan görünce isteği tümden reddediyor — "göndersek de yok sayar" varsayımı
          // ölçüldü ve yanlış çıktı.
          // ⚠ ⚠ **`seed` YALNIZ `raw` TELİNDE ve bu bir ÖLÇÜM sonucu.** `flux-1-schnell`
          // fazladan alan görünce isteği tümden reddediyor (width/height'ta ölçüldü);
          // `stable-diffusion-xl-lightning` zaten boyut alıyor ve `seed`i de kabul ediyor.
          //
          // ⚠ ⚠ **TOHUM BURADA BİR SÜS DEĞİL, DÖRT ÖZDEŞ FOTOĞRAFIN İLACI.** Slayt başına
          // görsele geçtikten sonra iki gerçek koşuda da dört çağrı BİREBİR AYNI kadrajı
          // döndürdü. Sağlayıcı tohum göndermediğimizde kendi varsayılanını kullanıyor ve
          // o varsayılan sabit: aynı ya da yakın istemler aynı görüntüye çöküyor. Kadraj
          // tarifini güçlendirmek bir RİCA; tohum bir GARANTİ.
          //
          // ⚠ Determinizm bozulmuyor (R-06): tohum çağıranın kısıtından geliyor, yani
          // yuva sırasının saf bir fonksiyonu. Aynı koşu her tekrarda aynı dört görseli verir.
          body:
            mp !== null
              ? mp.govde
              : JSON.stringify(
                  model.tel === 'raw'
                    ? {
                        prompt: vi.prompt,
                        width: boyut.w,
                        height: boyut.h,
                        ...(tohum === null ? {} : { seed: Number(tohum) }),
                      }
                    : { prompt: vi.prompt }
                ),
          signal: ctx.signal,
        },
        ctx.correlationId as AppError['correlationId']
      )
      // ⚠ AĞ düştüyse hesap değiştirmek anlamsız: sorun bizim tarafımızda ve sıradaki
      // hesap aynı duvara çarpar.
      if (!yanit.ok) return err(yanit.error)

      // İki tel biçimi, tek çıkış: base64. Adaptörün işi tam olarak bu — sağlayıcının
      // şekli sınırı geçmez (R-43).
      // ⚠ `multipart` istekte GİDEN biçimdir, DÖNENDE değil: yanıt `json` ile aynı
      // şekilde geliyor (`{result:{image:<base64>}}`) ve model şeması da öyle diyor.
      // İki şeyi tek adla anmak, bu depoda üç kez üretici/tüketici ayrışması doğurdu.
      // ⚠ ⚠ **HTTP DURUM KODU HİÇ BAKILMIYORDU — ve bu gerçek bir delikti.** `httpFetch`
      // yalnız ağ düşerse `err` döner; 429, 500, 403 hepsi `ok: true` olarak geliyor ve
      // durum kodu `Response`ın üstünde duruyor. `raw` dalı yalnız *"gövde boş mu"* diye
      // bakıyordu, yani bir hata sayfasının baytları base64'lenip GÖRSEL diye
      // döndürülebilirdi. Kardeş adaptörde (`gemini.ts`) bu kontrol vardı, burada yoktu.
      const durum = yanit.value.status
      if (durum < 200 || durum >= 300) {
        denemeler.push({ sira: i + 1, kod: durum })
        sonHata = hata(
          durum === 429 ? 'provider_rate_limit' : 'provider_bad_response',
          durum === 429 ? 'RATE_LIMITED' : 'HTTP_ERROR',
          ctx.correlationId,
          { status: durum, denemeler }
        )
        // ⚠ Yalnız KİMLİĞE ÖZGÜ hatada sıradaki hesap deneniyor (kural `lanes.ts`te).
        if (kimlikDegistir(durum) && !sonHesap) continue
        return err(sonHata)
      }

      let cikan = ''
      if (model.tel === 'raw') {
        const ham = Buffer.from(await yanit.value.arrayBuffer())
        // ⚠ ⚠ **BAYTIN GÖRÜNTÜ OLDUĞU DOĞRULANIYOR ve bunu GERÇEK BİR BOZULMA öğretti.**
        // Depo sahibinin koşusunda `gorsel-01-elle.png` ve `gorsel-02-elle.png` 286 BAYT
        // çıktı ve içleri şuydu:
        //   `{"errors":[{"message":"AiError: you have used up your daily free allocation
        //    of 10,000 neurons…"}],"success":false}`
        // Yani kota hatası HTTP 200 ile döndü, `raw` dalı onu base64'ledi, *"boş değil"*
        // diye geçirdi ve çağıran bir HATA METNİNİ `.png` olarak diske yazdı. Uzunluk
        // kontrolü bir görüntü sınaması DEĞİLDİR.
        //
        // ⚠ Sihirli baytlar: PNG `89 50 4E 47`, JPEG `FF D8`. Bunlar dosyanın ilk
        // baytları ve tek bir `content-type` başlığından daha güvenilir — başlık
        // sağlayıcının İDDİASI, baytlar OLGU.
        const gorseldir =
          (ham[0] === 0x89 && ham[1] === 0x50 && ham[2] === 0x4e && ham[3] === 0x47) ||
          (ham[0] === 0xff && ham[1] === 0xd8)
        if (!gorseldir) {
          return err(
            hata('provider_bad_response', 'NOT_AN_IMAGE', ctx.correlationId, {
              bayt: ham.length,
              // ⚠ Gövdenin BAŞI taşınıyor (sağlayıcının hata metni okunabilsin) ama
              // tamamı değil: yanıt şekli adaptör sınırını geçemez (R-43).
              bas: ham.toString('utf8', 0, 160),
            })
          )
        }
        base64 = ham.toString('base64')
      } else {
        const govde = (await yanit.value.json()) as {
          success?: boolean
          result?: { image?: string }
          errors?: readonly { message?: string; code?: number }[]
        }
        if (govde.success !== true || typeof govde.result?.image !== 'string') {
          // ⚠ ⚠ **KOTA HATASI HTTP 200 İLE GELİYOR ve *"bozuk yanıt"* DEĞİLDİR.**
          // Ölçüldü: günlük 10.000 neuron bitince uç `success:false` + `code: 4006`
          // döndürüyor, durum kodu 200. İkisini aynı ada koymak, çözülebilir bir sorunu
          // (*"yarın sıfırlanıyor"*) çözülemez bir sorun gibi gösterirdi — ve yedek
          // zinciri de yanlış karar verirdi.
          // ⚠ ⚠ **KOTA HATASI HTTP 200 İLE GELİYOR — durum kodu onu YAKALAYAMAZ.** Uç
          // günlük tavan dolduğunda `success:false` + `code: 4006` döndürüyor ve HTTP 200
          // diyor. Hesap rotasyonu bu dalda da olmak ZORUNDA: yalnız durum koduna bakan
          // bir zincir ikinci hesabı HİÇ denemezdi.
          const kota = (govde.errors ?? []).some((x) => x.code === 4006)
          denemeler.push({ sira: i + 1, kod: kota ? 'kota' : 'bozuk-yanit' })
          sonHata = hata(
            kota ? 'provider_rate_limit' : 'provider_bad_response',
            kota ? 'DAILY_QUOTA_EXHAUSTED' : 'MALFORMED_RESPONSE',
            ctx.correlationId,
            {
              // Sağlayıcının hata METNİ taşınır ama sağlayıcı NESNESİ taşınmaz (R-43):
              // yanıt şekli adaptör sınırını geçemez.
              providerMessage: govde.errors?.[0]?.message ?? null,
              denemeler,
            }
          )
          if (kota && !sonHesap) continue
          return err(sonHata)
        }
        cikan = govde.result.image
      }

      base64 = cikan
      break
    }

    // ⚠ ⚠ **BÜTÜN HESAPLAR TÜKENDİ.** Sessiz bir boş sonuç, yedek zincirinin (`yedek.ts`)
    // devreye girmesini engeller ve koşu görselsiz biter — depo sahibinin `run_01a04827`
    // koşusunda tam bu oldu.
    if (base64 === '') {
      return err(
        sonHata ??
          hata('internal', 'NO_ATTEMPT', ctx.correlationId, { hesapSayisi: hesaplar.length })
      )
    }

    const handle: JobHandle = {
      providerId: ID,
      // Senkron API'de dış kimlik yok; idempotency anahtarı tutamağın kendisi olur.
      // Uydurma bir id üretmek, mutabakatta var olmayan bir kaydı aratmak olurdu.
      externalId: vi.idempotencyKey,
      idempotencyKey: vi.idempotencyKey,
    }
    sonuclar.set(handle.externalId, {
      state: 'succeeded',
      output: { format: 'base64', data: base64, width: boyut.w, height: boyut.h },
    })
    return ok(handle)
  },

  status: async (h): Promise<Result<JobStatus, AppError>> => {
    const s = sonuclar.get(h.externalId)
    if (s === undefined) {
      // Süreç yeniden başladı ve senkron sonuç hafızada yok. **Yalan söylemek yasak**:
      // "running" demek sonsuz polling, "succeeded" demek hayalet varlık olurdu.
      return err(
        hata('internal', 'RESULT_LOST', h.idempotencyKey, {
          externalId: h.externalId,
          reason: 'senkron sağlayıcı sonucu süreç-içiydi; yeniden üretim gerekiyor',
        })
      )
    }
    return ok(s)
  },

  cancel: async (h): Promise<void> => {
    sonuclar.delete(h.externalId)
  },

  // Bedava katman tutar bildirmiyor. `null` DÖNMEZ, sıfır döner: burada sıfır bir
  // bilgisizlik değil bir olgudur (§8.3'ün `unreported` ile ayrımı tam olarak bu).
  actualCost: async (_h): Promise<Money | null> => ZERO_USD,
}
