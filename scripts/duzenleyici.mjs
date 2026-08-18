// Görsel şablon düzenleyici — PROTOTİP (D-301 · FAZ-15).
//
// ⚠ ⚠ **AYNI RENDER MOTORU, İKİNCİ BİR ÖNİZLEME DEĞİL.** Sayfa `panoramaHtml(doc)`
// çıktısını olduğu gibi bir iframe'e koyuyor. Böylece "gördüğün şey ihraç edilen şeydir"
// yapı gereği doğru — ayrı bir önizleme yolu yazsaydık iki motor olurdu (Yasa 4) ve
// ikisi bir gün ayrışırdı. Düzenleme, render'ın ÜSTÜNDE bir katman; render'ın içinde değil.
//
// ⚠ **Serbest piksel boyama YOK ve olmayacak.** Düzenlenen şey `KatalogOrnegi`nin
// ALANLARI; çıktı hâlâ veriden yeniden üretilebilir (Yasa 11). Fırça/leke isteniyorsa
// yolu dışa aktar → Photoshop → varlık olarak geri ver.
//
// ⚠ Bağımlılık yok: `node:http` + tarayıcı. Bir editör çatısı eklemek, düzenlediğimiz
// tasarımdan büyük bir bağımlılık olurdu.

import { createServer } from 'node:http'
import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const REPO = join(dirname(fileURLToPath(import.meta.url)), '..')
const { panoramaHtml } = await import(join(REPO, 'packages/render/dist/panorama.js'))
const { ORNEKLER } = await import(join(REPO, 'packages/render/dist/katalog-ornek.js'))
const { fontCss } = await import(join(REPO, 'packages/render/dist/fonts.js'))
const { logoVarliklari } = await import(join(REPO, 'packages/render/dist/logo.js'))

const f = fontCss(join(REPO, 'brand/brd_upcytech/fonts'))
const tokenCss = readFileSync(join(REPO, 'brand/brd_upcytech/derived-tokens/tokens.css'), 'utf8')
const lg = logoVarliklari(join(REPO, 'brand/brd_upcytech/logo'))
const stamp = {
  brandId: 'brd_upcytech',
  eraId: 'era_imalat_2026',
  kitVersion: 'kit-1',
  definitionDigest: 'sha256:duzenleyici',
  contextManifest: 'ctx',
  sourceRunId: 'run_duzenleyici',
}

/** Çalışan kopya — sunucu belleğinde. Kaydetmeden dosyaya DOKUNULMUYOR. */
const calisan = Object.fromEntries(
  Object.entries(ORNEKLER).map(([k, o]) => [k, structuredClone(o)])
)

const belge = (id) => ({
  ...calisan[id],
  tokenCss,
  fontCss: f.ok ? f.css : '',
  stamp,
  ...(lg.ok ? { logo: lg.varliklar } : {}),
})

