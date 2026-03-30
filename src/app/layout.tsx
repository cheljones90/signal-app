import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Signal — Persona-Driven Usability Testing',
  description: 'Test your designs before a single user session is scheduled.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  )
}