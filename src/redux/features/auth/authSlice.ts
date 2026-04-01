import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { authApi } from './authApi';
import type { UserDto, RoleName } from '@/types/user';
import type { AuthResponse } from '@/types/auth';

interface AuthState {
  user: UserDto | null;
  role: RoleName | null;        // roles[0].name — single source of truth
  permissions: string[];        // flat list from backend
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  role: null,
  permissions: [],
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

function extractFromResponse(auth: AuthResponse): Pick<AuthState, 'user' | 'role' | 'permissions'> {
  const role = (auth.user.roles?.[0]?.name ?? null) as RoleName | null;
  // permissions can come from the role object or a top-level field
  const permissions: string[] =
    (auth.user.permissions as string[] | undefined) ??
    auth.user.roles?.flatMap((r) => r.permissions ?? []) ??
    [];
  return { user: auth.user, role, permissions };
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(
      state,
      action: PayloadAction<{ user: UserDto; accessToken: string; refreshToken: string }>
    ) {
      const { user, accessToken, refreshToken } = action.payload;
      state.user = user;
      state.role = (user.roles?.[0]?.name ?? null) as RoleName | null;
      state.permissions = (user.permissions as string[] | undefined) ?? user.roles?.flatMap((r) => r.permissions ?? []) ?? [];
      state.accessToken = accessToken;
      state.refreshToken = refreshToken;
      state.isAuthenticated = true;
      state.error = null;
      state.isLoading = false;
    },
    logout() {
      return initialState;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(authApi.endpoints.login.matchPending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addMatcher(authApi.endpoints.login.matchFulfilled, (state, action) => {
        const { user, role, permissions } = extractFromResponse(action.payload as AuthResponse);
        state.user = user;
        state.role = role;
        state.permissions = permissions;
        state.accessToken = (action.payload as AuthResponse).accessToken;
        state.refreshToken = (action.payload as AuthResponse).refreshToken;
        state.isAuthenticated = true;
        state.isLoading = false;
        state.error = null;
      })
      .addMatcher(authApi.endpoints.login.matchRejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error?.message ?? 'Login failed';
      })
      .addMatcher(authApi.endpoints.register.matchPending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addMatcher(authApi.endpoints.register.matchFulfilled, (state, action) => {
        const { user, role, permissions } = extractFromResponse(action.payload as AuthResponse);
        state.user = user;
        state.role = role;
        state.permissions = permissions;
        state.accessToken = (action.payload as AuthResponse).accessToken;
        state.refreshToken = (action.payload as AuthResponse).refreshToken;
        state.isAuthenticated = true;
        state.isLoading = false;
        state.error = null;
      })
      .addMatcher(authApi.endpoints.register.matchRejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error?.message ?? 'Registration failed';
      })
      .addMatcher(authApi.endpoints.logout.matchFulfilled, () => initialState)
      .addMatcher(authApi.endpoints.logout.matchRejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error?.message ?? 'Logout failed';
      });
  },
});

export const { setCredentials, logout, clearError } = authSlice.actions;
export default authSlice.reducer;
