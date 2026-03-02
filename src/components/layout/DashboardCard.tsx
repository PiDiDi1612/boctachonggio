// src/components/layout/DashboardCard.tsx
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DashboardCardProps {
  label: string
  value: string
  unit?: string
  icon: LucideIcon
  variant?: 'amber' | 'green' | 'blue' | 'red'
}

const variants = {
  amber: { line: 'card-amber', iconBg: 'rgba(245,158,11,0.1)', iconColor: 'var(--amber)', valColor: 'var(--amber)' },
  green: { line: 'card-green', iconBg: 'rgba(34,197,94,0.1)', iconColor: 'var(--green)', valColor: 'var(--text-primary)' },
  blue: { line: 'card-blue', iconBg: 'rgba(96,165,250,0.1)', iconColor: '#60a5fa', valColor: 'var(--text-primary)' },
  red: { line: 'card-red', iconBg: 'rgba(239,68,68,0.1)', iconColor: 'var(--red)', valColor: 'var(--text-primary)' },
}

export function DashboardCard({ label, value, unit, icon: Icon, variant = 'amber' }: DashboardCardProps) {
  const v = variants[variant]
  return (
    <div
      className={cn('relative overflow-hidden transition-colors duration-150', v.line)}
      style={{
        background: 'var(--bg-raised)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: '16px',
      }}
    >
      {/* Icon */}
      <div
        className="w-10 h-10 flex items-center justify-center mb-4"
        style={{ background: v.iconBg, borderRadius: 'var(--radius)' }}
      >
        <Icon size={20} style={{ color: v.iconColor }} />
      </div>

      {/* Label */}
      <div className="label mb-2 text-xs">{label}</div>

      {/* Value */}
      <div className="flex items-baseline gap-2">
        <span className="stat-num" style={{ color: v.valColor }}>{value}</span>
        {unit && (
          <span
            className="font-data"
            style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}
          >
            {unit}
          </span>
        )}
      </div>
    </div>
  )
}
