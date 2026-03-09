import { create } from 'zustand';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { useAppStore } from './useAppStore';

interface AuthState {
  user: User | null;
  session: Session | null;
  initialized: boolean;
  setSession: (session: Session | null) => void;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  initialized: false,
  setSession: (session) => set({ user: session?.user || null, session, initialized: true }),
  signOut: async () => {
    await supabase.auth.signOut();
    useAppStore.getState().reset();
    set({ user: null, session: null });
  },
}));