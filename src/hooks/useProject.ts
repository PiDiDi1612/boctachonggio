// src/hooks/useProject.ts
'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Project, DuctItem, DuctItemFormValues, ProjectStats } from '@/lib/types'
import { getProjectById, upsertProject } from '@/lib/storage'
import { calcItemMetrics } from '@/modules/duct-calc'
import { genId } from '@/lib/utils'

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
      const { area, weight } = calcItemMetrics(values as DuctItem)
      const item: DuctItem = { ...values, id: genId(), area, weight }
      await persist({ ...project, items: [...project.items, item] })
    },
    [project, persist],
  )

  /** Bulk Import nhiều hạng mục (Excel) */
  const addItems = useCallback(
    async (itemsData: DuctItemFormValues[]) => {
      if (!project) return
      const newItems = itemsData.map(values => {
        const { area, weight } = calcItemMetrics(values as DuctItem)
        return { ...values, id: genId(), area, weight }
      })
      await persist({ ...project, items: [...project.items, ...newItems] })
    },
    [project, persist],
  )

  /** Cập nhật hạng mục */
  const updateItem = useCallback(
    async (itemId: string, values: DuctItemFormValues) => {
      if (!project) return
      const { area, weight } = calcItemMetrics(values as DuctItem)
      const items = project.items.map((i) =>
        i.id === itemId ? { ...i, ...values, area, weight } : i,
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
  const stats: ProjectStats = { totalItems: 0, totalArea: 0, totalWeight: 0 }
  if (project) {
    stats.totalItems = project.items.length
    for (const item of project.items) {
      const { area, weight } = calcItemMetrics(item)
      stats.totalArea += area * item.quantity
      stats.totalWeight += weight * item.quantity
    }
  }

  return { project, loading, stats, updateName, addItem, addItems, updateItem, deleteItem }
}
