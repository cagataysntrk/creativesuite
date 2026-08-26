// Asset Library (§12.9, §3.5 · FAZ-4.14).
//
// Kütüphanenin tek işi **harcanmış paranın karşılığını görünür kılmak**: premium bir
// varlık üretilmiş ama hiç yayınlanmamışsa, o para değere dönüşmemiştir ve bunu ancak
// filtreleyerek görürsünüz.
//
// **Reuse birinci sınıf eylem.** Benzer bir iş geldiğinde LLM'i yeniden çalıştırmak
// yerine mevcut çalıştırmanın donmuş girdilerini kopyalayıp düzenlemek hem ucuz hem
// tutarlı (§4c). Kütüphane bu yüzden varlığı DEĞİL, varlığı ÜRETEN çalıştırmayı
// gösterir — kopyalanacak olan bayt değil, karardır.
//
// **Karantina kütüphaneye GİRMEZ ama SAYILIR.** `derived/karantina/`daki 14 varlık
// kusurlu manifest'lerden üretildi (D-155) ve yayınlanamaz. Listeye koymak onları
// kullanılabilir gösterirdi; hiç saymamak ise boş bir kütüphaneyi açıklanamaz yapardı.

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { RUNS_DIR, publishedLedgerPath, type RunManifest } from '@suite/kernel'
import type { RunId } from '@suite/contracts'
import { readManifest } from '@suite/engine'

// ⚠ **`BlobMeta`nın ikinci bir KOPYASI vardı** ve yorumu "biçim `blobs.ts`ten
// OKUNDU, uydurulmadı" diyordu. Okunmuştu — ama kopyaydı ve `deliverable` alanı
// eklenince sessizce ayrıştı (D-248). **Okunan bir kopya da bir kopyadır.** Tip artık
// kaynağından geliyor; ayrışma yapısal olarak imkânsız.
import type { BlobMeta, DeliverableRef } from '@suite/engine'

import { closeSync, openSync, readSync } from 'node:fs'
import { goruntuOlcusu } from '@suite/contracts'
import { kosuSablonu } from './kosu-sablonu.js'

export interface VarlikSatiri {
  readonly digest: string
  readonly ext: string
  readonly bytes: number
  readonly createdAt: string
  readonly sourceRunId: string
  readonly brandId: string
  readonly eraId: string
  /** Üreten çalıştırmanın hattı — Reuse bunu kopyalar. */
  readonly pipeline: string
  /** Çalıştırma konusu (`params.topic`) — aramanın asıl hedefi. */
  readonly konu: string
  /**
   * Varlığı üreten koşunun ŞABLONU. `null` = koşu `sablon-uyarla`ya varmadan düştü.
   *
   * ⚠ ⚠ **Depo sahibi: *"koşularda ve varlıklarda üretilenin hangi şablondan olduğu da
   * yazsın"*.** Kuyruk şablonu gösteriyordu, kütüphane göstermiyordu: 45 slaydın
   * hangisinin hangi tasarımdan geldiğini görmek için koşuyu açmak gerekiyordu.
   * ⚠ Kaynak `kosu-sablonu.ts` — parametre dosyası DEĞİL; o alan sistem kendi seçince
   * boş kalıyor ve bir kez yanlış etikete yol açtı.
   */
  readonly sablon: string | null
  /**
   * Varlığın GERÇEK ölçüsü, baytından okunmuş. `null` = okunamadı.
   *
   * ⚠ ⚠ **BEYAN DEĞİL BAYT.** Depo sahibi: *"1080x1440 olması kesin kural artık, bunu da
   * göstermeli sistem doğrulamalı"*. `VARSAYILAN_TUVAL` zaten doğruyu söylüyordu; eksik
   * olan çıktının kendisine bakmaktı. Ekranda beyanı göstermek hiçbir şey doğrulamaz.
   */
  readonly olcu: string | null
  /** Bu varlığı üreten adımın şeridi. `null` = adım bulunamadı. */
  readonly lane: 'free' | 'premium' | null
  /** Üreten adımın GERÇEK maliyeti, USD mikro dize. */
  readonly harcananMikros: string
  /** Yayın defterinde var mı. Defter yoksa `false` — ve `defterYok` ayrı bildirilir. */
  readonly yayinlandi: boolean
  /** Manifest kusursuz mu (D-155). Kusurluysa varlık zaten yayınlanamaz. */
  readonly manifestSaglam: boolean
  /**
   * Teslimat konumu (D-248). **`null` = ÖLÇÜLMEDİ**, sıfır değil.
   *
   * Damga alanı üretim anında basılır ve retrofit imkânsızdır (R-11); bu alanlardan
   * önce üretilen varlıklar kalıcı olarak sırasız kalacak ve kütüphane bunu
   * gizlemiyor. "Bilinmiyor" ile "birinci slayt" ayrı şeyler.
   */
  readonly teslimat: DeliverableRef | null
}

