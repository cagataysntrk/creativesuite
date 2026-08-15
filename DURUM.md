# DURUM

> Döngünün her turda okuduğu ve yazdığı tek durum dosyası.
> Bağlam sıfırlanırsa **önce burayı oku** (`CLAUDE.md` → "BAĞLAM COMPACT'LENDİYSE").

```yaml
# ── makine-okunur durum bloğu (LOOP§E) ───────────────────────────────────────
aktif_faz: 1
siradaki_adim: 1.4
son_guncelleme: 2026-08-15
bloke: []
deneme_sayaci: {}
son_kanit: "1.14: 171 test; just plan claude-code adayini listeliyor; PATH bosken provider_unavailable donuyor ve katalogda kullanilamiyor diye isaretleniyor"
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

## Sıradaki adım

**1.4** — projeksiyon derleyicisi: tek şema → dört hedef (rjsf form şeması · TS tipi ·
**katı LLM şeması** · SQLite DDL). FAZ 1'in son adımı.
Kabul: her varlık tipi için dört projeksiyonun snapshot'ı eşleşiyor · `just test projection`.
İhlal: şemaya iç içe nesne ekle, `additionalProperties:false` koyma → LLM projeksiyonu
testi kırmızı (sessizce kabul etmiyor).

> 1.4 en sona kaldı çünkü LLM projeksiyonu **V-05**'e dayanıyor (Anthropic yapılandırılmış
> çıktı alt kümesi OpenAI'ninkiyle aynı mı). 1.14'ün getirdiği Claude Code köprüsü tam da
> o borcu gerçek bir çağrıyla kapatmayı mümkün kılıyor — derleyici daha KATI olana yazılır,
> sonra çağrıyla doğrulanır.

## Bloke adımlar

Yok.

## Notlar

- GateGuard fact-force kancası bu proje için kapatıldı (`.claude/settings.local.json`).
- `sops` ve `gitleaks` apt'ta yok; binary olarak kurulacak (0.A.6).
- `just` sistemde zaten kuruluydu (1.58.0).
