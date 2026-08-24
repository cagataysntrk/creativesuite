# LOOP — kesintisiz geliştirme döngüsü

Bu proje `/loop` **dinamik modunda** geliştirilir. Döngü durmaz; her tur ölçülebilir
ilerleme üretir.

## LOOP§A — kesin kurallar {#loop-a}

1. **Wakeup her zaman ≤70 saniye.** İstisnasız. Her turda yeniden kurulur ve ilan edilir.
2. **Durmak yok.** Fazlar bitince denetim turlarına geçilir (FAZ 9). Yalnızca kullanıcı durdurur.
3. **Karar sorulmaz.** En makul analizle karar verilir, `KARARLAR.md`'ye tarihli ve
   gerekçeli yazılır, devam edilir. Tam yetki — **ama kolaya kaçma yetkisi değil.**
4. **Körleme iş yasak.** Önce araştır → oku → kontrol et → sonra geliştir.
5. **"Bitti" tek başına yeterli değil.** Faz bitti sanıldığında bağımsız doğrulama
   agent'ı çalıştırılır (`LOOP§D`).

## LOOP§B — tur anatomisi {#loop-b}

**Bir tur = bir veya daha fazla adım.** Tur, doğal bir durakta biter: bağlam dolduğunda,
bloke bir adıma çarpıldığında, faz kapandığında veya kullanıcı müdahale ettiğinde.
Her adım **kendi commit'ini** alır — ama commit turu bitirmez (D-52).

```
1. ARAŞTIR   just tur  →  adımın 📖 satırındaki her hedefi getirir
             ANAYASA bölümünü HEDEFLİ oku (baştan sona değil)
             KURALLAR.md'de ilgili R kuralını doğrula
2. KOD OKU   İlgili mevcut kodu oku — tekrar yazma, yeniden kullan
3. GELİŞTİR  Kurallara uyarak. Küçük, tam, test edilebilir parça
4. DOĞRULA   `just test <o adımın dosyası>` — saniyeler. Ara turlarda `tsc -b` yeter.
             ⛔ Tam paket ve `just check` adım İÇİNDE koşmaz (R-79)
             İhlal turu (R-71) kalır — ama yalnız o kapının testi koşar
5. KABUL     Faz dosyasındaki ✅ kriterini kontrol et. Karşılanmadıysa adım BİTMEZ
6. KAYDET    Kapanışta BİR KEZ tam paket + `just check` → tikle → DURUM.md → commit
6b. DEVAM   Doğal durak gelmediyse bir sonraki adıma geç — commit'te durma
7. PLANLA    ScheduleWakeup(≤70s) + kaldığın yeri ilan et
```

## LOOP§C — turda yapılmaz {#loop-c}

- ⛔ Yarım adım bırakmak — bir adım ya biter, ya başlamaz, ya bloke işaretlenir
- ⛔ Kabul kriteri karşılanmadan tiklemek
- ⛔ `just check` kırmızıyken commit
- ⛔ Kuralı `KURALLAR.md`'de değiştirmeden koda farklı yazmak
- ⛔ Doğrulanmamış bir sayıyı koda gömmek — 🔴 işaretli her şey `KARARLAR.md`'de
- ⛔ Kapıyı `--no-verify` ile atlamak

## LOOP§D — faz kapanış protokolü {#loop-d}

Bir faz bitti sanıldığında, **tiklemeden önce**:

1. **Kabul kriterlerini tek tek çalıştır** — her ✅ için somut kanıt üret
   (komut çıktısı, test sonucu, dosya varlığı)
2. **Bağımsız doğrulama agent'ı çalıştır** (`.claude/agents/faz-dogrulayici.md`):
   > *"FAZ-N'in her kabul kriterini `docs/fazlar/FAZ-N.md`'den oku, kodda ve repoda
   > gerçekten karşılandığını doğrula, karşılanmayanları ve yarım kalanları listele.
   > Kabul etme eğiliminde olma — kanıt ara."*
3. **En fazla İKİ tur** (D-79). 1. tur bulgularını kapat, 2. turu koş, onun bulgularını
   da kapat — **faz kapanır**. Üçüncü tur açılmaz.
   **Neden:** "sorun bul" diye bakan bir agent her turda sorun bulur; yakınsama yoktur
   çünkü agent'ın görevi yakınsamak değil, bulmaktır. Bu projede 1. tur 9 bulgu, 2. tur
   3 blokaj + 4 ikincil verdi ve üçüncüsü de verecekti. **Faz kapanışı agent'ın
   yorulmasına bağlanamaz.**
4. **İkinci turda bulunmayan şey minor'dur** ve FAZ 9 denetim turlarına düşer —
   `9.2` (kural uyumu, kasten ihlal) ve `9.5` (ölü kod) zaten sürekli arıyor.
5. **Tam kapsamlı test paketi FAZ 5 sonunda** çalıştırılır — o zaman, ondan önce değil.

## LOOP§E — bağlam sıfırlanmasına dayanıklılık {#loop-e}

Her tur, bağlam sıfırlansa bile devam edilebilecek şekilde biter.

