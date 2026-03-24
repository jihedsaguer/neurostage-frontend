import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '../../features/auth/store/authStore';
import LoginPage from '../../pages/auth/LoginPage';
import RegisterPage from '../../pages/auth/RegisterPage';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuthStore();
  return !isAuthenticated ? <>{children}</> : <Navigate to="/dashboard" replace />;
};

export const AppRoutes = () => {
  const { isAuthenticated } = useAuthStore();
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><div>Dashboard placeholder</div></ProtectedRoute>} />
      <Route path="/admin/dashboard" element={<ProtectedRoute><div>Admin Dashboard</div></ProtectedRoute>} />
      <Route path="/user/dashboard" element={<ProtectedRoute><div>User Dashboard</div></ProtectedRoute>} />
      <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
    </Routes>
  );
};