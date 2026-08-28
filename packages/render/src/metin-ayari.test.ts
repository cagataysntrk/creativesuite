// Elle ince ayar: kaydırma + punto çarpanı, SINIRLI (FAZ-16.1 · D-301).
//
// ⚠ Sınır kozmetik değil sözleşme: sınırsız kayma metni karttan çıkarır ve kesimi
// geçirir; o an şablon şablon olmaktan çıkar. Denetim taşmayı yakalar ama YAKALAMAK
// ÖNLEMEK DEĞİLDİR — kusur raporlanmış bir karosel yine de yanlış karoseldir.

import { describe, expect, it } from 'vitest'
import { ORNEKLER } from './katalog-ornek.js'
import { ayarStili, panoramaHtml, puntoOlcumu, type PanoramaBelgesi } from './panorama.js'

const DAMGA = {
  brandId: 'brd_t',
  eraId: 'era_t',
  kitVersion: 'kit-1',
  definitionDigest: 'sha256:x',
  contextManifest: 'ctx_1',
  sourceRunId: 'run_t',
}

// ⚠ `throw` YOK: hata bir DEĞERdir (§8.6) ve `chokepoints` kapısı test dosyasında da
// fırlatmaya izin vermiyor — haklı, çünkü fırlatan bir yardımcı testin hangi satırda
// düştüğünü gizler.
const SAHNE = ORNEKLER['sahne'] as (typeof ORNEKLER)[string]

const belge = (ayar: Record<string, unknown>): PanoramaBelgesi => {
  const o = SAHNE
  return {
    ...o,
    tokenCss: '',
    stamp: DAMGA,
    kartlar: o.kartlar.map((k, i) => (i === 0 ? { ...k, ayar } : k)),
  } as unknown as PanoramaBelgesi
}

