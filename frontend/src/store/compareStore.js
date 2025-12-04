import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useCompareStore = create(
  persist(
    (set, get) => ({
      products: [],

      addToCompare: (product) => {
        const { products } = get();
        
        if (products.length >= 3) {
          throw new Error('Maximum 3 products can be compared');
        }

        if (products.find((p) => p.id === product.id)) {
          throw new Error('Product already in comparison');
        }

        set({ products: [...products, product] });
      },

      removeFromCompare: (productId) => {
        set((state) => ({
          products: state.products.filter((p) => p.id !== productId),
        }));
      },

      clearCompare: () => {
        set({ products: [] });
      },
    }),
    {
      name: 'compare-storage',
    }
  )
);

export default useCompareStore;
