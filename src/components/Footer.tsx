/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Youtube, Instagram, Music, Music2, ArrowUp, Share2, Check } from 'lucide-react';

interface FooterProps {
  setActiveTab: (tab: string) => void;
  onOpenPrivacy: () => void;
  onOpenTerms: () => void;
  isAdmin: boolean;
  onLogoutAdmin: () => void;
}

export default function Footer({
  setActiveTab,
  onOpenPrivacy,
  onOpenTerms,
  isAdmin,
  onLogoutAdmin,
}: FooterProps) {
  const [shared, setShared] = React.useState(false);
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });
  const currentYear = new Date().getFullYear();

  const shareSite = async () => {
    const shareData = { title: 'Shedstar | Official Website', text: 'Visit the official Shedstar website.', url: window.location.href };
    try {
      if (navigator.share) await navigator.share(shareData);
      else await navigator.clipboard.writeText(window.location.href);
      setShared(true);
      window.setTimeout(() => setShared(false), 2200);
    } catch {
      // Sharing can be canceled by the user; no error state is needed.
    }
  };

  const links = [
    { id: 'about', label: 'About' },
    { id: 'music', label: 'Music' },
    { id: 'videos', label: 'Videos' },
    { id: 'merchandise', label: 'Merch' },
    { id: 'ebooks', label: 'E-Books' },
    { id: 'tour', label: 'Tour Dates' },
    { id: 'gallery', label: 'Gallery' },
    { id: 'news', label: 'News' },
    { id: 'partners', label: 'Partners & Advertise' },
    { id: 'booking', label: 'Booking' },
    { id: 'contact', label: 'Contact' },
    { id: 'admin', label: isAdmin ? 'Admin Dashboard' : 'Admin' },
  ];

  const socials = [
    { icon: Music, href: 'https://spotify.com', label: 'Spotify' },
    { icon: Music2, href: 'https://music.apple.com', label: 'Apple Music' },
    { icon: Instagram, href: 'https://instagram.com', label: 'Instagram' },
    { icon: Youtube, href: 'https://youtube.com', label: 'YouTube' },
  ];

  return (
    <footer className="reference-footer bg-cream border-t-4 border-ink px-4 md:px-8 pt-12 pb-8 select-none">
      <div className="max-w-7xl mx-auto flex flex-col gap-10">

        {/* Oversized wordmark + back to top */}
        <div className="flex items-center justify-between gap-4">
          <button onClick={scrollToTop} className="poster-title text-ink text-[16vw] md:text-[11vw] leading-[0.8] hover:text-brand transition-colors">
            Shedstar
          </button>
          <button
            onClick={scrollToTop}
            className="shrink-0 w-11 h-11 border-2 border-ink text-ink hover:bg-ink hover:text-white flex items-center justify-center transition-colors"
            title="Back to top"
          >
            <ArrowUp className="w-5 h-5" />
          </button>
        </div>

        {/* Links + socials */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 border-t-2 border-ink pt-8">
          <nav className="grid grid-cols-2 sm:grid-cols-3 gap-x-8 gap-y-2">
            {links.map((l) => (
              <button
                key={l.id}
                onClick={() => setActiveTab(l.id)}
                className="text-left font-display font-bold text-sm uppercase tracking-wide text-ink hover:text-brand transition-colors"
              >
                {l.label}
              </button>
            ))}
            {isAdmin && (
              <button
                onClick={onLogoutAdmin}
                className="text-left font-display font-bold text-sm uppercase tracking-wide text-ink hover:text-brand transition-colors"
              >
                Log Out
              </button>
            )}
          </nav>
          <div className="flex flex-col items-start md:items-end gap-5">
            <button onClick={shareSite} className="btn-ink text-[10px] inline-flex items-center gap-2" title="Share this page">
              {shared ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
              {shared ? 'Link Copied' : 'Share This Page'}
            </button>
            <div className="flex items-center gap-4">
              {socials.map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" title={s.label} className="text-brand hover:text-ink transition-colors">
                  <s.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Legal */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] font-mono text-muted border-t border-line pt-5">
          <p>© {currentYear} Shedstar Music Group. All Rights Reserved.</p>
          <div className="flex gap-4">
            <button onClick={onOpenPrivacy} className="hover:text-brand transition-colors">Privacy Policy</button>
            <span>|</span>
            <button onClick={onOpenTerms} className="hover:text-brand transition-colors">Terms of Use</button>
          </div>
        </div>

      </div>
    </footer>
  );
}
