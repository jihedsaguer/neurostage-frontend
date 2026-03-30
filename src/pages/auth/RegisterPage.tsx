// Route page for /register — thin wrapper around RegisterForm

import { RegisterForm } from '@/features/auth/components/RegisterForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const RegisterPage = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
    <div className="w-full max-w-md">
      {/* Logo Badge */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-blue-600 text-white mb-4">
          <span className="text-xl font-bold">NS</span>
        </div>
        <h1 className="text-3xl font-bold text-slate-900">NeuroStage</h1>
      </div>

      {/* Card Container */}
      <Card className="border-slate-200 shadow-lg">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl text-slate-900">Create Account</CardTitle>
          <CardDescription className="text-slate-600">
            Join NeuroStage and start learning today
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RegisterForm />
        </CardContent>
      </Card>

      {/* Footer Text */}
      <p className="text-center text-slate-600 text-sm mt-6">
        Already have an account?{' '}
        <a href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
          Sign in here
        </a>
      </p>
    </div>
  </div>
);

export default RegisterPage;