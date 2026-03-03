// src/modules/project-engine/project-stats.ts
// Cached stats computation — replaces the O(n) loop in useProject.ts

import type { NormalizedItem, ProjectStats, CalcSettings, CalculationOutput } from '../core/types'
import { hashKey, getFromCache, setInCache, invalidateIfSettingsChanged } from '../cache'
import { toMaterialType } from '../normalize'

/**
 * Compute total stats for a list of items.
 * Uses the cache layer to avoid re-computing unchanged items.
 *
 * @param items - List of normalized items
 * @param settings - Current calculation settings
 * @param calcFn - Calculator function (injected to avoid circular dep)
 */
export function computeProjectStats(
    items: NormalizedItem[],
    settings: CalcSettings,
    calcFn: (item: NormalizedItem, settings: CalcSettings) => CalculationOutput
): ProjectStats {
    // Check if settings changed → invalidate cache
    invalidateIfSettingsChanged(settings)

    let totalArea = 0
    let totalWeight = 0

    for (const item of items) {
        const key = hashKey(
            item.materialType,
            item.params,
            item.quantity,
            item.thickness,
            item.connector.conn1,
            item.connector.conn2,
            item.seam
        )

        let output = getFromCache(key)
        if (!output) {
            output = calcFn(item, settings)
            setInCache(key, output)
        }

        totalArea += output.area_m2 * item.quantity
        totalWeight += output.weight_kg * item.quantity
    }

    return {
        totalItems: items.length,
        totalArea: Math.round(totalArea * 1_000_000) / 1_000_000,
        totalWeight: Math.round(totalWeight * 1_000_000) / 1_000_000,
    }
}
