import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ConectaLar',
  description: 'Encontre profissionais de jardinagem perto de você',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="h-full">
      <body className="min-h-full bg-[#f2f4f0]">{children}</body>
    </html>
  )
}
