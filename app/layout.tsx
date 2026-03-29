import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Tatami — Gestão de Academias de Jiu-Jítsu',
  description: 'Plataforma SaaS para gestão de academias de jiu-jítsu',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body>
        {/* Belt stripe — decorative gradient top bar */}
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0,
          height: 3,
          background: 'linear-gradient(90deg, #e8503a 0%, #f5a623 50%, #2cb67d 100%)',
          zIndex: 999,
          pointerEvents: 'none',
        }}/>
        {children}
      </body>
    </html>
  )
}
