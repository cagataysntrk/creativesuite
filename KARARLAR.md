# KARARLAR

Döngünün ve insanın aldığı **her** karar. Tarih · karar · gerekçe.
Append-only: bir karar silinmez. Reddedilen karar gövdesine **tam olarak** şu satır
eklenir ve yerine geçen belirtilir:

    **Durum:** reddedildi → D-nn

`citations` kapısı bu satırı arar; gövdede geçen "reddedildi" kelimesi yetmez
(bir kararın metninde "Remotion reddedildi" yazması kararın kendisini geçersiz kılmaz).
Sonda `V-nn` doğrulama borçları (🔴) durur.

Aktif defter 600 satırda tutulur; kapanmış kararlar `docs/kararlar/ARSIV-<yyyy>.md`'ye
devredilir. `citations` kapısı her `D-nn`'in ikisinden **tam olarak birinde** çözüldüğünü
doğrular.

---
## V-01 — Remotion lisansı ✅ KAPANDI (2026-08-15, D-80)
Bedava lisans "up to 3 employees" (LICENSE.md), şirket 6 kişi. Bizim kullanımımız
*Automators* katmanı: **$100/ay asgari**. D-25 teyit edildi. → FAZ-0.D.3

## V-02 — Hangi latin-ext font lisanslanacak
Marka kararı, FAZ 2 keşfiyle bağlantılı. → FAZ-0.A.5

## V-03 — rjsf'nin JSON Schema 2020-12 kapsaması
Kısıtlı profil bunu atlatmak için tasarlandı, yine de spike ile doğrula. → FAZ-0.D.4

## V-04 — fal endpoint-başına OpenAPI URL'i ✅ KAPANDI (2026-08-15, D-99)
`https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=<id>` → HTTP 200,
**kimlik doğrulamasız**, `openapi: 3.0.4`. Fixture repoda:
`packages/providers/test-fixtures/fal-flux-dev.openapi.json`. → FAZ-3.4

## V-05 — Anthropic yapılandırılmış çıktı alt kümesi
OpenAI'ninkiyle aynı mı? Derleyici daha katı olana yazıldı, CI'da gerçek çağrıyla doğrula. → FAZ-1.4

## V-06 — `dima` ürün mü modül mü ✅ VERİ MODELİ KAPANDI (2026-08-15, D-84)
`dima` **ayrı marka ekseni** olarak modellendi (token kalıtımıyla). Pazara sunum adı
("dima by Upcytech" mi bağımsız mı) veri modelini DEĞİŞTİRMİYOR ve kullanıcıya
bırakıldı. → FAZ-2.11

## V-07 — Era 1'in dikeyi
Kanıt otomotiv tedarik/Bursa'yı işaret ediyor ama bu üçüncü taraf verisinden çıkarım,
gerçek satış pipeline'ından değil. Hipotez olarak tohumla, 10 gerçek görüşmeden sonra üzerine yaz. → FAZ-2.9

## V-08 — Kuruluş tarihi çelişkisi ✅ KAPANDI (2026-08-15, D-82)
**3 Temmuz 2025** tek doğrudur — ticaret sicili BELGELİDİR, diğer ikisi beyandır.
LinkedIn "2022" ve upcymarket.com "2021'den beri" düzeltilecek. → FAZ-2.9

## V-09 — KAP resmî REST API şartları
Ticari kullanıma uygun mu? Şartlar PDF'i "Hizmete Özel". → FAZ-6.5

## V-10 — Türk hukukçu
KVKK aydınlatma/açık rıza metinleri, sayısal performans iddialarının Reklam Kurulu
açısından durumu, sınır ötesi veri aktarımı beyanı. → FAZ-8.6

## V-11 — Run bağlam anlık görüntülerinin saklama süresi ✅ KAPANDI
Manifest sonsuza, bağlam N gün. **N = 90** (2026-08-15, FAZ-1.9). Gerekçe D-63'te.

## V-17 — Md. 27/12 ifşası makine-okunur DEĞİL
Damga `Upcytech:*` özel `iTXt` anahtarları taşıyor; hiçbir platform bunu okumaz.
`aiGenerated` bayrağı repo içinde denetlenebilir ama dışarıya bir şey söylemiyor.
Platform-tarafı ifşa (Meta/LinkedIn "AI-generated" işareti) FAZ 7'nin işi. → FAZ-7.2

