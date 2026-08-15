// Registry'nin kernel'den aldıkları — tek yerde toplanır ki bağımlılık yüzeyi görünür olsun.
import { VERBS } from '@suite/contracts'

export { parseYaml } from '@suite/kernel'

/** Fiil adı doğrulaması için hazır küme. Liste sözleşmeden gelir; burada kopyası YOK. */
export const VERBS_SET: ReadonlySet<string> = new Set<string>(VERBS)
