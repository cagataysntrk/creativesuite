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

## Sayaç: 1/20 — ÇAKIŞMA nedeniyle SIFIRLANDI

| # | Konu | Slayt | Metrikler | Görsel inceleme | Sonuç |
|---|---|---|---|---|---|
| 1 | fire kayıtları nerede tutuluyor | 5 | kapak 6 · gövde 21 · kapanış 8 · kontrast 10,5 / 18,1 | kapanış: mürekkep alan, hayalet 5, gerçek davet | ✓ |
| 2 | planlanan bakım neden ertelenir | 5 | kapak 6 · gövde 20/24/17 · kapanış 9 | kapak: 6 kelime, tek güçlü ifade, metin tek alanda | ✓ |
| 3 | stok sayımı neden tutmuyor | 5 | kapak 7 · gövde 21/24/20 · kapanış 7 | gövde 3: liste ritmi doğru, sayaç bandı açık; **alt yarı boş** | ✓ |
| 4 | kalite sapması kimin sorumluluğunda | 5 | kapak 5 · gövde 22/19/18 · kapanış 6 | gövde 4 (görselli): fotoğraf metinsiz/insansız ✓, ama **her yanında eşit boşlukla duran bir kutu** | ✓ |
| 5 | makine duruşları nasıl sınıflandırılır | 4 | bütçe %63 / %77 / %67 / %63 / %30 | kapak: başlık 5 kelime, destek paragrafı, kompozisyon temiz | ✓ |
| — | *(sayaç burada sıfırlandı — aşağıya bak)* | | | | ✗ |
| 1 | kompresör kaçakları nasıl bulunur | 5 | bütçe %75 / %67 / %63 / %53 / %23 | gövde 3 (görselli): görsel çerçeve kenarına taşıyor, çakışma YOK, tek gövde bloğu | ✓ |

## Sıfırlanan koşular

| Konu | Düşme sebebi | Düzeltme |
|---|---|---|
| enerji tüketimi (2. deneme) | **ÇAKIŞMA — kritik.** Son gövde satırı `kaydır ››` ile üst üste bindi | Görsel sayfalamada **SIFIR bütçe** harcıyordu; 180 karakter verildi |
| kompresör kaçakları (1. deneme) | `IMAGE_PROMPT_REJECTED · matched: "lettering"` (R-20) | Yasak kelime **kendi prompt'umda** geçiyordu ve model yankılıyordu; kaldırıldı |
| vardiya devri (ilk deneme) | `kalite`: fotoğraflı slayt palet dışı %17,7 | D-258 — görsel içeren slaytta renk metriği ölçülmez |
| fire kayıtları (2. deneme) | kapak 21 kelime (limit 8), gövde 40 (limit 30) | prompt'a örnek biçim + sayım talimatı |
| fire kayıtları (3. deneme) | gövde 41 kelime — **birim uyuşmazlığı, ölçenin hatası** | T8 artık en uzun BLOĞU ölçüyor (D-260) |

## ⚠ Sayaç bir kez SIFIRLANDI ve GERİ ALINDI — gerekçesi

Koşu 5 ilk denemede `kalite`de düştü: *"en uzun satır (kapak) 21,0 · limit 8"*. Sayaç
sıfırlandı. **Sonra görsele bakıldı ve metrik yanlış çıktı:** başlık 5 kelimeydi
(*"Duruşları ayırmadan hiçbir duruşu çözemezsiniz"*); 21 kelime olan şey aynı slayttaki
destekleyici GÖVDE satırıydı ve o meşru. Metrik, slaytın ROL bütçesini o slayttaki HER
bloğa uyguluyordu.

**Bu, aynı metrikteki ÜÇÜNCÜ birim hatasıydı** (önce slayt toplamı, sonra en uzun blok
ama yanlış bütçeyle, şimdi blok TÜRÜNE göre). Düzeltildi ve aynı konu yeniden koşuldu:
geçti.

**Sayaç 5'te bırakıldı, 1'e değil.** Gerekçe: eski metrik gövde blokları için daha SIKI
idi — yalnız yanlış DÜŞÜŞ üretebilirdi, yanlış GEÇİŞ değil. Dolayısıyla 1–4 arası
koşuların geçişi yeni metrikte de geçerli. Bu muhakeme burada yazılı olmasaydı sayaç
kendi lehime yorumlanmış olurdu.

## İzlenen zayıflıklar — kusur değil, örüntü adayı

Bunlar sayacı sıfırlamıyor: kırpma, çakışma ya da okunamama değiller. Ama tekrar
ederlerse kural olurlar. **Tek bir koşudan kural çıkarmak, gürültüyü tasarım sanmaktır.**

| Gözlem | İlk görüldüğü koşu | Tekrar |
|---|---|---|
| İki maddelik gövde slaytında alt yarı boş kalıyor (`list` düzeni `flex-start`) | 3 | — |
| ~~Görsel eşit boşluklu bir KUTU olarak duruyor~~ | 4 | **3. tekrarda KURAL YAZILDI ve düzeltildi:** görsel dış çerçeve kenarına taşıyor, artık bir ALAN. Ayrıca gövdenin ORTASINA taşındı — sonda olduğunda kapanış slaydını kapatıyor, kapanış cümlesini altına sıkıştırıyordu. |

**Örüntü doğrulandı ve kapandı.** Üç gözlem aynı şeyi söylüyordu: *kompozisyon çerçeveyi
kendine güvenerek kullanmıyor.* Kural üçüncüde yazıldı — tek gözlemden kural çıkarmak
gürültüyü tasarım sanmaktı, ama üç gözlemi beklemek de kusuru üç kez üretmek demekti.
