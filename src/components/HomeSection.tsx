/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Play, ChevronLeft, ChevronRight, Calendar, MapPin } from 'lucide-react';
import { Song, Tour, Product, EBook, Video } from '../types';
import AdSpace from './AdSpace';
import { TornPanel, SafetyPin } from './Decor';

interface HomeSectionProps {
  setActiveTab: (tab: string) => void;
  songs: Song[];
  tours: Tour[];
  products: Product[];
  currentSong: Song | null;
  onSelectSong: (song: Song) => void;
  onPlayPause: (play: boolean) => void;
  isPlaying: boolean;
}

export default function HomeSection({
  setActiveTab,
  songs,
  tours,
  products,
  currentSong,
  onSelectSong,
  onPlayPause,
  isPlaying,
}: HomeSectionProps) {
  const HERO_IMG = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTyIgciF_PbBsep1W9zdeAwB24xXXR6n9dgD91vLqD4pxZoVoLkjisQWIua&s=10';

  /**
   * Hero video URLs, set in the admin dashboard under Settings. Empty until an
   * admin fills them in, in which case the hero keeps its still portrait — so
   * the site never shows a broken or placeholder clip. HERO_IMG stays the
   * poster either way, so the hero looks right while the video buffers or if
   * the file fails to load.
   */
  const [heroVideoMobile, setHeroVideoMobile] = useState('');
  const [heroVideoDesktop, setHeroVideoDesktop] = useState('');
  const [ebooks, setEbooks] = useState<EBook[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  // These two feeds are loaded here rather than by App, so their failures have
  // to be reported here too â€” otherwise the Videos and Read blocks just vanish.
  const [feedError, setFeedError] = useState<string | null>(null);

  const loadFeeds = async () => {
    const feeds: { label: string; url: string; apply: (data: any) => void }[] = [
      { label: 'Videos', url: '/api/videos', apply: setVideos },
      { label: 'Read', url: '/api/ebooks', apply: setEbooks },
    ];

    const failed: string[] = [];

    await Promise.all(
      feeds.map(async ({ label, url, apply }) => {
        try {
          const res = await fetch(url);
          if (!res.ok) {
            console.error(`Failed to load ${url}: HTTP ${res.status}`);
            failed.push(label);
            return;
          }
          apply(await res.json());
        } catch (error) {
          console.error(`Failed to reach ${url}:`, error);
          failed.push(label);
        }
      })
    );

    setFeedError(failed.length > 0 ? failed.join(' and ') : null);
  };

  useEffect(() => {
    loadFeeds();
  }, []);

  // A full-screen autoplaying video is exactly what "reduce motion" is meant to
  // suppress, so fall back to the still portrait when that is set.
  const [reduceMotion, setReduceMotion] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduceMotion(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  // A missing or failing settings call is not worth surfacing: the hero simply
  // stays on the portrait, which is a perfectly good hero.
  useEffect(() => {
    fetch('/api/site-settings')
      .then((r) => (r.ok ? r.json() : null))
      .then((s) => {
        if (!s) return;
        setHeroVideoMobile(s.heroVideoMobileUrl || '');
        setHeroVideoDesktop(s.heroVideoDesktopUrl || '');
      })
      .catch(() => {});
  }, []);

  const heroVideo = reduceMotion ? '' : heroVideoMobile || heroVideoDesktop;

  const latestSingle = songs.find((s) => s.id === 'song-1') || songs[0];
  const featuredProducts = products.filter((p) => p.isFeatured).slice(0, 6);
  const featuredEbooks = (ebooks.filter((b) => b.isFeatured).length > 0
    ? ebooks.filter((b) => b.isFeatured)
    : ebooks
  ).slice(0, 4);
  const upcomingTours = tours.slice(0, 6);

  const playLatest = () => {
    if (latestSingle) { onSelectSong(latestSingle); onPlayPause(true); }
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="w-full text-ink overflow-hidden">

      {/* HERO â€” grainy portrait on the cool light blue-gray backdrop from the reference */}
      <section className="relative grain min-h-[100svh] flex items-end overflow-hidden bg-[#cccdd2]">
        {/* Portrait: offset by just the navbar's height on phones (12px padding +
            30px wordmark + 12px = ~54px, so 3.5rem), which is the least that keeps
            the subject's head clear of the wordmark — at inset-0 with object-top it
            sat directly behind it. Full-bleed from md up, where the navbar no longer
            overlaps. Multiply drops the photo's light backdrop into the hero bg. A
            hero video set in the admin dashboard takes the same slot and the same
            treatment, so the look is identical either way. */}
        {heroVideo ? (
          <video
            key={heroVideo}
            className="absolute inset-x-0 bottom-0 top-14 sm:top-16 md:top-0 h-auto md:h-full object-cover object-top md:object-contain md:object-center photo-grunge mix-blend-multiply"
            poster={HERO_IMG}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-label="Shedstar"
          >
            {/* Phones take the mobile crop; anything wider falls through to the
                desktop file. Ordering matters â€” the first match wins. */}
            {heroVideoMobile && (
              <source src={heroVideoMobile} media="(max-width: 639px)" type="video/mp4" />
            )}
            <source src={heroVideoDesktop || heroVideoMobile} type="video/mp4" />
          </video>
        ) : (
          <img
            src={HERO_IMG}
            alt="Shedstar"
            className="absolute inset-x-0 bottom-0 top-14 sm:top-16 md:top-0 h-auto md:h-full object-cover object-top md:object-contain md:object-center photo-grunge mix-blend-multiply"
          />
        )}
        {/* cool-blue light-leak â€” soft wash + organic turbulence streaks, concentrated on the left */}
        <div
          className="absolute inset-0 pointer-events-none mix-blend-screen"
          style={{
            background:
              'linear-gradient(100deg, rgba(31,116,189,0.60) 0%, rgba(120,152,205,0.22) 24%, transparent 48%)',
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none mix-blend-screen"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20width='300'%20height='700'%20preserveAspectRatio='none'%3E%3Cfilter%20id='lk'%3E%3CfeTurbulence%20type='fractalNoise'%20baseFrequency='0.011%200.005'%20numOctaves='2'%20seed='8'%20stitchTiles='stitch'%20result='n'/%3E%3CfeColorMatrix%20in='n'%20type='matrix'%20values='0%200%200%200%200.16%200%200%200%200%200.50%200%200%200%200%200.84%200%200%200%202.4%20-0.85'/%3E%3C/filter%3E%3Crect%20width='100%25'%20height='100%25'%20filter='url(%23lk)'/%3E%3C/svg%3E\")",
            backgroundSize: 'cover',
            WebkitMaskImage: 'linear-gradient(100deg, #000 0%, rgba(0,0,0,0.6) 34%, transparent 66%)',
            maskImage: 'linear-gradient(100deg, #000 0%, rgba(0,0,0,0.6) 34%, transparent 66%)',
          }}
        />
        {/* subtle cool tint + light scrim behind the dark headline for legibility */}
        <div className="absolute inset-0 bg-brand/10 mix-blend-overlay" />
        <div className="absolute inset-0 bg-gradient-to-tr from-white/60 via-white/10 to-transparent" />
        {/* bottom-up light scrim keeps the dark headline legible over the full-bleed photo on phones */}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-white/70 via-white/25 to-transparent md:hidden" />
        {/* heavy film grain â€” dark speckle (multiply) + light speckle (screen) so the surface is rough, not smooth */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.55] mix-blend-multiply grain-heavy" />
        <div className="absolute inset-0 pointer-events-none opacity-[0.20] mix-blend-screen grain-heavy" />
        {/* Headline and CTA are centred over the foot of the portrait, both in
            brand blue, as in the reference's mobile hero. */}
        <div className="relative z-10 w-full px-6 sm:px-10 lg:px-16 pb-12 md:pb-24 flex flex-col items-center text-center">
          <h1 className="font-heavy leading-[0.95] tracking-tight text-brand text-5xl sm:text-6xl md:text-7xl mb-5 max-w-[16rem] sm:max-w-lg drop-shadow-[0_1px_0_rgba(255,255,255,0.35)]">
            Shedding Light
          </h1>
          <button onClick={playLatest} className="btn-brand btn-cta text-sm tracking-[0.15em]">
            Listen Now
          </button>
        </div>
      </section>

      {/* MUSIC â€” torn blue paper panel on a painted backdrop, per the design */}
      {songs.length > 0 && (
        <section className="relative bg-silver grain px-4 sm:px-6 md:px-8 py-14 md:py-24 overflow-hidden">
          <div className="max-w-6xl mx-auto">
            <TornPanel className="px-4 sm:px-10 py-12 md:py-16">
              <h2 className="poster-title section-title text-white text-center text-6xl sm:text-7xl md:text-8xl mb-10 md:mb-12">
                Music
              </h2>
              <div className="relative">
                <div id="row-music" className="carousel-row carousel-1up no-scrollbar px-1 justify-start md:justify-center">
                  {songs.map((song) => (
                    <button
                      key={song.id}
                      onClick={() => { onSelectSong(song); onPlayPause(true); }}
                      className="group w-48 sm:w-56 md:w-60"
                    >
                      {/* white photo frame */}
                      <div className="relative aspect-square bg-white p-1.5 shadow-xl">
                        <img src={song.coverUrl} alt={song.title} className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500" />
                        <span className={`absolute inset-1.5 flex items-center justify-center bg-black/30 transition-opacity ${isPlaying && currentSong?.id === song.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                          <span className="w-12 h-12 bg-brand text-white flex items-center justify-center">
                            <Play className="w-5 h-5 fill-current" />
                          </span>
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
                <SideNav targetId="row-music" />
              </div>
              <div className="flex justify-center mt-10 md:mt-12">
                <button onClick={() => setActiveTab('music')} className="btn-ink btn-cta-wide text-base">See All Music</button>
              </div>
            </TornPanel>
          </div>
        </section>
      )}

      {/* One of the self-loaded feeds failed â€” hold the space the Videos / Read
          blocks would occupy so the gap reads as an error, not as missing content. */}
      {feedError && (
        <section className="relative bg-cream border-t-2 border-ink px-4 md:px-8 py-12 text-center">
          <p className="font-mono text-[11px] uppercase tracking-wider text-muted">
            âš  {feedError} couldn't be loaded right now.
          </p>
          <button onClick={loadFeeds} className="btn-ink text-xs mt-5">Try Again</button>
        </section>
      )}

      {/* VIDEOS â€” painted wash backdrop, titles set over the thumbnails */}
      {videos.length > 0 && (
        <section className="relative bg-wash-blue grain px-4 md:px-8 py-14 md:py-20 overflow-hidden">
          <div className="max-w-7xl mx-auto relative">
            <h2 className="poster-title section-title text-white text-center text-5xl sm:text-7xl md:text-8xl mb-8 drop-shadow-[0_2px_0_rgba(0,0,0,0.2)]">
              Videos
            </h2>
            {/* Featured video â€” play glyph centred, title over the lower edge */}
            <button onClick={() => setActiveTab('videos')} className="group block w-full mb-6">
              <div className="relative aspect-video overflow-hidden">
                <img src={videos[0].coverUrl} alt={videos[0].title} className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500" />
                <span className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/10 transition-colors">
                  <Play className="w-14 h-14 text-white fill-current drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]" />
                </span>
                <span className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 to-transparent" />
                <h3 className="absolute left-3 right-3 bottom-3 text-left font-display font-black uppercase text-sm sm:text-base tracking-wide text-white leading-tight line-clamp-2">
                  {videos[0].title}
                </h3>
              </div>
            </button>
            {videos.length > 1 && (
              <div className="relative">
                <div id="row-videos" className="carousel-row carousel-1up no-scrollbar -mx-1 px-1">
                  {videos.slice(1).map((v) => (
                    <button key={v.id} onClick={() => setActiveTab('videos')} className="group w-72 sm:w-80 text-left">
                      <div className="relative aspect-video overflow-hidden">
                        <img src={v.coverUrl} alt={v.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <span className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/10 transition-colors">
                          <Play className="w-10 h-10 text-white fill-current drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]" />
                        </span>
                        <span className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 to-transparent" />
                        <h3 className="absolute left-2.5 right-2.5 bottom-2.5 font-display font-black uppercase text-xs tracking-wide text-white leading-tight line-clamp-2">{v.title}</h3>
                      </div>
                    </button>
                  ))}
                </div>
                <SideNav targetId="row-videos" />
              </div>
            )}
            <div className="flex justify-center mt-10">
              <button onClick={() => setActiveTab('videos')} className="btn-brand btn-cta-wide text-base">See All Videos</button>
            </div>
          </div>
        </section>
      )}

      {/* MERCH â€” teal watercolor wash, floating product shots, BUY NOW!! (Teddy Swims reference) */}
      {featuredProducts.length > 0 && (
        <section className="relative bg-wash-green grain px-4 sm:px-6 md:px-8 py-14 md:py-24 overflow-hidden">
          <SafetyPin className="absolute top-6 left-8 sm:left-16 -rotate-[18deg]" size={92} />
          <div className="max-w-6xl mx-auto relative">
            <h2 className="poster-title section-title text-white text-center text-6xl sm:text-7xl md:text-8xl mb-10 md:mb-12">
              Merch
            </h2>
            <div className="relative">
              <div id="row-merch" className="carousel-row carousel-1up no-scrollbar px-1 justify-start md:justify-center">
                {featuredProducts.map((p) => (
                  <div key={p.id} className="w-56 sm:w-64 flex flex-col text-center">
                    <button onClick={() => setActiveTab('merchandise')} className="group block w-full">
                      <div className="relative aspect-square">
                        <img src={p.images[0]} alt={p.title} className="w-full h-full object-contain drop-shadow-lg group-hover:scale-[1.04] transition-transform duration-500" />
                      </div>
                      <h3 className="mt-3 poster-title item-title text-white text-lg sm:text-xl leading-tight tracking-tight line-clamp-3 min-h-[3.5rem]">{p.title}</h3>
                    </button>
                    <button onClick={() => setActiveTab('merchandise')} className="btn-ink btn-cta w-full mt-3 text-base">Buy Now!!</button>
                  </div>
                ))}
              </div>
              <SideNav targetId="row-merch" />
            </div>
            <div className="flex justify-center mt-10 md:mt-12">
              <button onClick={() => setActiveTab('merchandise')} className="btn-brand btn-cta-wide text-base">Shop All Merch</button>
            </div>
          </div>
        </section>
      )}

      {/* E-BOOKS */}
      {featuredEbooks.length > 0 && (
        <section className="relative bg-silver px-4 md:px-8 py-14 md:py-20">
          <div className="max-w-7xl mx-auto relative">
            <div className="flex items-end justify-between mb-8">
              <h2 className="poster-title section-title text-ink text-5xl sm:text-7xl md:text-8xl">Read</h2>
              <CarouselNav targetId="row-ebooks" />
            </div>
            <div id="row-ebooks" className="carousel-row no-scrollbar -mx-1 px-1">
              {featuredEbooks.map((b) => (
                <div key={b.id} className="w-48 sm:w-56 text-left">
                  <button onClick={() => setActiveTab('ebooks')} className="group block w-full">
                    <div className="relative aspect-[3/4] overflow-hidden bg-cream-dark border-2 border-ink">
                      <img src={b.coverUrl} alt={b.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    <h3 className="mt-2 font-display font-bold uppercase text-sm tracking-wide text-ink line-clamp-2">{b.title}</h3>
                  </button>
                  <button onClick={() => setActiveTab('ebooks')} className="btn-ink text-xs w-full mt-1">Buy Â· ${b.price.toFixed(2)}</button>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* TOUR â€” torn blue panel, white rows, white/green ticket buttons, and a
          sage-green CTA overlapping the foot of the panel, as in the video */}
      {upcomingTours.length > 0 && (
        <section className="relative bg-silver grain px-4 md:px-8 py-14 md:py-20 overflow-hidden">
          <div className="max-w-5xl mx-auto relative">
            <TornPanel className="px-5 sm:px-10 py-12 md:py-16">
              <h2 className="poster-title section-title text-white text-center text-5xl sm:text-7xl md:text-8xl mb-10">
                Tour
              </h2>
              <div className="flex flex-col">
                {upcomingTours.map((t) => (
                  <div key={t.id} className="flex items-center gap-4 py-4 border-b border-white/40 last:border-b-0">
                    <div className="flex-1 font-display font-black uppercase text-white leading-snug tracking-wide">
                      <div className="text-xs sm:text-sm flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" /> {formatDate(t.date)}
                      </div>
                      <div className="text-xs sm:text-sm flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" /> {t.venue}
                      </div>
                      <div className="text-xs sm:text-sm">{t.city}, {t.country}</div>
                    </div>
                    {t.isSoldOut ? (
                      <span className="shrink-0 bg-white/50 text-ink font-display font-black uppercase text-[10px] sm:text-xs tracking-wider px-4 py-2.5 cursor-default">
                        Sold Out
                      </span>
                    ) : (
                      <a
                        href={t.ticketLink || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 bg-white text-accent hover:bg-accent hover:text-white font-display font-black uppercase text-[10px] sm:text-xs tracking-wider px-5 py-2.5 transition-colors"
                      >
                        Tickets
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </TornPanel>
            {/* Sits over the torn lower edge, the way the design does */}
            <div className="flex justify-center -mt-7 relative z-10">
              <button onClick={() => setActiveTab('tour')} className="btn-accent btn-cta-wide text-base">Show All Dates</button>
            </div>
          </div>
        </section>
      )}

      {/* SPONSORS */}
      <section className="bg-paper px-4 md:px-8 py-12">
        <div className="max-w-7xl mx-auto">
          <p className="text-center font-mono text-[11px] uppercase tracking-[0.3em] text-muted mb-6">In partnership with our sponsors</p>
          <AdSpace placement="banner" className="mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <AdSpace placement="inline" />
            <AdSpace placement="sidebar" />
            <div className="flex flex-col justify-center items-center text-center bg-cream border-2 border-ink p-6 gap-3">
              <h4 className="poster-title text-ink text-2xl">Advertise With Shedstar</h4>
              <p className="text-sm text-muted">Reach millions of global fans.</p>
              <button onClick={() => setActiveTab('partners')} className="btn-brand text-xs">View Packages</button>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}

/* Big white chevrons anchored to the sides of a carousel (Teddy Swims reference) */
function SideNav({ targetId }: { targetId: string }) {
  const scroll = (dir: number) => {
    const el = document.getElementById(targetId);
    if (el) el.scrollBy({ left: dir * Math.min(el.clientWidth * 0.8, 600), behavior: 'smooth' });
  };
  return (
    <>
      <button
        onClick={() => scroll(-1)}
        className="flex absolute left-0 md:-left-6 top-1/2 -translate-y-1/2 z-10 w-10 h-10 items-center justify-center text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)] hover:text-white/80 transition-colors"
        aria-label="Scroll left"
      >
        <ChevronLeft className="w-9 h-9" strokeWidth={1.5} />
      </button>
      <button
        onClick={() => scroll(1)}
        className="flex absolute right-0 md:-right-6 top-1/2 -translate-y-1/2 z-10 w-10 h-10 items-center justify-center text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)] hover:text-white/80 transition-colors"
        aria-label="Scroll right"
      >
        <ChevronRight className="w-9 h-9" strokeWidth={1.5} />
      </button>
    </>
  );
}

/* Left/right arrows that scroll a carousel row by id */
function CarouselNav({ targetId }: { targetId: string }) {
  const scroll = (dir: number) => {
    const el = document.getElementById(targetId);
    if (el) el.scrollBy({ left: dir * Math.min(el.clientWidth * 0.8, 600), behavior: 'smooth' });
  };
  return (
    <div className="hidden sm:flex items-center gap-2">
      <button onClick={() => scroll(-1)} className="w-9 h-9 border-2 border-ink text-ink hover:bg-ink hover:text-white flex items-center justify-center transition-colors" aria-label="Scroll left">
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button onClick={() => scroll(1)} className="w-9 h-9 border-2 border-ink text-ink hover:bg-ink hover:text-white flex items-center justify-center transition-colors" aria-label="Scroll right">
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}
