// src/modules/export/excel.ts
// Xuất dự án ra file Excel (.xlsx) dùng thư viện xlsx

import * as XLSX from 'xlsx'
import type { Project } from '@/lib/types'
import { calcItemMetrics } from '@/modules/duct-calc'
import { DUCT_TYPE_LABELS } from '@/modules/duct-calc/constants'

export interface AccessoryConfig {
  wastageRatio: number
  keGocRatio: number
  ecuRatio: number
  tyRenRatio: number
  longDenRatio: number
  siliconRatio: number
}

/**
 * Xuất toàn bộ dự án thành file .xlsx
 * Tạo 3 sheet: "Chi tiết", "Vật tư phụ", "Tổng hợp"
 */
export function exportProjectToExcel(project: Project, config?: AccessoryConfig): void {
  const wb = XLSX.utils.book_new()

  // ── Sheet 1: Chi tiết hạng mục ──────────────────────────────────────────
  const detailHeaders = [
    '#',
    'Loại ống / Phụ kiện',
    'Kích thước (mm)',
    'Độ dày (mm)',
    'Số lượng',
    'Đơn vị',
    'Diện tích / cái (m²)',
    'Tổng diện tích (m²)',
    'Ghi chú',
  ]

  let totalArea = 0

  const detailRows = project.items.map((item, idx) => {
    const { area } = calcItemMetrics(item)
    const rowArea = area * item.quantity
    totalArea += rowArea

    return [
      idx + 1,
      DUCT_TYPE_LABELS[item.type] ?? item.type,
      item.dimensions,
      item.thickness,
      item.quantity,
      item.unit ?? 'cái',
      +area.toFixed(4),
      +rowArea.toFixed(3),
      item.note ?? '',
    ]
  })

  const detailTotal = [
    '',
    'TỔNG CỘNG',
    '', '', '', '', '',
    +totalArea.toFixed(3),
    '',
  ]

  const detailData = [detailHeaders, ...detailRows, [], detailTotal]
  const wsDetail = XLSX.utils.aoa_to_sheet(detailData)

  // Độ rộng cột
  wsDetail['!cols'] = [
    { wch: 4 }, { wch: 22 }, { wch: 20 }, { wch: 12 }, { wch: 10 },
    { wch: 6 }, { wch: 18 }, { wch: 16 }, { wch: 28 },
  ]

  XLSX.utils.book_append_sheet(wb, wsDetail, 'Chi tiết hạng mục')

  // ── Sheet 2: Vật tư ──────────────────────────────────────────────────
  const ac = config || {
    wastageRatio: 10, keGocRatio: 4, ecuRatio: 4,
    tyRenRatio: 1, longDenRatio: 4, siliconRatio: 0.2
  }

  // Bóc tách Tôn mạ kẽm (Vật tư chính) theo độ dày
  const steelSummary = project.items.reduce((acc, item) => {
    const thick = item.thickness || 0.75
    const m2 = item.area * item.quantity
    acc[thick] = (acc[thick] || 0) + m2
    return acc
  }, {} as Record<number, number>)

  // Bóc tách Ke góc theo đầu TDC
  const totalTdcConnectorEnds = project.items.reduce((acc, item) => {
    let tdcEnds = 0
    if (item.conn1 === 'tdc') tdcEnds += 1
    if (item.conn2 === 'tdc') tdcEnds += 1
    return acc + (tdcEnds * item.quantity)
  }, 0)

  const calcKeGoc = totalTdcConnectorEnds * 4

  const accHeaders = ['Phân loại', 'Tên vật tư', 'Đơn vị', 'Định mức', 'Khối lượng / Số lượng']
  const accData: any[][] = [accHeaders]

  // Add Vật tư chính (Tôn mạ kẽm)
  Object.entries(steelSummary).forEach(([thick, area], idx) => {
    const valWithWastage = area * (1 + ac.wastageRatio / 100)
    accData.push([
      idx === 0 ? 'VẬT TƯ CHÍNH' : '',
      `Tôn mạ kẽm ${thick}mm (Bao gồm ${ac.wastageRatio}% hao hụt)`,
      'md',
      '-',
      +valWithWastage.toFixed(2)
    ])
  })

  // Add Vật tư phụ
  accData.push(
    ['VẬT TƯ PHỤ', 'Ke góc', 'Cái', `4 / đầu TDC`, calcKeGoc],
    ['', 'Ty ren', 'Mét', `${ac.tyRenRatio} /m²`, +(totalArea * ac.tyRenRatio).toFixed(1)],
    ['', 'Ecu', 'Cái', `${ac.ecuRatio} /m²`, Math.ceil(totalArea * ac.ecuRatio)],
    ['', 'Long đen', 'Cái', `${ac.longDenRatio} /m²`, Math.ceil(totalArea * ac.longDenRatio)],
    ['', 'Keo silicon', 'Lọ', `${ac.siliconRatio} /m²`, Math.ceil(totalArea * ac.siliconRatio)]
  )

  const wsAcc = XLSX.utils.aoa_to_sheet(accData)
  wsAcc['!cols'] = [{ wch: 18 }, { wch: 45 }, { wch: 10 }, { wch: 15 }, { wch: 25 }]
  XLSX.utils.book_append_sheet(wb, wsAcc, 'Bóc tách vật tư')

  // ── Sheet 3: Tổng hợp ────────────────────────────────────────────────────
  const summaryData = [
    ['TỔNG HỢP DỰ ÁN'],
    ['Dự án', project.name],
    ['Ngày xuất', new Date().toLocaleDateString('vi-VN')],
    [],
    ['Tổng số hạng mục', project.items.length, 'mục'],
    ['Tổng diện tích tôn', +totalArea.toFixed(3), 'm²'],
  ]

  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData)
  wsSummary['!cols'] = [{ wch: 26 }, { wch: 16 }, { wch: 8 }]
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Tổng hợp')

  // Tên file: "DuctPro_TenDuAn_YYYY-MM-DD.xlsx"
  const safeName = project.name.replace(/[^\w\u00C0-\u024F\s-]/g, '').replace(/\s+/g, '_')
  const dateStr = new Date().toISOString().slice(0, 10)
  const filename = `DuctPro_${safeName}_${dateStr}.xlsx`

  if (typeof window !== 'undefined' && (window as any).electronAPI) {
    const api = (window as any).electronAPI
    api.showSaveDialog({
      title: 'Lưu file Excel thông kê',
      defaultPath: filename,
      filters: [{ name: 'Excel Files', extensions: ['xlsx'] }]
    }).then(async (result: any) => {
      if (!result.canceled && result.filePath) {
        const buffer = XLSX.write(wb, { type: 'array', bookType: 'xlsx' })
        const saveRes = await api.saveFile(result.filePath, buffer)
        if (saveRes.success) {
          // Try to show notification if implemented
          if (api.showNotification) {
            api.showNotification('Thành công', `Đã lưu dự án ${project.name} ra Excel!`)
          } else {
            alert('Đã lưu file thành công!')
          }
        } else {
          alert('Lỗi lưu file: ' + saveRes.error)
        }
      }
    }).catch(console.error)
  } else {
    XLSX.writeFile(wb, filename)
  }
}
