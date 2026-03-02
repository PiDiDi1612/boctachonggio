// src/modules/calculation-engine/calculateOngThang.ts
// Calculation formulas for Ống thẳng (straight duct)

import type { ParsedParams } from './types'
import type { CalculationResult } from './types'
import { calcConnectorLength, resolveSeamAllowance } from './constants'
import type { AppSettings, ConnectorType, SeamType } from '../../lib/types'

/**
 * Calculate area for Ống thẳng (straight rectangular duct).
 *
 * Formula (same as Hộp gió):
 *   S = 2 * (W + H) * L / 1_000_000  (m²)
 *
 * Kè (mét dài):
 *   ke = 2 * (W + H) / 1000
 *
 * Bích: 2 per piece
 */
export function calculateOngThang(
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

    // Formula: S = (2 * (w + h) + resolveSeamAllowance(options?.seam, settings)) * (l + connectorAllowance)
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
