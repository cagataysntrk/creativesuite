// HEDEF: scripts/gorsel-tr.mjs
//
// Görsel aramanın TÜRKÇE ve ANLAMSAL katmanı (FAZ-19.13).
//
// ⚠ ⚠ **İKİ AYRI SORUN, İKİ AYRI ÇÖZÜM.** (1) Kataloglar İNGİLİZCE ve depo sahibi
// Türkçe arıyor. (2) İnsan *"geri kazanım"* yazıyor ama katalogda o ad yok — aradığı şey
// `recycling`, `leaf`, `arrows`. Birincisi ÇEVİRİ, ikincisi KAVRAM genişletmesi.
//
// ⚠ ⚠ **FLUENT İÇİN SÖZLÜK YAZMADIM — Unicode CLDR'ın Türkçesi var** ve katalogda
// duruyor (1198/1595 öğe). Aşağıdaki tablo yalnız `3dicons` için: onlar emoji değil,
// CLDR kapsamında yok. 120 ad, elle ve ALANA GÖRE yazıldı — bu depo geri kazanım,
// ölçüm ve imalat anlatıyor.

/** 3dicons adı → Türkçe karşılıklar. */
export const UC_D_TR = {
  '3d': ['üç boyut', 'küp'],
  '3d-coin': ['madeni para', 'jeton', 'para'],
  axe: ['balta'],
  bag: ['çanta', 'torba'],
  battery: ['pil', 'batarya', 'enerji'],
  bookmark: ['yer imi', 'işaret'],
  'bookmark-fav': ['yer imi', 'favori'],
  boy: ['erkek', 'kişi', 'insan'],
  brush: ['fırça'],
  bucket: ['kova'],
  bulb: ['ampul', 'fikir', 'ışık'],
  calculator: ['hesap makinesi', 'hesap'],
  calender: ['takvim', 'tarih', 'plan'],
  camera: ['kamera', 'fotoğraf'],
  can: ['kutu', 'teneke', 'ambalaj'],
  card: ['kart', 'kredi kartı'],
  chart: ['grafik', 'tablo', 'ölçüm', 'veri', 'rapor'],
  chat: ['sohbet', 'mesaj', 'konuşma'],
  'chat-bubble': ['balon', 'mesaj', 'sohbet'],
  'chat-text': ['mesaj', 'yazı', 'sohbet'],
  chess: ['satranç', 'strateji'],
  circle: ['daire', 'çember'],
  clock: ['saat', 'zaman', 'süre', 'vardiya'],
  'color-palette': ['palet', 'renk'],
  computer: ['bilgisayar', 'ekran'],
  copy: ['kopya', 'çoğalt'],
  crown: ['taç'],
  cube: ['küp', 'kutu', 'blok'],
  cup: ['bardak', 'fincan'],
  dollar: ['dolar', 'para'],
  euro: ['avro', 'para'],
  explorer: ['dosya', 'klasör'],
  eyedropper: ['damlalık', 'renk seçici'],
  'fav-folder': ['klasör', 'favori'],
  file: ['dosya', 'belge', 'kayıt'],
  'file-fav': ['dosya', 'favori'],
  'file-plus': ['dosya', 'yeni'],
  'file-text': ['belge', 'yazı', 'rapor', 'kayıt'],
  fire: ['ateş', 'yangın'],
  flag: ['bayrak', 'işaret', 'hedef'],
  flash: ['şimşek', 'hız', 'enerji'],
  folder: ['klasör', 'dosya', 'arşiv', 'kayıt'],
  gift: ['hediye'],
  girl: ['kadın', 'kişi', 'insan'],
  glass: ['bardak', 'cam'],
  gym: ['spor', 'ağırlık'],
  headphone: ['kulaklık', 'ses'],
  heart: ['kalp', 'beğeni'],
  key: ['anahtar', 'kilit'],
  lab: ['laboratuvar', 'deney', 'ölçüm', 'test'],
  link: ['bağlantı', 'zincir'],
  location: ['konum', 'yer', 'harita'],
  lock: ['kilit', 'güvenlik'],
  locker: ['dolap', 'kilit'],
  mail: ['posta', 'mektup', 'eposta'],
  'map-pin': ['harita', 'konum', 'iğne'],
  medal: ['madalya', 'ödül'],
  megaphone: ['megafon', 'duyuru', 'ilan'],
  mic: ['mikrofon', 'ses'],
  mobile: ['telefon', 'cep telefonu'],
  money: ['para', 'nakit'],
  'money-bag': ['para', 'kese', 'kazanç'],
  moon: ['ay', 'gece'],
  music: ['müzik', 'nota'],
  'new-folder': ['klasör', 'yeni'],
  notebook: ['defter', 'not', 'kayıt'],
  'paint-brush': ['fırça', 'boya'],
  'paint-kit': ['boya', 'palet'],
  pencil: ['kalem', 'yazı', 'düzenle'],
  picture: ['resim', 'görsel', 'fotoğraf'],
  pin: ['iğne', 'sabitle'],
  play: ['oynat', 'başlat'],
  plus: ['artı', 'ekle'],
  puzzle: ['yapboz', 'parça', 'uyum'],
  rocket: ['roket', 'hız', 'başlangıç', 'büyüme'],
  'roll-brush': ['rulo', 'boya'],
  scissor: ['makas', 'kes'],
  setting: ['ayar', 'dişli', 'çark', 'makine'],
  sheild: ['kalkan', 'koruma', 'güvenlik'],
  sphere: ['küre', 'top'],
  star: ['yıldız'],
  sun: ['güneş', 'gündüz'],
  'takeaway-cup': ['bardak', 'kahve'],
  target: ['hedef', 'nişan', 'amaç'],
  'tea-cup': ['çay', 'fincan'],
  'thumb-down': ['beğenmedim', 'olumsuz'],
  'thumb-up': ['beğendim', 'olumlu', 'onay'],
  tick: ['onay', 'tik', 'doğru'],
  toggle: ['anahtar', 'aç kapa'],
  tool: ['alet', 'takım', 'tamir', 'bakım'],
  'trash-can': ['çöp', 'atık', 'geri dönüşüm', 'kutu'],
  travel: ['seyahat', 'valiz'],
  trophy: ['kupa', 'ödül', 'başarı'],
  umbrella: ['şemsiye', 'koruma'],
  'video-camera': ['kamera', 'video'],
  wallet: ['cüzdan', 'para'],
  wifi: ['kablosuz', 'ağ', 'bağlantı'],
  zoom: ['büyüteç', 'yakınlaştır', 'ara', 'incele'],
}

