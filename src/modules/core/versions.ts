// src/modules/core/versions.ts
// Central version control for all engines
// Increment these to invalidate caches and trigger re-calculations

export const MODULE_VERSIONS = {
    PARSER: '1.2.0',      // AI Batch parsing update
    CALCULATION: '1.0.0', // Base calculation logic
    NESTING: '1.1.0',     // Dynamic length optimization
    RULE_ENGINE: '1.0.0', // Connector/Seam defaults
} as const
