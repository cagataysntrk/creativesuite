// Run History / Provenance Browser (§13, §12.9 · FAZ-4.15).
//
// **Ekranın taşıdığı tek zor gerçek:** `rerun` kararı tekrarlar, ESERİ değil.
//
// Kullanıcı bir çalıştırmayı yeniden koştuğunda farklı bir görsel çıkarsa ve ekran ona
// bunu önceden söylememişse, bunu bir bug sanar — ve o an sistemin ölçtüğü her sayıya
// olan güvenini de kaybeder. Bu yüzden uyarı bir dipnot değil, düğmelerin yanında.
//
// **İki düğme, iki AYRI eylem:** `rerun` donmuş planı koşar (aynı sağlayıcı, aynı
// kısıt, aynı seed); `replay` bugünün tanımıyla yeniden planlar. Tek bir "tekrar" düğmesi
// koymak, hangisinin olduğunu kullanıcının bilmemesi demekti.

import { useEffect, useState } from 'react'
import { aralikta, tamTarih, tariheGore, type Siralama } from './tarih.js'
import { usdBicimle } from './baglanti.js'

interface Ozet {
  readonly runId: string
  readonly pipeline: string
  readonly brandId: string
  readonly eraId: string
  readonly createdAt: string
  readonly corpusCommit: string
  readonly registryCommit: string
  readonly adimSayisi: number
  readonly tahminUstMikros: string
  readonly gercekMikros: string
  readonly sapmaYuzde: number | null
  readonly onemli: boolean
  readonly awaitingGate: string | null
  readonly stoppedAt: string | null
  readonly kararSayisi: number
  readonly manifestSaglam: boolean
  readonly donmusPlanVar: boolean
  /** İnsan "bunu beğenmedim" dedi — kayıt duruyor, liste temizleniyor. */
  readonly elendi: { readonly at: string; readonly sebep: string } | null
  readonly sablon: string | null
  readonly konu: string | null
}

interface Adim {
  readonly stepId: string
  readonly verb: string
  readonly status: string
  readonly lane: string
  readonly capability: string | null
  readonly providerId: string | null
  readonly model: string | null
  readonly seed: number | null
  readonly tahminUstMikros: string
  readonly gercekMikros: string | null
  readonly adaylar: readonly {
    readonly providerId: string
    readonly selected: boolean
    readonly rejectionReason: string | null
  }[]
  readonly sureMs: number | null
}

interface Secenek {
  readonly kind: string
  readonly mumkun: boolean
  readonly neden: string | null
  readonly ne: string
}

interface Detay {
  readonly ozet: Ozet
  readonly adimlar: readonly Adim[]
  readonly kararlar: readonly {
    readonly gate: string
    readonly decision: string
    readonly at: string
    readonly note: string | null
  }[]
  readonly baglam: readonly {
    readonly section: string
    readonly tokens: number
    readonly kayitlar: readonly { readonly recordId: string; readonly reason: string }[]
  }[]
  readonly tekrar: {
    readonly rerun: Secenek
    readonly replay: Secenek
    readonly sapmalar: readonly string[]
    readonly sapmaOlculdu: boolean
    readonly belirsizAdimlar: readonly {
      readonly stepId: string
      readonly verb: string
      readonly seedli: boolean
      readonly neden: string
    }[]
    readonly uyari: string
  }
  readonly donmusKayitlar: readonly string[]
}

const kisaSha = (s: string): string => (/^[0-9a-f]{40}$/.test(s) ? s.slice(0, 8) : s)

