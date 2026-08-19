// Katalog briefleri R-20 muhafızından GEÇİYOR mu (§7.2 · R-20).
//
// ⚠ ⚠ **BU DİZELER MODELE GİDİYOR ve model onları YANKILIYOR.** Katalog kaydındaki
// `briefTemeli`/`varyantlar` doğrudan brief istemine giriyor; brief'i yazan model
// talimattaki kelimeleri çıktısına kopyalıyor ve o çıktı görsel prompt'u oluyor.
// Bu depoda iki kez oldu: `lettering` yankılandı ve `IMAGE_PROMPT_REJECTED` geldi,
// `no texture` içindeki `no text` alt dizesi brief'i reddettirdi.
//
// Üçüncüsü BURADA yazılıydı ve kimse ölçmüyordu: `editoryal` şablonunun brief'i
// *"right half of the frame left empty for typography"* diyordu — `typography` R-20
// yasak listesinde. O şablon üretime girdiği gün görsel adımı reddedilecekti.
//
// ⚠ Ölçüm KOPYA bir listeyle değil, GERÇEK muhafızla yapılıyor: kuralın kendisi
// `buildImagePrompt` içinde ve ikinci bir kopya, iki ayrı gerçek demektir.

import { describe, expect, it } from 'vitest'
import { KATALOG } from '@suite/contracts'
import { buildImagePrompt } from './prompt.js'

interface BriefParcasi {
  readonly id: string
  readonly metin: string
}

const parcalar: readonly BriefParcasi[] = KATALOG.flatMap((s) =>
  s.gorsel === null
    ? []
    : [
        { id: `${s.id} · briefTemeli`, metin: s.gorsel.briefTemeli },
        ...(s.gorsel.varyantlar ?? []).map((v, i) => ({
          id: `${s.id} · varyant ${String(i + 1)}`,
          metin: v,
        })),
      ]
)

describe('katalog briefleri', () => {
  it('kataloğun görselli şablonları ölçülüyor — liste BOŞ değil', () => {
    // ⚠ Boş bir `it.each` sessizce yeşil geçer: ölçüm yapılmadığında da "kusur yok"
    // görünür. Bu depoda tam olarak bu sınıftan hatalar var.
    expect(parcalar.length).toBeGreaterThan(4)
  })

  it.each(parcalar)('$id muhafızdan geçiyor', ({ metin }) => {
    const r = buildImagePrompt(metin, 'cor_katalog_test')
    expect(r.ok ? null : r.error.code).toBeNull()
  })

  it('yüzeyler SADE isteniyor — kadran uydurma rakamla dolmasın', () => {
    // ⚠ ⚠ Gerçek koşu: `run_01a01876`in 2. slaydında model bir kadran çizdi ve üstünü
    // uydurma rakamlarla doldurdu. `NO_TEXT_SUFFIX` prompt'ta VARDI — olumsuzlama
    // görsel modelinde zayıf bir garantidir. Garanti özne SEÇİMİNE gömülüyor.
    for (const p of parcalar.filter((x) => x.id.includes('briefTemeli'))) {
      expect(p.metin).toMatch(/plain and unmarked/)
    }
  })
})
