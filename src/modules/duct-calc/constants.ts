// src/modules/duct-calc/constants.ts

/** Tỷ trọng thép tấm (tôn đen): 7.85 kg/m²/mm */
export const STEEL_DENSITY = 7.85

/** Độ dày mặc định (mm) */
export const DEFAULT_THICKNESS = 0.75

/** Danh sách độ dày tôn tiêu chuẩn */
export const THICKNESS_OPTIONS = [
  { value: 0.58, label: '0.58 mm' },
  { value: 0.75, label: '0.75 mm' },
  { value: 0.95, label: '0.95 mm' },
  { value: 1.15, label: '1.15 mm' },
  { value: 1.2, label: '1.2 mm' },
] as const

/** Nhãn tiếng Việt cho từng loại ống */
export const DUCT_TYPE_LABELS: Record<string, string> = {
  straight_square: 'Ống thẳng',
  straight_1_end: 'Ống thẳng 1 đầu',
  elbow_90_radius: 'Cút 90 độ lượn tròn',
  elbow_90_square: 'Cút vuông 90 độ',
  reducer_square: 'Côn thu',
  reducer_sq_rd: 'Côn thu vuông-tròn',
  shoe_tap: 'Chân rẽ',
  z_offset_radius: 'Z lượn',
  offset_round_deg: 'Chếch 45 độ tròn',
  offset_square: 'Chếch 45 độ vuông',
  plenum_box: 'Box kín 6 mặt',
  other: 'Khác',
}

/** Màu badge theo loại */
export const DUCT_TYPE_BADGE: Record<string, string> = {
  straight_square: 'blue',
  straight_1_end: 'blue',
  elbow_90_radius: 'green',
  elbow_90_square: 'green',
  reducer_square: 'yellow',
  reducer_sq_rd: 'yellow',
  shoe_tap: 'default',
  z_offset_radius: 'default',
  offset_round_deg: 'default',
  offset_square: 'default',
  plenum_box: 'default',
  other: 'default',
}

/** Công thức mặc định (giữ chỗ) = 1 m² cho tất cả */
export const DEFAULT_FORMULAS: Record<string, string> = {
  straight_square: '(2*(W/1000+H/1000)+0.04)*(L/1000+0.1)',
  straight_1_end: '((2*(W/1000+H/1000)+0.04)*(L/1000+0.05)) + ((W/1000+0.04)*(H/1000+0.04))',
  elbow_90_radius: '(Math.PI/2*(Math.pow(R/1000+H/1000,2)-Math.pow(R/1000,2))) + ((W/1000+0.04)*(Math.PI/2*(R/1000+H/2000)+0.1))',
  elbow_90_square: '(2*(Math.pow(R/1000+H/1000,2)-Math.pow(R/1000,2))) + ((W/1000+0.04)*(2*(R/1000+H/2000)+0.1))',
  reducer_square: '((W/1000+H/1000+W2/1000+H2/1000)+0.04)*(Math.sqrt(Math.pow(L/1000,2)+Math.pow(E/1000,2))+0.1)',
  reducer_sq_rd: '((W/1000+H/1000+(Math.PI*D/1000)/2)+0.02)*(Math.sqrt(Math.pow(L/1000,2)+Math.pow(E/1000,2))+0.07)',
  shoe_tap: '(2*(W2/1000+H2/1000)+0.04)*(L/1000+0.08)',
  z_offset_radius: '(2*(W/1000+H/1000)+0.04)*(Math.sqrt(Math.pow(L/1000,2)+Math.pow(E/1000,2))+0.1)',
  offset_round_deg: '(Math.PI/4*(Math.pow(R/1000+H/1000,2)-Math.pow(R/1000,2))) + ((W/1000+0.04)*(Math.PI/4*(R/1000+H/2000)+0.1))',
  offset_square: '(2*(W/1000+H/1000)+0.04)*(L/1000+0.1)',
  plenum_box: '2*(W/1000+H/1000)*L/1000',
  other: '1',
}

/** Đơn vị tính */
export const UNIT_OPTIONS = ['cái', 'bộ', 'm'] as const

/** Tùy chọn Connector */
export const CONNECTOR_OPTIONS = [
  { value: 'tdc', label: 'TDC (50mm)' },
  { value: 'bich_v30', label: 'Bích V30 (10mm)' },
  { value: 'bich_v40', label: 'Bích V40 (10mm)' },
  { value: 'bich_v50', label: 'Bích V50 (10mm)' },
  { value: 'bit_dau', label: 'Bịt đầu (30mm)' },
  { value: 'be_chan_30', label: 'Bẻ chân 30 (30mm)' },
  { value: 'nep_c', label: 'Nẹp C (10mm)' },
  { value: 'de_thang', label: 'Để thẳng (0mm)' },
  { value: 'none', label: 'Không (0mm)' },
] as const

/** Tùy chọn Mí ghép */
export const SEAM_OPTIONS = [
  { value: 'don_kep', label: 'Đơn-kép (38mm)' },
  { value: 'noi_c', label: 'Nối C (20mm)' },
  { value: 'han_15', label: 'Hàn 15 (15mm)' },
  { value: 'pittsburgh', label: 'Mặc định (40mm)' },
] as const
