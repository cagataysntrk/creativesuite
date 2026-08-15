# DURUM

> Döngünün her turda okuduğu ve yazdığı tek durum dosyası.
> Bağlam sıfırlanırsa **önce burayı oku** (`CLAUDE.md` → "BAĞLAM COMPACT'LENDİYSE").

```yaml
# ── makine-okunur durum bloğu (LOOP§E) ───────────────────────────────────────
aktif_faz: 2
siradaki_adim: 3.1
son_guncelleme: 2026-08-15
bloke: ["2.9"]
deneme_sayaci: {}
son_kanit: "FAZ 2 birinci dogrulama turu: 5 blokaj + 7 ikincil bulgu. Bloklayanlar: x_signature semantigi yanlis ve uretici yok, 2.8 alan bazli red baglanmamis, retrieval-yuklemi darbogazi uc bicimle atlatildi, lexicon donem alani yoksa fail-open, tokens kapisi sabit marka listesine bagli. Kapatiliyor."
```

## Neredeyiz

**FAZ 1 KAPANDI (2026-08-15).** Çekirdek ayakta: dört halka, dokuz fiil, motor, corpus
indeksi, projeksiyon derleyicisi. `just plan` ağ kablosu çekiliyken DAG basıyor.
236 test, 18 kapı. Henüz hiçbir ÜRETİM yok — ilk gerçek görsel FAZ 3'te.

> **FAZ 2 — bilgi çekirdeği ve marka DNA motoru** işleniyor: 8/13 adım kapandı,
> `2.9` insan onayı bekliyor. `1.10b` (golden harness) FAZ-3.2'ye ertelendi.

## Tamamlananlar

> **Bu tablo yalnız AKTİF fazı gösterir.** Sınırsız büyüyen bir liste `DURUM.md`'nin
> 120 satır tavanını yiyordu (D-85). Önceki fazlar faz dosyalarındaki tiklerdedir ve
> `git log` tek başına yol haritasıdır — tablo onların kopyası değil, bugünün özeti.
>
> FAZ 0 ve FAZ 1: **51 adım tikli**, hepsi `docs/fazlar/FAZ-0.md` ve `FAZ-1.md`'de.

| Adım | Tarih |
|---|---|
| **2.1** · yedi strateji varlık tipi | 2026-08-15 |
| **2.2** · retrieval yüklemi (tek nokta) | 2026-08-15 |
| **2.3** · bağlam tarifleri ve manifest | 2026-08-15 |
| **2.3b** · untrusted_input sınırı | 2026-08-15 |
| **2.4** · propose ve git darboğazı | 2026-08-15 |
| **2.5** · çelişki tespiti ve tahkim kuyruğu | 2026-08-15 |
| **2.6** · era modeli ve varlık damgası | 2026-08-15 |
| **2.7** · keşif motoru — plan, review, apply | 2026-08-15 |
| **2.8** · sticky karar defteri, idempotent atlama | 2026-08-15 |
| **2.10** · token mimarisi ve frame.md | 2026-08-15 |
| **2.11** · çok markalılık ve token kalıtımı | 2026-08-15 |
| **2.12** · dönem-aşırı kanıt aktarımı | 2026-08-15 |

## Sıradaki adım

**`3.1`'den önce FAZ 2 doğrulama bulguları kapatılıyor** (birinci tur, D-79 tavanı iki).
Beş blokaj: x_signature semantiği + üretici · 2.8 alan bazlı red · retrieval-yuklemi
darboğazı · lexicon fail-open · tokens sabit marka listesi.

Bunlar kapanınca **ikinci tur**, sonra FAZ 3 (`3.1` COMPOSE + statik RENDER).
FAZ 2'nin resmî kapanışı ayrıca `2.9`'un insan onayını bekliyor ama FAZ 3'ü bloklamıyor.

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
