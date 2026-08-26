// Şablon düzenleyicinin TARAYICI tarafı — `scripts/duzenleyici.mjs` bunu `/istemci.js`
// olarak servis eder.
//
// ⚠ ⚠ **BU DOSYA AYRI OLMAK ZORUNDA ve bu bir stil tercihi değil, bir HATA SINIFININ
// KÖKÜNDEN KALDIRILMASI.** Kod eskiden sunucu dosyasındaki bir şablon dizesinin
// içindeydi; oradaki bir yorumda kullanılan tek bir backtick dizeyi KAPATIYOR ve
// tarayıcıya sözdizimi hatalı bir betik gidiyordu. Aynı tuzak bu depoda ALTI kez
// ısırdı (`sablon-al.mjs`, `panorama-denetim.ts`, `duzenleyici.mjs` × 4) ve her
// seferinde belirti farklıydı: bir kez "vurgu is not defined", bir kez boş iframe,
// bir kez sessizce hiç çalışmayan bir denetim.
//
// ⚠ Politika ("yoruma backtick yazma") altı kez denendi ve altı kez tutmadı. Yapı
// tutuyor: burada backtick YASAL, çünkü artık bir dizenin içinde değiliz.
const $ = (s) => document.querySelector(s)

// ⚠ Eylem sonucu ölçüm panelinden AYRI: ölçüm her düzenlemeden sonra koşuyor ve
// aynı yüzeyi paylaşsalardı sonucu silerdi (bir kez oldu: görsel koyma reddi hiç
// görünmedi ve işlem başarılı sanıldı).
const mesaj = (metin) => {
  const m = $('#mesaj')
  m.textContent = metin
  m.className = metin.startsWith('✗') ? 'hata' : metin.startsWith('✓') ? 'iyi' : ''
}
// ⚠ ⚠ **URL'DEN AÇILABİLİR: `?id=kosu:<runId>`.** Panel "bu koşuyu editörde aç"
// diyordu ama çıplak adrese gidiyordu ve editör varsayılan olarak ŞABLONU açıyordu —
// yani "bu çıktıyı düzelt" düğmesi altı tasarımın kaynağını açıyordu.
const istenenId = new URLSearchParams(location.search).get('id')
// ⚠ ⚠ **İSTENEN AÇILAMIYORSA SESSİZ KALMIYOR.** Panelden gelen bir koşu editörün
// listesinde olmayabilir: editör yalnız `panorama.json` yazmış koşuları açabiliyor
// (D-302 öncesi koşularda o dosya yok). İlk sürüm `select.value`ye atıyor, tarayıcı
// geçersiz değeri sessizce yutuyor ve ekran BOŞ kalıyordu — kullanıcı editörün
// bozuk olduğunu düşünürdü.
const secenekler = [...$('#sablon').options].map((o) => o.value)
const acilamaz = istenenId !== null && !secenekler.includes(istenenId)
let id = acilamaz || istenenId === null ? $('#sablon').value : istenenId,
  olcek = 0.34,
  gecmis = []
if (!acilamaz && istenenId !== null) $('#sablon').value = istenenId
// ⚠ İKİ MOD, çünkü ikisi aynı anda OLAMAZ: contenteditable bir ögede sürüklemek
// metni SEÇER, taşımaz. Tek modda denendi ve yazı düzenlemek imkânsızlaştı.
let duzenMod = 'yaz' // 'yaz' → metne yaz · 'tasi' → metni taşı/ölçekle/sil
let secili = null // 'tasi' modunda seçili öge (silme hedefi)
let seciliKart = 0 // müfettişin gösterdiği kart
let rampa = [] // marka rampasındaki roller — serbest hex YOK (R-35)
// ⚠ Son belge saklanıyor: klavye kısayolu `bagla` kapsamı dışında çalışıyor ve
// mevcut kaydırmayı bilmeden üstüne ekleyemez.
let sonDoc = null

async function cek() {
  const r = await fetch('/pano?id=' + id)
  const { html, doc, geri, ileri } = await r.json()
  sonDoc = doc
  yiginiGoster(geri ?? 0, ileri ?? 0)
  const fr = $('#pano')
  fr.srcdoc = html
  fr.style.width = doc.slaytGenisligi * doc.kartlar.length + 'px'
  fr.style.height = doc.yukseklik + 'px'
  fr.style.transform = 'scale(' + olcek + ')'
  const gen = doc.slaytGenisligi * doc.kartlar.length * olcek,
    yuk = doc.yukseklik * olcek
  $('#sahne-sarmal').style.width = gen + 'px'
  $('#sahne-sarmal').style.height = yuk + 'px'
  $('#tuval').style.height = yuk + 36 + 'px'
  const kl = $('#kilavuz')
  kl.innerHTML = ''
  for (let n = 0; n < doc.kartlar.length; n++) {
    const sol = n * doc.slaytGenisligi * olcek
    if (n > 0) {
      const c = document.createElement('i')
      c.style.left = sol + 'px'
      kl.appendChild(c)
    }
    const e = document.createElement('b')
    e.style.left = sol + 'px'
    e.textContent = String(n + 1).padStart(2, '0')
    kl.appendChild(e)
  }
  fr.onload = () => {
    bagla(fr.contentDocument, doc)
    mufettisiKur(doc)
    olc()
  }
}

// ── müfettiş paneli ─────────────────────────────────────────────────────────
//
// ⚠ ⚠ **PANEL VERİDEN TÜRÜYOR, ELLE YAZILMIYOR.** Alan listesi `TIPO_ALANLARI` ve
// `KART_ALANLARI` tablolarından geliyor; belgeye yeni bir alan eklenince panele de
// bir satır eklemek yeterli. Elle kurulmuş bir form, veri modeli her büyüdüğünde
// sessizce eksik kalırdı — ve editörün eksik olduğu hiçbir yerde görünmezdi.
//
// ⚠ Her denetim ANINDA yazıyor ve render yeniden koşuyor: "uygula" düğmesi yok.
// Tasarım kararı gözle verilir; kaydetmeye basmadan sonucu görememek, kararı
// tahmine çevirir.

const TIPO_ALANLARI = [
  { ad: 'baslikPayi', etiket: 'başlık payı', min: 0.3, max: 1, adim: 0.01 },
  { ad: 'baslikGenislik', etiket: 'başlık genişlik', min: 62, max: 125, adim: 1 },
  { ad: 'baslikAgirlik', etiket: 'başlık ağırlık', min: 400, max: 900, adim: 10 },
  { ad: 'satirAraligi', etiket: 'satır aralığı', min: 0.9, max: 1.4, adim: 0.01 },
  { ad: 'harfArasi', etiket: 'harf arası (em)', min: -0.08, max: 0.12, adim: 0.005 },
  { ad: 'ustGenislik', etiket: 'üst başlık genişlik', min: 62, max: 125, adim: 1 },
  { ad: 'govdeOrani', etiket: 'gövde/başlık oranı', min: 0.18, max: 0.55, adim: 0.01 },
  { ad: 'baslikSutunu', etiket: 'başlık sütunu', min: 0.3, max: 1, adim: 0.01 },
  { ad: 'panelPayi', etiket: 'panel ölçeği', min: 0.6, max: 1.8, adim: 0.05 },
]

