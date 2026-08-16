# DURUM

> Döngünün her turda okuduğu ve yazdığı tek durum dosyası.
> Bağlam sıfırlanırsa **önce burayı oku** (`CLAUDE.md` → "BAĞLAM COMPACT'LENDİYSE").

```yaml
# ── makine-okunur durum bloğu (LOOP§E) ───────────────────────────────────────
aktif_faz: 4
siradaki_adim: 5.1
son_guncelleme: 2026-08-16
bloke: ["2.9:insan", "3.7:insan", "3.8:insan", "3.14:insan", "4.13b:insan"]
deneme_sayaci: {}
son_kanit: "FAZ 4 kapanis turu 1: bagimsiz dogrulama FAZ 4'u KAPANISA HAZIR DEGIL buldu; en agir bulgu benim kendi duzeltmemdi. D-188: D-182 YARIM kapatilmisti — uret.mjs frozen gecmiyordu, disk 0/18 idi. Simdi donmus-plan.json diske dusuyor; kanit: rerun mumkun=true, sapma OLCULDU=true, liste dolu. D-189: registry/butce.yaml celiskili commit'lenmis, just uret HIC baslamiyordu — registry-veri kapisi. D-190: Baslat dugmesinin onClick'i yoktu ve calistirma baslatan uc yoktu; POST /api/calistir (digest ZORUNLU) + rerun/replay uclari eklendi, ui-dugme kapisi iki olu dugmemi daha buldu. V-18 acildi. 31 kapi, 923 test."
```

## Neredeyiz

**FAZ 3 ŞARTLI KAPANDI** (2026-08-15, D-158) — motor uçtan uca çalışıyor: gerçek
Chromium gerçek slayt basıyor, marka QA gerçek sayı veriyor, manifest her çalıştırmayı
kanıtlıyor. **Çıkış kriteri (gerçek carousel) karşılanmadı ve tikle örtülmedi** —
`3.14` insan onayına bloke. **780 test**, 26 kapı yeşil.

> ⛔ **BEŞ ADIM İNSAN GİRDİSİ BEKLİYOR** — `2.9` · `3.7` · `3.8` · `3.14` · `4.13b`.
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
| **4.13** · Telegram yüzey sınırı; bot üretim başlatamaz (§4c) | 2026-08-16 |
| **4.14** · Asset Library; karantina sayılıyor ama listelenmiyor | 2026-08-16 |
| **4.15** · Run History; donmuş plan diske yazılıyor, rerun ≠ replay | 2026-08-16 |
| **4.16** · Strategy Health; kural kapı ile panoda TEK yerde | 2026-08-16 |
| **4.17** · Doctor; rapor eder, `doctor-salt-okur` kapısı zorluyor | 2026-08-16 |

## Sıradaki adım

**`5.1` — HyperFrames kurulumu** (§7.4 · D-25). Önce FAZ 4 kapanış turunun kalan
bulguları (aşağıda), sonra bu adım. `npm view hyperframes` → v0.7.109 · Apache-2.0 ·
`heygen-com/hyperframes`. ffmpeg 6.1.1 ✓ · ffprobe ✓ · xvfb-run ✓ · node v22 ✓.

## Kapanış turu — kalan bulgular

Bağımsız doğrulama (LOOP§D, 1. tur) FAZ 4'ü kapanışa hazır bulmadı. **Kapatılanlar:**
donmuş plan üretimde (D-188) · bütçe verisi kapıda (D-189) · Başlat + rerun/replay
bağlı (D-190) · V-18 ayrıldı. **Kalanlar:**

- `awaitingGate` hiçbir manifeste yazılmıyor (0/18) → onay kuyruğu gerçek veriyle hiç
  çalışmadı; duman testi boş diziyi geçirdiği için bunu örtüyordu
- `brand/*/decisions.jsonl` yazılıyor ama **hiç okunmuyor**; dosya hiç oluşmamış
- QA okumaları 0/18 · bağlam girdisi 0/18 manifeste düşmüş
- 13 ekran bileşeninin **sıfır testi** var — Başlat düğmesi tam bu boşluktan geçti
- Bağlam önizleme ve keşif ekranları sabit kodlu parametreyle açılıyor
- `docs/fazlar/FAZ-4.md`nin yedi `📁` yolu mevcut değil (belge sapması)

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

**`4.13b` — Tailscale + gerçek bot token.** `tailscale` kurulu değil (sudo kurulum +
hesap girişi) ve `TELEGRAM_BOT_TOKEN` yer tutucu (`doldurulacak`). Bot mantığı ve yüzey
sınırı hazır ve test edilmiş; kalan iş yalnız gerçek erişim. → V-18

**`3.14` — `2.9`'a bağlı.** Onaylı corpus olmadan hat `bilgi-sec` adımında `NO_CONTEXT`
ile duruyor; bu doğru davranış (R-13), atlatılmıyor. `2.9` açıldığı gün `3.14` koşulur
ve FAZ 3 TAM kapanır (D-158).
