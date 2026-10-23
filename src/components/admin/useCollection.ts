'use client';
import { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
export type ContentRecord = { id: string; [key: string]: unknown };
export function messageFor(error: unknown): string {
  const code = typeof error === 'object' && error !== null && 'code' in error ? String(error.code) : '';
  if (code.includes('permission-denied') || code.includes('unauthorized')) return 'Erişim reddedildi. Firebase yönetici kaydını ve yayınlanmış güvenlik kurallarını kontrol edin.';
  if (code.includes('storage')) return 'Görsel yüklenemedi. Firebase Storage hizmetinin ve storage.rules kurallarının yayınlandığından emin olun.';
  return error instanceof Error ? error.message : 'İşlem tamamlanamadı. Lütfen yeniden deneyin.';
}
export function useCollection(name: string) {
  const [state, setState] = useState<{ items: ContentRecord[]; loading: boolean; error: string }>({ items: [], loading: true, error: '' });
  const [revision, setRevision] = useState(0);
  useEffect(() => onSnapshot(collection(db, name), snapshot => setState({ items: snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as ContentRecord)).filter(item => !['products', 'haberler', 'gallery_items', 'gallery_categories'].includes(name) || item.brand === 'parfum-bahari'), loading: false, error: '' }), error => setState({ items: [], loading: false, error: messageFor(error) })), [name, revision]);
  return { ...state, reload: () => { setState(value => ({ ...value, loading: true, error: '' })); setRevision(value => value + 1); } };
}
export function displayDate(value: unknown) {
  const date = typeof value === 'object' && value !== null && 'toDate' in value && typeof value.toDate === 'function' ? value.toDate() : new Date(String(value || ''));
  return date instanceof Date && !Number.isNaN(date.getTime()) ? date.toLocaleDateString('tr-TR') : '—';
}
