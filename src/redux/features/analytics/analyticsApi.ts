import { baseApi } from '@/redux/api/baseApi';

// ── Types ──────────────────────────────────────────────────────────────────

export interface AdminOverview {
  users: {
    total: number;
    students: number;
    encadreurs: number;
    verified: number;
    unverified: number;
    newThisMonth: number;
  };
  subjects: {
    total: number;
    draft: number;
    pending: number;
    validated: number;
    rejected: number;
    aiGenerated: number;
    newThisMonth: number;
  };
  candidatures: {
    total: number;
    pending: number;
    accepted: number;
    rejected: number;
    conversionRate: number;
  };
  stages: {
    total: number;
    active: number;
    completed: number;
    cancelled: number;
    withoutEncadreur: number;
    withoutAcadEncadreur: number;
  };
  jalons: {
    total: number;
    pending: number;
    submitted: number;
    validated: number;
    overdue: number;
    completionRate: number;
  };
  ai: {
    totalGenerations: number;
    studentsWithCv: number;
    subjectsIndexed: number;
  };
}

export interface SubjectByLevel {
  level: string;
  count: number;
  validated: number;
}

export interface CandidatureTimeline {
  month: string;
  total: number;
  accepted: number;
  rejected: number;
}

export interface StagePerUniversity {
  university: string;
  count: number;
}

export interface PendingActions {
  subjectsPendingValidation: number;
  candidaturesPendingReview: number;
  stagesWithoutEncadreur: number;
  jalonsOverdue: number;
  studentsWithoutStage: number;
}

export interface RecentActivity {
  type: 'SUBJECT_CREATED' | 'CANDIDATURE_ACCEPTED' | 'STAGE_STARTED' | 'JALON_VALIDATED' | 'USER_REGISTERED';
  actorName: string;
  targetName: string;
  createdAt: string;
}

export interface EncadreurOverview {
  stages: { total: number; active: number; completed: number };
  students: { total: number; withActiveStage: number; withOverdueJalon: number };
  jalons: { totalAcrossMyStages: number; pendingValidation: number; validated: number; overdue: number };
  subjects: { total: number; draft: number; pending: number; validated: number };
  pendingActions: { jalonsToValidate: number; candidaturesToReview: number };
}

export interface StudentInMyStage {
  stageId: string;
  student: { id: string; firstName: string; lastName: string; email: string; university: string; level: string };
  subject: { id: string; title: string; level: string };
  stage: { status: string; startDate: string; endDate: string };
  jalons: { total: number; validated: number; overdue: number; nextDeadline: string | null };
  completionPercentage: number;
  lastActivity: string | null;
}

export interface JalonAlert {
  jalonId: string;
  jalonTitle: string;
  deadline: string;
  status: string;
  daysOverdue: number;
  studentName: string;
  stageId: string;
  hasLivrable: boolean;
}

export interface StudentOverview {
  profile: { completionPercentage: number; isAiProcessed: boolean; hasCV: boolean };
  candidatures: { total: number; pending: number; accepted: number; rejected: number };
  stage: {
    hasActiveStage: boolean;
    status: string | null;
    subjectTitle: string | null;
    encadreurName: string | null;
    startDate: string | null;
    endDate: string | null;
    daysRemaining: number | null;
  };
  jalons: {
    total: number;
    validated: number;
    pending: number;
    overdue: number;
    completionPercentage: number;
    nextDeadline: string | null;
  };
  subjectSuggestionsAvailable: boolean;
}

// ── API Slice ──────────────────────────────────────────────────────────────

export const analyticsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminOverview: builder.query<AdminOverview, void>({
      query: () => '/analytics/admin/overview',
    }),
    getSubjectsByLevel: builder.query<SubjectByLevel[], void>({
      query: () => '/analytics/admin/subjects-by-level',
    }),
    getCandidaturesTimeline: builder.query<CandidatureTimeline[], void>({
      query: () => '/analytics/admin/candidatures-timeline',
    }),
    getStagesPerUniversity: builder.query<StagePerUniversity[], void>({
      query: () => '/analytics/admin/stages-per-university',
    }),
    getPendingActions: builder.query<PendingActions, void>({
      query: () => '/analytics/admin/pending-actions',
    }),
    getRecentActivity: builder.query<RecentActivity[], void>({
      query: () => '/analytics/admin/recent-activity',
    }),
    getEncadreurOverview: builder.query<EncadreurOverview, void>({
      query: () => '/analytics/encadreur/overview',
    }),
    getEncadreurMyStudents: builder.query<StudentInMyStage[], void>({
      query: () => '/analytics/encadreur/my-students',
    }),
    getEncadreurJalonAlerts: builder.query<JalonAlert[], void>({
      query: () => '/analytics/encadreur/jalon-alerts',
    }),
    getStudentOverview: builder.query<StudentOverview, void>({
      query: () => '/analytics/student/overview',
    }),
  }),
});

export const {
  useGetAdminOverviewQuery,
  useGetSubjectsByLevelQuery,
  useGetCandidaturesTimelineQuery,
  useGetStagesPerUniversityQuery,
  useGetPendingActionsQuery,
  useGetRecentActivityQuery,
  useGetEncadreurOverviewQuery,
  useGetEncadreurMyStudentsQuery,
  useGetEncadreurJalonAlertsQuery,
  useGetStudentOverviewQuery,
} = analyticsApi;
