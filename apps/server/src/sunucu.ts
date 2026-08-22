// Hono API + SSE (§12.4, §12.5 · D-26 · FAZ-4.2).
//
// **Neden Next.js değil (D-26):** uzun süren alt süreçler (Chromium, ffmpeg), dosya
// izleme ve SSE — App Router'da üçü de zorlama. SEO ihtiyacı yok ve App Router churn'ü
// "bir ay ihmal edilse de çalışır" ilkesine (12. yasa) düşman.
//
// **SSE, WebSocket değil:** akış tek yönlü (sunucu → UI). WebSocket iki yönlü bir kanal
// ve ikinci yön hiç kullanılmayacak; kullanılmayan yön, kimsenin bakmadığı bir güvenlik
// yüzeyidir. SSE ayrıca tarayıcı tarafında kendiliğinden yeniden bağlanır.
//
// **Kalp atışı zorunlu:** UI "bağlantı yok" diyebilmek için sunucunun SUSTUĞUNU
// anlamalı. Yalnız veri gönderirsek, hiçbir şey değişmediğinde sessizlik ile ölüm
// birbirinden ayırt edilemez — ve kalıcı bir gösterge bayat değeri canlı gibi gösterir.

import {
  appendFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  renameSync,
  writeFileSync,
} from 'node:fs'
import { join } from 'node:path'
import { Hono } from 'hono'
import { streamSSE } from 'hono/streaming'
import {
  browseRecords,
  lifecycleMessage,
  pinRecord,
  propose,
  retireRecord,
  selectRecords,
  selectSearch,
  type SelectQuery,
} from '@suite/corpus'
import { RUNS_DIR, discoveryPlanPath, fileHistory } from '@suite/kernel'
import { KATALOG } from '@suite/contracts'
import type { DiscoveryOpView, HaltedRecord, ToleranceReading } from '@suite/contracts'
import {
  COLUMN_LABELS,
  byColumn,
  doktorRaporu,
  performansPanosu,
  readInsights,
  readLedger,
  readManifest,
} from '@suite/engine'
import { PLACEMENTS, safeBand, specAgeDays } from '@suite/render'
import { hatDurumlari, loadPipeline } from '@suite/registry'
import {
  baglamKayitlari,
  islenmisKonular,
  konuAdaylari,
  kosuParametreleri,
  readRunStub,
} from '@suite/engine'
import { indeksAc, makineDurumu, type MakineDurumu } from './durum.js'
import { izle, type Izleme } from './izle.js'
import { tersIndeks, tersIndeksOzeti } from './ters-indeks.js'
import { baglamOnizle } from './baglam.js'
import { dunyaDurumu, launcherPlani } from './launcher.js'
import { kanalPanosu } from './kanal-uc.js'
import { uyumPanosu } from './uyum-uc.js'
import { ARACLAR, girdiDogrula, mcpHataMesaji, oneriDogrula, type McpRet } from './mcp/araclar.js'
import { bekleyenler, kararVer } from './kuyruk.js'
import { kuruCalistir, semaListesi } from './sema.js'
import { butcePanosu, tavanYaz } from './butce-uc.js'
import { YARDIM, parseCallback, parseKomut } from './telegram.js'
import { kutuphane, yenidenKullanilabilir } from './kutuphane.js'
import { calistirmaDetayi, calistirmalar, elemeyiGeriAl, kosuyuEle } from './gecmis.js'
import { aktifEra, stratejiPanosu } from './strateji-uc.js'
import { calistirmaBaslat, calistirmaSurdur, kosuyorMu, tekrarBaslat } from './calistir.js'

export interface SunucuSecenekleri {
  readonly repoRoot: string
  readonly query: SelectQuery
  /** Kalp atışı aralığı. UI bunun ~2,5 katında sessizliği ÖLÜM sayar. */
  readonly kalpAtisiMs: number
  readonly debounceMs: number
  /** Saat dışarıdan verilir — R-06: fiil gövdesinde `Date` yok, sunucuda da tek nokta. */
  readonly simdi: () => string
  /**
   * Alt süreçlere geçecek ortam — **AÇIKÇA verilir** (§14). Sunucu `process.env`e
   * uzanmaz: uzanan bir kütüphane, hangi değişkenin nereye gittiğini denetlenemez
   * yapar ve `git`e tüm ortamı vermek gizli anahtarları alt sürece taşımaktır.
   * En azı `PATH` — onsuz `git` bulunamaz.
   */
  readonly env?: Readonly<Record<string, string>>
  /**
   * **Sağlayıcı** ortamı — plan ve çalıştırma için (§14 · D-237).
   *
   * ⚠ ⚠ **BU AYRIM EKSİKTİ VE PANELDEKİ "Başlat" HİÇ AÇILMIYORDU.** Tek bir `env`
   * vardı, `git` için doğru biçimde `{PATH}`e indirilmişti ve aynı daraltılmış ortam
   * plan hesabına da gidiyordu: `candidatesFor` her ücretli adımda "yerel önkoşul
   * sağlanmadı" diyor, `providerId` null kalıyor, `launchBlocks` tahmini EKSİK sayıp
   * kilitliyordu. Sunucu anahtarlarla kalksa bile sonuç değişmiyordu.
   *
   * Aynı hatanın üçüncü yüzü: `plan.mjs` ve `uret.mjs` D-237'de düzeltilmişti, sunucu
   * hiç bağlanmamıştı. Liste yine ELLE YAZILMIYOR — `saglayiciOrtami` onu
   * tanımlayıcıların `auth_env` beyanından türetiyor.
   *
   * Verilmezse `env`e düşer: eski davranış, yani kilit. Sessiz bir tam-ortam
   * devralması olmaz.
   */
  readonly saglayiciEnv?: Readonly<Record<string, string>>
  /**
   * Planın dondurulacağı dünya: bilgi ve registry commit'i (§13).
   * Verilmezse `worktree` — ve `inspectManifest` onu KUSURLU sayar (D-155), yani
   * kirli ağaçtan dondurulmuş bir plan yayınlanabilir bir çıktı üretemez.
   *
   * ⚠ ⚠ **DEĞER DEĞİL, OKUYUCU — ve bu fark ölçülerek öğrenildi.** Önceden bu alan
   * bir DİZEYDİ ve sunucu açılışında bir kez hesaplanıyordu. Sonuç: sunucu açıkken
   * atılan HER commit panelden başlatmayı kırıyordu. Panel `20954f08…` özetini
   * dondurup onaylatıyor, CLI çalışma anında HEAD'i okuyup `4ef896d5…` buluyor,
   * R-07 haklı olarak reddediyordu:
   *
   *   ✗ onaylanan plan ile şimdiki plan AYNI DEĞİL
   *
   * Belirti "panelden üretim başlamıyor"du; sebep panelin BAYAT bir dünyayı
   * ölçmesiydi. Ölçüm aracı, ölçtüğü şeyden daha sık bozuluyor. Artık her istek
   * kendi dünyasını okuyor; R-07 yalnız GERÇEK kaymayı (onaydan sonra değişen depo)
   * yakalıyor.
   */
  readonly corpusCommit?: () => Promise<string>
  readonly registryCommit?: () => Promise<string>
}

export interface Sunucu {
  readonly app: Hono
  readonly izleme: Izleme
  readonly kapat: () => void
  /** Test için: bir olayı elle tetikle. */
  readonly yayinla: (tip: string) => void
}

/**
 * Koşunun CANLI durumu — manifestten türetilir, ayrıca tutulmaz.
 *
 * ⚠ Dört durum ve dördü de farklı bir eylem gerektiriyor; tek bir "çalışıyor/çalışmıyor"
 * ikilisi yetmezdi:
 *   · `kapida`      → insan bekleniyor, düğmeler anlamlı
 *   · `calisiyor`   → beklemek doğru, tazeleme sürüyor
 *   · `durdu`       → hata var, manifest `stoppedAt` diyor ve kapı beklemiyor
 *   · `bitti`       → planlanan adımların hepsi tamam
 */
const kosuDurumu = (
  m: {
    readonly awaitingGate?: string | null
    readonly steps?: readonly { readonly status?: string }[]
  },
  planlanan: number
): 'kapida' | 'calisiyor' | 'durdu' | 'bitti' => {
  if (m.awaitingGate !== null && m.awaitingGate !== undefined) return 'kapida'
  const adimlar = m.steps ?? []
  const bitmis = adimlar.filter((s) => s.status === 'ok' || s.status === 'skipped').length
  if (adimlar.some((s) => s.status !== undefined && s.status !== 'ok' && s.status !== 'skipped')) {
    return 'durdu'
  }
  if (planlanan > 0 && bitmis >= planlanan) return 'bitti'
  return 'calisiyor'
}

/** Hattın planladığı adım sayısı — ilerleme çubuğunun paydası. */
const hatAdimSayisi = (repoRoot: string, pipelineId: string): number => {
  const r = loadPipeline(join(repoRoot, 'registry/pipelines'), pipelineId)
  return r.ok ? r.value.steps.length : 0
}

/**
 * Elle düzenlenmiş slaytlar — `just duzenle` koşu dizinine yazıyor.
 *
 * ⚠ Dizin okunamıyorsa BOŞ liste: düzenleme yokluğu bir hata değil, olağan hâl.
 */
const elleDuzenlenmisSlaytlar = (repoRoot: string, runId: string): readonly string[] => {
  // ⚠ Kimlik DIŞ GİRDİ ve yola giriyor: biçim beyaz listeyle sınırlı (aynı gerekçe
  // `gecmis.ts`teki eleme yolunda yazılı — orada yazma, burada okuma).
  if (!/^run_[0-9a-f-]{8,64}$/.test(runId)) return []
  try {
    return readdirSync(join(repoRoot, RUNS_DIR, runId))
      .filter((f) => /^slayt-\d{2}-elle\.png$/.test(f))
      .sort()
  } catch {
    return []
  }
}

