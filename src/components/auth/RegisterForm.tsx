// Register form — RHF + Zod, calls useAuthStore().register(), redirects to verify email

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { useRegisterMutation } from '@/redux/features/auth/authApi';
import { clearError } from '@/redux/features/auth/authSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle } from 'lucide-react';

const registerSchema = z
  .object({
    firstName: z.string().min(2, 'First name must be at least 2 characters'),
    lastName: z.string().min(2, 'Last name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export const RegisterForm = () => {
  const dispatch = useAppDispatch();
  const authError = useAppSelector((state) => state.auth.error);
  const [registerUser, { isLoading }] = useRegisterMutation();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (values: RegisterFormValues) => {
    dispatch(clearError());
    const { confirmPassword, ...dto } = values;

    try {
      await registerUser(dto).unwrap();
      navigate('/verify-email', { replace: true });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="firstName" className="text-slate-700 font-medium">
            First name
          </Label>
          <Input
            id="firstName"
            placeholder="John"
            disabled={isLoading}
            {...register('firstName')}
            className="h-10 border-slate-200 focus-visible:ring-blue-500"
          />
          {errors.firstName && (
            <p className="text-sm text-red-600 font-medium">{errors.firstName.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName" className="text-slate-700 font-medium">
            Last name
          </Label>
          <Input
            id="lastName"
            placeholder="Doe"
            disabled={isLoading}
            {...register('lastName')}
            className="h-10 border-slate-200 focus-visible:ring-blue-500"
          />
          {errors.lastName && (
            <p className="text-sm text-red-600 font-medium">{errors.lastName.message}</p>
          )}
        </div>
      </div>

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

      <div className="space-y-2">
        <Label htmlFor="confirmPassword" className="text-slate-700 font-medium">
          Confirm Password
        </Label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="••••••••"
          disabled={isLoading}
          {...register('confirmPassword')}
          className="h-10 border-slate-200 focus-visible:ring-blue-500"
        />
        {errors.confirmPassword && (
          <p className="text-sm text-red-600 font-medium">{errors.confirmPassword.message}</p>
        )}
      </div>

      {authError && (
        <div className="rounded-lg bg-red-50 p-3 border border-red-200 flex gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700 font-medium">{authError}</p>
        </div>
      )}

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
      >
        {isLoading ? 'Creating account...' : 'Create Account'}
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

      <p className="text-center text-sm text-slate-600">
        Already have an account?{' '}
        <Link
          to="/login"
          className="font-semibold text-blue-600 hover:text-blue-700 underline-offset-4 hover:underline"
        >
          Sign in here
        </Link>
      </p>
    </form>
  );
};