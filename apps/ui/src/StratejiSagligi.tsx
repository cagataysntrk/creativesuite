// Strategy Health (§11, §12.9 · R-32 · FAZ-4.16).
//
// **Her bulgu bir İŞ MADDESİDİR, bir uyarı değil.** "3 kayıt kırık" bir alarmdır;
// "şu 3 kayıt, şu satırda, şu sebeple" bir iş listesidir — ve aradaki fark, panonun
// açıldıktan sonra kapatılıp kapatılmayacağını belirler. Bu yüzden her satır kaydın
// YOLUNU taşır ve doğrudan kayda gider.
//
// **Rozet değil şiddet ayrımı** (§4b): `blocking` yayını durdurur, `uyari` bir borçtur.
// İkisini tek listede aynı görünümle göstermek, ikisini de görmezden gelmeye yol açar.
//
// **Boş pano bir ölçümdür, bir kutlama değil.** "0 bulgu" ancak kaç kaydın tarandığı
// yazılıysa bir şey söyler: 0 kayıt tarandığında da 0 bulgu çıkar.

import { useEffect, useState } from 'react'

interface Bulgu {
  readonly tur: string
  readonly siddet: 'blocking' | 'uyari'
  readonly kayitId: string
  readonly yol: string
  readonly mesaj: string
}

interface Yanit {
  readonly ok: boolean
  readonly hata?: string
  readonly aktifEra?: string
  readonly taranan?: number
  readonly bulgular?: readonly Bulgu[]
  readonly okunamayan?: readonly { readonly yol: string; readonly neden: string }[]
  readonly blocking?: number
  readonly uyari?: number
}

const TUR_ETIKET: Readonly<Record<string, string>> = {
  lexicon: 'metin',
  aktarim: 'dönem-aşırı kanıt',
  suresi_gecmis: 'emekli',
  gecerliligi_bitmis: 'geçerliliği bitti',
  yeniden_dogrula: 'çürüme tarihi geçti',
  alanlar_nesirde: 'alanlar nesirde',
}

export const StratejiSagligi = (): React.JSX.Element => {
  const [y, setY] = useState<Yanit | null>(null)

  useEffect(() => {
    void fetch('/api/strateji-sagligi')
      .then((r) => r.json() as Promise<Yanit>)
      .then(setY)
      .catch(() => setY({ ok: false, hata: 'sunucuya ulaşılamadı' }))
  }, [])

  if (y === null) return <p>yükleniyor…</p>
  if (!y.ok) return <p role="alert">strateji sağlığı okunamadı — {y.hata}</p>

  const bulgular = y.bulgular ?? []
  const blocking = bulgular.filter((b) => b.siddet === 'blocking')
  const uyarilar = bulgular.filter((b) => b.siddet === 'uyari')

  return (
    <section>
      <h1>Strateji sağlığı</h1>
      <p className="mono">
        aktif dönem {y.aktifEra} · {y.taranan} kayıt tarandı · {y.blocking} blocking · {y.uyari}{' '}
        uyarı
      </p>

      {/* Okunamayan kayıt SESSİZCE atlanmaz: taranmayan kayıt, temiz kayıt değildir. */}
      {(y.okunamayan ?? []).length === 0 ? null : (
        <div role="alert">
          <h3>Okunamayan kayıtlar</h3>
          <ul>
            {(y.okunamayan ?? []).map((o) => (
              <li key={o.yol}>
                <span className="mono">{o.yol}</span> — {o.neden}
              </li>
            ))}
          </ul>
        </div>
      )}

      <h2>Yayını durduranlar ({blocking.length})</h2>
      {blocking.length === 0 ? (
        <p>
          {y.taranan === 0
            ? 'hiç kayıt taranmadı — "0 bulgu" burada bir ölçüm değil'
            : 'yok — taranan kayıtların hiçbiri yayını durdurmuyor'}
        </p>
      ) : (
        <ul>
          {blocking.map((b, i) => (
            <li key={`${b.yol}-${i}`}>
              <a href={`/api/kayitlar/${encodeURIComponent(b.kayitId)}/etki`}>
                <span className="mono">{b.yol}</span>
              </a>{' '}
              · {TUR_ETIKET[b.tur] ?? b.tur} · {b.mesaj}
            </li>
          ))}
        </ul>
      )}

      <h2>Borçlar ({uyarilar.length})</h2>
      {uyarilar.length === 0 ? (
        <p>yok</p>
      ) : (
        <ul>
          {uyarilar.map((b, i) => (
            <li key={`${b.yol}-${i}`}>
              <a href={`/api/kayitlar/${encodeURIComponent(b.kayitId)}/etki`}>
                <span className="mono">{b.yol}</span>
              </a>{' '}
              · {TUR_ETIKET[b.tur] ?? b.tur} · {b.mesaj}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
