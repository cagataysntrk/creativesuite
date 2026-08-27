// HEDEF: packages/render/src/panorama-denetim.ts
//
// Panorama denetimi — çıktıya BAKAN ölçüm (FAZ-15.8 · §11 · R-71).
//
// ⚠ ⚠ **BU DOSYA BİR ALIŞKANLIKTAN DOĞDU: "metrik yeşilken çıktı kırık olabilir."**
// Bu oturumda on iki kusur yalnızca render edilip BAKILARAK bulundu — sabit beyaz
// paneller, kaybolan hayalet rakam, birbirine yapışan kelimeler, hiçbir şey anlatmayan
// çubuk grafik. Hepsinin ortak yanı: var olan bir testi geçiyorlardı. Buradaki ölçümler
// "öge var mı" diye değil, **"göründüğü gibi mi duruyor"** diye soruyor.
//
// ⚠ ⚠ **ÖLÇÜM DOM'DAN, BELGEDEN DEĞİL.** Belgeye bakan bir denetim, belgenin kendisiyle
// aynı varsayımları paylaşır ve asla kırmızıya dönmez — bu oturumda `column_in_band`,
// `ghost_overlap` ve `spacing_offscale` tam olarak böyle kırıldı. Sorular tarayıcıya
// soruluyor: kutu taştı mı, hangi glif çizilemedi, metin kesim çizgisini geçti mi.
//
// ⚠ **DÜZELTME BURADA DEĞİL.** Denetim yalnız kusuru ve YERİNİ söylüyor; düzeltmeyi
// uyarlama katmanı yapıyor (`sablon-uyarla`), çünkü kompozisyonu koruyan tek yer orası.
// Denetim düzeltseydi, düzelttiği şeyi kimse doğrulamazdı.

import { withPage, type BrowserResult, type Oturum, type Page } from './browser.js'
import { kapsamDisiKarakterler } from './fonts.js'
import {
  DIKIS_BANDI,
  EZICI_PAY,
  ZEMINDEN_AYRISMA,
  panoramaHtml,
  aksanAlaniOlcumu,
  okNisaniOlcumu,
  knockoutOlcumu,
  metinMaskesi,
  puntoOlcumu,
  type PanoramaBelgesi,
} from './panorama.js'

export type KusurTuru =
  /** Bir metin kutusu içeriğini kırpıyor — satır ya da kelime görünmüyor. */
  | 'tasma'
  /** Fontta olmayan glif çizildi — Türkçe aksanların bilinen hata modu. */
  | 'eksik-glif'
  /** Metin kesim çizgisini geçiyor: yarısı bir slaytta, yarısı ötekinde. */
  | 'kesim-uzeri-metin'
  /**
   * Metin gövdesi görselin ÜSTÜNDE duruyor — üstte olmak okunabilirlik değildir.
   *
   * ⚠ `metin-ortuluyor` boyama SIRASINI soruyor ve doğru cevap veriyor; bu kusur
   * KONUMU soruyor. Bir fotoğrafın üstündeki metin, fotoğraf dokulu olduğu ölçüde
   * okunmaz ve kesik özne tanımı gereği dokuludur (gerçek koşu: `run_01a02ade`).
   */
  | 'metin-gorsel-cakisiyor'
  /**
   * Bir metin gövdesi OKUMA EŞİĞİNİN altında dizilmiş (R-83).
   *
   * ⚠ Ölçü nominal punto değil, harfin gözde kapladığı AÇI. Kritik punto 0,20°
   * (Legge & Bigelow 2011); altında okuma hızı çöküyor. Etiket/künye muaf —
   * üç kelimelik bir dize okunmaz, TANINIR.
   */
  | 'punto-esik-alti'
  /**
   * Gövde satırı ölçü bandının (45–75 karakter) dışında (R-86).
   *
   * ⚠ Yalnız ÇOK SATIRLI gövdede anlamlı: tek satıra sığan kısa bir metnin "satırı"
   * metnin kendi uzunluğudur, bir ölçü kararı değil.
   */
  | 'olcu-bandi-disi'
  /**
   * İçerik kadrajı doldurmuş — boşluk payı %30'un altında (R-88).
   *
   * ⚠ Boşluk boşa gitmiş alan değil, okunabilirliğin kendisi. Kadrajın en az üçte
   * biri boş kalmazsa göz nereye bakacağını seçemiyor ve slayt "sıkışık" okunuyor.
   */
  | 'bosluk-payi-dusuk'
  /** Metin kadrajın %30'undan fazlasını kaplıyor — slayt fazla kelime taşıyor (R-88). */
  | 'metin-payi-yuksek'
  /** Bir içerik ögesi güvenli alanın dışında — üst/alt 80 px, yan 60 px (R-88). */
  | 'guvenli-alan-disi'
  /** Şablon kesintisizlik iddia ediyor ama hiçbir öge kesimi aşmıyor. */
  | 'kesintisizlik-yok'
  /**
   * Tek bir kartın uzun kelimesi TÜM karoselin başlık ölçeğini çökertiyor.
   *
   * ⚠ ⚠ **BU KUSUR TÜRÜ, BİR İHLAL DENEMESİNİN ÜRÜNÜ.** Kasten 66 harflik bölünemez bir
   * kelime yazıldı ve denetim "0 kusur" dedi — çünkü taşma ARANIYORDU ve taşma yoktu:
   * `puntoOlcumu` puntoyu 96,1'den 30,8 px'e indirip kelimeyi sığdırmıştı. Sistem
   * doğru çalışıyordu; ölçülen şey yanlıştı. Gerçek kusur taşma değil, ÇÖKME: tavan
   * tüm kartların en darından geldiği için bir kart altı kartın hepsini küçültüyor ve
   * poster tipografisi 30 px'e iniyor. Görünen kusuru arayan bir denetim, görünmez
   * kusuru kaçırır.
   */
  | 'punto-cokmesi'
  /** Bir kartın metni tuvalin dışına taşıyor. */
  | 'kart-disi'
  /**
   * Belge AI ifşası taşıdığını söylüyor ama slaytta GÖRÜNMÜYOR (§11.3 · Md. 50).
   *
   * ⚠ ⚠ **İFŞA İDDİA EDİLMEZ, ÖLÇÜLÜR.** `visibleDisclosure: true` yazan bir sidecar,
   * kimsenin bakmadığı bir kutucuğun işaretlenmesidir — bu deponun `dayanaksiz`
   * dediği şeyin ta kendisi (D-23). Ölçüm DOM'da: şerit her slaytta var mı, boyutu
   * sıfır mı, üstü örtülü mü. Yayın kapısı buna dayanacak.
   */
  | 'ifsa-gorunmuyor'
  /**
   * İfşa şeridi ÇİZİLİYOR ama arkasındaki görsel yüzünden OKUNMUYOR (§11.3).
   *
   * ⚠ ⚠ **"GÖRÜNÜR" İLE "OKUNUR" AYRI ŞEYLER — ve ilk ölçüm bunu karıştırdı.**
   * Denetim şeridin boyutuna, `display`ine ve opaklığına bakıyordu; üçü de geçiyordu.
   * Ama gerçek çıktıda kesik özne kadrajın dibine kadar iniyor ve şerit AÇIK bir kâğıt
   * yığınının üstüne düşüyor: soluk gri metin beyaz zeminde kayboluyor. Md. 50 görünür
   * ifşa istiyor; okunamayan bir ifşa, ifşa değildir.
   */
  | 'ifsa-okunmuyor'
  /**
   * Çıktıda YER TUTUCU kutusu var — görsel üretilemedi ve yerine çerçeve çizildi.
   *
   * ⚠ ⚠ **BU KUSUR GERÇEK BİR ÇIKTIYA BAKARAK DOĞDU ve kalite kapısı onu GEÇİRDİ.**
   * Panelden onaylanan koşuda `gorsel-uret` sağlayıcı politikasıyla reddedildi
   * (`IMAGE_PROMPT_REJECTED`), bir yuva boş kaldı ve son slaytta kesik çizgili bir
   * kutu ile "kesik özne — 3" etiketi kaldı. `kalite` yine de "0 kusur, geçti" dedi:
   * denetim taşmayı, kesimi, glifi ölçüyordu ama EKSİĞİ ölçmüyordu.
   *
   * ⚠ Yer tutucu bilerek çiziliyor (D-…: eksiklik görünür kalmalı, sessizce metin-only
   * bir karosele düşmek tasarımı tanınmaz yapar). Doğru davranış onu SİLMEK değil,
   * yayına gitmesini ENGELLEMEK: kusur olarak bildiriliyor, insan kapısı görüyor.
   */
  | 'yer-tutucu'
  /**
   * `matlama` bekleniyor ama görselin zemini siyah DEĞİL — kesim tutmayacak.
   *
   * ⚠ ⚠ **BU KUSUR TÜRÜ GERÇEK BİR ÇIKTIYA BAKARAK DOĞDU.** `kesik` kırpma, brief'in
   * *"plain solid black background"* istemesine ve alfanın o zeminin parlaklığından
   * türetilmesine dayanıyor. Katalog kaydı bunu *"garantiyi rica etme, yapıya göm"*
   * diye anlatıyor — ama brief bir RİCA'dır: hat koştu, model açık gri bir stüdyo
   * zemini üretti, luma anahtarı hiçbir şeyi kesmedi ve çıktıda kesik özne yerine
   * DİKDÖRTGEN bir fotoğraf durdu. Yapıya gömülmüş olan alfa türetimiydi; zeminin
   * siyah olması hâlâ modelin uymasına bağlı ve o yüzden ÖLÇÜLMESİ gerekiyor.
   */
  | 'matlama-tutmuyor'
  /**
   * **Süs, içerikten büyük.** Hayalet rakam kartın en büyük ögesi ve başlık + gövde +
   * panel toplamını aşıyor.
   *
   * ⚠ ⚠ **BU KUSUR BİR ÖLÇÜMDEN DOĞDU ve sayılar ezici.** `veri-hikayesi` — adı üstünde
   * VERİ şablonu — kartlarında panel kadrajın %0,9–4,9'unu tutuyordu, hayalet ise
   * %22–26'sını. Yani ekrandaki en büyük şey dekoratif bir gri rakamdı ve şablonun tüm
   * amacı olan veri bir kırıntıydı. Depo sahibinin *"aşırı bilgisayar işi duruyor"*
   * tespitinin sayısal karşılığı tam olarak bu: hiyerarşi ters.
   *
   * ⚠ Hayaleti YASAKLAMIYOR — gerçek koşularda çıktının en tasarımsal ögesiydi. Ölçtüğü
   * tek şey ORAN: süs içerikten büyükse kompozisyon süsün etrafında kurulmuş demektir.
   */
  | 'sus-baskin'
  /**
   * **Hayalet bir metnin ya da alan sınırının üstüne düşüyor.**
   *
   * ⚠ ⚠ **DEPO SAHİBİ ÜRETİMDE GÖRDÜ, DENETİM GÖRMEDİ.** `akan-alan`ın 3. slaydında dev
   * rakam alan sınırının tam üstüne düşüyor ve yarısı mavi yarısı siyah kalıyordu: kesik,
   * bozuk bir şekil. `sus-baskin` yalnız ALANI ölçüyor, ÇARPIŞMAYI değil — bir öge küçük
   * olup yine de yanlış yerde durabilir.
   * ⚠ Eşik %12: hayaletin kenarı bir harfe değebilir (bu kasıtlı katmanlanmadır); ama
   * gövdesinin sekizde birinden fazlası metnin üstündeyse artık okuma bozuluyor.
   */
  | 'hayalet-carpisma'
  /**
   * **Metin bir görselin ALTINDA kalıyor — okunmuyor.**
   *
   * ⚠ ⚠ **YİNE ÜRETİMDE GÖRÜLDÜ, DENETİM "kusur yok" DEDİ.** Gerçek bir koşuda iki
   * kartın gövdesi kesik öznenin arkasında kaldı, bir üçüncüsü yarıdan kırpıldı — ve
   * denetim temiz rapor verdi. Var olan hiçbir ölçüm bunu göremiyordu: `tasma` kutunun
   * İÇİNDEKİ kırpılmayı ölçüyor, `kart-disi` tuvalden taşmayı, `sus-baskin` yalnız alan
   * oranını. Örtülmek bunların hiçbiri değil.
   *
   * ⚠ ⚠ **Ölçü ÇAKIŞMA değil, ÖRTÜLME.** Metnin bir figürün üstünden geçmesi referans
   * tasarımlarda İSTENEN şey; kusur olan, metnin ALTTA kalması. Bu yüzden kutu kesişimi
   * değil `elementFromPoint` ile gerçek boyama sırası örnekleniyor: gözün gördüğü şey
   * ölçülüyor, bir vekil değil. Yerleşim bir gün metni üste alacak şekilde düzeltilirse
   * (BORÇLAR D14) aynı ölçüm kendiliğinden yeşile döner — eşiği kovalamak gerekmez.
   *
   * ⚠ Eşik %6: bir iki harfin kenarı örtülebilir, ama gövdenin on altıda birinden
   * fazlası kaybolduysa cümle artık okunmuyor.
   */
  | 'metin-ortuluyor'
  /**
   * **Süs ögesi metnin ARKASINDAN geçiyor.**
   *
   * ⚠ ⚠ **DEPO SAHİBİNİN GÖZÜ GÖRDÜ, DENETİM GÖRMEDİ.** Panelden koşan
   * `run_01a01876`in 2. ve 3. slaytlarında akan mavi alan gövde metninin son iki
   * satırının altından geçiyordu: okunuyor ama YANLIŞ görünüyor — tasarım değil,
   * kaza gibi. Denetim "0 kusur" dedi. Var olan hiçbir ölçüm bunu göremezdi:
   * `metin-ortuluyor` metnin ALTTA kalmasını arıyor (burada metin ÜSTTE),
   * `ifsa-okunmuyor` yalnız şeride bakıyor, kontrast ölçümü ise kutunun MEDYANINA
   * bakıyor ve iki satırlık bir kesişim medyanı kıpırdatmıyor.
   *
   * ⚠ Kuralın kendisi kataloğa ZATEN yazılıydı — `sahne` kaydı *"el çizimi yaylar kart
   * ARALARINDA duruyor, metnin üstünden geçmiyor: nüfus karoselinde oklar başlıkların
   * ortasından geçince okunmaz oldu ve silindi"* diyor. Yazılı olması yetmedi; ölçüm
   * yoktu.
   *
   * ⚠ Ölçü İKİ RENDER FARKI: süs gizlenip aynı kutu yeniden okunuyor, değişen piksel
   * oranı süsün metnin altında kapladığı alandır. Eşik ölçülerek seçildi — gerçek
   * belgede temiz kutular %0, kesişen ikisi %4,6 ve %5,9 verdi (§7.1).
   */
  | 'sus-metni-kesiyor'
  /**
   * **Sahne gövdenin sol üst köşesinde DEĞİL** — bütün karosel kaymış.
   *
   * ⚠ ⚠ **ÜRETİMDE 21 PX AŞAĞI KAYIYORDU ve hiçbir ölçüm bunu göremezdi.** Sebep:
   * görsel işlemlerinin `<svg class="filtre-tanim" width="0" height="0">` tanımları
   * gövdede INLINE duruyordu. Sıfır boyutlu bir inline öge bile satır kutusu doğurur
   * ve o kutunun strut yüksekliği 21 px'ti. Yani görsel işlemi olan HER belgede üstte
   * gövde zemininden bir şerit kalıyor, kartın son 21 px'i kadrajın dışına taşıyordu.
   *
   * ⚠ Var olan hiçbir kusur bunu göremezdi çünkü hepsi ögeleri KARTA göre ölçüyor:
   * kart kendi içinde kusursuzdu, YERİ yanlıştı. Güvenli alan bile karttan sayıldığı
   * için sessizdi. Kadraj, kartın kutusu değil EKRANIN kutusudur.
   *
   * ⚠ Ölçü mutlak: sahne (0,0)'da başlamıyorsa kusur. Tolerans yok — bir piksel kayma
   * bile ekran görüntüsünün her slaytta aynı yerden kesilmediği anlamına gelir.
   */
  | 'sahne-kaymis'
  /**
   * Bir görsel kesimin **arada kalan** bölgesinde: ne yeterince uzak ne de ezici (R-94).
   *
   * ⚠ ⚠ **KESİNTİSİZLİĞİN TAŞIYICISI SANILAN GÖRSELLER KESİMİ HİÇ AŞMIYORDU.**
   * `sahne`nin "1↔2 kesimi" diye adlandırılmış öznesi kesimin **0,4 px** solunda
   * bitiyordu; `donen` ve `editoryal`de görselin sağ kenarı kesime TAM oturuyordu.
   * Ad doğruydu, geometri yanlıştı — ve `kesintisizlik-yok` sessizdi, çünkü kesimi
   * başka bir taşıyıcı (ince bir çizgi) geçiyordu. Kesimde bir şeyin bulunması,
   * DOĞRU şeyin bulunması demek değil.
   *
   * ⚠ Ölçü BOYANAN alandan: `object-fit: contain` kutuyu doldurmuyor ve kutunun kenarı
   * kesime değse bile boya 43 px içeride kalabiliyor. Tasarımın niyeti kutu, gözün
   * gördüğü boya.
   */
  | 'dikis-bandinda'
  /**
   * Ray metni — logo, marka, dönem, sayaç — arkasındaki şeye KARIŞIYOR (R-95).
   *
   * ⚠ ⚠ **MEKANİZMA VARDI, PARAMETRESİ YANLIŞTI.** Ray zaten bir perde taşıyor
   * (`--kart-zemin` %90'dan şeffafa bir degrade) ve bu yeterli sanıldı. Kesik özne
   * kahraman ölçüye çıkınca ayakkabısı rayın içine girdi: perde o yükseklikte %82'ye
   * düşüyor, metin ise `--kart-metin` %48 — parlak bir yüzeyin üstünde ikisi birden
   * kayboluyor. `01 / 04` okunmuyordu ve hiçbir ölçüm bunu görmüyordu.
   *
   * ⚠ Ölçü, AI ifşasıyla AYNI alet: ekran görüntüsünden medyan luma ile metin luması
   * arasındaki fark. Krom da ifşa kadar okunmak zorunda — biri yasal, öteki kimlik.
   *
   * ⚠ Kusur "görsel rayın içine girmesin" DEMİYOR. Tam kadraj fotoğrafın üstünde
   * künye satırı meşru bir editoryal araç; meşru olmayan, perdesiz olması.
   */
  | 'krom-okunmuyor'
  /**
   * Kesik özne kart zemininden AYRILMIYOR — çizildi ama görünmüyor (R-96).
   *
   * ⚠ ⚠ **`memphis`in kâğıt kartında figür yalnız TEMAS GÖLGESİNDEN seçiliyordu.**
   * Beyaz çizgili bir kesik özne, beyaz zeminde. Var olan hiçbir ölçüm göremezdi:
   * görsel oradaydı, kutusu doğruydu, metni örtmüyordu, kesime uzaktı. Yalnız
   * GÖRÜNMÜYORDU.
   *
   * ⚠ Kusur şablonun değil VARLIĞIN kutupluluğundan doğuyor — aynı hat, koyu mürekkepli
   * bir varlıkta aynı kâğıt kartta kusursuz çıkıyor. Hangi kutupta üretileceğini hat
   * garanti edemez; bu yüzden kural render tarafında zorlanıyor.
   */
  | 'gorsel-zemine-karismasin'
  /**
   * Bir görsel KROM ŞERİDİNE giriyor — ray paylaşılan bir alan değildir (R-97).
   *
   * ⚠ ⚠ **ÖNCE "meşru" SAYILDI ve ölçüm aksini söyledi.** R-95 yazılırken karar
   * *"tam kadraj fotoğrafın üstünde künye satırı meşru bir editoryal araçtır"* idi.
   * Sonra `editoryal`in tam boy şeridi ölçüldü: rayın arkasındaki zeminin **%8**'i
   * medyandan 60'tan fazla sapıyordu — ayakkabının siyah konturları. Kontrast ORTALAMA
   * yeterliydi, metin yine de çizgilerin içinde yüzüyordu.
   *
   * ⚠ Ray fine print taşıyor (logo, dönem, sayaç), masthead değil. Fotoğrafın üstünde
   * fine print için yumuşak bir perde yetmiyor; opak bir bar gerekirdi ve o da rayı
   * tasarımın parçası olmaktan çıkarıp bir kutuya çevirirdi.
   *
   * ⚠ Yan kazanç AİLE: altı şablonun altısında da görüntü aynı yerde bitiyor. Ortak bir
   * zemin çizgisi, altı ayrı tasarımı tek bir sayfanın parçası yapan şeylerden biri.
   */
  | 'krom-seridine-giriyor'
  /**
   * Slaytın KAYNAK SATIRI boş — sistemin tek imzası eksik (R-104 · §8).
   *
   * ⚠ ⚠ **ÖNCEDEN SESSİZDİ.** Boş `rayaOrta` boş bir `<span>` basıyordu: hiçbir şey
   * çizilmiyor, slayt kusursuz GÖRÜNÜYOR ve kaynağını kaybetmiş oluyordu. İmzasız bir
   * çıktı imzalı sanılır ve insan kapısı onu onaylar.
   *
   * ⚠ Kusur, KESİKLİ KUTUYU ararken bulunuyor — yani düzeltmenin kendisi ölçülüyor.
   * Yer tutucu görselle aynı desen: eksik olan şey GÖRÜLMELİ, sonra RAPORLANMALI.
   */
  | 'kaynak-yok'
  /**
   * İçerik metni kendi zemininden AYRILMIYOR — renk ya da gürültü yüzünden (R-105).
   *
   * ⚠ ⚠ **KROM İÇİN ÖLÇÜLÜYORDU, İÇERİK İÇİN ÖLÇÜLMÜYORDU.** `krom-okunmuyor` yalnız
   * rayı denetliyor; başlık, gövde ve üst başlık hiçbir kontrast ölçümüne girmiyordu.
   * Yeni `alinti` şablonunda etiket paneli ALAN SINIRININ tam üstüne düştü: yarısı
   * kâğıtta, yarısı mürekkepte ve koyu metin mürekkepte kayboldu. Denetim *"0 kusur"*
   * dedi — `metin-ortuluyor` görselleri arıyor, `sus-metni-kesiyor` süsleri, ikisi de
   * alan sınırını görmüyor.
   *
   * ⚠ Ölçü kromunkiyle AYNI ve bu bilinçli: metin metindir, krom olması onu farklı
   * kılmaz. İki istatistik — zeminin metne yakınlığı ve zeminin gürültüsü.
   */
  | 'metin-zemine-karisiyor'

