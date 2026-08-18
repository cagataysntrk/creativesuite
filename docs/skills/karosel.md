# Beceri — Instagram karoseli üret

**Süre:** ~6–10 dakika · **Maliyet:** bedava şeritte $0 · **Durak:** insan onay kapısı

## Komut

```
sops exec-env secrets/secrets.enc.yaml 'just uret instagram-karosel "<konu>"'
```

Şablonu kendin seçmek istersen `--sablon <ad>` ekle (`veri-hikayesi` · `akan-alan` ·
`sahne` · `memphis` · `donen` · `editoryal`). `donen` ve `editoryal` **yalnız** böyle
seçilebilir; ötekiler içerikten kendiliğinden seçilir.

Konu Türkçe, tek cümle, iddia içeren bir şey olmalı: *"Geri kazanım oranı 2019'dan
bugüne nasıl değişti"* gibi. Soru da olabilir, liste de.

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
