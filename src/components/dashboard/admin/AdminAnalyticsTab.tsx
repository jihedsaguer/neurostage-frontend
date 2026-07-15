import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { SimpleBarChart } from '@/components/dashboard/SimpleBarChart';
import { Progress } from '@/components/ui/progress';
import {
  useGetAdminOverviewQuery,
  useGetCandidaturesTimelineQuery,
  useGetSubjectsByLevelQuery,
  useGetStagesPerUniversityQuery,
} from '@/redux/features/analytics/analyticsApi';
import { TrendingUp, Users, Award, BookOpen, Briefcase } from 'lucide-react';

export function AdminAnalyticsTab() {
  const { data: overview, isLoading: overviewLoading } = useGetAdminOverviewQuery();
  const { data: timeline, isLoading: timelineLoading } = useGetCandidaturesTimelineQuery();
  const { data: byLevel, isLoading: levelLoading } = useGetSubjectsByLevelQuery();
  const { data: byUniversity, isLoading: universityLoading } = useGetStagesPerUniversityQuery();

  const isAnyLoading = overviewLoading || timelineLoading || levelLoading || universityLoading;

  // Compute stats
  const totalCandidatures = timeline?.reduce((sum, t) => sum + t.total, 0) ?? 0;
  const acceptedCandidatures = timeline?.reduce((sum, t) => sum + t.accepted, 0) ?? 0;
  const rejectedCandidatures = timeline?.reduce((sum, t) => sum + t.rejected, 0) ?? 0;
  const pendingCandidatures = totalCandidatures - acceptedCandidatures - rejectedCandidatures;

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-slate-200 shadow-sm bg-gradient-to-br from-indigo-50/40 via-white to-white">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Student-to-Encadreur Ratio</p>
              <p className="text-xl font-bold text-slate-800 mt-0.5">
                {overview ? (overview.users.encadreurs > 0 ? (overview.users.students / overview.users.encadreurs).toFixed(1) : overview.users.students) : 0} : 1
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">Active candidates per industry mentor</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm bg-gradient-to-br from-emerald-50/40 via-white to-white">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Stage Success / Validation Rate</p>
              <p className="text-xl font-bold text-slate-800 mt-0.5">
                {overview ? Math.round(overview.jalons.completionRate) : 0}%
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">Milestone logs approved by supervisors</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm bg-gradient-to-br from-purple-50/40 via-white to-white">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shrink-0">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Application Match Rate</p>
              <p className="text-xl font-bold text-slate-800 mt-0.5">
                {overview?.candidatures.conversionRate ?? 0}%
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">Accepted relative to total proposals</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {isAnyLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Applications Timeline */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-slate-500" />
                Applications Evolution
              </CardTitle>
              <CardDescription>Candidatures submitted and outcome over last 6 months</CardDescription>
            </CardHeader>
            <CardContent>
              {timeline && timeline.length > 0 ? (
                <div className="space-y-6">
                  <SimpleBarChart
                    title=""
                    data={timeline.map(t => ({
                      label: t.month,
                      value: t.total,
                      color: 'bg-indigo-600'
                    }))}
                  />
                  <div className="grid grid-cols-3 gap-2 border-t border-slate-100 pt-4 text-center">
                    <div>
                      <p className="text-xs text-slate-500">Accepted</p>
                      <p className="text-lg font-bold text-emerald-600">{acceptedCandidatures}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Pending</p>
                      <p className="text-lg font-bold text-amber-500">{pendingCandidatures}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Rejected</p>
                      <p className="text-lg font-bold text-red-500">{rejectedCandidatures}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center text-slate-400">No application timeline data.</div>
              )}
            </CardContent>
          </Card>

          {/* Subjects by Level */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-slate-500" />
                Subject Distribution by Level
              </CardTitle>
              <CardDescription>Number of validated subjects proposed per student level</CardDescription>
            </CardHeader>
            <CardContent>
              {byLevel && byLevel.length > 0 ? (
                <SimpleBarChart
                  title=""
                  data={byLevel.map(l => ({
                    label: l.level || 'Unknown',
                    value: l.count,
                    color: l.level?.startsWith('L') ? 'bg-emerald-500' : l.level?.startsWith('M') ? 'bg-indigo-600' : 'bg-purple-500',
                  }))}
                />
              ) : (
                <div className="py-12 text-center text-slate-400">No level distribution data.</div>
              )}
            </CardContent>
          </Card>

          {/* Stages by University */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-slate-500" />
                Internship Origins by University
              </CardTitle>
              <CardDescription>Top universities supplying active internships</CardDescription>
            </CardHeader>
            <CardContent>
              {byUniversity && byUniversity.length > 0 ? (
                <SimpleBarChart
                  title=""
                  data={byUniversity.slice(0, 5).map(u => ({
                    label: u.university || 'Other',
                    value: u.count,
                    color: 'bg-violet-600',
                  }))}
                />
              ) : (
                <div className="py-12 text-center text-slate-400">No university stats available.</div>
              )}
            </CardContent>
          </Card>

          {/* System Role Distribution */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Users className="h-4 w-4 text-slate-500" />
                Platform Role Composition
              </CardTitle>
              <CardDescription>Distribution of active registered accounts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {overview ? (
                <div className="space-y-3.5">
                  <div>
                    <div className="flex justify-between text-xs font-medium text-slate-600 mb-1.5">
                      <span>Students ({overview.users.students})</span>
                      <span>{Math.round((overview.users.students / overview.users.total) * 100)}%</span>
                    </div>
                    <Progress value={(overview.users.students / overview.users.total) * 100} className="h-2 bg-slate-100" />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-medium text-slate-600 mb-1.5">
                      <span>Industry Mentors ({overview.users.encadreurs})</span>
                      <span>{Math.round((overview.users.encadreurs / overview.users.total) * 100)}%</span>
                    </div>
                    <Progress value={(overview.users.encadreurs / overview.users.total) * 100} className="h-2 bg-slate-100" />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-medium text-slate-600 mb-1.5">
                      <span>Administrators & Tutors</span>
                      <span>{Math.round(((overview.users.total - overview.users.students - overview.users.encadreurs) / overview.users.total) * 100)}%</span>
                    </div>
                    <Progress
                      value={((overview.users.total - overview.users.students - overview.users.encadreurs) / overview.users.total) * 100}
                      className="h-2 bg-slate-100"
                    />
                  </div>
                  <div className="text-center pt-3 text-xs text-slate-400">
                    Total user footprint: <strong className="text-slate-600">{overview.users.total}</strong> accounts
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center text-slate-400">No composition data.</div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
