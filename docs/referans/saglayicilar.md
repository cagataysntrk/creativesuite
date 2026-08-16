# Sağlayıcı kataloğu

> ⚠ **ÜRETİLMİŞ DOSYA — elle düzenleme** (R-65). Üreteci: `just docs`.
> Kaynak: `registry/providers/*.provider.yaml`. Elle yapılan düzenleme
> `just docs` çalıştığında kaybolur; `docs-drift` kapısı sapmayı yakalar.

Toplam **6** tanımlayıcı.

| id | başlık | adaptör | durum | yetenek | şerit | fiyat anlık görüntüsü |
|---|---|---|---|---|---|---|
| `chatterbox` | Chatterbox Multilingual V3 (yerel, MIT) | `pending` ⚠ gövde yok | ⏸ kapalı | `audio.tts` | free | — |
| `claude-code` | Claude Code (headless) | `claude-code` | ✅ aktif | `text.generate` | free | — |
| `cloudflare-workers-ai` | Cloudflare Workers AI (bedava şerit) | `cloudflare-workers-ai` | ✅ aktif | `image.generate` | free | `_pricing/cloudflare-2026-08-16.json` |
| `elevenlabs` | ElevenLabs (premium şerit) | `pending` ⚠ gövde yok | ⏸ kapalı | `audio.tts` | premium | — |
| `fal-flux` | FLUX (fal) | `fal-flux` | ⏸ kapalı | `image.generate` | premium | `_pricing/fal-2026-08-15.json` ⚠ doğrulanmamış |
| `gemini-tts` | Gemini TTS (bedava şerit) | `pending` ⚠ gövde yok | ⏸ kapalı | `audio.tts` | free | — |

## Desteklenen kısıtlar

### `chatterbox`

- **audio.tts** — şerit: free
  - `locale`: `tr-TR`
  - `clone`: `true` · `false`

### `claude-code`

- **text.generate** — şerit: free
  - `locale`: `tr-TR` · `en-US`
  - `max_chars`: `2200` · `3000` · `10000`

### `cloudflare-workers-ai`

- **image.generate** — şerit: free
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

### `gemini-tts`

- **audio.tts** — şerit: free
  - `locale`: `tr-TR`
  - `clone`: `false`
