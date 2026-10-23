import Link from 'next/link';
import { FiArrowUpRight } from 'react-icons/fi';
export default function NotFound() { return <main id="main" className="not-found"><p className="eyebrow">404 / KÜÇÜK BİR SAPAK</p><h1>Bu iz burada<br /><em>son buluyor.</em></h1><p>Aradığınız sayfa taşınmış veya artık yayında olmayabilir.<br />Koleksiyonda yeni bir koku keşfetmeye ne dersiniz?</p><Link href="/urun-katalogu" className="button">Koleksiyona dön <FiArrowUpRight /></Link></main>; }
