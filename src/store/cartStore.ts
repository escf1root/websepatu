import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  productId: number;
  productName: string;
  brand: string;
  size: string;
  price: number;
  quantity: number;
  imageFilename: string;
}

interface CartStore {
  items: CartItem[];
  isDrawerOpen: boolean;
  addItem: (item: CartItem) => void;
  removeItem: (productId: number, size: string) => void;
  updateQuantity: (productId: number, size: string, quantity: number) => void;
  clearCart: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isDrawerOpen: false,

      addItem: (newItem) => {
        const existing = get().items.find(
          (i) => i.productId === newItem.productId && i.size === newItem.size
        );
        if (existing) {
          set((state) => ({
            items: state.items.map((i) =>
              i.productId === newItem.productId && i.size === newItem.size
                ? { ...i, quantity: i.quantity + newItem.quantity }
                : i
            ),
          }));
        } else {
          set((state) => ({ items: [...state.items, newItem] }));
        }
      },

      removeItem: (productId, size) =>
        set((state) => ({
          items: state.items.filter(
            (i) => !(i.productId === productId && i.size === size)
          ),
        })),

      updateQuantity: (productId, size, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId, size);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId && i.size === size
              ? { ...i, quantity }
              : i
          ),
        }));
      },

      clearCart: () => set({ items: [] }),
      openDrawer: () => set({ isDrawerOpen: true }),
      closeDrawer: () => set({ isDrawerOpen: false }),
    }),
    {
      name: 'solemate-cart',
    }
  )
);
