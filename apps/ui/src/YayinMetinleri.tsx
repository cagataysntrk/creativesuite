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
                <button
                  type="button"
                  onClick={() => setIstemAcik(istemAcik === p.id ? null : p.id)}
                >
                  ⧉ bu platformun istemi
                </button>
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
                  Bu istemi istediğin modele ver, dönen metni yukarıdan yapıştır. Panel modele
                  gitmiyor: sağlayıcıya giden tek yol hattın kendisi.
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
