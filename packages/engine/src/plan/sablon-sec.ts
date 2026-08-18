// HEDEF: packages/engine/src/plan/sablon-sec.ts
//
// Şablon seçimi — katalogdan, İÇERİĞİN ŞEKLİNE göre (FAZ-15.6 · D-268 · Yasa 13).
//
// ⚠ ⚠ **SERBEST ÜRETİM YOK, ŞABLON VAR.** D-268'den sonra hat kompozisyon icat etmiyor:
// katalogdan bir kayıt SEÇİYOR ve onun dolu taslağını uyarlıyor. Bu dosya o seçimin tek
// yeri. Seçim yapılamazsa hat DURUYOR — sessizce bir varsayılana düşmek, kataloğu
// merkezden çıkarıp yeniden serbest üretime dönmek olurdu.
//
// ⚠ ⚠ **MODEL ÇAĞIRMIYOR ve bu `tasarla.ts` ile aynı gerekçe:** aynı içerik iki koşuda
// iki farklı şablon seçerse "bu karosel neden böyle" sorusunun cevabı her seferinde
// değişir ve golden test kurulamaz. Seçim deterministik; YARATICILIK uyarlama adımında.
//
// ⚠ ⚠ **SİNYALLER YAPISAL, ANAHTAR KELİME LİSTESİ DEĞİL.** "ürün, fabrika, makine"
// gibi bir sözlük yazmak cazipti ve reddedildi: Türkçe eklemeli, sözlük her çekimde
// delinir ve delindiğinde SESSİZCE yanlış şablon seçilir. Sayılabilen şeyler sayılıyor —
// yıl, rakam, soru işareti, satır uzunluğu. Sayılamayan bir ihtiyacı (ürün fotoğrafı)
// içerikten TAHMİN etmek yerine, hattın açıkça istemesi bekleniyor.

import { kullanilabilirSablonlar, sablonBul, type KatalogSablonu } from '@suite/contracts'

/** İçeriğin ÖLÇÜLEN şekli — hepsi metinden sayılarak çıkıyor. */
export interface IcerikSekli {
  readonly satirSayisi: number
  /** Rakam içeren satırların oranı, 0–1. */
  readonly sayiYogunlugu: number
  /** Kaç FARKLI yıl geçiyor (1900–2100). */
  readonly yilSayisi: number
  /** Soru işaretiyle biten satırların oranı, 0–1. */
  readonly soruOrani: number
  /** Numaralı satır (`1.`, `2)`) sayısı. */
  readonly numaraliSatir: number
  /** Ortalama satır uzunluğu, karakter. */
  readonly ortalamaUzunluk: number
}

const YIL = /\b(19|20|21)\d{2}\b/g
const RAKAM = /\d/
const NUMARALI = /^\s*\d+\s*[.)]/

export const icerikSekli = (satirlar: readonly string[]): IcerikSekli => {
  const n = Math.max(1, satirlar.length)
  const yillar = new Set<string>()
  for (const s of satirlar) for (const y of s.match(YIL) ?? []) yillar.add(y)
  return {
    satirSayisi: satirlar.length,
    sayiYogunlugu: satirlar.filter((s) => RAKAM.test(s)).length / n,
    yilSayisi: yillar.size,
    soruOrani: satirlar.filter((s) => s.trimEnd().endsWith('?')).length / n,
    numaraliSatir: satirlar.filter((s) => NUMARALI.test(s)).length,
    ortalamaUzunluk: Math.round(satirlar.reduce((a, s) => a + s.length, 0) / n),
  }
}

/** Bir şablonun aldığı puan ve GEREKÇESİ — gerekçesiz seçim denetlenemez. */
export interface SablonPuani {
  readonly id: string
  readonly puan: number
  readonly neden: string
}

export type SablonSecimi =
  | {
      readonly ok: true
      readonly sablon: KatalogSablonu
      readonly neden: string
      readonly puanlar: readonly SablonPuani[]
    }
  | { readonly ok: false; readonly sebep: string; readonly puanlar: readonly SablonPuani[] }

/**
 * İçerik şeklinin bir şablona ne kadar uyduğu.
 *
 * ⚠ ⚠ **`donen` İÇERİKTEN SEÇİLEMEZ ve bu bir EKSİK DEĞİL, bir dürüstlük.** O şablonun
 * taşıyıcısı daire maskeli ÜRÜN fotoğrafı; metinde "ürün" geçmesi bir ürün fotoğrafının
 * çekilebileceği anlamına gelmiyor. Metinden çıkarılamayan bir ihtiyacı çıkarılmış gibi
 * yapmak, koşuyu yer tutucularla dolu bir karoselle bitirir. Hat onu açıkça isteyebilir
 * (`istenen`); tahmin edilemez.
 */
