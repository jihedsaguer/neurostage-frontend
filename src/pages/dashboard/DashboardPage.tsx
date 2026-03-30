import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store/authStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const DashboardPage = () => {
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
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle className="text-2xl text-slate-900">Dashboard</CardTitle>
              <CardDescription className="text-slate-600">
                Welcome to NeuroStage. Your dashboard is loading role-specific content.
              </CardDescription>
            </div>
            <Button type="button" variant="outline" onClick={handleLogout} className="h-10 rounded-md border-slate-300 text-slate-700 hover:bg-slate-100">
              Logout
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-slate-700">
            This page serves as the generic dashboard fallback for users without a specific role route.
          </p>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-slate-700 mt-4">
            <p className="font-medium">Dashboard placeholder content</p>
            <p className="text-sm text-slate-500">Use this area to add common widgets and announcements.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
  );
};

export default DashboardPage;
