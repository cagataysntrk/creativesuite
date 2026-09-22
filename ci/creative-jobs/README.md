# CreativeSuite remote carousel runner

Bu klasör, GitHub Actions üzerinden CreativeSuite karosel üretimini başlatan iş tanımlarını taşır.

## Neden self-hosted runner?

Karosel hattı yalnız Node kodu çalıştırmıyor. Mevcut CreativeSuite üretim ortamı:

- Claude Code oturumu / `text.generate`
- SOPS + AGE anahtarı
- Cloudflare ve diğer provider kimlikleri
- Chromium
- ffmpeg
- yerel image-matte/rembg ortamı
- kalıcı `derived/runs` ve `derived/blobs` durumu

gerektiriyor. Bunları ephemeral GitHub-hosted bir makineye kopyalamak yerine, halihazırda
CreativeSuite'i çalıştırabilen Ubuntu makine GitHub self-hosted runner olarak kullanılır.

Runner etiketleri:

```
self-hosted
linux
x64
creativesuite
```

## İş dosyası

Her yeni üretim ayrı bir JSON dosyasıdır:

```json
{
  "id": "upcytech-oee-arastirma-01",
  "type": "instagram-karosel",
  "topic": "OEE düştüğünde yalnız skora bakmak yetmez; kaybı kullanılabilirlik, performans, kalite ve operasyon kırılımlarında adım adım araştırmak gerekir",
  "template": "",
  "publish": false
}
```

Kurallar:

- `id` benzersiz slug olmalı; aynı id ikinci kez çalıştırılmaz.
- `type` şu anda yalnız `instagram-karosel`.
- `topic` tek satırdır.
- `template` boşsa CreativeSuite seçer. İstenirse katalogdaki izinli şablonlardan biri verilir.
- `publish` zorunlu olarak `false`. Bu uzaktan üretim akışı yayın yapmaz.
- Her iş dosyası **tek commit** olarak gönderilmelidir. Push tetikleyicisi o commit'teki işi başlatır.

## Akış

```
job JSON push
  ↓
CreativeSuite metni üretir
  ↓
metin-onayi       ← workflow burada DURUR
  ↓ GitHub Actions / Run workflow / approve-text
CreativeSuite görsel + render üretir
  ↓
tasarim-onayi     ← workflow burada DURUR
  ↓ GitHub Actions / Run workflow / approve-design
CreativeSuite düzeltme + final render + caption üretir
  ↓
insan-onayi       ← burada DURUR; PUBLISH ÇAĞRILMAZ
  ↓
final ZIP artifact: JPEG + PNG + manifest + panorama + caption
```

`approve-text` ve `approve-design` yalnız `workflow_dispatch` ile çalışır. Bu, kapıları
agent'ın kendi kendine geçmesini engeller ve R-14'teki insan kararını korur.

Red için:

- `reject-text`
- `reject-design`

seçilir ve `note` alanına gerekçe yazılır. Gerekçesiz red kabul edilmez.

## Runner kurulumu

Ubuntu makinede repository checkout'undan önce GitHub self-hosted runner kurulup
`creativesuite` etiketi verilmelidir. Runner servisini başlatmadan önce aynı kullanıcı
hesabında aşağıdakiler çalışıyor olmalıdır:

```bash
node --version      # major 22
pnpm --version
just --version
sops --version
age --version
ffmpeg -version
claude --version
```

Ayrıca:

- SOPS'un AGE private key'e erişebilmesi,
- Claude Code hesabının oturumunun açık olması,
- `secrets/secrets.enc.yaml` içindeki provider değişkenlerinin çözülebilmesi,
- ilk matte kullanımında gereken rembg modelinin indirilebilmesi

gerekir.

İlk doğrulama:

```bash
just setup
sops exec-env secrets/secrets.enc.yaml 'just plan instagram-karosel "test konusu"'
```

## Kalıcı durum

Human gate'ler farklı GitHub Actions koşularında geçildiği için ephemeral checkout yetmez.
Workflow her işi şu dizinde saklar:

```
~/.creativesuite-ci/jobs/<job-id>/
```

Bu dizin tamamlanana kadar silinmemelidir. CreativeSuite'in kendi `derived/runs`
kayıtları ve içerik-adresli blob'ları burada yaşar; onaydan sonra aynı run tam olarak
buradan sürdürülür.

## Teslimat

Final artifact:

```
creative-final-<job-id>/
  jpeg/
  png/
  meta/
    manifest.json
    panorama.json
    yayin-metni.json
    job.json
    RUN_ID.txt
  <job-id>-delivery.zip
```

Bu paket üretim teslimatıdır; **yayın onayı değildir**. Son `insan-onayi` kapısı
bilerek kapalı bırakılır.

## Boyut

Instagram organik karosel sözleşmesi: **1080 × 1440 (3:4)**.

Pipeline içindeki görsel brief oranı da 3:4, render yüksekliği de 1440 olmalıdır.
