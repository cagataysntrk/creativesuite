// Şablon seçimi — katalogdan, içeriğin şekline göre (FAZ-15.6 · D-268).

import { describe, expect, it } from 'vitest'
import { KATALOG } from '@suite/contracts'
import { icerikSekli, sablonSec } from './sablon-sec.js'

const veri = [
  '2019 yılında geri kazanım oranı %34 seviyesindeydi',
  '2021 yılında bu oran %51 oldu',
  '2023 yılında 58,9 bin ton işlendi',
  '2024 yılında hacim 71,2 bin tona çıktı',
  '2025 için tahmin 77,4 bin ton',
  'Eğrinin ucu artık tahmin, ölçüm değil',
]

const sorular = [
  'Altı soru, altı yanlış varsayım',
  'Geri dönüşüm ücretsiz mi?',
  'Her plastik aynı mı?',
  'Temizlemek şart mı?',
  'Sonsuz kez dönebilir mi?',
  'Peki ne yapmalı?',
]

const liste = [
  'Bir hattı döngüsel yapan beş şart',
  '1. Girdi izlenebilir olacak',
  '2. Ayrıştırma kaynakta başlayacak',
  '3. Kalite ölçülecek',
  '4. Çıktının bir alıcısı olacak',
  '5. Döngü kendini finanse edecek',
]

const kisa = ['Sessiz bir dönüşüm', 'Boşluk da bir karar', 'Küçük punto güven ister']

const anlati = [
  'Anlatmak göstermekle başlar',
  'Önce sorun duruyor karşımızda',
  'Sonra bir ölçü koyuluyor',
  'En sonda karar var',
]

describe('içerik şekli — sayılabilen şeyler sayılıyor', () => {
  it('yıl dizisini buluyor', () => {
    expect(icerikSekli(veri).yilSayisi).toBe(5)
    expect(icerikSekli(sorular).yilSayisi).toBe(0)
  })

  it('soru oranını ölçüyor', () => {
    expect(icerikSekli(sorular).soruOrani).toBeGreaterThan(0.6)
    expect(icerikSekli(veri).soruOrani).toBe(0)
  })

  it('numaralı satırları sayıyor', () => {
    expect(icerikSekli(liste).numaraliSatir).toBe(5)
    expect(icerikSekli(anlati).numaraliSatir).toBe(0)
  })
})

describe('şablon seçimi', () => {
  // ⚠ ⚠ **AYNI METİN İKİ ŞEKİLDE VERİLİNCE İKİ FARKLI ŞABLON.** Seçimin gerçekten
  // İÇERİKTEN geldiğinin kanıtı bu: her girdiye aynı şablonu döndüren bir seçici,
  // seçici değil sabittir.
  it('zaman serisi → veri-hikayesi', () => {
    const s = sablonSec(veri)
    expect(s.ok).toBe(true)
    expect(s.ok && s.sablon.id).toBe('veri-hikayesi')
  })

  it('soru ritmi → memphis', () => {
    const s = sablonSec(sorular)
    expect(s.ok && s.sablon.id).toBe('memphis')
  })

  it('numaralı liste → akan-alan', () => {
    const s = sablonSec(liste)
    expect(s.ok && s.sablon.id).toBe('akan-alan')
  })

  // ⚠ `editoryal` fotoğrafla var olan bir şablon: kısa metin onu ima etmiyor.
  it('az ve kısa satır editoryal`i SEÇTİRMİYOR — istenmesi gerek', () => {
    expect(
      sablonSec(kisa).ok && (sablonSec(kisa) as { sablon: { id: string } }).sablon.id
    ).not.toBe('editoryal')
    const istenmis = sablonSec(kisa, { gorselUretilebilir: true, istenen: 'editoryal' })
    expect(istenmis.ok && istenmis.sablon.id).toBe('editoryal')
  })

  it('anlatı → sahne', () => {
    const s = sablonSec(anlati)
    expect(s.ok && s.sablon.id).toBe('sahne')
  })

  it('seçim GEREKÇE yazıyor — gerekçesiz seçim denetlenemez', () => {
    const s = sablonSec(veri)
    expect(s.ok && s.neden.length).toBeGreaterThan(10)
    expect(s.puanlar.length).toBeGreaterThan(3)
  })

  // ⚠ Determinizm (R-06): aynı girdi, aynı çıktı. Beraberlik katalog SIRASIYLA çözülüyor.
  it('aynı içerik her çağrıda aynı şablonu veriyor', () => {
    const ilk = sablonSec(veri)
    for (let k = 0; k < 5; k += 1)
      expect(sablonSec(veri).ok && (sablonSec(veri) as { sablon: { id: string } }).sablon.id).toBe(
        ilk.ok && ilk.sablon.id
      )
  })
})

