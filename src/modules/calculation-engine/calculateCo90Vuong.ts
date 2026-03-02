// src/modules/calculation-engine/calculateCo90Vuong.ts
// Calculation formulas for Cút 90 độ vuông (mitered elbow with radius)

import type { ParsedParams } from './types'
import type { CalculationResult } from './types'
import { calcConnectorLength, resolveSeamAllowance } from './constants'
import type { AppSettings, ConnectorType, SeamType } from '../../lib/types'

/**
 * Calculate area for Cút 90 độ vuông (vát vuông nhưng có bán kính).
 */
export function calculateCo90Vuong(
    params: ParsedParams,
    quantity: number,
    settings: AppSettings,
    options?: { conn1?: ConnectorType; conn2?: ConnectorType; seam?: SeamType }
): CalculationResult {
    const W1 = params.W1 ?? params.W ?? 0
    const H1 = params.H1 ?? params.H ?? 0
    const R = params.r ?? 150

    // Convert mm to meters
    const w1 = W1 / 1000
    const h1 = H1 / 1000
    const r = R / 1000

    const connLen = calcConnectorLength(options?.conn1, options?.conn2, settings)
    const seamAllowance = resolveSeamAllowance(options?.seam, settings)
    const area_m2 = (2 * (Math.pow(r + h1, 2) - Math.pow(r, 2))) +
        ((w1 + seamAllowance) * (2 * (r + h1 / 2) + connLen))

    const ke_md = 2 * (W1 + H1) / 1000
    const bich_count = 2 * quantity

    return {
        area_m2: Math.round(area_m2 * 10000) / 10000,
        total_area_m2: Math.round(area_m2 * quantity * 10000) / 10000,
        ke_md: Math.round(ke_md * 1000) / 1000,
        bich_count,
    }
}
