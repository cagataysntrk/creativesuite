// Token derleyicisi — üç kademe, tek kaynak (§4.1 · §12.1).
//
// Girdi: `brand/<brand_id>/tokens/*.tokens.json` (DTCG şekilli). Çıktı: CSS değişkenleri,
// Tailwind teması, `motion/frame.md` ve `brand-facts.json`. **Dört çıktı, tek kaynak** —
// biri elle düzenlenirse üreteç onu ezer (R-65) ve kapı bunu yakalar.
//
// **Style Dictionary KULLANILMIYOR** (R-75): yaptığımız iş takma ad çözme ve dize
// birleştirme; 120 satır kod, bir bağımlılığın lisans, sürüm ve API kırılma yükünden
// hafiftir. Style Dictionary'nin asıl değeri onlarca platform çıktısı — bizim tek
// platformumuz var (Chromium).
//
// **Üç kademe MEKANİK olarak zorlanıyor:**
//   1. `ramp.*`   ham OKLCH rampalar — bileşen ASLA dokunmaz
//   2. `role.*`   anlamsal roller — yalnız `ramp.*`a referans verir
//   3. `comp.*`   bileşen token'ları — yalnız `role.*`a referans verir
// Bileşenin ham rampaya bağlanması, markayı değiştirdiğinde o bileşenin eski renkte
// kalması demektir; ve bu hata çalışma zamanında değil GÖZLE fark edilir — yani
// fark edilmez.

export interface TokenNode {
  readonly $value?: string
  readonly $type?: string
  readonly $description?: string
  readonly [key: string]: unknown
}

export type TokenTier = 'ramp' | 'role' | 'comp'

export type TokenError =
  | { readonly kind: 'unknown_tier'; readonly path: string }
  | {
      readonly kind: 'tier_violation'
      readonly path: string
      readonly ref: string
      readonly why: string
    }
  | { readonly kind: 'unresolved_ref'; readonly path: string; readonly ref: string }
  | { readonly kind: 'circular_ref'; readonly path: string }
  | { readonly kind: 'missing_value'; readonly path: string }

export interface FlatToken {
  readonly path: string
  readonly tier: TokenTier
  readonly raw: string
  readonly resolved: string
  readonly type: string
}

export type TokenResult<T> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly errors: readonly TokenError[] }

const TIER_OF: Record<string, TokenTier> = { ramp: 'ramp', role: 'role', comp: 'comp' }

/** Hangi kademe hangisine referans verebilir. Liste TAM'dır: eksik olan yasaktır. */
const IZINLI_REF: Record<TokenTier, readonly TokenTier[]> = {
  ramp: [],
  role: ['ramp'],
  comp: ['role'],
}

const REF_RE = /^\{([a-zA-Z0-9._-]+)\}$/

/** İç içe DTCG ağacını düz `a.b.c` yollarına çevirir. */
const flatten = (
  node: Record<string, unknown>,
  prefix: string,
  out: Map<string, TokenNode>
): void => {
  for (const [k, v] of Object.entries(node)) {
    if (k.startsWith('$')) continue
    if (v === null || typeof v !== 'object') continue
    const yol = prefix === '' ? k : `${prefix}.${k}`
    const t = v as TokenNode
    if (typeof t['$value'] === 'string') out.set(yol, t)
    else flatten(v as Record<string, unknown>, yol, out)
  }
}

/**
 * Token ağacını derler: kademeleri doğrular, takma adları çözer.
 *
 * Çözme SIRALI değil ÖZYİNELİ: `role.bg` → `ramp.gray.900` zinciri bir dosyada
 * yukarıdan aşağı olmak zorunda değil. Döngü tespiti var — `a → b → a` bir yapılandırma
 * hatasıdır ve sonsuz döngü yerine HATA olarak dönmelidir.
 */
