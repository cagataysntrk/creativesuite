#!/usr/bin/env node
// HEDEF: scripts/gorsel-katalog-kur.mjs
//
// Editörün web araması için GÖRSEL KATALOĞUNU kurar (FAZ-19.13).
//
// ⚠ ⚠ **KATALOG BİR KEZ KURULUR, ARAMA ANINDA AĞA ÇIKILMAZ.** Iconify'ın arama ucu var;
// 3dicons ve Fluent Emoji'nin YOK — ikisi de düz dosya deposu. Her aramada GitHub ağacını
// gezmek, arama kutusuna her harf yazışta 1595 klasörlük bir istek demekti. Katalog
// depoda duruyor ve `just gorsel-katalog` ile tazeleniyor.
//
// ⚠ Katalog TÜRETİLMİŞ ama commit'li: ağ olmadan da arama çalışsın diye (Yasa 12 —
// bir ay ihmal edilse de çalışır).

import { writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const REPO = join(dirname(fileURLToPath(import.meta.url)), '..')
const HEDEF = join(REPO, 'scripts/gorsel-katalog.json')

const gh = async (u) => {
  const r = await fetch(u, { headers: { 'user-agent': 'creativesuite-katalog' } })
  if (!r.ok) throw new Error(`${String(r.status)} ${u}`)
  return r.json()
}

// ── 3dicons (CC0) ───────────────────────────────────────────────────────────
//
// ⚠ Slug'lar deponun `content/3dicons-meta/*.md` adlarından; PNG'ler CDN'de ve
// adresleme deseni `{açı}/{stil}/{ad}-{açı}-{stil}.png`. Ölçüldü: katalogdaki her ad
// için 3 açı × 4 stilin ON İKİSİ de var.
const ucD = async () => {
  const kok = await gh('https://api.github.com/repos/realvjy/3dicons/git/trees/develop?recursive=1')
  const adlar = kok.tree
    .filter((x) => x.path.startsWith('content/3dicons-meta/') && x.path.endsWith('.md'))
    .map((x) => x.path.replace('content/3dicons-meta/', '').replace('.md', ''))
    .sort()
  return adlar.map((ad) => ({ ad, etiket: ad.replace(/-/g, ' ') }))
}

/**
 * Unicode CLDR'ın TÜRKÇE emoji ek açıklamaları.
 *
 * ⚠ ⚠ **TÜRKÇE ARAMA İÇİN ELLE SÖZLÜK YAZMADIM — OTORİTER KAYNAK VAR.** CLDR
 * `common/annotations/tr.xml` her emoji için Türkçe anahtar kelimeleri taşıyor:
 * `🏭 → bina | fabrika | sanayi`, `📈 → artış grafiği | grafik | yükselen grafik`.
 * Kendi sözlüğümü yazsaydım hem eksik hem taraflı olurdu; bu liste Unicode'un.
 *
 * ⚠ İki dosya birleşiyor: `annotations` (elle yazılmış) ve `annotationsDerived`
 * (türetilmiş, bayrak ve ten rengi çeşitleri). İkincisi olmadan yüzlerce emoji
 * Türkçesiz kalıyor.
 */
const turkceAnahtarlar = async () => {
  const cek = async (u) => {
    const r = await fetch(u, { headers: { 'user-agent': 'creativesuite-katalog' } })
    return r.ok ? r.text() : ''
  }
  const [a, b] = await Promise.all([
    cek('https://raw.githubusercontent.com/unicode-org/cldr/main/common/annotations/tr.xml'),
    cek('https://raw.githubusercontent.com/unicode-org/cldr/main/common/annotationsDerived/tr.xml'),
  ])
  const harita = new Map()
  for (const xml of [a, b]) {
    for (const m of xml.matchAll(
      /<annotation cp="([^"]+)"(?: type="tts")?>([^<]+)<\/annotation>/g
    )) {
      const kelimeler = m[2]
        .split('|')
        .map((x) => x.trim())
        .filter(Boolean)
      harita.set(m[1], [...new Set([...(harita.get(m[1]) ?? []), ...kelimeler])])
    }
  }
  return harita
}

