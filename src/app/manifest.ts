import type { MetadataRoute } from 'next';
import { SEO_CONFIG } from '@/lib/seo';
export default function manifest(): MetadataRoute.Manifest { return { name: SEO_CONFIG.name, short_name: 'Parfum Bahari', description: SEO_CONFIG.shortDescription, lang: 'tr', start_url: '/', display: 'standalone', background_color: '#f9f6ef', theme_color: '#632b3c', icons: [{ src: '/parfum-bahari/icon.png', sizes: '192x192', type: 'image/png' }] }; }
