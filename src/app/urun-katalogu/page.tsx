import type { Metadata } from 'next';
import { PageIntro } from '@/components/brand/Sections';
import Catalogue from '@/components/brand/Catalogue';
import { getPublishedProducts, getPublishedProductCategories } from '@/lib/publicContent';
import { getBreadcrumbSchema, pageMetadata, SITE_URL } from '@/lib/seo';
type Props = { searchParams: Promise<{ aile?: string; kategori?: string; q?: string; favoriler?: string; ara?: string; alt?: string; marka?: string }> };
export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams;
  return pageMetadata({ title: 'Ürün Kataloğu — Parfüm Koleksiyonu', description: 'Parfum Bahari parfüm koleksiyonunu keşfedin. Ürün fotoğraflarını ve açıklamalarını inceleyin, beğendiğiniz kokuları favorilerinize ekleyin.', path: '/urun-katalogu', preview: Object.keys(params).length > 0 });
}
export default async function CataloguePage({ searchParams }: Props) {
  const [products, categories, params] = await Promise.all([getPublishedProducts(), getPublishedProductCategories(), searchParams]);
  const schema = [getBreadcrumbSchema([{ name: 'Ürün Kataloğu', path: '/urun-katalogu' }]), { '@context': 'https://schema.org', '@type': 'ItemList', name: 'Parfum Bahari Parfüm Koleksiyonu', itemListElement: products.map((p, i) => ({ '@type': 'ListItem', position: i + 1, name: p.name, url: `${SITE_URL}/urun-katalogu/${p.slug}` })) }];
  return <main id="main"><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }} /><PageIntro eyebrow="ÜRÜN KATALOĞU" title="Kokunuz," emphasis="hikâyeniz." description="Birbirinden farklı kokular, birbirinden özel hisler. Kendinize yakın olanı keşfedin." /><Catalogue key={JSON.stringify(params)} products={products} categories={categories} initialQuery={params.q} initialCategory={params.kategori} initialSubcategory={params.alt} initialBrand={params.marka} onlySaved={params.favoriler === '1'} autofocus={params.ara === '1'} /></main>;
}
