import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { FiArrowLeft, FiArrowUpRight } from 'react-icons/fi';
import { getPublishedProduct, getPublishedProducts, getPublishedProductCategories } from '@/lib/publicContent';
import { availableCategories, productClassification } from '@/lib/productCategories';
import { getProductImages } from '@/lib/productImages';
import { getBreadcrumbSchema, pageMetadata, SITE_URL } from '@/lib/seo';
import ProductExperience from '@/components/brand/ProductExperience';
import ProductGallery from '@/components/brand/ProductGallery';
import ProductCard from '@/components/brand/ProductCard';
import { DiscoveryBanner } from '@/components/brand/Sections';

type Props = { params: Promise<{ slug: string }> };
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getPublishedProduct((await params).slug);
  return product ? pageMetadata({ title: product.name, description: product.story.trim().replace(/\s+/g, ' ').slice(0, 160) || `${product.name} ürün fotoğraflarını ve detaylarını Parfum Bahari kataloğunda inceleyin.`, path: `/urun-katalogu/${product.slug}`, image: product.image }) : { title: 'Ürün bulunamadı', robots: { index: false, follow: false } };
}

export default async function ProductPage({ params }: Props) {
  const product = await getPublishedProduct((await params).slug);
  if (!product) notFound();
  const related = (await getPublishedProducts()).filter(item => item.id !== product.id).slice(0, 3);
  const categories = availableCategories(await getPublishedProductCategories());
  const classification = productClassification(product);
  const category = categories.find(item => item.id === classification.categoryId);
  const subcategory = categories.find(item => item.id === classification.subcategoryId && item.parentId === category?.id);
  const schema = [getBreadcrumbSchema([{ name: 'Ürün Kataloğu', path: '/urun-katalogu' }, { name: product.name, path: `/urun-katalogu/${product.slug}` }]), {
    '@context': 'https://schema.org', '@type': 'Product', name: product.name, ...(product.story ? { description: product.story } : {}),
    image: getProductImages(product).map(image => new URL(image, SITE_URL).href),
    brand: { '@type': 'Brand', name: 'Parfum Bahari' },
  }];
  return <main id="main">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }} />
    <div className="container detail-breadcrumb"><Link href="/urun-katalogu"><FiArrowLeft /> Koleksiyona dön</Link><span>Ürün Kataloğu / {product.name}</span></div>
    <section className="container product-detail">
      <ProductGallery key={product.id} product={product} />
      <div className="product-detail-copy"><p className="eyebrow">PARFUM BAHARI</p><h1>{product.name}</h1>{product.concentration && <p className="detail-concentration">{product.concentration}</p>}{classification.fragranceBrand && <p className="product-brand-name">{classification.fragranceBrand}</p>}{category && <nav className="product-category-breadcrumb" aria-label="Ürün kategorisi"><Link href={`/urun-katalogu?kategori=${category.id}`}>{category.name}</Link>{subcategory && <><span>/</span><Link href={`/urun-katalogu?kategori=${category.id}&alt=${subcategory.id}`}>{subcategory.name}</Link></>}</nav>}<ProductExperience product={product} />
        {product.story && <div className="detail-accordions"><details open><summary>Ürün hakkında <span>+</span></summary><p>{product.story}</p></details></div>}
      </div>
    </section>
    <section className="section"><div className="container"><div className="section-heading"><div><p className="eyebrow">KEŞFE DEVAM EDİN</p><h2>Belki de <em>bir sonraki kokunuz.</em></h2></div><Link className="text-link" href="/urun-katalogu">Tüm koleksiyon <FiArrowUpRight /></Link></div><div className="product-grid related-grid">{related.map(item => <ProductCard product={item} key={item.id} />)}</div><p className="catalogue-footnote">Ürün ve görseller koleksiyon konsepti için hazırlanmıştır. Nihai formül, ambalaj ve bulunabilirlik bilgileri marka tarafından teyit edilir.</p></div></section>
    <DiscoveryBanner />
  </main>;
}
