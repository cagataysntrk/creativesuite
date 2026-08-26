// HEDEF: apps/server/src/yayin-paketi.ts
//
// Bir gönderinin YAYINA HAZIR KLASÖRÜ — yayıncıya yüklenecek çıktı (FAZ-19.13 · UX-14).
//
// ⚠ ⚠ **BU DEPO ARTIK BİR YAYIN ARACI DEĞİL, BİLEREK.** Depo sahibi araştırmayı görüp
// karar verdi: *"bu paylaşım yayın işini manuel yapalım, Buffer/Postiz gibi bir bulut
// aracı kullanırım; biz yayın kısmını hatırlatıcı ve takvim planlaması gibi kullanırız,
// gerçek bir yayın aracı yapmayız."* Karar sağlamdı, çünkü ölçüm şunu söylüyordu:
//
//   · Instagram API'sinde ZAMANLAMA YOK — kap oluştur, sonra `media_publish`; üstelik
//     kap 24 saatte doluyor. Meta kendi belgesinde *"if your app allows app users to
//     schedule posts"* diyor: zamanlayıcı UYGULAMANINDIR, platformun değil.
//   · LinkedIn'de `SCHEDULED` yaşam döngüsü yok (`PUBLISHED`/`DRAFT`/`PROCESSING`).
//   · X'te zamanlanmış gönderi yalnız Ads API'de.
//   · Yalnız Facebook gerçekten platform tarafında zamanlıyor (`scheduled_publish_time`).
//
// Yani "platformun takvimine eşitlendi" üç platformda var olmayan bir şey. Kendi
// zamanlayıcımızı yazmak ise Yasa 12'ye çarpıyordu: makine kapalıyken gönderi gitmez.
//
// ⚠ ⚠ **SIRA BU DOSYANIN ASIL İŞİ.** Dosya adları `01`, `02`, … ve sıra `teslimat.index`
// damgasından geliyor — `createdAt` DEĞİL: zaman damgaları milisaniyede eşitlenebiliyor
// ve bu depoda tam olarak öyle oldu (`dizin` koşusunda iki slayt aynı milisaniyede).
// Yayıncıya yanlış sırada yüklenen bir karosel, yanlış yayınlanmış bir karoseldir.
//
// ⚠ Klasör TÜRETİLMİŞTİR (Yasa 11): silinebilir, yeniden üretilir. Doğruluk
// `derived/blobs` + koşu defteridir.

