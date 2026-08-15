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
4. DOĞRULA   Nokta atışı test. ⛔ Uzun/kapsamlı test turda YAPILMAZ
5. KABUL     Faz dosyasındaki ✅ kriterini kontrol et. Karşılanmadıysa adım BİTMEZ
6. KAYDET    Faz dosyasında tikle + tarih → DURUM.md güncelle → commit
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
3. **Agent temiz derse** faz kapatılır. Aksi hâlde eksikler tur listesine eklenir.
4. **Tam kapsamlı test paketi FAZ 5 sonunda** çalıştırılır — o zaman, ondan önce değil.

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
- ✅ **Aynı fazda üç adım birden bloke olursa döngü durur ve kullanıcıya sorar** —
  "durmak yok" kuralının tek istisnası, çünkü üç bloke adım artık bir uygulama
  sorunu değil, plan hatasıdır

**Kırmızı kapı ile commit yok.** `just check` kırmızıysa tur commit'siz biter,
`DURUM.md` güncellenir, sonraki tur oradan devam eder.
