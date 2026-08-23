# Araştırma tabanı — Instagram spec · seamless tasarım disiplini (2026-08-23)

> **Bu belge FAZ-18'in sayılarının kaynağıdır.** Bir eşiği değiştiren, önce buradaki
> kaynağı çürütmek zorunda. Her sayının yanında kaynağı ve güven düzeyi var.
>
> ⚠ **Doğrulanamayan sayı "doğrulanmadı" diye işaretli.** En sık rastlanan tuzak:
> 2025–26'da arama sonuçlarını dolduran AI üretimi SEO siteleri birbirini kopyalıyor ve
> hiçbiri birincil kaynağa gitmiyor. Onların sayıları buraya **kural olarak girmedi.**

**Güven katmanları:** **A** hakemli görme bilimi / tipografi otoritesi · **B** platform
belgesi (Meta, Adobe) · **C** pazarlama blogu (kaynak zinciri kapalı) · **D** A/B'den
türetilmiş hesap (aritmetiği açık, kontrol edilebilir).

---

## 1 · Dikiş MEKÂNSAL değil ZAMANSAL

Instagram akışında yerleşik slayt tam genişlik kaplar; komşu slayttan hiçbir şey
görünmez. **İzleyici iki slaydı asla yan yana görmez.** Sürekliliği retina değil,
görsel kısa süreli bellek kuruyor.