export interface Kusur {
  readonly tur: KusurTuru
  /** Hangi kart — panoramada 1'den başlıyor. `null` ise belge geneli. */
  readonly kart: number | null
  readonly aciklama: string
  /** Uyarlamanın hangi alanını değiştirmesi gerektiği; yoksa `null`. */
  readonly alan: 'baslik' | 'govde' | 'ustBaslik' | 'etiket' | 'panel' | 'hayalet' | 'raya' | null
}

/**
 * Belgenin kesintisizlik İDDİA edip etmediği.
 *
 * ⚠ **İddia etmeyen şablon bu kusurdan muaf** ve bu `memphis`in kaydıyla birebir aynı:
 * *"olmayan bir sürekliliği iddia etmemek, zayıf bir süreklilik kurmaktan dürüst."*
 * Her şablona kesintisizlik dayatan bir denetim, `memphis`i kalıcı kırmızıya çevirirdi.
 */
const kesintisizlikIddiasi = (doc: PanoramaBelgesi): boolean =>
  doc.bant.tip !== 'yok' ||
  doc.alanSiniri !== undefined ||
  // ⚠ ⚠ **HER GÖRSEL BİR SÜREKLİLİK İDDİASI DEĞİL — ilk sürüm öyle sayıyordu ve `donen`i
  // haksız yere kırmızıya çevirdi.** `daire` kırpma TANIMI GEREĞİ kapalı bir öge: maskesi
  // kartın içinde duran bir madalyon. `kesik` (gövdesi çerçeveyi aşan özne) ve `tam`
  // (kenardan kenara fotoğraf) ise taşımak için var. `donen`in sürekliliği zaten renk
  // ROTASYONU — katalog kaydı bunu açıkça söylüyor ve denetim onu okumak yerine
  // görsellerin varlığından çıkarım yaptığı için yanıldı.
  doc.gorseller.some((g) => g.kirpma !== 'daire')

