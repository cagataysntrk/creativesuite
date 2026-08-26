# DEVİR — Metricool MCP oturumu

> Bu belge **sıfır bağlamlı** bir oturum için yazıldı. Sırayla oku, atlama.
> Yazıldığı an: 2026-08-27 · depo `main` dalında **temiz ve push edilmiş** (`d7d8b45`).
>
> ⚠ **Bu dosya HER DEVİRDE ÜZERİNE YAZILIR** — `DURUM.md` gibi tek bir güncel hâli
> vardır, geçmişi `git log docs/DEVIR.md` tutar. Bir turun devri bittiğinde bayatlar;
> tek doğru `docs/ANAYASA.md`, `KURALLAR.md` ve faz dosyalarıdır (D-85).

---

## 0. Önce şunu yap

```bash
cd "/home/cagataysntrk/İndirilenler/projeler/creativesuite"
cat DURUM.md          # makine-okunur durum + son_kanit satırı
```

`CLAUDE.md` deponun anayasasıdır — **on üç değişmez yasa** orada. Bu belge onun
yerine geçmez, yalnız bu turun devridir.

---

## 1. ASIL İŞ: Metricool MCP

Depo sahibi `metricool: https://ai.metricool.com/mcp` MCP'sini bağladı ve
**bağlantı sağlıklı** (`claude mcp list` ile doğrulandı). Önceki oturum MCP
eklenmeden ÖNCE başladığı için araçları göremedi — **senin oturumunda gelmiş
olmalı.**

### İlk adım: araçlar geldi mi

```
ToolSearch("+metricool")
```

Gelmediyse dur ve sahibe söyle; MCP araçları oturum açılışında yükleniyor.

### Cevaplanacak TEK kritik soru

**`post_schedule_post` çoklu görsel (KAROSEL) alıyor mu, ve medyayı nasıl
istiyor — herkese açık URL mi, dosya yükleme mi?**

Bu depo 4–6 slaytlık karosel üretiyor. Metricool'un pazarlama sayfası ve PyPI
README'si bu soruyu **cevaplamıyor** (yalnız *"Schedule a post (o multipost)"*
diyor, o da çoklu **ağ** demek, çoklu görsel değil). Şemaya bakmadan varsayma.

### Karar ağacı

| `post_schedule_post` ne alıyorsa | Ne yapılacak |
|---|---|
| **Karosel + dosya yükleme** | Takvimdeki `planla` kararını doğrudan Metricool'a yaz; `get_scheduled_posts` ile doğrula → panelde **gerçek** "eşitlendi" rozeti |
| **Karosel + herkese açık URL** | Slaytlar önce bir yere yüklenmeli. Sahibin **Cloudflare anahtarları kasada var** (`CF_ACCOUNT_ID`, `CF_API_TOKEN`) — R2 açık kova en kısa yol |
| **Karosel ALMIYOR** | Yayın paketi klasörü elle yükleme için kalır (aşağıda). Sahibe bunu **açıkça söyle**, sessizce tek görsele düşme |

### Bilinen araçlar (Metricool'un kendi listesi)

`get_brands` · `get_analytics` · `get_best_time_to_post` · `post_schedule_post` ·
`update_schedule_post` · `get_scheduled_posts` · `get_instagram_posts` ·
`get_instagram_reels` · `get_network_competitors` …

⚠ `get_best_time_to_post` **bizim eksiğimizi kapatıyor**: `packages/engine/src/plan/yayin-saati.ts`
"en az beş gözlem yok, saat ÖNERMİYORUM" diyor. Metricool o veriyi veriyor.

### Sahibin kısıtı

> *"şimdilik sadece linkedin ve insta ya paylaşcaz"*

Varsayılan platformlar zaten **IG + LinkedIn**'e daraltıldı
(`GonderiKutusu.tsx`, `RunLauncher.tsx`). Facebook ve X silinmedi, yalnız
varsayılan dışında.

---

## 2. Neden bu depo artık yayın aracı DEĞİL

Bu bir tercih değil, **araştırma sonucu**. Birincil kaynaklardan doğrulandı:

| Platform | API'den zamanlama |
|---|---|
| **Instagram** | ❌ YOK. Kap oluştur → `media_publish`. Kap **24 saatte doluyor**. Meta kendi belgesi: *"if your app allows app users to schedule posts"* → zamanlayıcı **uygulamanındır** |
| **LinkedIn** | ❌ YOK. `PUBLISHED`/`DRAFT`/`PROCESSING` — `SCHEDULED` durumu yok |
| **X** | ❌ YOK. Zamanlanmış gönderi yalnız **Ads API**'de |
| **Facebook** | ✅ VAR. `published:false` + `scheduled_publish_time` (10 dk – 30 gün) |

