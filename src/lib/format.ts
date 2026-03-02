// src/lib/format.ts
// Hàm format số/ngày – tách riêng để tránh bị shadcn init ghi đè utils.ts

/**
 * Format số theo locale tiếng Việt
 * @example fmtNumber(12345.678, 2) → "12.345,68"
 */
export function fmtNumber(n: number, decimals = 2): string {
  if (!Number.isFinite(n)) return '0'
  return n.toLocaleString('vi-VN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

/** Format ngày dd/MM/yyyy */
export function fmtDate(iso: string): string {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

/** Format ngày giờ dd/MM/yyyy HH:mm */
export function fmtDateTime(iso: string): string {
  if (!iso) return ''
  return new Date(iso).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/** Thời gian tương đối */
export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return 'Vừa xong'
  if (mins < 60) return `${mins} phút trước`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs} giờ trước`
  const days = Math.floor(hrs / 24)
  if (days < 30) return `${days} ngày trước`
  return fmtDate(iso)
}
