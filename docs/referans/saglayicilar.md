# Sağlayıcı kataloğu

> ⚠ **ÜRETİLMİŞ DOSYA — elle düzenleme** (R-65). Üreteci: `just docs`.
> Kaynak: `registry/providers/*.provider.yaml`. Elle yapılan düzenleme
> `just docs` çalıştığında kaybolur; `docs-drift` kapısı sapmayı yakalar.

Toplam **3** tanımlayıcı.

| id | başlık | adaptör | durum | yetenek | şerit | fiyat anlık görüntüsü |
|---|---|---|---|---|---|---|
| `claude-code` | Claude Code (headless) | `claude-code` | ✅ aktif | `text.generate` | free | — |
| `cloudflare-workers-ai` | Cloudflare Workers AI (bedava şerit) | `cloudflare-workers-ai` | ⏸ kapalı | `image.generate` | free | `_pricing/cloudflare-2026-08-15.json` ⚠ doğrulanmamış |
| `fal-flux` | FLUX (fal) | `fal-flux` | ⏸ kapalı | `image.generate` | premium | `_pricing/fal-2026-08-15.json` ⚠ doğrulanmamış |

## Desteklenen kısıtlar

### `claude-code`

- **text.generate** — şerit: free
  - `locale`: `tr-TR` · `en-US`
  - `max_chars`: `2200` · `3000` · `10000`

### `cloudflare-workers-ai`

- **image.generate** — şerit: free
  - `aspect`: `1:1` · `4:5` · `9:16` · `16:9`
  - `no_text`: `true`

### `fal-flux`

- **image.generate** — şerit: premium
  - `aspect`: `1:1` · `4:5` · `9:16` · `16:9`
  - `no_text`: `true`
