'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { FiArrowRight } from 'react-icons/fi';
import { usePhotoSwipe } from '@/lib/photoSwipe';

const slides = [
  { image: '/parfum-bahari/hero-branded.webp', alt: 'YSL Babycat, Amouage Guidance 46 ve Parfums de Marly parfüm seçkisi', title: 'Kokunuz, hikâyeniz.', label: 'Koleksiyonu keşfedin', href: '/urun-katalogu' },
  { image: '/parfum-bahari/hero.webp', alt: 'Çiçekler ve sıcak ışıkla Parfum Bahari parfüm koleksiyonu', title: 'İyi kokular tesadüf değil.', label: 'Bizi yakından tanıyın', href: '/hakkimizda' },
  { image: '/parfum-bahari/hero-trio.webp', alt: 'Kadın, erkek ve unisex parfümlerden oluşan Parfum Bahari seçkisi', title: 'Her ruh hâline bir koku.', label: 'Kendi kokunuzu bulun', href: '/urun-katalogu' },
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
    <div className="hero-slider-track" style={{ transform: `translateX(-${selected * 100}%)` }}>
      {slides.map((slide, index) => <div key={slide.image} className="hero-slide" role="group" aria-roledescription="slayt" aria-label={`${index + 1} / ${slides.length}`} aria-hidden={index !== selected} inert={index !== selected}>
        <Link className="hero-slide-link" href={slide.href} aria-label={slide.label} onPointerDown={swipe.onPointerDown} onPointerUp={swipe.onPointerUp} onPointerCancel={swipe.onPointerCancel} onClick={event => { if (!swipe.allowClick()) event.preventDefault(); }}>
          <Image src={slide.image} alt={slide.alt} fill priority={index === 0} sizes="100vw" draggable={false} />
          <div className="hero-slide-caption"><p>{slide.title}</p><span>{slide.label} <FiArrowRight /></span></div>
        </Link>
      </div>)}
    </div>
    <div className="hero-slider-controls" role="group" aria-label="Slayt seçimi">
      <div className="hero-slider-dots">{slides.map((slide, index) => <button key={slide.image} type="button" onClick={() => { setSelected(index); setPaused(true); }} aria-label={`${index + 1}. slaytı göster`} aria-pressed={selected === index} />)}</div>
    </div>
    <p className="sr-only" aria-live={paused || focused ? 'polite' : 'off'}>{selected + 1} / {slides.length}: {slides[selected].title}</p>
  </section>;
}
