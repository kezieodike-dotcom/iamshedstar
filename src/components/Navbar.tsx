/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { X, ShoppingBag, ShieldCheck, Instagram, Youtube, Music2, Music } from 'lucide-react';

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

  // No Home entry — the wordmark above is the way back to the home page, as on
  // the reference site. Fan Club is likewise not listed in the menu.
  const navItems = [
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
  ];

  // The four headline destinations: blue links top-right on desktop, and the
  // large links in the mobile menu. Everything else is secondary.
  const primaryIds = ['music', 'videos', 'merchandise', 'tour'];
  const primary = navItems.filter((i) => primaryIds.includes(i.id));
  const secondary = navItems.filter((i) => !primaryIds.includes(i.id));

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

          {/* Wordmark, top-left in brand blue and deliberately inverted. Also the
              only route back to the home page now that Home is not a menu entry,
              so the accessible name is spelled out on the button — the rotation
              is purely visual and must not change how it is announced. */}
          <button onClick={() => go('home')} className="select-none group leading-none" aria-label="Shedstar — home">
            {/* One word, so no max-width: the reference stacks two words, and a
                cap here only makes "Shedstar" overflow its own box. */}
            <span className="grunge-text font-heavy uppercase leading-none tracking-tight text-brand text-3xl sm:text-4xl md:text-6xl inline-block rotate-180 transition-colors group-hover:text-ink">
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

              {/* Three bars, top two blue and the last dark, as in the design */}
              <button onClick={() => setIsOpen(true)} className="p-1 group" aria-label="Open menu">
                <span className="flex flex-col gap-[5px] w-7">
                  <span className="h-[3px] w-full bg-brand transition-colors group-hover:bg-ink" />
                  <span className="h-[3px] w-full bg-brand transition-colors group-hover:bg-ink" />
                  <span className="h-[3px] w-full bg-ink transition-colors group-hover:bg-brand" />
                </span>
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

      {/* Full-screen menu — a translucent blue wash rather than a solid fill, so
          the hero behind still reads through it as it does in the design. Big
          left-aligned links, a grid of socials, and a green newsletter bar
          pinned to the bottom. */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-brand/75 backdrop-blur-[2px] flex flex-col animate-fadeIn">
          <div className="w-full px-6 sm:px-8 pt-5 flex items-center justify-end">
            <button onClick={() => setIsOpen(false)} className="p-1.5 text-white hover:text-ink transition-colors" aria-label="Close menu">
              <X className="w-8 h-8" strokeWidth={1.5} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-8 sm:px-10 pt-6 pb-8">
            {/* The four headline destinations, sized as in the design */}
            <nav className="flex flex-col gap-6 sm:gap-7">
              {primary.map((item) => (
                <button
                  key={item.id}
                  onClick={() => go(item.id)}
                  className={`poster-title text-left leading-none text-4xl sm:text-5xl transition-colors ${
                    activeTab === item.id ? 'text-ink' : 'text-white hover:text-ink'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>

            {/* Everything else, kept reachable at a smaller weight — the design
                shows only the four above, but the rest of the site would be
                unreachable from the menu otherwise. */}
            <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3">
              {secondary.map((item) => (
                <button
                  key={item.id}
                  onClick={() => go(item.id)}
                  className={`font-display font-bold uppercase text-xs tracking-widest transition-colors ${
                    activeTab === item.id ? 'text-ink' : 'text-white/80 hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Socials, four to a row */}
            <div className="mt-10 grid grid-cols-4 gap-x-6 gap-y-6 max-w-xs">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={s.label}
                  aria-label={s.label}
                  className="text-white hover:text-ink transition-colors"
                >
                  <s.icon className="w-7 h-7" />
                </a>
              ))}
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-x-5 gap-y-3">
              {isAdmin ? (
                <>
                  <button onClick={() => go('admin')} className="inline-flex items-center gap-1.5 font-display font-bold text-xs uppercase tracking-widest text-white hover:text-ink">
                    <ShieldCheck className="w-4 h-4" /> Admin
                  </button>
                  <button onClick={() => { onLogoutAdmin(); setIsOpen(false); }} className="font-display font-bold text-xs uppercase tracking-widest text-white/70 hover:text-white">
                    Log Out
                  </button>
                </>
              ) : (
                <button onClick={() => go('admin')} className="inline-flex items-center gap-1.5 font-display font-bold text-xs uppercase tracking-widest text-white/70 hover:text-white">
                  <ShieldCheck className="w-4 h-4" /> Admin
                </button>
              )}
            </div>
          </div>

          {/* Sage-green newsletter bar across the foot of the menu. The colour is
              the reference's own --green-color #95AE9B. */}
          <button
            onClick={() => go('fanclub')}
            className="w-full bg-accent text-white poster-title text-2xl sm:text-3xl py-5 px-6 text-center tracking-wide hover:brightness-95 transition"
          >
            Join The Newsletter
          </button>
        </div>
      )}
    </>
  );
}
