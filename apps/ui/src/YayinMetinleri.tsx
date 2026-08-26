// HEDEF: apps/ui/src/YayinMetinleri.tsx
//
// Platform BAŞINA yayın açıklaması — durum, düzenleme, tek platformluk istem (UX-10).
//
// ⚠ ⚠ **DÖRT METİN TEK ÇAĞRIDA ÜRETİLİYOR ve bu doğru:** aynı gönderinin dört sesi
// olmasın diye tek bağlam. Ama depo sahibi haklı bir boşluğa bastı: *"gönderi metni
// üretilmemişse her platform için ayrı ayrı üretilebilir olsun"*. Biri eksik ya da
// kötüyse dördünü birden yeniden üretmek, üç iyi metni de riske atmaktı.
//
// ⚠ ⚠ **PANEL MODEL ÇAĞIRMIYOR — ve bu bir eksiklik değil, bir SINIR.** Sağlayıcıya
// giden tek yol çekirdek üzerinden hat; ikinci bir yol açmak hangi çağrının ne
// harcadığını iki ayrı yerde anlatmak olurdu (`chokepoints.json`). Panel bunun yerine
// o platform İÇİN TEK BAŞINA istemi veriyor: insan istediği modelde üretip yapıştırıyor,
// panel de sınırlara karşı DENETLİYOR.
//
// ⚠ Denetim yazma anında: 281 karakterlik bir X metnini yayın anında öğrenmek, dört
// görsel ve bir insan onayı harcandıktan sonra öğrenmektir.

import type React from 'react'
import { useCallback, useEffect, useState } from 'react'

interface PlatformDurumu {
  readonly id: string
  readonly ad: string
  readonly metin: string
  readonly uzunluk: number
  readonly tavan: number
  readonly katlanmaOncesi: number
  readonly kusurlar: readonly string[]
  /** O platform için TEK BAŞINA istem. Kart metni yoksa `null`. */
  readonly istem: string | null
}

interface Cevap {
  readonly ok: boolean
  readonly kartMetniVar: boolean
  readonly platformlar: readonly PlatformDurumu[]
}

