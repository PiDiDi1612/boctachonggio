// src/app/layout.tsx
import type { Metadata } from 'next'
import './globals.css'
import { Sidebar } from '@/components/layout/Sidebar'
import { AppInitializer } from '@/components/layout/AppInitializer'

export const metadata: Metadata = {
  title: 'DuctPro — Bóc Tách Ống Gió HVAC Chuyên Nghiệp',
  description: 'Công cụ bóc tách khối lượng ống gió HVAC quy mô công nghiệp. Hỗ trợ AI Parsing, Nesting linh hoạt và tự động học sai số sản xuất.',
  keywords: ['HVAC', 'Bóc tách ống gió', 'Duct takeoff', 'Tính toán ống gió', 'Nesting', 'Sản xuất ống gió'],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body style={{
        background: 'var(--bg-base)',
        color: 'var(--text-primary)',
        fontFamily: 'var(--font-body)',
        display: 'flex',
        height: '100vh',
        overflow: 'hidden',
        transition: 'background 0.3s ease, color 0.3s ease'
      }}>
        <AppInitializer />
        <Sidebar />
        <div style={{ flex: 1, marginLeft: '224px', display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0, background: 'var(--bg-void)' }}>
          {children}
        </div>
      </body>
    </html>
  )
}