## V-19 — +%30 sahte-yerelleştirme turu GÖRSEL olarak ölçülmedi
R-23'ün yazılı hâli (`turkce-genisleme` kapısı) zorlanıyor: sabit genişlik yok, kırpma
tasarımı yok. Ama "gerçek render'da hiçbir yerde kırpma yok" ölçümü YAPILMADI — bir DOM
harness'ı ister (jsdom + testing-library, iki bağımlılık, R-75). Ölçüm gelene kadar
FAZ 4'ün bu çıkış kriteri **karşılanmadı** sayılır. → FAZ-9.2

## V-20 — HyperFrames render'ı 45 sn boşuna bekliyor ✅ KAPANDI
Beklenen `window.__hf`ti, `__timelines` değil (D-201). Kompozisyonlarımız player
runtime'ı çalıştırmıyor; `--player-ready-timeout 2000` ile **1 dk 34 sn → 8,3 sn**.

## V-21 — TTS anahtarları ve model ağırlıkları yok, ses ÜRETİLMEDİ
Üç sağlayıcı da `enabled: false`: `chatterbox` model ağırlıkları indirilmedi (~2 GB),
`gemini-tts` `GEMINI_API_KEY` yok, `elevenlabs` `ELEVENLABS_API_KEY` yok ve premium
şerit gerçek para harcıyor. Sözleşme yazıldı ve test edildi (lisans kuralı iki ihlalle
kırmızıya döndürüldü); kalan iş yalnız bağlantı. → FAZ-5.4b

## V-26 — Meta uygulaması ve token yok: gerçek yayın yapılmadı
Yayın kapıları (token ömrü, alt-text, kota, defter mutabakatı) yazıldı ve **çağrı
sırasıyla** doğrulandı; `kanal-yayinci` darboğazı mekanik kurala çevrildi. Ama gerçek bir
Meta uygulaması, sayfa bağlantısı ve uzun ömürlü token **insan eylemidir**. App Review
gerekmiyor (D-3) — gereken şey hesap kurulumu. → FAZ-7.2b

## V-25 — Gerçek prospect yok: deck teslim edilmedi
Zincir kuruldu ve uçtan uca doğrulandı (gerçek çekim + grafik → PDF, beş kapı 5/5,
iki ihlal biçimi doğru kapılarda durdu). Ama **gerçek bir prospect kaydı yok** ve
uydurulmuş bir şirket doğruluk kaynağına giren bir kurgudur. `2.9`'a da bağlı: onaylı
corpus olmadan `bilgi-sec` `NO_CONTEXT` veriyor. → FAZ-6.9b

## V-24 — Şelalenin dört kaynağı: anahtar YOK ve ADAPTÖR de yok
⚠ Bu borç ilk yazıldığında "kalan iş yalnız bağlantı" diyordu; **yanlıştı** (2. doğrulama
turu). `ingestBody` `SELALE` üzerinde iterasyon yapmıyor, yalnız `own-site` çağırıyor ve
dört uzak kaynağın adaptörü yazılmamış — yalnız tanımlayıcı tablosu var. Yani bu, bir
anahtar blokajının arkasına saklanmış TEKNİK bir eksikti. Anahtar geldiğinde yazılacak
iş: dört adaptör + fallback döngüsü. Karantina, sidecar ve enjeksiyon sınırı hazır ve
gerçek çekimle doğrulandı. → FAZ-6.5b

## V-23 — LinkedIn döküman sınırı ✅ KAPANDI (2026-08-16, FAZ-7.3)
Kaynak okundu: **300 sayfa · 100 MB**
(`https://www.linkedin.com/help/linkedin/answer/a523054`) ve `placements.ts`e
`linkedin-document` satırı olarak `sourceUrl` + `verifiedAt` ile girdi.
**Doğrulama bir hatayı ortaya çıkardı:** döküman için LinkedIn'in **görsel** sınırı
(5 MB) kullanılıyordu — iki farklı medya tipinin limiti karıştırılmıştı ve 40 MB'lık
meşru bir döküman reddedilirdi. Editoryal tavanımız (10 sayfa) platform sınırından AYRI
duruyor: biri bir olgu, diğeri bir karar.

## V-22 — ASR bağlantısı yok: gerçek ses transkript edilmedi
Yerel `whisper.cpp` kurulu değil ve `GROQ_API_KEY` yer tutucu. `.ass` yazıcısı ve
transkript kapısı ASR'siz yazıldı ve test edildi (ikisi de saf); kalan iş yalnız
kelime zamanlarını üreten bağlantı. → FAZ-5.5b

