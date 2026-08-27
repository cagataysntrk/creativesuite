// HEDEF: apps/server/src/yayin-hedefi.ts
//
// Yayın HEDEFİ — planlanan bir gönderinin nereye gittiği (FAZ-19.13 · UX-20).
//
// ⚠ ⚠ **BU DOSYA BİR YUVA, BİR UYGULAMA DEĞİL.** Depo sahibi Metricool MCP'sini bağladı
// ama MCP araçları oturum açılışında yükleniyor ve onu bağlayan oturum bu değildi. Bu
// yüzden hedef bir ARAYÜZ olarak kuruldu: bugün `yerel` hedef çalışıyor (paket klasörü
// üretir, insan yükler), yarın `metricool` hedefi aynı arayüze takılacak ve panelin
// hiçbir yeri değişmeyecek.
//
// ⚠ ⚠ **DURUM MODELİ HEDEFTEN BAĞIMSIZ ve asıl değer bu.** Hangi hedefi kullanırsak
// kullanalım bir gönderi şu dördünden birindedir:
//
//   planlandi  → takvimde bir tarihi var, hedefe HENÜZ gitmedi
//   gonderildi → hedefe iletildi, hedef henüz doğrulamadı
//   esitlendi  → hedef "aldım, kuyruğumda" dedi (dış kimlikle)
//   yayinlandi → gerçekten yayınlandı
//
// ⚠ ⚠ **"ESITLENDI" İKİ FARKLI GERÇEĞİ ANLATABİLİR ve ayrımı GİZLEMİYORUZ.** Facebook
// gerçekten platform tarafında zamanlıyor (`scheduled_publish_time`); Instagram, LinkedIn
// ve X'te zamanlama API'de YOK — orada "eşitlendi" yalnız *bir zamanlayıcının kuyruğunda*
// demek. `platformTutuyor` alanı bu ikisini ayırıyor. Ayırmasaydık, Instagram'da var
// olmayan bir güvenceyi varmış gibi gösterirdik.

import { PLATFORMLAR } from '@suite/contracts'

/** Bir gönderinin hedefe göre durumu. */
export type SenkronDurumu = 'planlandi' | 'gonderildi' | 'esitlendi' | 'yayinlandi' | 'hata'

export interface SenkronKaydi {
  readonly runId: string
  readonly hedef: string
  readonly durum: SenkronDurumu
  /** Hedefin kendi kimliği (Metricool post id, Facebook post id…). Yoksa boş. */
  readonly disKimlik: string
  /**
   * Gönderiyi PLATFORMUN KENDİSİ mi tutuyor, yoksa bir zamanlayıcı mı.
   *
   * ⚠ Yalnız Facebook `true` olabilir. Ötekilerde bir kuyruk tutuyor ve o kuyruk
   * çalışmazsa gönderi gitmez — "platformun takviminde" demek YANLIŞ olurdu.
   */
  readonly platformTutuyor: boolean
  readonly at: string
  readonly not: string
}

/** Bir gönderinin hedefe verilecek tam hâli. */
export interface GonderiPaketi {
  readonly runId: string
  readonly tarih: string
  readonly platformlar: readonly string[]
  /** Platform → gönderi metni. */
  readonly metinler: Readonly<Record<string, string>>
  /** Slayt digest'leri, TESLİMAT SIRASINDA. */
  readonly slaytlar: readonly string[]
  readonly konu: string
  readonly sablon: string
}

export type GonderSonucu =
  | {
      readonly ok: true
      readonly durum: SenkronDurumu
      readonly disKimlik: string
      readonly platformTutuyor: boolean
      readonly not: string
    }
  | { readonly ok: false; readonly hata: string }

/**
 * Bir yayın hedefi.
 *
 * ⚠ ⚠ **`gonder` HİÇBİR ŞEY YAYINLAMAZ — ZAMANLAR.** Yayın anı gönderinin tarihidir;
 * hedefe verilen şey bir kuyruk kaydıdır. Bu ayrım kaybolursa ⛔ YAYIN YOK kuralı
 * kaybolur.
 */
