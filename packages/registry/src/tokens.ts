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

/** `a.b.c` → `--a-b-c`. Tek yerde: iki farklı dönüşüm iki farklı değişken adı demektir. */
const cssAdi = (yol: string): string => `--${yol.replace(/\./g, '-')}`

/**
 * Takma ad token'ı CSS'te DÜZ DEĞERE DEĞİL, `var()`a derlenir.
 *
 * İlk sürüm `resolved`ı basıyordu: `--comp-status-bar-bg: oklch(0.21 …)`. O hâlde
 * `[data-surface="studio"]` içinde `--role-surface`ı yeniden tanımlamak HİÇBİR ŞEY
 * yapmazdı — bileşen token'ı çoktan pişmişti. Yani iki yüzey bağlamı (§12.4) yapısal
 * olarak imkânsızdı ve bunu ancak yüzeyi yazmaya kalkınca fark ettik.
 * `var()` zinciri, üç kademenin CSS'teki karşılığıdır: kaskad kademeyi taşır.
 */
const cssDeger = (t: FlatToken): string => {
  const m = REF_RE.exec(t.raw)
  return m === null ? t.resolved : `var(${cssAdi(m[1] ?? '')})`
}

/**
 * Bir yüzey bağlamının rol bloğu (§12.4).
 *
 * **Yalnız `role.*` yayılır.** Bir yüzeyin ham rampayı ya da bileşen token'ını yeniden
 * tanımlaması, iki yüzeyin farklı bileşenlere sahip olması demektir — o an iki tasarım
 * sistemi vardır ve biri bakımsız kalır. Yüzey RENGİ değiştirir, YAPIYI değil.
 */
export const toSurfaceCss = (surface: string, tokens: readonly FlatToken[]): string => {
  const satirlar = tokens
    .filter((t) => t.tier === 'role')
    .map((t) => `  ${cssAdi(t.path)}: ${cssDeger(t)};`)
  return `[data-surface='${surface}'] {\n${satirlar.join('\n')}\n}\n`
}

