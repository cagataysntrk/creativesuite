import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { readEnv } from '../config/env.js'
import { fixturePath } from '../testing/fixtures.js'
import { makeTempDir } from '../testing/tempdir.js'
import { systemClock } from '../time/clock.js'
import { commandExists, spawnProcess } from './spawn.js'

const NODE = process.execPath
const PATH_ENV = { PATH: readEnv('PATH') ?? '' }

/** Alt süreçte koşacak küçük programlar. Harici script dosyası yok — test kendi kendine yeter. */
const kod = (s: string): readonly string[] => ['-e', s]

describe('alt süreç başlatıcı (§3.8 · §8.5)', () => {
  it('çıktıyı ve çıkış kodunu döndürür', async () => {
    const r = await spawnProcess(NODE, kod('process.stdout.write("merhaba")'), { env: PATH_ENV })
    expect(r.code).toBe(0)
    expect(r.stdout).toBe('merhaba')
    expect(r.aborted).toBe(false)
    expect(r.timedOut).toBe(false)
  })

  it('başarısız süreç istisna DEĞİL, sonuç döndürür (§8.6)', async () => {
    const r = await spawnProcess(NODE, kod('process.stderr.write("patladi"); process.exit(3)'), {
      env: PATH_ENV,
    })
    expect(r.code).toBe(3)
    expect(r.stderr).toContain('patladi')
  })

  it('olmayan komut da SONUÇTUR — kod null, stderr dolu', async () => {
    const r = await spawnProcess('yokbu-komut-xyz', [], { env: PATH_ENV })
    expect(r.code).toBeNull()
    expect(r.stderr.length).toBeGreaterThan(0)
  })

  it('stdin geçirilir', async () => {
    const r = await spawnProcess(
      NODE,
      // Alt süreçte case dönüşümü YAPILMIYOR: `turkish-case` kapısı dize içindeki
      // `.toUpperCase()`i de yakalar ve haklı — grep kodu dizeden ayırt edemez,
      // etmeye çalışsa yanlış negatif üretir. Ters çevirme aynı şeyi kanıtlar.
      kod(
        'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>process.stdout.write([...s].reverse().join("")))'
      ),
      { env: PATH_ENV, input: 'abc' }
    )
    expect(r.stdout).toBe('cba')
  })

  it('ortam DEVRALINMAZ — yalnız açıkça verilen anahtarlar geçer (§14)', async () => {
    // Çocuk program bir FIXTURE dosyasıdır, `node -e` dizesi değil: `secret-okuyucu`
    // darboğazı dize içindeki `process.env`i de yakalar ve haklı (bkz. print-env.cjs).
    const YARDIMCI = fixturePath('proc', 'print-env.cjs')

    // Üst süreçte var olan bir anahtar çocuğa GEÇMEMELİ.
    const ustte = 'HOME'
    expect(readEnv(ustte)).toBeDefined()
    const r = await spawnProcess(NODE, [YARDIMCI, ustte], { env: { ...PATH_ENV, ACIK: 'evet' } })
    expect(r.stdout).toBe('undefined')

    // Açıkça verilen anahtar geçmeli.
    const r2 = await spawnProcess(NODE, [YARDIMCI, 'ACIK'], {
      env: { ...PATH_ENV, ACIK: 'evet' },
    })
    expect(r2.stdout).toBe('evet')
  })
})

