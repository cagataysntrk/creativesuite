# DURUM

> Döngünün her turda okuduğu ve yazdığı tek durum dosyası.
> Bağlam sıfırlanırsa **önce burayı oku** (`CLAUDE.md` → "BAĞLAM COMPACT'LENDİYSE").

```yaml
# ── makine-okunur durum bloğu (LOOP§E) ───────────────────────────────────────
aktif_faz: 15
siradaki_adim: 15.13
son_guncelleme: 2026-08-18
bloke: ["2.9:insan", "3.7:insan", "3.8:insan", "3.14:insan", "4.13b:insan", "5.4b:insan", "5.5b:insan", "6.5b:insan", "6.9b:insan", "7.2b:insan", "7.5b:insan", "7.6b:insan", "7.8b:insan", "8.6:insan", "8.8b:insan", "11.5:insan", "11.6:insan", "11.9:insan", "12.8:insan", "13.3:insan", "8.3b:teknik"]
deneme_sayaci: {}
son_kanit: "KATALOG TASARIM TURU — ALTI SABLON HAZIR (FAZ-15.13). Depo sahibinin on maddelik brief i kapandi: sayac etiketleri kalkti; mavi cividiktan cikti (chroma 0,192->0,132), zemin eskitmeli lacivert, amber->BAKIR; display yuzu Archivo->Bricolage Grotesque, el yazisi Caveat; alti sablonda gren+vinyet ve kartlarda inset isik; dev sayilarda negatif tracking; asimetri; ikonlar elle cizimden LUCIDE ye. SONRA OLCUMLE UC BUYUK KUSUR DAHA KAPANDI: (1) govde puntosu 23-27 px idi (tuvalin %1,7si, telefonda ~9pt) -> 34 px taban + oranlar; govde genisligi kolondan BAGIMSIZDI ve tasiyordu. (2) ton araligi: referans p1=0 p99=255 std 79, bizimki editoryal de 157-235 std 19 idi; ink-950 0,15->0,055 (gercek siyah) ve editoryal kart zeminleri kagit->soluk mavi->acik gri->MUREKKEP oldu; std editoryal 19,8->87,8 · donen 27,9->89,1. (3) HAYALET alti sablondan da kalkti: salinan alan siniri (y%44-86) ile sabit dev rakam yan yana yasayamiyor; uyarla artik modelin hayalet yazmasini engelliyor ve denetime hayalet-carpisma geldi. AYRICA IKI URETIM KUSURU: kesim ayraci dilimlerin SIFIRINCI SUTUNUNA siziyordu (gercek slaytta +11,3 parlaklik olculdu, yayinlanmis) ve .ray gorselin ALTINDA kalip marka imzasini ortuyordu. Onizleme: derived/katalog-onizleme/. ACIK: 2x render kaliteyi yukseltiyor ama cikti sozlesmesi 1080x1350 ve kucultuc yok; gorsel kutusu en/boyu kaynaktan turemeli; sahne oklarinin bukumu 4320px tuvalde duz kaliyor."
```

## Neredeyiz

**FAZ 0–8 kapandı** (5 ve 6 şartlı: D-206 · D-217).
**44 kapı · 23 ihlal kırmızı · 1789 test.**
Faz tikleri faz dosyalarında; `git log` tek başına yol haritasıdır (D-85).

> **Kök neden, ON tekrar:** kod yazılır, üretim yolunda çağıranı olmaz — D-182 · D-190 ·
> D-224 · D-250 · D-261 · **D-270 (mimarinin tamamı)**. Zincir için sorulur, adım için değil.
> ⛔ **YİRMİ ADIM İNSAN GİRDİSİ BEKLİYOR** — `2.9` `3.7` `3.8` `3.14` `4.13b` `5.4b`
> `5.5b` `6.5b` `6.9b` `7.2b` `7.5b` `7.6b` `7.8b` `8.6` `8.8b` `11.5` `11.6` `11.9`
> `12.8` `13.3`. Sınıfı `insan` (D-157): plan hatası değil dış bağımlılık. ⚠ `3.14`
> `2.9`'a bağlı; `11.5`/`11.9` BiRefNet, `11.6`/`13.3` ücretli görsel bekliyor.

## Tamamlananlar

> **Yalnız AKTİF faz** (D-85); öncekiler faz dosyalarındaki tiklerde. FAZ 0+1: 51 ·
> FAZ 2: 12/13 · FAZ 3: 12/15 (D-158) · FAZ 4: 17/17 · FAZ 5: 8/10 (D-206) ·
> FAZ 6: 10/12 (D-217).

