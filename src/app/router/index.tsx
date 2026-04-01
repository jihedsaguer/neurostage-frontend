import { Routes, Route, Navigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { logout } from '@/redux/features/auth/authSlice';
import type { RoleName } from '@/types/user';
import { getRedirectPath, ROLE_LANDING } from '@/lib/redirectByRole';

// auth pages
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import { VerifyEmailPage } from '@/pages/auth/VerifyEmailPage';
import { ResendVerificationPage } from '@/pages/auth/ResendVerificationPage';
import { VerifyEmailTokenPage } from '@/pages/auth/VerifyEmailTokenPage';

// dashboards
import AdminDashboardPage from '@/pages/dashboard/AdminDashboardPage';
import FormationDashboardPage from '@/pages/dashboard/FormationDashboardPage';
import EncadreurDashboardPage from '@/pages/dashboard/EncadreurDashboardPage';
import AcademiqueDashboardPage from '@/pages/dashboard/AcademiqueDashboardPage';
import StudentDashboardPage from '@/pages/dashboard/StudentDashboardPage';

// admin pages
import AdminUsersPage from '@/pages/users/AdminUsersPage';
import AdminRolesPage from '@/pages/roles/AdminRolesPage';
import AdminPermissionsPage from '@/pages/permissions/AdminPermissionsPage';

// misc
import UnauthorizedPage from '@/pages/unauthorized/UnauthorizedPage';
import NotFoundPage from '@/pages/NotFoundPage';

// ---------------------------------------------------------------------------
// ProtectedRoute — redirects to /login if not authenticated,
//                  redirects to /unauthorized if role not in requiredRoles.
//                  Pass no requiredRoles to allow any authenticated user.
// ---------------------------------------------------------------------------
interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: RoleName[];
}

const ProtectedRoute = ({ children, requiredRoles }: ProtectedRouteProps) => {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const role = useAppSelector((state) => state.auth.role);

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (requiredRoles && requiredRoles.length > 0) {
    if (!role || !requiredRoles.includes(role)) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <>{children}</>;
};

// ---------------------------------------------------------------------------
// PublicRoute — redirects authenticated users to their dashboard
// ---------------------------------------------------------------------------
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const role = useAppSelector((state) => state.auth.role);

  if (isAuthenticated) {
    if (!role || !(role in ROLE_LANDING)) {
      dispatch(logout());
      return <>{children}</>;
    }
    return <Navigate to={getRedirectPath(role)} replace />;
  }
  return <>{children}</>;
};

// ---------------------------------------------------------------------------
// RootRedirect — smart redirect from "/"
// ---------------------------------------------------------------------------
const RootRedirect = () => {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const role = useAppSelector((state) => state.auth.role);

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  // If role is stale/unknown (e.g. old session with renamed roles), clear and go to login
  if (!role || !(role in ROLE_LANDING)) {
    dispatch(logout());
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={getRedirectPath(role)} replace />;
};

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------
export const AppRoutes = () => (
  <Routes>
    {/* root */}
    <Route path="/" element={<RootRedirect />} />

    {/* public */}
    <Route path="/login"               element={<PublicRoute><LoginPage /></PublicRoute>} />
    <Route path="/register"            element={<PublicRoute><RegisterPage /></PublicRoute>} />
    <Route path="/verify-email"        element={<VerifyEmailPage />} />
    <Route path="/verify-email-token"  element={<VerifyEmailTokenPage />} />
    <Route path="/resend-verification" element={<ResendVerificationPage />} />

    {/* super_admin */}
    <Route path="/admin/dashboard"  element={<ProtectedRoute requiredRoles={['super_admin']}><AdminDashboardPage /></ProtectedRoute>} />
    <Route path="/admin/users"      element={<ProtectedRoute requiredRoles={['super_admin']}><AdminUsersPage /></ProtectedRoute>} />
    <Route path="/admin/roles"      element={<ProtectedRoute requiredRoles={['super_admin']}><AdminRolesPage /></ProtectedRoute>} />
    <Route path="/admin/permissions" element={<ProtectedRoute requiredRoles={['super_admin']}><AdminPermissionsPage /></ProtectedRoute>} />

    {/* admin_formation */}
    <Route path="/formation/dashboard" element={<ProtectedRoute requiredRoles={['admin_formation']}><FormationDashboardPage /></ProtectedRoute>} />

    {/* encadrant_pro */}
    <Route path="/encadreur/dashboard" element={<ProtectedRoute requiredRoles={['encadrant_pro']}><EncadreurDashboardPage /></ProtectedRoute>} />

    {/* encadrant_academique */}
    <Route path="/academique/dashboard" element={<ProtectedRoute requiredRoles={['encadrant_academique']}><AcademiqueDashboardPage /></ProtectedRoute>} />

    {/* student */}
    <Route path="/student/dashboard" element={<ProtectedRoute requiredRoles={['student']}><StudentDashboardPage /></ProtectedRoute>} />

    {/* misc */}
    <Route path="/unauthorized" element={<UnauthorizedPage />} />
    <Route path="*"             element={<NotFoundPage />} />
  </Routes>
);
