// src/modules/project-engine/index.ts
// Public API for project engine

export {
    processFullProject,
    mapToDuctItems,
    batchCreateFromExcel,
    processManualItem,
    genId
} from './project-service'

export { ProjectOrchestrator } from './project-orchestrator'
export type { ProjectResult } from './project-orchestrator'
