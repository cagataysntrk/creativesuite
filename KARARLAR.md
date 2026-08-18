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

## V-06 — `dima` ürün mü modül mü ✅ TAMAMEN KAPANDI (2026-08-16, D-235)
`dima` ayrı marka ekseni olarak modellendi (2026-08-15, D-84). **Pazara sunum adı da
kapandı: onaylı marka — "Dima by Upcytech"** (kurucu, 2026-08-16). Her ürün kendi
adıyla yaşar, Upcytech çatı olarak arkasında durur. → FAZ-2.11 · FAZ-2.9

## V-07 — Era 1'in dikeyi ✅ KAPANDI (2026-08-16, D-235)
Hipotez **otomotiv tedarik/Bursa** idi ve üçüncü taraf verisinden çıkarımdı. Kurucu
doğrulamadı: dikey **imalat**, ama asıl ayrım ekseni sektör değil **veri olgunluğu**.
Bölge iddiası tamamen düştü — uydurulmuş bir coğrafya kaydı, kayıt olmayandan kötüdür.
→ FAZ-2.9

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

## V-27 — OAuth uygulama kaydı yok: gerçek token alınamadı
Akış, kapsam sözleşmesi, CSRF doğrulaması ve ortam sözleşmesi yazıldı ve test edildi
(`oauthEnvDurumu` eksik değişkenleri ADLARIYLA raporluyor). ⚠ **Kalan iş yalnız hesap
kurulumu DEĞİL:** `oauthEnvDurumu` ve `authorizeUrl`ün bugün sıfır üretim çağıranı var —
yetkilendirme akışını koşturan bir komut/uç de yazılacak. Sonra Meta uygulaması
(App Review gerekmiyor, D-3) ve LinkedIn "Share on LinkedIn" kaydı, `sops` altına dört
değişken. → FAZ-7.5b

## V-26 — Meta uygulaması ve token yok: gerçek yayın yapılmadı
Yayın kapıları (token ömrü, alt-text, kota, defter mutabakatı) yazıldı ve **çağrı
sırasıyla** doğrulandı; `PUBLISH` gövdesi yazıldı, üç hatta bağlandı ve defter
bootstrap komutu açıldı (D-224). Ama gerçek bir Meta uygulaması, sayfa bağlantısı ve
uzun ömürlü token **insan eylemidir**. ⚠ **Kalan iş yalnız hesap kurulumu DEĞİL:**
HTTP adaptörü (`upload` + `publishingLimit`) de yazılacak. App Review gerekmiyor
(D-3). → FAZ-7.2b

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

> **D-252 · D-253 · D-254 arşive devredildi** → `docs/kararlar/ARSIV-2026.md`.
> Üçü de kapandı ve kodda yaşıyor: gömülü marka fontu (`brand/*/fonts`), yüzey kapsamlı
> chroma tavanı (`tasarim-olcum.ts`), karosel grameri (`sablon.ts`). R-63 gereği tavan
> dolmadan devredildi — bir kararı arşive taşımak onu iptal etmez, atıfları çalışmaya
> devam eder.

> **D-255 · D-256 · D-257 · D-258 arşive taşındı** → `docs/kararlar/ARSIV-2026.md`.
> Kapanmış kararlar; atıf bütünlüğü korunuyor (R-62), tavan açıldı (R-63).

## D-281

**Karar:** Görsel çağrısı yuva sırasından türeyen bir `seed` taşıyor (`7919 × sıra`,
yalnız `raw` telli modelde). Rehber §10 ölçütleri `katalog-kabul.test.ts` ile bağlandı;
`sahne`/`donen`/`editoryal` hayaletleri dolduruldu, `donen` daireleri kesimi artık
gerçekten aşıyor ve kartlarının üstüne doku (`ustDoku`) geldi.

**Neden — tohum:** İKİ gerçek koşuda da dört ayrı görsel çağrısı BİREBİR AYNI kadrajı
döndürdü. Önce kadraj tarifi brief istemine kondu (D-280), yetmedi; sonra doğrudan
görsel istemine eklendi, yine yetmedi. Sebep sağlayıcıda: tohum gönderilmediğinde
Cloudflare sabit bir varsayılan kullanıyor ve yakın istemler aynı görüntüye çöküyor.
**İstemi güçlendirmek bir rica, tohum bir garanti** — bu deponun tekrar eden dersi.
Determinizm bozulmuyor (R-06): tohum yuva sırasının saf fonksiyonu.

