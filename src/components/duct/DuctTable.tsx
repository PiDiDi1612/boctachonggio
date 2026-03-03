// src/components/duct/DuctTable.tsx
'use client'

import { useState, useMemo } from 'react'
import { Pencil, Trash2, Copy, Search } from 'lucide-react'
import type { DuctItem } from '@/lib/types'
import { fmtNumber } from '@/lib/utils'

interface Props {
  items: DuctItem[]
  onEdit: (item: DuctItem) => void
  onDelete: (id: string) => void
  onDuplicate?: (item: DuctItem) => void
}

const BADGE_CLASS: Record<string, string> = {
  straight_square: 'type-badge type-badge-square',
  straight_round: 'type-badge type-badge-round',
  elbow_90: 'type-badge type-badge-elbow',
  tee: 'type-badge type-badge-tee',
  reducer: 'type-badge type-badge-reducer',
  mouth: 'type-badge type-badge-mouth',
  other: 'type-badge type-badge-other',
}

const SHORT_LABEL: Record<string, string> = {
  straight_square: 'ỐNG VUÔNG',
  straight_1_end: 'ỐNG BỊT ĐẦU',
  elbow_90_radius: 'CO 90° (R)',
  elbow_90_square: 'CO 90° (V)',
  reducer_square: 'CÔN THU (V-V)',
  reducer_sq_rd: 'CÔN THU (V-T)',
  shoe_tap: 'GÓT GIÀY',
  z_offset_radius: 'Z LƯỢN',
  offset_round_deg: 'CHẾCH 45° (TR)',
  offset_square: 'CHẾCH 45° (V)',
  plenum_box: 'BOX KÍN',
  other: 'KHÁC',
}

