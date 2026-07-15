export type JalonStatus = 'PENDING' | 'SUBMITTED' | 'VALIDATED' | 'REJECTED' | 'LATE';

export interface UserSummary {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface LivrableResponse {
  id: string;
  jalonId: string;
  studentId: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  size: number;
  scanOk: boolean;
  studentNote: string | null;
  submittedAt: string;
}

export interface JalonResponse {
  id: string;
  stageId: string;
  label: string;
  description: string | null;
  dueDate: string;
  order: number;
  status: JalonStatus;
  validatedBy: UserSummary | null;
  validatedAt: string | null;
  proComment: string | null;
  acadComment: string | null;
  livrable: LivrableResponse | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateJalonPayload {
  stageId: string;
  label: string;
  description?: string;
  dueDate: string;
  order: number;
}

export interface UpdateJalonPayload {
  label?: string;
  description?: string;
  dueDate?: string;
  order?: number;
}

export interface SubmitLivrablePayload {
  fileName: string;
  fileUrl: string;
  fileType: string;
  size: number;
  hash: string;
  studentNote?: string;
}

export interface ValidateJalonPayload {
  action: 'VALIDATE' | 'REJECT';
  proComment?: string;
}

export interface AcadCommentPayload {
  acadComment: string;
}

export const JALON_STATUS_LABELS: Record<JalonStatus, string> = {
  PENDING:   'En attente',
  SUBMITTED: 'Soumis',
  VALIDATED: 'Validé',
  REJECTED:  'Rejeté',
  LATE:      'En retard',
};

export const JALON_STATUS_COLORS: Record<JalonStatus, string> = {
  PENDING:   'bg-slate-100  text-slate-700  border-slate-300',
  SUBMITTED: 'bg-blue-100   text-blue-800   border-blue-300',
  VALIDATED: 'bg-green-100  text-green-800  border-green-300',
  REJECTED:  'bg-red-100    text-red-800    border-red-300',
  LATE:      'bg-orange-100 text-orange-800 border-orange-300',
};

export const SYSTEM_ROLES = {
  STUDENT:              'student',
  ENCADRANT_PRO:        'encadrant_pro',
  ENCADRANT_ACADEMIQUE: 'encadrant_academique',
  ADMIN_FORMATION:      'admin_formation',
  SUPER_ADMIN:          'super_admin',
} as const;
