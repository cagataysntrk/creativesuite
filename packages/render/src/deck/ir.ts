// Deck/döküman IR'ı — **kaynak**, çıktı değil (§4c · §7.6 · FAZ-6.3).
//
// **Veri bağlama ANLIK GÖRÜNTÜLENİR.** Mart'ta paylaşılan bir doküman Haziran'da hâlâ
// Mart rakamını göstermelidir. Canlı bağlanan bir grafik, geçmişte paylaşılmış bir
// belgeyi sessizce değiştirir — ve o belge artık kimsenin onaylamadığı bir şeydir.
// Yayınlanmış bir iddiayı geriye dönük değiştirmek düzeltme değil, **tahrifattır**.
//
// Mekanizma basit ve bu yüzden güvenilir: IR corpus'a REFERANS taşımaz, **değerleri**
// taşır. Kayıt id'si tutulsaydı biri bir gün "tazeleyelim" derdi ve haklı görünürdü.

import { validateDocument, type DocumentModel } from '@suite/kernel'

export interface IrFile {
  /** Belge modelinin kendisi — değerler dahil. */
  readonly doc: DocumentModel
  /** IR'ın yazıldığı an. Damga `doc.stamp`ta ayrıca var; bu, IR dosyasının kendi yaşı. */
  readonly writtenAt: string
}

export type IrError =
  | { readonly kind: 'unreadable'; readonly reason: string }
  | { readonly kind: 'invalid_doc'; readonly reason: string }

export const irJson = (doc: DocumentModel, writtenAt: string): string =>
  `${JSON.stringify({ doc, writtenAt } satisfies IrFile, null, 2)}\n`

/**
 * IR'ı okur ve **şeklini doğrular**.
 *
 * Kör `as IrFile` yapmıyoruz: elle düzenlenmiş ya da yarım yazılmış bir IR, hatayı
 * render'ın ortasına taşır ve orada "Chromium çöktü" gibi görünür.
 */
export const parseIr = (raw: string): IrFile | IrError => {
  let ham: unknown
  try {
    ham = JSON.parse(raw)
  } catch (e) {
    return { kind: 'unreadable', reason: e instanceof Error ? e.message : 'JSON değil' }
  }
  if (typeof ham !== 'object' || ham === null) return { kind: 'unreadable', reason: 'nesne değil' }
  const o = ham as Record<string, unknown>
  if (typeof o['writtenAt'] !== 'string') {
    return { kind: 'unreadable', reason: 'writtenAt yok' }
  }
  const d = o['doc']
  if (typeof d !== 'object' || d === null) return { kind: 'unreadable', reason: 'doc yok' }

  const dogrulama = validateDocument(d as DocumentModel)
  if (!dogrulama.ok) {
    return { kind: 'invalid_doc', reason: JSON.stringify(dogrulama.errors) }
  }
  return { doc: dogrulama.value, writtenAt: o['writtenAt'] }
}

export const isIrError = (r: IrFile | IrError): r is IrError => 'kind' in r
