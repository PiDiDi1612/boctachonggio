// src/modules/normalize/dimension-parser.ts
// Parse dimension strings into NormalizedParams
// Replaces the scattered parsing logic in duct-calc/index.ts

import type { NormalizedParams, DuctItemType } from '../core/types'
import { EMPTY_PARAMS } from '../core/types'

/**
 * Parse a dimension string (e.g. "500x400x12000x0x0x0x0") into NormalizedParams.
 *
 * Standard format: W x H x L x D x E x W2 x H2 (7 values separated by 'x')
 * Legacy formats: "WxHxL" (3 values), "DxL" (2 values for round ducts)
 */
export function parseDimensionString(
    dimStr: string,
    displayType?: DuctItemType
): NormalizedParams {
    if (!dimStr) return { ...EMPTY_PARAMS }

    const parts = dimStr.split('x').map(Number)

    // Legacy: round duct "DxL"
    if (parts.length === 2 && displayType === 'other') {
        return { ...EMPTY_PARAMS, D: parts[0] ?? 0, L: parts[1] ?? 0 }
    }

    // Legacy: "WxH" (2 values)
    if (parts.length === 2) {
        return { ...EMPTY_PARAMS, W: parts[0] ?? 0, H: parts[1] ?? 0 }
    }

    // Legacy: "WxHxL" (3 values)
    if (parts.length === 3) {
        return {
            ...EMPTY_PARAMS,
            W: parts[0] ?? 0,
            H: parts[1] ?? 0,
            L: parts[2] ?? 0,
        }
    }

    // Standard 7-param format
    return {
        W: parts[0] ?? 0,
        H: parts[1] ?? 0,
        L: parts[2] ?? 0,
        D: parts[3] ?? 0,
        E: parts[4] ?? 0,
        W2: parts[5] ?? 0,
        H2: parts[6] ?? 0,
        R: parts[3] ?? 0, // Alias: R shares slot with D for elbows
    }
}

/**
 * Build a standardized dimension string from params.
 * Always outputs 7-value format: W x H x L x D x E x W2 x H2
 */
export function buildDimensionString(params: NormalizedParams): string {
    return [params.W, params.H, params.L, params.D, params.E, params.W2, params.H2].join('x')
}
