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
import { DUCT_TYPE_LABELS, UNIT_OPTIONS, DEFAULT_THICKNESS } from '@/modules/duct-calc/constants'
import type { DuctItemType, DuctItemFormValues, ConnectorType, SeamType } from '@/lib/types'
import { buildDimString } from '@/modules/duct-calc'
import { Upload, Check, AlertCircle, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ExcelImportModalProps {
    open: boolean
    onOpenChange: (v: boolean) => void
    onImport: (items: DuctItemFormValues[]) => void
}

type MappingState = Record<string, string>

const TARGET_FIELDS = [
    { id: 'stt', label: 'STT', required: false },
    { id: 'name', label: 'Tên vật tư (Chứa kích thước)', required: true },
    { id: 'thickness', label: 'Độ dày', required: true },
    { id: 'quantity', label: 'Số lượng', required: true },
]

/**
 * Tách thông tin từ chuỗi "Tên vật tư"
 */
function parseDuctInfo(rawName: string): {
    type: DuctItemType;
    dimW: number; dimH: number; dimL: number; dimD: number; dimW2: number; dimH2: number;
    conn1: ConnectorType; conn2: ConnectorType; seam: SeamType;
    note: string
} {
    const s = rawName.toUpperCase();
    let type: DuctItemType = 'straight_square';
    let dimW = 0, dimH = 0, dimL = 0, dimD = 0, dimW2 = 0, dimH2 = 0;
    let conn1: ConnectorType = 'tdc';
    let conn2: ConnectorType = 'tdc';
    let seam: SeamType = 'pittsburgh';

    // 1. Nhận diện loại dựa trên từ khóa
    if (s.includes('CÔN THU')) {
        type = s.includes('TRÒN') ? 'reducer_sq_rd' : 'reducer_square';
    }
    else if (s.includes('CÚT') || s.includes('CO')) type = 'elbow_90_radius';
    else if (s.includes('HỘP GIÓ') || s.includes('BOX')) type = 'plenum_box';
    else if (s.includes('CHÂN RẼ') || s.includes('GÓT DÀY')) type = 'shoe_tap';
    else if (s.includes('SIMILI')) type = 'other';
    else if (s.includes('ỐNG GIÓ')) type = 'straight_square';

    // 2. Tìm các cụm số theo thứ tự (Loại bỏ các số đứng sau '1 ĐẦU' để tránh nhầm kích thước)
    const cleanS = s.replace(/1 ĐẦU \d+/g, '1 ĐẦU');

    // Thử bắt mẫu W1xH1/W2xH2 (Côn thu/Hộp gió dạng côn)
    const reducerMatch = cleanS.match(/W(\d+)XH(\d+)\/W(\d+)XH(\d+)/i);
    if (reducerMatch) {
        dimW = parseInt(reducerMatch[1]);
        dimH = parseInt(reducerMatch[2]);
        dimW2 = parseInt(reducerMatch[3]);
        dimH2 = parseInt(reducerMatch[4]);
        if (type === 'plenum_box' || s.includes('HỘP GIÓ')) type = 'reducer_square';
    } else {
        const ktPart = cleanS.split(/KT:|KÍCH THƯỚC:/)[1] || cleanS;
        const ktNumbers = ktPart.match(/\d+/g)?.map(Number) || [];

        if ((type === 'reducer_square' || type === 'shoe_tap' || s.includes('CÔN')) && ktNumbers.length >= 5) {
            dimW = ktNumbers[0];
            dimH = ktNumbers[1];
            dimW2 = ktNumbers[2];
            dimH2 = ktNumbers[3];
            dimL = ktNumbers[4];
        } else if (ktNumbers.length >= 3) {
            dimW = ktNumbers[0];
            dimH = ktNumbers[1];
            dimL = ktNumbers[2];
        } else if (ktNumbers.length === 2) {
            dimW = ktNumbers[0];
            dimH = ktNumbers[1];
        }
    }

    // 3. Ưu tiên tìm theo nhãn W, H, L, D (Nếu chưa có dimW2)
    const wMatch = s.match(/W(\d+)/i);
    const hMatch = s.match(/H(\d+)/i);
    const lMatch = s.match(/L(\d+)/i);
    const dMatch = s.match(/D(\d+)/i);
    if (wMatch && dimW === 0) dimW = parseInt(wMatch[1]);
    if (hMatch && dimH === 0) dimH = parseInt(hMatch[1]);
    if (lMatch) dimL = parseInt(lMatch[1]);
    if (dMatch) dimD = parseInt(dMatch[1]);

    // 5. Nhận diện Đầu kết nối nâng cao
    const parseConnector = (str: string, current: ConnectorType): ConnectorType => {
        if (str.includes('BÍCH V30')) return 'bich_v30';
        if (str.includes('BÍCH V40')) return 'bich_v40';
        if (str.includes('BÍCH V50')) return 'bich_v50';
        if (str.includes('BỊT ĐẦU') || str.includes('ĐẦU BỊT')) return 'bit_dau';
        if (str.includes('NẸP C')) return 'nep_c';
        if (str.includes('ĐỂ THẲNG')) return 'de_thang';
        if (str.includes('TDC')) return 'tdc';
        if (str.includes('BẺ CHÂN 30')) return 'be_chan_30';
        return current;
    };

    // Kiểm tra mẫu "Đầu W...xH... [Kết nối]"
    const specificSideMatch = s.match(/ĐẦU W(\d+)XH(\d+)\s+([^,.\s]+(\s+[^,.\s]+)*)/gi);
    if (specificSideMatch) {
        specificSideMatch.forEach(matchStr => {
            const m = matchStr.match(/W(\d+)XH(\d+)/i);
            if (m) {
                const w = parseInt(m[1]);
                const h = parseInt(m[2]);
                const conn = parseConnector(matchStr.toUpperCase(), 'tdc' as ConnectorType);
                if (w === dimW && h === dimH) conn1 = conn;
                else if (w === dimW2 && h === dimH2) conn2 = conn;
            }
        });
    }

    // Kiểm tra mẫu "1 đầu A, 1 đầu B" (Nếu chưa nhận diện theo kích thước cụ thể)
    const oneSideMatch = s.match(/1 ĐẦU ([^,]+)/g);
    if (oneSideMatch && oneSideMatch.length >= 2 && !specificSideMatch) {
        conn1 = parseConnector(oneSideMatch[0], conn1);
        conn2 = parseConnector(oneSideMatch[1], conn2);
    } else if (oneSideMatch && oneSideMatch.length === 1 && !specificSideMatch) {
        const sideType = parseConnector(oneSideMatch[0], 'tdc' as ConnectorType);
        if (sideType === 'bit_dau') conn2 = 'bit_dau';
        else conn1 = sideType;
    } else if (!specificSideMatch) {
        // Fallback nhận diện chung
        if (s.includes('BÍCH V30')) { conn1 = 'bich_v30'; conn2 = 'bich_v30'; }
        else if (s.includes('BÍCH V40')) { conn1 = 'bich_v40'; conn2 = 'bich_v40'; }
        else if (s.includes('BÍCH V50')) { conn1 = 'bich_v50'; conn2 = 'bich_v50'; }
        else if (s.includes('BỊT ĐẦU') || s.includes('ĐẦU BỊT')) { conn2 = 'bit_dau'; }
        else if (s.includes('NẸP C')) { conn1 = 'nep_c'; conn2 = 'nep_c'; }
        else if (s.includes('ĐỂ THẲNG')) { conn1 = 'de_thang'; conn2 = 'de_thang'; }
        else if (s.includes('TDC')) { conn1 = 'tdc'; conn2 = 'tdc'; }
    }

    // Đặc thù Hộp gió
    if (type === 'plenum_box' || s.includes('HỘP GIÓ')) {
        // Hộp gió mặc định thường có ít nhất 1 đầu để thẳng hoặc bẻ chân để đấu nối
        if (!s.includes('BÍCH') && !s.includes('TDC') && conn1 === 'tdc') {
            conn1 = 'de_thang';
        }
    }

    // 6. Nhận diện Mí ghép
    if (s.includes('ĐƠN-KÉP')) seam = 'don_kep';
    else if (s.includes('NỐI C')) seam = 'noi_c';
    else if (s.includes('HÀN 15')) seam = 'han_15';

    // 7. Quy tắc mặc định của người dùng
    if (type === 'shoe_tap') {
        conn2 = 'be_chan_30';
        seam = 'han_15';
    }
    if (type === 'reducer_sq_rd' || s.includes('VUÔNG-TRÒN')) {
        seam = 'noi_c';
    }

    return { type, dimW, dimH, dimL, dimD, dimW2, dimH2, conn1, conn2, seam, note: rawName };
}

export function ExcelImportModal({ open, onOpenChange, onImport }: ExcelImportModalProps) {
    const [step, setStep] = useState<1 | 2 | 3>(1)
    const [fileName, setFileName] = useState<string>('')
    const [headers, setHeaders] = useState<string[]>([])
    const [dataRows, setDataRows] = useState<any[]>([])
    const [mapping, setMapping] = useState<MappingState>({})
    const [previewData, setPreviewData] = useState<DuctItemFormValues[]>([])

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
                    const row = rawData[i] as any[];
                    if (row && row.some(cell => {
                        const cellStr = String(cell || '').toLowerCase();
                        return cellStr.includes('tên') || cellStr.includes('vật tư') || cellStr.includes('số lượng');
                    })) {
                        headerIdx = i;
                        break;
                    }
                }

                const headerRow = rawData[headerIdx] as any[]
                const rows = rawData.slice(headerIdx + 1) as any[][]

                const cleanHeaders = headerRow.map(h => String(h || '').trim()).filter(h => !!h)
                setHeaders(cleanHeaders)
                setDataRows(rows)

                // Auto-mapping logic
                const autoMap: MappingState = {}
                headerRow.forEach((h, idx) => {
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

    const handleProcessPreview = () => {
        const processed: DuctItemFormValues[] = dataRows
            .filter(row => {
                const nameIdx = headers.indexOf(mapping.name)
                return row && row[nameIdx] && String(row[nameIdx]).trim() !== ''
            })
            .map(row => {
                const getVal = (field: string) => {
                    const header = mapping[field]
                    if (!header) return undefined
                    const idx = headers.indexOf(header)
                    return row[idx]
                }

                const rawName = String(getVal('name') || '')
                const rawThickness = String(getVal('thickness') || '')

                // Tách độ dày từ chuỗi (ví dụ: "tôn dày 0.75mm" -> 0.75)
                const thicknessMatch = rawThickness.match(/0\.\d+|1\.\d+/);
                const thickness = thicknessMatch ? parseFloat(thicknessMatch[0]) : DEFAULT_THICKNESS;

                const info = parseDuctInfo(rawName)
                const dimensions = buildDimString(info.type, info.dimW, info.dimH, info.dimL, info.dimD, 0, info.dimW2, info.dimH2)

                return {
                    type: info.type,
                    dimensions,
                    thickness,
                    quantity: Number(getVal('quantity')) || 1,
                    unit: 'cái',
                    conn1: info.conn1,
                    conn2: info.conn2,
                    seam: info.seam,
                    note: rawName,
                }
            })
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
