# SKILLS — sıfır bağlamla ne yapılır

Bu dosya **depoyu hiç görmemiş** bir agent (ya da insan) içindir. `CLAUDE.md` derin
bağlam için yazıldı; burası tek ekranda iş bitirmek için.

> Kural: buradaki hiçbir komut depoyu bilmeyi gerektirmez. Bir komut açıklamadan
> anlaşılmıyorsa **komut yanlıştır**, okuyucu değil.

## Önce bir kez

```
just setup      # araç zinciri eksiklerini ADIYLA sayar
```

## İki yol var: PANEL ya da komut satırı

**Panel** — başlatmak, her kapıda onaylamak ve koşuyu canlı izlemek tek yerden:

```
just dev                 # http://localhost:5173
```

`Üret` sekmesi: tür seç (karosel · post · reels · deck …), konu yaz **ya da**
"konuyu sistem seçsin" işaretle, `Başlat`. Ekran koşuya geçer: adım defteri, ilerleme
çubuğu, üretilen metin ve slaytlar. Her kapıda `✓ onayla` / `✗ reddet` — onay hattı
kendiliğinden sürdürür.

⚠ `just dev` gizli anahtarları **kendisi** açar (`sops`); ayrıca sarmalaman gerekmez.
Anahtar yoksa panel bunu söyler ve `Başlat` kilitli kalır — sessizce boş çıktı üretmez.

**Komut satırı** — aynı hat, aynı kapılar:

| İstenen | Beceri dosyası | Tek komut |
|---|---|---|
| Instagram karoseli (4–8 slayt) | `docs/skills/karosel.md` | `sops exec-env secrets/secrets.enc.yaml 'just uret instagram-karosel "<konu>"'` |
| **Konuyu sistem seçsin** | aynı | `… 'just uret instagram-karosel --konu-sec'` |
| Duran bir koşuyu onaydan sonra sürdürmek | aynı | `… 'just uret instagram-karosel --devam <run_id>'` |
| Üretilmiş bir karoseli elle düzeltmek | `docs/skills/duzenleyici.md` | `just duzenle` |

## Sık gereken iki ek

`--sablon <ad>` — şablonu kendin seç. `donen` ve `editoryal` yalnız böyle seçilebilir.

`--konu-sec` — konuyu **hattın agent'ı** seçer: adaylar markanın kendi kayıtlarının
başlıkları, geçmişte işlenenler elenir, seçimin gerekçesi deftere yazılır. Listede
olmayan bir konu yazılırsa adım hata verir — kaynaksız konu, kaynaksız iddianın
başlangıcıdır.

## Üç şey, her seferinde

1. **Hat insan kapısında DURUR.** `⏸ insan kapısında durdu` çıktısı hata değil,
   tasarımdır: onay bir git commit'idir (Yasa 2).
2. **Görsel üreten koşu `sops exec-env` ile başlar.** Anahtarsız koşuda hat
   *"yerel önkoşul sağlanmadı"* der — bu sağlayıcı yokluğu DEĞİLDİR.
3. **Çıktıya BAK.** Denetim ölçüyor ama estetiğe karar vermiyor. Slaytları aç,
   gözünle gör, gerekiyorsa `just duzenle` ile düzelt.
