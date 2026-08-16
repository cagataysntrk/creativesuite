# Agent destekli karosel araçları — saha taraması ve entegrasyon kararı

**Tarih:** 2026-08-17 · **Tetikleyen:** dışarıdan gelen bir araç listesi ve
"bunu nasıl yaptırabiliriz, OSS var mı" sorusu.

**Tek cümlelik sonuç:** Bu alanın tamamı bizim render mimarimize **bağımsız olarak
yakınsamış** — yani seçim doğruydu. Ama hiçbiri fork edilecek durumda değil; onlardan
alınacak şey kod değil, **dört mekanizma**.

---

## 1. Önce doğrulama — listenin yarısı gerçek değil

Gelen liste tek tek arandı. Ayrım önemli, çünkü var olmayan bir repoyu aramakla geçen
saat gerçek bir maliyet.

### Doğrulanan (gerçek, bulundu)

| Araç | Ne | Lisans / erişim |
|---|---|---|
| **Open Carrusel** — `Hainrixz/open-carrusel` | Claude ile sohbet → HTML/CSS slayt → Puppeteer PNG | MIT, yerel |
| ↳ `theonlyhausofai-design/open-carousel` | Aynı projenin ikinci kopyası | — |
| **Redesign** (Nodewave) | **MCP sunucusu** + canvas editör, LinkedIn/IG/Reddit | MIT, yerel, Node 20+ |
| **carousels-mcp** — `houtini-ai` | Blog yazısı → karosel, MCP, SVG + Puppeteer | 6 hazır şablon |
| **html-to-Instagram-carousel** — `DJ-vekariya` | Sade HTML → 1080×1350 PNG dışa aktarıcı | Prompt şablonu içeriyor |
| **instagram-mcp** — `mcpware` | Graph API'nin **23 aracı**: post, karosel, reels, analitik | ⚠ FAZ 7 için doğrudan ilgili |
| **carousel-builder** — `charlesdove977` | Higgsfield görsel + **Canva** montaj | Canva bağımlı |
| `threads-carousel-claude-skill`, `carousel-suite-skill` | Claude Code skill'leri, metin → görsel karosel | — |

### Doğrulanamayan

`anyone-can-carousel`, `Slidr`, `claude-carruseles` — arama sonucu **yok**. Muhtemelen
uydurma ya da adları yanlış. **Swipekit** ise bir OSS agent aracı değil, App Store'daki
bir iOS uygulaması — listeye yanlışlıkla girmiş.

> Bu, listenin bir LLM tarafından üretildiğine ve doğrulanmadan aktarıldığına işaret
> ediyor. İçeriğin geri kalanı büyük ölçüde isabetli, ama repo adları tek tek kontrol
> edilmeden kullanılmamalı.

---

## 2. En önemli bulgu: hepsi bizim mimarimizi kullanıyor

Sekiz projenin **istisnasız hepsi** aynı zinciri kuruyor:

```
LLM → HTML/CSS → headless Chromium → tam Instagram ölçüsünde PNG
```

Photoshop'a, Canvas API'sine, görsel modeline metin çizdirmeye giden **tek bir örnek
yok**. Bu, bağımsız yakınsama: bizim "tek render motoru" yasamız (R-30) ve statik render
mimarisi (§7.1) tahminle değil, sektörün fiilen bulduğu çözümle aynı yerde.

Open Carrusel'de daha da spesifik bir örtüşme var: `wrapSlideHtml()` fonksiyonunu
*"önizleme ile dışa aktarma arasındaki paylaşılan render sözleşmesi"* diye tanımlıyorlar.
Bu, bizim tek motor yasasının kelimesi kelimesine aynısı — ikinci bir render yolu,
ikinci bir hata modu demek.

**Sonuç:** render kararımızı yeniden tartışmaya gerek yok. Tartışılacak olan, onların
üstüne koyduğu ve bizde **olmayan** katman.

---

## 3. Onlarda olup bizde olmayan — dört mekanizma

Kaldıraç sırasına göre. İlk ikisi gerçekten önemli, son ikisi konfor.

### 3.1 ⭐ Referans görselden stil öğrenme

Open Carrusel'in tanımı: *"beğendiğin karosellerin referans görsellerini bırak, Claude
onları **inceleyip** stili eşlesin."*

**Bizde bunun karşılığı yok ve bu bir boşluk.** Bugün iki referans görsel verildiğinde
grameri (akan eğri, hayalet rakam, renk rolü rotasyonu, sayaç) **elle** türettim ve
`sablon.ts`e yazdım. Sonuç iyi, ama tekrar edilebilir değil: üçüncü bir referans
geldiğinde aynı elle-türetme baştan yapılacak.

Sistemleştirilmiş hâli şöyle olmalı — ve **bizim mimarimizde farklı çıkıyor**:

| Onlar | Biz olmalı |
|---|---|
| Referans → **HTML üret** | Referans → **şablon parametreleri üret** |
| Çıktı: markup | Çıktı: renk rolleri, eğri bandı, tip ölçeği, ızgara |

