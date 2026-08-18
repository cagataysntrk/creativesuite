// Çalıştırma parametreleri — **TEK yerde** hesaplanır (§13 · R-07 · D-308 · D-191).
//
// ⚠ ⚠ **BU MODÜL, PANELDEN BAŞLATMANIN HİÇ ÇALIŞMAMASININ SEBEBİDİR.**
//
// Plan özeti adım `constraints`larını kapsıyor (freeze.ts), çalıştırma parametreleri
// de o constraints'lere karışıyor. `scripts/uret.mjs` `topic`, `son_kullanilan` ve
// `kacinilacak` ekliyordu; sunucunun launcher'ı HİÇBİRİNİ eklemiyordu. Sonuç: panel
// bir özete onay alıyor, CLI başka bir özet hesaplıyor ve R-07 kapısı — doğru
// biçimde — çalıştırmayı reddediyordu:
//
//     ✗ plan DEĞİŞTİ — onayladığınız plan artık geçerli değil (R-07)
//
// Kapı haklıydı, veri yanlıştı. İki ayrı yerde hesaplanan bir şey iki farklı sonuç
// verir; bu yüzden hesap buraya alındı ve İKİ çağıran da buradan okuyor. Aynı ders
// `saglayiciOrtami`nde (D-237) bir kez öğrenilmişti: elle sayılan her liste ayrışır.
//
// ⚠ Bu modül DOSYA OKUR ve bu bilinçli: parametreler geçmişten türüyor. Ama okuma
// **plan anında bir kez** olur ve sonuç plana DONAR — çalışma anında yeniden okumak,
// aynı planın iki farklı zamanda farklı şablon seçmesi demekti (D-308) ve replay'i
// (R-07) bozardı.

import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { RUNS_DIR } from '@suite/kernel'
import { parseLedger } from '../discovery/index.js'
import { gecmisiOku } from './gecmis.js'

export interface KosuParamGirdisi {
  readonly repoRoot: string
  /** Karar defterinin sahibi: `brand/<brandId>/decisions.jsonl`. */
  readonly brandId: string
  /** Boş olabilir — konusuz çalıştırmada hat konuyu kendi seçer. */
  readonly konu: string
  /** `--url`, `--demo-ref` gibi serbest parametreler. */
  readonly serbest?: Readonly<Record<string, string>>
}

/** Geçmişten okunan şablon sayısı — üçten fazlası seçimi imkânsız daraltır. */
const GECMIS_TAVANI = 3

/** Prompt'a giren red gerekçesi sayısı: hepsi girseydi prompt geçmişin çöplüğü olurdu. */
const RED_TAVANI = 5

/**
 * Geçmiş kapı redlerinin gerekçesi — **negatif kısıt** (§12.9 · D-191).
 *
 * Yalnız kapı redleri (`/gate/…`): keşif redleri corpus kayıtlarına ait ve kreatif
 * prompt'a girmeleri anlamsız olurdu.
 */
export const kacinilacakGerekceler = (repoRoot: string, brandId: string): string => {
  const yol = join(repoRoot, `brand/${brandId}/decisions.jsonl`)
  if (!existsSync(yol)) return ''
  const d = parseLedger(readFileSync(yol, 'utf8'))
  const gerekceler = d.ledger.entries
    .filter((e) => e.kind === 'rejected' && e.pointer.startsWith('/gate/') && e.reason !== '')
    .slice(-RED_TAVANI)
    .map((e) => e.reason)
  return [...new Set(gerekceler)].join(' · ')
}

/**
 * Planın göreceği çalıştırma parametreleri.
 *
 * ⚠ Boş değer HİÇ eklenmiyor: boş bir `kacinilacak` prompt'a anlamsız bir başlık
 * ekler, boş bir `topic` ise özete `""` olarak girip panelin özetiyle CLI'nin
 * özetini yine ayrıştırırdı.
 */
export const kosuParametreleri = (g: KosuParamGirdisi): Readonly<Record<string, string>> => {
  const sonKullanilan = gecmisiOku(join(g.repoRoot, RUNS_DIR), GECMIS_TAVANI).sablonlar.slice(
    0,
    GECMIS_TAVANI
  )
  const kacinilacak = kacinilacakGerekceler(g.repoRoot, g.brandId)
  return {
    ...(g.serbest ?? {}),
    son_kullanilan: sonKullanilan.join(','),
    topic: g.konu,
    ...(kacinilacak === '' ? {} : { kacinilacak }),
  }
}