const YERLESIMLER = ['ust', 'orta', 'alt', 'yay']

const el = (etiket, icerik) => {
  const l = document.createElement('label')
  const b = document.createElement('span')
  b.textContent = etiket
  l.appendChild(b)
  l.appendChild(icerik)
  return l
}

const kaydirak = (deger, alan, uygula) => {
  const i = document.createElement('input')
  i.type = 'range'
  i.min = alan.min
  i.max = alan.max
  i.step = alan.adim
  i.value = deger
  const l = el(alan.etiket, i)
  const sayi = l.querySelector('span')
  const yaz2 = document.createElement('b')
  yaz2.textContent = Number(deger).toFixed(alan.adim < 0.1 ? 3 : 0)
  sayi.appendChild(yaz2)
  i.oninput = () => {
    yaz2.textContent = Number(i.value).toFixed(alan.adim < 0.1 ? 3 : 0)
  }
  i.onchange = () => uygula(Number(i.value))
  return l
}

const secim = (etiket, deger, secenekler, uygula) => {
  const sl = document.createElement('select')
  for (const o of secenekler) {
    const op = document.createElement('option')
    op.value = o
    op.textContent = o === '' ? '— yok —' : o
    if (o === deger) op.selected = true
    sl.appendChild(op)
  }
  sl.onchange = () => uygula(sl.value)
  return el(etiket, sl)
}

const metinKutusu = (etiket, deger, uygula) => {
  const i = document.createElement('input')
  i.type = 'text'
  i.value = deger ?? ''
  i.onchange = () => uygula(i.value)
  return el(etiket, i)
}

const baslikEkle = (kok, metin) => {
  const h = document.createElement('h3')
  h.textContent = metin
  kok.appendChild(h)
}

// ── WEBDEN ARAMA: modal + kova (madde 12) ───────────────────────────────────
//
// ⚠ ⚠ **KOVA MODÜL DÜZEYİNDE, müfettişin İÇİNDE DEĞİL.** `mufettisiKur` her
// düzenlemede paneli baştan kuruyor; kova onun içinde yaşasaydı bir kaydırağı
// oynatmak toplanan adayları silerdi.
const kova = []

/** Önizleme adresi — editörün kendi metin rengiyle, koyu tezgâhta siyah ikon görünmez. */
const ikonUrl = (tam, boy = 56) =>
  'https://api.iconify.design/' + tam.replace(':', '/') + '.svg?height=' + boy + '&color=%23e6e8ec'

/** Seçili adayı yuvaya indirir — sunucu temizler, rasterler, lisansı yazar. */
async function yuvayaKoy(i, o, renk) {
  mesaj('… ' + o.tam + ' rasterleniyor')
  const r = await fetch('/gorsel-ara-koy?id=' + id, {
    method: 'POST',
    body: JSON.stringify({ i, renk, ...o }),
  })
  mesaj(await r.text())
  $('#ara-perde').classList.remove('acik')
  await cek()
}

/**
 * Arama modalını açar.
 *
 * ⚠ Yuva indisi ve renk KAPANIŞLA taşınıyor, modal DOM'una yazılmıyor: modal tek ve
 * kalıcı, seçili yuva ise her tıklamada değişiyor. Durumu DOM'a yazmak, iki yuva
 * arasında geçince eski indisi kullanmak demekti.
 */
function aramaAc(i, renkAl) {
  const perde = $('#ara-perde')
  const izgara = $('#ara-izgara')
  const durum = $('#ara-durum')
  perde.classList.add('acik')
  $('#ara-sorgu').focus()

  const ara = async () => {
    const q = $('#ara-sorgu').value.trim()
    if (q === '') {
      durum.textContent = '✗ sorgu boş'
      return
    }
    izgara.replaceChildren()
    // ⚠ ⚠ **"ARANIYOR" YAZISI ŞART.** Iconify çağrısı bir saniyeyi geçebiliyor ve
    // sessiz bir boşluk "bozuk" diye okunuyor. Depo sahibi tam bunu sordu:
    // *"aranıyor bulundu seçenekler vs diye"*.
    durum.textContent = '… webde aranıyor: ' + q
    const r = await fetch('/gorsel-ara?id=' + id, {
      method: 'POST',
      body: JSON.stringify({ q, tumSetler: $('#ara-genis').checked }),
    })
    const j = await r.json()
    if (j.ok !== true) {
      durum.textContent = '✗ ' + (j.hata ?? 'arama başarısız')
      return
    }
    durum.textContent =
      '✓ ' +
      j.ogeler.length +
      '/' +
      j.toplam +
      ' sonuç' +
      (j.suzgec.length > 0 ? ' · şablon havası: ' + j.suzgec.join(', ') : ' · süzgeç yok') +
      ' — tıkla yuvaya insin, ⊕ ile kovaya at'
    for (const o of j.ogeler) {
      const d = document.createElement('div')
      d.className = 'ara-oge'
      const im = document.createElement('img')
      im.src = ikonUrl(o.tam)
      im.loading = 'lazy'
      d.appendChild(im)
      const ad = document.createElement('small')
      ad.textContent = o.setAdi + '\n' + o.lisans
      d.appendChild(ad)
      const kv = document.createElement('button')
      kv.className = 'kova'
      kv.textContent = '⊕ kova'
      kv.onclick = (ev) => {
        ev.stopPropagation()
        // ⚠ Aynı öge iki kez eklenmiyor: kova bir liste değil bir KÜME gibi
        // davranmalı, yoksa üç arama sonunda aynı ikon dört kez duruyor.
        if (!kova.some((x) => x.tam === o.tam)) kova.push(o)
        durum.textContent = '⊕ kovaya atıldı: ' + o.tam + ' · kovada ' + kova.length + ' aday'
        mufettisiKur(sonDoc)
      }
      d.appendChild(kv)
      d.onclick = () => void yuvayaKoy(i, o, renkAl())
      izgara.appendChild(d)
    }
  }

  $('#ara-git').onclick = () => void ara()
  $('#ara-sorgu').onkeydown = (ev) => {
    if (ev.key === 'Enter') void ara()
    if (ev.key === 'Escape') perde.classList.remove('acik')
  }
  $('#ara-kapat').onclick = () => perde.classList.remove('acik')
  // ⚠ Perdeye tıklayınca kapanıyor ama KUTUYA tıklayınca kapanmıyor: ilk sürümde
  // bir ikona basmak modalı kapatıyordu çünkü tıklama perdeye kabarıyordu.
  perde.onclick = (ev) => {
    if (ev.target === perde) perde.classList.remove('acik')
  }
}

