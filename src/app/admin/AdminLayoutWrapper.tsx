import '@/app/admin.css';
import Link from 'next/link';
import { FiArrowUpRight, FiBookOpen, FiDatabase, FiPackage } from 'react-icons/fi';
import { CONTENT_SOURCE, FIREBASE_CONFIGURED } from '@/lib/contentSource';
import { products } from '@/data/products';
import starter from '@/data/starter-content.json';
import BrandMark from '@/components/BrandMark';
import CloudAdmin from '@/components/admin/CloudAdmin';
export default function AdminLayoutWrapper({ children }: { children: React.ReactNode }) {
  if (CONTENT_SOURCE === 'firebase' && FIREBASE_CONFIGURED) return <CloudAdmin>{children}</CloudAdmin>;
  return <main id="main" className="static-studio"><div className="container"><Link href="/"><BrandMark /></Link><p className="eyebrow">YEREL İÇERİK STÜDYOSU</p><h1>Her şey burada.<br /><em>Şimdilik statik.</em></h1><p>Site Firebase bağlantısı olmadan, projedeki içerik dosyalarıyla çalışıyor. Bu ekran yalnızca herkese açık içeriklerin önizlemesidir; yönetici girişi ve veritabanına yazma kapalıdır.</p><div className="static-studio-grid"><Link href="/urun-katalogu"><FiPackage /><strong>{products.length}</strong><span>Parfüm</span><FiArrowUpRight /></Link><Link href="/haberler"><FiBookOpen /><strong>{starter.haberler.length}</strong><span>Koku yazısı</span><FiArrowUpRight /></Link><Link href="/galeri"><FiDatabase /><strong>{starter.gallery_items.length}</strong><span>Galeri görseli</span><FiArrowUpRight /></Link></div><div className="static-studio-note"><h2>İçerik kaynakları</h2><p>Ürünler: <code>src/data/products.json</code><br />Yazılar ve galeri: <code>src/data/starter-content.json</code><br />Marka bilgileri: <code>src/data/brand.ts</code></p><p>Firebase’e geçiş adımları <code>docs/firebase-setup.md</code> içinde. Hazırlanmış yönetim paneli, güvenli oturum ve içerik içe aktarma altyapısı korunuyor.</p></div><Link href="/" className="text-link">Siteye dön <FiArrowUpRight /></Link></div></main>;
}