/**
 * KAVRAM genişletmesi — aranan söz ile katalogdaki ad AYNI OLMAYABİLİR.
 *
 * ⚠ ⚠ **BU BİR ÇEVİRİ DEĞİL, BİR KÖPRÜ.** İnsan *"geri kazanım"* yazıyor; katalogda o ad
 * yok ama `recycling`, `leaf`, `arrows` var. Bu tablo o boşluğu geçiyor ve ALANA GÖRE
 * yazıldı: bu depo geri kazanım, ölçüm ve imalat anlatıyor.
 * ⚠ Tek yönlü DEĞİL: hem Türkçe hem İngilizce girdi aynı kümeye açılıyor, çünkü insan
 * ikisini karıştırarak yazıyor.
 */
export const KAVRAM = {
  'geri kazanım': ['recycling symbol', 'recycling', 'recycle', 'leaf', 'arrows', 'trash-can'],
  'geri dönüşüm': ['recycling symbol', 'recycling', 'recycle', 'leaf', 'arrows', 'trash-can'],
  atık: ['wastebasket', 'trash-can', 'recycling symbol', 'litter in bin sign'],
  fire: ['chart', 'chart decreasing', 'wastebasket', 'trash-can'],
  ölçüm: ['chart', 'straight ruler', 'scales', 'thermometer', 'lab', 'triangular ruler'],
  ölç: ['chart', 'straight ruler', 'scales', 'lab'],
  veri: ['chart', 'card index', 'file', 'bar chart', 'clipboard', 'card file box'],
  rapor: ['chart', 'file-text', 'clipboard', 'page facing up', 'memo'],
  kayıt: ['file', 'folder', 'clipboard', 'card index', 'notebook'],
  arşiv: ['folder', 'file cabinet', 'card file box', 'card index dividers'],
  fabrika: ['factory', 'building construction', 'setting'],
  imalat: ['factory', 'setting', 'tool', 'hammer and wrench'],
  hat: ['setting', 'chain', 'link', 'gear'],
  makine: ['setting', 'gear', 'tool', 'nut and bolt'],
  bakım: ['tool', 'hammer and wrench', 'wrench', 'setting'],
  vardiya: ['clock', 'alarm clock', 'calender', 'spiral calendar'],
  zaman: ['clock', 'alarm clock', 'hourglass done', 'stopwatch'],
  hedef: ['target', 'direct hit', 'bullseye', 'flag'],
  büyüme: ['chart increasing', 'chart', 'rocket', 'seedling'],
  düşüş: ['chart decreasing', 'chart'],
  kalite: ['medal', 'trophy', 'check mark button', 'tick', 'sparkles'],
  onay: ['check mark button', 'tick', 'thumb-up', 'ballot box with check'],
  uyarı: ['warning', 'triangular flag', 'police car light'],
  para: ['money', 'money-bag', 'dollar', 'money with wings', 'coin'],
  maliyet: ['money', 'money-bag', 'chart decreasing', 'receipt'],
  enerji: ['flash', 'high voltage', 'battery', 'light bulb'],
  fikir: ['bulb', 'light bulb', 'brain', 'thought balloon'],
  ekip: ['people hugging', 'busts in silhouette', 'handshake'],
  müşteri: ['handshake', 'busts in silhouette', 'briefcase'],
  sunum: ['chart', 'bar chart', 'clipboard', 'card index'],
  depo: ['package', 'card file box', 'factory'],
  taşıma: ['truck', 'delivery truck', 'package'],
  kamyon: ['delivery truck', 'articulated lorry', 'truck'],
  sensör: ['satellite antenna', 'signal strength', 'wifi'],
  ağ: ['wifi', 'signal strength', 'globe with meridians', 'link'],
  güvenlik: ['sheild', 'lock', 'locked', 'shield'],
  belge: ['file-text', 'page facing up', 'memo', 'scroll'],
  arama: ['zoom', 'magnifying glass tilted left', 'mag'],
}

