# Beceri — Instagram karoseli üret

**Süre:** ~6–10 dakika · **Maliyet:** bedava şeritte $0 · **Durak:** insan onay kapısı

## Komut

```
sops exec-env secrets/secrets.enc.yaml 'just uret instagram-karosel "<konu>"'
```

Panelden de başlatılabilir — `just dev` → `Üret`. Panel `sops`u kendisi çağırır ve
koşuyu adım adım gösterir; kapılar aynı kapılardır.

Şablonu kendin seçmek istersen `--sablon <ad>` ekle (`veri-hikayesi` · `akan-alan` ·
`sahne` · `memphis` · `donen` · `editoryal`). `donen` ve `editoryal` **yalnız** böyle
seçilebilir; ötekiler içerikten kendiliğinden seçilir.

Konu Türkçe, tek cümle, iddia içeren bir şey olmalı: *"Geri kazanım oranı 2019'dan
bugüne nasıl değişti"* gibi. Soru da olabilir, liste de.

### Konuyu sistem seçsin

```
sops exec-env secrets/secrets.enc.yaml 'just uret instagram-karosel --konu-sec'
```

Konu **uydurulmaz, seçilir**: adaylar markanın kendi kayıtlarının başlıkları (ürün,
strateji, kanıt — tür başına tavanla çeşitlendirilir), geçmişte işlenenler elenir ve
hattın `konu-sec` adımı birini seçip gerekçesini deftere yazar. Listede olmayan bir
konu yazılırsa adım `TOPIC_NOT_IN_CANDIDATES` ile durur — kaynaksız bir konu,
kaynaksız bir iddianın başlangıcıdır (Yasa 8).

Aday kalmadıysa hat başlamadan durur ve söyler: yeni bir corpus kaydı ekle ya da
konuyu elle yaz.

### Onaydan sonra sürdürmek

```
sops exec-env secrets/secrets.enc.yaml 'just uret instagram-karosel --devam <run_id>'
```

Panelden onayladıysan bunu yazmana gerek yok — panel sürdürmeyi kendisi tetikler.
Sürdürme, koşunun **kendi** parametrelerini okur (`kosu-parametreleri.json`); komut
satırındaki bayraklardan yeniden türetmez.

## Ne olacak

```
cozumle → bilgi-sec → metin-uret → sablon-uyarla → kompozit
  → gorsel-brief → gorsel-uret → gorsel-kirp → yuva-doldur → render
  → gorsel-yargi → tasarim-yargi → kalite → ⏸ insan-onayi
```

- **Şablon SEÇİLİR, icat edilmez** (Yasa 13). Seçim içeriğin ölçülen şeklinden çıkar:
  zaman serisi → `veri-hikayesi`, numaralı ritim → `akan-alan`, soru ritmi → `memphis`,
  anlatı → `sahne`. Seçilemezse hat **DURUR** — sessizce varsayılana düşmez.
- **Karosel tek geniş tuvalde çizilir** (N × 1080 × 1350) ve sonra dilimlenir.
  Süreklilik bir efekt değil, tuvalin kendisi.
- **Türkçe metin görsel modeline çizdirilmez** (Yasa 3). Model metinsiz üretir,
  metin gerçek fontla kompozit edilir.

## Nerede biter

```
derived/runs/<run_id>/
  panorama.json      ← kompozisyon (okunur, düzenlenebilir)
  gorsel-NN.png      ← üretilmiş görseller (git'e girmez)
  manifest.json      ← koşu defteri: adımlar, maliyet, kusurlar
```

Slaytlar `derived/blobs/` altında içerik adresli durur; yolları `manifest.json`
içindeki `render-son` adımının `slides` alanında.

## Sonuç iyi değilse

| Belirti | Yapılacak |
|---|---|
| Kompozisyon iyi, metin kötü | `just duzenle` → koşuyu seç → metne tıkla, yaz |
| Görsel yanlış yerde | `just duzenle` → ✥ taşı modu → sürükle |
| Şablon yanlış seçilmiş | `--sablon <ad>` ekle: `just uret instagram-karosel "<konu>" --sablon sahne` |
| `kusurlar` dolu | Kusuru OKU — `matlama-tutmuyor` arka planın silinmediğini, `punto-cokmesi` bir kelimenin çok uzun olduğunu söyler |

## Yapma

- ⛔ `derived/runs/` altını silme — çalıştırma defteri türetilemez (Yasa 11).
- ⛔ Üretilmiş PNG'yi elle düzenleyip geri koyma — üreteci düzelt, çıktıyı değil.
- ⛔ Kaynaksız sayı yayınlama — `claim_source` zorunlu (Yasa 8).
