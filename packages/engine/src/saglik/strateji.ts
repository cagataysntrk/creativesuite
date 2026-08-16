// Strategy Health — aktif dönemin lint panosu (§11, §12.9 · R-32 · FAZ-4.16).
//
// **Bu modül var olmasaydı kurallar İKİ KEZ yazılırdı.** Denetimler bugüne kadar yalnız
// `scripts/lexicon.mjs` içinde, kapı betiğinin gövdesinde yaşıyordu: yasak terim listesi,
// sayısal iddia tespiti, gövdeden alan çıkarma. Panoyu yazarken aynı mantığı `apps/server`
// içinde tekrar etmek, D-160'ın birebir tekrarı olurdu — iki gerçek, ikisi de "doğru",
// ve bir gün sessizce ayrışırlar. Kapı ile pano ARTIK AYNI fonksiyonu çağırıyor.
//
// Halka gerekçesi: corpus okumak `@suite/corpus`, lexicon `@suite/render` — ikisi kardeş
// ve birbirini import edemez. İkisini birleştiren en alçak halka `engine`.
//
// **Pano rapor yazar, hiçbir şeyi değiştirmez.** Bir kaydı düzeltmek insanın işi (R-14);
// panonun işi hangi kaydın nerede kırıldığını TIKLANABİLİR biçimde söylemek.

import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { parseFrontmatter } from '@suite/corpus'
import {
  checkTransfer,
  lintDocument,
  formatLexicon,
  formatViolations,
  type ProofReference,
} from '@suite/render'

/**
 * Yasak terimler (§11.2). **Tek liste, tek yer.** Kapı betiğinde ayrı bir kopya
 * tutulsaydı, biri güncellenip diğeri unutulduğunda pano "temiz" derken kapı kırmızı
 * olurdu — ve hangisinin haklı olduğu belirsiz kalırdı.
 */
export const YASAK_TERIMLER: readonly string[] = [
  'devrim niteliğinde',
  'çığır açan',
  'dünyanın en iyisi',
  'sektör lideri',
  'benzersiz',
  'kusursuz',
]

export type BulguTuru =
  /** Lexicon linter'ının bulduğu her şey (yasak terim, kaynaksız iddia, hex, casing). */
  | 'lexicon'
  /** Dönem-aşırı kanıt aktarım argümanı eksik ya da geçersiz (§4.6). */
  | 'aktarim'
  /** `expired_at` geçmiş — kayıt emekli, retrieval görmüyor ama dosya duruyor (R-12). */
  | 'suresi_gecmis'
  /** `invalid_at` geçmiş — bilgi artık geçerli değil. */
  | 'gecerliligi_bitmis'
  /** `re_verify_by` geçmiş — çürüme tarihi doldu, yeniden doğrulanmalı. */
  | 'yeniden_dogrula'
  /**
   * Aktarım alanları yalnız NESİRDE. Ayrı bir tür çünkü ayrı bir gerçek: alan EKSİK
   * değil, makine tarafından OKUNAMAZ. İkisini tek etikete sıkıştırmak (D-177) kaydı
   * haksız yere "kuralı çiğniyor" diye işaretlerdi — oysa argüman orada, yazıyor.
   */
  | 'alanlar_nesirde'

export interface Bulgu {
  readonly tur: BulguTuru
  /** `blocking` yayını durdurur; `uyari` bir iş listesi maddesidir. */
  readonly siddet: 'blocking' | 'uyari'
  readonly kayitId: string
  /** Repo köküne göreli yol — **tıklanabilir bağlantının hedefi** (adım ✅ kriteri). */
  readonly yol: string
  readonly mesaj: string
}

export interface StratejiSagligi {
  readonly aktifEra: string
  readonly taranan: number
  readonly bulgular: readonly Bulgu[]
  /** Okunamayan kayıt SESSİZCE atlanmaz: taranmayan kayıt, temiz kayıt değildir. */
  readonly okunamayan: readonly { readonly yol: string; readonly neden: string }[]
  readonly blocking: number
  readonly uyari: number
}

export interface SaglikGirdisi {
  readonly repoRoot: string
  readonly aktifEra: string
  /** ISO 8601 — saat DIŞARIDAN gelir (R-06). */
  readonly simdi: string
  /**
   * Marka paletinden gelen izinli hex. Üç durum, üçü de farklı (D-113):
   * `null` palet tanımsız → denetim atlanır · `[]` palette hiç hex yok → her hex dışıdır.
   */
  readonly izinliHex: readonly string[] | null
}

