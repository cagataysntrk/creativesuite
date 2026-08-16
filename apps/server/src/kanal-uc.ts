// Publish Queue ve Channel Status verisi (§9.4, §12.9 · D-19 · FAZ-7.7).
//
// **Log'a bakmayı hatırlaman gereken bir sağlık göstergesi, olmayan bir sağlık
// göstergesidir.** Token'ın ne zaman öldüğü, sürüm sabitinin kaç günlük olduğu ve
// kotanın nerede durduğu üç ayrı yerde yazıyordu; hiçbiri açılan bir ekranda değildi.
//
// **Ölçülmeyen şey "iyi" diye gösterilmez** (D-175). Bu modülde üç ayrı "bilinmiyor"
// var ve üçü de ayrı ayrı söyleniyor:
//   1. token kaydı yok            → yayın BLOKLU, "süresiz" değil
//   2. yayın defteri yok          → geçmiş ÖLÇÜLEMEDİ, "hiç yayın yok" değil
//   3. oran bütçesi tüketimi      → süreç-içi, bu süreçte ÖLÇÜLMEDİ (aşağıya bak)
//
// **Oran bütçesi neden ölçülmüyor:** `RateLimiter` kovaları çalıştırma sürecinde yaşıyor
// (`packages/engine/src/run.ts`). Sunucuda yeni bir limiter kurup `available()` sormak
// her seferinde "kova dolu" derdi — sağlayıcı 429 dönerken ekranda yeşil bir çubuk.
// Bu yüzden **yapılandırma** raporlanıyor (kapasite, dolum hızı, yazma ağırlığı) ve
// anlık tüketim açıkça `null`. Canlı limiter verilirse gerçek okuma girer.

import {
  RateLimiter,
  DEFAULT_BUCKET,
  YAZMA_PUANI,
  readLedger,
  type BucketConfig,
} from '@suite/engine'
import {
  LINKEDIN_VERSION,
  LINKEDIN_VERSION_VERIFIED_AT,
  SURUM_TAZELIK_GUN,
  surumYasiGun,
  yenilemeRaporu,
  type TokenKaydi,
  type YenilemeRaporu,
} from '@suite/providers'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { bekleyenler, type KuyrukSatiri } from './kuyruk.js'

/** Token ömrü kaydı — **sır değil**, o yüzden düz metin (FAZ-7.6). */
const TOKEN_YOLU = 'secrets/token-durumu.json'

/** Bugün yayın yapabilen kanallar. Sırası ekranda göründüğü sıradır. */
export const KANALLAR = ['meta', 'linkedin'] as const
export type KanalAdi = (typeof KANALLAR)[number]

/** Yayın yeteneği — oran kovası anahtarının ikinci yarısı. */
const YAYIN_YETENEGI = 'channel.publish'

export interface SurumDurumu {
  readonly pinned: string
  readonly verifiedAt: string
  readonly yasGun: number | null
  /** Yeniden kontrole kalan gün. **Negatifse geçmiş.** `null` = tarih okunamadı. */
  readonly kalanGun: number | null
  readonly eskimis: boolean
}

export interface OranButcesi {
  readonly kapasite: number
  readonly dolumSaniyede: number
  /** Bir yayın çağrısının puanı (§9.2): yazma 3, okuma 1. */
  readonly yayinPuani: number
  /**
   * Anlık kalan puan. **`null` = ölçülmedi**, "dolu" değil — kovalar çalıştırma
   * sürecinde yaşıyor ve bu uç oraya bakamıyor.
   */
  readonly kalan: number | null
}

export interface KanalDurumu {
  readonly kanal: KanalAdi
  readonly token: YenilemeRaporu
  /** Yayın bugün mümkün mü — token ve sürüm kapılarının BİRLİKTE cevabı. */
  readonly yayinaUygun: boolean
  /** Neden mümkün değil. Boşsa engel yok. */
  readonly engeller: readonly string[]
  readonly oran: OranButcesi
  /** Yalnız LinkedIn sürüm sabiti taşıyor; Meta'da `null`. */
  readonly surum: SurumDurumu | null
}

export interface YayinGecmisi {
  readonly toplam: number
  readonly sonYayin: string | null
}

