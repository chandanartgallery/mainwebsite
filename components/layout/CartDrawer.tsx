'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '@/store/cartStore';
import { useUIStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';
import { X, Trash2, Plus, Minus, MessageSquare, ShoppingBag } from 'lucide-react';
import { useState } from 'react';

export default function CartDrawer() {
  const { cartOpen, setCartOpen, addToast } = useUIStore();
  const { items, updateQuantity, removeItem, getTotalPrice, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    if (items.length === 0) return;
    setLoading(true);

    try {
      const siteUrl = window.location.origin;
      const totalVal = getTotalPrice();
      
      // Build WhatsApp message content
      let msg = `Hello Chandan Art Gallery,\n\nI want to buy the following products:\n\n`;
      items.forEach((item, index) => {
        msg += `${index + 1}. ${item.name} (Qty: ${item.quantity})${item.variant ? ` - Style: ${item.variant}` : ''}\n`;
        msg += `   Price: ₹${(item.price * item.quantity).toLocaleString()}\n`;
        msg += `   Link: ${siteUrl}/product/${item.slug}\n\n`;
      });
      msg += `Subtotal: ₹${totalVal.toLocaleString()}\n\n`;
      msg += `Please let me know price, availability, and how to make payment.`;

      // Log inquiry in database first
      await fetch('/api/inquiries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id,
          productId: items[0]?.productId, // first product for ref
          name: user?.user_metadata?.full_name || 'Guest User',
          email: user?.email || '',
          message: msg.slice(0, 1000), // slice just in case
          type: 'whatsapp'
        })
      });

      // Clear cart
      clearCart();
      setCartOpen(false);

      // Open WhatsApp
      const waNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '8468845759';
      // Append country code 91 as required by PRD
      const waUrl = `https://wa.me/91${waNumber}?text=${encodeURIComponent(msg)}`;
      window.open(waUrl, '_blank');
      addToast('Opening WhatsApp to complete checkout.', 'success');
    } catch (error) {
      console.error('Checkout error:', error);
      addToast('Checkout failed, please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {cartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            onClick={() => setCartOpen(false)}
            className="fixed inset-0 bg-black z-50 cursor-pointer"
          />

          {/* Drawer Container */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed top-0 right-0 h-full w-full sm:max-w-md bg-white dark:bg-zinc-900 shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center bg-gray-50/50 dark:bg-zinc-950/20">
              <div className="flex items-center space-x-2">
                <ShoppingBag className="w-5 h-5 text-luxury-gold" />
                <h3 className="font-serif text-lg text-luxury-black dark:text-luxury-beige">Shopping Cart</h3>
              </div>
              <button
                onClick={() => setCartOpen(false)}
                className="text-gray-400 hover:text-luxury-black dark:hover:text-luxury-beige cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {items.length === 0 ? (
                <div className="h-full flex flex-col justify-center items-center text-center text-gray-400">
                  <ShoppingBag className="w-12 h-12 text-gray-200 dark:text-zinc-800 mb-3" />
                  <p className="text-sm font-medium">Your cart is empty</p>
                  <p className="text-xs text-gray-400 mt-1">Add items to get started with your framing order.</p>
                </div>
              ) : (
                items.map((item) => (
                  <div
                    key={item.id}
                    className="flex pb-4 border-b border-gray-50 dark:border-zinc-800/60"
                  >
                    <div className="w-20 h-20 bg-gray-100 dark:bg-zinc-800 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 ml-4 flex flex-col justify-between">
                      <div>
                        <h4 className="font-serif text-sm text-luxury-black dark:text-white line-clamp-1">
                          {item.name}
                        </h4>
                        {item.variant && (
                          <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-0.5">
                            {item.variant}
                          </p>
                        )}
                        <p className="text-xs font-semibold text-luxury-gold mt-1">
                          ₹{item.price.toLocaleString()}
                        </p>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <div className="flex items-center border border-gray-200 dark:border-zinc-800 rounded-lg bg-gray-50/50 dark:bg-zinc-950/20">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1.5 hover:text-luxury-gold cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2 text-xs font-medium text-luxury-charcoal dark:text-white">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1.5 hover:text-luxury-gold cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-red-400 hover:text-red-600 p-1.5 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer Summary */}
            {items.length > 0 && (
              <div className="p-6 border-t border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-950/20">
                <div className="flex justify-between text-sm font-semibold mb-4">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="text-luxury-black dark:text-luxury-beige">
                    ₹{getTotalPrice().toLocaleString()}
                  </span>
                </div>
                <p className="text-[11px] text-gray-400 mb-4 leading-relaxed">
                  We do not support online payment gateways. Your order will be sent to our design experts on WhatsApp to finalize sizing, frames, and delivery details.
                </p>
                <button
                  onClick={handleCheckout}
                  disabled={loading}
                  className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-lg text-xs font-bold text-white bg-luxury-black dark:bg-luxury-gold dark:text-luxury-black hover:bg-luxury-gold dark:hover:bg-luxury-beige transition-colors duration-300 disabled:opacity-50 tracking-wider uppercase cursor-pointer"
                >
                  {loading ? (
                    'Processing Checkout...'
                  ) : (
                    <>
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Checkout on WhatsApp
                    </>
                  )}
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