export function DuctTable({ items, onEdit, onDelete, onDuplicate }: Props) {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredItems = useMemo(() => {
    if (!searchTerm) return items
    const lower = searchTerm.toLowerCase()
    return items.filter(item => {
      const typeLabel = SHORT_LABEL[item.type] || item.type
      const note = item.note || ''
      return typeLabel.toLowerCase().includes(lower) || note.toLowerCase().includes(lower)
    })
  }, [items, searchTerm])

  if (items.length === 0) {
    return (
      <div
        className="text-center py-16"
        style={{
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          background: 'var(--bg-raised)',
        }}
      >
        <div className="label mb-2">CHƯA CÓ HẠNG MỤC NÀO</div>
        <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-body)' }}>
          Nhấn &quot;THÊM HẠNG MỤC&quot; để bắt đầu
        </div>
      </div>
    )
  }

  let sumArea = 0
  const rows = filteredItems.map(item => {
    // Sử dụng trực tiếp area/weight từ item (đã được Orchestrator tính toán sẵn)
    const ra = item.area * item.quantity
    const rw = item.weight * item.quantity
    sumArea += ra
    return { item, area: item.area, weight: item.weight, ra, rw }
  })

  return (
    <div className="flex flex-col gap-0">
      {items.length > 0 && (
        <div className="flex justify-end p-2 bg-[var(--bg-raised)] rounded-t-lg border-b border-[var(--border)]">
          <div className="relative w-72">
            <Search size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground opacity-50" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên hoặc loại..."
              className="flex h-8 w-full rounded-md border border-[var(--border)] bg-[var(--bg-base)] px-3 py-1 text-[13px] shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--primary-main)] pl-8 placeholder:text-slate-400"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      )}
      <div style={{ overflowX: 'auto' }}>
        <table className="duct-table text-sm">
          <thead>
            <tr style={{ height: 44 }}>
              <th style={{ width: 32, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>STT</th>
              <th style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tên vật tư</th>
              <th style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Loại vật tư</th>
              <th className="right" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Số lượng</th>
              <th className="right" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Rộng (W1)</th>
              <th className="right" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Cao (H1)</th>
              <th className="right" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Rộng (W2)</th>
              <th className="right" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Cao (H2)</th>
              <th className="right" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Dài (L)</th>
              <th className="right" style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>R/D</th>
              <th className="right" style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Lệch (E)</th>
              <th className="right" style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#10b981', fontWeight: 600 }}>KL/cái (md)</th>
              <th className="right" style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>KL/cái (m2)</th>
              <th className="right" style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--amber)', fontWeight: 800 }}>Tổng DT (m2)</th>
              <th style={{ width: 64 }}></th>
            </tr>
          </thead>
          <tbody className="text-[13px]">
            {rows.map(({ item, area, weight, ra }, idx) => {
              // Phân tách kích thước để hiển thị riêng lẻ
              const parts = item.dimensions.split('x').map(Number)
              // Chuẩn Giai đoạn 12: W1 x H1 x L x D x E x W2 x H2
              const w1 = parts[0] || ''
              const h1 = parts[1] || ''
              const l = parts[2] || ''
              const dr = parts[3] || ''
              const eVal = parts[4] || ''
              const w2 = parts[5] || ''
              const h2 = parts[6] || ''

              // Lấy tên vật tư
              let tenVatTu = item.note || ''
              if (tenVatTu.startsWith('Nhập từ Excel:')) {
                tenVatTu = tenVatTu.replace('Nhập từ Excel:', '').trim()
              } else if (!tenVatTu) {
                tenVatTu = SHORT_LABEL[item.type] ?? item.type
              }

              // Tính khối lượng trên mét dài (trọng lượng kg / chiều dài L (đổi ra m))
              // length trong DB thường lưu mm, ta chia 1000
              const lengthInMeter = parseFloat(String(l)) / 1000
              const klTrucTiep = lengthInMeter > 0 ? (weight / lengthInMeter) : 0

              return (
                <tr key={item.id} className="group" style={{ height: 52 }}>
                  <td className="muted center" style={{ fontSize: '13px' }}>{idx + 1}</td>
                  <td className="bright font-medium text-[14px]" style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={tenVatTu}>
                    {tenVatTu}
                  </td>
                  <td className="py-2">
                    <span className={BADGE_CLASS[item.type] ?? 'type-badge type-badge-other'} style={{ fontSize: '11px', padding: '4px 8px' }}>
                      {SHORT_LABEL[item.type] ?? item.type}
                    </span>
                  </td>
                  <td className="right font-bold text-slate-800 text-[14px]">{item.quantity}</td>
                  <td className="right">{w1}</td>
                  <td className="right">{h1}</td>
                  <td className="right">{w2}</td>
                  <td className="right">{h2}</td>
                  <td className="right font-semibold text-slate-700">{l}</td>
                  <td className="right">{dr}</td>
                  <td className="right font-bold text-amber-600">{eVal}</td>
                  <td className="right font-data" style={{ color: '#10b981', fontWeight: 600 }}>{klTrucTiep > 0 ? fmtNumber(klTrucTiep, 2) : '-'}</td>
                  <td className="right font-data" style={{ color: '#3b82f6' }}>{fmtNumber(area, 4)}</td>
                  <td className="right amber font-bold overflow-hidden" style={{ fontSize: '15px' }}>{fmtNumber(ra, 3)}</td>
                  <td>
                    <div
                      className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <button
                        onClick={() => onEdit(item)}
                        className="w-6 h-6 flex items-center justify-center rounded transition-colors"
                        style={{ color: 'var(--text-tertiary)' }}
                        onMouseEnter={e => (e.currentTarget.style.color = 'var(--amber)')}
                        onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-tertiary)')}
                      >
                        <Pencil size={11} />
                      </button>
                      <button
                        onClick={() => onDuplicate && onDuplicate(item)}
                        className="w-6 h-6 flex items-center justify-center rounded transition-colors"
                        title="Nhân bản"
                        style={{ color: 'var(--text-tertiary)' }}
                        onMouseEnter={e => (e.currentTarget.style.color = 'var(--green)')}
                        onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-tertiary)')}
                      >
                        <Copy size={11} />
                      </button>
                      <button
                        onClick={() => onDelete(item.id)}
                        className="w-6 h-6 flex items-center justify-center rounded transition-colors"
                        title="Xóa"
                        style={{ color: 'var(--text-tertiary)' }}
                        onMouseEnter={e => (e.currentTarget.style.color = 'var(--red)')}
                        onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-tertiary)')}
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
          <tfoot className="border-t-2 border-[var(--border)]">
            <tr style={{ height: 52 }}>
              <td colSpan={13} style={{ color: 'var(--text-tertiary)', fontSize: '13px', fontWeight: 700, letterSpacing: '0.05em', textAlign: 'right', paddingRight: '1.5rem' }}>
                TỔNG DIỆN TÍCH BÓC TÁCH KHU VỰC NÀY
              </td>
              <td className="right amber font-bold text-[16px]">{fmtNumber(sumArea, 3)} m²</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
