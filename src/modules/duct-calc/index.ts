// src/modules/duct-calc/index.ts
// Public API của module tính toán ống gió

export * from './area'
export * from './weight'
export * from './constants'

import { calcArea, type DuctDimensions } from './area'
import { calcWeight } from './weight'
import { getSettings } from '@/lib/storage'
import type { DuctItem, DuctItemType } from '../../lib/types'

// Mở rộng DuctDimensions để chứa thêm width2, height2
export interface ExtendedDuctDimensions extends DuctDimensions {
  width2?: number
  height2?: number
}

// ─── Parse dimension string ────────────────────────────────────────────────────

/**
 * Chúng ta mã hóa các kích thước vào một chuỗi duy nhất cách nhau bởi chữ "x".
 * Thứ tự chuẩn để dễ xử lý: W x H x L x D x W2 x H2
 */
export function buildDimString(
  type: string,
  w: number,
  h: number,
  l: number,
  d: number,
  e: number = 0,
  w2: number = 0,
  h2: number = 0
): string {
  // Tiêu chuẩn Giai đoạn 12: W x H x L x D x E x W2 x H2 (7 tham số)
  return [w, h, l, d, e, w2, h2].join('x')
}

export function parseDimensions(type: string, dimStr: string): ExtendedDuctDimensions {
  if (!dimStr) return {} as ExtendedDuctDimensions // Ensure it returns the correct type even when empty
  const parts = dimStr.split('x').map(Number)

  // Fix backward compatibility cho dữ liệu cũ:
  // Cũ: straight_round was "DxL" -> parts[0]=D, parts[1]=L
  if (parts.length === 2 && type === 'straight_round') {
    return { diameter: parts[0] ?? 0, length: parts[1] ?? 0 } as ExtendedDuctDimensions
  }
  // Cũ: mouth was "WxH"
  if (parts.length === 2 && type === 'mouth') {
    return { width: parts[0] ?? 0, height: parts[1] ?? 0 } as ExtendedDuctDimensions
  }
  // Cũ: default was "WxHxL"
  if (parts.length === 3) {
    return { width: parts[0] ?? 0, height: parts[1] ?? 0, length: parts[2] ?? 0 } as ExtendedDuctDimensions
  }

  // Tiêu chuẩn Giai đoạn 12 (7 tham số)
  return {
    width: parts[0] ?? 0,
    height: parts[1] ?? 0,
    length: parts[2] ?? 0,
    diameter: parts[3] ?? 0,
    radius: parts[3] ?? 0,
    auxValue: parts[4] ?? 0,
    width2: parts[5] ?? 0,
    height2: parts[6] ?? 0,
  }
}

/**
 * Tính area + weight cho một DuctItem (Sử dụng Công thức động)
 */
export function calcItemMetrics(
  item: Pick<DuctItem, 'type' | 'dimensions' | 'thickness' | 'conn1' | 'conn2' | 'seam'>,
): { area: number; weight: number } {
  const settings = getSettings()
  const dims = parseDimensions(item.type, item.dimensions)

  // Use the NEW hardcoded calcArea with settings and connector types
  const area = calcArea(item.type, { ...dims, seam: (item as any).seam } as any, settings, {
    conn1: item.conn1,
    conn2: item.conn2
  })

  // Khối lượng = Diện tích * độ dày * tỷ trọng (lấy từ settings)
  const weight = calcWeight(area, item.thickness ?? settings.defaultThickness, settings.defaultDensity / 1000)

  return {
    area: Math.round(area * 1_000_000) / 1_000_000,
    weight: Math.round(weight * 1_000_000) / 1_000_000,
  }
}