/** CSS özel değişkenleri. Kademe adı değişken adında KALIR: `--role-bg` neye ait belli. */
export const toCss = (tokens: readonly FlatToken[]): string => {
  const satirlar = tokens.map((t) => `  ${cssAdi(t.path)}: ${cssDeger(t)};`)
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

/**
 * Token kalıtımı — alt marka ana markadan devralır, gerektiği kadar ezer (§4.2).
 *
 * **Neden derin birleştirme:** alt marka genelde bir-iki rolü ezer (vurgu rengi,
 * belki bir bileşen) ve gerisini aynı bırakır. Sığ birleştirme `role` nesnesinin
 * tamamını değiştirirdi ve alt marka, ana markanın rol setini yeniden yazmak
 * zorunda kalırdı — ilk gün kolay, altıncı ayda iki ayrı gerçek.
 *
 * Ezilen her yol `overridden` listesinde GÖRÜNÜR. Görünmeseydi "bu renk neden farklı"
 * sorusu iki dosyayı yan yana koymadan cevaplanamazdı.
 */
export const inheritTokens = (
  parent: Record<string, unknown>,
  child: Record<string, unknown>
): { readonly merged: Record<string, unknown>; readonly overridden: readonly string[] } => {
  const overridden: string[] = []

  const birlestir = (
    a: Record<string, unknown>,
    b: Record<string, unknown>,
    yol: string
  ): Record<string, unknown> => {
    const out: Record<string, unknown> = { ...a }
    for (const [k, v] of Object.entries(b)) {
      const altYol = yol === '' ? k : `${yol}.${k}`
      const mevcut = out[k]
      const ikisiDeNesne =
        mevcut !== null &&
        typeof mevcut === 'object' &&
        v !== null &&
        typeof v === 'object' &&
        // `$value` taşıyan düğüm YAPRAKTIR: içine inmek, `$type`ı ana markadan
        // devralıp `$value`yu alt markadan almak gibi tuhaf melezler üretirdi.
        typeof (v as TokenNode)['$value'] !== 'string'
      if (ikisiDeNesne) {
        out[k] = birlestir(mevcut as Record<string, unknown>, v as Record<string, unknown>, altYol)
      } else {
        if (k in a && !k.startsWith('$')) overridden.push(altYol)
        out[k] = v
      }
    }
    return out
  }

  return { merged: birlestir(parent, child, ''), overridden }
}

// ── chroma alana göre sınırlı (§12.1 · ISA-101 · D-133) ──────────────────────
//
// **Renk ANORMALLİK demektir.** Her yerde renk varsa hiçbir yerde uyarı yoktur — bu,
// yüksek performanslı HMI tasarımının (ISA-101) merkezî bulgusu ve komuta merkezinin
// "izleme kabini" tezinin (§4b) sayısal karşılığı.
//
// Sınır alana göre: ekranın %25'inden büyük dolgu C ≤ 0.02 · kenarlık ≤ 0.04 ·
// metin ≤ 0.06 · yalnız %4'ten küçük sinyal alanları ≤ 0.16.
//
// **Alan sınıfı token ADINDAN türer, tahminden değil.** `role.bg` bir dolgudur,
// `role.line-hair` bir kenarlıktır, `role.text` metindir, `ramp.signal.*` sinyaldir.
// Tahmin etseydik sınıflandırma sessizce kayar ve sınır yanlış token'a uygulanırdı.

export type AreaClass = 'fill' | 'line' | 'text' | 'signal'

/** §12.1'in dört sınırı. Sayılar ANAYASA'dan; burada tekrar edilmiyor, ORADAN geliyor. */
export const CHROMA_LIMITS: Readonly<Record<AreaClass, number>> = {
  fill: 0.02,
  line: 0.04,
  text: 0.06,
  signal: 0.16,
}

/**
 * Token adından alan sınıfı. Tanınmayan ad `null` → denetlenmez.
 *
 * `null` dönmek bir kaçış değil: tanınmayan bir ada sınır uydurmak, yanlış sınırı
 * zorlamaktan daha kötü olurdu. Yeni bir ad ailesi geldiğinde buraya eklenir ve o an
 * bir KARAR verildiği görünür.
 */
export const areaClassOf = (path: string): AreaClass | null => {
  const son = path.split('.').slice(1).join('-')
  if (/signal/.test(path)) return 'signal'
  if (/^(bg|surface|track)|-(bg|surface|track)$/.test(son)) return 'fill'
  if (/^(line|border|edge|hair)|-(line|border|edge|hair)$/.test(son)) return 'line'
  if (/^(text|label|icon)|-(text|label|icon)$/.test(son)) return 'text'
  // `state-*` ve `tolerance-*` sinyaldir: küçük alanlarda anormallik gösterirler.
  if (/^(state|tolerance)-/.test(son)) return 'signal'
  return null
}

/** `oklch(L C H)` içinden C. Ayrıştırılamazsa `null` — sıfır DEĞİL. */
export const chromaOf = (deger: string): number | null => {
  const m = /oklch\(\s*[\d.]+%?\s+([\d.]+)\s+/i.exec(deger)
  if (m === null) return null
  const c = Number(m[1])
  return Number.isFinite(c) ? c : null
}

export interface ChromaViolation {
  readonly path: string
  readonly area: AreaClass
  readonly chroma: number
  readonly limit: number
}

/**
 * Chroma sınırlarını denetler. **Yalnız `resolved` değere bakar**: bir rol token'ı bir
 * rampaya referans verse bile ekranda görünen şey çözülmüş renktir.
 *
 * 1. kademe (`ramp`) HARİÇ: rampalar bir palettir, ekranda doğrudan görünmezler ve
 * sinyal rampasının yüksek chroma'ya sahip olması TASARIMDIR. Sınır, o rampayı KULLANAN
 * role/comp token'ına uygulanır — kullanım yeri, tanım yeri değil.
 */
export const checkChroma = (tokens: readonly FlatToken[]): readonly ChromaViolation[] => {
  const ihlaller: ChromaViolation[] = []
  for (const t of tokens) {
    if (t.tier === 'ramp') continue
    const alan = areaClassOf(t.path)
    if (alan === null) continue
    const c = chromaOf(t.resolved)
    if (c === null) continue
    const limit = CHROMA_LIMITS[alan]
    if (c > limit) ihlaller.push({ path: t.path, area: alan, chroma: c, limit })
  }
  return ihlaller
}

export const formatChroma = (v: readonly ChromaViolation[]): string =>
  v
    .map(
      (x) =>
        `    chroma_over_limit  ${x.path} → C=${x.chroma} (${x.area} sınırı ${x.limit})\n` +
        `      renk ANORMALLİK demektir; her yerde renk varsa hiçbir yerde uyarı yoktur (§12.1)`
    )
    .join('\n')
