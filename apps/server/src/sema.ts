// Schema Editor verisi — kaydetmeden önce KURU ÇALIŞTIRMA (§3.3, §12.9 · FAZ-4.11).
//
// **"Şema veri, kod değil" (D-11) bir özgürlük değil, bir sorumluluktur.** Kullanıcı bir
// alanı çalışma anında zorunlu yapabiliyorsa, o alanı taşımayan her kaydı geçersiz
// kılabiliyor demektir — ve bunu SAYIYLA öğrenmeden yapmamalı.
//
// Analiz GERÇEK corpus'a karşı koşar: örnek üzerinden tahmin, tam da yanlış çıkacağı
// yerde (kenar kayıtlarda) yanlış çıkar.

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { basename, join } from 'node:path'
import { parseFrontmatter } from '@suite/corpus'
import {
  diffSchemas,
  impactMessage,
  migrationImpact,
  type MigrationImpact,
  type MigrationRecord,
} from '@suite/registry'
import { parseYaml, validateSchema, type EntityTypeSchema } from '@suite/kernel'

export interface SemaOzeti {
  readonly id: string
  readonly title: string
  readonly alanSayisi: number
  readonly zorunlu: readonly string[]
  /** Bu tipte kaç kayıt var — değişikliğin kapsamı. */
  readonly kayitSayisi: number
  /**
   * Kaç kayıt YAPILANDIRILMIŞ öznitelik taşıyor (D-41: `attributes` bloğu).
   *
   * `0` ise şema hiçbir kayda bağlı değil: form, katı LLM şeması ve DDL projeksiyonları
   * (§3.4) bağlanacak bir şey bulamaz. Bunu göstermemek, kuru çalıştırmanın "her kayıt
   * kırılacak" demesini açıklanamaz bir alarma çevirirdi.
   */
  readonly ozniteliktiKayit: number
}

const TIP_DIZINI = 'registry/entity-types'

const yamlOku = (yol: string): EntityTypeSchema | null => {
  try {
    // `parseYaml` bir `Result` döner — bozuk YAML bir istisna değil, bir VERİ durumu.
    const r = parseYaml(readFileSync(yol, 'utf8'))
    if (!r.ok) return null
    return validateSchema(r.value).length === 0 ? (r.value as EntityTypeSchema) : null
  } catch {
    return null
  }
}

/** Bir tipin corpus kayıtları — `attributes` bloğu yoksa BOŞ nesne, uydurma değil. */
export const kayitlariTopla = (repoRoot: string, tip: string): readonly MigrationRecord[] => {
  const dizin = join(repoRoot, 'corpus', tip)
  if (!existsSync(dizin)) return []
  const out: MigrationRecord[] = []
  for (const ad of readdirSync(dizin)) {
    const yol = join(dizin, ad)
    if (!statSync(yol).isFile() || !ad.endsWith('.md')) continue
    const p = parseFrontmatter(readFileSync(yol, 'utf8'))
    if (!p.ok || p.value.frontmatter === null) continue
    const fm = p.value.frontmatter
    // Frontmatter'daki `attributes:` bloğu düz YAML'dır — burada AÇILIYOR ve göç
    // analizine düz veri olarak veriliyor (`alanlar`), mühürlü zarf alanı olarak değil.
    const attrs = fm['attributes']
    out.push({
      id: typeof fm['id'] === 'string' ? fm['id'] : basename(ad, '.md'),
      alanlar:
        attrs !== null && typeof attrs === 'object' && !Array.isArray(attrs)
          ? (attrs as Record<string, unknown>)
          : {},
    })
  }
  return out
}

export const semaListesi = (repoRoot: string): readonly SemaOzeti[] => {
  const dizin = join(repoRoot, TIP_DIZINI)
  if (!existsSync(dizin)) return []
  const out: SemaOzeti[] = []
  for (const ad of readdirSync(dizin).sort()) {
    if (!ad.endsWith('.type.yaml')) continue
    const s = yamlOku(join(dizin, ad))
    if (s === null) continue
    const kayitlar = kayitlariTopla(repoRoot, s.$id)
    out.push({
      id: s.$id,
      title: s.title ?? s.$id,
      alanSayisi: Object.keys(s.properties ?? {}).length,
      zorunlu: s.required ?? [],
      kayitSayisi: kayitlar.length,
      ozniteliktiKayit: kayitlar.filter((k) => Object.keys(k.alanlar).length > 0).length,
    })
  }
  return out
}

export type KuruSonuc =
  | { readonly ok: true; readonly impact: MigrationImpact; readonly ozet: string }
  | { readonly ok: false; readonly hata: string }

/**
 * Önerilen şemayı GERÇEK corpus'a karşı kuru çalıştırır.
 *
 * Önerilen şema önce PROFİLE karşı doğrulanır: profil dışı bir anahtar dört
 * projeksiyondan en az birini sessizce bozar (§3.3) ve göç analizine hiç geçmemeli —
 * yoksa "kaç kayıt kırılacak" sorusunu geçersiz bir şema için cevaplamış oluruz.
 */
export const kuruCalistir = (repoRoot: string, tip: string, onerilen: unknown): KuruSonuc => {
  const mevcutYol = join(repoRoot, TIP_DIZINI, `${tip}.type.yaml`)
  if (!existsSync(mevcutYol)) return { ok: false, hata: `varlık tipi yok: ${tip}` }
  const mevcut = yamlOku(mevcutYol)
  if (mevcut === null) return { ok: false, hata: `mevcut şema profile uymuyor: ${tip}` }

  const hatalar = validateSchema(onerilen)
  if (hatalar.length > 0) {
    return {
      ok: false,
      hata: `önerilen şema profil dışı: ${hatalar.map((h) => ('keyword' in h ? `${h.kind}(${h.keyword})` : h.kind)).join(', ')}`,
    }
  }

  const impact = migrationImpact(
    diffSchemas(mevcut, onerilen as EntityTypeSchema),
    kayitlariTopla(repoRoot, tip)
  )
  return { ok: true, impact, ozet: impactMessage(impact) }
}
