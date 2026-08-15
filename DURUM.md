# DURUM

> Döngünün her turda okuduğu ve yazdığı tek durum dosyası.
> Bağlam sıfırlanırsa **önce burayı oku** (`CLAUDE.md` → "BAĞLAM COMPACT'LENDİYSE").

```yaml
# ── makine-okunur durum bloğu (LOOP§E) ───────────────────────────────────────
aktif_faz: 2
siradaki_adim: 2.12
son_guncelleme: 2026-08-15
bloke: ["2.9"]
deneme_sayaci: {}
son_kanit: "FAZ 1 KAPANDI. Iki dogrulama turu kosuldu (D-79 tavani), her ikisinin butun bulgulari kapatildi: D-67..D-78. Cikis kriterinin dordu de kanitli: 18 kapi yesil, 9 fiil + verbs kapisi, just plan 8 adimli DAG + FIYATLANAMADI mansetti, strace ile 0 socket. 236 test. 1.10b golden harness FAZ-3.2'ye ertelendi (V-02 marka fontu). V-01 kapandi (D-80).""
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

## Sıradaki adım

**`2.1` — yedi strateji varlık tipi** (`docs/fazlar/FAZ-2.md`):
positioning · messaging · icp · persona · proof_asset · competitor · offer.
Her biri `registry/entity-types/<ad>.type.yaml`, kısıtlı profile (§3.3) uygun, dört
projeksiyonu da üretiyor — `projection` kapısı "0 gerçek varlık tipi" demeyi burada
bırakıyor.

> **Doğrulama turu tavanı: iki** (D-79). "Sorun bul" diye bakan agent her turda sorun
> bulur; faz kapanışı onun yorulmasına bağlanamaz. İkinci turda bulunmayan minor'dur
> ve FAZ 9 denetim turlarına düşer.

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
