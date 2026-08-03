/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Section title and panel primitives.
 *
 * These were collage / punk-zine decorations — a torn painted-tape band, a
 * ragged construction-paper panel and a safety-pin graphic. The reference site
 * has none of that: its sections are plain centred titles on flat backgrounds.
 * The decoration has been removed here rather than at each of the ~20 call
 * sites, so every page flattens consistently and it stays easy to restore.
 *
 * The solid blue backing is deliberately kept. These titles are white, and they
 * sit on backgrounds ranging from near-black to pale grey across the site; the
 * band is what guarantees contrast. The home page, where each background is
 * known, uses plain headings instead and matches the reference exactly.
 */

import React from 'react';

/** Big poster section title on a solid blue band. */
export function TapeTitle({
  children,
  className = '',
  size = 'text-5xl sm:text-7xl md:text-8xl',
}: {
  children: React.ReactNode;
  className?: string;
  size?: string;
}) {
  return (
    <div className={`inline-block bg-brand px-[1.1em] py-[0.3em] section-title-band ${className}`}>
      <h2 className={`poster-title section-title text-white ${size}`}>{children}</h2>
    </div>
  );
}

/**
 * Torn blue construction-paper panel — the reference's MUSIC block. Two stacked
 * torn layers (a slightly larger cream layer behind the blue) give the ragged
 * paper fringe around the edge.
 *
 * Restored after being flattened: the reference's torn edge is drawn with
 * background imagery rather than a clip-path, so reading its stylesheet alone
 * made the panel look like a plain rectangle. The screenshots show otherwise.
 */
export function TornPanel({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  // Ragged rectangle silhouette — jagged top & bottom edges, lightly nibbled sides.
  const torn =
    'polygon(0% 5%,4% 2%,9% 5%,14% 1%,20% 5%,26% 2%,32% 5%,38% 1%,44% 5%,50% 2%,56% 5%,62% 1%,68% 5%,74% 2%,80% 5%,86% 1%,92% 5%,97% 2%,100% 5%,99% 30%,100% 55%,99% 80%,100% 95%,96% 98%,91% 95%,85% 99%,79% 95%,73% 98%,67% 95%,61% 99%,55% 95%,49% 98%,43% 95%,37% 99%,31% 95%,25% 98%,19% 95%,13% 99%,8% 95%,3% 98%,0% 95%,1% 70%,0% 45%,1% 20%)';
  return (
    <div className={`relative -rotate-[0.6deg] ${className}`}>
      {/* cream torn fringe (slightly larger so it peeks out as a white paper edge) */}
      <div
        className="absolute -inset-2"
        style={{ clipPath: torn, background: '#f1f0ec' }}
        aria-hidden="true"
      />
      {/* blue denim paper with print grain */}
      <div
        className="absolute inset-0 grain"
        style={{
          clipPath: torn,
          background: 'linear-gradient(160deg,#2f80c9,#1f74bd 55%,#17588f)',
        }}
        aria-hidden="true"
      />
      <div className="relative">{children}</div>
    </div>
  );
}

/**
 * Decorative safety pin, an accent scattered around the collage. Restored —
 * the walkthrough video shows one between the Videos and Merch sections, so
 * removing it was wrong.
 */
export function SafetyPin({ className = '', size = 44 }: { className?: string; size?: number }) {
  return (
    <svg
      viewBox="0 0 100 40"
      width={size}
      height={size * 0.4}
      className={className}
      fill="none"
      stroke="#1f74bd"
      strokeWidth={3}
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M12 26 C4 22 4 12 14 10 L82 4" />
      <path d="M12 26 C22 30 30 24 30 16 L30 10" />
      <path d="M14 10 L86 30 C94 33 96 22 88 20" />
      <circle cx="12" cy="26" r="4" fill="#1f74bd" stroke="none" />
    </svg>
  );
}
