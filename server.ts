/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import 'dotenv/config';
import express from 'express';
import path from 'path';
import fs from 'fs';
import Stripe from 'stripe';
import { createServer as createViteServer } from 'vite';
import { Song, Video, Product, Tour, GalleryItem, BlogPost, Booking, ContactMessage, Subscriber, DashboardStats, EBook, AdUnit, AdConfig, Partnership, Order, OrderItem } from './src/types';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// --- Stripe configuration ---
const CURRENCY = (process.env.CURRENCY || 'usd').toLowerCase();
const APP_URL = (process.env.APP_URL || `http://localhost:${PORT}`).replace(/\/$/, '');
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || '';
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';

// A key is "configured" only when it's a real Stripe secret key, not the
// placeholder shipped in .env. Guards every payment route with a clear error.
const stripeConfigured = STRIPE_SECRET_KEY.startsWith('sk_') && !STRIPE_SECRET_KEY.includes('your_secret_key_here');
const stripe = stripeConfigured ? new Stripe(STRIPE_SECRET_KEY) : null;

if (!stripeConfigured) {
  console.warn('[stripe] STRIPE_SECRET_KEY not set — checkout endpoints will return a "not configured" error until you add real test keys to .env');
}

// Stripe webhook needs the raw request body to verify the signature, so it is
// registered BEFORE express.json() (which would otherwise consume the body).
app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  if (!stripe) {
    return res.status(503).json({ error: 'Stripe not configured' });
  }

  let event: Stripe.Event;
  try {
    if (STRIPE_WEBHOOK_SECRET && !STRIPE_WEBHOOK_SECRET.includes('your_webhook_secret_here')) {
      const signature = req.headers['stripe-signature'] as string;
      event = stripe.webhooks.constructEvent(req.body, signature, STRIPE_WEBHOOK_SECRET);
    } else {
      // No signing secret configured (e.g. local dev) — parse without verifying.
      event = JSON.parse(req.body.toString('utf-8')) as Stripe.Event;
    }
  } catch (err: any) {
    console.error('[stripe] webhook signature verification failed:', err.message);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    try {
      fulfillOrder(session.id, session.metadata?.orderId, session.customer_details?.email || undefined);
    } catch (err) {
      console.error('[stripe] fulfillment error from webhook:', err);
    }
  }

  res.json({ received: true });
});

