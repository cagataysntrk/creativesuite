# DURUM

> Döngünün her turda okuduğu ve yazdığı tek durum dosyası.
> Bağlam sıfırlanırsa **önce burayı oku** (`CLAUDE.md` → "BAĞLAM COMPACT'LENDİYSE").

```yaml
# ── makine-okunur durum bloğu (LOOP§E) ───────────────────────────────────────
aktif_faz: 7
siradaki_adim: 7.3
son_guncelleme: 2026-08-16
bloke: ["2.9:insan", "3.7:insan", "3.8:insan", "3.14:insan", "4.13b:insan", "5.4b:insan", "5.5b:insan", "6.5b:insan", "6.9b:insan", "7.2b:insan"]
deneme_sayaci: {}
son_kanit: "7.2 KAPANDI (yayin kapilari). SIRA TIPE GOMULU: publish() dort yetenegi de ZORUNLU parametre aliyor — token durumu, kota sorgusu, defter okumasi, yukleme; biri eksikse DERLENMIYOR, yani kota sorgusunu unutmak mumkun degil. Kanit CAGRI SIRASI: sahte bagimliliklar sirayi kaydediyor ve test kota indeksinin yukleme den kucuk oldugunu olcuyor (token → kota → defter → yukleme). Dort ret yolu da yuklemeyi HIC denemiyor: olmus token BLOKLUYOR (uyari degil), alt-textsiz varlik reddediliyor (R-34: yayinlanmis post duzenlenemiyor), kota dolu kuyrukta bekliyor, daha once yayinlanmis icerik tekrar edilmiyor (R-46: Meta mevcut id dondurur, korlemesine tekrar 3 varlik urettim sanip 20 uretmis gorunmektir). Token yenileme SON gune birakilmiyor: 7 gunluk pay, bir haftalik ihmali tolere ediyor. kanal-yayinci darbogazi BEYANDAN mekanik kurala cevrildi ve iki bicimde ihlal edildi; artik sahibi gelecek fazda olan darbogaz KALMADI (29 mekanik, 2 beyan). Gercek yayin insan girdisi → 7.2b (V-26). Batarya 13 kural kiriyor. ONCEKI: FAZ 6 denetiminin 12 bulgusu kapandi (D-216) ve ikinci dogrulama turu kosuyor."
```

## Neredeyiz

**FAZ 6'nın 12 denetim bulgusu KAPANDI** (D-216). Doğrulama agent'ı fazın çekirdek
iddiasını çürütmüştü: kod yazılmış, üretim yolunda çağıranı yoktu. Şimdi zincir
kesintisiz — adım çıktısı → manifest → dedektör → yayın blokajı, uçtan uca ölçüldü.
**İkinci doğrulama turu sırada** (D-79: üçüncü tur açılmaz). **36 kapı · 12 ihlal
kırmızı · 1113 test.**

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
> FAZ 0+1: 51 adım · **FAZ 2: 12/13** · **FAZ 3: 12/15** (şartlı, D-158) ·
> **FAZ 4: 17/17** · **FAZ 5: 8/10** (şartlı, D-206) · **FAZ 6: 9/11** (şartlı;
> `6.5b` V-24, `6.9b` V-25). Tikler faz dosyalarında.

| Adım | Tarih |
|---|---|
| **6.1** · deck PDF; metin katmanı korunuyor (D-207) | 2026-08-16 |
| **6.2** · grafik + diyagram; ECharts reddedildi (D-209) | 2026-08-16 |
| **6.3** · LinkedIn dökümanı; düzleştirme tek motorla (D-211) | 2026-08-16 |
| **6.4** · prospect = corpus; KVKK mezar taşı (D-212) | 2026-08-16 |
| **6.5** · `INGEST` şelalesi; tarayıcı yok (D-213) | 2026-08-16 |
| **6.6** · 14 günlük tazelik kapısı | 2026-08-16 |
| **6.7** · kişiselleştirme tavanı; sayı kural kitabından (D-214) | 2026-08-16 |
| **6.8** · ürün ekranı dördüncü uyum dayanağı | 2026-08-16 |
| **6.9** · `prospect-deck` zinciri; beş kapı sırayla | 2026-08-16 |
| **6.10** · denetimin 12 bulgusu üretim yoluna bağlandı (D-216) | 2026-08-16 |
| **7.1** · spec drift denetçisi; güvenli alan ayrı (D-215) | 2026-08-16 |
| **7.2** · yayın kapıları; sıra tipe gömülü, tek yayıncı mekanik | 2026-08-16 |

## Sıradaki adım

**`7.3` — LinkedIn adaptörü** (§9.3 · R-34). `w_member_social`: metin, görsel **ve
döküman** postu — en yüksek etkileşimli format ve hiçbir aggregator vermiyor. Görsel
sınırı **5 MB**, Meta'nın 30 MB'ının altı katı altı; tek export hattı LinkedIn'in
reddedeceği dosyaları sessizce üretir. **V-23 burada kapanır:** döküman sayfa tavanını
kaynağıyla doğrula (bugünkü 10 sayfa BİZİM editoryal kararımız, platform sınırı değil).

> ⏳ FAZ 6'nın ikinci (son) doğrulama turu koşuyor. Bulguları geldiğinde önce onlar
> kapatılır; **üçüncü tur açılmaz** (D-79) ve kalanlar FAZ 9 denetim turlarına düşer.

## Devreden borçlar

QA/bağlam girdisi 0/18 (`2.9` blokajı) · bileşen testi FAZ 9'a · V-19 +%30 görsel
ölçüm · V-23 LinkedIn döküman sınırı (→ 7.3) · V-24 şelale anahtarları (→ 6.5b) ·
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
