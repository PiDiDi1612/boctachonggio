// src/components/layout/Header.tsx
'use client'

import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface HeaderProps {
  breadcrumb?: { label: string; href?: string }[]
  actions?: React.ReactNode
}

/**
 * Header thanh ngang – hiển thị breadcrumb và actions
 * Mobile: nút hamburger (sidebar responsive TODO)
 */
export function Header({ breadcrumb = [], actions }: HeaderProps) {
  return (
    <header className="h-14 shrink-0 bg-card border-b border-border flex items-center justify-between px-6 gap-4">
      {/* Left: hamburger (mobile) + breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        {/* TODO: wire up mobile sidebar toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden shrink-0 -ml-1"
          aria-label="Mở menu"
        >
          <Menu className="w-5 h-5" />
        </Button>

        {/* Breadcrumb */}
        {breadcrumb.length > 0 && (
          <nav className="flex items-center gap-1.5 text-sm min-w-0">
            {breadcrumb.map((crumb, i) => (
              <span key={i} className="flex items-center gap-1.5 min-w-0">
                {i > 0 && <span className="text-muted-foreground/50">/</span>}
                <span
                  className={
                    i === breadcrumb.length - 1
                      ? 'text-foreground font-medium truncate'
                      : 'text-muted-foreground'
                  }
                >
                  {crumb.label}
                </span>
              </span>
            ))}
          </nav>
        )}
      </div>

      {/* Right: actions */}
      {actions && (
        <div className="flex items-center gap-2 shrink-0">
          {actions}
        </div>
      )}
    </header>
  )
}
