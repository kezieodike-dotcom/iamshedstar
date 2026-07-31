/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle, ShieldAlert, Instagram, Youtube, Twitter, Disc } from 'lucide-react';
import { TapeTitle, SafetyPin } from './Decor';

export default function ContactSection() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    try {
      const res = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setTimeout(() => {
          setStatus('success');
          setFormData({ name: '', email: '', subject: '', message: '' });
        }, 1200);
      } else {
        setStatus('idle');
      }
    } catch {
      setStatus('idle');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="w-full text-ink select-none">

      {/* HERO BAND */}
      <section className="relative bg-ink grain text-white px-4 md:px-8 py-16 md:py-24 overflow-hidden">
        <SafetyPin className="absolute top-10 right-12 rotate-12 opacity-90 hidden sm:block" size={64} />
        <div className="max-w-7xl mx-auto text-center flex flex-col items-center gap-4 relative">
          <span className="text-[11px] text-white/60 font-mono uppercase tracking-[0.3em]">Get In Touch</span>
          <TapeTitle size="text-5xl sm:text-7xl lg:text-8xl">Contact Management</TapeTitle>
        </div>
      </section>

      <section className="relative bg-cream grain px-4 md:px-8 py-12 md:py-16 overflow-hidden">
        <SafetyPin className="absolute top-8 left-10 -rotate-12 hidden sm:block" size={52} />
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start relative">

        {/* Left Column: Management Direct lines & Map (Col span 5) */}
        <div className="lg:col-span-5 flex flex-col gap-6">

          <div className="p-6 md:p-8 bg-paper border-2 border-ink flex flex-col gap-6">
            <h3 className="display-hd text-ink text-xl sm:text-2xl">Management Directory</h3>

            <div className="flex flex-col gap-4">
              {/* Business Contacts */}
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-brand mt-1" />
                <div>
                  <p className="text-[10px] font-mono text-muted uppercase tracking-widest">Global Bookings</p>
                  <a href="mailto:bookings@shedstar.com" className="text-sm font-semibold text-ink hover:text-brand transition-colors">bookings@shedstar.com</a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-brand mt-1" />
                <div>
                  <p className="text-[10px] font-mono text-muted uppercase tracking-widest">PR & Media Queries</p>
                  <a href="mailto:press@shedstar.com" className="text-sm font-semibold text-ink hover:text-brand transition-colors">press@shedstar.com</a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-brand mt-1" />
                <div>
                  <p className="text-[10px] font-mono text-muted uppercase tracking-widest">Brand Partnerships</p>
                  <a href="mailto:partnerships@shedstar.com" className="text-sm font-semibold text-ink hover:text-brand transition-colors">partnerships@shedstar.com</a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-brand mt-1" />
                <div>
                  <p className="text-[10px] font-mono text-muted uppercase tracking-widest">HQ Business Line</p>
                  <p className="text-sm font-semibold text-ink">+44 (0) 20 7946 0958</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-brand mt-1" />
                <div>
                  <p className="text-[10px] font-mono text-muted uppercase tracking-widest">Head Office</p>
                  <p className="text-sm font-semibold text-ink leading-relaxed">Shedstar Music Group LLC<br />Soho Square, London W1D, UK</p>
                </div>
              </div>
            </div>

          </div>

          {/* Map Section Placeholder */}
          <div className="relative aspect-video overflow-hidden border-2 border-ink bg-cream-dark flex items-center justify-center p-4">
            <div className="absolute inset-0 opacity-30 bg-cover bg-center" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=800&auto=format&fit=crop')` }} />

            <div className="relative z-10 text-center flex flex-col items-center gap-2">
              <MapPin className="w-8 h-8 text-brand animate-bounce" />
              <h4 className="text-sm font-display font-bold text-ink uppercase">Soho Square, London HQ</h4>
              <p className="text-[10px] text-muted font-mono">51.5152° N, 0.1321° W</p>
              <a
                href="https://maps.google.com/?q=Soho+Square,+London"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ink text-[10px] mt-2 !px-4 !py-2"
              >
                Launch Google Maps
              </a>
            </div>
          </div>

        </div>

        {/* Right Column: Direct Message Form (Col span 7) */}
        <div className="lg:col-span-7 select-text">

          <div className="p-6 md:p-8 bg-paper border-2 border-ink flex flex-col gap-6">
            <div>
              <h3 className="display-hd text-ink text-xl sm:text-2xl">Direct Message Group</h3>
              <p className="text-sm text-muted mt-1">Send a direct message for legal licensing, fan inquiries, or feedback.</p>
            </div>

            {status === 'success' ? (
              <div className="py-12 px-6 text-center flex flex-col items-center gap-4 bg-cream border-2 border-ink">
                <div className="w-16 h-16 bg-green-500 text-white border-2 border-ink flex items-center justify-center">
                  <CheckCircle className="w-9 h-9 stroke-[2.5px]" />
                </div>
                <div>
                  <h4 className="display-hd text-ink text-2xl">Message Dispatched!</h4>
                  <p className="text-sm text-muted mt-1">Thank you. Your message has been saved statefully and dispatched successfully.</p>
                </div>
                <button
                  onClick={() => setStatus('idle')}
                  className="btn-ink text-xs"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-muted font-mono uppercase tracking-widest">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Your name"
                      className="px-5 py-3 bg-white border-2 border-ink focus:border-brand text-sm text-ink placeholder-muted outline-none transition-colors"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-muted font-mono uppercase tracking-widest">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="your@email.com"
                      className="px-5 py-3 bg-white border-2 border-ink focus:border-brand text-sm text-ink placeholder-muted outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-muted font-mono uppercase tracking-widest">Subject</label>
                  <input
                    type="text"
                    name="subject"
                    required
                    value={formData.subject}
                    onChange={handleInputChange}
                    placeholder="Licensing, Fan mail, Website feedback"
                    className="px-5 py-3 bg-white border-2 border-ink focus:border-brand text-sm text-ink placeholder-muted outline-none transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-muted font-mono uppercase tracking-widest">Message Details</label>
                  <textarea
                    name="message"
                    required
                    rows={5}
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Write details of your message here..."
                    className="px-5 py-3 bg-white border-2 border-ink focus:border-brand text-sm text-ink placeholder-muted outline-none transition-colors resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={status === 'submitting'}
                  className="btn-brand w-full text-sm active:scale-95"
                >
                  {status === 'submitting' ? 'Transmitting...' : (
                    <>
                      <Send className="w-4 h-4" /> Send Direct Message
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
