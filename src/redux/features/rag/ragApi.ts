import { baseApi } from '../../api/baseApi';
import type {
  RagQueryRequest,
  RagQueryResponse,
  RagIngestRequest,
  RagIngestResponse,
  RagUploadAndIngestRequest,
} from '@/types/rag.types';

export const ragApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    ragQuery: builder.mutation<RagQueryResponse, RagQueryRequest>({
      query: (body) => ({
        url: '/rag/query',
        method: 'POST',
        body,
      }),
    }),

    ragIngest: builder.mutation<RagIngestResponse, RagIngestRequest>({
      query: (body) => ({
        url: '/rag/documents',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Rag'],
    }),

    /**
     * Admin RAG upload — multipart to POST /rag/documents/upload.
     * Do NOT use /profiles/documents (student-only, returns 403 for admin roles).
     */
    uploadAndIngestDocument: builder.mutation<RagIngestResponse, RagUploadAndIngestRequest>({
      query: ({ file, documentName, documentType }) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('documentName', documentName);
        formData.append('documentType', documentType);
        return {
          url: '/rag/documents/upload',
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: ['Rag'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useRagQueryMutation,
  useRagIngestMutation,
  useUploadAndIngestDocumentMutation,
} = ragApi;
