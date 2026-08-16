#!/usr/bin/env node
// İhlal bataryası — her BLOCKING kapı KASTEN ihlal edilir (R-71 · FAZ-5.10 · FAZ-9.2).
//
// **Yeşil bir kapı hiçbir şey kanıtlamaz.** Bir kapının çalıştığını görmenin tek yolu
// onu kırmızıya döndürmektir. Bu batarya tek seferlik bir kabuk komutu DEĞİL: FAZ-9.2
// "kural uyum turu" her denetim turunda aynı bataryayı koşacak.
//
// **Üç ayrı şey doğrulanır** (D-186 · D-170):
//   1. İhlal UYGULANDI mı — dosya gerçekten değişti mi
//   2. Kod hâlâ DERLENİYOR mu (derlenmiyorsa test geçersizdir, kapıyı sınamaz)
//   3. Kırmızı DOĞRU kapıdan mı geldi — başka bir kapı maskeliyor olabilir
//
// Her ihlal sonunda dosya GERİ ALINIR ve kapının yeniden yeşile döndüğü doğrulanır.
// Geri alınmayan bir ihlal, bir sonraki turu yalancı kırmızıya boğar.

import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync, writeFileSync, unlinkSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const REPO = join(dirname(fileURLToPath(import.meta.url)), '..')

const kapiKos = (ad) => {
  try {
    execFileSync('just', ['gate', ad], { cwd: REPO, encoding: 'utf8', stdio: 'pipe' })
    return { yesil: true, cikti: '' }
  } catch (e) {
    return { yesil: false, cikti: `${e.stdout ?? ''}${e.stderr ?? ''}` }
  }
}

const derleniyorMu = () => {
  try {
    execFileSync('npx', ['tsc', '-b'], { cwd: REPO, encoding: 'utf8', stdio: 'pipe' })
    return true
  } catch {
    return false
  }
}

/**
 * İhlaller. Her biri: hangi kapı · dosyaya ne eklenir · kırmızı çıktıda hangi imza
 * aranır.
 *
 * `imza` ZORUNLU: onsuz batarya "kırmızı oldu" der ama hangi kuraldan olduğunu
 * bilmez — ve bu projede tam olarak bu hata yaşandı (D-200: ihlal dosyası playwright
 * de import ediyordu, kırmızı `chromium-baslatan`dan geldi).
 */
const IHLALLER = [
  {
    kapi: 'turkish-case',
    dosya: 'packages/render/src/capture/ihlal-gecici.ts',
    icerik: 'export const kotu = (s: string): string => s.toUpperCase()\n',
    // ⚠ İmza kapının GERÇEK mesajından alınır, kapı ADINDAN değil: `turkish-case`
    // kapısı "çıplak .toUpperCase()" diyor. İlk sürümde kapı adını aradım ve batarya
    // "kırmızı ama başka kuraldan" dedi — batarya haklıydı, imzam yanlıştı.
    imza: 'toUpperCase()',
  },
  {
    kapi: 'chokepoints',
    dosya: 'packages/render/src/capture/ihlal-gecici.ts',
    icerik: "export const kayit = { recordVideo: { dir: '/tmp/v' } }\n",
    imza: 'ekran-kaydedici',
  },
  {
    kapi: 'ui-tema',
    dosya: 'motion/components/ihlal-gecici.css',
    icerik: '.ihlal {\n  transition: opacity 400ms linear;\n}\n',
    imza: '320ms',
  },
  {
    kapi: 'ui-tema',
    dosya: 'motion/components/ihlal-gecici.css',
    icerik: '.ihlal {\n  background: #0091ff;\n}\n',
    imza: 'düz renk',
  },
  {
    kapi: 'chokepoints',
    dosya: 'packages/render/src/deck/ihlal-gecici.ts',
    icerik: "export const uc = 'https://gamma.app/api/generate'\n",
    imza: 'hazir-deck-ureticisi',
  },
  {
    kapi: 'chokepoints',
    dosya: 'packages/render/src/charts/ihlal-gecici.ts',
    icerik: "export const c = { kutuphane: 'chart.js' }\n",
    imza: 'metin-olcen-grafik-kutuphanesi',
  },
  {
    kapi: 'chokepoints',
    dosya: 'packages/corpus/src/ihlal-gecici.ts',
    icerik:
      "import { unlinkSync } from 'node:fs'\nexport const s = (p: string): void => unlinkSync(p)\n",
    imza: 'corpus-silici',
  },
  {
    kapi: 'prospect-kvkk',
    dosya: 'corpus/prospect/ihlal-gecici.md',
    icerik:
      '---\nid: rec_prospect_ihlal\nbrand_id: brd_upcytech\ntype: prospect\nera_id: imalat-2026\n' +
      'status: draft\nlegal_name: Sentetik Test\nstage: contacted\n' +
      'source_url: https://ornek.gecersiz/x\nkvkk_basis: mesru_menfaat\n' +
      'retention_until: 2027-01-01\ncontact_name: Sentetik Kisi\n---\n\nGövde.\n',
    imza: 'kvkk_disclosure_sent',
  },
  {
    kapi: 'turkce-genisleme',
    dosya: 'apps/ui/src/ihlal-gecici.css',
    icerik: 'button.ihlal {\n  inline-size: 96px;\n}\n',
    imza: 'SABİT genişlik',
  },
]

