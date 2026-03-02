// src/modules/calculation-engine/calculateHopGio.ts
// Calculation formulas for Hộp gió (plenum box / duct box)

import type { ParsedParams } from './types'
import type { CalculationResult } from './types'
import { calcConnectorLength, resolveSeamAllowance } from './constants'
import type { AppSettings, ConnectorType, SeamType } from '../../lib/types'

/**
 * Calculate area for Hộp gió.
 */
export function calculateHopGio(
    params: ParsedParams,
    quantity: number,
    settings: AppSettings,
    options?: { conn1?: ConnectorType; conn2?: ConnectorType; seam?: SeamType }
): CalculationResult {
    const W = params.W ?? 0
    const H = params.H ?? 0
    const L = params.L ?? 0

    // Convert to meters
    const w = W / 1000
    const h = H / 1000
    const l = L / 1000

    // Applied CamDuct Seams
    const connLen = calcConnectorLength(options?.conn1, options?.conn2, settings)
    const seamAllowance = resolveSeamAllowance(options?.seam, settings)
    const area_m2 = (2 * (w + h) + seamAllowance) * (l + connLen)

    const ke_md = 2 * (W + H) / 1000

    const bich_count = 2 * quantity

    return {
        area_m2: Math.round(area_m2 * 10000) / 10000,
        total_area_m2: Math.round(area_m2 * quantity * 10000) / 10000,
        ke_md: Math.round(ke_md * 1000) / 1000,
        bich_count,
    }
}
