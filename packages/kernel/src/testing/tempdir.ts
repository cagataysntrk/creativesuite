// Test için geçici dizin (§15).
//
// Neden burada, test dosyasının içinde değil: `corpus-yazici` darboğazı
// `packages/corpus/src/**` altında dosya yazan/silen TEK dosyayı `write.ts` olarak
// sabitliyor (§3.8) — ve bu doğru. Bir testin `rmSync` çağırması "corpus'a yazan ikinci
// yol" gibi görünür ve kapı onu haklı olarak reddeder.
//
// Geçici dizin yönetimi zaten test ALTYAPISIDIR; yeri burasıdır.

import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

export interface TempDir {
  readonly path: string
  readonly cleanup: () => void
}

export const makeTempDir = (prefix = 'suite-'): TempDir => {
  const path = mkdtempSync(join(tmpdir(), prefix))
  return { path, cleanup: () => rmSync(path, { recursive: true, force: true }) }
}
