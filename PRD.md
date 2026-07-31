# Product Requirements Document — Shedstar Official Website

**Product:** Shedstar — Official Artist Website & Store
**Owner:** Shedstar (global musician & brand)
**Author:** Product / Engineering
**Last revised:** July 13, 2026
**Status:** Draft v1
**Design reference:** [teddyswims.com](https://www.teddyswims.com/) — bold, dark, image-forward artist site with big hero visuals, a prominent tour-dates list, a clean merch grid, and email capture.

---

## 1. Overview

Shedstar is a global musician building a direct-to-fan digital home. Today his audience is spread across streaming platforms and social media, with no single owned destination that tells his story, sells his music and merch, lists his shows, and captures booking requests.

This website is that home: a premium, mobile-first, single-page experience where a fan can land, hear the music within seconds, learn the brand, buy a shirt, see where the next show is, and send a booking inquiry — all in one flow. A private admin dashboard lets the Shedstar team manage every piece of content without touching code.

**One-line vision:** *The official global home of Shedstar — press play, feel the brand, catch the tour, wear the merch, book the show.*

---

## 2. Goals & Success Metrics

### Business goals
| Goal | Why it matters |
|------|----------------|
| Own the fan relationship | A destination Shedstar controls, independent of any single streaming platform or social network. |
| Convert attention into revenue | Sell branded shirts, e-books, and drive ticket clicks. |
| Generate qualified concert bookings | A clean pipeline for promoters and event organizers to reach the team. |
| Grow an owned audience | Newsletter / fan-club subscribers Shedstar can reach directly. |

### Success metrics (first 90 days post-launch)
- **Engagement:** ≥ 40% of visitors press play on a track; avg. session ≥ 2 min.
- **Commerce:** Merch conversion ≥ 1.5% of store visitors; cart abandonment tracked and reported.
- **Bookings:** ≥ 10 qualified booking inquiries / month.
- **Audience:** ≥ 500 newsletter subscribers in 90 days.
- **Performance:** Lighthouse Performance ≥ 85 on mobile; Largest Contentful Paint < 2.5s.

---

## 3. Target Audience & Personas

1. **The Fan (primary)** — discovers Shedstar via a social clip or a friend. Wants to hear more music immediately, follow the story, and buy a shirt. Mostly mobile.
2. **The Promoter / Booker** — a festival, club, or corporate event organizer evaluating Shedstar for a show. Wants credibility signals (tour history, brand, media) and a fast way to submit a booking with budget and date.
3. **The Superfan** — repeat visitor who wants tour dates for their city, exclusive drops, and the newsletter/fan club.
4. **The Admin (Shedstar team)** — non-technical. Needs to add songs, videos, shirts, tour dates, and blog posts, and to read booking + contact messages, from a simple dashboard.

---

## 4. Scope

### In scope (v1)
Maps the requested features to concrete site sections:

| You asked for | Delivered as |
|---------------|--------------|
| **Profile** | Home hero + persistent Navbar identity |
| **Everything about me & my brand** | About section (bio, story, brand values, photo gallery, press) |
| **Music Audio** | Music section + global sticky audio player |
| **Your branded shirts** | Merchandise store with cart & checkout |
| **My tour dates** | Tour section (upcoming/past, ticket links, sold-out states) |
| **How to contact me for concerts** | Booking section (structured promoter form) + Contact section (general) |

Plus scaffolded extras already present in the codebase: **Videos**, **News/Blog**, **E-Books store**, **Fan Club / newsletter**, and an **Admin dashboard**.

### Out of scope (v1 / future)
- Real payment processing (v1 uses a simulated checkout; Stripe/PayPal is a v2 fast-follow).
- Native mobile apps.
- User accounts / fan login (fan club is email-capture only in v1).
- Live streaming / ticketing engine (we link out to third-party ticket providers).
- Multi-language / i18n.

---

## 5. Design & Brand Direction

**Aesthetic:** Premium, cinematic, dark-luxury — matching the existing scaffold and the Teddy Swims reference.

- **Palette:** `luxury-black` background, near-black `luxury-dark` surfaces, **gold** as the single accent (CTAs, highlights, selection). White + gray text hierarchy. Restraint — gold is earned, not everywhere.
- **Typography:** A bold **display** face for headings (uppercase, wide tracking) + clean **sans** for body + a **mono** accent for labels/dates/metadata.
- **Imagery:** Large, high-contrast hero photography of the artist. Full-bleed, image-forward.
- **Motion:** Tasteful entrance/scroll animations via `motion` (already a dependency). Smooth scroll-to-section on nav.
- **Feel:** Cohesive "one system" — every section reads as the same brand. Dark by default.

**Responsiveness:** Mobile-first. All layouts fluid; images `max-width:100%`; wide content (tour tables, galleries) scrolls inside its own container — the page body never scrolls horizontally.

**Accessibility:** WCAG AA color contrast on the dark theme, keyboard-navigable, focus states, alt text on all imagery, captions/labels on media controls.

---

## 6. Information Architecture

Single-page app with tab/section navigation (matches `App.tsx`). Sections:

```
Home  ·  About  ·  Music  ·  Videos  ·  Tour  ·  Merch  ·  E-Books  ·  News  ·  Booking  ·  Contact  ·  Fan Club
                                                                          ( + hidden /admin )
```

- **Persistent Navbar** — brand identity, section nav, cart icon (with count), admin state.
- **Global sticky Audio Player** — visible across all sections once a track is chosen; play/pause, next/prev, track info.
- **Persistent Footer** — quick nav, social links, newsletter, legal (Privacy / Terms modals — already implemented).

---

## 7. Feature Requirements

### 7.1 Home / Profile
- Full-bleed hero: artist image, name/tagline, primary CTAs ("Listen Now", "Tour Dates", "Shop").
- Featured content pulled live: latest/featured song (one-tap play), next tour stop, featured shirt.
- Sets the tone in the first 3 seconds; press-play should be the easiest action on the page.

### 7.2 About — "Everything about me & my brand"
- Long-form bio and origin story.
- Brand statement / values.
- Photo **gallery** (categorized: concert, studio, travel, lifestyle, awards, fans) with lightbox.
- Optional press / accolades strip.

### 7.3 Music Audio
- Grid/list of songs grouped by **album / single / EP**, each with cover art, title, album, duration, release date.
- Click to play in the **global sticky player**; playlist with next/prev looping.
- Per-song **streaming links** (Spotify, Apple Music, Audiomack, Boomplay, YouTube Music).
- **Lyrics** view per track.
- Play counts displayed (social proof).

### 7.4 Videos
- Embedded YouTube grid, filterable by category (music-video, live, behind-the-scenes, studio, interview).
- Thumbnail, title, views, duration.

### 7.5 Tour — "My tour dates"
- List of dates: country, city, venue, date, time.
- **Ticket link** button per date; **Sold Out** state disables it.
- Upcoming vs. past separation; optional map (lat/long already in data model).
- Empty state when no dates announced ("New dates dropping soon — join the newsletter").

### 7.6 Merchandise — "Your branded shirts"
- Product grid: image gallery per item, title, price, **New**/**Featured** badges.
- Product detail: **size** and **color** selectors, stock awareness, quantity.
- **Cart** (persisted to `localStorage`): add / remove / update qty, slide-over cart drawer, running total.
- **Checkout** (v1 simulated): shipping details form → order confirmation. Payment integration flagged for v2.

### 7.7 E-Books (scaffolded)
- Digital products store: cover, description, author, pages, price, file size; add-to-cart; delivered as download on purchase (simulated in v1).

### 7.8 News / Blog
- Posts with cover, title, summary, full content, author, date, read time, category.
- List → detail reading view.

### 7.9 Booking — "How to contact me for concerts"
- Structured promoter form: name, company, event name, country, city, **budget**, event date, email, phone, message, optional proposal file attachment.
- Submits to server; appears in Admin as a **Booking** with status `pending → accepted / rejected`.
- Clear expectation-setting copy (response time; inquiry ≠ binding contract).

### 7.10 Contact (general)
- Simple form: name, email, subject, message → stored as a **ContactMessage** for the team.
- Social links and general email.

### 7.11 Fan Club / Newsletter
- Email capture → **Subscriber** record (`active / unsubscribed`).
- Value proposition: early drops, exclusive content, presale access.

### 7.12 Admin Dashboard (hidden `/admin`)
- Session-gated login (`sessionStorage` flag in v1; must move to a real server-side check before public launch — see §9).
- **Dashboard stats:** page views, music plays, merch + e-book sales, ad revenue, total revenue, booking requests, active subscribers, plus charts (sales by product, plays by song, monthly revenue).
- **CRUD management** for: songs, videos, products, tours, blog posts, gallery, e-books.
- **Inbox views:** bookings (with accept/reject), contact messages (read/unread), subscribers.
- Data persists to a JSON file DB (`data/db.json`) via the Express API.

---

## 8. Technical Requirements

**Stack (already scaffolded):**
- **Frontend:** React 19 + TypeScript, Vite 6, Tailwind CSS v4, `motion` for animation, `lucide-react` icons.
- **Backend:** Express (Node), serving a REST API and the built SPA.
- **Data:** File-based JSON DB (`data/db.json`) seeded on first run. *(v2 candidate: move to a hosted DB — SQLite/Postgres — as content and orders grow.)*
- **Build/deploy:** `vite build` for client, `esbuild` bundle for server; `npm start` runs the Node server.

**API surface (existing/expected):**
`/api/songs`, `/api/videos`, `/api/products`, `/api/tours`, `/api/blog`, `/api/gallery`, `/api/ebooks` — public reads.
`/api/bookings`, `/api/contacts`, `/api/subscribers`, `/api/admin/stats` — admin reads; POST endpoints for booking/contact/newsletter submissions and admin CRUD.

**Non-functional requirements:**
- **Performance:** Lighthouse ≥ 85 mobile; lazy-load images and heavy sections; optimized/responsive images.
- **SEO & sharing:** Meta title/description, Open Graph + Twitter cards (see `metadata.json`), sitemap, semantic headings.
- **Analytics:** Track page views, plays, add-to-cart, checkout, booking submits.
- **Reliability:** Graceful empty/error states for every data-driven section; API failures never break the page.
- **Browser support:** Latest Chrome, Safari, Firefox, Edge; iOS + Android mobile browsers.

---

## 9. Security & Privacy

- **Admin auth (blocker for public launch):** the v1 `sessionStorage`-only gate is **not secure** — admin API routes must enforce real server-side authentication (password/token) before go-live. *(Flagged as a launch-blocking hardening task.)*
- **Payments:** No real card data stored on the server (v1 is simulated; v2 delegates to a PCI-compliant provider like Stripe).
- **PII:** Booking, contact, and subscriber data stored server-side; provide unsubscribe; document handling in the Privacy policy (modal already implemented).
- **Legal:** Privacy Policy + Terms of Service accessible from the footer (implemented as modals).
- **Input validation:** Validate and sanitize all form submissions server-side; rate-limit public POST endpoints (booking/contact/newsletter) to prevent spam.

---

## 10. Milestones & Phasing

| Phase | Scope | Definition of done |
|-------|-------|--------------------|
| **M1 — Foundation** | Navbar, Footer, global Audio Player, Home hero, routing, design system (colors/type) | Site shell navigable on mobile + desktop; a track plays end-to-end |
| **M2 — Content core** | About + gallery, Music, Videos, Tour | All content-read sections live from API with real seed data |
| **M3 — Commerce** | Merch store, cart, simulated checkout, E-Books | Fan can add a shirt, checkout (simulated), see confirmation |
| **M4 — Pipelines** | Booking form, Contact, Fan Club capture | Submissions persist and appear in Admin |
| **M5 — Admin** | Dashboard stats + full CRUD + inboxes | Team can manage all content without code |
| **M6 — Hardening & launch** | Real admin auth, SEO/OG, analytics, performance pass, a11y pass | Launch checklist green; §9 blockers closed |

*(v2 fast-follow: real payments, hosted DB, fan accounts.)*

---

## 11. Open Questions

1. **Domain & hosting** — confirmed domain (e.g. shedstar.com) and hosting target (Node host / VPS / platform)?
2. **Payments in v1** — is simulated checkout acceptable for launch, or is real Stripe integration a launch requirement?
3. **Brand assets** — do we have final logo, brand fonts, and high-res artist photography, or should design produce placeholders?
4. **Ticketing** — which provider(s) do tour "Buy Tickets" links point to?
5. **Content ownership** — who on the Shedstar team owns ongoing admin/content updates post-launch?
6. **Ads** — the data model includes ad units / AdSense config. Is on-site advertising in scope for v1, or deferred?
7. **Email** — what service sends newsletter/booking confirmation emails (or is that manual in v1)?

---

*Sources / reference: [teddyswims.com](https://www.teddyswims.com/) · [Teddy Swims — Wikipedia](https://en.wikipedia.org/wiki/Teddy_Swims)*
