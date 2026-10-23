import type { Metadata } from 'next'
import AdminLayoutWrapper from './AdminLayoutWrapper'

export const metadata: Metadata = {
  title: { absolute: 'Yönetim Paneli | Parfum Bahari' },
  description: 'Parfum Bahari yönetim paneli.',
  alternates: { canonical: null },
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
}

export default AdminLayoutWrapper
