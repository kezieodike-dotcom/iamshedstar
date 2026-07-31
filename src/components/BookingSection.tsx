/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { Calendar, Mail, Upload, CheckCircle, AlertCircle, Sparkles, DollarSign, Briefcase, Phone } from 'lucide-react';
import { TapeTitle, SafetyPin } from './Decor';

export default function BookingSection() {
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    eventName: '',
    country: '',
    city: '',
    budget: '',
    eventDate: '',
    email: '',
    phone: '',
    message: '',
  });

  const [proposalFile, setProposalFile] = useState<File | null>(null);
  const [proposalFileName, setProposalFileName] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setProposalFile(file);
      setProposalFileName(file.name);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProposalFile(file);
      setProposalFileName(file.name);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitStatus('submitting');

    try {
      const payload = {
        ...formData,
        budget: parseFloat(formData.budget) || 0,
        proposalFileName: proposalFileName || 'No attachment'
      };

      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setTimeout(() => {
          setSubmitStatus('success');
          // Reset form
          setFormData({
            name: '',
            company: '',
            eventName: '',
            country: '',
            city: '',
            budget: '',
            eventDate: '',
            email: '',
            phone: '',
            message: '',
          });
          setProposalFile(null);
          setProposalFileName('');
        }, 1500);
      } else {
        setSubmitStatus('error');
      }
    } catch {
      setSubmitStatus('error');
    }
  };

  return (
    <div className="w-full text-ink select-none">

      {/* HERO BAND */}
      <section className="relative bg-ink grain text-white px-4 md:px-8 py-16 md:py-24 overflow-hidden">
        <SafetyPin className="absolute top-10 right-12 rotate-12 opacity-90 hidden sm:block" size={64} />
        <div className="max-w-4xl mx-auto text-center flex flex-col items-center gap-4 relative">
          <span className="inline-flex items-center gap-2 bg-brand text-white font-display font-bold text-[11px] uppercase tracking-widest px-3 py-1 border-2 border-white">
            <Briefcase className="w-4 h-4" />
            Professional Engagement
          </span>
          <TapeTitle size="text-5xl sm:text-7xl lg:text-8xl">Book Shedstar</TapeTitle>
          <p className="text-sm text-white/70 max-w-md">Promoters, event organizers, and brands can submit professional booking inquiries and request festival headlining slots.</p>
        </div>
      </section>

      <section className="relative bg-cream grain px-4 md:px-8 py-12 md:py-16 overflow-hidden">
        <SafetyPin className="absolute top-10 left-10 -rotate-12 hidden sm:block" size={52} />
        <div className="max-w-4xl mx-auto relative">

      {submitStatus === 'success' ? (
        <div className="p-8 md:p-12 bg-paper border-2 border-ink text-center flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-green-500 text-white border-2 border-ink flex items-center justify-center">
            <CheckCircle className="w-9 h-9 stroke-[2.5px]" />
          </div>
          <div>
            <h3 className="display-hd text-ink text-2xl sm:text-3xl">Inquiry Submitted Successfully!</h3>
            <p className="text-xs text-brand mt-2 font-mono uppercase tracking-widest">Reference Ticket: #BK-{Date.now().toString().slice(-6)}</p>
          </div>
          <p className="text-sm text-muted leading-relaxed max-w-md">
            Thank you for booking Shedstar! We have triggered an automatic email notification to Shedstar\'s global business management team. A representative will evaluate your venue, dates, budget requirements, and reach out to you within 48 business hours.
          </p>
          <button
            onClick={() => setSubmitStatus('idle')}
            className="btn-ink text-xs mt-2"
          >
            Submit Another Request
          </button>
        </div>
      ) : (
        <form onSubmit={handleFormSubmit} className="p-6 md:p-8 bg-paper border-2 border-ink flex flex-col gap-6 select-text">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Contact Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] text-muted font-mono uppercase tracking-widest">Your Full Name *</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Jane Doe"
                className="px-5 py-3 bg-white border-2 border-ink focus:border-brand text-sm text-ink placeholder-muted outline-none transition-colors"
              />
            </div>

            {/* Company / Agency */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] text-muted font-mono uppercase tracking-widest">Company / Agency *</label>
              <input
                type="text"
                name="company"
                required
                value={formData.company}
                onChange={handleInputChange}
                placeholder="Live Nation / AEG"
                className="px-5 py-3 bg-white border-2 border-ink focus:border-brand text-sm text-ink placeholder-muted outline-none transition-colors"
              />
            </div>

            {/* Event Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] text-muted font-mono uppercase tracking-widest">Event Name *</label>
              <input
                type="text"
                name="eventName"
                required
                value={formData.eventName}
                onChange={handleInputChange}
                placeholder="Coachella Headline Slot"
                className="px-5 py-3 bg-white border-2 border-ink focus:border-brand text-sm text-ink placeholder-muted outline-none transition-colors"
              />
            </div>

            {/* Event Date */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] text-muted font-mono uppercase tracking-widest">Proposed Date *</label>
              <div className="relative">
                <input
                  type="date"
                  name="eventDate"
                  required
                  value={formData.eventDate}
                  onChange={handleInputChange}
                  className="w-full px-5 py-3 bg-white border-2 border-ink focus:border-brand text-sm text-ink placeholder-muted outline-none transition-colors"
                />
              </div>
            </div>

            {/* Country */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] text-muted font-mono uppercase tracking-widest">Country *</label>
              <input
                type="text"
                name="country"
                required
                value={formData.country}
                onChange={handleInputChange}
                placeholder="United States"
                className="px-5 py-3 bg-white border-2 border-ink focus:border-brand text-sm text-ink placeholder-muted outline-none transition-colors"
              />
            </div>

            {/* City */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] text-muted font-mono uppercase tracking-widest">City *</label>
              <input
                type="text"
                name="city"
                required
                value={formData.city}
                onChange={handleInputChange}
                placeholder="Indio, California"
                className="px-5 py-3 bg-white border-2 border-ink focus:border-brand text-sm text-ink placeholder-muted outline-none transition-colors"
              />
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] text-muted font-mono uppercase tracking-widest">Business Email *</label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                placeholder="booking@livenation.com"
                className="px-5 py-3 bg-white border-2 border-ink focus:border-brand text-sm text-ink placeholder-muted outline-none transition-colors"
              />
            </div>

            {/* Phone Number */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] text-muted font-mono uppercase tracking-widest">Phone Number *</label>
              <input
                type="tel"
                name="phone"
                required
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="+1 (212) 555-0188"
                className="px-5 py-3 bg-white border-2 border-ink focus:border-brand text-sm text-ink placeholder-muted outline-none transition-colors"
              />
            </div>

            {/* Budget */}
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-[11px] text-muted font-mono uppercase tracking-widest">Proposed Budget ($ USD) *</label>
              <div className="relative">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-brand font-mono text-sm">$</span>
                <input
                  type="number"
                  name="budget"
                  required
                  value={formData.budget}
                  onChange={handleInputChange}
                  placeholder="125000"
                  className="w-full pl-9 pr-5 py-3 bg-white border-2 border-ink focus:border-brand text-sm text-ink placeholder-muted outline-none transition-colors"
                />
              </div>
            </div>

          </div>

          {/* Textarea message details */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] text-muted font-mono uppercase tracking-widest">Event Details & Technical Requirements *</label>
            <textarea
              name="message"
              required
              rows={4}
              value={formData.message}
              onChange={handleInputChange}
              placeholder="Describe the venue capacity, security detail, ticketing arrangements, backline rider options, and any direct brand endorsement requirements."
              className="px-5 py-3 bg-white border-2 border-ink focus:border-brand text-sm text-ink placeholder-muted outline-none transition-colors resize-none"
            />
          </div>

          {/* Drag & Drop File Upload Area */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] text-muted font-mono uppercase tracking-widest">Upload Event Proposal / Pitch Deck (PDF/DOC)</label>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors text-center select-none ${
                isDragging
                  ? 'border-brand bg-brand-soft'
                  : proposalFileName
                    ? 'border-green-500 bg-green-50'
                    : 'border-ink hover:border-brand bg-cream'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.ppt,.pptx"
                onChange={handleFileChange}
                className="hidden"
              />
              <Upload className={`w-8 h-8 ${proposalFileName ? 'text-green-500' : 'text-muted'}`} />

              {proposalFileName ? (
                <div className="flex flex-col gap-1">
                  <p className="text-xs font-mono text-green-600 font-bold">✓ Attached Proposal Deck:</p>
                  <p className="text-xs text-ink font-semibold">{proposalFileName}</p>
                  <p className="text-[10px] text-muted">Click or drag here to replace</p>
                </div>
              ) : (
                <div>
                  <p className="text-xs text-ink font-bold">Drag & drop your proposal deck here, or <span className="text-brand underline">browse</span></p>
                  <p className="text-[10px] text-muted mt-1">Supported formats: PDF, DOCX, PPTX (Max 15MB)</p>
                </div>
              )}
            </div>
          </div>

          {submitStatus === 'error' && (
            <p className="text-xs text-red-500 font-mono flex items-center gap-1.5 justify-center mt-2">
              <AlertCircle className="w-4 h-4" /> ❌ Submission error. Please verify budget details or try again.
            </p>
          )}

          <button
            type="submit"
            disabled={submitStatus === 'submitting'}
            className="btn-brand w-full text-sm active:scale-[0.98]"
          >
            {submitStatus === 'submitting' ? (
              'Transmitting Booking Inquiry...'
            ) : (
              <>
                <Sparkles className="w-4.5 h-4.5" /> Submit Booking Request
              </>
            )}
          </button>

        </form>
      )}

        </div>
      </section>

    </div>
  );
}
