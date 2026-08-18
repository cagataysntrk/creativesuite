# DURUM

> Döngünün her turda okuduğu ve yazdığı tek durum dosyası.
> Bağlam sıfırlanırsa **önce burayı oku** (`CLAUDE.md` → "BAĞLAM COMPACT'LENDİYSE").

```yaml
# ── makine-okunur durum bloğu (LOOP§E) ───────────────────────────────────────
aktif_faz: 15
siradaki_adim: 15.9
son_guncelleme: 2026-08-18
bloke: ["2.9:insan", "3.7:insan", "3.8:insan", "3.14:insan", "4.13b:insan", "5.4b:insan", "5.5b:insan", "6.5b:insan", "6.9b:insan", "7.2b:insan", "7.5b:insan", "7.6b:insan", "7.8b:insan", "8.6:insan", "8.8b:insan", "11.5:insan", "11.6:insan", "11.9:insan", "12.8:insan", "13.3:insan", "8.3b:teknik"]
deneme_sayaci: {}
son_kanit: "KATALOG SISTEMIN MERKEZINE BAGLANDI (FAZ-15.1-15.8 kapali, 15.9 devam). ONUNCU ZINCIR KOPUKLUGU BULUNDU (D-270): panorama render, alti sablonluk katalog, dolu ornek belgeler, secici, uyarlayici ve DOM denetimi yazilmis ve renderPanorama nin URETIM YOLUNDA SIFIR CAGIRANI vardi — mimarinin tamami just uret ten erisilemezdi. Yeni hat instagram-karosel: metin -> sablon secimi (deterministik, icerigin olculen seklinden) -> agent DOLU taslagi uyarliyor -> COMPOSE birlestiriyor -> RENDER tek genis tuval + dilimleme + DOM denetimi -> agent bakiyor -> insan kapisi. GERCEK KOSU UC KUSUR OGRETTI: (1) zorunlu adim sessizce atlandi (prompt bos -> atlandi), (2) eleme kurali iki yonluydu ve 11 satirlik metin ALTI SABLONU birden eledi — kural asimetrik oldu: fazla birlestirilir eksik uydurulamaz, (3) saglayici cikti sekli result/text/content ve ayristirici yalniz text biliyordu. OLCULEN KAZANIMLAR: Archivo genislik ekseni acildi (ayni kelime wdth 62 de 580px, 125 te 1001px = 1.73x) ve punto sabit 82px yerine OLCULEN tavandan turiyor; on alti sabit rgba(255,255,255) silindi (kagit zeminli iki sablonun tum panelleri gorunmezdi); zemin recetesi degrade+isik+tarama+vinyet+gren, gren bantlasmayi 36px ten 8px e indiriyor (olculdu). ESKI YOL HALA YASIYOR: instagram-post + sablon.ts + AileProfili, emeklilik FAZ-15.9 un kalanı."
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
> **tetikleyiciye** bağlandı. Bekleyenler: `2.9` corpus onayı · `3.7` `3.8` V-16 ·
> `4.13b` V-18 · `5.4b` `5.5b` V-21/22 · `6.5b` `6.9b` V-24/25 · `7.2b` `7.6b` `7.8b`
> V-26 · `7.5b` `8.8b` V-27 · `8.6` V-10 · `11.5` `11.9` BiRefNet · `11.6` `13.3` ücretli
> görsel · `12.8` Lanczos+EXIF. ⚠ `3.14` `2.9`'a bağlı.

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

**Serbest üretim YOK.** Hat düzen icat etmiyor: katalogdan şablon SEÇİYOR, agent onun
**dolu taslağını** konuya uyarlıyor. Üretkenlik kompozisyonda değil içerikte.

**15.1–15.8 KAPALI · 15.9 DEVAM · 15.10 belge yazıldı.**

| Adım | Ne yapıldı | Ölçüm |
|---|---|---|
| **15.1** | "Ne kurmalı" ÖLÇÜLDÜ → hiçbir şey (D-269) | üç eksen vardı, kullanılmıyordu |
| **15.2** | `Archivo` genişlik ekseni açıldı; punto ölçülen tavandan | `wdth 62`→580px, `125`→1001px |
| **15.3** | Zemin reçetesi: degrade·ışık·tarama·vinyet·gren | bant 36px → 8px |
| **15.4** | Katalog DOLU taslak: altı `KatalogOrnegi` | her kart kaynak beyan ediyor |
| **15.5** | Altı şablon render edilip BAKILDI | 5 kusur bulundu ve kapatıldı |
| **15.6** | `sablonSec` — içeriğin ölçülen şeklinden | 5 sinyal, gerekçeli |
| **15.7** | `uyarla` — kompozisyon KİLİTLİ, içerik serbest | yapısal alan şemada yok |
| **15.8** | DOM denetimi + düzeltme turu (tavan 2) | 4 ihlal denendi, 4'ü kırmızı |

⚠ **15.9 — ONUNCU ZİNCİR KOPUKLUĞU (D-270).** `renderPanorama`nın üretim yolunda SIFIR
çağıranı vardı: mimarinin tamamı `just uret`ten erişilemezdi. `instagram-karosel` hattı
yazıldı, `bodies.ts`e üç dal bağlandı (`GENERATE` uyarlama · `COMPOSE` katalog ·
`RENDER` panorama), `katalog-dikis.test.ts` çağıranı SAYIYOR.

**Gerçek koşu üç kusur öğretti** (hiçbiri testle bulunamazdı):
1. Zorunlu adım sessizce atlandı (boş istem → `atlandi`) → artık `TEMPLATE_SELECTION_FAILED`
2. Eleme iki yönlüydü; 11 satır ALTI şablonu birden eledi → kural asimetrik
3. Sağlayıcı `{result}` döndürüyor, ayrıştırıcı `{text}` biliyordu → üç ad da tanınıyor

**15.9 KALANI:** eski slayt-başına yolu (`instagram-post` · `sablon.ts` · `AileProfili` ·
`aileSec`) `docs/arsiv/` altına emekliye ayır; `tasarim`/`cesitlilik` kapılarını ve
goldenları panoramaya yönlendir (kapı sayısı DÜŞMEYECEK).

**Koşu:** `sops exec-env secrets/secrets.enc.yaml 'just uret instagram-karosel "<konu>"'`
**Belge:** `docs/referans/katalog-merkezli-hat.md` — akış, seçim tablosu, dosya yapısı.

⚠ FAZ-12 çıkış kriteri hâlâ açık: kabul sayacı 0/20.

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
