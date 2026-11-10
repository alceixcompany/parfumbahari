import { pageMetadata, getBreadcrumbSchema } from '@/lib/seo';
import { PageIntro, DiscoveryBanner } from '@/components/brand/Sections';
import Journal from '@/components/brand/Journal';
import { getPublishedPosts } from '@/lib/publicContent';
// Render on requests; the shared data cache controls Firestore reads, including during outages.
export const dynamic = 'force-dynamic';
export const metadata = pageMetadata({ title: 'Blog — Parfüm Rehberi ve İlham', description: 'Parfüm seçimi, koku notaları, mevsimlere göre parfümler ve saklama önerileri. Parfum Bahari blogunda yeni hikâyeler keşfedin.', path: '/haberler' });
export default async function JournalPage() {
  const posts = await getPublishedPosts();
  return <main id="main"><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(getBreadcrumbSchema([{ name: 'Blog', path: '/haberler' }])) }} /><PageIntro eyebrow="BLOG" title="Kokunun" emphasis="ötesinde." description="Notalar, küçük ritüeller ve ilham veren hikâyeler. Koku dünyasına biraz daha yakından bakın." />{posts.length ? <Journal posts={posts} full /> : <p className="container empty-page">Yeni hikâyeler yakında burada.</p>}<DiscoveryBanner /></main>;
}
