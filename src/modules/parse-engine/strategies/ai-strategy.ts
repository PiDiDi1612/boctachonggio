// src/modules/parse-engine/strategies/ai-strategy.ts
// AI-based parsing strategy — implements ParseStrategy
// Connects to local LLM providers like Ollama via OpenAI-compatible API

import type { ParseResult, ParseStrategy } from '../types'
import { EMPTY_PARAMS } from '../../core/types'
import { regexStrategy } from '../text-parser'

/**
 * Configuration for AI parsing provider.
 */
export interface AIParseConfig {
    provider: 'openai' | 'gemini' | 'anthropic' | 'ollama'
    baseUrl: string
    apiKey: string
    model: string
    /** Maximum timeout in ms */
    timeout?: number
    /** Whether to fallback to regex on failure */
    fallbackToRegex?: boolean
}

/**
 * Prompt templates for AI parsing.
 */
export const AI_PARSE_PROMPT = `
Given a raw Vietnamese HVAC duct material description string, extract the following structured data:

1. **type**: One of: straight_square, straight_1_end, elbow_90_radius, elbow_90_square, reducer_square, reducer_sq_rd, shoe_tap, z_offset_radius, offset_round_deg, offset_square, plenum_box, other
2. **dimensions**: { W, H, L, D, W2, H2, R, E } in millimeters. Use 0 if not found.
3. **connector1**: One of: tdc, bich_v30, bich_v40, bich_v50, bit_dau, be_chan_30, nep_c, de_thang, none
4. **connector2**: Same options as connector1
5. **seam**: One of: don_kep, noi_c, han_15, pittsburgh

Respond ONLY with valid JSON. 

Example Input: "Ống gió thẳng 500x400x1200 Bích V30"
Example Output:
{
  "type": "straight_square",
  "dimensions": { "W": 500, "H": 400, "L": 1200, "D": 0, "W2": 0, "H2": 0, "R": 0, "E": 0 },
  "connector1": "bich_v30",
  "connector2": "bich_v30",
  "seam": "pittsburgh"
}

Input: "{{INPUT}}"
`

export const AI_BATCH_PROMPT = `
Given an array of raw Vietnamese HVAC duct material descriptions, extract structured data for EACH item.

Return a JSON object with a "results" key containing an array of objects. 
Each object must have the same fields as the single parse (type, dimensions, connector1, connector2, seam).

Input Array: {{INPUTS}}

Example Output:
{
  "results": [
    {
      "type": "straight_square",
      "dimensions": { "W": 500, "H": 400, "L": 1200, "D": 0, "W2": 0, "H2": 0, "R": 0, "E": 0 },
      "connector1": "bich_v30",
      "connector2": "bich_v30",
      "seam": "pittsburgh"
    }
  ]
}
`

/**
 * AI Parse Strategy — sends raw text to LLM for structured extraction.
 */
export function createAIStrategy(config: AIParseConfig): ParseStrategy {
    const fallback = async (input: string, reason: string): Promise<ParseResult> => {
        const result = await regexStrategy.parse(input)
        return {
            ...result,
            confidence: 0.5,
            warnings: [...result.warnings, reason, 'Used regex fallback']
        }
    }

    const singleParseInternal = async (rawInput: string): Promise<ParseResult> => {
        const timeoutSignal = (config.timeout && typeof AbortSignal !== 'undefined' && 'timeout' in AbortSignal)
            ? (AbortSignal as unknown as { timeout: (ms: number) => AbortSignal }).timeout(config.timeout)
            : undefined;

        const response = await fetch(`${config.baseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.apiKey}`,
            },
            body: JSON.stringify({
                model: config.model,
                messages: [
                    { role: 'system', content: 'Analyze one HVAC description and return JSON.' },
                    { role: 'user', content: AI_PARSE_PROMPT.replace('{{INPUT}}', rawInput) }
                ],
                temperature: 0.1,
                response_format: { type: 'json_object' }
            }),
            signal: timeoutSignal
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;
        if (!content) throw new Error('Empty AI response');
        const parsed = JSON.parse(content);

        return {
            displayType: parsed.type || 'straight_square',
            params: { ...EMPTY_PARAMS, ...parsed.dimensions },
            connector: {
                conn1: parsed.connector1 || 'tdc',
                conn2: parsed.connector2 || 'tdc'
            },
            seam: parsed.seam || 'pittsburgh',
            confidence: 0.9,
            warnings: []
        };
    }

    return {
        name: `ai-${config.provider}`,

        async parse(rawInput: string): Promise<ParseResult> {
            const results = await this.parseBatch([rawInput]);
            return results[0];
        },

        async parseBatch(inputs: string[]): Promise<ParseResult[]> {
            if (inputs.length === 0) return [];
            if (!config.baseUrl) {
                return Promise.all(inputs.map(i => fallback(i, 'AI Base URL not configured')));
            }

            const batchSize = 20;
            const allResults: ParseResult[] = [];

            for (let i = 0; i < inputs.length; i += batchSize) {
                const chunk = inputs.slice(i, i + batchSize);
                try {
                    const timeoutSignal = (config.timeout && typeof AbortSignal !== 'undefined' && 'timeout' in AbortSignal)
                        ? (AbortSignal as unknown as { timeout: (ms: number) => AbortSignal }).timeout(config.timeout)
                        : undefined;

                    const response = await fetch(`${config.baseUrl}/chat/completions`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${config.apiKey}`,
                        },
                        body: JSON.stringify({
                            model: config.model,
                            messages: [
                                { role: 'system', content: 'Parse HVAC descriptions into a JSON array "results".' },
                                { role: 'user', content: AI_BATCH_PROMPT.replace('{{INPUTS}}', JSON.stringify(chunk)) }
                            ],
                            temperature: 0.1,
                            response_format: { type: 'json_object' }
                        }),
                        signal: timeoutSignal
                    });

                    if (!response.ok) throw new Error(`HTTP ${response.status}`);

                    const data = await response.json();
                    const content = data.choices?.[0]?.message?.content;
                    if (!content) throw new Error('Empty content');

                    const parsedBatch = JSON.parse(content).results;
                    if (!Array.isArray(parsedBatch)) throw new Error('Invalid array format');

                    chunk.forEach((_, idx) => {
                        const item = parsedBatch[idx] || {};
                        allResults.push({
                            displayType: item.type || 'straight_square',
                            params: { ...EMPTY_PARAMS, ...item.dimensions },
                            connector: {
                                conn1: item.connector1 || 'tdc',
                                conn2: item.connector2 || 'tdc'
                            },
                            seam: item.seam || 'pittsburgh',
                            confidence: 0.9,
                            warnings: []
                        });
                    });
                } catch (err: unknown) {
                    const errMsg = err instanceof Error ? err.message : String(err);
                    console.warn(`[AI Strategy] Batch failure, falling back to single: ${errMsg}`);
                    const partials = await Promise.all(chunk.map(text =>
                        singleParseInternal(text).catch(() => fallback(text, errMsg))
                    ));
                    allResults.push(...partials);
                }
            }

            return allResults;
        }
    }
}
