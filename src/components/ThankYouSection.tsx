/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ArrowLeft, CheckCircle, Home, Mail } from 'lucide-react';

interface ThankYouSectionProps {
  setActiveTab: (tab: string) => void;
}

export default function ThankYouSection({ setActiveTab }: ThankYouSectionProps) {
  return (
    <div className="min-h-[70dvh] bg-cream px-4 md:px-8 py-16 md:py-24 flex items-center">
      <section className="max-w-3xl mx-auto w-full bg-paper border-2 border-ink p-8 md:p-14 text-center shadow-[8px_8px_0_rgba(31,116,189,0.35)]">
        <div className="mx-auto w-16 h-16 bg-brand text-white border-2 border-ink flex items-center justify-center">
          <CheckCircle className="w-9 h-9" />
        </div>
        <p className="mt-7 text-[11px] text-brand font-mono uppercase tracking-[0.3em]">Message received</p>
        <h1 className="poster-title text-ink text-5xl sm:text-7xl mt-3">Thank You</h1>
        <p className="max-w-xl mx-auto mt-5 text-sm md:text-base text-muted leading-relaxed">
          Your message is with the Shedstar team. We will review it and reply through the email address you provided.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
          <button onClick={() => setActiveTab('home')} className="btn-brand text-xs inline-flex items-center justify-center gap-2">
            <Home className="w-4 h-4" /> Back Home
          </button>
          <button onClick={() => setActiveTab('contact')} className="btn-ink text-xs inline-flex items-center justify-center gap-2">
            <Mail className="w-4 h-4" /> Contact Again
          </button>
        </div>
        <button onClick={() => setActiveTab('news')} className="mt-7 text-xs font-mono uppercase tracking-widest text-muted hover:text-brand inline-flex items-center gap-2">
          <ArrowLeft className="w-3.5 h-3.5" /> Explore Shedstar
        </button>
      </section>
    </div>
  );
}
