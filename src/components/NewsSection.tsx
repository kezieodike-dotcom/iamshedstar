/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Calendar, User, Clock, ArrowRight, X, ChevronRight, Share2, Flame } from 'lucide-react';
import { BlogPost } from '../types';
import AdSpace from './AdSpace';
import { TapeTitle, SafetyPin } from './Decor';

interface NewsSectionProps {
  blog: BlogPost[];
}

export default function NewsSection({ blog }: NewsSectionProps) {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  const categories = ['All', 'Tour Updates', 'Creative Design', 'Achievements'];

  const filteredBlog = activeCategory === 'All'
    ? blog
    : blog.filter(post => post.category === activeCategory);

  const handleShare = (post: BlogPost) => {
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.summary,
        url: window.location.href,
      }).catch(err => console.log('Share failed:', err));
    } else {
      alert(`Shared link: ${window.location.origin}/news/${post.id}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 text-ink select-none relative">

      <SafetyPin className="absolute top-10 right-6 rotate-12 hidden sm:block" size={60} />

      {/* Title */}
      <div className="mb-12">
        <span className="text-xs text-brand font-mono uppercase tracking-widest">Artist Logs & Releases</span>
        <div className="mt-3">
          <TapeTitle>Newsroom</TapeTitle>
        </div>
      </div>

      {/* Featured Headline - Double layout for the very first post */}
      {blog.length > 0 && activeCategory === 'All' && (
        <div
          onClick={() => setSelectedPost(blog[0])}
          className="mb-16 bg-cream border-2 border-ink hover:border-brand overflow-hidden transition-all duration-300 cursor-pointer grid grid-cols-1 lg:grid-cols-12 gap-0 group"
        >
          <div className="lg:col-span-7 aspect-video lg:aspect-auto overflow-hidden bg-cream-dark border-b-2 lg:border-b-0 lg:border-r-2 border-ink">
            <img
              src={blog[0].coverUrl}
              alt={blog[0].title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
          <div className="lg:col-span-5 p-6 md:p-8 flex flex-col justify-between">
            <div className="flex flex-col gap-3">
              <span className="px-3 py-1 bg-brand text-white text-[10px] font-mono uppercase font-bold tracking-widest w-fit flex items-center gap-1">
                <Flame className="w-3 h-3 text-white animate-pulse" />
                Featured Headline
              </span>
              <h2 className="text-2xl md:text-3xl font-display font-black uppercase tracking-tight text-ink group-hover:text-brand transition-colors">{blog[0].title}</h2>
              <p className="text-sm text-muted mt-1 leading-relaxed line-clamp-4">{blog[0].summary}</p>
            </div>

            <div className="mt-6 pt-6 border-t-2 border-ink flex items-center justify-between">
              <div className="flex items-center gap-3 text-[10px] text-muted font-mono">
                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-brand" /> {blog[0].date}</span>
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-brand" /> {blog[0].readTime}</span>
              </div>
              <span className="text-xs text-brand group-hover:underline flex items-center gap-1 font-display uppercase tracking-widest font-bold">
                Read Article <ChevronRight className="w-4 h-4" />
              </span>
            </div>
          </div>
        </div>
      )}

      {/* In-feed sponsored advertisement */}
      <div className="mb-10">
        <AdSpace placement="banner" />
      </div>

      {/* Horizontal Category selector */}
      <div className="flex gap-2 pb-6 mb-10 overflow-x-auto no-scrollbar border-b-2 border-ink justify-start">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-5 py-2 border-2 border-ink text-xs font-display font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
              activeCategory === cat
                ? 'bg-ink text-white'
                : 'bg-paper hover:bg-cream-dark text-ink'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Blog Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredBlog.map((post) => (
          <div
            key={post.id}
            onClick={() => setSelectedPost(post)}
            className="group bg-cream border-2 border-ink hover:border-brand overflow-hidden cursor-pointer transition-all duration-300 flex flex-col h-full"
          >
            <div className="relative aspect-video overflow-hidden bg-cream-dark border-b-2 border-ink">
              <img
                src={post.coverUrl}
                alt={post.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <span className="absolute top-3 left-3 px-3 py-1 bg-ink text-[9px] font-mono text-white uppercase font-bold tracking-widest">
                {post.category}
              </span>
            </div>

            <div className="p-5 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 text-[10px] text-muted font-mono mb-2">
                  <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {post.date}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {post.readTime}</span>
                </div>
                <h3 className="text-base font-display font-bold text-ink mt-1 group-hover:text-brand transition-colors line-clamp-2 uppercase tracking-wide">
                  {post.title}
                </h3>
                <p className="text-sm text-muted mt-2 line-clamp-3">{post.summary}</p>
              </div>

              <div className="flex items-center justify-between mt-6 pt-4 border-t-2 border-ink">
                <span className="text-xs text-muted font-mono">By {post.author}</span>
                <span className="text-xs text-brand group-hover:underline flex items-center gap-1 font-display font-bold uppercase tracking-widest">
                  Full Story <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Full Article Modal dialog */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 bg-ink/70 backdrop-blur-md flex items-center justify-center p-4 select-text">
          <div className="bg-paper border-2 border-ink max-w-3xl w-full max-h-[90vh] overflow-y-auto relative shadow-2xl text-ink">

            <button
              onClick={() => setSelectedPost(null)}
              className="absolute top-4 right-4 bg-white hover:bg-ink hover:text-white border-2 border-ink p-2 text-ink z-10"
              title="Close Article"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="aspect-video w-full overflow-hidden bg-cream-dark relative border-b-2 border-ink">
              <img
                src={selectedPost.coverUrl}
                alt={selectedPost.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <span className="px-3 py-1 bg-brand text-white text-[9px] font-mono uppercase font-bold tracking-widest">
                  {selectedPost.category}
                </span>
                <h2 className="text-2xl md:text-4xl font-display font-black uppercase text-white mt-3 leading-tight tracking-tight">{selectedPost.title}</h2>
              </div>
            </div>

            <div className="p-6 md:p-8">

              {/* Meta information row */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-ink pb-4 mb-6 text-xs text-muted font-mono">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1"><Calendar className="w-4 h-4 text-brand" /> {selectedPost.date}</span>
                  <span className="flex items-center gap-1"><Clock className="w-4 h-4 text-brand" /> {selectedPost.readTime}</span>
                  <span className="flex items-center gap-1"><User className="w-4 h-4 text-brand" /> {selectedPost.author}</span>
                </div>
                <button
                  onClick={() => handleShare(selectedPost)}
                  className="px-3 py-1.5 bg-cream hover:bg-brand hover:text-white text-ink border-2 border-ink text-[10px] uppercase font-bold flex items-center gap-1 transition-colors select-none"
                >
                  <Share2 className="w-3.5 h-3.5" /> Share
                </button>
              </div>

              {/* Body Text Content */}
              <div className="whitespace-pre-line text-sm md:text-base text-ink/80 leading-relaxed font-sans flex flex-col gap-4">
                {selectedPost.content}
              </div>

              {/* In-article advertisement */}
              <div className="mt-8">
                <AdSpace placement="inline" />
              </div>

              <div className="mt-8 pt-6 border-t-2 border-ink text-center select-none">
                <button
                  onClick={() => setSelectedPost(null)}
                  className="btn-outline text-xs"
                >
                  Close Article
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
