# DURUM

> Döngünün her turda okuduğu ve yazdığı tek durum dosyası.
> Bağlam sıfırlanırsa **önce burayı oku** (`CLAUDE.md` → "BAĞLAM COMPACT'LENDİYSE").

```yaml
# ── makine-okunur durum bloğu (LOOP§E) ───────────────────────────────────────
aktif_faz: 3
siradaki_adim: 3.2
son_guncelleme: 2026-08-15
bloke: ["2.9"]
deneme_sayaci: {}
son_kanit: "FAZ 3.1 kapandi: gercek Chromium 1080x1350 PNG uretti, marka tokenlariyla, Turkce glifler eksiksiz, baslik kuculmeden bolundu. Uc ihlal testi kirmizi: zarfi renderStatica gecirmek DERLEME hatasi, ikinci chromium.launch chokepoints, metered:false enjekte VERB_CONTRACT_MISMATCH. 414 test, 20 kapi. playwright@1.56.1 sabit surum (D-86)."
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
| **3.1** · COMPOSE ve statik RENDER | 2026-08-15 |

## Sıradaki adım

**`3.2` — golden-file tipografi testi (JSON metrik).** `ĞÜŞİÖÇ ğüşıöç Ağrı İğne` her
şablon boyutunda render edilir; commit edilen golden bir PNG değil **JSON metriktir**
(glyph kutuları, satır sayısı, font ailesi, `notdef` = 0).

⚠ Bu adım **V-02'ye bağlı**: marka fontu seçilmeden metrik dondurmak, testin varlık
sebebini (Türkçe glif fallback'ini yakalamak) çürütür (D-59). V-02 açıksa `3.3`
(kapalı LayoutEnum) ile devam edilir.

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
