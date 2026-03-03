// src/modules/project-engine/types.ts
// Project engine types

import type { NormalizedItem, ProjectStats, CalculationOutput } from '../core/types'

/** Full project with normalized items */
export interface ProjectData {
    id: string
    name: string
    description?: string
    createdAt: string
    updatedAt?: string
    items: NormalizedItem[]
}

/** Item with computed metrics attached */
export interface ComputedItem extends NormalizedItem {
    computed: CalculationOutput
}

/** Project with computed stats */
export interface ProjectWithStats {
    data: ProjectData
    stats: ProjectStats
    items: ComputedItem[]
}
