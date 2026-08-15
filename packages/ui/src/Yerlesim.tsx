// Placement Preview — gerçek platform chrome'u (§9.1, §12.9 · FAZ-4.9).
//
// **Güvenli alan bir uyarı değil, bir ÇERÇEVE.** Reels'te platform UI'ı görselin
// ÜSTÜNE biner: üstte profil ve kapatma, altta etkileşim düğmeleri ve açıklama.
// Başlık o bantlara düşerse okunmaz — ve bunu ancak yayınladıktan sonra fark edersiniz.
//
// Overlay simüle edilmiş bir telefon değil: **ölçülmüş bir maske.** Süslü bir cihaz
// çerçevesi çizmek, ölçünün kendisini bir illüstrasyonun arkasına gizlerdi.

import type { Placement, SafeBand } from '@suite/contracts'

export interface Tasma {
  readonly edge: 'top' | 'bottom' | 'start' | 'end'
  readonly overflowPx: number
}

export interface YerlesimOnizlemeOzellikleri {
  readonly placement: Placement
  readonly band: SafeBand
  /** Spec kaç gün önce doğrulandı — 90 günü aşınca ekranda UYARI olur (§9.1). */
  readonly yasGun: number
  /** Önizlenecek içerik kutusu, master piksel koordinatlarında. */
  readonly icerik?: {
    readonly x: number
    readonly y: number
    readonly width: number
    readonly height: number
  }
  readonly tasmalar?: readonly Tasma[]
}

const yuzde = (v: number, toplam: number): string => `${(v / toplam) * 100}%`

export const YerlesimOnizleme = ({
  placement: p,
  band,
  yasGun,
  icerik,
  tasmalar = [],
}: YerlesimOnizlemeOzellikleri): React.JSX.Element => {
  const bayat = yasGun > 90

  return (
    <figure className="yerlesim">
      <figcaption className="yerlesim-baslik">
        <strong>{p.id}</strong>{' '}
        <span className="olcum">
          {p.width}×{p.height}
        </span>{' '}
        <span className="baglam-neden">
          tolerans ±%{p.aspectTolerancePercent} · doğrulandı {p.verifiedAt}
          {/* Spec YAŞI görünür: üç aylık drift denetimi (§9.1) yalnız bir cron işi
              olsaydı, operatör bayat bir ölçüye göre yargı verirdi. */}
          {bayat ? ` · ⚠ ${yasGun} gün önce — yeniden doğrulanmalı` : ''}
        </span>
      </figcaption>

      <div
        className="yerlesim-tuval"
        style={{ aspectRatio: `${p.width} / ${p.height}` }}
        data-tasma={tasmalar.length > 0}
      >
        {p.safeArea === null ? null : (
          <>
            {/* Chrome bantları: üst ve alt AYRI çizilir çünkü farklı şeyler örtüyorlar
                ve farklı yüzdeler taşıyorlar. */}
            <span
              className="chrome chrome-ust"
              style={{ blockSize: yuzde(band.y, p.height) }}
              aria-hidden="true"
            />
            <span
              className="chrome chrome-alt"
              style={{ blockSize: yuzde(p.height - band.y - band.height, p.height) }}
              aria-hidden="true"
            />
            <span
              className="chrome chrome-yan chrome-sol"
              style={{ inlineSize: yuzde(band.x, p.width) }}
              aria-hidden="true"
            />
            <span
              className="chrome chrome-yan chrome-sag"
              style={{ inlineSize: yuzde(band.x, p.width) }}
              aria-hidden="true"
            />
          </>
        )}

        {/* Güvenli bandın kendisi: kesikli çerçeve, içerik kutusunun hedefi. */}
        <span
          className="guvenli-bant"
          style={{
            insetInlineStart: yuzde(band.x, p.width),
            insetBlockStart: yuzde(band.y, p.height),
            inlineSize: yuzde(band.width, p.width),
            blockSize: yuzde(band.height, p.height),
          }}
          aria-hidden="true"
        />

        {icerik === undefined ? null : (
          <span
            className="icerik-kutusu"
            data-tasma={tasmalar.length > 0}
            style={{
              insetInlineStart: yuzde(icerik.x, p.width),
              insetBlockStart: yuzde(icerik.y, p.height),
              inlineSize: yuzde(icerik.width, p.width),
              blockSize: yuzde(icerik.height, p.height),
            }}
            aria-hidden="true"
          />
        )}
      </div>

      {/* Taşma SESSİZ KALMAZ ve piksel söyler: "taşıyor" düzeltilebilir bir bilgi
          değil, "üstten 69px taşıyor" düzeltilebilir bir bilgidir. */}
      {tasmalar.length === 0 ? (
        <p className="baglam-neden">
          kullanılabilir bant{' '}
          <span className="olcum">
            {band.width}×{band.height}
          </span>
        </p>
      ) : (
        <ul className="tasma-listesi">
          {tasmalar.map((t) => (
            <li key={t.edge} className="ret-mesaji">
              ✗ içerik güvenli alandan{' '}
              {t.edge === 'top'
                ? 'üstten'
                : t.edge === 'bottom'
                  ? 'alttan'
                  : t.edge === 'start'
                    ? 'soldan'
                    : 'sağdan'}{' '}
              <span className="olcum">{t.overflowPx}px</span> taşıyor — platform UI'ı örtecek
            </li>
          ))}
        </ul>
      )}
    </figure>
  )
}
