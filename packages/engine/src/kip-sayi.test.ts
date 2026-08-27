// KİP × SAYI — hangi kipte hangi rakam meşru (R-32 · FAZ-19.13).
//
// ⚠ ⚠ **BU DOSYA BİR REDDEDİLMEDEN DOĞDU ve reddeden MODELDİ — haklı olarak.** Rotasyon
// `veri-hikayesi`yi seçti, istem aynı anda *"her satırda en az bir sayı"* ve *"sayı
// UYDURMA"* dedi; kaynakta ise tek bir rakam vardı ve o da bir madde imiydi (`1 ·`).
// Model çıkmazı adlandırdı: *"tek çıkış sayı uydurmak olurdu, ki bu promptun kendi
// kuralıyla çelişiyor."* Çelişki modelde değil KURALDAYDI.
//
// İki kusur birden:
//   1. Sayaç madde numarasını VERİ sanıyordu — `1 · Hiçbir şey yapmama` bir ölçüm değil.
//   2. `genel` kipte marka kaydı KAYNAK değil BAĞLAM, ama sayı kuralı hâlâ kaynak
//      muamelesi yapıyordu. Depo sahibi ayrımı verdi: *"firma için sayı uydurmak yasak,
//      genel için sayı kullanılabilir."* R-32 buna göre güncellendi.

import { describe, expect, it } from 'vitest'
import { icerikPromptu, kaynaktaSayiVar, rotasyonHedefi } from './metin-akisi.js'
const gercekKayitlar = [
  {
    id: 'rec_comp',
    text: 'Gerçek rakip bir firma değil, üç alternatif davranış.\n1 · Hiçbir şey yapmama',
  },
  {
    id: 'rec_msg',
    text: 'Ana mesaj: Veriniz yoksa önce veriyi kuruyoruz.\n1. Başlamak için hazır',
  },
]
describe('kip · sayı', () => {
  it('madde numarası VERİ SAYILMIYOR', () => {
    expect(kaynaktaSayiVar(gercekKayitlar), 'sayaç 1i veri sanıyordu').toBe(false)
  })
  it('FİRMA kipinde sayısız kaynakta veri-hikayesi ELENİYOR', () => {
    expect(rotasyonHedefi(['sahne'], false, 'firma')).not.toBe('veri-hikayesi')
  })
  it('GENEL kipinde veri-hikayesi ELENMİYOR — sayı genel bilgiden gelebilir', () => {
    expect(rotasyonHedefi(['sahne'], false, 'genel')).toBe('veri-hikayesi')
  })
  it('GENEL kipte istem genel bilgi diyor, marka kaydına HAPSETMİYOR', () => {
    const p =
      icerikPromptu({
        konu: 'K',
        kayitlar: [{ id: 'r', text: 'metin' }],
        kip: 'genel',
        sablonId: 'veri-hikayesi',
        sonSablonlar: ['sahne'],
      }) ?? ''
    expect(p).toContain('GENEL olarak bilinen, doğrulanabilir')
    expect(p).not.toContain('yalnız MARKA BİLGİSİ içinde geçenlerden')
    expect(p, 'uydurma sonuç yasağı duruyor').toContain('istatistik UYDURMA')
  })
  it('FİRMA kipte istem marka kaydını işaret ediyor', () => {
    const p =
      icerikPromptu({
        konu: 'K',
        kayitlar: [{ id: 'r', text: 'metin' }],
        kip: 'firma',
        sablonId: 'veri-hikayesi',
        sonSablonlar: ['sahne'],
      }) ?? ''
    expect(p).toContain('yalnız MARKA BİLGİSİ içinde geçenlerden')
  })
})
