import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/redux/hooks';
import { useLogout } from '@/lib/hooks/useLogout';
import { useFetchSubjectsQuery, useFetchMySubjectsQuery } from '@/redux/features/subjects/subjectsApi';
import { useListMyCandidaturesQuery } from '@/redux/features/canditatures/canditaturesApi';
import { useFetchChatRoomsQuery } from '@/redux/features/chat/chatApi';
import { useGetStudentOverviewQuery } from '@/redux/features/analytics/analyticsApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import PageHeader from '@/components/ui/PageHeader';
import SubjectStatusBadge from '@/components/subjects/SubjectStatusBadge';
import SubjectCard from '@/components/subjects/SubjectCard';
import SubjectSuggestions from '@/components/ai/SubjectSuggestions';
import { RagChatbot } from '@/components/ai/RagChatbot';
import { ProgressRing } from '@/components/dashboard/ProgressRing';
import { Badge } from '@/components/ui/badge';
import {
  BookOpen,
  PlusCircle,
  Clock,
  CheckCircle2,
  LogOut,
  ChevronRight,
  Lightbulb,
  GraduationCap,
  User,
  MessageSquare,
  Sparkles,
  Eye,
} from 'lucide-react';
import type { Subject } from '@/types/subject.types';
import { chatUserDisplayName } from '@/types/chat.types';

// ─── Tab types ────────────────────────────────────────────────────────────────

type DashTab = 'recommended' | 'browse' | 'applied';

const TAB_LABELS: Record<DashTab, string> = {
  recommended: '✨ Recommended',
  browse:      'Browse All',
  applied:     'My Applications',
};

// ─── Browse inner component (mirrors SubjectsList but inline) ─────────────────

const BrowseTab = () => {
  const navigate = useNavigate();
  const { data, isLoading, isError } = useFetchSubjectsQuery({ limit: 50 });
  const subjects: Subject[] = data?.data ?? [];

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-48 bg-slate-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6 text-red-700">Failed to load subjects.</CardContent>
      </Card>
    );
  }

  if (subjects.length === 0) {
    return (
      <div className="text-center py-16">
        <BookOpen className="h-10 w-10 text-slate-300 mx-auto mb-3" />
        <p className="text-slate-500 text-sm mb-4">No subjects available yet</p>
        <Button size="sm" onClick={() => navigate('/subjects')}>
          Open full catalogue
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{subjects.length} subject{subjects.length !== 1 ? 's' : ''} available</p>
        <Button variant="ghost" size="sm" onClick={() => navigate('/subjects')} className="text-blue-600">
          Full catalogue
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {subjects.map((s) => (
          <SubjectCard key={s.id} subject={s} />
        ))}
      </div>
    </div>
  );
};

// ─── Applied inner component ──────────────────────────────────────────────────

