import type { UserDto } from './user';
import type { Subject } from './subject.types';

export type CanditatureStatus = 'pending' | 'accepted' | 'shortlisted' | 'rejected';

export interface CanditatureCreator {
  subjectId: string;
  motivation: string;
}

export const CANDIDATURE_STATUS_COLORS: Record<CanditatureStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  accepted: 'bg-green-100 text-green-800 border-green-300',
  shortlisted: 'bg-sky-100 text-sky-800 border-sky-300',
  rejected: 'bg-red-100 text-red-800 border-red-300',
};

export const CANDIDATURE_STATUS_LABELS: Record<CanditatureStatus, string> = {
  pending: 'Pending',
  accepted: 'Accepted',
  shortlisted: 'Shortlisted',
  rejected: 'Rejected',
};

export interface CanditatureResponse {
  id: string;
  student: UserDto;
  subject: Subject;
  status: CanditatureStatus;
  motivation: string;
  createdAt: string;
  scoreMatch?: number | null;
}

