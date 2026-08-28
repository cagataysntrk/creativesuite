# Ödünç alınan kod — künye

⚠ ⚠ **BURADAKİ HİÇBİR DOSYA BİZİM DEĞİL.** Hepsi dışarıdan birebir alındı. Depo sahibi:
*"kodları gerekli yerleri birebir alalım, kafamıza göre olmasın, kolaylaştıralım işimizi
— zaten büyük iş, böyle şeyler varken faydalanalım."*

Bu dosya **Yasa 7'nin koda uygulanmış hâli**: her varlık üretim anında damgalanır.
Nereden geldiği bilinmeyen kod, bir yıl sonra ne güncellenebilir ne de düzeltilebilir.

## openmontage/

| alan | değer |
|---|---|
| kaynak | `github.com/calesthio/OpenMontage` |
| commit | `cd9f3c1f0336` |
| alındığı tarih | 2026-08-28 |
| lisans | AGPL-3.0 |
| alınan yol | `.agents/skills/` (seçili 24 beceri) |
| dosya | 463 · 12 MB |

**Ne alınmadı:** `examples/assets/` altındaki üç demo varlığı (iki mp4 + bir png,
toplam 37 MB) — gösteri malzemesi, işimize yaramıyor ve `repo-hygiene` kapısının
512 KB sınırını aşıyorlar.

**Lisans:** Depo private, dağıtım yok, ticari ürün yok. Sahibin kararı: *"agpl bizi
bağlamaz, biz zaten kendimize yapıyoz."* Kayıt için yazıldı.

### Ne işe yarıyor

| beceri | dosya | ne veriyor |
|---|---|---|
| `hyperframes-core` | 13 | **kompozisyon sözleşmesi** — `data-*` zamanlama, `class="clip"`, iz/klip, alt kompozisyon, determinizm kuralları |
| `hyperframes-animation` | 115 | animasyon çalışma zamanı adaptörleri (GSAP, Lottie, Three, WAAPI) + tasarım şablonları |
| `hyperframes-creative` | 67 | yaratıcı yön |
| `hyperframes-media` | 40 | medya yerleştirme, ses, video |
| `hyperframes-cli` · `-registry` | 17 | CLI ve kayıt defteri kullanımı |
| **`music-to-video`** | 132 | ⭐ **38 hareket ilkeli, HTML olarak** — `braam-punch`, `crash-zoom-in`, `mask-reveal`, `typewriter-reveal`, `chromatic-split`… |
| `motion-graphics` · `visual-style` | 39 | hareket grafiği ve görsel üslup kuralları |
| `playwright-recording` · `synthetic-screen-recording` | 3 | **yazılım tanıtımı** — ekran kaydı |
| `sound-effects` · `music` · `acestep` | 6 | ses efekti, müzik, yerel müzik üretimi |
| `text-to-speech` · `speech-to-text` | 8 | seslendirme ve altyazı |
| `ffmpeg` · `video-edit` · `video-toolkit` · `video-understand` | 8 | kodlama, kurgu, videoyu geri okuma |
| `media-use` · `create-video` · `web-design-guidelines` | 30 | medya kullanımı ve genel yön |

### ⚠ Olduğu gibi kullanılamaz — marka bağlanacak

38 ilkelin çoğu **gömülü renk ve font** taşıyor (`--hg-violet: #7c3aed`, `Inter`).
Bunları olduğu gibi kullanmak markayı bozar — §4.1: *"marka token'ları varken gömülü
renk, marka değiştiğinde değişmeyen bir pikseldir."*

Alınacak şey **hareketin kendisi** (zamanlama, easing, dönüşüm sırası); renk ve tipografi
`brand/brd_upcytech/derived-tokens/tokens.css`e bağlanacak. Bu, ilkeli sıfırdan yazmaktan
kat kat ucuz ve bu deponun `ui-tema` kapısı gömülü rengi zaten yakalıyor.

### Güncelleme

```
# yukarıdaki commit'ten sonrasını görmek için:
curl -s https://api.github.com/repos/calesthio/OpenMontage/commits/main | head -20
```

Güncellenirse bu dosyadaki commit değeri de güncellenir. **Değişmezse dokunulmaz** —
ödünç kodun sessizce sürüklenmesi, kimin ne değiştirdiğini bilinmez yapar.
