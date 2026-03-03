// src/modules/nesting-engine/types.ts
// Sheet nesting types

export interface SheetSize {
    width: number   // mm
    height: number  // mm
    label?: string  // e.g. "1220x2440 (4x8 ft)"
}

/** Standard sheet metal sizes */
export const STANDARD_SHEETS: SheetSize[] = [
    { width: 1220, height: 2440, label: '1220×2440 (4×8 ft)' },
    { width: 1220, height: 3050, label: '1220×3050 (4×10 ft)' },
    { width: 1500, height: 3000, label: '1500×3000' },
    { width: 1000, height: 2000, label: '1000×2000' },
]

/** A rectangular piece to be nested onto sheets */
export interface NestingPiece {
    id: string
    itemId: string      // Reference to NormalizedItem
    width: number       // mm (unfolded flat width)
    height: number      // mm (unfolded flat height)
    quantity: number
    thickness: number   // mm
    label?: string      // Display label
    canRotate: boolean  // Whether piece can be rotated 90°
}

/** Placement of a piece on a sheet */
export interface Placement {
    pieceId: string
    x: number        // mm from left
    y: number        // mm from bottom
    width: number    // mm (after possible rotation)
    height: number   // mm (after possible rotation)
    rotated: boolean
}

/** A single sheet with placed pieces */
export interface NestedSheet {
    sheetIndex: number
    sheetSize: SheetSize
    placements: Placement[]
    utilization: number  // 0-1 (percentage of sheet area used)
    wasteArea: number    // mm² of unused area
}

/** Dynamic length nesting result for a specific thickness */
export interface DynamicSheetResult {
    thickness: number
    sheets: {
        usedLength: number      // mm (actual height used)
        wasteArea: number       // mm²
        placements: Placement[]
    }[]
    totalLengthUsed: number     // mm (sum of usedLength)
    wastePercentage: number     // 0-100
}

/** Full nesting result */
export interface NestingResult {
    summary: DynamicSheetResult[]
    totalLengthByThickness: Map<number, number> // thickness -> total mm
    unplacedPieces: NestingPiece[]
}
