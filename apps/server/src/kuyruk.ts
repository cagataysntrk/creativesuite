// Onay kuyruğu (§12.5, §12.9 · R-14 · FAZ-4.7).
//
// **Onay bir yan etki değil, bir KAPIDIR** (§4c). Bu modül kapıda bekleyen
// çalıştırmaları listeler ve insanın kararını iki yere yazar:
//   1. çalıştırmanın manifest'ine — o çalıştırmanın kanıtı (§13)
//   2. `brand/<id>/decisions.jsonl`e — **sticky karar defteri** (§4.5)
//
// İkincisi olmadan red, o çalıştırmayla birlikte ölür: bir sonraki keşif aynı öneriyi
// tekrar getirir ve insan aynı "hayır"ı tekrar söyler. Dördüncü tekrarda sistem terk
// edilir — defterin var olma sebebi tam olarak bu.
//
// Kuyruk `derived/runs/*/manifest.json`dan beslenir. İkinci bir kaynak (ayrı bir kuyruk
// tablosu) manifest'le ayrışabilirdi ve o an hangisinin doğru olduğu anlaşılmazdı.

import { appendFileSync, existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { RUNS_DIR, costSummary, type HumanDecision, type RunManifest } from '@suite/kernel'
import type { RunId } from '@suite/contracts'
import { appendDecision, readManifest, writeManifest } from '@suite/engine'

import { kosuSablonu } from './kosu-sablonu.js'

export interface KuyrukSatiri {
  readonly runId: string
  readonly pipeline: string
  readonly brandId: string
  readonly createdAt: string
  /** Beklenen kapı. Kuyrukta OLMASININ sebebi. */
  readonly gate: string
  readonly stoppedAt: string | null
  /** Şu ana kadar harcanan — onay verirken bilinmesi gereken sayı. */
  readonly harcananMikros: string
  readonly tahminUstMikros: string
  /** Manifest kusurluysa çıktı zaten yayınlanamaz (D-155) — kuyrukta İŞARETLENİR. */
  readonly manifestSaglam: boolean
  /**
   * Hangi ŞABLON ve hangi KONU — onay verirken bakılan ilk iki şey.
   *
   * ⚠ ⚠ **KUYRUK YALNIZ KİMLİK GÖSTERİYORDU ve bu bir gözden geçirmeyi imkânsız
   * kılıyor.** Depo sahibi on üretimi "tek tek hangisi nasıl olmuş" diye inceleyecekti;
   * satırlarda `run_01a03c51` gibi kimliklerden başka bir şey yoktu. Hangi şablonun
   * hangi konuyu ürettiğini görmek için her koşuyu TEK TEK açmak gerekiyordu.
   * ⚠ İkisi de zaten diskte duruyor (`kosu-parametreleri.json`); eksik olan taşıma.
   */
  readonly sablon: string | null
  readonly konu: string | null
}

/**
 * Koşunun ŞABLONU ve KONUSU.
 *
 * ⚠ ⚠ **PARAMETRE DOSYASINDAN OKUNUYORDU ve bu bir YANLIŞ ETİKET ürettti.** `sablon`
 * alanı yalnız panel ya da CLI onu yazdıysa dolu; sistem şablonu kendi seçtiğinde
 * (kısıt olarak yalnız *"şunları kullanma"* verildiğinde) BOŞ kalıyor. Bir koşu bu
 * yüzden `veri-hikayesi` diye listelendi, adım çıktısı okununca `sahne` çıktı — on
 * üretimde `veri-hikayesi` hiç yoktu ve `sahne` iki kez vardı.
 *
 * ⚠ Artık cevap `kosu-sablonu.ts`ten geliyor ve GERÇEK olan öne alınıyor: hattın ne
 * uyguladığı, insanın ne istediğinden önce gelir. İstenen yalnız gerçek bilinmiyorsa
 * kullanılıyor — hiç yoksa `null`, yani "bilinmiyor", boş dize değil.
 */
const kosuBilgisi = (
  repoRoot: string,
  runId: string
): { readonly sablon: string | null; readonly konu: string | null } => {
  const s = kosuSablonu(repoRoot, runId)
  return { sablon: s.gercek ?? s.istenen, konu: s.konu }
}

const manifestler = (repoRoot: string): readonly RunManifest[] => {
  const dizin = join(repoRoot, RUNS_DIR)
  if (!existsSync(dizin)) return []
  const out: RunManifest[] = []
  for (const d of readdirSync(dizin, { withFileTypes: true })) {
    if (!d.isDirectory()) continue
    const m = readManifest(repoRoot, d.name as RunId)
    if (m !== null) out.push(m)
  }
  return out
}

/**
 * Kapıda bekleyen çalıştırmalar, **en ESKİDEN yeniye**.
 *
 * Sıralama ters indeksin tersi ve bilerek: bekleyen iş kuyruğunda en uzun bekleyen
 * önce gelmeli, yoksa eski işler dipte unutulur ve kuyruk bir yığına dönüşür.
 */
export const bekleyenler = (repoRoot: string): readonly KuyrukSatiri[] => {
  const satirlar: KuyrukSatiri[] = []
  for (const m of manifestler(repoRoot)) {
    const gate = m.awaitingGate ?? null
    if (gate === null || gate === '') continue
    // Karar zaten verilmişse kuyrukta DURMAZ: `awaitingGate` yazıldıktan sonra karar
    // gelmiş olabilir ve manifest yeniden koşulmadan güncellenmiş olabilir.
    if ((m.decisions ?? []).some((d) => d.gate === gate)) continue

    const c = costSummary(m)
    satirlar.push({
      runId: m.runId,
      pipeline: m.pipeline,
      brandId: m.brandId,
      createdAt: m.createdAt,
      gate,
      stoppedAt: m.stoppedAt ?? null,
      harcananMikros: c.actual.micros.toString(),
      tahminUstMikros: c.estimatedHigh.micros.toString(),
      manifestSaglam: /^[0-9a-f]{40}$/.test(m.corpusCommit),
      ...kosuBilgisi(repoRoot, m.runId),
    })
  }
  // ⚠ ⚠ **SUNUCU EN ESKİYİ ÖNCE VERİR ve bu bir kuyruk sözleşmesidir:** bekleyen iş
  // dipte unutulmaz. Bir kez tersine çevirmeyi denedim çünkü panelde az önce başlatılan
  // koşu 62 bekleyenin altında kalıyordu — ama testin gerekçesi de doğruydu ve iki
  // doğru arasında seçim yapmak yerine İKİSİ birden karşılanmalı: sunucu kuyruk
  // sırasını korur, EKRAN kendi sırasını seçer (`OnayKuyrugu` `sira` alıyor).
  // Sıralamayı sunucuda çevirmek, "unutulmasın" garantisini API'den silmek olurdu.
  return satirlar.sort((a, b) => a.createdAt.localeCompare(b.createdAt))
}

export type KararSonuc =
  | { readonly ok: true; readonly manifest: string; readonly defter: string | null }
  | { readonly ok: false; readonly hata: string }

export interface KararGirdisi {
  readonly repoRoot: string
  readonly runId: string
  readonly gate: string
  /**
   * ⚠ `edited` = onaylanmış bir kapıyı YENİDEN AÇMA. Onayı silmiyor, üstüne yazıyor.
   * Gerekçe zorunlu.
   */
  readonly karar: 'approved' | 'rejected' | 'edited'
  readonly gerekce: string
  readonly at: string
}

/**
 * İnsanın kapı kararını yazar.
 *
 * **Red GEREKÇE ister.** Gerekçesiz bir red, sonraki çalıştırmaya hiçbir bilgi taşımaz:
 * sistem "bu reddedildi" bilir ama "neden" bilmez ve aynı hatayı tekrar yapar.
 * Onay gerekçe istemez — "evet" kendini açıklar.
 */
export const kararVer = (g: KararGirdisi): KararSonuc => {
  const m = readManifest(g.repoRoot, g.runId as RunId)
  if (m === null) return { ok: false, hata: `çalıştırma yok: ${g.runId}` }

  if (g.karar === 'rejected' && g.gerekce.trim() === '') {
    return {
      ok: false,
      hata: 'red GEREKÇE ister — gerekçesiz red, sonraki çalıştırmaya bilgi taşımaz',
    }
  }
  // ⚠ ⚠ **`edited` BİR EZME DEĞİL, BİR EKLEMEDİR — ve bu ayrım depo sahibinin sorusundan
  // doğdu:** *"diyelim ki tasarım onayı verdik ama sonra tasarımı değiştirmek istedik,
  // ne yapacağız?"* Onayı SİLMEK yasak (kararlar kanıttır); ama onaydan sonra fikir
  // değişmesi gerçek bir olay ve hiçbir yerde yazmıyordu. `edited` o olayı yazıyor:
  // önceki onay defterde DURUYOR, üstüne *"sonra yeniden açıldı"* ekleniyor.
  //
  // ⚠ GEREKÇE ZORUNLU — reddle aynı sebeple: onaylanmış bir tasarımı yeniden açmanın
  // nedeni yazılmazsa, altı ay sonra "bu neden değişti" sorusu cevapsız kalır.
  if (g.karar === 'edited' && g.gerekce.trim() === '') {
    return {
      ok: false,
      hata: 'tasarımı yeniden açmak GEREKÇE ister — onaylanmış bir işi neden geri açtığın yazılmalı',
    }
  }
  if (g.karar !== 'edited' && (m.decisions ?? []).some((d) => d.gate === g.gate)) {
    return { ok: false, hata: `'${g.gate}' kapısı için karar zaten var — kararlar EZİLMEZ` }
  }
  // ⚠ Yeniden açma ancak ONAYLANMIŞ bir kapıda anlamlı: hiç karar verilmemiş bir kapı
  // zaten açık, "yeniden açmak" diye bir şey yok.
  if (
    g.karar === 'edited' &&
    !(m.decisions ?? []).some((d) => d.gate === g.gate && d.decision === 'approved')
  ) {
    return { ok: false, hata: `'${g.gate}' kapısı onaylanmamış — yeniden açılacak bir karar yok` }
  }

  const yeni: HumanDecision = {
    gate: g.gate,
    decision: g.karar,
    at: g.at as HumanDecision['at'],
    note: g.gerekce.trim() === '' ? null : g.gerekce.trim(),
  }
  const guncel: RunManifest = { ...m, decisions: [...(m.decisions ?? []), yeni] }
  const yazim = writeManifest({ repoRoot: g.repoRoot, manifest: guncel })
  if (!yazim.ok) {
    return {
      ok: false,
      hata: `manifest yazılamadı: ${yazim.defects.map((d) => d.kind).join(', ')}`,
    }
  }

  // ── sticky defter: red KALICI olmalı ─────────────────────────────────────
  //
  // Manifest o çalıştırmanın kanıtı; defter MARKANIN hafızası. Yalnız manifeste
  // yazsaydık red o çalıştırmayla birlikte ölür ve bir sonraki keşif aynı öneriyi
  // tekrar getirirdi (§4.5).
  let defterYolu: string | null = null
  if (g.karar === 'rejected') {
    defterYolu = join(g.repoRoot, `brand/${m.brandId}/decisions.jsonl`)
    appendFileSync(
      defterYolu,
      appendDecision({
        recordId: g.runId,
        // Kapı kararı TÜM çıktıya ait, bir alana değil: pointer kök.
        pointer: `/gate/${g.gate}`,
        hash: g.gate,
        kind: 'rejected',
        at: g.at,
        reason: yeni.note ?? '',
      })
    )
  }

  return { ok: true, manifest: yazim.path, defter: defterYolu }
}
