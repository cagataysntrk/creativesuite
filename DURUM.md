# DURUM

> Döngünün her turda okuduğu ve yazdığı tek durum dosyası.
> Bağlam sıfırlanırsa **önce burayı oku** (`CLAUDE.md` → "BAĞLAM COMPACT'LENDİYSE").

```yaml
# ── makine-okunur durum bloğu (LOOP§E) ───────────────────────────────────────
aktif_faz: 0
siradaki_adim: 0.C.1
son_guncelleme: 2026-08-15
bloke: []
deneme_sayaci: {}
son_kanit: "FAZ-1.1: 11 paket, ihlal testi -> eslint rc=1 depcruise rc=1 tsc rc=2; geri alinca 6 kapi yesil"
```

## Neredeyiz

**FAZ 0 — ön hazırlık.** Depo kuruldu, private, commit kapısı çalışıyor.
Henüz hiçbir üretim yok; bu faz bilinçli olarak altyapı ve belge fazıdır.

## Tamamlananlar

> **Bu tablo `docs/fazlar/FAZ-0.md` tiklerinden türetilir.** Elle düzenlenmez;
> çelişki çıkarsa FAZ dosyası doğrudur.

| Adım | Tarih |
|---|---|
| 0.A.1 · git init, .gitignore, README | 2026-08-14 |
| 0.A.1b · GitHub private repo | 2026-08-14 |
| 0.A.1c · commit-msg kapısı | 2026-08-14 |
| 0.A.2 · Node 22 + pnpm workspace | 2026-08-14 |
| 0.A.3 · ffmpeg + xvfb + age | 2026-08-15 |
| 0.A.4 · justfile + kapı koşucusu | 2026-08-14 |
| 0.A.6 · SOPS + age secret yönetimi | 2026-08-15 |
| 0.A.7 · hyperframes doctor | 2026-08-15 |
| 0.B.1 · araştırma eki | 2026-08-14 |
| 0.B.2a · ANAYASA iskeleti | 2026-08-14 |
| 0.B.2b · ANAYASA §1–§7 | 2026-08-15 |
| 0.B.2c · ANAYASA §8–§13 | 2026-08-15 |
| 0.B.2d · ANAYASA §14–§19 | 2026-08-15 |
| 0.B.3 · KURALLAR.md | 2026-08-14 |
| 0.B.4 · CLAUDE.md | 2026-08-14 |
| 0.B.5 · KARARLAR.md | 2026-08-14 |
| 0.B.6 · DURUM.md | 2026-08-14 |
| 0.B.7 · docs/LOOP.md | 2026-08-14 |
| 0.B.8a · FAZ-0.md ve FAZ-1.md | 2026-08-14 |
| 0.B.9 · .claude/rules + skills iskeleti | 2026-08-15 |
| 0.B.10 · denetim bulgularının tasfiyesi | 2026-08-15 |
| 0.C.2 · halka sınırı zorlaması | 2026-08-15 |
| 0.C.6 · citations kapısı | 2026-08-14 |
| 0.C.7 · commit-msg hook'u | 2026-08-14 |
| 0.C.9 · docs-size | 2026-08-14 |
| 0.E.1 · DURUM.md sözleşmesi | 2026-08-14 |
| 0.E.2 · tur açılış yordamı | 2026-08-14 |
| 0.E.4 · compact protokolü | 2026-08-14 |
| **1.1** · pnpm workspace ve halka sınırları | 2026-08-15 |

## Sıradaki adım

**0.C.1** — `tsconfig-drift` kapısı. `tsconfig.base.json` FAZ-1.1'de yazıldı ve katı;
eksik olan, bir paketin bir bayrağı sessizce zayıflatmasını yakalayan kapı.
Kabul: bir pakette `strict: false` yaz → kapı kırmızı.

> D-53 uyarınca **0.C bloğu FAZ-1.2'den ÖNCE kapanır** — workspace'in ilk gerçek kodu
> kapılı doğsun diye. Kalan: 0.C.1, 0.C.3, 0.C.4, 0.C.8, 0.C.10, 0.C.11.

## Bloke adımlar

Yok.

## Notlar

- GateGuard fact-force kancası bu proje için kapatıldı (`.claude/settings.local.json`).
- `sops` ve `gitleaks` apt'ta yok; binary olarak kurulacak (0.A.6).
- `just` sistemde zaten kuruluydu (1.58.0).