const KABUK = (
  id
) => `<!doctype html><meta charset="utf-8"><title>Şablon düzenleyici — ${id}</title>
<style>
  :root{--ui:#14161a;--kenar:#2a2e36;--metin:#e6e8ec;--vurgu:#5aa9e6}
  *{box-sizing:border-box} body{margin:0;background:#0d0f12;color:var(--metin);
    font:14px/1.45 ui-sans-serif,system-ui}
  header{display:flex;gap:14px;align-items:center;padding:10px 16px;background:var(--ui);
    border-bottom:1px solid var(--kenar);position:sticky;top:0;z-index:10}
  select,button{background:#1b1f26;color:var(--metin);border:1px solid var(--kenar);
    border-radius:7px;padding:7px 12px;font:inherit;cursor:pointer}
  button.birincil{background:var(--vurgu);color:#06202f;border-color:transparent;font-weight:650}
  #tuval{padding:18px;overflow:auto}
  #sahne-sarmal{position:relative}
  iframe{border:0;display:block;transform-origin:0 0;background:#000}
  /* Kesim kilavuzu PARENT'ta duruyor, iframe'in icinde DEGIL: render'a tek piksel
     eklemiyor. Kesintisiz karoselde asil soru "hangi oge hangi slayta dusuyor" ve
     kesimler gorunmeden bu goz kararidir. */
  #kilavuz{position:absolute;inset:0;pointer-events:none}
  #kilavuz i{position:absolute;top:0;bottom:0;width:1px;background:rgba(255,96,96,.55)}
  #kilavuz b{position:absolute;top:4px;font:11px/1 ui-monospace,monospace;
    color:rgba(255,96,96,.8);transform:translateX(6px)}
  #ipucu{margin-left:auto;opacity:.62;font-size:12.5px}
  #kusur{padding:8px 16px;background:#1b1f26;border-top:1px solid var(--kenar);
    font:12.5px/1.5 ui-monospace,monospace;white-space:pre-wrap;max-height:26vh;overflow:auto}
</style>
<header>
  <select id="sablon">${Object.keys(calisan)
    .map((k) => `<option${k === id ? ' selected' : ''}>${k}</option>`)
    .join('')}</select>
  <button id="kucult">−</button><button id="buyut">+</button>
  <button id="geri">↶ geri al</button>
  <button class="birincil" id="kaydet">JSON'u yaz</button>
  <span id="ipucu">metne tıkla → düzenle · görseli sürükle → taşı · Shift+sürükle → ölçekle</span>
</header>
<div id="tuval"><div id="sahne-sarmal"><iframe id="pano"></iframe><div id="kilavuz"></div></div></div>
<div id="kusur">ölçüm bekleniyor…</div>
<script type="module">
const $ = (s) => document.querySelector(s)
let id = $('#sablon').value, olcek = 0.34, gecmis = []

async function cek() {
  const r = await fetch('/pano?id=' + id); const { html, doc } = await r.json()
  const fr = $('#pano'); fr.srcdoc = html
  fr.style.width = (doc.slaytGenisligi * doc.kartlar.length) + 'px'
  fr.style.height = doc.yukseklik + 'px'
  fr.style.transform = 'scale(' + olcek + ')'
  const gen = doc.slaytGenisligi * doc.kartlar.length * olcek, yuk = doc.yukseklik * olcek
  $('#sahne-sarmal').style.width = gen + 'px'
  $('#sahne-sarmal').style.height = yuk + 'px'
  $('#tuval').style.height = (yuk + 36) + 'px'
  const kl = $('#kilavuz'); kl.innerHTML = ''
  for (let n = 0; n < doc.kartlar.length; n++) {
    const sol = n * doc.slaytGenisligi * olcek
    if (n > 0) { const c = document.createElement('i'); c.style.left = sol + 'px'; kl.appendChild(c) }
    const e = document.createElement('b'); e.style.left = sol + 'px'
    e.textContent = String(n + 1).padStart(2, '0'); kl.appendChild(e)
  }
  fr.onload = () => { bagla(fr.contentDocument, doc); olc() }
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
  const metinAl = (e) => [...e.childNodes].map((n) =>
    n.nodeType === 3 ? n.nodeValue
      : n.tagName === 'BR' ? '\\n'
      : n.tagName === 'STRONG' ? '**' + n.textContent + '**'
      : n.textContent).join('')
  d.querySelectorAll('.baslik,.govde,.ust-baslik,.el-yazisi').forEach((e) => {
    const i = kartlar.indexOf(e.closest('section.kart'))
    if (i < 0) return
    e.contentEditable = 'true'; e.style.outline = '1px dashed rgba(90,169,230,.35)'
    e.addEventListener('blur', () => yaz({ tur: 'metin', sec: e.className, i, deger: metinAl(e) }))
  })
  d.querySelectorAll('.gorsel,.gorsel-yer').forEach((e, i) => {
    e.style.cursor = 'move'; e.style.outline = '1px dashed rgba(90,169,230,.5)'
    e.addEventListener('pointerdown', (ev) => {
      ev.preventDefault(); const b0 = e.getBoundingClientRect()
      // style.left/top KONUMLANMIS ATAYA gore, getBoundingClientRect ise goruntu
      // alanina gore olculuyor. Ata sifirda degilse (burada 40px asagida) fark her
      // surukleyisde birikir: y %40 yerine %42.96 yaziyordu.
      const a0 = (e.offsetParent || d.documentElement).getBoundingClientRect()
      const x0 = ev.clientX, y0 = ev.clientY, olcekli = doc.slaytGenisligi * doc.kartlar.length
      // olcek'e BOLUNMEZ. Olcek iframe ELEMENTine (parent'ta) uygulaniyor; iframe'in
      // kendi goruntu alani olceksiz kaliyor. Tarayici imlec konumunu iframe'e girerken
      // zaten donusturuyor, yani clientX ve getBoundingClientRect ayni olceksiz uzayda.
      // Bolmek donusumu IKI KEZ sayiyordu: shift basili degilken bile genislik
      // 16% -> 47.06% oluyordu (691px / 0.34 = 2033px).
      const surukle = (m) => {
        const dx = m.clientX - x0, dy = m.clientY - y0
        if (m.shiftKey) { e.style.width = Math.max(40, b0.width + dx) + 'px' }
        else { e.style.left = (b0.left - a0.left + dx) + 'px'; e.style.top = (b0.top - a0.top + dy) + 'px' }
      }
      const birak = (m) => {
        d.removeEventListener('pointermove', surukle); d.removeEventListener('pointerup', birak)
        const b = e.getBoundingClientRect()
        yaz({ tur: 'gorsel', i,
          x: +((b.left - a0.left) / olcekli * 100).toFixed(2),
          y: +((b.top - a0.top) / doc.yukseklik * 100).toFixed(2),
          genislik: +(b.width / olcekli * 100).toFixed(2) })
      }
      d.addEventListener('pointermove', surukle); d.addEventListener('pointerup', birak)
    })
  })
}

async function yaz(d) { gecmis.push(1); await fetch('/degistir?id=' + id, { method: 'POST', body: JSON.stringify(d) }); cek() }
async function olc() {
  const r = await fetch('/olc?id=' + id); const k = await r.json()
  $('#kusur').textContent = k.length === 0 ? '✓ kusur yok'
    : k.map((x) => '✗ kart ' + (x.kart ?? '–') + ' · ' + x.tur + ' · ' + x.aciklama).join('\\n')
}
$('#sablon').onchange = (e) => { id = e.target.value; cek() }
$('#buyut').onclick = () => { olcek = Math.min(1, olcek * 1.25); cek() }
$('#kucult').onclick = () => { olcek = Math.max(.08, olcek / 1.25); cek() }
$('#geri').onclick = async () => { await fetch('/geri?id=' + id, { method: 'POST' }); cek() }
$('#kaydet').onclick = async () => {
  const r = await fetch('/kaydet?id=' + id, { method: 'POST' })
  $('#kusur').textContent = await r.text()
}
cek()
</script>`

