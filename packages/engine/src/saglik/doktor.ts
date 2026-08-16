// Doctor — bir ay ihmalden sonra açılacak İLK ekran (§13, §16 · FAZ-4.17).
//
// **Rapor yazar, HİÇBİR ŞEYİ DEĞİŞTİRMEZ.** Bu bir üslup tercihi değil, sistemin
// 12. yasasının (§16) doğrudan sonucu: bir ay ihmal edilmiş bir sistemde otomatik
// düzeltme, kullanıcıya **ne olduğunu gizler**. Dönen kişinin ilk ihtiyacı temiz bir
// repo değil, doğru bir tablo. `doctor-salt-okur` kapısı bunu mekanik olarak zorluyor:
// bu dosyada tek bir yazma çağrısı bile bulunursa kapı kırmızıya döner.
//
// **Kurallar TEK yerde.** `just doctor` (kabuk) ile Doctor ekranı (UI) aynı bulguları
// göstermek zorunda — adımın ✅ kriteri bu. İki kopya yazmak D-185'in tekrarı olurdu:
// kabuk "temiz" derken ekran "kırık" der ve hangisinin haklı olduğu belirsiz kalır.

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { RUNS_DIR, type Db } from '@suite/kernel'
import type { RunId } from '@suite/contracts'
import { recordCount } from '@suite/corpus'
import { loadDescriptors, yenilemeRaporu } from '@suite/providers'
import { PLACEMENTS, specAgeDays, specStaleness } from '@suite/render'
import { costVariance, readManifest, readRunStub } from '../manifest-writer.js'
import { stratejiSagligi } from './strateji.js'

/** §8.7: fiyat anlık görüntüsü 60 günden eskiyse uyarı. */
const FIYAT_UYARI_GUN = 60
/** §9.1: platform spec'i üç ayda bir yeniden kontrol edilir. */
const SPEC_UYARI_GUN = 90
/** §16: tahminin üst sınırından %20'yi aşan sapma fiyat modelini şüpheli yapar. */
const SAPMA_ESIGI = 20

export type DoktorAlani =
  'fiyat' | 'spec' | 'maliyet' | 'kayit' | 'indeks' | 'defter' | 'surum' | 'token'

export interface DoktorBulgusu {
  readonly alan: DoktorAlani
  /** `kritik` bir şey KIRIK · `uyari` çürümeye başladı · `bilgi` ölçüm sonucu. */
  readonly siddet: 'kritik' | 'uyari' | 'bilgi'
  readonly mesaj: string
  /** Tıklanabilir hedef (kayıt yolu, çalıştırma id'si). Yoksa `null`. */
  readonly hedef: string | null
}

export interface DoktorRaporu {
  readonly bugun: string
  readonly bulgular: readonly DoktorBulgusu[]
  readonly kritik: number
  readonly uyari: number
  /**
   * Hangi denetimler KOŞTU. Koşmayan bir denetim "temiz" DEĞİLDİR (D-175) ve rapor
   * bunu ayırt edemezse, bir ay sonra dönen kullanıcı eksik bir tabloya bakar.
   */
  readonly kosanDenetimler: readonly string[]
  readonly atlananDenetimler: readonly { readonly ad: string; readonly neden: string }[]
}

export interface DoktorGirdisi {
  readonly repoRoot: string
  /** `YYYY-MM-DD`. Saat DIŞARIDAN gelir (R-06). */
  readonly bugun: string
  /** Aktif dönem — verilmezse strateji denetimi ATLANIR ve bu raporlanır. */
  readonly aktifEra?: string | null
  /** Türetilmiş indeks. Verilmezse indeks/corpus karşılaştırması ATLANIR. */
  readonly db?: Db | null
  /**
   * Git olguları çağırandan gelir: `git-cagiran` darboğazı tek bir dosyaya kilitli ve
   * bu modül alt süreç başlatmaz. Verilmezse ilgili denetim atlanır, uydurulmaz.
   */
  readonly git?: {
    readonly pushEdilmemis: number | null
    readonly commitlenmemisDefterSatiri: number | null
  } | null
}

const runIdleri = (repoRoot: string): readonly string[] => {
  const d = join(repoRoot, RUNS_DIR)
  if (!existsSync(d)) return []
  return readdirSync(d, { withFileTypes: true })
    .filter((x) => x.isDirectory())
    .map((x) => x.name)
}

