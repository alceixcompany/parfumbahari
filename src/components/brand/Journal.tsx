import Image from 'next/image';
import Link from 'next/link';
import { FiArrowUpRight } from 'react-icons/fi';
import type { BlogPost } from '@/data/blogPosts';
export default function Journal({ posts, full = false }: { posts: BlogPost[]; full?: boolean }) {
  if (!posts.length) return null;
  return <section className={`section journal-section ${full ? 'journal-full' : ''}`}><div className="container">{!full && <div className="section-heading"><div><p className="eyebrow">KOKU GÜNLÜĞÜ</p><h2>Kokunun <em>ötesinde.</em></h2></div><Link href="/haberler" className="text-link">Tüm yazılar <FiArrowUpRight /></Link></div>}<div className="journal-grid">{posts.map((post, i) => <article className="journal-card" key={post.slug}><Link href={`/haberler/${post.slug}`} className="journal-image"><Image src={post.image} alt={post.title} fill sizes="(max-width: 650px) 90vw, 32vw" /><span>0{i + 1}</span></Link><div className="journal-meta"><span>{post.category}</span><span>{post.readTime}</span></div><Link href={`/haberler/${post.slug}`}><h3>{post.title}</h3></Link><p>{post.excerpt}</p><Link href={`/haberler/${post.slug}`} className="journal-read" aria-label={`${post.title} yazısını oku`}>Okumaya devam et <FiArrowUpRight /></Link></article>)}</div></div></section>;
}
