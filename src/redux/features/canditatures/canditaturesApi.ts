import type { CanditatureCreator, CanditatureResponse, CanditatureStatus } from '../../../types/canditatures';
import { baseApi } from '../../api/baseApi';

export const canditaturesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    applyToSubject: builder.mutation<CanditatureResponse, CanditatureCreator>({
      query: (body) => ({
        url: '/candidatures',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Canditature'],
    }),
    listMyCandidatures: builder.query<CanditatureResponse[], void>({
      query: () => '/candidatures/my-candidatures',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Canditature' as const, id })),
              { type: 'Canditature', id: 'LIST' },
            ]
          : [{ type: 'Canditature', id: 'LIST' }],
    }),
    listSubjectCandidatures: builder.query<CanditatureResponse[], string>({
      query: (subjectId) => `/candidatures/subject/${subjectId}`,
      providesTags: (result, _error, subjectId) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Canditature' as const, id })),
              { type: 'Canditature', id: `SUBJECT-${subjectId}` },
            ]
          : [{ type: 'Canditature', id: `SUBJECT-${subjectId}` }],
    }),
    // Admin — all candidatures (for stage creation dropdown)
    listAllCandidatures: builder.query<CanditatureResponse[], void>({
      query: () => '/candidatures',
      providesTags: [{ type: 'Canditature', id: 'LIST' }],
    }),
    updateCandidatureStatus: builder.mutation<CanditatureResponse, { id: string; status: CanditatureStatus }>({
      query: ({ id, status }) => ({
        url: `/candidatures/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      // When a candidature is ACCEPTED the backend auto-creates a stage —
      // invalidate Stage cache so any open stages list refreshes automatically.
      invalidatesTags: ['Canditature', 'Stage'],
    }),
  }),
});

export const {
  useApplyToSubjectMutation,
  useListMyCandidaturesQuery,
  useListSubjectCandidaturesQuery,
  useListAllCandidaturesQuery,
  useUpdateCandidatureStatusMutation,
  useLazyListSubjectCandidaturesQuery,
} = canditaturesApi;