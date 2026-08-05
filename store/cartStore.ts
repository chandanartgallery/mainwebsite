import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string; // product_id + variant combination
  productId: string;
  name: string;
  slug: string;
  price: number;
  imageUrl: string;
  quantity: number;
  variant: string | null;
}

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item, quantity = 1) => {
        const qty = Math.min(99, Math.max(1, Math.floor(Number(quantity) || 1)));
        const safePrice = Number.isFinite(item.price) ? Math.max(0, item.price) : 0;
        const safeItem = { ...item, price: safePrice };
        const currentItems = get().items;
        const existingItemIndex = currentItems.findIndex((i) => i.id === safeItem.id);

        if (existingItemIndex > -1) {
          const updatedItems = [...currentItems];
          updatedItems[existingItemIndex] = {
            ...updatedItems[existingItemIndex],
            quantity: Math.min(99, updatedItems[existingItemIndex].quantity + qty),
          };
          set({ items: updatedItems });
        } else {
          set({ items: [...currentItems, { ...safeItem, quantity: qty }] });
        }
      },
      removeItem: (id) => {
        set({ items: get().items.filter((item) => item.id !== id) });
      },
      updateQuantity: (id, quantity) => {
        const qty = Math.floor(Number(quantity) || 0);
        if (qty <= 0) {
          get().removeItem(id);
          return;
        }
        const clamped = Math.min(99, qty);
        const updatedItems = get().items.map((item) =>
          item.id === id ? { ...item, quantity: clamped } : item
        );
        set({ items: updatedItems });
      },
      clearCart: () => set({ items: [] }),
      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },
      getTotalPrice: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
      },
    }),
    {
      name: 'cag-cart-storage',
      skipHydration: true,
    }
  )
);
