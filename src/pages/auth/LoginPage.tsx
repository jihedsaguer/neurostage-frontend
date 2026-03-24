// Route page for /login — thin wrapper around LoginForm

import { LoginForm } from '@/features/auth/components/LoginForm';

const LoginPage = () => (
  <div className="min-h-screen flex items-center justify-center bg-background px-4">
    <div className="w-full max-w-md space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
        <p className="text-sm text-muted-foreground">
          Sign in to your NeuroStage account
        </p>
      </div>
      <div className="border rounded-lg p-6 bg-card shadow-sm">
        <LoginForm />
      </div>
    </div>
  </div>
);

export default LoginPage;