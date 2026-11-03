import Image from 'next/image';
import Link from 'next/link';
import { FiArrowUpRight } from 'react-icons/fi';
import type { Product } from '@/data/products';
import FavouriteButton from './Favourites';

export default function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  return <article className="product-card">
    <div className="product-visual"><Link href={`/urun-katalogu/${product.slug}`} className="product-photo-link" aria-label={`${product.name} ürününü keşfet`}><Image src={product.image} alt={`${product.name} parfümü`} fill sizes="(max-width: 600px) 46vw, (max-width: 1000px) 44vw, 23vw" priority={priority} /></Link>
      {product.badge && <span className="product-badge">{product.badge}</span>}
      <FavouriteButton id={product.id} name={product.name} />
      <Link className="product-discover" href={`/urun-katalogu/${product.slug}`}>Ürünü keşfet <FiArrowUpRight /></Link>
    </div>
    <Link href={`/urun-katalogu/${product.slug}`} className="product-title"><h3>{product.name}</h3><FiArrowUpRight /></Link>
  </article>;
}
