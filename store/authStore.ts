import { create } from 'zustand';
import { User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  role: 'user' | 'admin' | null;
  loading: boolean;
  initialized: boolean;
  setAuth: (user: User | null, role: 'user' | 'admin' | null) => void;
  setLoading: (loading: boolean) => void;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  role: null,
  loading: true,
  initialized: false,
  setAuth: (user, role) => set({ user, role, loading: false, initialized: true }),
  setLoading: (loading) => set({ loading }),
  initialize: () => set({ initialized: true }),
}));
