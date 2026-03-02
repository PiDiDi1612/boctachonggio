// src/modules/calculation-engine/calculateItem.ts
// Router: dispatch calculation to the correct type-specific calculator
// Uses registry pattern for easy extension

import type { MaterialType, ParsedParams } from './types'
import type { CalculationResult, CalculatorFn } from './types'
import { calculateConThu } from './calculateConThu'
import { calculateConThuVuongTron } from './calculateConThuVuongTron'
import { calculateHopGio } from './calculateHopGio'
import { calculateOngThang } from './calculateOngThang'
import { calculateOngThangBit1Dau } from './calculateOngThangBit1Dau'
import { calculateCo90Tron } from './calculateCo90'
import { calculateCo90Vuong } from './calculateCo90Vuong'
import { calculateChanRe } from './calculateChanRe'
import { calculateZLuon } from './calculateZLuon'
import { calculateChech45Tron } from './calculateChech45Tron'
import { calculateChech45Vuong } from './calculateChech45Vuong'

// ─── Calculator Registry ──────────────────────────────────────────────────────
// To add a new type:
//   1. Create calculateXxx.ts with the formula
//   2. Import and register it below (or use registerCalculator at runtime)

const CALCULATOR_REGISTRY: Map<MaterialType, CalculatorFn> = new Map([
    ['con_thu', calculateConThu],
    ['con_thu_vuong_tron', calculateConThuVuongTron],
    ['hop_gio', calculateHopGio],
    ['ong_thang', calculateOngThang],
    ['ong_thang_bit_1_dau', calculateOngThangBit1Dau],
    ['co_90_tron', calculateCo90Tron],
    ['co_90_vuong', calculateCo90Vuong],
    ['te_nga', calculateHopGio],   // Placeholder
    ['ong_tron', calculateOngThang], // Placeholder
    ['chan_re', calculateChanRe],
    ['z_luon', calculateZLuon],
    ['chech_45_tron', calculateChech45Tron],
    ['chech_45_vuong', calculateChech45Vuong],
    ['co_45_tron', calculateChech45Tron], // alias
    ['box_kin', calculateHopGio],
])

/**
 * Default calculator for unknown types.
 * Returns zero values instead of crashing.
 */
function calculateUnknown(_params: ParsedParams, _quantity: number): CalculationResult {
    return {
        area_m2: 0,
        total_area_m2: 0,
        ke_md: 0,
        bich_count: 0,
    }
}

import type { AppSettings, ConnectorType, SeamType } from '../../lib/types'

/**
 * Calculate metrics for a single parsed item.
 *
 * @param type - Material type (from text parser)
 * @param params - Parsed dimension parameters
 * @param quantity - Item quantity
 * @param settings - App calculation settings
 * @param connectors - Optional per-item connector types
 * @returns Calculation result with area, ke, bich
 */
export function calculateItem(
    type: MaterialType,
    params: ParsedParams,
    quantity: number,
    settings: AppSettings,
    options?: { conn1?: ConnectorType; conn2?: ConnectorType; seam?: SeamType }
): CalculationResult {
    const calculator = CALCULATOR_REGISTRY.get(type) ?? calculateUnknown
    return calculator(params, quantity, settings, options)
}

/**
 * Register a custom calculator for a material type at runtime.
 * Allows extension without modifying this file.
 */
export function registerCalculator(type: MaterialType, fn: CalculatorFn): void {
    CALCULATOR_REGISTRY.set(type, fn)
}

/**
 * Get list of registered calculator types.
 */
export function getRegisteredTypes(): MaterialType[] {
    return Array.from(CALCULATOR_REGISTRY.keys())
}
