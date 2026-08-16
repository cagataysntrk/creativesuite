# Pipeline kataloğu

> ⚠ **ÜRETİLMİŞ DOSYA — elle düzenleme** (R-65). Üreteci: `just docs`.
> Kaynak: `registry/pipelines/*.pipeline.yaml`. `docs-drift` kapısı sapmayı yakalar.

Toplam **9** hat.

## `deck` — Prospect deck'i (PDF)

7 adım · 1 yetenek isteyen · 1 insan kapısı

| adım | fiil | yetenek | bağımlı | kapı | isteğe bağlı |
|---|---|---|---|---|---|
| `cozumle` | `RESOLVE` | — | — | — | — |
| `bilgi-sec` | `SELECT` | — | cozumle | — | — |
| `anlati-uret` | `GENERATE` | `text.generate` | bilgi-sec | — | — |
| `kompozit` | `COMPOSE` | — | anlati-uret | — | — |
| `render` | `RENDER` | — | kompozit | — | — |
| `kalite` | `VALIDATE` | — | render | — | — |
| `onay` | `PROPOSE` | — | kalite | insan-onayi | — |

## `demo-video` — Ürün demo videosu

10 adım · 1 yetenek isteyen · 3 insan kapısı

| adım | fiil | yetenek | bağımlı | kapı | isteğe bağlı |
|---|---|---|---|---|---|
| `cozumle` | `RESOLVE` | — | — | — | — |
| `bilgi-sec` | `SELECT` | — | cozumle | — | — |
| `bolum-sirasi` | `PROPOSE` | — | bilgi-sec | bolum-sirasi | — |
| `anlati-uret` | `GENERATE` | `audio.tts` | bolum-sirasi | — | ✓ |
| `yakala` | `RENDER` | — | bolum-sirasi | — | — |
| `altyazi` | `RENDER` | — | yakala, anlati-uret | — | — |
| `transkript` | `PROPOSE` | — | altyazi | transkript | — |
| `kurgu` | `RENDER` | — | transkript | — | — |
| `kalite` | `VALIDATE` | — | kurgu | — | — |
| `onay` | `PROPOSE` | — | kalite | insan-onayi | — |

## `explainer-video` — Explainer video (çok en-boy)

8 adım · 1 yetenek isteyen · 1 insan kapısı

| adım | fiil | yetenek | bağımlı | kapı | isteğe bağlı |
|---|---|---|---|---|---|
| `cozumle` | `RESOLVE` | — | — | — | — |
| `bilgi-sec` | `SELECT` | — | cozumle | — | — |
| `anlati-uret` | `GENERATE` | `audio.tts` | bilgi-sec | — | ✓ |
| `render-16x9` | `RENDER` | — | bilgi-sec, anlati-uret | — | — |
| `render-9x16` | `RENDER` | — | bilgi-sec, anlati-uret | — | — |
| `render-1x1` | `RENDER` | — | bilgi-sec, anlati-uret | — | — |
| `kalite` | `VALIDATE` | — | render-16x9, render-9x16, render-1x1 | — | — |
| `onay` | `PROPOSE` | — | kalite | insan-onayi | — |

## `instagram-carousel` — Instagram carousel

7 adım · 1 yetenek isteyen · 1 insan kapısı

| adım | fiil | yetenek | bağımlı | kapı | isteğe bağlı |
|---|---|---|---|---|---|
| `cozumle` | `RESOLVE` | — | — | — | — |
| `bilgi-sec` | `SELECT` | — | cozumle | — | — |
| `gorsel-uret` | `GENERATE` | `image.generate` | bilgi-sec | — | ✓ |
| `kompozit` | `COMPOSE` | — | bilgi-sec, gorsel-uret | — | — |
| `render` | `RENDER` | — | kompozit | — | — |
| `kalite` | `VALIDATE` | — | render | — | — |
| `onay` | `PROPOSE` | — | kalite | insan-onayi | — |

## `instagram-post` — Instagram tek görsel postu

8 adım · 2 yetenek isteyen · 1 insan kapısı

