import React, { useEffect, useState } from 'react';
import { BookOpen, Download, CreditCard, Sparkles, CheckCircle, ShoppingBag, Eye, Award, ChevronLeft, ChevronRight } from 'lucide-react';
import { EBook, CartItem } from '../types';
import AdSpace from './AdSpace';
import { SafetyPin } from './Decor';

interface EBooksSectionProps {
  onAddToCart: (item: CartItem) => void;
  onOpenCart: () => void;
}

export default function EBooksSection({ onAddToCart, onOpenCart }: EBooksSectionProps) {
  const [ebooks, setEbooks] = useState<EBook[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedBook, setSelectedBook] = useState<EBook | null>(null);

  // Checkout modal states — hands off to Stripe hosted Checkout
  const [checkoutBook, setCheckoutBook] = useState<EBook | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const [email, setEmail] = useState<string>('');

  const fetchEBooks = async () => {
    try {
      const res = await fetch('/api/ebooks');
      if (res.ok) {
        setEbooks(await res.json());
      }
    } catch (e) {
      console.error('Failed to load ebooks:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEBooks();
  }, []);

  const handleAddToCart = (book: EBook) => {
    // Transform ebook info to look like a standard Product representation for the cart
    const ebookProduct = {
      id: book.id,
      title: book.title,
      description: book.description,
      price: book.price,
      images: [book.coverUrl],
      sizes: ['Digital PDF'],
      colors: ['Default'],
      category: 'E-Book',
      stock: 999999
    };

    onAddToCart({
      product: ebookProduct,
      quantity: 1,
      selectedSize: 'Digital PDF',
      selectedColor: 'Default',
      isEBook: true
    });

    onOpenCart();
  };

  const handleDirectPurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkoutBook) return;

    setIsSubmitting(true);
    setCheckoutError(null);

    try {
      const res = await fetch('/api/checkout/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email || undefined,
          items: [
            {
              product: { id: checkoutBook.id, title: checkoutBook.title },
              quantity: 1,
              isEBook: true
            }
          ]
        })
      });
      const data = await res.json();

      if (res.ok && data.url) {
        // Hand off to Stripe's secure hosted checkout page.
        window.location.href = data.url;
      } else {
        setCheckoutError(data.error || 'Could not start checkout. Please try again.');
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error('EBook checkout error:', err);
      setCheckoutError('Could not contact the payment server. Try again later.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-wash-green grain relative">
    <div className="pt-14 md:pt-20 pb-4 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-ink relative">

      <SafetyPin className="absolute top-4 left-4 sm:left-8 -rotate-[28deg]" size={96} />

      {/* Title — white poster caps, centered */}
      <h1 className="poster-title text-white text-center text-6xl sm:text-7xl md:text-8xl mb-4 drop-shadow-[0_3px_0_rgba(0,0,0,0.18)]">
        E-Books
      </h1>
      <p className="text-center font-display font-bold text-xs uppercase tracking-[0.2em] text-ink/70 max-w-2xl mx-auto mb-12">
        Exclusive lyric annotations, studio secrets &amp; photo memoirs — straight from Shedstar
      </p>

      {/* Books carousel */}
      {loading ? (
        <div className="carousel-row no-scrollbar px-6 sm:px-10">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="w-52 sm:w-60 flex-none aspect-[3/4] bg-cream border-2 border-ink animate-pulse"></div>
          ))}
        </div>
      ) : (
        <div className="relative">
          <button
            onClick={() => { const el = document.getElementById('ebooks-row'); if (el) el.scrollBy({ left: -el.clientWidth * 0.7, behavior: 'smooth' }); }}
            className="absolute -left-1 sm:-left-3 top-1/3 -translate-y-1/2 z-10 text-ink/50 hover:text-ink transition-colors"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-9 h-9 sm:w-12 sm:h-12" strokeWidth={1.5} />
          </button>

          <div id="ebooks-row" className="carousel-row no-scrollbar px-6 sm:px-10 items-start">
            {ebooks.map((book) => (
              <div key={book.id} id={`ebook-card-${book.id}`} className="w-52 sm:w-60 flex-none flex flex-col text-center">
                <button onClick={() => setSelectedBook(book)} className="group block">
                  <div className="relative aspect-[3/4] overflow-hidden mb-4">
                    {book.isFeatured && (
                      <span className="absolute top-2 left-2 z-10 bg-brand text-white font-display font-bold text-[9px] uppercase tracking-widest px-2 py-1 flex items-center gap-1">
                        <Award className="w-3 h-3" /> Best Seller
                      </span>
                    )}
                    <img
                      src={book.coverUrl}
                      alt={book.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 drop-shadow-[0_12px_20px_rgba(0,0,0,0.28)]"
                    />
                  </div>
                  <h3 className="poster-title text-white text-base sm:text-lg leading-tight px-1 min-h-[3.25rem] drop-shadow-[0_2px_0_rgba(0,0,0,0.15)]">
                    {book.title}
                  </h3>
                  <p className="font-display font-bold text-white text-sm mt-1 drop-shadow-[0_1px_0_rgba(0,0,0,0.2)]">${book.price.toFixed(2)}</p>
                </button>
                <button
                  onClick={() => { setCheckoutBook(book); setCheckoutError(null); }}
                  className="btn-ink w-full mt-3 text-sm !bg-[#333] hover:!bg-ink tracking-[0.12em]"
                >
                  Buy Now!!
                </button>
                <button
                  onClick={() => handleAddToCart(book)}
                  className="mt-2 font-display font-bold text-[11px] uppercase tracking-widest text-ink/70 hover:text-ink inline-flex items-center justify-center gap-1"
                >
                  <ShoppingBag className="w-3.5 h-3.5" /> Add to Cart
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={() => { const el = document.getElementById('ebooks-row'); if (el) el.scrollBy({ left: el.clientWidth * 0.7, behavior: 'smooth' }); }}
            className="absolute -right-1 sm:-right-3 top-1/3 -translate-y-1/2 z-10 text-ink/50 hover:text-ink transition-colors"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-9 h-9 sm:w-12 sm:h-12" strokeWidth={1.5} />
          </button>
        </div>
      )}

      {/* Why Shedstar E-Books — feature row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
        {[
          { icon: BookOpen, title: '100% Artist-Authored', body: 'Every story, production annotation, and lyric diagram comes straight from Shedstar\'s own diaries and studio archives.' },
          { icon: Download, title: 'Instant Global Delivery', body: 'Complete checkout and download immediately in PDF & EPUB, formatted for any phone or e-reader screen.' },
          { icon: CheckCircle, title: 'VIP Fan Support', body: 'Sales revenue funds local music production schools in Lagos and independent artist grants worldwide.' },
        ].map((f) => (
          <div key={f.title} className="bg-paper border-2 border-ink p-6 text-center">
            <div className="w-11 h-11 bg-brand-soft border-2 border-ink flex items-center justify-center mx-auto mb-3 text-brand">
              <f.icon className="w-5 h-5" />
            </div>
            <h4 className="font-display font-black uppercase text-ink text-sm tracking-wide mb-2">{f.title}</h4>
            <p className="text-xs text-muted leading-relaxed">{f.body}</p>
          </div>
        ))}
      </div>

      {/* Book Details Modal */}
      {selectedBook && (
        <div className="fixed inset-0 z-50 bg-ink/70 backdrop-blur flex items-center justify-center p-4">
          <div className="bg-paper border-2 border-ink p-6 max-w-2xl w-full relative shadow-2xl text-ink">
            <button
              onClick={() => setSelectedBook(null)}
              className="absolute top-4 right-4 text-muted hover:text-ink font-mono text-sm uppercase border-2 border-ink px-2 py-1"
            >
              Close [X]
            </button>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mt-4">
              <div className="md:col-span-2 aspect-[3/4] overflow-hidden border-2 border-ink bg-cream">
                <img src={selectedBook.coverUrl} alt={selectedBook.title} className="w-full h-full object-cover" />
              </div>
              <div className="md:col-span-3 flex flex-col justify-between">
                <div>
                  <span className="font-mono text-xs text-brand flex items-center gap-1 uppercase tracking-widest mb-1">
                    <Sparkles className="w-3 h-3" /> Shedstar Exclusive
                  </span>
                  <h3 className="font-display font-black uppercase tracking-tight text-xl text-ink mb-2">{selectedBook.title}</h3>
                  <p className="font-mono text-xs text-muted mb-4">By {selectedBook.author} ({selectedBook.publishedYear})</p>
                  <p className="text-muted text-xs font-sans leading-relaxed mb-4">{selectedBook.description}</p>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-2 bg-cream p-3 border-2 border-ink text-center text-[10px] font-mono text-muted">
                    <div>
                      <p className="text-muted uppercase">PAGES</p>
                      <p className="text-ink font-bold">{selectedBook.pages}</p>
                    </div>
                    <div>
                      <p className="text-muted uppercase">FILE SIZE</p>
                      <p className="text-ink font-bold">{selectedBook.fileSize}</p>
                    </div>
                    <div>
                      <p className="text-muted uppercase">FORMAT</p>
                      <p className="text-ink font-bold">PDF / EPUB</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <span className="font-display font-black text-2xl text-brand">${selectedBook.price.toFixed(2)}</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          handleAddToCart(selectedBook);
                          setSelectedBook(null);
                        }}
                        className="btn-ink px-4 py-2.5 text-xs"
                      >
                        Add to Cart
                      </button>
                      <button
                        onClick={() => {
                          setCheckoutBook(selectedBook);
                          setSelectedBook(null);
                        }}
                        className="btn-brand px-4 py-2.5 text-xs"
                      >
                        Direct Purchase
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Direct Buy Transaction Modal */}
      {checkoutBook && (
        <div className="fixed inset-0 z-50 bg-ink/70 backdrop-blur flex items-center justify-center p-4">
          <div className="bg-paper border-2 border-ink p-6 max-w-md w-full relative shadow-2xl max-h-[90vh] overflow-y-auto text-ink">
            <SafetyPin className="absolute top-4 left-4 -rotate-12 hidden sm:block" size={44} />
            <button
              onClick={() => setCheckoutBook(null)}
              className="absolute top-4 right-4 text-muted hover:text-ink font-mono text-sm uppercase border-2 border-ink px-2 py-1"
            >
              Cancel
            </button>

            <h3 className="font-display font-black text-lg text-ink uppercase tracking-tight border-b-2 border-ink pb-3 mb-6">
              Secure Checkout
            </h3>

            <form onSubmit={handleDirectPurchase} className="space-y-4">
              <div className="flex gap-4 items-center bg-cream p-3 border-2 border-ink mb-4">
                <img src={checkoutBook.coverUrl} alt="" className="w-12 h-16 object-cover border-2 border-ink" />
                <div>
                  <h4 className="font-display text-sm text-ink font-bold truncate max-w-[200px]">{checkoutBook.title}</h4>
                  <p className="font-mono text-xs text-brand">${checkoutBook.price.toFixed(2)} • Instant PDF Access</p>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-mono text-muted uppercase tracking-wider">Email for receipt &amp; download (optional)</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="fans@shedstar.com"
                  className="w-full px-4 py-2.5 bg-white border-2 border-ink focus:border-brand text-ink placeholder-muted text-sm font-sans outline-none transition-colors"
                />
                <span className="text-[9px] text-muted leading-none">After payment you'll return here with an instant download link.</span>
              </div>

              <div className="flex items-start gap-2 bg-cream p-3 border-2 border-ink text-[11px] text-muted leading-relaxed">
                <Sparkles className="w-4 h-4 text-brand flex-none mt-0.5" />
                <span>Card details are entered securely on Stripe. Cards, Apple Pay &amp; Google Pay accepted worldwide, plus local European methods.</span>
              </div>

              {checkoutError && (
                <div className="p-3 bg-red-50 border-2 border-red-500 text-red-700 text-[11px] font-mono leading-relaxed">
                  {checkoutError}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-brand w-full mt-6 text-xs disabled:opacity-50"
              >
                {isSubmitting ? (
                  'Redirecting to Stripe…'
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" /> Pay ${checkoutBook.price.toFixed(2)} with Stripe
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Footer Advertising Spot */}
      <div className="mt-16 mb-8">
        <AdSpace placement="footer" className="w-full" />
      </div>

    </div>
    </div>
  );
}
