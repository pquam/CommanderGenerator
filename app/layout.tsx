import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Commander Generator',
  description: 'Generate a new legendary creature card for Magic: The Gathering Commander',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

