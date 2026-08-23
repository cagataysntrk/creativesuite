#!/usr/bin/env node
// FAZ-2.9'un ikinci yarısı: RÖPORTAJ (D-5).
//
// İlk yedi kayıt kamuya açık kaynaklardan ÇIKARIMLA yazılmıştı (`source.kind: inference`,
// confidence 0.5-0.6) ve iki yerde yanlıştı: ürünler hiç geçmiyordu, dikey/bölge
// tahmindi (V-07). Bu betik onları kurucudan alınan bilgiyle yeniden öneriyor —
// `source.kind: interview`, çünkü kaynağın ne olduğu, ne söylediği kadar önemli.
//
// Yazma yolu `propose()`: kayıtlar `draft` iner, retrieval'a görünmez, imza üretim
// anında basılır. Onay insanın git commit'idir (R-14) — bu betik onay VERMEZ.

import { join } from 'node:path'

const REPO = process.env['SUITE_REPO'] ?? process.cwd()
const { propose } = await import(join(REPO, 'packages/corpus/dist/index.js'))

const ORTAK = {
  brand_id: 'brd_upcytech',
  schema_version: 1,
  kind: 'dna',
  locale: 'tr-TR',
  era_id: 'imalat-2026',
  created_at: '2026-08-16T18:45:00.000Z',
  source: {
    kind: 'interview',
    ref: 'kurucu röportajı — 2026-08-16 (FAZ-2.9, D-5 ikinci yarı)',
    quote: null,
  },
  tags: [],
  context_weight: 1,
}

const V = { channels: [], verticals: ['imalat'], personas: [] }

