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
 * Solid blue content panel. Was a ragged torn-paper block with a cream fringe
 * and a slight rotation; now a plain rectangle, matching the reference's flat
 * colour sections.
 */
export function TornPanel({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`relative bg-brand ${className}`}>
      <div className="relative">{children}</div>
    </div>
  );
}

/**
 * Formerly a decorative safety-pin graphic scattered around the collage.
 * The reference has no such ornament, so this renders nothing. Kept as a
 * no-op rather than deleted so the ~12 call sites across the site stay valid
 * and the accent can be restored in one place if it is ever wanted back.
 */
export function SafetyPin(_props: { className?: string; size?: number }) {
  return null;
}
