# DURUM

> Döngünün her turda okuduğu ve yazdığı tek durum dosyası.
> Bağlam sıfırlanırsa **önce burayı oku** (`CLAUDE.md` → "BAĞLAM COMPACT'LENDİYSE").

```yaml
# ── makine-okunur durum bloğu (LOOP§E) ───────────────────────────────────────
aktif_faz: 16
siradaki_adim: 16.5
son_guncelleme: 2026-08-18
bloke: ["2.9:insan", "3.7:insan", "3.8:insan", "3.14:insan", "4.13b:insan", "5.4b:insan", "5.5b:insan", "6.5b:insan", "6.9b:insan", "7.2b:insan", "7.5b:insan", "7.6b:insan", "7.8b:insan", "8.6:insan", "8.8b:insan", "11.5:insan", "11.6:insan", "11.9:insan", "12.8:insan", "13.3:insan", "8.3b:teknik"]
deneme_sayaci: {}
son_kanit: "FAZ-16 ACILDI (tam editor + tak-calistir depo) VE 16.1 KAPANDI; FAZ-15'te 15.11 15.12 15.14 tiklendi. D-307: hazir tasarim editoru (Canva/Polotno/tldraw/Penpot) ana duzenleme donguSUNE GIRMIYOR - ortak sorun lisans degil VERI MODELI: hepsi sekil duzenliyor, bizimki KatalogOrnegi alanlarini; bir slaydi orada guzellestirmek o guzelligi bir sonraki konuya TASIMAZ ve Yasa 11/13 birden coker. Penpot tek yonlu disa aktarim hedefi olarak acik. 16.1: metin de gorsel gibi tasinabiliyor, olceklenebiliyor ve SILINEBILIYOR. Kok karar: metne mutlak x/y verilmedi - kompozisyonu yok ederdi (Yasa 13); verilen sey izgaranin USTUNDE sinirli bir pay (kayma +-260 px, punto carpani 0,5-2). Editorde IKI MOD var cunku ikisi ayni anda olamaz: contenteditable bir ogede suruklemek metni SECER. Olculdu: kaydirma dx=120 dy=64 tam isabet, Shift 150 px -> olcek 1.5 tam isabet, silinen ust baslik DOM'dan gercekten dustu (4 -> 3) ve katalog dosyasina da yazildi (ayar satiri EKLENDI, ustBaslik '' oldu, dosya derleniyor ve ayni veri geri okunuyor). AYRICA IKI KOK ONARIM: (1) istemci kodu sablon dizesinden CIKARILDI - yorumdaki tek bir backtick dizeyi kapatiyordu ve bu tuzak depoda ALTI kez isirdi; politika alti kez tutmadi, YAPI tutuyor. (2) 'ayar' uyarlamada korunanlar listesine ISIRMADAN once eklendi - zemin, kolon ve elYazisi ayni tuzaga gercek kosuda dustuler; test kaldirilinca kirmizi donuyor."
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
| **15.11** · yerel arka plan silici; gerçek koşuda RGBA, `matlama` kusuru kalmadı | 2026-08-18 |
| **15.12** · kreatif zemin stok sarısından markanın kendi lacivertine geçti | 2026-08-18 |
| **15.14** · görsel düzenleyici iki modda; şablon modu katalog dosyasına yazıyor | 2026-08-18 |
| **16.1** · metin de taşınıyor, ölçekleniyor, siliniyor — sınırlı pay, mutlak konum DEĞİL | 2026-08-18 |
| **16.4** · `SKILLS.md` + iki beceri dosyası; sıfır bağlamla tek komut | 2026-08-18 |

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