export const RunGecmisi = ({
  ac,
}: {
  /** Koşu ekranını açar — panelin geri kalanıyla AYNI hedef (FAZ-17.3). */
  readonly ac?: (runId: string) => void
} = {}): React.JSX.Element => {
  const [liste, setListe] = useState<readonly Ozet[] | null>(null)
  const [secili, setSecili] = useState<string | null>(null)
  // ⚠ ⚠ **138 SATIR FİLTRESİZ DÖKÜLÜYORDU.** Ekran "çalıştırma geçmişi" diyor ama
  // kullanıcının sorusu hiçbir zaman "hepsini göster" değil: "bugün ne koştu",
  // "hangileri durdu", "şu hat ne yaptı". Filtresiz bir liste, cevabı içinde
  // saklayan bir liste.
  const [fHat, setFHat] = useState('')
  const [fDurum, setFDurum] = useState('')
  const [fTaze, setFTaze] = useState(false)
  const [ara, setAra] = useState('')
  const [elenenler, setElenenler] = useState(false)
  // ⚠ ⚠ **TARİH EKRANDA HİÇ YOKTU** ve süzgeçlerde de yoktu: "bu ne zaman koştu" ve
  // "şu iki gün arasında ne oldu" sorularının cevabı hiçbir yerde yoktu.
  const [fBas, setFBas] = useState('')
  const [fSon, setFSon] = useState('')
  const [siralama, setSiralama] = useState<Siralama>('yeni')
  // ⚠ ⚠ **BU İKİ SÜZGEÇ "ONAYLAR" EKRANINI GEREKSİZ KILDI.** Ayrı bir onay ekranı
  // vardı çünkü koşu listesinde *hangi kapı* ve *hangi şablon* sorulamıyordu. Depo
  // sahibi: *"onaylar sekmesi aşırı işlevsiz, zaten onayı koşu detayında yönetiyoruz;
  // koşular ve varlıklar sekmelerine filtre ve özellikler ekleyerek onaylar sekmesini
  // kaldırıp bu sekmeleri canlandırabiliriz"*.
  const [fKapi, setFKapi] = useState('')
  const [fSablon, setFSablon] = useState('')
  // ⚠ Çoklu seçim: on koşuyu tek tek elemek, elemeyi kullanılmaz yapardı.
  const [secilenler, setSecilenler] = useState<readonly string[]>([])
  const [detay, setDetay] = useState<Detay | null>(null)
  const [tekrarSonuc, setTekrarSonuc] = useState<string | null>(null)

  /**
   * İki AYRI uç, iki AYRI eylem. Tek bir "tekrar" çağrısı yapıp sunucuda ayırmak,
   * ekrandaki iki düğmeyi kozmetiğe çevirirdi (FAZ-4.15).
   */
  const tekrarla = async (runId: string, kind: 'rerun' | 'replay'): Promise<void> => {
    setTekrarSonuc(null)
    try {
      const r = await fetch(`/api/calistirmalar/${encodeURIComponent(runId)}/${kind}`, {
        method: 'POST',
      })
      const j = (await r.json()) as { ok: boolean; runId?: string; hata?: string }
      setTekrarSonuc(
        j.ok ? `${kind} başlatıldı: ${j.runId ?? ''}` : (j.hata ?? `${kind} başarısız`)
      )
    } catch {
      setTekrarSonuc('sunucuya ulaşılamıyor')
    }
  }

  const listeyiCek = (): void => {
    void fetch('/api/calistirmalar')
      .then((r) => r.json() as Promise<{ calistirmalar: readonly Ozet[] }>)
      .then((j) => setListe(j.calistirmalar))
      .catch(() => setListe([]))
  }

  useEffect(listeyiCek, [])

  /**
   * Koşuyu eler — **byte'a ve deftere DOKUNMADAN.**
   *
   * ⚠ Gerekçe ZORUNLU (sunucu da zorluyor): gerekçesiz bir eleme, altı ay sonra "bu
   * neden elenmiş" sorusunu cevapsız bırakır ve kimse geri almaya cesaret edemez.
   */
  /** Seçilen koşuları TEK gerekçeyle eler — tek tek sormak on soru demekti. */
  const topluEle = async (): Promise<void> => {
    const sebep = prompt(`${secilenler.length} koşu elenecek. Neden? (kayıt SİLİNMİYOR)`) ?? ''
    if (sebep.trim() === '') return
    for (const runId of secilenler) {
      await fetch(`/api/kosu/${encodeURIComponent(runId)}/ele`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ sebep }),
      })
    }
    setSecilenler([])
    listeyiCek()
  }

  const ele = async (r: Ozet): Promise<void> => {
    const geriAl = r.elendi !== null
    const sebep = geriAl
      ? ''
      : (prompt('Neden eleniyor? (kayıt SİLİNMİYOR, listeden kalkıyor)') ?? '')
    if (!geriAl && sebep.trim() === '') return
    await fetch(`/api/kosu/${encodeURIComponent(r.runId)}/ele`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(geriAl ? { geriAl: true } : { sebep }),
    })
    listeyiCek()
  }

  useEffect(() => {
    if (secili === null) return
    setDetay(null)
    void fetch(`/api/calistirmalar/${encodeURIComponent(secili)}`)
      .then((r) => (r.ok ? (r.json() as Promise<Detay>) : null))
      .then(setDetay)
      .catch(() => setDetay(null))
  }, [secili])

  if (liste === null) return <p>yükleniyor…</p>

  const hatlar = [...new Set(liste.map((r) => r.pipeline))].sort()
  // ⚠ Seçenekler VERİDEN türüyor: sabit bir kapı listesi yazsaydım yeni bir kapı
  // eklendiğinde süzgeç onu sessizce göstermez, "hiç yok" derdi.
  const kapilar = [...new Set(liste.map((r) => r.awaitingGate).filter((x) => x !== null))].sort()
  const sablonlar = [...new Set(liste.map((r) => r.sablon).filter((x) => x !== null))].sort()
  const yediGunOnce = Date.now() - 7 * 24 * 3600 * 1000
  const durumu = (r: Ozet): string =>
    !r.manifestSaglam
      ? 'kusurlu'
      : r.awaitingGate !== null
        ? 'kapida'
        : r.stoppedAt !== null
          ? 'durdu'
          : 'tamam'
  const suzulmusHam = liste
    .filter((r) => fHat === '' || r.pipeline === fHat)
    .filter((r) => fDurum === '' || durumu(r) === fDurum)
    .filter((r) => !fTaze || new Date(r.createdAt).getTime() >= yediGunOnce)
    .filter((r) => fKapi === '' || r.awaitingGate === fKapi)
    .filter((r) => fSablon === '' || r.sablon === fSablon)
    // ⚠ Arama artık KONUYU da tarıyor: bir koşuyu kimliğinden değil konusundan
    // hatırlıyoruz ve `run_01a0…` yazarak arama yapan kimse yok.
    .filter(
      (r) =>
        ara.trim() === '' ||
        `${r.runId} ${r.pipeline} ${r.sablon ?? ''} ${r.konu ?? ''}`
          .toLocaleLowerCase('tr')
          .includes(ara.trim().toLocaleLowerCase('tr'))
    )
    // ⚠ ⚠ **SİLMEK YOK, ELEMEK VAR.** `derived/runs` türetilemez ve silinmez (Yasa 11 ·
    // R-52); ama beğenilmeyen çıktının listeyi doldurması da bir maliyet — insan
    // aradığını bulamıyor. Eleme ikisini uzlaştırıyor: kayıt DURUYOR, liste temizleniyor.
    .filter((r) => elenenler || r.elendi === null)
    .filter((r) => aralikta(r.createdAt, fBas, fSon))
  // ⚠ Sıralama artık SEÇİLEBİLİR. Varsayılan yine en yeni önce: geçmiş ekranında insan
  // en son ne olduğuna bakar. Ama "ilk koşular ne yapmıştı" da meşru bir soru ve
  // cevabını sabit bir sıralama gizliyordu.
  const sirali = tariheGore(suzulmusHam, (r) => r.createdAt, siralama)
  const suzulmus = sirali
  // ⚠ ⚠ **SAYILAR LİSTEYLE AYNI TABANDAN.** İlk sürüm ham listeyi sayıyordu ve başlık
  // *"202 koşu · 113 kapıda"* derken tabloda 2 satır vardı: elenenler sayılıyor ama
  // gösterilmiyordu. Gösterilmeyeni saymak, insanı olmayan 111 satırı aramaya yollar.
  const taban = elenenler ? liste : liste.filter((r) => r.elendi === null)
  const sayim = {
    kapida: taban.filter((r) => durumu(r) === 'kapida').length,
    durdu: taban.filter((r) => durumu(r) === 'durdu').length,
    kusurlu: taban.filter((r) => durumu(r) === 'kusurlu').length,
    elenmis: liste.length - taban.length,
  }

  return (
    <section>
      <h1>Çalıştırma geçmişi</h1>
      <p className="giris-not">
        {taban.length} koşu · {sayim.kapida} kapıda · {sayim.durdu} durdu · {sayim.kusurlu} kusurlu
        manifest
        {sayim.elenmis === 0 ? null : <> · {sayim.elenmis} elenmiş gizli</>}
        {suzulmus.length === taban.length ? null : <> · süzülen {suzulmus.length}</>}
      </p>

      <div className="filtre-cubuk">
        <label>
          hat{' '}
          <select value={fHat} onChange={(e) => setFHat(e.target.value)}>
            <option value="">hepsi</option>
            {hatlar.map((h) => (
              <option key={h} value={h}>
                {h}
              </option>
            ))}
          </select>
        </label>
        <label>
          durum{' '}
          <select value={fDurum} onChange={(e) => setFDurum(e.target.value)}>
            <option value="">hepsi</option>
            <option value="kapida">kapıda bekliyor</option>
            <option value="durdu">durdu</option>
            <option value="tamam">tamamlandı</option>
            <option value="kusurlu">kusurlu manifest</option>
          </select>
        </label>
        <label>
          bekleyen kapı{' '}
          <select value={fKapi} onChange={(e) => setFKapi(e.target.value)}>
            <option value="">hepsi</option>
            {kapilar.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        </label>
        <label>
          şablon{' '}
          <select value={fSablon} onChange={(e) => setFSablon(e.target.value)}>
            <option value="">hepsi</option>
            {sablonlar.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        </label>
        <label>
          <input type="checkbox" checked={fTaze} onChange={(e) => setFTaze(e.target.checked)} /> son
          7 gün
        </label>
        <label>
          ara <input type="text" value={ara} onChange={(e) => setAra(e.target.value)} />
        </label>
        <label>
          <input
            type="checkbox"
            checked={elenenler}
            onChange={(e) => setElenenler(e.target.checked)}
          />{' '}
          elenenleri de göster
        </label>
        {/* ⚠ Tarih aralığı: "şu iki gün arasında ne oldu" sorusunun cevabı ekranda
            YOKTU. Boş uç = sınırsız; iki ucu da doldurmak zorunda değilsin. */}
        <label>
          başlangıç <input type="date" value={fBas} onChange={(e) => setFBas(e.target.value)} />
        </label>
        <label>
          bitiş <input type="date" value={fSon} onChange={(e) => setFSon(e.target.value)} />
        </label>
        <label>
          sıra{' '}
          <select value={siralama} onChange={(e) => setSiralama(e.target.value as Siralama)}>
            <option value="yeni">en yeni önce</option>
            <option value="eski">en eski önce</option>
          </select>
        </label>
      </div>
      {/* ⚠ ⚠ **ÇOKLU SEÇİM.** On koşuyu tek tek elemek, elemeyi kullanılmaz yapardı;
          depo sahibi *"çoklu seçim yok"* diye yazdı. Seçim SÜZÜLMÜŞ listeye ait: göz
          neyi görüyorsa onu seçiyor — görünmeyen bir satırı toplu eylem yakalamamalı. */}
      {secilenler.length === 0 ? null : (
        <div className="filtre-cubuk">
          <strong>{secilenler.length} koşu seçili</strong>
          <button type="button" onClick={() => void topluEle()}>
            ✕ seçilenleri ele
          </button>
          <button type="button" onClick={() => setSecilenler([])}>
            seçimi temizle
          </button>
        </div>
      )}

      {suzulmus.length === 0 ? (
        <p>
          {liste.length === 0
            ? 'Henüz çalıştırma yok — geçmiş boş bir liste, bir hata değil.'
            : 'Bu süzgeçle koşu yok — filtreyi gevşet.'}
        </p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  aria-label="hepsini seç"
                  checked={secilenler.length > 0 && secilenler.length === suzulmus.length}
                  onChange={(e) =>
                    setSecilenler(e.target.checked ? suzulmus.map((x) => x.runId) : [])
                  }
                />
              </th>
              <th>çalıştırma</th>
              <th>şablon</th>
              <th>konu</th>
              <th>tarih</th>
              <th>hat</th>
              <th>bilgi ağacı</th>
              <th>tahmin üst</th>
              <th>gerçek</th>
              <th>sapma</th>
              <th>durum</th>
            </tr>
          </thead>
          <tbody>
            {suzulmus.map((r) => (
              <tr key={r.runId} onClick={() => setSecili(r.runId)}>
                <td onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    aria-label={`${r.runId} seç`}
                    checked={secilenler.includes(r.runId)}
                    onChange={(e) =>
                      setSecilenler(
                        e.target.checked
                          ? [...secilenler, r.runId]
                          : secilenler.filter((x) => x !== r.runId)
                      )
                    }
                  />
                </td>
                <td className="kosu-kimlik">
                  {/* ⚠ İki ayrı hedef, iki ayrı tıklama: satır köken/tekrar
                      ayrıntısını açıyor, düğme KOŞU ekranına götürüyor. Tek
                      tıklamaya iki anlam yüklemek, ikisini de belirsiz yapardı. */}
                  {/* ⚠ ⚠ **KİMLİK KISALDI.** Tam `run_01a03e9e-7d62-7560-b44d-0cb7225e2883`
                      hücreyi üç satıra yayıyordu ve iki düğmeyi aşağı itiyordu; on satırlık
                      bir liste bir ekrana sığmıyordu. Kimliğin tamamı `title`da ve satır
                      zaten tıklanabilir — okunmayan otuz altı karakter yer kaplıyordu. */}
                  <span className="mono" title={r.runId}>
                    {r.runId.slice(4, 12)}…{r.runId.slice(-4)}
                  </span>
                  {ac === undefined ? null : (
                    <button
                      type="button"
                      className="satir-ac"
                      onClick={(e) => {
                        e.stopPropagation()
                        ac(r.runId)
                      }}
                    >
                      ↗ aç
                    </button>
                  )}
                  {/* ⚠ Eleme GEREKÇE istiyor ve GERİ ALINABİLİR: gerekçesiz bir eleme
                      altı ay sonra "bu neden elenmiş" sorusunu cevapsız bırakır. */}
                  <button
                    type="button"
                    className="satir-ac"
                    onClick={(e) => {
                      e.stopPropagation()
                      void ele(r)
                    }}
                  >
                    {r.elendi === null ? '✕ ele' : '↩ elemeyi geri al'}
                  </button>
                </td>
                {/* ⚠ TAM tarih: gün, ay, yıl, saat, dakika. "3 saat önce" iki koşuyu
                    karşılaştırmayı imkânsız kılar ve liste ekranında asıl iş odur. */}
                {/* ⚠ Şablon ve konu KİMLİKTEN HEMEN SONRA: satıra bakan insanın ilk
                    iki sorusu bunlar ve on sütun ötede sorulmuş sayılmıyorlar. */}
                <td>{r.sablon ?? '—'}</td>
                <td>{r.konu === null || r.konu === '' ? '—' : r.konu}</td>
                <td className="mono">{tamTarih(r.createdAt)}</td>
                <td>{r.pipeline}</td>
                <td className="mono">{kisaSha(r.corpusCommit)}</td>
                <td className="mono">{usdBicimle(r.tahminUstMikros)}</td>
                <td className="mono">{usdBicimle(r.gercekMikros)}</td>
                <td className="mono">
                  {r.sapmaYuzde === null ? '—' : `${r.sapmaYuzde.toFixed(1)}%`}
                  {r.onemli ? ' ✗ sapma' : ''}
                </td>
                {/* ⚠ Kapıda bekleyen bir koşu için "durdu: gorsel-yargi" GÜRÜLTÜ: hat
                    durmadı, İNSANI bekliyor. Bekleyen kapı varsa o söyleniyor; durduğu
                    adım ancak gerçekten durmuşsa. */}
                <td>
                  {r.awaitingGate !== null
                    ? `⏸ ${r.awaitingGate}`
                    : r.stoppedAt !== null
                      ? `durdu: ${r.stoppedAt}`
                      : '✓ tamamlandı'}
                  {r.manifestSaglam ? '' : ' · manifest KUSURLU'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {secili !== null && detay === null ? <p>çalıştırma okunuyor…</p> : null}

      {detay === null ? null : (
        <article>
          <h2>{detay.ozet.runId}</h2>
          <p className="mono">
            {detay.ozet.brandId} · {detay.ozet.eraId} · corpus {kisaSha(detay.ozet.corpusCommit)} ·
            registry {kisaSha(detay.ozet.registryCommit)} · {detay.ozet.createdAt}
          </p>

          <h3>Tekrar</h3>
          {/* Uyarı düğmelerin ÜSTÜNDE: tıkladıktan sonra okunan bir uyarı, uyarı değildir. */}
          <p role="note">{detay.tekrar.uyari}</p>
          <div>
            <button
              type="button"
              disabled={!detay.tekrar.rerun.mumkun}
              onClick={() => void tekrarla(detay.ozet.runId, 'rerun')}
            >
              rerun — {detay.tekrar.rerun.ne}
            </button>
            {detay.tekrar.rerun.neden === null ? null : <p>{detay.tekrar.rerun.neden}</p>}
            <button
              type="button"
              disabled={!detay.tekrar.replay.mumkun}
              onClick={() => void tekrarla(detay.ozet.runId, 'replay')}
            >
              replay — {detay.tekrar.replay.ne}
            </button>
            {tekrarSonuc === null ? null : (
              <p role="status" className="mono">
                {tekrarSonuc}
              </p>
            )}
          </div>

          <h4>Donmuş plan ile bugünün dünyası arasındaki fark</h4>
          {!detay.tekrar.sapmaOlculdu ? (
            // "Ölçülmedi" ile "fark yok" AYRI sonuçlardır (§12.6). Boş liste göstermek
            // ikincisini ima ederdi.
            <p>ölçülemedi — donmuş plan ya da bugünün sağlayıcı tanımı okunamadı</p>
          ) : detay.tekrar.sapmalar.length === 0 ? (
            <p>fark yok — replay bugün aynı planı üretir</p>
          ) : (
            <ul>
              {detay.tekrar.sapmalar.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          )}

          <h4>rerun bile aynı eseri vermeyebilir</h4>
          {detay.tekrar.belirsizAdimlar.length === 0 ? (
            <p>dış dünyaya bağlı adım yok — bu çalıştırma yeniden üretilebilir</p>
          ) : (
            <ul>
              {detay.tekrar.belirsizAdimlar.map((b) => (
                <li key={b.stepId}>
                  <span className="mono">{b.stepId}</span> · {b.verb} ·{' '}
                  {b.seedli ? 'seed var' : 'seed YOK'} — {b.neden}
                </li>
              ))}
            </ul>
          )}

          <h3>İstasyon zinciri</h3>
          <ol>
            {detay.adimlar.map((a) => (
              <li key={a.stepId}>
                <span className="mono">{a.stepId}</span> · {a.verb} · {a.lane} ·{' '}
                {a.capability ?? 'yetenek yok'} · {a.providerId ?? 'sağlayıcı yok'} ·{' '}
                {a.model ?? 'model yok'} · seed {a.seed === null ? '—' : a.seed} ·{' '}
                <span className="mono">
                  {a.gercekMikros === null ? 'koşmadı' : usdBicimle(a.gercekMikros)}
                </span>{' '}
                / tahmin <span className="mono">{usdBicimle(a.tahminUstMikros)}</span> ·{' '}
                {a.sureMs === null ? '—' : `${a.sureMs} ms`} · {a.status}
                {/* Kaybeden adaylar da görünür: yönlendirmeyi sihirden yönetişime
                    çeviren şey, altı ay sonra "neden bu model" sorusunun cevabıdır. */}
                {a.adaylar.filter((k) => !k.selected).length === 0 ? null : (
                  <ul>
                    {a.adaylar
                      .filter((k) => !k.selected)
                      .map((k) => (
                        <li key={k.providerId}>
                          {k.providerId} elendi — {k.rejectionReason ?? 'gerekçe yazılmamış'}
                        </li>
                      ))}
                  </ul>
                )}
              </li>
            ))}
          </ol>

          <h3>İnsan kararları</h3>
          {detay.kararlar.length === 0 ? (
            <p>insan kararı yok</p>
          ) : (
            <ul>
              {detay.kararlar.map((k) => (
                <li key={`${k.gate}-${k.at}`}>
                  {k.gate} · {k.decision} · {k.at}
                  {k.note === null ? '' : ` — ${k.note}`}
                </li>
              ))}
            </ul>
          )}

          <h3>Enjekte edilen bağlam</h3>
          {detay.baglam.length === 0 ? (
            <p>bağlam manifesti boş</p>
          ) : (
            <ul>
              {detay.baglam.map((b) => (
                <li key={b.section}>
                  {b.section} · <span className="mono">{b.tokens}</span> token · {b.kayitlar.length}{' '}
                  kayıt
                </li>
              ))}
            </ul>
          )}

          <h3>Donmuş kayıt kümesi</h3>
          <p>
            {detay.donmusKayitlar.length === 0
              ? 'donmuş plan yok — rerun hangi kayıtlarla koşacağını bilemez'
              : `${detay.donmusKayitlar.length} kayıt · rerun tam olarak bunlarla koşar`}
          </p>
        </article>
      )}
    </section>
  )
}
