# DuctPro – Bóc Tách Ống Gió HVAC Pro

> Công cụ bóc tách khối lượng ống gió – offline-first, tích hợp AI độc đáo. Sản phẩm sẵn sàng cho kiến trúc Desktop (Electron) và trình duyệt.

## Stack Công Nghệ

- **Framework**: Next.js 15 (App Router) + TypeScript
- **UI/UX**: Tailwind CSS + shadcn/ui
- **Kiến trúc Engine**: Pipeline Orchestrator (Bao gồm Parse, Rule, Calc, Assembly, Nesting Engines)
- **AI Đóng gói**: Gọi API tới LLMs với hỗ trợ xử lý hàng loạt (Batch Parsing)
- **Tối ưu Hóa (Nesting)**: Bin-Packing Shelf Algorithm & Dynamic Sheet Optimization
- **Export Data**: xlsx (xuất Excel), jsPDF (xuất PDF in ấn), sử dụng hộp thoại Native của Electron
- **Form & Validation**: Zod + react-hook-form

---

## Cài đặt & chạy nhanh

```bash
# 1. Cài dependencies
npm install

# 2. Chạy web (development mode)
npm run dev

# 3. Chạy môi trường phân tích TypeScript Lint
npm run lint

# 4. Build môi trường Production
npm run build
```

*(Đối với Electron, có thể sử dụng các lệnh tương ứng như `npm run electron:dev` và `npm run electron:build` được thiết lập ở cấu hình gốc).*

---

## Cấu trúc Kiến Trúc (Thư mục)
Hệ thống sử dụng một Pipeline 5 bước độc lập siêu sạch:

```
src/
├── app/                  # Chứa Routing và View của Next.js
├── components/           # UI Components (DuctTable, DuctForm, ProjectCard...)
├── hooks/                # Trạng thái, Lưu trữ cục bộ và Bộ nhớ đệm (useProjects, useProject)
├── lib/                  # Utilities và Shared Types
└── modules/              # Trái tim của ứng dụng: Orchestrator Pipeline
    ├── project-engine/   # Orchestrator trung tâm quản lý luồng dữ liệu
    ├── parse-engine/     # Regex & AI Text Parser (Batch support)
    ├── rule-engine/      # Áp dụng các quy tắc tự động (khớp cổ bích, mí ghép)
    ├── calculation-engine# Tính toán công thức phức tạp & Adaptive Correction Factor
    ├── assembly-engine/  # Bóc tách phụ kiện, vật tư phụ (Bulong, Ron...)
    ├── nesting-engine/   # Tối ưu hóa cắt tôn (Dynamic Length Sheet)
    ├── export/           # Trình tạo file Excel và PDF báo cáo
    └── cache/            # Bộ nhớ đệm nhiều tầng giúp tối ưu tốc độ Render
```

**(Chi tiết hơn vui lòng đọc thêm `ARCHITECTURE.md` - nếu có).*

---

## Khả năng Cốt lõi (Các tiện ích Tính Toán)
Hệ thống đã loại bỏ việc mã hóa cứng và hỗ trợ linh hoạt hầu hết các loại phụ kiện ống gió tiêu chuẩn:
1. Ống thẳng vuông, Ống thẳng tròn
2. Ống thẳng bớt 1 đầu (bịt 1 đầu)
3. Cút 90 độ, 45 độ (Vuông và Tròn)
4. Côn thu, Côn thu vuông tròn
5. Chân rẽ (Gót giày)
6. Z lượn
7. Hộp gió, Tê Ngã

**Trọng lượng (kg):** `Diện tích (m²) × (Độ dày (mm)/1000) × Khối lượng riêng (kg/m³ - mặc định 7850)` 

---

## Roadmap

### Đã hoàn thành (Done)
- [x] Hệ thống Rule Engine cấu hình động (mí ghép, phụ kiện).
- [x] AI parse text xử lý dữ liệu hàng loạt (Batch Parsing - Gemini / OpenAI).
- [x] Import dữ liệu đầu vào chuẩn xác từ Excel.
- [x] Xuất báo cáo PDF chi tiết.
- [x] Tích hợp Electron native file dialog cho việc Export.
- [x] Bộ công thức Cút / Tê / Reducer chính xác 100% dựa trên Geometry.
- [x] Engine tối ưu xếp ván (Nesting) với chiều dài động.
- [x] Module sửa lỗi thực tế (Adaptive Correction) áp dụng học máy cơ bản.
- [x] Đóng băng phiên bản bóc tách dự án (Determinism).
- [x] Loại bỏ 100% cảnh báo Linter và mã TS bất định (`any`).

### Lên kế hoạch (To-Do)
- [ ] electron-store khép kín thay vì localStorage (nếu đóng gói hoàn toàn bản quyền).
- [ ] Tính năng Sync Cloud (Firebase / Supabase) để đồng bộ đa thiết bị.
- [ ] API Fuzzing & Security Audits cho đường dẫn truy xuất máy chủ.
