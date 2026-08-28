# HyperFrames — yerel kopya

⚠ ⚠ **BU DİZİN BİR SİGORTA.** Depo sahibi: *"hyperframes'i locale çek, bi gün priv
yaparlarsa."* HyperFrames Apache-2.0 ve HeyGen'in (`heygen-com/hyperframes`), ama
lisans bir garanti değil: depo yarın özelleşir ya da silinirse `npx hyperframes` çalışan
bir hattı bir sabah durdurur. Yasa 12 — *"bir ay ihmal edilse de çalışır"* — bunu
kaldırmaz.

## Ne var burada

| dosya | ne | neden |
|---|---|---|
| `hyperframes-0.7.109.tgz` | **motion/kanit'in sabitlediği sürüm** | bugün çalıştığı KANITLANMIŞ sürüm — altı mp4 bununla render edildi |
| `hyperframes-0.8.17.tgz` | npm'deki son sürüm (2026-08-28) | geçiş yapılacaksa kaynağı elde |

Bunlar **npm paketi**, kaynak deposu değil. `npx hyperframes`in gerçekten koşturduğu
şey bu tarball; 398 MB'lık kaynak deposu geliştirme içindir, çalıştırma için değil.

## Ağ olmadan kurulum

```
npm install ./vendor/hyperframes/hyperframes-0.7.109.tgz
# ya da doğrudan koşturmak için:
npx --yes ./vendor/hyperframes/hyperframes-0.7.109.tgz render
```

## Kaynak deposu

Tam kaynak (398 MB, 42 962 yıldız) **depoya alınmadı** — 16 MB'lık sigortanın yanına
398 MB koymak, kurtarmayı (`git clone`) ağırlaştırırdı. Ayna klon depo DIŞINDA:

```
~/İndirilenler/projeler/hyperframes-ayna.git   (git clone --mirror)
```

Güncellemek için: `git --git-dir=~/İndirilenler/projeler/hyperframes-ayna.git remote update`

⚠ Ayna depo dışında olduğu için Yasa 12'nin `git clone` kurtarmasına DAHİL DEĞİL.
Kaynak gerekirse ve ayna da yoksa, tarball'lar yeter: içinde derlenmiş `dist` var.

## Sahte depolar — dikkat

Önceki araştırmanın uyarısı: `hyperframes.app` ve `github.com/hyperframes/hyperframes`
**ilgisiz üçüncü taraflar** ve Apache-2.0 bir projeye ücretli bulut render satıyorlar.
Yalnız `heygen-com/hyperframes` çekilir.
