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

## Kurulum

```
just setup     # araç zinciri kontrolü + bağımlılıklar
just check     # biçim, tip, lint, kapılar
just verify    # tam doğrulama: kapılar + testler + golden
```

## Durum

FAZ 0 — ön hazırlık. Henüz üretim yapmıyor.