## V-18 — Tailscale kurulu değil, Telegram token'ı yer tutucu
`tailscale` binary yok (sudo kurulum + hesap girişi) ve `TELEGRAM_BOT_TOKEN`
`doldurulacak`. Bot mantığı ve yüzey sınırı yazılmış, test edilmiş; kalan iş yalnız
gerçek erişim. FAZ-4.13b bu borca bağlı. **Bu borç önce yanlışlıkla `V-17` diye
anılıyordu** — o kimlik Md. 27/12 ifşasına ait; `citations` kapısı yalnız hedefin
VAR olduğunu denetliyor, anlam eşleşmesini değil (2026-08-16 denetimi). → FAZ-4.13b

## V-16 — fal ve Cloudflare anahtarları yok, canlı üretim DOĞRULANMADI
İki görsel adaptörü de yazıldı ve cassette'lerle test edildi ama `FAL_KEY`,
`CF_ACCOUNT_ID`, `CF_API_TOKEN` `secrets.enc.yaml`da yok. Yani **gerçek bir görsel
henüz üretilmedi**; sözleşme, prompt kuralı ve HTTP şekli doğrulandı, sağlayıcının
gerçek davranışı doğrulanmadı. → FAZ-3.14 (ilk gerçek carousel)

## V-15 — `status()` kimliği ortamdan alamıyor
`ProviderAdapter.status(h)` yalnız tutamak alıyor; kimlik `ProviderContext`te ve o
yalnız `start()`e geçiyor. Bugün sorun değil (`providerCall` aynı süreçte poll ediyor),
ama süreçler arası devam (SIGKILL sonrası ayrı bir işlem) kimliksiz `status()`
çağıramaz. Sözleşme değişikliği gerektirir. → FAZ-3.14

## V-14 — Cloudflare bedava katman kota aşımı
"Bedava" ile "kotası bitince ne olur" ayrı sorular. Günlük nöron kotası aşıldığında
faturalama mı başlıyor, istek mi reddediliyor — ölçülmedi. `cost_formula: '0'` bu
yüzden `verified: false` bir anlık görüntüye bağlı. → FAZ-3.14

## V-13 — TCMB kuru doğrulanmadı
`registry/rates/tcmb-2026-08-15.json` elle girildi (`usdTry: 41.85`), TCMB XML'inden
doğrulanmadı. TRY yalnız GÖRÜNTÜDE kullanıldığı için (D-36) hesabı etkilemiyor —
ama gösterilen sayı yanlış olabilir ve `doğrulanmamış kur` etiketi bunu söylüyor.
→ FAZ-4.12 (Cost & Budget ekranı)

## V-12 — Aday dönem probe bake-off mekanizması
`brand/probes/` ile birden fazla aday dönemin yan yana karşılaştırılması. §12'nin sert
kuralı gereği **ilk yeniden üretim gerçekten acıtana kadar** kurulmaz. → FAZ-2.8

## D-207 — "Düzleştirme" KANALA aittir, deck'e değil

**Tarih:** 2026-08-16 · **Bağlam:** FAZ-6.1 · §7.6

§7.6'yı bu oturumda yazarken "PDF DÜZLEŞTİRİLİR" diye **kayıtsız** bir kural koydum.
FAZ-6.1'in kendi ✅ kriteri ise "düzleştirilmiş, **metin seçilebilir**" diyor — kendi
anayasa maddem, uygulayacağı adımla çelişiyordu.

**Karar:** prospect deck'i tek düz belge olarak üretilir ama **metin katmanını KORUR**.
Rasterleştirme yalnız `linkedin-document` (6.3) için, çünkü LinkedIn'in görüntüleyicisi
metin katmanlı PDF'lerde satır kırılmalarını bozuyor. Deck okunan, kopyalanan, alıntılanan
bir belgedir; metnini kilitlemek okuyucuya zarar verir ve hiçbir şey kazandırmaz.

**Alternatif (reddedildi):** her PDF'i rasterleştirmek. Tek kural olması basit görünüyor
ama iki farklı kanalın iki farklı kısıtını tek doğruymuş gibi sunuyor.

**Ders:** genelleme, bir maddeyi kapsadığı VAKALARDAN daha geniş yazmaktır. Kural yazarken
"hangi kanal bunu istiyor" sorusu sorulmazsa, bir kanalın arızası tüm sistemin yasası olur.