app.use(express.json());

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Builds a complete database from the shipped defaults. Pure — touches no
// filesystem — so it doubles as the in-memory fallback when disk is unusable.
function buildDefaultDb() {
  const initialSongs: Song[] = [
    {
      id: 'song-1',
      title: 'Shedding Light',
      album: 'Starborn',
      duration: '3:42',
      coverUrl: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=600&auto=format&fit=crop',
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      lyrics: "[Verse 1]\nDarkness fading, new dawn rising\nI see the spark in your eyes, mesmerizing\nWe came from the shadows, now we glow\nFinding a rhythm only we could know...\n\n[Chorus]\nWe're shedding light, we're breaking through\nNo longer hiding what is true\nGold in our veins, stars in our head\nFollow the path where we are led\nShedding light, oh yeah, shedding light!\n\n[Verse 2]\nHeavy steps on a gilded street\nBut we dance to our own heartbeat\nUnder the neon, wild and free\nThis is the way it's meant to be...",
      releaseDate: '2026-05-12',
      category: 'album',
      streamingLinks: {
        spotify: 'https://spotify.com',
        appleMusic: 'https://music.apple.com',
        audiomack: 'https://audiomack.com',
        boomplay: 'https://boomplay.com',
        youtubeMusic: 'https://music.youtube.com'
      },
      playCount: 14250000
    },
    {
      id: 'song-2',
      title: 'Gold Dust',
      album: 'Starborn',
      duration: '3:15',
      coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=600&auto=format&fit=crop',
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
      lyrics: "[Chorus]\nSprinkle that gold dust on my crown\nWe built this empire from the ground\nThey tried to lock us out the gates\nNow we're the ones who write our fates...\n\n[Verse 1]\nLate nights in London, early morning flights\nTrading the silence for the stadium lights\nMy people with me, we don't walk alone\nShedstar global, we just claim the throne!",
      releaseDate: '2026-06-01',
      category: 'single',
      streamingLinks: {
        spotify: 'https://spotify.com',
        appleMusic: 'https://music.apple.com',
        audiomack: 'https://audiomack.com'
      },
      playCount: 8520000
    },
    {
      id: 'song-3',
      title: 'Purple Dreams',
      album: 'Starborn',
      duration: '4:02',
      coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=600&auto=format&fit=crop',
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
      lyrics: "[Verse 1]\nVelvet seats and vintage wine\nLost inside this space and time\nYou whisper secrets in the dark\nFanning a slow and steady spark...\n\n[Chorus]\nIn these purple dreams, we fly so high\nTouch the ceiling of the velvet sky\nNo waking up, just let it roll\nDeep purple rhythm taking control...",
      releaseDate: '2026-04-18',
      category: 'album',
      streamingLinks: {
        spotify: 'https://spotify.com',
        appleMusic: 'https://music.apple.com',
        boomplay: 'https://boomplay.com',
        youtubeMusic: 'https://music.youtube.com'
      },
      playCount: 11130000
    },
    {
      id: 'song-4',
      title: 'Midnight Cruiser',
      album: 'Shedding Light EP',
      duration: '2:58',
      coverUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=600&auto=format&fit=crop',
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
      lyrics: "[Chorus]\nMidnight cruiser, where you gonna go?\nFast lane speed, but we take it slow\nCity lights reflecting in your eyes\nNo more games and no more lies...",
      releaseDate: '2025-11-05',
      category: 'ep',
      streamingLinks: {
        spotify: 'https://spotify.com',
        appleMusic: 'https://music.apple.com'
      },
      playCount: 5410000
    },
    {
      id: 'song-5',
      title: 'Vibe Check',
      album: 'Shedding Light EP',
      duration: '3:30',
      coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=600&auto=format&fit=crop',
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
      lyrics: "[Verse 1]\nEnter the room, pressure is high\nEverybody looking, I see why\nConfidence level past the roof\nWe don't need to argue, we are the proof!\n\n[Chorus]\nThis is a vibe check, hold it down\nShedstar in your city, wear the crown!",
      releaseDate: '2025-12-25',
      category: 'ep',
      streamingLinks: {
        spotify: 'https://spotify.com',
        audiomack: 'https://audiomack.com',
        boomplay: 'https://boomplay.com'
      },
      playCount: 7900000
    }
  ];

  const initialVideos: Video[] = [
    {
      id: 'video-1',
      title: 'Shedding Light (Official Music Video)',
      category: 'music-video',
      youtubeId: 'dQmw4bUuaYo', // Rickroll as a placeholder that works beautifully
      coverUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=800&auto=format&fit=crop',
      views: '4.8M views',
      duration: '3:50',
      releaseDate: 'May 15, 2026'
    },
    {
      id: 'video-2',
      title: 'Live at O2 Arena London (Highlights)',
      category: 'live',
      youtubeId: 'EngW7tLk6R8', // Another standard YouTube video
      coverUrl: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?q=80&w=800&auto=format&fit=crop',
      views: '1.2M views',
      duration: '12:45',
      releaseDate: 'June 20, 2026'
    },
    {
      id: 'video-3',
      title: 'Gold Dust (Backstage & Studio Sessions)',
      category: 'studio',
      youtubeId: '9bZkp7q19f0',
      coverUrl: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=800&auto=format&fit=crop',
      views: '650K views',
      duration: '5:20',
      releaseDate: 'June 5, 2026'
    },
    {
      id: 'video-4',
      title: 'Shedstar: Global Beats, Deep Roots (Full Interview)',
      category: 'interview',
      youtubeId: 'kJQP7kiw5Fk',
      coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=800&auto=format&fit=crop',
      views: '320K views',
      duration: '24:15',
      releaseDate: 'April 28, 2026'
    }
  ];

  const initialProducts: Product[] = [
    {
      id: 'prod-1',
      title: 'Starborn Vintage Black Tee',
      description: 'Heavyweight 240GSM cotton tee with custom luxury wash. Features Shedstar gold foil typography on front and signature star crest on back. Boxy, modern fit designed for ultimate luxury comfort.',
      price: 35.00,
      images: [
        'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=600&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=600&auto=format&fit=crop'
      ],
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      colors: ['Vintage Black', 'Antique White'],
      category: 'T-Shirts',
      stock: 45,
      isFeatured: true,
      isNew: true
    },
    {
      id: 'prod-2',
      title: 'Royal Velvet Hoodie',
      description: 'Pre-shrunk 450GSM ultra-dense organic cotton fleece in deep royal purple. Exquisite gold metallic thread embroidery. Double-lined spacious hood, no drawstrings for a clean futuristic silhouette.',
      price: 75.00,
      images: [
        'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=600&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=600&auto=format&fit=crop'
      ],
      sizes: ['M', 'L', 'XL', 'XXL'],
      colors: ['Deep Purple', 'Midnight Black'],
      category: 'Hoodies',
      stock: 12,
      isFeatured: true,
      isNew: true
    },
    {
      id: 'prod-3',
      title: 'Shedstar Signature Velvet Cap',
      description: 'Sleek premium velvet 6-panel snapback hat with adjustable clasp. Features precision embroidered Gold Star logo. Satin lining inside to protect hair and provide supreme luxury comfort.',
      price: 28.00,
      images: [
        'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?q=80&w=600&auto=format&fit=crop'
      ],
      sizes: ['One Size'],
      colors: ['Lux Gold & Black', 'Midnight Violet'],
      category: 'Caps',
      stock: 60,
      isFeatured: false
    },
    {
      id: 'prod-4',
      title: 'Electric Blue Acid Sweatshirt',
      description: 'Cozy brushed luxury sweatshirt in custom electric acid-wash blue. Highlighted by large silicone raised text "SHEDSTAR GLOBAL" across the back. Soft ribs and drop shoulder styling.',
      price: 65.00,
      images: [
        'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?q=80&w=600&auto=format&fit=crop'
      ],
      sizes: ['S', 'M', 'L', 'XL'],
      colors: ['Electric Blue', 'Slate Gray'],
      category: 'Sweatshirts',
      stock: 30,
      isNew: true
    },
    {
      id: 'prod-5',
      title: 'Golden Star Engraved Bracelet',
      description: 'High-polish eco-brass heavy link chain with custom magnetic locker closure. Showcases laser-etched Shedstar logo. Packaged in a velvet drawstring jewelry pouch.',
      price: 22.00,
      images: [
        'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=600&auto=format&fit=crop'
      ],
      sizes: ['Medium (19cm)', 'Large (21cm)'],
      colors: ['Pristine Gold'],
      category: 'Bracelets',
      stock: 120,
      isFeatured: true
    },
    {
      id: 'prod-6',
      title: 'Shedding Light Gatefold Vinyl',
      description: 'Exclusive 12" double LP pressed on 180g translucent purple marble vinyl. Delivers studio-master sound warmth. Enclosed in a premium matte-finish gatefold sleeve with a 16-page photography booklet.',
      price: 45.00,
      images: [
        'https://images.unsplash.com/photo-1539628390353-30b998871144?q=80&w=600&auto=format&fit=crop'
      ],
      sizes: ['12" LP'],
      colors: ['Purple Marble'],
      category: 'Albums',
      stock: 25,
      isFeatured: true
    }
  ];

  const initialTours: Tour[] = [
    {
      id: 'tour-1',
      country: 'United Kingdom',
      city: 'London',
      venue: 'O2 Arena',
      date: '2026-07-15',
      time: '20:00',
      ticketLink: 'https://ticketmaster.com',
      isSoldOut: true,
      latitude: 51.503,
      longitude: 0.003
    },
    {
      id: 'tour-2',
      country: 'France',
      city: 'Paris',
      venue: 'Accor Arena',
      date: '2026-07-20',
      time: '20:00',
      ticketLink: 'https://ticketmaster.com',
      isSoldOut: true,
      latitude: 48.839,
      longitude: 2.379
    },
    {
      id: 'tour-3',
      country: 'United States',
      city: 'New York',
      venue: 'Madison Square Garden',
      date: '2026-08-05',
      time: '19:30',
      ticketLink: 'https://ticketmaster.com',
      isSoldOut: false,
      latitude: 40.751,
      longitude: -73.993
    },
    {
      id: 'tour-4',
      country: 'United States',
      city: 'Los Angeles',
      venue: 'Hollywood Bowl',
      date: '2026-08-12',
      time: '19:30',
      ticketLink: 'https://ticketmaster.com',
      isSoldOut: false,
      latitude: 34.112,
      longitude: -118.339
    },
    {
      id: 'tour-5',
      country: 'Japan',
      city: 'Tokyo',
      venue: 'Zepp Haneda',
      date: '2026-09-02',
      time: '18:30',
      ticketLink: 'https://ticketmaster.com',
      isSoldOut: true,
      latitude: 35.549,
      longitude: 139.756
    },
    {
      id: 'tour-6',
      country: 'Nigeria',
      city: 'Lagos',
      venue: 'Eko Convention Center',
      date: '2026-12-18',
      time: '21:00',
      ticketLink: 'https://ticketmaster.com',
      isSoldOut: false,
      latitude: 6.425,
      longitude: 3.424
    }
  ];

  const initialGallery: GalleryItem[] = [
    { id: 'gal-1', url: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?q=80&w=800&auto=format&fit=crop', title: 'Electric crowd at the O2 Arena London', category: 'concert' },
    { id: 'gal-2', url: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=800&auto=format&fit=crop', title: 'Late night analog synth tuning in Lagos', category: 'studio' },
    { id: 'gal-3', url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=800&auto=format&fit=crop', title: 'Backstage energy before jumping on stage', category: 'concert' },
    { id: 'gal-4', url: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=800&auto=format&fit=crop', title: 'Sunset cruise in St. Tropez writing session', category: 'travel' },
    { id: 'gal-5', url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=800&auto=format&fit=crop', title: 'Fans singing every word in Paris', category: 'fans' },
    { id: 'gal-6', url: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?q=80&w=800&auto=format&fit=crop', title: 'Receiving the Global Afrobeats Artist of the Year award', category: 'awards' },
    { id: 'gal-7', url: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?q=80&w=800&auto=format&fit=crop', title: 'Studio collaboration with international producers', category: 'studio' },
    { id: 'gal-8', url: 'https://images.unsplash.com/photo-1571260899304-425eee4c7efc?q=80&w=800&auto=format&fit=crop', title: 'Stepping off the tour jet in New York', category: 'travel' }
  ];

  const initialBlog: BlogPost[] = [
    {
      id: 'blog-1',
      title: 'Shedstar Unveils Majestic "Shedding Light" Global Stadium Tour',
      summary: 'From London to Lagos, Shedstar is set to play in some of the most iconic arenas around the world starting this summer.',
      content: 'Global music sensation Shedstar has officially announced his much-anticipated world tour, "Shedding Light Stadium Tour 2026". The tour kicks off at the historic London O2 Arena on July 15, and spans across European cities, multiple major stadiums in the United States, Tokyo, and culminates with an epic homecoming show in Lagos, Nigeria at the Eko Convention Center on December 18.\n\n"I wanted to build an immersive universe for this tour," says Shedstar. "We are bringing a 30-piece live orchestra, custom hologram visuals, and stage architectures designed in collaboration with award-winning artists. This is not just a show, it is a spiritual luxury experience."\n\nTickets for London, Paris, and Tokyo sold out within an unprecedented 8 minutes. Remaining dates are selling out fast on Ticketmaster.',
      date: 'June 18, 2026',
      category: 'Tour Updates',
      coverUrl: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?q=80&w=800&auto=format&fit=crop',
      readTime: '3 min read',
      author: 'Shedstar Media Team'
    },
    {
      id: 'blog-2',
      title: 'Behind the Cover Art: Crafting the Starborn Visual Identity',
      summary: 'Explore the high-fashion photography and custom typography that created the luxury aesthetic of Shedstars latest album.',
      content: 'Visual storytelling is as critical as the sonic frequency for Shedstar. For his latest chart-topping studio album "Starborn", the artist partnered with prominent Parisian photographer Hélène Dubois and digital artist Kaelen Vance to craft a dark, velvet-toned visual identity.\n\n"We wanted to play with high-contrast chiaroscuro shadows, deep royal purples, and real gold foil coatings," Hélène explains. "Every image captures the transition from darkness into stardust, representing Shedstars musical philosophy of shedding light through sound."\n\nThe physical gatefold vinyl edition incorporates these luxury prints inside a 16-page velvet book, creating a tactile collector item for vinyl aficionados.',
      date: 'June 01, 2026',
      category: 'Creative Design',
      coverUrl: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=800&auto=format&fit=crop',
      readTime: '4 min read',
      author: 'Aesthetic Culture'
    },
    {
      id: 'blog-3',
      title: 'Double Platinum Milestone: "Shedding Light" Hits 150M Streams',
      summary: 'The self-written lead single continues its explosive global charts dominance, hitting platinum certifications in five countries.',
      content: 'The numbers don\'t lie: Shedstar\'s "Shedding Light" is officially a global streaming behemoth. The single has officially crossed 150 million combined streams across Spotify, Apple Music, and Audiomack, earning certified double-platinum status in the UK, France, and Canada.\n\nThe song, produced by Shedstar himself alongside legendary hitmaker Sarz, fuses traditional Nigerian fuji drums with futuristic synth-pop bass lines, creating a uniquely global sonic space that has taken radio stations and clubs by storm worldwide.\n\n"I wrote this song on a flight from Lagos to Paris," says Shedstar. "It was a moment of pure reflection. To see the world sing these lyrics back to me is the greatest reward."',
      date: 'May 25, 2026',
      category: 'Achievements',
      coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=800&auto=format&fit=crop',
      readTime: '2 min read',
      author: 'Music Industry Watch'
    }
  ];

  const initialBookings: Booking[] = [
    {
      id: 'book-1',
      name: 'Sarah Jenkins',
      company: 'AEG Presents',
      eventName: 'Summer Starry Nights',
      country: 'United States',
      city: 'Miami',
      budget: 150000,
      eventDate: '2026-10-18',
      email: 'sjenkins@aegpresents.com',
      phone: '+1 (305) 555-0199',
      message: 'We want to book Shedstar as our headline act for the Summer Starry Nights beach-front festival in Miami. We expect a crowd of 35,000 fans. Budget includes first-class travel for artist and 12 crew members.',
      status: 'pending',
      createdAt: '2026-07-01T10:30:00Z'
    },
    {
      id: 'book-2',
      name: 'Marcus Kalu',
      company: 'Livespot360',
      eventName: 'Lagos Homecoming VIP Gala',
      country: 'Nigeria',
      city: 'Lagos',
      budget: 95000,
      eventDate: '2026-12-20',
      email: 'marcus@livespot360.com',
      phone: '+234 803 555 1234',
      message: 'Seeking a 45-minute premium live set for our corporate VIP gala post-concert. High profile attendees, national broadcast segment.',
      status: 'accepted',
      createdAt: '2026-07-03T15:20:00Z'
    }
  ];

  const initialContacts: ContactMessage[] = [
    {
      id: 'msg-1',
      name: 'David Beck',
      email: 'd.beck@interscope.com',
      subject: 'Licensing Inquiry - Movie Soundtrack',
      message: 'Hello, we are interested in licensing "Purple Dreams" for an upcoming feature film launching in Spring 2027. Please connect us with your legal representation or business manager at your earliest convenience.',
      isRead: false,
      createdAt: '2026-07-06T09:15:00Z'
    },
    {
      id: 'msg-2',
      name: 'Amara Nwosu',
      email: 'amara.nw@outlook.com',
      subject: 'Interview Request - Vogue Africa September Issue',
      message: 'Dear Shedstar team, we would love to feature Shedstar as our September Cover Star for Vogue Africa, discussing his style fusion, global music rise, and fashion design directions. A 2-hour cover photoshoot in Paris is proposed.',
      isRead: true,
      createdAt: '2026-07-05T14:40:00Z'
    }
  ];

  const initialSubscribers: Subscriber[] = [
    { id: 'sub-1', email: 'fan1@shedstar.com', status: 'active', createdAt: '2026-06-15T08:00:00Z' },
    { id: 'sub-2', email: 'lucas.geller@gmail.com', status: 'active', createdAt: '2026-06-20T12:30:00Z' },
    { id: 'sub-3', email: 'chioma_nw@yahoo.com', status: 'active', createdAt: '2026-07-01T18:45:00Z' },
    { id: 'sub-4', email: 'micheal_k@ae.com', status: 'active', createdAt: '2026-07-05T11:15:00Z' }
  ];

  const initialStats: DashboardStats = {
    pageViews: 124500,
    musicPlays: 47290000,
    merchandiseSales: 148,
    ebookSales: 122,
    adRevenue: 381.91,
    revenue: 8435,
    bookingRequests: 2,
    activeSubscribers: 4,
    salesByProduct: [
      { name: 'Starborn Vintage Tee', value: 58 },
      { name: 'Royal Velvet Hoodie', value: 34 },
      { name: 'Signature Cap', value: 28 },
      { name: 'Acid Sweatshirt', value: 16 },
      { name: 'Star LP Vinyl', value: 12 }
    ],
    playsBySong: [
      { name: 'Shedding Light', value: 14250 },
      { name: 'Purple Dreams', value: 11130 },
      { name: 'Gold Dust', value: 8520 },
      { name: 'Vibe Check', value: 7900 },
      { name: 'Midnight Cruiser', value: 5410 }
    ],
    monthlyRevenue: [
      { month: 'Jan', amount: 850 },
      { month: 'Feb', amount: 1200 },
      { month: 'Mar', amount: 1100 },
      { month: 'Apr', amount: 1950 },
      { month: 'May', amount: 2450 },
      { month: 'Jun', amount: 3250 },
      { month: 'Jul', amount: 4835 }
    ]
  };

  const initialEBooks: EBook[] = [
    {
      id: 'book-1',
      title: 'Shedstar: Starborn Lyrics & Poetry Book',
      description: 'The complete physical-to-digital lyric compilation from the Starborn album. Includes handwritten notes, behind-the-lyrics studio stories, and unreleased poetry written during the midnight Paris studio sessions.',
      price: 12.99,
      coverUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=600&auto=format&fit=crop',
      author: 'Shedstar',
      pages: 124,
      publishedYear: 2026,
      fileSize: '18.4 MB PDF',
      downloadUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      isFeatured: true,
      salesCount: 42
    },
    {
      id: 'book-2',
      title: 'Afrobeats Mastery: The Modern Producer Handbook',
      description: 'Written by Shedstar and his top producers. A deep-dive handbook on fusing traditional percussion, organic bass guitars, and futuristic hyper-pop synthesizers. Includes MIDI loops, mixing tricks, and distribution secrets.',
      price: 24.99,
      coverUrl: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=600&auto=format&fit=crop',
      author: 'Shedstar & Sarz',
      pages: 182,
      publishedYear: 2026,
      fileSize: '45.1 MB EPUB/PDF',
      downloadUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      isFeatured: false,
      salesCount: 19
    },
    {
      id: 'book-3',
      title: 'Shedding Light: Behind the O2 Spotlight',
      description: 'An intimate photo-journal book capturing the 100 days leading to the legendary O2 Arena sold-out performance. High-resolution stage photography, private crew conversations, and emotional pre-show logs.',
      price: 15.99,
      coverUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=600&auto=format&fit=crop',
      author: 'Shedstar Media Team',
      pages: 200,
      publishedYear: 2026,
      fileSize: '124.0 MB PDF',
      downloadUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      isFeatured: true,
      salesCount: 61
    }
  ];

  const initialAds: AdUnit[] = [
    {
      id: 'ad-1',
      placement: 'banner',
      brandName: 'Pristine Luxury Audio',
      imageUrl: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=80&w=1200&auto=format&fit=crop',
      targetUrl: 'https://www.apple.com/airpods',
      cpc: 0.45,
      cpm: 6.50,
      clicks: 124,
      impressions: 8500,
      revenue: 111.05,
      isActive: true
    },
    {
      id: 'ad-2',
      placement: 'sidebar',
      brandName: 'Stardust Apparel Co.',
      imageUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=600&auto=format&fit=crop',
      targetUrl: 'https://www.nike.com',
      cpc: 0.30,
      cpm: 4.20,
      clicks: 82,
      impressions: 4300,
      revenue: 42.66,
      isActive: true
    },
    {
      id: 'ad-3',
      placement: 'inline',
      brandName: 'Gilded Synth VST Synth',
      imageUrl: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=800&auto=format&fit=crop',
      targetUrl: 'https://www.ableton.com',
      cpc: 0.60,
      cpm: 8.00,
      clicks: 215,
      impressions: 12400,
      revenue: 228.20,
      isActive: true
    }
  ];

  const initialAdConfig: AdConfig = {
    adSenseEnabled: false,
    adSensePublisherId: 'ca-pub-1234567890123456',
    adSenseSlotId: '9876543210',
    customAdRotationEnabled: true
  };

  const initialPartnerships: Partnership[] = [
    {
      id: 'partner-1',
      companyName: 'Aurelia Luxury Watches',
      contactPerson: 'Isabelle Laurent',
      email: 'partnerships@aurelia.com',
      phone: '+33 1 55 55 0100',
      website: 'https://aurelia.example.com',
      industry: 'Luxury Goods',
      budget: 250000,
      partnershipType: 'brand-spotlight',
      campaignDuration: '6 months',
      message: 'Aurelia would love to partner with Shedstar for a global brand spotlight across the Shedding Light tour, featuring co-branded content and a limited timepiece collaboration.',
      status: 'accepted',
      createdAt: '2026-06-25T11:00:00Z'
    },
    {
      id: 'partner-2',
      companyName: 'Voltage Energy',
      contactPerson: 'Derek Osei',
      email: 'brand@voltageenergy.com',
      phone: '+1 (404) 555-0170',
      website: 'https://voltage.example.com',
      industry: 'Beverage',
      budget: 80000,
      partnershipType: 'event-sponsorship',
      campaignDuration: '3 months',
      message: 'Interested in sponsoring the Lagos homecoming show with on-site activation and sampled product placement in tour content.',
      status: 'pending',
      createdAt: '2026-07-08T09:30:00Z'
    }
  ];

  return {
    songs: initialSongs,
    videos: initialVideos,
    products: initialProducts,
    tours: initialTours,
    gallery: initialGallery,
    blog: initialBlog,
    bookings: initialBookings,
    contacts: initialContacts,
    subscribers: initialSubscribers,
    ebooks: initialEBooks,
    ads: initialAds,
    adConfig: initialAdConfig,
    partnerships: initialPartnerships,
    orders: [],
    stats: initialStats
  };
}

/* ---------- Database access with an in-memory fallback ----------
   Production containers often have a read-only or ephemeral filesystem. If
   db.json can't be created, read, or parsed, every /api route used to throw a
   500 — and because each front-end section is gated on its data being present,
   the site rendered with whole sections silently missing rather than an error.
   Falling back to the shipped defaults keeps the API serving real content;
   writes are then process-local and lost on restart, which is logged loudly. */
let memoryDb: any = null;
let usingMemoryDb = false;

function useMemoryDb(reason: unknown) {
  if (!usingMemoryDb) {
    usingMemoryDb = true;
    console.error(
      `[db] ${DB_FILE} is unusable — serving the built-in defaults from memory. ` +
      `Admin changes will NOT persist across restarts. Cause:`, reason
    );
  }
  if (!memoryDb) memoryDb = buildDefaultDb();
  return memoryDb;
}

// Ensure the database file exists, falling back to memory if disk is unusable.
function initializeDatabase() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(buildDefaultDb(), null, 2), 'utf-8');
    }
  } catch (error) {
    useMemoryDb(error);
  }
}

// Read database helper
function getDb() {
  if (usingMemoryDb) return memoryDb;
  try {
    if (!fs.existsSync(DB_FILE)) {
      initializeDatabase();
      if (usingMemoryDb) return memoryDb;
    }
    const content = fs.readFileSync(DB_FILE, 'utf-8');
    const db = JSON.parse(content);
    let mutated = false;

    if (!db.ebooks) {
      db.ebooks = [
        {
          id: 'book-1',
          title: 'Shedstar: Starborn Lyrics & Poetry Book',
          description: 'The complete physical-to-digital lyric compilation from the Starborn album. Includes handwritten notes, behind-the-lyrics studio stories, and unreleased poetry written during the midnight Paris studio sessions.',
          price: 12.99,
          coverUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=600&auto=format&fit=crop',
          author: 'Shedstar',
          pages: 124,
          publishedYear: 2026,
          fileSize: '18.4 MB PDF',
          downloadUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
          isFeatured: true,
          salesCount: 42
        },
        {
          id: 'book-2',
          title: 'Afrobeats Mastery: The Modern Producer Handbook',
          description: 'Written by Shedstar and his top producers. A deep-dive handbook on fusing traditional percussion, organic bass guitars, and futuristic hyper-pop synthesizers. Includes MIDI loops, mixing tricks, and distribution secrets.',
          price: 24.99,
          coverUrl: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=600&auto=format&fit=crop',
          author: 'Shedstar & Sarz',
          pages: 182,
          publishedYear: 2026,
          fileSize: '45.1 MB EPUB/PDF',
          downloadUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
          isFeatured: false,
          salesCount: 19
        },
        {
          id: 'book-3',
          title: 'Shedding Light: Behind the O2 Spotlight',
          description: 'An intimate photo-journal book capturing the 100 days leading to the legendary O2 Arena sold-out performance. High-resolution stage photography, private crew conversations, and emotional pre-show logs.',
          price: 15.99,
          coverUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=600&auto=format&fit=crop',
          author: 'Shedstar Media Team',
          pages: 200,
          publishedYear: 2026,
          fileSize: '124.0 MB PDF',
          downloadUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
          isFeatured: true,
          salesCount: 61
        }
      ];
      mutated = true;
    }

    if (!db.ads) {
      db.ads = [
        {
          id: 'ad-1',
          placement: 'banner',
          brandName: 'Pristine Luxury Audio',
          imageUrl: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=80&w=1200&auto=format&fit=crop',
          targetUrl: 'https://www.apple.com/airpods',
          cpc: 0.45,
          cpm: 6.50,
          clicks: 124,
          impressions: 8500,
          revenue: 111.05,
          isActive: true
        },
        {
          id: 'ad-2',
          placement: 'sidebar',
          brandName: 'Stardust Apparel Co.',
          imageUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=600&auto=format&fit=crop',
          targetUrl: 'https://www.nike.com',
          cpc: 0.30,
          cpm: 4.20,
          clicks: 82,
          impressions: 4300,
          revenue: 42.66,
          isActive: true
        },
        {
          id: 'ad-3',
          placement: 'inline',
          brandName: 'Gilded Synth VST Synth',
          imageUrl: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=800&auto=format&fit=crop',
          targetUrl: 'https://www.ableton.com',
          cpc: 0.60,
          cpm: 8.00,
          clicks: 215,
          impressions: 12400,
          revenue: 228.20,
          isActive: true
        }
      ];
      mutated = true;
    }

    if (!db.adConfig) {
      db.adConfig = {
        adSenseEnabled: false,
        adSensePublisherId: 'ca-pub-1234567890123456',
        adSenseSlotId: '9876543210',
        customAdRotationEnabled: true
      };
      mutated = true;
    }

    if (!db.partnerships) {
      db.partnerships = [
        {
          id: 'partner-1',
          companyName: 'Aurelia Luxury Watches',
          contactPerson: 'Isabelle Laurent',
          email: 'partnerships@aurelia.com',
          phone: '+33 1 55 55 0100',
          website: 'https://aurelia.example.com',
          industry: 'Luxury Goods',
          budget: 250000,
          partnershipType: 'brand-spotlight',
          campaignDuration: '6 months',
          message: 'Aurelia would love to partner with Shedstar for a global brand spotlight across the Shedding Light tour, featuring co-branded content and a limited timepiece collaboration.',
          status: 'accepted',
          createdAt: '2026-06-25T11:00:00Z'
        },
        {
          id: 'partner-2',
          companyName: 'Voltage Energy',
          contactPerson: 'Derek Osei',
          email: 'brand@voltageenergy.com',
          phone: '+1 (404) 555-0170',
          website: 'https://voltage.example.com',
          industry: 'Beverage',
          budget: 80000,
          partnershipType: 'event-sponsorship',
          campaignDuration: '3 months',
          message: 'Interested in sponsoring the Lagos homecoming show with on-site activation and sampled product placement in tour content.',
          status: 'pending',
          createdAt: '2026-07-08T09:30:00Z'
        }
      ];
      mutated = true;
    }

    if (!db.orders) {
      db.orders = [];
      mutated = true;
    }

    if (db.stats) {
      if (db.stats.ebookSales === undefined) {
        db.stats.ebookSales = 122;
        mutated = true;
      }
      if (db.stats.adRevenue === undefined) {
        db.stats.adRevenue = 381.91;
        mutated = true;
      }
    }

    if (mutated) {
      // A failed migration write is not fatal — the migrated shape is already
      // in `db`, so keep serving this request and retry on the next read.
      try {
        fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
      } catch (error) {
        console.error('[db] could not persist schema migration:', error);
      }
    }

    return db;
  } catch (error) {
    // Missing, unreadable, or corrupt db.json — restore the defaults on disk,
    // and if disk itself is the problem, serve them from memory instead.
    console.error(`[db] could not read ${DB_FILE} — restoring defaults:`, error);
    const fresh = buildDefaultDb();
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(fresh, null, 2), 'utf-8');
      return fresh;
    } catch (writeError) {
      return useMemoryDb(writeError);
    }
  }
}

// Save database helper
function saveDb(data: any) {
  if (usingMemoryDb) {
    memoryDb = data;
    return;
  }
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    // Disk went away mid-flight — keep the write in memory so the change is at
    // least visible for the life of this process.
    memoryDb = data;
    useMemoryDb(error);
  }
}

