# DURUM

> Döngünün her turda okuduğu ve yazdığı tek durum dosyası.
> Bağlam sıfırlanırsa **önce burayı oku** (`CLAUDE.md` → "BAĞLAM COMPACT'LENDİYSE").

```yaml
# ── makine-okunur durum bloğu (LOOP§E) ───────────────────────────────────────
aktif_faz: 7
siradaki_adim: 7.2
son_guncelleme: 2026-08-16
bloke: ["2.9:insan", "3.7:insan", "3.8:insan", "3.14:insan", "4.13b:insan", "5.4b:insan", "5.5b:insan", "6.5b:insan", "6.9b:insan"]
deneme_sayaci: {}
son_kanit: "7.1 KAPANDI. Spec tablosu 3.15 te, drift denetcisi 4.17 de kurulmustu; 7.1 in isi kriteri OLCMEKTI ve olcerken BOSLUK cikti (D-215): specAgeDays yalniz satirin verifiedAt ini okuyor, oysa safeArea nin KENDI sourceUrl + verifiedAt i var — guvenli alani bir yil geriye alinmis satir icin denetci 1 GUN diyordu. Guvenli alan olculeri Reels tasarim kilavuzundan gelir ve platform olcusunden BAGIMSIZ degisir. Artik specStaleness iki tarihi AYRI dondururyor ve doctor iki ayri bulgu uretiyor; guvenli alani olmayan satirda safeAreaDays null, 0 DEGIL. KANIT: tarih geriye alininca just doctor ⚠ [spec] GUVENLI ALAN 592 gunluk dedi, geri alininca bulgu kayboldu. DERS UCUNCU KEZ: yeni bir alan eklemek onu OKUMASI GEREKEN her yeri guncellemeyi gerektirir — bu turda ayni siniftan IKI hata bulundu (chart blogu lexicon da, safeArea.verifiedAt drift denetcisinde) ve ikisinde de derleyici sustu. ONCEKI: 6.9 ZINCIRI KAPANDI. prospectDeckZinciri bes kapiyi SIRAYLA kosuyor ve ILK HATADA duruyor; YENI KURAL YAZMIYOR — her kural kendi sahibinde, burada olan tek sey sira. Sira MALIYET sirasi: tazelik bir tarih karsilastirmasi, lexicon butun belgeyi tariyor; ikisi birden bozuksa TAZELIK konusuyor. UCTAN UCA KANIT tek kosuda: gercek urun cekimi (yerel sunucu, ayni Chromium) + grafik + PDF, zincir 5/5 GECTI, 25862 bayt 1 sayfa. Iki ihlal dogru kapilarda durdu: kaynaksiz sayi → lexicon, 15 gunluk kaynak → tazelik. GERCEK DELIK BULUNDU: lexicon linter inin metin() fonksiyonu GRAFIK BLOGUNU gormuyordu — 6.2 de blok tipini ben ekledim, linter i guncellemedim, switch olmadigi icin derleyici susmustu; Fire oranini %40 dusurduk basligi tamamen kaciyordu. Duzeltildi ve kanitlandi: duzeltme geri alininca 2 test kirmizi. 6.9 un ✅ i GERCEK prospect istiyor — o insan girdisi (V-25), uydurulmus sirket dogruluk kaynagina giren kurgudur. Oncesi icin git log ve docs/fazlar/."
```

## Neredeyiz

**FAZ 7 BAŞLADI.** FAZ 6 şartlı kapalı: dokuz adım tikli, `6.5b` (V-24) ve `6.9b` (V-25)
bilinçli `BLOKE: insan`. **Fazın çıkış kriteri karşılanmadı ve tikle ÖRTÜLMEDİ** — "adı
geçen gerçek bir şirkete deck gönderildi" bir insan eylemidir; zincir uçtan uca
doğrulandı ama teslim edilmedi. **36 kapı · 11 ihlal kırmızı.**

> **Çıkış kriterinin bir maddesi karşılanmadı ve tikle ÖRTÜLMEDİ** (D-206):
> `ffprobe` **aac** doğrulayamıyor — ses akışı yok, çünkü TTS (`5.4b`, V-21) ve ASR
> (`5.5b`, V-22) insan girdisi bekliyor. Video tarafı ölçüldü: h264 · yuv420p ·
> 1920×1080. "İzlendi" kısmı bir insan eylemidir; sistem onu iddia edemez.

