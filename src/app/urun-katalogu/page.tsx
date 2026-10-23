import type { Metadata } from 'next';
import { PageIntro } from '@/components/brand/Sections';
import Catalogue from '@/components/brand/Catalogue';
import { getPublishedProducts } from '@/lib/publicContent';
import { getBreadcrumbSchema, pageMetadata, SITE_URL } from '@/lib/seo';
type Props = { searchParams: Promise<{ aile?: string; kategori?: string; q?: string; favoriler?: string; ara?: string }> };
export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams;
  return pageMetadata({ title: 'Ürün Kataloğu — Kadın, Erkek ve Unisex Parfümler', description: 'Parfum Bahari ürün kataloğu: çiçeksi, odunsu, ferah ve oryantal parfümleri keşfedin. Koku ailesi ve kullanım tercihine göre filtreleyin, parfüm notalarını inceleyin.', path: '/urun-katalogu', preview: Object.keys(params).length > 0 });
}
export default async function CataloguePage({ searchParams }: Props) {
  const [products, params] = await Promise.all([getPublishedProducts(), searchParams]);
  const schema = [getBreadcrumbSchema([{ name: 'Ürün Kataloğu', path: '/urun-katalogu' }]), { '@context': 'https://schema.org', '@type': 'ItemList', name: 'Parfum Bahari Parfüm Koleksiyonu', itemListElement: products.map((p, i) => ({ '@type': 'ListItem', position: i + 1, name: p.name, url: `${SITE_URL}/urun-katalogu/${p.slug}` })) }];
  return <main id="main"><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }} /><PageIntro eyebrow="ÜRÜN KATALOĞU" title="Kokunuz," emphasis="hikâyeniz." description="Birbirinden farklı notalar, birbirinden özel hisler. Kendinize yakın olanı keşfedin." /><Catalogue key={JSON.stringify(params)} products={products} initialFamily={params.aile} initialCategory={params.kategori} initialQuery={params.q} onlySaved={params.favoriler === '1'} autofocus={params.ara === '1'} /></main>;
}
