// HEDEF: apps/server/src/kosu-sablonu.ts
//
// ⚠ ⚠ **KURAL ARTIK MOTORDA — burası yalnız ADRES.** Dosya `apps/server`daydı ve
// editör (bir `scripts/*.mjs`) ona erişemiyordu; boş görsel yuvalarını doldurma
// özelliği aynı soruyu sorunca üçüncü bir kopya yazılmak üzereydi. Kural
// `packages/engine/src/kosu-sablonu.ts`e taşındı; bu dosya var olan çağıranları
// bozmamak için duruyor ve kendi cevabını ÜRETMİYOR.
//
// ⚠ Yeni çağıran doğrudan `@suite/engine`den almalı: bir gün bu satır silinecek.

export { kosuSablonu, type KosuSablonu } from '@suite/engine'
