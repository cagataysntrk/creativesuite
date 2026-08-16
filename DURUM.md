# DURUM

> Döngünün her turda okuduğu ve yazdığı tek durum dosyası.
> Bağlam sıfırlanırsa **önce burayı oku** (`CLAUDE.md` → "BAĞLAM COMPACT'LENDİYSE").

```yaml
# ── makine-okunur durum bloğu (LOOP§E) ───────────────────────────────────────
aktif_faz: 7
siradaki_adim: 7.5
son_guncelleme: 2026-08-16
bloke: ["2.9:insan", "3.7:insan", "3.8:insan", "3.14:insan", "4.13b:insan", "5.4b:insan", "5.5b:insan", "6.5b:insan", "6.9b:insan", "7.2b:insan"]
deneme_sayaci: {}
son_kanit: "7.4 KAPANDI. Limiter artik AGIRLIKLI (§9.2): okuma 1, YAZMA 3 — tek agirlik ya okumayi gereksiz yavaslatir ya yazmayi saglayicinin sinirina carptirir ve 429 ancak yayin aninda gorunur. Iki ardisik yazma kapasiteyi asiyor, ikincisi kuyrukta ve retryAfterMs bir TAHMIN degil HESAP. Yayin defteri (derived/runs/published.ndjson) yazildi ve publish.ts in DORDUNCU kapisina GERCEKTEN baglandi: ayni icerik ikinci kez yayinlanmiyor ve KANAL CAGRISI YAPILMIYOR (olculdu, yuklendi dizisi bos kaliyor). Meta yinelenmede mevcut id i donduruyor; cagri yapilsaydi basardim sanilirdi. YOK ile BOS AYRI: defter yoksa yayin DURUR, bos sayilmaz — bos saymak defteri silmenin yinelemeleri serbest birakmasi demekti ve defter TURETILEMEZ (D-38). Bozuk bir satir da sessizce atlanmiyor: atlansaydi bozulmus defter yayinlanmamis diye okunur ve icerik ikinci kez yayinlanirdi. Test ELLE FIKSTUR YAZMIYOR — gercek deftere gercek appendPublished ile yazip gercek publish cagrisina bagliyor (FAZ 6 dersi). ONCEKI: 7.3 kapandi ve V-23 gercek kaynakla kapandi (300 sayfa · 100 MB); dogrulama, dokuman icin GORSEL sinirinin kullanildigi hatasini ortaya cikardi."
```

## Neredeyiz

**FAZ 6 ŞARTLI KAPANDI** (D-217). **İki doğrulama turu koştu, 28 bulgunun hepsi kapandı.** Birinci tur 12, ikinci tur 16
bulgu verdi — ikisi de aynı sınıftan: **kod yazılmış, üretim yolunda çağıranı yok.**
İkinci tur ayrıca benim ilk turda açtığım bir gerilemeyi yakaladı (PDF yolunda lexicon
hiç koşmuyordu) ve **kendi kendini onaylayan bir test çiftini** ortaya çıkardı.
**D-79: üçüncü tur AÇILMAZ.** **36 kapı · 13 ihlal kırmızı · 1144 test.**

> **Kök neden, üçüncü tekrar:** D-182 donmuş planı yazdı ama `uret.mjs` çağırmıyordu ·
> D-190 düğmeyi çizdi ama `onClick` yoktu · şimdi aynı hata **bir seviye yukarıda**:
> `tazeMi`nin çağıranı var (`inspectManifest`) ama `inspectManifest` o veriyi hiç
> görmüyor, çünkü yazan yok. **"Çağıran var mı" tek adım için değil, ZİNCİR için
> sorulmalı:** üretim girişinden kurala kesintisiz yol var mı?

> FAZ 5'in `aac` maddesi de karşılanmadı ve tikle örtülmedi (D-206): ses akışı yok,
> `5.4b`/`5.5b` insan girdisi bekliyor. Video ölçüldü: h264 · yuv420p · 1920×1080.

