/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Play, ChevronLeft, ChevronRight, Calendar, MapPin, Megaphone, ArrowRight } from 'lucide-react';
import { Song, Tour, Product, Video } from '../types';
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
  const HERO_IMG = '/meta/shedstar-home-portrait.jpg';

  /**
   * Hero video URLs, set in the admin dashboard under Settings. Empty until an
   * admin fills them in, in which case the hero keeps its still portrait — so
   * the site never shows a broken or placeholder clip. HERO_IMG stays the
   * poster either way, so the hero looks right while the video buffers or if
   * the file fails to load.
   */
  const [heroVideoMobile, setHeroVideoMobile] = useState('');
  const [heroVideoDesktop, setHeroVideoDesktop] = useState('');
  const [videos, setVideos] = useState<Video[]>([]);
  // These two feeds are loaded here rather than by App, so their failures have
  // to be reported here too â€” otherwise the Videos and Read blocks just vanish.
  const [feedError, setFeedError] = useState<string | null>(null);

  const loadFeeds = async () => {
    const feeds: { label: string; url: string; apply: (data: any) => void }[] = [
      { label: 'Videos', url: '/api/videos', apply: setVideos },
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
  const upcomingTours = tours.slice(0, 6);

  const playLatest = () => {
    if (latestSingle) { onSelectSong(latestSingle); onPlayPause(true); }
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="w-full text-ink overflow-hidden">

      {/* HERO â€” grainy portrait on the cool light blue-gray backdrop from the reference */}
      {/* One flat tone, shared with the header bar via --color-hero, so the strip
          behind the wordmark and the rest of the hero are the same colour. */}
      <section className="relative grain min-h-[100dvh] flex items-end overflow-hidden bg-hero">
        {/* Portrait: offset by just the navbar's height on phones (12px padding +
            30px wordmark + 12px = ~54px, so 3.5rem), which is the least that keeps
            the subject's head clear of the wordmark — at inset-0 with object-top it
            sat directly behind it. Full-bleed from md up, where the navbar no longer
            overlaps. A hero video set in the admin dashboard takes the same slot and
            the same treatment, so the look is identical either way.

            mix-blend-multiply is md-and-up only. It drops the photo's light areas
            out to the section colour, which is the intended look for the letterboxed
            desktop crop — but on a phone the foot of the crop is the subject's white
            t-shirt, so multiply turned exactly the area behind the headline into flat
            #cccdd2. That flat patch is what read as a separate background. Phones now
            keep the photo opaque so the type genuinely sits on the picture.

            No height class on the phone layout, on purpose: top + bottom define
            the box there. Adding h-auto made the img take its intrinsic scaled
            height instead, so it stopped short of the foot of the hero and left
            the section background showing behind the headline.

            From md the element is centred outright — left-1/2 with a half-width
            translate, full height and auto width — rather than stretching edge to
            edge and relying on object-position to place the picture inside it.
            The element then matches the photo's own 399x501 proportions, so what
            is centred is the picture itself. */}
        {heroVideo ? (
          <video
            key={heroVideo}
            className="absolute inset-0 h-full w-full object-cover object-[58%_30%] scale-[1.08] md:scale-[1.12] photo-grunge mix-blend-multiply"
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
            alt="Shedstar portrait in the homepage hero"
            className="absolute inset-0 h-full w-full object-cover object-[58%_30%] scale-[1.08] md:scale-[1.12] photo-grunge mix-blend-multiply"
          />
        )}
        {/* cool-blue light-leak â€” soft wash + organic turbulence streaks, concentrated on the left */}
        <div
          className="absolute inset-0 pointer-events-none mix-blend-screen"
          style={{
            background:
              'linear-gradient(100deg, rgba(31,116,189,0.62) 0%, rgba(120,152,205,0.24) 24%, transparent 50%)',
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
        {/* subtle cool tint */}
        <div className="absolute inset-0 bg-brand/10 mix-blend-overlay" />
        <div className="absolute inset-y-0 left-0 w-[38vw] pointer-events-none mix-blend-screen opacity-70 bg-[linear-gradient(90deg,rgba(31,116,189,0.46),rgba(67,102,168,0.18)_48%,transparent)]" />
        {/* Light leak anchored at the TOP. It used to be gradient-to-tr, which
            starts at the bottom-left — that put 60% white directly under the
            headline, which is why the foot of the hero washed out to white. */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-transparent" />
        {/* Bottom scrim is dark, not light: the headline and CTA are brand blue
            now, so they need to sit on something darker to read — which is also
            how the reference's hero foot looks. */}
        <div className="absolute inset-x-0 bottom-0 h-[42%] bg-gradient-to-t from-black/24 via-black/8 to-transparent" />
        {/* heavy film grain â€” dark speckle (multiply) + light speckle (screen) so the surface is rough, not smooth */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.55] mix-blend-multiply grain-heavy" />
        <div className="absolute inset-0 pointer-events-none opacity-[0.20] mix-blend-screen grain-heavy" />
        {/* Headline and CTA are centred over the foot of the portrait, both in
            brand blue, as in the reference's mobile hero. */}
        <div className="relative z-10 w-full px-8 sm:px-12 lg:px-[5.6rem] pb-[31vh] sm:pb-[33vh] md:pb-[33vh] flex flex-col items-start text-left">
          {/* Dark drop shadow, matching the dark scrim below it — the previous
              white one only made sense against the old white wash. */}
          <h1 className="font-heavy uppercase leading-[0.82] tracking-[-0.03em] text-ink text-[2.15rem] sm:text-4xl md:text-[2.6rem] lg:text-[2.7rem] mb-2 sm:mb-2 max-w-[18rem] sm:max-w-[20rem] drop-shadow-[0_1px_0_rgba(255,255,255,0.25)]">
            {latestSingle?.title || 'Shedding Light'}
          </h1>
          <button onClick={playLatest} className="btn-ink btn-cta-hero min-w-[14.5rem] h-[2.45rem] px-8 py-0 text-[0.95rem] tracking-[0.02em]">
            Listen Now
          </button>
        </div>
      </section>

      {/* MUSIC â€” torn blue paper panel on a painted backdrop, per the design */}
{songs.length > 0 && (
        <section className="relative bg-silver grain px-4 sm:px-6 md:px-8 pt-24 pb-14 md:pt-28 md:pb-24 overflow-hidden">
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

      <section className="relative bg-ink grain px-4 sm:px-6 md:px-8 py-12 md:py-16 overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-3 bg-accent" aria-hidden="true" />
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-[1.15fr_0.85fr] gap-8 md:gap-12 items-center">
            <div className="text-white">
              <div className="inline-flex items-center gap-2 bg-brand px-3 py-2 font-heavy uppercase text-xs tracking-wide">
                <Megaphone className="w-4 h-4" />
                Advertise
              </div>
              <h2 className="poster-title text-white text-5xl sm:text-6xl md:text-7xl leading-none mt-5">
                Put Your Brand In The Spotlight
              </h2>
              <p className="text-white/75 text-sm sm:text-base leading-relaxed mt-4 max-w-xl">
                Sponsor Shedstar music drops, tour moments, newsletter placements, and homepage features built for fans already watching, listening, and shopping.
              </p>
            </div>

            <div className="bg-paper text-ink border-2 border-white p-5 sm:p-6 shadow-[8px_8px_0_rgba(31,116,189,0.75)]">
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-brand">Mobile Fan Reach</p>
              <div className="grid grid-cols-2 gap-3 mt-5">
                <div className="border-2 border-ink p-3">
                  <p className="poster-title text-3xl text-ink">01</p>
                  <p className="font-display font-black uppercase text-xs tracking-wide mt-1">Banner Ads</p>
                </div>
                <div className="border-2 border-ink p-3">
                  <p className="poster-title text-3xl text-ink">02</p>
                  <p className="font-display font-black uppercase text-xs tracking-wide mt-1">Tour Sponsors</p>
                </div>
                <div className="border-2 border-ink p-3">
                  <p className="poster-title text-3xl text-ink">03</p>
                  <p className="font-display font-black uppercase text-xs tracking-wide mt-1">Newsletter</p>
                </div>
                <div className="border-2 border-ink p-3">
                  <p className="poster-title text-3xl text-ink">04</p>
                  <p className="font-display font-black uppercase text-xs tracking-wide mt-1">Brand Drops</p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('partners')}
                className="btn-brand w-full mt-5 text-sm"
              >
                View Advertising Packages
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>
      {/* TOUR â€” torn blue panel, white rows, white/green ticket buttons, and a
          sage-green CTA overlapping the foot of the panel, as in the video */}
      {upcomingTours.length > 0 && (
        <section className="reference-tour-section relative bg-silver grain px-4 md:px-8 py-14 md:py-20 overflow-hidden">
          <div className="max-w-5xl mx-auto relative">
            <svg
              viewBox="0 0 120 310"
              aria-hidden="true"
              className="hidden md:block absolute -right-24 top-12 z-20 h-[360px] w-auto pointer-events-none overflow-visible"
            >
              <path
                d="M55 8c22 0 36 17 34 40-1 11-5 21-12 28 11 14 17 34 16 60l-2 54 20 85c3 12-5 23-17 23H77l-18-76-18 76H24c-12 0-20-11-17-23l20-85-2-54c-1-26 5-46 16-60-7-7-11-17-12-28C27 25 33 8 55 8Z"
                fill="#2f2b2a"
                stroke="#f1f0ec"
                strokeWidth="10"
                strokeLinejoin="round"
              />
              <path
                d="M28 110c-16 21-21 45-16 72M91 111c14 19 19 43 16 70M43 76c9 8 27 9 37 0"
                fill="none"
                stroke="#f1f0ec"
                strokeWidth="6"
                strokeLinecap="round"
              />
            </svg>
            <TornPanel className="px-5 sm:px-10 py-12 md:py-16">
              <h2 className="tour-section-title poster-title section-title text-white text-center text-5xl sm:text-7xl md:text-8xl mb-10">
                Tour
              </h2>
              <div className="tour-presale text-center mb-8">
                <button onClick={() => setActiveTab('fanclub')} className="btn-accent text-base">
                  Get Artist Presale Code
                </button>
                <p className="mt-4 text-white/85 font-display font-black uppercase text-sm sm:text-base tracking-wide max-w-2xl mx-auto leading-snug">
                  Shedstar tour presale begins Wednesday at 10 AM local time. General on sale begins Friday at 10 AM local time.
                </p>
              </div>
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
            <div className="tour-vip mt-12 bg-paper border-2 border-ink p-6 md:p-8 max-w-3xl mx-auto">
              <h3 className="poster-title text-ink text-3xl sm:text-4xl">VIP Experience</h3>
              <p className="mt-2 font-display font-black uppercase text-brand text-sm tracking-wide">
                Shedstar 2026 VIP Tour Package Includes:
              </p>
              <ul className="mt-5 grid gap-3 text-sm text-muted leading-relaxed">
                <li>One premium reserved or general admission ticket where applicable</li>
                <li>Early entry into the venue in GA markets</li>
                <li>Specially designed Shedstar tour shirt</li>
                <li>Limited edition tour laminate and lanyard</li>
                <li>Exclusive merch item available only to VIP guests</li>
              </ul>
            </div>
          </div>
        </section>
      )}
      <section className="relative bg-accent grain px-4 sm:px-6 md:px-8 py-12 md:py-16 overflow-hidden">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6 text-white">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/75">Fan Club</p>
            <h2 className="poster-title text-5xl sm:text-6xl md:text-7xl leading-none mt-2">Join The Newsletter</h2>
          </div>
          <button
            onClick={() => setActiveTab('fanclub')}
            className="btn-ink w-full md:w-auto text-base"
          >
            Sign Up Now
          </button>
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
