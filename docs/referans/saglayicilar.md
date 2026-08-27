# Sağlayıcı kataloğu

> ⚠ **ÜRETİLMİŞ DOSYA — elle düzenleme** (R-65). Üreteci: `just docs`.
> Kaynak: `registry/providers/*.provider.yaml`. Elle yapılan düzenleme
> `just docs` çalıştığında kaybolur; `docs-drift` kapısı sapmayı yakalar.

Toplam **8** tanımlayıcı.

| id | başlık | adaptör | durum | yetenek | şerit | fiyat anlık görüntüsü |
|---|---|---|---|---|---|---|
| `chatterbox` | Chatterbox Multilingual V3 (yerel, MIT) | `pending` ⚠ gövde yok | ⏸ kapalı | `audio.tts` | free | — |
| `claude-code` | Claude Code (headless) | `claude-code` | ✅ aktif | `image.critique`<br>`design.critique`<br>`text.generate` | free | `_pricing/claude-code-2026-08-19.json` |
| `cloudflare-workers-ai` | Cloudflare Workers AI (bedava şerit) | `cloudflare-workers-ai` | ✅ aktif | `image.generate` | free, premium | `_pricing/cloudflare-2026-08-28.json` |
| `elevenlabs` | ElevenLabs (premium şerit) | `pending` ⚠ gövde yok | ⏸ kapalı | `audio.tts` | premium | — |
| `fal-flux` | FLUX (fal) | `fal-flux` | ⏸ kapalı | `image.generate` | premium | `_pricing/fal-2026-08-15.json` ⚠ doğrulanmamış |
| `gemini-image` | Google Gemini görsel (nano banana · premium şerit) | `gemini-image` | ⏸ kapalı | `image.generate` | premium | `_pricing/gemini-image-2026-08-28.json` |
| `gemini-tts` | Gemini TTS (bedava şerit) | `pending` ⚠ gövde yok | ⏸ kapalı | `audio.tts` | free | — |
| `local-rembg` | Yerel arka plan silici (BRIA RMBG, CPU) | `local-rembg` | ✅ aktif | `image.matte` | free | `_pricing/local-rembg-2026-08-19.json` |

## Desteklenen kısıtlar

### `chatterbox`

- **audio.tts** — şerit: free
  - `locale`: `tr-TR`
  - `clone`: `true` · `false`

### `claude-code`

- **image.critique** — şerit: free
  - `locale`: `tr-TR`
- **design.critique** — şerit: free
  - `locale`: `tr-TR`
- **text.generate** — şerit: free
  - `locale`: `tr-TR` · `en-US`
  - `max_chars`: `2200` · `3000` · `10000`

### `cloudflare-workers-ai`

- **image.generate** — şerit: free, premium
  - `aspect`: `1:1` · `4:5` · `9:16` · `16:9`
  - `no_text`: `true`

### `elevenlabs`

- **audio.tts** — şerit: premium
  - `locale`: `tr-TR`
  - `clone`: `true` · `false`

### `fal-flux`

- **image.generate** — şerit: premium
  - `aspect`: `1:1` · `4:5` · `9:16` · `16:9`
  - `no_text`: `true`

### `gemini-image`

- **image.generate** — şerit: premium
  - `aspect`: `1:1` · `4:5` · `9:16` · `16:9`
  - `no_text`: `true`

### `gemini-tts`

- **audio.tts** — şerit: free
  - `locale`: `tr-TR`
  - `clone`: `false`

### `local-rembg`

- **image.matte** — şerit: free
