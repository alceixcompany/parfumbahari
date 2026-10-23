'use client';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { checkAuthState } from '@/store/slices/authSlice';
export default function AdminAuth({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector(state => state.auth);
  const [ready, setReady] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const login = pathname === '/admin/login';
  useEffect(() => { let mounted = true; dispatch(checkAuthState()).finally(() => { if (mounted) setReady(true); }); return () => { mounted = false; }; }, [dispatch]);
  useEffect(() => { if (!ready) return; if (!isAuthenticated && !login) router.replace('/admin/login'); if (isAuthenticated && login) router.replace('/admin'); }, [ready, isAuthenticated, login, router]);
  if (!ready) return <div className="admin-loading" role="status"><span />Yönetim paneli hazırlanıyor…</div>;
  return isAuthenticated || login ? children : null;
}
