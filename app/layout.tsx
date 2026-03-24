import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AurexConnect — Premium Investment Platform',
  description: 'Invest with confidence. AurexConnect delivers high-yield returns on crypto, forex, and hedge funds.',
  keywords: 'investment, crypto, forex, hedge funds, ROI, AurexConnect',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#1a1a2e',
                color: '#fff',
                border: '1px solid #c9a84c',
              },
            }}
          />
        </Providers>
      </body>
    </html>
  )
}
