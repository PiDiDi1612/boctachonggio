// src/modules/rule-engine/connector-rules.ts
// Business rules for auto-detecting connectors from item metadata

import type { DuctItemType, ConnectorConfig } from '../core/types'

export interface ConnectorRuleInput {
    rawText: string
    displayType: DuctItemType
}

/** Default connector assignments by duct type */
const TYPE_DEFAULTS: Partial<Record<DuctItemType, ConnectorConfig>> = {
    shoe_tap: { conn1: 'tdc', conn2: 'be_chan_30' },
    plenum_box: { conn1: 'de_thang', conn2: 'tdc' },
}

/**
 * Apply connector defaults based on duct type.
 * Called AFTER text parser has done its work — only fills in gaps.
 */
export function applyConnectorDefaults(
    displayType: DuctItemType,
    current: ConnectorConfig
): ConnectorConfig {
    const defaults = TYPE_DEFAULTS[displayType]
    if (!defaults) return current

    return {
        conn1: current.conn1 === 'tdc' ? defaults.conn1 : current.conn1,
        conn2: current.conn2 === 'tdc' ? defaults.conn2 : current.conn2,
    }
}
