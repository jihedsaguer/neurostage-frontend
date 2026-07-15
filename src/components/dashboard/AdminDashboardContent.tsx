import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Users, Briefcase, BookOpen, CheckSquare,
} from 'lucide-react';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { AlertBadge } from '@/components/dashboard/AlertBadge';
import { SimpleBarChart } from '@/components/dashboard/SimpleBarChart';
import {
  useGetAdminOverviewQuery,
  useGetPendingActionsQuery,
  useGetCandidaturesTimelineQuery,
  useGetSubjectsByLevelQuery,
  useGetStagesPerUniversityQuery,
  useGetRecentActivityQuery,
} from '@/redux/features/analytics/analyticsApi';

export function AdminDashboardContent() {
  const { data: overview, isLoading } = useGetAdminOverviewQuery();
  const { data: pendingActions } = useGetPendingActionsQuery();
  const { data: timeline } = useGetCandidaturesTimelineQuery();
  const { data: byLevel } = useGetSubjectsByLevelQuery();
  const { data: byUniversity } = useGetStagesPerUniversityQuery();
  const { data: recentActivity } = useGetRecentActivityQuery();
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Pending Actions Alert Bar */}
      {pendingActions && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <AlertBadge
            count={pendingActions.subjectsPendingValidation}
            label="Subjects awaiting validation"
            severity="high"
            onClick={() => navigate('/subjects?status=PENDING')}
          />
          <AlertBadge
            count={pendingActions.jalonsOverdue}
            label="Overdue jalons"
            severity="high"
          />
          <AlertBadge
            count={pendingActions.stagesWithoutEncadreur}
            label="Stages without supervisor"
            severity="medium"
            onClick={() => navigate('/admin/stages')}
          />
          <AlertBadge
            count={pendingActions.candidaturesPendingReview}
            label="Candidatures pending review"
            severity="medium"
          />
          <AlertBadge
            count={pendingActions.studentsWithoutStage}
            label="Accepted students without stage"
            severity="low"
          />
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Users"
          value={overview?.users.total ?? 0}
          subtitle={`${overview?.users.newThisMonth ?? 0} new this month`}
          icon={Users}
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
          isLoading={isLoading}
          trend={{ value: overview?.users.newThisMonth ?? 0, label: 'this month', positive: true }}
        />
        <MetricCard
          title="Active Stages"
          value={overview?.stages.active ?? 0}
          subtitle={`${overview?.stages.total ?? 0} total`}
          icon={Briefcase}
          iconColor="text-green-600"
          iconBg="bg-green-50"
          isLoading={isLoading}
        />
        <MetricCard
          title="Validated Subjects"
          value={overview?.subjects.validated ?? 0}
          subtitle={`${overview?.subjects.pending ?? 0} pending review`}
          icon={BookOpen}
          iconColor="text-purple-600"
          iconBg="bg-purple-50"
          isLoading={isLoading}
          onClick={() => navigate('/subjects')}
        />
        <MetricCard
          title="Jalon Completion"
          value={`${Math.round(overview?.jalons.completionRate ?? 0)}%`}
          subtitle={`${overview?.jalons.overdue ?? 0} overdue`}
          icon={CheckSquare}
          iconColor="text-amber-600"
          iconBg="bg-amber-50"
          isLoading={isLoading}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Candidatures — Last 6 Months</h3>
            {timeline ? (
              <SimpleBarChart
                title="Monthly candidatures"
                data={timeline.map(t => ({
                  label: t.month.slice(5),
                  value: t.total,
                  color: 'bg-blue-500',
                }))}
              />
            ) : <Skeleton className="h-32 w-full" />}
            {timeline && (
              <div className="mt-4 flex gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-400 inline-block" /> Accepted: {timeline.reduce((s, t) => s + t.accepted, 0)}</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-400 inline-block" /> Rejected: {timeline.reduce((s, t) => s + t.rejected, 0)}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Subjects by Level</h3>
            {byLevel ? (
              <SimpleBarChart
                title=""
                data={byLevel.map(l => ({
                  label: l.level || 'Unknown',
                  value: l.count,
                  color: l.level?.startsWith('L') ? 'bg-green-500' : l.level?.startsWith('M') ? 'bg-blue-500' : 'bg-purple-500',
                }))}
              />
            ) : <Skeleton className="h-32 w-full" />}
          </CardContent>
        </Card>
      </div>

      {/* Activity + Universities Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {recentActivity?.slice(0, 8).map((activity, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">{activity.actorName}</span>
                      {' — '}
                      <span className="text-gray-500">{activity.targetName}</span>
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(activity.createdAt).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${
                    activity.type === 'USER_REGISTERED' ? 'bg-blue-100 text-blue-600' :
                    activity.type === 'STAGE_STARTED' ? 'bg-green-100 text-green-600' :
                    activity.type === 'JALON_VALIDATED' ? 'bg-purple-100 text-purple-600' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {activity.type.replace(/_/g, ' ')}
                  </span>
                </div>
              ))}
              {!recentActivity && <Skeleton className="h-40 w-full" />}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Stages by University</h3>
            {byUniversity ? (
              <SimpleBarChart
                title=""
                data={byUniversity.slice(0, 8).map(u => ({
                  label: u.university || 'Unknown',
                  value: u.count,
                  color: 'bg-indigo-500',
                }))}
              />
            ) : <Skeleton className="h-32 w-full" />}
          </CardContent>
        </Card>
      </div>

      {/* AI Usage Section */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold text-gray-800 mb-4">✨ AI Usage</h3>
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-600">{overview?.ai.totalGenerations ?? 0}</p>
              <p className="text-sm text-gray-500 mt-1">Subject drafts generated</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">{overview?.ai.studentsWithCv ?? 0}</p>
              <p className="text-sm text-gray-500 mt-1">CVs processed by AI</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">{overview?.ai.subjectsIndexed ?? 0}</p>
              <p className="text-sm text-gray-500 mt-1">Subjects in AI index</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
