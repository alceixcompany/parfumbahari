import Image from 'next/image';
import Link from 'next/link';
import { FiArrowUpRight } from 'react-icons/fi';
import type { Product } from '@/data/products';
import FavouriteButton from './Favourites';
export default function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  return <article className="product-card"><div className={`product-visual family-${product.family}`}><Link href={`/urun-katalogu/${product.slug}`} className="product-photo-link" aria-label={`${product.name} ürününü keşfet`}><Image src={product.image} alt={`${product.name} — ${product.family.toLocaleLowerCase('tr')} Eau de Parfum`} fill sizes="(max-width: 600px) 46vw, (max-width: 1000px) 44vw, 23vw" priority={priority} /></Link>{product.badge && <span className="product-badge">{product.badge}</span>}<FavouriteButton id={product.id} name={product.name} /><Link className="product-discover" href={`/urun-katalogu/${product.slug}`}>Kokuyu keşfet <FiArrowUpRight /></Link></div><div className="product-meta"><span>{product.family} <i /> {product.category}</span><span>{product.sizes.join(' / ')} ml</span></div><Link href={`/urun-katalogu/${product.slug}`} className="product-title"><h3>{product.name}</h3><FiArrowUpRight /></Link><p className="product-notes">{[...product.heartNotes.slice(0, 1), ...product.baseNotes.slice(0, 1), ...product.topNotes.slice(0, 1)].join(' · ')}</p></article>;
}
