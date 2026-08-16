// Düzen seçimi — İÇERİKTEN, elle değil (§7.1 · FAZ-10.4 · D-254).
//
// **Bugünkü durum:** `uret.mjs` her karosel için `layout: 'statement'` yazıyor. Yani
// dört düzenden üçü hiç kullanılmıyor ve altı maddelik bir liste, `statement`ın iki
// bloklu bütçesiyle üç slayda bölünüyor — içerik bunu istemediği hâlde.
//
// ⚠ **`LayoutEnum` KAPALI kalıyor ve bu bilinçli.** Plan taslağında "istatistik slaydı ·
// adım slaydı · çıkarım kutusu · karşılaştırma slaydı" yazıyordu — dördü de enum'da YOK
// ve aynı planın kabul ölçütü "enum'a yeni değer eklenmiyor" diyordu. Kendi planımla
// çelişiyordu. Doğru olan enum'u büyütmek değil, **sinyalleri var olan dört düzene
// EŞLEMEK**: bir "istatistik slaydı" zaten `claim-proof`tur (sayı bir kanıttır),
// "adım slaydı" zaten `list`tir. Yeni ad, yeni davranış demek değil.
//
// ⚠ **Bulgu: düzen bugün yalnız SAYFALAMAYI etkiliyor, görünümü DEĞİL.** `LAYOUT_SPECS`
// üç alan taşıyor (`maxBlocks`, `headingBudget`, `bodyBudget`) ve üçü de bölme kararına
// giriyor; `static.ts` `layout`u hiç görmüyor. Yani `quote` seçmek bugün alıntı gibi
// GÖRÜNMÜYOR, yalnız daha uzun bir başlığa izin veriyor. Adlar görsel bir vaat taşıyor,
// motor o vaadi karşılamıyor. Bu bir kusur ve FAZ-10.4b'ye açıldı — burada
// gizlenmiyor, çünkü "düzen seçimi eklendi" cümlesi onu örtmeye çok uygun.

import type { Block } from '@suite/kernel'
import type { LayoutName } from './adlar.js'

const metin = (b: Block): string =>
  b.type === 'heading' || b.type === 'body' ? b.text : b.type === 'chart' ? b.title : ''

/** Alıntı işaretleri — Türkçe tırnak (« » " " „) ve düz tırnak. */
const ALINTI_BASI = /^\s*["«“„]/
/** Kaynak atfı: satır başında uzun tire + isim. Alıntının imzası budur. */
const ATIF = /^\s*[—–-]\s*\p{Lu}/u
/** Madde işareti ya da numaralandırma. */
const MADDE = /^\s*(?:[-•*]|\d+[.)])\s+/
/**
 * Sayısal iddia: rakam + birim/yüzde/çarpan.
 *
 * Çıplak rakam YETMEZ — bir tarih ya da sürüm numarası iddia değildir. R-32 zaten
 * kaynaksız sayıyı yasaklıyor; bu desen o kuralın ölçüm tarafı değil, düzen tarafı.
 *
 * ⚠ **İşaret sayıdan ÖNCE de gelir ve bu Türkçeye özgü:** `%4`, `₺1.500` — İngilizcedeki
 * `4%` sırası burada YANLIŞ. İlk sürüm yalnız `sayı+birim` arıyordu ve `%4` içeren bir
 * kanıt cümlesini `statement` sanıyordu; testin girdi→çıktı tablosu yakaladı. Aynı
 * ailedeki hatalar (`'i'.toUpperCase()`, POSIX sınıfları) bu depoda üç kez tekrar etti:
 * **İngilizce sıradan devralınan her varsayım Türkçede bir kez daha sınanmalı.**
 */
const SAYISAL =
  /(?:[%₺$]\s*\d+(?:[.,]\d+)?)|(?:\d+(?:[.,]\d+)?\s*(?:%|kat|adet|saat|dakika|gün|ay|yıl|kg|ton|TL|₺|\$))/i

/**
 * Blok listesinden düzen seçer. **Saf ve deterministik** — aynı içerik her zaman aynı
 * düzeni verir, yoksa golden test kurulamaz ve iki koşu iki farklı sayfalama üretir.
 *
 * **Öncelik sırası bir karardır**, tesadüf değil: bir blok hem alıntı hem sayısal
 * olabilir. Alıntı önce geliyor çünkü alıntının BİÇİMİ içeriğinden baskındır — tırnak
 * içindeki bir cümle, içinde yüzde geçse de alıntı olarak okunur. Liste ikinci: madde
 * işareti de biçimsel bir işarettir. Sayısal üçüncü, çünkü o içeriğe dair bir sinyal.
 */
export const duzenSec = (blocks: readonly Block[]): LayoutName => {
  const metinler = blocks.map(metin).filter((t) => t.trim() !== '')
  if (metinler.length === 0) return 'statement'

  const alinti = metinler.some((t) => ALINTI_BASI.test(t)) || metinler.some((t) => ATIF.test(t))
  if (alinti) return 'quote'

  // Liste: ya madde işaretli satırlar var, ya da üç ve daha fazla kısa gövde bloğu.
  // Üç eşiği: iki blok bir iddia+kanıt çiftidir, üç blok bir listedir.
  const maddeli = metinler.filter((t) => MADDE.test(t)).length >= 2
  const govdeSayisi = blocks.filter((b) => b.type === 'body').length
  if (maddeli || govdeSayisi >= 3) return 'list'

  if (metinler.some((t) => SAYISAL.test(t))) return 'claim-proof'

  return 'statement'
}
