// Görsel yargı — `image.critique` yeteneğinin iki ucu (§11.1 · FAZ-10.5 · D-256).
//
// **Neden var:** `tasarim` kapısı (FAZ-10.3) ölçülebileni ölçüyor — taşma, kontrast,
// kelime tavanı, komşu zemin. Ama bu fazda bulduğum kusurların yarısını HİÇBİR metrik
// görmedi ve ancak PNG'ye bakınca çıktılar: dev tırnak çerçevenin tepesinde kırpılıyordu,
// üste yaslı içerik sayaç bandıyla çakışmaya bir kelime uzaktaydı. İkisi de "sayıya
// dökülemez ama bakınca apaçık" sınıfındandı.
//
// ⚠ **SINIRLAYICI KUTU ZORUNLU.** Kutusuz bir bulgu reddediliyor ve bu tercih değil,
// bu turların ampirik sonucu: *"kompozisyon dengesiz"* eyleme çevrilemez, *"kapakta
// 120–460 px bandında metin eğri sınırını geçiyor"* çevrilebilir. Akademik taraf da
// aynı yerde (UICrit, ReLook): kritik yorumların bölgeye bağlanması, onları öneriden
// düzeltmeye çeviren şey.
//
// **Yeni bir YETENEK, yeni bir FİİL DEĞİL** (R-02): `GENERATE` altında koşuyor, ölçülüyor,
// maliyeti önden görünüyor, deftere yazılıyor. Dokuzuncu bir fiil eklemek, aynı işi
// yapan ikinci bir zamanlama/retry/maliyet yolu açardı.
//
// **İki uç aynı dosyada** — `metin-akisi.ts`teki gerekçeyle aynı (D-243): prompt ve
// ayrıştırıcı ayrı dosyalara konsaydı biri değişip diğeri unutulurdu ve çıktı sessizce
// düşerdi.

/** Kusur sınıfları — KAPALI liste. Serbest kategori toplanamaz, sayılamaz, izlenemez. */
export const YARGI_KATEGORILERI = [
  'kirpma',
  'cakisma',
  'hizalama',
  'kontrast',
  'bosluk',
  'tipografi',
] as const
export type YargiKategorisi = (typeof YARGI_KATEGORILERI)[number]

export const YARGI_SIDDETLERI = ['kritik', 'uyari'] as const
export type YargiSiddeti = (typeof YARGI_SIDDETLERI)[number]

export interface YargiBulgusu {
  /** 1 tabanlı slayt numarası — insana gösterilen sayıyla aynı. */
  readonly slayt: number
  /** `[x, y, genislik, yukseklik]`, piksel. Tuval dışına taşamaz. */
  readonly bolge: readonly [number, number, number, number]
  readonly kategori: YargiKategorisi
  readonly siddet: YargiSiddeti
  /** Türkçe, tek cümle. Ne YAPILACAĞINI değil ne OLDUĞUNU söyler. */
  readonly aciklama: string
}

export interface YargiSonucu {
  readonly bulgular: readonly YargiBulgusu[]
  /**
   * Geçersiz olduğu için ATILAN bulgu sayısı ve sebepleri.
   *
   * **Sessizce atılmıyor.** Atılsaydı model her turda kutusuz bulgu üretmeye devam eder
   * ve biz "temiz" raporunu gerçek sanardık — kapının kendisini kör etmenin en sessiz
   * yolu budur.
   */
  readonly reddedilen: readonly string[]
}

export interface YargiGirdisi {
  /** Slaytın MUTLAK yolu — model dosyayı kendisi okuyacak. */
  readonly yol: string
  /** 1 tabanlı. */
  readonly slayt: number
  readonly toplam: number
  readonly genislik: number
  readonly yukseklik: number
}

/**
 * Yargı prompt'u.
 *
 * **Kurallar prompt'a YAZILIYOR**, modelin genel estetik bilgisine bırakılmıyor: bu
 * karoselin kendi grameri var (D-254) ve o gramere göre doğru olan bir şey, genel
 * tasarım bilgisine göre yanlış görünebilir — örneğin hayalet rakamın kasten kırpılması.
 * Kuralı söylemeyip sonra "yanlış bulgu" demek, ölçülen şeyi değil ölçeni suçlamaktır.
 */
export const yargiPromptu = (g: YargiGirdisi): string =>
  [
    `Bu görseli oku ve tasarım kusurlarını bul: ${g.yol}`,
    '',
    `Bağlam: ${g.toplam} slaytlık bir Instagram karoselinin ${g.slayt}. slaydı.`,
    `Tuval ${g.genislik}×${g.yukseklik} piksel.`,
    '',
    'TASARIM GRAMERİ — bunlar KASITLIDIR, kusur DEĞİLDİR:',
    '- İki renk alanı ve aralarında akan bir eğri; eğri slayttan slayta taraf değiştirir.',
    '- Dev, yalnız konturlu bir rakam kenardan KIRPILMIŞ hâlde durur — bu bir tasarım',
    '  ögesidir, kırpma kusuru değildir.',
    '- Sağ üstte `#00N` sayacı, sol altta profil kulpu, sağ altta kaydırma işareti.',
    '- Geniş boşluk kasıtlıdır; "boş alan çok" tek başına kusur değildir.',
    '',
    'KUSUR ARA — özellikle şunlar:',
    '- Metnin renk alanı sınırını kesmesi (yarısı bir zeminde, yarısı diğerinde)',
    '- İki ögenin üst üste binmesi ya da binmeye çok yakın olması',
    '- Bir ögenin çerçeve kenarında istenmeden kırpılması',
    '- Okunamayacak kadar düşük kontrast',
    '- Hizasız kenarlar, tutarsız boşluk ritmi',
    '',
    'ÇIKTI BİÇİMİ — yalnız JSON dizisi, başka hiçbir şey yazma:',
    '[{"bolge":[x,y,genislik,yukseklik],"kategori":"...","siddet":"...","aciklama":"..."}]',
    '',
    `kategori şunlardan biri: ${YARGI_KATEGORILERI.join(' | ')}`,
    `siddet şunlardan biri: ${YARGI_SIDDETLERI.join(' | ')}`,
    'bolge: kusurun bulunduğu dikdörtgen, PİKSEL cinsinden, tuval içinde.',
    'aciklama: tek Türkçe cümle, ne olduğunu söyle; çözüm önerme.',
    '',
    '⚠ Sınırlayıcı kutusu olmayan bulgu KABUL EDİLMEZ. Bir kusuru konumlandıramıyorsan',
    'onu yazma. Kusur yoksa boş dizi döndür: []',
  ].join('\n')

