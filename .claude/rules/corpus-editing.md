---
paths: ["corpus/**", "brand/**"]
---

# Corpus ve marka verisi düzenlerken

Bu dosyalar **doğruluk kaynağıdır**. Kod değil, veri.

## Değişmezler

- **Bir dosya = bir kayıt.** Prose kötü merge olur; çelişki tek iddiada kalsın (R-12).
- **Kayıt silinmez.** `expired_at` + `superseded_by` yazılır, `status: retired` olur.
  Emeklilik silme değildir — eski varlıklar hâlâ o kayda atıf veriyor.
- **`brand_id` ve `era_id` zorunlu.** Damgasız kayıt hangi markanın hangi döneminden
  olduğunu kaybeder ve **sonradan retrofit imkânsızdır** (R-11).
- **Zarf alanları sistemindir, `attributes` senin.** Yeni bir alan gerekiyorsa
  `attributes` altına gider; zarfa alan eklemek kernel değişikliğidir (D-41).

## Agent isen

Doğrudan yazamazsın. `corpus.propose()` çağırırsın; kayıt `status: draft` iner ve
retrieval'a **görünmez**. Onay insanın git commit'idir (R-14, D-31).

## Commit

Yalnız `corpus/`, `brand/`, `derived/runs/` dokunuyorsa **çalıştırma commit'i**:
`Run: <run_id>` + `Actor: human|agent` + `Kind: propose|approve|discovery-apply`.
`Refs:` **kullanılmaz** — kapı reddeder.
