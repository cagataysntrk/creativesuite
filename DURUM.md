# DURUM

> Döngünün her turda okuduğu ve yazdığı tek durum dosyası.
> Bağlam sıfırlanırsa **önce burayı oku** (`CLAUDE.md` → "BAĞLAM COMPACT'LENDİYSE").

```yaml
# ── makine-okunur durum bloğu (LOOP§E) ───────────────────────────────────────
aktif_faz: 0
siradaki_adim: 0.B.9
son_guncelleme: 2026-08-14
bloke:
  - adim: 0.A.3
    neden: "ffmpeg + xvfb kurulumu sudo şifresi istiyor; agent kuramaz"
    cozum: "kullanıcı çalıştıracak: sudo apt-get install -y ffmpeg xvfb age"
    engellediği: [0.A.7, 5.6]
deneme_sayaci: {}
son_kanit: "KURALLAR.md 46 kural / 13 aktif · 275 satır · 3 kapı yeşil (0.B.3)"
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
| 0.B.2a · ANAYASA iskeleti | 2026-08-14 | 19 bölüm · 72 çapa · `citations` çözüyor |
| 0.B.4 · CLAUDE.md | 2026-08-14 | 12 yasa satır içi · compact protokolü · ≤200 satır |
| 0.B.5 · KARARLAR.md | 2026-08-14 | 44 karar + 11 doğrulama borcu · 226 satır |
| 0.B.6 · DURUM.md | 2026-08-14 | makine-okunur blok · `just tur` ayrıştırıyor |
| 0.B.7 · docs/LOOP.md | 2026-08-14 | `LOOP§A`…`LOOP§G` çapalı |
| 0.B.8a · FAZ-0.md | 2026-08-14 | 44 adım, altı alanlı şablon |
| 0.C.6 · citations kapısı | 2026-08-14 | uydurma §/FAZ atfı → kırmızı; ilk koşuda gerçek kırık atıf yakaladı |
| 0.C.9 · docs-size kapısı | 2026-08-14 | 175 satıra şişir → kırmızı, geri al → yeşil |
| 0.E.1 · DURUM sözleşmesi | 2026-08-14 | `just tur` sıradaki adımı buluyor |
| 0.E.2 · tur yordamı | 2026-08-14 | faz + adım + bloke + gövde basıyor |
| 0.E.3 · doğrulama agent'ı | 2026-08-14 | `.claude/agents/faz-dogrulayici.md` |
| 0.E.4 · compact protokolü | 2026-08-14 | CLAUDE.md okuma sırası: DURUM → FAZ → `just tur` |
| 0.B.3 · KURALLAR.md | 2026-08-14 | 46 kural, 13 aktif zorlanıyor, 275 satır |

## Sıradaki adım

**0.E.5** — ilk döngü provası. `/loop` dinamik modda üç tur; her tur bir adım,
kanıt, tik, DURUM güncellemesi, commit, 70 sn wakeup.
Kabul: üç tur `git log`'da `Refs: FAZ-0.x` ile görünüyor · hiçbir tur iki adım denememiş.

## Bloke adımlar

**0.A.3** — `ffmpeg` + `xvfb` + `age` kurulumu sudo şifresi istiyor.
Kullanıcı çalıştıracak: `sudo apt-get install -y ffmpeg xvfb age`
Engellediği: 0.A.6 (SOPS), 0.A.7 (hyperframes doctor), 5.6 (demo yakalama).

## Notlar

- GateGuard fact-force kancası bu proje için kapatıldı (`.claude/settings.local.json`).
- `sops` ve `gitleaks` apt'ta yok; binary olarak kurulacak (0.A.6).
- `just` sistemde zaten kuruluydu (1.58.0).
