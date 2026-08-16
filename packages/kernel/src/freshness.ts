// 14 günlük tazelik kapısı (§10 · §11.4 · R-32 · FAZ-6.6).
//
// **Eskimiş bir olguyla yapılan kişiselleştirme, hiç kişiselleştirmemekten kötüdür.**
// Dikkat ettiğini gösterir ve **yanlış şeye** dikkat ettiğini kanıtlar: "geçen ay
// kazandığınız ihale" diye başlayan bir deck, o ihale iptal olduysa görüşmeyi kurtarmaz,
// bitirir. Şirket haberleri, ihale sonuçları ve yönetim değişiklikleri iki haftada eskir.
//
// **Kapı SAAT OKUMAZ** (R-06): `now` çağırandan gelir. Bu yalnız determinizm değil,
// test edilebilirliğin kendisi — "sistem saatini ileri al" diye bir test yazmak yerine
// bir parametre değiştiriyoruz, ve aynı kaynak aynı kodla reddediliyor.

/** Tavan. Değişecekse önce `KURALLAR.md`'de değişir (R-74). */
export const TAZELIK_GUN = 14

const GUN_MS = 86_400_000

export interface Kaynak {
  /** Köken sidecar'ındaki `sourceRef` — hata mesajı hangi kaynağı işaret ettiğini söyler. */
  readonly sourceRef: string
  /** ISO 8601. `provenance.fetchedAt` ile aynı alan. */
  readonly fetchedAt: string
}

export type TazelikSonucu =
  | { readonly taze: true; readonly yasGun: number }
  | { readonly taze: false; readonly yasGun: number; readonly mesaj: string }
  /** Tarih okunamadı. **Taze SAYILMAZ**: bilinmeyen yaş, sıfır yaş değildir. */
  | { readonly taze: false; readonly yasGun: null; readonly mesaj: string }

const gunFarki = (a: string, b: string): number | null => {
  const t1 = Date.parse(a)
  const t2 = Date.parse(b)
  if (Number.isNaN(t1) || Number.isNaN(t2)) return null
  return Math.floor((t2 - t1) / GUN_MS)
}

/**
 * Tek kaynağın tazeliğini ölçer.
 *
 * Gelecekteki bir tarih de reddedilir: saati yanlış bir makineden gelen ya da elle
 * düzenlenmiş bir sidecar, "her zaman taze" bir kaynak yaratırdı — ve tazelik kapısı
 * tam olarak o kayıtta işe yaramaz hâle gelirdi.
 */
export const tazeMi = (k: Kaynak, now: string, maxDays = TAZELIK_GUN): TazelikSonucu => {
  const yas = gunFarki(k.fetchedAt, now)
  if (yas === null) {
    return {
      taze: false,
      yasGun: null,
      mesaj: `${k.sourceRef} — çekim tarihi okunamadı (${k.fetchedAt}); bilinmeyen yaş taze sayılmaz`,
    }
  }
  if (yas < 0) {
    return {
      taze: false,
      yasGun: yas,
      mesaj: `${k.sourceRef} — çekim tarihi GELECEKTE (${k.fetchedAt}); saat ya da sidecar bozuk`,
    }
  }
  if (yas > maxDays) {
    return {
      taze: false,
      yasGun: yas,
      mesaj:
        `${k.sourceRef} — ${yas} günlük (çekim: ${k.fetchedAt}), tavan ${maxDays} gün. ` +
        `Eskimiş bir olguyla kişiselleştirme, dikkat ettiğini gösterip yanlış şeye ` +
        `dikkat ettiğini kanıtlar. Kaynağı yeniden çekin.`,
    }
  }
  return { taze: true, yasGun: yas }
}

export interface TazelikRaporu {
  readonly hepsiTaze: boolean
  readonly bayat: readonly TazelikSonucu[]
  readonly tazeSayisi: number
  /** Yayını bloklayan Türkçe gerekçe. Boş dize = engel yok. */
  readonly gerekce: string
}

/**
 * Bir çalıştırmanın tüm kaynaklarını denetler.
 *
 * **Kaynağı olmayan bir deck de geçmez değil, GEÇER**: tazelik kapısı kaynakların
 * yaşına bakar, varlığına değil. Kaynak zorunluluğu R-32'nin işi (`claim_source`) ve
 * iki kuralı tek kapıya yığmak, biri kırıldığında diğerinin neden kırıldığını
 * gizlerdi (D-198).
 */
export const tazelikRaporu = (
  kaynaklar: readonly Kaynak[],
  now: string,
  maxDays = TAZELIK_GUN
): TazelikRaporu => {
  const sonuclar = kaynaklar.map((k) => tazeMi(k, now, maxDays))
  const bayat = sonuclar.filter((s) => !s.taze)
  return {
    hepsiTaze: bayat.length === 0,
    bayat,
    tazeSayisi: sonuclar.length - bayat.length,
    gerekce:
      bayat.length === 0
        ? ''
        : `${bayat.length} kaynak tazelik tavanını (${maxDays} gün) aşıyor:\n` +
          bayat.map((b) => `  · ${b.taze ? '' : b.mesaj}`).join('\n'),
  }
}
