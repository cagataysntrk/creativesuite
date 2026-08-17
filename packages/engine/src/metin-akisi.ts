// `GENERATE`in metin girdisi ve çıktısı — dikişin iki yarısı (§5.3 · D-243 · FAZ-3.7b).
//
// **İki boşluk vardı ve ikisi de sessizdi:**
//
//   1. **Prompt'un kaynağı yoktu.** `topic` bir çalıştırma parametresi, kayıtlar
//      `SELECT`ten `input.inputs`e akıyor — ama hiçbir kod ikisini bir prompt'a
//      çevirmiyordu. `constraints['prompt']` hep boş kalıyor ve adaptör
//      `EMPTY_PROMPT` diyordu.
//   2. **Çıktı `COMPOSE`a ulaşmıyordu.** `composeBody` `{lines: string[]}` arıyor;
//      sağlayıcı çıktısı o şekilde değil. Bulamayınca **sessizce ham kayıtlara
//      düşüyordu** — yani model koşsa bile metni kullanılmıyordu ve bunu çıktıya
//      bakarak anlamak imkânsızdı.
//
// İkisi ayrı dosyalarda olsaydı biri düzeltilip diğeri unutulurdu; aynı dikişin iki
// ucu aynı yerde duruyor.
//
// **Neden `assembleContext` bunu yapmıyor:** o, hangi kaydın bütçeye SIĞDIĞINI
// hesaplıyor (köken ve planlama). Metni birleştirmek ayrı bir iş ve karıştırılırsa
// "bu kayıt neden düştü" ile "bu prompt neden böyle" tek cevaba sıkışır.

// ⚠ Düğüm tavanı ÇİZİCİDEN geliyor, burada tekrar YAZILMIYOR: iki yerde iki sayı
// tutmak, birini değiştirip diğerini unutmanın en kısa yolu. Çizici 5'ten fazlasını
// `too_many` ile reddediyor; ayrıştırıcı da aynı sınırı uyguluyor ki geçersiz bir blok
// hiç kurulmasın.
import { islevTavanlari, yayTalimati } from '@suite/contracts'
import { MAX_DUGUM } from '@suite/render'

/** Prompt'a giren kayıt — `SELECT` çıktısının şekli. */
export interface PromptKaydi {
  readonly id: string
  readonly text: string
}

export interface PromptGirdisi {
  readonly konu: string
  readonly kayitlar: readonly PromptKaydi[]
  readonly locale?: string
  readonly maxChars?: number
  /** Geçmiş redlerin gerekçesi — negatif kısıt (D-191). */
  readonly kacinilacak?: string
  /**
   * Görselin gireceği YUVA (FAZ-14.3). `undefined` ise plan hiçbir yuva işaretlememiş
   * demektir ve `gorselBriefPromptu` `null` döner — yani model HİÇ çağrılmaz.
   *
   * ⚠ Bu alanın varlık sebebi hattın en eski kusuru: `gorsel-uret` bugün `render`'dan
   * ÖNCE koşuyor ve brief'i `bilgi-sec`ten alıyor. Yani görsel, gireceği slaydı
   * GÖRMEDEN doğuyor — hangi satırın yanında duracağını, hangi alanın üstüne
   * oturacağını bilmiyor. Brief KONUDAN yazılıyor, oysa görselin desteklemesi gereken
   * şey konu değil O SATIR.
   */
  readonly yuva?: Yuva
}

/** Görselin gireceği yuvanın tarifi — brief bunu görerek yazılıyor. */
export interface Yuva {
  /** Yuvanın bulunduğu slaydın 0 tabanlı sırası. */
  readonly slaytIndex: number
  readonly toplam: number
  /** Yayda o slaydın işlevi (`kanit` gibi) — görselin ne yapması gerektiğini söyler. */
  readonly islev: string
  /** Yuvanın yanında duran satır. Görsel KONUYU değil BU CÜMLEYİ desteklemeli. */
  readonly satir: string
}

const baglamBloku = (kayitlar: readonly PromptKaydi[]): string =>
  kayitlar
    .filter((k) => k.text.trim() !== '')
    .map((k) => `[${k.id}]\n${k.text.trim()}`)
    .join('\n\n')

