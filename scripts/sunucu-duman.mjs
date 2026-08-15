// `cli-duman` kapısının sunucu bölümü — GERÇEKTEN ayağa kaldırır (D-153, D-164).
//
// `node --check` yalnız sözdizimini görür. Bu betik sunucuyu başlatır, üç ucu çağırır,
// bir dosya değişimi tetikleyip SSE'nin yeni durumu yaydığını doğrular ve kapatır.
// Süreç TEMİZ kapanmalı: kapanmayan bir sunucu kapıyı sonsuza kadar asar.
import { utimesSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const REPO = process.env['SUITE_REPO'] ?? join(dirname(fileURLToPath(import.meta.url)), '..')
const { baslat } = await import(join(REPO, 'apps/server/dist/index.js'))
const { systemClock } = await import(join(REPO, 'packages/kernel/dist/index.js'))

const hatalar = []
const bekle = (k, d) => {
  if (!k) hatalar.push(d)
}

const s = await baslat({
  repoRoot: REPO,
  query: { brandId: 'brd_upcytech', eraId: '*', asOf: systemClock.nowIso() },
  kalpAtisiMs: 200,
  debounceMs: 50,
  simdi: () => systemClock.nowIso(),
  port: 0, // 0 = işletim sistemi boş port versin; sabit port paralel koşuda çakışır
})

const U = `http://localhost:${s.port}`
try {
  const saglik = await (await fetch(`${U}/api/saglik`)).json()
  bekle(saglik.ok === true, '/api/saglik ok:true dönmedi')
  bekle(Array.isArray(saglik.izlenen) && saglik.izlenen.length > 0, 'hiçbir dizin izlenmiyor')

  const durum = await (await fetch(`${U}/api/durum`)).json()
  bekle(
    /^\d+$/.test(durum.maliyetMikros),
    `maliyetMikros ondalık dize değil: ${durum.maliyetMikros}`
  )
  bekle(durum.kota === null, 'kota ölçülmüyorken null olmalı')
  bekle('bekleyenOnay' in durum, 'bekleyenOnay alanı yok')

  const r = await fetch(`${U}/api/olay`)
  const rd = r.body.getReader()
  const dec = new TextDecoder()
  const ilk = dec.decode((await rd.read()).value)
  bekle(ilk.startsWith('event: durum'), 'SSE ilk mesajı durum değil')

  setTimeout(() => {
    const t = systemClock.now() / 1000
    try {
      utimesSync(join(REPO, 'registry/pipelines/instagram-post.pipeline.yaml'), t, t)
    } catch {}
  }, 100)
  let g = ''
  for (let i = 0; i < 12 && !g.startsWith('event: durum'); i++)
    g = dec.decode((await rd.read()).value)
  bekle(g.startsWith('event: durum'), 'dosya değişimi SSE durumu tetiklemedi')
  await rd.cancel()
} finally {
  await s.kapat()
}

if (hatalar.length > 0) {
  for (const h of hatalar) console.log(`    ✗ ${h}`)
  process.exit(1)
}
console.log(`    sunucu ayağa kalktı · 3 uç · SSE dosya değişimini yaydı`)
