import Link from 'next/link';
import { FiArrowUpRight } from 'react-icons/fi';
import type { Product } from '@/data/products';
import FavouriteButton from './Favourites';

export default function ProductExperience({ product }: { product: Product }) {
  return <div className="product-detail-actions"><Link className="button" href="/urun-katalogu">Koleksiyonu keşfet <FiArrowUpRight /></Link><FavouriteButton id={product.id} name={product.name} labelled /></div>;
}
