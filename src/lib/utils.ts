// src/lib/utils.ts
// CHỈ chứa cn() + genId() – shadcn/ui init có thể ghi đè file này
// Các hàm format đã được chuyển sang src/lib/format.ts

import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** Merge Tailwind classes – required by shadcn/ui */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Sinh ID ngắn (timestamp base36 + random) */
export function genId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
}

// Re-export format helpers để các file cũ import từ '@/lib/utils' vẫn hoạt động
export { fmtNumber, fmtDate, fmtDateTime, timeAgo } from './format'
