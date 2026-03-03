// src/modules/nesting-engine/bin-packing.ts
// Dynamic-Length Sheet Optimizer (DLSO)
// Optimized for coil-fed production with fixed width and variable length

import type { NestingPiece, Placement, DynamicSheetResult, SheetSize } from './types'

// ─── Constants ───────────────────────────────────────────────────────────────

const COIL_WIDTH = 1200
const MAX_SHEET_LENGTH = 4000
const GAP = 2 // mm

// ─── Implementation ───────────────────────────────────────────────────────────

/**
 * Expand pieces by quantity and sort by descending height.
 */
function preparePieces(pieces: NestingPiece[]): NestingPiece[] {
    const expanded: NestingPiece[] = []
    pieces.forEach(p => {
        for (let i = 0; i < p.quantity; i++) {
            expanded.push({ ...p, id: `${p.id}_${i}`, quantity: 1 })
        }
    })

    // Sort by max dimension descending (FFDH logic)
    // Secondary sort by ID for determinism
    return expanded.sort((a, b) => {
        const maxA = Math.max(a.width, a.height)
        const maxB = Math.max(b.width, b.height)
        if (maxB !== maxA) return maxB - maxA
        return a.id.localeCompare(b.id)
    })
}

/**
 * Perform dynamic length nesting for a group of pieces (same thickness).
 */
export function nestDynamic(pieces: NestingPiece[]): DynamicSheetResult {
    const thickness = pieces[0]?.thickness || 0
    const sorted = preparePieces(pieces)

    const results: DynamicSheetResult['sheets'] = []
    let currentSheetPlacements: Placement[] = []
    let currentSheetHeight = 0
    let currentShelfY = 0
    let currentShelfHeight = 0
    let xCursor = 0

    const finalizeSheet = () => {
        if (currentSheetPlacements.length === 0) return

        const usedArea = currentSheetPlacements.reduce((sum, p) => sum + p.width * p.height, 0)
        const totalArea = COIL_WIDTH * currentSheetHeight

        results.push({
            usedLength: currentSheetHeight,
            wasteArea: totalArea - usedArea,
            placements: currentSheetPlacements
        })

        currentSheetPlacements = []
        currentSheetHeight = 0
        currentShelfY = 0
        currentShelfHeight = 0
        xCursor = 0
    }

    for (const piece of sorted) {
        // Rotation logic: Try to pick orientation that minimizes height or fits width
        // For shelf algorithm, we prioritize fitting in the current shelf width
        let w = piece.width
        let h = piece.height
        let rotated = false

        if (piece.canRotate) {
            // If rotating makes it fit in the current shelf when it wouldn't otherwise
            const fitsNormally = (xCursor + w + GAP <= COIL_WIDTH)
            const fitsRotated = (xCursor + h + GAP <= COIL_WIDTH)

            if (!fitsNormally && fitsRotated) {
                [w, h] = [h, w]
                rotated = true
            } else if (fitsNormally && fitsRotated) {
                // If both fit, pick the one that results in "shorter" height to optimize coil length
                if (h > w) {
                    [w, h] = [h, w]
                    rotated = true
                }
            } else if (!fitsNormally && !fitsRotated) {
                // If neither fits in CURRENT shelf, will it start a new shelf?
                // Pick the orientation that is narrowest to maximize shelf capacity
                if (h < w) {
                    [w, h] = [h, w]
                    rotated = true
                }
            }
        }

        // Check if fits in current shelf
        if (xCursor + w + GAP <= COIL_WIDTH) {
            // Fits in current shelf
            currentSheetPlacements.push({
                pieceId: piece.id,
                x: xCursor,
                y: currentShelfY,
                width: w,
                height: h,
                rotated
            })
            xCursor += w + GAP
            currentShelfHeight = Math.max(currentShelfHeight, h)
            currentSheetHeight = currentShelfY + currentShelfHeight
        } else {
            // Start new shelf
            currentShelfY += currentShelfHeight + GAP

            // Check if new shelf fits in current sheet
            if (currentShelfY + h > MAX_SHEET_LENGTH) {
                finalizeSheet()
                // Retry this piece on a fresh sheet
                currentShelfY = 0
            }

            // Place on new shelf
            currentSheetPlacements.push({
                pieceId: piece.id,
                x: 0,
                y: currentShelfY,
                width: w,
                height: h,
                rotated
            })
            xCursor = w + GAP
            currentShelfHeight = h
            currentSheetHeight = currentShelfY + currentShelfHeight
        }
    }

    finalizeSheet()

    const totalLength = results.reduce((sum, s) => sum + s.usedLength, 0)
    const totalUsedArea = results.reduce((sum, s) => sum + s.placements.reduce((a, p) => a + p.width * p.height, 0), 0)
    const totalPotentialArea = totalLength * COIL_WIDTH
    const wastePercentage = totalPotentialArea > 0
        ? ((totalPotentialArea - totalUsedArea) / totalPotentialArea) * 100
        : 0

    return {
        thickness,
        sheets: results,
        totalLengthUsed: totalLength,
        wastePercentage: Math.round(wastePercentage * 100) / 100
    }
}
