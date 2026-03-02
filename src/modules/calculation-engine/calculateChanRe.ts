// src/modules/calculation-engine/calculateChanRe.ts
// Calculation formulas for Chân rẽ (shoe tap)

import type { ParsedParams } from './types'
import type { CalculationResult } from './types'
import { resolveConnectorAllowance, resolveSeamAllowance } from './constants'
import type { AppSettings, ConnectorType, SeamType } from '../../lib/types'

/**
 * Calculate area for Chân rẽ.
 *
 * Formula:
 *   S = (2*(w2+h2)+seam)*(l+conn+0.05) 
 *   (Lưu ý: Chân rẽ mặc định 1 đầu bẻ chân 30mm = 0.03m, BRIM thường là 0.02)
 */
export function calculateChanRe(
    params: ParsedParams,
    quantity: number,
    settings: AppSettings,
    options?: { conn1?: ConnectorType; conn2?: ConnectorType; seam?: SeamType }
): CalculationResult {
    const W2 = params.W2 ?? params.W ?? 0
    const H2 = params.H2 ?? params.H ?? 0
    const L = params.L ?? 0

    // Convert mm to meters
    const w2 = W2 / 1000
    const h2 = H2 / 1000
    const l = L / 1000

    // Formula for Shoe Tap: (Perimeter + Seam) * (Length + Connector + Brim Allowance)
    const connLen1 = resolveConnectorAllowance(options?.conn1, settings)
    const connLen2 = resolveConnectorAllowance(options?.conn2, settings)
    const seamAllowance = resolveSeamAllowance(options?.seam, settings)

    // Diện tích = (Chu vi gót + Mí ghép) * (Chiều cao + Connector1 + Connector2 + 0.02 bù lề)
    const area_m2 = (2 * (w2 + h2) + seamAllowance) * (l + connLen1 + connLen2 + 0.02)

    const ke_md = 2 * (W2 + H2) / 1000
    const bich_count = 1 * quantity

    return {
        area_m2: Math.round(area_m2 * 10000) / 10000,
        total_area_m2: Math.round(area_m2 * quantity * 10000) / 10000,
        ke_md: Math.round(ke_md * 1000) / 1000,
        bich_count,
    }
}
