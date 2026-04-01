import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { useLogoutMutation } from '@/redux/features/auth/authApi';
import { logout } from '@/redux/features/auth/authSlice';

export function useLogout() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const [logoutApi, { isLoading }] = useLogoutMutation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      if (user?.id) {
        await logoutApi({ userId: user.id }).unwrap();
      }
    } catch {
      // Ignore logout errors — clear local state regardless
    } finally {
      dispatch(logout());
      navigate('/login', { replace: true });
    }
  };

  return { handleLogout, isLoading };
}
