// Tolerans okuması — sistemin İMZA ÖĞESİ (§11.1, §12.9 · R-35 · FAZ-4.8).
//
// **Rozet göstermiyoruz, ÖLÇÜM gösteriyoruz.** "Marka uyumu ✓" hiçbir şey söylemez:
// sınırın hemen içinde mi, çok uzağında mı, hangi yöne gidiyor — hiçbiri görünmez.
// `ΔE 2,4 / limit 5,0` üçünü de tek satırda söyler.
//
// Bu bir estetik tercih değil, müşterinin kendi dünyasının dili: imalatta bir parça
// "uygun ✓" damgası almaz, **tolerans bandında bir okuma** alır.
//
// **Renk TEK BAŞINA anlam taşımaz** (§12.8, alarm yönetimi kuralı): her durum glyph +
// renk + METİN taşır. Renk körlüğü bir yana, öğrenilmemiş bir renk eşlemesi hiçbir şey
// söylemez ve bu ekranın tek işi bir şey söylemek.

import type { QaReport, ToleranceReading, ToleranceStatus } from '@suite/contracts'

/** Sayı biçimi `tr-TR` (§12.2): binlik nokta, ondalık virgül. */
const sayi = (v: number, basamak = 1): string =>
  new Intl.NumberFormat('tr-TR', {
    minimumFractionDigits: basamak,
    maximumFractionDigits: basamak,
  }).format(v)

export interface DurumIsareti {
  readonly glyph: string
  readonly metin: string
  readonly token: string
}

/**
 * Durum işareti — üçü BİRDEN, hiçbiri tek başına değil.
 *
 * Dışa açık, çünkü test bunu doğrudan sınar: "her durum glyph + metin taşıyor mu"
 * sorusunun cevabı bir DOM taramasından değil, buradan gelmeli.
 */
export const durumIsareti = (s: ToleranceStatus): DurumIsareti => {
  if (s === 'out') {
    return { glyph: '✗', metin: 'SINIR DIŞI', token: 'var(--role-state-error)' }
  }
  if (s === 'warn') {
    return { glyph: '!', metin: 'uyarı bandında', token: 'var(--role-state-warn)' }
  }
  return { glyph: '✓', metin: 'tolerans içi', token: 'var(--role-state-ok)' }
}

/**
 * Bandın sağ ucu. `lower` metrikte limitin %25 ötesi: sınır dışı bir okuma da BANT
 * İÇİNDE görünmeli — kenardan taşan bir işaret "ne kadar dışında" sorusunu cevaplayamaz.
 */
const tavanDegeri = (r: ToleranceReading): number =>
  r.direction === 'lower' ? r.limit * 1.25 : Math.max(r.value, r.limit) * 1.25

/** Yüzde konumu, 0–100 arası kırpılmış. */
export const konumYuzde = (v: number, tavan: number): number =>
  Math.max(0, Math.min(100, (v / (tavan || 1)) * 100))

export const ToleransOkumasi = ({
  reading: r,
  basamak = 1,
}: {
  reading: ToleranceReading
  basamak?: number
}): React.JSX.Element => {
  const tavan = tavanDegeri(r)
  const i = durumIsareti(r.status)

  return (
    <div className="tolerans" data-durum={r.status}>
      <span className="tolerans-etiket">{r.label}</span>

      {/* Ölçülen her sayı mono ve tabular; birim KARDEŞ span'de 0.85em (§12.2). */}
      <span className="olcum tolerans-deger">
        {sayi(r.value, basamak)}
        {r.unit === '' ? null : <span className="birim">{r.unit}</span>}
      </span>

      <span className="tolerans-bant" aria-hidden="true">
        {/* Uyarı eşiği ve limit AYRI çizgiler: yalnız limit olsaydı sistem "geçti/kaldı"
            ikilisine düşer ve limite doğru SÜRÜKLENME görünmezdi. */}
        <span
          className="bant-uyari"
          style={{ insetInlineStart: `${konumYuzde(r.warn, tavan)}%` }}
        />
        <span
          className="bant-limit"
          style={{ insetInlineStart: `${konumYuzde(r.limit, tavan)}%` }}
        />
        <span
          className="bant-olcum"
          style={{
            insetInlineStart: `${konumYuzde(r.value, tavan)}%`,
            background: i.token,
          }}
        />
      </span>

      <span className="olcum tolerans-limit">
        <span className="birim">limit</span>
        {sayi(r.limit, basamak)}
        {r.unit === '' ? null : <span className="birim">{r.unit}</span>}
      </span>

      {/* glyph + renk + metin — ÜÇÜ BİRDEN (§12.8). */}
      <span className="tolerans-durum" style={{ color: i.token }}>
        <span aria-hidden="true">{i.glyph}</span> {i.metin}
      </span>
    </div>
  )
}

export const ToleransRaporu = ({ report }: { report: QaReport }): React.JSX.Element => {
  if (report.readings.length === 0) {
    // **Ölçülemeyen metrik RAPORA GİRMEZ, sıfır olarak girmez** — boş bir rapor
    // "her şey yolunda" DEĞİL, "hiçbir şey ölçülmedi" demektir ve ikisi zıt sonuçlar.
    return <p className="bos">ölçüm yok — QA çalıştırılmamış (bu "geçti" DEĞİLDİR)</p>
  }

  return (
    <div className="tolerans-raporu">
      {report.readings.map((r) => (
        <ToleransOkumasi key={r.metric} reading={r} />
      ))}
      <p className={report.blocked ? 'ret-mesaji' : 'baglam-neden'}>
        {report.blocked
          ? `✗ ${report.readings.filter((r) => r.status === 'out').length} okuma SINIR DIŞI — varlık yayınlanamaz`
          : report.warnings > 0
            ? `! ${report.warnings} okuma uyarı bandında — limite sürükleniyor`
            : `${report.readings.length} okuma tolerans içi`}
      </p>
    </div>
  )
}
