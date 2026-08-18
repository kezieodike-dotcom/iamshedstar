import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const distDir = join(root, 'dist');
const baseUrl = 'https://www.iamshedstar.com';

const pages = [
  {
    slug: '',
    title: 'SHEDSTAR - Official Website',
    description: 'Music, videos, tour dates, merch, e-books, booking, and fan updates from Shedstar.',
    image: '/meta/shedstar-home-hero.jpg',
    alt: 'Shedstar official homepage hero screenshot.',
  },
  {
    slug: 'about',
    title: 'About Shedstar',
    description: 'Read the story, style, and creative world behind Shedstar.',
    image: '/meta/shedstar-about-hero.jpg',
    alt: 'Shedstar about page hero screenshot.',
  },
  {
    slug: 'music',
    title: 'Shedstar Music',
    description: 'Stream featured releases, albums, singles, and Shedstar music moments.',
    image: '/meta/shedstar-music-hero.jpg',
    alt: 'Shedstar music page hero screenshot.',
  },
  {
    slug: 'videos',
    title: 'Shedstar Videos',
    description: 'Watch Shedstar music videos, live clips, behind-the-scenes films, and interviews.',
    image: '/meta/shedstar-videos-hero.jpg',
    alt: 'Shedstar videos page hero screenshot.',
  },
  {
    slug: 'tour',
    title: 'Shedstar Tour',
    description: 'See Shedstar tour dates, venues, tickets, VIP packages, and live show details.',
    image: '/meta/shedstar-tour-hero.jpg',
    alt: 'Shedstar tour page hero screenshot.',
  },
  {
    slug: 'merch',
    title: 'Shedstar Merch',
    description: 'Shop official Shedstar merchandise, clothing, accessories, and limited drops.',
    image: '/meta/shedstar-merch-hero.jpg',
    alt: 'Shedstar merch page hero screenshot.',
  },
  {
    slug: 'ebooks',
    title: 'Shedstar E-Books',
    description: 'Explore Shedstar e-books, digital drops, and exclusive fan reading material.',
    image: '/meta/shedstar-ebooks-hero.jpg',
    alt: 'Shedstar e-books page hero screenshot.',
  },
  {
    slug: 'images',
    title: 'Shedstar Images',
    description: 'Browse Shedstar gallery images, concert photos, studio shots, and fan moments.',
    image: '/meta/shedstar-images-hero.jpg',
    alt: 'Shedstar images gallery page hero screenshot.',
  },
  {
    slug: 'news',
    title: 'Shedstar News',
    description: 'Read official Shedstar news, announcements, tour updates, and culture stories.',
    image: '/meta/shedstar-news-hero.jpg',
    alt: 'Shedstar news page hero screenshot.',
  },
  {
    slug: 'advertise',
    title: 'Advertise With Shedstar',
    description: 'Partner with Shedstar through web, music, video, tour, and fan campaign placements.',
    image: '/meta/shedstar-advertise-hero.jpg',
    alt: 'Shedstar advertising page hero screenshot.',
  },
  {
    slug: 'booking',
    title: 'Book Shedstar',
    description: 'Submit professional booking inquiries for Shedstar events, festivals, and brand appearances.',
    image: '/meta/shedstar-booking-hero.jpg',
    alt: 'Shedstar booking page hero screenshot.',
  },
  {
    slug: 'contact',
    title: 'Contact Shedstar',
    description: 'Contact Shedstar management for booking, media, licensing, and partnership inquiries.',
    image: '/meta/shedstar-contact-hero.jpg',
    alt: 'Shedstar contact page hero screenshot.',
  },
];

const aliases = [
  { slug: 'gallery', target: 'images' },
  { slug: 'merchandise', target: 'merch' },
  { slug: 'partners', target: 'advertise' },
  { slug: 'fanclub', target: 'newsletter' },
  { slug: 'newsletter', target: 'newsletter' },
];

pages.push({
  slug: 'newsletter',
  title: 'Shedstar Newsletter',
  description: 'Join the Shedstar fan newsletter for drops, presales, updates, and exclusive fan access.',
  image: '/meta/shedstar-newsletter-hero.jpg',
  alt: 'Shedstar newsletter page hero screenshot.',
});

const escapeAttr = (value) =>
  value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

const setTag = (html, selector, content) => {
  const escaped = escapeAttr(content);
  const attr = selector.startsWith('property=') ? 'property' : 'name';
  const key = selector.replace(/^(property|name)=/, '');
  const pattern = new RegExp(`<meta ${attr}="${key}" content="[^"]*" \\/>`);
  return html.replace(pattern, `<meta ${attr}="${key}" content="${escaped}" />`);
};

const setLink = (html, rel, href) => {
  const escaped = escapeAttr(href);
  const pattern = new RegExp(`<link rel="${rel}" href="[^"]*" \\/>`);
  return html.replace(pattern, `<link rel="${rel}" href="${escaped}" />`);
};

const writePage = (page, template) => {
  const url = page.slug ? `${baseUrl}/${page.slug}` : `${baseUrl}/`;
  const imageUrl = `${baseUrl}${page.image}`;
  let html = template
    .replace(/<title>.*?<\/title>/, `<title>${escapeAttr(page.title)}</title>`)
    .replace(/<meta name="description" content="[^"]*" \/>/, `<meta name="description" content="${escapeAttr(page.description)}" />`);

  html = setLink(html, 'canonical', url);
  html = setTag(html, 'property=og:url', url);
  html = setTag(html, 'property=og:title', page.title);
  html = setTag(html, 'property=og:description', page.description);
  html = setTag(html, 'property=og:image', imageUrl);
  html = setTag(html, 'property=og:image:secure_url', imageUrl);
  html = setTag(html, 'property=og:image:type', 'image/jpeg');
  html = setTag(html, 'property=og:image:alt', page.alt);
  html = setTag(html, 'name=twitter:url', url);
  html = setTag(html, 'name=twitter:title', page.title);
  html = setTag(html, 'name=twitter:description', page.description);
  html = setTag(html, 'name=twitter:image', imageUrl);
  html = setTag(html, 'name=twitter:image:alt', page.alt);

  const outDir = page.slug ? join(distDir, page.slug) : distDir;
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, 'index.html'), html);
};

const template = readFileSync(join(distDir, 'index.html'), 'utf8');
const bySlug = new Map(pages.map((page) => [page.slug, page]));

for (const page of pages) {
  writePage(page, template);
}

for (const alias of aliases) {
  const target = bySlug.get(alias.target);
  if (target) {
    writePage({ ...target, slug: alias.slug }, template);
  }
}
