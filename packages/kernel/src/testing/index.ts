// Test altyapısı — `@suite/kernel/testing` alt yolundan açılır (§15).
//
// Neden AYRI export yolu: `msw` yalnız burada import edilir. Ana `@suite/kernel`
// girişinden dışa açılsaydı msw üretim bağımlılık grafiğine girerdi — ve test aracı
// üretim grafiğine girdiği gün "bir ay ihmal edilse de çalışır" (ilke 12) zayıflar.
export {
  CASSETTE_ROOT,
  cassetteExists,
  cassettePath,
  entryKey,
  findEntry,
  loadCassette,
  redactHeaders,
  redactText,
  saveCassette,
  toEntry,
  toResponse,
  type Cassette,
  type CassetteEntry,
} from './cassette.js'

export { recordingServer, replayServer, type MswServer, type RecordingServer } from './msw.js'

export { FIXTURE_ROOT, fixturePath, readFixture, readJsonFixture } from './fixtures.js'
