// Doctor ekranı (§13, §16 · FAZ-4.17).
//
// **Bir ay ihmalden sonra açılacak İLK ekran.** Dönen kişinin ilk ihtiyacı temiz bir
// repo değil, DOĞRU BİR TABLO: ne bozuldu, ne çürüdü, ne ölçülemedi.
//
// **Düzeltme düğmesi YOK ve olmayacak.** Otomatik düzeltme, bir ay sonra dönen
// kullanıcıya ne olduğunu gizler — ve gizlenen şey tam da öğrenmesi gereken şeydir.
// Bu bir üslup tercihi değil: `doctor-salt-okur` kapısı hem modülde hem burada yazma
// çağrısı arıyor ve bulursa kırmızıya dönüyor.
//
// **Atlanan denetim gizlenmez.** "İndeks kontrol edilmedi" ile "indeks sağlam" farklı
// sonuçlardır (§12.6); ikincisini ima eden bir boşluk, raporun tamamını yalan yapar.

import { useEffect, useState } from 'react'

interface Bulgu {
  readonly alan: string
  readonly siddet: 'kritik' | 'uyari' | 'bilgi'
  readonly mesaj: string
  readonly hedef: string | null
}

interface Rapor {
  readonly bugun: string
  readonly bulgular: readonly Bulgu[]
  readonly kritik: number
  readonly uyari: number
  readonly kosanDenetimler: readonly string[]
  readonly atlananDenetimler: readonly { readonly ad: string; readonly neden: string }[]
}

const ISARET: Readonly<Record<string, string>> = {
  kritik: '✗',
  uyari: '⚠',
  bilgi: '·',
}

export const Doktor = (): React.JSX.Element => {
  const [r, setR] = useState<Rapor | null>(null)
  const [hata, setHata] = useState(false)

  useEffect(() => {
    void fetch('/api/doktor')
      .then((x) => x.json() as Promise<Rapor>)
      .then(setR)
      .catch(() => setHata(true))
  }, [])

  if (hata) return <p role="alert">doctor raporu alınamadı — sunucu çalışıyor mu?</p>
  if (r === null) return <p>yükleniyor…</p>

  return (
    <section>
      <h1>Doctor</h1>
      <p className="mono">
        {r.bugun} · {r.kritik} kritik · {r.uyari} uyarı · {r.bulgular.length} bulgu
      </p>
      <p role="note">
        Bu ekran <strong>rapor eder, hiçbir şeyi değiştirmez</strong>. Otomatik düzeltme, bir ay
        sonra dönen kullanıcıya ne olduğunu gizler.
      </p>

      {r.bulgular.length === 0 ? (
        <p>
          {r.kosanDenetimler.length === 0
            ? 'hiçbir denetim koşmadı — "bulgu yok" burada bir ölçüm değil'
            : 'bulgu yok'}
        </p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>·</th>
              <th>alan</th>
              <th>bulgu</th>
            </tr>
          </thead>
          <tbody>
            {r.bulgular.map((b, i) => (
              <tr key={`${b.alan}-${i}`}>
                <td>{ISARET[b.siddet] ?? '·'}</td>
                <td className="mono">{b.alan}</td>
                <td>
                  {b.mesaj}
                  {b.hedef === null ? null : (
                    <>
                      {' — '}
                      <span className="mono">{b.hedef}</span>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h2>Koşan denetimler</h2>
      <p className="mono">{r.kosanDenetimler.join(' · ') || 'hiçbiri'}</p>

      {r.atlananDenetimler.length === 0 ? null : (
        <>
          {/* Atlanan denetim bir BOŞLUK değil, bir SONUÇTUR: raporun kapsamını daraltır. */}
          <h2>Atlanan denetimler</h2>
          <ul>
            {r.atlananDenetimler.map((a) => (
              <li key={a.ad}>
                <span className="mono">{a.ad}</span> — {a.neden}
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  )
}
