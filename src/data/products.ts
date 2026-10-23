import catalogue from './products.json';
export type Product = {
  id: string; slug: string; name: string; subtitle: string; category: 'Kadın' | 'Erkek' | 'Unisex';
  family: string; image: string; description: string; story: string; concentration: string;
  sizes: number[]; topNotes: string[]; heartNotes: string[]; baseNotes: string[];
  mood: string; season: string; badge: string; featured: boolean; isActive: boolean; order: number;
};
export const products = catalogue as Product[];