> ⛔ **DOKUZ ADIM İNSAN GİRDİSİ BEKLİYOR** — `2.9` · `3.7` · `3.8` · `3.14` · `4.13b` ·
> `5.4b` · `5.5b` · `6.5b` · `6.9b`.
> Sınıfları `insan` (D-157), o yüzden LOOP§G üçlü kuralına saymazlar: dokuzu da plan
> hatası değil, planın `V-nn` olarak önceden kaydettiği dış bağımlılıklar. Döngü
> bağımsız adımlarla devam ediyor, ama bu ilan her turda burada durur.
>
> | Adım | Bekleyen | Ne gerekiyor |
> |---|---|---|
> | `2.9` | insan onayı | `just onayla corpus/*/*.md` → 7 kayıt `draft` |
> | `3.7` | V-16 | `CF_ACCOUNT_ID`+`CF_API_TOKEN` ya da `FAL_KEY` |
> | `3.8` | V-16 | aynı + ~$3 gerçek para |
> | `3.14` | `2.9` | onaylı corpus olmadan `NO_CONTEXT` |
> | `4.13b` | V-18 | Tailscale kurulumu + gerçek Telegram token'ı |
> | `5.4b` | V-21 | `chatterbox` ağırlıkları (~2 GB) + `GEMINI_API_KEY` + `ELEVENLABS_API_KEY` |
> | `5.5b` | V-22 | `whisper.cpp` kurulumu ya da gerçek `GROQ_API_KEY` |
> | `6.5b` | V-24 | Bright Data · Tavily · ihale-mcp · borsa-mcp anahtarları |
> | `6.9b` | V-25 | gerçek bir prospect kaydı (+ `2.9` onayı) |

## Tamamlananlar

> **Bu tablo yalnız AKTİF fazı gösterir** (D-85). Önceki fazlar faz dosyalarındaki
> tiklerdedir ve `git log` tek başına yol haritasıdır.
>
> FAZ 0+1: 51 adım · **FAZ 2: 12/13** · **FAZ 3: 12/15** (şartlı, D-158) ·
> **FAZ 4: 17/17** · **FAZ 5: 8/10** (şartlı, D-206) · **FAZ 6: 9/11** (şartlı;
> `6.5b` V-24, `6.9b` V-25). Tikler faz dosyalarında.

| Adım | Tarih |
|---|---|
| **7.1** · Spec drift denetçisi; güvenli alan AYRI ölçülüyor (D-215) | 2026-08-16 |

## Sıradaki adım

**`7.2` — Meta adaptörü** (§9.2 · R-46). IG feed/carousel/Reels/Stories + Threads. Kendi
işletmen için App Review gerekmiyor. `content_publishing_limit` **her yayından önce**
sorgulanır; token yenileme işi **ilk gün** kurulur — Meta uzun ömürlü token 60 günde
ölür ve yenilemenin başarısızlığı sessiz değil **bloklayıcı** olmalıdır.

> ⏳ FAZ 6 kapanış turu (LOOP§D) sürüyor: bağımsız doğrulama agent'ı koşuyor, bulguları
> geldiğinde önce onlar kapatılır (D-79: en fazla iki tur). Agent beklenmiyor — bağımsız
> adımlar bu arada ilerliyor.

## Devreden borçlar

QA/bağlam girdisi 0/18 (`2.9` blokajı) · bileşen testi FAZ 9'a · V-19 +%30 görsel
ölçüm · V-23 LinkedIn döküman sınırı (→ 7.3) · V-24 şelale anahtarları (→ 6.5b) ·
V-25 gerçek prospect (→ 6.9b).

## Bloke adımlar

> Not: golden metrikler bugün SİSTEM fontuyla donduruldu; marka fontu geldiğinde
> (V-02) temel yeniden alınır — bu bir düzeltme, bir blokaj değil (D-144).

**`2.9` — insan onayı bekliyor (D-83).** Yedi corpus kaydı `propose()` ile yazıldı,
`status: draft` indi, retrieval'a görünmüyorlar. Onları `active` yapmak agent'ın işi
değil (R-14). Kullanıcı kayıtları okuyup `just onayla corpus/*/*.md` çalıştırınca adım
kapanır; ardından `just reindex` ve çalıştırma commit'i.

**Okurken dikkat:** `positioning`, `icp`, `offer` kayıtları HİPOTEZ (V-07) — dikey
seçimi üçüncü taraf verisinden çıkarım.

✅ **2026-08-15'te sessiz bir engel kaldırıldı (D-167):** altı kaydın `era_id`si
`era_imalat_2026` yazıyordu, dönemin gerçek adı `imalat-2026`. Onayladığınızda kayıtlar
`active` olacak ama retrieval onları YİNE görmeyecekti — onay işe yaramamış gibi
görünürdü. Ölçüldü: düzeltmeyle onay sonrası **7 kayıt** geliyor, düzeltmesiz **1**.

**`3.7` · `3.8` — V-16.** `sops exec-env` altında `CF_ACCOUNT_ID`+`CF_API_TOKEN` ya da
`FAL_KEY`; `3.8` ayrıca ~$3 gerçek para. Anahtarsız `image.generate` hiçbir sağlayıcıya
çözülmüyor.

**`4.13b` — V-18.** `tailscale` kurulu değil, `TELEGRAM_BOT_TOKEN` yer tutucu. Bot
mantığı ve yüzey sınırı test edilmiş; kalan iş yalnız gerçek erişim.

**`3.14` — `2.9`'a bağlı.** Onaylı corpus olmadan hat `bilgi-sec`te `NO_CONTEXT` ile
duruyor; doğru davranış (R-13), atlatılmıyor. `2.9` açıldığı gün FAZ 3 TAM kapanır.
