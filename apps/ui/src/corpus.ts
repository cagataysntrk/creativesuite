// Corpus Browser mantığı — filtreleme ve gruplama (§12.9 · FAZ-4.3).
//
// SAF ve DOM'suz: bir tablonun tek işi doğru satırları doğru sırada göstermektir ve o iş
// tarayıcı açmadan sınanabilir. Bileşen yalnız çizer.
//
// **Görünürlük GİZLEMEZ, İŞARETLER.** Taslak ve emekli kayıtlar listede DURUR; hangisinin
// retrieval'a girdiği `visible` bayrağıyla gösterilir. Gizleseydik "her şey görülebilir"
// (D-12) vaadi çöker ve operatör yönetemediği bir kaydı yönetmeye çalışırdı.

export interface KayitSatiri {
  readonly id: string
  readonly type: string
  readonly status: string
  readonly era_id: string
  readonly path: string
  readonly title: string
  readonly visible: boolean
  readonly expired_at: string | null
}

export interface Filtre {
  readonly tip: string
  readonly durum: string
  readonly arama: string
}

export const BOS_FILTRE: Filtre = { tip: '', durum: '', arama: '' }

/**
 * Durum sırası — tabloda **iş bekleyen üstte**.
 *
 * Alfabetik sıralama `active` → `draft` → `pinned` → `retired` verirdi ve onay bekleyen
 * taslaklar ortada kaybolurdu. Operatörün ilk baktığı yer listenin başıdır; oraya
 * bekleyen iş konur, biten iş değil.
 */
const DURUM_SIRASI: Record<string, number> = {
  draft: 0,
  superseded: 1,
  active: 2,
  pinned: 3,
  retired: 4,
}

const sira = (s: string): number => DURUM_SIRASI[s] ?? 9

/**
 * Filtre uygular ve sıralar. **Arama katlamayı çağıranın verdiği fonksiyonla yapar** —
 * bu modül `foldForSearch`i kendi import etmez ki katlama tanımı tek yerde kalsın
 * (D-165) ve burası saf bir sıralayıcı olarak kalsın.
 */
export const filtrele = (
  satirlar: readonly KayitSatiri[],
  f: Filtre,
  katla: (s: string) => string
): readonly KayitSatiri[] => {
  const q = katla(f.arama.trim())
  return satirlar
    .filter((r) => {
      if (f.tip !== '' && r.type !== f.tip) return false
      if (f.durum !== '' && r.status !== f.durum) return false
      if (q === '') return true
      return katla(`${r.title} ${r.id} ${r.path}`).includes(q)
    })
    .slice()
    .sort((a, b) => {
      const d = sira(a.status) - sira(b.status)
      if (d !== 0) return d
      const t = a.type.localeCompare(b.type, 'tr')
      return t !== 0 ? t : a.id.localeCompare(b.id, 'tr')
    })
}

/** Filtre çubuğundaki seçenekler — sabit liste DEĞİL, veriden türetilir. */
export const tipler = (satirlar: readonly KayitSatiri[]): readonly string[] =>
  [...new Set(satirlar.map((r) => r.type))].sort((a, b) => a.localeCompare(b, 'tr'))

export const durumlar = (satirlar: readonly KayitSatiri[]): readonly string[] =>
  [...new Set(satirlar.map((r) => r.status))].sort((a, b) => sira(a) - sira(b))

/**
 * Satırın hangi eylemleri kabul ettiği. **UI bunu SORAR, tahmin etmez.**
 *
 * Devre dışı bir düğme göstermek yerine düğmeyi HİÇ göstermemek de bir seçenekti;
 * gösterip devre dışı bırakmak seçildi çünkü "neden yapamıyorum" sorusunun cevabı
 * `neden` alanında duruyor ve kaybolan bir düğme o soruyu hiç sordurmaz.
 */
export interface Eylemler {
  readonly emekliEdilebilir: boolean
  readonly sabitlenebilir: boolean
  readonly neden: string | null
}

export const eylemler = (r: KayitSatiri): Eylemler => {
  if (r.status === 'retired') {
    return {
      emekliEdilebilir: false,
      sabitlenebilir: false,
      neden: 'emekli kayıt değiştirilmez — yerine yeni kayıt açılır (R-12)',
    }
  }
  if (r.status === 'draft') {
    return {
      emekliEdilebilir: true,
      sabitlenebilir: false,
      neden: 'taslak önce onaylanır, sonra sabitlenir',
    }
  }
  return { emekliEdilebilir: true, sabitlenebilir: true, neden: null }
}

/** Satır rozeti: glyph + metin, renk TEK BAŞINA anlam taşımaz (§12.6). */
export const durumIsareti = (r: KayitSatiri): { glyph: string; metin: string; token: string } => {
  if (r.status === 'retired') {
    return { glyph: '⊘', metin: 'emekli', token: 'var(--role-text-muted)' }
  }
  if (r.status === 'draft') {
    return { glyph: '◷', metin: 'taslak · onay bekliyor', token: 'var(--role-state-warn)' }
  }
  if (r.status === 'pinned') return { glyph: '⊙', metin: 'sabit', token: 'var(--role-state-ok)' }
  return r.visible
    ? { glyph: '●', metin: 'yayında', token: 'var(--role-state-ok)' }
    : // `active` ama görünmez: dönem ya da geçerlilik tarihi dışarıda bırakıyor.
      // Bu durumu göstermemek, operatörün "neden bu kayıt kullanılmıyor" sorusunu
      // asla cevaplayamaması demekti.
      { glyph: '◐', metin: 'aktif ama dönem dışı', token: 'var(--role-state-warn)' }
}
