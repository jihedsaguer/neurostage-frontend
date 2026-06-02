import { DashboardLayout } from '@/components/layout/DashboardLayout';

const STATS = [
  { label: 'Total Tasks', value: '—', sub: 'Assigned work' },
  { label: 'In Progress', value: '—', sub: 'Active tasks' },
  { label: 'Completed', value: '—', sub: 'Finished tasks' },
  { label: 'Pending', value: '—', sub: 'Yet to start' },
];

const UserDashboardPage = () => {
  return (
    <DashboardLayout
      title="My Dashboard"
      subtitle="View your progress, assignments, and activity"
      brandName="User Portal"
    >
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

        {/* Placeholder content area */}
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
          <p className="text-sm font-medium text-slate-700">Your activity area</p>
          <p className="mt-1 text-xs text-slate-400">
            Add task list, recent activity, and notifications here.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default UserDashboardPage;
