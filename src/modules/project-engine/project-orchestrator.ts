// src/modules/project-engine/project-orchestrator.ts
// Central Orchestrator for the Duct Manufacturing Pipeline

import type {
    NormalizedItem,
    CalculationOutput,
    ProjectStats,
    MaterialType,
} from '../core/types'
import type { AppSettings } from '../../lib/types'
import type { ParseResult } from '../parse-engine/types'
import type { EstimationContext } from '../core/types'
import type { NestingPiece, DynamicSheetResult, SheetSize } from '../nesting-engine/types'
import type { BOMLine } from '../assembly-engine/types'

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface OrchestratorDependencies {
    parseText: (text: string) => Promise<ParseResult>
    parseBatch?: (texts: string[]) => Promise<ParseResult[]>
    parseCache: {
        get: (text: string) => ParseResult | undefined
        set: (text: string, result: ParseResult) => void
    }
    calculationEngine: (
        type: MaterialType,
        params: any,
        qty: number,
        settings: AppSettings,
        options?: any
    ) => any // Returns CalculationResult (no weight)
    calcCache: {
        hashKey: (...args: any[]) => string
        get: (key: string) => CalculationOutput | undefined
        set: (key: string, result: CalculationOutput) => void
    }
    ruleEngine: {
        applyConnectors: (type: any, conn: any) => any
        applySeams: (type: any, seam: any) => any
    }
    correctionService: {
        getFactor: (type: MaterialType) => Promise<number>
    }
    assemblyEngine: {
        generateAccessories: (params: any, conn1: any, conn2: any, qty: number) => BOMLine[]
    }
    partGenerator: (item: NormalizedItem) => NestingPiece[]
    nestingEngine: (pieces: NestingPiece[]) => DynamicSheetResult
    nestCache: {
        get: (pieces: NestingPiece[]) => DynamicSheetResult | undefined
        set: (pieces: NestingPiece[], result: DynamicSheetResult) => void
    }
    toMaterialType: (displayType: any) => MaterialType
}

export interface ProjectResult {
    items: Array<{ item: NormalizedItem; metrics: CalculationOutput; accessories: BOMLine[] }>
    nestingSummary: DynamicSheetResult[]
    stats: ProjectStats & { totalLength: number; averageWaste: number }
    overallBOM: BOMLine[]
}

// ─── Implementation ───────────────────────────────────────────────────────────

export class ProjectOrchestrator {
    constructor(private deps: OrchestratorDependencies) { }

