import { create } from 'zustand';

const AUTH_STORAGE_KEY = 'kbot_auth';

export interface AuthUser {
  id: number;
  email: string;
  name: string;
  role: string;
  tier: string;
  k_compute_balance: number;
  k_compute_used: number;
  avatar_url?: string;
  [key: string]: unknown;
}

interface StoredAuth {
  user: AuthUser | null;
  session: string | null;
}

function readStoredAuth(): StoredAuth {
  if (typeof window === 'undefined') {
    return { user: null, session: null };
  }

  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);

    if (!raw) {
      return { user: null, session: null };
    }

    const parsed = JSON.parse(raw);

    return { user: parsed.user ?? null, session: parsed.session ?? null };
  } catch {
    return { user: null, session: null };
  }
}

interface AuthState extends StoredAuth {
  setAuth: (user: AuthUser, session: string) => void;
  logout: () => void;
  refreshUser: (user: AuthUser) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  ...readStoredAuth(),
  setAuth: (user, session) => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ user, session }));
    }

    set({ user, session });
  },
  refreshUser: (user) => {
    if (typeof window !== 'undefined') {
      const current = readStoredAuth();
      window.localStorage.setItem(
        AUTH_STORAGE_KEY,
        JSON.stringify({ user, session: current.session }),
      );
    }

    set({ user });
  },
  logout: () => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
      document.cookie = 'kbot_session=; path=/; max-age=0';
    }

    set({ user: null, session: null });
  },
}));
