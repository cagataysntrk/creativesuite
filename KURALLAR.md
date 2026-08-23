# KURALLAR

Zorlanabilir kural kitabı. **Zorlaması olmayan kural buraya yazılmaz** — uygulanmayan
111 kural, uygulanan 20 kuraldan kötüdür. `Durum`: **aktif** = kapı bugün çalışıyor ve
kasten ihlal edilerek denendi. **FAZ-N** = o adımda gelecek. Külliyat:
`docs/research/5-kural-kitabi--*`.

---

## Mimari

### R-01 · kernel-attributes-okumaz · BLOCKING · FAZ-0.C.3
`packages/kernel/` altındaki hiçbir dosya `record.attributes` okuyamaz, destructure
edemez, alias'layamaz.
**Neden:** bir fiilde `attributes.platform` okumak, sabit kernel'i bugünkü kayıt tipine
kaynak yapar; bir ay sonra Ring 1 kernel'e dokunmadan düzenlenemez.
**Zorlama:** üç katman — `OpaqueAttributes` markası (derleme hatası) · ESLint
`no-restricted-syntax` · `rg` grep + **Proxy tuzağı** (grep destructuring ile atlatılır,
Proxy atlatılmaz).

### R-02 · dokuz-fiil · BLOCKING · FAZ-0.C.11
Kernel tam olarak dokuz fiil dışa açar. Onuncusu aynı commit'te bir `D-nn` gerektirir.
**Neden:** her fiil zamanlama, maliyet, retry, replay ve UI yüzeyi çarpanı.
**Zorlama:** `packages/kernel/verbs.json` sabit liste; sapma iki yönde de hata.

### R-03 · halka-yonu · BLOCKING · FAZ-0.C.2
Paketler yalnız aşağı doğru import eder. Yukarı import, döngü, `exports` dışına derin
import ve paket kökünden kaçan göreli yol yasak.
**Zorlama:** ESLint `import-x/no-restricted-paths` + `depcruise` (modül **ve** klasör
kapsamında döngü) + TS project references — üçü birden.

### R-04 · tek-yan-etki · BLOCKING · FAZ-1.11
Her fiil tek yan etki sınıfına sahiptir. Yalnız `GENERATE` model çağırır, yalnız `RENDER`
Chromium'a dokunur, yalnız `PROPOSE` çalışma ağacına yazar, yalnız `PUBLISH` kanal
çağırır, yalnız `INGEST` dış kaynak çeker.
**Neden:** `RENDER` sessizce LLM çağırabilseydi, çalıştırma öncesi gösterdiğimiz maliyet
tahmini yalan olurdu.
**Zorlama:** dependency-cruiser + `VerbTable` tipi; `fiil-haritasi` kapısı **iki soru**
sorar: gövde haritada bağlı mı, o fiili çağıran bir HAT var mı. `INGEST` (D-216) ve
`PUBLISH` (D-222) aynı hatayı iki fazda tekrarladı — modül ve test vardı, üretim yolu
yoktu. "Çağıran var mı" ZİNCİR için sorulur.

### R-05 · tek-nokta · BLOCKING · FAZ-0.C.8
`chokepoints.json`'daki her yetenek için repoda **tam olarak bir** uygulama olur:
corpus yazıcı · git çağıran · retrieval yüklemi · maliyet defteri · secret okuyucu ·
SQLite handle · Chromium başlatan · alt süreç · HTTP istemcisi · saat · RNG · id üreteci.
**Neden:** iki saat replay'i bozar, iki HTTP istemcisi çevrimdışı modu yalan yapar,
iki ayrıştırıcı bir dosyayı indekste geçerli, pipeline'da geçersiz yapar.
**Zorlama:** `chokepoints.json` lint yapılandırmasını **üretir** — satır eklemek
zorlamayı otomatik getirir.

### R-06 · determinizm · BLOCKING · FAZ-1.11
Zaman yalnız `kernel/src/time/clock.ts`, rastgelelik yalnız seed'li `rng.ts`, id yalnız
`ids.ts`. `Date`, `Math.random`, `crypto.randomUUID` fiil gövdelerinde yasak.
**Neden:** duvar saati okuyan bir fiil replay'i imkânsız kılar; "geçen ayki deck'i
yeniden üret" sessizce farklı çıktı verir.
**Zorlama:** ESLint `no-restricted-globals` + `no-restricted-properties`, üç kutsanmış
dosya hariç.

