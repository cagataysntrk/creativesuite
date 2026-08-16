# DURUM

> Döngünün her turda okuduğu ve yazdığı tek durum dosyası.
> Bağlam sıfırlanırsa **önce burayı oku** (`CLAUDE.md` → "BAĞLAM COMPACT'LENDİYSE").

```yaml
# ── makine-okunur durum bloğu (LOOP§E) ───────────────────────────────────────
aktif_faz: 5
siradaki_adim: 5.10
son_guncelleme: 2026-08-16
bloke: ["2.9:insan", "3.7:insan", "3.8:insan", "3.14:insan", "4.13b:insan", "5.4b:insan", "5.5b:insan"]
deneme_sayaci: {}
son_kanit: "5.9 BITTI (D-204). Uc en-boy TEK kompozisyondan; en-boy ekseni karakter BUTCESINI daraltiyor, puntoyu DEGIL. Olculdu: statement baslik butcesi 68 (16:9) → 42 (1:1) → 33 (9:16). 9:16 da kullanilabilir genislik GUVENLI ALAN (950px), tuval degil. paginate YENIDEN YAZILMADI — ilk taslagim kendi dongusunu kuruyordu, sonsuz dongu korumasi ikinci bir yerde yasayacakti; splitForLayout/paginate istege bagli CharBudget aldi. Var olmayan bir imza uydurmustum, derleme yakaladi (D-174). Ihlal testi ilk denemede GECERSIZDI (derlenmedi), tekrarlandi: 2 test kirmizi. 35 kapi, 979 test."
```

## Neredeyiz

**FAZ 4 ŞARTLI KAPANDI** (2026-08-16, D-193) — komuta merkezi ayakta: 26 uç, 12 ekran,
hepsi ⌘K paletinden ulaşılabilir. Çalıştırma UI'dan başlatılıyor, `rerun` ile `replay`
ayrı düğmeler ve aralarındaki sapma ölçülüyor. **33 kapı**, 926 test.

> **Çıkış kriterinin ikisi karşılanmadı ve tikle ÖRTÜLMEDİ** (D-193): klavye zincirinin
> "onayla" halkası hiç yürütülmedi (`2.9` blokajı) · Tailscale telefonda onay (`4.13b`,
> V-18). Üçüncü kriter — +%30 sahte-yerelleştirme — kuralın yazılı hâli olarak
> `turkce-genisleme` kapısıyla zorlanıyor; görsel ölçüm V-19.

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
> FAZ 0 + FAZ 1: 51 adım · **FAZ 2: 12/13** (`2.9` insan onayı) ·
> **FAZ 3: 12/15** (`3.7` `3.8` `3.14` insan girdisi) — şartlı kapalı, D-158.

| Adım | Tarih |
|---|---|
| **4.1** · iki yüzey bağlamı, takma adlar `var()`a derleniyor | 2026-08-15 |
| **4.1b** · tip ölçeği, 4px boşluk, gölgesiz yükseklik, `ui-tema` kapısı | 2026-08-15 |
| **4.2** · Hono API, SSE, dosya izleme (`just dev`), sunucu duman testi | 2026-08-15 |
| **4.2b** · Vite + React SPA, ⌘K palet, kalıcı makine durumu şeridi | 2026-08-15 |
| **4.3** · Corpus Browser; silme yok, yalnız emeklilik (R-12) | 2026-08-15 |
| **4.4** · Record Detail, git zaman çizgisi, ters indeks | 2026-08-15 |
| **4.5** · Context Preview; kapatma bir karar, manifest'e yazılıyor | 2026-08-16 |
| **4.6** · plan dondurma çekirdeği: özet, bayatlık, başlat kilidi | 2026-08-16 |
| **4.6b** · Run Launcher; koşucu donmuş planı KULLANIYOR (R-07) | 2026-08-16 |
| **4.7** · Onay kuyruğu; red gerekçesi sticky deftere düşüyor | 2026-08-16 |
| **4.8** · Tolerans okuması bileşeni — imza öğesi; rozet yasağı kapıda | 2026-08-16 |
| **4.9** · Placement Preview; Reels güvenli alanı kodda ve ölçülü | 2026-08-16 |
| **4.10** · Reconciliation; BEŞ sütun, kırık imza planı durduruyor | 2026-08-16 |
| **4.11** · Schema Editor; kuru çalıştırma gerçek corpus'a karşı | 2026-08-16 |
| **4.12** · Cost & Budget; tavan Ring 1'de, UI'dan ayarlanıyor | 2026-08-16 |
| **4.13** · Telegram yüzey sınırı; bot üretim başlatamaz (§4c) | 2026-08-16 |
| **4.14** · Asset Library; karantina sayılıyor ama listelenmiyor | 2026-08-16 |
| **4.15** · Run History; donmuş plan diske yazılıyor, rerun ≠ replay | 2026-08-16 |
| **4.16** · Strategy Health; kural kapı ile panoda TEK yerde | 2026-08-16 |
| **4.17** · Doctor; rapor eder, `doctor-salt-okur` kapısı zorluyor | 2026-08-16 |
| **5.1** · HyperFrames; iki Chromium aynı tipografiyi veriyor (ölçüldü) | 2026-08-16 |
| **5.2** · `frame.md` token köprüsü; marka + sistem yan yana | 2026-08-16 |
| **5.3** · Hareket kütüphanesi; marka-bağımsız, düz renk yasak | 2026-08-16 |
| **5.4** · `audio.tts` şerit sözleşmesi; lisans beyanı zorunlu | 2026-08-16 |
| **5.5** · `.ass` yazıcısı + transkript kapısı (yayın yükleminde) | 2026-08-16 |
| **5.6** · Demo yakalama; tıklama niyeti pikselden önce yazılıyor | 2026-08-16 |
| **5.7** · `demo-video` hattı + kalıcı üçlü; V-20 kapandı | 2026-08-16 |
| **5.8** · `reels` deterministik türetme; tahmin yok, eşik gerekçeli | 2026-08-16 |
| **5.9** · Çok en-boy; bütçe daralır, punto sabit (68→42→33) | 2026-08-16 |

## Sıradaki adım

**`5.10` — Tam kapsamlı test paketi.** Protokolün öngördüğü **TEK** geniş tur
(LOOP§D.5) ve FAZ 5'in çıkış kriteri. `just verify` + tüm testler + golden + duman.
Ardından FAZ 5 kapanış turu (LOOP§D, D-79: en fazla iki doğrulama turu).

## FAZ 4 kalanı

QA ve bağlam girdisi 0/18 — `2.9` blokajı; ölçüm `3.14` koştuğu gün gelir. Bileşen
testi (DOM altyapısı) FAZ 9'a bırakıldı.

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
