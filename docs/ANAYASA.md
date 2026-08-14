# ANAYASA

> Sistemin tek referansı. **Baştan sona okunmaz** — faz dosyasındaki 📖 satırı
> hangi bölümü okuyacağını söyler. Bölüm numaraları kalıcıdır: bir bölüm silinmez,
> `(kaldırıldı → §X.Y)` işaretiyle bırakılır ki eski atıflar kırılmasın.
>
> Durum: **iskelet.** Başlıklar ve çapalar kilitli; içerik 0.B.2b–0.B.2d'de dolacak.

## §1 Amaç, kapsam, işletim modeli {#section-1}

Neden var, ne yapar, ne yapmaz. Üç kapı (UI · Claude Code · Telegram) ve
"UI işletir, Claude Code genişletir" kuralı. Başarı ölçütleri.

## §2 Değişmez ilkeler {#section-2}

İhlal edilemez 12 yasa. Bir yasa değişecekse önce burada değişir, sonra kodda.

## §3 Sistem mimarisi {#section-3}

### §3.1 Dört halka {#section-3-1}
Contracts · Kernel · Registry · Corpus · Derived. Hangisi hangisini import edebilir.

### §3.2 Kayıt zarfı {#section-3-2}
Sabit sistem alanları. Zarf kernel'e açık, `attributes` kapalı (D-41).

### §3.3 Şema profili {#section-3-3}
İzin verilen JSON Schema 2020-12 alt kümesi. Yasaklananlar ve neden.

### §3.4 Projeksiyon derleyicisi {#section-3-4}
Tek şema → form + TS tipi + katı LLM şeması + SQLite DDL.

### §3.5 Türetilmiş indeks {#section-3-5}
`derived/index` silinebilir, `derived/runs` silinemez (D-38).

### §3.6 Bağımlılık yönü ve modül sınırları {#section-3-6}
Halka sınırlarının mekanik zorlaması: lint bölgeleri, dependency-cruiser, project references.

### §3.7 Durum makineleri {#section-3-7}
Run · Asset · Record · Job yaşam döngüleri. Yasal geçişler ve kim tetikler.

### §3.8 "Tam olarak bir tane olmalı" listesi {#section-3-8}
Corpus yazıcı, git çağıran, retrieval yüklemi, maliyet defteri, secret okuyucu,
SQLite handle, Chromium başlatan, saat, RNG, id üreteci, HTTP istemcisi.

### §3.9 Kanonik adlar {#section-3-9}
Aynı şeyin tek adı. Yanlış varyantlar `citations` kapısında hata verir.

### §3.10 Dokuz fiil ve yan etki sınıfları {#section-3-10}
RESOLVE · SELECT · COMPOSE · GENERATE · RENDER · VALIDATE · PROPOSE · PUBLISH · INGEST.
Yetenek adı ≠ fiil adı.

## §4 Marka sistemi {#section-4}

### §4.1 Token mimarisi {#section-4-1}
### §4.2 Çok markalılık ve kalıtım {#section-4-2}
`brand_id` birinci sınıf eksen (D-39). `brand/<brand_id>/…`.
### §4.3 Dönem (era) modeli {#section-4-3}
Era = git tag + manifest + kayıtta damga. Dönem klasörü yok (D-30).
### §4.4 Yeniden üretim motoru {#section-4-4}
`discovery plan/review/apply`. Worktree + branch + diff.
### §4.5 Sticky karar defteri {#section-4-5}
Reddettiğin bir op tekrar sorulmaz. Dördüncü çalıştırmada sistemi terk etmeni engelleyen şey.
### §4.6 Dönem geçişi ve içerik denetimi {#section-4-6}
Geri dönüşüm geçmişi yük değil kanıt: `era_of_origin` + `generalisation_note`.

## §5 Bilgi ve hafıza {#section-5}

### §5.1 Corpus {#section-5-1}
### §5.2 Retrieval yüklemi {#section-5-2}
Kodda tek yerde. `:as_of` ile noktasal denetim.
### §5.3 Bağlam tarifleri {#section-5-3}
Bölüm başına token bütçesi + bağlam manifesti.
### §5.4 Öneri → onay yolu {#section-5-4}
Agent önerir (`draft`), insan uygular (= git commit). D-31.
### §5.5 Çelişki tahkimi {#section-5-5}
### §5.6 Türkçe arama {#section-5-6}
FTS5 unicode61 + paralel trigram + RRF. Türkçe'nin stemmer'ı yok.

## §6 Strateji modeli {#section-6}

Konumlandırma · mesaj evi · ICP · persona · kanıt · rakip · teklif. Alan düzeyinde şema.

## §7 Üretim {#section-7}

### §7.1 Render mimarisi {#section-7-1}
Tek motor: headless Chromium. Üç yüzey, aynı font yolu, aynı hata modu.
### §7.2 Türkçe tipografi kapıları {#section-7-2}
Görsel modeline Türkçe metin çizdirilmez. Golden = JSON metrik, piksel değil.
### §7.3 Görsel üretimi ve marka LoRA {#section-7-3}
### §7.4 Hareket katmanı {#section-7-4}
HyperFrames (Apache 2.0). Remotion lisansı 4+ çalışanda ücretli.
### §7.5 Ses, altyazı, müzik {#section-7-5}
### §7.6 Deck ve döküman {#section-7-6}
### §7.7 Demo yakalama {#section-7-7}
Tıklama hedefleri piksel oluşmadan ÖNCE bilinir — otomatik klipleyicilerin yapamadığı şey.

