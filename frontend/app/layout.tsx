import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider } from 'next-themes'
import { Toaster } from 'sonner'
import { ApolloClientProvider } from '@/lib/apollo-provider'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Analytics Dashboard',
  description: 'High-performance analytics dashboard with real-time data visualization',
  keywords: ['analytics', 'dashboard', 'data visualization', 'real-time', 'GraphQL'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ApolloClientProvider>
            {children}
            <Toaster position="top-right" richColors />
          </ApolloClientProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
