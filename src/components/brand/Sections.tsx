import Image from 'next/image';
import Link from 'next/link';
import { FiArrowUpRight } from 'react-icons/fi';
import { aboutParagraphs } from '@/data/about';
export { default as HomeHero } from './HeroSlider';
function Sparkle() {
  return <svg className="sparkle" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true" focusable="false"><path d="M12 2v20M2 12h20M5 5l14 14M5 19 19 5" /></svg>;
}
export function ValuesStrip() {
  return <div className="values-strip"><div className="container">{['Kendine özgü kokular', 'Özenle seçilmiş parfümler', 'Her ruh hâline bir hikâye'].map(item => <span key={item}><Sparkle />{item}</span>)}</div></div>;
}
export function Story({ full = false }: { full?: boolean }) {
  return <section className={`section story-section ${full ? 'full-story' : ''}`}><div className="container story-grid"><div className="story-images"><div className="story-photo"><Image loading="eager" src="/parfum-bahari/story-naxos.png" alt="Doğal ışıkta Xerjoff Naxos parfümü" fill sizes="(max-width: 760px) 85vw, 42vw" /></div><div className="story-small"><Image loading="eager" src="/parfum-bahari/story-erba-pura.png" alt="Gün batımında Xerjoff Erba Pura parfümü" fill sizes="(max-width: 760px) 35vw, 18vw" /></div><span className="image-side-note">KOKULAR GEÇER. HİSLER KALIR.</span></div><div className="story-copy"><p className="eyebrow">PARFUM BAHARI’NİN HİKÂYESİ</p><h2>Bir şişeden<br /><em>çok daha fazlası.</em></h2>{aboutParagraphs.slice(0, full ? undefined : 2).map(paragraph => <p key={paragraph}>{paragraph}</p>)}<Link href={full ? '/urun-katalogu' : '/hakkimizda'} className="text-link">{full ? 'Koleksiyonu keşfedin' : 'Bizi biraz daha yakından tanıyın'} <FiArrowUpRight /></Link><span className="story-signature">Sevgiyle, Parfum Bahari</span></div></div></section>;
}
export function DiscoveryBanner() {
  return <section className="discovery-banner"><div className="container"><p className="eyebrow">KENDİNİZE YAKIN BİR KOKU</p><h2>İmzanız, <em>kokunuz olsun.</em></h2><p>Her gününüze eşlik edecek o kokuyu keşfetmeye hazır mısınız?</p><Link href="/urun-katalogu" className="button button-light">Kendi kokunuzu bulun <FiArrowUpRight /></Link></div></section>;
}
export function PageIntro({ eyebrow, title, emphasis, description, children }: { eyebrow: string; title: string; emphasis: string; description: string; children?: React.ReactNode }) {
  return <header className="page-intro container"><div className="breadcrumbs"><Link href="/">Ana Sayfa</Link><span>/</span><span>{eyebrow}</span></div><p className="eyebrow">{eyebrow}</p><h1>{title} <em>{emphasis}</em></h1><p className="intro-description">{description}</p>{children}</header>;
}
export function FAQs() {
  const questions = [
    ['Kendi kokumu nasıl bulabilirim?', 'Koleksiyondaki ürünleri ve açıklamalarını inceleyerek kendinize yakın olanı keşfedebilirsiniz. Son karar için kokuyu teninizde deneyip size hissettirdiklerini takip etmenizi öneririz.'],
    ['Ürünün diğer fotoğraflarını nasıl görebilirim?', 'Küçük fotoğraflar veya oklarla fotoğraflar arasında geçebilirsiniz. Büyük fotoğrafa dokunarak tam ekranda açabilir, tekrar dokunarak yakınlaştırabilirsiniz. Telefonda ürün fotoğrafını yana kaydırarak da değiştirebilirsiniz.'],
    ['Katalog üzerinden sipariş verebilir miyim?', 'Bu site şu an bir ürün ve koku keşif kataloğudur. Online ödeme veya sipariş alınmaz. Beğendiğiniz ürünün detay sayfasında fotoğraflarını ve açıklamasını inceleyebilir, ürünü favorilerinize ekleyebilirsiniz.'],
  ];
  return <section className="section faq-section"><div className="container faq-grid"><div><p className="eyebrow">KÜÇÜK BİR KOKU REHBERİ</p><h2>Aklınızda<br /><em>bir soru mu var?</em></h2><Link href="/haberler" className="text-link">Blog yazılarına göz atın <FiArrowUpRight /></Link></div><div className="faq-list">{questions.map(([question, answer]) => <details key={question}><summary>{question}<span>+</span></summary><p>{answer}</p></details>)}</div></div></section>;
}
