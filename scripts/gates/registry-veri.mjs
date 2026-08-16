// GROUP: fast
// Ring 1 VERİ dosyaları GERÇEKTEN okunabiliyor mu (§8.3 · D-17 · FAZ-4.12).
//
// **Kod kapılardan geçiyor, veri geçmiyordu.** 29 kapı `packages/` ve `apps/` altındaki
// her satırı denetliyor; `registry/butce.yaml` bir VERİ dosyası ve hiçbiri ona bakmıyordu.
//
// Gerçekten oldu (2026-08-16 denetimi): FAZ-4.12'nin kendi commit'i (`f2767ba`) diske
// çelişkili bir tavan bıraktı — `per_run 9_000_000` > `per_month 1_000`. Bir ihlal
// testinden kalmıştı ve geri alınmamıştı. Sonuç: `just uret` **hiç başlamıyordu**,
// her çalıştırma açılışta "bütçe tavanı okunamadı" ile düşüyordu. 29 kapı yeşildi,
// 918 test yeşildi, üretim ölüydü.
//
// Okuma yolu doğru davranıyordu (sessizce varsayılana düşmedi — D-179). Eksik olan,
// bozuk verinin COMMIT edilebilmesiydi.

import { existsSync, readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const REPO = join(dirname(fileURLToPath(import.meta.url)), '../..')
const { parseButce, butceHatasiMesaji } = await import(
  join(REPO, 'packages/registry/dist/index.js')
)

const hatalar = []
let denetlenen = 0

// ── bütçe tavanı ────────────────────────────────────────────────────────────
const butceYolu = join(REPO, 'registry/butce.yaml')
if (!existsSync(butceYolu)) {
  // Dosya YOKSA varsayılan kullanılır ve bu meşru (D-179) — hata değil, bilgi.
  console.log('  registry/butce.yaml yok — varsayılan tavan kullanılacak')
} else {
  denetlenen++
  const r = parseButce(readFileSync(butceYolu, 'utf8'))
  if (!r.ok) {
    hatalar.push(
      `registry/butce.yaml okunamıyor — HER çalıştırma açılışta düşer:\n` +
        r.errors.map((e) => `      ${butceHatasiMesaji(e)}`).join('\n')
    )
  } else {
    const { perRunMicros, perMonthMicros } = r.value
    // `null` tavansız demek ve meşru; `0` "hiç harcama yapma" ve o da meşru (D-179).
    // Denetlenen tek şey okunabilirlik ve tutarlılık — tercihin kendisi kullanıcının.
    const g = (v) => (v === null ? 'tavansız' : `${v.toString()} mikro`)
    console.log(`  bütçe: çalıştırma ${g(perRunMicros)} · aylık ${g(perMonthMicros)}`)
  }
}

if (hatalar.length > 0) {
  for (const h of hatalar) console.log(`  ✗ ${h}`)
  console.log(`\n${hatalar.length} registry veri hatası`)
  process.exit(1)
}

console.log(`✓ registry-veri: ${denetlenen} veri dosyası okunabiliyor`)