**Geri alma maliyeti:** düşük — `page.pdf()` çağrısında tek bayrak.

## D-208 — `izinli: []` — "hiç olmasın" da bir darboğaz biçimidir

**Tarih:** 2026-08-16 · **Bağlam:** FAZ-6.1 · D-21

`chokepoints.json` bugüne kadar "tam olarak bir tane olmalı" listesiydi. D-21 ise
Gamma/Presenton/Canva gibi hazır deck üreticilerinin **hiç** kullanılmamasını istiyor —
tek yetkili yeri de yok.

**Karar:** boş `izinli` listesi "yasak" anlamına gelir ve aynı lint bunu zorlar. Ayrı bir
"yasaklı bağımlılıklar" mekanizması kurulmadı: ikinci bir liste, ikinci bir bakım yüzeyi
ve kaçınılmaz olarak birinin unutulduğu gün demektir.

**Kanıt:** `gamma.app/api/generate` yazan bir dosya → `hazir-deck-ureticisi` kırmızı;
ihlal `scripts/ihlal-bataryasi.mjs`'e eklendi, geri alınca yeşile döndü.

**Geri alma maliyeti:** düşük — `chokepoints.json`'dan bir kayıt.

## D-209 — ECharts SSR ölçüldü ve reddedildi: Türkçe'de %83 sapıyor

**Tarih:** 2026-08-16 · **Bağlam:** FAZ-6.2 · §7.6 · D-24

FAZ-6.2 "ECharts SSR (SVG)" öngörüyordu. Kurdum ve **ölçtüm** — çünkü bir bağımlılığı
gerekçeyle reddetmek, hakkında hüküm vermekten farklıdır:

| etiket | echarts | chromium | sapma |
|---|---|---|---|
| Ağustos | 48,8 | 43,4 | +%12,6 |
| İğne fire % | 71,5 | 57,4 | +%24,7 |
| Çğüşiöı | 74,6 | 40,7 | **+%83,4** |

SSR'da tuval yok, bu yüzden zrender metin genişliğini tahmin ediyor. Eksen payı, etiket
döndürme ve "sığmayanı gizle" kararları bu sayılarla veriliyor: **sığan etiket gizlenir,
sığmayan taşar.** Ayrıca varsayılan paletini (`#5070dd`) SVG'ye sızdırıyordu — adımın
kendi ✅ kriteri tam da bunu yasaklıyor.

**Karar:** `packages/render/src/charts/` — geometri SVG, **metnin tamamı HTML**. Ölçek
matematiği (nice-tick, normalizasyon) ~60 satır; metin ölçümü hiç yok.

**Alternatif (reddedildi):** ECharts'ı `--no-label-layout` benzeri bir kısıtla kullanmak.
Böyle bir bayrak yok ve olsaydı bile kütüphanenin yarısını kullanmak için tamamını
taşımak olurdu.

**Ders:** bir bağımlılığı reddetmenin dürüst yolu onu KURMAK ve ölçmektir. "Muhtemelen
Türkçe'de bozulur" bir tahmindi; %83,4 bir kanıt.

**Geri alma maliyeti:** orta — `chartHtml` imzası korunarak içi değiştirilebilir.

## D-210 — D2 diyagramı da reddedildi; ok bir karakter değil, geometridir

**Tarih:** 2026-08-16 · **Bağlam:** FAZ-6.2 · §7.6

D2 aynı hatayı yapıyor (kendi font metriğiyle kutu genişliği hesaplıyor) **ve** harici bir
Go ikilisi: `alt-surec` darboğazından geçmesi, kurulum adımı eklemesi ve "bir ay ihmal
edilse de çalışır" (§16) vaadini zayıflatması gerekirdi.

**Karar:** `diagram.ts` — kutular HTML (`grid-auto-columns: 1fr`, sabit genişlik yok,
R-23), oklar SVG geometrisi. Ok için `→` karakteri **kullanılmadı**: latin-ext bir font
o glifi taşımayabilir ve yerine `notdef` kutusu basılırdı (§7.2). Yatay akış tavanı 5
kutu; fazlası deck'te okunamıyor ve sessizce daraltmak yerine reddediliyor.

**Kapı:** `metin-olcen-grafik-kutuphanesi` darboğazı (`izinli: []`) echarts · chart.js ·
plotly · highcharts · vega · d2lang'i yasaklıyor. İlk deseni kendi `./charts/chart.js`
modülümüzü yakalıyordu — **yanlış pozitif de bir hatadır**, desen paket adına daraltıldı
ve iki biçim (düz ad · alt yol) ayrı ayrı ihlal edilerek doğrulandı.

