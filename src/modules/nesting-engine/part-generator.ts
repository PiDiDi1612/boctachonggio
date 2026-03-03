// src/modules/nesting-engine/part-generator.ts
// Converts NormalizedItems into flat geometric NestingPieces for nesting-engine

import type { NormalizedItem } from '../core/types'
import type { NestingPiece } from './types'

/**
 * Generate flat sheet parts for a given duct item.
 * Currently supports basic rectangular unfolding.
 */
export function generateParts(item: NormalizedItem): NestingPiece[] {
    const { id, params, quantity, thickness, displayType } = item
    const pieces: NestingPiece[] = []

    // mm dimensions
    const W = params.W || params.D || 0
    const H = params.H || 0
    const L = params.L || 0

    if (W === 0 || L === 0) return []

    switch (displayType) {
        case 'straight_square':
            // A straight square duct consists of 4 plates
            // For simplicity, we assume 2 plates of W x L and 2 plates of H x L
            // In reality, Pittsburgh seams add allowance, handled later in Assembly
            pieces.push({
                id: `${id}_p1`,
                itemId: id,
                width: W,
                height: L,
                quantity: quantity * 2,
                thickness,
                label: `Plate W-${id}`,
                canRotate: true
            })
            if (H > 0) {
                pieces.push({
                    id: `${id}_p2`,
                    itemId: id,
                    width: H,
                    height: L,
                    quantity: quantity * 2,
                    thickness,
                    label: `Plate H-${id}`,
                    canRotate: true
                })
            }
            break

        case 'plenum_box':
            // Box needs 5-6 plates (W x H, W x L x 2, H x L x 2, etc.)
            pieces.push({ id: `${id}_top`, itemId: id, width: W, height: H, quantity, thickness, canRotate: true })
            pieces.push({ id: `${id}_side1`, itemId: id, width: W, height: L, quantity: quantity * 2, thickness, canRotate: true })
            pieces.push({ id: `${id}_side2`, itemId: id, width: H, height: L, quantity: quantity * 2, thickness, canRotate: true })
            break

        default:
            // For complex fittings, we approximate with a bounding box for now
            // Future improvement: true unfolding geometry
            pieces.push({
                id: `${id}_approx`,
                itemId: id,
                width: W,
                height: L,
                quantity,
                thickness,
                label: `Approx-${displayType}`,
                canRotate: true
            })
            break
    }

    return pieces
}

/**
 * Batch generate parts for multiple items.
 */
export function generateBatchParts(items: NormalizedItem[]): NestingPiece[] {
    return items.flatMap(item => generateParts(item))
}
