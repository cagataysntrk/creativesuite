# KARARLAR

Döngünün ve insanın aldığı **her** karar. Tarih · karar · gerekçe.
Append-only: bir karar silinmez. Reddedilen karar gövdesine **tam olarak** şu satır
eklenir ve yerine geçen belirtilir:

    **Durum:** reddedildi → D-nn

`citations` kapısı bu satırı arar; gövdede geçen "reddedildi" kelimesi yetmez
(bir kararın metninde "Remotion reddedildi" yazması kararın kendisini geçersiz kılmaz).
Sonda `V-nn` doğrulama borçları (🔴) durur.

Aktif defter 600 satırda tutulur; kapanmış kararlar `docs/kararlar/ARSIV-<yyyy>.md`'ye
devredilir. `citations` kapısı her `D-nn`'in ikisinden **tam olarak birinde** çözüldüğünü
doğrular.

---
## V-01 — Remotion lisansı ✅ KAPANDI (2026-08-15, D-80)
Bedava lisans "up to 3 employees" (LICENSE.md), şirket 6 kişi. Bizim kullanımımız
*Automators* katmanı: **$100/ay asgari**. D-25 teyit edildi. → FAZ-0.D.3

## V-02 — Hangi latin-ext font lisanslanacak
Marka kararı, FAZ 2 keşfiyle bağlantılı. → FAZ-0.A.5

## V-03 — rjsf'nin JSON Schema 2020-12 kapsaması
Kısıtlı profil bunu atlatmak için tasarlandı, yine de spike ile doğrula. → FAZ-0.D.4

## V-04 — fal endpoint-başına OpenAPI URL'i
Belgelenmiş public arayüz mü? Elle tanımlayıcı yedeği her hâlükârda zorunlu. → FAZ-0.D.5

## V-05 — Anthropic yapılandırılmış çıktı alt kümesi
OpenAI'ninkiyle aynı mı? Derleyici daha katı olana yazıldı, CI'da gerçek çağrıyla doğrula. → FAZ-1.4

## V-06 — `dima` ürün mü modül mü
"dima by Upcytech" onaylı-marka modeli doğru mu? Yanlış karar sonradan MAJOR sürüm
değişikliği demek. → FAZ-2.11

## V-07 — Era 1'in dikeyi
Kanıt otomotiv tedarik/Bursa'yı işaret ediyor ama bu üçüncü taraf verisinden çıkarım,
gerçek satış pipeline'ından değil. Hipotez olarak tohumla, 10 gerçek görüşmeden sonra üzerine yaz. → FAZ-2.9

## V-08 — Kuruluş tarihi çelişkisi ✅ KAPANDI (2026-08-15, D-82)
**3 Temmuz 2025** tek doğrudur — ticaret sicili BELGELİDİR, diğer ikisi beyandır.
LinkedIn "2022" ve upcymarket.com "2021'den beri" düzeltilecek. → FAZ-2.9

## V-09 — KAP resmî REST API şartları
Ticari kullanıma uygun mu? Şartlar PDF'i "Hizmete Özel". → FAZ-6.5

## V-10 — Türk hukukçu
KVKK aydınlatma/açık rıza metinleri, sayısal performans iddialarının Reklam Kurulu
açısından durumu, sınır ötesi veri aktarımı beyanı. → FAZ-8.6

## V-11 — Run bağlam anlık görüntülerinin saklama süresi ✅ KAPANDI
Manifest sonsuza, bağlam N gün. **N = 90** (2026-08-15, FAZ-1.9). Gerekçe D-63'te.

## D-45 — KURALLAR.md yalnız zorlanan kuralları taşır
2026-08-14 · Araştırmadaki 111 kuralın tamamı kopyalanmadı; 46 kural yazıldı, 13'ü bugün
aktif olarak zorlanıyor, gerisi zorlanacağı faz adımına bağlandı.
**Neden:** faz dosyasının kendi kuralı "zorlaması olmayan kural yazılmaz". Uygulanmayan
111 kural, uygulanan 13'ten kötüdür — kimse hangisinin gerçek olduğunu bilmez ve liste
dekor hâline gelir. `Durum` sütunu dürüstlüğü görünür kılıyor.
**Alternatif:** hepsini kopyalayıp "ileride" işaretlemek — reddedildi, ayırt edilemez olurdu.
**Geri alma maliyeti:** düşük; tam külliyat `docs/research/5-kural-kitabi--*` altında duruyor.

## D-46 — DURUM tamamlananlar tablosu FAZ dosyasından türetilir
2026-08-14 · **Neden:** denetim, `DURUM.md` ve `FAZ-0.md`'nin ikisinin de "18 tamamlandı"
dediğini ama **aynı 18 olmadığını** buldu. İki elle tutulan liste kaçınılmaz olarak ayrışır.
FAZ dosyası tek doğrudur; DURUM ondan türetilir.
**Geri alma maliyeti:** yok.

## D-47 — Reddedilen karar açık DURUM satırıyla işaretlenir
2026-08-14 · Biçim: `**Durum:** reddedildi → D-nn` (gövdenin başında, tam bu biçimde).
**Neden:** anahtar kelime taraması yetmiyor — D-25'in gövdesinde "Remotion reddedildi"
yazıyor ve kapı kararın kendisini reddedilmiş sandı. İşaretleyici açık olmak zorunda.
**Geri alma maliyeti:** düşük.

## D-48 — Yerel ses için Kokoro değil Chatterbox
2026-08-15 · `hyperframes doctor` Kokoro'yu opsiyonel yerel TTS olarak öneriyor; **kurulmadı**.
**Neden:** araştırma bulgusu — Kokoro-82M'de **Türkçe yok**. Yerel şerit için Chatterbox
Multilingual (MIT, 500M, 6GB VRAM'e sığar) seçildi. Birincil altyazı Groq whisper;
whisper.cpp yalnız çevrimdışı yedek olarak, gerektiğinde kurulacak.
**Geri alma maliyeti:** yok, kurulmamış bir bağımlılık.

## D-49 — Secret deseni tireyi kapsamalı
2026-08-15 · `repo-hygiene` ilk deseni `sk-[A-Za-z0-9]{20,}` idi ve gerçek Anthropic
anahtarını (`sk-ant-api03-…`) **kaçırıyordu** — tirede duruyordu. Desen `[A-Za-z0-9_-]`
yapıldı, `fal-` biçimi eklendi.
**Neden kayda değer:** kapı yazıldığı gün kördü ve yalnızca ihlal testi ortaya çıkardı.
R-71'in ("yeşil kapı hiçbir şey kanıtlamaz") somut kanıtı.

## V-12 — Aday dönem probe bake-off mekanizması
`brand/probes/` ile birden fazla aday dönemin yan yana karşılaştırılması. §12'nin sert
kuralı gereği **ilk yeniden üretim gerçekten acıtana kadar** kurulmaz. → FAZ-2.8

## D-50 — brand/ ve content/ halka aidiyeti
2026-08-15 · Denetim, `brand/` ve `content/`'in dört halkadan hiçbirine ait olmadığını
buldu. Karar: **`brand/` Ring 1'dir** (kullanıcının düzenlediği yapılandırma, registry
ile aynı sınıf), **`content/` Ring 2'dir** (corpus'un üretilmiş kardeşi, aynı yaşam
döngüsü kurallarına tabi). Yeni halka açılmadı.
**Neden:** beşinci bir halka, dört halkanın tek değerini — import yönünün mekanik
zorlanabilirliğini — sulandırırdı.