| Adım | Tarih |
|---|---|
| **15.1** · "ne kurmalı" ÖLÇÜLDÜ → hiçbir şey; üç eksen vardı ve kullanılmıyordu | 2026-08-18 |
| **15.2** · genişlik ekseni açıldı; punto sabit 82px değil ÖLÇÜLEN tavandan | 2026-08-18 |
| **15.3** · zemin reçetesi; gren bantlaşmayı 36px→8px indiriyor (ölçüldü) | 2026-08-18 |
| **15.4** · katalog DOLU taslak; altı örnek belge, hepsi kaynak beyan ediyor | 2026-08-18 |
| **15.5** · altı şablon render edilip BAKILDI; beş kusur bulundu ve kapatıldı | 2026-08-18 |
| **15.6** · `sablonSec` içeriğin ölçülen şeklinden; gerekçesiz seçim yok | 2026-08-18 |
| **15.7** · `uyarla`; kompozisyon KİLİTLİ, yapısal alan şemada YOK | 2026-08-18 |
| **15.8** · DOM denetimi + düzeltme turu; 4 ihlal denendi, 4'ü kırmızıya döndü | 2026-08-18 |
| **15.10** · kullanım belgesi + mimari denetimi; hat gerçek koşu defterine dayanıyor | 2026-08-18 |

## Sıradaki adım

## FAZ 15 — KATALOG MERKEZLİ ÜRETİM (D-268 · D-269 · D-270)

**Serbest üretim YOK.** Katalogdan şablon SEÇİLİR, agent onun **dolu taslağını** uyarlar.
**15.1–15.8 + 15.10 KAPALI · 15.9 DEVAM.** Belge: `docs/referans/katalog-merkezli-hat.md`

| Adım | Ne yapıldı | Ölçüm |
|---|---|---|
| **15.1** | ne kurmalı → HİÇBİR ŞEY (D-269) | üç eksen vardı, kullanılmıyordu |
| **15.2** | genişlik ekseni; punto ölçülen tavandan | `wdth 62`→580px, `125`→1001px |
| **15.3** | zemin reçetesi | bant 36px → 8px |
| **15.4** | katalog DOLU taslak, altı örnek | her kart kaynak beyan ediyor |
| **15.5** | altı şablon render edilip BAKILDI | 5 kusur kapatıldı |
| **15.6** | `sablonSec` içerik şeklinden | 5 sinyal, gerekçeli |
| **15.7** | `uyarla` — kompozisyon KİLİTLİ | yapısal alan şemada yok |
| **15.8** | DOM denetimi + düzeltme turu | 4 ihlal denendi, 4'ü kırmızı |

### 15.9 — HAT UÇTAN UCA KOŞUYOR ✓

`sops exec-env secrets/secrets.enc.yaml 'just uret instagram-karosel "<konu>"'`
→ 12 adım yeşil · görsel `cloudflare-workers-ai`ten · 4 varlık damgalandı ·
insan onay kapısında durdu. Defterde `sablonId: 'sahne'`, `kalite` bir kusur buldu
(`marka fontunun kapsamı dışında: ✓`) ve onu insana taşıdı.

⚠ **ONUNCU ZİNCİR KOPUKLUĞU (D-270):** `renderPanorama`nın üretim yolunda SIFIR çağıranı
vardı — mimarinin tamamı `just uret`ten erişilemezdi.

**Bağlarken çıkan ALTI kopuk halka** — hiçbiri testle, hepsi GERÇEK KOŞUYLA bulundu:
zorunlu adım sessizce atlandı · eleme iki yönlüydü ve 11 satır altı şablonu birden eledi ·
istem JSON şemasını hiç söylemiyordu · sağlayıcı `{result}` döndürüyordu · brief kurucusu
eski `tasarimPlani`ni arıyordu · `.find()` ilk (boş) panoramayı alıyordu.

⚠ **Hat iki kez 21 dakika ASILDI (D-272):** `claude` CLI daemon'u stdout borusunu tutuyor,
Node `close` yaymıyor ve 10 dakikalık zaman aşımı da AYNI olaya bağlıydı. `spawn.ts`
artık `exit`i de dinliyor; ihlal testi asılmayı yeniden üretiyor.

**Eski yol emekli (D-271), ÖLÇÜLEREK:** `sablon-turu.mjs` arşivde, `instagram-carousel`
emekli işaretli. ⚠ `static.ts`/`AileProfili` KALDI: `doc.aile` orada on altı yerde ve
**sekiz hat** ondan besleniyor. Emekli olan karosel için AİLE SEÇİMİ, render değil.

**15.9 KALANI:** `denetimTuru` yazıldı, test edildi, hatta BAĞLI DEĞİL — kusurlar
rapor ediliyor, otomatik düzeltilmiyor. ⚠ FAZ-12 kabul sayacı hâlâ 0/20.

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
