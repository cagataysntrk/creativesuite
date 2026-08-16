# DURUM

> Döngünün her turda okuduğu ve yazdığı tek durum dosyası.
> Bağlam sıfırlanırsa **önce burayı oku** (`CLAUDE.md` → "BAĞLAM COMPACT'LENDİYSE").

```yaml
# ── makine-okunur durum bloğu (LOOP§E) ───────────────────────────────────────
aktif_faz: 7
siradaki_adim: 7.3
son_guncelleme: 2026-08-16
bloke: ["2.9:insan", "3.7:insan", "3.8:insan", "3.14:insan", "4.13b:insan", "5.4b:insan", "5.5b:insan", "6.5b:insan", "6.9b:insan", "7.2b:insan"]
deneme_sayaci: {}
son_kanit: "IKINCI DOGRULAMA TURUNUN BULGULARI DA KAPANDI (16 bulgu). En agiri BENIM ILK TURDA ACTIGIM GERILEMEYDI: PDF ciktisi slides tasimadigi icin deps.check hic cagrilmiyordu ve lintDocument onun ICINDEYDI — deck, linkedin-document ve prospect-deck hatlarinda kaynaksiz sayi kapisi HIC kosmuyordu, yani fazin cikis kriteri uretimde zorlanmiyordu; ustune zincire lexiconIhlalleri: [] geciyordum ve yorumum check in icinde kostu diyordu. Lexicon artik AYRI bir yetenek, her bicimde kosuyor. KENDI KENDINI ONAYLAYAN TEST CIFTI: composeBody productShots u basis siz uretiyordu, zincir basis ariyordu, testlerim elle basis yazilmis URETIMIN HIC URETMEDIGI fikstur kullaniyordu — yeni uretim-sekli.test.ts fikstur yazmiyor, gercek COMPOSE ciktisini gercek zincire ve gercek dedektore veriyor. IR YOLU ACILDI: deck.ir.json artik CLI tarafindan okunuyor (COMPOSE saf kaliyor, §3.10) ve grafik/diyagram bloklari uretime giriyor; IR dan gelen grafik PDF te VEKTOR olarak olculdu. Kisisellestirme alanlarinin URETICISI eklendi (operator sayar, sistem cikarim yapmaz — tavan editoryal bir karardir). PROPOSE govdesi, CLI serbest parametreleri, max_pages olu kisiti, capture ozetle listesi, sayfaAlt exhaustive switch. §14 SINIRI ARTIK KENDI KAPISINI ISTIYOR: yayin onayi ingestGate i aciyordu, artik untrusted-input kapisi ayri. SELALE IDDIASI DARALTILDI: dort kaynagin adaptoru yazilmamis ve bu V-24 anahtar blokajinin arkasina saklanmis TEKNIK bir eksikti — faz dosyasi ve V-24 duzeltildi. 1144 test, 36 kapi, 13 ihlal kirmizi."
```

## Neredeyiz

**FAZ 6 ŞARTLI KAPANDI** (D-217). **İki doğrulama turu koştu, 28 bulgunun hepsi kapandı.** Birinci tur 12, ikinci tur 16
bulgu verdi — ikisi de aynı sınıftan: **kod yazılmış, üretim yolunda çağıranı yok.**
İkinci tur ayrıca benim ilk turda açtığım bir gerilemeyi yakaladı (PDF yolunda lexicon
hiç koşmuyordu) ve **kendi kendini onaylayan bir test çiftini** ortaya çıkardı.
**D-79: üçüncü tur AÇILMAZ.** **36 kapı · 13 ihlal kırmızı · 1144 test.**

> **Kök neden, üçüncü tekrar:** D-182 donmuş planı yazdı ama `uret.mjs` çağırmıyordu ·
> D-190 düğmeyi çizdi ama `onClick` yoktu · şimdi aynı hata **bir seviye yukarıda**:
> `tazeMi`nin çağıranı var (`inspectManifest`) ama `inspectManifest` o veriyi hiç
> görmüyor, çünkü yazan yok. **"Çağıran var mı" tek adım için değil, ZİNCİR için
> sorulmalı:** üretim girişinden kurala kesintisiz yol var mı?

> FAZ 5'in `aac` maddesi de karşılanmadı ve tikle örtülmedi (D-206): ses akışı yok,
> `5.4b`/`5.5b` insan girdisi bekliyor. Video ölçüldü: h264 · yuv420p · 1920×1080.

