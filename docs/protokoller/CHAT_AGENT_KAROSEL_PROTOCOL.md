# Chat Agent Carousel Protocol V1

**Durum:** SABİT — ilk gerçek UpcyTech OEE karoseli ile doğrulandı.

Bu protokol, CreativeSuite karosel üretiminde harici bir LLM'i “ana agent” yapmaz. Ana agent/editör/QA rolü ChatGPT oturumundadır. CreativeSuite tasarım sözleşmesi, kaynak kodu ve render/QA mantığı referanstır.

## 1. Amaç

UpcyTech sosyal medya karosellerini:

- öğretici,
- business odaklı,
- slogandan uzak,
- adım adım anlaşılır,
- ürün tanıtımını öğretici içeriğin doğal sonucu yapan,
- 1080×1440 / 3:4,
- PNG + JPEG,
- kaynaklı ve görsel QA'dan geçmiş

şekilde üretmek.

## 2. Rol ayrımı

### ChatGPT
ChatGPT aşağıdakileri bizzat yapar:

1. brief'i çözer;
2. gerekiyorsa web/GitHub kaynak araştırması yapar;
3. bilgi mimarisini kurar;
4. slayt metinlerini yazar;
5. CreativeSuite tasarım diline uygun kompozisyonu kurar;
6. kaynak belgeyi oluşturur/değiştirir;
7. render çıktısını görsel olarak açar;
8. **her slaydı tek tek** kontrol eder;
9. kırpılma, taşma, küçük punto, boş alan, tekrar, jargon, içerik kopukluğu ve ürün bağını düzeltir;
10. tekrar render eder;
11. ancak görsel kontrol tamamlandıktan sonra final ZIP teslim eder.

### GitHub
GitHub:

- kalıcı kaynak/protokol deposudur;
- iş dalları ve revizyon geçmişini tutar;
- GitHub-hosted Actions kullanılabiliyorsa deterministik render işçisi olarak kullanılabilir;
- artifact ve log sağlar.

### CreativeSuite
CreativeSuite:

- marka/tasarım sözleşmesi,
- **katalogdaki gerçek karosel şablonları,**
- seamless/panorama kompozisyon dili,
- typography/layout ilkeleri,
- mekanik QA ve render davranışı

için kanonik referanstır.

### Şablon önceliği — zorunlu

Karosel üretiminde varsayılan yol **CreativeSuite katalog şablonlarından birini temel almaktır**.
Şablonlar yalnız birer “hazır görünüm” değil, seamless kompozisyonun grameridir.

Mevcut aileler arasında örneğin:

- `veri-hikayesi`
- `akan-alan`
- `kavis`
- `alinti`
- `karsilastirma`
- `dizin`
- `sahne`
- `memphis`
- `donen`
- `editoryal`

bulunur.

ChatGPT önce içeriğin anlatı tipini belirler, sonra buna en uygun katalog şablonunu seçer.
**Generic kart dizisi ancak katalog grameri gerçekten yetersiz kalırsa fallback'tir.**

Şablonun korunması gereken kısmı onun görsel grameridir:

- seamless taşıyıcı;
- panorama sürekliliği;
- alan/eğri/ok/ölçek gibi kesimi aşan ana unsur;
- yüzey ve palet ailesi;
- grid ve tipografik hiyerarşi;
- marka ritmi.

Şablonun bağlayıcı OLMAYAN kısmı ise eski örneklerin sloganik içerik yoğunluğudur.
Eski şablon örnekleri kısa sloganlar için yazılmış olsa bile ChatGPT:

- başlık/gövde oranlarını değiştirebilir;
- body metnini açıklayıcı hale getirebilir;
- panel sayısını ve türünü uyarlayabilir;
- 6–9 slayta genişletebilir;
- listeleri, karşılaştırmaları, mini grafik ve mock-up'ları şablonun içine yerleştirebilir;
- gerektiğinde aynı şablon ailesinin yeni bir varyantını türetebilir.