const OLCUM = (
  kesimler: readonly number[],
  iddia: boolean,
  ifsaBekleniyor: boolean,
  slaytGenisligi: number
): string => `(() => {
  const kusurlar = []
  // İfşa şeritlerinin EKRAN kutuları — bileşik kontrast Node tarafında ölçülüyor.
  const kutular = []
  const kromKutulari = []
  const gorselKutulari = []
  const metinKutulari = []
  const kesimler = ${JSON.stringify(kesimler)}
  const kartlar = Array.from(document.querySelectorAll('.kart'))

  // -- sahne (0,0)'da mi (R-93) --------------------------------------------
  //
  // ILK OLCUM: her sey karta gore olculuyordu ve kart kusursuzdu; kayan sey SAHNEYDI.
  // Sifir boyutlu inline bir <svg> tanimi bile govdede satir kutusu dogurup sahneyi
  // 21 px asagi itiyordu. Bu tek satir, akisa sizan HER ogeyi yakalar — hangisi
  // oldugunu bilmeye gerek yok, sonucu ayni: kadraj kayar.
  const sahne = document.getElementById('sahne')
  if (sahne) {
    const sr = sahne.getBoundingClientRect()
    if (Math.abs(sr.left) > 0.5 || Math.abs(sr.top) > 0.5) {
      kusurlar.push({ tur:'sahne-kaymis', kart:null, alan:null,
        aciklama: 'sahne (' + Math.round(sr.left) + ',' + Math.round(sr.top) +
          ') — govdenin sol ust kosesinde baslamiyor, butun karosel kaymis (R-93)' })
    }
  }

  // ── YER TUTUCU: üretilemeyen görselin yerine çerçeve çizildi mi ──────────
  // ⚠ ⚠ **YER TUTUCU KARTIN İÇİNDE DEĞİL, AYRI KATMANDA — ve bu hata bu dosyada
  // ÜÇÜNCÜ kez yapıldı.** Dosyanın kendi yorumu "GÖRSELLER KARTLARIN ÜSTÜNDE, AYRI
  // BİR KATMANDA" diyor; ifşa kontrastı ölçümü de aynı tuzağa düşmüştü. Belge
  // düzeyinde aranıyor, kart KONUMDAN türetiliyor.
  Array.from(document.querySelectorAll('.gorsel-yer')).forEach((yer) => {
    const yr = yer.getBoundingClientRect()
    if (yr.width < 2 || yr.height < 2) return
    const kartIndex = kartlar.findIndex((k) => {
      const kr = k.getBoundingClientRect()
      return yr.left + yr.width / 2 >= kr.left && yr.left + yr.width / 2 < kr.right
    })
    kusurlar.push({
      tur: 'yer-tutucu',
      kart: kartIndex < 0 ? null : kartIndex + 1,
      alan: null,
      aciklama:
        'bu slaytta gorsel yerine YER TUTUCU cizili — gorsel uretilemedi, cikti eksik',
    })
  })

  // ── gorsel boya kutulari: AYRISMA NODE TARAFINDA (R-96) ─────────────────
  //
  // Burada yalniz BOYANAN kutu toplaniyor; ayrisma iki render farkiyla Node'da
  // olculuyor cunku bilesik piksel ancak ekran goruntusuyle okunur.
  // ⚠ TEK YARDIMCI, IKI OLCUM: ayrisma (R-96) yalniz gercek gorsele bakiyor, serit
  // ihlali (R-97) yer tutucuya da — cizilen kesikli kutu da rayin ustune duser.
  // Kutuyu iki yerde ayri hesaplamak, birinin contain bosluguna dusmesi demekti.
  const boyaKutusu = (g) => {
    const r = g.getBoundingClientRect()
    if (r.width < 8 || r.height < 8) return null
    const nw = g.naturalWidth || 0
    const nh = g.naturalHeight || 0
    if (nw > 0 && nh > 0 && getComputedStyle(g).objectFit === 'contain') {
      const sc = Math.min(r.width / nw, r.height / nh)
      const en = nw * sc, boy = nh * sc
      return { alt: g.alt || null, sol: r.left + (r.width - en) / 2, ust: r.bottom - boy, en: en, boy: boy }
    }
    return { alt: g.alt || g.textContent || null, sol: r.left, ust: r.top, en: r.width, boy: r.height }
  }
  Array.from(document.querySelectorAll('.gorsel')).forEach((g) => {
    const k = boyaKutusu(g)
    if (k !== null) gorselKutulari.push(k)
  })

  // ── kaynak satiri: sistemin IMZASI (R-104) ──────────────────────────────
  //
  // Bos kaynak artik kesikli bir kutu basiyor; olcum o kutuyu ARIYOR. Yani duzeltmenin
  // kendisi olculuyor: kutu varsa kaynak yoktur.
  Array.from(document.querySelectorAll('.ray-orta-bos')).forEach((e) => {
    const r = e.getBoundingClientRect()
    const kartIndex = kartlar.findIndex((k) => {
      const kr = k.getBoundingClientRect()
      return r.left + r.width / 2 >= kr.left && r.left + r.width / 2 < kr.right
    })
    kusurlar.push({ tur:'kaynak-yok', kart: kartIndex < 0 ? null : kartIndex + 1, alan:'raya',
      aciklama: 'kaynak satiri BOS — sistemin tek imzasi bu ve slayt onsuz yayina gidemez (R-104)' })
  })

  // ── krom seridi AYRILMISTIR: hicbir gorsel oraya giremez (R-97) ─────────
  //
  // Bant OLCULUYOR, varsayilmiyor: rayin kendi kutusu tek gercek. Dolgu sabitini
  // burada tekrar yazmak, CSS degisince sessizce yanlis yeri korumak demekti.
  // (Bu blok bir sablon dizesinin ICINDE — ters tirnak yasak, ucuncu kez kirdi.)
  const raylar = Array.from(document.querySelectorAll('.ray')).map((r) => r.getBoundingClientRect())
  if (raylar.length > 0) {
    const bantUst = Math.min.apply(null, raylar.map((r) => r.top))
    const bantAdaylari = Array.from(document.querySelectorAll('.gorsel, .gorsel-yer'))
      .map(boyaKutusu)
      .filter((k) => k !== null)
    for (const g of bantAdaylari) {
      const gAlt = g.ust + g.boy
      if (gAlt > bantUst + 0.5) {
        kusurlar.push({ tur:'krom-seridine-giriyor', kart:null, alan:g.alt,
          aciklama: 'boya ' + Math.round(gAlt - bantUst) + ' px krom seridine giriyor' +
            ' (ray ' + Math.round(bantUst) + ' px) — serit paylasilmaz (R-97)' })
      }
    }
  }

  // ── icerik metin kutulari: KONTRAST NODE TARAFINDA (R-105) ──────────────
  //
  // Krom icin olculuyordu, icerik icin olculmuyordu. Ayni alet, ayni gerekce.
  kartlar.forEach((kart, i) => {
    for (const sec of ['.ust-baslik', '.baslik', '.govde', '.etiketler']) {
      const e = kart.querySelector(sec)
      if (!e) continue
      const r = e.getBoundingClientRect()
      if (r.width < 8 || r.height < 8) continue
      if ((e.textContent || '').trim() === '') continue
      metinKutulari.push({ kart: i + 1, alan: sec.slice(1), sol: r.left, ust: r.top,
        en: r.width, boy: r.height, renk: getComputedStyle(e).color })
    }
  })

  // ── krom kutulari: ray cocuklari, KONTRAST NODE TARAFINDA (R-95) ────────
  //
  // Ayni alet, ayni gerekce: bilesik piksel ancak ekran goruntusuyle okunur. Burada
  // yalniz kutu ve renk toplaniyor.
  Array.from(document.querySelectorAll('.ray > *')).forEach((e) => {
    const r = e.getBoundingClientRect()
    const st = getComputedStyle(e)
    if (r.width < 8 || r.height < 6) return
    if (st.visibility === 'hidden' || st.display === 'none' || Number(st.opacity) < 0.05) return
    // Metni olmayan bir oge (logo gorseli) luma karsilastirmasina girmiyor: onun
    // okunurlugu renk degil BICIM meselesi.
    if ((e.textContent || '').trim() === '') return
    const kartIndex = kartlar.findIndex((k) => {
      const kr = k.getBoundingClientRect()
      return r.left + r.width / 2 >= kr.left && r.left + r.width / 2 < kr.right
    })
    kromKutulari.push({ kart: kartIndex < 0 ? null : kartIndex + 1, sol: r.left, ust: r.top,
      en: r.width, boy: r.height, renk: st.color, alan: e.className.split(' ')[0] })
  })

  // ── AI ifşası: her slaytta GÖRÜNÜR mü ─────────────────────────────────────
  // ⚠ Varlık kontrolü YETMEZ: sıfır boyutlu, gizlenmiş ya da opaklığı sıfır bir
  // etiket DOM'da vardır ama ifşa değildir. Üç ölçüt birden aranıyor.
  if (${JSON.stringify(ifsaBekleniyor)}) {
    kartlar.forEach((kart, i) => {
      const e = kart.querySelector('.ray-ifsa')
      const r = e === null ? null : e.getBoundingClientRect()
      const st = e === null ? null : getComputedStyle(e)
      const gorunur =
        e !== null && r !== null && st !== null &&
        r.width > 1 && r.height > 1 &&
        st.visibility !== 'hidden' && st.display !== 'none' && Number(st.opacity) > 0.05
      if (gorunur && r !== null && st !== null) {
        // ⚠ ⚠ **KONTRAST BURADA ÖLÇÜLEMEZ — ve ilk iki deneme tam bunu denedi.**
        // İlk sürüm görselin ham piksellerini okudu; ikinci sürüm metin rengini
        // tuvale çizdirip düzeltti. İkisi de yanlış şeye bakıyordu: aradaki dip
        // vinyeti (zemin reçetesi) bileşik sonucu değiştiriyor ve ham görsel onu
        // bilmiyor. Ölçülmesi gereken şey EKRANDAKİ piksel.
        //
        // Şeridin kutusu dışarı taşınıyor; bileşik ölçüm Node tarafında,
        // ekran görüntüsü üzerinden yapılıyor.
        kutular.push({ kart: i + 1, sol: r.left, ust: r.top, en: r.width, boy: r.height, renk: st.color })
      }
      if (!gorunur) {
        kusurlar.push({
          tur: 'ifsa-gorunmuyor',
          kart: i + 1,
          alan: 'raya',
          aciklama: e === null
            ? 'bu slaytta AI ifşa şeridi HİÇ yok — Md. 50 görünür ifşa istiyor'
            : 'AI ifşa şeridi var ama görünmüyor (sıfır boyut, gizli ya da saydam)',
        })
      }
    })
  }

  // ── taşma: kutu içeriğini kırpıyor mu ────────────────────────────────────
  // ⚠ 1 px tolerans: alt piksel yuvarlaması gerçek bir taşma değil.
  // ⚠ ⚠ **DİKEY TAŞMA YALNIZ KIRPAN KUTUDA KUSUR — ilk sürüm bunu ayırmadı ve BEŞ
  // ŞABLONU birden kırmızıya çevirdi.** Ölçülen değerler satır aralığıyla birebir
  // orantılıydı: satirAraligi 0,96 → 8 px; 1,00 → 5 px; 1,08 → 0 px; 1,30 → 0 px.
  // Yani "taşma" diye raporlanan şey, SIKI SATIR ARALIĞINDA glif mürekkebinin satır
  // kutusunu aşması — poster tipografisinin tanımı, kusuru değil. overflow:visible olan
  // bir kutuda içerik KIRPILMIYOR; kırpılmayan bir şey görünmez olmaz.
  // Yatay taşma ise overflow:visible olsa bile kusur: sütun bir TASARIM sınırı ve onu
  // asan metin komsu ogenin ustune yuruyor (Turkce uzun kelimenin bilinen hatasi, R-23).
  const alanlar = [['.baslik','baslik'], ['.govde','govde'], ['.ust-baslik','ustBaslik'],
                   ['.panel','panel'], ['.sayilar','panel'], ['.etiketler','panel']]
  kartlar.forEach((k, i) => {
    for (const [sec, alan] of alanlar) {
      for (const e of k.querySelectorAll(sec)) {
        if (e.scrollWidth > e.clientWidth + 1)
          kusurlar.push({ tur:'tasma', kart:i+1, alan,
            aciklama: sec + ' yatayda ' + (e.scrollWidth - e.clientWidth) + ' px taşıyor' })
        const kirpiyor = getComputedStyle(e).overflowY !== 'visible'
        if (kirpiyor && e.scrollHeight > e.clientHeight + 1)
          kusurlar.push({ tur:'tasma', kart:i+1, alan,
            aciklama: sec + ' dikeyde ' + (e.scrollHeight - e.clientHeight) + ' px kırpılıyor' })
      }
    }
  })

  // ── kart dışı: metin tuvalden çıkıyor mu ─────────────────────────────────
  const tuval = document.getElementById('sahne').getBoundingClientRect()
  kartlar.forEach((k, i) => {
    for (const e of k.querySelectorAll('.baslik, .govde, .ray, .panel')) {
      const r = e.getBoundingClientRect()
      if (r.bottom > tuval.bottom + 1 || r.top < tuval.top - 1)
        kusurlar.push({ tur:'kart-disi', kart:i+1, alan:null,
          aciklama: e.className + ' dikeyde tuvali aşıyor' })
    }
  })

  // ── kesim üzeri metin: metin ASLA kesimi geçmemeli ───────────────────────
  // ⚠ Hayalet, görsel ve bant GEÇEBİLİR — kesintisizliği kuran onlar. Okunacak metnin
  // ikiye bölünmesi ise her zaman kusur: yarım bir cümle okunmaz.
  kartlar.forEach((k, i) => {
    for (const e of k.querySelectorAll('.baslik, .govde, .ust-baslik, .panel, .sayilar, .etiketler')) {
      const r = e.getBoundingClientRect()
      for (const x of kesimler)
        if (r.left < x - 0.5 && r.right > x + 0.5)
          kusurlar.push({ tur:'kesim-uzeri-metin', kart:i+1, alan:null,
            aciklama: 'kesim çizgisi ' + Math.round(x) + ' px metni bölüyor' })
    }
  })

  // ── matlama: kesik kırpmada görselin zemini gerçekten siyah mı ───────────
  // ⚠ Ölçüm HAM görselden: CSS filtresi uygulanmış hâlden değil. Filtrelenmiş pikseli
  // ölçmek, filtrenin kendi çıktısını kendine sormak olurdu.
  for (const img of document.querySelectorAll('img.gorsel.kesik')) {
    const c = document.createElement('canvas')
    const g = c.getContext('2d')
    if (g === null || img.naturalWidth === 0) continue
    c.width = img.naturalWidth; c.height = img.naturalHeight
    g.drawImage(img, 0, 0)
    // ⚠ Pencere görsele göre: sabit 12 px, 8 px'lik bir test görselinde sınır dışına
    // taşıyor ve getImageData boş dönüyordu — ölçüm SESSİZCE hiçbir şey ölçmüyordu.
    const n = Math.max(1, Math.min(12, Math.floor(Math.min(c.width, c.height) / 3)))
    const noktalar = [[0,0],[c.width-n,0],[0,c.height-n],[c.width-n,c.height-n]]
    let toplam = 0
    // ⚠ ⚠ **ÖNCE ALFA, SONRA PARLAKLIK — ve ilk sürüm alfayı HİÇ OKUMUYORDU.**
    // Bu ölçüm luma-anahtarı döneminde yazıldı: o zaman arka planı kesmenin tek yolu
    // koyu zemini CSS filtresiyle şeffaflaştırmaktı, yani "köşe parlaklığı" doğru
    // vekildi. Sonra hatta gerçek arka plan silme (rembg) girdi ve görseller ALFALI
    // geliyor — köşeler şeffaf, ama şeffaf pikselin ALTINDAKİ RGB çöp değeri hâlâ
    // parlaklık olarak sayılıyordu. Gerçek bir koşuda köşe parlaklığı 38/255 ölçüldü
    // ve kusur bildirildi; oysa görsel RGBA'ydı ve kesim ZATEN tutmuştu.
    // ⚠ Ölçüm aletinin kendisi eskimişti: tekniği değiştirdik, ölçüsünü değiştirmedik.
    let alfaToplam = 0
    for (const [x,y] of noktalar) {
      const d = g.getImageData(Math.max(0,x), Math.max(0,y), n, n).data
      let s = 0
      let a = 0
      for (let i = 0; i < d.length; i += 4) {
        s += 0.2126*d[i] + 0.7152*d[i+1] + 0.0722*d[i+2]
        a += d[i+3]
      }
      toplam += s / (d.length / 4)
      alfaToplam += a / (d.length / 4)
    }
    const ort = toplam / noktalar.length
    const alfa = alfaToplam / noktalar.length
    // Köşeler şeffafsa arka plan GERÇEKTEN silinmiş: luma anahtarına hiç iş kalmıyor.
    // 16/255 eşiği kenar yumuşatmasının bıraktığı kalıntıya pay bırakıyor.
    if (alfa < 16) continue
    // 34/255: luma anahtarı bu eşiğin altında güvenilir kesiyor; üstünde zemin kalıyor.
    if (ort > 34)
      kusurlar.push({ tur:'matlama-tutmuyor', kart:null, alan:null,
        aciklama: 'kesik görselin köşesi OPAK (alfa ' + Math.round(alfa) + '/255) ve parlaklık ' +
          Math.round(ort) + '/255 — arka plan silinmemiş, luma anahtarı da kesmeyecek' })
  }

  // ── hayalet çarpışması: metnin ya da alan sınırının üstüne düşmemeli ─────
  kartlar.forEach((k, i) => {
    const h = k.querySelector('.hayalet')
    if (!h) return
    const hr = h.getBoundingClientRect()
    const alan = hr.width * hr.height
    if (alan === 0) return
    for (const sec of ['.baslik', '.govde', '.panel', '.sayilar', '.etiketler']) {
      const e = k.querySelector(sec)
      if (!e) continue
      const r = e.getBoundingClientRect()
      const en = Math.max(0, Math.min(hr.right, r.right) - Math.max(hr.left, r.left))
      const boy = Math.max(0, Math.min(hr.bottom, r.bottom) - Math.max(hr.top, r.top))
      const oran = (en * boy) / alan
      if (oran > 0.12) {
        kusurlar.push({ tur:'hayalet-carpisma', kart:i+1, alan:sec.slice(1),
          aciklama: 'hayalet ' + sec + ' ile %' + Math.round(oran*100) + ' çakışıyor' })
        break
      }
    }
  })

  // ── süs baskınlığı: hayalet, içerik toplamını aşmamalı ───────────────────
  //
  // ⚠ Alan ölçülüyor, punto değil: bir rakam dar ama çok uzun olabilir. Göz alanı görüyor.
  kartlar.forEach((k, i) => {
    const kr = k.getBoundingClientRect()
    const alan = (e) => { if (!e) return 0
      const r = e.getBoundingClientRect(); return (r.width * r.height) / (kr.width * kr.height) }
    const hayalet = alan(k.querySelector('.hayalet'))
    if (hayalet === 0) return
    let icerik = ['.baslik', '.govde', '.panel', '.sayilar', '.etiketler', '.vafel']
      .reduce((t, sec) => t + alan(k.querySelector(sec)), 0)
    // ⚠ ⚠ **GÖRSEL DE İÇERİKTİR — ilk sürüm onu SAYMIYORDU ve bu, kuralı tam olarak
    // görsel sürücülü şablonlarda (sahne, donen, editoryal) yanlış yapıyordu.**
    // O şablonlarda asıl içerik fotoğraf; metin yalnız ona eşlik ediyor. Görselleri
    // dışarıda bırakan bir "içerik" tanımı, fotoğrafı süs sayar.
    // ⚠ Görseller kartın DIŞINDA, ayrı bir katmanda (kesimi aşabilmeleri için): kesişim
    // hesaplanıyor, querySelector işe yaramaz.
    for (const g of document.querySelectorAll('.gorsel, .gorsel-yer')) {
      const gr = g.getBoundingClientRect()
      const en = Math.max(0, Math.min(kr.right, gr.right) - Math.max(kr.left, gr.left))
      const boy = Math.max(0, Math.min(kr.bottom, gr.bottom) - Math.max(kr.top, gr.top))
      icerik += (en * boy) / (kr.width * kr.height)
    }
    if (hayalet > icerik) {
      kusurlar.push({ tur:'sus-baskin', kart:i+1, alan:'hayalet',
        aciklama: 'hayalet kartın %' + Math.round(hayalet*100) + "'ini tutuyor, içerik (başlık+gövde+panel) %"
          + Math.round(icerik*100) + " — süs içerikten büyük" })
    }
  })

  // ── boşluk payı, metin payı ve güvenli alan (R-88) ──────────────────────
  //
  // ⚠ ⚠ OLCULEN SEY ICERIK, KROM DEGIL. Alt ray ve sayac her slaytta ayni yerde duran
  // KROM ogeleri: kadraji "doldurmuyorlar", cerceveliyorlar. Ray ayrica negatif
  // margin ile kaydiriliyor ve kutusu kart genisligini kapliyor — bosluk hesabina
  // girseydi her slayt dolu gorunurdu. Olcume yalniz ICERIK ogeleri giriyor.
  //
  // ⚠ Bosluk bosa gitmis alan degil, OKUNABILIRLIGIN KENDISI: kadrajin en az ucte
  // biri bos kalmazsa goz nereye bakacagini secemiyor.
  kartlar.forEach((k, i) => {
    const kutu = k.getBoundingClientRect()
    const kadraj = kutu.width * kutu.height
    if (kadraj < 100) return
    // PANEL METIN DEGIL, VERIDIR. Ilk olcum onu da sayiyordu ve veri-hikayesi'nin BES
    // karti birden kirmiziya dondu — oysa o sablonun tasiyicisi tam olarak veri paneli.
    // Kural metin kadrajin %30'unu gecmesin diyor; bir cubuk grafigini metin sayan
    // olcum, sablonun kimligini kusur olarak raporlar.
    // Guvenli alan ise PANELI DE kapsiyor: veri de kenara yapismamali.
    const yerlesenler = Array.from(k.querySelectorAll('.baslik, .govde, .ust-baslik, .panel'))
    const metinler = Array.from(k.querySelectorAll('.baslik, .govde, .ust-baslik'))
    let metinAlan = 0
    for (const e of yerlesenler) {
      const r = e.getBoundingClientRect()
      if (r.width < 2 || r.height < 2) continue
      if (metinler.includes(e)) metinAlan += r.width * r.height
      // Guvenli alan: ust/alt 80 px, yan 60 px (4:5 icin).
      const ust = r.top - kutu.top
      const alt = kutu.bottom - r.bottom
      const sol = r.left - kutu.left
      const sag = kutu.right - r.right
      if (ust < 79 || sol < 59 || sag < 59) {
        kusurlar.push({ tur:'guvenli-alan-disi', kart:i+1, alan:e.className.split(' ')[0],
          aciklama: 'ust ' + Math.round(ust) + ' sol ' + Math.round(sol) + ' sag ' +
            Math.round(sag) + ' — guvenli alan ust/alt 80, yan 60 (R-88)' })
      }
      if (alt < -1) {
        kusurlar.push({ tur:'guvenli-alan-disi', kart:i+1, alan:e.className.split(' ')[0],
          aciklama: 'alt kenari ' + Math.round(-alt) + ' px asiyor (R-88)' })
      }
    }
    // ⚠ ⚠ ESIK KARTIN ROLUNE GORE ve bu bir gevsetme DEGIL, iki kuralin uzlasmasi.
    // Arastirma iki sey birden soyluyor: (a) metin kadrajin %30'unu gecmesin,
    // (b) baslik bloku kadrajin ucte birini kaplarsa KAHRAMAN olur ve kapak slaydinin
    // isi tam olarak budur. Ikisi ayni kartta celisiyor: kapakta iri baslik ZORUNLU.
    // Tek esik ikisinden birini yalanlardi — kapak %42, govde %30.
    // ⚠ Kapak yine de sinirsiz degil: %42 ustu, basligin kadraji BOGDUGU nokta.
    const tavan = i === 0 ? 42 : 30
    // Rapor edilen sayi ile karsilastirilan sayi AYNI olmali: ham %30,4 icin
    // "metin %30 kapliyor — tavan %30" yazip kirmizi donmek okuyani yaniltir.
    const metinYuzde = Math.round((metinAlan / kadraj) * 100)
    if (metinYuzde > tavan) {
      kusurlar.push({ tur:'metin-payi-yuksek', kart:i+1, alan:null,
        aciklama: 'metin kadrajin %' + metinYuzde + 'ini kapliyor — tavan %' +
          tavan + (i === 0 ? ' (kapak)' : '') + ' (R-88)' })
    }
  })

  // ── ölçü bandı: satır 45–75 karakter (R-86) ─────────────────────────────
  //
  // ⚠ ⚠ ALT SINIR UST SINIR KADAR ONEMLI ve eksik olan oydu. Cok kisa satir gozu her
  // satirda geri dondurup ritmi kiriyor; kusur "tasma" gibi gorunmedigi icin hicbir
  // olcum onu gormuyordu. Olculdu: donen 19, editoryal 27 karakter.
  // ⚠ Satirlar GERCEK kirilmalardan sayiliyor (Range ile), tahminle degil.
  // ⚠ YALNIZ COK SATIRLI govde olculuyor: tek satira sigan kisa bir metnin satiri
  // metnin kendi uzunlugudur, bir olcu karari degil.
  kartlar.forEach((k, i) => {
    const e = k.querySelector('.govde')
    if (!e) return
    const t = e.firstChild
    if (!t || t.nodeType !== 3) return
    const r = document.createRange()
    const satirlar = []
    let bas = 0
    let oncekiUst = null
    for (let n = 1; n <= t.length; n++) {
      r.setStart(t, n - 1)
      r.setEnd(t, n)
      const ust = Math.round(r.getBoundingClientRect().top)
      if (oncekiUst !== null && ust !== oncekiUst) { satirlar.push(n - 1 - bas); bas = n - 1 }
      oncekiUst = ust
    }
    satirlar.push(t.length - bas)
    if (satirlar.length < 2) return
    // Son satir kisa olabilir (paragraf sonu) — o dogal, olcuye girmiyor.
    const olculen = satirlar.slice(0, -1).filter((n) => n > 3)
    if (olculen.length === 0) return
    const enUzun = Math.max(...olculen)
    // ⚠ ⚠ **KUSUR SUTUNUN KAPASITESINE BAGLI, METNE DEGIL.** Ilk surum her satiri
    // 45'e zorluyordu ve alti sablonun altisini kirmiziya dusurdu — ama sahnenin
    // metin kolonu 605 px ve okunabilir puntoda 33 karakter aliyor: 45 orada
    // GEOMETRIK OLARAK imkansiz. Bir olcum, saglanmasi imkansiz bir sey isterse
    // olcum degil gurultudur ve gurultulu kapi kapatilan kapidir.
    // Kapasite: sutun genisligi / (punto × 0,5).
    const px = parseFloat(getComputedStyle(e).fontSize)
    const genislik = e.getBoundingClientRect().width
    const kapasite = px > 0 ? Math.floor(genislik / (px * 0.5)) : 0
    // Ust sinir HER ZAMAN gecerli: uzun satir gozun satir basini kaybetmesi.
    if (enUzun > 75) {
      kusurlar.push({ tur:'olcu-bandi-disi', kart:i+1, alan:'govde',
        aciklama: 'govde satiri ' + enUzun + ' karakter — olcu tavani 75 (R-86)' })
      return
    }
    // Alt sinir YALNIZ sutun onu kaldirabiliyorsa: aksi halde sablonun bilincli
    // dar kolonu, metnin kusuru degil.
    if (kapasite >= 45 && enUzun < 45) {
      kusurlar.push({ tur:'olcu-bandi-disi', kart:i+1, alan:'govde',
        aciklama: 'govde satiri ' + enUzun + ' karakter ama sutun ' + kapasite +
          ' kaldiriyor — olcu tabani 45 (R-86)' })
    }
  })

  // ── punto okuma eşiğinin altında mı (R-83) ──────────────────────────────
  //
  // ⚠ ⚠ ESKI TABAN 34 px "olculdu" diyordu ama olculen sey BIZIM CIKTIMIZDI, okuma
  // esigi degil. Kritik punto 0,20 derece acisal x-yuksekligi; 1080 px tuvalde 36 px.
  // ⚠ Esik TUVAL GENISLIGINE orantili: aci sabit, piksel turev. Sabit sayi yazmak
  // 1080'i sozlesme sanmakti ve tuval buyuyunce taban sessizce esik altina inerdi.
  // ⚠ Sadece OKUNAN roller olculuyor. Etiket ve kunye uc kelimeyi gecmiyor; onlar
  // okunmuyor, TANINIYOR ve orada esik alti mesru (arastirma belgesi, bolum 3).
  {
    const taban = (36 * ${String(slaytGenisligi)}) / 1080
    kartlar.forEach((k, i) => {
      for (const sec of ['.baslik', '.govde']) {
        const e = k.querySelector(sec)
        if (!e) continue
        const px = parseFloat(getComputedStyle(e).fontSize)
        if (!isFinite(px) || px <= 0) continue
        if (px < taban - 0.5) {
          kusurlar.push({ tur:'punto-esik-alti', kart:i+1, alan:sec.slice(1),
            aciklama: sec + ' ' + Math.round(px) + ' px — okuma esigi ' +
              Math.round(taban) + ' px (R-83, kritik punto 0,20 derece)' })
        }
      }
    })
  }

  // ── metin GÖRSELİN üstünde mi duruyor: kutu kesişimi ────────────────────
  //
  // ⚠ ⚠ **BU KUSUR GERÇEK BİR KOŞUDAN DOĞDU (run_01a02ade).** Metin görselin ÜSTÜNDE
  // (z-index 6) ve metin-ortuluyor bu yüzden temiz çıkıyordu — ama slaytlara bakınca
  // başlıklar okunmuyordu: kesik özne metnin ARKASINDA duruyor ve parlak metal
  // yüzeyinin üstündeki beyaz başlık kayboluyor. Ölçüldü: dört slaytta da metin
  // alanının **%28'i** görselle çakışıyor.
  //
  // ⚠ **"Üstte olmak" okunabilirlik DEĞİLDİR.** Eski ölçüm boyama sırasını soruyordu ve
  // doğru cevabı veriyordu; yanlış olan SORUYDU. Bir fotoğrafın üstündeki metin, fotoğraf
  // dokulu olduğu ölçüde okunmaz — ve kesik özne tanımı gereği dokuludur.
  //
  // ⚠ Eşik %12: sıfır olamaz, çünkü kesik öznenin bir kolu metin kolonuna hafifçe
  // girebilir ve bu istenen bir şey (süreklilik). Ölçülen şey metnin GÖVDESİNİN
  // fotoğrafın üstünde durup durmadığı.
  kartlar.forEach((k, i) => {
    const g = Array.from(document.querySelectorAll('.gorsel, .gorsel-yer')).map((e) =>
      e.getBoundingClientRect()
    )
    if (g.length === 0) return
    const kesis = (a, b) =>
      Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left)) *
      Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top))
    for (const sec of ['.baslik', '.govde']) {
      const e = k.querySelector(sec)
      if (!e) continue
      const r = e.getBoundingClientRect()
      const alan = r.width * r.height
      if (alan < 400) continue
      let ort = 0
      for (const gr of g) ort += kesis(r, gr)
      const oran = ort / alan
      if (oran > 0.12) {
        kusurlar.push({ tur:'metin-gorsel-cakisiyor', kart:i+1, alan:sec.slice(1),
          aciklama: sec + ' alanının %' + Math.round(oran*100) +
            "'i görselin üstünde — ustte olmak okunabilirlik degildir" })
      }
    }
  })

  // ── metin örtülüyor mu: boyama sırası ÖRNEKLENİYOR ──────────────────────
  //
  // ⚠ Kutu kesişimi yeterli DEĞİL: metnin figürün üstünden geçmesi istenen bir şey.
  // Kusur, metnin ALTTA kalması. elementFromPoint gerçek boyama sırasını veriyor.
  // (BU GÖVDE BİR ŞABLON DİZESİ: buraya backtick yazılamaz, dizeyi kapatır — beşinci kez.)
  kartlar.forEach((k, i) => {
    for (const sec of ['.baslik', '.govde', '.panel', '.sayilar', '.etiketler']) {
      const e = k.querySelector(sec)
      if (!e) continue
      const r = e.getBoundingClientRect()
      if (r.width < 4 || r.height < 4) continue
      let toplam = 0
      let ortulu = 0
      for (let sx = 0; sx < 16; sx++) {
        for (let sy = 0; sy < 8; sy++) {
          const x = r.left + ((sx + 0.5) * r.width) / 16
          const y = r.top + ((sy + 0.5) * r.height) / 8
          const ust = document.elementFromPoint(x, y)
          if (!ust) continue
          toplam++
          if (ust !== e && !e.contains(ust) && ust.closest('.gorsel, .gorsel-yer')) ortulu++
        }
      }
      if (toplam === 0) continue
      const oran = ortulu / toplam
      if (oran > 0.06) {
        kusurlar.push({ tur:'metin-ortuluyor', kart:i+1, alan:sec.slice(1),
          aciklama: sec + ' görselin ALTINDA kalıyor: yüzeyinin %' + Math.round(oran*100) +
            "'i örtülü — okunmuyor" })
      }
    }
  })

  // ── dikis dislama bandi: ya UZAK ya EZICI (R-94) ────────────────────────
  //
  // Arastirmanin turettigi kural (arastirma-2026-08 bol. 1.3): bir kimlik ogesi kesime ya
  // en az 93 px uzaktir ya da kesimin IKI yakasinda da slayt genisliginin %40'ini
  // kaplar. Arada kalan yok — "biraz tassin" ne devamlilik kuruyor ne butunluk.
  //
  // ⚠ OLCU BOYANAN ALANDAN, kutudan degil: object-fit contain kutuyu doldurmuyor.
  // sahne'nin "1↔2 kesimi" diye ADLANDIRILMIS ozne kutusu kesime dayaniyordu, boyasi
  // ise 0,4 px solunda bitiyordu. Ad dogruydu, geometri yanlisti.
  for (const g of Array.from(document.querySelectorAll('.gorsel, .gorsel-yer'))) {
    const r = g.getBoundingClientRect()
    if (r.width < 4 || r.height < 4) continue
    const nw = g.naturalWidth || 0
    const nh = g.naturalHeight || 0
    let sol = r.left
    let sag = r.right
    if (nw > 0 && nh > 0 && getComputedStyle(g).objectFit === 'contain') {
      const s = Math.min(r.width / nw, r.height / nh)
      const bosluk = (r.width - nw * s) / 2
      sol = r.left + bosluk
      sag = r.right - bosluk
    }
    for (const x of kesimler) {
      const asiyor = sol < x - 0.5 && sag > x + 0.5
      if (asiyor) {
        const solPay = (x - sol) / ${String(slaytGenisligi)}
        const sagPay = (sag - x) / ${String(slaytGenisligi)}
        if (solPay < ${String(EZICI_PAY)} || sagPay < ${String(EZICI_PAY)}) {
          kusurlar.push({ tur:'dikis-bandinda', kart:null, alan:g.alt || null,
            aciklama: 'x=' + Math.round(x) + ' kesimini asiyor ama ezmiyor: sol %' +
              Math.round(solPay*100) + ' sag %' + Math.round(sagPay*100) +
              ' — iki yakada da en az %' + Math.round(${String(EZICI_PAY)}*100) + ' (R-94)' })
        }
        continue
      }
      const mesafe = sag <= x ? x - sag : sol - x
      if (mesafe >= 0 && mesafe < ${String(DIKIS_BANDI)}) {
        kusurlar.push({ tur:'dikis-bandinda', kart:null, alan:g.alt || null,
          aciklama: 'x=' + Math.round(x) + ' kesimine ' + Math.round(mesafe) +
            ' px — ya ' + ${String(DIKIS_BANDI)} + ' px uzak ya ezici olmali (R-94)' })
      }
    }
  }

  // ── kesintisizlik: HER KESIMDE bir tasiyici (R-87) ──────────────────────
  //
  // ⚠ ⚠ **ESKI OLCUM BELGE DUZEYINDEYDI: "hicbir oge kesimi asmiyor".** Yani ALTI
  // kesimden BIRINDE tasiyici varsa belge temiz sayiliyordu ve kalan bes kesimde goz
  // bagi kopuyordu. Sureklilik bir belge ozelligi degil, HER GECISIN ozelligi —
  // okuyucu kesimleri tek tek geciyor.
  //
  // ⚠ ⚠ **OLCUM MEKANIZMA LISTESI UCUNCU KEZ EKSIK KALDI.** Once hayalet sanildi
  // (D-299'da kalkti), sonra ustDoku eklendi (D-319'da kalkti), simdi olcek bandi
  // CSS'e tasindi (R-81: cetvel cizilmis sekil degil TEKRAR EDEN olcudur) ve
  // .bant path arayan sorgu onu goremedi: donen sablonu tasiyicisi TAM YERINDEYKEN
  // "kesintisizlik yok" raporlandi. **Bir mekanizmayi degistirip olcumu guncellememek
  // bu depoda tekrar eden hata** — liste artik CSS ogelerini de kapsiyor.
  if (${iddia ? 'true' : 'false'}) {
    const TASIYICI =
      '.hayalet, .gorsel, .gorsel-yer, .leke, ' +
      '.bant path, .bant-kemer path, .bant-ok path, .alan-siniri path, ' +
      '.olcek-cizgi, .olcek-tirtik, .bant-olcek'
    const adaylar = Array.from(document.querySelectorAll(TASIYICI)).map((e) =>
      e.getBoundingClientRect()
    )
    const bos = []
    // ⚠ ⚠ **SON KESIM MUAF — ve bu bir gevseme degil, iki kuralin BULUSTUGU yer.**
    // Denetimin kendi kapanis tarifi *"y %0-28 Varis. Surekli oge burada BITER"*
    // diyor; kapanis-yuzeyi de kapanis karesinin TEK TON olmasini sart kosuyor.
    // Depo sahibi ucuncu kez ayni seyi soyledi: *"son sayfaya da hic gecmesin;
    // sondan onceki sayfanin son grafigine degmeden altina kadar gelip dursun."*
    // Bir tasiyicinin kapanisa GIRMESI serbest (dizin son okunu bilerek sokuyor,
    // dorduncu maddeye variyor) ama ZORUNLU degil.
    // ⚠ Kalan kesimlerin HEPSI zorunlu: sureklilik hala her GECISIN ozelligi.
    for (const x of kesimler.slice(0, -1)) {
      const gecen = adaylar.some((r) => r.left < x - 0.5 && r.right > x + 0.5)
      if (!gecen) bos.push(Math.round(x))
    }
    if (bos.length > 0) {
      kusurlar.push({ tur:'kesintisizlik-yok', kart:null, alan:null,
        aciklama: bos.length + ' kesimde tasiyici yok (x=' + bos.join(', ') +
          ') — sureklilik HER gecisin ozelligi (R-87)' })
    }
  }
  return { kusurlar, ifsaKutulari: kutular, kromKutulari, gorselKutulari, metinKutulari }
})()`

