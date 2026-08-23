// Uyum kapsamı GERÇEK hat dosyalarına karşı ölçülüyor (D-232).
//
// Bu dosyanın varlık sebebi: `aiGenerated: false` sabiti yanındaki yorumla birlikte
// altı ay doğru göründü ve FAZ 8'de yanlış oldu. Bir yorum eskiyebilir; bir ölçüm
// eskiyemez — kırmızıya döner.

import { describe, expect, it } from 'vitest'
import { promptRequestsPerson } from '@suite/render'
import { join } from 'node:path'
import { listPipelines, loadPipeline, type Pipeline } from '@suite/registry'
import { assertCompliance } from '@suite/render'
import { kosudaGorselUretildi, taranacakPrompt, uyumKapsami } from './uyum-kapsami.js'

// Yol `join` ile parça parça kuruluyor: `registry/pipelines/` düz dizesi
// `yapilandirma-cozucu` darboğazının deseni ve tek yetkili yer `resolve.ts`.
// Okuma zaten `loadPipeline` üzerinden — yani darboğazın kendisinden.
const KOK = join(import.meta.dirname, '..', '..', '..', 'registry', 'pipelines')

const hat = (id: string): Pipeline => {
  const r = loadPipeline(KOK, id)
  expect(r.ok, JSON.stringify(r.ok ? [] : r.errors)).toBe(true)
  return (r as { ok: true; value: Pipeline }).value
}

// Hat listesi de darboğazdan (`listPipelines`): dosya adı desenini burada tekrar
// yazmak, yapılandırma çözücüsünün ikinci bir kopyasını doğururdu.
const tumHatlar = listPipelines(KOK)

describe('kapsam hattan okunuyor, sabitten değil', () => {
  it('`ad-creative-set` görsel üretiyor → aiGenerated TRUE', () => {
    const k = uyumKapsami(hat('ad-creative-set'))
    expect(k.aiGenerated).toBe(true)
    expect(k.adimlar).toContain('gorsel-uret')
  })

  it('görsel adımı olmayan bir hat FALSE — kapsam genişletilmedi', () => {
    const k = uyumKapsami({
      id: 't',
      title: 't',
      ciktiSinifi: 'organik',
      matris: null,
      retired: false,
      supersededBy: null,
      steps: [
        {
          id: 'metin',
          verb: 'GENERATE',
          capability: 'text.generate',
          constraints: {},
          needs: [],
          gate: null,
        },
      ],
    })
    expect(k.aiGenerated).toBe(false)
    expect(k.adimlar).toEqual([])
  })

  it('`audio.tts` görsel SAYILMIYOR — ayrı varlık, ayrı ifşa yüzeyi', () => {
    const k = uyumKapsami({
      id: 't',
      title: 't',
      ciktiSinifi: 'organik',
      matris: null,
      retired: false,
      supersededBy: null,
      steps: [
        {
          id: 'ses',
          verb: 'GENERATE',
          capability: 'audio.tts',
          constraints: {},
          needs: [],
          gate: null,
        },
      ],
    })
    expect(k.aiGenerated).toBe(false)
  })

  // ⚠ Bu test hat dosyalarını TARIYOR: yeni bir görsel hattı eklendiğinde burada
  // görünür. Sabit bir liste yazsaydım, listeye eklemeyi unutmak sessiz olurdu.
  it('görsel üreten HER hat listeleniyor — sayı ölçülüyor, iddia edilmiyor', () => {
    const gorselHatlar = tumHatlar.filter((id) => uyumKapsami(hat(id)).aiGenerated)
    expect(gorselHatlar.length).toBeGreaterThan(0)
    expect(gorselHatlar).toContain('ad-creative-set')
  })
})

