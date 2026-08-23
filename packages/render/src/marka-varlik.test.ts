// Font ve logo da token gibi DEVRALINIR (R-101 · D-332).
//
// ⚠ ⚠ **`brd_dima` KOŞUYU ÖLDÜRÜYORDU.** Token sistemi kalıtımı biliyor —
// `brand/<id>/parent` tek satır ve dima yalnız `state-ok` rolünü ezip *"ezmediğin şey
// MİRASTIR"* diyor. Font ve logo o cümlenin DIŞINDAYDI: `uret.mjs` doğrudan
// `brand/brd_dima/fonts` bakıyor, sekiz dosyayı bulamıyor ve `exit(1)` ediyordu.
//
// ⚠ ⚠ **VE LOGO DOSYA ADLARI BİR MARKANIN ADINI TAŞIYORDU** (`upcytech-mavi.png`).
// Marka-nötr bir modülde bir markanın adı: ikinci marka kendi işaretini koyamazdı.

import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { fontCss } from './fonts.js'
import { logoVarliklari } from './logo.js'
import { varlikZinciri, zincirdenCoz } from './marka-varlik.js'

const REPO = join(dirname(fileURLToPath(import.meta.url)), '../../..')
const BRAND = join(REPO, 'brand')

/** Geçici bir marka ağacı: `kok/<id>/parent` ve `kok/<id>/<alt>/<dosya>`. */
const kur = (agac: Readonly<Record<string, string | null>>): string => {
  const kok = mkdtempSync(join(tmpdir(), 'marka-varlik-'))
  for (const [id, parent] of Object.entries(agac)) {
    mkdirSync(join(kok, id), { recursive: true })
    if (parent !== null) writeFileSync(join(kok, id, 'parent'), parent)
  }
  return kok
}

describe('varlikZinciri', () => {
  it('önce kendisi, sonra atası', () => {
    const kok = kur({ cocuk: 'ata', ata: null })
    expect(varlikZinciri(kok, 'cocuk', 'fonts')).toEqual([
      join(kok, 'cocuk', 'fonts'),
      join(kok, 'ata', 'fonts'),
    ])
  })

  it('atasız marka tek halkalı', () => {
    const kok = kur({ tek: null })
    expect(varlikZinciri(kok, 'tek', 'logo')).toEqual([join(kok, 'tek', 'logo')])
  })

  // ⚠ Döngü SESSİZCE atlanmıyor, zincir orada KESİLİYOR: `a → b → a` bir yapılandırma
  // hatasıdır ve sonsuz döngüye girmek onu gizler.
  it('döngü zinciri sonsuza götürmüyor', () => {
    const kok = kur({ a: 'b', b: 'a' })
    const z = varlikZinciri(kok, 'a', 'fonts')
    expect(z).toEqual([join(kok, 'a', 'fonts'), join(kok, 'b', 'fonts')])
  })
})

describe('zincirdenCoz', () => {
  // ⚠ ⚠ **"Dizin var" YETMEZ, sonuç TAM olmalı.** Alt markanın boş bir `fonts/` klasörü
  // olsa zincir orada dururdu ve koşu yine fontsuz kalırdı.
  it('ilk TAM sonucu alıyor, ilk var olan dizini değil', () => {
    const cozum = zincirdenCoz(['bos', 'dolu'], (d) => ({ ok: d === 'dolu', nereden: d }))
    expect(cozum.sonuc.ok).toBe(true)
    expect(cozum.dizin).toBe('dolu')
    expect(cozum.devralindi).toBe(true)
  })

  it('kendi tamsa DEVRALMIYOR', () => {
    const cozum = zincirdenCoz(['kendi', 'ata'], () => ({ ok: true }))
    expect(cozum.dizin).toBe('kendi')
    expect(cozum.devralindi).toBe(false)
  })

  it('hiçbiri tam değilse İLK sonucu dönüyor — hata mesajı kendi markasını söylesin', () => {
    const cozum = zincirdenCoz(['kendi', 'ata'], (d) => ({ ok: false, nereden: d }))
    expect(cozum.sonuc.ok).toBe(false)
    expect(cozum.dizin).toBe('kendi')
  })
})

describe('gerçek markalar', () => {
  it('`brd_dima` fontu ve işareti ATASINDAN devralıyor', () => {
    const f = zincirdenCoz(varlikZinciri(BRAND, 'brd_dima', 'fonts'), (d) => fontCss(d))
    expect(f.sonuc.ok, 'dima fontsuz — koşu ölür').toBe(true)
    expect(f.devralindi).toBe(true)
    const l = zincirdenCoz(varlikZinciri(BRAND, 'brd_dima', 'logo'), (d) => logoVarliklari(d))
    expect(l.sonuc.ok, 'dima imzasız').toBe(true)
    expect(l.devralindi).toBe(true)
  })

  it('ana marka KENDİ varlıklarını kullanıyor — zincir onu atlamıyor', () => {
    const f = zincirdenCoz(varlikZinciri(BRAND, 'brd_upcytech', 'fonts'), (d) => fontCss(d))
    expect(f.sonuc.ok).toBe(true)
    expect(f.devralindi).toBe(false)
  })

  // ⚠ Dosya adları MARKA-NÖTR: bir markanın adını taşıyan dosya, ikinci markayı
  // dışlar. `logo.ts` marka-nötr bir modül.
  it('işaret dosya adları hiçbir markanın adını taşımıyor', () => {
    const kaynak = readFileSync(join(REPO, 'packages/render/src/logo.ts'), 'utf8')
    const sabitler = [...kaynak.matchAll(/const (?:KOYU|ACIK)_DOSYA = '([^']+)'/g)].map((m) => m[1])
    expect(sabitler.length).toBe(2)
    for (const ad of sabitler) {
      expect(ad, `${String(ad)} bir marka adı taşıyor`).not.toMatch(/upcytech|dima|upcyman/i)
    }
  })
})

describe('üretim yolu zinciri KULLANIYOR', () => {
  // ⚠ ⚠ **MODÜL DEĞİL ÇAĞRI SINANIYOR** (R-92'nin dersi). `uret.mjs` bir CLI: import
  // edilip çağrılamıyor ve bir davranış testi kopukluğu göremezdi. Bu depoda "modül var,
  // test yeşil, üretim yolu yok" sekiz kez tekrarlandı.
  it('`uret.mjs` font VE logo için `varlikZinciri` çağırıyor', () => {
    const kaynak = readFileSync(join(REPO, 'scripts/uret.mjs'), 'utf8')
    const satirlar = kaynak.split('\n').filter((s) => !s.trim().startsWith('//'))
    const cagrilar = satirlar.filter((s) => s.includes('varlikZinciri('))
    // Biri fonts, biri logo — tek çağrı, ikisinden birinin unutulduğu anlamına gelir.
    expect(cagrilar.some((s) => s.includes("'fonts'"))).toBe(true)
    expect(cagrilar.some((s) => s.includes("'logo'"))).toBe(true)
    expect(kaynak).not.toMatch(/fontCss\(join\(REPO, `brand\/\$\{MARKA\}\/fonts`\)\)/)
  })
})
