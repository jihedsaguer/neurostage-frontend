import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query/react';

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL,
  credentials: 'include',
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as { auth?: { accessToken?: string | null } }).auth?.accessToken;
    headers.set('Content-Type', 'application/json');

    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }

    return headers;
  },
});

const baseQueryWithRefreshToken: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions
) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error?.status === 401) {
    const refreshResult = await baseQuery(
      {
        url: '/auth/refresh-token',
        method: 'POST',
        credentials: 'include',
      },
      api,
      extraOptions
    );

    if (
      refreshResult.data &&
      typeof refreshResult.data === 'object' &&
      'access_token' in refreshResult.data
    ) {
      const data = refreshResult.data as {
        access_token: string;
        refresh_token?: string;
      };
      const currentUser = (api.getState() as { auth?: { user: unknown } }).auth?.user ?? null;

      api.dispatch({
        type: 'auth/setCredentials',
        payload: {
          user: currentUser,
          accessToken: data.access_token,
          refreshToken: data.refresh_token ?? null,
        },
      });

      result = await baseQuery(args, api, extraOptions);
    } else {
      api.dispatch({ type: 'auth/logout' });
    }
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: 'baseApi',
  baseQuery: baseQueryWithRefreshToken,
  endpoints: () => ({}),
  tagTypes: [
    'Auth', 
    'User',
     'Role', 
     'Permission'
    ],
});
