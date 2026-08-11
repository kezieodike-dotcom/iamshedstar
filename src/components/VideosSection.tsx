/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Play, Calendar, Eye, Clock, ExternalLink } from 'lucide-react';
import { Video } from '../types';
import { TapeTitle, SafetyPin } from './Decor';

interface VideosSectionProps {
  videos: Video[];
}

export default function VideosSection({ videos }: VideosSectionProps) {
  const [activeCategory, setActiveCategory] = useState<'all' | 'music-video' | 'live' | 'behind-the-scenes' | 'studio' | 'interview'>('all');
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(videos[0] || null);

  useEffect(() => {
    if (!selectedVideo && videos.length > 0) {
      setSelectedVideo(videos[0]);
    }
  }, [selectedVideo, videos]);

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

      {/* Hero video poster. YouTube embeds can show Error 153 inside local/webview
          browsers, so this keeps the section clean and opens the video directly. */}
      {selectedVideo && (
        <div className="mb-16 bg-paper border-4 border-ink rounded-none overflow-hidden">
          <a
            href={`https://youtu.be/${selectedVideo.youtubeId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative block aspect-video w-full bg-ink overflow-hidden"
            aria-label={`Watch ${selectedVideo.title} on YouTube`}
          >
            <img
              src={selectedVideo.coverUrl}
              alt={selectedVideo.title}
              className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:scale-[1.02] transition-transform duration-500"
            />
            <span className="absolute inset-0 bg-ink/30 group-hover:bg-ink/20 transition-colors" />
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="w-20 h-20 bg-brand text-white border-4 border-ink flex items-center justify-center shadow-[8px_8px_0_rgba(57,53,52,0.45)] group-hover:bg-ink transition-colors">
                <Play className="w-9 h-9 fill-current ml-1" />
              </span>
            </span>
            <span className="absolute left-4 bottom-4 bg-ink text-white font-display font-black uppercase text-xs tracking-wide px-4 py-2">
              Watch on YouTube
            </span>
          </a>
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
              <a
                href={`https://youtu.be/${selectedVideo.youtubeId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ink text-xs"
              >
                <ExternalLink className="w-4 h-4" />
                Watch on YouTube
              </a>
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
