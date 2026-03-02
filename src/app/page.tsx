// src/app/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, FolderOpen, Layers, Weight, ListOrdered } from 'lucide-react'
import { DashboardCard } from '@/components/layout/DashboardCard'
import { ProjectCard } from '@/components/project/ProjectCard'
import { CreateProjectDialog } from '@/components/project/CreateProjectDialog'
import { useProjects } from '@/hooks/useProjects'
import { fmtNumber } from '@/lib/utils'

export default function DashboardPage() {
  const router = useRouter()
  const { projects, loading, globalStats, createProject, deleteProject } = useProjects()
  const [open, setOpen] = useState(false)

  const recent = [...projects]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6)

  async function handleCreate(name: string, desc?: string) {
    const p = await createProject(name, desc)
    router.push(`/project/${p.id}`)
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>

      {/* Page header */}
      {loading && (
        <div className="absolute top-4 right-8 text-xs text-muted-foreground animate-pulse">
          Đang tải dữ liệu...
        </div>
      )}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1
            className="font-display"
            style={{ fontSize: '24px', fontWeight: 700, letterSpacing: '0.02em', color: 'var(--text-primary)' }}
          >
            TỔNG QUAN
          </h1>
          <div className="label mt-1.5 text-sm">
            {projects.length} DỰ ÁN · {globalStats.totalItems} HẠNG MỤC
          </div>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2.5 transition-all active:scale-95 shadow-sm hover:shadow-md"
          style={{
            background: 'var(--primary-main)',
            color: '#fff',
            padding: '10px 20px',
            borderRadius: 'var(--radius)',
            fontFamily: 'var(--font-body)',
            fontSize: '14px',
            fontWeight: 600,
            border: 'none',
            cursor: 'pointer',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--primary-dark)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'var(--primary-main)')}
        >
          <Plus size={18} />
          DỰ ÁN MỚI
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-10">
        <DashboardCard label="DỰ ÁN" icon={FolderOpen} variant="amber"
          value={String(globalStats.totalProjects)} unit="prj" />
        <DashboardCard label="TỔNG HẠNG MỤC" icon={ListOrdered} variant="red"
          value={String(globalStats.totalItems)} unit="mục" />
        <DashboardCard label="TỔNG DIỆN TÍCH" icon={Layers} variant="green"
          value={fmtNumber(globalStats.totalArea, 1)} unit="m²" />
        <DashboardCard label="TỔNG TRỌNG LƯỢNG" icon={Weight} variant="blue"
          value={fmtNumber(globalStats.totalWeight, 1)} unit="kg" />
      </div>

      {/* Recent projects */}
      <div className="flex items-center justify-between mb-5 mt-4">
        <div className="label text-sm font-bold text-slate-700">DỰ ÁN GẦN ĐÂY</div>
        <button
          onClick={() => router.push('/projects')}
          className="text-xs font-semibold text-[var(--primary-main)] hover:text-[var(--primary-dark)] hover:underline flex items-center gap-1"
        >
          XEM TẤT CẢ <span className="text-lg leading-none">→</span>
        </button>
      </div>

      {recent.length === 0 ? (
        <div
          className="text-center py-20"
          style={{ border: '1px dashed var(--border-bright)', borderRadius: 'var(--radius)' }}
        >
          <FolderOpen size={32} style={{ margin: '0 auto 12px', color: 'var(--text-tertiary)', opacity: 0.4 }} />
          <div className="label mb-1">CHƯA CÓ DỰ ÁN NÀO</div>
          <div style={{ fontSize: '14px', color: 'var(--text-tertiary)', marginBottom: 24 }}>
            Tạo dự án đầu tiên để bắt đầu bóc tách ống gió
          </div>
          <button
            onClick={() => setOpen(true)}
            className="flex items-center gap-2.5 mx-auto transition-all active:scale-95 shadow-sm hover:shadow-md"
            style={{
              background: 'var(--primary-main)', color: '#fff', padding: '10px 24px',
              borderRadius: 'var(--radius)', fontFamily: 'var(--font-body)',
              fontSize: '14px', fontWeight: 600,
              border: 'none', cursor: 'pointer',
            }}
          >
            <Plus size={18} /> TẠO DỰ ÁN MỚI
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {recent.map(p => (
            <ProjectCard key={p.id} project={p}
              onClick={() => router.push(`/project/${p.id}`)}
              onDelete={deleteProject}
            />
          ))}
        </div>
      )}

      <CreateProjectDialog open={open} onOpenChange={setOpen} onCreate={handleCreate} />
    </div>
  )
}
