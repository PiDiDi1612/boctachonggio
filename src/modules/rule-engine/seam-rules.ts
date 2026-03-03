// src/modules/rule-engine/seam-rules.ts
// Business rules for auto-detecting seam type from item metadata

import type { DuctItemType, SeamType } from '../core/types'

/** Default seam by duct type */
const TYPE_SEAM_DEFAULTS: Partial<Record<DuctItemType, SeamType>> = {
    shoe_tap: 'han_15',
    reducer_sq_rd: 'noi_c',
}

/**
 * Apply seam defaults based on duct type.
 * Only applies if current seam is the generic default (pittsburgh).
 */
export function applySeamDefaults(
    displayType: DuctItemType,
    current: SeamType
): SeamType {
    if (current !== 'pittsburgh') return current // User or parser already set it
    return TYPE_SEAM_DEFAULTS[displayType] ?? current
}
