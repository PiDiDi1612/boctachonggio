// src/modules/nesting-engine/sheet-layout.ts
// Generate visual layout data for rendering nested sheets

import type { NestedSheet, Placement } from './types'

export interface LayoutRect {
    x: number
    y: number
    width: number
    height: number
    label: string
    color: string
    rotated: boolean
}

export interface SheetLayout {
    sheetIndex: number
    sheetWidth: number
    sheetHeight: number
    rects: LayoutRect[]
    utilization: number
}

// Color palette for visual distinction
const COLORS = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1',
    '#14B8A6', '#A855F7', '#D946EF', '#0EA5E9', '#22C55E',
]

/**
 * Convert a NestedSheet into a renderable SheetLayout.
 * Maps piece IDs to colors for visual grouping.
 */
export function toSheetLayout(
    sheet: NestedSheet,
    labelMap?: Map<string, string>
): SheetLayout {
    const colorMap = new Map<string, string>()
    let colorIdx = 0

    const rects: LayoutRect[] = sheet.placements.map(p => {
        // Assign color by base item ID (strip _N suffix)
        const baseId = p.pieceId.replace(/_\d+$/, '')
        if (!colorMap.has(baseId)) {
            colorMap.set(baseId, COLORS[colorIdx % COLORS.length])
            colorIdx++
        }

        return {
            x: p.x,
            y: p.y,
            width: p.width,
            height: p.height,
            label: labelMap?.get(baseId) ?? baseId,
            color: colorMap.get(baseId)!,
            rotated: p.rotated,
        }
    })

    return {
        sheetIndex: sheet.sheetIndex,
        sheetWidth: sheet.sheetSize.width,
        sheetHeight: sheet.sheetSize.height,
        rects,
        utilization: sheet.utilization,
    }
}
