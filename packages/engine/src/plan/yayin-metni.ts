// HEDEF: packages/engine/src/plan/yayin-metni.ts
//
// Platform başına yayın açıklaması (FAZ-19.12 · madde 3).
//
// ⚠ ⚠ **AÇIKLAMA METNİ BUGÜNE KADAR HİÇ ÜRETİLMİYORDU.** `PUBLISH` gövdesi
// `input.constraints['caption']` okuyor ve o kısıt hattın HİÇBİR yerinde yazılmıyordu —
// yani her yayın boş açıklamayla gidecekti. Modül var, alan var, üreteni yoktu: bu
// depoda tekrar eden zincir kopukluğunun bir örneği daha.
//
// ⚠ ⚠ **DÖRT METİN TEK ÇAĞRIDA — dört ayrı adım DEĞİL.** Depo sahibi *"her birine özel
// şablon ve açıklama metni"* istedi. Dört ayrı `GENERATE` adımı dört model çağrısı,
// dört fiyat ve dört başarısızlık noktası demekti; üstelik metinler birbirinden
// habersiz yazılırdı ve aynı gönderinin dört sesi olurdu. Tek çağrı, tek bağlam:
// aynı kancayı platformun ölçüsüne göre KISALTMAK ya da AÇMAK.
//
// ⚠ ⚠ **SINIRLAR İSTEME YAZILIYOR — ve asıl sayı sert sınır DEĞİL.** X'e 280 demek
// yetmez; Instagram'a 2.200 demek ise doğrudan YANILTIR, çünkü akışta ilk ~125 karakter
// görünür. İsteme ikisi de giriyor ve hangisinin ne olduğu söyleniyor. İstemin sustuğu
// yerde model doldurur — bu depoda dört kez böyle oldu.
//
// ⚠ Yasa 8 burada da geçerli: kaynaksız sayısal iddia yayınlanamaz. Açıklama metni
// karoselde olmayan bir sayıyı ORTAYA ATAMAZ.

import { PLATFORMLAR, platformBul, platformDenetle, type PlatformId } from '@suite/contracts'

export interface YayinMetniGirdisi {
  readonly konu: string
  /** Karoselin kendi metni — açıklama ondan türemeli, ondan kopmamalı. */
  readonly kartMetni: string
  readonly slaytSayisi: number
  readonly platformlar: readonly PlatformId[]
}

/**
 * İstem — platform başına ölçü ve rol.
 *
 * ⚠ Platform listesi BOŞSA `null`: üretilecek metin yoksa model çağrılmaz. Boş bir
 * istem göndermek, bir çağrının parasını hiçbir şey için harcamak olurdu.
 */
export const yayinMetniIstemi = (g: YayinMetniGirdisi): string | null => {
  const secili = g.platformlar
    .map((id) => platformBul(id))
    .filter((p): p is NonNullable<typeof p> => p !== null)
  if (secili.length === 0) return null
  return [
    'Bir Instagram karoseli için PLATFORM BAŞINA yayın açıklaması yazacaksın.',
    '',
    `Konu: ${g.konu}`,
    `Karosel ${String(g.slaytSayisi)} slayt ve şunları söylüyor:`,
    g.kartMetni,
    '',
    'Açıklama karoselin TEKRARI DEĞİL: karoselde olanı özetlemek yerine onu bir',
    'sebeple çerçevele ve okuyucuyu kaydırmaya çağır.',
    // ⚠ ⚠ **YASA 8 BURADA DA:** açıklama, karoselde olmayan bir sayıyı ortaya atamaz.
    // Kaynak baskısı açıklamada karoselden düşük ve uydurma sayı riski en yüksek orada.
    'Karoselde geçmeyen bir sayı, yüzde ya da tarih EKLEME.',
    '',
    'Her platformun ölçüsü ve rolü AYRI:',
    ...secili.flatMap((p) => [
      `  · ${p.ad} (${p.id})`,
      `      en fazla ${String(p.metinTavani)} karakter — bu SERT sınır, aşarsa reddedilir.`,
      p.katlanmaOncesi < p.metinTavani
        ? `      ilk ~${String(p.katlanmaOncesi)} karakter akışta görünür, gerisi "devamı"` +
          ' arkasında kalır — KANCA oraya sığmalı.'
        : '      metnin tamamı görünür; kesim yok.',
    ]),
    '',
    'YALNIZ şu JSON ile cevapla, başka hiçbir şey yazma:',
    '{' + secili.map((p) => `"${p.id}": "<metin>"`).join(', ') + '}',
  ].join('\n')
}

