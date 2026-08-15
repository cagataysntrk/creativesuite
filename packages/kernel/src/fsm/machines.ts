// Dört durum makinesi (§3.7 · D-28).
//
// XState KULLANILMIYOR: kalıcı anlık görüntü bir kütüphane sürümüne bağlanmamalı.
// `derived/runs/` yıllarca yaşayacak; iki yıl sonra bir kütüphanenin serileştirme
// biçimi değiştiğinde geçmiş çalıştırmaların okunamaz hâle gelmesi kabul edilemez (D-28).
// Yerine: elle yazılmış ayrık birleşim + geçiş TABLOSU. Tablo hem tip hem veridir.
//
// Yasadışı geçiş **derleme hatasıdır** — çalışma zamanı kontrolü değil. Bir geçişi
// çalışma zamanında yakalamak, o kod yolunun test edilmiş olmasına bağlıdır; tip
// sistemi ise yazıldığı anda reddeder.

/**
 * Geçiş tablosu. Her durum → oradan gidilebilecek durumlar.
 * Boş dizi = TERMİNAL durum. Terminal durumdan çıkış olmaması kasıtlıdır:
 * "bitti" dedikten sonra devam eden bir çalıştırma, defterin iki kez ücretlendirdiği
 * çalıştırmadır.
 */
export const TRANSITIONS = {
  // Bir çalıştırmanın ömrü. `awaiting_approval` bir yan etki değil, bir KAPIDIR (§4c).
  run: {
    planned: ['running', 'cancelled'],
    running: ['awaiting_approval', 'succeeded', 'failed', 'cancelled'],
    awaiting_approval: ['running', 'cancelled', 'failed'],
    succeeded: [],
    failed: [],
    cancelled: [],
  },

  // Bir işin ömrü. `leased → queued` lease süresi dolduğunda geri döner: süreç
  // öldürülürse iş kaybolmaz, kilitli de kalmaz.
  job: {
    queued: ['leased', 'cancelled'],
    leased: ['queued', 'done', 'failed', 'cancelled'],
    done: [],
    failed: ['queued'], // yeniden deneme sınıflandırması izin veriyorsa (§8.5)
    cancelled: [],
  },

  // Bir varlığın ömrü. QA ve onay ayrı kapılardır: QA ölçer, insan karar verir.
  asset: {
    draft: ['rendered', 'discarded'],
    rendered: ['qa_passed', 'qa_failed', 'discarded'],
    qa_failed: ['rendered', 'discarded'],
    qa_passed: ['approved', 'rejected'],
    rejected: ['rendered', 'discarded'],
    approved: ['published', 'archived'],
    published: ['archived'],
    archived: [],
    discarded: [],
  },

  // Bir kaydın ömrü — `RECORD_STATUSES` ile birebir aynı küme (§3.2).
  // Emeklilik SİLME DEĞİLDİR: `retired` terminaldir ama dosya durur (değişmez ilke 10).
  record: {
    draft: ['active', 'discarded'],
    active: ['pinned', 'superseded', 'retired'],
    pinned: ['active', 'retired'],
    superseded: [],
    retired: [],
    discarded: [],
  },
} as const

export type MachineName = keyof typeof TRANSITIONS
export type StateOf<M extends MachineName> = keyof (typeof TRANSITIONS)[M] & string

/** `M` makinesinde `S` durumundan gidilebilecek durumlar. */
export type NextOf<
  M extends MachineName,
  S extends StateOf<M>,
> = (typeof TRANSITIONS)[M][S] extends readonly (infer T)[] ? T & string : never

/**
 * Derleme zamanı geçiş. Yasadışı hedef **tip hatasıdır**:
 *   transition('job', 'done', 'queued')   → hata, `done` terminal
 *   transition('run', 'planned', 'succeeded') → hata, önce `running`
 */
export const transition = <M extends MachineName, S extends StateOf<M>, T extends NextOf<M, S>>(
  _machine: M,
  _from: S,
  to: T
): T => to

/**
 * Çalışma zamanı geçiş kontrolü — durum VERİDEN geldiğinde (SQLite satırı, JSON).
 * Tip sistemi orada yardım edemez; tablo aynı tablodur, ikinci bir gerçek yoktur.
 */
export const canTransition = (machine: MachineName, from: string, to: string): boolean => {
  const table = TRANSITIONS[machine] as Readonly<Record<string, readonly string[]>>
  return table[from]?.includes(to) ?? false
}

export const isTerminal = (machine: MachineName, state: string): boolean => {
  const table = TRANSITIONS[machine] as Readonly<Record<string, readonly string[]>>
  return (table[state]?.length ?? -1) === 0
}

export const statesOf = (machine: MachineName): readonly string[] =>
  Object.keys(TRANSITIONS[machine])