Kural şudur: **içerik şablona ezdirilmez; şablon, öğretici içeriği taşıyacak biçimde adapte edilir.**
Ancak adaptasyon yapılırken seamless kimlik ve katalog ailesinin temel kompozisyon mantığı kaybedilmez.

## 3. Render sırası

### Yol A — GitHub-hosted render
Öncelikli yol, `.github/workflows/creative-carousel.yml` üzerinden GitHub-hosted Ubuntu runner'dır.

ChatGPT kaynak işi commit eder → Actions render/QA yapar → ChatGPT artifact'ı indirir → görsel QA → revizyon commit'i → tekrar.

### Yol B — ChatGPT container fallback
GitHub-hosted runner **iş başlamadan** tahsis edilemiyorsa (ör. job'da `runner_id: 0` ve `steps: []`) üretim durmaz.

Bu durumda:

- kaynak içerik ve protokol GitHub'da kalır;
- ChatGPT kendi container çalışma ortamında aynı 1080×1440 sözleşmeyle programatik render üretir;
- image generation kullanılmaz;
- kullanıcı bilgisayarı kullanılmaz;
- harici Claude/OpenAI API anahtarı gerekmez;
- aynı görsel/editoryal QA döngüsü uygulanır.

Fallback geçici “elle Photoshop” değildir: kaynak script/belge korunur ve çıktı yeniden üretilebilir olmalıdır.

## 4. İçerik standardı

Her karosel şu sorulara cevap vermelidir:

- Okuyucu burada ne öğrenecek?
- Kavram hangi sırayla anlaşılmalı?
- Hangi hata veya yanlış yorum önleniyor?
- Okuyucu bunu işinde nasıl uygular?
- UpcyTech/Dima bu yöntemin neresinde değer yaratır?

### Zorunlu anlatı ilkeleri

- Kapak merak uyandırır ama clickbait olmaz.
- Slayt 2–N-1 gerçek bilgi öğretir.
- Ürün, anlatının başına zorla sokulmaz.
- Ürün bağlantısı ideal olarak son %20–30'da gelir.
- “AI ile geleceği dönüştürün”, “verinin gücünü keşfedin” gibi boş sloganlar kullanılmaz.
- Jargon gerekiyorsa bağlam içinde açıklanır.
- Kaynaksız nicel başarı/ROI iddiası kullanılmaz.
- Caption slaytları aynen tekrar etmez; yöntemi derinleştirir.

## 5. Görsel standardı

Varsayılan:

- 1080×1440 px;
- 3:4;
- 6–9 slayt;
- **CreativeSuite katalog şablonu tabanlı;**
- **seamless panorama taşıyıcısı korunmuş;**
- UpcyTech: beyaz / siyah / marka mavisi;
- büyük ama dengeli tipografi;
- gerçek okunabilir gövde metni;
- fotoğraf veya AI görseli zorunlu değil;
- bilgi tasarımı: kart, liste, matris, akış, basit chart, mock-up, vektörel işaret;
- dekor yerine bilgi taşıyan görsel eleman.

### Şablon adaptasyon kontrolü

Final QA'da ayrıca şunlar kontrol edilir:

1. Hangi katalog şablonu temel alındı?
2. Seamless taşıyıcı gerçekten slaytlar arasında devam ediyor mu?
3. Adaptasyon sırasında şablonun karakteri kaybolmuş mu?
4. Şablon uğruna içerik gereksiz kısaltılmış mı?
5. Uzun açıklama için grid/panel/typography yeterince yeniden ayarlanmış mı?
6. Her slayt ayrı güzel olduğu kadar panorama halinde de tek iş gibi görünüyor mu?

**Amaç:** “şablona uyan kısa slogan” değil; “şablonun görsel gücünü kullanan güçlü öğretici anlatı”.

## 6. Slayt başına QA

Her slayt ayrı açılır ve kontrol edilir:

1. Metin tamamen görünüyor mu?
2. Cümle yarıda kesilmiş mi?
3. Mobilde okunabilir mi?
4. Başlık/gövde hiyerarşisi açık mı?
5. Gereksiz boşluk var mı?
6. Kart/etiketler taşmış mı?
7. Bir önceki slaytla doğal bağlantısı var mı?
8. Yeni bilgi ekliyor mu?
9. Marka görünürlüğü yeterli ama baskın değil mi?
10. Kaynak gerektiren iddia varsa izlenebilir mi?

**Contact sheet tek başına yeterli değildir.** Contact sheet genel ritim içindir; final kabulte slaytlar tek tek incelenir.

## 7. Revizyon kuralı

Render üzerinde piksel yaması yapılmaz.

Bir şablon içerik yoğunluğunu taşımıyorsa ilk çözüm onu terk etmek değildir. Önce:

- tipografi reçetesi,
- grid oranları,
- metin alanı genişliği/yüksekliği,
- panel payı,
- kolon yerleşimi,
- seamless taşıyıcının geometrisi,
- şablon varyantı

kaynak seviyesinde adapte edilir.

Yalnızca şablon ailesinin temel anlatı mantığı konuya gerçekten uymuyorsa başka katalog şablonuna geçilir.

Sorun:

- metindeyse kaynak metin,
- geometrideyse kaynak layout,
- tipografideyse kaynak style,
- içerik sırasındaysa narrative/source document

düzeltilir ve yeniden render edilir.

## 8. Teslim paketi

```
<post-id>/
  png/
    01.png
    ...
  jpeg/
    01.jpg
    ...
  meta/
    caption.txt
    sources.txt
    review.txt
  contact-sheet.jpg
```

Ayrıca bütün klasörü içeren tek ZIP verilir.

## 9. İlk referans koşu ve düzeltme

**upcytech-oee-arastirma-01**

İlk koşu, içerik/QA döngüsünü doğruladı; fakat görsel olarak fazla serbest/generic kaldı.
Bu nedenle V1 protokolü şu ek kararla sabitlendi:

> Bundan sonraki karoseller CreativeSuite'in katalog şablonlarından birini **asıl görsel omurga** olarak kullanır. Serbest üretim yalnız fallback'tir. Şablonun sloganik örnek metin yoğunluğu kopyalanmaz; içerik, aynı seamless gramer içinde daha öğretici ve daha açıklayıcı hale getirilir.

Konu: “OEE düştüğünde aslında neyi araştırmalısınız?”

İlk QA turunda tespit edilip düzeltilen gerçek kusurlar:

- slayt 02 alt bant metni sağdan kırpılıyordu;
- slayt 03 performans açıklaması yarıda kesiliyordu;
- slayt 06 gövde cümlesi son kelimelerde taşıyordu;
- slayt 07 açıklama metni yarıda kesiliyordu;
- gereksiz İngilizce üretim terimleri Türkçeleştirildi.

Bu kusurlar contact sheet'te kısmen fark edildi, tekil slayt incelemesinde kesinleşti. Bu nedenle “slayt slayt görsel QA” protokolün zorunlu maddesidir.

## 10. Sonraki chat için başlangıç komutu

Yeni bir oturum CreativeSuite/UpcyTech karoseli üretirken önce bu dosyayı ve:

- `ci/creative-jobs/README.md`
- `.github/workflows/creative-carousel.yml`
- güncel CreativeSuite tasarım kurallarını

okur.

Sonra **Chat Agent Carousel Protocol V1** akışını uygular; kullanıcıdan tekrar altyapıyı anlatmasını istemez.

Yeni oturumun ilk tasarım sorusu şudur:

> “Bu anlatı CreativeSuite katalogundaki hangi seamless şablon ailesiyle en iyi taşınır ve o şablonu öğretici içerik için nasıl adapte etmeliyim?”