initializeDatabase();

// --- API ROUTES ---

// 1. Songs Endpoints
app.get('/api/songs', (req, res) => {
  const db = getDb();
  res.json(db.songs);
});

app.post('/api/songs', (req, res) => {
  const db = getDb();
  const newSong: Song = {
    id: `song-${Date.now()}`,
    ...req.body,
    playCount: req.body.playCount || 0
  };
  db.songs.push(newSong);
  saveDb(db);
  res.status(201).json(newSong);
});

app.put('/api/songs/:id', (req, res) => {
  const db = getDb();
  const index = db.songs.findIndex((s: Song) => s.id === req.params.id);
  if (index !== -1) {
    db.songs[index] = { ...db.songs[index], ...req.body };
    saveDb(db);
    res.json(db.songs[index]);
  } else {
    res.status(404).json({ error: 'Song not found' });
  }
});

app.delete('/api/songs/:id', (req, res) => {
  const db = getDb();
  db.songs = db.songs.filter((s: Song) => s.id !== req.params.id);
  saveDb(db);
  res.json({ success: true });
});

app.post('/api/songs/:id/play', (req, res) => {
  const db = getDb();
  const song = db.songs.find((s: Song) => s.id === req.params.id);
  if (song) {
    song.playCount = (song.playCount || 0) + 1;
    db.stats.musicPlays += 1;
    
    // Update play count in chart
    const chartSong = db.stats.playsBySong.find((s: any) => s.name === song.title);
    if (chartSong) {
      chartSong.value = Math.floor(song.playCount / 1000); // representation in thousands
    } else {
      db.stats.playsBySong.push({ name: song.title, value: 1 });
    }
    
    saveDb(db);
    res.json({ success: true, playCount: song.playCount });
  } else {
    res.status(404).json({ error: 'Song not found' });
  }
});