const puanla = (s: KatalogSablonu, i: IcerikSekli): SablonPuani => {
  const gerekce: string[] = []
  let puan = 0

  // ⚠ ⚠ **KURAL ASİMETRİK: AZ SATIR ELER, ÇOK SATIR ELEMEZ — ve bunu gerçek bir koşu
  // öğretti.** İlk sürüm iki yönlü eliyordu; `metin-uret` 11 satır üretti ve ALTI
  // ŞABLONUN ALTISI birden elendi, hat hiçbir şey seçemeden durdu. Yanlış olan metin
  // değil kuraldı: yazar cümle üretiyor, karosel KART taşıyor ve ikisi aynı birim
  // değil. Uyarlama adımının işi tam olarak dağıtmak — **fazlayı birleştirebilir,
  // eksiği UYDURAMAZ.** O yüzden alt sınır sert, üst sınır serbest.
  if (i.satirSayisi < s.slayt.min)
    return {
      id: s.id,
      puan: -1,
      neden: `${i.satirSayisi} satır, şablon en az ${s.slayt.min} kart istiyor`,
    }

  switch (s.id) {
    case 'veri-hikayesi':
      if (i.yilSayisi >= 3) {
        puan += 4
        gerekce.push(`${i.yilSayisi} farklı yıl — zaman serisi`)
      }
      if (i.sayiYogunlugu >= 0.5) {
        puan += 3
        gerekce.push(`satırların %${Math.round(i.sayiYogunlugu * 100)}'i rakam taşıyor`)
      }
      break
    case 'memphis':
      if (i.soruOrani >= 0.4) {
        puan += 5
        gerekce.push(`satırların %${Math.round(i.soruOrani * 100)}'i soru — soru ritmi`)
      }
      break
    case 'akan-alan':
      if (i.numaraliSatir >= 3) {
        puan += 5
        gerekce.push(`${i.numaraliSatir} numaralı satır — sayılı liste ritmi`)
      }
      break
    // ⚠ ⚠ **`editoryal` DE İÇERİKTEN SEÇİLEMEZ — ilk sürüm seçiyordu ve YANLIŞTI.**
    // "Az ve kısa satır" sinyali bu şablona veriliyordu; ama `editoryal`in taşıyıcısı
    // tam kaplama bir FOTOĞRAF, kısa metin değil. Dört satırlık bir anlatı metni onun
    // yüzünden `sahne`den çalınıyordu: kısa olmak, fotoğrafın var olduğu anlamına
    // gelmez. `donen` ile aynı sınıf — metinden çıkarılamayan ihtiyaç, tahmin
    // edilmez, İSTENİR.
    case 'editoryal':
      break
    case 'sahne':
      // Taban puan: anlatı ritmi olan ama sayısal olmayan içeriğin varsayılanı.
      if (i.sayiYogunlugu < 0.4 && i.soruOrani < 0.4 && i.numaraliSatir < 3) {
        puan += 2
        gerekce.push('sayısal ya da liste ritmi yok — anlatı')
      }
      break
    default:
      break
  }
  return {
    id: s.id,
    puan,
    neden: gerekce.length === 0 ? 'ayırt edici sinyal yok' : gerekce.join(' · '),
  }
}

/**
 * Katalogdan şablon seçer.
 *
 * ⚠ ⚠ **`istenen` VARSA O KAZANIR ama DOĞRULANIR.** Hat bir şablon adı verebiliyor
 * (`donen` gibi içerikten çıkarılamayanlar için gerekli); ama katalogda yoksa ya da
 * `kullanilabilir.durum === false` ise hat **REDDEDİYOR**. Sessizce varsayılana düşmek,
 * istenen tasarımdan başka bir tasarımı istenmiş gibi teslim etmek olurdu.
 *
 * ⚠ ⚠ **BERABERLİK RASTGELE ÇÖZÜLMEZ (R-06).** Eşit puanda katalog SIRASI kazanıyor:
 * aynı içerik her koşuda aynı şablonu seçiyor. `Math.random` ya da `Date` burada
 * "çeşitlilik" adına kolayca sızabilirdi; çeşitlilik uyarlama adımının işi.
 */
