// Performans panosu (§13, §11.2 · FAZ-7.9).
//
// **Sıralama bir İDDİADIR ve yalnız karşılaştırılabilir satırlar için yapılır.**
// Kümülatif toplam yaşla kirlenir: üç ay önceki bir post ile dünkü postu "toplam
// erişim"e göre yan yana koymak, eski postu kazanan ilan etmektir. Pano bu yüzden
// sabit bir pencereyi (yayın + 7 gün) sıralar.
//
// **Sıralanamayanlar GİZLENMEZ.** Gizlenen satır, olmayan bir tamlık iddiasıdır:
// "en iyi üç post" listesi, ölçülemeyen on postu görünmez kılarak yalan söyler.
// Her satır NEDEN dışarıda olduğunu kendi cümlesiyle söyler.
//
// **Corpus'a yazan düğme YOK.** Geri besleme `just hook-oner` ile insan tarafından
// tetiklenir ve `draft` olarak iner; onay git commit'idir (R-14). Panoya bir "corpus'a
// yaz" düğmesi koymak, onayı bir tıklamaya indirmek olurdu.

import { useEffect, useState } from 'react'

interface Durum {
  readonly kind: 'siralanabilir' | 'olgunlasmadi' | 'eksik_olcum' | 'metrik_yok'
  readonly deger?: number
  readonly kalanGun?: number
  readonly eksikGun?: string
  readonly metrik?: string
}

interface Satir {
  readonly externalId: string
  readonly platform: string
  readonly runId: string | null
  readonly publishedAt: string
  readonly durum: Durum
  readonly olculenGun: number
}

interface Cevap {
  readonly pano: {
    readonly metrik: string
    readonly siralama: readonly Satir[]
    readonly disarida: readonly Satir[]
  }
  readonly olcumHatasi: { readonly kind: string } | null
}

const aciklama = (d: Durum): string => {
  if (d.kind === 'olgunlasmadi') {
    return `pencere dolmadı — ${d.kalanGun} gün var (kötü DEĞİL, henüz belli değil)`
  }
  if (d.kind === 'eksik_olcum') {
    return `${d.eksikGun} ölçülmemiş — düşük performans DEĞİL, ölçüm yok`
  }
  return `'${d.metrik}' metriği toplanmamış — sağlayıcı vermemiş olabilir`
}

export const PerformansPanosu = (): React.JSX.Element => {
  const [c, setC] = useState<Cevap | null>(null)
  const [hata, setHata] = useState<string | null>(null)

  useEffect(() => {
    void fetch('/api/performans')
      .then(async (x) =>
        x.ok
          ? ((await x.json()) as Cevap)
          : Promise.reject(new Error('yayın defteri okunamadı — henüz yayın yok olabilir'))
      )
      .then(setC)
      .catch((e: Error) => setHata(e.message))
  }, [])

  if (hata !== null) return <p role="alert">{hata}</p>
  if (c === null) return <p>yükleniyor…</p>

  return (
    <section>
      <h1>Performans</h1>
      <p className="mono">metrik: {c.pano.metrik} · pencere: yayın + 7 gün</p>
      <p role="note">
        Sıralama <strong>sabit pencerede</strong> yapılır. Kümülatif toplam yaşla kirlenir: eski
        post, daha iyi olduğu için değil daha uzun süredir yayında olduğu için kazanırdı.
      </p>

      {c.olcumHatasi === null ? null : (
        <p role="alert">
          Ölçüm defteri okunamadı ({c.olcumHatasi.kind}) — aşağıdaki satırlar “eksik ölçüm”
          görünüyor, bu bir <strong>içerik sonucu değil</strong>.
        </p>
      )}

      <h2>Sıralanabilir</h2>
      {c.pano.siralama.length === 0 ? (
        <p>karşılaştırılabilir yayın yok — sıralama iddiası da yok</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>varlık</th>
              <th>7. gün</th>
              <th>ölçülen gün</th>
              <th>çalıştırma</th>
            </tr>
          </thead>
          <tbody>
            {c.pano.siralama.map((s, i) => (
              <tr key={s.externalId}>
                <td className="mono">{i + 1}</td>
                <td className="mono">
                  {s.platform} · {s.externalId}
                </td>
                <td className="mono">{s.durum.deger}</td>
                <td className="mono">{s.olculenGun}</td>
                <td className="mono">{s.runId ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h2>Sıralamaya girmeyenler</h2>
      {c.pano.disarida.length === 0 ? (
        <p>hepsi karşılaştırılabilir</p>
      ) : (
        <ul>
          {c.pano.disarida.map((s) => (
            <li key={s.externalId}>
              <span className="mono">
                {s.platform} · {s.externalId}
              </span>{' '}
              — {aciklama(s.durum)}
            </li>
          ))}
        </ul>
      )}

      <p role="note">
        Kazanan bir hook’u corpus’a taşımak için <span className="mono">just hook-oner</span>. Öneri{' '}
        <strong>draft</strong> iner; onay bir git commit’idir — panodaki bir düğme değil.
      </p>
    </section>
  )
}
