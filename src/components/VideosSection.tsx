/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Play, Film, Calendar, Eye, Clock, X } from 'lucide-react';
import { Video } from '../types';
import { TapeTitle, SafetyPin } from './Decor';

interface VideosSectionProps {
  videos: Video[];
}

export default function VideosSection({ videos }: VideosSectionProps) {
  const [activeCategory, setActiveCategory] = useState<'all' | 'music-video' | 'live' | 'behind-the-scenes' | 'studio' | 'interview'>('all');
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(videos[0] || null);

  const filteredVideos = activeCategory === 'all' 
    ? videos 
    : videos.filter(v => v.category === activeCategory);

  const categories: { id: typeof activeCategory; label: string }[] = [
    { id: 'all', label: 'All Videos' },
    { id: 'music-video', label: 'Music Videos' },
    { id: 'live', label: 'Live Performances' },
    { id: 'studio', label: 'Studio Sessions' },
    { id: 'interview', label: 'Interviews' },
  ];

  return (
    <div className="bg-wash-green grain relative text-ink select-none">
    <SafetyPin className="absolute top-10 right-12 rotate-45 hidden sm:block" size={58} />
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 relative">

      {/* Page Title */}
      <div className="mb-12">
        <span className="text-xs text-brand font-mono uppercase tracking-widest">Cinematic Videos</span>
        <div className="mt-3"><TapeTitle>Video Gallery</TapeTitle></div>
      </div>

      {/* Hero Video Player (The primary focus) */}
      {selectedVideo && (
        <div className="mb-16 bg-paper border-4 border-ink rounded-none overflow-hidden">
          <div className="relative aspect-video w-full bg-ink">
            {/* Embedded YouTube Iframe - uses standard embed with referrerPolicy */}
            <iframe
              title={selectedVideo.title}
              src={`https://www.youtube.com/embed/${selectedVideo.youtubeId}?autoplay=1`}
              referrerPolicy="no-referrer"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full border-0"
            ></iframe>
          </div>
          <div className="p-6 md:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="px-3 py-0.5 bg-brand text-white text-[10px] font-mono rounded-none uppercase font-bold tracking-widest border-2 border-ink">
                  {selectedVideo.category.replace('-', ' ')}
                </span>
                <h2 className="text-xl md:text-2xl font-display font-black uppercase text-ink mt-2">{selectedVideo.title}</h2>
                <div className="flex items-center gap-4 text-xs text-muted mt-2 font-mono">
                  <span className="flex items-center gap-1"><Eye className="w-4 h-4 text-brand" /> {selectedVideo.views}</span>
                  <span className="flex items-center gap-1"><Clock className="w-4 h-4 text-brand" /> {selectedVideo.duration}</span>
                  <span className="flex items-center gap-1"><Calendar className="w-4 h-4 text-brand" /> {selectedVideo.releaseDate}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedVideo(null)}
                className="btn-outline text-xs"
              >
                Close Video Player
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Category Tab Selector */}
      <div className="flex flex-wrap gap-2 mb-10 pb-5 border-b-2 border-ink">
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

      {/* Video Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {filteredVideos.map((vid) => (
          <div
            key={vid.id}
            onClick={() => {
              setSelectedVideo(vid);
              window.scrollTo({ top: 400, behavior: 'smooth' });
            }}
            className={`group bg-paper border-2 rounded-none overflow-hidden cursor-pointer transition-all duration-300 ${
              selectedVideo?.id === vid.id ? 'border-brand' : 'border-ink hover:border-brand'
            }`}
          >
            <div className="relative aspect-video overflow-hidden bg-cream-dark border-b-2 border-ink">
              <img
                src={vid.coverUrl}
                alt={vid.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              {/* Play symbol button on hover */}
              <div className="absolute inset-0 bg-ink/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-14 h-14 bg-brand text-white rounded-none border-2 border-ink flex items-center justify-center transform scale-90 group-hover:scale-100 transition-transform">
                  <Play className="w-6 h-6 fill-current ml-0.5" />
                </div>
              </div>
              <span className="absolute bottom-3 right-3 px-1.5 py-0.5 bg-ink/70 text-[10px] font-mono rounded-none text-white font-bold">
                {vid.duration}
              </span>
            </div>

            <div className="p-4 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono text-brand uppercase tracking-widest">{vid.category.replace('-', ' ')}</span>
                <h3 className="text-sm font-display font-bold uppercase text-ink mt-1 group-hover:text-brand transition-colors line-clamp-1">{vid.title}</h3>
              </div>
              <div className="flex items-center justify-between text-[11px] text-muted font-mono mt-4 pt-3 border-t-2 border-ink">
                <span>{vid.views}</span>
                <span>{vid.releaseDate}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
    </div>
  );
}
