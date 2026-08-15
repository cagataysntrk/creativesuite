// `throw` eden TEK dosya (§8.6 · chokepoints.json → `hata-taksonomisi`).
//
// Bu sistemde hata bir DEĞERDİR (`Result`), bir kontrol akışı sıçraması değil. Bir
// istisna çağıranın tip imzasında GÖRÜNMEZ; gözetimsiz bir 03:00 çalıştırmasında
// yakalanmamış istisna, maliyeti defterine yazılmamış yarım bir çalıştırma bırakır.
//
// Yine de tek bir meşru fırlatma durumu var: **değişmez bir varsayımın çiğnendiği an.**
// Bunlar kullanıcı hatası değil, programlama hatasıdır — `Result` döndürmek çağıranı
// asla gerçekleşmeyecek bir dalı ele almaya zorlar ve o dal ölü kod olarak çürür.
//
// Ölçüt nettir: `panic` yalnız "buraya asla gelinemez" dediğimiz yerde çağrılır.
// Ağ, dosya, sağlayıcı, kullanıcı girdisi — hiçbiri panic sebebi DEĞİLDİR.

export class InvariantViolation extends Error {
  override readonly name = 'InvariantViolation'
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options)
  }
}

/** Değişmez çiğnendi. Dönüş tipi `never`: çağıran tarafta akış burada biter. */
export const panic = (message: string, cause?: unknown): never => {
  throw new InvariantViolation(message, cause === undefined ? undefined : { cause })
}
