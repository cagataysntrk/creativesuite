import { describe, expect, it } from 'vitest'
import { fromFileUrl, moduleDir, repoRootFrom, underRoot } from './paths.js'

// Bu dosyanın var olma sebebi 2026-08-14'teki gerçek hata: bir betik
// `new URL(import.meta.url).pathname` kullandı, Türkçe dizin adı URL-kodlu kaldı ve
// 44 dosya `~/%C4%B0ndirilenler` diye bir dizine yazıldı. Kimse hata almadı.
// Doğrulama agent'ı 2026-08-15'te modülün hiç çalıştırılmadığını buldu: darboğaz
// deseni yanlış biçimi yasaklıyordu ama DOĞRU biçimin doğru çalıştığı sınanmamıştı.
const TR_URL = 'file:///home/kullanici/%C4%B0ndirilenler/projeler/creativesuite/a.ts'
const TR_YOL = '/home/kullanici/İndirilenler/projeler/creativesuite/a.ts'

describe('yol çözücü — Türkçe dizin adları (§3.8 · D-51)', () => {
  it('URL-kodlu Türkçe karakteri ÇÖZER', () => {
    expect(fromFileUrl(TR_URL)).toBe(TR_YOL)
  })

  it('yasaklanan biçim gerçekten bozuk — kapının neyi koruduğu görünür', () => {
    // `import.meta.url` DEĞİL, düz bir dize: `yol-cozucu` darboğazı yalnız
    // `new URL(import.meta.url).pathname` biçimini yasaklar ve bu doğru — burada
    // hatanın kendisini kanıtlıyoruz, işlemiyoruz.
    const bozuk = new URL(TR_URL).pathname
    expect(bozuk).toContain('%C4%B0')
    expect(bozuk).not.toBe(TR_YOL)
  })

  it('moduleDir dosyanın dizinini verir, dosyayı değil', () => {
    expect(moduleDir(TR_URL)).toBe('/home/kullanici/İndirilenler/projeler/creativesuite')
  })

  it('repoRootFrom varsayılan olarak üç seviye çıkar (packages/<ad>/src)', () => {
    const kok = repoRootFrom('file:///repo/packages/kernel/src/x.ts')
    expect(kok).toBe('/repo')
  })

  it('up ayarlanabilir — derinliği yanlış varsaymaz', () => {
    expect(repoRootFrom('file:///repo/scripts/x.mjs', 1)).toBe('/repo')
    expect(repoRootFrom('file:///repo/a/b/c/d/x.ts', 4)).toBe('/repo')
  })

  it('underRoot parçaları köke ekler ve normalize eder', () => {
    expect(underRoot('/repo', 'packages', 'kernel')).toBe('/repo/packages/kernel')
    expect(underRoot('/repo', 'a/..', 'b')).toBe('/repo/b')
  })

  it('kök Türkçe olduğunda da birleştirme bozulmaz', () => {
    expect(underRoot(moduleDir(TR_URL), 'derived')).toContain('İndirilenler')
  })
})
