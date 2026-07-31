/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Play, Pause, Music, Disc, Calendar, ExternalLink, MessageSquare, ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { Song } from '../types';
import { TapeTitle, SafetyPin, TornPanel } from './Decor';

interface MusicSectionProps {
  songs: Song[];
  currentSong: Song | null;
  onSelectSong: (song: Song) => void;
  onPlayPause: (play: boolean) => void;
  isPlaying: boolean;
}

export default function MusicSection({
  songs,
  currentSong,
  onSelectSong,
  onPlayPause,
  isPlaying,
}: MusicSectionProps) {
  const [activeCategory, setActiveCategory] = useState<'all' | 'album' | 'single' | 'ep'>('all');
  const [selectedLyricsSong, setSelectedLyricsSong] = useState<Song | null>(null);

  const filteredSongs = activeCategory === 'all' 
    ? songs 
    : songs.filter(s => s.category === activeCategory);

  const categories: { id: typeof activeCategory; label: string }[] = [
    { id: 'all', label: 'All Releases' },
    { id: 'album', label: 'Albums' },
    { id: 'single', label: 'Singles' },
    { id: 'ep', label: 'EPs' },
  ];

  const handlePlaySong = (song: Song) => {
    if (currentSong?.id === song.id) {
      onPlayPause(!isPlaying);
    } else {
      onSelectSong(song);
      onPlayPause(true);
    }
  };

  return (
    <div className="bg-silver grain relative text-ink select-none">
    <SafetyPin className="absolute top-10 right-10 rotate-12 hidden sm:block" size={60} />
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-24 relative">

      {/* Featured framed-cover showcase on a torn blue paper panel (Teddy Swims reference) */}
      <TornPanel className="px-4 sm:px-10 py-12 md:py-16 mb-14 md:mb-20">
        <h1 className="poster-title text-white text-center text-6xl sm:text-7xl md:text-8xl mb-3 drop-shadow-[0_3px_0_rgba(0,0,0,0.22)]">
          Music
        </h1>
        <p className="text-center text-white/75 font-mono text-[11px] uppercase tracking-[0.3em] mb-10 md:mb-12">
          Stream &amp; Discover The Discography
        </p>
        <div className="relative">
          <div id="music-featured-row" className="carousel-row carousel-1up no-scrollbar px-1 justify-start md:justify-center">
            {songs.map((song) => {
              const isCurrent = currentSong?.id === song.id;
              const isCurrentPlaying = isCurrent && isPlaying;
              return (
                <button key={song.id} onClick={() => handlePlaySong(song)} className="group w-44 sm:w-52 md:w-56">
                  {/* white photo frame */}
                  <div className="relative aspect-square bg-white p-1.5 shadow-xl">
                    <img src={song.coverUrl} alt={song.title} className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500" />
                    <span className={`absolute inset-1.5 flex items-center justify-center bg-black/30 transition-opacity ${isCurrentPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                      <span className="w-12 h-12 bg-brand text-white flex items-center justify-center">
                        {isCurrentPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                      </span>
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
          <SideNav targetId="music-featured-row" />
        </div>
      </TornPanel>

      {/* Discography heading */}
      <div className="mb-8">
        <TapeTitle size="text-4xl sm:text-6xl">The Discography</TapeTitle>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">

        {/* Left Column: Playlist Filter & List (Col span 7) */}
        <div className="lg:col-span-7 flex flex-col gap-6">

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2 pb-5 border-b-2 border-ink">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-none text-xs font-display font-bold uppercase tracking-wide transition-all border-2 ${
                  activeCategory === cat.id
                    ? 'bg-ink text-white border-ink'
                    : 'bg-white hover:bg-cream text-muted hover:text-ink border-ink'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Songs List */}
          <div className="flex flex-col gap-3">
            {filteredSongs.map((song) => {
              const isCurrent = currentSong?.id === song.id;
              const isCurrentPlaying = isCurrent && isPlaying;

              return (
                <div
                  key={song.id}
                  className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-none border-2 transition-all duration-300 ${
                    isCurrent
                      ? 'border-ink bg-brand-soft'
                      : 'border-ink bg-paper hover:bg-cream'
                  }`}
                >
                  {/* Left Side: Art, Play/Pause button, Title */}
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <button
                      onClick={() => handlePlaySong(song)}
                      className="flex-shrink-0 w-14 h-14 rounded-none relative overflow-hidden group border-2 border-ink"
                    >
                      <img
                        src={song.coverUrl}
                        alt={song.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-ink/40 flex items-center justify-center opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                        {isCurrentPlaying ? (
                          <Pause className="w-5 h-5 text-white fill-current" />
                        ) : (
                          <Play className="w-5 h-5 text-white fill-current ml-0.5" />
                        )}
                      </div>
                    </button>
                    <div className="flex-1 min-w-0">
                      <h3 className={`text-base font-display font-bold truncate ${isCurrent ? 'text-brand' : 'text-ink'}`}>
                        {song.title}
                      </h3>
                      <p className="text-xs text-muted truncate">{song.album}</p>
                    </div>
                  </div>

                  {/* Center Column: Duration, category, lyrics trigger */}
                  <div className="flex items-center gap-4 mt-3 sm:mt-0 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="flex items-center gap-2 text-xs text-muted font-mono">
                      <span className="px-2 py-0.5 bg-brand text-white rounded-none text-[10px] uppercase font-bold border-2 border-ink">{song.category}</span>
                      <span>{song.duration}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedLyricsSong(selectedLyricsSong?.id === song.id ? null : song)}
                        className={`p-2 rounded-none border-2 border-ink hover:bg-cream transition-colors ${
                          selectedLyricsSong?.id === song.id ? 'text-brand bg-brand-soft' : 'text-muted bg-white'
                        }`}
                        title="View Lyrics"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </button>

                      {/* Play/Pause Button as icon */}
                      <button
                        onClick={() => handlePlaySong(song)}
                        className={`w-10 h-10 rounded-none border-2 border-ink flex items-center justify-center transition-all ${
                          isCurrentPlaying ? 'bg-brand hover:bg-brand-dark text-white' : 'bg-ink hover:bg-brand text-white'
                        }`}
                      >
                        {isCurrentPlaying ? <Pause className="w-4.5 h-4.5 fill-current" /> : <Play className="w-4.5 h-4.5 fill-current ml-0.5" />}
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>

        </div>

        {/* Right Column: Mini Details, Lyrics Reader, and Streaming links (Col span 5) */}
        <div className="lg:col-span-5 flex flex-col gap-6 lg:sticky lg:top-24">

          {selectedLyricsSong ? (
            /* Lyrics View */
            <div className="p-6 bg-paper border-2 border-ink rounded-none">
              <div className="flex justify-between items-start mb-6 pb-4 border-b-2 border-ink">
                <div>
                  <h3 className="text-lg font-display font-bold text-ink">{selectedLyricsSong.title}</h3>
                  <p className="text-xs text-brand font-mono uppercase mt-1">Lyrics & Stream Links</p>
                </div>
                <button
                  onClick={() => setSelectedLyricsSong(null)}
                  className="text-xs text-muted hover:text-ink"
                >
                  Close Lyrics
                </button>
              </div>

              {/* Streaming Embed Badges */}
              <div className="mb-6 flex flex-col gap-2">
                <p className="text-[10px] font-mono uppercase text-muted tracking-widest">Listen On</p>
                <div className="flex flex-wrap gap-2">
                  {selectedLyricsSong.streamingLinks.spotify && (
                    <a href={selectedLyricsSong.streamingLinks.spotify} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 bg-white hover:bg-brand hover:text-white border-2 border-ink rounded-none text-xs text-ink font-mono flex items-center gap-1.5 transition-all">
                      <Disc className="w-3.5 h-3.5" /> Spotify
                    </a>
                  )}
                  {selectedLyricsSong.streamingLinks.appleMusic && (
                    <a href={selectedLyricsSong.streamingLinks.appleMusic} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 bg-white hover:bg-brand hover:text-white border-2 border-ink rounded-none text-xs text-ink font-mono flex items-center gap-1.5 transition-all">
                      <Disc className="w-3.5 h-3.5" /> Apple Music
                    </a>
                  )}
                  {selectedLyricsSong.streamingLinks.audiomack && (
                    <a href={selectedLyricsSong.streamingLinks.audiomack} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 bg-white hover:bg-brand hover:text-white border-2 border-ink rounded-none text-xs text-ink font-mono flex items-center gap-1.5 transition-all">
                      <Disc className="w-3.5 h-3.5" /> Audiomack
                    </a>
                  )}
                  {selectedLyricsSong.streamingLinks.boomplay && (
                    <a href={selectedLyricsSong.streamingLinks.boomplay} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 bg-white hover:bg-brand hover:text-white border-2 border-ink rounded-none text-xs text-ink font-mono flex items-center gap-1.5 transition-all">
                      <Disc className="w-3.5 h-3.5" /> Boomplay
                    </a>
                  )}
                </div>
              </div>

              <p className="text-[10px] font-mono uppercase text-muted tracking-widest mb-2">Lyrics</p>
              <div className="bg-cream p-4 rounded-none border-2 border-ink max-h-80 overflow-y-auto whitespace-pre-line text-sm text-ink leading-relaxed text-center font-sans">
                {selectedLyricsSong.lyrics}
              </div>
            </div>
          ) : (
            /* Featured release display when no lyrics selected */
            <div className="p-6 bg-cream border-2 border-ink rounded-none flex flex-col gap-6">
              <div>
                <span className="text-[10px] font-mono text-brand uppercase tracking-widest flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> Lead Single Release
                </span>
                <h3 className="text-xl font-display font-black uppercase text-ink mt-2">SHEDDING LIGHT</h3>
                <p className="text-xs text-muted mt-1">Released May 12, 2026 • Certified Double Platinum</p>
              </div>

              <div className="aspect-video rounded-none overflow-hidden border-2 border-ink">
                <img
                  src="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=600&auto=format&fit=crop"
                  alt="Shedding Light Studio Shot"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex flex-col gap-2">
                <h4 className="text-xs font-mono uppercase text-muted tracking-widest">Connect and stream on external networks:</h4>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <a href="https://spotify.com" target="_blank" rel="noopener noreferrer" className="p-3 bg-paper hover:bg-brand hover:text-white border-2 border-ink rounded-none flex items-center justify-between transition-all">
                    <span>Spotify</span> <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <a href="https://music.apple.com" target="_blank" rel="noopener noreferrer" className="p-3 bg-paper hover:bg-brand hover:text-white border-2 border-ink rounded-none flex items-center justify-between transition-all">
                    <span>Apple Music</span> <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <a href="https://audiomack.com" target="_blank" rel="noopener noreferrer" className="p-3 bg-paper hover:bg-brand hover:text-white border-2 border-ink rounded-none flex items-center justify-between transition-all">
                    <span>Audiomack</span> <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <a href="https://boomplay.com" target="_blank" rel="noopener noreferrer" className="p-3 bg-paper hover:bg-brand hover:text-white border-2 border-ink rounded-none flex items-center justify-between transition-all">
                    <span>Boomplay</span> <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
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
