import { baseApi } from '../../api/baseApi';
import type {
  Stage,
  CreateStagePayload,
  UpdateStagePayload,
  AssignProPayload,
  AssignAcadPayload,
} from '@/types/stage.types';

export const stagesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ADMIN — GET /stages
    fetchAllStages: builder.query<Stage[], void>({
      query: () => ({ url: '/stages' }),
      providesTags: ['Stage'],
    }),

    // ALL (scoped) — GET /stages/:id
    fetchStageById: builder.query<Stage, string>({
      query: (id) => ({ url: `/stages/${id}` }),
      providesTags: (_r, _e, id) => [{ type: 'Stage', id }],
    }),

    // ADMIN — POST /stages
    createStage: builder.mutation<Stage, CreateStagePayload>({
      query: (body) => ({ url: '/stages', method: 'POST', body }),
      invalidatesTags: ['Stage'],
    }),

    // ADMIN — PATCH /stages/:id
    updateStage: builder.mutation<Stage, { id: string; payload: UpdateStagePayload }>({
      query: ({ id, payload }) => ({ url: `/stages/${id}`, method: 'PATCH', body: payload }),
      invalidatesTags: (_r, _e, { id }) => ['Stage', { type: 'Stage', id }],
    }),

    // ADMIN — PATCH /stages/:id/assign-pro
    assignPro: builder.mutation<Stage, { id: string; payload: AssignProPayload }>({
      query: ({ id, payload }) => ({ url: `/stages/${id}/assign-pro`, method: 'PATCH', body: payload }),
      invalidatesTags: (_r, _e, { id }) => ['Stage', { type: 'Stage', id }],
    }),

    // ADMIN — PATCH /stages/:id/assign-acad
    assignAcad: builder.mutation<Stage, { id: string; payload: AssignAcadPayload }>({
      query: ({ id, payload }) => ({ url: `/stages/${id}/assign-acad`, method: 'PATCH', body: payload }),
      invalidatesTags: (_r, _e, { id }) => ['Stage', { type: 'Stage', id }],
    }),

    // ADMIN — PATCH /stages/:id/cancel
    cancelStage: builder.mutation<Stage, string>({
      query: (id) => ({ url: `/stages/${id}/cancel`, method: 'PATCH' }),
      invalidatesTags: (_r, _e, id) => ['Stage', { type: 'Stage', id }],
    }),

    // STUDENT — GET /stages/my/stage  (returns single Stage)
    fetchMyStage: builder.query<Stage, void>({
      query: () => ({ url: '/stages/my/stage' }),
      providesTags: ['Stage'],
    }),

    // ENCADRANT_PRO — GET /stages/my/as-pro
    fetchMyStagesAsPro: builder.query<Stage[], void>({
      query: () => ({ url: '/stages/my/as-pro' }),
      providesTags: ['Stage'],
    }),

    // ENCADRANT_ACAD — GET /stages/my/as-acad
    fetchMyStagesAsAcad: builder.query<Stage[], void>({
      query: () => ({ url: '/stages/my/as-acad' }),
      providesTags: ['Stage'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useFetchAllStagesQuery,
  useFetchStageByIdQuery,
  useCreateStageMutation,
  useUpdateStageMutation,
  useAssignProMutation,
  useAssignAcadMutation,
  useCancelStageMutation,
  useFetchMyStageQuery,
  useFetchMyStagesAsProQuery,
  useFetchMyStagesAsAcadQuery,
} = stagesApi;