## D-51 — Döngü kuralı gevşetemez (R-76)
2026-08-15 · Denetim bulgusu #71: döngünün tam yetkisi var ve `KURALLAR.md`'yi
değiştirebiliyor; tek kısıt "kod ve kural aynı olsun" idi. Bu, kırmızı kapıyı geçmek
için kuralı gevşetmeyi meşru gösteriyordu. R-76 eklendi: kural değişikliği ayrı tur,
ayrı commit, `D-nn` atfı zorunlu.
**Geri alma maliyeti:** yok — saf kısıt.

## D-52 — Bir tur = bir veya daha fazla adım
2026-08-15 · `LOOP§C`'nin "bir turda birden fazla adım deneme" kuralı **kaldırıldı**.
Tur doğal bir durakta biter: bağlam dolduğunda, bloke adıma çarpıldığında, faz
kapandığında veya kullanıcı müdahale ettiğinde. Her adım kendi commit'ini alır ama
commit turu bitirmez.
**Neden:** kullanıcının açık talimatı — "her committe durmak yasak, uzun geliştirmeler
yapılacak, sürekli wakeup beklemeyeceğiz". Orijinal kural bağlam kaybına karşı
tasarlanmıştı; ama `DURUM.md` + faz dosyası tikleri zaten o güvenliği sağlıyor,
tur sınırı ek koruma getirmiyordu.
**Korunan kısıt:** yarım adım yasağı. Bir adım ya biter, ya başlamaz, ya bloke işaretlenir.
**Geri alma maliyeti:** tek satır.

## D-53 — FAZ 0 kapanmadan FAZ 1'e geçiliyor
2026-08-15 · FAZ 0'da 17 adım kaldı ama **yedisi `packages/` gerektiriyor** (0.C.1, 0.C.2,
0.C.3, 0.C.4, 0.C.8, 0.C.10, 0.C.11) — workspace olmadan yazılamaz. Beşi bake-off ve
marka kararı bekliyor (0.A.5, 0.D.1–0.D.5), ikisi ileri faz dosyası (0.B.8b/c), biri
zaten çalışan döngü provası (0.E.5).
**Karar:** FAZ 1.1'e geçilir; `packages/` doğduğunda 0.C bloğu geri dönülüp kapatılır.
**Neden:** bloke bir adımda beklemek, bağımsız bir adımı ilerletmekten kötüdür (LOOP§G).
Kullanıcı bu durumda FAZ 1'e geçme yetkisini açıkça verdi.
**Risk:** FAZ 0 "kapalı" sayılmadan FAZ 1 ilerlerse kapılar geç kurulur ve o aralıkta
yazılan kod denetimsiz kalır. **Azaltma:** 0.C bloğu FAZ-1.1 biter bitmez, FAZ-1.2'den
ÖNCE kapatılır — yani workspace'in ilk gerçek kodu zaten kapılı doğar.

## D-54 — `.npmrc` sessizce ölüydü; ayarlar `pnpm-workspace.yaml`'a taşındı
2026-08-15 · FAZ-0.A.2'de yazılan `.npmrc` beş garanti veriyordu: `save-exact`,
`engine-strict`, `hoist=false`, `strict-peer-dependencies`, `enable-pre-post-scripts=false`.
**pnpm 11 bu dosyayı okumuyor.** `pnpm config get hoist` beşi için de `undefined` döndü —
yani phantom bağımlılık koruması, tam sürüm sabitleme ve Node sürüm kontrolü aylarca
"kurulu" görünüp hiçbir şey yapmayacaktı. İlk somut kanıt: `pnpm add eslint-import-resolver-node`
`^0.4.0` yazdı, `save-exact` varken caret imkânsız olmalıydı.
**Karar:** `.npmrc` silindi; beş ayar `pnpm-workspace.yaml`'a camelCase adlarıyla taşındı.
Kurulum betiği izni `pnpm.onlyBuiltDependencies` (package.json) değil `allowBuilds:` altında.
**Neden önemli:** bu, R-71'in ta kendisi — yapılandırma da bir kapıdır ve doğrulanmadan
yeşil sayılamaz. **Kanıt:** `pnpm config get hoist` → `false`, beş ayarın beşi de okunuyor.
**Ders:** bir ayarın dosyada yazıyor olması, aracın onu okuduğu anlamına gelmez.

## D-55 — Halka lint'i PAKET ADINA bakar, çözümlenmiş yola değil
2026-08-15 · FAZ-0.C.2 `import-x/no-restricted-paths` bölgeleri öngörüyordu. Uygulamada
o kural import'u **çözmek** zorunda: `@suite/kernel` → dosya yolu. Paketler `exports`
üzerinden `dist/`'e çözülür ve `dist/` derlenmemişse çözümleme başarısız olur — kural
o zaman hata vermez, **sessizce hiçbir şey demez**. Yani `rm -rf dist` yapan biri kapıyı
farkında olmadan kapatırdı.
**Karar:** halka sınırı ESLint'te ad tabanlı `no-restricted-imports` ile kurulur; yol ve
grafik tabanlı denetim `depcruise`'a bırakılır ve orada `couldNotResolve` **hata** sayılır.
Kural tablosu tek yerde: `rings.config.mjs` — ESLint ve depcruise ikisi de oradan okur.
**Alternatif:** `just check` sırasını "önce tsc -b, sonra lint" diye sabitlemek. Reddedildi:
bir kapının doğruluğunu çalıştırma sırasına bağlamak, sıranın değiştiği gün sessiz yeşil üretir.
**Kanıt (ihlal testi):** `packages/contracts`'a `@suite/kernel` import'u eklendi →
ESLint rc=1, depcruise rc=1 (`cozulemeyen`), `tsc -b` rc=2. Bağımlılık `package.json`'a da
eklenince depcruise dört kural birden verdi: `halka-contracts`, `dongu-modul`, iki `dongu-klasor`.
Geri alınca üçü de rc=0.

