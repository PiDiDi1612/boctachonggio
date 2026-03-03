// src/modules/project-engine/project-service.ts
// Business operations for project management
// Orchestrates all engines via ProjectOrchestrator


import { parseText, parseBatch } from '../parse-engine'
import { applyConnectorDefaults, applySeamDefaults } from '../rule-engine'
import { toMaterialType, buildDimensionString } from '../normalize'
import { type EstimationContext, ALL_MATERIAL_TYPES } from '../core/types'
import { MODULE_VERSIONS } from '../core/versions'

// Orchestrator & Dependencies
import { ProjectOrchestrator, type ProjectResult } from './project-orchestrator'
import { parseCache } from '../cache/parse-cache'
import { calculateItem } from '../calculation-engine'
import * as calcCache from '../cache/calc-cache'
import * as nestCache from '../cache/nest-cache'
import { getCorrectionFactor } from '../calculation-engine/correction-factor'
import { getCorrectionFactor as getCorrectionFactorAsync } from '../calculation-engine/correction-factor'
import { generateAccessories } from '../assembly-engine'
import { generateParts } from '../nesting-engine/part-generator'
import { nestDynamic } from '../nesting-engine'
import type { DuctItem, AppSettings, DuctItemType } from '@/lib/types'

// ─── Orchestrator Setup ───────────────────────────────────────────────────────

const orchestrator = new ProjectOrchestrator({
    parseText,
    parseBatch,
    parseCache: {
        get: (text) => parseCache.get(text),
        set: (text, res) => parseCache.set(text, res)
    },
    calculationEngine: calculateItem as unknown as ConstructorParameters<typeof ProjectOrchestrator>[0]['calculationEngine'], // Handle type differences elegantly
    calcCache: {
        hashKey: calcCache.hashKey,
        get: (key) => calcCache.getFromCache(key),
        set: (key, res) => calcCache.setInCache(key, res)
    },
    ruleEngine: {
        applyConnectors: applyConnectorDefaults,
        applySeams: applySeamDefaults
    },
    correctionService: {
        getFactor: (type) => getCorrectionFactorAsync(type)
    },
    assemblyEngine: {
        generateAccessories
    },
    partGenerator: generateParts,
    nestingEngine: nestDynamic,
    nestCache: {
        get: (pieces) => nestCache.getFromCache(pieces),
        set: (pieces, res) => nestCache.setInCache(pieces, res)
    },
    toMaterialType
})

// ─── Context Management ───────────────────────────────────────────────────────

/**
 * Creates a fresh estimation context for a new project.
 * Freezes current versions and gathers correction factor snapshots.
 */
export async function createEstimationContext(): Promise<EstimationContext> {
    const snapshots: Record<string, number> = {}

    // Asynchronously gather all factors
    await Promise.all(ALL_MATERIAL_TYPES.map(async (type) => {
        snapshots[type] = await getCorrectionFactor(type)
    }))

    return {
        version: '1.0',
        aiModel: 'sailor2:8b', // Should be dynamic from settings if possible
        promptHash: 'default-v1', // Placeholder for prompt hash
        correctionVersion: 'adaptive-v1',
        nestingVersion: MODULE_VERSIONS.NESTING,
        calcVersion: MODULE_VERSIONS.CALCULATION,
        timestamp: new Date().toISOString(),
        correctionSnapshots: snapshots
    }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Process raw Excel rows into full project result.
 */
export async function processFullProject(
    rows: Array<{ name: string; quantity: number; thickness: number }>,
    settings: AppSettings,
    context?: EstimationContext
): Promise<ProjectResult> {
    const rawRows = rows.map(r => ({ text: r.name, quantity: r.quantity, thickness: r.thickness }))
    return orchestrator.processProject(rawRows, settings, { width: 1200, height: 4000 }, context)
}

/**
 * Map Orchestrator result items back to UI DuctItem type.
 */
export function mapToDuctItems(orchestratorResult: ProjectResult): DuctItem[] {
    return orchestratorResult.items.map(res => ({
        id: res.item.id,
        type: res.item.displayType as DuctItemType,
        dimensions: buildDimensionString(res.item.params),
        quantity: res.item.quantity,
        thickness: res.item.thickness,
        unit: res.item.unit,
        area: res.metrics.area_m2,
        weight: res.metrics.weight_kg,
        conn1: res.item.connector.conn1,
        conn2: res.item.connector.conn2,
        seam: res.item.seam,
        note: res.item.rawText
    }))
}

/**
 * Legacy support for Excel import modal.
 * Converts raw rows directly to DuctItems.
 */
export async function batchCreateFromExcel(
    rows: Array<{ name: string; quantity: number; thickness: number }>,
    settings: AppSettings
): Promise<DuctItem[]> {
    const result = await processFullProject(rows, settings)
    return mapToDuctItems(result)
}

/**
 * Single item processor for manual entry.
 */
export async function processManualItem(
    text: string,
    quantity: number,
    thickness: number,
    settings: AppSettings,
    overrides?: Partial<DuctItem>
): Promise<DuctItem> {
    const items = await batchCreateFromExcel([{ name: text, quantity, thickness }], settings)
    const item = items[0]
    if (overrides) {
        return { ...item, ...overrides }
    }
    return item
}

// ─── Utilities ────────────────────────────────────────────────────────────────

export function genId(): string {
    return Math.random().toString(36).substring(2, 9)
}
