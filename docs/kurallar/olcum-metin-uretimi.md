# Ölçüm: gönderi metni üretimi neden bu kadar sürüyor (2026-08-27)

Depo sahibi sordu: *"metin üretimi neden bu kadar yavaş?"* R-78: ölçmeden
hızlandırma yok. Aşağıdaki sayıların hepsi bu makinede, bu depoda alındı.

## Parçalar

| Parça | Süre | Ölçüm |
|---|---|---|
| `tsc -b` (her şey derli) | **0,14 sn** | `time ./node_modules/.bin/tsc -b` |
| Modül yüklemesi (kernel+engine+providers+render) | **0,33 sn** | kernel 65 ms · engine 213 ms · ötekiler 0 ms |
| `claude` CLI tabanı — sonnet-5, dört jetonluk cevap | **5,9 sn** | `duration_api_ms` 2,0 sn → **~3,9 sn CLI'nin kendisi** |
| `claude` CLI tabanı — haiku-4.5, aynı istem | **5,3 sn** | `duration_api_ms` 2,3 sn |
| Tam komut, tek platform | **11,8 sn** | `just yayin-metni --platform instagram` |
| Tam komut, iki platform TEK çağrıda | **15,0–20,1 sn** | `--platform instagram,linkedin` |

## Bulgu

**Bizim tarafımız 0,5 saniye.** Sürenin tamamına yakını `claude` CLI'sinde ve
ikiye ayrılıyor:

1. **Çağrı başına sabit ~4 sn.** CLI her çağrıda oturum bağlamını yeniden
   yüklüyor: dört jetonluk bir cevap için bile `cache_creation_input_tokens`
   21.875 + `cache_read_input_tokens` 24.432 ölçüldü. Yani ~46 bin jeton, istem
   daha görülmeden.
2. **Üretimin kendisi 10–15 sn.** İki metin, toplam ~1.100 karakter.

## Yapılan

Platform başına ayrı çağrı, o sabit maliyeti platform sayısı kadar ödüyordu
(2 × 11,8 ≈ **23,6 sn**). İstem zaten bir platform LİSTESİ alıyor; eksik olan
yalnızca virgüllü argümandı. Tek çağrıya indirildi: **20,1 sn** (uçtan uca,
panelden ölçüldü). Kazanç, ikinci CLI açılışının tamamı.

⚠ `--hepsi` ile aynı şey DEĞİL: o dört platformu da yeniden yazıyor ve elle
düzeltilmiş metni eziyor.

## Denenip ELENEN

**Haiku'ya geçmek yavaşlattı.** Aynı koşu, aynı iki platform: sonnet-5
**15,0 sn**, haiku-4.5 **56,5 sn**. Sebep düşünme jetonları — haiku dört
jetonluk *"ok"* cevabında bile 101 `thinking_tokens` harcadı. "Küçük model
daha hızlıdır" bir varsayımdı ve ölçüm onu çürüttü.

## Kalan tek gerçek kaldıraç

Sabit ~4 sn CLI açılışı, sağlayıcı yolu değişmeden gitmez. Doğrudan API çağrısı
o maliyeti sıfırlar ama faturayı ABONELİKTEN JETONA taşır — bu bir mimari
karar, bir optimizasyon değil (§8.1). Karar verilmeden yapılmadı.
