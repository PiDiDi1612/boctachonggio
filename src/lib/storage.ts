// src/lib/storage.ts
// Offline-first localStorage helpers
// Toàn bộ CRUD đi qua đây – dễ swap sang IndexedDB hoặc SQLite (Electron) sau

import { get, set, del } from 'idb-keyval'
import type { Project } from './types'

const STORAGE_KEY = 'ductpro_v1_projects'

// ─── Read ─────────────────────────────────────────────────────────────────────

/** Lấy toàn bộ danh sách dự án */
export async function getProjects(): Promise<Project[]> {
  if (typeof window === 'undefined') return []
  try {
    let projects = await get<Project[]>(STORAGE_KEY)

    // Migration logic từ localStorage cũ
    if (!projects) {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        projects = JSON.parse(raw) as Project[]
        await set(STORAGE_KEY, projects)
      } else {
        projects = []
      }
    }
    return projects
  } catch (err) {
    console.error('[storage] Lỗi đọc dữ liệu:', err)
    return []
  }
}

/** Lấy một dự án theo ID */
export async function getProjectById(id: string): Promise<Project | undefined> {
  const all = await getProjects()
  return all.find((p) => p.id === id)
}

// ─── Write ────────────────────────────────────────────────────────────────────

/** Ghi toàn bộ danh sách (internal) */
async function persistProjects(projects: Project[]): Promise<void> {
  if (typeof window === 'undefined') return
  try {
    await set(STORAGE_KEY, projects)
    // Backup để an toàn trong lúc migration
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects))
  } catch (err) {
    console.error('[storage] Lỗi ghi dữ liệu:', err)
  }
}

/** Tạo mới hoặc cập nhật dự án */
export async function upsertProject(project: Project): Promise<void> {
  const all = await getProjects()
  const idx = all.findIndex((p) => p.id === project.id)
  const now = new Date().toISOString()

  if (idx >= 0) {
    all[idx] = { ...project, updatedAt: now }
  } else {
    all.unshift({ ...project, createdAt: project.createdAt ?? now })
  }
  await persistProjects(all)
}

/** Xóa một dự án */
export async function deleteProjectById(id: string): Promise<void> {
  const all = await getProjects()
  await persistProjects(all.filter((p) => p.id !== id))
}

/** Xóa toàn bộ dữ liệu */
export async function clearAllData(): Promise<void> {
  if (typeof window === 'undefined') return
  await del(STORAGE_KEY)
  localStorage.removeItem(STORAGE_KEY)
}

// ─── Settings ─────────────────────────────────────────────────────────────────

import type { AppSettings } from './types'

const SETTINGS_KEY = 'ductpro_v1_settings'

export const DEFAULT_SETTINGS: AppSettings = {
  connTDC: 0.05,         // 50mm
  connV30: 0.01,         // 10mm
  connV40: 0.01,         // 10mm
  connV50: 0.01,         // 10mm
  connBitDau: 0.03,      // 30mm
  connBeChan30: 0.03,    // 30mm
  connNepC: 0.01,        // 10mm
  connDeThang: 0,        // 0mm

  seamDonKep: 0.038,     // 8mm + 30mm
  seamNoiC: 0.02,        // 10mm + 10mm
  seamHan15: 0.015,      // 15mm
  seamPittsburgh: 0.04,  // 40mm

  defaultDensity: 7850,
  defaultThickness: 0.75,
}

/** Đọc cài đặt từ localStorage, merge với defaults */
export function getSettings(): AppSettings {
  if (typeof window === 'undefined') return { ...DEFAULT_SETTINGS }
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (!raw) return { ...DEFAULT_SETTINGS }
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) }
  } catch {
    return { ...DEFAULT_SETTINGS }
  }
}

/** Lưu cài đặt */
export function saveSettings(settings: AppSettings): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
  } catch (err) {
    console.error('[storage] Lỗi ghi settings:', err)
  }
}

// ─── TODO: Electron native storage ───────────────────────────────────────────
/**
 * Khi chuyển sang Electron production:
 * - Dùng electron-store hoặc better-sqlite3 thay localStorage
 * - Wrap interface này lại → không cần sửa business logic
 */
