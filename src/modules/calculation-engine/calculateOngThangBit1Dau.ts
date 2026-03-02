// src/modules/calculation-engine/calculateOngThangBit1Dau.ts
// Calculation formulas for Ống thẳng bịt 1 đầu

import type { ParsedParams } from './types'
import type { CalculationResult } from './types'
import { BIT_DAU_SEAM, resolveConnectorAllowance, resolveSeamAllowance } from './constants'
import type { AppSettings, ConnectorType, SeamType } from '../../lib/types'

/**
 * Calculate area for Ống thẳng bị bịt 1 đầu.
 *
 * Formula:
 *   S = ((2*(w+h)+0.04)*(l+0.05)) + ((w+0.04)*(h+0.04))
 *
 * (Dimensions in meters)
 */
export function calculateOngThangBit1Dau(
    params: ParsedParams,
    quantity: number,
    settings: AppSettings,
    options?: { conn1?: ConnectorType; conn2?: ConnectorType; seam?: SeamType }
): CalculationResult {
    const W = params.W ?? params.W1 ?? 0
    const H = params.H ?? params.H1 ?? 0
    const L = params.L ?? 0

    // Convert mm to meters
    const w = W / 1000
    const h = H / 1000
    const l = L / 1000

    // Formula: S = (Side Walls Area with 1 connector) + (End Cap Area)
    const connLen = resolveConnectorAllowance(options?.conn1 || options?.conn2, settings)
    const seamAllowance = resolveSeamAllowance(options?.seam, settings)
    const area_m2 = ((2 * (w + h) + seamAllowance) * (l + connLen + 0.02)) + ((w + BIT_DAU_SEAM) * (h + BIT_DAU_SEAM))

    const ke_md = 2 * (W + H) / 1000
    const bich_count = 1 * quantity // Only 1 side has flange

    return {
        area_m2: Math.round(area_m2 * 10000) / 10000,
        total_area_m2: Math.round(area_m2 * quantity * 10000) / 10000,
        ke_md: Math.round(ke_md * 1000) / 1000,
        bich_count,
    }
}