// 2. Videos Endpoints
app.get('/api/videos', (req, res) => {
  const db = getDb();
  res.json(db.videos);
});

app.post('/api/videos', (req, res) => {
  const db = getDb();
  const newVideo: Video = {
    id: `video-${Date.now()}`,
    ...req.body,
    views: req.body.views || '0 views'
  };
  db.videos.push(newVideo);
  saveDb(db);
  res.status(201).json(newVideo);
});

app.put('/api/videos/:id', (req, res) => {
  const db = getDb();
  const index = db.videos.findIndex((v: Video) => v.id === req.params.id);
  if (index !== -1) {
    db.videos[index] = { ...db.videos[index], ...req.body };
    saveDb(db);
    res.json(db.videos[index]);
  } else {
    res.status(404).json({ error: 'Video not found' });
  }
});

app.delete('/api/videos/:id', (req, res) => {
  const db = getDb();
  db.videos = db.videos.filter((v: Video) => v.id !== req.params.id);
  saveDb(db);
  res.json({ success: true });
});

// 3. Merchandise Endpoints
app.get('/api/products', (req, res) => {
  const db = getDb();
  res.json(db.products);
});

app.post('/api/products', (req, res) => {
  const db = getDb();
  const newProduct: Product = {
    id: `prod-${Date.now()}`,
    ...req.body
  };
  db.products.push(newProduct);
  saveDb(db);
  res.status(201).json(newProduct);
});

