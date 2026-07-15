import { baseApi } from '../../api/baseApi';
import type {
  Profile,
  UpdateProfileDto,
  Document,
  UploadProfileDocumentParams,
  DocumentsResponse,
  DocumentsQueryParams,
  SubjectSuggestionsResponse,
} from '@/types/profile.types';

export const profileApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET /profiles/me — auto-creates profile if not exists
    getMyProfile: builder.query<Profile, void>({
      query: () => ({ url: '/profiles/me' }),
      providesTags: ['Profile'],
    }),

    // PATCH /profiles
    updateProfile: builder.mutation<Profile, UpdateProfileDto>({
      query: (data) => ({
        url: '/profiles',
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Profile'],
    }),

    // GET /profiles/documents
    getDocuments: builder.query<DocumentsResponse, DocumentsQueryParams>({
      query: (params = {}) => {
        const qs = new URLSearchParams();
        if (params.type)   qs.set('type',   params.type);
        if (params.limit)  qs.set('limit',  String(params.limit));
        if (params.offset) qs.set('offset', String(params.offset));
        const q = qs.toString();
        return { url: `/profiles/documents${q ? `?${q}` : ''}` };
      },
      providesTags: ['Profile'],
    }),

    // POST /profiles/documents — multipart/form-data (file + type)
    createDocument: builder.mutation<Document, UploadProfileDocumentParams>({
      query: ({ file, type }) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', type);
        return {
          url: '/profiles/documents',
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: ['Profile'],
    }),

    // DELETE /profiles/documents/:id
    deleteDocument: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/profiles/documents/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Profile'],
    }),

    getProfile: builder.query<Profile, void>({
      query: () => '/profiles/me',
      providesTags: ['Profile'],
    }),

    getSubjectSuggestions: builder.query<SubjectSuggestionsResponse, void>({
      query: () => '/profiles/me/subject-suggestions',
      providesTags: ['Profile'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetMyProfileQuery,
  useUpdateProfileMutation,
  useGetDocumentsQuery,
  useCreateDocumentMutation,
  useDeleteDocumentMutation,
  useGetProfileQuery,
  useGetSubjectSuggestionsQuery,
} = profileApi;

