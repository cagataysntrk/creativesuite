// HEDEF: apps/server/src/yayin-takvimi.ts
//
// Yayın takviminin DEFTERİ — elle verilen kararlar (FAZ-19.13 · UX-6, UX-9).
//
// ⚠ ⚠ **TAKVİM HİÇBİR YERE YAZILMIYORDU.** `yayinPlaniKur` her çağrıda sıfırdan
// hesaplıyor: aynı girdiye aynı takvim, ama İNSANIN verdiği hiçbir karar yaşamıyordu.
// *"Yayında crud işlemleri manuel düzenleme silme geri alma değiştirme platform seçme
// vs her şey olmalı"* — hepsi bu deftere yazılıyor.
//
// ⚠ ⚠ **EKLEMELİ DEFTER, ÜSTÜNE YAZMA YOK.** Bir gönderinin tarihi üç kez değiştiyse
// üçü de duruyor ve SONUNCUSU geçerli. Üstüne yazan bir kayıt, *"bu neden 12'sine
// alındı"* sorusunu cevapsız bırakırdı — ve o soru altı ay sonra soruluyor.
// Yasa 10 ile aynı ilke: emeklilik silme değildir, `sil` de bir OLAY.
//
// ⚠ ⚠ **PLANLAYICI HÂLÂ ÇALIŞIYOR — defter onu EZMİYOR, TAMAMLIYOR.** Elle karar
// verilmemiş üretimler otomatik takvime giriyor; elle karar verilenler kendi tarihinde
// duruyor. İkisini birbirinin alternatifi yapmak, ya otomatiği ya eli işe yaramaz
// kılardı.
//
// ⚠ Zaman ÇAĞIRANDAN geliyor (R-06): sunucu `new Date()` çağırsaydı aynı istek iki
// kez farklı kayıt üretirdi ve defter yeniden oynatılamazdı.

