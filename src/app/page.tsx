import Link from 'next/link';
import { FiArrowUpRight } from 'react-icons/fi';
import { HomeHero, ValuesStrip, Story, DiscoveryBanner, FAQs } from '@/components/brand/Sections';
import ProductCard from '@/components/brand/ProductCard';
import Journal from '@/components/brand/Journal';
import { getPublishedProducts, getPublishedPosts } from '@/lib/publicContent';
export default async function Home() {
  const [products, posts] = await Promise.all([getPublishedProducts(), getPublishedPosts()]);
  return <main id="main"><HomeHero /><ValuesStrip /><section className="section collection-section" id="koleksiyon"><div className="container"><div className="section-heading"><div><p className="eyebrow">PARFUM BAHARI SEÇKİSİ</p><h2>Birbirinden farklı.<br className="mobile-only" /> <em>Tam size göre.</em></h2></div><Link href="/urun-katalogu" className="text-link">Tüm koleksiyon <FiArrowUpRight /></Link></div><div className="product-grid">{products.filter(p => p.featured).slice(0, 4).map(product => <ProductCard key={product.id} product={product} />)}</div></div></section><Story /><DiscoveryBanner /><Journal posts={posts.filter(p => p.featured).slice(0, 3)} /><FAQs /></main>;
}
