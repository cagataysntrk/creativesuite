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
import { siradakiYer } from './yayin-sirasi.js'
import type { Kutuphane } from './kutuphane.js'

/** Yayınlanmışlığın DAYANAĞI — hangi defter söylüyor. */
export type YayinKaynagi =
  /** Hattın `yayinla` adımı digest'i deftere yazdı. */
  | 'defter'
  /** İnsan *"ben paylaştım"* dedi (`elle-yayinlandi`). */
  | 'elle'
  /** Hedef (Metricool…) gönderinin YAYINLANDIĞINI bildirdi. */
  | 'hedef'
  /**
   * Hedefte ZAMANLANDI ve tarihi GEÇTİ — yani yayınlanmış olmalı.
   *
   * ⚠ ⚠ **BU TEK ÇIKARIM, ÖTEKİ ÜÇÜ ÖLÇÜM — ve farkı gizlemiyoruz.** Metricool
   * gönderiyi kabul ettiyse o gün yayınlar; makinenin açık olması gerekmiyor, çünkü
   * gönderi artık bizde değil. Depo sahibi kararı verdi: *"metricool planlaması
   * yapıldıysa o tarihi geldiğinde otomatik yayınlandı diyebilir çünkü yayınlanır,
   * manuel düzeltiriz gerekirse."*
   *
   * ⚠ ⚠ **YEREL PAKET BUNA GİRMİYOR.** `yerel` hedefi bir klasör üretiyor ve o klasörü
   * kimse yayınlamıyor. Tarihi geçmiş bir yerel paketi yayın saymak, indirilmiş bir
   * dosyayı paylaşılmış sanmak — ve gerçekten yayınlanmamış bir gönderiyi yayına
   * KAPATMAK olurdu.
   */
  | 'zamanlanmis'

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
 * Hedefin gönderiyi ZAMANLADIĞI anlamına gelen durumlar.
 *
 * ⚠ `planlandi` burada YOK: yerel paket onu yazıyor ve o bir klasörden ibaret.
 * ⚠ Beyaz liste: bilinmeyen bir durum adı zamanlama SAYILMIYOR — emin olmadığımız bir
 * zamanlamadan çıkarılan bir yayın, iki kat tahmindir.
 */
const ZAMANLANDI: readonly string[] = ['esitlendi', 'gonderildi', 'scheduled']

/**
 * Bir koşunun yayın durumu — üç defterin BİRLEŞİK cevabı.
 *
 * ⚠ Sıra önemli: hattın kendi defteri en güçlü kanıt (digest yazılı), sonra hedefin
 * bildirdiği durum, sonra insanın beyanı. Üçü de aynı soruyu cevaplıyor ama farklı
 * güçte: ilki bir OLGU, sonuncusu bir BEYAN.
 */
export const yayinDurumu = (
  repoRoot: string,
  runId: string,
  k: Kutuphane,
  /** Bugünün tarihi `YYYY-MM-DD` — ÇAĞIRANDAN (R-06). Boşsa çıkarım yapılmıyor. */
  bugun = ''
): YayinDurumu => {
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

  // 3) Hedefte ZAMANLANDI ve tarihi geçti — ÇIKARIM (ölçüm değil, ve öyle deniyor).
  if (s?.hedef !== undefined && ZAMANLANDI.includes(s.hedef.durum) && s.hedef.id !== 'yerel') {
    const t = s.tarih.trim()
    // ⚠ Bugün ÇAĞIRANDAN geliyor (R-06): sunucu kendi saatini sorsaydı aynı defter iki
    // makinede iki farklı cevap verirdi ve *"yayınlandı mı"* yeniden oynatılamazdı.
    // ⚠ `bugun` boşsa çıkarım YAPILMIYOR: tarihsiz bir karşılaştırma her şeyi geçmiş
    // sayardı.
    if (t !== '' && bugun !== '' && t <= bugun) {
      return {
        yayinlandi: true,
        kaynak: 'zamanlanmis',
        tarih: t,
        aciklama: `${s.hedef.id} ${t} tarihine zamanlamıştı ve o tarih geçti — yayınlanmış sayılıyor`,
      }
    }
  }

  // 4) İnsanın beyanı.
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
  k: Kutuphane,
  bugun = ''
): { readonly engelli: false } | { readonly engelli: true; readonly hata: string } => {
  const d = yayinDurumu(repoRoot, runId, k, bugun)
  if (!d.yayinlandi) return { engelli: false }
  return {
    engelli: true,
    hata:
      `bu gönderi ZATEN YAYINLANDI — ${d.aciklama}. ` +
      (d.kaynak === 'elle' || d.kaynak === 'zamanlanmis'
        ? 'Yanlışsa "otomatiğe bırak" ile kararı geri al.'
        : 'Aynı karoseli ikinci kez yayınlamak geri alınamaz.'),
  }
}

