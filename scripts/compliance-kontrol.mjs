#!/usr/bin/env node
// `compliance` kapısı — sentetik insan yasağı ve damga (§11.3 · R-33 · FAZ-3.11).
//
// KENDİ KENDİNİ TEST EDER. Repoda henüz üretilmiş varlık yok; yalnız tarama yapan bir
// kapı bugün yeşil raporlar ve doğduğu gün işe yaramadığı hâlde çalışıyor görünür.
// Aşağıdaki üç öz-test her koşuda damgalayıcının GERÇEKTEN çalıştığını kanıtlar.

import { deflateSync } from 'node:zlib'
import { mkdtempSync, readFileSync, rmSync, writeFileSync, globSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const REPO = join(dirname(fileURLToPath(import.meta.url)), '..')
const {
  assertCompliance,
  stampPng,
  readStamp,
  hasComplianceStamp,
  STAMP_KEYS,
  PERSON_PROBES,
  personPatternHits,
} = await import(join(REPO, 'packages/render/dist/index.js'))

// ── 1x1 PNG üreteci ─────────────────────────────────────────────────────────
// Chromium açmadan geçerli bir PNG gerekiyor: kapı `fast` grubunda ve tarayıcı
// başlatmak onu saniyelerden dakikalara taşırdı.
const CRC = (() => {
  const t = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    t[n] = c >>> 0
  }
  return t
})()
const crc32 = (buf) => {
  let c = 0xffffffff
  for (const b of buf) c = CRC[(c ^ b) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}
const chunk = (tip, veri) => {
  const u = Buffer.alloc(4)
  u.writeUInt32BE(veri.length, 0)
  const t = Buffer.from(tip, 'latin1')
  const c = Buffer.alloc(4)
  c.writeUInt32BE(crc32(Buffer.concat([t, veri])), 0)
  return Buffer.concat([u, t, veri, c])
}
const minikPng = () => {
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(1, 0)
  ihdr.writeUInt32BE(1, 4)
  ihdr[8] = 8 // bit derinliği
  ihdr[9] = 2 // renk tipi: truecolor
  const idat = deflateSync(Buffer.from([0x00, 0x10, 0x14, 0x18])) // filtre + 1 piksel
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

const hatalar = []
const tmp = mkdtempSync(join(tmpdir(), 'uyum-kapisi-'))

try {
  // ── öz-test 1: HER desen kendi probe'uyla ayrı ayrı kanıtlanır ────────────
  // Tek prompt YETMİYOR: ilk sürümde `müşteri` deseni silindiğinde `gülümse` deseni
  // aynı prompt'u yakalıyor ve kapı YEŞİL kalıyordu — desenlerin çoğu silinebilirdi
  // ve kapı hiçbir şey söylemezdi. İhlal testi (R-71) bunu gösterdi.
  // Beklenen probe listesi **kodun DIŞINDA** sabitlenmiş (`person-probes.json`).
  // Koddan türetilseydi desen silindiğinde probe'u da silinir ve kapı yeşil kalırdı —
  // ilk sürümde tam bu oldu. `verbs.json` ile aynı mantık (R-02).
  const sabit = JSON.parse(readFileSync(join(REPO, 'packages/render/person-probes.json'), 'utf8'))
  const beklenen = sabit.probes ?? []
  if (beklenen.length < 10) {
    hatalar.push(`ÖZ-TEST: sabit probe listesi eksik (${beklenen.length}) — kapı boş geçiyor`)
  }
  const kodda = new Set(PERSON_PROBES ?? [])
  for (const p of beklenen) {
    if (!kodda.has(p)) {
      hatalar.push(`ÖZ-TEST: sabit probe "${p}" KODDA YOK — bir R-33 deseni silinmiş`)
    }
  }
  for (const p of kodda) {
    if (!beklenen.includes(p)) {
      hatalar.push(`ÖZ-TEST: yeni desen "${p}" person-probes.json'a eklenmemiş`)
    }
  }
  for (const probe of beklenen) {
    const kotu = assertCompliance({
      basis: { kind: 'prompt_forbids_people', promptDigest: 'sha256:x' },
      aiGenerated: true,
      prompt: probe,
      correlationId: 'cor_gate',
    })
    if (kotu.ok) hatalar.push(`ÖZ-TEST: "${probe}" iddia kurabildi — bir R-33 deseni ÖLDÜ`)
    // Probe'lar üst üste binerse mekanizma ilk hâline döner: silinen bir desen,
    // başka bir desenin probe'uyla maskelenir.
    const isabet = personPatternHits(probe)
    if (isabet !== 1)
      hatalar.push(`ÖZ-TEST: "${probe}" ${isabet} desene uyuyor — probe bağımsız değil`)
  }

  // ── öz-test 2: temiz prompt iddia ALIR ve damga OKUNUR ────────────────────
  const iyi = assertCompliance({
    basis: { kind: 'prompt_forbids_people', promptDigest: 'sha256:x' },
    aiGenerated: true,
    prompt: 'çelik tezgâh üstünde ölçüm aleti',
    correlationId: 'cor_gate',
  })
  if (!iyi.ok) {
    hatalar.push('ÖZ-TEST: temiz prompt iddia KURAMADI — kapı her şeyi bloklar')
  } else {
    const yol = join(tmp, 'oz-test.png')
    writeFileSync(yol, minikPng())
    if (hasComplianceStamp(yol)) {
      hatalar.push('ÖZ-TEST: DAMGASIZ PNG damgalı sayıldı — kapı boş geçiyor')
    }
    const s = stampPng(yol, {
      stamp: {
        brandId: 'brd_test',
        eraId: 'era_test',
        kitVersion: 'ĞÜŞİÖÇ ğüşıöç',
        definitionDigest: 'sha256:d',
        contextManifest: 'ctx',
        sourceRunId: 'run_t',
      },
      claim: iyi.value,
    })
    if (!s.ok) hatalar.push(`ÖZ-TEST: damgalama başarısız (${s.error})`)
    const okunan = readStamp(yol)
    if (okunan?.[STAMP_KEYS.synthetic] !== 'false') {
      hatalar.push('ÖZ-TEST: damga geri okunamadı')
    }
    // Türkçe UTF-8 turu: `tEXt` kullanılsaydı burası bozulurdu.
    if (okunan?.[STAMP_KEYS.kit] !== 'ĞÜŞİÖÇ ğüşıöç') {
      hatalar.push('ÖZ-TEST: Türkçe karakter damgada BOZULDU — iTXt/UTF-8 kırık')
    }
    if (!hasComplianceStamp(yol)) hatalar.push('ÖZ-TEST: damgalı PNG damgasız sayıldı')
  }

  // ── öz-test 3: PNG olmayan dosya reddedilir ───────────────────────────────
  const sahte = join(tmp, 'sahte.png')
  writeFileSync(sahte, 'PNG değil')
  if (readStamp(sahte) !== null) hatalar.push('ÖZ-TEST: PNG olmayan dosya kabul edildi')
} finally {
  rmSync(tmp, { recursive: true, force: true })
}

// ── gerçek varlıklar: damga + BÜTÜNLÜK ──────────────────────────────────────
// İki ayrı soru: "uyum iddiası var mı" ve "içerik kendi adresiyle uyuşuyor mu".
// İkincisi olmadan bozuk bir blob sessizce YANLIŞ varlığı döndürür ve o varlık bir
// prospect'e gider. `verifyBlob` FAZ-3.12'de yazıldı; buradan çağrılmasaydı bu
// segmentte üç kez görülen "kod yazıldı ama hiç çalışmadı" deseninin dördüncüsü olurdu.
const { verifyBlob } = await import(join(REPO, 'packages/engine/dist/index.js'))

const varliklar = globSync('derived/blobs/**/*.png', { cwd: REPO })
for (const rel of varliklar) {
  const mutlak = join(REPO, rel)
  if (!hasComplianceStamp(mutlak)) {
    hatalar.push(`${rel}: uyum damgası YOK — R-33 iddiası olmayan varlık yayınlanamaz`)
  }
  for (const k of verifyBlob(mutlak)) {
    hatalar.push(
      k.kind === 'digest_mismatch'
        ? `${rel}: içerik adresle UYUŞMUYOR (gerçek ${k.actual.slice(0, 12)}…) — depo bozuk`
        : k.kind === 'meta_missing'
          ? `${rel}: sidecar YOK — damga ve köken kayıp (R-11)`
          : `${rel}: ${Math.round(k.bytes / 1024)}KB — git sınırı aşıldı (R-64)`
    )
  }
}

if (hatalar.length > 0) {
  console.log(hatalar.map((h) => `  ✗ ${h}`).join('\n'))
  console.log(`\n${hatalar.length} uyum ihlali`)
  process.exit(1)
}

console.log(
  `  öz-test geçti · ${PERSON_PROBES.length} R-33 deseni tek tek kanıtlandı (sabit listeyle) · ` +
    `damga + UTF-8 + PNG doğrulama · ${varliklar.length} varlık damgalı ve bütünlüğü doğrulandı`
)
