# DURUM

> Döngünün her turda okuduğu ve yazdığı tek durum dosyası.
> Bağlam sıfırlanırsa **önce burayı oku** (`CLAUDE.md` → "BAĞLAM COMPACT'LENDİYSE").

```yaml
# ── makine-okunur durum bloğu (LOOP§E) ───────────────────────────────────────
aktif_faz: 19
siradaki_adim: 19.10
son_guncelleme: 2026-08-26
bloke: ["2.9:insan", "3.7:insan", "3.8:insan", "3.14:insan", "4.13b:insan", "5.4b:insan", "5.5b:insan", "6.5b:insan", "6.9b:insan", "7.2b:insan", "7.5b:insan", "7.6b:insan", "7.8b:insan", "8.6:insan", "8.8b:insan", "11.5:insan", "11.6:insan", "11.9:insan", "12.8:insan", "13.3:insan", "18.18:insan", "8.3b:teknik"]
deneme_sayaci: {}
son_kanit: "SAHIBIN UX TURU: 12 madde KAPANDI. Onaylar/Uyum/Doktor/Butce ust gezinmeden cikti (silinmedi, palette). KOSULAR ve VARLIKLAR TEK EKRAN oldu — ve birlesim KOSU listesi uzerine kuruldu, varlik listesi uzerine DEGIL: varlik ekrani yalniz varlik URETMIS kosulari goruyordu (10), kosu ekrani hepsini (202). Tersi 192 kosuyu SESSIZCE dusururdu. Iki gorunum tek suzgec: kart (slaytlarla) ve tablo (yogun). VarlikKutuphanesi.tsx SILINDI — duran bir kopya kacinilmaz olarak ayrisir. GonderiKutusu.tsx TEK KAYNAK: kosu detayi, varlik karti ve takvim ucu de onu cagiriyor. YAYIN KARARI DEGISTI (arastirmayla): Instagram API'sinde ZAMANLAMA YOK (kap 24 saatte doluyor, Meta kendi belgesinde 'if your app allows app users to schedule posts' diyor — zamanlayici UYGULAMANINDIR); LinkedIn'de SCHEDULED yasam dongusu yok; X'te yalniz Ads API'de. Yalniz Facebook gercekten platform tarafinda zamanliyor. Kendi zamanlayicimiz Yasa 12'ye carpiyordu (makine kapaliyken gonderi gitmez). Sahip karar verdi: panel HATIRLATICI + PLANLAYICI, yayin bulut araciyla. YAYIN PAKETI klasoru: karoseller TESLIMAT SIRASINDA numarali, metinler platform basina, GONDERI.md muzik ve tavan kurallariyla. ARASTIRMA: Metricool marka basina ucretlendiriyor (1 marka = IG+FB+LinkedIn ucretsiz, X ~$5/ay); Publer/Buffer kanal basina ~$5 -> ~$20/ay; Ayrshare karosel icin $149/ay. SAHIP METRICOOL MCP'YI BAGLADI (ai.metricool.com/mcp, Connected) ve 'simdilik sadece LinkedIn ve Insta' dedi -> varsayilan IG+in. ⚠ MCP ARACLARI BU OTURUMDA YOK (oturum MCP eklenmeden once basladi); YENI OTURUMDA post_schedule_post semasina bakilacak: karosel aliyorsa takvim dogrudan senkron olur, almiyorsa paket klasoru elle yukleme icin kalir. OLCUM BULDU: (a) KAROSEL SIRASI iki yerde birden bozuktu — birlesimde digest'e gore siralamistim (sha256 RASTGELE) ve yayin onizlemesi createdAt kullaniyordu; zaman damgalari MILISANIYEDE esitleniyor (dizin kosusunda iki slayt ayni ms, siralari ters). Dogru kaynak teslimat.index; 45 varligin 45'inde var. Slaytin KENDI altbilgisi '01/06' yaziyor ve dosya adiyla birebir ayni. (b) SUZGEC CUBUGU butun sayfayi geriyordu: 900px'te govde 1567px, suclu kart degil sarmayan flex. (c) kapi rozeti onaydan sonra kalkmiyordu — awaitingGate karar yazilinca DEGISMIYOR, dogru olcut decisions. (d) 'karar verildi' kutusu sayfanin 2500px asagisindaydi -> 276px. (e) lint kapisinin 'bos gecmiyorum' guvencesi KENDISI bos geciyordu (node stdout TTY'de sayilari RENKLENDIRIYOR, karsilastirma her kosuda dusuyordu). (f) yayin akisi ELENMIS kosulari planliyordu. (g) DORDUNCU DURUM vardi ve hicbir kutuya girmiyordu: son kapisini gecmis ama hattin ORTASINDA durmus kosu. METIN URETIMI CALISIYOR: scripts/yayin-metni.mjs hattin text.generate adaptorunu cagiriyor (maliyet SIFIR — abonelik); sunucu model cagirmiyor, cekirdegin spawn'i kullaniliyor. SENARYO TESTLERI: S1-S13 + V1-V5 (vazgecme/degistirme turlari) surulup GORULEREK dogrulandi. KENDI HATALARIM: karosel sirasini digest'e gore siralayip BOZDUM (yorumumda createdAt yazip koda digest yazmisim); testlerde 'derived/runs' yolunu ELLE yazip darbogaz kapisina takildim (IKI KEZ); node:child_process'ten dogrudan spawn cagirdim; 'hat suruyor' diye DOGRULAYAMADIGIM sey iddia ettim; Playwright testlerim dort kosuya tasarim-onayi karari yazdi (ikisi geri alindi, kavis ve editoryal'da karara bagli gercek hat ciktisi var — SAHIBE BILDIRILDI). DURAN TALIMATLAR: YAYIN YOK; sablon TASARIMINA dokunma; tezgah NODE 22 (v20'de segfault)."

```

