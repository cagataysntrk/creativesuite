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
import { sade } from './gorsel-tr.mjs'

const REPO = join(dirname(fileURLToPath(import.meta.url)), '..')
const HEDEF = join(REPO, 'scripts/gorsel-katalog.json')

const gh = async (u) => {
  const r = await fetch(u, { headers: { 'user-agent': 'creativesuite-katalog' } })
  if (!r.ok) throw new Error(`${String(r.status)} ${u}`)
  return r.json()
}

// ⚠ ⚠ **3dicons KALDIRILDI — sebebi lisans ya da kalite DEĞİL, ERİŞİM.** Varlıkları
// `pub-…r2.dev` altında ve o hostun DNS'i YALNIZ IPv6 (AAAA) döndürüyor; bu makinede
// IPv6 yolu yok ve `fetch` her denemede düşüyor. Ölçüldü: sunucudan da tarayıcıdan da
// erişilemiyor. Erişilemeyen bir kaynağı listede tutmak, her aramada kırık önizleme
// üretmek demekti. IPv6 açılırsa deseni şuydu:
//   https://pub-821312cfd07a4061bf7b99c1f23ed29b.r2.dev/v1/{açı}/{stil}/{ad}-{açı}-{stil}.png

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

/**
 * Karşılaştırma için sade ad.
 *
 * ⚠ ⚠ **İLK SÜRÜM TÜRKÇE HARFLERİ SİLİYORDU** ve sözlüğün yarısını sessizce boşa
 * çıkardı: `dünya` → `d nya`, `ağaç` → `a a`. Ölçüldü — *"dünya"*, *"ağaç"*, *"ev"*
 * aramaları sözlükte KARŞILIKSIZDI. Aynı ders R-21 ile bir kez öğrenilmişti: ASCII
 * varsayımı Türkçe metinde sessizce bozuluyor.
 * ⚠ Katlama `gorsel-tr.mjs`teki `sade` ile AYNI olmak zorunda: sözlük bir katlamayla
 * kurulup başka biriyle sorgulanırsa hiçbir zaman eşleşmez.
 */
const sadeAd = (x) => sade(x)

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

/**
 * TÜRKÇE → İNGİLİZCE sözlük — CLDR'dan TÜRETİLİYOR, elle yazılmıyor.
 *
 * ⚠ ⚠ **BİR KUSURDAN DOĞDU, teşhisi depo sahibinin:** *"`car` yazınca diğerleri göründü,
 * `araba` yazınca sadece Fluent Emoji geldi."* Sebebi: Türkçe anahtarlar YALNIZ Fluent
 * kataloğundaydı; Iconify ve Commons Türkçe bilmiyor ve onlara giden sorgu hâlâ Türkçeydi.
 * Elle sözlük yazmak yüzlerce kelime demekti ve yine eksik kalırdı.
 *
 * ⚠ CLDR'ın Türkçesi ile İngilizcesi AYNI emoji üzerinden eşleşiyor: `🚗` → tr `araba,
 * otomobil` · en `car, automobile`. Sözlük zaten oradaydı, yalnız birleştirilmemişti.
 */