⚠ `seed` YALNIZ `stable-diffusion-xl-lightning` (`raw` tel) gövdesine giriyor;
`flux-1-schnell` fazladan alan görünce isteği tümden reddediyor — ölçülmüş davranış.

**Neden — kabul testi:** rehber §10'un altı ölçütü yazılıydı ama hiçbir şeye bağlı
değildi, yani bir NİYET beyanıydı. Bağlanır bağlanmaz kataloğda **beş gerçek boşluk**
buldu: üç şablonda hayalet boştu (dolu taslak kuralının ihlali), `donen`in daireleri
kesime değiyor ama geçmiyordu (süreklilik taklidi) ve `donen`in zemini tek katmanlıydı.

⚠ ⚠ **REHBERİN ATIF YAPTIĞI ÜÇ FONKSİYON BU BELGEYE UYMUYOR.** `tasarimOlc`,
`olcekDisiBosluklar`, `kompozisyonMerkezi` — üçü de `DocumentModel` alıyor, yani
slayt-başına yolun araçları. Ölçütler panorama VERİSİNDEN yeniden hesaplandı.

⚠ ⚠ **ÖLÇÜM ARACI ÜÇ KEZ BOZUK ÇIKTI:** (1) hayalet puntosunu `baslikPayi` ile çarpan
uydurma formül `donen`i 5,9'da gösterip gerçek eksiği (hayaletin HİÇ olmaması)
maskeledi; (2) zemin ölçümü yalnız `zeminDokusu`ya bakıp `alanSiniri` ve tam kaplama
fotoğrafı görmedi, üç şablonu haksız kırmızıya düşürdü; (3) sağlayıcı testi kaynağı
iki kez geçen bir dizeden dilimledi. Ayrıca `URL.pathname` "İndirilenler"i yüzde-kodladı
— Türkçe yol bu depoda kenar durum değil, VARSAYILAN durum.

⚠ `ustDoku` gerekliydi çünkü `donen`in opak kart renkleri panorama zeminini tamamen
örtüyor. Gren fiziksel olarak da üstte olmalı: film greni sahnenin değil filmin özelliği.

**Geri alma maliyeti:** düşük — bir kısıt, bir opsiyonel alan, bir test dosyası.

## D-282

**Karar:** Üçüncü yüz ailesi (**Caveat**, OFL, el yazısı) kataloğa GİRECEK ama bu turda
GİRMEDİ: `tasarim` kapısının "en çok 2 font ailesi" sınırını deliyor ve **R-76 kırmızı
bir kapının kuralını aynı turda gevşetmeyi yasaklıyor.** Sınır 2 → 3'e ayrı bir turda,
`refactor(gates)` tipli ayrı bir commit'le çıkarılacak; ardından yüz geri eklenecek.

**Neden gerekli:** Referansta (`image copy 2`) kapağın kontrastı punto farkından değil
**YÜZ FARKINDAN** geliyor — ilk kelime el yazısı, kalanı ağır condensed. Tek display
ailesiyle bu kurulamıyor ve elle taklidi yasak (R-81: jenerik öge kodlanmaz; bir yazı
karakteri bunun en uç örneği).

**Bu turda ölçülenler (iş boşa gitmedi):**
- Caveat'in Türkçe kapsaması **çizdirilerek** doğrulandı: `ı İ ğ ö ü ş` render edildi ve
  BAKILDI. Bir fontun "latin-ext" demesi Türkçe'nin tamamını taşıdığı anlamına gelmiyor.
- Altı şablonun kapağında denendi ve çalıştı; dosyalar `brand/brd_upcytech/fonts/`
  altında duruyor (kullanılmıyor, bir sonraki turda bağlanacak).
- ⚠ İlk örnek metinler başlığı TEKRAR ediyordu ("Altı yılda" / "Altı yılda iki katına…")
  ve render'a bakınca tek cümlenin iki kez yazılması gibi okundu. Referansta iki satır
  AYRI şey söylüyor: el yazısı kim konuşuyor, condensed ne söylüyor.

