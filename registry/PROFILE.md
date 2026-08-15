# PROFILE — izin verilen JSON Schema alt kümesi

Ring 1'deki her varlık tipi (`registry/entity-types/*.type.yaml`) **JSON Schema 2020-12**
yazar, ama tamamını değil. Bu dosya izin verilen alt kümeyi tanımlar; `registry` kapısı
zorlar. → §3.3

## Neden bir alt küme

Tek şema **dört hedefe** derlenir (§3.4): rjsf form şeması · TypeScript tipi · **katı LLM
şeması** · SQLite DDL. Tam JSON Schema'nın ifade gücü bu dördünde eşit değildir:

- **rjsf** `if/then/else` ve `dependentSchemas`'ı kısmen destekler; desteklemediğinde
  form sessizce yanlış alan gösterir.
- **LLM yapılandırılmış çıktısı** (OpenAI ve Anthropic) `oneOf`, `not`,
  `patternProperties` ve `$dynamicRef` kabul etmez. Şema reddedilirse model serbest
  metin döndürür ve pipeline "geçerli" sanıp devam eder.
- **SQLite DDL** için bir alanın tipi tek olmak zorunda; `oneOf` sütun tipi üretemez.

Yani profil dışı bir anahtar, **dört projeksiyondan en az birini sessizce bozar.**
Sessiz bozulma bu sistemin en pahalı hata sınıfıdır: çıktı üretilir, kimse fark etmez.

## Yasak anahtarlar

| Anahtar | Neden yasak | Yerine |
|---|---|---|
| `oneOf` | LLM şeması reddeder; DDL tip üretemez | açık ayırt edici alanla `anyOf` |
| `not` | Hiçbir projeksiyona çevrilmez | kısıtı pozitif ifade et |
| `if` / `then` / `else` | rjsf kısmi destekler, DDL hiç | ayrı varyant tipi |
| `patternProperties` | Form alanı üretilemez, sütun adı bilinemez | sabit alan adları |
| `unevaluatedProperties` | 2020-12'ye özgü; araç desteği tutarsız | `additionalProperties: false` |
| `$dynamicRef` / `$dynamicAnchor` | Çözümü çalışma zamanına bağlı | `$ref` |
| `dependentSchemas` | Koşullu şema — `if/then` ile aynı sorun | ayrı varyant tipi |
| `propertyNames` | Anahtar kümesi çalışma zamanında belirlenir | sabit alan adları |
| `contains` / `minContains` / `maxContains` | DDL karşılığı yok | uygulama seviyesi doğrulama |

## Varyantlar nasıl yazılır

Ayrım **açık bir alanla** yapılır, şema yapısıyla değil:

```yaml
# ✅ doğru — ayırt edici alan görünür, dört projeksiyon da çevirebilir
properties:
  kind:
    type: string
    enum: [saas, bespoke]
  seat_count:
    type: integer        # yalnız kind=saas için anlamlı; zorunluluk uygulama katmanında
additionalProperties: false
required: [kind]
```

```yaml
# ❌ yanlış — LLM şeması bunu reddeder, DDL sütun üretemez
oneOf:
  - properties: { kind: { const: saas }, seat_count: { type: integer } }
  - properties: { kind: { const: bespoke }, scope_note: { type: string } }
```

## Zorunlu kurallar

- Her nesne `additionalProperties: false` taşır. Katı LLM şeması bunu şart koşar;
  koymayan bir şema modelin uydurduğu alanı **sessizce kabul eder**.
- Her alan `type` taşır. Tipsiz alan DDL'de sütun olamaz.
- `$ref` yalnız aynı dosya içine veya `registry/entity-types/` altına.
- Alan adları `snake_case`, İngilizce (D-37).

## Profil dışına çıkmak gerekirse

Kural `KURALLAR.md`'de değişir, sonra kapıda. Sessiz istisna yok. Bir anahtarı serbest
bırakmak, dört projeksiyondan hangisinin bozulacağını **önceden yazmayı** gerektirir.
