// Bir koşunun İÇERİĞİ — onaylamadan önce NEYİ onayladığını görmek için (FAZ-17.2).
//
// ⚠ ⚠ **BU EKRAN BİR ÖLÇÜMDEN DOĞDU.** Panel kullanıldı ve sayıldı: onay kuyruğunda
// satıra tıklamak hiçbir şey yapmıyordu, ekranda `img` sayısı SIFIRdı ve üretilen
// metin hiçbir yerde görünmüyordu. İnsan `run_01a0160e · metin-onayi` satırına bakıp
// "onayla" diyecekti — neyi onayladığını görmeden. Bir kapı, kararın dayanağını
// göstermiyorsa kapı değil bir gecikmedir.

import type React from 'react'
import { useCallback, useEffect, useState } from 'react'

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

  /**
   * Görseli yükler — **yuva sırası dosya adından değil, mevcut yüklü sayıdan** türüyor.
   *
   * ⚠ Base64 gövde: `multipart` ayrıştırıcısı ikinci bir çözücü demekti ve bu depoda
   * "tek çözücü" bir kural (§3.8). Tarayıcı `FileReader` ile zaten base64 veriyor.
   */
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
      body: JSON.stringify({ sira: (d?.yuklenenGorseller.length ?? 0) + 1, base64 }),
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
  }, [runId])

  useEffect(() => {
    void yukle()
    // ⚠ ⚠ **EKRAN KENDİNİ TAZELİYOR.** Hat sürdükten sonra adımlar ilerliyor ama ekran
    // donmuş kalıyordu: kullanıcı "bir şey olmadı" görüyordu. Beş saniye, bir adımın
    // bitmesinden kısa ve tarayıcıyı yormayacak kadar uzun.
    const t = setInterval(() => void yukle(), 5000)
    return () => clearInterval(t)
  }, [yukle])

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
      {d.kapilar.length === 0 ? null : (
        <ol className="kapi-serit">
          {d.kapilar.map((k) => (
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

      {d.bekleyenKapi === null ? null : (
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

      <section className="giris-blok">
        <h3>Üretilen metin</h3>
        {d.satirlar.length === 0 ? (
          <p className="giris-not">Bu adımda metin yok.</p>
        ) : (
          <ol className="kosu-satirlar">
            {d.satirlar.map((s, i) => (
              <li key={`${String(i)}-${s.slice(0, 12)}`}>{s}</li>
            ))}
          </ol>
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
        {d.yuklenenGorseller.length === 0 ? null : (
          <>
            <h4>Yüklenen görseller ({d.yuklenenGorseller.length}) — üretimde kullanılacak</h4>
            <div className="kosu-slaytlar">
              {d.yuklenenGorseller.map((ad) => (
                <a key={ad} href={`/api/kosu/${runId}/elle/${ad}`} target="_blank" rel="noreferrer">
                  <img src={`/api/kosu/${runId}/elle/${ad}`} alt={`yüklenen ${ad}`} />
                </a>
              ))}
            </div>
          </>
        )}
        {d.elleSlaytlar.length === 0 ? null : (
          <>
            <h4>Elle düzenlenmiş ({d.elleSlaytlar.length}) — damgasız, yayına aday değil</h4>
            <div className="kosu-slaytlar">
              {d.elleSlaytlar.map((ad) => (
                <a key={ad} href={`/api/kosu/${runId}/elle/${ad}`} target="_blank" rel="noreferrer">
                  <img src={`/api/kosu/${runId}/elle/${ad}`} alt={`elle düzenlenmiş ${ad}`} />
                </a>
              ))}
            </div>
          </>
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
