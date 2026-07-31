/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Shared collage / punk-zine decoration used across the Shedstar site:
 * a blue torn "tape band" section title and a decorative safety-pin graphic.
 */

import React from 'react';

/** Big poster section title sitting on a blue torn painted-tape band. */
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
    <div className={`tape-band ${className}`}>
      <h2 className={`poster-title text-white ${size}`}>{children}</h2>
    </div>
  );
}

/**
 * Big torn blue construction-paper panel — the Teddy Swims "MUSIC" block.
 * Two stacked torn layers (a slightly larger cream layer behind the blue)
 * create a ragged white paper fringe around the edge.
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
        style={{ clipPath: torn, background: '#f4f2ec' }}
        aria-hidden="true"
      />
      {/* blue denim paper with print grain */}
      <div
        className="absolute inset-0 grain"
        style={{
          clipPath: torn,
          background: 'linear-gradient(160deg,#2f7fd0,#1f74c8 55%,#175aa0)',
        }}
        aria-hidden="true"
      />
      <div className="relative">{children}</div>
    </div>
  );
}

/** Decorative safety pin (blue), an accent scattered around the collage. */
export function SafetyPin({ className = '', size = 44 }: { className?: string; size?: number }) {
  return (
    <svg
      viewBox="0 0 100 40"
      width={size}
      height={size * 0.4}
      className={className}
      fill="none"
      stroke="#1f74c8"
      strokeWidth={3}
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M12 26 C4 22 4 12 14 10 L82 4" />
      <path d="M12 26 C22 30 30 24 30 16 L30 10" />
      <path d="M14 10 L86 30 C94 33 96 22 88 20" />
      <circle cx="12" cy="26" r="4" fill="#1f74c8" stroke="none" />
    </svg>
  );
}
