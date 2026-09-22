# Chat Agent Carousel Protocol V2 — TEMPLATE LOCKED

**Durum:** SABİT.

Bu protokolün amacı CreativeSuite'in **hazır katalog şablonlarını değiştirmeden** kullanarak,
ChatGPT'nin içerik, görsel seçimi/üretimi ve QA işini yürütmesidir.

## 1. Ana ilke

> **Şablon tasarımdır; ChatGPT içerik editörüdür.**

Bir katalog şablonu seçildikten sonra şablonun arka planı, renk ailesi, grid'i, tipografik
reçetesi, seamless taşıyıcısı ve yapısal dekorları **kilitlenir**.

ChatGPT yeni bir tasarım icat etmez. Yalnızca şablonun izin verdiği içerik yuvalarını doldurur.

## 2. Değiştirilemez alanlar

Seçilen referans/şablondan gelen aşağıdaki alanlar kullanıcı açıkça istemedikçe değiştirilemez:

- `slaytGenisligi`, `yukseklik`
- `yerlesim`
- `tipografi`
- `zemin`
- `zeminDokusu`, `ustDoku`, `yuzey`
- `aksan`
- `bant` türü, geometrisi ve ritmi
- `alanSiniri`
- kart zemin rotasyonu
- kartların `kolon`, `dikey`, `aksanRolu`, `aksanDibi` gibi yapısal rolleri
- şablonun grid/padding/ray/logo/ölçek/seamless sistemi
- şablonda olmayan yeni panel/kart/buton/badge/çip/dekor sistemi

**Arka planı veya tasarım dilini “konuya daha uygun olsun” diye değiştirmek yasaktır.**

## 3. Değiştirilebilir alanlar

Varsayılan olarak yalnız:

- `kartlar[].ustBaslik`
- `kartlar[].baslik`
- `kartlar[].govde`
- mevcutsa `kartlar[].kapanis.cagri`
- `rayaSol`, `rayaOrta` gibi içerik metinleri
- `gorseller[].src`
- `gorseller[].alt`

değiştirilir.

Görsel yerleşimi yalnız şablonun mevcut görsel yuvasını doldurmak için ayarlanabilir.
İlk tercih **mevcut x/y/genişlik/yükseklik değerlerini aynen korumaktır**. Kırpma nedeniyle
zorunlu mikro ayar gerekiyorsa yalnız görsel katmanında yapılır; grid veya arka plan oynatılmaz.

## 4. Şablon seçimi

ChatGPT önce içeriğe uygun katalog şablonunu seçer. Örnek aileler:

- `sahne`
- `veri-hikayesi`
- `akan-alan`
- `kavis`
- `karsilastirma`
- `dizin`
- `memphis`
- `donen`
- `editoryal`

Seçimden sonra **aynı koşu boyunca şablon kilitlidir**.

Hazır bir referans run varsa, katalog tanımından ziyade o referans run'ın
`panorama.json` dosyası tasarımın dondurulmuş kaynağıdır.

## 5. Metin standardı

Şablonların eski örnek metinleri kısa/sloganik olabilir; bu, yeni içeriğin sloganik olması
gerektiği anlamına gelmez.

ChatGPT:

- gerçek bir kavram öğretir;
- mantıklı sıra kurar;
- anlaşılır Türkçe kullanır;
- gerektiğinde gövde metnini zenginleştirir;
- ama metni sığdırmak için **şablonu büyütmez/değiştirmez**.

Metin şablona sığmıyorsa çözüm sırası:

1. metni daha iyi edit etmek;
2. aynı fikri daha açık ama kısa cümlelerle kurmak;
3. gerekiyorsa o konu için baştan başka hazır şablon seçmek.

**Şablonun tipografi reçetesi veya grid'i metni kurtarmak için değiştirilemez.**

## 6. Yasak görsel dil

Aşağıdakiler, seçilen şablonda zaten yoksa EKLENEMEZ:

- yapay zekâ ürünü gibi görünen butonlar
- emoji
- yuvarlak ikon rozetleri
- pill/chip/badge
- CTA butonu
- sahte dashboard/UI kutuları
- dekoratif mini grafikler
- neon kartlar
- fazladan çerçeve/panel
- rastgele ok/işaret/icon seti

Bir kavram ikonla anlatılmak isteniyorsa ve şablonda ikon sistemi yoksa ikon eklenmez;
metin veya ana 3B görsel üzerinden anlatılır.

## 7. AI 3B görsel protokolü

AI görselin görevi **tam post çizmek değil, şablondaki görsel yuvasını dolduracak tek bir asset üretmektir**.

İstenen asset özellikleri:

- tek endüstriyel nesne veya konuya doğrudan bağlı 3B obje;
- mat/gerçekçi malzeme;
- UpcyTech marka paletine uyum;
- yazısız;
- logosuz;
- sayısız;
- ekransız veya ekran yüzeyi tamamen boş;
- UI'sız;
- butonsuz;
- emojisiz;
- mümkünse şeffaf arka plan;
- değilse matlama ile temizlenebilir sade fon.

Model yanlışlıkla tam poster, infografik veya UI üretirse çıktı **doğrudan kullanılmaz**.
Yalnız temizlenebilir nesne bölgesi ayrıştırılır; ayrıştırılamıyorsa görsel reddedilir.

## 8. Seamless kuralı

Seamless etki CreativeSuite şablonundan gelir; ChatGPT yeni seamless sistemi icat etmez.

Örneğin `sahne` için:

- referans run'daki zemin aynen kalır;
- ölçek bandı aynen kalır;
- görsel yuvaları kesimlerin üstünde kalır;
- iki görsel yuvası varsa iki asset kullanılır;
- görseller iki slayt arasında fiziksel olarak devam eder;
- metin görselle çakışmaz.

## 9. QA — zorunlu

Contact sheet yalnız genel ritim kontrolüdür.

Finalden önce ChatGPT **her slaydı tek tek açar** ve:

1. metin kesiliyor mu;
2. başlık/gövde okunuyor mu;
3. hazır şablon arka planı değiştirilmiş mi;
4. şablonda olmayan buton/emoji/chip/panel eklenmiş mi;
5. AI görselde yazı/UI/artifact kalmış mı;
6. görsel seamless kesimde doğru devam ediyor mu;
7. her slayt yeni bilgi ekliyor mu;
8. ürün tanıtımı öğretici akışı bozuyor mu

kontrol eder.

Bir sorun varsa kaynak metin veya **yalnız izinli içerik/görsel alanı** düzeltilir ve tekrar render edilir.

## 10. Render yolları

### A — GitHub-hosted CreativeSuite

Mümkünse repo workflow'u kullanılır.

### B — ChatGPT container fallback

GitHub runner tahsis edilemiyorsa ChatGPT kendi çalışma ortamında render eder.
Fallback'te de **dondurulmuş template spec aynen kullanılır**; yeni tasarım icat edilmez.

## 11. Teslim

```
<post-id>/
  png/
  jpeg/
  meta/
    caption.txt
    sources.txt
    review.txt
    template-lock.json
  contact-sheet.jpg
  panorama-preview.jpg
```

## 12. Referans davranış

Yeni oturum önce bu protokolü okur.

Sonra:

1. katalogdan şablon seçer;
2. şablon/referans `panorama.json` dosyasını kilitler;
3. yalnız içerik ve mevcut görsel yuvalarını doldurur;
4. render eder;
5. slaytları tek tek görsel olarak denetler;
6. final ZIP teslim eder.

**Kısa özet: hazır şablona dokunma; metni ve görseli doğru yerleştir.**
