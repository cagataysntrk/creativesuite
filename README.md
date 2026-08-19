# Upcytech Creative Suite

Markanın, ürünlerinin ve stratejinin tek doğruluk kaynağı olan git deposu; üstünde
ajans işlerini agentic pipeline'larla üreten yerel bir komuta merkezi.

**Bu depo private'tır ve öyle kalacaktır.** Kurumsal strateji, prospect verisi ve
sağlayıcı yapılandırması taşır.

## Nereden başlanır

| Ne arıyorsan | Dosya |
|---|---|
| **Sadece iş üretmek istiyorum (sıfır bağlam)** | **`SKILLS.md`** |
| Şu an neredeyiz, sıradaki adım ne | `DURUM.md` |
| Neden böyle yapıyoruz | `KARARLAR.md` |
| Neye uymak zorundayım | `KURALLAR.md` |
| Sistem nasıl çalışıyor (ayrıntı) | `docs/ANAYASA.md` |
| Bu adımda tam olarak ne yapılacak | `docs/fazlar/FAZ-<N>.md` |
| Geliştirme döngüsü nasıl işliyor | `docs/LOOP.md` |
| Agent olarak ne bilmeliyim | `CLAUDE.md` |

## Klonladın, ne yapacaksın

```
just setup     # araç zinciri + ÜRETİM ÖNKOŞULLARI; eksiği ADIYLA söyler ve kurar
```

`just setup` yeşilse üretebilirsin. **En kısa yol paneldir:**

```
just dev       # http://localhost:5173 — tür seç, başlat, her kapıda onayla, canlı izle
```

Panel gizli anahtarları kendisi açar (`sops`); ayrıca sarmalamana gerek yok. Aynı işi
komut satırından da yapabilirsin:

```
sops exec-env secrets/secrets.enc.yaml 'just uret instagram-karosel "<konu>"'
sops exec-env secrets/secrets.enc.yaml 'just uret instagram-karosel --konu-sec'
just duzenle   # çıktıyı ya da şablonu elle düzelt (http://localhost:4321)
```

Tek ekranlık kullanım kılavuzu: **`SKILLS.md`**. Ayrıntı istemiyorsan başka bir şey
okumana gerek yok.

## Geliştirirken

```
just check     # biçim, tip, lint, kapılar — commit öncesi
just verify    # tam doğrulama: kapılar + testler + golden
just tur       # döngünün sıradaki adımını ve okunacakları getirir
```

## Ne depoda, ne değil

| Depoda | Depo dışında |
|---|---|
| `corpus/` bilgi kayıtları, `brand/` marka kiti | üretilmiş PNG'ler (`derived/blobs`, içerik adresli) |
| Şablon kataloğu (`packages/render/src/katalog-ornek.ts`) | koşu görselleri (`derived/runs/*/gorsel-*.png`) |
| Koşu defterleri ve **kompozisyonlar** (`panorama.json`) | 1 GB'lık arka plan silme modeli (ilk koşuda iner) |

Ayrım tekrar üretilebilirlik: metin ve kompozisyon izlenir, pikseller izlenmez (D-302).
Bu yüzden takım arkadaşın klonladığında **geçmişi tam** alır — hangi koşuda ne
üretildiği, hangi şablonun seçildiği ve neden, hepsi defterde.
