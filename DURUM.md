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
son_kanit: "SAHIBIN 14 MADDELIK LISTESI: 13'u KAPANDI, 1'i SAHIBIN KARARINI BEKLIYOR. BITEN: (11) editorde elenmis kosu gizli 56 -> 15, ?elenmis=1 geri getirir. (1) sablon HER YERDE: editor listesi, kuyruk, varliklar; tek kaynak apps/server/src/kosu-sablonu.ts cunku kosu-parametreleri.json sistem secince BOS kaliyor ve bir kez YANLIS ETIKETE yol acti. (8) 1080x1440 BAYTTAN dogrulaniyor: goruntu-olcu.ts + render yolunda kontrol + panelde rozet + paylasim-olcusu kapisi. (12) webden arama MODALA tasindi + kova; sonuclar 288px sutunun dibinde gorunmuyordu. (2) donusX/Y/Z, perspektif ogenin genisliginden. DUZ PNG gizli yuzunu GOSTEREMEZ; gercek 360 icin nesne N acidan URETILMELI. (13) fare tutamaclari: kosede orantili olcek, ustte dondurme. getBoundingClientRect DONDURULMUS kutuyu olcuyor; offset* yerlesim degerlerine gecildi. (7) icerik kipi firma|genel: SELECT genel kipte baglamsiz kosabiliyor ama KAYITLI, Yasa 8 iki kipte de duruyor, kapsam KAPALI LISTE DEGIL. (6) ozgunluk: konu kimligi ESIKSIZ + metin benzerligi 0,23 OLCULDU (1275 cift; iki dagilim 0,120-0,222 bandinda ORTUSUYOR, tek esik ayiramaz). (3) dort platform + ARASTIRILAN sinirlar; yayin-metni adimi dort metni TEK cagrida. (4) yayin onizlemesi: KATLANMA noktasi kesikli cizgiyle GORSEL. (10) yayin takvimi: ardisik ayni sablon 5/18 -> 0/18, denge esikle degil SECIMLE. (5) yayin akisi ekrani: kapida / hazir / yayinlanmis uc durum AYRI. (14) uctan-uca kapisi 17 ekran + editoru GERCEK tarayicida geziyor. SAHIBIN KARARI BEKLENIYOR (madde 9): Instagram Graph API karosele LISANSLI MUZIK EKLEYEMIYOR; muzik karosele yalniz MOBIL uygulamadan eklenebiliyor ve yayindan sonra degistirilemiyor. audio_name Reels icin ve orada da ses videoya GOMULU gelmeli. Iki secenek: (a) yayin adimina 'uygulamada muzik ekle' hatirlatmasi, (b) karosel yerine Reels uretmek - bu bir FORMAT karari. DURAN TALIMATLAR: YAYIN YOK; sablon TASARIMINA dokunma; kapilar opt-in (SUITE_KAPILAR=1). TEZGAH NODE 22 ILE KALKAR: v20de better-sqlite3 SEGFAULT (exit 139, hic cikti yok); editoru tek basina oldurmek ucunu birden indirir (dev.sh wait -n). OLCUM BULDU, TAHMIN DEGIL: yayin onizlemesi dort istegin dordunde 404 aliyordu (render.json DAMGALAMA ONCESI digest tasiyor, blob deposu damgalanmis baytla anahtarliyor); /api/performans 422 donuyordu cunku published.ndjson hic yazilmamis, yani CALISAN sistem BOZUK gorunuyordu; yayin akisi sablonsuz kosulari SESSIZCE atiyordu, sonra YANLIS sayiyordu (85 dedi, gercek 5); JPEG okuyucumdaki i+9 kusuru yalniz gercek dosyalarla sinansaydi HIC gorunmezdi. KENDI HATALARIM: git checkout ile platform secicisinin TAMAMINI sildim (ihlali cp yedegiyle geri al); DURUM kapi sayacini IKI KEZ tahmin edip yanildim; editoryal varyantlarinda ortak uslup sozcugunu dusurup gerileme biraktim (contracts kostum, providers kosmadim); Math.min(...d, 0) yazip asgariyi 0'a kilitledim. ACIK KALAN: sahibi on uretime tek tek bakip madde madde geri bildirim verecek."

```

## Neredeyiz

**FAZ 0–8 kapandı** (5 ve 6 şartlı: D-206 · D-217).
**55 kapı · 24 ihlal kırmızı · 2276 test.**
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
