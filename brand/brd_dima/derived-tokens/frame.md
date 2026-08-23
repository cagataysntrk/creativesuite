<!-- ÜRETİLMİŞ — elle düzenleme (R-65). Kaynak: brand/<id>/tokens/ + theme.css -->
# frame.md — brd_dima · dima-2026

Hareket kompozisyonları bu tanımları kullanır. **İkinci bir palet ve ikinci bir
ölçek YOKTUR**: hareket için ayrı renk ya da ayrı tip ölçeği tanımlamak, iki marka
gerçeği demektir (§7.4, §4.1).

## Renk rolleri — MARKAYA ait

Kaynak `brand/<id>/tokens/`. Ham rampaya (`ramp.*`) kompozisyon ASLA dokunmaz;
yüzey değiştiğinde rol değişir, kompozisyon değişmez (§4.1).

| Rol | CSS değişkeni |
|---|---|
| `role.accent` | `var(--role-accent)` |
| `role.bg` | `var(--role-bg)` |
| `role.line-hair` | `var(--role-line-hair)` |
| `role.state-error` | `var(--role-state-error)` |
| `role.state-ok` | `var(--role-state-ok)` |
| `role.state-warn` | `var(--role-state-warn)` |
| `role.surface` | `var(--role-surface)` |
| `role.text` | `var(--role-text)` |
| `role.text-muted` | `var(--role-text-muted)` |

## Tip ölçeği — SİSTEME ait

Dokuz boyut, kabuk marka-nötr olduğu için markadan bağımsız (§12.2). Ölçülen her
sayı mono ve tabular; ağırlık 700 konsolda YASAK.

| Değişken | Değer |
|---|---|
| `--size-1` | 11px |
| `--size-2` | 12px |
| `--size-3` | 13px |
| `--size-4` | 14px |
| `--size-5` | 16px |
| `--size-6` | 18px |
| `--size-7` | 22px |
| `--size-8` | 28px |
| `--size-9` | 36px |

## Boşluk — 4px temel birim

Yalnız bu adımlar; 5 ve 7 YOKTUR. İçerik sığmıyorsa tip küçültülmez, satır
gevşer (§12.3).

| Değişken | Değer |
|---|---|
| `--space-1` | 4px |
| `--space-2` | 8px |
| `--space-3` | 12px |
| `--space-4` | 16px |
| `--space-6` | 24px |
| `--space-8` | 32px |

## Hareket — beyaz liste

**Hiçbiri 320ms'yi geçmez** (§12.7). Animasyonlanan altı şey: yüzey geçişi,
dialog açılışı, satır vurgusu, durum noktası, ilerleme rayı, odak halkası.
Sayı animasyonu, liste yeniden sıralama, skeleton parıltısı ve grafik çizilme
**yasak** — hareket dikkat çeker ve dikkat sınırlı bir bütçedir.

`prefers-reduced-motion: reduce` altında üçü de **0ms** olur. Tablo `:root`
değerlerini gösterir; ezme gizlenmiyor, ayrı bir gerçek olarak burada yazıyor.

| Değişken | Değer |
|---|---|
| `--dur-instant` | 90ms |
| `--dur-quick` | 160ms |
| `--dur-surface` | 320ms |
