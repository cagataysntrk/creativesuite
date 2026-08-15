# DURUM

> Döngünün her turda okuduğu ve yazdığı tek durum dosyası.
> Bağlam sıfırlanırsa **önce burayı oku** (`CLAUDE.md` → "BAĞLAM COMPACT'LENDİYSE").

```yaml
# ── makine-okunur durum bloğu (LOOP§E) ───────────────────────────────────────
aktif_faz: 3
siradaki_adim: 3.9
son_guncelleme: 2026-08-15
bloke: ["2.9", "3.8"]
deneme_sayaci: {}
son_kanit: "FAZ 3.7 kapandi: iki serit de yazildi (Cloudflare senkron, fal kuyruk) ve ayni sozlesmeye oturdu. R-20 UC katmanda: kurucu metin isteyen prompt'u reddediyor, start() sinirinda ek dogrulaniyor, lexicon kapisi pipeline kisitlarini tariyor. Turkce eklemeli yapi desenleri degistirdi: harfler yakalaniyordu, harflerle kaciyordu -> govde on eki. Sozlesme testi yeni adaptorlere KENDILIGINDEN uygulandi ve ikisinde de dustu. 545 test, 21 kapi."
```

## Neredeyiz

**FAZ 2 KAPANDI** (2026-08-15) — `2.9` hariç: yedi corpus kaydı draft, insan onayı
bekliyor (D-83). Şirketin bugün ne olduğu kayıtlı, imzalı ve yeniden üretilebilir.
400 test, 21 kapı yeşil.

> **FAZ 3 — görsel üretim hattı** işleniyor. Sıradaki adım `3.9`: marka QA tolerans
> okumaları (ΔE2000, palet payı, güvenli alan). Fazın sonunda gerçek bir carousel
> üretilmiş olacak.
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
| **3.1** · COMPOSE ve statik RENDER | 2026-08-15 |
| **3.3** · kapalı düzen kümesi, taşma bölme | 2026-08-15 |
| **3.4** · sağlayıcı tanımlayıcısı, içe aktarıcı (V-04 kapandı) | 2026-08-15 |
| **3.5** · yetenek yönlendiricisi, maliyet formülü, bütçe kapısı | 2026-08-15 |
| **3.6** · retry, idempotency, rate limit; çift ücret kapatıldı | 2026-08-15 |
| **3.7** · `image.generate`, iki şerit, R-20 üç katmanda | 2026-08-15 |

## Sıradaki adım

**`3.9` — marka QA tolerans okumaları.** ΔE2000 · palet payı · güvenli alan.
Sonuç **rozet değil ÖLÇÜM**: `ΔE 2.4 / limit 5.0` kenara ne kadar yakın olduğunu
söyler, "✓ uygun" hiçbir şey söylemez (§12). Ardından `3.10` lexicon linter.

⚠ **`3.8` (marka LoRA) BLOKE** — ~$3 gerçek para harcıyor ve `FAL_KEY` yok (V-16).
Anahtarlar `secrets.enc.yaml`a girdiğinde açılır.

⚠ **`3.2` (golden metrik) ATLANDI** — V-02'ye bağlı: marka fontu seçilmeden metrik
dondurmak, testin varlık sebebini (Türkçe glif fallback'ini yakalamak) çürütür (D-59).
Font geldiğinde `3.2` açılır.

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
