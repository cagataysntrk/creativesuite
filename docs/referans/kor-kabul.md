# Kör kabul defteri

<!-- ÜRETİLMİŞ — `node scripts/kor-kabul.mjs <dizin>`. Elle düzenleme kaybolur. -->

Yargıç **kör**: iki taraf da gramersiz promptla, karıştırılmış sırada ve
etiketsiz dosya adlarıyla puanlandı. Beklenen sonuç üstünlük değil **aynı aralık**.

Her görsel **3 kez** puanlandı; tabloda **medyan** ve **yayılım** var.
Tek koşu bir ölçüm değildir: aynı görsel iki koşuda 0,5 puana kadar fark aldı.

| Kaynak | Görsel | Medyan (0–5) | Yayılım | Koşular |
|---|---|---|---|---|
| referans | `ornek-1.jpg` | 2.83 | 1 | 3.67, 2.83, 2.67 |
| bizim | `s4.png` | 3.5 | 0.5 | 3.33, 3.83, 3.5 |
| bizim | `s3.png` | 4 | 0.5 | 3.83, 4, 4.33 |
| bizim | `s2.png` | 4 | 0.33 | 3.67, 4, 4 |
| bizim | `s1.png` | 3.83 | 0.67 | 3.33, 3.83, 4 |
| bizim | `s0.png` | 4 | 0.67 | 4, 3.5, 4.17 |
| referans | `ornek-5.jpg` | 3.17 | 0.66 | 3.17, 2.67, 3.33 |
| referans | `ornek-4.jpg` | 3 | 1.5 | 1.83, 3.33, 3 |
| referans | `ornek-3.jpg` | 3.83 | 1.33 | 4, 3.83, 2.67 |
| referans | `ornek-2.jpg` | 2.33 | 1 | 2.33, 1.5, 2.5 |

**Bizim aralık:** 3.5–4 · 
**Referans aralık:** 2.33–3.83

✅ **Aynı sınıftayız** — aralıklar örtüşüyor.

⚠ Bizimki daha YÜKSEK çıkarsa bu iyi haber değildir: yargıcın bizim şablonumuza
aşırı uyduğunun işareti olabilir ve o durumda sınanacak şey yargıçtır.

⚠ **Yargıcın kendi gürültüsü:** en büyük yayılım **1.5** puan.
İki grup arasındaki fark bu gürültüden küçükse, fark ÖLÇÜLMÜŞ sayılmaz.
