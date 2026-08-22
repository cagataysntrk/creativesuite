// Seçilen yayın anı — **insanın kararı**, koşunun defterinde (§11 · R-46 · FAZ-17.3).
//
// ⚠ ⚠ **NEDEN AYRI BİR DOSYA, NEDEN ÇALIŞTIRMA PARAMETRESİ DEĞİL.** Parametreler plana
// DONUYOR (R-07): koşu başlarken hesaplanan plan özeti onları kapsıyor ve devam
// ederken eklenen bir parametre özeti değiştirir — kapı haklı olarak *"onayladığınız
// plan artık geçerli değil"* der ve koşu ölür. Yayın anı ise koşu BAŞLARKEN değil,
// onay anında seçiliyor. İki farklı zamana ait iki farklı şey aynı kaba konamaz.
//
// ⚠ ⚠ **NEDEN `HumanDecision.note` DEĞİL.** Not serbest metin; oradan saat ayrıştırmak,
// insanın yazdığı cümleye bağlı bir yayın zamanı demekti. Karar yapılandırılmış
// olmalı ki makine onu okuyabilsin, insan da sonradan "ne seçmişim" diye bakabilsin.
//
// ⚠ Dosya koşu dizininde (`derived/runs/<id>/yayin-ani.json`), yani SİLİNMEZ (Yasa 11)
// ve git'te. "Bu karosel neden 20:00'de yayınlandı" sorusunun cevabı burada duruyor:
// seçilen an, seçen, seçim zamanı ve o an ekranda duran ÖNERİ.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { RUNS_DIR } from '@suite/kernel'

export interface YayinAniKaydi {
  /** İnsanın seçtiği an — ISO-8601 (yerel saat + ofset ya da UTC). */
  readonly an: string
  /** `human` — hat kendi kendine yazamaz. Alan, kaydın kimin olduğunu KODA yazar. */
  readonly secen: 'human'
  readonly secilenAt: string
  /**
   * Seçim anında ekranda duran öneri (ya da "veri yok" gerekçesi).
   *
   * ⚠ Öneriyi de saklıyoruz çünkü asıl soru "saat kaçtı" değil, **"insan neyi görerek
   * seçti"**. Öneri sonradan değişebilir; kararın dayanağı değişmemeli.
   */
  readonly oneri: string
}

/** Dosya yolu — koşu dizininin altında. Tek tanım: iki yol bir gün ayrışır. */
export const yayinAniYolu = (runId: string): string => `${RUNS_DIR}/${runId}/yayin-ani.json`

/**
 * Seçilen anı okur. Seçilmemişse `null`.
 *
 * ⚠ Bozuk dosya da `null` dönüyor: "okunamayan bir karar" ile "karar yok" burada
 * AYNI sonucu doğurmalı — ikisinde de yayın DURUR. Farkı yayınlama yönünde yorumlayan
 * bir dal, bozuk bir baytı yayın iznine çevirirdi.
 */
export const yayinAniOku = (repoRoot: string, runId: string): YayinAniKaydi | null => {
  const yol = join(repoRoot, yayinAniYolu(runId))
  if (!existsSync(yol)) return null
  try {
    const o: unknown = JSON.parse(readFileSync(yol, 'utf8'))
    if (o === null || typeof o !== 'object') return null
    const k = o as Record<string, unknown>
    if (typeof k['an'] !== 'string' || k['an'].trim() === '') return null
    if (k['secen'] !== 'human') return null
    return {
      an: k['an'],
      secen: 'human',
      secilenAt: typeof k['secilenAt'] === 'string' ? k['secilenAt'] : '',
      oneri: typeof k['oneri'] === 'string' ? k['oneri'] : '',
    }
  } catch {
    return null
  }
}

/**
 * Seçilen anı yazar — **yalnız insanın kararıyla çağrılır.**
 *
 * ⚠ `secen` alanı sabit `'human'`: hat bu dosyayı kendi adına yazamasın diye tip
 * düzeyinde kapalı. Bir gün otomatik bir yayınlayıcı yazılırsa, o dosyayı yazmak için
 * ÖNCE bu satırı değiştirmesi gerekir — ve o değişiklik bir karar (D-nn) gerektirir.
 */
export const yayinAniYaz = (
  repoRoot: string,
  runId: string,
  kayit: Omit<YayinAniKaydi, 'secen'>
): void => {
  const yol = join(repoRoot, yayinAniYolu(runId))
  mkdirSync(dirname(yol), { recursive: true })
  writeFileSync(yol, `${JSON.stringify({ ...kayit, secen: 'human' }, null, 2)}\n`)
}
