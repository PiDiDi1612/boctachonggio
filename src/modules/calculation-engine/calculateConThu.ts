// src/modules/calculation-engine/calculateConThu.ts
// Calculation formulas for Côn Thu (reducer)

import type { ParsedParams } from './types'
import type { CalculationResult } from './types'
import { calcConnectorLength, resolveSeamAllowance } from './constants'
import type { AppSettings, ConnectorType, SeamType } from '../../lib/types'

/**
 * Calculate area for Côn Thu (reducer).
 */
export function calculateConThu(
    params: ParsedParams,
    quantity: number,
    settings: AppSettings,
    options?: { conn1?: ConnectorType; conn2?: ConnectorType; seam?: SeamType }
): CalculationResult {
    const W1 = params.W1 ?? 0
    const H1 = params.H1 ?? 0
    const W2 = params.W2 ?? 0
    const H2 = params.H2 ?? 0
    const L = params.L ?? 0
    const E = params.E ?? 0

    // Convert mm to meters
    const w1 = W1 / 1000
    const h1 = H1 / 1000
    const w2 = W2 / 1000
    const h2 = H2 / 1000
    const l = L / 1000
    const e = E / 1000

    // Slant Height (True Length of the diagonal transition)
    const slantHeight = Math.sqrt(Math.pow(l, 2) + Math.pow(e, 2))

    // Formula: S = ((Perimeter1 + Perimeter2) / 2 + SEAM) * (SlantLength + Connectors)
    const connLen = calcConnectorLength(options?.conn1, options?.conn2, settings)
    const seamAllowance = resolveSeamAllowance(options?.seam, settings)
    const area_m2 = ((w1 + h1 + w2 + h2) + seamAllowance) * (slantHeight + connLen)

    const ke_md = (W1 + H1 + W2 + H2) / 1000
    const bich_count = 2 * quantity

    return {
        area_m2: Math.round(area_m2 * 10000) / 10000,
        total_area_m2: Math.round(area_m2 * quantity * 10000) / 10000,
        ke_md: Math.round(ke_md * 1000) / 1000,
        bich_count,
    }
}