/**
 * Emoji ADI → emoji karakteri. CLDR Türkçesi karaktere göre anahtarlı, Fluent klasörü
 * ADA göre; ikisini birleştiren köprü bu.
 *
 * ⚠ Ad normalleştiriliyor: Fluent *"Chart increasing"*, Unicode *"chart increasing"*.
 * Noktalama ve büyük harf farkı iki listeyi yan yana getirmeyi engelliyordu.
 */
const emojiAdlari = async () => {
  const r = await fetch('https://unicode.org/Public/emoji/latest/emoji-test.txt', {
    headers: { 'user-agent': 'creativesuite-katalog' },
  })
  const metin = r.ok ? await r.text() : ''
  const harita = new Map()
  for (const satir of metin.split('\n')) {
    const m = /^[0-9A-F ]+;\s*fully-qualified\s*#\s*(\S+)\s+E\d+\.\d+\s+(.+)$/.exec(satir.trim())
    if (m === null) continue
    harita.set(sadeAd(m[2]), m[1])
  }
  return harita
}

/** Karşılaştırma için sade ad: küçük harf, yalnız harf ve rakam. */
const sadeAd = (x) =>
  x
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()

// ── Fluent Emoji 3D (MIT) ───────────────────────────────────────────────────
//
// ⚠ Dosya adı kuralı ÖLÇÜLDÜ: `assets/<Klasör Adı>/3D/<klasör_adı>_3d.png`, küçük harf
// ve boşluklar alt çizgi. Türkçe `toLowerCase` tuzağı YOK — adlar ASCII (R-21).
const fluent = async (adHarita, trHarita) => {
  const kok = await gh('https://api.github.com/repos/microsoft/fluentui-emoji/git/trees/main')
  const a = kok.tree.find((x) => x.path === 'assets')
  const klasorler = await gh(
    `https://api.github.com/repos/microsoft/fluentui-emoji/git/trees/${a.sha}`
  )
  let trliSayi = 0
  const ogeler = klasorler.tree
    .filter((x) => x.type === 'tree')
    .map((x) => {
      const emoji = adHarita.get(sadeAd(x.path)) ?? ''
      const tr = emoji === '' ? [] : (trHarita.get(emoji) ?? [])
      if (tr.length > 0) trliSayi += 1
      return {
        ad: x.path,
        dosya: `${x.path.replace(/[^A-Za-z0-9]+/g, '_').toLowerCase()}_3d.png`,
        ...(emoji === '' ? {} : { emoji }),
        ...(tr.length === 0 ? {} : { tr }),
      }
    })
    .sort((x, y) => x.ad.localeCompare(y.ad))
  console.log(`  fluent: ${String(trliSayi)}/${String(ogeler.length)} öğe TÜRKÇE anahtar taşıyor`)
  return ogeler
}

const [trHarita, adHarita] = await Promise.all([turkceAnahtarlar(), emojiAdlari()])
console.log(`  CLDR tr: ${String(trHarita.size)} kayıt · emoji adı: ${String(adHarita.size)} kayıt`)
const [d3, fl] = await Promise.all([ucD(), fluent(adHarita, trHarita)])
const katalog = {
  kuruldu: process.argv[2] ?? '',
  kaynaklar: {
    '3dicons': {
      ad: '3dicons',
      lisans: 'CC0-1.0',
      not: '3D render, saydam PNG · 3 açı × 4 stil',
      kok: 'https://pub-821312cfd07a4061bf7b99c1f23ed29b.r2.dev/v1',
      acilar: ['iso', 'front', 'dynamic'],
      stiller: ['color', 'gradient', 'clay', 'premium'],
      ogeler: d3,
    },
    fluent: {
      ad: 'Fluent Emoji 3D',
      lisans: 'MIT',
      not: '3D render, saydam PNG · Microsoft',
      kok: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets',
      ogeler: fl,
    },
  },
}
writeFileSync(HEDEF, JSON.stringify(katalog, null, 1), 'utf8')
console.log(
  `✓ katalog: 3dicons ${String(d3.length)} · fluent ${String(fl.length)} → scripts/gorsel-katalog.json`
)
