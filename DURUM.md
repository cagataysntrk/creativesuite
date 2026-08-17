# DURUM

> Döngünün her turda okuduğu ve yazdığı tek durum dosyası.
> Bağlam sıfırlanırsa **önce burayı oku** (`CLAUDE.md` → "BAĞLAM COMPACT'LENDİYSE").

```yaml
# ── makine-okunur durum bloğu (LOOP§E) ───────────────────────────────────────
aktif_faz: 10
siradaki_adim: 10.6
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
| **FAZ 7 (9/9)** · yayın hattı; iki denetim turu (D-222·223·224) | 2026-08-16 |
| **8.1** · dik varyant matrisi; diklik OFAT'la ölçülüyor (D-225) | 2026-08-16 |
| **8.1** · matris ÇÖZÜCÜDE yoktu; `just plan` artık ×7 basıyor (D-228) | 2026-08-16 |
| **8.1b** · genişletme tek fonksiyon; plan ne sayarsa koşu onu koşar (D-240) | 2026-08-16 |
| **8.2** · reklam linter'ı; ikinci şahıs × özellik kesişimi | 2026-08-16 |
| **8.3** · uyum panosu; ifşa kapısı yayın hattına bağlandı | 2026-08-16 |
| **8.4** · haftalık doctor; damga YOK — alarm saati, doğruluk değil | 2026-08-16 |
| **8.5** · proaktif katman; gözlemsiz öneri kurulamıyor, tavan 3 | 2026-08-16 |
| **8.7** · geri yükleme tatbikatı; ÜÇ gerçek kusur buldu | 2026-08-16 |
| **8.8** · rotasyon tablosu kodla senkron; kapı 5 anahtar buldu | 2026-08-16 |
| **8.9** · yerel MCP (D-226 kabul, dar); yükleme bağlı, tek yazma yolu | 2026-08-16 |
| **10.1** · karosel başına tek tarayıcı; 4.9x, çıktı bayt bayt özdeş | 2026-08-17 |
| **10.2** · referans ölçüldü; T9/T11 türetilemez, T10 görseli dışlamalı | 2026-08-17 |
| **10.2b** · punto ölçüldü: sütun %62, h1 64 px; 3 kusur kapandı | 2026-08-17 |
| **10.3** · `tasarim` kapısı: 23 okuma, 4 ihlal kırmızı, grameri denetliyor | 2026-08-17 |
| **10.4** · düzen içerikten seçiliyor; liste 3 slayttan 2'ye indi | 2026-08-17 |
| **10.4b** · dört düzen dört kompozisyon; tırnak, madde ritmi, kanıt şeridi | 2026-08-17 |
| **10.5** · `image.critique`: 3 bulgu, 0 red; saçaklanma %6.6→%0 (D-256) | 2026-08-17 |

## Sıradaki adım

**FAZ 10 — TASARIM KATMANI** (D-255). FAZ 3 "üretebiliyor mu"yu kapattı, "iyi mi"yi
değil; ikincisinin kapısı yoktu ve bu hafta üç kusur bunu kanıtladı.

**10.1–10.3 KAPANDI.** Ayrıntı `docs/fazlar/FAZ-10.md` ve üretilmiş raporlarda
(`docs/referans/tasarim-temeli.md`, `tip-olcegi.md`).
· **10.1** oturum 4.9x. · **10.2** referans ölçüldü: T9/T11 türetilemez, T10 görseli
  dışlamalı; ölçüm aracının kendisi bozuktu (%97.8).
· **10.2b** punto: %36'da hiçbiri sığmıyordu → bant %69–78, sütun %62, h1 64px.
· **10.3** `tasarim` kapısı 23 okuma, 4 ihlal kırmızı.
· **10.4** düzen İÇERİKTEN: liste 3→2 slayt. `rings` modül döngüsü yakaladı; test
  Türkçe hatamı buldu (desen `4%` arıyordu, Türkçede `%4`).
· **10.4b** dört düzen dört KOMPOZİSYON. Düzen `SlaytKimligi.duzen`de: rol, çizim
  değil; adlar contracts'a taşındı. İki kusur GÖRÜLEREK bulundu.

· **10.5** `image.critique` YETENEK (fiil değil), kutu ZORUNLU, red sayılıyor. Gerçek
  koşu 3 bulgu, üçü de doğru: **saçaklanma %6,6→%0,0** (hiçbir metrik görmemişti, HER
  varlığı etkiliyordu) · boşluk hiyerarşisi · çizgi kontrastı. `Read` aracı ölçülerek
  gerekti: araçsız 5 dk'da düştü, araçla 18 sn (D-256).

**SIRADAKİ 10.6** — referans görselden şablon PARAMETRESİ (sınırlayıcı
kutulu) → 10.6 referans→parametre → 10.7 **20 ardışık kabul koşusu**.

**FAZ 8 açık kalanı:** `8.3b` BLOKE:teknik (`7.2b` gerçek yayınına bağlı), `8.6`
BLOKE:insan (V-10 hukukçu).

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
