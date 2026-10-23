'use client';
import { useState } from 'react';
import Link from 'next/link';
import { FiArrowUpRight, FiCheck } from 'react-icons/fi';
import type { Product } from '@/data/products';
import FavouriteButton from './Favourites';
export default function ProductExperience({ product }: { product: Product }) {
  const [size, setSize] = useState(product.sizes[0]);
  return <><fieldset className="size-picker"><legend>BOYUT SEÇİN</legend>{product.sizes.map(value => <button type="button" key={value} onClick={() => setSize(value)} aria-pressed={size === value} className={size === value ? 'selected' : ''}>{value} ml {size === value && <FiCheck />}</button>)}</fieldset><div className="product-detail-actions"><Link className="button" href="/urun-katalogu">Koleksiyonu keşfet <FiArrowUpRight /></Link><FavouriteButton id={product.id} name={product.name} labelled /></div><p className="detail-small-note">{size} ml · {product.concentration}. Beğendiğiniz kokuyu favorilerinize ekleyebilirsiniz.</p></>;
}
