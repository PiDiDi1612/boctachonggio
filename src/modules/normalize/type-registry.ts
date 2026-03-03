// src/modules/normalize/type-registry.ts
// Bi-directional mapping between UI types (DuctItemType) and Engine types (MaterialType)
// Centralizes the mapping that was previously scattered across area.ts and calculateItem.ts

import type { DuctItemType, MaterialType } from '../core/types'

// ─── Bi-directional Maps ──────────────────────────────────────────────────────

const UI_TO_ENGINE: Record<DuctItemType, MaterialType> = {
    straight_square: 'ong_thang',
    straight_1_end: 'ong_thang_bit_1_dau',
    elbow_90_radius: 'co_90_tron',
    elbow_90_square: 'co_90_vuong',
    reducer_square: 'con_thu',
    reducer_sq_rd: 'con_thu_vuong_tron',
    shoe_tap: 'chan_re',
    z_offset_radius: 'z_luon',
    offset_round_deg: 'chech_45_tron',
    offset_square: 'chech_45_vuong',
    plenum_box: 'box_kin',
    other: 'unknown',
}

const ENGINE_TO_UI: Record<MaterialType, DuctItemType> = {
    ong_thang: 'straight_square',
    ong_thang_bit_1_dau: 'straight_1_end',
    co_90_tron: 'elbow_90_radius',
    co_90_vuong: 'elbow_90_square',
    con_thu: 'reducer_square',
    con_thu_vuong_tron: 'reducer_sq_rd',
    chan_re: 'shoe_tap',
    z_luon: 'z_offset_radius',
    chech_45_tron: 'offset_round_deg',
    chech_45_vuong: 'offset_square',
    box_kin: 'plenum_box',
    hop_gio: 'plenum_box',
    te_nga: 'plenum_box',      // Tê ngã = variant of plenum box
    ong_tron: 'straight_square', // Placeholder until circular duct type is added
    co_45_tron: 'offset_round_deg',
    unknown: 'other',
}

// ─── Lookup Functions ─────────────────────────────────────────────────────────

/** Convert UI display type to engine material type */
export function toMaterialType(displayType: DuctItemType): MaterialType {
    return UI_TO_ENGINE[displayType] ?? 'unknown'
}

/** Convert engine material type to UI display type */
export function toDisplayType(materialType: MaterialType): DuctItemType {
    return ENGINE_TO_UI[materialType] ?? 'other'
}

/** Check if a string is a valid DuctItemType */
export function isValidDisplayType(value: string): value is DuctItemType {
    return value in UI_TO_ENGINE
}

/** Check if a string is a valid MaterialType */
export function isValidMaterialType(value: string): value is MaterialType {
    return value in ENGINE_TO_UI
}

/** Get all registered UI types */
export function getAllDisplayTypes(): DuctItemType[] {
    return Object.keys(UI_TO_ENGINE) as DuctItemType[]
}

/** Get all registered Engine types */
export function getAllMaterialTypes(): MaterialType[] {
    return Object.keys(ENGINE_TO_UI) as MaterialType[]
}
