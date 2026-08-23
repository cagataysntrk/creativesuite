# CLAUDE.md

Upcytech Creative Suite. Marka, ürün ve strateji bilgisinin tek doğruluk kaynağı;
üstünde ajans işlerini agentic pipeline'larla üreten yerel bir komuta merkezi.

## BAĞLAM COMPACT'LENDİYSE — önce bunu oku

Üç dosya, bu sırayla. Başka hiçbir şey.

1. `DURUM.md` — neredeyiz, sıradaki adım, bloke olanlar
2. `docs/fazlar/FAZ-<aktif_faz>.md` — o adımın tam tanımı
3. `just tur` — adımın okuması gereken her şeyi getirir

Sonra `docs/LOOP.md` `LOOP§B` (tur anatomisi) uyarınca çalış.
**Plan dosyası arşivdir** — `docs/ANAYASA.md` ve faz dosyaları tek doğrudur.

## Değişmez yasalar

Bunlar tartışılmaz. Değişecekse önce `KURALLAR.md`'de değişir, sonra kodda.

1. **Kernel `attributes` okumaz.** Zarf tek sözleşmedir. Üç katman zorlar:
   derleme hatası, lint, Proxy tuzağı. → §3.2
2. **Agent önerir, insan uygular.** Onay = git commit. → §5.4
3. **Görsel modeline Türkçe metin çizdirilmez.** Metinsiz üret, gerçek fontla
   kompozit et. → §7.2
4. **Tek render motoru.** İkinci CSS alt kümesi = ikinci Türkçe hata modu. → §7.1
5. **Bedava ve premium çıktı tipografide aynıdır.** Şeritler kelime ve resim satın
   alır, tasarım değil. → §8.2
6. **Model ID'si pipeline'da yer almaz.** Yetenek iste, yönlendirici seçsin. → §8.1
7. **Her varlık üretim anında marka + dönem damgası alır.** Sonradan retrofit
   imkânsız. → §4.3
8. **Kaynaksız sayısal iddia yayınlanamaz.** `claim_source` zorunlu. → §11.4
9. **Onay ima eden yapay insan üretilmez.** Reklam Yönetmeliği Md. 27/12. → §11.3
10. **Emeklilik silme değildir.** `expired_at` + `superseded_by`, dosya kalır. → §5.1
11. **Türetilmiş her şey yeniden üretilebilir** — ama `derived/runs` türetilmiş
    DEĞİLDİR ve silinmez. → §3.5
12. **Bir ay ihmal edilse de çalışır.** Hiçbir daemon doğruluk tutmaz; kurtarma
    `git clone` + `cat`. → §16
13. **Serbest üretim yok — KATALOG merkezli.** Hat düzen icat etmez; kataloğdan şablon
    seçer, içeriği ve görselleri onun yuvalarına üretir. Üretkenlik kompozisyonda değil,
    içerikte ve görsellikte. → D-268

## Atıf sözlüğü

Tek anlamlı. `citations` kapısı her atıfın hedefte var olduğunu doğrular.

| Ön ek | Hedef |
|---|---|
| `§N` / `§N.M` | **yalnızca** `docs/ANAYASA.md` bölümü |
| `R-nn` | `KURALLAR.md` kuralı |
| `D-nn` | `KARARLAR.md` kararı |
| `V-nn` | doğrulama borcu (🔴), `KARARLAR.md` sonunda |
| `FAZ-N.x` | faz adımı |
| `LOOP§X` | `docs/LOOP.md` bölümü |

## Nerede ne var

| Ne | Nerede |
|---|---|
| Şu anki durum | `DURUM.md` |
| Neden böyle | `KARARLAR.md` |
| Neye uymak zorundayım | `KURALLAR.md` |
| Bir kuralın sayısı NEREDEN geldi | `docs/kurallar/OLCUMLER.md` — ölçüm defteri (D-325) |
| Sistem nasıl çalışıyor | `docs/ANAYASA.md` (§ ile, baştan sona değil) |
| Bu adımda ne yapılacak | `docs/fazlar/FAZ-N.md` |
| Döngü nasıl işliyor | `docs/LOOP.md` |
| Ham araştırma | `docs/research/` — `ctx_search` ile sorgula |
| **Karosel nasıl üretiliyor** | `docs/referans/katalog-merkezli-hat.md` |
| **Şablon kataloğu** | `packages/contracts/src/katalog.ts` — üretim buradan başlar |
| Kesintisiz render | `packages/render/src/panorama.ts` — tek tuval, sonra dilimleme |

