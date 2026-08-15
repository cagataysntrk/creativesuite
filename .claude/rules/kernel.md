---
paths: ["packages/kernel/**", "packages/contracts/**"]
---

# Kernel'e dokunurken (Ring 0)

Burası **sabit**. Yılda ~4 kez değişir. Bir şey sık değişiyorsa Ring 0'da olmamalı.

## Değişmez yasalar

- **`record.attributes` okunmaz** (R-01). Üç katman zorlar: `OpaqueAttributes` markası
  derleme hatası verir, ESLint yakalar, Proxy tuzağı patlar. Varlığa özgü veriye yol:
  `SELECT` → `unsealAttributes` (yalnız `packages/registry`) → `COMPOSE` belge modeli →
  `RENDER`. `RENDER` asla `RecordEnvelope` görmez.
- **Dokuz fiil, onuncu yok** (R-02). Yeni fiil aynı commit'te `D-nn` gerektirir.
- **Her fiil tek yan etki sınıfı** (R-04). Yalnız `GENERATE` model çağırır, yalnız
  `RENDER` Chromium'a dokunur, yalnız `PROPOSE` yazar, yalnız `PUBLISH` kanal çağırır,
  yalnız `INGEST` dış kaynak çeker. `RENDER` sessizce LLM çağırabilseydi maliyet
  tahmini yalan olurdu.
- **Determinizm** (R-06). `Date`, `Math.random`, `crypto.randomUUID` yasak. Zaman
  `time/clock.ts`, rastgelelik seed'li `rng.ts`, id `ids.ts`.
- **Para `bigint` USD mikro** (R-41). Float yok, kuruş yok — $0.0035 kuruşta bozulur.

## Hata

I/O yapan dışa açık her fonksiyon `Result<T, AppError>` döner. `throw` yalnız
`kernel/src/errors/`. Her hata `costIncurred` taşır: 3 görselden sonra gelen 429
yine de para harcadı.
