import { DashboardLayout } from '@/components/layout/DashboardLayout';

const STATS = [
  { label: 'Total Students', value: '—', sub: 'Under supervision' },
  { label: 'Active Projects', value: '—', sub: 'In progress' },
  { label: 'Pending Reviews', value: '—', sub: 'Awaiting review' },
  { label: 'Completed', value: '—', sub: 'Validated projects' },
];

const AcademiqueDashboardPage = () => {
  return (
    <DashboardLayout
      title="Académique Dashboard"
      subtitle="Academic supervision and reporting"
      brandName="Academic Portal"
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
          <p className="text-sm font-medium text-slate-700">Academic supervision area</p>
          <p className="mt-1 text-xs text-slate-400">
            Add student lists, project reviews, and academic reports here.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AcademiqueDashboardPage;