export type YayinMetinleri = Partial<Record<PlatformId, string>>

export interface MetinKusuru {
  readonly platform: PlatformId
  readonly aciklama: string
}

export interface YayinMetniSonucu {
  readonly metinler: YayinMetinleri
  /** Yalnız ENGELLEYEN kusurlar; uyarılar `uyarilar`da. */
  readonly kusurlar: readonly MetinKusuru[]
  readonly uyarilar: readonly MetinKusuru[]
}

/**
 * Model çıktısını çözer ve HER metni kendi platformunun sınırına karşı sınar.
 *
 * ⚠ ⚠ **DOĞRULAMA BURADA, YAYINDA DEĞİL.** 281 karakterlik bir X metnini yayın anında
 * öğrenmek, dört görsel ve bir insan onayı harcandıktan sonra öğrenmek demek — bu
 * depoda R-90 aynı dersi JPEG ile bir kez verdi.
 * ⚠ Eksik platform bir KUSUR: istenen dört metinden üçü gelirse kalan platform sessizce
 * açıklamasız yayınlanırdı ve bunu ancak yayından sonra görürdük.
 */
export const yayinMetniCozumle = (ham: string, g: YayinMetniGirdisi): YayinMetniSonucu | null => {
  // Dengeli süslü parantezle adaylar çıkarılıyor ve SONDAN başlanıyor: modelin son
  // sözü, düzeltmesidir. Aynı desen `konu-sec`te de var ve sebebi ölçülmüş bir koşu.
  const adaylar: string[] = []
  let derinlik = 0
  let bas = -1
  for (let i = 0; i < ham.length; i++) {
    const c = ham[i]
    if (c === '{') {
      if (derinlik === 0) bas = i
      derinlik += 1
    } else if (c === '}') {
      derinlik -= 1
      if (derinlik === 0 && bas >= 0) adaylar.push(ham.slice(bas, i + 1))
      if (derinlik < 0) derinlik = 0
    }
  }
  let veri: Record<string, unknown> | null = null
  for (const parca of [...adaylar].reverse()) {
    try {
      const d = JSON.parse(parca) as Record<string, unknown>
      if (PLATFORMLAR.some((p) => typeof d[p.id] === 'string')) {
        veri = d
        break
      }
    } catch {
      // Bu aday JSON değil; sıradakine bak.
    }
  }
  if (veri === null) return null

  const metinler: Record<string, string> = {}
  const kusurlar: MetinKusuru[] = []
  const uyarilar: MetinKusuru[] = []
  for (const id of g.platformlar) {
    const p = platformBul(id)
    if (p === null) continue
    const m = veri[id]
    if (typeof m !== 'string' || m.trim() === '') {
      kusurlar.push({ platform: id, aciklama: `${p.ad} için metin gelmedi` })
      continue
    }
    metinler[id] = m.trim()
    for (const k of platformDenetle(m, g.slaytSayisi, p)) {
      const satir =
        k.tur === 'metin-tavani-asildi'
          ? `${p.ad}: metin ${String(k.uzunluk)} karakter, tavan ${String(k.tavan)}`
          : k.tur === 'karosel-tavani-asildi'
            ? `${p.ad}: ${String(k.slayt)} slayt, tavan ${String(k.tavan)}`
            : k.tur === 'metin-bos'
              ? `${p.ad}: metin boş`
              : `${p.ad}: kanca ilk ~${String(k.katlanmaOncesi)} karakteri aşıyor`
      if (k.tur === 'kanca-katlanmanin-otesinde') uyarilar.push({ platform: id, aciklama: satir })
      else kusurlar.push({ platform: id, aciklama: satir })
    }
  }
  return { metinler: metinler as YayinMetinleri, kusurlar, uyarilar }
}