const trEnSozluk = (trH, adH, enH) => {
  // ⚠ ⚠ **ASIL ÖLÇÜT KISALIK — ölçülerek anlaşıldı.** İlk puanlama emojinin KENDİ adını
  // anahtar kelimelerin üstüne koyuyordu; sonuç: `araba` → *"oncoming bus"*, `para` →
  // *"money mouth face"*, `grafik` → *"chart increasing with yen"*. Hepsi doğru emojiye
  // bağlıydı ama hiçbiri ARANAN kelime değildi. Iconify'a *"money mouth face"* yollamak
  // sıfır sonuç demek; *"money"* yollamak yüzlerce. Tek kelimelik bir ad, dört kelimelik
  // bir addan her zaman daha iyi bir SORGUDUR.
  const aday = new Map()
  const ekle = (emoji, kelime, adMi) => {
    const k = sadeAd(kelime)
    if (k === '' || k.length < 2) return
    // ⚠ ⚠ **SAYISAL ADAYLAR ATILIYOR.** CLDR saat emojilerine `10`, `11`, `30` gibi
    // anahtarlar veriyor ve kalbe `143` (argo). Bunlar geçerli birer anahtar ama BERBAT
    // birer görsel sorgusu: Iconify'a `12` yollamak anlamsız bir sonuç kümesi getirir.
    if (/^[0-9\s]+$/.test(k)) return
    const puan = 30 - (k.split(' ').length - 1) * 6 + (adMi ? 1 : 0)
    const l = aday.get(emoji) ?? new Map()
    l.set(k, Math.max(l.get(k) ?? 0, puan))
    aday.set(emoji, l)
  }
  for (const [ad, emoji] of adH) ekle(emoji, ad, true)
  for (const [emoji, kelimeler] of enH) for (const k of kelimeler) ekle(emoji, k, false)
  // ⚠ ⚠ **PUANLAR SON BİRLEŞTİRMEYE KADAR TAŞINIYOR.** İlk sürüm her emojinin
  // İngilizcesini sırayla ekleyip ilk altısını alıyordu; aynı Türkçe kelimeyi birden çok
  // emoji paylaşınca (🚗 🚌 🚙 hepsi *"araba"* geçiyor) İLK GELEN emoji slotları
  // kapıyordu ve `araba` → *"bus"* çıkıyordu. Sıralama emoji sırasına değil PUANA bağlı
  // olmalı; yoksa sözlük doğru ama işe yaramaz.
  const sozluk = new Map()
  for (const [emoji, trKelimeler] of trH) {
    const l = aday.get(emoji)
    if (l === undefined) continue
    for (const t of trKelimeler) {
      const anahtar = sadeAd(t)
      // ⚠ Tek harfli ve üç kelimeden uzun ifadeler atlanıyor: ilki gürültü, ikincisi
      // (*"bir fikrim var"*) bir kelime değil bir cümle ve sorguya girmiyor.
      if (anahtar.length < 2 || anahtar.split(' ').length > 3) continue
      const havuz = sozluk.get(anahtar) ?? new Map()
      for (const [k, p] of l) havuz.set(k, Math.max(havuz.get(k) ?? 0, p))
      sozluk.set(anahtar, havuz)
    }
  }
  return Object.fromEntries(
    [...sozluk.entries()]
      .map(([k, havuz]) => [
        k,
        [...havuz.entries()]
          .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
          .map((x) => x[0])
          .slice(0, 4),
      ])
      .sort()
  )
}

/** CLDR İNGİLİZCE anahtarlar — sözlüğün öbür yakası. */
const ingilizceAnahtarlar = async () => {
  const r = await fetch(
    'https://raw.githubusercontent.com/unicode-org/cldr/main/common/annotations/en.xml',
    { headers: { 'user-agent': 'creativesuite-katalog' } }
  )
  const xml = r.ok ? await r.text() : ''
  const harita = new Map()
  for (const m of xml.matchAll(/<annotation cp="([^"]+)"(?: type="tts")?>([^<]+)<\/annotation>/g)) {
    const kelimeler = m[2]
      .split('|')
      .map((x) => x.trim())
      .filter(Boolean)
    harita.set(m[1], [...new Set([...(harita.get(m[1]) ?? []), ...kelimeler])])
  }
  return harita
}

const [trHarita, adHarita, enHarita] = await Promise.all([
  turkceAnahtarlar(),
  emojiAdlari(),
  ingilizceAnahtarlar(),
])
console.log(`  CLDR tr: ${String(trHarita.size)} kayıt · emoji adı: ${String(adHarita.size)} kayıt`)
const fl = await fluent(adHarita, trHarita)
const sozluk = trEnSozluk(trHarita, adHarita, enHarita)
console.log(`  TR→EN sözlük: ${String(Object.keys(sozluk).length)} kelime`)
const katalog = {
  kuruldu: process.argv[2] ?? '',
  sozluk,
  kaynaklar: {
    fluent: {
      ad: 'Fluent Emoji 3D',
      lisans: 'MIT',
      not: '3D render, saydam PNG · Microsoft',
      kok: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets',
      ogeler: fl,
    },
  },
}
// ⚠ ⚠ **GİRİNTİSİZ YAZILIYOR — `repo-hygiene` kapısı 512 KB tavan koyuyor.** Girintili
// hâli 740 KB'ydi ve kapı haklı olarak reddetti: bu bir kaynak dosya değil bir VERİ
// dosyası, insan onu okumuyor. Girintiyi atmak dosyayı yarıya indiriyor ve okunabilirlik
// kaybı yok — `just gorsel-katalog` ile yeniden üretilebiliyor.
writeFileSync(HEDEF, JSON.stringify(katalog), 'utf8')
console.log(
  `✓ katalog: fluent ${String(fl.length)} · sözlük ${String(Object.keys(sozluk).length)} → scripts/gorsel-katalog.json`
)
