import { calculateItem } from '../calculation-engine/calculateItem'
import type { MaterialType, ParsedParams } from '../calculation-engine/types'

export interface DuctDimensions {
  width?: number  // W1 / W
  height?: number  // H1 / H
  length?: number  // L
  diameter?: number  // D / d
  width2?: number  // W2
  height2?: number  // H2
  radius?: number  // R / r
  auxValue?: number  // E
  conn1?: string
  conn2?: string
  seam?: string
}

// ... (các hàm areaSquareDuct, etc. giữ lại làm module nội bộ nếu cần)

/**
 * @param type    Loại ống (DuctItemType)
 * @param dims    Object kích thước
 * @param settings Cấu hình tính toán
 * @returns       Diện tích m² (đã chia 1_000_000 hoặc theo công thức m)
 */
import type { AppSettings, ConnectorType, SeamType } from '../../lib/types'

export function calcArea(
  type: string,
  dims: DuctDimensions,
  settings: AppSettings,
  connectors?: { conn1?: ConnectorType; conn2?: ConnectorType }
): number {
  // Map UI type (DuctItemType) to Engine type (MaterialType)
  const typeMap: Record<string, MaterialType> = {
    'straight_square': 'ong_thang',
    'straight_1_end': 'ong_thang_bit_1_dau',
    'elbow_90_radius': 'co_90_tron',
    'elbow_90_square': 'co_90_vuong',
    'reducer_square': 'con_thu',
    'reducer_sq_rd': 'con_thu_vuong_tron',
    'shoe_tap': 'chan_re',
    'z_offset_radius': 'z_luon',
    'offset_round_deg': 'chech_45_tron',
    'offset_square': 'chech_45_vuong',
    'plenum_box': 'box_kin',
  }

  const engineType = typeMap[type] || 'unknown'

  // Map UI dimensions to Engine params
  const params: ParsedParams = {
    W1: dims.width ?? null,
    H1: dims.height ?? null,
    W2: dims.width2 ?? null,
    H2: dims.height2 ?? null,
    W: dims.width ?? null,
    H: dims.height ?? null,
    L: dims.length ?? null,
    r: dims.radius ?? null,
    d: dims.diameter ?? null,
    E: dims.auxValue ?? null,
  }

  // Use the new hardcoded engine with settings and connectors
  const result = calculateItem(
    engineType,
    params,
    1,
    settings,
    {
      conn1: connectors?.conn1,
      conn2: connectors?.conn2,
      seam: dims.seam as SeamType
    }
  )
  return result.area_m2
}
