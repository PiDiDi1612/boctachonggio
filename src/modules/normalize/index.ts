// src/modules/normalize/index.ts
// Public API for normalize module

export {
    toMaterialType,
    toDisplayType,
    isValidDisplayType,
    isValidMaterialType,
    getAllDisplayTypes,
    getAllMaterialTypes,
} from './type-registry'

export {
    parseDimensionString,
    buildDimensionString,
} from './dimension-parser'
