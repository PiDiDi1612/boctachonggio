// src/modules/core/types.ts
// Canonical domain types — Single source of truth across all engines
// All engines MUST use these types instead of creating their own.

// ─── Material Type (Engine-level) ─────────────────────────────────────────────

export type MaterialType =
  | 'ong_thang'
  | 'ong_thang_bit_1_dau'
  | 'co_90_tron'
  | 'co_90_vuong'
  | 'con_thu'
  | 'con_thu_vuong_tron'
  | 'chan_re'
  | 'z_luon'
  | 'chech_45_tron'
  | 'chech_45_vuong'
  | 'box_kin'
  | 'hop_gio'
  | 'te_nga'
  | 'ong_tron'
  | 'co_45_tron'
  | 'unknown'

export const ALL_MATERIAL_TYPES: MaterialType[] = [
  'ong_thang',
  'ong_thang_bit_1_dau',
  'co_90_tron',
  'co_90_vuong',
  'con_thu',
  'con_thu_vuong_tron',
  'chan_re',
  'z_luon',
  'chech_45_tron',
  'chech_45_vuong',
  'box_kin',
  'hop_gio',
  'te_nga',
  'ong_tron',
  'co_45_tron',
]

// ─── Display Type (UI-level) ──────────────────────────────────────────────────

export type DuctItemType =
  | 'straight_square'
  | 'straight_1_end'
  | 'elbow_90_radius'
  | 'elbow_90_square'
  | 'reducer_square'
  | 'reducer_sq_rd'
  | 'shoe_tap'
  | 'z_offset_radius'
  | 'offset_round_deg'
  | 'offset_square'
  | 'plenum_box'
  | 'other'

// ─── Connector & Seam ─────────────────────────────────────────────────────────

export type ConnectorType =
  | 'tdc'
  | 'bich_v30'
  | 'bich_v40'
  | 'bich_v50'
  | 'bit_dau'
  | 'be_chan_30'
  | 'nep_c'
  | 'de_thang'
  | 'none'

export type SeamType =
  | 'don_kep'
  | 'noi_c'
  | 'han_15'
  | 'pittsburgh'

export interface ConnectorConfig {
  conn1: ConnectorType
  conn2: ConnectorType
}

// ─── Normalized Params ────────────────────────────────────────────────────────

export interface NormalizedParams {
  W: number   // Width 1 (mm)
  H: number   // Height 1 (mm)
  L: number   // Length (mm)
  D: number   // Diameter (mm)
  W2: number  // Width 2 — reducers, shoe taps
  H2: number  // Height 2
  R: number   // Radius (mm)
  E: number   // Aux/offset value (mm)
}

export const EMPTY_PARAMS: NormalizedParams = {
  W: 0, H: 0, L: 0, D: 0, W2: 0, H2: 0, R: 0, E: 0,
}

// ─── Normalized Item ──────────────────────────────────────────────────────────

export interface NormalizedItem {
  id: string
  materialType: MaterialType
  displayType: DuctItemType
  params: NormalizedParams
  quantity: number
  thickness: number // mm
  connector: ConnectorConfig
  seam: SeamType
  unit: string
  source: 'manual' | 'excel' | 'ai'
  rawText?: string // Original text for audit trail
  note?: string
}

// ─── Calculation Output ───────────────────────────────────────────────────────

export interface CalculationOutput {
  area_m2: number
  weight_kg: number
  ke_md: number       // Perimeter reinforcement (mét dài)
  bich_count: number   // Flange count
}

// ─── Accessory / BOM ──────────────────────────────────────────────────────────

export interface AccessoryItem {
  name: string    // "Bích V30", "Gioăng", "Bu lông M8x25"
  unit: string    // "cái", "m", "bộ"
  quantity: number
  weight_kg: number
}

export interface BOMEntry {
  itemId: string
  material: string       // "Tôn kẽm 0.75mm"
  area_m2: number
  weight_kg: number
  accessories: AccessoryItem[]
}

// ─── Calculation Settings (pure — no side effects) ────────────────────────────

export interface CalcSettings {
  connectors: Record<ConnectorType, number>  // type → allowance (meters)
  seams: Record<SeamType, number>            // type → allowance (meters)
  density: number         // kg/m³ (default 7850)
  defaultThickness: number // mm (default 0.75)
}

export const DEFAULT_CALC_SETTINGS: CalcSettings = {
  connectors: {
    tdc: 0.05,
    bich_v30: 0.01,
    bich_v40: 0.01,
    bich_v50: 0.01,
    bit_dau: 0.03,
    be_chan_30: 0.03,
    nep_c: 0.01,
    de_thang: 0,
    none: 0,
  },
  seams: {
    don_kep: 0.038,
    noi_c: 0.02,
    han_15: 0.015,
    pittsburgh: 0.04,
  },
  density: 7850,
  defaultThickness: 0.75,
}

// ─── Project ──────────────────────────────────────────────────────────────────

export interface ProjectStats {
  totalItems: number
  totalArea: number   // m²
  totalWeight: number // kg
}

// ─── Calculator Function Signature ────────────────────────────────────────────

export type CalculatorFn = (
  params: NormalizedParams,
  quantity: number,
  settings: CalcSettings,
  options?: { conn1?: ConnectorType; conn2?: ConnectorType; seam?: SeamType }
) => CalculationOutput
// ─── Production Feedback ──────────────────────────────────────────────────────

export interface ProductionFeedback {
  id: string
  thickness: number
  materialType: MaterialType
  estimatedLength: number // mm (or m2, but user asked for Length)
  actualLength: number    // mm
  timestamp: string       // ISO 8601
}
// ─── Estimation Context ───────────────────────────────────────────────────────

export interface EstimationContext {
  version: string         // General context version
  aiModel: string
  promptHash: string      // Hash of the system prompt used
  correctionVersion: string
  nestingVersion: string
  calcVersion: string
  timestamp: string       // ISO 8601 when context was created
  correctionSnapshots: Record<string, number> // materialType -> factor saved at creation
}
