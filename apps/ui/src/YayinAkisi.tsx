// HEDEF: apps/ui/src/YayinAkisi.tsx
//
// Yayın akışı — hazır · planlanmış · geçmiş (FAZ-19.12 · madde 5).
//
// ⚠ ⚠ **TAKVİM KURALI YAZILMIŞTI ama EKRANI YOKTU.** `yayin-plani.ts` ölçülmüş bir
// sorundan doğdu (ardışık aynı şablon 5/18, dengesizlik 4,0×), testi vardı, kimse
// çağırmıyordu. Bu depoda tekrar eden zincir kopukluğu: modül var, ulaşan yok.
//
// ⚠ ⚠ **ÜÇ DURUM AYRI GÖSTERİLİYOR ve karıştırmak bir kayıp olurdu:** kapıda BEKLEYEN
// (insan kararı lazım), yayına HAZIR (onaylandı, sıraya girecek), YAYINLANMIŞ (bitti).
// Tek listede toplamak *"şu an ne yapmam gerekiyor"* sorusunu cevapsız bırakırdı.
//
// ⚠ ⚠ **BAŞLANGIÇ TARİHİ PANELDEN GİDİYOR, SUNUCUDAN DEĞİL (R-06).** Sunucu `new Date()`
// çağırsaydı aynı istek iki gün üst üste iki farklı takvim verirdi ve *"bu planı
// onayladım"* demek anlamsızlaşırdı. Bugünü bilen taraf tarayıcı; kural sunucuda.
//
// ⛔ **BU EKRAN HİÇBİR ŞEY YAYINLAMIYOR.** Takvim bir ÖNERİ: ne zaman, hangi sırayla.
// Gönderim `PUBLISH` fiilinin işi ve depo sahibinin duran talimatı gereği bugün hiç
// yapılmıyor.

import type React from 'react'
import { useCallback, useEffect, useState } from 'react'

interface PlanliYayin {
  readonly runId: string
  readonly sablon: string
  readonly tarih: string
  readonly hafta: number
}

interface Akis {
  readonly ok: boolean
  readonly hazir: number
  /** Şablonu bilinmediği için planlanamayan onaylı koşu sayısı. */
  readonly sablonsuz: number
  readonly kapida: readonly {
    readonly runId: string
    readonly sablon: string
    readonly konu: string
    readonly kapi: string
  }[]
  readonly gecmis: readonly {
    readonly runId: string
    readonly sablon: string
    readonly konu: string
    readonly zaman: string
  }[]
  readonly plan: {
    readonly gonderiler: readonly PlanliYayin[]
    readonly uyarilar: readonly { readonly tur: string; readonly aciklama: string }[]
    readonly dagilim: Readonly<Record<string, number>>
  }
}

/** Bugünün ISO tarihi — takvimin başlangıcı için varsayılan. */
const bugun = (): string => new Date().toISOString().slice(0, 10)