/**
 * Gövdedeki `**Etiket:** değer` satırı — YALNIZ ilk satır.
 *
 * Çok satır yutan bir sürüm `analogous` yerine `analogous.\n\n⚠ Sayısal iddia YOK…`
 * çıkarıyordu; o değer ne `null` ne geçerli enum olduğu için HER kontrolden geçiyordu
 * ve kapı yeşil kalıyordu (2026-08-15).
 */
export const govdedenAlan = (govde: string, etiket: string): string | null => {
  const m = new RegExp(`\\*\\*${etiket}:?\\*\\*[ \\t]*([^\\n]*)`).exec(govde)
  if (m === null) return null
  const v = (m[1] ?? '').trim().replace(/\.$/, '')
  return v === '' ? null : v
}

/**
 * Metinde sayısal iddia var mı — **rakamla YA DA kelimeyle**.
 *
 * İkinci grup kritik: Türkçe'de nicelik çoğu zaman rakamsız yazılır ("yüzde kırk",
 * "üç kat", "yarım milyon") ve yalnız rakam arayan bir desen dilin yarısını görmez.
 * Yıl (1900–2100 arası çıplak dört hane) iddia DEĞİLDİR: "2024'te kurulduk" bir tarih.
 */
export const sayisalIddiaVar = (govde: string): boolean => {
  const KELIME = /\b(yüzde|kat\b|misli|oran(ında|ı)?|çeyrek|yarım|milyon|milyar|bin\b)/i
  if (KELIME.test(govde)) return true
  if (/\b\d+\s*\/\s*\d+\b/.test(govde)) return true
  const adaylar = govde.match(/%\s?\d[\d.,]*|\b\d[\d.,]*\b/g) ?? []
  return adaylar.some((a) => {
    if (a.startsWith('%')) return true
    const sade = a.replace(/[.,]/g, '')
    const n = Number(sade)
    if (/^\d{4}$/.test(a) && n >= 1900 && n <= 2100) return false
    return sade.length >= 3 || a.includes('.') || a.includes(',')
  })
}

/** Bir `proof_asset` kaydını aktarım denetiminin beklediği şekle çevirir. */
export const kanitReferansi = (
  id: string,
  fm: Readonly<Record<string, unknown>>,
  govde: string
): ProofReference => ({
  id,
  eraOfOrigin:
    typeof fm['era_of_origin'] === 'string'
      ? fm['era_of_origin']
      : ((govdedenAlan(govde, 'Kaynak dönem') ?? '').split(' ')[0] ?? ''),
  generalisationNote:
    typeof fm['generalisation_note'] === 'string'
      ? fm['generalisation_note']
      : govdedenAlan(govde, 'Genelleme notu'),
  transferConfidence: (typeof fm['transfer_confidence'] === 'string'
    ? fm['transfer_confidence']
    : govdedenAlan(govde, 'Aktarım güveni')) as ProofReference['transferConfidence'],
  claimSource:
    typeof fm['claim_source'] === 'string' ? fm['claim_source'] : govdedenAlan(govde, 'Kaynak'),
  hasNumericClaim: sayisalIddiaVar(govde),
})

/** `a <= b` ISO karşılaştırması. Geçersiz tarih **geçmiş sayılmaz** — yanlış pozitif de hatadır. */
const gecmisMi = (tarih: unknown, simdi: string): boolean => {
  if (typeof tarih !== 'string' || tarih === '') return false
  const t = Date.parse(tarih)
  return !Number.isNaN(t) && t <= Date.parse(simdi)
}

const dosyalar = (kok: string): readonly { tip: string; yol: string }[] => {
  const corpus = join(kok, 'corpus')
  if (!existsSync(corpus)) return []
  const out: { tip: string; yol: string }[] = []
  for (const tip of readdirSync(corpus, { withFileTypes: true })) {
    if (!tip.isDirectory()) continue
    for (const f of readdirSync(join(corpus, tip.name))) {
      if (f.endsWith('.md')) out.push({ tip: tip.name, yol: `corpus/${tip.name}/${f}` })
    }
  }
  return out.sort((a, b) => a.yol.localeCompare(b.yol))
}