function mufettisiKur(doc) {
  const kok = $('#mufettis')
  kok.innerHTML = ''
  const t = doc.tipografi ?? {}

  // ── seçili öge ──
  baslikEkle(kok, 'SEÇİLİ ÖGE')
  if (secili === null) {
    const p = document.createElement('div')
    p.className = 'bos'
    // ⚠ ⚠ **YAZ MODUNDA DA TIKLAMA SEÇİYOR** (önceki tur) — mesaj onu söylemeliydi.
    p.textContent = 'Tuvalde bir ögeye tıkla: metin, künye ya da görsel.'
    kok.appendChild(p)
  } else if (secili.alan === 'gorsel') {
    // Görselin alanları kendi bölümünde; burada yalnız ne seçili olduğu yazıyor.
    const p = document.createElement('div')
    p.className = 'bos'
    p.textContent = 'görsel ' + (secili.i + 1) + ' — alanları aşağıda'
    kok.appendChild(p)
  } else {
    const a = (doc.kartlar[secili.i]?.ayar ?? {})[secili.alan] ?? {}
    const yazAyar = (k, v) =>
      yaz({
        tur: 'ayar',
        i: secili.i,
        alan: secili.alan,
        dx: k === 'dx' ? v : (a.dx ?? 0),
        dy: k === 'dy' ? v : (a.dy ?? 0),
        olcek: k === 'olcek' ? v : (a.olcek ?? 1),
      })
    const p = document.createElement('div')
    p.className = 'bos'
    p.textContent = 'kart ' + (secili.i + 1) + ' · ' + secili.alan
    kok.appendChild(p)
    kok.appendChild(
      kaydirak(a.dx ?? 0, { etiket: 'yatay kaydırma', min: -260, max: 260, adim: 1 }, (v) =>
        yazAyar('dx', v)
      )
    )
    kok.appendChild(
      kaydirak(a.dy ?? 0, { etiket: 'dikey kaydırma', min: -260, max: 260, adim: 1 }, (v) =>
        yazAyar('dy', v)
      )
    )
    kok.appendChild(
      kaydirak(a.olcek ?? 1, { etiket: 'punto çarpanı', min: 0.5, max: 2, adim: 0.01 }, (v) =>
        yazAyar('olcek', v)
      )
    )
    // ⚠ Katman: öne/arkaya. Sabit bir sıra, "figürün kolu başlığın önünden geçsin"
    // gibi bir tasarım kararını elden alıyordu (D-304 metni üste aldı, hepsini değil).
    kok.appendChild(
      kaydirak(
        a.z ?? (secili.alan === 'gorsel' ? 4 : 6),
        {
          etiket: 'katman (öne/arkaya)',
          min: 0,
          max: 9,
          adim: 1,
        },
        (v) => yazAyar('z', v)
      )
    )

    const b = document.createElement('button')
    b.className = 'sil'
    b.textContent = '⌫ bu ögeyi sil'
    // ⚠ ⚠ **`click` HİÇ VARMIYORDU ve sebebi ölçüldü.** Düğmeye basmak önce
    // düzenlenebilir ögede `blur` tetikliyor; `blur` bir yazma yapıyor, yazma
    // `cek()` ile panoyu ve MÜFETTİŞİ yeniden çiziyor — yani düğme, `mouseup`
    // gelmeden DOM'dan siliniyor ve `click` hiç doğmuyor. Gerçek tarayıcıda
    // ölçüldü: tıklamadan sonra giden tek istek `{tur:'metin'}`, `{tur:'sil'}` YOK.
    // Depo sahibinin *"tıklasam da çalışmıyor"* şikâyeti birebir bu.
    //
    // `pointerdown` blur'dan ÖNCE geliyor; `preventDefault` odağın taşınmasını da
    // engelliyor, yani gereksiz metin yazması hiç olmuyor.
    b.onpointerdown = (ev) => {
      ev.preventDefault()
      const s = secili
      secili = null
      void yaz({ tur: 'sil', i: s.i, alan: s.alan })
    }
    kok.appendChild(b)
  }

  // ── görsel ──
  if (secili !== null && secili.alan === 'gorsel') {
    const g = doc.gorseller[secili.i] ?? {}
    const yazG = (alan, v) => yaz({ tur: 'gorsel-alan', i: secili.i, alan, deger: v })
    baslikEkle(kok, 'GÖRSEL ' + (secili.i + 1))
    for (const a of [
      { ad: 'x', etiket: 'sol (%)', min: -20, max: 100, adim: 0.1 },
      { ad: 'y', etiket: 'üst (%)', min: -20, max: 100, adim: 0.1 },
      { ad: 'genislik', etiket: 'genişlik (%)', min: 2, max: 60, adim: 0.1 },
      { ad: 'yukseklik', etiket: 'yükseklik (%)', min: 5, max: 120, adim: 0.5 },
    ]) {
      if (g[a.ad] === undefined) continue
      kok.appendChild(kaydirak(g[a.ad], a, (v) => yazG(a.ad, v)))
    }
    // Katman: figür başlığın önünde mi arkasında mı — bir tasarım kararı (D-304
    // metni üste aldı, HEPSİNİ değil; referansta figürün kolu başlığın önünden geçer).
    kok.appendChild(
      kaydirak(g.z ?? 4, { etiket: 'katman (öne/arkaya)', min: 0, max: 9, adim: 1 }, (v) =>
        yazG('z', v)
      )
    )
    // ── DÖNÜŞ (madde 2) ────────────────────────────────────────────────────
    //
    // ⚠ ⚠ **DÜZ BİR PNG DÖNDÜRÜLÜNCE GİZLİ YÜZÜ GÖRÜNMEZ.** Depo sahibi *"3B ögeler
    // 360 derece dikey ve yatay döndürülebilsin"* dedi; yuvadaki varlık bir 3B model
    // değil, tek açıdan render edilmiş düz bir görüntü. Bu kaydıraklar perspektif
    // eğimi veriyor — nesne yatar, yan döner, uzaklaşan kenarı küçülür — ve
    // yerleştirmede gerçekten işe yarıyor. Ama 90°'ye yaklaştıkça görüntü bir kâğıt
    // gibi incelir. Gerçek 360° için nesnenin N açıdan ÜRETİLMESİ gerekir.
    // ⚠ Etiketler bunu SÖYLÜYOR: "yatay çevir" ve "dikey yatır", "döndür" değil.
    // Adı 360° olan bir kaydırak, olmadığı şeyi vaat ederdi.
    for (const a of [
      { ad: 'donusY', etiket: 'yatay çevir (°)' },
      { ad: 'donusX', etiket: 'dikey yatır (°)' },
      { ad: 'donusZ', etiket: 'düzlemde döndür (°)' },
    ]) {
      kok.appendChild(
        kaydirak(g[a.ad] ?? 0, { etiket: a.etiket, min: -180, max: 180, adim: 1 }, (v) =>
          // ⚠ Sıfır SİLİNİYOR, yazılmıyor: nötr bir değeri belgeye basmak katalog
          // taslağını gereksiz alanla şişirir ve `transform` yokken de öge kendi
          // yığın bağlamına girer. Aynı kural `ayar`da da uygulanıyor.
          yazG(a.ad, v === 0 ? undefined : v)
        )
      )
    }
    kok.appendChild(
      secim('kırpma', g.kirpma ?? '', ['', 'kesik', 'daire'], (v) => yazG('kirpma', v))
    )
    // ⚠ `alt` YAYIN KAPISI için zorunlu (R-34): Türkçe, ≤125 karakter. Editörde
    // sormak, kapıda öğrenmekten ucuz.
    kok.appendChild(metinKutusu('alt metin (TR, ≤125)', g.alt, (v) => yazG('alt', v)))

    const dosya = document.createElement('input')
    dosya.type = 'file'
    dosya.accept = 'image/png,image/jpeg,image/webp'
    dosya.onchange = () => {
      const f = dosya.files?.[0]
      if (f === undefined) return
      const fr = new FileReader()
      fr.onload = async () => {
        const veri = String(fr.result).split(',')[1]
        const r = await fetch('/gorsel-koy?id=' + id, {
          method: 'POST',
          body: JSON.stringify({ i: secili.i, veri, mime: f.type }),
        })
        mesaj(await r.text())
        await cek()
      }
      fr.readAsDataURL(f)
    }
    kok.appendChild(el('kendi görselini koy', dosya))

    // ⚠ ⚠ **BEĞENİLMEYEN GÖRSELİN TEK ÇARESİ KOŞUYU BAŞTAN ÜRETMEKTİ.** Dört slaytlık
    // bir karoselde tek bir görseli beğenmemek, dördünü de yeniden üretmek demekti.
    // Artık istemi insan yazıyor ve YALNIZ o yuva yeniden üretiliyor.
    // ⚠ İstem R-20 muhafızından geçiyor: "kullanıcı yazdı" bir muafiyet sebebi değil.
    const istem = document.createElement('textarea')
    istem.placeholder = 'ingilizce istem — ne görmek istiyorsun? (metin/yazı isteme, R-20 reddeder)'
    istem.rows = 3
    istem.style.inlineSize = '100%'
    const uret = document.createElement('button')
    uret.textContent = '✨ bu yuvaya üret'
    uret.onclick = async () => {
      const p = istem.value.trim()
      if (p === '') return mesaj('✗ istem boş')
      uret.disabled = true
      mesaj('… model çağrılıyor (birkaç saniye)')
      const r = await fetch('/gorsel-uret?id=' + id, {
        method: 'POST',
        body: JSON.stringify({ i: secili.i, prompt: p }),
      })
      mesaj(await r.text())
      uret.disabled = false
      await cek()
    }
    kok.appendChild(el('modelden üret', istem))
    kok.appendChild(uret)

    // ⚠ ⚠ **WEBDEN TASARIM ÖGESİ — FOTOĞRAF DEĞİL.** Depo sahibi: *"fotoğraf değil
    // görsel ögeler ikon svg tasarım vs alakalı şeyler"*. Sonuçlar Iconify'dan: açık
    // kaynak setler ve SVG, yani doğası gereği arkaplansız ve çerçevesiz.
    //
    // ⚠ ⚠ **SONUÇLAR MODALA TAŞINDI ve sebebi bir ŞİKÂYET.** *"webden görseli ara
    // deyince nereye geliyor sonuçlar göremiyorum"*. İlk sürüm ızgarayı bu panelin
    // dibine koyuyordu: 288 px'lik sütunda, sekiz kaydırağın ve iki metin kutusunun
    // ALTINDA, kaydırmadan görünmüyordu. Arama çalışıyordu ama sonucu yoktu — bir
    // özelliğin görünmemesi, olmamasıyla aynı şey.
    //
    // ⚠ ⚠ **ÖNİZLEME `<img>` İLE YÜKLENİYOR ve bu bir GÜVENLİK kararı.** Uzak SVG
    // `<script>` taşıyabilir; `innerHTML` ile gömseydik editöre betik enjeksiyonu
    // açardık. Tarayıcı `<img>` bağlamında SVG betiğini çalıştırmaz. Yuvaya konan şey
    // ise SVG bile değil — sunucuda temizlenip rasterlenmiş saydam PNG.
    let seciliRenk = ''
    kok.appendChild(secim('öge rengi (rampadan)', '', ['', ...rampa], (v) => (seciliRenk = v)))

    const arabtn = document.createElement('button')
    arabtn.textContent = '🔎 webden ara'
    arabtn.onclick = () => aramaAc(secili.i, () => seciliRenk)
    kok.appendChild(el('webden tasarım ögesi (ikon · SVG)', arabtn))

    // ── KOVA: toplanan ögeler, arama kapanınca KAYBOLMUYOR ──────────────────
    //
    // ⚠ ⚠ *"bunlar bi bucket içine konulur sağdaki menüden bucket istendiği zaman
    // açılıp denenebilir diğerleri"*. Aramayı kapatınca sonuçlar gidiyordu; ikinci
    // adayı denemek için baştan aramak gerekiyordu. Kova arama TURLARI arasında
    // yaşıyor: üç ayrı sorgudan toplanan adaylar yan yana denenebiliyor.
    // ⚠ Bellekte duruyor, diske YAZILMIYOR: kova bir kararın kendisi değil, karar
    // verirken tutulan bir not. Kalıcı olsaydı ilk turun artıkları aylar sonra
    // karşımıza çıkardı.
    if (kova.length > 0) {
      const serit = document.createElement('div')
      serit.id = 'kova-serit'
      for (const o of kova) {
        const d = document.createElement('div')
        d.className = 'kova-oge'
        d.title = o.setAdi + ' · ' + o.ad + '\nlisans: ' + o.lisans + '\n(tıkla → yuvaya koy)'
        const im = document.createElement('img')
        im.src = ikonUrl(o.tam)
        d.appendChild(im)
        d.onclick = () => void yuvayaKoy(secili.i, o, seciliRenk)
        serit.appendChild(d)
      }
      const bosalt = document.createElement('button')
      bosalt.textContent = '⌫ kovayı boşalt'
      bosalt.onclick = () => {
        kova.length = 0
        mufettisiKur(sonDoc)
      }
      kok.appendChild(el('kova (' + kova.length + ' aday)', serit))
      kok.appendChild(bosalt)
    }

    // ⚠ ⚠ **GÖRSELİ SİLME YOKTU.** Metin ögesinin silme düğmesi vardı, görselinki
    // yoktu: beğenilmeyen bir görseli kaldırmanın tek yolu üstüne başkasını üretmekti.
    // Boş yuva YER TUTUCU çiziyor ve bu dürüst: eksik olan görünüyor.
    const gsil = document.createElement('button')
    gsil.className = 'sil'
    gsil.textContent = '⌫ bu görseli sil'
    gsil.onpointerdown = (ev) => {
      ev.preventDefault()
      void yaz({ tur: 'gorsel-alan', i: secili.i, alan: 'src', deger: '' })
    }
    kok.appendChild(gsil)

    // ⚠ Arka plan silme burada, GÖRSELİN yanında: kusur (`matlama-tutmuyor`) bu
    // ögede ölçülüyor ve düzeltmesi de bu ögede olmalı. Ayrı bir menüye koymak,
    // ölçümle düzeltmeyi birbirinden uzaklaştırırdı.
    const sil = document.createElement('button')
    sil.textContent = '✂ arka planı sil'
    sil.onclick = async () => {
      sil.disabled = true
      mesaj('… arka plan siliniyor (yerel model, birkaç saniye)')
      const r = await fetch('/arkaplan-sil?id=' + id, {
        method: 'POST',
        body: JSON.stringify({ i: secili.i }),
      })
      mesaj(await r.text())
      sil.disabled = false
      await cek()
    }
    kok.appendChild(el('arka plan', sil))
  }

  // ── MODELDEN ÜRET: seçim GEREKTİRMEZ ────────────────────────────────────
  //
  // ⚠ ⚠ **ÜRETİM SEÇİLİ GÖRSELE BAĞLIYDI.** Depo sahibi: *"öge seçili olmadan da
  // modelden üretim yapılabilmeli"*. Boş bir yuvaya üretmek için önce o yuvayı seçmek
  // gerekiyordu — ama boş yuvada tıklanacak bir görsel YOK. Kısır döngü.
  //
  // ⚠ Yuva numarası AÇIKÇA seçiliyor: "seçili olan" örtük bir durumdur ve üretim
  // pahalı bir eylem; hangi yuvaya gittiği görünür olmalı.
  if ((doc.gorseller ?? []).length > 0) {
    baslikEkle(kok, 'MODELDEN ÜRET')
    const yuva = document.createElement('select')
    ;(doc.gorseller ?? []).forEach((g, i) => {
      const o = document.createElement('option')
      o.value = String(i)
      o.textContent =
        String(i + 1) +
        '. yuva' +
        (typeof g.src === 'string' && g.src !== '' ? ' (dolu)' : ' (boş)')
      if (secili !== null && secili.alan === 'gorsel' && secili.i === i) o.selected = true
      yuva.appendChild(o)
    })
    const gistem = document.createElement('textarea')
    gistem.placeholder = 'ingilizce istem — ne görmek istiyorsun? (metin/yazı isteme)'
    gistem.rows = 3
    gistem.style.inlineSize = '100%'
    const guret = document.createElement('button')
    guret.textContent = '✨ üret'
    guret.onclick = async () => {
      const p2 = gistem.value.trim()
      if (p2 === '') return mesaj('✗ istem boş')
      guret.disabled = true
      mesaj('… model çağrılıyor (birkaç saniye)')
      const r = await fetch('/gorsel-uret?id=' + id, {
        method: 'POST',
        body: JSON.stringify({ i: Number(yuva.value), prompt: p2 }),
      })
      mesaj(await r.text())
      guret.disabled = false
      await cek()
    }
    kok.appendChild(el('yuva', yuva))
    kok.appendChild(el('istem', gistem))
    kok.appendChild(guret)
  }

  // ── kart ──
  baslikEkle(kok, 'KART')
  const kartNo = Math.min(seciliKart, doc.kartlar.length - 1)
  kok.appendChild(
    secim(
      'kart',
      String(kartNo + 1),
      doc.kartlar.map((_, i) => String(i + 1)),
      (v) => {
        seciliKart = Number(v) - 1
        mufettisiKur(doc)
      }
    )
  )
  const k = doc.kartlar[kartNo] ?? {}
  kok.appendChild(
    secim('metin kolonu', k.kolon ?? 'sol', ['sol', 'sag'], (v) =>
      yaz({ tur: 'kart-alan', i: kartNo, alan: 'kolon', deger: v })
    )
  )
  kok.appendChild(
    secim('kart zemini', k.zemin ?? '', ['', ...rampa], (v) =>
      yaz({ tur: 'kart-alan', i: kartNo, alan: 'zemin', deger: v })
    )
  )
  kok.appendChild(
    metinKutusu('hayalet (dev rakam)', k.hayalet, (v) =>
      yaz({ tur: 'kart-alan', i: kartNo, alan: 'hayalet', deger: v })
    )
  )
  kok.appendChild(
    metinKutusu('alt ray — sol', k.rayaSol, (v) =>
      yaz({ tur: 'kart-alan', i: kartNo, alan: 'rayaSol', deger: v })
    )
  )
  kok.appendChild(
    metinKutusu('alt ray — kaynak', k.rayaOrta, (v) =>
      yaz({ tur: 'kart-alan', i: kartNo, alan: 'rayaOrta', deger: v })
    )
  )

  // ── belge ──
  baslikEkle(kok, 'BELGE')
  kok.appendChild(
    secim('dikey yerleşim', doc.yerlesim ?? 'ust', YERLESIMLER, (v) =>
      yaz({ tur: 'belge-alan', alan: 'yerlesim', deger: v })
    )
  )
  kok.appendChild(
    secim('belge zemini', doc.zemin ?? '', ['', ...rampa], (v) =>
      yaz({ tur: 'belge-alan', alan: 'zemin', deger: v })
    )
  )
  // ⚠ ⚠ **SÜS ÖGESİ KAPATILABİLİR OLMALI.** `sus-metni-kesiyor` kusuru ölçülüyor ama
  // düzeltmesi metinle YAPILAMIYOR (borç D23: şeridin y'si sabit, metin bloğu içerikle
  // kayıyor). İnsanın elinde tek gerçek çare süsü kaldırmak; onu ölçüp sonra
  // "yapamazsın" demek, ölçümü bir şikâyete çevirir.
  //
  // ⚠ Kapatmak KİMLİK kaybı: `sahne`nin iki süreklilik ögesinden biri oklar. Seçenek
  // sunuluyor, varsayılan değişmiyor.
  kok.appendChild(
    secim(
      'süs ögesi (bant)',
      (doc.bant ?? {}).tip ?? 'yok',
      ['yok', 'ok', 'egri', 'kemer', 'alan'],
      (v) => yaz({ tur: 'bant-tip', deger: v })
    )
  )
  // ⚠ Metin/aksan rengi ZEMİNDEN türüyor ve seçilmiyor (§12.6): amber üstüne amber
  // 1,9:1 kontrast veriyordu — WCAG AA'nın yarısı. Renk seçimi zemin üzerinden yapılır;
  // serbest bir renk kutusu, ölçülmüş bir garantiyi elle bozmaya davet olurdu.
  const renkNot = document.createElement('div')
  renkNot.className = 'bos'
  renkNot.textContent =
    'Metin ve aksan rengi zeminden türüyor (kontrast garantisi). Rengi değiştirmek için zemini değiştir.'
  kok.appendChild(renkNot)

  // ── tipografi ──
  baslikEkle(kok, 'TİPOGRAFİ')
  for (const alan of TIPO_ALANLARI) {
    const d = t[alan.ad]
    if (d === undefined) continue
    kok.appendChild(kaydirak(d, alan, (v) => yaz({ tur: 'tipo', alan: alan.ad, deger: v })))
  }
}

