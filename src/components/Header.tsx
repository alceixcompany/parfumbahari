'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiArrowUpRight, FiHeart, FiMenu, FiSearch, FiX } from 'react-icons/fi';
import BrandMark from './BrandMark';
import { business, navigation, catalogueNavigation } from '@/data/brand';
import { useFavourites } from './brand/Favourites';
export default function Header() {
  const pathname = usePathname(); const [open, setOpen] = useState(false); const button = useRef<HTMLButtonElement>(null); const { items } = useFavourites();
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const background = [document.querySelector('main'), document.querySelector('footer')].filter((element): element is HTMLElement => element instanceof HTMLElement);
    background.forEach(element => { element.inert = true; });
    const first = document.querySelector<HTMLAnchorElement>('#mobile-navigation a');
    first?.focus();
    const keyboard = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setOpen(false); button.current?.focus(); }
      if (e.key === 'Tab') {
        const links = Array.from(document.querySelectorAll<HTMLElement>('#mobile-navigation a'));
        const focusable = [button.current, ...links].filter((element): element is HTMLElement => element !== null);
        if (e.shiftKey && document.activeElement === focusable[0]) { e.preventDefault(); focusable.at(-1)?.focus(); }
        else if (!e.shiftKey && document.activeElement === focusable.at(-1)) { e.preventDefault(); focusable[0]?.focus(); }
      }
    };
    document.addEventListener('keydown', keyboard);
    return () => { document.body.style.overflow = previous; background.forEach(element => { element.inert = false; }); document.removeEventListener('keydown', keyboard); };
  }, [open]);
  if (pathname.startsWith('/admin')) return null;
  return <><a className="skip-link" href="#main">İçeriğe geç</a><div className="announcement"><span>{business.tagline}</span><Link href="/urun-katalogu">Koleksiyona göz atın <FiArrowUpRight /></Link></div><header className="site-header"><div className="container header-inner"><Link href="/" aria-label="Parfum Bahari ana sayfa" onClick={() => setOpen(false)}><BrandMark /></Link><nav className="desktop-nav" aria-label="Ana menü">{navigation.map(item => <div className="desktop-nav-item" key={item.href}><Link href={item.href} aria-current={(item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)) ? 'page' : undefined}>{item.label}</Link>{item.href === '/urun-katalogu' && <div className="header-category-menu">{catalogueNavigation.map(category => <Link href={category.href} key={category.href}>{category.label}</Link>)}</div>}</div>)}</nav><div className="header-actions"><Link href="/urun-katalogu?ara=1" onClick={() => setOpen(false)} className="icon-link" aria-label="Katalogda koku ara"><FiSearch /></Link><Link href="/urun-katalogu?favoriler=1" onClick={() => setOpen(false)} className="icon-link" aria-label={`Favorilerim, ${items.length} ürün`}><FiHeart />{items.length > 0 && <span className="favourites-count">{items.length}</span>}</Link><button ref={button} className="menu-toggle" aria-label={open ? 'Menüyü kapat' : 'Menüyü aç'} aria-expanded={open} aria-controls="mobile-navigation" onClick={() => setOpen(!open)}>{open ? <FiX /> : <FiMenu />}</button></div></div>{open && <nav id="mobile-navigation" className="mobile-nav" aria-label="Mobil menü">{navigation.map((item, i) => <Link href={item.href} key={item.href} onClick={() => setOpen(false)} aria-current={pathname === item.href ? 'page' : undefined}><small>0{i + 1}</small>{item.label}<FiArrowUpRight /></Link>)}<div className="mobile-catalogue-links">{catalogueNavigation.map(category => <Link href={category.href} key={category.href} onClick={() => setOpen(false)}>{category.label}</Link>)}</div><p>{business.tagline}</p></nav>}</header></>;
}
