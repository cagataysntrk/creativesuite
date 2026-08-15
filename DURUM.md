# DURUM

> Döngünün her turda okuduğu ve yazdığı tek durum dosyası.
> Bağlam sıfırlanırsa **önce burayı oku** (`CLAUDE.md` → "BAĞLAM COMPACT'LENDİYSE").

```yaml
# ── makine-okunur durum bloğu (LOOP§E) ───────────────────────────────────────
aktif_faz: 1
siradaki_adim: 1.10b
son_guncelleme: 2026-08-15
bloke: []
deneme_sayaci: {}
son_kanit: "Ikinci dogrulama agenti dokuz bulgunun DOKUZUNU da kapali buldu (D-67..D-76), ama uc yeni blokaj acti: attributes darbogazi iki satira bolunerek atlatiliyordu (D-77), FAZ-1.6 kabul komutu EXIT=1 veriyordu (D-78), DURUM.md iki commit geride kalmisti. Ucu de kapandi. 214 test, 18 kapi."
```

## Neredeyiz

**FAZ 1 — kurulum.** Çekirdek ayakta: dokuz halka, dokuz fiil, motor, corpus indeksi,
projeksiyon derleyicisi. `just plan` ağ kablosu çekiliyken DAG basıyor. 214 test, 18 kapı.
Henüz hiçbir ÜRETİM yok — ilk gerçek görsel FAZ 3'te.

> FAZ 1'in 15 adımının 14'ü tikli; `1.10b` (golden harness) **V-02'ye bağlı**.
> İkinci doğrulama agent'ı raporladı: dokuz bulgunun dokuzu da gerçekten kapalı, ama
> üç yeni blokaj (D-77, D-78 ve bayat DURUM.md) çıktı — üçü de kapatıldı. Kapanış
> üçüncü ve son doğrulama turunu bekliyor (LOOP§D.3).

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
| 0.C.1 · tsconfig katılığı + prettier | 2026-08-15 |
| 0.C.2 · halka sınırı zorlaması | 2026-08-15 |
| 0.C.6 · citations kapısı | 2026-08-14 |
| 0.C.8 · chokepoints.json | 2026-08-15 |
| 0.C.10 · commit kancaları + gitleaks | 2026-08-15 |
| 0.C.7 · commit-msg hook'u | 2026-08-14 |
| 0.C.9 · docs-size | 2026-08-14 |
| 0.E.1 · DURUM.md sözleşmesi | 2026-08-14 |
| 0.E.2 · tur açılış yordamı | 2026-08-14 |
| 0.E.4 · compact protokolü | 2026-08-14 |
| **1.1** · pnpm workspace ve halka sınırları | 2026-08-15 |
| **1.1b** · packages/contracts | 2026-08-15 |
| **1.2** · kayıt zarfı şeması + JSON üretimi | 2026-08-15 |
| **1.3** · registry/PROFILE.md + profil kapısı | 2026-08-15 |
| **1.10** · test altyapısı, cassette, fixture | 2026-08-15 |
| 0.C.4 · turkish-case kapısı | 2026-08-15 |
| **1.5** · Türkçe metin primitifleri | 2026-08-15 |
| **1.7** · hata taksonomisi + Result disiplini | 2026-08-15 |
| **1.8** · iş kuyruğu + dört durum makinesi | 2026-08-15 |
| **1.6** · corpus yazma darboğazı + FTS5 indeksi | 2026-08-15 |
| **1.9** · run manifest sözleşmesi (V-11 kapandı) | 2026-08-15 |
| 0.C.3 · kernel saflık kapısı (3 katman) | 2026-08-15 |
| 0.C.11 · verbs kapısı | 2026-08-15 |
| **1.11** · dokuz fiilin iskeleti | 2026-08-15 |
| **1.12** · motor: retry, kesici, bütçe, defter | 2026-08-15 |
| **1.13** · just plan — harcamayan kuru çalıştırma | 2026-08-15 |
| **1.14** · headless Claude Code adaptörü | 2026-08-15 |
| **1.4** · projeksiyon derleyicisi (4 hedef) | 2026-08-15 |
| 0.B.8b · FAZ-2.md ve FAZ-3.md gövdeleri | 2026-08-15 |
| 0.B.8c · FAZ-4..9.md gövdeleri (60 adım) | 2026-08-15 |

## Sıradaki adım

**FAZ 1'in on beş adımının on dördü kapandı.** Kalan tek adım `1.10b` (golden harness)
ve o **V-02'ye bağlı** — marka fontu seçilmeden metrik dondurmak, testin varlık sebebini
çürütür (D-59).

Sıradaki iş bir ADIM değil, **faz kapanış protokolü** (LOOP§D):
1. FAZ-1'in her ✅ kriterini tek tek çalıştır, somut kanıt üret
2. **Bağımsız doğrulama agent'ı** (`.claude/agents/faz-dogrulayici.md`) çalıştır
3. Agent temiz derse faz kapanır; aksi hâlde eksikler tur listesine eklenir

> FAZ 1 çıkış kriteri: `just verify` yeşil · dokuz fiil tanımlı ve `verbs` kapısı bağlı ·
> `just plan` hiçbir şey harcamadan DAG + sağlayıcı + maliyet aralığı basıyor · ağ
> kablosu çekiliyken de çalışıyor. Dördü de kanıtlandı; agent bağımsız doğrulayacak.

## Bloke adımlar

Yok.

## Notlar

- GateGuard fact-force kancası bu proje için kapatıldı (`.claude/settings.local.json`).
- `sops` ve `gitleaks` apt'ta yok; binary olarak kurulacak (0.A.6).
- `just` sistemde zaten kuruluydu (1.58.0).
