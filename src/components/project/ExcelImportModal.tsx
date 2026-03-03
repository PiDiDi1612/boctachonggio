// src/components/project/ExcelImportModal.tsx
'use client'

import { useState, useRef } from 'react'
import * as XLSX from 'xlsx'
import {
    Dialog, DialogContent, DialogHeader,
    DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DUCT_TYPE_LABELS } from '@/modules/duct-calc/constants'
import type { DuctItem } from '@/lib/types'
import { Upload, Check, AlertCircle, ArrowRight } from 'lucide-react'
import { getSettings } from '@/lib/storage'
import * as projectService from '@/modules/project-engine/project-service'

interface ExcelImportModalProps {
    open: boolean
    onOpenChange: (v: boolean) => void
    onImport: (items: DuctItem[]) => void
}

type MappingState = Record<string, string>

const TARGET_FIELDS = [
    { id: 'stt', label: 'STT', required: false },
    { id: 'name', label: 'Tên vật tư (Chứa kích thước)', required: true },
    { id: 'thickness', label: 'Độ dày', required: true },
    { id: 'quantity', label: 'Số lượng', required: true },
]

export function ExcelImportModal({ open, onOpenChange, onImport }: ExcelImportModalProps) {
    const [step, setStep] = useState<1 | 2 | 3>(1)
    const [fileName, setFileName] = useState<string>('')
    const [headers, setHeaders] = useState<string[]>([])
    const [dataRows, setDataRows] = useState<unknown[][]>([])
    const [mapping, setMapping] = useState<MappingState>({})
    const [previewData, setPreviewData] = useState<DuctItem[]>([])

    const fileInputRef = useRef<HTMLInputElement>(null)

    const reset = () => {
        setStep(1)
        setFileName('')
        setHeaders([])
        setDataRows([])
        setMapping({})
        setPreviewData([])
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setFileName(file.name)
        const reader = new FileReader()
        reader.onload = (evt) => {
            const bstr = evt.target?.result
            const wb = XLSX.read(bstr, { type: 'binary' })
            const wsname = wb.SheetNames[0]
            const ws = wb.Sheets[wsname]
            const rawData = XLSX.utils.sheet_to_json(ws, { header: 1 })

            if (rawData.length > 0) {
                let headerIdx = 0;
                for (let i = 0; i < Math.min(rawData.length, 15); i++) {
                    const row = rawData[i] as unknown[];
                    if (row && row.some(cell => {
                        const cellStr = String(cell || '').toLowerCase();
                        return cellStr.includes('tên') || cellStr.includes('vật tư') || cellStr.includes('số lượng');
                    })) {
                        headerIdx = i;
                        break;
                    }
                }

                const headerRow = rawData[headerIdx] as unknown[]
                const rows = rawData.slice(headerIdx + 1) as unknown[][]

                const cleanHeaders = headerRow.map(h => String(h || '').trim()).filter(h => !!h)
                setHeaders(cleanHeaders)
                setDataRows(rows)

                // Auto-mapping logic
                const autoMap: MappingState = {}
                headerRow.forEach((h) => {
                    if (!h) return
                    const s = String(h).toLowerCase()
                    if (s === 'stt' || s.includes('số thứ tự')) autoMap.stt = String(h)
                    if (s.includes('tên') || s.includes('vật tư')) autoMap.name = String(h)
                    if (s.includes('dày') || s.includes('thickness')) autoMap.thickness = String(h)
                    if (s.includes('số lượng') || s.includes('qty') || s.includes('quantity')) autoMap.quantity = String(h)
                })
                setMapping(autoMap)
                setStep(2)
            }
        }
        reader.readAsBinaryString(file)
    }


    const handleProcessPreview = async () => {
        const rowsToProcess = dataRows
            .filter((row: unknown[]) => {
                const nameIdx = headers.indexOf(mapping.name)
                return row && row[nameIdx] && String(row[nameIdx]).trim() !== ''
            });

        const settings = getSettings()
        const rawRows = rowsToProcess.map(row => {
            const getVal = (field: string) => {
                const header = mapping[field]
                if (!header) return undefined
                const idx = headers.indexOf(header)
                return row[idx]
            }
            return {
                name: String(getVal('name') || ''),
                quantity: Number(getVal('quantity')) || 1,
                thickness: Number(getVal('thickness')) || settings.defaultThickness
            }
        })

        const processed = await projectService.batchCreateFromExcel(rawRows, settings)
        setPreviewData(processed)
        setStep(3)
    }

    const handleConfirm = () => {
        onImport(previewData)
        onOpenChange(false)
        reset()
    }

    return (
        <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) reset(); }}>
            <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Upload className="w-5 h-5" /> Nhập hạng mục từ Excel
                    </DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto py-4">
                    {/* Step 1: Upload */}
                    {step === 1 && (
                        <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                            <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center mb-4">
                                <Upload className="w-6 h-6 text-slate-400" />
                            </div>
                            <p className="text-sm font-bold text-slate-700">Ấn để chọn tệp Excel (.xlsx)</p>
                            <p className="text-xs text-slate-400 mt-1">Hệ thống sẽ tự động quét các cột dữ liệu</p>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept=".xlsx, .xls"
                                onChange={handleFileUpload}
                            />
                        </div>
                    )}

                    {/* Step 2: Mapping */}
                    {step === 2 && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between bg-blue-50 p-4 rounded-lg border border-blue-100">
                                <div className="flex items-center gap-3">
                                    <Check className="w-5 h-5 text-blue-500" />
                                    <div>
                                        <p className="text-sm font-bold text-blue-900">Đã đọc file: {fileName}</p>
                                        <p className="text-xs text-blue-600">Tìm thấy {headers.length} cột và {dataRows.length} dòng dữ liệu</p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                                {TARGET_FIELDS.map(field => (
                                    <div key={field.id} className="flex flex-col gap-1.5">
                                        <div className="flex items-center gap-1.5">
                                            <label className="text-xs font-bold text-slate-600">{field.label}</label>
                                            {field.required && <span className="text-red-500">*</span>}
                                        </div>
                                        <Select
                                            value={mapping[field.id] || ''}
                                            onValueChange={(v) => setMapping(prev => ({ ...prev, [field.id]: v }))}
                                        >
                                            <SelectTrigger className="h-9">
                                                <SelectValue placeholder="Chọn cột từ Excel..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">-- Không nhập --</SelectItem>
                                                {headers.map(h => (
                                                    <SelectItem key={h} value={h}>{h}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 3: Preview */}
                    {step === 3 && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-amber-600 bg-amber-50 p-3 rounded-md text-xs border border-amber-100">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                Dưới đây là dữ liệu xem trước sau khi ánh xạ. Vui lòng kiểm tra kỹ trước khi xác nhận.
                            </div>
                            <div className="border border-slate-200 rounded-lg overflow-hidden">
                                <Table>
                                    <TableHeader className="bg-slate-50">
                                        <TableRow>
                                            <TableHead className="w-12">#</TableHead>
                                            <TableHead>Hạng mục</TableHead>
                                            <TableHead>Kích thước</TableHead>
                                            <TableHead className="text-right">SL</TableHead>
                                            <TableHead>Độ dày</TableHead>
                                            <TableHead>Mí ghép</TableHead>
                                            <TableHead>Ghi chú</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {previewData.slice(0, 10).map((item, idx) => (
                                            <TableRow key={idx}>
                                                <TableCell className="font-data text-slate-400">{idx + 1}</TableCell>
                                                <TableCell className="font-bold text-slate-700">
                                                    {DUCT_TYPE_LABELS[item.type] || item.type}
                                                </TableCell>
                                                <TableCell className="font-data text-slate-500">
                                                    {item.dimensions}
                                                </TableCell>
                                                <TableCell className="text-right font-data font-bold">{item.quantity}</TableCell>
                                                <TableCell className="font-data">{item.thickness}mm</TableCell>
                                                <TableCell className="text-[10px] text-slate-500 uppercase">{item.seam || 'pittsburgh'}</TableCell>
                                                <TableCell className="text-slate-400 text-xs truncate max-w-[150px]">{item.note}</TableCell>
                                            </TableRow>
                                        ))}
                                        {previewData.length > 10 && (
                                            <TableRow>
                                                <TableCell colSpan={7} className="text-center text-slate-400 text-xs italic py-4">
                                                    ... và {previewData.length - 10} dòng khác
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter className="border-t border-slate-100 pt-4 mt-2">
                    {step === 2 && (
                        <Button variant="outline" onClick={() => setStep(1)} className="mr-auto">Quay lại</Button>
                    )}
                    {step === 3 && (
                        <Button variant="outline" onClick={() => setStep(2)} className="mr-auto">Quay lại mapping</Button>
                    )}

                    <div className="flex gap-2">
                        <Button variant="ghost" onClick={() => onOpenChange(false)}>Hủy</Button>
                        {step === 2 && (
                            <Button onClick={handleProcessPreview} className="gap-2" disabled={!mapping.name || !mapping.quantity}>
                                Tiếp tục <ArrowRight className="w-4 h-4" />
                            </Button>
                        )}
                        {step === 3 && (
                            <Button onClick={handleConfirm} className="gap-2 bg-green-600 hover:bg-green-700">
                                Xác nhận Nhập ({previewData.length} dòng)
                            </Button>
                        )}
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
