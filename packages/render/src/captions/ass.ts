// `.ass` karaoke altyazı yazıcısı (§7.5 · FAZ-5.5).
//
// **Neden `.ass` ve neden kelime bazlı:** SRT yalnız satır zamanlar; karaoke vurgusu
// (konuşulan kelimenin öne çıkması) kelime başına zaman ister ve ASS bunu `\k`
// etiketiyle veriyor. Kısa dikey videoda okuma hızı sınırlı; vurgulanan kelime,
// izleyicinin nereye bakacağını söyler.
//
// **Bu dosya ASR YAPMAZ.** Girdi zaten kelime zamanlarıdır: nereden geldiği
// (Groq whisper-large-v3, yerel whisper.cpp, ya da elle yazılmış) burayı ilgilendirmez.
// Ayrım kasıtlı — yazıcı saf ve tam test edilebilir kalıyor, ASR bağlantısı ayrı bir
// adım (`5.5b`).
//
// **Türkçe tuzağı:** ASS dosyası UTF-8 ve `ı ğ ş İ Ö Ç` doğrudan yazılır; hiçbir
// kaçış YOK. Latin-1'e düşen bir yazıcı `ğ`yi sessizce `g` yapar ve bunu ancak
// video izlenirken fark edersiniz. Test kanıt dizesini bayt bayt doğruluyor.

/** Bir kelimenin konuşulduğu aralık. Saniye, çünkü ASR çıktıları saniye verir. */
export interface WordTiming {
  readonly text: string
  readonly start: number
  readonly end: number
}

export interface CaptionLine {
  readonly words: readonly WordTiming[]
}

export type AssError =
  | { readonly kind: 'empty' }
  | { readonly kind: 'negative_time'; readonly word: string }
  /** Bitiş başlangıçtan önce — ASR bunu üretebilir ve sessizce geçerse altyazı kayar. */
  | { readonly kind: 'reversed'; readonly word: string }
  /** İki kelime çakışıyor: karaoke vurgusu iki yerde birden yanar. */
  | { readonly kind: 'overlap'; readonly word: string }

export type AssResult =
  | { readonly ok: true; readonly value: string }
  | { readonly ok: false; readonly errors: readonly AssError[] }

/** ASS zaman biçimi: `s:mm:ss.cc` — santisaniye, milisaniye DEĞİL. */
const assTime = (saniye: number): string => {
  const cs = Math.round(saniye * 100)
  const s = Math.floor(cs / 100) % 60
  const dk = Math.floor(cs / 6000) % 60
  const sa = Math.floor(cs / 360000)
  const kalan = cs % 100
  const iki = (n: number): string => String(n).padStart(2, '0')
  return `${sa}:${iki(dk)}:${iki(s)}.${iki(kalan)}`
}

/**
 * Satırı doğrular. **Hatalar DEĞER, istisna değil** (§8.6): bozuk bir zamanlama
 * çalıştırmayı düşürmemeli, operatöre gösterilmeli — ASR'nin ürettiği bir hatayı
 * insan düzeltir, süreç değil.
 */
const dogrula = (satirlar: readonly CaptionLine[]): readonly AssError[] => {
  const hatalar: AssError[] = []
  const kelimeler = satirlar.flatMap((s) => s.words)
  if (kelimeler.length === 0) return [{ kind: 'empty' }]

  let oncekiSon = -Infinity
  for (const k of kelimeler) {
    if (k.start < 0 || k.end < 0) hatalar.push({ kind: 'negative_time', word: k.text })
    else if (k.end < k.start) hatalar.push({ kind: 'reversed', word: k.text })
    else if (k.start < oncekiSon) hatalar.push({ kind: 'overlap', word: k.text })
    oncekiSon = Math.max(oncekiSon, k.end)
  }
  return hatalar
}

/**
 * Karaoke `.ass` üretir.
 *
 * Stil marka token'larından GELMEZ ve gelmemeli: ASS kendi renk biçimini kullanıyor
 * (`&HBBGGRR`) ve token'ları oraya çevirmek, ikinci bir renk gerçeği yaratırdı. Altyazı
 * rengi kasten sade — beyaz metin, siyah kenar — çünkü her arka planda okunmak zorunda
 * ve marka rengi bunu garanti etmez.
 */
export const toAss = (
  satirlar: readonly CaptionLine[],
  opts: { readonly width: number; readonly height: number }
): AssResult => {
  const hatalar = dogrula(satirlar)
  if (hatalar.length > 0) return { ok: false, errors: hatalar }

  const bas = [
    '[Script Info]',
    'ScriptType: v4.00+',
    `PlayResX: ${opts.width}`,
    `PlayResY: ${opts.height}`,
    'WrapStyle: 2',
    '',
    '[V4+ Styles]',
    'Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour,' +
      ' BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle,' +
      ' BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding',
    // Encoding 1 = varsayılan; UTF-8 dosya kodlaması ayrı ve zaten UTF-8 yazıyoruz.
    'Style: Alt,Arial,48,&H00FFFFFF,&H0000FFFF,&H00000000,&H00000000,0,0,0,0,' +
      '100,100,0,0,1,3,0,2,40,40,80,1',
    '',
    '[Events]',
    'Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text',
  ]

  const olaylar = satirlar.map((satir) => {
    const ilk = satir.words[0]
    const son = satir.words[satir.words.length - 1]
    if (ilk === undefined || son === undefined) return ''
    // `\k` süresi SANTİSANİYE ve kelimenin KENDİ süresi kadar — toplam değil.
    const metin = satir.words
      .map((w) => `{\\k${Math.max(0, Math.round((w.end - w.start) * 100))}}${w.text}`)
      .join(' ')
    return `Dialogue: 0,${assTime(ilk.start)},${assTime(son.end)},Alt,,0,0,0,,${metin}`
  })

  return { ok: true, value: `${[...bas, ...olaylar].join('\n')}\n` }
}

export const assHataMesaji = (e: AssError): string => {
  switch (e.kind) {
    case 'empty':
      return 'altyazı boş — kelime zamanlaması yok'
    case 'negative_time':
      return `'${e.word}' negatif zaman taşıyor`
    case 'reversed':
      return `'${e.word}' bitişi başlangıcından önce — altyazı kayar`
    case 'overlap':
      return `'${e.word}' önceki kelimeyle çakışıyor — karaoke vurgusu iki yerde yanar`
  }
}
