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
  otomatikTarih,
}: {
  readonly runId: string
  readonly konu: string
  /** Kapatma düğmesi — verilmezse kutu gömülü demektir ve kapanmaz. */
  readonly kapat?: () => void
  /** Karar yazıldıktan sonra çağrılır: çağıran kendi listesini tazeler. */
  readonly sonra?: () => void | Promise<void>
  /**
   * Otomatik planlayıcının bu gönderi için SEÇTİĞİ tarih — biliniyorsa.
   *
   * ⚠ ⚠ **"OTOMATİĞE BIRAK" DEDİĞİNDE NE OLACAĞINI GÖRMEDEN SEÇEMEZSİN.** Boş bir
   * "otomatik" seçeneği, insana kapalı kutu imzalatmaktır. Bilinmiyorsa söylenmiyor.
   */
  readonly otomatikTarih?: string
}): React.JSX.Element => {
  const [tarih, setTarih] = useState(bugun)
  /**
   * ⚠ ⚠ **VARSAYILAN IG + LINKEDIN — dördü değil, ve bu bir DARALTMA kararıydı.** Depo
   * sahibi önce *"her gönderi için yayın 4 platformda da standart"* dedi, sonra hesaplar
   * bağlanınca daralttı: *"şimdilik sadece LinkedIn ve Insta'ya paylaşacağız."* Dördünü
   * işaretli bırakmak, her gönderide iki kutucuk kaldırmak demekti — ve unutulan bir
   * kutucuk, metni olmayan bir platforma planlama üretirdi.
   * ⚠ Facebook ve X KALDIRILMADI, yalnız varsayılan dışına çıktı: hesap bağlanınca tek
   * tıklamayla geri geliyor.
   */
  const [secili, setSecili] = useState<readonly string[]>(['instagram', 'linkedin'])
  const [gecmis, setGecmis] = useState<readonly Olay[]>([])
  const [mesaj, setMesaj] = useState<string | null>(null)

  /**
   * ŞU AN geçerli olan karar — defterin son sözü.
   *
   * ⚠ `geri-al` kararı KALDIRIYOR: kayıt defterde duruyor ama gönderi otomatik takvime
   * dönüyor. O yüzden "geçerli karar" son `geri-al`dan SONRAKİ son karardır.
   */
  const sonKarar = ((): Olay | null => {
    let k: Olay | null = null
    for (const o of gecmis) k = o.karar === 'geri-al' ? null : o
    return k
  })()

  const paketle = async (): Promise<void> => {
    setMesaj('paketleniyor…')
    try {
      const j = (await (
        await fetch(`/api/kosu/${runId}/yayin-paketi`, { method: 'POST' })
      ).json()) as {
        ok?: boolean
        klasor?: string
        slayt?: number
        eksik?: readonly string[]
        hata?: string
      }
      if (j.ok !== true) {
        setMesaj(`✗ ${j.hata ?? 'paketlenemedi'}`)
        return
      }
      // ⚠ Eksikler SAYILIYOR ve söyleniyor: metinsiz bir paketi "hazır" sanmak, yayıncıya
      // boş açıklamayla yüklenen bir gönderi demekti.
      const eksik = j.eksik ?? []
      setMesaj(
        `✓ ${String(j.slayt ?? 0)} slayt → ${j.klasor ?? ''}` +
          (eksik.length === 0 ? '' : ` · ⚠ ${String(eksik.length)} eksik: ${eksik.join(' · ')}`)
      )
    } catch {
      setMesaj('✗ sunucuya ulaşılamıyor')
    }
  }

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
      {/* ⚠ ⚠ **ŞU AN NE OLDUĞU EN ÜSTTE.** Depo sahibi *"otomatik takvime ekleme ile
          manuel aynı yerde olmalı, istediğine basabilir kişi"* dedi — ama iki düğme
          koymak yetmiyor: insan hangisinin ŞU AN geçerli olduğunu görmeden seçemez. */}
      <p className={sonKarar === null ? 'bos' : 'olcum'}>
        {sonKarar === null
          ? `şu an: OTOMATİK takvimde${otomatikTarih === undefined || otomatikTarih === '' ? '' : ` — planlayıcı ${otomatikTarih} diyor`}`
          : sonKarar.karar === 'planla'
            ? `şu an: ELLE ${sonKarar.tarih} tarihine planlanmış`
            : sonKarar.karar === 'elle-yayinlandi'
              ? `şu an: ${sonKarar.tarih} tarihinde ELLE YAYINLANDI olarak işaretli`
              : 'şu an: takvimden ÇIKARILMIŞ'}
      </p>

      {/* ⚠ ⚠ **İKİ SEÇENEK YAN YANA ve ikisi de TEK TIKLAMA.** "Otomatiğe bırak" aslında
          elle kararı geri almak; adı *"kararı geri al"*dı ve kimse bunun otomatik demek
          olduğunu anlamıyordu. Aynı eylem, doğru adla artık bir SEÇENEK. */}
      <div className="kapi-dugmeler">
        <button type="button" disabled={sonKarar === null} onClick={() => void karar('geri-al')}>
          ⤺ otomatiğe bırak
        </button>
        <span className="olcum">ya da</span>
      </div>

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
        {/* ⚠ ⚠ **YAYIN BURADAN YAPILMIYOR — paket ÇIKIYOR.** Instagram/LinkedIn/X
            API'lerinde zamanlama yok; yayını bulut aracıyla insan yapıyor. Panelin işi
            karoselleri SIRAYLA ve metinleri platform başına bir klasöre koymak. */}
        <button type="button" onClick={() => void paketle()}>
          ⬇ yayın paketi çıkar
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
