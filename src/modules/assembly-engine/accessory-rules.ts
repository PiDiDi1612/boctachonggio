// src/modules/assembly-engine/accessory-rules.ts
// Rules for auto-generating accessories based on connector type

import type { ConnectorType, NormalizedParams } from '../core/types'
import type { BOMLine } from './types'

/**
 * Perimeter of a rectangular duct in meters.
 */
function perimeter(W: number, H: number): number {
    return 2 * ((W / 1000) + (H / 1000))
}

/**
 * Generate accessory BOM lines for a single duct item.
 *
 * Rules:
 * - Bích V30/V40/V50: 1 bộ bích per connector end (4 pieces = 1 bộ)
 * - Gioăng: per bích connector, length = perimeter
 * - Bu lông: per bích connector, count based on perimeter
 * - Nẹp C: per connector end, length = perimeter
 * - Bịt đầu: generates a flat cap panel
 */
export function generateAccessories(
    params: NormalizedParams,
    conn1: ConnectorType,
    conn2: ConnectorType,
    quantity: number
): BOMLine[] {
    const lines: BOMLine[] = []

    const connectors = [
        { conn: conn1, w: params.W, h: params.H, label: 'Đầu 1' },
        { conn: conn2, w: params.W2 || params.W, h: params.H2 || params.H, label: 'Đầu 2' },
    ]

    for (const { conn, w, h, label } of connectors) {
        const perim = perimeter(w, h)

        if (conn === 'bich_v30' || conn === 'bich_v40' || conn === 'bich_v50') {
            const bichName = conn === 'bich_v30' ? 'V30' : conn === 'bich_v40' ? 'V40' : 'V50'

            // Bích (4 thanh = 1 bộ)
            lines.push({
                category: 'Phụ kiện',
                name: `Bích ${bichName} ${label} (${w}x${h})`,
                unit: 'bộ',
                quantity: quantity,
                weight_kg: perim * 0.5 * quantity, // Approximate
            })

            // Gioăng
            lines.push({
                category: 'Phụ kiện',
                name: `Gioăng ${label} (${w}x${h})`,
                unit: 'm',
                quantity: Math.ceil(perim * 100) / 100 * quantity,
                weight_kg: perim * 0.05 * quantity,
            })

            // Bu lông M8x25
            const boltCount = Math.ceil(perim / 0.15) // 1 bolt per 150mm
            lines.push({
                category: 'Phụ kiện',
                name: `Bu lông M8x25 ${label}`,
                unit: 'cái',
                quantity: boltCount * quantity,
                weight_kg: boltCount * 0.025 * quantity,
            })
        }

        if (conn === 'nep_c') {
            lines.push({
                category: 'Phụ kiện',
                name: `Nẹp C ${label} (${w}x${h})`,
                unit: 'm',
                quantity: Math.ceil(perim * 100) / 100 * quantity,
                weight_kg: perim * 0.3 * quantity,
            })
        }
    }

    return lines
}