⚠ ⚠ **`YUZLER` kapalı bir liste ve "üçüncü aile bir KARAR gerektirir, bir import değil"
diye yazıyordu — doğruydu, ama kararın BEDELİ bir kapıymış.** Kapalı listeyi okumak
kapıyı okumak değil; iki yerde yaşayan bir sınır, bir yerde görülüp öteki yerde
görülmeyebiliyor.

**Bedel:** +104 KB font (base64 gömülü, iki alt küme). Ağ çağrısı yok.

## D-283

**Karar:** `image.matte` girdilerini `needs` ile daraltıyor. Dört özdeş fotoğrafın kök
sebebi buydu — üç gerçek koşu boyunca görünen kusur, üç yanlış teşhisten sonra bulundu.

**Kök sebep:** `run.ts` her adıma `inputs: ciktilar` geçiyor — o ana kadarki BÜTÜN
çıktıları. Daraltmayı `needs`i okuyan gövde yapmak zorunda. `uretilenGorseller(...)[0]`
ise listenin ilkini alıyordu: dört kırpma adımının DÖRDÜ DE 1. görseli kırptı. Kırpılmış
olan öbek içinde hamı EZDİĞİ için dört yuvanın dördüne aynı figür girdi. Şablon dört
görsel sipariş etti, sağlayıcı dördünü de üretti, üçü çöpe gitti.

⚠ ⚠ **HATA BİR YORUM SATIRIYDI.** Kodun yanında *"İLKİNİ almak doğru, çünkü `needs`
girdiyi zaten DARALTIYOR (D-246)"* yazıyordu. D-246 gerçekten böyle bir ders içeriyor —
ama o ders İSTEM KURUCUSU için: `promptTuret` `input.needs` üzerinde döner, `inputs`
üzerinde değil. Doğru bir dersin YANLIŞ yere uygulanması, dersin hiç olmamasından daha
tehlikeli: yorum, doğrulamayı gereksiz gösteriyor.

**Üç yanlış teşhis, sırayla:**
1. *"Kadraj tarifi brief isteminde eksik"* → eklendi (D-280), değişmedi.
2. *"Metin modeli tarifi düzlüyor"* → tarif doğrudan görsel istemine kondu, değişmedi.
3. *"Sağlayıcı tohumsuz çağrıda sabit varsayılan kullanıyor"* → tohum eklendi (D-281),
   değişmedi.

**Teşhisi getiren şey sağlayıcıyı DOĞRUDAN sınamak oldu:** aynı isteme üç çağrı —
`seed 7919`, `seed 15838`, tohumsuz — ÜÇ FARKLI görsel döndürdü (98.633 · 84.896 ·
94.379 bayt, üç ayrı özet). Sağlayıcı suçsuzdu, dolayısıyla çökme bizdeydi. **Zincirin
bir ucunu sabitlemeden ortasını tahmin etmek üç turumu aldı.**

⚠ D-280 ve D-281 geçersiz DEĞİL: varyant kadrajı ayrıştırıyor, tohum tekrarlanabilirliği
garantiliyor. Ama ikisi de kusuru gideremezdi — hepsi kırpma adımında birleşiyordu.

**Geri alma maliyeti:** düşük — bir opsiyonel parametre, iki çağrı yeri.

## D-284

**Karar:** Marka işareti karosele girdi (alt rayın solunda, sürümü ZEMİN seçiyor);
logo dosyaları `brand/brd_upcytech/logo/` altında ve alfa kutusundan kırpıldı; marka
mavisi tokeni logodan YENİDEN ölçülüp düzeltildi; hayalet puntosu uzunluğa göre
ölçekleniyor.

**Kanıt — A8 zinciri gerçekten çalışıyor:** dördüncü koşu (`Uretim hattinda kalite
kontrol duraklari`) dört FARKLI figür üretti: koyu tulum + tablet · turuncu yelek +
rulo çizim · beyaz önlük + pano · beyaz önlük, ayrı poz. Üç koşu boyunca dört özdeş
fotoğraf veren kusur (D-283) kapandı ve şablon referansın yapısına oturdu.

**Logo — sürümü zemin seçiyor, şablon değil.** Mavi sürüm mavi işaret + BEYAZ kelime
taşıyor: açık zeminde kelime kaybolur. Siyah sürüm koyu zeminde kaybolur. `koyuMu()`
zaten kartın zeminini ölçüyor; ikinci bir karar noktası açmak o ölçümü yok saymak olurdu.

