import { create } from 'zustand';
import type { LoginDto } from '../types/loginDto';
import type { RegisterDto } from '../types/registerDto';
import type { AuthResponse } from '../types/authResponse';
import type { UserDto } from '../../users/types/user';
import { BASE_URL } from '../../../config/config';

interface AuthState {
  user: UserDto | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (dto: LoginDto) => Promise<UserDto | null>;
  register: (dto: RegisterDto) => Promise<UserDto | null>;
  logout: () => void;
  clearError: () => void;
}

const storedUser = localStorage.getItem('user');
const storedAccess = localStorage.getItem('accessToken');
const storedRefresh = localStorage.getItem('refreshToken');

export const useAuthStore = create<AuthState>((set, get) => ({
  user: storedUser ? JSON.parse(storedUser) : null,
  accessToken: storedAccess ?? null,
  refreshToken: storedRefresh ?? null,
  isAuthenticated: !!storedAccess,
  isLoading: false,
  error: null,

  login: async (dto: LoginDto) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dto),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const data: AuthResponse = await res.json();

      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);

      set({
        user: data.user,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        isAuthenticated: true,
        isLoading: false,
      });

      return data.user;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      return null;
    }
  },

  register: async (dto: RegisterDto) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dto),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message ?? 'Registration failed');
      }

      const data: AuthResponse = await res.json();

      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);

      set({
        user: data.user,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        isAuthenticated: true,
        isLoading: false,
      });

      return data.user; // ✅ required by interface
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Registration failed';

      set({ error: message, isLoading: false });
      return null;
    }
  },

  logout: async () => {
    const { user, accessToken } = get();

    try {
      if (user && accessToken) {
        await fetch(`${BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ userId: user.id }),
        });
      }
    } finally {
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');

      set({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        error: null,
      });
    }
  },

  clearError: () => set({ error: null }),
}));