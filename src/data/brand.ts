export const business = {
  name: 'Parfum Bahari',
  tagline: 'Bir koku. Binbir his.',
  phone: process.env.NEXT_PUBLIC_CONTACT_PHONE || '',
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || '',
  address: process.env.NEXT_PUBLIC_CONTACT_ADDRESS || '',
  instagram: process.env.NEXT_PUBLIC_INSTAGRAM_URL || '',
};
export const navigation = [
  { label: 'Ana Sayfa', href: '/' },
  { label: 'Hakkımızda', href: '/hakkimizda' },
  { label: 'Ürün Kataloğu', href: '/urun-katalogu' },
  { label: 'Koku Günlüğü', href: '/haberler' },
];
