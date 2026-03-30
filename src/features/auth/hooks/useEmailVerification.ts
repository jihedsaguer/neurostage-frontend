import { useState } from 'react';
import { verifyEmailToken, resendVerificationEmail } from '../api/emailService';

export interface UseEmailVerificationState {
  loading: boolean;
  message: string | null;
  error: string | null;
}

export interface UseEmailVerification extends UseEmailVerificationState {
  resend: (email: string) => Promise<void>;
  verify: (token: string) => Promise<void>;
  clearMessages: () => void;
}

/**
 * Custom hook for email verification logic
 */
export function useEmailVerification(): UseEmailVerification {
  const [state, setState] = useState<UseEmailVerificationState>({
    loading: false,
    message: null,
    error: null,
  });

  const clearMessages = () => {
    setState((prev) => ({
      ...prev,
      message: null,
      error: null,
    }));
  };

  const resend = async (email: string) => {
    setState({ loading: true, message: null, error: null });
    try {
      const response = await resendVerificationEmail(email);
      setState({
        loading: false,
        message: response.message,
        error: null,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Resend failed';
      setState({
        loading: false,
        message: null,
        error: errorMessage,
      });
    }
  };

  const verify = async (token: string) => {
    setState({ loading: true, message: null, error: null });
    try {
      const response = await verifyEmailToken(token);
      setState({
        loading: false,
        message: response.message,
        error: null,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Verification failed';
      setState({
        loading: false,
        message: null,
        error: errorMessage,
      });
    }
  };

  return {
    ...state,
    resend,
    verify,
    clearMessages,
  };
}
