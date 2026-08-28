// Sağlayıcı ortamı TEK yerde kurulur (§14 · R-51 · D-237).
//
// **Bulunan kusur:** `candidatesFor(capability, env)` sağlayıcının kullanılabilirliğini
// `env` içindeki anahtarlara bakarak belirliyor. Ama iki çağıran farklı davranıyordu:
//
//   · `scripts/plan.mjs` yalnız `PATH` geçiriyordu → anahtar kasada olsa bile
//     `just plan` her sağlayıcıyı "yerel önkoşul sağlanmadı" diye eliyordu.
//   · `scripts/uret.mjs` üç adı ELLE sayıyordu (`FAL_KEY`, `CF_ACCOUNT_ID`,
//     `CF_API_TOKEN`) → dördüncü sağlayıcı eklendiği gün sessizce unutulacaktı.
//
// İkisi de aynı hatanın iki yüzü: **hangi anahtarların gerektiği VERİDİR** ve o veri
// tanımlayıcılarda zaten yazıyor (`auth_env:`). Elle sayan her liste bir gün ayrışır.
//
// ⚠ Bu modül ortamı OKUMAZ. Okuyucu `readEnv` (secret-okuyucu darboğazı, §3.8) ve
// çağıran onu geçirir. Burada `process.env`e dokunmak, darboğazın ikinci bir kopyasını
// açmak olurdu.

import type { ProviderDescriptor } from './descriptor.js'

/**
 * Tanımlayıcıların beyan ettiği anahtar adları — yalnız **enabled** olanlardan.
 *
 * Kapalı bir sağlayıcının anahtarını ortama koymak zararsız görünür ama yanlış:
 * `enabled: false` "bu sağlayıcı kullanılmıyor" demektir ve sırrı gereksiz yere
 * alt süreçlere yaymak, en az yetki ilkesinin sessiz ihlalidir.
 */
export const authEnvNames = (descriptors: readonly ProviderDescriptor[]): readonly string[] =>
  [
    ...new Set(
      descriptors
        .filter((d) => d.enabled)
        .map((d) => d.authEnv)
        .filter((x): x is string => x !== null)
    ),
  ].sort()

/**
 * Sağlayıcı kullanılabilirliği için gereken ortam.
 *
 * `PATH` ve `HOME` her zaman var: bazı sağlayıcılar yerel bir ikili arıyor
 * (`claude-code`) ve o ikililer ev dizinini okur.
 *
 * ⚠ ⚠ **`HOME` EKSİKTİ ve panelden başlatılan koşu SESSİZCE ÖLÜYORDU.** Sunucu
 * `just uret`i bu ortamla başlatıyor; `scripts/sh.sh` `set -u` altında koşuyor ve
 * ilk satırında `HOME: unbound variable` ile düşüyordu. Panel "başlatıldı: run_…"
 * yazıyor, `derived/runs` altında hiçbir dizin açılmıyordu. Kabuktan koşarken
 * `HOME` zaten mevcut olduğu için hata YALNIZ sunucu yolunda görünüyordu — bu
 * yüzden testler de yeşildi.
 *
 * `HOME` bir sır değil; en az yetki ilkesi "çalıştırmayı imkânsız kıl" demek değil.
 * Değeri `undefined` olan anahtar **hiç eklenmez** — boş dize ile "var ama boş"
 * arasındaki farkı sağlayıcıya taşımak, yanlış pozitif bir kullanılabilirlik verir.
 *
 * ⚠ **`CF_ACCOUNT_ID` gibi `auth_env` OLMAYAN yardımcı değişkenler:** tanımlayıcı tek
 * bir `auth_env` beyan edebiliyor, oysa Cloudflare iki değişken istiyor. `ek` bunun
 * için var ve çağıran açıkça verir — sessiz bir varsayım yerine görünür bir parametre.
 */
/**
 * `auth_env` OLMAYAN yardımcı değişkenler — tanımlayıcı bunları beyan edemiyor.
 *
 * ⚠ ⚠ **BU LİSTE ALTI ÇAĞIRANDA ELLE SAYILIYORDU ve tam bu dosyanın dokümanı onun bir
 * gün ayrışacağını yazıyordu.** Yedinci değişken (`CF_HESAPLAR`) eklenirken ayrışma
 * gerçekleşti: altı yerin altısını da güncellemek gerekiyordu ve biri unutulsa o giriş
 * noktasında sağlayıcı sessizce *"yerel önkoşul sağlanmadı"* derdi. Liste artık TEK
 * yerde; çağıran hiçbir şey saymıyor.
 *
 * ⚠ Bunlar SIR DEĞİL demek değil — `CF_HESAPLAR` hesap:token çiftleri taşıyor ve kasada
 * duruyor. Buradaki liste yalnız *"hangi adlar alt sürece geçsin"* diyor; değerler
 * `sops exec-env`den geliyor ve bu modül onları OKUMUYOR.
 */
export const YARDIMCI_DEGISKENLER: readonly string[] = [
  // Cloudflare iki değişken istiyor; tanımlayıcı tek `auth_env` beyan edebiliyor.
  'CF_ACCOUNT_ID',
  // Çok hesaplı yedek zinciri: "hesap:token,hesap:token". Bir hesabın günlük kotası
  // dolduğunda sıradakine geçiliyor.
  'CF_HESAPLAR',
  // Yerel ikilinin yolu — `claude-code` adaptörü onu çalıştırıyor.
  'CLAUDE_CODE_BIN',
]

export const saglayiciOrtami = (
  descriptors: readonly ProviderDescriptor[],
  oku: (ad: string) => string | undefined,
  ek: readonly string[] = []
): Readonly<Record<string, string>> => {
  const sonuc: Record<string, string> = { PATH: oku('PATH') ?? '', HOME: oku('HOME') ?? '' }
  // ⚠ Yardımcı değişkenler HER ZAMAN ekleniyor: çağıranın onları saymasına gerek yok
  // ve saymayı unutması imkânsız. `ek` geriye dönük uyum için duruyor.
  for (const ad of [...authEnvNames(descriptors), ...YARDIMCI_DEGISKENLER, ...ek]) {
    const v = oku(ad)
    if (v !== undefined && v !== '') sonuc[ad] = v
  }
  return sonuc
}
