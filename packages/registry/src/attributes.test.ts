import { describe, expect, it } from 'vitest'
import type { RecordEnvelope } from '@suite/contracts'
import { attribute, unsealAttributes } from './attributes.js'

// D-73 bu dosyayı "tek yasal açıcı" olarak doğurdu; doğrulama agent'ı bir tur sonra
// SIFIR test ve SIFIR çağıran buldu — yani D-69'un kapattığı ölü-kod deseni aynen
// tekrarlanmıştı. Belgelenmiş ve darboğazla korunan ama hiç çalıştırılmamış bir açıcı,
// FAZ-3'te ilk kez çağrıldığında ne yaptığı bilinmeyen bir fonksiyondur.

/** Yalnız `attributes` alanı anlamlı olan sahte zarf. Zarf 20+ alan taşır (§3.2),
 *  hiçbiri bu testin konusu değil — açıcının davranışı test ediliyor. */
const kayit = (attrs: Record<string, unknown>): RecordEnvelope =>
  ({ id: 'rec_t', attributes: attrs }) as unknown as RecordEnvelope

describe('unsealAttributes — TEK yasal açıcı (§3.2 · R-01 · D-73)', () => {
  it('kullanıcı alanlarını okunabilir hâle getirir', () => {
    const a = unsealAttributes(kayit({ sektor: 'imalat', calisan: 6 }))
    expect(a['sektor']).toBe('imalat')
    expect(a['calisan']).toBe(6)
  })

  it('boş attributes boş nesne döner — istisna değil', () => {
    expect(unsealAttributes(kayit({}))).toEqual({})
  })

  it('DONDURULMUŞ döner: yazma tek noktadan (write.ts) geçmek zorunda (§5.4)', () => {
    const a = unsealAttributes(kayit({ sektor: 'imalat' }))
    expect(Object.isFrozen(a)).toBe(true)
    expect(() => {
      // Katı modda dondurulmuş nesneye yazmak fırlatır; sessizce yutulursa
      // aşağıdaki değer kontrolü yine de kaydı korur.
      ;(a as Record<string, unknown>)['sektor'] = 'lojistik'
    }).toThrow()
    expect(a['sektor']).toBe('imalat')
  })

  it('KOPYA döner — açılan nesneyi değiştirmek kaydı değiştirmez', () => {
    const ham = { sektor: 'imalat' }
    const a = unsealAttributes(kayit(ham))
    expect(a).not.toBe(ham)
    ham.sektor = 'lojistik'
    expect(a['sektor']).toBe('imalat') // açılan görüntü anlık, canlı değil
  })

  it('iç içe değerler DERİN dondurulmaz — sınır açıkça biliniyor', () => {
    // Sığ dondurma bilinçli: derin dondurma her açışta tüm ağacı gezer ve
    // `SELECT`→`COMPOSE` yolunu kayıt sayısıyla doğru orantılı yavaşlatır.
    // Değişmezlik sözleşmesi ÜST seviyededir; iç içe nesne yine de kopyanın
    // parçasıdır, bu yüzden bir mutasyon kaydı değil yalnız görüntüyü bozar.
    const a = unsealAttributes(kayit({ olcek: { calisan: 6 } }))
    expect(Object.isFrozen(a['olcek'])).toBe(false)
  })
})

describe('attribute — tek alan, daraltma ÇAĞIRANIN işi', () => {
  it('var olan alanı döndürür', () => {
    expect(attribute(kayit({ sektor: 'imalat' }), 'sektor')).toBe('imalat')
  })

  it('olmayan alan undefined — istisna değil, veri durumu', () => {
    expect(attribute(kayit({ sektor: 'imalat' }), 'yok')).toBeUndefined()
  })

  it('prototip anahtarları veri sanılmaz', () => {
    // `{}` üzerinden gelen `toString` bir kullanıcı alanı DEĞİLDİR. Yayılma
    // operatörü yalnız kendi anahtarlarını kopyaladığı için bu doğru çalışıyor;
    // test bunu sabitliyor ki gelecekteki bir `Object.assign(proto)` sapması yakalansın.
    expect(attribute(kayit({}), 'toString')).toBeUndefined()
    expect(attribute(kayit({}), '__proto__')).toBeUndefined()
  })
})