/**
 * Türkçe içerik metni için prompt.
 *
 * **Kaynak zorunlu:** kayıt yoksa prompt kurulmaz. Bağlamsız üretilen metin markadan
 * değil modelin genel bilgisinden gelir ve bunu çıktıya bakarak ayırt etmek zor —
 * `selectBody` zaten `NO_CONTEXT` ile duruyor, bu ikinci savunma hattı.
 *
 * **Sayı yasağı prompt'a YAZILIYOR.** Linter zaten yakalıyor (R-32) ama modelin
 * uydurmasını beklemek yerine baştan söylemek, bir turu ve bir insan bakışını
 * kurtarıyor.
 */
/**
 * Hedef slayt sayısı. Altı satır: kanca · gerilim · kanıt · kanıt · dönüş · davet.
 *
 * ⚠ Yayın ORTASI esnek (kanıt tekrarlanır), UÇLARI sabit — beş de altı da aynı hikâyeyi
 * taşır. Sayı burada duruyor çünkü prompt bir hedef vermek zorunda; yayın kendisi
 * `@suite/contracts`te ve her uzunlukta çalışıyor.
 */
const HEDEF_SATIR = 6

export const icerikPromptu = (g: PromptGirdisi): string | null => {
  const baglam = baglamBloku(g.kayitlar)
  if (g.konu.trim() === '' || baglam === '') return null

  const satirlar = [
    'Aşağıdaki marka bilgisine dayanarak bir sosyal medya gönderisi metni yaz.',
    '',
    `KONU: ${g.konu.trim()}`,
    '',
    'MARKA BİLGİSİ (yalnız buradaki bilgiyi kullan):',
    baglam,
    '',
    'BİÇİM (karosel — her satır BİR slayt olur, sırayla):',
    // ⚠ **Uzunluk disiplini prompt'ta olmak ZORUNDA.** Modelden serbest metin isteyip
    // sonra sayfalayıcıya "böl" demek, ilk slayta 12 satırlık bir metin duvarı
    // koyuyordu: kapak bir başlık değil, bir paragraf oluyordu. Sayfalayıcı taşmayı
    // böler (R-30: küçültmez) ama neyin BAŞLIK olduğunu bilemez — o bilgi ancak
    // metnin üretildiği yerde vardır.
    // ⚠ **YAY — dört eşit paragraf yerine bir HİKÂYE** (FAZ-14.1). Eskiden 2.–5. satırın
    // dördü de aynı 30 kelimelik bütçeyi paylaşıyordu; sonuç, her satırı aynı ağırlıkta
    // dört paragraftı. Referans örneklerin hiçbirinde olmayan tek şey buydu — hepsinde
    // satır uzunlukları hikâyenin evresine göre değişiyor.
    //
    // ⚠ Bütçeler BURADA YAZILI DEĞİL: `yayTalimati` onları `@suite/contracts`ten basıyor.
    // Elle yazılsaydı ölçüm ile prompt yeniden iki ayrı yerde tanımlanmış olurdu ve
    // `tasarim-olcum.ts`in eski yorumu (*"icerikPromptu ile AYNI sayılar"*) yine bir
    // temenni olarak kalırdı.
    ...yayTalimati(HEDEF_SATIR),
    '- Satırları numaralama, madde işareti koyma.',
    `- Toplam ${HEDEF_SATIR} satır. Bir KANIT satırını atlayıp ${HEDEF_SATIR - 1} satır da yazabilirsin.`,
    '',
    // ⚠ **Örnek ve sayım talimatı ÖLÇÜLEREK eklendi.** Yalnız "en fazla 8 kelime"
    // yazmak yetmedi: gerçek koşuda kapak 21, gövde 40 kelime geldi ve tasarım kapısı
    // varlığı reddetti. Kural prompt'ta vardı ama SAYILMASI istenmiyordu; bir üst sınır,
    // sayılmadığı sürece bir temennidir.
    'ÖRNEK BİÇİM (kelime sayıları buna benzemeli):',
    'Duruşun nedeni vardiya amirinin hafızasında',
    'Bir duruş yaşandı ve nedeni soruldu; cevap bir kayıtta değil, dün geceyi kapatan kişinin hatırladığı kadarıyla verildi.',
    'Aynı arıza üç hafta sonra tekrarladığında kimse ilkiyle bağlantısını kuramadı, çünkü ikisi de hiçbir yere yazılmamıştı.',
    'Kaydı olmayan bir duruş, olmamış bir duruştur.',
    '',
    '⚠ Yazmadan önce HER SATIRIN kelimesini say. Sınırı aşan satırı KISALT, bölme.',
    // ⚠ Sayı BURADA DA basılıyor, elle yazılmıyor — bağımsız doğrulama yakaladı:
    // `yayTalimati` tek kaynaktan basıyordu ama bu hatırlatmada `8` elle duruyordu.
    // `KANCA` 10'a çekilseydi prompt kendi kendisiyle çelişir ve hiçbir test kırmızıya
    // dönmezdi — bu adımın önlemeye çalıştığı ayrışmanın aynısı.
    `⚠ İlk satır bir başlıktır, bir paragraf değil: ${islevTavanlari().kanca} kelimeyi geçerse yeniden yaz.`,
    '',
    'KURALLAR:',
    `- Dil: ${g.locale ?? 'tr-TR'}. Doğal, abartısız, teknik ve somut.`,
    '- **Hiçbir sayısal iddia yazma.** Yüzde, oran, kat, "X kat hızlı" gibi ifadeler',
    '  yasak — kaynağı olmayan sayı yayınlanamaz.',
    '- "devrim niteliğinde", "çığır açan", "sektör lideri" gibi abartı terimleri kullanma.',
    '- Emoji kullanma. Hashtag kullanma.',
    ...(g.maxChars === undefined ? [] : [`- En fazla ${g.maxChars} karakter.`]),
    ...(g.kacinilacak === undefined || g.kacinilacak.trim() === ''
      ? []
      : ['', `KAÇIN (geçmiş redlerin gerekçesi): ${g.kacinilacak.trim()}`]),
    '',
    // ⚠ **AKIŞ, fotoğrafın yerini alıyor** (FAZ-11.1). Karosel görselliği stok fotoğrafla
    // değil VERİ ve ŞEMAYLA kuruluyor: dört referans örneğin hiçbirinde dikdörtgen
    // fotoğraf yok. `diagram` çizicisi repoda yazılı ve test edilmişti ama üretim hattı
    // hiç çağırmıyordu — fotoğraf, bağlı olan tek görsel yol olduğu için kullanılıyordu.
    //
    // Sayı İSTENMİYOR: `chart` bloğu veri noktası ister, R-32 kaynaksız sayıyı yasaklar
    // ve corpus'ta sayı yok. Akış diyagramı sayısızdır — engelsiz ve konuya uygun.
    'AKIŞ (ayrı bir bölüm, metinden SONRA yaz):',
    `Konu bir süreç, sıra ya da karşılaştırma içeriyorsa 3–${MAX_DUGUM} adımlık bir akış ver.`,
    'Biçim — her satır bir adım, `AKIŞ:` satırından sonra:',
    'AKIŞ: <başlık>',
    '- <adım adı> | <tek cümlelik çıktısı>',
    'Adım adı en fazla 3 kelime; çıktı en fazla 8 kelime. Sayı YAZMA.',
    'Konu akış içermiyorsa `AKIŞ:` bölümünü hiç yazma — zorlama.',
    '',
    'Yalnız metni döndür; açıklama, başlık ya da biçimlendirme ekleme.',
  ]
  return satirlar.join('\n')
}

