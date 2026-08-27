#!/usr/bin/env node
// GROUP: fast
// HOOK BAĞIMLILIĞI — `useCallback`/`useMemo`/`useEffect` okuduğu DURUMU listelemek
// zorunda (FAZ-19.10).
//
// ⚠ ⚠ **BU KAPI PANELDE PLAYWRIGHT'LA BULUNAN BİR KUSURDAN DOĞDU ve kusur SESSİZDİ.**
// `RunLauncher`ın başlatma işleyicisi `sablon`u gövdeye koyuyordu ama bağımlılık
// listesinde `sablon` YOKTU. `useCallback` ilk render'ın kapanışını sakladığı için
// kullanıcı menüden bir şablon seçse bile isteğe giden değer HEP `''` oluyordu:
// panelden başlatılan her koşuda şablonu hat kendi seçiyordu.
//
// ⚠ Hiçbir kapı bunu görmüyordu çünkü çıktı GEÇERLİYDİ — sadece İSTENEN şablon
// değildi. Ölçüm DOM ile isteği karşılaştırınca çıktı: menüde `memphis`, gövdede `""`.
//
// ⚠ `eslint-plugin-react-hooks` bu sınıfın tamamını yakalar ama KURULU DEĞİL ve bu depo
// bağımlılık eklemeden önce duruyor (R-75). Bu kapı dar ve okunur: yalnız aynı dosyada
// `useState` ile tanımlanmış DEĞER adlarını sınıyor — setter'lar hariç, çünkü onların
// kimliği render'lar arasında sabittir.

import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const KOK = join(import.meta.dirname, '../..')
const DIZIN = join(KOK, 'apps/ui/src')

/** Bir kapanış parantezine kadar olan gövdeyi döndürür. */
const govdeAl = (s, bas) => {
  let derinlik = 0
  for (let i = bas; i < s.length; i += 1) {
    const c = s[i]
    if (c === '(') derinlik += 1
    else if (c === ')') {
      derinlik -= 1
      if (derinlik === 0) return s.slice(bas, i + 1)
    }
  }
  return ''
}

const ihlaller = []
let sayilan = 0

for (const dosya of readdirSync(DIZIN).filter((f) => f.endsWith('.tsx'))) {
  const s = readFileSync(join(DIZIN, dosya), 'utf8')
  // Aynı dosyadaki useState DEĞER adları (setter değil).
  const durumlar = [...s.matchAll(/const \[(\w+), set\w+\] = useState/g)].map((m) => m[1])
  if (durumlar.length === 0) continue

  for (const m of s.matchAll(/use(Callback|Memo|Effect)\(/g)) {
    const tam = govdeAl(s, m.index + m[0].length - 1)
    if (tam === '') continue
    // Son `]` ile biten bağımlılık listesi.
    const son = tam.lastIndexOf('[')
    if (son < 0) continue
    const deps = tam.slice(son, tam.lastIndexOf(']') + 1)
    // ⚠ ⚠ **TİP AÇIKLAMALARI TARANMAZ — ilk sürüm 25 bulgunun ÇOĞUNU oradan
    // uydurdu.** `as { hata?: string }` gibi bir cast'in içindeki ad bir DEĞER okuması
    // değildir; `bekleyenler?: Bekleyen[]` de öyle. Alet ikisini de "kullanıyor" sayıp
    // gerçek kusuru yanlış pozitiflerin arasında kaybediyordu.
    const govde0 = tam.slice(0, son)
    // ⚠ ⚠ **METİN DİZELERİ TARANMAZ — TÜRKÇE YÜZÜNDEN YANLIŞ POZİTİF ÜRETİYORDU.**
    // `'editörde düzelt'` içindeki `d`, ASCII `\w` sınıfı `ü`yü harf saymadığı için
    // TEK BAŞINA bir değişken gibi görünüyordu ve alet *"`d` okuyor, listede YOK"*
    // dedi. Bu R-21'in (`'i'.toUpperCase()` → `I`) düzenli ifade tarafındaki ikizi:
    // ASCII varsayımı Türkçe metinde sessizce bozuluyor.
    //
    // ⚠ Şablon dizesindeki `${...}` KORUNUYOR: orası gerçek bir değer okuması. Düz
    // tırnaklı dizeler ise ifade taşıyamaz, tamamen atılıyor.
    const dizesiz = govde0
      .replace(/`(?:[^`\\$]|\\.|\$(?!\{))*`/g, ' ')
      .replace(/`/g, ' ')
      .replace(/'(?:[^'\\]|\\.)*'/g, ' ')
      .replace(/"(?:[^"\\]|\\.)*"/g, ' ')
    const govde = dizesiz.replace(/\bas \{[^}]*\}/g, ' ').replace(/:\s*\{[^}]*\}/g, ' ')
    // ⚠ ⚠ **KAPSAM DAR VE BİLİNÇLİ: yalnız İSTEK GÖVDESİ kuran hook'lar.** Geniş
    // hâli `apps/ui`da 17 bulgu veriyordu ve çoğu görüntüleme amaçlı okumalardı —
    // gerçek kusuru gürültünün içinde kaybediyordu. Bu depoda kuralı gereğinden geniş
    // yazmak defalarca kapıya takıldı.
    // ⚠ Sessizce ZARAR VEREN sınıf bu: bir hook `fetch` + `JSON.stringify` ile sunucuya
    // gövde kuruyorsa, eksik bir bağımlılık kullanıcının SEÇİMİNİ yok eder ve çıktı yine
    // geçerli göründüğü için kimse fark etmez (RunLauncher `sablon` vakası).
    if (!(govde0.includes('fetch(') && govde0.includes('JSON.stringify('))) continue
    sayilan += 1
    for (const d of durumlar) {
      // Gövdede TEK BAŞINA geçiyor mu (özellik adı ya da parça değil).
      // ⚠ ⚠ **NESNE ANAHTARI DEĞER OKUMASI DEĞİLDİR.** `body: JSON.stringify({ gerekce: not })`
      // içindeki `gerekce` bir ANAHTAR; alet onu "durum okunuyor" sayıp iki yanlış
      // pozitif üretti. Anahtar `:` ile devam eder, değer okuması etmez.
      // ⚠ URL YOLU DA DEĞER OKUMASI DEĞİL: `/api/semalar/${secili}` içindeki `semalar`
      // bir yol parçası. Alet onu "durum okunuyor" sandı ve son yanlış pozitifi üretti.
      const kullaniyor = new RegExp(`(^|[^./\\w])${d}\\s*(?![:/\\w])`).test(govde)
      const listede = new RegExp(`(^|[^.\\w])${d}([^\\w]|$)`).test(deps)
      if (kullaniyor && !listede) {
        const satir = s.slice(0, m.index).split('\n').length
        ihlaller.push(`${dosya}:${satir}  use${m[1]} "${d}" okuyor, listede YOK`)
      }
    }
  }
}

if (ihlaller.length > 0) {
  console.log(`  ${ihlaller.length} hook eksik bağımlılık taşıyor:`)
  for (const i of ihlaller.slice(0, 12)) console.log(`    ${i}`)
  console.log('  Eksik bağımlılık = BAYAT KAPANIŞ: hook ilk render’ın değerini taşır ve')
  console.log('  kullanıcının seçimi SESSİZCE yok sayılır (RunLauncher `sablon` vakası).')
  process.exit(1)
}
console.log(`  ${sayilan} hook bağımlılığı tam · apps/ui`)
