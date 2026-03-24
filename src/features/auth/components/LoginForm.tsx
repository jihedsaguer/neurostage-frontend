import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {z} from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { getRedirectPath } from '@/lib/redirectByRole';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const loginSchema = z.object({
    email: z.string().email({message: 'Invalid email address'}),
    password: z.string().min(6, {message: 'Password must be at least 6 characters'}),
});
type LoginFormValues = z.infer<typeof loginSchema>;

export const LoginForm = () => {
    const {login, isLoading ,error ,clearError} = useAuthStore();
    const navigate = useNavigate();

    const {register, handleSubmit, formState: {errors} 
  } = useForm<LoginFormValues>({
     resolver: zodResolver(loginSchema)}); 

     const onSubmit = async (data: LoginFormValues) => {
        clearError();
        const user = await login(data);
        if(user) {
         navigate(getRedirectPath(user.roles));
        }
        };

        return (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className='space-y-1'  >
                <Label htmlFor="email">Email</Label>
                <Input
                    id="email"
                    type="email"
                    placeholder='you@example.com' 
                    disabled={isLoading}
                    {...register('email')}
                />
                {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}    
                </div>
                <div className="space-y-1">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          disabled={isLoading}
          {...register('password')}
        />
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        )}
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Signing in...' : 'Sign in'}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Don't have an account?{' '}
        <Link
          to="/register"
          className="text-primary underline-offset-4 hover:underline"
        >
          Register
        </Link>
      </p>
    </form>
  );
};