**Geri alma maliyeti:** düşük.

## D-211 — Düzleştirme ikinci araç GEREKTİRMEDİ: aynı Chromium, iki geçiş

**Tarih:** 2026-08-16 · **Bağlam:** FAZ-6.3 · §9.3 · R-30

Düzleştirilmiş PDF üretmenin bilinen yolu bir PDF aracıdır (ghostscript, qpdf, pdftk).
Hepsi ikinci bir renk profili ve ikinci bir font gömme yolu getirir — ve ikisi de
sessizce bozar. Kurulum adımı da eklerler; "bir ay ihmal edilse de çalışır" (§16) her
yeni ikilide biraz daha zayıflar.

**Karar:** her sayfa aynı Chromium'da JPEG'e çevriliyor, görüntüler yine aynı Chromium'da
tek PDF'e basılıyor. Tek motor korunuyor (R-30), kalite merdiveni (§9.3) bu döngünün
içinde çalışıyor: 92 → 82 → 72 → 62, tavanın altına inene kadar.

**Kanıt (ölçüldü):** deck → `pdftotext` Türkçe metni tam veriyor, `pdfimages` **sıfır**
satır. LinkedIn dökümanı → `pdftotext` **boş**, `pdfimages` iki 1200×1500 JPEG. Aynı
kaynak, aynı motor, iki farklı kanal sözleşmesi.

**Ödenen bedel BEYAN EDİLDİ:** düzleştirilmiş sayfada ekran okuyucu hiçbir şey bulamaz.
Her görüntü sayfanın kendi metninden türetilen bir `alt` taşıyor — kaybı telafi etmiyor
ama gizlemiyor da.

**Geri alma maliyeti:** düşük — `renderDeckPdf` zaten metin katmanlı yolu tutuyor.

## D-212 — KVKK silmesi dosyayı silmez: kişisel veri silinir, mezar taşı kalır

**Tarih:** 2026-08-16 · **Bağlam:** FAZ-6.4 · §5.1 · R-12

FAZ-6.4 "silme talebi = dosya silme" diye yazıyordu. Uygularken iki yükümlülüğün
çatıştığını gördüm; düz dosya silme ikisini birden kaybettiriyor:

