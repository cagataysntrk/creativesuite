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
let id = $('#sablon').value,
  olcek = 0.34,
  gecmis = []
// ⚠ İKİ MOD, çünkü ikisi aynı anda OLAMAZ: contenteditable bir ögede sürüklemek
// metni SEÇER, taşımaz. Tek modda denendi ve yazı düzenlemek imkânsızlaştı.
let duzenMod = 'yaz' // 'yaz' → metne yaz · 'tasi' → metni taşı/ölçekle/sil
let secili = null // 'tasi' modunda seçili öge (silme hedefi)

async function cek() {
  const r = await fetch('/pano?id=' + id)
  const { html, doc } = await r.json()
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
    olc()
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
  }
  const alanAdi = (e) => ALAN[e.className.split(' ')[0]]

  d.querySelectorAll('.baslik,.govde,.ust-baslik,.el-yazisi,.panel,.sayilar,.etiketler').forEach(
    (e) => {
      const i = kartlar.indexOf(e.closest('section.kart'))
      const alan = alanAdi(e)
      if (i < 0 || alan === undefined) return
      const yazilabilir =
        e.className.split(' ')[0] !== 'panel' && ALAN[e.className.split(' ')[0]] !== 'panel'
      e.style.outline = '1px dashed rgba(90,169,230,.35)'

      if (duzenMod === 'yaz') {
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
    }
  )
  d.querySelectorAll('.gorsel,.gorsel-yer').forEach((e, i) => {
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

async function yaz(d) {
  gecmis.push(1)
  await fetch('/degistir?id=' + id, { method: 'POST', body: JSON.stringify(d) })
  cek()
}
async function olc() {
  const r = await fetch('/olc?id=' + id)
  const k = await r.json()
  $('#kusur').textContent =
    k.length === 0
      ? '✓ kusur yok'
      : k.map((x) => '✗ kart ' + (x.kart ?? '–') + ' · ' + x.tur + ' · ' + x.aciklama).join('\\n')
}
$('#sablon').onchange = (e) => {
  id = e.target.value
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
    $('#kusur').textContent = '⚠ önce ✥ TAŞI moduna geç ve silinecek ögeye tıkla'
    return
  }
  const { i, alan } = secili
  secili = null
  await yaz({ tur: 'sil', i, alan })
}
$('#sil').onclick = sil
document.addEventListener('keydown', (ev) => {
  if (duzenMod === 'tasi' && (ev.key === 'Delete' || ev.key === 'Backspace')) {
    ev.preventDefault()
    void sil()
  }
})

$('#geri').onclick = async () => {
  await fetch('/geri?id=' + id, { method: 'POST' })
  cek()
}
$('#kaydet').onclick = async () => {
  const r = await fetch('/kaydet?id=' + id, { method: 'POST' })
  $('#kusur').textContent = await r.text()
}
cek()
