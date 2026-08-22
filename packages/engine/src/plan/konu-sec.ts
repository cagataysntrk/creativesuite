// Konusuz üretim — konu UYDURULMAZ, markanın kendi kayıtlarından SEÇİLİR (R-13 · R-14).
//
// Depo sahibinin isteği: *"konuyu sistem seçsin diyince kutucuk boş gitsin, LLM
// içeriği zaten markayı bildiği için kendisi seçer."* İki okuma var ve ayrımı önemli:
//
//   · "konuyu ben yazmayayım" → doğru, insan yazmıyor.
//   · "konu hiç olmasın"      → mümkün değil: `SELECT` konusuz çalışamaz
//                                (`MISSING_TOPIC`) ve konusuz üretilen metin markadan
//                                değil modelin genel bilgisinden gelir.
//
// Çözüm: konu **hattın ilk adımında** seçiliyor. Adaylar corpus başlıkları — yani
// gerçek kayıtlar; model bir konu HAYAL ETMİYOR, aralarından SEÇİYOR ve gerekçe
// yazıyor. Geçmişte işlenmiş konular eleniyor (D-308'in konu tarafı: son üç koşunun
// üçü de aynı şablonu seçmişti ve konular kopyaydı).
//
// ⚠ Kaynaksız bir konu, kaynaksız bir iddianın başlangıcıdır (Yasa 8).

import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { browseRecords, type SelectQuery } from '@suite/corpus'
import type { Db } from '@suite/kernel'
import { RUNS_DIR } from '@suite/kernel'

export interface KonuAdayGirdisi {
  readonly db: Db
  readonly query: SelectQuery
  readonly repoRoot: string
}

/** Prompt'a giren aday sayısı: hepsi girseydi seçim bir listeyi okumaya dönerdi. */
const ADAY_TAVANI = 18

/**
 * TÜR başına tavan — çeşitliliğin tek gerçek garantisi.
 *
 * ⚠ ⚠ İlk sürüm başlıkları sırayla alıyordu ve corpus'ta hangi tür önce
 * indekslendiyse aday listesi ondan doluyordu: her öneri "Excel ve vardiya defteri"
 * çıkıyordu. Depo sahibi bunu ilk denemede yakaladı. Bir listenin ilk N elemanı
 * "en iyi N" değildir; yalnız "ilk N"dir.
 */
const TUR_BASINA = 4

/**
 * Geçmişte işlenmiş konular — manifestlerdeki `topic` parametreleri.
 *
 * ⚠ Dizin adına göre okunuyor (uuidv7 zaman sıralı); `mtime` bir dosyaya dokunulduğu
 * an sırayı bozardı.
 */
/**
 * Konu → EN SON hangi koşuda işlendi (koşu dizini adı; uuidv7 zaman sıralı).
 *
 * ⚠ ⚠ **BU HARİTA BİR DUVARDAN DOĞDU.** Aday havuzu tükendi ve panel *"konu seçilemez:
 * geçmişte işlenmemiş aday kayıt kalmadı"* diyerek üretimi TAMAMEN durdurdu. Bir
 * markanın kayıt sayısı sonludur; N koşudan sonra kalıcı olarak duran bir sistem
 * tasarımı gereği bozuktur. Çeşitlilik "bir daha asla" değil "en son kullanılan en
 * sona" demek — bunun için konunun ne zaman işlendiğini bilmek gerekiyor.
 */
export const konuGecmisi = (repoRoot: string): ReadonlyMap<string, string> => {
  const kok = join(repoRoot, RUNS_DIR)
  const gecmis = new Map<string, string>()
  if (!existsSync(kok)) return gecmis
  for (const ad of [...readdirSync(kok)].sort()) {
    const yol = join(kok, ad, 'manifest.json')
    if (!existsSync(yol)) continue
    try {
      const m = JSON.parse(readFileSync(yol, 'utf8')) as {
        steps?: readonly {
          params?: Record<string, unknown>
          output?: Record<string, unknown> | null
        }[]
      }
      for (const st of m.steps ?? []) {
        const t = st.params?.['topic']
        if (typeof t === 'string' && t.trim() !== '') gecmis.set(t, ad)
        const secilen = st.output?.['konu']
        if (typeof secilen === 'string' && secilen.trim() !== '') gecmis.set(secilen, ad)
      }
    } catch {
      // Bozuk manifest bir konuyu gizler, sonucu bozmaz.
    }
  }
  return gecmis
}

