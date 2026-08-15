// Görsel prompt'unun kurulduğu **TEK** yer (§7.3 · R-20 · D-3).
//
// **Görsel modeline Türkçe metin çizdirilmez.** Bu, on iki değişmez yasadan biri
// (CLAUDE.md §3) ve gerekçesi bir tercih değil bir kabul: Ideogram kendi dokümanında
// aksanlı Latin'i "hiç render edemeyebileceğini" yazıyor. `ğ ü ş ı ö ç İ` bir görsel
// modelinden çıktığında ya bozuk ya eksik çıkar — ve bozuk bir harf, bozuk bir marka
// demektir. Metin GERÇEK fontla, render motorunda kompozit edilir (§7.1).
//
// Kural iki yönlü zorlanır:
//   1. Her prompt'a **"no text, no lettering"** eki eklenir — istisnasız
//   2. Metin İSTEYEN prompt **reddedilir** — ek yeterli değil, çünkü "üstünde 'FİRE'
//      yazan tabela" isteyen bir prompt'a "no text" eklemek modele çelişki gönderir
//      ve çelişkide model genellikle ilk isteği dinler
//
// İkinci maddeyi atlamak, kuralı "eklendi ama işlemedi" hâline getirirdi: kapı yeşil,
// çıktı bozuk. Kapıların en tehlikeli hâli budur.

import type { AppError } from '@suite/contracts'
import { err, ok, type Result } from '@suite/contracts'
import { makeError, foldForSearch } from '@suite/kernel'

/**
 * Her prompt'un sonuna eklenen ek. İngilizce, çünkü görsel modellerinin talimat dili
 * İngilizce ve Türkçe bir "metin yok" talimatı bu modellerde güvenilir çalışmıyor
 * (D-37: kod ve model talimatı İngilizce, insan metni Türkçe).
 */
export const NO_TEXT_SUFFIX =
  'no text, no lettering, no words, no captions, no watermark, no logo, no signage'

/**
 * Metin isteyen ifadeler. **Diyakritik-katlanmış** aranır (`foldForSearch`): "yazı"
 * ile "yazi", "Yazı" ile "YAZI" aynı şeydir ve kullanıcı hangisini yazdıysa kural
 * çalışmak zorunda. Katlamasız bir liste, `ı`/`i` ayrımında sessizce yarım kalırdı.
 *
 * **Türkçe desenler GÖVDE ÖN EKİDİR, tam kelime değil.** Ek listesi yazmak burada
 * çalışmıyor: `harf` · `harfler` · `harflerle` · `harflerinin`… Sonlu bir ek listesi
 * her zaman bir sonraki eki kaçırır ve kaçırdığı gün kapı sessizce yarım kalır.
 * `\w*` ile bitirmek eklemeli dilde tek doğru yaklaşım.
 *
 * Tek istisna `yazilim`: "yazılım çözümleri" bu şirketin kendi sözlüğü ve `yazi\w*`
 * onu yakalardı. Yanlış pozitif de bir hatadır — sürekli alarm veren kapı, kapatılan
 * kapıdır.
 */
