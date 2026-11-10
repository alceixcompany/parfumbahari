import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { FiArrowLeft, FiArrowUpRight } from 'react-icons/fi';
import { getPublishedPost, getRelatedPosts } from '@/lib/publicContent';
import { SITE_URL, pageMetadata, getBreadcrumbSchema } from '@/lib/seo';
import Journal from '@/components/brand/Journal';
type Props = { params: Promise<{ slug: string }> };
// Articles may be published after deployment; always read the current journal.
export const dynamic = 'force-dynamic';
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPublishedPost((await params).slug);
  return post ? pageMetadata({ title: post.title, description: post.excerpt, path: `/haberler/${post.slug}`, image: post.image, article: { publishedTime: post.publishedDate, author: post.author } }) : { title: 'Yazı bulunamadı', robots: { index: false, follow: false } };
}
export default async function Article({ params }: Props) {
  const post = await getPublishedPost((await params).slug); if (!post) notFound();
  const related = await getRelatedPosts(post.slug);
  const schema = [{ '@context': 'https://schema.org', '@type': 'BlogPosting', headline: post.title, description: post.excerpt, image: new URL(post.image, SITE_URL).href, datePublished: post.publishedDate, dateModified: post.modifiedDate || post.publishedDate, author: { '@type': 'Organization', name: 'Parfum Bahari', url: SITE_URL }, publisher: { '@id': `${SITE_URL}/#organization` }, inLanguage: 'tr-TR', mainEntityOfPage: `${SITE_URL}/haberler/${post.slug}` }, getBreadcrumbSchema([{ name: 'Blog', path: '/haberler' }, { name: post.title, path: `/haberler/${post.slug}` }])];
  return <main id="main"><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }} /><header className="article-header container"><Link href="/haberler" className="text-link"><FiArrowLeft /> Blog’a dön</Link><p className="eyebrow">{post.category} <span> / </span> {post.readTime}</p><h1>{post.title}</h1><p className="article-excerpt">{post.excerpt}</p><div className="article-byline">Parfum Bahari <span>·</span><time dateTime={post.publishedDate}>{new Date(post.publishedDate + 'T12:00:00Z').toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })}</time></div></header><div className="container"><div className="article-cover"><Image src={post.image} alt={post.title} fill priority sizes="90vw" /></div></div><article className="article-body">{post.paragraphs.map((p, i) => p.length < 85 && !/[.!?]$/.test(p) ? <h2 key={i}>{p}</h2> : <p key={i}>{p}</p>)}<Link href="/urun-katalogu" className="text-link">Kendi kokunuzu keşfedin <FiArrowUpRight /></Link></article><Journal posts={related} /></main>;
}
