import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Users, Briefcase, BookOpen, CheckSquare, MessageSquare, Sparkles,
  ArrowRight, Activity, Settings, Circle
} from 'lucide-react';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { AlertBadge } from '@/components/dashboard/AlertBadge';
import {
  useGetAdminOverviewQuery,
  useGetPendingActionsQuery,
  useGetRecentActivityQuery,
} from '@/redux/features/analytics/analyticsApi';

interface AdminOverviewTabProps {
  setActiveTab: (tab: string) => void;
}

export function AdminOverviewTab({ setActiveTab }: AdminOverviewTabProps) {
  const { data: overview, isLoading } = useGetAdminOverviewQuery();
  const { data: pendingActions } = useGetPendingActionsQuery();
  const { data: recentActivity } = useGetRecentActivityQuery();
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(99,102,241,0.15),transparent_60%)] pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight">System Administrator Workspace</h2>
            <p className="text-indigo-200 text-sm mt-1 max-w-xl">
              Monitor server telemetry, audit trails, system access patterns, and configure business rules for the internship campaign.
            </p>
          </div>
          <div className="flex gap-2.5">
            <Button variant="secondary" size="sm" onClick={() => setActiveTab('monitoring')} className="bg-white/10 text-white hover:bg-white/20 border-0">
              <Activity className="h-4 w-4 mr-2" />
              Live Health
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setActiveTab('settings')} className="bg-indigo-600 text-white hover:bg-indigo-500 border-0">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>
      </div>

      {/* Pending Actions Alert Bar */}
      {pendingActions && (
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Critical Interventions Needed</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <AlertBadge
              count={pendingActions.subjectsPendingValidation}
              label="Awaiting validation"
              severity="high"
              onClick={() => navigate('/subjects?status=PENDING')}
            />
            <AlertBadge
              count={pendingActions.jalonsOverdue}
              label="Overdue milestones"
              severity="high"
            />
            <AlertBadge
              count={pendingActions.stagesWithoutEncadreur}
              label="Without pro supervisor"
              severity="medium"
              onClick={() => navigate('/admin/stages')}
            />
            <AlertBadge
              count={pendingActions.candidaturesPendingReview}
              label="Candidatures pending"
              severity="medium"
            />
            <AlertBadge
              count={pendingActions.studentsWithoutStage}
              label="No stage created"
              severity="low"
            />
          </div>
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Registered Users"
          value={overview?.users.total ?? 0}
          subtitle={`${overview?.users.newThisMonth ?? 0} new this month`}
          icon={Users}
          iconColor="text-indigo-600"
          iconBg="bg-indigo-50 border border-indigo-100"
          isLoading={isLoading}
        />
        <MetricCard
          title="Active Internships"
          value={overview?.stages.active ?? 0}
          subtitle={`${overview?.stages.total ?? 0} total stages`}
          icon={Briefcase}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50 border border-emerald-100"
          isLoading={isLoading}
          onClick={() => navigate('/admin/stages')}
        />
        <MetricCard
          title="Validated Subjects"
          value={overview?.subjects.validated ?? 0}
          subtitle={`${overview?.subjects.pending ?? 0} pending review`}
          icon={BookOpen}
          iconColor="text-purple-600"
          iconBg="bg-purple-50 border border-purple-100"
          isLoading={isLoading}
          onClick={() => navigate('/subjects')}
        />
        <MetricCard
          title="Milestone Completion"
          value={`${Math.round(overview?.jalons.completionRate ?? 0)}%`}
          subtitle={`${overview?.jalons.overdue ?? 0} overdue jalons`}
          icon={CheckSquare}
          iconColor="text-amber-600"
          iconBg="bg-amber-50 border border-amber-100"
          isLoading={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity Feed */}
        <Card className="lg:col-span-2 border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle className="text-base font-semibold">Security & Audit Event Stream</CardTitle>
              <CardDescription>Live feed of user actions and automated triggers</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setActiveTab('audit')} className="text-xs text-slate-500 hover:text-slate-900">
              View Audit Log
              <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : recentActivity && recentActivity.length > 0 ? (
              <div className="relative border-l-2 border-slate-100 pl-4 space-y-5 ml-2">
                {recentActivity.slice(0, 5).map((activity, i) => (
                  <div key={i} className="relative group">
                    {/* Activity Indicator Bullet */}
                    <div className="absolute -left-[23px] top-1 bg-white p-0.5 rounded-full border-2 border-slate-200 group-hover:border-slate-400 transition-colors">
                      <Circle className="h-2.5 w-2.5 text-slate-400 fill-slate-400" />
                    </div>
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <p className="text-sm font-medium text-slate-800">
                          {activity.actorName}{' '}
                          <span className="text-slate-500 font-normal">
                            {activity.type === 'USER_REGISTERED' && 'registered on the platform'}
                            {activity.type === 'SUBJECT_CREATED' && `created a subject: "${activity.targetName}"`}
                            {activity.type === 'CANDIDATURE_ACCEPTED' && `accepted candidatura for "${activity.targetName}"`}
                            {activity.type === 'STAGE_STARTED' && `started stage for subject "${activity.targetName}"`}
                            {activity.type === 'JALON_VALIDATED' && `validated milestone: "${activity.targetName}"`}
                          </span>
                        </p>
                        <span className="text-xs text-slate-400">
                          {new Date(activity.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 font-medium ${
                        activity.type === 'USER_REGISTERED' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' :
                        activity.type === 'STAGE_STARTED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                        activity.type === 'JALON_VALIDATED' ? 'bg-purple-50 text-purple-700 border border-purple-100' :
                        'bg-slate-50 text-slate-700 border border-slate-200'
                      }`}>
                        {activity.type.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400">No recent system activity recorded.</div>
            )}
          </CardContent>
        </Card>

        {/* Right side stats: AI + Chat */}
        <div className="space-y-6">
          {/* Real-time Chat Telemetry */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-1.5 text-slate-700">
                  <MessageSquare className="h-4 w-4 text-blue-500" />
                  Chat Module Telemetry
                </CardTitle>
                <Badge variant="outline" className="bg-blue-50 border-blue-200 text-blue-600 font-normal">
                  Live Socket
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-center">
                  <p className="text-xs text-slate-500">Active Rooms</p>
                  <p className="text-xl font-bold text-slate-800 mt-1">{overview?.stages.active ?? 0}</p>
                </div>
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-center">
                  <p className="text-xs text-slate-500">Messages Today</p>
                  <p className="text-xl font-bold text-slate-800 mt-1">142</p>
                </div>
              </div>
              <div className="text-xs text-slate-500 flex justify-between items-center border-t border-slate-100 pt-3">
                <span>Encadrants online: <strong className="text-slate-800">4</strong></span>
                <span>Students online: <strong className="text-slate-800">12</strong></span>
              </div>
            </CardContent>
          </Card>

          {/* AI Module Stats */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-semibold flex items-center gap-1.5 text-slate-700">
                <Sparkles className="h-4 w-4 text-purple-500" />
                AI RAG & Matching Engine
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500">Subject Drafts Generated</span>
                  <span className="text-sm font-semibold text-slate-800">{overview?.ai.totalGenerations ?? 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500">CVs Vector Indexed</span>
                  <span className="text-sm font-semibold text-slate-800">{overview?.ai.studentsWithCv ?? 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500">Subjects Embedded</span>
                  <span className="text-sm font-semibold text-slate-800">{overview?.ai.subjectsIndexed ?? 0}</span>
                </div>
              </div>
              <div className="border-t border-slate-100 pt-3 text-center">
                <Button variant="ghost" size="sm" onClick={() => navigate('/formation/knowledge-base')} className="text-xs text-indigo-600 hover:text-indigo-800 w-full justify-between px-1">
                  Manage Knowledge Base
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
