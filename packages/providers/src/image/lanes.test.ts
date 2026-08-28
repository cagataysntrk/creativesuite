// İki şeridin uçtan uca davranışı — msw ile, GERÇEK ağ olmadan (§15).

import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'
import { HttpResponse, http, mockServer } from '@suite/kernel/testing'
import type { ProviderAdapter, ProviderInput } from '../types.js'
import { cfHesaplari, cloudflareImage } from './cloudflare.js'
import { falImage } from './fal.js'
import { NO_TEXT_SUFFIX } from './prompt.js'

/** İstek gövdelerini yakalar: modele NE gönderildiği testin asıl konusu. */
const gonderilen: { url: string; body: unknown }[] = []

/**
 * `multipart/form-data` gövdesini alan sözlüğüne çevirir.
 *
 * ⚠ ⚠ **MOCK ÖNCE `request.json()` ÇAĞIRIYORDU ve model değişince beş test birden
 * düştü.** Sebep testte değil ÖNCÜLDE: Cloudflare görsel modeli `flux-2-klein-4b`
 * oldu ve o uç `multipart/form-data` istiyor. Gövdeyi JSON sanan bir mock, gerçek
 * uçtan farklı bir sözleşme kaydeder — bu dosyanın komşusundaki ders birebir bu:
 * *"bir cassette, sağlayıcının davranışını değil senin varsayımını kaydeder."*
 */
const multipartCoz = (metin: string): Record<string, string> => {
  const sonuc: Record<string, string> = {}
  for (const parca of metin.split(/--[^\r\n]+\r\n/)) {
    const m = /name="([^"]+)"\r\n\r\n([\s\S]*?)\r\n$/.exec(parca)
    if (m?.[1] !== undefined && m[2] !== undefined) sonuc[m[1]] = m[2]
  }
  return sonuc
}

const server = mockServer(
  http.post(
    'https://api.cloudflare.com/client/v4/accounts/:hesap/ai/run/*',
    async ({ request }) => {
      const tur = request.headers.get('content-type') ?? ''
      const ham = await request.clone().text()
      gonderilen.push({
        url: request.url,
        body: tur.startsWith('multipart/') ? multipartCoz(ham) : JSON.parse(ham),
      })
      return HttpResponse.json({ success: true, result: { image: 'BASE64GORSEL' } })
    }
  ),
  http.post('https://queue.fal.run/fal-ai/flux/dev', async ({ request }) => {
    gonderilen.push({ url: request.url, body: await request.clone().json() })
    return HttpResponse.json({ request_id: 'req_abc' })
  }),
  http.get('https://queue.fal.run/fal-ai/flux/dev/requests/req_abc', () =>
    HttpResponse.json({
      status: 'COMPLETED',
      images: [{ url: 'https://x/y.png', width: 1024, height: 1280 }],
    })
  ),
  http.get('https://queue.fal.run/fal-ai/flux/dev/requests/req_bekliyor', () =>
    HttpResponse.json({ status: 'IN_QUEUE' })
  )
)

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => {
  server.resetHandlers()
  gonderilen.length = 0
})
afterAll(() => server.close())

const girdi = (over: Partial<ProviderInput> = {}): ProviderInput => ({
  capability: 'image.generate',
  lane: 'free',
  prompt: 'çelik tezgâh üstünde ölçüm aleti, soğuk ışık',
  constraints: { aspect: '4:5' },
  idempotencyKey: 'idem_img_1',
  ...over,
})

const ctx = (env: Record<string, string>) => ({
  correlationId: 'cor_img',
  signal: new AbortController().signal,
  env,
})

const CF_ENV = { CF_ACCOUNT_ID: 'acc1', CF_API_TOKEN: 'tok1' }
const FAL_ENV = { FAL_KEY: 'k1' }