const varlikSayisi = (dizin: string): number => {
  if (!existsSync(dizin)) return 0
  let n = 0
  for (const ad of readdirSync(dizin)) {
    const t = join(dizin, ad)
    if (statSync(t).isDirectory()) n += varlikSayisi(t)
    else if (/\.(png|jpg|jpeg|mp4|pdf)$/i.test(ad)) n++
  }
  return n
}

const corpusDosyaSayisi = (repoRoot: string): number => {
  const kok = join(repoRoot, 'corpus')
  if (!existsSync(kok)) return 0
  let n = 0
  for (const tip of readdirSync(kok, { withFileTypes: true })) {
    if (!tip.isDirectory()) continue
    n += readdirSync(join(kok, tip.name)).filter((f) => f.endsWith('.md')).length
  }
  return n
}

export const doktorRaporu = (g: DoktorGirdisi): DoktorRaporu => {
  const bulgular: DoktorBulgusu[] = []
  const kosan: string[] = []
  const atlanan: { ad: string; neden: string }[] = []

  // ── sağlayıcı fiyat anlık görüntüleri (§8.7) ──────────────────────────────
  const saglayiciKok = join(g.repoRoot, 'registry/providers')
  if (existsSync(saglayiciKok)) {
    kosan.push('fiyat')
    const { descriptors } = loadDescriptors(saglayiciKok)
    for (const d of descriptors) {
      if (d.pricingSnapshot === null) {
        if (d.enabled) {
          bulgular.push({
            alan: 'fiyat',
            siddet: 'kritik',
            mesaj: `${d.id}: fiyat anlık görüntüsü YOK ama enabled — maliyet tahmini dayanaksız`,
            hedef: `registry/providers/${d.id}.provider.yaml`,
          })
        }
        continue
      }
      const yol = join(saglayiciKok, d.pricingSnapshot)
      if (!existsSync(yol)) {
        bulgular.push({
          alan: 'fiyat',
          siddet: 'kritik',
          mesaj: `${d.id}: anlık görüntü dosyası yok (${d.pricingSnapshot})`,
          hedef: `registry/providers/${d.pricingSnapshot}`,
        })
        continue
      }
      let yas = 0
      try {
        const snap = JSON.parse(readFileSync(yol, 'utf8')) as { captured_at?: string }
        yas = specAgeDays({ verifiedAt: snap.captured_at ?? '' } as never, g.bugun)
      } catch {
        bulgular.push({
          alan: 'fiyat',
          siddet: 'kritik',
          mesaj: `${d.id}: anlık görüntü okunamadı`,
          hedef: `registry/providers/${d.pricingSnapshot}`,
        })
        continue
      }
      if (yas > FIYAT_UYARI_GUN) {
        bulgular.push({
          alan: 'fiyat',
          siddet: 'uyari',
          mesaj: `${d.id}: fiyat ${yas} günlük — ${FIYAT_UYARI_GUN} gün sınırı aşıldı (§8.7)`,
          hedef: `registry/providers/${d.pricingSnapshot}`,
        })
      }
    }
  } else {
    atlanan.push({ ad: 'fiyat', neden: 'registry/providers yok' })
  }

  // ── platform spec tazeliği (§9.1) ─────────────────────────────────────────
  kosan.push('spec')
  for (const p of PLACEMENTS) {
    const { placementDays, safeAreaDays } = specStaleness(p, g.bugun)
    if (placementDays > SPEC_UYARI_GUN) {
      bulgular.push({
        alan: 'spec',
        siddet: 'uyari',
        mesaj: `${p.id}: spec ${placementDays} günlük — ${SPEC_UYARI_GUN} gün sınırı aşıldı (§9.1)`,
        hedef: p.sourceUrl,
      })
    }
    // Güvenli alan AYRI bir bulgu: kaynağı farklı (Reels tasarım kılavuzu) ve satırın
    // ölçüsünden bağımsız değişir. Tek mesaja sıkıştırmak, hangi URL'e bakılacağını
    // gizlerdi (D-198).
    if (safeAreaDays !== null && safeAreaDays > SPEC_UYARI_GUN) {
      bulgular.push({
        alan: 'spec',
        siddet: 'uyari',
        mesaj: `${p.id}: GÜVENLİ ALAN ${safeAreaDays} günlük — ${SPEC_UYARI_GUN} gün sınırı aşıldı (§9.1)`,
        hedef: p.safeArea?.sourceUrl ?? null,
      })
    }
  }

  // ── token ömrü (§9.2 · §16 · FAZ-7.6) ─────────────────────────────────────
  //
  // **Secret ÇÖZÜLMEDEN okunuyor.** Son kullanma tarihi sır değil ve düz metin durduğu
  // için bir ay sonra açılan `doctor` "token 4 gün sonra ölüyor" diyebiliyor. Sırrı
  // okumak zorunda olan bir sağlık raporu, gözetimsiz bir kurulumda hiç koşmaz.
  const tokenYolu = join(g.repoRoot, 'secrets/token-durumu.json')
  if (existsSync(tokenYolu)) {
    kosan.push('token')
    let kayitlar: { provider: string; expiresAt: string; obtainedAt: string; scopes: string[] }[] =
      []
    try {
      const ham = JSON.parse(readFileSync(tokenYolu, 'utf8')) as { kayitlar?: unknown }
      kayitlar = Array.isArray(ham.kayitlar) ? (ham.kayitlar as typeof kayitlar) : []
    } catch {
      bulgular.push({
        alan: 'token',
        siddet: 'kritik',
        mesaj: 'secrets/token-durumu.json okunamadı — token ömrü BİLİNMİYOR, yayın bloklu',
        hedef: 'secrets/token-durumu.json',
      })
    }
    for (const r of yenilemeRaporu(kayitlar, ['meta', 'linkedin'], `${g.bugun}T00:00:00.000Z`)) {
      if (r.durum.kind === 'ok') continue
      bulgular.push({
        alan: 'token',
        siddet: r.bloklu ? 'kritik' : 'uyari',
        mesaj: r.mesaj,
        hedef: 'secrets/token-durumu.json',
      })
    }
  } else {
    atlanan.push({ ad: 'token', neden: 'secrets/token-durumu.json yok' })
  }

  // ── maliyet sapması ve öksüz çalıştırmalar (§16, §13) ─────────────────────
  kosan.push('maliyet')
  for (const runId of runIdleri(g.repoRoot)) {
    const m = readManifest(g.repoRoot, runId as RunId)
    if (m === null) {
      // Manifest'siz çıktı bir HATADIR (§13) — ama yalnız gerçekten çıktı varsa.
      const n = varlikSayisi(join(g.repoRoot, RUNS_DIR, runId))
      if (n > 0) {
        // **Kesintiye uğramış koşu ile KÜNYESİZ koşu aynı şey değil.** Künye varsa
        // hangi hat, hangi marka, hangi dönem biliniyor; eksik olan yalnız maliyet ve
        // adım kaydı. Künye yoksa varlık gerçekten öksüzdür.
        const kunye = readRunStub(g.repoRoot, runId as RunId)
        bulgular.push(
          kunye === null
            ? {
                alan: 'defter',
                siddet: 'kritik',
                mesaj: `${runId}: ${n} varlık VAR, manifest ve künye YOK — kimin ürettiği ve neye mal olduğu bilinmiyor`,
                hedef: runId,
              }
            : {
                alan: 'defter',
                siddet: 'uyari',
                mesaj: `${runId}: ${n} varlık VAR, koşu YARIDA kalmış (künye: ${kunye.pipeline}, ${kunye.createdAt}) — maliyet ve adım kaydı eksik`,
                hedef: runId,
              }
        )
      }
      continue
    }
    const v = costVariance(m)
    if (v.variancePercent !== null && Math.abs(v.variancePercent) > SAPMA_ESIGI) {
      bulgular.push({
        alan: 'maliyet',
        siddet: 'uyari',
        mesaj: `${runId}: tahmin üstünden %${v.variancePercent.toFixed(1)} sapma — fiyat modeli şüpheli (§16)`,
        hedef: runId,
      })
    }
  }

  // ── kayıt çürümesi: strateji sağlığı ile AYNI fonksiyondan (D-185) ────────
  if (g.aktifEra === undefined || g.aktifEra === null || g.aktifEra === '') {
    atlanan.push({ ad: 'kayit', neden: 'aktif dönem okunamadı — çürüme denetimi yapılamaz' })
  } else {
    kosan.push('kayit')
    const s = stratejiSagligi({
      repoRoot: g.repoRoot,
      aktifEra: g.aktifEra,
      simdi: `${g.bugun}T00:00:00.000Z`,
      izinliHex: null,
    })
    for (const b of s.bulgular) {
      if (b.tur === 'lexicon' || b.tur === 'aktarim') continue // strateji panosunun işi
      bulgular.push({
        alan: 'kayit',
        siddet: b.siddet === 'blocking' ? 'kritik' : 'uyari',
        mesaj: `${b.kayitId}: ${b.mesaj}`,
        hedef: b.yol,
      })
    }
    for (const o of s.okunamayan) {
      bulgular.push({
        alan: 'kayit',
        siddet: 'kritik',
        mesaj: `${o.yol}: ${o.neden}`,
        hedef: o.yol,
      })
    }
  }

  // ── indeks / corpus ayrışması ─────────────────────────────────────────────
  if (g.db === undefined || g.db === null) {
    atlanan.push({ ad: 'indeks', neden: 'indeks açık değil — `just reindex`' })
  } else {
    kosan.push('indeks')
    // Sorgu corpus'ta (R-01 · `retrieval-yuklemi`): `record` tablosunu bilen tek paket.
    const satir = recordCount(g.db)
    const dosya = corpusDosyaSayisi(g.repoRoot)
    if (satir !== dosya) {
      // İndeks türetilmiştir ve silinebilir (11. yasa) — ama AYRIŞMIŞ bir indeks
      // sessizce yanlış bağlam üretir; kaybolan bir indeksten daha tehlikelidir.
      bulgular.push({
        alan: 'indeks',
        siddet: 'kritik',
        mesaj: `indeks ${satir} kayıt, corpus ${dosya} dosya — ayrışma var, \`just reindex\``,
        hedef: null,
      })
    }
  }

  // ── git olguları (çağırandan) ─────────────────────────────────────────────
  if (g.git === undefined || g.git === null) {
    atlanan.push({ ad: 'defter/git', neden: 'git olguları verilmedi' })
  } else {
    kosan.push('defter/git')
    if (g.git.pushEdilmemis === null) {
      bulgular.push({
        alan: 'defter',
        siddet: 'kritik',
        mesaj: 'upstream YOK — `git clone` ile kurtarma İMKÂNSIZ (12. yasa)',
        hedef: null,
      })
    } else if (g.git.pushEdilmemis > 0) {
      bulgular.push({
        alan: 'defter',
        siddet: 'uyari',
        mesaj: `${g.git.pushEdilmemis} commit uzakta YOK — \`git clone\` onları kaçırır (12. yasa)`,
        hedef: null,
      })
    }
    const kirli = g.git.commitlenmemisDefterSatiri ?? 0
    if (kirli > 0) {
      bulgular.push({
        alan: 'defter',
        siddet: 'uyari',
        mesaj: `${kirli} commit'lenmemiş çalıştırma defteri girdisi — \`${RUNS_DIR}\` türetilemez (R-52)`,
        hedef: null,
      })
    }
  }

  return {
    bugun: g.bugun,
    bulgular,
    kritik: bulgular.filter((b) => b.siddet === 'kritik').length,
    uyari: bulgular.filter((b) => b.siddet === 'uyari').length,
    kosanDenetimler: kosan,
    atlananDenetimler: atlanan,
  }
}

export const doktorMetni = (r: DoktorRaporu): string => {
  const satirlar = [`── doctor · ${r.bugun} ──`]
  if (r.bulgular.length === 0) {
    satirlar.push('  bulgu yok')
  }
  for (const b of r.bulgular) {
    const isaret = b.siddet === 'kritik' ? '✗' : b.siddet === 'uyari' ? '⚠' : ' '
    satirlar.push(`  ${isaret} [${b.alan}] ${b.mesaj}`)
  }
  satirlar.push(`  ${r.kritik} kritik · ${r.uyari} uyarı`)
  satirlar.push(`  koşan: ${r.kosanDenetimler.join(', ') || 'hiçbiri'}`)
  // Atlanan denetim GİZLENMEZ: koşmayan bir denetim "temiz" değildir (D-175).
  for (const a of r.atlananDenetimler) satirlar.push(`  ⊘ ${a.ad} atlandı — ${a.neden}`)
  return satirlar.join('\n')
}
