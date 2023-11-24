
import { ClerkProvider } from '@clerk/nextjs'
import '../globals.css'

export const metadata = {
  title: 'Threads',
  description: 'A Next.js 13 Threads Application',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
    <html lang="en">
      <body>{children}</body>
    </html>
    </ClerkProvider>
  )
}

