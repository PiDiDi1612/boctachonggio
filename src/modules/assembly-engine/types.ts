// src/modules/assembly-engine/types.ts
// BOM and accessory types

import type { ConnectorType, SeamType } from '../core/types'

export interface AccessorySpec {
    /** Connector type that triggers this accessory */
    trigger: ConnectorType
    /** Generated accessories */
    items: AccessoryTemplate[]
}

export interface AccessoryTemplate {
    name: string
    unit: string
    /** How to calculate quantity: 'per_connector' | 'per_perimeter' | 'fixed' */
    quantityMode: 'per_connector' | 'per_perimeter' | 'fixed'
    /** Quantity multiplier or fixed amount */
    quantityValue: number
    /** Weight per unit (kg) — 0 if negligible */
    weightPerUnit: number
}

export interface BOMLine {
    category: string       // "Tôn", "Phụ kiện", "Gioăng"
    name: string           // "Tôn kẽm 0.75mm", "Bích V30 W500xH400"
    unit: string
    quantity: number
    area_m2?: number
    weight_kg: number
}
