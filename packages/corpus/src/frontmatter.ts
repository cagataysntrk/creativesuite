// TEK frontmatter ayrıştırıcı (§3.5 · chokepoints.json → `frontmatter-ayristirici`).
//
// İki ayrıştırıcı bir dosyayı indekste geçerli, pipeline'da geçersiz yapar — ve hata
// dosyada değil, İKİSİNİN ARASINDA olur; hiçbir dosyayı açarak bulunamaz.
//
// Biçim kasıtlı olarak dar: `---` ile açılan ve `---` ile kapanan tek bir YAML bloğu,
// sonra gövde. TOML frontmatter, JSON frontmatter, `+++` sınırlayıcı — hiçbiri yok.
// Dar biçim, elle düzenlenen bir corpus'ta "neden bu dosya okunmadı" sorusunu bitirir.

import { parse as parseYaml, stringify as stringifyYaml } from 'yaml'

const DELIM = '---'

export interface ParsedFile {
  /** Ayrıştırılmış frontmatter. Blok yoksa `null` — boş nesne DEĞİL. */
  readonly frontmatter: Record<string, unknown> | null
  readonly body: string
}

export type ParseError =
  | { readonly kind: 'no_frontmatter' }
  | { readonly kind: 'unterminated' }
  | { readonly kind: 'invalid_yaml'; readonly message: string }
  | { readonly kind: 'not_a_map' }

export type ParseResult =
  | { readonly ok: true; readonly value: ParsedFile }
  | { readonly ok: false; readonly error: ParseError }

/**
 * Ayrıştırır. `throw` ETMEZ — bozuk bir corpus dosyası bir istisna değil, bir
 * VERİ durumudur ve indeksleyici onu atlayıp diğerlerine devam edebilmeli (§8.6).
 */
export const parseFrontmatter = (text: string): ParseResult => {
  // BOM ve baştaki boş satırlar tolere edilir: bir editörün eklediği görünmez karakter
  // yüzünden kaydın "frontmatter'ı yok" sayılması, saatlerce aranan bir hatadır.
  const src = text.replace(/^﻿/, '')
  const lines = src.split('\n')

  let i = 0
  while (i < lines.length && lines[i]?.trim() === '') i++
  if (lines[i]?.trim() !== DELIM) return { ok: false, error: { kind: 'no_frontmatter' } }

  const start = i + 1
  let end = -1
  for (let k = start; k < lines.length; k++) {
    if (lines[k]?.trim() === DELIM) {
      end = k
      break
    }
  }
  if (end === -1) return { ok: false, error: { kind: 'unterminated' } }

  const yamlText = lines.slice(start, end).join('\n')
  let data: unknown
  try {
    data = parseYaml(yamlText)
  } catch (e) {
    return {
      ok: false,
      error: { kind: 'invalid_yaml', message: e instanceof Error ? e.message : String(e) },
    }
  }
  if (data === null || typeof data !== 'object' || Array.isArray(data)) {
    return { ok: false, error: { kind: 'not_a_map' } }
  }

  return {
    ok: true,
    value: {
      frontmatter: data as Record<string, unknown>,
      body: lines
        .slice(end + 1)
        .join('\n')
        .replace(/^\n/, ''),
    },
  }
}

/**
 * Seri hâle getirir. Ayrıştırma ile bu fonksiyon TERS ÇİFTTİR: `parse(serialize(x))`
 * daima `x` verir. Aksi hâlde bir kaydı okuyup yazmak onu sessizce değiştirir ve
 * `git diff` her turda gürültü üretir — gürültülü diff okunmayan diff'tir (§5.4).
 */
export const serializeFrontmatter = (fm: Record<string, unknown>, body: string): string => {
  const yamlText = stringifyYaml(fm, { lineWidth: 0 }).trimEnd()
  const govde = body.trimEnd()
  return `${DELIM}\n${yamlText}\n${DELIM}\n${govde === '' ? '' : `\n${govde}\n`}`
}