## Neredeyiz

**FAZ 0–8 kapandı** (5 ve 6 şartlı: D-206 · D-217).
**55 kapı · 24 ihlal kırmızı · 2506 test.**
Faz tikleri faz dosyalarında; `git log` tek başına yol haritasıdır (D-85).

> **Kök neden, ON tekrar:** kod yazılır, üretim yolunda çağıranı olmaz — D-182 · D-190 ·
> D-224 · D-250 · D-261 · **D-270 (mimarinin tamamı)**. Zincir için sorulur, adım için değil.
> ⛔ **YİRMİ BİR ADIM İNSAN GİRDİSİ BEKLİYOR** — `2.9` `3.7` `3.8` `3.14` `4.13b` `5.4b`
> `5.5b` `6.5b` `6.9b` `7.2b` `7.5b` `7.6b` `7.8b` `8.6` `8.8b` `11.5` `11.6` `11.9`
> `12.8` `13.3` `18.18`. Sınıfı `insan` (D-157): plan hatası değil dış bağımlılık.
> ⚠ ⚠ **FAZ 19 = TASARIM FAZI, belge NİHAİ HALİNDE** (`docs/fazlar/FAZ-19.md`, tavanda):
> talepler · dört denetimin yargısı · tanı · **on şablon on tema matrisi** · on beş adım. **Bağlam sıfırlanırsa ÖNCE orayı oku.**
> ⚠ **İki referans:** `docs/referans/seamless-arastirma-2026-08.md` (**985+ = AŞAMA 2
> REÇETE**) · `docs/referans/tasarim-denetimi-2026-08.md`. ⚠ ⚠ **TUZAK:** o dosyada İKİ
> ayrı `A`/`B`/`C` var — RAPOR 2'nin `B`si RENK, **AŞAMA 2'nin `B`si ŞABLON ŞABLON
> REÇETE.** "Reçetenin B'si" hep ikincisidir.
> ⚠ **SIRADAKİ İŞ 19.8 — GÖRSEL DİLİ VE YÜZEY ZANAATI.** "Kutu değil yüzey" altı kuralı: `border-radius` 0 ya da ≥28 px (4-12 px tam olarak "bootstrap kartı" bandı) · saf renk yok (taban + soft-light gren + 1 px iç ışık) · görsel kesim taşıyıcısı.
> ⚠ **YAYIN YOK.** Degrade yasağının kapsamı değişti: optik degrade serbest.

## Tamamlananlar

> **Yalnız AKTİF faz** (D-85); öncekiler faz dosyalarındaki tiklerde. FAZ 0+1: 51 ·
> FAZ 2: 12/13 · FAZ 3: 12/15 (D-158) · FAZ 4: 17/17 · FAZ 5: 8/10 (D-206) ·
> FAZ 6: 10/12 (D-217) · FAZ 15: 12/14 (katalog merkezli üretim kapandı).

