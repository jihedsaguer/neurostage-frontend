import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { useLoginMutation } from '@/redux/features/auth/authApi';
import { clearError } from '@/redux/features/auth/authSlice';
import { getRedirectPath } from '@/lib/redirectByRole';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, Mail } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});
type LoginFormValues = z.infer<typeof loginSchema>;

const getErrorMessage = (error: unknown): string | null => {
  if (!error) return null;
  if (typeof error === 'string') return error;
  if (typeof error === 'object' && error !== null) {
    if ('data' in error && typeof error.data === 'object' && error.data && 'message' in error.data) {
      return String((error.data as { message?: string }).message ?? 'Login failed');
    }
    if ('error' in error && typeof (error as { error?: string }).error === 'string') {
      return (error as { error: string }).error;
    }
    if ('message' in error && typeof (error as { message?: string }).message === 'string') {
      return (error as { message: string }).message;
    }
  }
  return 'Login failed';
};

export const LoginForm = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const authError = useAppSelector((state) => state.auth.error);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const role = useAppSelector((state) => state.auth.role);
  const [login, { isLoading, error: loginError }] = useLoginMutation();
  const [lastEmail, setLastEmail] = useState('');

  // Reactive redirect — fires once Redux state settles after login
  useEffect(() => {
    if (isAuthenticated && role) {
      navigate(getRedirectPath(role), { replace: true });
    }
  }, [isAuthenticated, role, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const email = watch('email');
  const errorMessage = authError ?? getErrorMessage(loginError);
  const isEmailVerificationError =
    Boolean(errorMessage?.includes('Email is not verified')) ||
    Boolean(errorMessage?.toLowerCase().includes('email'));

  const onSubmit = async (data: LoginFormValues) => {
    dispatch(clearError());
    setLastEmail(data.email);
    try {
      await login(data).unwrap();
      // navigation is handled by the useEffect above
    } catch {
      // error displayed via loginError
    }
  };

  const handleResendEmail = () => {
    navigate(`/resend-verification?email=${encodeURIComponent(lastEmail || email)}`);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Email Field */}
      <div className="space-y-2">
        <Label htmlFor="email" className="text-slate-700 font-medium">
          Email Address
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          disabled={isLoading}
          {...register('email')}
          className="h-10 border-slate-200 focus-visible:ring-blue-500"
        />
        {errors.email && (
          <p className="text-sm text-red-600 font-medium">{errors.email.message}</p>
        )}
      </div>

      {/* Password Field */}
      <div className="space-y-2">
        <Label htmlFor="password" className="text-slate-700 font-medium">
          Password
        </Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          disabled={isLoading}
          {...register('password')}
          className="h-10 border-slate-200 focus-visible:ring-blue-500"
        />
        {errors.password && (
          <p className="text-sm text-red-600 font-medium">{errors.password.message}</p>
        )}
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="space-y-3">
          <div className="rounded-lg bg-red-50 p-3 border border-red-200 flex gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700 font-medium">{errorMessage}</p>
          </div>

          {isEmailVerificationError && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleResendEmail}
              className="w-full border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
            >
              <Mail className="mr-2 h-4 w-4" />
              Resend Verification Email
            </Button>
          )}
        </div>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
      >
        {isLoading ? 'Signing in...' : 'Sign In'}
      </Button>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-slate-500">or</span>
        </div>
      </div>

      {/* Register Link */}
      <p className="text-center text-sm text-slate-600">
        Don't have an account?{' '}
        <Link
          to="/register"
          className="font-semibold text-blue-600 hover:text-blue-700 underline-offset-4 hover:underline"
        >
          Create one
        </Link>
      </p>
    </form>
  );
};