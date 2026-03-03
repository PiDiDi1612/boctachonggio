// src/components/project/ProjectCard.tsx
'use client'

import { Trash2, ChevronRight } from 'lucide-react'
import type { Project } from '@/lib/types'
import { fmtDate, fmtNumber } from '@/lib/utils'
interface Props {
  project: Project
  onClick: () => void
  onDelete?: (id: string) => void
}

function calcStats(project: Project) {
  let totalArea = 0, totalWeight = 0
  for (const item of project.items) {
    totalArea += item.area * item.quantity
    totalWeight += item.weight * item.quantity
  }
  return { totalItems: project.items.length, totalArea, totalWeight }
}

export function ProjectCard({ project, onClick, onDelete }: Props) {
  const stats = calcStats(project)

  return (
    <div
      onClick={onClick}
      className="relative group cursor-pointer transition-all duration-300 shadow-sm hover:shadow-md active:scale-[0.99]"
      style={{
        background: 'var(--bg-raised)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: '20px',
      }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--primary-main)')}
      onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
    >
      {/* Primary left border on hover */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1 transition-all duration-300 group-hover:opacity-100 opacity-0"
        style={{ background: 'var(--primary-main)', borderRadius: 'var(--radius) 0 0 var(--radius)' }}
      />

      {/* Header row */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="min-w-0">
          <div
            className="font-display font-bold truncate transition-colors"
            style={{
              fontSize: '18px',
              letterSpacing: '0.01em',
              color: 'var(--text-primary)',
            }}
          >
            {project.name}
          </div>
          <div className="label mt-1 text-[11px] font-medium">{fmtDate(project.createdAt)}</div>
        </div>

        <div className="flex items-center gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          {onDelete && (
            <button
              onClick={e => { e.stopPropagation(); onDelete(project.id) }}
              className="w-8 h-8 flex items-center justify-center transition-all rounded-md hover:bg-red-50"
              style={{ color: 'var(--text-tertiary)' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--red)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-tertiary)')}
              title="Xóa dự án"
            >
              <Trash2 size={16} />
            </button>
          )}
          <ChevronRight size={20} className="text-[var(--primary-main)]" />
        </div>
      </div>

      {project.description && (
        <p
          className="text-sm line-clamp-2 mb-4 leading-relaxed"
          style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}
        >
          {project.description}
        </p>
      )}

      {/* Stats row */}
      <div
        className="grid grid-cols-3 gap-4 pt-4"
        style={{ borderTop: '1px solid var(--bg-void)' }}
      >
        {[
          { label: 'HẠNG MỤC', value: String(stats.totalItems), unit: 'mục' },
          { label: 'DIỆN TÍCH', value: fmtNumber(stats.totalArea, 1), unit: 'm²' },
          { label: 'TRỌNG L.', value: fmtNumber(stats.totalWeight, 1), unit: 'kg' },
        ].map(s => (
          <div key={s.label}>
            <div className="label mb-1.5 text-[9px] font-semibold text-slate-400">{s.label}</div>
            <div
              className="font-data"
              style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}
            >
              {s.value}
              <span
                className="font-data ml-1"
                style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: 500 }}
              >
                {s.unit}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
