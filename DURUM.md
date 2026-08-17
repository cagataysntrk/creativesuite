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
son_kanit: "MIMARI DEGISIM KAYIT ALTINA ALINDI (D-268): KATALOG MERKEZLI URETIM, SERBEST URETIM YOK. Tek gramer + parametre yaklasimi yedi aile verdi ve izgaraya bakinca TEK TASARIMIN YEDI BOYASI gorundu; kompozisyon (bolme, aci, akis, oge yerlesimi) sablon.ts e gomuluydu ve aile yalniz renk/susleme diyebiliyordu. Ayrica sureklilik IMA EDILIYORDU — her slayt ayri render edilirken surekli gorunmek imkansiz. YENI MODEL: panorama.ts, N x 1080 TEK TUVAL sonra dilimleme (translateX + N ekran goruntusu, goruntu kutuphanesi bagimliligi yok); kesimi asan oge ICERIKTEN turer (veri egrisi, kemer, kesik oznenin kolu, akan oklar). katalog.ts alti sablon (bes referanstan olculdu), hedef 20-30; her kayit gorsel ihtiyacini ILAN EDIYOR ve kullanilabilir bayragi tasiyor. GORSEL URETIMI CALISIYOR: cloudflare-workers-ai bedava serit, sops exec-env ile. Kesik ozne icin arka plan silme modeli GEREKMEDI — brief duz siyah zemin istiyor, alfa matlama luma anahtariyla turetiliyor. GARANTI KATMANI DEGISMEDI: kontrast, Turkce tasma, chroma tavani, R-20 hala olcum olarak ustte; kartRenkleri metin rengini zeminden TURETIYOR. Eski yol (sablon.ts + AileProfili + slayt basina render) yasiyor, tasarim kapisi ve goldenlar ona bagli; yeni sablonlar KATALOGA yaziliyor, birlestirme ayri adim. KARARLAR 595/600 idi — D-255..D-258 arsive tasindi (442 -> D-268 ile 491), atif butunlugu korundu. CLAUDE.md ye 13. yasa ve katalog yolu eklendi."
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
| **13.1** · kompozisyon ölçümü RAPOR; ilk metrik gramerin ritmini kusur sanıyordu | 2026-08-17 |
| **13.2** · katman yığını VERİ; üç z-index beraberliği kazaydı, çıktı piksel-özdeş | 2026-08-17 |
| **13.4** · çeşitlilik parmak izi; iki aile 6 alanın YALNIZ 2'sinde ayrışıyor | 2026-08-17 |
| **13.5** · `design.critique` estetik eksen; ölçüm ve yargı aynı kusuru buldu | 2026-08-17 |
| **13.6** · kör kabul; AYNI SINIF ama yargıcın gürültüsü ölçülen farkla aynı boyda | 2026-08-17 |

## Sıradaki adım

## ⚠ MİMARİ DEĞİŞTİ: KATALOG MERKEZLİ ÜRETİM (D-268)

**Serbest üretim YOK.** Hat bir düzen icat etmiyor; **kataloğdan bir şablon seçiyor**,
içeriği ve görselleri onun yuvalarına üretiyor. Üretkenlik kompozisyonda değil,
**içerikte ve görsellikte.**

**Neden değişti:** tek gramer + parametre yaklaşımı yedi "aile" verdi ve ızgaraya bakınca
**tek tasarımın yedi boyası** göründü. Kompozisyon (bölme, açı, akış, öge yerleşimi)
`sablon.ts`'e gömülüydü; aile yalnız renk ve süsleme diyebiliyordu. Ayrıca süreklilik
**ima ediliyordu** — her slayt ayrı render edilirken sürekli görünmek imkânsız.

**Yeni model — kesintisiz (seamless) karosel:**
- `packages/render/src/panorama.ts` — `N × 1080` **tek tuval**, sonra dilimleme
  (`translateX` + N ekran görüntüsü; görüntü kütüphanesi bağımlılığı yok)
- **Kesimi aşan öge İÇERİKTEN türer**: veri eğrisi · kemer dizisi · kesik öznenin kolu ·
  akan oklar. Süs olsaydı silinebilirdi.
- `packages/contracts/src/katalog.ts` — **altı şablon**, hedef 20–30. Beşi referans
  örneklerden ölçüldü, biri panorama referansından.

| Şablon | Kaynak | Taşıyıcı | Görsel |
|---|---|---|---|
| `veri-hikayesi` | panorama ref. | veri eğrisi | — |
| `akan-alan` | ornek-5 | yatay eğri sınır | — |
| `sahne` | ornek-1 | kesik özne + oklar | `kesik` |
| `memphis` | ornek-3 | leke dili | `kesik` |
| `donen` | ornek-2 | renk rotasyonu | `daire` |
| `editoryal` | ornek-4 | tam kaplama fotoğraf | `tam` |

**Görsel üretimi ÇALIŞIYOR:** `cloudflare-workers-ai`, bedava şerit. Koşular
`sops exec-env secrets/secrets.enc.yaml "..."` ile başlatılır — anahtarsız koşuda hat
*"yerel önkoşul sağlanmadı"* der ve bu **sağlayıcı yokluğu DEĞİLDİR** (bir tur bu
karıştırıldı). Kesik özne için arka plan silme modeli gerekmiyor: brief düz siyah zemin
istiyor, alfa `matlama` işlemiyle o zeminin parlaklığından türetiliyor.

⚠ **Görsel brief'i İNGİLİZCE ve BÜYÜK HARFSİZ** — R-20 muhafızı büyük harfli öbeği
"metin çizdirme isteği" sayıyor ve `no texture` içindeki `no text` alt dizesini yakalıyor.

**Sıradaki iş:** katalog 6 → 20-30. Her yeni şablon: referans oku → panorama modeline
kur → gerçek içerik+görselle render et → **BAK** → `kullanilabilir` bayrağını ölçümle koy.
Çıktılar `content/katalog/` (türetilmiş, gitignore'lu).

⚠ Eski yol (`sablon.ts` + `AileProfili` + slayt başına render) YAŞIYOR: `tasarim` kapısı
ve golden'lar ona bağlı. **Yeni şablonlar kataloğa yazılır**; ikisini birleştirmek ayrı adım.
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
