// src/modules/cache/calc-cache.ts
// Hash-based memoization for calculation results
// Invalidates when settings change

import { MODULE_VERSIONS } from '../core/versions'
import type { CalcSettings, CalculationOutput, NormalizedParams, ConnectorType, SeamType } from '../core/types'

interface CacheEntry {
    result: CalculationOutput
    timestamp: number
}

const MAX_ENTRIES = 2000
const cache = new Map<string, CacheEntry>()
let settingsHash = ''

/**
 * Generate a deterministic hash key from calculation inputs.
 * Uses a simple string concatenation — fast and collision-free for our domain.
 */
export function hashKey(
    materialType: string,
    params: NormalizedParams,
    quantity: number,
    thickness: number,
    conn1?: ConnectorType,
    conn2?: ConnectorType,
    seam?: SeamType
): string {
    const version = MODULE_VERSIONS.CALCULATION
    return `V${version}|${materialType}|${params.W},${params.H},${params.L},${params.D},${params.W2},${params.H2},${params.R},${params.E}|${quantity}|${thickness}|${conn1 ?? ''}|${conn2 ?? ''}|${seam ?? ''}`
}

/**
 * Hash settings to detect changes.
 */
function hashSettings(settings: CalcSettings): string {
    return JSON.stringify(settings)
}

/**
 * Get cached calculation result.
 */
export function getFromCache(key: string): CalculationOutput | undefined {
    return cache.get(key)?.result
}

/**
 * Store calculation result in cache.
 */
export function setInCache(key: string, result: CalculationOutput): void {
    // Evict oldest entries if cache is full
    if (cache.size >= MAX_ENTRIES) {
        const oldest = cache.keys().next().value
        if (oldest !== undefined) cache.delete(oldest)
    }
    cache.set(key, { result, timestamp: Date.now() })
}

/**
 * Invalidate cache when settings change.
 * Call this whenever settings are modified.
 */
export function invalidateIfSettingsChanged(settings: CalcSettings): boolean {
    const newHash = hashSettings(settings)
    if (newHash !== settingsHash) {
        settingsHash = newHash
        cache.clear()
        return true // Was invalidated
    }
    return false
}

/**
 * Force clear the entire cache.
 */
export function clearCache(): void {
    cache.clear()
    settingsHash = ''
}

/**
 * Get cache stats for debugging.
 */
export function getCacheStats(): { size: number; maxSize: number } {
    return { size: cache.size, maxSize: MAX_ENTRIES }
}
