// HEDEF: apps/server/src/yayin-sirasi.ts
//
// Yayın SIRASI — tarihsiz, elle değişen, sonuna eklenen (FAZ-19.14 · UX-22).
//
// ⚠ ⚠ **TAKVİM KALDIRILDI ve kararı depo sahibi verdi:** *"takvim ve tarih planlamayı
// devre dışı bırakmamız lazım. Sadece yayın sırası belirleyeceğiz ve bu değişmeyecek,
// sadece manuel değişebilecek. Yeni eklenen sona gelecek. Takvim eşitlemek saçmalık —
// sadece yayına hazır demek, yayın sırasına sokmak, tarihsiz, ve pushlamak önemli."*
//
// ⚠ ⚠ **TARİH BİR SÖZ VERİYORDU, TUTAMIYORDU.** Takvim bir gönderiyi *"12 Eylül"*e
// koyuyordu ama o gün hiçbir şey olmuyor: makine kapalı olabilir, insan o gün
// paylaşmayabilir, hedef zamanlamayı kabul etmemiş olabilir. Tutulmayan bir tarih,
// tutulduğu sanılan bir tarihten kötüdür — çünkü ona bakıp *"o iş hallolmuş"*
// deniyor. Sıra ise bir söz vermiyor: yalnız NE'DEN SONRA'yı söylüyor ve o her zaman
// doğru kalıyor.
//
// ⚠ ⚠ **SIRA KENDİLİĞİNDEN DEĞİŞMİYOR.** Otomatik planlayıcı her çağrıda sırayı
// yeniden hesaplıyordu; aynı gönderi bir gün ikinci, ertesi gün beşinci sıradaydı ve
// kimse neden değiştiğini bilmiyordu. Artık tek bir kural var: **yeni eklenen SONA
// gelir**, gerisi elle taşınır. Sıra bir hesap değil bir KARAR.
//
// ⚠ ⚠ **KESİRLİ KONUM — ve sebebi ekli defter.** Bir gönderiyi araya almak, ötekilerin
// hepsinin numarasını yeniden yazmak demek olurdu: tek bir taşımada on satırlık bir
// defter mutasyonu. Kesirli konumda (`(önceki + sonraki) / 2`) yalnız TAŞINAN kayıt
// yazılıyor ve defterde tek satır var: kim, nereye, ne zaman.
//
// ⚠ Zaman ÇAĞIRANDAN geliyor (R-06): sunucu `new Date()` çağırsaydı aynı istek iki kez
// farklı kayıt üretirdi ve defter yeniden oynatılamazdı.

import { appendFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'

/** Sıradaki bir gönderiye verilen karar. */
export type SiraKarari =
  /** Sıraya alındı ya da elle taşındı — `konum` geçerli. */
  | 'sira'
  /** Sıradan çıkarıldı. Üretim duruyor, yalnız kuyruktan alındı. */
  | 'cikar'

export interface SiraOlayi {
  readonly runId: string
  readonly karar: SiraKarari
  /**
   * Kuyruktaki KESİRLİ konum. Küçük olan önce yayınlanır.
   *
   * ⚠ Kesirli çünkü araya alma tek satır yazmalı: iki komşunun ortası her zaman
   * bulunabiliyor ve öteki kayıtların hiçbiri değişmiyor.
   */
  readonly konum: number
  /** ISO zaman damgası — çağıran verir (R-06). */
  readonly at: string
  readonly not: string
}

const YOL = 'derived/yayin-sirasi.ndjson'

const defterYolu = (repoRoot: string): string => join(repoRoot, YOL)

/**
 * Defterin tamamı, YAZILMA sırasıyla.
 *
 * ⚠ Bozuk satır ATLANIYOR ama defteri düşürmüyor ve SAYILIYOR: tek bir kötü satır
 * yüzünden bütün sırayı kaybetmek, kaybın kendisinden büyük olurdu.
 */
export const siraOlaylari = (
  repoRoot: string
): { readonly olaylar: readonly SiraOlayi[]; readonly bozuk: number } => {
  const y = defterYolu(repoRoot)
  if (!existsSync(y)) return { olaylar: [], bozuk: 0 }
  const olaylar: SiraOlayi[] = []
  let bozuk = 0
  for (const satir of readFileSync(y, 'utf8').split('\n')) {
    if (satir.trim() === '') continue
    try {
      const o = JSON.parse(satir) as SiraOlayi
      if (typeof o.runId === 'string' && typeof o.karar === 'string') olaylar.push(o)
      else bozuk += 1
    } catch {
      bozuk += 1
    }
  }
  return { olaylar, bozuk }
}

export interface SiraSatiri {
  readonly runId: string
  readonly konum: number
  /** Kuyruğa İLK girdiği an — eşit konumda sırayı bu belirliyor. */
  readonly girisAni: string
  readonly not: string
}

/**
 * Kuyruğun ŞU ANKİ hâli — sırayla.
 *
 * ⚠ Son söz kazanıyor: aynı koşu için birden çok `sira` kaydı varsa sonuncusu geçerli.
 * `cikar` koşuyu kuyruktan düşürüyor ama KAYDI silmiyor (Yasa 10).
 *
 * ⚠ ⚠ **EŞİT KONUMDA GİRİŞ ANI KIRIYOR — ve bu keyfi değil, DETERMİNİST olmak
 * zorunda.** İki gönderi aynı konuma düşerse (elle taşımada olabilir) sıralama
 * kararsız kalır ve ekran her yenilemede farklı bir sıra gösterir. Erken giren önce.
 */
export const yayinSirasi = (repoRoot: string): readonly SiraSatiri[] => {
  const son = new Map<string, { konum: number; not: string }>()
  const giris = new Map<string, string>()
  for (const o of siraOlaylari(repoRoot).olaylar) {
    if (o.karar === 'cikar') {
      son.delete(o.runId)
      continue
    }
    if (!giris.has(o.runId)) giris.set(o.runId, o.at)
    son.set(o.runId, { konum: o.konum, not: o.not })
  }
  return [...son.entries()]
    .map(([runId, v]) => ({
      runId,
      konum: v.konum,
      girisAni: giris.get(runId) ?? '',
      not: v.not,
    }))
    .sort((a, b) =>
      a.konum === b.konum ? a.girisAni.localeCompare(b.girisAni) : a.konum - b.konum
    )
}

/** Bir koşu kuyrukta mı ve kaçıncı sırada (1 tabanlı). Değilse `null`. */
export const siradakiYer = (repoRoot: string, runId: string): number | null => {
  const i = yayinSirasi(repoRoot).findIndex((x) => x.runId === runId)
  return i < 0 ? null : i + 1
}

export type SiraYazmaSonucu =
  | { readonly ok: true; readonly olay: SiraOlayi; readonly sira: number }
  | { readonly ok: false; readonly hata: string }

const yaz = (repoRoot: string, olay: SiraOlayi): void => {
  const y = defterYolu(repoRoot)
  mkdirSync(dirname(y), { recursive: true })
  appendFileSync(y, JSON.stringify(olay) + '\n', 'utf8')
}

/**
 * Kuyruğun SONUNA ekler.
 *
 * ⚠ ⚠ **TEK OTOMATİK KURAL BU — ve depo sahibinin sözü:** *"bir kere kurulduktan sonra
 * yeni eklenen sona gelecek sadece."* Başka hiçbir şey sırayı kendiliğinden
 * değiştirmiyor: ne bir planlayıcı, ne bir ritim, ne bir tarih.
 *
 * ⚠ Zaten kuyruktaysa YENİDEN EKLENMİYOR: aynı gönderiyi iki kez sıraya sokmak, onu
 * iki kez yayınlamaya davettir ve o hata geri alınamaz.
 */
export const siraninSonunaEkle = (
  repoRoot: string,
  g: { readonly runId: string; readonly not?: string; readonly simdi: string }
): SiraYazmaSonucu => {
  if (!/^run_[0-9a-f-]+$/.test(g.runId)) return { ok: false, hata: `geçersiz runId: ${g.runId}` }
  const mevcut = yayinSirasi(repoRoot)
  const zaten = mevcut.findIndex((x) => x.runId === g.runId)
  if (zaten >= 0) return { ok: false, hata: `bu gönderi zaten sırada (${String(zaten + 1)}. sıra)` }
  const enBuyuk = mevcut.reduce((t, x) => (x.konum > t ? x.konum : t), 0)
  const olay: SiraOlayi = {
    runId: g.runId,
    karar: 'sira',
    konum: enBuyuk + 1,
    at: g.simdi,
    not: g.not ?? 'sıraya alındı',
  }
  yaz(repoRoot, olay)
  return { ok: true, olay, sira: mevcut.length + 1 }
}

/**
 * Elle TAŞIMA — hedef sıraya (1 tabanlı) götürür.
 *
 * ⚠ ⚠ **YALNIZ TAŞINAN KAYIT YAZILIYOR.** Konum kesirli olduğu için komşuların
 * hiçbirine dokunulmuyor: tek taşımada defterde tek satır. Bütün sırayı yeniden
 * numaralamak, "kim neyi taşıdı" sorusunu on satırın içinde kaybederdi.
 *
 * ⚠ Hedef aralık dışındaysa REDDEDİLİYOR: sessizce en yakın sıraya koymak, insanın
 * istediği yerden başka bir yere taşımak olurdu.
 */
export const siradaTasi = (
  repoRoot: string,
  g: { readonly runId: string; readonly hedefSira: number; readonly simdi: string }
): SiraYazmaSonucu => {
  const mevcut = yayinSirasi(repoRoot)
  const su = mevcut.findIndex((x) => x.runId === g.runId)
  if (su < 0) return { ok: false, hata: 'bu gönderi sırada değil' }
  const hedef = Math.trunc(g.hedefSira)
  if (!Number.isFinite(hedef) || hedef < 1 || hedef > mevcut.length)
    return { ok: false, hata: `hedef sıra 1–${String(mevcut.length)} aralığında olmalı` }
  if (hedef === su + 1) return { ok: false, hata: 'gönderi zaten bu sırada' }

  // ⚠ Taşınan çıkarıldıktan SONRAKİ listeye göre komşular bulunuyor: kendisiyle
  // karşılaştırmak, bir aşağı taşımayı hiç taşımamaya çevirirdi.
  const kalan = mevcut.filter((x) => x.runId !== g.runId)
  const onceki = kalan[hedef - 2]
  const sonraki = kalan[hedef - 1]
  const konum =
    onceki === undefined
      ? (sonraki?.konum ?? 1) - 1
      : sonraki === undefined
        ? onceki.konum + 1
        : (onceki.konum + sonraki.konum) / 2
  const olay: SiraOlayi = {
    runId: g.runId,
    karar: 'sira',
    konum,
    at: g.simdi,
    not: `elle taşındı: ${String(su + 1)} → ${String(hedef)}`,
  }
  yaz(repoRoot, olay)
  return { ok: true, olay, sira: hedef }
}

/** Sıradan çıkarır — üretim duruyor, yalnız kuyruktan alınıyor. */
export const siradanCikar = (
  repoRoot: string,
  g: { readonly runId: string; readonly not?: string; readonly simdi: string }
): SiraYazmaSonucu => {
  if (siradakiYer(repoRoot, g.runId) === null)
    return { ok: false, hata: 'bu gönderi zaten sırada değil' }
  const olay: SiraOlayi = {
    runId: g.runId,
    karar: 'cikar',
    konum: 0,
    at: g.simdi,
    not: g.not ?? 'sıradan çıkarıldı',
  }
  yaz(repoRoot, olay)
  return { ok: true, olay, sira: 0 }
}
