# DURUM

> Döngünün her turda okuduğu ve yazdığı tek durum dosyası.
> Bağlam sıfırlanırsa **önce burayı oku** (`CLAUDE.md` → "BAĞLAM COMPACT'LENDİYSE").

```yaml
# ── makine-okunur durum bloğu (LOOP§E) ───────────────────────────────────────
aktif_faz: 3
siradaki_adim: 3.4
son_guncelleme: 2026-08-15
bloke: ["2.9"]
deneme_sayaci: {}
son_kanit: "FAZ 3.3 kapandi: tasan icerik iki slayda bolundu ve ikinci slayt AYNI puntoyla basildi (gercek render). Donen yapida olcek alani YOK — kural yazilmayan alanla zorlanuyor. 3.2 golden metrik V-02ye bagli, ATLANDI (D-59). 425 test, 21 kapi."
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
| **3.3** · kapalı düzen kümesi, taşma bölme | 2026-08-15 |

## Sıradaki adım

**`3.4` — sağlayıcı tanımlayıcı formatı ve adaptör sözleşmesi.** `estimate()` senkron
ve saf (R-42: `async` derleme hatası), sağlayıcı yanıt şekli adaptör sınırını geçmez
(R-43). Ardından `3.5` yetenek yönlendiricisi.

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
