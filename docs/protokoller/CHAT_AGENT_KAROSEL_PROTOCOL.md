# Chat Agent Carousel Protocol — Candidate V1

> Durum: **ilk gerçek koşu adayı.** `upcytech-oee-arastirma-01` görsel ve editoryal QA'dan başarıyla geçince `main` üzerinde kalıcı protokol kabul edilir.

## Amaç

CreativeSuite'i harici bir LLM üretim hattı olarak değil, ChatGPT'nin yönettiği deterministik yaratıcı render sistemi olarak kullanmak.

## Roller

**ChatGPT**
- konu ve hedef kitleyi çözer;
- gerekiyorsa kaynak araştırması yapar;
- karosel bilgi mimarisini kurar;
- slayt metinlerini yazar;
- CreativeSuite `PanoramaBelgesi`ni doğrudan oluşturur/değiştirir;
- caption, kaynak ve review notlarını üretir;
- GitHub render artifact'ını indirir;
- her slaydı tek tek görsel olarak denetler;
- kusurlu alanı kaynak belgede düzeltir ve yeniden render ettirir;
- final ZIP'i teslim eder.

**GitHub Actions**
- model/agent değildir;
- `ubuntu-latest` üzerinde repo bağımlılıklarını ve Chromium'u kurar;
- CreativeSuite'i build eder;
- `panoramaDenetle` ile mekanik QA yapar;
- `renderPanorama` ile 1080×1440 JPEG ve PNG üretir;
- artifact sağlar.

## Yasaklar

- Kullanıcının bilgisayarına veya self-hosted runner'a bağımlılık yok.
- Claude/OpenAI/başka bir model API anahtarı zorunlu değil.
- Workflow yayın yapmaz.
- Render edilmiş PNG/JPEG elle yamalanmaz; kaynak `panorama.json` düzeltilir.
- Kaynaksız nicel iş iddiası kullanılmaz.
- ChatGPT artifact'ı görmeden “final” demez.

## Üretim döngüsü

1. **Brief** — amaç, hedef kitle, öğretilecek fikir, ürün bağlantısı.
2. **Research** — sadece gerekli gerçekler ve kaynaklar.
3. **Narrative** — kapak → öğretici adımlar → uygulama → ürün bağlantısı.
4. **Source document** — `ci/chat-jobs/<id>/panorama.json`.
5. **Remote render** — GitHub-hosted CreativeSuite.
6. **Mechanical QA** — sıfır kusur hedefi.
7. **Visual QA** — her slayt tek tek açılır.
8. **Editorial QA** — tekrar, slogan, belirsizlik, kanıtsız iddia kontrolü.
9. **Revision** — sorun kaynak JSON'da düzeltilir; tekrar render.
10. **Delivery** — PNG + JPEG + caption + sources + review + final ZIP.

## Başarı eşiği

Bir karosel ancak aşağıdakilerin tamamı sağlanırsa finaldir:

- 1080×1440 piksel ve 3:4 oran;
- CreativeSuite mekanik QA kusuru yok;
- kesilmiş/taşmış metin yok;
- mobil ekranda okunabilir tipografi;
- her slayt bir öncekinin doğal devamı;
- kapak vaat ettiği bilgiyi gerçekten teslim ediyor;
- en az bir uygulanabilir yöntem/çerçeve öğretiyor;
- ürün tanıtımı öğretici içeriği boğmuyor;
- son slayt anlaşılır ve somut;
- caption karoseli kopyalamak yerine derinleştiriyor;
- kaynaklar doğrulanabilir;
- ChatGPT bütün render'ları görsel olarak incelemiş.

## İlk referans koşu

`upcytech-oee-arastirma-01`

Başarılı olursa bu dosyadaki **Candidate** ibaresi kaldırılır ve protokol V1 olarak sabitlenir.
