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
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const REPO = join(dirname(fileURLToPath(import.meta.url)), '..')
const { panoramaHtml, renderPanorama } = await import(
  join(REPO, 'packages/render/dist/panorama.js')
)
// ⚠ Dışa aktarma AYNI motordan (R-30): editör kendi çıktıcısını yazsaydı panelin
// indirdiğiyle editörün indirdiği iki farklı dosya olurdu.
const { panoramaDisaAktar } = await import(join(REPO, 'packages/render/dist/disa-aktar.js'))
const { ORNEKLER } = await import(join(REPO, 'packages/render/dist/katalog-ornek.js'))
const { fontCss } = await import(join(REPO, 'packages/render/dist/fonts.js'))
// ⚠ Yazma AYNI fonksiyondan geliyor. Editör kendi serileştiricisini yazsaydı iki biçim
// olurdu ve biri gün gelip ötekinden ayrışırdı — hattın yazdığı defteri editör
// okuyamaz hâle gelirdi.
const { panoramaBelgesiniYaz } = await import(join(REPO, 'packages/engine/dist/verbs/bodies.js'))
const { logoVarliklari } = await import(join(REPO, 'packages/render/dist/logo.js'))
const { kosuBelgeYolu, kosuBelgesiniOku } = await import(
  join(REPO, 'packages/render/dist/kosu-belgesi.js')
)
// ⚠ ⚠ **EDİTÖRDEN GÖRSEL ÜRETME — sağlayıcı köprüsü HATTIN KULLANDIĞIYLA AYNI.** Depo
// sahibi: *"editörde modele prompt gönderip görsel üretme olmalı, beğenmediğimizi silip
// yerine kendimiz ürettirebiliriz."* İkinci bir çağrı yolu yazmak, R-20 muhafızının ve
// şerit kurallarının atlandığı bir arka kapı açardı.
const { adapterById, loadDescriptors, saglayiciOrtami } = await import(
  join(REPO, 'packages/providers/dist/index.js')
)
const { readEnv } = await import(join(REPO, 'packages/kernel/dist/index.js'))
// ⚠ ⚠ **WEBDEN TASARIM ÖGESİ ARAMA — HATTA DEĞİL, EDİTÖRE.** Depo sahibi: *"üretim
// hattında otomatik olmayacak yani bir görsel yuvasına tıklayıp webden ara denip
// aranabilecek"*. Hat deterministik kalıyor; dış kaynak yalnız insanın tıkladığı anda
// giriyor. Gerekçenin tamamı modülün başında.
const webAra = await import(join(REPO, 'scripts/duzenleyici-web-ara.mjs'))
// ⚠ Chromium TEK yerden açılıyor (`chokepoints.json` → `chromium-baslatan`): rasterleme
// `withPage`i ödünç alıyor, kendi `chromium.launch()`unu YAZMIYOR (R-30).
const { withPage } = await import(join(REPO, 'packages/render/dist/browser.js'))
const { descriptors: TANIMLAYICILAR } = loadDescriptors(join(REPO, 'registry/providers'))
const SAGLAYICI_ORTAMI = saglayiciOrtami(TANIMLAYICILAR, readEnv, ['CF_ACCOUNT_ID'])

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

/**
 * İKİ MOD, tek tezgâh (D-301 · depo sahibinin kararı).
 *
 * `sablon:*` katalog taslakları — düzenlenirse altı tasarımın kendisi değişir.
 * `kosu:*`   üretilmiş karoseller — düzenlenirse yalnız O koşu değişir.
 *
 * ⚠ Koşu kaydı ancak `render` adımı belgeyi diske yazdığı için mümkün. Önceden
 * defterde yalnız ÖZET vardı ve üretilmiş bir karosel bir daha AÇILAMIYORDU.
 */
const KOSU_DIZINI = join(REPO, 'derived/runs')

/**
 * Koşu ELENMİŞ mi — bir kapıda `rejected` kararı almış mı.
 *
 * ⚠ ⚠ **BU, KUYRUĞUNKİNDEN BAŞKA BİR SORU ve o yüzden burada ayrı yazılıyor.**
 * `bekleyenler()` *"bu koşu BANA mı bekliyor"* diye soruyor: kapısı var ve o kapıya
 * karar verilmemiş. Editörün sorusu *"bu koşu hâlâ yaşıyor mu"*. İkisi farklı: onaylanıp
 * bitmiş bir koşu kuyrukta durmaz ama editörde açılabilmeli, elenmiş bir koşu ise
 * ikisinde de durmamalı. Aynı yüklemi kopyalamak yerine kendi yüklemini yazmak,
 * yarın kuyruk kuralı değişince editörün sessizce yanlış listelemesini önlüyor.
 *
 * ⚠ Emeklilik SİLME DEĞİL (Yasa 10): koşu diskte duruyor, defteri duruyor, gerekçesi
 * duruyor. Yalnız listede görünmüyor — ve `?elenmis=1` ile geri geliyor. Geri dönüşü
 * olmayan bir gizleme, kaybetmenin başka adıdır.
 */
const elenmisMi = (dizin) => {
  try {
    const m = JSON.parse(readFileSync(join(dizin, 'manifest.json'), 'utf8'))
    return (m.decisions ?? []).some((d) => d.decision === 'rejected')
  } catch {
    // Manifest okunamıyorsa koşu elenmiş SAYILMIYOR: bilinmezliği gizlemeye çevirmek,
    // bozuk bir defteri sessizce yok saymak olurdu.
    return false
  }
}

// ⚠ ⚠ **SÜZGEÇ BURADA DEĞİL, AÇILIR LİSTEDE — ve sebebi ÖLÇÜLDÜ.** İlk sürüm elemeyi
// bu taramaya koymuştu; tarama HER istekte koşuyor (`/degistir` her kaydırak
// hareketinde) ve 202 manifest okumak 19,7 ms sürüyor (manifest başına 0,10 ms).
// Yani bir kaydırağı sürüklemek her karede 20 ms manifest okuması demekti. Eleme
// yalnız listeyi ilgilendiriyor ve liste yalnız sayfa açılışında kuruluyor.
const kosulariTara = () => {
  if (!existsSync(KOSU_DIZINI)) return []
  return readdirSync(KOSU_DIZINI)
    .map((ad) => ({ ad, dizin: join(KOSU_DIZINI, ad), yol: kosuBelgeYolu(join(KOSU_DIZINI, ad)) }))
    .filter((k) => k.yol !== null)
    .map((k) => ({ ...k, zaman: statSync(k.yol).mtimeMs }))
    .sort((a, b) => b.zaman - a.zaman)
}

/**
 * Defterdeki REFERANS biçimini geri dolduruyor: `fontCss` markadan (belge() yapıyor),
 * görsel ise yanındaki PNG'den. Dosya silinmişse görsel BOŞ geçiliyor — kompozisyon
 * yine açılıyor. Sessizce yer tutucu çizmektense boş kutu göstermek dürüst: eksik olan
 * şey görülsün.
 */
const kosuBelgesi = (dizin, sadeceAsil = false) => {
  // ⚠ ⚠ **HANGİ BELGE ve GÖRSELLERİN GÖMÜLMESİ tek fonksiyonda** (`@suite/render`).
  // İkisi de burada YAZILIYDI: çeviri sunucunun bilmediği bir kopyaydı (slaytlar
  // görselsiz dışa aktarıldı) ve seçim hiç yoktu — editör her açılışta ASLINI
  // açıyor, elle düzenlenmiş sürümü görmezden geliyordu.
  const r = kosuBelgesiniOku(dizin, sadeceAsil)
  if (r === null) throw new Error('belge yok: ' + dizin)
  return r.belge
}

/** Çalışan kopya — sunucu belleğinde. Kaydetmeden dosyaya DOKUNULMUYOR. */
const calisan = {}
const kaynak = {}
for (const [k, o] of Object.entries(ORNEKLER)) {
  calisan['sablon:' + k] = structuredClone(o)
  kaynak['sablon:' + k] = { tur: 'sablon', ad: k }
}
/**
 * Koşuları belleğe alır — **her istekte yeniden, ama ÜSTÜNE YAZMADAN.**
 *
 * ⚠ ⚠ **İKİ KUSUR BİRDEN BURADAYDI.** (1) Liste açılışta bir kez taranıyor ve `slice(0,12)`
 * ile ON İKİ koşuyla sınırlanıyordu: panelden *"bu koşuyu editörde aç"* denen koşu o
 * on ikinin dışındaysa `calisan[id]` boş kalıyor ve editör ŞABLONU açıyordu — depo
 * sahibinin gördüğü şey buydu. (2) Editör açıkken üretilen hiçbir koşu listeye
 * girmiyordu; tezgâhı kapatıp açmak gerekiyordu.
 *
 * ⚠ Var olan kayıt EZİLMİYOR: düzenlenmiş bir kopyanın üstüne diskteki hâli yazmak,
 * kaydedilmemiş işi sessizce silmek olurdu.
 */
