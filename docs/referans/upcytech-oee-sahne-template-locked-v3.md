# Referans — UpcyTech OEE / SAHNE TEMPLATE-LOCKED V3

Bu kayıt, **Chat Agent Carousel Protocol V2 — TEMPLATE LOCKED** için ilk referans uygulamadır.

## Dondurulmuş şablon

- katalog ailesi: `sahne`
- kaynak run: `run_01a03afc-7d73-7e8c-a3b8-feb91909204f`
- kaynak panorama blob: `74fd57ce5e7d11c6f815ee265d771e3cf9767e55`
- tuval: 1080×1440
- kart: 4
- zemin: `var(--ramp-palet-murekkep-taban)`
- aksan: `var(--ramp-palet-murekkep-mavi)`
- yerleşim: `orta`
- kolon ritmi: sol / sağ / sol / sağ
- kart 2: `aksanRolu=alan`, `aksanDibi=49`
- bant: `olcek`, y=93
- duraklar: 12 / 37 / 62 / 87
- görsel slotları:
  - x=15, y=13, w=20, h=80
  - x=65, y=13, w=20, h=80

Bu değerler içerik için değiştirilmez.

## Kullanılan içerik

1. **TEŞHİS** — “OEE düştü. İlk soru: hangi kayıp?”
2. **AYRIŞTIR** — “OEE = A × P × Q”
3. **KIRILIM** — “Ortalamayı parçalayın”
4. **DOĞRULA** — “Korelasyonu neden sanmayın”

Dima yalnız final kartın gövdesinde, yöntemin uygulanma katmanı olarak anlatılır.

## Görsel kural

Hazır şablondaki iki kesik görsel yuvası kullanılır. Yeni buton, emoji, chip, badge, panel,
mini dashboard veya ikon sistemi eklenmez.

AI görseller yalnız **asset** olarak kullanılabilir; yazı/UI içeren tam poster üretimi doğrudan
kullanılmaz. Bu koşuda AI üretimlerinden ayrıştırılmış, arka planı temizlenmiş mekanik 3B
asset'ler iki mevcut yuvaya yerleştirildi.

## QA sonucu

- arka plan ve şablon yapısı korunuyor;
- metin taşması yok;
- yapay UI/buton/emoji yok;
- seamless görsel kesimleri 1↔2 ve 3↔4 korunuyor;
- 4 slayt tek tek görsel olarak kontrol edildi;
- panorama/contact sheet ayrıca kontrol edildi.

Sonraki ChatGPT oturumu bu referansı, şablonu “yeniden tasarlamak” için değil,
**aynı davranışı tekrar etmek** için kullanmalıdır.
