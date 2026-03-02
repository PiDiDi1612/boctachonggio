// src/modules/calculation-engine/calculateChech45Vuong.ts
// Calculation formulas for Chếch 45 độ vát vuông

import type { ParsedParams } from './types'
import type { CalculationResult } from './types'
import { calcConnectorLength, resolveSeamAllowance } from './constants'
import type { AppSettings, ConnectorType, SeamType } from '../../lib/types'

/**
 * Calculate area for Chếch 45 độ vát vuông.
 */
export function calculateChech45Vuong(
    params: ParsedParams,
    quantity: number,
    settings: AppSettings,
    options?: { conn1?: ConnectorType; conn2?: ConnectorType; seam?: SeamType }
): CalculationResult {
    const W1 = params.W1 ?? params.W ?? 0
    const H1 = params.H1 ?? params.H ?? 0
    const L = params.L ?? 0

    // Convert mm to meters
    const w1 = W1 / 1000
    const h1 = H1 / 1000
    const l = L / 1000

    const connLen = calcConnectorLength(options?.conn1, options?.conn2, settings)
    const seamAllowance = resolveSeamAllowance(options?.seam, settings)
    const area_m2 = (2 * (w1 + h1) + seamAllowance) * (l + connLen)

    const ke_md = 2 * (W1 + H1) / 1000
    const bich_count = 2 * quantity

    return {
        area_m2: Math.round(area_m2 * 10000) / 10000,
        total_area_m2: Math.round(area_m2 * quantity * 10000) / 10000,
        ke_md: Math.round(ke_md * 1000) / 1000,
        bich_count,
    }
}
