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
- panorama dili,
- typography/layout ilkeleri,
- mekanik QA ve render davranışı

için kanonik referanstır.

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
- UpcyTech: beyaz / siyah / marka mavisi;
- büyük ama dengeli tipografi;
- gerçek okunabilir gövde metni;
- fotoğraf veya AI görseli zorunlu değil;
- bilgi tasarımı: kart, liste, matris, akış, basit chart, mock-up, vektörel işaret;
- dekor yerine bilgi taşıyan görsel eleman.

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

## 9. İlk referans koşu

**upcytech-oee-arastirma-01**

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
