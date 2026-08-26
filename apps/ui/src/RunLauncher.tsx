// Run Launcher (§8.3, §12.9 · R-07 · FAZ-4.6b).
//
// **Başlat düğmesi, gösterilen plana bağlıdır.** Ekranda bir tahmin gösterip başka bir
// planı koşturmak, onayı anlamsız kılar — bu yüzden plan burada DONAR ve donmuş hâli
// çalıştırmaya geri verilir (R-07).
//
// **Tahmin bir BANT.** Tek sayı göstermek, üst uçtan gelen faturayı hata gibi
// hissettirir; oysa aralık onu zaten söylüyordu (§8.3).

import { useCallback, useEffect, useState } from 'react'

/**
 * Yayın platformları — panelde gösterilen liste.
 *
 * ⚠ Sunucudaki `PLATFORMLAR`dan TÜREİLMİYOR ve bu bilinçli: `apps/ui` tarayıcı katmanı,
 * `@suite/contracts`e uzanmak `rings` kapısına takılıyor. `yayin-platformlari` kapısı
 * iki listenin AYNI kaldığını zorluyor.
 */
const PLATFORM_SECENEKLERI = [
  { id: 'instagram', ad: 'Instagram' },
  { id: 'facebook', ad: 'Facebook' },
  { id: 'linkedin', ad: 'LinkedIn' },
  { id: 'x', ad: 'X' },
] as const
import { usdBicimle } from './baglanti.js'

interface FrozenStep {
  readonly stepId: string
  readonly verb: string
  readonly capability: string | null
  readonly metered: boolean
  readonly providerId: string | null
  readonly confidence: 'green' | 'amber' | 'red' | null
  readonly estimatedCost: { readonly low: { micros: string }; readonly high: { micros: string } }
}

interface Frozen {
  readonly digest: string
  readonly corpusCommit: string
  readonly registryCommit: string
  readonly frozenAt: string
  readonly steps: readonly FrozenStep[]
  readonly totalLow: { readonly micros: string }
  readonly totalHigh: { readonly micros: string }
}

interface Sonuc {
  readonly ok: boolean
  readonly hata?: string
  readonly frozen?: Frozen
  readonly bloklar?: readonly { readonly kind: string; readonly mesaj: string }[]
}

/** Güven noktası: renk TEK BAŞINA anlam taşımaz — glyph + metin de var (§12.6). */
const guvenIsareti = (c: FrozenStep['confidence']): { glyph: string; metin: string } => {
  if (c === 'green') return { glyph: '●', metin: 'kesin fiyat' }
  if (c === 'amber') return { glyph: '◐', metin: 'doğrulanmamış fiyat' }
  if (c === 'red') return { glyph: '○', metin: 'fiyatlanamaz' }
  return { glyph: '·', metin: 'ücretsiz adım' }
}

