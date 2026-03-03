// src/hooks/useProjects.ts
'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import type { Project, GlobalStats } from '@/lib/types'
import {
  getProjects, upsertProject, deleteProjectById, clearAllData,
} from '@/lib/storage'
import { genId } from '@/lib/utils'

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getProjects()
      setProjects(data)
    } finally {
      setLoading(false)
    }
  }, [])

  // Mount: load từ storage
  useEffect(() => {
    refresh()
  }, [refresh])

  /** Tạo dự án mới */
  const createProject = useCallback(
    async (name: string, description?: string): Promise<Project> => {
      const project: Project = {
        id: genId(),
        name: name.trim(),
        description: description?.trim(),
        createdAt: new Date().toISOString(),
        items: [],
      }
      await upsertProject(project)
      await refresh()
      return project
    },
    [refresh],
  )

  /** Xóa dự án */
  const deleteProject = useCallback(async (id: string) => {
    await deleteProjectById(id)
    await refresh()
  }, [refresh])

  /** Xóa toàn bộ */
  const clearAll = useCallback(async () => {
    await clearAllData()
    setProjects([])
  }, [])

  // ─── Tính thống kê tổng hợp ─────────────────────────────────────────────
  const globalStats: GlobalStats = useMemo(() => {
    const stats: GlobalStats = {
      totalProjects: projects.length,
      totalItems: 0,
      totalArea: 0,
      totalWeight: 0,
    }

    for (const p of projects) {
      stats.totalItems += p.items.length
      for (const item of p.items) {
        stats.totalArea += item.area * item.quantity
        stats.totalWeight += item.weight * item.quantity
      }
    }
    return stats
  }, [projects])

  return {
    projects,
    loading,
    globalStats,
    refresh,
    createProject,
    deleteProject,
    clearAll,
  }
}
