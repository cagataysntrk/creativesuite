// Performans panosu ve geri besleme (§13, §11.2 · R-14, R-32 · FAZ-7.9).
//
// **Döngü burada kapanıyor.** Geri besleme olmadan sistem bir yayın makinesi; onunla
// birlikte öğrenen bir sistem. Ama öğrenmenin ilk şartı, doğru şeyi ölçmek.
//
// **Kümülatif toplam SIRALANAMAZ — yaşla kirlenir.** Üç ay önceki bir post ile dünkü
// postu "toplam erişim"e göre yan yana koymak, eski postu kazanan ilan etmektir;
// ölçtüğün şey içerik değil, TAKVİM. Bu yüzden sıralama **sabit bir pencerede**
// yapılır: yayından sonraki 7. gündeki değer. Bu, iki postu gerçekten aynı soruya
// cevap verir hâle getiren tek şey.
//
// **Ölçülmeyen pencere sıralamaya GİRMEZ.** Üç gün ölçülmüş bir postu otuz gün
// ölçülmüşle karşılaştırmak, eksik veriyi "düşük performans" diye okumaktır — ve o
// yanlış okuma, geri beslemeyle corpus'a yazıldığında kalıcılaşır.
//
// **Bu modül corpus'a YAZMAZ.** Yalnız öneri İÇERİĞİ üretir; yazan taraf
// `corpus.propose()`tur ve önerinin `status`u `draft`tır (R-14). Otomatik yazan bir
// geri besleme döngüsü, kendi kendini değiştiren yapılandırmadır.

import { slug } from '@suite/contracts'
import type { InsightSatiri } from './insight-ledger.js'
import { insightLedgerPath } from './insight-ledger.js'
import type { PublishedEntry } from './publish-ledger.js'

/**
 * Karşılaştırma penceresi. Yayından sonraki bu kadar günlük değer sıralanır.
 *
 * Yedi gün: bir haftalık döngü hafta içi/hafta sonu farkını içine alır ve IG'nin
 * dağıtımı ilk günlerde yoğunlaşır. Daha uzunu, ölçüm boşluğuna yakalanma ihtimalini
 * artırır; daha kısası tek bir günün gürültüsüne teslim olur.
 */
export const PENCERE_GUN = 7

export type SiralamaDurumu =
  /** Pencere tamamlanmış ve ölçülmüş — sıralanabilir. */
  | { readonly kind: 'siralanabilir'; readonly deger: number }
  /** Yayın 7 günden yeni. **Kötü değil, HENÜZ BELLİ DEĞİL.** */
  | { readonly kind: 'olgunlasmadi'; readonly kalanGun: number }
  /** Pencere günü ölçülmemiş. **Düşük performans DEĞİL, ölçüm yok.** */
  | { readonly kind: 'eksik_olcum'; readonly eksikGun: string }
  /** O metrik hiç toplanmamış — sağlayıcı vermemiş ya da anahtar değişmiş. */
  | { readonly kind: 'metrik_yok'; readonly metrik: string }

export interface PerformansSatiri {
  readonly externalId: string
  readonly platform: string
  readonly runId: string | null
  readonly publishedAt: string
  readonly durum: SiralamaDurumu
  /** Kaç gün ölçülmüş — sıralanamayan satırların NEDEN sıralanamadığını gösterir. */
  readonly olculenGun: number
}

const gunEkle = (gun: string, n: number): string =>
  new Date(Date.parse(`${gun}T00:00:00Z`) + n * 86_400_000).toISOString().slice(0, 10)

const gunFarki = (a: string, b: string): number =>
  Math.round((Date.parse(`${a}T00:00:00Z`) - Date.parse(`${b}T00:00:00Z`)) / 86_400_000)

/**
 * Bir yayının pencere durumunu ölçer.
 *
 * **Sıra önemli:** önce olgunlaşma, sonra ölçüm eksiği, sonra metrik. Ters sırada
 * dünkü bir post "eksik ölçüm" diye işaretlenirdi — oysa o gün henüz gelmedi.
 */
export const pencereDurumu = (
  publishedAt: string,
  olcumler: readonly InsightSatiri[],
  bugun: string,
  metrik: string
): SiralamaDurumu => {
  const ilkGun = publishedAt.slice(0, 10)
  const hedefGun = gunEkle(ilkGun, PENCERE_GUN - 1)
  const kalan = gunFarki(hedefGun, bugun)
  if (kalan > 0) return { kind: 'olgunlasmadi', kalanGun: kalan }

  const o = olcumler.find((x) => x.gun === hedefGun)
  if (o === undefined) return { kind: 'eksik_olcum', eksikGun: hedefGun }

  const deger = o.metrikler[metrik]
  if (typeof deger !== 'number') return { kind: 'metrik_yok', metrik }
  return { kind: 'siralanabilir', deger }
}

