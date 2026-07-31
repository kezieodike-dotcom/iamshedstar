/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Menu, X, ShoppingBag, ShieldCheck, Instagram, Youtube, Music2, Music } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  cartCount: number;
  onOpenCart: () => void;
  isAdmin: boolean;
  onLogoutAdmin: () => void;
}

export default function Navbar({
  activeTab,
  setActiveTab,
  cartCount,
  onOpenCart,
  isAdmin,
  onLogoutAdmin,
}: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About' },
    { id: 'music', label: 'Music' },
    { id: 'videos', label: 'Videos' },
    { id: 'merchandise', label: 'Merch' },
    { id: 'ebooks', label: 'E-Books' },
    { id: 'tour', label: 'Tour' },
    { id: 'gallery', label: 'Gallery' },
    { id: 'news', label: 'News' },
    { id: 'partners', label: 'Partners & Advertise' },
    { id: 'booking', label: 'Booking' },
    { id: 'contact', label: 'Contact' },
    { id: 'fanclub', label: 'Fan Club' },
  ];

  // Primary blue links shown top-right on desktop, like teddyswims.com.
  const primaryIds = ['music', 'videos', 'merchandise', 'tour'];
  const primary = navItems.filter((i) => primaryIds.includes(i.id));

  const socials = [
    { icon: Music, href: 'https://spotify.com', label: 'Spotify' },
    { icon: Music2, href: 'https://music.apple.com', label: 'Apple Music' },
    { icon: Instagram, href: 'https://instagram.com', label: 'Instagram' },
    { icon: Youtube, href: 'https://youtube.com', label: 'YouTube' },
  ];

  const go = (id: string) => {
    setActiveTab(id);
    setIsOpen(false);
  };

  return (
    <>
      {/* Distressed-edge filter for the logo wordmark (photocopied / eroded look) */}
      <svg width="0" height="0" className="absolute" aria-hidden="true">
        <filter id="logo-grunge" x="-25%" y="-25%" width="150%" height="150%">
          {/* coarse waviness in the contours */}
          <feTurbulence type="fractalNoise" baseFrequency="0.14" numOctaves="2" seed="7" result="coarse" />
          <feDisplacementMap in="SourceGraphic" in2="coarse" scale="6.5" xChannelSelector="R" yChannelSelector="G" result="d1" />
          {/* fine nibbling on the edges */}
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="3" result="fine" />
          <feDisplacementMap in="d1" in2="fine" scale="4" xChannelSelector="R" yChannelSelector="G" result="d2" />
          {/* speckle erosion — punches small photocopied breaks into the letters */}
          <feTurbulence type="turbulence" baseFrequency="0.65" numOctaves="2" seed="9" result="grit" />
          <feComponentTransfer in="grit" result="gritA">
            <feFuncA type="discrete" tableValues="1 1 1 1 1 1 1 1 1 1 1 0" />
          </feComponentTransfer>
          <feComposite in="d2" in2="gritA" operator="in" />
        </filter>
      </svg>

      <header className={`fixed top-0 left-0 right-0 z-40 transition-colors duration-300 ${
        scrolled ? 'bg-silver/95 backdrop-blur-sm' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 md:py-4 flex items-start justify-between gap-4">

          {/* Wordmark — flipped 180° on the hero/home page (Teddy Swims reference look) */}
          <button onClick={() => go('home')} className="select-none group leading-none">
            <span className={`grunge-text font-heavy uppercase leading-none tracking-tight text-ink text-4xl md:text-6xl inline-block origin-center transition-transform group-hover:text-brand ${
              activeTab === 'home' ? 'rotate-180' : ''
            }`}>
              Shedstar
            </span>
          </button>

          {/* Right: blue nav links + socials */}
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-3 sm:gap-5">
              <nav className="hidden md:flex items-center gap-5">
                {primary.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => go(item.id)}
                    className={`font-heavy uppercase text-xl lg:text-2xl tracking-wide transition-colors ${
                      activeTab === item.id ? 'text-ink' : 'text-brand hover:text-ink'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </nav>

              <button onClick={onOpenCart} className="relative p-1 text-ink hover:text-brand transition-colors" aria-label="Shopping bag">
                <ShoppingBag className="w-5 h-5 md:w-6 md:h-6" />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-4 h-4 px-1 bg-brand text-white font-sans font-bold text-[10px] rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>

              <button onClick={() => setIsOpen(true)} className="p-1 text-ink hover:text-brand transition-colors" aria-label="Open menu">
                <Menu className="w-6 h-6" />
              </button>
            </div>

            {/* Social row */}
            <div className="hidden sm:flex items-center gap-3">
              {socials.map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" title={s.label} className="text-brand hover:text-ink transition-colors">
                  <s.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Full-screen menu overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-paper flex flex-col animate-fadeIn">
          <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between border-b border-line">
            <span className="grunge-text font-heavy uppercase tracking-tight text-ink text-3xl">Shedstar</span>
            <button onClick={() => setIsOpen(false)} className="p-1.5 text-ink hover:text-brand" aria-label="Close menu">
              <X className="w-7 h-7" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-x-8">
              {navItems.map((item, i) => (
                <button
                  key={item.id}
                  onClick={() => go(item.id)}
                  className={`group flex items-baseline gap-4 py-3.5 border-b border-line text-left transition-colors ${
                    activeTab === item.id ? 'text-brand' : 'text-ink hover:text-brand'
                  }`}
                >
                  <span className="font-mono text-xs text-muted">{String(i + 1).padStart(2, '0')}</span>
                  <span className="poster-title text-[2.75rem] leading-none sm:text-5xl">{item.label}</span>
                </button>
              ))}
            </div>

            <div className="max-w-7xl mx-auto mt-8 flex flex-wrap items-center gap-x-5 gap-y-3">
              {socials.map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" title={s.label} className="text-brand hover:text-ink transition-colors">
                  <s.icon className="w-5 h-5" />
                </a>
              ))}
              <span className="w-px h-4 bg-line" />
              {isAdmin ? (
                <>
                  <button onClick={() => go('admin')} className="inline-flex items-center gap-1.5 font-display font-bold text-xs uppercase tracking-widest text-ink hover:text-brand">
                    <ShieldCheck className="w-4 h-4 text-brand" /> Admin
                  </button>
                  <button onClick={() => { onLogoutAdmin(); setIsOpen(false); }} className="font-display font-bold text-xs uppercase tracking-widest text-red-500 hover:text-red-600">
                    Log Out
                  </button>
                </>
              ) : (
                <button onClick={() => go('admin')} className="inline-flex items-center gap-1.5 font-display font-bold text-xs uppercase tracking-widest text-muted hover:text-brand">
                  <ShieldCheck className="w-4 h-4" /> Admin
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
