import { describe, expect, it } from 'vitest'
import { join } from 'node:path'
import { loadDescriptors } from '../descriptor.js'

/**
 * Dört seslendirme şeridinin SÖZLEŞMESİ (§7.5 · D-18 · FAZ-5.4).
 *
 * Bu test gerçek ses üretmiyor ve üretmemeli: anahtarlar yok (V-21) ve premium şerit
 * gerçek para harcıyor. Sınanan şey sözleşme — hangi şeritte kim var ve lisans
 * kuralının gerçekten bir kural olup olmadığı. D-180'in deseni: yüzey sınırı
 * bağlantıdan AYRI test edilebilir.
 */
const REPO = join(import.meta.dirname, '../../../..')
const { descriptors } = loadDescriptors(join(REPO, 'registry/providers'))
const tts = descriptors.filter((d) => d.capabilities.some((c) => c.name === 'audio.tts'))

describe('audio.tts şeritleri', () => {
  it('üç sağlayıcı tanımlı: yerel · bedava bulut · premium', () => {
    expect(tts.map((d) => d.id).sort()).toEqual(['chatterbox', 'elevenlabs', 'gemini-tts'])
  })

  // 🧪 Lisans kuralı gerçek bir kural mı. Fikstür (D-181): iki bedava sağlayıcı `true`
  // beyan ediyor, biri premium ve `false` — kural kalkarsa ayrım tamamen kaybolur.
  it('bedava şeritteki her sağlayıcı ticari lisans BEYAN ediyor', () => {
    for (const d of tts) {
      if (d.capabilities.some((c) => c.lanes.includes('free'))) {
        expect(d.freeTierCommercial).toBe(true)
      }
    }
    // ElevenLabs bedava katmanının ticari lisansı YOK ve bu beyan edilmiş.
    expect(tts.find((d) => d.id === 'elevenlabs')?.freeTierCommercial).toBe(false)
  })

  it('ElevenLabs YALNIZ premium şeritte — lisans bunu zorunlu kılıyor', () => {
    const el = tts.find((d) => d.id === 'elevenlabs')
    const seritler = el?.capabilities.find((c) => c.name === 'audio.tts')?.lanes ?? []
    expect([...seritler]).toEqual(['premium'])
  })

  it('yerel şerit kimlik İSTEMİYOR — kendi sesin makineden çıkmaz', () => {
    expect(tts.find((d) => d.id === 'chatterbox')?.authEnv).toBeNull()
    // Bulut şeridi kimlik ister ve ADI beyan edilir, değeri değil (R-51).
    expect(tts.find((d) => d.id === 'gemini-tts')?.authEnv).toBe('GEMINI_API_KEY')
  })

  /**
   * **"Kendi kaydın" bir SAĞLAYICI DEĞİLDİR** (§7.5): dosya girdisidir, fiil değil.
   * Sağlayıcı sayarsak "ses üret" adımı bazen ağ çağırır bazen çağırmaz olurdu ve
   * çalıştırma öncesi maliyet tahmini yalan olurdu (§3.10).
   */
  it('kendi kaydın sağlayıcı olarak modellenmemiş', () => {
    const suphe = descriptors.filter((d) =>
      /kendi|own-?recording|upload|dosya/i.test(`${d.id} ${d.title}`)
    )
    expect(suphe.map((d) => d.id)).toEqual([])
  })

  it('hiçbir TTS sağlayıcısı ENABLED değil — anahtarlar ve ağırlıklar yok (V-21)', () => {
    // "Ölçülmedi" ile "çalışıyor" ayrı sonuçlar: `enabled: true` yazmak, olmayan bir
    // anahtarla çalıştırma denemesi ve her seferinde hata demekti.
    expect(tts.every((d) => !d.enabled)).toBe(true)
  })
})
