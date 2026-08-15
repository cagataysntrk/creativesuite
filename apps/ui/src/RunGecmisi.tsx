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

export const RunGecmisi = (): React.JSX.Element => {
  const [liste, setListe] = useState<readonly Ozet[] | null>(null)
  const [secili, setSecili] = useState<string | null>(null)
  const [detay, setDetay] = useState<Detay | null>(null)

  useEffect(() => {
    void fetch('/api/calistirmalar')
      .then((r) => r.json() as Promise<{ calistirmalar: readonly Ozet[] }>)
      .then((j) => setListe(j.calistirmalar))
      .catch(() => setListe([]))
  }, [])

  useEffect(() => {
    if (secili === null) return
    setDetay(null)
    void fetch(`/api/calistirmalar/${encodeURIComponent(secili)}`)
      .then((r) => (r.ok ? (r.json() as Promise<Detay>) : null))
      .then(setDetay)
      .catch(() => setDetay(null))
  }, [secili])

  if (liste === null) return <p>yükleniyor…</p>

  return (
    <section>
      <h1>Çalıştırma geçmişi</h1>
      {liste.length === 0 ? (
        <p>Henüz çalıştırma yok — geçmiş boş bir liste, bir hata değil.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>çalıştırma</th>
              <th>hat</th>
              <th>bilgi ağacı</th>
              <th>tahmin üst</th>
              <th>gerçek</th>
              <th>sapma</th>
              <th>durum</th>
            </tr>
          </thead>
          <tbody>
            {liste.map((r) => (
              <tr key={r.runId} onClick={() => setSecili(r.runId)}>
                <td>{r.runId}</td>
                <td>{r.pipeline}</td>
                <td className="mono">{kisaSha(r.corpusCommit)}</td>
                <td className="mono">{usdBicimle(r.tahminUstMikros)}</td>
                <td className="mono">{usdBicimle(r.gercekMikros)}</td>
                <td className="mono">
                  {r.sapmaYuzde === null ? '—' : `${r.sapmaYuzde.toFixed(1)}%`}
                  {r.onemli ? ' ✗ sapma' : ''}
                </td>
                <td>
                  {r.stoppedAt !== null ? `durdu: ${r.stoppedAt}` : 'tamamlandı'}
                  {r.awaitingGate !== null ? ` · kapı bekliyor: ${r.awaitingGate}` : ''}
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
            <button type="button" disabled={!detay.tekrar.rerun.mumkun}>
              rerun — {detay.tekrar.rerun.ne}
            </button>
            {detay.tekrar.rerun.neden === null ? null : <p>{detay.tekrar.rerun.neden}</p>}
            <button type="button" disabled={!detay.tekrar.replay.mumkun}>
              replay — {detay.tekrar.replay.ne}
            </button>
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
