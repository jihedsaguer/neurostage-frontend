import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store/authStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const AdminDashboardPage = () => {
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
    <div className="w-full max-w-4xl">
      <Card className="border-slate-200 shadow-lg">
        <CardHeader className="space-y-2">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="text-2xl text-slate-900">Admin Dashboard</CardTitle>
              <CardDescription className="text-slate-600">
                Access admin controls, review system activity, and manage platform settings.
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" onClick={() => navigate('/admin/users')} className="h-10 rounded-md border-slate-300 text-slate-700 hover:bg-slate-100">
                Manage Users
              </Button>
              <Button type="button" variant="outline" onClick={handleLogout} className="h-10 rounded-md border-slate-300 text-slate-700 hover:bg-slate-100">
                Logout
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-slate-700">
              Welcome to the admin portal. Use the sidebar to navigate user management, role assignments, and permissions.
            </p>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-slate-700">
              <p className="font-medium">Dashboard content placeholder</p>
              <p className="text-sm text-slate-500">Replace this area with widgets, charts, or admin controls as needed.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
  );
};

export default AdminDashboardPage;