export const YayinAkisi = (): React.JSX.Element => {
  const [haftadaKac, setHaftadaKac] = useState(3)
  const [baslangic, setBaslangic] = useState(bugun)
  const [veri, setVeri] = useState<Akis | null>(null)
  const [hata, setHata] = useState<string | null>(null)

  const yukle = useCallback(async (): Promise<void> => {
    setHata(null)
    try {
      const r = await fetch(
        `/api/yayin-akisi?haftadaKac=${String(haftadaKac)}&baslangic=${baslangic}`
      )
      const j = (await r.json()) as Akis & { hata?: string }
      if (!j.ok) {
        setHata(j.hata ?? 'yayın akışı okunamadı')
        return
      }
      setVeri(j)
    } catch (e) {
      setHata(String(e))
    }
    // ⚠ `haftadaKac` ve `baslangic` bağımlılık listesinde: bu depoda eksik bir liste
    // bir kez panelin şablon seçimini sessizce yok saymıştı.
  }, [haftadaKac, baslangic])

  useEffect(() => {
    void yukle()
  }, [yukle])

  const haftalar = [...new Set(veri?.plan.gonderiler.map((g) => g.hafta) ?? [])].sort(
    (a, b) => a - b
  )

  return (
    <div className="ekran">
      <h2>Yayın akışı</h2>

      <div className="filtre-cubuk">
        <label>
          haftada kaç post{' '}
          <select value={haftadaKac} onChange={(e) => setHaftadaKac(Number(e.target.value))}>
            {[1, 2, 3, 4, 5, 7].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
        <label>
          başlangıç{' '}
          <input type="date" value={baslangic} onChange={(e) => setBaslangic(e.target.value)} />
        </label>
      </div>

      {hata !== null ? <p className="ret-mesaji">⊘ {hata}</p> : null}
      {veri === null ? (
        <p className="bos">yükleniyor…</p>
      ) : (
        <>
          <p className="olcum">
            {veri.hazir} yayına hazır · {veri.kapida.length} kapıda · {veri.gecmis.length}{' '}
            yayınlanmış
            {/* ⚠ Planlanamayanı SAYIYORUZ: "3 hazır" demek, 5 koşunun sessizce
                kaybolduğu bir ekranda yanıltıcı bir doğruluk olurdu. */}
            {veri.sablonsuz === 0
              ? ''
              : ` · ${String(veri.sablonsuz)} onaylı koşu şablonsuz (katalog öncesi) — takvime giremiyor`}
          </p>

          {veri.plan.uyarilar.length === 0 ? null : (
            <ul className="akis-uyarilar">
              {veri.plan.uyarilar.map((u) => (
                <li key={u.aciklama} className="is-uyari">
                  ⚠ {u.aciklama}
                </li>
              ))}
            </ul>
          )}

          {/* ── TAKVİM: hafta hafta ─────────────────────────────────────── */}
          {veri.hazir === 0 ? (
            <p className="bos">
              yayına hazır üretim yok — bir koşu `insan-onayi` kapısından geçince burada belirir.
            </p>
          ) : (
            haftalar.map((h) => (
              <section key={h} className="akis-hafta">
                <h3>{h}. hafta</h3>
                <ul className="akis-gonderiler">
                  {veri.plan.gonderiler
                    .filter((g) => g.hafta === h)
                    .map((g) => (
                      <li key={g.runId}>
                        <span className="olcum">{g.tarih}</span>
                        {/* ⚠ Şablon rozeti ŞART: çeşitlilik kuralının çalıştığını
                            gözle görmenin tek yolu şablonları yan yana görmek. */}
                        <strong>{g.sablon}</strong>
                        <a href={`#/kosu/${g.runId}`}>{g.runId.slice(4, 16)}</a>
                      </li>
                    ))}
                </ul>
              </section>
            ))
          )}

          {/* ── DAĞILIM: denge gözle görünsün ───────────────────────────── */}
          {Object.keys(veri.plan.dagilim).length === 0 ? null : (
            <section className="akis-dagilim">
              <h3>şablon dağılımı</h3>
              <ul>
                {Object.entries(veri.plan.dagilim)
                  .sort((a, b) => b[1] - a[1])
                  .map(([s, n]) => (
                    <li key={s}>
                      <span className="olcum">{s}</span> {n}
                    </li>
                  ))}
              </ul>
            </section>
          )}

          {/* ── KAPIDA BEKLEYENLER ──────────────────────────────────────── */}
          <section className="akis-hafta">
            <h3>kapıda bekleyen</h3>
            {veri.kapida.length === 0 ? (
              <p className="bos">kapıda bekleyen koşu yok.</p>
            ) : (
              <ul className="akis-gonderiler">
                {veri.kapida.map((k) => (
                  <li key={k.runId}>
                    <span className="olcum">{k.kapi}</span>
                    <strong>{k.sablon}</strong>
                    <a href={`#/kosu/${k.runId}`}>
                      {k.konu === '' ? k.runId.slice(4, 16) : k.konu}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* ── GEÇMİŞ ──────────────────────────────────────────────────── */}
          <section className="akis-hafta">
            <h3>yayınlanmış</h3>
            {veri.gecmis.length === 0 ? (
              // ⚠ "Hiç yayınlanmadı" AÇIKÇA yazılıyor: boş bir liste, defterin
              // okunamadığıyla karıştırılabilirdi.
              <p className="bos">henüz hiçbir üretim yayınlanmadı.</p>
            ) : (
              <ul className="akis-gonderiler">
                {veri.gecmis.map((g) => (
                  <li key={g.runId}>
                    <span className="olcum">{g.zaman.slice(0, 10)}</span>
                    <strong>{g.sablon}</strong>
                    <a href={`#/kosu/${g.runId}`}>
                      {g.konu === '' ? g.runId.slice(4, 16) : g.konu}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  )
}
