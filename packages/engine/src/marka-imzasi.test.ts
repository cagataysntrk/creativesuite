// Üretilen karosel marka işareti TAŞIYOR mu (R-92 · D-321).
//
// ⚠ ⚠ **ÜRETİLEN HİÇBİR KAROSEL İMZA TAŞIMIYORDU.** Dosyalar `brand/<id>/logo/` altında
// duruyordu, `logoVarliklari()` yazılmış ve test edilmişti — ama tek çağıranı
// `scripts/duzenleyici.mjs`, yani EDİTÖR ÖNİZLEMESİ. `uret.mjs` içinde `logo` kelimesi
// hiç geçmiyordu ve `panorama.ts` "verilmezse imza BASILMIYOR" diyordu.
//
// ⚠ Bu, bu depoda tekrar eden zincir kopukluğunun bir örneği daha: **modül var, test
// yeşil, üretim yolu yok.** Aynı sınıf D-182, D-190, D-224, D-250, D-261, D-270'te
// kayıtlı. Bu dosya zinciri sınıyor, modülü değil.

import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { logoVarliklari, ORNEKLER, panoramaHtml, type PanoramaBelgesi } from '@suite/render'

const REPO = join(import.meta.dirname, '../../..')
const DAMGA = {
  brandId: 'brd_upcytech',
  eraId: 'era_t',
  kitVersion: 'k',
  definitionDigest: 'sha256:x',
  contextManifest: 'x',
  sourceRunId: 'run_t',
}

describe('marka imzası üretim yolunda', () => {
  it('marka logosu diskten OKUNABİLİYOR — dosyalar yerinde', () => {
    const r = logoVarliklari(join(REPO, 'brand/brd_upcytech/logo'))
    expect(r.ok).toBe(true)
    if (!r.ok || r.varliklar === undefined) return
    // Veri URI: harici yükleme YOK. Ağsız bir kurtarma diskinde de imza basılır.
    expect(r.varliklar.koyu).toMatch(/^data:image\/png;base64,/)
    expect(r.varliklar.acik).toMatch(/^data:image\/png;base64,/)
  })

  it('logo VERİLİNCE panorama onu çiziyor', () => {
    const o = ORNEKLER['sahne']
    expect(o).toBeDefined()
    if (o === undefined) return
    const lg = logoVarliklari(join(REPO, 'brand/brd_upcytech/logo'))
    expect(lg.ok).toBe(true)
    if (!lg.ok || lg.varliklar === undefined) return
    const html = panoramaHtml({
      ...o,
      tokenCss: '',
      stamp: DAMGA,
      logo: lg.varliklar,
    } as unknown as PanoramaBelgesi)
    // ⚠ Künye şeridindeki logo KALKTI (marka karosel başına tam iki kez); sahiplik
    // işareti artık kapakta duruyor.
    expect(html).toContain('class="kapak-isaret"')
  })

  it('logo VERİLMEZSE imza sessizce KAYBOLUYOR — kopuk zincirin belirtisi', () => {
    // ⚠ Bu iddia bir kusuru değil, KOPUKLUĞUN BEDELİNİ ölçüyor: `logo` alanı boş
    // geçildiğinde çıktı hatasız üretiliyor ve imzasız kalıyor. Üretim yolu bu alanı
    // doldurmadığı sürece hiçbir test kırmızı olmuyordu — bu satır o sessizliği
    // görünür kılıyor.
    const o = ORNEKLER['sahne']
    if (o === undefined) return
    const html = panoramaHtml({ ...o, tokenCss: '', stamp: DAMGA } as unknown as PanoramaBelgesi)
    expect(html).not.toContain('class="kapak-isaret"')
  })

  // ⚠ ⚠ **ZİNCİR SINANIYOR: üretim betiği logoyu GERÇEKTEN yüklüyor mu.** Modülün
  // çalıştığını yukarıda gösterdik; asıl soru onu ÇAĞIRAN var mı. Kaynak metni
  // okumak kaba ama zincirin kopukluğu tam olarak burada yaşıyordu ve bir davranış
  // testi onu göremezdi — `uret.mjs` bir CLI, import edilip çağrılamıyor.
  it('üretim betiği `logoVarliklari` ÇAĞIRIYOR — modül değil ZİNCİR sınanıyor', () => {
    const kaynak = readFileSync(join(REPO, 'scripts/uret.mjs'), 'utf8')
    const cagri = kaynak
      .split('\n')
      .filter((s) => !s.trim().startsWith('//'))
      .some((s) => s.includes('logoVarliklari('))
    expect(cagri).toBe(true)
    // Ve sonucu COMPOSE'a geçiyor: çağırıp kullanmamak da bir kopukluk.
    expect(kaynak).toContain('logo: markaLogo')
  })
})