describe('iddia zinciri: aiGenerated → disclosureRequired', () => {
  it('görsel üreten hatta Md. 50 ifşası ZORUNLU oluyor', () => {
    const k = uyumKapsami(hat('ad-creative-set'))
    const r = assertCompliance({
      basis: { kind: 'prompt_forbids_people', promptDigest: '' },
      aiGenerated: k.aiGenerated,
      prompt: taranacakPrompt(k, 'vardiya kayıplarını ölçmek'),
      correlationId: 'cor_test',
    })
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.value.aiGenerated).toBe(true)
    // **Bulunan kusur tam buradaydı:** sabit `false` bu satırı da `false` yapıyor,
    // `publish.ts` ifşa kapısını atlıyor ve IPTC yanlış beyan taşıyordu.
    expect(r.value.disclosureRequired).toBe(true)
  })

  it('boş prompt fail-closed: iddia KURULMUYOR', () => {
    const r = assertCompliance({
      basis: { kind: 'prompt_forbids_people', promptDigest: '' },
      aiGenerated: true,
      prompt: '   ',
      correlationId: 'cor_test',
    })
    expect(r.ok).toBe(false)
  })

  it('insan isteyen prompt reddediliyor — dayanak doğrulanabilir olmalı', () => {
    const k = uyumKapsami(hat('ad-creative-set'))
    const r = assertCompliance({
      basis: { kind: 'prompt_forbids_people', promptDigest: '' },
      aiGenerated: k.aiGenerated,
      prompt: taranacakPrompt(k, 'gülümseyen bir mühendis portresi'),
      correlationId: 'cor_test',
    })
    expect(r.ok).toBe(false)
  })
})

// ⚠ ⚠ **HAT KAPSAMI ÜST SINIRDIR, OLGU DEĞİL — ve bu ayrım gerçek bir koşuda ölçüldü.**
// `akan-alan` şablonu seçildi, o şablonun görsel yuvası yok, `gorsel-uret` ATLANDI ve
// kreatifte tek bir model görseli kalmadı. Yine de `aiGenerated: true` yazılıyor,
// görünür ifşa aranıyor (aranacak görsel yok), bulunamıyor ve SIFIR KUSURLU bir
// karosel yayınlanamaz oluyordu.
describe('koşuda gerçekten görsel üretildi mi', () => {
  const kapsam = { aiGenerated: true, adimlar: ['gorsel-uret', 'gorsel-uret-2'], promptlar: [] }

  it('adım ATLANDIYSA ifşa gerekmiyor — kayıt, tahmin değil', () => {
    expect(
      kosudaGorselUretildi(kapsam, { 'gorsel-uret': 'skipped', 'gorsel-uret-2': 'skipped' })
    ).toBe(false)
  })

  it('bir adım bile KOŞTUYSA ifşa gerekiyor', () => {
    expect(kosudaGorselUretildi(kapsam, { 'gorsel-uret': 'skipped', 'gorsel-uret-2': 'ok' })).toBe(
      true
    )
  })

  it('adım hiç görünmüyorsa ifşa gerekmiyor — koşmamış bir adım üretmemiştir', () => {
    expect(kosudaGorselUretildi(kapsam, {})).toBe(false)
  })
})

// ── R-33 taraması bugün KONU üzerinden çalışıyor (D-313 · borç D22) ────────
//
// ⚠ ⚠ **BU BİR VEKİL ve satır onu gizlemiyor.** Hiçbir hat `prompt` kısıtı yazmıyor;
// asıl istem `gorsel-brief` adımının ÇIKTISINDA yaşıyor ve tarama oraya bakmıyor.
// Yani "sentetik insan yok" iddiası konu metni üzerinden kuruluyor. Gerçek brief'e
// geçmek bir POLİTİKA sorusu açıyor (katalog varyantları bilerek insan figürü istiyor)
// ve o karar insanın — borç D22.
describe('taranacak prompt', () => {
  const kapsam = (
    promptlar: readonly string[],
    ai: boolean
  ): Parameters<typeof taranacakPrompt>[0] =>
    ({ aiGenerated: ai, adimlar: ['gorsel-uret'], promptlar }) as never

  it('konu taramaya GİRİYOR — bugünkü tek sinyal', () => {
    expect(taranacakPrompt(kapsam([], true), 'vardiya kayıpları')).toContain('vardiya')
  })

  it('görsel prompt`u varsa O DA giriyor', () => {
    const p = taranacakPrompt(kapsam(['two workers at a cabinet'], true), 'konu')
    expect(p).toContain('workers')
  })

  // ⚠ ⚠ **EŞ SESLİ (D-313).** Konu *"UpcyMan: çalışan üretim altyapısı"* kusursuz bir
  // koşuyu damgalama adımında öldürdü: "çalışan" burada ÇALIŞMAKTA OLAN demek.
  it('eş sesli konu artık koşuyu ÖLDÜRMÜYOR', () => {
    const p = taranacakPrompt(kapsam([], true), 'UpcyMan: çalışan üretim altyapısı')
    expect(promptRequestsPerson(p)).toBeNull()
  })
})
