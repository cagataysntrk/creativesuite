#!/usr/bin/env node
// İhlal bataryası — her BLOCKING kapı KASTEN ihlal edilir (R-71 · FAZ-5.10 · FAZ-9.2).
//
// **Yeşil bir kapı hiçbir şey kanıtlamaz.** Bir kapının çalıştığını görmenin tek yolu
// onu kırmızıya döndürmektir. Bu batarya tek seferlik bir kabuk komutu DEĞİL: FAZ-9.2
// "kural uyum turu" her denetim turunda aynı bataryayı koşacak.
//
// **Üç ayrı şey doğrulanır** (D-186 · D-170):
//   1. İhlal UYGULANDI mı — dosya gerçekten değişti mi
//   2. Kod hâlâ DERLENİYOR mu (derlenmiyorsa test geçersizdir, kapıyı sınamaz)
//   3. Kırmızı DOĞRU kapıdan mı geldi — başka bir kapı maskeliyor olabilir
//
// Her ihlal sonunda dosya GERİ ALINIR ve kapının yeniden yeşile döndüğü doğrulanır.
// Geri alınmayan bir ihlal, bir sonraki turu yalancı kırmızıya boğar.

import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync, unlinkSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const REPO = join(dirname(fileURLToPath(import.meta.url)), '..')

const kapiKos = (ad) => {
  try {
    execFileSync('just', ['gate', ad], { cwd: REPO, encoding: 'utf8', stdio: 'pipe' })
    return { yesil: true, cikti: '' }
  } catch (e) {
    return { yesil: false, cikti: `${e.stdout ?? ''}${e.stderr ?? ''}` }
  }
}

const derleniyorMu = () => {
  try {
    execFileSync('npx', ['tsc', '-b'], { cwd: REPO, encoding: 'utf8', stdio: 'pipe' })
    return true
  } catch {
    return false
  }
}

/**
 * İhlaller. Her biri: hangi kapı · dosyaya ne eklenir · kırmızı çıktıda hangi imza
 * aranır.
 *
 * `imza` ZORUNLU: onsuz batarya "kırmızı oldu" der ama hangi kuraldan olduğunu
 * bilmez — ve bu projede tam olarak bu hata yaşandı (D-200: ihlal dosyası playwright
 * de import ediyordu, kırmızı `chromium-baslatan`dan geldi).
 */
