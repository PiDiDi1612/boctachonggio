# DuctPro – Bóc Tách Ống Gió HVAC Pro

> Công cụ bóc tách khối lượng ống gió – offline-first, sẵn sàng Electron desktop.

## Stack

- **Next.js 15** (App Router) + **TypeScript**
- **Tailwind CSS** + **shadcn/ui**
- **Electron** (desktop app wrapper)
- **xlsx** (xuất Excel)
- **Zod** + **react-hook-form** (validation form)
- Offline-first: **localStorage** (swap sang electron-store dễ dàng)

---

## Cài đặt & chạy

```bash
# 1. Cài dependencies
npm install

# 2. Khởi tạo shadcn/ui (lần đầu)
npx shadcn-ui@latest init
# → Style: Default | Base color: Zinc | CSS variables: Yes

# 3. Thêm shadcn components
npx shadcn-ui@latest add button card input table dialog select label badge separator sheet

# 4. Cài thêm react-hook-form + resolver
npm install react-hook-form @hookform/resolvers

# 5. Chạy web (dev)
npm run dev

# 6. Chạy Electron (dev) – cần Next.js đang chạy trước
npm run electron:dev

# 7. Build Electron desktop app
npm run electron:build
```

---

## Cấu trúc thư mục

```
duct-pro/
├── electron/
│   ├── main.js          # Electron main process
│   └── preload.js       # Context bridge (secure IPC)
├── src/
│   ├── app/
│   │   ├── globals.css              # Dark theme + CSS variables
│   │   ├── layout.tsx               # Root layout (Sidebar)
│   │   ├── page.tsx                 # Dashboard
│   │   ├── projects/page.tsx        # Danh sách dự án
│   │   ├── project/[id]/page.tsx    # Chi tiết dự án
│   │   └── settings/page.tsx        # Cài đặt
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   └── DashboardCard.tsx
│   │   ├── project/
│   │   │   ├── ProjectCard.tsx
│   │   │   └── CreateProjectDialog.tsx
│   │   └── duct/
│   │       ├── DuctForm.tsx         # Form + Zod validation
│   │       ├── DuctTable.tsx        # Bảng hạng mục
│   │       └── DuctSummary.tsx      # Tổng hợp stats
│   ├── lib/
│   │   ├── types.ts                 # Project, DuctItem interfaces
│   │   ├── storage.ts               # localStorage CRUD
│   │   └── utils.ts                 # genId, fmtNumber, fmtDate...
│   ├── modules/
│   │   ├── duct-calc/
│   │   │   ├── index.ts             # Public API + parseDimensions
│   │   │   ├── area.ts              # Công thức tính diện tích
│   │   │   ├── weight.ts            # Công thức tính trọng lượng
│   │   │   └── constants.ts         # Hằng số, labels
│   │   ├── duct-parser/
│   │   │   └── index.ts             # Placeholder AI parse
│   │   └── export/
│   │       ├── excel.ts             # Xuất .xlsx (2 sheets)
│   │       └── pdf.ts               # TODO: PDF
│   └── hooks/
│       ├── useProjects.ts           # Danh sách dự án + global stats
│       └── useProject.ts            # Chi tiết dự án + CRUD items
```

---

## Công thức tính toán

| Loại | Công thức diện tích |
|------|---------------------|
| Ống thẳng vuông | `2 × (W + H) × L ÷ 1,000,000` m² |
| Ống thẳng tròn | `π × D × L ÷ 1,000,000` m² |
| Cút 90° | Xấp xỉ theo chu vi × cung 90° |
| Tê, Reducer | Placeholder – TODO |
| Miệng gió | `W × H × 2.1 ÷ 1,000,000` m² |

**Trọng lượng:** `Diện tích (m²) × Độ dày (mm) × 7.85` kg

---

## Roadmap

- [ ] AI parse text (Gemini / OpenAI)
- [ ] Xuất PDF
- [ ] Công thức cút / tê / reducer chính xác
- [ ] Electron native file dialog cho export
- [ ] electron-store thay localStorage (production)
- [ ] Sync cloud (Firebase / Supabase)
- [ ] Import từ Excel / CSV