/**
 * İstenen şablon KATALOGDA var mı — yoksa `null` ve seçim yokmuş gibi davranılıyor.
 *
 * ⚠ Doğrulama şart: uydurma bir id çalıştırma parametresine girerse `sablonSecimiIcin`
 * onu bulamaz ve hat, sebebi uzakta bir hatayla durur. Panel kendi listesinden seçtirse
 * bile sunucu istemciye güvenmez — istemcinin kilidi bir sınır değildir.
 */
const sablonSecimi = (ham: string | undefined): string | null => {
  const v = (ham ?? '').trim()
  if (v === '') return null
  return KATALOG.some((s) => s.id === v && s.kullanilabilir.durum) ? v : null
}

/**
 * Bu hat KENDİ konusunu seçebiliyor mu — yani `konu_sec` kısıtlı bir adımı var mı.
 *
 * ⚠ Hat DOSYASINDAN okunuyor, elle yazılmış bir listeden değil: ikinci bir liste, yeni
 * bir hat eklendiği gün sessizce yalan söylerdi.
 */
const konuSecebilirMi = (repoRoot: string, pipelineId: string): boolean => {
  const r = loadPipeline(join(repoRoot, 'registry/pipelines'), pipelineId)
  return r.ok && r.value.steps.some((st) => st.constraints['konu_sec'] === true)
}

/** Panelden yüklenmiş görseller — hat bunları üretim yerine kullanır. */
const yuklenenGorseller = (repoRoot: string, runId: string): readonly string[] => {
  if (!/^run_[0-9a-f-]{8,64}$/.test(runId)) return []
  try {
    return readdirSync(join(repoRoot, RUNS_DIR, runId))
      .filter((f) => /^elle-gorsel-\d{2}\.(png|jpg)$/.test(f))
      .sort()
  } catch {
    return []
  }
}

/** Ekrandaki onay şeridinin bir hanesi. */
export interface KapiHanesi {
  readonly ad: string
  readonly durum: 'onaylandi' | 'reddedildi' | 'bekliyor' | 'sirada'
  readonly at: string | null
  readonly not: string | null
}

/**
 * Hattın onay kapıları — SIRAYLA ve her birinin durumu.
 *
 * ⚠ ⚠ **EKRAN YALNIZ "ŞU AN NE BEKLİYOR" DİYORDU.** Hangi kapıların geçildiği,
 * hangisinin sırada olduğu hiçbir yerde yoktu: insan üç kapılı bir hattın neresinde
 * olduğunu bilmeden "onayla" diyordu. Depo sahibinin isteği birebir bu — *"metin onayı
 * verildi, tasarım onayı verildi gibi bar şeklinde görünmeli"*.
 *
 * ⚠ Kapı listesi HAT DOSYASINDAN geliyor, elle yazılmıyor: ikinci bir liste, hat
 * değişince sessizce yalan söylerdi.
 */
export const hatKapilari = (
  repoRoot: string,
  pipelineId: string,
  kararlar: readonly {
    readonly gate: string
    readonly decision: string
    readonly at: string
    readonly note: string | null
  }[],
  bekleyen: string | null
): readonly KapiHanesi[] => {
  const r = loadPipeline(join(repoRoot, 'registry/pipelines'), pipelineId)
  if (!r.ok) return []
  const adlar: string[] = []
  for (const st of r.value.steps) {
    const g = st.gate
    if (typeof g === 'string' && g !== '' && !adlar.includes(g)) adlar.push(g)
  }
  return adlar.map((ad) => {
    const k = kararlar.find((x) => x.gate === ad)
    if (k !== undefined) {
      return {
        ad,
        durum: k.decision === 'rejected' ? ('reddedildi' as const) : ('onaylandi' as const),
        at: k.at,
        not: k.note,
      }
    }
    return {
      ad,
      durum: ad === bekleyen ? ('bekliyor' as const) : ('sirada' as const),
      at: null,
      not: null,
    }
  })
}

/**
 * Başlatma hatası kaydı — `calistir.ts` yazıyor, burası okuyor.
 *
 * ⚠ Yazan var okuyan yok, bu depoda en sık tekrarlayan hata sınıfı (D-173). Kayıt
 * yazılıp hiçbir ekranda gösterilmeseydi, panelin "başlatıldı" yalanı devam ederdi.
 */
const baslatmaHatasi = (
  repoRoot: string,
  runId: string,
  sonAdimBitisi?: string
): Record<string, unknown> | null => {
  const yol = join(repoRoot, RUNS_DIR, runId, 'baslatilamadi.json')
  if (!existsSync(yol)) return null
  try {
    const kayit = JSON.parse(readFileSync(yol, 'utf8')) as Record<string, unknown>
    // ⚠ ⚠ **ESKİ BİR HATA GÜNCEL DURUM DEĞİLDİR.** Başarısız bir başlatmadan sonra
    // aynı koşu sürdürülüp bitmişti; panel hâlâ "✗ süreç hiç başlamadı" diyordu —
    // 20/28 adım tamam, dört slayt ekranda, üstte bir yalan. Kayıt SİLİNMİYOR
    // (Yasa 11), yalnız daha yeni bir adım varsa GEÇMİŞ sayılıyor.
    // ⚠ Zaman damgası olmayan eski kayıtlar (bu alan eklenmeden yazılanlar) güncel
    // sayılıyor: bilinmeyen bir tarih, "eski" demek değildir.
    const yazildi = typeof kayit['at'] === 'string' ? kayit['at'] : null
    if (yazildi !== null && sonAdimBitisi !== undefined && sonAdimBitisi > yazildi) return null
    // ⚠ ⚠ **"SÜREÇ HİÇ BAŞLAMADI" ÇÜRÜTÜLEBİLİR BİR İDDİADIR.** Zaman damgası olmayan
    // eski kayıtlarda tarih karşılaştırması yapılamıyor — ama adım kaydı VARSA süreç
    // apaçık başlamıştır. Panelde 19/28 adım ve dört slayt dururken üstte "hiç
    // başlamadı" yazıyordu. Kayıt gizlenmiyor, DOĞRU adlandırılıyor: bu bir GEÇMİŞ
    // deneme.
    return { ...kayit, gecmis: sonAdimBitisi !== undefined }
  } catch {
    return { hata: 'baslatilamadi.json okunamadı' }
  }
}

/** Konu, `konu-sec` koşmadıysa çalıştırma parametresinden okunur. */
const konuParametresi = (
  adimlar: readonly { readonly params?: Record<string, unknown> }[]
): string | null => {
  for (const a of adimlar) {
    const t = a.params?.['topic']
    if (typeof t === 'string' && t.trim() !== '') return t
  }
  return null
}