/** Bir gönderinin YAYIN AKIŞINDAKİ yeri — ekranda tek satırda okunacak hâli. */
export type GonderiAsamasi =
  /** Yayınlandı (ölçüldü ya da zamanlamadan çıkarıldı). */
  | 'yayinlandi'
  /** Bir hedefe iletildi ve hedef tutuyor — tarihi henüz gelmedi. */
  | 'zamanlandi'
  /**
   * Yayın SIRASINDA — tarihsiz, kaçıncı olduğu belli.
   *
   * ⚠ ⚠ **ESKİ ADI `planlandi`YDI ve bir TARİH ima ediyordu.** Depo sahibi takvimi
   * kaldırttı: *"sadece yayın sırası belirleyeceğiz, tarihsiz."* Tarih bir söz
   * veriyordu ve tutamıyordu; sıra yalnız NE'DEN SONRA'yı söylüyor ve o her zaman
   * doğru kalıyor.
   */
  | 'sirada'
  /** İnsan takvimden çıkardı. */
  | 'cikarildi'
  /** Hiçbir karar yok — otomatik takvimde ya da hiç sırada değil. */
  | 'planlanmadi'

export interface GonderiDurumu {
  readonly asama: GonderiAsamasi
  /** İlgili tarih (`YYYY-MM-DD`) — yalnız YAYINLANMIŞ gönderilerde dolu. */
  readonly tarih: string
  /** Kuyruktaki yeri (1 tabanlı). Sırada değilse `0`. */
  readonly sira: number
  /** Hangi hedefe gitti (`yerel`, `metricool`…). Gitmediyse boş. */
  readonly hedef: string
  readonly platformlar: readonly string[]
  /** Tek cümlelik, ekrana OLDUĞU GİBİ yazılabilir hâl. */
  readonly etiket: string
  readonly yayin: YayinDurumu
}

/**
 * Gönderinin tam durumu — **koşu ekranı ile yayın ekranının paylaştığı tek cevap.**
 *
 * ⚠ ⚠ **İKİ EKRAN AYNI SORUYU AYRI AYRI CEVAPLIYORDU.** Yayın ekranı takvim defterini
 * okuyup bölümlere ayırıyordu; koşu/varlık ekranı yayın durumunu HİÇ bilmiyordu ve
 * onaylanmış bir tasarımın planlı mı, zamanlanmış mı, yayında mı olduğu orada
 * görünmüyordu. Depo sahibi: *"planlanmış olanlar ve durumları çok net görünmeli
 * varlıklarda. ve yayın ve varlıklar tam senkron olmalı."* Senkron bir kopyalama işi
 * değil, TEK KAYNAK işidir.
 *
 * ⚠ Etiket burada kuruluyor, ekranda değil: iki ekranın aynı durumu iki farklı cümleyle
 * yazması, aynı ayrışmanın kelime hâli olurdu.
 */
export const gonderiDurumu = (
  repoRoot: string,
  runId: string,
  k: Kutuphane,
  bugun = ''
): GonderiDurumu => {
  const y = yayinDurumu(repoRoot, runId, k, bugun)
  const karar = gecerliKararlar(repoRoot).get(runId)
  const s = sonSenkron(repoRoot).get(runId)
  const platformlar = karar?.platformlar ?? []

  if (y.yayinlandi) {
    return {
      asama: 'yayinlandi',
      tarih: y.tarih,
      sira: 0,
      hedef: s?.hedef?.id ?? '',
      platformlar,
      // ⚠ Çıkarım ile ölçüm ekranda da AYRI görünüyor: *"yayınlanmış sayılıyor"* ile
      // *"yayınlandı"* aynı cümle değil ve insan hangisi olduğunu bilmeli.
      etiket:
        y.kaynak === 'zamanlanmis'
          ? `✓ yayınlanmış sayılıyor · ${y.tarih}`
          : `✓ yayınlandı${y.tarih === '' ? '' : ` · ${y.tarih}`}`,
      yayin: y,
    }
  }

  if (s?.hedef !== undefined && ZAMANLANDI.includes(s.hedef.durum) && s.hedef.id !== 'yerel') {
    return {
      asama: 'zamanlandi',
      tarih: s.tarih,
      sira: siradakiYer(repoRoot, runId) ?? 0,
      hedef: s.hedef.id,
      platformlar,
      etiket: `⇄ ${s.hedef.id} planlaması tamamlandı · ${s.tarih || 'tarihsiz'}`,
      yayin: y,
    }
  }

  // ⚠ ⚠ **SIRA TAKVİMİN YERİNİ ALDI.** Eski dal `planla` kararına ve bir TARİHE
  // bakıyordu; artık tek soru *"kuyrukta kaçıncı"*. Takvim defteri okunmaya devam
  // ediyor ama yalnız YAYIN işareti için (`yayinDurumu`) — planlama için değil.
  const sira = siradakiYer(repoRoot, runId)
  if (sira !== null)
    return {
      asama: 'sirada',
      tarih: '',
      sira,
      hedef: s?.hedef?.id ?? '',
      platformlar,
      // ⚠ Yerel paket ÇIKARILDIYSA bu da söyleniyor: *"sırada"* ile *"paketi hazır"*
      // ayrı iki iş ve ikisini birden bilmek insanın sıradaki adımını belirliyor.
      etiket:
        s?.hedef?.id === 'yerel'
          ? `↓ ${String(sira)}. sırada · yerel paket hazır`
          : `↓ ${String(sira)}. sırada`,
      yayin: y,
    }

  if (karar?.karar === 'cikar')
    return {
      asama: 'cikarildi',
      tarih: '',
      sira: 0,
      hedef: '',
      platformlar,
      etiket: '⌫ sıradan çıkarıldı',
      yayin: y,
    }

  return {
    asama: 'planlanmadi',
    tarih: '',
    sira: 0,
    hedef: '',
    platformlar,
    etiket: '— sıraya alınmadı',
    yayin: y,
  }
}
