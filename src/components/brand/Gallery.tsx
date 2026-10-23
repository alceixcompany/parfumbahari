'use client';
import Image from 'next/image';
import { useRef, useState } from 'react';
import { FiMaximize2, FiX } from 'react-icons/fi';
import type { GalleryContent } from '@/lib/publicContent';
export default function Gallery({ items }: { items: GalleryContent[] }) {
  const [filter, setFilter] = useState('Tümü'); const [selected, setSelected] = useState<GalleryContent | null>(null); const dialog = useRef<HTMLDialogElement>(null);
  const tags = ['Tümü', ...new Set(items.map(item => item.tag))];
  function open(item: GalleryContent) { setSelected(item); dialog.current?.showModal(); }
  function close() { dialog.current?.close(); }
  return <section className="section gallery-section"><div className="container"><div className="gallery-toolbar" role="group" aria-label="Galeri filtresi">{tags.map(tag => <button type="button" aria-pressed={tag === filter} key={tag} className={tag === filter ? 'active' : ''} onClick={() => setFilter(tag)}>{tag}</button>)}</div><div className="gallery-grid">{items.filter(item => filter === 'Tümü' || item.tag === filter).map(item => <article className="gallery-item" key={item.id}><button onClick={() => open(item)} aria-label={`${item.title} görselini büyüt`}><Image src={item.src} alt={item.title} fill sizes="(max-width: 760px) 45vw, 30vw" /><span><FiMaximize2 /></span></button><h3>{item.title}</h3><p>{item.tag}</p></article>)}</div><p className="catalogue-footnote">Parfum Bahari’nin koku dünyasını yansıtan temsilî koleksiyon görselleri.</p></div><dialog ref={dialog} className="gallery-modal" aria-label={selected?.title || 'Görsel önizleme'} onClick={e => { if (e.target === dialog.current) close(); }}><button onClick={close} className="gallery-modal-close" aria-label="Görseli kapat"><FiX /></button>{selected && <><div className="gallery-modal-photo"><Image src={selected.src} alt={selected.title} fill sizes="90vw" /></div><h2>{selected.title}</h2><p>{selected.description}</p></>}</dialog></section>;
}