/**
 * Bir TESLİMAT — kullanıcının gerçekten aradığı birim.
 *
 * ⚠ Kütüphane varlık listeliyordu: dört slaytlık bir post **dört satır**. Yüz postta
 * dört yüz satır ve hiçbiri diğerine bağlı değil. İnsan "şu postu bul" diye arıyor,
 * "şu sha256'yı" diye değil. Gruplama bir kolaylık değil, **listenin kullanılabilir
 * kalmasının şartı**.
 */
export interface TeslimatSatiri {
  readonly id: string
  readonly kind: string
  readonly pipeline: string
  readonly konu: string
  readonly brandId: string
  readonly eraId: string
  readonly createdAt: string
  readonly parcaSayisi: number
  /** Beyan edilen toplam — eksik parça varsa `parcaSayisi` bundan küçüktür. */
  readonly beklenenParca: number
  readonly eksikParca: boolean
  readonly yayinlandi: boolean
  readonly harcananMikros: string
  /** Kapak parçanın digest'i — önizleme buradan gelir. */
  readonly kapakDigest: string | null
  readonly parcalar: readonly string[]
}

export interface Kutuphane {
  readonly varliklar: readonly VarlikSatiri[]
  /** Teslimat bazında gruplanmış görünüm — listenin asıl okunma birimi. */
  readonly teslimatlar: readonly TeslimatSatiri[]
  /**
   * Teslimat damgası TAŞIMAYAN varlık sayısı. Bunlar gruplanamaz ve öyle kalacak
   * (retrofit imkânsız). Sayılıyor ki eksiklik görünür olsun.
   */
  readonly damgasizVarlik: number
  /** Karantinadaki varlık sayısı — listeye GİRMEZ ama sayılır (D-155). */
  readonly karantina: number
  /**
   * Yayın defteri hiç YOK mu. `true` ise "yayınlanmadı" bilgisi bir ÖLÇÜM değil,
   * bir varsayımdır — ve fark söylenmeli (§12.6).
   */
  readonly yayinDefteriYok: boolean
  /** Premium üretilip yayınlanmamış varlıkların toplam maliyeti. */
  readonly bosaHarcananMikros: string
}

const metaOku = (yol: string): BlobMeta | null => {
  try {
    const d = JSON.parse(readFileSync(yol, 'utf8')) as BlobMeta
    return typeof d.digest === 'string' ? d : null
  } catch {
    return null
  }
}

const dosyalariGez = (kok: string): readonly string[] => {
  if (!existsSync(kok)) return []
  const out: string[] = []
  const yur = (d: string): void => {
    for (const ad of readdirSync(d)) {
      const t = join(d, ad)
      if (statSync(t).isDirectory()) yur(t)
      else if (ad.endsWith('.meta.json')) out.push(t)
    }
  }
  yur(kok)
  return out
}

