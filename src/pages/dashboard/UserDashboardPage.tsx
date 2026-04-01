import { useLogout } from '@/lib/hooks/useLogout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const UserDashboardPage = () => {
  const { handleLogout } = useLogout();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="w-full max-w-4xl">
        <Card className="border-slate-200 shadow-lg">
          <CardHeader className="space-y-2">
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle className="text-2xl text-slate-900">User Dashboard</CardTitle>
                <CardDescription className="text-slate-600">
                  View your learning progress, active assignments, and account activity.
                </CardDescription>
              </div>
              <Button type="button" variant="outline" onClick={handleLogout} className="h-10 rounded-md border-slate-300 text-slate-700 hover:bg-slate-100">
                Logout
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-slate-700">
                Welcome back. This dashboard will help you track your current tasks and recent activity.
              </p>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-slate-700">
                <p className="font-medium">Dashboard content placeholder</p>
                <p className="text-sm text-slate-500">Add widgets here for assignments, notifications, and progress tracking.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserDashboardPage;
