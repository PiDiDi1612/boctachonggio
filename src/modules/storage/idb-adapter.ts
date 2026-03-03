// src/modules/storage/idb-adapter.ts
// IDB + localStorage adapter — implements StoragePort
// Wraps the existing lib/storage.ts logic behind the port interface

import { get, set, del } from 'idb-keyval'
import type { AppSettings } from '../../lib/types'
import type { StoragePort, StoredProject } from './storage-interface'
import type { ProductionFeedback } from '../core/types'

const PROJECT_KEY = 'ductpro_v1_projects'
const SETTINGS_KEY = 'ductpro_v1_settings'
const FEEDBACK_KEY = 'ductpro_v1_feedback'

const DEFAULT_SETTINGS: AppSettings = {
    connTDC: 0.05,
    connV30: 0.01,
    connV40: 0.01,
    connV50: 0.01,
    connBitDau: 0.03,
    connBeChan30: 0.03,
    connNepC: 0.01,
    connDeThang: 0,
    seamDonKep: 0.038,
    seamNoiC: 0.02,
    seamHan15: 0.015,
    seamPittsburgh: 0.04,
    defaultDensity: 7850,
    defaultThickness: 0.75,
    aiEnabled: false,
    aiBaseUrl: 'http://localhost:11434/v1',
    aiApiKey: 'ollama',
    aiModel: 'sailor2:8b',
}

export class IDBStorageAdapter implements StoragePort {
    // ─── Projects ───────────────────────────────────────────────────────────────

    async getProjects(): Promise<StoredProject[]> {
        if (typeof window === 'undefined') return []
        try {
            let projects = await get<StoredProject[]>(PROJECT_KEY)
            // Migration from legacy localStorage
            if (!projects) {
                const raw = localStorage.getItem(PROJECT_KEY)
                if (raw) {
                    const parsed = JSON.parse(raw) as StoredProject[] | null
                    projects = parsed ?? []
                    await set(PROJECT_KEY, projects)
                } else {
                    projects = []
                }
            }
            return projects
        } catch (err) {
            console.error('[IDBStorageAdapter] Error reading projects:', err)
            return []
        }
    }

    async getProject(id: string): Promise<StoredProject | undefined> {
        const all = await this.getProjects()
        return all.find(p => p.id === id)
    }

    async upsertProject(project: StoredProject): Promise<void> {
        const all = await this.getProjects()
        const idx = all.findIndex(p => p.id === project.id)
        const now = new Date().toISOString()

        if (idx >= 0) {
            all[idx] = { ...project, updatedAt: now }
        } else {
            all.unshift({ ...project, createdAt: project.createdAt ?? now })
        }
        await this.persistProjects(all)
    }

    async deleteProject(id: string): Promise<void> {
        const all = await this.getProjects()
        await this.persistProjects(all.filter(p => p.id !== id))
    }

    private async persistProjects(projects: StoredProject[]): Promise<void> {
        if (typeof window === 'undefined') return
        try {
            await set(PROJECT_KEY, projects)
            localStorage.setItem(PROJECT_KEY, JSON.stringify(projects)) // Backup
        } catch (err) {
            console.error('[IDBStorageAdapter] Error writing projects:', err)
        }
    }

    // ─── Settings ───────────────────────────────────────────────────────────────

    getSettings(): AppSettings {
        if (typeof window === 'undefined') return { ...DEFAULT_SETTINGS }
        try {
            const raw = localStorage.getItem(SETTINGS_KEY)
            if (!raw) return { ...DEFAULT_SETTINGS }
            return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) }
        } catch {
            return { ...DEFAULT_SETTINGS }
        }
    }

    saveSettings(settings: AppSettings): void {
        if (typeof window === 'undefined') return
        try {
            localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
        } catch (err) {
            console.error('[IDBStorageAdapter] Error writing settings:', err)
        }
    }

    // ─── Feedback ─────────────────────────────────────────────────────────────

    async addFeedback(feedback: ProductionFeedback): Promise<void> {
        const all = await this.getFeedback()
        all.push(feedback)
        if (typeof window !== 'undefined') {
            await set(FEEDBACK_KEY, all)
        }
    }

    async getFeedback(materialType?: string): Promise<ProductionFeedback[]> {
        if (typeof window === 'undefined') return []
        try {
            const all = await get<ProductionFeedback[]>(FEEDBACK_KEY) || []
            if (materialType) {
                return all.filter(f => f.materialType === materialType)
            }
            return all
        } catch {
            return []
        }
    }

    // ─── Lifecycle ──────────────────────────────────────────────────────────────

    async clearAll(): Promise<void> {
        if (typeof window === 'undefined') return
        await del(PROJECT_KEY)
        await del(FEEDBACK_KEY)
        localStorage.removeItem(PROJECT_KEY)
        localStorage.removeItem(SETTINGS_KEY)
    }
}

/** Singleton instance for app-wide use */
export const storage = new IDBStorageAdapter()