### R-07 · plan-dondurulur · BLOCKING · FAZ-1.9
Plan onaya giderken donar: corpus commit'i, registry commit'i, adım DAG'ı, çözülmüş
sağlayıcı + model + descriptor hash'i, tüm parametreler, seed, seçilen kayıt id'leri.
**Neden:** geç çözüm, insanın 40 TL'ye onayladığı çalıştırmanın farklı ve pahalı bir
modelle koşmasına yol açar.
**Zorlama:** `FrozenPlan` katı Zod şeması; `VerbContext` registry loader'ı **açmaz**.

---

## Marka ve corpus

### R-10 · marka-ekseni · BLOCKING · FAZ-2.2
Her kayıt `brand_id` taşır; retrieval yükleminin **ilk** koşuludur. `(brand_id, era_id)`
çalıştırma parametresidir, dosyadan okunan global durum değil.
**Neden:** tek satırlık `brand/current` ile ya markalar aynı anda yaşayamaz ya birbirine
sızar. → D-39

### R-11 · donem-damgasi · BLOCKING · FAZ-3.13
Her varlık üretim anında `brand_id` + `era_id` + `definition_digest` +
`context_manifest` damgası alır.
**Neden:** sonradan retrofit **imkânsız** — eşleşme kaybolur. Tasarımdaki en pahalı hata
ve ilk gün önlemesi bedava.

### R-12 · emeklilik-silme-degil · BLOCKING · FAZ-2.1
Kayıt silinmez: `expired_at` + `superseded_by` yazılır, `status: retired` olur.
**Zorlama:** `corpus` kapısı — dangling `supersededBy` taşıyan `superseded` kayıt hata.