/**
 * Koşunun HANGİ ŞABLONDAN üretildiği — kendi defterinden.
 *
 * ⚠ ⚠ **KOŞU PARAMETRESİNDEN OKUNMUYOR ve sebebi ölçülmüş bir yalan.** `kosu-parametreleri.json`
 * `sablon` alanını ancak panel/CLI onu yazdıysa taşıyor; sistem kendi seçtiğinde alan BOŞ.
 * Bu tam olarak bir kez yanlış rapora yol açtı: bir koşuya `veri-hikayesi` dendi, adım
 * çıktısı okununca `sahne` olduğu görüldü. Tek doğru kaynak `sablon-uyarla` adımının
 * kendi çıktısı — üretimi gerçekte hangi şablonun taşıdığını yalnız o biliyor.
 */
const kosuSablonu = (dizin) => {
  try {
    return (
      JSON.parse(readFileSync(join(dizin, 'steps/sablon-uyarla.json'), 'utf8')).uyarlama.sablonId ??
      ''
    )
  } catch {
    return ''
  }
}

const kosulariYukle = () => {
  for (const k of kosulariTara()) {
    const id = 'kosu:' + k.ad
    if (calisan[id] !== undefined) continue
    try {
      calisan[id] = kosuBelgesi(k.dizin)
      kaynak[id] = {
        tur: 'kosu',
        ad: k.ad,
        dizin: join(KOSU_DIZINI, k.ad),
        sablon: kosuSablonu(k.dizin),
      }
    } catch {
      // Bozuk defter tezgâhı indirmesin; o koşu listede çıkmaz.
    }
  }
}
kosulariYukle()

// ⚠ `calisan[id]` EN SONA yayılıyor: koşu belgesi kendi `tokenCss`ini ve damgasını
// TAŞIYOR ve o koşunun dönemine ait. Varsayılanı üstüne yazmak, geçmiş bir koşuyu
// bugünkü paletle göstermek olurdu — düzenlediğin şey artık üretilen şey olmazdı.
const belge = (id) => ({
  tokenCss,
  fontCss: f.ok ? f.css : '',
  stamp,
  ...(lg.ok ? { logo: lg.varliklar } : {}),
  ...calisan[id],
})

const KABUK = (
  id,
  elenmisDe = false
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
  #govde{display:flex;align-items:flex-start;gap:0}
  #tuval{padding:18px;overflow:auto;flex:1;min-width:0}
  /* ⚠ Müfettiş SAĞDA ve SABİT genişlikte: tuval yatay kayıyor (panorama 4320 px) ve
     panelin onunla birlikte kayması, düzenlerken sürekli geri kaydırmak demekti. */
  #mufettis{width:288px;flex:none;align-self:stretch;background:var(--ui);
    border-left:1px solid var(--kenar);padding:12px 14px 40px;overflow:auto;
    max-height:calc(100vh - 58px)}
  #mufettis h3{font-size:11px;letter-spacing:.14em;opacity:.55;margin:16px 0 8px;
    font-weight:700}
  #mufettis h3:first-child{margin-top:0}
  /* ── WEBDEN ARAMA MODALI (madde 12) ────────────────────────────────────────
     ⚠ ⚠ **SONUÇLAR ESKİDEN SAĞ PANELİN EN DİBİNDEYDİ.** Depo sahibi: *"webden
     görseli ara diyince nereye geliyor sonuçlar göremiyorum"*. 288 px'lik müfettiş
     sütununda, sekiz kaydırağın ve iki metin kutusunun ALTINDA, kaydırmadan
     görünmüyorlardı — arama çalışıyordu ama sonucu yoktu.
     ⚠ Modal tuvalin ÜSTÜNE geliyor: aranan şey görselin kendisi ve küçük bir
     kutuda ikon seçmek, seçmemekle aynı şey. */
  #ara-perde{position:fixed;inset:0;background:#05070aee;z-index:50;display:none;
    align-items:center;justify-content:center;padding:32px}
  #ara-perde.acik{display:flex}
  .ara-oge{position:relative}
  /* ⚠ 3D rozeti köşede: küçük resimde düz ikon ile 3D render'ı ayırt etmek gerekiyor. */
  .ara-rozet{position:absolute;top:4px;left:4px;background:#0b0f14cc;border:1px solid #2a3441;
    border-radius:4px;color:#8fd0ff;font:600 9px/1 ui-monospace,monospace;padding:3px 4px}
  #ara-kutu{background:var(--ui);border:1px solid var(--kenar);border-radius:12px;
    width:min(980px,100%);max-height:86vh;display:flex;flex-direction:column;overflow:hidden}
  #ara-baslik{display:flex;gap:10px;align-items:center;padding:14px 16px;
    border-bottom:1px solid var(--kenar)}
  #ara-baslik input[type=search]{flex:1;background:#0d0f12;color:var(--metin);
    border:1px solid var(--kenar);border-radius:7px;padding:9px 12px;font:inherit}
  #ara-durum{padding:8px 16px;font-size:12.5px;opacity:.75;border-bottom:1px solid var(--kenar)}
  #ara-izgara{display:grid;grid-template-columns:repeat(auto-fill,minmax(112px,1fr));
    gap:10px;padding:14px 16px;overflow:auto;flex:1}
  .ara-oge{background:#1b1f26;border:1px solid var(--kenar);border-radius:9px;padding:8px;
    display:flex;flex-direction:column;gap:6px;align-items:center;cursor:pointer}
  .ara-oge:hover{border-color:var(--vurgu)}
  .ara-oge img{width:56px;height:56px}
  .ara-oge small{font-size:10px;opacity:.6;text-align:center;line-height:1.25;
    word-break:break-word}
  .ara-oge .kova{font-size:10.5px;padding:3px 7px;border-radius:5px}
  /* ⚠ KOVA: seçilen ögeler burada birikiyor ki *"diğerleri istendiği zaman
     denenebilsin"*. Arama kapanınca sonuçlar kayboluyordu; bir sonrakini denemek
     için baştan aramak gerekiyordu. */
  #kova-serit{display:flex;gap:6px;flex-wrap:wrap;margin-block-start:6px}
  #kova-serit .kova-oge{background:#1b1f26;border:1px solid var(--kenar);border-radius:7px;
    padding:4px;cursor:pointer;position:relative}
  #kova-serit .kova-oge:hover{border-color:var(--vurgu)}
  #kova-serit img{width:34px;height:34px;display:block}
  #mufettis label{display:block;font-size:12px;margin:0 0 9px}
  #mufettis label span{display:flex;justify-content:space-between;opacity:.72;
    margin-bottom:3px}
  #mufettis input[type=range]{width:100%;accent-color:var(--vurgu)}
  #mufettis select,#mufettis input[type=text],#mufettis input[type=number]{
    width:100%;background:#1b1f26;color:var(--metin);border:1px solid var(--kenar);
    border-radius:6px;padding:5px 8px;font:inherit;font-size:12px}
  #mufettis .bos{opacity:.45;font-size:12px;line-height:1.5}
  #mufettis .sil{width:100%;margin-top:6px;border-color:#7a3030;color:#ff9b9b}
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
  /* ⚠ ⚠ **EYLEM MESAJI ile ÖLÇÜM AYRI SATIRLAR.** İkisi aynı yeri paylaşıyordu ve
     her eylemden sonra koşan ölçüm mesajı SİLİYORDU: şablona görsel koyma reddi
     ekranda hiç görünmedi, kullanıcı işlemin başarılı olduğunu sanırdı. Süreğen bir
     ölçümle geçici bir sonuç aynı yüzeyi paylaşamaz. */
  #mesaj{padding:0 16px;background:#1b1f26;font:12.5px/2.2 ui-monospace,monospace;
    white-space:pre-wrap;border-top:1px solid var(--kenar);min-height:0;transition:.15s}
  #mesaj:empty{padding:0;border:0}
  #mesaj.hata{color:#ff9b9b}
  #mesaj.iyi{color:#8fd18f}
  #kusur{padding:8px 16px;background:#1b1f26;border-top:1px solid var(--kenar);
    font:12.5px/1.5 ui-monospace,monospace;white-space:pre-wrap;max-height:26vh;overflow:auto}