/** Akış bölümünün ayrıştırılmış hâli — `COMPOSE` bunu `diagram` bloğuna çeviriyor. */
export interface AkisDugumu {
  readonly label: string
  readonly detail?: string
}
export interface Akis {
  readonly title: string
  readonly nodes: readonly AkisDugumu[]
}

/**
 * Metin çıktısından `AKIŞ:` bölümünü ayırır.
 *
 * **Satırlar KALDIRILIYOR**: akış satırları slayt metni olarak da basılırsa aynı bilgi
 * iki kez görünür. Ayrıştırıcı hem akışı hem TEMİZLENMİŞ satırları döndürüyor — iki uç
 * aynı yerde (D-243 gerekçesi).
 *
 * Diyagram çizicisi 2 düğümden az ve 6'dan fazlasını reddediyor; burada da aynı sınır
 * uygulanıyor ki geçersiz bir blok hiç kurulmasın.
 */
export const akisiAyir = (
  satirlar: readonly string[]
): { readonly satirlar: readonly string[]; readonly akis: Akis | null } => {
  const bas = satirlar.findIndex((l) => /^AKIŞ\s*:/i.test(l.trim()))
  if (bas === -1) return { satirlar, akis: null }

  const baslik = (satirlar[bas] ?? '').replace(/^AKIŞ\s*:/i, '').trim()
  const dugumler: AkisDugumu[] = []
  let son = bas
  for (let i = bas + 1; i < satirlar.length; i += 1) {
    const l = (satirlar[i] ?? '').trim()
    const m = /^[-•*]\s*(.+)$/.exec(l)
    if (m === null) break
    son = i
    const [ad, ayrinti] = (m[1] ?? '').split('|').map((x) => x.trim())
    if (ad === undefined || ad === '') continue
    dugumler.push(
      ayrinti === undefined || ayrinti === '' ? { label: ad } : { label: ad, detail: ayrinti }
    )
  }

  const temiz = [...satirlar.slice(0, bas), ...satirlar.slice(son + 1)]
  // Çizicinin sınırları: <2 tek düğüm sayılır, >6 taşar. Geçersizse akış YOK sayılıyor
  // ama satırlar yine temizleniyor — yarım bir akış metne geri düşerse çöp görünür.
  if (dugumler.length < 2 || dugumler.length > MAX_DUGUM) return { satirlar: temiz, akis: null }
  return { satirlar: temiz, akis: { title: baslik === '' ? 'Akış' : baslik, nodes: dugumler } }
}

