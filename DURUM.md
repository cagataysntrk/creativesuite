# DURUM

> Döngünün her turda okuduğu ve yazdığı tek durum dosyası.
> Bağlam sıfırlanırsa **önce burayı oku** (`CLAUDE.md` → "BAĞLAM COMPACT'LENDİYSE").

```yaml
# ── makine-okunur durum bloğu (LOOP§E) ───────────────────────────────────────
aktif_faz: 13
siradaki_adim: 9.1
son_guncelleme: 2026-08-17
bloke: ["2.9:insan", "3.7:insan", "3.8:insan", "3.14:insan", "4.13b:insan", "5.4b:insan", "5.5b:insan", "6.5b:insan", "6.9b:insan", "7.2b:insan", "7.5b:insan", "7.6b:insan", "7.8b:insan", "8.6:insan", "8.8b:insan", "11.5:insan", "11.6:insan", "11.9:insan", "12.8:insan", "13.3:insan", "8.3b:teknik"]
deneme_sayaci: {}
son_kanit: "MIMARI DUZELTME — SEAMLESS KAROSEL. Kullanici hakli cikti: her slaydi AYRI render edip surekliligi IMA eden model hicbir zaman surekli gorunemez. Dogrusu tek genis tuval (N x 1080) tasarlayip DILIMLEMEK; oge kesim cizgilerini serbestce asiyor. packages/render/src/panorama.ts: tek sayfa, translateX ile N ekran goruntusu (goruntu kutuphanesi bagimliligi yok, viewport kirpiyor). KESIMI ASAN OGE ICERIKTEN TURER: veri egrisi, kemer dizisi, kesik ozne, akan oklar. packages/contracts/src/katalog.ts: bes referans + veri hikayesi = alti sablon, her biri gorsel ihtiyacini ILAN EDIYOR (adet, kirpma, brief temeli) ve kullanilabilir bayragi tasiyor. AKAN-ALAN ONCUL DUZELTMESI: referansta egri sinir DIKEY ve slayt basina, yani o tasarim seamless DEGIL; panoramaya tasimak icin sinir yataya cevrildi, ancak o zaman egri tek bir yol oluyor. BAKARAK BULUNAN YEDI KUSUR: yuzey beyan edilmedigi icin koyu sablon BEYAZ cikiyordu; kunye rayinin mutlak konumu bir CSS kuraliyla eziliyor metnin ortasina dusuyordu; hayalet %4.5 opaklikta hic okunmuyordu; icerik uste yigilip alt %60 bos kaliyordu; akan-alan da vurgu amber-ustune-amber yani GORUNMUYORDU (renkler karttan turemiyordu -> acik zeminde cip); sahne nin oklari hic cizilmiyordu (CSS sinifi eksik); memphis in lekeleri opak kartlarin arkasinda kaliyordu. GORSEL MEKANIZMASI SAGLAYICI BEKLEMEDEN KANITLANDI: sentetik seffaf PNG siluetlerle figurlerin kollari kesim cizgilerini gercekten asiyor. Dort sablon kullanilabilir: false — bedava seritte image.generate yok, yer tutucuyla ciziliyor ve eksiklik GORUNUR kaliyor. 42 kapi · 1615 test."
```

## Neredeyiz

**FAZ 0–8 kapandı** (5 ve 6 şartlı: D-206 · D-217).
**43 kapı · 23 ihlal kırmızı · 1613 test.**
Faz tikleri faz dosyalarında; `git log` tek başına yol haritasıdır (D-85).

> **Kök neden, beş tekrar:** kod yazılır, üretim yolunda çağıranı olmaz — D-182 · D-190 ·
> D-224 · D-250 · D-261. **"Çağıran var mı" ZİNCİR için sorulur**, tek adım için değil.

> ⛔ **ON DOKUZ ADIM İNSAN GİRDİSİ BEKLİYOR** — `2.9` · `3.7` · `3.8` · `3.14` · `4.13b` ·
> `5.4b` · `5.5b` · `6.5b` · `6.9b` · `7.2b` · `7.5b` · `7.6b` · `7.8b` · `8.6` · `8.8b` ·
> `11.5` · `11.6` · `11.9` · `12.8` · `13.3`.
> Sınıfları `insan` (D-157): plan hatası değil, dış bağımlılık. Son beşi D-266/D-267'de
> **tetikleyiciye** bağlandı — blokaj artık "bir gün bakarız" değil, gözlenebilir koşul.
>
> | Adım | Bekleyen | | Adım | Bekleyen |
> |---|---|---|---|---|
> | `2.9` | `just onayla corpus/*/*.md` | | `7.2b` `7.6b` `7.8b` | V-26 Meta token |
> | `3.7` `3.8` | V-16 anahtar (+~$3) | | `7.5b` `8.8b` | V-27 OAuth kaydı |
> | `3.14` | `2.9`'a bağlı | | `8.6` | V-10 hukukçu |
> | `4.13b` | V-18 Tailscale+Telegram | | `11.5` `11.9` | BiRefNet ~1 GB (D-266) |
> | `5.4b` `5.5b` | V-21/V-22 ses+altyazı | | `11.6` `13.3` | ücretli görsel şeridi |
> | `6.5b` `6.9b` | V-24 / V-25 | | `12.8` | Lanczos+EXIF (D-267) |

## Tamamlananlar