- `DURUM.md` **her turda** güncellenir; makine-okunur blok döngünün sözleşmesidir
- Faz dosyasındaki tikler **anlık** durumdur
- Yarım iş bırakılmaz — bir adım ya biter, ya başlamaz, ya bloke işaretlenir
- Commit mesajı `Refs: FAZ-N.x · §bölüm` taşır → `git log` tek başına yol haritası
- **Compact sonrası ilk iş:** `CLAUDE.md` → "BAĞLAM COMPACT'LENDİYSE"

## LOOP§F — tur çıktısı formatı {#loop-f}

Her tur kısaca şunu bildirir:

- **Ne yapıldı** — adım no + tek cümle
- **Ne doğrulandı** — somut kanıt (komut çıktısı)
- **Ne bulundu** — varsa sürpriz veya karar
- **Sırada ne var** — adım no
- **Wakeup 70 sn** ilanı

Uzun anlatım yok. Kanıt var, sonuç var, sonraki adım var.

## LOOP§G — bir adım başarısız olduğunda {#loop-g}

Döngü durmaz ama **aynı duvara üç kez koşmaz.** Sayaç `DURUM.md`'de.

| Deneme | Ne yapılır |
|---|---|
| 1 | Hatayı oku, kök nedeni bul, düzelt, tekrar dene. Aynı tur. |
| 2 | Yaklaşımı **değiştir**. Aynı çözümü tekrar denemek yasak. `KARARLAR.md`'ye "1. yaklaşım neden başarısız" yazılır. |
| 3 | Adım **BLOKE** işaretlenir. `DURUM.md`'ye engel + iki yaklaşım + gereken karar yazılır. Döngü **sonraki bağımsız adıma** geçer. |

Bloke adımlar biriktikçe her turda biri yeniden denenir.

**Kesin kurallar:**
- ⛔ Testi zayıflatarak geçirmek — kural ihlali, geri alınır
- ⛔ Bloke adımı "tamam" diye tiklemek
- ✅ Bir adım bloke olduğunda iş bitmez; sıradaki bağımsız adım alınır
- ✅ **Aynı fazda üç adım TEKNİK olarak bloke olursa döngü durur ve kullanıcıya sorar** —
  "durmak yok" kuralının tek istisnası, çünkü üç teknik blokaj artık bir uygulama
  sorunu değil, plan hatasıdır

**İki blokaj sınıfı — sayan yalnız biri (D-157):**

| Sınıf | Ne demek | Üçlü kurala sayar mı |
|---|---|---|
| `bloke: teknik` | Üç deneme tükendi, yaklaşım bulunamadı | **Evet** — plan hatası sinyali |
| `bloke: insan` | Dışarıdan girdi bekliyor: API anahtarı, para, onay | **Hayır** |

Ayrım şu yüzden var: üçlü kural **plan hatasını** yakalamak için kondu, dış bağımlılığı
değil. `V-16` anahtarı yoksa üç adım da aynı anda durur ve bu, planın yanlış olduğunu
DEĞİL, doğru olduğunu gösterir — plan o bağımlılığı zaten `V-nn` olarak öngörmüştü.
Sınıf ayrımı olmadan kural, kendi öngördüğü şeyi hata sanıp döngüyü durdururdu.

**İnsan blokajının bedeli sıfır değildir:** her turda `DURUM.md`'nin en üstünde,
tam olarak ne gerektiği ve hangi adımların beklediğiyle birlikte ilan edilir.
Sessizleşirse teknik blokaja terfi eder.

**Kırmızı kapı ile commit yok.** `just check` kırmızıysa tur commit'siz biter,
`DURUM.md` güncellenir, sonraki tur oradan devam eder.

## LOOP§H — panelden BAKARAK kontrol {#loop-h}

**Gerçek kullanıcı arayüzü paneldir.** Bir koşu diskte kusursuz, API'de doğru ve panelde
GÖRÜNMEZ olabilir — bu depoda tam olarak bu oldu.

- Görsel/koşu üreten her turda panel Playwright ile **açılır ve bakılır**: `#/gecmis`,
  varlıklar, üret. Sayfanın metnini okumak yetmez; ekran görüntüsü alınır.
- Mümkünse koşu **panelden** başlatılır ve kapılar oradan geçilir: CLI'dan koşan bir hat,
  panelden koşmadığını söylemez.
- Doğrulama zinciri: *dosya → API → PANEL*. İlk ikisi yeşilken üçüncüsü kırmızı olabilir.

**Neden:** JPEG damgası kırıkken hat `gorsel-yargi`da ölüyordu; slaytlar diskte duruyordu,
koşu defterde bitmemişti. Ben API ve dosyadan doğrulayıp *"görünüyor"* dedim; eksikliği
depo sahibi **panelde** gördü. Bir doğrulama, kullanıcının baktığı yerden yapılmazsa
doğrulama değildir.

⚠ Playwright MCP Chrome arıyor (`/opt/google/chrome/chrome`) ve kurulumu sudo istiyor;
deponun kendi Chromium'u (`packages/render/src/browser.ts`) aynı işi görüyor ve kullanılan
odur. ⚠ Vite dev sunucusunda `waitUntil: 'networkidle'` ASLA gerçekleşmez (HMR websocket
açık kalır) — `domcontentloaded` + kısa bekleme kullanılır.
