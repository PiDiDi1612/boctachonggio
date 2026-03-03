// src/app/project/[id]/page.tsx
'use client'

import React, { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Download, Plus, FileDown, FileUp } from 'lucide-react'
import { DuctForm } from '@/components/duct/DuctForm'
import { DuctTable } from '@/components/duct/DuctTable'
import { ExcelImportModal } from '@/components/project/ExcelImportModal'
import { useProject } from '@/hooks/useProject'
import { exportProjectToExcel } from '@/modules/export/excel'
import { exportProjectToPDF } from '@/modules/export/pdf'
import { fmtDateTime, fmtNumber } from '@/lib/utils'
import { DuctItem, DuctItemFormValues } from '@/lib/types'
import { cn } from '@/lib/utils'

interface BtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost'
}

const Btn = ({ children, onClick, variant = 'ghost', className, ...props }: BtnProps) => {
  const styles: Record<string, React.CSSProperties> = {
    primary: { background: 'var(--primary-main)', color: '#fff', border: 'none' },
    outline: { background: 'transparent', color: 'var(--text-primary)', border: '1px solid var(--border)' },
    ghost: { background: 'transparent', color: 'var(--text-secondary)', border: 'none' },
  }
  return (
    <button
      onClick={onClick}
      className={cn("inline-flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-all active:scale-95 shadow-sm hover:shadow-md cursor-pointer", className)}
      style={{
        ...styles[variant],
        fontSize: '14px',
      }}
      {...props}
    >
      {children}
    </button>
  )
}


