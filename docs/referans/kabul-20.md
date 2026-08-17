# Kabul koşusu defteri — 20 ARDIŞIK temiz karosel

> **ÜRETİLMİŞ DEĞİL, ELLE TUTULUYOR** (FAZ-10.7 · D-255). Her koşu buraya yazılır:
> geçen VE düşen. Düşen bir koşuyu silmek, sayacı yalan yapar.

**Kural:** sayaç ARDIŞIK sayar. Bir koşu `kalite`de düşerse ya da görsel incelemede
kritik kusur çıkarsa **sıfırlanır**, kusur düzeltilir, baştan sayılır.
*"20 üretildi, 17'si iyiydi"* geçmez — oran, düzeltilmemiş bir kusurun kuyruğunu gizler.

**Neden ardışık:** ardışıklık, düzeltmenin gerçekten kapandığını kanıtlayan tek ölçüdür.
Bu fazda ölçüm aracının kendisi on kez bozuk çıktı ve her seferinde ancak koşup bakınca
görüldü; oranla ölçseydik o kusurlar "kabul edilebilir gürültü" sayılırdı.

---

## Sayaç: 3/20

| # | Konu | Slayt | Metrikler | Görsel inceleme | Sonuç |
|---|---|---|---|---|---|
| 1 | fire kayıtları nerede tutuluyor | 5 | kapak 6 · gövde 21 · kapanış 8 · kontrast 10,5 / 18,1 | kapanış: mürekkep alan, hayalet 5, gerçek davet | ✓ |
| 2 | planlanan bakım neden ertelenir | 5 | kapak 6 · gövde 20/24/17 · kapanış 9 | kapak: 6 kelime, tek güçlü ifade, metin tek alanda | ✓ |
| 3 | stok sayımı neden tutmuyor | 5 | kapak 7 · gövde 21/24/20 · kapanış 7 | gövde 3: liste ritmi doğru, sayaç bandı açık; **alt yarı boş** | ✓ |

## Sıfırlanan koşular

| Konu | Düşme sebebi | Düzeltme |
|---|---|---|
| vardiya devri (ilk deneme) | `kalite`: fotoğraflı slayt palet dışı %17,7 | D-258 — görsel içeren slaytta renk metriği ölçülmez |
| fire kayıtları (2. deneme) | kapak 21 kelime (limit 8), gövde 40 (limit 30) | prompt'a örnek biçim + sayım talimatı |
| fire kayıtları (3. deneme) | gövde 41 kelime — **birim uyuşmazlığı, ölçenin hatası** | T8 artık en uzun BLOĞU ölçüyor (D-260) |

## İzlenen zayıflıklar — kusur değil, örüntü adayı

Bunlar sayacı sıfırlamıyor: kırpma, çakışma ya da okunamama değiller. Ama tekrar
ederlerse kural olurlar. **Tek bir koşudan kural çıkarmak, gürültüyü tasarım sanmaktır.**

| Gözlem | İlk görüldüğü koşu | Tekrar |
|---|---|---|
| İki maddelik gövde slaytında alt yarı boş kalıyor (`list` düzeni `flex-start`) | 3 | — |
