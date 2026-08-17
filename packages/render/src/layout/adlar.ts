// Düzen adları — tanım `@suite/contracts`ta (ring −1), burası yalnız yeniden dışa
// aktarıyor. Tanımın oraya taşınma sebebi: düzen artık `SlaytKimligi`de taşınıyor ve
// kernel (ring 0) render'dan (ring 2) import edemez — halka yönü tek yönlü (§3.1).
export { LAYOUTS, type LayoutName } from '@suite/contracts'
