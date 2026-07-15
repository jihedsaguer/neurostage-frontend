export type DocumentType = 'CV' | 'TRANSCRIPT' | 'CERTIFICATE' | 'CIN' | 'OTHER';
export type CinStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';

export interface Profile {
  id: string;
  phone: string | null;
  university: string | null;
  level: string | null;
  graduationYear: number | null;
  skills: string[];
  completionPercentage: number;
  isComplete: boolean;
  cinStatus: CinStatus;
  isAiProcessed?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileDto {
  phone?: string;
  university?: string;
  level?: string;
  graduationYear?: number;
  skills?: string[];
}

export interface Document {
  id: string;
  type: DocumentType;
  fileName: string;
  fileUrl: string;
  fileType: string;
  size: number;
  scanOk: boolean;
  createdAt: string;
}

export interface UploadProfileDocumentParams {
  file: File;
  type: DocumentType;
}

export interface DocumentsResponse {
  data: Document[];
  total: number;
  limit: number;
  offset: number;
}

export interface DocumentsQueryParams {
  type?: DocumentType;
  limit?: number;
  offset?: number;
}

export interface SubjectSuggestion {
  subjectId: string;
  score: number;
  matchedKeywords: string[];
}

export interface SubjectSuggestionsResponse {
  suggestions: SubjectSuggestion[];
  message?: string;
}