> **Bu tablo yalnız AKTİF fazı gösterir** (D-85). Önceki fazlar faz dosyalarındaki
> tiklerdedir ve `git log` tek başına yol haritasıdır.
>
> FAZ 0+1: 51 · **FAZ 2: 12/13** · **FAZ 3: 12/15** (şartlı, D-158) · **FAZ 4: 17/17** ·
> **FAZ 5: 8/10** (şartlı, D-206) · **FAZ 6: 10/12** (şartlı, D-217; `6.5b` V-24,
> `6.9b` V-25). Tikler faz dosyalarında.

| Adım | Tarih |
|---|---|
| **13.6** · kör kabul; AYNI SINIF ama yargıcın gürültüsü ölçülen farkla aynı boyda | 2026-08-17 |
| **11.10** · illüstrasyon kütüphanesi KAPATILDI; 11.5/11.6/11.9 tetikleyicili (D-266) | 2026-08-17 |
| **13.5** · `design.critique` estetik eksen; ölçüm ve yargı aynı kusuru buldu | 2026-08-17 |
| **13.4** · çeşitlilik parmak izi; iki aile 6 alanın YALNIZ 2'sinde ayrışıyor | 2026-08-17 |
| **13.2** · katman yığını VERİ; üç z-index beraberliği kazaydı, çıktı piksel-özdeş | 2026-08-17 |
| **13.1** · kompozisyon ölçümü RAPOR; ilk metrik gramerin ritmini kusur sanıyordu | 2026-08-17 |
| **12.2** · raster dağarcığı; palet garantisini duotone tutuyor, ikiz küme sınavı | 2026-08-17 |
| **12.10** · sütun o slaytın eğrisinden; `column_in_band` kendini ölçüyordu | 2026-08-17 |
| **12.9** · degrade rampadan; asıl kusur durakların YERİNDEYDİ | 2026-08-17 |
| **11.1 11.2 11.3** · diyagram · süsleme dağarcığı · 20 ikon | 2026-08-17 |
| **14.1–14.4** · yay halka 0'da · gerekçeli plan · koşullu görsel · plan↔çıktı | 2026-08-17 |
| **12.6** · marka işareti: harf formu, üçüncü yaklaşımda öncül değişti | 2026-08-17 |
| **12.4** · panorama: akan şey zemin değil süsleme; İKİNCİ aile doğdu | 2026-08-17 |
| **12.7** · kompozisyon ailesi; garanti ailede YOK, zorlama yoklukla | 2026-08-17 |
| **12.5** · karşılaştırma bloğu; halka/KPI/ilerleme R-32 arkasında | 2026-08-17 |
| **12.1** · tipografi efektleri; vurgu şeridi — slayt içi hiyerarşi | 2026-08-17 |
| **12.3** · Türkçe heceleme bağlandı; kod vardı, üretim hiç çağırmıyordu | 2026-08-17 |
| **11.7** · duotone: renk tutarlılığı yapısal, prompt'a yalvarma bitti | 2026-08-17 |
| **11.4** · fotoğraf yuvaları; yuvasız görsel reddediliyor | 2026-08-17 |
| **11.8** · grain tavanlı; vinyet ölçülerek kapalı bırakıldı | 2026-08-17 |
| **14.5** · görsel adımları opsiyonel; atlanan adım `skipped`, ret defterde | 2026-08-17 |

## Sıradaki adım

**FAZ-13 KAPANDI** (13.3 `bloke: karar`, tetikleyicili — D-267). Üç çıkış kriteri de
gösterildi. **FAZ-12'nin adımları bitti ama ÇIKIŞ KRİTERİ AÇIK: kabul sayacı 0/20.**
"Adımlar tikli" ile "faz kapandı" ayrı şeyler.

**LOOP§D iki tur da koşuldu (tavan doldu, D-79).** Toplam dokuz blokaj + on beş ikincil
bulgu kapatıldı. İkinci turun en ağırı: blokaj 3'ü kod katmanında kapatmıştım, **hat
yapılandırmasında açık kalmıştı** — `gorsel_yuvasi: true` sabiti ölçütü boğuyor, her konu
`temel` çıkıyordu. Ölçüt artık NE ÇİZİLDİĞİNE bakıyor, ne istendiğine değil.

**Kanıt koşusu:** `plan.aile=akici` · `panorama=true` · `degrade=true` — **12.4 ve 12.9
ilk kez gerçek bir koşuda basıldı.** `tasarim-yargi` puanları deftere girdi (3,67/5).

**Ders değişmedi:** ölçüm aracı ölçtüğü şeyden daha sık bozuk (bu oturumda yedi kez).
Ve **metrik yeşilken çıktı kırık olabilir**: son iki kusuru 42 kapı + 1613 test yeşilken
yalnız çıktıya BAKMAK yakaladı — hayalet rakamın konturu ve vurgu şeridi.

⚠ **SIRADAKİ: FAZ 9 denetim turları** (`9.1`). `docs/fazlar/FAZ-9.md`.
⚠ **Kabul sayacı 0/20** — FAZ-12'nin kapanması buna bağlı (`docs/referans/kabul-20.md`).
⚠ KARARLAR.md 595/600 — kapanmış kararlar `docs/kararlar/ARSIV-2026.md`'ye devredilmeli.

## Devreden borçlar

QA/bağlam 0/18 (`2.9`) · bileşen testi FAZ 9'a · V-19 · V-24 (→6.5b) · V-25 (→6.9b) ·
V-26 (→7.2b) · V-27 (→7.5b) · `3.12b` R2 · varlıklar indekste yok · önizleme yok.

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
