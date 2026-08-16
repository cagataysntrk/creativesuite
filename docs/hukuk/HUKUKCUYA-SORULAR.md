# Hukukçuya sorulacaklar — KVKK ve Reklam Kurulu

**Durum:** ⛔ bekliyor (FAZ-8.6 · V-10). **Metinler burada YAZILMAZ.**

## Neden bu dosya var, metin yok

KVKK metni **LLM'e yazdırılmayacak.** Kurul'un 2026/347 sayılı kararı geri
dönüştürülmüş şablonları açıkça cezalandırıyor: bir aydınlatma metni doğru
görünüp yanlış olabilir ve yanlışlığı ancak denetimde ortaya çıkar. **Yanlış bir
uyum metni, hiç olmamasından pahalıdır** — çünkü uyum sağlandığı izlenimi verir
ve o izlenim, sorulması gereken soruyu sordurmaz.

Bu dosya hukukçunun işini kolaylaştırmak için sistemin **ne yaptığını** anlatır
ve **somut sorular** sorar. Cevaplar geldiğinde metinler `docs/hukuk/` altına,
politika kayıtları `corpus/policy/` altına `zone: human` olarak iner.

## Sistemin gerçekte yaptığı işlemler

Soruların bağlamı — hukukçu bunu bilmeden doğru metin yazamaz.

| İşlem | Veri | Nerede durur | Ne kadar |
|---|---|---|---|
| Prospect araştırması | şirket adı, sektör, kamuya açık site metni | `derived/ingest/<domain>/` | süresiz |
| Prospect kaydı | firma bilgisi, **kişi adı/e-posta olabilir** | `corpus/prospect/` | süresiz |
| Yayın defteri | içerik özeti, kanal id'si | `derived/runs/` | süresiz, silinmez |
| Model çağrısı | brief metni, marka bilgisi | sağlayıcıda (yurt dışı) | sağlayıcı politikası |
| Insight ölçümü | toplu erişim/etkileşim sayıları | `derived/runs/` | süresiz |

**Silme mekanizması var:** `just kvkk-sil` kişisel alanları siler, kişisel veri
taşımayan bir mezar taşı bırakır (dosya kalmaya devam eder, `expired_at` +
`superseded_by`). Bu yaklaşımın KVKK'nın "silme" tanımını karşılayıp
karşılamadığı **soru 4**.

## Sorular

1. **Aydınlatma yükümlülüğü ne zaman doğuyor?** Prospect'in kamuya açık web
   sitesinden metin çekmek (otomatik, tek seferlik) bir "veri işleme" mi? Kişi
   verisi içermiyorsa da aydınlatma gerekiyor mu?
2. **Açık rıza gereken hâller.** B2B'de şirket e-postası (`info@`) ile kişisel
   e-posta (`ad.soyad@`) arasındaki fark KVKK açısından nedir?
3. **Sınır ötesi aktarım.** Model sağlayıcıları yurt dışında; brief metni
   şirket bilgisi taşıyor. Hangi beyan gerekiyor, nerede yayımlanmalı?
4. **"Silme" tanımı.** Kişisel alanları silip mezar taşı bırakmak yeterli mi,
   yoksa kaydın tamamı mı silinmeli? (Defterin türetilemez olması — D-38 —
   teknik bir kısıt: yayın kaydı silinirse yineleme koruması çöker.)
5. **Sayısal performans iddiaları.** "%40 fire azalması" gibi bir iddiayı
   yayımlamak için Reklam Kurulu açısından hangi kanıt seviyesi gerekiyor?
   Sistem her iddiayı `claim_source` ile kaynağa bağlıyor (R-32) — bu yeterli mi?
6. **AI ifşası.** EU AI Act Md. 50 uygulanıyor (2 Ağu 2026). Türkiye'de eş
   değer bir yükümlülük var mı? Reklam Yönetmeliği Md. 27/12 yalnız "onay ima
   eden yapay insan"ı yasaklıyor; AI ile üretilmiş **metin** için bir ifşa
   yükümlülüğü var mı?
7. **Saklama süresi.** `derived/runs/` append-only ve silinmiyor (yasa 11).
   Hangi kayıt türü için azami saklama süresi tanımlanmalı?

## Cevaplar geldiğinde

- Metinler `docs/hukuk/aydinlatma.md` ve `docs/hukuk/acik-riza.md`
- Politika kaydı `corpus/policy/` altına **`zone: human`** — LLM üretimi bir
  metni `zone: human` işaretlemek `x_signature` kapısında reddedilir (adımın
  🧪 kriteri)
- `V-10` kapanır, `8.6` tiklenir
