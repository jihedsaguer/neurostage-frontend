export type StageStatus = 'PENDING_ACAD' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export interface StageUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface StageSubject {
  id: string;
  title: string;
  level: string;
  technologies: string[];
}

export interface Stage {
  id: string;
  status: StageStatus;
  candidatureId: string;
  subject: StageSubject;
  student: StageUser;
  encadrantPro: StageUser;
  encadrantAcad: StageUser | null;
  startDate: string | null;
  endDate: string | null;
  adminNotes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStagePayload {
  candidatureId: string;
  encadrantProId?: string;
  encadrantAcadId?: string;
  startDate?: string;
  endDate?: string;
  adminNotes?: string;
}

export interface UpdateStagePayload {
  status?: StageStatus;
  startDate?: string;
  endDate?: string;
  adminNotes?: string;
}

export interface AssignProPayload {
  encadrantProId: string;
}

export interface AssignAcadPayload {
  encadrantAcadId: string;
}

// UI helpers
export const STAGE_STATUS_LABELS: Record<StageStatus, string> = {
  PENDING_ACAD: 'En attente (Acad.)',
  ACTIVE:       'Actif',
  COMPLETED:    'Terminé',
  CANCELLED:    'Annulé',
};

export const STAGE_STATUS_COLORS: Record<StageStatus, string> = {
  PENDING_ACAD: 'bg-orange-100 text-orange-800 border-orange-300',
  ACTIVE:       'bg-green-100  text-green-800  border-green-300',
  COMPLETED:    'bg-blue-100   text-blue-800   border-blue-300',
  CANCELLED:    'bg-red-100    text-red-800    border-red-300',
};