export interface YayinHedefi {
  readonly id: string
  readonly ad: string
  /** Hedef kullanılabilir mi — anahtar var mı, araç bağlı mı. */
  readonly hazir: () => { readonly ok: boolean; readonly sebep: string }
  /** Bu hedefin desteklediği platformlar. */
  readonly platformlar: () => readonly string[]
  /** Gönderiyi hedefe iletir. */
  readonly gonder: (g: GonderiPaketi) => Promise<GonderSonucu>
}

/**
 * ⚠ ⚠ **PLATFORM GERÇEKTEN ZAMANLIYOR MU — araştırmayla doğrulandı.**
 * Yalnız Facebook: `published:false` + `scheduled_publish_time` (10 dk – 30 gün).
 * Instagram Content Publishing'de zamanlama parametresi YOK ve kap 24 saatte doluyor;
 * LinkedIn'de `SCHEDULED` yaşam döngüsü yok; X'te zamanlama yalnız Ads API'de.
 */
export const PLATFORM_ZAMANLAYABILIR: Readonly<Record<string, boolean>> = {
  instagram: false,
  facebook: true,
  linkedin: false,
  x: false,
}

/**
 * YEREL hedef — hiçbir yere göndermez, PAKET hazırlar.
 *
 * ⚠ ⚠ **BU BİR YER TUTUCU DEĞİL, BUGÜNKÜ GERÇEK AKIŞ.** Depo sahibi kararı verdi:
 * *"bu paylaşım yayın işini manuel yapalım, bulut aracı kullanırım."* Yerel hedefin
 * işi klasörü hazır etmek; yükleme insanın.
 * ⚠ `platformTutuyor: false` — hiçbir platform bu gönderiyi tutmuyor, klasör diskte
 * duruyor. Aksini söylemek olmayan bir güvence satmak olurdu.
 */
export const yerelHedef = (
  paketle: (
    runId: string,
    tarih: string,
    platformlar: readonly string[]
  ) =>
    | { readonly ok: true; readonly klasor: string; readonly eksik: readonly string[] }
    | { readonly ok: false; readonly hata: string }
): YayinHedefi => ({
  id: 'yerel',
  ad: 'Yerel paket (elle yükleme)',
  hazir: () => ({ ok: true, sebep: '' }),
  platformlar: () => PLATFORMLAR.map((p) => p.id),
  gonder: (g) => {
    const r = paketle(g.runId, g.tarih, g.platformlar)
    if (!r.ok) return Promise.resolve({ ok: false, hata: r.hata })
    return Promise.resolve({
      ok: true,
      // ⚠ `gonderildi` DEĞİL: hiçbir yere gitmedi. Klasör hazır, sıra insanda.
      durum: 'planlandi' as const,
      disKimlik: '',
      platformTutuyor: false,
      not:
        r.eksik.length === 0
          ? `paket hazır: ${r.klasor}`
          : `paket hazır: ${r.klasor} · ⚠ ${r.eksik.join(' · ')}`,
    })
  },
})

/**
 * Kayıtlı hedefler.
 *
 * ⚠ ⚠ **METRICOOL BURAYA EKLENECEK ve panelin hiçbir yeri değişmeyecek.** Yeni oturumda
 * `post_schedule_post` şeması görülünce şu şekilde bir hedef yazılacak:
 *
 *   { id: 'metricool', ad: 'Metricool',
 *     hazir: () => MCP araçları var mı,
 *     platformlar: () => ['instagram', 'linkedin'],   // sahibin bağladıkları
 *     gonder: async (g) => MCP `post_schedule_post` çağrısı → { disKimlik: post id } }
 *
 * ⚠ Karosel alıp almadığı ORADA öğrenilecek. Almıyorsa hedef `hazir: false` döner ve
 * yerel hedef devrede kalır — sessizce tek görsele DÜŞMEZ.
 */
export const hedefler = (yerel: YayinHedefi): readonly YayinHedefi[] => [yerel]

/** Ada göre hedef. Bulunamazsa `null` — sessizce yerele düşmüyor. */
export const hedefBul = (liste: readonly YayinHedefi[], id: string): YayinHedefi | null =>
  liste.find((h) => h.id === id) ?? null
