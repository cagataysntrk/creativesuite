# DURUM

> Döngünün her turda okuduğu ve yazdığı tek durum dosyası.
> Bağlam sıfırlanırsa **önce burayı oku** (`CLAUDE.md` → "BAĞLAM COMPACT'LENDİYSE").

```yaml
# ── makine-okunur durum bloğu (LOOP§E) ───────────────────────────────────────
aktif_faz: 4
siradaki_adim: 4.13
son_guncelleme: 2026-08-15
bloke: ["2.9:insan", "3.7:insan", "3.8:insan", "3.14:insan"]
deneme_sayaci: {}
son_kanit: "FAZ 4 iskeleti AYAKTA: just dev ile Hono API + Vite SPA birlikte kalkiyor, Komut paleti (Turkce katlamali, foldForSearch), kalici makine durumu seridi SSE'den besleniyor. Kabul kriteri GERCEK SIGKILL ile dogrulandi: canli -> kopuk, 'baglanti yok', son deger GOSTERILMIYOR. Bu turda uc kez ayni desen: iki gercek. D-160 kaskad (comp token duz degere derleniyordu, iki yuzey imkansizdi), D-163 kablo bicimi UYDURULMUS ve dokuz test onu dogrulamisti, D-166 nabiz araligi UI'a gomuluydu. D-165: Turkce katlama Ring -1'e tasindi cunku tarayici halkasi kernel'i import edemez ve ikinci bir katlama palet ile FTS5'i ayristirirdi. 780 test, 26 kapi. Sirada 4.3 Corpus Browser — R-14'un yuzu."
```

## Neredeyiz

**FAZ 3 ŞARTLI KAPANDI** (2026-08-15, D-158) — motor uçtan uca çalışıyor: gerçek
Chromium gerçek slayt basıyor, marka QA gerçek sayı veriyor, manifest her çalıştırmayı
kanıtlıyor. **Çıkış kriteri (gerçek carousel) karşılanmadı ve tikle örtülmedi** —
`3.14` insan onayına bloke. **780 test**, 26 kapı yeşil.

> ⛔ **DÖRT ADIM İNSAN GİRDİSİ BEKLİYOR** — `2.9` · `3.7` · `3.8` · `3.14`.
> Sınıfları `insan` (D-157), o yüzden LOOP§G üçlü kuralına saymazlar: dördü de plan
> hatası değil, planın `V-nn` olarak önceden kaydettiği dış bağımlılıklar. Döngü
> bağımsız adımlarla devam ediyor, ama bu ilan her turda burada durur.
>
> | Adım | Bekleyen | Ne gerekiyor |
> |---|---|---|
> | `2.9` | insan onayı | `just onayla corpus/*/*.md` → 7 kayıt `draft` |
> | `3.7` | V-16 | `CF_ACCOUNT_ID`+`CF_API_TOKEN` ya da `FAL_KEY` |
> | `3.8` | V-16 | aynı + ~$3 gerçek para |
> | `3.14` | `2.9` | onaylı corpus olmadan `NO_CONTEXT` |
>
> **Faz kapanış protokolü tamamlandı** (LOOP§D · D-79 tavanı): 1. tur 10 blokaj +
> 13 ikincil, 2. tur 5 blokaj + 11 ikincil buldu; hepsi kapatıldı (D-134…D-158).
> **Üçüncü tur AÇILMAZ** — bulunmayan FAZ 9'a düşer (`9.2` kural uyumu, `9.5` ölü kod).
> En ağır bulgu: 1. turun **düzeltme commit'i** iki üretim CLI'ını kırmıştı ve 24
> kapının hiçbiri görmedi (D-153). `no-undef` + `cli-duman` kapısı eklendi.

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

## Sıradaki adım

**`4.13` — Tailscale + Telegram onay botu** (§9.4). D-19'un üç yüzeyinden ikisi:
telefondan onay kuyruğuna erişim ve Telegram inline klavyesiyle onayla/reddet.
⚠ Telegram bot token'ı gerektirir (yeni bir `V-nn` doğrulama borcu olabilir);
Tailscale kurulumu makineye bağlı. **Bu adım insan girdisi isteyebilir** — o hâlde
`4.14` Asset Library'ye geçilir.

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

**`3.7` · `3.8` — V-16 anahtarları.** `sops exec-env` altında `CF_ACCOUNT_ID`+
`CF_API_TOKEN` (bedava şerit) ya da `FAL_KEY` (premium). `3.8` ayrıca ~$3 gerçek para
harcıyor. Anahtarsız `image.generate` yeteneği hiçbir sağlayıcıya çözülmüyor.

**`3.14` — `2.9`'a bağlı.** Onaylı corpus olmadan hat `bilgi-sec` adımında `NO_CONTEXT`
ile duruyor; bu doğru davranış (R-13), atlatılmıyor. `2.9` açıldığı gün `3.14` koşulur
ve FAZ 3 TAM kapanır (D-158).

## Notlar

- GateGuard fact-force kancası bu proje için kapatıldı (`.claude/settings.local.json`).
- `sops` ve `gitleaks` apt'ta yok; binary olarak kurulacak (0.A.6).
- `just` sistemde zaten kuruluydu (1.58.0).