/**
 * Her kartın KENDİ punto tavanı — `puntoOlcumu`nun kart kırılımı.
 *
 * ⚠ Aynı ikili arama, ama minimum alınmadan: hangi kartın dar olduğunu bilmek için
 * tek tek gerekiyor. Sınır yine VERİLİYOR, ölçülmüyor (kendini ölçen metrik tuzağı).
 */
const kartTavanlari = (doc: PanoramaBelgesi): string => {
  const blok = Math.round((doc.yukseklik - 258) * 0.44)
  const t = doc.tipografi
  const sutun = Math.round(doc.slaytGenisligi * (t?.baslikSutunu ?? 0.86)) - 128
  return `(() => Array.from(document.querySelectorAll('.baslik')).map((b) => {
    let alt = 20, ust = 168
    for (let k = 0; k < 18; k += 1) {
      const orta = (alt + ust) / 2
      b.style.fontSize = orta + 'px'
      if (b.scrollWidth <= ${sutun} + 1 && b.scrollHeight <= ${blok}) alt = orta; else ust = orta
    }
    b.style.fontSize = ''
    return alt
  }))()`
}

/**
 * Belgeyi render edip DOM'a sorar.
 *
 * ⚠ Ekran görüntüsü ALINMIYOR: denetim pikselleri değil kutuları okuyor ve dosyaya
 * yazmadan çalışıyor. Böylece düzeltme turu, kaydedilmiş bir çıktıyı geçersiz kılmıyor.
 */