Fark kritik. Onların yaklaşımında her karosel yeni HTML demek — golden test yapılamaz,
tipografi metriği dondurulamaz. Bizde çıktı `sablon.ts`in okuduğu **veri** olursa hem
Türkçe tipografi kapıları çalışmaya devam eder hem de aynı referans her zaman aynı
grameri verir.

### 3.2 ⭐ Görsel geri besleme döngüsü — ve nasıl yapılacağı

Akademik taraf bu konuda net (UICrit · ReLook · yinelemeli görsel istem çalışmaları) ve
tasarımın en can alıcı ayrıntısını veriyor:

> Kritik yorumları **sınırlayıcı kutularla** (bounding box) üretilir — her yorum
> ekranın belirli bir bölgesine bağlanır.

Bu ayrıntı olmadan görsel eleştiri işe yaramaz: *"kompozisyon dengesiz"* eyleme
çevrilemez, *"kapak slaytında 120–460 px bandında metin eğri sınırını geçiyor"*
çevrilebilir. Bugün bu turda bulduğum dört kusurun dördü de tam olarak bu biçimdeydi
ve o yüzden düzeltilebildiler.

Bizim tolerans okuması yüzeyimiz (ΔE, kaplama, en-boy) bu bulguları **hazır bir panoya**
alır — yani entegrasyon maliyeti düşük. Eksik olan tek şey, bulguyu üreten adım.

### 3.3 İçerik-güdümlü slayt tipi seçimi

`carousels-mcp`in kuralları, bizim sabit `LAYOUTS` enum'umuzun eksiğini gösteriyor:

- sayı içeren cümle → **istatistik slaydı**
- sıralı liste → **adım adım slayt**
- güçlü vurgu → **çıkarım kutusu**
- "önce/sonra" dili → **karşılaştırma slaydı**

Bizde düzen listesi kapalı ve bu doğru (kapalı `LayoutEnum` bilinçli bir karar), ama
düzen **içerikten seçilmiyor** — kapak/gövde/kapanış rolleri bile henüz `renderBody`ye
taşınmadı. İçerik-güdümlü seçim, kapalı enum'u bozmadan eklenebilir: enum aynı kalır,
seçimi yapan bir fonksiyon eklenir.

### 3.4 Ölçülmüş metin disiplini

İki somut sayı:

- **Slayt başına en fazla 50 kelime** (`carousels-mcp` zorluyor)
- **5. slayta kritik içerik** — karosel ortasındaki terk oranına karşı

Birincisi bugünkü en görünür kusurumuzu doğrudan hedefliyor: kapak 12 satırlık bir metin
duvarıydı. `icerikPromptu` bugün karakter tavanı alabiliyor ama **slayt başına** disiplin
istemiyor.

### 3.5 Konfor katmanı (öncelikli değil)

Canlı önizleme + filmstrip ve şablon kütüphanesi. İkisi de komuta merkezinde karşılığı
olan ekranlar; kaldıraçları düşük çünkü bizde `carousel.ir.json` zaten "kaynak, çıktı
değil" olarak tasarlandı.

---

## 4. Neden fork etmiyoruz — iki yapısal engel

### 4.1 HTML'i veri modeli yapıyorlar

Open Carrusel slaytları *"yalnız gövde seviyesi HTML"* olarak JSON'da saklıyor. Yani
kaydın kendisi markup.

Bu bizde **üç şeyi birden** kırar:

1. **Golden-file tipografi metriği çalışmaz** — glif kutuları ve `notdef` sayımı bir
   belge modeline karşı ölçülüyor, serbest HTML'e karşı değil (§7.2)
2. **Belge modeli anlamını yitirir** — `COMPOSE` saf bir fiil; markup üretirse `RENDER`
   ile arasındaki sınır silinir
3. **Türkçe kapıları delinir** — `ğ ş İ ı` garantisi font yükleme yolunun tek olmasından
   geliyor (R-20, R-21); her slayt kendi CSS'ini taşırsa o tek yol biter

Bu tam olarak `sablon.ts`e bu turda yazdığım kısıt: *modele işaretleme sokmak, tek render
motoru yasasını bir şablon diline çevirir.*

### 4.2 Agent'a kabuk veriyorlar

Open Carrusel `claude` sürecini `--allowedTools Bash WebFetch` ile açıyor ve agent kendi
API'sini **curl ile** çağırıyor.

Bu, bizim bilerek kapattığımız delik: keyfi kod çalıştırma fiili kaldırıldı çünkü
kapatılamayan bir güvenlik açığıydı. Ayrıca ölçülmez — maliyet defterine yazılmaz, zaman
aşımına uğramaz, karantinaya alınmaz.

### 4.3 Türkçe'yi hiç düşünmemişler

`carousels-mcp` dokümantasyonu font eşleştirmelerini anlatıyor ama **Latin dışı ya da
aksanlı metin için tek satır rehberlik içermiyor**. Diğerlerinde de yok. Bizim latin-ext
zorunluluğumuz, locale-güvenli case ve Türkçe genişleme payı bu araçların hiçbirinde
karşılığı olmayan iş.

---

## 5. Entegrasyon planı — dört adım