// ⚠ Düzenleme katmanı iframe'in İÇİNE giriyor ama render'ı DEĞİŞTİRMİYOR: yalnız
// olay dinleyicisi ve contenteditable. Kaydedilen şey DOM değil, VERİ.
function bagla(d, doc) {
  // ⚠ Kart indeksi DOM'dan cikariliyor, forEach sayacindan DEGIL. Sayac dort seciciyi
  // birden duz sayiyordu: kart 0'in basligi i=1 aliyor ve duzenleme kartlar[1]'e
  // yaziliyordu — degisiklik "kayboluyor" gibi gorunuyordu, oysa yanlis karta gidiyordu.
  const kartlar = [...d.querySelectorAll('section.kart')]
  // innerText yildiz vurgu isaretini siler; vurgu <strong> olarak render edildigi icin
  // (ISTEMCI KODU BIR SABLON DIZESI ICINDE: buraya backtick yazilamaz, dizeyi kapatir)
  // geri kuruluyor. Kurulmasaydi bir kez duzenlenen her baslik vurgusunu kaybederdi.
  const metinAl = (e) =>
    [...e.childNodes]
      .map((n) =>
        n.nodeType === 3
          ? n.nodeValue
          : n.tagName === 'BR'
            ? '\\n'
            : n.tagName === 'STRONG'
              ? '**' + n.textContent + '**'
              : n.textContent
      )
      .join('')
  const ALAN = {
    baslik: 'baslik',
    govde: 'govde',
    'ust-baslik': 'ustBaslik',
    'el-yazisi': 'elYazisi',
    panel: 'panel',
    sayilar: 'panel',
    etiketler: 'panel',
    // ⚠ ⚠ **ALT RAY DÜZENLENEMİYORDU.** Depo sahibi: *"bunlar editörde düzenlenemiyor
    // bile"*. Künye kartın en çok gözden geçirilen parçası (kaynak, alan adı) ve
    // düzeltmesi için koşuyu baştan üretmek gerekiyordu.
    'ray-sol': 'rayaSol',
    'ray-orta': 'rayaOrta',
  }
  const alanAdi = (e) => ALAN[e.className.split(' ')[0]]

  d.querySelectorAll(
    '.baslik,.govde,.ust-baslik,.el-yazisi,.panel,.sayilar,.etiketler,.ray-sol,.ray-orta'
  ).forEach((e) => {
    const i = kartlar.indexOf(e.closest('section.kart'))
    const alan = alanAdi(e)
    if (i < 0 || alan === undefined) return
    const yazilabilir =
      e.className.split(' ')[0] !== 'panel' && ALAN[e.className.split(' ')[0]] !== 'panel'
    e.style.outline = '1px dashed rgba(90,169,230,.35)'

    if (duzenMod === 'yaz') {
      // ⚠ ⚠ **SİLME YAZ MODUNDA HİÇ ERİŞİLEBİLİR DEĞİLDİ.** *"⌫ bu ögeyi sil"*
      // düğmesi müfettişte YALNIZ `secili` doluyken çiziliyor, `secili` ise yalnız
      // TAŞI modundaki `pointerdown` ile doluyordu. Yani varsayılan modda kullanıcı
      // hangi ögeye tıklarsa tıklasın silme düğmesi hiç görünmüyordu — depo
      // sahibinin *"öge silme hiçbir şekilde çalışmıyor"* şikâyeti birebir bu.
      // Sunucu tarafı SAĞLAMDI (ölçüldü: `{tur:'sil'}` gövdeyi boşaltıyor); eksik
      // olan tek şey düğmeye ulaşan yoldu.
      //
      // ⚠ Yazılabilirlik BOZULMUYOR: seçim `contentEditable`ı kapatmıyor, yalnız
      // müfettişe "şu an bu öge" diyor. Panel gibi yazılamayan ögeler de seçilebilir
      // olmalı — silinecek şeylerin çoğu onlar.
      e.addEventListener('pointerdown', () => {
        secili = { i, alan, e }
        seciliKart = i
        for (const o of d.querySelectorAll('[data-secili]')) {
          o.removeAttribute('data-secili')
          o.style.outline = '1px dashed rgba(90,169,230,.35)'
        }
        e.setAttribute('data-secili', '1')
        e.style.outline = '2px solid rgba(90,169,230,.9)'
        mufettisiKur(sonDoc)
      })
      if (!yazilabilir) return
      e.contentEditable = 'true'
      e.addEventListener('blur', () =>
        yaz({ tur: 'metin', sec: e.className, i, deger: metinAl(e) })
      )
      return
    }

    // ── TAŞI modu: metin de görsel gibi sürükleniyor ve ölçekleniyor ────────
    // ⚠ Yazılan şey MUTLAK KONUM DEĞİL, kaydırma payı: şablonun ızgarası duruyor,
    // üstüne sınırlı bir pay biniyor (D-301 · Yasa 13). Sürükleme sırasında
    // transform canlı uygulanıyor ki göz sonucu görsün.
    e.contentEditable = 'false'
    e.style.cursor = 'move'
    const mevcut = (doc.kartlar[i] && doc.kartlar[i].ayar && doc.kartlar[i].ayar[alan]) || {}
    e.addEventListener('pointerdown', (ev) => {
      ev.preventDefault()
      ev.stopPropagation()
      secili = { i, alan, e }
      for (const o of d.querySelectorAll('[data-secili]')) {
        o.removeAttribute('data-secili')
        o.style.outline = '1px dashed rgba(90,169,230,.35)'
      }
      e.setAttribute('data-secili', '1')
      e.style.outline = '2px solid rgba(90,169,230,.9)'
      seciliKart = i
      mufettisiKur(doc)
      const x0 = ev.clientX,
        y0 = ev.clientY
      const dx0 = mevcut.dx || 0,
        dy0 = mevcut.dy || 0,
        o0 = mevcut.olcek || 1
      let son = { dx: dx0, dy: dy0, olcek: o0 }
      const surukle = (m) => {
        if (m.shiftKey) {
          // Yatay sürükleme punto çarpanı: 300 px ↔ 1 kat.
          son = {
            dx: dx0,
            dy: dy0,
            olcek: Math.min(2, Math.max(0.5, o0 + (m.clientX - x0) / 300)),
          }
          e.style.setProperty('--ayar-olcek', son.olcek)
        } else {
          son = { dx: dx0 + (m.clientX - x0), dy: dy0 + (m.clientY - y0), olcek: o0 }
          e.style.transform = 'translate(' + son.dx + 'px,' + son.dy + 'px)'
        }
      }
      const birak = () => {
        d.removeEventListener('pointermove', surukle)
        d.removeEventListener('pointerup', birak)
        yaz({
          tur: 'ayar',
          i,
          alan,
          dx: Math.round(son.dx),
          dy: Math.round(son.dy),
          olcek: +son.olcek.toFixed(3),
        })
      }
      d.addEventListener('pointermove', surukle)
      d.addEventListener('pointerup', birak)
    })
  })
  d.querySelectorAll('.gorsel,.gorsel-yer').forEach((e, i) => {
    // ⚠ Görsel de SEÇİLEBİLİR: müfettiş onun alanlarını (kırpma, alt metin, kutu)
    // ancak seçiliyken gösterebilir. Sürüklemeden önce seçim yapılıyor, sonra değil —
    // yoksa panel her sürükleyişte bir kare geriden gelirdi.
    e.addEventListener('pointerdown', () => {
      secili = { i, alan: 'gorsel', e }
      mufettisiKur(doc)
    })
    e.style.cursor = 'move'
    e.style.outline = '1px dashed rgba(90,169,230,.5)'
    e.addEventListener('pointerdown', (ev) => {
      ev.preventDefault()
      const b0 = e.getBoundingClientRect()
      // style.left/top KONUMLANMIS ATAYA gore, getBoundingClientRect ise goruntu
      // alanina gore olculuyor. Ata sifirda degilse (burada 40px asagida) fark her
      // surukleyisde birikir: y %40 yerine %42.96 yaziyordu.
      const a0 = (e.offsetParent || d.documentElement).getBoundingClientRect()
      const x0 = ev.clientX,
        y0 = ev.clientY,
        olcekli = doc.slaytGenisligi * doc.kartlar.length
      // olcek'e BOLUNMEZ. Olcek iframe ELEMENTine (parent'ta) uygulaniyor; iframe'in
      // kendi goruntu alani olceksiz kaliyor. Tarayici imlec konumunu iframe'e girerken
      // zaten donusturuyor, yani clientX ve getBoundingClientRect ayni olceksiz uzayda.
      // Bolmek donusumu IKI KEZ sayiyordu: shift basili degilken bile genislik
      // 16% -> 47.06% oluyordu (691px / 0.34 = 2033px).
      const surukle = (m) => {
        const dx = m.clientX - x0,
          dy = m.clientY - y0
        if (m.shiftKey) {
          e.style.width = Math.max(40, b0.width + dx) + 'px'
        } else {
          e.style.left = b0.left - a0.left + dx + 'px'
          e.style.top = b0.top - a0.top + dy + 'px'
        }
      }
      const birak = () => {
        d.removeEventListener('pointermove', surukle)
        d.removeEventListener('pointerup', birak)
        const b = e.getBoundingClientRect()
        yaz({
          tur: 'gorsel',
          i,
          x: +(((b.left - a0.left) / olcekli) * 100).toFixed(2),
          y: +(((b.top - a0.top) / doc.yukseklik) * 100).toFixed(2),
          genislik: +((b.width / olcekli) * 100).toFixed(2),
        })
      }
      d.addEventListener('pointermove', surukle)
      d.addEventListener('pointerup', birak)
    })
  })
}

