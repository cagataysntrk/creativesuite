// Compliance Panel (§11.3 · R-33 · D-23 · FAZ-8.3).
//
// **Rozet değil, limit karşısında okuma** (§4b). "Uyumlu ✓" hiçbir şey söylemez;
// bu ekran hangi iddianın neye DAYANDIĞINI ve neyin ölçülmediğini söyler.
//
// **Üç ayrı bilinmezlik, üç ayrı cümle** (D-175): sidecar yok → ölçülemedi ·
// dayanak yok → beyan · ifşa damgası yok → yayın bloklu. Üçü de "uyumsuz" değil ve
// hiçbiri "uyumlu" değil.
//
// **"Uyumlu işaretle" düğmesi YOK ve olmayacak.** Uyum kaydı üretim anında basılır;
// panodan düzeltilebilseydi dayanaksız iddia bir tıklamaya inerdi — ve dayanaksız
// iddia zaten sorunun kendisi.

import { useEffect, useState } from 'react'

interface Durum {
  readonly kind: 'tam' | 'dayanaksiz' | 'ifsa_eksik' | 'olculemedi'
  readonly dayanak?: string
  readonly neden?: string
}

interface Satir {
  readonly digest: string
  readonly sourceRunId: string
  readonly durum: Durum
  readonly aiGenerated: boolean | null
  readonly disclosureRequired: boolean | null
  readonly yayinlanabilir: boolean
}

interface Pano {
  readonly satirlar: readonly Satir[]
  readonly olculemeyen: number
  readonly blokluSayisi: number
}

/** Glyph rengin YANINDA, yerine değil (§12.6 · alarm yönetimi). */
const ISARET: Readonly<Record<string, string>> = {
  tam: '✓',
  dayanaksiz: '✗',
  ifsa_eksik: '✗',
  olculemedi: '?',
}

const aciklama = (d: Durum): string => {
  if (d.kind === 'tam') return `dayanak: ${d.dayanak}`
  if (d.kind === 'dayanaksiz') return 'iddia var, DAYANAK yok — beyan denetlenemez'
  if (d.kind === 'ifsa_eksik') return 'AI ifşası gerekli, damga yok — yayın BLOKLU (Md. 50(2))'
  return `ölçülemedi (${d.neden}) — "uyumsuz" değil, "uyumlu" da değil`
}

/**
 * Durumun İNSANA söylediği şey — sayı değil, EYLEM.
 *
 * ⚠ ⚠ **EKRAN "130 YAYINLANAMAZ" DİYORDU ve insan ne yapacağını bilmiyordu.** Sayı
 * doğruydu ama eylemsizdi: bu varlıklar görünür ifşa katmanı YOKKEN üretildi ve
 * damga üretim anında basılır — sonradan retrofit imkânsız (Yasa 7 · R-11). Yani
 * "düzelt" diye bir seçenek yok; seçenek ya karantina ya yeniden üretim.
 *
 * Bir uyum panosunun işi suçlamak değil, sıradaki adımı söylemek.
 */
const NE_YAPMALI: Readonly<Record<string, string>> = {
  tam: 'yayına hazır — kapılar bu varlığı geçirir',
  ifsa_eksik:
    'görünür ifşa katmanı yokken üretildi; damga sonradan basılamaz (R-11). ' +
    'Ya karantinaya al ya konuyu yeniden üret.',
  dayanaksiz: 'iddianın dayanağı kaydedilmemiş — bu varlık denetlenemez, yeniden üret.',
  olculemedi: 'sidecar okunamadı; "uyumsuz" DEĞİL. Önce dosyayı incele.',
}

export const UyumPanosu = (): React.JSX.Element => {
  const [p, setP] = useState<Pano | null>(null)
  const [hata, setHata] = useState(false)
  // ⚠ 134 satırlık düz liste, cevabı içinde saklıyor: insanın sorusu "hangi durumda
  // kaç tane ve ne yapmalıyım", "dosya dosya ne var" değil.
  const [fDurum, setFDurum] = useState('')

  useEffect(() => {
    void fetch('/api/uyum')
      .then((x) => x.json() as Promise<Pano>)
      .then(setP)
      .catch(() => setHata(true))
  }, [])

  if (hata) return <p role="alert">uyum panosu alınamadı — sunucu çalışıyor mu?</p>
  if (p === null) return <p>yükleniyor…</p>

  return (
    <section>
      <h1>Uyum</h1>
      <p className="mono">
        {p.satirlar.length} varlık · {p.blokluSayisi} yayınlanamaz · {p.olculemeyen} ölçülemedi
      </p>

      {/* ⚠ Durum ÖZETİ önce: liste ikinci. Bir sayıyı okumak için 134 satır taramak
          gerekmemeli ve her durumun yanında NE YAPILACAĞI yazıyor. */}
      <ul className="uyum-ozet">
        {Object.entries(
          p.satirlar.reduce<Record<string, number>>((a, s) => {
            a[s.durum.kind] = (a[s.durum.kind] ?? 0) + 1
            return a
          }, {})
        )
          .sort((a, b) => b[1] - a[1])
          .map(([kind, adet]) => (
            <li key={kind}>
              <button
                type="button"
                className={fDurum === kind ? 'secili' : ''}
                onClick={() => setFDurum(fDurum === kind ? '' : kind)}
              >
                {ISARET[kind] ?? '·'} {kind} · {adet}
              </button>{' '}
              <span className="olcum">{NE_YAPMALI[kind] ?? ''}</span>
            </li>
          ))}
      </ul>
      <p role="note">
        <strong>Onay ima eden yapay insan üretilmez</strong> (Reklam Yönetmeliği Md. 27/12) ve iddia{' '}
        <strong>dayanağıyla</strong> kurulur — dayanaksız iddia bir beyandır. EU AI Act Md. 50{' '}
        <strong>2 Ağustos 2026’dan beri uygulanabilir</strong>.
      </p>

      {p.satirlar.length === 0 ? (
        <p>henüz varlık yok — ölçülecek uyum kaydı da yok</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>·</th>
              <th>varlık</th>
              <th>durum</th>
              <th>AI</th>
              <th>çalıştırma</th>
            </tr>
          </thead>
          <tbody>
            {p.satirlar
              .filter((s) => fDurum === '' || s.durum.kind === fDurum)
              .map((s) => (
                <tr key={s.digest}>
                  <td>{ISARET[s.durum.kind] ?? '·'}</td>
                  <td className="mono">{s.digest.slice(0, 20)}</td>
                  <td>
                    {aciklama(s.durum)}
                    {s.yayinlanabilir ? null : <strong> — YAYINLANAMAZ</strong>}
                  </td>
                  <td className="mono">
                    {s.aiGenerated === null
                      ? 'ölçülmedi'
                      : s.aiGenerated
                        ? `üretilmiş${s.disclosureRequired === true ? ' · ifşa gerekli' : ''}`
                        : 'değil'}
                  </td>
                  <td className="mono">{s.sourceRunId}</td>
                </tr>
              ))}
          </tbody>
        </table>
      )}

      <p role="note">
        Bu ekranda <strong>“uyumlu işaretle” düğmesi yok</strong>: uyum kaydı üretim anında basılır.
        Panodan düzeltilebilseydi, dayanaksız iddia bir tıklamaya inerdi.
      </p>
    </section>
  )
}
