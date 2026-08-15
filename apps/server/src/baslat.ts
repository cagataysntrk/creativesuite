// Süreç sınırı — dinleyiciyi açan tek yer (FAZ-4.2).
//
// `serve()` BU pakette çağrılır, `scripts/`te değil: `@hono/node-server` bu paketin
// bağımlılığıdır ve pnpm workspace'te kök `node_modules`ta YOKTUR. İlk sürüm betikten
// import etmeye çalıştı ve `ERR_MODULE_NOT_FOUND` ile düştü — bağımlılığın nerede
// yaşadığı, onu kimin çağırabileceğini belirler.
//
// Ayrıca doğru olan da bu: betik ince kalır, mantık tip denetimli pakette durur (D-153).

import { serve } from '@hono/node-server'
import { kurSunucu, type SunucuSecenekleri } from './sunucu.js'

export interface BaslatSecenekleri extends SunucuSecenekleri {
  readonly port: number
}

export interface CalisanSunucu {
  readonly port: number
  readonly izlenen: readonly string[]
  readonly kapat: () => Promise<void>
}

export const baslat = async (o: BaslatSecenekleri): Promise<CalisanSunucu> => {
  const sunucu = kurSunucu(o)

  const { dinleyici, port } = await new Promise<{
    dinleyici: ReturnType<typeof serve>
    port: number
  }>((resolve) => {
    const d = serve({ fetch: sunucu.app.fetch, port: o.port }, (bilgi) => {
      resolve({ dinleyici: d, port: bilgi.port })
    })
  })

  return {
    port,
    izlenen: sunucu.izleme.izlenen,
    // Kapanış TEMİZ olmak zorunda: izleyicileri ve SQLite handle'ını açık bırakan bir
    // süreç, `just dev`i ikinci kez çalıştırdığında kilitli bir veritabanı bırakır.
    kapat: () =>
      new Promise<void>((resolve) => {
        sunucu.kapat()
        dinleyici.close(() => resolve())
      }),
  }
}
