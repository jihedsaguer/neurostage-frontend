import { useLogout } from '@/lib/hooks/useLogout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const AcademiqueDashboardPage = () => {
  const { handleLogout } = useLogout();
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="w-full max-w-4xl">
        <Card className="border-slate-200 shadow-lg">
          <CardHeader className="space-y-2">
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle className="text-2xl text-slate-900">Académique Dashboard</CardTitle>
                <CardDescription className="text-slate-600">Academic supervision and reporting.</CardDescription>
              </div>
              <Button type="button" variant="outline" onClick={handleLogout}>Logout</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-slate-700">
              <p className="font-medium">Academic tools</p>
              <p className="text-sm text-slate-500">Your academic supervision tools will appear here.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AcademiqueDashboardPage;