export const compileTokens = (tree: Record<string, unknown>): TokenResult<readonly FlatToken[]> => {
  const duz = new Map<string, TokenNode>()
  flatten(tree, '', duz)

  const errors: TokenError[] = []
  const tierOf = (yol: string): TokenTier | null => TIER_OF[yol.split('.')[0] ?? ''] ?? null

  for (const yol of duz.keys()) {
    if (tierOf(yol) === null) errors.push({ kind: 'unknown_tier', path: yol })
  }
  if (errors.length > 0) return { ok: false, errors }

  const coz = (yol: string, zincir: readonly string[]): string | null => {
    if (zincir.includes(yol)) {
      errors.push({ kind: 'circular_ref', path: yol })
      return null
    }
    const node = duz.get(yol)
    const ham = node?.['$value']
    if (typeof ham !== 'string') {
      errors.push({ kind: 'missing_value', path: yol })
      return null
    }
    const m = REF_RE.exec(ham)
    if (m === null) return ham

    const hedef = m[1] ?? ''
    const benim = tierOf(yol)
    const onun = tierOf(hedef)
    if (benim === null || onun === null || !duz.has(hedef)) {
      errors.push({ kind: 'unresolved_ref', path: yol, ref: hedef })
      return null
    }
    if (!IZINLI_REF[benim].includes(onun)) {
      errors.push({
        kind: 'tier_violation',
        path: yol,
        ref: hedef,
        why: `${benim} kademesi ${onun} kademesine referans veremez — izinli: ${IZINLI_REF[benim].join(', ') || '(hiçbiri)'}`,
      })
      return null
    }
    return coz(hedef, [...zincir, yol])
  }

  const cikti: FlatToken[] = []
  for (const [yol, node] of [...duz.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    const cozulmus = coz(yol, [])
    if (cozulmus === null) continue
    cikti.push({
      path: yol,
      tier: tierOf(yol) ?? 'ramp',
      raw: String(node['$value']),
      resolved: cozulmus,
      type: typeof node['$type'] === 'string' ? node['$type'] : 'unknown',
    })
  }

  return errors.length > 0 ? { ok: false, errors } : { ok: true, value: cikti }
}

/** CSS özel değişkenleri. Kademe adı değişken adında KALIR: `--role-bg` neye ait belli. */
export const toCss = (tokens: readonly FlatToken[]): string => {
  const satirlar = tokens.map((t) => `  --${t.path.replace(/\./g, '-')}: ${t.resolved};`)
  return `/* ÜRETİLMİŞ — elle düzenleme (R-65). Kaynak: brand/<id>/tokens/ */\n:root {\n${satirlar.join('\n')}\n}\n`
}

/** Tailwind teması. Yalnız 2. ve 3. kademe: bileşen ham rampaya erişemesin diye. */
export const toTailwind = (tokens: readonly FlatToken[]): string => {
  const gorunur = tokens.filter((t) => t.tier !== 'ramp')
  const govde = gorunur
    .map((t) => `    '${t.path.replace(/\./g, '-')}': 'var(--${t.path.replace(/\./g, '-')})',`)
    .join('\n')
  return `// ÜRETİLMİŞ — elle düzenleme (R-65). Ham rampalar KASTEN yok (§12.1).\nexport const brandTheme = {\n  colors: {\n${govde}\n  },\n}\n`
}

/**
 * `brand-facts.json` — prompt'a enjekte edilen marka olguları.
 *
 * **Renk DEĞERLERİ değil, renk ADLARI gider.** Modele `#0091FF` vermek onu görselde
 * kullanmaya davet eder; oysa renk kompozit aşamasında gerçek token'dan gelir (R-20'nin
 * renk kardeşi). Modele giden şey "birincil vurgu rengi var" bilgisidir, kodu değil.
 */
export const toBrandFacts = (
  tokens: readonly FlatToken[],
  meta: { readonly brandId: string; readonly eraSlug: string }
): string =>
  `${JSON.stringify(
    {
      brand_id: meta.brandId,
      era: meta.eraSlug,
      role_tokens: tokens.filter((t) => t.tier === 'role').map((t) => t.path),
      note: "Renk DEĞERLERİ kasten yok: model renk seçmez, kompozit aşaması token'dan alır.",
    },
    null,
    2
  )}\n`
