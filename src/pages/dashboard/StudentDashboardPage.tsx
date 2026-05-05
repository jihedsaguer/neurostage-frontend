import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/redux/hooks';
import { useLogout } from '@/lib/hooks/useLogout';
import { useFetchMySubjectsQuery, useFetchSubjectsQuery } from '@/redux/features/subjects/subjectsApi';
import { useListMyCandidaturesQuery } from '@/redux/features/canditatures/canditaturesApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import SubjectStatusBadge from '@/components/subjects/SubjectStatusBadge';
import {
  BookOpen,
  PlusCircle,
  Clock,
  CheckCircle2,
  XCircle,
  LogOut,
  ChevronRight,
  GraduationCap,
  Lightbulb,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import type { Subject } from '@/types/subject.types';

const StudentDashboardPage = () => {
  const navigate = useNavigate();
  const { handleLogout } = useLogout();
  const user = useAppSelector((state) => state.auth.user);

  const [menuOpen, setMenuOpen] = useState(false);
  const { data, isLoading: isMySubjectsLoading } = useFetchMySubjectsQuery({});
  const mySubjects: Subject[] = data?.data ?? [];

  const { data: validatedResponse, isLoading: isValidatedLoading } = useFetchSubjectsQuery({ status: 'VALIDATED', limit: 6, offset: 0 });
  const validatedSubjects: Subject[] = validatedResponse?.data ?? [];

  const { data: myCandidaturesData, isLoading: isMyCandidaturesLoading } = useListMyCandidaturesQuery();
  const myCandidatures = myCandidaturesData ?? [];

  const stats = {
    total: mySubjects.length,
    pending: mySubjects.filter((s) => s.status === 'PENDING').length,
    validated: mySubjects.filter((s) => s.status === 'VALIDATED').length,
    rejected: mySubjects.filter((s) => s.status === 'REJECTED').length,
  };

  const recentSubjects = [...mySubjects]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  const recentCandidatures = [...myCandidatures]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  const initials = `${user?.firstName?.[0] ?? ''}${user?.lastName?.[0] ?? ''}`.toUpperCase();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Nav */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">NeuroStage</p>
              <p className="text-xs text-slate-500">Student Portal</p>
            </div>
          </div>

          <div className="relative">
            <button
              type="button"
              className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300"
              onClick={() => setMenuOpen((current) => !current)}
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                {initials}
              </div>
              <span className="hidden sm:inline">{user?.firstName}</span>
              {menuOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    navigate('/subjects');
                  }}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-50"
                >
                  <BookOpen className="h-4 w-4 text-slate-500" />
                  Browse subjects
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    navigate('/candidatures/my');
                  }}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-50"
                >
                  <Clock className="h-4 w-4 text-slate-500" />
                  My applications
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    navigate('/subjects/my');
                  }}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-50"
                >
                  <Lightbulb className="h-4 w-4 text-slate-500" />
                  My proposals
                </button>
                <div className="border-t border-slate-200" />
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-red-600 hover:bg-slate-50"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white">
          <p className="text-blue-200 text-sm font-medium mb-1">Welcome back</p>
          <h1 className="text-3xl font-bold mb-2">{user?.firstName} {user?.lastName}</h1>
          <p className="text-blue-100 mb-6 max-w-2xl">
            Browse available internship subjects, check your applications, and keep track of your proposals from one dashboard.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => navigate('/subjects/new')}
              className="bg-white text-blue-700 hover:bg-blue-50 font-semibold"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Propose a Subject
            </Button>
            <Button
              onClick={() => navigate('/candidatures/my')}
              variant="outline"
              className="border-white/40 text-white hover:bg-white/10"
            >
              <Clock className="h-4 w-4 mr-2" />
              My Applications
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-slate-200">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-slate-500">My Subjects</p>
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                  <BookOpen className="h-4 w-4 text-slate-600" />
                </div>
              </div>
              <p className="text-3xl font-bold text-slate-900">{stats.total}</p>
            </CardContent>
          </Card>

          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-yellow-700">Pending</p>
                <div className="w-8 h-8 rounded-lg bg-yellow-100 flex items-center justify-center">
                  <Clock className="h-4 w-4 text-yellow-600" />
                </div>
              </div>
              <p className="text-3xl font-bold text-yellow-800">{stats.pending}</p>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-green-700">Validated</p>
                <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                </div>
              </div>
              <p className="text-3xl font-bold text-green-800">{stats.validated}</p>
            </CardContent>
          </Card>

          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-red-700">Rejected</p>
                <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                  <XCircle className="h-4 w-4 text-red-600" />
                </div>
              </div>
              <p className="text-3xl font-bold text-red-800">{stats.rejected}</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-slate-200">
              <CardHeader className="flex flex-row items-center justify-between pb-4 gap-4">
                <div>
                  <CardTitle className="text-lg">My Subjects</CardTitle>
                  <CardDescription>Your recently proposed subjects</CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/subjects/my')}
                  className="text-blue-600 hover:text-blue-700"
                >
                  View all
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </CardHeader>
              <CardContent>
                {isMySubjectsLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-16 bg-slate-100 rounded-lg animate-pulse" />
                    ))}
                  </div>
                ) : recentSubjects.length === 0 ? (
                  <div className="text-center py-10">
                    <Lightbulb className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 text-sm mb-4">No submissions yet</p>
                    <Button size="sm" onClick={() => navigate('/subjects/new')}>
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Propose your first subject
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentSubjects.map((subject) => (
                      <button
                        key={subject.id}
                        onClick={() => navigate(`/subjects/${subject.id}`)}
                        className="w-full text-left p-4 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition-colors group"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-slate-900 truncate group-hover:text-blue-700">
                              {subject.title}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                              {new Date(subject.createdAt).toLocaleDateString('en-GB', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </p>
                          </div>
                          <SubjectStatusBadge status={subject.status} />
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-slate-200">
              <CardHeader className="flex flex-row items-center justify-between pb-4 gap-4">
                <div>
                  <CardTitle className="text-lg">Your applications</CardTitle>
                  <CardDescription>See the latest status updates from your candidatures.</CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/candidatures/my')}
                  className="text-blue-600 hover:text-blue-700"
                >
                  View all
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </CardHeader>
              <CardContent>
                {isMyCandidaturesLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-16 bg-slate-100 rounded-lg animate-pulse" />
                    ))}
                  </div>
                ) : recentCandidatures.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-slate-500 text-sm mb-4">No applications yet</p>
                    <Button size="sm" onClick={() => navigate('/subjects')}>
                      Browse subjects to apply
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentCandidatures.map((candidature) => (
                      <div key={candidature.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-900 truncate">{candidature.subject.title}</p>
                            <p className="text-sm text-slate-500 truncate">{candidature.motivation}</p>
                          </div>
                          <div className="flex flex-wrap items-center gap-3">
                            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 border border-slate-200">
                              {new Date(candidature.createdAt).toLocaleDateString('en-GB', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </span>
                            <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
                              {candidature.status}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/subjects/${candidature.subject.id}`)}
                            >
                              View subject
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="border-slate-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <button
                  onClick={() => navigate('/subjects/new')}
                  className="w-full flex items-center gap-3 p-3 rounded-lg border border-blue-200 bg-blue-50 hover:bg-blue-100 transition-colors text-left"
                >
                  <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
                    <PlusCircle className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-blue-900">Propose Subject</p>
                    <p className="text-xs text-blue-600">Submit your internship idea</p>
                  </div>
                </button>

                <button
                  onClick={() => navigate('/candidatures/my')}
                  className="w-full flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors text-left"
                >
                  <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                    <Clock className="h-5 w-5 text-slate-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">My Applications</p>
                    <p className="text-xs text-slate-500">Track your candidature statuses</p>
                  </div>
                </button>

                <button
                  onClick={() => navigate('/subjects')}
                  className="w-full flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors text-left"
                >
                  <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                    <BookOpen className="h-5 w-5 text-slate-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Browse Catalogue</p>
                    <p className="text-xs text-slate-500">Explore available subjects</p>
                  </div>
                </button>
              </CardContent>
            </Card>

            <Card className="border-slate-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Validated Subjects</CardTitle>
              </CardHeader>
              <CardContent>
                {isValidatedLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-16 bg-slate-100 rounded-lg animate-pulse" />
                    ))}
                  </div>
                ) : validatedSubjects.length === 0 ? (
                  <p className="text-sm text-slate-500">No validated subjects available right now.</p>
                ) : (
                  <div className="space-y-3">
                    {validatedSubjects.map((subject) => (
                      <button
                        key={subject.id}
                        onClick={() => navigate(`/subjects/${subject.id}`)}
                        className="w-full rounded-3xl border border-slate-200 bg-white p-4 text-left transition hover:border-blue-300 hover:bg-blue-50"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-900 truncate">{subject.title}</p>
                            <p className="text-xs text-slate-500 mt-1 truncate">{subject.level ?? 'Available subject'}</p>
                          </div>
                          <SubjectStatusBadge status={subject.status} />
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentDashboardPage;
