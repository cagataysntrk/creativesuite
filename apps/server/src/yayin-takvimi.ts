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
  /** Bu gönderi hangi platformlara gidecek. Boşsa koşunun kendi seçimi geçerli. */
  readonly platformlar: readonly string[]
  /** ISO zaman damgası — çağıran verir (R-06). */
  readonly at: string
  readonly not: string
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
    readonly platformlar?: readonly string[]
    readonly not?: string
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

  const olay: TakvimOlayi = {
    runId: g.runId,
    karar: g.karar as TakvimKarari,
    tarih,
    platformlar: g.platformlar ?? [],
    at: g.simdi,
    not: g.not ?? '',
  }
  const y = defterYolu(repoRoot)
  mkdirSync(dirname(y), { recursive: true })
  appendFileSync(y, JSON.stringify(olay) + '\n', 'utf8')
  return { ok: true, olay }
}
