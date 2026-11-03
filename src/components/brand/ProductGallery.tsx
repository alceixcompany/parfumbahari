'use client';

import Image from 'next/image';
import { useRef, useState } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import type { Product } from '@/data/products';
import { getProductImages } from '@/lib/productImages';

export default function ProductGallery({ product }: { product: Product }) {
  const photos = getProductImages(product);
  const [selected, setSelected] = useState(0);
  const touchX = useRef<number | null>(null);
  const multiple = photos.length > 1;
  const move = (step: number) => setSelected(current => (current + step + photos.length) % photos.length);

  return <div className="product-gallery" role="region" aria-label={`${product.name} fotoğrafları`} tabIndex={multiple ? 0 : undefined}
    onKeyDown={event => {
      if (!multiple || event.target !== event.currentTarget) return;
      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { event.preventDefault(); move(event.key === 'ArrowRight' ? 1 : -1); }
      if (event.key === 'Home' || event.key === 'End') { event.preventDefault(); setSelected(event.key === 'Home' ? 0 : photos.length - 1); }
    }}>
    <div className="product-detail-photo" onTouchStart={event => { touchX.current = event.touches[0]?.clientX ?? null; }}
      onTouchEnd={event => { const end = event.changedTouches[0]?.clientX; if (multiple && end !== undefined && touchX.current !== null && Math.abs(end - touchX.current) > 45) move(end < touchX.current ? 1 : -1); touchX.current = null; }}>
      <Image src={photos[selected] || product.image} alt={`${product.name} — ${selected + 1}. ürün fotoğrafı`} fill priority={selected === 0} sizes="(max-width: 760px) 100vw, 48vw" draggable={false} />
      {product.badge && <span className="product-badge">{product.badge}</span>}
      {multiple && <>
        <button type="button" className="product-photo-arrow previous" aria-label="Önceki fotoğraf" onClick={() => move(-1)}><FiChevronLeft /></button>
        <button type="button" className="product-photo-arrow next" aria-label="Sonraki fotoğraf" onClick={() => move(1)}><FiChevronRight /></button>
        <span className="product-photo-counter" role="status" aria-live="polite">{selected + 1} / {photos.length}</span>
      </>}
    </div>
    {multiple && <div className="product-photo-thumbnails" aria-label="Ürün fotoğrafı seçimi">{photos.map((src, index) => <button type="button" key={src} aria-label={`${index + 1}. fotoğrafı göster`} aria-pressed={selected === index} onClick={() => setSelected(index)}>
      <Image src={src} alt="" width={120} height={144} sizes="90px" />
    </button>)}</div>}
  </div>;
}
