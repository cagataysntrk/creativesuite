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

## V-13 — TCMB kuru doğrulanmadı
`registry/rates/tcmb-2026-08-15.json` elle girildi (`usdTry: 41.85`), TCMB XML'inden
doğrulanmadı. TRY yalnız GÖRÜNTÜDE kullanıldığı için (D-36) hesabı etkilemiyor —
ama gösterilen sayı yanlış olabilir ve `doğrulanmamış kur` etiketi bunu söylüyor.
→ FAZ-4.12 (Cost & Budget ekranı)

## V-12 — Aday dönem probe bake-off mekanizması
`brand/probes/` ile birden fazla aday dönemin yan yana karşılaştırılması. §12'nin sert
kuralı gereği **ilk yeniden üretim gerçekten acıtana kadar** kurulmaz. → FAZ-2.8

## D-71 — `spawn.ts` çıktı sınırı parça içinde uygulanmıyordu
2026-08-15 · FAZ-1.12'nin ✅'si "iptal 5 sn içinde alt süreçleri temizliyor" diyordu ama
`packages/kernel/src/proc/spawn.ts` **sıfır testliydi** — kriterin karşılığı yoktu.
Testler yazılınca gerçek bir hata çıktı: `maxOutputBytes` yalnız parça BAŞINDA
denetleniyordu; 50 KB'lık tek bir chunk geldiğinde `stdout.length` hâlâ 0 olduğu için
tamamı yazılıyor ve `truncated` hiç işaretlenmiyordu. Tek parça hâlinde gelen büyük çıktı
bu sistemde tipiktir (ffmpeg log'u, model yanıtı), istisnai değil.
**Düzeltme:** sınır parça içinde de uygulanıyor, kırpma açıkça bildiriliyor.
**On üç test:** çıkış kodu · olmayan komut · stdin · **ortam devralınmıyor** · iptal
(<5 sn ölçüldü) · zaten iptalli sinyal · zaman aşımı · **SIGTERM'i yutan süreç SIGKILL
ile ölüyor** · çıktı sınırı · `commandExists` üç vaka.
**Ders:** kabul kriteri yazılıp testi yazılmayınca kriter bir temenniye dönüşüyor —
ve altındaki kod gerçekten bozuk olabiliyor.

## D-72 — Karar defteri ikiye ayrıldı: aktif + `docs/kararlar/ARSIV-2026.md`
2026-08-15 · `KARARLAR.md` 608 satıra çıktı ve `docs-size` tavanını (600, R-63) aştı.
Tavan keyfî değil: agent'ın her turda okuduğu bir dosya şişerse bağlam yanar ve kimse
okumaz — şişmiş bir defter, olmayan bir defterden kötüdür çünkü okunmadığı hâlde
okunmuş sayılır.
**Karar:** planlama döneminin kapanmış kararları (D-1…D-42, hepsi FAZ 0 ve FAZ 1 boyunca
uygulandı) `docs/kararlar/ARSIV-2026.md`'ye devredildi. Aktif defterde döngü sırasında
alınan kararlar (D-43+) ve tüm açık `V-nn` borçları kaldı. **448 + 176 satır.**
**Arşiv iptal DEĞİLDİR:** oradaki kararlar hâlâ bağlayıcı. Bir kararı geçersiz kılmak
için aktif defterde yeni bir `D-nn` yazılır ve eskisi `**Durum:** reddedildi` alır.
**`citations` kapısı iki dosyayı da çözüyor** ve **çift kaydı reddediyor**: aynı `D-nn`
ikisinde birden bulunursa hangisinin geçerli olduğu belirsizleşir ve arşivlenmiş bir
karar aktif sanılabilir. Reddedilme taraması da her iki dosyayı kapsıyor.

## D-73 — `unsealAttributes` dört belgede vardı, kodda yoktu
2026-08-15 · `packages/contracts/src/envelope.ts`, `docs/ANAYASA.md`, `.claude/rules/kernel.md`
ve `docs/fazlar/FAZ-3.md` `packages/registry/src/attributes.ts#unsealAttributes`'ı
"`attributes`ı açmanın TEK yasal yolu" diye gösteriyordu. **Ne dosya vardı ne darboğaz**
(`grep attributes chokepoints.json` → boş). Yani `OpaqueAttributes` markası bir engel
koyuyordu ama meşru geçiş kapısı hiç yapılmamıştı.
**Karar:** dosya yazıldı ve `attributes-acici` darboğazı eklendi. Açılan attributes
`Object.freeze` ile donduruluyor: okunur, üzerine yazılmaz — yazma tek noktadan
(`corpus/write.ts`) geçer ve oradan geçmeyen değişiklik onay kuyruğunu atlar (§5.4).
**Desen daraltıldı:** ilk yazdığım `as unknown as Record<string, unknown>` masum şema
cast'lerini de yakalıyordu. Aranan şey `attributes`ın markasını sıyırmak; desen ona özgü.
Meşru bir kullanımı yasaklamak, kapıyı gürültüyle kapatılan bir kapı yapar.

## D-74 — `just plan` manşetinde sayı iddia etmiyor
2026-08-15 · FAZ-1.13'ün metni "sağlayıcısı seçilmemiş metered adım için `$0.00` YAZILMAZ"
diyordu; çıktı ise başlıkta `maliyet aralığı: $0.0000 – $0.0000` yazıp uyarıyı ALTINA
koyuyordu. Başlıktaki sayı tam olarak yasaklanan iddiaydı ve göz önce onu okur.
**Karar:** fiyatlanamayan bir tahmin bir sayı değil, bir BOŞLUKTUR. Manşet artık
`FİYATLANAMADI — N ücretli adımın sağlayıcısı seçilmedi` diyor; fiyatlanan kısım varsa
ayrı satırda ve **ALT SINIR** etiketiyle. Manşetin `$0.00` taşımadığını doğrulayan test
eklendi — kural artık metinde değil, testte.

## D-75 — `just reindex` corpus yokken sessizce başarılı dönüyordu
2026-08-15 · `corpus/` hiç yokken `just reindex` "0 kayıt indekslendi" deyip **EXIT=0**
dönüyordu. `walk()` içindeki `catch { return out }` okuma hatasını kökte de yutuyordu.
FAZ-1.6'nın kendi ilkesi "sessiz atlama, aranamayan kayıt demektir" — kök dizin
seviyesinde tam olarak bu oluyordu.
**Karar:** `reindexChecked()` kök dizinin varlığını denetliyor ve yoksa `Result` döndürüyor;
`scripts/reindex.mjs` EXIT=1 ile açık mesaj basıyor. **Alt dizinlerde yutmak meşru kalıyor**
(izin sorunu tek bir dosyayı atlar ve rapor edilir), kökte değil — kök yoksa HİÇBİR şey
indekslenmez ve arama boş dönünce sebebi aranmaz.

## D-76 — Zorlanamayan kabul kriterleri gerçeğe uyduruldu
2026-08-15 · Doğrulama agent'ı üç kriterin **yazıldığı gibi zorlanamadığını** buldu.
Kriteri olduğu gibi bırakıp "karşılandı" saymak kanıtsız tikleme olurdu (R-70); metni
gerçeğe uydurmak ise sessiz sapma (R-74). Doğrusu: **açıkça düzeltmek.**
1. **FAZ-1.9** — "manifest'siz çıktı üretmeyi dene → hata": bugün bir üretim/yayın yolu
   YOK, dolayısıyla `inspectManifest()` yalnız saf fonksiyon olarak sınanabiliyor.
   Üretim yolundaki zorlama **FAZ-3.13**'e bağlandı ve kriter bunu söylüyor.
2. **FAZ-1.10** — "fixture'da gerçek prospect adı ara → yok": bir İSİM düz metindir,
   desenle ayırt edilemez. Zorlanabilir olan (example.com dışı e-posta, TR telefon,
   TCKN/VKN biçimi, `synthetic: true` işareti) zaten denetleniyor ve kriter artık onu
   söylüyor; ad disiplini `SENTETİK` ön ekiyle konvansiyon olarak sürüyor.
3. **`just golden`** — no-op'tu ve "`just verify` yeşil" kriterini zayıf okutuyordu.
   Artık açıkça "hiçbir şey KANITLAMAZ, FAZ-1.10b/V-02'ye bağlı" diyor. Sessiz bir
   `echo` yerine dürüst bir uyarı: yeşil bir çıktının ne kanıtladığı yazılı olmalı.

## D-77 — `attributes` darboğazı özelliğe DOKUNMAYI arıyor, cast'i değil
2026-08-15 · İkinci doğrulama agent'ı deseni **iki satıra bölerek** atlattı:
`const ham = r.attributes` + `const acik = ham as unknown as Record<string, unknown>`
üç kapıdan da (chokepoints, tsc, lint) geçti. Dar desen (`\.attributes\s+as\s+unknown`)
tek satırlık biçimi arıyordu; R-01 "değişmez yasa" listesinde ve zorlanmayan bir yasa
yasa değildir.
**Düzeltme:** desen `\.attributes\b|\bas\s+unknown\s+as\b` oldu — özelliğe dokunmak
zaten ihlal; değeri önce değişkene almak ilk satırda yakalanıyor. Kapıya `kapsam_haric`
alanı eklendi (`izinli`den farklıdır: "tek yetkili yer" değil, "kural burada anlamsız").
Test dosyaları muaf — üretim yoluna import edilmezler.
**Reddedilen alternatif:** ESLint AST kuralı (`TSAsExpression > TSUnknownKeyword`).
Daha güçlü olurdu ama `eslint.config.js` yapılandırma-koruma kancasıyla kilitli ve
kancayı kapatmak, kapıyı kapatmayı öğrenmektir.
**Dürüst sınır:** `const ara: unknown = r.attributes` biçiminde cast HİÇ yoktur —
regex bunu yalnız ilk satırdan yakalar. Genel çözüm regex değil, **Proxy tuzağıdır**
(`purity.test.ts`): çalışma zamanında özelliğe erişen her yol, değeri nasıl elde
ettiğinden bağımsız olarak patlar.

## D-78 — `just reindex` corpus kökü ve db yolu argümanı alıyor
2026-08-15 · D-75 `reindex`i corpus yokken EXIT=1'e çevirdi — doğru karar, ama
**FAZ-1.6'nın kabul komutunu kırdı**: tikli bir adımın ✅'si EXIT=1 veriyordu ve
`corpus/` FAZ-2.9'a kadar doğmuyor. Kriteri gevşetmek (R-70) ya da `reindex`i corpus
yokken yeşil döndürmek (D-75'i geri almak) iki yanlış seçenekti.
**Düzeltme:** `just reindex <kök> <db>` — varsayılanlar aynı, argümanlar isteğe bağlı.
Kabul komutu artık sentetik fixture corpus'una karşı **aynı kod yolunu** koşuyor:
`2 kayıt indekslendi · ~30 ms` + bozuk dosya `id_yok` diye raporlanıyor. D-75'in
koruması argümansız çağrıda aynen duruyor.

## D-79 — Doğrulama agent'ı turu **en fazla iki**
2026-08-15 · Kullanıcı müdahalesi ve haklı: *"sorun bul denince sorun olmayan şeyi bile
sorun gibi getirebilir, çünkü sorun bulmak için bakıyor zaten — 3 tur değil 30 tur bile
olabilir, bu asla bitmez."*
Somut kanıt bu projeden: 1. tur 9 bulgu, 2. tur 3 yeni blokaj + 4 ikincil. Her tur
kapanınca bir sonraki tur **yeni bir yüzey** buluyor; yakınsama yok çünkü agent'ın
görevi yakınsamak değil, bulmak.
**Kural:** bir faz en fazla **iki** doğrulama turu görür. İkinci tur kapandıktan sonra
faz KAPANIR. İkinci turda bulunmayan şey tanımı gereği **minor**'dur ve FAZ 9'un denetim
turlarına düşer — orada zaten sürekli aranıyor (9.2 kural uyumu, 9.5 ölü kod).
**Reddedilen alternatif:** "temiz rapor gelene kadar tur" — LOOP§D'nin ilk hâli buydu ve
sonsuz döngüydü; bir fazın kapanması agent'ın yorulmasına bağlı olamaz.
**Geri alma maliyeti:** sıfır — tavan tek satır, gerekirse artırılır.

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
