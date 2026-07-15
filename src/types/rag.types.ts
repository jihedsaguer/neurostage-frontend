export interface RagSource {
  documentName: string;
  excerpt: string;
}

export interface RagQueryRequest {
  question: string;
}

export interface RagQueryResponse {
  answer: string;
  sources: RagSource[];
}

export interface RagIngestRequest {
  filePath: string;
  documentName: string;
  documentType: string;
}

export interface RagIngestResponse {
  success: boolean;
  chunksIndexed: number;
}

export interface RagUploadAndIngestRequest {
  file: File;
  documentName: string;
  documentType: string;
}