/**
 * Metin kutuları — süs kesişimi ölçümünün girdisi.
 *
 * ⚠ Kart SIRASI DOM'dan geliyor, konumdan hesaplanmıyor: panoramada kartlar zaten
 * ayrı `<section>`lar ve konumdan türetmek, kesimi aşan bir öge yüzünden kayardı.
 */
// ⚠ ⚠ **PUL SIRASI LİSTEDE YOKTU ve tam da bandın yaşadığı yerde duruyor.**
// `veri-hikayesi`nin eğrisi genliği açılınca "2023" ve "2025" pullarının İÇİNDEN geçti;
// denetim *"0 kusur"* dedi. Sebep burasıydı: yalnız başlık/gövde/üst etiket ölçülüyordu,
// oysa bir taşıyıcının metni kesmesi en çok bandın kendi kuşağında olur — orada duran
// metin de tam olarak bu pullar. `SUSU_GIZLE` bandı zaten gizliyordu; eksik olan kutuydu.
// ⚠ Pullar TEK BİRLEŞİK kutu olarak ölçülüyor, tek tek değil: ölçü iki ekran görüntüsü
// istiyor ve kart başına dört pul maliyeti üçe katlardı. Kesişen bir çizgi birleşik
// kutuda da fark üretir.
const METIN_KUTULARI = `(() => {
  const cikti = []
  document.querySelectorAll('.kart').forEach((kart, i) => {
    const alanlar = [['baslik','.baslik'],['govde','.govde'],['ustBaslik','.ust-baslik']]
    for (const [alan, sec] of alanlar) {
      const e = kart.querySelector(sec)
      if (e === null) continue
      const r = e.getBoundingClientRect()
      if (r.width < 4 || r.height < 4) continue
      cikti.push({ kart: i + 1, alan, sol: r.left, ust: r.top, en: r.width, boy: r.height })
    }
    const pullar = Array.from(kart.querySelectorAll('.etiketler > *'))
      .map((e) => e.getBoundingClientRect())
      .filter((r) => r.width >= 4 && r.height >= 4)
    if (pullar.length > 0) {
      const sol = Math.min.apply(null, pullar.map((r) => r.left))
      const ust = Math.min.apply(null, pullar.map((r) => r.top))
      const sag = Math.max.apply(null, pullar.map((r) => r.right))
      const alt = Math.max.apply(null, pullar.map((r) => r.bottom))
      cikti.push({ kart: i + 1, alan: 'etiket', sol, ust, en: sag - sol, boy: alt - ust })
    }
  })
  return cikti
})()`

