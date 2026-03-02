// src/app/projects/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, FolderOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ProjectCard } from '@/components/project/ProjectCard'
import { CreateProjectDialog } from '@/components/project/CreateProjectDialog'
import { useProjects } from '@/hooks/useProjects'

export default function ProjectsPage() {
  const router = useRouter()
  const { projects, loading, createProject, deleteProject } = useProjects()
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  const filtered = [...projects]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .filter((p) =>
      !search || p.name.toLowerCase().includes(search.toLowerCase())
    )

  async function handleCreate(name: string, desc?: string) {
    const p = await createProject(name, desc)
    router.push(`/project/${p.id}`)
  }

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-[var(--bg-void)]">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Danh sách dự án</h1>
          <p className="text-base text-[var(--text-secondary)] mt-1.5 flex items-center gap-2">
            {loading ? <span className="animate-pulse">Đang tải...</span> : <span>{projects.length} dự án</span>}
            <span>· Lưu offline trên thiết bị này</span>
          </p>
        </div>
        <Button onClick={() => setOpen(true)} size="lg" className="shadow-md">
          <Plus size={18} className="mr-2" />
          Tạo dự án mới
        </Button>
      </div>

      {/* Search */}
      {projects.length > 0 && (
        <div className="mb-5 max-w-sm">
          <Input
            placeholder="Tìm kiếm dự án..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      )}

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="border border-dashed border-border rounded-lg py-16 text-center">
          <FolderOpen className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
          <p className="font-medium text-sm text-muted-foreground mb-1">
            {search ? 'Không tìm thấy dự án phù hợp' : 'Chưa có dự án nào'}
          </p>
          {!search && (
            <Button size="sm" className="mt-4" onClick={() => setOpen(true)}>
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Tạo dự án mới
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((p) => (
            <ProjectCard
              key={p.id}
              project={p}
              onClick={() => router.push(`/project/${p.id}`)}
              onDelete={deleteProject}
            />
          ))}
        </div>
      )}

      <CreateProjectDialog
        open={open}
        onOpenChange={setOpen}
        onCreate={handleCreate}
      />
    </div>
  )
}
