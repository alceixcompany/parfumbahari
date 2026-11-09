'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { FiArrowUpRight, FiEdit2, FiPlus, FiX, FiRefreshCw, FiSearch, FiLayers } from 'react-icons/fi';
import { db } from '@/lib/firebase';
import type { Product } from '@/data/products';
import { getProductImages } from '@/lib/productImages';
import { type PreparedImage } from '@/lib/imageUpload';
import { saveProduct, type ProductRecord } from '@/lib/productPersistence';
import { useCollection, messageFor } from './useCollection';
import ProductPhotos from './ProductPhotos';
import { normalizeProduct } from '@/lib/normalizeProduct';
import { availableCategories, mergeProductCategories, productClassification, type ProductCategory } from '@/lib/productCategories';

const empty: ProductRecord = {
  id: '', slug: '', name: '', story: '',
  image: '', images: [], concentration: 'Eau de Parfum', mood: '', season: '',
  badge: '', featured: false, isActive: false, order: 10, brand: 'parfum-bahari',
};
const slugify = (value: string) => value.toLocaleLowerCase('tr').replace(/ı/g, 'i').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export default function ProductsManager() {
  const { items, loading, error, reload } = useCollection('products');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const catalogue = items.map(item => ({ ...normalizeProduct(item), brand: 'parfum-bahari' })).sort((a, b) => a.order - b.order || a.name.localeCompare(b.name, 'tr'));
  const filtered = catalogue.filter(item => item.name.toLocaleLowerCase('tr').includes(search.toLocaleLowerCase('tr')));
  const currentPage = Math.min(page, Math.max(0, Math.ceil(filtered.length / 24) - 1));
  const [editing, setEditing] = useState<ProductRecord | null>(null);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState('');
  const [busy, setBusy] = useState('');

  async function toggle(item: ProductRecord) {
    setBusy(item.id); setMessage('');
    try { await updateDoc(doc(db, 'products', item.id), { isActive: !item.isActive, updatedAt: new Date().toISOString() }); reload(); }
    catch (error) { setMessage(messageFor(error)); }
    finally { setBusy(''); }
  }

  return <>
    <div className="admin-page-heading"><div><p className="admin-eyebrow">PARFUM BAHARI KOLEKSİYONU</p><h1>Ürün kataloğu</h1><p>Ürünleri, fotoğrafları ve koleksiyon görünürlüğünü yönetin.</p></div><button className="admin-button" onClick={() => { setSuccess(''); setEditing({ ...empty }); }}><FiPlus /> Yeni parfüm</button></div>
    {success && <p role="status" className="admin-success">{success}</p>}
    {(error || message) && <p role="status" className="admin-error">{error || message}</p>}
    <nav className="admin-tabs" aria-label="Katalog yönetimi"><Link href="/admin/urunler" aria-current="page">Ürünler</Link><Link href="/admin/kategoriler"><FiLayers /> Kategoriler & alt kategoriler</Link></nav>
    <section className="admin-panel">
      <div className="admin-toolbar"><label className="admin-search"><FiSearch /><input type="search" aria-label="Ürün ara" placeholder="Ürün adıyla ara…" value={search} onChange={event => { setSearch(event.target.value); setPage(0); }} /></label><button className="admin-icon-button" onClick={reload} aria-label="Ürün listesini yenile"><FiRefreshCw /></button></div>
      {loading ? <p className="admin-empty" role="status">Ürünler yükleniyor…</p> : error ? <div className="admin-empty"><p>Ürün listesi şu anda yüklenemiyor.</p><button className="admin-button secondary" onClick={reload}>Yeniden dene</button><Link href="/admin/login" className="admin-text-link">Yeniden giriş yap</Link></div> : !items.length ? <div className="admin-empty"><h2>Henüz ürün yok.</h2><p>Yeni bir parfüm ekleyin veya genel bakıştan hazır koleksiyonu içe aktarın.</p><Link href="/admin" className="admin-text-link">Hazır içerikler <FiArrowUpRight /></Link></div> : !filtered.length ? <p className="admin-empty">Aramanıza uygun ürün bulunamadı.</p> : <div className="admin-content-list">
        {filtered.slice(currentPage * 24, (currentPage + 1) * 24).map(item => <article key={item.id} className="admin-content-row">
          <div className="admin-content-thumbnail"><Image src={item.image || '/parfum-bahari/fleur.webp'} alt="" fill sizes="104px" /></div>
          <div className="admin-content-info"><span>{getProductImages(item).length} fotoğraf</span><h2>{item.name}</h2>{item.story && <p>{item.story}</p>}</div>
          <div className="admin-row-actions"><button className={`admin-status ${item.isActive ? 'published' : ''}`} onClick={() => toggle(item)} disabled={busy === item.id}>{item.isActive ? 'Yayında' : 'Taslak'}</button><button className="admin-button secondary" onClick={() => { setSuccess(''); setEditing(item); }} aria-label={`${item.name} düzenle`}><FiEdit2 /> Düzenle</button>{item.isActive && <Link className="admin-icon-button" href={`/urun-katalogu/${item.slug}`} target="_blank" aria-label={`${item.name} sitede aç`}><FiArrowUpRight /></Link>}</div>
        </article>)}
      </div>}
      {!loading && !error && <div className="admin-list-footer"><span>{filtered.length} ürün · Sayfa {currentPage + 1} / {Math.max(1, Math.ceil(filtered.length / 24))}</span><div className="admin-row-actions"><button className="admin-button secondary" disabled={currentPage === 0} onClick={() => setPage(currentPage - 1)}>Önceki</button><button className="admin-button secondary" disabled={(currentPage + 1) * 24 >= filtered.length} onClick={() => setPage(currentPage + 1)}>Sonraki</button></div></div>}
    </section>
    {editing && <ProductEditor key={editing.id || 'new'} initial={editing} onClose={() => setEditing(null)} onSaved={deleted => { setEditing(null); setSuccess(deleted ? 'Ürün silindi.' : 'Ürün ve fotoğrafları kaydedildi.'); reload(); }} />}
  </>;
}

