# RUNBOOK — kurtarma ve olay müdahalesi

**Bu dosya bir ay sonra, panik hâlinde okunacak.** Nesir değil, adım.

## 1. Tam kurtarma (disk öldü, makine değişti)

```
1. git clone <origin> <hedef>          # kod · corpus · registry · brand · derived/runs
2. derived/blobs/ ayrı yedekten kopyala   # ⚠ clone GETİRMEZ (gitignore, R-64)
3. age anahtarını ayrı kasadan getir      # ⚠ repoda DEĞİL (R-51)
4. cd <hedef> && pnpm install --frozen-lockfile
5. just setup                             # git kancaları — YOKSA commit kapıları kapalı
6. just reindex                           # derived/index sıfırdan kurulur
7. just verify                            # TAM doğrulama (`just check` dar ve kusur gizler)
```

**Tatbikatı komut yapar:** `just yedek-tatbikat` gerçekten clone eder ve klonda
`just check` koşturur. **Denenmemiş yedek, yedek değildir** — bu satırları okumak
tatbikat yerine geçmez.

### Clone ile ne GELİR, ne GELMEZ

| Parça | Clone ile gelir mi | Neden |
|---|---|---|
| kod · corpus · registry · brand | ✅ | git'te |
| `derived/runs/` | ✅ | **ignore EDİLMEZ** (R-52) — türetilemez (D-38) |
| `derived/blobs/` | ❌ | gitignore'lu (R-64); ayrı yedek şart |
| `derived/index/` | ❌ ama önemsiz | `just reindex` yeniden kurar (11. yasa) |
| `secrets/secrets.enc.yaml` | ✅ | şifreli |
| **age çözme anahtarı** | ❌ | repoda değil; **anahtarsız yedek, yedek değildir** |

## 2. Tatbikatın bulduğu gerçek kusur (2026-08-16)

İlk tatbikat **kırmızı** döndü: `pnpm install --frozen-lockfile` temiz bir klonda
`ERR_PNPM_IGNORED_BUILDS` ile düşüyordu. Sebep, build-script onaylarının
geliştirici makinesinde yaşayıp repoda olmamasıydı — yani kurulum **yalnız bu
makinede** çalışıyordu.

**Bu, denenmemiş bir yedeğin gizlediği şeyin tam örneği:** her şey yolunda görünür,
ta ki gerçekten kurtarmaya çalışana kadar. Onaylar `package.json` →
`pnpm.onlyBuiltDependencies` altına yazıldı.

## 3. Secret sızıntısı — ilk 10 dakika

**Sızıntı anında prosedürü düşünmek, prosedürü uygulamamaktır.** Sırayla:

