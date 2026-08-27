// HEDEF: packages/contracts/src/icerik-kipi.ts
//
// İçerik kipi — üretilen şeyin NEREDEN geldiği (FAZ-19.12 · madde 7).
//
// ⚠ ⚠ **BU KİP BİR YASAĞI KALDIRMIYOR, BİR AYRIMI GÖRÜNÜR KILIYOR.** `SELECT` bugüne
// kadar bağlamsız üretimi reddediyordu ve gerekçesi kodda yazılıydı: *"bağlamsız
// üretilen metin markadan değil modelin genel bilgisinden gelir ve bunu ÇIKTIYA BAKARAK
// ayırt etmek zor."* Gerekçe hâlâ doğru. Depo sahibi genel içerik istedi — ama tehlike
// genel içeriğin kendisi değil, marka kaydından gelen içerikten AYIRT EDİLEMEMESİYDİ.
// Kip o ayrımı koşunun defterine yazıyor: altı ay sonra *"bu iddia bizim kaydımızdan mı
// geliyordu, modelin genel bilgisinden mi"* sorusunun bir cevabı oluyor.
//
// ⚠ ⚠ **YASA 8 İKİ KİPTE DE GEÇERLİ.** *"Kaynaksız sayısal iddia yayınlanamaz"* —
// genel kip bir muafiyet DEĞİL. Genel içerik açıklayıcı, kavramsal ve niteliksel
// olabilir; uydurulmuş bir yüzde, bir tarih ya da bir sıralama olamaz. Kip yalnız
// konunun NEREDEN seçileceğini değiştiriyor, neyin söylenebileceğini değil.

export type IcerikKipi = 'firma' | 'genel'

export const ICERIK_KIPLERI: readonly IcerikKipi[] = ['firma', 'genel']

/** Bilinmeyen değeri kipe çevirir; varsayılan `firma` — bugünkü davranış. */
export const icerikKipiCozumle = (v: unknown): IcerikKipi => (v === 'genel' ? 'genel' : 'firma')

/**
 * Kipin istemde ne dediği.
 *
 * ⚠ ⚠ **GENEL KİPİN KAPSAMI KAPALI BİR LİSTE DEĞİL ve bu depo sahibinin AÇIK
 * talimatı:** *"bunları tek tek seçmicez ya da söylemicez, genel bir özgürlük olduğu
 * belli olsun"*. O yüzden aşağıdaki alanlar ÖRNEK olarak veriliyor ve kapsamın açık
 * olduğu ayrıca söyleniyor. Kapalı bir liste yazsaydım model listenin dışına çıkmazdı
 * ve "genel" adı taşıyan bir kip, on maddelik bir menüye dönerdi.
 *
 * ⚠ Örnekler markanın dünyasına YAKIN seçildi ama onunla SINIRLI değil: sürdürülebilirlik
 * ve iş sürdürülebilirliği depo sahibinin *"bizim için önemli konu"* dediği eksen.
 */
export const kipTarifi = (kip: IcerikKipi): readonly string[] =>
  kip === 'genel'
    ? [
        'İÇERİK KİPİ: GENEL.',
        'Konu markanın kendi kayıtlarıyla SINIRLI DEĞİL. Alan geniş ve açık:',
        'üretim, geri kazanım, yazılım, algoritma, optimizasyon, sürdürülebilirlik,',
        'iş sürdürülebilirliği, malzeme, ölçüm, otomasyon, enerji, tedarik — ve bunlarla',
        'akraba her konu. Bu bir MENÜ DEĞİL, bir yön: listede olmayan ama aynı dünyaya',
        'ait bir konu da seçilebilir.',
        'Amaç ürün ya da firma tanıtımı DEĞİL, gerçekten BİLGİ VEREN bir içerik.',
        // ⚠ ⚠ **BU SATIR TEK BAŞINA YETMEDİ ve depo sahibi ölçtü: *"genel zaten
        // aslında bunun içindi… ama yapmıyor gibi."*** Sebep yapısaldı: kip yalnız
        // KONUYU seçiyordu, YAZANA hiç ulaşmıyordu (`uyarlamaIstemi` kipi almıyordu).
        // Bir amaç cümlesi, biçimi söylemeden biçim üretmiyor. Öğreticiliğin BİÇİMLERİ
        // artık burada ve ikisine de gidiyor.
        //
        // ⚠ Biçimler bir MENÜ DEĞİL, bir repertuvar: konu hangisini gerektiriyorsa o.
        'BİÇİM: bu bir DERS, bir duyuru değil. Şu kalıplardan konuya uyanı seç:',
        '  · NEDİR — bir kavramı sıfırdan, bilmeyen birine anlat.',
        '  · NE İŞE YARAR — neyi çözüyor, olmadığında ne oluyor.',
        '  · NASIL YAPILIR — adım adım, okuyan uygulayabilsin.',
        '  · ESKİ / YENİ — dün böyle yapılıyordu, bugün böyle; ne değişti.',
        '  · BUNDAN HABERİNİZ VAR MI — çoğu kişinin bilmediği, doğrulanabilir bir olgu.',
        '  · ŞUNU YAPMAK ŞUNU KAZANDIRIR — bir davranış, karşılığı olan somut bir sonuç.',
        'Okuyan karoseli kapattığında YAPABİLECEĞİ ya da ANLATABİLECEĞİ bir şey kalmalı.',
        'Havalı ama boş cümle yazma: "dönüşümün anahtarı" gibi bir söz hiçbir şey öğretmez.',
        // ⚠ Yasa 8 burada tekrarlanıyor çünkü genel kipte kaynak baskısı en düşük ve
        // uydurma sayı riski en yüksek. İstemin sustuğu yerde model doldurur.
        'Sayı, yüzde, tarih ya da sıralama UYDURMA. Elinde kaynağı olmayan sayısal bir',
        'iddia yazma; anlatmak istediğini niteliksel olarak anlat.',
      ]
    : [
        'İÇERİK KİPİ: FİRMA.',
        'Konu markanın KENDİ kayıtlarından gelir: ürünler, strateji notları, kanıtlar.',
        'Ürün tanıtımı, firma tanıtımı ve markanın söylemeye yetkili olduğu iddialar.',
        // ⚠ Firma kipinde de anlatım ÖĞRETİCİ olabilir ama kaynak MARKANIN kaydıdır:
        // burada "bilmediğin bir şey öğret" demek, kayıtta olmayanı uydurmaya davettir.
        'Anlatım açıklayıcı olsun; ama söylenen her şey markanın kaydına dayanmalı.',
      ]
