// src/modules/parse-engine/index.ts
// Public API for parse engine

import type { ParseResult, ParseStrategy } from './types'
import { regexStrategy } from './text-parser'

import { createAIStrategy } from './strategies/ai-strategy'

let currentStrategy: ParseStrategy = regexStrategy

/**
 * Initialize AI strategy from application settings.
 */
export function initAIFromSettings(settings: {
    aiEnabled: boolean,
    aiBaseUrl: string,
    aiApiKey: string,
    aiModel: string
}) {
    if (settings.aiEnabled && settings.aiBaseUrl) {
        currentStrategy = createAIStrategy({
            provider: 'ollama',
            baseUrl: settings.aiBaseUrl,
            apiKey: settings.aiApiKey,
            model: settings.aiModel,
            timeout: 10000,
            fallbackToRegex: true
        })
    } else {
        currentStrategy = regexStrategy
    }
}

/**
 * Parse text using the currently selected strategy.
 */
export async function parseText(rawInput: string): Promise<ParseResult> {
    return currentStrategy.parse(rawInput)
}

/**
 * Batch parse multiple texts using the current strategy.
 */
export async function parseBatch(inputs: string[]): Promise<ParseResult[]> {
    return currentStrategy.parseBatch(inputs)
}

export { regexStrategy } from './text-parser'
export { createAIStrategy } from './strategies/ai-strategy'
export type { ParseResult, ParseStrategy } from './types'
export type { AIParseConfig } from './strategies/ai-strategy'
