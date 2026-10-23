'use client';

import Image from 'next/image';
import { useEffect, useId, useRef, useState } from 'react';
import { FiCheckCircle, FiImage, FiUploadCloud } from 'react-icons/fi';
import { IMAGE_ACCEPT, prepareImage, type PreparedImage } from '@/lib/imageUpload';

const assets = [{ src: '/parfum-bahari/hero.webp', title: 'Koleksiyon atmosferi' }, { src: '/parfum-bahari/fleur.webp', title: 'Fleur de Bahar' }, { src: '/parfum-bahari/santal.webp', title: 'Santal Noir' }, { src: '/parfum-bahari/neroli.webp', title: 'Neroli Soleil' }, { src: '/parfum-bahari/rose.webp', title: 'Rose de Soie' }, { src: '/parfum-bahari/ambre.webp', title: 'Ambre Doré' }, { src: '/parfum-bahari/vetiver.webp', title: 'Bleu Vétiver' }];

export default function ImagePicker({ value, selected, onSelect, onBusy, disabled = false, label = 'Kapak fotoğrafı' }: {
  value: string;
  selected: PreparedImage | null;
  onSelect: (image: PreparedImage | null, value: string) => void;
  onBusy: (value: boolean) => void;
  disabled?: boolean;
  label?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState('');
  const [dragging, setDragging] = useState(false);
  const lock = useRef(false);
  const inputId = useId();
  const unavailable = busy || disabled;

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  async function choose(files: FileList | null) {
    if (!files?.length || lock.current || disabled) return;
    setError('');
    if (files.length !== 1) { setError('Her kayıt için bir fotoğraf seçin.'); return; }
    lock.current = true;
    setBusy(true);
    onBusy(true);
    try {
      const image = await prepareImage(files[0]);
      setPreview(URL.createObjectURL(image.blob));
      onSelect(image, `/api/media/${image.id}`);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Fotoğraf hazırlanamadı. Lütfen tekrar deneyin.');
    } finally {
      lock.current = false;
      setBusy(false);
      onBusy(false);
    }
  }

  const previewSrc = selected ? preview : value;
  return <fieldset className="admin-image-picker" disabled={disabled} aria-busy={unavailable}>
    <legend>{label}</legend>
    {previewSrc && <div className="admin-image-preview">
      <Image src={previewSrc} alt="Seçilen fotoğrafın önizlemesi" width={640} height={400} unoptimized />
      <span>{selected ? selected.name : 'Mevcut fotoğraf'}</span>
    </div>}
    <label htmlFor={inputId} className={`admin-photo-dropzone${dragging ? ' dragging' : ''}${unavailable ? ' busy' : ''}`}
      onDragOver={event => { event.preventDefault(); if (!unavailable) setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={event => { event.preventDefault(); setDragging(false); void choose(event.dataTransfer.files); }}>
      <FiUploadCloud aria-hidden="true" />
      <strong>{busy ? 'Fotoğraf hazırlanıyor…' : value ? 'Fotoğrafı değiştir' : 'Fotoğraf seç'}</strong>
      <span>Bilgisayarınızdan veya telefonunuzdan seçin</span>
      <small>Bilgisayarda fotoğrafı bu alana sürükleyebilirsiniz.</small>
      <input id={inputId} type="file" accept={IMAGE_ACCEPT} disabled={unavailable}
        aria-label={value ? 'Fotoğrafı değiştir' : 'Fotoğraf seç'} aria-describedby={`${inputId}-help`}
        onChange={event => { void choose(event.target.files); event.target.value = ''; }} />
    </label>
    <small id={`${inputId}-help`}>JPG, PNG, WebP, AVIF veya HEIC · En fazla 20 MB. Fotoğraflar site için otomatik küçültülür.</small>
    <div aria-live="polite">{busy ? <p className="admin-photo-status">Fotoğraf hazırlanıyor, lütfen bekleyin…</p> : selected && <p className="admin-photo-status"><FiCheckCircle aria-hidden="true" /> Fotoğraf hazır. Kaydettiğinizde yüklenecek.</p>}</div>
    {error && <p className="admin-error" role="alert">{error}</p>}
    <details className="admin-stock-photos"><summary><FiImage aria-hidden="true" /> Hazır görsellerden seç</summary>
      <div className="admin-asset-grid">{assets.map(asset => <button key={asset.src} type="button" disabled={unavailable}
        onClick={() => { setError(''); setPreview(''); onSelect(null, asset.src); }} aria-label={asset.title} aria-pressed={value === asset.src}>
        <Image src={asset.src} alt={asset.title} width={160} height={100} /><span>{asset.title}</span>
      </button>)}</div>
      <small>Hazır görseller temsilî olarak işaretlenir.</small>
    </details>
  </fieldset>;
}