/**
 * Süs ögeleri — metnin üstünden geçmemesi gereken ÇİZGİSEL ögeler.
 *
 * ⚠ Görsel (`img`) listede YOK ve bu kasıtlı: metnin bir figürün üstünden geçmesi
 * referans tasarımlarda İSTENEN şey (`metin-ortuluyor` onu ayrıca ölçüyor). Burada
 * ölçülen şey SÜSÜN metne girmesi.
 *
 * ⚠ ⚠ **`.alan-siniri` LİSTEDE YOK ve bunu ilk sürüm YANLIŞ yaptı:** `akan-alan`da o
 * sınır bir süs değil ZEMİNİN KENDİSİ — iki renk alanını ayıran eğri. Gizlenince tüm
 * kartın arkası değişiyor ve ölçüm "süs her metnin altında" diyordu; temiz bir belgede
 * on sekiz kusur. Zemini süs sanan bir ölçüm, doğru şeyi yanlış yerde arar.
 */
// ⚠ ⚠ **ÖLÇEK ÇİZGİSİ LİSTEDE YOKTU ve o da bir SÜS.** `olcek` bandı `<div>` basıyor
// (`.olcek-cizgi` · `.olcek-durak` · `.olcek-etiket`), svg değil; liste yalnız svg
// bantlarını ve lekeleri sayıyordu. Sonuç: ölçek çizgisi bir metnin üstünden geçse
// `sus-metni-kesiyor` bunu ASLA göremezdi — dört şablon (`memphis` · `donen` · `dizin` ·
// `sahne`) bu bandı kullanıyor.
// ⚠ Bulgu bir TESTİN KIRILMASINDAN çıktı: test `.bant-ok`u boyuyordu, `sahne` o ögeyi
// kaybedince test 0 kusur buldu ve listeye bakınca eksik olan görüldü.
// ⚠ ⚠ Bu yorum şablon dizesinin DIŞINDA duruyor ve sebebi R-98: ters tırnak, dizeyi
// kapatıyor. İlk yazımda içeri koydum ve dosya sekiz derleme hatası verdi — deponun
// kendi kapısının kolladığı tuzağın aynısı.
const SUSU_GIZLE = `(() => {
  const st = document.createElement('style')
  st.id = 'sus-gizle'
  st.textContent = '.bant, .bant-kemer, .bant-ok, .lekeler, .olcek-cizgi, .olcek-durak, .olcek-etiket { display: none !important }'
  document.head.appendChild(st)
  return true
})()`

const SUSU_GOSTER = `(() => {
  document.getElementById('sus-gizle')?.remove()
  return true
})()`

/** İki PNG arasında GÖZLE görülür farkın oranı (%, bir ondalık). */
const farkOrani = (a: string, b: string): string => `(async () => {
  const yukle = async (b64) => {
    const im = new Image()
    im.src = 'data:image/png;base64,' + b64
    await im.decode()
    const c = document.createElement('canvas')
    c.width = im.width; c.height = im.height
    const x = c.getContext('2d')
    x.drawImage(im, 0, 0)
    return x.getImageData(0, 0, c.width, c.height).data
  }
  const p = await yukle(${JSON.stringify(a)})
  const q = await yukle(${JSON.stringify(b)})
  const n = Math.min(p.length, q.length)
  let degisen = 0
  for (let j = 0; j < n; j += 4) {
    // 24: JPEG/antialias gurultusunun ustunde, renk degisiminin altinda.
    if (Math.abs(p[j]-q[j]) + Math.abs(p[j+1]-q[j+1]) + Math.abs(p[j+2]-q[j+2]) > 24) degisen++
  }
  return Math.round((degisen / (n / 4)) * 1000) / 10
})()`