> ⛔ **ON ADIM İNSAN GİRDİSİ BEKLİYOR** — `2.9` · `3.7` · `3.8` · `3.14` · `4.13b` ·
> `5.4b` · `5.5b` · `6.5b` · `6.9b` · `7.2b`.
> Sınıfları `insan` (D-157), o yüzden LOOP§G üçlü kuralına saymazlar: onu da plan
> hatası değil, planın `V-nn` olarak önceden kaydettiği dış bağımlılıklar. Döngü
> bağımsız adımlarla devam ediyor, ama bu ilan her turda burada durur.
>
> | Adım | Bekleyen | Ne gerekiyor |
> |---|---|---|
> | `2.9` | insan onayı | `just onayla corpus/*/*.md` → 7 kayıt `draft` |
> | `3.7` | V-16 | `CF_ACCOUNT_ID`+`CF_API_TOKEN` ya da `FAL_KEY` |
> | `3.8` | V-16 | aynı + ~$3 gerçek para |
> | `3.14` | `2.9` | onaylı corpus olmadan `NO_CONTEXT` |
> | `4.13b` | V-18 | Tailscale kurulumu + gerçek Telegram token'ı |
> | `5.4b` | V-21 | `chatterbox` ağırlıkları (~2 GB) + `GEMINI_API_KEY` + `ELEVENLABS_API_KEY` |
> | `5.5b` | V-22 | `whisper.cpp` kurulumu ya da gerçek `GROQ_API_KEY` |
> | `6.5b` | V-24 | Bright Data · Tavily · ihale-mcp · borsa-mcp anahtarları |
> | `6.9b` | V-25 | gerçek bir prospect kaydı (+ `2.9` onayı) |
> | `7.2b` | V-26 | Meta uygulaması + sayfa bağlantısı + uzun ömürlü token |

## Tamamlananlar

> **Bu tablo yalnız AKTİF fazı gösterir** (D-85). Önceki fazlar faz dosyalarındaki
> tiklerdedir ve `git log` tek başına yol haritasıdır.
>
> FAZ 0+1: 51 · **FAZ 2: 12/13** · **FAZ 3: 12/15** (şartlı, D-158) · **FAZ 4: 17/17** ·
> **FAZ 5: 8/10** (şartlı, D-206) · **FAZ 6: 10/12** (şartlı, D-217; `6.5b` V-24,
> `6.9b` V-25). Tikler faz dosyalarında.

| Adım | Tarih |
|---|---|
| **7.1** · spec drift denetçisi; güvenli alan ayrı (D-215) | 2026-08-16 |
| **7.2** · yayın kapıları; sıra tipe gömülü, tek yayıncı mekanik | 2026-08-16 |

## Sıradaki adım

**FAZ 6'yı ŞARTLI KAPAT** — sonra `7.3`. İki doğrulama turunun bulguları kapandı;
kalan tek engel insan girdisi: `6.5b` (V-24) ve `6.9b` (V-25). Çıkış kriteri **tikle
ÖRTÜLMEYECEK** (D-206 deseni): "adı geçen gerçek bir şirkete deck gönderildi" bir insan
eylemidir.

Ardından **`7.3` — LinkedIn adaptörü** (§9.3 · R-34): `w_member_social`, döküman postu,
5 MB sınırı. **V-23 orada kapanır** — döküman sayfa tavanını kaynağıyla doğrula.

## Devreden borçlar

QA/bağlam girdisi 0/18 (`2.9` blokajı) · bileşen testi FAZ 9'a · V-19 +%30 görsel
ölçüm · V-23 LinkedIn döküman sınırı (→ 7.3) · V-24 şelale anahtarları (→ 6.5b) ·
V-25 gerçek prospect (→ 6.9b) · V-26 Meta token (→ 7.2b).

## Bloke adımlar

> Not: golden metrikler bugün SİSTEM fontuyla donduruldu; marka fontu geldiğinde
> (V-02) temel yeniden alınır — bu bir düzeltme, bir blokaj değil (D-144).

**`2.9` — insan onayı bekliyor (D-83).** Yedi kayıt `draft` indi, retrieval'a görünmüyor.
`active` yapmak agent'ın işi değil (R-14): `just onayla corpus/*/*.md` → `just reindex`.

**Okurken dikkat:** `positioning`, `icp`, `offer` kayıtları HİPOTEZ (V-07) — dikey
seçimi üçüncü taraf verisinden çıkarım.

✅ **Sessiz bir engel kaldırıldı (D-167):** altı kaydın `era_id`si yanlıştı; onay işe
yaramamış görünecekti. Ölçüldü: düzeltmeyle 7 kayıt geliyor, düzeltmesiz 1.

**`3.7` · `3.8` — V-16.** `CF_ACCOUNT_ID`+`CF_API_TOKEN` ya da `FAL_KEY`; `3.8` ayrıca
~$3 gerçek para. Anahtarsız `image.generate` hiçbir sağlayıcıya çözülmüyor.

**`4.13b` — V-18.** `tailscale` yok, `TELEGRAM_BOT_TOKEN` yer tutucu; mantık test edilmiş.

**`3.14` — `2.9`'a bağlı.** Onaylı corpus olmadan hat `bilgi-sec`te `NO_CONTEXT` ile
duruyor; doğru davranış (R-13), atlatılmıyor. `2.9` açıldığı gün FAZ 3 TAM kapanır.
