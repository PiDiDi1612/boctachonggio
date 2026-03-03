// src/components/duct/DuctForm.tsx
// Form thêm/sửa hạng mục ống gió – shadcn Dialog + Zod validation
'use client'

import { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import type { DuctItem, DuctItemType, DuctItemFormValues, ConnectorType, SeamType } from '@/lib/types'
import {
  THICKNESS_OPTIONS, DUCT_TYPE_LABELS, UNIT_OPTIONS, DEFAULT_THICKNESS
} from '@/modules/duct-calc/constants'
import {
  parseDimensions, buildDimString,
} from '@/modules/duct-calc'
import {
  CONNECTOR_OPTIONS, SEAM_OPTIONS,
} from '@/modules/duct-calc/constants'
import { fmtNumber } from '@/lib/utils'
import { getSettings } from '@/lib/storage'
import * as projectService from '@/modules/project-engine/project-service'

// ─── Zod schema ───────────────────────────────────────────────────────────────

const ductItemSchema = z.object({
  type: z.enum([
    'straight_square', 'straight_1_end', 'elbow_90_radius', 'elbow_90_square',
    'reducer_square', 'reducer_sq_rd', 'shoe_tap', 'z_offset_radius',
    'offset_round_deg', 'offset_square', 'plenum_box', 'other'
  ]),
  thickness: z.number().positive('Độ dày phải > 0'),
  quantity: z.number().int().positive('Số lượng phải ≥ 1'),
  unit: z.string().min(1),
  note: z.string().optional(),
  // Dùng chung cho các loại phụ kiện (công thức sẽ linh hoạt hơn)
  dimW: z.number().min(0).default(0),
  dimH: z.number().min(0).default(0),
  dimL: z.number().min(0).default(0),
  dimD: z.number().min(0).default(0),
  dimE: z.number().min(0).default(0),
  dimW2: z.number().min(0).default(0),
  dimH2: z.number().min(0).default(0),
  conn1: z.string().default('tdc'),
  conn2: z.string().default('tdc'),
  seam: z.string().default('pittsburgh'),
})

type FormValues = z.infer<typeof ductItemSchema>

// ─── Config: dimension fields per type ────────────────────────────────────────

const DIM_FIELDS: Record<DuctItemType, { id: keyof FormValues; label: string; placeholder: string }[]> = {
  straight_square: [
    { id: 'dimW', label: 'Rộng (W1)', placeholder: '500' },
    { id: 'dimH', label: 'Cao (H1)', placeholder: '400' },
    { id: 'dimL', label: 'Dài(L)', placeholder: '12000' },
  ],
  straight_1_end: [
    { id: 'dimW', label: 'Rộng (W1)', placeholder: '500' },
    { id: 'dimH', label: 'Cao (H1)', placeholder: '400' },
    { id: 'dimL', label: 'Dài(L)', placeholder: '1100' },
  ],
  elbow_90_radius: [
    { id: 'dimW', label: 'Rộng (W1)', placeholder: '500' },
    { id: 'dimH', label: 'Cao (H1)', placeholder: '400' },
    { id: 'dimD', label: 'Bán kính (R)', placeholder: '150' },
  ],
  elbow_90_square: [
    { id: 'dimW', label: 'Rộng (W1)', placeholder: '500' },
    { id: 'dimH', label: 'Cao (H1)', placeholder: '400' },
    { id: 'dimD', label: 'Bán kính (R)', placeholder: '150' },
  ],
  reducer_square: [
    { id: 'dimW', label: 'Rộng (W1)', placeholder: '600' },
    { id: 'dimH', label: 'Cao (H1)', placeholder: '400' },
    { id: 'dimW2', label: 'Rộng (W2)', placeholder: '400' },
    { id: 'dimH2', label: 'Cao (H2)', placeholder: '300' },
    { id: 'dimL', label: 'Dài (L)', placeholder: '800' },
    { id: 'dimD', label: 'Bán kính (R)', placeholder: '100' },
    { id: 'dimE', label: 'Lệch (E)', placeholder: '100' },
  ],
  reducer_sq_rd: [
    { id: 'dimW', label: 'Rộng (W1)', placeholder: '600' },
    { id: 'dimH', label: 'Cao (H1)', placeholder: '400' },
    { id: 'dimD', label: 'Đường kính (D)', placeholder: '350' },
    { id: 'dimL', label: 'Dài (L)', placeholder: '800' },
    { id: 'dimE', label: 'Lệch (E)', placeholder: '0' },
  ],
  shoe_tap: [
    { id: 'dimW', label: 'Rộng (W1)', placeholder: '500' },
    { id: 'dimH', label: 'Cao (H1)', placeholder: '400' },
    { id: 'dimW2', label: 'Rộng (W2)', placeholder: '400' },
    { id: 'dimH2', label: 'Cao (H2)', placeholder: '300' },
    { id: 'dimL', label: 'Dài (L)', placeholder: '300' },
    { id: 'dimE', label: 'Lệch (E)', placeholder: '0' },
  ],
  z_offset_radius: [
    { id: 'dimW', label: 'Rộng (W1)', placeholder: '500' },
    { id: 'dimH', label: 'Cao (H1)', placeholder: '400' },
    { id: 'dimL', label: 'Dài (L)', placeholder: '200' },
    { id: 'dimE', label: 'Lệch (E)', placeholder: '100' },
  ],
  offset_round_deg: [
    { id: 'dimW', label: 'Rộng (W1)', placeholder: '500' },
    { id: 'dimH', label: 'Cao (H1)', placeholder: '400' },
    { id: 'dimD', label: 'Đường kính (D)', placeholder: '45' },
  ],
  offset_square: [
    { id: 'dimW', label: 'Rộng (W1)', placeholder: '500' },
    { id: 'dimH', label: 'Cao (H1)', placeholder: '400' },
    { id: 'dimL', label: 'Dài(L)', placeholder: '250' },
  ],
  plenum_box: [
    { id: 'dimW', label: 'Rộng (W1)', placeholder: '800' },
    { id: 'dimH', label: 'Cao (H1)', placeholder: '400' },
    { id: 'dimL', label: 'Dài(L)', placeholder: '1200' },
  ],
  other: [
    { id: 'dimW', label: 'Rộng (W1)', placeholder: '0' },
    { id: 'dimH', label: 'Cao (H1)', placeholder: '0' },
    { id: 'dimW2', label: 'Rộng (W2)', placeholder: '0' },
    { id: 'dimH2', label: 'Cao (H2)', placeholder: '0' },
    { id: 'dimL', label: 'Dài(L)', placeholder: '0' },
    { id: 'dimD', label: 'R/D', placeholder: '0' },
    { id: 'dimE', label: 'Lệch (E)', placeholder: '0' },
  ],
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface DuctFormProps {
  open: boolean
  onOpenChange: (v: boolean) => void
  initialItem?: DuctItem | null
  onSave: (values: DuctItemFormValues) => void
}

// ─── Component ────────────────────────────────────────────────────────────────

export function DuctForm({ open, onOpenChange, initialItem, onSave }: DuctFormProps) {
  const isEdit = !!initialItem
  const [keepOpen, setKeepOpen] = useState(false)

  const { register, handleSubmit, watch, control, reset,
    formState: { errors } } = useForm<FormValues>({
      resolver: zodResolver(ductItemSchema),
      defaultValues: {
        type: 'straight_square', thickness: DEFAULT_THICKNESS,
        quantity: 1, unit: 'cái', note: '',
        dimW: 0, dimH: 0, dimL: 0, dimD: 0,
        conn1: 'tdc', conn2: 'tdc',
        seam: 'pittsburgh',
      },
    })

  // Populate khi edit
  useEffect(() => {
    if (!open) return
    if (initialItem) {
      const type = initialItem.type as DuctItemType
      const dims = parseDimensions(type, initialItem.dimensions)
      reset({
        type: type,
        thickness: initialItem.thickness,
        quantity: initialItem.quantity,
        unit: initialItem.unit,
        note: initialItem.note ?? '',
        dimW: dims.width ?? 0,
        dimH: dims.height ?? 0,
        dimL: dims.length ?? 0,
        dimD: dims.diameter ?? 0,
        dimE: dims.auxValue ?? 0,
        dimW2: dims.width2 ?? 0,
        dimH2: dims.height2 ?? 0,
        conn1: initialItem.conn1 ?? 'tdc',
        conn2: initialItem.conn2 ?? 'tdc',
        seam: initialItem.seam ?? 'pittsburgh',
      })
    } else {
      reset({
        type: 'straight_square', thickness: DEFAULT_THICKNESS, quantity: 1, unit: 'cái',
        note: '', dimW: 0, dimH: 0, dimL: 0, dimD: 0, dimW2: 0, dimH2: 0,
        conn1: 'tdc', conn2: 'tdc', seam: 'pittsburgh'
      })
    }
  }, [open, initialItem, reset])

  const [type, thickness, quantity, dimW, dimH, dimL, dimD, dimE, dimW2, dimH2, conn1, conn2, seam, note] =
    watch(['type', 'thickness', 'quantity', 'dimW', 'dimH', 'dimL', 'dimD', 'dimE', 'dimW2', 'dimH2', 'conn1', 'conn2', 'seam', 'note'])

  const [preview, setPreview] = useState({ area: 0, weight: 0, totalArea: 0, totalWeight: 0 })
  const [calculating, setCalculating] = useState(false)

  // Live preview calculation (Async via Service to ensure consistency)
  useEffect(() => {
    let mounted = true
    const settings = getSettings()

    async function updatePreview() {
      setCalculating(true)
      try {
        const item = await projectService.processManualItem(
          note || '', // rawText
          quantity,
          thickness,
          settings,
          {
            type: type as DuctItemType,
            dimensions: buildDimString(type, dimW, dimH, dimL, dimD, dimE, dimW2, dimH2),
            conn1: conn1 as ConnectorType,
            conn2: conn2 as ConnectorType,
            seam: seam as SeamType
          }
        )
        if (mounted) {
          setPreview({
            area: item.area,
            weight: item.weight,
            totalArea: item.area * quantity,
            totalWeight: item.weight * quantity
          })
        }
      } finally {
        if (mounted) setCalculating(false)
      }
    }

    const timer = setTimeout(updatePreview, 300) // Debounce 300ms
    return () => {
      mounted = false
      clearTimeout(timer)
    }
  }, [type, thickness, quantity, dimW, dimH, dimL, dimD, dimE, dimW2, dimH2, conn1, conn2, seam, note])

  function onSubmit(data: FormValues) {
    const dimensions = buildDimString(data.type, data.dimW, data.dimH, data.dimL, data.dimD, data.dimE, data.dimW2, data.dimH2)
    onSave({
      type: data.type as DuctItemType,
      dimensions,
      thickness: data.thickness,
      quantity: data.quantity,
      unit: data.unit,
      note: data.note ?? '',
      conn1: data.conn1 as ConnectorType,
      conn2: data.conn2 as ConnectorType,
      seam: data.seam as SeamType,
    })

    if (keepOpen && !isEdit) {
      // Giữ form mở để nhập tiếp
    } else {
      onOpenChange(false)
    }
  }

  const dimFields = DIM_FIELDS[type as DuctItemType] ?? DIM_FIELDS.other

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Sửa hạng mục' : 'Thêm hạng mục ống gió'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 py-1">

          {/* Row 1: Loại + Độ dày */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Loại ống / phụ kiện *</Label>
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(DUCT_TYPE_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Độ dày tôn *</Label>
              <Controller
                name="thickness"
                control={control}
                render={({ field }) => (
                  <Select
                    value={String(field.value)}
                    onValueChange={(v) => field.onChange(parseFloat(v))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {THICKNESS_OPTIONS.map(({ value, label }) => (
                        <SelectItem key={value} value={String(value)}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.thickness && (
                <p className="text-xs text-destructive">{errors.thickness.message}</p>
              )}
            </div>
          </div>

          {/* Row 2: Dimension fields (dynamic) */}
          <div className="space-y-2">
            <Label className="section-label">Kích thước</Label>
            <div className="grid grid-cols-3 gap-3">
              {dimFields.map((f) => (
                <div key={f.id} className="space-y-1.5">
                  <Label htmlFor={f.id} className="text-xs text-muted-foreground">
                    {f.label}
                  </Label>
                  <Input
                    id={f.id}
                    type="number"
                    min={0}
                    step={1}
                    placeholder={f.placeholder}
                    {...register(f.id, { valueAsNumber: true })}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Row 3: Số lượng + ĐV */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="quantity">Số lượng *</Label>
              <Input
                id="quantity"
                type="number"
                min={1}
                step={1}
                {...register('quantity', { valueAsNumber: true })}
              />
              {errors.quantity && (
                <p className="text-xs text-destructive">{errors.quantity.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label>Đơn vị</Label>
              <Controller
                name="unit"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {UNIT_OPTIONS.map((u) => (
                        <SelectItem key={u} value={u}>{u}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          {/* Connector Section */}
          <Separator />
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="section-label">Kiểu kết nối (Connector)</Label>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Đầu 1</Label>
                  <Controller
                    name="conn1"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CONNECTOR_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Đầu 2</Label>
                  <Controller
                    name="conn2"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CONNECTOR_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="section-label">Mí ghép (Seam)</Label>
              <Controller
                name="seam"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SEAM_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          {/* Ghi chú */}
          <div className="space-y-1.5">
            <Label htmlFor="note">Ghi chú</Label>
            <Input
              id="note"
              placeholder="Vị trí lắp đặt, chú ý thi công..."
              {...register('note')}
            />
          </div>

          {/* Live preview */}
          <Separator />
          <div className="bg-muted/40 rounded-lg p-3.5 space-y-2">
            <div className="section-label mb-2 flex items-center gap-2">
              Tính trước
              {calculating && <div className="w-3 h-3 border-2 border-[var(--primary-main)] border-t-transparent rounded-full animate-spin" />}
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
              {[
                { label: 'Diện tích / cái', value: fmtNumber(preview.area, 4), unit: 'm²', color: 'text-primary' },
                { label: `Tổng DT (×${quantity})`, value: fmtNumber(preview.totalArea, 3), unit: 'm²', color: 'text-primary' },
              ].map(({ label, value, unit, color }) => (
                <div key={label} className="flex items-baseline justify-between">
                  <span className="text-muted-foreground text-xs">{label}</span>
                  <span className={`font-mono font-semibold tabular-nums ${color}`}>
                    {value}
                    <span className="text-muted-foreground font-normal text-xs ml-1">{unit}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter className="sm:justify-between items-center w-full mt-2">
            <div className="flex items-center mr-auto">
              {!isEdit && (
                <label className="flex items-center gap-2 text-xs font-medium text-slate-500 cursor-pointer select-none border border-transparent hover:bg-slate-100 p-1.5 rounded-md transition-colors">
                  <input
                    type="checkbox"
                    className="rounded w-3.5 h-3.5 text-[var(--primary-main)] focus:ring-[var(--primary-main)]"
                    checked={keepOpen}
                    onChange={(e) => setKeepOpen(e.target.checked)}
                  />
                  Lưu & Tiếp tục
                </label>
              )}
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Hủy
              </Button>
              <Button type="submit">
                {isEdit ? 'Cập nhật' : 'Thêm'}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