const sonuclar = []
let hata = 0

for (const ih of IHLALLER) {
  const yol = join(REPO, ih.dosya)
  const vardi = existsSync(yol)
  const oncesi = vardi ? readFileSync(yol, 'utf8') : null

  // ── 1. ihlal UYGULANDI mı ────────────────────────────────────────────────
  writeFileSync(yol, ih.icerik)
  if (readFileSync(yol, 'utf8') !== ih.icerik) {
    sonuclar.push(`?? ${ih.kapi} · ${ih.imza} — ihlal UYGULANAMADI, test geçersiz`)
    hata++
    continue
  }

  // ── 2. kod DERLENİYOR mu ─────────────────────────────────────────────────
  // CSS ihlalleri derlemeyi etkilemez; TS olanlar etkileyebilir ve o zaman kapı
  // değil derleyici konuşur — kapıyı sınamış olmayız.
  const tsIhlali = ih.dosya.endsWith('.ts') || ih.dosya.endsWith('.tsx')
  const derledi = tsIhlali ? derleniyorMu() : true

  // ── 3. kırmızı DOĞRU kapıdan mı ──────────────────────────────────────────
  const r = kapiKos(ih.kapi)
  if (r.yesil) {
    sonuclar.push(`!! ${ih.kapi} · ${ih.imza} — YEŞİL KALDI, kapı korumuyor`)
    hata++
  } else if (!r.cikti.includes(ih.imza)) {
    sonuclar.push(`!! ${ih.kapi} · ${ih.imza} — kırmızı ama BAŞKA kuraldan; imza çıktıda yok`)
    hata++
  } else if (!derledi) {
    sonuclar.push(`?? ${ih.kapi} · ${ih.imza} — derleme düştü, kapı sınanmış sayılmaz`)
    hata++
  } else {
    sonuclar.push(`✓ ${ih.kapi} · ${ih.imza}`)
  }

  // ── geri al ve YEŞİLE döndüğünü doğrula ──────────────────────────────────
  if (oncesi === null) unlinkSync(yol)
  else writeFileSync(yol, oncesi)
  if (tsIhlali) derleniyorMu()

  const geri = kapiKos(ih.kapi)
  if (!geri.yesil) {
    sonuclar.push(`!! ${ih.kapi} — GERİ ALMA BAŞARISIZ, kapı hâlâ kırmızı`)
    hata++
  }
}

console.log(sonuclar.map((s) => `  ${s}`).join('\n'))
console.log('')
if (hata > 0) {
  console.log(`✗ ${hata} ihlal testi geçersiz ya da kapı korumuyor`)
  process.exit(1)
}
console.log(`✓ ihlal bataryası: ${IHLALLER.length} kural kasten ihlal edildi, hepsi KIRMIZI`)