// ⚠ ⚠ **KAYDEDİLMEMİŞ DEĞİŞİKLİK SAYILIYOR.** Düzenlemeler sunucu BELLEĞİNDE yaşıyor;
// "JSON'u yaz" denmeden sekme kapanırsa emek kaybolur ve bunu hiçbir şey söylemiyordu.
let kaydedilmemis = 0
const kaydiIsaretle = (n) => {
  kaydedilmemis = n
  const d = $('#kaydet')
  d.textContent = n === 0 ? 'JSON’u yaz' : `JSON’u yaz (${n} değişiklik)`
  d.dataset.bekleyen = n === 0 ? '' : '1'
}
window.addEventListener('beforeunload', (e) => {
  if (kaydedilmemis === 0) return
  e.preventDefault()
  e.returnValue = ''
})

// ⚠ ⚠ **YAZMALAR SIRAYA GİRİYOR ve bunu bir YARIŞ öğretti.** Silme düğmesine basmak
// önce düzenlenebilir ögede `blur` tetikliyor (metni geri yazan bir istek), sonra
// silme isteğini gönderiyordu. İki istek paralel gidiyor ve blur'unki SONRA varınca
// silinen metin geri geliyordu: kullanıcı siliyor, hiçbir şey olmuyor. Ölçüldü —
// gerçek tarayıcıda başlık silme sonrası AYNEN duruyordu.
//
// Sıra tek bir zincirle korunuyor: her yazma bir öncekinin bitmesini bekliyor. Tezgâh
// tek kullanıcılı ve yazmalar milisaniyeler sürüyor; kaybedilen şey yok, kazanılan şey
// SON SÖZÜN son yazana ait olması.
let yazmaZinciri = Promise.resolve()