app.put('/api/products/:id', (req, res) => {
  const db = getDb();
  const index = db.products.findIndex((p: Product) => p.id === req.params.id);
  if (index !== -1) {
    db.products[index] = { ...db.products[index], ...req.body };
    saveDb(db);
    res.json(db.products[index]);
  } else {
    res.status(404).json({ error: 'Product not found' });
  }
});

app.delete('/api/products/:id', (req, res) => {
  const db = getDb();
  db.products = db.products.filter((p: Product) => p.id !== req.params.id);
  saveDb(db);
  res.json({ success: true });
});

// 4. Tour Endpoints
app.get('/api/tours', (req, res) => {
  const db = getDb();
  res.json(db.tours);
});

app.post('/api/tours', (req, res) => {
  const db = getDb();
  const newTour: Tour = {
    id: `tour-${Date.now()}`,
    ...req.body,
    isSoldOut: req.body.isSoldOut || false
  };
  db.tours.push(newTour);
  saveDb(db);
  res.status(201).json(newTour);
});

app.put('/api/tours/:id', (req, res) => {
  const db = getDb();
  const index = db.tours.findIndex((t: Tour) => t.id === req.params.id);
  if (index !== -1) {
    db.tours[index] = { ...db.tours[index], ...req.body };
    saveDb(db);
    res.json(db.tours[index]);
  } else {
    res.status(404).json({ error: 'Tour date not found' });
  }
});