⚠ ⚠ **KAYNAK PNG'LER 500×500'DÜ ve işaret yalnız %2,4'ünü kaplıyordu.** Rayda 24px'e
sığdırılınca işaret ~4px kalıyor ve OKUNMUYORDU — render'a bakınca görüldü. Dosyalar
alfa kutusundan kırpıldı (338×78); kaynaklar `*-kaynak.png` olarak duruyor (Yasa 10).
⚠ İki sürüm **ORTAK** kutuyla kırpıldı: ayrı kutular farklı oran verir ve zemin
değişince logo bir slayttan ötekine ZIPLAR.

⚠ `sahne`nin `rayaSol` metni 'UPCYTECH'ti; logo zaten onu söylüyor. Aynı bilgiyi iki kez
basmak imzayı zayıflatıyor — 'SAHA' oldu.

⚠ ⚠ **TOKEN "BİREBİR" DİYORDU AMA DEĞİLDİ.** `mavi-500` `#0090fc`ten türetilmişti; asıl
dosyanın alfası >40 olan tek mavisi **`#0091ff`** = `oklch(0.6515 0.192 251.5)`. İlk
ölçüm kenar yumuşatmalı bir pikselden alınmış. Rampanın 200/600/800 kademeleri aynı
oranla taşındı. "Birebir" iddiası taşıyan bir değer yaklaşık olamaz.

⚠ **Hayalet puntosu artık uzunluğa göre.** Sözleşme "kısa: rakam/sembol" diyor ama bu
bir RİCA; gerçek koşuda model "Hafıza", "Kopukluk", "Tekrar" yazdı ve 470px sabit
puntoda tek kelime ÜÇ SLAYDI kat edip başlıkla yarıştı. Reddetmek yanlış olurdu
(D-273: yazar bir model, ret koşunun tamamına mal olur) — ölçek uyarlanıyor. Üç
karaktere kadar tam punto, sonrası orantılı, taban 0,34.

**Geri alma maliyeti:** düşük — bir opsiyonel alan, bir yükleyici, bir formül.

## D-285

**Karar:** `tasarim` kapısının `font_family_count` sınırı 2 → 3; karşılığında yeni bir
ölçüm geldi: `font_family_unknown`, tavan **0**. Kullanılan her aile `fonts.ts`in kapalı
`YUZLER` listesinde beyan edilmiş olmalı.

