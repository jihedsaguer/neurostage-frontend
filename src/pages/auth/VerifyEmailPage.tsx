import { useSearchParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  const verified = searchParams.get('verified');
  const error = searchParams.get('error');

  useEffect(() => {
    if (verified === 'true') {
      setStatus('success');
    } else if (error) {
      setStatus('error');
    }
  }, [verified, error]);

  const handleBackToLogin = () => {
    navigate('/login');
  };

  const handleRequestNewEmail = () => {
    navigate('/resend-verification');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="w-full max-w-md">
        {status === 'success' && (
          <Card className="border-0 shadow-lg">
            <CardHeader className="space-y-2 pb-4">
              <div className="flex justify-center mb-4">
                <div className="rounded-full bg-green-100 p-3">
                  <CheckCircle className="h-12 w-12 text-green-600" />
                </div>
              </div>
              <CardTitle className="text-center text-2xl">Email Verified!</CardTitle>
              <CardDescription className="text-center">
                Your email has been verified successfully
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-center text-sm text-muted-foreground">
                You can now log in to your account with your credentials.
              </p>
              <Button onClick={handleBackToLogin} className="w-full">
                Back to Login
              </Button>
            </CardContent>
          </Card>
        )}

        {status === 'error' && (
          <Card className="border-0 shadow-lg">
            <CardHeader className="space-y-2 pb-4">
              <div className="flex justify-center mb-4">
                <div className="rounded-full bg-red-100 p-3">
                  <AlertCircle className="h-12 w-12 text-red-600" />
                </div>
              </div>
              <CardTitle className="text-center text-2xl">Verification Failed</CardTitle>
              <CardDescription className="text-center">
                {error ? decodeURIComponent(error) : 'Unable to verify your email'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-red-50 p-3 border border-red-200">
                <p className="text-sm text-red-800">
                  The verification link may have expired. Please request a new verification email.
                </p>
              </div>
              <div className="space-y-2">
                <Button onClick={handleRequestNewEmail} variant="default" className="w-full">
                  Request New Verification Email
                </Button>
                <Button onClick={handleBackToLogin} variant="outline" className="w-full">
                  Back to Login
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {status === 'loading' && (
          <Card className="border-0 shadow-lg">
            <CardHeader className="space-y-2 pb-4">
              <div className="flex justify-center mb-4">
                <div className="rounded-full bg-blue-100 p-3">
                  <Clock className="h-12 w-12 text-blue-600 animate-spin" />
                </div>
              </div>
              <CardTitle className="text-center text-2xl">Verifying Email</CardTitle>
              <CardDescription className="text-center">
                Please wait while we verify your email address
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full w-2/3 bg-blue-500 animate-pulse" />
                </div>
                <p className="text-center text-sm text-muted-foreground">
                  This may take a moment...
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <p className="mt-4 text-center text-sm text-muted-foreground">
          Need help?{' '}
          <Link to="/resend-verification" className="text-primary hover:underline underline-offset-4">
            Request new email
          </Link>
        </p>
      </div>
    </div>
  );
}
