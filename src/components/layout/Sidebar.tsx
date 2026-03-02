// src/components/layout/Sidebar.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, FolderOpen, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV = [
  { label: 'TỔNG QUAN', href: '/', icon: LayoutDashboard },
  { label: 'DỰ ÁN', href: '/projects', icon: FolderOpen },
]
const NAV_SYSTEM = [
  { label: 'CÀI ĐẶT', href: '/settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const active = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  return (
    <aside
      className="fixed inset-y-0 left-0 w-56 flex flex-col z-50"
      style={{ background: 'var(--bg-void)', borderRight: '1px solid var(--border)' }}
    >
      {/* Logo */}
      <div
        className="px-5 py-5 flex items-center gap-3"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        {/* Amber icon box */}
        <div
          className="w-8 h-8 flex items-center justify-center shrink-0"
          style={{
            background: 'var(--primary-main)',
            borderRadius: 'var(--radius)',
            boxShadow: '0 2px 4px var(--primary-glow)'
          }}
        >
          {/* Duct cross-section icon */}
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="1" y="4" width="14" height="8" rx="1" stroke="#fff" strokeWidth="1.5" />
            <line x1="1" y1="8" x2="15" y2="8" stroke="#fff" strokeWidth="1" />
            <line x1="8" y1="4" x2="8" y2="12" stroke="#fff" strokeWidth="1" />
          </svg>
        </div>
        <div>
          <div
            className="font-display font-700 tracking-wider leading-none"
            style={{ fontSize: '18px', color: 'var(--primary-main)', letterSpacing: '0.04em' }}
          >
            DUCTPRO
          </div>
          <div className="label mt-0.5" style={{ color: 'var(--text-tertiary)', fontSize: '8px' }}>
            HVAC · TAKEOFF
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto space-y-1">
        <div className="px-5 pt-2 pb-2 label text-[10px]">ĐIỀU HƯỚNG</div>

        {NAV.map(({ label, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 px-5 py-3 transition-all duration-200 mx-2 rounded-md',
              active(href)
                ? 'bg-[var(--primary-ghost)] text-[var(--primary-main)] shadow-sm'
                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]',
            )}
            style={{
              fontSize: '13px',
              fontWeight: active(href) ? '600' : '500',
            }}
          >
            <Icon
              className="shrink-0"
              size={18}
              style={{ color: active(href) ? 'var(--primary-main)' : 'inherit' }}
            />
            {label}
          </Link>
        ))}

        <div className="px-5 pt-6 pb-2 label text-[10px]">HỆ THỐNG</div>

        {NAV_SYSTEM.map(({ label, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 px-5 py-3 transition-all duration-200 mx-2 rounded-md',
              active(href)
                ? 'bg-[var(--primary-ghost)] text-[var(--primary-main)] shadow-sm'
                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]',
            )}
            style={{
              fontSize: '13px',
              fontWeight: active(href) ? '600' : '500',
            }}
          >
            <Icon
              className="shrink-0"
              size={18}
              style={{ color: active(href) ? 'var(--primary-main)' : 'inherit' }}
            />
            {label}
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div
        className="px-5 py-4"
        style={{ borderTop: '1px solid var(--border)' }}
      >
        <div className="label">v1.0.0 · OFFLINE</div>
        <div
          className="mt-1 flex items-center gap-1.5"
        >
          <div
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: 'var(--green)', boxShadow: '0 0 4px var(--green)' }}
          />
          <span style={{ fontSize: '10px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-data)' }}>
            LOCAL STORAGE
          </span>
        </div>
      </div>
    </aside>
  )
}
