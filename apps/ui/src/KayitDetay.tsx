// Record Detail (§12.9, §13 · FAZ-4.4).
//
// Üç soru, üç bölüm: **bu kayıt ne diyor** · **nasıl bu hâle geldi** (git zaman
// çizgisi) · **neyi etkiledi** (ters indeks).
//
// Üçüncüsü ekranın var olma sebebi: bir olguyu düzeltmek, hangi çıktıların yanlış
// olduğunu bilmeden düzeltmektir. "Düzelttim" demek yetmez; düzeltilenin nereye
// gittiğini bilmek gerekir.

import { useEffect, useState } from 'react'
import type { KayitSatiri } from './corpus.js'
import { QaEkrani } from './QaEkrani.js'

interface Commit {
  readonly sha: string
  readonly date: string
  readonly subject: string
}

interface Kullanim {
  readonly runId: string
  readonly pipeline: string
  readonly createdAt: string
  readonly section: string
  readonly reason: string
  readonly manifestSaglam: boolean
}

interface Etki {
  readonly kullanimlar: readonly Kullanim[]
  readonly ozet: string
}

export interface DetayOzellikleri {
  readonly kayit: KayitSatiri
  readonly uzerineKapat: () => void
}

const yolParcala = (path: string): { tip: string; slug: string } | null => {
  const m = /^corpus\/([^/]+)\/(.+)\.md$/.exec(path)
  return m === null ? null : { tip: m[1] ?? '', slug: m[2] ?? '' }
}

export const KayitDetay = ({ kayit, uzerineKapat }: DetayOzellikleri): React.JSX.Element => {
  const [gecmis, setGecmis] = useState<readonly Commit[] | null>(null)
  const [etki, setEtki] = useState<Etki | null>(null)
  const [qa, setQa] = useState<string | null>(null)

  useEffect(() => {
    const p = yolParcala(kayit.path)
    if (p === null) return
    void fetch(`/api/kayitlar/${p.tip}/${p.slug}/gecmis`)
      .then((r) => r.json() as Promise<{ commitler: Commit[] }>)
      .then((j) => setGecmis(j.commitler))
      .catch(() => setGecmis([]))
    void fetch(`/api/kayitlar/${encodeURIComponent(kayit.id)}/etki`)
      .then((r) => r.json() as Promise<Etki>)
      .then(setEtki)
      .catch(() => setEtki(null))
  }, [kayit.id, kayit.path])

  return (
    <section className="detay">
      <header className="detay-baslik">
        <h2>{kayit.title}</h2>
        <button type="button" onClick={uzerineKapat}>
          Listeye dön
        </button>
      </header>

      <dl className="detay-kimlik">
        <dt>id</dt>
        <dd className="olcum">{kayit.id}</dd>
        <dt>tip</dt>
        <dd>{kayit.type}</dd>
        <dt>durum</dt>
        <dd>{kayit.status}</dd>
        <dt>dönem</dt>
        <dd className="olcum">{kayit.era_id}</dd>
        <dt>yol</dt>
        <dd className="olcum">{kayit.path}</dd>
      </dl>

      <h3>Zaman çizgisi</h3>
      {/* Ayrı bir değişiklik günlüğü TUTULMUYOR: git zaten tutuyor ve ikinci bir
          günlük onunla ayrışabilirdi (12. yasa). */}
      {gecmis === null ? (
        <p>yükleniyor…</p>
      ) : gecmis.length === 0 ? (
        <p className="bos">bu dosya için git geçmişi yok — henüz commit edilmemiş olabilir</p>
      ) : (
        <ul className="zaman-cizgisi">
          {gecmis.map((c) => (
            <li key={c.sha}>
              <span className="olcum">{c.sha.slice(0, 8)}</span>{' '}
              <span className="olcum">{c.date.slice(0, 10)}</span> {c.subject}
            </li>
          ))}
        </ul>
      )}

      {qa === null ? null : <QaEkrani runId={qa} />}

      <h3>Etkilediği çalıştırmalar</h3>
      {etki === null ? (
        <p>yükleniyor…</p>
      ) : (
        <>
          {/* Özet HER ZAMAN yazılır — "etkisi yok" da bir cevaptır ve sessiz bir boş
              liste onu "henüz yüklenmedi" ile karıştırır. */}
          <p className="etki-ozet">{etki.ozet}</p>
          {etki.kullanimlar.length === 0 ? null : (
            <table className="kayit-tablosu">
              <thead>
                <tr>
                  <th>çalıştırma</th>
                  <th>pipeline</th>
                  <th>bölüm</th>
                  <th>neden dahil edildi</th>
                  <th>manifest</th>
                </tr>
              </thead>
              <tbody>
                {etki.kullanimlar.map((k) => (
                  <tr key={k.runId}>
                    <td className="olcum">
                      {/* Çalıştırmanın tolerans raporuna giden yol: bir olgu yanlışsa
                          o çıktının ÖLÇÜMLERİ de sorgulanmalı. */}
                      <button type="button" className="baglanti" onClick={() => setQa(k.runId)}>
                        {k.runId.slice(0, 12)}
                      </button>
                    </td>
                    <td>{k.pipeline}</td>
                    <td>{k.section}</td>
                    <td>{k.reason}</td>
                    <td>
                      {k.manifestSaglam ? (
                        '✓ sağlam'
                      ) : (
                        <span style={{ color: 'var(--role-state-error)' }}>
                          ⊘ kusurlu — yayınlanamaz
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </section>
  )
}