async function yaz(d) {
  gecmis.push(1)
  kaydiIsaretle(kaydedilmemis + 1)
  yazmaZinciri = yazmaZinciri.then(async () => {
    await fetch('/degistir?id=' + id, { method: 'POST', body: JSON.stringify(d) })
    // ⚠ Yazdıktan sonra HEMEN yeniden çiziliyor: "uygula" düğmesi yok, karar gözle
    // veriliyor. Bu satır bir kez kazara silindi ve düzenleme sessizce görünmez oldu.
    await cek()
  })
  await yazmaZinciri
}
async function olc() {
  const r = await fetch('/olc?id=' + id)
  const k = await r.json()
  $('#kusur').textContent =
    k.length === 0
      ? '✓ kusur yok'
      : k.map((x) => '✗ kart ' + (x.kart ?? '–') + ' · ' + x.tur + ' · ' + x.aciklama).join('\\n')
}
// ⚠ ⚠ **ŞABLON DÜZENLEMEK İKİ KEZ SORULUYOR — ve bu bir kolaylık kaybı değil, bir
// ORANTI meselesi.** Bir KOŞUYU düzeltmek tek karoseli etkiler; bir ŞABLONU düzeltmek
// o şablondan üretilecek BÜTÜN gelecek karoselleri etkiler. İkisi aynı tıklama
// maliyetinde olamaz. Birinci onay şablona GİRERKEN, ikincisi katalog dosyasına
// YAZARKEN soruluyor: yanlışlıkla girmek ile yanlışlıkla yazmak ayrı kazalardır.
const sablonMu = (x) => String(x).startsWith('sablon:')
let sablonIzni = false

