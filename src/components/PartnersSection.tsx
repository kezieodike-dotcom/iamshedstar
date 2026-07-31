/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Handshake, TrendingUp, Globe2, Users, BadgeCheck, Megaphone, Star,
  CheckCircle, Send, Building2, Radio, ArrowRight, Upload
} from 'lucide-react';
import { AdUnit, Partnership } from '../types';
import AdSpace from './AdSpace';
import { TapeTitle, SafetyPin } from './Decor';

interface PartnersSectionProps {
  setActiveTab: (tab: string) => void;
}

const PARTNERSHIP_TYPES: { value: Partnership['partnershipType']; label: string }[] = [
  { value: 'banner-ads', label: 'Banner Advertising' },
  { value: 'sponsored-content', label: 'Sponsored Content' },
  { value: 'brand-spotlight', label: 'Featured Brand Spotlight' },
  { value: 'event-sponsorship', label: 'Event / Tour Sponsorship' },
  { value: 'product-placement', label: 'Product Placement' },
  { value: 'media-partnership', label: 'Media Partnership' },
];

const PACKAGES = [
  {
    name: 'Spotlight',
    price: 'From $5,000 / mo',
    icon: Megaphone,
    featured: false,
    perks: [
      'Homepage sidebar banner placement',
      'Sponsored tag on 2 blog posts',
      'Monthly performance report',
      'Logo in the partners wall',
    ],
  },
  {
    name: 'Headline',
    price: 'From $18,000 / mo',
    icon: Star,
    featured: true,
    perks: [
      'Premium homepage hero banner',
      'Featured Brand Spotlight section',
      'Sponsored music release + video',
      'Newsletter placement to Star Club VIPs',
      'Priority CPC/CPM rates',
    ],
  },
  {
    name: 'Global Tour',
    price: 'Custom',
    icon: Globe2,
    featured: false,
    perks: [
      'On-site activation at tour stops',
      'Product placement in tour content',
      'Co-branded merchandise collab',
      'Full-funnel media partnership',
    ],
  },
];

const emptyForm = {
  companyName: '',
  contactPerson: '',
  email: '',
  phone: '',
  website: '',
  industry: '',
  budget: '',
  partnershipType: 'banner-ads' as Partnership['partnershipType'],
  campaignDuration: '',
  message: '',
  proposalFileName: '',
};