describe('seçim REDDEDEBİLİR — sessizce varsayılana düşmüyor', () => {
  it('katalogda olmayan şablon isteği reddediliyor', () => {
    const s = sablonSec(veri, { gorselUretilebilir: true, istenen: 'olmayan-sablon' })
    expect(s.ok).toBe(false)
    expect(!s.ok && s.sebep).toContain('katalogda yok')
  })

  // ⚠ ⚠ **ASİMETRİ: az satır eler, çok satır elemez.** Gerçek bir koşuda `metin-uret`
  // 11 satır üretti ve iki yönlü eleme altı şablonun altısını birden düşürdü; hat
  // hiçbir şey seçemeden durdu. Yazar CÜMLE üretiyor, karosel KART taşıyor: fazlayı
  // uyarlama birleştirebilir, eksiği uyduramaz.
  it('satır sayısı şablonun kart sayısını AŞSA da eleme yok', () => {
    const cok = Array.from({ length: 12 }, (_, i) => `${i + 1}. Madde ${i + 1} burada.`)
    const s = sablonSec(cok)
    expect(s.ok).toBe(true)
    expect(s.ok && s.sablon.id).toBe('akan-alan')
  })

  it('satır sayısı şablonun ALT sınırının altındaysa eleniyor', () => {
    const az = ['Tek satır', 'İki satır']
    const s = sablonSec(az)
    expect(s.ok).toBe(false)
    expect(!s.ok && s.sebep).toContain('uymadı')
  })

  it('açıkça istenen şablon için YETERSİZ satır varsa reddediliyor', () => {
    const s = sablonSec(['Tek satır'], { gorselUretilebilir: true, istenen: 'veri-hikayesi' })
    expect(s.ok).toBe(false)
    expect(!s.ok && s.sebep).toContain('en az')
  })

  // ⚠ `donen` içerikten ÇIKARILAMAZ (ürün fotoğrafı gerektiriyor) ama istenebilir.
  it('içerikten seçilemeyen şablon açıkça istenebiliyor', () => {
    const s = sablonSec(anlati, { gorselUretilebilir: true, istenen: 'donen' })
    expect(s.ok).toBe(true)
    expect(s.ok && s.sablon.id).toBe('donen')
    expect(s.ok && s.neden).toContain('açıkça istedi')
  })

  // ⚠ ⚠ Görsel üretilemiyorsa katalog İKİ kayda iniyor — kimliği yer tutucudan ibaret
  // bir karosel teslim etmektense, seçimi daraltmak doğru cevap.
  // ⚠ ⚠ **İDDİA KATALOĞDAN TÜRÜYOR, ELLE YAZILMIŞ BİR LİSTEDEN DEĞİL.** İlk sürüm
  // `['akan-alan', 'veri-hikayesi']` yazıyordu ve aile altıdan ona çıkınca bayatladı.
  // Elle liste, testi zayıflatmadan da yanlış yapabilir: yeni bir GÖRSELLİ şablon
  // sızsaydı liste onu yakalamazdı, yalnız sayı tutmazdı. Türetilmiş iddia hem bayatlamaz
  // hem daha güçlü — seçilen HER şablonun görselsiz olduğunu söylüyor.
  it('görsel üretilemiyorsa yalnız görselsiz şablonlar seçilebiliyor', () => {
    const s = sablonSec(anlati, { gorselUretilebilir: false })
    expect(s.ok).toBe(false)
    const gorselsiz = KATALOG.filter((k) => k.gorsel === null)
      .map((k) => k.id)
      .sort()
    expect(gorselsiz.length).toBeGreaterThan(1)
    expect(s.puanlar.map((p) => p.id).sort()).toEqual(gorselsiz)
    // Ve seçilenlerin hiçbiri görsel istemiyor — listenin kendisi de doğrulanıyor.
    for (const p of s.puanlar) {
      expect(KATALOG.find((k) => k.id === p.id)?.gorsel, p.id).toBeNull()
    }
  })

  it('görselsiz koşuda görsele bağlı şablon İSTENSE de reddediliyor', () => {
    const s = sablonSec(anlati, { gorselUretilebilir: false, istenen: 'sahne' })
    expect(s.ok).toBe(false)
    expect(!s.ok && s.sebep).toContain('görsel üretilemiyor')
  })

  it('içerikten seçimde `donen` ASLA kazanmıyor', () => {
    for (const metin of [veri, sorular, liste, kisa, anlati])
      expect(
        sablonSec(metin).ok && (sablonSec(metin) as { sablon: { id: string } }).sablon.id
      ).not.toBe('donen')
  })
})
