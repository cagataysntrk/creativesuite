# Tasarım rehberi — "web işi" ile "tasarım işi" arasındaki fark

**Neden yazıldı:** Çıktılar render ediliyor, ölçümler yeşil, metin doğru — ve **web
sayfası gibi duruyor.** Dümdüz, sade, hikâyesiz. Renk eklemek bunu çözmüyor çünkü sorun
renkte değil. Bu belge farkın NEREDE olduğunu maddeleyip ölçülebilir kural hâline getiriyor.

> ⚠ Bu rehber "uçuk kaçık şey kullan" demiyor. **Doğru şeyi doğru yerde kullanmak**
> diyor. Her kural bir gerekçe ve mümkünse bir ölçü taşıyor.

---

## 0. Teşhis — bizim çıktı neden "bilgisayar işi" duruyor

| Belirti | Web işi | Tasarım işi |
|---|---|---|
| Her öge kendi kutusunda, hiçbiri kesişmiyor | ✔ | ✘ — katmanlar **birbirine girer** |
| Boşluk her yerde eşit | ✔ | ✘ — boşluk **ritim** taşır, 1:1 değil 1:3 |
| Tek tipografik ses, tek ölçek adımı | ✔ | ✘ — **sert kontrast**: 1 birim yanında 8 birim |
| Zemin arkada durur, ögeyle ilişki kurmaz | ✔ | ✘ — zemin ögeyi **kesir**, ışık ögeden gelir |
| Kenarlar hep aynı yarıçapta, hep aynı çizgide | ✔ | ✘ — bir öge kasten **dışarı taşar** |
| Hiçbir şey diğerinin önüne geçmez | ✔ | ✘ — **hiyerarşi acımasızdır**, bir şey kazanır |

**Tek cümlelik teşhis:** web tasarımı ögeleri YAN YANA dizer; grafik tasarım ögeleri
BİRBİRİNİN İÇİNE geçirir. Bizim çıktı yan yana diziyordu.

---

## 1. Ölçek — kontrast yoksa hiyerarşi yoktur

- ⛔ **Yasak:** başlık 82 px, gövde 27 px, etiket 19 px (oran 3,0 → 1,4). Bu bir
  web sayfasının tipik ölçeğidir ve göz "önemli olan hangisi" diye sorar.
- ✅ **Kural:** en büyük ile en küçük arasında **en az 6 kat** olacak. Kapak başlığı
  120 px iken künye 15 px ise oran 8'dir ve göz tereddüt etmez.
- ✅ **Ara adım sayısı ÜÇÜ geçmesin.** Dört farklı punto bir sayfada okunmaz; üç punto
  bir hiyerarşi kurar. Dördüncüsü gerekiyorsa biri fazladır.

## 2. Boşluk — eşit boşluk, boşluk yokluğudur

- ⛔ **Yasak:** ögeler arası 24 px, 24 px, 24 px.
- ✅ **Kural:** komşu boşluklar arasında **en az 1:3 oranı**. Başlıkla gövde arası 24 px
  ise gövdeyle panel arası 72 px. Göz grupları böyle görür.
- ✅ **Kenar boşluğu asimetrik olabilir** ve genelde olmalı: sol 64, sağ 220 px bir
  KARAR'dır; sol 64 sağ 64 bir varsayılandır.

## 3. Katmanlanma — asıl fark burada

**Web işi:** her öge kendi dikdörtgeninde, üst üste binmez.
**Tasarım işi:** en az bir öge bir diğerinin ÜSTÜNE ya da ALTINA girer.

- ✅ Dev rakam metnin arkasından geçer (bizde var).
- ✅ Fotoğraf metin sütununun kenarına **girer**, hizalanmaz.
- ✅ Bir şerit ya da leke, panelin köşesini **keser**.
- ⚠ **Kesişme kontrolü şart:** kesişen şey OKUNAKLILIĞI bozmamalı. Kural: kesişen öge
  ya metnin arkasında ve ≤%12 opaklıkta, ya da metnin bittiği yerden sonra başlıyor.

## 4. Kenar ve kesim — dikdörtgen görsel yasaktır

- ⛔ **Yasak:** kenarları dört köşe, arka planı duran fotoğraf. Bu, tasarımın içine
  yapıştırılmış bir ekran görüntüsüdür.
