import { describe, expect, it } from 'vitest'
import { YARDIM, callbackData, parseCallback, parseKomut, tokenGercekMi } from './telegram.js'

describe('telegram yüzey sınırı (§4c · D-19)', () => {
  it('ÜRETİM BAŞLATMA reddediliyor ve NEDENİ söyleniyor', () => {
    // Yüzey sınırının kendisi. "Bilinmeyen komut" demek yanlış bilgi olurdu:
    // komut var, bu yüzeyde yok.
    const r = parseKomut('/uret instagram-post')
    expect(r.kind).toBe('yasak')
    if (r.kind === 'yasak') expect(r.neden).toContain('§4c')
  })

  it('şema, bütçe, keşif ve SİLME de bu yüzeyde YOK', () => {
    for (const k of ['/sema', '/butce', '/discovery', '/sil', '/plan', '/calistir']) {
      expect(parseKomut(k).kind).toBe('yasak')
    }
  })

  it('onay ve red GEÇİYOR — botun tek işi bu', () => {
    expect(parseKomut('/onayla run_x onay')).toEqual({
      kind: 'onayla',
      runId: 'run_x',
      gate: 'onay',
    })
    const r = parseKomut('/reddet run_x onay görsel markaya uymuyor')
    expect(r).toEqual({
      kind: 'reddet',
      runId: 'run_x',
      gate: 'onay',
      gerekce: 'görsel markaya uymuyor',
    })
  })

  it('GEREKÇESİZ RED burada da reddediliyor — aynı kural iki yüzeyde farklı olamaz', () => {
    // Kabul edip sunucuda düşürmek, kullanıcıya "gönderildi" hissi verip hiçbir şey
    // yapmamak olurdu (D-173).
    const r = parseKomut('/reddet run_x onay')
    expect(r.kind).toBe('yasak')
    if (r.kind === 'yasak') expect(r.neden).toContain('GEREKÇE')
  })

  it('gerekçe BOŞLUKLU cümle olarak korunuyor', () => {
    const r = parseKomut('/reddet run_x onay üç kelimelik gerekçe')
    if (r.kind === 'reddet') expect(r.gerekce).toBe('üç kelimelik gerekçe')
  })

  it('`@botadi` eki komutu bozmuyor — grup mesajlarında gelir', () => {
    expect(parseKomut('/kuyruk@upcytech_bot').kind).toBe('kuyruk')
  })

  it('Türkçe büyük harf komutu bozmuyor (R-21)', () => {
    // `'I'.toLowerCase()` → `i` ama Türkçe'de `ı`; `toLocaleLowerCase('tr')` kullanılıyor.
    expect(parseKomut('/KUYRUK').kind).toBe('kuyruk')
  })

  it('tanınmayan komut BİLİNMEYEN — yasakla karıştırılmıyor', () => {
    expect(parseKomut('/zıpzıp').kind).toBe('bilinmeyen')
    expect(parseKomut('').kind).toBe('bilinmeyen')
  })

  it('yardım metni yüzey sınırını AÇIKÇA yazıyor', () => {
    expect(YARDIM).toContain('yalnız onay kuyruğu')
    expect(YARDIM).toContain('para harcar')
  })
})

describe('inline klavye', () => {
  it('callback verisi gidip geliyor', () => {
    const d = callbackData('onay', 'run_x', 'kapı')
    expect(parseCallback(d)).toEqual({ eylem: 'onay', runId: 'run_x', gate: 'kapı' })
  })

  it('bozuk callback `null` — sessizce onaya dönüşmüyor', () => {
    expect(parseCallback('hede|run_x|g')).toBeNull()
    expect(parseCallback('onay||g')).toBeNull()
    expect(parseCallback('onay')).toBeNull()
  })
})

describe('token doğrulama', () => {
  it('YER TUTUCU token ile bot AÇILMAZ', () => {
    // `doldurulacak` ile bağlanmayı denemek, her açılışta 401 alıp yeniden denemek
    // ve log gürültüsünü "bot çalışıyor" sanmaktır.
    expect(tokenGercekMi('doldurulacak')).toBe(false)
    expect(tokenGercekMi(undefined)).toBe(false)
    expect(tokenGercekMi('')).toBe(false)
  })

  it('gerçek biçimli token kabul ediliyor', () => {
    expect(tokenGercekMi('123456789:AAEhBOweik6ad9r_ExampleTokenValue1234567')).toBe(true)
  })
})
