# DURUM

> Döngünün her turda okuduğu ve yazdığı tek durum dosyası.
> Bağlam sıfırlanırsa **önce burayı oku** (`CLAUDE.md` → "BAĞLAM COMPACT'LENDİYSE").

```yaml
# ── makine-okunur durum bloğu (LOOP§E) ───────────────────────────────────────
aktif_faz: 6
siradaki_adim: 6.3
son_guncelleme: 2026-08-16
bloke: ["2.9:insan", "3.7:insan", "3.8:insan", "3.14:insan", "4.13b:insan", "5.4b:insan", "5.5b:insan"]
deneme_sayaci: {}
son_kanit: "6.2 KAPANDI ama ONGORULDUGU GIBI DEGIL. FAZ-6.2 ECharts SSR + D2 diyor; ikisini de OLCUP reddettim (D-209, D-210). ECharts SSR de tuval yok, metni kendi tahmin ediyor: Agustos +%12,6 · Igne fire %% +%24,7 · Cgusioi +%83,4 (74,6 px tahmin, Chromium un gercegi 40,7). Bu sayilarla eksen payi ve sigmayani gizle karari veriliyor — yani SIGAN etiket gizleniyor. Satori yi reddettigimiz gerekcenin aynisi (D-24). Ustelik varsayilan paletini #5070dd SVG ye sizdiriyordu, oysa adimin kendi kriteri bunu yasakliyor. Yerine: geometri SVG, metnin TAMAMI HTML — hicbir yerde metin genisligi tahmin edilmiyor. KANIT: pdfimages sifir raster listeliyor, Do (goruntu XObject) 0, buna karsilik 8 re + 4 l + 36 Tj — grafik vektor, etiket secilebilir, sayilar tr-TR (15.000). metin-olcen-grafik-kutuphanesi darbogazi (izinli BOS) eklendi; ilk deseni kendi ./charts/chart.js modulumuzu yakaladi — yanlis pozitif de bir hatadir, daraltildi ve iki bicim ayri ayri ihlal edildi. 998 test, 35 kapi."
```

## Neredeyiz

**FAZ 6 BAŞLADI** — deck hattının ilk taşı yerinde. FAZ 5 şartlı kapalı (D-206; `aac`
ses akışı yok, `5.4b`/`5.5b` blokajı, tikle örtülmedi). **35 kapı · 984 test · 6 ihlal
kırmızı.**

> **Çıkış kriterinin bir maddesi karşılanmadı ve tikle ÖRTÜLMEDİ** (D-206):
> `ffprobe` **aac** doğrulayamıyor — ses akışı yok, çünkü TTS (`5.4b`, V-21) ve ASR
> (`5.5b`, V-22) insan girdisi bekliyor. Video tarafı ölçüldü: h264 · yuv420p ·
> 1920×1080. "İzlendi" kısmı bir insan eylemidir; sistem onu iddia edemez.

> ⛔ **YEDİ ADIM İNSAN GİRDİSİ BEKLİYOR** — `2.9` · `3.7` · `3.8` · `3.14` · `4.13b` ·
> `5.4b` · `5.5b`.
> Sınıfları `insan` (D-157), o yüzden LOOP§G üçlü kuralına saymazlar: yedisi de plan
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

## Tamamlananlar

> **Bu tablo yalnız AKTİF fazı gösterir** (D-85). Önceki fazlar faz dosyalarındaki
> tiklerdedir ve `git log` tek başına yol haritasıdır.
>
> FAZ 0+1: 51 adım · **FAZ 2: 12/13** · **FAZ 3: 12/15** (şartlı, D-158) ·
> **FAZ 4: 17/17** · **FAZ 5: 8/10** (şartlı, D-206). Tikler faz dosyalarında.

| Adım | Tarih |
|---|---|
| **6.1** · Deck IR + `page.pdf()`; metin katmanı korunuyor (D-207) | 2026-08-16 |
| **6.2** · Grafik + diyagram; ECharts ölçülüp reddedildi (D-209) | 2026-08-16 |

## Sıradaki adım

**`6.3` — `linkedin-document` hattı** (§10, §9.3 · R-11). Düzleştirilmiş PDF, **≤10
sayfa**. Deck'ten ayrılan tek nokta burası (D-207): LinkedIn'in görüntüleyicisi metin
katmanlı PDF'te satır kırılmalarını bozuyor, o yüzden rasterleşiyor. Veri bağlama
**anlık görüntülenir** — 🧪 kaynak kaydı değiştir, dokümanı yeniden aç, **eski değer**
durmalı. Yayınlanmış bir iddiayı geriye dönük değiştirmek düzeltme değil tahrifattır.

## Devreden borçlar

QA/bağlam girdisi 0/18 (`2.9` blokajı) · bileşen testi FAZ 9'a · V-19 +%30 görsel ölçüm.

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
