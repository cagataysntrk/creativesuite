# Referanstan türetilen şablon parametreleri

> **ÜRETİLMİŞ** — `node scripts/sablon-turet.mjs` (FAZ-10.6). ÖNERİDİR, uygulanmadı.

**Kaynak:** `docs/research/referans/karosel-sablon.png` · 196 alan geçişi

## Ölçülen: alan sınırı bandı

| Bölge | Geçiş | En sol | Ortanca | En sağ |
|---|---|---|---|---|
| sol çift | 66 | %27.4 | %43.6 | %78 |
| merkez | 73 | %1.7 | %97.2 | %97.2 |
| sağ çift | 57 | %12.6 | %71.3 | %82.6 |

## Öneri ve yürürlükteki değer

| Parametre | Referanstan | Yürürlükte | Fark neden |
|---|---|---|---|
| `bantMin` | %— | %69 | Türkçe metin sütunu %62 olmak zorunda; referans İngilizce ve daha dar sütunla idare ediyor |
| `bantMax` | %— | %78 | aynı |

⛔ **BANT TÜRETİLEMEDİ.** Ham aralık %2–97, genişliği
95 puan — makullük tavanı 40. Bir eğri
bandının anlamı sınırın DAR bir aralıkta salınmasıdır; bu genişlik "her yerde"
demek. Sebep 10.2'de ölçülmüştü: yan slaytlar piksel piksel bitişik (tam zemin
renginde **0/800** sütun), yani bölge ≠ slayt. Ölçüm iki slaydın eğrilerini ve
slayt kenarlarını birbirine karıştırıyor.

**Sayı yazılmadı.** Yazılsaydı kaynağı unutulduğunda ölçüm sanılırdı — bu fazda
aynı hata altı kez tekrarladı ve her seferinde ancak kasten kontrol edince çıktı.

## Referanstan TÜRETİLEMEYEN — ve neden

**Punto tavanı ve tip ölçeği:** dilden geliyor, referanstan değil. Referansın
`Showcase`ı 8 karakter, bizim `taşıyabileceğimizin` 19. İngilizce bir görselden
ölçülen punto Türkçe metinde taşar (`docs/referans/tip-olcegi.md`).

**Yan slaytların bireysel sınırı:** 10.2'de ölçüldü ve REDDEDİLDİ — 800×320'de tam
zemin renginde **0/800** sütun var, yani yan slaytlar piksel piksel bitişik. Bant bu
yüzden slayt genişliğine değil BÖLGE genişliğine göre veriliyor; belirsizlik ±%5.
