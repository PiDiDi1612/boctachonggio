import type { AppSettings, ConnectorType, SeamType } from '../../lib/types'

export type MaterialType =
    | 'ong_thang'
    | 'ong_thang_bit_1_dau'
    | 'co_90_tron'
    | 'co_90_vuong'
    | 'con_thu'
    | 'con_thu_vuong_tron'
    | 'chan_re'
    | 'z_luon'
    | 'chech_45_tron'
    | 'chech_45_vuong'
    | 'box_kin'
    | 'hop_gio'
    | 'te_nga'
    | 'ong_tron'
    | 'co_45_tron'
    | 'unknown'

export interface ParsedParams {
    W1?: number | null
    H1?: number | null
    W2?: number | null
    H2?: number | null
    W?: number | null
    H?: number | null
    L?: number | null
    r?: number | null
    d?: number | null
    E?: number | null
    thickness?: number | null
}

/**
 * Input for calculation: parsed item + quantity + thickness.
 */
export interface CalculationInput {
    type: MaterialType
    params: ParsedParams
    quantity: number
    thickness: number
    conn1?: ConnectorType
    conn2?: ConnectorType
}

/**
 * Output of a single calculation.
 */
export interface CalculationResult {
    /** Area per piece (m²) */
    area_m2: number
    /** Total area = area_m2 × quantity (m²) */
    total_area_m2: number
    /** Kè (mét dài) - perimeter-based length */
    ke_md: number
    /** Bích count (flange connections) */
    bich_count: number
}

/**
 * A calculator function for a specific material type.
 */
export type CalculatorFn = (
    params: ParsedParams,
    quantity: number,
    settings: AppSettings,
    options?: { conn1?: ConnectorType; conn2?: ConnectorType; seam?: SeamType }
) => CalculationResult