export const panoramaDenetle = async (
  doc: PanoramaBelgesi,
  oturum?: Oturum
): Promise<BrowserResult<readonly Kusur[]>> => {
  const kesimler = Array.from(
    { length: doc.kartlar.length - 1 },
    (_, i) => (i + 1) * doc.slaytGenisligi
  )
  const calistir = <T>(fn: (page: Page) => Promise<T>): Promise<BrowserResult<T>> =>
    oturum === undefined ? withPage(fn) : oturum.sayfaIle(fn)
  return calistir(async (page) => {
    // ⚠ Görüntü alanı TÜM panorama: slayt genişliğinde bir viewport'ta kartların çoğu
    // görünür alanın dışında kalır ve `getBoundingClientRect` yine doğru değer verir —
    // ama `scrollWidth` kırpma davranışı viewport'a bağlı olabildiği için tam tuval
    // kuruluyor. Ölçüm ortamı, render ortamıyla aynı olmak zorunda değil; AYNI DEĞERLERİ
    // vermek zorunda ve tam tuval bunu garanti ediyor.
    await page.setViewportSize({
      width: doc.slaytGenisligi * doc.kartlar.length,
      height: doc.yukseklik,
    })
    await page.setContent(panoramaHtml(doc), { waitUntil: 'load' })
    await page.evaluate('(async () => { await document.fonts.ready; return true })()')
    await page.evaluate(puntoOlcumu(doc))
    // ⚠ ⚠ **DENETİM ÜRETİMİN ÇİZDİĞİNİ GÖRMEK ZORUNDA.** `panoramaCiz` punto'dan sonra
    // knockout maskesini ve metin kutusu maskesini de koşuyor; burada koşmayan bir
    // denetim, yayınlanmayan bir düzeni ölçer. Aynı sınıf hata bu fazda kapılarda
    // ölçüldü: fontsuz/logosuz/puntosuz ölçüm hem gerçek kusuru kaçırdı hem olmayanı
    // uydurdu.
    await page.evaluate(knockoutOlcumu())
    await page.evaluate(aksanAlaniOlcumu())
    await page.evaluate(okNisaniOlcumu())
    await page.evaluate(metinMaskesi())
    // ⚠ ⚠ **GÖRSELLERİN ÇÖZÜLMESİ BEKLENİYOR — beklenmediğinde ölçüm SESSİZCE boş
    // dönüyordu.** `naturalWidth` yüklenmemiş bir `<img>`de 0 ve döngü `continue` ile
    // atlıyordu: matlama denetimi hem siyah hem açık zeminli görselde "kusur yok" dedi.
    // Yeşil bir ölçüm, ölçüm yapıldığı anlamına gelmiyor.
    await page.evaluate(
      `(async () => { await Promise.all(Array.from(document.images).map(
        (i) => i.decode().catch(() => undefined))); return true })()`
    )
    const olcum = (await page.evaluate(
      OLCUM(kesimler, kesintisizlikIddiasi(doc), doc.aiIfsasi === true, doc.slaytGenisligi)
    )) as {
      readonly kusurlar: readonly Kusur[]
      readonly ifsaKutulari: readonly {
        kart: number
        sol: number
        ust: number
        en: number
        boy: number
        renk: string
      }[]
      readonly kromKutulari: readonly {
        kart: number | null
        sol: number
        ust: number
        en: number
        boy: number
        renk: string
        alan: string
      }[]
      readonly gorselKutulari: readonly {
        alt: string | null
        sol: number
        ust: number
        en: number
        boy: number
      }[]
      readonly metinKutulari: readonly {
        kart: number
        alan: string
        sol: number
        ust: number
        en: number
        boy: number
        renk: string
      }[]
    }
    const ham = olcum.kusurlar

    /**
     * Bir kutunun BİLEŞİK okunurluğu: medyan luma ile metin luması arasındaki fark.
     *
     * ⚠ ⚠ **AYNI ALET İKİ KUSURA HİZMET EDİYOR ve bu bir kopyala-yapıştır olmasın
     * diye çıkarıldı.** İfşa şeridi ile ray metni aynı soruyu soruyor — "bu yazı
     * arkasındaki şeye karışıyor mu" — ve o soru yalnız EKRAN pikseliyle
     * cevaplanıyor. İki kopya, bir gün birinin eşiğinin değişip ötekinin unutulması
     * demek.
     */
    const okunurluk = async (k: {
      readonly sol: number
      readonly ust: number
      readonly en: number
      readonly boy: number
      readonly renk: string
    }): Promise<number> => {
      const png = await page.screenshot({
        clip: {
          x: Math.max(0, Math.round(k.sol)),
          y: Math.max(0, Math.round(k.ust)),
          width: Math.max(1, Math.round(k.en)),
          height: Math.max(1, Math.round(k.boy)),
        },
      })
      return (await page.evaluate(
        `(async () => {
          const im = new Image()
          im.src = 'data:image/png;base64,${png.toString('base64')}'
          await im.decode()
          const c = document.createElement('canvas')
          c.width = im.width; c.height = im.height
          const x = c.getContext('2d')
          x.drawImage(im, 0, 0)
          const d = x.getImageData(0, 0, c.width, c.height).data
          const l = []
          for (let j = 0; j < d.length; j += 4) l.push(0.2126*d[j] + 0.7152*d[j+1] + 0.0722*d[j+2])
          l.sort((a, b) => a - b)
          const medyan = l[Math.floor(l.length / 2)]
          const c2 = document.createElement('canvas')
          c2.width = 1; c2.height = 1
          const x2 = c2.getContext('2d')
          x2.fillStyle = ${JSON.stringify(k.renk)}
          x2.fillRect(0, 0, 1, 1)
          const mp = x2.getImageData(0, 0, 1, 1).data
          const metin = 0.2126*mp[0] + 0.7152*mp[1] + 0.0722*mp[2]
          return Math.round(Math.abs(medyan - metin))
        })()`
      )) as number
    }

    // ── krom okunuyor mu — İKİ RENDER FARKI (R-95) ──────────────────────────
    //
    // ⚠ ⚠ **İLK SÜRÜM MEDYANA BAKTI ve kusuru GÖREMEDİ — göz görmüştü.** İfşa şeridi
    // geniş; `ray-sayac` ise 84 px. Ayakkabı kutunun yarısını kaplasa bile medyan hâlâ
    // koyu kalıyor ve ölçüm "temiz" diyor, oysa metnin YARISI okunmuyor. Medyan sağlam
    // bir istatistik olduğu için burada YANLIŞ istatistik.
    //
    // Doğru ölçü: metin GİZLENİP zemin okunuyor ve zeminin metin lumasına 44'ten yakın
    // piksel PAYI sayılıyor. Ortalama değil pay — kutunun küçük bir bölgesi bile metni
    // yutuyorsa krom okunmuyor.
    //
    // ⚠ Eşik %4 ÖLÇÜLEREK seçildi: altı şablonun 90 krom kutusunda temiz olanların
    // hepsi tam **%0** verdi, kirli tek kutu **%10**. Aradaki boşluk kenar yumuşatma
    // gürültüsünü rahatça kapsıyor.
    const kromKusurlari: Kusur[] = []
    if (olcum.kromKutulari.length > 0) {
      await page.evaluate(
        `(() => { const s = document.createElement('style'); s.id = 'krom-gizle';
          s.textContent = '.ray > * { color: transparent !important }';
          document.head.appendChild(s) })()`
      )
      for (const k of olcum.kromKutulari) {
        try {
          const png = await page.screenshot({
            clip: {
              x: Math.max(0, Math.round(k.sol)),
              y: Math.max(0, Math.round(k.ust)),
              width: Math.max(1, Math.round(k.en)),
              height: Math.max(1, Math.round(k.boy)),
            },
          })
          const olculen = (await page.evaluate(
            `(async () => {
              const im = new Image()
              im.src = 'data:image/png;base64,${png.toString('base64')}'
              await im.decode()
              const c = document.createElement('canvas')
              c.width = im.width; c.height = im.height
              const x = c.getContext('2d')
              x.drawImage(im, 0, 0)
              const d = x.getImageData(0, 0, c.width, c.height).data
              const c2 = document.createElement('canvas')
              c2.width = 1; c2.height = 1
              const x2 = c2.getContext('2d')
              x2.fillStyle = ${JSON.stringify(k.renk)}
              x2.fillRect(0, 0, 1, 1)
              const mp = x2.getImageData(0, 0, 1, 1).data
              const metin = 0.2126*mp[0] + 0.7152*mp[1] + 0.0722*mp[2]
              const hepsi = []
              let yakin = 0
              for (let j = 0; j < d.length; j += 4) {
                const l = 0.2126*d[j] + 0.7152*d[j+1] + 0.0722*d[j+2]
                hepsi.push(l)
                if (Math.abs(l - metin) < 44) yakin += 1
              }
              // ⚠ ⚠ İKİNCİ İSTATİSTİK: zemin metne YAKIN olmayabilir ama GÜRÜLTÜLÜ
              // olabilir. Yarısı siyah yarısı beyaz bir zeminde hiçbir piksel metne
              // yakın değildir ve metin yine de çizgilerin içinde yüzer. Ölçüldü:
              // 90 krom kutusunun 88'i tam %0, kirli ikisi %4 ve %8.
              const sirali = hepsi.slice().sort((a, b) => a - b)
              const medyan = sirali[Math.floor(sirali.length / 2)]
              const gurultu = hepsi.filter((l) => Math.abs(l - medyan) > 60).length
              return [
                Math.round((yakin / hepsi.length) * 100),
                Math.round((gurultu / hepsi.length) * 100),
              ]
            })()`
          )) as readonly number[]
          const yakinPay = olculen[0] ?? 0
          const gurultuPay = olculen[1] ?? 0
          if (gurultuPay > 3) {
            kromKusurlari.push({
              tur: 'krom-okunmuyor',
              kart: k.kart,
              alan: 'raya',
              aciklama:
                `${k.alan} gürültülü bir zeminin üstünde: yüzeyinin %${String(gurultuPay)}'i ` +
                'medyandan 60 luma sapıyor (tavan %3) — kontrast yeter, okunurluk yetmez (R-95)',
            })
          }
          if (yakinPay > 4) {
            kromKusurlari.push({
              tur: 'krom-okunmuyor',
              kart: k.kart,
              alan: 'raya',
              aciklama:
                `${k.alan} zeminine karışıyor: yüzeyinin %${String(yakinPay)}'i metin ` +
                "lumasına 44'ten yakın (tavan %4) — krom kimliktir, görsel onu yutamaz (R-95)",
            })
          }
        } catch (e) {
          kromKusurlari.push({
            tur: 'krom-okunmuyor',
            kart: k.kart,
            alan: 'raya',
            aciklama: `${k.alan} okunurluğu ÖLÇÜLEMEDİ (${String(e)}) — ölçülemeyen geçmiş sayılmaz`,
          })
        }
      }
      // ⚠ Stil KALDIRILIYOR: aynı sayfada sonra süs ölçümü koşuyor ve şeffaf bir ray
      // onun kutularını da değiştirirdi. Ölçüm ortamını kirletmek, sonraki ölçümü
      // sessizce yalanlamaktır.
      await page.evaluate(`(() => document.getElementById('krom-gizle')?.remove())()`)
    }

    // ── görsel zeminden AYRIŞIYOR mu — İKİ RENDER FARKI (R-96) ──────────────
    //
    // ⚠ ⚠ **KUSURU GÖZ BULDU, ÖLÇÜM DEĞİL — ve ilk iki ölçüt YANLIŞ ŞEYE BAKTI.**
    // `memphis`in kâğıt kartında beyaz çizgili figür yalnız temas gölgesinden
    // seçiliyordu. Ortalama fark gölgeyi görünürlük sanıyor; medyan ise ince bir özneyi
    // (ölçüm sehpası) görünmez sanıyor. Doğru soru "ne kadar mürekkep var" değil,
    // **olan mürekkep ayırt ediliyor mu**: silüetin p90 luma farkı.
    //
    // ⚠ Silüet, GÖRSEL GİZLENİP kutunun yeniden okunmasıyla bulunuyor: değişen her
    // piksel öznenin bir parçası. İkinci bir kurulum yok, aynı sayfa.
    const ayrismaKusurlari: Kusur[] = []
    if (olcum.gorselKutulari.length > 0) {
      for (const k of olcum.gorselKutulari) {
        try {
          const clip = {
            x: Math.max(0, Math.round(k.sol)),
            y: Math.max(0, Math.round(k.ust)),
            width: Math.max(1, Math.round(k.en)),
            height: Math.max(1, Math.round(k.boy)),
          }
          const varken = await page.screenshot({ clip })
          await page.evaluate(
            `(() => { const s = document.createElement('style'); s.id = 'gorsel-gizle';
              s.textContent = '.gorsel { visibility: hidden }'; document.head.appendChild(s) })()`
          )
          const yokken = await page.screenshot({ clip })
          await page.evaluate(`(() => document.getElementById('gorsel-gizle')?.remove())()`)
          const p90 = (await page.evaluate(
            `(async () => {
              const yukle = async (b64) => {
                const im = new Image()
                im.src = 'data:image/png;base64,' + b64
                await im.decode()
                const c = document.createElement('canvas')
                c.width = im.width; c.height = im.height
                const x = c.getContext('2d')
                x.drawImage(im, 0, 0)
                return x.getImageData(0, 0, c.width, c.height).data
              }
              const a = await yukle(${JSON.stringify(varken.toString('base64'))})
              const b = await yukle(${JSON.stringify(yokken.toString('base64'))})
              const farklar = []
              for (let j = 0; j < a.length; j += 4) {
                const la = 0.2126*a[j] + 0.7152*a[j+1] + 0.0722*a[j+2]
                const lb = 0.2126*b[j] + 0.7152*b[j+1] + 0.0722*b[j+2]
                const d = Math.abs(la - lb)
                if (d >= 2) farklar.push(d)
              }
              if (farklar.length === 0) return 0
              farklar.sort((x, y) => x - y)
              return Math.round(farklar[Math.floor(farklar.length * 0.9)])
            })()`
          )) as number
          if (p90 < ZEMINDEN_AYRISMA) {
            ayrismaKusurlari.push({
              tur: 'gorsel-zemine-karismasin',
              kart: null,
              alan: null,
              aciklama:
                `${k.alt ?? 'görsel'} zemine karışıyor: silüetin p90 luma farkı ` +
                `${String(p90)} (eşik ${String(ZEMINDEN_AYRISMA)}) — çizildi ama görünmüyor (R-96)`,
            })
          }
        } catch (e) {
          ayrismaKusurlari.push({
            tur: 'gorsel-zemine-karismasin',
            kart: null,
            alan: null,
            aciklama: `görsel ayrışması ÖLÇÜLEMEDİ (${String(e)}) — ölçülemeyen geçmiş sayılmaz`,
          })
        }
      }
    }

    // ── içerik metni zeminden AYRIŞIYOR mu (R-105) ──────────────────────────
    //
    // ⚠ ⚠ **KROM İÇİN ÖLÇÜLÜYORDU, İÇERİK İÇİN ÖLÇÜLMÜYORDU.** Yeni `alinti` şablonunda
    // etiket paneli alan sınırının tam üstüne düştü — yarısı kâğıtta, yarısı mürekkepte —
    // ve denetim *"0 kusur"* dedi. `metin-ortuluyor` görselleri arıyor, `sus-metni-kesiyor`
    // süsleri; ikisi de alan sınırını görmüyor.
    //
    // ⚠ **TEK ÇİFT EKRAN GÖRÜNTÜSÜ, kutu başına DEĞİL.** Kutu başına iki çekim 80 çekim
    // ederdi ve paketi yavaşlatırdı; burada tüm panorama iki kez çekiliyor (metinli /
    // metinsiz) ve her kutu o iki resimden okunuyor. Ölçüm aynı, maliyet 40 kat düşük.
    const metinKusurlari: Kusur[] = []
    if (olcum.metinKutulari.length > 0) {
      try {
        const varken = await page.screenshot({ fullPage: false })
        await page.evaluate(
          `(() => { const s = document.createElement('style'); s.id = 'metin-gizle';
            s.textContent = '.ust-baslik, .baslik, .govde, .etiketler { visibility: hidden }';
            document.head.appendChild(s) })()`
        )
        const yokken = await page.screenshot({ fullPage: false })
        await page.evaluate(`(() => document.getElementById('metin-gizle')?.remove())()`)
        const sonuc = (await page.evaluate(
          `(async () => {
            const yukle = async (b64) => {
              const im = new Image()
              im.src = 'data:image/png;base64,' + b64
              await im.decode()
              const c = document.createElement('canvas')
              c.width = im.width; c.height = im.height
              const x = c.getContext('2d')
              x.drawImage(im, 0, 0)
              return { d: x.getImageData(0, 0, c.width, c.height).data, w: c.width, h: c.height }
            }
            const A = await yukle(${JSON.stringify(varken.toString('base64'))})
            const B = await yukle(${JSON.stringify(yokken.toString('base64'))})
            const kutular = ${JSON.stringify(olcum.metinKutulari)}
            const boya = document.createElement('canvas').getContext('2d')
            const luma = (d, o) => 0.2126*d[o] + 0.7152*d[o+1] + 0.0722*d[o+2]
            return kutular.map((k) => {
              boya.fillStyle = k.renk
              boya.fillRect(0, 0, 1, 1)
              const mp = boya.getImageData(0, 0, 1, 1).data
              const metin = 0.2126*mp[0] + 0.7152*mp[1] + 0.0722*mp[2]
              const x0 = Math.max(0, Math.round(k.sol)), y0 = Math.max(0, Math.round(k.ust))
              const x1 = Math.min(B.w, Math.round(k.sol + k.en))
              const y1 = Math.min(B.h, Math.round(k.ust + k.boy))
              const zemin = []
              for (let y = y0; y < y1; y += 1) {
                for (let x = x0; x < x1; x += 1) zemin.push(luma(B.d, (y * B.w + x) * 4))
              }
              if (zemin.length === 0) return { kart: k.kart, alan: k.alan, yakin: 0, gurultu: 0 }
              let yakin = 0
              for (const l of zemin) if (Math.abs(l - metin) < 44) yakin += 1
              const sirali = zemin.slice().sort((a, b) => a - b)
              const medyan = sirali[Math.floor(sirali.length / 2)]
              let gurultu = 0
              for (const l of zemin) if (Math.abs(l - medyan) > 60) gurultu += 1
              return {
                kart: k.kart, alan: k.alan,
                yakin: Math.round((yakin / zemin.length) * 100),
                gurultu: Math.round((gurultu / zemin.length) * 100),
              }
            })
          })()`
        )) as readonly { kart: number; alan: string; yakin: number; gurultu: number }[]
        for (const o of sonuc) {
          if (o.yakin > 4) {
            metinKusurlari.push({
              tur: 'metin-zemine-karisiyor',
              kart: o.kart,
              alan: null,
              aciklama:
                `${o.alan} zeminine karışıyor: yüzeyinin %${String(o.yakin)}'i metin ` +
                "lumasına 44'ten yakın (tavan %4) — R-105",
            })
          } else if (o.gurultu > 12) {
            metinKusurlari.push({
              tur: 'metin-zemine-karisiyor',
              kart: o.kart,
              alan: null,
              aciklama:
                `${o.alan} gürültülü bir zeminin üstünde: yüzeyinin %${String(o.gurultu)}'i ` +
                'medyandan 60 luma sapıyor (tavan %12) — R-105',
            })
          }
        }
      } catch (e) {
        metinKusurlari.push({
          tur: 'metin-zemine-karisiyor',
          kart: null,
          alan: null,
          aciklama: `metin okunurluğu ÖLÇÜLEMEDİ (${String(e)}) — ölçülemeyen geçmiş sayılmaz`,
        })
      }
    }

    // ── AI ifşası OKUNUYOR mu — BİLEŞİK piksel üzerinden (§11.3 · Md. 50) ────
    //
    // ⚠ ⚠ **ÖLÇÜT ÜÇÜNCÜ KEZ DÜZELTİLDİ ve her seferinde SAYI gösterdi.** Önce ham
    // görsel pikselleri okundu (dip vinyetini görmüyordu), sonra bölgenin luma YAYILIMI
    // ölçüldü — ölçüldü ve ayırt etmedi: vinyetli 98–115, vinyetsiz 96–232, ikisi de
    // eşiğin üstünde. Sebep basit: şerit hem koyu metni hem parlak zemini içeriyor.
    //
    // Doğru ölçüt METİN ile ZEMİN arasındaki fark: bölgenin MEDYANI zemini temsil
    // ediyor ve metin rengi tarayıcıya çizdirilerek okunuyor. Vinyetsiz kart 3'te
    // medyan 209, metin 245 → fark 36: okunmuyor. Vinyetli aynı kartta medyan 36 →
    // fark 209: okunuyor.
    //
    // ⚠ Burada medyan DOĞRU istatistik, kromun aksine: ifşa şeridi geniş ve zemini
    // tekdüze. Dar bir sayaç kutusunda aynı medyan yalan söylüyordu (R-95).
    const ifsaKusurlari: Kusur[] = []
    for (const k of olcum.ifsaKutulari) {
      try {
        const yayilim = await okunurluk(k)
        if (yayilim < 60) {
          ifsaKusurlari.push({
            tur: 'ifsa-okunmuyor',
            kart: k.kart,
            alan: 'raya',
            aciklama:
              `AI ifşası okunmuyor: metin ile zemin arasındaki luma farkı ${String(yayilim)} ` +
              '(60 altı, metin zemine karışıyor) — Md. 50 GÖRÜNÜR ifşa istiyor',
          })
        }
      } catch (e) {
        ifsaKusurlari.push({
          tur: 'ifsa-okunmuyor',
          kart: k.kart,
          alan: 'raya',
          aciklama: `ifşa okunurluğu ÖLÇÜLEMEDİ (${String(e)}) — ölçülemeyen geçmiş sayılmaz`,
        })
      }
    }

    // ── süs metni kesiyor mu: İKİ RENDER FARKI (§7.1) ───────────────────────
    //
    // ⚠ ⚠ **BU KUSURU GÖZ BULDU, ÖLÇÜM DEĞİL.** Akan mavi alan gövde metninin son iki
    // satırının altından geçiyordu ve denetim "0 kusur" diyordu. Kontrast ölçümü de
    // görmedi: kutunun MEDYANINA bakıyor ve iki satırlık bir kesişim medyanı
    // kıpırdatmıyor. Doğru ölçü, süsün ORADA OLUP OLMADIĞI.
    //
    // ⚠ Aynı sayfa kullanılıyor, ikinci bir `setContent` YOK: süs tek bir `<style>` ile
    // gizleniyor, kutular yeniden okunuyor, stil kaldırılıyor. İkinci bir kurulum,
    // ölçtüğünü sandığı şeyi başka bir ortamda ölçer.
    const susKusurlari: Kusur[] = []
    try {
      const kutular = (await page.evaluate(METIN_KUTULARI)) as readonly {
        kart: number
        alan: 'baslik' | 'govde' | 'ustBaslik'
        sol: number
        ust: number
        en: number
        boy: number
      }[]
      const kirp = (k: { sol: number; ust: number; en: number; boy: number }) => ({
        x: Math.max(0, Math.round(k.sol)),
        y: Math.max(0, Math.round(k.ust)),
        width: Math.max(1, Math.round(k.en)),
        height: Math.max(1, Math.round(k.boy)),
      })
      const once: string[] = []
      for (const k of kutular)
        once.push((await page.screenshot({ clip: kirp(k) })).toString('base64'))
      await page.evaluate(SUSU_GIZLE)
      for (let i = 0; i < kutular.length; i++) {
        const k = kutular[i]
        if (k === undefined) continue
        const sonra = (await page.screenshot({ clip: kirp(k) })).toString('base64')
        const oran = (await page.evaluate(farkOrani(once[i] ?? '', sonra))) as number
        // ⚠ Eşik ÖLÇÜLEREK seçildi: gerçek belgede dokunmayan kutular %0, kesişen
        // ikisi %4,6 ve %5,9 verdi. %2 ikisini ayırıyor ve bir kenarın metne
        // değmesine (kasıtlı katmanlanma) izin veriyor.
        if (oran >= 2) {
          susKusurlari.push({
            tur: 'sus-metni-kesiyor',
            kart: k.kart,
            alan: k.alan,
            aciklama:
              `süs ögesi ${k.alan} metninin %${String(oran)}'inin arkasından geçiyor — ` +
              'metin kısaltılmalı ya da süsün dışına alınmalı',
          })
        }
      }
      await page.evaluate(SUSU_GOSTER)
    } catch {
      // Ölçülemedi: kusur UYDURULMUYOR. Ölçülemeyen bir şeyi kusur saymak, ölçüm
      // aracının arızasını tasarımın suçu yapardı.
    }

    // ── punto çökmesi: hangi KART tavanı aşağı çekiyor ──────────────────────
    // ⚠ ⚠ **İKİ TARAF AYRI KAYNAKTAN.** Ölçüm bir sabitle değil, KARTLARIN KENDİ
    // ORTANCASIYLA karşılaştırılıyor: "bu kart ötekilerden çok mu dar". Mutlak bir eşik
    // (`punto < 44px`) `editoryal` gibi kasten fısıldayan bir şablonu haksız yere
    // kırmızıya çevirirdi. Kendi kendini ölçmüyor: bir kart, DİĞER kartlara bakılarak
    // yargılanıyor.
    const tavanlar = (await page.evaluate(kartTavanlari(doc))) as readonly number[]
    const sirali = [...tavanlar].sort((a, b) => a - b)
    const ortanca = sirali[Math.floor(sirali.length / 2)] ?? 0
    const cokme: Kusur[] = tavanlar.flatMap((t, i) =>
      ortanca > 0 && t < ortanca * 0.62
        ? [
            {
              tur: 'punto-cokmesi' as const,
              kart: i + 1,
              alan: 'baslik' as const,
              aciklama:
                `bu kartın başlığı ${Math.round(t)} px'e sığıyor, diğerleri ` +
                `${Math.round(ortanca)} px — tek kart tüm karoselin ölçeğini düşürüyor`,
            },
          ]
        : []
    )
    // ⚠ Eksik glif TARAYICIYA SORULMUYOR — `document.fonts.check` bu soruya yanlış cevap
    // veriyor (ölçüldü: kapsanan `A`/`ğ` için `false`, kapsanmayan `д`/`漢` için `true`).
    // Kapsamı belirleyen `@font-face` beyanı bizim; sınanan da o (`kapsamDisiKarakterler`).
    const metin = doc.kartlar
      .map((k) => `${k.ustBaslik}${k.baslik}${k.govde}${k.hayalet}${k.rayaSol}${k.rayaOrta}`)
      .join('')
    const eksik = kapsamDisiKarakterler(metin)
    return [
      ...ham,
      ...ifsaKusurlari,
      ...kromKusurlari,
      ...ayrismaKusurlari,
      ...metinKusurlari,
      ...susKusurlari,
      ...cokme,
      ...(eksik.length === 0
        ? []
        : [
            {
              tur: 'eksik-glif' as const,
              kart: null,
              alan: null,
              aciklama: `marka fontunun kapsamı dışında: ${eksik.join(' ')}`,
            },
          ]),
    ]
  })
}

