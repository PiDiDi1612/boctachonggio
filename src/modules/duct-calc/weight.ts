// src/modules/duct-calc/weight.ts
// Tính trọng lượng tôn

import { STEEL_DENSITY } from './constants'

/**
 * Tính trọng lượng tôn từ diện tích và độ dày
 *
 * Giải thích đơn vị:
 *   1 m² tôn dày t(mm) → thể tích = t/1000 m³ = t × 1000 cm³
 *   Khối lượng = t × 1000 (cm³) × 7.85 (g/cm³) / 1000 = t × 7.85 kg
 *   ∴ weight (kg) = area (m²) × thickness (mm) × 7.85
 *
 * @param area      Diện tích bề mặt (m²)
 * @param thickness Độ dày tôn (mm)
 * @param density   Tỷ trọng (kg/m²/mm) – mặc định 7.85 tôn đen
 */
export function calcWeight(
  area: number,
  thickness: number,
  density: number = STEEL_DENSITY,
): number {
  if (area <= 0 || thickness <= 0) return 0
  return area * thickness * density
}

/**
 * Ước tính hệ số phụ kiện so với ống thẳng
 * TODO: tra bảng hoặc tính theo công thức chính xác hơn
 */
export const FITTING_MULTIPLIER: Record<string, number> = {
  straight_square: 1.00,
  straight_round:  1.00,
  elbow_90:        1.05,  // +5% vì mối hàn, gờ uốn
  tee:             1.08,
  reducer:         1.03,
  mouth:           1.10,
  other:           1.00,
}

/** Trọng lượng có tính hệ số phụ kiện */
export function calcWeightWithFitting(
  area: number,
  thickness: number,
  type: string,
  density: number = STEEL_DENSITY,
): number {
  const base = calcWeight(area, thickness, density)
  const mult = FITTING_MULTIPLIER[type] ?? 1
  return base * mult
}