export const kurSunucu = (o: SunucuSecenekleri): Sunucu => {
  const db = indeksAc(o.repoRoot)
  const app = new Hono()

  // Abone kümesi. Her SSE bağlantısı bir tetikleyici bırakır ve kapanınca siler;
  // silinmezse ölü bağlantılara yazmaya çalışırız ve sızıntı büyür.
  const aboneler = new Set<(tip: string) => void>()
  const yayinla = (tip: string): void => {
    for (const a of aboneler) a(tip)
  }

  // Dünya HER İSTEKTE okunuyor. Okuyucu verilmemişse `worktree` — ve o da bir
  // gerçektir: kirli ağaçtan dondurulmuş plan yayınlanabilir çıktı üretemez (D-155).
  const dunyaCommiti = async (oku?: () => Promise<string>): Promise<string> =>
    oku === undefined ? 'worktree' : await oku()

  const durumOku = (): MakineDurumu =>
    makineDurumu({ repoRoot: o.repoRoot, db, query: o.query, simdi: o.simdi() })

  const izleme = izle({
    repoRoot: o.repoRoot,
    // Defter yolu düz dize DEĞİL: `RUNS_DIR` tek otoritedir (chokepoints →
    // `manifest-yazici`). İkinci bir literal, defterin yeri değiştiğinde sessizce
    // yanlış dizini izlemek demekti — ve izlenmeyen bir defter, canlı olmayan bir şerit.
    dizinler: ['registry', RUNS_DIR, 'corpus'],
    debounceMs: o.debounceMs,
    uzerineDegisim: () => yayinla('degisim'),
  })

  app.get('/api/saglik', (c) =>
    c.json({
      ok: true,
      // Nabız aralığı İLAN EDİLİR. UI onu kendi içine gömseydi iki gerçek olurdu:
      // sunucu 5 sn'den 30 sn'ye çıktığında UI her nabızda "bağlantı yok" derdi —
      // yani ölçüm aracının kendisi ölçümü bozardı.
      nabizAraligiMs: o.kalpAtisiMs,
      izlenen: izleme.izlenen,
      indeks: db !== null,
      simdi: o.simdi(),
    })
  )

  app.get('/api/durum', (c) => c.json(durumOku()))

  // ── marka token'ları ÇALIŞMA ANINDA servis edilir ─────────────────────────
  //
  // UI bunları statik import EDEMEZ: hangi markanın renkleri geçerliyse o gelmeli
  // (D-39 — marka bir çalıştırma parametresidir, dosyadan okunan global durum değil).
  // Statik import tek markayı derlemeye gömer ve `dima`ya geçmek yeniden build ister.
  //
  // Dosya ÜRETİLMİŞTİR (R-65) ve burada yalnız okunur. Yoksa 404: boş bir CSS dönmek,
  // `--role-bg` tanımsızken sayfayı sessizce şeffaf bırakmak olurdu.
  app.get('/api/tokens.css', (c) => {
    const yol = join(o.repoRoot, `brand/${o.query.brandId}/derived-tokens/tokens.css`)
    if (!existsSync(yol)) {
      return c.text(`/* ${o.query.brandId} için token üretilmemiş — 'just tokens' */`, 404, {
        'content-type': 'text/css; charset=utf-8',
      })
    }
    return c.text(readFileSync(yol, 'utf8'), 200, { 'content-type': 'text/css; charset=utf-8' })
  })

  // ── corpus tarayıcısı (§12.9 · FAZ-4.3) ───────────────────────────────────
  //
  // **Bu uç retrieval DEĞİL.** `browseRecords` taslakları ve emeklileri DE döndürür —
  // tarayıcının tüm işi budur (D-12). Bağlam derleyen hiçbir yol buradan geçmez;
  // görünürlük her satırda `visible` bayrağı olarak GÖSTERİLİR, gizlenmez.
  app.get('/api/kayitlar', (c) => {
    if (db === null) {
      // İndeks yoksa BOŞ LİSTE dönmüyoruz: boş bir tablo "corpus boş" okunur ve
      // operatör kayıtlarının silindiğini sanır. `just reindex` demek gerekiyor.
      return c.json({ hata: 'indeks yok — `just reindex` çalıştır', kayitlar: [] }, 503)
    }
    const tip = c.req.query('tip') ?? ''
    const durum = c.req.query('durum') ?? ''
    return c.json({
      kayitlar: browseRecords(db, {
        brandId: o.query.brandId,
        eraId: o.query.eraId,
        asOf: o.query.asOf,
        type: tip,
        status: durum,
      }),
    })
  })

  // ── varlık kütüphanesi (§12.9, §3.5 · FAZ-4.14) ───────────────────────────
  //
  // Filtre sunucuda DEĞİL istemcide: liste zaten tam geliyor ve "premium ama
  // yayınlanmamış" bir SORU, bir sorgu parametresi değil — operatör onu açıp kapatarak
  // karşılaştırma yapar. Sunucuda filtrelemek, toplam harcamayı da filtrelerdi.
  app.get('/api/varliklar', (c) => c.json(kutuphane(o.repoRoot)))

  // ── doctor: bir ay ihmalden sonra açılacak İLK ekran (§13, §16 · FAZ-4.17) ─
  //
  // `just doctor` ile AYNI fonksiyonu çağırır. Rapor eder, hiçbir şeyi değiştirmez —
  // uç GET ve gövdesiz; POST olsaydı "düzelt" düğmesi bir gün eklenirdi.
  app.get('/api/doktor', (c) => {
    const era = aktifEra(o.repoRoot, o.query.brandId)
    return c.json(
      doktorRaporu({
        repoRoot: o.repoRoot,
        bugun: o.simdi().slice(0, 10),
        // Aynı an, aynı cevap: ekran ve CLI bir günü farklı sayamaz (m3).
        simdi: o.simdi(),
        aktifEra: era,
        db,
        // Git olguları sunucuda toplanmıyor: `git-cagiran` darboğazı tek dosyaya kilitli
        // ve bu uç alt süreç başlatmamalı. Denetim ATLANIR ve rapor bunu SÖYLER.
        git: null,
      })
    )
  })

  // ── strateji sağlığı: aktif dönemin lint panosu (§11, §12.9 · FAZ-4.16) ──
  //
  // Kurallar burada değil `@suite/engine`de; `just gate lexicon` AYNI fonksiyonu
  // çağırıyor. İki kopya olsaydı pano "temiz" derken kapı kırmızı olabilirdi.
  app.get('/api/strateji-sagligi', (c) => {
    const r = stratejiPanosu(o.repoRoot, o.query.brandId, o.simdi())
    return c.json(r, r.ok ? 200 : 422)
  })

  // ── çalıştırma geçmişi / köken tarayıcısı (§13, §12.9 · FAZ-4.15) ─────────
  //
  // Liste ucu donmuş planın VARLIĞINI de bildirir: `rerun` düğmesinin etkin olup
  // olmayacağı diskteki bir dosyaya bağlı ve UI bunu tahmin etmemeli.
  app.get('/api/calistirmalar', (c) => c.json({ calistirmalar: calistirmalar(o.repoRoot) }))

  // Detay: zaman çizgisi + rerun/replay karşılaştırması. Dünya durumu BURADA kurulur —
  // kurulamazsa `null` geçer ve ekran "sapma ölçülmedi" der, "sapma yok" demez (D-175).
  // ── koşuyu ELE / elemeyi geri al (FAZ-17.3) ──────────────────────────────
  //
  // ⚠ ⚠ **SİLMEK YOK, ELEMEK VAR.** Depo sahibi *"beğenmediklerimi ya da başarısızları
  // silebilmem lazım"* dedi ve istek meşru: beğenilmeyen çıktının listeyi doldurması
  // bir maliyet. Ama `derived/runs` türetilemez ve silinmez (Yasa 11 · R-52) — maliyet
  // ve sağlayıcı geçmişi başka hiçbir yerde yazmıyor. Eleme ikisini uzlaştırıyor:
  // kayıt DURUYOR, liste temizleniyor, karar geri alınabiliyor.
  app.post('/api/kosu/:runId/ele', async (c) => {
    const g = (await c.req.json().catch(() => ({}))) as { sebep?: string; geriAl?: boolean }
    const runId = c.req.param('runId')
    const r =
      g.geriAl === true
        ? elemeyiGeriAl(o.repoRoot, runId)
        : kosuyuEle(o.repoRoot, runId, g.sebep ?? '', o.simdi())
    if (r.ok) yayinla('degisim')
    return c.json(r, r.ok ? 200 : 400)
  })

  app.get('/api/calistirmalar/:runId', async (c) => {
    let dunya = null
    try {
      dunya = dunyaDurumu(
        o.repoRoot,
        await dunyaCommiti(o.corpusCommit),
        await dunyaCommiti(o.registryCommit)
      )
    } catch {
      // Tanımlayıcılar okunamadı: sapma ölçülemez ve bu AÇIKÇA söylenir.
    }
    const d = calistirmaDetayi(o.repoRoot, c.req.param('runId'), dunya)
    if (d === null) {
      return c.json({ ok: false, hata: `çalıştırma manifesti yok: ${c.req.param('runId')}` }, 404)
    }
    return c.json(d)
  })

  // ── koşunun İÇERİĞİ: metin, şablon, kusurlar, slayt digest'leri ──────────
  //
  // ⚠ ⚠ **PANEL BİR ID LİSTESİYDİ.** Onay kuyruğu `run_01a0160e · instagram-karosel ·
  // metin-onayi` gösteriyordu ve insan bunu onaylayacaktı — NEYİ onayladığını
  // görmeden. Ölçüldü: ekranda `img` sayısı SIFIR, metin yok. Bir kapı, kararın
  // dayanağını göstermiyorsa kapı değil bir gecikmedir (D-310 ailesi).
  app.get('/api/kosu/:runId/icerik', (c) => {
    const runId = c.req.param('runId')
    const m = readManifest(o.repoRoot, runId as never)
    if (m === null) {
      // ⚠ Manifest YOKKEN de cevap veriliyor: başlatma hiç tutmadıysa dizinde yalnız
      // `baslatilamadi.json` olur ve 404 dönmek, sebebi olan tek dosyayı gizlemek olurdu.
      const hataKaydi = baslatmaHatasi(o.repoRoot, runId)
      // ⚠ ⚠ **YENİ BAŞLAYAN KOŞU HATA GİBİ GÖRÜNÜYORDU.** Manifest ancak ilk adım
      // bitince yazılıyor; o ana kadar dizinde yalnız `kunye.json` var ve uç 404
      // dönüyordu. Panel "Başlat"tan sonra koşu ekranına geçiyor ve insanın gördüğü
      // ilk şey *"içerik okunamadı (404)"* oluyordu — sistem çalışırken bozuk
      // görünüyor. Künye varsa koşu BAŞLAMIŞTIR ve söylenecek şey budur.
      const kunye = hataKaydi === null ? readRunStub(o.repoRoot, runId as never) : null
      // ⚠ ⚠ **KÜNYE BİLE YOKKEN DE BİR CEVAP VAR — ve bu boşluk ÖLÇÜLDÜ.** `just uret`
      // önce `tsc -b` koşuyor; künye ancak ondan sonra yazılıyor. Ölçülen pencere ~4
      // saniye ve panel o pencerede koşu ekranına geçmiş oluyor: insanın gördüğü ilk
      // şey *"içerik okunamadı (404)"*. Depo sahibinin *"başlat diyorum hata veriyor,
      // çalışmıyor"* şikâyeti birebir bu.
      //
      // Sunucu o koşuyu KENDİSİ başlattığını biliyor (`kosuyorMu`); bilmediği tek şey
      // diskte henüz bir dosya olmadığı. Bilinen bir gerçeği "yok" diye raporlamak,
      // çalışan bir sistemi bozuk göstermek olurdu.
      if (hataKaydi === null && kunye === null && !kosuyorMu(runId)) {
        return c.json({ ok: false, hata: `manifest yok: ${runId}` }, 404)
      }
      return c.json({
        runId,
        pipeline: kunye?.pipeline ?? '',
        createdAt: kunye?.createdAt ?? '',
        bekleyenKapi: null,
        kapilar: kunye === null ? [] : hatKapilari(o.repoRoot, kunye.pipeline, [], null),
        duraklananAdim: null,
        satirlar: [],
        sablonId: null,
        ritimHedefi: null,
        ritimTuttu: null,
        kusurlar: [],
        kalite: {},
        varliklar: [],
        konu: null,
        konuGerekcesi: null,
        // Künye var + hata kaydı yok = süreç başladı, ilk adım henüz bitmedi.
        durum: hataKaydi === null ? 'calisiyor' : 'baslatilamadi',
        toplamAdim: kunye === null ? 0 : hatAdimSayisi(o.repoRoot, kunye.pipeline),
        bitenAdim: 0,
        baslatilamadi: hataKaydi,
        adimlar: [],
      })
    }
    const planlananAdim = hatAdimSayisi(o.repoRoot, m.pipeline)
    const adimlar = m.steps ?? []
    const bul = (ad: string): Record<string, unknown> =>
      (adimlar.find((s) => s.stepId === ad)?.output ?? {}) as Record<string, unknown>
    const sonSablon = [...adimlar]
      .reverse()
      .map((s) => (s.output as Record<string, unknown> | null)?.['sablonId'])
      .find((v): v is string => typeof v === 'string')
    const render = [...adimlar].reverse().find((s) => s.stepId.startsWith('render'))
    const rOut = (render?.output ?? {}) as Record<string, unknown>
    return c.json({
      runId,
      pipeline: m.pipeline,
      createdAt: m.createdAt,
      bekleyenKapi: m.awaitingGate ?? null,
      // Onay şeridi: hangi kapı geçildi, hangisi bekliyor, hangisi sırada.
      kapilar: hatKapilari(
        o.repoRoot,
        m.pipeline,
        (m.decisions ?? []).map((d) => ({
          gate: d.gate,
          decision: d.decision,
          at: d.at,
          note: d.note ?? null,
        })),
        m.awaitingGate ?? null
      ),
      duraklananAdim: adimlar.find((s) => s.status !== 'ok')?.stepId ?? null,
      satirlar: (bul('metin-uret')['lines'] as string[] | undefined) ?? [],
      sablonId: sonSablon ?? null,
      ritimHedefi: bul('kompozit')['ritimHedefi'] ?? null,
      ritimTuttu: bul('kompozit')['ritimTuttu'] ?? null,
      kusurlar: (rOut['kusurlar'] as unknown[] | undefined) ?? [],
      kalite: bul('kalite'),
      // ⚠ Digest'ler; BYTE değil. Görseli `/api/varlik/:digest` veriyor ve defter
      // yalnız hangi byte olduğunu kanıtlıyor (D-248).
      // ⚠ ⚠ **SLAYT SIRASI: ÜRETİM SIRASI.** Kütüphane en yeniyi önce veriyor (varlık
      // tarayıcısı için doğru) ama bir KAROSEL sıralı okunur: panelde 04 · 03 · 02 · 01
      // görünüyordu ve "seri bütünlüğü var mı" sorusu ters sırada cevaplanamaz.
      // `createdAt` artan: slaytlar zaten sırayla yazılıyor.
      varliklar: [...kutuphane(o.repoRoot).varliklar]
        .filter((v) => v.sourceRunId === runId)
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
        .map((v) => ({ digest: v.digest, bytes: v.bytes })),
      // ── ELLE DÜZENLENMİŞ slaytlar (D-301) ────────────────────────────────
      //
      // ⚠ ⚠ **EDİTÖRDE YAZILAN ŞEY PANELDE GÖRÜNMÜYORDU.** `just duzenle` düzenlemeyi
      // koşu dizinine `panorama-elle.json` + `slayt-NN-elle.png` olarak yazıyor; panel
      // ise yalnız DAMGALANMIŞ varlıkları (kütüphane) gösteriyordu. Sonuç: insan
      // düzenliyor, kaydediyor, panele dönüyor ve hiçbir şey değişmemiş görünüyor —
      // yapılan iş görünmez oluyor.
      //
      // ⚠ Ayrı bir bölüm olarak veriliyor, damgalı varlıkların yerine GEÇMİYOR: elle
      // düzenlenmiş bir slayt henüz uyum iddiası taşımıyor ve yayına aday değil.
      // Karıştırmak, damgasız bir varlığı yayınlanabilir sanmak olurdu.
      elleSlaytlar: elleDuzenlenmisSlaytlar(o.repoRoot, runId),
      // Panelden yüklenmiş görseller: hat bunları `elle_gorsel_<sıra>` ile kullanır.
      yuklenenGorseller: yuklenenGorseller(o.repoRoot, runId),
      // ── canlı takip (FAZ-17.3) ──────────────────────────────────────────
      //
      // ⚠ ⚠ **BAŞLATTIKTAN SONRA HİÇBİR ŞEY GÖRÜNMÜYORDU.** Ekran "başlatıldı: run_…"
      // yazıyor ve orada kalıyordu; hattın nerede olduğunu öğrenmenin tek yolu
      // manifesti elle açmaktı. Bir süreç başlatıp durumunu göstermemek, kullanıcıyı
      // "bir şey oldu mu" diye beklemeye bırakmaktır.
      //
      // Durum manifestten TÜRETİLİYOR, ayrı bir yerde tutulmuyor: ikinci bir durum
      // deposu, sunucu yeniden başlayınca yalan söylerdi.
      konu: bul('konu-sec')['konu'] ?? konuParametresi(adimlar),
      konuGerekcesi: bul('konu-sec')['gerekce'] ?? null,
      durum: kosuDurumu(m, planlananAdim),
      toplamAdim: planlananAdim,
      bitenAdim: adimlar.filter((s) => s.status === 'ok').length,
      // Başlatma hiç tutmadıysa sebebi BURADA: `derived/runs/<id>/baslatilamadi.json`.
      // Ekranın "yükleniyor" diye sonsuza kadar dönmesindense hatayı göstermesi gerek.
      baslatilamadi: baslatmaHatasi(
        o.repoRoot,
        runId,
        adimlar
          .map((s) => s.finishedAt)
          .filter((x): x is string => typeof x === 'string')
          .sort()
          .pop()
      ),
      adimlar: adimlar.map((s) => ({
        id: s.stepId,
        verb: s.verb,
        durum: s.status,
        saglayici: s.providerId ?? null,
        basladi: s.startedAt ?? null,
        bitti: s.finishedAt ?? null,
        saniye:
          typeof s.startedAt === 'string' && typeof s.finishedAt === 'string'
            ? Math.round(
                (new Date(s.finishedAt).getTime() - new Date(s.startedAt).getTime()) / 1000
              )
            : null,
        maliyetMikros: String(s.actualCost?.micros ?? '0'),
      })),
    })
  })

  // ⚠ Varlık BYTE'ı: panelde slaytı görebilmek için. İçerik-adresli depodan okunuyor;
  // `digest` dışında hiçbir yol kabul edilmiyor — serbest bir dosya yolu, panelin
  // depo dışını okumasına açık kapı bırakırdı.
  // Elle düzenlenmiş slaytı SERVİS ETMEK için: byte koşu dizininde, damgalı depoda
  // değil. Ad KATI biçimde doğrulanıyor — dizin dışına çıkan bir ad, sunucuyu dosya
  // okuyucusuna çevirirdi.
  app.get('/api/kosu/:runId/elle/:ad', (c) => {
    const ad = c.req.param('ad')
    if (!/^(slayt-\d{2}-elle\.png|elle-gorsel-\d{2}\.(png|jpg))$/.test(ad)) {
      return c.json({ ok: false, hata: 'gecersiz ad' }, 400)
    }
    const runId = c.req.param('runId')
    if (!/^run_[0-9a-f-]+$/.test(runId)) return c.json({ ok: false, hata: 'gecersiz run' }, 400)
    const yol = join(o.repoRoot, RUNS_DIR, runId, ad)
    if (!existsSync(yol)) return c.json({ ok: false, hata: 'dosya yok' }, 404)
    return new Response(new Uint8Array(readFileSync(yol)), {
      headers: {
        'content-type': ad.endsWith('.jpg') ? 'image/jpeg' : 'image/png',
        'cache-control': 'no-store',
      },
    })
  })

  // ── PANELDEN GÖRSEL YÜKLEME (FAZ-17.3) ───────────────────────────────────
  //
  // ⚠ ⚠ **ÜRÜN TANITIMINDA MODEL GÖRSELİ YANLIŞ CEVAPTIR.** Depo sahibi: *"bazen ürün
  // tanıtımı yapıyoruz, corpus'a yüklemedik ama panelden de üretime dahil edilmeli"*.
  // Gerçek ürünün fotoğrafı varken onu ÜRETMEYE çalışmak hem para harcar hem yanlış
  // ürünü çizer.
  //
  // ⚠ Dosya koşu dizinine iniyor ve hat onu `elle_gorsel_<sıra>` parametresiyle
  // okuyor. Corpus'a YAZMIYOR: corpus'a yazma yetkisi insanın git commit'i (R-14) ve
  // bir yüklemenin o kapıyı atlaması, marka bilgisine denetimsiz giriş açardı.
  //
  // ⚠ Tür MAGIC BYTE ile doğrulanıyor, uzantıyla değil: `.png` adlı bir betik `.png`
  // olmaz. `repo-hygiene` kapısı da aynı yöntemi kullanıyor.
  app.post('/api/kosu/:runId/gorsel', async (c) => {
    const runId = c.req.param('runId')
    if (!/^run_[0-9a-f-]{8,64}$/.test(runId))
      return c.json({ ok: false, hata: 'gecersiz run' }, 400)
    const dizin = join(o.repoRoot, RUNS_DIR, runId)
    if (!existsSync(dizin)) return c.json({ ok: false, hata: `çalıştırma yok: ${runId}` }, 404)

    const g = (await c.req.json().catch(() => ({}))) as { sira?: number; base64?: string }
    const sira = typeof g.sira === 'number' && g.sira >= 1 && g.sira <= 12 ? Math.trunc(g.sira) : 1
    const ham = (g.base64 ?? '').replace(/^data:[^;]+;base64,/, '')
    if (ham === '') return c.json({ ok: false, hata: 'dosya boş' }, 400)
    let bayt: Buffer
    try {
      bayt = Buffer.from(ham, 'base64')
    } catch {
      return c.json({ ok: false, hata: 'base64 çözülemedi' }, 400)
    }
    // ⚠ 8 MB: bir slayt görseli bundan büyük olmaz ve sınırsız bir uç, diski dolduran
    // bir uçtur. Byte `derived/runs` altında ve o dizin git'e giriyor — ama `*.png`
    // zaten gitignore'lu (R-64 · D-38).
    if (bayt.length > 8 * 1024 * 1024) return c.json({ ok: false, hata: 'dosya 8 MB üstü' }, 400)
    const png = bayt.subarray(0, 8).toString('hex') === '89504e470d0a1a0a'
    const jpg = bayt.subarray(0, 3).toString('hex') === 'ffd8ff'
    if (!png && !jpg) return c.json({ ok: false, hata: 'yalnız PNG ya da JPEG' }, 400)
    const ad = `elle-gorsel-${String(sira).padStart(2, '0')}.${png ? 'png' : 'jpg'}`
    try {
      writeFileSync(join(dizin, ad), bayt)
    } catch (e) {
      return c.json({ ok: false, hata: `yazılamadı: ${String(e)}` }, 500)
    }
    yayinla('degisim')
    return c.json({ ok: true, ad, sira, bayt: bayt.length })
  })

  app.get('/api/varlik/:digest', (c) => {
    const d = c.req.param('digest').replace(/^sha256:/, '')
    if (!/^[0-9a-f]{64}$/.test(d)) return c.json({ ok: false, hata: 'gecersiz digest' }, 400)
    const yol = join(o.repoRoot, 'derived/blobs', d.slice(0, 2), `${d}.png`)
    if (!existsSync(yol)) return c.json({ ok: false, hata: 'varlik yok' }, 404)
    return new Response(new Uint8Array(readFileSync(yol)), {
      headers: { 'content-type': 'image/png', 'cache-control': 'no-store' },
    })
  })

  // ── varlık "silme" = KARANTİNA (FAZ-17.2) ────────────────────────────────
  //
  // ⚠ ⚠ **BYTE SİLİNMİYOR, TAŞINIYOR — ve bu senkron kalmanın tek yolu.** Manifest
  // varlığın digest'ini KANIT olarak taşıyor (§13); byte'ı yok etmek defteri
  // sarkan bir işaretçiyle bırakırdı ve panel kırık bir görsel gösterirdi. Karantina
  // zaten "yayınlanamaz ama korunur" demek (D-155) ve tam olarak aranan anlam bu.
  //
  // ⚠ Sebep ZORUNLU: gerekçesiz karantina, altı ay sonra "bu neden burada" sorusunu
  // cevapsız bırakır ve kimse geri almaya cesaret edemez.
  app.post('/api/varliklar/karantina', async (c) => {
    const g = (await c.req.json().catch(() => ({}))) as {
      digests?: readonly string[]
      sebep?: string
    }
    const sebep = (g.sebep ?? '').trim()
    if (sebep === '') return c.json({ ok: false, hata: 'sebep zorunlu' }, 400)
    const hedefler = (g.digests ?? []).map((d) => d.replace(/^sha256:/, ''))
    if (hedefler.length === 0) return c.json({ ok: false, hata: 'digest yok' }, 400)
    const tasinan: string[] = []
    for (const d of hedefler) {
      if (!/^[0-9a-f]{64}$/.test(d)) continue
      const kaynak = join(o.repoRoot, 'derived/blobs', d.slice(0, 2), `${d}.png`)
      if (!existsSync(kaynak)) continue
      const hedefDizin = join(o.repoRoot, 'derived/karantina', d.slice(0, 2))
      mkdirSync(hedefDizin, { recursive: true })
      renameSync(kaynak, join(hedefDizin, `${d}.png`))
      const meta = `${kaynak}.meta.json`
      if (existsSync(meta)) renameSync(meta, join(hedefDizin, `${d}.png.meta.json`))
      tasinan.push(d)
    }
    // ⚠ Gerekçe DEFTERE yazılıyor, bir alan güncellenmiyor: karantina bir OLAY ve
    // olaylar append-only kayıt ister (§13).
    appendFileSync(
      join(o.repoRoot, 'derived/karantina/defter.ndjson'),
      `${tasinan.map((d) => JSON.stringify({ digest: d, sebep, at: o.simdi() })).join('\n')}\n`
    )
    yayinla('degisim')
    return c.json({ ok: true, tasinan: tasinan.length })
  })

  // Reuse: varlığı DEĞİL, onu üreten çalıştırmayı açar — kopyalanacak olan bayt değil,
  // KARARDIR (donmuş girdiler, konu, bağlam).
  app.get('/api/varliklar/:runId/yeniden-kullan', (c) => {
    const runId = c.req.param('runId')
    if (!yenidenKullanilabilir(o.repoRoot, runId)) {
      // Manifest yoksa Reuse YAPILAMAZ ve bu sessiz kalmaz: "kopyalandı" deyip boş bir
      // form açmak, kullanıcının donmuş girdileri elle yeniden yazması demekti.
      return c.json({ ok: false, hata: `çalıştırma manifesti yok: ${runId}` }, 404)
    }
    const m = readManifest(o.repoRoot, runId as never)
    if (m === null) return c.json({ ok: false, hata: 'manifest okunamadı' }, 422)
    return c.json({
      ok: true,
      pipeline: m.pipeline,
      brandId: m.brandId,
      eraId: m.eraId,
      // Donmuş girdiler: aynı kararla yeniden koşmak için gereken her şey.
      params: m.steps.map((s) => s.params).find((p) => Object.keys(p).length > 0) ?? {},
      context: m.context,
      corpusCommit: m.corpusCommit,
    })
  })

  // ── Telegram botu: YÜZEY SINIRI (§4c, §9.4 · D-19 · FAZ-4.13) ─────────────
  //
  // Webhook ucu. Bot yalnız onay/red/gerekçe işler; yasak komutlar GEREKÇESİYLE geri
  // çevrilir — sessizce yok saymak, "belki ileride" demenin sessiz hâli olurdu.
  //
  // ⚠ Uç, token gerçek olmasa da AÇIKTIR: yüzey sınırı token'a bağlı bir davranış
  // değil, bir sözleşme. Test ve kapı onu token olmadan da doğrulayabilmeli.
  app.post('/api/telegram/webhook', async (c) => {
    const govde = (await c.req.json().catch(() => null)) as {
      message?: { text?: string }
      callback_query?: { data?: string }
    } | null
    if (govde === null) return c.json({ ok: false, hata: 'geçersiz JSON' }, 400)

    // Inline klavye basımı: `onay|<run_id>|<gate>`.
    const cb = govde.callback_query?.data
    if (typeof cb === 'string') {
      const p = parseCallback(cb)
      if (p === null) return c.json({ ok: false, hata: 'bozuk callback' }, 400)
      // Red inline klavyeden GEREKÇESİZ gelir — bot gerekçe İSTER, karar yazmaz.
      if (p.eylem === 'red') {
        return c.json({ ok: true, cevap: `/reddet ${p.runId} ${p.gate} <gerekçe>` })
      }
      const r = kararVer({
        repoRoot: o.repoRoot,
        runId: p.runId,
        gate: p.gate,
        karar: 'approved',
        gerekce: '',
        at: o.simdi(),
      })
      yayinla('degisim')
      return c.json(r, r.ok ? 200 : 409)
    }

    const komut = parseKomut(govde.message?.text ?? '')
    switch (komut.kind) {
      case 'yasak':
        // 403: komut TANINIYOR ama bu yüzeyde yok. 404 olsaydı "böyle bir komut yok"
        // derdi ve kullanıcı başka yazımlar denerdi.
        return c.json({ ok: false, komut: komut.komut, neden: komut.neden }, 403)
      case 'kuyruk':
        return c.json({ ok: true, bekleyenler: bekleyenler(o.repoRoot) })
      case 'yardim':
        return c.json({ ok: true, cevap: YARDIM })
      case 'onayla':
      case 'reddet': {
        const r = kararVer({
          repoRoot: o.repoRoot,
          runId: komut.runId,
          gate: komut.gate,
          karar: komut.kind === 'onayla' ? 'approved' : 'rejected',
          gerekce: komut.kind === 'reddet' ? komut.gerekce : '',
          at: o.simdi(),
        })
        yayinla('degisim')
        return c.json(r, r.ok ? 200 : 409)
      }
      case 'bilinmeyen':
        return c.json({ ok: false, cevap: YARDIM }, 400)
    }
  })

  // ── maliyet ve bütçe (§8.3, §12.9 · D-17 · FAZ-4.12) ──────────────────────
  app.get('/api/butce', (c) => c.json(butcePanosu(o.repoRoot)))

  app.put('/api/butce', async (c) => {
    const govde = (await c.req.json().catch(() => null)) as {
      perRunMicros?: string | null
      perMonthMicros?: string | null
    } | null
    if (govde === null) return c.json({ ok: false, hata: 'geçersiz JSON' }, 400)
    let r
    try {
      r = tavanYaz(o.repoRoot, govde, o.simdi())
    } catch {
      // `BigInt('abc')` fırlatır — sayı olmayan bir tavan 500 değil 400'dür.
      return c.json({ ok: false, hata: 'tavan tam sayı (USD mikro) ya da null olmalı' }, 400)
    }
    yayinla('degisim')
    return c.json(r, r.ok ? 200 : 422)
  })

  // ── şema editörü: KURU ÇALIŞTIRMA (§3.3, §12.9 · FAZ-4.11) ────────────────
  //
  // **Yazma ucu YOK.** Şema `registry/entity-types/`de yaşar ve oraya yazmak insanın
  // git commit'idir (R-14). Bu uç yalnız "kaydedersem ne olur" sorusunu cevaplar;
  // cevabı görüp commit etmek kullanıcının işi.
  app.get('/api/semalar', (c) => c.json({ semalar: semaListesi(o.repoRoot) }))

  app.post('/api/semalar/:tip/kuru', async (c) => {
    const onerilen = await c.req.json().catch(() => null)
    if (onerilen === null) return c.json({ ok: false, hata: 'geçersiz JSON' }, 400)
    const r = kuruCalistir(o.repoRoot, c.req.param('tip'), onerilen)
    if (!r.ok) return c.json(r, 422) // şema profil dışı — analiz hiç yapılamadı

    // ⚠ `ok: true` "analiz koştu" demek, "değişiklik güvenli" DEĞİL. İlk sürüm ikisini
    // karıştırıp reddedilen bir göçe 200 dönüyordu: durum koduna bakan bir istemci
    // yıkıcı bir değişikliği başarılı sanardı (D-178).
    return c.json(r, r.impact.safe ? 200 : 409)
  })

  // ── keşif planı: Reconciliation (§4.4, §12.9 · FAZ-4.10) ──────────────────
  //
  // **Kaydedilmiş bir planı OKUR, yeni plan kurmaz.** Plan kurmak keşif çalıştırması
  // demek ve o `just discovery plan` ile insanın başlattığı bir iştir (R-14) —
  // bir ekranın sayfa yenilemesiyle tetiklenmez.
  app.get('/api/discovery', (c) => {
    // Yol düz dize DEĞİL: `runDir` tek otoritedir (chokepoints → `manifest-yazici`).
    // İkinci bir literal, defterin yeri değiştiğinde ekranın olmayan bir dosyayı
    // aramasıydı — ve "plan yok" ile "plan başka yerde" ayırt edilemezdi.
    // Dosya adı da kernel'den: `'plan.json'` literali burada ikinci bir otoriteydi
    // ve donmuş planla aynı adı taşıyordu (2026-08-16 denetimi).
    const yol = join(o.repoRoot, discoveryPlanPath(c.req.query('run') ?? ''))
    if (!existsSync(yol)) {
      // Boş plan DÖNMÜYORUZ: boş bir dört sütun "değişiklik yok" okunur, oysa plan
      // hiç koşmamış olabilir — ikisi zıt sonuçlar (§4.4).
      return c.json({ ok: false, hata: 'plan yok — `just discovery plan --kaydet <yol>`' }, 404)
    }
    try {
      const plan = JSON.parse(readFileSync(yol, 'utf8')) as {
        ops: DiscoveryOpView[]
        halted?: HaltedRecord[]
      }
      const sutunlar = byColumn(plan.ops as never)
      return c.json({
        ok: true,
        halted: plan.halted ?? [],
        etiketler: COLUMN_LABELS,
        sutunlar,
      })
    } catch {
      return c.json({ ok: false, hata: 'plan okunamadı (bozuk JSON)' }, 422)
    }
  })

  // ── platform yerleşimleri (§9.1 · FAZ-4.9) ────────────────────────────────
  //
  // Spec KOD OLARAK tutulur (`render`), ekrana API'den gelir: tarayıcı halkası
  // `render`ı import edemez (Playwright çeker) ve ikinci bir kopya tutmak, spec
  // güncellendiğinde ekranın eski ölçüyle çizmesi demekti (D-176).
  // ── katalog: koşu başlatırken şablon SEÇİLEBİLSİN (Yasa 13) ──────────────
  //
  // ⚠ ⚠ **SEÇİM MOTORDA ZATEN VARDI, PANELDE YOKTU.** `sablonSecimiIcin` çalıştırma
  // parametresi `sablon`ı okuyor ve CLI onu `--sablon sahne` ile geçirebiliyordu;
  // panelde hiçbir yerde görünmüyordu. Var olan bir yeteneğin arayüzü yoksa, kullanıcı
  // için o yetenek YOKTUR.
  //
  // ⚠ Yalnız KULLANILABİLİR şablonlar: kataloğa eklenmiş ama üretilemeyen bir şablonu
  // seçtirmek, seçimi bir hataya çevirirdi (`kullanilabilir.sebep` o yüzden var).
  app.get('/api/katalog', (c) =>
    c.json({
      sablonlar: KATALOG.map((s) => ({
        id: s.id,
        ad: s.ad,
        slaytMin: s.slayt.min,
        slaytMax: s.slayt.max,
        kullanilabilir: s.kullanilabilir.durum,
        sebep: s.kullanilabilir.sebep,
      })),
    })
  )

  app.get('/api/yerlesimler', (c) =>
    c.json({
      yerlesimler: PLACEMENTS.map((p) => ({
        ...p,
        band: safeBand(p),
        // Spec YAŞI da gidiyor: üç aylık drift denetimi (§9.1) ekranda da görünmeli,
        // yoksa operatör bayat bir ölçüye göre yargı verir.
        yasGun: specAgeDays(p, o.simdi().slice(0, 10)),
      })),
    })
  )

  // ── QA okumaları: bir çalıştırmanın tolerans raporu (§11.1 · FAZ-4.8) ─────
  //
  // Manifest'ten okunur, YENİDEN ÖLÇÜLMEZ: yeniden ölçmek Chromium açmak demek ve
  // o zaman ekranda gördüğünüz, çalıştırmanın ölçtüğü şey olmazdı (§13: manifest bir
  // çalıştırmanın TEK kanıtıdır).
  app.get('/api/calistirma/:runId/qa', (c) => {
    const m = readManifest(o.repoRoot, c.req.param('runId') as never)
    if (m === null) return c.json({ ok: false, hata: 'çalıştırma yok' }, 404)

    const okumalar = m.steps.flatMap((s) => {
      const r = (s.output as { qaReadings?: unknown } | null | undefined)?.qaReadings
      return Array.isArray(r) ? (r as ToleranceReading[]) : []
    })

    // Boş liste "her şey yolunda" DEĞİLDİR: QA hiç koşmamış olabilir. Ayrımı bileşen
    // yapabilsin diye `olculdu` bayrağı ayrı gidiyor.
    return c.json({
      ok: true,
      olculdu: okumalar.length > 0,
      readings: okumalar,
      blocked: okumalar.some((r) => r.status === 'out'),
      warnings: okumalar.filter((r) => r.status === 'warn').length,
    })
  })

  // ── onay kuyruğu (§12.5, §12.9 · R-14 · FAZ-4.7) ──────────────────────────
  // ⚠ ⚠ **HAT LİSTESİ EKRANDA YOKTU.** Üret ekranı komut paletinden gelen tek bir
  // hatta kilitliydi (`instagram-post`) ve on bir hat varken kullanıcı tür
  // seçemiyordu. Liste DİZİNDEN okunuyor: elle yazılmış bir menü, yeni bir hat
  // eklendiği gün sessizce eskirdi.
  // ⚠ ⚠ **EMEKLİ HAT MENÜDE OLGUN BİR SEÇENEK GİBİ DURUYORDU.** Uç yalnız dosya adı
  // listeliyordu; `instagram-carousel` (D-268'de emekli, yerine `instagram-karosel`)
  // listede yan yana görünüyor ve hangisinin güncel olduğu ekrandan anlaşılmıyordu.
  // Emeklilik dosyanın BAŞINDA yorum olarak yazıyordu — makine yorumu okumaz.
  // Emekliler gizleniyor ama SAYISI dönüyor: sessizce kısalan bir liste, silinmiş
  // gibi okunur (Yasa 10).
  app.get('/api/hatlar', (c) => {
    const d = hatDurumlari(join(o.repoRoot, 'registry/pipelines'))
    return c.json({
      hatlar: d.aktif,
      emekli: d.emekli,
      // ⚠ ⚠ **"KONUYU SİSTEM SEÇSİN" HER HATTIN YAPABİLECEĞİ BİR ŞEY DEĞİL** ve panel
      // bunu bilmeden vaat ediyordu. Ölçülen sonuç: `instagram-post` konusuz
      // başlatıldı, o hatta `konu-sec` adımı YOK, konu boş kaldı ve ikinci adım
      // `MISSING_TOPIC` ile düştü — ekranda boş bir koşu. Bir kutucuk, arkasındaki
      // hattın tutamayacağı bir sözü veremez.
      konuSecebilen: d.aktif.filter((h) => konuSecebilirMi(o.repoRoot, h)),
    })
  })

  // ⚠ ⚠ **KONUYU SİSTEM SEÇERKEN SEÇEN ŞEY MODEL, UÇ DEĞİL.**
  //
  // İlk sürüm burada deterministik seçim yapıyordu: aday listesinin İLK başlığı. Depo
  // sahibi ilk denemede yakaladı — her öneri aynı konuydu ("Excel ve vardiya defteri")
  // çünkü bir listenin ilk elemanı "en uygun" değil yalnız "ilk"tir. Seçim artık
  // hattın `konu-sec` adımında, markanın kayıtlarına bakan agent tarafından yapılıyor.
  //
  // Bu uç yalnız **adayları gösteriyor**: insan neyin arasından seçileceğini
  // başlatmadan önce görsün (Yasa 2). Karar vermiyor.
  app.get('/api/konu-adaylari', (c) => {
    if (db === null) return c.json({ ok: false, hata: 'indeks yok — `just reindex` çalıştır' })
    const adaylar = konuAdaylari({ db, query: o.query, repoRoot: o.repoRoot })
    if (adaylar.length === 0) {
      return c.json({
        ok: false,
        hata:
          'aday konu kalmadı — corpus başlıklarının hepsi işlenmiş. ' +
          'Yeni bir kayıt ekle ya da konuyu elle yaz.',
      })
    }
    return c.json({ ok: true, adaylar, islenmis: islenmisKonular(o.repoRoot).size })
  })

  app.get('/api/kuyruk', (c) => c.json({ bekleyenler: bekleyenler(o.repoRoot) }))

  // ⚠ ⚠ **ONAYLANANLAR GÖRÜNMÜYORDU.** Kuyruk yalnız bekleyeni gösteriyor; onaylanan
  // bir gönderi listeden düşüyor ve bir daha görünmüyordu — "onayladım da ne oldu"
  // sorusunun cevabı hiçbir yerde yoktu. Kararlar zaten manifestte; eksik olan tek
  // şey onları okuyan bir uçtu.
  app.get('/api/kararlar', (c) => {
    const satirlar = calistirmalar(o.repoRoot).flatMap((r) => {
      const m = readManifest(o.repoRoot, r.runId as never)
      return (m?.decisions ?? []).map((d) => ({
        runId: r.runId,
        pipeline: m?.pipeline ?? '',
        gate: d.gate,
        decision: d.decision,
        at: d.at,
        note: d.note ?? null,
      }))
    })
    // En yeni önce: bir kararın ne zaman verildiği, verildiği sırayla okunur.
    return c.json({ kararlar: satirlar.sort((a, b) => b.at.localeCompare(a.at)) })
  })

  // ── kanal durumu: token ömrü · oran bütçesi · sürüm sabiti (§9.4 · FAZ-7.7) ─
  //
  // Limiter GEÇİLMİYOR ve bu bilinçli: kovalar çalıştırma sürecinde yaşıyor. Burada
  // yeni bir limiter kurup sormak her seferinde "kova dolu" derdi — sağlayıcı 429
  // dönerken ekranda yeşil bir çubuk. Uç `kalan: null` döner, ekran "ölçülmedi" der.
  app.get('/api/kanallar', (c) => c.json(kanalPanosu({ repoRoot: o.repoRoot, simdi: o.simdi() })))

  // ── performans panosu (§13, §11.2 · FAZ-7.9) ──────────────────────────────
  //
  // **GET ve yazmıyor.** Geri besleme önerisi bu uçtan geçmez: corpus'a yazan tek
  // yol `corpus.propose()` ve onu İNSAN tetikler (R-14). Panoya bir "corpus'a yaz"
  // düğmesi koymak, onayı bir tıklamaya indirmek olurdu.
  // ── compliance panosu (§11.3 · FAZ-8.3) ──────────────────────────────────
  //
  // GET ve yazmıyor: uyum kaydı ÜRETİM anında basılır, panodan düzeltilmez. Bir
  // "uyumlu işaretle" düğmesi, dayanaksız iddiayı bir tıklamaya indirirdi (D-23).
  app.get('/api/uyum', (c) => c.json(uyumPanosu(o.repoRoot)))

  // ── yerel MCP yüzeyi (§3.8 · D-33 · D-226 · FAZ-8.9) ─────────────────────
  //
  // **Claude Code, UI'ın gördüğü AYNI projeyi görür.** Ham dosya okumaktan farkı:
  // sonuçlar retrieval yükleminden geçiyor (emekli kayıt görünmez), arama Türkçe
  // (FTS5 + trigram), ve yazma yolu `propose` — yani `draft` ve imzalı.
  //
  // ⚠ `derived/ingest/` ASLA açılmıyor (R-50): karantina metni talimat olarak
  // sunulamaz. Bir MCP aracı onu döndürseydi, prospect'in sitesindeki bir cümle
  // modele komut olarak ulaşırdı.
  app.get('/mcp/araclar', (c) => c.json({ araclar: ARACLAR }))

  app.post('/mcp/cagir/:arac', async (c) => {
    const arac = c.req.param('arac')
    const aracTanimi = ARACLAR.find((a) => a.ad === arac)
    if (aracTanimi === undefined) {
      const r: McpRet = { kind: 'unknown_tool', ad: arac }
      return c.json({ hata: mcpHataMesaji(r) }, 404)
    }
    if (db === null) {
      // İndeks yoksa BOŞ SONUÇ dönmüyoruz: arama hiç koşmadı ve "sonuç yok" demek
      // corpus'un boş olduğunu söylerdi (D-175).
      return c.json({ hata: mcpHataMesaji({ kind: 'index_missing' }) }, 503)
    }
    const govde = (await c.req.json().catch(() => ({}))) as Record<string, unknown>

    // ⚠ **Şema baştan beri yazılıydı ve HİÇ zorlanmıyordu** (D-234): `-d '{}'`
    // çağrısı HTTP 200 ve `{"sonuclar":[]}` dönüyordu — arama koşmadan "sonuç yok".
    // Bu, birkaç satır yukarıdaki yorumun yasakladığı şeyin ta kendisiydi (D-175).
    const semaRed = girdiDogrula(aracTanimi, govde)
    if (semaRed !== null) return c.json({ hata: mcpHataMesaji(semaRed) }, 422)

    if (arac === 'corpus_search') {
      // `selectSearch` aramayı ve yüklemi BİRLİKTE uyguluyor — ikisini ayrı
      // çağırmak yüklemin ikinci bir kopyası olurdu (R-13: tek yer).
      const q = typeof govde['query'] === 'string' ? govde['query'] : ''
      const limit = typeof govde['limit'] === 'number' ? govde['limit'] : 20
      return c.json({ sonuclar: selectSearch(db, o.query, q, limit) })
    }

    if (arac === 'corpus_get') {
      const id = typeof govde['id'] === 'string' ? govde['id'] : ''
      const gorunur = new Set(selectRecords(db, o.query).map((r) => r.id))
      // Yüklemden geçmeyen kayıt BULUNAMADI sayılır: "var ama göremezsin" demek,
      // emekli bir kaydın varlığını sızdırmak olurdu.
      if (!gorunur.has(id)) return c.json({ kayit: null }, 404)
      return c.json({ kayit: selectRecords(db, o.query).find((r) => r.id === id) ?? null })
    }

    // corpus_propose — TEK yazma yolu (R-14)
    const fm = (govde['frontmatter'] ?? {}) as Record<string, unknown>
    const redd = oneriDogrula(fm)
    if (redd !== null) return c.json({ hata: mcpHataMesaji(redd) }, 422)
    const sonuc = propose({
      root: join(o.repoRoot, 'corpus'),
      entityType: String(govde['entityType'] ?? ''),
      slug: String(govde['slug'] ?? ''),
      frontmatter: fm,
      body: String(govde['body'] ?? ''),
    })
    return sonuc.ok
      ? c.json({ path: sonuc.path, status: 'draft' })
      : c.json({ hata: mcpHataMesaji({ kind: 'write_refused', neden: sonuc.refusal.kind }) }, 422)
  })

  app.get('/api/performans', (c) => {
    const yayinlar = readLedger(o.repoRoot)
    if (!yayinlar.ok) return c.json({ hata: yayinlar.error }, 422)
    const olcumler = readInsights(o.repoRoot)
    return c.json({
      pano: performansPanosu({
        yayinlar: yayinlar.entries,
        olcumler: olcumler.ok ? olcumler.satirlar : [],
        bugun: o.simdi().slice(0, 10),
        metrik: c.req.query('metrik') ?? 'reach',
      }),
      // Ölçüm defteri okunamadıysa pano "hepsi eksik ölçüm" der; SEBEBİNİ de
      // söylemezse operatör onu içerik sorunu sanar.
      olcumHatasi: olcumler.ok ? null : olcumler.error,
    })
  })

  // ⚠ ⚠ **ONAY SONRASI SÜRDÜRME.** Kapı kararı yazmak yetmiyordu: panelde "onayla"
  // dendiğinde karar deftere düşüyor ve hat ORADA kalıyordu — düğmeler yerinde,
  // hiçbir şey değişmiyor. Bir onay düğmesi, onayın sonucunu doğurmuyorsa düğme değil
  // bir yanılsamadır. Ayrı uç: karar yazmak ile hattı sürdürmek AYRI eylemler ve
  // reddedilen bir kapı sürdürülmez.
  app.post('/api/kosu/:runId/surdur', async (c) => {
    const runId = c.req.param('runId')
    const m = readManifest(o.repoRoot, runId as never)
    if (m === null) return c.json({ ok: false, hata: `manifest yok: ${runId}` }, 404)
    const r = calistirmaSurdur({
      repoRoot: o.repoRoot,
      pipelineId: m.pipeline,
      runId,
      env: o.saglayiciEnv ?? o.env ?? {},
    })
    if (r.ok) yayinla('degisim')
    return c.json(r, r.ok ? 202 : 400)
  })

  app.post('/api/kuyruk/:runId/:gate', async (c) => {
    const govde = (await c.req.json().catch(() => ({}))) as {
      karar?: string
      gerekce?: string
    }
    const karar = govde.karar === 'rejected' ? 'rejected' : 'approved'
    const r = kararVer({
      repoRoot: o.repoRoot,
      runId: c.req.param('runId'),
      gate: c.req.param('gate'),
      karar,
      gerekce: govde.gerekce ?? '',
      at: o.simdi(),
    })
    yayinla('degisim')
    return c.json(r, r.ok ? 200 : 409)
  })

  // ── run launcher: planı kur, DONDUR, kilidi hesapla (§8.3 · FAZ-4.6b) ─────
  //
  // GET ve hiçbir şey harcamaz (R-47): `plan()` kuru ikizleri çağırır. Dondurma da
  // yan etkisiz — donmuş plan yalnız cevapta döner; onaylanan plan çalıştırma anında
  // motora GERİ VERİLİR (`runPipeline({ frozen })`).
  app.get('/api/plan', async (c) => {
    const tavanMikros = c.req.query('tavan_mikros')
    // ⚠ Konu PLANA girer, çünkü özet adım kısıtlarını kapsar. Konusuz dondurulmuş
    // bir özet, konuyla koşan CLI'nin özetiyle asla eşleşmez (R-07).
    const r = launcherPlani({
      params: kosuParametreleri({
        repoRoot: o.repoRoot,
        brandId: String(o.query.brandId),
        konu: c.req.query('konu') ?? '',
        // ⚠ ⚠ **ÖLÇÜLDÜ: `plan()` BUGÜN `params` OKUMUYOR.** `PlanInput` şemasında böyle
        // bir alan yok; `launcherPlani` onu geçiriyor ve sessizce düşüyor. Yani şablon
        // seçimi donmuş özeti DEĞİŞTİRMİYOR (ölçüm: şablonlu ve şablonsuz özet aynı,
        // `70919055941d`). Seçim çalışma anında `runPipeline` params'ı üzerinden
        // adım kısıtlarına giriyor ve `sablonSecimiIcin` orada okuyor.
        //
        // ⚠ Yine de geçiliyor: CLI ile SİMETRİ. İki çağıran aynı parametreleri
        // hesaplarsa, `plan()` bir gün onları okumaya başladığında ikisi birden doğru
        // olur; biri geçirmiyorsa o gün sessiz bir ayrışma doğar. Borç `D21` olarak
        // yazıldı.
        ...(sablonSecimi(c.req.query('sablon')) === null
          ? {}
          : { serbest: { sablon: sablonSecimi(c.req.query('sablon')) as string } }),
      }),
      repoRoot: o.repoRoot,
      pipelineId: c.req.query('pipeline') ?? '',
      runId: (c.req.query('run') ?? 'run_onizleme') as never,
      brandId: o.query.brandId as never,
      eraId: o.query.eraId as never,
      corpusCommit: await dunyaCommiti(o.corpusCommit),
      registryCommit: await dunyaCommiti(o.registryCommit),
      frozenAt: o.simdi(),
      // ⚠ ⚠ `[]` idi ve panelden başlatma bu yüzden HİÇ çalışmıyordu: özet
      // `recordIds`i kapsıyor, CLI gerçek kayıtları donduruyor, özetler ayrışıyor
      // ve R-07 kapısı koşuyu reddediyordu. Seçim artık CLI ile AYNI fonksiyondan.
      recordIds:
        db === null
          ? []
          : baglamKayitlari({
              db,
              recipesDir: join(o.repoRoot, 'registry/recipes'),
              recipeId: c.req.query('pipeline') ?? '',
              query: o.query,
            }).map((e) => e.recordId),
      cap:
        tavanMikros === undefined || tavanMikros === ''
          ? null
          : { micros: BigInt(tavanMikros), currency: 'USD' },
      env: o.saglayiciEnv ?? o.env ?? {},
    })
    // `bigint` JSON'a girmez (D-119): para alanları dize olarak yayılır.
    return c.json(
      JSON.parse(JSON.stringify(r, (_k, v) => (typeof v === 'bigint' ? v.toString() : v))),
      r.ok ? 200 : 404
    )
  })

  // ── çalıştırmayı BAŞLAT (§4c · R-07 · FAZ-4.6b) ───────────────────────────
  //
  // POST çünkü DURUM DEĞİŞTİRİR ve para harcayabilir — GET olsaydı bir sayfa
  // yenilemesi çalıştırma başlatırdı. `/api/plan` GET ve hiçbir şey harcamıyor;
  // ayrım kasıtlı.
  app.post('/api/calistir', async (c) => {
    const govde = (await c.req.json().catch(() => ({}))) as {
      pipeline?: string
      konu?: string
      planDigest?: string
      konuyuSistemSecsin?: boolean
      sablon?: string
    }
    // ⚠ Hattın tutamayacağı söz BAŞLAMADAN reddediliyor: doomed bir koşu başlatmak,
    // insana boş bir ekran ve defterde bir enkaz bırakır.
    if (govde.konuyuSistemSecsin === true && !konuSecebilirMi(o.repoRoot, govde.pipeline ?? '')) {
      return c.json(
        {
          ok: false,
          hata:
            `'${govde.pipeline ?? ''}' hattı kendi konusunu seçemiyor (\`konu-sec\` adımı yok). ` +
            'Konuyu yaz ya da konu seçebilen bir hat kullan.',
        },
        400
      )
    }
    const r = calistirmaBaslat({
      repoRoot: o.repoRoot,
      pipelineId: govde.pipeline ?? '',
      konu: govde.konu ?? '',
      // Boş = "sistem seçsin" (agent kararı). Açık seçim varsa hat onu kullanır.
      ...(sablonSecimi(govde.sablon) === null
        ? {}
        : { sablon: sablonSecimi(govde.sablon) as string }),
      // ⚠ Konusuz başlatma AÇIKÇA istenir. Boş konuyu sessizce "sistem seçsin" saymak,
      // yanlışlıkla boş bırakılan bir alanı onay yerine koymak olurdu.
      konuyuSistemSecsin: govde.konuyuSistemSecsin === true,
      planDigest: govde.planDigest ?? '',
      env: o.saglayiciEnv ?? o.env ?? {},
    })
    if (r.ok) yayinla('degisim')
    // 202: kabul edildi ama BİTMEDİ. 200 dönmek "çalıştırma tamam" okunurdu.
    return c.json(r, r.ok ? 202 : 400)
  })

  // rerun / replay — AYRI uçlar çünkü AYRI eylemler (FAZ-4.15).
  // `rerun` donmuş plan yoksa CLI tarafından REDDEDİLİR; ekran zaten düğmeyi kilitli
  // gösteriyor ama sunucu buna güvenmiyor: istemcinin kilidi bir güvenlik sınırı değil.
  app.post('/api/calistirmalar/:runId/:kind', (c) => {
    const kind = c.req.param('kind')
    if (kind !== 'rerun' && kind !== 'replay') {
      return c.json({ ok: false, hata: `bilinmeyen eylem: ${kind}` }, 404)
    }
    const kaynak = c.req.param('runId')
    const m = readManifest(o.repoRoot, kaynak as never)
    if (m === null) return c.json({ ok: false, hata: `çalıştırma manifesti yok: ${kaynak}` }, 404)
    const r = tekrarBaslat({
      repoRoot: o.repoRoot,
      pipelineId: m.pipeline,
      kaynakRunId: kaynak,
      kind,
      env: o.saglayiciEnv ?? o.env ?? {},
    })
    if (r.ok) yayinla('degisim')
    return c.json(r, r.ok ? 202 : 400)
  })

  // ── ters indeks: bu kaydı hangi çalıştırma kullandı (§12.9 · FAZ-4.4) ─────
  app.get('/api/kayitlar/:id/etki', (c) => {
    const s = tersIndeks(o.repoRoot, c.req.param('id'))
    return c.json({ ...s, ozet: tersIndeksOzeti(s) })
  })

  // ── bağlam önizleme (§5.3, §12.9 · FAZ-4.5) ───────────────────────────────
  //
  // `haric` çoklu sorgu parametresi: `?tarif=instagram-post&haric=rec_a&haric=rec_b`.
  // GET seçildi çünkü bu uç hiçbir şey DEĞİŞTİRMEZ ve harcamaz (R-47) — önizlemenin
  // yan etkisi olsaydı "çalıştırmadan önce bak" vaadi çökerdi.
  app.get('/api/baglam', (c) => {
    if (db === null) return c.json({ ok: false, hata: 'indeks yok — `just reindex`' }, 503)
    const r = baglamOnizle({
      db,
      recipesDir: join(o.repoRoot, 'registry/recipes'),
      recipeId: c.req.query('tarif') ?? '',
      query: o.query,
      excluded: c.req.queries('haric') ?? [],
    })
    return c.json(r, r.ok ? 200 : 404)
  })

  // ── git zaman çizgisi (§12.9 · FAZ-4.4) ───────────────────────────────────
  //
  // Bir kaydın geçmişi ayrı bir yerde TUTULMAZ: git zaten tutuyor. İkinci bir
  // değişiklik günlüğü, git ile ayrışabilen bir gerçek olurdu (12. yasa: kurtarma
  // `git clone` + `cat`).
  app.get('/api/kayitlar/:tip/:slug/gecmis', async (c) => {
    const yol = `corpus/${c.req.param('tip')}/${c.req.param('slug')}.md`
    const r = await fileHistory(yol, { cwd: o.repoRoot, env: o.env ?? {} })
    return r.ok
      ? c.json({ yol, commitler: r.value })
      : c.json({ yol, commitler: [], hata: 'git geçmişi okunamadı' }, 500)
  })

  // ── yaşam döngüsü: emeklilik ve sabitleme ─────────────────────────────────
  //
  // **SİLME UCU YOKTUR.** Bilerek: `DELETE /api/kayitlar/:id` yazmak, R-12'yi bir
  // konvansiyona indirger. Emeklilik bir yazma işlemidir ve `write.ts`ten geçer.
  app.post('/api/kayitlar/:tip/:slug/emekli', async (c) => {
    const govde = (await c.req.json().catch(() => ({}))) as { supersededBy?: string }
    const r = retireRecord({
      root: join(o.repoRoot, 'corpus'),
      entityType: c.req.param('tip'),
      slug: c.req.param('slug'),
      at: o.simdi(),
      supersededBy: govde.supersededBy ?? null,
    })
    yayinla('degisim')
    return r.ok
      ? c.json({ ok: true, path: r.path })
      : c.json({ ok: false, mesaj: lifecycleMessage(r.refusal) }, 409)
  })

  app.post('/api/kayitlar/:tip/:slug/sabitle', async (c) => {
    const govde = (await c.req.json().catch(() => ({}))) as { pinned?: boolean }
    const r = pinRecord({
      root: join(o.repoRoot, 'corpus'),
      entityType: c.req.param('tip'),
      slug: c.req.param('slug'),
      pinned: govde.pinned === true,
    })
    yayinla('degisim')
    return r.ok
      ? c.json({ ok: true, path: r.path })
      : c.json({ ok: false, mesaj: lifecycleMessage(r.refusal) }, 409)
  })

  // ── SSE ────────────────────────────────────────────────────────────────────
  // İlk mesaj ANINDA gider: UI'ın ilk kalp atışını beklemesi, açılışta boş bir şerit
  // demektir ve boş bir enstrüman "sıfır" okunur.
  app.get('/api/olay', (c) =>
    streamSSE(c, async (stream) => {
      let acik = true
      // ⚠ `false` başlar. `true` başlasaydı ilk durum mesajından hemen sonra AYNI durum
      // ikinci kez giderdi — UI iki "yeni ölçüm" görür, şerit iki kez yanıp söner ve
      // hiçbir şey değişmediği hâlde bir şey olmuş gibi görünür (§12.7: süs hareket,
      // gerçek bir şey olduğunda kimsenin bakmamasına yol açar).
      let bekleyen = false

      const tetikle = (): void => {
        bekleyen = true
      }
      aboneler.add(tetikle)
      stream.onAbort(() => {
        acik = false
        aboneler.delete(tetikle)
      })

      await stream.writeSSE({ event: 'durum', data: JSON.stringify(durumOku()) })

      while (acik) {
        await stream.sleep(o.kalpAtisiMs)
        if (!acik) break
        if (bekleyen) {
          bekleyen = false
          await stream.writeSSE({ event: 'durum', data: JSON.stringify(durumOku()) })
        } else {
          // Kalp atışı VERİ TAŞIMAZ. Taşısaydı UI onu "yeni ölçüm" sanardı ve
          // hiçbir şey değişmediğinde de şerit güncellenmiş gibi görünürdü.
          await stream.writeSSE({ event: 'nabiz', data: o.simdi() })
        }
      }
    })
  )

  return {
    app,
    izleme,
    yayinla,
    kapat: () => {
      izleme.kapat()
      aboneler.clear()
      db?.close()
    },
  }
}