Değişim körlüğü literatürü (**A**): geçici bir kesinti sonrası bellekte kalan şey
sahnenin **gist**'i (bütünsel yapısı) artı dikkat edilen küçük bir detaydır; gerisi
üzerine yazılır.
[Vision Research](https://www.sciencedirect.com/science/article/pii/S0042698908003544) ·
[ECS — Change Blindness](http://nivea.psycho.univ-paris5.fr/ECS/ECS-CB.html)

**Sonuç:** düşük uzamsal frekanslı, büyük, tek parça formlar kesimi aşabilir. **İnce
detay ve metin aşamaz** — belleğe yazılmadan üzerine yazılır.

### 1.2 Taşıyıcı güç sırası

| Taşıyıcı | Çalışır mı | Neden |
|---|---|---|
| Renk alanı / zemin bölünmesi | ✅ en güçlü | sıfır uzamsal frekans; parçadan bütün zorunlu |
| Tek sürekli çizgi / eğri | ✅ çok güçlü | bellekte iki değer: giriş yüksekliği + eğim |
| Büyük geometrik form | ✅ güçlü | silueti tanınabilir, yarısı formu belirler |
| Yön veren ok / akış | ✅ güçlü | anlamsal: "devamı var" der |
| Fotoğraf — düşük detaylı bölge | ✅ iyi | kesim düşük bilgili alana düşürülür |
| Fotoğraf — yüksek detaylı bölge | ❌ | 1–2 px hizalama hatası bile "bozuk" hissi bırakır |
| **Okunacak tipografi** | ❌ **asla** | kelime tanıma bütünsel silüete bağlı; yarım kelime okumayı durdurur |
| Yüz, ürün, logo | ❌ | kimlik ögesi bölünürse kompozisyon bozuk okunur |
| İnce ızgara / tekrar eden desen | ❌ | faz hatası bilinçdışında yakalanır, yeri bulunamaz — en rahatsız edici sınıf |

### 1.3 Dikiş dışlama bandı — ±93 px (**D**)

Bir öge kesimi aşacaksa iki durumdan **biri** geçerli:

- **(a) tamamen içeride** — kimlik ögesi kesime en az **±93 px** mesafede. *Türetme: tek
  fiksasyonun net bölgesi ≈2° görsel açı; §3'teki ölçüye göre 2° = 186 px, yarısı 93.*
- **(b) ezici biçimde aşar** — öge her iki slaytta da genişliğin **≥%40**'ını kaplar.

Arada kalan yok. **"Biraz taşsın" en kötü seçenek:** ne devamlılık kuruyor ne bütünlük.

---

## 2 · Instagram teknik özellikleri

### 2.1 Slayt boyutu — 3:4 (1080×1440) artık resmî (**B, birincil**)

Instagram Yardım Merkezi (2026-08-23 çekimi), birebir:

> *"…as long as the photo's aspect ratio is between 1.91:1 and 3:4 (a width of 1,080
> pixels with a height between 566 and 1,440 pixels)."*
> — https://www.facebook.com/help/instagram/1631821640426723

- Maksimum genişlik **1080 px**; üstü küçültülür.
- Maksimum yükseklik **1440 px** → 3:4. **4:5 (1080×1350) hâlâ tam geçerli**, artık tavan değil.
- Değişim tarihi **29 Mayıs 2025** — Mosseri, Threads:
  [duyuru](https://www.threads.com/@mosseri/post/DKOIbJkRNIb) ·
  [9to5Mac](https://9to5mac.com/2025/05/29/instagram-changes-standard-photo-aspect-ratio/)
  (karosel için açık ifade) · [PetaPixel](https://petapixel.com/2025/05/29/instagram-finally-adds-support-for-34-aspect-ratio-photos/)

**Profil ızgarası** Ocak 2025'te 1:1 → 3:4 oldu; render **1012×1350**
(Hootsuite + Sprout bağımsız aynı sayı). Kırpma:

| Yüklenen | Izgarada | Kayıp |
|---|---|---|
| 1080×1350 (4:5) | 1012×1350 | **her yandan 34 px** |
| 1080×1440 (3:4) | 1080×1440 | **sıfır** |

⚠ **Kaynaklar çelişiyor:** Hootsuite (Ağu 2026) ve Sprout karosel kılavuzu (13 May 2026)
hâlâ "4:5 tavan" diyor. Instagram'ın kendi yardım maddesi birincil ve nettir; agregatör
kılavuzları geride kalmış. **Reklamda 4:5 hâlâ tavan** — bu ayrı bir rejim (reklam bölümü).

### 2.2 Slayt sayısı: uygulama **20**, Graph API **10** (**B**)

Meta Content Publishing (son güncelleme 30 Haz 2026):
> *"Carousels are limited to 10 images, videos, or a mix of the two."*
> — https://developers.facebook.com/docs/instagram-platform/content-publishing

Uygulama 8 Ağu 2024'te 10 → 20 oldu
([SMT](https://www.socialmediatoday.com/news/instagram-expands-carousels-to-20-frames/723792/)).
[Later](https://help.later.com/hc/en-us/articles/360042773934) farkı açıkça yazıyor.

**Bizim yayın yolumuz API → tavan 10.**

### 2.3 Format ve sıkıştırma (**B**)

- Graph API: *"**JPEG is the only image format supported.**"* — PNG kabul edilmiyor.
- Organik: JPG/PNG; maks dosya **8 MB** (agregatör, Meta değil).
- 320–1080 px genişlikteki ve oran aralığındaki fotoğraf **orijinal çözünürlükte
  korunuyor**; üstü küçültülüyor. JPEG kalite değeri **yayınlanmamış**.
- **Pratik sonuç:** tam 1080 px yükle. Daha genişi Instagram'ın kendi yeniden
  örnekleyicisine bırakmak demek.

### 2.4 Reklam ayrı rejim (**B**)

Meta Ads Guide, IG akış karosel: oran **4:5** (yalnız görsel), min oran 400×500,
tolerans %1 → **3:4 reklamda KULLANILAMAZ**. Kart sayısı 2–10, maks dosya 30 MB.
Öneri çözünürlük 1440×1800 (organik 1080 tavanının üstünde; işleme hattı farklı).

### 2.5 Güvenli alan — Meta akış için resmî bir safe zone YAYINLAMIYOR

Meta'nın tek safe-zone belgesi **Stories/Reels** için; akış ve karosel geçmiyor.
Teknik sebebi var: **akışta arayüz görselin üstüne binmez** — kullanıcı adı üstte,
aksiyon satırı altta, ayrı bantlarda. Görselin üstüne binen tek şey sağ üstteki
sayaç rozeti ve onun da resmî ölçüsü yok.

⚠ **Dolaşımdaki sayılar doğrulanmadı:** "1000×1270", "yanlar 60 / üst-alt 80",
"üstte ~135 px UI". Kaynakları yalnız AI üretimi SEO blogları; son ikisi **Reels
rakamlarının akışa yanlış taşınması**. Bunların üzerine kod yazılmadı.

**Doğrulanmış tek kısıt: ızgara kırpması 34 px.** Bizim `KENAR_PAYI = 88` bunu
rahatça karşılıyor.

### 2.6 İlk slayt oranı tüm karoseli belirliyor (**B**)

> *"Carousel images are all cropped based on the first image in the carousel."*

→ Dilimler bit-bit aynı boyutta olmak zorunda. Tek tuvalden dilimlediğimiz için bugün
yapısal olarak garanti; **garantiyi iddia olarak bırakmak yerine kapıya çevirmek ucuz.**

⚠ Yayımlandıktan sonra **sıra değiştirilemez, tek parça silinemez** — yanlış sırada
yüklenen seamless karosel kurtarılamaz.

---

## 3 · Tipografi: yaygın tavsiye okuma eşiğinin altında

### 3.1 Görme biliminin ölçüsü (**A**)

Okunabilirliğin ölçüsü nominal punto değil **açısal x-yüksekliği**:

- **Kritik punto (CPS): 0,2°** — altında okuma hızı çöküyor.
  [Legge & Bigelow 2011, JOV](https://jov.arvojournals.org/article.aspx?articleid=2191906)
- Gerçek basılı iş: **gazete 0,23°, ciltli kitap 0,24°**. Yani profesyonel hedef bu.
- Telefon izleme mesafesi **32,2 cm** (internet).
  [Bababekova ve ark. 2011, OVS](https://journals.lww.com/optvissci/Fulltext/2011/07000/Font_Size_and_Viewing_Distance_of_Handheld_Smart.5.aspx)

### 3.2 Hesap (**D** — 1080 px tuval, 6,1" telefon, 32 cm)

**1 tasarım px = 0,644 açı-dakikası = 0,0107°**

| Punto | x-yüksekliği | Hüküm |
|---|---|---|
| 24 px | 0,141° | **okuma eşiğinin ALTINDA** ← blogların "minimum"u |
| 32 px | 0,187° | **eşiğin ALTINDA** |
| 36 px | 0,211° | sınırda — **mutlak taban** |
| **40 px** | **0,234°** | **gazete kalitesi — hedef** |
| 48 px | 0,281° | kitap kalitesi |
| 90 px | 0,527° | bakışlık / ara başlık |
| 160 px | 0,937° | kahraman display |

**Bulgu: yaygın "gövde 24 px" tavsiyesi kritik eşiğin %30 altında.** Blogların
"telefonda gözünü kısıyorsan büyüt" şikâyeti tam olarak bunun belirtisi; sebebi teşhis
edemedikleri için sayıyı düzeltemiyorlar.

⚠ **Nüans:** CPS akıcı okuma için. Üç kelimelik bir etiket okunmaz, **tanınır** — orada
eşik altı meşru (28–32 px). Ama bir **cümleyi** eşik altında set etmek okuma hızını
düşürür ve akışta okuma hızının düşmesi = kaydırıp geçme.

### 3.3 Satır aralığı ve ölçü (**A**)

- Gövde satır aralığı **%120–145** ([Butterick](https://practicaltypography.com/line-spacing.html)).
  Display'de sıkı aralık (0,95–1,05) doğru ve gerekli — Butterick'in kuralı okuma metnine dair.
- Ölçü **45–90 karakter/satır** ([Butterick](https://practicaltypography.com/line-length.html)).
- **D:** 960 px sütunda 40 px punto → **48 karakter/satır**, bandın alt ucunda. Yani
  1080 px'lik tek sütun okunabilir puntoda zaten dardır → **gövde iki sütuna bölünemez**
  (ikinci sütun 24 karaktere düşer, bant dışı).

### 3.4 Kelime sayısı geometriden çıkıyor (**D**)

- Gövde 40 px, 960 px sütun → 48 karakter/satır; TR ortalama kelime 6,1 karakter + boşluk
  → **6,7 kelime/satır**; gövde ≤3 satır → **≈20 kelime**.
- Başlık 800 px sütun, 85–120 px punto → satır başına 1,8–2,6 kelime; başlık 2–3 satır
  → **5–8 kelime**.

**"5–8 kelimelik kanca" bir pazarlama sezgisi değil, geometrik zorunluluk.** İki bağımsız
yoldan aynı sayıya varılması kuralın sağlamlığının kanıtı. Slayt toplamı: **≤28 kelime**,
hedef 15–20.

---

## 4 · Kompozisyon ve ritim

- **Üç perde:** kanca (slayt 1) → değer (2–8, slayt başına **tek fikir**) → CTA (son).
  Toplam **7–10 slayt**; "20 yapabildiğin için yapma".
- **Kapak tek başına tam bir gönderi olmalı.** Test: slayt 1'e izole bak — kaydırma
  göstergesi olmasa scroll'u durdurur muydu? ⚠ Bu seamless formatla gerilim yaratır ve
  profesyonellerin çözdüğü asıl mesele budur: **kapak kompozisyon olarak kapalı,
  taşıyıcı olarak açık** — başlık slayt 1'de tamamlanır, kesimi aşan yalnız zemin/form.
- **Boşluk ≥%30**, metin kutuları **≤%30** (**C**, ama iki bağımsız kaynak).
- **Izgara (A — Müller-Brockmann):** panorama **tek yatay ızgaradır**, slayt başına ayrı
  değil. Dikey ritim tek taban biriminden: `TABAN = gövdePuntosu × gövdeSatırAralığı`
  = 40×1,35 = **54 px**; her dikey boşluk bunun katı.
- Hizalama tek eksende; slayt numarası/logo/künye **her slaytta aynı konumda**.

## 5 · Renk

- **Dört rol:** zemin · birincil metin · aksan · ikincil aksan. Kontrast **≥4,5:1**.
- Aksan alanın **≤%10**'u ve slayt başına tek iş.
- ⚠ **Koyu/açık zemin için yayımlanmış A/B etkileşim ölçümü YOK.** Aradık, bulamadık.
  Bilinen (**A**, okunabilirlik — etkileşim değil): pozitif polarite (koyu metin / açık
  zemin) okunabilirlikte kazanıyor; koyu zeminde ince yazı yutuluyor, kalın yazı
  **halation** yapıyor ([NN/g](https://www.nngroup.com/articles/dark-mode-users-issues/)).
- **Türetilen kural (D):** koyu zeminde metin ağırlığını bir kademe **DÜŞÜR**. Karosel
  içinde koyu ve açık slaytlar karışıyorsa dengeleme zorunlu — yoksa koyu slaytlar
  "daha bağıran" görünür ve ritim bozulur.

## 6 · Örneklerden çıkan ortak yapı

⚠ Behance ve Instagram doğrudan çekilemedi (403); örnekler ikincil kaynaklardan.

@disney (Ice Age), hold-and-scroll stop-motion (@disneyland, @microsoft), @canva,
@chipotle, Hyperflo, Supergoop, @panosliceapp.

**Hiçbiri "güzel bir panoramayı" slaytlara bölmemiş.** Hepsinde kesimi aşan öge
**içerikten türemiş** — hareket, veri eğrisi, marka renk alanı, zaman. Bu, D-268'in
*"kesimi aşan öge içerikten türer, süsten değil"* kuralını bağımsız olarak doğruluyor.

## 7 · Sık yapılan hatalar

1. Slaytları **yanlış sırada** yükleme — geri alınamaz.
2. En-boy oranı karıştırma — ilk slayt gerisini kırpar.
3. Kimlik ögesini (yüz, ürün, logo) kesime bindirme.
4. Kesimi yüksek detaylı bölgeye düşürme.
5. **Sürekliliği ima etme, kurmama** — "biraz taşsın".
6. Kapağı kesintisizliğe feda etme.
7. **Metin çok küçük** — yaygın "24 px" tavsiyesinin kendisi bu hatanın kaynağı.
8. Üçten fazla yazı tipi · düşük kontrast · slayttan slayda değişen boşluk.
9. Kaydırma ipucu yokluğu (karosellerin ~%95'inde yok, bedava kaldıraç).
10. **AI ile metin çizdirme** — modeller hâlâ kerning ve harf formu halüsine ediyor.
    *Yasa 3 zaten bunu söylüyor; bağımsız doğrulama.*