1. **İPTAL ET** (aşağıdaki tablodan panel URL'i) — yenisini beklemeden. Sızan bir
   anahtarın kullanılabilir kaldığı her dakika, saldırganın dakikasıdır.
2. `git log -S '<sızan dize>' --all` → hangi commit, hangi tarih
3. **Yeni anahtar üret** — aynısını "yenilemek" diye bir şey yok
4. `sops secrets/secrets.enc.yaml` ile güncelle
5. `just token-durum` → yeni anahtarla yayın açılıyor mu
6. `KARARLAR.md`'ye bir satır: ne sızdı, ne zaman, ne yapıldı

⚠ **Geçmişten silmek gerekmez ve denenmez.** İptal edilmiş bir anahtar zararsızdır;
geçmişi yeniden yazmak ise her klonu bozar ve `derived/runs` defterinin commit
zincirini kırar (D-38).

⚠ **Repo private** (D-34) ama private olmak sızıntıyı değil, yalnız erişimi sınırlar.
Sızıntı çoğu zaman repodan değil, ekran görüntüsünden ya da log'dan olur.

### Rotasyon tablosu — her anahtar, nereden döner

⚠ **Bu tablo `secret-rotasyon` kapısıyla kod ile senkron tutuluyor:** kodda
`readEnv` ile okunan her anahtar burada bir satır taşımak zorunda. Bir anahtar
eklenip tabloya yazılmazsa kapı kırmızıya döner — çünkü nasıl döndürüleceği
bilinmeyen bir anahtar, sızdığında döndürülemez.

| Anahtar | Sağlayıcı | Nereden döner | Not |
|---|---|---|---|
| `FAL_KEY` | fal.ai | `fal.ai/dashboard/keys` | eskiyi sil, yenisini üret |
| `CF_API_TOKEN` | Cloudflare | `dash.cloudflare.com` → API Tokens | token bazlı, kapsam daralt |
| `CF_ACCOUNT_ID` | Cloudflare | hesap kimliği — **sır değil**, rotasyon yok | döndürülemez, gizli de değil |
| `SUITE_CLAUDE_BIN` | — | `claude` ikilisinin yolu — **sır değil**, rotasyon yok | PATH'te bulunamadığında betiklerin çıkış yolu |
| `SUITE_GORSEL_PYTHON` | — | `.venv-gorsel` Python yolu — **sır değil**, rotasyon yok | arka plan silici sanal ortamı; depo dışına taşınırsa bu satır ezilir |
| `REMBG_MODEL` | — | arka plan silme modeli — **sır değil**, rotasyon yok | varsayılan `bria-rmbg`; zor vaka/hız dengesi için `u2net` ile değiştirilebilir |
| `SUITE_CLAUDE_MODEL` | — | model adı — **sır değil**, rotasyon yok | adaptörün varsayılanını ezer; bir model kaldırılırsa düzeltme dağıtım değil bir env satırıdır (§16) |
| `BRIGHTDATA_API_KEY` | Bright Data | müşteri paneli → API | SERP şelalesi (FAZ-6.5) |
| `TAVILY_API_KEY` | Tavily | `app.tavily.com` → API Keys | ücretsiz katman 1k/ay |
| `IHALE_MCP_URL` | ihale-mcp | kendi uç noktan | URL gömülü token taşıyorsa sırdır |
| `BORSA_MCP_URL` | borsa-mcp | kendi uç noktan | aynı uyarı |
| `META_APP_SECRET` | Meta | `developers.facebook.com` → App → Settings | **V-27: henüz yok** |
| `META_APP_ID` | Meta | aynı sayfa — **sır değil** | rotasyon yok |
| `LINKEDIN_CLIENT_SECRET` | LinkedIn | `linkedin.com/developers` → App → Auth | **V-27: henüz yok** |
| `LINKEDIN_CLIENT_ID` | LinkedIn | aynı sayfa — **sır değil** | rotasyon yok |
| `TELEGRAM_BOT_TOKEN` | Telegram | BotFather → `/revoke` | **V-18: yer tutucu** |
| `ELEVENLABS_API_KEY` | ElevenLabs | `elevenlabs.io` → Profile → API Key | premium TTS şeridi |
| `GEMINI_API_KEY` | Google AI Studio | `aistudio.google.com/apikey` | bedava TTS/metin şeridi |
| `RESEARCH_SRC` | — | araştırma arşivi yolu, **sır değil** | rotasyon yok |
| `SUITE_BRAND` | — | yapılandırma, sır değil | rotasyon yok |
| `BRAND_ID` | — | çalıştırma parametresi, sır değil | rotasyon yok |
| `ERA_ID` | — | çalıştırma parametresi, sır değil | rotasyon yok |
| `SUITE_PORT` | — | yerel sunucu portu, sır değil | rotasyon yok |
| `SUITE_NABIZ` | — | SSE kalp atışı ms, sır değil | rotasyon yok |
| `SUITE_SIRLAR` | — | `dev.sh`in kendini sops altında bir kez çağırdığını gösteren işaret, sır değil | rotasyon yok; değeri taşımaz, VARLIĞI sonsuz döngüyü keser |

**Sır olmayanlar da tabloda:** "bu neden burada yok" sorusunun cevabı bir satır
olmalı; listede olmayan bir anahtar, unutulmuş bir anahtardan ayırt edilemez.

## 4. Bir ay ihmalden sonra

```
just doctor        # ne çürüdü, ne ölçülemedi — RAPOR eder, düzeltmez
just token-durum   # token öldü mü (secret ÇÖZMEDEN çalışır)
just insight-durum # ölçüm boşluğu var mı — kalıcı kayıp ayrı sayılır
just yedek         # yedek TAM mı
```