const KAYITLAR = [
  // ── 1. KONUMLANDIRMA ─────────────────────────────────────────────────────
  {
    entityType: 'positioning',
    slug: 'veri-katmanindan-karara',
    fm: {
      ...ORTAK,
      id: 'rec_pos_veri_karar_2026',
      type: 'positioning',
      confidence: 0.85,
      scope: V,
      title: 'Veri katmanından karara — Upcytech konumu',
    },
    body: `İmalat firmalarına, **veriyi karara çeviren** ürünler ve o ürünlerin firmaya
özel uyarlamalarını üretiyoruz. Verisi hazır olmayan firmada **veri katmanını da biz
kuruyoruz**.

**Ayrıştırıcı — ve bu tek cümlelik farkımız:** bu alandaki araçların neredeyse hepsi
verinin ZATEN VAR olduğunu varsayar. Power BI bir veri kaynağı ister; bir GenBI aracı
bir veritabanı ister. Gittiğimiz firmada yönetim yazılımı ya da veritabanı yoksa iş
orada biter. Bizde bitmiyor: **UpcyMan'i genelleştirip kuruyoruz ya da açık kaynak bir
katman ayağa kaldırıyoruz**, sonra Dima onun üstünde çalışıyor.

Yani sattığımız şey bir gösterge paneli değil, **karara giden zincirin tamamı**:
veri yoksa veri, veri varsa analiz, analiz varsa karar.

**Ürün hattı**
- **Dima** — şirket beyni. Akıllı GenBI, grafik ve dashboard üretimi, raporlama,
  anomali tespiti, kök neden analizi, karar motoru. *İlk sürümü tamamlanmak üzere;
  tamamlandığında ana ürün Dima olacak.*
- **UpcyCarbon** — karbon ve sürdürülebilirlik raporlaması; OEE de içinde.
- **UpcyMan** — tesis yönetim yazılımı. Kantardan satışa uçtan uca süreç. Asıl odağı
  geri dönüşüm tesisleri, ama **genelleştirilip veri katmanı olarak da kuruluyor**.

**Özelleştirme bir istisna değil, iş modelinin kendisi.** Fason üretim yaptıran bir
firmanın maliyetini hesaplayıp kârlılık analizi yapan ve fiyat teklifi öneren sistem —
bu aslında Dima'nın içindeki bir yetenek; biz onu o firmaya göre özelleştirip
veriyoruz. Basit bir OCR ihtiyacı da aynı kapıdan giriyor.

**Alternatif — müşterinin bizim yerimize yapacağı şey:** Excel ve vardiya defteriyle
devam etmek, ya da verinin var olduğunu varsayan bir BI aracı alıp veri katmanı
olmadığı için rafa kaldırmak.

⚠ **Hiçbir sayısal iddia yok ve bu bilinçli.** Yayınlanabilir müşteri sonucu henüz
yok (kurucu, 2026-08-16). Sayı eklenecekse \`claim_source\` zorunludur.`,
  },

  // ── 2. ICP ────────────────────────────────────────────────────────────────
  {
    entityType: 'icp',
    slug: 'veri-olgunlugu-dusuk-imalatci',
    fm: {
      ...ORTAK,
      id: 'rec_icp_veri_olgunlugu_2026',
      type: 'icp',
      confidence: 0.75,
      scope: V,
      title: 'Veri olgunluğu düşük imalatçı',
    },
    body: `**Ayrım ekseni SEKTÖR DEĞİL, VERİ OLGUNLUĞU.** Önceki taslak dikeyi (otomotiv
tedarik / Bursa) üçüncü taraf verisinden çıkarımla seçmişti; kurucu bunu doğrulamadı.
Gerçek ayrım şu: firmanın verisi var mı, yok mu.

**A · Verisi olmayan ya da dağınık olan imalatçı** — asıl ICP
Yönetim yazılımı yok, ya da var ama veri çıkarılamıyor (kâğıt, Excel, birbirine
bağlanmamış sistemler). Rakiplerin çalışamadığı yer burası; bizim iki adımlı
girebildiğimiz yer de burası: önce veri katmanı (UpcyMan genelleştirilmiş ya da açık
kaynak), sonra Dima.

**B · Verisi olan ama karara çeviremeyen imalatçı**
ERP/MES var, rapor alınıyor, ama raporlar okunmuyor ve karar üretmiyor. Dima doğrudan
üstüne kurulur. Satış döngüsü kısa, ama rekabet daha yoğun.

**C · Sürdürülebilirlik raporlaması zorunluluğu gelen firma**
Müşteri denetimi, ihracat gerekliliği ya da mevzuat. UpcyCarbon tek başına bir giriş
kapısı — ve içindeki OEE üretim tarafına köprü kuruyor.

**Tetikleyici olaylar**
- Yeni hat/tesis yatırımı — ölçüm altyapısı sıfırdan kuruluyor
- Müşteri denetimi ya da mevzuat gereği raporlama zorunluluğu (özellikle C)
- Fason iş alan/veren firmada maliyet ve fiyatlama görünürlüğü ihtiyacı
- Kazanılan büyük ihale: kapasite ve izlenebilirlik baskısı

**Dışlayıcılar — kimi ARAMIYORUZ**
- 10 kişinin altı: özel yazılımın maliyeti hiçbir ölçekte karşılanmıyor
- Kurumsal MES'i oturmuş, veri ekibi olan tesisler: satış değil entegrasyon işi
- İç sahibi olmayan "dijitalleşme desteği alalım" projeleri

**Bütçe sinyali:** yayınlanmış/kazanılmış ihale kaydı, teşvik belgesi, yeni tesis
duyurusu — doğrulanabilir olanlar. "Bütçemiz var" beyanı sinyal değildir.

⚠ Ölçek bandı (çalışan sayısı, ciro) **hâlâ belirsiz** — kurucudan alınmadı ve
uydurulmadı. On gerçek satış görüşmesinden sonra doldurulacak.`,
  },

  // ── 3. MESAJ EVİ ──────────────────────────────────────────────────────────
  {
    entityType: 'messaging',
    slug: 'veri-yoksa-once-veri',
    fm: {
      ...ORTAK,
      id: 'rec_msg_veri_karar_2026',
      type: 'messaging',
      confidence: 0.8,
      scope: V,
      title: 'Veri yoksa önce veri — mesaj evi',
    },
    body: `**Ana mesaj:** Veriniz yoksa önce veriyi kuruyoruz, varsa karara çeviriyoruz.

**Sütunlar**

1. **Başlamak için hazır olmanız gerekmiyor.**
   Diğer araçlar bir veritabanı ister. Yoksa iş orada biter. Bizde bitmez —
   veri katmanını da biz kuruyoruz.

2. **Rapor değil karar.**
   Anomaliyi bulmak yetmez; nedenini ve ne yapılacağını da söylemesi gerekir.
   Dima'nın karar motoru bunun için var.

3. **Hazır bir modüle uymuyorsunuz; ürün size uyarlanıyor.**
   Fason maliyet ve kârlılık analizi, fiyat teklifi önerisi, OCR — hepsi aynı
   ürünün sizin sürecinize göre özelleştirilmiş hâli.

4. **Sürdürülebilirlik bir yük değil, aynı verinin ikinci çıktısı.**
   UpcyCarbon üretim verisinden karbon ve OEE raporu üretiyor; veriyi yeniden
   toplamıyorsunuz.

**Ton:** teknik ve somut (üretim müdürü) · yönetici sunumunda finansal karşılığa
çevrilir · **abartısız** — kanıtımız henüz yetenek, sonuç değil.

**Yasak terimler burada TEKRARLANMIYOR.** Kanonik liste \`YASAK_TERIMLER\` ve
\`lexicon\` kapısı; ikinci bir kopya bir gün ayrışır ve hangisinin geçerli olduğu
belirsizleşir. ⚠ İlk sürümde terimleri buraya literal yazmıştım ve **kapı bu kaydı
reddetti** — yasağı listeleyen belge yasağı ihlal ediyordu.

⚠ **Bu mesaj evi hiçbir sayısal iddia içermiyor ve içeremez.** Yayınlanabilir müşteri
sonucu yok (kurucu röportajı). Eski sitedeki desenli yer tutucu metrikler **hiçbir yeni kreatife taşınmaz** — \`claim_source\` kapısı
zaten reddeder (R-32).`,
  },

  // ── 4. TEKLİF ─────────────────────────────────────────────────────────────
  {
    entityType: 'offer',
    slug: 'urun-demosu-girisi',
    fm: {
      ...ORTAK,
      id: 'rec_offer_demo_2026',
      type: 'offer',
      confidence: 0.8,
      scope: V,
      title: 'Ürün demosu girişi',
    },
    body: `**Tür:** demo → özelleştirme.

**Giriş hareketi — BUGÜN:** \`upcyman.com\` ve \`upcycarbon.com\` üzerinden **iki
çalışan ürünle** giriyoruz. Dima'nın ilk sürümü tamamlanmak üzere; **tamamlandığında
giriş ürünü Dima olacak** ve bu kayıt güncellenecek.

**Kapsam — dahil**
- Ürün demosu (gerçek ekran, gerçek akış — üretilmiş ekran görüntüsü değil, R-33)
- Firmanın veri durumunun tespiti: veri var mı, çıkarılabilir mi
- Verisi yoksa: veri katmanı kurulum planı (UpcyMan genelleştirilmiş ya da açık kaynak)
- İhtiyaca göre özelleştirme kapsamının çıkarılması

**Kapsam — DAHİL DEĞİL**
Donanım tedariki · çoklu tesis yaygınlaştırma · süresiz kapsam genişletme.
Bunu yazmayan bir teklif projeyi şişirir.

**Fiyat modeli:** özelleştirme \`per_project\`, ürün kullanımı \`subscription\`.
⚠ **Rakam yok** — fiyat bandı kurucudan alınmadı ve uydurulmadı.

**Giriş engeli:** Para değil **veri erişimi ve iç sahiplik**. Müşterinin verisine
erişim vermesi ve bir kişiyi süreçte tutması gerekiyor. Asıl satılması gereken şey bu.

**İlk değer anı:** İlk gerçek gösterge/rapor. ⚠ Süre hedefi **yazılmadı** — ölçülmüş
bir süre yok ve vaat, ölçüm değildir.`,
  },

  // ── 5. PERSONA ────────────────────────────────────────────────────────────
  {
    entityType: 'persona',
    slug: 'uretim-muduru',
    fm: {
      ...ORTAK,
      id: 'rec_persona_uretim_muduru',
      type: 'persona',
      confidence: 0.7,
      scope: V,
      title: 'Üretim müdürü',
    },
    body: `**Rol:** Üretim/fabrika müdürü. Hattın çıktısından, duruşundan ve firesinden
sorumlu. Teknik konuşur, somut ister.

**Günlük gerçeklik:** Sabah raporu Excel'de birleştiriliyor ya da hiç yok. "Dün ne
oldu" sorusunun cevabı vardiya amirinin hafızasında. Bir sorunun kök nedenini bulmak
saatler alıyor ve çoğu zaman aranmıyor bile.

**Ne umursar:** duruş süresi · fire · vardiya karşılaştırması · "bu sefer neden oldu".
**Ne umursamaz:** teknoloji yığını, model adı, "yapay zekâ" kelimesi.

**İtirazları**
- "Bizde veri yok ki." → **Konumumuzun tam merkezi**: veri katmanını da biz kuruyoruz.
- "Daha önce bir sistem aldık, kullanılmadı." → Hazır modül uydurma denemesiydi;
  özelleştirme farkı burada anlatılır.
- "Ekip zaten yetişemiyor." → Giriş engeli tam olarak bu; efor beklentisi dürüstçe
  konuşulur, küçültülmez.

**İKİNCİ ALICI — sürdürülebilirlik/finans tarafı.** UpcyCarbon'un asıl talep sahibi
üretim müdürü olmayabilir: karbon ve sürdürülebilirlik raporlaması genelde denetim
ya da mevzuat baskısıyla finans/kalite tarafından gelir. ⚠ Bu persona **henüz
yazılmadı** — kurucudan doğrulanmadan yazmak, ICP'yi tahminle doldurmak olurdu.`,
  },

  // ── 6. KANIT ──────────────────────────────────────────────────────────────
  {
    entityType: 'proof_asset',
    slug: 'upcyman-calisan-altyapi',
    fm: {
      ...ORTAK,
      id: 'rec_proof_upcyman',
      type: 'proof_asset',
      confidence: 0.9,
      scope: V,
      title: 'UpcyMan: çalışan üretim altyapısı',
      era_of_origin: 'geri-donusum',
      generalisation_note:
        'UpcyMan geri dönüşüm tesisleri için yazıldı ve asıl odağı orası. İmalat ' +
        'bağlamında YETENEK kanıtı olarak sunulur: kantardan satışa uçtan uca bir ' +
        'süreci canlı taşıyabildiğimizi gösterir. Bir imalat müşterisinin sonucu ' +
        'DEĞİLDİR ve öyle sunulamaz.',
      transfer_confidence: 'analogous',
    },
    body: `**Ne kanıtlıyor:** Uçtan uca bir tesis sürecini — kantardan satışa — canlı
taşıyan bir yazılımı yazdık ve çalışıyor. \`upcyman.com\` · \`api.upcyman.com\`.

**Neden bu kanıt önemli:** Konumumuz "veri katmanını da biz kurarız" diyor. Bu iddia
ancak veri katmanı kurabildiğimizi gösteren çalışan bir sistem varsa inandırıcı.
UpcyMan tam olarak o sistem ve **aynı zamanda kullandığımız araç**: verisi olmayan
firmada genelleştirilip veri katmanı olarak kuruluyor.

**Aktarım argümanı:** Geri dönüşüm tesisi ile imalat tesisi aynı şey
değil. Ortak olan şey **süreç bütünlüğü**: giriş ölçümü → işlem → stok → çıkış → satış.
Bu zincirin tamamını taşıyan bir yazılım yazmış olmak, imalatta da taşıyabileceğimizin
göstergesidir — **daha zor bir vaka olarak sunulur**, hazır bir referans olarak değil.

⚠ **Sayısal iddia YOK.** Kullanıcı sayısı, işlem hacmi, tasarruf iddiası — hiçbiri
yazılmadı. Kurucu röportajına göre yayınlanabilir gerçek müşteri sonucu henüz yok.
Kaynaksız bir sayı eklemek kaynaksız-iddia yasağını çiğner ve \`lexicon\` kapısı
reddeder.`,
  },

  // ── 7. RAKİP ──────────────────────────────────────────────────────────────
  {
    entityType: 'competitor',
    slug: 'veriyi-varsayan-araclar',
    fm: {
      ...ORTAK,
      id: 'rec_comp_veri_varsayan',
      type: 'competitor',
      confidence: 0.75,
      scope: V,
      title: 'Veriyi varsayan araçlar ve Excel',
    },
    body: `**Gerçek rakip bir firma değil, üç alternatif davranış.**

**1 · Hiçbir şey yapmamak — Excel ve vardiya defteri**
En sık kazanan alternatif. Bedava görünür, kimseden onay gerektirmez, kimse
kullanmayı öğrenmek zorunda kalmaz. Karşı argüman "Excel kötü" değil —
*"aynı soruyu her ay yeniden sormak"* maliyetidir.

**2 · Veriyi VARSAYAN BI/GenBI araçları** (Power BI ve benzerleri)
Güçlü araçlar ve bir veri kaynağı isterler. Firmada yönetim yazılımı ya da
çıkarılabilir veri yoksa proje başlamadan durur — ya da bir danışmanlık projesine
dönüşür. **Bizim ayrıştırıcımız tam bu boşlukta duruyor.**

**3 · Kurumsal ERP/MES modülleri**
Bu ölçekte hem pahalı hem de aylara yayılan bir entegrasyon projesi. Kazandıklarında
genelde büyük bütçeli ve iç ekibi olan tesislerde kazanıyorlar — bizim ICP'mizin
açıkça DIŞLADIĞI segment.

**Bizim zayıf olduğumuz yer — dürüstçe:** Yayınlanabilir müşteri referansımız ve
sayısal sonucumuz yok. Bir alıcı "kimlerle çalıştınız" diye sorduğunda cevabımız
ürün ve yetenek; vaka çalışması değil. Bu bir eksiklik ve kapatılana kadar öyle
anlatılır — uydurulmaz.`,
  },
]

let yazilan = 0
for (const k of KAYITLAR) {
  const r = propose({
    root: join(REPO, 'corpus'),
    entityType: k.entityType,
    slug: k.slug,
    frontmatter: k.fm,
    body: k.body,
  })
  if (!r.ok) {
    console.log(`✗ ${k.entityType}/${k.slug}: ${JSON.stringify(r.refusal)}`)
    process.exit(1)
  }
  console.log(`  ✓ ${r.path.replace(`${REPO}/`, '')}`)
  yazilan++
}
console.log(`\n${yazilan} kayıt ÖNERİLDİ (draft, retrieval'a görünmez).`)
console.log('Onay insanın: just onayla <yol…>  →  just reindex')
