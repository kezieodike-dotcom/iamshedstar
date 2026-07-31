/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Song {
  id: string;
  title: string;
  album: string;
  duration: string;
  coverUrl: string;
  audioUrl: string;
  lyrics: string;
  releaseDate: string;
  category: 'album' | 'single' | 'ep';
  streamingLinks: {
    spotify?: string;
    appleMusic?: string;
    audiomack?: string;
    boomplay?: string;
    youtubeMusic?: string;
  };
  playCount: number;
}

export interface Video {
  id: string;
  title: string;
  category: 'music-video' | 'live' | 'behind-the-scenes' | 'studio' | 'interview';
  youtubeId: string; // YouTube video ID for embedding
  coverUrl: string;
  views: string;
  duration: string;
  releaseDate: string;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  sizes: string[];
  colors: string[];
  category: string;
  stock: number;
  isNew?: boolean;
  isFeatured?: boolean;
}

export interface Tour {
  id: string;
  country: string;
  city: string;
  venue: string;
  date: string;
  time: string;
  ticketLink?: string;
  isSoldOut: boolean;
  latitude: number;
  longitude: number;
}

export interface GalleryItem {
  id: string;
  url: string;
  title: string;
  category: 'concert' | 'fans' | 'studio' | 'travel' | 'lifestyle' | 'awards';
}

export interface BlogPost {
  id: string;
  title: string;
  summary: string;
  content: string;
  date: string;
  category: string;
  coverUrl: string;
  readTime: string;
  author: string;
}

export interface Booking {
  id: string;
  name: string;
  company: string;
  eventName: string;
  country: string;
  city: string;
  budget: number;
  eventDate: string;
  email: string;
  phone: string;
  message: string;
  proposalFileName?: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface Subscriber {
  id: string;
  email: string;
  status: 'active' | 'unsubscribed';
  createdAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize: string;
  selectedColor: string;
  isEBook?: boolean; // track if this item is an E-Book
}

export interface EBook {
  id: string;
  title: string;
  description: string;
  price: number;
  coverUrl: string;
  author: string;
  pages: number;
  publishedYear: number;
  fileSize: string;
  downloadUrl: string;
  isFeatured?: boolean;
  salesCount: number;
}

export interface OrderItem {
  id: string;
  title: string;
  price: number;      // unit price in currency major units (e.g. dollars)
  quantity: number;
  isEBook: boolean;
}

export interface Order {
  id: string;
  items: OrderItem[];
  amountTotal: number;  // total in currency major units
  currency: string;
  status: 'pending' | 'paid';
  email?: string;
  stripeSessionId?: string;
  createdAt: string;
  paidAt?: string;
}

export interface AdUnit {
  id: string;
  placement: 'sidebar' | 'banner' | 'popup' | 'footer' | 'inline';
  brandName: string;
  imageUrl: string;
  targetUrl: string;
  cpc: number; // Cost Per Click
  cpm: number; // Cost Per Mille (1000 impressions)
  clicks: number;
  impressions: number;
  revenue: number;
  isActive: boolean;
}

export interface AdConfig {
  adSenseEnabled: boolean;
  adSensePublisherId: string;
  adSenseSlotId: string;
  customAdRotationEnabled: boolean;
}

export interface Partnership {
  id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  website: string;
  industry: string;
  budget: number;
  partnershipType: 'banner-ads' | 'sponsored-content' | 'brand-spotlight' | 'event-sponsorship' | 'product-placement' | 'media-partnership';
  campaignDuration: string;
  message: string;
  proposalFileName?: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

export interface DashboardStats {
  pageViews: number;
  musicPlays: number;
  merchandiseSales: number;
  ebookSales: number; // New metric
  adRevenue: number;   // New metric
  revenue: number;
  bookingRequests: number;
  activeSubscribers: number;
  salesByProduct: { name: string; value: number }[];
  playsBySong: { name: string; value: number }[];
  monthlyRevenue: { month: string; amount: number }[];
}