**Neden gerekli:** Referansta (`image copy 2`) kapağın kontrastı punto farkından değil
**YÜZ FARKINDAN** geliyor — el yazısı vurgu + ağır condensed. Tek display ailesiyle o
kontrast kurulamıyor ve R-81 elle taklidi yasaklıyor (bir yazı karakteri, "jenerik ögeyi
kodlama" yasağının en uç örneği). Üçüncü aile keyfî bir ekleme değil, ayrı bir ROL:
metin · display · vurgu. Dördüncüsü hâlâ kırmızı.

⚠ ⚠ **BU BİR GEVŞETME DEĞİL, BİR TAKAS — ve net sonuç DAHA SIKI bir kapı.** Eski kural
kaba bir sayımdı: üç aile kullanan her belge kırmızıydı ama ÜÇÜNCÜNÜN NE OLDUĞU
sorulmuyordu. `font-family: Georgia` yazan bir belge iki aileyle YEŞİL geçiyordu. Artık
meşruiyet sayıdan değil KAPALI LİSTEDEN geliyor.

⚠ **Liste ikinci kez yazılmadı:** `BEYAN_EDILEN_AILELER` doğrudan `YUZLER`den türüyor.
Bu depoda ikiz sözlük hatası üç kez tekrarlandı; dördüncüsü burada olmayacak.

⚠ ⚠ **AYRI TURDA VE AYRI COMMIT'TE — R-76.** Sınır bir önceki turda üçüncü yüz eklenince
kırmızıya döndü; kural o turda DEĞİŞTİRİLMEDİ, yüz geri alındı (D-282). Kapı yeşile
döndükten sonra, ayrı bir turda ve `refactor(gates)` tipli ayrı bir commit'le
değiştiriliyor. Kuralı kırmızıyken değiştirmek, kapıyı geçmek için kuralı yazmaktır.

**Geri alma maliyeti:** düşük — iki sayı ve bir ölçüm satırı.

## D-286

**Karar:** `editoryal` referansına (`image copy 5`) göre YENİDEN KURULDU; `briefTemeli`
düzeltildi ve "yuva sayısı = varyant sayısı" değişmezi teste bağlandı.

**Neden:** Altı kapağı ızgaraya koyunca `editoryal` açık ara en zayıfıydı. Referansla
karşılaştırınca üç temel kararın da TERS olduğu görüldü:
1. **Zemin koyuydu** — referans açık, havadar, neredeyse kâğıt.
2. **Fotoğraflar panoramanın TAMAMINI kaplıyordu** (0–56 ve 56–100), yani metin hep
   fotoğrafın üstündeydi. Referansta fotoğraf ve metin YAN YANA, her biri kadrajın
   yarısı, ve taraflar slayttan slayta değişiyor.
3. **Başlık 38px'ti.** Referansın "sessiz" tonu küçük puntodan değil AZ AĞIRLIKTAN
   geliyor: başlık kadrajın en büyük ögesi ama ince. Küçük ve yarı kalın bir başlık
   sessiz değil, çekingen duruyor.

Yeni hâli: üç yarım kadraj fotoğraf, dönüşümlü yanlarda, üst-alt kenara taşan; ikincisi
50 kesimini aşıyor (bu şablonun tek süreklilik iddiası); metin kolonu 0,46 ve `kolon`
ile karşı yana geçiyor; başlık 0,72 payda ve 400 ağırlıkta.

⚠ **`briefTemeli` hâlâ "sağ yarıyı boş bırak" diyordu** — o talimat fotoğrafın tuvali
kapladığı ESKİ düzene aitti. Boş yarı isteyen bir brief, yeni düzende o yarıyı İKİ KEZ
boşaltır. Kaldırıldı.

⚠ ⚠ **ÜÇ YUVA, İKİ VARYANT — "ilan ile gerçek" ayrışmasının yeni yüzü.** Sıra varyant
sayısını aşınca brief boş dönüp adım atlanıyor (kasıtlı: fazlalık adım para harcamasın).
Ama şablon yuvadan AZ varyant taşırsa aynı mekanizma sessizce bir yuvayı yer tutucu
bırakıyor. `editoryal` üç yuvaya geçtiğinde tam bu oldu. Değişmez artık test ediliyor:
varyant eksiltildi → kırmızı, geri kondu → yeşil.

**Geri alma maliyeti:** orta — bir şablon örneği yeniden yazıldı; kayıt ve testler durdu.

## D-287

**Karar:** Kompozisyon alanlarının uyarlamadan sağ çıkması artık ALAN LİSTESİYLE
ölçülüyor, alan alan değil; başarısız adımın SEBEBİ manifest'e giriyor.

**Neden — alan listesi:** aynı sınıf hata İKİ KEZ tekrarlandı. `kolon` taşınmadı (dört
slaytta metin sola düşüp figürün üstüne bindi, D-280); dersin HEMEN YANINA eklenen
`elYazisi` de taşınmadı (`editoryal` koşusunda kapak slaydının el yazısı vurgusu
kayboldu). **Üçüncüsünü bir yorum engellemez.** Test artık listeyi VERİDEN türetiyor:
bir kartın içerik alanları sabit ve bilinen (`ustBaslik`, `baslik`, `govde`, `panel`,
`hayalet`, `rayaSol`, `rayaOrta`); geri kalan HER alan kompozisyondur ve uyarlanmış
belgede aynı değerle durmalı. Yeni bir opsiyonel alan kendiliğinden kapsanıyor —
bakım isteyen bir beyaz liste, unutulacak ikinci bir yerdir.
**Kanıt:** `elYazisi` taşıması kaldırıldı → altı şablonun ALTISI birden kırmızı.

**Neden — hata kaydı:** `editoryal` koşusunda üç görsel adımı da `failed` döndü.
Manifest yalnız `"status": "failed"` diyordu; sağlayıcı sonradan doğrudan sınandığında
iki biçimde de SAĞLAM çıktı. Teşhis koyacak hiçbir veri yoktu — **defter olayı
kaydetmiş, sebebini atmıştı.** `status`ün üç anlamını özenle ayıran yorum bu dosyada
duruyordu; hata sebebinin hiç kaydedilmediği fark edilmemişti.

⚠ **Özet, tam hata DEĞİL:** `kind` · `code` · `userMessageKey`. `details` sağlayıcı
gövdesi, prompt parçası ya da secret taşıyabilir ve defter git'e giriyor (§3.5 · §14).

⚠ **Görsel adımlarının neden düştüğü HÂLÂ BİLİNMİYOR** — bu turda kayıt yolu açıldı,
teşhis bir sonraki koşuya kaldı. Borç olarak yazıldı: sağlayıcı ayrı ayrı çağrıldığında
tohumlu ve tohumsuz iki istek de başarılı döndü, yani neden koşuya özgü.

**Geri alma maliyeti:** düşük — bir opsiyonel alan, bir test bloğu.

## D-288

**Karar:** `donen`de daire artık KIRPMA değil ARKA FON; ürün kesik ve daireyi taşıyor.
Lekeler kartların üstünde çizilebiliyor (`ust`) ve her şekil `leke` sınıfı taşıyor.
Uyarlama istemi örnek başlığın METNİNİ değil ŞEKLİNİ veriyor.

**Neden — daire:** Referansta (`image copy 3`) beyaz daire ürünün ARKASINDA duruyor ve
ürün onu taşıyor: sap, yaprak, omuz dairenin dışına çıkıyor. Bizde fotoğraf daireye
KIRPILIYORDU — aynı görüntü değil, daha az tasarım. Hat zaten arka planı siliyor
(`gorsel-kirp`), yani kesik ürün elimizdeydi; eksik olan tek şey dairenin GÖRÜNÜR bir
katmanda durmasıydı. Kart zemini opak olduğu için `lekeler` (z-index 0) hiç görünmüyordu;
`ust: true` onları kartlarla görseller ARASINA koyuyor.

⚠ **Süreklilik ÜRÜNDE değil ZEMİNDE.** İlk kurulumda ürünler kesimi aşıyordu ve her
slaytta İKİ yarım figür beliriyordu (kendi ürünü + öncekinin kuyruğu); metin ikisinin
arasında sıkışıp üstlerine bindi. **Ürün bir slaydın konusudur, iki slaydın ortak ögesi
değil.** Kesimi aşan şey artık soluk büyük daireler.

⚠ ⚠ **DENETİMİN BİR KOLU ÖLÜYDÜ.** Kesintisizlik ölçümü `.hayalet, .gorsel, .gorsel-yer,
.leke` seçicisini kullanıyor ve `.leke` sınıfı HİÇBİR ZAMAN yazılmamıştı. Yıllardır o kol
hiçbir şey saymıyordu; `donen`in kesimi aşan daireleri sayılmayınca kusur "haklı görünen
bir yanlış" verdi. Ölçüm aracının sessizce ölü bir kolu, yanlış ölçenden daha tehlikeli:
yeşil kalırken hiçbir şey ölçmüyor.

**Neden — istem:** Uyarlama istemi "başlıkları konuya göre yeniden yaz, aynen bırakmak
reddedilir" diyordu ve model İKİ AYRI GERÇEK KOŞUDA dördü de aynen döndürdü; `uyarla`
reddetti, hat `kompozit`te öldü. Talimatı yükseltmek üçüncüsü olurdu. **Kopyalanmasını
istemediğimiz metni modelin önüne koyduğumuz sürece kopyalanıyor** — model bir örneği
"doldurulacak yer tutucu" değil "verilmiş içerik" sayıyor. İsteme artık başlığın
uzunluğu, vurgunun kaçıncı kelimede olduğu ve panel tipi giriyor; metni girmiyor.
Kaybedilen bilgi yok: konuya özgü malzeme zaten "Kaynak metin" bölümünde.

**Geri alma maliyeti:** orta — bir şablon örneği, bir kayıt alanı, bir istem kurucusu.

## D-289

**Karar:** Yirmi ikon artık **Lucide**'den (lucide-static 1.31.0, ISC) geliyor; elle
çizim bitti. `kodlanmis-oge` kapısı SVG ilkellerini de sayıyor ve `sablon-ikon.ts`
tavanı **sıfırda dondu**.

**Neden:** `sablon-ikon.ts` yirmi ikonu 57 SVG ilkeliyle (`<line>`, `<circle>`, `<rect>`,
`<polyline>`, `<path>`) ELLE çiziyordu. Dosyanın kendi yorumu gerekçeyi yazıyordu:
FAZ-11.3 planı bir MIT/ISC seti öngörüyordu, onun yerine burada çizildi çünkü
(1) *"40 satır yazmak bir bağımlılıktan iyidir"* (R-75), (2) lisans denetimi istemesin,
(3) kontur markanın ölçüsünden gelsin. **Üçü de makuldü ve üçü de yanlış soruya cevaptı.**

R-75 bir BAĞIMLILIK ekonomisi kuralı; R-81 bir TASARIM kuralı. Çatıştıklarında ikincisi
kazanıyor: elle çizilmiş bir ikon ÇALIŞIYOR ama **tasarım gibi durmuyor**, ve ölçülemeyen
o fark depo sahibinin *"aşırı bilgisayar işi duruyor"* tespitinin kendisi.

⚠ **İkinci ve üçüncü gerekçe kayıp DEĞİL.** Kontur kalınlığı hâlâ `ikonSvg`de, markanın
ölçüsünden: Lucide `stroke-width`i `<svg>` üstünde taşıyor, `path`ler miras alıyor,
sarmalayıcı eziyor. Lisans da denetlenebilir: ISC metni bağımlılıkla geliyor, sürüm
`package.json`da sabit — "denetlenecek lisans yok" değil, "TEK ve izlenebilir".

⚠ Gövdeler ÜRETİLMİŞ bir modülde (`ikon-govde.ts`, üreteci `scripts/ikon-govde.mjs`):
render saf kalıyor, kaynak denetlenebilir kalıyor. Sözlük (`IKONLAR`) KAPALI kaldı —
değişen tek şey çizimin kaynağı. `dongu` için `recycle` seçildi: marka geri kazanım işi
yapıyor ve genel bir yenileme oku yerine döngüsellik simgesi markanın kendi dili.

⚠ ⚠ **KAPININ EN BÜYÜK KÖR NOKTASI BUYDU.** `kodlanmis-oge` yalnız CSS şekillerini
sayıyordu; R-81'in tarif ettiği ihlalin EN BÜYÜĞÜ kendi kapısından görünmüyordu ve kapı
yeşil diyordu. **Bir kural, ölçmediği şeyi yasaklayamaz.** Kanıt: ikon dosyasına elle bir
çember + çizgi eklendi → kırmızı; geri alındı → yeşil.

⚠ `ikon-govde.ts` kapsam dışı: içindeki `path`ler KÜTÜPHANENİN çizimi. Onu saymak,
kuralın istediği şeyi cezalandırmak olurdu.

⚠ ⚠ **YANLIŞ TEŞHİSTEN DÖNÜLDÜ:** `marka-isareti.ts` (markanın imzasını KODLA çizen
modül) "üretimde sıfır çağıranı var" diye emekliye ayrılmaya başlandı ve arşive taşındı.
Yanlıştı: `static.ts` ondan `markaCss` ve `markaKilidi` alıyor ve o yol SEKİZ hattı
besliyor. Yalnız `markaIsaretiSvg` aranmıştı. Taşıma geri alındı. **Gerekçesi ("brand/
altında logo dosyası yok") artık geçersiz** — gerçek logolar D-284'te geldi; göçü ayrı
bir karar, borç olarak yazıldı.

**Bedel:** bir dev bağımlılık (2025 ikon, yalnız 20'si gömülüyor), ISC.

**Geri alma maliyeti:** düşük — üreteç + eşleme tablosu; sözlük değişmedi.

## D-290

**Karar:** `just sablon-al <dosya>` — Photoshop tasarımını ÖLÇEN araç. PSD'de katman
adları, kutular, metin içeriği ve punto doğrudan okunuyor (`ag-psd`, MIT); düz görselde
yalnız palet kümeleniyor. Çıktı bir şablon DEĞİL, bir ölçüm.

**Neden:** depo sahibinin isteği: *"sana Photoshop'ta yaptığımız bir tasarımı atınca çok
hızlı şekilde mükemmelce onu burada şablona aktarabilmelisin."* Bugüne kadar her şablon
bir referans GÖRSELİNE bakılarak elle ölçüldü; kadraj bölünmesi, kutular ve tip ölçeği
göz kararıydı ve her turda birkaç yanlış tahminle düzeltildi (`editoryal`in üç temel
kararı da tersti). Tasarım bir PSD ise bu bilgilerin hepsi zaten DOSYADA yazılı.

⚠ ⚠ **İKİ GİRDİ, İKİ GÜVEN SEVİYESİ ve araç bunu SÖYLÜYOR.** PSD'de okunanlar
tasarımcının kendi kararları; düz görselde yalnız palet çıkarılabiliyor ve metin kutusu
tahmini KASTEN yapılmıyor — yanlış bir kutu, kutu olmamasından kötü. "Ölçüldü" ile
"tahmin edildi" karışırsa araç zararlı olur.

⚠ ⚠ **SIFIR BOYUTLU KATMAN SESSİZCE ATILMIYOR, SAYILIYOR.** İlk sürüm `continue` diyordu
ve test PSD'sinde HİÇBİR ÖGE listelenmedi; araç "0 öge" deyip geçti. Gerçek bir dosyada
ayar katmanları ve maskeler de böyle kaybolurdu. **Bir ölçüm aracının en kötü davranışı,
ölçemediğini ölçtü sanmaktır.** Metin katmanı boyutsuz olsa bile listeleniyor: içeriği ve
puntosu tasarımın kararı.

⚠ Palet KÜMELENİYOR (medyan-kesme, 8 küme). Ham sayım referansın neredeyse aynı sekiz
nane tonunu SEKİZ AYRI renk sayıyor ve palet hiçbir şey söylemiyordu: tasarımın gerçek
rengi bir DEĞER değil bir KÜME.

⚠ Gömülü Python bir JS şablon dizesinin içinde: **ters tırnak kullanılamaz**, dizeyi
kapatıyor. İlk sürüm bir yorumdaki `` `quantize` `` yüzünden derlenmedi.

**Kanıt:** sentetik bir PSD yazılıp okundu — 4320×1350'den 4 slayt çıkarıldı, katman
grupları (`metin / baslik`), metin içeriği, punto (96/34) ve tip ölçeği oranı (2,8)
raporlandı; ölçülemeyen iki katman ayrıca bildirildi.

**Geri alma maliyeti:** düşük — bir script, bir `just` girişi, bir dev bağımlılık.

## D-291

**Karar:** 3B öge kaynağı TÜRE GÖRE ikiye ayrılıyor — **NESNE** ise hattın kendi görsel
modeli üretir (bedava, markaya özgü, sonsuz çeşit); **SOYUT SEMBOL** ise küratörlü bir
setten gelir. Aday setler ölçüldü: **3dicons** (CC0, 100+ 3B ikon) ve **Fluent Emoji**
(MIT, Microsoft) — ikisi de gerçek 3B render, kod değil.

**Neden — ve bu bir tercih değil, bir ÖLÇÜM sonucu.** Üç 3B brief'i gerçek sağlayıcıya
gönderildi (clay render · izometrik · yumuşak gölge · düz siyah zemin):
- **kutu** → mükemmel: doğru malzeme, doğru temas gölgesi, referanstaki "3d element"
  görünümünün ta kendisi.
- **geri kazanım döngüsü** → yakın ama geometrisi kusurlu; model soyut sembolü tam kuramıyor.
- **dişli** → tamamen başarısız (17 KB siyah kare).
Yani model NESNEDE güçlü, SEMBOLDE zayıf. Tek kaynağa bağlanmak ikisinden birini bozardı.

⚠ ⚠ **LUCIDE BU BOŞLUĞU KAPATMIYOR ve depo sahibi bunu doğru gördü.** Lucide bir ARAYÜZ
ikon seti: ince, tek kalınlıkta kontur, ekran için tasarlanmış. Liste satırlarında doğru
(onlar zaten arayüz ritmi) ama referanslardaki dil o değil — 3B render ürün, el çizimi
fırça, botanik illüstrasyon. **Elle çizimden kurtulmak (D-289) gerekliydi ama yeterli
değil:** ikon seti değiştirmek "web gibi durma" sorununu çözmüyor, yalnız en kaba
belirtisini alıyor.

⚠ Model üretimi hattın MEVCUT yeteneği: `gorsel-uret` + `gorsel-kirp` zaten var, yani
3B nesne için yeni bağımlılık YOK. Küratörlü set ise ayrı bir kurulum kararı — hangi
sembollerin gerçekten gerektiği ölçülmeden yapılmamalı (yirmi ikonun kaçı 3B olmalı?).

**Geri alma maliyeti:** yok — bu tur yalnız ölçüm ve karar; kod değişmedi.
