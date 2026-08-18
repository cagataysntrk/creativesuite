# Beceri — üretilmiş işi elle düzelt

```
just duzenle          # http://localhost:4321
```

Aynı render motoru bir iframe'de çalışır: **gördüğün şey ihraç edilen şeydir.**
Düzenlenen şey piksel değil **veri** — bu yüzden düzeltmen bir sonraki konuda da
kullanılabilir.

## İki mod

| Mod | Ne yapar |
|---|---|
| ✎ **yaz** | Metne tıkla, yaz. Görseli sürükle → taşı. Shift+sürükle → ölçekle. |
| ✥ **taşı** | Metni sürükle → kaydır. Shift+sürükle → punto. Seç + ⌫ → **sil**. |

`**yıldız**` işareti vurguyu korur; yazarken silme.

## İki hedef

| Seçim | Kaydedince ne olur |
|---|---|
| **ŞABLON** (`veri-hikayesi`, `sahne`…) | `packages/render/src/katalog-ornek.ts` **cerrahi** güncellenir — yalnız değişen satır, yorumlar yerinde. Altı tasarımın kendisi değişir. |
| **KOŞU** (`01a0152c-ad40`…) | Yalnız o karosel değişir: `panorama-elle.json` yazılır ve slaytlar `slayt-NN-elle.png` olarak **yeniden çizilir**. |

⚠ Şablon yazımı bir **öneri**dir (Yasa 2): `git diff` ile bak, onay senin commit'in.

## Sınırlar — bilerek

- Metne **mutlak konum verilmez**; verilen şey ızgaranın üstünde sınırlı bir pay
  (kayma ±260 px, punto çarpanı 0,5–2). Sınırsız olsaydı şablon şablon olmaktan çıkardı.
- Renk **marka rampasından** seçilir, serbest hex kabul edilmez.
- Alt paneldeki kusur listesi canlıdır; düzenlerken bozarsan orada görürsün.

## Takılırsan

| Belirti | Sebep |
|---|---|
| Sayfa boş | Eski bir tezgâh 4321'i tutuyor: `pkill -f scripts/duzenleyici.mjs` |
| Değişiklik kaydedilmiyor | ŞABLON modunda eski değer blokta birden çok geçiyor olabilir — panel sebebi yazar |
| Metin sürüklenmiyor | ✎ yaz modundasın; ✥ taşı moduna geç |