/**
 * Görsel brief'ini İSTEYEN prompt — bir METİN modeline gider, görsel modeline değil.
 *
 * **Neden brief'i model yazıyor** (D-241): hat dosyasına sabit prompt yazmak içeriğe
 * kör bir görsel verir; Türkçe konuyu doğrudan görsel modeline vermek belirgin biçimde
 * kötü sonuç veriyor. Brief'i model yazınca R-20 (metin yasağı) ve 9. yasa (yapay
 * insan) kapılarının **ikisi de** o metnin üzerinden geçiyor.
 *
 * ⚠ Brief'in İngilizce istenmesi bir üslup tercihi değil: bake-off'ta ölçüldü.
 * Ve **insansız/metinsiz olması prompt'ta AÇIKÇA isteniyor** — kapılar yine de
 * duruyor, ama bir kapıya çarpmadan geçmek, çarpıp geri dönmekten ucuz.
 */
export const gorselBriefPromptu = (g: PromptGirdisi): string | null => {
  const baglam = baglamBloku(g.kayitlar)
  if (g.konu.trim() === '' || baglam === '') return null
  // ⚠ **YUVA YOKSA BRIEF DE YOK — ve bu bir maliyet kararı kadar bir tasarım kararı.**
  // Plan hiçbir slaytta `gorsel-yuvasi` işaretlememişse görsel üretmek, "her ihtimale
  // karşı bir görsel üret" demektir; D-261'in kusuru tam olarak buydu. `null` dönünce
  // `gorsel-uret` de brief bulamıyor ve zincir kendiliğinden sönüyor — koşucuya
  // "adım atla" yeteneği eklemeye gerek yok.
  if (g.yuva === undefined) return null

  return [
    'Write a single-paragraph ENGLISH prompt for a text-to-image model.',
    '',
    `TOPIC (Turkish): ${g.konu.trim()}`,
    '',
    // ⚠ **YUVA TARİFİ — brief artık nereye gireceğini biliyor.** Eskiden yalnız KONU
    // vardı ve görsel, altı slaytlık bir karoselin hangi cümlesinin yanında duracağını
    // bilmeden üretiliyordu. Görselin desteklemesi gereken şey konu değil O SATIR.
    'SLOT (where this image will be placed — support THIS line, not the topic in general):',
    `- It goes on slide ${g.yuva.slaytIndex + 1} of ${g.yuva.toplam}, whose role in the story is "${g.yuva.islev}".`,
    `- The line it sits beside (Turkish): ${g.yuva.satir.trim()}`,
    '- It fills the width of the text column and is cropped to fill; assume a portrait-ish',
    '  area and keep the subject centred with calm negative space around it.',
    '',
    'BRAND CONTEXT (Turkish, for understanding only — do not translate into the prompt):',
    baglam,
    '',
    'HARD RULES:',
    '- The scene must contain NO PEOPLE. No person, worker, engineer, face or crowd.',
    '- Every surface must be BARE and UNMARKED. Choose a subject whose surfaces carry',
    '  nothing printed, painted or engraved: raw metal, concrete, cable, pipe, machined',
    '  part. Avoid control panels, screens, packaging and shelving — they always carry',
    '  markings even when you do not intend it.',
    // ⚠ **MONOKROM AÇIKÇA isteniyor, "muted" YETMİYOR.** Kabul koşusunda ölçüldü: bir
    // fotoğraf mavi/turuncu makinelerle geldi ve amber marka alanının yanında çarpıştı.
    // Kullanıcının açık şartı "marka şablonunu korumalı, tutarlı olmalı hem kendi içinde
    // hem birbirleriyle" — doygun renkli bir fotoğraf bunu bozuyor.
    //
    // Ham doygunluk ÖLÇÜMÜ ayırt etmedi (iki geçerli örnek %34 ve %30, ikisi de yakın),
    // çünkü fotoğrafların büyük kısmı zaten gri. Ayırt eden şey markanın hue'sundan UZAK
    // doygun piksellerin payı olurdu — ama yarım tasarlanmış bir metrik yazmak yerine
    // KAYNAĞA gidildi: brief zaten renk isteyebiliyordu, istemiyordu.
    '- BLACK AND WHITE or near-monochrome. Desaturated, documentary, photographic.',
    '  No strong colour anywhere: no blue, orange, green or red equipment in view.',
    '  The image sits next to a warm amber brand field — saturated colour fights it.',
    '- Industrial subject, calm even lighting, matte surfaces.',
    '',
    // ⚠ **Yasak kelimeler prompt'un KENDİSİNDE geçmemeli.** R-20 kapısı görsel
    // prompt'unda `text`, `lettering`, `sign` gibi sözcükleri arıyor; brief'i yazan model
    // bu kelimeleri talimattan YANKILIYOR ve kapı kendi talimatımızı reddediyordu.
    // Gerçek koşuda oldu: `IMAGE_PROMPT_REJECTED · matched: "lettering"`. Kapı haklıydı —
    // hatalı olan, yasakladığı kelimeyi kullanan talimattı.
    '⚠ NEVER use these words in your output: text, lettering, sign, signage, label,',
    '  writing, word, letter, caption, watermark, logo. Do not negate them either —',
    '  describe a scene that simply has none, using only positive description.',
    '',
    'Return only the prompt, one paragraph, no quotes and no explanation.',
  ].join('\n')
}