export const islenmisKonular = (repoRoot: string): ReadonlySet<string> => {
  const kok = join(repoRoot, RUNS_DIR)
  if (!existsSync(kok)) return new Set()
  const konular = new Set<string>()
  for (const ad of readdirSync(kok)) {
    const yol = join(kok, ad, 'manifest.json')
    if (!existsSync(yol)) continue
    try {
      const m = JSON.parse(readFileSync(yol, 'utf8')) as {
        steps?: readonly {
          params?: Record<string, unknown>
          output?: Record<string, unknown> | null
        }[]
      }
      for (const s of m.steps ?? []) {
        const t = s.params?.['topic']
        if (typeof t === 'string' && t.trim() !== '') konular.add(t)
        // ⚠ ⚠ **AGENT'IN SEÇTİĞİ KONU `params`TA DEĞİL, ÇIKTIDA.** Konusuz başlatmada
        // `params.topic` boş kalıyor ve gerçek konu `konu-sec` adımının çıktısında
        // yaşıyor. Yalnız `params`a bakan bir eleme, agent seçtiği konuyu HİÇ
        // işlenmiş saymaz ve aynı konu sonsuza kadar yeniden seçilebilirdi —
        // çeşitlilik için kurulan mekanizmanın kendi kör noktası.
        const secilen = s.output?.['konu']
        if (typeof secilen === 'string' && secilen.trim() !== '') konular.add(secilen)
      }
    } catch {
      // Bozuk manifest bir konuyu gizler, sonucu bozmaz: en kötü ihtimalle aynı konu
      // ikinci kez önerilir. Burada patlamak, tek bozuk dosyanın tüm üretimi
      // durdurması olurdu.
    }
  }
  return konular
}

/**
 * Aday konular — **indeksten**, dosya taramasından değil (R-13).
 *
 * Dosyaları taramak `draft` bir kaydı konu olarak önermek olurdu (R-14); indeks
 * retrieval yüklemini uygulayan tek yer.
 */
export interface KonuAdayi {
  readonly baslik: string
  /** Kayıt türü — ürün mü, strateji mi, kanıt mı; seçimin anlamı buna bağlı. */
  readonly tur: string
  /**
   * Daha önce işlendiyse EN SON hangi koşuda — yoksa alan hiç yok.
   *
   * ⚠ Havuz tükendiğinde liste "hiç işlenmemişler" yerine "en eskiden başlayarak
   * hepsi" oluyor ve istem bunu AÇIKÇA söylüyor: model tekrar ürettiğini bilsin.
   */
  readonly sonKosu?: string
}

