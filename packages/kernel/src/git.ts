// `git` çağıran TEK dosya (§3.8 · §5.4 · chokepoints.json → `git-cagiran`).
//
// **Onay = git commit** (R-14, D-31). Bu yüzden git bir uygulama detayı değil, sistemin
// yetkilendirme mekanizmasıdır: iki git çağırıcı, biri kancasız çalışan iki onay yolu
// demektir — ve `commit-msg` kancasını atlayan bir yol, kural kitabını atlayan yoldur.
//
// **Burada `commit` fonksiyonu YOKTUR ve olmayacak.** Commit insanın eylemidir
// (`just save`). Kernel'in commit atabilmesi, agent'ın kendi önerisini onaylayabilmesi
// demekti — R-14'ün tam olarak engellediği şey. Bu dosya git'e yalnız SORU sorar.

import { spawnProcess } from './proc/spawn.js'

export interface GitOptions {
  /** Depo kökü. */
  readonly cwd: string
  /** Ortam AÇIKÇA verilir (§14). `PATH` olmadan `git` bulunamaz. */
  readonly env: Readonly<Record<string, string>>
  readonly timeoutMs?: number
}

export type GitFailure =
  | { readonly kind: 'not_a_repo' }
  | { readonly kind: 'git_missing' }
  | { readonly kind: 'command_failed'; readonly code: number | null; readonly stderr: string }

export type GitResult<T> =
  { readonly ok: true; readonly value: T } | { readonly ok: false; readonly error: GitFailure }

/**
 * Ham git çağrısı. Dışa AÇIK değil bilerek: her çağrı adlandırılmış bir soru olarak
 * dışa açılır. `git(['whatever'])` serbest bırakılsaydı, `git commit` çağırmak tek
 * satır olurdu ve yukarıdaki yasak bir yorum satırından ibaret kalırdı.
 */
const git = async (args: readonly string[], o: GitOptions): Promise<GitResult<string>> => {
  const r = await spawnProcess('git', args, {
    cwd: o.cwd,
    env: o.env,
    timeoutMs: o.timeoutMs ?? 10_000,
  })
  // Yalnız SONDAKİ satır sonları atılır. `trim()` kullanılamaz: `--porcelain` biçiminde
  // ilk sütun DURUMDUR ve değiştirilmemiş bir dosya için boşluktur (` M a.md`).
  // `trim()` o boşluğu yiyor, yol bir karakter kayıyor ve `a.md` → `.md` oluyordu —
  // testi yazarken çıktı (2026-08-15). Görünmez bir karakterin anlam taşıdığı yerde
  // "temizlik" veri kaybıdır.
  if (r.code === 0) return { ok: true, value: r.stdout.replace(/\n+$/, '') }
  if (r.code === null && /ENOENT|not found/i.test(r.stderr)) {
    return { ok: false, error: { kind: 'git_missing' } }
  }
  if (/not a git repository/i.test(r.stderr)) return { ok: false, error: { kind: 'not_a_repo' } }
  return { ok: false, error: { kind: 'command_failed', code: r.code, stderr: r.stderr.trim() } }
}

/** `HEAD` commit SHA'sı. Run manifest'in `knowledgeCommitSha` alanı buradan gelir (§13). */
export const headSha = (o: GitOptions): Promise<GitResult<string>> => git(['rev-parse', 'HEAD'], o)

export const currentBranch = (o: GitOptions): Promise<GitResult<string>> =>
  git(['rev-parse', '--abbrev-ref', 'HEAD'], o)

/**
 * Çalışma ağacı temiz mi.
 *
 * **Neden `--porcelain`:** insan-okunur `git status` çıktısı yerelleştirilir ve sürümle
 * değişir; `--porcelain` sözleşmelidir. Türkçe locale'de "nothing to commit" aramak,
 * R-77'nin kabuk kardeşidir.
 */
export const isClean = async (o: GitOptions): Promise<GitResult<boolean>> => {
  const r = await git(['status', '--porcelain'], o)
  return r.ok ? { ok: true, value: r.value === '' } : r
}

/** Değişmiş dosya yolları. Boş dizi = temiz ağaç. */
export const changedPaths = async (o: GitOptions): Promise<GitResult<readonly string[]>> => {
  const r = await git(['status', '--porcelain'], o)
  if (!r.ok) return r
  const satirlar = r.value === '' ? [] : r.value.split('\n')
  // Porcelain biçimi: iki karakter durum + boşluk + yol. Yeniden adlandırmada
  // `eski -> yeni` gelir; HEDEF yol alınır, çünkü bugün var olan odur.
  return {
    ok: true,
    value: satirlar.map((s) => {
      const yol = s.slice(3)
      const ok = yol.indexOf(' -> ')
      return ok === -1 ? yol : yol.slice(ok + 4)
    }),
  }
}

/**
 * Bir dosyanın değişiklik geçmişi (yeniden adlandırmaları izleyerek).
 * Record Detail ekranının zaman çizgisi bunu kullanır (FAZ-4.4).
 */
export const fileHistory = async (
  path: string,
  o: GitOptions,
  limit = 50
): Promise<
  GitResult<readonly { readonly sha: string; readonly date: string; readonly subject: string }[]>
> => {
  const r = await git(['log', '--follow', `-n${limit}`, '--format=%H%x1f%aI%x1f%s', '--', path], o)
  if (!r.ok) return r
  if (r.value === '') return { ok: true, value: [] }
  return {
    ok: true,
    value: r.value.split('\n').map((satir) => {
      const [sha = '', date = '', subject = ''] = satir.split('\x1f')
      return { sha, date, subject }
    }),
  }
}

/**
 * Yol gerçekten ignore ediliyor mu.
 *
 * `--no-index` ŞART: onsuz `git check-ignore` izlenen bir dosya için "ignore edilmiyor"
 * der — dosya ignore desenine uysa bile. `derived/runs/` koruması (D-38, R-52) tam
 * bu yüzden bir tur boyunca boşta döndü (D-68).
 */
export const isIgnored = async (path: string, o: GitOptions): Promise<GitResult<boolean>> => {
  const r = await spawnProcess('git', ['check-ignore', '--no-index', '-q', path], {
    cwd: o.cwd,
    env: o.env,
    timeoutMs: o.timeoutMs ?? 10_000,
  })
  // 0 = ignore ediliyor, 1 = edilmiyor, diğerleri gerçek hata.
  if (r.code === 0) return { ok: true, value: true }
  if (r.code === 1) return { ok: true, value: false }
  return { ok: false, error: { kind: 'command_failed', code: r.code, stderr: r.stderr.trim() } }
}
