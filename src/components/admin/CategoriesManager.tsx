import Link from 'next/link';
import { FiArrowLeft, FiArrowUpRight } from 'react-icons/fi';
import { DEFAULT_PRODUCT_CATEGORIES } from '@/lib/productCategories';

export default function CategoriesManager() {
  return <>
    <Link href="/admin/urunler" className="admin-text-link"><FiArrowLeft /> Ürünlere dön</Link>
    <div className="admin-page-heading"><div><p className="admin-eyebrow">KATALOG DÜZENİ</p><h1>Ürün kategorileri</h1><p>Ürün düzenleyicisinden Bay, Bayan veya Unisex kategorisini seçin.</p></div></div>
    <section className="admin-panel">{DEFAULT_PRODUCT_CATEGORIES.map(category => <div className="admin-category-row" key={category.id}><strong>{category.name}</strong><Link className="admin-text-link" href={`/urun-katalogu?kategori=${category.id}`} target="_blank">Sitede görüntüle <FiArrowUpRight /></Link></div>)}</section>
  </>;
}