app.delete('/api/tours/:id', (req, res) => {
  const db = getDb();
  db.tours = db.tours.filter((t: Tour) => t.id !== req.params.id);
  saveDb(db);
  res.json({ success: true });
});

// 5. Gallery Endpoints
app.get('/api/gallery', (req, res) => {
  const db = getDb();
  res.json(db.gallery);
});

app.post('/api/gallery', (req, res) => {
  const db = getDb();
  const newItem: GalleryItem = {
    id: `gal-${Date.now()}`,
    ...req.body
  };
  db.gallery.push(newItem);
  saveDb(db);
  res.status(201).json(newItem);
});

app.delete('/api/gallery/:id', (req, res) => {
  const db = getDb();
  db.gallery = db.gallery.filter((g: GalleryItem) => g.id !== req.params.id);
  saveDb(db);
  res.json({ success: true });
});

// 6. Blog/News Endpoints
app.get('/api/blog', (req, res) => {
  const db = getDb();
  res.json(db.blog);
});

app.post('/api/blog', (req, res) => {
  const db = getDb();
  const newPost: BlogPost = {
    id: `blog-${Date.now()}`,
    ...req.body,
    date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  };
  db.blog.push(newPost);
  saveDb(db);
  res.status(201).json(newPost);
});

app.put('/api/blog/:id', (req, res) => {
  const db = getDb();
  const index = db.blog.findIndex((b: BlogPost) => b.id === req.params.id);
  if (index !== -1) {
    db.blog[index] = { ...db.blog[index], ...req.body };
    saveDb(db);
    res.json(db.blog[index]);
  } else {
    res.status(404).json({ error: 'Blog post not found' });
  }
});

app.delete('/api/blog/:id', (req, res) => {
  const db = getDb();
  db.blog = db.blog.filter((b: BlogPost) => b.id !== req.params.id);
  saveDb(db);
  res.json({ success: true });
});

// 7. Booking Endpoints
app.get('/api/bookings', (req, res) => {
  const db = getDb();
  res.json(db.bookings);
});

app.post('/api/bookings', (req, res) => {
  const db = getDb();
  const newBooking: Booking = {
    id: `book-${Date.now()}`,
    status: 'pending',
    createdAt: new Date().toISOString(),
    ...req.body
  };
  db.bookings.push(newBooking);
  db.stats.bookingRequests += 1;
  saveDb(db);
  res.status(201).json(newBooking);
});

app.put('/api/bookings/:id', (req, res) => {
  const db = getDb();
  const index = db.bookings.findIndex((b: Booking) => b.id === req.params.id);
  if (index !== -1) {
    db.bookings[index] = { ...db.bookings[index], ...req.body };
    saveDb(db);
    res.json(db.bookings[index]);
  } else {
    res.status(404).json({ error: 'Booking not found' });
  }
});

app.delete('/api/bookings/:id', (req, res) => {
  const db = getDb();
  db.bookings = db.bookings.filter((b: Booking) => b.id !== req.params.id);
  saveDb(db);
  res.json({ success: true });
});

// 8. Contact Endpoints
app.get('/api/contacts', (req, res) => {
  const db = getDb();
  res.json(db.contacts);
});

app.post('/api/contacts', (req, res) => {
  const db = getDb();
  const newContact: ContactMessage = {
    id: `msg-${Date.now()}`,
    isRead: false,
    createdAt: new Date().toISOString(),
    ...req.body
  };
  db.contacts.push(newContact);
  saveDb(db);
  res.status(201).json(newContact);
});

app.put('/api/contacts/:id/read', (req, res) => {
  const db = getDb();
  const index = db.contacts.findIndex((c: ContactMessage) => c.id === req.params.id);
  if (index !== -1) {
    db.contacts[index].isRead = true;
    saveDb(db);
    res.json(db.contacts[index]);
  } else {
    res.status(404).json({ error: 'Message not found' });
  }
});

app.delete('/api/contacts/:id', (req, res) => {
  const db = getDb();
  db.contacts = db.contacts.filter((c: ContactMessage) => c.id !== req.params.id);
  saveDb(db);
  res.json({ success: true });
});

// 9. Newsletter Endpoints
app.get('/api/subscribers', (req, res) => {
  const db = getDb();
  res.json(db.subscribers);
});

app.post('/api/subscribers', (req, res) => {
  const db = getDb();
  const { email } = req.body;
  
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Invalid email address' });
  }

  const exists = db.subscribers.some((s: Subscriber) => s.email.toLowerCase() === email.toLowerCase());
  if (exists) {
    return res.json({ success: true, message: 'Already subscribed' });
  }

  const newSubscriber: Subscriber = {
    id: `sub-${Date.now()}`,
    email: email.toLowerCase(),
    status: 'active',
    createdAt: new Date().toISOString()
  };
  
  db.subscribers.push(newSubscriber);
  db.stats.activeSubscribers += 1;
  saveDb(db);
  res.status(201).json({ success: true, subscriber: newSubscriber });
});

// 10. Purchase simulation
app.post('/api/purchase', (req, res) => {
  const db = getDb();
  const { items, paymentMethod } = req.body;
  
  if (!items || !items.length) {
    return res.status(400).json({ error: 'Cart is empty' });
  }

  let purchaseTotal = 0;
  let hasEBook = false;
  let ebookTitles: string[] = [];

  items.forEach((item: any) => {
    if (item.isEBook) {
      const ebook = db.ebooks.find((b: any) => b.id === item.product.id);
      if (ebook) {
        purchaseTotal += ebook.price * item.quantity;
        ebook.salesCount = (ebook.salesCount || 0) + item.quantity;
        db.stats.ebookSales = (db.stats.ebookSales || 0) + item.quantity;
        hasEBook = true;
        ebookTitles.push(ebook.title);

        // Update sales stats under salesByProduct
        const salesProd = db.stats.salesByProduct.find((p: any) => p.name === ebook.title);
        if (salesProd) {
          salesProd.value += item.quantity;
        } else {
          db.stats.salesByProduct.push({ name: ebook.title, value: item.quantity });
        }
      }
    } else {
      const product = db.products.find((p: Product) => p.id === item.product.id);
      if (product) {
        purchaseTotal += product.price * item.quantity;
        // Deduct stock
        product.stock = Math.max(0, product.stock - item.quantity);
        
        // Update sales stats
        const salesProd = db.stats.salesByProduct.find((p: any) => p.name === product.title);
        if (salesProd) {
          salesProd.value += item.quantity;
        } else {
          db.stats.salesByProduct.push({ name: product.title, value: item.quantity });
        }
      }
    }
  });

  const merchQty = items.filter((item: any) => !item.isEBook).reduce((sum: number, item: any) => sum + item.quantity, 0);
  db.stats.merchandiseSales += merchQty;
  db.stats.revenue += purchaseTotal;

  // Add to monthly revenue (current month)
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentMonth = months[new Date().getMonth()];
  const monthlyData = db.stats.monthlyRevenue.find((m: any) => m.month === currentMonth);
  if (monthlyData) {
    monthlyData.amount += purchaseTotal;
  } else {
    db.stats.monthlyRevenue.push({ month: currentMonth, amount: purchaseTotal });
  }

  saveDb(db);
  
  let successMsg = `Checkout successful via simulated ${paymentMethod}.`;
  if (hasEBook) {
    successMsg += ` Your E-Books (${ebookTitles.join(', ')}) are ready to download immediately!`;
  }
  
  res.json({ 
    success: true, 
    total: purchaseTotal, 
    message: successMsg,
    downloadLinks: hasEBook ? items.filter((item: any) => item.isEBook).map((item: any) => {
      const ebook = db.ebooks.find((b: any) => b.id === item.product.id);
      return {
        id: item.product.id,
        title: ebook?.title || 'E-Book',
        downloadUrl: ebook?.downloadUrl || '/assets/dummy.pdf'
      };
    }) : []
  });
});