export const konuAdaylari = (g: KonuAdayGirdisi): readonly KonuAdayi[] => {
  const islenmis = islenmisKonular(g.repoRoot)
  const kayitlar = browseRecords(g.db, {
    brandId: g.query.brandId,
    eraId: g.query.eraId,
    asOf: g.query.asOf,
    type: '',
    status: '',
  }) as readonly { readonly title?: string; readonly type?: string }[]

  const turBasina = new Map<string, KonuAdayi[]>()
  const gorulen = new Set<string>()
  for (const k of kayitlar) {
    const baslik = k.title
    if (typeof baslik !== 'string' || baslik.trim() === '') continue
    if (islenmis.has(baslik) || gorulen.has(baslik)) continue
    const tur = typeof k.type === 'string' && k.type !== '' ? k.type : 'kayıt'
    const kova = turBasina.get(tur) ?? []
    if (kova.length >= TUR_BASINA) continue
    gorulen.add(baslik)
    kova.push({ baslik, tur })
    turBasina.set(tur, kova)
  }

  // Türler arasında SIRAYLA geziliyor: tek türün kovası listenin başını yemesin.
  const siralar = [...turBasina.values()]
  const sonuc: KonuAdayi[] = []
  for (let i = 0; i < TUR_BASINA; i++) {
    for (const kova of siralar) {
      const a = kova[i]
      if (a !== undefined) sonuc.push(a)
    }
  }
  if (sonuc.length > 0) return sonuc.slice(0, ADAY_TAVANI)

  // ── havuz TÜKENDİ: en eskiden başlayarak yeniden dolaşıma gir ─────────────
  //
  // ⚠ ⚠ **BURASI ÜRETİMİ TAMAMEN DURDURUYORDU.** Panel *"konu seçilemez: geçmişte
  // işlenmemiş aday kayıt kalmadı"* diyordu ve konusuz üretim bir daha hiç
  // başlamıyordu. Bir markanın kayıt sayısı SONLUDUR; N koşudan sonra kalıcı duran
  // bir sistem, tasarımı gereği bozuktur.
  //
  // Çeşitlilik "bir daha asla" değil "EN SON KULLANILAN EN SONA" demek. Liste en eski
  // kullanımdan başlıyor ve `sonKosu` taşıyor — istem bunu açıkça söylüyor, yani model
  // tekrar ürettiğini biliyor ve yeni bir açı arıyor.
  const gecmis = konuGecmisi(g.repoRoot)
  const hepsi: KonuAdayi[] = []
  const gorulen2 = new Set<string>()
  for (const k of kayitlar) {
    const baslik = k.title
    if (typeof baslik !== 'string' || baslik.trim() === '' || gorulen2.has(baslik)) continue
    gorulen2.add(baslik)
    const sonKosu = gecmis.get(baslik)
    hepsi.push({
      baslik,
      tur: typeof k.type === 'string' && k.type !== '' ? k.type : 'kayıt',
      ...(sonKosu === undefined ? {} : { sonKosu }),
    })
  }
  // En ESKİ kullanım önce; hiç kullanılmamış varsa (olmamalı ama) en başa.
  hepsi.sort((a, b) => (a.sonKosu ?? '').localeCompare(b.sonKosu ?? ''))
  return hepsi.slice(0, ADAY_TAVANI)
}

/**
 * Konu seçme istemi. Adaylar YOKSA `null` — ve `null` "atla" demek DEĞİL, çağıran
 * hattı durdurur: konusuz koşan bir hat, markadan gelmeyen bir metin üretir.
 */
