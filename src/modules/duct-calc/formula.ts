// src/modules/duct-calc/formula.ts
import { DEFAULT_FORMULAS } from './constants'
import type { DuctItemType } from '../../lib/types'

const STORAGE_KEY = 'ductpro_formulas'

/** Lấy danh sách công thức hiện tại (từ LocalStorage hoặc fallback) */
export function getFormulas(): Record<string, string> {
    if (typeof window === 'undefined') return { ...DEFAULT_FORMULAS }
    try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) return { ...DEFAULT_FORMULAS, ...JSON.parse(stored) }
    } catch (e) {
        console.error('Lỗi khi đọc công thức từ localStorage', e)
    }
    return { ...DEFAULT_FORMULAS }
}

/** Lưu danh sách công thức vào hệ thống */
export function saveFormulas(formulas: Record<string, string>) {
    if (typeof window === 'undefined') return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(formulas))
}

/** Đặt lại danh sách công thức về mặc định */
export function resetFormulas() {
    saveFormulas({ ...DEFAULT_FORMULAS })
}

/**
 * Hàm biên dịch và chạy công thức nội bộ an toàn (evalute mathematics expression).
 * Biến đầu vào khả dụng: W, H, L, D, W2, H2 
 * Hàm sử dụng new Function để thực thi biểu thức toán học.
 */
export function evaluateFormula(type: DuctItemType, dims: any): number {
    const formulas = getFormulas()
    const formulaStr = formulas[type] || '1'

    try {
        const W = Number(dims.width) || 0
        const H = Number(dims.height) || 0
        const L = Number(dims.length) || 0
        const D = Number(dims.diameter) || 0
        const W2 = Number(dims.width2) || 0
        const H2 = Number(dims.height2) || 0
        const R = Number(dims.radius) || 150
        const E = Number(dims.auxValue) || 0

        // Sử dụng new Function thay vì eval để hạn chế scope và an toàn hơn (vẫn cho phép Math context)
        const fn = new Function('W', 'H', 'L', 'D', 'W2', 'H2', 'R', 'E', 'Math', `
      try {
        const result = (${formulaStr});
        // Không cho phép output NaN hay Negative
        if (isNaN(result) || result < 0) return 0;
        return Number(result);
      } catch (err) {
        return 0; // Fallback khi cú pháp sai
      }
    `)

        return fn(W, H, L, D, W2, H2, R, E, Math)
    } catch (error) {
        console.error(`Lỗi khi tính toán công thức cho loại ${type}:`, error)
        return 0
    }
}