import { copyFileSync, existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { PLATFORMLAR, slug } from '@suite/contracts'
import { kusuruYaz } from '@suite/engine'
import { platformDenetle } from '@suite/contracts'
import { kosuSablonu } from './kosu-sablonu.js'

/** Paketlerin kökü — türetilmiş, gitignore'lu. */
export const PAKET_KOK = 'derived/yayin-paketleri'

export interface PaketSlayti {
  readonly digest: string
  readonly sira: number
  readonly toplam: number
  readonly rol: string
  readonly olcu: string | null
}

export interface PaketGirdisi {
  readonly runId: string
  readonly slaytlar: readonly PaketSlayti[]
  readonly metinler: Readonly<Record<string, string>>
  /** Planlanan tarih (`YYYY-MM-DD`). Yoksa koşunun tarihi kullanılıyor. */
  readonly tarih: string
  readonly platformlar: readonly string[]
}

export type PaketSonucu =
  | {
      readonly ok: true
      readonly klasor: string
      readonly slayt: number
      readonly eksik: readonly string[]
    }
  | { readonly ok: false; readonly hata: string }

/**
 * Blob deposundaki baytın gerçek yolu.
 *
 * ⚠ Uzantı diskteki addan okunuyor, VARSAYILMIYOR: depoda png de jpg de var ve
 * `.png` diye sabitlemek jpg'leri sessizce atlardı.
 */
const blobYolu = (repoRoot: string, digest: string): string | null => {
  const d = digest.replace(/^sha256:/, '')
  if (!/^[0-9a-f]{64}$/.test(d)) return null
  const dizin = join(repoRoot, 'derived/blobs', d.slice(0, 2))
  if (!existsSync(dizin)) return null
  const ad = readdirSync(dizin).find((f) => f.startsWith(`${d}.`) && !f.endsWith('.meta.json'))
  return ad === undefined ? null : join(dizin, ad)
}

/**
 * Gönderi klasörünü yazar ve yolunu döner.
 *
 * ⚠ ⚠ **EKSİK OLAN GİZLENMİYOR, YAZILIYOR.** Bir platformun metni yoksa klasörde o
 * dosya olmuyor ve `GONDERI.md` bunu *"— YAZILMADI"* diye söylüyor. Boş bir dosya
 * yazmak, yayıncıya boş açıklamayla yüklenen bir gönderi demekti.
 */
export const yayinPaketiYaz = (repoRoot: string, g: PaketGirdisi): PaketSonucu => {
  const kimlik = kosuSablonu(repoRoot, g.runId)
  const sablon = kimlik.gercek ?? kimlik.istenen ?? 'sablonsuz'
  const konu = kimlik.konu ?? ''
  if (g.slaytlar.length === 0)
    return { ok: false, hata: 'bu koşunun slaytı yok — paketlenecek bir şey yok' }

  // ⚠ Klasör adı TARİHLE BAŞLIYOR: yayıncıya yükleme sırası takvim sırasıdır ve
  // dosya yöneticisi adı alfabetik sıralar. Konu ikinci, çünkü "hangisiydi" sorusu
  // tarihten sonra gelir.
  const ad = `${g.tarih}__${slug(sablon)}__${slug(konu === '' ? g.runId.slice(4, 16) : konu).slice(0, 60)}`
  const klasor = join(repoRoot, PAKET_KOK, ad)
  mkdirSync(klasor, { recursive: true })

  // ── slaytlar, TESLİMAT SIRASINDA ───────────────────────────────────────────
  const sirali = [...g.slaytlar].sort((a, b) => a.sira - b.sira)
  const eksik: string[] = []
  let yazilan = 0
  for (const [i, s] of sirali.entries()) {
    const kaynak = blobYolu(repoRoot, s.digest)
    if (kaynak === null) {
      eksik.push(`slayt ${String(i + 1)}: bayt bulunamadı (${s.digest.slice(0, 16)})`)
      continue
    }
    const uzanti = kaynak.slice(kaynak.lastIndexOf('.'))
    copyFileSync(kaynak, join(klasor, `${String(i + 1).padStart(2, '0')}${uzanti}`))
    yazilan += 1
  }

  // ── platform metinleri ─────────────────────────────────────────────────────
  const secili = g.platformlar.length === 0 ? PLATFORMLAR.map((p) => p.id) : g.platformlar
  const satirlar: string[] = []
  for (const p of PLATFORMLAR) {
    if (!secili.includes(p.id)) continue
    const m = (g.metinler[p.id] ?? '').trim()
    if (m === '') {
      eksik.push(`${p.ad}: gönderi metni YAZILMADI`)
      satirlar.push(`- **${p.ad}** — ⚠ metin YAZILMADI`)
      continue
    }
    writeFileSync(join(klasor, `${p.id}.txt`), m + '\n', 'utf8')
    const kusur = platformDenetle(m, sirali.length, p).map((k) => kusuruYaz(k, p.ad))
    satirlar.push(
      `- **${p.ad}** → \`${p.id}.txt\` · ${String([...m].length)}/${String(p.metinTavani)} karakter` +
        (kusur.length === 0 ? '' : `\n  - ⚠ ${kusur.join('\n  - ⚠ ')}`)
    )
  }

  // ── insanın okuyacağı özet ─────────────────────────────────────────────────
  //
  // ⚠ ⚠ **BU DOSYA BİR SÜS DEĞİL.** Klasörü aylar sonra açan insan, hangi slaytın
  // kapak olduğunu ve hangi metnin nereye gideceğini dosya adlarından çıkaramaz.
  // ⚠ Müzik hatırlatması BURADA, çünkü müziği yalnız insan ekleyebiliyor ve yayından
  // sonra DEĞİŞTİREMİYOR — kâğıtta kalan bir kural ihlal edilen bir kuraldır.
  const belge = [
    `# ${konu === '' ? g.runId : konu}`,
    '',
    `- **planlanan tarih:** ${g.tarih}`,
    `- **şablon:** ${sablon}`,
    `- **koşu:** \`${g.runId}\``,
    `- **slayt:** ${String(yazilan)}/${String(sirali.length)}` +
      (sirali[0]?.olcu === undefined || sirali[0].olcu === null ? '' : ` · ${sirali[0].olcu}`),
    `- **platformlar:** ${secili.join(' · ')}`,
    '',
    '## Karosel sırası',
    '',
    '⚠ Dosya adlarındaki numara TESLİMAT SIRASIDIR — yayıncıya bu sırayla yükle.',
    'Instagram karoselin oranını İLK slayttan alır ve gerisini ona göre kırpar.',
    '',
    ...sirali.map(
      (s, i) =>
        `${String(i + 1).padStart(2, '0')}. ${s.rol}${s.olcu === null ? '' : ` · ${s.olcu}`}`
    ),
    '',
    '## Gönderi metinleri',
    '',
    ...satirlar,
    '',
    '## Yayınlarken',
    '',
    '- **Müzik yalnız mobil uygulamadan** eklenebiliyor ve yayından sonra DEĞİŞTİRİLEMİYOR.',
    '- Reklam vermeyi düşünüyorsan **ticari müzik kütüphanesi** (işletme hesabı) ya da',
    '  **özgün ses** kullan: normal/trend kütüphaneden seçilen bir parça organik yayınlanır',
    '  ama tanıtım (öne çıkarma) ENGELLENİR — sorun yayın anında değil REKLAM anında çıkar.',
    '- Instagram karosel tavanı **10 slayt**.',
    ...(eksik.length === 0 ? [] : ['', '## ⚠ Eksikler', '', ...eksik.map((x) => `- ${x}`)]),
    '',
  ].join('\n')
  writeFileSync(join(klasor, 'GONDERI.md'), belge, 'utf8')

  return { ok: true, klasor: join(PAKET_KOK, ad), slayt: yazilan, eksik }
}
