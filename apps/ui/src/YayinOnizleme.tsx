// HEDEF: apps/ui/src/YayinOnizleme.tsx
//
// Dört platform için yayın önizlemesi (FAZ-19.12 · madde 4).
//
// ⚠ ⚠ **DEPO SAHİBİNİN İKİ SORUSU VAR ve önizleme ikisini de cevaplamalı:** *"hem
// karosellerin doğru sıra ile mi paylaşılacağını görelim hem platform özel açıklamalar"*.
// Sıra bir SAYI değil bir GÖRÜNTÜ: slaytları yan yana görmeden "doğru sırada mı"
// sorusu cevaplanamaz.
//
// ⚠ ⚠ **KATLANMA NOKTASI GÖRSEL OLARAK İŞARETLENİYOR — asıl bilgi bu.** Instagram'a
// 2.200 karakter yazılabilir ama akışta ilk ~125'i görünür. Sayıyı yazmak yetmiyor:
// metnin NEREDE kesildiğini görmek, kancanın oraya sığıp sığmadığını tek bakışta
// söylüyor. Kesim noktasından sonrası soluklaştırılıyor ve araya bir çizgi giriyor.
//
// ⚠ ⚠ **SINIRLAR SUNUCUDAN GELİYOR, BURADA YAZILI DEĞİL.** `apps/ui` tarayıcı katmanı
// ve `@suite/contracts`e uzanamıyor (`rings` kapısı). Platform LİSTESİ için
// `yayin-platformlari` kapısıyla korunan bir kopya kabul edildi; SINIR SAYILARI için
// kopya kabul edilmedi — dört sayı yerine bir uç. Sayı değişince panel kendiliğinden
// doğruyu gösteriyor.
//
// ⛔ **BURADA HİÇBİR GÖNDERİM YOK.** Önizleme yalnız GÖSTERİR. Gönderim `PUBLISH`
// fiilinin işi, insan onayından sonra ve bugün hiç yapılmıyor.

import type React from 'react'
import { useCallback, useEffect, useState } from 'react'

interface PlatformSiniri {
  readonly id: string
  readonly ad: string
  readonly metinTavani: number
  readonly katlanmaOncesi: number
  readonly karoselTavani: number | null
  readonly kaynak: string
}

interface Onizleme {
  readonly ok: boolean
  readonly sablon: string | null
  readonly konu: string | null
  readonly slaytlar: readonly { readonly digest: string; readonly alt: string }[]
  readonly metinler: Readonly<Record<string, string>>
  readonly uyarilar: readonly string[]
  readonly platformlar: readonly PlatformSiniri[]
  readonly muzik?: {
    readonly apiEkleyebilir: boolean
    readonly reklamGuvenli: readonly string[]
    readonly reklamiEngeller: string
    readonly not: string
  }
}

/**
 * Metni katlanma noktasından ikiye böler.
 *
 * ⚠ `[...m]` — kod noktası sayılıyor, `length` DEĞİL. Emoji UTF-16'da iki birim ve
 * `slice` ile kesmek bir emojiyi ORTASINDAN bölerdi; ekranda bozuk bir karakter çıkar
 * ve kesim noktası olduğundan erken görünürdü.
 */
const katla = (m: string, n: number): readonly [string, string] => {
  const k = [...m]
  return k.length <= n ? [m, ''] : [k.slice(0, n).join(''), k.slice(n).join('')]
}

