/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { TapeTitle } from './Decor';

export default function PrivacyPolicySection() {
  return (
    <div className="w-full text-ink">
      <section className="relative bg-ink grain text-white px-4 md:px-8 py-16 md:py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <span className="text-[11px] text-white/60 font-mono uppercase tracking-[0.3em] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-brand" /> Your data, clearly explained
          </span>
          <TapeTitle size="text-5xl sm:text-7xl lg:text-8xl" className="mt-4">Privacy Policy</TapeTitle>
          <p className="mt-5 max-w-2xl text-white/75 text-sm md:text-base leading-relaxed">
            How Shedstar Music Group collects, uses, stores, and protects information shared through this website.
          </p>
          <p className="mt-6 text-[10px] font-mono uppercase tracking-widest text-white/55">Last updated: September 2026</p>
        </div>
      </section>

      <section className="bg-cream px-4 md:px-8 py-12 md:py-16">
        <article className="max-w-4xl mx-auto bg-paper border-2 border-ink p-6 md:p-10 flex flex-col gap-8 text-sm text-ink/75 leading-relaxed">
          <PolicyBlock title="1. Information we collect">
            We collect information you choose to submit, including your name, email address, message details, booking information, newsletter subscription, and purchase details. We also receive basic technical information such as browser type, device information, pages visited, and approximate usage activity needed to operate and secure the site.
          </PolicyBlock>
          <PolicyBlock title="2. How we use information">
            Shedstar uses submitted information to respond to inquiries, process bookings and purchases, deliver digital products, send requested updates, improve the website, prevent abuse, and maintain administrative records. We do not sell personal information.
          </PolicyBlock>
          <PolicyBlock title="3. Payments and downloads">
            Payment details are handled by our payment processor. Shedstar does not store complete card numbers on this website. Digital downloads are made available after payment confirmation and may be associated with the order used to purchase them.
          </PolicyBlock>
          <PolicyBlock title="4. Cookies and local storage">
            The site may use browser storage for practical features such as preserving a shopping cart or admin session. The site may also use essential cookies or similar technologies required by hosting, security, payment, or analytics services.
          </PolicyBlock>
          <PolicyBlock title="5. Your choices">
            You may ask what personal information we hold, request correction or deletion where applicable, unsubscribe from marketing messages, or ask questions about this policy by contacting legal@shedstar.com.
          </PolicyBlock>
          <PolicyBlock title="6. Contact">
            For privacy requests, copyright concerns, or legal questions, email legal@shedstar.com. We may need to verify your identity before completing a request.
          </PolicyBlock>
        </article>
      </section>
    </div>
  );
}

function PolicyBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t-2 border-ink pt-5 first:border-t-0 first:pt-0">
      <h2 className="font-display font-black uppercase tracking-wide text-ink text-base mb-2">{title}</h2>
      <p>{children}</p>
    </section>
  );
}
