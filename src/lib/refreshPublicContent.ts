'use client';

import { auth } from './firebase';
import type { PublicCollection } from './contentCache';

// A refresh failure must not turn an already-committed save into a reported save failure.
export async function refreshPublicContent(collection: PublicCollection | PublicCollection[]): Promise<string> {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('Missing session');
    const response = await fetch('/api/admin/revalidate', {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${await user.getIdToken()}` },
      body: JSON.stringify({ collections: Array.isArray(collection) ? collection : [collection] }), signal: AbortSignal.timeout(12000),
    });
    if (!response.ok) throw new Error('Refresh failed');
    return '';
  } catch { return ' Kayıt tamamlandı; site önbelleği yenilenemedi. Değişiklikler site önbelleği başarıyla yenilendiğinde görünür.'; }
}
