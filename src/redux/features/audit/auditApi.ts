import { baseApi } from '../../api/baseApi';
import type { AuditLog } from '@/types/audit';

export interface AuditByResourceParams {
  resourceType: string;
  resourceId: string;
  limit?: number;
}

export interface AuditByUserParams {
  userId: string;
  limit?: number;
}

export interface AuditByActionParams {
  action: string;
  limit?: number;
}

export interface PaginatedAuditResult {
  data: AuditLog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AuditQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  action?: string;
  resourceType?: string;
  userId?: string;
  from?: string;
  to?: string;
}

export const auditApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAuditByResource: builder.mutation<AuditLog[], AuditByResourceParams>({
      query: ({ resourceType, resourceId, limit = 25 }) => ({
        url: `/audit/resource/${resourceType}/${resourceId}?limit=${limit}`,
        method: 'GET',
      }),
    }),

    getAuditByUser: builder.mutation<AuditLog[], AuditByUserParams>({
      query: ({ userId, limit = 25 }) => ({
        url: `/audit/user/${userId}?limit=${limit}`,
        method: 'GET',
      }),
    }),

    getAuditByAction: builder.mutation<AuditLog[], AuditByActionParams>({
      query: ({ action, limit = 25 }) => ({
        url: `/audit/action/${action}?limit=${limit}`,
        method: 'GET',
      }),
    }),

    getAuditLogs: builder.query<PaginatedAuditResult, AuditQueryParams>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append('page', params.page.toString());
        if (params.limit) queryParams.append('limit', params.limit.toString());
        if (params.search) queryParams.append('search', params.search);
        if (params.action) queryParams.append('action', params.action);
        if (params.resourceType) queryParams.append('resourceType', params.resourceType);
        if (params.userId) queryParams.append('userId', params.userId);
        if (params.from) queryParams.append('from', params.from);
        if (params.to) queryParams.append('to', params.to);
        
        const qStr = queryParams.toString();
        return `/audit${qStr ? `?${qStr}` : ''}`;
      },
      providesTags: ['Audit'],
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetAuditByResourceMutation,
  useGetAuditByUserMutation,
  useGetAuditByActionMutation,
  useGetAuditLogsQuery,
} = auditApi;