// --- STRIPE CHECKOUT (real payment gateway) ---

// Expose whether Stripe is wired up (for the client to show a helpful message).
app.get('/api/checkout/config', (req, res) => {
  res.json({ configured: stripeConfigured, currency: CURRENCY });
});

// Resolve a cart item to an authoritative DB record so prices come from the
// server, never the client. Returns null if the referenced product is unknown.
function resolveCartItem(db: any, item: any): OrderItem | null {
  const id = item?.product?.id;
  const quantity = Math.max(1, Math.floor(Number(item?.quantity) || 1));
  if (!id) return null;

  if (item?.isEBook) {
    const ebook = (db.ebooks || []).find((b: EBook) => b.id === id);
    if (!ebook) return null;
    return { id: ebook.id, title: ebook.title, price: ebook.price, quantity, isEBook: true };
  }

  const product = (db.products || []).find((p: Product) => p.id === id);
  if (!product) return null;
  return { id: product.id, title: product.title, price: product.price, quantity, isEBook: false };
}

// Create a Stripe Checkout Session from the cart and return its hosted URL.
app.post('/api/checkout/create-session', async (req, res) => {
  if (!stripe) {
    return res.status(503).json({
      error: 'Stripe is not configured. Add your Stripe test keys to the .env file (STRIPE_SECRET_KEY) and restart the server.'
    });
  }

  const db = getDb();
  const { items, email } = req.body || {};

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Cart is empty' });
  }

  // Build authoritative order lines from the DB (ignore any client-sent prices).
  const orderItems: OrderItem[] = [];
  for (const raw of items) {
    const resolved = resolveCartItem(db, raw);
    if (!resolved) {
      return res.status(400).json({ error: `Unknown or unavailable item: ${raw?.product?.title || raw?.product?.id || 'item'}` });
    }
    orderItems.push(resolved);
  }

  const amountTotal = Number(orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0).toFixed(2));
  const hasPhysical = orderItems.some((i) => !i.isEBook);

  // Persist a pending order; its id links Stripe back to fulfillment.
  const order: Order = {
    id: `order-${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
    items: orderItems,
    amountTotal,
    currency: CURRENCY,
    status: 'pending',
    email: typeof email === 'string' ? email : undefined,
    createdAt: new Date().toISOString()
  };
  db.orders = db.orders || [];
  db.orders.push(order);
  saveDb(db);

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: orderItems.map((i) => ({
        quantity: i.quantity,
        price_data: {
          currency: CURRENCY,
          unit_amount: Math.round(i.price * 100), // Stripe expects the smallest currency unit
          product_data: {
            name: i.title,
            metadata: { productId: i.id, kind: i.isEBook ? 'ebook' : 'merch' }
          }
        }
      })),
      // Let Stripe present all eligible local payment methods per country
      // (cards + Apple/Google Pay worldwide, plus European methods like iDEAL,
      // Bancontact, SEPA when enabled in the Stripe Dashboard).
      automatic_tax: { enabled: false },
      billing_address_collection: 'auto',
      ...(hasPhysical ? { shipping_address_collection: { allowed_countries: [
        'US','GB','IE','FR','DE','ES','IT','NL','BE','LU','PT','AT','FI','SE','DK','NO','PL','CZ','GR','HU','RO','BG','HR','SK','SI','EE','LV','LT','CY','MT',
        'CA','AU','NZ','JP','SG','HK','AE','ZA','NG','GH','KE','BR','MX','CH','IN'
      ] } } : {}),
      customer_email: order.email || undefined,
      client_reference_id: order.id,
      metadata: { orderId: order.id },
      success_url: `${APP_URL}/?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${APP_URL}/?checkout=cancel&order_id=${order.id}`
    });

    order.stripeSessionId = session.id;
    saveDb(db);

    res.json({ url: session.url, orderId: order.id });
  } catch (err: any) {
    console.error('[stripe] create-session error:', err.message);
    res.status(500).json({ error: 'Could not start checkout. Please try again.' });
  }
});

// Fulfill a paid order exactly once: update stock, sales stats, ebook counts.
// Idempotent — safe to call from both the webhook and the success page.
function fulfillOrder(sessionId?: string, orderId?: string, email?: string): Order | null {
  const db = getDb();
  const order: Order | undefined = (db.orders || []).find(
    (o: Order) => (orderId && o.id === orderId) || (sessionId && o.stripeSessionId === sessionId)
  );
  if (!order) return null;
  if (order.status === 'paid') return order; // already fulfilled

  let merchQty = 0;
  order.items.forEach((item) => {
    if (item.isEBook) {
      const ebook = (db.ebooks || []).find((b: EBook) => b.id === item.id);
      if (ebook) {
        ebook.salesCount = (ebook.salesCount || 0) + item.quantity;
        db.stats.ebookSales = (db.stats.ebookSales || 0) + item.quantity;
        const salesProd = db.stats.salesByProduct.find((p: any) => p.name === ebook.title);
        if (salesProd) salesProd.value += item.quantity;
        else db.stats.salesByProduct.push({ name: ebook.title, value: item.quantity });
      }
    } else {
      const product = (db.products || []).find((p: Product) => p.id === item.id);
      if (product) {
        product.stock = Math.max(0, product.stock - item.quantity);
        merchQty += item.quantity;
        const salesProd = db.stats.salesByProduct.find((p: any) => p.name === product.title);
        if (salesProd) salesProd.value += item.quantity;
        else db.stats.salesByProduct.push({ name: product.title, value: item.quantity });
      }
    }
  });

  db.stats.merchandiseSales += merchQty;
  db.stats.revenue = Number((db.stats.revenue + order.amountTotal).toFixed(2));

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentMonth = months[new Date().getMonth()];
  const monthlyData = db.stats.monthlyRevenue.find((m: any) => m.month === currentMonth);
  if (monthlyData) monthlyData.amount = Number((monthlyData.amount + order.amountTotal).toFixed(2));
  else db.stats.monthlyRevenue.push({ month: currentMonth, amount: order.amountTotal });

  order.status = 'paid';
  order.paidAt = new Date().toISOString();
  if (email && !order.email) order.email = email;

  saveDb(db);
  return order;
}

// Success page calls this with the Stripe session id to confirm + fulfill.
// This makes fulfillment work locally without webhook forwarding.
app.get('/api/checkout/verify', async (req, res) => {
  if (!stripe) {
    return res.status(503).json({ error: 'Stripe not configured' });
  }
  const sessionId = req.query.session_id as string;
  if (!sessionId) {
    return res.status(400).json({ error: 'Missing session_id' });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== 'paid') {
      return res.json({ success: false, status: session.payment_status });
    }

    const order = fulfillOrder(session.id, session.metadata?.orderId, session.customer_details?.email || undefined);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Attach download links for any e-books in the order.
    const db = getDb();
    const downloadLinks = order.items
      .filter((i) => i.isEBook)
      .map((i) => {
        const ebook = (db.ebooks || []).find((b: EBook) => b.id === i.id);
        return { id: i.id, title: ebook?.title || i.title, downloadUrl: ebook?.downloadUrl || '/assets/dummy.pdf' };
      });

    res.json({
      success: true,
      order,
      downloadLinks,
      message: `Payment received — thank you! Your order total was ${order.currency.toUpperCase()} ${order.amountTotal.toFixed(2)}.`
    });
  } catch (err: any) {
    console.error('[stripe] verify error:', err.message);
    res.status(500).json({ error: 'Could not verify payment.' });
  }
});

// 10a. E-Books Endpoints
app.get('/api/ebooks', (req, res) => {
  const db = getDb();
  res.json(db.ebooks || []);
});

app.post('/api/ebooks', (req, res) => {
  const db = getDb();
  const newBook: EBook = {
    id: `book-${Date.now()}`,
    title: req.body.title || 'Untitled E-Book',
    description: req.body.description || '',
    price: Number(req.body.price) || 0,
    coverUrl: req.body.coverUrl || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=600&auto=format&fit=crop',
    author: req.body.author || 'Shedstar',
    pages: Number(req.body.pages) || 100,
    publishedYear: Number(req.body.publishedYear) || new Date().getFullYear(),
    fileSize: req.body.fileSize || '10.0 MB PDF',
    downloadUrl: req.body.downloadUrl || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    isFeatured: req.body.isFeatured || false,
    salesCount: 0
  };
  db.ebooks = db.ebooks || [];
  db.ebooks.push(newBook);
  saveDb(db);
  res.status(201).json(newBook);
});

app.put('/api/ebooks/:id', (req, res) => {
  const db = getDb();
  const index = db.ebooks.findIndex((b: any) => b.id === req.params.id);
  if (index !== -1) {
    db.ebooks[index] = { 
      ...db.ebooks[index], 
      ...req.body,
      price: req.body.price !== undefined ? Number(req.body.price) : db.ebooks[index].price,
      pages: req.body.pages !== undefined ? Number(req.body.pages) : db.ebooks[index].pages,
      publishedYear: req.body.publishedYear !== undefined ? Number(req.body.publishedYear) : db.ebooks[index].publishedYear
    };
    saveDb(db);
    res.json(db.ebooks[index]);
  } else {
    res.status(404).json({ error: 'E-Book not found' });
  }
});

app.delete('/api/ebooks/:id', (req, res) => {
  const db = getDb();
  db.ebooks = (db.ebooks || []).filter((b: any) => b.id !== req.params.id);
  saveDb(db);
  res.json({ success: true });
});

// 10b. Advertising Endpoints
app.get('/api/ads', (req, res) => {
  const db = getDb();
  res.json(db.ads || []);
});

app.get('/api/ads/config', (req, res) => {
  const db = getDb();
  res.json(db.adConfig || {
    adSenseEnabled: false,
    adSensePublisherId: '',
    adSenseSlotId: '',
    customAdRotationEnabled: true
  });
});

app.put('/api/ads/config', (req, res) => {
  const db = getDb();
  db.adConfig = {
    ...db.adConfig,
    ...req.body
  };
  saveDb(db);
  res.json(db.adConfig);
});

app.post('/api/ads', (req, res) => {
  const db = getDb();
  const newAd: AdUnit = {
    id: `ad-${Date.now()}`,
    placement: req.body.placement || 'banner',
    brandName: req.body.brandName || 'Sponsor Brand',
    imageUrl: req.body.imageUrl || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600&auto=format&fit=crop',
    targetUrl: req.body.targetUrl || 'https://google.com',
    cpc: Number(req.body.cpc) || 0.25,
    cpm: Number(req.body.cpm) || 3.50,
    clicks: 0,
    impressions: 0,
    revenue: 0,
    isActive: req.body.isActive !== undefined ? req.body.isActive : true
  };
  db.ads = db.ads || [];
  db.ads.push(newAd);
  saveDb(db);
  res.status(201).json(newAd);
});

app.put('/api/ads/:id', (req, res) => {
  const db = getDb();
  const index = db.ads.findIndex((a: any) => a.id === req.params.id);
  if (index !== -1) {
    db.ads[index] = { 
      ...db.ads[index], 
      ...req.body,
      cpc: req.body.cpc !== undefined ? Number(req.body.cpc) : db.ads[index].cpc,
      cpm: req.body.cpm !== undefined ? Number(req.body.cpm) : db.ads[index].cpm
    };
    saveDb(db);
    res.json(db.ads[index]);
  } else {
    res.status(404).json({ error: 'Ad unit not found' });
  }
});

app.delete('/api/ads/:id', (req, res) => {
  const db = getDb();
  db.ads = (db.ads || []).filter((a: any) => a.id !== req.params.id);
  saveDb(db);
  res.json({ success: true });
});

// Ad Interaction Analytics trackers & Monetization simulation
app.post('/api/ads/:id/click', (req, res) => {
  const db = getDb();
  const ad = db.ads.find((a: any) => a.id === req.params.id);
  if (ad) {
    ad.clicks = (ad.clicks || 0) + 1;
    const earned = ad.cpc || 0.20;
    ad.revenue = Number((ad.revenue + earned).toFixed(2));
    db.stats.adRevenue = Number((db.stats.adRevenue + earned).toFixed(2));
    db.stats.revenue = Number((db.stats.revenue + earned).toFixed(2));
    saveDb(db);
    res.json({ success: true, earned, adRevenue: db.stats.adRevenue, adClicks: ad.clicks, adTotalRev: ad.revenue });
  } else {
    res.status(404).json({ error: 'Ad not found' });
  }
});

app.post('/api/ads/:id/impression', (req, res) => {
  const db = getDb();
  const ad = db.ads.find((a: any) => a.id === req.params.id);
  if (ad) {
    ad.impressions = (ad.impressions || 0) + 1;
    // CPM pays per 1000 impressions. So earned per impression = CPM / 1000
    const earned = (ad.cpm || 3.00) / 1000;
    ad.revenue = Number((ad.revenue + earned).toFixed(4));
    db.stats.adRevenue = Number((db.stats.adRevenue + earned).toFixed(2));
    db.stats.revenue = Number((db.stats.revenue + earned).toFixed(2));
    saveDb(db);
    res.json({ success: true, earned, adRevenue: db.stats.adRevenue, adImpressions: ad.impressions, adTotalRev: ad.revenue });
  } else {
    res.status(404).json({ error: 'Ad not found' });
  }
});

// 10c. Brand Partnership / Advertise Endpoints
app.get('/api/partnerships', (req, res) => {
  const db = getDb();
  res.json(db.partnerships || []);
});

app.post('/api/partnerships', (req, res) => {
  const db = getDb();
  const newPartnership: Partnership = {
    id: `partner-${Date.now()}`,
    companyName: req.body.companyName || '',
    contactPerson: req.body.contactPerson || '',
    email: req.body.email || '',
    phone: req.body.phone || '',
    website: req.body.website || '',
    industry: req.body.industry || '',
    budget: Number(req.body.budget) || 0,
    partnershipType: req.body.partnershipType || 'banner-ads',
    campaignDuration: req.body.campaignDuration || '',
    message: req.body.message || '',
    proposalFileName: req.body.proposalFileName,
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  db.partnerships = db.partnerships || [];
  db.partnerships.push(newPartnership);
  saveDb(db);
  res.status(201).json(newPartnership);
});

app.put('/api/partnerships/:id', (req, res) => {
  const db = getDb();
  const index = (db.partnerships || []).findIndex((p: Partnership) => p.id === req.params.id);
  if (index !== -1) {
    db.partnerships[index] = { ...db.partnerships[index], ...req.body };
    saveDb(db);
    res.json(db.partnerships[index]);
  } else {
    res.status(404).json({ error: 'Partnership not found' });
  }
});

app.delete('/api/partnerships/:id', (req, res) => {
  const db = getDb();
  db.partnerships = (db.partnerships || []).filter((p: Partnership) => p.id !== req.params.id);
  saveDb(db);
  res.json({ success: true });
});

app.get('/api/admin/stats', (req, res) => {
  const db = getDb();
  res.json(db.stats);
});

// 11. Dashboard Stats
app.get('/api/stats', (req, res) => {
  const db = getDb();
  // Simulate page view increment occasionally
  db.stats.pageViews += Math.floor(Math.random() * 5) + 1;
  saveDb(db);
  res.json(db.stats);
});

// 12. Simulate Email Campaign to Subscribers
app.post('/api/admin/send-campaign', (req, res) => {
  const { subject, content } = req.body;
  if (!subject || !content) {
    return res.status(400).json({ error: 'Subject and content are required' });
  }
  // Just simulate success
  res.json({ success: true, sentCount: getDb().subscribers.length });
});

// --- VITE MIDDLEWARE SETUP ---
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
