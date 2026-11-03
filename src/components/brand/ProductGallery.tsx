'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { FiChevronLeft, FiChevronRight, FiX, FiZoomIn, FiZoomOut } from 'react-icons/fi';
import type { Product } from '@/data/products';
import { getProductImages } from '@/lib/productImages';

export default function ProductGallery({ product }: { product: Product }) {
  const photos = getProductImages(product);
  const [selected, setSelected] = useState(0);
  const [open, setOpen] = useState(false);
  const [magnified, setMagnified] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const touchX = useRef<number | null>(null);
  const swiped = useRef(false);
  const multiple = photos.length > 1;
  const source = photos[selected] || product.image;
  const move = (step: number) => { setSelected(current => (current + step + photos.length) % photos.length); setMagnified(false); };

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, [open]);

  function enlarge() {
    if (swiped.current) { swiped.current = false; return; }
    setMagnified(false);
    dialog.current?.showModal();
    setOpen(true);
  }
  function close() { dialog.current?.close(); }

  return <div className="product-gallery" role="region" aria-label={`${product.name} fotoğrafları`} tabIndex={multiple ? 0 : undefined}
    onKeyDown={event => {
      if (!multiple || event.target !== event.currentTarget) return;
      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { event.preventDefault(); move(event.key === 'ArrowRight' ? 1 : -1); }
      if (event.key === 'Home' || event.key === 'End') { event.preventDefault(); setSelected(event.key === 'Home' ? 0 : photos.length - 1); }
    }}>
    <div className="product-detail-photo" onTouchStart={event => { touchX.current = event.touches[0]?.clientX ?? null; swiped.current = false; }}
      onTouchEnd={event => {
        const end = event.changedTouches[0]?.clientX;
        if (multiple && end !== undefined && touchX.current !== null && Math.abs(end - touchX.current) > 45) { swiped.current = true; move(end < touchX.current ? 1 : -1); }
        touchX.current = null;
      }}>
      <button type="button" className="product-photo-open" aria-label={`${product.name} — ${selected + 1}. fotoğrafı büyüt`} aria-haspopup="dialog" onClick={enlarge}>
        <Image src={source} alt={`${product.name} — ${selected + 1}. ürün fotoğrafı`} fill priority={selected === 0} sizes="(max-width: 760px) 100vw, 48vw" draggable={false} />
        <span className="product-zoom-hint"><FiZoomIn /> Büyüt</span>
      </button>
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
    <dialog ref={dialog} className="product-lightbox" aria-label={`${product.name} — büyük fotoğraf`} onClick={event => { if (event.target === event.currentTarget) close(); }}
      onClose={() => { setOpen(false); setMagnified(false); }} onKeyDown={event => {
        if (multiple && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) { event.preventDefault(); event.stopPropagation(); move(event.key === 'ArrowRight' ? 1 : -1); }
      }}>
      {open && <div className="product-lightbox-content">
        <header className="product-lightbox-header"><h2>{product.name}</h2><span aria-live="polite">{selected + 1} / {photos.length}</span><button type="button" aria-label={magnified ? 'Fotoğrafı küçült' : 'Fotoğrafı yakınlaştır'} aria-pressed={magnified} onClick={() => setMagnified(value => !value)}>{magnified ? <FiZoomOut /> : <FiZoomIn />}</button><button type="button" autoFocus aria-label="Büyük fotoğrafı kapat" onClick={close}><FiX /></button></header>
        <div className="product-zoom-stage" key={`${selected}-${magnified}`} ref={node => {
          if (node && magnified) { node.scrollLeft = (node.scrollWidth - node.clientWidth) / 2; node.scrollTop = (node.scrollHeight - node.clientHeight) / 2; }
        }}>
          <button type="button" className={`product-zoom-image${magnified ? ' magnified' : ''}`} aria-label={magnified ? 'Fotoğrafı küçült' : 'Fotoğrafı yakınlaştır'} onClick={() => setMagnified(value => !value)}>
            <Image src={source} alt={`${product.name} — ${selected + 1}. fotoğraf, büyük görünüm`} fill unoptimized sizes="100vw" draggable={false} />
          </button>
        </div>
        <footer className="product-lightbox-footer">{multiple && <button type="button" aria-label="Büyük görünümde önceki fotoğraf" onClick={() => move(-1)}><FiChevronLeft /></button>}<p>{magnified ? 'Kaydırarak fotoğrafın ayrıntılarını inceleyin. Tekrar tıklayarak küçültün.' : 'Fotoğrafa tıklayarak yakınlaştırın.'}</p>{multiple && <button type="button" aria-label="Büyük görünümde sonraki fotoğraf" onClick={() => move(1)}><FiChevronRight /></button>}</footer>
      </div>}
    </dialog>
  </div>;
}