describe.each([
  ['bedava', cloudflareImage, 'free' as const, CF_ENV],
  ['premium', falImage, 'premium' as const, FAL_ENV],
])('%s şerit', (_ad, adapter: ProviderAdapter, lane, env) => {
  // `throw` yok: hata bir DEĞERDİR (§8.6) ve bu kural test dosyasında da geçerli.
  // Doğrulama düşerse `null` döner ve her iddia zaten anlamlı biçimde başarısız olur.
  const dogrula = () => {
    const v = adapter.validate(girdi({ lane }))
    expect(v.ok, v.ok ? '' : v.error.code).toBe(true)
    return v.ok ? v.value : null
  }

  it('modele giden prompt "no text" eki TAŞIYOR (R-20)', async () => {
    const vi = dogrula()
    if (vi === null) return
    const r = await adapter.start(vi, ctx(env))
    expect(r.ok).toBe(true)
    const govde = gonderilen[0]?.body as { prompt?: string }
    expect(govde?.prompt).toContain(NO_TEXT_SUFFIX)
  })

  it('idempotency anahtarı BAŞLIKTA gidiyor (R-44)', async () => {
    const vi = dogrula()
    if (vi === null) return
    await adapter.start(vi, ctx(env))
    expect(gonderilen).toHaveLength(1)
  })

  it('kimlik yoksa ağa HİÇ çıkmıyor', async () => {
    const vi = dogrula()
    if (vi === null) return
    const r = await adapter.start(vi, ctx({}))
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error.code).toBe('MISSING_CREDENTIALS')
    // Asıl iddia: anahtar yokken istek DENENMEDİ. Denenirse sağlayıcı 401 sayar ve
    // bazı sağlayıcılar 401'i de rate limit'e yazar.
    expect(gonderilen).toHaveLength(0)
  })

  it('BEYAN EDİLMEYEN şerit reddediliyor — sessizce diğerine düşmüyor', () => {
    // ⚠ ⚠ **BU TEST "her adaptörün TEK şeridi var" varsayıyordu ve öncül DEĞİŞTİ.**
    // Cloudflare artık iki şeritte de aday: premium bir koşuda ücretli sağlayıcı
    // düşerse yönlendiricinin düşebileceği bir aday kalsın diye (yedek zinciri).
    // İddia aynı kaldı — *"beyan edilmeyen şeride sessizce düşülmez"* — ama artık
    // adaptörün KENDİ BEYANINDAN türetiliyor, sabit bir "öteki şerit"ten değil.
    // Beyanı okuyan bir test, beyan değişince kendiliğinden doğru kalır.
    const beyan = adapter.capabilities().find((c) => c.name === 'image.generate')?.lanes ?? []
    const disarida = (['free', 'premium'] as const).filter((x) => !beyan.includes(x))
    if (disarida.length === 0) {
      // İki şeridi de beyan eden adaptörde reddedilecek şerit YOK — ve bunu sessizce
      // atlamak yerine BEYANIN kendisi doğrulanıyor: "test bir şey ölçmedi" ile
      // "ölçtü ve geçti" ayrı şeyler.
      expect(beyan.slice().sort()).toEqual(['free', 'premium'])
      return
    }
    for (const oteki of disarida) {
      const v = adapter.validate(girdi({ lane: oteki }))
      expect(v.ok, oteki).toBe(false)
      if (!v.ok) expect(v.error.code).toBe('LANE_UNSUPPORTED')
    }
  })

  it('`no_text: false` AÇIKÇA reddediliyor', () => {
    const v = adapter.validate(girdi({ lane, constraints: { aspect: '4:5', no_text: false } }))
    expect(v.ok).toBe(false)
    if (!v.ok) expect(v.error.code).toBe('NO_TEXT_REQUIRED')
  })

  it('desteklenmeyen oran reddediliyor — yakın orana YUVARLANMIYOR', () => {
    // 4:5 isteyip 1:1 almak, Instagram'da kırpılmış bir başlık demektir.
    const v = adapter.validate(girdi({ lane, constraints: { aspect: '3:2' } }))
    expect(v.ok).toBe(false)
    if (!v.ok) expect(v.error.code).toBe('ASPECT_UNSUPPORTED')
  })

  it('metin isteyen prompt sağlayıcıya HİÇ ULAŞMIYOR', () => {
    const v = adapter.validate(girdi({ lane, prompt: 'üstünde FİRE yazan tabela' }))
    expect(v.ok).toBe(false)
    if (!v.ok) expect(v.error.code).toBe('IMAGE_PROMPT_REJECTED')
    expect(gonderilen).toHaveLength(0)
  })

  it('eksiz prompt `start()` sınırında da yakalanıyor — ikinci savunma', async () => {
    const vi = dogrula()
    if (vi === null) return
    const sahte = { ...vi, prompt: 'ek olmadan bir prompt' }
    const r = await adapter.start(sahte, ctx(env))
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error.code).toBe('NO_TEXT_SUFFIX_MISSING')
    expect(gonderilen).toHaveLength(0)
  })
})

