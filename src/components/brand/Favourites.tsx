'use client';
import { useSyncExternalStore } from 'react';
import { FiHeart } from 'react-icons/fi';
const KEY = 'parfum-bahari-favourites';
const subscribe = (callback: () => void) => { window.addEventListener('storage', callback); window.addEventListener('bahari-favourites', callback); return () => { window.removeEventListener('storage', callback); window.removeEventListener('bahari-favourites', callback); }; };
const snapshot = () => { try { return localStorage.getItem(KEY) || '[]'; } catch { return '[]'; } };
const serverSnapshot = () => '[]';
export function useFavourites() {
  const raw = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  let items: string[] = [];
  try { const value: unknown = JSON.parse(raw); if (Array.isArray(value)) items = value.filter((id): id is string => typeof id === 'string'); } catch { /* Ignore invalid browser data. */ }
  function toggle(id: string) { try { const next = items.includes(id) ? items.filter(item => item !== id) : [...items, id]; localStorage.setItem(KEY, JSON.stringify(next)); window.dispatchEvent(new Event('bahari-favourites')); } catch { /* Storage may be unavailable in private browsing. */ } }
  return { items, toggle };
}
export default function FavouriteButton({ id, name, labelled = false }: { id: string; name: string; labelled?: boolean }) {
  const { items, toggle } = useFavourites(); const active = items.includes(id);
  return <button type="button" className={`favourite ${active ? 'saved' : ''} ${labelled ? 'labelled' : ''}`} onClick={() => toggle(id)} aria-label={`${name} ${active ? 'favorilerden çıkar' : 'favorilere ekle'}`} aria-pressed={active}><FiHeart />{labelled && <span>{active ? 'Favorilerimde' : 'Favorilerime ekle'}</span>}</button>;
}
