// src/modules/calculation-engine/calculateConThuVuongTron.ts
// Calculation formulas for Côn thu vuông-tròn

import type { ParsedParams } from './types'
import type { CalculationResult } from './types'
import { calcConnectorLength, resolveSeamAllowance } from './constants'
import type { AppSettings, ConnectorType, SeamType } from '../../lib/types'

/**
 * Calculate area for Côn thu vuông-tròn.
 */
export function calculateConThuVuongTron(
    params: ParsedParams,
    quantity: number,
    settings: AppSettings,
    options?: { conn1?: ConnectorType; conn2?: ConnectorType; seam?: SeamType }
): CalculationResult {
    const W1 = params.W1 ?? 0
    const H1 = params.H1 ?? 0
    const D = params.d ?? 0
    const L = params.L ?? 0
    const E = params.E ?? 0

    // Convert mm to meters
    const w1 = W1 / 1000
    const h1 = H1 / 1000
    const d = D / 1000
    const l = L / 1000
    const e = E / 1000

    const slantHeight = Math.sqrt(Math.pow(l, 2) + Math.pow(e, 2))
    const connLen = calcConnectorLength(options?.conn1, options?.conn2, settings)
    const seamAllowance = resolveSeamAllowance(options?.seam, settings)
    const area_m2 = ((w1 + h1 + (3.1416 * d) / 2) + (seamAllowance / 2)) * (slantHeight + (connLen * 0.7))

    const ke_md = (W1 + H1 + 3.1416 * D) / 1000
    const bich_count = 2 * quantity

    return {
        area_m2: Math.round(area_m2 * 10000) / 10000,
        total_area_m2: Math.round(area_m2 * quantity * 10000) / 10000,
        ke_md: Math.round(ke_md * 1000) / 1000,
        bich_count,
    }
}
