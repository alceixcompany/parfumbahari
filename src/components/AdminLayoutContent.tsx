'use client';
import { usePathname } from 'next/navigation';
import AdminSidebar from './AdminSidebar';
export default function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  if (path === '/admin/login') return <div className="admin-theme">{children}</div>;
  return <div className="admin-theme admin-shell"><AdminSidebar /><div className="admin-workspace"><div className="admin-topline"><span>PARFUM BAHARI <i /> İÇERİK STÜDYOSU</span><span>Parfum Bahari</span></div><main className="admin-main" id="main">{children}</main></div></div>;
}
