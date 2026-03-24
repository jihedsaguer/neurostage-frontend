// Route page for /register — thin wrapper around RegisterForm

import { RegisterForm } from '@/features/auth/components/RegisterForm';

const RegisterPage = () => (
  <div className="min-h-screen flex items-center justify-center bg-background px-4">
    <div className="w-full max-w-md space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Create an account</h1>
        <p className="text-sm text-muted-foreground">
          Join NeuroStage today
        </p>
      </div>
      <div className="border rounded-lg p-6 bg-card shadow-sm">
        <RegisterForm />
      </div>
    </div>
  </div>
);

export default RegisterPage;