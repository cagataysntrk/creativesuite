// Bir koşunun İÇERİĞİ — onaylamadan önce NEYİ onayladığını görmek için (FAZ-17.2).
//
// ⚠ ⚠ **BU EKRAN BİR ÖLÇÜMDEN DOĞDU.** Panel kullanıldı ve sayıldı: onay kuyruğunda
// satıra tıklamak hiçbir şey yapmıyordu, ekranda `img` sayısı SIFIRdı ve üretilen
// metin hiçbir yerde görünmüyordu. İnsan `run_01a0160e · metin-onayi` satırına bakıp
// "onayla" diyecekti — neyi onayladığını görmeden. Bir kapı, kararın dayanağını
// göstermiyorsa kapı değil bir gecikmedir.

import type React from 'react'
import { useCallback, useEffect, useState } from 'react'
import { GonderiKutusu } from './GonderiKutusu.js'
import { YayinOnizleme } from './YayinOnizleme.js'

interface Icerik {
  readonly runId: string
  readonly pipeline: string
  readonly createdAt: string
  readonly bekleyenKapi: string | null
  /** Onay şeridi: hattın kapıları SIRAYLA ve her birinin durumu. */
  readonly kapilar: readonly {
    readonly ad: string
    readonly durum: 'onaylandi' | 'reddedildi' | 'bekliyor' | 'sirada'
    readonly at: string | null
    readonly not: string | null
  }[]
  /** Hangi adımda durdu — `null` = durmadı. */
  readonly duraklananAdim: string | null
  readonly satirlar: readonly string[]
  /** Metin insan tarafından düzenlendi mi — ekranda görünür bir OLGU. */
  readonly metinElleDuzenlendi?: boolean
  readonly sablonId: string | null
  readonly ritimHedefi: string | null
  readonly ritimTuttu: boolean | null
  readonly kusurlar: readonly { readonly tur?: string; readonly aciklama?: string }[]
  readonly varliklar: readonly { readonly digest: string; readonly bytes: number }[]
  /** Editörde elle düzenlenip koşu dizinine yazılmış slaytlar (D-301). */
  readonly elleSlaytlar: readonly string[]
  /** Panelden yüklenmiş görseller — hat bunları üretim YERİNE kullanır. */
  readonly yuklenenGorseller: readonly string[]
  readonly adimlar: readonly {
    readonly id: string
    readonly verb: string
    readonly durum: string | null
    readonly saglayici: string | null
    readonly basladi: string | null
    readonly bitti: string | null
    readonly saniye: number | null
    readonly maliyetMikros: string
  }[]
  /**
   * Yayın saati ÖNERİSİ — ölçümden gelir ya da hiç gelmez (§11 · R-46 · FAZ-17.3).
   *
   * ⚠ `veri-yok` bir hata değil, DÜRÜST bir cevap: etkileşim ölçümü olmadan saat
   * önermek, kaynaksız bir sayısal iddia olurdu (Yasa 8).
   */
  readonly yayinSaatiOnerisi:
    | {
        readonly tur: 'oneri'
        readonly saat: number
        readonly gerekce: string
        readonly ornek: number
      }
    | { readonly tur: 'veri-yok'; readonly sebep: string; readonly ornek: number }
    | null
  /** İnsanın SEÇTİĞİ yayın anı — seçilmediyse `null` ve yayın durur. */
  readonly yayinAni: {
    readonly an: string
    readonly secen: string
    readonly secilenAt: string
    readonly oneri: string
  } | null
  readonly konu: string | null
  readonly konuGerekcesi: string | null
  readonly durum: 'kapida' | 'calisiyor' | 'durdu' | 'bitti' | 'baslatilamadi'
  readonly toplamAdim: number
  readonly bitenAdim: number
  readonly baslatilamadi: {
    readonly komut?: string
    readonly code?: number | null
    readonly stderr?: string
    readonly stdout?: string
    /** `true` = adım kaydı var, yani süreç başlamıştı; bu kayıt GEÇMİŞ bir deneme. */
    readonly gecmis?: boolean
  } | null
}

/** Durum → okunur etiket. Renk TEK BAŞINA anlam taşımaz (§12.6): glyph + metin. */
const DURUM_ETIKET: Record<Icerik['durum'], string> = {
  kapida: '⏸ insan kapısında',
  calisiyor: '● çalışıyor',
  durdu: '✗ durdu',
  bitti: '✓ bitti',
  baslatilamadi: '✗ başlatılamadı',
}

const EDITOR = 'http://localhost:4321'

