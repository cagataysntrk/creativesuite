# Pipeline kataloğu

> ⚠ **ÜRETİLMİŞ DOSYA — elle düzenleme** (R-65). Üreteci: `just docs`.
> Kaynak: `registry/pipelines/*.pipeline.yaml`. `docs-drift` kapısı sapmayı yakalar.

Toplam **4** hat.

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