> ⛔ **ON ADIM İNSAN GİRDİSİ BEKLİYOR** — `2.9` · `3.7` · `3.8` · `3.14` · `4.13b` ·
> `5.4b` · `5.5b` · `6.5b` · `6.9b` · `7.2b`.
> Sınıfları `insan` (D-157), o yüzden LOOP§G üçlü kuralına saymazlar: onu da plan
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
> | `7.2b` | V-26 | Meta uygulaması + sayfa bağlantısı + uzun ömürlü token |

## Tamamlananlar

> **Bu tablo yalnız AKTİF fazı gösterir** (D-85). Önceki fazlar faz dosyalarındaki
> tiklerdedir ve `git log` tek başına yol haritasıdır.
>
> FAZ 0+1: 51 · **FAZ 2: 12/13** · **FAZ 3: 12/15** (şartlı, D-158) · **FAZ 4: 17/17** ·
> **FAZ 5: 8/10** (şartlı, D-206) · **FAZ 6: 10/12** (şartlı, D-217; `6.5b` V-24,
> `6.9b` V-25). Tikler faz dosyalarında.

| Adım | Tarih |
|---|---|
| **7.1** · spec drift denetçisi; güvenli alan ayrı (D-215) | 2026-08-16 |
| **7.2** · yayın kapıları; sıra tipe gömülü, tek yayıncı mekanik | 2026-08-16 |
| **7.3** · LinkedIn adaptörü; V-23 kapandı (300 sayfa · 100 MB) | 2026-08-16 |
| **7.4** · ağırlıklı limiter + yayın defteri; "yok" ≠ "boş" | 2026-08-16 |

## Sıradaki adım

**`7.5` — OAuth kurulumu** (§9.2, §9.3 · D-3). Meta uygulaması (kendi işletmen, App
Review gerekmiyor) + LinkedIn "Share on LinkedIn" 3-legged OAuth. Her ikisinin
kapsamları `KARARLAR.md`'ye yazılır. **Büyük olasılıkla `7.5`/`7.5b` diye bölünecek:**
akış ve kapsam doğrulaması kodla test edilebilir, gerçek uygulama kaydı insan girdisi
(V-26 ailesi).

## Devreden borçlar

QA/bağlam girdisi 0/18 (`2.9` blokajı) · bileşen testi FAZ 9'a · V-19 +%30 görsel
ölçüm · V-24 şelale anahtarları ve ADAPTÖRLERİ (→ 6.5b) ·
V-25 gerçek prospect (→ 6.9b) · V-26 Meta token (→ 7.2b).

## Bloke adımlar

> Not: golden metrikler bugün SİSTEM fontuyla donduruldu; marka fontu geldiğinde
> (V-02) temel yeniden alınır — bu bir düzeltme, bir blokaj değil (D-144).

**`2.9` — insan onayı bekliyor (D-83).** Yedi kayıt `draft` indi, retrieval'a görünmüyor.
`active` yapmak agent'ın işi değil (R-14): `just onayla corpus/*/*.md` → `just reindex`.

**Okurken dikkat:** `positioning`, `icp`, `offer` kayıtları HİPOTEZ (V-07) — dikey
seçimi üçüncü taraf verisinden çıkarım.

✅ **Sessiz bir engel kaldırıldı (D-167):** altı kaydın `era_id`si yanlıştı; onay işe
yaramamış görünecekti. Ölçüldü: düzeltmeyle 7 kayıt geliyor, düzeltmesiz 1.

**`3.7` · `3.8` — V-16.** `CF_ACCOUNT_ID`+`CF_API_TOKEN` ya da `FAL_KEY`; `3.8` ayrıca
~$3 gerçek para. Anahtarsız `image.generate` hiçbir sağlayıcıya çözülmüyor.

**`4.13b` — V-18.** `tailscale` yok, `TELEGRAM_BOT_TOKEN` yer tutucu; mantık test edilmiş.

**`3.14` — `2.9`'a bağlı.** Onaylı corpus olmadan hat `bilgi-sec`te `NO_CONTEXT` ile
duruyor; doğru davranış (R-13), atlatılmıyor. `2.9` açıldığı gün FAZ 3 TAM kapanır.
