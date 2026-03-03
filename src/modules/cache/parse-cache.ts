// src/modules/cache/parse-cache.ts
// Memoization for expensive AI parsing results

import type { ParseResult } from '../parse-engine/types'
import { MODULE_VERSIONS } from '../core/versions'

interface ParseCacheEntry {
    result: ParseResult
    timestamp: number
}

const STORAGE_KEY = 'ductpro_parse_cache'
const MAX_ENTRIES = 5000

class ParseCache {
    private cache: Map<string, ParseCacheEntry> = new Map()

    constructor() {
        this.load()
    }

    private load() {
        if (typeof window === 'undefined') return
        try {
            const raw = localStorage.getItem(STORAGE_KEY)
            if (raw) {
                const data = JSON.parse(raw)
                this.cache = new Map(Object.entries(data))
            }
        } catch (err) {
            console.warn('[ParseCache] Failed to load from localStorage:', err)
        }
    }

    private save() {
        if (typeof window === 'undefined') return
        try {
            const data = Object.fromEntries(this.cache.entries())
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
        } catch (err) {
            console.warn('[ParseCache] Failed to save to localStorage:', err)
        }
    }

    private makeKey(text: string): string {
        return `V${MODULE_VERSIONS.PARSER}:${text.trim().toUpperCase()}`
    }

    get(text: string): ParseResult | undefined {
        const key = this.makeKey(text)
        const entry = this.cache.get(key)
        if (entry) return entry.result
        return undefined
    }

    set(text: string, result: ParseResult): void {
        const key = this.makeKey(text)

        // Evict if full
        if (this.cache.size >= MAX_ENTRIES) {
            const oldest = this.cache.keys().next().value
            if (oldest) this.cache.delete(oldest)
        }

        this.cache.set(key, { result, timestamp: Date.now() })
        this.save()
    }

    clear(): void {
        this.cache.clear()
        this.save()
    }
}

export const parseCache = new ParseCache()
