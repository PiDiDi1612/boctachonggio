// src/modules/core/index.ts
// Public API — single import point for all core types

export type {
    MaterialType,
    DuctItemType,
    ConnectorType,
    SeamType,
    ConnectorConfig,
    NormalizedParams,
    NormalizedItem,
    CalculationOutput,
    AccessoryItem,
    BOMEntry,
    CalcSettings,
    ProjectStats,
    CalculatorFn,
} from './types'

export {
    EMPTY_PARAMS,
    DEFAULT_CALC_SETTINGS,
} from './types'

export {
    DuctCalcError,
    ParseError,
    CalculationError,
    StorageError,
    RuleError,
} from './errors'
