# RUNBOOK — kurtarma ve olay müdahalesi

**Bu dosya bir ay sonra, panik hâlinde okunacak.** Nesir değil, adım.

## 1. Tam kurtarma (disk öldü, makine değişti)

```
1. git clone <origin> <hedef>          # kod · corpus · registry · brand · derived/runs
2. derived/blobs/ ayrı yedekten kopyala   # ⚠ clone GETİRMEZ (gitignore, R-64)
3. age anahtarını ayrı kasadan getir      # ⚠ repoda DEĞİL (R-51)
4. cd <hedef> && pnpm install --frozen-lockfile
5. just check                             # yeşil olmalı
6. just reindex                           # derived/index sıfırdan kurulur
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

1. **Anahtarı iptal et** (sağlayıcı panelinden) — dönmesini bekleme, önce iptal
2. `git log -S '<sızan dize>' --all` ile hangi commit'te olduğunu bul
3. Sızan anahtar **yeni bir anahtarla değiştirilir**, aynısı yenilenmez
4. `secrets/secrets.enc.yaml` güncellenir, `just token-durum` ile doğrulanır
5. Geçmişten silmek **gerekmez ve denenmez**: iptal edilmiş bir anahtar zararsız,
   geçmişi yeniden yazmak ise her klonu bozar

⚠ **Repo private** (D-34) ama private olmak sızıntıyı değil, yalnız erişimi sınırlar.

## 4. Bir ay ihmalden sonra

```
just doctor        # ne çürüdü, ne ölçülemedi — RAPOR eder, düzeltmez
just token-durum   # token öldü mü (secret ÇÖZMEDEN çalışır)
just insight-durum # ölçüm boşluğu var mı — kalıcı kayıp ayrı sayılır
just yedek         # yedek TAM mı
```
