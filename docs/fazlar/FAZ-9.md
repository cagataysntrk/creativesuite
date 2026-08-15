# FAZ 9 — Sürekli denetim (bitiş yok)

**Amaç:** Sekiz faz kapandıktan sonra döngü durmaz; turlar denetim moduna geçer.
**Yöneten kararlar:** D-20
**Ön koşul:** FAZ 8 kapalı
**Çıkış kriteri:** **YOK.** Bu faz kullanıcı açıkça durdurana kadar sürer (LOOP§A).

> **Adımlar tiklenmez, DÖNGÜSEL koşar.** Her tur aşağıdakilerden **birini** ilerletir ve
> `DURUM.md`'ye bir satır bırakır. Bir tur tipi bittiğinde kapanmaz; sıraya geri girer.
> Tik kutusu **son koşulduğu tarihi** taşır, tamamlanmayı değil.

---

## 9.1 — Spec drift turu    [ ]

📖 §9.1, §8.7
🔗 FAZ-7.1
🛠 Platform ölçüleri, sağlayıcı fiyatları, model emeklilikleri. `verifiedAt` üç aydan
   eskiyse **yenilenir**; yenilenemiyorsa satır çürümüş işaretlenir. Bilinen ölüm
   tarihleri kayıtta durur (Imagen 4 · gpt-image-1 · Sora Videos API) — sürpriz
   emeklilik, çalışan bir pipeline'ın sessizce durmasıdır.
📁 `packages/channels/src/specs/` · `registry/providers/_pricing/`
✅ Turda en az bir `verifiedAt` tazelendi ya da hiçbirinin eskimediği kanıtlandı
🧪 Bir fiyat anlık görüntüsünü eskit → `doctor` işaretliyor
💾 `chore(specs): spec drift turu` · `Refs: FAZ-9.1 · §9.1`

## 9.2 — Kural uyum turu — kasten ihlal ederek    [ ]

📖 §15, §2 · R-71
🔗 FAZ-0.C.3
🛠 `KURALLAR.md`'deki **her BLOCKING kuralın** zorlaması hâlâ çalışıyor mu — yeşil test
   yeterli değil, **kasten ihlal edilerek** doğrulanır (R-71). Bu turun varlık sebebi
   somut: `repo-hygiene` bir kez gerçek anahtarı tirede durduğu için kaçırdı ve kapı
   yeşil raporluyordu (D-49); `attributes` darboğazı iki satıra bölünerek atlatıldı (D-77).
📁 `scripts/gates/` · `chokepoints.json`
✅ Her BLOCKING kural için bir ihlal denendi ve **kırmızıya döndüğü görüldü**
🧪 Turun kendisi bir ihlal testidir; ihlali geri almayı unutan tur, `git status` kirli
   bırakır ve `just save` reddeder
💾 `test(gates): kural uyum turu` · `Refs: FAZ-9.2 · §15`

## 9.3 — Bilgi tazeliği turu    [ ]

📖 §5.5, §5.1 · R-12, R-32
🔗 FAZ-2.5
🛠 `re_verify_by` geçmiş kayıtlar · süresi dolmuş kanıtlar · çelişki kuyruğu ·
   `generalisation_note`'suz dönem-aşırı kanıt. Emeklilik silme değildir (R-12):
   kayıt `expired_at` alır, dosya kalır, tarihsel denetim `:as_of` ile hâlâ mümkün.
📁 `corpus/` · `apps/ui/src/screens/health/`
✅ Çürümüş kayıtların hepsi ya tazelendi ya emekliye ayrıldı; kuyruk boş
🧪 `re_verify_by`si geçmiş bir kaydı retrieval'a sokmayı dene → yüklem getirmiyor
💾 `chore(corpus): bilgi tazeliği turu` · `Refs: FAZ-9.3 · §5.5`

## 9.4 — Maliyet turu    [ ]

📖 §8.3, §13 · D-17
🔗 FAZ-4.12
🛠 Tahmin vs gerçek sapması **%20 üstü** olan sağlayıcılar · kullanılmayan premium
   varlıklar (para harcandı, değer alınmadı) · bedava kota kullanım oranı. Sapan bir
   tahmin, `just plan`ın gösterdiği sayıyı yalana çevirir ve onay kararını bozar.
📁 `derived/runs/` · `apps/ui/src/screens/budget/`
✅ Sapan sağlayıcıların maliyet formülü düzeltildi ya da sağlayıcı devre dışı bırakıldı
🧪 Formülü kasten bozuk bırak → tur onu bir sonraki koşuda yine yakalıyor
💾 `chore(providers): maliyet sapma turu` · `Refs: FAZ-9.4 · §8.3`

## 9.5 — Ölü kod ve bağımlılık turu    [ ]

📖 §16, §3.8 · R-75
🔗 FAZ-1.11
🛠 Kullanılmayan sağlayıcı tanımlayıcıları · ölü şablonlar · **çağıranı olmayan modüller**
   · lisansı değişmiş bağımlılıklar. Somut geçmiş: `validateVerbOutput` belgede "motor
   çağırır" yazıyordu, `grep` yalnız tanımı buldu (D-69); `log.ts` ve `paths.ts` bir tur
   boyunca hiç çalıştırılmadı. **Belgelenmiş ölü kod, en pahalı yalandır.**
📁 `packages/` · `registry/providers/`
✅ Her ölü bulgu ya silindi ya bir faz adımına bağlandı · lisans değişikliği `KARARLAR.md`'de
🧪 Sahte bir `export` ekle ve çağırma → tur onu bulup listeliyor
💾 `chore(repo): ölü kod ve bağımlılık turu` · `Refs: FAZ-9.5 · §16`

## 9.6 — Kapsam turu    [ ]

📖 §19, §17
🔗 FAZ-0.B.1
🛠 `docs/research/` **`ctx_search` ile** taranır: araştırmada olup sistemde karşılığı
   olmayan yetenek var mı? Varsa yeni bir faz adımı açılır; **bilinçli reddedildiyse**
   §17'ye gerekçesiyle yazılır. Sessizce düşen bulgu olmaz — 75 denetim bulgusunun
   tek tek kapatılması (0.B.10) bu turun prototipiydi.
📁 `docs/research/` · `docs/ANAYASA.md` §17
✅ Tur, bulduğu her boşluk için ya bir adım ya bir ret kaydı üretti
🧪 Bilerek bir yeteneği listeden düşür → sonraki tur onu yeniden buluyor
💾 `chore(docs): kapsam turu` · `Refs: FAZ-9.6 · §19`
