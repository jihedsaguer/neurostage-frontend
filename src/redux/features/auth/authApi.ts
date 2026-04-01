import { baseApi } from '../../api/baseApi';
import type { LoginDto, RegisterDto, AuthResponse, VerifyEmailResponse, ResendVerificationResponse } from '@/types/auth';

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, LoginDto>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    register: builder.mutation<AuthResponse, RegisterDto>({
      query: (data) => ({
        url: '/auth/register',
        method: 'POST',
        body: data,
      }),
    }),
    logout: builder.mutation<void, { userId: string }>({
      query: (payload) => ({
        url: '/auth/logout',
        method: 'POST',
        body: payload,
      }),
    }),
    verifyEmailToken: builder.mutation<VerifyEmailResponse, string>({
      query: (token) => ({
        url: '/email/verify-email',
        method: 'POST',
        body: { token },
      }),
    }),
    resendVerificationEmail: builder.mutation<ResendVerificationResponse, string>({
      query: (email) => ({
        url: '/email/resend-verification',
        method: 'POST',
        body: { email },
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useVerifyEmailTokenMutation,
  useResendVerificationEmailMutation,
} = authApi;
