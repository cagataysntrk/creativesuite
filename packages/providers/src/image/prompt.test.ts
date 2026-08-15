import { describe, expect, it } from 'vitest'
import { NO_TEXT_SUFFIX, buildImagePrompt, hasNoTextSuffix } from './prompt.js'

const CID = 'cor_test'
const kur = (s: string) => buildImagePrompt(s, CID)
const red = (s: string): string => {
  const r = kur(s)
  return r.ok ? 'KABUL' : ((r.error.details?.['refusal'] as { kind: string }).kind ?? '?')
}

describe('her prompt "no text" eki taşır (R-20)', () => {
  it('geçerli prompt eki ALIYOR', () => {
    const r = kur('imalathanede parlak metal parçalar, soğuk ışık')
    expect(r.ok).toBe(true)
    if (r.ok) {
      expect(hasNoTextSuffix(r.value.text)).toBe(true)
      expect(r.value.text).toContain(NO_TEXT_SUFFIX)
      // Ham hâli manifest için ayrı duruyor — okunabilirlik kaybolmasın.
      expect(r.value.base).toBe('imalathanede parlak metal parçalar, soğuk ışık')
    }
  })

  it('boş prompt reddediliyor', () => {
    expect(red('')).toBe('empty')
    expect(red('   ')).toBe('empty')
  })

  it('ek ELLE yazılamıyor — tek kaynak', () => {
    // İki kaynak olduğu gün biri güncellenir, diğeri kalır ve fark ancak çıktıya
    // bakınca — yani para harcandıktan sonra — anlaşılır.
    expect(red('bir fabrika, no text please')).toBe('suffix_hand_written')
  })
})

describe('metin İSTEYEN prompt reddediliyor — ek tek başına yetmez', () => {
  it('Türkçe metin istekleri', () => {
    for (const p of [
      'üstünde FİRE yazan bir tabela',
      'büyük harflerle şirket adı',
      'sloganımız görselde olsun',
      'yazılı bir pano',
      'kelime bulutu',
      'başlık içeren kapak',
      'logo yerleştirilmiş ürün fotoğrafı',
      'metinli bir infografik',
      'harflerle oynayan bir kompozisyon',
      'pankart taşıyan işçiler',
      'afişin üstünde ürün',
    ]) {
      expect(red(p), p).toBe('requests_text')
    }
  })

  it('İngilizce metin istekleri', () => {
    for (const p of [
      'a poster with bold typography',
      'a sign that says "quality"',
      'lettering on the wall',
      'product shot with watermark',
      'a caption at the bottom',
      'the word innovation in the sky',
    ]) {
      expect(red(p), p).toBe('requests_text')
    }
  })

  it('diyakritik ve büyük harf FARK ETMİYOR', () => {
    // Katlamasız bir liste `ı`/`i` ayrımında sessizce yarım kalırdı — ve prompt'u
    // yazan kişi hangi klavyeyi kullandıysa kural çalışmak zorunda.
    for (const p of ['YAZILI tabela', 'yazili tabela', 'Yazılı Tabela', 'BAŞLIK', 'baslik']) {
      expect(red(p), p).toBe('requests_text')
    }
  })

  it('yanlış pozitif yok — meşru prompt geçiyor', () => {
    // Sürekli yanlış alarm veren kapı, kapatılan kapıdır.
    for (const p of [
      'çelik tezgâh üstünde ölçüm aleti, sığ alan derinliği',
      'endüstriyel tesis, mavi saat, geniş açı',
      'soyut geometrik desen, bakır tonları',
      'bir mühendis parçayı inceliyor, doğal ışık',
      // "yazılım" bu şirketin kendi sözlüğü — `yazi\w*` onu yakalamamalı.
      'yazılım ekibinin çalışma alanı, ekranlar kapalı',
    ]) {
      expect(red(p), p).toBe('KABUL')
    }
  })
})

describe('`hasNoTextSuffix` ikinci savunma hattı', () => {
  it('eksiz prompt yakalanıyor', () => {
    expect(hasNoTextSuffix('bir fabrika')).toBe(false)
  })
  it('ek ORTADA ise yetmiyor — sonda olmalı', () => {
    expect(hasNoTextSuffix(`bir ${NO_TEXT_SUFFIX} fabrika`)).toBe(false)
  })
})

describe('kelimesiz metin istekleri (İ1 · D-148)', () => {
  it('TIRNAK İÇİ metin yakalanıyor', () => {
    // `ekranda "%12 fire" görünüyor` hiçbir metin KELİMESİ içermez ama tam olarak
    // metin ister. Doğrulama agent'ı bu boşluktan sekiz denemeden altısını geçirdi.
    for (const p of [
      'ekranda "%12 fire" görünüyor',
      "panoda 'Önce ölç' okunuyor",
      'duvarda “ÖLÇÜM” yazısı',
    ]) {
      expect(red(p), p).toBe('requests_text')
    }
  })

  it('BÜYÜK HARF yakalanıyor — Türkçe harfler dahil', () => {
    // `ĞÜŞİÖÇ` ASCII `[A-Z]` ile yakalanmaz; tam da onlar kaçardı.
    for (const p of ['neon levha: OLCUM', 'tişört üzerine baskılı UPCYTECH', 'ÖLÇÜM panosu']) {
      expect(red(p), p).toBe('requests_text')
    }
  })

  it('MEŞRU sanayi kısaltmaları BÜYÜK HARF kuralından muaf', () => {
    // "CNC tezgâhı" bir metin isteği değil, bir makine adı. Liste kapalı ve kısa:
    // uzadıkça kural erir.
    for (const p of [
      'CNC tezgâhının makro çekimi',
      'ISO sertifikalı üretim hattı',
      'PLC panosunun yakın çekimi',
    ]) {
      expect(red(p), p).toBe('KABUL')
    }
  })

  it('sayı ve baskı gövdeleri yakalanıyor', () => {
    for (const p of ['3 basamaklı rakamlar', 'tişörte basılı desen', 'levhada bir ibare']) {
      expect(red(p), p).toBe('requests_text')
    }
  })

  it("agent'ın SEKİZ denemesinin sekizi de reddediliyor", () => {
    // Doğrulama turu 1'de 8 denemeden 7'si geçmişti. Bu blok o regresyonu kilitliyor.
    for (const p of [
      'atölye duvarında büyük FİRE ibaresi',
      'ekranda "%12 fire" görünüyor',
      'duvarda Türkçe bir cümle: Önce ölç',
      'neon levha: ÖLÇÜM',
      'tişört üzerine baskılı UPCYTECH',
      '3 basamaklı rakamlar',
      'kapıda bir yazı var',
      'panoda BÜYÜK HARFLERLE bir şey',
    ]) {
      expect(red(p), p).toBe('requests_text')
    }
  })
})
