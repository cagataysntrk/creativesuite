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

## D-80 — V-01 kapandı: Remotion lisansı D-25'i teyit etti
2026-08-15 · Birincil kaynak: `LICENSE.md` "a for-profit organization with **up to 3
employees**" ve `remotion.dev/docs/license/pricing`. UPCYTECH 6 kişi → bedava lisansa
uygun değil.
Fiyat katmanı **koltuk değil**: pipeline'lar programatik ve toplu render ediyor
(FAZ-5.7/5.8/5.9), bu tanım gereği *Remotion for Automators* — "$0.01 per render,
**$100/mo minimum**". Yani hiç render etmesen de yılda **$1.200**.
HyperFrames Apache 2.0 ve aynı motoru (headless Chrome + FFmpeg) kullanıyor; R-30
korunuyor. Yıllık $1.200'lük yükümlülük, aynı yasayı koruyan bedava alternatif varken
alınmaz. Yedek (Revideo, MIT) belgeli hâliyle duruyor. 🔴 kalktı.

## D-81 — Keşif `just plan` altında değil, kendi komutunda
2026-08-15 · FAZ-2.7'nin ✅'si `just plan discovery` diyordu. Uygulanamaz: `just plan`
argümanını `registry/pipelines/<id>.pipeline.yaml` olarak çözüyor ve keşif bir pipeline
DEĞİL — marka DNA'sının yeniden üretimi.
**Karar:** `just discovery [merge|mirror]`. Kriter gerçeğe uyduruldu (D-76 deseni).
**Neden ayrı komut:** keşfi pipeline listesine sokmak `just plan` çıktısının anlamını
ikiye bölerdi — biri maliyet tahmini olan bir üretim planı, diğeri corpus farkı olan bir
öneri listesi. Aynı kelime iki şeye işaret ederse ikisi de güvenilmez olur (§3.9 kanonik adlar
mantığı).
**Ayrıca:** aday listesi yokken çıktı "0 op" demiyor, **aday listesi YOK** diyor. Boş bir
plan ile değişmemiş bir corpus aynı şey değildir; ikisini karıştırmak hiç koşmamış bir
motoru çalışıyor sanmaktır (D-75'in aynı hatası).

## D-82 — Kuruluş tarihi: sicil belgesi tek doğru (V-08 kapandı)
2026-08-15 · Üç tarih çatışıyordu: ticaret sicili **3 Tem 2025** · LinkedIn **2022** ·
upcymarket.com **"2021'den beri"**.
**Karar:** sicil tarihi tek doğrudur. Gerekçe basit ve tartışılmaz: **yalnız o belgeli**.
Diğer ikisi beyandır ve beyan, kayıtla çelişince kaybeder.
**Sonuç iki iş doğuruyor** (ikisi de insan işi, FAZ-7 kanal adaptörlerinden ÖNCE):
LinkedIn şirket sayfasındaki kuruluş yılı ve upcymarket.com'daki "2021'den beri"
ifadesi düzeltilecek. Düzeltilmezse ilk prospect doğrulamasında sistem yalancı çıkar —
ve bu, üretilen her içeriğin güvenilirliğini birlikte götürür.
**Not:** "2021/2022" beyanları muhtemelen kurucunun çalışmaya başladığı tarihi
anlatıyor; o iddia meşrudur ama **şirket kuruluşu** diye sunulamaz. Gerekirse
"2021'den beri bu alanda çalışıyoruz, 2025'te şirketleştik" biçiminde ayrıştırılır.

## D-83 — İlk keşif kayıtları DRAFT kalıyor, onay insanın
2026-08-15 · FAZ-2.9'un ✅'si "her varlık tipinde en az bir `status: active` kayıt"
diyordu. Yedi kayıt `propose()` üzerinden yazıldı ve **draft** indi.
**Onları `active` yapmak agent'ın işi DEĞİL** (R-14, D-31, CLAUDE.md yasa 2): agent
kendi önerisini onaylayabilseydi "agent önerir, insan uygular" bir konvansiyona dönerdi.
Kullanıcının "tam yetki" talimatı geliştirme kararlarını kapsıyor; **şirketin ne olduğu
beyanını kapsamıyor** — o beyan kullanıcının kendi sözü.
**Karar:** adım `2.9` BLOKE, engel: insan onayı. `just onayla <yol…>` komutu yazıldı;
kullanıcı yedi kaydı okuyup onaylayınca adım kapanır ve FAZ 2 kapanabilir.
**Bu, "durmak yok" kuralının ihlali değildir** (LOOP§G): bloke adım işaretlenir, döngü
sonraki bağımsız adıma geçer.

## D-84 — `dima` ayrı marka ekseni; pazar adı ayrı bir soru (V-06)
2026-08-15 · V-06 iki soruyu birbirine karıştırıyordu: **veri modeli** ("dima ayrı bir
marka ekseni mi") ve **pazar sunumu** ("dima by Upcytech onaylı-marka mı, bağımsız mı").
İkisi bağımsızdır ve ayrılınca karar kolaylaşıyor.
**Veri modeli kararı (benim):** `dima` ayrı `brand_id`. Gerekçe asimetrik risk —
- Ayrı eksen açıp sonra "aslında ürün hattıymış" demek: `brand/brd_dima/` silinir,
  kayıtlar `brand_id` değiştirir. Ucuz.
- Eksen AÇMAYIP sonra ihtiyaç duymak: geriye dönük `brand_id` atanamaz, çünkü hangi
  kaydın hangi markaya ait olduğu artık yazılı değil. D-39'un tam olarak düzelttiği
  delik; retrofit imkânsız (R-11'in aynı mantığı).
Token kalıtımı bu kararı ucuzlatıyor: dima Upcytech'ten devralıyor ve bugün yalnız
**iki token eziyor** — ayrı eksen olmak, ayrı tasarım sistemi olmak değil.
**Pazar sunumu kararı (kullanıcının):** onaylı marka mı bağımsız mı — bu bir konumlandırma
beyanıdır, D-83'ün ayrımına göre kullanıcıya ait. Hangisi seçilirse seçilsin veri modeli
aynı kalır; değişen şey yalnız `corpus/positioning` kaydının metnidir.
**Geri alma maliyeti:** düşük (yukarıdaki ilk madde).

## D-85 — DURUM tamamlananlar tablosu yalnız AKTİF fazı gösterir
2026-08-15 · Tablo her adımda büyüyordu ve `DURUM.md`'nin 120 satır tavanını (R-63)
yedi. Tavanı yükseltmek yanlış cevap: `DURUM.md` her turda okunan dosyadır ve uzadıkça
compact sonrası ilk okumanın maliyeti artar.
**Karar:** tablo yalnız aktif fazın tiklerini taşır; önceki fazlar bir satırlık sayı ile
özetlenir. Kaynak yine faz dosyaları (D-46 değişmedi) — tablo onların kopyası değil,
**bugünün özeti**. Tam geçmiş `git log`da ve faz dosyalarında.
**Aynı desen:** KARARLAR.md 600 satırda arşive devrediyor (D-72). Büyüyen her dosyanın
yapısal bir boşaltma yolu olmak zorunda; yoksa tavan bir gün "kaldıralım" diye
gevşetilir ve o gün tavanın anlamı biter.

## D-86 — Snap Chromium reddedildi, Playwright'ın kendi tarayıcısı
2026-08-15 · Sistemde `/snap/bin/chromium` hazır duruyordu. Ölçüldü ve **reddedildi**:
- **Confinement:** `/tmp` altına yazamıyor (`No such file or directory`), yalnız `$HOME`.
  Playwright'ın `chromium-1194`'ü aynı komutla aynı yola 33.446 baytlık PNG yazdı.
- **Sürüm sabitlenemiyor:** snap kendi kendine güncelleniyor. Golden metrik testinin
  (R-31) tek varlık sebebi glif metriklerinin sabit kalması; kendini güncelleyen bir
  tarayıcı hiçbir commit olmadan metriği değiştirir — build sebepsiz kırmızıya döner
  ya da daha kötüsü metrik güncellenir ve o gün gerçek bir regresyon gizlenir.
`playwright@1.56.1` sabit sürümle eklenecek; `browser.ts` tarayıcıyı sistemden ARAMAZ.
Yan kazanç: Playwright `ffmpeg-1011`'i de indiriyor (FAZ 5 için, sürümü de sabit).

## D-87 — Darboğaz desenleri BİÇİM değil ERİŞİM arar
2026-08-15 · FAZ 2 birinci doğrulama turu üç darboğazı trivial biçim değişiklikleriyle
atlattı: satır bölme, koşul sırası, dize birleştirme, takma adlı import. Kapılar yeşil
raporluyordu.
**Düzeltme:**
- `retrieval-yuklemi`: desen yüklem biçimini değil `record` tablosuna ERİŞİMİ arıyor
  (`FROM record`). İzinli dosya sayısı üç ve listede görünüyor.
- `corpus-yazici`: desen çağrı parantezi değil TANIMLAYICI arıyor —
  `import { writeFileSync as yaz }` satırı parantez taşımıyordu ve geçiyordu.
**Dürüst sınır (D-77'nin aynı notu):** `'FROM rec' + 'ord'` hâlâ kaçabilir. Bu kapılar
kopyala-yapıştıra karşı **tel tuzaktır, kum havuzu değil**. Asıl güvence dosya sayısının
küçük ve listede görünür olması. Zorlanmayan bir kuralı zorlanıyormuş gibi göstermemek
için bu sınır `chokepoints.json`'ın `neden` alanına da yazıldı (R-70).
**Yapısal iyi haber:** `git-cagiran`'ı atlatma denemesi `alt-surec` tarafından yakalandı —
git'i çağırmak için `node:child_process` import etmek gerekiyor ve onu yalnız
`proc/spawn.ts` yapabiliyor. Katmanlı savunmanın işe yaradığı yer.

## D-88 — `lexicon` fail-open kapatıldı, sayısal iddia tanımı genişledi
2026-08-15 · İki kör nokta, ikisi de doğrulama agent'ından:
1. **Fail-open:** `era_of_origin` alanı olmayan kayıt `'*'`e düşüyordu; `'*'`
   "dönemden bağımsız olgu" demek ve bütün aktarım denetimini atlatıyordu. Kapı
   argümansız bir kayıt için "argümanları tam" diyordu. **Eksik bilgi güvenli tarafa
   değil HATA tarafına düşer** — artık `missing_era_of_origin`.
2. **Tamsayı iddiaları:** desen yalnız `%N` görüyordu. "1.247 İlan", "892 Satıcı",
   "300 müşteri kazandırdık" kaynaksız geçiyordu — ve bunlar `.claude/rules/`
   içinde BİREBİR yasak örnek olarak sayılan ifadeler. Desen binlik ayraçlı ve
   üç haneli tamsayıları da kapsıyor; 1900-2100 arası çıplak dört hane (yıl) hariç.

## D-89 — `tokens` kapısı markaları TARAR, listelemez
2026-08-15 · Kapı sabit bir marka dizisine bakıyordu. Doğrulama agent'ı üçüncü bir
marka dizini açıp kademe ihlalli token yazdı: hiçbir kapı görmedi.
**Listeye eklemeyi hatırlamak bir zorlama değildir** — ve fazın başlığı çok markalılıkken
üçüncü markanın denetimsiz kalması, kapının korumadığı şeyin ta kendisi.
`brand/` dizini taranıyor; kalıtım `brand/<id>/parent` tek satırından okunuyor.

## D-90 — `x_signature` "değişti"yi değil "KIRIK"ı yakalıyor, ve artık ÜRETİLİYOR
2026-08-15 · Doğrulama agent'ı beş senaryoluk matrisle gösterdi: kapı korunması gereken
durumda AÇIK, meşru güncellemede KAPALIydı.
- **A) insan gövdeyi elle düzeltti, imza eski** → motor YAZDI, insan metni EZİLDİ.
- **C) motor yeni içerik üretti** → REDDEDİLDİ (meşru güncelleme bloklandı).
Sebep: karşılaştırma "gelen imza ≠ dosyadaki imza" idi, yani **imza değişti mi** sorusu.
Doğru soru: **dosyanın içeriği kendi imzasıyla uyuşuyor mu.** Uyuşmuyorsa dosyaya insan
dokunmuştur.
Ayrıca imza hiç ÜRETİLMİYORDU: `grep x_signature` yalnız tip ve okuma buluyordu, hiçbir
kayıtta alan yoktu — koruma tamamen atıldı. `propose()` artık gövde + frontmatter
kanonik özetini basıyor. Onay damgaları (`approved_by/at`, `valid_at`) imza dışı:
onay içeriği değiştirmez, imzaya girseydi onaylanan her kayıt bir sonraki turda
"elle düzenlenmiş" sanılırdı.

## D-91 — Alan bazlı red/pin gerçekten uygulanıyor
2026-08-15 · `decisions.ts` tipi `(json_pointer, hash)` sözleşmesi yazıyordu ama
`plan.ts` her çağrıda `pointer` yerine sabit boş dize geçiyordu: alan bazlı pin hiç
işlemiyordu ve testlerin dördü de `''` kullandığı için kural sınanmıyordu.
`CandidateRecord.fields` eklendi; her alan KENDİ pointer'ı ve hash'iyle sorguluyor.
Sabitlenmiş bir alan op'u durdurmuyor — o alana **dokunulmuyor** ve çıktıda görünüyor.
Tüm alanlar bastırılmışsa öneri düşüyor.
**Neden alan bazlı şart:** bir kaydın dokuz alanı doğru, biri yanlış olabilir. Tümünü
reddetmek doğru dokuzu da çöpe atar ve sonraki turda hepsi yeniden önerilir —
kullanıcı aynı dokuz kararı tekrar verir. Defterin varlık sebebi tam olarak budur.

## D-92 — Arama elemesi SQL seviyesine taşındı
2026-08-15 · `selectSearch` önce sıralayıp SONRA eliyordu. Doğrulama agent'ı eşiği
ölçtü: **100 görünmez kayıt** görünür kaydı sonuçtan sessizce düşürüyordu — koddaki
yorum eşiği "2000 kayıt" sanıyordu, **20 kat sapma**. Yanlış bir yorum, olmayan bir
yorumdan tehlikelidir: ikincisi araştırmaya davet eder, birincisi güven verir.
**Düzeltme:** görünür id kümesi geçici bir tabloya yazılıyor ve FTS sorgularına join
ediliyor. `IN (...)` kullanılmadı — SQLite'ın ~999 parametre sınırı corpus büyüdüğünde
sessizce patlardı. Yüklem hâlâ `select.ts`te (R-13); `search.ts` yalnız filtreyi
uyguluyor, yüklemi bilmiyor.
**Kalıcı test:** 300 draft / 100 emekli / 200 başka marka arasındaki tek görünür kayıt
aramada geliyor. Eski davranışa dönüldüğünde üçü de kırmızı.

## D-93 — `era` kapısı: etiketsiz dönem yakalanıyor
2026-08-15 · `brd_dima`nın dönemi `git tag` almamıştı ve **era için hiç kapı yoktu**.
Etiketsiz dönem, git geçmişinde tutamağı olmayan dönemdir: "o günkü ağacı ver" sorusu
cevapsız kalır ve §4.3'ün üç ucuz parçası ikiye iner.
Kapı üçünü birden denetliyor: her `era.yaml` için etiket, her markada en az bir dönem,
`current` var olan bir döneme işaret ediyor. İkisi de ihlal testiyle kırmızıya döndürüldü.

## D-94 — Onay komutu `write.ts`ten geçiyor, saati `clock.ts`ten okuyor
2026-08-15 · `scripts/onayla.mjs` corpus'a `writeFileSync` ile doğrudan yazıyor ve
`new Date()` çağırıyordu — iki darboğazın da beyan ettiği değişmezi çiğniyordu ama
kapsam `packages/*/src` olduğu için hiçbir kapı görmüyordu.
**Düzeltme:** yazma `writeRecord(actor: 'human')`tan geçiyor ve imzayı yeniden
hesaplıyor (D-90); saat `systemClock`tan okunuyor. `saat`, `rng` ve `id-ureteci`
darboğazlarının kapsamı `scripts/`i de kapsıyor.
**Kapsam GENİŞLETİLMEDİĞİ yer:** `corpus-yazici`. O darboğaz corpus'a yazmayı
kısıtlıyor, her dosya yazmayı değil; `scripts/extract-research.mjs` `docs/research/`
altına yazıyor ve meşru. Yanlış pozitif de bir hatadır — sürekli alarm veren kapı,
kapatılan kapıdır.

## D-95 — Karar ile yazma arasına UYGULAMA katmanı kondu
2026-08-15 · İkinci doğrulama turu yedi blokaj buldu ve ortak kök nedeni gösterdi:
**karar (plan/defter/onay) ile yazma (`propose`) arasında hiçbir zorlama yoktu.**
Plan "dokunulmayan alanlar" diye rapor ediyor, `apply` tam o alanları yazıyordu;
defter yalnız bir rapordu — ve rapor kural değildir.
Tek bütün olarak düzeltildi (agent'ın uyarısı: ayrı ayrı yamalanırsa dördüncü tur gerekir):
1. `apply` `suppressedFields`i uyguluyor; iç içe RFC 6901 pointer'lar da kaldırılıyor.
2. `write.ts`te `zone` yoksa **İNSAN** sayılıyor — fail-safe. Önceki `=== 'human'`
   kontrolü, alanı olmayan kaydı iki korumadan da muaf tutuyordu.
3. **Onaylanmış kayıt agent tarafından EZİLEMEZ** (`would_overwrite_approved`). Motor
   `status: active` bir kaydı yeniden önerdiğinde `approved_by/at` siliniyordu —
   "bunu ne zaman kabul ettim" sorusunun cevabı yok oluyordu. R-14'ün kendisi.
4. `scanCorpus` doğdu: `plan` mevcut kayıtları CORPUS'tan tarıyor. Önceden argümanla
   besleniyordu ve "ikinci koşu 0 op" kanıtı ancak elle yazılmış JSON ile üretilebiliyordu.
   Artık yedi gerçek kaydın imzasıyla `DEĞİŞİKLİK YOK — 7 kayıt imzası aynı`.
5. `contentSignature` ile `digest` ayrıldı: ilki DOSYA İÇERİĞİNİN, ikincisi KOŞU
   GİRDİLERİNİN özeti. `e.signature === c.digest` iki farklı değer uzayını
   karşılaştırıyordu ve gerçek corpus'ta asla eşleşmezdi.
6. FAZ-2.9'un yedi kaydı `signature.ts` doğmadan önce yazılmıştı ve imzasızdı; koruma
   gerçek corpus'ta atıldı. Hepsi imzalandı, içerik değişmedi.

## D-96 — Kapı desenleri büyük/küçük harf duyarsız, yazma ailesi tam
2026-08-15 · İkinci tur beş kaçış daha buldu:
- **Küçük harfli SQL** (`select … from record`) `retrieval-yuklemi`ni TAMAMEN atlatıyordu:
  `new RegExp(desen, 'gm')` — `i` bayrağı yoktu. Kapının en pahalı sessiz hataya karşı
  tek savunması, harf büyüklüğüne bağlıydı.
- `corpus-yazici` yalnız `writeFileSync` ailesine bakıyordu; `copyFileSync`,
  `fs/promises.appendFile`, `openSync+writeSync`, `cpSync`, `renameSync` geçiyordu.
Desen artık yazma ailesinin tamamını kapsıyor ve `neden` alanı sınırı dürüstçe yazıyor.

## D-97 — `era` kapısı manifesti GERÇEKTEN doğruluyor
2026-08-15 · Kapı yalnız `existsSync` bakıyordu: çöp YAML ve BOŞ dosya yeşil geçiyordu.
`validateEra` yazılmıştı ama **çağrılmıyordu** — D-69'un ölü kod deseninin aynısı,
üçüncü kez. Artık manifest ayrıştırılıyor, doğrulanıyor ve dizin adı ile manifest
slug'ının uyuştuğu kontrol ediliyor.

## D-98 — FAZ 2 kapandı: iki tur, 23 bulgu, üçüncü tur YOK
2026-08-15 · İki doğrulama turu (D-79 tavanı) toplam **23 bulgu** verdi: 1. tur 5
blokaj + 5 ikincil, 2. tur 7 blokaj + 6 ikincil. Hepsi kapatıldı.
**Faz kapanıyor**, tek istisna `2.9` (yedi corpus kaydı insan onayı bekliyor, D-83).
Üçüncü tur AÇILMIYOR: ikinci turda bulunmayan şey tanımı gereği minor'dur ve FAZ 9'un
denetim turlarına düşer (9.2 kural uyumu, 9.5 ölü kod).
**Çıkış kriterlerinin üçü de GERÇEK corpus ile kanıtlandı** — ilk turda ikisi yalnız
fixture ile gösterilebiliyordu:
1. `plan` corpus'u tarayıp yedi gerçek kaydın imzasıyla `0 op` üretiyor.
2. Emekli kayıt retrieval'a düşmüyor (`:as_of` ile geri getirilebiliyor).
3. Elle düzeltilmiş gerçek kayıt `signature_broken` ile reddediliyor.
**FAZ 9'a devredilenler:** `valid_at`in imza dışı olmasının UI'dan elle düzenleme
gelince yeniden değerlendirilmesi (FAZ-4.3), `x_signature` satırını silmenin korumayı
kapatması (belgeli tasarım kararı, ama tek `sed` ile geçersizleştirilebiliyor).

## D-99 — İçe aktarıcı tanımlayıcının YARISINI üretir, tamamını değil
2026-08-15 · V-04 kapandı: fal'ın endpoint başına OpenAPI'si kimlik doğrulamasız 200
dönüyor ve gerçek şema fixture olarak repoda. Ama asıl karar şu: **OpenAPI fiyat
taşımaz.** Şekli söyler (alanlar, enum'lar), değeri söylemez (fiyat, kalite, gecikme,
şerit). Bu yüzden `importOpenApi` çıktısı **daima** `adapter: pending · enabled: false ·
lanes: []` ve o hâliyle `parseDescriptor`'dan **geçmez** — test bunu tersinden doğruluyor.
Alternatif (içe aktarılanı otomatik geçerli saymak) reddedildi: fiyatı doğrulanmamış bir
sağlayıcı aday listesine girerdi ve §8.3'ün "tahmin dürüsttür" iddiası ilk içe aktarmada
çökerdi. Geri alma maliyeti: düşük — kural tek fonksiyonda.
**Elle yazma yedeği birinci sınıf:** fal yarın bu URL'i kapatsa sistem çalışmaya devam
eder, yalnız ilk taslak elle yazılır.

## D-100 — Kapı `ADAPTERS`'a değil `adapterById`'ye sorar
2026-08-15 · `providers` kapısı ham `ADAPTERS` listesini barrel'dan istedi; `chokepoints`
reddetti. Doğru tepki barrel'ı açmak değil, **sorunun kendisini düzeltmekti**: kapının
ihtiyacı "bu id bir adaptöre çözülüyor mu" ve `adapterById` tam olarak o soruyu meşru
yoldan cevaplıyor. Ham liste `registry.ts`'te kilitli kaldı.
**Ders (üçüncü kez):** darboğaz kapısı bir engel değil, tasarım geri bildirimi. İki kez
"kancayı kapatmak yerine kapıyı öğren" dedik; bu üçüncüsü.

## D-101 — Maliyet formülü QuickJS'te değil, kapalı bir dilbilgisinde
2026-08-15 · §8.2 "QuickJS, 10 ms deadline" diyordu. Gerçek formüller
`0.025 * num_images` mertebesinde; bunun için bir WASM JS motoru taşımak çözdüğünden
büyük bir yüzey getirir. Yerine ~180 satırlık **kapalı aritmetik dilbilgisi**: sayı,
tanımlayıcı, `+ - * /`, parantez, `min/max/ceil/floor`.
**Neden daha güvenli, sadece daha küçük değil:**
1. Döngü **dilbilgisinde yok** → sonsuz döngü imkânsız → deadline'a gerek yok. Deadline
   gerektiren tasarım, deadline'ın kaçırılabileceğini kabul eder.
2. `fetch`/`require`/`process`/prototip zinciri QuickJS'te "verilmediği için" yoktu;
   burada **söylenemedikleri için** yok. Test 8 kaçış denemesini reddediyor.
3. Tanımsız değişken **hata**dır. JS'te `steps * fiyat` yanlış anahtarla `NaN` verir,
   `NaN` 0 mikro'ya yuvarlanır ve **ücretli çağrı bedava görünür**.
4. Float yok (R-41): sabit nokta `bigint`, ölçek 10^12, tek yuvarlama en sonda ve
   **yukarı** — az göstermek tavanı sessizce deler.
Alternatif (bağımlılık ekleyip QuickJS kurmak) reddedildi: "40 satır yazmak bir
bağımlılıktan iyidir". ANAYASA §8.2 ve §14 güncellendi — sessiz sapma yok.
Geri alma maliyeti: düşük, `evaluateFormula` tek arayüz.

## D-102 — Kaybedenler manifestte DEĞİL, ekranda DA
2026-08-15 · §8.2 aşama 5 kaybedenleri manifest'e yazmayı söylüyor. `just plan` artık
onları **ekrana da basıyor**: `elendi claude-code: adım tavanını aşıyor: $0.0625 > $0.0100`.
Yalnız manifeste yazmak, "neden bu model" sorusunu hiç açılmayan bir dosyanın arkasına
saklamak olurdu. Aynı turda `max_cost_usd_micros` de dekoratif olmaktan çıkıp gerçekten
uygulandı — dekoratif bir tavan, olmayan tavandan kötüdür: var sanılır.

## D-103 — Yarıda kalan iş üç farklı gerçektir, biri değil
2026-08-15 · Defterde bir kayıt bulunca motor onu "bitmiş" sayıyordu. Bu, `possibly-charged`
bir kaydı $0.00 maliyetle **başarılı** gösteriyordu — üretilmemiş bir varlığı üretilmiş
saymanın en sessiz yolu. Artık üç dal var:
- **kapanmış** (`charged`/`unreported`/`not-charged`) → çağrı atlanır, tutar defterden
- **yarım + tutamak var** → sağlayıcıya SORULUR (`start()` çağrılmaz), iş devam eder
- **yarım + tutamak yok** → `NEEDS_RECONCILIATION`. Tahmin etmek yasak: "uçmadı" dersek
  çift ödeme, "uçtu" dersek hayalet varlık.
Bunu yazarken **aynı deliğin retry döngüsünde de olduğu** ortaya çıktı: `resumeExternalId`
döngü öncesi bir kez hesaplanıyordu, yani 2. deneme sağlayıcıda İKİNCİ bir iş açıyordu.
`noteHandle` artık tutamağı döngü değişkenine de yazıyor. Test `start()` çağrı sayısını
sayıyor — "çift ücret yok" iddiası ancak sayılabilir bir şeyle kanıtlanır.
Üçüncü bulgu: başarısızlık yolundaki `settle` tutamağı `null`'a çekiyordu — mutabakat için
özellikle yazdığımız tutamağı, tam ona ihtiyaç duyulan anda siliyordu.

## D-104 — Sözleşme testi adaptör başına değil, KATALOG başına
2026-08-15 · `provider-contract.test.ts` `describe.each(ADAPTERS)` ile koşuyor: yeni bir
adaptör eklendiği gün, kimse test yazmasa bile sözleşme ona da soruluyor. Adaptör başına
elle yazılan testler her zaman **sonuncuyu** atlar.
İki incelik ihlal testinden çıktı:
1. `estimate()`in senkronluğu **çalışma zamanında** da kontrol ediliyor: tip seviyesindeki
   koruma `as unknown as` ile bastırılabiliyor, `expect(t).not.toBeInstanceOf(Promise)`
   bastırılamıyor.
2. Ağ yasağı iki katmanlı: `onUnhandledRequest: 'error'` **yetmedi** — `fetch(...).catch(()
   => undefined)` yazan sahte bir adaptör sessizce geçti. `request:start` sayacı eklendi;
   **denemenin kendisi ihlaldir**, reddin yakalanıp yakalanmaması adaptörün insafına
   bırakılamaz.
Ayrıca `describe.each([])` hiç test üretmeden YEŞİL raporladığı için katalogun boş
olmadığı ayrıca iddia ediliyor.

## D-105 — Hız sınırı çağrının ÖNÜNDE, arkasında değil
2026-08-15 · Token kovası (`RateLimiter`), anahtar `(providerId, capability)`. 429 alıp
yeniden denemek de mümkündü ama bazı sağlayıcılar reddedilen isteği de sayar ve arka
arkaya 429'da hesabı geçici kilitler. Saat **dışarıdan** gelir, `setInterval` yok: bir
zamanlayıcı süreç uyuduğunda sessizce kayar, kova ise her çağrıda saate sorar.
Reddedilen istek de `lastMs`i günceller — güncellemeseydi ilk 429 kalıcı bir kilit olurdu
(test bunu ayrıca sınıyor). `LOCAL_RATE_LIMIT` kodu sağlayıcının 429'undan AYRI: ikisini
aynı koda toplamak "sağlayıcı mı kısıtlıyor biz mi" sorusunu log'dan cevaplanamaz yapardı.

## D-106 — R-20 iki parçalıdır: ek eklemek YETMEZ
2026-08-15 · "Her prompt'a 'no text' ekle" tek başına bir yarım kural. `üstünde FİRE
yazan tabela` isteyen bir prompt'a bu eki eklemek modele **çelişki** gönderir ve
çelişkide model genellikle ilk isteği dinler — kapı yeşil, çıktı bozuk. Bu yüzden
`buildImagePrompt` metin İSTEYEN prompt'u reddediyor.
**Türkçe eklemeli yapı desen tasarımını değiştirdi:** `\bharf(ler|li)?\b` "harfler"i
yakalıyordu ama "harflerle"yi kaçırıyordu. Sonlu bir ek listesi her zaman bir sonraki
eki kaçırır. Türkçe desenler **gövde ön eki** (`\bharf\w*`) oldu. Tek istisna
`yazi(?!lim)`: "yazılım çözümleri" bu şirketin kendi sözlüğü ve yanlış pozitif de bir
hatadır.
Üç savunma katmanı: (1) kurucu reddi, (2) `assertNoTextSuffix` `start()` sınırında,
(3) `lexicon` kapısı pipeline kısıtlarında (`no_text: false`, `overlay_text`).

## D-107 — Sözleşme testi girdiyi `supports`tan KURUYOR
2026-08-15 · İki görsel adaptörü eklenince sözleşme testi kendiliğinden onlara da
uygulandı (D-104) ve ikisinde de düştü: test elle `constraints: {}` veriyordu, görsel
adaptörleri `aspect` istiyordu. Elle kısıt yazmak yerine test artık kısıtları adaptörün
KENDİ `supports` beyanından kuruyor — her anahtarın ilk değeri.
Bu, sözleşmeye sessizce bir madde ekledi: **`supports` eyleme dönüştürülebilir olmak
zorunda.** Yönlendiricinin yaptığı da tam bu. Test elle kısıt yazsaydı, `supports`u
eksik yazan bir adaptör testte geçer ama yönlendiricide elenirdi — ve bu ancak üretim
anında fark edilirdi.

## D-108 — `NO_TEXT_SUFFIX` barrel'dan dışa AÇILMIYOR
2026-08-15 · Dışarıdan ihtiyaç duyulan şey kurucudur (`buildImagePrompt`), ham ek
değil. Sabiti paket sınırından dağıtmak, onu ikinci bir yerde birleştirmeyi
kolaylaştırır — `gorsel-prompt-kurucu` darboğazının önlediği şey tam bu. Darboğaz
zaten yakalardı; ama bir kuralı hem kapıyla hem API şekliyle zorlamak, kapının bir gün
gevşetilmesine karşı ikinci hat.

## D-109 — ΔE2000 kendimiz yazıldı, `culori` eklenmedi
2026-08-15 · İhtiyaç iki fonksiyon (sRGB→Lab, ΔE2000); `culori`nin getirdiği yüzey
onlarca renk uzayı, ayrıştırıcı ve interpolasyon. Formüller yayınlanmış, sabit ve otuz
yıldır değişmiyor — "40 satır yazmak bir bağımlılıktan iyidir".
**Doğruluk bağımsız kaynakla kanıtlandı:** Sharma, Wu & Dalal (2005) makalesinin 21
referans çifti, 4 ondalık hassasiyetle geçiyor. Kendi matematiğine kendi beklentini
yazmak hiçbir şey kanıtlamaz: yanlış bir formül, ondan türetilmiş beklentiyi her zaman
karşılar.
ΔE76 (Öklid) **reddedildi**: mavi bölgede algıyla ciddi ayrışıyor ve marka paleti mavi
ağırlıklı (`#0091FF`) — ΔE76 gözle ayırt edilebilir iki maviyi "aynı" sayar ve QA kapısı
boş geçerdi.

## D-110 — Piksel Chromium'dan okunuyor; metin kaplaması OCR'sız
2026-08-15 · İki bağımlılık daha eklenmedi:
1. **sharp/jimp yok.** Chromium zaten var, zaten tek başlatıcıdan geçiyor ve `<canvas>`
   piksel erişimini standart veriyor. İkinci bir PNG çözücü = ikinci bir renk profili
   yorumu = farklı ΔE, ve hangisinin doğru olduğu ancak gözle anlaşılır.
2. **Tesseract yok.** OCR'ın yapacağı iş "bu görselde nerede metin var" sorusunu tahmin
   etmek; oysa metni BİZ yerleştiriyoruz ve yerini kesin biliyoruz (§7.1). Bildiğimiz bir
   şeyi %90 doğrulukla yeniden keşfetmek olurdu. OCR'ın gerçek işi modelin ürettiği metni
   yakalamak — ama R-20 zaten onu yasaklıyor.
**Örnekleme ızgara, rastgele değil:** rastgele örnekleme aynı görselde iki farklı QA
sonucu üretir ve manifest'e yazılan sayı tekrar üretilemez olur (§13).
Ayrıca `getImageData` piksel başına değil TEK seferde çağrılıyor — 2000 örnekte
piksel başına çağrı saniyeler sürüyor ve render zaman aşımını tetikliyordu.

## D-111 — Ölçülemeyen metrik rapora GİRMEZ, sıfır olarak da girmez
2026-08-15 · Palet tanımlı değilse ΔE `0,0` yazmak "mükemmel uyum" göstermek demektir
ve tam da hiçbir şey ölçülmediği anda kapı yeşil yanar. `pixelStats` boş palette `null`
dönüyor, `measure` o okumayı rapora hiç koymuyor. Aynı ilke `nearestDeltaE` ve
`parseHex`te de var: geçersiz hex `null`, siyah değil — siyaha düşseydi bozuk bir token
paletle "mükemmel uyumlu" bir siyah olurdu.
**Uyarı eşiği limitten ayrı** tutuldu: yalnız limit olsaydı sistem geçti/kaldı ikilisine
düşer ve limite doğru SÜRÜKLENME görünmezdi — tek tek hiçbir varlığın düşmediği ama
ortalamanın kenara yaslandığı durum, markanın yavaşça bozulduğu durumdur.

## D-112 — Lexicon linter, corpus'a bağlandığı gün 11 YANLIŞ POZİTİF verdi
2026-08-15 · Linter yazıldı, testleri geçti, `lexicon` kapısına bağlandı — ve gerçek
corpus'ta 11 ihlal raporladı. **Hepsi yanlış pozitifti** ve üçü ayrı bir ders:
1. **Tırnak içi alıntı iddia değildir.** `eski sitedeki "1.247 İlan"` cümlesi o sayıyı
   REDDEDİYOR, öne sürmüyor. Alıntıyı iddia saymak, kuralı ANLATAN belgeyi kuralın
   ihlali sayardı — ve o kapı ilk gün kapatılırdı.
2. **Aralık tariftir.** `50-500 çalışanlı tesisler` bir firmografi, bir performans
   iddiası değil.
3. **Çıplak küçük sayı iddia değildir.** `confidence 0.55` bir parametre. Eşik 100:
   birimi/yüzdesi olan sayı her zaman iddiadır, çıplak sayı ancak büyükse.
Bilinen ödünleşme: gerçek bir iddiayı tırnağa alarak kaçırmak mümkün. Alternatifi
dokümantasyonu imkânsız kılan bir linter — kabul edildi ve yazıldı.
**Asıl ders:** kapıyı sadece sentetik testle değil GERÇEK veriyle koşturmak zorunlu.
Testlerim 20/20 yeşildi ve linter kullanılamaz durumdaydı.

## D-113 — "Palet tanımsız" ile "palette hex yok" AYRI durumlar
2026-08-15 · `allowedHex: []` başlangıçta "denetimi atla" demekti. Marka token'ları
OKLCH olduğu için (§12.1) hex çıkarımı hep boş dönüyordu — yani hex denetimi **hiç
çalışmıyordu** ve kapı bunu yeşil raporluyordu.
Üç durum ayrıldı: `null` palet tanımsız (atla) · `[]` palet tanımlı, hex içermiyor
(HER hex token dışı) · dolu liste (yalnız listedekiler).
OKLCH bir palette yazılmış her hex, tanımı gereği token dışıdır. İkisini karıştırmak,
denetimi tam da en çok gerektiği yerde kapatıyordu — bu segmentte üçüncü kez görülen
desen: **kod yazıldı ama hiç çalışmadı.**

## D-114 — `turkish-case` kapısı dize İÇERİĞİNİ tarıyordu
2026-08-15 · Lexicon linter'ının hata mesajı `'i'.toUpperCase() → 'I'` yazıyor —
kullanıcıya sorunu ANLATIYOR, bir çağrı yapmıyor. Kapı onu ihlal saydı.
Kapı zaten yorumları düşürüyordu; dize içerikleri de düşürüldü. **Ama şablon
dizelerindeki `${...}` blokları KORUNUYOR**: `` `${x.toUpperCase()}` `` gerçek bir
çağrıdır ve maskelenirse kural sessizce ölür.
**İlk yazımım tam bunu yaptı:** `derinlik` 0'dan başlayan bir `do-while`, `${`yi
görünce ilk karakterde çıkıyor ve bloğu maskeliyordu. İhlal testi (R-71) yakaladı —
kapı yeşil raporluyordu ve gerçek bir `.toUpperCase()` sessizce geçmişti.
Dört vaka ayrı ayrı sınandı: çıplak çağrı · şablon içi çağrı · iç içe şablon içi
çağrı · mesaj dizesi. Dördü de doğru davranıyor.

## D-115 — ExifTool yerine kendi PNG chunk yazıcımız
2026-08-15 · ExifTool kurulu değil ve kurmak, gözetimsiz bir çalıştırmada var olduğu
VARSAYILAN bir sistem ikilisi demek — "bir ay ihmal edilse de çalışır" (§16) vaadiyle
bağdaşmıyor. PNG chunk formatı otuz yıldır sabit; ihtiyacımız olan kısmı ~60 satır
(uzunluk · tip · veri · CRC32) ve `node:zlib` zaten yerleşik.
**`iTXt` seçildi, `tEXt` değil:** `tEXt` Latin-1 taşır ve `ğüşıöç` içeren bir damgayı
sessizce bozar — tam da bu projenin her yerde kaçındığı hata modu. Kapının öz-testi
her koşuda `ĞÜŞİÖÇ ğüşıöç` turu atıyor; `latin1`e çevirince kırmızıya dönüyor.
**CRC doğruluğu Chromium'la sınandı**, kendi okuyucumuzla değil: kendi okuyucumuz aynı
yanlışı iki kez yapabilirdi. Damgalı PNG hâlâ çözülüyor, IHDR yerinde, IEND son chunk.

## D-116 — Sabit probe listesi KODUN DIŞINDA yaşar
2026-08-15 · `containsSyntheticPerson` bir bayrak değil bir **tür**: `false` literali,
`true` yazan bir iddia DERLENMEZ. Ve tek yapıcı bir `basis` istiyor — dayanağı kayda
geçmeyen iddia kurulamaz. Üç dayanak: prompt taraması · gerçek fotoğraf · insan onayı.
**Asıl ders ihlal testinden geldi, iki kez:**
1. Kapının öz-testi TEK bir prompt kullanıyordu. `müşteri` desenini sildim — `gülümse`
   deseni aynı prompt'u yakaladı ve kapı YEŞİL kaldı. Yani desenlerin çoğu silinebilir
   ve kapı hiçbir şey söylemezdi. Her desene kendi `probe`'u eklendi.
2. Probe listesi desen listesinden TÜRETİLİYORDU — desen silinince probe'u da siliniyor
   ve kapı yine yeşil kalıyordu. Liste `packages/render/person-probes.json`'a
   **sabitlendi**: kodun dışında, `verbs.json` ile aynı mantık (R-02).
Artık iki yönde de kırmızı: desen silmek "sabit probe KODDA YOK" veriyor, desen eklemek
"person-probes.json'a eklenmemiş" veriyor. Desen listesini değiştirmek artık bir KARAR.

## D-117 — Blob deposu: dedup EDER ama ilk çalıştırmayı EZMEZ
2026-08-15 · `derived/blobs/<ab>/<sha256>.<ext>` + `<sha256>.png.meta.json` sidecar.
Aynı byte iki kez saklanmıyor — ama sidecar da **ezilmiyor**: ilk üretimin
`sourceRunId`'si korunuyor. Ezseydik "bu byte'ı hangi çalıştırma üretti" sorusu son
çalıştırmayı gösterirdi ve maliyet defteriyle (§13) çelişirdi — **para ilk üretimde
harcandı.**
`rename` tercih edildi (`copy` yedek): yarım yazılmış bir blob, içerik-adresli deponun
tek yasasını (adres = içerik) çiğner.
**`verifyBlob` kapıya BAĞLANDI** — `compliance` kapısı her blob için içeriğin kendi
adresiyle uyuştuğunu ve sidecar'ın var olduğunu doğruluyor. Bağlanmasaydı bu segmentte
üç kez görülen "kod yazıldı ama hiç çalışmadı" deseninin dördüncüsü olacaktı.
Gerçek bir blob uçtan uca sınandı: depoya alındı, damgalandı, sonra içeriği bozuldu
(`içerik adresle UYUŞMUYOR`) ve sidecar'ı silindi (`sidecar YOK`) — ikisi de kırmızı.

## D-118 — Blob deposu `engine`'de, `corpus`ta değil (faz dosyasından SAPMA)
2026-08-15 · FAZ-3.12 dosyası `packages/corpus/src/blobs.ts` diyordu. `corpus-yazici`
darboğazı `packages/corpus/src/**` altındaki HER yazmayı reddetti — ve **haklıydı**:
orada ikinci bir yazma yolu, onay kuyruğunu atlayan bir yoldur (§5.4) ve 2. doğrulama
turunda bu darboğaz beş ayrı yoldan atlatılmıştı.
Üç seçenek vardı:
1. `izinli`ye eklemek → darboğazı gerçekten zayıflatır, ikinci bir corpus yazıcısı yaratır
2. `kapsam_haric`e eklemek → "kural burada anlamsız" demek olurdu; değil, blobs.ts
   pekâlâ corpus'a yazabilirdi
3. **Doğru pakete taşımak** → seçilen
`derived/blobs` bir corpus kaydı değil, bir **çalıştırma çıktısıdır**. Motor zaten
`derived/runs` ile maliyet defterini yazıyor; doğru komşu orası. Faz dosyasındaki yol
düzeltildi — **sessiz sapma yok** (R-74).
**Ders:** darboğaz kapısı bir engel değil, tasarım geri bildirimi. Dördüncü kez.
