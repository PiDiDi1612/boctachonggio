// src/app/settings/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { clearAllData, getSettings, saveSettings, DEFAULT_SETTINGS } from '@/lib/storage'
import { THICKNESS_OPTIONS } from '@/modules/duct-calc/constants'
import { useRouter } from 'next/navigation'
import type { AppSettings } from '@/lib/types'

export default function SettingsPage() {
  const router = useRouter()
  const [confirmClear, setConfirmClear] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // State quản lý AppSettings
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS)

  // Load settings khi mở trang
  useEffect(() => {
    setSettings(getSettings())
  }, [])

  function handleClearAll() {
    if (!confirmClear) {
      setConfirmClear(true)
      return
    }
    clearAllData()
    setConfirmClear(false)
    router.push('/')
  }

  function handleSaveSettings() {
    saveSettings(settings)
    setSaveSuccess(true)
    setTimeout(() => setSaveSuccess(false), 3000)
  }

  function handleResetSettings() {
    if (confirm('Khôi phục toàn bộ cài đặt hệ thống về mặc định?')) {
      setSettings(DEFAULT_SETTINGS)
      saveSettings(DEFAULT_SETTINGS)
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    }
  }

  return (
    <div className="flex-1 overflow-y-auto p-8 max-w-4xl bg-[var(--bg-void)]">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Cài đặt hệ thống</h1>
        <p className="text-base text-[var(--text-secondary)] mt-1.5">
          Tùy chỉnh hằng số sản xuất và thông số kỹ thuật CamDuct
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* ── Seam & Density ────────────────────────────────────── */}
        <div className="bg-[var(--bg-raised)] border border-[var(--border)] shadow-sm rounded-xl p-6">
          <h2 className="text-base font-bold mb-5 text-[var(--text-primary)] flex items-center gap-2">
            Mí & Tỷ trọng
          </h2>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Seam Pittsburgh (m)
              </Label>
              <Input
                type="number"
                value={settings.seamPittsburgh}
                step="0.001"
                onChange={e => setSettings({ ...settings, seamPittsburgh: parseFloat(e.target.value) || 0 })}
                className="h-10 text-base font-data shadow-sm"
              />
              <p className="text-[10px] text-muted-foreground italic">Mặc định: 0.04 (8mm đơn + 32mm kép)</p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Tỷ trọng tôn (kg/m³/mm)
              </Label>
              <Input
                type="number"
                value={settings.defaultDensity}
                step="0.1"
                onChange={e => setSettings({ ...settings, defaultDensity: parseFloat(e.target.value) || 0 })}
                className="h-10 text-base font-data shadow-sm"
              />
              <p className="text-[10px] text-muted-foreground italic">Tôn đen: 7.85 kg/m²/mm (tương đương 7850 kg/m³)</p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Độ dày mặc định (mm)
              </Label>
              <Select
                value={String(settings.defaultThickness)}
                onValueChange={v => setSettings({ ...settings, defaultThickness: parseFloat(v) })}
              >
                <SelectTrigger className="h-10 text-base font-data shadow-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {THICKNESS_OPTIONS.map(({ value, label }) => (
                    <SelectItem key={value} value={String(value)}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* ── Connectors (Bích/Nối) ────────────────────────────────── */}
        <div className="bg-[var(--bg-raised)] border border-[var(--border)] shadow-sm rounded-xl p-6">
          <h2 className="text-base font-bold mb-5 text-[var(--text-primary)]">Connector (m/đầu)</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold text-muted-foreground">TDC (m)</Label>
                <Input
                  type="number" value={settings.connTDC} step="0.001"
                  onChange={e => setSettings({ ...settings, connTDC: parseFloat(e.target.value) || 0 })}
                  className="h-9 text-sm font-data"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold text-muted-foreground">Bích V (m)</Label>
                <Input
                  type="number" value={settings.connV} step="0.001"
                  onChange={e => setSettings({ ...settings, connV: parseFloat(e.target.value) || 0 })}
                  className="h-9 text-sm font-data"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold text-muted-foreground">Nẹp C (m)</Label>
                <Input
                  type="number" value={settings.connC_Cleat} step="0.001"
                  onChange={e => setSettings({ ...settings, connC_Cleat: parseFloat(e.target.value) || 0 })}
                  className="h-9 text-sm font-data"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold text-muted-foreground">Nối C (m)</Label>
                <Input
                  type="number" value={settings.connC_Joint} step="0.001"
                  onChange={e => setSettings({ ...settings, connC_Joint: parseFloat(e.target.value) || 0 })}
                  className="h-9 text-sm font-data"
                />
              </div>
            </div>
            <div className="pt-2">
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                Giá trị được tính trên **mỗi đầu**. Ví dụ: TDC 50mm = 0.05m.
                Hệ thống sẽ cộng dồn nếu vật tư có nhiều đầu kết nối.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Actions ────────────────────────────────────────── */}
      <div className="flex items-center gap-3 mb-10">
        <Button
          size="lg"
          onClick={handleSaveSettings}
          className="px-8 font-bold shadow-md bg-[var(--primary-main)] hover:bg-[var(--primary-dark)] text-white"
        >
          Lưu cấu cấu hình hệ thống
        </Button>
        <Button
          size="lg"
          variant="outline"
          onClick={handleResetSettings}
          className="px-6 font-semibold"
        >
          Khôi phục mặc định
        </Button>
        {saveSuccess && (
          <span className="text-sm font-bold text-[var(--green)] flex items-center gap-1.5 animate-in fade-in slide-in-from-left-2">
            <span className="w-2 h-2 rounded-full bg-[var(--green)]" />
            Đã áp dụng thay đổi
          </span>
        )}
      </div>

      {/* ── AI Integration (Disabled for now as per instructions) ───────────────────────────────────────── */}
      <div className="bg-[var(--bg-raised)] border border-dashed border-[var(--border-bright)] rounded-xl p-6 mb-6 opacity-80">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-[var(--text-primary)]">Tích hợp AI</h2>
          <Badge variant="secondary" className="bg-[var(--bg-elevated)]">LATER</Badge>
        </div>

        <div className="space-y-5 grayscale">
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Gemini API Key</Label>
            <Input type="password" placeholder="AIza..." disabled className="h-10 text-base" />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-semibold">OpenAI API Key</Label>
            <Input type="password" placeholder="sk-..." disabled className="h-10 text-base" />
          </div>
        </div>
      </div>

      <Separator className="my-6" />

      {/* ── Danger zone ──────────────────────────────────────────── */}
      <div className="bg-card border border-destructive/30 rounded-lg p-5">
        <h2 className="text-sm font-semibold text-destructive mb-2">Vùng nguy hiểm</h2>
        <p className="text-xs text-muted-foreground mb-4">
          Xóa toàn bộ dữ liệu khỏi localStorage. Không thể hoàn tác.
        </p>
        <Button
          variant="destructive"
          size="sm"
          onClick={handleClearAll}
        >
          {confirmClear ? '⚠ Xác nhận xóa tất cả?' : 'Xóa toàn bộ dữ liệu'}
        </Button>
        {confirmClear && (
          <Button
            variant="ghost"
            size="sm"
            className="ml-2"
            onClick={() => setConfirmClear(false)}
          >
            Hủy
          </Button>
        )}
      </div>
    </div>
  )
}
