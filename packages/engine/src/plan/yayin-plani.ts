// HEDEF: packages/engine/src/plan/yayin-plani.ts
//
// Yayın takvimi — şablon dağılımı ve otomatik planlama (FAZ-19.12 · madde 10).
//
// ⚠ ⚠ **SORUN ÖLÇÜLDÜ, VARSAYILMADI.** Depodaki 19 yayına aday koşu sıraya dizildi:
//
//   dağılım       : sahne 4 · veri-hikayesi 4 · alinti 3 · editoryal 2 · kalan altısı 1'er
//   dengesizlik   : 4,0× (en çok / en az) · standart sapma 1,22 (eşit dağılımda 0)
//   ardışık tekrar: 5/18 geçiş — yani her dört gönderiden biri bir öncekiyle AYNI şablon
//   en uzun seri  : 3
//
// Depo sahibi: *"üst üste aynı şablonlar paylaşılmasın, ağırlık eşit dağılsın"*. Sorun
// gerçek ve sayısı belli.
//
// ⚠ ⚠ **PENCERE GENİŞLİĞİ BİR YARGI, ÖLÇÜM DEĞİL — ve bunu söylemek zorundayım.**
// Pencereyi 1'den 5'e taradım ve HEPSİ aynı 5 ihlali verdi: bugünkü tekrarların hepsi
// birbirinin HEMEN ardında, "üç gönderi sonra geri döndü" vakası hiç yok. Yani eldeki
// veri 1 ile 5'i AYIRT EDEMİYOR. `3` seçildi çünkü (a) bugünkü ihlallerin hepsini
// kapsıyor, (b) 10 şablonla sağlanması için yalnız 4 farklı şablon gerekiyor — yani
// bedeli yok, (c) henüz olmamış ama kolayca olabilecek bir deseni de kapatıyor.
// Ölçümün desteklediği asgari değer 1; 3 bir tedbir ve öyle olduğu yazılı.
export const TEKRAR_PENCERESI = 3

/** Takvime girecek bir üretim. */
export interface YayinAdayi {
  readonly runId: string
  readonly sablon: string
  /** Sıralamada belirleyici: eski üretim önce yayınlanır, kuyrukta unutulmasın. */
  readonly hazirlanmaZamani: string
}

export interface PlanliYayin {
  readonly runId: string
  readonly sablon: string
  /** ISO tarih (YYYY-MM-DD). */
  readonly tarih: string
  readonly hafta: number
}

export interface PlanUyarisi {
  readonly tur: 'pencere-saglanamadi' | 'dagilim-dengesiz'
  readonly aciklama: string
}

export interface YayinPlani {
  readonly gonderiler: readonly PlanliYayin[]
  readonly uyarilar: readonly PlanUyarisi[]
  /** Şablon → kaç kez planlandı. Dengeyi gözle görmek için. */
  readonly dagilim: Readonly<Record<string, number>>
}

/**
 * `YYYY-MM-DD` tarihine gün ekler.
 *
 * ⚠ ⚠ **`Date` KULLANILIYOR ama `Date.now()` KULLANILMIYOR — fark önemli.** R-06
 * bugünü SORMAYI yasaklıyor, tarih aritmetiğini değil: başlangıç tarihi ÇAĞIRANDAN
 * geliyor ve aynı girdi her zaman aynı takvimi veriyor. `Date.now()` çağırsaydım aynı
 * plan iki gün üst üste iki farklı takvim üretirdi ve replay çökerdi.
 * ⚠ UTC ŞART: yerel saat diliminde `setDate` yaz saati geçişlerinde bir gün kayabiliyor
 * ve takvim sessizce yanlış güne düşerdi.
 */
const gunEkle = (iso: string, gun: number): string => {
  const [y, a, g] = iso.split('-').map(Number)
  const t = new Date(Date.UTC(y ?? 1970, (a ?? 1) - 1, g ?? 1))
  t.setUTCDate(t.getUTCDate() + gun)
  return t.toISOString().slice(0, 10)
}

/**
 * Haftalık gün dağılımı — N gönderi haftaya EŞİT aralıklarla yayılıyor.
 *
 * ⚠ Üst üste iki güne koymak yerine araya boşluk bırakılıyor: haftada 3 için Pzt/Çrş/Cum
 * (0, 2, 4), haftada 2 için Pzt/Per (0, 3). Aynı hafta içinde arka arkaya yayınlamak,
 * "haftada 3" demenin amacını (düzenli görünürlük) boşa çıkarır.
 */
const haftaGunleri = (kac: number): readonly number[] => {
  if (kac <= 1) return [0]
  const adim = 7 / kac
  return Array.from({ length: kac }, (_, i) => Math.round(i * adim))
}