/** Türkçe katlama — arama karşılaştırması için (R-21: `toLowerCase` çıplak KULLANILMAZ). */
const TR_KUCUK = { İ: 'i', I: 'ı', Ş: 'ş', Ğ: 'ğ', Ü: 'ü', Ö: 'ö', Ç: 'ç' }
const AKSANSIZ = { ı: 'i', ş: 's', ğ: 'g', ü: 'u', ö: 'o', ç: 'c', â: 'a', î: 'i', û: 'u' }

/**
 * Aramaya hazır sade biçim: Türkçe'ye göre küçültülmüş, aksanı katlanmış.
 *
 * ⚠ ⚠ **R-21: `'I'.toLowerCase()` Türkçe'de `'ı'`dır, `'i'` DEĞİL.** Çıplak `toLowerCase`
 * bu depoda bir kez gerçek bir e-postayı KVKK kapısından geçirdi. Önce Türkçe harfler
 * elle katlanıyor, sonra ASCII küçültme yapılıyor.
 * ⚠ Aksan da katlanıyor: insan *"olcum"* yazıp *"ölçüm"* bulmak istiyor.
 */
export const sade = (x) =>
  [...String(x)]
    .map((c) => TR_KUCUK[c] ?? c)
    .join('')
    .toLowerCase()
    .split('')
    .map((c) => AKSANSIZ[c] ?? c)
    .join('')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()

/**
 * Sorguyu genişletir: aslı + kavram köprüsü + kelime kelime köprü.
 *
 * ⚠ Kelime kelime de bakılıyor: *"geri kazanım hattı"* tam eşleşmiyor ama *"geri
 * kazanım"* ve *"hat"* ayrı ayrı eşleşiyor. Yalnız tam ifadeye bakmak, iki kelimelik
 * her aramayı boşa çıkarırdı.
 */
export const genislet = (sorgu) => {
  const s = sade(sorgu)
  const cikti = new Set([s])
  for (const [anahtar, degerler] of Object.entries(KAVRAM)) {
    const a = sade(anahtar)
    if (a === '') continue
    if (s === a || s.includes(a) || a.includes(s)) for (const d of degerler) cikti.add(sade(d))
  }
  for (const kelime of s.split(' ').filter((x) => x.length > 2)) {
    cikti.add(kelime)
    for (const [anahtar, degerler] of Object.entries(KAVRAM)) {
      if (sade(anahtar).includes(kelime)) for (const d of degerler) cikti.add(sade(d))
    }
  }
  return [...cikti].filter((x) => x !== '')
}
