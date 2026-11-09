'use client';
import { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
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
  useEffect(() => {
    if (!['products', 'product_categories'].includes(name)) return onSnapshot(collection(db, name), snapshot => setState({ items: snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as ContentRecord)).filter(item => !['haberler', 'gallery_items', 'gallery_categories'].includes(name) || item.brand === 'parfum-bahari'), loading: false, error: '' }), error => setState({ items: [], loading: false, error: messageFor(error) }));
    const controller = new AbortController();
    let loading = false;
    async function read() {
      if (loading || controller.signal.aborted) return;
      loading = true;
      const requestController = new AbortController();
      const cancel = () => requestController.abort();
      controller.signal.addEventListener('abort', cancel, { once: true });
      let deadline: ReturnType<typeof setTimeout> | undefined;
      try {
        const load = async (): Promise<ContentRecord[]> => {
          await auth.authStateReady();
          const user = auth.currentUser;
          if (!user) throw new Error('Yönetici oturumunuz bulunamadı. Lütfen yeniden giriş yapın.');
          const response = await fetch(`/api/admin/collections/${name}`, { headers: { Authorization: `Bearer ${await user.getIdToken()}` }, cache: 'no-store', signal: requestController.signal });
          const data = await response.json();
          if (!response.ok) throw new Error(data.message || 'Liste yüklenemedi. Lütfen yeniden deneyin.');
          if (!Array.isArray(data.items)) throw new Error('Liste yanıtı geçersiz. Lütfen yeniden deneyin.');
          return data.items;
        };
        const timeout = new Promise<ContentRecord[]>((_, reject) => {
          deadline = setTimeout(() => { reject(new Error('Bağlantı zaman aşımına uğradı. Listeyi yeniden yükleyin.')); requestController.abort(); }, 15000);
        });
        const items = await Promise.race([load(), timeout]);
        if (!controller.signal.aborted) setState({ items, loading: false, error: '' });
      } catch (error) {
        if (!controller.signal.aborted) setState({ items: [], loading: false, error: error instanceof Error && error.name === 'TimeoutError' ? 'Bağlantı zaman aşımına uğradı. Listeyi yeniden yükleyin.' : messageFor(error) });
      } finally { clearTimeout(deadline); controller.signal.removeEventListener('abort', cancel); loading = false; }
    }
    void read();
    const timer = window.setInterval(() => { if (!document.hidden) void read(); }, 30000);
    return () => { controller.abort(); window.clearInterval(timer); };
  }, [name, revision]);
  return { ...state, reload: () => { setState(value => ({ ...value, loading: true, error: '' })); setRevision(value => value + 1); } };
}
export function displayDate(value: unknown) {
  const date = typeof value === 'object' && value !== null && 'toDate' in value && typeof value.toDate === 'function' ? value.toDate() : new Date(String(value || ''));
  return date instanceof Date && !Number.isNaN(date.getTime()) ? date.toLocaleDateString('tr-TR') : '—';
}
