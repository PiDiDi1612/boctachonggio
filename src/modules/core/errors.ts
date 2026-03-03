// src/modules/core/errors.ts
// Domain-specific error classes for structured error handling

export class DuctCalcError extends Error {
    constructor(
        message: string,
        public readonly code: string,
        public readonly context?: Record<string, unknown>
    ) {
        super(message)
        this.name = 'DuctCalcError'
    }
}

export class ParseError extends DuctCalcError {
    constructor(message: string, context?: Record<string, unknown>) {
        super(message, 'PARSE_ERROR', context)
        this.name = 'ParseError'
    }
}

export class CalculationError extends DuctCalcError {
    constructor(message: string, context?: Record<string, unknown>) {
        super(message, 'CALC_ERROR', context)
        this.name = 'CalculationError'
    }
}

export class StorageError extends DuctCalcError {
    constructor(message: string, context?: Record<string, unknown>) {
        super(message, 'STORAGE_ERROR', context)
        this.name = 'StorageError'
    }
}

export class RuleError extends DuctCalcError {
    constructor(message: string, context?: Record<string, unknown>) {
        super(message, 'RULE_ERROR', context)
        this.name = 'RuleError'
    }
}