export const konuSecPromptu = (g: {
  readonly adaylar: readonly KonuAdayi[]
  readonly islenmisSayisi: number
}): string | null => {
  if (g.adaylar.length === 0) return null
  return [
    'Bir Instagram karoseli için KONU seçeceksin.',
    '',
    'Aşağıdakiler markanın KENDİ kayıtlarının başlıkları — ürünler, strateji notları,',
    'kanıtlar. BİRİNİ seç: yeni bir konu UYDURMA, listede olmayan bir şey yazma.',
    '',
    // ⚠ ⚠ **BAŞLIK ÖNCE, TÜR SONRA — ve bu sıra ölçülerek değişti.** İlk sürüm
    // `[tur] baslik` yazıyordu ve model "başlığı birebir kopyala" talimatını
    // uygularken ÖN EKİ DE kopyaladı: `"[positioning] Veri katmanından karara"`.
    // Doğrulama reddetti, koşu durdu. Model yanlış davranmadı; istem belirsizdi.
    ...g.adaylar.map((a, i) => `${String(i + 1)}. ${a.baslik}   (tür: ${a.tur})`),
    '',
    ...(g.adaylar.every((a) => a.sonKosu !== undefined)
      ? [
          `Geçmişte ${String(g.islenmisSayisi)} konu işlendi ve HAVUZ TÜKENDİ.`,
          'Bu başlıkların hepsi daha önce işlendi; liste EN ESKİ kullanımdan başlıyor.',
          'Seçtiğin konuyu YENİ bir açıdan ele alacağız — aynı metni tekrar üretmek yok.',
        ]
      : [`Geçmişte ${String(g.islenmisSayisi)} konu işlendi ve onlar bu listede YOK.`]),
    'Seçerken sırayla şunu sor:',
    '  · bundan gösterilecek somut bir şey çıkar mı, yoksa yalnız laf mı olur?',
    '  · marka bunu söylemeye yetkili mi — elinde kaydı var mı?',
    '  · bugünün gündemine bu liste içinde en yakın duran hangisi?',
    '',
    // ⚠ ⚠ **BAŞLIK İSTEMEK YANLIŞ SORUYDU — NUMARA İSTİYORUZ.** Gerçek koşuda model
    // listedeki hiçbir başlığı yazmadı, kendi cümlesini kurdu (*"Veri katmanından
    // karara — Upcytech konumu"*) ve doğrulama haklı olarak reddetti: koşu ücretli
    // bir adımda durdu. Başlığı yeniden yazdırmak modelden bir KOPYALAMA istiyor ve
    // kopyalama her seferinde tire, büyük harf, kısaltma riskiyle geliyor.
    // Numara kopyalanamaz — ya listededir ya değildir.
    'YALNIZ şu JSON ile cevapla, başka hiçbir şey yazma:',
    '{"secim": <yukarıdaki listeden NUMARA>, "gerekce": "<tek cümle>"}',
    'Başlığı yeniden yazma, numara yeter. Listede olmayan bir numara verme.',
  ].join('\n')
}

export interface KonuSecimi {
  readonly konu: string
  readonly gerekce: string
}

/**
 * Model çıktısını okur ve **adaylara karşı doğrular**.
 *
 * ⚠ Doğrulama şart: model listede olmayan bir konu yazarsa o konu bir KAYNAKTAN
 * gelmiyor demektir ve `SELECT` onunla hiçbir şey bulamaz. "Yakın olanı kabul et"
 * demek, sessizce uydurulmuş bir konuyla koşmaktır.
 *
 * ⚠ ⚠ **GİRDİ DÜZ METİN — sağlayıcı çıktısını burada ÇÖZMÜYORUZ.** İlk sürüm kendi
 * şekil tahminini yapıyordu (`.text`, sonra `JSON.stringify`) ve gerçek koşuda
 * `TOPIC_NOT_IN_CANDIDATES` ile düştü: claude-code çıktısı `{result: "..."}` şeklinde
 * geliyor. Sağlayıcı yanıt şekli TEK geçitten okunur (`metneCevir`/`duzMetin`);
 * ikinci bir çözücü, ikinci bir şekil varsayımı demektir (D-227).
 */
