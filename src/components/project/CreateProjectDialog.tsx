// src/components/project/CreateProjectDialog.tsx
'use client'
import { useRef } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input  } from '@/components/ui/input'

interface Props {
  open: boolean
  onOpenChange: (v: boolean) => void
  onCreate: (name: string, description?: string) => void
}

export function CreateProjectDialog({ open, onOpenChange, onCreate }: Props) {
  const nameRef = useRef<HTMLInputElement>(null)
  const descRef = useRef<HTMLInputElement>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const name = nameRef.current?.value.trim() ?? ''
    if (!name) { nameRef.current?.focus(); return }
    onCreate(name, descRef.current?.value.trim())
    onOpenChange(false)
    if (nameRef.current) nameRef.current.value = ''
    if (descRef.current) descRef.current.value = ''
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle
            style={{ fontFamily: 'var(--font-display)', fontSize: '16px',
              letterSpacing: '0.06em', color: 'var(--text-primary)' }}
          >
            TẠO DỰ ÁN MỚI
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3 py-2">
          <div className="space-y-1.5">
            <div className="label">TÊN DỰ ÁN *</div>
            <Input ref={nameRef} placeholder="VD: Tòa nhà ABC – Tầng 3 HVAC" autoFocus required />
          </div>
          <div className="space-y-1.5">
            <div className="label">MÔ TẢ (TÙY CHỌN)</div>
            <Input ref={descRef} placeholder="Ghi chú phạm vi, tầng, khu vực..." />
          </div>
          <DialogFooter className="pt-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>HỦY</Button>
            <Button type="submit">TẠO DỰ ÁN</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
