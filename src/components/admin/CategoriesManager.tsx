'use client';

import Link from 'next/link';
import { useState, type FormEvent } from 'react';
import { doc, runTransaction } from 'firebase/firestore';
import { FiArrowLeft, FiCheck, FiEdit2, FiPlus, FiRefreshCw } from 'react-icons/fi';
import { db } from '@/lib/firebase';
import { mergeProductCategories, type ProductCategory } from '@/lib/productCategories';
import { messageFor, useCollection } from './useCollection';

const empty: ProductCategory = { id: '', name: '', parentId: '', order: 0, isActive: true };
const slugify = (value: string) => value.toLocaleLowerCase('tr').replace(/ı/g, 'i').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 90);

export default function CategoriesManager() {
  const { items, loading, error, reload } = useCollection('product_categories');
  const categories = mergeProductCategories(items as ProductCategory[]);
  const [editing, setEditing] = useState<ProductCategory | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [notice, setNotice] = useState('');
  const roots = categories.filter(category => !category.parentId);

  async function save(event: FormEvent) {
    event.preventDefault();
    if (!editing || busy) return;
    const name = editing.name.trim();
    const id = editing.id || [editing.parentId, slugify(name)].filter(Boolean).join('-');
    if (!Number.isInteger(editing.order) || editing.order < 0 || editing.order > 9999) { setMessage('Sıra 0–9999 arasında bir tam sayı olmalı.'); return; }
    if (!name || !id) { setMessage('Geçerli bir kategori adı girin.'); return; }
    if (editing.parentId && categories.some(category => category.parentId === id)) { setMessage('Alt kategorileri olan bir kategori başka kategoriye bağlanamaz.'); return; }
    if (!editing.id && categories.some(category => category.id === id)) { setMessage('Bu kategori zaten var. Farklı bir ad seçin.'); return; }
    setBusy(true); setMessage(''); setNotice('');
    try {
      const now = new Date().toISOString();
      await runTransaction(db, async transaction => {
        const location = doc(db, 'product_categories', id);
        const existing = await transaction.get(location);
        const parent = editing.parentId ? await transaction.get(doc(db, 'product_categories', editing.parentId)) : null;
        if (!editing.id && existing.exists()) throw new Error('Bu kategori zaten var.');
        if (editing.parentId) {
          const parentCategory = categories.find(category => category.id === editing.parentId && !category.parentId);
          if (!parentCategory || editing.parentId === id) throw new Error('Geçerli bir ana kategori seçin.');
          if (parent?.exists() && parent.data().parentId) throw new Error('Alt kategorinin altında yeni kategori oluşturulamaz.');
          if (!parent?.exists()) transaction.set(doc(db, 'product_categories', editing.parentId), { name: parentCategory.name, parentId: '', order: parentCategory.order, isActive: parentCategory.isActive, brand: 'parfum-bahari', updatedAt: now });
        }
        transaction.set(location, { name, parentId: editing.parentId, order: editing.order, isActive: editing.isActive, brand: 'parfum-bahari', updatedAt: now });
      });
      setEditing(null); setNotice('Kategori kaydedildi.'); reload();
    } catch (error) { setMessage(messageFor(error)); } finally { setBusy(false); }
  }

  async function toggle(category: ProductCategory) {
    setBusy(true); setMessage('');
    try {
      const { id, ...data } = category;
      await runTransaction(db, async transaction => {
        const parent = category.parentId ? await transaction.get(doc(db, 'product_categories', category.parentId)) : null;
        const now = new Date().toISOString();
        if (category.parentId && !parent?.exists()) {
          const parentCategory = categories.find(item => item.id === category.parentId && !item.parentId);
          if (!parentCategory) throw new Error('Ana kategori bulunamadı.');
          const { id: parentId, ...parentData } = parentCategory;
          transaction.set(doc(db, 'product_categories', parentId), { ...parentData, brand: 'parfum-bahari', updatedAt: now });
        }
        transaction.set(doc(db, 'product_categories', id), { ...data, isActive: !category.isActive, brand: 'parfum-bahari', updatedAt: now });
      });
      reload();
    }
    catch (error) { setMessage(messageFor(error)); } finally { setBusy(false); }
  }

  return <>
    <Link href="/admin/urunler" className="admin-text-link"><FiArrowLeft /> Ürünlere dön</Link>
    <div className="admin-page-heading"><div><p className="admin-eyebrow">KATALOG DÜZENİ</p><h1>Kategoriler & alt kategoriler</h1><p>Ana kategorileri ve bunlara bağlı parfüm türlerini yönetin. Markalar ürünlerde ayrıca seçilir.</p></div><button className="admin-button" onClick={() => { setEditing({ ...empty }); setMessage(''); }}><FiPlus /> Kategori ekle</button></div>
    {(error || message) && <p className="admin-error" role="alert">{message || error}</p>}{notice && <p className="admin-success" role="status">{notice}</p>}
    {error && <button className="admin-button secondary" onClick={reload}><FiRefreshCw /> Yeniden dene</button>}
    {editing && <section className="admin-panel"><form onSubmit={save} className="admin-editor"><h2>{editing.id ? 'Kategoriyi düzenle' : 'Yeni kategori'}</h2><label>Kategori adı<input required maxLength={100} value={editing.name} onChange={event => setEditing({ ...editing, name: event.target.value })} disabled={busy} /></label><div className="admin-field-grid"><label>Bağlı olduğu ana kategori<select value={editing.parentId} disabled={busy || Boolean(editing.id && categories.some(category => category.parentId === editing.id))} onChange={event => setEditing({ ...editing, parentId: event.target.value })}><option value="">Ana kategori olarak ekle</option>{roots.filter(root => root.id !== editing.id).map(root => <option key={root.id} value={root.id}>{root.name}</option>)}</select></label><label>Sıra<input required type="number" min={0} max={9999} value={editing.order} disabled={busy} onChange={event => setEditing({ ...editing, order: Number(event.target.value) })} /></label></div><label className="admin-category-active"><input type="checkbox" checked={editing.isActive} disabled={busy} onChange={event => setEditing({ ...editing, isActive: event.target.checked })} /> Katalogda göster</label><div className="admin-form-actions"><button type="button" className="admin-button secondary" disabled={busy} onClick={() => setEditing(null)}>Vazgeç</button><button className="admin-button" disabled={busy}>{busy ? 'Kaydediliyor…' : 'Kaydet'} <FiCheck /></button></div></form></section>}
    <section className="admin-panel">{loading ? <p className="admin-empty">Kategoriler yükleniyor…</p> : roots.map(root => <div className="admin-category-group" key={root.id}>{[root, ...categories.filter(category => category.parentId === root.id)].map(category => <div className={`admin-category-row${category.parentId ? ' is-child' : ''}`} key={category.id}><div><strong>{category.parentId ? '↳ ' : ''}{category.name}</strong><small>{category.parentId ? root.name : 'Ana kategori'}</small></div><div className="admin-row-actions"><button className={`admin-status ${category.isActive ? 'published' : ''}`} disabled={busy} onClick={() => toggle(category)}>{category.isActive ? 'Görünür' : 'Gizli'}</button><button className="admin-icon-button" aria-label={`${category.name} düzenle`} onClick={() => { setEditing({ ...category }); setMessage(''); }}><FiEdit2 /></button>{!category.parentId && <button className="admin-icon-button" aria-label={`${category.name} alt kategorisi ekle`} onClick={() => setEditing({ ...empty, parentId: category.id })}><FiPlus /></button>}</div></div>)}</div>)}</section>
  </>;
}
