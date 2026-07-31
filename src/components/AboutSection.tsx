/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Download, Award, Music, Compass, Star, Eye, Image as ImageIcon, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { GalleryItem } from '../types';
import { TapeTitle, SafetyPin } from './Decor';

interface AboutSectionProps {
  gallery: GalleryItem[];
}

export default function AboutSection({ gallery }: AboutSectionProps) {
  const [activeCategory, setActiveCategory] = useState<'all' | 'concert' | 'fans' | 'studio' | 'travel' | 'lifestyle' | 'awards'>('all');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const filteredGallery = activeCategory === 'all'
    ? gallery
    : gallery.filter(item => item.category === activeCategory);

  const categories: { id: typeof activeCategory; label: string }[] = [
    { id: 'all', label: 'All Photos' },
    { id: 'concert', label: 'Concerts' },
    { id: 'studio', label: 'Studio' },
    { id: 'fans', label: 'Fans' },
    { id: 'travel', label: 'Travel' },
    { id: 'lifestyle', label: 'Lifestyle' },
    { id: 'awards', label: 'Awards' },
  ];

  const triggerDownloadPressKit = () => {
    // Simulated press kit download
    const element = document.createElement("a");
    const file = new Blob([`SHEDSTAR OFFICIAL PRESS KIT 2026\n\nName: Shedstar\nGenre: Afrofusion, R&B, Pop\nBased: London / Lagos\nManagement Email: management@shedstar.com\n\nBIOGRAPHY:\nShedstar is a global pioneering musical force who bridges continents through sonic frequency...`], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = "shedstar_press_kit_2026.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handlePrevImage = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex(lightboxIndex === 0 ? filteredGallery.length - 1 : lightboxIndex - 1);
    }
  };

  const handleNextImage = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex(lightboxIndex === filteredGallery.length - 1 ? 0 : lightboxIndex + 1);
    }
  };

  return (
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 text-ink select-none">

      <SafetyPin className="absolute top-6 right-8 rotate-12 hidden sm:block" size={56} />

      {/* Page Title */}
      <div className="mb-16">
        <span className="text-xs text-brand font-mono uppercase tracking-widest">About The Artist</span>
        <div className="mt-3"><TapeTitle>The Journey Of Shedstar</TapeTitle></div>
      </div>

      {/* Grid: Biography Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mb-24">

        {/* Left Side: Photo portrait & Press kit download */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="relative aspect-[3/4] overflow-hidden border-4 border-ink">
            <img
              src="https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=800&auto=format&fit=crop"
              alt="Shedstar Portrait"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            <SafetyPin className="absolute top-4 left-4 -rotate-12" size={52} />
            <div className="absolute bottom-6 left-6 right-6">
              <span className="text-[10px] font-mono text-white/80 uppercase tracking-widest">Shedstar</span>
              <h2 className="display-hd text-white text-2xl mt-1">Lagos • London • Global</h2>
            </div>
          </div>

          {/* Press Kit Download Trigger Card */}
          <div className="p-6 bg-cream border-2 border-ink flex flex-col gap-4">
            <div>
              <h3 className="text-lg font-display font-bold text-ink uppercase">Official Press Kit (EPK)</h3>
              <p className="text-xs text-muted mt-1">Includes high-res promo photos, tech rider, bios in multiple lengths, and logo vectors.</p>
            </div>
            <button
              onClick={triggerDownloadPressKit}
              className="btn-ink w-full text-xs active:scale-95"
            >
              <Download className="w-4 h-4" />
              Download Press Kit
            </button>
          </div>
        </div>

        {/* Right Side: Tabbed / Split Bio Content */}
        <div className="lg:col-span-7 flex flex-col gap-8">

          {/* Section: Early Life & Roots */}
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-11 h-11 border-2 border-ink bg-brand-soft text-brand flex items-center justify-center">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-2xl font-display font-black text-ink uppercase tracking-tight">Early Life & Roots</h3>
              <p className="text-muted text-sm mt-2 leading-relaxed">
                Born in Lagos, Nigeria, and later relocating to South London, Shedstar grew up immersed in a vibrant collage of musical cultures. Listening to his father's collection of classic African Highlife and Afrobeat records (Fela Kuti, Sunny Ade) while absorbing London's underground grime, UK garage, and R&B scenes, he discovered his calling early. By age 14, he was producing beats on an old laptop, bridging African polyrhythms with futuristic European electronic synths.
              </p>
            </div>
          </div>

          {/* Section: Musical Journey */}
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-11 h-11 border-2 border-ink bg-brand-soft text-brand flex items-center justify-center">
              <Music className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-2xl font-display font-black text-ink uppercase tracking-tight">Musical Journey</h3>
              <p className="text-muted text-sm mt-2 leading-relaxed">
                Shedstar first broke onto the international scene in 2024 with his breakout EP "Shedding Light," which caught the attention of leading music curators and tastemakers worldwide. His seamless fusion of Yoruba lyrics with smooth English vocal melodies created a brand new genre sub-lane: "Luxury Afro-R&B." His debut album "Starborn" (released in mid-2026) instantly topped global charts, cementng his position as a certified streaming juggernaut with over 150 million plays.
              </p>
            </div>
          </div>

          {/* Section: Mission & Vision */}
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-11 h-11 border-2 border-ink bg-brand-soft text-brand flex items-center justify-center">
              <Star className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-2xl font-display font-black text-ink uppercase tracking-tight">Vision & Mission</h3>
              <p className="text-muted text-sm mt-2 leading-relaxed">
                "My mission is to create a seamless bridge between the past and the future of African sound," Shedstar reflects. "I want to show the world that African music is not a monolith—it is high fashion, it is luxury, it is cinema. The gold-foil and royal velvet aesthetic represent our rich cultural history, elevated to futuristic standards."
              </p>
            </div>
          </div>

          {/* Section: Awards & Achievements */}
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-11 h-11 border-2 border-ink bg-brand-soft text-brand flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <div className="w-full">
              <h3 className="text-2xl font-display font-black text-ink uppercase tracking-tight">Awards & Accolades</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
                <div className="p-4 bg-cream border-2 border-ink">
                  <span className="text-brand font-mono text-xs font-semibold">2026 • WINNER</span>
                  <p className="text-sm text-ink font-bold mt-1">Global Afrobeats Artist of the Year</p>
                  <p className="text-[10px] text-muted font-mono">World Music Awards</p>
                </div>
                <div className="p-4 bg-cream border-2 border-ink">
                  <span className="text-brand font-mono text-xs font-semibold">2026 • WINNER</span>
                  <p className="text-sm text-ink font-bold mt-1">Best International Fusion Act</p>
                  <p className="text-[10px] text-muted font-mono">UK Music Awards</p>
                </div>
                <div className="p-4 bg-cream border-2 border-ink">
                  <span className="text-brand font-mono text-xs font-semibold">2025 • NOMINEE</span>
                  <p className="text-sm text-ink font-bold mt-1">Best New Artist</p>
                  <p className="text-[10px] text-muted font-mono">MAMA Awards</p>
                </div>
                <div className="p-4 bg-cream border-2 border-ink">
                  <span className="text-brand font-mono text-xs font-semibold">2025 • CERTIFIED</span>
                  <p className="text-sm text-ink font-bold mt-1">Double Platinum Lead Single</p>
                  <p className="text-[10px] text-muted font-mono">UK, Canada, Nigeria Charts</p>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* PHOTO GALLERY SECTION WITH INTERACTIVE FILTERS & LIGHTBOX */}
      <div className="border-t-2 border-ink pt-20">

        <div className="mb-10">
          <span className="text-xs text-brand font-mono uppercase tracking-widest flex items-center gap-1">
            <ImageIcon className="w-3.5 h-3.5" />
            Visual Journal
          </span>
          <div className="mt-3"><TapeTitle size="text-4xl sm:text-6xl">Gallery & Lifestyle</TapeTitle></div>
          <p className="text-sm text-muted mt-3 max-w-md">Step behind the camera lens to experience Shedstar\'s travel logs, studio sessions, and massive tour concerts.</p>
        </div>

        {/* Categories Tab selector */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 text-xs font-display font-bold uppercase tracking-widest transition-all border-2 ${
                activeCategory === cat.id
                  ? 'bg-ink text-white border-ink'
                  : 'bg-paper border-ink text-muted hover:text-ink'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredGallery.map((item, index) => (
            <div
              key={item.id}
              onClick={() => setLightboxIndex(index)}
              className="group relative aspect-square overflow-hidden border-2 border-ink bg-cream cursor-pointer"
            >
              <img
                src={item.url}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              {/* Overlay with info */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                <span className="text-[9px] font-mono text-white/80 uppercase tracking-widest">{item.category}</span>
                <p className="text-xs font-semibold text-white mt-1 truncate">{item.title}</p>
                <span className="text-[10px] text-white/70 mt-2 flex items-center gap-1 font-mono uppercase">
                  <Eye className="w-3 h-3" /> View Fullscreen
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Photo Lightbox Dialog Modal */}
      {lightboxIndex !== null && (
        <div className="fixed inset-0 z-50 bg-ink/90 backdrop-blur-md flex items-center justify-center p-4">

          <button
            onClick={() => setLightboxIndex(null)}
            className="absolute top-6 right-6 p-2 text-white/70 hover:text-white transition-colors"
            title="Close Lightbox"
          >
            <X className="w-6 h-6" />
          </button>

          <button
            onClick={handlePrevImage}
            className="absolute left-4 p-3 border-2 border-white/40 bg-white/10 text-white/70 hover:text-white hover:bg-white/20 transition-colors"
            title="Previous Image"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <div className="max-w-4xl max-h-[80vh] flex flex-col items-center justify-center gap-4">
            <img
              src={filteredGallery[lightboxIndex].url}
              alt={filteredGallery[lightboxIndex].title}
              className="max-w-full max-h-[70vh] border-2 border-white object-contain"
            />
            <div className="text-center max-w-xl">
              <span className="text-[10px] font-mono text-white/60 uppercase tracking-widest">{filteredGallery[lightboxIndex].category}</span>
              <p className="text-sm text-white/90 mt-1">{filteredGallery[lightboxIndex].title}</p>
            </div>
          </div>

          <button
            onClick={handleNextImage}
            className="absolute right-4 p-3 border-2 border-white/40 bg-white/10 text-white/70 hover:text-white hover:bg-white/20 transition-colors"
            title="Next Image"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

        </div>
      )}

    </div>
  );
}
