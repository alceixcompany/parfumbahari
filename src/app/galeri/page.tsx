import { PageIntro, DiscoveryBanner } from '@/components/brand/Sections';
import Gallery from '@/components/brand/Gallery';
import { getPublishedGallery } from '@/lib/publicContent';
import { pageMetadata, getBreadcrumbSchema } from '@/lib/seo';
export const metadata = pageMetadata({ title: 'Koku Dünyamız — Koleksiyon ve İlham', description: 'Parfum Bahari’nin koleksiyon dünyası: çiçekler, koku notaları ve parfümlerden ilham alan görsel hikâyeler.', path: '/galeri' });
export default async function GalleryPage() { const items = await getPublishedGallery(); return <main id="main"><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(getBreadcrumbSchema([{ name: 'Koku Dünyamız', path: '/galeri' }])) }} /><PageIntro eyebrow="KOKU DÜNYAMIZ" title="Işık, doku" emphasis="ve biraz ilham." description="Kokuların ardındaki renkler, çiçekler ve küçük anlar. Koleksiyonumuza başka bir açıdan bakın." /><Gallery items={items} /><DiscoveryBanner /></main>; }
