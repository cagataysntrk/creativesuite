# DURUM

> Döngünün her turda okuduğu ve yazdığı tek durum dosyası.
> Bağlam sıfırlanırsa **önce burayı oku** (`CLAUDE.md` → "BAĞLAM COMPACT'LENDİYSE").

```yaml
# ── makine-okunur durum bloğu (LOOP§E) ───────────────────────────────────────
aktif_faz: 13
siradaki_adim: 13.6
son_guncelleme: 2026-08-17
bloke: ["2.9:insan", "3.7:insan", "3.8:insan", "3.14:insan", "4.13b:insan", "5.4b:insan", "5.5b:insan", "6.5b:insan", "6.9b:insan", "7.2b:insan", "7.5b:insan", "7.6b:insan", "7.8b:insan", "8.6:insan", "8.8b:insan", "8.3b:teknik"]
deneme_sayaci: {}
son_kanit: "FAZ-13.5 KAPANDI — design.critique. PLANIN ONCULU ESKIMISTI: image.critique zaten RENDER EDILMIS slaydi yargiliyor; eksik olan yuzey degil EKSEN — var olan alti kategori kusurun YOKLUGUNU, bu adimin altisi iyinin VARLIGINI ariyor. sikicilik DEGIL carpicilik: yonu kardeslerine ters tek alan ortalamayi sessizce bozar, alti alanda da yuksek = iyi. Dogrulayici YENIDEN YAZILMADI (R-05): bulguyuDogrula kategori dagarcigini parametre aliyor. Eksik kategori sessizce 0 sayilmiyor, atlanmiyor da; toplamPuan eksikte null cunku bes kategoriden ortalama altidan ortalamayla karsilastirilamaz (13.6 tam bunu yapacak). GERCEK MODELLE KOSULDU: alti kategori puanlandi, sifir reddedilen, toplam 3.67/5. denge 4/5 gerekcesi dev rakamin sag-alt kosede yigilmasi kompozisyonu asagi-saga cekiyor — 13.1 in optik merkez olcumu de 10-15 puan ASAGIDA demisti; IKI AYRI YONTEM AYNI BULGU. HAT KOSUSU BIR S16 IHLALI ORTAYA CIKARDI: adaptor --model gecmiyordu, CLI varsayilanina bagliydi, o varsayilan kaldirilan bir modele sabitliydi ve her cagri 404 verdi; hat ilk GENERATE adiminda durdu ve STDERR BOSTU cunku hata metni stdout JSON inde. Model adaptore sabitlendi (env ezebiliyor), hata metni stdout tan okunuyor, cikis kodu 0 iken is_error true hali de yakalaniyor. 12 test. Tam hat kosusu 28 dk da bitmedi (her claude cagrisi yavas) — devam ediyor."
```

## Neredeyiz

**FAZ 0–8 kapandı** (5 ve 6 şartlı: D-206 · D-217).
**43 kapı · 22 ihlal kırmızı · 1366 test.**
Faz tikleri faz dosyalarında; `git log` tek başına yol haritasıdır (D-85).

> **Kök neden, dört tekrar:** kod yazılır, üretim yolunda çağıranı olmaz — D-182 ·
> D-190 · D-224 · D-250. **"Çağıran var mı" ZİNCİR için sorulur**, tek adım için değil.
> FAZ 10'un mayını farklı: kod ÇAĞRILIYOR ama kimse doğruluğunu ölçmüyor.

> ⛔ **ON DÖRT ADIM İNSAN GİRDİSİ BEKLİYOR** — `2.9` · `3.7` · `3.8` · `3.14` · `4.13b` ·
> `5.4b` · `5.5b` · `6.5b` · `6.9b` · `7.2b` · `7.5b` · `7.6b` · `7.8b` · `8.6`.
> Sınıfları `insan` (D-157), o yüzden LOOP§G üçlü kuralına saymazlar: on dördü de plan
> hatası değil, planın `V-nn` olarak önceden kaydettiği dış bağımlılıklar. Döngü
> bağımsız adımlarla devam ediyor, ama bu ilan her turda burada durur.
>
> | Adım | Bekleyen | | Adım | Bekleyen |
> |---|---|---|---|---|
> | `2.9` | `just onayla corpus/*/*.md` | | `6.5b` | V-24 şelale anahtarları |
> | `3.7` `3.8` | V-16 anahtar (+~$3) | | `6.9b` | V-25 gerçek prospect |
> | `3.14` | `2.9`'a bağlı | | `7.2b` `7.6b` `7.8b` | V-26 Meta token |
> | `4.13b` | V-18 Tailscale+Telegram | | `7.5b` `8.8b` | V-27 OAuth kaydı |
> | `5.4b` `5.5b` | V-21/V-22 ses+altyazı | | `8.6` | V-10 hukukçu |

## Tamamlananlar

> **Bu tablo yalnız AKTİF fazı gösterir** (D-85). Önceki fazlar faz dosyalarındaki
> tiklerdedir ve `git log` tek başına yol haritasıdır.
>
> FAZ 0+1: 51 · **FAZ 2: 12/13** · **FAZ 3: 12/15** (şartlı, D-158) · **FAZ 4: 17/17** ·
> **FAZ 5: 8/10** (şartlı, D-206) · **FAZ 6: 10/12** (şartlı, D-217; `6.5b` V-24,
> `6.9b` V-25). Tikler faz dosyalarında.

| Adım | Tarih |
|---|---|
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

**FAZ 12 KAPANDI** (12.8 hariç, `bloke: karar` — model ağırlığı indirme, §16 sınavı).
FAZ 11'de 11.5/11.6/11.9/11.10 `bloke: karar`. **FAZ 13 açık: 13.2'den devam.**

**Bu turun tekrar eden dersi:** ölçüm aracı, ölçtüğü şeyden daha sık bozuk çıkıyor.
`column_in_band` kendi kendini ölçüyordu (hiçbir girdide kırmızıya dönemezdi), ilk göz
yolu metriği gramerin KASITLI ritmini kusur raporluyordu, `off_palette` sürekli bir
duotone rampasına yanlış enstrümandı. Üçü de yeşildi ve üçü de hiçbir şey söylemiyordu.

⚠ **Kabul sayacı 0/20.** FAZ 11–13 render'ı değiştirdi; eski koşular güncel çıktıyı
temsil etmiyor. FAZ-10.7 kabul koşusu yeni dilin üstünde tekrarlanacak.
⚠ **FAZ-12/13 kapanışında bağımsız doğrulama** (LOOP§D, en fazla İKİ tur).
⚠ KARARLAR.md 561/600 — kapanmış kararlar `docs/kararlar/ARSIV-2026.md`'ye devredilmeli.

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