| Adım | Tarih |
|---|---|
| **16.1** · metin de taşınıyor, ölçekleniyor, siliniyor — sınırlı pay, mutlak konum DEĞİL | 2026-08-18 |
| **16.4** · `SKILLS.md` + iki beceri dosyası; sıfır bağlamla tek komut | 2026-08-18 |
| **16.5** · `just setup` üretim önkoşullarını da sayıyor; eksik ADIYLA, çıkış kodu 1 | 2026-08-18 |
| **16.2** · müfettiş paneli: tipografi, kart, belge, seçili öge — hepsi canlı ve dosyaya yazıyor | 2026-08-18 |
| **16.3** · kendi görselini koy; şablona sabit fotoğraf REDDEDİLİYOR, üretilen ezilmiyor | 2026-08-18 |
| **16.6** · şablon çeşitliliği: son üç koşuda kullanılan eleniyor, geçmiş PLANA donuyor | 2026-08-18 |
| **16.7** · ritim MEKANİK kural oldu; gerçek koşuda ilk kez `akan-alan` seçildi | 2026-08-18 |
| **16.8** · ritim uyumu ölçülüp DEFTERE yazılıyor; beyaz liste altıncı kez alan eledi | 2026-08-18 |
| **16.9** · `defter-anahtarlari` kapısı; on alan daha sessizce eleniyormuş, yedisi kurtarıldı | 2026-08-18 |
| **16.10** · geri/ileri YIĞINI (tavan 50) + Ctrl+Z; düğme derinliği gösteriyor | 2026-08-18 |
| **17.1** · metin ve tasarım kapıları hatta; `just onay --kapi` ile tek kapı onaylanıyor | 2026-08-18 |
| **17.2** · komuta merkezi: görünür nav, koşu DETAYI (metin+slayt+kusur+onay), tıklama canlı | 2026-08-18 |
| **17.3** · yayın anı bir KARAR: hat ölçümden saat ÖNERİR, ölçüm yoksa susar; `PUBLISH` seçimsiz koşmuyor (D-314) | 2026-08-22 |
| **18.1-18.2** · tip ölçeği ve palet markanın dizayn sisteminden; el yazısı, `wdth`, vurgu çipi emekli (D-317, D-318) | 2026-08-22 |
| **18.0** · araştırma tabanı: Instagram spec + tasarım disiplini + marka farkı, hepsi kaynaklı (D-321) | 2026-08-23 |
| **18.3** · süreklilik ölçek çizgisi; `sahne`de görsel kesim üstünde, dörtten ikiye (D-319) | 2026-08-23 |
| **18.4** · tanımsız token çağrısı kapısı — CSS sessizce şeffaf bırakıyordu (D-320) | 2026-08-23 |
| **18.5** · gövde puntosu okuma eşiğine çıktı (34 → 36 px, açıya sabit); R-83 · R-84 · R-85 yazıldı | 2026-08-23 |
| **18.6** · ölçü bandı 45–75 karakter; gövde sütunu başlıktan ayrıldı, `donen` 19 → 49 (R-86) | 2026-08-23 |
| **18.7** · kesintisizlik HER kesimde ölçülüyor; `memphis` + `editoryal` gizli boş kesimleri kapandı (R-87) | 2026-08-23 |
| **18.8** · güvenli alan 80 px, metin payı ≤%30 (kapak %42); gövde başlığı kapaktan ayrıldı (R-88) | 2026-08-23 |
| **18.9** · kelime bütçesi: başlık ≤8, slayt ≤28; sınır isteme yazılı, ret render'dan önce (R-89) | 2026-08-23 |
| **18.10** · yayın sözleşmesi: API 10 slayt + yalnız JPEG; hat PNG yazıyordu, artık `.jpg` (R-90) | 2026-08-23 |
| **18.11** · tuval oranı tek sözleşme sabitinden; 3:4'e geçiş tek satır, ölçülerek doğrulandı (R-91) | 2026-08-23 |
| **18.12** · marka imzası üretim yoluna bağlandı — logo hiç basılmıyordu, zincirin yedinci kopukluğu (R-92) | 2026-08-23 |
| **18.13** · ölçek TEK tabandan: krom ölçeklenmiyordu, 1080→1350'de yedi ölçü de %25 büyüdü (R-99) | 2026-08-23 |
| **18.13b** · taban çizgisi ızgarası metinden türüyor — sabit 54 px altıdan beşinde yanlıştı (R-100) | 2026-08-23 |
| **18.13c** · alt marka gerçekten koşuyor: font ve logo da devralınıyor, adlar marka-nötr (R-101) | 2026-08-23 |
| **18.13d** · token yüzeye göre çözülüyor — iki ölü rol panelde gözle doğrulandı (R-102) | 2026-08-24 |
| **18.14** · yasak terim listesi 6 → 23; üç canlı ihlal ve hayalet yolun ŞABLON kökü kapandı (R-103) | 2026-08-24 |
| **18.15** · kaynak satırı eksikliği artık görünür kutu — sessiz boşluk imzasız çıktıyı imzalı gösteriyordu (R-104) | 2026-08-24 |
| **18.16** · şablon ailesi 6 → 10; yeni şablonlar ESKİ şablonların üç kusurunu ortaya çıkardı (R-105 · R-106) | 2026-08-24 |
| **18.17** · ızgara sınavı ÖLÇÜLEBİLİR: baskın ton onunda da 220°, krom birebir aynı (R-107) | 2026-08-24 |
| **19.1** · dört katmanlı tasarım denetimi: kapak · 45 iç slayt · zanaat/finiş · seamless panorama | 2026-08-24 |
| **19.2** · bağımsız seamless araştırması BİREBİR kopyalandı; sekiz ailede görsel işlemleri açıldı | 2026-08-24 |
| **19.3** · tatbik reçetesi: on tema, şablon şablon zemin/tipografi/taşıyıcı değerleri, ortak altyapı | 2026-08-24 |
| **19.4** · zemin ve yüzey: gren · yedi yüzey ailesi · ışık · vinyet malzemede · çizgili zemin | 2026-08-25 |
| **19.5** · tipografi: iki uç kapısı · aksan telafisi çürüdü · genişlik ekseni iki yöne · alıntıya atıf | 2026-08-25 |
| **19.6** · renk: beş palet · aksan dört rol · kontrast zeminden türüyor, gövde artık soluk değil | 2026-08-25 |
| **19.7** · kompozisyon: slayt rolü · aksan yüzeyi · kapak silueti · kapanış tek yüzey · marka iki kez | 2026-08-25 |

