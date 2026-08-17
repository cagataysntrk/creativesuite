// HEDEF: packages/render/src/plan-denetim.ts
//
// Plan ile ÇIKTI uyuşuyor mu (FAZ-14.4 · §7.1 · D-255, D-259).
//
// **Üç katman AYRI kalır ve ayrımın yeri hata taksonomisidir:**
//   - **uyum** → `internal` / `PLAN_MISMATCH`. Render planı uygulamadı: bu bir HATADIR,
//     çıktı kalitesi meselesi değil. Kod bozuk.
//   - **metrik** → `policy_blocked` / `QA_OUT_OF_TOLERANCE`. Çıktı ölçülebilir biçimde
//     kabul edilemez. Kod doğru çalışıyor olabilir; sonuç yayınlanamaz.
//   - **estetik** → hata DEĞİL, rapor (FAZ-13.5).
//
// Aynı kovaya konsalardı ya estetik zorunlu olurdu ya bir render hatası "tolerans dışı"
// diye görülüp içerik suçlanırdı. FAZ-10'da tam olarak bu oldu: ölçenin hatası,
// ölçülenin hatası gibi göründü.
//
// ⚠ **Denetim ÜRETİLEN belgeye bakar** (D-259). `tasarimOlc` bir zamanlar yalnız kapının
// kendi kurgusuna bakıyordu ve üretim yolunda hiç koşmuyordu: *"kapı depoyu korur,
// çıktıyı korumaz."*

import type { DocumentModel, Islev } from '@suite/kernel'
import type { TasarimPlani } from '@suite/contracts'

/** Bir uyumsuzluk: plan ne diyordu, çıktı ne yaptı. */
export interface Uyumsuzluk {
  readonly alan: string
  readonly beklenen: string
  readonly bulunan: string
}

/** Görsel öge blokları — ürün ekran çekimleri HARİÇ (onlar plana tabi değil, iddiadır). */
const ogeSayilari = (doc: DocumentModel): { diyagram: number; gorsel: number } => {
  let diyagram = 0
  let gorsel = 0
  for (const b of doc.blocks) {
    if (b.type === 'diagram') diyagram += 1
    else if (b.type === 'image' && (b as { role?: string }).role !== 'product_screenshot')
      gorsel += 1
  }
  return { diyagram, gorsel }
}

const metinIslevleri = (doc: DocumentModel): readonly (Islev | undefined)[] =>
  doc.blocks
    .filter((b) => b.type === 'heading' || b.type === 'body')
    .map((b) => (b as { islev?: Islev }).islev)

/**
 * Planı çıktıyla karşılaştırır. Boş dizi = uyumlu.
 *
 * ⚠ **İNDEKS EŞLEŞTİRMESİ YAPILMIYOR ve bu kasıtlı.** Plan SATIR sırasına göre yazılıyor,
 * sayfalayıcı ise satırları slaytlara bölüyor; 6 satır 5 slayt olabiliyor. İndeks indekse
 * karşılaştırmak, bu fazda dört kez tekrarlanan birim uyuşmazlığının (D-260 ailesi)
 * beşinci biçimi olurdu. Onun yerine **sayılabilir ve konumdan bağımsız** şeyler
 * karşılaştırılıyor: kaç görsel öge var, hangi türden, işlev damgaları yerinde mi.
 */
export const planDenetle = (plan: TasarimPlani, doc: DocumentModel): readonly Uyumsuzluk[] => {
  const k: Uyumsuzluk[] = []
  const beklenenDiyagram = plan.slaytlar.filter((s) => s.oge.deger === 'diyagram').length
  const beklenenGorsel = plan.slaytlar.filter((s) => s.oge.deger === 'gorsel-yuvasi').length
  const bulunan = ogeSayilari(doc)

  if (bulunan.diyagram !== beklenenDiyagram)
    k.push({
      alan: 'diyagram sayısı',
      beklenen: String(beklenenDiyagram),
      bulunan: String(bulunan.diyagram),
    })

  // ⚠ Bu, fotoğrafın sessizce geri gelmesini yakalayan denetim. Fotoğraf varsayılan
  // olmaktan çıktı (D-261); plan yuva açmadıysa belgede görsel BULUNMAMALI.
  if (bulunan.gorsel !== beklenenGorsel)
    k.push({
      alan: 'görsel yuvası sayısı',
      beklenen: String(beklenenGorsel),
      bulunan: String(bulunan.gorsel),
    })

  // İşlev damgası: ölçüm bunun üstünde duruyor (FAZ-14.1). Damgasız blok, bütçesini
  // slayt sırasından türetmeye geri döner ve o yol gerçek bir koşuda yanlış ölçtü.
  const islevler = metinIslevleri(doc)
  const damgasiz = islevler.filter((i) => i === undefined).length
  if (damgasiz > 0)
    k.push({
      alan: 'işlev damgası',
      beklenen: `${islevler.length} metin bloğunun hepsi damgalı`,
      bulunan: `${damgasiz} damgasız`,
    })

  // Yayın uçları: kanca ilk, davet son. Orta esnek (kanıt tekrarlanır), uçlar SABİT.
  const damgali = islevler.filter((i): i is Islev => i !== undefined)
  if (damgali.length > 0) {
    if (damgali[0] !== 'kanca')
      k.push({ alan: 'yay başı', beklenen: 'kanca', bulunan: String(damgali[0]) })
    const son = damgali[damgali.length - 1]
    if (son !== 'davet') k.push({ alan: 'yay sonu', beklenen: 'davet', bulunan: String(son) })
  }

  return k
}

/** Tek satırlık insan okuru özet — hata gövdesine giriyor. */
export const uyumsuzlukOzeti = (k: readonly Uyumsuzluk[]): string =>
  k.map((x) => `${x.alan}: beklenen ${x.beklenen}, bulunan ${x.bulunan}`).join(' · ')
