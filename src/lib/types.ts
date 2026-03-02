// src/lib/types.ts
// Định nghĩa toàn bộ interface dùng chung trong ứng dụng

// ─── Duct Item ────────────────────────────────────────────────────────────────

export type DuctItemType =
  | 'straight_square'   // Ống thẳng
  | 'straight_1_end'    // Ống thẳng 1 đầu
  | 'elbow_90_radius'   // Cút 90 độ lượn tròn
  | 'elbow_90_square'   // Cút vuông 90 độ
  | 'reducer_square'    // Côn thu
  | 'reducer_sq_rd'     // Côn thu vuông-tròn
  | 'shoe_tap'          // Chân rẽ
  | 'z_offset_radius'   // Z lượn
  | 'offset_round_deg'  // Chếch lượn tròn theo độ
  | 'offset_square'     // Chếch lượn vuông
  | 'plenum_box'        // Box kín 6 mặt
  | 'other'             // Khác

export type ConnectorType =
  | 'tdc'           // TDC (50mm)
  | 'bich_v30'      // Bích V30 (10mm)
  | 'bich_v40'      // Bích V40 (10mm)
  | 'bich_v50'      // Bích V50 (10mm)
  | 'bit_dau'       // Bịt đầu (30mm)
  | 'be_chan_30'    // Bẻ chân 30 (30mm)
  | 'nep_c'         // Nẹp C (10mm)
  | 'de_thang'      // Để thẳng (0mm)
  | 'none'

export type SeamType =
  | 'don_kep'       // Đơn-kép (8mm-30mm) -> Tổng 38mm (0.038)
  | 'noi_c'         // Nối C (10mm-10mm) -> Tổng 20mm (0.02)
  | 'han_15'        // Hàn 15 (15mm) -> Tổng 15mm (0.015)
  | 'pittsburgh'    // Mặc định (0.04)

export interface DuctItem {
  id: string
  type: DuctItemType
  /**
   * Kích thước dạng chuỗi, các chiều cách nhau bởi 'x'
   * Ví dụ: "500x400x12000" (W×H×L) hoặc "400x12000" (D×L cho ống tròn)
   */
  dimensions: string
  quantity: number
  /** Độ dày tôn (mm). Mặc định 0.75 */
  thickness: number
  /** Đơn vị: "cái" | "bộ" | "m" */
  unit: string
  /** Diện tích bề mặt m² / 1 đơn vị (tính tự động) */
  area: number
  /** Trọng lượng kg / 1 đơn vị (tính tự động) */
  weight: number
  note?: string
  /** Kết nối đầu 1/2 */
  conn1?: ConnectorType
  conn2?: ConnectorType
  /** Mí ghép */
  seam?: SeamType
}

// ─── Project ──────────────────────────────────────────────────────────────────

export interface Project {
  id: string
  name: string
  description?: string
  createdAt: string   // ISO 8601
  updatedAt?: string  // ISO 8601
  items: DuctItem[]
}

export interface AppSettings {
  // Connector Allowances (m)
  connTDC: number
  connV30: number
  connV40: number
  connV50: number
  connBitDau: number
  connBeChan30: number
  connNepC: number
  connDeThang: number

  // Seam Allowances (m)
  seamDonKep: number
  seamNoiC: number
  seamHan15: number
  seamPittsburgh: number

  defaultDensity: number // kg/m3 (mặc định 7850)
  defaultThickness: number
}

// ─── Stats ────────────────────────────────────────────────────────────────────

export interface ProjectStats {
  totalItems: number
  totalArea: number    // m² (tổng có nhân số lượng)
  totalWeight: number  // kg (tổng có nhân số lượng)
}

export interface GlobalStats extends ProjectStats {
  totalProjects: number
}

// ─── Form types (Zod schema output) ──────────────────────────────────────────

export type DuctItemFormValues = Omit<DuctItem, 'id' | 'area' | 'weight'>