export const YayinOnizleme = ({ runId }: { readonly runId: string }): React.JSX.Element => {
  const [veri, setVeri] = useState<Onizleme | null>(null)
  const [hata, setHata] = useState<string | null>(null)

  const yukle = useCallback(async (): Promise<void> => {
    try {
      const r = await fetch(`/api/kosu/${runId}/yayin-onizleme`)
      const j = (await r.json()) as Onizleme & { hata?: string }
      if (!j.ok) {
        setHata(j.hata ?? 'önizleme okunamadı')
        return
      }
      setVeri(j)
    } catch (e) {
      setHata(String(e))
    }
  }, [runId])

  useEffect(() => {
    void yukle()
  }, [yukle])

  if (hata !== null) return <p className="ret-mesaji">⊘ {hata}</p>
  if (veri === null) return <p className="bos">önizleme yükleniyor…</p>

  const slaytSayisi = veri.slaytlar.length

  return (
    <section className="yayin-onizleme">
      <h3>
        yayın önizlemesi{veri.sablon === null ? '' : ` · ${veri.sablon}`}
        {veri.konu === null ? '' : ` · ${veri.konu}`}
      </h3>

      {/* ── SIRA: slaytlar yan yana ─────────────────────────────────────── */}
      {slaytSayisi === 0 ? (
        <p className="bos">slayt yok — koşu henüz render edilmemiş.</p>
      ) : (
        <div className="onizleme-slaytlar">
          {veri.slaytlar.map((s, i) => (
            <figure key={s.digest === '' ? String(i) : s.digest}>
              {/* ⚠ Sıra numarası GÖRSELİN ÜSTÜNDE: "doğru sırada mı" sorusu ancak
                  numarayla birlikte cevaplanabilir. */}
              <span className="onizleme-sira">{String(i + 1).padStart(2, '0')}</span>
              {s.digest === '' ? (
                <span className="bos">damgasız</span>
              ) : (
                <img src={`/api/varlik/${s.digest}`} alt={s.alt} loading="lazy" />
              )}
            </figure>
          ))}
        </div>
      )}

      {/* ── PLATFORM BAŞINA METİN ve KATLANMA ───────────────────────────── */}
      {veri.platformlar.map((p) => {
        const m = veri.metinler[p.id]
        const kesim = p.karoselTavani !== null && slaytSayisi > p.karoselTavani
        if (m === undefined || m === '')
          return (
            <article key={p.id} className="onizleme-platform">
              <h4>{p.ad}</h4>
              {/* ⚠ "Üretilmedi" AÇIKÇA yazılıyor: uydurma bir örnek metin göstermek,
                  olmayan bir işi yapılmış sanmaya yol açardı. */}
              <p className="bos">metin henüz üretilmedi (`yayin-metni` adımı koşmadı).</p>
            </article>
          )
        const [gorunen, gizli] = katla(m, p.katlanmaOncesi)
        const uzunluk = [...m].length
        return (
          <article key={p.id} className="onizleme-platform">
            <h4>
              {p.ad}{' '}
              <span className={uzunluk > p.metinTavani ? 'is-uyari' : 'olcum'}>
                {uzunluk} / {p.metinTavani}
              </span>
              {kesim ? (
                <span className="is-uyari">
                  ⊘ {slaytSayisi} slayt · tavan {p.karoselTavani}
                </span>
              ) : null}
            </h4>
            <p className="onizleme-metin">
              {gorunen}
              {gizli === '' ? null : (
                <>
                  {/* ⚠ Kesim ÇİZGİYLE işaretleniyor ve sonrası soluk: "devamı"
                      arkasında kalan kısmın nerede başladığı GÖRÜNMELİ. */}
                  <span className="onizleme-kesim" aria-hidden="true" />
                  <span className="onizleme-gizli">{gizli}</span>
                </>
              )}
            </p>
            <p className="olcum">
              {gizli === ''
                ? 'tamamı akışta görünüyor'
                : `ilk ~${p.katlanmaOncesi} karakter akışta görünüyor, gerisi "devamı" arkasında`}
            </p>
          </article>
        )
      })}

      {/* ── MÜZİK ve REKLAM ────────────────────────────────────────────
          ⚠ ⚠ **DEPO SAHİBİNİN ŞARTI: müzik reklam vermeyi engellememeli.** Asıl kural
          "müzik var mı" değil, HANGİ KÜTÜPHANEDEN: trend kütüphaneden bir parça
          gönderiyi organik yayınlatır ama ÖNE ÇIKARILAMAZ hâle getirir — Meta öne
          çıkarma anında sesi tarayıp tanıtımı reddediyor. Sorun yayın anında değil
          REKLAM anında çıkıyor ve o an kreatif çoktan üretilmiş olur.
          ⚠ Bu kutu bir HATIRLATMA, bir denetim değil: müziği sistem eklemiyor, insan
          uygulamada ekliyor. Sistemin yapabileceği tek şey kuralı göz hizasında
          tutmak. */}
      {veri.muzik === undefined ? null : (
        <p className="onizleme-muzik">
          <strong>müzik</strong> — {veri.muzik.reklamGuvenli.join(' ya da ')} kullan.{' '}
          <span className="is-uyari">{veri.muzik.reklamiEngeller}</span> seçilirse gönderi
          yayınlanır ama ÖNE ÇIKARILAMAZ. {veri.muzik.not}
        </p>
      )}

      {veri.uyarilar.length === 0 ? null : (
        <ul className="onizleme-uyarilar">
          {veri.uyarilar.map((u) => (
            <li key={u} className="is-uyari">
              ⚠ {u}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
