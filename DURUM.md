# DURUM

> Döngünün her turda okuduğu ve yazdığı tek durum dosyası.
> Bağlam sıfırlanırsa **önce burayı oku** (`CLAUDE.md` → "BAĞLAM COMPACT'LENDİYSE").

```yaml
# ── makine-okunur durum bloğu (LOOP§E) ───────────────────────────────────────
aktif_faz: 3
siradaki_adim: FAZ-3-KAPANIS
son_guncelleme: 2026-08-15
bloke: ["2.9:insan", "3.7:insan", "3.8:insan", "3.14:insan"]
deneme_sayaci: {}
son_kanit: "1. dogrulama turu: 10 blokaj + 13 ikincil. Dokuz blokaj kapatildi (D-134…D-141). En agiri: uret.mjs retrieval yuklemini ATLAYIP 7 draft kaydi uretime sokuyordu (R-13+R-14). Kalite merdiveni HICBIR SEY yapmiyordu; renderWithinLimit ile her basamak gercekten render edilip olculuyor. providerCall uretimden hic cagrilmiyordu. 3.7 ve 3.14 TIKLERI GERI ALINDI — ikisinin de ciktisi kanitlanamiyor. 735 test, 24 kapi."
```

## Neredeyiz

**FAZ 2 KAPANDI** (2026-08-15) — `2.9` hariç: yedi corpus kaydı draft, insan onayı
bekliyor (D-83). Şirketin bugün ne olduğu kayıtlı, imzalı ve yeniden üretilebilir.
752 test, 25 kapı yeşil.

> **FAZ 3 — görsel üretim hattı: 12/15 adım tikli.** Motor uçtan uca çalışıyor ve
> gerçek Chromium ile gerçek slayt üretiyor; marka QA gerçek sayılar veriyor.
>
> ⛔ **DÖRT ADIM BLOKE — hepsi İNSAN girdisi bekliyor** (D-142). LOOP§G eşiği (üç bloke
> adım) aşıldı ve döngü bilinçli olarak devam ediyor: dördü de plan hatası değil,
> planın önceden kaydettiği doğrulama borçları.
>
> | Adım | Bekleyen | Ne gerekiyor |
> |---|---|---|
> | `2.9` | insan onayı | `just onayla corpus/*/*.md` → 7 kayıt `draft` |
> | `3.7` | V-16 | `CF_ACCOUNT_ID`+`CF_API_TOKEN` ya da `FAL_KEY` |
> | `3.8` | V-16 | aynı + ~$3 gerçek para |
> | `3.14` | `2.9` | onaylı corpus olmadan `NO_CONTEXT` |
>
> **Faz kapanış protokolü tamamlandı** (LOOP§D · D-79 tavanı):
> 1. tur **10 blokaj + 13 ikincil**, 2. tur **5 blokaj + 11 ikincil** buldu.
> Hepsi kapatıldı (D-134…D-155). **Üçüncü tur AÇILMAZ** — ikinci turda bulunmayan
> minor'dur ve FAZ 9 denetim turlarına düşer (`9.2` kural uyumu, `9.5` ölü kod).
>
> 2. turun en ağır bulgusu: 1. turun **düzeltme commit'i** iki üretim CLI'ını kırmıştı
> ve 24 kapının hiçbiri görmedi (D-153). `no-undef` + `cli-duman` kapısı eklendi.

## Tamamlananlar

> **Bu tablo yalnız AKTİF fazı gösterir** (D-85). Önceki fazlar faz dosyalarındaki
> tiklerdedir ve `git log` tek başına yol haritasıdır.
>
> FAZ 0 ve FAZ 1: 51 adım tikli · **FAZ 2: 12/13 adım tikli**, yalnız `2.9` insan
> onayı bekliyor.

| Adım | Tarih |
|---|---|
| **3.1** · COMPOSE ve statik RENDER | 2026-08-15 |
| **3.3** · kapalı düzen kümesi, taşma bölme | 2026-08-15 |
| **3.4** · sağlayıcı tanımlayıcısı, içe aktarıcı (V-04 kapandı) | 2026-08-15 |
| **3.5** · yetenek yönlendiricisi, maliyet formülü, bütçe kapısı | 2026-08-15 |
| **3.6** · retry, idempotency, rate limit; çift ücret kapatıldı | 2026-08-15 |
| **3.9** · marka QA tolerans okumaları (ΔE2000 kendi implementasyonu) | 2026-08-15 |
| **3.2** · golden tipografi metrikleri (font-agnostik harness) | 2026-08-15 |
| **3.10** · deterministik lexicon linter, corpus'a bağlı | 2026-08-15 |
| **3.11** · uyum kapısı, kendi PNG damgamız (ExifTool'suz) | 2026-08-15 |
| **3.12** · içerik-adresli varlık deposu + sidecar | 2026-08-15 |
| **3.13** · run manifest yazıcı, tahmini vs gerçek maliyet | 2026-08-15 |
| **3.15** · linkedin-post, platform spec'i, kalite merdiveni | 2026-08-15 |

## Sıradaki adım

**FAZ 4.1 — tasarım sistemi katmanı** (§12.1–12.4, §12.7).
Üç kademe token ve chroma alan sınırları HAZIR (D-133); kalan: `packages/ui/src/theme.css`,
iki yüzey bağlamı `[data-surface="console"|"studio"]` (**tema anahtarı YOK** —
`prefers-color-scheme` yapısal olarak yok sayılır), **gölge yasağı** (yükseklik = arka
plan basamağı + pah çizgisi), dokuz tip boyutu (konsolda 700 ağırlık yasak), 4px temel
birim.


## Bloke adımlar

> Not: golden metrikler bugün SİSTEM fontuyla donduruldu; marka fontu geldiğinde
> (V-02) temel yeniden alınır — bu bir düzeltme, bir blokaj değil (D-144).

**`2.9` — insan onayı bekliyor (D-83).** Yedi corpus kaydı `propose()` ile yazıldı,
`status: draft` indi, retrieval'a görünmüyorlar. Onları `active` yapmak agent'ın işi
değil (R-14). Kullanıcı kayıtları okuyup `just onayla corpus/*/*.md` çalıştırınca adım
kapanır; ardından `just reindex` ve çalıştırma commit'i.

**Okurken dikkat:** `positioning`, `icp`, `offer` kayıtları HİPOTEZ (V-07) — dikey
seçimi üçüncü taraf verisinden çıkarım. FAZ 2 bu adım kapanmadan kapanmaz.

## Notlar

- GateGuard fact-force kancası bu proje için kapatıldı (`.claude/settings.local.json`).
- `sops` ve `gitleaks` apt'ta yok; binary olarak kurulacak (0.A.6).
- `just` sistemde zaten kuruluydu (1.58.0).
