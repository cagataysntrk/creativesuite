# DURUM

> Döngünün her turda okuduğu ve yazdığı tek durum dosyası.
> Bağlam sıfırlanırsa **önce burayı oku** (`CLAUDE.md` → "BAĞLAM COMPACT'LENDİYSE").

```yaml
# ── makine-okunur durum bloğu (LOOP§E) ───────────────────────────────────────
aktif_faz: 0
siradaki_adim: 0.A.2
son_guncelleme: 2026-08-14
bloke: []
deneme_sayaci: {}
son_kanit: "5 ihlal commit'i reddedildi, geçerli commit kabul edildi (0.A.1c)"
```

## Neredeyiz

**FAZ 0 — ön hazırlık.** Depo kuruldu, private, commit kapısı çalışıyor.
Henüz hiçbir üretim yok; bu faz bilinçli olarak altyapı ve belge fazıdır.

## Tamamlananlar

| Adım | Tarih | Kanıt |
|---|---|---|
| 0.A.1 · git init, .gitignore, README | 2026-08-14 | `main` dalı, temiz ağaç, tek commit |
| 0.A.1b · GitHub private repo | 2026-08-14 | `origin` bağlı; anonim API 404 → private |
| 0.A.1c · commit-msg kapısı | 2026-08-14 | 5 ihlal reddedildi, geçerli commit kabul |

## Sıradaki adım

**0.A.2** — Node 22 LTS'e geçiş + pnpm workspace iskeleti.
Kabul: `node -v` → v22.x · `pnpm -v` çıktı veriyor.

## Bloke adımlar

Yok.

## Notlar

- `just` henüz kurulu değil; 0.A.4'te gelecek.
- GateGuard fact-force kancası bu proje için kapatıldı (D-43).