const IHLALLER = [
  {
    kapi: 'turkish-case',
    dosya: 'packages/render/src/capture/ihlal-gecici.ts',
    icerik: 'export const kotu = (s: string): string => s.toUpperCase()\n',
    // ⚠ İmza kapının GERÇEK mesajından alınır, kapı ADINDAN değil: `turkish-case`
    // kapısı "çıplak .toUpperCase()" diyor. İlk sürümde kapı adını aradım ve batarya
    // "kırmızı ama başka kuraldan" dedi — batarya haklıydı, imzam yanlıştı.
    imza: 'toUpperCase()',
  },
  {
    // Onuncu faz açıldığında iki tek-haneli varsayım ortaya çıktı ve İKİSİ DE bu kapının
    // kendi içindeydi: adım taraması `n <= 9`da duruyordu, kapanış regex'i `FAZ-(\d)` idi.
    // FAZ 10'dan itibaren kapı, tam olarak örtmek için var olduğu şeyi — yarım adımların
    // üstünü örtmeyi — serbest bırakacaktı.
    //
    // ⚠ **Çapa KAPININ KAYNAĞINDA, `DURUM.md`de değil.** İlk sürüm `siradaki_adim: 10.1`
    // dizesini hedefliyordu ve o değer HER TURDA değişiyor: batarya ikinci turda
    // "yama hedefi bulunamadı" dedi. Her tur kırılan bir ihlal testi, ihlal testlerini
    // görmezden gelmeyi öğretir — kırılgan bir kapı, kapatılmış bir kapıdır.
    kapi: 'durum',
    dosya: 'scripts/gates/durum.mjs',
    yamalar: [
      {
        ara: "for (const dosya of readdirSync(p('docs/fazlar')).filter((f) => /^FAZ-\\d+\\.md$/.test(f))) {",
        // ⚠ ⚠ **`0..8`, ESKİDEN `0..9` İDİ — ve sebebi bu bataryanın kendi kırılganlığı.**
        // Eski yama FAZ-0..9'u tarıyordu; `siradaki_adim` 10'un altına düştüğü an (bu
        // turda `9.1` oldu) adım BULUNUYOR ve ihlal tetiklenmiyordu — ihlal testi
        // DURUM.md'nin o anki içeriğine bağlıymış.
        // ⚠ **Boş aralık da ÇALIŞMIYOR:** kapının kendi savunması var — hiç adım
        // okunamazsa *"kapı boş geçiyor"* diyip başka bir gerekçeyle düşüyor ve imza
        // tutmuyor. Yani doğru ihlal "hiç okuma" değil, "eksik okuma".
        // ⚠ **KALAN BAĞ, bilerek yazılı:** `siradaki_adim` bir gün FAZ-8 ya da altına
        // dönerse bu giriş yine sessizce geçersizleşir. Fazlar 0–8 kapalı olduğu için
        // dönmeyecek; dönerse burası da güncellenmeli.
        yaz: 'for (let n = 0; n <= 8; n++) {',
      },
      {
        ara: '  const n = Number(/^FAZ-(\\d+)\\.md$/.exec(dosya)[1])\n  const f = `docs/fazlar/${dosya}`',
        yaz: '  const f = `docs/fazlar/FAZ-${n}.md`\n  if (!existsSync(p(f))) continue',
      },
    ],
    imza: 'hiçbir faz dosyasında yok',
  },
  {
    // Metin eğri sınırını kesiyordu ve İKİ KEZ düzeltilip iki kez geri geldi: ilk iki
    // denemede kutu daraltıldı, ama Türkçede kelime bölünmediği için taşma sürdü
    // (R-23). Kapı artık metnin GERÇEK render genişliğini tarayıcıdan ölçüyor.
    // ⚠ **ÇAPA HESABIN KENDİ DOSYASINDA.** Eski çapa `sablon.ts`teki
    // `guvenliMetinYuzdesi = SINIR_MIN - 7` idi; D-257 hesabı `sablon-parametre.ts`e
    // taşıyınca yama hedefi kayboldu ve ihlal testi SESSİZCE geçersizleşti — batarya
    // "?? yama hedefi bulunamadı" diyordu ama `verify` dışında kimse bakmıyordu.
    // Bu, bu oturumda çapaların ikinci kez kırılması. Kural: çapa, ölçülen değerin
    // TANIMLANDIĞI dosyada durur; başka bir dosyadaki türevine değil.
    //
    // ⚠ ⚠ **ÜÇÜNCÜ KEZ KIRILDI (FAZ-12.10) — ve bu sefer sebebi daha derin.** Çapa
    // `sablon-parametre.ts`teki `p.bantMin - p.genlik - 2` idi; 12.10 iki şey birden
    // yaptı: sabiti `NEFES_YUZDESI` diye adlandırdı (dize eşleşmesi bozuldu) **ve daha
    // önemlisi sütunu o dosyadan ÇIKARDI** — sütun artık slayta özgü ve `sablon.ts`teki
    // `guvenliKolonYuzdesi`nde, eğrinin zarfından türetiliyor. Yani eski çapa yalnız
    // bayatlamadı, **yanlış şeyi işaret eder hâle geldi**: orayı yamalamak render edilen
    // sütunu artık hiç genişletmiyor. Çapa, değişmezi GERÇEKTEN ihlal eden yere taşındı.
    //
    // **Ders (üçüncü tekrar):** bir hesabı taşımak, o hesabı sınayan ihlal testini de
    // taşımayı gerektirir. Yeniden adlandırma yetmez — çapa DAVRANIŞA bağlanmalı.
    kapi: 'tasarim',
    dosya: 'packages/render/src/sablon.ts',
    yamalar: [{ ara: 'return icKenar - NEFES_YUZDESI', yaz: 'return icKenar - NEFES_YUZDESI + 6' }],
    // ⚠ **İMZA DEĞİŞTİ ÇÜNKÜ SINANAN DEĞİŞMEZ DEĞİŞTİ.** Eski giriş "en geniş kelime
    // sütuna sığmıyor" (`text_overflow`) diyordu; ama o metrik kelimeyi SÜTUNA karşı
    // ölçüyor ve sütun genişletilince eşik de genişliyordu — kapı YEŞİL kalıyordu.
    // Yani "metin eğriye girmesin" garantisini hiçbir şey korumuyordu; yalnız kelimenin
    // kendi kutusuna sığması korunuyordu. Yeni değişmez `column_in_band`: güvenli sütun,
    // eğri bandının yakın kenarından `genlik` kadar uzakta kalmalı. Boşluğu bataryanın
    // KENDİSİ ortaya çıkardı — çapası bayatladığı için sessizce geçersizleşmişti.
    // ⚠ İmza SLAYT NUMARASI TAŞIMIYOR: 12.10 okumayı slayt başına böldü ve etiket
    // `slayt 1 sütunu …` oldu. Numarayı imzaya koymak, slayt sayısı değişince imzayı
    // bir kez daha kırardı — imza etikette DEĞİŞMEYEN parçaya bağlanıyor.
    imza: 'sütunu eğri bandının dışında',
  },
  {
    // ⚠ ⚠ **`ghost_overlap` YAPISAL OLARAK DÜZELDİ AMA HİÇ HAREKET ETMİYOR.** İki terim
    // de artık ayrı DOM ögelerinden okunuyor (totoloji bitti), ama ölçülen fark bütün
    // gerçek girdilerde −33 px: tasarım uzayında hiçbir konu, hiçbir oran, hiçbir aile
    // onu kımıldatmıyor. Böyle bir okuma bir ÖLÇÜM değil bir BEKÇİdir — ve bir bekçinin
    // hâlâ nöbet tuttuğunu ancak kasten ihlal göstermek kanıtlar (R-71).
    // Bataryada girişi olmasaydı, yarın rakamın konumu değişip okuma ölü hâle gelse
    // hiçbir şey görmezdi: 2. doğrulama turunun tam olarak sorduğu soru buydu.
    kapi: 'tasarim',
    dosya: 'packages/render/src/static.ts',
    yamalar: [{ ara: 'bottom: ${pay + 62}px;', yaz: 'bottom: ${pay - 40}px;' }],
    imza: 'rakam ↔ şerit',
  },
  {
    // Izgaraya bakınca iki komşu kare ayırt edilebilmeli; aynı zemin onları tek bloğa
    // çeviriyor. Renk rotasyonu grameri taşıyan üç kuraldan biri (D-254).
    kapi: 'tasarim',
    dosya: 'packages/render/src/sablon.ts',
    yamalar: [{ ara: 'const kagitMi = k.index % 2 === 1', yaz: 'const kagitMi = true' }],
    imza: 'aynı zemin',
  },
  {
    kapi: 'chokepoints',
    dosya: 'packages/render/src/capture/ihlal-gecici.ts',
    icerik: "export const kayit = { recordVideo: { dir: '/tmp/v' } }\n",
    imza: 'ekran-kaydedici',
  },
  {
    kapi: 'ui-tema',
    dosya: 'motion/components/ihlal-gecici.css',
    icerik: '.ihlal {\n  transition: opacity 400ms linear;\n}\n',
    imza: '320ms',
  },
  {
    kapi: 'ui-tema',
    dosya: 'motion/components/ihlal-gecici.css',
    icerik: '.ihlal {\n  background: #0091ff;\n}\n',
    imza: 'düz renk',
  },
  {
    kapi: 'chokepoints',
    dosya: 'packages/render/src/deck/ihlal-gecici.ts',
    icerik: "export const uc = 'https://gamma.app/api/generate'\n",
    imza: 'hazir-deck-ureticisi',
  },
  {
    kapi: 'chokepoints',
    dosya: 'packages/render/src/charts/ihlal-gecici.ts',
    icerik: "export const c = { kutuphane: 'chart.js' }\n",
    imza: 'metin-olcen-grafik-kutuphanesi',
  },
  {
    kapi: 'chokepoints',
    dosya: 'packages/corpus/src/ihlal-gecici.ts',
    icerik:
      "import { unlinkSync } from 'node:fs'\nexport const s = (p: string): void => unlinkSync(p)\n",
    imza: 'corpus-silici',
  },
  {
    kapi: 'prospect-kvkk',
    dosya: 'corpus/prospect/ihlal-gecici.md',
    icerik:
      '---\nid: rec_prospect_ihlal\nbrand_id: brd_upcytech\ntype: prospect\nera_id: imalat-2026\n' +
      'status: draft\nlegal_name: Sentetik Test\nstage: contacted\n' +
      'source_url: https://ornek.gecersiz/x\nkvkk_basis: mesru_menfaat\n' +
      'retention_until: 2027-01-01\ncontact_name: Sentetik Kisi\n---\n\nGövde.\n',
    imza: 'kvkk_disclosure_sent',
  },
  {
    kapi: 'chokepoints',
    dosya: 'packages/providers/src/ingest/ihlal-gecici.ts',
    icerik: "export const u = 'https://www.linkedin.com/in/biri'\n",
    imza: 'linkedin-kazima',
  },
  {
    kapi: 'kisisellestirme',
    dosya: 'packages/engine/src/ihlal-gecici.ts',
    icerik: 'export const KISISELLESTIRME_TAVANI = 9\n',
    imza: 'ikinci kez tanımlanmış',
  },
  {
    // ⚠ **YAMA modu.** Bu kapının ihlali yeni bir dosya yazmakla ifade EDİLEMEZ: kural
    // mevcut bir render yolunun CSS'i gömmesi hakkında. Batarya ilk hâlinde yalnız
    // "dosya yaz" biçimini destekliyordu ve bu kapı bataryaya giremiyordu — yani
    // korunduğu her turda kanıtlanamayan bir kapı olurdu.
    kapi: 'blok-css',
    dosya: 'packages/render/src/static.ts',
    // İki değişiklik BİRLİKTE: hem kullanım hem import. Yalnız kullanımı silmek
    // derlemeyi düşürür (kullanılmayan import) ve D-170 gereği ihlal GEÇERSİZ sayılır —
    // oysa gerçek hata tam olarak buydu: sabit hiç import edilmemişti.
    yamalar: [
      { ara: '    CHART_CSS,\n    DIAGRAM_CSS,\n', yaz: '' },
      {
        ara: "import { CHART_CSS, chartHtml, isChartError } from './charts/chart.js'",
        yaz: "import { chartHtml, isChartError } from './charts/chart.js'",
      },
      {
        ara: "import { DIAGRAM_CSS, diagramHtml, isDiagramError } from './charts/diagram.js'",
        yaz: "import { diagramHtml, isDiagramError } from './charts/diagram.js'",
      },
    ],
    imza: 'CHART_CSS) gömülmüyor',
  },
  {
    kapi: 'chokepoints',
    dosya: 'packages/providers/src/ihlal-gecici.ts',
    icerik: "export const uc = 'https://graph.facebook.com/v21.0/me/media'\n",
    imza: 'kanal-yayinci',
  },
  {
    // ⚠ `repo-hygiene` yalnız **izlenen** dosyaları tarıyor, bu yüzden "yeni dosya yaz"
    // biçimi bu kapıyı sınamıyor (ilk denemem yeşil kaldı ve kapı değil TESTİM yanlıştı).
    // Yama modu izlenen bir dosyayı değiştiriyor.
    kapi: 'repo-hygiene',
    // ⚠ Hedef **İZLENEN** bir dosya olmak zorunda: kapı yalnız git'in bildiği dosyaları
    // tarıyor ve yeni yazılmış (untracked) bir dosyaya konan token yakalanmıyor. İlk
    // hedefim henüz commit'lenmemişti ve batarya "kapı korumuyor" dedi — kapı haklıydı,
    // testin hedefi yanlıştı.
    dosya: 'packages/providers/src/publish.ts',
    yamalar: [
      {
        ara: 'export type PublishRefusal =',
        // ⚠ Token PARÇALARDAN kuruluyor: tam dizeyi buraya yazmak, kapının BU DOSYAYI
        // yakalamasına yol açıyordu (kendi ihlal testim kapıyı kendi üstüne çevirdi —
        // `chart.js` darboğazının kendi modülünü yakalamasıyla aynı sınıf).
        yaz: `// token: ${'EAA'}Jk3ZBmZC8gBO7ZCxZAqZAZBZCwZDZD1234567890abcdefghijklmnopqrstuvwxyzABCDEFGH\nexport type PublishRefusal =`,
      },
    ],
    imza: 'secret deseni',
  },
  {
    // ⚠ **İki sağlayıcı, iki desen, İKİ ihlal testi.** Batarya yalnız Meta token'ını
    // (`EAA…`) sınıyordu; LinkedIn istemci secret'ı (`WPL_AP1.`) `repo-hygiene`de
    // yazılıydı ama hiç ihlal edilmemişti — yani "korunuyor" iddiası ölçülmemişti
    // (FAZ-7 denetimi, m4). Bir desenin listede olması, o desenin yakaladığını
    // göstermez; yeşil kapı hiçbir şey kanıtlamaz (R-71).
    kapi: 'repo-hygiene',
    dosya: 'packages/providers/src/oauth.ts',
    yamalar: [
      {
        ara: 'export const isOAuthRefusal',
        // Token yine PARÇALARDAN: tam dize burada dursaydı kapı BU dosyayı yakalardı.
        yaz: `// istemci secret: ${'WPL_AP1'}.abcdefghij1234567890\nexport const isOAuthRefusal`,
      },
    ],
    imza: 'secret deseni',
  },
  {
    kapi: 'turkce-genisleme',
    dosya: 'apps/ui/src/ihlal-gecici.css',
    icerik: 'button.ihlal {\n  inline-size: 96px;\n}\n',
    imza: 'SABİT genişlik',
  },

  // ── FAZ 8 kapıları (M5) ───────────────────────────────────────────────────
  //
  // ⚠ **Bu dördü listede YOKTU** ve doğrulama turu bunu buldu: 40 kapının 15'i
  // sınanıyordu. R-71 "her BLOCKING kapı kasten ihlal edilir" diyor ve bir kapının
  // batarya dışında kalması, tam olarak korumadığı şeyi korunuyor sanmaktır.
  {
    kapi: 'matris',
    dosya: 'registry/pipelines/ad-creative-set.pipeline.yaml',
    yamalar: [
      // Tek düzeye indirilen bir eksen artık ölçülmüyor: sabitleniyor. Maliyet
      // duruyor, bilgi kayboluyor — kapının yakalaması gereken tam olarak bu.
      {
        ara: 'duzeyler: [olcum-kaybi, vardiya-korlugu, fire-maliyeti]',
        yaz: 'duzeyler: [olcum-kaybi]',
      },
    ],
    imza: 'eksen değil sabit',
  },
  {
    kapi: 'hat-kimligi',
    dosya: 'scripts/uret.mjs',
    yamalar: [
      // Politikayı hat ADINA bağlamak: yeniden adlandırma linter'ı sessizce kapatır.
      //
      // ⚠ **Yük PARÇALANARAK yazılıyor.** İlk sürüm düz dize kullandı ve `hat-kimligi`
      // bataryanın KENDİ satırını suçladı: ihlal dosyası da kaynaktır ve kapılar onu
      // okur. Aynı numara `repo-hygiene` yükünde de var (`${'WPL_AP1'}`) — kapı
      // yazılan dosyayı görmeli, yazan dosyayı değil.
      { ara: "cozum.value.ciktiSinifi === 'reklam'", yaz: `id === '${'ad-creative'}-set'` },
    ],
    imza: "hat id'si",
  },
  {
    kapi: 'secret-rotasyon',
    dosya: 'scripts/ihlal-gecici.mjs',
    // Rotasyon tablosunda karşılığı olmayan bir anahtar: sızdığında nasıl
    // döndürüleceğini kimse bilmiyor demektir.
    // Yük parçalı (yukarıdaki gerekçe): düz yazılsa kapı bataryanın kendisini suçlardı.
    icerik: `export const t = readEnv('${'IHLAL_GECICI'}_TOKEN')\n`,
    imza: 'rotasyon tablosunda YOK',
  },
  {
    kapi: 'doctor-salt-okur',
    dosya: 'scripts/doktor.mjs',
    yamalar: [
      // "Düzelt" düğmesi her zaman makul görünür — bu yüzden bir gün eklenir.
      { ara: 'import { join', yaz: "import { writeFileSync } from 'node:fs'\nimport { join" },
    ],
    imza: 'YAZMA çağrısı',
  },
]

