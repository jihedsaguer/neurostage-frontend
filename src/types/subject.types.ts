export type SubjectStatus = 'DRAFT' | 'PENDING' | 'VALIDATED' | 'REJECTED' | 'CLOSED';

export interface SubjectCreator {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface Subject {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  level: string;
  prerequisites: string;
  status: SubjectStatus;
  createdBy: SubjectCreator;
  createdAt: string;
  updatedAt: string;
}

export interface SubjectsPaginationMetadata {
  total: number;
  limit: number;
  offset: number;
  pages: number;
}

export interface SubjectsApiResponse {
  data: Subject[];
  total: number;
  limit: number;
  offset: number;
  pages: number;
}

export interface SubjectsQueryParams {
  search?: string;
  technologies?: string[];
  level?: string;
  status?: SubjectStatus;
  limit?: number;
  offset?: number;
  sortBy?: 'createdAt' | 'title';
  sortOrder?: 'ASC' | 'DESC';
}

export interface CreateSubjectDto {
  title: string;
  description: string;
  technologies?: string[];
  level?: string;
  prerequisites?: string;
}

export interface UpdateSubjectDto {
  title?: string;
  description?: string;
  technologies?: string[];
  level?: string;
  prerequisites?: string;
}

export interface ValidateSubjectDto {
  status: 'VALIDATED' | 'REJECTED';
}

export const SUBJECT_LEVELS = [
  'Licence',
  'Master',
  'Ingénieur',
  'Doctorat',
] as const;

export const SUBJECT_STATUS_COLORS: Record<SubjectStatus, string> = {
  DRAFT: 'bg-gray-100 text-gray-800 border-gray-300',
  PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  VALIDATED: 'bg-green-100 text-green-800 border-green-300',
  REJECTED: 'bg-red-100 text-red-800 border-red-300',
  CLOSED: 'bg-slate-100 text-slate-800 border-slate-300',
};

export const SUBJECT_STATUS_LABELS: Record<SubjectStatus, string> = {
  DRAFT: 'Draft',
  PENDING: 'Pending',
  VALIDATED: 'Validated',
  REJECTED: 'Rejected',
  CLOSED: 'Closed',
};