### R-13 · tek-retrieval-yuklemi · BLOCKING · FAZ-2.2
Retrieval yüklemi kodda tek yerdedir ve `SystemRecord` (attributes'sız projeksiyon)
üzerinde derlenir.
**Neden:** `attributes` üzerinde derlenirse R-01'i kendi içinde çiğner.

### R-14 · agent-onerir-insan-uygular · BLOCKING · FAZ-2.4
Agent yalnız `corpus.propose()` çağırabilir. Öneri `status: draft` olarak iner ve
retrieval'a **görünmez**. Onay insanın git commit'idir.
**Neden:** kendi kendini değiştiren yapılandırmanın tek güvenlik hikâyesi budur.

---

## Türkçe

### R-20 · gorsel-modeline-turkce-metin-yok · BLOCKING · FAZ-3.7
Hiçbir görsel üretim prompt'u metin istemez; her prompt "no text, no lettering" taşır.
Metin gerçek fontla kompozit edilir.
**Neden:** Ideogram kendi dokümanında aksanlı Latin'in "hiç render edilmeyebileceğini"
kabul ediyor.

### R-21 · locale-guvenli-case · BLOCKING · FAZ-1.5
`.toUpperCase()` / `.toLowerCase()` yalnız `kernel/src/text/case.ts`'de, o da
`toLocaleUpperCase('tr')` ile.
**Neden:** `'i'.toUpperCase()` → `I`, olması gereken `İ`. Sessiz bozulma; ekran
görüntüsünde tipo gibi görünür ve üretime kadar yaşar.
**Zorlama:** `rg` grep, tek dosya hariç.

### R-22 · css-uppercase-turkce-degil · BLOCKING · FAZ-4.1
`text-transform: uppercase` yalnız `lang="en"` veya `data-legend` taşıyan öğede.
`capitalize` ve `lowercase` tamamen yasak.

### R-23 · turkce-genisleme-payi · BLOCKING · FAZ-4.1
Hiçbir etiket, düğme, sekme, tablo başlığı sabit genişlik alamaz. CI'da **+%30
sahte-yerelleştirme** turu zorunlu.
**Neden:** "Onayla" sığar; gerçek etiket "Onayla ve depoya işle" olur ve kırpar.

### R-24 · tanimlayicida-turkce-yok · BLOCKING · FAZ-0.C.5
Türkçe; tanımlayıcı, şema anahtarı, log olay adı, enum değeri, dosya adı ve hata `code`
alanına giremez. **Belge nesri Türkçe kalır.** → D-37

---

## Üretim ve kalite

### R-30 · tek-render-motoru · BLOCKING · FAZ-3.1
Statik, döküman ve hareket **aynı CSS motorunu** (Chromium) kullanır. İkinci bir render
motoru (Satori gibi ayrı bir CSS alt kümesi) eklenmez.
**Neden:** ikinci CSS alt kümesi = ikinci Türkçe tipografi hata modu.
**Sınır ikili değil MOTOR** (D-194): HyperFrames kendi Chrome'unu getiriyor
(135.x) ve Playwright'ınki 141.x — aynı motor, farklı sürüm. Bu kabul edilir **ancak**
tipografik eşdeğerlik golden metrikle KANITLANIRSA; metrikler ayrışırsa hareket katmanı
kullanılamaz.

### R-31 · golden-json-metrik · BLOCKING · FAZ-3.2
Commit edilen golden bir PNG değil, **JSON metriktir** (glyph kutuları, satır sayısı,
font ailesi, `notdef` = 0). Piksel referansı içerik-adresli depoda.
**Neden:** git'e binary girmez; ayrıca metrik antialiasing gürültüsünden etkilenmez.

### R-32 · kaynaksiz-iddia-yok · BLOCKING · FAZ-3.10
Sayısal iddia içeren hiçbir metin `claim_source` olmadan yayınlanamaz.

### R-33 · sentetik-insan-yok · BLOCKING · FAZ-3.11
`containsSyntheticPerson=false` iddiası olmayan varlık onaylanamaz.
**Neden:** Reklam Yönetmeliği Md. 27/12, 1 Ağu 2026'dan yürürlükte.

### R-34 · alt-text-yayini-bloklar · BLOCKING · FAZ-7.2
Türkçe `alt_tr` (≤125 karakter) olmayan görsel yayınlanamaz; `decorative: true` açıkça
işaretlenmelidir.

### R-36 · kisisellestirme-tavani-5 · BLOCKING · FAZ-6.7
Bir prospect çıktısında en fazla **5** prospect'e özgü alan bulunabilir.
**Neden:** Türk B2B'sinde fazlası iltifat değil **şüphe** uyandırır; "bunları nereden
biliyorsun" sorusu satış görüşmesini veri kaynağı savunmasına çevirir. Tavan yapısaldır,
öneri değil.
**Zorlama:** `kisisellestirme` kapısı sayıyı **bu satırdan okur** ve koddaki sabitle
karşılaştırır; ikisi ayrışırsa kırmızı. Yani tavanı değiştirmenin tek yolu önce burayı
değiştirmektir (R-74).

### R-35 · lexicon-linter-deterministik · BLOCKING · FAZ-3.10
Marka uygunluğu modele sorulmaz, listeye bakılır: yasak terim, token dışı hex, eksik
alt-text, locale-naif casing.
**Neden:** "bu marka uygun mu" diye sorulan model neredeyse her şeye evet der.

---

## Entegrasyon ve para

### R-40 · yetenek-iste-model-isteme · BLOCKING · FAZ-3.5
Pipeline dosyalarında model veya sağlayıcı adı geçemez; yetenek + kısıt istenir.
**Zorlama:** `registry/pipelines/` üzerinde model-id deseni grep'i.

### R-41 · para-bigint-usd-mikro · BLOCKING · FAZ-1.7
Para `{ micros: bigint, currency: "USD" }`. Float yasak, kuruş yasak. TRY yalnız raporda,
sabitlenmiş TCMB anlık görüntüsüyle.
**Neden:** görsel başına $0.0035 minor-unit'te hassasiyet kaybeder.

### R-42 · tahmin-senkron-ve-saf · BLOCKING · FAZ-3.4
`estimate()` senkrondur ve ağ kullanmaz — dönüş tipi `async`'i derleme hatası yapar.
**Neden:** çalıştırma öncesi maliyet ancak ağ gerektirmiyorsa dürüsttür.

### R-43 · saglayici-sekli-sinir-gecmez · BLOCKING · FAZ-3.4
Sağlayıcı SDK tipi, yanıt nesnesi veya string enum'u adaptör sınırını geçemez.

### R-44 · idempotency-anahtari · BLOCKING · FAZ-3.6
Her üretim çağrısı deterministik idempotency anahtarı taşır (girdi + model + param +
seed + bilgi commit'i).
**Neden:** çökme sonrası yeniden deneme çift ücret veya çift yayın demektir.

### R-45 · devre-kesici · BLOCKING · FAZ-3.6
5 ardışık hata, `(providerId, capability)` anahtarlı.
**Neden:** 3 seçilirse 3-denemelik retry sınırıyla çakışır ve tek mantıksal çağrıda tripler.

### R-46 · yayin-korlemesine-tekrar-edilmez · BLOCKING · FAZ-7.4
`PUBLISH` yeniden denenmeden önce okuma ile mutabakat yapılır.
**Neden:** Meta yinelenen gönderimde mevcut ID'yi döndürür; 3 varlık ürettiğin hâlde
20 ürettiğini sanırsın.

### R-47 · her-ucretli-fiil-dry-run · BLOCKING · FAZ-1.13
Her metered fiilin kuru ikizi vardır: sıfır ağ, sıfır yazma.
**Neden:** `just plan`'ı dürüst yapan tek şey budur.

---

## Güvenlik

### R-50 · untrusted-input-sinir · BLOCKING · FAZ-2.3b
`INGEST` çıktısı `derived/ingest/<domain>/` altına iner, ayrı ve açıkça sınırlandırılmış
bağlam bölümüne girer, **asla talimat olarak sunulmaz**. Taze dış metin içeren turda
`PUBLISH` ve hiçbir metered fiil insan onayı olmadan ateşlenemez.

### R-51 · secret-duz-metin-yok · BLOCKING · aktif
Düz metin secret commit'lenmez. Erişim yalnız `sops exec-env`; tanımlayıcılarda
`${ENV_ADI}` dolaylaması.
**Zorlama:** `repo-hygiene` kapısı (aktif) + `gitleaks` (FAZ-0.C.10).

### R-52 · derived-runs-silinmez · BLOCKING · aktif
`derived/runs/` ignore edilmez, silinmez, yedeklenir.
**Neden:** çalıştırma defteri corpus'tan türetilemez; maliyet ve sağlayıcı geçmişi
başka hiçbir yerde yazmıyor.
**Zorlama:** `repo-hygiene` kapısı — `git check-ignore derived/runs` eşleşirse hata.

---

## Depo ve belge

### R-60 · commit-iki-sinif · BLOCKING · aktif
Geliştirme commit'i `<tip>(<kapsam>)` + `Refs: FAZ-N.x · §bölüm` ister.
Çalıştırma commit'i (`corpus/`, `brand/`, `derived/runs/`) `Run` + `Actor` + `Kind`
ister ve `Refs:` **kullanamaz**.
Bir geliştirme commit'i `derived/runs/` DEĞİŞTİREMEZ: defter append-only kanıttır
(D-38) ve karışık bir commit künyesiz geçerdi (D-156). `corpus/`+`brand/` bu yasağın
dışında — şema göçü ve token düzenlemesi meşru biçimde koda eşlik eder.
**Zorlama:** `.githooks/commit-msg`.

### R-61 · ai-imzasi-yasak · BLOCKING · aktif
Commit mesajında `Co-Authored-By: Claude`, `Generated with`, `🤖` yasak. → D-34
**Zorlama:** `commit-msg` kancası + `repo-hygiene` (geçmiş taraması).

### R-62 · atif-butunlugu · BLOCKING · aktif
Her `§N` / `R-nn` / `D-nn` / `V-nn` / `FAZ-N.x` / `LOOP§X` hedefte var olmalı.
**Neden:** bağlamsız agent atıfı körü körüne izler; kırık atıf, okunmamış bir bölümü
"okudum" sanmasına yol açar.
**Zorlama:** `citations` kapısı.

### R-63 · belge-tavanlari · BLOCKING · aktif
`CLAUDE.md` 200 · `KURALLAR.md` **480** · `KARARLAR.md` 600 · `DURUM.md` 120 ·
`ANAYASA.md` 1400 · **ANAYASA alt bölümü (`### §N.M`) 60** · `FAZ-N.md` 250 ·
`.claude/rules/*.md` 120 satır.
ANAYASA'da asıl tavan **alt bölümdür**: belge hiçbir zaman baştan sona okunmaz, `just tur`
yalnız atıf verilen bölümü getirir ve okuyucunun maliyeti **o bölümün** boyudur. 1400
satırlık bir belgede 60 satırlık on bölüm, 1200 satırlık bir belgede 300 satırlık tek
bölümden ucuzdur. **Boş bir bölüm uzun bir bölümden pahalıdır** — kuralı bulamayan
kuralı yok sanmaz, kendi uydurur (D-230).
⚠ **Tavan bir kez yükseldi (400 → 480, D-322)** ve sebebi kendi cümlesiydi: FAZ-18'de
altı yeni kural eklendi, her biri tavanı deldi ve her seferinde bir ESKİ kuralın
gerekçesi budandı. Gerekçesi budanmış kural, bulunamayan kuralla aynı tuzağa düşüyor.
**Zorlama:** `docs-size` kapısı.

### R-64 · buyuk-dosya-git-e-girmez · BLOCKING · aktif
512KB üstü izlenen dosya yok. Varlık byte'ları `derived/blobs/`'a gider. Git LFS
kullanılmaz.
**Zorlama:** `repo-hygiene` kapısı.

### R-65 · uretilmis-dosya-elle-duzenlenmez · BLOCKING · FAZ-0.B.2c
`docs/referans/*` üretilir. Elle düzenleme, üreteci çalıştırınca kaybolur.
**Zorlama:** `docs-drift` kapısı — `just docs` sonrası `git diff --exit-code`.

---

## Çalışma biçimi

### R-70 · kanitsiz-bitti-yok · BLOCKING · aktif
"Bitti", "geçiyor", "çalışıyor" demeden önce doğrulama komutu çalıştırılır ve **gerçek
çıktı** gösterilir.
**Zorlama:** faz kapanışında bağımsız doğrulama agent'ı (`LOOP§D`).

**Somut tuzak (2026-08-14'te iki kez yaşandı):** kabuk `&&` zinciri yalan söyler.
Heredoc'tan sonraki komut zincire dahil değildir; `git commit` reddedilse bile sonraki
satır çalışır ve "✓ başarılı" yazdırır. **Çıkış kodunu açıkça oku** (`rc=$?`) ve durumu
komutun kendi çıktısıyla doğrula (`git log`, `git status`), yazdırdığın metinle değil.

### R-71 · kapi-kasten-ihlal-edilerek-test-edilir · BLOCKING · aktif
Yeşil bir kapı hiçbir şey kanıtlamaz. Her BLOCKING kapı, kasten ihlal edilip kırmızıya
döndüğü gösterilerek kabul edilir.

### R-72 · bir-turda-bir-adim · CONVENTION · aktif
Bir adım tek döngü turunda bitmeli. Bitmiyorsa adım değil, alt-fazdır — bölünür.

### R-73 · test-zayiflatilmaz · BLOCKING · aktif
Başarısız bir test, testi gevşeterek geçirilmez. `--no-verify` hiçbir koşulda
kullanılmaz.

### R-74 · kural-once-burada-degisir · BLOCKING · aktif
Kod bir kuraldan farklı davranacaksa önce bu dosya değişir. Sessiz sapma yasak.

### R-76 · kural-gevsetme-yasagi · BLOCKING · aktif
Bir kapı kırmızıyken **aynı turda** o kapının kuralını gevşetmek yasak. Kural değişikliği
ayrı bir turda, ayrı bir commit'te ve `KARARLAR.md`'de bir `D-nn` girdisiyle yapılır.
**Neden:** döngünün tam yetkisi var ve kural değiştirebiliyor. Bu sınır olmadan
"başarısız kapıyı geçmek için kuralı gevşetmek" meşru bir hamle gibi görünür ve tüm
kural sisteminin altını oyar — testi zayıflatmanın (R-73) kural seviyesindeki hâli.
**Zorlama:** `KURALLAR.md` değişikliği içeren commit yalnız `docs(docs)` veya
`refactor(gates)` tipinde olabilir ve gövdesinde `D-` atfı taşımalı; `fix(...)` tipiyle
kural değiştirmek `commit-msg` kapısında reddedilir.

### R-77 · kabuk-kapilari-locale-bagimsiz · BLOCKING · aktif
Kabuk tabanlı her kapı ve git kancası `export LC_ALL=C` ile başlar.
**Neden:** `LANG=tr_TR.UTF-8` altında POSIX karakter sınıfları Türkçe collation'a göre
çözülür ve `[A-Za-z]` aralığı `i`/`I` çevresinde **kırılır**:
`grep -oE "[a-z.]+@[a-z.]+"` → `ahmet.yilmaz@dokumsanayi.com.tr` girdisinde
`lmaz@dokumsanay` döndürür. Desen eşleşiyormuş gibi görünür ama **yarım** eşleşir;
kapı yeşil raporlarken hiçbir şey korumaz. `'i'.toUpperCase()` → `I` hatasının (R-21)
kabuk seviyesindeki kardeşidir. → D-58
**Zorlama:** `repo-hygiene` kapısı her kapı ve kancada satırı arar.

### R-75 · bagimlilik-son-care · CONVENTION · aktif
40 satır yazmak bir bağımlılıktan iyidir. Bağımlılıklar tam sürüme sabitlenir
(`save-exact`), lisansı kontrol edilir.

### R-78 · olcmeden-hizlandirma-yok · CONVENTION · aktif
"Yavaş" denen hiçbir şey ölçülmeden kısaltılmaz. Önce süre alınır, **en pahalı** kalem
kesilir — akla ilk gelen değil.
**Neden:** yavaşlığın kaynağı "1511 test" sanıldı; ölçüldü, tüm paket **11 sn**.
Tahminle kesmek en ucuz korumayı keser, pahalısı yerinde kalır. → D-265

### R-79 · tur-ici-test-nokta-atisi · CONVENTION · aktif
Adım boyunca yalnız o adımın test dosyası koşar (`just test <yol>`, saniyeler). Tam
paket ve `just check` **adım kapanışında bir kez**. İhlal turu (R-71) kalır ama kanıt
için yalnız o kapının testi koşar.
**Neden:** adım başına ~6 tam turdan ~1.5'e. Kaybedilen tek şey başka bir yeri kırdığını
geç öğrenmek; kapanış turu onu yine yakalar. → D-265

### R-80 · kirilgan-kapi-yesil-sayilmaz · CONVENTION · aktif
Aynı girdiye iki farklı cevap veren kapı yeşil değil **kırmızıdır**. Yeniden koşturup
yeşilini beklemek yasak.
**Neden:** `vitest run` tek başına çıkış kodu 1 verdi ("Worker exited unexpectedly",
1511 testin **161'i hiç koşmadı**), aynı paket `just check` içinde yeşil geçti. R-71'in
ikizi: yeşil kapı hiçbir şey kanıtlamaz, **kararsız** kapı daha azını. → D-265

### R-81 · jenerik-oge-kodlanmaz · GATE · aktif
Yeni bir **jenerik grafik öge** CSS/HTML ile kodlanmaz: ikon, ok, rozet, çerçeve, çizgi
süsü, 3B şekil, illüstrasyon. Bunlar tasarım kütüphanesinden gelir (`perfect-freehand`
kontur matematiği gibi) ya da hiç konmaz.
**İstisna — kodlanabilir olanlar:** YERLEŞİM (ızgara, kolon, boşluk), TİPOGRAFİ,
ZEMİN reçetesi (degrade/ışık/gren) ve VERİ görselleştirmesi (çubuk, vafel — bunlar süs
değil, verinin kendisi).
**Neden:** `examples/` altındaki profesyonel tasarımlarla bizimkiler yan yana
konduğunda fark renkte ya da düzende değil, ÖGELERDEydi. Elle kodlanmış bir ikon
"bilgisayar işi" gibi duruyor çünkü öyle. → D-279

### R-82 · defter-anahtari-sessizce-elenmez · GATE · aktif
Bir gövdenin `data` çıktısındaki her anahtar YA `DEFTER_ANAHTARLARI` beyaz listesinde
olur YA `defter-anahtarlari` kapısının envanterinde **gerekçesiyle** dışarıda bırakılır.
**Neden:** beyaz liste, listede olmayan alanı sessizce atıyor. Aynı hata **altı kez**
tekrarladı; her seferinde kod doğru, test yeşil, defter boştu. Listenin kendi yorumu
*"eksik bir beyaz liste sessiz bir körlüktür"* diyordu ve altıncısı yine oldu: **yorum
yetmedi.** Kapı yazılır yazılmaz on alan daha çıktı, içlerinde YAYIN KANITI vardı.
**Zorlama:** `defter-anahtarlari` kapısı (fast grubu). → D-310

### R-83 · punto-okuma-esigi-altina-inmez · GATE · aktif
Gövde metni **0,20° açısal x-yüksekliğinin** altına inemez — 1080 px'te **36 px**,
hedef 40–48. Oran tabanı EZEMEZ; taban tuval genişliğine orantılı, sabit piksel değil.
**Neden:** ölçü nominal punto değil, harfin gözde kapladığı AÇIDIR — kritik punto 0,2°
(Legge & Bigelow 2011). Gövdemiz **34 px** ölçüldü; oran göreli olduğu için başlık
küçüldükçe daha da iniyordu. ⚠ İstisna DAR: üç kelimelik etiket TANINIR, okunmaz.
**Zorlama:** `punto-esik-alti`. → D-321

### R-84 · gorsel-metnin-ustunde-durmaz · GATE · aktif
Metin gövdesi (`.baslik`, `.govde`) bir görselle **%12'den fazla** çakışamaz.
**Neden:** *"üstte olmak okunabilirlik değildir."* `metin-ortuluyor` boyama SIRASINI
soruyor; yanlış olan SORUYDU. Ölçüldü: metin alanının **%29'u** görselin üstündeydi.
⚠ Eşik sıfır DEĞİL. **Zorlama:** `metin-gorsel-cakisiyor`. → D-319

### R-85 · tanimsiz-token-cagrilmaz · GATE · aktif
Çağrılan her `var(--ramp-*)` / `var(--role-*)`, üretilmiş `tokens.css` dosyalarının
birleşiminde TANIMLI olmak zorundadır.
**Neden:** **CSS tanımsız bir `var()` için hata VERMEZ** — ögeyi sessizce şeffaf
bırakır. D-318 amber rampasını emekli etti, `aile.ts` çağırmaya devam etti; üç şablonun
zemin ögesi kayboldu, hiçbir test kırmızı olmadı. Derleyici de göremez (çağrı DİZE
içinde).
**Zorlama:** `token-cagrisi` kapısı (fast grubu). → D-320

### R-86 · olcu-bandi · GATE · aktif
Gövde satırı **45–75 karakter**. Alt sınır yalnız sütun onu kaldırabiliyorsa zorlanır.
**Neden:** alt sınır üst sınır kadar önemli ve eksik olan oydu — çok kısa satır gözü
her satırda geri döndürüp ritmi kırıyor (Butterick 45–90). Sayıldı: `donen` **19**,
`editoryal` 27. ⚠ Alt sınır koşullu: imkânsız bir şey isteyen ölçüm gürültüdür.
**Zorlama:** `olcu-bandi-disi`, `Range` ile GERÇEK kırılmalardan. → D-321

### R-87 · her-kesimde-tasiyici · GATE · aktif
Kesintisizlik iddia eden şablonda **HER kesim** en az bir taşıyıcı ögeyle aşılır.
**Neden:** eski ölçüm belge düzeyindeydi — altı kesimden birinde taşıyıcı varsa belge
temiz sayılıyordu. Süreklilik **her geçişin** özelliği. Kesim başına ölçülünce
`memphis`te 2, `editoryal`de 2 boş kesim çıktı. ⚠ Mekanizma listesi üçüncü kez eksik
kaldı: `olcek` CSS'e taşınınca `.bant path` sorgusu onu göremedi ve `donen` taşıyıcısı
YERİNDEYKEN kırmızı raporlandı. **Zorlama:** `kesintisizlik-yok`, boş kesimlerin x'iyle.
→ D-319 · D-321

### R-88 · guvenli-alan-ve-metin-payi · GATE · aktif
İçerik ögesi güvenli alanın dışına çıkamaz (üst/alt **80 px**, yan **60 px**) ve metin
kadrajın **%30**'unu geçemez — **kapakta %42**, çünkü kapak başlığı KAHRAMAN olmak
zorunda.
**Neden:** üst dolgu 68 px'ti, eşiğin 12 px altında. Metin payı ölçülünce gövde
kartlarında **%36–38** çıktı: her slayt kapakla AYNI punto payını kullanıyordu ve
sistemin kendi merdiveni bunu zaten reddediyor — serif "tek H1", Montserrat "bölüm
başlığı". Gövde başlığı 0,82 çarpanıyla indi.
⚠ **İki eşik, çünkü iki kural çelişiyor:** "metin ≤%30" ile "başlık kadrajın üçte birini
kaplarsa kahraman" aynı kartta uzlaşmaz. Tek eşik ikisinden birini yalanlardı.
⚠ **Panel metin DEĞİL, veridir** — ilk ölçüm onu da sayıp `veri-hikayesi`nin beş kartını
kırmızıya çevirdi; oysa o şablonun taşıyıcısı tam olarak veri paneli. Güvenli alan
paneli yine kapsıyor: veri de kenara yapışmamalı.
⚠ Ray ve sayaç KROM: kadrajı doldurmuyor, çerçeveliyor — boşluk hesabına girmiyor.
**Zorlama:** `guvenli-alan-disi` · `metin-payi-yuksek`. → D-321

### R-89 · kelime-butcesi · GATE · aktif
Başlık en fazla **8 kelime**, bir slaytta başlık + gövde + üst başlık toplamı en fazla
**28 kelime**. Sınır hem isteme yazılır hem uyarlamada zorlanır.
**Neden:** *"5–8 kelimelik kanca"* bir pazarlama sezgisi DEĞİL, geometrik zorunluluk:
başlığın bakışlık puntoda (≥0,5° açısal x-yüksekliği) olması ve 2–3 satıra sığması
gerekiyor; 1080 px tuvalde bu satır başına ~2,5 kelime eder. Aynı yoldan gövde ≈20
kelime çıkıyor — iki bağımsız türetmenin aynı sayıya varması kuralın kanıtı.
⚠ **ÜST sınır zorlanır, ALT sınır zorlanmaz.** Üç kelimelik bir başlık ("Sessiz bir
dönüşüm") kusur değil, çoğu zaman daha güçlü. Ölçülen şey kadraja SIĞMA; kısalık bir
tercih, uzunluk bir taşma riski.
⚠ **Sınır İSTEME de yazılıyor:** bir ret koşunun tamamına mal oluyor (model yeniden
çağrılır, konu yeniden okunur). Sığdırmaya çalışan başlık, kırpılan başlıktan iyidir.
⚠ Ret RENDER'dan önce: dört görsel üretip sonra "başlık uzun" demek o parayı geri
getirmiyor.
**Zorlama:** `uyarla` → `BASLIK_KELIME_TAVANI` · `SLAYT_KELIME_TAVANI`. → D-321

### R-90 · yayin-sozlesmesi · GATE · aktif
Karosel en fazla **10 slayt** taşır ve yayınlanan her dosya **JPEG** olur. İkisi de
yükleme yolunun ÖNÜNDE denetlenir.
**Neden:** Graph API ikisini de açıkça sınırlıyor (*"Carousels are limited to 10 images"*
· *"JPEG is the only image format supported"*, Meta Content Publishing, 30 Haz 2026).
Uygulama 20 slayta izin veriyor ama **bizim yayın yolumuz API** — iki sayıyı karıştırmak,
elle paylaşılabilen bir karoseli hattan geçirilebilir sanmak demek. Ve hattımız PNG
üretiyordu: her slayt yayın anında reddedilecekti, yani dört görsel üretildikten, bir
insan onayladıktan ve kota harcandıktan SONRA.
⚠ Kontrol token'dan ÖNCE: sözleşme ihlali bir yetki sorunu değil ve token yenilemek onu
düzeltmiyor. Ucuz olan önce sorulur.
⚠ Biçim çağıranın verdiği YOLDAN türüyor, bir parametreden değil: dosya adı `.jpg`
derken içeriğin PNG olması defterin kendi kendine yalan söylemesidir.
**Zorlama:** `publish` → `too_many_assets` · `unsupported_format`; `renderPanorama`
biçimi uzantıdan okuyor. → D-321

### R-91 · tuval-tek-kaynaktan · GATE · aktif
Karosel tuvalinin ölçüsü **tek sözleşme sabitinden** gelir (`VARSAYILAN_TUVAL`); hiçbir
dosya `1350` yazmaz.
**Neden:** aynı sayı altı ayrı dosyada kopyalıydı ve altı kopya, bir gün beşinin
değişip birinin unutulması demek. O gün panorama sessizce farklı orandan dilimlenir —
ve Meta API'de **ilk slaydın oranı tüm karoseli belirlediği için** geri kalan slaytlar
KIRPILIR, içerik uçar.
⚠ **3:4 artık resmî** (Instagram Yardım Merkezi, 29 May 2025: oran 1.91:1 – 3:4,
yükseklik 566–1440) ama 4:5 **Meta reklamında ZORUNLU** (min oran 400×500). Yani karar
"hangi oran" değil — **oran bir PARAMETRE** ve iki değer de aynı hattan üretilebilmeli.
⚠ Genişlik her iki oranda da 1080: Instagram üstünü kendi yeniden örnekleyicisiyle
küçültüyor ve küçültmeyi biz yaparsak sonucu kontrol ederiz.
**Zorlama:** `tuval.test.ts` — oran adı ile sayının ayrışamayacağını da ölçüyor
(`oran: '4:5'` yazıp 1440 vermek defterin kendi kendine yalan söylemesi). → D-321

### R-92 · uretim-yolu-imza-tasir · GATE · aktif
Üretilen her karosel marka işaretini TAŞIR; `logoVarliklari` üretim betiğinden çağrılır
ve sonucu `COMPOSE`a geçer.
**Neden:** dosyalar `brand/<id>/logo/` altında duruyordu, `logoVarliklari()` yazılmış ve
test edilmişti — ama **tek çağıranı editör önizlemesiydi**. `uret.mjs` içinde `logo`
kelimesi hiç geçmiyordu ve `panorama.ts` *"verilmezse imza BASILMIYOR"* diyordu. Yani
üretilen hiçbir karosel imza taşımıyordu ve hiçbir test kırmızı değildi.
⚠ **Zincir kopukluğunun yedincisi:** modül var, test yeşil, üretim yolu yok (D-182 ·
D-190 · D-224 · D-250 · D-261 · D-270 ailesi). Modülü test etmek zinciri test etmiyor.
⚠ Eksik logo koşuyu DURDURMUYOR — fontun aksine: font eksikse çıktı YANLIŞ üretilir,
logo eksikse geometrik yedek çizilir. Ama sessiz değil: uyarı basılıyor.
**Zorlama:** `marka-imzasi.test.ts` — modülü DEĞİL çağrıyı sınıyor (`uret.mjs` bir CLI,
import edilip çağrılamıyor; davranış testi kopukluğu göremezdi). → D-321
