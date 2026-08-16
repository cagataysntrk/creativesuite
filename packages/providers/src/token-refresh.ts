// Token yenileme — İLK GÜN kurulur (§9.2 · §16 · R-51, R-70 · FAZ-7.6).
//
// **Meta uzun ömürlü token 60 günde ölür ve SESSİZCE ölür.** Sonraya bırakılan yenileme,
// ilk iki ay çalışan sonra sebepsiz duran bir sistem demektir — ve 12. yasa (bir ay
// ihmal edilse de çalışır) tam burada sınanır.
//
// **Son kullanma tarihi bir SIR DEĞİLDİR.** Token `sops` altında; ama "ne zaman ölüyor"
// bilgisi düz metin durabilir ve **durmalıdır**: `just doctor` bir ay sonra açıldığında
// secret'ları çözmeden "token 4 gün sonra ölüyor" diyebilmeli. Sırrı okumak zorunda olan
// bir sağlık raporu, gözetimsiz bir kurulumda hiç koşmaz.
//
// **Kayıt yoksa "sonsuz ömür" değil, BİLİNMEYEN.** Ve bilinmeyen ömür, uzun ömür
// değildir: kayıtsız bir token yayını bloklar. Aksi hâlde dosyayı silmek, kontrolü
// kapatmanın en kolay yolu olurdu.

export type TokenDurumu =
  /** Ömrü uzun, yapılacak bir şey yok. */
  | { readonly kind: 'ok'; readonly kalanGun: number }
  /** Pay içinde — yenileme ZAMANI, ama yayın hâlâ mümkün. */
  | { readonly kind: 'yenile'; readonly kalanGun: number }
  /** Ölmüş. Yayın BLOKLANIR. */
  | { readonly kind: 'olmus'; readonly gecenGun: number }
  /** Kayıt yok ya da okunamıyor. Yayın BLOKLANIR — bilinmeyen ömür uzun ömür değildir. */
  | { readonly kind: 'bilinmiyor'; readonly neden: string }

export interface TokenKaydi {
  readonly provider: string
  /** ISO 8601. **Sır DEĞİL** — bu yüzden düz metin dosyada durabiliyor. */
  readonly expiresAt: string
  /** Token'ın alındığı an; "ne kadar yaşadı" sorusunun cevabı. */
  readonly obtainedAt: string
  readonly scopes: readonly string[]
}

/** Yenileme payı — son güne bırakılmaz (§16: bir haftalık ihmal tolere edilmeli). */
export const YENILEME_PAYI_GUN = 7

/** Meta uzun ömürlü token ömrü. Kaynak: uzun ömürlü token değişim akışı. */
export const META_TOKEN_OMRU_GUN = 60

const gunFarki = (a: string, b: string): number | null => {
  const t1 = Date.parse(a)
  const t2 = Date.parse(b)
  if (!Number.isFinite(t1) || !Number.isFinite(t2)) return null
  return Math.floor((t1 - t2) / 86_400_000)
}

/**
 * Bir kaydın durumunu ölçer. **Saat okumaz** (R-06): `now` çağırandan gelir.
 *
 * `kayit === null` → `bilinmiyor`. Bu bir kolaylık değil bir karar: kaydı silmek,
 * kontrolü kapatmanın en kolay yolu olmamalı.
 */
export const tokenDurumu = (
  kayit: TokenKaydi | null,
  now: string,
  payGun = YENILEME_PAYI_GUN
): TokenDurumu => {
  if (kayit === null) return { kind: 'bilinmiyor', neden: 'kayıt yok' }
  const kalan = gunFarki(kayit.expiresAt, now)
  if (kalan === null) {
    return { kind: 'bilinmiyor', neden: `tarih okunamadı: ${kayit.expiresAt}` }
  }
  if (kalan < 0) return { kind: 'olmus', gecenGun: -kalan }
  if (kalan <= payGun) return { kind: 'yenile', kalanGun: kalan }
  return { kind: 'ok', kalanGun: kalan }
}

/** Yayın bu durumda mümkün mü. `yenile` **bloklamaz** — uyarır. */
export const yayinaUygun = (d: TokenDurumu): boolean => d.kind === 'ok' || d.kind === 'yenile'

/**
 * Yenileme işi ŞİMDİ koşmalı mı.
 *
 * `olmus` da `true` döndürüyor: ölmüş bir token'ı yenilemeye çalışmak çoğu zaman
 * başarısız olur, ama denemeden "yapılacak bir şey yok" demek yanlış olurdu — operatör
 * hatayı GÖRMELİ.
 */
export const yenilemeGerekli = (d: TokenDurumu): boolean => d.kind !== 'ok'

export interface YenilemeRaporu {
  readonly provider: string
  readonly durum: TokenDurumu
  /** İnsan okunur, tek satır. `doctor` ve CLI bunu doğrudan basıyor. */
  readonly mesaj: string
  /** Yayın bloklanıyor mu — `doctor`ın `kritik` sayacına giren şey. */
  readonly bloklu: boolean
}

export const yenilemeRaporu = (
  kayitlar: readonly TokenKaydi[],
  saglayicilar: readonly string[],
  now: string
): readonly YenilemeRaporu[] =>
  saglayicilar.map((p) => {
    const kayit = kayitlar.find((k) => k.provider === p) ?? null
    const durum = tokenDurumu(kayit, now)
    return {
      provider: p,
      durum,
      mesaj: durumMesaji(p, durum),
      bloklu: !yayinaUygun(durum),
    }
  })

export const durumMesaji = (provider: string, d: TokenDurumu): string => {
  switch (d.kind) {
    case 'ok':
      return `${provider}: token ${d.kalanGun} gün geçerli`
    case 'yenile':
      return `${provider}: token ${d.kalanGun} gün sonra ölüyor — YENİLEME ZAMANI (pay ${YENILEME_PAYI_GUN} gün)`
    case 'olmus':
      return `${provider}: token ${d.gecenGun} gün önce ÖLDÜ — yayın BLOKLU; yenileme işi çalışmamış (§9.2)`
    case 'bilinmiyor':
      return `${provider}: token durumu BİLİNMİYOR (${d.neden}) — yayın BLOKLU; bilinmeyen ömür uzun ömür değildir`
  }
}

/**
 * Yenileme sonrası yazılacak kayıt.
 *
 * `expiresAt` sağlayıcının söylediği süreden hesaplanıyor, sabitten DEĞİL: Meta 60 gün
 * diyor ama bir gün 45 derse ve biz 60 yazarsak, token ölmüşken "15 gün var" deriz.
 * Sabit yalnız **beklenen** ömür ve sapması bir bulgudur.
 */
export const yeniKayit = (
  provider: string,
  scopes: readonly string[],
  expiresInSeconds: number,
  now: string
): TokenKaydi & { readonly beklenendenKisa: boolean } => {
  const ms = Date.parse(now)
  const expiresAt = new Date(ms + expiresInSeconds * 1000).toISOString()
  const gun = Math.floor(expiresInSeconds / 86_400)
  return {
    provider,
    expiresAt,
    obtainedAt: now,
    scopes,
    beklenendenKisa: gun < META_TOKEN_OMRU_GUN - 5,
  }
}
