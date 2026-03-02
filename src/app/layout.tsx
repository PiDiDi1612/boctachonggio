// src/app/layout.tsx
import type { Metadata } from 'next'
import './globals.css'
import { Sidebar } from '@/components/layout/Sidebar'

export const metadata: Metadata = {
  title: 'DuctPro — Bóc Tách Ống Gió HVAC',
  description: 'Industrial-grade HVAC duct takeoff tool',
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
        <Sidebar />
        <div style={{ flex: 1, marginLeft: '224px', display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0, background: 'var(--bg-void)' }}>
          {children}
        </div>
      </body>
    </html>
  )
}
