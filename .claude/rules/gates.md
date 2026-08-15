---
paths: ["scripts/gates/**", ".githooks/**"]
---

# Kapı yazarken

## Tek kural, her şeyden önemli

**Yeşil bir kapı hiçbir şey kanıtlamaz** (R-71). Bir kapıyı yazdıktan sonra
**kasten ihlal et** ve kırmızıya döndüğünü gör. Görmeden tikleme.

Bu soyut bir tavsiye değil — 2026-08-15'te `repo-hygiene`'in secret deseni
`sk-[A-Za-z0-9]{20,}` idi ve gerçek Anthropic anahtarını (`sk-ant-api03-…`)
tirede durduğu için **kaçırıyordu**. Kapı yeşil raporluyordu. Yalnız ihlal
testi ortaya çıkardı (D-49).

## Yapı

- Her kapı `scripts/gates/<ad>.sh` veya `.mjs`; ikinci satırda `# GROUP: fast|all`
  (`.mjs` için `// GROUP:`)
- `just gate <ad>`, `lefthook` ve zamanlanmış iş **aynı betiği** çağırır —
  "yerelde yeşil, CI'da kırmızı" yapısal olarak imkânsız
- Kapı mantığı YAML'da yaşamaz
- Çıkış kodu tek gerçektir; mesaj yardımcıdır

## Yanlış pozitif de bir hatadır

Sürekli yanlış alarm veren kapı, kapatılan kapıdır. Yer tutucuları (`LOOP§X`,
`FAZ-0.x`, `D-nn`) ve örnekleri atlamayı unutma.