const sonuclar = []
let hata = 0

for (const ih of IHLALLER) {
  const yol = join(REPO, ih.dosya)
  const vardi = existsSync(yol)
  const oncesi = vardi ? readFileSync(yol, 'utf8') : null

  // ── 1. ihlal UYGULANDI mı ────────────────────────────────────────────────
  //
  // İki biçim: `icerik` (dosyayı yaz) ve `ara`/`yaz` (mevcut dosyada değiştir). İkincisi
  // olmadan "bu satır SİLİNİRSE kapı kırmızıya döner mi" sorusu sorulamıyordu.
  let yeniIcerik
  if (ih.icerik !== undefined) {
    yeniIcerik = ih.icerik
  } else {
    if (oncesi === null) {
      sonuclar.push(`?? ${ih.kapi} · ${ih.imza} — yama dosyası yok, test geçersiz`)
      hata++
      continue
    }
    yeniIcerik = oncesi
    let bulunamayan = null
    for (const y of ih.yamalar) {
      if (!yeniIcerik.includes(y.ara)) {
        bulunamayan = y.ara.slice(0, 40)
        break
      }
      yeniIcerik = yeniIcerik.replace(y.ara, y.yaz)
    }
    if (bulunamayan !== null) {
      sonuclar.push(
        `?? ${ih.kapi} · ${ih.imza} — yama hedefi bulunamadı (${bulunamayan}…), test geçersiz`
      )
      hata++
      continue
    }
  }
  // ⚠ **Dizin YOKSA yaratılır.** `corpus/prospect/` bu makinede duran İZLENMEYEN boş
  // bir dizindi; temiz bir klonda yoktu ve batarya `ENOENT` ile çöküyordu — yani
  // `just verify` **yalnız bu makinede** yeşildi (FAZ-8 denetimi, B1). Aynı sınıf:
  // `pnpm.onlyBuiltDependencies` (FAZ-8.7) ve `core.hooksPath`.
  mkdirSync(dirname(yol), { recursive: true })
  writeFileSync(yol, yeniIcerik)
  if (readFileSync(yol, 'utf8') !== yeniIcerik) {
    sonuclar.push(`?? ${ih.kapi} · ${ih.imza} — ihlal UYGULANAMADI, test geçersiz`)
    hata++
    continue
  }

  // ── 2. kod DERLENİYOR mu ─────────────────────────────────────────────────
  // CSS ihlalleri derlemeyi etkilemez; TS olanlar etkileyebilir ve o zaman kapı
  // değil derleyici konuşur — kapıyı sınamış olmayız.
  const tsIhlali = ih.dosya.endsWith('.ts') || ih.dosya.endsWith('.tsx')
  const derledi = tsIhlali ? derleniyorMu() : true

  // ── 3. kırmızı DOĞRU kapıdan mı ──────────────────────────────────────────
  const r = kapiKos(ih.kapi)
  if (r.yesil) {
    sonuclar.push(`!! ${ih.kapi} · ${ih.imza} — YEŞİL KALDI, kapı korumuyor`)
    hata++
  } else if (!r.cikti.includes(ih.imza)) {
    sonuclar.push(`!! ${ih.kapi} · ${ih.imza} — kırmızı ama BAŞKA kuraldan; imza çıktıda yok`)
    hata++
  } else if (!derledi) {
    sonuclar.push(`?? ${ih.kapi} · ${ih.imza} — derleme düştü, kapı sınanmış sayılmaz`)
    hata++
  } else {
    sonuclar.push(`✓ ${ih.kapi} · ${ih.imza}`)
  }

  // ── geri al ve YEŞİLE döndüğünü doğrula ──────────────────────────────────
  if (oncesi === null) unlinkSync(yol)
  else writeFileSync(yol, oncesi)
  if (tsIhlali) derleniyorMu()

  const geri = kapiKos(ih.kapi)
  if (!geri.yesil) {
    sonuclar.push(`!! ${ih.kapi} — GERİ ALMA BAŞARISIZ, kapı hâlâ kırmızı`)
    hata++
  }
}

console.log(sonuclar.map((s) => `  ${s}`).join('\n'))
console.log('')
if (hata > 0) {
  console.log(`✗ ${hata} ihlal testi geçersiz ya da kapı korumuyor`)
  process.exit(1)
}
console.log(`✓ ihlal bataryası: ${IHLALLER.length} kural kasten ihlal edildi, hepsi KIRMIZI`)
