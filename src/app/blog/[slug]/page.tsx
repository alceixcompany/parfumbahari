import { permanentRedirect } from 'next/navigation';
export default async function LegacyArticle({ params }: { params: Promise<{ slug: string }> }) { permanentRedirect(`/haberler/${encodeURIComponent((await params).slug)}`); }
