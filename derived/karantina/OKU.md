# Karantina — yayınlanamaz varlıklar

Buradaki byte'lar **onaylanmamış corpus'tan** üretildi (D-134: `uret.mjs` retrieval
yüklemini atlayıp yedi `status: draft` kaydı üretime sokuyordu) ve bağlı oldukları
manifest'ler sahte `corpusCommit: "worktree"` taşıyor (D-138, D-155).

Sistemin kendi kuralı gereği bu varlıklar **asla yayınlanamaz**: R-14 (agent önerir,
insan uygular) çiğnenerek üretildiler ve §13'ün "manifest bir çalıştırmanın tek kanıtıdır"
şartını karşılamıyorlar.

**Silinmediler, taşındılar.** İki sebep:
1. Yayınlanamaz byte'ları yayınlanabilir depoda (`derived/blobs`) tutmak, `compliance`
   kapısını kalıcı kırmızıda bırakırdı — ve kalıcı kırmızı bir kapı, kapatılan kapıdır.
2. Silmek, bir kural ihlalinin kanıtını yok etmek olurdu. Çalıştırma defteri
   (`derived/runs`) zaten korunuyor (R-52); bu dosyalar onun görsel karşılığı.

`compliance` kapısı `derived/blobs/**` tarar, burayı taramaz — karantina bir depo değil,
bir arşivdir.
