// src/modules/calculation-engine/constants.ts
// Centralized calculation helpers using dynamic AppSettings

import type { AppSettings, ConnectorType, SeamType } from '@/lib/types'
import { getSettings } from '@/lib/storage'

/**
 * Get the effective settings for calculation.
 * Reads from localStorage (via getSettings) so values are always up-to-date.
 */
export function getCalcSettings(): AppSettings {
    return getSettings()
}

/**
 * Resolve connector allowance (meters) based on connector type.
 */
export function resolveConnectorAllowance(
    connType: ConnectorType | undefined,
    settings: AppSettings
): number {
    switch (connType) {
        case 'tdc': return settings.connTDC
        case 'bich_v30': return settings.connV30
        case 'bich_v40': return settings.connV40
        case 'bich_v50': return settings.connV50
        case 'bit_dau': return settings.connBitDau
        case 'be_chan_30': return settings.connBeChan30
        case 'nep_c': return settings.connNepC
        case 'de_thang': return settings.connDeThang
        case 'none': return 0
        default: return 0
    }
}

/**
 * Resolve seam allowance (meters) based on seam type.
 */
export function resolveSeamAllowance(
    seamType: SeamType | undefined,
    settings: AppSettings
): number {
    switch (seamType) {
        case 'don_kep': return settings.seamDonKep
        case 'noi_c': return settings.seamNoiC
        case 'han_15': return settings.seamHan15
        case 'pittsburgh': return settings.seamPittsburgh
        default: return settings.seamPittsburgh // Default
    }
}

/**
 * Calculate total length allowance from two connectors.
 */
export function calcConnectorLength(
    conn1: ConnectorType | undefined,
    conn2: ConnectorType | undefined,
    settings: AppSettings
): number {
    return resolveConnectorAllowance(conn1, settings) +
        resolveConnectorAllowance(conn2, settings)
}

// Legacy exports for backward compatibility (static defaults)
export const SEAM_PITTSBURGH = 0.04
export const CONN_TDC = 0.05
export const CONN_FLANGE_V = 0.01
export const CONN_C_CLEAT = 0.01
export const CONN_C_JOINT = 0.01
export const SHOE_TAP_BRIM = 0.025
export const REDUCER_SEAM = 0.04
export const BIT_DAU_SEAM = 0.04
