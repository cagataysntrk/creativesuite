// YAYIN METNİ — platform başına, sınırı İSTEMDE ve DOĞRULAMADA (FAZ-19.12 · madde 3).
//
// ⚠ ⚠ **BU KAPI BİR ZİNCİR KOPUKLUĞUNU KORUYOR.** `PUBLISH` gövdesi `caption` kısıtını
// okuyor ve o kısıt hattın hiçbir yerinde YAZILMIYORDU — yani her yayın boş açıklamayla
// gidecekti. Modül var, alan var, üreteni yok: bu depoda tekrar eden sınıf. Kapı hem
// üretecin var olduğunu hem de ürettiğinin sınıra uyduğunu sınıyor.
//
// ⚠ ⚠ **VE ASIL SINAMA: SINIR İSTEME GERÇEKTEN YAZILIYOR MU.** İstemin sustuğu yerde
// model doldurur — bu depoda dört kez böyle oldu (harf bütçesi, gövde bütçesi, `tahmin`
// alanının anlamı, aksan alanı derinliği). Bir sınırın DOĞRULAMADA olması yetmez;
// modele söylenmeyen sınır, her koşuda bir kez daha ihlal edilir.

import { describe, expect, it } from 'vitest'
import { yayinMetniCozumle, yayinMetniIstemi, type YayinMetniGirdisi } from './yayin-metni.js'

const G: YayinMetniGirdisi = {
  konu: 'ölçüm alışkanlığa dönüşünce hat kendini düzeltir',
  kartMetni: 'Ölçmediğin şeyi iyileştiremezsin. Sayaç vardiyada okunuyor.',
  slaytSayisi: 4,
  platformlar: ['instagram', 'x', 'linkedin', 'facebook'],
}

describe('yayın metni', () => {
  // ── İSTEM: sınırlar modele SÖYLENİYOR mu ─────────────────────────────────
  it('her platformun SERT sınırı isteme yazılıyor', () => {
    const p = yayinMetniIstemi(G) ?? ''
    expect(p, "X'in 280'i").toContain('280')
    expect(p, "Instagram'ın 2.200'ü").toContain('2200')
    expect(p, "LinkedIn'in 3.000'i").toContain('3000')
    expect(p, 'sert sınırın ne olduğu söylenmeli').toMatch(/SERT sınır/)
  })

  it('KATLANMA noktası da yazılıyor — asıl tasarım sayısı o', () => {
    const p = yayinMetniIstemi(G) ?? ''
    // ⚠ Instagram'a yalnız 2.200 demek YANILTIR: akışta ilk ~125 karakter görünür ve
    // kanca oraya sığmazsa metin geçerli ama okunmaz.
    expect(p).toContain('125')
    expect(p).toMatch(/KANCA oraya sığmalı/)
    // X'te kesim yok ve bu da AÇIKÇA söyleniyor — susmak "kesim var" sanılmasına yol açar.
    expect(p).toMatch(/kesim yok/)
  })

  it('Yasa 8 istemde — karoselde olmayan sayı yasak', () => {
    expect(yayinMetniIstemi(G) ?? '').toMatch(/Karoselde geçmeyen bir sayı/)
  })

  it('platform seçilmemişse istem YOK — boş çağrı para harcar', () => {
    expect(yayinMetniIstemi({ ...G, platformlar: [] })).toBeNull()
  })

  // ── ÇÖZÜMLEME ve DOĞRULAMA ───────────────────────────────────────────────
  it('dört metin çözülüyor', () => {
    const ham = JSON.stringify({
      instagram: 'Ölçüm alışkanlığa dönüşünce hat kendini düzeltir.',
      x: 'Ölçüm alışkanlık olunca hat kendini düzeltir.',
      linkedin: 'Ölçüm bir alışkanlığa dönüşünce hat kendini düzeltmeye başlıyor.',
      facebook: 'Ölçüm alışkanlık olunca hat kendini düzeltir.',
    })
    const r = yayinMetniCozumle(ham, G)
    expect(r).not.toBeNull()
    expect(Object.keys(r?.metinler ?? {}).sort()).toStrictEqual([
      'facebook',
      'instagram',
      'linkedin',
      'x',
    ])
    expect(r?.kusurlar).toStrictEqual([])
  })

  it('tavanı aşan metin KUSUR — yayında değil BURADA yakalanıyor', () => {
    const r = yayinMetniCozumle(
      JSON.stringify({
        x: 'a'.repeat(281),
        instagram: 'Kısa.',
        linkedin: 'Kısa.',
        facebook: 'Kısa.',
      }),
      G
    )
    expect(r?.kusurlar.map((k) => k.platform)).toContain('x')
    expect(r?.kusurlar.find((k) => k.platform === 'x')?.aciklama).toMatch(/281/)
  })

  it('EKSİK platform kusur — sessizce açıklamasız yayınlanmaz', () => {
    const r = yayinMetniCozumle(JSON.stringify({ instagram: 'Kısa bir metin.' }), G)
    expect(r?.kusurlar.map((k) => k.platform).sort()).toStrictEqual(['facebook', 'linkedin', 'x'])
  })

  it('uzun kanca UYARI — kusur değil', () => {
    const uzun =
      'Bu ilk cümle bilerek uzun tutuldu ve Instagram akışında görünen kısmın ötesine ' +
      'taşıyor, yani okuyucu devamına basmadan kancayı göremiyor.'
    const r = yayinMetniCozumle(
      JSON.stringify({ instagram: uzun, x: 'Kısa.', linkedin: 'Kısa.', facebook: 'Kısa.' }),
      G
    )
    expect(r?.uyarilar.map((k) => k.platform)).toContain('instagram')
    expect(r?.kusurlar, 'uzun kanca metni geçersiz kılmaz').toStrictEqual([])
  })

  it('JSON olmayan çıktı `null` — sessizce boş metin üretilmiyor', () => {
    expect(yayinMetniCozumle('elbette, işte metinler:', G)).toBeNull()
  })

  it('modelin SON sözü kazanıyor — kendini düzeltmesi okunuyor', () => {
    // ⚠ Gerçek bir koşuda model önce yanlış yazıp sonra "Düzeltme:" diyerek ikinci bir
    // JSON eklemişti; ilk `{`den son `}`ye kadar okumak ikisini birden yutuyordu.
    const ham =
      '{"instagram": "yanlış"} Düzeltme: ' +
      JSON.stringify({ instagram: 'Doğru.', x: 'Kısa.', linkedin: 'Kısa.', facebook: 'Kısa.' })
    expect(yayinMetniCozumle(ham, G)?.metinler.instagram).toBe('Doğru.')
  })
})