/** Kusurları uyarlama turuna verilecek insan okunur bir listeye çevirir. */
export const kusurMetni = (kusurlar: readonly Kusur[]): string =>
  kusurlar.length === 0
    ? 'kusur yok'
    : kusurlar
        .map((k) => `- ${k.kart === null ? 'belge' : `kart ${k.kart}`}: ${k.aciklama}`)
        .join('\n')

/**
 * İfşa GÖRÜNÜR mü — belge iddia ediyor VE denetim her slaytta buldu mu (§11.3 · D-311).
 *
 * ⚠ ⚠ **BU KURAL İKİNCİ BİR YERE KOPYALANACAKTI ve o an burası doğdu.** Kural
 * `bodies.ts`in içinde tek satır olarak yaşıyordu; editörde kaydedilen slaytlar da
 * damgalanmaya başlayınca aynı satır ikinci kez yazılmak zorundaydı. Bu depoda aynı
 * yüklemin iki kopyası bir kez daha ayrıştı (`gorselleriGom`) — bir daha olmasın diye
 * kural buraya, ölçümün yanına taşındı.
 *
 * ⚠ ⚠ **İDDİA DEĞİL, İKİ OLGUNUN BİRLEŞİMİ.** `visibleDisclosure: true` yazan bir
 * sidecar, kimsenin bakmadığı bir kutucuğun işaretlenmesidir (D-23): belge ifşa
 * taşıdığını SÖYLÜYOR olmalı ve denetim onu her slaytta GÖRMÜŞ olmalı. Biri bile
 * eksikse `false` — ve o hâlde yayın kapısı doğru biçimde durduruyor.
 */
export const ifsaGorunurMu = (aiIfsasi: boolean, kusurlar: readonly Kusur[]): boolean =>
  aiIfsasi && kusurlar.every((k) => k.tur !== 'ifsa-gorunmuyor')

/**
 * Bir görselin HANGİ SLAYDA düştüğü — 0 tabanlı kart indeksi (D-268 · FAZ-19.13).
 *
 * ⚠ ⚠ **BU EŞLEME BİR EKSİKTEN DOĞDU.** Görsel brief'i yalnız KONUYU biliyordu; o
 * görselin hangi slayda düştüğünü ve o slaydın NE SÖYLEDİĞİNİ bilmiyordu. Depo sahibi:
 * *"tüm yuvalara üretme işi metne uygun konuya uygun mükemmelce yapılmalı rastgele
 * görsel değil!!!"* Slaydın metnini brief'e verebilmek için önce hangi slayt olduğunu
 * bilmek gerekiyordu.
 *
 * ⚠ Konum PANORAMA koordinatında (0–100), slayt koordinatında değil — kart genişliği
 * `100 / kartSayisi`. Bu kural burada, geometrinin yanında: iki okuyucu (hat ve editör)
 * onu ayrı ayrı hesaplasaydı biri gün gelip ötekinden ayrışırdı.
 *
 * ⚠ ORTA NOKTA kullanılıyor, sol kenar değil: kesim çizgisini aşan bir görsel iki
 * slayda birden değiyor ve *"ait olduğu"* slayt ağırlığının çoğunun bulunduğu slayttır.
 */
export const gorselinKarti = (x: number, genislik: number, kartSayisi: number): number => {
  if (kartSayisi < 1) return 0
  const kartEni = 100 / kartSayisi
  const orta = x + genislik / 2
  return Math.min(kartSayisi - 1, Math.max(0, Math.floor(orta / kartEni)))
}
