// Run Launcher (§8.3, §12.9 · R-07 · FAZ-4.6b).
//
// **Başlat düğmesi, gösterilen plana bağlıdır.** Ekranda bir tahmin gösterip başka bir
// planı koşturmak, onayı anlamsız kılar — bu yüzden plan burada DONAR ve donmuş hâli
// çalıştırmaya geri verilir (R-07).
//
// **Tahmin bir BANT.** Tek sayı göstermek, üst uçtan gelen faturayı hata gibi
// hissettirir; oysa aralık onu zaten söylüyordu (§8.3).

import { useCallback, useEffect, useState } from 'react'
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
  // Başlatma sonucu: `null` henüz denenmedi. Hata TOAST DEĞİL, düğmenin yanında —
  // içeriğin olacağı yerde, kopyalanabilir kimlikle (§12.6).
  const [baslatma, setBaslatma] = useState<{ ok: boolean; mesaj: string } | null>(null)

  const yukle = useCallback(async (): Promise<void> => {
    const q = new URLSearchParams({ pipeline: hat })
    if (tavan.trim() !== '') q.set('tavan_mikros', String(Math.round(Number(tavan) * 1_000_000)))
    try {
      const r = await fetch(`/api/plan?${q.toString()}`)
      setSonuc((await r.json()) as Sonuc)
    } catch {
      setSonuc({ ok: false, hata: 'sunucuya ulaşılamıyor' })
    }
  }, [hat, tavan])

  useEffect(() => {
    setHat(pipeline)
  }, [pipeline])

  useEffect(() => {
    void (async () => {
      try {
        const r = (await (await fetch('/api/hatlar')).json()) as { hatlar?: string[] }
        setHatlar(r.hatlar ?? [])
      } catch {
        setHatlar([])
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
            konu: sistemSecsin ? '' : konu,
            konuyuSistemSecsin: sistemSecsin,
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
    [hat, konu, sistemSecsin, baslayinca]
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
          checked={sistemSecsin}
          onChange={(e) => setSistemSecsin(e.target.checked)}
        />{' '}
        ✨ konuyu sistem seçsin — kutu boş gider, hat markanın kayıtlarından seçer
      </label>

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
