import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import API from '../services/api';

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (email, password) => {
        const { data } = await API.post('/auth/login', { email, password });
        localStorage.setItem('token', data.token);
        set({ user: data.user, token: data.token, isAuthenticated: true });
        return data;
      },

      register: async (name, email, password) => {
        const { data } = await API.post('/auth/register', { name, email, password });
        localStorage.setItem('token', data.token);
        set({ user: data.user, token: data.token, isAuthenticated: true });
        return data;
      },

      logout: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null, isAuthenticated: false });
      },

      updateProfile: async (userData) => {
        const { data } = await API.put('/auth/profile', userData);
        set({ user: data.user });
        return data;
      },

      fetchProfile: async () => {
        try {
          const { data } = await API.get('/auth/profile');
          set({ user: data.user, isAuthenticated: true });
        } catch (error) {
          set({ user: null, token: null, isAuthenticated: false });
          localStorage.removeItem('token');
        }
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);

export default useAuthStore;