</style>
<header>
  <select id="sablon">
    <optgroup label="ŞABLON — düzenlersen altı tasarımın kendisi değişir">${Object.keys(kaynak)
      .filter((k) => kaynak[k].tur === 'sablon')
      .map((k) => `<option value="${k}"${k === id ? ' selected' : ''}>${kaynak[k].ad}</option>`)
      .join('')}</optgroup>
    <optgroup label="KOŞU — düzenlersen yalnız o karosel değişir">${Object.keys(kaynak)
      // ⚠ ⚠ **ELENMİŞ KOŞU LİSTEDE YOK.** Depo sahibi: *"editörde panelde elenmiş
      // koşular listelenmemeli"*. Ölçüldü: editör 56 koşu gösteriyordu, panelde açık
      // olan 10'du — aradaki 46 emekli koşuydu ve doğru olanı bulmak samanlıkta iğne
      // aramaya dönmüştü. Süzgeç BURADA da var çünkü `calisan` bir önbellek: tezgâh
      // açıkken elenen bir koşu yüklü kalır ve yalnız taramayı süzmek onu gizlemezdi.
      // ⚠ `?elenmis=1` hepsini geri getiriyor — emeklilik silme değildir (Yasa 10) ve
      // geri dönüşü olmayan bir gizleme, kaybetmenin başka adıdır.
      .filter((k) => kaynak[k].tur === 'kosu' && (elenmisDe || !elenmisMi(kaynak[k].dizin)))
      .map(
        (k) =>
          `<option value="${k}"${k === id ? ' selected' : ''}>${
            // ⚠ ŞABLON ADI ÖNDE: *"koşularda hangi şablondan olduğu da yazsın"*. Koşu
            // kimliği tek başına hiçbir şey söylemiyordu — on üretimden hangisi olduğunu
            // görmek için koşuyu AÇMAK gerekiyordu.
            (kaynak[k].sablon === '' ? '—' : kaynak[k].sablon) + ' · ' + kaynak[k].ad.slice(4, 17)
          }</option>`
      )
      .join('')}</optgroup>
  </select>
  <button id="kucult">−</button><button id="buyut">+</button>
  <button id="mod">✎ yaz</button>
  <button id="sil">⌫ sil</button>
  <button id="geri">↶ geri al</button>
  <button id="ileri">↷ ileri</button>
  <button id="sifirla">⟲ değişiklikleri sıfırla</button>
  <!-- ⚠ ⚠ **ÇIKTI ALMAK EDİTÖRDE HİÇ YOKTU.** Tezgâhta düzeltip sonra dosyayı koşu
       dizininden elle bulmak gerekiyordu. Seçim bir TERCİH değil bir KULLANIM sorusu:
       nereye yükleyeceğin hangi biçimi gerektirdiğini belirler — başlıklar bunu yazıyor. -->
  <select id="disa">
    <optgroup label="YAYIN — platform slayt slayt ister, PNG kayıpsız">
      <option value="dilim:png">⭳ slaytlar · PNG</option>
    </optgroup>
    <optgroup label="ONAY — hızlı paylaşım ya da tek dosya">
      <option value="dilim:jpg">⭳ slaytlar · JPEG (~5× küçük)</option>
      <option value="dilim:pdf">⭳ slaytlar · PDF (her slayt bir sayfa)</option>
    </optgroup>
    <optgroup label="KESİNTİSİZLİĞİ GÖRMEK — platforma yüklenmez">
      <option value="butun:png">⭳ kesintisiz · PNG</option>
      <option value="butun:jpg">⭳ kesintisiz · JPEG</option>
      <option value="butun:pdf">⭳ kesintisiz · PDF (vektör metin)</option>
    </optgroup>
  </select>
  <button id="disaAl">⭳ indir</button>
  <button class="birincil" id="kaydet">JSON'u yaz</button>
  <span id="ipucu">metne tıkla → düzenle · görseli sürükle → taşı · Shift+sürükle → ölçekle</span>
</header>
<div id="govde">
  <div id="tuval"><div id="sahne-sarmal"><iframe id="pano"></iframe><div id="kilavuz"></div></div></div>
  <aside id="mufettis"></aside>
</div>
<div id="mesaj"></div>
<div id="kusur">ölçüm bekleniyor…</div>
<!-- ⚠ Modal iskeleti BURADA, kabukta: istemci onu her açılışta yeniden kurmak
     yerine yalnız dolduruyor. Bir kez kurulan yapı, her seferinde kurulan
     yapıdan az bozulur. -->
<div id="ara-perde">
  <div id="ara-kutu">
    <div id="ara-baslik">
      <strong style="font-size:13px">webden tasarım ögesi</strong>
      <input type="search" id="ara-sorgu" placeholder="türkçe ara: geri kazanım, ölçüm, fabrika, veri, ampul…">
      <label style="font-size:12px;display:flex;gap:5px;align-items:center;white-space:nowrap">
        <input type="checkbox" id="ara-genis"> şablon havası dışı
      </label>
      <button id="ara-git" class="birincil">ara</button>
      <button id="ara-kapat">✕</button>
    </div>
    <div id="ara-durum">bir şey ara — sonuçlar burada çıkacak</div>
    <div id="ara-izgara"></div>
  </div>
