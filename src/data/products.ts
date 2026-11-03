import catalogue from './products.json';
export type Product = {
  id: string; slug: string; name: string;
  image: string; images?: string[]; story: string; concentration: string;
  mood: string; season: string; badge: string; featured: boolean; isActive: boolean; order: number;
};
export const products = catalogue as Product[];
