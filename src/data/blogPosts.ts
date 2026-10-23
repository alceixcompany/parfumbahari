import starter from './starter-content.json';
export type BlogPost = { slug: string; category: string; readTime: string; title: string; excerpt: string; image: string; publishedAt: string; publishedDate: string; modifiedDate?: string; paragraphs: string[]; tips: string[]; illustrative?: boolean; author?: string; featured?: boolean };
export const blogPosts: BlogPost[] = starter.haberler.map(post => ({ ...post, image: post.imageUrl, publishedAt: post.publishedDate, paragraphs: post.content.split('\n\n'), tips: [] }));
export const getBlogPost = (slug: string) => blogPosts.find(post => post.slug === slug);
