/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Camera, ImageOff } from 'lucide-react';
import { GalleryItem } from '../types';
import AdSpace from './AdSpace';
import { TapeTitle, SafetyPin } from './Decor';

interface GallerySectionProps {
  gallery: GalleryItem[];
}

const CATEGORIES: { id: string; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'concert', label: 'Concerts' },
  { id: 'fans', label: 'Fans' },
  { id: 'studio', label: 'Studio' },
  { id: 'travel', label: 'Travel' },
  { id: 'lifestyle', label: 'Lifestyle' },
  { id: 'awards', label: 'Awards' },
];

export default function GallerySection({ gallery }: GallerySectionProps) {
  const [filter, setFilter] = useState<string>('all');
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  const filtered = filter === 'all' ? gallery : gallery.filter((g) => g.category === filter);

  const openLightbox = (idx: number) => setLightboxIdx(idx);
  const closeLightbox = () => setLightboxIdx(null);
  const showPrev = () =>
    setLightboxIdx((i) => (i === null ? i : (i - 1 + filtered.length) % filtered.length));
  const showNext = () =>
    setLightboxIdx((i) => (i === null ? i : (i + 1) % filtered.length));

  return (
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 text-ink">

      <SafetyPin className="absolute top-6 right-8 rotate-12 hidden sm:block" size={56} />

      {/* Header */}
      <div className="mb-12 select-none">
        <span className="text-xs text-brand font-mono uppercase tracking-widest flex items-center gap-1.5">
          <Camera className="w-4 h-4" /> The Visual Universe
        </span>
        <div className="mt-3"><TapeTitle>Star Gallery</TapeTitle></div>
        <p className="text-muted text-sm md:text-base max-w-2xl mt-4 leading-relaxed">
          A curated look inside the world of Shedstar — from electric arena nights and midnight studio sessions to global travels, fan moments, and award-winning milestones.
        </p>
      </div>

      {/* Category filter rail */}
      <div className="flex flex-wrap gap-2 mb-10 select-none">
        {CATEGORIES.map((cat) => {
          const count = cat.id === 'all' ? gallery.length : gallery.filter((g) => g.category === cat.id).length;
          return (
            <button
              key={cat.id}
              onClick={() => setFilter(cat.id)}
              className={`px-4 py-2 font-display font-bold text-xs uppercase tracking-widest transition-all duration-300 border-2 ${
                filter === cat.id
                  ? 'bg-ink text-white border-ink'
                  : 'bg-paper text-muted border-ink hover:text-ink'
              }`}
            >
              {cat.label} <span className="opacity-60">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Masonry-style grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-24 border-2 border-dashed border-ink bg-cream">
          <ImageOff className="w-10 h-10 text-brand/50 mb-4" />
          <h3 className="font-display font-bold uppercase text-ink">No photos in this category yet</h3>
          <p className="text-sm text-muted mt-1">Check back soon for fresh moments.</p>
        </div>
      ) : (
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 [column-fill:_balance]">
          {filtered.map((item, idx) => (
            <button
              key={item.id}
              onClick={() => openLightbox(idx)}
              className="group relative mb-4 block w-full break-inside-avoid overflow-hidden border-2 border-ink hover:border-brand transition-all duration-300"
            >
              <img
                src={item.url}
                alt={item.title}
                loading="lazy"
                className="w-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4 text-left">
                <span className="text-[10px] font-mono text-white/80 uppercase tracking-widest">{item.category}</span>
                <p className="text-sm text-white font-display font-semibold leading-tight mt-0.5">{item.title}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Sponsor banner to monetize gallery traffic */}
      <div className="mt-16">
        <AdSpace placement="banner" />
      </div>

      {/* Lightbox overlay */}
      {lightboxIdx !== null && filtered[lightboxIdx] && (
        <div
          className="fixed inset-0 z-[60] bg-ink/90 backdrop-blur-md flex items-center justify-center p-4 select-none"
          onClick={closeLightbox}
        >
          <button
            onClick={closeLightbox}
            className="absolute top-5 right-5 text-white/70 hover:text-white transition-colors z-10"
            title="Close"
          >
            <X className="w-7 h-7" />
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); showPrev(); }}
            className="absolute left-3 sm:left-8 text-white/70 hover:text-white transition-colors z-10 p-2"
            title="Previous"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); showNext(); }}
            className="absolute right-3 sm:right-8 text-white/70 hover:text-white transition-colors z-10 p-2"
            title="Next"
          >
            <ChevronRight className="w-8 h-8" />
          </button>

          <div className="max-w-4xl w-full flex flex-col items-center gap-4" onClick={(e) => e.stopPropagation()}>
            <img
              src={filtered[lightboxIdx].url}
              alt={filtered[lightboxIdx].title}
              className="max-h-[75vh] w-auto object-contain border-2 border-ink shadow-2xl"
            />
            <div className="text-center">
              <span className="text-[10px] font-mono text-white/60 uppercase tracking-widest">
                {filtered[lightboxIdx].category} • {lightboxIdx + 1} / {filtered.length}
              </span>
              <p className="text-white font-display font-semibold mt-1">{filtered[lightboxIdx].title}</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