import { varsayilanYayinSaati, yayinSaatiGecerli } from '@suite/contracts'
import { appendFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'

/** Bir gönderiye insan eliyle verilen karar. */
export type TakvimKarari =
  /** Elle tarih (ve isteğe bağlı platform seçimi) verildi. */
  | 'planla'
  /** Takvimden çıkarıldı — üretim duruyor, yalnız sıradan alındı. */
  | 'cikar'
  /** Elle yayınlandı (sistem göndermedi, insan uygulamadan paylaştı). */
  | 'elle-yayinlandi'
  /** Önceki karar geri alındı — üretim otomatik takvime döner. */
  | 'geri-al'
  /**
   * Gönderi bir HEDEFE iletildi (yerel paket, Metricool…).
   *
   * ⚠ ⚠ **BU BİR İNSAN KARARI DEĞİL, BİR OLAY** — ve aynı deftere yazılıyor çünkü aynı
   * gönderinin hikâyesi. `gecerliKararlar` onu ATLIYOR: bir senkron kaydı gönderinin
   * tarihini ya da takvimdeki yerini değiştirmiyor.
   */
  | 'senkron'

export interface TakvimOlayi {
  readonly runId: string
  readonly karar: TakvimKarari
  /** ISO `YYYY-MM-DD`. `cikar` ve `geri-al` için boş olabilir. */
  readonly tarih: string
  /**
   * Yayın saati `HH:MM` — Türkiye saati. Boşsa varsayılan geçerli.
   *
   * ⚠ ⚠ **TAKVİMDE SAAT HİÇ YOKTU.** Depo sahibi: *"yayın saati yok??? o da otomatik
   * ayarlanmalı."* Tarihi olup saati olmayan bir plan, yayıncıya *"o gün bir ara"*
   * demektir — ve Metricool'a zamanlama gönderirken bir saat vermek ZORUNLU.
   * ⚠ Alan İSTEĞE BAĞLI: defter ekli, eski kayıtlarda yok ve okuyucu varsayılana
   * düşüyor. Zorunlu kılmak defterdeki her eski satırı ayrıştırılamaz yapardı.
   */
  readonly saat?: string
  /** Bu gönderi hangi platformlara gidecek. Boşsa koşunun kendi seçimi geçerli. */
  readonly platformlar: readonly string[]
  /** ISO zaman damgası — çağıran verir (R-06). */
  readonly at: string
  readonly not: string
  /**
   * `senkron` kaydının YAPISAL hâli — hedef ne dedi.
   *
   * ⚠ ⚠ **BU ALAN BİR AYRIŞTIRICIYI ÖLDÜRMEK İÇİN EKLENDİ.** Durum önce `not`
   * dizesinin içine gömülüyordu (`metricool:esitlendi:post_991 — …`) ve okuyan taraf
   * onu `split(':')` ile çözüyordu. Bir gün biri nota iki nokta üst üste yazsa okuma
   * sessizce yanlış cevap verirdi — ve o cevap *"bu gönderi yayınlandı mı"* sorusunun
   * cevabıydı. Ayrıştırılan bir alan, alan değildir.
   *
   * ⚠ Eski kayıtlarda YOK ve öyle kalacak (defter ekli): okuyucu `undefined`ı
   * "hedef tutmuyor" sayıyor — bilinmeyeni yayın saymak, bu deponun kaçındığı şey.
   */
  readonly hedef?: {
    readonly id: string
    readonly durum: string
    readonly disKimlik: string
    /** Gönderiyi platformun KENDİSİ mi tutuyor (yalnız Facebook `true` olabilir). */
    readonly platformTutuyor: boolean
  }
}

const YOL = 'derived/yayin-takvimi.ndjson'

const defterYolu = (repoRoot: string): string => join(repoRoot, YOL)

/**
 * Defterin tamamı, YAZILMA sırasıyla.
 *
 * ⚠ Bozuk satır ATLANIYOR ama defteri düşürmüyor: tek bir kötü satır yüzünden bütün
 * takvimi kaybetmek, kaybın kendisinden büyük bir kayıp olurdu. Atlanan satır sayısı
 * çağırana bildiriliyor — sessizce yutmak, defterin kısaldığını gizlerdi.
 */
export const takvimOlaylari = (
  repoRoot: string
): { readonly olaylar: readonly TakvimOlayi[]; readonly bozuk: number } => {
  const y = defterYolu(repoRoot)
  if (!existsSync(y)) return { olaylar: [], bozuk: 0 }
  const olaylar: TakvimOlayi[] = []
  let bozuk = 0
  for (const satir of readFileSync(y, 'utf8').split('\n')) {
    if (satir.trim() === '') continue
    try {
      const o = JSON.parse(satir) as TakvimOlayi
      if (typeof o.runId === 'string' && typeof o.karar === 'string') olaylar.push(o)
      else bozuk += 1
    } catch {
      bozuk += 1
    }
  }
  return { olaylar, bozuk }
}

/**
 * Koşu → GEÇERLİ karar. Son söz kazanır; `geri-al` kaydı kararı SİLER.
 *
 * ⚠ `geri-al` bir kayıt olarak duruyor ama sonuçta koşu haritada YOK: yani "elle karar
 * verilmemiş" durumuna dönüyor ve otomatik planlayıcı onu yeniden alıyor. Kaydı silmek
 * yerine kararı geri almak, geçmişi korurken bugünü düzeltiyor.
 */
export const gecerliKararlar = (repoRoot: string): ReadonlyMap<string, TakvimOlayi> => {
  const m = new Map<string, TakvimOlayi>()
  for (const o of takvimOlaylari(repoRoot).olaylar) {
    // ⚠ ⚠ **SENKRON KAYDI KARARI EZMİYOR.** Bir gönderinin hedefe iletilmiş olması
    // takvimdeki yerini değiştirmez; ikisi ayrı sorular. İlk sürümde `else` dalına
    // düşseydi, senkrondan sonra gönderi tarihini kaybederdi.
    if (o.karar === 'senkron') continue
    if (o.karar === 'geri-al') m.delete(o.runId)
    else m.set(o.runId, o)
  }
  return m
}

/**
 * Bir koşunun SON senkron kaydı — hedefe gitti mi, hangi durumda.
 *
 * ⚠ Karar `geri-al` ile sıfırlanınca senkron kaydı da geçersiz sayılıyor: takvimden
 * çıkarılmış bir gönderinin "eşitlendi" rozeti taşıması yanıltıcı olurdu.
 */
export const sonSenkron = (repoRoot: string): ReadonlyMap<string, TakvimOlayi> => {
  const m = new Map<string, TakvimOlayi>()
  for (const o of takvimOlaylari(repoRoot).olaylar) {
    if (o.karar === 'geri-al') m.delete(o.runId)
    else if (o.karar === 'senkron') m.set(o.runId, o)
  }
  return m
}

export type YazmaSonucu =
  { readonly ok: true; readonly olay: TakvimOlayi } | { readonly ok: false; readonly hata: string }

/**
 * Deftere bir karar yazar.
 *
 * ⚠ ⚠ **DOĞRULAMA BURADA, EKRANDA DEĞİL.** Panel bir tarih alanı sunuyor ama uç doğrudan
 * da çağrılabiliyor; geçersiz bir tarih deftere girerse takvim `NaN` ile dolar ve bunu
 * ancak ekrana bakınca fark ederiz.
 * ⚠ `planla` için tarih ZORUNLU: tarihsiz bir planlama, planlama değildir.
 */
export const takvimeYaz = (
  repoRoot: string,
  g: {
    readonly runId: string
    readonly karar: string
    readonly tarih?: string
    /** `HH:MM`. Verilmezse varsayılan yazılıyor — plan saatsiz kalmasın. */
    readonly saat?: string
    readonly platformlar?: readonly string[]
    readonly not?: string
    /** `senkron` kaydının yapısal hâli — ayrıştırma yerine ALAN. */
    readonly hedef?: TakvimOlayi['hedef']
    /** ISO zaman — çağıran verir (R-06). */
    readonly simdi: string
  }
): YazmaSonucu => {
  const gecerli: readonly string[] = ['planla', 'cikar', 'elle-yayinlandi', 'geri-al', 'senkron']
  if (!gecerli.includes(g.karar)) return { ok: false, hata: `bilinmeyen karar: ${g.karar}` }
  const tarih = (g.tarih ?? '').trim()
  if ((g.karar === 'planla' || g.karar === 'elle-yayinlandi') && !/^\d{4}-\d{2}-\d{2}$/.test(tarih))
    return { ok: false, hata: `${g.karar} için tarih YYYY-MM-DD olmalı` }
  if (!/^run_[0-9a-f-]+$/.test(g.runId)) return { ok: false, hata: `geçersiz runId: ${g.runId}` }

  // ⚠ ⚠ **SAAT DOĞRULANIYOR ve VARSAYILANA DÜŞÜYOR.** Geçersiz bir saat deftere
  // girerse Metricool'a gönderilecek zaman `NaN` olur ve bunu ancak yayın gününde
  // fark ederiz. Boş saat ise bir hata değil: varsayılan sözleşme devreye giriyor.
  const saat = (g.saat ?? '').trim()
  if (saat !== '' && !yayinSaatiGecerli(saat))
    return { ok: false, hata: `saat HH:MM olmalı: ${saat}` }
  const olay: TakvimOlayi = {
    runId: g.runId,
    karar: g.karar as TakvimKarari,
    tarih,
    // ⚠ Varsayılan TARİHE bağlı: bugüne planlanan gönderi 21:00, ötekiler 20:00.
    // Bugün ÇAĞIRANDAN (`g.simdi`) geliyor — defter yeniden oynatılabilir kalsın (R-06).
    saat: saat === '' ? varsayilanYayinSaati(tarih, g.simdi.slice(0, 10)) : saat,
    platformlar: g.platformlar ?? [],
    at: g.simdi,
    not: g.not ?? '',
    ...(g.hedef === undefined ? {} : { hedef: g.hedef }),
  }
  const y = defterYolu(repoRoot)
  mkdirSync(dirname(y), { recursive: true })
  appendFileSync(y, JSON.stringify(olay) + '\n', 'utf8')
  return { ok: true, olay }
}

/**
 * Son kararı GERİ ALIR — bir öncekini yeniden yazarak.
 *
 * ⚠ ⚠ **DEFTER EKLİ; GERİ ALMAK SİLMEK DEĞİL, ÖNCEKİNİ TEKRAR YAZMAKTIR.** Depo sahibi:
 * *"takvimde düzenleme geri alınabilmeli."* Sürükleyip yanlış güne bıraktığında ya da
 * yanlış işaretlediğinde tek çare, doğru değeri hatırlayıp elle yeniden girmekti — ve
 * "önceki neydi" sorusunun cevabı yalnız defterde yazılıydı, ekranda değil.
 *
 * ⚠ ⚠ **`geri-al` KARARIYLA KARIŞTIRILMAMALI.** O karar, koşuyu OTOMATİK takvime
 * bırakıyor (elle karar kalmıyor). Bu işlem ise bir ADIM geri gidiyor: 12'sine
 * planlanmış bir gönderi 19'una taşındıysa, geri alma onu 12'sine döndürür — otomatiğe
 * değil. İkisi ayrı ihtiyaç ve ikisi de duruyor.
 *
 * ⚠ Geri alınacak bir şey yoksa (tek karar ya da hiç karar) `null`: uydurulmuş bir
 * "önceki hâl" yazmak, olmayan bir kararı varmış gibi göstermek olurdu.
 */
export const geriAlinacak = (
  repoRoot: string,
  runId: string
): {
  readonly karar: TakvimKarari
  readonly tarih: string
  readonly saat: string
  readonly platformlar: readonly string[]
} | null => {
  // ⚠ `senkron` ATLANIYOR: bir hedefe iletilmiş olmak takvimdeki yeri değiştirmiyor,
  // dolayısıyla geri alınacak bir "önceki hâl" de değil (`gecerliKararlar` ile aynı).
  const kararlar = takvimOlaylari(repoRoot).olaylar.filter(
    (o) => o.runId === runId && o.karar !== 'senkron'
  )
  if (kararlar.length < 2) return null
  const onceki = kararlar[kararlar.length - 2]
  if (onceki === undefined) return null
  return {
    karar: onceki.karar,
    tarih: onceki.tarih,
    saat: onceki.saat ?? '',
    platformlar: onceki.platformlar,
  }
}
