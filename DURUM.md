# DURUM

> Döngünün her turda okuduğu ve yazdığı tek durum dosyası.
> Bağlam sıfırlanırsa **önce burayı oku** (`CLAUDE.md` → "BAĞLAM COMPACT'LENDİYSE").

```yaml
# ── makine-okunur durum bloğu (LOOP§E) ───────────────────────────────────────
aktif_faz: 3
siradaki_adim: 3.1
son_guncelleme: 2026-08-15
bloke: ["2.9"]
deneme_sayaci: {}
son_kanit: "FAZ 2 kapandi (2.9 insan onayi haric). Iki dogrulama turu kosuldu (D-79 tavani): 1. tur 5 blokaj + 5 ikincil, 2. tur 7 blokaj + 6 ikincil — hepsi kapatildi. Ortak kok neden: karar ile yazma arasinda uygulama katmani yoktu (D-95). Cikis kriterlerinin ucu de GERCEK corpus ile kanitlandi: 7 kayit imzasiyla plan 0 op uretiyor, elle duzeltilmis kayit signature_broken ile reddediliyor, emekli kayit retrievala dusmuyor. 400 test, 21 kapi."
```

## Neredeyiz

**FAZ 2 KAPANDI** (2026-08-15) — `2.9` hariç: yedi corpus kaydı draft, insan onayı
bekliyor (D-83). Şirketin bugün ne olduğu kayıtlı, imzalı ve yeniden üretilebilir.
400 test, 21 kapı yeşil.

> **FAZ 3 — görsel üretim hattı** başlıyor. Sıradaki adım `3.1`: `COMPOSE` (saf) +
> `RENDER mode:static`. Fazın sonunda gerçek bir carousel üretilmiş olacak.
>
> İki doğrulama turu koşuldu (D-79 tavanı): birinci tur 5 blokaj + 5 ikincil, ikinci
> tur 7 blokaj + 6 ikincil buldu; hepsi kapatıldı. Üçüncü tur AÇILMAZ — ikinci turda
> bulunmayan FAZ 9 denetim turlarına düşer.

## Tamamlananlar

> **Bu tablo yalnız AKTİF fazı gösterir** (D-85). Önceki fazlar faz dosyalarındaki
> tiklerdedir ve `git log` tek başına yol haritasıdır.
>
> FAZ 0 ve FAZ 1: 51 adım tikli · **FAZ 2: 12/13 adım tikli**, yalnız `2.9` insan
> onayı bekliyor.

| Adım | Tarih |
|---|---|
| _(FAZ 3 henüz başlamadı)_ | — |

## Sıradaki adım

**`3.1` — `COMPOSE` (saf) + `RENDER mode:static`.** Belge modeli → Playwright →
1080×1350 PNG. `RENDER` `RecordEnvelope` GÖRMEZ ve bu imza düzeyinde zorlanır.
Chromium'u başlatan tek yer `packages/render/src/browser.ts`; Playwright'ın kendi
sabit sürümlü tarayıcısı kullanılır (D-86 — snap ölçümle reddedildi).

## Bloke adımlar

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
