// Kalıcı makine durumu şeridi (§12.4 · FAZ-4.2b).
//
// Ekranın alt kenarında HER ZAMAN durur. Toast değil, köşede rozet değil — makinenin
// durumunu bilmek için hiçbir yere tıklamak gerekmiyor. Alınan risk bu: kalıcı bir
// gösterge yanlış olursa sürekli yanlıştır.
//
// Bileşen İNCE: karar `baglanti.ts`te ve orada test edildi. Buradaki tek iş, kararı
// çizmek.

import { useEffect, useState } from 'react'
import {
  baglantiDurumu,
  durumIsareti,
  gosterilecekDeger,
  sayiBicimle,
  usdBicimle,
  type BaglantiDurumu,
} from './baglanti.js'

export interface MakineDurumu {
  readonly aktif: {
    readonly runId: string
    readonly pipeline: string
    readonly adim: number
    readonly toplamAdim: number
  } | null
  readonly maliyetMikros: string
  /** Bekleyen corpus taslağı (R-14) — çalıştırma kapısı DEĞİL. */
  readonly bekleyenTaslak: number
  /** İnsanın kararını bekleyen çalıştırma kapısı. */
  readonly bekleyenKapi: number
  readonly kusurluCalistirma: number
  readonly kota: null
}

export interface SeritOzellikleri {
  readonly durum: MakineDurumu | null
  readonly sonOlayMs: number | null
  readonly nabizAraligiMs: number
  /** Saat dışarıdan: test edilebilirlik ve tek saat kuralı (§13). */
  readonly simdiMs: () => number
}

const Olcum = ({ etiket, deger }: { etiket: string; deger: string | null }) => (
  <span className="olcum-oge">
    <span className="olcum-etiket">{etiket}</span>
    {/* Ölçülemeyen değer "—", sıfır DEĞİL: sıfır bir okumadır, "—" okuma yokluğudur. */}
    <span className="olcum">{deger ?? '—'}</span>
  </span>
)

export const DurumSeridi = ({
  durum,
  sonOlayMs,
  nabizAraligiMs,
  simdiMs,
}: SeritOzellikleri): React.JSX.Element => {
  // Şerit KENDİ KENDİNE tazelenir. Yalnız olay geldiğinde yeniden çizseydi, sunucu
  // sustuğu anda "canlı" görüntüsünde DONAR — yani tam olarak yakalamak istediğimiz
  // hata, hatayı gösterecek bileşenin içinde olurdu.
  const [, tik] = useState(0)
  useEffect(() => {
    const t = setInterval(() => tik((n) => n + 1), Math.max(500, nabizAraligiMs / 2))
    return () => clearInterval(t)
  }, [nabizAraligiMs])

  const b: BaglantiDurumu = baglantiDurumu({
    sonOlayMs,
    simdiMs: simdiMs(),
    nabizAraligiMs,
  })
  const isaret = durumIsareti(b)
  const d = durum === null ? null : gosterilecekDeger(b, durum)

  return (
    <footer className="serit" data-baglanti={b}>
      <span className="serit-durum">
        {/* Glyph + renk + metin — üçü birden (§12.6). */}
        <span aria-hidden="true" style={{ color: isaret.rolToken }}>
          {isaret.glyph}
        </span>
        <span>{isaret.metin}</span>
      </span>

      <Olcum
        etiket="çalıştırma"
        deger={d === null ? null : d.aktif === null ? 'boşta' : `${d.aktif.pipeline}`}
      />
      <Olcum
        etiket="adım"
        deger={d === null || d.aktif === null ? null : `${d.aktif.adim}/${d.aktif.toplamAdim}`}
      />
      <Olcum etiket="maliyet" deger={d === null ? null : usdBicimle(d.maliyetMikros)} />
      {/* ⚠ ⚠ **İKİ AYRI "ONAY" TEK ETİKETTEYDİ.** Şerit "bekleyen onay 5" yazarken
          kuyrukta 61 kapı vardı ve kullanıcı şeridin bayat olduğunu düşündü. Bayat
          değildi — corpus taslaklarını sayıyordu. Tek kelimenin iki anlamı, ölçümün
          kendisinden daha çok yanlış anlaşılma üretir. */}
      <Olcum etiket="bekleyen kapı" deger={d === null ? null : sayiBicimle(d.bekleyenKapi)} />
      <Olcum
        etiket="taslak kayıt"
        deger={
          d === null ? null : d.bekleyenTaslak < 0 ? 'sayılamadı' : sayiBicimle(d.bekleyenTaslak)
        }
      />
      <Olcum etiket="kusurlu" deger={d === null ? null : sayiBicimle(d.kusurluCalistirma)} />
      {/* Kota ölçülmüyor (FAZ-4.12). Uydurulmuş bir doluluk göstergesi, hiç gösterge
          olmamaktan tehlikelidir — o yüzden alan var ama değeri "—". */}
      <Olcum etiket="kota" deger={null} />
    </footer>
  )
}
