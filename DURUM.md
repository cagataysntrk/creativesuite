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
son_kanit: "LOOP§D 2. TUR (son tur, D-79): alti iddiadan ucu DOGRULANDI, ucu ACIK cikti ve kapatildi. (3) BLOKAJ 3 KOD KATMANINDA KAPANMIS AMA YAPILANDIRMA KATMANINDA ACIK KALMIS: hat dosyasi gorsel_yuvasi: true sabitini yaziyor, aileSec te yuvaIstendi olcut oldugu icin HER KONU temel cikiyordu — akici uretimde hala ulasilamazdi. Ustelik bedava seritte gorsel saglayici YOK, yani hat hic dolduramayacagi bir yuva istiyordu. Olcut NE CIZILDIGI ne (diyagram, deterministik ve her kosuda sayfaya iniyor), ne istendigi degil: yuvaIstendi kaldirildi. (5) design.critique HATTA KOSTU (iki kosu status=ok) ama PUANLAR DEFTERE GIRMIYORDU: ozetle beyaz listesi puanlar/toplam/bulgular/reddedilen tasimiyordu, gorsel-yargi ve tasarim-yargi output=null yaziyordu — her kosuda uretilip her kosuda kayboluyordu. Listenin KENDI yorumu eksik bir beyaz liste sessiz bir korluktur diyordu; besinci tekrar. Liste DEFTER_ANAHTARLARI olarak disa acildi ve bekcisi yazildi. (N1) 12.8 ve 13.3 kararsiz blokeydi ve DURUM da gorunmuyordu — D-267 ikisine de tetikleyici verdi; D-266 nin ilkesini bir sonraki dosyada uygulamamistim. (I8) ghost_overlap yapisal olarak duzeldi ama tasarim uzayinda hic kimildamiyor (-33 px sabit); bir olcum degil bir BEKCI oldugu icin ihlal bataryasina girdi, 23 kural. Ayrica plan her kosuda deftere bayat gerekce yaziyordu (panorama henuz bagli degil), duzeltildi. HAT UCTAN UCA KOSTU ve insan onay kapisinda durdu; kalite yesil, dort slaytta da butun okumalar tolerans ici."
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

**FAZ-12 ve FAZ-13'ün ADIMLARI bitti — ama FAZ-12'nin ÇIKIŞ KRİTERİ açık.** Kabul sayacı
**0/20**. "Adımlar tikli" ile "faz kapandı" ayrı şeyler; bağımsız doğrulama bunu blokaj
olarak buldu ve haklıydı. FAZ-13'ün üç çıkış kriteri gösterildi.

**LOOP§D 1. TUR: altı blokaj + on bir ikincil bulgu, hepsi kapatıldı.** En ağır üçü:
1. **`just verify` KIRMIZIYDI** — 12.10 ihlal bataryasının çapasını kendi kırmıştı
   (üçüncü kez). Çapa artık davranışa bağlı; 23 ihlal kırmızı, `verify` rc=0.
2. **`AKICI_AILE` üretimde ERİŞİLEMEZDİ** — `bodies.ts` `TEMEL_AILE` sabitini yazıyordu,
   `g.aile`'yi kimse doldurmuyordu. Yani panorama (12.4) ve degrade (12.9) hiçbir koşuda
   basılmadı: teslimatın tamamı ölü koddu. `aileSec` içerikten seçiyor — kanıt varsa
   `temel`, saf anlatıysa `akici`.
3. **İki metrik kendi kendini ölçüyordu** — `ghost_overlap` her girdide 0, `spacing_offscale`
   her girdide sabit. İkisi de artefakttan ölçülüyor. Boşluk ölçütü de yanlıştı: Fibonacci
   ölçeğini BEN uydurdum, tasarım §12.3'ün 4 px tabanını kullanıyor.

**Ders değişmedi:** ölçüm aracı ölçtüğü şeyden daha sık bozuk — bu turda dört kez daha
(batarya çapası · `ghost_overlap` · `spacing_offscale` · uydurma Fibonacci ölçeği).

⚠ **LOOP§D 2. TUR kaldı** (tavan iki, D-79). Sonra FAZ 9 denetim turları.
⚠ **`design.critique` HATTA KOŞTU** (iki koşu, `status=ok`); hat insan onay kapısında durdu.
⚠ KARARLAR.md 572/600 — kapanmış kararlar `docs/kararlar/ARSIV-2026.md`'ye devredilmeli.

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
