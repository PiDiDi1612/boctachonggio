// src/modules/assembly-engine/bom-builder.ts
// Aggregate BOM lines across all items in a project

import type { NormalizedItem } from '../core/types'
import type { BOMLine } from './types'
import { generateAccessories } from './accessory-rules'

/**
 * Build full BOM for a project.
 * Groups by material sheet + accessories.
 */
export function buildProjectBOM(
    items: NormalizedItem[],
    computedMetrics: Map<string, { area_m2: number; weight_kg: number }>
): BOMLine[] {
    const lines: BOMLine[] = []

    // Group sheet metal by thickness
    const sheetByThickness = new Map<number, { area: number; weight: number }>()

    for (const item of items) {
        const metrics = computedMetrics.get(item.id)
        if (!metrics) continue

        const totalArea = metrics.area_m2 * item.quantity
        const totalWeight = metrics.weight_kg * item.quantity

        // Accumulate sheet metal
        const existing = sheetByThickness.get(item.thickness) ?? { area: 0, weight: 0 }
        existing.area += totalArea
        existing.weight += totalWeight
        sheetByThickness.set(item.thickness, existing)

        // Generate accessories for this item
        const accessories = generateAccessories(
            item.params,
            item.connector.conn1,
            item.connector.conn2,
            item.quantity
        )
        lines.push(...accessories)
    }

    // Add sheet metal lines (at the beginning)
    const sheetLines: BOMLine[] = []
    for (const [thickness, { area, weight }] of sheetByThickness) {
        sheetLines.push({
            category: 'Tôn',
            name: `Tôn kẽm ${thickness}mm`,
            unit: 'm²',
            quantity: Math.ceil(area * 100) / 100,
            area_m2: Math.ceil(area * 100) / 100,
            weight_kg: Math.ceil(weight * 100) / 100,
        })
    }

    return [...sheetLines, ...lines]
}
