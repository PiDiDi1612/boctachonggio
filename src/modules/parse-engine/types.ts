// src/modules/parse-engine/types.ts
// Parse engine interfaces — AI-ready strategy pattern

import type {
    DuctItemType,
    ConnectorConfig,
    SeamType,
    NormalizedParams,
} from '../core/types'

/** Result of parsing a raw text string */
export interface ParseResult {
    displayType: DuctItemType
    params: NormalizedParams
    connector: ConnectorConfig
    seam: SeamType
    confidence: number     // 0-1 (1.0 for regex, lower for AI)
    warnings: string[]     // e.g. "Could not determine length, defaulting to 0"
}

/** Strategy interface — allows swapping regex for AI without changing callers */
export interface ParseStrategy {
    name: string
    parse(input: string): Promise<ParseResult>
    parseBatch(inputs: string[]): Promise<ParseResult[]>
}