export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { project, loading, stats, updateName, addItem, addItems, updateItem, deleteItem } = useProject(id)
  const [formOpen, setFormOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<DuctItem | null>(null)

  // File upload for existing import
  const [importOpen, setImportOpen] = useState(false)
  // Tabs for main tracking & accessories
  const [activeTab, setActiveTab] = useState<'main' | 'accessories'>('main')

  // Accessory config states (Custom loss/ratio parameters)
  const [wastageRatio, setWastageRatio] = useState(10) // Hao hụt tôn (%)
  const keGocRatio = 4 // 4 cái / m2
  const [ecuRatio, setEcuRatio] = useState(4) // 4 cái / m2
  const [tyRenRatio, setTyRenRatio] = useState(1) // 1 m / m2
  const [longDenRatio, setLongDenRatio] = useState(4) // 4 cái / m2
  const [siliconRatio, setSiliconRatio] = useState(0.2) // 0.2 tuýp / m2


  if (loading) return (
    <div className="flex-1 flex items-center justify-center bg-[var(--bg-void)]">
      <div className="animate-pulse text-sm text-slate-400 font-medium tracking-wide">ĐANG TẢI DỮ LIỆU DỰ ÁN...</div>
    </div>
  )

  if (!project) return (
    <div className="flex-1 flex items-center justify-center flex-col gap-6 bg-[var(--bg-void)]">
      <div className="label text-lg">KHÔNG TÌM THẤY DỰ ÁN</div>
      <Btn variant="outline" onClick={() => router.push('/projects')}>
        <ArrowLeft size={18} /> QUAY LẠI DANH SÁCH
      </Btn>
    </div>
  )

  function handleEdit(item: DuctItem) { setEditingItem(item); setFormOpen(true) }
  function handleFormClose(v: boolean) { setFormOpen(v); if (!v) setEditingItem(null) }
  function handleDuplicate(item: DuctItem) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, area, weight, ...rest } = item
    addItem(rest as DuctItemFormValues)
  }

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-[var(--bg-void)]">

      {/* Unified Header */}
      <div className="flex items-center justify-between gap-6 mb-8">
        <div className="flex items-center gap-4 min-w-0">
          <button
            onClick={() => router.push('/projects')}
            className="group flex items-center justify-center w-10 h-10 rounded-full bg-white border border-[var(--border)] hover:border-[var(--primary-main)] hover:text-[var(--primary-main)] transition-all shadow-sm"
            title="Quay lại danh sách dự án"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="min-w-0">
            <input
              className="input-ghost text-3xl font-bold p-0 border-none hover:bg-transparent w-full mb-1"
              defaultValue={project.name}
              onBlur={e => updateName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.target as HTMLElement).blur()}
              title="Nhấn để sửa tên"
            />
            <div className="flex items-center gap-2 mt-1 text-[13px] font-bold text-slate-500 uppercase tracking-wider">
              <span>{fmtDateTime(project.createdAt)}</span>
              <span className="opacity-30">|</span>
              <span className="text-[var(--primary-main)] text-[14px]">{stats.totalItems} HẠNG MỤC</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2.5 shrink-0 items-center">
          <Btn variant="outline" onClick={() => setImportOpen(true)} className="bg-white py-2.5 px-4 h-11 border-dashed border-blue-200 text-blue-600 hover:bg-blue-50">
            <FileUp size={18} /> NHẬP EXCEL
          </Btn>
          <Btn variant="outline" onClick={() => exportProjectToExcel(project, { wastageRatio, keGocRatio, ecuRatio, tyRenRatio, longDenRatio, siliconRatio })} className="bg-white py-2.5 px-4 h-11">
            <Download size={18} /> XUẤT EXCEL
          </Btn>
          <Btn variant="outline" onClick={() => exportProjectToPDF(project, { wastageRatio, keGocRatio, ecuRatio, tyRenRatio, longDenRatio, siliconRatio })} className="bg-white py-2.5 px-4 h-11">
            <FileDown size={18} /> XUẤT PDF
          </Btn>
          <Btn variant="primary" onClick={() => { setEditingItem(null); setFormOpen(true) }} className="py-2.5 px-5 h-11 font-bold shadow-md hover:shadow-lg">
            <Plus size={20} /> THÊM MỚI
          </Btn>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-[var(--border)] mb-6">
        <button
          className={cn(
            "px-6 py-3 text-[14px] font-bold tracking-wide transition-colors border-b-2",
            activeTab === 'main'
              ? "border-[var(--primary-main)] text-[var(--primary-main)]"
              : "border-transparent text-slate-500 hover:text-slate-800"
          )}
          onClick={() => setActiveTab('main')}
        >
          DANH SÁCH ỐNG GIÓ
        </button>
        <button
          className={cn(
            "px-6 py-3 text-[14px] font-bold tracking-wide transition-colors border-b-2",
            activeTab === 'accessories'
              ? "border-[var(--amber)] text-[var(--amber)]"
              : "border-transparent text-slate-500 hover:text-slate-800"
          )}
          onClick={() => setActiveTab('accessories')}
        >
          BÓC TÁCH VẬT TƯ
        </button>
      </div>

      {activeTab === 'main' && (
        <div className="mb-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="label flex items-center gap-3 text-sm font-bold text-slate-700">
              CHI TIẾT ỐNG GIÓ BÓC TÁCH
              <span
                className="font-data px-2 py-0.5 rounded-full text-xs"
                style={{ color: 'var(--primary-main)', background: 'var(--primary-ghost)', border: '1px solid var(--primary-glow)' }}
              >
                {project.items.length} HẠNG MỤC
              </span>
            </div>
          </div>
          <div className="bg-[var(--bg-raised)] rounded-xl border border-[var(--border)] overflow-hidden shadow-sm">
            <DuctTable items={project.items} onEdit={handleEdit} onDelete={deleteItem} onDuplicate={handleDuplicate} />
          </div>
        </div>
      )}

      {activeTab === 'accessories' && (() => {
        // Tính toán danh sách "Tôn mạ kẽm" gom nhóm theo độ dày
        // Mỗi loại độ dày tính bằng tổng khối lượng / (tỷ trọng * độ dày) --> ra diện tích bề mặt tôn (m2),
        // tuy nhiên có yêu cầu "Đơn vị tính là md", nhưng do md chưa có công thức chuyển đổi chính xác từ m2
        // tạm thời ta vẫn dùng m2 hoặc md (ghi chú lại) cho tôn, hoặc tính md ống gió.
        // Tôn mạ kẽm sẽ tuỳ biến độ dày. 
        // 1 md tôn tiêu chuẩn = diện tích / khổ tôn (thường là 1.2m). Tạm lấy area chia 1.2, or để m2 do user kêu "công thức sẽ đưa ra sau"
        // Ở đây hiển thị m² và cho hệ số hao hụt.

        const steelSummary = project.items.reduce((acc, item) => {
          const thick = item.thickness || 0.75
          const m2 = item.area * item.quantity
          acc[thick] = (acc[thick] || 0) + m2
          return acc
        }, {} as Record<number, number>)

        // Logic tính toán số lượng Ke góc: 
        // Mỗi đầu kết nối là TDC sẽ tốn 4 cái ke góc (hoặc theo công thức 4 / m2 nếu người dùng tuỳ chỉnh)
        // User update: "đầu kết nối TDC sẽ dùng ke góc (mỗi 1 đầu kết nối ... dùng 4 cái)"
        const totalTdcConnectorEnds = project.items.reduce((acc, item) => {
          let tdcEnds = 0
          if (item.conn1 === 'tdc') tdcEnds += 1
          if (item.conn2 === 'tdc') tdcEnds += 1
          return acc + (tdcEnds * item.quantity) // Nhân số lượng hạng mục
        }, 0)

        const calcKeGoc = totalTdcConnectorEnds * 4

        return (
          <div className="mb-8 animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-6">
            <div className="bg-white p-6 rounded-xl border border-[var(--border)] shadow-sm">
              <h3 className="text-sm font-bold text-slate-800 mb-6 uppercase tracking-wider flex items-center gap-2">
                <span className="w-1 h-4 bg-[var(--amber)] rounded-full inline-block"></span>
                Cấu hình định mức vật tư
              </h3>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500">Hao hụt tôn mạ kẽm (%)</label>
                  <div className="relative">
                    <input type="number" value={wastageRatio} onChange={e => setWastageRatio(Number(e.target.value) || 0)} className="w-full h-10 px-3 border border-slate-200 rounded-md bg-slate-50 font-data focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 pr-8" />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">%</span>
                  </div>
                </div>
                <div className="space-y-1.5 opacity-50 pointer-events-none" title="Ke góc được tính tự động từ số đầu TDC (4 cái/đầu)">
                  <label className="text-xs font-semibold text-slate-500">Ke góc (cái/đầu TDC)</label>
                  <input type="number" value={4} readOnly className="w-full h-10 px-3 border border-slate-200 rounded-md bg-slate-100 font-data" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500">Ecu (cái / m²)</label>
                  <input type="number" value={ecuRatio} onChange={e => setEcuRatio(Number(e.target.value) || 0)} className="w-full h-10 px-3 border border-slate-200 rounded-md bg-slate-50 font-data focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500">Ty ren (mét / m²)</label>
                  <input type="number" value={tyRenRatio} step="0.1" onChange={e => setTyRenRatio(Number(e.target.value) || 0)} className="w-full h-10 px-3 border border-slate-200 rounded-md bg-slate-50 font-data focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500">Long đen (cái / m²)</label>
                  <input type="number" value={longDenRatio} onChange={e => setLongDenRatio(Number(e.target.value) || 0)} className="w-full h-10 px-3 border border-slate-200 rounded-md bg-slate-50 font-data focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500">Silicon (lọ / m²)</label>
                  <input type="number" value={siliconRatio} step="0.1" onChange={e => setSiliconRatio(Number(e.target.value) || 0)} className="w-full h-10 px-3 border border-slate-200 rounded-md bg-slate-50 font-data focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-[var(--border)] overflow-hidden shadow-sm">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 border-b border-[var(--border)]">
                  <tr>
                    <th className="py-3 px-4 font-semibold text-slate-600">Loại vật tư</th>
                    <th className="py-3 px-4 font-semibold text-slate-600">Tên vật tư</th>
                    <th className="py-3 px-4 font-semibold text-slate-600 w-24">Đơn vị</th>
                    <th className="py-3 px-4 font-semibold text-slate-600 text-right w-32">Định mức</th>
                    <th className="py-3 px-6 font-bold text-amber-700 text-right w-36 bg-amber-50/50">Khối lượng</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {/* Row Vật tư chính */}
                  {Object.entries(steelSummary).map(([thick, area], idx) => {
                    // "Đơn vị là md (công thức tính xác sau)" -> tạm tính theo md = area / 1.18 (khổ tôn chuẩn)
                    // Ở đây để hiển thị md theo tỉ lệ 1:1, khi nào có công thức user sẽ yêu cầu sửa.
                    const valWithWastage = area * (1 + wastageRatio / 100)
                    return (
                      <tr key={`steel-${thick}`} className="hover:bg-slate-50/50 transition-colors">
                        {idx === 0 && (
                          <td rowSpan={Object.keys(steelSummary).length} className="py-3 px-4 text-center font-bold text-[var(--primary-main)] bg-[var(--primary-ghost)] border-r border-[var(--border)] align-top pt-4">
                            VẬT TƯ CHÍNH
                          </td>
                        )}
                        <td className="py-3 px-4 font-medium text-slate-800">
                          Tôn mạ kẽm {thick}mm <span className="text-xs text-slate-400 font-normal">({wastageRatio}% hao hụt)</span>
                        </td>
                        <td className="py-3 px-4 text-slate-600">md</td>
                        <td className="py-3 px-4 text-right text-slate-500">—</td>
                        <td className="py-3 px-6 text-right font-data font-bold text-amber-700 text-[15px] bg-amber-50/20">
                          {fmtNumber(valWithWastage, 2)}
                        </td>
                      </tr>
                    )
                  })}

                  {Object.keys(steelSummary).length === 0 && (
                    <tr className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-4 text-center font-bold text-[var(--primary-main)] bg-[var(--primary-ghost)] border-r border-[var(--border)]">
                        VẬT TƯ CHÍNH
                      </td>
                      <td colSpan={4} className="py-3 px-4 text-slate-400 italic">Chưa có dữ liệu bóc tách</td>
                    </tr>
                  )}

                  {/* Row Vật tư phụ */}
                  <tr className="hover:bg-slate-50/50 transition-colors">
                    <td rowSpan={5} className="py-3 px-4 text-center font-bold text-slate-600 bg-slate-50 border-r border-[var(--border)] align-top pt-4">
                      VẬT TƯ PHỤ
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800">Ke góc</td>
                    <td className="py-3 px-4 text-slate-600">Cái</td>
                    <td className="py-3 px-4 text-right text-slate-500 font-data">4 / đầu TDC</td>
                    <td className="py-3 px-6 text-right font-data font-bold text-amber-700 text-[15px] bg-amber-50/20">{fmtNumber(calcKeGoc, 0)}</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4 font-medium text-slate-800">Ty ren</td>
                    <td className="py-3 px-4 text-slate-600">Mét</td>
                    <td className="py-3 px-4 text-right text-slate-500 font-data">{tyRenRatio} /m²</td>
                    <td className="py-3 px-6 text-right font-data font-bold text-amber-700 text-[15px] bg-amber-50/20">{fmtNumber(stats.totalArea * tyRenRatio, 1)}</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4 font-medium text-slate-800">Ecu</td>
                    <td className="py-3 px-4 text-slate-600">Cái</td>
                    <td className="py-3 px-4 text-right text-slate-500 font-data">{ecuRatio} /m²</td>
                    <td className="py-3 px-6 text-right font-data font-bold text-amber-700 text-[15px] bg-amber-50/20">{fmtNumber(Math.ceil(stats.totalArea * ecuRatio), 0)}</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4 font-medium text-slate-800">Long đen</td>
                    <td className="py-3 px-4 text-slate-600">Cái</td>
                    <td className="py-3 px-4 text-right text-slate-500 font-data">{longDenRatio} /m²</td>
                    <td className="py-3 px-6 text-right font-data font-bold text-amber-700 text-[15px] bg-amber-50/20">{fmtNumber(Math.ceil(stats.totalArea * longDenRatio), 0)}</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4 font-medium text-slate-800">Keo silicon</td>
                    <td className="py-3 px-4 text-slate-600">Lọ</td>
                    <td className="py-3 px-4 text-right text-slate-500 font-data">{siliconRatio} /m²</td>
                    <td className="py-3 px-6 text-right font-data font-bold text-amber-700 text-[15px] bg-amber-50/20">{fmtNumber(Math.ceil(stats.totalArea * siliconRatio), 0)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="flex justify-end pt-2">
              <span className="text-xs text-slate-400 italic">* Lưu ý: Đơn vị m² để tính định mức được dựa trên tổng diện tích bóc tách phần ống gió (<strong>{fmtNumber(stats.totalArea, 2)} m²</strong>). Đơn vị `md` của tôn tạm thời lấy tỷ lệ 1:1 theo m².</span>
            </div>
          </div>
        )
      })()}


      <DuctForm
        open={formOpen}
        onOpenChange={handleFormClose}
        initialItem={editingItem}
        onSave={values => {
          if (editingItem) updateItem(editingItem.id, values)
          else addItem(values)
        }}
      />

      <ExcelImportModal
        open={importOpen}
        onOpenChange={setImportOpen}
        onImport={(items) => {
          addItems(items)
        }}
      />
    </div>
  )
}