    async processProject(
        rows: Array<{ text: string; quantity: number; thickness: number }>,
        settings: AppSettings,
        sheetSize: SheetSize,
        context?: EstimationContext
    ): Promise<ProjectResult> {

        // 1. Deduplication
        const rowMap = new Map<string, { text: string; quantity: number; thickness: number }>()
        rows.forEach(r => {
            const key = `${r.text.trim().toUpperCase()}|${r.thickness}`
            const existing = rowMap.get(key)
            if (existing) {
                existing.quantity += r.quantity
            } else {
                rowMap.set(key, { ...r })
            }
        })
        const uniqueItems = Array.from(rowMap.values())

        const results: ProjectResult['items'] = []

        // 2. Batch Parsing (Optimization)
        const missingTexts = uniqueItems
            .map(u => u.text)
            .filter(t => !this.deps.parseCache.get(t))

        if (missingTexts.length > 0) {
            const batchResults = this.deps.parseBatch
                ? await this.deps.parseBatch(missingTexts)
                : await Promise.all(missingTexts.map(t => this.deps.parseText(t)))

            missingTexts.forEach((text, idx) => {
                this.deps.parseCache.set(text, batchResults[idx])
            })
        }

        // 3. Detailed Processing (Parallel)
        await Promise.all(uniqueItems.map(async (row) => {
            const parsed = this.deps.parseCache.get(row.text)!

            const materialType = this.deps.toMaterialType(parsed.displayType)
            const connector = this.deps.ruleEngine.applyConnectors(parsed.displayType, parsed.connector)
            const seam = this.deps.ruleEngine.applySeams(parsed.displayType, parsed.seam)

            const normalizedItem: NormalizedItem = {
                id: Math.random().toString(36).substring(2, 9),
                materialType,
                displayType: parsed.displayType as any,
                params: parsed.params,
                quantity: row.quantity,
                thickness: row.thickness,
                connector,
                seam,
                unit: 'cái',
                source: 'excel' as const,
                rawText: row.text
            }

            const calcKey = this.deps.calcCache.hashKey(
                materialType,
                parsed.params,
                row.quantity,
                row.thickness,
                connector.conn1,
                connector.conn2,
                seam
            )

            let metrics = this.deps.calcCache.get(calcKey)
            if (!metrics) {
                const res = this.deps.calculationEngine(materialType, parsed.params, row.quantity, settings, {
                    conn1: connector.conn1,
                    conn2: connector.conn2,
                    seam
                })

                // Calculate weight: Area (m²) * Thickness (mm) * Density (kg/m³)
                // defaultDensity is kg/m³, area is m², thickness is mm. 
                // Weight (kg) = Area * (Thickness/1000) * Density
                const area = res.area_m2
                const thicknessM = row.thickness / 1000
                const density = settings.defaultDensity || 7850
                const weight_kg = area * thicknessM * density

                metrics = {
                    area_m2: area,
                    weight_kg: Math.round(weight_kg * 100) / 100,
                    ke_md: res.ke_md,
                    bich_count: res.bich_count
                }
                this.deps.calcCache.set(calcKey, metrics)
            }

            // 4. Correction Factor (Snapshot-aware)
            let factor = 1.0
            if (context?.correctionSnapshots?.[materialType]) {
                factor = context.correctionSnapshots[materialType]
            } else {
                factor = await this.deps.correctionService.getFactor(materialType)
            }

            if (factor !== 1.0) {
                metrics.area_m2 *= factor
                metrics.weight_kg *= factor
            }

            const accessories = this.deps.assemblyEngine.generateAccessories(
                normalizedItem.params,
                connector.conn1,
                connector.conn2,
                row.quantity
            )

            results.push({ item: normalizedItem, metrics, accessories })
        }))

        // 3. Nesting (Integrated Dynamic Length)
        const piecesByThickness = new Map<number, NestingPiece[]>()
        results.forEach(res => {
            const pieces = this.deps.partGenerator(res.item)
            const existing = piecesByThickness.get(res.item.thickness) || []
            piecesByThickness.set(res.item.thickness, [...existing, ...pieces])
        })

        const nestingSummary: DynamicSheetResult[] = []
        piecesByThickness.forEach((pieces) => {
            let dynamicResult = this.deps.nestCache.get(pieces)
            if (!dynamicResult) {
                dynamicResult = this.deps.nestingEngine(pieces)
                this.deps.nestCache.set(pieces, dynamicResult)
            }
            nestingSummary.push(dynamicResult)
        })

        // 4. Aggregation
        const totalLength = nestingSummary.reduce((sum, n) => sum + n.totalLengthUsed, 0)
        const avgWaste = nestingSummary.length > 0
            ? nestingSummary.reduce((sum, n) => sum + n.wastePercentage, 0) / nestingSummary.length
            : 0

        const stats: ProjectResult['stats'] = {
            totalItems: results.reduce((sum, r) => sum + r.item.quantity, 0),
            totalArea: results.reduce((sum, r) => sum + r.metrics.area_m2 * r.item.quantity, 0),
            totalWeight: results.reduce((sum, r) => sum + r.metrics.weight_kg * r.item.quantity, 0),
            totalLength: totalLength,
            averageWaste: Math.round(avgWaste * 100) / 100
        }

        const overallBOM = this.consolidateBOM(results)

        return {
            items: results,
            nestingSummary,
            stats,
            overallBOM
        }
    }

    private consolidateBOM(results: ProjectResult['items']): BOMLine[] {
        const bomMap = new Map<string, BOMLine>()
        results.forEach(res => {
            const keySheet = `SHEET_${res.item.thickness}`
            const area = res.metrics.area_m2 * res.item.quantity
            const weight = res.metrics.weight_kg * res.item.quantity

            const existingSheet = bomMap.get(keySheet)
            if (existingSheet) {
                existingSheet.quantity += area
                existingSheet.weight_kg += weight
            } else {
                bomMap.set(keySheet, {
                    category: 'Tôn',
                    name: `Tôn kẽm ${res.item.thickness}mm`,
                    unit: 'm²',
                    quantity: area,
                    weight_kg: weight
                })
            }

            res.accessories.forEach(acc => {
                const keyAcc = `ACC_${acc.name}`
                const existingAcc = bomMap.get(keyAcc)
                if (existingAcc) {
                    existingAcc.quantity += acc.quantity
                    existingAcc.weight_kg += acc.weight_kg
                } else {
                    bomMap.set(keyAcc, { ...acc })
                }
            })
        })
        return Array.from(bomMap.values())
    }
}