export default function PartnersSection({ setActiveTab }: PartnersSectionProps) {
  const [ads, setAds] = useState<AdUnit[]>([]);
  const [partners, setPartners] = useState<Partnership[]>([]);
  const [form, setForm] = useState({ ...emptyForm });
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  useEffect(() => {
    const load = async () => {
      try {
        const [adsRes, partnersRes] = await Promise.all([
          fetch('/api/ads'),
          fetch('/api/partnerships'),
        ]);
        if (adsRes.ok) setAds(await adsRes.json());
        if (partnersRes.ok) setPartners(await partnersRes.json());
      } catch (e) {
        console.error('Failed to load partner data:', e);
      }
    };
    load();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    try {
      const res = await fetch('/api/partnerships', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, budget: Number(form.budget) || 0 }),
      });
      if (res.ok) {
        setStatus('success');
        setForm({ ...emptyForm });
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  // Sponsor "wall" — combine active ad brands + accepted partnerships.
  const sponsorBrands = Array.from(
    new Set([
      ...ads.filter((a) => a.isActive).map((a) => a.brandName),
      ...partners.filter((p) => p.status === 'accepted').map((p) => p.companyName),
    ])
  );

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="text-ink">

      {/* Hero */}
      <section className="relative bg-silver grain py-24 md:py-32 px-4 overflow-hidden border-b-4 border-ink">
        <div className="absolute inset-0 z-0">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-15"
            style={{ backgroundImage: `url('https://images.unsplash.com/photo-1556761175-b413da4baf72?q=80&w=1920&auto=format&fit=crop')` }}
          />
        </div>
        <SafetyPin className="absolute top-16 right-10 rotate-12 hidden sm:block" size={64} />
        <div className="relative z-10 max-w-4xl mx-auto text-center flex flex-col items-center gap-5 select-none">
          <span className="flex items-center gap-2 px-4 py-1.5 bg-ink text-white text-[10px] md:text-xs tracking-widest uppercase font-mono">
            <Handshake className="w-3.5 h-3.5" /> Partners & Advertise
          </span>
          <div>
            <TapeTitle>Partner With Shedstar</TapeTitle>
          </div>
          <p className="text-muted max-w-2xl text-sm md:text-lg leading-relaxed">
            Reach millions of engaged global music fans. The Shedstar Official Website is a premium media platform for brands that want to move culture — from banner campaigns to full tour sponsorships.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 mt-2">
            <a
              href="#partner-form"
              className="btn-brand text-sm"
            >
              Become a Partner <ArrowRight className="w-4 h-4" />
            </a>
            <button
              onClick={() => setActiveTab('contact')}
              className="btn-outline text-sm"
            >
              Talk to Media Team
            </button>
          </div>
        </div>
      </section>

      {/* Reach stats */}
      <section className="py-16 px-4 md:px-8 bg-paper border-b-2 border-ink">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center select-none">
          {[
            { icon: Users, label: 'Monthly Fans Reached', value: '2.4M+' },
            { icon: Globe2, label: 'Countries', value: '40+' },
            { icon: TrendingUp, label: 'Avg. Ad CTR', value: '3.8%' },
            { icon: Radio, label: 'Global Streams', value: '150M+' },
          ].map((s) => (
            <div key={s.label} className="p-6 bg-cream border-2 border-ink flex flex-col items-center gap-2">
              <s.icon className="w-6 h-6 text-brand" />
              <span className="text-2xl md:text-3xl font-display font-black text-ink">{s.value}</span>
              <span className="text-[10px] font-mono text-muted uppercase tracking-widest">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Current sponsors / brand partners */}
      <section className="relative bg-wash-blue grain py-20 px-4 md:px-8">
        <div className="max-w-7xl mx-auto relative">
          <div className="flex flex-col items-center text-center mb-10 select-none gap-3">
            <span className="text-xs text-ink font-mono uppercase tracking-widest flex items-center justify-center gap-1.5">
              <BadgeCheck className="w-4 h-4" /> Trusted By
            </span>
            <TapeTitle size="text-3xl sm:text-5xl md:text-6xl">Sponsors & Partners</TapeTitle>
          </div>

          {sponsorBrands.length > 0 ? (
            <div className="flex flex-wrap justify-center gap-3 mb-14">
              {sponsorBrands.map((brand) => (
                <div
                  key={brand}
                  className="px-5 py-3 bg-paper border-2 border-ink hover:border-brand flex items-center gap-2 transition-all"
                >
                  <Building2 className="w-4 h-4 text-brand" />
                  <span className="font-display font-semibold text-sm text-ink">{brand}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-sm text-muted mb-14">Be the first brand to partner with Shedstar.</p>
          )}

          {/* Featured brand spotlight = live sponsor banner */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <AdSpace placement="banner" />
            </div>
            <AdSpace placement="sidebar" />
          </div>
        </div>
      </section>

      {/* Partnership packages */}
      <section className="relative bg-paper grain py-20 px-4 md:px-8 border-t-2 border-ink">
        <div className="max-w-7xl mx-auto relative">
          <div className="flex flex-col items-center text-center mb-12 select-none gap-3">
            <span className="text-xs text-brand font-mono uppercase tracking-widest">Collaboration Opportunities</span>
            <TapeTitle size="text-4xl sm:text-6xl md:text-7xl">Packages</TapeTitle>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PACKAGES.map((pkg) => (
              <div
                key={pkg.name}
                className={`relative p-7 flex flex-col gap-5 transition-all duration-300 ${
                  pkg.featured
                    ? 'bg-ink text-white border-4 border-ink shadow-xl scale-[1.02]'
                    : 'bg-cream border-2 border-ink hover:border-brand'
                }`}
              >
                {pkg.featured && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-brand text-white text-[9px] font-mono font-bold uppercase tracking-widest">
                    Most Popular
                  </span>
                )}
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 border-2 ${pkg.featured ? 'bg-white/10 text-brand border-white/30' : 'bg-brand-soft text-brand border-ink'}`}>
                    <pkg.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className={`font-display font-bold uppercase text-lg ${pkg.featured ? 'text-white' : 'text-ink'}`}>{pkg.name}</h3>
                    <p className={`text-xs font-mono ${pkg.featured ? 'text-white/70' : 'text-brand'}`}>{pkg.price}</p>
                  </div>
                </div>
                <ul className="flex flex-col gap-2.5 flex-1">
                  {pkg.perks.map((perk) => (
                    <li key={perk} className={`flex items-start gap-2 text-sm ${pkg.featured ? 'text-white/80' : 'text-muted'}`}>
                      <CheckCircle className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                      {perk}
                    </li>
                  ))}
                </ul>
                <a
                  href="#partner-form"
                  className={`${pkg.featured ? 'btn-brand' : 'btn-ink'} w-full text-xs`}
                >
                  Request This Package
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Brand partnership request form */}
      <section id="partner-form" className="relative bg-silver grain py-20 px-4 md:px-8 border-t-2 border-ink">
        <SafetyPin className="absolute top-10 left-8 -rotate-12 hidden sm:block" size={56} />
        <div className="max-w-3xl mx-auto relative">
          <div className="flex flex-col items-center text-center mb-10 select-none gap-3">
            <span className="text-xs text-brand font-mono uppercase tracking-widest">Sponsorship Enquiry</span>
            <TapeTitle size="text-3xl sm:text-5xl md:text-6xl">Partner Request</TapeTitle>
            <p className="text-sm text-muted mt-1">
              Tell us about your brand and campaign goals. Our media partnerships team responds within 3–5 business days.
            </p>
          </div>

          {status === 'success' ? (
            <div className="p-10 bg-paper border-2 border-ink text-center flex flex-col items-center gap-4">
              <CheckCircle className="w-12 h-12 text-brand" />
              <h3 className="text-lg font-display font-bold text-ink">Request Received!</h3>
              <p className="text-sm text-muted max-w-md">
                Thank you for your interest in partnering with Shedstar. Our team will review your proposal and reach out to the email provided.
              </p>
              <button
                onClick={() => setStatus('idle')}
                className="text-xs text-brand underline font-mono"
              >
                Submit another request
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5 bg-paper border-2 border-ink p-6 md:p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Field label="Company Name" required value={form.companyName} onChange={(v) => set('companyName', v)} />
                <Field label="Contact Person" required value={form.contactPerson} onChange={(v) => set('contactPerson', v)} />
                <Field label="Business Email" type="email" required value={form.email} onChange={(v) => set('email', v)} />
                <Field label="Phone Number" value={form.phone} onChange={(v) => set('phone', v)} />
                <Field label="Company Website" placeholder="https://" value={form.website} onChange={(v) => set('website', v)} />
                <Field label="Industry" value={form.industry} onChange={(v) => set('industry', v)} />
                <Field label="Advertising Budget (USD)" type="number" value={form.budget} onChange={(v) => set('budget', v)} />
                <Field label="Campaign Duration" placeholder="e.g. 3 months" value={form.campaignDuration} onChange={(v) => set('campaignDuration', v)} />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-mono uppercase tracking-widest text-muted">Partnership Type</label>
                <select
                  value={form.partnershipType}
                  onChange={(e) => set('partnershipType', e.target.value)}
                  className="px-4 py-3 bg-white border-2 border-ink focus:border-brand text-sm text-ink outline-none transition-colors"
                >
                  {PARTNERSHIP_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-mono uppercase tracking-widest text-muted">Message</label>
                <textarea
                  rows={4}
                  required
                  value={form.message}
                  onChange={(e) => set('message', e.target.value)}
                  placeholder="Tell us about your brand, campaign objectives, and timeline..."
                  className="px-4 py-3 bg-white border-2 border-ink focus:border-brand text-sm text-ink placeholder-muted outline-none transition-colors resize-none"
                />
              </div>

              {/* Proposal upload (captures filename only in this simulated build) */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-mono uppercase tracking-widest text-muted">Upload Proposal (optional)</label>
                <label className="flex items-center gap-2 px-4 py-3 bg-white border-2 border-dashed border-ink hover:border-brand text-sm text-muted cursor-pointer transition-colors">
                  <Upload className="w-4 h-4 text-brand" />
                  <span className="truncate">{form.proposalFileName || 'Choose a PDF or deck...'}</span>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.ppt,.pptx"
                    className="hidden"
                    onChange={(e) => set('proposalFileName', e.target.files?.[0]?.name || '')}
                  />
                </label>
              </div>

              {status === 'error' && (
                <p className="text-xs text-red-500 font-mono">Something went wrong submitting your request. Please try again.</p>
              )}

              <button
                type="submit"
                disabled={status === 'sending'}
                className="btn-brand w-full text-sm disabled:opacity-50"
              >
                {status === 'sending' ? 'Submitting...' : (<>Submit Partnership Request <Send className="w-4 h-4" /></>)}
              </button>

              <p className="text-[10px] text-muted font-mono text-center leading-relaxed">
                Submitting a partnership request does not constitute a binding advertising agreement. Shedstar Media Group reviews all enquiries at its discretion.
              </p>
            </form>
          )}
        </div>
      </section>

      {/* Media partnership info footer strip */}
      <section className="py-14 px-4 md:px-8 bg-ink text-white border-t-4 border-ink">
        <div className="max-w-5xl mx-auto text-center select-none flex flex-col items-center gap-3">
          <Radio className="w-8 h-8 text-brand" />
          <h3 className="text-xl font-display font-bold uppercase text-white">Media Partnerships</h3>
          <p className="text-sm text-white/70 max-w-2xl leading-relaxed">
            Radio networks, streaming platforms, festivals, and press outlets — we collaborate on premieres, exclusive content, and co-promotions. For media partnership enquiries, reach the team at{' '}
            <span className="text-brand font-mono">partners@shedstar.com</span>.
          </p>
        </div>
      </section>

    </div>
  );
}

/* Small labelled input field */
function Field({
  label,
  value,
  onChange,
  type = 'text',
  required = false,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] font-mono uppercase tracking-widest text-muted">
        {label}{required && <span className="text-brand"> *</span>}
      </label>
      <input
        type={type}
        required={required}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="px-4 py-3 bg-white border-2 border-ink focus:border-brand text-sm text-ink placeholder-muted outline-none transition-colors"
      />
    </div>
  );
}
