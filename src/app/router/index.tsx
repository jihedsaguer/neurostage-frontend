import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '../../features/auth/store/authStore';
import LoginPage from '../../pages/auth/LoginPage';
import RegisterPage from '../../pages/auth/RegisterPage';
import { VerifyEmailPage } from '../../pages/auth/VerifyEmailPage';
import { ResendVerificationPage } from '../../pages/auth/ResendVerificationPage';
import { VerifyEmailTokenPage } from '../../pages/auth/VerifyEmailTokenPage';
import DashboardPage from '../../pages/dashboard/DashboardPage';
import AdminDashboardPage from '../../pages/dashboard/AdminDashboardPage';
import UserDashboardPage from '../../pages/dashboard/UserDashboardPage';
import AdminUsersPage from '../../pages/users/AdminUsersPage';
import { getRedirectPath } from '../../lib/redirectByRole';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, user } = useAuthStore();
  
  // Only redirect if explicitly not verified
  if (user && user.isEmailVerified === false) {
    return <Navigate to="/verify-email" replace />;
  }
  
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, user } = useAuthStore();
  
  // If user has session, redirect to role-specific dashboard
  if (isAuthenticated && user) {
    return <Navigate to={getRedirectPath(user.roles)} replace />;
  }
  
  return <>{children}</>;
};



export const AppRoutes = () => {
  const { isAuthenticated, user } = useAuthStore();
  
  // Determine redirect for root and catch-all
  let rootRedirect = '/login';
  if (isAuthenticated && user?.isEmailVerified === true) {
    rootRedirect = getRedirectPath(user.roles);
  } else if (user && user.isEmailVerified === false) {
    rootRedirect = '/verify-email';
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to={rootRedirect} replace />} />
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/verify-email-token" element={<VerifyEmailTokenPage />} />
      <Route path="/resend-verification" element={<ResendVerificationPage />} />
      <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboardPage /></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute><AdminUsersPage /></ProtectedRoute>} />
      <Route path="/user/dashboard" element={<ProtectedRoute><UserDashboardPage /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to={rootRedirect} replace />} />
    </Routes>
  );
};