export const RunLauncher = ({
  pipeline,
  baslayinca,
}: {
  readonly pipeline: string
  /**
   * Başlatma tuttuğunda koşu ekranına geç.
   *
   * ⚠ ⚠ **BAŞLATTIKTAN SONRA EKRAN AYNI KALIYORDU:** tek işaret "başlatıldı: run_…"
   * satırıydı ve o satır bir kimlikten ibaretti. Kullanıcı süreci başlatıp nereye
   * bakacağını bilmiyordu. Başlatan ekran, başlattığı şeyi göstermek zorunda.
   */
  readonly baslayinca?: (runId: string) => void
}): React.JSX.Element => {
  // ⚠ ⚠ **TÜR SEÇİMİ EKRANDA YOKTU.** Hat yalnız komut paletinden geliyordu ve ekran
  // `instagram-post`a kilitliydi; on bir hat varken kullanıcı karosel bile
  // seçemiyordu. Liste SUNUCUDAN, dizinden okunuyor — elle yazılmış bir menü, yeni
  // bir hat eklendiği gün sessizce eskirdi.
  const [hat, setHat] = useState(pipeline)
  const [hatlar, setHatlar] = useState<readonly string[]>([])
  // ⚠ ⚠ **KUTU BOŞ GİDER, KONUYU AGENT SEÇER.** Önceki sürüm kutuyu bir corpus
  // başlığıyla dolduruyordu ve o seçim deterministikti: her koşuda aynı konu.
  // Doğru okuma "insan konu yazmasın", "konu olmasın" değil — hat `konu-sec`
  // adımında markanın kayıtlarına bakıp seçiyor ve gerekçesini deftere yazıyor.
  const [sistemSecsin, setSistemSecsin] = useState(false)
  const [adaylar, setAdaylar] = useState<readonly { baslik: string; tur: string }[]>([])
  const [adayHata, setAdayHata] = useState<string | null>(null)
  const [sonuc, setSonuc] = useState<Sonuc | null>(null)
  const [tavan, setTavan] = useState('')
  const [konu, setKonu] = useState('')
  // ⚠ ⚠ **ŞABLON SEÇİMİ MOTORDA VARDI, PANELDE YOKTU.** `sablonSecimiIcin` çalıştırma
  // parametresi `sablon`ı zaten okuyor ve CLI `--sablon sahne` ile geçirebiliyordu.
  // Var olan bir yeteneğin arayüzü yoksa, kullanıcı için o yetenek YOKTUR.
  // ⚠ Boş = "hat seçsin": seçim bir zorunluluk değil, bir HAK.
  const [sablon, setSablon] = useState('')
  // ⚠ Varsayılan `firma` — bugünkü davranış. Yeni bir seçenek eklemek, var olan
  // davranışı sessizce değiştirmemeli.
  const [icerikKipi, setIcerikKipi] = useState('firma')
  // ⚠ ⚠ **VARSAYILAN DÖRDÜ BİRDEN — depo sahibinin kararı.** *"Her gönderi için yayın
  // 4 platformda da standart, anormal bi durum olmadıkça varsayılan dördü de."* İlk
  // sürüm yalnız `instagram` seçiyordu ve gerekçesi *"dört platforma göndermek insanın
  // AÇIK kararı olmalı"* idi — ama sahibi o kararı ZATEN verdi ve varsayılan olarak
  // verdi. Her koşuda üç kutu işaretlemek, verilmiş bir kararı her seferinde yeniden
  // sordurmak olurdu.
  const [platformlar, setPlatformlar] = useState<readonly string[]>([
    'instagram',
    'facebook',
    'linkedin',
    'x',
  ])
  const [sablonlar, setSablonlar] = useState<
    readonly { id: string; ad: string; kullanilabilir: boolean }[]
  >([])
  // ⚠ ⚠ **HER HAT KENDİ KONUSUNU SEÇEMEZ** ve panel bunu bilmeden vaat ediyordu:
  // `instagram-post` konusuz başlatıldı, o hatta `konu-sec` adımı yok, konu boş kaldı
  // ve ikinci adım `MISSING_TOPIC` ile düştü — ekranda boş bir koşu.
  const [konuSecebilen, setKonuSecebilen] = useState<readonly string[]>([])
  // Başlatma sonucu: `null` henüz denenmedi. Hata TOAST DEĞİL, düğmenin yanında —
  // içeriğin olacağı yerde, kopyalanabilir kimlikle (§12.6).
  const [baslatma, setBaslatma] = useState<{ ok: boolean; mesaj: string } | null>(null)

  // ⚠ Türetilmiş: hat değişince kutu kendiliğinden doğru duruma geçiyor. Ayrı bir
  // state tutmak, iki gerçek arasında bir senkron borcu açardı.
  const konuSecebilir = konuSecebilen.includes(hat)

  const yukle = useCallback(async (): Promise<void> => {
    const q = new URLSearchParams({ pipeline: hat })
    if (tavan.trim() !== '') q.set('tavan_mikros', String(Math.round(Number(tavan) * 1_000_000)))
    // ⚠ Şablon PLANA da giriyor: parametre adım kısıtlarına ekleniyor ve özete girer.
    // Panel onsuz dondurup CLI onunla koşarsa özetler ayrışır ve R-07 reddeder.
    if (sablon !== '') q.set('sablon', sablon)
    try {
      const r = await fetch(`/api/plan?${q.toString()}`)
      setSonuc((await r.json()) as Sonuc)
    } catch {
      setSonuc({ ok: false, hata: 'sunucuya ulaşılamıyor' })
    }
  }, [hat, tavan, sablon])

  useEffect(() => {
    setHat(pipeline)
  }, [pipeline])

  useEffect(() => {
    void (async () => {
      try {
        const j = (await (await fetch('/api/katalog')).json()) as {
          sablonlar?: readonly { id: string; ad: string; kullanilabilir: boolean }[]
        }
        setSablonlar(j.sablonlar ?? [])
      } catch {
        // Katalog okunamazsa seçim kutusu boş kalır ve hat kendi seçer — eski davranış.
        setSablonlar([])
      }
    })()
  }, [])

  useEffect(() => {
    void (async () => {
      try {
        const r = (await (await fetch('/api/hatlar')).json()) as {
          hatlar?: string[]
          konuSecebilen?: string[]
        }
        setHatlar(r.hatlar ?? [])
        setKonuSecebilen(r.konuSecebilen ?? [])
      } catch {
        setHatlar([])
        setKonuSecebilen([])
      }
    })()
  }, [])

  useEffect(() => {
    void yukle()
  }, [yukle])

  useEffect(() => {
    if (!sistemSecsin) return
    void (async () => {
      const r = (await (await fetch('/api/konu-adaylari')).json()) as {
        ok?: boolean
        adaylar?: { baslik: string; tur: string }[]
        hata?: string
      }
      setAdaylar(r.adaylar ?? [])
      setAdayHata(r.ok === true ? null : (r.hata ?? 'adaylar okunamadı'))
    })()
  }, [sistemSecsin])

  /**
   * Başlat — **ekranda gösterilen planın ÖZETİYLE** (R-07).
   *
   * Özet gönderilmeseydi sunucu bugünün planını kurup koşardı ve kullanıcı ekranda
   * gördüğünden başka bir şeye onay vermiş olurdu. CLI özeti karşılaştırıyor; dünya
   * değiştiyse çalıştırma başlamadan duruyor.
   */
  const baslat = useCallback(
    async (digest: string): Promise<void> => {
      setBaslatma(null)
      try {
        const r = await fetch('/api/calistir', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            pipeline: hat,
            konu: sistemSecsin && konuSecebilir ? '' : konu,
            konuyuSistemSecsin: sistemSecsin && konuSecebilir,
            sablon,
            icerikKipi,
            platformlar,
            planDigest: digest,
          }),
        })
        const j = (await r.json()) as { ok: boolean; runId?: string; hata?: string }
        setBaslatma(
          j.ok
            ? { ok: true, mesaj: `başlatıldı: ${j.runId ?? ''} — koşu ekranı açılıyor` }
            : { ok: false, mesaj: j.hata ?? 'başlatılamadı' }
        )
        if (j.ok && j.runId !== undefined && baslayinca !== undefined) baslayinca(j.runId)
      } catch {
        setBaslatma({ ok: false, mesaj: 'sunucuya ulaşılamıyor' })
      }
    },
    // ⚠ ⚠ **`sablon` VE `konuSecebilir` BURADA YOKTU — ŞABLON SEÇİMİ SESSİZCE
    // YOK SAYILIYORDU.** Bağımlılık listesi eksik olunca `useCallback` ilk render'ın
    // kapanışını saklıyor: kullanıcı menüden bir şablon seçiyor, DOM değeri değişiyor,
    // ama isteğe giden `sablon` HEP `''` oluyordu. Panelden başlatılan her koşuda hat
    // şablonu kendi seçiyordu ve kimse fark etmiyordu — çünkü çıktı yine geçerli bir
    // karoseldi, sadece İSTENEN şablon değildi.
    // ⚠ Playwright ile ölçüldü: menüde `memphis` seçiliyken giden gövde
    // `"sablon":""`. DOM ile isteğin AYRIŞTIĞI yer tam olarak bu satırdı.
    // ⚠ `konuSecebilir` de aynı listede yoktu: hat değişince konu-seçebilirliği
    // değişiyor ama işleyici eski cevabı taşıyordu.
    // ⚠ `icerikKipi` de BURADA: yukarıdaki ders bir kez ödendi, ikincisi olmasın.
    [hat, konu, sablon, icerikKipi, platformlar, sistemSecsin, konuSecebilir, baslayinca]
  )

  if (sonuc === null) return <p>plan kuruluyor…</p>
  if (!sonuc.ok || sonuc.frozen === undefined) {
    return <div className="hata-kutusu">{sonuc.hata ?? 'plan kurulamadı'}</div>
  }

  const f = sonuc.frozen
  const bloklar = sonuc.bloklar ?? []
  const kilitli = bloklar.length > 0

  return (
    <section className="launcher">
      <header className="detay-baslik">
        <h2>Çalıştır — {hat}</h2>
        {/* Aralık, tek sayı DEĞİL. Güven noktası adım tablosunda. */}
        <span className="olcum">
          {usdBicimle(f.totalLow.micros)} – {usdBicimle(f.totalHigh.micros)}
          <span className="birim">tahmini</span>
        </span>
      </header>

      <div className="filtre-cubugu">
        <label htmlFor="tavan">bütçe tavanı (USD)</label>
        <input
          id="tavan"
          className="filtre-arama"
          inputMode="decimal"
          placeholder="tavan yok"
          value={tavan}
          onChange={(e) => setTavan(e.target.value)}
        />
      </div>

      {/* Kilit SEBEBİYLE gösterilir. Devre dışı bir düğme, sebebi yazmadan
          "neden yapamıyorum" sorusunu cevapsız bırakır. */}
      {kilitli ? (
        <ul className="kilit-listesi">
          {bloklar.map((b) => (
            <li key={b.kind} className="ret-mesaji">
              ⊘ {b.mesaj}
              {/* ⚠ Sebep DOĞRU ama çare değildi: "sağlayıcısı çözülmemiş" cümlesi
                  panelin başındaki insana ne yapacağını söylemiyor. Kilidin tek
                  gerçek sebebi sunucunun anahtarsız kalkmış olması. */}
              {b.kind === 'unpriced' ? (
                <div className="olcum">
                  çare: sunucuyu anahtarlarla kaldır —{' '}
                  <code>sops exec-env secrets/secrets.enc.yaml &apos;just dev&apos;</code> (ya da
                  yalnızca <code>just dev</code>; kabuk sops&apos;u kendisi çağırır)
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}

      <table className="kayit-tablosu">
        <thead>
          <tr>
            <th>adım</th>
            <th>fiil</th>
            <th>sağlayıcı</th>
            <th>güven</th>
            <th>tahmin</th>
          </tr>
        </thead>
        <tbody>
          {f.steps.map((s) => {
            const g = guvenIsareti(s.confidence)
            return (
              <tr key={s.stepId}>
                <td>{s.stepId}</td>
                <td className="olcum">{s.verb}</td>
                <td>{s.providerId ?? '—'}</td>
                <td title={g.metin}>
                  <span aria-hidden="true">{g.glyph}</span> {g.metin}
                </td>
                <td className="olcum">
                  {s.metered
                    ? `${usdBicimle(s.estimatedCost.low.micros)} – ${usdBicimle(s.estimatedCost.high.micros)}`
                    : '—'}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      <p className="baglam-neden">
        {/* Donmuş plan KİMLİĞİ ekranda: onay bu özete veriliyor ve çalıştırma aynı
            özetle koşuyor. Görünmeseydi "aynı plan mı" sorusu sorulamazdı. */}
        donmuş plan <span className="olcum">{f.digest.slice(7, 19)}</span> · corpus{' '}
        <span className="olcum">{f.corpusCommit.slice(0, 8)}</span> · registry{' '}
        <span className="olcum">{f.registryCommit.slice(0, 8)}</span>
      </p>

      <label>
        tür{' '}
        <select value={hat} onChange={(e) => setHat(e.target.value)}>
          {(hatlar.length === 0 ? [hat] : hatlar).map((h) => (
            <option key={h} value={h}>
              {h}
            </option>
          ))}
        </select>
      </label>

      <label>
        konu{' '}
        <input
          type="text"
          value={sistemSecsin ? '' : konu}
          disabled={sistemSecsin}
          onChange={(e) => setKonu(e.target.value)}
          placeholder={sistemSecsin ? 'hat seçecek' : 'ör. imalatta fire ölçümü'}
        />
      </label>

      {/* ⚠ Adaylar başlatmadan ÖNCE gösteriliyor: insan neyin arasından seçileceğini
          görmeden onay vermemeli (Yasa 2). Seçimi uç değil, hattın agent'ı yapıyor. */}
      <label>
        <input
          type="checkbox"
          checked={sistemSecsin && konuSecebilir}
          disabled={!konuSecebilir}
          onChange={(e) => setSistemSecsin(e.target.checked)}
        />{' '}
        {konuSecebilir
          ? '✨ konuyu sistem seçsin — kutu boş gider, hat markanın kayıtlarından seçer'
          : `⊘ bu hat kendi konusunu seçemiyor (konu-sec adımı yok) — konuyu yaz`}
      </label>

      {/* ⚠ Şablon seçimi OPSİYONEL: boş bırakılırsa hat kendi seçer (ritim ölçümü +
          son kullanılanlardan kaçınma). Zorunlu kılmak, insanı her koşuda katalog
          bilgisine mahkûm ederdi; hiç sunmamak ise var olan bir yeteneği gizliyordu. */}
      {/* ⚠ ⚠ **PLATFORM ÇOKLU SEÇİLİYOR.** Depo sahibi: *"üretilen insta karosel bile
          olsa yayın adımına gelince hangi platformlarda yayınlanmak istendiği
          seçilebilsin"*. Her platformun metni AYRI üretiliyor (`yayin-metni` adımı) ve
          her biri kendi sınırına karşı doğrulanıyor.
          ⚠ Onay kutusu, açılır liste DEĞİL: `select multiple`da kaç şeyin seçili olduğu
          tek bakışta görünmüyor ve yanlışlıkla tek seçime düşürmek bir tıklama.
          ⛔ Seçim yalnız HAZIRLIK — gönderim insan onayından sonra ve bugün hiç
          yapılmıyor. */}
      <fieldset className="giris-alan">
        <legend>yayın platformları</legend>
        {PLATFORM_SECENEKLERI.map((p) => (
          <label key={p.id} style={{ marginInlineEnd: '12px' }}>
            <input
              type="checkbox"
              checked={platformlar.includes(p.id)}
              onChange={(e) =>
                setPlatformlar(
                  e.target.checked ? [...platformlar, p.id] : platformlar.filter((x) => x !== p.id)
                )
              }
            />{' '}
            {p.ad}
          </label>
        ))}
      </fieldset>

      {/* ⚠ ⚠ **İÇERİK KİPİ: üretilenin NEREDEN geldiği.** Depo sahibi iki seçenek
          istedi — firma içeriği (ürün/firma tanıtımı) ve genel içerik. Genel kipin
          kapsamı KASTEN geniş ve kapalı bir liste değil; tarif istemde yaşıyor
          (`kipTarifi`), burada değil — iki yerde yazılan bir kural bir yerde unutulur.
          ⚠ Kip koşunun defterine yazılıyor: altı ay sonra "bu iddia bizim kaydımızdan
          mı geliyordu" sorusunun cevabı olsun diye. */}
      <label className="giris-alan">
        içerik kipi{' '}
        <select value={icerikKipi} onChange={(e) => setIcerikKipi(e.target.value)}>
          <option value="firma">firma — ürün ve firma tanıtımı, marka kayıtlarından</option>
          <option value="genel">genel — bilgi veren içerik, kapsam geniş</option>
        </select>
      </label>

      {sablonlar.length === 0 ? null : (
        <label className="giris-alan">
          şablon{' '}
          <select value={sablon} onChange={(e) => setSablon(e.target.value)}>
            <option value="">✨ hat seçsin (ritme ve geçmişe bakar)</option>
            {sablonlar
              .filter((s) => s.kullanilabilir)
              .map((s) => (
                <option key={s.id} value={s.id}>
                  {s.ad}
                </option>
              ))}
          </select>
        </label>
      )}

      {!sistemSecsin ? null : adayHata !== null ? (
        <p className="ret-mesaji">⊘ {adayHata}</p>
      ) : (
        <details className="aday-listesi">
          <summary>
            {adaylar.length} aday · seçimi `konu-sec` adımı yapacak, gerekçesi deftere yazılacak
          </summary>
          <ul>
            {adaylar.map((a) => (
              <li key={a.baslik}>
                <span className="rozet">{a.tur}</span> {a.baslik}
              </li>
            ))}
          </ul>
        </details>
      )}

      {/* Konu boşken de KİLİTLİ: hat neyi üreteceğini bilmeden koşarsa para harcar
          ve çıktı kullanılamaz. Sebep düğmenin metninde yazıyor, gizlenmiyor. */}
      <button
        type="button"
        disabled={kilitli || (konu.trim() === '' && !sistemSecsin)}
        className="baslat"
        onClick={() => void baslat(f.digest)}
      >
        {kilitli
          ? 'Başlat — KİLİTLİ'
          : sistemSecsin
            ? 'Başlat — konuyu hat seçecek'
            : konu.trim() === ''
              ? 'Başlat — konu gerek'
              : 'Başlat'}
      </button>

      {baslatma === null ? null : (
        <p role={baslatma.ok ? 'status' : 'alert'} className="olcum">
          {baslatma.mesaj}
        </p>
      )}
    </section>
  )
}
