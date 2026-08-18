# Arşiv — aile tabanlı karosel tasarımı (emekli)

**Emekliye ayrıldı:** 2026-08-18 · **Yerine geçen:** katalog merkezli üretim (D-268)
**Neden burada duruyor:** Emeklilik silme değildir (Yasa 10 · R-12). Dosya kalıyor,
kararı ve gerekçesi kayıtta; geri dönmek isteyen ne olduğunu ve neden bırakıldığını
okuyabilsin.

---

## Ne denendi

**Tek gramer + parametre.** `packages/render/src/sablon.ts` bir karosel kompozisyon
grameri kuruyordu; `AileProfili` (sekiz aile) o gramerin parametrelerini taşıyordu:
renk rotasyonu, süsleme yoğunluğu, tipografi efektleri, degrade, vinyet. `aileSec`
içerikten bir aile seçiyordu ve her slayt **ayrı ayrı** render ediliyordu.

`sablon-turu.mjs` bu yaklaşımın deney tezgâhıydı: **aynı metin, yedi aile**, hat
uçtan uca koşuyor ve yedi çıktı yan yana konuyordu.

## Neden bırakıldı

**Deney kendi yanıtını verdi.** Yedi çıktı ızgaraya konunca yedi TASARIM değil,
**tek tasarımın yedi BOYASI** göründü. Sebep yapısaldı:

1. **Kompozisyon aileye ait değildi.** Tuvalin nasıl bölündüğü, hangi ögenin nereye
   oturduğu, çizginin hangi açıyla geçtiği `sablon.ts`'e GÖMÜLÜYDÜ. Aile yalnız renk ve
   süsleme diyebiliyordu. Bir şablonu şablon yapan şey ise rengi değil; **çizgileri,
   açıları, bölmeleri ve akışı.**
2. **Süreklilik İMA EDİLİYORDU.** Her slayt ayrı render edilirken kesintisiz görünmek
   imkânsız: eğrinin çıkış açısını sonrakinin giriş açısına uydurmak, yarım bir şekli
   kenardan taşırmak — hiçbiri gerçekten sürekli görünmedi ve görünemezdi.
   **Süreklilik bir efekt değil, tuvalin kendisidir.**
3. **Çeşitlilik ölçüldü ve düşük çıktı.** `temel` ile `akici` altı parmak izi alanının
   yalnız İKİsinde ayrışıyordu; uzaklık 0,33.

## Yerine ne geldi

`packages/render/src/panorama.ts` — `N × 1080 × 1350` **tek tuval**, sonra dilimleme.
Kesimi aşan öge içerikten türer (veri eğrisi · kemer · kesik öznenin kolu · akan oklar).
Katalog (`packages/contracts/src/katalog.ts` + `packages/render/src/katalog-ornek.ts`)
altı şablonu **dolu taslak** olarak taşıyor; agent sıfırdan kurmuyor, çoğaltıp düzenliyor.

Kullanım: `docs/referans/katalog-merkezli-hat.md`.

## NE EMEKLİ OLMADI — ve neden

⚠ ⚠ **`sablon.ts`, `AileProfili` ve `static.ts` KODDA DURUYOR ve silinmedi.** Bu bir
eksik değil, bir ölçüm sonucu: `static.ts` yalnız karosel çizmiyor. LinkedIn dökümanı,
deck PDF'i, prospect-deck, reels, explainer ve tek görsel postu — **sekiz hat** ondan
besleniyor ve `doc.aile` referansı o dosyada on altı yerde geçiyor. Karosel tasarımını
emekliye ayırmak için belge/deck render'ını kırmak orantısızdı.

**Emekli olan şey karosel için AİLE SEÇİMİdir**, slayt-başına render'ın kendisi değil.
Karosel ürünü artık katalogdan geçiyor; `aileSec` yalnız belge/deck yolunda varsayılan
üretmeye devam ediyor.

⚠ `registry/pipelines/instagram-carousel.pipeline.yaml` de yerinde duruyor: `apps/ui`
ona bağlı ve FAZ-3.14 (bloke, `2.9` bekliyor) onu hedefliyor. Silmek, tiklenmemiş bir
faz adımını hedefsiz bırakırdı. Yerini alan hat `instagram-karosel`.
