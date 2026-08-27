// HEDEF: apps/server/src/yayinlanmis.ts
//
// "Bu gönderi YAYINLANDI mı" sorusunun **tek** cevabı (FAZ-19.13 · UX-21).
//
// ⚠ ⚠ **BU DOSYA BİR RİSKTEN DOĞDU, BİR KUSURDAN DEĞİL — ve risk depo sahibinin
// cümlesiyle geldi:** *"böylece yayınlananlar belli olur ve tekrar yayına girmez bu çok
// önemli aynı şey tekrar paylaşılmamalı kesinlikle."* Aynı karoseli iki kez paylaşmak
// geri alınamaz: takipçi onu görür, arşiv onu taşır, ve *"bunu zaten görmüştüm"* markanın
// söyleyebileceği en pahalı cümledir.
//
// ⚠ ⚠ **ÜÇ AYRI DEFTER AYNI SORUYU CEVAPLIYORDU ve hiçbiri ötekini bilmiyordu:**
//   1. `derived/runs/published.ndjson` — hattın kendi `yayinla` adımının yazdığı,
//      DIGEST düzeyinde kayıt.
//   2. `derived/yayin-takvimi.ndjson` → `elle-yayinlandi` — insanın *"ben paylaştım"*
//      dediği an. Hat hiçbir şey göndermedi, ama gönderi YAYINDA.
//   3. Aynı defterdeki `senkron` kaydı — hedefe iletildi. **Bu YAYINLANDI DEĞİLDİR:**
//      yerel paket klasörü üretmek bir yayın değil; Metricool'a zamanlamak da değil,
//      çünkü zamanlanmış bir gönderi henüz çıkmadı. Ancak hedef *"yayınlandı"* durumunu
//      bildirdiğinde sayılır.
//
// İkisi (1 ve 2) arasındaki boşluk gerçekti: elle yayınlanmış bir gönderi `hazir`
// listesinde kalmaya devam ediyordu, yani yeniden planlanabiliyor, yeniden hedefe
// gönderilebiliyor ve yeniden paketlenebiliyordu. Kapı yoktu.
//
// ⚠ **TARİHİN GEÇMESİ YAYIN DEĞİLDİR.** *"12 Eylül'e planlıydı, bugün 15 Eylül, demek
// yayınlandı"* diyen bir kural YALAN SÖYLER: makine kapalı olabilir (Yasa 12), insan
// o gün paylaşmamış olabilir. Geçmiş tarih bir OLGU değil bir SORUDUR ve ekran onu soru
// olarak soruyor (`gecikmis`), cevap olarak değil.

// ⚠ Yayın defteri DOĞRUDAN okunmuyor: `kutuphane()` onu zaten okuyup her varlığa
// `yayinlandi` olarak basıyor. İkinci bir okuyucu, defterin biçimi değişince
// ayrışacak ikinci bir ayrıştırıcı demekti.
import { gecerliKararlar, sonSenkron } from './yayin-takvimi.js'
import type { Kutuphane } from './kutuphane.js'

/** Yayınlanmışlığın DAYANAĞI — hangi defter söylüyor. */
export type YayinKaynagi =
  /** Hattın `yayinla` adımı digest'i deftere yazdı. */
  | 'defter'
  /** İnsan *"ben paylaştım"* dedi (`elle-yayinlandi`). */
  | 'elle'
  /** Hedef (Metricool…) gönderinin YAYINLANDIĞINI bildirdi. */
  | 'hedef'

export interface YayinDurumu {
  readonly yayinlandi: boolean
  /** `null` = yayınlanmadı. */
  readonly kaynak: YayinKaynagi | null
  /** Bilinen yayın tarihi (`YYYY-MM-DD`) — bilinmiyorsa boş. */
  readonly tarih: string
  /** İnsana gösterilecek tek cümle. */
  readonly aciklama: string
}

const YAYINLANMADI: YayinDurumu = {
  yayinlandi: false,
  kaynak: null,
  tarih: '',
  aciklama: '',
}

/**
 * Hedef kaydının YAYINLANDIĞI anlamına gelen durumları.
 *
 * ⚠ ⚠ **`planlandi` BURADA YOK ve olmamalı.** Yerel paket hedefi `planlandi` yazıyor:
 * klasör hazır, sıra insanda, hiçbir yere gitmedi. Onu yayın saymak, indirilmiş bir
 * dosyayı paylaşılmış sanmaktı — ve tam olarak bu yüzden bu liste bir BEYAZ liste:
 * yeni bir hedef bilinmeyen bir durum adı döndürürse yayın SAYILMIYOR, çünkü emin
 * olmadığımız bir yayın, yayın değildir.
 */
