/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AudioPlayer from './components/AudioPlayer';

// Section Views
import HomeSection from './components/HomeSection';
import AboutSection from './components/AboutSection';
import MusicSection from './components/MusicSection';
import VideosSection from './components/VideosSection';
import TourSection from './components/TourSection';
import MerchandiseSection from './components/MerchandiseSection';
import NewsSection from './components/NewsSection';
import BookingSection from './components/BookingSection';
import ContactSection from './components/ContactSection';
import FanClub from './components/FanClub';
import AdminSection from './components/AdminSection';
import EBooksSection from './components/EBooksSection';
import GallerySection from './components/GallerySection';
import PartnersSection from './components/PartnersSection';

// Types
import {
  Song, Video, Product, Tour, Booking, ContactMessage,
  Subscriber, DashboardStats, CartItem, BlogPost, GalleryItem
} from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('home');

  // Server Loaded Data
  const [songs, setSongs] = useState<Song[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [tours, setTours] = useState<Tour[]>([]);
  const [blog, setBlog] = useState<BlogPost[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);

  // Admin entities
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [contacts, setContacts] = useState<ContactMessage[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);

  // Global Audio Player state
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Shopping Cart state
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('shedstar_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

  // Administrative session
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return sessionStorage.getItem('shedstar_admin') === 'true';
  });

  // Content load failures. Every section is gated on its data being present, so
  // without this a failing API renders a page with sections missing and no
  // explanation — indistinguishable from that content having been deleted.
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isReloading, setIsReloading] = useState<boolean>(false);

  // Policy Modal state overlays
  const [policyType, setPolicyType] = useState<'privacy' | 'terms' | null>(null);

  // Post-payment (Stripe redirect) result overlay
  const [orderResult, setOrderResult] = useState<
    | { status: 'success'; message: string; downloadLinks: { id: string; title: string; downloadUrl: string }[] }
    | { status: 'cancel' }
    | { status: 'error'; message: string }
    | null
  >(null);

  // Save cart changes to local storage
  useEffect(() => {
    localStorage.setItem('shedstar_cart', JSON.stringify(cart));
  }, [cart]);

  // Handle return from Stripe Checkout (success/cancel query params).
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const checkout = params.get('checkout');
    if (!checkout) return;

    // Clean the URL so a refresh doesn't re-trigger this.
    window.history.replaceState({}, '', window.location.pathname);

    if (checkout === 'cancel') {
      setOrderResult({ status: 'cancel' });
      return;
    }

    if (checkout === 'success') {
      const sessionId = params.get('session_id');
      if (!sessionId) return;
      (async () => {
        try {
          const res = await fetch(`/api/checkout/verify?session_id=${encodeURIComponent(sessionId)}`);
          const data = await res.json();
          if (res.ok && data.success) {
            setCart([]); // paid — empty the cart
            setIsCartOpen(false);
            setOrderResult({
              status: 'success',
              message: data.message || 'Payment received — thank you!',
              downloadLinks: data.downloadLinks || []
            });
          } else {
            setOrderResult({
              status: 'error',
              message: data.error || 'We could not confirm your payment yet. If you were charged, contact support@shedstar.com.'
            });
          }
        } catch {
          setOrderResult({
            status: 'error',
            message: 'We could not reach the server to confirm your payment. Please check your email for a receipt.'
          });
        }
      })();
    }
  }, []);

  // Initial Server Data Hydration. Each endpoint is loaded independently so one
  // failure can't blank the rest, and every failure is recorded and surfaced.
  const fetchData = async () => {
    setIsReloading(true);

    const endpoints: { label: string; url: string; apply: (data: any) => void }[] = [
      {
        label: 'Music',
        url: '/api/songs',
        apply: (songsData: Song[]) => {
          setSongs(songsData);
          // Default first song to avoid empty player states
          if (songsData.length > 0) {
            setCurrentSong(songsData[0]);
          }
        }
      },
      { label: 'Videos', url: '/api/videos', apply: setVideos },
      { label: 'Merch', url: '/api/products', apply: setProducts },
      { label: 'Tour', url: '/api/tours', apply: setTours },
      { label: 'News', url: '/api/blog', apply: setBlog },
      { label: 'Gallery', url: '/api/gallery', apply: setGallery }
    ];

    const failed: string[] = [];

    await Promise.all(
      endpoints.map(async ({ label, url, apply }) => {
        try {
          const res = await fetch(url);
          if (!res.ok) {
            console.error(`Failed to load ${url}: HTTP ${res.status}`);
            failed.push(`${label} (${res.status})`);
            return;
          }
          apply(await res.json());
        } catch (error) {
          console.error(`Failed to reach ${url}:`, error);
          failed.push(`${label} (unreachable)`);
        }
      })
    );

    setLoadError(
      failed.length > 0
        ? `Couldn't load ${failed.join(', ')} from the server. Those sections are hidden until it responds.`
        : null
    );
    setIsReloading(false);

    // Fetch admin data if logged in
    if (isAdmin) {
      fetchAdminOnlyData();
    }
  };

  const fetchAdminOnlyData = async () => {
    try {
      const [bookingsRes, contactsRes, subsRes, statsRes] = await Promise.all([
        fetch('/api/bookings'),
        fetch('/api/contacts'),
        fetch('/api/subscribers'),
        fetch('/api/admin/stats')
      ]);

      if (bookingsRes.ok) setBookings(await bookingsRes.json());
      if (contactsRes.ok) setContacts(await contactsRes.json());
      if (subsRes.ok) setSubscribers(await subsRes.json());
      if (statsRes.ok) setStats(await statsRes.json());
    } catch (e) {
      console.error('Failed to pull administrative records:', e);
    }
  };

  useEffect(() => {
    fetchData();
  }, [isAdmin]);

  // Playlist next / prev control index loops
  const handleNextSong = () => {
    if (!currentSong || songs.length === 0) return;
    const currentIdx = songs.findIndex(s => s.id === currentSong.id);
    const nextIdx = (currentIdx + 1) % songs.length;
    setCurrentSong(songs[nextIdx]);
    setIsPlaying(true);
  };

  const handlePrevSong = () => {
    if (!currentSong || songs.length === 0) return;
    const currentIdx = songs.findIndex(s => s.id === currentSong.id);
    const prevIdx = (currentIdx - 1 + songs.length) % songs.length;
    setCurrentSong(songs[prevIdx]);
    setIsPlaying(true);
  };

  const handleSelectSong = (song: Song) => {
    setCurrentSong(song);
    setIsPlaying(true);
  };

  // Cart Management Handlers
  const handleAddToCart = (newItem: CartItem) => {
    setCart((prev) => {
      const existingIdx = prev.findIndex(
        (item) =>
          item.product.id === newItem.product.id &&
          item.selectedSize === newItem.selectedSize &&
          item.selectedColor === newItem.selectedColor
      );

      if (existingIdx > -1) {
        const next = [...prev];
        next[existingIdx].quantity += newItem.quantity;
        return next;
      }
      return [...prev, newItem];
    });
  };

  const handleRemoveFromCart = (prod: Product, size: string, color: string) => {
    setCart((prev) =>
      prev.filter(
        (item) =>
          !(
            item.product.id === prod.id &&
            item.selectedSize === size &&
            item.selectedColor === color
          )
      )
    );
  };

  const handleUpdateCartQty = (prod: Product, size: string, color: string, qty: number) => {
    setCart((prev) => {
      const idx = prev.findIndex(
        (item) =>
          item.product.id === prod.id &&
          item.selectedSize === size &&
          item.selectedColor === color
      );
      if (idx > -1) {
        const next = [...prev];
        next[idx].quantity = qty;
        return next;
      }
      return prev;
    });
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const handleLoginAdmin = () => {
    setIsAdmin(true);
    sessionStorage.setItem('shedstar_admin', 'true');
  };

  const handleLogOutAdmin = () => {
    setIsAdmin(false);
    sessionStorage.removeItem('shedstar_admin');
  };

  const handleNavigate = (tab: string) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-silver text-ink flex flex-col justify-between">

      {/* Navigation Header bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={handleNavigate}
        cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
        onOpenCart={() => setIsCartOpen(true)}
      />

      {/* Main Content Area Routing pane. The home hero sits full-bleed under the
          transparent fixed navbar; every other page gets top padding to clear it. */}
      <main className={`flex-1 pb-24 ${activeTab === 'home' ? '' : 'pt-16 md:pt-20'}`}>

        {activeTab === 'home' && (
          <HomeSection
            setActiveTab={handleNavigate}
            songs={songs}
            tours={tours}
            products={products}
            currentSong={currentSong}
            onSelectSong={handleSelectSong}
            onPlayPause={setIsPlaying}
            isPlaying={isPlaying}
          />
        )}

        {activeTab === 'about' && (
          <AboutSection gallery={gallery} />
        )}

        {activeTab === 'music' && (
          <MusicSection
            songs={songs}
            currentSong={currentSong}
            onSelectSong={handleSelectSong}
            onPlayPause={setIsPlaying}
            isPlaying={isPlaying}
          />
        )}

        {activeTab === 'videos' && (
          <VideosSection
            videos={videos}
          />
        )}

        {activeTab === 'tour' && (
          <TourSection
            tours={tours}
          />
        )}

        {activeTab === 'merchandise' && (
          <MerchandiseSection
            products={products}
            cart={cart}
            onAddToCart={handleAddToCart}
            onRemoveFromCart={handleRemoveFromCart}
            onUpdateCartQty={handleUpdateCartQty}
            onOpenCart={() => setIsCartOpen(true)}
            onCloseCart={() => setIsCartOpen(false)}
            isCartOpen={isCartOpen}
            onClearCart={handleClearCart}
          />
        )}

        {activeTab === 'ebooks' && (
          <EBooksSection
            onAddToCart={handleAddToCart}
            onOpenCart={() => setIsCartOpen(true)}
          />
        )}

        {activeTab === 'gallery' && (
          <GallerySection gallery={gallery} />
        )}

        {activeTab === 'news' && (
          <NewsSection
            blog={blog}
          />
        )}

        {activeTab === 'partners' && (
          <PartnersSection setActiveTab={handleNavigate} />
        )}

        {activeTab === 'booking' && (
          <BookingSection />
        )}

        {activeTab === 'contact' && (
          <ContactSection />
        )}

        {activeTab === 'fanclub' && (
          <FanClub />
        )}

        {activeTab === 'admin' && (
          <AdminSection
            isAdmin={isAdmin}
            onLoginAdmin={handleLoginAdmin}
            songs={songs}
            videos={videos}
            products={products}
            tours={tours}
            bookings={bookings}
            contacts={contacts}
            subscribers={subscribers}
            stats={stats}
            onRefreshData={fetchData}
          />
        )}
      </main>

      {/* Content failed to load. Rendered as a dismissible corner toast rather
          than a top banner so it never intrudes on the full-bleed home hero,
          while still explaining why sections are missing. */}
      {loadError && (
        <div
          role="alert"
          className="fixed z-40 bottom-4 left-4 right-4 sm:right-auto sm:max-w-sm bg-cream border-2 border-ink shadow-[4px_4px_0_rgba(10,10,10,0.35)] p-4 animate-fadeIn"
        >
          <p className="font-mono text-[10px] uppercase tracking-wider text-ink leading-relaxed">
            ⚠ {loadError}
          </p>
          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={fetchData}
              disabled={isReloading}
              className="btn-ink text-xs px-4 py-2 disabled:opacity-60"
            >
              {isReloading ? 'Retrying…' : 'Retry'}
            </button>
            <button
              onClick={() => setLoadError(null)}
              className="btn-outline text-xs px-4 py-2"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Global Music floating widget */}
      <AudioPlayer
        currentSong={currentSong}
        playlist={songs}
        isPlaying={isPlaying}
        onPlayPause={setIsPlaying}
        onNextSong={handleNextSong}
        onPrevSong={handlePrevSong}
        onSelectSong={handleSelectSong}
      />

      {/* Brand Footer layout */}
      <Footer
        setActiveTab={handleNavigate}
        onOpenPrivacy={() => setPolicyType('privacy')}
        onOpenTerms={() => setPolicyType('terms')}
        isAdmin={isAdmin}
        onLogoutAdmin={handleLogOutAdmin}
      />

      {/* Post-payment result overlay (Stripe redirect return) */}
      {orderResult && (
        <div className="fixed inset-0 z-[60] bg-ink/70 backdrop-blur-md flex items-center justify-center p-4 select-text">
          <div className="bg-paper border-2 border-ink p-6 max-w-md w-full relative shadow-2xl text-ink">
            <button
              onClick={() => setOrderResult(null)}
              className="absolute top-4 right-4 text-muted hover:text-ink font-mono text-sm uppercase border-2 border-ink px-2 py-1 select-none"
              title="Close"
            >
              Close [X]
            </button>

            {orderResult.status === 'success' && (
              <div className="text-center pt-2">
                <div className="w-14 h-14 bg-brand text-white border-2 border-ink flex items-center justify-center mx-auto mb-4 text-2xl font-black">✓</div>
                <h3 className="font-display font-black text-2xl text-ink uppercase tracking-tight">Payment Complete!</h3>
                <p className="text-xs text-muted leading-relaxed max-w-sm mx-auto mt-3">{orderResult.message}</p>

                {orderResult.downloadLinks.length > 0 && (
                  <div className="mt-5 pt-4 border-t-2 border-ink space-y-2 text-left">
                    <p className="text-[10px] font-mono text-muted uppercase tracking-wider">Your Downloads</p>
                    {orderResult.downloadLinks.map((d) => (
                      <a
                        key={d.id}
                        href={d.downloadUrl}
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-ink w-full text-xs"
                      >
                        ⬇ {d.title}
                      </a>
                    ))}
                  </div>
                )}

                <button onClick={() => setOrderResult(null)} className="btn-brand w-full mt-6 text-xs">
                  Continue Shopping
                </button>
              </div>
            )}

            {orderResult.status === 'cancel' && (
              <div className="text-center pt-2">
                <div className="w-14 h-14 bg-cream text-ink border-2 border-ink flex items-center justify-center mx-auto mb-4 text-2xl font-black">!</div>
                <h3 className="font-display font-black text-xl text-ink uppercase tracking-tight">Checkout Canceled</h3>
                <p className="text-xs text-muted leading-relaxed max-w-sm mx-auto mt-3">
                  No payment was taken and your cart is still saved. You can complete your order whenever you're ready.
                </p>
                <button onClick={() => setOrderResult(null)} className="btn-brand w-full mt-6 text-xs">
                  Back to Store
                </button>
              </div>
            )}

            {orderResult.status === 'error' && (
              <div className="text-center pt-2">
                <div className="w-14 h-14 bg-red-100 text-red-600 border-2 border-red-500 flex items-center justify-center mx-auto mb-4 text-2xl font-black">!</div>
                <h3 className="font-display font-black text-xl text-ink uppercase tracking-tight">Payment Not Confirmed</h3>
                <p className="text-xs text-muted leading-relaxed max-w-sm mx-auto mt-3">{orderResult.message}</p>
                <button onClick={() => setOrderResult(null)} className="btn-ink w-full mt-6 text-xs">
                  Dismiss
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Terms & Privacy Overlays Modals */}
      {policyType && (
        <div className="fixed inset-0 z-50 bg-ink/60 backdrop-blur-md flex items-center justify-center p-4 select-text">
          <div className="bg-paper border border-line rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto relative shadow-2xl">
            <button
              onClick={() => setPolicyType(null)}
              className="absolute top-4 right-4 text-muted hover:text-ink font-mono text-sm uppercase select-none"
              title="Close modal"
            >
              X
            </button>

            {policyType === 'privacy' ? (
              <div className="flex flex-col gap-4 text-sm text-ink/70 leading-relaxed font-sans">
                <h3 className="text-xl font-display font-black uppercase text-ink tracking-tight border-b border-line pb-2 select-none">
                  Shedstar Privacy Shield Policy
                </h3>
                <p className="font-mono text-xs text-brand select-none">LAST REVISED: JULY 2026</p>
                <p>
                  At Shedstar Music Group, we respect your privacy and are committed to protecting any personal details you share with us. This Privacy Shield outlines how we gather, store, and process personal telemetry, newsletter subscriptions, merchandise transaction shipping details, and booking metadata.
                </p>
                <h4 className="font-bold text-ink uppercase select-none">1. Telemetry & Fan Data</h4>
                <p>
                  We compile standard client state details, search queries, active audio streams, and IP address locations strictly for enhancing global CDN routing performance and scheduling upcoming tour stops in heavy fan regions.
                </p>
                <h4 className="font-bold text-ink uppercase select-none">2. E-Commerce Protections</h4>
                <p>
                  All merchandise ordering and ticketing actions are fully secure. We process billing details securely using top-tier simulated checkout gateways. Credit card numbers or bank keys are never stored on our local server containers.
                </p>
                <p className="italic text-muted">
                  For licensing questions or legal complaints, contact us at legal@shedstar.com.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-4 text-sm text-ink/70 leading-relaxed font-sans">
                <h3 className="text-xl font-display font-black uppercase text-ink tracking-tight border-b border-line pb-2 select-none">
                  Shedstar Terms of Service
                </h3>
                <p className="font-mono text-xs text-brand select-none">LAST REVISED: JULY 2026</p>
                <p>
                  By accessing the official website of Shedstar ("Shedstar Official Website"), you statefully agree to be legally bound by these Terms of Service, all applicable laws, and regulations.
                </p>
                <h4 className="font-bold text-ink uppercase select-none">1. Media Copyright & Intellectual Asset Protection</h4>
                <p>
                  All digital audio tracks, live lyrics, cinematic video clips, official merchandise prints, and custom mobile artwork are protected under international copyright treaties. Any unauthorized redistribution, synth sampling, or replication of elements is strictly prohibited.
                </p>
                <h4 className="font-bold text-ink uppercase select-none">2. Booking Inquiries Policy</h4>
                <p>
                  Submitting event booking proposals does not constitute a legally binding performance contract. Shedstar\'s global management group holds complete discretion on accept/decline actions of all corporate show bookings.
                </p>
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-line text-right select-none">
              <button
                onClick={() => setPolicyType(null)}
                className="px-5 py-2.5 bg-brand text-white font-display font-bold text-xs uppercase tracking-widest rounded-full"
              >
                Accept & Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
