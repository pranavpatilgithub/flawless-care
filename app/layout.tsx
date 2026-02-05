import type { Metadata } from 'next'
import { Open_Sans } from 'next/font/google'
import './globals.css'
import Footer from '@/components/Footer'
const openSans = Open_Sans({ subsets: ['latin'], weight: ['400', '500', '700'] })

export const metadata: Metadata = {
  title: 'Hospital Management System',
  description: 'Comprehensive hospital management solution with OPD queuing, bed management, and inventory tracking',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={openSans.className}>
        {children}
        <Footer />

      </body>
    </html>
  )
}
