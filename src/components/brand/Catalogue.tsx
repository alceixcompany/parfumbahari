'use client';

import { useMemo, useState } from 'react';
import { FiArrowRight, FiGrid, FiHeart, FiSearch, FiX } from 'react-icons/fi';
import type { Product } from '@/data/products';
import ProductCard from './ProductCard';
import { useFavourites } from './Favourites';

const normalize = (value: string) => value.toLocaleLowerCase('tr').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ı/g, 'i');

export default function Catalogue({ products, initialQuery = '', onlySaved = false, autofocus = false }: { products: Product[]; initialQuery?: string; onlySaved?: boolean; autofocus?: boolean }) {
  const [query, setQuery] = useState(initialQuery);
  const [sort, setSort] = useState('featured');
  const [saved, setSaved] = useState(onlySaved);
  const { items: favourites } = useFavourites();
  const filtered = useMemo(() => {
    const needle = normalize(query.trim());
    return products.filter(product => (!saved || favourites.includes(product.id)) && (!needle || normalize([product.name, product.subtitle, product.description].join(' ')).includes(needle))).sort((a, b) => sort === 'az' ? a.name.localeCompare(b.name, 'tr') : sort === 'za' ? b.name.localeCompare(a.name, 'tr') : a.order - b.order);
  }, [products, saved, favourites, query, sort]);
  function reset() { setSaved(false); setQuery(''); setSort('featured'); }

  return <section className="catalogue-section"><div className="container">
    <div className="catalogue-search"><FiSearch /><label className="sr-only" htmlFor="catalogue-query">Ürün ara</label><input id="catalogue-query" type="search" placeholder="Koleksiyonda bir koku arayın…" value={query} onChange={event => setQuery(event.target.value)} autoFocus={autofocus} /><span>{products.length} PARFÜM</span></div>
    <div className="catalogue-toolbar"><p role="status" aria-live="polite"><strong>{filtered.length}</strong> parfüm keşfedilmeyi bekliyor</p><div className="catalogue-tools"><button className={`catalogue-saved${saved ? ' selected' : ''}`} aria-pressed={saved} onClick={() => setSaved(!saved)}><FiHeart /> Favorilerim <span>{favourites.length}</span></button><div className="catalogue-sort"><label htmlFor="catalogue-sort">Sıralama</label><select id="catalogue-sort" value={sort} onChange={event => setSort(event.target.value)}><option value="featured">Öne çıkanlar</option><option value="az">İsim: A – Z</option><option value="za">İsim: Z – A</option></select><FiGrid aria-hidden="true" /></div></div></div>
    {(saved || query) && <div className="active-filters">{saved && <span>Favorilerim</span>}{query && <span>“{query}”</span>}<button onClick={reset}>Tümünü temizle <FiX /></button></div>}
    {filtered.length ? <div className="product-grid catalogue-grid catalogue-grid-simple">{filtered.map((product, index) => <ProductCard product={product} key={product.id} priority={index < 4} />)}</div> : <div className="catalogue-empty"><FiSearch /><h2>Aradığınız ürünü bulamadık.</h2><p>Başka bir kelime deneyin veya koleksiyonun tamamına göz atın.</p><button className="button" onClick={reset}>Tüm kokuları göster <FiArrowRight /></button></div>}
    <p className="catalogue-footnote">Koleksiyondaki ürün ve görseller temsilî olarak hazırlanmıştır. Güncel ürün bilgisi ve bulunabilirlik marka tarafından teyit edilir.</p>
  </div></section>;
}
