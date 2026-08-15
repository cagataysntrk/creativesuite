// Sentetik fixture'lara erişim (§15 · FAZ-1.10).
//
// GERÇEK PROSPECT VERİSİ FIXTURE'A ASLA GİRMEZ (KVKK). Fixture'lar sentetiktir ve her
// biri `synthetic: true` işareti taşır; `fixtures` kapısı bu işareti ve PII desenlerini
// her turda denetler. Test verisi git'e girer ve sonsuza kadar orada kalır — bir kez
// giren gerçek kişi verisi geri alınamaz.

import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

// fileURLToPath: `new URL(...).pathname` Türkçe karakterli dizinlerde URL-kodlu yol
// döndürür (2026-08-14'te 44 dosya bu yüzden yanlış dizine yazıldı).
const KERNEL_SRC = dirname(dirname(fileURLToPath(import.meta.url)))
const REPO = join(KERNEL_SRC, '../../..')

export const FIXTURE_ROOT = join(REPO, 'test/fixtures')

export const fixturePath = (...parts: readonly string[]): string => join(FIXTURE_ROOT, ...parts)

export const readFixture = (...parts: readonly string[]): string =>
  readFileSync(fixturePath(...parts), 'utf8')

export const readJsonFixture = (...parts: readonly string[]): unknown =>
  JSON.parse(readFixture(...parts))
