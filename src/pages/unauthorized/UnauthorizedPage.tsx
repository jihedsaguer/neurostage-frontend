import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const UnauthorizedPage = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4 text-center">
      <p className="text-8xl font-bold text-slate-200">403</p>
      <h1 className="text-2xl font-bold text-slate-900 mt-2">Access denied</h1>
      <p className="text-slate-500 mt-2 mb-6">You don't have permission to view this page.</p>
      <Button onClick={() => navigate(-1)} variant="outline">Go back</Button>
    </div>
  );
};

export default UnauthorizedPage;