## Komutlar

`just` tek CLI girişidir. `pnpm` ve `node` doğrudan çağrılmaz.

```
just tur          # turun 1-2. adımı: durum + adım + okunacaklar
just check        # hızlı kapılar — commit öncesi
just verify       # tam doğrulama — faz kapanışında
just gate <ad>    # tek kapı, hata ayıklarken
just gates-list   # hangi kapılar var
just doctor       # haftalık sağlık raporu (değiştirmez, rapor eder)
just setup        # araç zinciri kontrolü
```

## Commit kuralları

İki sınıf, `commit-msg` kapısı zorlar.

**Geliştirme** (`packages/` `apps/` `scripts/` `docs/` ve kök yapılandırma):
```
<tip>(<kapsam>): <özet ≤72 karakter>

Refs: FAZ-N.x · §bölüm
```

**Çalıştırma** (yalnız `corpus/` `brand/` `derived/runs/`):
```
<özet>

Run: <run_id>
Actor: human|agent
Kind: propose|approve|discovery-apply
```

**AI atıf footer'ı yasaktır.** `Co-Authored-By: Claude`, `Generated with`, `🤖` —
hiçbiri. Kapı reddeder. → D-34

## Çalışma kuralları

- **Kanıtsız "bitti" yok.** Doğrulama komutunu çalıştır, gerçek çıktıyı göster.
- **Yeşil test bir şey kanıtlamaz.** Bir kapının çalıştığını görmek için onu
  **kasten ihlal et** ve kırmızıya döndüğünü gör.
- **Tur içinde nokta atışı test, kapanışta tam paket.** Adım boyunca yalnız o adımın
  test dosyası; tam paket + `just check` kapanışta bir kez. → R-79
- **Ölçmeden hızlandırma yok.** "Şu yavaş" demeden önce süre al. → R-78
- **Bir turda bir adım.** Bitmiyorsa adım değil, alt-fazdır — böl.
- **Sessiz düzeltme yok.** Bir kural yanlışsa `KURALLAR.md`'de değiştir, koda
  farklı yazma.
- **Bağımlılık eklemeden önce dur.** 40 satır yazmak bir bağımlılıktan iyidir.
- **Üretilmiş dosyayı elle düzenleme.** Üretecini düzelt.
- **Süreklilik ima edilmez, KURULUR.** Kesintisiz karosel tek geniş tuvalde tasarlanıp
  dilimlenir; kesimi aşan öge içerikten türer, süsten değil. → D-268
- **Görsel üreten koşu `sops exec-env` ile başlar.** Anahtarsız koşuda hat *"yerel önkoşul
  sağlanmadı"* der — bu sağlayıcı yokluğu DEĞİLDİR.

## graphify

Bilgi grafiği **`packages/` `apps/` `docs/` kapsamında** kurulur.

- ⛔ **`corpus/` ve `brand/` kapsam DIŞI.** Kod yerel kalıyor ama `.md`/`.pdf`/görseller
  LLM'e gidiyor; `corpus/` KVKK kapsamında prospect verisi, `brand/` marka sırrı taşıyor.
  Depo kökünde çalıştırmak ikisini de kapsama sokar.
- Kod soruları için `graphify query "<soru>"`, ilişki için `path`, odak için `explain`.
  Kod değişince `graphify update` (AST-only, API maliyeti yok).
- `graphify-out/` gitignore'lu ve türetilmiştir (Yasa 11). `gitleaks` onun `cache/`
  dosyalarında iki yanlış pozitif üretiyordu — dizin silinebilir, yeniden kurulur.
