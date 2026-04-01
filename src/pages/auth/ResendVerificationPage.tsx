import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { useResendVerificationEmailMutation } from '@/redux/features/auth/authApi';

const resendSchema = z.object({
  email: z.string().email('Invalid email address'),
});

type ResendFormValues = z.infer<typeof resendSchema>;

export function ResendVerificationPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [resendVerificationEmail, { isLoading }] = useResendVerificationEmailMutation();
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const prefilledEmail = searchParams.get('email') || '';

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ResendFormValues>({
    resolver: zodResolver(resendSchema),
    defaultValues: {
      email: prefilledEmail,
    },
  });

  const email = watch('email');

  const onSubmit = async (data: ResendFormValues) => {
    setError(null);

    try {
      await resendVerificationEmail(data.email).unwrap();
      setSubmitted(true);
    } catch (err) {
      if (typeof err === 'string') {
        setError(err);
      } else if (typeof err === 'object' && err !== null && 'data' in err) {
        const message = (err as { data?: { message?: string } }).data?.message;
        setError(message ?? 'Failed to resend verification email');
      } else {
        setError('Failed to resend verification email');
      }
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="w-full max-w-md">
        <Button
          variant="ghost"
          className="mb-4 -ml-2 text-muted-foreground hover:text-foreground"
          onClick={() => navigate('/login')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Login
        </Button>

        {!submitted ? (
          <Card className="border-0 shadow-lg">
            <CardHeader className="space-y-2 pb-4">
              <div className="flex justify-center mb-4">
                <div className="rounded-full bg-blue-100 p-3">
                  <Mail className="h-12 w-12 text-blue-600" />
                </div>
              </div>
              <CardTitle className="text-center text-2xl">Resend Verification Email</CardTitle>
              <CardDescription className="text-center">
                Enter your email address and we'll send you a new verification link
              </CardDescription>
            </CardHeader>

            <CardContent>
              {error && (
                <div className="mb-4 flex items-start gap-3 rounded-lg bg-red-50 p-4 border border-red-200">
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-red-900">Error</p>
                    <p className="text-sm text-red-700 mt-1">{error}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    disabled={isLoading}
                    {...register('email')}
                    className="h-10"
                  />
                  {errors.email && (
                    <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
                  )}
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Sending...' : 'Send Verification Email'}
                </Button>
              </form>

              <p className="mt-4 text-center text-xs text-muted-foreground">
                Already verified?{' '}
                <Link
                  to="/login"
                  className="text-primary hover:underline underline-offset-4 font-medium"
                >
                  Go to login
                </Link>
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-0 shadow-lg">
            <CardHeader className="space-y-2 pb-4">
              <div className="flex justify-center mb-4">
                <div className="rounded-full bg-green-100 p-3">
                  <CheckCircle className="h-12 w-12 text-green-600" />
                </div>
              </div>
              <CardTitle className="text-center text-2xl">Email Sent!</CardTitle>
              <CardDescription className="text-center">
                Check your inbox for the verification link
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  We've sent a verification email to:
                </p>
                <p className="text-sm font-medium text-center bg-slate-100 rounded-lg p-2 break-all">
                  {email}
                </p>
                <p className="text-xs text-muted-foreground">
                  Click the link in the email to verify your account. The link will expire in 24 hours.
                </p>
              </div>

              <div className="rounded-lg bg-blue-50 p-3 border border-blue-200">
                <p className="text-xs text-blue-800">
                  💡 <strong>Tip:</strong> Check your spam or junk folder if you don't see the email within a few minutes.
                </p>
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  navigate('/login');
                }}
              >
                Back to Login
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