</div>
<script type="module" src="/istemci.js"></script>`

// ── ölçüm: denetim tarayıcıda koşuyor, ayrı bir motor yok ────────────────────
const KATALOG_YOLU = join(REPO, 'packages/render/src/katalog-ornek.ts')

/** Diskte NE OLDUĞUNUN bilgisi. İkinci kaydetmede aranan eski değer, birincinin
 *  yazdığı yeni değerdir — ORNEKLER bellekte hep ilk hâlini tutar. */
const diskteki = Object.fromEntries(
  Object.entries(ORNEKLER).map(([k, o]) => ['sablon:' + k, structuredClone(o)])
)

const tsKacir = (v) => "'" + String(v).replace(/\\/g, '\\\\').replace(/'/g, "\\'") + "'"

/**
 * Şablon düzenlemesini `katalog-ornek.ts`e CERRAHİ olarak yazar.
 *
 * ⚠ ⚠ **DOSYA YENİDEN ÜRETİLMİYOR, YAMANIYOR.** `katalog-ornek.ts` 999 satır ve
 * ağırlığının çoğu YORUM: her sayı bir ölçümün, her seçim bir kararın izini taşıyor.
 * Veriden yeniden üretmek o yorumların hepsini silerdi — dosyanın asıl değeri
 * silinmiş olurdu. Bu yüzden yalnız DEĞİŞEN alanın literali değiştiriliyor.
 *
 * ⚠ **Belirsizlikte HİÇBİR ŞEY yazılmıyor.** Eski değer blokta bir kez geçmiyorsa
 * (sıfır ya da birden çok) işlem tümüyle iptal ediliyor ve sebebi bildiriliyor.
 * Yarım yazılmış bir katalog, yazılmamış olandan kötüdür.
 *
 * ⚠ Yasa 2: bu bir ÖNERİdir. Dosya çalışma ağacında değişir, onay insanın commit'idir.
 */
const kataloguYaz = (id) => {
  const ad = kaynak[id].ad
  let kaynakKod = readFileSync(KATALOG_YOLU, 'utf8')
  // id → const adı eşlemesi DOSYADAN okunuyor: elle yazılmış bir tablo, dosya
  // yeniden adlandırıldığı gün sessizce yanlış bloğa yazardı.
  const harita = /export const ORNEKLER[^{]*\{([^}]*)\}/.exec(kaynakKod)?.[1] ?? ''
  // ⚠ Anahtar TIRNAKLI da olabilir TIRNAKSIZ da: `'akan-alan':` ve `sahne:` aynı
  // dosyada yan yana duruyor (tireli olan tanımlayıcı değil). İlk sürüm yalnız
  // tırnaklıyı arıyordu ve tam da tırnaksız olanlarda "sabit adı bulunamadı" diyordu.
  const sabit = new RegExp("(?:'" + ad + "'|" + ad + ')\\s*:\\s*([A-Z_0-9]+)').exec(harita)?.[1]
  if (sabit === undefined) return { ok: false, sebep: ad + ' icin sabit adi bulunamadi' }
  const bas = kaynakKod.indexOf('export const ' + sabit)
  if (bas < 0) return { ok: false, sebep: sabit + ' blogu bulunamadi' }
  const sonrakiler = [...kaynakKod.slice(bas + 10).matchAll(/\nexport const /g)]
  const son = sonrakiler.length === 0 ? kaynakKod.length : bas + 10 + sonrakiler[0].index

  let blok = kaynakKod.slice(bas, son)
  const yeni = calisan[id]
  const eski = diskteki[id]
  const degisiklikler = []
  const yeniAlanlar = []
  // ⚠ ⚠ **ALAN LİSTESİ TEK YERDE.** Editör bir alanı düzenleyebiliyor ama yazıcı onu
  // tanımıyorsa değişiklik SESSİZCE kayboluyor — kullanıcı kaydetti sanır, dosyada iz
  // yoktur. Editörün düzenlediği her metin alanı buraya da girmek zorunda.
  const METIN_ALANLARI = [
    'baslik',
    'govde',
    'ustBaslik',
    'elYazisi',
    'hayalet',
    'rayaSol',
    'rayaOrta',
    'kolon',
    'zemin',
  ]

  for (let i = 0; i < yeni.kartlar.length; i++) {
    for (const alan of METIN_ALANLARI) {
      const a = eski.kartlar[i]?.[alan]
      const b = yeni.kartlar[i]?.[alan]
      if (a === b) continue
      if (a === undefined) {
        // Alan kaynakta YOK: yeni satır ekleniyor (çapa `baslik:`), değiştirilmiyor.
        yeniAlanlar.push({ i, satir: '\n      ' + alan + ': ' + tsKacir(b) + ',' })
        degisiklikler.push('kart ' + (i + 1) + ' · ' + alan + ' (yeni)')
        continue
      }
      const arama = alan + ': ' + tsKacir(a)
      const adet = blok.split(arama).length - 1
      if (adet !== 1)
        return {
          ok: false,
          sebep:
            'kart ' +
            (i + 1) +
            ' ' +
            alan +
            ': eski deger blokta ' +
            adet +
            ' kez geciyor — belirsiz, hicbir sey yazilmadi',
        }
      blok = blok.replace(arama, alan + ': ' + tsKacir(b))
      degisiklikler.push('kart ' + (i + 1) + ' · ' + alan)
    }
  }

  // ── ayar (kaydırma + punto) ve panel silme ──────────────────────────────
  //
  // ⚠ `ayar` alanı kaynakta ÇOĞUNLUKLA YOK: var olan bir literali değiştirmek yerine
  // yeni bir satır EKLEMEK gerekiyor. Çapa `baslik:` — her kartta var ve boş olamaz.
  // Kart sınırı da ondan çıkıyor: i'inci kart, i'inci `baslik:` satırının etrafı.
  const baslikYerleri = []
  {
    let k = -1
    while ((k = blok.indexOf('\n      baslik:', k + 1)) >= 0) baslikYerleri.push(k)
  }
  if (baslikYerleri.length !== yeni.kartlar.length)
    return {
      ok: false,
      sebep:
        'kart sayisi tutmuyor (' +
        baslikYerleri.length +
        ' vs ' +
        yeni.kartlar.length +
        ') — hicbir sey yazilmadi',
    }

  // Kaynakta olmayan alanlar `baslik:` çapasının önüne ekleniyor. Sondan başa,
  // çünkü bir ekleme sonraki çapaların konumunu kaydırır.
  for (const { i, satir } of [...yeniAlanlar].sort((a, b) => b.i - a.i)) {
    const bas = baslikYerleri[i]
    if (bas === undefined)
      return { ok: false, sebep: 'kart ' + (i + 1) + ' capasi yok — hicbir sey yazilmadi' }
    blok = blok.slice(0, bas) + satir + blok.slice(bas)
  }
  // Çapa konumları ekleme sonrası TAZELENİYOR: `ayar` döngüsü bayat konum kullanırsa
  // satırı yanlış karta yazar.
  baslikYerleri.length = 0
  {
    let k = -1
    while ((k = blok.indexOf('\n      baslik:', k + 1)) >= 0) baslikYerleri.push(k)
  }

  // Sondan başa: bir eklemenin sonraki kartların konumunu kaydırmaması için.
  for (let i = yeni.kartlar.length - 1; i >= 0; i--) {
    const a = eski.kartlar[i],
      b = yeni.kartlar[i]
    if (JSON.stringify(a?.ayar ?? null) === JSON.stringify(b?.ayar ?? null)) continue
    const bas = baslikYerleri[i]
    const kartSonu = i + 1 < baslikYerleri.length ? baslikYerleri[i + 1] : blok.length
    const govde = blok.slice(bas, kartSonu)
    const mevcut = /\n      ayar: \{[^\n]*\},/.exec(govde)
    const satir =
      b.ayar === undefined || Object.keys(b.ayar).length === 0
        ? ''
        : '\n      ayar: ' +
          JSON.stringify(b.ayar)
            .replace(/"([A-Za-z]+)":/g, '$1: ')
            .replace(/[{]/g, '{ ')
            .replace(/[}]/g, ' }')
            .replace(/,/g, ', ') +
          ','
    const yeniGovde = mevcut === null ? satir + govde : govde.replace(mevcut[0], satir)
    blok = blok.slice(0, bas) + yeniGovde + blok.slice(kartSonu)
    degisiklikler.push('kart ' + (i + 1) + ' · ayar')
  }

  // Panel silme: `panel: { … }` bloğu parantez eşleyerek `panel: null` oluyor.
  for (let i = 0; i < yeni.kartlar.length; i++) {
    if (eski.kartlar[i]?.panel == null || yeni.kartlar[i]?.panel != null) continue
    const bas = blok.indexOf('\n      panel: {', baslikYerleri[i] ?? 0)
    if (bas < 0)
      return {
        ok: false,
        sebep: 'kart ' + (i + 1) + ' panel blogu bulunamadi — hicbir sey yazilmadi',
      }
    let derinlik = 0,
      j = blok.indexOf('{', bas)
    for (; j < blok.length; j++) {
      if (blok[j] === '{') derinlik++
      else if (blok[j] === '}') {
        derinlik--
        if (derinlik === 0) break
      }
    }
    blok = blok.slice(0, bas) + '\n      panel: null' + blok.slice(j + 1)
    degisiklikler.push('kart ' + (i + 1) + ' · panel silindi')
  }

  // Görsel yuvaları: dizi YENİDEN KURULMUYOR, satırdaki SAYILAR değiştiriliyor.
  //
  // ⚠ ⚠ İlk sürüm diziyi veriden yeniden kuruyor ve içinde yorum görünce tüm işlemi
  // reddediyordu — alakasız bir metin düzenlemesi bile bir yorum yüzünden yazılamıyordu.
  // Yorumlar bu dosyanın asıl değeri; onları engel saymak yanlış soruydu. Doğru soru:
  // yorumu hiç okumadan yalnız değişen sayıya dokunmak.
  const gorselDegisti = JSON.stringify(eski.gorseller) !== JSON.stringify(yeni.gorseller)
  if (gorselDegisti) {
    const m = /(\n  gorseller: \[\n)([\s\S]*?)(\n  \],)/.exec(blok)
    if (m === null)
      return { ok: false, sebep: 'gorseller dizisi bulunamadi — hicbir sey yazilmadi' }
    const satirlar = m[2].split('\n')
    let sira = -1
    const yeniSatirlar = satirlar.map((satir) => {
      if (!/\{\s*src:/.test(satir)) return satir
      sira++
      const a = eski.gorseller[sira]
      const b = yeni.gorseller[sira]
      if (a === undefined || b === undefined) return satir
      let cikti = satir
      for (const alan of ['x', 'y', 'genislik', 'yukseklik']) {
        if (a[alan] === undefined || a[alan] === b[alan]) continue
        const kural = new RegExp('(\\b' + alan + ': )' + a[alan] + '(?=[,}\\s])')
        if (!kural.test(cikti)) return satir
        cikti = cikti.replace(kural, '$1' + b[alan])
      }
      return cikti
    })
    if (sira + 1 !== yeni.gorseller.length)
      return {
        ok: false,
        sebep:
          'gorsel satiri sayisi tutmuyor (' +
          (sira + 1) +
          ' vs ' +
          yeni.gorseller.length +
          ') — hicbir sey yazilmadi',
      }
    blok = blok.replace(m[0], m[1] + yeniSatirlar.join('\n') + m[3])
    degisiklikler.push('gorsel yuvalari (' + yeni.gorseller.length + ')')
  }

  // ── belge düzeyi: yerleşim, belge zemini, tipografi reçetesi ─────────────
  //
  // ⚠ Tipografi sayıları `alan: 0.98,` biçiminde tek satırda; ondalık gösterimi
  // KAYNAKTAKİYLE aynı olmalı, yoksa eşleşme tutmaz. Bu yüzden eski değer sayı
  // olarak değil, kaynaktaki YAZILIŞIYLA aranıyor.
  for (const alan of ['yerlesim', 'zemin', 'baslikSutunu']) {
    const a = eski[alan],
      b = yeni[alan]
    if (a === b || b === undefined) continue
    if (a === undefined)
      return {
        ok: false,
        sebep: alan + ' kaynakta yok, eklenmesi elle yapilmali — hicbir sey yazilmadi',
      }
    const arama = '\n  ' + alan + ': ' + tsKacir(a)
    if (blok.split(arama).length - 1 !== 1)
      return { ok: false, sebep: alan + ': eski deger belirsiz — hicbir sey yazilmadi' }
    blok = blok.replace(arama, '\n  ' + alan + ': ' + tsKacir(b))
    degisiklikler.push('belge · ' + alan)
  }
  for (const [alan, b] of Object.entries(yeni.tipografi ?? {})) {
    const a = (eski.tipografi ?? {})[alan]
    if (a === b || a === undefined) continue
    const kural = new RegExp('(\\n    ' + alan + ': )(-?[0-9.]+)')
    if (!kural.test(blok))
      return { ok: false, sebep: 'tipografi.' + alan + ' bulunamadi — hicbir sey yazilmadi' }
    blok = blok.replace(kural, '$1' + b)
    degisiklikler.push('tipografi · ' + alan)
  }

  if (degisiklikler.length === 0) return { ok: false, sebep: 'degisiklik yok' }
  writeFileSync(KATALOG_YOLU, kaynakKod.slice(0, bas) + blok + kaynakKod.slice(son))
  diskteki[id] = structuredClone(yeni)
  return { ok: true, degisiklikler }
}

/**
 * ⚠ ⚠ **BU FONKSİYONUN İLK SÜRÜMÜ HİÇ ÇALIŞMADI ve bunu SÖYLEMEDİ.**
 *
 * `panoramaDenetle` kendi sayfasını kuran bir async fonksiyon — döndürdüğü şey bir
 * Promise. İlk sürüm onu `page.evaluate()`e veriyordu; tarayıcı "Unexpected identifier
 * 'Promise'" diye patlıyor, hata `r.ok` false'a düşüyor ve fonksiyon BOŞ LİSTE
 * döndürüyordu. Panelde "✓ kusur yok" yazıyordu — ölçüm yapılmadığı için.
 *
 * ⚠ Bu, bu turda ölçüm aletinin kendisinin bozuk çıktığı KAÇINCI kez olduğu artık
 * sayılmıyor. Kural netleşti: **başarısız bir ölçüm "temiz" değildir.** Artık hata
 * yutulmuyor, panele yazılıyor.
 */
const olcum = async (id) => {
  const { panoramaDenetle } = await import(join(REPO, 'packages/render/dist/panorama-denetim.js'))
  const r = await panoramaDenetle(belge(id))
  if (!r.ok)
    return [
      {
        tur: 'ÖLÇÜM BAŞARISIZ',
        kart: null,
        alan: null,
        aciklama: String(r.error?.message ?? r.error),
      },
    ]
  return r.value
}

const govde = (req) =>
  new Promise((c) => {
    let s = ''
    req.on('data', (x) => (s += x))
    req.on('end', () => c(s))
  })

/**
 * Geri/ileri YIĞINLARI — id başına.
 *
 * ⚠ ⚠ **İLK SÜRÜM TEK SLOTTU ve bu bir kolaylık eksiği değil, bir GÜVEN eksiğiydi.**
 * `yedek[id]` yalnız SON değişikliği tutuyordu: üç düzenleme yapıp iki kez geri almak
 * imkânsızdı ve ikinci "geri al" hiçbir şey yapmadan sessizce geçiyordu. Elle düzeltme
 * yapan biri denemekten çekinir — geri alınamayan bir deneme, denenmemiş demektir.
 *
 * ⚠ Tavan 50: bellek sınırsız büyümesin. Aşınca EN ESKİ atılıyor; kullanıcı elli adım
 * geri gitmek isterse zaten `git diff` var (şablon modu) ya da koşu defteri (koşu modu).
 */
const TAVAN = 50
const geriYigin = {}
const ileriYigin = {}

const anlikGoruntuAl = (id) => {
  const y = (geriYigin[id] ??= [])
  y.push(structuredClone(calisan[id]))
  if (y.length > TAVAN) y.shift()
  // Yeni bir düzenleme ileri geçmişi geçersiz kılar: dallanmış bir geçmiş,
  // "ileri" düğmesine basınca beklenmedik bir duruma atlamak demekti.
  ileriYigin[id] = []
}
// ⚠ ⚠ **ROL LİSTESİ TEK YERDEN — iki okuyucu var ve ikisi AYNI listeyi görmek zorunda.**
// `/rampa` onu ekrana koyuyor, `/gorsel-ara-koy` gelen rengin gerçekten var olduğunu
// sınıyor. İkisi ayrı yazılsaydı biri güncellenir öteki unutulurdu ve editör var olmayan
// bir rolü seçenek diye sunardı.
const rampaRolleri = () => {
  const kreatif = /\[data-surface='kreatif'\]\s*\{([^}]*)\}/.exec(tokenCss)?.[1] ?? ''
  return [...kreatif.matchAll(/(--role-[\w-]+)\s*:/g)].map((m) => m[1])
}

const sunucu = createServer(async (req, res) => {
  const u = new URL(req.url, 'http://x')
  // ⚠ Her istekte yeniden taranıyor: editör açıkken üretilen koşu da listeye girsin.
  // ⚠ `?elenmis=1` emekli koşuları da yüklüyor — gizleme geri dönüşlü olsun diye.
  const elenmisDe = u.searchParams.get('elenmis') === '1'
  kosulariYukle()
  const id = u.searchParams.get('id') ?? Object.keys(calisan)[0]
  const json = (v) => {
    res.writeHead(200, { 'content-type': 'application/json' })
    res.end(JSON.stringify(v))
  }
  try {
    if (u.pathname === '/') {
      res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' })
      return res.end(KABUK(id, elenmisDe))
    }
    if (u.pathname === '/istemci.js') {
      res.writeHead(200, { 'content-type': 'text/javascript; charset=utf-8' })
      return res.end(readFileSync(join(REPO, 'scripts/duzenleyici-istemci.js'), 'utf8'))
    }
    // ⚠ ⚠ **RENK SERBEST SEÇİLMİYOR, RAMPADAN SEÇİLİYOR.** Serbest bir hex girişi
    // marka ihlalidir (R-35) ve `tokens` kapısı onu zaten reddeder — ama kapıya
    // çarpmadan ÖNCE engellemek daha iyi: editör yalnız var olan rolleri sunuyor.
    // Liste türetilmiş token dosyasından OKUNUYOR, elle yazılmıyor; marka paleti
    // değişince editör kendiliğinden güncelleniyor.
    if (u.pathname === '/rampa') return json(rampaRolleri().map((r) => 'var(' + r + ')'))
    if (u.pathname === '/pano')
      return json({
        html: panoramaHtml(belge(id)),
        doc: calisan[id],
        // ⚠ Derinlik İSTEMCİYE bildiriliyor: "geri al" düğmesi tıklanabilir görünüp
        // hiçbir şey yapmıyorsa kullanıcı düzenlemenin kaydedildiğini sanır.
        geri: (geriYigin[id] ?? []).length,
        ileri: (ileriYigin[id] ?? []).length,
      })
    if (u.pathname === '/olc') return json(await olcum(id))
    if (u.pathname === '/degistir') {
      const d = JSON.parse(await govde(req))
      anlikGoruntuAl(id)
      if (d.tur === 'gorsel') {
        const g = calisan[id].gorseller[d.i]
        // ⚠ ⚠ **YALNIZ GELEN ALAN YAZILIYOR — verilmeyeni SIFIRLAMAK yerine dokunmuyoruz.**
        // İlk sürüm üç alanı koşulsuz atıyordu; köşe tutamacı yükseklik de gönderince
        // taşıma hareketi (yalnız x/y yollayan) yüksekliği `undefined` yapardı. Kısmi
        // güncelleme bu depoda tekrar eden bir tuzak: `tipo` da tek nesne olduğu için
        // aynı dersi öğrenmişti.
        if (g) {
          for (const alan of ['x', 'y', 'genislik', 'yukseklik']) {
            if (typeof d[alan] === 'number') g[alan] = d[alan]
          }
          // Döndürme tutamacı: nötr değer alanı SİLİYOR (madde 2'nin kuralı).
          if (d.donusZ === null || d.donusZ === 0) delete g.donusZ
          else if (typeof d.donusZ === 'number') g.donusZ = d.donusZ
        }
      } else if (d.tur === 'ayar') {
        // ⚠ Nötr ayar SİLİNİYOR, sıfır olarak yazılmıyor: `{dx:0,dy:0,olcek:1}` kataloga
        // gürültü olarak düşerdi ve şablonun "hiç ayar yok" hâli okunmaz olurdu.
        const k = calisan[id].kartlar[d.i]
        if (k) {
          const ayar = { ...(k.ayar ?? {}) }
          const yeni = {}
          if (d.dx) yeni.dx = d.dx
          if (d.dy) yeni.dy = d.dy
          if (d.olcek !== undefined && d.olcek !== 1) yeni.olcek = d.olcek
          if (d.z !== undefined && d.z !== null) yeni.z = d.z
          if (Object.keys(yeni).length === 0) delete ayar[d.alan]
          else ayar[d.alan] = yeni
          const kalan = { ...k }
          delete kalan.ayar
          calisan[id].kartlar[d.i] = Object.keys(ayar).length === 0 ? kalan : { ...kalan, ayar }
        }
      } else if (d.tur === 'gorsel-alan') {
        const g = calisan[id].gorseller[d.i]
        if (g) {
          // ⚠ ⚠ **NÖTR DEĞER SİLİNİYOR, `undefined` YAZILMIYOR — aynı ders `kart-alan`da
          // zaten öğrenilmişti.** `{ ...g, donusY: undefined }` anahtarı VAR ama değeri
          // yok bir nesne üretiyor; JSON'a yazılırken düşüyor ama bellekteki nesne
          // "alanı olan" bir görsel gibi davranıyor. Dönüş sıfırken `transform` hiç
          // yazılmamalı: boş bir `transform` bile ögeyi kendi yığın bağlamına sokar ve
          // `z-index` davranışını sessizce değiştirir.
          const yeni = { ...g }
          if (d.deger === undefined || d.deger === null) delete yeni[d.alan]
          else yeni[d.alan] = d.deger
          calisan[id].gorseller[d.i] = yeni
        }
      } else if (d.tur === 'bant-tip') {
        // ⚠ ⚠ **SÜS KAPATILABİLİR.** `sus-metni-kesiyor` ölçülüyor ama metinle
        // düzelmiyor (borç D23); insanın elindeki tek gerçek çare süsü kaldırmak.
        // ⚠ Tip değişince ÖGELER korunuyor: `yok`tan geri dönüldüğünde oklar yerinde.
        const mevcut = calisan[id].bant ?? {}
        calisan[id] = { ...calisan[id], bant: { ...mevcut, tip: d.deger } }
      } else if (d.tur === 'belge-alan') {
        // Belge kökündeki alan: `yerlesim`, `zemin`, `baslikSutunu`…
        calisan[id] = { ...calisan[id], [d.alan]: d.deger }
      } else if (d.tur === 'tipo') {
        // ⚠ Tipografi reçetesi TEK NESNE: alanı tek tek yazmak, verilmeyenleri
        // silerdi. Var olanın üstüne biniyor.
        calisan[id] = {
          ...calisan[id],
          tipografi: { ...(calisan[id].tipografi ?? {}), [d.alan]: d.deger },
        }
      } else if (d.tur === 'kart-alan') {
        const k = calisan[id].kartlar[d.i]
        if (k) {
          // ⚠ `undefined` yazmak yerine alanı KALDIRIYORUz: `zemin: undefined` taşıyan
          // bir kart, zemini olan bir karttan farklı davranıyor (JSON'a da giriyor).
          const yeniKart = { ...k }
          if (d.deger === null || d.deger === '') delete yeniKart[d.alan]
          else yeniKart[d.alan] = d.deger
          calisan[id].kartlar[d.i] = yeniKart
        }
      } else if (d.tur === 'sil') {
        // Boş değer alana göre: metin '' olur, panel null.
        const bos = {
          baslik: '',
          govde: '',
          ustBaslik: '',
          elYazisi: '',
          panel: null,
          rayaSol: '',
          rayaOrta: '',
        }
        const k = calisan[id].kartlar[d.i]
        if (k && d.alan in bos) calisan[id].kartlar[d.i] = { ...k, [d.alan]: bos[d.alan] }
      } else {
        const alan = d.sec.split(' ')[0]
        const harita = {
          baslik: 'baslik',
          govde: 'govde',
          'ust-baslik': 'ustBaslik',
          'el-yazisi': 'elYazisi',
          // ⚠ Alt ray da düzenlenebilir: künye kartın en çok gözden geçirilen parçası
          // (kaynak, alan adı) ve düzeltmesi için koşuyu baştan üretmek gerekiyordu.
          'ray-sol': 'rayaSol',
          'ray-orta': 'rayaOrta',
        }
        const k = calisan[id].kartlar[d.i]
        if (k && harita[alan]) k[harita[alan]] = d.deger.trim()
      }
      return json({ ok: true })
    }
    // ── elle görsel yerleştirme (FAZ-16.3) ─────────────────────────────────
    //
    // ⚠ ⚠ **ŞABLONA SABİT FOTOĞRAF KONMUYOR ve bu bir kısıt değil, kuralın kendisi.**
    // Katalog taslağı bir DÜZEN; yuvası `src: ''` ile boş duruyor çünkü onu her koşuda
    // o konunun görseli dolduruyor. Taslağa belirli bir fotoğraf gömmek, o şablondan
    // üretilecek BÜTÜN gelecek karosellerin aynı fotoğrafı taşıması demekti — katalog
    // mantığı (Yasa 13) tam olarak burada çökerdi.
    //
    // ⚠ Koşuya koymak meşru: orada görsel zaten o karoselin kendi varlığı. Dosya
    // koşu dizinine yazılıyor ve belge onun ADINI taşıyor (D-302 referans biçimi).
    if (u.pathname === '/gorsel-koy') {
      const d = JSON.parse(await govde(req))
      const k = kaynak[id]
      res.writeHead(200, { 'content-type': 'text/plain; charset=utf-8' })
      if (k?.tur !== 'kosu')
        return res.end(
          '✗ şablona sabit görsel konmaz — o şablondan üretilecek HER karosel bu\n' +
            '  fotoğrafı taşırdı (Yasa 13). Bir koşu seç ve oraya koy.'
        )
      const g = calisan[id].gorseller[d.i]
      if (g === undefined) return res.end('✗ ' + (d.i + 1) + '. yuva yok')
      const uz = (d.mime ?? '').includes('jpeg')
        ? 'jpg'
        : (d.mime ?? '').includes('webp')
          ? 'webp'
          : 'png'
      // ⚠ ⚠ **ÜRETİLMİŞ GÖRSELİN ÜSTÜNE YAZILMIYOR — ayrı ada yazılıyor.**
      // İlk sürüm `gorsel-NN.<uz>` diyordu ve bir testte gerçek bir koşunun 1,1 MB'lık
      // kesik öznesini 209 baytlık bir kareye çevirdi. O görsel para ve rastgelelikle
      // üretildi; geri getirilemez. Elle konan varlık `-elle` ekiyle yaşıyor, hattın
      // ürettiği yerinde kalıyor — slaytlarda zaten uyguladığımız kural.
      const ad = 'gorsel-' + String(d.i + 1).padStart(2, '0') + '-elle.' + uz
      writeFileSync(join(k.dizin, ad), Buffer.from(d.veri, 'base64'))
      calisan[id].gorseller[d.i] = {
        ...g,
        src: 'data:' + (d.mime ?? 'image/png') + ';base64,' + d.veri,
      }
      return res.end(
        '✓ ' + ad + ' yuvaya kondu (' + Math.round((d.veri.length * 0.75) / 1024) + ' KB)'
      )
    }
    // ── arka plan silme: SEÇİLİ görsele, editörden (FAZ-17.2) ───────────────
    //
    // ⚠ ⚠ **HAT BUNU ZATEN YAPIYOR ama düzeltme turunda yapmıyor.** `matlama-tutmuyor`
    // kusuru gerçek bir koşuda çıktı (alfa 127/255) ve insan onu editörde görüyor —
    // görüp düzeltememek, ölçümü bir şikâyete çevirir. Aynı yerel model (`rembg`)
    // burada da çağrılıyor; ikinci bir teknik eklenmiyor.
    // ⚠ Sonuç `-elle` ekiyle yazılıyor: hattın ürettiği asıl görsel yerinde kalıyor
    // ve ikisi karşılaştırılabiliyor.
    if (u.pathname === '/arkaplan-sil') {
      const d = JSON.parse(await govde(req))
      const k = kaynak[id]
      res.writeHead(200, { 'content-type': 'text/plain; charset=utf-8' })
      if (k?.tur !== 'kosu') return res.end('✗ arka plan silme yalnız KOŞU modunda')
      const g = calisan[id].gorseller[d.i]
      if (g === undefined || typeof g.src !== 'string' || !g.src.startsWith('data:'))
        return res.end('✗ ' + (d.i + 1) + '. yuvada görsel yok')
      const { spawnSync } = await import('node:child_process')
      const python = join(REPO, '.venv-gorsel/bin/python')
      if (!existsSync(python)) return res.end('✗ .venv-gorsel yok — `just setup` çalıştır')
      const b64 = g.src.slice(g.src.indexOf(',') + 1)
      const r = spawnSync(python, [join(REPO, 'scripts/gorsel/arkaplan-sil.py')], {
        input: b64,
        encoding: 'utf8',
        maxBuffer: 64 * 1024 * 1024,
      })
      if (r.status !== 0)
        return res.end('✗ silme başarısız: ' + String(r.stderr ?? '').slice(0, 200))
      const yeni = 'data:image/png;base64,' + String(r.stdout).trim()
      writeFileSync(
        join(k.dizin, 'gorsel-' + String(d.i + 1).padStart(2, '0') + '-elle.png'),
        Buffer.from(String(r.stdout).trim(), 'base64')
      )
      anlikGoruntuAl(id)
      calisan[id].gorseller[d.i] = { ...g, src: yeni }
      return res.end('✓ ' + (d.i + 1) + '. görselin arka planı silindi')
    }

    // ── EDİTÖRDEN GÖRSEL ÜRETME (FAZ-17.3) ─────────────────────────────────
    //
    // ⚠ ⚠ **BEĞENİLMEYEN GÖRSELİN TEK ÇARESİ KOŞUYU BAŞTAN ÜRETMEKTİ.** Depo sahibi:
    // *"beğenmediğimizi silip yerine kendimiz ürettirebiliriz istediğimiz gibi
    // özgürce."* Dört slaytlık bir karoselde tek bir görseli beğenmemek, dördünü de
    // yeniden üretmek demekti.
    //
    // ⚠ İstem R-20 MUHAFIZINDAN geçiyor — insanın yazdığı prompt da bir prompt.
    // "Kullanıcı yazdı" bir muafiyet sebebi değil; metin isteyen bir istem, kimin
    // yazdığından bağımsız olarak Türkçe tipografiyi bozuyor.
    //
    // ⚠ Sonuç `-elle` ekiyle diske yazılıyor: hattın ürettiği asıl görsel yerinde
    // kalıyor ve ikisi karşılaştırılabiliyor (aynı kural `/gorsel-koy`da da var).
    if (u.pathname === '/gorsel-uret') {
      const d = JSON.parse(await govde(req))
      const k = kaynak[id]
      res.writeHead(200, { 'content-type': 'text/plain; charset=utf-8' })
      if (k?.tur !== 'kosu') return res.end('✗ şablona görsel üretilmez — bir koşu seç (Yasa 13).')
      const g = calisan[id].gorseller[d.i]
      if (g === undefined) return res.end('✗ ' + (d.i + 1) + '. yuva yok')
      const istem = String(d.prompt ?? '').trim()
      if (istem === '') return res.end('✗ istem boş')

      const adapter = adapterById('cloudflare-workers-ai')
      if (adapter === null) return res.end('✗ sağlayıcı bulunamadı: cloudflare-workers-ai')
      // ⚠ İmza `available(env)` — sarmalayıcı bir nesne DEĞİL. İlk sürüm
      // `{env}` geçiyordu ve anahtar varken bile *anahtar yok* diyordu.
      if (!adapter.available(SAGLAYICI_ORTAMI))
        return res.end('✗ anahtar yok — tezgâhı `just dev` ile (sops altında) başlat')

      const dogrulanan = adapter.validate({
        capability: 'image.generate',
        lane: 'free',
        prompt: istem,
        // ⚠ ⚠ **ORAN ZORUNLU** ve ilk iki sürüm onu geçemedi: önce alan hiç yoktu,
        // sonra adı yanlıştı (`aspect_ratio`). Hata mesajı ikisinde de "R-20" diyordu
        // ve beni yanlış yere baktırdı — oysa `supported` listesi cevabı yazıyordu.
        // Yuvalar 1024×1280 üretiyor; `4:5` o oranın adı.
        constraints: { aspect: '4:5' },
        idempotencyKey: 'editor:' + id + ':' + String(d.i),
      })
      if (!dogrulanan.ok)
        return res.end(
          '✗ istem reddedildi (R-20): ' + JSON.stringify(dogrulanan.error.details ?? {})
        )

      const is = await adapter.start(dogrulanan.value, {
        correlationId: 'cor_editor',
        env: SAGLAYICI_ORTAMI,
      })
      if (!is.ok) return res.end('✗ çağrı başlamadı: ' + JSON.stringify(is.error.code ?? ''))
      let durum = await adapter.status(is.value)
      for (let i = 0; i < 60 && durum.ok && durum.value.state === 'running'; i++) {
        await new Promise((c) => setTimeout(c, 1000))
        durum = await adapter.status(is.value)
      }
      if (!durum.ok || durum.value.state !== 'succeeded')
        return res.end(
          '✗ üretim başarısız: ' + JSON.stringify(durum.ok ? durum.value.state : durum.error.code)
        )

      const cikti = durum.value.output ?? {}
      const b64 =
        typeof cikti.image_base64 === 'string' ? cikti.image_base64 : String(cikti.data ?? '')
      if (b64 === '') return res.end('✗ sağlayıcı byte döndürmedi')
      const ad = 'gorsel-' + String(d.i + 1).padStart(2, '0') + '-elle.png'
      writeFileSync(join(k.dizin, ad), Buffer.from(b64, 'base64'))
      anlikGoruntuAl(id)
      calisan[id].gorseller[d.i] = { ...g, src: 'data:image/png;base64,' + b64 }
      return res.end('✓ ' + (d.i + 1) + '. yuvaya üretildi → ' + ad)
    }

    // ── WEBDEN TASARIM ÖGESİ ARAMA (FAZ-19.11) ─────────────────────────────
    //
    // ⚠ ⚠ **ARAMA HATTIN İÇİNDE DEĞİL ve bu bilinçli.** *"üretim hattında otomatik
    // olmayacak"* — hat aynı girdiye aynı çıktıyı vermeye devam ediyor. Dış kaynak
    // yalnız burada, insanın tıkladığı anda giriyor.
    // ⚠ Sonuç FOTOĞRAF değil TASARIM ÖGESİ: kaynak Iconify, 236 açık kaynak set ve
    // sonuç SVG — yani doğası gereği arkaplansız ve çerçevesiz. Elenen kaynakların
    // listesi (`svgrepo` 429 · `poly.pizza` anahtar istiyor · `openverse` fotoğraf
    // getiriyor) modülün başında; bir daha denenmesin diye yazılı.
    if (u.pathname === '/gorsel-ara') {
      const d = JSON.parse(await govde(req))
      const k = kaynak[id]
      // ⚠ Havayı KOŞUNUN KENDİ defterinden okuyoruz, kullanıcıya sormuyoruz: hangi
      // şablondan üretildiği zaten yazılı ve sormak onu yanlış cevaplama fırsatıdır.
      let sablonId = ''
      if (k?.tur === 'kosu') {
        try {
          sablonId =
            JSON.parse(readFileSync(join(k.dizin, 'steps/sablon-uyarla.json'), 'utf8')).uyarlama
              .sablonId ?? ''
        } catch {
          // Defteri okunamayan koşuda süzgeç yok — 236 setin hepsi aranır.
        }
      }
      const r = await webAra.ara(String(d.q ?? ''), {
        sablonId,
        tumSetler: d.tumSetler === true,
        adet: 24,
      })
      return json(r.ok ? { ...r, sablonId } : r)
    }

    // ── ARANAN ÖGEYİ YUVAYA KOYMA ──────────────────────────────────────────
    //
    // ⚠ ⚠ **SVG DEĞİL PNG YAZILIYOR.** Uzak SVG betik taşıyabilir; sunucu bu depoda
    // `/api/varlik/:digest` yolunda `.svg` sunmayı zaten KASTEN reddediyor. Bayt
    // sunucuda temizleniyor, sunucuda rasterleniyor ve yuvaya saydam PNG giriyor —
    // aşağı akıştaki hiçbir yol (blob deposu, damgalama, panel) değişmiyor.
    // ⚠ ⚠ **KIRPMA DA `kesik`E ÇEKİLİYOR ve bu ihmal edilseydi vaat SESSİZCE ÖLÜRDÜ.**
    // Varsayılan `.gorsel` kuralı `object-fit: cover`; kare bir ikon 4:5 yuvada üstten
    // ve alttan KIRPILIR. Yalnız `.gorsel.kesik` `contain` kullanıyor. Katalogda az önce
    // düzeltilen hatanın (`kirpma: 'tam'` yazıp hattın onu hiç okumaması) aynısını
    // burada yeniden üretmemek için beyan ile davranış tek işlemde bağlanıyor.
    if (u.pathname === '/gorsel-ara-koy') {
      const d = JSON.parse(await govde(req))
      const k = kaynak[id]
      res.writeHead(200, { 'content-type': 'text/plain; charset=utf-8' })
      if (k?.tur !== 'kosu')
        return res.end(
          '✗ şablona sabit görsel konmaz — o şablondan üretilecek HER karosel bu\n' +
            '  ögeyi taşırdı (Yasa 13). Bir koşu seç ve oraya koy.'
        )
      const g = calisan[id].gorseller[d.i]
      if (g === undefined) return res.end('✗ ' + (d.i + 1) + '. yuva yok')
      // ⚠ Alan adı `tam`: ARAMA ÇIKTISININ alanı. İlk sürüm `ikon` okuyordu ve istemci
      // sonucun tamamını yayıyordu (`...o`) — iki uç aynı nesneyi iki farklı adla
      // bekleyince koyma sessizce *"ikon kimliği geçersiz: "* diyordu, BOŞ bir adla.
      // Sözleşme tek yerden, arama ne veriyorsa koyma onu okur.
      const tam = String(d.tam ?? d.ikon ?? '')

      // ⚠ ⚠ **İKİ AYRI YOL: RASTER ve VEKTÖR.** 3dicons ve Fluent Emoji hazır PNG
      // veriyor — SVG temizleyicisine ve rasterleme sayfasına ihtiyaç YOK, çünkü bayt
      // zaten bir görüntü ve betik taşımıyor. Iconify SVG veriyor ve o yol olduğu gibi
      // duruyor. İkisini tek yola zorlamak, ya PNG'yi gereksiz bir tarayıcıdan
      // geçirmek ya da SVG'yi temizlemeden koymak olurdu.
      const hazirUrl = String(d.pngUrl ?? '')
      if (hazirUrl !== '') {
        const h = await webAra.hazirPngCek(hazirUrl)
        if (!h.ok) return res.end('✗ ' + h.hata)
        const adH = 'gorsel-' + String(d.i + 1).padStart(2, '0') + '-elle.png'
        writeFileSync(join(k.dizin, adH), Buffer.from(h.b64, 'base64'))
        // ⚠ Kaynak damgası AYNI ANDA: bir varlığın nereden geldiği yuvaya girerken
        // bilinmiyorsa altı ay sonra hiç bilinmeyecek (Yasa 7).
        writeFileSync(
          join(k.dizin, adH.replace(/\.png$/, '.kaynak.json')),
          JSON.stringify(
            {
              ikon: tam,
              set: String(d.kaynak ?? ''),
              lisans: String(d.lisans ?? ''),
              spdx: String(d.spdx ?? ''),
              url: hazirUrl,
              bayt: h.bayt,
              tur: 'raster',
            },
            null,
            1
          ),
          'utf8'
        )
        anlikGoruntuAl(id)
        // ⚠ ⚠ **KIRPMA `kesik`e ÇEKİLİYOR — SVG yolundaki kararın AYNISI.** 3D render
        // kare bir tuvalde geliyor; 4:5 bir yuvada `tam` ile konursa kenarları kırpılır
        // ve nesnenin bir parçası kaybolur. Aynı kural iki yolda ayrı yazılsaydı biri
        // düzelir öteki unuturdu.
        calisan[id].gorseller[d.i] = {
          ...g,
          src: 'data:image/png;base64,' + h.b64,
          kirpma: 'kesik',
        }
        return res.end(
          '✓ ' +
            tam +
            ' → ' +
            adH +
            '\n  kaynak: ' +
            String(d.setAdi ?? d.kaynak ?? '?') +
            ' · lisans: ' +
            String(d.lisans ?? '?') +
            ' · ' +
            String(Math.round(h.bayt / 1024)) +
            ' KB'
        )
      }

      const s = await webAra.svgCek(tam)
      if (!s.ok) return res.end('✗ ' + s.hata)
      // ⚠ ⚠ **BİLİNMEYEN ROL SESSİZCE SİYAH ÇİZİYORDU — artık REDDEDİLİYOR.** Sınamada
      // uydurma bir rol (`--role-kreatif-aksan`) yazıldı; `var()` çözülemedi, `color`
      // geçersiz oldu ve iki farklı renkle konan iki ikon BİREBİR aynı baytı verdi.
      // Sessiz düşüş bu depoda tekrar eden en pahalı sınıf: çıktıya bakmadan görülmüyor.
      const istenenRenk = String(d.renk ?? '').trim()
      const rolAdi = /^var\((--[\w-]+)\)$/.exec(istenenRenk)?.[1] ?? ''
      if (istenenRenk !== '' && rolAdi === '')
        return res.end('✗ renk yalnız rampadan seçilir, serbest değer yok (R-35): ' + istenenRenk)
      if (rolAdi !== '' && !rampaRolleri().includes(rolAdi))
        return res.end(
          '✗ rampada böyle bir rol yok: ' + rolAdi + '\n  var olanlar: ' + rampaRolleri().join(', ')
        )
      const seciliRol = istenenRenk
      const p = await webAra.pngYap(s.svg, {
        genislik: 1024,
        yukseklik: 1024,
        // ⚠ Renk RAMPADAN geliyor, serbest hex DEĞİL (R-35). İkon `currentColor`
        // kullanıyor, sayfa token CSS'ini taşıyor; ara bir hex dönüşümü yok.
        renk: seciliRol,
        tokenCss,
        withPage,
      })
      if (!p.ok) return res.end('✗ ' + p.hata)
      const ad = 'gorsel-' + String(d.i + 1).padStart(2, '0') + '-elle.png'
      writeFileSync(join(k.dizin, ad), Buffer.from(p.b64, 'base64'))
      // ⚠ ⚠ **NEREDEN GELDİĞİ AYNI ANDA YAZILIYOR — sonradan retrofit imkânsız (Yasa 7).**
      // §17 bu depoda bir sesi *"ticari lisansı YOK"* diye reddetti; bir varlığın
      // lisansı, varlık yuvaya girerken bilinmiyorsa altı ay sonra hiç bilinmeyecek.
      writeFileSync(
        join(k.dizin, ad.replace(/\.png$/, '.kaynak.json')),
        JSON.stringify(
          {
            ikon: tam,
            set: String(d.set ?? ''),
            lisans: String(d.lisans ?? ''),
            spdx: String(d.spdx ?? ''),
            lisansUrl: String(d.lisansUrl ?? ''),
            yazar: String(d.yazar ?? ''),
            kaynakUrl: String(d.kaynakUrl ?? ''),
            saglayici: 'iconify',
          },
          null,
          2
        ) + '\n'
      )
      anlikGoruntuAl(id)
      calisan[id].gorseller[d.i] = {
        ...g,
        src: 'data:image/png;base64,' + p.b64,
        kirpma: 'kesik',
      }
      return res.end(
        '✓ ' +
          tam +
          ' → ' +
          ad +
          '\n  lisans: ' +
          String(d.lisans ?? '?') +
          ' · kırpma `kesik`e çekildi (yoksa kare öge 4:5 yuvada kırpılırdı)'
      )
    }

    // ── DIŞA AKTARMA: editörden de (FAZ-17.3) ──────────────────────────────
    //
    // ⚠ Belge BELLEKTEKİ çalışan kopyadan: editörde yaptığın düzenleme indirilen
    // dosyada olmalı, yoksa "gördüğün şey ihraç edilen şeydir" vaadi kırılır.
    if (u.pathname === '/disa-aktar') {
      const tarz = u.searchParams.get('tarz') === 'butun' ? 'butun' : 'dilim'
      const ham = u.searchParams.get('bicim')
      const bicim = ham === 'png' || ham === 'jpg' || ham === 'pdf' ? ham : 'png'
      const parcaNo = Number(u.searchParams.get('parca') ?? '0')
      const r = await panoramaDisaAktar(belge(id), { tarz, bicim })
      if (!r.ok) {
        res.writeHead(500, { 'content-type': 'text/plain; charset=utf-8' })
        return res.end('✗ dışa aktarılamadı: ' + JSON.stringify(r.error).slice(0, 200))
      }
      const p = r.value[Number.isInteger(parcaNo) && parcaNo >= 0 ? parcaNo : 0]
      if (p === undefined) {
        res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' })
        return res.end('✗ parça yok')
      }
      res.writeHead(200, {
        'content-type': p.mime,
        'content-disposition': 'attachment; filename="' + p.ad + '"',
        'x-parca-sayisi': String(r.value.length),
      })
      return res.end(p.bayt)
    }

    if (u.pathname === '/geri') {
      const y = geriYigin[id] ?? []
      if (y.length > 0) {
        ;(ileriYigin[id] ??= []).push(structuredClone(calisan[id]))
        calisan[id] = y.pop()
      }
      return json({ ok: true })
    }
    if (u.pathname === '/ileri') {
      const y = ileriYigin[id] ?? []
      if (y.length > 0) {
        ;(geriYigin[id] ??= []).push(structuredClone(calisan[id]))
        calisan[id] = y.pop()
      }
      return json({ ok: true })
    }
    // ── SIFIRLA: kaydedilmemiş her şeyi at, KAYNAĞA dön ────────────────────
    //
    // ⚠ ⚠ **"Geri al" YETMİYOR.** Yığın sınırlı ve on düzenleme sonra insanın istediği
    // şey adım adım geri sarmak değil, TEMİZ SAYFA. Bu düğme JSON'a yazmadan önceki
    // güvenlik ağı: denemekten korkmamak için geri dönüş ucuz olmalı.
    //
    // ⚠ Sıfırlama GERİ ALINABİLİR: mevcut hâl geri yığınına itiliyor. Tek tıkla iş
    // kaybettiren bir düğme, kullanılmayan bir düğmedir.
    if (u.pathname === '/sifirla') {
      const k = kaynak[id]
      res.writeHead(200, { 'content-type': 'text/plain; charset=utf-8' })
      if (k === undefined) return res.end('✗ kaynak bulunamadı: ' + id)
      anlikGoruntuAl(id)
      if (k.tur === 'sablon') {
        calisan[id] = structuredClone(ORNEKLER[k.ad])
        return res.end('✓ şablon kaynağa döndü: ' + k.ad)
      }
      try {
        // ⚠ Sıfırlama HATTIN ürettiğine döner (`panorama.json`), elle düzenlenmiş
        // sürüme değil: aksi hâlde düğme hiçbir şey yapmazdı.
        calisan[id] = kosuBelgesi(k.dizin, true)
        return res.end('✓ koşu defterindeki hâline döndü: ' + k.ad)
      } catch (e) {
        return res.end('✗ defter okunamadı: ' + String(e))
      }
    }
    if (u.pathname === '/kaydet') {
      const k = kaynak[id]
      res.writeHead(200, { 'content-type': 'text/plain; charset=utf-8' })

      // ── KOŞU modu: düzenleme O koşunun defterine iner ve SLAYTLAR YENİDEN ÇİZİLİR.
      // Yalnız JSON yazmak ölü bir varlık üretirdi: dosya var, kimse okumuyor. Elle
      // düzenlemenin karşılığı elle düzenlenmiş PNG'dir; ayrı dosya adıyla (`-elle`)
      // yazılıyor ki hattın ürettiği asıl çıktı yerinde kalsın ve fark görülebilsin.
      if (k?.tur === 'kosu') {
        const jsonYolu = join(k.dizin, 'panorama-elle.json')
        const d = belge(id)
        panoramaBelgesiniYaz(k.dizin, d, 'panorama-elle.json')
        const yollar = d.kartlar.map((_, n) =>
          join(k.dizin, 'slayt-' + String(n + 1).padStart(2, '0') + '-elle.png')
        )
        const r = await renderPanorama(d, yollar)
        if (!r.ok) return res.end('✗ render başarısız: ' + JSON.stringify(r.error))
        return res.end(
          '✓ ' +
            yollar.length +
            ' slayt yeniden çizildi → ' +
            k.dizin +
            '\n' +
            '  ' +
            yollar.map((y) => y.split('/').pop()).join(' · ') +
            '\n' +
            '✓ belge: ' +
            jsonYolu
        )
      }

      // ── ŞABLON modu: katalog dosyasına CERRAHİ yazıyor. Yorumlar korunuyor.
      const y = kataloguYaz(id)
      const yedekYol = join(REPO, 'derived/duzenleyici-' + k.ad + '.json')
      writeFileSync(yedekYol, JSON.stringify(calisan[id], null, 2))
      if (!y.ok)
        return res.end('✗ katalog YAZILMADI: ' + y.sebep + '\n  anlık görüntü: ' + yedekYol)
      return res.end(
        '✓ katalog-ornek.ts güncellendi — ' +
          y.degisiklikler.join(' · ') +
          "\n⚠ Bu bir ÖNERİ (Yasa 2): `git diff` ile bak, onay senin commit'in." +
          '\n  yeniden derle: just duzenle'
      )
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
process.on('uncaughtException', (e) => {
  // ⚠ Port çakışması SESSİZ ÖLÜM üretiyordu: eski bir tezgâh 4321'i tutuyorsa yeni
  // süreç EADDRINUSE ile düşüyor, log'a bir yığın izi yazıyor ve kullanıcı ESKİ
  // sunucuyu görmeye devam ediyordu — üstelik onun BELLEĞİNDEKİ eski kopyayı.
  // Bir kez yaşandı: katalogda geri alınmış bir düzenleme ekranda duruyordu.
  if (e?.code === 'EADDRINUSE') {
    console.error(
      '\n  ✗ ' +
        PORT +
        ' portu DOLU — büyük olasılıkla eski bir düzenleyici çalışıyor.\n' +
        '    Onu kapat:  pkill -f scripts/duzenleyici.mjs\n' +
        '    ⚠ Eski tezgâh belleğindeki kopyayı gösterir; dosyadaki hâli DEĞİL.\n'
    )
    process.exit(1)
  }
  console.error('[yakalanmadi]', e?.stack ?? e)
})
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
