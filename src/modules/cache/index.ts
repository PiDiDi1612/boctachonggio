// src/modules/cache/index.ts
// Public API for cache module

export {
    hashKey,
    getFromCache,
    setInCache,
    invalidateIfSettingsChanged,
    clearCache,
    getCacheStats,
} from './calc-cache'