export const KosuDetay = ({
  runId,
  geri,
}: {
  readonly runId: string
  readonly geri: () => void
}): React.JSX.Element => {
  const [d, setD] = useState<Icerik | null>(null)
  const [hata, setHata] = useState<string | null>(null)
  const [gerekce, setGerekce] = useState<string | null>(null)
  const [mesaj, setMesaj] = useState<string | null>(null)
  const [yukleme, setYukleme] = useState<string | null>(null)
  // ⚠ ⚠ **ADIM DEFTERİ "NE OLDU"YU SÖYLÜYOR, GÜNLÜK "NE OLUYOR"U.** Manifest ancak bir
  // adım bitince yazılıyor; 190 saniyelik bir yargı adımının ortasında ekranda hiçbir
  // hareket yoktu ve insan "asıldı mı" diye bakıyordu.
  const [gunluk, setGunluk] = useState<readonly string[]>([])
  // ⚠ ⚠ **ONAY BİR EVET/HAYIR DEĞİL, BİR DÜZELTME ANIDIR.** İnsan bir kelimeyi
  // değiştirmek için koşuyu reddedip baştan üretmek zorunda kalıyordu: bir model
  // çağrısı, üç dakika ve büyük ihtimalle BAŞKA bir metin.
  // `null` = düzenleme açılmadı; dizi = düzenleniyor.
  const [taslak, setTaslak] = useState<readonly string[] | null>(null)
  /** Saat kutusundaki değer — boşken kaydedilemez, çünkü boş bir an bir seçim değildir. */
  const [yayinAniTaslak, setYayinAniTaslak] = useState<string>('')

  /**
   * Görseli yükler — **yuva sırası dosya adından değil, mevcut yüklü sayıdan** türüyor.
   *
   * ⚠ Base64 gövde: `multipart` ayrıştırıcısı ikinci bir çözücü demekti ve bu depoda
   * "tek çözücü" bir kural (§3.8). Tarayıcı `FileReader` ile zaten base64 veriyor.
   */
  /**
   * Düzenlenen metni defterin adım çıktısına yazar; istenirse ardından ONAYLAR.
   *
   * ⚠ Adım çıktısı defteri tekrar oynatmanın da kaynağı: düzenleme oraya yazılınca
   * `sablon-uyarla` ve sonrası düzenlenmiş metni görüyor — ayrı bir yol yok.
   */
  const metniKaydet = async (onayla: boolean): Promise<void> => {
    if (taslak === null) return
    setMesaj('… metin kaydediliyor')
    const r = await fetch(`/api/kosu/${runId}/metin`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ satirlar: taslak }),
    })
    const j = (await r.json()) as { ok: boolean; hata?: string; degisti?: boolean }
    if (!j.ok) {
      setMesaj(`✗ ${j.hata ?? 'kaydedilemedi'}`)
      return
    }
    setTaslak(null)
    setMesaj(j.degisti === false ? 'değişiklik yok' : '✓ metin kaydedildi')
    await yukle()
    if (onayla) await karar('approved', 'metin elle düzenlendi ve onaylandı')
  }

  const gorselYukle = async (dosya: File | null): Promise<void> => {
    if (dosya === null) return
    setYukleme('… yükleniyor')
    const base64 = await new Promise<string>((coz) => {
      const fr = new FileReader()
      fr.onload = () => coz(String(fr.result ?? ''))
      fr.readAsDataURL(dosya)
    })
    const r = await fetch(`/api/kosu/${runId}/gorsel`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ sira: (d?.yuklenenGorseller ?? []).length + 1, base64 }),
    })
    const j = (await r.json()) as { ok: boolean; ad?: string; hata?: string }
    setYukleme(j.ok ? `✓ yüklendi: ${j.ad ?? ''}` : `✗ ${j.hata ?? 'yüklenemedi'}`)
    await yukle()
  }

  const yukle = useCallback(async (): Promise<void> => {
    const r = await fetch(`/api/kosu/${runId}/icerik`)
    if (!r.ok) {
      setHata(`içerik okunamadı (${r.status})`)
      return
    }
    // ⚠ ⚠ **HATA HİÇ SİLİNMİYORDU.** Bir kez 404 alan ekran, sonraki her başarılı
    // tazelemede de kırmızı kalıyordu: koşu ilerliyor, adımlar geçiyor, ekran hâlâ
    // *"içerik okunamadı"* diyor. Bir hata mesajı, kendisini doğuran durum geçtiğinde
    // kalkmıyorsa bir bilgi değil bir gürültüdür.
    setHata(null)
    setD((await r.json()) as Icerik)
    try {
      const g = (await (await fetch(`/api/kosu/${runId}/gunluk`)).json()) as {
        satirlar?: string[]
      }
      setGunluk(g.satirlar ?? [])
    } catch {
      // Günlük okunamıyorsa ekran yine çalışır: eksik olan şey CANLI iz, durum değil.
    }
  }, [runId])

  useEffect(() => {
    void yukle()
    // ⚠ ⚠ **EKRAN KENDİNİ TAZELİYOR.** Hat sürdükten sonra adımlar ilerliyor ama ekran
    // donmuş kalıyordu: kullanıcı "bir şey olmadı" görüyordu. Beş saniye, bir adımın
    // bitmesinden kısa ve tarayıcıyı yormayacak kadar uzun.
    const t = setInterval(() => void yukle(), 5000)
    return () => clearInterval(t)
  }, [yukle])

  /**
   * Seçilen yayın anını deftere yazar (§11 · R-46 · FAZ-17.3).
   *
   * ⚠ ⚠ **BU DÜĞME OLMADAN YAYIN HİÇ OLMUYOR.** `PUBLISH` gövdesi koşu defterinde
   * insanın seçtiği anı arıyor ve yoksa duruyor — panelde seçme yolu olmasaydı
   * kapı, kimsenin geçemediği bir duvar olurdu.
   * ⚠ Ekranda duran ÖNERİ de kayda giriyor: "insan neyi görerek seçti" sorusunun
   * cevabı sonradan üretilemez.
   */
  const yayinAniniKaydet = useCallback(async (): Promise<void> => {
    if (yayinAniTaslak === '') {
      setMesaj('✗ önce bir an seç — boş bir an bir seçim değildir')
      return
    }
    const o = d?.yayinSaatiOnerisi
    const oneriMetni =
      o == null ? '' : o.tur === 'oneri' ? `${String(o.saat)}:00 · ${o.gerekce}` : o.sebep
    const r = await fetch(`/api/kosu/${runId}/yayin-ani`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ an: yayinAniTaslak, oneri: oneriMetni }),
    })
    const j = (await r.json()) as { ok?: boolean; hata?: string }
    setMesaj(
      j.ok === true ? '✓ yayın anı seçildi ve deftere yazıldı' : `✗ ${j.hata ?? 'yazılamadı'}`
    )
    void yukle()
  }, [d, runId, yayinAniTaslak, yukle])

  const karar = useCallback(
    async (k: 'approved' | 'rejected', not: string): Promise<void> => {
      if (d?.bekleyenKapi == null) return
      const r = await fetch(`/api/kuyruk/${runId}/${d.bekleyenKapi}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ karar: k, gerekce: not }),
      })
      const j = (await r.json()) as { ok?: boolean; hata?: string }
      if (j.ok !== true) {
        setMesaj(`✗ ${j.hata ?? 'karar yazılamadı'}`)
        return
      }
      setGerekce(null)
      // ⚠ ⚠ **ONAY, HATTI SÜRDÜRÜR.** İlk sürüm yalnız kararı deftere yazıyordu ve
      // orada bitiyordu: düğmeler yerinde kalıyor, hiçbir şey değişmiyordu ve
      // kullanıcı onayladığını sanıp bekliyordu. Bir onay düğmesi, onayın SONUCUNU
      // doğurmuyorsa düğme değil bir yanılsamadır.
      // ⚠ RET sürdürmez: reddedilen bir kapıdan devam etmek reddi anlamsız kılardı.
      if (k === 'approved') {
        setMesaj('✓ onaylandı — hat sürdürülüyor…')
        const s2 = await fetch(`/api/kosu/${runId}/surdur`, { method: 'POST' })
        const j2 = (await s2.json()) as { ok?: boolean; hata?: string }
        setMesaj(
          j2.ok === true
            ? '✓ onaylandı, hat sürüyor — bu ekran kendini tazeliyor'
            : `✓ karar yazıldı ama sürdürülemedi: ${j2.hata ?? 'bilinmeyen'}`
        )
      } else {
        setMesaj('✓ reddedildi — gerekçe sonraki denemeye negatif kısıt olarak girecek')
      }
      void yukle()
    },
    [d, runId, yukle]
  )

  // ⚠ Kapı karar ALDI mı: `kapilar` listesi kararlardan türüyor ve onay yazılır
  // yazılmaz `onaylandi` oluyor — `bekleyenKapi` ise hat manifesti yeniden yazana
  // kadar bayat kalıyor. Hangi kapıda olduğumuzu birinciden, karar verilip
  // verilmediğini İKİNCİDEN soruyoruz.
  const karariVerilmis =
    d !== null &&
    d.bekleyenKapi !== null &&
    (d.kapilar ?? []).some((k) => k.ad === d.bekleyenKapi && k.durum !== 'bekliyor')

  if (hata !== null) return <p className="giris-not">{hata}</p>
  if (d === null) return <p className="giris-not">yükleniyor…</p>

  return (
    <div className="kosu-detay">
      <button type="button" className="geri-don" onClick={geri}>
        ← kuyruğa dön
      </button>
      <h2>
        {d.pipeline} · <code>{d.runId.slice(0, 16)}</code>
      </h2>
      {/* ⚠ ⚠ **BAŞLATTIKTAN SONRA DURUM GÖRÜNMÜYORDU.** Ekran metni ve slaytları
          gösteriyordu ama hattın nerede olduğunu değil: kullanıcı "bir şey oluyor mu"
          diye bekliyordu. Çubuk ilerlemeyi, etiket ne beklendiğini söylüyor. */}
      <p className={`kosu-durum kosu-durum-${d.durum}`}>
        <strong>{DURUM_ETIKET[d.durum]}</strong>
        {d.toplamAdim === 0 ? null : (
          <>
            {' '}
            · {d.bitenAdim}/{d.toplamAdim} adım
            <span className="ilerleme">
              <span
                className="ilerleme-dolu"
                style={{ width: `${String(Math.round((d.bitenAdim / d.toplamAdim) * 100))}%` }}
              />
            </span>
          </>
        )}
      </p>

      {d.konu === null ? null : (
        <p className="giris-not">
          konu: <strong>{d.konu}</strong>
          {d.konuGerekcesi === null || d.konuGerekcesi === '' ? null : (
            <> — hat şu gerekçeyle seçti: {d.konuGerekcesi}</>
          )}
        </p>
      )}

      {d.baslatilamadi === null ? null : (
        <div className="kapi-kutusu">
          <strong>
            {d.baslatilamadi.gecmis === true
              ? '✗ önceki bir başlatma denemesi başarısız olmuştu'
              : '✗ süreç hiç başlamadı.'}
          </strong>
          <p className="giris-not">
            <code>{d.baslatilamadi.komut ?? ''}</code> · çıkış {String(d.baslatilamadi.code ?? '?')}
          </p>
          <pre className="kosu-gunluk">
            {(d.baslatilamadi.stdout ?? '') + (d.baslatilamadi.stderr ?? '')}
          </pre>
        </div>
      )}

      <p className="giris-not">
        {d.createdAt.slice(0, 16).replace('T', ' ')} · şablon <strong>{d.sablonId ?? '—'}</strong>
        {d.ritimHedefi === null ? null : (
          <>
            {' '}
            · ritim hedefi {d.ritimHedefi} {d.ritimTuttu === true ? '✓' : '✗'}
          </>
        )}
      </p>

      {/* ⚠ ⚠ **DURAN BİR KOŞUYU PANELDEN SÜRDÜRMENİN YOLU YOKTU.** Kapı kararı
          verilmiş ama adım hata vermişse (model reddi, sağlayıcı hatası) ekranda
          yapılacak hiçbir şey kalmıyordu: tek çare komut satırıydı. Panelin
          "tek merkez" iddiası tam burada kırılıyordu. */}
      {d.durum !== 'durdu' ? null : (
        <div className="kapi-kutusu">
          <strong>Koşu {d.duraklananAdim ?? ''} adımında durdu.</strong>
          <p className="giris-not">
            Sebep adım defterinde. Düzeltme yapıldıysa buradan sürdürebilirsin — kapı kararları
            korunur, biten adımlar tekrar koşmaz.
          </p>
          <div className="kapi-dugmeler">
            <button
              type="button"
              onClick={() => {
                void (async () => {
                  setMesaj('sürdürülüyor…')
                  const r = await fetch(`/api/kosu/${runId}/surdur`, { method: 'POST' })
                  const j = (await r.json()) as { ok?: boolean; hata?: string }
                  setMesaj(
                    j.ok === true
                      ? '✓ sürdürülüyor — bu ekran kendini tazeliyor'
                      : `✗ sürdürülemedi: ${j.hata ?? 'bilinmeyen'}`
                  )
                  void yukle()
                })()
              }}
            >
              ↻ sürdür
            </button>
          </div>
        </div>
      )}

      {/* ⚠ ⚠ **ONAY ŞERİDİ.** Ekran yalnız "şu an ne bekliyor" diyordu; hangi kapının
          geçildiği hiçbir yerde yoktu ve insan üç kapılı bir hattın neresinde olduğunu
          bilmeden onaylıyordu. Şerit hattın KENDİ kapı listesinden türüyor — elle
          yazılmış bir liste, hat değişince sessizce yalan söylerdi. */}
      {(d.kapilar ?? []).length === 0 ? null : (
        <ol className="kapi-serit">
          {(d.kapilar ?? []).map((k) => (
            <li key={k.ad} className={`kapi-hane ${k.durum}`}>
              <span className="kapi-isaret">
                {k.durum === 'onaylandi'
                  ? '✓'
                  : k.durum === 'reddedildi'
                    ? '✗'
                    : k.durum === 'bekliyor'
                      ? '⏸'
                      : '·'}
              </span>
              <span className="kapi-ad">{k.ad}</span>
              <span className="kapi-durum">
                {k.durum === 'onaylandi'
                  ? 'onaylandı'
                  : k.durum === 'reddedildi'
                    ? 'reddedildi'
                    : k.durum === 'bekliyor'
                      ? 'SENİ BEKLİYOR'
                      : 'sırada'}
              </span>
            </li>
          ))}
        </ol>
      )}

      {/* ⚠ ⚠ **YAYIN ANI — SON KAPIDA SORULUYOR** (§11 · R-46 · Yasa 2 · FAZ-17.3).
          Hat saati ÖNERİR, insan seçer. Öneri ölçümden gelmiyorsa hat susuyor ve
          SEBEBİNİ yazıyor: uydurulmuş bir saat, kaynaksız bir sayısal iddiadır.
          ⚠ Kutu yalnız son kapıda görünüyor: metin onayında yayın saati sormak,
          henüz görselleri bile üretilmemiş bir işi zamanlamak olurdu. */}
      {d.bekleyenKapi !== 'insan-onayi' ? null : (
        <div className="yayin-ani-kutusu">
          <h3>yayın anı — sen seçiyorsun</h3>
          {d.yayinSaatiOnerisi == null ? null : d.yayinSaatiOnerisi.tur === 'oneri' ? (
            <p className="yayin-oneri">
              ⏱ önerilen saat{' '}
              <strong>{String(d.yayinSaatiOnerisi.saat).padStart(2, '0')}:00</strong> —{' '}
              {d.yayinSaatiOnerisi.gerekce}
            </p>
          ) : (
            <p className="yayin-oneri yok">
              ⏱ saat ÖNERİLMİYOR: {d.yayinSaatiOnerisi.sebep}. Ölçüm biriktikçe (en az beş yayının
              etkileşimi) hat gerekçeli bir saat önerecek — o güne kadar seçim tamamen senin.
            </p>
          )}
          {d.yayinAni === null ? (
            <p className="yayin-uyari">
              ⚠ Henüz bir an seçilmedi. <strong>Seçilmeden yayın adımı çalışmaz</strong> — hat kendi
              kendine "şimdi" demez.
            </p>
          ) : (
            <p className="yayin-secildi">
              ✓ seçilen an: <strong>{d.yayinAni.an}</strong> ({d.yayinAni.secen})
            </p>
          )}
          <div className="yayin-ani-satir">
            <input
              type="datetime-local"
              value={yayinAniTaslak}
              onChange={(e) => setYayinAniTaslak(e.target.value)}
              aria-label="yayın anı"
            />
            <button type="button" onClick={() => void yayinAniniKaydet()}>
              ⏱ yayın anını seç
            </button>
          </div>
        </div>
      )}

      {/* ⚠ ⚠ **ONAY DÜĞMESİ ONAYDAN SONRA YERİNDE KALIYORDU — ve sebebi ÖLÇÜLDÜ.**
          Panel yalnız `bekleyenKapi`ya bakıyordu; o alan `manifest.awaitingGate`ten
          geliyor ve karar yazıldığında DEĞİŞMİYOR — hat manifesti yeniden yazana kadar
          aynı kapıyı gösteriyor ve o iş dakikalar sürüyor. Yani insan onaylıyor, ekran
          hiç değişmiyor, insan bir daha basıyor.
          ⚠ Doğru ölçüt KARARIN KENDİSİ: `kapilar` listesi `decisions`tan türüyor ve
          onaylanan kapı anında `onaylandi` oluyor. Kuyruk da aynı kuralı kullanıyor
          (`decisions.some(d => d.gate === gate)`) — panel onunla AYNI şeyi sormalıydı. */}
      {d.bekleyenKapi === null || karariVerilmis ? null : (
        <div className="kapi-kutusu">
          <strong>{d.bekleyenKapi}</strong> kapısında bekliyor.
          <div className="kapi-dugmeler">
            <button type="button" onClick={() => void karar('approved', '')}>
              ✓ onayla
            </button>
            <button type="button" onClick={() => setGerekce('')}>
              ✗ reddet
            </button>
            {/* ⚠ ⚠ **O KOŞUYU AÇIYOR, ŞABLONU DEĞİL.** İlk sürüm çıplak `EDITOR`
                adresine gidiyordu ve editör varsayılan olarak ŞABLONU açıyordu —
                yani "bu çıktıyı düzelt" düğmesi, altı tasarımın kaynağını açıyordu.
                Şablonu değiştirmek bütün gelecek karoselleri etkiler; yanlışlıkla
                oraya girmek en pahalı kaza olurdu. */}
            <a href={`${EDITOR}/?id=kosu:${runId}`} target="_blank" rel="noreferrer">
              ✎ bu koşuyu editörde aç
            </a>
          </div>
          {gerekce === null ? null : (
            <div className="gerekce-kutusu">
              <label htmlFor="gerekce-detay">
                red gerekçesi (zorunlu — sonraki denemeye negatif kısıt olarak girer)
              </label>
              <textarea
                id="gerekce-detay"
                value={gerekce}
                onChange={(e) => setGerekce(e.target.value)}
              />
              <button
                type="button"
                disabled={gerekce.trim() === ''}
                onClick={() => void karar('rejected', gerekce.trim())}
              >
                reddet
              </button>
            </div>
          )}
        </div>
      )}
      {mesaj === null ? null : <p className="giris-not">{mesaj}</p>}

      {/* ⚠ ⚠ **TAKVİM KARARI KOŞUNUN İÇİNDE.** Depo sahibi: *"istediğim tarihe özel
          planlama da olmalı koşu detayında; istediğim gibi istediğimi manuel de
          paylaşabilirim platformları seçerek"*. Kutuyu takvim ekranından buraya
          KOPYALAMADIM — `GonderiKutusu.tsx` tek kaynak ve ikisi de onu çağırıyor;
          kopyalasaydım biri düzelir öteki unutulurdu (bu depoda iki kez ısırdı).
          ⚠ Kutu HER durumda görünüyor, yalnız son kapıda değil: bir üretimi henüz
          onaylamadan takvimde bir güne ayırmak meşru bir istek — ve takvim ekranı
          onaylanmamışı zaten planlamıyor, yani karar orada bir NİYET olarak duruyor.
          ⛔ Hiçbir düğme bir şey GÖNDERMİYOR; *"elle yayınladım"* bir kayıttır. */}
      <GonderiKutusu runId={runId} konu={d.konu ?? runId.slice(4, 16)} />

      <section className="giris-blok">
        <h3>
          Üretilen metin
          {d.metinElleDuzenlendi === true ? (
            <span className="olcum"> · ✎ elle düzenlendi</span>
          ) : null}
        </h3>
        {d.satirlar.length === 0 ? (
          <p className="giris-not">Bu adımda metin yok.</p>
        ) : taslak === null ? (
          <>
            <ol className="kosu-satirlar">
              {d.satirlar.map((s, i) => (
                <li key={`${String(i)}-${s.slice(0, 12)}`}>{s}</li>
              ))}
            </ol>
            {/* ⚠ Düzenleme YALNIZ metin kapısında: sonraki adımlar bu metinden türedi
                ve tasarım onayından sonra metni değiştirmek, onaylanmış slaytlarla
                tutarsız bir defter bırakırdı. */}
            {d.bekleyenKapi === 'metin-onayi' ? (
              <button type="button" onClick={() => setTaslak([...d.satirlar])}>
                ✎ metni düzenle
              </button>
            ) : null}
          </>
        ) : (
          <div className="metin-duzenle">
            {taslak.map((s, i) => (
              <textarea
                key={`t-${String(i)}`}
                value={s}
                aria-label={`satır ${String(i + 1)}`}
                onChange={(e) => setTaslak(taslak.map((x, j) => (j === i ? e.target.value : x)))}
              />
            ))}
            <div className="kapi-dugmeler">
              <button type="button" onClick={() => void metniKaydet(false)}>
                kaydet
              </button>
              <button type="button" onClick={() => void metniKaydet(true)}>
                ✓ kaydet ve onayla
              </button>
              <button type="button" onClick={() => setTaslak(null)}>
                vazgeç
              </button>
            </div>
            <p className="giris-not">
              Önceki hâl defterde kalıyor (`oncekiSatirlar`) — kanıt silinmiyor, ekleniyor.
            </p>
          </div>
        )}
      </section>

      <section className="giris-blok">
        <h3>Slaytlar</h3>
        {d.varliklar.length === 0 ? (
          <p className="giris-not">Henüz görsel üretilmedi.</p>
        ) : (
          <div className="kosu-slaytlar">
            {d.varliklar.map((v) => (
              <a key={v.digest} href={`/api/varlik/${v.digest}`} target="_blank" rel="noreferrer">
                <img src={`/api/varlik/${v.digest}`} alt="üretilen slayt" />
              </a>
            ))}
          </div>
        )}
        {/* ⚠ ⚠ **EDİTÖRDE YAZILAN ŞEY PANELDE GÖRÜNMÜYORDU.** `just duzenle` düzenlemeyi
            koşu dizinine `slayt-NN-elle.png` olarak yazıyor; panel yalnız DAMGALANMIŞ
            varlıkları gösteriyordu. İnsan düzenliyor, kaydediyor, panele dönüyor ve
            hiçbir şey değişmemiş görünüyordu — yapılan iş görünmez oluyordu.
            ⚠ Ayrı bölüm: elle düzenlenmiş slayt henüz uyum iddiası taşımıyor ve yayına
            aday DEĞİL. Damgalıların arasına karıştırmak, damgasız bir varlığı
            yayınlanabilir sanmak olurdu. */}
        {/* ⚠ ⚠ **ÜRÜN TANITIMINDA MODEL GÖRSELİ YANLIŞ CEVAPTIR.** Gerçek ürünün
            fotoğrafı varken onu üretmeye çalışmak hem para harcar hem yanlış ürünü
            çizer. Yüklenen dosya `elle_gorsel_<sıra>` parametresiyle o yuvaya giriyor
            ve o görsel için AI ifşası GEREKMİYOR — gerçek bir fotoğrafa "yapay zekâ
            görseli" yazmak doğru olmayan bir beyandır. */}
        <div className="giris-alan">
          <label htmlFor="gorsel-yukle">
            görsel yükle (yuva sırası ile) — üretim yerine BU dosya kullanılır
          </label>
          <input
            id="gorsel-yukle"
            type="file"
            accept="image/png,image/jpeg"
            onChange={(e) => void gorselYukle(e.target.files?.[0] ?? null)}
          />
          {yukleme === null ? null : <span className="giris-not">{yukleme}</span>}
        </div>
        {(d.yuklenenGorseller ?? []).length === 0 ? null : (
          <>
            <h4>
              Yüklenen görseller ({(d.yuklenenGorseller ?? []).length}) — üretimde kullanılacak
            </h4>
            <div className="kosu-slaytlar">
              {(d.yuklenenGorseller ?? []).map((ad) => (
                <a key={ad} href={`/api/kosu/${runId}/elle/${ad}`} target="_blank" rel="noreferrer">
                  <img src={`/api/kosu/${runId}/elle/${ad}`} alt={`yüklenen ${ad}`} />
                </a>
              ))}
            </div>
          </>
        )}
        {(d.elleSlaytlar ?? []).length === 0 ? null : (
          <>
            <h4>
              Elle düzenlenmiş ({(d.elleSlaytlar ?? []).length}) — damgasız, yayına aday değil
            </h4>
            <div className="kosu-slaytlar">
              {(d.elleSlaytlar ?? []).map((ad) => (
                <a key={ad} href={`/api/kosu/${runId}/elle/${ad}`} target="_blank" rel="noreferrer">
                  <img src={`/api/kosu/${runId}/elle/${ad}`} alt={`elle düzenlenmiş ${ad}`} />
                </a>
              ))}
            </div>
          </>
        )}
      </section>

      {/* ⚠ ⚠ **ÇIKTIYI ALMANIN TEK YOLU KOŞU DİZİNİNE GİRMEKTİ.** Slaytlar ekranda
          görünüyordu ama indirilemiyordu. Açıklama burada duruyor çünkü seçim bir
          TERCİH değil bir KULLANIM sorusudur: nereye yükleyeceğin hangi biçimi
          gerektirdiğini belirler. */}
      <section className="giris-blok">
        <h3>Dışa aktar</h3>
        <p className="giris-not">
          <strong>Yayın için:</strong> dilimlenmiş PNG — platform slayt slayt yükleme istiyor ve PNG
          kayıpsız, tipografi kenarları temiz kalır.
          <br />
          <strong>Onaya göndermek için:</strong> tek dosya isteniyorsa dilimlenmiş PDF — her slayt
          ayrı sayfa, sıra korunur. JPEG yalnız FOTOĞRAF taşıyan slaytlarda küçülüyor; düz zeminli
          tasarımda PNG zaten daha küçük (ölçüldü: 148 KB / 209 KB) ve kayıpsız.
          <br />
          <strong>Kesintisizliği görmek için:</strong> bütün PNG — kesimi aşan ögenin gerçekten
          aktığı ancak tek geniş tuvalde anlaşılır. Platforma yüklenmez.
          <br />
          <strong>Baskı/sunum için:</strong> bütün PDF — vektör metin taşır, yakınlaşınca tipografi
          bulanmaz.
        </p>
        <div className="kapi-dugmeler">
          {(
            [
              ['dilim', 'png', 'slaytlar · PNG (yayın)'],
              ['dilim', 'jpg', 'slaytlar · JPEG (hafif)'],
              ['dilim', 'pdf', 'slaytlar · PDF (her slayt bir sayfa)'],
              ['butun', 'png', 'kesintisiz · PNG'],
              ['butun', 'jpg', 'kesintisiz · JPEG'],
              ['butun', 'pdf', 'kesintisiz · PDF'],
            ] as const
          ).map(([tarz, bicim, etiket]) => (
            <a
              key={`${tarz}-${bicim}`}
              href={`/api/kosu/${runId}/disa-aktar?tarz=${tarz}&bicim=${bicim}`}
              // ⚠ Dilimlenmiş görselde ilk parça iniyor; ötekiler `&parca=N` ile.
              // Zip yazmak bir bağımlılık ya da elle bir ikili biçim demekti (R-75).
            >
              ⭳ {etiket}
            </a>
          ))}
        </div>
        {d.varliklar.length <= 1 ? null : (
          <p className="giris-not">
            Dilimlenmiş görselde tek tek slayt:{' '}
            {d.varliklar.map((_, i) => (
              <a
                key={`p-${String(i)}`}
                href={`/api/kosu/${runId}/disa-aktar?tarz=dilim&bicim=png&parca=${String(i)}`}
              >
                {String(i + 1).padStart(2, '0')}{' '}
              </a>
            ))}
          </p>
        )}
      </section>

      {/* ⚠ ⚠ **CANLI GÜNLÜK.** Adım defteri bitmiş adımları gösteriyor; bu bölüm ŞU AN
          ne olduğunu. `▶ adim [girdi]` ve `↳ adim çıktı [özet]` satırları burada:
          bir adımın çıktısı iki geçişte farklıysa kararsızlık bu satırlarda görünür.
          ⚠ Son satır ALTTA ve kutu kaydırmalı: bir günlükte insanın aradığı şey
          neredeyse her zaman SON satırdır. */}
      <section className="giris-blok">
        <h3>Canlı günlük ({gunluk.length} satır)</h3>
        {gunluk.length === 0 ? (
          <p className="giris-not">Henüz satır yok — süreç kalkıyor.</p>
        ) : (
          <pre className="kosu-gunluk">{gunluk.slice(-200).join('\n')}</pre>
        )}
      </section>

      {/* ⚠ Adım defteri: "ne oldu" sorusunun tek dürüst cevabı. Süre ve sağlayıcı da
          burada — hangi adımın pahalı ve yavaş olduğu ancak ölçülünce bilinir. */}
      <section className="giris-blok">
        <h3>Adım defteri</h3>
        {d.adimlar.length === 0 ? (
          <p className="giris-not">Henüz adım yazılmadı.</p>
        ) : (
          <table className="kayit-tablosu">
            <thead>
              <tr>
                <th>adım</th>
                <th>fiil</th>
                <th>durum</th>
                <th>sağlayıcı</th>
                <th>süre</th>
              </tr>
            </thead>
            <tbody>
              {d.adimlar.map((a) => (
                <tr key={a.id}>
                  <td>{a.id}</td>
                  <td>{a.verb}</td>
                  <td>
                    {a.durum === 'ok'
                      ? '✓'
                      : a.durum === 'skipped'
                        ? '· atlandı'
                        : `✗ ${a.durum ?? ''}`}
                  </td>
                  <td>{a.saglayici ?? '—'}</td>
                  <td>{a.saniye === null ? '—' : `${String(a.saniye)} sn`}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* ⚠ ⚠ **ÖNİZLEME KUSURLARDAN ÖNCE.** Depo sahibi bu ekranda önce *"doğru sıra
          ile mi paylaşılacak"* sorusunu soruyor; kusur listesi ondan sonra gelen bir
          ayrıntı. Sıra ekranda da anlamı taşıyor. */}
      <section className="giris-blok">
        <YayinOnizleme runId={runId} />
      </section>

      {/* ⚠ Karar verilmişse SESSİZ kalınmıyor: düğmeleri kaldırıp yerine hiçbir şey
          koymamak, ekranın "bir şey kayboldu" gibi okunmasına yol açardı. Hattın
          sürdüğü AÇIKÇA yazıyor. */}
      {!karariVerilmis ? null : (
        <div className="kapi-kutusu">
          <strong>{d.bekleyenKapi}</strong> kapısında karar verildi — hat sürüyor. Bu ekran kendini
          tazeliyor; sonraki kapı açılınca düğmeler geri gelecek.
        </div>
      )}

      {d.kusurlar.length === 0 ? null : (
        <section className="giris-blok">
          <h3>Ölçülen kusurlar</h3>
          <ul className="kosu-kusur">
            {d.kusurlar.map((k, i) => (
              <li key={`${String(i)}-${k.tur ?? ''}`}>
                <strong>{k.tur ?? '—'}</strong> {k.aciklama ?? ''}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
