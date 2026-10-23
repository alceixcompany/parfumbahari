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
  { label: 'Hikâyemiz', href: '/hakkimizda' },
  { label: 'Ürün Kataloğu', href: '/urun-katalogu' },
  { label: 'Koku Günlüğü', href: '/haberler' },
];
export const fragranceFamilies = [
  { name: 'Çiçeksi', subtitle: 'Bir bahar sabahı gibi', image: '/parfum-bahari/fleur.webp', note: 'Gül · Yasemin · Manolya' },
  { name: 'Odunsu', subtitle: 'Sakin ve derin', image: '/parfum-bahari/santal.webp', note: 'Sandal · Sedir · Vetiver' },
  { name: 'Ferah', subtitle: 'Hafifliğin peşinde', image: '/parfum-bahari/neroli.webp', note: 'Bergamot · Neroli · Misk' },
  { name: 'Oryantal', subtitle: 'Sıcak bir iz bırakır', image: '/parfum-bahari/ambre.webp', note: 'Amber · Vanilya · Baharat' },
];