describe('metin ince ayarı', () => {
  it('ayar verilmezse satır içi stil YOK — şablon aynen geçiyor', () => {
    expect(ayarStili(undefined)).toBe('')
    expect(ayarStili({})).toBe('')
    expect(ayarStili({ dx: 0, dy: 0, olcek: 1 })).toBe('')
  })

  it('kaydırma ve çarpan stile giriyor', () => {
    expect(ayarStili({ dx: 40, dy: -18 })).toContain('translate(40px,-18px)')
    expect(ayarStili({ olcek: 1.4 })).toContain('--ayar-olcek:1.4')
  })

  it('SINIR kısıyor — 5000 px kayma 260 px oluyor, çarpan 2 ile kapanıyor', () => {
    expect(ayarStili({ dx: 5000, dy: -5000 })).toContain('translate(260px,-260px)')
    expect(ayarStili({ olcek: 9 })).toContain('--ayar-olcek:2')
    expect(ayarStili({ olcek: 0.01 })).toContain('--ayar-olcek:0.5')
  })

  it('KUTU ÖLÇÜSÜ stile giriyor — genişlik ile TAVAN birlikte', () => {
    // ⚠ ⚠ **`max-width` OLMADAN `width` HİÇBİR ŞEY YAPMAZ.** Metin alanları kartın
    // flex sütununda şablonun `baslikSutunu` oranıyla `max-width`e kapatılmış; yalnız
    // `width` yazsaydık tutamacı sağa sürüklemek kutuyu genişletmezdi. Şikâyet buydu:
    // *"bazen sığmıyor, elle manuel genişlemeli."*
    const st = ayarStili({ en: 900 })
    expect(st).toContain('width:900px')
    expect(st, 'şablonun sütun tavanı da eziliyor').toContain('max-width:900px')
  })

  it('yükseklik `min-height` yazıyor — sabit yükseklik metni KESERDİ', () => {
    // Dert "sığmıyor"du; `height` sığmayanı keser, yani şikâyeti görünmez kılardı.
    const st = ayarStili({ boy: 400 })
    expect(st).toContain('min-height:400px')
    expect(st, 'sabit yükseklik YOK').not.toContain('height:400px;')
  })

  it('KUTU SINIRI kısıyor — kart dışına taşan ölçü kabul edilmiyor', () => {
    expect(ayarStili({ en: 9000 })).toContain('width:1080px')
    expect(ayarStili({ en: 1 })).toContain('width:120px')
    expect(ayarStili({ boy: 99_999 })).toContain('min-height:1350px')
    expect(ayarStili({ boy: 0 })).toContain('min-height:24px')
  })

  it('kutu ölçüsü kaydırmayı ve çarpanı EZMİYOR — hepsi birlikte yaşıyor', () => {
    // Editör tutamacı ölçü yazarken `dx/dy/olcek`i de taşıyor; ikisi aynı stilde
    // buluşmazsa insan kutuyu genişletince yazı yerinden sıçrardı.
    const st = ayarStili({ dx: 30, dy: -10, olcek: 1.2, en: 800, boy: 200 })
    expect(st).toContain('translate(30px,-10px)')
    expect(st).toContain('--ayar-olcek:1.2')
    expect(st).toContain('width:800px')
    expect(st).toContain('min-height:200px')
  })

  it('PUNTO ÖLÇÜMÜ elle verilen kutu genişliğini OKUYOR', () => {
    // ⚠ ⚠ **BU TEST BİR RENDER KUSURUNDAN DOĞDU ve kusuru ÇİZİP BAKMAK gösterdi.**
    // Punto ölçümü sınırı şablonun `baslikSutunu` oranından alıyordu. `ayarStili`
    // ögeye `width:860px` yazınca `scrollWidth` 860 döndürmeye başlıyor ve
    // `860 <= 304` HİÇBİR puntoda sağlanmıyor: ikili arama tabana çöküyor, başlık
    // 20 px'e iniyordu. Editör önizlemesi puntoyu kendi hesaplamadığı için sorunu
    // GÖSTERMİYORDU — yalnız gerçek çıktı gösterdi.
    const betik = puntoOlcumu(belge({}))
    expect(betik, "sınır ögenin kendi max-width'inden okunuyor").toContain('b.style.maxWidth')
    expect(betik).toContain('Number.isFinite(elleEn)')
  })

  it('PUNTO ÖLÇÜMÜ elle punto çarpanını da hesaba katıyor', () => {
    // ⚠ ⚠ **BU KUSUR YAYINA GİDEN BİR SLAYTTA GÖRÜLDÜ:** başlık `Duruşlar` yerine
    // `Duruşla` çıktı — son harf kartın sağ kenarında KESİLDİ. Sebep: CSS puntoyu İKİ
    // çarpanla çarpıyor (gövde çarpanı 0,82 VE insanın verdiği punto çarpanı), ölçüm
    // ise yalnız birincisini biliyordu. İnsan çarpanı 1,37 yapınca ölçüm "sığıyor"
    // dediği boyutu buluyor, render onu 1,37 ile çarpıyor ve metin taşıyor.
    //
    // Aynı belgede ölçüldü — eski formül başlığı %16 şişiriyordu:
    //   kart 1: 156 → 134 · kart 2: 150 → 129 · kart 3: 131 → 113 · kart 4: 157 → 136
    //
    // ⚠ Bu fonksiyonun KENDİ dokümanı *"kendi çarpanını bilmeyen oturma ölçümü hiçbir
    // şey kanıtlamaz"* diyor ve gövde çarpanı için uygulanmıştı; ikinci çarpanda aynı
    // ders yeniden öğrenildi.
    // ⚠ Bu iddia BİR TUR SONRA daraldı: çarpan global bölene KATILMIYOR (o yol
    // denendi ve öteki kartları cüceleştirdi), kart başına kısmada kullanılıyor.
    const betik = puntoOlcumu(belge({}))
    expect(betik, 'elle çarpan okunuyor').toContain('--ayar-olcek')
    expect(betik, 'kart başına kısmada kullanılıyor').toContain('punto * o.carpan * o.olcek')
  })

  it('KUTU YÜKSEKLİĞİ oturma ölçümünü ZEHİRLEMİYOR', () => {
    // ⚠ ⚠ **BU KUSUR BİR ŞABLONU TEK BAŞINA OKUNMAZ YAPTI.** Kutu yüksekliği
    // `min-height` olarak yazılıyor (kasıtlı — sabit yükseklik sığmayan metni keserdi).
    // Ama `min-height` bir TABAN: `scrollHeight` ondan aşağı inemiyor. 752 px taban
    // verilmiş bir başlıkta *"blok yüksekliğine sığıyor mu"* sorusu hiçbir puntoda evet
    // cevabı alamıyor, ikili arama 20 px'e çöküyor ve `sinirPunto` bir MİNİMUM olduğu
    // için o tek kart BÜTÜN karoseli aşağı çekiyor.
    //
    // Ölçüldü (`donen`, kart 3'ün kutu yüksekliği 752, blok bütçesi 520):
    //   düzeltmeden önce: 25 · 23 · 20 · 30 px   ← okunamaz
    //   düzeltmeden sonra: 136 · 110 · 150 · 166 px
    //   `editoryal` ve `sahne` HİÇ değişmedi — kısma yalnız zehirlenen kartı kurtarıyor.
    const betik = puntoOlcumu(belge({}))
    expect(betik, 'taban ölçüm sırasında nötrleniyor').toContain("b.style.minHeight = '0px'")
    expect(betik, 've geri konuyor').toContain('b.style.minHeight = eskiTaban')
  })

  it('ELLE ÇARPAN kart başına kısılıyor, global bölene KATILMIYOR', () => {
    // ⚠ ⚠ **BU İKİ TUR ALDI.** Önce çarpan hiç hesaba katılmıyordu ve metin taşıyordu
    // (`Duruşlar` → `Duruşla`). Sonra çarpanı global bölene kattım: taşma bitti ama
    // global punto en büyük çarpanlı karta göre kısıldı ve öteki kartlar cüceleşti.
    //
    // Kök mesele ÖLÇEK UYUŞMAZLIĞI: başlık puntosu GLOBAL (karosel tek tasarım),
    // elle çarpan KART BAŞINA. Kart başına bir çarpanı global bir bölene katmak, bir
    // kartın kararını bütün karosele ceza yazmaktır.
    const betik = puntoOlcumu(belge({}))
    expect(betik, 'global bölen çarpansız').toContain('alt / carpan < sinirPunto')
    expect(betik, 'kart başına kısma var').toContain('nominal > o.alt')
  })

  it('render ayarı gerçekten basıyor', () => {
    expect(SAHNE).toBeDefined()
    const html = panoramaHtml(belge({ baslik: { dx: 30, olcek: 1.25 } }))
    expect(html).toContain('translate(30px,0px)')
    expect(html).toContain('--ayar-olcek:1.25')
  })

  it('punto formülleri çarpanı okuyor — yoksa ayar hiçbir şey yapmazdı', () => {
    const html = panoramaHtml(belge({}))
    expect(html).toContain('calc(var(--baslik-punto) * var(--ayar-olcek, 1))')
    // ⚠ Eyebrow puntosu 24 → 20 (D-317: sistemin `eyebrow` ölçeği). Ölçülen şey punto
    // değil, ÇARPANIN okunduğu: elle ayar bu ögeye de geçmeli.
    expect(html).toContain('calc(20px * var(--ayar-olcek, 1))')
    // Panel payı KÖKTEN türüyor: elle ayar şablonun kendi payını EZMİYOR, çarpıyor.
    expect(html).toContain('--panel-olcek: calc(var(--panel-kok) * var(--ayar-olcek, 1))')
  })

  it('üst başlık BOŞSA hiç çizilmiyor — silmek boş etiket bırakmaz', () => {
    const o = ORNEKLER['sahne']
    if (o === undefined) return
    const bos = {
      ...o,
      tokenCss: '',
      stamp: DAMGA,
      kartlar: o.kartlar.map((k) => ({ ...k, ustBaslik: '' })),
    } as unknown as PanoramaBelgesi
    expect(panoramaHtml(bos)).not.toContain('class="ust-baslik"')
  })
})
