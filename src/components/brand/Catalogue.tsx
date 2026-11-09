'use client';

import { useMemo, useState } from 'react';
import { FiArrowRight, FiGrid, FiHeart, FiSearch, FiX } from 'react-icons/fi';
import type { Product } from '@/data/products';
import { availableCategories, normalizeSearch, productClassification, type ProductCategory } from '@/lib/productCategories';
import ProductCard from './ProductCard';
import { useFavourites } from './Favourites';

type Props = { products: Product[]; categories: ProductCategory[]; initialQuery?: string; initialCategory?: string; initialSubcategory?: string; initialBrand?: string; onlySaved?: boolean; autofocus?: boolean };
export default function Catalogue({ products, categories, initialQuery = '', initialCategory = '', initialSubcategory = '', initialBrand = '', onlySaved = false, autofocus = false }: Props) {
  const available = availableCategories(categories);
  const roots = available.filter(category => !category.parentId);
  const [query, setQuery] = useState(initialQuery);
  const [sort, setSort] = useState('featured');
  const [saved, setSaved] = useState(onlySaved);
  const [category, setCategory] = useState(roots.some(root => root.id === initialCategory) ? initialCategory : '');
  const [subcategory, setSubcategory] = useState(available.some(item => item.id === initialSubcategory && item.parentId === initialCategory) ? initialSubcategory : '');
  const [brand, setBrand] = useState(initialBrand);
  const { items: favourites } = useFavourites();
  const classified = useMemo(() => products.map(product => ({ product, ...productClassification(product) })), [products]);
  const children = available.filter(item => item.parentId && item.parentId === category);
  const brands = [...new Set(classified.filter(item => (!category || item.categoryId === category) && (!subcategory || item.subcategoryId === subcategory)).map(item => item.fragranceBrand).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'tr'));
  const filtered = useMemo(() => {
    const needle = normalizeSearch(query.trim());
    return classified.filter(item => (!category || item.categoryId === category) && (!subcategory || item.subcategoryId === subcategory) && (!brand || item.fragranceBrand === brand) && (!saved || favourites.includes(item.product.id)) && (!needle || normalizeSearch([item.product.name, item.product.story, item.fragranceBrand].join(' ')).includes(needle))).map(item => item.product).sort((a, b) => sort === 'az' ? a.name.localeCompare(b.name, 'tr') : sort === 'za' ? b.name.localeCompare(a.name, 'tr') : Number(b.featured) - Number(a.featured) || a.order - b.order);
  }, [classified, category, subcategory, brand, saved, favourites, query, sort]);
  function updateUrl(nextCategory: string, nextSubcategory: string, nextBrand: string) {
    const url = new URL(window.location.href);
    for (const [key, value] of [['kategori', nextCategory], ['alt', nextSubcategory], ['marka', nextBrand]]) { if (value) url.searchParams.set(key, value); else url.searchParams.delete(key); }
    window.history.replaceState(null, '', `${url.pathname}${url.search}`);
  }
  function chooseCategory(value: string) { setCategory(value); setSubcategory(''); setBrand(''); updateUrl(value, '', ''); }
  function reset() { setSaved(false); setQuery(''); setSort('featured'); setCategory(''); setSubcategory(''); setBrand(''); const url = new URL(window.location.href); ['kategori', 'alt', 'marka', 'q', 'favoriler'].forEach(key => url.searchParams.delete(key)); window.history.replaceState(null, '', `${url.pathname}${url.search}`); }
  const labels = [available.find(item => item.id === category)?.name, available.find(item => item.id === subcategory)?.name, brand].filter(Boolean);

  return <section className="catalogue-section"><div className="container">
    <nav className="catalogue-categories" aria-label="Parfüm kategorileri"><button aria-pressed={!category} onClick={() => chooseCategory('')}>Tüm parfümler <span>{products.length}</span></button>{roots.map(root => <button key={root.id} aria-pressed={category === root.id} onClick={() => chooseCategory(root.id)}>{root.name} <span>{classified.filter(item => item.categoryId === root.id).length}</span></button>)}</nav>
    <div className="catalogue-search"><FiSearch /><label className="sr-only" htmlFor="catalogue-query">Ürün ara</label><input id="catalogue-query" type="search" placeholder="Ürün veya marka arayın…" value={query} onChange={event => setQuery(event.target.value)} autoFocus={autofocus} /><span>{products.length} PARFÜM</span></div>
    <div className="catalogue-category-filters"><label htmlFor="catalogue-subcategory">Alt kategori<select id="catalogue-subcategory" value={subcategory} disabled={!category || !children.length} onChange={event => { setSubcategory(event.target.value); setBrand(''); updateUrl(category, event.target.value, ''); }}><option value="">{category ? 'Tüm parfüm türleri' : 'Önce ana kategori seçin'}</option>{children.map(child => <option key={child.id} value={child.id}>{child.name}</option>)}</select></label><label htmlFor="catalogue-brand">Marka<select id="catalogue-brand" value={brand} onChange={event => { setBrand(event.target.value); updateUrl(category, subcategory, event.target.value); }}><option value="">Tüm markalar</option>{[...new Set([...brands, ...(brand ? [brand] : [])])].map(name => <option key={name} value={name}>{name}</option>)}</select></label></div>
    <div className="catalogue-toolbar"><p role="status" aria-live="polite"><strong>{filtered.length}</strong> parfüm keşfedilmeyi bekliyor</p><div className="catalogue-tools"><button className={`catalogue-saved${saved ? ' selected' : ''}`} aria-pressed={saved} onClick={() => setSaved(!saved)}><FiHeart /> Favorilerim <span>{favourites.length}</span></button><div className="catalogue-sort"><label htmlFor="catalogue-sort">Sıralama</label><select id="catalogue-sort" value={sort} onChange={event => setSort(event.target.value)}><option value="featured">Öne çıkanlar</option><option value="az">İsim: A – Z</option><option value="za">İsim: Z – A</option></select><FiGrid aria-hidden="true" /></div></div></div>
    {(saved || query || labels.length > 0) && <div className="active-filters">{labels.map(label => <span key={label}>{label}</span>)}{saved && <span>Favorilerim</span>}{query && <span>“{query}”</span>}<button onClick={reset}>Tümünü temizle <FiX /></button></div>}
    {filtered.length ? <div className="product-grid catalogue-grid catalogue-grid-simple">{filtered.map((product, index) => <ProductCard product={product} key={product.id} priority={index < 4} />)}</div> : <div className="catalogue-empty"><FiSearch /><h2>Aradığınız ürünü bulamadık.</h2><p>Başka bir kelime deneyin veya filtreleri değiştirin.</p><button className="button" onClick={reset}>Tüm kokuları göster <FiArrowRight /></button></div>}
    <p className="catalogue-footnote">Güncel ürün bilgisi ve bulunabilirlik marka tarafından teyit edilir.</p>
  </div></section>;
}
