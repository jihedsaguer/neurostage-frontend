import { Link } from 'react-router-dom';
import AuthLayout from '@/components/auth/AuthLayout';
import { LoginForm } from '@/components/auth/LoginForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const LoginPage = () => (
  <AuthLayout>
    <Card className="border-slate-200 shadow-lg">
      <CardHeader className="space-y-2">
        <CardTitle className="text-2xl text-slate-900">Welcome Back</CardTitle>
        <CardDescription className="text-slate-600">
          Sign in to your NeuroStage account to continue
        </CardDescription>
      </CardHeader>
      <CardContent>
        <LoginForm />
      </CardContent>
    </Card>
    <p className="text-center text-slate-600 text-sm mt-6">
      Don't have an account?{' '}
      <Link to="/register" className="text-blue-600 hover:text-blue-700 font-medium">
        Sign up here
      </Link>
    </p>
  </AuthLayout>
);

export default LoginPage;