$('#sablon').onchange = (e) => {
  const yeni = e.target.value
  if (sablonMu(yeni) && !sablonIzni) {
    const onay = window.confirm(
      '⚠ DİKKAT — ŞABLON DÜZENLİYORSUN\n\n' +
        'Bu, altı tasarımdan birinin KAYNAĞI. Değiştirirsen bu şablondan üretilecek\n' +
        'BÜTÜN gelecek karoseller etkilenir — tek bir gönderi değil.\n\n' +
        'Tek bir çıktıyı düzeltmek istiyorsan listeden bir KOŞU seç.\n\n' +
        'Yine de şablonu açmak istiyor musun?'
    )
    if (!onay) {
      e.target.value = id
      return
    }
    sablonIzni = true
  }
  id = yeni
  cek()
}
$('#buyut').onclick = () => {
  olcek = Math.min(1, olcek * 1.25)
  cek()
}
$('#kucult').onclick = () => {
  olcek = Math.max(0.08, olcek / 1.25)
  cek()
}
$('#mod').onclick = () => {
  duzenMod = duzenMod === 'yaz' ? 'tasi' : 'yaz'
  $('#mod').textContent = duzenMod === 'yaz' ? '✎ yaz' : '✥ taşı'
  $('#ipucu').textContent =
    duzenMod === 'yaz'
      ? 'metne tıkla → düzenle · görseli sürükle → taşı · Shift+sürükle → ölçekle'
      : 'metni sürükle → kaydır · Shift+sürükle → punto · seç + ⌫ → sil'
  secili = null
  cek()
}

