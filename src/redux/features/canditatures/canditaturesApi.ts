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
    updateCandidatureStatus: builder.mutation<CanditatureResponse, { id: string; status: CanditatureStatus }>({
      query: ({ id, status }) => ({
        url: `/candidatures/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: ['Canditature'],
    }),
  }),
});

export const {
  useApplyToSubjectMutation,
  useListMyCandidaturesQuery,
  useListSubjectCandidaturesQuery,
  useUpdateCandidatureStatusMutation,
  useLazyListSubjectCandidaturesQuery,
} = canditaturesApi;