## §8 Sağlayıcılar {#section-8}

### §8.1 Tanımlayıcı formatı {#section-8-1}
### §8.2 Yetenek yönlendiricisi {#section-8-2}
Filtrele → fiyatla → skorla → yedek → **kaybedenleri de kaydet**.
### §8.3 Maliyet ve bütçe {#section-8-3}
Para = bigint USD mikro (D-36). Tavan UI'dan ayarlanır (D-17).
### §8.4 Adaptör sözleşmesi {#section-8-4}
`estimate` senkron ve saf. Sağlayıcı yanıt şekli sınırı geçemez.
### §8.5 Yeniden deneme, idempotency, rate limit {#section-8-5}
Devre kesici 5 ardışık hata, `(providerId, capability)` anahtarlı.
### §8.6 Hata taksonomisi {#section-8-6}
Kapalı birleşim. Her hata harcanan parayı taşır.
### §8.7 Sağlayıcı kataloğu {#section-8-7}
**ÜRETİLMİŞ** — `docs/referans/saglayicilar.md`. Elle yazılmaz.

## §9 Kanallar {#section-9}

### §9.1 Platform spec tablosu {#section-9-1}
Her satır `sourceUrl` + `verifiedAt` taşır. Üç aylık drift denetçisi.
### §9.2 Meta adaptörü {#section-9-2}
Kendi işletmen için App Review gerekmiyor. Token 60 günde ölür.
### §9.3 LinkedIn adaptörü {#section-9-3}
Döküman postu en yüksek etkileşimli format; hiçbir aggregator vermiyor.
### §9.4 Onay yüzeyleri {#section-9-4}
PC · Tailscale · Telegram.

## §10 Pipeline kataloğu {#section-10}

Dokuz iş: adım şeması, insan kapıları, çıktılar, maliyet. **ÜRETİLMİŞ** kısmı
`docs/referans/pipelinelar.md`.

## §11 Kalite ve uyum {#section-11}

### §11.1 Marka QA {#section-11-1}
Rozet değil tolerans okuması: ΔE limit karşısında ölçüm.
### §11.2 Deterministik lexicon linter {#section-11-2}
Modele "bu marka uygun mu" diye sormak işe yaramaz; yasak terim listesi yarar.
### §11.3 Hukuki kapılar {#section-11-3}
Reklam Yönetmeliği Md. 27/12 · KVKK · EU AI Act Md. 50.
### §11.4 Kaynaksız iddia yasağı {#section-11-4}
`claim_source` olmadan sayı yayınlanmaz.

## §12 Komuta merkezi tasarım sistemi {#section-12}

### §12.1 Renk {#section-12-1}
İzleme kabini tezi: kabuk marka-nötr, ekrandaki tek renkli şey iş.
### §12.2 Tipografi {#section-12-2}
Ölçülen her şey mono ve tabular. Türkçe %20-30 uzun.
### §12.3 Boşluk ve yoğunluk {#section-12-3}
### §12.4 Kabuk ↔ yüzey modeli {#section-12-4}
Stüdyo bir rota, modal değil.
### §12.5 Klavye haritası {#section-12-5}
Komut paleti birincil navigasyon, kısayol değil.
### §12.6 Durum matrisi {#section-12-6}
Yedi durum. Bayat içerik soldurulmaz. Hata toast değil.
### §12.7 Hareket {#section-12-7}
Altı şey animasyonlanır, hiçbiri 320ms'yi geçmez.
### §12.8 Erişilebilirlik {#section-12-8}
### §12.9 Ekranlar {#section-12-9}

## §13 Gözlemlenebilirlik {#section-13}

Run manifest sözleşmesi · maliyet defteri · `rerun` (donmuş plan) vs `replay` (bugünün tanımı).

## §14 Güvenlik {#section-14}

Prompt injection sınırı (`untrusted_input`) · sandbox katmanları · secret yönetimi (SOPS+age).

## §15 Test stratejisi {#section-15}

Golden-file · kontrat testleri · cassette · LLM değerlendirme · her ücretli fiil dry-run edilebilir.

## §16 Riskler ve azaltmalar {#section-16}

En büyüğü: aşırı mühendislik. Üç ay strateji CMS'i yazıp imalatçılarla sıfır hafta konuşmak.

## §17 Reddedilenler {#section-17}

~60 araç ve yaklaşım, her biri gerekçesiyle. Reddedilmiş bir karara atıf vermek hata.

## §18 Açık kalemler {#section-18}

`V-nn` doğrulama borçları. Her biri bir faz adımına bağlı.

## §19 Araştırma eki {#section-19}

`docs/research/` — 45 agent çıktısı, damıtılmış. Baştan sona okunmaz, `ctx_search` ile sorgulanır.
Ham transkript `~/.claude/projects/.../subagents/workflows/` altında.
