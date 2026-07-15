import { baseApi } from '../../api/baseApi';
import type {
  JalonResponse,
  LivrableResponse,
  CreateJalonPayload,
  UpdateJalonPayload,
  SubmitLivrablePayload,
  ValidateJalonPayload,
  AcadCommentPayload,
} from '@/types/jalon.types';

const stageListTag = (stageId: string) => ({ type: 'Jalon' as const, id: `STAGE-${stageId}` });
const jalonTag = (id: string) => ({ type: 'Jalon' as const, id });

export const jalonsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    fetchJalonsByStageId: builder.query<JalonResponse[], string>({
      query: (stageId) => ({ url: `/jalons/stage/${stageId}` }),
      providesTags: (_r, _e, stageId) => [stageListTag(stageId)],
    }),

    fetchJalonById: builder.query<JalonResponse, string>({
      query: (id) => ({ url: `/jalons/${id}` }),
      providesTags: (_r, _e, id) => [jalonTag(id)],
    }),

    fetchLivrableByJalonId: builder.query<LivrableResponse, string>({
      query: (id) => ({ url: `/jalons/${id}/livrable` }),
      providesTags: (_r, _e, id) => [jalonTag(id)],
    }),

    createJalon: builder.mutation<JalonResponse, CreateJalonPayload>({
      query: (body) => ({ url: '/jalons', method: 'POST', body }),
      invalidatesTags: (_r, _e, body) => [stageListTag(body.stageId)],
    }),

    updateJalon: builder.mutation<JalonResponse, { id: string; payload: UpdateJalonPayload }>({
      query: ({ id, payload }) => ({ url: `/jalons/${id}`, method: 'PATCH', body: payload }),
      invalidatesTags: (result, _e, { id }) => {
        const tags = [jalonTag(id)];
        if (result?.stageId) tags.push(stageListTag(result.stageId));
        return tags;
      },
    }),

    deleteJalon: builder.mutation<void, { id: string; stageId: string }>({
      query: ({ id }) => ({ url: `/jalons/${id}`, method: 'DELETE' }),
      invalidatesTags: (_r, _e, { id, stageId }) => [jalonTag(id), stageListTag(stageId)],
    }),

    submitLivrable: builder.mutation<JalonResponse, { id: string; body: SubmitLivrablePayload }>({
      query: ({ id, body }) => ({ url: `/jalons/${id}/livrable`, method: 'POST', body }),
      invalidatesTags: (result, _e, { id }) => {
        const tags = [jalonTag(id)];
        if (result?.stageId) tags.push(stageListTag(result.stageId));
        return tags;
      },
    }),

    validateJalon: builder.mutation<JalonResponse, { id: string; body: ValidateJalonPayload }>({
      query: ({ id, body }) => ({ url: `/jalons/${id}/validate`, method: 'PATCH', body }),
      invalidatesTags: (result, _e, { id }) => {
        const tags = [jalonTag(id)];
        if (result?.stageId) tags.push(stageListTag(result.stageId));
        return tags;
      },
    }),

    patchAcadComment: builder.mutation<JalonResponse, { id: string; body: AcadCommentPayload }>({
      query: ({ id, body }) => ({ url: `/jalons/${id}/acad-comment`, method: 'PATCH', body }),
      invalidatesTags: (result, _e, { id }) => {
        const tags = [jalonTag(id)];
        if (result?.stageId) tags.push(stageListTag(result.stageId));
        return tags;
      },
    }),
  }),
  overrideExisting: false,
});

export const {
  useFetchJalonsByStageIdQuery,
  useFetchJalonByIdQuery,
  useFetchLivrableByJalonIdQuery,
  useCreateJalonMutation,
  useUpdateJalonMutation,
  useDeleteJalonMutation,
  useSubmitLivrableMutation,
  useValidateJalonMutation,
  usePatchAcadCommentMutation,
} = jalonsApi;