Yani *"platformun takvimine eşitlendi"* üç platformda **var olmayan bir şey**.
Kendi zamanlayıcımız ise **Yasa 12**'ye çarpıyor: makine kapalıyken gönderi
gitmez. Sahip kararı verdi: **panel hatırlatıcı + planlayıcı, yayın bulut
aracıyla.**

⚠ Metricool/Buffer kullanmak bunu değiştirmiyor — kuyruğu depodan dışarı
taşıyor. Rozet "eşitlendi" derken **hangi gerçeği** söylediğini ayırmalı.

**Fiyat araştırması:** Metricool marka başına ücretlendiriyor (1 marka =
IG+FB+LinkedIn ücretsiz, X ~$5/ay); Publer/Buffer kanal başına ~$5 → 4 kanal
~$20/ay; Ayrshare karosel için $149/ay. Sahip Metricool'u seçti.

---

## 3. Şu anki üretim durumu

**10 elenmemiş koşu, her şablondan bir tane. 9'u `tasarim-onayi` kapısında.**

| şablon | koşu | kapı | durdu | metin |
|---|---|---|---|---|
| akan-alan | `01a03c5a` | tasarim-onayi | gorsel-yargi | yok |
| alinti | `01a03c6c` | tasarim-onayi | gorsel-yargi | yok |
| dizin | `01a03db4` | tasarim-onayi | gorsel-yargi | yok |
| donen | `01a03c64` | tasarim-onayi | gorsel-yargi | yok |
| **editoryal** | `01a03e9e` | — | **kompozit** | instagram |
| karsilastirma | `01a03c6d` | tasarim-onayi | gorsel-yargi | yok |
| kavis | `01a03c69` | tasarim-onayi | gorsel-yargi | yok |
| memphis | `01a03c5f` | tasarim-onayi | gorsel-yargi | yok |
| sahne | `01a03c5d` | tasarim-onayi | gorsel-yargi | yok |
| veri-hikayesi | `01a03e7d` | tasarim-onayi | gorsel-yargi | x, linkedin, facebook |

⚠ **`editoryal` hattın ortasında durdu** (`kompozit` adımında). Panelde "hattın
ortasında duran" kutusunda görünüyor. Sürdürülmesi gerekiyor.

⚠ **`kavis` ve `editoryal`'da `tasarim-onayi: approved` kararı var ve o kararı
SAHİP VERMEDİ** — önceki oturumun Playwright testleri yazdı. Sahibe bildirildi.
İkisinde de karara bağlı gerçek hat çıktısı olduğu için sökülmedi. Sahip
isterse `git revert` ile geri alınabilir.

⚠ **Takvim BOŞ ve bu doğru**: hiçbir üretim `insan-onayi`ndan geçmedi, yani
yayına hazır sıfır. Panel bunu "takvime giremeyenler" kutusunda açıklıyor.

---

## 4. Bu turda ne yapıldı (yeniden yapma)

- **Koşular + Varlıklar TEK EKRAN** (`RunGecmisi.tsx`). Birleşim **koşu listesi**
  üzerine kuruldu — varlık listesi üzerine kursaydım 192 koşu sessizce düşerdi.
  `VarlikKutuphanesi.tsx` **silindi**. İki görünüm: kart (slaytlarla) / tablo.
- **`GonderiKutusu.tsx` tek kaynak** — koşu detayı, varlık kartı ve takvim üçü de
  onu çağırıyor. Otomatik ve manuel planlama **yan yana**, hangisinin geçerli
  olduğu üstte yazıyor.
- **Karosel sırası `teslimat.index`e bağlandı.** İki yerde birden bozuktu.
  `createdAt` yetmiyor — zaman damgaları milisaniyede eşitleniyor.
