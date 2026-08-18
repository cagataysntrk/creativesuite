# SKILLS — sıfır bağlamla ne yapılır

Bu dosya **depoyu hiç görmemiş** bir agent (ya da insan) içindir. `CLAUDE.md` derin
bağlam için yazıldı; burası tek ekranda iş bitirmek için.

> Kural: buradaki hiçbir komut depoyu bilmeyi gerektirmez. Bir komut açıklamadan
> anlaşılmıyorsa **komut yanlıştır**, okuyucu değil.

## Önce bir kez

```
just setup      # araç zinciri eksiklerini ADIYLA sayar
```

## Ne üretebilirim

| İstenen | Beceri dosyası | Tek komut |
|---|---|---|
| Instagram karoseli (4–8 slayt) | `docs/skills/karosel.md` | `sops exec-env secrets/secrets.enc.yaml 'just uret instagram-karosel "<konu>"'` |
| Üretilmiş bir karoseli elle düzeltmek | `docs/skills/duzenleyici.md` | `just duzenle` |

## Sık gereken tek ek

`--sablon <ad>` — şablonu kendin seç. `donen` ve `editoryal` yalnız böyle seçilebilir.

## Üç şey, her seferinde

1. **Hat insan kapısında DURUR.** `⏸ insan kapısında durdu` çıktısı hata değil,
   tasarımdır: onay bir git commit'idir (Yasa 2).
2. **Görsel üreten koşu `sops exec-env` ile başlar.** Anahtarsız koşuda hat
   *"yerel önkoşul sağlanmadı"* der — bu sağlayıcı yokluğu DEĞİLDİR.
3. **Çıktıya BAK.** Denetim ölçüyor ama estetiğe karar vermiyor. Slaytları aç,
   gözünle gör, gerekiyorsa `just duzenle` ile düzelt.
