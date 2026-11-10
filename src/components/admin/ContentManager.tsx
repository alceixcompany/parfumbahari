'use client';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Bytes, collection, deleteDoc, doc, runTransaction, updateDoc, writeBatch } from 'firebase/firestore';
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiArrowUpRight, FiX, FiCheck, FiRefreshCw } from 'react-icons/fi';
import { db } from '@/lib/firebase';
import ImagePicker from './ImagePicker';
import { refreshPublicContent } from '@/lib/refreshPublicContent';
import { MEDIA_PATH, type PreparedImage } from '@/lib/imageUpload';
import { type ContentRecord, messageFor, useCollection } from './useCollection';
type Kind = 'haberler' | 'gallery_items' | 'gallery_categories';
const labels = { haberler: { title: 'Blog & haberler', subtitle: 'Parfüm rehberleri, koku notları ve markanın hikâyesi.', singular: 'Yazı', create: 'Yeni yazı' }, gallery_items: { title: 'Galeri', subtitle: 'Parfum Bahari dünyasını yansıtan kareleri düzenleyin.', singular: 'Görsel', create: 'Yeni görsel' }, gallery_categories: { title: 'Galeri kategorileri', subtitle: 'Galeri filtrelerini ve görünürlüklerini yönetin.', singular: 'Kategori', create: 'Yeni kategori' } };
const slugify = (value: string) => value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ı/g, 'i').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 100);
export default function ContentManager({ kind }: { kind: Kind }) {
  const { items, loading, error, reload } = useCollection(kind);
  const [search, setSearch] = useState(''); const [status, setStatus] = useState('all'); const [editing, setEditing] = useState<ContentRecord | null | undefined>(undefined); const [deleting, setDeleting] = useState<ContentRecord | null>(null); const [notice, setNotice] = useState(''); const [actionError, setActionError] = useState(''); const [busyId, setBusyId] = useState('');
  const copy = labels[kind];
  const filtered = items.filter(item => String(item.title || item.name || '').toLowerCase().includes(search.toLowerCase()) && (status === 'all' || (status === 'active') === Boolean(item.isActive))).sort((a, b) => Number(a.order || 0) - Number(b.order || 0));
  async function toggle(item: ContentRecord) { setActionError(''); setBusyId(item.id); try { await updateDoc(doc(db, kind, item.id), { isActive: !item.isActive, updatedAt: new Date().toISOString() }); const warning = await refreshPublicContent(kind); setNotice((item.isActive ? 'İçerik yayından kaldırıldı.' : 'İçerik yayınlandı.') + warning); } catch (e) { setActionError(messageFor(e)); } finally { setBusyId(''); } }
  async function remove() { if (!deleting) return; setBusyId(deleting.id); setActionError(''); try { await deleteDoc(doc(db, kind, deleting.id)); setDeleting(null); const warning = await refreshPublicContent(kind); setNotice('İçerik silindi.' + warning); } catch (e) { setActionError(messageFor(e)); } finally { setBusyId(''); } }
  return <><div className="admin-page-heading"><div><p className="admin-eyebrow">İÇERİK YÖNETİMİ</p><h1>{copy.title}</h1><p>{copy.subtitle}</p></div><button className="admin-button" onClick={() => { setEditing(null); setNotice(''); }}><FiPlus />{copy.create}</button></div>
    {kind !== 'haberler' && <nav className="admin-tabs" aria-label="Galeri yönetimi"><Link href="/admin/galeri" aria-current={kind === 'gallery_items' ? 'page' : undefined}>Görseller</Link><Link href="/admin/galeri/kategoriler" aria-current={kind === 'gallery_categories' ? 'page' : undefined}>Kategoriler</Link></nav>}
    {notice && <p className="admin-success" role="status"><FiCheck />{notice}</p>}{(error || actionError) && <p className="admin-error" role="alert">{error || actionError}</p>}
    <section className="admin-panel"><div className="admin-toolbar"><label className="admin-search"><FiSearch /><input type="search" aria-label="İçerik ara" placeholder="Başlıkla ara…" value={search} onChange={e => setSearch(e.target.value)} /></label><select aria-label="Yayın durumu" value={status} onChange={e => setStatus(e.target.value)}><option value="all">Tüm durumlar</option><option value="active">Yayında</option><option value="draft">Taslak</option></select><button className="admin-icon-button" onClick={reload} aria-label="Listeyi yenile"><FiRefreshCw /></button></div>
      {loading ? <p className="admin-empty" role="status">İçerikler yükleniyor…</p> : filtered.length === 0 ? <div className="admin-empty"><h2>{items.length ? 'Sonuç bulunamadı.' : 'Henüz içerik yok.'}</h2><p>{items.length ? 'Arama veya filtreyi değiştirin.' : 'Yeni içerik ekleyin veya genel bakış sayfasından hazır Parfum Bahari içeriklerini içe aktarın.'}</p>{!items.length && <Link href="/admin" className="admin-text-link">Hazır içerikleri incele <FiArrowUpRight /></Link>}</div> : <div className="admin-content-list">{filtered.map(item => <article className="admin-content-row" key={item.id}>{kind !== 'gallery_categories' && <div className="admin-content-thumbnail"><Image src={String(item.imageUrl || '/parfum-bahari/hero.webp')} alt="" fill sizes="100px" /></div>}<div className="admin-content-info"><span>{String(item.category || item.categoryName || 'Parfum Bahari')} · Sıra {Number(item.order || 0)}</span><h2>{String(item.title || item.name)}</h2><p>{String(item.excerpt || item.description || '')}</p></div><div className="admin-row-actions"><button className={`admin-status ${item.isActive ? 'published' : ''}`} onClick={() => toggle(item)} disabled={busyId === item.id} aria-label={`${String(item.title || item.name)} ${item.isActive ? 'yayından kaldır' : 'yayınla'}`}>{item.isActive ? 'Yayında' : 'Taslak'}</button><button className="admin-icon-button" onClick={() => setEditing(item)} aria-label={`${String(item.title || item.name)} düzenle`}><FiEdit2 /></button>{kind === 'haberler' && item.isActive === true && <Link className="admin-icon-button" href={`/haberler/${item.slug}`} target="_blank" aria-label={`${String(item.title)} sitede aç`}><FiArrowUpRight /></Link>}<button className="admin-icon-button danger" onClick={() => {setDeleting(item); setActionError('');}} aria-label={`${String(item.title || item.name)} sil`}><FiTrash2 /></button></div></article>)}</div>}
      <div className="admin-list-footer">{filtered.length} / {items.length} kayıt <span>Yayın değişiklikleri sayfa yeniden açıldığında görünür.</span></div>
    </section>
    {editing !== undefined && <Editor key={editing?.id || 'new'} kind={kind} record={editing} onClose={() => setEditing(undefined)} onSaved={warning => { setEditing(undefined); setNotice(`${copy.singular} kaydedildi.${warning}`); }} />}
    {deleting && <Modal title={`${copy.singular} silinsin mi?`} onClose={() => { if (!busyId) setDeleting(null); }} busy={!!busyId}><p className="admin-dialog-description">“{String(deleting.title || deleting.name)}” kalıcı olarak silinecek.{kind === 'gallery_categories' && ' Bu kategorideki görseller veritabanında kalır, ancak kategori yeniden atanmadan sitede görünmez.'}</p>{actionError && <p className="admin-error" role="alert">{actionError}</p>}<div className="admin-form-actions"><button className="admin-button secondary" onClick={() => setDeleting(null)} disabled={!!busyId}>Vazgeç</button><button className="admin-button danger-fill" disabled={!!busyId} onClick={remove}>{busyId ? 'Siliniyor…' : 'Evet, sil'}</button></div></Modal>}
  </>;
}
function Modal({ title, children, onClose, busy = false }: { title: string; children: React.ReactNode; onClose: () => void; busy?: boolean }) {
  const modal = useRef<HTMLDialogElement>(null);
  useEffect(() => { const element = modal.current; element?.showModal(); const previous = document.body.style.overflow; document.body.style.overflow = 'hidden'; return () => { element?.close(); document.body.style.overflow = previous; }; }, []);
  return <dialog ref={modal} className="admin-modal" aria-label={title} onCancel={e => { e.preventDefault(); if (!busy) onClose(); }}><div className="admin-modal-heading"><h2>{title}</h2><button className="admin-icon-button" onClick={onClose} disabled={busy} aria-label="Pencereyi kapat"><FiX /></button></div>{children}</dialog>;
}
function Editor({ kind, record, onClose, onSaved }: { kind: Kind; record: ContentRecord | null; onClose: () => void; onSaved: (warning: string) => void }) {
  const { items: categories } = useCollection('gallery_categories');
  const [form, setForm] = useState({ title: String(record?.title || record?.name || ''), slug: String(record?.slug || ''), description: String(record?.excerpt || record?.description || ''), content: String(record?.content || ''), imageUrl: String(record?.imageUrl || ''), category: String(record?.category || 'Koku Rehberi'), categoryId: String(record?.categoryId || ''), isActive: Boolean(record?.isActive), featured: Boolean(record?.featured || record?.isFeatured), illustrative: Boolean(record?.illustrative), order: Number(record?.order || 1), publishedDate: String(record?.publishedDate || new Date().toISOString().slice(0, 10)) });
  const [busy, setBusy] = useState(false); const [uploading, setUploading] = useState(false); const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState<PreparedImage | null>(null);
  const saving = useRef(false);
  function field<K extends keyof typeof form>(name: K, value: typeof form[K]) { setForm(current => ({ ...current, [name]: value })); }
  async function submit(e: FormEvent) {
    e.preventDefault();
    if (saving.current || uploading) return;
    setError('');
    if (kind !== 'gallery_categories' && !(/^\/parfum-bahari\/[^\s]+$|^https:\/\/[^\s]+$/i.test(form.imageUrl) || MEDIA_PATH.test(form.imageUrl))) { setError('Lütfen bir fotoğraf seçin.'); return; }
    if (kind === 'gallery_items' && !categories.some(category => category.id === form.categoryId)) { setError('Önce bir galeri kategorisi seçin veya kategori oluşturun.'); return; }
    if (!Number.isFinite(form.order) || form.order < 0) { setError('Sıra numarası sıfır veya pozitif olmalı.'); return; }
    saving.current = true;
    setBusy(true);
    const now = new Date().toISOString();
    try {
      let data: Record<string, unknown> = { title: form.title.trim(), description: form.description.trim(), brand: 'parfum-bahari', isActive: form.isActive, order: form.order, updatedAt: now, ...(!record ? { createdAt: now } : {}) };
      if (kind === 'haberler') data = { ...data, slug: record ? record.slug : slugify(form.slug || form.title), excerpt: form.description.trim(), content: form.content.trim(), imageUrl: form.imageUrl, category: form.category.trim(), author: 'Parfum Bahari', publishedDate: form.publishedDate, readTime: `${Math.max(1, Math.ceil(form.content.split(/\s+/).length / 200))} dk okuma`, featured: form.featured, illustrative: form.illustrative, tags: [] };
      if (kind === 'gallery_items') data = { ...data, imageUrl: form.imageUrl, thumbnailUrl: form.imageUrl, categoryId: form.categoryId, categoryName: String(categories.find(category => category.id === form.categoryId)?.name || ''), isFeatured: form.featured, illustrative: form.illustrative, tags: [] };
      if (kind === 'gallery_categories') { data = { ...data, name: form.title.trim(), color: '#c6a46b', icon: 'flower' }; delete data.title; }
      // Save the photo and content atomically: cancelling or a failed save leaves no orphan upload.
      const media = selectedImage ? {
        data: Bytes.fromUint8Array(new Uint8Array(await selectedImage.blob.arrayBuffer())),
        contentType: selectedImage.blob.type,
        width: selectedImage.width,
        height: selectedImage.height,
        createdAt: now,
      } : null;
      if (!record && kind === 'haberler') {
        if (!data.slug) throw new Error('Geçerli bir bağlantı adı girin.');
        const location = doc(db, kind, String(data.slug));
        await runTransaction(db, async transaction => { const existing = await transaction.get(location); if (existing.exists()) throw new Error('Bu bağlantı adı zaten kullanılıyor. Farklı bir ad seçin.'); transaction.set(location, data); if (selectedImage && media) transaction.set(doc(db, 'media', selectedImage.id), media); });
      } else {
        const batch = writeBatch(db);
        if (record) batch.update(doc(db, kind, record.id), data);
        else batch.set(doc(collection(db, kind)), data);
        if (selectedImage && media) batch.set(doc(db, 'media', selectedImage.id), media);
        await batch.commit();
      }
      const warning = await refreshPublicContent(kind);
      onSaved(warning);
    } catch (e) { setError(messageFor(e)); } finally { saving.current = false; setBusy(false); }
  }
  return <Modal title={`${record ? 'Düzenle' : 'Yeni'} · ${labels[kind].singular}`} onClose={onClose} busy={busy || uploading}><form className="admin-editor" onSubmit={submit}><label>{kind === 'gallery_categories' ? 'Kategori adı' : 'Başlık'}<input required maxLength={180} value={form.title} onChange={e => field('title', e.target.value)} /></label>{kind === 'haberler' && <div className="admin-field-grid"><label>Bağlantı adı<input value={form.slug} disabled={!!record} onChange={e => field('slug', slugify(e.target.value))} placeholder={slugify(form.title) || 'yazi-basligi'} /><small>{record ? 'Mevcut yazının bağlantısı korunur.' : 'Boş bırakırsanız başlıktan oluşturulur.'}</small></label><label>Kategori<input required value={form.category} maxLength={80} onChange={e => field('category', e.target.value)} /></label></div>}<label>{kind === 'haberler' ? 'Kısa açıklama' : 'Açıklama'}<textarea required rows={3} maxLength={600} value={form.description} onChange={e => field('description', e.target.value)} /></label>{kind === 'haberler' && <label>Yazı içeriği<textarea required rows={14} maxLength={40000} value={form.content} onChange={e => field('content', e.target.value)} /><small>Paragraflar arasında boş satır bırakın. Kısa, noktasız satırlar ara başlık olarak görünür.</small></label>}{kind === 'gallery_items' && <label>Galeri kategorisi<select required value={form.categoryId} onChange={e => field('categoryId', e.target.value)}><option value="">Kategori seçin</option>{categories.map(category => <option value={category.id} key={category.id}>{String(category.name)}{!category.isActive ? ' (taslak — sitede görünmez)' : ''}</option>)}</select></label>}{kind !== 'gallery_categories' && <ImagePicker value={form.imageUrl} selected={selectedImage} onSelect={(image, value) => { setSelectedImage(image); setForm(current => ({ ...current, imageUrl: value, illustrative: !image })); }} onBusy={setUploading} disabled={busy} label={kind === 'gallery_items' ? 'Galeri fotoğrafı' : 'Kapak fotoğrafı'} />}<div className="admin-field-grid"><label>Sıra numarası<input type="number" min="0" max="9999" required value={form.order} onChange={e => field('order', Number(e.target.value))} /></label>{kind === 'haberler' && <label>Yayın tarihi<input type="date" required value={form.publishedDate} onChange={e => field('publishedDate', e.target.value)} /></label>}</div><div className="admin-checkboxes"><label><input type="checkbox" checked={form.isActive} onChange={e => field('isActive', e.target.checked)} /> Sitede yayınla</label>{kind !== 'gallery_categories' && <><label><input type="checkbox" checked={form.featured} onChange={e => field('featured', e.target.checked)} /> Ana sayfada öne çıkar</label><label><input type="checkbox" checked={form.illustrative} onChange={e => field('illustrative', e.target.checked)} /> Görsel temsilî / yapay zekâ ile üretildi</label></>}</div>{error && <p className="admin-error" role="alert">{error}</p>}<div className="admin-form-actions"><button type="button" className="admin-button secondary" onClick={onClose} disabled={busy || uploading}>Vazgeç</button><button type="submit" className="admin-button" disabled={busy || uploading}>{busy ? selectedImage ? 'Fotoğraf yükleniyor ve kaydediliyor…' : 'Kaydediliyor…' : form.isActive ? 'Kaydet & yayınla' : 'Taslağı kaydet'}<FiCheck /></button></div></form></Modal>;
}
