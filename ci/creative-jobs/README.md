# Chat-controlled CreativeSuite carousel runner

Bu akışın amacı CreativeSuite'in zekâ katmanını bir harici LLM/API'ye bağlamak değildir.
İçerik, kompozisyon, revizyon ve görsel kararlarını **ChatGPT oturumu** verir; GitHub
Actions yalnız CreativeSuite'in kendi Chromium render motorunu ve mekanik kalite
kontrollerini çalıştıran uzak bir işçidir.

Bu nedenle:

- kullanıcının bilgisayarının açık olması gerekmez;
- Claude Code / Anthropic API gerekmez;
- OpenAI API anahtarı gerekmez;
- SOPS/AGE/provider secret gerekmez;
- GitHub-hosted `ubuntu-latest` yeterlidir;
- workflow yayın yapmaz.

## İş bölümü

```
ChatGPT
  ├─ konuyu ve öğretici akışı yazar
  ├─ carousel içeriğini kurar
  ├─ CreativeSuite PanoramaBelgesi'ni düzenler
  ├─ caption / kaynak / review notlarını yazar
  └─ GitHub'a commit eder
            ↓
GitHub-hosted Actions
  ├─ repo bağımlılıklarını kurar
  ├─ Chromium'u kurar
  ├─ CreativeSuite'i build eder
  ├─ panoramaDenetle mekanik QA'sını koşturur
  ├─ renderPanorama ile 1080×1440 çıktı üretir
  └─ JPEG + PNG + QA artifact yükler
            ↓
ChatGPT
  ├─ artifact'ı indirir
  ├─ her slaydı tek tek görsel olarak inceler
  ├─ anlatı / tipografi / kompozisyon kusurlarını tespit eder
  ├─ panorama.json'u düzeltir
  └─ yeni commit ile tekrar render ettirir
            ↓
final ZIP
```

## Job biçimi

Her carousel ayrı dizindir:

```
ci/chat-jobs/<job-id>/
  panorama.json
  meta.json
  caption.md
  sources.md
  review.md
```

`meta.json` en az:

```json
{
  "id": "upcytech-example",
  "publish": false
}
```

`publish` kesinlikle `false` olmalıdır.

`panorama.json`, CreativeSuite'in mevcut `PanoramaBelgesi` sözleşmesidir. Zorunlu
Instagram tuvali:

```
1080 × 1440
3:4
2–10 slayt
```

## Tetikleme

Bir job'ın `panorama.json` dosyası PR'da veya `work/**` dalında değiştiğinde workflow
otomatik koşar. Aynı job yeni commit ile tekrar tekrar revize edilebilir.

Workflow çıktısı:

```
chat-carousel-<run-id>/
  <job-id>/
    jpeg/
      slayt-01.jpg
      ...
    png/
      slayt-01.png
      ...
    meta/
      panorama.json
      meta.json
      caption.md
      sources.md
      review.md
      qa.json
```

## Neden provider çağrısı yok?

CreativeSuite'in normal üretim hattındaki `text.generate`, `image.generate`,
`image.critique` ve `design.critique` adımları başka modeller içindir. Bu modda
onların yerine ChatGPT doğrudan editör/agent rolündedir.

GitHub'ın yaptığı iş **zeka üretmek değil, render etmek ve ölçmektir**. Böylece model
aboneliği veya provider kotası bittiğinde üretim durmaz.

## Görsel dili

Bu mod özellikle yapay görsel üretimi olmadan da çalışır. CreativeSuite'in:

- tipografi,
- panel,
- çubuk grafik,
- sayı,
- liste,
- etiket,
- sürekli alan/eğri/ok bantları,
- marka tokenları,
- SVG/vektör varlıkları

ile öğretici karoseller üretilebilir.

Gerekirse ayrı bir görsel varlık daha sonra eklenebilir; render worker'ın kendisi hiçbir
görsel modeline çağrı yapmaz.

## Kalite

Workflow `panoramaDenetle` sonucunda mekanik kusur bulursa kırmızı olur. Bu yalnız
mekanik kapıdır. Estetik ve editoryal kaliteyi ChatGPT artifact'ı görerek denetler.

Final kabul için en az:

- her slayt 1080×1440,
- taşma/kesim/punto kusuru yok,
- anlatı slayttan slayta ilerliyor,
- aynı bilgi tekrar edilmiyor,
- kapak vaat ettiği bilgiyi içeride gerçekten veriyor,
- son slayt yalnız slogan değil uygulanabilir sonuç/çıkarım veriyor,
- caption carousel'i tekrar etmiyor; derinleştiriyor,
- kaynaksız sayısal marka iddiası yok.

## Yayın

Bu akış hiçbir koşulda Instagram/LinkedIn yayın API'sini çağırmaz. Teslimat artifact'tır.