export interface PanoGirdisi {
  readonly yayinlar: readonly PublishedEntry[]
  readonly olcumler: readonly InsightSatiri[]
  readonly bugun: string
  /** Sıralanacak metrik. Sabit değil: platformlar farklı anahtar veriyor. */
  readonly metrik: string
}

export interface PerformansPanosu {
  readonly metrik: string
  /** Sıralanabilirler — **azalan**. Sadece bunlar bir sıralama iddiasıdır. */
  readonly siralama: readonly PerformansSatiri[]
  /** Sıralanamayanlar. **Gizlenmez**: gizlenen satır, olmayan bir tamlık iddiasıdır. */
  readonly disarida: readonly PerformansSatiri[]
}

export const performansPanosu = (g: PanoGirdisi): PerformansPanosu => {
  const satirlar = g.yayinlar.map((y): PerformansSatiri => {
    const kendi = g.olcumler.filter((o) => o.externalId === y.externalId)
    return {
      externalId: y.externalId,
      platform: y.platform,
      runId: y.runId,
      publishedAt: y.publishedAt,
      durum: pencereDurumu(y.publishedAt, kendi, g.bugun, g.metrik),
      olculenGun: new Set(kendi.map((o) => o.gun)).size,
    }
  })
  const siralanabilir = satirlar.filter((s) => s.durum.kind === 'siralanabilir')
  return {
    metrik: g.metrik,
    siralama: [...siralanabilir].sort((a, b) =>
      a.durum.kind === 'siralanabilir' && b.durum.kind === 'siralanabilir'
        ? b.durum.deger - a.durum.deger
        : 0
    ),
    disarida: satirlar.filter((s) => s.durum.kind !== 'siralanabilir'),
  }
}

export const durumMesaji = (d: SiralamaDurumu): string => {
  switch (d.kind) {
    case 'siralanabilir':
      return `${PENCERE_GUN}. gün: ${d.deger}`
    case 'olgunlasmadi':
      return `pencere dolmadı — ${d.kalanGun} gün var (kötü DEĞİL, henüz belli değil)`
    case 'eksik_olcum':
      return `${d.eksikGun} ölçülmemiş — sıralanamaz; bu düşük performans DEĞİL, ölçüm yok`
    case 'metrik_yok':
      return `'${d.metrik}' metriği toplanmamış — sağlayıcı vermemiş ya da anahtar değişmiş`
  }
}

export interface HookOnerisi {
  readonly entityType: string
  readonly slug: string
  readonly frontmatter: Record<string, unknown>
  readonly body: string
}

/**
 * Kazanan bir yayından **öneri içeriği** üretir. **Yazmaz.**
 *
 * `claim_source` **zorunlu ve burada doğal** (R-32): önerinin içindeki sayı bir
 * iddiadır ve kaynağı, onu üreten ölçümün kendisidir. Kaynağı olmayan bir "bu hook
 * çalışıyor" kaydı, altı ay sonra nereden geldiği bilinmeyen bir inanç olurdu.
 *
 * `status` ve `zone` **verilmez**: onları `propose()` basar ve `draft`tan başka bir
 * şey basamaz. Buradan `active` geçirmek mümkün olsaydı kural bir konvansiyona
 * dönerdi.
 */
export const hookOnerisi = (
  satir: PerformansSatiri,
  metnin: string,
  brandId: string,
  eraId: string
): HookOnerisi | null => {
  if (satir.durum.kind !== 'siralanabilir') return null
  return {
    entityType: 'messaging',
    // `slug()` — çıplak `.toLowerCase()` yasak (R-21). Platform adı bugün ASCII ama
    // istisna açılan yer, bir sonraki çağrının Türkçe metinle geldiği yerdir.
    slug: slug(`kazanan-hook-${satir.platform}-${satir.externalId}`),
    frontmatter: {
      brand_id: brandId,
      era_id: eraId,
      type: 'messaging',
      kind: 'ledger',
      locale: 'tr-TR',
      confidence: 'measured',
      source: {
        kind: 'insight_ledger',
        ref: `${insightLedgerPath()}#${satir.externalId}`,
        quote: `${PENCERE_GUN}. gün değeri ${satir.durum.deger}`,
      },
      claim_source: {
        kind: 'insight_ledger',
        ref: `${insightLedgerPath()}#${satir.externalId}`,
        // Ölçümün penceresi de kaynağın parçası: "erişim 412" tek başına, hangi
        // pencerede ölçüldüğü bilinmeden tekrar kullanılamaz.
        quote: `yayın ${satir.publishedAt.slice(0, 10)} · ${PENCERE_GUN} günlük pencere · ${satir.olculenGun} gün ölçüldü`,
      },
      source_run_id: satir.runId,
    },
    body: metnin,
  }
}
