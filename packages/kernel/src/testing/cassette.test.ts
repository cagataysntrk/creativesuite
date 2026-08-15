import { describe, expect, it } from 'vitest'
import { http, HttpResponse } from 'msw'
import type { CorrelationId } from '@suite/contracts'
import { envFlag } from '../config/env.js'
import { httpFetch } from '../net/http.js'
import { recordingServer, replayServer } from './msw.js'
import {
  cassetteExists,
  loadCassette,
  redactHeaders,
  redactText,
  saveCassette,
  type Cassette,
} from './cassette.js'

const CID = 'cor_0192f3a1-0000-7000-8000-000000000009' as CorrelationId
const URL_ = 'https://api.ornek.test/v1/generate'

// Sentetik ama GERÇEKÇİ biçimli anahtarlar: biçim gerçekçi olmazsa redaksiyon testi
// hiçbir şey kanıtlamaz — desenler tam da bu biçimleri arıyor.
//
// Anahtarlar ÇALIŞMA ZAMANINDA birleştirilir, kaynakta düz yazılmaz. Gerekçe: `gitleaks`
// ve `repo-hygiene` bu dosyayı da tarar ve düz yazılmış sahte bir anahtar, gerçek bir
// sızıntıdan ayırt edilemez. Ayırt edilemeyen bulgu, ya kapıyı gürültüyle işe yaramaz
// hâle getirir ya da bir izin listesi deliği açar — ikisi de kabul edilemez.
// Değer çalışma anında birebir gerçek biçimdedir; redaksiyon gerçekten sınanır.
//
// Gövde kısmı DÜŞÜK ENTROPİLİ ama yeterince UZUN: `gitleaks`in entropi sezgiseli
// rastgele görünen bir diziyi "generic-api-key" diye işaretliyor. Testin sınadığı şey
// bizim desenlerimiz (ön ek + uzunluk), rastgelelik değil — o yüzden uzunluk korunur,
// entropi düşürülür. Aksi hâlde kapı kendi test verisine takılıp gürültü üretir.
const GOVDE = 'abcdefghij'.repeat(3)
const SAHTE_ANAHTAR = ['sk', 'ant', 'api03', GOVDE].join('-')
const SAHTE_STRIPE = ['sk', 'live', GOVDE].join('_')

describe('redaksiyon', () => {
  it('hassas başlığın DEĞERİNİ siler, adını bırakır', () => {
    const out = redactHeaders({
      authorization: `Bearer ${SAHTE_ANAHTAR}`,
      accept: 'application/json',
    })
    expect(out['authorization']).toBe('<REDACTED>')
    expect(out['accept']).toBe('application/json')
  })

  it('gövdedeki anahtar desenlerini değiştirir', () => {
    const out = redactText(`{"key":"${SAHTE_ANAHTAR}","stripe":"${SAHTE_STRIPE}"}`)
    expect(out).not.toContain('sk-ant-api03')
    expect(out).not.toContain('sk_live_')
    expect(out).toContain('<REDACTED>')
  })
})

describe('cassette kaydet → oynat', () => {
  it('kaydeder, redakte eder, aynı yanıtı ağsız oynatır', async () => {
    // ── 1. KAYIT ────────────────────────────────────────────────────────────
    const upstream = http.post(URL_, async ({ request }) => {
      const gonderilen = await request.text()
      return HttpResponse.json({
        id: 'gen_sentetik_1',
        echo: gonderilen,
        // Sağlayıcılar anahtarı yanıtta yankılayabiliyor; redaksiyon iki yönlü olmalı.
        used_key: SAHTE_ANAHTAR,
      })
    })

    const rec = recordingServer([upstream])
    rec.server.listen({ onUnhandledRequest: 'error' })

    const kayit = await httpFetch(
      {
        url: URL_,
        method: 'POST',
        headers: { authorization: `Bearer ${SAHTE_ANAHTAR}`, 'content-type': 'application/json' },
        body: JSON.stringify({ prompt: 'sentetik', api_key: SAHTE_STRIPE }),
      },
      CID
    )
    expect(kayit.ok).toBe(true)
    if (!kayit.ok) return
    const kayitGovde = await kayit.value.text()

    rec.server.close()
    const entries = await rec.flush()
    expect(entries).toHaveLength(1)

    // Cassette COMMIT'LENİR. `UPDATE_CASSETTES=1` bilinçli yeniden kayıttır; onsuz
    // test commit'li dosyayı okur. Aksi hâlde bozulan bir sağlayıcı sözleşmesi,
    // cassette'i sessizce güncelleyerek kendi kendini "düzeltir" ve hiçbir şey yakalanmaz.
    const NAME = 'sentetik-generate'
    if (envFlag('UPDATE_CASSETTES') || !cassetteExists(NAME)) {
      saveCassette({ name: NAME, recordedAtCommit: null, entries })
    }
    const cassette: Cassette = loadCassette(NAME)
    expect(cassette.entries).toHaveLength(1)

    // ── 2. REDAKSİYON: cassette git'e girer, secret giremez ──────────────────
    const serialized = JSON.stringify(cassette)
    expect(serialized).not.toContain('sk-ant-api03')
    expect(serialized).not.toContain('sk_live_')
    expect(entries[0]?.requestHeaders['authorization']).toBe('<REDACTED>')

    // ── 3. OYNATMA: ağ yok, aynı yanıt ──────────────────────────────────────
    const rep = replayServer(cassette)
    rep.listen({ onUnhandledRequest: 'error' })

    const oynat = await httpFetch({ url: URL_, method: 'POST', body: '{}' }, CID)
    expect(oynat.ok).toBe(true)
    if (!oynat.ok) return
    expect(oynat.value.status).toBe(200)
    // Oynatılan gövde, KAYDEDİLEN (redakte edilmiş) gövdedir — kayıttaki ham hâli değil.
    expect(await oynat.value.text()).toBe(redactText(kayitGovde))

    rep.close()
  })

  it("cassette'te olmayan istek sessizce geçmez", async () => {
    const bos: Cassette = { name: 'bos', recordedAtCommit: null, entries: [] }
    const rep = replayServer(bos)
    rep.listen({ onUnhandledRequest: 'error' })

    const sonuc = await httpFetch({ url: 'https://baska.ornek.test/yok' }, CID)
    expect(sonuc.ok).toBe(true)
    if (!sonuc.ok) return
    expect(sonuc.value.status).toBe(599)
    expect(await sonuc.value.json()).toMatchObject({ error: 'cassette_miss' })

    rep.close()
  })
})
