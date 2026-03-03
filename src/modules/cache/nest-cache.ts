// src/modules/cache/nest-cache.ts
// Memoization for expensive nesting calculations
// Invalidates when nesting algorithm version changes

import { MODULE_VERSIONS } from '../core/versions'
import type { NestingPiece, DynamicSheetResult } from '../nesting-engine/types'

interface NestCacheEntry {
    result: DynamicSheetResult
    timestamp: number
}

const STORAGE_KEY = 'ductpro_nest_cache'
const MAX_ENTRIES = 500
const cache = new Map<string, NestCacheEntry>()

/**
 * Generate a hash key for a set of nesting pieces.
 * Sorts pieces to ensure same set always gives same key.
 */
function hashPieces(pieces: NestingPiece[]): string {
    const sorted = [...pieces].sort((a, b) => {
        if (a.width !== b.width) return a.width - b.width
        return a.height - b.height
    })

    // Create a compact string representation
    const pieceIds = sorted.map(p => `${p.width}x${p.height}x${p.id}`).join('|')
    return `V${MODULE_VERSIONS.NESTING}:${pieceIds}`
}

export function getFromCache(pieces: NestingPiece[]): DynamicSheetResult | undefined {
    const key = hashPieces(pieces)
    return cache.get(key)?.result
}

export function setInCache(pieces: NestingPiece[], result: DynamicSheetResult): void {
    const key = hashPieces(pieces)

    if (cache.size >= MAX_ENTRIES) {
        const oldest = cache.keys().next().value
        if (oldest !== undefined) cache.delete(oldest)
    }

    cache.set(key, { result, timestamp: Date.now() })
}

export function clearCache(): void {
    cache.clear()
}
