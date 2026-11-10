'use client';

import { useMemo, useState } from 'react';
import { FiArrowRight, FiGrid, FiHeart, FiSearch, FiX } from 'react-icons/fi';
import type { Product } from '@/data/products';
import { normalizeSearch, productClassification, type ProductCategory } from '@/lib/productCategories';
import ProductCard from './ProductCard';
import { useFavourites } from './Favourites';

type Props = { products: Product[]; categories: ProductCategory[]; initialQuery?: string; initialCategory?: string; onlySaved?: boolean; autofocus?: boolean };
export default function Catalogue({ products, categories, initialQuery = '', initialCategory = '', onlySaved = false, autofocus = false }: Props) {
  const roots = categories;
  const [query, setQuery] = useState(initialQuery);
  const [sort, setSort] = useState('featured');
  const [saved, setSaved] = useState(onlySaved);
  const [category, setCategory] = useState(roots.some(root => root.id === initialCategory) ? initialCategory : '');
  const { items: favourites } = useFavourites();
  const classified = useMemo(() => products.map(product => ({ product, ...productClassification(product) })), [products]);
  const filtered = useMemo(() => {
    const needle = normalizeSearch(query.trim());
    return classified.filter(item => (!category || item.categoryId === category) && (!saved || favourites.includes(item.product.id)) && (!needle || normalizeSearch([item.product.name, item.product.story].join(' ')).includes(needle))).map(item => item.product).sort((a, b) => sort === 'az' ? a.name.localeCompare(b.name, 'tr') : sort === 'za' ? b.name.localeCompare(a.name, 'tr') : Number(b.featured) - Number(a.featured) || a.order - b.order);
  }, [classified, category, saved, favourites, query, sort]);
  function chooseCategory(value: string) {
    setCategory(value);
    const url = new URL(window.location.href);
    if (value) url.searchParams.set('kategori', value); else url.searchParams.delete('kategori');
    ['alt', 'marka'].forEach(key => url.searchParams.delete(key));
    window.history.replaceState(null, '', `${url.pathname}${url.search}`);
  }
  function reset() { setSaved(false); setQuery(''); setSort('featured'); setCategory(''); const url = new URL(window.location.href); ['kategori', 'alt', 'marka', 'q', 'favoriler'].forEach(key => url.searchParams.delete(key)); window.history.replaceState(null, '', `${url.pathname}${url.search}`); }
  const labels = [roots.find(item => item.id === category)?.name].filter(Boolean);

  return <section className="catalogue-section"><div className="container">
    <nav className="catalogue-categories" aria-label="Parfüm kategorileri"><button aria-pressed={!category} onClick={() => chooseCategory('')}>Tüm parfümler <span>{products.length}</span></button>{roots.map(root => <button key={root.id} aria-pressed={category === root.id} onClick={() => chooseCategory(root.id)}>{root.name} <span>{classified.filter(item => item.categoryId === root.id).length}</span></button>)}</nav>
    <div className="catalogue-search"><FiSearch /><label className="sr-only" htmlFor="catalogue-query">Ürün ara</label><input id="catalogue-query" type="search" placeholder="Koleksiyonda bir parfüm arayın…" value={query} onChange={event => setQuery(event.target.value)} autoFocus={autofocus} /><span>{products.length} PARFÜM</span></div>
    <div className="catalogue-toolbar"><p role="status" aria-live="polite"><strong>{filtered.length}</strong> parfüm keşfedilmeyi bekliyor</p><div className="catalogue-tools"><button className={`catalogue-saved${saved ? ' selected' : ''}`} aria-pressed={saved} onClick={() => setSaved(!saved)}><FiHeart /> Favorilerim <span>{favourites.length}</span></button><div className="catalogue-sort"><label htmlFor="catalogue-sort">Sıralama</label><select id="catalogue-sort" value={sort} onChange={event => setSort(event.target.value)}><option value="featured">Öne çıkanlar</option><option value="az">İsim: A – Z</option><option value="za">İsim: Z – A</option></select><FiGrid aria-hidden="true" /></div></div></div>
    {(saved || query || labels.length > 0) && <div className="active-filters">{labels.map(label => <span key={label}>{label}</span>)}{saved && <span>Favorilerim</span>}{query && <span>“{query}”</span>}<button onClick={reset}>Tümünü temizle <FiX /></button></div>}
    {filtered.length ? <div className="product-grid catalogue-grid catalogue-grid-simple">{filtered.map((product, index) => <ProductCard product={product} key={product.id} priority={index < 4} />)}</div> : <div className="catalogue-empty"><FiSearch /><h2>Aradığınız ürünü bulamadık.</h2><p>Başka bir kelime deneyin veya filtreleri değiştirin.</p><button className="button" onClick={reset}>Tüm kokuları göster <FiArrowRight /></button></div>}
    <p className="catalogue-footnote">Güncel ürün bilgisi ve bulunabilirlik marka tarafından teyit edilir.</p>
  </div></section>;
}
