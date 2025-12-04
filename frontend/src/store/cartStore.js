import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import API from '../services/api';

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      loading: false,

      fetchCart: async () => {
        try {
          set({ loading: true });
          const { data } = await API.get('/cart');
          set({ items: data.cart.items, loading: false });
        } catch (error) {
          set({ loading: false });
          console.error('Fetch cart error:', error);
        }
      },

      addToCart: async (productId, quantity = 1) => {
        try {
          const { data } = await API.post('/cart', { productId, quantity });
          get().fetchCart();
          return data;
        } catch (error) {
          throw error;
        }
      },

      updateQuantity: async (productId, quantity) => {
        try {
          await API.put(`/cart/${productId}`, { quantity });
          get().fetchCart();
        } catch (error) {
          throw error;
        }
      },

      removeItem: async (productId) => {
        try {
          await API.delete(`/cart/${productId}`);
          get().fetchCart();
        } catch (error) {
          throw error;
        }
      },

      clearCart: async () => {
        try {
          await API.delete('/cart');
          set({ items: [] });
        } catch (error) {
          throw error;
        }
      },

      getTotal: () => {
        const { items } = get();
        return items.reduce((total, item) => {
          const price = item.product.salePrice || item.product.price;
          return total + parseFloat(price) * item.quantity;
        }, 0);
      },

      getItemCount: () => {
        const { items } = get();
        return items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);

export default useCartStore;
