import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Research Interview Tool',
  description: 'AI-powered qualitative research interview platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-stone-900 font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
