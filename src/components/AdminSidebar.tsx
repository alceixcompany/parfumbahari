'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { FiGrid, FiImage, FiFileText, FiSettings, FiLogOut, FiX, FiMenu, FiArrowUpRight, FiPackage } from 'react-icons/fi';
import BrandMark from './BrandMark';
import { useAuth } from '@/hooks/useAuth';
const links = [{ href: '/admin', label: 'Genel bakış', icon: FiGrid }, { href: '/admin/urunler', label: 'Ürün kataloğu', icon: FiPackage }, { href: '/admin/haberler', label: 'Blog & haberler', icon: FiFileText }, { href: '/admin/galeri', label: 'Galeri', icon: FiImage }, { href: '/admin/ayarlar', label: 'Hesap ayarları', icon: FiSettings }];
export default function AdminSidebar() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');
  const path = usePathname(); const router = useRouter(); const { user, logout } = useAuth();
  useEffect(() => { if (!open) return; const escape = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); }; document.addEventListener('keydown', escape); return () => document.removeEventListener('keydown', escape); }, [open]);
  async function signOut() { const result = await logout(); if (result.success) router.replace('/admin/login'); else setError(result.error || 'Çıkış yapılamadı.'); }
  return <><button className="admin-menu-toggle" onClick={() => setOpen(!open)} aria-label={open ? 'Menüyü kapat' : 'Menüyü aç'} aria-expanded={open} aria-controls="admin-navigation">{open ? <FiX /> : <FiMenu />}</button>{open && <button className="admin-backdrop" aria-label="Menüyü kapat" onClick={() => setOpen(false)} />}
    <aside className={`admin-sidebar ${open ? 'open' : ''}`} id="admin-navigation"><Link href="/admin" className="admin-brand" aria-label="Parfum Bahari yönetim paneli" onClick={() => setOpen(false)}><BrandMark /></Link><p className="admin-nav-label">YÖNETİM PANELİ</p><nav aria-label="Yönetim menüsü">{links.map(({ href, label, icon: Icon }) => <Link href={href} key={href} aria-current={path === href ? 'page' : undefined} onClick={() => setOpen(false)}><Icon /><span>{label}</span></Link>)}</nav><div className="admin-sidebar-bottom"><Link href="/" target="_blank">Siteyi görüntüle <FiArrowUpRight /></Link><div className="admin-user"><span><FiPackage /></span><div><strong>Parfum Bahari</strong><small>{user?.email}</small></div></div>{error && <p role="alert">{error}</p>}<button onClick={signOut}><FiLogOut /> Güvenli çıkış</button></div></aside></>;
}