- **Yayın paketi klasörü** (`apps/server/src/yayin-paketi.ts`): karoseller
  `01.png`, `02.png`… teslimat sırasında, metinler platform başına `.txt`,
  ve `GONDERI.md`. `POST /api/kosu/:runId/yayin-paketi` (tek) ·
  `POST /api/yayin-paketleri` (ayın tamamı). Çıktı: `derived/yayin-paketleri/`
  (gitignore'lu, türetilmiş).
- **Metin üretimi çalışıyor**: `just yayin-metni --run <id> --platform <id>`
  ya da `--hepsi`. Hattın `text.generate` adaptörünü çağırıyor, **maliyet sıfır**
  (abonelik). Sunucu model çağırmıyor; `spawnProcess` çekirdekten.
- **`uctan-uca` kapısı artık İŞLEV ölçüyor**, "açılıyor mu" değil — ve
  birleşimde koşu kaybını sınıyor (ekrandaki kart = API'nin koşu sayısı).

---

## 5. Tezgâh ve kapılar

```bash
bash /home/cagataysntrk/.claude/jobs/1b72a065/tmp/tezgah.sh   # üç süreç, node 22
# 5173 panel · 5177 api · 4321 görsel editör
```

⚠ **NODE 22 ŞART.** Kabuğun varsayılanı v20 ve `better-sqlite3` prebuild'i o
ABI'de **segfault** veriyor (exit 139, hiç çıktı yok).
⚠ Editörü tek başına öldürmek üçünü birden indirir (`dev.sh` `wait -n`).

```bash
just check                       # 52 hızlı kapı (~2 dk)
SUITE_KAPILAR=1 just gate uctan-uca   # tarayıcı kapısı (GROUP: all)
```

⚠ Playwright yalnız `packages/render/node_modules`'ten çözülüyor; CommonJS
olduğu için `import()` sonrası `.default` gerekebilir.
⚠ Tarayıcı testinde **zaman aşımı ZORUNLU** ve **asla `networkidle`** — panel
SSE akışı tutuyor, hiç boşa düşmez.

---

## 6. Commit sınıfları — sahibin IDE'si buna takıldı

Sınıf **sahnelenen dosya yollarından** belirleniyor (`.githooks/commit-msg`):

- Hepsi `corpus/` `brand/` `derived/runs/` altındaysa → **çalıştırma** commit'i:
  `Run:` `Actor:` `Kind:` zorunlu, **`Refs:` YASAK**
- Araya tek bir kaynak dosyası karışırsa → **geliştirme** commit'i ve o sınıf
  `derived/runs/`'a **dokunamaz** (D-156)

⚠ **`git add -A` YAPMA** — `derived/runs`'u geliştirme commit'ine sokar.
⚠ Konu satırı **≤72 karakter**. Kapsam kapalı listeden.
⚠ **AI atıf footer'ı yasak** (`Co-Authored-By`, `Generated with`, 🤖) — D-34.

---

## 7. Duran talimatlar

- ⛔ **YAYIN YOK.** `yayinla` adımına geçme, gerçek gönderim yapma.
- ⛔ **Şablon TASARIMINA dokunma.** (Katalog brief'leri ve görsel yuvaları hariç.)
- ⛔ `corpus/` ve `brand/` **graphify kapsamı dışında** (KVKK + marka sırrı).
- **Kanıtsız "bitti" yok** — doğrulama komutunu çalıştır, gerçek çıktıyı göster.
- **Yeşil test bir şey kanıtlamaz** — kapıyı **kasten ihlal et**, kırmızıya
  döndüğünü gör, `cp` yedeğiyle geri al.
- ⚠ **`git checkout` ile geri alma** — kaydedilmemiş işi siler. Önce `cp`.
- **Görsel üreten koşu** `sops exec-env secrets/secrets.enc.yaml '…'` ile başlar.
  Anahtarsız koşuda hat *"yerel önkoşul sağlanmadı"* der; bu sağlayıcı yokluğu
  DEĞİLDİR.

---

## 8. Önceki oturumun kendi hataları (tekrarlama)

- Karosel sırasını **`digest`e göre** sıraladım — sha256 rastgeledir. Yorumumda
  `createdAt` yazıp koda `digest` yazmışım; **yorum ile kod ayrışınca kod kazanır.**
- Testlerde `'derived/runs'` yolunu **elle yazdım** — `manifest-yazici` darboğazı
  reddetti, **iki kez**. Yolu bilen tek yer sözleşmedir (`RUNS_DIR`).
- `node:child_process`ten **doğrudan `spawn`** çağırdım — tek yetkili spawn
  noktası `packages/kernel/src/proc/spawn.ts`.
- **"Hat sürüyor"** diye doğrulayamadığım bir şeyi iddia ettim.
- DURUM ihlal sayacını **üç kez tahmin edip yanıldım** — kapı ölçüyor, sen tahmin
  etme.
- Playwright testlerim **dört koşuya kapı kararı yazdı**. Tarayıcı testi gerçek
  duruma dokunuyor: onay/red düğmelerine basmadan önce iki kez düşün.
