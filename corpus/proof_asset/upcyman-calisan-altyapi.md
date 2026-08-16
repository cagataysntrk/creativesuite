---
brand_id: brd_upcytech
schema_version: 1
kind: dna
locale: tr-TR
era_id: imalat-2026
created_at: 2026-08-16T18:45:00.000Z
source:
  kind: interview
  ref: kurucu röportajı — 2026-08-16 (FAZ-2.9, D-5 ikinci yarı)
  quote: null
tags: []
context_weight: 1
id: rec_proof_upcyman
type: proof_asset
confidence: 0.9
scope:
  channels: []
  verticals:
    - imalat
  personas: []
title: "UpcyMan: çalışan üretim altyapısı"
era_of_origin: geri-donusum
generalisation_note: "UpcyMan geri dönüşüm tesisleri için yazıldı ve asıl odağı orası. İmalat bağlamında YETENEK kanıtı olarak sunulur: kantardan satışa uçtan uca bir süreci canlı taşıyabildiğimizi gösterir. Bir imalat müşterisinin sonucu DEĞİLDİR ve öyle sunulamaz."
transfer_confidence: analogous
status: active
zone: generated
x_signature: sha256:45771020e9178b25f2eed0c08b92df6365da3b3bdf08eb4574f3fefbf2ab9623
approved_by: human
approved_at: 2026-08-16T17:53:18.590Z
valid_at: 2026-08-16T17:53:18.590Z
---

**Ne kanıtlıyor:** Uçtan uca bir tesis sürecini — kantardan satışa — canlı
taşıyan bir yazılımı yazdık ve çalışıyor. `upcyman.com` · `api.upcyman.com`.

**Neden bu kanıt önemli:** Konumumuz "veri katmanını da biz kurarız" diyor. Bu iddia
ancak veri katmanı kurabildiğimizi gösteren çalışan bir sistem varsa inandırıcı.
UpcyMan tam olarak o sistem ve **aynı zamanda kullandığımız araç**: verisi olmayan
firmada genelleştirilip veri katmanı olarak kuruluyor.

**Aktarım argümanı:** Geri dönüşüm tesisi ile imalat tesisi aynı şey
değil. Ortak olan şey **süreç bütünlüğü**: giriş ölçümü → işlem → stok → çıkış → satış.
Bu zincirin tamamını taşıyan bir yazılım yazmış olmak, imalatta da taşıyabileceğimizin
göstergesidir — **daha zor bir vaka olarak sunulur**, hazır bir referans olarak değil.

⚠ **Sayısal iddia YOK.** Kullanıcı sayısı, işlem hacmi, tasarruf iddiası — hiçbiri
yazılmadı. Kurucu röportajına göre yayınlanabilir gerçek müşteri sonucu henüz yok.
Kaynaksız bir sayı eklemek kaynaksız-iddia yasağını çiğner ve `lexicon` kapısı
reddeder.
