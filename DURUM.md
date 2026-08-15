# DURUM

> Döngünün her turda okuduğu ve yazdığı tek durum dosyası.
> Bağlam sıfırlanırsa **önce burayı oku** (`CLAUDE.md` → "BAĞLAM COMPACT'LENDİYSE").

```yaml
# ── makine-okunur durum bloğu (LOOP§E) ───────────────────────────────────────
aktif_faz: 4
siradaki_adim: 4.2
son_guncelleme: 2026-08-15
bloke: ["2.9:insan", "3.7:insan", "3.8:insan", "3.14:insan"]
deneme_sayaci: {}
son_kanit: "FAZ 3 SARTLI kapandi (D-158): 12/15 adim tikli, iki dogrulama turu bitti, ucuncu ACILMAZ (D-79). Cikis kriteri (gercek carousel) 3.14 ve 2.9 insan onayina bloke; tikle ORTULMEDI, FAZ-3.md kapanis kaydinda ayrildi. Bu turda: --devam manifesti uzerine yaziyordu ve donmus girdi kavrami yoktu (D-154), corpusCommit 'worktree' kabul ediliyordu (D-155) — 14 varlik yayindan bloke edilip karantinaya alindi, karisik commit defter kunyesini atlatiyordu (D-156), blokaj sinifi eklendi (D-157). 752 test, 25 kapi. Sirada 4.1 tasarim sistemi katmani."
```

## Neredeyiz

**FAZ 3 ŞARTLI KAPANDI** (2026-08-15, D-158) — motor uçtan uca çalışıyor: gerçek
Chromium gerçek slayt basıyor, marka QA gerçek sayı veriyor, manifest her çalıştırmayı
kanıtlıyor. **Çıkış kriteri (gerçek carousel) karşılanmadı ve tikle örtülmedi** —
`3.14` insan onayına bloke. 752 test, **26 kapı** yeşil.

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

## Sıradaki adım

**`4.2` — uygulama iskeleti** (§12.5). Vite + React + Tailwind + shadcn + Hono + SSE.
⌘K paleti **birincil navigasyon** (menü değil), kalıcı makine durumu şeridi: aktif
çalıştırma · biriken maliyet · bekleyen onay · en yakın kota sınırı — toast değil,
kalıcı enstrüman okuması. Tasarım sistemi katmanı hazır: `theme.css` + iki yüzey.


## Bloke adımlar

> Not: golden metrikler bugün SİSTEM fontuyla donduruldu; marka fontu geldiğinde
> (V-02) temel yeniden alınır — bu bir düzeltme, bir blokaj değil (D-144).

**`2.9` — insan onayı bekliyor (D-83).** Yedi corpus kaydı `propose()` ile yazıldı,
`status: draft` indi, retrieval'a görünmüyorlar. Onları `active` yapmak agent'ın işi
değil (R-14). Kullanıcı kayıtları okuyup `just onayla corpus/*/*.md` çalıştırınca adım
kapanır; ardından `just reindex` ve çalıştırma commit'i.

**Okurken dikkat:** `positioning`, `icp`, `offer` kayıtları HİPOTEZ (V-07) — dikey
seçimi üçüncü taraf verisinden çıkarım.

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