/** Yayınlanmış digest'ler. Defter yoksa BOŞ küme — "hiçbiri yayınlanmadı" DEMEK DEĞİL. */
const yayinlananlar = (repoRoot: string): { set: ReadonlySet<string>; yok: boolean } => {
  const yol = join(repoRoot, publishedLedgerPath())
  if (!existsSync(yol)) return { set: new Set(), yok: true }
  const s = new Set<string>()
  for (const satir of readFileSync(yol, 'utf8').split('\n')) {
    if (satir.trim() === '') continue
    try {
      const d = JSON.parse(satir) as { digest?: string }
      if (typeof d.digest === 'string') s.add(d.digest)
    } catch {
      // Bozuk satır atlanır ama defter "yok" sayılmaz: dosya var, bir satırı bozuk.
    }
  }
  return { set: s, yok: false }
}

const manifestBul = (
  repoRoot: string,
  runId: string,
  onbellek: Map<string, RunManifest | null>
): RunManifest | null => {
  const v = onbellek.get(runId)
  if (v !== undefined) return v
  const m = readManifest(repoRoot, runId as RunId)
  onbellek.set(runId, m)
  return m
}

export const kutuphane = (repoRoot: string): Kutuphane => {
  const yayin = yayinlananlar(repoRoot)
  const onbellek = new Map<string, RunManifest | null>()
  // ⚠ ⚠ **ÖNBELLEK ŞART: 45 varlık ama 10 koşu.** Her varlık için adım çıktısını yeniden
  // okumak aynı on dosyayı kırk beş kez açmak olurdu. Manifest zaten böyle önbelleklenmiş;
  // yeni okuyucu aynı düzeni izliyor, kendi düzenini icat etmiyor.
  const sablonOnbellek = new Map<string, string | null>()
  // ⚠ Yalnız BAŞLIK okunuyor, dosyanın tamamı değil: 45 varlığın toplamı 30 MB'ın
  // üzerinde ve ölçü ilk kilobaytta yazılı. Tam okumak listeyi her açılışta 30 MB
  // okumaya çevirirdi — ölçüm için gereken bayt kadarını oku.
  const olcuOku = (yol: string): string | null => {
    try {
      const fd = openSync(yol, 'r')
      try {
        const bas = Buffer.alloc(65_536)
        const n = readSync(fd, bas, 0, bas.length, 0)
        const o = goruntuOlcusu(bas.subarray(0, n))
        return o === null ? null : `${String(o.genislik)}x${String(o.yukseklik)}`
      } finally {
        closeSync(fd)
      }
    } catch {
      return null
    }
  }
  const sablonu = (kok: string, runId: string): string | null => {
    const v = sablonOnbellek.get(runId)
    if (v !== undefined) return v
    const s = kosuSablonu(kok, runId)
    const sonuc = s.gercek ?? s.istenen
    sablonOnbellek.set(runId, sonuc)
    return sonuc
  }
  const varliklar: VarlikSatiri[] = []
  let bosa = 0n

  for (const metaYolu of dosyalariGez(join(repoRoot, 'derived/blobs'))) {
    const meta = metaOku(metaYolu)
    if (meta === null) continue
    const m = manifestBul(repoRoot, meta.sourceRunId, onbellek)

    // Varlığı ÜRETEN adım: `output`unda bu digest'i taşıyan ya da metered olan ilk adım.
    const adim =
      m?.steps.find((s) => JSON.stringify(s.output ?? {}).includes(meta.digest)) ??
      m?.steps.find((s) => s.actualCost !== null) ??
      null

    const konu = (() => {
      for (const s of m?.steps ?? []) {
        const t = (s.params as { topic?: unknown } | undefined)?.topic
        if (typeof t === 'string' && t !== '') return t
      }
      return ''
    })()

    const yayinlandi = yayin.set.has(meta.digest)
    const harcanan = adim?.actualCost?.micros ?? 0n
    const lane = adim?.lane ?? null
    if (lane === 'premium' && !yayinlandi) bosa += harcanan

    varliklar.push({
      digest: meta.digest,
      ext: meta.ext,
      bytes: meta.bytes,
      createdAt: meta.createdAt,
      sourceRunId: meta.sourceRunId,
      brandId: meta.stamp?.['brandId'] ?? '',
      eraId: meta.stamp?.['eraId'] ?? '',
      pipeline: m?.pipeline ?? '',
      konu,
      sablon: sablonu(repoRoot, meta.sourceRunId),
      olcu: olcuOku(metaYolu.replace(/\.meta\.json$/, '')),
      lane,
      harcananMikros: harcanan.toString(),
      yayinlandi,
      manifestSaglam: m === null ? false : /^[0-9a-f]{40}$/.test(m.corpusCommit),
      teslimat: meta.deliverable ?? null,
    })
  }

  // En YENİ üstte: kütüphaneye "en son ne ürettim" diye bakılır.
  varliklar.sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  // ── teslimat gruplaması (D-248) ────────────────────────────────────────────
  //
  // Damgasız varlıklar gruplanamaz ve **uydurulmuş bir gruba da konmaz**: her birini
  // tek parçalık kendi teslimatı yapmak, sayıyı doğru ama anlamı yanlış gösterirdi.
  // Sayılıyorlar, listeye girmiyorlar.
  const damgasiz = varliklar.filter((v) => v.teslimat === null)
  const gruplar = new Map<string, VarlikSatiri[]>()
  for (const v of varliklar) {
    if (v.teslimat === null) continue
    const mevcut = gruplar.get(v.teslimat.deliverableId)
    if (mevcut === undefined) gruplar.set(v.teslimat.deliverableId, [v])
    else mevcut.push(v)
  }

  const teslimatlar: TeslimatSatiri[] = [...gruplar.entries()].map(([id, ps]) => {
    const sirali = [...ps].sort((a, b) => (a.teslimat?.index ?? 0) - (b.teslimat?.index ?? 0))
    const ilk = sirali[0]
    const beklenen = ilk?.teslimat?.total ?? sirali.length
    return {
      id,
      kind: ilk?.teslimat?.kind ?? '',
      pipeline: ilk?.pipeline ?? '',
      konu: ilk?.konu ?? '',
      brandId: ilk?.brandId ?? '',
      eraId: ilk?.eraId ?? '',
      // Teslimatın tarihi EN ERKEN parçanınki: "ne zaman üretildi" sorusunun cevabı
      // son parçanın yazıldığı an değil, işin başladığı andır.
      createdAt: sirali.reduce((t, v) => (v.createdAt < t ? v.createdAt : t), ilk?.createdAt ?? ''),
      parcaSayisi: sirali.length,
      beklenenParca: beklenen,
      // **Eksik parça SESSİZ kalmaz.** Yarıda kalmış bir koşu üç slayt bırakır ve
      // dördüncüsü hiç üretilmez; liste bunu "3 parçalı post" diye göstermemeli.
      eksikParca: sirali.length < beklenen,
      yayinlandi: sirali.every((v) => v.yayinlandi),
      harcananMikros: sirali.reduce((t, v) => t + BigInt(v.harcananMikros), 0n).toString(),
      kapakDigest:
        sirali.find((v) => v.teslimat?.role === 'kapak' || v.teslimat?.role === 'tek')?.digest ??
        ilk?.digest ??
        null,
      parcalar: sirali.map((v) => v.digest),
    }
  })
  teslimatlar.sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  return {
    varliklar,
    teslimatlar,
    damgasizVarlik: damgasiz.length,
    karantina: dosyalariGez(join(repoRoot, 'derived/karantina')).length,
    yayinDefteriYok: yayin.yok,
    bosaHarcananMikros: bosa.toString(),
  }
}

/** `derived/runs/<id>` var mı — Reuse'ün ön koşulu. */
export const yenidenKullanilabilir = (repoRoot: string, runId: string): boolean =>
  existsSync(join(repoRoot, RUNS_DIR, runId, 'manifest.json'))