// ── ölçüm: denetim tarayıcıda koşuyor, ayrı bir motor yok ────────────────────
const olcum = async (id) => {
  const { panoramaDenetle } = await import(join(REPO, 'packages/render/dist/panorama-denetim.js'))
  const { withPage } = await import(join(REPO, 'packages/render/dist/browser.js'))
  const d = belge(id)
  const r = await withPage(async (page) => {
    await page.setViewportSize({ width: d.slaytGenisligi * d.kartlar.length, height: d.yukseklik })
    await page.setContent(panoramaHtml(d))
    return page.evaluate(panoramaDenetle(d))
  }, {})
  return r.ok ? r.value : []
}

const govde = (req) =>
  new Promise((c) => {
    let s = ''
    req.on('data', (x) => (s += x))
    req.on('end', () => c(s))
  })

const yedek = {}
const sunucu = createServer(async (req, res) => {
  const u = new URL(req.url, 'http://x')
  const id = u.searchParams.get('id') ?? 'sahne'
  const json = (v) => {
    res.writeHead(200, { 'content-type': 'application/json' })
    res.end(JSON.stringify(v))
  }
  try {
    if (u.pathname === '/') {
      res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' })
      return res.end(KABUK(id))
    }
    if (u.pathname === '/pano') return json({ html: panoramaHtml(belge(id)), doc: calisan[id] })
    if (u.pathname === '/olc') return json(await olcum(id))
    if (u.pathname === '/degistir') {
      const d = JSON.parse(await govde(req))
      yedek[id] = structuredClone(calisan[id])
      if (d.tur === 'gorsel') {
        const g = calisan[id].gorseller[d.i]
        if (g) Object.assign(g, { x: d.x, y: d.y, genislik: d.genislik })
      } else {
        const alan = d.sec.split(' ')[0]
        const harita = {
          baslik: 'baslik',
          govde: 'govde',
          'ust-baslik': 'ustBaslik',
          'el-yazisi': 'elYazisi',
        }
        const k = calisan[id].kartlar[d.i]
        if (k && harita[alan]) k[harita[alan]] = d.deger.trim()
      }
      return json({ ok: true })
    }
    if (u.pathname === '/geri') {
      if (yedek[id]) calisan[id] = structuredClone(yedek[id])
      return json({ ok: true })
    }
    if (u.pathname === '/kaydet') {
      // ⚠ PROTOTİP: dosyaya YAZMIYOR. Değişikliği JSON olarak basıyor ki tur içinde
      // gözle doğrulanabilsin. Yazma yolu (şablon mu, tek koşu mu) ayrı bir karar.
      const yol = join(REPO, 'derived/duzenleyici-' + id + '.json')
      const { writeFileSync } = await import('node:fs')
      writeFileSync(yol, JSON.stringify(calisan[id], null, 2))
      res.writeHead(200, { 'content-type': 'text/plain; charset=utf-8' })
      return res.end('✓ yazıldı: ' + yol + '\n⚠ Bu bir ÖNİZLEME dosyası; katalog değişmedi.')
    }
    res.writeHead(404)
    res.end('yok')
  } catch (e) {
    // ⚠ Basliklar GONDERILDIKTEN sonra atilan bir hatada writeHead ikinci kez
    // cagriliyordu; ERR_HTTP_HEADERS_SENT yakalanmadan sureci olduruyor ve asil
    // hatayi da gizliyordu. Once logla, sonra yalniz yazilabilirse cevap ver.
    console.error('[' + u.pathname + ']', e?.stack ?? e)
    if (!res.headersSent) res.writeHead(500, { 'content-type': 'text/plain; charset=utf-8' })
    res.end(String(e?.stack ?? e))
  }
})

// Tek bir istek hatasi tezgahi indirmesin: duzenleyici acik kalir, hata log'a duser.
process.on('uncaughtException', (e) => console.error('[yakalanmadi]', e?.stack ?? e))
process.on('unhandledRejection', (e) => console.error('[reddedildi]', e?.stack ?? e))

// Sabit. Ortamdan okunmuyor: `secret-rotasyon` kapisi kodda okunan her ortam
// anahtarini rotasyon tablosunda ariyor ve PORT bir sir DEGIL. Kapiyi gevsetmek
// yerine ihtiyaci kaldirdim — yerel bir tezgahin portu yapilandirilabilir olmak
// zorunda degil (R-76: kirmizi kapinin kurali ayni turda gevsetilmez).
const PORT = 4321
sunucu.listen(PORT, () => {
  console.log(`\n  şablon düzenleyici → http://localhost:${PORT}\n`)
  console.log(`  metne tıkla · görseli sürükle · Shift+sürükle ölçekler`)
  console.log(`  ⚠ prototip: katalog dosyasına YAZMIYOR, derived/ altına JSON basıyor\n`)
})