describe('iptal ve zaman aşımı — alt süreç TEMİZLENİYOR (FAZ-1.12 ✅)', () => {
  it('AbortSignal ile iptal edilen süreç öldürülür ve saniyeler içinde döner', async () => {
    const ac = new AbortController()
    const t0 = systemClock.now()
    // Sonsuza kadar çalışacak bir süreç: iptal etmezsek test zaman aşımına uğrar.
    const p = spawnProcess(NODE, kod('setInterval(()=>{},1000)'), {
      env: PATH_ENV,
      signal: ac.signal,
      graceMs: 200,
    })
    setTimeout(() => ac.abort(), 50)
    const r = await p
    const gecen = systemClock.now() - t0

    expect(r.aborted).toBe(true)
    expect(r.signal === 'SIGTERM' || r.signal === 'SIGKILL' || r.code !== 0).toBe(true)
    // Kabul kriteri "5 sn içinde temizleniyor" — ölçülen süre onun çok altında.
    expect(gecen).toBeLessThan(5_000)
  })

  it('zaten iptal edilmiş sinyalle başlatılan süreç hemen öldürülür', async () => {
    const ac = new AbortController()
    ac.abort()
    const r = await spawnProcess(NODE, kod('setInterval(()=>{},1000)'), {
      env: PATH_ENV,
      signal: ac.signal,
      graceMs: 100,
    })
    expect(r.aborted).toBe(true)
  })

  it('zaman aşımı süreci öldürür ve timedOut işaretlenir', async () => {
    const r = await spawnProcess(NODE, kod('setInterval(()=>{},1000)'), {
      env: PATH_ENV,
      timeoutMs: 150,
      graceMs: 200,
    })
    expect(r.timedOut).toBe(true)
    expect(r.aborted).toBe(false)
  })

  it('SIGTERM yok sayan süreç SIGKILL ile öldürülür — iki aşamalı', async () => {
    // SIGTERM'i yutan bir süreç. Yalnız SIGTERM gönderilseydi bu test asılı kalırdı.
    //
    // Abort SABİT GECİKMEYLE değil, çocuğun HAZIR sinyaliyle veriliyor: handler
    // kurulmadan gelen SIGTERM süreci varsayılan davranışla öldürür ve test rastgele
    // kırmızıya döner (bkz. sigterm-yutan.cjs). Yarışı testten silmek, yarışın
    // kendisini test etmekten daha değerli — burada sınanan şey iki aşamalı öldürme.
    const tmp = makeTempDir('suite-sigterm-')
    try {
      const hazirlik = join(tmp.path, 'hazir')
      const ac = new AbortController()
      const p = spawnProcess(NODE, [fixturePath('proc', 'sigterm-yutan.mjs'), hazirlik], {
        env: PATH_ENV,
        signal: ac.signal,
        graceMs: 300,
      })

      // Hazırlık dosyası belirene kadar bekle. Tavan 5 sn: süreç hiç açılmazsa test
      // asılı kalmasın, ZAMAN AŞIMIYLA değil AÇIK bir iddiayla düşsün. `throw`
      // kullanılmıyor — `hata-taksonomisi` darboğazı testleri de kapsıyor ve haklı:
      // fırlatma tek dosyada yaşar, bir iddia zaten aynı bilgiyi taşır (§8.6).
      const bitis = systemClock.now() + 5_000
      let hazir = existsSync(hazirlik)
      while (!hazir && systemClock.now() < bitis) {
        await new Promise((r) => setTimeout(r, 10))
        hazir = existsSync(hazirlik)
      }
      expect(hazir, 'alt süreç 5 sn içinde hazır olmadı').toBe(true)

      ac.abort()
      const r = await p
      expect(r.aborted).toBe(true)
      expect(r.signal).toBe('SIGKILL')
    } finally {
      tmp.cleanup()
    }
  })
})

describe('çıktı sınırı', () => {
  it('sınır aşılınca SESSİZCE kırpılmaz, truncated bildirilir', async () => {
    const r = await spawnProcess(NODE, kod('process.stdout.write("x".repeat(50000))'), {
      env: PATH_ENV,
      maxOutputBytes: 1_000,
    })
    expect(r.truncated).toBe(true)
    expect(r.stdout.length).toBeLessThan(50_000)
  })
})

describe('commandExists — senkron, ağsız (R-42)', () => {
  it('var olan ve olmayan komutu ayırt eder', () => {
    expect(commandExists('node', readEnv('PATH'))).toBe(true)
    expect(commandExists('yokbu-komut-xyz', readEnv('PATH'))).toBe(false)
  })

  it('PATH yoksa false — sessizce true dönmez', () => {
    expect(commandExists('node', undefined)).toBe(false)
    expect(commandExists('node', '')).toBe(false)
  })

  it("yol içeren komut PATH'te aranmaz, doğrudan bakılır", () => {
    expect(commandExists(NODE, undefined)).toBe(true)
    expect(commandExists('/yok/boyle/bir/dosya', readEnv('PATH'))).toBe(false)
  })
})