1. **Köken zinciri.** Silinen kayda atıf veren varlıkların kaynağı kopar; altı ay sonra
   bir deck'teki iddianın nereden geldiği sorulduğunda cevap "dosya yoktu" olur — iddia
   geriye dönük olarak kaynaksız hâle gelir (R-32'nin geçmişe bakan hâli).
2. **Silmenin kanıtı.** KVKK'da yükümlülüğü yerine getirdiğini **gösteremiyorsan**
   getirmemişsindir. Dosyayı yok etmek hiçbir iz bırakmaz.

**Karar:** `kvkkErasure` kişisel alanları siler, gövdeyi sabit bir bildirimle değiştirir
ve kaydı `retired` + `expired_at` + `kvkk_erased_at` + gerekçe ile bırakır. Kalan kayıt
kişisel veri **taşımaz**: şirket unvanı bile silinir. Kalan tek şey "burada bir kayıt
vardı ve silindi"dir.

**Neden emeklilikten ayrı:** emeklilik bir GEÇERLİLİK kararıdır (bu bilgi artık doğru
değil), silme bir YASAL yükümlülüktür. İkisi tek fonksiyona bağlansaydı ya her emeklilik
veri silerdi ya hiçbir silme gerçekleşmezdi. Test ikisini karşı karşıya koyuyor:
`retireRecord` sonrası kişisel veri **duruyor**, `kvkkErasure` sonrası **yok**.

**Kapılar:** `corpus-silici` darboğazı (`izinli: []`) `packages/corpus/` altında her
dosya silme çağrısını yasaklıyor. `prospect-kvkk` kapısı şemanın kuramadığı koşullu
kuralı zorluyor — PROFILE `if/then`i yasaklıyor çünkü dört projeksiyonun hiçbiri
çeviremiyor: kişisel veri varsa `kvkk_disclosure_sent`, silinmiş kayıtta kişisel alan
kalmamış olmalı. Üçü de kasten ihlal edildi, üçü de kırmızı, ikisi bataryada.

**`x_signature` siliniyor:** içerik kasten değişti; kalsaydı imza kontrolü bunu "elle
düzenlenmiş" sayıp çalıştırmayı durdururdu (§4.6) — oysa bu meşru bir silme.

**Sahte prospect YAZILMADI:** uydurulmuş bir şirket, doğruluk kaynağına giren bir
kurgudur. Kaydın ŞEKLİ testte doğrulanıyor; gerçek kayıtlar insan girdisiyle gelir.

**Geri alma maliyeti:** düşük — fonksiyon tek dosyada, çağıranı yok.

## D-213 — `INGEST` tarayıcı AÇMAZ: plan "yerel Playwright" diyordu, olamaz

**Tarih:** 2026-08-16 · **Bağlam:** FAZ-6.5 · §14 · R-04

Plan araştırma şelalesinin ilk basamağını "kendi siteleri (yerel Playwright)" diye
tarifliyordu. Uygularken iki yasayla çarpıştı: R-04 "yalnız `RENDER` Chromium'a dokunur"
ve `chromium-baslatan` darboğazı tek başlatıcıya izin veriyor.

**Ama asıl gerekçe mimari değil, güvenlik.** Tarayıcı açmak, prospect sitesinden gelen
JavaScript'i **çalıştırmak** demektir — §14'ün enjeksiyon sınırının altını oyan tam olarak
bu olurdu. Metni okumak için kod çalıştırmak gerekmiyor.

**Karar:** `INGEST` tek HTTP istemcisini (`kernel/src/net/http.ts`) kullanır ve HTML'i
~20 satırlık bir dönüştürücüyle metne çevirir (R-75: ayrıştırıcı bağımlılığı eklenmedi).
`<script>` ve `<style>` gövdeleri tamamen atılır.

**Ödenen bedel BEYAN EDİLİYOR:** yalnız JavaScript ile çizilen bir site bize boş görünür.
Bu `bos_icerik` olarak raporlanır — sessizce boş metin dönmez, çünkü boş dönen bir çekim
"site hakkında hiçbir şey yok" diye okunurdu.

**Bataryanın bulduğu:** ilk sürümüm `slugFor`da çıplak `.toLowerCase()` çağırıyordu
(R-21). URL slug'ında Türkçe metin olmadığı için zararsız görünüyordu — kuralın değeri
tam olarak "istisna yok"tan geliyor: bir istisna açıldığı an sonraki çağrı Türkçe metinle
gelir ve kimse fark etmez.

**Geri alma maliyeti:** düşük.

## D-214 — Tavan sayısı KURALLAR.md'den okunur, koda ikinci kez yazılmaz

**Tarih:** 2026-08-16 · **Bağlam:** FAZ-6.7 · R-36 · R-74

Adımın 🧪 kriteri şuydu: *"tavanı 6'ya çıkarmayı dene → `KURALLAR.md` değişmeden kod
değişmiyor"*. Bunu bir temenni olarak bırakmak mümkündü; kapıya bağlamak da mümkündü.

**Karar:** `kisisellestirme` kapısı sayıyı `KURALLAR.md`'deki R-36 satırından **okur** ve
koddaki sabitle karşılaştırır. İki yerde iki farklı sayı yazması artık derleme değil ama
**kapı** hatasıdır. Kuralın yazılı hâli ile kodun hâli, ancak biri diğerinin kaynağıysa
ayrışamaz.

**Alternatif (reddedildi):** sayıyı yalnız kodda tutup kural kitabına "koda bak" yazmak.
O zaman kural kitabı, kuralı bilmeyen bir belge olurdu — ve bu projede kural kitabının
tek işi kuralı bilmek.

**Genel biçim:** bu desen sayı taşıyan her kural için tekrarlanabilir (tazelik 14 gün,
sayfa tavanı 10). Şimdilik yalnız R-36'ya uygulandı; diğerleri kendi adımlarında
bağlanır — bir deseni ihtiyaç doğmadan genelleştirmek, kullanılmayan soyutlama üretir.

**Geri alma maliyeti:** düşük — kapı tek dosya.

## D-215 — Güvenli alan KENDİ tarihini taşır, satırın tazeliği onu kapsamaz

**Tarih:** 2026-08-16 · **Bağlam:** FAZ-7.1 · §9.1

Spec tablosu 3.15'te kuruldu, drift denetçisi 4.17'de doctor'a bağlandı. 7.1'de kriteri
**ölçerken** boşluk çıktı: `specAgeDays` yalnız `placement.verifiedAt`i okuyor, oysa
`safeArea`nın **kendi** `sourceUrl` + `verifiedAt`i var. Ölçüm: güvenli alanı bir yıl
geriye alınmış bir satır için denetçi **1 gün** diyordu.

**Neden önemli:** güvenli alan ölçüleri Reels tasarım kılavuzundan gelir ve platform
ölçüsünden **bağımsız** değişir. Biri tazelendiğinde diğeri tazelenmiş sayılamaz. Yanlış
bir güvenli alan başlığı UI chrome'un altına düşürür — ve bunu ancak yayınladıktan sonra
fark edersiniz.

**Karar:** `specStaleness(p, today)` iki tarihi **ayrı ayrı** döndürüyor ve doctor iki
ayrı bulgu üretiyor. En eskisini alıp tek sayı vermek daha basitti ama hangi kaynağın
yenilenmesi gerektiğini gizlerdi — iki farklı URL'e bakan bir insan için o bilgi işin
kendisi (D-198).

**Ayrım korundu:** güvenli alanı olmayan satırda `safeAreaDays` **`null`**, `0` değil.
`0` "bugün doğrulandı" demek olurdu; `null` "böyle bir şey yok" demek.

**Kanıt:** güvenli alan tarihi geriye alındığında `⚠ [spec] instagram-story-9x16:
GÜVENLİ ALAN 592 günlük` çıktı; geri alınınca bulgu kayboldu.

**Ders (üçüncü kez):** yeni bir alan eklemek, onu OKUMASI GEREKEN her yeri güncellemeyi
gerektirir. Bu turda aynı sınıftan iki hata bulundu — `chart` bloğu lexicon linter'ında,
`safeArea.verifiedAt` drift denetçisinde. İkisinde de derleyici sustu.

**Geri alma maliyeti:** düşük.

## D-216 — FAZ 6 KAPANMADI: mekanizma yazıldı, üretim yoluna bağlanmadı

**Tarih:** 2026-08-16 · **Bağlam:** FAZ-6 kapanış turu (LOOP§D) · D-182

Bağımsız doğrulama agent'ı FAZ 6'nın **çekirdek iddiasını çürüttü**. `just verify` yeşil,
1087 test geçiyor, 12 kural kırmızıya döndürülüyor — ve buna rağmen sistem **hiçbir**
şirkete deck üretemiyor. Bulgular tek bir sınıfta toplanıyor: **kod yazıldı, üretim
yolunda çağıranı yok.**

| # | Ne | Kanıt |
|---|---|---|
| 1 | `renderDeckPdf` sıfır çağıran; RENDER gövdesi `format: pdf`i hiç okumuyor | diskte 0 PDF, 23 manifest'in hepsi post/carousel |
| 2 | `deck`/`prospect-deck` hatları plan aşamasında sağlayıcısız | `max_chars: 4000` desteklenmeyen kademe |
| 3 | `prospectDeckZinciri` sıfır çağıran; `chain:` kısıtını kimse okumuyor | VALIDATE gövdesi yalnız `kaliteKontrol` koşuyor |
| 4 | `INGEST` fiil gövdesi HİÇ YOK | `uret.mjs` fiil haritasında INGEST ve PROPOSE yok |
| 5 | Üç yeni manifest dedektörü ölü | hiçbir kod `fetchedAt`/`personalizationFields`/`productShots` yazmıyor |
| 6 | `captureProductShot` sıfır çağıran | testte bile yok |
| 7 | `chart` CSS'i statik yolda gömülmüyor | üretim PNG'sinde grafik bozuk, kapı görmüyor |
| 9 | `runVerb` (→ `ingestGate`) üretimde koşmuyor | `runPipeline` `verb.run`u doğrudan çağırıyor |

**Karar:** FAZ 6 **KAPANMADI**. Dokuz tik duruyor ama fazın kendisi açık; `DURUM.md`
bunu ilan ediyor ve kapanış ancak bulgular kapandıktan sonra tekrar denenir. Tikleri
silmiyorum — adımların ürettiği kod gerçek, testli ve doğru; eksik olan **bağlanma**.
Silmek yapılan işi de silerdi; asıl dürüst hamle eksiğin ADINI koymak.

**Kök neden — ve bu üçüncü tekrar:** D-182'de donmuş plan yazılmıştı, `uret.mjs`
çağırmıyordu. D-190'da düğmenin `onClick`i yoktu. Şimdi aynı hata **bir seviye yukarıda**:
`tazeMi`nin çağıranı var (`inspectManifest`), ama `inspectManifest` o veriyi hiç görmüyor
çünkü onu yazan yok. **"Çağıran var mı" sorusu bir adım değil, ZİNCİR sorulmalı:** üretim
girişinden kurala kadar kesintisiz bir yol var mı?

**Bu turda kapatılanlar:** bulgu 2 (kademe düzeltildi, hatlar planlanıyor) · bulgu 7
(CSS gömüldü + `blok-css` kapısı yazıldı, üç biçimde ihlal edildi).

**Batarya genişletildi:** `blok-css` ihlali "yeni dosya yaz" biçimiyle ifade edilemiyordu;
batarya artık **yama** modunu da destekliyor. Desteklemeseydi, bataryaya giremeyen bir
kapı sınıfı kalırdı — yani her turda kanıtlanamayan kapılar.

**Kendi kapımı da ihlal testi yakaladı:** `blok-css` ilk sürümü dosyada dizeyi arıyordu
ve `import { CHART_CSS }` satırı onu sağlıyordu — kullanımı silsen bile kapı yeşildi.

**Geri alma maliyeti:** yok — bu bir kayıt düzeltmesi.

## D-217 — FAZ 6 ŞARTLI kapandı: iki tur, 28 bulgu, tek sınıf hata

**Tarih:** 2026-08-16 · **Bağlam:** FAZ-6 kapanışı (LOOP§D · D-79) · D-216

İki doğrulama turu koştu ve **28 bulgu** verdi. Birinci tur 12, ikinci tur 16 — ve
neredeyse hepsi tek sınıftandı: **kod yazılmış, üretim yolunda çağıranı yok.** Hepsi
kapatıldı; **üçüncü tur açılmıyor** (D-79).

**İkinci turun iki bulgusu özellikle öğretici:**

1. **Kendi gerilemem.** PDF yolunu bağlarken `deps.check`in yalnız `slides` varken
   çağrıldığını fark etmedim ve `lintDocument` onun içindeydi — üç PDF hattında
   kaynaksız sayı kapısı **hiç koşmuyordu**. Üstüne zincire `lexiconIhlalleri: []`
   geçiyordum ve **yorumum "check'in içinde koştu" diyordu**. Yorum yanlıştı ve yanlış
   bir yorum, olmayan bir kapıyı var gösterir.
2. **Kendi kendini onaylayan test çifti.** `composeBody` `productShots`u `basis`siz
   üretiyordu, zincir `basis` arıyordu; testlerim ise elle `basis` yazılmış, **üretimin
   hiç üretmediği** bir fikstür kullanıyordu. İkisi de yeşildi ve zincir gerçek üretimi
   reddediyordu. Karşılığı `uretim-sekli.test.ts`: girdiyi ÜRETİM üretir, tüketiciye o
   verilir.

**Kapanış ŞARTLI ve çıkış kriteri tikle ÖRTÜLMÜYOR** (D-206 deseni). Faz şunu istiyordu:
*"adı geçen gerçek bir şirkete özel deck üretildi ve görüşmeden önce gönderildi"*. Bu bir
**insan eylemidir**: gerçek prospect kaydı (`6.9b`, V-25) ve şelale anahtarları
(`6.5b`, V-24) olmadan sistem onu iddia edemez. Zincir uçtan uca doğrulandı; teslim
edilmedi.

**Dürüstlük düzeltmesi:** V-24 önce "kalan iş yalnız bağlantı" diyordu. Yanlıştı — dört
kaynağın **adaptörü de yazılmamış**. Bir anahtar blokajının arkasına saklanmış teknik
eksikti ve borç metni düzeltildi. Aynı şekilde FAZ-6.5'in "şelale sırayla düşüyor" ✅'sı
daraltıldı: plan sırayla düşüyor, çekim yalnız `own-site`tan.

**Kalıcı ders — üç kez tekrarladı:** yeni bir blok tipi, alan ya da çıktı anahtarı
eklerken onu **okuması gereken her yeri** ara. `chart` linter'da, `safeArea.verifiedAt`
drift denetçisinde, çıktı anahtarları `ozetle()`de kaçtı. Derleyici üçünde de sustu,
çünkü hiçbiri `switch` değildi.

**Geri alma maliyeti:** yok — bu bir kapanış kaydı.

