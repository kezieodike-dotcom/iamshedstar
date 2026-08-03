/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck, Eye, Music, ShoppingBag, DollarSign, Briefcase, Mail, Send,
  Trash2, Plus, Edit2, Check, X, Calendar, AlertCircle, RefreshCw, BarChart2, ShieldAlert, CheckCircle, BookOpen, Sparkles, Handshake, Settings
} from 'lucide-react';
import { Song, Video, Product, Tour, Booking, ContactMessage, Subscriber, DashboardStats, EBook, AdUnit, AdConfig, Partnership, SiteSettings } from '../types';

interface AdminSectionProps {
  isAdmin: boolean;
  onLoginAdmin: () => void;
  songs: Song[];
  videos: Video[];
  products: Product[];
  tours: Tour[];
  bookings: Booking[];
  contacts: ContactMessage[];
  subscribers: Subscriber[];
  stats: DashboardStats | null;
  onRefreshData: () => void;
}

export default function AdminSection({
  isAdmin,
  onLoginAdmin,
  songs,
  videos,
  products,
  tours,
  bookings,
  contacts,
  subscribers,
  stats,
  onRefreshData,
}: AdminSectionProps) {
  // Login State
  const [passcode, setPasscode] = useState('');
  const [loginError, setLoginError] = useState('');

  // Active rail sub-tab
  const [activeSubTab, setActiveSubTab] = useState<'analytics' | 'songs' | 'products' | 'tours' | 'bookings' | 'messages' | 'newsletter' | 'ebooks' | 'ads' | 'partners' | 'settings'>('analytics');

  // Form editing states
  const [editingSong, setEditingSong] = useState<Partial<Song> | null>(null);
  const [editingTour, setEditingTour] = useState<Partial<Tour> | null>(null);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);

  // Custom E-Books & Ads Admin States
  const [adminEBooks, setAdminEBooks] = useState<EBook[]>([]);
  const [adminAds, setAdminAds] = useState<AdUnit[]>([]);
  const [adminAdConfig, setAdminAdConfig] = useState<AdConfig | null>(null);
  const [adminPartnerships, setAdminPartnerships] = useState<Partnership[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({ heroVideoMobileUrl: '', heroVideoDesktopUrl: '' });
  const [settingsStatus, setSettingsStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [settingsError, setSettingsError] = useState('');
  const [editingEBook, setEditingEBook] = useState<Partial<EBook> | null>(null);
  const [editingAd, setEditingAd] = useState<Partial<AdUnit> | null>(null);

  // Load Admin Data on Subtab Change or Mount
  const fetchAdminEBooksAndAds = async () => {
    try {
      const [booksRes, adsRes, configRes, partnersRes, settingsRes] = await Promise.all([
        fetch('/api/ebooks'),
        fetch('/api/ads'),
        fetch('/api/ads/config'),
        fetch('/api/partnerships'),
        fetch('/api/site-settings')
      ]);
      if (booksRes.ok) setAdminEBooks(await booksRes.json());
      if (adsRes.ok) setAdminAds(await adsRes.json());
      if (configRes.ok) setAdminAdConfig(await configRes.json());
      if (partnersRes.ok) setAdminPartnerships(await partnersRes.json());
      if (settingsRes.ok) setSiteSettings(await settingsRes.json());
    } catch (e) {
      console.error('Failed to load admin digital products and campaigns:', e);
    }
  };

  // Brand Partnership request handlers
  const handleUpdatePartnershipStatus = async (id: string, status: 'accepted' | 'rejected') => {
    const res = await fetch(`/api/partnerships/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (res.ok) fetchAdminEBooksAndAds();
  };

  const handleDeletePartnership = async (id: string) => {
    if (!window.confirm('Delete this partnership request?')) return;
    const res = await fetch(`/api/partnerships/${id}`, { method: 'DELETE' });
    if (res.ok) fetchAdminEBooksAndAds();
  };

  useEffect(() => {
    if (isAdmin) {
      fetchAdminEBooksAndAds();
    }
  }, [isAdmin, activeSubTab]);

  // E-Books CRUD save handler
  const handleSaveEBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEBook) return;
    const url = editingEBook.id ? `/api/ebooks/${editingEBook.id}` : '/api/ebooks';
    const method = editingEBook.id ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editingEBook)
    });

    if (response.ok) {
      setEditingEBook(null);
      fetchAdminEBooksAndAds();
      onRefreshData();
    }
  };

  const handleDeleteEBook = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this E-Book permanently?')) return;
    const res = await fetch(`/api/ebooks/${id}`, { method: 'DELETE' });
    if (res.ok) {
      fetchAdminEBooksAndAds();
      onRefreshData();
    }
  };

  // Custom Sponsorship Ads CRUD save handler
  const handleSaveAd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAd) return;
    const url = editingAd.id ? `/api/ads/${editingAd.id}` : '/api/ads';
    const method = editingAd.id ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editingAd)
    });

    if (response.ok) {
      setEditingAd(null);
      fetchAdminEBooksAndAds();
      onRefreshData();
    }
  };

  const handleDeleteAd = async (id: string) => {
    if (!window.confirm('Delete this Sponsorship Campaign?')) return;
    const res = await fetch(`/api/ads/${id}`, { method: 'DELETE' });
    if (res.ok) {
      fetchAdminEBooksAndAds();
      onRefreshData();
    }
  };

  // Hero video / site settings save handler. The server validates the URLs and
  // returns 400 with a message, so surface that rather than a generic failure.
  const handleSaveSiteSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsStatus('saving');
    setSettingsError('');
    try {
      const response = await fetch('/api/site-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(siteSettings)
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        setSettingsError(data?.error || `Save failed (${response.status})`);
        setSettingsStatus('error');
        return;
      }
      if (data) setSiteSettings(data);
      setSettingsStatus('saved');
    } catch {
      setSettingsError('Could not reach the server.');
      setSettingsStatus('error');
    }
  };

  // Google AdSense Config save handler
  const handleSaveAdConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminAdConfig) return;
    const response = await fetch('/api/ads/config', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(adminAdConfig)
    });
    if (response.ok) {
      alert('Google AdSense monetizations updated successfully!');
      fetchAdminEBooksAndAds();
    }
  };

  // Newsletter Campaign States
  const [campaignSubject, setCampaignSubject] = useState('');
  const [campaignContent, setCampaignContent] = useState('');
  const [campaignStatus, setCampaignStatus] = useState<'idle' | 'sending' | 'success'>('idle');

  // Login handler
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === 'shedstar2026') {
      onLoginAdmin();
      setLoginError('');
      setPasscode('');
    } else {
      setLoginError('Invalid Administrator Passcode. Access Denied.');
    }
  };

  // 1. MUSIC CRUD Handlers
  const handleSaveSong = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSong) return;
    const url = editingSong.id ? `/api/songs/${editingSong.id}` : '/api/songs';
    const method = editingSong.id ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editingSong)
    });

    if (response.ok) {
      setEditingSong(null);
      onRefreshData();
    }
  };

  const handleDeleteSong = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this song?')) return;
    const res = await fetch(`/api/songs/${id}`, { method: 'DELETE' });
    if (res.ok) onRefreshData();
  };

  // 2. PRODUCT CRUD Handlers
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    const url = editingProduct.id ? `/api/products/${editingProduct.id}` : '/api/products';
    const method = editingProduct.id ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editingProduct)
    });

    if (response.ok) {
      setEditingProduct(null);
      onRefreshData();
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm('Delete this product?')) return;
    const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
    if (res.ok) onRefreshData();
  };

  // 3. TOUR CRUD Handlers
  const handleSaveTour = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTour) return;
    const url = editingTour.id ? `/api/tours/${editingTour.id}` : '/api/tours';
    const method = editingTour.id ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editingTour)
    });

    if (response.ok) {
      setEditingTour(null);
      onRefreshData();
    }
  };

  const handleDeleteTour = async (id: string) => {
    if (!window.confirm('Delete this tour date?')) return;
    const res = await fetch(`/api/tours/${id}`, { method: 'DELETE' });
    if (res.ok) onRefreshData();
  };

  // 4. BOOKING Handlers (Accept / Reject)
  const handleUpdateBookingStatus = async (id: string, status: 'accepted' | 'rejected') => {
    const response = await fetch(`/api/bookings/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (response.ok) onRefreshData();
  };

  const handleDeleteBooking = async (id: string) => {
    if (!window.confirm('Delete this booking log?')) return;
    const res = await fetch(`/api/bookings/${id}`, { method: 'DELETE' });
    if (res.ok) onRefreshData();
  };

  // 5. CONTACT MESSAGE Handlers (Mark as read / delete)
  const handleMarkMessageRead = async (id: string) => {
    const res = await fetch(`/api/contacts/${id}/read`, { method: 'PUT' });
    if (res.ok) onRefreshData();
  };

  const handleDeleteMessage = async (id: string) => {
    if (!window.confirm('Delete this message?')) return;
    const res = await fetch(`/api/contacts/${id}`, { method: 'DELETE' });
    if (res.ok) onRefreshData();
  };

  // 6. Send Campaign Simulator
  const handleSendCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaignSubject || !campaignContent) return;
    setCampaignStatus('sending');

    const res = await fetch('/api/admin/send-campaign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject: campaignSubject, content: campaignContent })
    });

    if (res.ok) {
      setTimeout(() => {
        setCampaignStatus('success');
        setCampaignSubject('');
        setCampaignContent('');
      }, 1500);
    }
  };

  // --- RENDERING SEGMENTS ---

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto py-32 px-4 text-ink select-none">
        <div className="p-8 bg-paper border border-line rounded-2xl shadow-sm text-center flex flex-col gap-6">
          <div className="flex flex-col items-center gap-2">
            <div className="p-3.5 bg-brand-soft border border-brand/20 rounded-full text-brand">
              <ShieldCheck className="w-8 h-8 animate-pulse" />
            </div>
            <h2 className="text-xl font-display font-black uppercase text-ink mt-3">S-STAR ADMIN GATEWAY</h2>
            <p className="text-xs text-muted font-mono">Secure administrative control hub</p>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-4 text-left">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-muted font-mono uppercase">Enter Administrator Passcode</label>
              <input
                type="password"
                required
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                className="px-4 py-3 bg-white border border-line hover:border-brand/40 focus:border-brand rounded-lg text-sm text-ink placeholder-muted outline-none transition-colors tracking-widest text-center"
              />
            </div>

            {loginError && (
              <p className="text-[11px] text-red-500 font-mono flex items-center justify-center gap-1.5">
                <ShieldAlert className="w-4 h-4" /> {loginError}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-brand hover:bg-brand-dark text-white font-display font-bold text-xs uppercase tracking-widest rounded-full transition-all flex items-center justify-center gap-1.5 select-none"
            >
              Authenticate & Unlock
            </button>
          </form>

          <p className="text-[10px] text-muted leading-relaxed font-mono">
            Demo credentials tip: Use passcode <span className="text-brand font-bold">shedstar2026</span> to authenticate.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-ink select-none">

      {/* Admin Title Banner */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-10 pb-6 border-b border-line">
        <div>
          <span className="text-xs text-brand font-mono uppercase tracking-widest flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-brand animate-pulse" />
            SECURE MANAGEMENT PORTAL
          </span>
          <h1 className="text-3xl md:text-4xl font-display font-black uppercase mt-1 text-ink">ADMINISTRATIVE DASHBOARD</h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onRefreshData}
            className="p-2 bg-cream hover:bg-cream-dark border border-line rounded-full text-muted hover:text-brand transition-colors flex items-center gap-1.5 text-xs font-mono"
            title="Refresh Server Data"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* Left Side: Navigation Rails (Col span 3) */}
        <div className="lg:col-span-3 flex flex-col gap-2 bg-cream border border-line p-4 rounded-2xl">
          <span className="text-[10px] font-mono text-muted uppercase tracking-widest px-3 mb-2">MANAGEMENT RAILS</span>

          <button
            onClick={() => setActiveSubTab('analytics')}
            className={`w-full py-2.5 px-4 text-left font-display text-sm rounded-lg transition-all flex items-center gap-2 ${
              activeSubTab === 'analytics' ? 'bg-brand-soft text-brand border-l-2 border-brand font-bold' : 'text-muted hover:bg-cream-dark hover:text-ink'
            }`}
          >
            <BarChart2 className="w-4.5 h-4.5" /> Site Analytics
          </button>

          <button
            onClick={() => setActiveSubTab('songs')}
            className={`w-full py-2.5 px-4 text-left font-display text-sm rounded-lg transition-all flex items-center gap-2 ${
              activeSubTab === 'songs' ? 'bg-brand-soft text-brand border-l-2 border-brand font-bold' : 'text-muted hover:bg-cream-dark hover:text-ink'
            }`}
          >
            <Music className="w-4.5 h-4.5" /> Manage Songs
          </button>

          <button
            onClick={() => setActiveSubTab('products')}
            className={`w-full py-2.5 px-4 text-left font-display text-sm rounded-lg transition-all flex items-center gap-2 ${
              activeSubTab === 'products' ? 'bg-brand-soft text-brand border-l-2 border-brand font-bold' : 'text-muted hover:bg-cream-dark hover:text-ink'
            }`}
          >
            <ShoppingBag className="w-4.5 h-4.5" /> Manage Store
          </button>

          <button
            onClick={() => setActiveSubTab('tours')}
            className={`w-full py-2.5 px-4 text-left font-display text-sm rounded-lg transition-all flex items-center gap-2 ${
              activeSubTab === 'tours' ? 'bg-brand-soft text-brand border-l-2 border-brand font-bold' : 'text-muted hover:bg-cream-dark hover:text-ink'
            }`}
          >
            <Calendar className="w-4.5 h-4.5" /> Manage Tours
          </button>

          <button
            onClick={() => setActiveSubTab('bookings')}
            className={`w-full py-2.5 px-4 text-left font-display text-sm rounded-lg transition-all flex items-center justify-between ${
              activeSubTab === 'bookings' ? 'bg-brand-soft text-brand border-l-2 border-brand font-bold' : 'text-muted hover:bg-cream-dark hover:text-ink'
            }`}
          >
            <span className="flex items-center gap-2"><Briefcase className="w-4.5 h-4.5" /> Bookings</span>
            {bookings.filter(b => b.status === 'pending').length > 0 && (
              <span className="px-1.5 py-0.5 bg-brand text-white font-sans font-bold text-[9px] rounded-full">
                {bookings.filter(b => b.status === 'pending').length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveSubTab('messages')}
            className={`w-full py-2.5 px-4 text-left font-display text-sm rounded-lg transition-all flex items-center justify-between ${
              activeSubTab === 'messages' ? 'bg-brand-soft text-brand border-l-2 border-brand font-bold' : 'text-muted hover:bg-cream-dark hover:text-ink'
            }`}
          >
            <span className="flex items-center gap-2"><Mail className="w-4.5 h-4.5" /> Direct Messages</span>
            {contacts.filter(c => !c.isRead).length > 0 && (
              <span className="px-1.5 py-0.5 bg-brand text-white font-sans font-bold text-[9px] rounded-full">
                {contacts.filter(c => !c.isRead).length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveSubTab('newsletter')}
            className={`w-full py-2.5 px-4 text-left font-display text-sm rounded-lg transition-all flex items-center gap-2 ${
              activeSubTab === 'newsletter' ? 'bg-brand-soft text-brand border-l-2 border-brand font-bold' : 'text-muted hover:bg-cream-dark hover:text-ink'
            }`}
          >
            <Send className="w-4.5 h-4.5" /> Star Club VIPs
          </button>

          <button
            onClick={() => setActiveSubTab('ebooks')}
            className={`w-full py-2.5 px-4 text-left font-display text-sm rounded-lg transition-all flex items-center gap-2 ${
              activeSubTab === 'ebooks' ? 'bg-brand-soft text-brand border-l-2 border-brand font-bold' : 'text-muted hover:bg-cream-dark hover:text-ink'
            }`}
          >
            <BookOpen className="w-4.5 h-4.5" /> Manage E-Books
          </button>

          <button
            onClick={() => setActiveSubTab('ads')}
            className={`w-full py-2.5 px-4 text-left font-display text-sm rounded-lg transition-all flex items-center gap-2 ${
              activeSubTab === 'ads' ? 'bg-brand-soft text-brand border-l-2 border-brand font-bold' : 'text-muted hover:bg-cream-dark hover:text-ink'
            }`}
          >
            <DollarSign className="w-4.5 h-4.5" /> Monetization & Ads
          </button>

          <button
            onClick={() => setActiveSubTab('partners')}
            className={`w-full py-2.5 px-4 text-left font-display text-sm rounded-lg transition-all flex items-center justify-between ${
              activeSubTab === 'partners' ? 'bg-brand-soft text-brand border-l-2 border-brand font-bold' : 'text-muted hover:bg-cream-dark hover:text-ink'
            }`}
          >
            <span className="flex items-center gap-2"><Handshake className="w-4.5 h-4.5" /> Partner Requests</span>
            {adminPartnerships.filter(p => p.status === 'pending').length > 0 && (
              <span className="px-1.5 py-0.5 bg-brand text-white font-sans font-bold text-[9px] rounded-full">
                {adminPartnerships.filter(p => p.status === 'pending').length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveSubTab('settings')}
            className={`w-full py-2.5 px-4 text-left font-display text-sm rounded-lg transition-all flex items-center gap-2 ${
              activeSubTab === 'settings' ? 'bg-brand-soft text-brand border-l-2 border-brand font-bold' : 'text-muted hover:bg-cream-dark hover:text-ink'
            }`}
          >
            <Settings className="w-4.5 h-4.5" /> Site Settings
          </button>

        </div>

        {/* Right Side: Main Portal content pane (Col span 9) */}
        <div className="lg:col-span-9 bg-paper border border-line p-6 md:p-8 rounded-2xl shadow-sm relative min-h-[500px]">

          {/* A. ANALYTICS SUB-TAB */}
          {activeSubTab === 'analytics' && stats && (
            <div className="flex flex-col gap-8">
              <h2 className="text-xl font-display font-black uppercase tracking-wide text-ink border-b border-line pb-2">Real-Time Site Analytics</h2>

              {/* Stats Cards Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

                {/* Metric 1 */}
                <div className="p-4 bg-cream border border-line rounded-xl flex flex-col justify-between">
                  <span className="text-[9px] font-mono text-muted uppercase tracking-widest">Total Site Views</span>
                  <span className="text-xl md:text-2xl font-mono font-bold text-ink mt-1">{(stats.pageViews || 0).toLocaleString()}</span>
                </div>

                {/* Metric 2 */}
                <div className="p-4 bg-cream border border-line rounded-xl flex flex-col justify-between">
                  <span className="text-[9px] font-mono text-muted uppercase tracking-widest">Global Streams</span>
                  <span className="text-xl md:text-2xl font-mono font-bold text-brand mt-1">{(stats.musicPlays || 0).toLocaleString()}</span>
                </div>

                {/* Metric 3 */}
                <div className="p-4 bg-cream border border-line rounded-xl flex flex-col justify-between">
                  <span className="text-[9px] font-mono text-muted uppercase tracking-widest">E-Store Sales</span>
                  <span className="text-xl md:text-2xl font-mono font-bold text-brand mt-1">{stats.merchandiseSales}</span>
                </div>

                {/* Metric 4 */}
                <div className="p-4 bg-cream border border-line rounded-xl flex flex-col justify-between">
                  <span className="text-[9px] font-mono text-muted uppercase tracking-widest">Revenue Collected</span>
                  <span className="text-xl md:text-2xl font-mono font-bold text-green-600 mt-1">${(stats.revenue || 0).toLocaleString()}</span>
                </div>

              </div>

              {/* Digital Monetization Metrics Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-brand-soft p-4 rounded-xl border border-brand/10">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-white rounded-lg border border-brand/20 text-brand font-bold">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[9px] font-mono text-muted uppercase tracking-widest">Premium E-Books Sold</p>
                    <p className="text-lg font-mono font-bold text-ink">{(stats.ebookSales || 0).toLocaleString()} copies</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-white rounded-lg border border-brand/20 text-brand font-bold">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[9px] font-mono text-muted uppercase tracking-widest">Advertising & CPC/CPM Earnings</p>
                    <p className="text-lg font-mono font-bold text-green-600">${(stats.adRevenue || 0).toFixed(2)} USD</p>
                  </div>
                </div>
              </div>

              {/* Custom SVG Bar Charts (Month MoM Revenue) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">

                {/* SVG Revenue Chart */}
                <div className="p-5 bg-cream border border-line rounded-xl">
                  <h3 className="text-xs font-mono uppercase text-muted tracking-widest mb-4">Revenue Month Over Month ($ USD)</h3>

                  <div className="aspect-[4/3] w-full flex items-end justify-between gap-2 h-44 pb-4 relative border-b border-line">
                    {stats.monthlyRevenue.map((m) => {
                      // Calc percentage height relative to highest month value
                      const maxHeight = Math.max(...stats.monthlyRevenue.map(item => item.amount)) || 5000;
                      const pct = (m.amount / maxHeight) * 100;
                      return (
                        <div key={m.month} className="flex-1 flex flex-col items-center gap-2 group/bar relative">
                          {/* Hover Tooltip tooltip */}
                          <div className="absolute bottom-full mb-1 bg-ink text-white font-mono font-bold text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity">
                            ${m.amount}
                          </div>

                          <div
                            className="w-full bg-gradient-to-t from-brand-dark to-brand rounded-t-sm transition-all duration-1000"
                            style={{ height: `${pct || 1}%` }}
                          />
                          <span className="text-[9px] font-mono text-muted uppercase">{m.month}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* SVG Playcounts per Song */}
                <div className="p-5 bg-cream border border-line rounded-xl">
                  <h3 className="text-xs font-mono uppercase text-muted tracking-widest mb-4">Song Streams (Thousands)</h3>

                  <div className="flex flex-col gap-3">
                    {stats.playsBySong.map((song) => {
                      const maxVal = Math.max(...stats.playsBySong.map(s => s.value)) || 10000;
                      const widthPct = (song.value / maxVal) * 100;
                      return (
                        <div key={song.name} className="flex flex-col gap-1">
                          <div className="flex justify-between items-center text-[10px] font-mono">
                            <span className="text-ink font-semibold truncate max-w-[150px]">{song.name}</span>
                            <span className="text-brand font-bold">{song.value.toLocaleString()}K</span>
                          </div>
                          <div className="w-full h-2 bg-cream-dark rounded-full overflow-hidden border border-line">
                            <div
                              className="h-full bg-gradient-to-r from-brand to-brand-dark rounded-full"
                              style={{ width: `${widthPct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* B. SONGS SUB-TAB */}
          {activeSubTab === 'songs' && (
            <div className="flex flex-col gap-6">

              <div className="flex justify-between items-center border-b border-line pb-2">
                <h2 className="text-xl font-display font-black uppercase tracking-wide text-ink">Manage Songs & Albums</h2>
                <button
                  onClick={() => setEditingSong({ title: '', album: '', duration: '', category: 'single', lyrics: '', coverUrl: '', playCount: 0 })}
                  className="px-3 py-1.5 bg-brand hover:bg-brand-dark text-white font-display font-bold text-xs uppercase tracking-widest rounded-full flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-4 h-4" /> Add New Song
                </button>
              </div>

              {/* Editing Form Overlay Drawer */}
              {editingSong ? (
                <form onSubmit={handleSaveSong} className="p-5 bg-cream border border-brand/30 rounded-xl flex flex-col gap-4">
                  <h3 className="text-sm font-mono uppercase text-brand">{editingSong.id ? 'Edit Track Details' : 'Create New Track Record'}</h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-mono uppercase text-muted">Track Title</label>
                      <input
                        type="text"
                        required
                        value={editingSong.title || ''}
                        onChange={(e) => setEditingSong({ ...editingSong, title: e.target.value })}
                        className="px-3 py-1.5 bg-white border border-line rounded-lg text-xs text-ink focus:border-brand outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-mono uppercase text-muted">Album Name</label>
                      <input
                        type="text"
                        required
                        value={editingSong.album || ''}
                        onChange={(e) => setEditingSong({ ...editingSong, album: e.target.value })}
                        className="px-3 py-1.5 bg-white border border-line rounded-lg text-xs text-ink focus:border-brand outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-mono uppercase text-muted">Cover Image URL</label>
                      <input
                        type="text"
                        required
                        value={editingSong.coverUrl || ''}
                        onChange={(e) => setEditingSong({ ...editingSong, coverUrl: e.target.value })}
                        className="px-3 py-1.5 bg-white border border-line rounded-lg text-xs text-ink focus:border-brand outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-mono uppercase text-muted">Category</label>
                      <select
                        value={editingSong.category || 'single'}
                        onChange={(e: any) => setEditingSong({ ...editingSong, category: e.target.value })}
                        className="px-3 py-1.5 bg-white border border-line rounded-lg text-xs text-ink focus:border-brand outline-none"
                      >
                        <option value="album">Album Track</option>
                        <option value="single">Single</option>
                        <option value="ep">EP Track</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-mono uppercase text-muted">Lyrics Text</label>
                    <textarea
                      rows={4}
                      value={editingSong.lyrics || ''}
                      onChange={(e) => setEditingSong({ ...editingSong, lyrics: e.target.value })}
                      className="px-3 py-1.5 bg-white border border-line rounded-lg text-xs text-ink focus:border-brand outline-none resize-none"
                    />
                  </div>

                  <div className="flex gap-2 justify-end">
                    <button type="button" onClick={() => setEditingSong(null)} className="px-3 py-1.5 bg-cream-dark border border-line text-ink text-xs font-mono rounded-full">Cancel</button>
                    <button type="submit" className="px-4 py-1.5 bg-brand hover:bg-brand-dark text-white font-display font-bold text-xs uppercase rounded-full transition-colors">Save Record</button>
                  </div>
                </form>
              ) : (
                /* Songs Listing grid */
                <div className="flex flex-col gap-2">
                  {songs.map((song) => (
                    <div key={song.id} className="p-3 rounded-xl bg-cream border border-line hover:bg-cream-dark flex items-center justify-between text-xs transition-colors">
                      <div className="flex items-center gap-3">
                        <img src={song.coverUrl} alt={song.title} className="w-10 h-10 object-cover rounded-lg" />
                        <div>
                          <h4 className="font-semibold text-ink">{song.title}</h4>
                          <p className="text-muted text-[10px]">{song.album} â€¢ {song.category.toUpperCase()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-brand px-2 py-0.5 bg-brand-soft rounded-full">{(song.playCount || 0).toLocaleString()} plays</span>
                        <button onClick={() => setEditingSong(song)} className="p-1.5 bg-white border border-line hover:bg-brand hover:text-white hover:border-brand rounded-lg text-muted transition-colors" title="Edit Track"><Edit2 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleDeleteSong(song.id)} className="p-1.5 bg-white border border-line hover:bg-red-500 hover:text-white hover:border-red-500 rounded-lg text-muted transition-colors" title="Delete Track"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>
          )}

          {/* C. STORE PRODUCTS TAB */}
          {activeSubTab === 'products' && (
            <div className="flex flex-col gap-6">

              <div className="flex justify-between items-center border-b border-line pb-2">
                <h2 className="text-xl font-display font-black uppercase tracking-wide text-ink">Manage E-Store Products</h2>
                <button
                  onClick={() => setEditingProduct({ title: '', price: 25, sizes: ['M', 'L'], colors: ['Black'], category: 'T-Shirts', stock: 50, images: ['https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=600&auto=format&fit=crop'], description: '' })}
                  className="px-3 py-1.5 bg-brand hover:bg-brand-dark text-white font-display font-bold text-xs uppercase tracking-widest rounded-full flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-4 h-4" /> Add Product
                </button>
              </div>

              {editingProduct ? (
                <form onSubmit={handleSaveProduct} className="p-5 bg-cream border border-brand/30 rounded-xl flex flex-col gap-4">
                  <h3 className="text-sm font-mono uppercase text-brand">Edit Product Catalog Details</h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-mono uppercase text-muted">Product Title</label>
                      <input
                        type="text"
                        required
                        value={editingProduct.title || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct, title: e.target.value })}
                        className="px-3 py-1.5 bg-white border border-line rounded-lg text-xs text-ink focus:border-brand outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-mono uppercase text-muted">Price ($ USD)</label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={editingProduct.price || 0}
                        onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) })}
                        className="px-3 py-1.5 bg-white border border-line rounded-lg text-xs text-ink focus:border-brand outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-mono uppercase text-muted">Category</label>
                      <input
                        type="text"
                        required
                        value={editingProduct.category || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                        className="px-3 py-1.5 bg-white border border-line rounded-lg text-xs text-ink focus:border-brand outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-mono uppercase text-muted">Stock Availability</label>
                      <input
                        type="number"
                        required
                        value={editingProduct.stock || 0}
                        onChange={(e) => setEditingProduct({ ...editingProduct, stock: parseInt(e.target.value) })}
                        className="px-3 py-1.5 bg-white border border-line rounded-lg text-xs text-ink focus:border-brand outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-mono uppercase text-muted">Product Image URL</label>
                    <input
                      type="text"
                      required
                      value={editingProduct.images?.[0] || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, images: [e.target.value] })}
                      className="px-3 py-1.5 bg-white border border-line rounded-lg text-xs text-ink focus:border-brand outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-mono uppercase text-muted">Catalog Description</label>
                    <textarea
                      rows={3}
                      value={editingProduct.description || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                      className="px-3 py-1.5 bg-white border border-line rounded-lg text-xs text-ink focus:border-brand outline-none resize-none"
                    />
                  </div>

                  <div className="flex gap-2 justify-end">
                    <button type="button" onClick={() => setEditingProduct(null)} className="px-3 py-1.5 bg-cream-dark border border-line text-ink text-xs font-mono rounded-full">Cancel</button>
                    <button type="submit" className="px-4 py-1.5 bg-brand hover:bg-brand-dark text-white font-display font-bold text-xs uppercase rounded-full transition-colors">Save Product</button>
                  </div>
                </form>
              ) : (
                <div className="flex flex-col gap-2">
                  {products.map((prod) => (
                    <div key={prod.id} className="p-3 rounded-xl bg-cream border border-line hover:bg-cream-dark flex items-center justify-between text-xs transition-colors">
                      <div className="flex items-center gap-3">
                        <img src={prod.images[0]} alt={prod.title} className="w-10 h-10 object-cover rounded-lg" />
                        <div>
                          <h4 className="font-semibold text-ink">{prod.title}</h4>
                          <p className="text-brand text-[10px]">${prod.price.toFixed(2)} USD â€¢ Stock: {prod.stock}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => setEditingProduct(prod)} className="p-1.5 bg-white border border-line hover:bg-brand hover:text-white hover:border-brand rounded-lg text-muted transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleDeleteProduct(prod.id)} className="p-1.5 bg-white border border-line hover:bg-red-500 hover:text-white hover:border-red-500 rounded-lg text-muted transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>
          )}

          {/* D. TOURS MANAGEMENT */}
          {activeSubTab === 'tours' && (
            <div className="flex flex-col gap-6">

              <div className="flex justify-between items-center border-b border-line pb-2">
                <h2 className="text-xl font-display font-black uppercase tracking-wide text-ink">Manage Tour Schedule</h2>
                <button
                  onClick={() => setEditingTour({ country: '', city: '', venue: '', date: '', time: '20:00', isSoldOut: false, latitude: 0, longitude: 0 })}
                  className="px-3 py-1.5 bg-brand hover:bg-brand-dark text-white font-display font-bold text-xs uppercase tracking-widest rounded-full flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-4 h-4" /> Add Date
                </button>
              </div>

              {editingTour ? (
                <form onSubmit={handleSaveTour} className="p-5 bg-cream border border-brand/30 rounded-xl flex flex-col gap-4">
                  <h3 className="text-sm font-mono uppercase text-brand">Edit Tour Date details</h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-mono uppercase text-muted">City</label>
                      <input
                        type="text"
                        required
                        value={editingTour.city || ''}
                        onChange={(e) => setEditingTour({ ...editingTour, city: e.target.value })}
                        className="px-3 py-1.5 bg-white border border-line rounded-lg text-xs text-ink focus:border-brand outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-mono uppercase text-muted">Country</label>
                      <input
                        type="text"
                        required
                        value={editingTour.country || ''}
                        onChange={(e) => setEditingTour({ ...editingTour, country: e.target.value })}
                        className="px-3 py-1.5 bg-white border border-line rounded-lg text-xs text-ink focus:border-brand outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-mono uppercase text-muted">Venue</label>
                      <input
                        type="text"
                        required
                        value={editingTour.venue || ''}
                        onChange={(e) => setEditingTour({ ...editingTour, venue: e.target.value })}
                        className="px-3 py-1.5 bg-white border border-line rounded-lg text-xs text-ink focus:border-brand outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-mono uppercase text-muted">Show Time</label>
                      <input
                        type="text"
                        required
                        value={editingTour.time || '20:00'}
                        onChange={(e) => setEditingTour({ ...editingTour, time: e.target.value })}
                        className="px-3 py-1.5 bg-white border border-line rounded-lg text-xs text-ink focus:border-brand outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-mono uppercase text-muted">Show Date</label>
                      <input
                        type="date"
                        required
                        value={editingTour.date || ''}
                        onChange={(e) => setEditingTour({ ...editingTour, date: e.target.value })}
                        className="px-3 py-1.5 bg-white border border-line rounded-lg text-xs text-ink focus:border-brand outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-mono uppercase text-muted">Sold Out Status</label>
                      <select
                        value={editingTour.isSoldOut ? 'true' : 'false'}
                        onChange={(e) => setEditingTour({ ...editingTour, isSoldOut: e.target.value === 'true' })}
                        className="px-3 py-1.5 bg-white border border-line rounded-lg text-xs text-ink focus:border-brand outline-none"
                      >
                        <option value="false">Tickets Available</option>
                        <option value="true">Sold Out Badge</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end">
                    <button type="button" onClick={() => setEditingTour(null)} className="px-3 py-1.5 bg-cream-dark border border-line text-ink text-xs font-mono rounded-full">Cancel</button>
                    <button type="submit" className="px-4 py-1.5 bg-brand hover:bg-brand-dark text-white font-display font-bold text-xs uppercase rounded-full transition-colors">Save Tour Date</button>
                  </div>
                </form>
              ) : (
                <div className="flex flex-col gap-2">
                  {tours.map((tour) => (
                    <div key={tour.id} className="p-3 rounded-xl bg-cream border border-line hover:bg-cream-dark flex items-center justify-between text-xs transition-colors">
                      <div>
                        <span className="font-mono text-brand text-[10px]">{tour.date}</span>
                        <h4 className="font-semibold text-ink mt-0.5">{tour.city}, {tour.country}</h4>
                        <p className="text-muted text-[10px]">{tour.venue}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] uppercase font-bold font-mono ${tour.isSoldOut ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                          {tour.isSoldOut ? 'Sold Out' : 'Available'}
                        </span>
                        <button onClick={() => setEditingTour(tour)} className="p-1.5 bg-white border border-line hover:bg-brand hover:text-white hover:border-brand rounded-lg text-muted transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleDeleteTour(tour.id)} className="p-1.5 bg-white border border-line hover:bg-red-500 hover:text-white hover:border-red-500 rounded-lg text-muted transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>
          )}

          {/* E. BOOKING REQUESTS MANAGER */}
          {activeSubTab === 'bookings' && (
            <div className="flex flex-col gap-6">
              <h2 className="text-xl font-display font-black uppercase tracking-wide text-ink border-b border-line pb-2">Concert Booking Proposals</h2>

              <div className="flex flex-col gap-4">
                {bookings.length === 0 ? (
                  <p className="text-xs text-muted text-center py-8">No booking inquiries logged.</p>
                ) : (
                  bookings.map((book) => (
                    <div key={book.id} className="p-5 bg-cream border border-line rounded-xl flex flex-col gap-3 text-xs select-text">
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-line">
                        <div>
                          <h4 className="text-sm font-display font-bold text-ink uppercase">{book.eventName}</h4>
                          <p className="text-muted text-[10px]">{book.company} â€¢ Contact: {book.name}</p>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] uppercase font-mono font-bold ${
                          book.status === 'accepted' ? 'bg-green-100 text-green-700' : book.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {book.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-2 border-b border-line font-mono text-[10px] text-muted">
                        <div>
                          <p className="text-[8px] text-muted uppercase">Target Date</p>
                          <p className="text-ink font-bold">{book.eventDate}</p>
                        </div>
                        <div>
                          <p className="text-[8px] text-muted uppercase">Target Location</p>
                          <p className="text-ink font-bold">{book.city}, {book.country}</p>
                        </div>
                        <div>
                          <p className="text-[8px] text-muted uppercase">Proposed Budget</p>
                          <p className="text-green-600 font-bold">${(book.budget || 0).toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-[8px] text-muted uppercase">Attachment</p>
                          <p className="text-brand truncate">{book.proposalFileName || 'None'}</p>
                        </div>
                      </div>

                      <div>
                        <p className="text-[8px] font-mono text-muted uppercase">Cover Message</p>
                        <p className="text-ink mt-1 leading-relaxed italic">{book.message}</p>
                      </div>

                      <div className="flex flex-wrap gap-4 items-center justify-between mt-3 pt-3 border-t border-line">
                        <div className="text-[10px] text-muted font-mono">
                          Email: {book.email} | Phone: {book.phone}
                        </div>

                        {book.status === 'pending' && (
                          <div className="flex gap-2 select-none">
                            <button
                              onClick={() => handleUpdateBookingStatus(book.id, 'accepted')}
                              className="px-2.5 py-1 bg-green-500 text-white font-sans font-bold rounded-full flex items-center gap-1 hover:bg-green-600"
                            >
                              <Check className="w-3.5 h-3.5 stroke-[3px]" /> Accept
                            </button>
                            <button
                              onClick={() => handleUpdateBookingStatus(book.id, 'rejected')}
                              className="px-2.5 py-1 bg-white border border-red-300 text-red-600 font-sans font-bold rounded-full flex items-center gap-1 hover:bg-red-500 hover:text-white hover:border-red-500 transition-colors"
                            >
                              <X className="w-3.5 h-3.5" /> Decline
                            </button>
                          </div>
                        )}

                        {book.status !== 'pending' && (
                          <button onClick={() => handleDeleteBooking(book.id)} className="p-1 text-muted hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

            </div>
          )}

          {/* F. DIRECT MESSAGES MANAGER */}
          {activeSubTab === 'messages' && (
            <div className="flex flex-col gap-6">
              <h2 className="text-xl font-display font-black uppercase tracking-wide text-ink border-b border-line pb-2">Direct Contact Logs</h2>

              <div className="flex flex-col gap-3">
                {contacts.length === 0 ? (
                  <p className="text-xs text-muted text-center py-8">No contact log messages found.</p>
                ) : (
                  contacts.map((msg) => (
                    <div key={msg.id} className="p-4 bg-cream border border-line rounded-xl flex flex-col gap-2 text-xs select-text">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-brand font-mono uppercase">{msg.subject}</span>
                          <h4 className="text-ink font-bold mt-0.5">{msg.name} ({msg.email})</h4>
                        </div>
                        <div className="flex items-center gap-2 select-none">
                          {!msg.isRead && (
                            <button
                              onClick={() => handleMarkMessageRead(msg.id)}
                              className="px-2 py-0.5 bg-brand text-white font-mono text-[9px] rounded-full font-bold uppercase tracking-wider"
                            >
                              New
                            </button>
                          )}
                          <button onClick={() => handleDeleteMessage(msg.id)} className="p-1 hover:bg-cream-dark rounded text-muted hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                      <p className="text-ink mt-1 leading-relaxed italic">{msg.message}</p>
                      <span className="text-[9px] text-muted font-mono text-right">{new Date(msg.createdAt).toLocaleString()}</span>
                    </div>
                  ))
                )}
              </div>

            </div>
          )}

          {/* G. NEWSLETTER SUBSCRIBERS */}
          {activeSubTab === 'newsletter' && (
            <div className="flex flex-col gap-6">
              <h2 className="text-xl font-display font-black uppercase tracking-wide text-ink border-b border-line pb-2">Star Club VIP Subscribers</h2>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">

                {/* Left pane: Send campaign forms (Col span 7) */}
                <div className="md:col-span-7 p-5 bg-cream border border-line rounded-xl">
                  <h3 className="text-xs font-mono uppercase text-brand tracking-widest mb-4 flex items-center gap-1">
                    <Send className="w-4 h-4 animate-bounce" /> Broadcast VIP Email Campaign
                  </h3>

                  {campaignStatus === 'success' ? (
                    <div className="py-8 text-center flex flex-col items-center gap-3">
                      <CheckCircle className="w-10 h-10 text-green-600" />
                      <h4 className="text-sm font-display font-bold text-ink">Campaign Transmitted!</h4>
                      <p className="text-xs text-muted">Broadcast simulated successfully to {subscribers.length} active Star Club emails.</p>
                      <button onClick={() => setCampaignStatus('idle')} className="text-xs text-brand underline font-mono">Send Another</button>
                    </div>
                  ) : (
                    <form onSubmit={handleSendCampaign} className="flex flex-col gap-4">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] text-muted font-mono">Email Subject Line</label>
                        <input
                          type="text"
                          required
                          value={campaignSubject}
                          onChange={(e) => setCampaignSubject(e.target.value)}
                          placeholder="Exclusive pre-sale access: London tickets!"
                          className="px-3 py-2 bg-white border border-line rounded-lg text-xs text-ink focus:border-brand outline-none"
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] text-muted font-mono">Newsletter Content Text</label>
                        <textarea
                          required
                          rows={6}
                          value={campaignContent}
                          onChange={(e) => setCampaignContent(e.target.value)}
                          placeholder="Write exclusive newsletter announcements here..."
                          className="px-3 py-2 bg-white border border-line rounded-lg text-xs text-ink focus:border-brand outline-none resize-none"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={campaignStatus === 'sending'}
                        className="w-full py-2.5 bg-brand hover:bg-brand-dark text-white font-display font-bold text-xs uppercase tracking-widest rounded-full transition-colors"
                      >
                        {campaignStatus === 'sending' ? 'Transmitting campaign...' : 'Send Broadcast Campaign'}
                      </button>
                    </form>
                  )}
                </div>

                {/* Right pane: Subscribers list (Col span 5) */}
                <div className="md:col-span-5 flex flex-col gap-3">
                  <h3 className="text-xs font-mono uppercase text-muted tracking-widest">Active VIPs ({subscribers.length})</h3>

                  <div className="bg-cream border border-line rounded-xl p-4 max-h-[350px] overflow-y-auto flex flex-col gap-2">
                    {subscribers.map((sub) => (
                      <div key={sub.id} className="p-2 border-b border-line last:border-b-0 text-[11px] font-mono text-ink truncate">
                        â€¢ {sub.email}
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* H. E-BOOKS MANAGER */}
          {activeSubTab === 'ebooks' && (
            <div className="flex flex-col gap-6">
              <div className="flex justify-between items-center border-b border-line pb-2">
                <h2 className="text-xl font-display font-black uppercase tracking-wide text-ink">Manage Shedstar E-Books</h2>
                <button
                  onClick={() => setEditingEBook({
                    title: '', author: 'Shedstar', price: 9.99, description: '',
                    coverUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=600&auto=format&fit=crop',
                    pages: 120, fileSize: '12.4 MB PDF', downloadUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
                    isFeatured: false
                  })}
                  className="px-3 py-1 bg-brand hover:bg-brand-dark text-white rounded-full text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1 transition-all"
                >
                  <Plus className="w-4 h-4" /> Create E-Book
                </button>
              </div>

              {editingEBook && (
                <form onSubmit={handleSaveEBook} className="p-5 bg-cream border border-brand/20 rounded-xl flex flex-col gap-4">
                  <h3 className="text-sm font-mono text-brand uppercase tracking-wider">
                    {editingEBook.id ? 'Edit E-Book Details' : 'Create New Premium E-Book'}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-muted font-mono">E-Book Title</label>
                      <input
                        type="text"
                        required
                        value={editingEBook.title || ''}
                        onChange={(e) => setEditingEBook({ ...editingEBook, title: e.target.value })}
                        className="px-3 py-2 bg-white border border-line rounded-lg text-xs text-ink focus:border-brand outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-muted font-mono">Author Name</label>
                      <input
                        type="text"
                        required
                        value={editingEBook.author || ''}
                        onChange={(e) => setEditingEBook({ ...editingEBook, author: e.target.value })}
                        className="px-3 py-2 bg-white border border-line rounded-lg text-xs text-ink focus:border-brand outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-muted font-mono">Description / Pitch</label>
                    <textarea
                      rows={3}
                      required
                      value={editingEBook.description || ''}
                      onChange={(e) => setEditingEBook({ ...editingEBook, description: e.target.value })}
                      className="px-3 py-2 bg-white border border-line rounded-lg text-xs text-ink focus:border-brand outline-none resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-muted font-mono">Price ($ USD)</label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={editingEBook.price || 0}
                        onChange={(e) => setEditingEBook({ ...editingEBook, price: parseFloat(e.target.value) })}
                        className="px-3 py-2 bg-white border border-line rounded-lg text-xs text-ink focus:border-brand outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-muted font-mono">Page Count</label>
                      <input
                        type="number"
                        required
                        value={editingEBook.pages || 0}
                        onChange={(e) => setEditingEBook({ ...editingEBook, pages: parseInt(e.target.value) })}
                        className="px-3 py-2 bg-white border border-line rounded-lg text-xs text-ink focus:border-brand outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-muted font-mono">File Size Log (e.g. "12 MB PDF")</label>
                      <input
                        type="text"
                        required
                        value={editingEBook.fileSize || ''}
                        onChange={(e) => setEditingEBook({ ...editingEBook, fileSize: e.target.value })}
                        className="px-3 py-2 bg-white border border-line rounded-lg text-xs text-ink focus:border-brand outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-muted font-mono">Featured</label>
                      <select
                        value={editingEBook.isFeatured ? 'yes' : 'no'}
                        onChange={(e) => setEditingEBook({ ...editingEBook, isFeatured: e.target.value === 'yes' })}
                        className="px-3 py-2 bg-white border border-line rounded-lg text-xs text-ink focus:border-brand outline-none"
                      >
                        <option value="no">Standard Book</option>
                        <option value="yes">Best Seller Featured</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-muted font-mono">Cover Image URL</label>
                      <input
                        type="text"
                        required
                        value={editingEBook.coverUrl || ''}
                        onChange={(e) => setEditingEBook({ ...editingEBook, coverUrl: e.target.value })}
                        className="px-3 py-2 bg-white border border-line rounded-lg text-xs text-ink focus:border-brand outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-muted font-mono">Digital Download PDF/EPUB URL</label>
                      <input
                        type="text"
                        required
                        value={editingEBook.downloadUrl || ''}
                        onChange={(e) => setEditingEBook({ ...editingEBook, downloadUrl: e.target.value })}
                        className="px-3 py-2 bg-white border border-line rounded-lg text-xs text-ink focus:border-brand outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => setEditingEBook(null)}
                      className="px-4 py-2 border border-line text-ink hover:border-brand rounded-full text-xs font-mono"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-brand hover:bg-brand-dark text-white rounded-full text-xs font-mono font-bold transition-colors"
                    >
                      Save E-Book
                    </button>
                  </div>
                </form>
              )}

              <div className="bg-paper border border-line rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="bg-cream text-muted uppercase text-[10px] border-b border-line">
                      <th className="p-3">Cover</th>
                      <th className="p-3">Title & Author</th>
                      <th className="p-3 text-right">Price</th>
                      <th className="p-3 text-right">Pages</th>
                      <th className="p-3 text-right">Sales Count</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminEBooks.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-6 text-center text-muted">No E-Books found. Get started by creating one!</td>
                      </tr>
                    ) : (
                      adminEBooks.map((book) => (
                        <tr key={book.id} className="border-b border-line hover:bg-cream transition-colors">
                          <td className="p-3">
                            <img src={book.coverUrl} alt="" className="w-8 h-10 object-cover rounded" />
                          </td>
                          <td className="p-3">
                            <p className="text-ink font-bold">{book.title}</p>
                            <p className="text-[10px] text-muted">By {book.author}</p>
                          </td>
                          <td className="p-3 text-right text-brand font-bold">${book.price.toFixed(2)}</td>
                          <td className="p-3 text-right text-muted">{book.pages}</td>
                          <td className="p-3 text-right text-brand font-bold">{book.salesCount || 0} sold</td>
                          <td className="p-3 text-right">
                            <div className="flex justify-end gap-2">
                              <button onClick={() => setEditingEBook(book)} className="p-1.5 text-muted hover:text-brand"><Edit2 className="w-4 h-4" /></button>
                              <button onClick={() => handleDeleteEBook(book.id)} className="p-1.5 text-muted hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SITE SETTINGS */}
          {activeSubTab === 'settings' && (
            <div className="flex flex-col gap-8">
              <h2 className="text-xl font-display font-black uppercase tracking-wide text-ink border-b border-line pb-2">Site Settings</h2>

              <div className="p-5 bg-cream border border-line rounded-xl">
                <h3 className="text-sm font-mono text-brand uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Sparkles className="w-4.5 h-4.5 text-brand" /> Home Page Hero Video
                </h3>
                <p className="text-[11px] text-muted leading-relaxed mb-4 max-w-2xl">
                  Direct links to <strong>.mp4</strong> files. Leave both empty and the hero keeps its
                  still portrait. The phone file is used below 640px wide; the desktop file everywhere
                  else. Set only one and it is used for every screen. The portrait stays as the poster
                  frame, so the hero still looks right while the video loads. YouTube and Vimeo page
                  links will not work here &mdash; the file itself must be linked.
                </p>

                <form onSubmit={handleSaveSiteSettings} className="space-y-4">
                  <div>
                    <label htmlFor="hero-video-mobile" className="text-[10px] font-mono text-muted uppercase tracking-widest">
                      Phone video URL
                    </label>
                    <input
                      id="hero-video-mobile"
                      type="url"
                      value={siteSettings.heroVideoMobileUrl}
                      onChange={(e) => { setSiteSettings({ ...siteSettings, heroVideoMobileUrl: e.target.value }); setSettingsStatus('idle'); }}
                      placeholder="https://example.com/hero-mobile.mp4"
                      className="w-full mt-1 px-4 py-2.5 bg-white border border-line rounded-lg text-sm text-ink outline-none focus:border-brand"
                    />
                  </div>

                  <div>
                    <label htmlFor="hero-video-desktop" className="text-[10px] font-mono text-muted uppercase tracking-widest">
                      Desktop video URL
                    </label>
                    <input
                      id="hero-video-desktop"
                      type="url"
                      value={siteSettings.heroVideoDesktopUrl}
                      onChange={(e) => { setSiteSettings({ ...siteSettings, heroVideoDesktopUrl: e.target.value }); setSettingsStatus('idle'); }}
                      placeholder="https://example.com/hero-desktop.mp4"
                      className="w-full mt-1 px-4 py-2.5 bg-white border border-line rounded-lg text-sm text-ink outline-none focus:border-brand"
                    />
                  </div>

                  <div className="flex items-center gap-3 pt-1">
                    <button
                      type="submit"
                      disabled={settingsStatus === 'saving'}
                      className="btn-brand text-xs disabled:opacity-60"
                    >
                      {settingsStatus === 'saving' ? 'Saving…' : 'Save Settings'}
                    </button>
                    {(siteSettings.heroVideoMobileUrl || siteSettings.heroVideoDesktopUrl) && (
                      <button
                        type="button"
                        onClick={() => { setSiteSettings({ heroVideoMobileUrl: '', heroVideoDesktopUrl: '' }); setSettingsStatus('idle'); }}
                        className="btn-outline text-xs"
                      >
                        Clear
                      </button>
                    )}
                    {settingsStatus === 'saved' && (
                      <span className="text-xs font-mono text-brand flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" /> Saved
                      </span>
                    )}
                    {settingsStatus === 'error' && (
                      <span className="text-xs font-mono text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" /> {settingsError}
                      </span>
                    )}
                  </div>
                </form>

                {(siteSettings.heroVideoMobileUrl || siteSettings.heroVideoDesktopUrl) && (
                  <div className="mt-5 pt-4 border-t border-line">
                    <p className="text-[10px] font-mono text-muted uppercase tracking-widest mb-2">Preview</p>
                    <video
                      key={siteSettings.heroVideoDesktopUrl || siteSettings.heroVideoMobileUrl}
                      src={siteSettings.heroVideoDesktopUrl || siteSettings.heroVideoMobileUrl}
                      className="w-full max-w-md rounded-lg border border-line bg-ink"
                      controls
                      muted
                      playsInline
                      preload="metadata"
                    />
                    <p className="text-[10px] text-muted mt-2">
                      If this preview stays blank, the link is not a directly playable video file and the
                      hero will fall back to the portrait.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* I. MONETIZATION & ADS MANAGER */}
          {activeSubTab === 'ads' && (
            <div className="flex flex-col gap-8">

              {/* Row 1: Google AdSense Integrator */}
              <div className="p-5 bg-cream border border-line rounded-xl">
                <h3 className="text-sm font-mono text-brand uppercase tracking-wider mb-4 flex items-center gap-1.5">
                  <Sparkles className="w-4.5 h-4.5 text-brand" /> Google AdSense Configuration
                </h3>

                {adminAdConfig ? (
                  <form onSubmit={handleSaveAdConfig} className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-line">
                      <div>
                        <h4 className="text-xs font-bold text-ink uppercase font-display">AdSense Monetization Switch</h4>
                        <p className="text-[10px] text-muted mt-0.5">Toggle live Google Ads injections globally across empty sidebars and headers</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={adminAdConfig.adSenseEnabled}
                          onChange={(e) => setAdminAdConfig({ ...adminAdConfig, adSenseEnabled: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-cream-dark peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-line after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand"></div>
                      </label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] text-muted font-mono">Google Publisher ID (e.g. ca-pub-XXXXX)</label>
                        <input
                          type="text"
                          required={adminAdConfig.adSenseEnabled}
                          value={adminAdConfig.adSensePublisherId || ''}
                          onChange={(e) => setAdminAdConfig({ ...adminAdConfig, adSensePublisherId: e.target.value })}
                          placeholder="ca-pub-1234567891011121"
                          disabled={!adminAdConfig.adSenseEnabled}
                          className="px-3 py-2 bg-white border border-line rounded-lg text-xs text-ink focus:border-brand outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] text-muted font-mono">Ad Slot ID (e.g. 10-digit number)</label>
                        <input
                          type="text"
                          required={adminAdConfig.adSenseEnabled}
                          value={adminAdConfig.adSenseSlotId || ''}
                          onChange={(e) => setAdminAdConfig({ ...adminAdConfig, adSenseSlotId: e.target.value })}
                          placeholder="9876543210"
                          disabled={!adminAdConfig.adSenseEnabled}
                          className="px-3 py-2 bg-white border border-line rounded-lg text-xs text-ink focus:border-brand outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="px-4 py-2 bg-brand hover:bg-brand-dark text-white rounded-full text-xs font-mono font-bold transition-all uppercase tracking-wider"
                    >
                      Save AdSense Layout
                    </button>
                  </form>
                ) : (
                  <p className="text-xs text-muted">Loading configurations...</p>
                )}
              </div>

              {/* Row 2: Custom Sponsorship Campaigns */}
              <div className="flex flex-col gap-6">
                <div className="flex justify-between items-center border-b border-line pb-2">
                  <h3 className="text-sm font-mono text-brand uppercase tracking-wider">Custom Sponsored Brand Partnerships</h3>
                  <button
                    onClick={() => setEditingAd({
                      brandName: '', placement: 'banner',
                      imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600&auto=format&fit=crop',
                      targetUrl: 'https://google.com', cpc: 0.25, cpm: 3.50, isActive: true
                    })}
                    className="px-3 py-1 bg-brand hover:bg-brand-dark text-white rounded-full text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1 transition-all"
                  >
                    <Plus className="w-4 h-4" /> Add Campaign
                  </button>
                </div>

                {editingAd && (
                  <form onSubmit={handleSaveAd} className="p-5 bg-cream border border-brand/20 rounded-xl flex flex-col gap-4">
                    <h4 className="text-xs font-mono text-brand uppercase tracking-wider">
                      {editingAd.id ? 'Edit Sponsorship Campaign' : 'Create Custom Sponsorship Brand'}
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex flex-col gap-1 col-span-2">
                        <label className="text-[10px] text-muted font-mono">Brand Name</label>
                        <input
                          type="text"
                          required
                          value={editingAd.brandName || ''}
                          onChange={(e) => setEditingAd({ ...editingAd, brandName: e.target.value })}
                          className="px-3 py-2 bg-white border border-line rounded-lg text-xs text-ink focus:border-brand outline-none"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] text-muted font-mono">Placement Spot</label>
                        <select
                          value={editingAd.placement || 'banner'}
                          onChange={(e) => setEditingAd({ ...editingAd, placement: e.target.value as any })}
                          className="px-3 py-2 bg-white border border-line rounded-lg text-xs text-ink focus:border-brand outline-none"
                        >
                          <option value="banner">Horizontal Banner (Header/Top)</option>
                          <option value="sidebar">Sidebar Square Card</option>
                          <option value="footer">Footer Banner (Bottom)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] text-muted font-mono">Banner/Ad Image URL</label>
                        <input
                          type="text"
                          required
                          value={editingAd.imageUrl || ''}
                          onChange={(e) => setEditingAd({ ...editingAd, imageUrl: e.target.value })}
                          className="px-3 py-2 bg-white border border-line rounded-lg text-xs text-ink focus:border-brand outline-none"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] text-muted font-mono">Target Destination Link (URL)</label>
                        <input
                          type="text"
                          required
                          value={editingAd.targetUrl || ''}
                          onChange={(e) => setEditingAd({ ...editingAd, targetUrl: e.target.value })}
                          className="px-3 py-2 bg-white border border-line rounded-lg text-xs text-ink focus:border-brand outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] text-muted font-mono">Cost-Per-Click CPC ($ USD Payout)</label>
                        <input
                          type="number"
                          step="0.01"
                          required
                          value={editingAd.cpc || 0}
                          onChange={(e) => setEditingAd({ ...editingAd, cpc: parseFloat(e.target.value) })}
                          className="px-3 py-2 bg-white border border-line rounded-lg text-xs text-ink focus:border-brand outline-none"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] text-muted font-mono">Cost-Per-Thousand CPM ($ USD Payout)</label>
                        <input
                          type="number"
                          step="0.01"
                          required
                          value={editingAd.cpm || 0}
                          onChange={(e) => setEditingAd({ ...editingAd, cpm: parseFloat(e.target.value) })}
                          className="px-3 py-2 bg-white border border-line rounded-lg text-xs text-ink focus:border-brand outline-none"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] text-muted font-mono">Status Active</label>
                        <select
                          value={editingAd.isActive ? 'yes' : 'no'}
                          onChange={(e) => setEditingAd({ ...editingAd, isActive: e.target.value === 'yes' })}
                          className="px-3 py-2 bg-white border border-line rounded-lg text-xs text-ink focus:border-brand outline-none"
                        >
                          <option value="yes">Live Broadcasting</option>
                          <option value="no">Paused / Inactive</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 mt-2">
                      <button
                        type="button"
                        onClick={() => setEditingAd(null)}
                        className="px-4 py-2 border border-line text-ink hover:border-brand rounded-full text-xs font-mono"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-brand hover:bg-brand-dark text-white rounded-full text-xs font-mono font-bold transition-colors"
                      >
                        Save Campaign
                      </button>
                    </div>
                  </form>
                )}

                <div className="bg-paper border border-line rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs font-mono">
                    <thead>
                      <tr className="bg-cream text-muted uppercase text-[10px] border-b border-line">
                        <th className="p-3">Partner Sponsor</th>
                        <th className="p-3">Placement</th>
                        <th className="p-3 text-right">Impressions</th>
                        <th className="p-3 text-right">Clicks</th>
                        <th className="p-3 text-right">Earning Config</th>
                        <th className="p-3 text-right">Revenue Earned</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {adminAds.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="p-6 text-center text-muted">No sponsorships found. Create a campaign to start earning!</td>
                        </tr>
                      ) : (
                        adminAds.map((ad) => (
                          <tr key={ad.id} className="border-b border-line hover:bg-cream transition-colors">
                            <td className="p-3">
                              <p className="text-ink font-bold">{ad.brandName}</p>
                              <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-mono font-bold uppercase tracking-wide ${ad.isActive ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'}`}>
                                {ad.isActive ? 'Active' : 'Paused'}
                              </span>
                            </td>
                            <td className="p-3 text-muted uppercase">{ad.placement}</td>
                            <td className="p-3 text-right text-ink font-bold">{(ad.impressions || 0).toLocaleString()}</td>
                            <td className="p-3 text-right text-ink font-bold">{(ad.clicks || 0).toLocaleString()}</td>
                            <td className="p-3 text-right text-muted">
                              <p>CPC: ${ad.cpc.toFixed(2)}</p>
                              <p>CPM: ${ad.cpm.toFixed(2)}</p>
                            </td>
                            <td className="p-3 text-right text-green-600 font-bold">${(ad.revenue || 0).toFixed(2)}</td>
                            <td className="p-3 text-right">
                              <div className="flex justify-end gap-2">
                                <button onClick={() => setEditingAd(ad)} className="p-1.5 text-muted hover:text-brand"><Edit2 className="w-4 h-4" /></button>
                                <button onClick={() => handleDeleteAd(ad.id)} className="p-1.5 text-muted hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

              </div>

            </div>
          )}

          {/* J. BRAND PARTNERSHIP REQUESTS MANAGER */}
          {activeSubTab === 'partners' && (
            <div className="flex flex-col gap-6">
              <h2 className="text-xl font-display font-black uppercase tracking-wide text-ink border-b border-line pb-2 flex items-center gap-2">
                <Handshake className="w-5 h-5 text-brand" /> Brand Partnership & Advertising Requests
              </h2>

              <div className="flex flex-col gap-4">
                {adminPartnerships.length === 0 ? (
                  <p className="text-xs text-muted text-center py-8">No partnership or advertising enquiries logged yet.</p>
                ) : (
                  adminPartnerships.map((partner) => (
                    <div key={partner.id} className="p-5 bg-cream border border-line rounded-xl flex flex-col gap-3 text-xs select-text">
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-line">
                        <div>
                          <h4 className="text-sm font-display font-bold text-ink uppercase">{partner.companyName}</h4>
                          <p className="text-muted text-[10px]">{partner.industry || 'Industry N/A'} â€¢ Contact: {partner.contactPerson}</p>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] uppercase font-mono font-bold ${
                          partner.status === 'accepted' ? 'bg-green-100 text-green-700' : partner.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {partner.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-2 border-b border-line font-mono text-[10px] text-muted">
                        <div>
                          <p className="text-[8px] text-muted uppercase">Partnership Type</p>
                          <p className="text-ink font-bold">{partner.partnershipType.replace(/-/g, ' ')}</p>
                        </div>
                        <div>
                          <p className="text-[8px] text-muted uppercase">Budget</p>
                          <p className="text-green-600 font-bold">${(partner.budget || 0).toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-[8px] text-muted uppercase">Campaign Duration</p>
                          <p className="text-ink font-bold">{partner.campaignDuration || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-[8px] text-muted uppercase">Proposal</p>
                          <p className="text-brand truncate">{partner.proposalFileName || 'None'}</p>
                        </div>
                      </div>

                      <div>
                        <p className="text-[8px] font-mono text-muted uppercase">Message</p>
                        <p className="text-ink mt-1 leading-relaxed italic">{partner.message}</p>
                      </div>

                      <div className="flex flex-wrap gap-4 items-center justify-between mt-3 pt-3 border-t border-line">
                        <div className="text-[10px] text-muted font-mono">
                          {partner.email} {partner.phone ? `| ${partner.phone}` : ''} {partner.website ? `| ${partner.website}` : ''}
                        </div>

                        {partner.status === 'pending' ? (
                          <div className="flex gap-2 select-none">
                            <button
                              onClick={() => handleUpdatePartnershipStatus(partner.id, 'accepted')}
                              className="px-2.5 py-1 bg-green-500 text-white font-sans font-bold rounded-full flex items-center gap-1 hover:bg-green-600"
                            >
                              <Check className="w-3.5 h-3.5 stroke-[3px]" /> Accept
                            </button>
                            <button
                              onClick={() => handleUpdatePartnershipStatus(partner.id, 'rejected')}
                              className="px-2.5 py-1 bg-white border border-red-300 text-red-600 font-sans font-bold rounded-full flex items-center gap-1 hover:bg-red-500 hover:text-white hover:border-red-500 transition-colors"
                            >
                              <X className="w-3.5 h-3.5" /> Decline
                            </button>
                          </div>
                        ) : (
                          <button onClick={() => handleDeletePartnership(partner.id)} className="p-1 text-muted hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}