| adım | fiil | yetenek | bağımlı | kapı | isteğe bağlı |
|---|---|---|---|---|---|
| `cozumle` | `RESOLVE` | — | — | — | — |
| `bilgi-sec` | `SELECT` | — | cozumle | — | — |
| `metin-uret` | `GENERATE` | `text.generate` | bilgi-sec | — | — |
| `gorsel-uret` | `GENERATE` | `image.generate` | bilgi-sec | — | — |
| `kompozit` | `COMPOSE` | — | metin-uret, gorsel-uret | — | — |
| `render` | `RENDER` | — | kompozit | — | — |
| `kalite` | `VALIDATE` | — | render | — | — |
| `onay` | `PROPOSE` | — | kalite | insan-onayi | — |

## `linkedin-document` — LinkedIn dökümanı (düzleştirilmiş PDF)

7 adım · 1 yetenek isteyen · 1 insan kapısı

| adım | fiil | yetenek | bağımlı | kapı | isteğe bağlı |
|---|---|---|---|---|---|
| `cozumle` | `RESOLVE` | — | — | — | — |
| `bilgi-sec` | `SELECT` | — | cozumle | — | — |
| `metin-uret` | `GENERATE` | `text.generate` | bilgi-sec | — | — |
| `kompozit` | `COMPOSE` | — | metin-uret | — | — |
| `render` | `RENDER` | — | kompozit | — | — |
| `kalite` | `VALIDATE` | — | render | — | — |
| `onay` | `PROPOSE` | — | kalite | insan-onayi | — |

## `linkedin-post` — LinkedIn tek görsel postu

7 adım · 1 yetenek isteyen · 1 insan kapısı

| adım | fiil | yetenek | bağımlı | kapı | isteğe bağlı |
|---|---|---|---|---|---|
| `cozumle` | `RESOLVE` | — | — | — | — |
| `bilgi-sec` | `SELECT` | — | cozumle | — | — |
| `gorsel-uret` | `GENERATE` | `image.generate` | bilgi-sec | — | ✓ |
| `kompozit` | `COMPOSE` | — | bilgi-sec, gorsel-uret | — | — |
| `render` | `RENDER` | — | kompozit | — | — |
| `kalite` | `VALIDATE` | — | render | — | — |
| `onay` | `PROPOSE` | — | kalite | insan-onayi | — |

## `prospect-deck` — Prospect deck'i (uçtan uca)

10 adım · 1 yetenek isteyen · 1 insan kapısı

| adım | fiil | yetenek | bağımlı | kapı | isteğe bağlı |
|---|---|---|---|---|---|
| `cozumle` | `RESOLVE` | — | — | — | — |
| `prospect-sec` | `SELECT` | — | cozumle | — | — |
| `arastir` | `INGEST` | — | prospect-sec | — | — |
| `urun-ekrani` | `RENDER` | — | cozumle | — | — |
| `bilgi-sec` | `SELECT` | — | arastir | — | — |
| `metin-uret` | `GENERATE` | `text.generate` | bilgi-sec | — | — |
| `kompozit` | `COMPOSE` | — | metin-uret, urun-ekrani | — | — |
| `render` | `RENDER` | — | kompozit | — | — |
| `olgu-dogrulama` | `VALIDATE` | — | render | — | — |
| `onay` | `PROPOSE` | — | olgu-dogrulama | insan-onayi | — |

## `reels` — Reels (demo bölümlerinden türetme)

5 adım · 0 yetenek isteyen · 1 insan kapısı

| adım | fiil | yetenek | bağımlı | kapı | isteğe bağlı |
|---|---|---|---|---|---|
| `cozumle` | `RESOLVE` | — | — | — | — |
| `bolumleri-oku` | `SELECT` | — | cozumle | — | — |
| `kirp` | `RENDER` | — | bolumleri-oku | — | — |
| `kalite` | `VALIDATE` | — | kirp | — | — |
| `onay` | `PROPOSE` | — | kalite | insan-onayi | — |
