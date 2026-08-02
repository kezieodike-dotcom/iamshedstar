/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Play, ChevronLeft, ChevronRight, Calendar, MapPin, Mail } from 'lucide-react';
import { Song, Tour, Product, EBook, Video } from '../types';
import AdSpace from './AdSpace';
import { TapeTitle, SafetyPin, TornPanel } from './Decor';

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
  const [email, setEmail] = useState('');
  const [subStatus, setSubStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
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

  const latestSingle = songs.find((s) => s.id === 'song-1') || songs[0];
  const featuredProducts = products.filter((p) => p.isFeatured).slice(0, 6);
  const featuredEbooks = (ebooks.filter((b) => b.isFeatured).length > 0
    ? ebooks.filter((b) => b.isFeatured)
    : ebooks
  ).slice(0, 4);
  const upcomingTours = tours.slice(0, 6);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubStatus('loading');
    try {
      const res = await fetch('/api/subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.ok) { setSubStatus('success'); setEmail(''); }
      else setSubStatus('error');
    } catch { setSubStatus('error'); }
  };

  const playLatest = () => {
    if (latestSingle) { onSelectSong(latestSingle); onPlayPause(true); }
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="w-full text-ink overflow-hidden">

      {/* HERO â€” grainy portrait on the cool light blue-gray backdrop from the reference */}
      <section className="relative grain min-h-[100svh] flex items-end overflow-hidden bg-[#cccdd2]">
        {/* Portrait: full-bleed on phones (Teddy Swims fills the screen edge-to-edge),
            letterboxed from md up so the whole figure shows. Multiply drops its light
            backdrop into the hero bg. */}
        <img
          src={HERO_IMG}
          alt="Shedstar"
          className="absolute inset-0 w-full h-full object-cover object-top md:object-contain md:object-center photo-grunge mix-blend-multiply"
        />
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
        <div className="relative z-10 w-full px-6 sm:px-10 lg:px-16 pb-16 md:pb-24">
          <h1 className="font-heavy leading-[0.9] tracking-tight text-ink text-6xl sm:text-7xl md:text-8xl mb-6 max-w-[18rem] sm:max-w-md">
            Shedding<br />Light
          </h1>
          <button onClick={playLatest} className="btn-ink btn-cta text-sm tracking-[0.15em]">
            Listen Now
          </button>
        </div>
      </section>

      {/* MUSIC â€” blue torn-paper panel on a grungy backdrop (Teddy Swims reference) */}
      {songs.length > 0 && (
        <section className="relative bg-silver grain px-4 sm:px-6 md:px-8 py-14 md:py-24 border-t-4 border-ink overflow-hidden">
          <div className="max-w-6xl mx-auto">
            <TornPanel className="px-4 sm:px-10 py-12 md:py-16">
              <h2 className="poster-title section-title text-white text-center text-6xl sm:text-7xl md:text-8xl mb-10 md:mb-12 drop-shadow-[0_3px_0_rgba(0,0,0,0.22)]">
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
        <section className="relative bg-cream grain border-t-4 border-ink px-4 md:px-8 py-12 text-center">
          <p className="font-mono text-[11px] uppercase tracking-wider text-muted">
            âš  {feedError} couldn't be loaded right now.
          </p>
          <button onClick={loadFeeds} className="btn-ink text-xs mt-5">Try Again</button>
        </section>
      )}

      {/* VIDEOS */}
      {videos.length > 0 && (
        <section className="relative bg-ink grain px-4 md:px-8 py-14 md:py-20">
          <SafetyPin className="absolute top-8 left-10 -rotate-12 opacity-90 hidden sm:block" size={64} />
          <div className="max-w-7xl mx-auto relative">
            <div className="flex justify-center mb-8">
              <TapeTitle>Videos</TapeTitle>
            </div>
            {/* Featured video */}
            <button onClick={() => setActiveTab('videos')} className="group block w-full mb-6">
              <div className="relative aspect-video overflow-hidden border-4 border-white">
                <img src={videos[0].coverUrl} alt={videos[0].title} className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500" />
                <span className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/20 transition-colors">
                  <span className="w-16 h-16 rounded-full bg-white/90 text-ink flex items-center justify-center">
                    <Play className="w-7 h-7 fill-current ml-1" />
                  </span>
                </span>
              </div>
            </button>
            {videos.length > 1 && (
              <div className="relative">
                <div id="row-videos" className="carousel-row carousel-1up no-scrollbar -mx-1 px-1">
                  {videos.slice(1).map((v) => (
                    <button key={v.id} onClick={() => setActiveTab('videos')} className="group w-72 sm:w-80 text-left">
                      <div className="relative aspect-video overflow-hidden border-2 border-white/60">
                        <img src={v.coverUrl} alt={v.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <span className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] font-mono px-1.5 py-0.5">{v.duration}</span>
                      </div>
                      <h3 className="mt-2 font-display font-bold uppercase text-sm tracking-wide text-white line-clamp-1">{v.title}</h3>
                      <p className="text-xs text-white/60">{v.views}</p>
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
          <SafetyPin className="absolute top-8 left-6 sm:left-10 -rotate-[18deg] hidden sm:block" size={68} />
          <div className="max-w-6xl mx-auto relative">
            <h2 className="poster-title section-title text-white text-center text-6xl sm:text-7xl md:text-8xl mb-10 md:mb-12 drop-shadow-[0_3px_0_rgba(0,0,0,0.22)]">
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
                      <h3 className="mt-3 poster-title item-title text-white text-lg sm:text-xl leading-tight tracking-tight line-clamp-3 min-h-[3.5rem] drop-shadow-[0_1px_0_rgba(0,0,0,0.25)]">{p.title}</h3>
                    </button>
                    <button onClick={() => setActiveTab('merchandise')} className="btn-ink btn-cta w-full mt-3 text-base">Buy Now!!</button>
                  </div>
                ))}
              </div>
              <SideNav targetId="row-merch" />
            </div>
          </div>
        </section>
      )}

      {/* E-BOOKS */}
      {featuredEbooks.length > 0 && (
        <section className="relative bg-silver grain px-4 md:px-8 py-14 md:py-20">
          <div className="max-w-7xl mx-auto relative">
            <div className="flex items-end justify-between mb-8">
              <TapeTitle>Read</TapeTitle>
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

      {/* TOUR */}
      {upcomingTours.length > 0 && (
        <section className="relative bg-wash-blue grain px-4 md:px-8 py-14 md:py-20">
          <SafetyPin className="absolute top-10 left-16 rotate-[20deg] hidden sm:block" size={60} />
          <div className="max-w-5xl mx-auto relative">
            <div className="flex justify-center mb-10">
              <TapeTitle>Tour</TapeTitle>
            </div>
            <div className="flex flex-col bg-paper border-2 border-ink">
              {upcomingTours.map((t) => (
                <div key={t.id} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 px-5 py-4 border-b-2 border-ink last:border-b-0">
                  <div className="sm:w-36 font-display font-bold text-sm text-ink flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-brand" /> {formatDate(t.date)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-display font-black uppercase text-lg tracking-tight leading-tight">{t.city}, {t.country}</h3>
                    <p className="text-sm text-muted flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {t.venue}</p>
                  </div>
                  {t.isSoldOut ? (
                    <span className="self-start sm:self-auto btn-outline text-xs opacity-50 cursor-default">Sold Out</span>
                  ) : (
                    <a href={t.ticketLink || '#'} target="_blank" rel="noopener noreferrer" className="self-start sm:self-auto btn-ink text-sm">Tickets</a>
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-center mt-8">
              <button onClick={() => setActiveTab('tour')} className="btn-ink btn-cta-wide text-sm">All Tour Dates</button>
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

      {/* NEWSLETTER */}
      <section className="relative bg-brand grain text-white px-4 md:px-8 py-16 md:py-24">
        <SafetyPin className="absolute top-8 right-14 rotate-[30deg] hidden sm:block" size={64} />
        <div className="max-w-3xl mx-auto text-center flex flex-col items-center gap-5 relative">
          <Mail className="w-10 h-10" />
          <h2 className="poster-title text-white text-5xl sm:text-7xl">Join The Star Club</h2>
          <p className="text-white/85 max-w-xl">Get presale ticket access, exclusive merch drops, and news straight from Shedstar.</p>
          <form onSubmit={handleSubscribe} className="w-full max-w-md flex flex-col sm:flex-row gap-2 mt-2">
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setSubStatus('idle'); }}
              placeholder="Enter your email"
              required
              disabled={subStatus === 'loading'}
              className="flex-1 px-5 py-3.5 bg-white text-ink placeholder-muted outline-none border-2 border-ink"
            />
            <button type="submit" disabled={subStatus === 'loading'} className="btn-ink text-base">
              {subStatus === 'loading' ? 'Joining...' : 'Sign Up'}
            </button>
          </form>
          {subStatus === 'success' && <p className="text-sm font-mono">âœ“ Welcome to the Star Club! Check your inbox.</p>}
          {subStatus === 'error' && <p className="text-sm font-mono">Something went wrong â€” try another email.</p>}
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