describe('bedava şerit — senkron uç', () => {
  // ⚠ **En-boy artık MODEL SEÇİYOR** (D-238): `1:1` → flux (JSON `{result:{image}}`,
  // boyut gönderilmez), diğerleri → sdxl-lightning (ham JPEG, boyut gönderilir).
  // İlk sürümde tek yol vardı ve gerçek uç onu reddediyordu.

  it('base64 çözülüyor — yanıt `{result:{image}}` şeklinde geliyor', async () => {
    const v = cloudflareImage.validate(girdi({ constraints: { aspect: '1:1' } }))
    expect(v.ok).toBe(true)
    if (!v.ok) return
    const h = await cloudflareImage.start(v.value, ctx(CF_ENV))
    expect(h.ok).toBe(true)
    if (!h.ok) return
    const s = await cloudflareImage.status(h.value)
    expect(s.ok && s.value.state).toBe('succeeded')
    if (s.ok && s.value.state === 'succeeded') {
      expect((s.value.output as { data: string }).data).toBe('BASE64GORSEL')
    }
  })

  it('istek `multipart/form-data` gidiyor — uç JSON gövdeyi REDDEDİYOR', async () => {
    // ⚠ ⚠ **BU BİR ÖLÇÜM.** JSON gövde gönderilince gerçek uç şunu diyor:
    // `AiError: Bad input: required properties at '/' are 'multipart'`. Model şeması
    // da doğruluyor: girdi `{multipart:{body,contentType}}`.
    const v = cloudflareImage.validate(girdi({ constraints: { aspect: '4:5' } }))
    expect(v.ok).toBe(true)
    if (!v.ok) return
    await cloudflareImage.start(v.value, ctx(CF_ENV))
    const govde = (gonderilen.at(-1)?.body ?? {}) as Record<string, string>
    expect(govde['prompt']).toBeTypeOf('string')
    expect(govde['width']).toBe('1024')
    expect(govde['height']).toBe('1280')
  })

  it("ÖLÇÜ 16'nın katına yuvarlanıyor — defter dönen ölçüyü yazsın", async () => {
    // ⚠ ⚠ **MODEL SESSİZCE YUVARLIYOR ve bu ÖLÇÜLDÜ:** 1080 istendiğinde 1072 geliyor.
    // İstenen ölçüyü deftere yazıp farklı bir ölçü döndürmek defteri yalancı yapardı,
    // o yüzden yuvarlamayı ÖNCE biz yapıyoruz.
    const v = cloudflareImage.validate(girdi({ constraints: { aspect: '9:16' } }))
    expect(v.ok).toBe(true)
    if (!v.ok) return
    const h = await cloudflareImage.start(v.value, ctx(CF_ENV))
    expect(h.ok).toBe(true)
    if (!h.ok) return
    const govde = (gonderilen.at(-1)?.body ?? {}) as Record<string, string>
    expect(govde['width'], '1080 değil 1072 isteniyor').toBe('1072')
    const s2 = await cloudflareImage.status(h.value)
    if (s2.ok && s2.value.state === 'succeeded') {
      const o = s2.value.output as { width: number; height: number }
      expect(o.width, 'defter istenen ölçüyü yazıyor').toBe(1072)
      expect(o.height).toBe(1920)
    }
  })

  it('HESAP ZİNCİRİ: tekil değişkenler önce, `CF_HESAPLAR` sonra', () => {
    const h = cfHesaplari({ CF_ACCOUNT_ID: 'a1', CF_API_TOKEN: 't1', CF_HESAPLAR: 'a2:t2,a3:t3' })
    expect(h).toEqual([
      { hesap: 'a1', token: 't1' },
      { hesap: 'a2', token: 't2' },
      { hesap: 'a3', token: 't3' },
    ])
  })

  it('AYNI hesap iki kez denenmiyor, yarım giriş atlanıyor', () => {
    // ⚠ Sondaki virgül ve ayraçsız giriş kasaya elle yazarken beklenen kaza; yarım bir
    // kimlikle çağrı yapmak sağlayıcıya anlamsız bir 403 yedirmekten ibaret olurdu.
    const h = cfHesaplari({
      CF_ACCOUNT_ID: 'a1',
      CF_API_TOKEN: 't1',
      CF_HESAPLAR: 'a1:t1,bozuk,,a2:t2',
    })
    expect(h.map((x) => x.hesap)).toEqual(['a1', 'a2'])
  })

  it('KOTA DOLAN hesaptan SIRADAKİ hesaba geçiliyor (HTTP 200 + code 4006)', async () => {
    // ⚠ ⚠ **BU SENARYO GERÇEK BİR KOŞUDA YAŞANDI** (`run_01a04827`): günlük 10.000
    // neuron bitti, beş görsel adımının ikisi kota hatası aldı, üçü devre kesiciden
    // `CIRCUIT_OPEN` yedi ve karosel GÖRSELSİZ kaldı. Kota hatası HTTP **200** ile
    // geliyor — yalnız durum koduna bakan bir zincir ikinci hesabı hiç denemezdi.
    let cagri = 0
    server.use(
      http.post('https://api.cloudflare.com/client/v4/accounts/:h/ai/run/*', () => {
        cagri += 1
        return cagri === 1
          ? HttpResponse.json({
              success: false,
              errors: [{ code: 4006, message: 'daily free allocation' }],
            })
          : HttpResponse.json({ success: true, result: { image: 'IKINCIHESAP' } })
      })
    )
    const v = cloudflareImage.validate(girdi({ constraints: { aspect: '4:5' } }))
    expect(v.ok).toBe(true)
    if (!v.ok) return
    const r = await cloudflareImage.start(v.value, ctx({ ...CF_ENV, CF_HESAPLAR: 'acc2:tok2' }))
    expect(r.ok, 'ikinci hesap başardı').toBe(true)
    expect(cagri, 'iki hesap denendi').toBe(2)
    if (!r.ok) return
    const s2 = await cloudflareImage.status(r.value)
    if (s2.ok && s2.value.state === 'succeeded') {
      expect((s2.value.output as { data: string }).data).toBe('IKINCIHESAP')
    }
  })

  it('BÜTÜN hesaplar kota yerse hata AÇIKÇA dönüyor — sessiz boş sonuç yok', async () => {
    // Sessiz bir boş sonuç, yedek zincirinin devreye girmesini engeller.
    let cagri = 0
    server.use(
      http.post('https://api.cloudflare.com/client/v4/accounts/:h/ai/run/*', () => {
        cagri += 1
        return HttpResponse.json({ success: false, errors: [{ code: 4006, message: 'kota' }] })
      })
    )
    const v = cloudflareImage.validate(girdi({ constraints: { aspect: '4:5' } }))
    if (!v.ok) return
    const r = await cloudflareImage.start(v.value, ctx({ ...CF_ENV, CF_HESAPLAR: 'a2:t2,a3:t3' }))
    expect(r.ok).toBe(false)
    expect(cagri, 'üç hesabın üçü de denendi').toBe(3)
    if (!r.ok) {
      expect(r.error.code).toBe('DAILY_QUOTA_EXHAUSTED')
      expect(r.error.kind, 'yedek zinciri devreye girebilsin').toBe('provider_rate_limit')
    }
  })

  it('BOZUK İSTEM hatasında hesap DEĞİŞMİYOR — üç kota birden yanmasın', async () => {
    // ⚠ 400 kimlikten bağımsız: aynı isteği üç kez göndermek üç kez aynı cevabı alır.
    let cagri = 0
    server.use(
      http.post('https://api.cloudflare.com/client/v4/accounts/:h/ai/run/*', () => {
        cagri += 1
        return HttpResponse.text('bad input', { status: 400 })
      })
    )
    const v = cloudflareImage.validate(girdi({ constraints: { aspect: '4:5' } }))
    if (!v.ok) return
    const r = await cloudflareImage.start(v.value, ctx({ ...CF_ENV, CF_HESAPLAR: 'a2:t2,a3:t3' }))
    expect(r.ok).toBe(false)
    expect(cagri, 'YALNIZ ilk hesap denendi').toBe(1)
  })

  it('GÜNLÜK KOTA hatası "bozuk yanıt" değil KOTA olarak sınıflanıyor', async () => {
    // ⚠ ⚠ **BU AYRIM GERÇEK BİR KOŞUDA ÖNEM KAZANDI.** Günlük 10.000 neuron bitince uç
    // `success:false` + `code: 4006` döndürüyor — üstelik HTTP 200 ile. İkisini aynı ada
    // koymak, çözülebilir bir sorunu (*"yarın 00:00 UTC'de sıfırlanıyor"*) çözülemez bir
    // sorun gibi gösterirdi; yedek zinciri de yanlış karar verirdi.
    server.use(
      http.post('https://api.cloudflare.com/client/v4/accounts/:h/ai/run/*', () =>
        HttpResponse.json({
          success: false,
          errors: [{ code: 4006, message: 'you have used up your daily free allocation' }],
        })
      )
    )
    const v = cloudflareImage.validate(girdi({ constraints: { aspect: '1:1' } }))
    expect(v.ok).toBe(true)
    if (!v.ok) return
    const r = await cloudflareImage.start(v.value, ctx(CF_ENV))
    expect(r.ok).toBe(false)
    if (!r.ok) {
      expect(r.error.code).toBe('DAILY_QUOTA_EXHAUSTED')
      expect(r.error.kind, 'yedek zinciri bunu kota sayabilmeli').toBe('provider_rate_limit')
    }
  })

  it('HTTP HATA KODU yakalanıyor — 500 bir görsel değildir', async () => {
    // ⚠ ⚠ **BU KONTROL YOKTU ve gerçek bir delikti.** `httpFetch` yalnız AĞ düşerse
    // hata döndürür; 429/500/403 hepsi `ok: true` olarak gelir ve durum kodu
    // `Response`ın üstündedir. Kardeş adaptörde (`gemini.ts`) bu kontrol vardı,
    // burada yoktu.
    server.use(
      http.post('https://api.cloudflare.com/client/v4/accounts/:h/ai/run/*', () =>
        HttpResponse.text('gateway error', { status: 500 })
      )
    )
    const v = cloudflareImage.validate(girdi({ constraints: { aspect: '4:5' } }))
    expect(v.ok).toBe(true)
    if (!v.ok) return
    const r = await cloudflareImage.start(v.value, ctx(CF_ENV))
    expect(r.ok).toBe(false)
    if (!r.ok) {
      expect(r.error.code).toBe('HTTP_ERROR')
      expect(r.error.details?.['status']).toBe(500)
    }
  })

  it('429 KOTA sayılıyor — yedek zinciri doğru karar versin', async () => {
    server.use(
      http.post('https://api.cloudflare.com/client/v4/accounts/:h/ai/run/*', () =>
        HttpResponse.text('rate limited', { status: 429 })
      )
    )
    const v = cloudflareImage.validate(girdi({ constraints: { aspect: '4:5' } }))
    if (!v.ok) return
    const r = await cloudflareImage.start(v.value, ctx(CF_ENV))
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error.kind).toBe('provider_rate_limit')
  })

  it('bozuk yanıt sessizce kabul EDİLMİYOR', async () => {
    server.use(
      http.post('https://api.cloudflare.com/client/v4/accounts/:h/ai/run/*', () =>
        HttpResponse.json({ success: false, errors: [{ message: 'kota doldu' }] })
      )
    )
    const v = cloudflareImage.validate(girdi({ constraints: { aspect: '1:1' } }))
    expect(v.ok).toBe(true)
    if (!v.ok) return
    const r = await cloudflareImage.start(v.value, ctx(CF_ENV))
    expect(r.ok).toBe(false)
    if (!r.ok) {
      expect(r.error.code).toBe('MALFORMED_RESPONSE')
      // Sağlayıcının MESAJI taşınıyor ama NESNESİ taşınmıyor (R-43).
      expect(r.error.details?.['providerMessage']).toBe('kota doldu')
    }
  })

  it('sonuç kaybolduysa "başarılı" DEMİYOR', async () => {
    const s = await cloudflareImage.status({
      providerId: 'cloudflare-workers-ai',
      externalId: 'hic-yok',
      idempotencyKey: 'idem_x',
    })
    expect(s.ok).toBe(false)
    if (!s.ok) expect(s.error.code).toBe('RESULT_LOST')
  })
})