Hiçbiri mimariyi değiştirmiyor; dördü de mevcut fiillere ve mevcut kapılara oturuyor.

### Adım A — slayt başına metin disiplini · **en ucuz, en görünür**

`icerikPromptu` slayt rolü başına uzunluk tavanı istesin: kapak 5–7 kelime, gövde ≤50
kelime, kapanış tek eylem. Deterministik linter tarafında da ölçülebilir bir kural olur.

*Değişen dosya:* `packages/engine/src/metin-akisi.ts` · yeni kural gerekmiyor, mevcut
prompt disiplininin genişlemesi.

### Adım B — içerik-güdümlü düzen seçimi

`LayoutEnum` kapalı kalır; içeriğe bakıp düzen seçen saf bir fonksiyon eklenir. Slayt
rolü (kapak/gövde/kapanış) zaten teslimat damgasında var, `renderBody`ye taşınması
gereken iş bu adımın içinde.

*Değişen dosya:* `packages/render/src/layout/` · saf fonksiyon, test edilebilir.

### Adım C — ⭐ görsel yargı adımı (`image.critique`)

Yeni bir **yetenek**, yeni bir fiil değil — `GENERATE` altında çalışır, ölçülür,
maliyeti önden görünür.

- **Girdi:** render edilmiş slayt PNG'si + tasarım kuralları
- **Çıktı:** **yapılandırılmış** bulgu listesi — her bulgu `{slayt, bölge, kategori,
  şiddet}`. Serbest metin **değil**; sınırlayıcı kutu olmadan eyleme çevrilemez.
- **Nereye düşer:** mevcut tolerans okuması panosunun yanına

Bu, kullanıcının açıkça istediği *"claude bakıp görüp kontrol etmeli tek tek sayfa
sayfa"* katmanı. Yeni bir karar kaydı gerektiriyor (yetenek adı, şerit, maliyet tavanı,
kaç slaytta bir çalışacağı).

### Adım D — referans görselden şablon parametresi türetme

Girdi bir referans karosel görseli, çıktı `sablon.ts`in okuyacağı **parametre kümesi**:
renk rolleri, eğri bandı, tip ölçeği, ızgara ölçüleri, mikro öge yerleşimi.

Kritik kısıt: **çıktı HTML olamaz.** O an golden testler ve Türkçe kapıları devre dışı
kalır. Çıktı veri olursa aynı referans her zaman aynı grameri verir — deterministik
kalır.

*Bu adım C'ye bağlı:* yargı katmanı çalışmadan türetilen şablonun iyi olup olmadığı
ölçülemez.

### Ayrıca — FAZ 7 için not

`mcpware/instagram-mcp` Graph API'nin 23 aracını sarmalıyor (post, karosel, reels,
analitik). Bizim kanal adaptörümüzü yazarken **referans olarak** değerli: hangi uçların
gerçekten çalıştığı, hangi alanların zorunlu olduğu orada ölçülmüş. Bağımlılık olarak
almıyoruz — kanal çağrısı tek fiilden geçmek zorunda — ama uç haritası olarak okunmalı.

---

## 6. Ne yapmıyoruz

- **Fork yok.** Depolama modeli ve kabuk erişimi iki yapısal engel; kazanç kod değil,
  yukarıdaki dört mekanizma.
- **Canva bağımlılığı yok** (`carousel-builder`) — prospect'e giden materyalde hazır
  araç imzası kabul edilmiyor.
- **MCP üzerinden tasarım yok.** Redesign'ın MCP + canvas modeli zarif ama tasarım
  kararını sistemin dışına taşır; bizde gramer kapalı ve kodda yaşıyor.
- **Görsel modeline metin çizdirme yok** — bu taramada da destekleyen örnek çıkmadı;
  sekiz projenin sekizi de metni HTML katmanında bırakıyor.

---

## Kaynaklar

- [Hainrixz/open-carrusel](https://github.com/Hainrixz/open-carrusel) ·
  [CLAUDE.md](https://github.com/Hainrixz/open-carrusel/blob/main/CLAUDE.md)
- [theonlyhausofai-design/open-carousel](https://github.com/theonlyhausofai-design/open-carousel)
- [Redesign — Nodewave](https://www.nodewave.io/redesign)
- [houtini-ai/carousels-mcp](https://github.com/houtini-ai/carousels-mcp)
- [DJ-vekariya/html-to-Instagram-carousel](https://github.com/DJ-vekariya/html-to-Instagram-carousel)
- [mcpware/instagram-mcp](https://github.com/mcpware/instagram-mcp)
- [charlesdove977/carousel-builder](https://github.com/charlesdove977/carousel-builder)
- [itchernetski/threads-carousel-claude-skill](https://github.com/itchernetski/threads-carousel-claude-skill)
- [UICrit: Enhancing Automated Design Evaluation](https://arxiv.org/pdf/2407.08850)
- [Visual Prompting with Iterative Refinement for Design Critique Generation](https://arxiv.org/html/2412.16829)
- [Vision-Guided Iterative Refinement for Frontend Code Generation](https://arxiv.org/html/2604.05839v1)
