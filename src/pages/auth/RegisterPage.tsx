import { Link } from 'react-router-dom';
import AuthLayout from '@/components/auth/AuthLayout';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const RegisterPage = () => (
  <AuthLayout>
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
    <p className="text-center text-slate-600 text-sm mt-6">
      Already have an account?{' '}
      <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
        Sign in here
      </Link>
    </p>
  </AuthLayout>
);

export default RegisterPage;