## D-56 — lefthook ve secretlint kullanılmıyor; kancalar `.githooks/`'ta, gitleaks ikinci katman
2026-08-15 · FAZ-0.C.10 üç araç öngörüyordu: `secretlint` + `gitleaks` + `lefthook`.
**lefthook reddedildi:** repo `core.hooksPath=.githooks` ile çalışıyor ve lefthook
`.git/hooks`'a yazıyor. İkisi bir arada, git'in `.git/hooks`'u tamamen yok saymasına —
yani **hiçbir kancanın çalışmamasına** yol açar ve bunu sessizce yapar. Yerine iki
kanca elle yazıldı: `pre-commit` → `fast` grubu, `pre-push` → `all` grubu. Otuz satır.
**secretlint reddedildi:** kapsamı gitleaks ile büyük ölçüde örtüşüyor ve ~30 npm
bağımlılığı getiriyor. İki tarayıcı yeter, üç değil.
**gitleaks 8.30.1 KABUL EDİLDİ** ve `repo-hygiene`'in yanına kondu, yerine değil —
ikisi farklı hata sınıfı içindir. **Kanıt:** `sk_live_51QwEr…` (Stripe biçimi) yazıldı;
`repo-hygiene` rc=0 ile **kaçırdı** (deseni `sk-` tire bekliyor, `sk_` alt çizgi değil),
`gitleaks` rc=1 ile yakaladı. Kendi listemiz bildiğimizi, gitleaks bilmediğimizi yakalar.
**Sürpriz bulgu:** kaynak dosya silindikten sonra bile `packages/kernel/dist/leak.js`
anahtarı taşımaya devam etti — `tsc -b` kaynağı silinen çıktıyı temizlemiyor ve `dist/`
gitignore'lu olduğu için `gitleaks git` onu asla göremezdi. Bu yüzden kapı **hem** git
geçmişini **hem** çalışma ağacını tarar.
**Kanca hatası ve düzeltmesi:** ilk sürümde `nvm use` alt kabukta çalıştırılıyordu ve
üst kabuğun PATH'ini değiştirmiyordu; kanca Node 20 ile koştu, bir kapı çöktü ve commit
doğru sebeple değil, **yanlış sebeple** engellendi. Yeşil değil kırmızıydı ama yine de
yanlıştı — kapının doğru sebeple kırmızı olduğunu görmek şart (R-71).

## D-57 — Zarfın Zod şeması `packages/kernel`'de, `packages/contracts`'ta değil
2026-08-15 · FAZ-1.2'nin 💾 satırı `feat(contracts): …` diyordu, ama Zod bir ÇALIŞMA
ZAMANI bağımlılığıdır ve `packages/contracts` **hiçbir şey import etmez** (§3.1) —
`dependencies` boşluğu FAZ-1.1b'nin kabul kriteridir. İkisi aynı anda doğru olamaz.
**Karar:** derleme zamanı gerçeği (`RecordEnvelope`) contracts'ta kalır; çalışma zamanı
gerçeği (`RecordEnvelopeSchema`, Zod 4.4.3) `packages/kernel/src/schema/envelope.ts`'te
yaşar. Faz dosyasının 💾 satırı `feat(kernel)` olarak düzeltildi — sessizce sapılmadı.
**Ayrışma riski ve çözümü:** iki yerde duran bir gerçek ayrışır. Üç tip iddiası ayrışmayı
derleme hatasına çevirir: `TIP_SEMAYA_UYUYOR` (tip çakışması), `SEMADA_FAZLA_ALAN_YOK`,
`SEMADA_EKSIK_ALAN_YOK`. Üçü de kasten ihlal edilerek doğrulandı (A: zarfa alan ekle →
111. satır kırmızı · B: şemaya fazla alan → 110+111 · C: `confidence: z.string()` → 109).
**Kaldırılan dördüncü iddia:** `SchemaShape extends ContractShape` yazıldı ve **temiz
repoda bile kırmızı verdi** — şema düz `string` üretir, sözleşme markalı `RecordId` ister;
ters yön tasarım gereği asla doğru olamaz. Daima kırmızı bir kapı, daima yeşil bir kapı
kadar işe yaramaz: ilki kapatılır, ikincisi kandırır. Kaldırıldı, yerine iki yönlü
anahtar kümesi kontrolü kondu.
**`schemas` kapısı çalışma ağacını DEĞİŞTİRMEZ:** geçici dizine üretip commit'li hâliyle
karşılaştırır. Kendi kendini düzelten bir kapı, hiçbir zaman kırmızı olmayan kapıdır.