export const konuSecimiCozumle = (
  metin: string,
  adaylar: readonly (string | KonuAdayi)[]
): KonuSecimi | null => {
  const basliklar = adaylar.map((a) => (typeof a === 'string' ? a : a.baslik))
  // ⚠ ⚠ **AÇGÖZLÜ EŞLEŞME İKİ NESNEYİ BİRDEN YUTUYORDU.** Gerçek koşuda model önce
  // yanlış anahtarla yazdı, sonra *"Düzeltme:"* deyip İKİNCİ bir JSON ekledi:
  //   {"konu": "…", "gerecke": "…"} Düzeltme: {"konu": "…", "gerekce": "…"}
  // `/\{[\s\S]*\}/` ilk `{`den son `}`ye kadar her şeyi alıyor, sonuç geçersiz JSON
  // ve adım `TOPIC_NOT_IN_CANDIDATES` ile duruyordu. Model kendini DÜZELTMİŞTİ;
  // ayrıştırıcı düzeltmeyi okuyamadı.
  //
  // Dengeli süslü parantezle adaylar çıkarılıyor ve SONDAN başlanıyor: modelin son
  // sözü, düzeltmesidir.
  const adaylarJson: string[] = []
  let derinlik = 0
  let bas = -1
  for (let i = 0; i < metin.length; i++) {
    const c = metin[i]
    if (c === '{') {
      if (derinlik === 0) bas = i
      derinlik += 1
    } else if (c === '}') {
      derinlik -= 1
      if (derinlik === 0 && bas >= 0) adaylarJson.push(metin.slice(bas, i + 1))
      if (derinlik < 0) derinlik = 0
    }
  }
  let veri: unknown = null
  for (const parca of [...adaylarJson].reverse()) {
    try {
      const denenen = JSON.parse(parca) as { konu?: unknown; secim?: unknown }
      if (typeof denenen.konu === 'string' || denenen.secim !== undefined) {
        veri = denenen
        break
      }
    } catch {
      // Bu aday JSON değil; sıradakine bak. Sessiz DEĞİL: hiçbiri tutmazsa `null`
      // dönüyor ve çağıran ham çıktıyı hataya koyuyor.
    }
  }
  if (veri === null) return null
  const o = veri as { konu?: unknown; secim?: unknown; gerekce?: unknown }
  const gerekce = typeof o.gerekce === 'string' ? o.gerekce.trim() : ''

  // ── numara yolu: istemin İSTEDİĞİ cevap ────────────────────────────────────
  //
  // Numara ya listededir ya değildir; "yakın başlık" diye bir şey yok. `"3"` de
  // kabul ediliyor çünkü modeller sayıyı sık sık dize olarak yazar ve bu, cevabın
  // ANLAMINI değiştirmez.
  const sira = typeof o.secim === 'number' ? o.secim : Number(o.secim)
  if (Number.isInteger(sira) && sira >= 1 && sira <= basliklar.length) {
    const baslik = basliklar[sira - 1]
    if (baslik !== undefined) return { konu: baslik, gerekce }
  }

  // ── başlık yolu: eski istemle üretilmiş kayıtlar ve numara yerine başlık
  // yazmakta ısrar eden çıktılar için ───────────────────────────────────────
  if (typeof o.konu !== 'string') return null
  // ⚠ **KENDİ BİÇİMİMİZE toleranslıyız, UYDURMAYA değil.** Model listede gösterdiğimiz
  // süslemeleri (baştaki `[tür]`, sondaki `(tür: …)`, satır numarası) kopyalayabiliyor
  // ve bu bir hata değil, istemi harfiyen uygulaması. Temizlik yalnız BİZİM
  // yazdığımız kalıpları soyuyor; sonuç yine adaylara karşı doğrulanıyor.
  const temiz = o.konu
    .trim()
    .replace(/^\d+[.)]\s*/, '')
    .replace(/^\[[^\]]*\]\s*/, '')
    .replace(/\s*\((?:tür|tur):[^)]*\)\s*$/i, '')
    .trim()
  if (basliklar.includes(temiz)) return { konu: temiz, gerekce }
  // ⚠ Son bir tolerans: TİRE ve BOŞLUK. Başlıklarda uzun tire (—) var ve modelin
  // yeniden yazarken kısa tire koyması bir uydurma değil, bir daktilo farkıdır.
  // Büyük/küçük harf DÖNÜŞTÜRÜLMÜYOR: Türkçede `i/İ` dönüşümü yerelsizdir ve bu
  // depoda ayrı bir kapı onu yasaklıyor.
  const sadelestir = (s: string): string =>
    s
      .replace(/[‐-―−]/g, '-')
      .replace(/\s+/g, ' ')
      .trim()
  const hedef = sadelestir(temiz)
  const esles = basliklar.find((b) => sadelestir(b) === hedef)
  if (esles !== undefined) return { konu: esles, gerekce }
  return null
}