export interface KanalPanosu {
  readonly simdi: string
  readonly kanallar: readonly KanalDurumu[]
  /** Onay bekleyen çalıştırmalar — yayına giden yolun önündeki kuyruk. */
  readonly bekleyenler: readonly KuyrukSatiri[]
  /**
   * Yayınlanmışlar. **`null` = defter YOK ve geçmiş ölçülemedi** — sıfır değil.
   * Defter türetilemez (D-38); yokluğu bir olgu, bir boşluk değil.
   */
  readonly gecmis: YayinGecmisi | null
  readonly gecmisNeden: string | null
  /**
   * Zamanlama YOK ve bu söyleniyor. Boş bir "zamanlanmış" listesi, zamanlayıcının
   * var olup hiç iş almadığı anlamına gelirdi; oysa henüz yazılmadı.
   */
  readonly zamanlamaVar: boolean
}

const tokenKayitlari = (repoRoot: string): { kayitlar: TokenKaydi[]; okunabildi: boolean } => {
  const yol = join(repoRoot, TOKEN_YOLU)
  if (!existsSync(yol)) return { kayitlar: [], okunabildi: false }
  try {
    const ham = JSON.parse(readFileSync(yol, 'utf8')) as { kayitlar?: unknown }
    return {
      kayitlar: Array.isArray(ham.kayitlar) ? (ham.kayitlar as TokenKaydi[]) : [],
      okunabildi: true,
    }
  } catch {
    // Bozuk dosya, olmayan dosyadan farklı DEĞİL: ikisi de "ömür bilinmiyor" ve
    // `tokenDurumu(null)` bunu zaten yayın blokajına çeviriyor.
    return { kayitlar: [], okunabildi: false }
  }
}

export const surumDurumu = (now: string): SurumDurumu => {
  const yas = surumYasiGun(now)
  return {
    pinned: LINKEDIN_VERSION,
    verifiedAt: LINKEDIN_VERSION_VERIFIED_AT,
    yasGun: yas,
    kalanGun: yas === null ? null : SURUM_TAZELIK_GUN - yas,
    eskimis: yas === null || yas > SURUM_TAZELIK_GUN,
  }
}

export interface PanoSecenekleri {
  readonly repoRoot: string
  /** ISO 8601 — çağıran verir (R-06). */
  readonly simdi: string
  /**
   * Canlı limiter. Verilirse oran bütçesi GERÇEKTEN ölçülür; verilmezse `kalan: null`
   * ve ekran "ölçülmedi" der.
   */
  readonly limiter?: RateLimiter
  readonly bucket?: BucketConfig
}

export const kanalPanosu = (o: PanoSecenekleri): KanalPanosu => {
  const { kayitlar } = tokenKayitlari(o.repoRoot)
  const raporlar = yenilemeRaporu(kayitlar, KANALLAR, o.simdi)
  const cfg = o.bucket ?? DEFAULT_BUCKET
  const surum = surumDurumu(o.simdi)

  const kanallar = KANALLAR.map((kanal, i): KanalDurumu => {
    const token = raporlar[i]!
    const engeller: string[] = []
    if (token.bloklu) engeller.push(token.mesaj)
    // Sürüm eskimesi LinkedIn'de bir UYARI değil bir ENGEL: emekli sürümle yapılan
    // çağrı 426 döner ve hattı sebebi anlaşılmayan bir hatayla durdurur.
    if (kanal === 'linkedin' && surum.eskimis) {
      engeller.push(
        `LinkedIn sürüm sabiti ${surum.yasGun ?? '?'} günlük (${surum.pinned}) — yeniden kontrol edilmeli (§9.3)`
      )
    }
    return {
      kanal,
      token,
      yayinaUygun: engeller.length === 0,
      engeller,
      oran: {
        kapasite: cfg.capacity,
        dolumSaniyede: cfg.refillPerSecond,
        yayinPuani: YAZMA_PUANI,
        kalan: o.limiter?.available(kanal, YAYIN_YETENEGI) ?? null,
      },
      surum: kanal === 'linkedin' ? surum : null,
    }
  })

  const defter = readLedger(o.repoRoot)
  return {
    simdi: o.simdi,
    kanallar,
    bekleyenler: bekleyenler(o.repoRoot),
    gecmis: defter.ok
      ? {
          toplam: defter.entries.length,
          sonYayin: defter.entries.at(-1)?.publishedAt ?? null,
        }
      : null,
    gecmisNeden: defter.ok
      ? null
      : defter.error.kind === 'ledger_missing'
        ? `yayın defteri yok (${defter.error.path}) — geçmiş ÖLÇÜLEMEDİ, "hiç yayın yok" DEĞİL`
        : `yayın defteri ${defter.error.line}. satırda bozuk: ${defter.error.reason}`,
    zamanlamaVar: false,
  }
}
