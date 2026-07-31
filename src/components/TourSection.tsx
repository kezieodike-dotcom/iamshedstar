/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Clock, Ticket, AlertTriangle, Check, Map as MapIcon, CalendarDays } from 'lucide-react';
import { Tour } from '../types';
import { TapeTitle, SafetyPin } from './Decor';

interface TourSectionProps {
  tours: Tour[];
}

export default function TourSection({ tours }: TourSectionProps) {
  const [selectedTour, setSelectedTour] = useState<Tour | null>(null);
  const [ticketModalTour, setTicketModalTour] = useState<Tour | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [ticketStep, setTicketStep] = useState<'idle' | 'submitting' | 'success'>('idle');
  const [bookingEmail, setBookingEmail] = useState('');
  const [bookingName, setBookingName] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  // Next upcoming tour
  const upcomingTour = tours.find(t => !t.isSoldOut) || tours[0];
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    if (!upcomingTour) return;
    const tourDate = new Date(upcomingTour.date + 'T' + (upcomingTour.time || '20:00')).getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const difference = tourDate - now;

      if (difference < 0) {
        clearInterval(interval);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        setTimeLeft({ days, hours, minutes, seconds });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [upcomingTour]);

  const handleBuyTickets = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingEmail || !bookingName) return;
    setTicketStep('submitting');

    setTimeout(() => {
      setTicketStep('success');
      // Decrement simulated ticket availability or similar if desired.
    }, 1500);
  };

  const openTicketModal = (tour: Tour) => {
    setTicketModalTour(tour);
    setTicketStep('idle');
    setQuantity(1);
    setBookingEmail('');
    setBookingName('');
  };

  return (
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 text-ink select-none">

      <SafetyPin className="absolute top-6 right-8 rotate-12 hidden sm:block" size={56} />

      {/* Title */}
      <div className="mb-12">
        <span className="text-xs text-brand font-mono uppercase tracking-widest">Live In Concert</span>
        <div className="mt-3"><TapeTitle>Shedding Light Tour</TapeTitle></div>
      </div>

      {/* Countdown Timer and Next Gigs spotlight — dark hero band */}
      {upcomingTour && (
        <div className="mb-14 p-8 md:p-10 bg-ink text-white border-2 border-ink grain max-w-5xl flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">

          <div className="flex-1 text-center md:text-left">
            <span className="inline-flex bg-brand text-white text-[10px] font-display font-bold px-3 py-1 uppercase tracking-widest">
              Next Massive Show
            </span>
            <h2 className="display-hd text-white text-3xl sm:text-4xl mt-4">
              {upcomingTour.city}, {upcomingTour.country}
            </h2>
            <p className="text-sm text-white/70 font-mono mt-2">{upcomingTour.venue}</p>
            <p className="text-xs text-white/60 mt-2 flex items-center justify-center md:justify-start gap-1">
              <Clock className="w-3.5 h-3.5 text-brand" /> {upcomingTour.time} • {new Date(upcomingTour.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>

          <div className="flex flex-col items-center gap-3">
            <span className="text-[10px] font-mono text-white/50 uppercase tracking-widest">Countdown To Show</span>
            <div className="flex gap-3">
              <div className="flex flex-col items-center p-3 bg-white/10 border-2 border-white/25 w-16">
                <span className="text-2xl font-mono font-bold text-white">{String(timeLeft.days).padStart(2, '0')}</span>
                <span className="text-[9px] text-white/50 uppercase font-mono tracking-widest">Days</span>
              </div>
              <div className="flex flex-col items-center p-3 bg-white/10 border-2 border-white/25 w-16">
                <span className="text-2xl font-mono font-bold text-white">{String(timeLeft.hours).padStart(2, '0')}</span>
                <span className="text-[9px] text-white/50 uppercase font-mono tracking-widest">Hrs</span>
              </div>
              <div className="flex flex-col items-center p-3 bg-white/10 border-2 border-white/25 w-16">
                <span className="text-2xl font-mono font-bold text-white">{String(timeLeft.minutes).padStart(2, '0')}</span>
                <span className="text-[9px] text-white/50 uppercase font-mono tracking-widest">Min</span>
              </div>
              <div className="flex flex-col items-center p-3 bg-white/10 border-2 border-white/25 w-16">
                <span className="text-2xl font-mono font-bold text-white">{String(timeLeft.seconds).padStart(2, '0')}</span>
                <span className="text-[9px] text-white/50 uppercase font-mono tracking-widest">Sec</span>
              </div>
            </div>

            <button
              onClick={() => openTicketModal(upcomingTour)}
              className="mt-4 btn-brand text-xs"
            >
              <Ticket className="w-4 h-4" /> Buy Tickets Now
            </button>
          </div>

        </div>
      )}

      {/* Selector: List view vs Interactive Map Tracker */}
      <div className="flex gap-3 mb-10">
        <button
          onClick={() => setViewMode('list')}
          className={`px-5 py-2.5 text-xs font-display font-bold uppercase tracking-widest flex items-center gap-1.5 transition-all border-2 ${
            viewMode === 'list'
              ? 'bg-ink text-white border-ink'
              : 'bg-paper border-ink text-muted hover:text-ink'
          }`}
        >
          <CalendarDays className="w-4 h-4" /> Tour Schedule List
        </button>
        <button
          onClick={() => setViewMode('map')}
          className={`px-5 py-2.5 text-xs font-display font-bold uppercase tracking-widest flex items-center gap-1.5 transition-all border-2 ${
            viewMode === 'map'
              ? 'bg-ink text-white border-ink'
              : 'bg-paper border-ink text-muted hover:text-ink'
          }`}
        >
          <MapIcon className="w-4 h-4" /> Global Hotspots Map
        </button>
      </div>

      {/* Content Rendering: List View — clean editorial list */}
      {viewMode === 'list' ? (
        <div className="flex flex-col max-w-5xl border-2 border-ink bg-paper">
          {tours.map((tour) => (
            <div
              key={tour.id}
              className={`flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 px-5 py-5 border-b-2 border-ink last:border-b-0 transition-colors ${
                tour.isSoldOut ? 'opacity-60' : 'hover:bg-cream'
              }`}
            >
              {/* Date Block */}
              <div className="sm:w-44 font-mono text-sm text-muted flex items-center gap-2">
                <Calendar className="w-4 h-4 text-brand" />
                {new Date(tour.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </div>

              {/* Location Venue details */}
              <div className="flex-1">
                <h3 className="font-display font-black uppercase text-xl tracking-tight text-ink">{tour.city}, {tour.country}</h3>
                <p className="text-sm text-muted flex items-center gap-1 mt-1">
                  <MapPin className="w-3.5 h-3.5" /> {tour.venue}
                </p>
              </div>

              {/* Time and Status Buttons */}
              <div className="flex items-center gap-6">
                <span className="text-xs text-muted font-mono uppercase flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-brand" /> {tour.time || '20:00'}
                </span>

                {tour.isSoldOut ? (
                  <span className="btn-outline text-xs opacity-50 cursor-default">
                    Sold Out
                  </span>
                ) : (
                  <button
                    onClick={() => openTicketModal(tour)}
                    className="btn-ink text-xs"
                  >
                    Tickets
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Content Rendering: Interactive SVG Map Tracker */
        <div className="max-w-4xl mx-auto p-6 bg-cream border-2 border-ink relative overflow-hidden">
          <div className="absolute top-4 left-4 text-[10px] text-brand font-mono uppercase tracking-widest flex items-center gap-1">
            <MapPin className="w-3 h-3" /> Live World Map View
          </div>

          <div className="relative aspect-[16/9] bg-paper border-2 border-ink flex items-center justify-center p-4">

            {/* Custom stylized map overlay showing dots */}
            <svg viewBox="0 0 1000 500" className="w-full h-full text-cream-dark">
              {/* Simple continent representations for aesthetics */}
              <path d="M150,150 Q200,100 250,120 T300,180 T250,250 T150,220 Z" fill="currentColor" /> {/* North America */}
              <path d="M450,120 Q500,80 550,110 T600,150 T550,220 T450,180 Z" fill="currentColor" /> {/* Europe */}
              <path d="M480,240 Q540,220 560,260 T580,320 T520,380 T460,300 Z" fill="currentColor" /> {/* Africa */}
              <path d="M620,130 Q700,90 780,120 T840,200 T780,280 T680,220 Z" fill="currentColor" /> {/* Asia */}
              <path d="M220,280 Q260,260 280,300 T300,380 T250,440 T200,360 Z" fill="currentColor" /> {/* South America */}
              <path d="M750,330 Q800,310 820,340 T800,400 Z" fill="currentColor" /> {/* Australia */}
            </svg>

            {/* Interactive Hotspot pins mapped on SVG grid coordinates */}
            {tours.map((tour) => {
              // Custom map positioning mappings
              let x = 500;
              let y = 250;
              if (tour.city === 'London') { x = 490; y = 130; }
              else if (tour.city === 'Paris') { x = 502; y = 145; }
              else if (tour.city === 'New York') { x = 270; y = 160; }
              else if (tour.city === 'Los Angeles') { x = 185; y = 185; }
              else if (tour.city === 'Tokyo') { x = 810; y = 180; }
              else if (tour.city === 'Lagos') { x = 510; y = 270; }

              return (
                <div
                  key={tour.id}
                  className="absolute group/pin cursor-pointer transform -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${(x / 1000) * 100}%`, top: `${(y / 500) * 100}%` }}
                  onClick={() => setSelectedTour(tour)}
                >
                  {/* Glowing Ring Pin */}
                  <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center relative ${
                    tour.isSoldOut ? 'bg-red-500' : 'bg-brand animate-pulse'
                  }`}>
                    <span className={`absolute -inset-2 rounded-full border opacity-50 ${
                      tour.isSoldOut ? 'border-red-500 animate-ping' : 'border-brand animate-ping'
                    }`} style={{ animationDuration: '2s' }} />
                  </div>

                  {/* Pin label card on hover or select */}
                  <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-3 bg-paper border-2 border-ink shadow-xl z-20 min-w-[150px] transition-all pointer-events-none ${
                    selectedTour?.id === tour.id ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-2 scale-95 group-hover/pin:opacity-100 group-hover/pin:translate-y-0'
                  }`}>
                    <h4 className="text-xs font-display font-bold text-ink uppercase truncate">{tour.city}, {tour.country}</h4>
                    <p className="text-[10px] text-brand mt-0.5 truncate">{tour.venue}</p>
                    <p className="text-[9px] text-muted font-mono mt-1 uppercase">{tour.isSoldOut ? 'SOLD OUT' : 'Tickets Available'}</p>
                  </div>

                </div>
              );
            })}
          </div>

          {/* Mini Details card under map when pin is selected */}
          {selectedTour && (
            <div className="mt-4 p-4 bg-paper border-2 border-ink flex items-center justify-between select-none">
              <div>
                <h4 className="text-sm font-display font-bold uppercase text-ink">{selectedTour.city}, {selectedTour.country}</h4>
                <p className="text-xs text-muted mt-1 font-mono">{selectedTour.venue} • {selectedTour.date}</p>
              </div>
              <div className="flex gap-2 items-center">
                {selectedTour.isSoldOut ? (
                  <span className="btn-outline text-xs opacity-50 cursor-default">Sold Out</span>
                ) : (
                  <button
                    onClick={() => openTicketModal(selectedTour)}
                    className="btn-ink text-xs"
                  >
                    Buy Tickets
                  </button>
                )}
                <button
                  onClick={() => setSelectedTour(null)}
                  className="px-3 py-2 border-2 border-ink text-ink hover:bg-ink hover:text-white text-xs uppercase font-mono transition-colors"
                >
                  X
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Ticket Purchase Drawer Dialog Modal */}
      {ticketModalTour && (
        <div className="fixed inset-0 z-50 bg-ink/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-paper border-2 border-ink p-6 max-w-md w-full relative shadow-2xl text-ink">

            <button
              onClick={() => setTicketModalTour(null)}
              className="absolute top-4 right-4 text-muted hover:text-ink"
              title="Close modal"
            >
              X
            </button>

            {ticketStep === 'idle' && (
              <form onSubmit={handleBuyTickets} className="flex flex-col gap-4">
                <div>
                  <span className="text-[10px] font-mono text-brand uppercase tracking-widest">Get Tickets</span>
                  <h3 className="text-xl font-display font-bold text-ink mt-1">
                    {ticketModalTour.city} • {ticketModalTour.venue}
                  </h3>
                  <p className="text-xs text-muted mt-1">{new Date(ticketModalTour.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} • {ticketModalTour.time}</p>
                </div>

                <div className="p-3 bg-brand-soft border-2 border-ink text-xs text-muted leading-relaxed flex gap-2">
                  <AlertTriangle className="w-5 h-5 text-brand flex-shrink-0" />
                  <span>Important: This is a secure checkout simulation. High-priority ticket vouchers will be issued instantly to your email.</span>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs text-muted font-mono uppercase">Full Name</label>
                  <input
                    type="text"
                    required
                    value={bookingName}
                    onChange={(e) => setBookingName(e.target.value)}
                    placeholder="Enter full name"
                    className="px-4 py-2.5 bg-white border-2 border-ink focus:border-brand rounded-none text-sm outline-none text-ink placeholder-muted transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs text-muted font-mono uppercase">Email Address</label>
                  <input
                    type="email"
                    required
                    value={bookingEmail}
                    onChange={(e) => setBookingEmail(e.target.value)}
                    placeholder="vip@shedstar.com"
                    className="px-4 py-2.5 bg-white border-2 border-ink focus:border-brand rounded-none text-sm outline-none text-ink placeholder-muted transition-colors"
                  />
                </div>

                {/* Ticket quantity */}
                <div className="flex justify-between items-center bg-cream border-2 border-ink p-3">
                  <span className="text-xs text-muted font-mono uppercase">Quantity</span>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-7 h-7 bg-white border-2 border-ink flex items-center justify-center rounded-none text-sm hover:border-brand text-ink"
                    >
                      -
                    </button>
                    <span className="font-mono text-sm font-bold text-ink">{quantity}</span>
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.min(8, quantity + 1))}
                      className="w-7 h-7 bg-white border-2 border-ink flex items-center justify-center rounded-none text-sm hover:border-brand text-ink"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Subtotal */}
                <div className="flex justify-between items-center py-2 border-t-2 border-b-2 border-ink font-mono text-xs text-muted">
                  <span>Subtotal ({quantity} tickets)</span>
                  <span className="text-brand font-bold text-sm">${(quantity * 85).toFixed(2)} USD</span>
                </div>

                <button
                  type="submit"
                  className="btn-brand w-full text-xs"
                >
                  Confirm Secure Purchase
                </button>
              </form>
            )}

            {ticketStep === 'submitting' && (
              <div className="py-12 flex flex-col items-center justify-center gap-4 text-center">
                <div className="w-10 h-10 border-2 border-brand border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-brand font-mono uppercase">Securing Ticket Reservation...</p>
                <p className="text-xs text-muted">Contacting promoter gateway</p>
              </div>
            )}

            {ticketStep === 'success' && (
              <div className="py-8 flex flex-col items-center justify-center gap-4 text-center">
                <div className="w-12 h-12 bg-brand text-white rounded-full flex items-center justify-center shadow-lg">
                  <Check className="w-6 h-6 stroke-[3px]" />
                </div>
                <h3 className="text-lg font-display font-bold text-ink uppercase mt-2">Tickets Confirmed!</h3>
                <p className="text-xs text-muted leading-relaxed max-w-xs">
                  Hi {bookingName}, we have secured your {quantity} ticket vouchers to see Shedstar live in {ticketModalTour.city}! Your PDF tickets have been emailed to: <span className="text-brand">{bookingEmail}</span>.
                </p>
                <button
                  onClick={() => setTicketModalTour(null)}
                  className="mt-4 btn-ink text-xs"
                >
                  Done
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