const METIN_ISTEYEN: readonly { readonly desen: RegExp; readonly ornek: string }[] = [
  // Türkçe — gövde ön eki (eklemeli yapı)
  { desen: /\byazi(?!lim)\w*/, ornek: 'yazı / yazılı / yazısıyla' },
  { desen: /\bmetin\w*/, ornek: 'metin' },
  { desen: /\bharf\w*/, ornek: 'harf / harflerle' },
  { desen: /\bkelime\w*/, ornek: 'kelime' },
  { desen: /\bslogan\w*/, ornek: 'slogan' },
  { desen: /\bbaslik\w*/, ornek: 'başlık' },
  { desen: /\blogo\w*/, ornek: 'logo' },
  { desen: /\btabela\w*/, ornek: 'tabela' },
  { desen: /\bpankart\w*/, ornek: 'pankart' },
  { desen: /\bafis\w*/, ornek: 'afiş' },
  { desen: /\bibare\w*/, ornek: 'ibare' },
  { desen: /\blevha\w*/, ornek: 'levha' },
  // ⚠ `pano` KASITLI olarak listede YOK: Türkçe'de iki anlamlı — hem "ilan panosu"
  // (metin) hem "kumanda panosu" (ekipman). `PLC panosunun yakın çekimi` meşru bir
  // sanayi prompt'u ve onu reddetmek yanlış pozitif olurdu. "Panoda ÖLÇÜM" gibi gerçek
  // ihlaller zaten BÜYÜK HARF ve tırnak yakalayıcılarına takılıyor.
  { desen: /\bbaski\w*|\bbasili\w*/, ornek: 'baskı / basılı' },
  { desen: /\brakam\w*/, ornek: 'rakam' },
  { desen: /\bbasamak\w*/, ornek: 'basamak' },
  { desen: /\bcumle\w*/, ornek: 'cümle' },
  { desen: /\bustunde .* yaz/, ornek: 'üstünde … yazan' },
  // İngilizce — prompt'lar karışık dilde yazılabiliyor
  { desen: /\btext\b/, ornek: 'text' },
  { desen: /\blettering\b/, ornek: 'lettering' },
  { desen: /\bcaption\b/, ornek: 'caption' },
  { desen: /\btypography\b/, ornek: 'typography' },
  { desen: /\bwritten\b/, ornek: 'written' },
  { desen: /\bsays? ["']/, ornek: 'says "…"' },
  { desen: /\bword(s|ing)?\b/, ornek: 'word' },
  { desen: /\bsign(age|board)\b/, ornek: 'signage' },
  { desen: /\bwatermark\b/, ornek: 'watermark' },
]

/**
 * Sanayide meşru kısaltmalar. Bunlar BÜYÜK HARF kuralından muaf: "CNC tezgâhı" bir
 * metin isteği değil, bir makine adı.
 *
 * Liste kısa ve KAPALI: uzadıkça büyük harf kuralı erir. Yeni bir kısaltma eklemek
 * bilinçli bir karar olmalı.
 */
const MESRU_KISALTMALAR = new Set([
  'cnc',
  'iso',
  'kvkk',
  'erp',
  'mes',
  'oee',
  'plc',
  'scada',
  'led',
  'uv',
  'hd',
  '4k',
  '8k',
  'ai',
  'ml',
  'kw',
  'mm',
  'cm',
])

/**
 * TIRNAK İÇİ metin — görsel prompt'unda neredeyse her zaman "şunu yaz" demektir.
 * `ekranda "%12 fire" görünüyor` gibi bir prompt hiçbir metin kelimesi içermez ama
 * tam olarak metin ister.
 */
const TIRNAK_ICI = /["“”'']\s*\S[^"“”'']{0,80}["“”'']/

/**
 * BÜYÜK HARFLE yazılmış üç+ harfli kelime. `FİRE`, `ÖLÇÜM`, `UPCYTECH` — hepsi
 * "bunu böyle yaz" demenin kelimesiz hâli.
 *
 * Meşru sanayi kısaltmaları hariç (yukarıdaki kapalı liste). Türkçe büyük harfler
 * dahil: `ĞÜŞİÖÇ` ASCII `[A-Z]` ile yakalanmaz ve tam da onlar kaçardı.
 */
const BUYUK_HARF = /(?:^|[^\p{L}])(\p{Lu}{3,})(?![\p{Ll}])/gu

export type PromptRefusal =
  | { readonly kind: 'empty' }
  | { readonly kind: 'requests_text'; readonly matched: string }
  /** Kullanıcı eki ELLE yazmış: ek tek bir yerden gelmeli, yoksa iki kaynak doğar. */
  | { readonly kind: 'suffix_hand_written' }

export interface ImagePrompt {
  /** Modele giden tam metin — ek DAHİL. */
  readonly text: string
  /** Ek olmadan hâli — manifest'e bu yazılır, okunabilir kalsın diye. */
  readonly base: string
}

const reddet = (r: PromptRefusal, correlationId: string): AppError =>
  makeError({
    kind: 'policy_blocked',
    code: 'IMAGE_PROMPT_REJECTED',
    userMessageKey: 'error.image.promptRejected',
    correlationId: correlationId as AppError['correlationId'],
    details: { refusal: r, rule: 'R-20' },
  })

/**
 * Görsel prompt'u kurar. **Bunun dışında hiçbir yerde görsel prompt'u birleştirilmez**
 * (`chokepoints.json` → `gorsel-prompt-kurucu`).
 *
 * `NO_TEXT_SUFFIX` zaten yazılmışsa reddedilir: ekin tek bir kaynağı olmalı. İki kaynak
 * olduğu gün biri güncellenir, diğeri güncellenmez ve hangi prompt'un hangi eki taşıdığı
 * ancak çıktıya bakarak anlaşılır — yani üretim yapıldıktan sonra.
 */
export const buildImagePrompt = (
  base: string,
  correlationId: string
): Result<ImagePrompt, AppError> => {
  const temiz = base.trim()
  if (temiz === '') return err(reddet({ kind: 'empty' }, correlationId))

  const katlanmis = foldForSearch(temiz)
  if (katlanmis.includes(foldForSearch('no text'))) {
    return err(reddet({ kind: 'suffix_hand_written' }, correlationId))
  }

  for (const { desen, ornek } of METIN_ISTEYEN) {
    if (desen.test(katlanmis)) {
      return err(reddet({ kind: 'requests_text', matched: ornek }, correlationId))
    }
  }

  // Tırnak içi metin: kelimesiz metin isteği. `ekranda "%12 fire" görünüyor` hiçbir
  // metin kelimesi içermez ama tam olarak metin ister.
  if (TIRNAK_ICI.test(temiz)) {
    return err(reddet({ kind: 'requests_text', matched: 'tırnak içi metin' }, correlationId))
  }

  // BÜYÜK HARF: `FİRE`, `ÖLÇÜM`, `UPCYTECH`. Meşru sanayi kısaltmaları hariç.
  BUYUK_HARF.lastIndex = 0
  for (const m of temiz.matchAll(BUYUK_HARF)) {
    const kelime = m[1] as string
    if (!MESRU_KISALTMALAR.has(foldForSearch(kelime))) {
      return err(
        reddet({ kind: 'requests_text', matched: `BÜYÜK HARF "${kelime}"` }, correlationId)
      )
    }
  }

  return ok({ base: temiz, text: `${temiz}, ${NO_TEXT_SUFFIX}` })
}

/**
 * Üretilmiş bir prompt'un eki taşıdığını doğrular.
 *
 * Neden ayrı bir fonksiyon: adaptör prompt'u kendi kurmasın diye kurucu tek yerde, ama
 * adaptörün de "bana gelen bu metin gerçekten kurucudan mı geçmiş" diye soracak bir yolu
 * olmalı. İkinci savunma hattı — ilkinin atlandığı günü yakalar.
 */
export const hasNoTextSuffix = (prompt: string): boolean => prompt.endsWith(NO_TEXT_SUFFIX)
