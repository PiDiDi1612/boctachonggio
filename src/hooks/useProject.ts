// src/hooks/useProject.ts
'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Project, DuctItem, DuctItemFormValues, ProjectStats } from '@/lib/types'
import { getProjectById, upsertProject } from '@/lib/storage'
import { getSettings } from '@/lib/storage'
import * as projectService from '@/modules/project-engine/project-service'

export function useProject(id: string) {
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    let mounted = true
    async function load() {
      setLoading(true)
      try {
        const p = await getProjectById(id)
        if (mounted) setProject(p ?? null)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [id])

  /** Lưu project xuống storage và cập nhật state */
  const persist = useCallback(async (updated: Project) => {
    const finalP = { ...updated, updatedAt: new Date().toISOString() }
    setProject(finalP)
    await upsertProject(finalP)
  }, [])

  /** Đổi tên dự án */
  const updateName = useCallback(
    async (name: string) => {
      if (!project || !name.trim()) return
      await persist({ ...project, name: name.trim() })
    },
    [project, persist],
  )

  /** Thêm hạng mục mới */
  const addItem = useCallback(
    async (values: DuctItemFormValues) => {
      if (!project) return
      const settings = getSettings()
      // Use Orchestrator via Service for calculation and parsing consistency
      const item = await projectService.processManualItem(
        (values as any).note || '', // rawText
        values.quantity,
        values.thickness,
        settings
      )
      await persist({ ...project, items: [...project.items, item] })
    },
    [project, persist],
  )

  /** Bulk Import nhiều hạng mục (Excel) */
  const addItems = useCallback(
    async (items: DuctItem[]) => {
      if (!project) return
      await persist({ ...project, items: [...project.items, ...items] })
    },
    [project, persist],
  )

  /** Cập nhật hạng mục */
  const updateItem = useCallback(
    async (itemId: string, values: DuctItemFormValues) => {
      if (!project) return
      const settings = getSettings()
      const newItem = await projectService.processManualItem(
        (values as any).note || '',
        values.quantity,
        values.thickness,
        settings
      )
      const items = project.items.map((i) =>
        i.id === itemId ? { ...newItem, id: i.id } : i
      )
      await persist({ ...project, items })
    },
    [project, persist],
  )

  /** Xóa hạng mục */
  const deleteItem = useCallback(
    async (itemId: string) => {
      if (!project) return
      await persist({ ...project, items: project.items.filter((i) => i.id !== itemId) })
    },
    [project, persist],
  )

  // ─── Tính stats ───────────────────────────────────────────────────────────
  // Note: Values in items are now pre-calculated by Orchestrator
  const stats: ProjectStats = { totalItems: 0, totalArea: 0, totalWeight: 0 }
  if (project) {
    stats.totalItems = project.items.length
    for (const item of project.items) {
      stats.totalArea += item.area * item.quantity
      stats.totalWeight += item.weight * item.quantity
    }
  }

  return { project, loading, stats, updateName, addItem, addItems, updateItem, deleteItem }
}
