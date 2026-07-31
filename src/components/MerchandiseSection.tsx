/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ShoppingCart, ShoppingBag, Check, ArrowRight, X, Minus, Plus, CreditCard, Sparkles, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { Product, CartItem } from '../types';
import { SafetyPin } from './Decor';

interface MerchandiseSectionProps {
  products: Product[];
  cart: CartItem[];
  onAddToCart: (item: CartItem) => void;
  onRemoveFromCart: (product: Product, size: string, color: string) => void;
  onUpdateCartQty: (product: Product, size: string, color: string, qty: number) => void;
  onOpenCart: () => void;
  onCloseCart: () => void;
  isCartOpen: boolean;
  onClearCart: () => void;
}

export default function MerchandiseSection({
  products,
  cart,
  onAddToCart,
  onRemoveFromCart,
  onUpdateCartQty,
  onOpenCart,
  onCloseCart,
  isCartOpen,
  onClearCart,
}: MerchandiseSectionProps) {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Product details form state
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [addToCartStatus, setAddToCartStatus] = useState(false);

  // Checkout process state — hands off to Stripe hosted Checkout
  const [checkoutStep, setCheckoutStep] = useState<'idle' | 'review' | 'redirecting'>('idle');
  const [checkoutEmail, setCheckoutEmail] = useState('');
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const categories = ['All', 'T-Shirts', 'Hoodies', 'Caps', 'Sweatshirts', 'Bracelets', 'Albums'];

  const filteredProducts = activeCategory === 'All'
    ? products
    : products.filter(p => p.category === activeCategory);

  const cartTotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  const handleOpenProduct = (prod: Product) => {
    setSelectedProduct(prod);
    setSelectedSize(prod.sizes[0] || '');
    setSelectedColor(prod.colors[0] || '');
    setQuantity(1);
    setAddToCartStatus(false);
  };

  const handleAddToCartSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    onAddToCart({
      product: selectedProduct,
      quantity,
      selectedSize,
      selectedColor
    });
    setAddToCartStatus(true);
    setTimeout(() => {
      setAddToCartStatus(false);
      setSelectedProduct(null);
    }, 1000);
  };

  const handleStripeCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    setCheckoutStep('redirecting');
    setCheckoutError(null);

    try {
      const response = await fetch('/api/checkout/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cart, email: checkoutEmail || undefined })
      });
      const data = await response.json();

      if (response.ok && data.url) {
        // Hand off to Stripe's secure hosted checkout page.
        window.location.href = data.url;
      } else {
        setCheckoutError(data.error || 'Could not start checkout. Please try again.');
        setCheckoutStep('review');
      }
    } catch {
      setCheckoutError('Network error contacting the payment server.');
      setCheckoutStep('review');
    }
  };

  return (
    <div className="bg-wash-green grain relative text-ink select-none">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20 text-ink select-none relative">

      <SafetyPin className="absolute top-4 left-4 sm:left-8 -rotate-[28deg]" size={96} />

      {/* Title — white poster caps, centered */}
      <h1 className="poster-title text-white text-center text-6xl sm:text-7xl md:text-8xl mb-10 drop-shadow-[0_3px_0_rgba(0,0,0,0.18)]">
        Merch
      </h1>

      {/* Categories — centered pills */}
      <div className="flex flex-wrap gap-2 mb-12 justify-center">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 border-2 text-xs font-display font-bold uppercase tracking-wide transition-all whitespace-nowrap ${
              activeCategory === cat
                ? 'bg-ink text-white border-ink'
                : 'bg-white/80 hover:bg-white text-ink border-ink'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Product carousel with side arrows */}
      <div className="relative">
        <button
          onClick={() => { const el = document.getElementById('merch-row'); if (el) el.scrollBy({ left: -el.clientWidth * 0.7, behavior: 'smooth' }); }}
          className="absolute left-0 sm:-left-3 top-1/2 -translate-y-1/2 z-10 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)] hover:text-white/80 transition-colors"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-9 h-9 sm:w-12 sm:h-12" strokeWidth={1.5} />
        </button>

        <div id="merch-row" className="carousel-row carousel-1up no-scrollbar px-6 sm:px-10">
          {filteredProducts.map((prod) => (
            <div key={prod.id} className="w-56 sm:w-64 flex-none flex flex-col text-center">
              <button onClick={() => handleOpenProduct(prod)} className="group block">
                <div className="relative aspect-square mb-4">
                  <img
                    src={prod.images[0]}
                    alt={prod.title}
                    className="w-full h-full object-contain group-hover:scale-[1.04] transition-transform duration-500 drop-shadow-[0_12px_20px_rgba(0,0,0,0.28)]"
                  />
                  {prod.stock === 0 && (
                    <span className="absolute top-2 right-2 px-2 py-0.5 bg-ink text-white font-display font-bold text-[9px] uppercase tracking-widest">
                      Sold Out
                    </span>
                  )}
                </div>
                <h3 className="poster-title text-white text-base sm:text-lg leading-tight px-1 min-h-[3.25rem] drop-shadow-[0_2px_0_rgba(0,0,0,0.15)]">
                  {prod.title}
                </h3>
              </button>
              <button
                onClick={() => handleOpenProduct(prod)}
                className="btn-ink w-full mt-3 text-sm !bg-[#333] hover:!bg-ink tracking-[0.12em]"
              >
                Buy Now!!
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={() => { const el = document.getElementById('merch-row'); if (el) el.scrollBy({ left: el.clientWidth * 0.7, behavior: 'smooth' }); }}
          className="absolute right-0 sm:-right-3 top-1/2 -translate-y-1/2 z-10 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)] hover:text-white/80 transition-colors"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-9 h-9 sm:w-12 sm:h-12" strokeWidth={1.5} />
        </button>
      </div>

      {/* Shop-all cue */}
      <div className="flex justify-center mt-12">
        <span className="font-display font-bold text-xs uppercase tracking-[0.2em] text-ink/70">
          Tap any item to choose size, colour &amp; add to bag
        </span>
      </div>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-ink/70 backdrop-blur flex items-center justify-center p-4">
          <div className="bg-paper border-2 border-ink max-w-4xl w-full max-h-[90vh] overflow-y-auto relative shadow-2xl p-6 md:p-8 text-ink">
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 right-4 text-muted hover:text-ink p-2 border-2 border-ink"
              title="Close Details"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start mt-4">

              {/* Product Gallery (Simple multi image toggle) */}
              <div className="flex flex-col gap-4">
                <div className="aspect-square overflow-hidden bg-cream border-2 border-ink">
                  <img
                    src={selectedProduct.images[0]}
                    alt={selectedProduct.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                {selectedProduct.images.length > 1 && (
                  <div className="grid grid-cols-4 gap-2">
                    {selectedProduct.images.map((img, i) => (
                      <div key={i} className="aspect-square border-2 border-ink overflow-hidden bg-cream">
                        <img src={img} alt="detail thumbnail" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Product Configurations Form */}
              <form onSubmit={handleAddToCartSubmit} className="flex flex-col gap-6">
                <div>
                  <span className="text-xs font-mono text-brand uppercase tracking-widest">{selectedProduct.category}</span>
                  <h2 className="text-2xl font-display font-black uppercase tracking-tight text-ink mt-1">{selectedProduct.title}</h2>
                  <p className="text-xl font-display font-bold text-ink mt-2">${selectedProduct.price.toFixed(2)} USD</p>
                </div>

                <p className="text-sm text-muted leading-relaxed font-sans">{selectedProduct.description}</p>

                {/* Size Selection */}
                {selectedProduct.sizes.length > 0 && selectedProduct.sizes[0] !== 'One Size' && (
                  <div className="flex flex-col gap-2">
                    <span className="text-xs text-muted font-mono uppercase tracking-wider">Select Size: {selectedSize}</span>
                    <div className="flex flex-wrap gap-2">
                      {selectedProduct.sizes.map((sz) => (
                        <button
                          key={sz}
                          type="button"
                          onClick={() => setSelectedSize(sz)}
                          className={`w-11 h-11 border-2 text-xs font-display font-bold flex items-center justify-center transition-all ${
                            selectedSize === sz
                              ? 'border-ink bg-ink text-white'
                              : 'border-ink hover:border-brand text-ink'
                          }`}
                        >
                          {sz}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Color Selection */}
                {selectedProduct.colors.length > 0 && (
                  <div className="flex flex-col gap-2">
                    <span className="text-xs text-muted font-mono uppercase tracking-wider">Select Color: {selectedColor}</span>
                    <div className="flex flex-wrap gap-2">
                      {selectedProduct.colors.map((col) => (
                        <button
                          key={col}
                          type="button"
                          onClick={() => setSelectedColor(col)}
                          className={`px-4 py-2 border-2 text-xs font-display font-bold uppercase tracking-wide transition-all ${
                            selectedColor === col
                              ? 'border-brand bg-brand-soft text-brand'
                              : 'border-ink hover:border-brand text-ink'
                          }`}
                        >
                          {col}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity & Inventory Checker */}
                <div className="flex justify-between items-center bg-cream border-2 border-ink p-3">
                  <span className="text-xs text-muted font-mono uppercase tracking-wider">Quantity</span>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-8 h-8 bg-white border-2 border-ink flex items-center justify-center text-sm hover:border-brand text-ink transition-colors"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="font-display text-sm font-bold text-ink w-6 text-center">{quantity}</span>
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.min(selectedProduct.stock, quantity + 1))}
                      className="w-8 h-8 bg-white border-2 border-ink flex items-center justify-center text-sm hover:border-brand text-ink transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="text-xs text-muted font-mono">
                  Stock availability: {selectedProduct.stock > 0 ? `${selectedProduct.stock} items remaining` : 'Out of Stock'}
                </div>

                {/* Add to Cart button or feedback */}
                {selectedProduct.stock > 0 ? (
                  <button
                    type="submit"
                    className="btn-brand w-full text-xs active:scale-95"
                  >
                    {addToCartStatus ? (
                      <>
                        <Check className="w-4 h-4 stroke-[3px]" /> Added to Cart
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-4.5 h-4.5" /> Add to Shopping Cart
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="w-full py-4 bg-cream-dark text-muted font-display font-bold text-xs uppercase tracking-widest border-2 border-ink cursor-not-allowed"
                  >
                    Out of Stock
                  </button>
                )}
              </form>

            </div>
          </div>
        </div>
      )}

      {/* SHOPPING CART OVERLAY SIDEBAR DRAWER */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 bg-ink/70 backdrop-blur flex justify-end select-text">
          <div className="w-full max-w-md bg-paper border-l-2 border-ink flex flex-col justify-between h-screen shadow-2xl relative select-none text-ink">

            {/* Cart Header */}
            <div className="p-5 border-b-2 border-ink flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-brand" />
                <h3 className="font-display font-black uppercase text-ink text-lg tracking-tight">Your Cart ({cart.length})</h3>
              </div>
              <button onClick={onCloseCart} className="p-1 text-muted hover:text-ink" title="Close Cart">
                <X className="w-5 h-5" />
              </button>
            </div>

            {checkoutStep === 'idle' && (
              <>
                {/* Cart List scroll area */}
                <div className="flex-1 p-5 overflow-y-auto flex flex-col gap-4">
                  {cart.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center gap-3 text-center text-muted py-20">
                      <ShoppingBag className="w-12 h-12 text-line" />
                      <p className="text-sm font-semibold">Your shopping cart is currently empty</p>
                      <button
                        onClick={onCloseCart}
                        className="text-xs text-brand underline font-display font-bold uppercase tracking-widest"
                      >
                        Explore Products
                      </button>
                    </div>
                  ) : (
                    cart.map((item, idx) => (
                      <div key={`${item.product.id}-${item.selectedSize}-${item.selectedColor}`} className="flex items-center gap-3 pb-3 border-b-2 border-ink last:border-b-0">
                        <img src={item.product.images[0]} alt={item.product.title} className="w-16 h-16 object-cover border-2 border-ink bg-cream" />

                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-semibold text-ink truncate">{item.product.title}</h4>
                          <p className="text-[10px] text-brand mt-0.5">
                            Size: {item.selectedSize} | Color: {item.selectedColor}
                          </p>
                          <div className="flex items-center justify-between mt-1.5">
                            <span className="text-xs font-mono text-muted font-bold">${item.product.price.toFixed(2)} x {item.quantity}</span>
                            <div className="flex items-center gap-2 bg-cream border-2 border-ink px-1.5 py-0.5">
                              <button onClick={() => onUpdateCartQty(item.product, item.selectedSize, item.selectedColor, Math.max(1, item.quantity - 1))} className="text-muted hover:text-ink text-xs">-</button>
                              <span className="text-xs text-ink font-mono">{item.quantity}</span>
                              <button onClick={() => onUpdateCartQty(item.product, item.selectedSize, item.selectedColor, Math.min(item.product.stock, item.quantity + 1))} className="text-muted hover:text-ink text-xs">+</button>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => onRemoveFromCart(item.product, item.selectedSize, item.selectedColor)}
                          className="p-1 hover:bg-cream text-muted hover:text-red-500 transition-colors"
                          title="Remove item"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                {/* Checkout Panel summary */}
                {cart.length > 0 && (
                  <div className="p-5 border-t-2 border-ink bg-cream flex flex-col gap-4">
                    <div className="flex justify-between items-center font-mono text-sm">
                      <span className="text-muted">Total Order Amount</span>
                      <span className="text-ink font-display font-bold text-lg">${cartTotal.toFixed(2)} USD</span>
                    </div>

                    <button
                      onClick={() => { setCheckoutError(null); setCheckoutStep('review'); }}
                      className="btn-brand w-full text-xs active:scale-95"
                    >
                      Proceed to Checkout <ArrowRight className="w-4.5 h-4.5" />
                    </button>
                  </div>
                )}
              </>
            )}

            {/* Stripe Checkout — review & hand-off */}
            {(checkoutStep === 'review' || checkoutStep === 'redirecting') && (
              <form onSubmit={handleStripeCheckout} className="flex-1 p-5 flex flex-col justify-between overflow-y-auto select-text">
                <div className="flex flex-col gap-4">
                  <div>
                    <h4 className="text-sm font-display font-black uppercase tracking-tight text-ink">Secure Checkout</h4>
                    <p className="text-xs text-muted mt-1">
                      You'll be redirected to Stripe to pay safely. Cards, Apple Pay &amp; Google Pay are accepted worldwide, plus local methods across Europe.
                    </p>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-muted font-mono uppercase tracking-wider">Email for receipt (optional)</label>
                    <input
                      type="email"
                      value={checkoutEmail}
                      onChange={(e) => setCheckoutEmail(e.target.value)}
                      placeholder="jane@outlook.com"
                      className="px-4 py-2.5 bg-white border-2 border-ink focus:border-brand text-xs text-ink placeholder-muted outline-none transition-colors"
                    />
                    <span className="text-[9px] text-muted leading-none mt-0.5">Shipping address &amp; card details are collected securely on Stripe's page.</span>
                  </div>

                  {/* Order review */}
                  <div className="p-3 bg-cream border-2 border-ink font-mono text-xs text-muted flex flex-col gap-1">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>${cartTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <span className="text-brand font-bold">FREE SHIPPING</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t-2 border-ink font-bold text-ink text-sm">
                      <span>Total</span>
                      <span className="text-brand">${cartTotal.toFixed(2)} USD</span>
                    </div>
                  </div>

                  {checkoutError && (
                    <div className="p-3 bg-red-50 border-2 border-red-500 text-red-700 text-[11px] font-mono leading-relaxed">
                      {checkoutError}
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => setCheckoutStep('idle')}
                    disabled={checkoutStep === 'redirecting'}
                    className="w-1/3 py-2.5 bg-cream hover:bg-cream-dark text-ink font-display font-bold text-xs uppercase tracking-wide border-2 border-ink transition-colors disabled:opacity-50"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={checkoutStep === 'redirecting'}
                    className="btn-brand w-2/3 text-xs disabled:opacity-60"
                  >
                    {checkoutStep === 'redirecting'
                      ? 'Redirecting to Stripe…'
                      : <><CreditCard className="w-4 h-4" /> Pay ${cartTotal.toFixed(2)} with Stripe</>}
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
    </div>
  );
}
