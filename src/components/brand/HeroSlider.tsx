'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePhotoSwipe } from '@/lib/photoSwipe';

type Slide = { image: string; alt: string; title: string; label: string; href: string };
const slides: Slide[] = [
  { image: '/parfum-bahari/hero-branded.webp', alt: 'YSL Babycat, Amouage Guidance 46 ve Parfums de Marly parfüm seçkisi', title: 'Kokunuz, hikâyeniz.', label: 'Koleksiyonu keşfedin', href: '/urun-katalogu' },
  { image: '/parfum-bahari/hero-herrera-collection.webp', alt: 'Sıcak gün ışığında taş üzerinde yan yana pembe ve lacivert topuklu ayakkabı biçimli, siyah ve mavi şimşek biçimli dört Carolina Herrera parfümü', title: 'Carolina Herrera seçkisi', label: 'Carolina Herrera seçkisini keşfedin', href: '/urun-katalogu?q=carolina+herrera' },
  { image: '/parfum-bahari/hero-herrera-women.webp', alt: 'Sıcak ışıkta yan yana duran pembe ve lacivert topuklu ayakkabı biçimli Carolina Herrera parfümleri', title: 'Kadın parfümleri', label: 'Carolina Herrera kadın parfümlerini keşfedin', href: '/urun-katalogu?kategori=kadin&q=carolina+herrera' },
  { image: '/parfum-bahari/hero-herrera-men.webp', alt: 'Taş üzerinde yan yana duran siyah ve mavi şimşek biçimli Carolina Herrera parfümleri', title: 'Erkek parfümleri', label: 'Carolina Herrera erkek parfümlerini keşfedin', href: '/urun-katalogu?kategori=erkek&q=carolina+herrera' },
];

export default function HeroSlider() {
  const [selected, setSelected] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const move = (step: number) => { setSelected(current => (current + step + slides.length) % slides.length); setPaused(true); };
  const swipe = usePhotoSwipe(move, true);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReducedMotion(media.matches);
    sync(); media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, []);
  useEffect(() => {
    if (paused || hovered || focused || reducedMotion) return;
    const timer = window.setInterval(() => { if (!document.hidden) setSelected(current => (current + 1) % slides.length); }, 5500);
    return () => window.clearInterval(timer);
  }, [paused, hovered, focused, reducedMotion]);

  return <section className="home-hero home-hero-visual hero-slider" aria-roledescription="slayt gösterisi" aria-label="Parfum Bahari koleksiyonu"
    onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
    onFocusCapture={() => setFocused(true)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}>
    <h1 className="sr-only">Parfum Bahari Parfüm Koleksiyonu</h1>
    <div className="hero-slider-viewport"><div className="hero-slider-track" style={{ transform: `translateX(-${selected * 100}%)` }}>
      {slides.map((slide, index) => <div key={slide.image} className="hero-slide" role="group" aria-roledescription="slayt" aria-label={`${index + 1} / ${slides.length}`} aria-hidden={index !== selected} inert={index !== selected}>
        <Link className="hero-slide-link" href={slide.href} aria-label={slide.label} draggable={false} onPointerDown={swipe.onPointerDown} onPointerUp={swipe.onPointerUp} onPointerCancel={swipe.onPointerCancel} onClick={event => { if (!swipe.allowClick()) event.preventDefault(); }}>
          <Image src={slide.image} alt={slide.alt} fill priority={index === 0} sizes="100vw" draggable={false} />
        </Link>
      </div>)}
    </div></div>
    <div className="hero-slider-controls" role="group" aria-label="Slayt seçimi">
      <div className="hero-slider-dots">{slides.map((slide, index) => <button key={slide.image} type="button" onClick={() => { setSelected(index); setPaused(true); }} aria-label={`${index + 1}. slaytı göster`} aria-pressed={selected === index} />)}</div>
    </div>
    <p className="sr-only" aria-live={paused || focused ? 'polite' : 'off'}>{selected + 1} / {slides.length}: {slides[selected].title}</p>
  </section>;
}