export const stratejiSagligi = (g: SaglikGirdisi): StratejiSagligi => {
  const bulgular: Bulgu[] = []
  const okunamayan: { yol: string; neden: string }[] = []
  let taranan = 0

  for (const { tip, yol } of dosyalar(g.repoRoot)) {
    let ham: string
    try {
      ham = readFileSync(join(g.repoRoot, yol), 'utf8')
    } catch {
      okunamayan.push({ yol, neden: 'dosya okunamadı' })
      continue
    }
    const p = parseFrontmatter(ham)
    if (!p.ok || p.value.frontmatter === null) {
      okunamayan.push({ yol, neden: 'frontmatter okunamadı' })
      continue
    }
    taranan++
    const fm = p.value.frontmatter
    const govde = p.value.body
    const id = typeof fm['id'] === 'string' ? fm['id'] : yol

    // ── metnin kendisi: yasak terim, kaynaksız iddia, token dışı hex, naif casing ──
    const sahteBelge = {
      kind: 'post' as const,
      width: 1080,
      height: 1350,
      tokenCss: '',
      stamp: {},
      blocks: [{ type: 'body' as const, text: govde }],
    }
    for (const v of lintDocument(sahteBelge as never, {
      forbidden: YASAK_TERIMLER,
      allowedHex: g.izinliHex,
      claimSource: typeof fm['claim_source'] === 'string' ? fm['claim_source'] : null,
    })) {
      bulgular.push({
        tur: 'lexicon',
        siddet: 'blocking',
        kayitId: id,
        yol,
        mesaj: formatLexicon([v]).trim(),
      })
    }

    // ── çürüme: emeklilik SİLME DEĞİLDİR, ama panoda GÖRÜNÜR (R-12) ──────────
    if (gecmisMi(fm['expired_at'], g.simdi)) {
      bulgular.push({
        tur: 'suresi_gecmis',
        siddet: 'uyari',
        kayitId: id,
        yol,
        mesaj: `emekli (${String(fm['expired_at'])}) — dosya duruyor, retrieval görmüyor`,
      })
    }
    if (gecmisMi(fm['invalid_at'], g.simdi)) {
      bulgular.push({
        tur: 'gecerliligi_bitmis',
        siddet: 'uyari',
        kayitId: id,
        yol,
        mesaj: `geçerlilik bitti (${String(fm['invalid_at'])}) — bilgi artık doğru sayılmıyor`,
      })
    }
    if (gecmisMi(fm['re_verify_by'], g.simdi)) {
      bulgular.push({
        tur: 'yeniden_dogrula',
        siddet: 'blocking',
        kayitId: id,
        yol,
        // Mevzuat kaydı için bu bir uyarı değil: süresi geçmiş bir mevzuat iddiası
        // yayınlanırsa yanlış hukuki bilgi verilmiş olur.
        mesaj: `çürüme tarihi geçti (${String(fm['re_verify_by'])}) — yeniden doğrulanmadan kullanılamaz`,
      })
    }

    // ── dönem-aşırı kanıt aktarımı (§4.6) ────────────────────────────────────
    if (tip === 'proof_asset') {
      const ref = kanitReferansi(id, fm, govde)
      const nesirde =
        typeof fm['generalisation_note'] !== 'string' && typeof fm['era_of_origin'] !== 'string'
      if (nesirde && ref.eraOfOrigin !== '' && ref.eraOfOrigin !== g.aktifEra) {
        bulgular.push({
          tur: 'alanlar_nesirde',
          siddet: 'uyari',
          kayitId: id,
          yol,
          mesaj:
            'aktarım alanları yalnız gövde nesrinde — argüman VAR ama veri değil; ' +
            'başlıklar değişirse denetim sessizce kör kalır',
        })
      }
      for (const v of checkTransfer([ref], {
        currentEra: g.aktifEra,
        outboundToProspect: true,
      })) {
        bulgular.push({
          tur: 'aktarim',
          siddet: 'blocking',
          kayitId: id,
          yol,
          mesaj: formatViolations([v]).trim(),
        })
      }
    }
  }

  return {
    aktifEra: g.aktifEra,
    taranan,
    bulgular,
    okunamayan,
    blocking: bulgular.filter((b) => b.siddet === 'blocking').length,
    uyari: bulgular.filter((b) => b.siddet === 'uyari').length,
  }
}
