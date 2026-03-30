import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertCircle, Clock, Copy } from 'lucide-react';
import { useEmailVerification } from '@/features/auth/hooks/useEmailVerification';
import { useAuthStore } from '@/features/auth/store/authStore';

export function VerifyEmailTokenPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { verify, loading, message, error } = useEmailVerification();
  const [copied, setCopied] = useState(false);

  const token = searchParams.get('token');

  useEffect(() => {
    if (token) {
      verify(token);
    }
  }, [token, verify]);

  // Update auth store if verification succeeds and user is logged in
  useEffect(() => {
    if (message && !error) {
      const { user } = useAuthStore.getState();
      if (user) {
        const updatedUser = { ...user, isEmailVerified: true };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        useAuthStore.setState({
          user: updatedUser,
          isEmailVerified: true,
          isAuthenticated: true,
        });
      }
    }
  }, [message, error]);

  const handleBackToLogin = () => {
    navigate('/login');
  };

  const handleCopyToken = () => {
    if (token) {
      navigator.clipboard.writeText(token);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="w-full max-w-md">
        {message && !error && (
          <Card className="border-0 shadow-lg">
            <CardHeader className="space-y-2 pb-4">
              <div className="flex justify-center mb-4">
                <div className="rounded-full bg-green-100 p-3">
                  <CheckCircle className="h-12 w-12 text-green-600" />
                </div>
              </div>
              <CardTitle className="text-center text-2xl">Email Verified!</CardTitle>
              <CardDescription className="text-center">
                {message}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={handleBackToLogin} className="w-full">
                Go to Login
              </Button>
            </CardContent>
          </Card>
        )}

        {error && (
          <Card className="border-0 shadow-lg">
            <CardHeader className="space-y-2 pb-4">
              <div className="flex justify-center mb-4">
                <div className="rounded-full bg-red-100 p-3">
                  <AlertCircle className="h-12 w-12 text-red-600" />
                </div>
              </div>
              <CardTitle className="text-center text-2xl">Verification Failed</CardTitle>
              <CardDescription className="text-center">
                {error}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-red-50 p-3 border border-red-200">
                <p className="text-sm text-red-800">
                  The verification token is invalid or has expired. Please request a new verification email.
                </p>
              </div>

              {token && (
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Token (for debugging):</label>
                  <div className="flex gap-2">
                    <code className="flex-1 bg-slate-100 p-2 rounded text-xs overflow-auto break-all">
                      {token}
                    </code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCopyToken}
                      className="flex-shrink-0"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  {copied && <p className="text-xs text-green-600">Copied!</p>}
                </div>
              )}

              <div className="space-y-2">
                <Button
                  onClick={() => navigate('/resend-verification')}
                  className="w-full"
                >
                  Request New Email
                </Button>
                <Button onClick={handleBackToLogin} variant="outline" className="w-full">
                  Back to Login
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {loading && (
          <Card className="border-0 shadow-lg">
            <CardHeader className="space-y-2 pb-4">
              <div className="flex justify-center mb-4">
                <div className="rounded-full bg-blue-100 p-3">
                  <Clock className="h-12 w-12 text-blue-600 animate-spin" />
                </div>
              </div>
              <CardTitle className="text-center text-2xl">Verifying Email</CardTitle>
              <CardDescription className="text-center">
                Please wait while we verify your email token
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

        {!token && !loading && (
          <Card className="border-0 shadow-lg">
            <CardHeader className="space-y-2 pb-4">
              <div className="flex justify-center mb-4">
                <div className="rounded-full bg-yellow-100 p-3">
                  <AlertCircle className="h-12 w-12 text-yellow-600" />
                </div>
              </div>
              <CardTitle className="text-center text-2xl">No Token Provided</CardTitle>
              <CardDescription className="text-center">
                A verification token is required
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={handleBackToLogin} className="w-full">
                Back to Login
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
