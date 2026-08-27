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

/**
 * Platform seçimi YAPILMAMIŞ bir gönderinin varsayılanı.
 *
 * ⚠ ⚠ **TEK KAYNAK — üç yerde ayrı ayrı yazılıydı ve biri geride kaldı.** Takvim
 * kutucuğu, karar kutusu ve koşu başlatıcı üçü de kendi varsayılanını taşıyordu; sahip
 * IG+LinkedIn'e daraltınca ikisi güncellendi, takvim kutucuğu hâlâ *"IG FB in X"*
 * gösteriyordu. Bu deponun tekrar eden sınıfı: aynı soru iki yerde ayrı cevaplanıyor.
 */
export const VARSAYILAN_PLATFORMLAR: readonly string[] = ['instagram', 'linkedin']

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
  metinliPlatformlar,
  senkron,
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
  /**
   * Gönderi metni ÜRETİLMİŞ platformlar.
   *
   * ⚠ ⚠ **BU OLMADAN KUTU KÖR SEÇİM YAPTIRIYORDU.** Varsayılan IG+LinkedIn'di; metni
   * yalnız X ve LinkedIn'de olan bir gönderide *"bu tarihe planla"*ya basınca sunucu
   * haklı olarak reddediyordu — ama insan bunu ANCAK bastıktan sonra öğreniyordu.
   * Reddi doğru yerde vermek yetmez; reddi ÖNGÖRÜLEBİLİR yapmak gerekiyor.
   * ⚠ Verilmezse denetim yapılmıyor (koşu detayı henüz taşımıyor olabilir).
   */
  readonly metinliPlatformlar?: readonly string[]
  /** Bu gönderi hedefe iletildi mi — defterin son senkron kaydı. */
  readonly senkron?: string
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
  // ⚠ ⚠ **VARSAYILAN SEÇİM, METNİ OLANLARLA KESİŞİYOR.** Metni olmayan bir platformu
  // işaretli başlatmak, insana reddedilecek bir seçim sunmaktır. Kesişim boşsa metni
  // olan HER platform seçiliyor — hiçbiri yoksa boş, ve o zaman uyarı görünüyor.
  const [secili, setSecili] = useState<readonly string[]>(VARSAYILAN_PLATFORMLAR)
  /** İnsan kutucuklara DOKUNDU mu — dokunduysa otomatik düzeltme durur. */
  const [eldeSecildi, setEldeSecildi] = useState(false)
  const [gecmis, setGecmis] = useState<readonly Olay[]>([])
  const [mesaj, setMesaj] = useState<string | null>(null)
  /**
   * Metni olan platformlar — çağıran vermezse KUTU KENDİ ÖĞRENİYOR.
   *
   * ⚠ ⚠ **ÇAĞIRANIN HATIRLAMASINA BIRAKMAK KUSUR ÜRETTİ.** Takvim ekranı bu bilgiyi
   * geçiyordu, koşu detayı geçmiyordu; sonuç: koşu detayında kutu Instagram'ı işaretli
   * başlatıyor, insan *"bu tarihe planla"*ya basıyor ve sunucu haklı olarak reddediyordu.
   * Üç çağıran varsa üçünün de hatırlaması gereken bir şey, er geç birinde unutulur.
   * Kutu kendi geçmişini zaten çekiyor; bunu da çekmesi aynı sınıf.
   */
  const [kendiMetinler, setKendiMetinler] = useState<readonly string[] | null>(null)

  /**
   * ŞU AN geçerli olan karar — defterin son sözü.
   *
   * ⚠ `geri-al` kararı KALDIRIYOR: kayıt defterde duruyor ama gönderi otomatik takvime
   * dönüyor. O yüzden "geçerli karar" son `geri-al`dan SONRAKİ son karardır.
   */
  const sonKarar = ((): Olay | null => {
    let k: Olay | null = null
    for (const o of gecmis) {
      // ⚠ ⚠ **`senkron` BİR KARAR DEĞİL, BİR OLAY — ve bunu atlamayı UNUTTUM.** Sunucuda
      // `gecerliKararlar` onu atlıyordu, panelde atlamıyordum: hedefe gönderdikten sonra
      // ekran *"takvimden ÇIKARILMIŞ"* diyordu, çünkü son olay bir karar sanılıp
      // bilinmeyen tür `cikar` dalına düşüyordu. Aynı kuralın iki yerde ayrı yazılması —
      // bu deponun tekrar eden sınıfı, bir kez daha.
      if (o.karar === 'senkron') continue
      k = o.karar === 'geri-al' ? null : o
    }
    return k
  })()

  /**
   * Gönderiyi hedefe iletir.
   *
   * ⚠ Hedef seçimi YOK çünkü bugün tek hedef var. İkinci hedef eklendiğinde buraya bir
   * seçici gelecek; şimdi koymak, tek seçenekli bir menü göstermek olurdu.
   */
  const hedefeGonder = async (): Promise<void> => {
    setMesaj('⇄ hedefe iletiliyor…')
    try {
      const j = (await (
        await fetch('/api/yayin-senkron', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ runId, hedef: 'yerel' }),
        })
      ).json()) as { ok?: boolean; durum?: string; not?: string; hedef?: string; hata?: string }
      setMesaj(
        j.ok === true
          ? `⇄ ${j.hedef ?? ''} · ${j.durum ?? ''} — ${j.not ?? ''}`
          : `✗ ${j.hata ?? 'iletilemedi'}`
      )
      if (j.ok === true) {
        await gecmisiCek()
        await sonra?.()
      }
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

  useEffect(() => {
    if (metinliPlatformlar !== undefined) return
    void (async () => {
      try {
        const j = (await (await fetch(`/api/kosu/${runId}/yayin-metinleri`)).json()) as {
          platformlar?: readonly { id: string; metin: string }[]
        }
        setKendiMetinler(
          (j.platformlar ?? []).filter((x) => x.metin.trim() !== '').map((x) => x.id)
        )
      } catch {
        // Uç düşerse denetim yapılmıyor — sunucu yine reddeder, yalnız uyarı erken gelmez.
        setKendiMetinler(null)
      }
    })()
  }, [runId, metinliPlatformlar])

  /**
   * ⚠ ⚠ **SON KARARIN PLATFORMLARI GERİ YÜKLENİYOR.** İlk sürüm her açılışta dördünü
   * de işaretliyordu; yalnız Instagram'a planlanmış bir gönderiyi açıp tarihini
   * değiştiren biri, farkında olmadan dört platforma geri alıyordu.
   */
  /** Metni olan platformlar: çağıranınki, yoksa kutunun kendi öğrendiği. */
  const metinli = metinliPlatformlar ?? kendiMetinler ?? undefined

  /**
   * Metin durumu öğrenilince seçim KENDİLİĞİNDEN düzeliyor — ama insan dokunmadıysa.
   *
   * ⚠ ⚠ **İNSANIN SEÇİMİNİ EZMEK YASAK.** İnsan bilerek metinsiz bir platformu
   * işaretlediyse (önce planlayıp sonra metni üretmek isteyebilir) onu geri almak, verdiği
   * kararı sessizce iptal etmek olurdu. `eldeSecildi` o çizgiyi çiziyor.
   */
  useEffect(() => {
    if (eldeSecildi || metinli === undefined) return
    const kesisim = VARSAYILAN_PLATFORMLAR.filter((id) => metinli.includes(id))
    setSecili(kesisim.length > 0 ? kesisim : metinli)
  }, [metinli, eldeSecildi])

  useEffect(() => {
    const son = [...gecmis]
      .reverse()
      .find((o) => o.karar === 'planla' || o.karar === 'elle-yayinlandi')
    if (son === undefined) return
    if (son.platformlar !== undefined && son.platformlar.length > 0) setSecili(son.platformlar)
    if (son.tarih !== '') setTarih(son.tarih)
  }, [gecmis])

  /** Seçili ama metni OLMAYAN platformlar — planlamayı engelleyenler. */
  const eksikMetin =
    metinli === undefined
      ? []
      : secili
          .filter((id) => !metinli.includes(id))
          .map((id) => PLATFORMLAR.find((p) => p.id === id)?.kisa ?? id)

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
    // ⚠ ⚠ **HAM OLAY ADI EKRANA YAZILMAZ.** *"✓ geri-al"* diye bir cümle yok; insan
    // *"otomatiğe bırak"*a bastı ve karşılığında defterin iç adını gördü. Olay adı VERİ,
    // ekrandaki cümle SUNUM — ve sunum insanın bastığı düğmenin dilinde olmalı.
    const soylenen: Record<string, string> = {
      planla: 'bu tarihe planlandı',
      cikar: 'takvimden çıkarıldı',
      'elle-yayinlandi': 'elle yayınlandı olarak işaretlendi',
      'geri-al': 'otomatiğe bırakıldı',
    }
    setMesaj(j.ok === true ? `✓ ${soylenen[k] ?? k}` : `✗ ${j.hata ?? 'yazılamadı'}`)
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
        {/* ⚠ ⚠ **METNİ OLMAYAN PLATFORM İŞARETLENEBİLİR ama UYARIYLA.** Kapatmak
            (`disabled`) yanlış olurdu: insan önce planlayıp sonra metni üretmek
            isteyebilir. Ama ne olacağını BİLEREK seçmeli — sunucu o seçimi reddedecek
            ve sebebini o an değil, düğmeye bastıktan sonra öğrenmek kötü bir sıra. */}
        {PLATFORMLAR.map((p) => {
          const metinVar = metinli === undefined || metinli.includes(p.id)
          return (
            <label key={p.id} className={metinVar ? undefined : 'is-uyari'}>
              <input
                type="checkbox"
                checked={secili.includes(p.id)}
                onChange={(e) => {
                  setEldeSecildi(true)
                  setSecili(e.target.checked ? [...secili, p.id] : secili.filter((x) => x !== p.id))
                }}
              />{' '}
              {p.kisa}
              {metinVar ? '' : ' ⚠ metinsiz'}
            </label>
          )
        })}
      </div>
      {/* ⚠ Uyarı düğmenin ÜSTÜNDE: tıkladıktan sonra okunan bir uyarı, uyarı değildir. */}
      {eksikMetin.length === 0 ? null : (
        <p className="is-uyari">
          ⚠ {eksikMetin.join(', ')} için gönderi metni YOK — bu seçimle planlama reddedilecek. Koşu
          detayında <strong>⚡ üret</strong> ile metni üret.
        </p>
      )}
      <div className="kapi-dugmeler">
        <button
          type="button"
          disabled={eksikMetin.length > 0}
          onClick={() => void karar('planla', { tarih, platformlar: secili })}
        >
          ✓ bu tarihe planla
        </button>
        {/* ⚠ ⚠ **BU DÜĞME BİR ZAMANLAR İKİYDİ ve ikisi AYNI ŞEYİ YAPIYORDU.** Depo
            sahibi: *"hedefe gönder ve yayın paketini çıkar aynı şeyi yapıyor neden iki
            farklı butona ??"* — ve haklıydı: yerel hedefin `gonder`i zaten `paketle`yi
            çağırıyor. İki düğme, tek eylemin iki adı; hangisine basılacağı bilinemez.
            ⚠ Bugün tek hedef YEREL PAKET olduğu için etiket ikisini de söylüyor.
            Metricool bağlandığında bu düğme onu çağıracak — kod değişmeden, çünkü
            fark hedefte, düğmede değil.
            ⛔ Hiçbir hedef YAYINLAMIYOR; zamanlıyor / paketliyor. */}
        <button type="button" onClick={() => void hedefeGonder()}>
          ⇄ hedefe gönder — paketi çıkar
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
      </div>
      {/* ⚠ Senkron durumu KUTUDA, geçmişin içinde kaybolmasın diye: "gönderdim mi"
          sorusu en sık sorulanlardan ve cevabı bir tık ötede olmamalı. */}
      {senkron === undefined || senkron === '' ? null : <p className="olcum">⇄ {senkron}</p>}
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
              {/* ⚠ Defterin iç adı yerine insan cümlesi: `geri-al` bir kayıt türü,
                  "otomatiğe bırakıldı" ise olan şey. */}
              <strong>
                {o.karar === 'geri-al'
                  ? 'otomatiğe bırakıldı'
                  : o.karar === 'elle-yayinlandi'
                    ? 'elle yayınlandı'
                    : o.karar === 'cikar'
                      ? 'takvimden çıkarıldı'
                      : o.karar === 'senkron'
                        ? 'hedefe gönderildi'
                        : 'planlandı'}
              </strong>
              <span className="olcum">{o.tarih}</span>
              <span className="olcum">
                {(o.platformlar ?? [])
                  .map((id) => PLATFORMLAR.find((p) => p.id === id)?.kisa ?? id)
                  .join(' ')}
              </span>
              {/* ⚠ ⚠ **KLASÖR YOLU KISALTILIYOR.** Tam yol satırı iki katına çıkarıyordu
                  ve defterin okunmasını zorlaştırıyordu; aranan bilgi *"gitti mi"*, yolun
                  tamamı değil. Tamamı `title`da. */}
              <span className="giris-konu" title={o.not}>
                {o.not.length > 90 ? `${o.not.slice(0, 88)}…` : o.not}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