/**
 * Sağlayıcı çıktısını `COMPOSE`un beklediği `{lines}` şekline çevirir.
 *
 * **Şekiller ÖLÇÜLEREK yazıldı**, varsayılmadı (D-227 dersi): Claude Code
 * `--output-format json` ile `{result: "..."}` döndürüyor; ayrıştırılamayan çıktı
 * `{text: "..."}` zarfına giriyor. İkisi de burada tanınıyor.
 *
 * `null` dönmek "metin yok" demek — ve çağıran bunu sessizce ham kayıtlara düşerek
 * değil, açıkça ele almak zorunda.
 */
export const metneCevir = (output: unknown): { readonly lines: readonly string[] } | null => {
  if (output === null || typeof output !== 'object') return null
  const o = output as Record<string, unknown>

  // ⚠ **ZATEN normalize edilmiş çıktı da tanınır.** `generateBody` metin adımının
  // çıktısını `{lines, raw}` yapıyor; bir sonraki adım (görsel) onu okurken ham
  // şekli arıyordu ve boş dönüyordu — **kendi iki fonksiyonum arasında şekil
  // uyuşmazlığı** (D-227'nin birebir tekrarı, bu kez üreticiyle tüketici aynı
  // dosyadaydı). Tek geçitten geçmek, iki şekli de burada tanımayı gerektiriyor.
  if (Array.isArray(o['lines'])) {
    const l = (o['lines'] as unknown[]).filter((x): x is string => typeof x === 'string')
    return l.length === 0 ? null : { lines: l }
  }

  const ham =
    typeof o['result'] === 'string'
      ? o['result']
      : typeof o['text'] === 'string'
        ? o['text']
        : typeof o['content'] === 'string'
          ? o['content']
          : null
  if (ham === null || ham.trim() === '') return null

  const lines = ham
    .split('\n')
    .map((s) => s.trim())
    .filter((s) => s !== '')
  return lines.length === 0 ? null : { lines }
}

/** `metneCevir` sonucundan tek satırlık düz metin — görsel brief'i böyle okunuyor. */
export const duzMetin = (output: unknown): string | null => {
  const m = metneCevir(output)
  return m === null ? null : m.lines.join(' ')
}
