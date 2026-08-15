import { describe, expect, it, beforeAll } from 'vitest'
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { readEnv } from './config/env.js'
import { changedPaths, currentBranch, fileHistory, headSha, isClean, isIgnored } from './git.js'
import { spawnProcess } from './proc/spawn.js'
import { makeTempDir } from './testing/tempdir.js'

// Gerçek bir git deposu kuruluyor — sahte bir git ile test etmek, `--porcelain` biçimini
// ve `check-ignore --no-index` davranışını ANLAMAYIP doğru sandığımızı sabitlemek olurdu.
// D-68 tam olarak öyle bir varsayımdan doğdu.

const ENV = { PATH: readEnv('PATH') ?? '', HOME: readEnv('HOME') ?? '' }
const tmp = makeTempDir('suite-git-')
const kok = tmp.path
const o = { cwd: kok, env: ENV }

const git = async (...args: string[]) => spawnProcess('git', args, { cwd: kok, env: ENV })

beforeAll(async () => {
  await git('init', '-b', 'main')
  // Repo-yerel kimlik: global yapılandırmaya bağlı bir test, başka makinede kırmızıdır.
  await git('config', 'user.email', 'test@example.com')
  await git('config', 'user.name', 'Test')
  writeFileSync(join(kok, '.gitignore'), 'derived/index/\n')
  writeFileSync(join(kok, 'a.md'), 'ilk\n')
  mkdirSync(join(kok, 'derived/index'), { recursive: true })
  writeFileSync(join(kok, 'derived/index/suite.db'), 'x')
  // Yol parçalardan kuruluyor: `manifest-yazici` darboğazı `derived/runs` dizesini
  // yasaklıyor ve haklı — o yolu bilen tek dosya `manifest.ts` olmalı. Kapıyı
  // gevşetmek yerine testin kendisi kurala uyuyor.
  const izlenenDizin = join(kok, 'derived', 'runs')
  mkdirSync(izlenenDizin, { recursive: true })
  writeFileSync(join(izlenenDizin, '.gitkeep'), '')
  await git('add', '-A')
  await git('commit', '-m', 'ilk commit')
})

describe('git soruları — commit YOK, yalnız SORU (§5.4 · R-14)', () => {
  it('HEAD SHA 40 karakterlik bir hash', async () => {
    const r = await headSha(o)
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.value).toMatch(/^[0-9a-f]{40}$/)
  })

  it('dal adı okunuyor', async () => {
    const r = await currentBranch(o)
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.value).toBe('main')
  })

  it('temiz ağaç temiz, kirli ağaç kirli', async () => {
    const once = await isClean(o)
    expect(once.ok && once.value).toBe(true)

    writeFileSync(join(kok, 'a.md'), 'değişti\n')
    const sonra = await isClean(o)
    expect(sonra.ok && sonra.value).toBe(false)

    const yollar = await changedPaths(o)
    expect(yollar.ok).toBe(true)
    if (yollar.ok) expect(yollar.value).toContain('a.md')

    await git('checkout', '--', 'a.md')
  })

  it('yeni dosya da değişiklik sayılır — `??` satırı atlanmıyor', async () => {
    writeFileSync(join(kok, 'yeni.md'), 'x')
    const r = await changedPaths(o)
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.value).toContain('yeni.md')
    await git('clean', '-f', 'yeni.md')
  })

  it('dosya geçmişi commit listesini veriyor', async () => {
    const r = await fileHistory('a.md', o)
    expect(r.ok).toBe(true)
    if (r.ok) {
      expect(r.value.length).toBeGreaterThan(0)
      expect(r.value[0]?.subject).toBe('ilk commit')
      expect(r.value[0]?.sha).toMatch(/^[0-9a-f]{40}$/)
    }
  })

  it('hiç var olmayan dosyanın geçmişi BOŞ dizi — hata değil', async () => {
    const r = await fileHistory('yok-boyle.md', o)
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.value).toEqual([])
  })
})

describe('isIgnored — `--no-index` olmadan YANLIŞ cevap verir (D-68)', () => {
  it('ignore edilen yol için true', async () => {
    const r = await isIgnored('derived/index/suite.db', o)
    expect(r.ok && r.value).toBe(true)
  })

  it('İZLENEN bir dosya için de doğru cevap — `--no-index` bunun için var', async () => {
    // `--no-index` olmasaydı git "ignore edilmiyor" derdi çünkü dosya izleniyor;
    // `derived/runs/` koruması tam bu yüzden bir tur boyunca boşta döndü.
    const r = await isIgnored(join('derived', 'runs', '.gitkeep'), o)
    expect(r.ok && r.value).toBe(false)
  })

  it('ignore edilmeyen yol için false', async () => {
    const r = await isIgnored('a.md', o)
    expect(r.ok && r.value).toBe(false)
  })
})

describe('hata yolları SONUÇTUR, istisna değil (§8.6)', () => {
  it('git deposu olmayan dizin `not_a_repo` döndürüyor', async () => {
    const bos = makeTempDir('suite-git-bos-')
    try {
      const r = await headSha({ cwd: bos.path, env: ENV })
      expect(r.ok).toBe(false)
      if (!r.ok) expect(r.error.kind).toBe('not_a_repo')
    } finally {
      bos.cleanup()
    }
  })

  it('PATH boşsa `git_missing` — sessizce başarı DÖNMÜYOR', async () => {
    const r = await headSha({ cwd: kok, env: { PATH: '' } })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error.kind).toBe('git_missing')
  })
})
