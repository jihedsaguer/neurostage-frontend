import { BASE_URL } from '../../../config/config';

export interface VerifyEmailResponse {
  success: boolean;
  message: string;
}

export interface ResendVerificationResponse {
  success: boolean;
  message: string;
}

/**
 * Verify email using token via API endpoint
 */
export async function verifyEmailToken(token: string): Promise<VerifyEmailResponse> {
  const response = await fetch(`${BASE_URL}/email/verify-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Email verification failed');
  }

  return data;
}

/**
 * Resend verification email to user
 */
export async function resendVerificationEmail(email: string): Promise<ResendVerificationResponse> {
  const response = await fetch(`${BASE_URL}/email/resend-verification`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to resend verification email');
  }

  return data;
}