const YAYIN_DURUMLARI: readonly string[] = ['yayinlandi', 'published']

/**
 * Bir koşunun yayın durumu — üç defterin BİRLEŞİK cevabı.
 *
 * ⚠ Sıra önemli: hattın kendi defteri en güçlü kanıt (digest yazılı), sonra hedefin
 * bildirdiği durum, sonra insanın beyanı. Üçü de aynı soruyu cevaplıyor ama farklı
 * güçte: ilki bir OLGU, sonuncusu bir BEYAN.
 */
export const yayinDurumu = (repoRoot: string, runId: string, k: Kutuphane): YayinDurumu => {
  // 1) Hattın defteri — digest düzeyinde.
  //
  // ⚠ ⚠ **EMEKLİ SÜRÜMLER DE SAYILIYOR ve bu KASITLI.** Bir karoselin eski sürümü
  // yayınlandıysa o gönderi YAYINDADIR; sonradan editörde düzeltmek onu yayından
  // kaldırmıyor. Yalnız güncel sürüme bakan bir kural, düzenlenmiş bir gönderiyi
  // "hiç yayınlanmamış" sayar ve ikinci kez paylaşırdı — kaçınmaya çalıştığımız şeyin
  // ta kendisi.
  const bu = [...k.varliklar, ...k.emekliVarliklar].filter((v) => v.sourceRunId === runId)
  if (bu.length > 0 && bu.some((v) => v.yayinlandi)) {
    return {
      yayinlandi: true,
      kaynak: 'defter',
      tarih: '',
      aciklama: 'hattın yayın defterinde kayıtlı — bu karosel yayınlandı',
    }
  }

  // 2) Hedef ne diyor.
  const s = sonSenkron(repoRoot).get(runId)
  if (s !== undefined) {
    // Not biçimi: `<hedef>:<durum>[:<disKimlik>] — <açıklama>` (`sunucu.ts` yazıyor).
    const durum = s.not.split(' — ')[0]?.split(':')[1] ?? ''
    if (YAYIN_DURUMLARI.includes(durum)) {
      return {
        yayinlandi: true,
        kaynak: 'hedef',
        tarih: s.tarih,
        aciklama: `hedef yayınlandığını bildirdi (${s.not.split(':')[0] ?? 'hedef'})`,
      }
    }
  }

  // 3) İnsanın beyanı.
  const karar = gecerliKararlar(repoRoot).get(runId)
  if (karar?.karar === 'elle-yayinlandi') {
    return {
      yayinlandi: true,
      kaynak: 'elle',
      tarih: karar.tarih,
      aciklama: `${karar.tarih} tarihinde elle yayınlandığı işaretlendi`,
    }
  }

  return YAYINLANMADI
}

/**
 * Yayınlanmış bir gönderiye ikinci kez dokunmayı ENGELLER.
 *
 * ⚠ ⚠ **UYARI DEĞİL, RET.** *"Zaten yayınlandı"* yazan bir uyarı, tıklandıktan sonra
 * okunur ve gönderi çoktan ikinci kez gitmiştir. Depo sahibi: *"aynı şey tekrar
 * paylaşılmamalı kesinlikle"* — kesinlik bir uyarıyla kurulmaz.
 *
 * ⚠ Geri dönüş yolu KAPALI DEĞİL: takvim defteri ekli ve `geri-al` kararı yayın
 * işaretini kaldırıyor (`gecerliKararlar`). Yani "yanlışlıkla işaretledim" düzeltilebilir
 * bir hata; "yanlışlıkla ikinci kez paylaştım" değil.
 */
export const yayinlanmisMi = (
  repoRoot: string,
  runId: string,
  k: Kutuphane
): { readonly engelli: false } | { readonly engelli: true; readonly hata: string } => {
  const d = yayinDurumu(repoRoot, runId, k)
  if (!d.yayinlandi) return { engelli: false }
  return {
    engelli: true,
    hata:
      `bu gönderi ZATEN YAYINLANDI — ${d.aciklama}. ` +
      (d.kaynak === 'elle'
        ? 'Yanlış işaretlendiyse önce "otomatiğe bırak" ile kararı geri al.'
        : 'Aynı karoseli ikinci kez yayınlamak geri alınamaz.'),
  }
}