## Sıradaki adım

## FAZ 15 — katalog merkezli üretim (D-268 · D-269 · D-270)

**15.1–15.12 + 15.14 KAPALI · 15.9 ve 15.13 AÇIK.** Ayrıntı: `docs/fazlar/FAZ-15.md`.
Belge: `docs/referans/katalog-merkezli-hat.md`.

⚠ **ONUNCU ZİNCİR KOPUKLUĞU (D-270):** `renderPanorama`nın üretim yolunda SIFIR çağıranı
vardı — mimarinin tamamı `just uret`ten erişilemezdi. Bağlarken çıkan altı kopuk halkanın
hiçbiri testle, hepsi GERÇEK KOŞUYLA bulundu.

## Devreden borçlar

QA/bağlam 0/18 (`2.9`) · bileşen testi FAZ 9'a · V-19 · V-24/25/26/27 · `3.12b` R2 ·
varlıklar indekste yok · önizleme yok.

## Bloke adımlar

> Not: golden metrikler SİSTEM fontuyla donduruldu; marka fontu gelince (V-02) temel
> yeniden alınır — düzeltme, blokaj değil (D-144).

**`2.9` — insan onayı bekliyor (D-83).** Yedi kayıt `draft` indi, retrieval'a görünmüyor.
`active` yapmak agent'ın işi değil (R-14): `just onayla corpus/*/*.md` → `just reindex`.

**Dikkat:** `positioning`/`icp`/`offer` HİPOTEZ (V-07) — dikey seçimi çıkarım.

✅ **Sessiz bir engel kaldırıldı (D-167):** altı kaydın `era_id`si yanlıştı; ölçüldü,
düzeltmeyle 7 kayıt geliyor, düzeltmesiz 1.

**`3.7` · `3.8` — V-16.** `CF_ACCOUNT_ID`+`CF_API_TOKEN` ya da `FAL_KEY` (+~$3).
Anahtarsız `image.generate` hiçbir sağlayıcıya çözülmüyor.

**`4.13b` — V-18.** `tailscale` yok, token yer tutucu; mantık test edilmiş.
**`3.14` — `2.9`'a bağlı.** Onaylı corpus olmadan `bilgi-sec` `NO_CONTEXT` ile duruyor
(R-13, atlatılmıyor). `2.9` açıldığı gün FAZ 3 TAM kapanır.
