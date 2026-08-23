// Marka varlıklarının KALITIM zinciri — font ve logo da token gibi devralınır (R-101).
//
// ⚠ ⚠ **`brd_dima` GERÇEK BİR ALT MARKA DEĞİLDİ ve koşu ÖLÜYORDU.** Token sistemi
// kalıtımı zaten biliyor: `brand/<id>/parent` tek satır, dima yalnız `state-ok` rolünü
// eziyor ve *"ezmediğin şey MİRASTIR"* diyor. Ama FONT ve LOGO bu zinciri hiç görmüyordu:
// `uret.mjs` doğrudan `brand/brd_dima/fonts` bakıyor, sekiz dosyayı bulamıyor ve
// `process.exit(1)` ediyordu. Ölçüldü — `font ok: false, eksik: 8`.
//
// ⚠ ⚠ **VE LOGO DOSYA ADLARI MARKAYA ÇAKILIYDI:** `upcytech-mavi.png`,
// `upcytech-siyah.png` — marka-nötr bir modülde bir markanın adı. İkinci bir marka kendi
// işaretini KOYAMAZDI, çünkü dosyanın adı başka bir markanın adıydı. Adlar `isaret-koyu`
// / `isaret-acik` oldu: seçim zeminin açıklığından yapılıyor, markadan değil.
//
// ⚠ Sekiz woff2'yi her alt markaya kopyalamak alternatif DEĞİLDİ: kopya bir gün
// ayrışır ve iki marka aynı ada sahip iki farklı fontla üretim yapar.

import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

/** Zincirde en fazla bu kadar halka; döngü ya da yanlış `parent` sonsuza gitmesin. */
const TAVAN = 8

/**
 * Bir markanın varlık dizinlerini KALITIM SIRASINDA döndürür: önce kendisi, sonra
 * atası, sonra onun atası.
 *
 * ⚠ Döngü sessizce ATLANMIYOR, zincir orada KESİLİYOR: `a → b → a` bir yapılandırma
 * hatasıdır ve sonsuz döngüye girmek onu gizler. Tavan da aynı sebeple var.
 */
export const varlikZinciri = (
  brandKok: string,
  markaId: string,
  altDizin: string
): readonly string[] => {
  const zincir: string[] = []
  const gorulen = new Set<string>()
  let id: string | null = markaId
  for (let i = 0; i < TAVAN && id !== null && !gorulen.has(id); i += 1) {
    gorulen.add(id)
    zincir.push(join(brandKok, id, altDizin))
    const pYol = join(brandKok, id, 'parent')
    const p = existsSync(pYol) ? readFileSync(pYol, 'utf8').trim() : ''
    id = p === '' ? null : p
  }
  return zincir
}

/**
 * Zincirdeki İLK tam sonucu döndürür.
 *
 * ⚠ ⚠ **"Tam" olması şart ve bu bir ayrıntı değil.** İlk sürüm "dizin varsa onu al"
 * diyordu; alt markanın boş bir `fonts/` klasörü olsa zincir orada durur ve koşu yine
 * fontsuz kalırdı. Kalıtımın anlamı "eksik olan yukarıdan gelir" — dizinin VARLIĞI
 * değil, İÇERİĞİN tamlığı karar veriyor.
 *
 * ⚠ Kısmi devralma YOK: bir marka fontlarını eziyorsa HEPSİNİ eziyor. Yarısı kendinden
 * yarısı atasından gelen bir tipografi, iki markanın karışımıdır.
 */
export const zincirdenCoz = <T extends { readonly ok: boolean }>(
  zincir: readonly string[],
  coz: (dizin: string) => T
): { readonly sonuc: T; readonly dizin: string; readonly devralindi: boolean } => {
  let ilk: T | null = null
  for (const [i, dizin] of zincir.entries()) {
    const s = coz(dizin)
    if (ilk === null) ilk = s
    if (s.ok) return { sonuc: s, dizin, devralindi: i > 0 }
  }
  const yedek = zincir[0] ?? ''
  return { sonuc: (ilk ?? coz(yedek)) as T, dizin: yedek, devralindi: false }
}
