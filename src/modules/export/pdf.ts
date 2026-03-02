// src/modules/export/pdf.ts
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { Project } from '@/lib/types'
import { calcItemMetrics } from '@/modules/duct-calc'
import { DUCT_TYPE_LABELS } from '@/modules/duct-calc/constants'

import { AccessoryConfig } from '@/modules/export/excel'

// Note: To support full Vietnamese in jsPDF, we'd need a VFS font file.
// For now, we strip typical accents when exporting to PDF to avoid broken characters.
function removeAccents(str: string) {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D');
}

export function exportProjectToPDF(project: Project, config?: AccessoryConfig): void {
  const doc = new jsPDF()

  // Tiêu đề
  doc.setFontSize(16)
  doc.text(removeAccents(`TONG HOP DU AN: ${project.name}`), 14, 20)

  doc.setFontSize(10)
  doc.text(removeAccents(`Ngay xuat: ${new Date().toLocaleDateString('vi-VN')}`), 14, 28)

  let totalArea = 0

  const rows = project.items.map((item, idx) => {
    const { area } = calcItemMetrics(item)
    const rowArea = area * item.quantity
    totalArea += rowArea

    return [
      idx + 1,
      removeAccents(DUCT_TYPE_LABELS[item.type] ?? item.type),
      item.dimensions,
      item.thickness,
      item.quantity,
      removeAccents(item.unit ?? 'cai'),
      area.toFixed(4),
      rowArea.toFixed(3),
      removeAccents(item.note ?? ''),
    ]
  })
  autoTable(doc, {
    startY: 35,
    head: [[
      '#',
      removeAccents('Loai'),
      removeAccents('Kich thuoc (mm)'),
      'Day(mm)',
      'SL',
      removeAccents('DVT'),
      removeAccents('DT/cai (m2)'),
      removeAccents('Tong DT (m2)'),
      removeAccents('Ghi chu')
    ]],
    body: rows,
    foot: [[
      '', removeAccents('TONG CONG'), '', '', '', '', '', totalArea.toFixed(3), ''
    ]],
    theme: 'grid',
    headStyles: { fillColor: [41, 128, 185] },
    footStyles: { fillColor: [241, 196, 15], textColor: 20 },
    styles: { fontSize: 8 },
  })

  // Bảng 2: Vật tư phụ
  const ac = config || {
    wastageRatio: 10, keGocRatio: 4, ecuRatio: 4,
    tyRenRatio: 1, longDenRatio: 4, siliconRatio: 0.2
  }

  const finalY = (doc as any).lastAutoTable.finalY || 40

  doc.setFontSize(14)
  doc.text(removeAccents('BOC TACH VAT TU PHU'), 14, finalY + 15)

  const accBody = [
    [1, removeAccents(`Ton ma kem (Bao gom ${ac.wastageRatio}% hao hut)`), 'm2', '-', (totalArea * (1 + ac.wastageRatio / 100)).toFixed(2)],
    [2, removeAccents('Ke goc'), 'Cai', `${ac.keGocRatio} /m2`, Math.ceil(totalArea * ac.keGocRatio)],
    [3, removeAccents('Ty ren'), 'Met', `${ac.tyRenRatio} /m2`, (totalArea * ac.tyRenRatio).toFixed(1)],
    [4, removeAccents('Ecu'), 'Cai', `${ac.ecuRatio} /m2`, Math.ceil(totalArea * ac.ecuRatio)],
    [5, removeAccents('Long den'), 'Cai', `${ac.longDenRatio} /m2`, Math.ceil(totalArea * ac.longDenRatio)],
    [6, removeAccents('Keo silicon'), 'Tuyp', `${ac.siliconRatio} /m2`, Math.ceil(totalArea * ac.siliconRatio)],
  ]

  autoTable(doc, {
    startY: finalY + 20,
    head: [[
      'STT',
      removeAccents('Ten vat tu phu'),
      removeAccents('Don vi'),
      removeAccents('Dinh muc'),
      removeAccents('Khoi luong / SL')
    ]],
    body: accBody,
    theme: 'grid',
    headStyles: { fillColor: [41, 128, 185] },
    styles: { fontSize: 9 },
  })

  // Save using native IPC
  const safeName = removeAccents(project.name).replace(/[^\w\s-]/g, '').replace(/\s+/g, '_')
  const dateStr = new Date().toISOString().slice(0, 10)
  const filename = `DuctPro_${safeName}_${dateStr}.pdf`

  const buffer = doc.output('arraybuffer')

  if (typeof window !== 'undefined' && (window as any).electronAPI) {
    const api = (window as any).electronAPI
    api.showSaveDialog({
      title: 'Luu file PDF',
      defaultPath: filename,
      filters: [{ name: 'PDF Files', extensions: ['pdf'] }]
    }).then(async (result: any) => {
      if (!result.canceled && result.filePath) {
        const saveRes = await api.saveFile(result.filePath, buffer)
        if (saveRes.success) {
          if (api.showNotification) api.showNotification('Thanh cong', `Da luu file ${filename}`)
          else alert('Luu file thanh cong!')
        } else {
          alert('Loi luu file: ' + saveRes.error)
        }
      }
    }).catch(console.error)
  } else {
    doc.save(filename)
  }
}
