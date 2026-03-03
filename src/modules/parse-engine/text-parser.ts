// src/modules/parse-engine/text-parser.ts
// Regular expression based parsing strategy — implements ParseStrategy
// Good for high-confidence, standard descriptions.

import type { ParseResult, ParseStrategy } from './types'
import {
    DuctItemType,
    ConnectorType,
    SeamType,
    NormalizedParams,
    EMPTY_PARAMS,
} from '../core/types'

// ─── Regex Patterns ──────────────────────────────────────────────────────────

const PATTERN_W_H_L = /(\d+)\s*[x*×]\s*(\d+)(?:\s*[x*×]\s*(\d+))?/i
const PATTERN_D_L = /D\s*(\d+)(?:\s*[x*×]\s*(\d+))?/i
const PATTERN_W2_H2 = /(?:THU|RE)\s*(\d+)\s*[x*×]\s*(\d+)/i
const PATTERN_R = /R\s*(\d+)/i
const PATTERN_E = /E\s*(\d+)/i

// ─── Implementation Helpers ──────────────────────────────────────────────────

function detectType(s: string): DuctItemType {
    if (s.includes('ỐNG THẲNG') || s.includes('ỐNG VUÔNG')) return 'straight_square'
    if (s.includes('BỊT ĐẦU') || s.includes('ỐNG 1 ĐẦU')) return 'straight_1_end'
    if (s.includes('CÚT') || s.includes('CO')) {
        return s.includes('90') || s.includes('LƯỢN') ? 'elbow_90_radius' : 'elbow_90_square'
    }
    if (s.includes('THU')) return s.includes('BÓNG') || s.includes('TRÒN') ? 'reducer_sq_rd' : 'reducer_square'
    if (s.includes('CHÂN RẼ')) return 'shoe_tap'
    if (s.includes('Z')) return 'z_offset_radius'
    if (s.includes('CHẾCH')) return 'offset_square'
    if (s.includes('HỘP GIÓ')) return 'plenum_box'
    return 'straight_square' // Default
}

function parseDimensions(s: string): NormalizedParams {
    const params = { ...EMPTY_PARAMS }

    const m1 = s.match(PATTERN_W_H_L)
    if (m1) {
        params.W = parseInt(m1[1])
        params.H = parseInt(m1[2])
        if (m1[3]) params.L = parseInt(m1[3])
    }

    const mD = s.match(PATTERN_D_L)
    if (mD) {
        params.D = parseInt(mD[1])
        if (mD[2]) params.L = parseInt(mD[2])
    }

    const m2 = s.match(PATTERN_W2_H2)
    if (m2) {
        params.W2 = parseInt(m2[1])
        params.H2 = parseInt(m2[2])
    }

    const mR = s.match(PATTERN_R)
    if (mR) params.R = parseInt(mR[1])

    const mE = s.match(PATTERN_E)
    if (mE) params.E = parseInt(mE[1])

    return params
}

function parseConnectors(s: string): { conn1: ConnectorType; conn2: ConnectorType } {
    const res = { conn1: 'tdc' as ConnectorType, conn2: 'tdc' as ConnectorType }

    if (s.includes('BÍCH V30')) res.conn1 = res.conn2 = 'bich_v30'
    if (s.includes('BÍCH V40')) res.conn1 = res.conn2 = 'bich_v40'
    if (s.includes('BÍCH V50')) res.conn1 = res.conn2 = 'bich_v50'
    if (s.includes('BỊT ĐẦU')) res.conn2 = 'bit_dau'
    if (s.includes('NẸP C')) res.conn1 = res.conn2 = 'nep_c'
    if (s.includes('ĐỂ THẲNG')) res.conn1 = res.conn2 = 'de_thang'

    return res
}

function parseSeam(s: string): SeamType {
    if (s.includes('ĐƠN KÉP')) return 'don_kep'
    if (s.includes('NỐI C')) return 'noi_c'
    if (s.includes('HÀN')) return 'han_15'
    return 'pittsburgh' // Default
}

// ─── Public Strategy Implementation ───────────────────────────────────────────

export const regexStrategy: ParseStrategy = {
    name: 'regex',

    async parse(rawInput: string): Promise<ParseResult> {
        const s = rawInput.toUpperCase()
        const warnings: string[] = []

        // 1. Detect type
        let displayType = detectType(s)

        // 2. Parse dimensions
        const params = parseDimensions(s)

        // 2.5. Auto-upgrade plenum_box → reducer_square when W2/H2 detected
        if ((displayType === 'plenum_box' || s.includes('HỘP GIÓ')) && params.W2 > 0 && params.H2 > 0) {
            displayType = 'reducer_square'
        }

        // 3. Parse connectors
        const connector = parseConnectors(s)

        // Apply shoe_tap default connector
        if (displayType === 'shoe_tap') {
            connector.conn2 = 'be_chan_30'
        }

        // 4. Parse seam
        const seam = parseSeam(s)

        // 5. Validation warnings
        if (params.W === 0 && params.D === 0) warnings.push('Could not determine width/diameter')
        if (params.L === 0 && !['elbow_90_radius', 'elbow_90_square', 'plenum_box'].includes(displayType)) {
            warnings.push('Length not detected, defaulting to 0')
        }

        return {
            displayType,
            params,
            connector,
            seam,
            confidence: 1.0, // Regex is deterministic
            warnings,
        }
    },

    async parseBatch(inputs: string[]): Promise<ParseResult[]> {
        return Promise.all(inputs.map(input => this.parse(input)))
    },
}
