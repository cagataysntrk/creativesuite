// Marka işareti — karoselin alt rayındaki imza (§7.2 · D-284 · FAZ-15).
//
// ⚠ ⚠ **İKİ SÜRÜM VAR ve seçim ZEMİNİN AÇIKLIĞINDAN yapılıyor, elle DEĞİL.** Mavi sürüm
// mavi işaret + BEYAZ kelime taşıyor: açık bir zeminde kelime kayboluyor. Siyah sürüm
// tamamen siyah: koyu zeminde kayboluyor. Yani "hangi logo" sorusu bir tercih değil,
// zeminin ölçülen bir özelliği — ve `koyuMu()` zaten onu hesaplıyor.
//
// ⚠ **Dosyalar RENDER tarafından okunmuyor.** `RENDER` fiilinin yan etki sınıfı yalnız
// Chromium (R-04); dosya okuma çağıranın işi, tıpkı `fontCss` gibi. Bu modül veri URI'si
// ÜRETİYOR, belgeye gömmüyor.

import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

export interface LogoVarliklari {
  /** Koyu zemin için: mavi işaret + beyaz kelime. */
  readonly koyu: string
  /** Açık zemin için: tamamen siyah. */
  readonly acik: string
}

export interface LogoSonucu {
  readonly ok: boolean
  readonly varliklar?: LogoVarliklari
  readonly eksikler: readonly string[]
}

const KOYU_DOSYA = 'upcytech-mavi.png'
const ACIK_DOSYA = 'upcytech-siyah.png'

/** Tek dosyayı veri URI'sine çevirir; yoksa `null`. */
const veriUri = (yol: string): string | null =>
  existsSync(yol) ? `data:image/png;base64,${readFileSync(yol).toString('base64')}` : null

/**
 * Logo dosyalarını veri URI'sine çevirir.
 *
 * ⚠ **Eksiklik SESSİZ GEÇİLMİYOR** ama hattı da durdurmuyor: imzasız bir karosel
 * eksiktir, üretilemez değil. Çağıran `ok: false` görürse imzayı atlar ve bunu bilir.
 *
 * ⚠ ⚠ **KAYIT AÇIKÇA KURULUYOR, dinamik anahtarla DEĞİL.** İlk sürüm `cikti[anahtar] = …`
 * yazıyordu ve `chokepoints` kapısı onu `attributes` açıcı deseni sanıp reddetti.
 * Kapı fazla geniş değil: dinamik anahtarla kurulan bir kayıt, tip sisteminden kaçan
 * bir veri yolu açıyor ve bu deponun tek zarf sözleşmesi tam olarak onu yasaklıyor.
 * İki dosya için iki alan yazmak zaten daha okunur.
 */
export const logoVarliklari = (logoDizini: string): LogoSonucu => {
  const koyu = veriUri(join(logoDizini, KOYU_DOSYA))
  const acik = veriUri(join(logoDizini, ACIK_DOSYA))
  const eksikler = [...(koyu === null ? [KOYU_DOSYA] : []), ...(acik === null ? [ACIK_DOSYA] : [])]
  return koyu === null || acik === null
    ? { ok: false, eksikler }
    : { ok: true, varliklar: { koyu, acik }, eksikler: [] }
}
