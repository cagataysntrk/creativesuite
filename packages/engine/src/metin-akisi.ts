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
    '- 1. satır = KAPAK: en fazla 8 kelime. Nokta koyma. İddia ya da soru.',
    '- 2.–5. satır = GÖVDE: her biri tek fikir, en fazla 30 kelime.',
    '- Son satır = KAPANIŞ: tek cümle, en fazla 14 kelime. Davet ya da sonuç.',
    '- Toplam 5 ya da 6 satır. Satırları numaralama, madde işareti koyma.',
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
    'Yalnız metni döndür; açıklama, başlık ya da biçimlendirme ekleme.',
  ]
  return satirlar.join('\n')
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

  return [
    'Write a single-paragraph ENGLISH prompt for a text-to-image model.',
    '',
    `TOPIC (Turkish): ${g.konu.trim()}`,
    '',
    'BRAND CONTEXT (Turkish, for understanding only — do not translate into the prompt):',
    baglam,
    '',
    'HARD RULES:',
    '- The scene must contain NO PEOPLE. No person, worker, engineer, face or crowd.',
    '- The scene must contain NO TEXT: no signage, no labels, no screens showing text,',
    '  no dashboards, no weighbridge displays, no shelf labels. Pick a subject that',
    '  naturally has no lettering in it.',
    '- Industrial, documentary, photographic. Muted neutral palette, calm lighting.',
    '- Do not write the words "no text" or "without people" — describe a scene that',
    '  simply has neither.',
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
