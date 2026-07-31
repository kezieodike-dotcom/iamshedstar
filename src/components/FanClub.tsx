/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Mail, ShieldCheck, Ticket, Percent, Image, Download, Sparkles, CheckCircle } from 'lucide-react';
import { TapeTitle, SafetyPin } from './Decor';

export default function FanClub() {
  const [email, setEmail] = useState('');
  const [subStatus, setSubStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubStatus('submitting');
    try {
      const res = await fetch('/api/subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      if (res.ok) {
        setTimeout(() => {
          setSubStatus('success');
          setEmail('');
        }, 1200);
      } else {
        setSubStatus('idle');
      }
    } catch {
      setSubStatus('idle');
    }
  };

  const downloadWallpaper = () => {
    // Simulate wallpaper download
    const element = document.createElement("a");
    const file = new Blob([`SHEDSTAR OFFICIAL MOBILE WALLPAPER 2026\n[HD Vector Star Crest Graphic Placeholder]`], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = "shedstar_starborn_wallpaper.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="w-full text-ink select-none">

      {/* HERO BAND */}
      <section className="relative bg-brand grain text-white px-4 md:px-8 py-16 md:py-24 overflow-hidden">
        <SafetyPin className="absolute top-10 right-12 rotate-[30deg] opacity-90 hidden sm:block" size={64} />
        <div className="max-w-5xl mx-auto text-center flex flex-col items-center gap-4 relative">
          <span className="inline-flex items-center gap-2 bg-white text-brand font-display font-bold text-[11px] uppercase tracking-widest px-3 py-1 border-2 border-ink">
            <Sparkles className="w-4 h-4" />
            VIP Community Hub
          </span>
          <TapeTitle size="text-5xl sm:text-7xl lg:text-8xl">The Star Club</TapeTitle>
          <p className="text-sm text-white/80 max-w-md">Join Shedstar's exclusive fan community. Receive early access to tickets, exclusive promo discount codes, and custom digital items.</p>
        </div>
      </section>

      <section className="relative bg-cream grain px-4 md:px-8 py-12 md:py-16 overflow-hidden">
        <SafetyPin className="absolute top-8 left-10 -rotate-12 hidden sm:block" size={52} />
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start relative">

        {/* Left Column: Benefits checklist (Col span 7) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <h2 className="display-hd text-ink text-2xl sm:text-3xl border-b-2 border-ink pb-3">
            Star Club VIP Privileges
          </h2>

          <div className="flex flex-col gap-5">
            {/* Benefit 1 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-11 h-11 bg-brand-soft border-2 border-ink text-brand flex items-center justify-center">
                <Ticket className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-display font-bold text-ink uppercase">Early Ticket Access</h3>
                <p className="text-sm text-muted mt-1 leading-relaxed">
                  Never miss out on sold-out shows. Members receive personalized pre-sale access keys 24 hours before tickets are released to the general public.
                </p>
              </div>
            </div>

            {/* Benefit 2 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-11 h-11 bg-brand-soft border-2 border-ink text-brand flex items-center justify-center">
                <Percent className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-display font-bold text-ink uppercase">Exclusive Store Discounts</h3>
                <p className="text-sm text-muted mt-1 leading-relaxed">
                  Enjoy an ongoing 15% discount on all official merchandise. Gain access to limited edition clothing capsules and physical album collector items.
                </p>
              </div>
            </div>

            {/* Benefit 3 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-11 h-11 bg-brand-soft border-2 border-ink text-brand flex items-center justify-center">
                <Image className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-display font-bold text-ink uppercase">Exclusive Digital Content</h3>
                <p className="text-sm text-muted mt-1 leading-relaxed">
                  Download high-res wallpapers, vector icons, custom audio loop soundboards, and exclusive mobile avatars for social media profiles.
                </p>
              </div>
            </div>
          </div>

          {/* Quick downloads block */}
          <div className="mt-6 p-5 bg-paper border-2 border-ink flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-display font-bold text-ink uppercase">Mobile Wallpaper Package (HD)</h4>
              <p className="text-[11px] text-muted mt-0.5">Shedstar logo & Starborn high-contrast artwork prints.</p>
            </div>
            <button
              onClick={downloadWallpaper}
              className="btn-ink text-xs !px-4 !py-2 shrink-0"
            >
              <Download className="w-3.5 h-3.5" /> Download Pack
            </button>
          </div>

        </div>

        {/* Right Column: Subscriber signup box (Col span 5) */}
        <div className="lg:col-span-5 select-text">

          <div className="p-6 md:p-8 bg-paper border-2 border-ink flex flex-col gap-6 text-center">

            <div className="flex flex-col items-center gap-3">
              <div className="p-3.5 bg-brand-soft border-2 border-ink text-brand">
                <Mail className="w-8 h-8" />
              </div>
              <h3 className="display-hd text-ink text-xl sm:text-2xl">Enter the Starborn Gateway</h3>
              <p className="text-sm text-muted">Join over 120,000+ global subscribers staying elevated.</p>
            </div>

            {subStatus === 'success' ? (
              <div className="py-6 px-4 flex flex-col items-center gap-3 bg-cream border-2 border-ink">
                <div className="w-14 h-14 bg-green-500 text-white border-2 border-ink flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 stroke-[2.5px]" />
                </div>
                <h4 className="display-hd text-ink text-xl">Welcome to the Club!</h4>
                <p className="text-sm text-muted max-w-xs leading-relaxed">
                  Your VIP subscription is statefully registered. Use promo code <span className="text-brand font-bold font-mono text-sm px-2 py-0.5 bg-brand-soft border-2 border-ink">STARCLUB15</span> at the Merch Store checkout drawer to claim 15% off your first drop!
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5 text-left">
                  <label className="text-[10px] text-muted font-mono uppercase tracking-widest">VIP Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="vip_member@shedstar.com"
                    className="px-5 py-3 bg-white border-2 border-ink focus:border-brand text-sm text-ink placeholder-muted outline-none transition-colors"
                  />
                </div>

                <div className="flex items-start gap-2 text-left">
                  <input type="checkbox" required id="consent-box" className="mt-1 accent-brand cursor-pointer" />
                  <label htmlFor="consent-box" className="text-[11px] text-muted leading-relaxed cursor-pointer select-none">
                    I consent to receive high-frequency direct email campaigns, pre-sale tickets alerts, and customized merchandise drop details from Shedstar Music Group.
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={subStatus === 'submitting'}
                  className="btn-brand w-full text-sm active:scale-95"
                >
                  {subStatus === 'submitting' ? 'Authenticating...' : (
                    <>
                      <ShieldCheck className="w-4 h-4" /> Sign Up for VIP Access
                    </>
                  )}
                </button>
              </form>
            )}

          </div>

        </div>

        </div>
      </section>

    </div>
  );
}