const sayiMi = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v)

/**
 * Sağlayıcı çıktısını bulgulara çevirir.
 *
 * **Şekiller ÖLÇÜLEREK tanınıyor** (D-227 ailesi): Claude Code `--output-format json`
 * ile `{result: "..."}` döndürüyor ve `result` içindeki metin genellikle kod bloğu
 * çitiyle sarılı geliyor. İkisi de burada ele alınıyor.
 */
export const yargiyaCevir = (
  output: unknown,
  slayt: number,
  boyut: { readonly genislik: number; readonly yukseklik: number }
): YargiSonucu => {
  const reddedilen: string[] = []

  const ham =
    typeof output === 'string'
      ? output
      : output !== null && typeof output === 'object'
        ? ((): string | null => {
            const o = output as Record<string, unknown>
            for (const k of ['result', 'text', 'content']) {
              const v = o[k]
              if (typeof v === 'string') return v
            }
            return null
          })()
        : null

  if (ham === null) return { bulgular: [], reddedilen: ['çıktıda metin alanı yok'] }

  // Kod bloğu çiti ve çevresindeki nesir soyuluyor: ilk `[` ile son `]` arası.
  const bas = ham.indexOf('[')
  const son = ham.lastIndexOf(']')
  if (bas === -1 || son <= bas) {
    return { bulgular: [], reddedilen: ['çıktıda JSON dizisi bulunamadı'] }
  }

  let ayrisan: unknown
  try {
    ayrisan = JSON.parse(ham.slice(bas, son + 1))
  } catch {
    return { bulgular: [], reddedilen: ['JSON ayrıştırılamadı'] }
  }
  if (!Array.isArray(ayrisan)) return { bulgular: [], reddedilen: ['JSON bir dizi değil'] }

  const bulgular: YargiBulgusu[] = []
  for (const [i, x] of ayrisan.entries()) {
    if (x === null || typeof x !== 'object') {
      reddedilen.push(`#${i}: nesne değil`)
      continue
    }
    const o = x as Record<string, unknown>
    const b = o['bolge']

    // ⚠ Kutu kontrolü ÖNCE ve TAVİZSİZ. Kutusuz bulgu, eyleme çevrilemeyen bir yorumdur.
    if (!Array.isArray(b) || b.length !== 4 || !b.every(sayiMi)) {
      reddedilen.push(`#${i}: sınırlayıcı kutu yok ya da bozuk`)
      continue
    }
    const [bx, by, bw, bh] = b as [number, number, number, number]
    if (bw <= 0 || bh <= 0) {
      reddedilen.push(`#${i}: kutu genişliği/yüksekliği sıfır ya da negatif`)
      continue
    }
    // Tuval dışı bir kutu, modelin ölçeği kaçırdığını gösterir; kabul etmek o bulguyu
    // yanlış bir yere işaret eden bir ok yapardı.
    if (bx < 0 || by < 0 || bx + bw > boyut.genislik || by + bh > boyut.yukseklik) {
      reddedilen.push(`#${i}: kutu tuval dışına taşıyor (${bx},${by},${bw},${bh})`)
      continue
    }

    const kategori = o['kategori']
    if (typeof kategori !== 'string' || !YARGI_KATEGORILERI.includes(kategori as YargiKategorisi)) {
      reddedilen.push(`#${i}: kategori kapalı listede yok: ${String(kategori)}`)
      continue
    }
    const siddet = o['siddet']
    if (typeof siddet !== 'string' || !YARGI_SIDDETLERI.includes(siddet as YargiSiddeti)) {
      reddedilen.push(`#${i}: şiddet kapalı listede yok: ${String(siddet)}`)
      continue
    }
    const aciklama = o['aciklama']
    if (typeof aciklama !== 'string' || aciklama.trim() === '') {
      reddedilen.push(`#${i}: açıklama boş`)
      continue
    }

    bulgular.push({
      slayt,
      bolge: [bx, by, bw, bh],
      kategori: kategori as YargiKategorisi,
      siddet: siddet as YargiSiddeti,
      aciklama: aciklama.trim(),
    })
  }

  return { bulgular, reddedilen }
}

/** İnsan okunur tek satır — teslimat görünümü ve tur çıktısı için. */
export const bulguSatiri = (b: YargiBulgusu): string =>
  `slayt ${b.slayt} · ${b.siddet === 'kritik' ? '✗' : '⚠'} ${b.kategori} ` +
  `[${b.bolge.join(',')}] ${b.aciklama}`
