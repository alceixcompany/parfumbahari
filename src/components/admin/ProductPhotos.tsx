'use client';

import Image from 'next/image';
import { useEffect, useId, useRef, useState } from 'react';
import { FiCheck, FiImage, FiUploadCloud, FiX } from 'react-icons/fi';
import { IMAGE_ACCEPT, prepareImage, type PreparedImage } from '@/lib/imageUpload';
import { MAX_PRODUCT_IMAGES } from '@/lib/productImages';

type Props = {
  images: string[];
  cover: string;
  prepared: PreparedImage[];
  onChange: (images: string[], cover: string, prepared: PreparedImage[]) => void;
  onBusy: (busy: boolean) => void;
  disabled: boolean;
};

export default function ProductPhotos({ images, cover, prepared, onChange, onBusy, disabled }: Props) {
  const inputId = useId();
  const previews = useRef(new Map<string, string>());
  const lock = useRef(false);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState('');
  const [error, setError] = useState('');
  const [previewSources, setPreviewSources] = useState<Record<string, string>>({});
  const [dragging, setDragging] = useState(false);
  const unavailable = disabled || busy;

  useEffect(() => {
    const urls = previews.current;
    return () => { urls.forEach(url => URL.revokeObjectURL(url)); urls.clear(); };
  }, []);

  async function choose(files: FileList | null) {
    if (!files?.length || lock.current || disabled) return;
    setError('');
    if (images.length + files.length > MAX_PRODUCT_IMAGES) {
      setError(`Bir ürüne en fazla ${MAX_PRODUCT_IMAGES} fotoğraf ekleyebilirsiniz.`);
      return;
    }
    lock.current = true;
    setBusy(true);
    onBusy(true);
    const added: PreparedImage[] = [];
    const errors: string[] = [];
    try {
      // Decode and compress sequentially so large camera photos do not fill memory.
      for (const [index, file] of Array.from(files).entries()) {
        setProgress(`${index + 1} / ${files.length} fotoğraf hazırlanıyor…`);
        try {
          const photo = await prepareImage(file);
          const src = `/api/media/${photo.id}`;
          previews.current.set(src, URL.createObjectURL(photo.blob));
          added.push(photo);
        } catch (error) {
          errors.push(`${file.name}: ${error instanceof Error ? error.message : 'Fotoğraf hazırlanamadı.'}`);
        }
      }
      if (added.length) {
        setPreviewSources(Object.fromEntries(previews.current));
        const next = [...images, ...added.map(photo => `/api/media/${photo.id}`)];
        onChange(next, cover || next[0], [...prepared, ...added]);
      }
      if (errors.length) setError(errors.join(' '));
    } finally {
      lock.current = false;
      setBusy(false);
      onBusy(false);
      setProgress('');
    }
  }

  function remove(src: string) {
    const next = images.filter(image => image !== src);
    const preview = previews.current.get(src);
    if (preview) { URL.revokeObjectURL(preview); previews.current.delete(src); }
    setPreviewSources(current => { const next = { ...current }; delete next[src]; return next; });
    onChange(next, cover === src ? next[0] || '' : cover, prepared.filter(photo => `/api/media/${photo.id}` !== src));
  }

  return <fieldset className="admin-image-picker admin-product-photos" disabled={unavailable} aria-busy={busy}>
    <legend>Ürün fotoğrafları</legend>
    <p className="admin-photos-help">Birden fazla fotoğraf ekleyin. Seçtiğiniz kapak, katalogda ve ürün sayfasında ilk sırada görünür.</p>
    {!!images.length && <div className="admin-product-photo-grid">
      {images.map((src, index) => <article key={src} className={cover === src ? 'is-cover' : ''}>
        <div className="admin-product-photo-preview">
          <Image src={previewSources[src] || src} alt={`${index + 1}. ürün fotoğrafı`} width={320} height={380} unoptimized />
          {cover === src && <span className="admin-cover-badge"><FiCheck /> Kapak</span>}
          <button type="button" disabled={unavailable} className="admin-photo-remove" aria-label={`${index + 1}. fotoğrafı kaldır`} onClick={() => remove(src)}><FiX /></button>
        </div>
        <button type="button" disabled={unavailable} className="admin-cover-select" aria-pressed={cover === src} onClick={() => onChange(images, src, prepared)}>
          {cover === src ? <><FiCheck /> Kapak fotoğrafı</> : <><FiImage /> Kapak yap</>}
        </button>
      </article>)}
    </div>}
    {images.length < MAX_PRODUCT_IMAGES && <label htmlFor={inputId} className={`admin-photo-dropzone${dragging ? ' dragging' : ''}${unavailable ? ' busy' : ''}`}
      onDragOver={event => { event.preventDefault(); if (!unavailable) setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={event => { event.preventDefault(); setDragging(false); if (!unavailable) void choose(event.dataTransfer.files); }}>
      <FiUploadCloud aria-hidden="true" />
      <strong>{busy ? progress : 'Fotoğraf ekle'}</strong>
      <span>Birden fazla dosya seçebilir veya buraya sürükleyebilirsiniz.</span>
      <input id={inputId} type="file" multiple accept={IMAGE_ACCEPT} disabled={unavailable} aria-label="Ürün fotoğrafları ekle"
        onChange={event => { const files = event.target.files; void choose(files); event.target.value = ''; }} />
    </label>}
    <small>{images.length} / {MAX_PRODUCT_IMAGES} fotoğraf · JPG, PNG, WebP, AVIF, HEIC · Fotoğraf başına en fazla 20 MB. Görseller otomatik küçültülür.</small>
    <div role="status" aria-live="polite">{busy ? <p className="admin-photo-status">{progress}</p> : !!prepared.length && <p className="admin-photo-status"><FiCheck /> {prepared.length} yeni fotoğraf hazır. Ürünü kaydettiğinizde yüklenecek.</p>}</div>
    {error && <p className="admin-error" role="alert">{error}</p>}
  </fieldset>;
}