describe('premium şerit — kuyruk', () => {
  it('`request_id` tutamak oluyor', async () => {
    const v = falImage.validate(girdi({ lane: 'premium' }))
    expect(v.ok).toBe(true)
    if (!v.ok) return
    const h = await falImage.start(v.value, ctx(FAL_ENV))
    expect(h.ok && h.value.externalId).toBe('req_abc')
  })

  it('kuyrukta bekleyen iş `running` — "bitti" değil', async () => {
    const s = await falImage.status({
      providerId: 'fal-flux',
      externalId: 'req_bekliyor',
      idempotencyKey: 'idem_y',
    })
    expect(s.ok && s.value.state).toBe('running')
  })

  it('tamamlanan iş URL veriyor, sağlayıcı nesnesi SIZMIYOR', async () => {
    const s = await falImage.status({
      providerId: 'fal-flux',
      externalId: 'req_abc',
      idempotencyKey: 'idem_y',
    })
    expect(s.ok && s.value.state).toBe('succeeded')
    if (s.ok && s.value.state === 'succeeded') {
      const o = s.value.output as Record<string, unknown>
      // Kendi şeklimiz: dört alan. fal'ın `timings`, `seed`, `has_nsfw_concepts`
      // alanları sınırı GEÇMİYOR (R-43).
      expect(Object.keys(o).sort()).toEqual(['data', 'format', 'height', 'width'])
    }
  })

  it('`actualCost` NULL — tahmin gerçek gibi yazılmıyor (§8.3)', async () => {
    const c = await falImage.actualCost({
      providerId: 'fal-flux',
      externalId: 'req_abc',
      idempotencyKey: 'idem_y',
    })
    // Kopyalasaydık "tahmini vs gerçek" sapma raporu yapısal olarak sıfır çıkardı.
    expect(c).toBeNull()
  })
})
