import { baseApi } from '../../api/baseApi';
import type {
  Subject,
  CreateSubjectDto,
  UpdateSubjectDto,
  ValidateSubjectDto,
  SubjectsApiResponse,
  SubjectsQueryParams,
  
} from '@/types/subject.types';

export const subjectsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all subjects (filtered by role on backend) with pagination & filtering
    fetchSubjects: builder.query<SubjectsApiResponse, SubjectsQueryParams >({
      query: (params) => {
        const queryString = buildQueryString(params);
        return { url: `/subjects${queryString}` };
      },
      providesTags: ['Subject'],
    }),

    // Get single subject by ID
    fetchSubjectById: builder.query<Subject, string>({
      query: (id) => ({ url: `/subjects/${id}` }),
      providesTags: (_result, _error, id) => [{ type: 'Subject', id }],
    }),

    // Get current user's subjects with pagination
    fetchMySubjects: builder.query<SubjectsApiResponse, SubjectsQueryParams >({
      query: (params) => {
        const queryString = buildQueryString(params);
        return { url: `/subjects/my${queryString}` };
      },
      providesTags: ['Subject'],
    }),

    // Get pending subjects (admin only)
    fetchPendingSubjects: builder.query<SubjectsApiResponse, SubjectsQueryParams >({
      query: (params) => {
        const queryString = buildQueryString(params);
        return { url: `/subjects/pending${queryString}` };
      },
      providesTags: ['Subject'],
    }),

    // Create subject
    createSubject: builder.mutation<Subject, CreateSubjectDto>({
      query: (data) => ({
        url: '/subjects',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Subject'],
    }),

    // Update subject
    updateSubject: builder.mutation<Subject, { id: string; data: UpdateSubjectDto }>({
      query: ({ id, data }) => ({
        url: `/subjects/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Subject'],
    }),

    // Delete subject
    deleteSubject: builder.mutation<void, string>({
      query: (id) => ({
        url: `/subjects/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Subject'],
    }),

    // Validate/Reject subject (admin only)
    validateSubject: builder.mutation<Subject, { id: string; data: ValidateSubjectDto }>({
      query: ({ id, data }) => ({
        url: `/subjects/${id}/validate`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Subject'],
    }),
  }),
  overrideExisting: false,
});

/**
 * Build query string from parameters
 */
function buildQueryString(params?: SubjectsQueryParams): string {
  if (!params) return '';

  const queryParams: Record<string, string> = {};

  if (params.search) queryParams.search = params.search;
  if (params.technologies && params.technologies.length > 0) {
    queryParams.technologies = params.technologies.join(',');
  }
  if (params.level) queryParams.level = params.level;
  if (params.status) queryParams.status = params.status;
  if (params.limit) queryParams.limit = params.limit.toString();
  if (params.offset !== undefined) queryParams.offset = params.offset.toString();
  if (params.sortBy) queryParams.sortBy = params.sortBy;
  if (params.sortOrder) queryParams.sortOrder = params.sortOrder;

  const entries = Object.entries(queryParams);
  if (entries.length === 0) return '';

  return '?' + entries.map(([key, value]) => `${key}=${encodeURIComponent(value)}`).join('&');
}

export const {
  useFetchSubjectsQuery,
  useFetchSubjectByIdQuery,
  useFetchMySubjectsQuery,
  useFetchPendingSubjectsQuery,
  useCreateSubjectMutation,
  useUpdateSubjectMutation,
  useDeleteSubjectMutation,
  useValidateSubjectMutation,
  
} = subjectsApi;