function ProductEditor({ initial, onClose, onSaved }: { initial: ProductRecord; onClose: () => void; onSaved: (deleted?: boolean) => void }) {
  const [form, setForm] = useState<ProductRecord>({ ...empty, ...initial, ...productClassification(initial), images: getProductImages(initial) });
  const { items: categoryRecords, error: categoryError } = useCollection('product_categories');
  const categories = mergeProductCategories(categoryRecords as ProductCategory[]);
  const activeCategories = availableCategories(categories);
  const roots = categories.filter(category => !category.parentId && (category.isActive || category.id === form.categoryId));
  const children = categories.filter(category => category.parentId === form.categoryId && (activeCategories.some(active => active.id === category.id) || category.id === form.subcategoryId));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [prepared, setPrepared] = useState<PreparedImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const saving = useRef(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const modal = useRef<HTMLDialogElement>(null);
  const unavailable = busy || uploading;

  useEffect(() => { const element = modal.current; element?.showModal(); return () => { element?.close(); }; }, []);
  function field<K extends keyof Product>(key: K, value: Product[K]) { setForm(current => ({ ...current, [key]: value })); }

  async function save(event: FormEvent) {
    event.preventDefault();
    if (saving.current || uploading) return;
    setError('');
    saving.current = true; setBusy(true);
    try {
      const data = { ...form, slug: initial.slug || slugify(form.slug || form.name), name: form.name.trim(), brand: 'parfum-bahari' };
      await saveProduct(db, data, initial.id, prepared);
      onSaved();
    } catch (error) { setError(messageFor(error)); }
    finally { saving.current = false; setBusy(false); }
  }

  async function remove() {
    if (saving.current || uploading) return;
    saving.current = true; setBusy(true); setError('');
    try { await deleteDoc(doc(db, 'products', initial.id)); onSaved(true); }
    catch (error) { setError(messageFor(error)); }
    finally { saving.current = false; setBusy(false); }
  }

  return <dialog ref={modal} className="admin-modal" aria-label="Parfüm düzenleyici" onCancel={event => { event.preventDefault(); if (!unavailable) onClose(); }}>
    <div className="admin-modal-heading"><h2>{initial.id ? 'Parfümü düzenle' : 'Yeni parfüm'}</h2><button onClick={onClose} disabled={unavailable} className="admin-icon-button" aria-label="Pencereyi kapat"><FiX /></button></div>
    <form onSubmit={save} className="admin-editor">
      <label>Ürün adı<input required disabled={unavailable} maxLength={100} value={form.name} onChange={event => field('name', event.target.value)} /></label>
      <label>Bağlantı adı<input disabled={unavailable || !!initial.id} value={form.slug} onChange={event => field('slug', slugify(event.target.value))} placeholder={slugify(form.name)} /></label>
      <div className="admin-field-grid"><label>Ana kategori<select disabled={unavailable} value={form.categoryId || ''} onChange={event => setForm(current => ({ ...current, categoryId: event.target.value, subcategoryId: '' }))}><option value="">Kategorisiz</option>{roots.map(category => <option key={category.id} value={category.id}>{category.name}{!category.isActive ? ' (gizli)' : ''}</option>)}</select></label><label>Alt kategori<select disabled={unavailable || !form.categoryId} value={form.subcategoryId || ''} onChange={event => field('subcategoryId', event.target.value)}><option value="">Alt kategori seçin</option>{children.map(category => <option key={category.id} value={category.id}>{category.name}{!category.isActive ? ' (gizli)' : ''}</option>)}</select></label></div>
      <label>Parfüm markası<input disabled={unavailable} maxLength={100} value={form.fragranceBrand || ''} onChange={event => field('fragranceBrand', event.target.value)} placeholder="Örn. Tom Ford, Dior, Amouage" /></label>
      {categoryError && <p className="admin-photos-help">Özel kategoriler yüklenemedi. Başlangıç kategorilerini seçebilir veya kategori yönetiminden bağlantıyı kontrol edebilirsiniz.</p>}
      <ProductPhotos images={form.images || []} cover={form.image} prepared={prepared} disabled={busy} onBusy={setUploading} onChange={(images, image, nextPrepared) => { setForm(current => ({ ...current, images, image })); setPrepared(nextPrepared); }} />
      <label>Ürün açıklaması<textarea disabled={unavailable} maxLength={3000} rows={5} value={form.story} onChange={event => field('story', event.target.value)} /></label>
      <label>Konsantrasyon<input disabled={unavailable} maxLength={80} value={form.concentration} onChange={event => field('concentration', event.target.value)} /></label>
      <div className="admin-field-grid"><label>Rozet<input disabled={unavailable} maxLength={80} value={form.badge} onChange={event => field('badge', event.target.value)} /></label><label>Sıra<input required disabled={unavailable} type="number" min={0} max={9999} value={form.order} onChange={event => field('order', Number(event.target.value))} /></label></div>
      <div className="admin-checkboxes"><label><input disabled={unavailable} type="checkbox" checked={form.isActive} onChange={event => field('isActive', event.target.checked)} /> Sitede yayınla</label><label><input disabled={unavailable} type="checkbox" checked={form.featured} onChange={event => field('featured', event.target.checked)} /> Ana sayfada öne çıkar</label></div>
      {error && <p role="alert" className="admin-error">{error}</p>}
      <div className="admin-form-actions"><button type="button" disabled={unavailable} className="admin-button secondary" onClick={onClose}>Vazgeç</button><button type="submit" disabled={unavailable} className="admin-button">{busy ? 'Ürün ve fotoğrafları kaydediliyor…' : uploading ? 'Fotoğraflar hazırlanıyor…' : 'Ürünü kaydet'}</button></div>
      {initial.id && <div>{confirmDelete ? <><p className="admin-dialog-description">“{initial.name}” kalıcı olarak silinsin mi?</p><button type="button" disabled={unavailable} className="admin-button danger-fill" onClick={remove}>Evet, ürünü sil</button><button type="button" disabled={unavailable} className="admin-button secondary" onClick={() => setConfirmDelete(false)}>Vazgeç</button></> : <button type="button" disabled={unavailable} className="admin-text-link" onClick={() => setConfirmDelete(true)}>Ürünü sil</button>}</div>}
    </form>
  </dialog>;
}
