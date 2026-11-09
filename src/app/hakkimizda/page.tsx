import { pageMetadata, getBreadcrumbSchema } from '@/lib/seo';
import { PageIntro, Story, ValuesStrip, DiscoveryBanner } from '@/components/brand/Sections';
export const metadata = pageMetadata({ title: 'Hakkımızda — Parfum Bahari', description: 'Yıllardır parfüm sektöründe toptan ve perakende satış tecrübemizle, seçkin parfümleri toptancı güvencesi ve perakende rahatlığıyla sizlerle buluşturuyoruz.', path: '/hakkimizda' });
export default function AboutPage() {
  return <main id="main"><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(getBreadcrumbSchema([{ name: 'Hakkımızda', path: '/hakkimizda' }])) }} /><PageIntro eyebrow="HAKKIMIZDA" title="İyi kokular" emphasis="tesadüf değil." description="Toptancı güvencesi, perakende rahatlığı. İyi ki varsınız, iyi ki Parfumbahari.com ♥️" /><Story full /><ValuesStrip /><DiscoveryBanner /></main>;
}
