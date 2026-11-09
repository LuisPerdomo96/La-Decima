import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { Sidebar } from '@/components/layout/app-sidebar'
import { MobileNav } from '@/components/layout/mobile-nav'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'La Décima | Clubes de fidelidad',
  description: 'Programas de lealtad digitales para negocios locales.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <div className="relative flex min-h-screen bg-background">
          {/* Sidebar: SOLO desktop (hidden en mobile) */}
          <div className="hidden md:block">
            <Sidebar />
          </div>

          {/* Contenido principal */}
          <div className="flex-1 pb-20 md:pb-0">
            {children}
          </div>

          {/* Bottom Nav: SOLO mobile (hidden en desktop) */}
          <div className="md:hidden">
            <MobileNav />
          </div>
        </div>
      </body>
    </html>
  )
}