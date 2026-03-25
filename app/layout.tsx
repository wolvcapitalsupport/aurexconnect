import type { Metadata } from 'next'
import localFont from 'next/font/local'
import './globals.css'
import { Providers } from './providers'
import { Toaster } from 'react-hot-toast'
import CryptoTicker from '@/components/CryptoTicker' 
const inter = localFont({
  src: './fonts/Inter-Variable.ttf',
  variable: '--font-inter',
})

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
          <CryptoTicker />
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