// ⚠ ⚠ **BORUYU DEVRALAN TORUN — GERÇEK BİR ASILMANIN TESTİ (D-272).** `claude` CLI
// kalıcı bir daemon doğurup stdout borusunu ona devrediyor; CLI ölse bile Node `close`
// yaymıyor (`close` TÜM stdio kapanmasını bekler) ve promise sonsuza kadar bekliyor.
// Hat bu yüzden `sablon-uyarla` adımında iki ayrı koşuda 21'er dakika asıldı ve
// **10 dakikalık zaman aşımı da kurtarmadı**: o da `SIGTERM` gönderip aynı `close`
// olayını bekliyordu — kurtarma yolu asıl yolla aynı olaya bağlıydı.
describe('boruyu devralan torun süreç', () => {
  // ⚠ Süre ÖLÇÜLMÜYOR: saat darboğazı (§13) testte de geçerli ve gerek de yok —
  // asılma zaten testin kendi zaman aşımıyla kırmızıya döner. `exit` dinleyicisi
  // kaldırılıp denendi: test 20 sn tavana dayanıp ASILDI, dinleyiciyle 388 ms'de döndü.
  it('süreç ölünce ASILMADAN sonuç dönüyor', async () => {
    const fixture = join(import.meta.dirname, 'fixtures/boru-devreden.mjs')
    const r = await spawnProcess(process.execPath, [fixture], { env: {}, timeoutMs: 15_000 })
    expect(r.code).toBe(0)
    expect(r.stdout).toContain('merhaba')
    expect(r.timedOut).toBe(false)
  }, 8_000)
})

// ⚠ ⚠ **ZAMAN AŞIMI GARANTİ Mİ, RİCA MI — ölçülmüş cevap: eskiden RİCAYDI.**
//
// `just uret` gerçek bir koşuda on beş dakika asıldı: `ps` hiçbir çocuk göstermiyordu,
// süreç `ep_poll`de boştaydı ve **on dakikalık zaman aşımı da kurtarmadı**. Sebep bir
// üstteki D-272 notunun birebir tekrarı: zaman aşımı öldürüp YİNE bir olay bekliyordu.
// Ders yazılmıştı ama yalnız `exit` yoluna uygulanmıştı, zaman aşımı yoluna değil.
describe('SIGTERM yutan + boruyu devreden süreç', () => {
  it('zaman aşımından sonra ASILMADAN dönüyor', async () => {
    const fixture = join(import.meta.dirname, 'fixtures/olmez-boru.mjs')
    const r = await spawnProcess(process.execPath, [fixture], {
      env: {},
      timeoutMs: 300,
      graceMs: 200,
    })
    expect(r.timedOut).toBe(true)
    // Eldeki çıktı KAYBOLMUYOR: süreç ölmeden önce yazdığı şey sonuçta.
    expect(r.stdout).toContain('basladi')
  }, 8_000)

  // ⚠ ⚠ **BU TEST, YUKARIDAKİNİN ÖLÇEMEDİĞİ ŞEYİ ÖLÇÜYOR.** Üstteki test son çare
  // ağını kasten bozunca da YEŞİL kaldı: `SIGKILL` alan süreç ölüyor, `exit` geliyor
  // ve ağ hiç devreye girmiyordu. Gerçek arıza ise sinyalin hiçbir şey YAPMADIĞI
  // durumdu. Sinyal gönderimi dikiş olduğu için o durum artık kurulabiliyor.
  it('sinyal hiçbir şey yapmasa BİLE dönüyor — zaman aşımı bir garantidir', async () => {
    const fixture = join(import.meta.dirname, 'fixtures/olmez-boru.mjs')
    const cocuklar: NodeJS.Signals[] = []
    const r = await spawnProcess(process.execPath, [fixture], {
      env: {},
      timeoutMs: 300,
      graceMs: 200,
      // Sinyal YUTULUYOR: süreç ölmez, hiçbir olay gelmez.
      sinyalGonder: (s) => {
        cocuklar.push(s)
      },
    })
    expect(r.timedOut).toBe(true)
    expect(cocuklar).toEqual(['SIGTERM', 'SIGKILL'])
    expect(r.stdout).toContain('basladi')
  }, 8_000)
})
