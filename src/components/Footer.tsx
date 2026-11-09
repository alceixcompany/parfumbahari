'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiArrowUp, FiArrowUpRight, FiInstagram } from 'react-icons/fi';
import BrandMark from './BrandMark';
import { business, navigation } from '@/data/brand';
export default function Footer() {
  const path = usePathname(); if (path.startsWith('/admin')) return null;
  return <footer className="site-footer"><div className="container"><div className="footer-main"><div className="footer-brand"><Link href="/" aria-label="Parfum Bahari ana sayfa"><BrandMark /></Link><p>Bazen bir an, bazen bir insan.<br />Bazen de sadece kendiniz için.</p><span className="footer-signature">Kokunuz, hikâyeniz olsun.</span></div><div><p className="footer-label">PARFUM BAHARI</p><nav aria-label="Alt menü">{navigation.slice(1).map(item => <Link href={item.href} key={item.href}>{item.label}</Link>)}<Link href="/galeri">Koku Dünyamız</Link></nav></div><div><p className="footer-label">KOKUNUZU BULUN</p><nav aria-label="Koleksiyonlar"><Link href="/urun-katalogu">Tüm Koleksiyon <FiArrowUpRight /></Link><Link href="/urun-katalogu?favoriler=1">Favorilerim</Link><Link href="/haberler">Blog</Link></nav></div><div className="footer-invitation"><p className="footer-label">KENDİNİZE YAKIN BİR KOKU</p><p>Bir nota, bir his.<br />Kendi kokunuzu bulun.</p><Link className="text-link" href="/urun-katalogu">Koleksiyonu keşfedin <FiArrowUpRight /></Link>{business.instagram && <a href={business.instagram} target="_blank" rel="noopener noreferrer" className="social-link"><FiInstagram /> Instagram</a>}</div></div><div className="footer-bottom"><span>© {new Date().getFullYear()} Parfum Bahari. Tüm hakları saklıdır.</span><Link href="/gizlilik-politikasi">Gizlilik Politikası</Link><a href="#main" className="back-top">Başa dön <FiArrowUp /></a></div></div></footer>;
}
