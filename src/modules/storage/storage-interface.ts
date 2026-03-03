// src/modules/storage/storage-interface.ts
// Port interface — decouple business logic from persistence mechanism
// Uses AppSettings (flat format) for backward compatibility with calculation-engine

import type { AppSettings } from '../../lib/types'
import type { ProductionFeedback, EstimationContext } from '../core/types'

/**
 * Project entity as stored in persistence layer.
 * Compatible with the existing Project interface in lib/types.ts
 */
export interface StoredProject {
    id: string
    name: string
    description?: string
    createdAt: string
    updatedAt?: string
    items: StoredDuctItem[]
    metadata?: EstimationContext // SNAPSHOT of all versions & factors
}

export interface StoredDuctItem {
    id: string
    type: string          // DuctItemType (UI-level)
    dimensions: string    // "WxHxLxDxExW2xH2"
    quantity: number
    thickness: number
    unit: string
    area: number
    weight: number
    note?: string
    conn1?: string
    conn2?: string
    seam?: string
}

/**
 * Storage port — all persistence must go through this interface.
 * No engine or hook should access localStorage/IDB directly.
 */
export interface StoragePort {
    // ─── Projects ─────────────────────────────────────────────
    getProjects(): Promise<StoredProject[]>
    getProject(id: string): Promise<StoredProject | undefined>
    upsertProject(project: StoredProject): Promise<void>
    deleteProject(id: string): Promise<void>

    // ─── Settings ─────────────────────────────────────────────
    getSettings(): AppSettings
    saveSettings(settings: AppSettings): void

    // ─── Feedback ─────────────────────────────────────────────
    addFeedback(feedback: ProductionFeedback): Promise<void>
    getFeedback(materialType?: string): Promise<ProductionFeedback[]>

    // ─── Lifecycle ────────────────────────────────────────────
    clearAll(): Promise<void>
}
