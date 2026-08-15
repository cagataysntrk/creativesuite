---
paths: ["registry/**"]
---

# Registry düzenlerken (Ring 1)

Burası **senin alanın** — çalışma anında değişir, kernel'e dokunmadan.

## Kurallar

- **Model adı yazma** (R-40). Pipeline yetenek + kısıt ister:
  `capability: image.generate` + `constraints: {aspect: "4:5", max_cost_try: 2}`.
  Model ID'si yazmak, sağlayıcı öldüğü gün kırılan bir varsayımdır.
- **Şema profili dışına çıkma** (§3.3). Yasak: `unevaluatedProperties`, `$dynamicRef`,
  `if/then/else`, `patternProperties`, `not`, `oneOf`. Varyant için açık ayırt edici
  alan kullan (`kind: 'saas' | 'bespoke'`).
- **Sağlayıcı yanıt şekli sınırı geçemez** (R-43). Adaptör SDK tipini dışarı sızdırmaz.
- **`estimate()` senkron ve saf** (R-42) — ağ kullanmaz, `async` derleme hatası.

## Şema değiştirirken

Kaydetmeden önce **tüm corpus'a karşı dry-run** çalışır ve kaç kaydın kırılacağını
sayıyla söyler. Yıkıcı değişiklik codemod olmadan reddedilir. Alan silmek yerine
`x-retired: true` — tarihsel kayıtlar okunabilir kalsın.

## Değiştirdikten sonra

`just gate registry` ve `just gate schemas` yeşil olmalı. Üretilmiş
`schemas/*.schema.json` commit'lenir; sürüklenme kapıda yakalanır.
