// HEDEF: apps/ui/src/GonderiKutusu.tsx
//
// Bir gönderinin YAYIN KARARLARI — tarih, platform, çıkar, elle yayınlandı, geri al.
//
// ⚠ ⚠ **AYRI BİR DOSYA, ÇÜNKÜ İKİ EKRAN AYNI ŞEYİ SORUYOR.** Takvim ekranında bir
// gönderiye tıklayınca ve koşu detayında *"istediğim tarihe özel planlama"* derken
// sorulan soru aynı: bu üretim ne zaman, hangi platformlara. İki yerde ayrı yazmak bu
// depoda iki kez ısırdı — `kosu-sablonu.ts` tam da bu yüzden var. Biri düzelir, öteki
// unutulur.
//
// ⚠ ⚠ **KUTU KENDİ YAZIYOR.** Kararı çağırana verip "sen POST'la" demek, iki çağırana
// iki farklı doğrulama ve iki farklı hata mesajı yazdırırdı. Yazma burada; çağıran
// yalnız *"yazıldı, kendini tazele"* diye haber alıyor.
//
// ⛔ **BU KUTU HİÇBİR YERE GÖNDERMİYOR.** *"Elle yayınladım"* bir KAYIT: insan
// uygulamadan paylaştığını sisteme söylüyor, sistem paylaşmıyor.

import type React from 'react'
import { useCallback, useEffect, useState } from 'react'

/**
 * ⚠ Dört platform da VARSAYILAN AÇIK. Depo sahibi: *"her gönderi için yayın 4 platformda
 * da standart, anormal bi durum olmadıkça varsayılan 4'ü de"*. Boş başlayan bir seçim,
 * her gönderide dört tıklama isterdi.
 */
export const PLATFORMLAR = [
  { id: 'instagram', kisa: 'IG' },
  { id: 'facebook', kisa: 'FB' },
  { id: 'linkedin', kisa: 'in' },
  { id: 'x', kisa: 'X' },
] as const

export type TakvimKarari = 'planla' | 'cikar' | 'elle-yayinlandi' | 'geri-al'

interface Olay {
  readonly karar: string
  readonly tarih: string
  readonly at: string
  readonly not: string
  readonly platformlar?: readonly string[]
}

const bugun = (): string => new Date().toISOString().slice(0, 10)

export const GonderiKutusu = ({
  runId,
  konu,
  kapat,
  sonra,
}: {
  readonly runId: string
  readonly konu: string
  /** Kapatma düğmesi — verilmezse kutu gömülü demektir ve kapanmaz. */
  readonly kapat?: () => void
  /** Karar yazıldıktan sonra çağrılır: çağıran kendi listesini tazeler. */
  readonly sonra?: () => void | Promise<void>
}): React.JSX.Element => {
  const [tarih, setTarih] = useState(bugun)
  const [secili, setSecili] = useState<readonly string[]>(PLATFORMLAR.map((p) => p.id))
  const [gecmis, setGecmis] = useState<readonly Olay[]>([])
  const [mesaj, setMesaj] = useState<string | null>(null)

  const gecmisiCek = useCallback(async (): Promise<void> => {
    try {
      const j = (await (await fetch(`/api/yayin-takvimi/${runId}`)).json()) as {
        olaylar?: readonly Olay[]
      }
      setGecmis(j.olaylar ?? [])
    } catch {
      setGecmis([])
    }
  }, [runId])

  useEffect(() => {
    void gecmisiCek()
  }, [gecmisiCek])

  /**
   * ⚠ ⚠ **SON KARARIN PLATFORMLARI GERİ YÜKLENİYOR.** İlk sürüm her açılışta dördünü
   * de işaretliyordu; yalnız Instagram'a planlanmış bir gönderiyi açıp tarihini
   * değiştiren biri, farkında olmadan dört platforma geri alıyordu.
   */
  useEffect(() => {
    const son = [...gecmis]
      .reverse()
      .find((o) => o.karar === 'planla' || o.karar === 'elle-yayinlandi')
    if (son === undefined) return
    if (son.platformlar !== undefined && son.platformlar.length > 0) setSecili(son.platformlar)
    if (son.tarih !== '') setTarih(son.tarih)
  }, [gecmis])

  const karar = async (
    k: TakvimKarari,
    ek: { tarih?: string; platformlar?: readonly string[]; not?: string } = {}
  ): Promise<void> => {
    const r = await fetch('/api/yayin-takvimi', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ runId, karar: k, ...ek }),
    })
    const j = (await r.json()) as { ok?: boolean; hata?: string }
    setMesaj(j.ok === true ? `✓ ${k}` : `✗ ${j.hata ?? 'yazılamadı'}`)
    await gecmisiCek()
    await sonra?.()
  }

  return (
    <section className="gonderi-kutusu">
      <h3>
        {konu}
        {kapat === undefined ? null : (
          <>
            {' '}
            <button type="button" onClick={kapat}>
              ✕
            </button>
          </>
        )}
      </h3>
      <div className="filtre-cubuk">
        <label>
          tarih <input type="date" value={tarih} onChange={(e) => setTarih(e.target.value)} />
        </label>
        {PLATFORMLAR.map((p) => (
          <label key={p.id}>
            <input
              type="checkbox"
              checked={secili.includes(p.id)}
              onChange={(e) =>
                setSecili(e.target.checked ? [...secili, p.id] : secili.filter((x) => x !== p.id))
              }
            />{' '}
            {p.kisa}
          </label>
        ))}
      </div>
      <div className="kapi-dugmeler">
        <button type="button" onClick={() => void karar('planla', { tarih, platformlar: secili })}>
          ✓ bu tarihe planla
        </button>
        {/* ⛔ Sistem GÖNDERMİYOR: bu düğme insanın uygulamadan paylaştığını KAYDEDİYOR. */}
        <button
          type="button"
          onClick={() => void karar('elle-yayinlandi', { tarih, platformlar: secili })}
        >
          ⇪ elle yayınladım
        </button>
        <button type="button" onClick={() => void karar('cikar', { not: 'takvimden çıkarıldı' })}>
          ⌫ takvimden çıkar
        </button>
        <button type="button" onClick={() => void karar('geri-al')}>
          ↺ kararı geri al
        </button>
      </div>
      {mesaj === null ? null : <p className="olcum">{mesaj}</p>}
      {/* ⚠ Geçmiş GÖSTERİLİYOR: geri almanın NEYİ geri aldığını görmeden basılan düğme
          bir tahmindir. Ekleme kolay, geri alma zor. */}
      {gecmis.length === 0 ? (
        <p className="bos">bu gönderi için elle karar yok — otomatik takvimde.</p>
      ) : (
        <ul className="akis-gonderiler">
          {gecmis.map((o, i) => (
            <li key={`${o.at}-${String(i)}`}>
              <span className="olcum">{o.at.slice(0, 16).replace('T', ' ')}</span>
              <strong>{o.karar}</strong>
              <span className="olcum">{o.tarih}</span>
              <span className="olcum">
                {(o.platformlar ?? [])
                  .map((id) => PLATFORMLAR.find((p) => p.id === id)?.kisa ?? id)
                  .join(' ')}
              </span>
              <span>{o.not}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
