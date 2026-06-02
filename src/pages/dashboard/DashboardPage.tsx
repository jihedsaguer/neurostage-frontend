import { DashboardLayout } from '@/components/layout/DashboardLayout';

const DashboardPage = () => {
  return (
    <DashboardLayout
      title="Welcome to NeuroStage"
      subtitle="Loading your role-specific dashboard..."
    >
      <div className="p-6">
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <svg className="h-12 w-12 text-slate-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm font-medium text-slate-700 mb-1">Dashboard Fallback</p>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            This page serves as a generic dashboard fallback. Role-specific dashboards are available at /admin, /formation, /encadreur, /academique, and /student.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;