// ⚠ Silme "boş bırakmak" DEĞİL: render boş `ustBaslik`i hiç çizmiyor, boş `govde`yi
// zaten atlıyor, `panel: null` panelin kendisini kaldırıyor. Yani silinen şey
// belgeden düşüyor — ekranda boş bir kutu kalmıyor.
const sil = async () => {
  if (secili === null) {
    mesaj('⚠ önce ✥ TAŞI moduna geç ve silinecek ögeye tıkla')
    return
  }
  const { i, alan } = secili
  secili = null
  await yaz({ tur: 'sil', i, alan })
}
$('#sil').onclick = sil
// ⚠ ⚠ **KLAVYE İNCE AYAR İÇİN ŞART.** Fareyle 1 px kaydırmak elle yapılamaz;
// tasarımın son %5'i tam olarak o 1 px'lerde. Ok = 1 px, Shift+ok = 10 px.
const OKLAR = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }
document.addEventListener('keydown', (ev) => {
  if (duzenMod === 'tasi' && secili !== null && OKLAR[ev.key] !== undefined) {
    ev.preventDefault()
    const [ax, ay] = OKLAR[ev.key]
    const adim = ev.shiftKey ? 10 : 1
    const a = (sonDoc?.kartlar[secili.i]?.ayar ?? {})[secili.alan] ?? {}
    void yaz({
      tur: 'ayar',
      i: secili.i,
      alan: secili.alan,
      dx: (a.dx ?? 0) + ax * adim,
      dy: (a.dy ?? 0) + ay * adim,
      olcek: a.olcek ?? 1,
    })
    return
  }
  if (duzenMod === 'tasi' && (ev.key === 'Delete' || ev.key === 'Backspace')) {
    ev.preventDefault()
    void sil()
  }
})

// ⚠ Düğme etiketi DERİNLİĞİ gösteriyor: tıklanabilir görünüp hiçbir şey yapmayan bir
// "geri al", kullanıcıya düzenlemenin kaydedildiğini düşündürür.
const yiginiGoster = (geri, ileri) => {
  $('#geri').textContent = geri > 0 ? '↶ geri al (' + geri + ')' : '↶ geri al'
  $('#geri').disabled = geri === 0
  $('#ileri').textContent = ileri > 0 ? '↷ ileri (' + ileri + ')' : '↷ ileri'
  $('#ileri').disabled = ileri === 0
}

$('#ileri').onclick = async () => {
  await fetch('/ileri?id=' + id, { method: 'POST' })
  await cek()
}

document.addEventListener('keydown', (ev) => {
  if (!(ev.ctrlKey || ev.metaKey) || ev.key.toLowerCase() !== 'z') return
  ev.preventDefault()
  void (ev.shiftKey ? $('#ileri').onclick() : $('#geri').onclick())
})

$('#geri').onclick = async () => {
  await fetch('/geri?id=' + id, { method: 'POST' })
  await cek()
}
// ⚠ Sıfırlama ONAY istiyor: kaydedilmemiş işi atan bir düğme, yanlışlıkla
// basıldığında en pahalı düğmedir. Geri alınabilir olması yetmiyor — insan ne
// olacağını ÖNCE bilmeli.
// ⚠ İndirme bir GEZİNME: `fetch` ile alıp `Blob` kurmak aynı byte'ı bir kez daha
// belleğe kopyalardı ve tezgâh 9 MB'lık tuvallerle çalışıyor. `location` tarayıcının
// kendi indirme yolunu kullanıyor.
$('#disaAl').onclick = () => {
  const [tarz, bicim] = ($('#disa').value || 'dilim:png').split(':')
  mesaj('… dışa aktarılıyor (birkaç saniye)')
  window.location.href =
    '/disa-aktar?id=' + encodeURIComponent(id) + '&tarz=' + tarz + '&bicim=' + bicim
}
$('#sifirla').onclick = async () => {
  if (!confirm('Kaydedilmemiş tüm değişiklikler atılacak ve kaynak hâline dönülecek. Devam?'))
    return
  const r = await fetch('/sifirla?id=' + id, { method: 'POST' })
  mesaj(await r.text())
  await cek()
}
$('#kaydet').onclick = async () => {
  // İKİNCİ onay: girmek ayrı, YAZMAK ayrı. Katalog dosyası altı tasarımın kaynağı.
  if (sablonMu(id)) {
    const onay = window.confirm(
      '⚠ İKİNCİ ONAY — KATALOG DOSYASINA YAZILACAK\n\n' +
        id.replace('sablon:', '') +
        ' şablonu `packages/render/src/katalog-ornek.ts` içinde DEĞİŞECEK.\n' +
        'Bu şablondan üretilecek bütün gelecek karoseller bundan etkilenir.\n\n' +
        'Değişiklik bir ÖNERİdir: `git diff` ile bakabilir, commit etmeyerek geri\n' +
        'alabilirsin.\n\nYazılsın mı?'
    )
    if (!onay) {
      mesaj('⚠ yazılmadı — şablon dosyasına dokunulmadı')
      return
    }
  }
  const r = await fetch('/kaydet?id=' + id, { method: 'POST' })
  const cevap = await r.text()
  mesaj(cevap)
  if (cevap.startsWith('✓')) kaydiIsaretle(0)
}
// ⚠ Rampa ÖNCE okunuyor, sonra ilk çizim: panel açıldığı anda renk seçenekleri
// dolu olmalı. Sonradan yüklemek, ilk açılışta boş bir renk listesi gösterirdi.
if (acilamaz)
  mesaj(
    '⚠ ' +
      istenenId +
      ' bu editörde açılamıyor — o koşunun kompozisyon dosyası yok\n' +
      '  (panorama.json yalnız D-302 sonrası koşularda yazılıyor). Listeden başka bir\n' +
      '  koşu ya da şablon seç.'
  )

fetch('/rampa')
  .then((r) => r.json())
  .then((v) => {
    rampa = v
  })
  .catch(() => {
    rampa = []
  })
  .finally(() => {
    void cek()
  })
