import React, { useEffect, useState } from 'react';
import { ExternalLink, Sparkles, Info } from 'lucide-react';
import { AdUnit, AdConfig } from '../types';

interface AdSpaceProps {
  placement: 'sidebar' | 'banner' | 'popup' | 'footer' | 'inline';
  className?: string;
}

export default function AdSpace({ placement, className = '' }: AdSpaceProps) {
  const [ads, setAds] = useState<AdUnit[]>([]);
  const [config, setConfig] = useState<AdConfig | null>(null);
  const [activeAd, setActiveAd] = useState<AdUnit | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchAdData = async () => {
    try {
      const [adsRes, configRes] = await Promise.all([
        fetch('/api/ads'),
        fetch('/api/ads/config')
      ]);

      if (adsRes.ok && configRes.ok) {
        const adsData: AdUnit[] = await adsRes.json();
        const configData: AdConfig = await configRes.json();

        setConfig(configData);

        const placementAds = adsData.filter(ad => ad.isActive && ad.placement === placement);
        setAds(placementAds);

        if (placementAds.length > 0) {
          // Select a random ad or first ad
          const selected = placementAds[Math.floor(Math.random() * placementAds.length)];
          setActiveAd(selected);

          // Log impression in background
          fetch(`/api/ads/${selected.id}/impression`, { method: 'POST' }).catch(err =>
            console.error('Failed to register ad impression:', err)
          );
        }
      }
    } catch (e) {
      console.error('Failed to load ad units:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdData();
  }, [placement]);

  const handleAdClick = async (e: React.MouseEvent) => {
    if (!activeAd) return;

    // Log click in background
    try {
      await fetch(`/api/ads/${activeAd.id}/click`, { method: 'POST' });
    } catch (err) {
      console.error('Failed to register ad click:', err);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse bg-cream border-2 border-ink flex items-center justify-center p-4 min-h-[100px]">
        <div className="text-xs text-muted font-mono uppercase tracking-widest">Loading Advertisement...</div>
      </div>
    );
  }

  // If Google AdSense is enabled, show an elegant Google AdSense wrapper placeholder
  if (config?.adSenseEnabled) {
    return (
      <div
        id={`google-ad-${placement}`}
        className={`bg-cream border-2 border-ink p-3 relative overflow-hidden transition-all duration-300 ${className}`}
      >
        <div className="absolute top-1.5 right-2 flex items-center gap-1 select-none pointer-events-none">
          <span className="text-[9px] text-muted font-mono uppercase tracking-wider">Google Ads</span>
          <Info className="w-2.5 h-2.5 text-muted" />
        </div>

        <div className="flex flex-col items-center justify-center py-4 text-center">
          <div className="w-8 h-8 bg-brand-soft flex items-center justify-center mb-1.5 border-2 border-ink animate-pulse">
            <Sparkles className="w-4 h-4 text-brand" />
          </div>
          <p className="text-[10px] font-mono text-muted select-all">
            Pub ID: {config.adSensePublisherId || 'ca-pub-123456789'}
          </p>
          <p className="text-[9px] font-mono text-muted select-all mb-2">
            Slot ID: {config.adSenseSlotId || '9876543210'}
          </p>
          <div className="px-3 py-1 bg-brand-soft border-2 border-ink text-xs text-brand font-display font-semibold max-w-xs leading-tight">
            Dynamic AdSense Monetization Space Active
          </div>
        </div>
      </div>
    );
  }

  // If there's no custom ad active, show a friendly sponsor invite card
  if (!activeAd) {
    return (
      <div className={`bg-cream border-2 border-ink p-5 text-center relative ${className}`}>
        <p className="text-[10px] font-mono text-muted uppercase tracking-widest mb-1">Sponsored</p>
        <h4 className="text-sm font-display font-black uppercase tracking-wide text-ink mb-2">Advertise Your Brand Here</h4>
        <p className="text-[12px] text-muted max-w-sm mx-auto mb-4">
          Sponsor the Shedstar Official Website to reach millions of global music fans. High CTR & CPM rates.
        </p>
        <a
          href="#contact"
          onClick={(e) => {
            e.preventDefault();
            const contactBtn = document.getElementById('nav-contact-btn');
            if (contactBtn) contactBtn.click();
            else window.location.hash = '#contact';
          }}
          className="btn-brand text-[11px] !py-2 !px-4"
        >
          Sponsor Us
        </a>
      </div>
    );
  }

  // Render the Custom Sponsorship Banner
  const isBanner = placement === 'banner';
  const isFooter = placement === 'footer';

  if (isBanner) {
    return (
      <a
        id={`ad-link-${activeAd.id}`}
        href={activeAd.targetUrl}
        target="_blank"
        referrerPolicy="no-referrer"
        rel="noopener noreferrer"
        onClick={handleAdClick}
        className={`block bg-cream border-2 border-ink overflow-hidden group transition-all duration-300 relative ${className}`}
      >
        <div className="absolute top-2 left-2 bg-ink px-2 py-0.5 text-[8px] font-mono text-white uppercase tracking-wider z-10">
          Sponsored
        </div>
        <div className="absolute bottom-2 right-2 bg-ink/70 backdrop-blur-sm px-2 py-0.5 text-[8px] font-mono text-white opacity-0 group-hover:opacity-100 transition-opacity z-10">
          Visit {activeAd.brandName} <ExternalLink className="inline w-2.5 h-2.5 ml-0.5" />
        </div>
        <div className="h-28 md:h-36 w-full relative overflow-hidden">
          <img
            src={activeAd.imageUrl}
            alt={`Sponsored ad by ${activeAd.brandName}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/10 flex flex-col justify-end p-3">
            <h4 className="text-white font-display font-black uppercase text-sm md:text-base tracking-wide drop-shadow-md">
              {activeAd.brandName}
            </h4>
            <p className="text-white/80 text-xs max-w-lg truncate drop-shadow-sm font-sans">
              Exclusive discount partner of the Shedstar Global World Tour. Tap to explore!
            </p>
          </div>
        </div>
      </a>
    );
  }

  return (
    <div className={`bg-paper border-2 border-ink overflow-hidden group transition-all duration-300 flex flex-col ${className}`}>
      <div className="h-40 w-full relative overflow-hidden bg-cream">
        <div className="absolute top-2 left-2 bg-ink px-2 py-0.5 text-[8px] font-mono text-white uppercase tracking-wider z-10">
          Sponsored
        </div>
        <img
          src={activeAd.imageUrl}
          alt={`Sponsored ad by ${activeAd.brandName}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />
      </div>
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h4 className="text-ink font-display font-black uppercase text-sm tracking-wide mb-1 flex items-center justify-between gap-2 group-hover:text-brand transition-colors">
            <span className="truncate">{activeAd.brandName}</span>
            <span className="text-[10px] font-mono text-muted uppercase tracking-wider shrink-0">Ad</span>
          </h4>
          <p className="text-muted text-xs font-sans leading-relaxed mb-4 line-clamp-2">
            Get exclusive offers on premium electronics, apparel, and digital synths certified by Shedstar's team.
          </p>
        </div>
        <a
          href={activeAd.targetUrl}
          target="_blank"
          referrerPolicy="no-referrer"
          rel="noopener noreferrer"
          onClick={handleAdClick}
          className="btn-ink w-full text-[11px] !py-2.5"
        >
          Explore Now <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}