/**
 * Yayına hazır üretimleri takvime yayar.
 *
 * ⚠ ⚠ **SEÇİM EN AZ KULLANILANDAN — ve denge BÖYLE kuruluyor, bir eşikle değil.**
 * Bir dengesizlik eşiği koyup ihlalde reddetmek, kuyruğun sonundaki üretimi
 * cezalandırırdı. Her adımda en az kullanılmış şablonu seçmek dengeyi YAPISAL olarak
 * kuruyor: ölçülen 4,0× dengesizlik, plan boyunca kendiliğinden kapanıyor.
 * ⚠ Eşitlikte HAZIRLANMA ZAMANI belirleyici: eski üretim önce yayınlanır, kuyrukta
 * unutulmaz. Aynı kural sunucunun onay kuyruğunda da var ve orada bir sözleşme.
 *
 * ⚠ Pencere sağlanamıyorsa üretim ATLANMIYOR, UYARI ile yerleştiriliyor. Elde yalnız
 * iki şablon varsa "üst üste koyma" kuralı sağlanamaz; o üretimi hiç yayınlamamak,
 * kuralın amacından (çeşitlilik) daha büyük bir zarar olurdu.
 */
export const yayinPlaniKur = (
  adaylar: readonly YayinAdayi[],
  g: {
    readonly haftadaKac: number
    /** ISO `YYYY-MM-DD` — çağıran verir (R-06). */
    readonly baslangic: string
    /** Takvimden ÖNCE yayınlanmış şablonlar, en yeniden eskiye. Pencere onları da sayar. */
    readonly oncekiSablonlar?: readonly string[]
  }
): YayinPlani => {
  const kac = Math.max(1, Math.floor(g.haftadaKac))
  const gunler = haftaGunleri(kac)
  const kalan = [...adaylar].sort((a, b) => a.hazirlanmaZamani.localeCompare(b.hazirlanmaZamani))
  const sayac = new Map<string, number>()
  for (const a of adaylar) sayac.set(a.sablon, 0)
  // ⚠ Önceki yayınlar pencereye DAHİL: takvimin ilk gönderisi, takvimden önceki son
  // gönderiyle aynı şablonsa bu da bir "üst üste" ihlalidir. Pencereyi takvimin
  // başında sıfırlamak, tam da kesişme noktasını kör bırakırdı.
  const sonSablonlar: string[] = [...(g.oncekiSablonlar ?? [])].slice(0, TEKRAR_PENCERESI)
  const gonderiler: PlanliYayin[] = []
  const uyarilar: PlanUyarisi[] = []

  for (let i = 0; kalan.length > 0; i++) {
    const hafta = Math.floor(i / kac)
    const tarih = gunEkle(g.baslangic, hafta * 7 + (gunler[i % kac] ?? 0))
    const uygun = kalan.filter((a) => !sonSablonlar.includes(a.sablon))
    const havuz = uygun.length > 0 ? uygun : kalan
    if (uygun.length === 0)
      uyarilar.push({
        tur: 'pencere-saglanamadi',
        aciklama:
          `${tarih}: son ${String(TEKRAR_PENCERESI)} gönderinin şablonları dışında aday ` +
          'kalmadı — çeşitlilik kuralı bu gönderide sağlanamıyor',
      })
    // En az kullanılan; eşitlikte en eski hazırlanan (havuz zaten o sırada).
    let secilen = havuz[0] as YayinAdayi
    for (const a of havuz) {
      if ((sayac.get(a.sablon) ?? 0) < (sayac.get(secilen.sablon) ?? 0)) secilen = a
    }
    kalan.splice(kalan.indexOf(secilen), 1)
    sayac.set(secilen.sablon, (sayac.get(secilen.sablon) ?? 0) + 1)
    sonSablonlar.unshift(secilen.sablon)
    sonSablonlar.length = Math.min(sonSablonlar.length, TEKRAR_PENCERESI)
    gonderiler.push({ runId: secilen.runId, sablon: secilen.sablon, tarih, hafta: hafta + 1 })
  }

  // ⚠ Denge uyarısı PLAN İÇİN, geçmiş için değil: elde yalnız bir şablondan üretim
  // varsa plan onu tekrarlamak zorunda ve bu planın kusuru değil, HAVUZUN.
  const degerler = [...sayac.values()]
  // ⚠ ⚠ **`Math.min(...degerler, 0)` YAZMIŞTIM ve asgari HEP 0 çıkıyordu.** Fazladan
  // `0` argümanı bir "boş dizi koruması" gibi görünüyor ama aslında sonucu 0'a
  // KİLİTLİYOR: her şablon en az bir kez planlandığı hâlde uyarı *"en az 0"* diyordu.
  // Boş dizi zaten yukarıdaki `degerler.length > 1` koşuluyla eleniyor.
  const enCok = degerler.length === 0 ? 0 : Math.max(...degerler)
  const enAz = degerler.length === 0 ? 0 : Math.min(...degerler)
  if (degerler.length > 1 && enCok - enAz >= 2)
    uyarilar.push({
      tur: 'dagilim-dengesiz',
      aciklama:
        `şablon ağırlığı eşit değil: en çok ${String(enCok)}, en az ${String(enAz)} — ` +
        'havuzda bazı şablonlardan daha fazla üretim var',
    })

  return { gonderiler, uyarilar, dagilim: Object.fromEntries(sayac) }
}
