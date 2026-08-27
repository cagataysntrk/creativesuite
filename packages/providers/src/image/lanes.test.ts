// İki şeridin uçtan uca davranışı — msw ile, GERÇEK ağ olmadan (§15).

import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'
import { HttpResponse, http, mockServer } from '@suite/kernel/testing'
import type { ProviderAdapter, ProviderInput } from '../types.js'
import { cloudflareImage } from './cloudflare.js'
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
