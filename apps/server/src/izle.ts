// Dosya izleme — registry ve çalıştırma defteri (§12.4 · FAZ-4.2).
//
// **`chokidar` KULLANILMIYOR** (R-75, D-162). Node 20'den beri `fs.watch` Linux ve
// macOS'ta `recursive: true` destekliyor; ihtiyacımız olan tam olarak bu. chokidar'ın
// asıl değeri, `fs.watch`ın platformlar arası tutarsızlığını gizlemesi — bizim tek bir
// yerel platformumuz var ve onu doğrudan test edebiliyoruz.
//
// **Debounce zorunlu, süs değil:** tek bir dosya kaydetme `rename` + `change` olarak iki
// kez gelir ve bir editörün atomik yazması (geçici dosya + rename) üç olay üretir.
// Debounce olmadan her kaydetme üç SSE mesajı ve üç disk taraması demektir.

import { watch, type FSWatcher } from 'node:fs'
import { existsSync } from 'node:fs'
import { join } from 'node:path'

export interface IzlemeSecenekleri {
  readonly repoRoot: string
  /** Repo köküne göreli izlenecek dizinler. Var olmayanlar sessizce atlanır. */
  readonly dizinler: readonly string[]
  readonly debounceMs: number
  readonly uzerineDegisim: (yol: string) => void
}

export interface Izleme {
  readonly kapat: () => void
  /** Gerçekten izlenen dizinler — istenenlerin hepsi var olmayabilir. */
  readonly izlenen: readonly string[]
}

export const izle = (o: IzlemeSecenekleri): Izleme => {
  const izleyiciler: FSWatcher[] = []
  const izlenen: string[] = []
  let zamanlayici: NodeJS.Timeout | null = null
  let sonYol = ''

  for (const d of o.dizinler) {
    const tam = join(o.repoRoot, d)
    if (!existsSync(tam)) continue
    try {
      const w = watch(tam, { recursive: true }, (_olay, dosya) => {
        sonYol = dosya === null ? d : join(d, String(dosya))
        if (zamanlayici !== null) clearTimeout(zamanlayici)
        zamanlayici = setTimeout(() => {
          zamanlayici = null
          o.uzerineDegisim(sonYol)
        }, o.debounceMs)
      })
      izleyiciler.push(w)
      izlenen.push(d)
    } catch {
      // İzleyici kurulamadıysa sunucu YİNE ayağa kalkar. Canlı yenileme bir kolaylıktır;
      // onun yokluğu üretimi durdurmaz — ama sessizce "izliyorum" da demez: `izlenen`
      // listesi kısa kalır ve `/api/saglik` onu bildirir.
    }
  }

  return {
    izlenen,
    kapat: () => {
      if (zamanlayici !== null) clearTimeout(zamanlayici)
      for (const w of izleyiciler) w.close()
    },
  }
}