- ✅ **Kural:** görsel ya **arka planı silinmiş** (kesik özne), ya **tam kaplama**
  (kenardan kenara, kırpma tasarımın parçası), ya **maskeli** (daire/şekil).
  Dördüncü hâl yok.
- ✅ Kesik öznenin bir uzvu ya da gölgesi **kesim çizgisini aşar** — kesintisizliğin
  taşıyıcısı odur.

## 5. Zemin — düz dolgu "sade" değil, YAPILMAMIŞ

- ✅ Işık **bir yerden** gelir. Merkezi bir parlaklık fark edilmez; asimetrik olan
  tasarım gibi durur.
- ✅ En az iki katman: taban + ışık. Üçüncü katman (doku/tarama) ritim taşır.
- ✅ Gren bir DÜZELTMEdir: 8-bit bantlaşmayı kırar. Ölçüldü: grensiz 36 px bant,
  grenli 8 px (`zemin.ts`).
- ⛔ Gren "film efekti" olarak görünür hâle getirilmez — görünüyorsa süs olmuştur.

## 6. Çizgi ve kutu — çerçeve çizmek tasarım değildir

- ⛔ **Yasak:** her panelin etrafında 1 px açık gri çerçeve. Bu bir HTML tablosudur.
- ✅ **Kural:** ayrım için **üç yoldan biri** seçilir ve yalnız biri: (a) zemin farkı,
  (b) tek kenar çizgisi (dört değil), (c) boşluk. Üçü birden kullanılırsa gürültü olur.
- ✅ Çizgi bir ANLAM taşımalı: bir eksen, bir sınır, bir bağlantı. Süs çizgisi silinir.
- ✅ Köşe yarıçapı: 0 ya da belirgin (≥14 px). 4 px yarıçap "yuvarlatmaya çalışılmış
  dikdörtgen" gibi durur ve en çok bu bilgisayar işi hissi verir.

## 7. Hiyerarşi — bir şey kazanmalı

Her karede **tek bir kahraman** vardır: ya başlık, ya görsel, ya sayı. İkisi birden
kahraman olamaz.

- ✅ Kahraman karenin en az **%40**'ını tutar (alan ya da optik ağırlık).
- ⛔ Üç öge de orta boyda ise kompozisyon yoktur, yalnız yerleşim vardır.

## 8. Renk — marka rampası içinde kalarak kontrast kurmak

- ✅ Aksan rengi karede **en fazla iki yerde**. Üçüncüsü vurguyu öldürür.
- ✅ Zeminle metin arasında ölçülen kontrast ≥ 4,5:1 (§12.6). Aksan zeminse metin
  mürekkep olur — amber üstüne amber ölçülmüş 1,9:1 verir.
- ✅ Sıcak/soğuk dengesi: tamamen nötr bir kare cansızdır. Amber sıcaksa gölge hafif
  soğuk olur (mavi-gri), tersi değil.

## 9. Hikâye — karosel bir DİZİ, altı afiş değil

- ✅ Kaydırma bir HAREKET anlatır: eğri yükselir, rakam büyür, özne yürür.
- ✅ İlk kare soruyu, son kare kararı taşır. Aradakiler adımdır.
- ⛔ Altı bağımsız kart, karosel değil altı posttur.

## 10. Ölçülebilir kabul — bir tasarım "bitti" sayılır mı

Bir karosel şu altısını geçmeden bitmiş sayılmaz:

| # | Ölçüt | Nasıl ölçülür |
|---|---|---|
| 1 | En büyük/en küçük punto oranı ≥ 6 | `tasarimOlc` |
| 2 | Komşu boşluk oranı ≥ 1:3 en az bir yerde | `olcekDisiBosluklar` |
| 3 | En az bir öge kesim çizgisini aşıyor | `panoramaDenetle` |
| 4 | En az bir öge başka bir ögeyle katmanlanıyor | `kompozisyonMerkezi` |
| 5 | Zemin en az iki katmanlı | `zeminCss` katman sayısı |
| 6 | Görsel varsa dikdörtgen DEĞİL | `matlama-tutmuyor` denetimi |

⚠ Bu ölçütler **estetiği garanti etmez** — kötü tasarımı ELER. İyi tasarım hâlâ karar
gerektiriyor; ölçüt yalnız "web işi"ne geri düşmeyi engelliyor.
