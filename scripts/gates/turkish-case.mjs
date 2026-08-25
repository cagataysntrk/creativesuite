#!/usr/bin/env node
// GROUP: fast
// Locale-güvenli case zorlaması (§7.2 · R-21 · FAZ-0.C.4).
//
// `'i'.toUpperCase()` → `'I'`, olması gereken `'İ'`. Hata SESSİZDİR: derlenir, koşar,
// testten geçer ve bir prospect'e giden deck'te "ISTANBUL" yazar. Ekran görüntüsünde
// tipo gibi görünür ve kimse build'de görmez.
//
// İki şey aranır:
//   1. Çıplak `.toUpperCase()` / `.toLowerCase()` — tek muaf dosya `text/case.ts`
//   2. `toLocaleUpperCase()` ama locale'siz veya `'tr'` DIŞINDA — daha sinsi hâli:
//      doğru fonksiyonu çağırıp yanlış (veya hiç) locale vermek
//
// JS regex'i kullanılıyor (Node), kabuk değil — D-58'deki `LANG=tr_TR` tuzağı burada yok.

import { readFileSync, globSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const REPO = join(dirname(fileURLToPath(import.meta.url)), '../..')
const p = (f) => join(REPO, f)

/** Case dönüştürmeye izin verilen TEK dosya (§3.8). */
// Yetkili yer Ring -1'e taşındı (D-165): katlama hem sunucuda hem tarayıcıda aynı
// olmak zorunda ve tarayıcı halkası kernel'i import edemez. Sayı hâlâ BİR.
const KUTSANMIS = 'packages/contracts/src/text-tr.ts'

const GLOBS = [
  'packages/*/src/**/*.ts',
  'packages/*/src/**/*.tsx',
  'apps/*/src/**/*.ts',
  'apps/*/src/**/*.tsx',
]

// Yorum satırları ve blok yorumları düşürülür: bu dosyanın kendisi gibi, bir kuralı
// ANLATAN yorum kuralı ÇİĞNEMEZ. Sürekli yanlış alarm veren kapı, kapatılan kapıdır.
const stripComments = (src) =>
  src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1')

/**
 * Dize İÇERİĞİ maskelenir — bir hata MESAJI kuralı çiğnemez.
 *
 * `\`'i'.toUpperCase() → 'I'\`` yazan bir hata mesajı, kullanıcıya sorunu anlatıyor;
 * kendisi bir çağrı değil. 2026-08-15'te `lexicon` linter'ının mesajı tam bu yüzden
 * kapıyı kırmızıya döndürdü.
 *
 * ⚠ Şablon dizelerinde `\${...}` blokları KORUNUR: `\`\${x.toUpperCase()}\`` gerçek bir
 * çağrıdır ve maskelenirse kural sessizce ölür. Maskeleme yalnız literal metne uygulanır.
 */
const stripStringBodies = (src) => {
  let out = ''
  let i = 0
  while (i < src.length) {
    const c = src[i]
    if (c === "'" || c === '"') {
      const kapanis = c
      out += c
      i++
      while (i < src.length && src[i] !== kapanis) {
        if (src[i] === '\\') {
          out += '  '
          i += 2
          continue
        }
        out += src[i] === '\n' ? '\n' : ' '
        i++
      }
      out += kapanis
      i++
      continue
    }
    if (c === '`') {
      out += c
      i++
      while (i < src.length && src[i] !== '`') {
        if (src[i] === '\\') {
          out += '  '
          i += 2
          continue
        }
        // `\${` bloğu AYNEN taşınır: içindeki çağrı gerçektir.
        if (src[i] === '$' && src[i + 1] === '{') {
          // `derinlik` `${`yi görür görmez 1 olmalı. 0'dan başlayan bir döngü ilk
          // karakterde çıkar ve blok maskelenir — ilk yazımda tam bu oldu ve ihlal
          // testi kapının SESSİZCE öldüğünü gösterdi (D-114).
          out += '${'
          i += 2
          let derinlik = 1
          while (i < src.length && derinlik > 0) {
            if (src[i] === '{') derinlik++
            else if (src[i] === '}') derinlik--
            out += src[i]
            i++
          }
          continue
        }
        out += src[i] === '\n' ? '\n' : ' '
        i++
      }
      out += '`'
      i++
      continue
    }
    out += c
    i++
  }
  return out
}

const CIPLAK = /\.\s*to(Upper|Lower)Case\s*\(/g
const LOCALE_SIZ = /\.\s*toLocale(Upper|Lower)Case\s*\(\s*(?!['"`]tr)/g

const errors = []
let tarandi = 0

for (const g of GLOBS) {
  for (const rel of globSync(g, { cwd: REPO }).sort()) {
    tarandi++
    const ham = stripComments(readFileSync(p(rel), 'utf8'))
    const src = stripStringBodies(ham)
    const lines = src.split('\n')
    // ⚠ ⚠ **LOCALE KONTROLÜ DİZİ GÖVDESİ SİLİNMEMİŞ satıra bakmak ZORUNDA.**
    // `stripStringBodies` her dizinin içini boşaltıyor — `.toLocaleLowerCase('tr')`
    // taramaya `.toLocaleLowerCase('')` olarak geliyor ve kapı DOĞRU kodu suçluyordu.
    // Kanıt: iki satırlık bir deney dosyası (`s.toLocaleLowerCase('tr')` ve şablon
    // değişmezli hâli) İKİSİ BİRDEN kırmızı döndü.
    // ⚠ Ve bu kapı gerçek koda çoktan zarar vermişti: `katalog-ornek.test.ts`te
    // *"`toLocaleLowerCase('tr')` DOĞRU olurdu ama `turkish-case` kapısı eşleştirmeden..."*
    // diye bir geçiştirme yorumu duruyor. **Yanlış alarm veren kapı, etrafından dolaşılan
    // kapıdır.** Çıplak `.toUpperCase()` taraması dizi gövdesiz satırda KALIYOR (bir
    // dizinin İÇİNDE geçen çağrı adı ihlal değildir); yalnız locale doğrulaması ham
    // satırdan okunuyor, çünkü aranan kanıt dizinin KENDİSİ.
    const hamSatirlar = ham.split('\n')

    lines.forEach((line, i) => {
      // Testte hatanın kendisini göstermek meşru: `'istanbul'.toUpperCase()` ifadesinin
      // YANLIŞ sonuç verdiğini iddia eden bir assertion, kuralın kanıtıdır. Bunu ancak
      // aynı satırda `not.toBe` varsa kabul ederiz — yani ifade KULLANILMIYOR, çürütülüyor.
      const kanitSatiri = rel.endsWith('.test.ts') && /\.not\.\w/.test(line)

      CIPLAK.lastIndex = 0
      if (CIPLAK.test(line) && rel !== KUTSANMIS && !kanitSatiri) {
        errors.push(
          `${rel}:${i + 1}  çıplak .to${line.includes('toUpperCase') ? 'Upper' : 'Lower'}Case() — ` +
            `'i'.toUpperCase() → 'I' (olması gereken 'İ'). Tek yetkili yer: ${KUTSANMIS}`
        )
      }

      LOCALE_SIZ.lastIndex = 0
      // ⚠ Eşleşme dizi gövdesiz satırda aranıyor (dizi İÇİNDEKİ metin ihlal değil),
      // doğrulama ham satırda yapılıyor (locale'in kendisi bir dizi).
      const hamSatir = hamSatirlar[i] ?? ''
      const localeVar = /toLocale(Upper|Lower)Case\s*\(\s*(TR\b|['"`]tr)/.test(hamSatir)
      if (LOCALE_SIZ.test(line) && rel !== KUTSANMIS && !localeVar) {
        errors.push(
          `${rel}:${i + 1}  toLocale…Case() locale'siz veya 'tr' dışı — ` +
            `doğru fonksiyon, yanlış locale sessizce aynı hatayı verir`
        )
      }
    })
  }
}

if (tarandi === 0) {
  console.log('✗ hiçbir kaynak dosya taranmadı — kapsam yanlış, kapı boş geçiyor')
  process.exit(1)
}

// Kutsanmış dosya gerçekten `tr` locale kullanıyor mu? Kullanmıyorsa muafiyet anlamsız.
try {
  const kutsal = readFileSync(p(KUTSANMIS), 'utf8')
  if (
    !/toLocale(Upper|Lower)Case\s*\(\s*TR\s*\)|toLocale(Upper|Lower)Case\s*\(\s*['"`]tr/.test(
      kutsal
    )
  ) {
    errors.push(`${KUTSANMIS} 'tr' locale kullanmıyor — muafiyetin dayanağı yok`)
  }
} catch {
  errors.push(`${KUTSANMIS} yok — muaf dosya olmadan kapı yalnız yasaklar, çözüm sunmaz`)
}

if (errors.length) {
  console.log(errors.map((e) => `  ${e}`).join('\n'))
  console.log(`\n${errors.length} locale-naif case kullanımı`)
  process.exit(1)
}

console.log(`  ${tarandi} dosya · çıplak case yok · tek yetkili: ${KUTSANMIS}`)
