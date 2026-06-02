import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

const STATS = [
  { label: 'Total Users', value: '—', sub: 'Registered accounts' },
  { label: 'Active Roles', value: '—', sub: 'Configured roles' },
  { label: 'Permissions', value: '—', sub: 'Access rules' },
  { label: 'Subjects', value: '—', sub: 'Content units' },
];

const AdminDashboardPage = () => {
  const navigate = useNavigate();

  return (
    <DashboardLayout title="Dashboard" subtitle="Overview of your platform" brandName="Admin Portal">
      <div className="p-6 space-y-6">
        {/* Stat cards */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {STATS.map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-slate-200 bg-white p-4"
            >
              <p className="text-xs font-medium uppercase tracking-wider text-slate-400">{stat.label}</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">{stat.value}</p>
              <p className="mt-0.5 text-xs text-slate-500">{stat.sub}</p>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="mb-4 text-sm font-semibold text-slate-900">Quick actions</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: 'Manage Users', path: '/admin/users', color: 'bg-blue-50 text-blue-700 hover:bg-blue-100' },
              { label: 'Edit Roles', path: '/admin/roles', color: 'bg-violet-50 text-violet-700 hover:bg-violet-100' },
              { label: 'Permissions', path: '/admin/permissions', color: 'bg-amber-50 text-amber-700 hover:bg-amber-100' },
              { label: 'Subjects', path: '/subjects', color: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' },
            ].map((action) => (
              <button
                key={action.path}
                type="button"
                onClick={() => navigate(action.path)}
                className={`rounded-lg px-4 py-3 text-sm font-medium transition-colors ${action.color}`}
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>

        {/* Placeholder content area */}
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
          <p className="text-sm font-medium text-slate-700">Content area</p>
          <p className="mt-1 text-xs text-slate-400">
            Replace with widgets, charts, or tables as needed.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboardPage;