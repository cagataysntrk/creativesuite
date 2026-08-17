# DURUM

> Döngünün her turda okuduğu ve yazdığı tek durum dosyası.
> Bağlam sıfırlanırsa **önce burayı oku** (`CLAUDE.md` → "BAĞLAM COMPACT'LENDİYSE").

```yaml
# ── makine-okunur durum bloğu (LOOP§E) ───────────────────────────────────────
aktif_faz: 11
siradaki_adim: 11.7
son_guncelleme: 2026-08-17
bloke: ["2.9:insan", "3.7:insan", "3.8:insan", "3.14:insan", "4.13b:insan", "5.4b:insan", "5.5b:insan", "6.5b:insan", "6.9b:insan", "7.2b:insan", "7.5b:insan", "7.6b:insan", "7.8b:insan", "8.6:insan", "8.8b:insan", "8.3b:teknik"]
deneme_sayaci: {}
son_kanit: "FAZ 10 ACILDI (D-255): 'uretebiliyor' ile 'iyi' ayri sorular; ikincisinin kapisi YOKTU. Bu hafta uc kusur bunu kanitladi — metin egri sinirini kesiyordu, hayalet rakam navigasyonla cakisiyordu, kapak 12 satirlik duvardi; 41 kapinin hicbiri kirmiziya donmedi, ucunu de PNG'ye tek tek bakarak buldum. Karosel gramerini yazdim (D-254): kompozisyon SlaytKimligi'nden TURETILIYOR, modelde rol var cizim yok — ornament alani bilerek EKLENMEDI, belge modeline isaretleme sokmak R-30'u bir sablon diline cevirirdi. Dort kusur olculerek duzeltildi: egri salinimi SINIR_MIN..SINIR_MAX dar bandina alindi ve metin guvenliMetinYuzdesi ile bandin disina kilitlendi (ikisi tek dosyada, ayri olsalar biri degisip digeri unutulurdu); hayalet rakam metnin karsi tarafina ve alt seridin ustune; kapak alta yasli, govde ortali; icerikPromptu artik slayt basina uzunluk disiplini istiyor (kapak 8/govde 30/kapanis 14 kelime) cunku sayfalayici tasmayi boler ama neyin BASLIK oldugunu bilemez. SAHA TARAMASI (docs/research/8-karosel-oss): sekiz agent destekli karosel aracinin sekizi de LLM->HTML/CSS->Chromium->PNG kuruyor — mimari dogrulandi, bagimsiz yakinsama. FORK YOK: Open Carrusel 423 yildiz ama created_at == pushed_at (15 Nis, dort aydir tek commit yok), Slide{html:string} yani kayit markup (golden metrik ve Turkce kapilari biter), agent'a --allowedTools Bash veriliyor, font Google'dan cekiliyor ve dususte SESSIZCE sistem fontuna iniyor. Hicbirinde Turkce icin tek satir rehberlik yok. OLCULDU: 5 slayt ayri tarayici 3656ms, tek oturum 704ms = 5.2x — slayt basina Chromium acmak gercek bir kusur ve alandaki arac bunu bizden once cozmus. SIRADA 10.1 tarayici oturumu (singleton DEGIL, kapsamli oturum: browser.ts'teki finally sizinti garantisi korunuyor)."
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
| **11.1** · akış diyagramı fotoğrafın yerine; `chart` değil `diagram` | 2026-08-17 |
| **11.2** · geometrik süsleme dağarcığı; kapak süssüz, slayt başına ≤2 öge | 2026-08-17 |

## Sıradaki adım

**FAZ 11 — GÖRSELLİK DİLİ** (D-261). FAZ-10.7'de bulduğum görsel kusurların çoğu tek
kökten geliyordu: **oraya ait olmayan bir öge**. Fotoğrafı dört kez yamadım (kenara
taşırma · boşluk doldurma · sayfalama bütçesi · monokrom brief) ve dördü de belirtiye
yamaydı. Doğru soru "bu fotoğraf neden burada?" idi; cevabı: **bağlı olan tek görsel yol
oydu.** `chart`/`diagram` çizicileri yazılıydı, üretim hattı sıfır tane üretiyordu.

ÖLÇÜLDÜ: kendi referanslarımızda fotoğraf yok (doku payı %6,8). Kullanıcının dört yeni
örneğinde de dikdörtgen serbest fotoğraf yok.

**11.1 KAPANDI** — akış diyagramı fotoğrafın yerine geçiyor. `chart` değil `diagram`,
çünkü grafik sayı ister ve R-32 kaynaksız sayıyı yasaklıyor. 20 test.

**PLAN GENİŞLEDİ — FAZ-12 ve FAZ-13 yazıldı.** Yetenek envanteri (`docs/referans/`) ve
araç envanteri (`docs/research/10-...`) çıkarıldı, her ⛔ satırı bir adıma bağlandı.
⚠ İki lisans tuzağı: **BRIA RMBG CC BY-NC** (ticari yasak, MIT olan BiRefNet kullanılacak),
**Potrace GPL** (VTracer MIT kullanılacak).
⚠ Denetimde çıkan asıl boşluk envanterde hiç yoktu: **estetiği kim yargılıyor?** → FAZ-13.

**FAZ-14 = OMURGA, ve ERKEN yapılmalı:** metin → tasarım planı → icra → denetim → tamamlama.
Şu an metinle yerleşim aynı adımda kararlaşıyor ve arada **denetlenebilir bir artefakt yok**;
*"bu slayt neden böyle tasarlandı?"* sorusunun cevabı hiçbir yerde yazılı değil.
Zengin bir dağarcığın seçicisi yoksa zenginlik gürültüdür. Modele gönderme SON çare:
plan yalnız `deterministik: false` işaretli yuvaları modele verir.

**11.2 KAPANDI** — süsleme dağarcığı (nokta ızgarası · halka · taralı daire · blob ·
kare), SVG, sıfır bağımlılık, kapak süssüz, slayt başına ≤2 öge. 8 test + ihlal.

⚠ **ENVANTER:** render katmanında `object-fit` DIŞINDA hiçbir görsel işleme
kullanılmıyordu — `filter`, `mix-blend-mode`, `clip-path`, `feColorMatrix` hepsi
Chromium'da standart ve bedava. Plana eklendi (11.7–11.9).

**SIRADAKİ 11.7** — duotone: fotoğrafın parlaklığı marka amber↔mürekkep eksenine
eşlenir. Marka tutarlılığını YAPISAL çözüyor; brief'e "monokrom yaz" diye yalvarmak
yerine çıktıyı dönüştürüyor. Sonra 11.8 doku/derinlik → 11.3 ikon → 11.4 yuvalar.

⚠ **FAZ-10.7 kabul koşusu FAZ 11 dilinin üstünde tekrarlanacak** — görsellik değişti,
eski koşular güncel çıktıyı temsil etmiyor.

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