## D-58 — Kabuk kapıları `LC_ALL=C` ile başlar; Türkçe locale karakter sınıfını kırıyor
2026-08-15 · `fixtures` kapısının KVKK ihlal testi **kapıyı kaçırdı**: gerçek görünümlü
`ahmet.yilmaz@dokumsanayi.com.tr` adresi yeşil geçti. İlk teşhis yanlıştı (`pipefail` +
`grep -q` SIGPIPE tuzağı sanıldı, o da düzeltildi ama sebep o değildi).
**Gerçek sebep:** `LANG=tr_TR.UTF-8` altında POSIX karakter sınıfları Türkçe collation'a
göre çözülüyor ve `[A-Za-z]` aralığı `i`/`I` çevresinde kırılıyor:
```
$ LANG=tr_TR.UTF-8 grep -oE "[a-z.]+@[a-z.]+" <<< "ahmet.yilmaz@dokumsanayi.com.tr"
lmaz@dokumsanay        ← "yilmaz"ın başı ve "sanayi"nin sonu düştü
```
Desen eşleşiyormuş gibi görünür ama **yarım** eşleşir. Kapı hata vermez, yeşil raporlar.
**Karar:** kabuk tabanlı her kapı ve git kancası `export LC_ALL=C` ile başlar (17 betik).
Kural `R-77` olarak yazıldı ve `repo-hygiene` kapısı satırın varlığını denetliyor —
hatırlamaya bırakılmadı. **Kanıt:** bir kapıdan satır silindi → `repo-hygiene` kırmızı;
geri alındı → yeşil. E-posta ihlal testi düzeltmeden sonra rc=1 verdi.
**Neden bu kadar önemli:** `.mjs` kapıları etkilenmiyor (JS regex'i Unicode tabanlı), yani
sorun yalnız kabuk kapılarında ve **sessiz**. Bu, `'i'.toUpperCase()` → `I` hatasının
(R-21) kabuk seviyesindeki kardeşi; aynı kök, farklı katman.
**Yan bulgu:** `set -o pipefail` + `grep -q` de gerçek bir tuzak — `-q` ilk eşleşmede
çıkar, üstteki `grep` SIGPIPE alır, boru durumu 141 olur ve koşul sessizce yanlışlanır.
İki tuzak da aynı kapıda üst üste binmişti.

## D-59 — FAZ-1.10 bölündü: golden harness `1.10b`'ye alındı
2026-08-15 · FAZ-1.10'un 🛠 satırı dört şey sayıyordu: Vitest · **golden-file harness
(font sabitli Chromium)** · msw · cassette + fixture. Golden harness iki şeye bağlı:
Playwright/Chromium (FAZ-3.1'de kuruluyor) ve **marka fontu** (V-02 açık, FAZ-0.A.5 bloke).
Yer tutucu bir fontla golden metrik üretmek yalnız ertelenebilir değil, **yanlış** olurdu:
testin varlık sebebi Türkçe glyph fallback'ini yakalamak; sevk etmeyeceğimiz bir fontun
metriklerini dondurmak o amacı doğrudan çürütür.
**Karar:** 1.10 = Vitest + msw + cassette + fixture (✅ ve 🧪'nın tamamı bu üçünde).
Golden harness `1.10b` olarak ayrıldı, ön koşulu `FAZ-3.1` + `V-02`. LOOP§B'nin
"bitmiyorsa adım değil alt-fazdır, böl" kuralının uygulanışı.

## D-60 — `process.env`in tek sahibi `config/env.ts`; test altyapısı ayrı export yolunda
2026-08-15 · `chokepoints.json`'daki `secret-okuyucu` darboğazının sahibi henüz var olmayan
`config/secrets.ts` idi; kapı, cassette testindeki `process.env['UPDATE_CASSETTES']`i
yakaladı. **Kuralı gevşetmek (test dosyasını izinli listeye eklemek) reddedildi** — bu,
darboğazın kendisini delerdi. Yerine tek okuyucu gerçekten yazıldı: `packages/kernel/src/
config/env.ts`. Sahip sayısı hâlâ **bir**; yalnız var olmayan bir dosyadan gerçek bir
dosyaya taşındı. FAZ-3.4 bunun üstüne `secrets.ts` politikasını kurar.
**İkinci karar:** test altyapısı `@suite/kernel/testing` **ayrı export yolundan** açılır.
Ana girişten dışa açılsaydı `msw` üretim bağımlılık grafiğine girerdi; test aracı üretim
grafiğine girdiği gün "bir ay ihmal edilse de çalışır" (ilke 12) zayıflar.

## D-61 — SQLite handle Ring 0'da (`kernel/src/db.ts`), Ring 2'de değil
2026-08-15 · `chokepoints.json` `sqlite-handle` darboğazının sahibi `packages/corpus/src/
db.ts` idi. FAZ-1.8'de iş kuyruğu yazılırken çelişki ortaya çıktı: kuyruk kernel'in işidir
(§3.7) ve **kernel `packages/corpus`'u import edemez** (§3.6). İki çıkış vardı ve ikisi de
kabul edilemezdi: kuyruk ikinci bir bağlantı açacaktı (iki WAL ayarı, aynı dosyanın iki
farklı dayanıklılık garantisiyle yazılması) ya da halka yasası çiğnenecekti.
**Karar:** handle `packages/kernel/src/db.ts`'e taşındı. Sahip sayısı hâlâ **bir**;
corpus onu import eder (corpus → kernel yasaldır). FTS5 şeması corpus'un işi kalır,
bağlantı kernel'in. **Gevşetme değil, doğru halkaya yerleştirme.**

## D-62 — `better-sqlite3` korundu; Türkçe arama tezi deneysel olarak doğrulandı
2026-08-15 · Node 22'nin yerleşik `node:sqlite`'ı FTS5'i, `unicode61 remove_diacritics 2`
ve `trigram` tokenizer'larını **bağımlılıksız** destekliyor (denendi, çalışıyor).
R-75 ("40 satır bir bağımlılıktan iyidir") bunu cazip yapıyordu.
**Yine de D-27 korundu:** `node:sqlite` Node 22'de deneysel (`--experimental-sqlite`
bayrağı gerekiyor ve API "her an değişebilir" uyarısı veriyor). `better-sqlite3@13.0.3`
linux-x64 **prebuild** ile kuruldu — yerel derleme gerekmedi, yani "native modül
kırılganlığı" itirazının bu makinede karşılığı yok.
**Yan kazanç — §5.6'nın tezi ölçüldü:** aynı veri iki tokenizer'a verildi.
| Sorgu | `unicode61 remove_diacritics 2` | `trigram` |
|---|---|---|
| `olcumlerinizi` (tam kelime, aksansız) | **bulur** | — |
| `olcum` (kök, ek düşmüş) | **bulamaz** | — |
| `ölçüm` (kelime içi) | — | **bulur** |
Yani Türkçe'nin eklemeli yapısı tek indeksle çözülmüyor: aksan katlama tam kelimeyi
kurtarıyor ama kökü bulmuyor. **Paralel trigram + RRF kararı artık varsayım değil, ölçüm.**

## D-63 — Bağlam anlık görüntüsü 90 gün, manifest sonsuza (V-11 kapandı)
2026-08-15 · V-11 "N ilk yüz çalıştırmadan önce belirlenir" diyordu; FAZ-1.9 o an.
**Karar:** `RunManifest.contextRetentionDays = 90`. Manifest (metadata: marka, dönem,
commit SHA'sı, adımlar, maliyet, kararlar, aday sağlayıcılar) **süresiz** saklanır;
**bağlam anlık görüntüsü** (enjekte edilen tam prompt metni) 90 gün sonra silinebilir.
**Neden 90:** üç gerekçe üst üste biniyor.
1. **Kurtarılabilirlik.** Manifest `corpusCommit` taşıyor; bağlam o ağaçtan tarif
   yeniden çalıştırılarak ÜRETİLEBİLİR. Anlık görüntü bir kolaylıktır, tek kaynak değil —
   yani silinmesi kanıt kaybı değil, kolaylık kaybı.
2. **Hata ayıklama penceresi.** "Bu çalıştırma neden böyle çıktı" sorusu pratikte bir
   çeyrek yaşıyor; ötesinde cevap zaten "ağaç değişti" ve onu commit SHA'sı söylüyor.
3. **KVKK.** `INGEST` çektiği prospect metni bağlama girer (§14). Kazınmış kişisel veriyi
   süresiz saklamak, silme talebini teknik olarak karşılanamaz kılar — sınırsız saklama
   burada yalnız maliyet değil, yükümlülüktür.
**Alternatif (reddedildi):** "sonsuza sakla, disk ucuz". Disk ucuz ama sorumluluk değil;
ayrıca 100 çalıştırma/ay × ~30 KB, üç yılda grep'lenemeyecek bir yığın yapar.
**Geri alma maliyeti:** düşük — alan manifest'te, değeri değiştirmek tek satır. Ama
silinen bağlam geri gelmez, o yüzden temizlik işi FAZ-8.4'te `doctor` raporuyla gelir
ve **rapor eder, silmez**; silme insan onayıyla.

## D-64 — Kernel saflığının üç katmanı ölçüldü; her biri farklı şeyi yakalıyor
2026-08-15 · FAZ-0.C.3 "üç katman" diyordu ama hangisinin neyi yakaladığı yazılı değildi.
Tek bir ihlal dört mekanizmadan geçirildi ve sınırlar **ölçüldü**:

| İhlal biçimi | grep `\.attributes` | ESLint | `tsc` | Proxy tuzağı |
|---|---|---|---|---|
| `rec.attributes.foo` | yakalar | yakalar | **yakalar** | yakalar |
| `const { attributes } = rec` | **kaçırır** | **yakalar** | kaçırır | yakalar |
| `rec['attri'+'butes']` | **kaçırır** | **kaçırır** | **kaçırır** | **yakalar** |

§3.2'nin "grep destructuring ile atlatılır, Proxy atlatılmaz" cümlesi doğrulandı ve
aradaki boşluğun ESLint `no-restricted-syntax` ile kapandığı gösterildi.
**Tuzağın kendisi `panic()` kullanır** — `throw` eden tek yer orası (§8.6). `chokepoints`
kapısı testte elle yazılmış bir `throw`u haklı olarak reddetti; kural doğruydu, ilk
yazdığım tuzak yanlıştı. Semantik olarak da doğrusu bu: kernel'in `attributes` okuması
bir kullanıcı hatası değil, bir **değişmez ihlalidir**.

**İki tuzak hatası ve dersleri:**
1. Tuzak önce yalnız `{ record: … }` biçimiyle deneniyordu; `input['attributes']` okuyan
   bir ihlal hiç tetiklemiyordu — **tuzak yeşil raporluyordu** (R-71). Artık dört biçim
   deneniyor: çıplak kayıt, `{record}`, `{records:[]}`, iç içe payload.
2. Hata mesajı `Object.keys(girdi)` çağırıyordu ve tuzağı **testin kendisi** patlatıyordu;
   temiz kodda bile kırmızıydı. Etiketler artık girdiden türetilmiyor.

**Çalışma biçimi dersi:** bu turda iki kez, biçimlendirici satırı çok satıra bölünce
`str.replace` tabanlı düzenlemem **sessizce hiçbir şey yapmadı** ve testi haftalarca
yanlış çalıştırabilirdi. Desen eşleşmesi artık `assert` ile doğrulanıyor — eşleşmeyen
düzenleme hata verir, sessizce geçmez. R-70'in kabuk tuzağının editör seviyesindeki hâli.

## D-65 — `durum` kapısı: döngünün sözleşmesi sessizce bayatlayamaz
2026-08-15 · FAZ-1.11 turunda art arda birkaç metin düzenlemesi **sessizce boşa gitti**
(biçimlendirici satırı çok satıra bölünce `str.replace` deseni eşleşmedi) ve `DURUM.md`
altı adım geride kaldı: `siradaki_adim` bitmiş bir adımı gösteriyordu ve "Sıradaki adım"
bölümü iki farklı turun metnini üst üste taşıyordu. **On altı kapının hiçbiri görmedi.**
**Neden ciddi:** `DURUM.md` LOOP§E'de döngünün sözleşmesi olarak tanımlı — bağlamı
sıfırlanmış bir agent "şimdi ne yapmalıyım" sorusunu YALNIZ oradan cevaplıyor. Bayat bir
`siradaki_adim`, o agent'ı bitmiş bir işe yönlendirir; iyi ihtimalle tur boşa gider, kötü
ihtimalle iş ikinci kez yapılır ve tikler çakışır.
**Karar:** `scripts/gates/durum.mjs`. Dört kontrol: (1) `siradaki_adim` gerçekten var mı,
(2) ZATEN TİKLİ mi, (3) `bloke[]` gerçek adımlar mı, (4) "Tamamlananlar" tablosundaki her
satır faz dosyasında tikli mi (D-46'nın mekanik hâli). Üçü de kasten ihlal edilip kırmızı
görüldü.
**İkinci ders (araç disiplini):** desen tabanlı düzenlemelerde eşleşme artık `assert` ile
doğrulanıyor. Ama aynı turda `assert` patlarken sonraki komut yine de koştu ve **kısmi
durum commit'lendi** — R-70'in kabuk tuzağının üçüncü yüzü. Düzenleme ile commit aynı
kabuk çağrısında zincirlenmemeli; `just save` ayrı çağrıdır ve doğrulama ondan önce gelir.

## D-66 — YAML ayrıştırıcı Ring 0'da; corpus ve registry aynı ayrıştırıcıyı kullanır
2026-08-15 · FAZ-1.13'te `packages/registry` pipeline YAML'ı okumak istedi ve
`frontmatter-ayristirici` darboğazına çarptı: `yaml` import'una izin verilen tek dosya
`packages/corpus/src/frontmatter.ts` idi. Çıkışlar kapalıydı — corpus ile registry
**kardeş halkadır** ve birbirini import edemez (§3.6).
**Karar:** ayrıştırıcı `packages/kernel/src/yaml.ts`'e taşındı; ikisi de oradan okuyor.
`yaml` bağımlılığı corpus'tan kaldırılıp kernel'e alındı. Sahip sayısı hâlâ **bir**.
**Neden sadece "aynı kütüphaneyi kullanalım" yetmez:** seçenekler de sabitlendi.
Aynı kütüphanenin farklı seçeneklerle çağrılması da iki ayrıştırıcıdır — biri `1.20`
sürüm numarasını sayı, diğeri dize okur ve fark aylar sonra, bambaşka bir yerde çıkar.
**D-61 ile aynı örüntü:** halka yasası bir kaynağın hangi katmanda yaşayacağını
belirliyor. SQLite handle da, YAML ayrıştırıcı da bu yüzden Ring 0'da.

## D-67 — `dist/` okuyan kapı kendi derlemesini yapar; kapı sırasına güvenilmez
2026-08-15 · Bağımsız doğrulama agent'ı FAZ-1.2'nin ihlal testinin **gerçekte çalışmadığını**
buldu: Zod şemasında tip-nötr bir değişiklik (`z.string().min(1)` → `.min(3)`) yapılıp
`schemas/` üretilmeden **tam `just check`'ten 17/17 yeşil** geçiyordu.
**Sebep:** `schemas.sh` şemaları `packages/kernel/dist/index.js`'ten üretiyordu ve
`run-gates.sh` `.sh` kapılarını ALFABETİK koşturuyor — `schemas` (s), dist'i yeniden
derleyen `types`'tan (t) ÖNCE. Kapı bayat çıktı üstünde çalışıyor, farkı görmüyordu.
Aynı delik `.githooks/pre-commit`'te de vardı. Kapının kendi başlığındaki "commit'li şema
sessizce YALAN söyler" senaryosu tam olarak mümkündü.
**Karar:** `scripts/ensure-build.sh` — `dist/` okuyan HER kapı (`schemas`, `verbs`,
`projection`) onu ilk iş çağırır. `tsc -b` artımlıdır; ikinci çağrının bedeli yok.
**İlke:** **bir kapının doğruluğu BAŞKA bir kapının çalışma sırasına bağlı olamaz.**
Sıra bir gün değişir — dosya adı değişir, kapı eklenir — ve o gün koruma sessizce kalkar.
D-55'te aynı sebeple `import-x/no-restricted-paths` reddedilmişti: çözümleme gerektiren
bir kural çözemediğinde susar. Bu onun sıralama biçimindeki hâli.
**Kanıt:** aynı Zod değişikliği düzeltmeden sonra `just gate schemas` rc=1 verdi ve
diff'i gösterdi; geri alınca yeşile döndü.

## D-68 — `derived/runs` koruması dizin doğana kadar boştaydı
2026-08-15 · Doğrulama agent'ı `repo-hygiene`'in D-38 korumasının **ateşlemediğini** buldu:
`.gitignore`'a `derived/runs/` eklendiğinde kapı YEŞİL kaldı.
**İki ayrı sebep üst üste binmişti:**
1. `git check-ignore`, VAR OLMAYAN bir yol için daima "eşleşmedi" der — `derived/runs/`
   deseni sondaki eğik çizgi yüzünden yalnız dizinlerle eşleşir ve git, olmayan bir yolun
   dizin olduğunu bilemez. Dizin repoda hiç yoktu.
2. `git check-ignore` İZLENEN bir dosyayı da "ignore değil" sayar. Yani dizin yaratılıp
   `.gitkeep` commit'lense bile, sonradan eklenen bir desen kapıdan geçerdi.
**Karar:** `derived/runs/.gitkeep` commit'lendi (dizin artık git'te var) ve kapı üç şeyi
birden denetliyor: dizin var mı · deseni `--no-index` ile ignore'lu mu · `.gitkeep`
izleniyor mu. **Kanıt:** üç vaka da kırmızı verdi; temizde yeşil.
**Ders:** "kapı zaten doğruluyor" cümlesi bir faz adımında yazılıydı ve **yanlıştı**.
Kapıyı yazmak yetmiyor; kasten ihlal edip kırmızıya döndüğünü GÖRMEK gerekiyor (R-71) —
ve bu ihlal testi FAZ-1.6'da atlanmıştı.

## D-69 — Fiil çıktı sözleşmesi `runVerb` ile zorlanıyor; `CostEvent` kriteri netleşti
2026-08-15 · FAZ-1.11'in ✅ satırı "her metered fiil ≥1 `CostEvent` döndürüyor" diyordu.
Agent iki şeyi buldu: (a) hiçbir fiil `CostEvent` döndürmüyor — gövdeler iskelet,
(b) sözleşmeyi zorlayacak `validateVerbOutput()` **hiçbir yerden çağrılmıyor**, docstring'i
"motor bunu her çağrıdan sonra çalıştırır" dediği hâlde. Zorlaması olmayan bir sözleşme,
sözleşme değil temennidir.
**Karar iki parçalı:**
1. **Zorlama BUGÜN bağlandı:** `packages/engine/src/run-verb.ts` fiili çağırıp çıktıyı
   `validateVerbOutput` ile denetliyor. Metered fiil sıfır `CostEvent` döndürürse çağrı
   `VERB_OUTPUT_CONTRACT_VIOLATION` ile BAŞARISIZ. Sahte fiillerle beş test: sıfır maliyet
   reddediliyor, metered olmayan fiilin maliyet döndürmesi de reddediliyor.
2. **Kriter netleşti:** "her metered fiil ≥1 `CostEvent` döndürüyor" ifadesi iskelet
   fiillerle karşılanamaz; gerçek gövdeler FAZ-3.7'de doğuyor. FAZ-1.11'in ✅'si
   **sözleşmenin zorlandığını** ölçer; gövdelerin gerçekten maliyet bildirmesi FAZ-3.7'nin
   kabul kriteridir. Sessiz sapma değil, açık düzeltme (R-74).

## D-70 — Darboğaz kapısı sahip dosyasının VARLIĞINI denetlemiyordu
2026-08-15 · `chokepoints.json` "tek yetkili yer" olarak var olmayan dosyaları
gösterebiliyordu ve kapı bunu hiç sorgulamıyordu. Sekiz darboğazın sahibi yoktu; üçü
**tikli fazlara** aitti: `logger` → `kernel/src/log.ts` (FAZ-1.7), `yol-cozucu` →
`kernel/src/paths.ts` (FAZ-1.7), `plan-dondurucu` → `engine/src/plan/freeze.ts` (FAZ-1.13).
"20 mekanik zorlanıyor" sayısı şişikti: desen vardı, sahip yoktu.
**Karar:** kapı artık her `izinli` yol için sorar — darboğazın `faz`ı TİKLİYSE dosya var
olmak zorunda; gelecek fazlara ait beyanlar meşrudur ve AYRI sayılır
(`20 mekanik · 4 beyan · 6 sahibi gelecek fazda`).
**Üç boşluk kapatıldı:** `log.ts` (NDJSON, İngilizce şemalı olay adları, hassas anahtar
redaksiyonu, saati ÇAĞIRAN verir) ve `paths.ts` (2026-08-14'te 44 dosyayı yanlış dizine
yazan `new URL(...).pathname` hatasının tek doğru karşılığı) yazıldı; `plan-dondurucu`
**FAZ-4.6'ya taşındı** — plan dondurma onay akışının parçası (R-07), `just plan`ın değil.

## D-71 — `spawn.ts` çıktı sınırı parça içinde uygulanmıyordu
2026-08-15 · FAZ-1.12'nin ✅'si "iptal 5 sn içinde alt süreçleri temizliyor" diyordu ama
`packages/kernel/src/proc/spawn.ts` **sıfır testliydi** — kriterin karşılığı yoktu.
Testler yazılınca gerçek bir hata çıktı: `maxOutputBytes` yalnız parça BAŞINDA
denetleniyordu; 50 KB'lık tek bir chunk geldiğinde `stdout.length` hâlâ 0 olduğu için
tamamı yazılıyor ve `truncated` hiç işaretlenmiyordu. Tek parça hâlinde gelen büyük çıktı
bu sistemde tipiktir (ffmpeg log'u, model yanıtı), istisnai değil.
**Düzeltme:** sınır parça içinde de uygulanıyor, kırpma açıkça bildiriliyor.
**On üç test:** çıkış kodu · olmayan komut · stdin · **ortam devralınmıyor** · iptal
(<5 sn ölçüldü) · zaten iptalli sinyal · zaman aşımı · **SIGTERM'i yutan süreç SIGKILL
ile ölüyor** · çıktı sınırı · `commandExists` üç vaka.
**Ders:** kabul kriteri yazılıp testi yazılmayınca kriter bir temenniye dönüşüyor —
ve altındaki kod gerçekten bozuk olabiliyor.

## D-72 — Karar defteri ikiye ayrıldı: aktif + `docs/kararlar/ARSIV-2026.md`
2026-08-15 · `KARARLAR.md` 608 satıra çıktı ve `docs-size` tavanını (600, R-63) aştı.
Tavan keyfî değil: agent'ın her turda okuduğu bir dosya şişerse bağlam yanar ve kimse
okumaz — şişmiş bir defter, olmayan bir defterden kötüdür çünkü okunmadığı hâlde
okunmuş sayılır.
**Karar:** planlama döneminin kapanmış kararları (D-1…D-42, hepsi FAZ 0 ve FAZ 1 boyunca
uygulandı) `docs/kararlar/ARSIV-2026.md`'ye devredildi. Aktif defterde döngü sırasında
alınan kararlar (D-43+) ve tüm açık `V-nn` borçları kaldı. **448 + 176 satır.**
**Arşiv iptal DEĞİLDİR:** oradaki kararlar hâlâ bağlayıcı. Bir kararı geçersiz kılmak
için aktif defterde yeni bir `D-nn` yazılır ve eskisi `**Durum:** reddedildi` alır.
**`citations` kapısı iki dosyayı da çözüyor** ve **çift kaydı reddediyor**: aynı `D-nn`
ikisinde birden bulunursa hangisinin geçerli olduğu belirsizleşir ve arşivlenmiş bir
karar aktif sanılabilir. Reddedilme taraması da her iki dosyayı kapsıyor.

## D-73 — `unsealAttributes` dört belgede vardı, kodda yoktu
2026-08-15 · `packages/contracts/src/envelope.ts`, `docs/ANAYASA.md`, `.claude/rules/kernel.md`
ve `docs/fazlar/FAZ-3.md` `packages/registry/src/attributes.ts#unsealAttributes`'ı
"`attributes`ı açmanın TEK yasal yolu" diye gösteriyordu. **Ne dosya vardı ne darboğaz**
(`grep attributes chokepoints.json` → boş). Yani `OpaqueAttributes` markası bir engel
koyuyordu ama meşru geçiş kapısı hiç yapılmamıştı.
**Karar:** dosya yazıldı ve `attributes-acici` darboğazı eklendi. Açılan attributes
`Object.freeze` ile donduruluyor: okunur, üzerine yazılmaz — yazma tek noktadan
(`corpus/write.ts`) geçer ve oradan geçmeyen değişiklik onay kuyruğunu atlar (§5.4).
**Desen daraltıldı:** ilk yazdığım `as unknown as Record<string, unknown>` masum şema
cast'lerini de yakalıyordu. Aranan şey `attributes`ın markasını sıyırmak; desen ona özgü.
Meşru bir kullanımı yasaklamak, kapıyı gürültüyle kapatılan bir kapı yapar.

## D-74 — `just plan` manşetinde sayı iddia etmiyor
2026-08-15 · FAZ-1.13'ün metni "sağlayıcısı seçilmemiş metered adım için `$0.00` YAZILMAZ"
diyordu; çıktı ise başlıkta `maliyet aralığı: $0.0000 – $0.0000` yazıp uyarıyı ALTINA
koyuyordu. Başlıktaki sayı tam olarak yasaklanan iddiaydı ve göz önce onu okur.
**Karar:** fiyatlanamayan bir tahmin bir sayı değil, bir BOŞLUKTUR. Manşet artık
`FİYATLANAMADI — N ücretli adımın sağlayıcısı seçilmedi` diyor; fiyatlanan kısım varsa
ayrı satırda ve **ALT SINIR** etiketiyle. Manşetin `$0.00` taşımadığını doğrulayan test
eklendi — kural artık metinde değil, testte.

## D-75 — `just reindex` corpus yokken sessizce başarılı dönüyordu
2026-08-15 · `corpus/` hiç yokken `just reindex` "0 kayıt indekslendi" deyip **EXIT=0**
dönüyordu. `walk()` içindeki `catch { return out }` okuma hatasını kökte de yutuyordu.
FAZ-1.6'nın kendi ilkesi "sessiz atlama, aranamayan kayıt demektir" — kök dizin
seviyesinde tam olarak bu oluyordu.
**Karar:** `reindexChecked()` kök dizinin varlığını denetliyor ve yoksa `Result` döndürüyor;
`scripts/reindex.mjs` EXIT=1 ile açık mesaj basıyor. **Alt dizinlerde yutmak meşru kalıyor**
(izin sorunu tek bir dosyayı atlar ve rapor edilir), kökte değil — kök yoksa HİÇBİR şey
indekslenmez ve arama boş dönünce sebebi aranmaz.

## D-76 — Zorlanamayan kabul kriterleri gerçeğe uyduruldu
2026-08-15 · Doğrulama agent'ı üç kriterin **yazıldığı gibi zorlanamadığını** buldu.
Kriteri olduğu gibi bırakıp "karşılandı" saymak kanıtsız tikleme olurdu (R-70); metni
gerçeğe uydurmak ise sessiz sapma (R-74). Doğrusu: **açıkça düzeltmek.**
1. **FAZ-1.9** — "manifest'siz çıktı üretmeyi dene → hata": bugün bir üretim/yayın yolu
   YOK, dolayısıyla `inspectManifest()` yalnız saf fonksiyon olarak sınanabiliyor.
   Üretim yolundaki zorlama **FAZ-3.13**'e bağlandı ve kriter bunu söylüyor.
2. **FAZ-1.10** — "fixture'da gerçek prospect adı ara → yok": bir İSİM düz metindir,
   desenle ayırt edilemez. Zorlanabilir olan (example.com dışı e-posta, TR telefon,
   TCKN/VKN biçimi, `synthetic: true` işareti) zaten denetleniyor ve kriter artık onu
   söylüyor; ad disiplini `SENTETİK` ön ekiyle konvansiyon olarak sürüyor.
3. **`just golden`** — no-op'tu ve "`just verify` yeşil" kriterini zayıf okutuyordu.
   Artık açıkça "hiçbir şey KANITLAMAZ, FAZ-1.10b/V-02'ye bağlı" diyor. Sessiz bir
   `echo` yerine dürüst bir uyarı: yeşil bir çıktının ne kanıtladığı yazılı olmalı.

## D-77 — `attributes` darboğazı özelliğe DOKUNMAYI arıyor, cast'i değil
2026-08-15 · İkinci doğrulama agent'ı deseni **iki satıra bölerek** atlattı:
`const ham = r.attributes` + `const acik = ham as unknown as Record<string, unknown>`
üç kapıdan da (chokepoints, tsc, lint) geçti. Dar desen (`\.attributes\s+as\s+unknown`)
tek satırlık biçimi arıyordu; R-01 "değişmez yasa" listesinde ve zorlanmayan bir yasa
yasa değildir.
**Düzeltme:** desen `\.attributes\b|\bas\s+unknown\s+as\b` oldu — özelliğe dokunmak
zaten ihlal; değeri önce değişkene almak ilk satırda yakalanıyor. Kapıya `kapsam_haric`
alanı eklendi (`izinli`den farklıdır: "tek yetkili yer" değil, "kural burada anlamsız").
Test dosyaları muaf — üretim yoluna import edilmezler.
**Reddedilen alternatif:** ESLint AST kuralı (`TSAsExpression > TSUnknownKeyword`).
Daha güçlü olurdu ama `eslint.config.js` yapılandırma-koruma kancasıyla kilitli ve
kancayı kapatmak, kapıyı kapatmayı öğrenmektir.
**Dürüst sınır:** `const ara: unknown = r.attributes` biçiminde cast HİÇ yoktur —
regex bunu yalnız ilk satırdan yakalar. Genel çözüm regex değil, **Proxy tuzağıdır**
(`purity.test.ts`): çalışma zamanında özelliğe erişen her yol, değeri nasıl elde
ettiğinden bağımsız olarak patlar.

## D-78 — `just reindex` corpus kökü ve db yolu argümanı alıyor
2026-08-15 · D-75 `reindex`i corpus yokken EXIT=1'e çevirdi — doğru karar, ama
**FAZ-1.6'nın kabul komutunu kırdı**: tikli bir adımın ✅'si EXIT=1 veriyordu ve
`corpus/` FAZ-2.9'a kadar doğmuyor. Kriteri gevşetmek (R-70) ya da `reindex`i corpus
yokken yeşil döndürmek (D-75'i geri almak) iki yanlış seçenekti.
**Düzeltme:** `just reindex <kök> <db>` — varsayılanlar aynı, argümanlar isteğe bağlı.
Kabul komutu artık sentetik fixture corpus'una karşı **aynı kod yolunu** koşuyor:
`2 kayıt indekslendi · ~30 ms` + bozuk dosya `id_yok` diye raporlanıyor. D-75'in
koruması argümansız çağrıda aynen duruyor.

## D-79 — Doğrulama agent'ı turu **en fazla iki**
2026-08-15 · Kullanıcı müdahalesi ve haklı: *"sorun bul denince sorun olmayan şeyi bile
sorun gibi getirebilir, çünkü sorun bulmak için bakıyor zaten — 3 tur değil 30 tur bile
olabilir, bu asla bitmez."*
Somut kanıt bu projeden: 1. tur 9 bulgu, 2. tur 3 yeni blokaj + 4 ikincil. Her tur
kapanınca bir sonraki tur **yeni bir yüzey** buluyor; yakınsama yok çünkü agent'ın
görevi yakınsamak değil, bulmak.
**Kural:** bir faz en fazla **iki** doğrulama turu görür. İkinci tur kapandıktan sonra
faz KAPANIR. İkinci turda bulunmayan şey tanımı gereği **minor**'dur ve FAZ 9'un denetim
turlarına düşer — orada zaten sürekli aranıyor (9.2 kural uyumu, 9.5 ölü kod).
**Reddedilen alternatif:** "temiz rapor gelene kadar tur" — LOOP§D'nin ilk hâli buydu ve
sonsuz döngüydü; bir fazın kapanması agent'ın yorulmasına bağlı olamaz.
**Geri alma maliyeti:** sıfır — tavan tek satır, gerekirse artırılır.

## D-80 — V-01 kapandı: Remotion lisansı D-25'i teyit etti
2026-08-15 · Birincil kaynak: `LICENSE.md` "a for-profit organization with **up to 3
employees**" ve `remotion.dev/docs/license/pricing`. UPCYTECH 6 kişi → bedava lisansa
uygun değil.
Fiyat katmanı **koltuk değil**: pipeline'lar programatik ve toplu render ediyor
(FAZ-5.7/5.8/5.9), bu tanım gereği *Remotion for Automators* — "$0.01 per render,
**$100/mo minimum**". Yani hiç render etmesen de yılda **$1.200**.
HyperFrames Apache 2.0 ve aynı motoru (headless Chrome + FFmpeg) kullanıyor; R-30
korunuyor. Yıllık $1.200'lük yükümlülük, aynı yasayı koruyan bedava alternatif varken
alınmaz. Yedek (Revideo, MIT) belgeli hâliyle duruyor. 🔴 kalktı.

## D-81 — Keşif `just plan` altında değil, kendi komutunda
2026-08-15 · FAZ-2.7'nin ✅'si `just plan discovery` diyordu. Uygulanamaz: `just plan`
argümanını `registry/pipelines/<id>.pipeline.yaml` olarak çözüyor ve keşif bir pipeline
DEĞİL — marka DNA'sının yeniden üretimi.
**Karar:** `just discovery [merge|mirror]`. Kriter gerçeğe uyduruldu (D-76 deseni).
**Neden ayrı komut:** keşfi pipeline listesine sokmak `just plan` çıktısının anlamını
ikiye bölerdi — biri maliyet tahmini olan bir üretim planı, diğeri corpus farkı olan bir
öneri listesi. Aynı kelime iki şeye işaret ederse ikisi de güvenilmez olur (§3.9 kanonik adlar
mantığı).
**Ayrıca:** aday listesi yokken çıktı "0 op" demiyor, **aday listesi YOK** diyor. Boş bir
plan ile değişmemiş bir corpus aynı şey değildir; ikisini karıştırmak hiç koşmamış bir
motoru çalışıyor sanmaktır (D-75'in aynı hatası).

## D-82 — Kuruluş tarihi: sicil belgesi tek doğru (V-08 kapandı)
2026-08-15 · Üç tarih çatışıyordu: ticaret sicili **3 Tem 2025** · LinkedIn **2022** ·
upcymarket.com **"2021'den beri"**.
**Karar:** sicil tarihi tek doğrudur. Gerekçe basit ve tartışılmaz: **yalnız o belgeli**.
Diğer ikisi beyandır ve beyan, kayıtla çelişince kaybeder.
**Sonuç iki iş doğuruyor** (ikisi de insan işi, FAZ-7 kanal adaptörlerinden ÖNCE):
LinkedIn şirket sayfasındaki kuruluş yılı ve upcymarket.com'daki "2021'den beri"
ifadesi düzeltilecek. Düzeltilmezse ilk prospect doğrulamasında sistem yalancı çıkar —
ve bu, üretilen her içeriğin güvenilirliğini birlikte götürür.
**Not:** "2021/2022" beyanları muhtemelen kurucunun çalışmaya başladığı tarihi
anlatıyor; o iddia meşrudur ama **şirket kuruluşu** diye sunulamaz. Gerekirse
"2021'den beri bu alanda çalışıyoruz, 2025'te şirketleştik" biçiminde ayrıştırılır.

## D-83 — İlk keşif kayıtları DRAFT kalıyor, onay insanın
2026-08-15 · FAZ-2.9'un ✅'si "her varlık tipinde en az bir `status: active` kayıt"
diyordu. Yedi kayıt `propose()` üzerinden yazıldı ve **draft** indi.
**Onları `active` yapmak agent'ın işi DEĞİL** (R-14, D-31, CLAUDE.md yasa 2): agent
kendi önerisini onaylayabilseydi "agent önerir, insan uygular" bir konvansiyona dönerdi.
Kullanıcının "tam yetki" talimatı geliştirme kararlarını kapsıyor; **şirketin ne olduğu
beyanını kapsamıyor** — o beyan kullanıcının kendi sözü.
**Karar:** adım `2.9` BLOKE, engel: insan onayı. `just onayla <yol…>` komutu yazıldı;
kullanıcı yedi kaydı okuyup onaylayınca adım kapanır ve FAZ 2 kapanabilir.
**Bu, "durmak yok" kuralının ihlali değildir** (LOOP§G): bloke adım işaretlenir, döngü
sonraki bağımsız adıma geçer.
