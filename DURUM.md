# DURUM

> Döngünün her turda okuduğu ve yazdığı tek durum dosyası.
> Bağlam sıfırlanırsa **önce burayı oku** (`CLAUDE.md` → "BAĞLAM COMPACT'LENDİYSE").

```yaml
# ── makine-okunur durum bloğu (LOOP§E) ───────────────────────────────────────
aktif_faz: 0
siradaki_adim: 0.B.2a
son_guncelleme: 2026-08-14
bloke:
  - adim: 0.A.3
    neden: "ffmpeg + xvfb kurulumu sudo şifresi istiyor; agent kuramaz"
    cozum: "kullanıcı çalıştıracak: sudo apt-get install -y ffmpeg xvfb age"
    engellediği: [0.A.7, 5.6]
deneme_sayaci: {}
son_kanit: "node v22.23.2 · pnpm 11.21.0 · workspace deseni kuruldu (0.A.2)"
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
| 0.A.2 · Node 22 + workspace | 2026-08-14 | `node -v` v22.23.2 · pnpm 11.21.0 · `.nvmrc` |
| 0.A.4 · justfile + ilk kapılar | 2026-08-14 | 2 kapı; ikisi de kasten bozulup kırmızıya döndü |
| 0.B.1 · araştırma eki | 2026-08-14 | 45 çıktı → `docs/research/`, en büyük 96KB |

## Sıradaki adım

**0.B.2a** — `docs/ANAYASA.md` iskeleti: §1–§19 başlıkları, kararlaştırılmış
çapa id'leri (`{#section-4-3}`), her bölümün bir cümlelik amacı. İçerik yok, çapa
şeması kilitli.
Kabul: 19 `## §` başlığı, çapalar benzersiz, `citations` kapısı çözebiliyor.

## Bloke adımlar

**0.A.3** — `ffmpeg` + `xvfb` + `age` kurulumu sudo şifresi istiyor.
Kullanıcı çalıştıracak: `sudo apt-get install -y ffmpeg xvfb age`
Engellediği: 0.A.6 (SOPS), 0.A.7 (hyperframes doctor), 5.6 (demo yakalama).

## Notlar

- GateGuard fact-force kancası bu proje için kapatıldı (`.claude/settings.local.json`).
- `sops` ve `gitleaks` apt'ta yok; binary olarak kurulacak (0.A.6).
- `just` sistemde zaten kuruluydu (1.58.0).