const AppliedTab = () => {
  const navigate = useNavigate();
  const { data: candidaturesData, isLoading, isError } = useListMyCandidaturesQuery();
  const candidatures = candidaturesData ?? [];

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-slate-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6 text-red-700">Failed to load applications.</CardContent>
      </Card>
    );
  }

  if (candidatures.length === 0) {
    return (
      <div className="text-center py-16">
        <Clock className="h-10 w-10 text-slate-300 mx-auto mb-3" />
        <p className="text-slate-500 text-sm mb-4">No applications yet</p>
        <Button size="sm" onClick={() => navigate('/subjects')}>Browse subjects to apply</Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {candidatures.map((c) => (
        <div
          key={c.id}
          className="bg-white rounded-xl border border-slate-200 p-5 flex items-start justify-between gap-4 hover:border-blue-300 transition-colors"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1 flex-wrap">
              <p className="font-semibold text-slate-900 truncate">{c.subject.title}</p>
              <span className="rounded-full bg-slate-900 px-2.5 py-0.5 text-xs font-semibold text-white">
                {c.status}
              </span>
            </div>
            {c.motivation && (
              <p className="text-sm text-slate-500 line-clamp-1">{c.motivation}</p>
            )}
            <p className="text-xs text-slate-400 mt-1">
              {new Date(c.createdAt).toLocaleDateString('en-GB', {
                day: 'numeric', month: 'short', year: 'numeric',
              })}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/subjects/${c.subject.id}`)}
            className="flex-shrink-0"
          >
            <Eye className="h-4 w-4 mr-1" />
            View
          </Button>
        </div>
      ))}
    </div>
  );
};

// ─── Main page ────────────────────────────────────────────────────────────────

const StudentDashboardPage = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<DashTab>('recommended');
  const navigate = useNavigate();
  const { handleLogout } = useLogout();
  const user = useAppSelector((state) => state.auth.user);
  const { data: overview } = useGetStudentOverviewQuery();

  const { data: mySubjectsData, isLoading: isMySubjectsLoading } = useFetchMySubjectsQuery({});
  const mySubjects: Subject[] = mySubjectsData?.data ?? [];

  const { data: myCandidaturesData } = useListMyCandidaturesQuery();
  const myCandidatures = myCandidaturesData ?? [];

  const { data: chatRooms = [], isLoading: isChatLoading } = useFetchChatRoomsQuery();

  const stats = {
    total:     mySubjects.length,
    pending:   mySubjects.filter((s) => s.status === 'PENDING').length,
    validated: mySubjects.filter((s) => s.status === 'VALIDATED').length,
    rejected:  mySubjects.filter((s) => s.status === 'REJECTED').length,
  };

  const recentSubjects = [...mySubjects]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">

        {/* ── Header ──────────────────────────────────────────────────── */}
        <PageHeader
          title="Student Hub"
          subtitle="Your personalized internship catalogue for browsing subjects, tracking applications, and managing proposals."
          actions={
            <>
              <div className="relative">
                <Button
                  variant="outline"
                  onClick={() => setMenuOpen((v) => !v)}
                  className="shadow-sm"
                >
                  Navigation
                </Button>
                {menuOpen && (
                  <div className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
                    {[
                      { label: 'Browse Subjects',  path: '/subjects',        icon: <BookOpen className="h-4 w-4 text-slate-500" /> },
                      { label: 'My Proposals',      path: '/subjects/my',     icon: <Lightbulb className="h-4 w-4 text-slate-500" /> },
                      { label: 'My Applications',   path: '/candidatures/my', icon: <Clock className="h-4 w-4 text-slate-500" /> },
                      { label: 'My Stage',          path: '/student/stage',   icon: <GraduationCap className="h-4 w-4 text-slate-500" /> },
                      { label: 'Profile',           path: '/profile',         icon: <User className="h-4 w-4 text-slate-500" /> },
                      { label: 'Messagerie',        path: '/chat',            icon: <MessageSquare className="h-4 w-4 text-slate-500" /> },
                    ].map(({ label, path, icon }) => (
                      <button
                        key={path}
                        type="button"
                        onClick={() => { setMenuOpen(false); navigate(path); }}
                        className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-50"
                      >
                        {icon}
                        {label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <Button variant="outline" onClick={() => navigate('/subjects/new')} className="shadow-sm">
                <PlusCircle className="h-4 w-4 mr-2" />
                Propose a Subject
              </Button>
              <Button variant="ghost" onClick={handleLogout} className="hidden sm:inline-flex">
                <LogOut className="h-4 w-4 mr-2" />
                Sign out
              </Button>
            </>
          }
        />

        {/* ── Top alerts and stats ──────────────────────────────────────── */}
        <div className="space-y-6">
          {/* Profile completion prompt */}
          {overview && overview.profile.completionPercentage < 80 && (
            <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-800">Complete your profile</p>
                  <p className="text-xs text-blue-600">{overview.profile.completionPercentage}% complete — upload your CV to get AI subject suggestions</p>
                </div>
              </div>
              <Button size="sm" variant="outline" onClick={() => navigate('/profile')}>
                Complete
              </Button>
            </div>
          )}

          {/* Next deadline alert */}
          {overview?.jalons.nextDeadline && (
            <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <Clock className="w-4 h-4 text-amber-600 shrink-0" />
              <p className="text-sm text-amber-700">
                Next jalon deadline: <strong>{new Date(overview.jalons.nextDeadline).toLocaleDateString('fr-FR')}</strong>
              </p>
            </div>
          )}

          {/* Stage progress card */}
          {overview?.stage.hasActiveStage ? (
            <Card className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-blue-100 text-sm">Active Stage</p>
                    <p className="text-xl font-bold mt-1">{overview.stage.subjectTitle}</p>
                    <p className="text-blue-200 text-sm mt-1">Supervisor: {overview.stage.encadreurName}</p>
                    {overview.stage.daysRemaining !== null && (
                      <p className="text-blue-100 text-sm mt-1">{overview.stage.daysRemaining} days remaining</p>
                    )}
                  </div>
                  <ProgressRing
                    value={overview.jalons.completionPercentage}
                    size={72}
                    color="#ffffff"
                    label="Complete"
                  />
                </div>
                <div className="mt-4 grid grid-cols-3 gap-4 pt-4 border-t border-blue-500">
                  <div className="text-center">
                    <p className="text-2xl font-bold">{overview.jalons.validated}</p>
                    <p className="text-blue-200 text-xs">Validated</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{overview.jalons.pending}</p>
                    <p className="text-blue-200 text-xs">Pending</p>
                  </div>
                  <div className="text-center">
                    <p className={`text-2xl font-bold ${overview.jalons.overdue > 0 ? 'text-red-300' : ''}`}>
                      {overview.jalons.overdue}
                    </p>
                    <p className="text-blue-200 text-xs">Overdue</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 lg:grid-cols-[1.8fr_1.1fr]">
              <div className="rounded-[2rem] bg-gradient-to-br from-primary to-secondary p-8 shadow-2xl text-white">
                <p className="text-sm uppercase tracking-[0.3em] text-white/80">Welcome back</p>
                <h1 className="mt-4 text-4xl font-semibold leading-tight">
                  {user?.firstName} {user?.lastName}
                </h1>
                <p className="mt-4 max-w-2xl text-base leading-7 text-white/85">
                  Discover validated internship subjects, manage your applications, and submit proposals.
                </p>
                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-3xl bg-white/10 p-5">
                    <p className="text-xs uppercase tracking-[0.32em] text-white/70">Proposals</p>
                    <p className="mt-3 text-3xl font-semibold">{stats.total}</p>
                    <p className="mt-2 text-sm text-white/75">Active subject proposals</p>
                  </div>
                  <div className="rounded-3xl bg-white/10 p-5">
                    <p className="text-xs uppercase tracking-[0.32em] text-white/70">Applications</p>
                    <p className="mt-3 text-3xl font-semibold">{myCandidatures.length}</p>
                    <p className="mt-2 text-sm text-white/75">Submitted this semester</p>
                  </div>
                </div>
              </div>
              <div className="grid gap-4">
                <Card className="border-slate-200 bg-white/95 shadow-sm">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm text-slate-500">Pending</p>
                      <div className="w-9 h-9 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-700">
                        <Clock className="h-5 w-5" />
                      </div>
                    </div>
                    <p className="text-3xl font-bold text-slate-900">{stats.pending}</p>
                  </CardContent>
                </Card>
                <Card className="border-slate-200 bg-white/95 shadow-sm">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm text-slate-500">Validated</p>
                      <div className="w-9 h-9 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-700">
                        <CheckCircle2 className="h-5 w-5" />
                      </div>
                    </div>
                    <p className="text-3xl font-bold text-slate-900">{stats.validated}</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>

        {/* ── Tabs ────────────────────────────────────────────────────── */}
        <div>
          {/* Tab bar */}
          <div className="flex border-b border-slate-200 mb-6" role="tablist">
            {(Object.keys(TAB_LABELS) as DashTab[]).map((tab) => (
              <button
                key={tab}
                role="tab"
                aria-selected={activeTab === tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2.5 text-sm font-medium capitalize border-b-2 transition-colors ${
                  activeTab === tab
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                {TAB_LABELS[tab]}
                {tab === 'applied' && myCandidatures.length > 0 && (
                  <span className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-200 text-slate-700 text-xs font-bold">
                    {myCandidatures.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Tab panels */}
          <div role="tabpanel">
            {activeTab === 'recommended' && (
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-blue-600 animate-pulse" />
                  <h2 className="text-lg font-semibold text-slate-900">Recommended for You</h2>
                  <Badge variant="outline" className="text-purple-600 border-purple-300">✨ AI</Badge>
                </div>
                <SubjectSuggestions />
              </div>
            )}

            {activeTab === 'browse' && <BrowseTab />}

            {activeTab === 'applied' && <AppliedTab />}
          </div>
        </div>

        {/* ── Sidebar widgets ──────────────────────────────────────────── */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* My recent proposals */}
          <div className="lg:col-span-2">
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
                  View all <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </CardHeader>
              <CardContent>
                {isMySubjectsLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => <div key={i} className="h-16 bg-slate-100 rounded-lg animate-pulse" />)}
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
                                day: 'numeric', month: 'short', year: 'numeric',
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
          </div>

          {/* Quick Actions + Chat preview */}
          <div className="space-y-4">
            <Card className="border-slate-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  {
                    label: 'Propose Subject', sub: 'Submit your internship idea',
                    path: '/subjects/new', icon: <PlusCircle className="h-5 w-5 text-white" />,
                    cls: 'border-blue-200 bg-blue-50 hover:bg-blue-100',
                    iconCls: 'bg-blue-600', labelCls: 'text-blue-900', subCls: 'text-blue-600',
                  },
                  {
                    label: 'My Applications', sub: 'Track your candidature statuses',
                    path: '/candidatures/my', icon: <Clock className="h-5 w-5 text-slate-600" />,
                    cls: 'border-slate-200 hover:bg-slate-50',
                    iconCls: 'bg-slate-100', labelCls: 'text-slate-900', subCls: 'text-slate-500',
                  },
                  {
                    label: 'Browse Catalogue', sub: 'Explore available subjects',
                    path: '/subjects', icon: <BookOpen className="h-5 w-5 text-slate-600" />,
                    cls: 'border-slate-200 hover:bg-slate-50',
                    iconCls: 'bg-slate-100', labelCls: 'text-slate-900', subCls: 'text-slate-500',
                  },
                  {
                    label: 'Messagerie',
                    sub: chatRooms.length > 0
                      ? `${chatRooms.length} conversation${chatRooms.length > 1 ? 's' : ''}`
                      : 'Vos conversations de stage',
                    path: '/chat', icon: <MessageSquare className="h-5 w-5 text-slate-600" />,
                    cls: 'border-slate-200 hover:bg-slate-50',
                    iconCls: 'bg-slate-100', labelCls: 'text-slate-900', subCls: 'text-slate-500',
                  },
                ].map(({ label, sub, path, icon, cls, iconCls, labelCls, subCls }) => (
                  <button
                    key={path}
                    onClick={() => navigate(path)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-colors text-left ${cls}`}
                  >
                    <div className={`w-9 h-9 rounded-lg ${iconCls} flex items-center justify-center flex-shrink-0`}>
                      {icon}
                    </div>
                    <div>
                      <p className={`text-sm font-semibold ${labelCls}`}>{label}</p>
                      <p className={`text-xs ${subCls}`}>{sub}</p>
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>

            {/* Chat preview */}
            <Card className="border-slate-200">
              <CardHeader className="flex flex-row items-center justify-between pb-3 gap-4">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-blue-600" aria-hidden />
                    Messagerie
                  </CardTitle>
                  <CardDescription>Vos conversations de stage</CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/chat')}
                  className="text-blue-600 hover:text-blue-700 flex-shrink-0"
                >
                  Ouvrir <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </CardHeader>
              <CardContent>
                {isChatLoading ? (
                  <div className="space-y-2">
                    {[1, 2].map((i) => <div key={i} className="h-14 bg-slate-100 rounded-lg animate-pulse" />)}
                  </div>
                ) : chatRooms.length === 0 ? (
                  <div className="text-center py-6">
                    <MessageSquare className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm text-slate-500">Aucune conversation pour l'instant</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Une salle sera créée lorsque votre stage débutera.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {chatRooms.slice(0, 3).map((room) => {
                      const lastMsg = room.lastMessage;
                      return (
                        <button
                          key={room.id}
                          onClick={() => navigate('/chat')}
                          className="w-full text-left p-3 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition-colors group"
                          aria-label={`Ouvrir la conversation : ${room.name}`}
                        >
                          <div className="flex items-start gap-2.5">
                            <div
                              className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-bold flex-shrink-0 mt-0.5"
                              aria-hidden
                            >
                              {room.name.slice(0, 2).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-slate-900 truncate group-hover:text-blue-700">
                                {room.name}
                              </p>
                              {lastMsg ? (
                                <p className="text-xs text-slate-500 truncate mt-0.5">
                                  {lastMsg.sender
                                    ? `${chatUserDisplayName(lastMsg.sender)}: ${lastMsg.content}`
                                    : lastMsg.content}
                                </p>
                              ) : (
                                <p className="text-xs text-slate-400 italic mt-0.5">Aucun message</p>
                              )}
                            </div>
                            {lastMsg && (
                              <span className="text-xs text-slate-400 flex-shrink-0 mt-0.5">
                                {new Date(lastMsg.createdAt).toLocaleTimeString('fr-FR', {
                                  hour: '2-digit', minute: '2-digit',
                                })}
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                    {chatRooms.length > 3 && (
                      <button
                        onClick={() => navigate('/chat')}
                        className="w-full text-xs text-blue-600 hover:text-blue-700 py-1 text-center"
                      >
                        Voir toutes les conversations ({chatRooms.length})
                      </button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <RagChatbot />
    </div>
  );
};

export default StudentDashboardPage;
