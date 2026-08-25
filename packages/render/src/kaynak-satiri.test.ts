// BÜYÜK SES KAYNAĞINI YANINDA TAŞIR — tek kural, iki çağrı yeri (FAZ-19.5).
//
// ⚠ ⚠ **KURAL ZATEN VARDI, YALNIZ YARISI YAZILIYDI VE HİÇBİRİ ZORLANMIYORDU.**
// `Kart.kapanis.rakamAlt`ın kendi yorumu şöyle: *"Rakamın altındaki tek satırlık okuma —
// rakam kaynaksız kalmasın (R-32)."* Yani ilke kayıtlı. Ölçüldü: on destenin **onu da**
// `rakamAlt` dolduruyor — ama **hiçbir kapı bunu istemiyor.** Gelenekle yaşayan bir kural,
// bir koşuda sessizce ölür; bu depoda aynı sınıf on beş kez çıktı.
//
// ⚠ ⚠ **VE İKİNCİ ÇAĞRI YERİ BOŞTU.** Denetimin `alinti` kartına dair BİRİNCİ şikâyeti:
// *"atıfsız alıntı — pull-quote'un yapısı iddia→atıf'tır."* Ölçüldü: o şablonun alıntı
// kartında `govde` BOŞ ve atıf alanı hiç yok. Kapanış rakamı kaynağını taşıyor, alıntı
// taşımıyordu — **aynı ilkenin iki yarısı, biri yazılı biri değil.**
//
// ⚠ ATIF UYDURULMAZ. Örnek destedeki söz yaygın bir yönetim aforizması ve sahibi
// tartışmalı (Drucker'a da Kelvin'e de atfediliyor, ikisi de doğrulanmıyor). Kaynağı
// olmayan bir söze sahte bir sahip vermek R-32'nin ihlalidir; doğru atıf, sözün NE
// OLDUĞUNU söylemektir. Ölçen bir markanın bir alıntının kaynağını bilmediğini söylemesi
// zayıflık değil, tutarlılıktır.

import { describe, expect, it } from 'vitest'
import { ORNEKLER } from './katalog-ornek.js'

describe('kaynak satırı', () => {
  // ── ÇAĞRI YERİ 1: kapanış rakamı ──────────────────────────────────────
  //
  // ⚠ Bugün 10/10 dolu; kapı bir kusur bulmuyor, bir GELENEĞİ kilitliyor. Kapının işi
  // her zaman kırmızı bulmak değil, yeşilin kaza eseri olmadığını garanti etmek.
  it('kapanış rakamı taşıyan her kart okuma satırı da taşıyor (R-32)', () => {
    let sayilan = 0
    for (const [id, o] of Object.entries(ORNEKLER)) {
      for (const [i, k] of o.kartlar.entries()) {
        const r = k.kapanis?.rakam
        if (r === undefined || r.trim() === '') continue
        sayilan += 1
        expect(
          (k.kapanis?.rakamAlt ?? '').trim(),
          `${id} k${String(i + 1)}: "${r}" rakamı KAYNAKSIZ — neyi ölçtüğünü söyleyen satır yok`
        ).not.toBe('')
      }
    }
    expect(sayilan, 'hiç kapanış rakamı bulunamadı — kapı boşa dönüyor').toBeGreaterThan(5)
  })

  // ── ÇAĞRI YERİ 2: alıntı ──────────────────────────────────────────────
  //
  // ⚠ Kapı DAR ve dar olması KASITLI: yalnız `alinti` şablonunda uygulanıyor, çünkü
  // pull-quote yapısı bu tek arketipe ait. "Her büyük başlık atıf ister" demek
  // `sahne`nin sinematik başlığına da atıf isterdi ve o bir alıntı değil.
  // ⚠ Bu şablonda `govde` ATIF YUVASIDIR: alıntı kartında sözün kimin/neyin olduğunu,
  // öteki kartlarda karşı sözü taşıyor. Boş bırakılırsa iddia kaynaksız kalıyor.
  it('alinti şablonunda hiçbir kart kaynaksız değil', () => {
    const o = ORNEKLER['alinti']
    expect(o, 'alinti şablonu yok').toBeDefined()
    if (o === undefined) return
    expect(o.kartlar.length, 'alinti kartsız').toBeGreaterThan(1)
    for (const [i, k] of o.kartlar.entries())
      expect(
        k.govde.trim(),
        `alinti k${String(i + 1)}: "${k.baslik.slice(0, 32)}" ATIFSIZ — ` +
          "pull-quote'un yapısı iddia→atıftır"
      ).not.toBe('')
  })
})