export const YayinMetinleri = ({ runId }: { readonly runId: string }): React.JSX.Element => {
  const [veri, setVeri] = useState<Cevap | null>(null)
  const [acik, setAcik] = useState<string | null>(null)
  const [taslak, setTaslak] = useState('')
  const [mesaj, setMesaj] = useState<string | null>(null)
  const [istemAcik, setIstemAcik] = useState<string | null>(null)
  const [uretiliyor, setUretiliyor] = useState<string | null>(null)

  /**
   * Metni ÜRETİR — model çağrısı sunucudan değil, hattın kullandığı adaptörden.
   *
   * ⚠ ⚠ **PANEL MODELİ DOĞRUDAN ÇAĞIRMIYOR ve bu bir sınır.** Sunucuya bir model yolu
   * koymak, hangi çağrının ne harcadığını iki ayrı yerde anlatmak olurdu. Uç bir betik
   * çalıştırıyor, betik `text.generate` adaptörünü çağırıyor — hattın çağırdığının aynısı.
   * ⚠ Maliyeti sıfır (abonelik), o yüzden bütçe defterine girmiyor.
   */
  const uret = async (platform: string | null): Promise<void> => {
    setUretiliyor(platform ?? 'hepsi')
    setMesaj('⏳ model çalışıyor…')
    try {
      const j = (await (
        await fetch(`/api/kosu/${runId}/yayin-metni-uret`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(platform === null ? { hepsi: true } : { platform }),
        })
      ).json()) as { ok?: boolean; cikti?: string; hata?: string }
      // ⚠ Betiğin çıktısı OLDUĞU GİBİ gösteriliyor: "6 slayt, tavan 4" gibi gerçek
      // uyarıları yutan bir arayüz, kusuru yayın anına ertelerdi.
      setMesaj(j.ok === true ? (j.cikti ?? '✓ üretildi') : `✗ ${j.hata ?? 'üretilemedi'}`)
      if (j.ok === true) await yukle()
    } catch {
      setMesaj('✗ sunucuya ulaşılamıyor')
    }
    setUretiliyor(null)
  }

  const yukle = useCallback(async (): Promise<void> => {
    try {
      const j = (await (await fetch(`/api/kosu/${runId}/yayin-metinleri`)).json()) as Cevap
      setVeri(j)
    } catch {
      setVeri(null)
    }
  }, [runId])

  useEffect(() => {
    void yukle()
  }, [yukle])

  const kaydet = async (platform: string): Promise<void> => {
    const r = await fetch(`/api/kosu/${runId}/yayin-metni`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ platform, metin: taslak }),
    })
    const j = (await r.json()) as { ok?: boolean; hata?: string; uyarilar?: readonly string[] }
    if (j.ok !== true) {
      setMesaj(`✗ ${j.hata ?? 'yazılamadı'}`)
      return
    }
    setMesaj(
      (j.uyarilar ?? []).length === 0
        ? '✓ kaydedildi'
        : `✓ kaydedildi · ${(j.uyarilar ?? []).join(' · ')}`
    )
    setAcik(null)
    await yukle()
  }

  if (veri === null) return <p className="bos">yayın metinleri okunuyor…</p>

  return (
    <section className="giris-blok">
      <h3>Yayın açıklamaları — platform başına</h3>
      {veri.kartMetniVar ? null : (
        <p className="is-uyari">
          ⚠ Karosel metni henüz üretilmedi — istem çıkarılamıyor. Konusuz bir istemle model yine bir
          şey yazar, ama karoselle ilgisi olmayan bir şey yazar.
        </p>
      )}
      {/* ⚠ ⚠ **DÖRDÜ TEK ÇAĞRIDA da var, tek tek de.** Dört metni tek bağlamda üretmek
          aynı gönderiye tek ses veriyor; ama biri kötüyse dördünü yeniden üretmek üç iyi
          metni riske atardı. İkisi de gerekiyor. */}
      {veri.kartMetniVar ? (
        <div className="kapi-dugmeler">
          <button type="button" disabled={uretiliyor !== null} onClick={() => void uret(null)}>
            {uretiliyor === 'hepsi' ? '⏳ üretiliyor…' : '⚡ dördünü birden üret'}
          </button>
        </div>
      ) : null}
      {mesaj === null ? null : <p className="olcum">{mesaj}</p>}
      <ul className="metin-platformlari">
        {veri.platformlar.map((p) => (
          <li key={p.id}>
            <div className="metin-platform-basi">
              <strong>{p.ad}</strong>
              {/* ⚠ Sayı ÖLÇÜLEN: kod noktası sayılıyor, `length` değil — Türkçe harfler
                  ve emoji tek karakter sayılmazsa X'te 280 sınırı yanlış hesaplanır. */}
              <span className={p.uzunluk > p.tavan ? 'is-uyari' : 'olcum'}>
                {p.metin === '' ? '—' : `${String(p.uzunluk)}/${String(p.tavan)}`}
              </span>
              {p.katlanmaOncesi < p.tavan ? (
                <span className="olcum">kanca ~{p.katlanmaOncesi}</span>
              ) : null}
              <button
                type="button"
                onClick={() => {
                  setAcik(acik === p.id ? null : p.id)
                  setTaslak(p.metin)
                }}
              >
                {p.metin === '' ? '✎ metin yaz' : '✎ düzenle'}
              </button>
              {p.istem === null ? null : (
                <>
                  <button
                    type="button"
                    disabled={uretiliyor !== null}
                    onClick={() => void uret(p.id)}
                  >
                    {uretiliyor === p.id ? '⏳ üretiliyor…' : '⚡ üret'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIstemAcik(istemAcik === p.id ? null : p.id)}
                  >
                    ⧉ istem
                  </button>
                </>
              )}
            </div>
            {p.kusurlar.length === 0 ? null : <p className="is-uyari">{p.kusurlar.join(' · ')}</p>}
            {p.metin === '' ? (
              <p className="bos">henüz üretilmedi</p>
            ) : (
              <p className="kosu-satirlar">{p.metin}</p>
            )}
            {acik === p.id ? (
              <div className="metin-duzenle">
                <textarea
                  value={taslak}
                  aria-label={`${p.ad} metni`}
                  onChange={(e) => setTaslak(e.target.value)}
                />
                <div className="kapi-dugmeler">
                  {/* ⚠ Sayaç YAZARKEN görünüyor: kaydettikten sonra "281 karakter" demek,
                      hatayı düzeltilebileceği andan sonra söylemektir. */}
                  <span className={[...taslak].length > p.tavan ? 'is-uyari' : 'olcum'}>
                    {[...taslak].length}/{p.tavan}
                  </span>
                  <button type="button" onClick={() => void kaydet(p.id)}>
                    kaydet
                  </button>
                  <button type="button" onClick={() => setAcik(null)}>
                    vazgeç
                  </button>
                </div>
              </div>
            ) : null}
            {istemAcik === p.id && p.istem !== null ? (
              <div className="metin-duzenle">
                {/* ⚠ İstem SALT-OKUNUR: burada düzenlenen bir istem hiçbir yere yazılmaz
                    ve düzenlenebilir görünmesi onu yazılıyor sanmaya yol açardı. */}
                <textarea readOnly value={p.istem} aria-label={`${p.ad} istemi`} />
                <p className="giris-not">
                  ⚡ düğmesi bu istemi hattın kendi sağlayıcısına gönderiyor. İstem burada, başka
                  bir modelde denemek ya da elle düzenleyip yapıştırmak istersen diye.
                </p>
              </div>
            ) : null}
          </li>
        ))}
      </ul>
      <p className="giris-not">
        Önceki hâller defterde kalıyor (`oncekiMetinler`) — kanıt silinmiyor, ekleniyor.
      </p>
    </section>
  )
}
