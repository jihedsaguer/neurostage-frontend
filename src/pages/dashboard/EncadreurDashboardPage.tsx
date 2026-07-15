import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, Users, Briefcase, BookOpen, CheckSquare } from 'lucide-react';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { ProgressRing } from '@/components/dashboard/ProgressRing';
import {
  useGetEncadreurOverviewQuery,
  useGetEncadreurMyStudentsQuery,
  useGetEncadreurJalonAlertsQuery,
} from '@/redux/features/analytics/analyticsApi';
import type { StudentInMyStage, JalonAlert } from '@/redux/features/analytics/analyticsApi';

function StudentProgressCard({ student }: { student: StudentInMyStage }) {
  const navigate = useNavigate();
  const daysLeft = student.stage.endDate
    ? Math.ceil((new Date(student.stage.endDate).getTime() - Date.now()) / 86400000)
    : null;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="font-semibold text-gray-900">
              {student.student.firstName} {student.student.lastName}
            </p>
            <p className="text-xs text-gray-400">{student.student.university} · {student.student.level}</p>
          </div>
          <ProgressRing
            value={student.completionPercentage}
            size={56}
            color={student.completionPercentage >= 75 ? '#22c55e' : student.completionPercentage >= 40 ? '#f59e0b' : '#3b82f6'}
          />
        </div>

        <p className="text-sm text-gray-600 truncate mb-3">{student.subject.title}</p>

        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
          <span>{student.jalons.validated}/{student.jalons.total} jalons</span>
          {student.jalons.nextDeadline && (
            <span className={`font-medium ${new Date(student.jalons.nextDeadline) < new Date() ? 'text-red-600' : 'text-amber-600'}`}>
              Next: {new Date(student.jalons.nextDeadline).toLocaleDateString('fr-FR')}
            </span>
          )}
        </div>

        {student.jalons.overdue > 0 && (
          <div className="flex items-center gap-1 text-xs text-red-600 mb-3">
            <AlertTriangle className="w-3 h-3" />
            {student.jalons.overdue} overdue jalon{student.jalons.overdue > 1 ? 's' : ''}
          </div>
        )}

        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="flex-1 text-xs"
            onClick={() => navigate(`/stages/${student.stageId}/jalons`)}
          >
            View Jalons
          </Button>
          {daysLeft !== null && (
            <span className={`text-xs px-2 py-1 rounded-full flex items-center ${daysLeft < 30 ? 'bg-amber-50 text-amber-700' : 'bg-green-50 text-green-700'}`}>
              {daysLeft}d left
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function JalonAlertsSection({ alerts }: { alerts: JalonAlert[] }) {
  if (!alerts.length) return null;
  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          Jalon Alerts
        </h3>
        <div className="space-y-2">
          {alerts.slice(0, 10).map((alert) => (
            <div key={alert.jalonId} className={`flex items-center justify-between p-3 rounded-lg ${
              alert.daysOverdue > 0 ? 'bg-red-50 border border-red-200' :
              alert.daysOverdue > -3 ? 'bg-amber-50 border border-amber-200' :
              'bg-gray-50'
            }`}>
              <div>
                <p className="text-sm font-medium text-gray-800">{alert.jalonTitle}</p>
                <p className="text-xs text-gray-500">{alert.studentName}</p>
              </div>
              <div className="text-right">
                <p className={`text-xs font-bold ${alert.daysOverdue > 0 ? 'text-red-600' : 'text-amber-600'}`}>
                  {alert.daysOverdue > 0 ? `${alert.daysOverdue}d overdue` : `${Math.abs(alert.daysOverdue)}d left`}
                </p>
                {alert.hasLivrable && <p className="text-xs text-green-600">✓ Livrable submitted</p>}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function EncadreurDashboardPage() {
  const { data: overview, isLoading } = useGetEncadreurOverviewQuery();
  const { data: alerts } = useGetEncadreurJalonAlertsQuery();
  const { data: students, isLoading: isStudentsLoading } = useGetEncadreurMyStudentsQuery();

  return (
    <DashboardLayout
      title="Encadreur Dashboard"
      subtitle="Manage your students and their projects"
      brandName="Encadreur Portal"
    >
      <div className="p-6 space-y-6">
        {/* Metric Cards Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Active Stages"
            value={overview?.stages.active ?? 0}
            subtitle={`${overview?.stages.total ?? 0} total supervised`}
            icon={Briefcase}
            iconColor="text-blue-600"
            iconBg="bg-blue-50"
            isLoading={isLoading}
          />
          <MetricCard
            title="Jalons to Validate"
            value={overview?.pendingActions.jalonsToValidate ?? 0}
            subtitle={`${overview?.jalons.overdue ?? 0} overdue`}
            icon={CheckSquare}
            iconColor="text-amber-600"
            iconBg="bg-amber-50"
            isLoading={isLoading}
          />
          <MetricCard
            title="Candidatures"
            value={overview?.pendingActions.candidaturesToReview ?? 0}
            subtitle="pending review"
            icon={Users}
            iconColor="text-purple-600"
            iconBg="bg-purple-50"
            isLoading={isLoading}
          />
          <MetricCard
            title="Draft Subjects"
            value={overview?.subjects.draft ?? 0}
            subtitle={`${overview?.subjects.pending ?? 0} pending validation`}
            icon={BookOpen}
            iconColor="text-green-600"
            iconBg="bg-green-50"
            isLoading={isLoading}
          />
        </div>

        {/* Jalon Alerts */}
        {alerts && alerts.length > 0 && <JalonAlertsSection alerts={alerts} />}

        {/* My Students Kanban-style cards */}
        <div>
          <h3 className="font-semibold text-gray-800 mb-4">My Students</h3>
          {isStudentsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-48 w-full" />)}
            </div>
          ) : students && students.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {students.map(student => (
                <StudentProgressCard key={student.stageId} student={student} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">You don't have any students currently.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