export interface SecimKosullari {
  /** Hattın açıkça istediği şablon — içerikten çıkarılamayanlar için tek yol. */
  readonly istenen?: string
  /**
   * Bu koşuda görsel üretilebiliyor mu.
   *
   * ⚠ ⚠ **BU BAYRAK OLMADAN SEÇİM YALAN SÖYLER.** Altı şablonun DÖRDÜ taşıyıcı olarak
   * görsele bağlı (`sahne`, `memphis`, `donen`, `editoryal`). Sağlayıcı anahtarı yokken
   * (`sops exec-env` unutulduğunda) o şablonlar seçilirse koşu, kimliği yer tutucudan
   * ibaret bir karoselle biter — ve metrikler yeşil kalır, çünkü ölçtükleri şey varlık.
   * Görsel üretilemiyorsa katalog iki kayda iniyor ve bu bir eksiklik değil, doğru cevap.
   */
  readonly gorselUretilebilir: boolean
  /**
   * Son koşularda kullanılmış şablonlar — EN YENİDEN eskiye.
   *
   * ⚠ ⚠ **TEKRAR, SEÇİMİN KUSURU DEĞİL TASARIM SONUCUYDU.** Defterde son üç karosel
   * koşusunun ÜÇÜ de `sahne` seçti: seçim içeriğin ölçülen şeklinden deterministik
   * çıkıyor, benzer konu benzer şekil verir, benzer şekil aynı şablonu seçer. Doğru
   * çalışan bir seçici, tek başına, aynı tasarımı sonsuz kez üretir.
   *
   * ⚠ Rastgelelik EKLENMEDİ (R-06). Kural kayıttan: son koşularda kullanılmış bir
   * şablon, BAŞKA UYGUN ADAY VARSA eleniyor. Uygun demek `puan > 0`, yani eleme
   * zaten geçilmiş — "çeşitlilik için kötü bir şablon seçmek" mümkün değil. Aynı
   * içerik + aynı geçmiş = aynı seçim; replay bozulmuyor.
   */
  readonly sonKullanilan?: readonly string[]
}

export const sablonSec = (
  satirlar: readonly string[],
  kosullar: SecimKosullari = { gorselUretilebilir: true }
): SablonSecimi => {
  const istenen = kosullar.istenen
  const i = icerikSekli(satirlar)
  const acik = kullanilabilirSablonlar().filter(
    (s) => kosullar.gorselUretilebilir || s.gorsel === null
  )
  const puanlar = acik.map((s) => puanla(s, i))

  if (istenen !== undefined) {
    const s = sablonBul(istenen)
    if (s === null) return { ok: false, sebep: `katalogda yok: ${istenen}`, puanlar }
    if (!s.kullanilabilir.durum)
      return { ok: false, sebep: `şablon kapalı: ${istenen} — ${s.kullanilabilir.sebep}`, puanlar }
    if (s.gorsel !== null && !kosullar.gorselUretilebilir)
      return {
        ok: false,
        sebep: `${istenen} görsel taşıyıcısına bağlı ama bu koşuda görsel üretilemiyor`,
        puanlar,
      }
    const p = puanla(s, i)
    if (p.puan < 0) return { ok: false, sebep: `${istenen}: ${p.neden}`, puanlar }
    return { ok: true, sablon: s, neden: `hat açıkça istedi (${p.neden})`, puanlar }
  }

  const uygun = puanlar.filter((p) => p.puan > 0).sort((a, b) => b.puan - a.puan)
  // ⚠ Yakın geçmişte kullanılanlar ELENİYOR — ama yalnız geriye uygun aday kalıyorsa.
  // Kalmıyorsa tekrar meşrudur: içerik gerçekten tek bir şablona uyuyor demektir.
  const yakin = new Set(kosullar.sonKullanilan ?? [])
  const taze = uygun.filter((p) => !yakin.has(p.id))
  const enIyi = taze[0] ?? uygun[0]
  const tazeSecildi = taze[0] !== undefined && uygun[0] !== undefined && taze[0].id !== uygun[0].id
  if (enIyi === undefined)
    return {
      ok: false,
      sebep:
        'içeriğin şekli hiçbir şablona uymadı — slayt sayısı aralık dışında ya da ' +
        'ayırt edici sinyal yok. Hat şablonu açıkça istemeli.',
      puanlar,
    }
  const sablon = sablonBul(enIyi.id)
  if (sablon === null) return { ok: false, sebep: `katalog tutarsız: ${enIyi.id}`, puanlar }
  const neden = tazeSecildi
    ? `${enIyi.neden} · son koşularda kullanılan ${[...yakin].join(', ')} elendi`
    : enIyi.neden
  return { ok: true, sablon, neden, puanlar }
}
