import type { Metadata, Viewport } from 'next';
import './globals.css';
import './typography.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { SITE_URL, SEO_CONFIG, getBrandSchema, pageMetadata } from '@/lib/seo';
export const viewport: Viewport = { themeColor: '#602735', colorScheme: 'light', width: 'device-width', initialScale: 1 };
export const metadata: Metadata = {
  ...pageMetadata({ title: 'Parfum Bahari — Bir koku. Binbir his.', description: SEO_CONFIG.shortDescription, path: '/' }),
  metadataBase: new URL(SITE_URL), applicationName: SEO_CONFIG.name, authors: [{ name: SEO_CONFIG.name }], creator: SEO_CONFIG.name, publisher: SEO_CONFIG.name,
  category: 'Parfüm ve koku', keywords: SEO_CONFIG.keywords, manifest: '/manifest.webmanifest', icons: { icon: '/parfum-bahari/icon-pb.png', apple: '/parfum-bahari/icon-pb.png' },
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="tr" data-scroll-behavior="smooth"><body><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(getBrandSchema()).replace(/</g, '\\u003c') }} /><Header />{children}<Footer /></body></html>;
}
