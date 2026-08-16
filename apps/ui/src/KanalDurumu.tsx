// Publish Queue ve Channel Status ekranı (§9.4, §12.9 · D-19 · FAZ-7.7).
//
// **Bu ekranın varlık sebebi:** token'ın ne zaman öldüğü, sürüm sabitinin kaç günlük
// olduğu ve kotanın nerede durduğu üç ayrı yerde yazıyordu — hiçbiri açılan bir yerde
// değildi. Log'a bakmayı hatırlaman gereken bir sağlık göstergesi, olmayan bir sağlık
// göstergesidir.
//
// **Durum rengi tek başına anlam taşımaz** (§12.6, alarm yönetimi): her satır
// glyph + renk + METİN taşır. Renk körü bir operatör ya da soluk bir ekran, ölmüş bir
// token'ı sağlıklı sanmamalı.
//
// **Rozet yok, tolerans okuması var** (§4b): "token ✓" hiçbir şey söylemez;
// "4 gün / pay 7 gün" kenara ne kadar yakın olduğunu söyler.
//
// **Ölçülmeyen hiçbir şey iyi gösterilmiyor.** Üç ayrı bilinmezlik üç ayrı cümleyle
// yazılıyor; hiçbiri boş bir hücreye düşmüyor (D-175).

import { useEffect, useState } from 'react'

interface TokenDurumu {
  readonly kind: 'ok' | 'yenile' | 'olmus' | 'bilinmiyor'
  readonly kalanGun?: number
  readonly gecenGun?: number
}

interface Kanal {
  readonly kanal: string
  readonly token: { readonly durum: TokenDurumu; readonly mesaj: string; readonly bloklu: boolean }
  readonly yayinaUygun: boolean
  readonly engeller: readonly string[]
  readonly oran: {
    readonly kapasite: number
    readonly dolumSaniyede: number
    readonly yayinPuani: number
    readonly kalan: number | null
  }
  readonly surum: {
    readonly pinned: string
    readonly verifiedAt: string
    readonly yasGun: number | null
    readonly kalanGun: number | null
    readonly eskimis: boolean
  } | null
}

interface Pano {
  readonly simdi: string
  readonly kanallar: readonly Kanal[]
  readonly bekleyenler: readonly {
    readonly runId: string
    readonly pipeline: string
    readonly gate: string
    readonly createdAt: string
    readonly manifestSaglam: boolean
  }[]
  readonly gecmis: { readonly toplam: number; readonly sonYayin: string | null } | null
  readonly gecmisNeden: string | null
  readonly zamanlamaVar: boolean
}

/** Glyph — rengin YANINDA, yerine değil. */
const ISARET: Readonly<Record<string, string>> = {
  ok: '✓',
  yenile: '⚠',
  olmus: '✗',
  bilinmiyor: '?',
}

const tokenOkumasi = (t: TokenDurumu): string => {
  if (t.kind === 'ok') return `${t.kalanGun ?? '?'} gün kaldı`
  if (t.kind === 'yenile') return `${t.kalanGun ?? '?'} gün / pay 7 gün`
  if (t.kind === 'olmus') return `${t.gecenGun ?? '?'} gün önce öldü`
  return 'ölçülemedi'
}

export const KanalDurumu = (): React.JSX.Element => {
  const [p, setP] = useState<Pano | null>(null)
  const [hata, setHata] = useState(false)

  useEffect(() => {
    void fetch('/api/kanallar')
      .then((x) => x.json() as Promise<Pano>)
      .then(setP)
      .catch(() => setHata(true))
  }, [])

  if (hata) return <p role="alert">kanal durumu alınamadı — sunucu çalışıyor mu?</p>
  if (p === null) return <p>yükleniyor…</p>

  return (
    <section>
      <h1>Yayın kuyruğu ve kanal durumu</h1>
      <p className="mono">{p.simdi}</p>

      <h2>Kanallar</h2>
      <table>
        <thead>
          <tr>
            <th>·</th>
            <th>kanal</th>
            <th>token</th>
            <th>oran bütçesi</th>
            <th>sürüm</th>
          </tr>
        </thead>
        <tbody>
          {p.kanallar.map((k) => (
            <tr key={k.kanal}>
              <td>{ISARET[k.token.durum.kind] ?? '·'}</td>
              <td className="mono">{k.kanal}</td>
              <td>
                {/* Okuma + durum sözcüğü birlikte: sayı tek başına eşiği bilmez. */}
                <span className="mono">{tokenOkumasi(k.token.durum)}</span>
                {k.token.bloklu ? <strong> — YAYIN BLOKLU</strong> : null}
              </td>
              <td className="mono">
                {k.oran.kalan === null
                  ? // "Ölçülmedi" ile "dolu" farklı sonuçlardır: kovalar çalıştırma
                    // sürecinde yaşıyor ve bu ekran oraya bakamıyor.
                    `ölçülmedi · kapasite ${k.oran.kapasite}, +${k.oran.dolumSaniyede}/sn, yayın ${k.oran.yayinPuani} puan`
                  : `${k.oran.kalan.toFixed(1)} / ${k.oran.kapasite} puan · yayın ${k.oran.yayinPuani} puan`}
              </td>
              <td className="mono">
                {k.surum === null
                  ? '—'
                  : `${k.surum.pinned} · ${k.surum.yasGun ?? '?'} günlük · ${
                      k.surum.kalanGun === null
                        ? 'kontrol tarihi okunamadı'
                        : k.surum.kalanGun >= 0
                          ? `yeniden kontrole ${k.surum.kalanGun} gün`
                          : `kontrol ${-k.surum.kalanGun} gün GECİKTİ`
                    }`}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {p.kanallar.every((k) => k.engeller.length === 0) ? null : (
        <>
          <h2>Yayını bloklayanlar</h2>
          <ul>
            {p.kanallar.flatMap((k) =>
              k.engeller.map((e) => (
                <li key={`${k.kanal}-${e}`}>
                  <span className="mono">{k.kanal}</span> — {e}
                </li>
              ))
            )}
          </ul>
        </>
      )}

      <h2>Onay bekleyenler</h2>
      {p.bekleyenler.length === 0 ? (
        <p>kuyrukta bekleyen çalıştırma yok</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>çalıştırma</th>
              <th>hat</th>
              <th>beklenen kapı</th>
              <th>manifest</th>
            </tr>
          </thead>
          <tbody>
            {p.bekleyenler.map((b) => (
              <tr key={b.runId}>
                <td className="mono">{b.runId}</td>
                <td className="mono">{b.pipeline}</td>
                <td className="mono">{b.gate}</td>
                {/* Kusurlu manifest zaten yayınlanamaz (D-155) — kuyrukta İŞARETLENİR. */}
                <td>{b.manifestSaglam ? '✓' : '✗ kusurlu — yayınlanamaz'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h2>Yayın geçmişi</h2>
      {p.gecmis === null ? (
        <p role="alert">{p.gecmisNeden}</p>
      ) : (
        <p className="mono">
          {p.gecmis.toplam} yayın · son: {p.gecmis.sonYayin ?? 'yok'}
        </p>
      )}

      {p.zamanlamaVar ? null : (
        <p role="note">
          Zamanlayıcı <strong>yok</strong>: yayın elle tetikleniyor. Boş bir “zamanlanmış” listesi,
          zamanlayıcının var olup iş almadığını ima ederdi.
        </p>
      )}
    </section>
  )
}
